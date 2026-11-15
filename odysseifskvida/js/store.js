/* Staðbundin vistun í IndexedDB. Hver skrif bíða eftir að færslan klárist (oncomplete) áður en
   þau teljast vistuð – „Vistað í þessu tæki“ birtist aðeins eftir staðfestingu.
   Ef IndexedDB er ekki tiltækt (t.d. lokað í stillingum) er reynt localStorage; annars er villa tilkynnt. */
(function (root) {
  'use strict';
  const DB_NAME = 'odysseifskvida-lestrarstofa';
  const STORE = 'kv';
  const LS_PREFIX = 'odysseifskvida-lestrarstofa:';

  function openIdb() {
    return new Promise((resolve, reject) => {
      let req;
      try {
        if (!root.indexedDB) throw new Error('IndexedDB er ekki tiltækt í þessum vafra.');
        req = root.indexedDB.open(DB_NAME, 1);
      } catch (e) { reject(e); return; }
      req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Ekki tókst að opna gagnagrunn.'));
      req.onblocked = () => reject(new Error('Gagnagrunnur er læstur af öðrum flipa.'));
    });
  }

  function idbBackend(db) {
    const tx = (mode, fn) => new Promise((resolve, reject) => {
      let t;
      try { t = db.transaction(STORE, mode); } catch (e) { reject(e); return; }
      const st = t.objectStore(STORE);
      let result;
      try { result = fn(st); } catch (e) { reject(e); return; }
      t.oncomplete = () => resolve(result && 'result' in result ? result.result : undefined);
      t.onerror = () => reject(t.error || new Error('Vistun mistókst.'));
      t.onabort = () => reject(t.error || new Error('Vistun var hætt (geymslupláss gæti verið fullt).'));
    });
    return {
      kind: 'indexeddb',
      get: key => tx('readonly', st => st.get(key)),
      set: (key, value) => tx('readwrite', st => { st.put(value, key); }),
      setMany: entries => tx('readwrite', st => { for (const [k, v] of entries) st.put(v, k); }),
      del: key => tx('readwrite', st => { st.delete(key); }),
    };
  }

  function lsBackend() {
    const ls = root.localStorage;
    const probe = LS_PREFIX + '__probe';
    ls.setItem(probe, '1'); ls.removeItem(probe);
    return {
      kind: 'localstorage',
      get: async key => { const v = ls.getItem(LS_PREFIX + key); return v == null ? undefined : JSON.parse(v); },
      set: async (key, value) => { ls.setItem(LS_PREFIX + key, JSON.stringify(value)); },
      setMany: async entries => { for (const [k, v] of entries) ls.setItem(LS_PREFIX + k, JSON.stringify(v)); },
      del: async key => { ls.removeItem(LS_PREFIX + key); },
    };
  }

  async function openStore() {
    let idbError = null;
    try {
      const db = await openIdb();
      const b = idbBackend(db);
      await b.get('__probe');
      return { backend: b, warning: null };
    } catch (e) { idbError = e; }
    try {
      return { backend: lsBackend(), warning: 'IndexedDB virkar ekki í þessum vafra; vinnan er vistuð með varaleið (localStorage).' };
    } catch (e) {
      const err = new Error('Ekki er hægt að vista í þessu tæki (' + (idbError && idbError.message || e.message) + ').');
      err.cause = e;
      throw err;
    }
  }

  root.OdyStore = { openStore };
})(typeof self !== 'undefined' ? self : this);

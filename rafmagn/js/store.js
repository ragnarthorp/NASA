/*
 * store.js — vistun framvindu og stillinga í localStorage.
 * Ef localStorage er ekki tiltækt (t.d. lokaður einkagluggi) virkar vefurinn áfram án vistunar.
 */
(function (root) {
  'use strict';
  const KEY = 'rafmagn-undirbuningur-v1';

  function emptyCircuit() { return { U: '', R: [{ v: '', u: 'Ω' }, { v: '', u: 'Ω' }], ex: -1 }; }
  function defaults() {
    return {
      version: 1,
      progress: {},   // { [æfingarId]: { attempts, correctChecks, solved, firstTry, hint, solution } }
      drafts: {},     // { [æfingarId]: { fields: { key: { v, u } }, choice } }
      exams: [],      // saga prófa: [{ date, points, total, full, byTopic }]
      exam: null,     // yfirstandandi eða nýskilað próf
      settings: { calcTab: 'ohm', practiceTopic: 'all', onlyUnsolved: false, timer: false, timerMinutes: 30 },
      calc: {
        ohm: { find: 'I', U: { v: '', u: 'V' }, I: { v: '', u: 'A' }, R: { v: '', u: 'Ω' }, ex: -1 },
        series: emptyCircuit(),
        parallel: emptyCircuit(),
      },
    };
  }

  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  /** Sameinar vistuð gögn við sjálfgefin gildi og hunsar gildi af röngri gerð. */
  function merge(base, extra) {
    if (!isObj(extra)) return base;
    Object.keys(base).forEach(function (k) {
      if (!(k in extra)) return;
      const b = base[k], e = extra[k];
      if (isObj(b) && Object.keys(b).length) { if (isObj(e)) base[k] = merge(b, e); }
      else if (isObj(b) || b === null) { if (isObj(e) || e === null) base[k] = e; }
      else if (Array.isArray(b)) { if (Array.isArray(e)) base[k] = e; }
      else if (typeof b === typeof e) base[k] = e;
    });
    return base;
  }

  let available = true;
  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      const s = defaults();
      if (!raw) return s;
      const parsed = JSON.parse(raw);
      const m = merge(s, parsed);
      ['series', 'parallel'].forEach(function (k) {
        const c = m.calc[k];
        if (!Array.isArray(c.R) || c.R.length < 2 || c.R.length > 6) m.calc[k] = emptyCircuit();
      });
      return m;
    } catch (e) {
      available = false;
      return defaults();
    }
  }

  const Store = { state: load() };
  let timer = null;
  Store.save = function () {
    clearTimeout(timer);
    timer = setTimeout(Store.flush, 120);
  };
  Store.flush = function () {
    clearTimeout(timer);
    try { root.localStorage.setItem(KEY, JSON.stringify(Store.state)); available = true; }
    catch (e) { available = false; }
  };
  Store.available = function () { return available; };
  Store.resetProgress = function () {
    Store.state.progress = {};
    Store.state.drafts = {};
    Store.state.exams = [];
    Store.state.exam = null;
    Store.flush();
  };

  Store.prog = function (id) {
    if (!Store.state.progress[id]) Store.state.progress[id] = { attempts: 0, correctChecks: 0, solved: false, firstTry: false, hint: false, solution: false };
    return Store.state.progress[id];
  };
  /** Skráir athugun á svari. allCorrect segir hvort öll svör æfingarinnar voru rétt. */
  Store.recordCheck = function (id, allCorrect) {
    const p = Store.prog(id);
    p.attempts += 1;
    if (allCorrect) {
      p.correctChecks += 1;
      if (!p.solved && p.attempts === 1 && !p.solution) p.firstTry = true;
      p.solved = true;
    }
    Store.save();
    return p;
  };
  Store.mark = function (id, what) { Store.prog(id)[what] = true; Store.save(); };

  /** Tölfræði eftir efnisflokki fyrir æfingar (ekki prófspurningar). */
  Store.topicStats = function (topics, list) {
    return topics.map(function (t) {
      const items = list.filter(function (e) { return e.topic === t.id; });
      let solved = 0, firstTry = 0, attempted = 0;
      items.forEach(function (e) {
        const p = Store.state.progress[e.id];
        if (!p) return;
        if (p.attempts > 0) attempted++;
        if (p.solved) solved++;
        if (p.firstTry) firstTry++;
      });
      return { topic: t, total: items.length, solved: solved, firstTry: firstTry, attempted: attempted };
    });
  };

  root.Store = Store;
  root.addEventListener && root.addEventListener('pagehide', Store.flush);
})(typeof self !== 'undefined' ? self : this);

/* Framvinda – vistuð á tækinu (localStorage). Útflutningur og innflutningur sem JSON. */
(function (G) {
  const RF = (G.RF = G.RF || {});
  const KEY = 'rafmagn1-framvinda-v1';
  const blank = () => ({
    v: 1,
    learned: {},
    types: {},
    concepts: {},
    exams: [],
    wrong: [],
    checklist: {},
    notes: { title: 'Mínar prófglósur', pages: 2, cards: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12], forget: [], types: [], comments: {}, own: [], showTable: true, showTraps: true },
    lastPlan: null,
    updated: null,
  });
  let S = blank();
  const mem = {};
  const ls = () => { try { return G.localStorage || null; } catch (e) { return null; } };

  function load() {
    try {
      const raw = ls() ? ls().getItem(KEY) : mem[KEY];
      if (raw) S = merge(blank(), JSON.parse(raw));
    } catch (e) { S = blank(); }
    return S;
  }
  function merge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) a[k] = merge(a[k], b[k]);
      else a[k] = b[k];
    }
    return a;
  }
  let saveTimer = null;
  function save() {
    S.updated = new Date().toISOString();
    const txt = JSON.stringify(S);
    try { if (ls()) ls().setItem(KEY, txt); else mem[KEY] = txt; } catch (e) { mem[KEY] = txt; }
    if (RF.onSave) { clearTimeout(saveTimer); saveTimer = setTimeout(() => RF.onSave(), 30); }
  }

  /* ---- skráning ---- */
  function recordProblem(prob, result, assisted) {
    const t = (S.types[prob.tid] = S.types[prob.tid] || { tries: 0, correct: 0, solo: 0, assisted: 0, points: 0, history: [] });
    t.tries++;
    t.points += result.score;
    const ok = result.score >= 0.999;
    if (ok) { t.correct++; if (assisted) t.assisted++; else t.solo++; }
    t.history.push(ok ? (assisted ? 'h' : 's') : result.score > 0 ? 'p' : 'x');
    if (t.history.length > 12) t.history.shift();
    t.last = Date.now();
    save();
  }
  function recordConcept(id, ok) {
    const c = (S.concepts[id] = S.concepts[id] || { tries: 0, correct: 0, history: [] });
    c.tries++;
    if (ok) c.correct++;
    c.history.push(ok ? 's' : 'x');
    if (c.history.length > 8) c.history.shift();
    c.last = Date.now();
    save();
  }

  /* ---- mat á færni ---- */
  /* færni dæmagerðar 0..1: síðustu tilraunir vega mest, hjálp dregur úr */
  function typeMastery(tid) {
    const t = S.types[tid];
    if (!t || !t.tries) return null;
    const h = t.history.slice(-5);
    const w = { s: 1, h: 0.6, p: 0.3, x: 0 };
    return h.reduce((a, c) => a + w[c], 0) / Math.max(h.length, 3);
  }
  function catStats(cat) {
    let tries = 0, pts = 0;
    RF.concepts.filter((c) => c.cat === cat).forEach((c) => { const s = S.concepts[c.id]; if (s) { tries += s.tries; pts += s.correct; } });
    const tids = cat === 'vidnam' ? ['V1', 'V2', 'V3', 'V4'] : cat === 'hiti' ? ['V5', 'V6'] : cat === 'spennufall' ? ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'] : [];
    tids.forEach((id) => { const s = S.types[id]; if (s) { tries += s.tries; pts += s.points; } });
    return { tries, acc: tries ? pts / tries : null };
  }
  function weakest() {
    return Object.keys(RF.cats).map((k) => ({ k, ...catStats(k) })).filter((x) => x.tries >= 3).sort((a, b) => a.acc - b.acc);
  }
  function totals() {
    let solved = 0, tries = 0, conceptOk = 0, conceptTries = 0;
    Object.values(S.types).forEach((t) => { solved += t.correct; tries += t.tries; });
    Object.values(S.concepts).forEach((c) => { conceptOk += c.correct; conceptTries += c.tries; });
    const sections = RF.lessons ? RF.lessons.reduce((a, ch) => a + ch.sections.length, 0) : 0;
    return { learned: Object.keys(S.learned).filter((k) => S.learned[k]).length, sections, solved, tries, conceptOk, conceptTries, correct: solved + conceptOk, answered: tries + conceptTries };
  }
  /* Tillögur um næstu skref */
  function suggestions(n = 4) {
    const out = [];
    const types = RF.problemTypes;
    const weak = types.map((t) => ({ t, m: typeMastery(t.id) })).filter((x) => x.m !== null && x.m < 0.6).sort((a, b) => a.m - b.m);
    weak.forEach((x) => out.push({ kind: 'type', id: x.t.id, text: 'Æfðu aftur: ' + x.t.id + ' – ' + x.t.title, why: 'Færni ' + Math.round(x.m * 100) + ' %' }));
    if (RF.lessons) for (const ch of RF.lessons) { const left = ch.sections.filter((s) => !S.learned[s.id]); if (left.length) { out.push({ kind: 'lesson', id: ch.id, text: 'Lestu: Kafli ' + ch.n + ' – ' + ch.title, why: left.length + ' hlutar eftir' }); break; } }
    types.filter((t) => !S.types[t.id]).slice(0, 3).forEach((t) => out.push({ kind: 'type', id: t.id, text: 'Prófaðu: ' + t.id + ' – ' + t.title, why: 'Ekki reynt enn' }));
    const wc = weakest()[0];
    if (wc && wc.acc < 0.7) out.push({ kind: 'cat', id: wc.k, text: 'Hugtakaæfing: ' + RF.cats[wc.k].name, why: Math.round(wc.acc * 100) + ' % rétt' });
    if (S.wrong.length) out.push({ kind: 'wrong', text: 'Æfa aftur það sem var rangt í síðasta prófi', why: S.wrong.length + ' atriði' });
    if (!out.length) out.push({ kind: 'exam', text: 'Taktu æfingapróf', why: 'Þú hefur æft vel – prófaðu þig' });
    return out.slice(0, n);
  }

  /* ---- gátlisti: sjálfsmat + raunveruleg frammistaða ---- */
  RF.checkTopics = [
    { id: 'flokkun', title: 'Flokkar rafleiðara, leiðni málma, vökva og gasa', cat: 'flokkun', types: [] },
    { id: 'efni', title: 'Silfur, kopar, gull, ál – munur og notkun; einangrarar og hálfleiðarar', cat: 'flokkun', types: [] },
    { id: 'eiginleikar', title: 'Lengd, þverflatarmál, ρ, eðlisleiðni, NTC/PTC', cat: 'eiginleikar', types: [] },
    { id: 'R', title: 'Viðnám leiðara: R = ρ·l/A', cat: 'vidnam', types: ['V1'] },
    { id: 'umritun', title: 'Umritun: lengd, þverflatarmál, eðlisviðnám', cat: 'vidnam', types: ['V2', 'V3', 'V4'] },
    { id: 'hiti', title: 'Viðnám og hitastig (hitun, kólnun, lokahitastig)', cat: 'hiti', types: ['V5', 'V6'] },
    { id: 'tvi', title: 'Tvíleiðari: viðnám og spennufall', cat: 'spennufall', types: ['S1', 'S2', 'S6'] },
    { id: 'pct', title: 'Spennufall í % og spenna á álagi/gjafa', cat: 'spennufall', types: ['S3', 'S7'] },
    { id: 'hönnun', title: 'Hámarkslengd og nauðsynlegt þverflatarmál', cat: 'spennufall', types: ['S4', 'S5'] },
  ];
  RF.checkLevels = [
    { k: 'skil', label: 'Ég skil efnið' },
    { k: 'formula', label: 'Ég kann formúluna' },
    { k: 'hjalp', label: 'Ég get leyst dæmi með hjálp' },
    { k: 'an', label: 'Ég get leyst dæmi án hjálpar' },
    { k: 'tilbuin', label: 'Ég er tilbúin/n í próf úr þessu efni' },
  ];
  /* Hvað sýnir frammistaðan? */
  function topicEvidence(topic) {
    if (!topic.types.length) {
      const s = catStats(topic.cat);
      const qs = RF.concepts.filter((c) => c.cat === topic.cat);
      const seen = qs.filter((c) => S.concepts[c.id]).length;
      return { kind: 'concept', tries: s.tries, acc: s.acc, seen, total: qs.length, solo: s.tries >= 5 && s.acc >= 0.8, assisted: s.tries >= 3 && s.acc >= 0.6 };
    }
    let solo = 0, assisted = 0, tries = 0, typesSolo = 0;
    topic.types.forEach((id) => { const t = S.types[id]; if (t) { solo += t.solo; assisted += t.assisted; tries += t.tries; if (t.solo > 0) typesSolo++; } });
    return { kind: 'problems', tries, solo, assisted, typesSolo, totalTypes: topic.types.length, soloOk: typesSolo === topic.types.length, assistedOk: solo + assisted > 0 };
  }
  /* Stig gátlista: sjálfsmat er aðeins tekið gilt upp að því marki sem frammistaða styður */
  function topicStatus(topic) {
    const self = S.checklist[topic.id] || {};
    const ev = topicEvidence(topic);
    const proven = ev.kind === 'concept' ? { hjalp: ev.assisted, an: ev.solo } : { hjalp: ev.assistedOk, an: ev.soloOk };
    const levels = RF.checkLevels.map((l) => {
      const claimed = !!self[l.k];
      let verified = null;
      if (l.k === 'hjalp') verified = proven.hjalp;
      if (l.k === 'an') verified = proven.an;
      if (l.k === 'tilbuin') verified = proven.an && claimed;
      return { ...l, claimed, verified };
    });
    const ready = levels.every((l) => l.claimed) && proven.an;
    const score = levels.filter((l) => l.claimed && l.verified !== false).length / levels.length;
    return { levels, ev, ready, score };
  }

  RF.store = {
    load, save, get: () => S,
    reset() { S = blank(); save(); },
    recordProblem, recordConcept, typeMastery, catStats, weakest, totals, suggestions, topicStatus, topicEvidence,
    exportJSON: () => JSON.stringify({ app: 'rafmagnsfraedi-1', ...S }, null, 1),
    importJSON(txt) {
      const d = JSON.parse(txt);
      if (!d || typeof d !== 'object' || (d.app && d.app !== 'rafmagnsfraedi-1') || d.v !== 1) throw new Error('Þetta er ekki framvinduskrá úr þessum vef.');
      delete d.app;
      S = merge(blank(), d);
      save();
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

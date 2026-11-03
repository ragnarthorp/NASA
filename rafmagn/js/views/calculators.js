/* Reiknivélar — lögmál Ohms, raðtenging og hliðtenging. Reikna jafnóðum og birta lausn skref fyrir skref. */
(function (root) {
  'use strict';
  const Views = root.Views = root.Views || {};
  const UI = root.UI, S = UI.S, Calc = root.Calc, Explain = root.Explain, Store = root.Store, Diagrams = root.Diagrams;
  const esc = UI.esc;

  const TABS = [
    { id: 'ohm', key: 'ohm', label: 'Lögmál Ohms' },
    { id: 'rad', key: 'series', label: 'Raðtenging' },
    { id: 'hlid', key: 'parallel', label: 'Hliðtenging' },
    { id: 'blond', key: 'mixed', label: '[Prófefni] Blönduð tenging' },
  ];
  // Algengar uppsetningar blandaðra tenginga; dæmigildin eru úr sýnidæmum námsefnisins.
  const L = function (n) { return { name: n, R: null }; };
  const SHAPES = {
    A: { text: 'R₁ + (R₂ ‖ R₃)', tree: function () { return { s: [L(1), { p: [L(2), L(3)] }] }; }, ex: { U: '12', R: ['10', '30', '60'] } },
    B: { text: 'R₁ + (R₂ ‖ R₃) + R₄', tree: function () { return { s: [L(1), { p: [L(2), L(3)] }, L(4)] }; }, ex: { U: '9', R: ['20', '45', '90', '40'] }, src: 'sýnidæmi 1' },
    C: { text: 'R₁ ‖ (R₂ + R₃)', tree: function () { return { p: [L(1), { s: [L(2), L(3)] }] }; }, ex: { U: '12', R: ['60', '20', '40'] } },
    D: { text: 'R₁ ‖ (R₂ + R₃) ‖ R₄', tree: function () { return { p: [L(1), { s: [L(2), L(3)] }, L(4)] }; }, ex: { U: '8,7', R: ['40', '20', '60', '50'] }, src: 'sýnidæmi 2' },
    E: { text: '(R₁ + R₂) ‖ (R₃ + R₄)', tree: function () { return { p: [{ s: [L(1), L(2)] }, { s: [L(3), L(4)] }] }; }, ex: { U: '12', R: ['100', '200', '150', '150'] } },
    F: { text: 'R₁ ‖ (R₂ + (R₃ ‖ (R₄ + R₅)))', tree: function () { return { p: [L(1), { s: [L(2), { p: [L(3), { s: [L(4), L(5)] }] }] }] }; }, ex: { U: '7,5', R: ['12', '12', '12', '12', '12'] }, src: 'sýnidæmi 3' },
  };
  const QLABEL = { U: 'Spenna', I: 'Straumur', R: 'Viðnám' };
  const FIND_LABEL = { U: 'Spennu', I: 'Straum', R: 'Viðnám' };
  const MAX_R = 6, MIN_R = 2;

  const OHM_EXAMPLES = {
    I: { U: { v: '9', u: 'V' }, R: { v: '1', u: 'kΩ' } },
    U: { I: { v: '20', u: 'mA' }, R: { v: '470', u: 'Ω' } },
    R: { U: { v: '9', u: 'V' }, I: { v: '30', u: 'mA' } },
  };
  const CIRCUIT_EXAMPLES = {
    series: [
      { U: '12', R: [['100', 'Ω'], ['200', 'Ω']] },
      { U: '9', R: [['1', 'kΩ'], ['2', 'kΩ']] },
      { U: '24', R: [['100', 'Ω'], ['200', 'Ω'], ['300', 'Ω']] },
    ],
    parallel: [
      { U: '12', R: [['100', 'Ω'], ['200', 'Ω']] },
      { U: '12', R: [['300', 'Ω'], ['300', 'Ω'], ['300', 'Ω']] },
      { U: '9', R: [['1', 'kΩ'], ['3', 'kΩ']] },
    ],
  };

  let container = null;

  function tabFromSub(sub) {
    const t = TABS.find(function (x) { return x.id === sub; });
    if (t) { Store.state.settings.calcTab = t.key; Store.save(); return t; }
    return TABS.find(function (x) { return x.key === Store.state.settings.calcTab; }) || TABS[0];
  }

  /* ---------- Reitir og staðfesting ---------- */
  function field(id, labelHtml, value, units, unit, help) {
    return '<div class="field"><label for="' + id + '">' + labelHtml + '</label>' +
      '<div class="inputrow"><input type="text" id="' + id + '" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + esc(value) + '" aria-describedby="' + id + '-msg' + (help ? ' ' + id + '-help' : '') + '">' +
      UI.unitControl(id + '-unit', units, unit, 'Eining') + '</div>' +
      (help ? '<p class="help" id="' + id + '-help">' + help + '</p>' : '') +
      '<p class="msg" id="' + id + '-msg"></p></div>';
  }
  /** Staðfestir einn reit og birtir villu eða aðvörun við hann. Skilar { ok, value, empty }. */
  function check(id, raw, unit) {
    const input = document.getElementById(id);
    const msg = document.getElementById(id + '-msg');
    const empty = !String(raw).trim();
    let r;
    if (empty) r = { ok: false, empty: true };
    else r = Calc.parseQuantity(raw, unit);
    if (input) input.setAttribute('aria-invalid', !empty && !r.ok ? 'true' : 'false');
    if (msg) {
      msg.className = 'msg' + (!empty && !r.ok ? ' msg-error' : (r.warning ? ' msg-warn' : ''));
      msg.textContent = !empty && !r.ok ? r.message : (r.warning || '');
    }
    return { ok: !!r.ok, value: r.value, empty: empty, unit: unit };
  }
  function waiting(missing, invalid) {
    let t = '<div class="notice notice-warn" role="status">';
    if (invalid.length) t += '<p><strong>Lagaðu reitina sem eru merktir:</strong> ' + invalid.join(', ') + '.</p>';
    if (missing.length) t += '<p>' + (invalid.length ? 'Einnig vantar' : 'Sláðu inn') + ': ' + missing.join(', ') + '.</p>';
    t += '<p style="margin:0">Niðurstaða birtist um leið og öll gildi eru gild.</p></div>';
    return t;
  }
  function kv(k, v) { return '<div class="kv"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>'; }
  function eqv(x, q) { return Calc.eqSign(x) + ' ' + Calc.formatBoth(x, q); }

  /* ---------- Lögmál Ohms ---------- */
  function ohmPanel() {
    const st = Store.state.calc.ohm;
    const given = ['U', 'I', 'R'].filter(function (k) { return k !== st.find; });
    let h = '<div class="calc-layout"><div class="card"><h2>Lögmál Ohms</h2>' +
      '<fieldset><legend>Hvað viltu finna?</legend><div class="choices" role="radiogroup">' +
      ['U', 'I', 'R'].map(function (k) {
        return '<label class="choice"><input type="radio" name="ohm-find" value="' + k + '"' + (st.find === k ? ' checked' : '') + '> ' + FIND_LABEL[k] + ' ' + S(k) + '</label>';
      }).join('') + '</div></fieldset>';
    given.forEach(function (k) {
      h += field('c-ohm-' + k, QLABEL[k] + ' ' + S(k), st[k].v, Calc.INPUT_UNITS[k], st[k].u);
    });
    h += '<p class="help">Gildin þurfa að vera stærri en núll. Nota má kommu eða punkt sem tugabrotsmerki, t.d. 4,7 eða 4.7.</p>' +
      '<div class="actions"><button type="button" data-example>Hlaða dæmi</button><button type="button" data-clear>Hreinsa</button></div>' +
      '<p class="help" data-example-note aria-live="polite"></p></div>' +
      '<div class="card"><h2>Lausn</h2><div data-out></div></div></div>';
    return h;
  }
  function ohmUpdate() {
    const st = Store.state.calc.ohm;
    const given = ['U', 'I', 'R'].filter(function (k) { return k !== st.find; });
    const known = {}, units = {}, missing = [], invalid = [];
    given.forEach(function (k) {
      const id = 'c-ohm-' + k;
      const el = document.getElementById(id);
      const sel = document.getElementById(id + '-unit');
      st[k].v = el.value;
      st[k].u = sel.tagName === 'SELECT' ? sel.value : Calc.INPUT_UNITS[k][0];
      const r = check(id, st[k].v, st[k].u);
      if (r.empty) missing.push(QLABEL[k].toLowerCase() + ' ' + S(k));
      else if (!r.ok) invalid.push(QLABEL[k].toLowerCase() + ' ' + S(k));
      else { known[k] = r.value; units[k] = st[k].u; }
    });
    Store.save();
    const out = container.querySelector('[data-out]');
    if (missing.length || invalid.length) { out.innerHTML = waiting(missing, invalid); return; }
    const ex = Explain.ohm(st.find, known, units);
    out.innerHTML = '<div class="formula"><span>' + ex.formula + '</span></div>' +
      '<div class="result-summary">' + kv(QLABEL[st.find] + ' ' + S(st.find), eqv(ex.value, st.find)) + '</div>' +
      '<p>' + ex.explanation + '</p>' + UI.steps(ex.steps);
  }

  /* ---------- Raðtenging og hliðtenging ---------- */
  function circuitPanel(kind) {
    const st = Store.state.calc[kind];
    const isS = kind === 'series';
    const n = st.R.length;
    let h = '<div class="calc-layout"><div class="card"><h2>' + (isS ? 'Raðtenging' : 'Hliðtenging') + '</h2>' +
      '<p class="help" style="margin-top:-4px">' + (isS ? 'Sami straumur fer um öll viðnámin; spennan skiptist á milli þeirra.' : 'Sama spenna er yfir hverri grein; straumurinn skiptist á milli greinanna.') + '</p>' +
      field('c-' + kind + '-U', 'Spenna spennugjafans ' + S('U', 'H'), st.U, ['V'], 'V') +
      '<fieldset><legend>Viðnám (' + MIN_R + '–' + MAX_R + ')</legend>';
    st.R.forEach(function (r, i) {
      const id = 'c-' + kind + '-R' + i;
      h += '<div class="r-row"><label for="' + id + '">' + S('R', i + 1) + '</label>' +
        '<input type="text" id="' + id + '" data-r="' + i + '" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + esc(r.v) + '" aria-describedby="' + id + '-msg">' +
        UI.unitControl(id + '-unit', Calc.INPUT_UNITS.R, r.u, 'Eining fyrir R' + (i + 1)) +
        (n > MIN_R ? '<button type="button" class="btn-small remove" data-remove="' + i + '" aria-label="Fjarlægja R' + (i + 1) + '">Fjarlægja</button>' : '<span></span>') +
        '<p class="msg" id="' + id + '-msg"></p></div>';
    });
    h += '</fieldset><div class="actions">' +
      (n < MAX_R ? '<button type="button" data-add>+ Bæta við viðnámi</button>' : '') +
      '<span class="r-count">' + n + ' af ' + MAX_R + ' viðnámum' + (n >= MAX_R ? ' (hámark)' : '') + (n <= MIN_R ? ' (lágmark er ' + MIN_R + ')' : '') + '</span></div>' +
      '<p class="help">Viðnám og spenna þurfa að vera stærri en núll. Nota má kommu eða punkt sem tugabrotsmerki.</p>' +
      '<div class="actions"><button type="button" data-example>Hlaða dæmi</button><button type="button" data-clear>Hreinsa</button></div>' +
      '<p class="help" data-example-note aria-live="polite"></p></div>' +
      '<div class="stack"><div class="card"><h2>Tengimynd</h2><div data-diagram></div></div>' +
      '<div class="card"><h2>Niðurstöður</h2><div data-out></div></div></div></div>';
    return h;
  }

  function circuitUpdate(kind) {
    const st = Store.state.calc[kind];
    const isS = kind === 'series';
    const missing = [], invalid = [];
    const uId = 'c-' + kind + '-U';
    st.U = document.getElementById(uId).value;
    const u = check(uId, st.U, 'V');
    if (u.empty) missing.push('spennu spennugjafans ' + S('U', 'H'));
    else if (!u.ok) invalid.push(S('U', 'H'));
    const rs = [], units = [], labels = [];
    st.R.forEach(function (r, i) {
      const id = 'c-' + kind + '-R' + i;
      r.v = document.getElementById(id).value;
      r.u = document.getElementById(id + '-unit').value;
      const c = check(id, r.v, r.u);
      if (c.empty) missing.push(S('R', i + 1));
      else if (!c.ok) invalid.push(S('R', i + 1));
      rs.push(c.ok ? c.value : null);
      units.push(r.u);
      labels.push(c.ok ? Calc.formatIn(c.value, r.u) : '?');
    });
    Store.save();
    const ok = !missing.length && !invalid.length;
    const uLabel = u.ok ? Calc.formatIn(u.value, 'V') : '?';
    const out = container.querySelector('[data-out]');
    const diag = container.querySelector('[data-diagram]');
    if (!ok) {
      diag.innerHTML = '<figure class="diagram">' + Diagrams[kind]({ U: uLabel, R: labels }) + '</figure>';
      out.innerHTML = waiting(missing, invalid);
      return;
    }
    const ex = isS ? Explain.series(u.value, rs, units) : Explain.parallel(u.value, rs, units);
    const r = ex.result;
    const best = function (x, q) { return Calc.formatBest(x, q); };
    if (isS) {
      diag.innerHTML = '<figure class="diagram">' + Diagrams.series({ U: uLabel, R: labels, I: best(r.I, 'I'), drops: r.drops.map(function (x) { return best(x, 'U'); }) }) + '</figure>';
      let s = '<div class="result-summary">' + kv('Heildarviðnám ' + S('R', 'H'), eqv(r.RH, 'R')) + kv('Heildarstraumur ' + S('I', 'H'), eqv(r.I, 'I'));
      r.drops.forEach(function (d, i) { s += kv('Spennufall ' + S('U', i + 1), eqv(d, 'U')); });
      s += '</div>';
      s += '<p class="notice ' + (ex.check ? 'notice-ok' : 'notice-bad') + '"><strong>Sannprófun:</strong> ' +
        r.drops.map(function (_, i) { return S('U', i + 1); }).join(' + ') + ' ' + Calc.eqSign(r.sumU) + ' ' + Calc.formatIn(r.sumU, 'V') +
        (ex.check ? ' = ' + S('U', 'H') + '. ✓ Summa spennufallanna er jöfn spennu spennugjafans.' : ' — stemmir ekki við ' + S('U', 'H') + '.') + '</p>';
      out.innerHTML = s + '<h3 style="margin-top:16px">Lausn skref fyrir skref</h3>' + UI.steps(ex.steps);
    } else {
      diag.innerHTML = '<figure class="diagram">' + Diagrams.parallel({ U: uLabel, R: labels, I: best(r.IH, 'I'), currents: r.currents.map(function (x) { return best(x, 'I'); }) }) + '</figure>';
      let s = '<div class="result-summary">' + kv('Heildarviðnám ' + S('R', 'H'), eqv(r.RH, 'R'));
      r.currents.forEach(function (c, i) { s += kv('Straumur ' + S('I', i + 1), eqv(c, 'I')); });
      s += kv('Heildarstraumur ' + S('I', 'H'), eqv(r.IH, 'I')) + '</div>';
      s += '<p class="notice ' + (ex.check ? 'notice-ok' : 'notice-bad') + '"><strong>Sannprófun:</strong> ' +
        r.currents.map(function (_, i) { return S('I', i + 1); }).join(' + ') + ' ' + Calc.eqSign(r.IH) + ' ' + Calc.formatIn(r.IH, 'A') + ' og ' +
        S('U', 'H') + ' / ' + S('R', 'H') + ' ' + Calc.eqSign(r.IHcheck) + ' ' + Calc.formatIn(r.IHcheck, 'A') +
        (ex.check ? '. ✓ Summa greinastraumanna er jöfn heildarstraumnum.' : ' — stemmir ekki.') + '</p>';
      out.innerHTML = s + '<h3 style="margin-top:16px">Lausn skref fyrir skref</h3>' + UI.steps(ex.steps);
    }
  }

  /* ---------- Blönduð tenging [Prófefni] ---------- */
  function mixedState() {
    const st = Store.state.calc.mixed;
    if (!SHAPES[st.shape]) st.shape = 'B';
    if (!st.R || typeof st.R !== 'object') st.R = {};
    return st;
  }
  function mixedPanel() {
    const st = mixedState();
    const shape = SHAPES[st.shape];
    const n = Calc.leaves(shape.tree()).length;
    let h = '<div class="calc-layout"><div class="card"><h2><span class="tag tag-prof">[Prófefni]</span> Blönduð tenging</h2>' +
      '<p class="help" style="margin-top:-4px">Veldu uppsetningu. „+“ merkir raðtengt og „‖“ hliðtengt.</p>' +
      '<fieldset><legend>Uppsetning</legend><div class="mc-options">' + Object.keys(SHAPES).map(function (k) {
        const sh = SHAPES[k];
        return '<label class="choice"><input type="radio" name="mix-shape" value="' + k + '"' + (st.shape === k ? ' checked' : '') + '> <span class="math">' + sh.text + '</span>' + (sh.src ? ' <span class="small muted">(' + sh.src + ')</span>' : '') + '</label>';
      }).join('') + '</div></fieldset>' +
      field('c-mixed-U', 'Spenna spennugjafans ' + S('U', 'H'), st.U, ['V'], 'V') +
      '<fieldset><legend>Viðnám</legend>';
    for (let i = 1; i <= n; i++) {
      const r = st.R[i] || { v: '', u: 'Ω' };
      const id = 'c-mixed-R' + i;
      h += '<div class="r-row"><label for="' + id + '">' + S('R', i) + '</label>' +
        '<input type="text" id="' + id + '" data-mr="' + i + '" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + esc(r.v) + '" aria-describedby="' + id + '-msg">' +
        UI.unitControl(id + '-unit', Calc.INPUT_UNITS.R, r.u, 'Eining fyrir R' + i) + '<span></span><p class="msg" id="' + id + '-msg"></p></div>';
    }
    h += '</fieldset><div class="actions"><button type="button" data-example>Hlaða dæmi</button><button type="button" data-clear>Hreinsa</button></div>' +
      '<p class="help" data-example-note aria-live="polite"></p></div>' +
      '<div class="stack"><div class="card"><h2>Tengimynd</h2><div data-diagram></div></div>' +
      '<div class="card"><h2>Niðurstöður</h2><div data-out></div></div></div></div>';
    return h;
  }
  function mixedUpdate() {
    const st = mixedState();
    const tree = SHAPES[st.shape].tree();
    const leafs = Calc.leaves(tree);
    const missing = [], invalid = [], labels = {};
    st.U = document.getElementById('c-mixed-U').value;
    const u = check('c-mixed-U', st.U, 'V');
    if (u.empty) missing.push('spennu spennugjafans ' + S('U', 'H')); else if (!u.ok) invalid.push(S('U', 'H'));
    let allOk = u.ok;
    leafs.forEach(function (l) {
      const id = 'c-mixed-R' + l.name;
      const r = st.R[l.name] = { v: document.getElementById(id).value, u: document.getElementById(id + '-unit').value };
      const c = check(id, r.v, r.u);
      if (c.empty) missing.push(S('R', l.name)); else if (!c.ok) invalid.push(S('R', l.name));
      if (c.ok) { l.R = c.value; labels[l.name] = Calc.formatIn(c.value, r.u); } else { allOk = false; labels[l.name] = '?'; }
    });
    Store.save();
    const diag = container.querySelector('[data-diagram]');
    const out = container.querySelector('[data-out]');
    const uLabel = u.ok ? Calc.formatIn(u.value, 'V') : '?';
    if (!allOk) {
      diag.innerHTML = '<figure class="diagram">' + Diagrams.network({ U: uLabel, tree: tree, labels: labels }) + '</figure>';
      out.innerHTML = waiting(missing, invalid);
      return;
    }
    const ex = Explain.network(u.value, tree);
    const r = ex.result;
    diag.innerHTML = '<figure class="diagram">' + Diagrams.network({ U: uLabel, tree: tree, labels: labels, I: Calc.formatBest(r.IH, 'I') }) + '</figure>';
    let s = '<div class="result-summary">' + kv('Heildarviðnám ' + S('R', 'H'), eqv(r.RH, 'R')) + kv('Heildarstraumur ' + S('I', 'H'), eqv(r.IH, 'I')) + '</div>' +
      '<div class="table-wrap"><table><thead><tr><th scope="col">Mótstaða</th><th scope="col">Viðnám</th><th scope="col">Spennufall ' + S('U') + '</th><th scope="col">Straumur ' + S('I') + '</th></tr></thead><tbody>' +
      leafs.map(function (l) {
        const nd = r.nodes[String(l.name)];
        return '<tr><th scope="row">' + S('R', l.name) + '</th><td>' + Calc.formatBest(nd.R, 'R') + '</td><td>' + Calc.eqSign(nd.U) + ' ' + Calc.formatBest(nd.U, 'U') + '</td><td>' + Calc.eqSign(nd.I) + ' ' + Calc.formatBest(nd.I, 'I') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    s += '<p class="notice ' + (ex.check ? 'notice-ok' : 'notice-bad') + '" style="margin-top:12px"><strong>Sannprófun:</strong> ' + (ex.check ? 'Spennuföll og straumar stemma við lögmál Kirchhoffs. ✓' : 'Stemmir ekki — farðu yfir gildin.') + '</p>';
    out.innerHTML = s + '<h3 style="margin-top:16px">Lausn skref fyrir skref</h3>' + UI.steps(ex.steps);
  }

  /* ---------- Samsetning ---------- */
  function panelHTML(tab) { return tab.key === 'ohm' ? ohmPanel() : tab.key === 'mixed' ? mixedPanel() : circuitPanel(tab.key); }
  function update() {
    const key = Store.state.settings.calcTab;
    if (key === 'ohm') ohmUpdate(); else if (key === 'mixed') mixedUpdate(); else circuitUpdate(key);
  }
  function renderPanel(focusId) {
    const tab = TABS.find(function (x) { return x.key === Store.state.settings.calcTab; }) || TABS[0];
    const panel = container.querySelector('#calc-panel');
    panel.setAttribute('aria-labelledby', 'tab-' + tab.id);
    panel.innerHTML = panelHTML(tab);
    update();
    if (focusId) { const f = document.getElementById(focusId); if (f) f.focus(); }
  }
  function selectTab(tab, focus) {
    Store.state.settings.calcTab = tab.key; Store.save();
    container.querySelectorAll('[role=tab]').forEach(function (b) {
      const sel = b.id === 'tab-' + tab.id;
      b.setAttribute('aria-selected', sel ? 'true' : 'false');
      b.tabIndex = sel ? 0 : -1;
      if (sel && focus) b.focus();
    });
    history.replaceState(null, '', '#reiknivelar:' + tab.id);
    renderPanel();
  }

  function onClick(e) {
    const tabBtn = e.target.closest('[role=tab]');
    if (tabBtn) { selectTab(TABS.find(function (t) { return 'tab-' + t.id === tabBtn.id; })); return; }
    const key = Store.state.settings.calcTab;
    const note = function (t) { const n = container.querySelector('[data-example-note]'); if (n) n.textContent = t; };
    if (e.target.closest('[data-example]')) {
      if (key === 'mixed') {
        const st = mixedState();
        const exm = SHAPES[st.shape].ex;
        st.U = exm.U; st.R = {};
        exm.R.forEach(function (v, i) { st.R[i + 1] = { v: v, u: 'Ω' }; });
        Store.save(); renderPanel();
        note('Dæmi hlaðið' + (SHAPES[st.shape].src ? ' (' + SHAPES[st.shape].src + ' í námsefninu)' : '') + ': spenna ' + exm.U + ' V, viðnám ' + exm.R.join(', ') + ' Ω.');
      } else if (key === 'ohm') {
        const st = Store.state.calc.ohm;
        const exm = OHM_EXAMPLES[st.find];
        Object.keys(exm).forEach(function (k) { st[k] = { v: exm[k].v, u: exm[k].u }; });
        Store.save(); renderPanel();
        note('Dæmi hlaðið: ' + Object.keys(exm).map(function (k) { return k + ' = ' + exm[k].v + ' ' + exm[k].u; }).join(', ') + '.');
      } else {
        const st = Store.state.calc[key];
        const list = CIRCUIT_EXAMPLES[key];
        st.ex = ((st.ex | 0) + 1) % list.length;
        if (st.ex < 0) st.ex = 0;
        const exm = list[st.ex];
        st.U = exm.U;
        st.R = exm.R.map(function (r) { return { v: r[0], u: r[1] }; });
        Store.save(); renderPanel();
        note('Dæmi ' + (st.ex + 1) + ' af ' + list.length + ' hlaðið. Smelltu aftur til að fá annað dæmi.');
      }
      UI.announce('Dæmi hlaðið.');
      return;
    }
    if (e.target.closest('[data-clear]')) {
      if (key === 'mixed') {
        const st = mixedState(); st.U = ''; st.R = {};
        Store.save(); renderPanel('c-mixed-U');
      } else if (key === 'ohm') {
        const st = Store.state.calc.ohm;
        ['U', 'I', 'R'].forEach(function (k) { st[k].v = ''; });
        Store.save(); renderPanel('c-ohm-' + ['U', 'I', 'R'].filter(function (k) { return k !== st.find; })[0]);
      } else {
        const st = Store.state.calc[key];
        st.U = ''; st.ex = -1; st.R = [{ v: '', u: 'Ω' }, { v: '', u: 'Ω' }];
        Store.save(); renderPanel('c-' + key + '-U');
      }
      UI.announce('Reitir hreinsaðir.');
      return;
    }
    if (e.target.closest('[data-add]')) {
      const st = Store.state.calc[key];
      if (st.R.length < MAX_R) {
        const lastUnit = st.R[st.R.length - 1].u;
        st.R.push({ v: '', u: lastUnit });
        Store.save(); renderPanel('c-' + key + '-R' + (st.R.length - 1));
        UI.announce('Viðnámi R' + st.R.length + ' bætt við.');
      }
      return;
    }
    const rem = e.target.closest('[data-remove]');
    if (rem) {
      const st = Store.state.calc[key];
      const i = +rem.dataset.remove;
      if (st.R.length > MIN_R) {
        st.R.splice(i, 1);
        Store.save(); renderPanel('c-' + key + '-R' + Math.min(i, st.R.length - 1));
        UI.announce('Viðnám fjarlægt. Viðnámin eru nú ' + st.R.length + '.');
      }
    }
  }
  function onChange(e) {
    if (e.target.name === 'ohm-find') {
      Store.state.calc.ohm.find = e.target.value; Store.save();
      renderPanel();
      const r = container.querySelector('input[name=ohm-find]:checked'); if (r) r.focus();
      return;
    }
    if (e.target.name === 'mix-shape') {
      mixedState().shape = e.target.value; Store.save();
      renderPanel();
      const r = container.querySelector('input[name=mix-shape]:checked'); if (r) r.focus();
      return;
    }
    if (e.target.closest('#calc-panel')) update();
  }
  function onKey(e) {
    const tabBtn = e.target.closest('[role=tab]');
    if (!tabBtn) return;
    const i = TABS.findIndex(function (t) { return 'tab-' + t.id === tabBtn.id; });
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = TABS.length - 1;
    if (j != null) { e.preventDefault(); selectTab(TABS[j], true); }
  }

  Views.reiknivelar = {
    render: function (sub) {
      const tab = tabFromSub(sub);
      return '<div class="section-head"><div><p class="eyebrow">Reiknivélar</p><h1>Reiknivélar</h1>' +
        '<p class="lead">Sláðu inn gildin og sjáðu lausnina skref fyrir skref. Notaðu reiknivélarnar til að athuga eigin útreikninga — í prófinu notarðu þína eigin reiknivél.</p></div></div>' +
        '<div class="tabs" role="tablist" aria-label="Veldu reiknivél">' + TABS.map(function (t) {
          const sel = t.key === tab.key;
          return '<button type="button" role="tab" id="tab-' + t.id + '" aria-controls="calc-panel" aria-selected="' + sel + '" tabindex="' + (sel ? 0 : -1) + '">' + t.label + '</button>';
        }).join('') + '</div><div id="calc-panel" role="tabpanel" aria-labelledby="tab-' + tab.id + '"></div>';
    },
    mount: function (el) {
      container = el;
      renderPanel();
      el.addEventListener('click', onClick);
      el.addEventListener('input', onChange);
      el.addEventListener('change', onChange);
      el.addEventListener('keydown', onKey);
    },
    navigate: function (sub) {
      const t = TABS.find(function (x) { return x.id === sub; });
      if (!t) return false;
      selectTab(t);
      return true;
    },
    unmount: function () { container = null; },
  };
})(typeof self !== 'undefined' ? self : this);

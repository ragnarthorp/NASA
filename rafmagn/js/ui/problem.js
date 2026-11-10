/* Reiknidæmi með einkakennara (A–E) og hugtakaspurning. Notað í æfingum, lotum og prófhermi. */
(function () {
  const RF = window.RF;
  const { h, toast, shuffle, famChip } = RF.dom;
  const g = RF.util.fmt, f = RF.util.fmtS;
  let uid = 0;

  const valueText = (part, v) => {
    if (part.kind === 'choice') return (Array.isArray(v) ? v : [v]).map((x) => (part.options.find((o) => o.v === x) || { label: x }).label).join(' / ');
    return f(v) + ' ' + (part.unit || '');
  };
  RF.valueText = valueText;

  function stepsView(steps, tid) {
    return h('ol.steps', steps.map((s) => h('li', { class: s.ans ? 'ans' : '' },
      h('div.step-h', s.h),
      s.diagram ? h('div.figwrap', { html: RF.twoWireSVG({ anim: false }) }) : null,
      s.m.length ? h('div.step-m', s.m.map((x) => h('div', { html: RF.m(x) }))) : null,
      s.n ? h('div.step-n', { html: RF.rich(s.n) }) : null)));
  }
  RF.stepsView = stepsView;

  function tableBox(t, p) {
    return h('div.tablebox', h('b', 'Töflugildi: '), t.table(p).map((x) => h('span', { html: RF.rich(x) })));
  }

  /* opts: { mode: 'practice'|'exam', onResult(res, assisted), onNext(), answers (exam), showTable } */
  RF.problemView = function (prob, opts = {}) {
    const t = RF.ptype(prob.tid), p = prob.p;
    const id = 'pb' + ++uid;
    const parts = t.parts(p);
    const exam = opts.mode === 'exam';
    const state = { assisted: false, hintIdx: 0, checked: false, answers: opts.answers || {} };
    const fam = RF.families[t.fam];

    const head = h('div.pb-head',
      famChip(t.fam, t.id),
      h('div.pb-title', h('h3', { id: id + '-t' }, t.title), h('div.pb-meta',
        prob.orig ? h('span.badge.orig', 'Upprunalegt dæmi · ' + t.source) : h('span.badge', RF.levels[prob.level] + (prob.gen ? ' · nýtt dæmi' : '')),
        prob.note ? h('span.badge.soft', prob.note) : null,
        exam ? null : h('span.cards', 'Aðferð: ', t.cards.map((c) => h('a.cardref.fam-' + RF.method(c).fam, { href: '#/formulur/' + c, title: RF.method(c).find }, String(c)))))));

    const question = h('div.pb-q', { id: id + '-q' }, prob.text);
    const tbl = h('div', opts.showTable === false ? null : tableBox(t, p));

    /* ---- svarreitir ---- */
    const fb = {};
    const inputs = {};
    const form = h('form.pb-form', { 'aria-labelledby': id + '-t', novalidate: true, onsubmit: (e) => { e.preventDefault(); if (!exam) check(); } },
      parts.map((part) => {
        const fid = id + '-' + part.k;
        let ctl;
        if (part.kind === 'choice') {
          ctl = h('select', { id: fid, name: part.k }, h('option', { value: '' }, '— veldu —'), part.options.map((o) => h('option', { value: o.v, selected: state.answers[part.k] === o.v ? true : null }, o.label)));
        } else {
          ctl = h('input', { id: fid, name: part.k, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', value: state.answers[part.k] || '', 'aria-describedby': fid + '-fb' });
        }
        ctl.addEventListener('input', () => { state.answers[part.k] = ctl.value; if (opts.onChange) opts.onChange(state.answers); });
        ctl.addEventListener('change', () => { state.answers[part.k] = ctl.value; if (opts.onChange) opts.onChange(state.answers); });
        inputs[part.k] = ctl;
        fb[part.k] = h('div.fb', { id: fid + '-fb', 'aria-live': 'polite' });
        return h('div.ans-row', h('label', { for: fid, html: RF.rich(part.label) }), h('div.ans-ctl', ctl, part.unit ? h('span.unit', part.unit) : null), fb[part.k]);
      }),
      exam ? null : h('div.pb-actions', h('button.btn.primary', { type: 'submit' }, 'Fara yfir svar'), h('span.small', 'Komma eða punktur – hvort tveggja virkar.')));

    if (exam) return { el: h('section.problem', { 'aria-labelledby': id + '-t' }, head, question, tbl, form), get: () => state.answers };

    /* ---- einkakennari ---- */
    const tutorBody = h('div.tutor-body', { 'aria-live': 'polite' });
    const modes = [
      ['solo', 'A', 'Ég leysi sjálf/ur'],
      ['hint', 'B', 'Gefðu mér vísbendingu'],
      ['formula', 'C', 'Hjálpaðu mér að velja formúlu'],
      ['guide', 'D', 'Leiðbeindu mér skref fyrir skref'],
      ['full', 'E', 'Sýndu fulla lausn'],
    ];
    const tabs = h('div.tutor-tabs', { role: 'toolbar', 'aria-label': 'Hjálp við dæmið' }, modes.map(([k, L, label]) => h('button', { type: 'button', 'data-k': k, 'aria-pressed': k === 'solo' ? 'true' : 'false', onclick: () => setMode(k) }, h('b', L), ' ', label)));
    const markAssist = () => { if (!state.checkedOk) state.assisted = true; };

    function setMode(k) {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === k ? 'true' : 'false'));
      tutorBody.innerHTML = '';
      if (k === 'solo') { tutorBody.append(h('p.small', 'Leystu dæmið á blað og skrifaðu svörin í reitina. Hjálpin er hér ef þú festist.')); return; }
      markAssist();
      if (k === 'hint') return showHint();
      if (k === 'formula') return showFormula(tutorBody);
      if (k === 'guide') return showGuide();
      if (k === 'full') return showFull();
    }
    function showHint() {
      const hints = t.hints(p);
      const list = h('ol.hints');
      const more = h('button.btn', { type: 'button' }, 'Önnur vísbending');
      const add = () => {
        if (state.hintIdx < hints.length) list.append(h('li', { html: RF.rich(hints[state.hintIdx++]) }));
        if (state.hintIdx >= hints.length) { more.disabled = true; more.textContent = 'Engar fleiri vísbendingar – prófaðu skref fyrir skref (D)'; }
      };
      for (let i = 0; i < Math.max(1, state.hintIdx); i++) { if (i < state.hintIdx) list.append(h('li', { html: RF.rich(hints[i]) })); }
      if (!state.hintIdx) add();
      more.addEventListener('click', add);
      if (state.hintIdx >= hints.length) { more.disabled = true; more.textContent = 'Engar fleiri vísbendingar'; }
      tutorBody.append(list, more);
    }
    function givenTable() {
      return h('table.tbl.given', h('thead', h('tr', h('th', 'Tákn'), h('th', 'Gildi'), h('th', 'Hvað'))), h('tbody', t.given(p).map(([s, v, n]) => h('tr', h('td', { html: RF.rich(s) }), h('td', v), h('td', n)))));
    }
    function formulaQuiz(after) {
      const opts2 = shuffle([t.fq.right, ...t.fq.wrong]);
      const out = h('div.fb', { 'aria-live': 'polite' });
      const box = h('div.fq', h('p', h('b', 'Hvaða formúla hentar?')), h('div.fq-opts', opts2.map((o) => h('button.btn.fq-btn', {
        type: 'button', html: RF.m(o), onclick: (e) => {
          const ok = o === t.fq.right;
          e.currentTarget.classList.add(ok ? 'ok' : 'no');
          out.className = 'fb ' + (ok ? 'good' : 'bad');
          out.innerHTML = (ok ? '<b>Rétt!</b> ' : '<b>Ekki þessi.</b> ') + RF.rich(t.fq.why);
          if (ok && after) after();
        },
      }))), out);
      return box;
    }
    function showFormula(where) {
      where.append(
        h('h4', 'Hvað er gefið?'), givenTable(),
        h('h4', 'Hvað á að finna?'), h('ul', t.find(p).map(([s, n]) => h('li', { html: '<b>' + RF.rich(s) + '</b> – ' + RF.util.esc(n) }))),
        formulaQuiz(), h('p.small', { html: RF.rich(t.rearr(p)) }));
    }
    function showGuide() {
      const sol = t.solve(p);
      const steps = [
        ['1. Hvað er gefið?', () => givenTable()],
        ['2. Hvað á að finna?', () => h('ul', t.find(p).map(([s, n]) => h('li', { html: '<b>' + RF.rich(s) + '</b> – ' + RF.util.esc(n) })))],
        ['3. Hvaða formúla er notuð?', () => formulaQuiz()],
        ['4. Þarf að umrita formúluna?', () => h('p', { html: RF.rich(t.rearr(p)) })],
        ['5. Hvernig set ég tölurnar inn?', () => h('div', h('p.small', 'Hér eru tölurnar settar inn. Reiknaðu sjálf/ur á blað/reiknivél áður en þú heldur áfram.'), sol.steps.map((s) => h('div.step-m', s.m.slice(0, Math.max(1, s.m.length - (s.ans ? 1 : 0))).map((x) => h('div', { html: RF.m(x) })), s.diagram ? h('div.step-n', { html: RF.rich(s.n) }) : null)))],
        ['6. Hvert er svarið?', () => { const b = h('div', h('p', 'Skrifaðu útkomuna í svarreitina hér fyrir neðan og smelltu á „Fara yfir svar“.')); const rv = h('button.btn', { type: 'button', onclick: () => { rv.replaceWith(h('div.reveal', parts.map((pt) => h('div', { html: RF.rich(pt.label) + ': <b>' + RF.util.esc(valueText(pt, sol.v[pt.k])) + '</b>' })))); } }, 'Sýna útkomuna'); b.append(rv); setTimeout(() => inputs[parts[0].k].focus(), 50); return b; }],
        ['7. Er svarið rökrétt?', () => h('p', { html: RF.rich(t.sanity(p, sol.v)) })],
      ];
      let i = 0;
      const list = h('div.guide');
      const next = h('button.btn.primary', { type: 'button' }, 'Næsta skref →');
      const add = () => {
        if (i >= steps.length) return;
        const [title, fn] = steps[i++];
        list.append(h('div.guide-step', h('h4', title), fn()));
        if (i >= steps.length) { next.disabled = true; next.textContent = 'Öll skrefin komin'; }
      };
      next.addEventListener('click', add);
      add();
      tutorBody.append(list, next);
    }
    function showFull() {
      const sol = t.solve(p);
      tutorBody.append(h('h4', 'Full lausn'), stepsView(sol.steps, t.id),
        h('div.answers', h('b', 'Svör: '), parts.map((pt) => h('span', { html: RF.rich(pt.label) + ' = <b>' + RF.util.esc(valueText(pt, sol.v[pt.k])) + '</b>' }))),
        prob.orig ? h('p.small', 'Svar kennarans: ' + t.original.teacher) : null,
        h('p.small', { html: '<b>Er svarið rökrétt?</b> ' + RF.rich(t.sanity(p, sol.v)) }));
    }

    const after = h('div.pb-after');
    function check() {
      const res = RF.checkProblem(prob, state.answers);
      if (res.parts.every((r) => r.status === 'empty')) { toast('Skrifaðu svar í a.m.k. einn reit.'); inputs[parts[0].k].focus(); return; }
      res.parts.forEach((r) => {
        const el = fb[r.k];
        el.className = 'fb ' + ({ correct: 'good', close: 'good', follow: 'mid', wrong: 'bad', empty: 'mid' }[r.status]);
        const pt = parts.find((x) => x.k === r.k);
        el.innerHTML = '<b>' + { correct: '✓ Rétt', close: '✓ Telst rétt', follow: '½ Fylgivilla', wrong: '✗ Rangt', empty: '– Vantar' }[r.status] + '.</b> ' + RF.rich(r.msg.replace(/^Rétt!\s*/, '')) + (r.status === 'wrong' && state.tries >= 1 ? ' <span class="small">Rétt svar: ' + RF.util.esc(valueText(pt, r.expected)) + '</span>' : '');
        inputs[r.k].setAttribute('aria-invalid', r.status === 'wrong' ? 'true' : 'false');
      });
      state.tries = (state.tries || 0) + 1;
      const ok = res.score >= 0.999;
      if (!state.recorded) { RF.store.recordProblem(prob, res, state.assisted); state.recorded = true; }
      if (ok) state.checkedOk = true;
      after.innerHTML = '';
      after.append(h('div.result', { class: ok ? 'good' : 'bad', role: 'status' }, ok ? (state.assisted ? 'Rétt – með hjálp. Prófaðu nýtt afbrigði án hjálpar til að festa aðferðina.' : 'Frábært – rétt án hjálpar!') : 'Ekki alveg. Lagaðu svarið og reyndu aftur, eða notaðu hjálpina (B–E).'),
        h('div.pb-actions', ok || state.tries > 1 ? h('button.btn', { type: 'button', onclick: () => setMode('full') }, 'Sjá lausnina') : null, opts.onNext ? h('button.btn.primary', { type: 'button', onclick: opts.onNext }, opts.nextLabel || 'Næsta dæmi →') : null));
      if (opts.onResult) opts.onResult(res, state.assisted);
    }

    const el = h('section.problem.fam-b-' + t.fam, { 'aria-labelledby': id + '-t', style: { '--fam': fam.color } }, head, question, tbl,
      t.diagram ? h('details.diag', h('summary', 'a) Tengimynd – teiknaðu sjálf/ur fyrst, opnaðu svo til að bera saman'), h('div.figwrap', { html: RF.twoWireSVG({ l: g(p.l != null ? p.l : p.lkm * 1000) + ' m', I: 'I = ' + g(p.I) + ' A', U1: 'U₁ = ?', U2: 'U₂ = ' + g(p.U2) + ' V', anim: false }) })) : null,
      h('div.tutor', tabs, tutorBody), form, after);
    setMode('solo');
    return { el };
  };

  /* ---- Hugtakaspurning ---- */
  RF.conceptView = function (c, opts = {}) {
    const id = 'cq' + ++uid;
    const multi = Array.isArray(c.a);
    const order = opts.order || shuffle(c.opts.map((_, i) => i));
    const sel = new Set(opts.answer != null ? [].concat(opts.answer) : []);
    const fbEl = h('div.fb', { 'aria-live': 'polite' });
    let done = false;
    const name = id + '-o';
    const optEls = order.map((i) => {
      const inp = h('input', { type: multi ? 'checkbox' : 'radio', name, value: i, checked: sel.has(i) ? true : null });
      inp.addEventListener('change', () => { if (multi) { inp.checked ? sel.add(i) : sel.delete(i); } else { sel.clear(); sel.add(i); } if (opts.onChange) opts.onChange(multi ? [...sel] : i); if (!multi && !opts.exam && opts.instant !== false) submit(); });
      return h('label.opt', inp, h('span', { html: RF.rich(c.opts[i]) }));
    });
    function submit() {
      if (done || opts.exam) return;
      if (!sel.size) { toast('Veldu svar.'); return; }
      done = true;
      const ok = RF.conceptCorrect(c, multi ? [...sel] : [...sel][0]);
      RF.store.recordConcept(c.id, ok);
      optEls.forEach((l, k) => { const i = order[k]; const right = multi ? c.a.includes(i) : c.a === i; l.classList.add(right ? 'right' : sel.has(i) ? 'wrongsel' : 'dim'); l.querySelector('input').disabled = true; });
      fbEl.className = 'fb ' + (ok ? 'good' : 'bad');
      fbEl.innerHTML = '<b>' + (ok ? '✓ Rétt!' : '✗ Ekki rétt.') + '</b> ' + RF.rich(c.ex);
      if (opts.onResult) opts.onResult(ok);
    }
    const el = h('fieldset.concept', h('legend', { id: id + '-l' }, h('span.chip.fam-' + (RF.cats[c.cat].ch >= 4 ? 'U' : c.cat === 'hiti' ? 'T' : 'R'), 'Hugtak'), ' ', c.q, c.src === 'almennt' ? h('span.badge.soft', { title: 'Byggt á almennri þekkingu – glærur 3.1/3.2 vantaði' }, 'óstaðfest í gögnum') : null),
      multi ? h('p.small', 'Veldu öll rétt svör.') : null, h('div.opts', optEls),
      opts.exam ? null : h('div.pb-actions', multi || opts.instant === false ? h('button.btn.primary', { type: 'button', onclick: submit }, 'Fara yfir') : null), fbEl);
    return { el, get: () => (multi ? [...sel] : sel.size ? [...sel][0] : null), order };
  };
})();

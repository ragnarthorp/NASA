/* Síður: Læra, Æfa, Hugtök, Formúlur, Prófhermir */
(function () {
  const RF = window.RF;
  const { h, toast, renderMathTags, shuffle, famChip } = RF.dom;
  const g = RF.util.fmt, f = RF.util.fmtS;
  const V = (RF.views = RF.views || {});
  const S = () => RF.store.get();
  const pct = (x) => (x == null ? '–' : Math.round(x * 100) + ' %');
  const bar = (x, label) => h('div.bar', { role: 'img', 'aria-label': label + ': ' + pct(x) }, h('span', { style: { width: Math.round((x || 0) * 100) + '%' } }));
  RF.ui = { pct, bar };

  /* ============ LÆRA ============ */
  V.learn = (root, arg) => {
    const ch = RF.lessons.find((c) => c.id === arg);
    if (!ch) {
      root.append(h('h1', 'Læra efnið'), h('p.lead', 'Fjórir kaflar. Hver hluti endar á stuttum spurningum. Merktu við þegar þú hefur lært hlutann.'),
        h('div.chapter-grid', RF.lessons.map((c) => {
          const done = c.sections.filter((s) => S().learned[s.id]).length;
          return h('a.chapter-card.fam-b-' + c.fam, { href: '#/laera/' + c.id },
            h('span.num', String(c.n)), h('h2', c.title), h('p', c.intro), bar(done / c.sections.length, 'Lokið'), h('span.small', done + ' af ' + c.sections.length + ' hlutum lærðir'), c.unverified ? h('span.badge.soft', 'Hluti efnis óstaðfestur') : null);
        })),
        h('p', h('a.btn', { href: '#/aefa' }, 'Fara beint í reiknidæmin →')));
      return;
    }
    const toc = h('nav.toc', { 'aria-label': 'Efnisyfirlit kaflans' }, h('ol', ch.sections.map((s) => h('li', h('a', { href: '#/laera/' + ch.id + '/' + s.id, onclick: (e) => { e.preventDefault(); document.getElementById(s.id).scrollIntoView({ behavior: 'smooth' }); document.getElementById(s.id).querySelector('h2').focus(); } }, s.title)))));
    root.append(
      h('p.crumbs', h('a', { href: '#/laera' }, 'Læra'), ' › Kafli ' + ch.n),
      h('h1', 'Kafli ' + ch.n + ' – ' + ch.title), h('p.lead', ch.intro),
      ch.unverified ? h('div.note.warnbox', h('b', 'Athugið: '), ch.unverified) : null,
      toc);
    ch.sections.forEach((s) => {
      const learned = !!S().learned[s.id];
      const btn = h('button.btn.learned', { type: 'button', 'aria-pressed': learned ? 'true' : 'false', onclick: () => { const st = S(); st.learned[s.id] = !st.learned[s.id]; RF.store.save(); btn.setAttribute('aria-pressed', st.learned[s.id] ? 'true' : 'false'); btn.textContent = st.learned[s.id] ? '✓ Lært' : 'Merkja sem lært'; } }, learned ? '✓ Lært' : 'Merkja sem lært');
      const body = h('div.lesson-body', { html: renderMathTags(s.html) });
      const quiz = h('div.lesson-quiz', h('h3', 'Prófaðu þig'), s.quiz.map((id) => RF.conceptView(RF.concept(id)).el));
      root.append(h('section.lesson', { id: s.id }, h('h2', { tabindex: '-1' }, s.title), body, quiz, h('div.lesson-foot', btn)));
      RF.mountWidgets(body);
    });
    const i = RF.lessons.indexOf(ch);
    root.append(h('div.pager', i > 0 ? h('a.btn', { href: '#/laera/' + RF.lessons[i - 1].id }, '← Kafli ' + RF.lessons[i - 1].n) : h('span'), i < RF.lessons.length - 1 ? h('a.btn.primary', { href: '#/laera/' + RF.lessons[i + 1].id }, 'Kafli ' + RF.lessons[i + 1].n + ' →') : h('a.btn.primary', { href: '#/aefa' }, 'Æfa reiknidæmi →')));
  };

  /* ============ ÆFA ============ */
  const typeRow = (t) => {
    const m = RF.store.typeMastery(t.id), st = S().types[t.id];
    return h('a.type-row.fam-b-' + t.fam, { href: '#/aefa/' + t.id },
      famChip(t.fam, t.id), h('span.tr-title', h('b', t.title), h('span.small', t.source + ' · aðferð ' + t.cards.join(', '))),
      h('span.tr-stat', bar(m || 0, 'Færni'), h('span.small', st ? st.correct + ' rétt af ' + st.tries : 'Ekki reynt')));
  };
  V.practice = (root, arg, q) => {
    const t = RF.ptype(arg);
    if (!t) {
      root.append(h('h1', 'Æfa reiknidæmi'), h('p.lead', '13 dæmagerðir úr æfingaverkefnum kennarans. Hver hefur upprunalega dæmið, sex afbrigði (létt, miðlungs, erfitt) og verkefnagjafa sem býr til ný dæmi.'),
        h('div.two-col',
          h('section', h('h2', famChip('R', 'V'), ' Viðnám – 3.3.1'), h('div.type-list', RF.problemTypes.filter((x) => x.ch === 3).map(typeRow))),
          h('section', h('h2', famChip('U', 'S'), ' Spennufall – 3.4.1'), h('div.type-list', RF.problemTypes.filter((x) => x.ch === 4).map(typeRow)))),
        h('section.panel', h('h2', 'Hugtakaspurningar'), h('p', 'Stuttar spurningar um flokkun, eiginleika, formúlur og spennufall.'), h('div.btnrow', Object.entries(RF.cats).map(([k, c]) => h('a.btn', { href: '#/hugtok/' + k }, c.name)), h('a.btn.primary', { href: '#/hugtok/allt' }, 'Allar blandaðar'))));
      return;
    }
    const variants = RF.variantList(t.id);
    let cur = q.v || 'orig';
    const host = h('div');
    const vsel = h('div.variant-bar', { role: 'group', 'aria-label': 'Veldu afbrigði' });
    const show = (src) => {
      let prob;
      if (src === 'lett' || src === 'midl' || src === 'erf') prob = RF.makeProblem(t.id, { seed: RF.util.newSeed(), level: src });
      else prob = RF.makeProblem(t.id, src);
      cur = src;
      vsel.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.src === src ? 'true' : 'false'));
      host.innerHTML = '';
      const next = () => {
        const i = variants.findIndex((v) => v.src === cur);
        if (i >= 0 && i < variants.length - 1) show(variants[i + 1].src); else show(['lett', 'midl', 'erf'][Math.floor(Math.random() * 3)]);
        host.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      host.append(RF.problemView(prob, { onNext: next, nextLabel: 'Næsta afbrigði →' }).el);
    };
    vsel.append(...variants.map((v) => h('button', { type: 'button', 'data-src': v.src, onclick: () => show(v.src), title: v.note || '' }, v.orig ? '★ Kennarans' : v.label.replace('Afbrigði ', '#'), h('span.lv.' + v.level, RF.levels[v.level]))),
      h('span.sep', 'Nýtt:'), ...['lett', 'midl', 'erf'].map((lv) => h('button.gen', { type: 'button', 'data-src': lv, onclick: () => show(lv) }, '⟳ ' + RF.levels[lv])));
    const i = RF.problemTypes.indexOf(t);
    root.append(
      h('p.crumbs', h('a', { href: '#/aefa' }, 'Æfa'), ' › ' + t.id),
      h('h1', t.id + ' – ' + t.title),
      h('p.skills', h('b', 'Reynir á: '), t.skills.map((s) => h('span.tag', { html: RF.rich(s) }))),
      vsel, host,
      h('div.pager', i > 0 ? h('a.btn', { href: '#/aefa/' + RF.problemTypes[i - 1].id }, '← ' + RF.problemTypes[i - 1].id) : h('span'), i < RF.problemTypes.length - 1 ? h('a.btn', { href: '#/aefa/' + RF.problemTypes[i + 1].id }, RF.problemTypes[i + 1].id + ' →') : h('span')));
    show(cur);
  };

  /* ============ HUGTÖK ============ */
  V.concepts = (root, arg) => {
    const pool = arg && RF.cats[arg] ? RF.concepts.filter((c) => c.cat === arg) : RF.concepts;
    const qs = shuffle(pool);
    let i = 0, right = 0;
    const host = h('div');
    const prog = h('p.small', { 'aria-live': 'polite' });
    const next = () => {
      host.innerHTML = '';
      if (i >= qs.length) { host.append(h('div.result', { class: right / qs.length >= 0.8 ? 'good' : 'bad' }, 'Lokið: ' + right + ' af ' + qs.length + ' rétt.'), h('div.btnrow', h('a.btn.primary', { href: '#/hugtok/' + (arg || 'allt'), onclick: () => setTimeout(() => RF.route(true)) }, 'Aftur'), h('a.btn', { href: '#/aefa' }, 'Í reiknidæmin'))); return; }
      prog.textContent = 'Spurning ' + (i + 1) + ' af ' + qs.length + ' · ' + right + ' rétt';
      const nb = h('button.btn.primary', { type: 'button', hidden: true, onclick: () => { i++; next(); } }, 'Næsta spurning →');
      host.append(RF.conceptView(qs[i], { onResult: (ok) => { if (ok) right++; nb.hidden = false; nb.focus(); prog.textContent = 'Spurning ' + (i + 1) + ' af ' + qs.length + ' · ' + right + ' rétt'; } }).el, nb);
    };
    root.append(h('p.crumbs', h('a', { href: '#/aefa' }, 'Æfa'), ' › Hugtök'), h('h1', 'Hugtakaspurningar' + (RF.cats[arg] ? ' – ' + RF.cats[arg].name : '')), prog, host);
    next();
  };

  /* ============ FORMÚLUR OG FLÝTIHJÁLP ============ */
  RF.methodCard = (m, opts = {}) => {
    const fam = RF.families[m.fam];
    return h('article.mcard.fam-b-' + m.fam, { id: 'm' + m.id, tabindex: '-1', 'data-search': ({ R: 'viðnám efni leiðari lengd ', T: 'hiti hitastig hitun kólnun alfa α ', U: 'spennufall spenna kapall tvíleiðari straumur ' }[m.fam] + m.find + ' ' + m.needs + ' ' + RF.util.mathText(m.formula) + ' ' + m.alt.join(' ')).toLowerCase() },
      h('header', h('span.mnum', String(m.id)), h('h3', h('span.small', 'Ég á að finna '), m.find)),
      h('div.mformula', { html: RF.m(m.formula) }),
      m.alt.length ? h('div.malt', m.alt.map((a) => h('div', { html: RF.rich(a.includes('=') ? a : a) }))) : null,
      h('p.mneeds', { html: '<b>Þarf:</b> ' + RF.rich(m.needs) }),
      opts.compact ? null : h('ol.msteps', m.steps.map((s) => h('li', { html: RF.rich(s) }))),
      opts.compact ? null : h('p.mex', { html: '<b>Dæmi:</b> ' + RF.rich(m.example) }),
      opts.compact ? null : h('p.mtrap', { html: '<b>Varastu:</b> ' + m.mistakes.map(RF.rich).join(' · ') }),
      opts.compact ? null : h('div.btnrow', m.types.map((tid) => h('a.btn.small', { href: '#/aefa/' + tid }, 'Æfa ' + tid))));
  };
  V.formulas = (root, arg) => {
    const search = h('input', { type: 'search', placeholder: 'Leita: t.d. lengd, spennufall, hiti, þvermál …', 'aria-label': 'Leita í formúlum' });
    const grid = h('div.mgrid', RF.methods.map((m) => RF.methodCard(m)));
    const none = h('p', { hidden: true }, 'Ekkert fannst.');
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let n = 0;
      grid.querySelectorAll('.mcard').forEach((c) => { const show = !q || c.dataset.search.includes(q); c.hidden = !show; if (show) n++; });
      none.hidden = n > 0;
    });
    /* Hvaða dæmi er þetta? */
    const gsel = {};
    const out = h('div.identify-out', { 'aria-live': 'polite' });
    const findSel = h('select', { 'aria-label': 'Hvað á að finna?' }, h('option', { value: '' }, '— veldu —'), RF.findOptions.map((o) => h('option', { value: o.k }, o.label)));
    const run = () => {
      out.innerHTML = '';
      if (!findSel.value) { out.append(h('p.small', 'Hakaðu við það sem er gefið og veldu hvað á að finna.')); return; }
      const r = RF.identify(gsel, findSel.value);
      out.append(h('h3', r.title), h('p', { html: RF.rich(r.text) }), r.warn.length ? h('ul.warnlist', r.warn.map((w) => h('li', { html: RF.rich(w) }))) : null, h('div.mgrid.compact', r.cards.map((c) => RF.methodCard(RF.method(c), { compact: true }))), h('div.btnrow', [...new Set(r.cards.flatMap((c) => RF.method(c).types))].map((tid) => h('a.btn.small', { href: '#/aefa/' + tid }, 'Æfa ' + tid))));
    };
    const chips = h('div.chips', RF.givenChips.map((c) => {
      const b = h('button.chipbtn', { type: 'button', 'aria-pressed': 'false', onclick: () => { gsel[c.k] = !gsel[c.k]; b.setAttribute('aria-pressed', gsel[c.k] ? 'true' : 'false'); run(); } }, c.label);
      b.dataset.k = c.k;
      return b;
    }));
    findSel.addEventListener('change', run);
    const quick = h('div.quick', RF.quickIds.map((qk) => h('button.btn.small.ghost', { type: 'button', onclick: () => { Object.keys(gsel).forEach((k) => delete gsel[k]); Object.assign(gsel, qk.g); chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', gsel[b.dataset.k] ? 'true' : 'false')); findSel.value = qk.find; run(); out.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }, '„' + qk.say + '“')));
    run();
    const matRows = Object.values(RF.materials).map((m) => h('tr', h('td', m.name), h('td.num', g(m.rho, 5)), h('td.num', m.alpha >= 0.001 ? g(m.alpha, 5) : '≈ 0'), h('td.small', (m.src === 'kennari' ? 'ρ: kennari' : 'ρ: almennt*') + ' · ' + (m.srcA === 'kennari' ? 'α: kennari' : 'α: almennt*')), h('td.small', m.use)));
    root.append(
      h('h1', 'Formúlur og flýtihjálp'), h('p.lead', 'Skipulagt eftir því hvað þú átt að finna. Sömu númer og litir eru á PDF-glósunum.'),
      h('section.panel.identify', h('h2', 'Hvaða dæmi er þetta?'), h('p', 'Hakaðu við það sem er gefið í dæminu:'), chips, h('label.inline', 'Ég á að finna: ', findSel), h('p.small', 'Eða veldu dæmigerða setningu:'), quick, out),
      h('h2', 'Ég á að finna …'), h('div.searchbar', search), grid, none,
      h('section.panel', h('h2', 'Eðlisviðnám og hitastuðlar (20 °C)'), h('div.tblwrap', h('table.tbl', h('thead', h('tr', h('th', 'Efni'), h('th', 'ρ (Ω·mm²/m)'), h('th', 'α (1/°C)'), h('th', 'Heimild'), h('th', 'Notkun'))), h('tbody', matRows))),
        h('p.small', '„Kennari“ = viðmiðunargildi úr kennslugögnum/forsendum kennarans. * = almennt viðmiðunargildi úr handbókum, ekki staðfest í upprunagögnunum. Í prófi skaltu nota töflu kennarans.')),
      h('section.panel', h('h2', 'Tákn og einingar'), h('div.tblwrap', h('table.tbl', h('thead', h('tr', h('th', 'Tákn'), h('th', 'Stærð'), h('th', 'Eining'))), h('tbody', [['R', 'Viðnám', 'Ω'], ['ρ', 'Eðlisviðnám (hró)', 'Ω·mm²/m'], ['G', 'Eðlisleiðni á glærum (víða σ eða γ)', 'S'], ['l', 'Lengd', 'm'], ['A', 'Þverflatarmál', 'mm²'], ['d (Φ)', 'Þvermál', 'mm'], ['r', 'Radíus = d/2', 'mm'], ['α', 'Hitastuðull (alfa)', '1/°C'], ['t_1, t_2', 'Upphafs- og lokahitastig', '°C'], ['Δt', 'Hitastigsbreyting', '°C'], ['R_{t1}, R_{t2}', 'Viðnám við t₁ og t₂', 'Ω'], ['I', 'Straumur', 'A'], ['U_1', 'Spenna spennugjafans', 'V'], ['U_2', 'Spenna á álagi', 'V'], ['ΔU', 'Spennufall', 'V'], ['R_l', 'Viðnám leiðslu', 'Ω']].map(([a, b, c]) => h('tr', h('td', { html: RF.rich(a) }), h('td', b), h('td', c))))))));
    if (arg) setTimeout(() => { const el = document.getElementById('m' + arg); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); el.focus(); } }, 60);
  };

  /* ============ PRÓFHERMIR ============ */
  let EXAM = null;
  function buildExam(cfg) {
    const items = [];
    const chs = cfg.chapters;
    const cPool = shuffle(RF.concepts.filter((c) => chs.includes(c.ch)));
    const tPool = RF.problemTypes.filter((t) => chs.includes(t.ch));
    let nCalc = tPool.length ? Math.round(cfg.n * (1 - cfg.conceptShare)) : 0;
    let nConc = cfg.n - nCalc;
    if (nConc > cPool.length) { nConc = cPool.length; nCalc = tPool.length ? cfg.n - nConc : 0; }
    cPool.slice(0, nConc).forEach((c) => items.push({ kind: 'c', id: c.id, order: shuffle(c.opts.map((_, i) => i)) }));
    const types = [];
    while (types.length < nCalc) types.push(...shuffle(tPool));
    types.slice(0, nCalc).forEach((t, i) => {
      const r = Math.random();
      const src = r < 0.15 ? 'orig' : { seed: RF.util.newSeed() + i, level: r < 0.4 ? 'lett' : r < 0.8 ? 'midl' : 'erf' };
      const pr = RF.makeProblem(t.id, src);
      items.push({ kind: 'p', key: pr.key, tid: t.id });
    });
    return { cfg, items: cfg.mixOrder ? shuffle(items) : items, answers: {}, flags: {}, idx: 0, start: Date.now(), end: cfg.minutes ? Date.now() + cfg.minutes * 60000 : null, done: false };
  }
  V.exam = (root, arg) => {
    if (arg === 'keyra' && EXAM && !EXAM.done) return examRun(root);
    if (arg === 'nidurstodur' && EXAM && EXAM.done) return examResults(root);
    const form = h('form.panel.exam-setup', { onsubmit: (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const chapters = fd.getAll('ch').map(Number);
      if (!chapters.length) { toast('Veldu a.m.k. einn kafla.'); return; }
      const n = +fd.get('n');
      const share = +fd.get('share') / 100;
      let minutes = fd.get('min');
      minutes = minutes === 'auto' ? Math.round(n * (share * 1.2 + (1 - share) * 5)) : +minutes;
      EXAM = buildExam({ n, conceptShare: share, chapters, minutes, mixOrder: true });
      location.hash = '#/prof/keyra';
    } },
      h('fieldset', h('legend', 'Fjöldi spurninga'), h('div.seg', [10, 15, 20].map((n) => h('label', h('input', { type: 'radio', name: 'n', value: n, checked: n === 15 ? true : null }), ' ' + n)))),
      h('fieldset', h('legend', 'Kaflar'), h('div.seg', RF.lessons.map((c) => h('label', h('input', { type: 'checkbox', name: 'ch', value: c.n, checked: true }), ' ' + c.n + '. ' + c.title)))),
      h('fieldset', h('legend', 'Hlutfall hugtakaspurninga'), (() => { const o = h('output', '30 %'); const r = h('input', { type: 'range', name: 'share', min: 0, max: 100, step: 10, value: 30, 'aria-label': 'Hlutfall hugtakaspurninga' }); r.addEventListener('input', () => (o.textContent = r.value + ' % hugtök · ' + (100 - r.value) + ' % reiknidæmi')); o.textContent = '30 % hugtök · 70 % reiknidæmi'; return h('div.slider', r, o); })()),
      h('fieldset', h('legend', 'Tímamörk'), h('select', { name: 'min', 'aria-label': 'Tímamörk' }, h('option', { value: 'auto' }, 'Ráðlagt (≈ 1 mín. á hugtak, 5 mín. á reiknidæmi)'), [0, 15, 20, 30, 45, 60, 90].map((m) => h('option', { value: m }, m ? m + ' mínútur' : 'Engin tímamörk')))),
      h('ul.small', h('li', 'Engin hjálp og engar lausnir fyrr en prófinu lýkur.'), h('li', 'Hægt er að merkja spurningar og fara fram og til baka.'), h('li', 'Töflugildi (ρ, α) birtast með reiknidæmum, eins og tafla í prófi.'), h('li', 'Þetta er æfingapróf byggt á dæmum kennarans – ekki afrit af raunverulegu prófi.')),
      h('button.btn.primary.big', { type: 'submit' }, 'Hefja æfingapróf'));
    root.append(h('h1', 'Taktu æfingapróf'), h('p.lead', 'Blandaðar hugtakaspurningar og reiknidæmi, líkt og í prófi.'), form,
      S().exams.length ? h('section.panel', h('h2', 'Fyrri próf'), h('table.tbl', h('thead', h('tr', h('th', 'Dags.'), h('th', 'Spurningar'), h('th', 'Einkunn'))), h('tbody', S().exams.slice(-8).reverse().map((e) => h('tr', h('td', new Date(e.at).toLocaleString('is-IS', { dateStyle: 'short', timeStyle: 'short' })), h('td', String(e.n)), h('td', g(e.grade, 1))))))) : null);
  };
  function examRun(root) {
    const E = EXAM;
    const timer = h('div.timer', { role: 'timer', 'aria-live': 'off' });
    const nav = h('nav.qnav', { 'aria-label': 'Spurningar' });
    const host = h('div.qhost');
    const flagBtn = h('button.btn', { type: 'button', onclick: () => { E.flags[E.idx] = !E.flags[E.idx]; draw(); } });
    const prev = h('button.btn', { type: 'button', onclick: () => { if (E.idx > 0) { E.idx--; draw(); } } }, '← Fyrri');
    const next = h('button.btn.primary', { type: 'button', onclick: () => { if (E.idx < E.items.length - 1) { E.idx++; draw(); } else submitBtn.focus(); } }, 'Næsta →');
    const submitBtn = h('button.btn.danger', { type: 'button', onclick: () => finish(false) }, 'Skila prófi');
    const answered = (i) => { const a = E.answers[i]; if (a == null) return false; if (typeof a === 'object' && !Array.isArray(a)) return Object.values(a).some((v) => String(v).trim()); return Array.isArray(a) ? a.length > 0 : true; };
    function draw() {
      nav.innerHTML = '';
      E.items.forEach((it, i) => nav.append(h('button', { type: 'button', class: (i === E.idx ? 'cur ' : '') + (answered(i) ? 'done ' : '') + (E.flags[i] ? 'flag' : ''), 'aria-label': 'Spurning ' + (i + 1) + (answered(i) ? ', svarað' : '') + (E.flags[i] ? ', merkt' : ''), 'aria-current': i === E.idx ? 'true' : null, onclick: () => { E.idx = i; draw(); } }, String(i + 1))));
      host.innerHTML = '';
      const it = E.items[E.idx];
      host.append(h('p.qcount', 'Spurning ' + (E.idx + 1) + ' af ' + E.items.length + (it.kind === 'p' ? ' · reiknidæmi' : ' · hugtak')));
      if (it.kind === 'c') host.append(RF.conceptView(RF.concept(it.id), { exam: true, order: it.order, answer: E.answers[E.idx], onChange: (v) => { E.answers[E.idx] = v; refreshNav(); } }).el);
      else host.append(RF.problemView(RF.problemFromKey(it.key), { mode: 'exam', answers: (E.answers[E.idx] = E.answers[E.idx] || {}), onChange: () => refreshNav() }).el);
      flagBtn.textContent = E.flags[E.idx] ? '⚑ Merkt – afmerkja' : '⚐ Merkja til að skoða aftur';
      flagBtn.setAttribute('aria-pressed', E.flags[E.idx] ? 'true' : 'false');
      prev.disabled = E.idx === 0;
      next.textContent = E.idx === E.items.length - 1 ? 'Síðasta spurning' : 'Næsta →';
      const first = host.querySelector('input,select');
      if (first) first.focus({ preventScroll: true });
    }
    function refreshNav() { nav.querySelectorAll('button').forEach((b, i) => b.classList.toggle('done', answered(i))); }
    function tick() {
      if (!document.body.contains(timer)) { clearInterval(iv); return; }
      if (!E.end) { const s = Math.floor((Date.now() - E.start) / 1000); timer.textContent = '⏱ ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); return; }
      const left = Math.max(0, Math.round((E.end - Date.now()) / 1000));
      timer.textContent = '⏱ ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + ' eftir';
      timer.classList.toggle('low', left < 120);
      if (left === 0) { clearInterval(iv); finish(true); }
    }
    function finish(auto) {
      const un = E.items.filter((_, i) => !answered(i)).length;
      if (!auto && un && !RF.dom.confirmBox('Þú hefur ekki svarað ' + un + ' spurningu' + (un > 1 ? 'm' : '') + '. Skila samt?')) return;
      clearInterval(iv);
      gradeExam(E);
      if (auto) toast('Tíminn er búinn – prófinu var skilað.');
      location.hash = '#/prof/nidurstodur';
    }
    const iv = setInterval(tick, 1000);
    tick();
    root.append(h('div.exam-top', h('h1', 'Æfingapróf'), timer), nav, host, h('div.exam-bar', prev, flagBtn, next, submitBtn));
    draw();
  }
  function gradeExam(E) {
    E.done = true;
    E.results = E.items.map((it, i) => {
      if (it.kind === 'c') {
        const c = RF.concept(it.id), a = E.answers[i];
        const ok = a != null && (!Array.isArray(a) || a.length) && RF.conceptCorrect(c, a);
        RF.store.recordConcept(c.id, ok);
        return { score: ok ? 1 : 0, cat: c.cat };
      }
      const prob = RF.problemFromKey(it.key);
      const res = RF.checkProblem(prob, E.answers[i] || {});
      RF.store.recordProblem(prob, res, false);
      const t = RF.ptype(it.tid);
      return { score: res.score, cat: t.fam === 'T' ? 'hiti' : t.ch === 3 ? 'vidnam' : 'spennufall', res };
    });
    const total = E.results.reduce((a, r) => a + r.score, 0);
    E.pct = total / E.items.length;
    E.grade = Math.round(E.pct * 100) / 10;
    const st = S();
    st.exams.push({ at: Date.now(), n: E.items.length, grade: E.grade, pct: E.pct });
    st.wrong = E.items.filter((_, i) => E.results[i].score < 0.999).map((it) => (it.kind === 'c' ? { kind: 'c', id: it.id } : { kind: 'p', key: it.key }));
    RF.store.save();
  }
  function examResults(root) {
    const E = EXAM;
    const byCat = {};
    E.results.forEach((r) => { (byCat[r.cat] = byCat[r.cat] || { n: 0, s: 0 }); byCat[r.cat].n++; byCat[r.cat].s += r.score; });
    const wrongTypes = [...new Set(E.items.filter((it, i) => it.kind === 'p' && E.results[i].score < 0.999).map((it) => it.tid))];
    const cards = [...new Set(wrongTypes.flatMap((tid) => RF.ptype(tid).cards))].sort((a, b) => a - b);
    const review = E.items.map((it, i) => {
      const r = E.results[i];
      const status = r.score >= 0.999 ? 'good' : r.score > 0 ? 'mid' : 'bad';
      if (it.kind === 'c') {
        const c = RF.concept(it.id), a = E.answers[i];
        const yours = a == null || (Array.isArray(a) && !a.length) ? 'Ekkert svar' : [].concat(a).map((k) => c.opts[k]).join(', ');
        const right = [].concat(c.a).map((k) => c.opts[k]).join(', ');
        return h('details.review.' + status, { open: status !== 'good' ? true : null }, h('summary', h('span.rnum', String(i + 1)), ' ', c.q, ' ', h('b', status === 'good' ? '✓' : '✗')),
          h('p', h('b', 'Þitt svar: '), yours), h('p', h('b', 'Rétt svar: '), right), h('p.small', { html: RF.rich(c.ex) }));
      }
      const prob = RF.problemFromKey(it.key), t = RF.ptype(it.tid), parts = t.parts(prob.p);
      return h('details.review.' + status, { open: status !== 'good' ? true : null }, h('summary', h('span.rnum', String(i + 1)), ' ', famChip(t.fam, t.id), ' ', t.title, ' ', h('b', Math.round(r.score * 100) + ' %')),
        h('p.pb-q', prob.text),
        h('table.tbl', h('thead', h('tr', h('th', 'Liður'), h('th', 'Þitt svar'), h('th', 'Rétt'), h('th', 'Athugasemd'))), h('tbody', r.res.parts.map((pr) => { const pt = parts.find((x) => x.k === pr.k); const ans = (E.answers[i] || {})[pr.k]; return h('tr', { class: pr.status }, h('td', { html: RF.rich(pt.label) }), h('td', ans ? (pt.kind === 'choice' ? RF.valueText(pt, ans) : ans + ' ' + (pt.unit || '')) : '–'), h('td', RF.valueText(pt, pr.expected)), h('td.small', { html: RF.rich(pr.msg) })); }))),
        h('details', h('summary', 'Full lausn með útskýringum'), RF.stepsView(t.solve(prob.p).steps)));
    });
    root.append(h('h1', 'Niðurstöður æfingaprófs'),
      h('div.score-hero', h('div.grade', h('span', g(E.grade, 1)), h('small', 'einkunn')), h('div', h('p.big', Math.round(E.pct * 100) + ' % rétt'), h('p', E.results.filter((r) => r.score >= 0.999).length + ' af ' + E.items.length + ' spurningum alveg réttar.'), h('div.btnrow', S().wrong.length ? h('button.btn.primary', { type: 'button', onclick: () => RF.startWrongSession() }, 'Æfa aðeins það sem ég gerði rangt') : null, h('a.btn', { href: '#/prof', onclick: () => { EXAM = null; } }, 'Nýtt próf')))),
      h('section.panel', h('h2', 'Sundurliðun eftir efnisflokkum'), h('div.catbars', Object.entries(byCat).map(([k, v]) => h('div.catbar', h('span', RF.cats[k].name), bar(v.s / v.n, RF.cats[k].name), h('span.small', Math.round((v.s / v.n) * 100) + ' % (' + v.n + ')'))))),
      cards.length ? h('section.panel', h('h2', 'Formúlur sem þú þarft að æfa'), h('div.mgrid.compact', cards.map((c) => RF.methodCard(RF.method(c), { compact: true }))), h('h3', 'Tillaga að næstu æfingum'), h('div.btnrow', wrongTypes.map((tid) => h('a.btn', { href: '#/aefa/' + tid }, tid + ' – ' + RF.ptype(tid).short)))) : h('section.panel', h('h2', 'Engin reiknidæmi röng – vel gert!')),
      h('section', h('h2', 'Yfirferð – hvar gerðir þú mistök?'), review));
  }
})();

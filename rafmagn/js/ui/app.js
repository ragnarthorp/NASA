/* Forsíða, framvinda, gátlisti, prófundirbúningur, æfingalotur, glósugerð og leiðarkerfi (hash-router). */
(function () {
  const RF = window.RF;
  const { h, $, toast, download, shuffle, famChip } = RF.dom;
  const g = RF.util.fmt;
  const V = RF.views;
  const S = () => RF.store.get();
  const { pct, bar } = RF.ui;

  /* ============ FORSÍÐA ============ */
  V.home = (root) => {
    const T = RF.store.totals();
    const weak = RF.store.weakest()[0];
    const sug = RF.store.suggestions(4);
    const tiles = [
      ['#/laera', '📘', 'Byrja að læra', 'Fjórir kaflar með myndum og spurningum'],
      ['#/aefa', '🧮', 'Æfa reiknidæmi', '13 dæmagerðir kennarans + ný afbrigði'],
      ['#/prof', '📝', 'Taka æfingapróf', '10–20 spurningar með tímamörkum'],
      ['#/formulur', '🔎', 'Formúlur og flýtihjálp', '„Ég á að finna …“ og „Hvaða dæmi er þetta?“'],
      ['#/glosur', '✍️', 'Búa til prófglósur', 'Veldu formúlur, athugasemdir og dæmi'],
      ['#/glosur/pdf', '📄', 'Sækja PDF', 'Dæmaleiðarvísir, formúlublað, prófglósur'],
      ['#/framvinda', '📈', 'Mín framvinda', 'Gátlisti og færni í hverri dæmagerð'],
      ['#/undirbuningur', '⏱️', 'Prófundirbúningur', '30 mín, 1 klst., 2 klst. eða veikustu atriðin'],
    ];
    root.append(
      h('section.hero', h('h1', 'Prófundirbúningur – Rafmagnsfræði 1'), h('p.sub', 'Lærðu efnið, æfðu dæmin og mættu undirbúin/n í prófið.'), h('p.small', 'Rafleiðarar · viðnám, leiðni og spennuföll · Rafbók kaflar 3, 4 og 6 og efni frá kennara (3.3, 3.3.1, 3.4, 3.4.1)')),
      h('nav.tiles', { 'aria-label': 'Aðalval' }, tiles.map(([href, ic, t, d]) => h('a.tile-link', { href }, h('span.ic', { 'aria-hidden': 'true' }, ic), h('b', t), h('span', d)))),
      h('section.status', { 'aria-label': 'Staða þín' },
        h('div.stat', h('span.n', T.learned + '/' + T.sections), h('span', 'kennsluhlutar lærðir')),
        h('div.stat', h('span.n', String(T.correct)), h('span', 'rétt svör (' + T.answered + ' svarað)')),
        h('div.stat', h('span.n', weak ? RF.cats[weak.k].name : '–'), h('span', weak ? 'erfiðast núna (' + pct(weak.acc) + ' rétt)' : 'erfiðast – svaraðu fleiri spurningum')),
        h('div.stat', h('span.n', S().exams.length ? g(S().exams[S().exams.length - 1].grade, 1) : '–'), h('span', 'einkunn í síðasta prófi'))),
      h('section.panel', h('h2', 'Næst skaltu …'), h('ul.suggest', sug.map((s) => h('li', h('a', { href: s.kind === 'type' ? '#/aefa/' + s.id : s.kind === 'lesson' ? '#/laera/' + s.id : s.kind === 'cat' ? '#/hugtok/' + s.id : s.kind === 'wrong' ? '#/lota/rangt' : '#/prof' }, s.text), h('span.small', ' – ' + s.why))))),
      h('section.panel.sources', h('h2', 'Um námsefnið'), h('p', 'Æfingadæmin, svörin og formúlurnar eru byggð á glærum kennarans: 3.3 Viðnám, 3.3.1 (6 dæmi + svör), 3.4 Spennufall og 3.4.1 (7 dæmi + svör).'),
        h('p.small', 'Glærur 3.1, 3.1.1, 3.2 og 3.2.1 (flokkar og yfirlit), verklegar æfingar 3.3.2/3.4.2, kaflar Rafbókar og einstaklingsverkefnið úr kennslustund fylgdu ekki með. Efni um flokkun rafleiðara er því merkt „óstaðfest“. ', h('a', { href: '#/um' }, 'Nánar um heimildir og leiðréttar prentvillur.'))));
  };

  /* ============ UM / HEIMILDIR ============ */
  V.about = (root) => {
    root.append(h('h1', 'Um vefinn og heimildir'),
      h('section.panel', h('h2', 'Upprunagögn sem voru notuð'), h('ul', ['3.3 Rafleiðarar – viðnám (glærur, 12 bls.)', '3.3.1 Viðnám – 6 æfingadæmi með handskrifuðum svörum kennarans', '3.4 Rafleiðarar – spennufall (glærur, 21 bls.)', '3.4.1 Spennufall – 7 æfingadæmi', '3.4.1 Spennufall – svör kennarans'].map((x) => h('li', x)))),
      h('section.panel', h('h2', 'Efni sem vantaði (óstaðfest)'), h('ul', ['3.1 Rafleiðarar – flokkar og 3.1.1 spurningar/svör', '3.2 Rafleiðarar – yfirlit og 3.2.1 spurningar/svör', '3.3.2 og 3.4.2 verklegar mælingar', 'Rafbók, kaflar 3, 4 og 6', 'Einstaklingsverkefnið úr kennslustund', 'Tafla kennarans yfir eðlisviðnám (gildin sem notuð eru koma úr forsendum verkefnisins og úr glærunum)'].map((x) => h('li', x))),
        h('p', 'Kafli 1 (flokkun) og hluti af kafla 2 byggja því á almennri þekkingu og eru merkt „óstaðfest“. Berðu þau saman við glærur kennarans.')),
      h('section.panel', h('h2', 'Leiðréttar prentvillur'), h('ol',
        h('li', h('b', '3.3.1, dæmi 5: '), 'Í vélrituðu formúlunni stendur Δt = (R_t2 − R_t1)/(R_t2·α) + t1. Rétt er að deila með upphafsviðnáminu R_t1·α (og „+ t1“ gefur lokahitastigið, ekki Δt). Útreikningur kennarans notar réttilega 8,5·0,0039 → 65,25 °C. Staðfest í upprunaskjalinu.'),
        h('li', h('b', '3.4.1, dæmi 3: '), 'Formúlan á svarglærunni er % = ΔU/U₁ án ·100. Rétt: % = ΔU/U₁·100. Staðfest í upprunaskjalinu (glæra 3.4 sýnir réttu formúluna).'),
        h('li', h('b', '3.2.1: '), 'Bent var á að þar komi önnur flatarmálsformúla fram. Sú glæra fylgdi ekki – óstaðfest. Á vefnum er alls staðar notað A = π·d²/4 = π·r².'),
        h('li', h('b', '3.4.1, dæmi 5: '), 'Á svarglærunni er R námundað í 0,13 Ω, sem gefur 24,6 mm². Nákvæmt svar er 24,03 mm² (veljum 25 mm²). Bæði svörin teljast rétt í sjálfvirkri yfirferð, með ábendingu.'),
        h('li', h('b', 'Eining eðlisviðnáms: '), 'Á glærum stendur „Ohm“. Fullgild eining er Ω·mm²/m.'))),
      h('section.panel', h('h2', 'Tæknilegt'), h('p', 'Vefurinn er statískur (HTML, CSS, JavaScript) og þarf enga innskráningu. Framvinda vistast á tækinu. PDF-skjöl eru búin til í vafranum með jsPDF (fylgir vefnum) og innfelldu letri sem styður íslenska stafi og grísk tákn.')));
  };

  /* ============ FRAMVINDA OG GÁTLISTI ============ */
  V.progress = (root) => {
    const T = RF.store.totals();
    const fileIn = h('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: () => {
      const file = fileIn.files[0]; if (!file) return;
      file.text().then((txt) => { try { RF.store.importJSON(txt); toast('Framvinda flutt inn.'); RF.route(true); } catch (e) { toast('Villa: ' + e.message); } });
    } });
    root.append(h('h1', 'Mín framvinda'),
      h('section.status', h('div.stat', h('span.n', T.learned + '/' + T.sections), h('span', 'kennsluhlutar')), h('div.stat', h('span.n', T.solved + '/' + T.tries), h('span', 'reiknidæmi rétt / reynd')), h('div.stat', h('span.n', T.conceptOk + '/' + T.conceptTries), h('span', 'hugtakaspurningar rétt / svarað')), h('div.stat', h('span.n', String(S().exams.length)), h('span', 'æfingapróf'))),
      h('section.panel', h('h2', 'Gátlisti yfir prófefni'), h('p.small', 'Merktu við sjálf/ur. „Get leyst án hjálpar“ og „tilbúin/n“ eru aðeins staðfest þegar frammistaða í verkefnum styður það (✔ = staðfest af frammistöðu, ! = ekki enn sýnt í verkefnum).'), checklist()),
      h('section.panel', h('h2', 'Færni í dæmagerðum'), h('div.tblwrap', h('table.tbl.mastery', h('thead', h('tr', h('th', 'Dæmagerð'), h('th', 'Færni'), h('th', 'Rétt án hjálpar'), h('th', 'Rétt með hjálp'), h('th', 'Síðustu tilraunir'), h('th', ''))),
        h('tbody', RF.problemTypes.map((t) => { const s = S().types[t.id] || { tries: 0, solo: 0, assisted: 0, history: [] }; const m = RF.store.typeMastery(t.id); return h('tr', h('td', famChip(t.fam, t.id), ' ', t.short), h('td', bar(m || 0, 'Færni'), ' ', pct(m)), h('td.num', String(s.solo)), h('td.num', String(s.assisted)), h('td', h('span.hist', { 'aria-label': s.history.map((x) => ({ s: 'rétt', h: 'rétt með hjálp', p: 'að hluta', x: 'rangt' }[x])).join(', ') || 'engar' }, s.history.map((x) => h('i.' + x)))), h('td', h('a.btn.small', { href: '#/aefa/' + t.id }, 'Æfa'))); }))))),
      h('section.panel', h('h2', 'Efnisflokkar'), h('div.catbars', Object.entries(RF.cats).map(([k, c]) => { const s = RF.store.catStats(k); return h('div.catbar', h('span', c.name), bar(s.acc || 0, c.name), h('span.small', s.tries ? pct(s.acc) + ' (' + s.tries + ')' : 'engin gögn')); }))),
      h('section.panel', h('h2', 'Vistun'), h('p', 'Framvindan vistast sjálfkrafa á þessu tæki. Til að færa hana á annað tæki: sæktu skrána og opnaðu hana þar.'),
        h('div.btnrow', h('button.btn', { type: 'button', onclick: () => download(new Blob([RF.store.exportJSON()], { type: 'application/json' }), 'rafmagnsfraedi-framvinda.json') }, 'Flytja út framvindu (JSON)'), h('button.btn', { type: 'button', onclick: () => fileIn.click() }, 'Flytja inn framvindu'), h('button.btn.danger', { type: 'button', onclick: () => { if (RF.dom.confirmBox('Eyða allri framvindu á þessu tæki?')) { RF.store.reset(); RF.route(true); toast('Framvindu eytt.'); } } }, 'Byrja upp á nýtt')), fileIn));
  };
  function checklist() {
    const wrap = h('div.checklist');
    RF.checkTopics.forEach((tp) => {
      const st = RF.store.topicStatus(tp);
      const ev = st.ev;
      const evText = ev.kind === 'concept' ? (ev.tries ? 'Hugtakaspurningar: ' + pct(ev.acc) + ' rétt (' + ev.tries + ' svör)' : 'Engar hugtakaspurningar enn') : 'Dæmagerðir ' + tp.types.join(', ') + ': ' + ev.typesSolo + '/' + ev.totalTypes + ' leystar án hjálpar';
      const row = h('div.ck-row', { class: st.ready ? 'ready' : '' },
        h('div.ck-title', h('b', tp.title), h('span.small', evText), st.ready ? h('span.badge.good', 'Tilbúin/n') : null),
        h('div.ck-levels', st.levels.map((l) => {
          const cb = h('input', { type: 'checkbox', checked: l.claimed ? true : null });
          cb.addEventListener('change', () => { const c = (S().checklist[tp.id] = S().checklist[tp.id] || {}); c[l.k] = cb.checked; RF.store.save(); row.replaceWith(checklist().querySelector('[data-id="' + tp.id + '"]')); });
          const mark = l.verified === true ? h('span.ver.ok', { title: 'Staðfest af frammistöðu' }, '✔') : l.verified === false && l.claimed ? h('span.ver.no', { title: 'Ekki enn sýnt í verkefnum' }, '!') : null;
          return h('label.ck', cb, ' ', l.label, mark);
        })),
        !st.ready ? h('div.ck-todo.small', todoText(tp, st)) : null);
      row.dataset.id = tp.id;
      wrap.append(row);
    });
    return wrap;
  }
  function todoText(tp, st) {
    const ev = st.ev;
    if (ev.kind === 'concept') return ev.solo ? 'Merktu við sjálfsmatið.' : 'Eftir: svaraðu a.m.k. 5 spurningum í „' + RF.cats[tp.cat].name + '“ með 80 % rétt.';
    const left = tp.types.filter((id) => !(S().types[id] && S().types[id].solo));
    return left.length ? 'Eftir: leystu ' + left.join(', ') + ' rétt án hjálpar.' : 'Merktu við sjálfsmatið.';
  }

  /* ============ ÆFINGALOTUR (prófundirbúningur og „það sem var rangt“) ============ */
  let SESSION = null;
  RF.startSession = (sess) => { SESSION = { ...sess, b: 0, i: 0, started: Date.now(), blockStart: Date.now(), log: [] }; S().lastPlan = sess; RF.store.save(); location.hash = '#/lota/keyra'; RF.route(true); };
  RF.startWrongSession = () => {
    const w = S().wrong;
    if (!w.length) { toast('Ekkert rangt til að æfa – vel gert!'); return; }
    const items = w.map((x) => (x.kind === 'c' ? { kind: 'c', id: x.id } : { kind: 'p', key: x.key }));
    const tids = [...new Set(w.filter((x) => x.kind === 'p').map((x) => x.key.split(':')[0]))];
    const blocks = [{ title: 'Sömu spurningar og voru rangar', minutes: Math.max(5, items.length * 3), items }];
    if (tids.length) blocks.push({ title: 'Sama aðferð, nýjar tölur', minutes: tids.length * 4, items: tids.map((tid) => ({ kind: 'p', gen: tid, level: 'midl' })) });
    blocks.push({ title: 'Yfirferð formúla', minutes: 3, items: [{ kind: 'review', tids }] });
    RF.startSession({ title: 'Æfa það sem ég gerði rangt', blocks });
  };
  function planFor(time, focus) {
    const m = (tid) => { const x = RF.store.typeMastery(tid); return x === null ? 0.35 : x; };
    const sortTypes = (ids) => (focus === 'weak' ? ids.slice().sort((a, b) => m(a) - m(b)) : shuffle(ids));
    const V_ = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'], S_ = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
    const cats = Object.keys(RF.cats).map((k) => ({ k, ...RF.store.catStats(k) }));
    const conceptPool = (n) => {
      let pool = RF.concepts.slice();
      if (focus === 'weak') pool.sort((a, b) => { const sa = S().concepts[a.id], sb = S().concepts[b.id]; const ra = sa ? sa.correct / sa.tries : 0.5, rb = sb ? sb.correct / sb.tries : 0.5; return ra - rb; });
      else pool = shuffle(pool);
      return pool.slice(0, n).map((c) => ({ kind: 'c', id: c.id }));
    };
    const probs = (ids, n, lv) => sortTypes(ids).slice(0, n).map((tid, i) => ({ kind: 'p', gen: tid, level: lv || (i % 3 === 2 ? 'erf' : 'midl') }));
    const P = {
      30: [[5, 'Hugtök og flokkun', conceptPool(5)], [10, 'Viðnámsdæmi', probs(V_, 2)], [10, 'Spennufallsdæmi', probs(S_, 2)], [5, 'Yfirferð á mistökum og formúlum', null]],
      60: [[10, 'Hugtök og flokkun', conceptPool(8)], [20, 'Viðnámsdæmi', probs(V_, 4)], [20, 'Spennufallsdæmi', probs(S_, 4)], [10, 'Yfirferð á mistökum og formúlum', null]],
      120: [[15, 'Hugtök og flokkun', conceptPool(12)], [40, 'Viðnámsdæmi', probs(V_, 6)], [45, 'Spennufallsdæmi', probs(S_, 7)], [20, 'Yfirferð á mistökum og formúlum', null]],
      all: [[20, 'Öll hugtök – blandað', conceptPool(RF.concepts.length)], [40, 'Allar viðnámsdæmagerðir (V1–V6)', V_.map((tid) => ({ kind: 'p', gen: tid, level: 'midl' }))], [50, 'Allar spennufallsdæmagerðir (S1–S7)', S_.map((tid) => ({ kind: 'p', gen: tid, level: 'midl' }))], [15, 'Yfirferð á mistökum og formúlum', null]],
    }[time];
    const weakTids = sortTypes([...V_, ...S_]).slice(0, 4);
    return { title: { 30: '30 mínútna æfing', 60: '60 mínútna æfing', 120: 'Tveggja klukkustunda æfing', all: 'Allt efnið' }[time] + (focus === 'weak' ? ' – veikustu atriðin' : ''), blocks: P.map(([min, title, items]) => ({ title, minutes: min, items: items || [{ kind: 'review', tids: weakTids }] })), cats };
  }
  V.prep = (root) => {
    const st = { time: 60, focus: 'all' };
    const out = h('div');
    const draw = () => {
      const plan = planFor(st.time, st.focus);
      out.innerHTML = '';
      out.append(h('section.panel.plan', h('h2', plan.title), h('ol.plan-blocks', plan.blocks.map((b) => h('li', h('span.min', b.minutes + ' mín.'), h('b', b.title), h('span.small', ' – ' + b.items.map((it) => (it.kind === 'c' ? null : it.kind === 'review' ? 'aðferðaspjöld + mistök' : it.gen)).filter(Boolean).join(', ') + (b.items.some((it) => it.kind === 'c') ? b.items.filter((it) => it.kind === 'c').length + ' hugtakaspurningar' : ''))))),
        h('button.btn.primary.big', { type: 'button', onclick: () => RF.startSession(plan) }, 'Byrja lotuna núna')));
    };
    const seg = (name, opts, key) => h('div.seg', { role: 'radiogroup', 'aria-label': name }, opts.map(([v, label]) => h('label', h('input', { type: 'radio', name: key, value: v, checked: st[key] === v ? true : null, onchange: () => { st[key] = v; draw(); } }), ' ' + label)));
    root.append(h('h1', 'Prófundirbúningur'), h('p.lead', 'Fyrir síðustu dagana fyrir prófið. Veldu tíma og áherslu – kerfið setur saman æfingalotu.'),
      h('section.panel', h('h2', 'Hvað hefur þú mikinn tíma?'), seg('Tími', [[30, 'Ég hef 30 mínútur'], [60, 'Ég hef eina klukkustund'], [120, 'Ég hef tvær klukkustundir'], ['all', 'Ég ætla að æfa allt efnið']], 'time'),
        h('h2', 'Áhersla'), seg('Áhersla', [['all', 'Blandað – allt efnið'], ['weak', 'Ég vil aðeins æfa veikustu atriðin']], 'focus')), out,
      S().wrong.length ? h('p', h('button.btn', { type: 'button', onclick: () => RF.startWrongSession() }, 'Eða: æfa það sem var rangt í síðasta prófi (' + S().wrong.length + ')')) : null);
    draw();
  };
  V.session = (root, arg) => {
    if (arg === 'rangt') { RF.startWrongSession(); if (!S().wrong.length) location.hash = '#/'; return; }
    if (!SESSION) { root.append(h('h1', 'Engin lota í gangi'), h('p', h('a.btn.primary', { href: '#/undirbuningur' }, 'Setja saman æfingalotu'))); return; }
    const Z = SESSION;
    const block = Z.blocks[Z.b];
    if (!block) {
      const ok = Z.log.filter((x) => x).length;
      root.append(h('h1', 'Lotu lokið!'), h('p.big', ok + ' af ' + Z.log.length + ' atriðum rétt.'), h('div.btnrow', h('a.btn.primary', { href: '#/prof' }, 'Taka æfingapróf'), h('a.btn', { href: '#/framvinda' }, 'Sjá framvindu'), h('a.btn', { href: '#/' }, 'Forsíða')));
      SESSION = null;
      return;
    }
    const item = block.items[Z.i];
    const elapsed = Math.floor((Date.now() - Z.blockStart) / 60000);
    const head = h('div.session-head', h('p.small', Z.title + ' · hluti ' + (Z.b + 1) + ' af ' + Z.blocks.length), h('h1', block.title), h('div.session-meta', h('span', 'Atriði ' + (Z.i + 1) + ' af ' + block.items.length), h('span', '⏱ ' + elapsed + ' / ' + block.minutes + ' mín.'), elapsed >= block.minutes ? h('span.badge.warn', 'Tíminn fyrir þennan hluta er liðinn') : null), h('div.bar', h('span', { style: { width: Math.round(((Z.i) / block.items.length) * 100) + '%' } })));
    const advance = () => { Z.i++; if (Z.i >= block.items.length) { Z.b++; Z.i = 0; Z.blockStart = Date.now(); } RF.route(true); window.scrollTo(0, 0); };
    const skipBlock = h('button.btn.small.ghost', { type: 'button', onclick: () => { Z.b++; Z.i = 0; Z.blockStart = Date.now(); RF.route(true); } }, 'Sleppa restinni af þessum hluta');
    root.append(head);
    if (item.kind === 'c') {
      const nb = h('button.btn.primary', { type: 'button', hidden: true, onclick: advance }, 'Áfram →');
      root.append(RF.conceptView(RF.concept(item.id), { onResult: (ok) => { Z.log.push(ok); nb.hidden = false; nb.focus(); } }).el, nb);
    } else if (item.kind === 'p') {
      const prob = item.key ? RF.problemFromKey(item.key) : RF.makeProblem(item.gen, { seed: (item.seed = item.seed || RF.util.newSeed()), level: item.level });
      let logged = false;
      root.append(RF.problemView(prob, { onResult: (res) => { if (!logged) { Z.log.push(res.score >= 0.999); logged = true; } }, onNext: advance, nextLabel: 'Áfram í lotunni →' }).el, h('p', h('button.btn.ghost', { type: 'button', onclick: () => { if (!logged) Z.log.push(false); advance(); } }, 'Sleppa þessu dæmi')));
    } else {
      const tids = item.tids && item.tids.length ? item.tids : ['S1', 'V5'];
      const cards = [...new Set(tids.flatMap((tid) => RF.ptype(tid).cards))];
      const wrongLog = Object.entries(S().types).filter(([, v]) => v.history.slice(-3).includes('x')).map(([k]) => k);
      root.append(h('p', 'Farðu yfir aðferðaspjöldin fyrir þær dæmagerðir sem þú átt erfiðast með. Lestu formúluna upphátt, lokaðu augunum og skrifaðu hana eftir minni.'),
        h('div.mgrid', cards.map((c) => RF.methodCard(RF.method(c)))),
        wrongLog.length ? h('section.panel', h('h2', 'Nýleg mistök'), h('ul', wrongLog.map((tid) => h('li', h('a', { href: '#/aefa/' + tid }, tid + ' – ' + RF.ptype(tid).title), ': ', RF.ptype(tid).mistakes(RF.ptype(tid).original.p).slice(-2).map((x) => x.msg).join(' '))))) : null,
        h('button.btn.primary', { type: 'button', onclick: advance }, 'Ljúka hlutanum →'));
    }
    root.append(h('p', skipBlock));
  };

  /* ============ GLÓSUR OG PDF ============ */
  V.notes = (root, arg) => {
    const N = S().notes;
    const save = () => { RF.store.save(); preview(); };
    const pv = h('div.a4preview', { 'aria-label': 'Forskoðun glósa' });
    const warn = h('p.small', { 'aria-live': 'polite' });
    function preview() {
      pv.innerHTML = '';
      pv.append(h('h3', N.title || 'Mínar prófglósur'));
      const chosen = RF.methods.filter((m) => N.cards.includes(m.id));
      pv.append(h('div.pv-cards', chosen.map((m) => h('div.pv-card.fam-b-' + m.fam, { class: N.forget.includes(m.id) ? 'starred' : '' }, h('b', (N.forget.includes(m.id) ? '★ ' : '') + m.id + '. ' + m.find), h('div', { html: RF.m(m.formula) }), m.alt.slice(0, 2).map((a) => h('div.small', { html: RF.rich(a) })), N.comments[m.id] ? h('div.pv-note', N.comments[m.id]) : null))));
      if (N.types.length) pv.append(h('div.pv-sec', h('b', 'Dæmagerðir: '), N.types.join(', ')));
      if (N.own.length) pv.append(h('div.pv-sec', h('b', 'Eigin dæmi: '), N.own.map((o) => o.title).join(' · ')));
      const est = RF.pdf ? RF.pdf.estimateNotes(N) : null;
      warn.textContent = est ? (est.pages > N.pages ? 'Athugið: efnið kemst ekki á ' + N.pages + ' bls. með læsilegu letri – PDF-skjalið verður ' + est.pages + ' bls. Fjarlægðu eitthvað eða veldu 2 bls.' : 'Kemst á ' + N.pages + ' bls. (leturstærð ' + Math.round(est.scale * 100) + ' %).') : '';
    }
    const cardRows = RF.methods.map((m) => {
      const inc = h('input', { type: 'checkbox', checked: N.cards.includes(m.id) ? true : null, 'aria-label': 'Hafa með: ' + m.find });
      inc.addEventListener('change', () => { N.cards = inc.checked ? [...N.cards, m.id].sort((a, b) => a - b) : N.cards.filter((x) => x !== m.id); save(); });
      const star = h('button.star', { type: 'button', 'aria-pressed': N.forget.includes(m.id) ? 'true' : 'false', title: 'Ég gleymi þessu oft – leggja áherslu á', 'aria-label': 'Gleymi oft: ' + m.find }, '★');
      star.addEventListener('click', () => { const on = !N.forget.includes(m.id); N.forget = on ? [...N.forget, m.id] : N.forget.filter((x) => x !== m.id); star.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on && !N.cards.includes(m.id)) { N.cards.push(m.id); inc.checked = true; } save(); });
      const note = h('input', { type: 'text', maxlength: 90, placeholder: 'Mín athugasemd (stutt)', value: N.comments[m.id] || '', 'aria-label': 'Athugasemd við ' + m.find });
      note.addEventListener('input', () => { N.comments[m.id] = note.value; save(); });
      return h('div.nrow.fam-b-' + m.fam, h('label', inc, ' ', h('span.mnum', String(m.id)), ' ', m.find, ' ', h('span', { html: RF.m(m.formula) })), star, note);
    });
    const typeBoxes = h('div.chips', RF.problemTypes.map((t) => { const b = h('button.chipbtn', { type: 'button', 'aria-pressed': N.types.includes(t.id) ? 'true' : 'false', onclick: () => { const on = !N.types.includes(t.id); N.types = on ? [...N.types, t.id] : N.types.filter((x) => x !== t.id); b.setAttribute('aria-pressed', on ? 'true' : 'false'); save(); } }, t.id + ' ' + t.short); return b; }));
    const ownList = h('ul.ownlist');
    const drawOwn = () => { ownList.innerHTML = ''; N.own.forEach((o, i) => ownList.append(h('li', h('b', o.title), ' – ', o.text, ' ', h('button.btn.small.ghost', { type: 'button', 'aria-label': 'Fjarlægja ' + o.title, onclick: () => { N.own.splice(i, 1); drawOwn(); save(); } }, 'Fjarlægja')))); };
    const ownT = h('input', { type: 'text', placeholder: 'Heiti, t.d. „Ofn 10 A“', maxlength: 40, 'aria-label': 'Heiti dæmis' });
    const ownX = h('textarea', { rows: 2, placeholder: 'Stutt lausn, t.d. ΔU = 10·0,4 = 4 V → U₂ = 216 V', maxlength: 220, 'aria-label': 'Texti dæmis' });
    const pages = h('div.seg', { role: 'radiogroup', 'aria-label': 'Blaðsíður' }, [1, 2].map((n) => h('label', h('input', { type: 'radio', name: 'pages', value: n, checked: N.pages === n ? true : null, onchange: () => { N.pages = n; save(); } }), ' ' + n + ' blaðsíð' + (n === 1 ? 'a' : 'ur'))));
    const titleIn = h('input', { type: 'text', value: N.title, maxlength: 60, 'aria-label': 'Titill glósa' });
    titleIn.addEventListener('input', () => { N.title = titleIn.value; save(); });
    const opt = (k, label) => { const c = h('input', { type: 'checkbox', checked: N[k] ? true : null }); c.addEventListener('change', () => { N[k] = c.checked; save(); }); return h('label', c, ' ' + label); };
    const busy = (btn, fn) => async () => { const t0 = btn.textContent; btn.disabled = true; btn.textContent = 'Bý til PDF …'; try { await fn(); } catch (e) { console.error(e); toast('Villa við PDF: ' + e.message); } btn.disabled = false; btn.textContent = t0; };
    const mkBtn = h('button.btn.primary.big', { type: 'button' }, 'Búa til mínar prófglósur (PDF)');
    mkBtn.addEventListener('click', busy(mkBtn, async () => { const r = await RF.pdf.myNotes(N); download(r.blob, 'minar-profglosur.pdf'); toast('PDF sótt: ' + r.pages + ' bls.'); }));
    const dl = (label, fn, name, file) => { const b = h('button.btn', { type: 'button' }, label); b.addEventListener('click', busy(b, async () => { const r = await RF.pdf[fn](); download(r.blob, name); toast('PDF sótt: ' + name); })); return h('div.pdfrow', b, h('a.small', { href: 'pdf/' + file, download: file }, 'eða forútbúin útgáfa')); };
    root.append(
      h('h1', arg === 'pdf' ? 'Sækja PDF' : 'Prófglósur'),
      h('section.panel#pdf', h('h2', 'Tilbúin PDF-skjöl (A4)'), h('div.pdfgrid',
        h('div', h('h3', 'Dæmaleiðarvísir – 38 bls.'), h('p.small', 'Einfaldast að byrja hér. Hvað stafirnir þýða, töflur (ρ, α, þvermál → mm², einingar), allar formúlur, hvaða dæmi er þetta – og tvær síður fyrir hverja dæmagerð.'), dl('Sækja dæmaleiðarvísi', 'studyGuide', 'daemaleidarvisir.pdf', 'daemaleidarvisir.pdf')),
        h('div', h('h3', 'Æfingapróf á blaði'), h('p.small', '5 hugtakaspurningar og 15 reiknidæmi með breyttum tölum, eins og frá kennara. Leystu með leiðarvísinum. Lausnablað aftast.'), dl('Sækja æfingapróf', 'practiceExam', 'aefingaprof.pdf', 'aefingaprof.pdf')),
        h('div', h('h3', 'Hvar er hvað?'), h('p.small', 'Hver dæmagerð: hvað á að finna, hvernig spurningin byrjar og á hvaða glæru skýringin og sýnidæmið eru.'), dl('Sækja yfirlit', 'sourceMap', 'hvar-er-hvad.pdf', 'hvar-er-hvad.pdf')),
        h('div', h('h3', 'Formúlublað – 1 bls.'), h('p.small', 'Öll aðferðaspjöldin 1–12, tafla yfir ρ og α, tvíleiðarareglan, tákn og lausnarskref.'), dl('Sækja formúlublað', 'formulaSheet', 'formulublad.pdf', 'formulublad.pdf')),
        h('div', h('h3', 'Prófglósur – 2 bls.'), h('p.small', 'Bls. 1: leiðarar, eiginleikar, viðnám, hiti. Bls. 2: spennuföll, tvíleiðarar, dæmagerðir og algeng mistök.'), dl('Sækja prófglósur', 'examNotes', 'profglosur.pdf', 'profglosur.pdf')),
        h('div', h('h3', 'Verkefnayfirlit'), h('p.small', 'Öll 13 dæmi kennarans með aðferð, lausn og svari.'), dl('Sækja verkefnayfirlit', 'problemOverview', 'verkefnayfirlit.pdf', 'verkefnayfirlit.pdf')))),
      h('section.panel', h('h2', 'Mínar prófglósur'), h('p', 'Veldu það sem þú vilt hafa með. ★ = ég gleymi þessu oft (fær áherslu). Glósurnar eru skipulagðar eftir því hvað þú átt að finna, með sömu númerum og á vefnum.'),
        h('div.notes-grid',
          h('div',
            h('label.inline', 'Titill: ', titleIn), pages,
            h('div.btnrow', h('button.btn.small', { type: 'button', onclick: () => { N.cards = RF.methods.map((m) => m.id); RF.route(true); } }, 'Velja allt'), h('button.btn.small', { type: 'button', onclick: () => { const known = RF.methods.filter((m) => m.types.every((tid) => (RF.store.typeMastery(tid) || 0) >= 0.8)).map((m) => m.id); N.cards = N.cards.filter((id) => !known.includes(id)); RF.route(true); toast(known.length ? 'Fjarlægði ' + known.length + ' spjöld sem þú kannt vel.' : 'Engin spjöld með ≥ 80 % færni enn.'); } }, 'Fjarlægja það sem ég kann vel')),
            h('div.nrows', cardRows),
            h('h3', 'Dæmagerðir sem ég vil muna'), typeBoxes,
            h('h3', 'Eigin dæmi'), ownList, h('div.ownadd', ownT, ownX, h('button.btn.small', { type: 'button', onclick: () => { if (!ownT.value.trim()) { toast('Gefðu dæminu heiti.'); return; } N.own.push({ title: ownT.value.trim(), text: ownX.value.trim() }); ownT.value = ''; ownX.value = ''; drawOwn(); save(); } }, 'Bæta við')),
            h('div.opts2', opt('showTable', 'Hafa töflu yfir ρ og α með'), opt('showTraps', 'Hafa „algeng mistök“ með'))),
          h('div', h('h3', 'Forskoðun'), pv, warn, mkBtn))));
    drawOwn();
    preview();
    if (arg === 'pdf') setTimeout(() => { const el = $('#pdf'); if (el) el.scrollIntoView(); }, 30);
  };

  /* ============ LEIÐARKERFI ============ */
  const routes = { '': V.home, laera: V.learn, aefa: V.practice, hugtok: V.concepts, prof: V.exam, formulur: V.formulas, glosur: V.notes, framvinda: V.progress, undirbuningur: V.prep, lota: V.session, um: V.about };
  const navItems = [['', 'Heim'], ['laera', 'Læra'], ['aefa', 'Æfa'], ['prof', 'Próf'], ['formulur', 'Formúlur'], ['glosur', 'Glósur'], ['framvinda', 'Framvinda']];
  let lastPath = null;
  RF.route = function (force) {
    const raw = location.hash.replace(/^#\/?/, '');
    const [pathPart, qs] = raw.split('?');
    const [page, arg] = pathPart.split('/');
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    if (!force && raw === lastPath) return;
    const sameView = lastPath !== null && lastPath.split('?')[0] === pathPart;
    lastPath = raw;
    const view = routes[page] || V.home;
    const main = $('#view');
    main.innerHTML = '';
    if (page === 'prof' && arg === 'keyra') document.body.classList.add('exam-mode'); else document.body.classList.remove('exam-mode');
    try { view(main, arg, q); } catch (e) { console.error(e); main.append(h('div.panel', h('h1', 'Villa kom upp'), h('p', e.message), h('a.btn', { href: '#/' }, 'Forsíða'))); }
    document.querySelectorAll('.topnav a').forEach((a) => a.setAttribute('aria-current', a.dataset.p === page ? 'page' : 'false'));
    const h1 = main.querySelector('h1');
    document.title = (h1 ? h1.textContent + ' · ' : '') + 'Rafmagnsfræði 1';
    if (!sameView) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
  };
  function init() {
    RF.store.load();
    $('.topnav').append(...navItems.map(([p, label]) => h('a', { href: '#/' + p, 'data-p': p }, label)));
    const saved = $('#saveState');
    RF.onSave = () => { saved.textContent = 'Vistað á tækinu'; clearTimeout(saved._t); saved._t = setTimeout(() => (saved.textContent = ''), 1800); };
    window.addEventListener('hashchange', () => RF.route());
    RF.route(true);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

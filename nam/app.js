/* Námið – lítið áminningarforrit: stundaskrá, skóladagatal, kennsluáætlanir og skil. */
(function () {
  'use strict';
  const D = window.NAM_DEFAULTS;
  const KEY = 'nam.v1';
  const SENT_KEY = 'nam.sent';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- Vistun ---------- */
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.version) return normalize(s);
    } catch (e) { /* tómt eða læst */ }
    return clone(D);
  }
  // Kennsluáætlanir úr aaetlanir.js eru settar inn einu sinni hver.
  function applyPacks(st) {
    st.applied = st.applied || [];
    (window.NAM_PACKS || []).forEach((p) => {
      if (st.applied.includes(p.id)) return;
      const c = st.courses.find((x) => x.id === p.course);
      if (c && p.info) Object.keys(p.info).forEach((k) => { if (p.info[k] != null && p.info[k] !== '') c[k] = p.info[k]; });
      const list = st.plans[p.course] = st.plans[p.course] || [];
      (p.plan || []).forEach((row) => {
        const ex = list.find((x) => x.week === row.week);
        if (!ex) list.push(Object.assign({ id: Math.random().toString(36).slice(2, 10), notes: '' }, row));
        else if (!ex.topic) Object.assign(ex, row);
      });
      list.sort((a, b) => a.week.localeCompare(b.week));
      (p.tasks || []).forEach((t) => {
        if (!st.tasks.some((x) => x.id === t.id)) st.tasks.push(Object.assign({ course: p.course, done: false }, t));
      });
      st.applied.push(p.id);
      st.dirty = true;
    });
    return st;
  }
  function normalize(s) {
    const base = clone(D);
    const out = Object.assign(base, s);
    out.settings = Object.assign({}, D.settings, s.settings || {});
    out.plans = out.plans || {};
    out.tasks = out.tasks || [];
    return out;
  }
  let S = applyPacks(load());
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Ekki tókst að vista í vafranum'); }
  }

  /* ---------- Dagsetningar ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const dow = (s) => { const g = parse(s).getDay(); return g === 0 ? 7 : g; };
  const monday = (s) => addDays(s, 1 - dow(s));
  const today = () => iso(new Date());
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const DAYS = ['', 'mánudagur', 'þriðjudagur', 'miðvikudagur', 'fimmtudagur', 'föstudagur', 'laugardagur', 'sunnudagur'];
  const DSHORT = ['', 'mán', 'þri', 'mið', 'fim', 'fös', 'lau', 'sun'];
  const MONTHS = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];
  const fmtLong = (s) => { const d = parse(s); return `${DAYS[dow(s)]} ${d.getDate()}. ${MONTHS[d.getMonth()]}`; };
  const fmtShort = (s) => { const d = parse(s); return `${DSHORT[dow(s)]} ${d.getDate()}. ${MONTHS[d.getMonth()].slice(0, 3)}.`; };
  const fmtTime = (t) => t.replace(/^0/, '');
  function isoWeek(s) {
    const d = parse(s);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const y0 = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - y0) / 864e5 + 1) / 7);
  }
  function relDays(s) {
    const n = diffDays(today(), s);
    if (n === 0) return 'í dag';
    if (n === 1) return 'á morgun';
    if (n === -1) return 'í gær';
    if (n < 0) return `fyrir ${-n} dögum`;
    if (n < 7) return DAYS[dow(s)];
    return `eftir ${n} daga`;
  }
  function relMin(m) {
    if (m < 60) return `${m} mín.`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} klst. ${r} mín.` : `${h} klst.`;
  }

  /* ---------- Hjálparföll ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const course = (id) => S.courses.find((c) => c.id === id) || { id, code: '?', name: 'Óþekktur áfangi', color: '#888' };
  const courseLabel = (c) => `${c.code} · ${c.name}`;

  const KIND = {
    fri: 'Frí', namsmat: 'Námsmat', 'spönn': 'Spönn', frestur: 'Frestur', vidburdur: 'Viðburður', skil: 'Skil'
  };
  const TASK_KIND = { verkefni: 'Verkefni', prof: 'Próf', heimavinna: 'Heimavinna', lestur: 'Lestur', annad: 'Annað' };

  const eventsOn = (date) => S.events.filter((e) => e.date <= date && date <= (e.end || e.date));
  const noClass = (date) => eventsOn(date).find((e) => e.kind === 'fri' || e.kind === 'namsmat');
  const termOf = (date) => S.terms.find((t) => t.start <= date && date <= t.end);
  const currentTerm = () => termOf(today()) || S.terms.find((t) => t.start > today()) || S.terms[S.terms.length - 1];

  function slotsOn(date) {
    const t = termOf(date);
    if (!t) return [];
    return S.slots.filter((s) => s.term === t.id && s.day === dow(date)).sort((a, b) => a.start.localeCompare(b.start));
  }
  // Samliggjandi tímar í sama áfanga verða að einni lotu.
  function blocksOn(date) {
    const out = [];
    for (const s of slotsOn(date)) {
      const last = out.filter((b) => b.course === s.course).pop();
      if (last && last.end === s.start) { last.end = s.end; last.n++; } else out.push({ course: s.course, start: s.start, end: s.end, n: 1 });
    }
    return out.sort((a, b) => a.start.localeCompare(b.start));
  }
  const planFor = (cid, date) => (S.plans[cid] || []).find((p) => p.week === monday(date));
  const openTasks = () => S.tasks.filter((t) => !t.done);

  function nextSchoolDay(from) {
    for (let i = 1; i <= 60; i++) {
      const d = addDays(from, i);
      if (blocksOn(d).length && !noClass(d)) return d;
    }
    return null;
  }

  if (S.dirty) { delete S.dirty; save(); }

  /* ---------- Birting ---------- */
  const TABS = [
    ['idag', 'Í dag', '◉'],
    ['vika', 'Vikan', '▦'],
    ['verkefni', 'Skil', '✓'],
    ['afangar', 'Áfangar', '❏'],
    ['dagatal', 'Dagatal', '▤'],
    ['stillingar', 'Stillingar', '⚙']
  ];
  let tab = (location.hash || '#idag').slice(1);
  let weekOf = monday(today());
  let taskFilter = 'opin';
  let showPast = false;

  function render() {
    if (!TABS.some((t) => t[0] === tab)) tab = 'idag';
    $('#tabs').innerHTML = TABS.map(([id, label, ic]) =>
      `<a href="#${id}" ${id === tab ? 'aria-current="page"' : ''}><span aria-hidden="true">${ic}</span>${label}</a>`).join('');
    $('#view').innerHTML = VIEWS[tab]();
  }

  const chip = (c) => `<span class="chip" style="--c:${esc(c.color)}">${esc(c.code)}</span>`;
  const kindBadge = (k) => `<span class="badge k-${esc(k)}">${esc(KIND[k] || k)}</span>`;

  /* ---------- Gátlistar ---------- */
  const studyOf = (t) => (window.NAM_STUDY || {})[t.id] || null;
  function checkKeys(t) {
    const st = studyOf(t), keys = [];
    if (st) (st.sections || []).forEach((s) => s.items.forEach((i) => keys.push(i.id)));
    (t.check || []).forEach((i) => keys.push('own:' + i.id));
    return keys;
  }
  function progress(t) {
    const keys = checkKeys(t), ch = t.checked || {};
    return { done: keys.filter((k) => ch[k]).length, total: keys.length };
  }
  const progText = (p) => `${p.done} af ${p.total} atriðum`;

  function checkLi(t, key, text, hint, own) {
    const on = t.checked && t.checked[key];
    return `<li class="${on ? 'on' : ''}"><label class="check"><input type="checkbox" data-check="${esc(key)}" ${on ? 'checked' : ''}><span>${esc(text)}${hint ? `<small>${esc(hint)}</small>` : ''}</span></label>${own ? `<button class="small ghost" data-act="delCheck" data-k="${esc(key)}" aria-label="Eyða atriði">✕</button>` : ''}</li>`;
  }

  function taskDetail(t, keepScroll) {
    const dlg = $('#dlg');
    const scroll = keepScroll ? dlg.scrollTop : 0;
    const c = t.course ? course(t.course) : null;
    const st = studyOf(t) || {};
    const p = progress(t);
    const when = t.due ? `${fmtLong(t.due)}${t.time ? ' kl. ' + fmtTime(t.time) : ''} · ${relDays(t.due)}` : 'Engin dagsetning';
    dlg.innerHTML = `<div class="detail" data-task="${esc(t.id)}">
      <div class="t-meta">${c ? chip(c) : ''}<span class="badge">${esc(TASK_KIND[t.kind] || 'Verkefni')}</span>${t.weight ? `<span class="badge">${esc(t.weight)}%</span>` : ''}${t.done ? '<span class="badge k-spönn">Lokið</span>' : ''}${t.score ? `<span class="badge k-spönn">${esc(t.score)}</span>` : ''}</div>
      <h2>${esc(t.title)}</h2>
      <p class="${!t.done && t.due && t.due < today() ? 'warn' : 'muted'}">${esc(when)}</p>
      ${p.total ? `<div class="prog" aria-hidden="true"><i style="width:${Math.round(100 * p.done / p.total)}%"></i></div><p class="muted small" data-prog>${progText(p)}</p>` : ''}
      ${st.intro ? `<p>${esc(st.intro)}</p>` : ''}
      ${quizOf(t) ? `<div class="quiz-cta"><div><b>Æfingapróf</b><span class="muted small">${quizOf(t).length} spurningar í bankanum${t.quiz ? ` · síðast ${t.quiz.last}%, best ${t.quiz.best}%` : ''}</span></div>
        <div class="toolbar"><button class="primary" data-act="quizStart" data-id="${esc(t.id)}" data-n="15">15 spurningar</button><button data-act="quizStart" data-id="${esc(t.id)}" data-n="all">Allar ${quizOf(t).length}</button></div></div>` : ''}
      ${t.notes && t.notes !== st.intro ? `<p class="hint">${esc(t.notes)}</p>` : ''}
      ${st.how ? `<h3>Hvernig best er að fara að</h3><ol class="how">${st.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>` : ''}
      ${(st.sections || []).map((s) => `<h3>${esc(s.title)}</h3><ul class="checks">${s.items.map((i) => checkLi(t, i.id, i.text, i.hint)).join('')}</ul>`).join('')}
      <h3>Mín atriði</h3>
      ${(t.check || []).length ? `<ul class="checks">${t.check.map((i) => checkLi(t, 'own:' + i.id, i.text, '', true)).join('')}</ul>` : ''}
      <form data-form="addCheck" class="add-check"><input id="addCheckText" name="text" placeholder="Nýtt atriði á listann" required aria-label="Nýtt atriði"><button>Bæta við</button></form>
      <div class="dlg-actions"><button data-act="editTask" data-id="${esc(t.id)}" data-edit="1">Breyta</button><button data-act="doneTask" data-id="${esc(t.id)}">${t.done ? 'Opna aftur' : 'Merkja lokið'}</button><span></span><button class="primary" data-act="closeDlg">Loka</button></div>
    </div>`;
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = scroll;
  }
  /* ---------- Æfingapróf ---------- */
  const quizOf = (t) => (window.NAM_QUIZ || {})[t.id] || null;
  let Q = null;
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // Teiknitákn eins og á verkefnablöðunum.
  function symSvg(type) {
    const arm = (deg) => {
      const r = (deg * Math.PI) / 180, cx = 60, cy = 50;
      const x1 = cx + 7 * Math.cos(r), y1 = cy + 7 * Math.sin(r), x2 = cx + 26 * Math.cos(r), y2 = cy + 26 * Math.sin(r);
      const f = r + Math.PI / 2, x3 = x2 + 9 * Math.cos(f), y3 = y2 + 9 * Math.sin(f);
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${x3.toFixed(1)} ${y3.toFixed(1)}"/>`;
    };
    const arms = { einfaldur: [-60], krono: [-60, -120], sam: [-60, 120], kross: [-60, -120, 60, 120] }[type];
    let body = '';
    if (arms) body = `<circle cx="60" cy="50" r="7" fill="none"/>` + arms.map(arm).join('');
    else if (type === 'tengill') body = '<path d="M44 34A16 16 0 0 0 76 34"/><path d="M42 50H78M60 50V78M60 50V40"/>';
    else if (type === 'ljos') body = '<path d="M42 32L78 68M78 32L42 68"/>';
    return `<svg viewBox="0 0 120 100" width="120" height="100" role="img" aria-label="Teiknitákn" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }
  function startQuiz(t, n) {
    const bank = quizOf(t);
    const qs = shuffle(bank).slice(0, n === 'all' ? bank.length : Number(n) || bank.length)
      .map((q) => Object.assign({}, q, { order: shuffle(q.a.map((_, i) => i)) }));
    Q = { task: t.id, qs, i: 0, picked: null, right: 0, wrong: [], n };
    quizView();
  }
  function quizView() {
    const dlg = $('#dlg');
    const t = S.tasks.find((x) => x.id === Q.task);
    const total = Q.qs.length;
    let html;
    if (Q.i >= total) {
      const pct = Math.round((100 * Q.right) / total);
      const msg = pct >= 90 ? 'Frábært. Undirbúningurinn skilar sér.' : pct >= 70 ? 'Gott. Rifjaðu upp atriðin hér fyrir neðan og taktu prófið aftur.' : 'Farðu yfir atriðin hér fyrir neðan og í gátlistanum, og taktu svo prófið aftur.';
      html = `<div class="detail quiz"><p class="eyebrow">Æfingapróf · ${esc(t.title)}</p>
        <h2>${Q.right} af ${total} rétt <span class="muted">(${pct}%)</span></h2><p>${esc(msg)}</p>
        ${Q.wrong.length ? `<h3>Rifjaðu þetta upp</h3><ul class="review">${Q.wrong.map((q) => `<li><b>${esc(q.q)}</b>${q.sym ? `<span class="sym sm">${symSvg(q.sym)}</span>` : ''}<span>Rétt svar: ${esc(q.a[q.c])}</span><small>${esc(q.why)}</small></li>`).join('')}</ul>
        <button data-act="quizUncheck">Taka hak af þessum atriðum í gátlistanum</button>` : ''}
        <div class="dlg-actions"><button data-act="quizStart" data-id="${esc(t.id)}" data-n="${esc(Q.n)}">Taka aftur</button><span></span><button class="primary" data-act="quizBack">Aftur í gátlistann</button></div></div>`;
    } else {
      const q = Q.qs[Q.i], answered = Q.picked !== null, ok = Q.picked === q.c;
      html = `<div class="detail quiz"><div class="row-head"><p class="eyebrow">Spurning ${Q.i + 1} af ${total} · ${Q.right} rétt</p><button class="small ghost" data-act="quizBack">Hætta</button></div>
        <div class="prog" aria-hidden="true"><i style="width:${Math.round((100 * Q.i) / total)}%"></i></div>
        ${q.sym ? `<div class="sym">${symSvg(q.sym)}</div>` : ''}<h2>${esc(q.q)}</h2>
        <div class="opts">${q.order.map((i) => {
          const cls = answered ? (i === q.c ? 'right' : i === Q.picked ? 'wrong' : '') : '';
          return `<button class="opt ${cls}" data-act="quizAnswer" data-i="${i}" ${answered ? 'disabled' : ''}>${esc(q.a[i])}</button>`;
        }).join('')}</div>
        ${answered ? `<p class="feedback ${ok ? 'ok' : 'bad'}" role="status"><b>${ok ? 'Rétt.' : 'Rangt.'}</b> ${esc(q.why)}</p>
        <div class="dlg-actions"><span></span><button class="primary" id="quizNext" data-act="quizNext">${Q.i + 1 < total ? 'Næsta spurning' : 'Sjá niðurstöðu'}</button></div>` : ''}</div>`;
    }
    dlg.innerHTML = html;
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    const nx = $('#quizNext'); if (nx) nx.focus();
  }

  const detailTask = () => { const el = $('#dlg .detail'); return el && S.tasks.find((t) => t.id === el.dataset.task); };

  function taskRow(t) {
    const c = t.course ? course(t.course) : null;
    const late = !t.done && t.due && t.due < today();
    const when = t.due ? `${fmtShort(t.due)}${t.time ? ' kl. ' + fmtTime(t.time) : ''} · ${relDays(t.due)}` : 'Engin dagsetning';
    return `<li class="task ${t.done ? 'done' : ''} ${late ? 'late' : ''}">
      <input type="checkbox" data-act="toggleTask" data-id="${t.id}" ${t.done ? 'checked' : ''} aria-label="Lokið: ${esc(t.title)}">
      <button class="task-body" data-act="editTask" data-id="${t.id}">
        <span class="t-title">${esc(t.title)}</span>
        <span class="t-meta">${c ? chip(c) : ''}<span class="badge">${esc(TASK_KIND[t.kind] || 'Verkefni')}</span>${t.weight ? `<span class="badge">${esc(t.weight)}%</span>` : ''}<span>${esc(when)}</span>${(() => { const p = progress(t); return p.total && !t.done ? `<span class="badge k-frestur">Gátlisti ${p.done}/${p.total}</span>` : ''; })()}${t.submitted ? `<span>Skilað ${esc(fmtShort(t.submitted))}</span>` : ''}${t.score ? `<span class="badge k-sponn">${esc(t.score)}</span>` : ''}</span>${t.notes && !t.done ? `<span class="t-notes">${esc(t.notes)}</span>` : ''}
      </button></li>`;
  }

  function classRow(b, date, state) {
    const c = course(b.course);
    const p = planFor(b.course, date);
    return `<li class="cls ${state || ''}" style="--c:${esc(c.color)}">
      <div class="cls-time">${fmtTime(b.start)}<small>${fmtTime(b.end)}</small></div>
      <div class="cls-body"><b>${esc(courseLabel(c))}</b>
        <span class="muted">${[c.room && 'Stofa ' + c.room, c.group, b.n > 1 && b.n + ' tímar'].filter(Boolean).map(esc).join(' · ')}</span>
        ${p && p.topic ? `<span class="topic">${esc(p.topic)}</span>` : ''}</div></li>`;
  }

  const VIEWS = {};

  VIEWS.idag = function () {
    const d = today(), m = nowMin();
    const t = termOf(d);
    const off = noClass(d);
    const blocks = blocksOn(d);
    let html = `<header class="day-head"><p class="eyebrow">Vika ${isoWeek(d)}${t ? ' · ' + esc(t.name) : ''}</p>
      <h1>${esc(fmtLong(d))}</h1>`;
    if (t) {
      const left = diffDays(d, t.end);
      html += `<p class="muted">${left > 0 ? `${left} dagar eftir af spönninni (kennslu lýkur ${esc(fmtShort(t.end))})` : 'Síðasti kennsludagur spannarinnar'}</p>`;
    }
    html += '</header>';

    eventsOn(d).forEach((e) => {
      html += `<div class="banner k-${esc(e.kind)}"><b>${esc(e.title)}</b>${e.kind === 'namsmat' ? ' – ekki kennt skv. stundaskrá. Sjálfstæð vinna, próf eða skil.' : e.kind === 'fri' ? ' – engin kennsla.' : ''}</div>`;
    });

    // Núna / næst
    const live = !off ? blocks : [];
    const cur = live.find((b) => toMin(b.start) <= m && m < toMin(b.end));
    const nxt = live.find((b) => toMin(b.start) > m);
    let card = '';
    if (cur) {
      const c = course(cur.course);
      card = `<div class="now" style="--c:${esc(c.color)}"><span class="eyebrow">Núna</span><b>${esc(courseLabel(c))}</b><span>til kl. ${fmtTime(cur.end)} · ${relMin(toMin(cur.end) - m)} eftir${c.room ? ' · stofa ' + esc(c.room) : ''}</span></div>`;
    }
    if (nxt) {
      const c = course(nxt.course);
      card += `<div class="now next" style="--c:${esc(c.color)}"><span class="eyebrow">Næst</span><b>${esc(courseLabel(c))}</b><span>kl. ${fmtTime(nxt.start)} · eftir ${relMin(toMin(nxt.start) - m)}${c.room ? ' · stofa ' + esc(c.room) : ''}</span></div>`;
    }
    if (!cur && !nxt) {
      const nd = nextSchoolDay(d);
      if (nd) {
        const fb = blocksOn(nd)[0], c = course(fb.course);
        card = `<div class="now next" style="--c:${esc(c.color)}"><span class="eyebrow">Næsti skóladagur · ${esc(relDays(nd))}</span><b>${esc(fmtLong(nd))}</b><span>Fyrsti tími kl. ${fmtTime(fb.start)}: ${esc(courseLabel(c))}</span></div>`;
      } else card = '<div class="now"><span class="eyebrow">Ekkert framundan</span><b>Engin kennsla skráð á næstunni</b><span>Bættu við stundaskrá undir „Vikan“.</span></div>';
    }
    html += `<section class="cards">${card}</section>`;

    if (blocks.length) {
      html += `<section class="panel"><h2>Tímar í dag${off ? ' <span class="muted">(falla niður)</span>' : ''}</h2><ul class="classes ${off ? 'off' : ''}">`;
      html += blocks.map((b) => classRow(b, d, off ? '' : toMin(b.end) <= m ? 'past' : toMin(b.start) <= m ? 'live' : '')).join('');
      html += '</ul></section>';
    }

    // Næsti skóladagur (þegar dagurinn er búinn)
    if (!cur && !nxt) {
      const nd = nextSchoolDay(d);
      if (nd) {
        html += `<section class="panel"><h2>${esc(relDays(nd) === 'á morgun' ? 'Á morgun' : fmtLong(nd))}</h2><ul class="classes">${blocksOn(nd).map((b) => classRow(b, nd)).join('')}</ul></section>`;
      }
    }

    // Skil
    const late = openTasks().filter((x) => x.due && x.due < d).sort(byDue);
    const soon = openTasks().filter((x) => x.due && x.due >= d && diffDays(d, x.due) <= 14).sort(byDue);
    html += '<section class="panel"><div class="row-head"><h2>Skil og próf</h2><button class="small" data-act="newTask">+ Nýtt</button></div>';
    if (late.length) html += `<h3 class="warn">Komið fram yfir</h3><ul class="tasks">${late.map(taskRow).join('')}</ul>`;
    html += soon.length ? `<h3>Næstu tvær vikur</h3><ul class="tasks">${soon.map(taskRow).join('')}</ul>`
      : '<p class="muted">Engin skil skráð næstu tvær vikur.</p>';
    html += '</section>';

    // Á döfinni
    const ev = S.events.filter((e) => (e.end || e.date) >= addDays(d, 1) && e.date <= addDays(d, 28)).sort((a, b) => a.date.localeCompare(b.date));
    html += '<section class="panel"><h2>Á döfinni</h2>';
    html += ev.length ? `<ul class="events">${ev.map(eventRow).join('')}</ul>` : '<p class="muted">Ekkert á skóladagatalinu næstu fjórar vikur.</p>';
    html += '</section>';

    const missing = S.courses.filter((c) => !(S.plans[c.id] || []).some((p) => p.topic));
    if (missing.length) {
      html += `<p class="hint">Kennsluáætlun vantar fyrir ${missing.map((c) => esc(c.code)).join(', ')}. Þegar hún er komin birtist efni vikunnar við hvern tíma.</p>`;
    }
    return html;
  };

  const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (a.time || '').localeCompare(b.time || '');

  function eventRow(e) {
    const range = e.end ? `${fmtShort(e.date)} – ${fmtShort(e.end)}` : fmtShort(e.date);
    const past = (e.end || e.date) < today();
    return `<li class="ev ${past ? 'past' : ''}"><span class="ev-date">${esc(range)}</span><span class="ev-title">${esc(e.title)}</span>${kindBadge(e.kind)}${e.own ? `<button class="small ghost" data-act="delEvent" data-id="${e.id}" aria-label="Eyða ${esc(e.title)}">✕</button>` : ''}</li>`;
  }

  VIEWS.vika = function () {
    const days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(weekOf, i));
    const t = termOf(days[0]) || termOf(days[4]);
    const all = days.map((d) => ({ d, slots: slotsOn(d), off: noClass(d), ev: eventsOn(d) }));
    const show = all.filter((x, i) => i < 5 || x.slots.length || x.ev.length);
    const starts = [...new Set(all.flatMap((x) => x.slots.map((s) => s.start)))].sort();
    const s0 = parse(days[0]), s6 = parse(days[6]);
    const label = s0.getMonth() === s6.getMonth() ? `${s0.getDate()}.–${s6.getDate()}. ${MONTHS[s6.getMonth()]}` : `${s0.getDate()}. ${MONTHS[s0.getMonth()].slice(0, 3)}. – ${s6.getDate()}. ${MONTHS[s6.getMonth()].slice(0, 3)}.`;

    let html = `<header class="day-head"><p class="eyebrow">${t ? esc(t.name) : 'Utan spannar'}</p><h1>Vika ${isoWeek(days[0])} <span class="muted">· ${esc(label)}</span></h1>
      <div class="toolbar"><button data-act="week" data-n="-7" aria-label="Fyrri vika">‹</button><button data-act="week" data-n="0">Þessi vika</button><button data-act="week" data-n="7" aria-label="Næsta vika">›</button></div></header>`;

    html += `<div class="grid" style="--cols:${show.length}"><div class="g-corner"></div>`;
    html += show.map((x) => `<div class="g-day ${x.d === today() ? 'is-today' : ''}"><b>${DSHORT[dow(x.d)]}</b><span>${parse(x.d).getDate()}/${parse(x.d).getMonth() + 1}</span></div>`).join('');
    // Viðburðaröð
    if (show.some((x) => x.ev.length)) {
      html += '<div class="g-time"></div>' + show.map((x) => `<div class="g-ev">${x.ev.map((e) => `<span class="badge k-${esc(e.kind)}" title="${esc(e.title)}">${esc(e.title)}</span>`).join('')}</div>`).join('');
    }
    if (!starts.length) {
      html += `<div class="g-empty" style="grid-column:1 / -1">Engin stundaskrá skráð fyrir þessa viku.</div>`;
    }
    starts.forEach((st) => {
      html += `<div class="g-time">${fmtTime(st)}</div>`;
      html += show.map((x) => {
        const here = x.slots.filter((s) => s.start === st);
        return `<div class="g-cell ${x.off ? 'off' : ''}">${here.map((s) => {
          const c = course(s.course);
          return `<span class="g-slot" style="--c:${esc(c.color)}" title="${esc(courseLabel(c))} ${esc(s.start)}–${esc(s.end)}"><b>${esc(c.code)}</b>${c.room ? `<small>${esc(c.room)}</small>` : ''}</span>`;
        }).join('')}</div>`;
      }).join('');
    });
    html += '</div>';

    // Efni vikunnar og skil
    const plans = S.courses.map((c) => ({ c, p: planFor(c.id, days[0]) })).filter((x) => x.p);
    const due = S.tasks.filter((x) => x.due && x.due >= days[0] && x.due <= days[6]).sort(byDue);
    html += '<section class="panel"><h2>Efni vikunnar</h2>';
    html += plans.length ? `<ul class="plan-list">${plans.map(({ c, p }) => `<li>${chip(c)} <span><b>${esc(p.topic || '—')}</b>${p.reading ? `<br><span class="muted">${esc(p.reading)}</span>` : ''}${p.notes ? `<br><span class="muted">${esc(p.notes)}</span>` : ''}</span></li>`).join('')}</ul>`
      : '<p class="muted">Engin kennsluáætlun skráð fyrir þessa viku.</p>';
    html += `<h3>Skil vikunnar</h3>${due.length ? `<ul class="tasks">${due.map(taskRow).join('')}</ul>` : '<p class="muted">Engin skil.</p>'}</section>`;

    // Breyta stundaskrá
    const term = t || currentTerm();
    const ts = S.slots.map((s, i) => Object.assign({ i }, s)).filter((s) => s.term === term.id).sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
    html += `<details class="panel"><summary><h2>Breyta stundaskrá · ${esc(term.name)}</h2></summary>
      <ul class="slot-list">${ts.map((s) => `<li>${chip(course(s.course))}<span>${DSHORT[s.day]} ${fmtTime(s.start)}–${fmtTime(s.end)}</span><button class="small ghost" data-act="delSlot" data-i="${s.i}" aria-label="Eyða tíma">✕</button></li>`).join('') || '<li class="muted">Engir tímar.</li>'}</ul>
      <form data-form="slot" class="inline-form">
        <input type="hidden" name="term" value="${esc(term.id)}">
        <label>Áfangi<select name="course">${S.courses.map((c) => `<option value="${esc(c.id)}">${esc(c.code)}</option>`).join('')}</select></label>
        <label>Dagur<select name="day">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}">${DAYS[n]}</option>`).join('')}</select></label>
        <label>Byrjar<input type="time" name="start" value="08:30" required></label>
        <label>Endar<input type="time" name="end" value="09:20" required></label>
        <button class="primary">Bæta við tíma</button>
      </form></details>`;
    return html;
  };

  VIEWS.verkefni = function () {
    const list = S.tasks.filter((t) => taskFilter === 'allt' || (taskFilter === 'lokid' ? t.done : !t.done)).sort(byDue);
    const d = today(), wEnd = addDays(monday(d), 6);
    const groups = taskFilter === 'opin' ? [
      ['Komið fram yfir', list.filter((t) => t.due && t.due < d)],
      ['Þessa viku', list.filter((t) => t.due && t.due >= d && t.due <= wEnd)],
      ['Síðar', list.filter((t) => t.due && t.due > wEnd)],
      ['Án dagsetningar', list.filter((t) => !t.due)]
    ] : [['', list]];
    let html = `<header class="day-head"><h1>Skil og próf</h1>
      <div class="toolbar"><div class="seg">${[['opin', 'Opin'], ['lokid', 'Lokið'], ['allt', 'Öll']].map(([k, l]) => `<button data-act="filter" data-k="${k}" ${k === taskFilter ? 'aria-pressed="true"' : ''}>${l}</button>`).join('')}</div>
      <button class="primary" data-act="newTask">+ Nýtt verkefni</button></div></header>`;
    let any = false;
    groups.forEach(([title, items]) => {
      if (!items.length) return;
      any = true;
      html += `<section class="panel">${title ? `<h2 class="${title === 'Komið fram yfir' ? 'warn' : ''}">${title}</h2>` : ''}<ul class="tasks">${items.map(taskRow).join('')}</ul></section>`;
    });
    if (!any) html += '<p class="empty">Ekkert hér. Verkefni úr kennsluáætlunum birtast hér þegar þær eru komnar inn.</p>';
    return html;
  };

  VIEWS.afangar = function () {
    let html = `<header class="day-head"><h1>Áfangar</h1><div class="toolbar"><button data-act="newCourse">+ Nýr áfangi</button></div></header>`;
    S.courses.forEach((c) => {
      const slots = S.slots.filter((s) => s.course === c.id);
      const termIds = [...new Set(slots.map((s) => s.term))];
      const terms = S.terms.filter((t) => termIds.includes(t.id));
      if (!terms.length) terms.push(currentTerm());
      const byDay = {};
      slots.filter((s) => s.term === terms[terms.length - 1].id).forEach((s) => { (byDay[s.day] = byDay[s.day] || []).push(s); });
      const when = Object.keys(byDay).sort().map((dn) => {
        const ss = byDay[dn].sort((a, b) => a.start.localeCompare(b.start));
        return `${DSHORT[dn]} ${fmtTime(ss[0].start)}–${fmtTime(ss[ss.length - 1].end)}`;
      }).join(', ');
      const plan = S.plans[c.id] || [];
      const tasks = S.tasks.filter((t) => t.course === c.id).sort(byDue);
      const missing = [!c.room && 'stofa', !c.teacher && 'kennari'].filter(Boolean);
      html += `<section class="panel course" style="--c:${esc(c.color)}">
        <div class="row-head"><h2>${chip(c)} ${esc(c.name)}</h2><button class="small" data-act="editCourse" data-id="${esc(c.id)}">Breyta</button></div>
        <p class="muted">${[c.group, c.room && 'Stofa ' + c.room, c.teacher].filter(Boolean).map(esc).join(' · ')}${when ? `<br>${esc(when)}` : ''}${c.link ? `<br><a href="${esc(c.link)}" target="_blank" rel="noopener">Opna áfangasíðu</a>` : ''}</p>
        ${c.notes ? `<p class="course-notes">${esc(c.notes).replace(/\n/g, '<br>')}</p>` : ''}
        ${missing.length ? `<p class="hint">Vantar: ${missing.join(', ')}.</p>` : ''}
        <details ${plan.some((p) => p.topic) ? '' : ''}><summary><b>Kennsluáætlun</b> <span class="muted">${plan.filter((p) => p.topic).length ? plan.filter((p) => p.topic).length + ' vikur skráðar' : 'vantar'}</span></summary>
        ${terms.map((t) => planTable(c, t)).join('')}</details>
        <details><summary><b>Skil og próf</b> <span class="muted">${tasks.length ? tasks.filter((t) => !t.done).length + ' opin af ' + tasks.length : 'engin'}</span></summary>
        <ul class="tasks">${tasks.map(taskRow).join('')}</ul><button class="small" data-act="newTask" data-course="${esc(c.id)}">+ Bæta við</button></details>
      </section>`;
    });
    return html;
  };

  function planTable(c, t) {
    const rows = [];
    for (let w = monday(t.start); w <= t.end; w = addDays(w, 7)) rows.push(w);
    const plan = S.plans[c.id] || [];
    const tw = monday(today());
    return `<table class="plan"><caption>${esc(t.name)}</caption><thead><tr><th>Vika</th><th>Efni · athugasemdir</th></tr></thead><tbody>
      ${rows.map((w) => {
        const p = plan.find((x) => x.week === w) || {};
        const evs = [0, 1, 2, 3, 4].map((i) => addDays(w, i)).map(noClass).filter(Boolean);
        return `<tr class="${w === tw ? 'is-now' : ''}"><th scope="row">${isoWeek(w)}<small>${parse(w).getDate()}/${parse(w).getMonth() + 1}</small></th>
          <td><textarea rows="${Math.max(1, Math.ceil((p.topic || '').length / 34))}" data-plan="${esc(c.id)}" data-week="${w}" data-f="topic" placeholder="${evs.length ? esc(evs[0].title) : 'Efni'}" aria-label="Efni viku ${isoWeek(w)}">${esc(p.topic)}</textarea>
          <textarea class="sub" rows="${Math.max(1, Math.ceil((p.reading || '').length / 38))}" data-plan="${esc(c.id)}" data-week="${w}" data-f="reading" placeholder="Athugasemdir" aria-label="Athugasemdir viku ${isoWeek(w)}">${esc(p.reading)}</textarea></td></tr>`;
      }).join('')}</tbody></table>`;
  }

  VIEWS.dagatal = function () {
    const d = today();
    const items = S.events.map((e) => Object.assign({}, e))
      .concat(S.tasks.filter((t) => t.due && !t.done).map((t) => ({ date: t.due, title: `${course(t.course).code || ''} ${t.title}`.trim(), kind: 'skil' })))
      .filter((e) => showPast || (e.end || e.date) >= d)
      .sort((a, b) => a.date.localeCompare(b.date));
    let html = `<header class="day-head"><p class="eyebrow">${esc(S.school)} · skólaárið 2026–2027</p><h1>Skóladagatal</h1>
      <div class="toolbar"><label class="check"><input type="checkbox" data-act="past" ${showPast ? 'checked' : ''}> Sýna liðið</label></div></header>`;
    const byMonth = {};
    items.forEach((e) => { const k = e.date.slice(0, 7); (byMonth[k] = byMonth[k] || []).push(e); });
    Object.keys(byMonth).forEach((k) => {
      const [y, m] = k.split('-').map(Number);
      html += `<section class="panel"><h2>${MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1)} ${y}</h2><ul class="events">${byMonth[k].map(eventRow).join('')}</ul></section>`;
    });
    html += `<details class="panel"><summary><h2>Bæta við viðburði</h2></summary>
      <form data-form="event" class="inline-form">
        <label>Heiti<input name="title" required></label>
        <label>Dagsetning<input type="date" name="date" required value="${d}"></label>
        <label>Til (valfrjálst)<input type="date" name="end"></label>
        <label>Tegund<select name="kind">${Object.keys(KIND).filter((k) => k !== 'skil').map((k) => `<option value="${k}">${KIND[k]}</option>`).join('')}</select></label>
        <button class="primary">Vista</button></form>
      <p class="muted small">Frí og námsmat fella niður tíma í stundaskránni þann dag.</p></details>`;
    return html;
  };

  VIEWS.stillingar = function () {
    const st = S.settings;
    const perm = 'Notification' in window ? Notification.permission : 'unsupported';
    return `<header class="day-head"><h1>Stillingar</h1></header>
    <section class="panel"><h2>Áminningar í símann</h2>
      <p>Áreiðanlegasta leiðin er að setja allt í dagatal símans. Þá koma áminningar þótt forritið sé lokað.</p>
      ${window.NAM_ARTIFACT ? '<p class="hint">Dagatalsskráin (.ics) virkar ekki í þessari útgáfu forritsins. Hún virkar þegar forritið er hýst á eigin vefslóð, t.d. á GitHub Pages.</p>' : ''}
      <form data-form="ics" class="stack" ${window.NAM_ARTIFACT ? 'hidden' : ''}>
        <label class="check"><input type="checkbox" name="cls" checked> Kennslustundir það sem eftir er af spönninni</label>
        <label class="check"><input type="checkbox" name="tasks" checked> Skil og próf</label>
        <label class="check"><input type="checkbox" name="events" checked> Skóladagatal (frí, námsmat, frestir)</label>
        <button class="primary">Sækja dagatalsskrá (.ics)</button>
      </form>
      <p class="muted small">Á iPhone: opnaðu skrána og veldu „Bæta öllum við“. Ef þú sækir hana aftur seinna koma atburðirnir tvisvar, svo best er að eyða gamla dagatalinu fyrst eða sækja bara ný skil.</p>
    </section>
    <section class="panel"><h2>Tilkynningar meðan forritið er opið</h2>
      <p class="muted small">${perm === 'unsupported' ? 'Vafrinn styður ekki tilkynningar. Á iPhone þarf fyrst að setja síðuna á heimaskjá (Deila → Setja á heimaskjá).' : perm === 'denied' ? 'Lokað hefur verið fyrir tilkynningar í vafranum.' : 'Virka meðan forritið er opið eða nýlega opnað.'}</p>
      <form data-form="settings" class="stack">
        <label class="check"><input type="checkbox" name="notify" ${st.notify && perm === 'granted' ? 'checked' : ''} ${perm === 'unsupported' || perm === 'denied' ? 'disabled' : ''}> Kveikja á tilkynningum</label>
        <label>Mínútum fyrir kennslustund<input type="number" name="classLead" min="0" max="120" value="${st.classLead}"></label>
        <label>Minna á skil, dögum áður<input type="number" name="taskDaysBefore" min="0" max="14" value="${st.taskDaysBefore}"></label>
        <label>Klukkan hvað<input type="time" name="taskHour" value="${esc(st.taskHour)}"></label>
        <button>Vista stillingar</button>
      </form></section>
    <section class="panel"><h2>Gögn</h2>
      <p class="muted small">Allt vistast í þessum vafra. Taktu afrit til að flytja á milli tækja.</p>
      <div class="toolbar"><button data-act="export">Sækja afrit (JSON)</button><button data-act="import">Opna afrit</button><button class="danger" data-act="reset">Byrja upp á nýtt</button></div>
    </section>`;
  };

  /* ---------- Gluggar ---------- */
  // Staðfesting inni á síðunni (confirm() virkar ekki alls staðar).
  function ask(msg, yes) {
    return new Promise((resolve) => setTimeout(() => {
      const dlg = $('#dlg');
      dlg.innerHTML = `<form method="dialog" class="dlg-form"><p>${esc(msg)}</p><div class="dlg-actions"><span></span><button value="no">Hætta við</button><button class="danger" value="yes">${esc(yes)}</button></div></form>`;
      dlg.returnValue = '';
      const onClose = () => { if (dlg.open) return; dlg.removeEventListener('close', onClose); resolve(dlg.returnValue === 'yes'); };
      dlg.addEventListener('close', onClose);
      dlg.showModal();
    }, 0));
  }

  function openDialog(html, onSubmit) {
    const dlg = $('#dlg');
    dlg.innerHTML = `<form method="dialog" class="dlg-form">${html}</form>`;
    const f = dlg.querySelector('form');
    f.addEventListener('submit', (ev) => {
      ev.stopPropagation();
      const btn = ev.submitter;
      if (btn && btn.value === 'cancel') return;
      if (btn && btn.value === 'delete') { onSubmit(null, 'delete'); render(); return; }
      onSubmit(Object.fromEntries(new FormData(f)), 'save');
      save(); render();
    });
    if (!dlg.open) dlg.showModal();
    const first = f.querySelector('input:not([type=hidden]),select,textarea');
    if (first) first.focus();
  }

  function taskDialog(t, presetCourse) {
    const isNew = !t;
    t = t || { title: '', course: presetCourse || '', kind: 'verkefni', due: '', time: '', weight: '', notes: '' };
    openDialog(`<h2>${isNew ? 'Nýtt verkefni' : 'Breyta verkefni'}</h2>
      <label>Heiti<input name="title" required value="${esc(t.title)}"></label>
      <div class="two"><label>Áfangi<select name="course"><option value="">—</option>${S.courses.map((c) => `<option value="${esc(c.id)}" ${c.id === t.course ? 'selected' : ''}>${esc(courseLabel(c))}</option>`).join('')}</select></label>
      <label>Tegund<select name="kind">${Object.keys(TASK_KIND).map((k) => `<option value="${k}" ${k === t.kind ? 'selected' : ''}>${TASK_KIND[k]}</option>`).join('')}</select></label></div>
      <div class="two"><label>Skiladagur<input type="date" name="due" value="${esc(t.due)}"></label>
      <label>Klukkan<input type="time" name="time" value="${esc(t.time)}"></label></div>
      <div class="two"><label>Vægi (%)<input type="number" name="weight" min="0" max="100" step="0.5" value="${esc(t.weight)}"></label>
      <label>Einkunn<input name="score" value="${esc(t.score)}" placeholder="t.d. 85%"></label></div>
      <label>Athugasemdir<textarea name="notes" rows="3">${esc(t.notes)}</textarea></label>
      <div class="dlg-actions">${isNew ? '' : '<button value="delete" class="danger" formnovalidate>Eyða</button>'}<span></span><button value="cancel" formnovalidate>Hætta við</button><button class="primary" value="save">Vista</button></div>`,
    (data, mode) => {
      if (mode === 'delete') { S.tasks = S.tasks.filter((x) => x !== t); save(); return; }
      Object.assign(t, data, { weight: data.weight ? Number(data.weight) : '' });
      if (isNew) { t.id = uid(); t.done = false; S.tasks.push(t); }
    });
  }

  function courseDialog(c) {
    const isNew = !c;
    c = c || { id: '', code: '', name: '', group: '', room: '', teacher: '', color: '#0f766e', link: '' };
    openDialog(`<h2>${isNew ? 'Nýr áfangi' : 'Breyta áfanga'}</h2>
      <div class="two"><label>Kóði<input name="code" required value="${esc(c.code)}" placeholder="t.d. STÆR2RH05"></label>
      <label>Heiti<input name="name" required value="${esc(c.name)}"></label></div>
      <div class="two"><label>Hópur<input name="group" value="${esc(c.group)}"></label>
      <label>Stofa<input name="room" value="${esc(c.room)}"></label></div>
      <div class="two"><label>Kennari<input name="teacher" value="${esc(c.teacher)}"></label>
      <label>Litur<input type="color" name="color" value="${esc(c.color)}"></label></div>
      <label>Tengill (t.d. á Innu eða kennslukerfi)<input type="url" name="link" value="${esc(c.link)}"></label>
      <label>Athugasemdir<textarea name="notes" rows="3">${esc(c.notes)}</textarea></label>
      <div class="dlg-actions">${isNew ? '' : '<button value="delete" class="danger" formnovalidate>Eyða áfanga</button>'}<span></span><button value="cancel" formnovalidate>Hætta við</button><button class="primary" value="save">Vista</button></div>`,
    (data, mode) => {
      if (mode === 'delete') {
        ask(`Eyða ${c.code} ásamt tímum, kennsluáætlun og skilum?`, 'Eyða áfanga').then((ok) => {
          if (!ok) return;
          S.courses = S.courses.filter((x) => x !== c);
          S.slots = S.slots.filter((s) => s.course !== c.id);
          S.tasks = S.tasks.filter((t) => t.course !== c.id);
          delete S.plans[c.id];
          save(); render();
        });
        return;
      }
      Object.assign(c, data);
      if (isNew) { c.id = uid(); S.courses.push(c); }
    });
  }

  /* ---------- Aðgerðir ---------- */
  const ACT = {
    week: (el) => { const n = Number(el.dataset.n); weekOf = n ? addDays(weekOf, n) : monday(today()); render(); },
    newTask: (el) => taskDialog(null, el.dataset.course),
    editTask: (el) => {
      const t = S.tasks.find((x) => x.id === el.dataset.id);
      if (t) (el.dataset.edit ? taskDialog(t) : taskDetail(t));
    },
    doneTask: (el) => {
      const t = S.tasks.find((x) => x.id === el.dataset.id);
      if (!t) return;
      t.done = !t.done;
      if (t.done && !t.submitted) t.submitted = today();
      if (!t.done) delete t.submitted;
      save(); render(); taskDetail(t, true);
    },
    delCheck: (el) => {
      const t = detailTask(); if (!t) return;
      const id = el.dataset.k.slice(4);
      t.check = (t.check || []).filter((i) => i.id !== id);
      if (t.checked) delete t.checked[el.dataset.k];
      save(); render(); taskDetail(t, true);
    },
    closeDlg: () => $('#dlg').close(),
    quizStart: (el) => { const t = S.tasks.find((x) => x.id === (el.dataset.id || (Q && Q.task))); if (t && quizOf(t)) startQuiz(t, el.dataset.n); },
    quizAnswer: (el) => {
      if (!Q || Q.picked !== null) return;
      const q = Q.qs[Q.i];
      Q.picked = Number(el.dataset.i);
      if (Q.picked === q.c) Q.right++; else Q.wrong.push(q);
      quizView();
    },
    quizNext: () => {
      if (!Q) return;
      Q.i++; Q.picked = null;
      if (Q.i >= Q.qs.length) {
        const t = S.tasks.find((x) => x.id === Q.task);
        const pct = Math.round((100 * Q.right) / Q.qs.length);
        t.quiz = { last: pct, best: Math.max(pct, (t.quiz && t.quiz.best) || 0), date: today() };
        save(); render();
      }
      quizView();
    },
    quizUncheck: () => {
      const t = S.tasks.find((x) => x.id === Q.task);
      const refs = [...new Set(Q.wrong.map((q) => q.ref).filter(Boolean))];
      t.checked = t.checked || {};
      refs.forEach((r) => { t.checked[r] = false; });
      save(); render();
      toast(`Hak tekið af ${refs.length} atriðum`);
    },
    quizBack: () => { const t = Q && S.tasks.find((x) => x.id === Q.task); Q = null; if (t) taskDetail(t); else $('#dlg').close(); },
    toggleTask: (el) => { const t = S.tasks.find((x) => x.id === el.dataset.id); if (t) { t.done = el.checked; if (t.done && !t.submitted) t.submitted = today(); if (!t.done) delete t.submitted; save(); setTimeout(render, 250); } },
    filter: (el) => { taskFilter = el.dataset.k; render(); },
    newCourse: () => courseDialog(null),
    editCourse: (el) => courseDialog(S.courses.find((c) => c.id === el.dataset.id)),
    delSlot: (el) => { S.slots.splice(Number(el.dataset.i), 1); save(); render(); },
    delEvent: (el) => { S.events = S.events.filter((e) => e.id !== el.dataset.id); save(); render(); },
    past: (el) => { showPast = el.checked; render(); },
    export: () => download(`namid-${today()}.json`, JSON.stringify(S, null, 2), 'application/json'),
    import: () => $('#file').click(),
    reset: () => {
      ask('Eyða öllu og byrja aftur með upphaflegu stundaskránni, dagatalinu og kennsluáætlunum?', 'Byrja upp á nýtt').then((ok) => {
        if (!ok) return;
        S = applyPacks(clone(D)); delete S.dirty; save(); render(); toast('Byrjað upp á nýtt');
      });
    }
  };

  const FORMS = {
    addCheck: (f) => {
      const t = detailTask(); if (!t) return;
      const text = f.elements.text.value.trim(); if (!text) return;
      (t.check = t.check || []).push({ id: uid(), text });
      save(); render(); taskDetail(t, true);
      $('#addCheckText').focus();
    },
    slot: (f) => {
      const v = Object.fromEntries(new FormData(f));
      if (v.end <= v.start) { toast('Tíminn þarf að enda eftir að hann byrjar'); return; }
      S.slots.push({ term: v.term, course: v.course, day: Number(v.day), start: v.start, end: v.end });
      save(); render(); toast('Tíma bætt við');
    },
    event: (f) => {
      const v = Object.fromEntries(new FormData(f));
      const e = { id: uid(), own: true, date: v.date, title: v.title.trim(), kind: v.kind };
      if (v.end && v.end > v.date) e.end = v.end;
      S.events.push(e); save(); render(); toast('Viðburður vistaður');
    },
    settings: async (f) => {
      const v = Object.fromEntries(new FormData(f));
      const st = S.settings;
      st.classLead = Number(v.classLead) || 0;
      st.taskDaysBefore = Number(v.taskDaysBefore) || 0;
      st.taskHour = v.taskHour || '08:00';
      const want = !!v.notify;
      if (want && Notification.permission !== 'granted') {
        const p = await Notification.requestPermission();
        st.notify = p === 'granted';
        if (!st.notify) toast('Tilkynningar voru ekki leyfðar');
      } else st.notify = want;
      save(); render(); toast('Stillingar vistaðar');
      tick();
    },
    ics: (f) => {
      const v = Object.fromEntries(new FormData(f));
      download('namid.ics', buildIcs({ cls: !!v.cls, tasks: !!v.tasks, events: !!v.events }), 'text/calendar');
    }
  };

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el || !ACT[el.dataset.act]) return;
    if (el.tagName !== 'INPUT') ev.preventDefault();
    ACT[el.dataset.act](el);
  });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('[data-form]');
    if (!f) return;
    ev.preventDefault();
    FORMS[f.dataset.form](f);
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.dataset && el.dataset.check) {
      const t = detailTask(); if (!t) return;
      (t.checked = t.checked || {})[el.dataset.check] = el.checked;
      el.closest('li').classList.toggle('on', el.checked);
      const p = progress(t);
      const bar = $('#dlg .prog i'); if (bar) bar.style.width = Math.round(100 * p.done / p.total) + '%';
      const txt = $('#dlg [data-prog]'); if (txt) txt.textContent = progText(p);
      save(); render();
      return;
    }
    if (!el.dataset || !el.dataset.plan) return;
    const list = S.plans[el.dataset.plan] = S.plans[el.dataset.plan] || [];
    let p = list.find((x) => x.week === el.dataset.week);
    if (!p) { p = { id: uid(), week: el.dataset.week, topic: '', reading: '', notes: '' }; list.push(p); list.sort((a, b) => a.week.localeCompare(b.week)); }
    p[el.dataset.f] = el.value.trim();
    save();
    flash('Vistað');
  });
  window.addEventListener('hashchange', () => { tab = (location.hash || '#idag').slice(1); render(); window.scrollTo(0, 0); });

  $('#file').addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    file.text().then((txt) => {
      const data = JSON.parse(txt);
      if (!data || !data.version || !Array.isArray(data.courses)) throw new Error('snið');
      S = normalize(data); save(); render(); toast('Afrit opnað');
    }).catch(() => toast('Þetta er ekki afrit úr forritinu'));
    ev.target.value = '';
  });

  /* ---------- Skrár ---------- */
  async function download(name, text, type) {
    if (window.claude && window.claude.use) {
      const dl = await window.claude.use('downloads').catch(() => null);
      if (dl) {
        try { await dl.save({ filename: name, data: new Blob([text], { type }) }); toast('Skrá vistuð'); }
        catch (e) { toast(e && e.code === 'declined' ? 'Hætt við' : 'Ekki tókst að vista skrána hér'); }
        return;
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function buildIcs(opt) {
    const stamp = (date, time) => {
      const [h, m] = time.split(':').map(Number);
      const d = parse(date); d.setHours(h, m, 0, 0);
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    const day = (s) => s.replace(/-/g, '');
    const txt = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const dur = (min) => {
      const neg = min < 0; let a = Math.abs(min);
      const d = Math.floor(a / 1440); a %= 1440;
      const h = Math.floor(a / 60), m = a % 60;
      let s = 'P' + (d ? d + 'D' : '');
      if (h || m || !d) s += 'T' + (h ? h + 'H' : '') + (m || !h ? m + 'M' : '');
      return (neg ? '-' : '') + s;
    };
    const alarm = (trigger, text) => ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${txt(text)}`, `TRIGGER:${trigger}`, 'END:VALARM'];
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Namid//IS', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Námið', 'X-WR-TIMEZONE:Atlantic/Reykjavik'];
    const ev = (uidv, lines) => L.push('BEGIN:VEVENT', `UID:${uidv}@namid`, `DTSTAMP:${now}`, ...lines, 'END:VEVENT');
    const d0 = today();
    const st = S.settings;

    if (opt.cls) {
      S.terms.filter((t) => t.end >= d0).forEach((t) => {
        for (let d = t.start < d0 ? d0 : t.start; d <= t.end; d = addDays(d, 1)) {
          if (noClass(d)) continue;
          blocksOn(d).forEach((b) => {
            const c = course(b.course);
            const lines = [`DTSTART:${stamp(d, b.start)}`, `DTEND:${stamp(d, b.end)}`, `SUMMARY:${txt(courseLabel(c))}`];
            if (c.room) lines.push(`LOCATION:${txt('Stofa ' + c.room)}`);
            const p = planFor(c.id, d);
            if (p && p.topic) lines.push(`DESCRIPTION:${txt(p.topic + (p.reading ? '\n' + p.reading : ''))}`);
            if (st.classLead > 0) lines.push(...alarm(dur(-st.classLead), courseLabel(c)));
            ev(`c-${d}-${b.start.replace(':', '')}-${c.id}`, lines);
          });
        }
      });
    }
    if (opt.tasks) {
      S.tasks.filter((t) => !t.done && t.due).forEach((t) => {
        const c = t.course ? course(t.course) : null;
        const title = `${c ? c.code + ': ' : ''}${TASK_KIND[t.kind] === 'Próf' ? 'Próf – ' : 'Skil – '}${t.title}`;
        const lines = [`SUMMARY:${txt(title)}`];
        if (t.notes) lines.push(`DESCRIPTION:${txt(t.notes)}`);
        let base;
        if (t.time) {
          lines.unshift(`DTSTART:${stamp(t.due, t.time)}`, `DTEND:${stamp(t.due, t.time)}`);
          base = toMin(t.time);
        } else {
          lines.unshift(`DTSTART;VALUE=DATE:${day(t.due)}`, `DTEND;VALUE=DATE:${day(addDays(t.due, 1))}`);
          base = 0;
        }
        // Áminning kl. taskHour nokkrum dögum fyrir og að morgni skiladags.
        const hour = toMin(st.taskHour);
        lines.push(...alarm(dur(-st.taskDaysBefore * 1440 + hour - base), title));
        if (st.taskDaysBefore > 0) lines.push(...alarm(dur(hour - base), title));
        ev(`t-${t.id}`, lines);
      });
    }
    if (opt.events) {
      S.events.filter((e) => (e.end || e.date) >= d0).forEach((e, i) => {
        const lines = [`DTSTART;VALUE=DATE:${day(e.date)}`, `DTEND;VALUE=DATE:${day(addDays(e.end || e.date, 1))}`, `SUMMARY:${txt(e.title)}`, 'TRANSP:TRANSPARENT'];
        if (e.kind === 'fri' || e.kind === 'namsmat' || e.kind === 'frestur') lines.push(...alarm(dur(-1440 + toMin(st.taskHour)), e.title));
        ev(`e-${e.date}-${i}`, lines);
      });
    }
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }
  // Línur í .ics mega ekki vera lengri en 75 bæti.
  function fold(line) {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const out = []; let cur = '';
    for (const ch of line) {
      if (enc.encode(cur + ch).length > (out.length ? 74 : 75)) { out.push(cur); cur = ''; }
      cur += ch;
    }
    out.push(cur);
    return out.join('\r\n ');
  }

  /* ---------- Tilkynningar ---------- */
  function getSent() { try { return JSON.parse(localStorage.getItem(SENT_KEY)) || {}; } catch (e) { return {}; } }
  function notify(title, body, tag) {
    const opts = { body, tag, icon: 'icon.svg', badge: 'icon.svg' };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((r) => r.showNotification(title, opts)).catch(() => {});
    } else {
      try { new Notification(title, opts); } catch (e) { /* t.d. iOS utan heimaskjás */ }
    }
  }
  function tick() {
    const st = S.settings;
    if (!st.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
    const d = today(), m = nowMin();
    const sent = getSent();
    const once = (k, fn) => { if (!sent[k]) { sent[k] = d; fn(); } };
    if (!noClass(d)) {
      blocksOn(d).forEach((b) => {
        const left = toMin(b.start) - m;
        if (left >= 0 && left <= st.classLead) {
          const c = course(b.course);
          once(`c:${d}:${b.start}:${b.course}`, () => notify(`${c.code} kl. ${fmtTime(b.start)}`, `${c.name}${c.room ? ' · stofa ' + c.room : ''} · eftir ${left} mín.`, 'c' + b.start));
        }
      });
    }
    if (m >= toMin(st.taskHour)) {
      openTasks().filter((t) => t.due && diffDays(d, t.due) >= 0 && diffDays(d, t.due) <= st.taskDaysBefore).forEach((t) => {
        const c = t.course ? course(t.course) : null;
        once(`t:${d}:${t.id}`, () => notify(`${c ? c.code + ': ' : ''}${t.title}`, `Skil ${relDays(t.due)}${t.time ? ' kl. ' + fmtTime(t.time) : ''}`, 't' + t.id));
      });
      const tm = addDays(d, 1);
      eventsOn(tm).filter((e) => e.date === tm && e.kind !== 'vidburdur').forEach((e) => {
        once(`e:${d}:${e.title}`, () => notify(`Á morgun: ${e.title}`, KIND[e.kind] || '', 'e' + e.date));
      });
    }
    // Hreinsa eldri færslur
    Object.keys(sent).forEach((k) => { if (sent[k] < addDays(d, -3)) delete sent[k]; });
    try { localStorage.setItem(SENT_KEY, JSON.stringify(sent)); } catch (e) { /* ekkert */ }
  }

  /* ---------- Smáskilaboð ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }
  const flash = toast;

  /* ---------- Ræsing ---------- */
  render();
  tick();
  setInterval(() => {
    tick();
    if (tab === 'idag' && !document.querySelector('dialog[open]')) render();
  }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); if (tab === 'idag') render(); } });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

  // Fyrir prófanir í vafra
  window.NAM = { get state() { return S; }, blocksOn, noClass, buildIcs };
})();

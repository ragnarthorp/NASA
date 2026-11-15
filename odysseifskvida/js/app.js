/* Lestrarstofa – Ódysseifskviða: viðmót.
   Allur nemendatexti og innfluttur texti er settur inn sem texti (textContent), aldrei sem HTML. */
(function () {
  'use strict';
  const C = window.OdyCore;
  const DATA = window.ODY_TEXT;
  const $ = id => document.getElementById(id);
  const VENDOR = '../vendor/';

  const LINE_HEIGHTS = { thett: 1.45, venjulegt: 1.7, rumt: 2.0 };
  const WIDTHS = { mjor: '28em', midlungs: '36em', breidur: '46em' };
  const SIDE_MIN = 1060; // lágmarksbreidd fyrir hliðarspjald (iPad lárétt)

  const ICONS = {
    endursogn: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    athugasemd: '<path d="M4 5h16v11H9l-5 4z"/>',
    spurning: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14"/><path d="M12 17.2v.3"/>',
    endurvinnsla: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/>',
    tilvitnun: '<path d="M7 7H4v6h4v-1c0 2-1 3.5-3 4"/><path d="M17 7h-3v6h4v-1c0 2-1 3.5-3 4"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  };
  const svg = (name, cls) => `<svg aria-hidden="true" viewBox="0 0 24 24"${cls ? ` class="${cls}"` : ''}>${ICONS[name]}</svg>`;

  if (!DATA || !C) {
    document.body.textContent = 'Textagögn hlóðust ekki. Gakktu úr skugga um að data/odysseifskvida.js sé til staðar.';
    return;
  }
  const index = C.buildIndex(DATA);
  const sections = index.sections;

  const state = {
    sectionId: 'titill',
    notes: [],
    settings: Object.assign({}, C.DEFAULT_SETTINGS),
    position: null,
    filter: { sectionId: '', type: '' },
    store: null,
    saveChain: Promise.resolve(),
    pending: null,          // gilt textaval {anchor}
    editor: null,           // {mode:'new'|'edit', noteId, anchor, origin, insertedText}
    lastDeleted: null,
    panelOpen: false,
  };

  /* ---------------- vistun ---------------- */
  function setSaveStatus(kind, text) {
    const el = $('saveStatus');
    el.className = 'save-status ' + (kind || '');
    el.textContent = text;
  }
  function persist(keys) {
    const entries = keys.map(k => [k, k === 'notes' ? state.notes : k === 'settings' ? state.settings : k === 'position' ? state.position : k === 'draft' ? state.draft || null : null]);
    // afrit tekið strax svo síðari breytingar hafi ekki áhrif á það sem er verið að vista
    const snapshot = entries.map(([k, v]) => [k, v == null ? null : JSON.parse(JSON.stringify(v))]);
    const isNotes = keys.includes('notes');
    if (isNotes) setSaveStatus('', 'Vistar…');
    const p = state.saveChain.then(async () => {
      if (!state.store) throw new Error(state.storeError || 'Vistun er ekki tiltæk.');
      await state.store.setMany(snapshot);
    });
    state.saveChain = p.catch(() => {});
    return p.then(() => {
      clearBanner('save-error');
      if (isNotes || keys.includes('draft')) {
        const t = new Date();
        setSaveStatus('ok', `Vistað í þessu tæki kl. ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`);
      }
      return true;
    }, err => {
      setSaveStatus('error', 'Ekki tókst að vista í þessu tæki.');
      showBanner('save-error', 'error', `Ekki tókst að vista í þessu tæki: ${err && err.message || err}. Vistaðu vinnuskrá (Glósur → Vista vinnuskrá) svo vinnan tapist ekki.`,
        [{ label: 'Vista vinnuskrá', action: saveWorkfile }]);
      return false;
    });
  }

  /* ---------------- borðar og tilkynningar ---------------- */
  function showBanner(id, kind, text, actions) {
    clearBanner(id);
    const b = document.createElement('div');
    b.className = 'banner ' + (kind || '');
    b.dataset.id = id;
    if (kind === 'error') b.setAttribute('role', 'alert');
    const p = document.createElement('p'); p.textContent = text; b.appendChild(p);
    for (const a of actions || []) {
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = a.label;
      btn.addEventListener('click', () => { if (a.close !== false) clearBanner(id); a.action(); });
      b.appendChild(btn);
    }
    $('banners').appendChild(b);
  }
  function clearBanner(id) { const b = $('banners').querySelector(`[data-id="${id}"]`); if (b) b.remove(); }

  let toastTimer = null;
  function toast(text, action, ms) {
    const t = $('toast');
    t.innerHTML = '';
    const p = document.createElement('p'); p.textContent = text; t.appendChild(p);
    if (action) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = action.label;
      b.addEventListener('click', () => { hideToast(); action.run(); });
      t.appendChild(b);
    }
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, ms || (action ? 12000 : 3500));
  }
  function hideToast() { $('toast').hidden = true; }

  /* ---------------- stillingar ---------------- */
  function applySettings() {
    const s = state.settings;
    const r = document.documentElement;
    r.dataset.theme = s.theme;
    r.dataset.font = s.font;
    r.style.setProperty('--fs', s.fontSize + 'px');
    r.style.setProperty('--lh', LINE_HEIGHTS[s.lineHeight]);
    r.style.setProperty('--measure', WIDTHS[s.width]);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(r).getPropertyValue('--bg').trim() || '#fbfaf7';
    $('fsValue').textContent = s.fontSize + ' px';
    $('fsDown').disabled = s.fontSize <= C.FONT_MIN;
    $('fsUp').disabled = s.fontSize >= C.FONT_MAX;
    for (const name of ['font', 'lineHeight', 'width', 'theme']) {
      for (const inp of document.querySelectorAll(`#settingsDlg input[name="${name}"]`)) inp.checked = inp.value === s[name];
    }
    refreshHighlights();
  }
  function changeSetting(k, v) {
    const anchorUnit = currentTopUnit();
    state.settings = C.sanitizeSettings(Object.assign({}, state.settings, { [k]: v }));
    applySettings();
    if (anchorUnit) scrollToUnit(anchorUnit, false);
    persist(['settings']);
  }

  /* ---------------- birting kafla ---------------- */
  function el(tag, attrs, text) {
    const e = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v; else if (k === 'dataset') Object.assign(e.dataset, v); else e.setAttribute(k, v);
    }
    if (text != null) e.textContent = text;
    return e;
  }

  function noteButton(u) {
    const b = el('button', { type: 'button', class: 'nb', 'data-note-unit': u.id });
    b.innerHTML = svg('pen') + '<span class="c" aria-hidden="true"></span>';
    return b;
  }
  function unitRow(u, tag, wrapTag) {
    const row = el(wrapTag || 'div', { class: 'u-row', 'data-row': u.id });
    const t = el(tag, { class: 'u', 'data-unit': u.id, id: 'u-' + u.id });
    if (u.type === 'nafn' && u.termLength > 0) {
      t.appendChild(el('strong', null, u.text.slice(0, u.termLength)));
      t.appendChild(document.createTextNode(u.text.slice(u.termLength)));
    } else {
      t.textContent = u.text;
    }
    row.appendChild(t);
    row.appendChild(noteButton(u));
    return row;
  }

  function renderSection(id, opts) {
    const sec = index.sectionById.get(id) || sections[0];
    state.sectionId = sec.id;
    hideSelbar();
    const art = $('article');
    art.innerHTML = '';
    art.setAttribute('aria-labelledby', 'secTitle');
    art.lang = 'is';
    if (sec.kind === 'titill') renderCover(sec, art);
    else {
      const head = el('header', { class: 'sec-head' });
      head.appendChild(el('p', { class: 'kicker' }, sec.kicker));
      head.appendChild(el('h1', { id: 'secTitle' }, sec.title));
      art.appendChild(head);
      let list = null;
      for (let i = 0; i < sec.units.length; i++) {
        const u = sec.units[i];
        if (u.type === 'tilvitnun') {
          const q = el('div', { class: 'qblock' });
          q.appendChild(unitRow(u, 'blockquote'));
          const nxt = sec.units[i + 1];
          if (nxt && nxt.type === 'heimild' && nxt.quoteId === u.id) { q.appendChild(unitRow(nxt, 'p')); i++; }
          art.appendChild(q);
        } else if (u.type === 'heimild') {
          const q = el('div', { class: 'qblock' }); q.appendChild(unitRow(u, 'p')); art.appendChild(q);
        } else if (u.type === 'nafn') {
          if (!list) { list = el('ul', { class: 'names' }); art.appendChild(list); }
          list.appendChild(unitRow(u, 'p', 'li'));
        } else {
          art.appendChild(unitRow(u, 'p'));
        }
      }
      for (const s of art.querySelectorAll('.qblock p.u')) s.classList.add('src');
    }
    renderChapnav(sec);
    $('curSection').textContent = sec.kind === 'titill' ? 'Forsíða' : C.sectionLabel(sec);
    document.title = (sec.kind === 'titill' ? '' : C.sectionShort(sec) + ' · ') + 'Ódysseifskviða – lestrarstofa';
    updateNoteButtons();
    refreshHighlights();
    renderToc();
    if (!opts || !opts.keepScroll) window.scrollTo(0, 0);
    if (!opts || !opts.noSave) { state.position = { sectionId: sec.id, unitId: null }; persist(['position']); }
  }

  function renderCover(sec, art) {
    const wrap = el('div', { class: 'cover' });
    const t = sec.units;
    wrap.appendChild(el('p', { class: 'c-kicker' }, sec.kicker));
    wrap.appendChild(el('h1', { id: 'secTitle' }, sec.title));
    // titilsíðutexti úr PDF (síður 1–2)
    const sub = t.find(u => u.pages[0].pdfPage === 1 && /Tíu ára/.test(u.text));
    const sub2 = t.find(u => u.pages[0].pdfPage === 2 && /Saga Hómers/.test(u.text));
    const trans = t.find(u => /Sveinbjarnar/.test(u.text));
    if (sub) wrap.appendChild(el('p', { class: 'c-sub' }, sub.text));
    if (sub2) wrap.appendChild(el('p', { class: 'c-sub' }, sub2.text));
    if (trans) wrap.appendChild(el('p', { class: 'c-sub2' }, trans.text));

    const pos = state.position;
    if (pos && pos.sectionId && pos.sectionId !== 'titill' && index.sectionById.has(pos.sectionId)) {
      const b = el('button', { type: 'button', class: 'primary continue' }, 'Halda áfram: ' + C.sectionLabel(index.sectionById.get(pos.sectionId)));
      b.addEventListener('click', () => goToSection(pos.sectionId, pos.unitId));
      wrap.appendChild(b);
    } else {
      const b = el('button', { type: 'button', class: 'primary continue' }, 'Byrja að lesa: Formáli');
      b.addEventListener('click', () => goToSection('formali'));
      wrap.appendChild(b);
    }

    const how = el('section', { class: 'howto', 'aria-labelledby': 'howTitle' });
    how.appendChild(el('h2', { id: 'howTitle' }, 'Svona virkar lestrarstofan'));
    const ol = el('ol');
    ['Veldu setningu eða efnisgrein í textanum (haltu fingri á orði og dragðu valhandföngin).',
      'Veldu „Skrifa eigin glósu“ eða „Endurvinna valinn texta“ neðst á skjánum.',
      'Þú getur líka ýtt á pennann við hverja efnisgrein til að skrifa glósu við hana.',
      'Glósurnar þínar eru undir „Glósur“. Þar getur þú breytt þeim, síað og flutt út sem PDF eða Markdown.'].forEach(x => ol.appendChild(el('li', null, x)));
    how.appendChild(ol);
    how.appendChild(el('p', null, 'Vinnan vistast sjálfkrafa í þessum vafra á þessu tæki – ekki á Google Drive. Safari getur eytt vistuðum gögnum vefsíðu sem hefur ekki verið opnuð í nokkra daga, og þau hverfa ef vafragögn eru hreinsuð. Notaðu því „Vista vinnuskrá“ áður en þú hættir; þá getur þú opnað vinnuna aftur síðar eða í öðru tæki.'));
    wrap.appendChild(how);

    wrap.appendChild(el('h2', { class: 'sr-only' }, 'Efnisyfirlit'));
    const toc = el('ol', { class: 'toc', id: 'coverToc' });
    wrap.appendChild(toc);
    art.appendChild(wrap);
  }

  function tocItems(list) {
    list.innerHTML = '';
    for (const s of sections) {
      if (s.kind === 'titill' && list.id === 'coverToc') continue;
      const li = el('li');
      const b = el('button', { type: 'button', 'data-goto': s.id });
      const num = s.kind === 'thattur' ? s.numeral : '';
      b.appendChild(el('span', { class: 'num' }, num));
      const label = s.kind === 'thattur' ? s.title : s.kind === 'titill' ? 'Forsíða' : s.kind === 'formali' ? 'Formáli: ' + s.title : s.kind === 'um-bokina' ? 'Um bókina: ' + s.title : s.title;
      b.appendChild(el('span', null, label));
      const cnt = state.notes.filter(n => n.anchor && n.anchor.sectionId === s.id).length;
      b.appendChild(el('span', { class: 'cnt' }, cnt ? `${cnt} ${cnt === 1 ? 'glósa' : 'glósur'}` : ''));
      if (s.kind === 'thattur') b.setAttribute('aria-label', `${s.numeral}. þáttur: ${s.title}${cnt ? `, ${cnt} ${cnt === 1 ? 'glósa' : 'glósur'}` : ''}`);
      if (s.id === state.sectionId) b.setAttribute('aria-current', 'true');
      li.appendChild(b);
      list.appendChild(li);
    }
  }
  function renderToc() {
    tocItems($('tocList'));
    const ct = $('coverToc');
    if (ct) tocItems(ct);
  }

  function renderChapnav(sec) {
    const nav = $('chapnav');
    nav.innerHTML = '';
    const i = sections.indexOf(sec);
    const mk = (s, cls, dir) => {
      const b = el('button', { type: 'button', class: cls, 'data-goto': s.id });
      b.appendChild(el('span', { class: 'dir' }, dir));
      b.appendChild(el('span', null, s.kind === 'titill' ? 'Forsíða' : C.sectionLabel(s)));
      return b;
    };
    if (i > 0) nav.appendChild(mk(sections[i - 1], 'prev', '← Fyrri kafli'));
    if (i < sections.length - 1) nav.appendChild(mk(sections[i + 1], 'next', 'Næsti kafli →'));
  }

  function goToSection(id, unitId) {
    renderSection(id, { noSave: true });
    state.position = { sectionId: id, unitId: unitId || null };
    persist(['position']);
    if (unitId) requestAnimationFrame(() => scrollToUnit(unitId, false));
    else { const h = $('secTitle'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  }

  function unitEl(unitId) { return $('u-' + unitId); }
  function topOffset() { return $('banners').getBoundingClientRect().bottom + 12; }
  function scrollToUnit(unitId, smooth) {
    const e = unitEl(unitId);
    if (!e) return;
    const y = e.getBoundingClientRect().top + window.scrollY - topOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
  }
  function currentTopUnit() {
    const top = topOffset();
    for (const e of document.querySelectorAll('#article [data-unit]')) {
      if (e.getBoundingClientRect().bottom > top) return e.dataset.unit;
    }
    return null;
  }
  let posTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(posTimer);
    posTimer = setTimeout(() => {
      if (state.sectionId === 'titill') return;
      const u = currentTopUnit();
      if (!state.position || state.position.unitId !== u || state.position.sectionId !== state.sectionId) {
        state.position = { sectionId: state.sectionId, unitId: u };
        persist(['position']);
      }
    }, 700);
  }, { passive: true });

  /* ---------------- glósumerki í texta ---------------- */
  function updateNoteButtons() {
    for (const b of document.querySelectorAll('#article .nb')) {
      const uid = b.dataset.noteUnit;
      const u = index.unitById.get(uid).unit;
      const n = C.notesForUnit(state.notes, uid).length;
      b.classList.toggle('has', n > 0);
      b.querySelector('.c').textContent = n ? String(n) : '';
      const label = `Glósa við efnisgrein ${u.n}` + (n ? ` (${n} ${n === 1 ? 'glósa' : 'glósur'} fyrir)` : '');
      b.setAttribute('aria-label', label);
      b.title = label;
    }
    $('noteCount').textContent = String(state.notes.length);
    $('btnNotes').setAttribute('aria-label', `Glósur (${state.notes.length})`);
  }

  /* Breytir stafastaðsetningu innan einingar í DOM-staðsetningu (textahnút + hliðrun). */
  function domPoint(unitElement, offset) {
    const w = document.createTreeWalker(unitElement, NodeFilter.SHOW_TEXT);
    let left = offset, node, last = null;
    while ((node = w.nextNode())) {
      if (left <= node.length) return { node, offset: left };
      left -= node.length; last = node;
    }
    return last ? { node: last, offset: last.length } : { node: unitElement, offset: 0 };
  }
  function rangeForAnchor(a) {
    const s = unitEl(a.start.unitId), e = unitEl(a.end.unitId);
    if (!s || !e) return null;
    const p1 = domPoint(s, a.start.offset), p2 = domPoint(e, a.end.offset);
    const r = document.createRange();
    r.setStart(p1.node, p1.offset); r.setEnd(p2.node, p2.offset);
    return r;
  }
  const HL = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';
  function refreshHighlights() {
    if (!HL) return;
    const ranges = [];
    for (const n of state.notes) {
      if (n.orphan || !n.anchor || n.anchor.sectionId !== state.sectionId) continue;
      const r = rangeForAnchor(n.anchor);
      if (r) ranges.push(r);
    }
    CSS.highlights.set('ody-notes', new Highlight(...ranges));
  }
  let flashTimer = null;
  function flashAnchor(a) {
    clearTimeout(flashTimer);
    for (const r of document.querySelectorAll('.u-row.flash')) r.classList.remove('flash');
    if (HL) {
      const r = rangeForAnchor(a);
      if (r) CSS.highlights.set('ody-flash', new Highlight(r));
    } else {
      for (const id of a.unitIds) { const row = document.querySelector(`[data-row="${id}"]`); if (row) row.classList.add('flash'); }
    }
    flashTimer = setTimeout(() => {
      if (HL) CSS.highlights.delete('ody-flash');
      for (const r of document.querySelectorAll('.u-row.flash')) r.classList.remove('flash');
    }, 4000);
  }

  /* ---------------- textaval ---------------- */
  /* Stafastaðsetning DOM-punkts innan einingar: lengd textans frá upphafi einingar að punktinum. */
  function offsetIn(unitElement, node, off) {
    const r = document.createRange();
    r.setStart(unitElement, 0);
    r.setEnd(node, off);
    return r.toString().length;
  }
  function pointToPos(node, off, isStart) {
    const art = $('article');
    if (!art.contains(node)) return null;
    const host = (node.nodeType === 1 ? node : node.parentElement).closest('[data-unit]');
    if (host && art.contains(host)) return { unitId: host.dataset.unit, offset: offsetIn(host, node, off) };
    // punktur utan textaeiningar (t.d. á hnappi eða bili milli efnisgreina) → næsta eining
    const pt = document.createRange();
    pt.setStart(node, off); pt.collapse(true);
    const units = Array.from(art.querySelectorAll('[data-unit]'));
    if (isStart) {
      for (const u of units) if (pt.comparePoint(u, 0) >= 0) return { unitId: u.dataset.unit, offset: 0 };
    } else {
      for (let i = units.length - 1; i >= 0; i--) {
        const u = units[i];
        if (pt.comparePoint(u, u.childNodes.length) <= 0) return { unitId: u.dataset.unit, offset: u.textContent.length };
      }
    }
    return null;
  }
  function anchorFromSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    if (state.sectionId === 'titill') return null;
    const r = sel.getRangeAt(0);
    const a = pointToPos(r.startContainer, r.startOffset, true);
    const b = pointToPos(r.endContainer, r.endOffset, false);
    if (!a || !b) return null;
    const res = C.makeAnchor(index, a, b);
    return res.ok ? res.anchor : null;
  }

  let hideTimer = null, barPressed = false;
  document.addEventListener('selectionchange', () => {
    if (anyDialogOpen()) return;
    const a = anchorFromSelection();
    if (a) {
      clearTimeout(hideTimer);
      state.pending = a;
      showSelbar(a);
    } else if (state.pending && !barPressed) {
      clearTimeout(hideTimer);
      // Bið stutta stund: á iPad getur valið horfið rétt áður en ýtt er á hnapp í valstikunni.
      hideTimer = setTimeout(() => { if (!barPressed) hideSelbar(); }, 900);
    }
  });
  function showSelbar(a) {
    const loc = C.locationParts(index, a);
    const preview = a.quote.replace(/\s+/g, ' ');
    $('sbInfo').textContent = `Valið: „${preview.length > 60 ? preview.slice(0, 60) + '…' : preview}“ · ${loc.pages} · ${loc.paras}`;
    $('selbar').hidden = false;
  }
  function hideSelbar() { $('selbar').hidden = true; state.pending = null; barPressed = false; }
  const selbar = $('selbar');
  selbar.addEventListener('pointerdown', () => { barPressed = true; clearTimeout(hideTimer); });
  selbar.addEventListener('mousedown', e => e.preventDefault()); // heldur valinu á borðtölvum
  $('sbOwn').addEventListener('click', () => { const a = state.pending; hideSelbar(); if (a) openEditor({ mode: 'new', anchor: a, origin: 'own' }); });
  $('sbRecycle').addEventListener('click', () => { const a = state.pending; hideSelbar(); if (a) openEditor({ mode: 'new', anchor: a, origin: 'recycle' }); });

  /* ---------------- ritspjald ---------------- */
  function buildTypeRow() {
    const row = $('edTypeRow');
    row.innerHTML = '';
    for (const t of C.NOTE_TYPES) {
      const lab = el('label', { class: 't-' + t.id });
      const inp = el('input', { type: 'radio', name: 'edType', value: t.id });
      const span = el('span');
      span.innerHTML = svg(t.id);
      span.appendChild(document.createTextNode(t.label));
      lab.title = `${t.label} – ${t.hint}`;
      lab.appendChild(inp); lab.appendChild(span);
      row.appendChild(lab);
      inp.addEventListener('change', () => { updateGuide(); saveDraftSoon(); });
    }
  }
  function selectedType() { const i = document.querySelector('input[name="edType"]:checked'); return i ? i.value : 'athugasemd'; }
  function setType(t) { for (const i of document.querySelectorAll('input[name="edType"]')) i.checked = i.value === t; updateGuide(); }
  function updateGuide() {
    const ed = state.editor;
    const show = !!ed && (selectedType() === 'endurvinnsla' || ed.origin === 'recycle');
    $('edGuide').hidden = !show;
    $('edGuide').textContent = C.RECYCLE_GUIDANCE;
    $('edInsertRow').hidden = !ed || ed.insertedText != null;
  }

  function openEditor(opts) {
    const ed = Object.assign({ insertedText: null }, opts);
    const note = ed.noteId ? state.notes.find(n => n.id === ed.noteId) : null;
    if (note) { ed.anchor = note.anchor; ed.origin = note.origin; if (!ed.restore) ed.insertedText = note.insertedText; }
    state.editor = ed;
    const a = ed.anchor;
    const loc = C.locationParts(index, a);
    $('edTitle').textContent = ed.mode === 'edit' ? 'Breyta glósu' : ed.origin === 'recycle' ? 'Endurvinna valinn texta' : 'Ný glósa';
    $('edLoc').textContent = `${loc.section} · ${loc.pages} · ${loc.paras}`;
    $('edSrc').textContent = a.quote;
    let body = '', type = 'athugasemd';
    if (ed.restore) { body = ed.restore.body; type = ed.restore.type; }
    else if (note) { body = note.body; type = note.type; }
    else if (ed.origin === 'recycle') { body = a.quote; ed.insertedText = a.quote; type = 'endurvinnsla'; }
    $('edBody').value = body;
    ed.initialBody = body;
    setType(type);
    $('edNote').textContent = '';
    const dlg = $('editorDlg');
    $('edSrcWrap').open = window.innerHeight > 560 || ed.origin !== 'recycle';
    syncViewport();
    if (!dlg.open) dlg.showModal();
    const ta = $('edBody');
    ta.focus();
    if (ed.origin === 'recycle' && !note) { try { ta.setSelectionRange(0, 0); } catch (e) { /* */ } ta.scrollTop = 0; }
    saveDraftSoon();
  }

  function closeEditor() {
    state.editor = null;
    state.draft = null;
    persist(['draft']);
    const dlg = $('editorDlg');
    if (dlg.open) dlg.close();
  }

  let draftTimer = null;
  function saveDraftSoon() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      const ed = state.editor;
      if (!ed) return;
      state.draft = { mode: ed.mode, noteId: ed.noteId || null, anchor: ed.anchor, origin: ed.origin, insertedText: ed.insertedText, body: $('edBody').value, type: selectedType(), savedAt: new Date().toISOString() };
      persist(['draft']);
    }, 400);
  }
  $('edBody').addEventListener('input', saveDraftSoon);

  $('edInsert').addEventListener('click', () => {
    const ed = state.editor; if (!ed) return;
    const ta = $('edBody');
    const q = ed.anchor.quote;
    ta.value = ta.value.trim() ? ta.value.replace(/\s*$/, '') + '\n\n' + q : q;
    ed.insertedText = ta.value;
    ed.origin = 'recycle';
    setType('endurvinnsla');
    ta.focus();
    saveDraftSoon();
  });

  $('edSave').addEventListener('click', async () => {
    const ed = state.editor; if (!ed) return;
    clearTimeout(draftTimer);
    const body = $('edBody').value;
    let note;
    if (ed.mode === 'edit') {
      const old = state.notes.find(n => n.id === ed.noteId);
      if (!old) { closeEditor(); return; }
      note = C.finalizeNote(Object.assign({}, old, { body, type: selectedType(), insertedText: ed.insertedText, origin: ed.origin, updatedAt: new Date().toISOString() }));
      state.notes = state.notes.map(n => (n.id === note.id ? note : n));
    } else {
      note = C.finalizeNote(C.newNote(ed.anchor, { type: selectedType(), body, origin: ed.origin, insertedText: ed.insertedText }));
      state.notes = state.notes.concat([note]);
    }
    state.draft = null;
    const anchorSection = note.anchor.sectionId;
    state.editor = null;
    $('editorDlg').close();
    afterNotesChanged();
    const ok = await persist(['notes', 'draft']);
    const msg = note.unchangedCopy ? 'Textinn var óbreyttur og var vistaður sem „Tilvitnun“.' : 'Glósa vistuð.';
    toast(ok ? msg + ' Vistað í þessu tæki.' : 'Glósan er geymd í minni en vistun í tækinu mistókst. Vistaðu vinnuskrá.');
    if (anchorSection === state.sectionId) {
      const b = document.querySelector(`.nb[data-note-unit="${note.anchor.start.unitId}"]`);
      if (b) b.focus({ preventScroll: true });
    }
  });

  $('edCancel').addEventListener('click', () => {
    const ed = state.editor;
    if (ed && $('edBody').value !== ed.initialBody && $('edBody').value.trim()) {
      confirmDialog('Hætta við glósu?', [txt('Textinn sem þú skrifaðir verður ekki vistaður.')],
        [{ id: 'back', label: 'Halda áfram að skrifa' }, { id: 'discard', label: 'Henda texta', primary: true }]).then(r => {
        if (r === 'discard') closeEditor(); else $('edBody').focus();
      });
      return;
    }
    closeEditor();
  });
  $('editorDlg').addEventListener('cancel', e => { e.preventDefault(); $('edCancel').click(); });

  /* visualViewport: ritspjaldið fylgir sýnilega svæðinu þegar skjályklaborð opnast */
  function syncViewport() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    const top = vv ? vv.offsetTop : 0;
    document.documentElement.style.setProperty('--vv-h', h + 'px');
    document.documentElement.style.setProperty('--vv-top', top + 'px');
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewport);
    window.visualViewport.addEventListener('scroll', syncViewport);
  }
  window.addEventListener('resize', () => { syncViewport(); layoutPanel(); });
  $('edBody').addEventListener('focus', () => setTimeout(() => { syncViewport(); $('edBody').scrollIntoView({ block: 'nearest' }); }, 350));

  /* ---------------- glósuspjald ---------------- */
  function afterNotesChanged() {
    updateNoteButtons();
    refreshHighlights();
    renderNotes();
    renderToc();
  }

  function renderFilters() {
    const fs = $('fSection');
    fs.innerHTML = '';
    fs.appendChild(el('option', { value: '' }, 'Allir kaflar'));
    for (const s of sections) if (s.kind !== 'titill') fs.appendChild(el('option', { value: s.id }, s.kind === 'thattur' ? `${s.numeral}. ${s.title}` : C.sectionShort(s) === s.title ? s.title : `${C.sectionShort(s)}: ${s.title}`));
    fs.value = state.filter.sectionId;
    const ft = $('fType');
    ft.innerHTML = '';
    ft.appendChild(el('option', { value: '' }, 'Allar tegundir'));
    for (const t of C.NOTE_TYPES) ft.appendChild(el('option', { value: t.id }, t.label));
    ft.value = state.filter.type;
  }
  $('fSection').addEventListener('change', e => { state.filter.sectionId = e.target.value; renderNotes(); });
  $('fType').addEventListener('change', e => { state.filter.type = e.target.value; renderNotes(); });

  function filteredNotes() { return C.sortNotes(index, C.filterNotes(state.notes, state.filter)); }

  function renderNotes() {
    const list = $('noteList');
    list.innerHTML = '';
    const notes = filteredNotes();
    const total = state.notes.length;
    const filtered = !!(state.filter.sectionId || state.filter.type);
    $('filterInfo').textContent = filtered ? `Sýni ${notes.length} af ${total} glósum.` : `${total} ${total === 1 ? 'glósa' : 'glósur'} í röð textans.`;
    if (!notes.length) {
      list.appendChild(el('li', { class: 'empty' }, total ? 'Engar glósur passa við síuna.' : 'Engar glósur enn. Veldu texta eða ýttu á pennann við efnisgrein til að skrifa fyrstu glósuna.'));
      return;
    }
    for (const n of notes) list.appendChild(noteCard(n));
  }

  function noteCard(n) {
    const li = el('li', { class: 'note-card t-' + n.type, 'data-note': n.id, tabindex: '-1' });
    const head = el('div', { class: 'nc-head' });
    const tag = el('span', { class: 'type-tag t-' + n.type });
    tag.innerHTML = svg(n.type);
    tag.appendChild(document.createTextNode(C.typeLabel(n.type)));
    head.appendChild(tag);
    let locText = '';
    if (n.anchor) { const l = C.locationParts(index, n.anchor); locText = `${l.sectionShort} · ${l.pages} · ${l.paras}`; }
    head.appendChild(el('span', { class: 'nc-loc' }, locText));
    li.appendChild(head);
    if (n.orphan) li.appendChild(el('p', { class: 'nc-warn' }, 'Tenging við texta fannst ekki: ' + n.orphan));
    if (n.anchor) li.appendChild(el('blockquote', { class: 'nc-quote' }, n.anchor.quote));
    const body = n.body.trim();
    li.appendChild(el('p', { class: 'nc-body' + (body ? '' : ' emptyb') }, body ? n.body : '(tóm glósa)'));
    const act = el('div', { class: 'nc-actions' });
    const mk = (label, aria, fn, cls) => { const b = el('button', { type: 'button', 'aria-label': aria, class: cls || '' }, label); b.addEventListener('click', fn); act.appendChild(b); return b; };
    const short = locText;
    const go = mk('Fara á textastað', `Fara á textastað: ${short}`, () => goToNote(n.id));
    if (n.orphan) go.disabled = true;
    mk('Breyta', `Breyta glósu: ${short}`, () => openEditor({ mode: 'edit', noteId: n.id }));
    mk('Eyða', `Eyða glósu: ${short}`, () => deleteNote(n.id));
    li.appendChild(act);
    return li;
  }

  function goToNote(id) {
    const n = state.notes.find(x => x.id === id);
    if (!n || !n.anchor || n.orphan) return;
    if (!isSide()) closePanel(false);
    if (state.sectionId !== n.anchor.sectionId) renderSection(n.anchor.sectionId, { noSave: true });
    requestAnimationFrame(() => {
      scrollToUnit(n.anchor.start.unitId, true);
      flashAnchor(n.anchor);
      const e = unitEl(n.anchor.start.unitId);
      if (e) { e.tabIndex = -1; e.focus({ preventScroll: true }); }
      state.position = { sectionId: n.anchor.sectionId, unitId: n.anchor.start.unitId };
      persist(['position']);
    });
  }

  async function deleteNote(id) {
    const i = state.notes.findIndex(n => n.id === id);
    if (i < 0) return;
    const removed = state.notes[i];
    state.notes = state.notes.filter(n => n.id !== id);
    state.lastDeleted = { note: removed, index: i };
    afterNotesChanged();
    const ok = await persist(['notes']);
    toast(ok ? 'Glósu eytt.' : 'Glósu eytt úr minni, en vistun mistókst.', { label: 'Afturkalla', run: undoDelete });
    const first = $('noteList').querySelector('button');
    if (first) first.focus(); else $('notesTitle').focus();
  }
  async function undoDelete() {
    const d = state.lastDeleted; if (!d) return;
    state.lastDeleted = null;
    if (state.notes.some(n => n.id === d.note.id)) return;
    const arr = state.notes.slice();
    arr.splice(Math.min(d.index, arr.length), 0, d.note);
    state.notes = arr;
    afterNotesChanged();
    await persist(['notes']);
    toast('Glósan var endurheimt.');
    const card = document.querySelector(`[data-note="${d.note.id}"]`);
    if (card) card.focus();
  }

  const sideMQ = window.matchMedia(`(min-width: ${SIDE_MIN}px)`);
  function isSide() { return sideMQ.matches; }
  function layoutPanel() {
    const p = $('notesPanel');
    const side = isSide();
    p.classList.toggle('overlay', !side);
    document.body.classList.toggle('with-side', state.panelOpen && side);
    $('panelBackdrop').hidden = !(state.panelOpen && !side);
    p.setAttribute('role', side ? 'complementary' : 'dialog');
    if (!side) p.setAttribute('aria-modal', 'true'); else p.removeAttribute('aria-modal');
  }
  sideMQ.addEventListener ? sideMQ.addEventListener('change', layoutPanel) : sideMQ.addListener(layoutPanel);
  function openPanel() {
    state.panelOpen = true;
    $('notesPanel').hidden = false;
    $('btnNotes').setAttribute('aria-expanded', 'true');
    layoutPanel();
    renderNotes();
    $('notesTitle').focus();
    persistUi();
  }
  function closePanel(focusBack) {
    state.panelOpen = false;
    $('notesPanel').hidden = true;
    $('btnNotes').setAttribute('aria-expanded', 'false');
    layoutPanel();
    if (focusBack !== false) $('btnNotes').focus();
    persistUi();
  }
  function persistUi() { try { localStorage.setItem('odysseifskvida-lestrarstofa:panel', state.panelOpen ? '1' : '0'); } catch (e) { /* aðeins þægindi */ } }
  $('btnNotes').addEventListener('click', () => (state.panelOpen ? closePanel() : openPanel()));
  $('btnCloseNotes').addEventListener('click', () => closePanel());
  $('panelBackdrop').addEventListener('click', () => closePanel());
  $('notesPanel').addEventListener('keydown', e => { if (e.key === 'Escape' && !isSide()) closePanel(); });

  /* ---------------- gluggar ---------------- */
  function anyDialogOpen() { return !!document.querySelector('dialog[open]'); }
  for (const d of document.querySelectorAll('dialog')) {
    for (const b of d.querySelectorAll('[data-close]')) b.addEventListener('click', () => d.close());
    d.addEventListener('click', e => { if (e.target === d && d.id !== 'editorDlg' && d.id !== 'confirmDlg') d.close(); });
  }
  function txt(s) { return document.createTextNode(s); }
  function confirmDialog(title, bodyNodes, buttons) {
    return new Promise(resolve => {
      const d = $('confirmDlg');
      $('cfTitle').textContent = title;
      const body = $('cfBody'); body.innerHTML = '';
      for (const n of bodyNodes) body.appendChild(typeof n === 'string' ? el('p', null, n) : n.nodeType === 3 ? el('p', null, n.textContent) : n);
      const act = $('cfActions'); act.innerHTML = '';
      let result = 'cancel';
      for (const b of buttons) {
        const btn = el('button', { type: 'button', class: b.primary ? 'primary' : '' }, b.label);
        btn.addEventListener('click', () => { result = b.id; d.close(); });
        act.appendChild(btn);
      }
      d.addEventListener('close', function h() { d.removeEventListener('close', h); resolve(result); });
      if (d.open) d.close();
      d.showModal();
      const prim = act.querySelector('.primary') || act.querySelector('button');
      if (prim) prim.focus();
    });
  }

  $('btnToc').addEventListener('click', () => { renderToc(); $('tocDlg').showModal(); const cur = $('tocList').querySelector('[aria-current="true"]'); if (cur) cur.focus(); });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-goto]');
    if (b) {
      if ($('tocDlg').open) $('tocDlg').close();
      goToSection(b.dataset.goto);
      return;
    }
    const nb = e.target.closest('.nb');
    if (nb) {
      const res = C.anchorForUnit(index, nb.dataset.noteUnit);
      if (res.ok) openEditor({ mode: 'new', anchor: res.anchor, origin: 'paragraph' });
    }
  });

  $('btnSettings').addEventListener('click', () => { applySettings(); $('settingsDlg').showModal(); });
  $('fsDown').addEventListener('click', () => changeSetting('fontSize', state.settings.fontSize - 1));
  $('fsUp').addEventListener('click', () => changeSetting('fontSize', state.settings.fontSize + 1));
  for (const inp of document.querySelectorAll('#settingsDlg input[type="radio"]')) inp.addEventListener('change', () => changeSetting(inp.name, inp.value));
  $('btnResetSettings').addEventListener('click', () => {
    const u = currentTopUnit();
    state.settings = Object.assign({}, C.DEFAULT_SETTINGS);
    applySettings(); if (u) scrollToUnit(u, false);
    persist(['settings']);
    toast('Lestrarstillingar endurstilltar.');
  });

  /* ---------------- skrár: deila / sækja ---------------- */
  let currentFile = null, shareFile = null;
  function canShareFile(f) {
    try { return !!(navigator.canShare && navigator.share && navigator.canShare({ files: [f] })); } catch (e) { return false; }
  }
  function deliverFile(file, info) {
    currentFile = file;
    $('fileInfo').textContent = info;
    $('fileResult').textContent = '';
    // Sum tæki deila ekki .md/.json-skrám með sinni MIME-tegund; sama skrá sem text/plain er þá reynd.
    shareFile = canShareFile(file) ? file : null;
    if (!shareFile && file.type !== 'application/pdf') {
      const alt = new File([file], file.name, { type: 'text/plain' });
      if (canShareFile(alt)) shareFile = alt;
    }
    const canShare = !!shareFile;
    $('fileShare').hidden = !canShare;
    $('fileHelp').hidden = !canShare;
    if ($('exportDlg').open) $('exportDlg').close();
    $('fileDlg').showModal();
    ($('fileShare').hidden ? $('fileDownload') : $('fileShare')).focus();
  }
  $('fileShare').addEventListener('click', async () => {
    if (!shareFile) return;
    try {
      await navigator.share({ files: [shareFile], title: shareFile.name });
      $('fileResult').textContent = 'Deilingarvalmynd lokið. Athugaðu í Files (eða á Drive) að skráin sé komin þangað sem þú ætlaðir.';
    } catch (e) {
      $('fileResult').textContent = e && e.name === 'AbortError' ? 'Hætt við deilingu. Þú getur líka valið „Sækja skrá“.' : 'Deiling tókst ekki í þessum vafra. Notaðu „Sækja skrá“.';
    }
  });
  $('fileDownload').addEventListener('click', () => {
    if (!currentFile) return;
    const url = URL.createObjectURL(currentFile);
    const a = el('a', { href: url, download: currentFile.name });
    a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    $('fileResult').textContent = 'Niðurhal hafið. Á iPad fer skráin í „Niðurhal“ (Downloads) í Files nema þú veljir annað.';
  });

  function workfileFile() {
    const wf = C.makeWorkfile(index, state);
    const json = JSON.stringify(wf, null, 2);
    return new File([json], `odysseifskvida-vinnuskra-${C.fileStamp()}.json`, { type: 'application/json' });
  }
  function saveWorkfile() {
    const f = workfileFile();
    deliverFile(f, `Vinnuskrá með ${state.notes.length} ${state.notes.length === 1 ? 'glósu' : 'glósum'}, tengingum og stillingum (${f.name}).`);
  }
  $('btnSaveWf').addEventListener('click', saveWorkfile);
  $('exWorkfile').addEventListener('click', saveWorkfile);

  /* ---------------- útflutningur ---------------- */
  $('btnExport').addEventListener('click', () => {
    const filtered = !!(state.filter.sectionId || state.filter.type);
    const nf = filteredNotes().length;
    $('exAllLabel').textContent = `Allar glósur (${state.notes.length})`;
    $('exFilterLabel').textContent = filtered ? `Núverandi sía (${nf})` : 'Núverandi sía (engin sía valin)';
    document.querySelector('input[name="exScope"][value="filter"]').disabled = !filtered;
    if (!filtered) document.querySelector('input[name="exScope"][value="all"]').checked = true;
    $('exError').hidden = true;
    $('exportDlg').showModal();
  });

  function loadScript(src, test) {
    if (test()) return Promise.resolve();
    return new Promise((ok, no) => {
      const s = document.createElement('script');
      s.src = src; s.onload = () => (test() ? ok() : no(new Error('Safn hlóðst ekki: ' + src)));
      s.onerror = () => no(new Error('Ekki tókst að hlaða ' + src));
      document.head.appendChild(s);
    });
  }

  $('exBuild').addEventListener('click', async () => {
    const fmt = document.querySelector('input[name="exFormat"]:checked').value;
    const scope = document.querySelector('input[name="exScope"]:checked').value;
    const order = document.querySelector('input[name="exOrder"]:checked').value;
    const includeQuote = $('exQuote').checked;
    const notes = scope === 'filter' ? C.filterNotes(state.notes, state.filter) : state.notes.slice();
    const scopeLabel = scope === 'filter' ? filterLabel() : 'Allar glósur';
    const model = C.exportModel(index, notes, { includeQuote, order, scopeLabel });
    if (model.count !== notes.length) { showExError('Villa: ekki skiluðu sér allar glósur í útflutninginn. Ekkert var búið til.'); return; }
    const btn = $('exBuild');
    btn.disabled = true; btn.textContent = 'Bý til skrá…';
    try {
      let file;
      if (fmt === 'md') {
        const md = C.toMarkdown(model);
        file = new File(['﻿' + md], `odysseifskvida-glosur-${C.fileStamp()}.md`, { type: 'text/markdown;charset=utf-8' });
      } else {
        await loadScript(VENDOR + 'jspdf.umd.min.js', () => !!(window.jspdf && window.jspdf.jsPDF));
        await loadScript(VENDOR + 'pdf-fonts.js', () => !!window.NASA_PDF_FONTS);
        const doc = window.OdyPdf.build(window.jspdf.jsPDF, window.NASA_PDF_FONTS, model);
        file = new File([doc.output('arraybuffer')], `odysseifskvida-glosur-${C.fileStamp()}.pdf`, { type: 'application/pdf' });
      }
      deliverFile(file, `${fmt === 'md' ? 'Markdown-skrá' : 'PDF-skjal'} með ${model.count} ${model.count === 1 ? 'glósu' : 'glósum'} (${scopeLabel.toLowerCase()}): ${file.name}`);
    } catch (e) {
      showExError('Ekki tókst að búa til skrána: ' + (e && e.message || e));
    } finally {
      btn.disabled = false; btn.textContent = 'Búa til skrá';
    }
  });
  function showExError(m) { const e = $('exError'); e.textContent = m; e.hidden = false; }
  function filterLabel() {
    const parts = [];
    if (state.filter.sectionId) parts.push(C.sectionShort(index.sectionById.get(state.filter.sectionId)));
    if (state.filter.type) parts.push(C.typeLabel(state.filter.type));
    return 'Sía: ' + parts.join(', ');
  }

  /* ---------------- innflutningur vinnuskrár ---------------- */
  $('btnOpenWf').addEventListener('click', () => { $('fileInput').value = ''; $('fileInput').click(); });
  $('fileInput').addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { await importError(['Skráin er of stór til að vera vinnuskrá.']); return; }
    let text;
    try { text = await f.text(); } catch (err) { await importError(['Ekki tókst að lesa skrána.']); return; }
    const res = C.parseWorkfile(index, text);
    if (!res.ok) { await importError(res.errors); return; }
    const cur = state.notes.length;
    const n = res.data.notes.length;
    const body = [
      `Skráin „${f.name}“ inniheldur ${n} ${n === 1 ? 'glósu' : 'glósur'}${res.data.savedAt ? ` (vistuð ${C.fmtDate(res.data.savedAt)})` : ''}.`,
      cur ? `Í þessu tæki eru nú ${cur} ${cur === 1 ? 'glósa' : 'glósur'}. Ef þú heldur áfram koma glósurnar úr skránni í stað þeirra. Það er ekki hægt að afturkalla.` : 'Engar glósur eru í þessu tæki núna.',
    ];
    let choice;
    for (;;) {
      const buttons = [{ id: 'cancel', label: 'Hætta við' }];
      if (cur) buttons.push({ id: 'backup', label: 'Vista öryggisafrit fyrst' });
      buttons.push({ id: 'replace', label: cur ? 'Skipta út glósum' : 'Opna vinnuskrá', primary: true });
      choice = await confirmDialog('Opna vinnuskrá?', body, buttons);
      if (choice === 'backup') {
        const bf = workfileFile();
        await new Promise(r => { deliverFile(bf, `Öryggisafrit af núverandi vinnu (${cur} glósur): ${bf.name}`); $('fileDlg').addEventListener('close', r, { once: true }); });
        body[1] = `Í þessu tæki eru nú ${cur} ${cur === 1 ? 'glósa' : 'glósur'} (öryggisafrit var búið til). Ef þú heldur áfram koma glósurnar úr skránni í stað þeirra.`;
        continue;
      }
      break;
    }
    if (choice !== 'replace') return;
    state.notes = res.data.notes;
    state.settings = res.data.settings;
    if (res.data.position) state.position = res.data.position;
    state.filter = { sectionId: '', type: '' };
    applySettings();
    renderFilters();
    afterNotesChanged();
    const ok = await persist(['notes', 'settings', 'position']);
    toast(`Vinnuskrá opnuð: ${n} ${n === 1 ? 'glósa' : 'glósur'}.${ok ? ' Vistað í þessu tæki.' : ''}`);
  });
  function importError(errors) {
    const ul = el('ul');
    for (const e of errors) ul.appendChild(el('li', null, e));
    return confirmDialog('Ekki hægt að opna vinnuskrána', [ul, 'Núverandi vinna er óbreytt.'], [{ id: 'ok', label: 'Í lagi', primary: true }]);
  }

  /* ---------------- ræsing ---------------- */
  function markOrphans() {
    for (const n of state.notes) {
      const v = C.verifyAnchor(index, n.anchor);
      if (v.ok) delete n.orphan; else n.orphan = v.reason;
    }
  }

  async function init() {
    syncViewport();
    buildTypeRow();
    renderFilters();
    try {
      const { backend, warning } = await window.OdyStore.openStore();
      state.store = backend;
      if (warning) showBanner('store-warning', '', warning, [{ label: 'Í lagi', action: () => {} }]);
      const [notes, settings, position, draft] = await Promise.all(['notes', 'settings', 'position', 'draft'].map(k => backend.get(k)));
      if (Array.isArray(notes)) state.notes = notes;
      state.settings = C.sanitizeSettings(settings);
      if (position && index.sectionById.has(position.sectionId)) state.position = position;
      state.draft = draft || null;
      setSaveStatus('ok', state.notes.length ? 'Vistað í þessu tæki.' : '');
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    } catch (e) {
      state.storeError = e && e.message || String(e);
      setSaveStatus('error', 'Vistun í þessu tæki virkar ekki.');
      showBanner('save-error', 'error', `${state.storeError} Glósur glatast þegar síðunni er lokað nema þú vistir vinnuskrá.`, [{ label: 'Vista vinnuskrá', action: saveWorkfile, close: false }]);
    }
    markOrphans();
    applySettings();
    const pos = state.position;
    if (pos && pos.sectionId !== 'titill') {
      renderSection(pos.sectionId, { noSave: true });
      if (pos.unitId) requestAnimationFrame(() => scrollToUnit(pos.unitId, false));
    } else renderSection('titill', { noSave: true });
    let panel = false;
    try { panel = localStorage.getItem('odysseifskvida-lestrarstofa:panel') === '1'; } catch (e) { /* */ }
    if (panel && isSide()) openPanel(); else layoutPanel();
    renderNotes();
    const d = state.draft;
    if (d && d.anchor && C.verifyAnchor(index, d.anchor).ok && (d.body || '').trim()) {
      const l = C.locationParts(index, d.anchor);
      showBanner('draft', '', `Óklárað ritdrag fannst (${l.sectionShort} · ${l.paras}).`, [
        { label: 'Halda áfram', action: () => openEditor({ mode: d.mode, noteId: d.noteId, anchor: d.anchor, origin: d.origin, insertedText: d.insertedText, restore: { body: d.body, type: d.type } }) },
        { label: 'Henda ritdragi', action: () => { state.draft = null; persist(['draft']); } },
      ]);
    }
    document.documentElement.dataset.ready = '1';
  }

  // til prófana (sjálfvirk viðmótspróf); ekki notað af viðmótinu sjálfu
  window.__ody = { state, index, anchorFromSelection, idle: () => state.saveChain };
  init();
})();

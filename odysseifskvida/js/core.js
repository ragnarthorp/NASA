/* Kjarni lestrarstofunnar: textagögn, tengingar glósa við texta, glósulíkan, vinnuskrá og útflutningur.
   Hreinar aðgerðir án DOM svo hægt sé að prófa þær í Node (tests/core.test.js).
   Staðsetningar eru stafastaðsetningar (UTF-16, eins og JavaScript-strengir) í `unit.text`
   í textagögnunum – ekki skjáhnit – og breytast því ekki við leturstillingu eða gluggabreytingu. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OdyCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const APP = { name: 'Lestrarstofa – Ódysseifskviða', version: '1.0.0' };
  const WORKFILE_FORMAT = 'odysseifskvida-vinnuskra';
  const WORKFILE_VERSION = 1;
  const CONTEXT_CHARS = 40;
  const MAX_BODY = 200000;

  const NOTE_TYPES = [
    { id: 'endursogn', label: 'Endursögn', hint: 'með eigin orðum' },
    { id: 'athugasemd', label: 'Athugasemd', hint: 'hugleiðing eða tenging' },
    { id: 'spurning', label: 'Spurning', hint: 'það sem er óljóst' },
    { id: 'endurvinnsla', label: 'Endurvinnsla', hint: 'ritun sem hófst sem afrit af frumtexta' },
    { id: 'tilvitnun', label: 'Tilvitnun', hint: 'óbreyttur frumtexti' },
  ];
  const TYPE_IDS = NOTE_TYPES.map(t => t.id);
  const typeLabel = id => (NOTE_TYPES.find(t => t.id === id) || { label: id }).label;
  const RECYCLE_GUIDANCE = 'Lýstu aðalatriðinu með þínum orðum. Þú mátt stytta textann, útskýra erfið orð eða bæta við dæmi.';

  const DEFAULT_SETTINGS = { fontSize: 20, font: 'serif', lineHeight: 'venjulegt', width: 'midlungs', theme: 'ljost' };
  const SETTING_OPTIONS = {
    font: ['serif', 'sans'],
    lineHeight: ['thett', 'venjulegt', 'rumt'],
    width: ['mjor', 'midlungs', 'breidur'],
    theme: ['ljost', 'hlytt', 'dokkt'],
  };
  const FONT_MIN = 14, FONT_MAX = 36;

  function sanitizeSettings(s) {
    const out = Object.assign({}, DEFAULT_SETTINGS);
    if (!s || typeof s !== 'object') return out;
    const fs = Number(s.fontSize);
    if (Number.isFinite(fs)) out.fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(fs)));
    for (const k of Object.keys(SETTING_OPTIONS)) if (SETTING_OPTIONS[k].includes(s[k])) out[k] = s[k];
    return out;
  }

  /* ---------- textagögn ---------- */
  function buildIndex(data) {
    const sections = data.sections;
    const sectionById = new Map();
    const unitById = new Map();
    sections.forEach((s, si) => {
      sectionById.set(s.id, s);
      s.units.forEach((u, ui) => unitById.set(u.id, { unit: u, section: s, si, ui }));
    });
    return { data, doc: data.document, sections, sectionById, unitById };
  }

  function sectionLabel(s) {
    if (!s) return '';
    if (s.kind === 'thattur') return `${s.numeral}. þáttur — ${s.title}`;
    if (s.kind === 'formali') return `Formáli — ${s.title}`;
    if (s.kind === 'nofn') return s.title;
    if (s.kind === 'um-bokina') return `Um bókina — ${s.title}`;
    return s.title;
  }
  function sectionShort(s) {
    if (!s) return '';
    if (s.kind === 'thattur') return `${s.numeral}. þáttur`;
    if (s.kind === 'formali') return 'Formáli';
    if (s.kind === 'um-bokina') return 'Um bókina';
    if (s.kind === 'titill') return 'Forsíða';
    return s.title;
  }

  /* Síða sem stafur nr. `offset` í einingu er á. */
  function pageAt(unit, offset) {
    let p = unit.pages[0];
    for (const q of unit.pages) if (q.offset <= offset) p = q;
    return p;
  }

  function cmpPos(index, a, b) {
    const A = index.unitById.get(a.unitId), B = index.unitById.get(b.unitId);
    if (A.si !== B.si) return A.si - B.si;
    if (A.ui !== B.ui) return A.ui - B.ui;
    return a.offset - b.offset;
  }

  /* Býr til tengingu (anchor) úr upphafs- og endastöðu. Skilar {ok, anchor} eða {ok:false, reason}. */
  function makeAnchor(index, startPos, endPos) {
    let a = Object.assign({}, startPos), b = Object.assign({}, endPos);
    const A0 = index.unitById.get(a.unitId), B0 = index.unitById.get(b.unitId);
    if (!A0 || !B0) return { ok: false, reason: 'Valið er utan lestrartextans.' };
    if (A0.section !== B0.section) return { ok: false, reason: 'Valið nær yfir fleiri en einn kafla.' };
    if (cmpPos(index, a, b) > 0) { const t = a; a = b; b = t; }
    const sec = A0.section;
    const units = sec.units;
    let si = index.unitById.get(a.unitId).ui, ei = index.unitById.get(b.unitId).ui;
    a.offset = clamp(a.offset, 0, units[si].text.length);
    b.offset = clamp(b.offset, 0, units[ei].text.length);
    // færa upphaf fram yfir bil og tómar endastöður
    while (si <= ei) {
      const t = units[si].text;
      while (a.offset < t.length && /\s/.test(t[a.offset])) a.offset++;
      if (a.offset < t.length && !(si === ei && a.offset >= b.offset)) break;
      si++; a = { unitId: units[si] ? units[si].id : a.unitId, offset: 0 };
    }
    if (si > ei) return { ok: false, reason: 'Ekkert var valið.' };
    while (ei >= si) {
      const t = units[ei].text;
      while (b.offset > 0 && /\s/.test(t[b.offset - 1])) b.offset--;
      if (b.offset > 0 && !(si === ei && b.offset <= a.offset)) break;
      ei--; b = { unitId: units[ei] ? units[ei].id : b.unitId, offset: units[ei] ? units[ei].text.length : 0 };
    }
    if (ei < si || (si === ei && b.offset <= a.offset)) return { ok: false, reason: 'Ekkert var valið.' };
    a.unitId = units[si].id; b.unitId = units[ei].id;
    const unitIds = units.slice(si, ei + 1).map(u => u.id);
    const parts = units.slice(si, ei + 1).map((u, i) => {
      const from = i === 0 ? a.offset : 0;
      const to = i === ei - si ? b.offset : u.text.length;
      return u.text.slice(from, to);
    });
    const quote = parts.join('\n\n');
    const su = units[si], eu = units[ei];
    const prefix = su.text.slice(Math.max(0, a.offset - CONTEXT_CHARS), a.offset);
    const suffix = eu.text.slice(b.offset, b.offset + CONTEXT_CHARS);
    const p1 = pageAt(su, a.offset), p2 = pageAt(eu, Math.max(0, b.offset - 1));
    const anchor = {
      docId: index.doc.id,
      docVersion: index.doc.version,
      sectionId: sec.id,
      start: { unitId: su.id, offset: a.offset },
      end: { unitId: eu.id, offset: b.offset },
      unitIds,
      quote,
      prefix,
      suffix,
      pdfPages: [p1.pdfPage, p2.pdfPage],
      printedPages: p1.printedPage != null && p2.printedPage != null ? [p1.printedPage, p2.printedPage] : null,
      paragraphs: [su.n, eu.n],
    };
    return { ok: true, anchor };
  }

  function anchorForUnit(index, unitId) {
    const e = index.unitById.get(unitId);
    if (!e) return { ok: false, reason: 'Efnisgrein fannst ekki.' };
    return makeAnchor(index, { unitId, offset: 0 }, { unitId, offset: e.unit.text.length });
  }

  /* Staðfestir að tenging vísi enn á sama texta. */
  function verifyAnchor(index, anchor) {
    if (!anchor || typeof anchor !== 'object') return { ok: false, reason: 'Tengingu vantar.' };
    if (anchor.docId !== index.doc.id) return { ok: false, reason: 'Glósan á við annað skjal.' };
    if (anchor.docVersion !== index.doc.version) return { ok: false, reason: 'Glósan var gerð við aðra útgáfu textans.' };
    if (!anchor.start || !anchor.end) return { ok: false, reason: 'Tenging er ófullkomin.' };
    const A = index.unitById.get(anchor.start.unitId), B = index.unitById.get(anchor.end.unitId);
    if (!A || !B) return { ok: false, reason: 'Textaeining fannst ekki.' };
    if (A.section.id !== anchor.sectionId || B.section.id !== anchor.sectionId) return { ok: false, reason: 'Kafli stemmir ekki.' };
    if (!Number.isInteger(anchor.start.offset) || !Number.isInteger(anchor.end.offset)) return { ok: false, reason: 'Staðsetning er ógild.' };
    const re = makeAnchor(index, anchor.start, anchor.end);
    if (!re.ok) return re;
    if (re.anchor.quote !== anchor.quote) return { ok: false, reason: 'Valinn texti stemmir ekki við frumtextann.' };
    if (re.anchor.start.offset !== anchor.start.offset || re.anchor.end.offset !== anchor.end.offset) return { ok: false, reason: 'Staðsetning stemmir ekki.' };
    return { ok: true, anchor: re.anchor };
  }

  function range(a, b) { return a === b ? `${a}` : `${a}–${b}`; }
  function locationParts(index, anchor) {
    const sec = index.sectionById.get(anchor.sectionId);
    const pages = anchor.printedPages
      ? 'Bls. ' + range(anchor.printedPages[0], anchor.printedPages[1])
      : 'PDF-síða ' + range(anchor.pdfPages[0], anchor.pdfPages[1]);
    const paras = (anchor.paragraphs[0] === anchor.paragraphs[1] ? 'Efnisgrein ' : 'Efnisgreinar ') + range(anchor.paragraphs[0], anchor.paragraphs[1]);
    return { section: sec ? sectionLabel(sec) : anchor.sectionId, sectionShort: sec ? sectionShort(sec) : '', pages, paras };
  }

  /* ---------- glósur ---------- */
  function uid() {
    const r = Math.random().toString(36).slice(2, 10);
    return 'g-' + Date.now().toString(36) + '-' + r;
  }

  function newNote(anchor, opts) {
    const now = new Date().toISOString();
    return {
      id: uid(),
      type: opts && opts.type || 'athugasemd',
      body: opts && opts.body || '',
      origin: opts && opts.origin || 'own',
      insertedText: opts && opts.insertedText != null ? opts.insertedText : null,
      createdAt: now,
      updatedAt: now,
      anchor,
    };
  }

  const normWs = s => String(s || '').replace(/\s+/g, ' ').trim();
  /* Ef innsett afrit er enn óbreytt við vistun er glósan merkt „Tilvitnun“. Ekkert annað mat fer fram. */
  function finalizeNote(note) {
    const n = Object.assign({}, note);
    if (n.insertedText != null && normWs(n.body) === normWs(n.insertedText)) {
      n.type = 'tilvitnun';
      n.unchangedCopy = true;
    } else {
      delete n.unchangedCopy;
    }
    return n;
  }

  function noteSortKey(index, n) {
    const e = n.anchor && index.unitById.get(n.anchor.start && n.anchor.start.unitId);
    if (!e) return [1e9, 0, 0, n.createdAt || ''];
    return [e.si, e.ui, n.anchor.start.offset, n.createdAt || ''];
  }
  function sortNotes(index, notes, order) {
    const arr = notes.slice();
    if (order === 'stofnun') return arr.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    return arr.sort((a, b) => {
      const A = noteSortKey(index, a), B = noteSortKey(index, b);
      for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] - B[i];
      return String(A[3]).localeCompare(String(B[3]));
    });
  }
  function filterNotes(notes, f) {
    return notes.filter(n => (!f || !f.sectionId || (n.anchor && n.anchor.sectionId === f.sectionId)) && (!f || !f.type || n.type === f.type));
  }
  function notesForUnit(notes, unitId) {
    return notes.filter(n => n.anchor && Array.isArray(n.anchor.unitIds) && n.anchor.unitIds.includes(unitId));
  }

  /* ---------- vinnuskrá ---------- */
  function makeWorkfile(index, state) {
    return {
      format: WORKFILE_FORMAT,
      formatVersion: WORKFILE_VERSION,
      savedAt: new Date().toISOString(),
      app: APP,
      document: { id: index.doc.id, version: index.doc.version, sha256: index.doc.sha256, title: index.doc.title },
      settings: sanitizeSettings(state.settings),
      readingPosition: state.position || null,
      notes: state.notes || [],
    };
  }

  const ISO = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/;
  function validateNote(index, n, i) {
    const where = `Glósa ${i + 1}`;
    if (!n || typeof n !== 'object') return `${where}: er ekki gild.`;
    if (typeof n.id !== 'string' || !n.id || n.id.length > 100) return `${where}: auðkenni vantar.`;
    if (!TYPE_IDS.includes(n.type)) return `${where}: óþekkt tegund „${String(n.type).slice(0, 30)}“.`;
    if (typeof n.body !== 'string' || n.body.length > MAX_BODY) return `${where}: texti glósunnar er ógildur.`;
    if (n.insertedText != null && typeof n.insertedText !== 'string') return `${where}: afritaður texti er ógildur.`;
    if (typeof n.createdAt !== 'string' || !ISO.test(n.createdAt)) return `${where}: dagsetningu vantar.`;
    if (n.updatedAt != null && (typeof n.updatedAt !== 'string' || !ISO.test(n.updatedAt))) return `${where}: dagsetning er ógild.`;
    const v = verifyAnchor(index, n.anchor);
    if (!v.ok) return `${where}: ${v.reason}`;
    return null;
  }

  /* Les vinnuskrá. Breytir engu – skilar {ok, errors, data}. */
  function parseWorkfile(index, text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, errors: ['Skráin er skemmd eða ekki á JSON-sniði.'] }; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, errors: ['Skráin er ekki vinnuskrá.'] };
    if (obj.format !== WORKFILE_FORMAT) return { ok: false, errors: ['Þetta er ekki vinnuskrá úr Lestrarstofu Ódysseifskviðu.'] };
    if (!Number.isInteger(obj.formatVersion)) return { ok: false, errors: ['Útgáfunúmer vinnuskrár vantar.'] };
    if (obj.formatVersion > WORKFILE_VERSION) return { ok: false, errors: [`Vinnuskráin er á nýrra sniði (${obj.formatVersion}) en þessi vefur styður (${WORKFILE_VERSION}).`] };
    if (obj.formatVersion < 1) return { ok: false, errors: ['Útgáfunúmer vinnuskrár er ógilt.'] };
    const d = obj.document;
    if (!d || typeof d !== 'object') return { ok: false, errors: ['Upplýsingar um skjal vantar í vinnuskrána.'] };
    if (d.id !== index.doc.id) return { ok: false, errors: [`Vinnuskráin á við annað skjal („${String(d.id).slice(0, 60)}“).`] };
    if (d.version !== index.doc.version) return { ok: false, errors: ['Vinnuskráin var gerð fyrir aðra útgáfu textans. Glósurnar eru ekki tengdar sjálfkrafa við þennan texta.'] };
    if (!Array.isArray(obj.notes)) return { ok: false, errors: ['Glósulista vantar í vinnuskrána.'] };
    const errors = [];
    const ids = new Set();
    obj.notes.forEach((n, i) => {
      const e = validateNote(index, n, i);
      if (e) errors.push(e);
      else if (ids.has(n.id)) errors.push(`Glósa ${i + 1}: tvítekið auðkenni.`);
      else ids.add(n.id);
    });
    if (errors.length) return { ok: false, errors: errors.slice(0, 10).concat(errors.length > 10 ? [`… og ${errors.length - 10} villur í viðbót.`] : []) };
    let position = null;
    const p = obj.readingPosition;
    if (p && typeof p === 'object' && index.sectionById.has(p.sectionId)) {
      position = { sectionId: p.sectionId, unitId: index.unitById.has(p.unitId) ? p.unitId : null };
    }
    const notes = obj.notes.map(n => ({
      id: n.id, type: n.type, body: n.body, origin: ['own', 'recycle', 'paragraph'].includes(n.origin) ? n.origin : 'own',
      insertedText: n.insertedText == null ? null : n.insertedText,
      createdAt: n.createdAt, updatedAt: n.updatedAt || n.createdAt, anchor: verifyAnchor(index, n.anchor).anchor,
      ...(n.unchangedCopy ? { unchangedCopy: true } : {}),
    }));
    return { ok: true, errors: [], data: { notes, settings: sanitizeSettings(obj.settings), position, savedAt: typeof obj.savedAt === 'string' ? obj.savedAt : null } };
  }

  /* ---------- útflutningur ---------- */
  function exportModel(index, notes, opts) {
    const o = Object.assign({ includeQuote: true, order: 'texti', scopeLabel: 'Allar glósur' }, opts);
    const sorted = sortNotes(index, notes, o.order);
    const items = sorted.map((n, i) => {
      const loc = n.anchor ? locationParts(index, n.anchor) : { section: 'Óþekktur staður', pages: '', paras: '' };
      return {
        n: i + 1,
        work: index.doc.title,
        section: loc.section,
        location: [loc.pages, loc.paras].filter(Boolean).join(' · '),
        type: typeLabel(n.type),
        quote: o.includeQuote && n.anchor ? withQuoteMarks(n.anchor.quote) : null,
        body: n.body,
        orphan: !!n.orphan,
      };
    });
    return { title: index.doc.title, generatedAt: new Date(), scopeLabel: o.scopeLabel, includeQuote: o.includeQuote, items, count: items.length };
  }

  function withQuoteMarks(q) {
    const t = String(q);
    return t.startsWith('„') && t.endsWith('“') ? t : '„' + t + '“';
  }
  function mdEscapeLine(line) {
    return line.replace(/^(\s*)([#>+\-*]|\d+[.)]|=+$|`{3,}|~{3,})/, '$1\\$2');
  }
  function mdParagraphs(text) {
    // Línuskil nemandans haldast: tvö bil + nýlína = harð línuskil í Markdown.
    return String(text).replace(/\r\n?/g, '\n').split('\n').map(l => mdEscapeLine(l).replace(/</g, '\\<')).join('  \n').replace(/( {2}\n){2,}/g, '\n\n');
  }
  function toMarkdown(model) {
    const out = [`# ${model.title}`, '', `*Mínar glósur · ${model.scopeLabel} · ${model.count} ${model.count === 1 ? 'glósa' : 'glósur'} · ${fmtDate(model.generatedAt)}*`, ''];
    let cur = null;
    if (!model.items.length) out.push('Engar glósur.', '');
    for (const it of model.items) {
      if (it.section !== cur) { out.push(`## ${it.section}`, ''); cur = it.section; }
      out.push(`### Glósa ${it.n}`, '');
      out.push(`${it.work}  `);
      out.push(`${it.section}  `);
      out.push(`${it.location}  `);
      out.push(`Tegund: ${it.type}`, '');
      if (it.quote != null) {
        out.push('**Valinn frumtexti:**', '');
        const q = it.quote;
        out.push(q.split('\n').map(l => (l ? '> ' + mdEscapeLine(l) : '>')).join('\n'), '');
      }
      out.push('**Mín glósa:**', '');
      out.push(it.body.trim() ? mdParagraphs(it.body) : '*(tóm glósa)*', '');
      out.push('---', '');
    }
    return out.join('\n');
  }

  function fmtDate(d) {
    const x = d instanceof Date ? d : new Date(d);
    const p = n => String(n).padStart(2, '0');
    return `${x.getDate()}.${x.getMonth() + 1}.${x.getFullYear()} kl. ${p(x.getHours())}:${p(x.getMinutes())}`;
  }
  function fileStamp(d) {
    const x = d || new Date();
    const p = n => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  return {
    APP, WORKFILE_FORMAT, WORKFILE_VERSION, NOTE_TYPES, TYPE_IDS, typeLabel, RECYCLE_GUIDANCE,
    DEFAULT_SETTINGS, SETTING_OPTIONS, FONT_MIN, FONT_MAX, sanitizeSettings,
    buildIndex, sectionLabel, sectionShort, pageAt, makeAnchor, anchorForUnit, verifyAnchor, locationParts,
    newNote, finalizeNote, sortNotes, filterNotes, notesForUnit,
    makeWorkfile, parseWorkfile, exportModel, withQuoteMarks, toMarkdown, fmtDate, fileStamp,
  };
});

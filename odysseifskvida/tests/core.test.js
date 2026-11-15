/* Próf fyrir textagögn, tengingar, glósur, vinnuskrá og Markdown-útflutning.  Keyrsla: node --test tests/ */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const C = require('../js/core.js');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'odysseifskvida.json'), 'utf8'));
const index = C.buildIndex(DATA);
const sec = id => index.sectionById.get(id);
const clone = o => JSON.parse(JSON.stringify(o));

test('textagögn: allir 24 þættir og aðrir kaflar', () => {
  const chapters = DATA.sections.filter(s => s.kind === 'thattur');
  assert.equal(chapters.length, 24);
  chapters.forEach((c, i) => {
    assert.equal(c.number, i + 1);
    assert.equal(c.id, `thattur-${String(i + 1).padStart(2, '0')}`);
    assert.ok(c.tocConfirmed, `${c.id} staðfestur í efnisyfirliti`);
    assert.ok(c.units.some(u => u.type === 'efnisgrein'), `${c.id} hefur meginmál`);
  });
  assert.equal(chapters[0].title, 'Aþena kemur til Íþöku');
  assert.equal(chapters[9].title, 'Ajólos, Læstrýgónar og Kirka');
  assert.equal(chapters[11].title, 'Sírenur, Skylla og naut Helíosar');
  assert.equal(chapters[23].title, 'Friður');
  for (const id of ['titill', 'formali', 'nofn', 'um-bokina']) assert.ok(sec(id), id);
  assert.equal(sec('nofn').units.length, 17);
  assert.ok(sec('nofn').units.every(u => u.type === 'nafn' && u.termLength > 0 && u.text[u.termLength - 1] === ':'));
  assert.equal(sec('nofn').units[0].text, 'Ódysseifur: konungur á Íþöku, frægur fyrir brögð sín');
  assert.equal(DATA.document.pdfPages, 51);
});

test('textagögn: myndatextar og myndaskrá eru ekki í lestrartexta', () => {
  const all = DATA.sections.flatMap(s => s.units.map(u => u.text)).join('\n');
  for (const bad of ['Bouguereau', 'Waterhouse', 'Böcklin', 'Lastman', 'Turner', 'Füssli', 'Boulanger', 'Primaticcio', 'Penelópumálarans', 'Leirker', 'Forsíða:', 'Myndir']) {
    assert.ok(!all.includes(bad), `„${bad}“ á ekki heima í lestrartexta`);
  }
  // „Texti og myndir“: textinn um endursögn og þýðingu er varðveittur
  const ub = sec('um-bokina').units.map(u => u.text).join(' ');
  assert.match(ub, /endursögð og stytt/);
  assert.match(ub, /Sveinbjarnar Egilssonar \(1791–1852\)/);
  assert.match(ub, /Úrfellingar eru merktar með þremur punktum\.$/);
});

test('textagögn: tilvitnanir og heimildarlínur aðgreindar', () => {
  let quotes = 0;
  for (const s of DATA.sections) s.units.forEach((u, i) => {
    if (u.type === 'tilvitnun') {
      quotes++;
      assert.ok(u.text.startsWith('„') && u.text.endsWith('“'), u.id);
      const src = s.units[i + 1];
      assert.equal(src.type, 'heimild', `${u.id} fylgir heimildarlína`);
      assert.equal(src.quoteId, u.id);
      assert.equal(u.sourceId, src.id);
      assert.match(src.text, /· þýðing Sveinbjarnar Egilssonar$/);
    }
    if (u.type === 'efnisgrein') assert.ok(!/þýðing Sveinbjarnar Egilssonar$/.test(u.text), `${u.id} er ekki heimildarlína`);
  });
  assert.ok(quotes >= 25);
  // aldrað orðalag helst
  const q = sec('thattur-05').units.find(u => u.type === 'tilvitnun').text;
  assert.match(q, /vil eg og þrey eg eftir því alla daga/);
});

test('textagögn: stöðug auðkenni, síður og íslenskir stafir', () => {
  const ids = new Set();
  for (const s of DATA.sections) s.units.forEach((u, i) => {
    assert.ok(!ids.has(u.id)); ids.add(u.id);
    assert.equal(u.n, i + 1);
    assert.equal(u.id, `${s.id}-${String(i + 1).padStart(3, '0')}`);
    assert.ok(u.pages.length >= 1 && u.pages[0].offset === 0);
    for (const p of u.pages) {
      assert.ok(p.pdfPage >= 1 && p.pdfPage <= 51);
      if (p.printedPage != null) assert.equal(p.printedPage, p.pdfPage);
    }
    assert.equal(u.text, u.text.normalize('NFC'));
    assert.ok(!/\s{2,}|^\s|\s$/.test(u.text), `${u.id} án tvöfaldra bila`);
  });
  assert.equal(sec('titill').units[0].pages[0].printedPage, null, 'forsíða hefur ekkert prentað númer');
  const all = DATA.sections.flatMap(s => s.units.map(u => u.text)).join('');
  for (const ch of 'ðþæöÞÖÁÍÓÚáéíóúý„“…–') assert.ok(all.includes(ch), ch);
  assert.ok(!/\b\d{1,2}\s*$/.test(sec('thattur-01').units.at(-1).text), 'síðunúmer ekki í texta');
});

test('tenging: val innan efnisgreinar', () => {
  const u = sec('thattur-01').units[0];
  const start = u.text.indexOf('Póseidon');
  const end = start + 'Póseidon, sem hatar Ódysseif'.length;
  const r = C.makeAnchor(index, { unitId: u.id, offset: start }, { unitId: u.id, offset: end });
  assert.ok(r.ok);
  assert.equal(r.anchor.quote, 'Póseidon, sem hatar Ódysseif');
  assert.deepEqual(r.anchor.pdfPages, [6, 6]);
  assert.deepEqual(r.anchor.printedPages, [6, 6]);
  assert.deepEqual(r.anchor.paragraphs, [1, 1]);
  assert.equal(r.anchor.docId, 'odysseifskvida-endursogn');
  assert.ok(r.anchor.prefix.endsWith('Ólympsfjalli. '));
  assert.ok(r.anchor.suffix.startsWith(', er fjarverandi'));
  const loc = C.locationParts(index, r.anchor);
  assert.equal(loc.section, 'I. þáttur — Aþena kemur til Íþöku');
  assert.equal(loc.pages, 'Bls. 6');
  assert.equal(loc.paras, 'Efnisgrein 1');
  assert.ok(C.verifyAnchor(index, r.anchor).ok);
});

test('tenging: bil í endum vals eru klippt og öfugt val snúið við', () => {
  const u = sec('thattur-01').units[0];
  const r = C.makeAnchor(index, { unitId: u.id, offset: 20 }, { unitId: u.id, offset: 8 });
  assert.ok(r.ok);
  const raw = u.text.slice(8, 20);
  assert.equal(r.anchor.start.offset, 8 + (raw.length - raw.trimStart().length));
  assert.equal(r.anchor.quote, raw.trim());
  assert.ok(!C.makeAnchor(index, { unitId: u.id, offset: 5 }, { unitId: u.id, offset: 5 }).ok);
  const sp = u.text.indexOf(' ');
  assert.ok(!C.makeAnchor(index, { unitId: u.id, offset: sp }, { unitId: u.id, offset: sp + 1 }).ok, 'aðeins bil er ekki gilt val');
});

test('tenging: val yfir efnisgreinar og síðuskil fær rétt bil', () => {
  // II. þáttur: síðasta efnisgrein á síðu 7 → fyrsta efnisgrein á síðu 8
  const s = sec('thattur-02');
  const last7 = s.units.filter(u => u.pages[0].pdfPage === 7).at(-1);
  const first8 = s.units.find(u => u.pages[0].pdfPage === 8);
  assert.ok(last7 && first8);
  const r = C.makeAnchor(index, { unitId: last7.id, offset: last7.text.length - 20 }, { unitId: first8.id, offset: 15 });
  assert.ok(r.ok);
  assert.deepEqual(r.anchor.pdfPages, [7, 8]);
  assert.deepEqual(r.anchor.printedPages, [7, 8]);
  assert.deepEqual(r.anchor.unitIds, [last7.id, first8.id]);
  assert.deepEqual(r.anchor.paragraphs, [last7.n, first8.n]);
  assert.equal(r.anchor.quote, last7.text.slice(-20) + '\n\n' + first8.text.slice(0, 15));
  const loc = C.locationParts(index, r.anchor);
  assert.equal(loc.pages, 'Bls. 7–8');
  assert.equal(loc.paras, `Efnisgreinar ${last7.n}–${first8.n}`);
  // val sem endar í upphafi einingar (offset 0) dregst til baka að fyrri einingu
  const r2 = C.makeAnchor(index, { unitId: last7.id, offset: 0 }, { unitId: first8.id, offset: 0 });
  assert.deepEqual(r2.anchor.unitIds, [last7.id]);
  assert.deepEqual(r2.anchor.pdfPages, [7, 7]);
});

test('tenging: síðuskil innan einingar (kort af stafabilum)', () => {
  // tilbúin eining sem nær yfir tvær síður – staðfestir að síðukortið sé notað
  const d = clone(DATA);
  const u = d.sections.find(s => s.id === 'thattur-03').units[0];
  const cut = 40;
  u.pages = [{ offset: 0, pdfPage: 9, printedPage: 9 }, { offset: cut, pdfPage: 10, printedPage: 10 }];
  const ix = C.buildIndex(d);
  const a = C.makeAnchor(ix, { unitId: u.id, offset: 2 }, { unitId: u.id, offset: 30 }).anchor;
  assert.deepEqual(a.pdfPages, [9, 9]);
  const b = C.makeAnchor(ix, { unitId: u.id, offset: cut + 2 }, { unitId: u.id, offset: cut + 20 }).anchor;
  assert.deepEqual(b.pdfPages, [10, 10]);
  const c = C.makeAnchor(ix, { unitId: u.id, offset: 5 }, { unitId: u.id, offset: cut + 10 }).anchor;
  assert.deepEqual(c.pdfPages, [9, 10]);
  const e = C.makeAnchor(ix, { unitId: u.id, offset: 5 }, { unitId: u.id, offset: cut }).anchor;
  assert.deepEqual(e.pdfPages, [9, 9], 'val sem endar nákvæmlega á síðuskilum er á fyrri síðu');
  assert.equal(C.pageAt(u, cut).pdfPage, 10);
});

test('tenging: ekki yfir kaflaskil, og úrelt tenging greinist', () => {
  const a = sec('thattur-01').units[0], b = sec('thattur-02').units[0];
  assert.ok(!C.makeAnchor(index, { unitId: a.id, offset: 0 }, { unitId: b.id, offset: 5 }).ok);
  const good = C.anchorForUnit(index, a.id).anchor;
  assert.equal(good.quote, a.text);
  const bad1 = Object.assign({}, good, { quote: good.quote + 'x' });
  assert.ok(!C.verifyAnchor(index, bad1).ok);
  const bad2 = Object.assign({}, good, { docVersion: 'sha256-0000' });
  assert.match(C.verifyAnchor(index, bad2).reason, /aðra útgáfu/);
  const bad3 = Object.assign({}, good, { start: { unitId: 'thattur-01-999', offset: 0 } });
  assert.ok(!C.verifyAnchor(index, bad3).ok);
});

test('glósur: óbreytt endurvinnsla verður Tilvitnun, breytt helst Endurvinnsla', () => {
  const a = C.anchorForUnit(index, sec('thattur-01').units[1].id).anchor;
  const n1 = C.finalizeNote(C.newNote(a, { type: 'endurvinnsla', body: a.quote + '  \n', origin: 'recycle', insertedText: a.quote }));
  assert.equal(n1.type, 'tilvitnun');
  assert.ok(n1.unchangedCopy);
  const n2 = C.finalizeNote(C.newNote(a, { type: 'endurvinnsla', body: 'Þeir eyða eigum hans. ' + a.quote.slice(30), origin: 'recycle', insertedText: a.quote }));
  assert.equal(n2.type, 'endurvinnsla');
  const n3 = C.finalizeNote(C.newNote(a, { type: 'spurning', body: '', origin: 'own' }));
  assert.equal(n3.type, 'spurning', 'tóm glósa er vistuð, ekkert mat');
  assert.equal(n2.anchor.quote, a.quote, 'upprunalega valið varðveitt');
});

test('glósur: röð í textanum, síur og margar glósur á sama stað', () => {
  const u1 = sec('thattur-01').units[0], u3 = sec('thattur-01').units[2], f = sec('formali').units[0];
  const mk = (anchor, type, t) => Object.assign(C.newNote(anchor, { type }), { createdAt: t });
  const n1 = mk(C.anchorForUnit(index, u3.id).anchor, 'spurning', '2026-01-01T10:00:00.000Z');
  const n2 = mk(C.makeAnchor(index, { unitId: u1.id, offset: 10 }, { unitId: u1.id, offset: 40 }).anchor, 'athugasemd', '2026-01-01T09:00:00.000Z');
  const n3 = mk(C.makeAnchor(index, { unitId: u1.id, offset: 0 }, { unitId: u1.id, offset: 30 }).anchor, 'endursogn', '2026-01-01T11:00:00.000Z');
  const n4 = mk(C.anchorForUnit(index, f.id).anchor, 'athugasemd', '2026-01-01T12:00:00.000Z');
  const sorted = C.sortNotes(index, [n1, n2, n3, n4]);
  assert.deepEqual(sorted.map(n => n.id), [n4.id, n3.id, n2.id, n1.id]);
  assert.deepEqual(C.sortNotes(index, [n1, n2, n3, n4], 'stofnun').map(n => n.id), [n2.id, n1.id, n3.id, n4.id]);
  assert.equal(C.filterNotes([n1, n2, n3, n4], { sectionId: 'thattur-01' }).length, 3);
  assert.equal(C.filterNotes([n1, n2, n3, n4], { sectionId: 'thattur-01', type: 'athugasemd' }).length, 1);
  assert.equal(C.notesForUnit([n1, n2, n3, n4], u1.id).length, 2, 'skarandi val á sama textabút');
});

function sampleState() {
  const s1 = sec('thattur-01'), s2 = sec('thattur-02');
  const a1 = C.makeAnchor(index, { unitId: s1.units[0].id, offset: 0 }, { unitId: s1.units[1].id, offset: 25 }).anchor;
  const a2 = C.anchorForUnit(index, s2.units[0].id).anchor;
  const long = 'Þetta er löng glósa með ð, þ, æ og ö. '.repeat(400);
  return {
    settings: { fontSize: 24, font: 'sans', lineHeight: 'rumt', width: 'breidur', theme: 'dokkt' },
    position: { sectionId: 'thattur-02', unitId: s2.units[1].id },
    notes: [
      C.finalizeNote(C.newNote(a1, { type: 'endurvinnsla', body: 'Guðirnir funda.\n\nAþena fær Seif til að leyfa heimferð.', origin: 'recycle', insertedText: a1.quote })),
      C.newNote(a2, { type: 'spurning', body: long }),
      C.newNote(a2, { type: 'athugasemd', body: '# ekki fyrirsögn\n> ekki tilvitnun\n<b>ekki html</b>' }),
    ],
  };
}

test('vinnuskrá: fram og til baka án gagnataps', () => {
  const st = sampleState();
  const wf = C.makeWorkfile(index, st);
  assert.equal(wf.format, 'odysseifskvida-vinnuskra');
  assert.equal(wf.formatVersion, 1);
  assert.equal(wf.document.id, DATA.document.id);
  assert.equal(wf.document.version, DATA.document.version);
  const res = C.parseWorkfile(index, JSON.stringify(wf));
  assert.ok(res.ok, res.errors.join('; '));
  assert.deepEqual(res.data.notes, JSON.parse(JSON.stringify(st.notes)));
  assert.deepEqual(res.data.settings, st.settings);
  assert.deepEqual(res.data.position, st.position);
});

test('vinnuskrá: rangar og skemmdar skrár hafna án breytinga', () => {
  const st = sampleState();
  const good = C.makeWorkfile(index, st);
  const cases = [
    ['{ekki json', /skemmd/],
    ['[]', /ekki vinnuskrá/],
    [JSON.stringify(Object.assign({}, good, { format: 'annad' })), /ekki vinnuskrá/],
    [JSON.stringify(Object.assign({}, good, { formatVersion: 99 })), /nýrra sniði/],
    [JSON.stringify(Object.assign({}, good, { document: Object.assign({}, good.document, { id: 'iliónskviða' }) })), /annað skjal/],
    [JSON.stringify(Object.assign({}, good, { document: Object.assign({}, good.document, { version: 'sha256-ffff' }) })), /aðra útgáfu/],
    [JSON.stringify(Object.assign({}, good, { notes: 'x' })), /Glósulista vantar/],
  ];
  for (const [txt, re] of cases) {
    const r = C.parseWorkfile(index, txt);
    assert.equal(r.ok, false);
    assert.match(r.errors.join(' '), re);
  }
  const bad = clone(good); bad.notes[1].type = 'mat';
  assert.match(C.parseWorkfile(index, JSON.stringify(bad)).errors[0], /Glósa 2: óþekkt tegund/);
  const bad2 = clone(good); bad2.notes[0].anchor.quote = 'Annar texti';
  assert.match(C.parseWorkfile(index, JSON.stringify(bad2)).errors[0], /stemmir ekki/);
  const bad3 = clone(good); bad3.notes[0].anchor.docVersion = 'sha256-gamalt';
  assert.match(C.parseWorkfile(index, JSON.stringify(bad3)).errors[0], /aðra útgáfu/);
  const bad4 = clone(good); bad4.notes[2].id = bad4.notes[1].id;
  assert.match(C.parseWorkfile(index, JSON.stringify(bad4)).errors[0], /tvítekið/);
  const trunc = JSON.stringify(good).slice(0, 500);
  assert.equal(C.parseWorkfile(index, trunc).ok, false);
  // stillingar úr skrá eru hreinsaðar
  const odd = clone(good); odd.settings = { fontSize: 999, theme: 'neon' };
  assert.deepEqual(C.parseWorkfile(index, JSON.stringify(odd)).data.settings, Object.assign({}, C.DEFAULT_SETTINGS, { fontSize: C.FONT_MAX }));
});

test('vinnuskrá: tóm staða', () => {
  const wf = C.makeWorkfile(index, { notes: [], settings: null, position: null });
  const r = C.parseWorkfile(index, JSON.stringify(wf));
  assert.ok(r.ok);
  assert.equal(r.data.notes.length, 0);
  assert.equal(C.toMarkdown(C.exportModel(index, [])).includes('Engar glósur.'), true);
});

test('Markdown-útflutningur: allar glósur, aðgreindur frumtexti, íslenskir stafir og langar glósur', () => {
  const st = sampleState();
  const model = C.exportModel(index, st.notes, { includeQuote: true });
  assert.equal(model.count, 3);
  const md = C.toMarkdown(model);
  assert.match(md, /^# Ódysseifskviða – endursögn/);
  assert.match(md, /## I\. þáttur — Aþena kemur til Íþöku/);
  assert.match(md, /## II\. þáttur — Þingið á Íþöku/);
  assert.match(md, /Bls\. 6 · Efnisgreinar 1–2/);
  assert.match(md, /Tegund: Endurvinnsla/);
  assert.match(md, /\*\*Valinn frumtexti:\*\*\n\n> „Guðirnir sitja/);
  assert.match(md, /\*\*Mín glósa:\*\*\n\nGuðirnir funda\./);
  assert.equal((md.match(/### Glósa \d+/g) || []).length, 3, 'engin glósa týnist');
  assert.ok(md.includes('Þetta er löng glósa með ð, þ, æ og ö.'.repeat(1)));
  assert.ok(md.length > 15000);
  assert.match(md, /\\# ekki fyrirsögn/);
  assert.match(md, /\\> ekki tilvitnun/);
  assert.ok(md.includes('\\<b>ekki html'), 'HTML í glósu er táknað sem texti (\\<)');
  // margra efnisgreina val: hver lína frumtexta í tilvitnun
  assert.match(md, /> „Guðirnir[^\n]*\n>\n> Sjálf heldur/);
  const noQ = C.toMarkdown(C.exportModel(index, st.notes, { includeQuote: false }));
  assert.ok(!noQ.includes('Valinn frumtexti'));
  assert.equal((noQ.match(/### Glósa/g) || []).length, 3);
  // tilvitnun sem byrjar þegar á gæsalöppum fær ekki tvöfaldar
  const qa = C.anchorForUnit(index, sec('thattur-01').units.find(u => u.type === 'tilvitnun').id).anchor;
  const mdq = C.toMarkdown(C.exportModel(index, [C.newNote(qa, { body: 'x' })]));
  assert.ok(!mdq.includes('„„'));
});

test('útflutningur: PDF-síða notuð þegar prentað númer er óstaðfest', () => {
  const a = C.anchorForUnit(index, sec('titill').units[0].id).anchor;
  assert.equal(a.printedPages, null);
  assert.equal(C.locationParts(index, a).pages, 'PDF-síða 1');
});

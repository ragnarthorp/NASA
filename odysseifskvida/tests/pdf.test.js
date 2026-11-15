/* PDF-útflutningur: raunveruleg PDF-skrá með innfelldu letri, íslenskum stöfum, línu- og síðuskiptingu.
   Notar sama jsPDF og letur og vefurinn (../vendor). Textinn er lesinn aftur úr PDF með pdftotext ef það er til. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const C = require('../js/core.js');
const P = require('../js/pdfexport.js');

global.window = global;
require('../../vendor/pdf-fonts.js');
const { jsPDF } = require('../../vendor/jspdf.umd.min.js');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'odysseifskvida.json'), 'utf8'));
const index = C.buildIndex(DATA);

function havePdftotext() { try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); return true; } catch (e) { return false; } }

function notes() {
  const out = [];
  for (const s of DATA.sections.filter(x => x.kind === 'thattur')) {
    const u = s.units[0];
    const a = C.makeAnchor(index, { unitId: u.id, offset: 0 }, { unitId: u.id, offset: Math.min(60, u.text.length) }).anchor;
    out.push(C.newNote(a, { type: C.TYPE_IDS[s.number % 5], body: `Glósa við ${s.numeral}. þátt: ð þ æ ö Ð Þ Æ Ö – „gæsalappir“ …` }));
  }
  const q = DATA.sections.find(s => s.id === 'thattur-05').units.find(u => u.type === 'tilvitnun');
  out.push(C.newNote(C.anchorForUnit(index, q.id).anchor, { type: 'tilvitnun', body: 'Löng glósa. ' + 'Ódysseifur þráir að komast heim til Íþöku og sjá heimfarardaginn. '.repeat(150) + 'ENDIR' }));
  out.push(C.newNote(C.anchorForUnit(index, q.id).anchor, { type: 'spurning', body: 'Broskarl 😀 og annað sem letrið hefur ekki.' }));
  return out;
}

test('PDF: raunveruleg skrá með mörgum síðum, innfelldu letri og öllum glósum', () => {
  const ns = notes();
  const model = C.exportModel(index, ns, { includeQuote: true });
  const doc = P.build(jsPDF, window.NASA_PDF_FONTS, model);
  const buf = Buffer.from(doc.output('arraybuffer'));
  assert.equal(buf.slice(0, 5).toString(), '%PDF-');
  const pages = doc.getNumberOfPages();
  assert.ok(pages >= 4, `margar síður (${pages})`);
  const raw = buf.toString('latin1');
  assert.match(raw, /FontFile2/, 'letur er innfellt');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ody-')), 'glosur.pdf');
  fs.writeFileSync(file, buf);
  if (!havePdftotext()) return;
  const txt = execFileSync('pdftotext', ['-enc', 'UTF-8', file, '-'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8').replace(/\s+/g, ' ');
  assert.match(txt, /Ódysseifskviða – endursögn/);
  assert.match(txt, /I\. þáttur — Aþena kemur til Íþöku/);
  assert.match(txt, /XXIV\. þáttur — Friður/);
  assert.match(txt, /Bls\. 6 · Efnisgrein 1/);
  assert.match(txt, /Tegund: Endurvinnsla|Tegund: Endursögn/);
  assert.match(txt, /Valinn frumtexti:/);
  assert.match(txt, /Mín glósa:/);
  assert.match(txt, /ð þ æ ö Ð Þ Æ Ö – „gæsalappir“ …/);
  assert.match(txt, /„… hún er dauðleg, en þú ódauðleg og eldist eigi\./, 'tilvitnun án tvöfaldra gæsalappa');
  assert.match(txt, /ENDIR/, 'löng glósa skilar sér til enda');
  assert.equal((txt.match(/Glósa \d+ Ódysseifskviða – endursögn \S+/g) || []).length, ns.length, 'engin glósa týnist; heiti verks við hverja glósu');
  assert.match(txt, new RegExp(`Síða ${pages} af ${pages}`));
});

test('PDF: án frumtexta og tómt', () => {
  const doc = P.build(jsPDF, window.NASA_PDF_FONTS, C.exportModel(index, notes().slice(0, 2), { includeQuote: false }));
  assert.ok(doc.getNumberOfPages() >= 1);
  const empty = P.build(jsPDF, window.NASA_PDF_FONTS, C.exportModel(index, []));
  assert.equal(empty.getNumberOfPages(), 1);
  assert.throws(() => P.build(jsPDF, null, C.exportModel(index, [])), /Leturgerð/);
});

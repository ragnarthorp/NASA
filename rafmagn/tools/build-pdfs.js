/* Býr til forútbúnu PDF-skjölin í pdf/ með sama kóða og vefurinn notar.
   Keyrsla:  node tools/build-pdfs.js  */
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
global.window = global;
require(path.join(root, 'vendor/pdf-fonts.js'));
for (const f of ['js/core/util.js', 'js/core/physics.js', 'js/data/methods.js', 'js/data/problems.js', 'js/data/concepts.js', 'js/data/lessons.js', 'js/core/checker.js', 'js/pdf.js', 'js/guide-pdf.js', 'js/exam-pdf.js', 'js/sources-pdf.js']) require(path.join(root, f));
RF._jsPDF = require(path.join(root, 'vendor/jspdf.umd.min.js')).jsPDF;

(async () => {
  const outDir = path.join(root, 'pdf');
  fs.mkdirSync(outDir, { recursive: true });
  const jobs = [['formulaSheet', 'formulublad.pdf'], ['examNotes', 'profglosur.pdf'], ['problemOverview', 'verkefnayfirlit.pdf'], ['studyGuide', 'daemaleidarvisir.pdf'], ['practiceExam', 'aefingaprof.pdf'], ['sourceMap', 'hvar-er-hvad.pdf']];
  for (const [fn, name] of jobs) {
    const r = await RF.pdf[fn]();
    fs.writeFileSync(path.join(outDir, name), Buffer.from(r.doc.output('arraybuffer')));
    console.log(name.padEnd(22), r.pages + ' bls.', 'kvarði ' + r.scale);
  }
  if (process.argv.includes('--notes')) {
    const N = { title: 'Mínar prófglósur (prófun)', pages: +(process.argv[process.argv.indexOf('--notes') + 1] || 1), cards: [1, 2, 5, 6, 7, 8, 9, 11, 12], forget: [6, 7], types: ['V5', 'S7'], comments: { 7: 'Muna ×2 – fram og til baka!' }, own: [{ title: 'Ofn 10 A', text: 'ΔU = 10·0,4 = 4 V → U₂ = 220 − 4 = 216 V' }], showTable: true, showTraps: true };
    const r = await RF.pdf.myNotes(N);
    fs.writeFileSync(process.argv[process.argv.length - 1].endsWith('.pdf') ? process.argv[process.argv.length - 1] : path.join(outDir, 'test-glosur.pdf'), Buffer.from(r.doc.output('arraybuffer')));
    console.log('mínar glósur', r.pages + ' bls.', 'kvarði ' + r.scale);
  }
})().catch((e) => { console.error(e); process.exit(1); });

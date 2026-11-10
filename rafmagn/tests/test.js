/* Sjálfvirkar prófanir á reiknivél, verkefnagjafa, yfirferð og PDF.  Keyrsla:  node tests/test.js */
const path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
for (const f of ['js/core/util.js', 'js/core/physics.js', 'js/data/methods.js', 'js/data/problems.js', 'js/data/concepts.js', 'js/data/lessons.js', 'js/core/checker.js', 'js/core/store.js']) require(path.join(root, f));

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('  ✗ ' + msg); } };
const near = (a, b, tol = 1e-3) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const section = (s) => console.log('\n■ ' + s);

section('Hjálparföll');
ok(RF.util.parseNum('2,37') === 2.37, 'komma');
ok(RF.util.parseNum('2.37') === 2.37, 'punktur');
ok(RF.util.parseNum(' 230,91 V') === 230.91, 'eining aftan við');
ok(RF.util.parseNum('−15') === -15, 'unicode mínus');
ok(RF.util.parseNum('1.234,5') === 1234.5, 'þúsundapunktur');
ok(RF.util.parseNum('1e-3') === 0.001, 'e-rithátt');
ok(isNaN(RF.util.parseNum('abc')), 'ólesanlegt');
ok(isNaN(RF.util.parseNum('')), 'tómt');
ok(RF.util.fmt(2.37333) === '2,37', 'fmt komma');
ok(RF.util.fmtS(2.37333) === '2,373', 'fmtS 4 markverðir');
ok(RF.util.fmtS(230.91) === '230,91', 'fmtS 2 aukastafir');
ok(RF.util.fmt(-15) === '−15', 'fmt mínus');
ok(RF.util.mathText('R = \\f{ρ·l}{A}') === 'R = (ρ·l)/A', 'mathText');

section('Formúlur (physics)');
const P = RF.phys;
ok(near(P.areaFromDiameter(2), Math.PI), 'A = πd²/4 (d = 2 → π)');
ok(near(P.areaFromRadius(1), P.areaFromDiameter(2)), 'πr² = πd²/4');
ok(near(P.resistance(0.0178, 179.8, 1.6), 2.000275), 'R = ρl/A');
ok(near(P.resistance(0.0178, 50, 0.75, true), 2.37333), 'tvíleiðari ×2');
ok(near(P.length(43, 1.5, 0.43), 150), 'l = RA/ρ');
ok(near(P.length(0.5, 1.5, 0.0178, true), 21.0674), 'tvíleiðari l ÷2');
ok(near(P.area(0.0178, 90, 8 / 60, true), 24.03), 'A = 2ρl/R');
ok(near(P.rho(5, 2.4, 120), 0.1), 'ρ = RA/l');
ok(near(P.rAtTemp(7, 0.0055, 10, 50), 8.54), 'hitun');
ok(near(P.rAtTemp(7, 0.0055, 10, -15), 6.0375), 'kólnun yfir núllið');
ok(near(P.tempFrom(8.5, 10, 0.0039, 20), 65.2489), 'lokahitastig');
ok(near(P.dropPct(4, 220), 1.818), '% = ΔU/U·100');
ok(P.loadVoltage(220, 4) === 216 && P.sourceVoltage(214, 16.91) === 230.91, 'U₂ og U₁');
ok(RF.nextStdArea(24.03) === 25 && RF.nextStdArea(1.5) === 1.5, 'staðalstærð');
// umritanir eru andhverfur hver annarrar
for (let i = 0; i < 200; i++) {
  const rho = 0.01 + Math.random(), l = 1 + Math.random() * 500, A = 0.5 + Math.random() * 30, two = i % 2 === 0;
  const R = P.resistance(rho, l, A, two);
  if (!(near(P.length(R, A, rho, two), l) && near(P.area(rho, l, R, two), A) && near(P.rho(R, A, l, two), rho))) { ok(false, 'umritun ' + i); break; }
}
ok(true, 'umritanir R ↔ l ↔ A ↔ ρ (200 slembitilvik)');

section('Öll 13 upprunalegu dæmin – borin saman við svör kennarans');
const teacher = {
  V1: { R: 2.0 }, V2: { l: 150 }, V3: { rho: 0.1 }, V4: { R: 1.39, A_kopar: 2.56, A_platina: 14.1 }, V5: { dt: 45.25, t2: 65.25 }, V6: { Ra: 8.54, Rb: 6.0375 },
  S1: { R: 2.373 }, S2: { dU: 18.98 }, S3: { pct: 8.62 }, S4: { R: 0.5, l: 21.07 }, S5: { R: 0.1333, A: 24.03 }, S6: { dU: 28.48 }, S7: { R: 1.78, dU: 16.91, U1: 230.91 },
};
ok(RF.problemTypes.length === 13, '13 dæmagerðir');
for (const t of RF.problemTypes) {
  const pr = RF.makeProblem(t.id, 'orig');
  const v = t.solve(pr.p).v;
  for (const [k, e] of Object.entries(teacher[t.id])) ok(Math.abs(v[k] - e) / e < 0.005, t.id + '.' + k + ' = ' + v[k] + ' (kennari ' + e + ')');
  // svar kennarans telst rétt í yfirferð
  const ans = {};
  t.parts(pr.p).forEach((pt) => { ans[pt.k] = pt.kind === 'choice' ? v[pt.k][0] : String(teacher[t.id][pt.k] ?? RF.util.fmtS(v[pt.k])).replace('.', ','); });
  const res = RF.checkProblem(pr, ans);
  ok(res.score === 1, t.id + ': svör kennarans fá fullt hús (' + res.parts.map((r) => r.k + ':' + r.status).join(' ') + ')');
}
ok(RF.ptype('V3').solve(RF.makeProblem('V3', 'orig').p).v.mat.includes('jarn'), 'V3: járn er samþykkt');
ok(RF.ptype('S7').solve(RF.makeProblem('S7', 'orig').p).v.len[0] === '2l', 'S7: leið straumsins = 2l');

section('Forstillt afbrigði: a.m.k. 5 á hverja gerð, öll stig, öll gild');
for (const t of RF.problemTypes) {
  ok(t.presets.length >= 5, t.id + ' hefur ' + t.presets.length + ' afbrigði');
  const lv = new Set(t.presets.map((x) => x.level));
  ok(lv.has('lett') && lv.has('midl') && lv.has('erf'), t.id + ' hefur létt, miðlungs og erfitt');
  t.presets.forEach((pr, i) => { const v = t.solve(pr.p).v; ok(t.valid(pr.p, v), t.id + ' afbrigði ' + i + ' er gilt ' + JSON.stringify(v)); });
}

section('Verkefnagjafi: 300 slembidæmi á hverja gerð og stig');
let genCount = 0;
for (const t of RF.problemTypes) for (const level of ['lett', 'midl', 'erf']) {
  let bad = 0, fallback = 0;
  for (let s = 1; s <= 300; s++) {
    const pr = RF.makeProblem(t.id, { seed: s * 7919 + level.length, level });
    genCount++;
    if (pr.orig) { fallback++; continue; }
    const v = t.solve(pr.p).v;
    const finite = Object.values(v).every((x) => Array.isArray(x) || (isFinite(x) && x !== 0));
    if (!finite || !t.valid(pr.p, v)) bad++;
    // endurgerð út frá lykli gefur sama dæmi
    const again = RF.problemFromKey(pr.key);
    if (JSON.stringify(again.p) !== JSON.stringify(pr.p)) bad++;
    // rétt svar (námundað eins og birt er) fær fullt hús
    const ans = {};
    t.parts(pr.p).forEach((pt) => { ans[pt.k] = pt.kind === 'choice' ? v[pt.k][0] : RF.util.fmtS(v[pt.k]); });
    if (RF.checkProblem(pr, ans).score !== 1) bad++;
  }
  ok(bad === 0, t.id + '/' + level + ': ' + bad + ' gölluð dæmi');
  ok(fallback < 15, t.id + '/' + level + ': ' + fallback + ' sinnum þurfti að falla til baka');
}
// sérstakar eðlisfræðilegar kröfur
for (let s = 1; s <= 200; s++) {
  const p3 = RF.makeProblem('V3', { seed: s, level: 'midl' }).p, v3 = RF.ptype('V3').solve(p3).v;
  if (RF.closestMaterials(v3.rho)[0].diff > 0.01) { ok(false, 'V3 ρ passar ekki við efni ' + s); break; }
  const p5 = RF.makeProblem('V5', { seed: s, level: 'erf' }).p, v5 = RF.ptype('V5').solve(p5).v;
  if ((p5.R2 > p5.R1) !== (v5.t2 > p5.t1)) { ok(false, 'V5 stefna hitabreytingar ' + s); break; }
  const p6 = RF.makeProblem('V6', { seed: s, level: 'erf' }).p, v6 = RF.ptype('V6').solve(p6).v;
  if (!(v6.Ra > p6.R1 && v6.Rb < p6.R1)) { ok(false, 'V6 Ra > R1 > Rb ' + s); break; }
  const p7 = RF.makeProblem('S7', { seed: s, level: 'midl' }).p, v7 = RF.ptype('S7').solve(p7).v;
  if (!(v7.U1 > p7.U2)) { ok(false, 'S7 U1 > U2 ' + s); break; }
}
ok(true, 'V3 efni þekkjanlegt · V5 rétt stefna · V6 hitun/kólnun · S7 U₁ > U₂');
console.log('  (' + genCount + ' dæmi búin til)');

section('Einleiðari og tvíleiðari');
for (const id of ['S1', 'S2', 'S3', 'S6', 'S7']) {
  const pr = RF.makeProblem(id, 'orig'), v = RF.ptype(id).solve(pr.p).v;
  const single = RF.phys.resistance(0.0178, pr.p.l, pr.p.A, false);
  ok(near(v.R, 2 * single), id + ': R_l = 2 × einleiðari');
}
ok(near(RF.ptype('S4').solve(RF.makeProblem('S4', 'orig').p).v.l, RF.phys.length(0.5, 1.5, 0.0178) / 2), 'S4: hámarkslengd = (RA/ρ) / 2');
ok(near(RF.ptype('V1').solve(RF.makeProblem('V1', 'orig').p).v.R, RF.phys.resistance(0.0178, 179.8, 1.6, false)), 'V1: einleiðari án ×2');

section('Yfirferð og greining mistaka');
const chk = (tid, ans, src = 'orig') => RF.checkProblem(RF.makeProblem(tid, src), ans);
let r = chk('S1', { R: '1,19' });
ok(r.parts[0].status === 'wrong' && /margfalda með 2/.test(r.parts[0].msg), 'gleymdi ×2 → markviss ábending');
r = chk('S1', { R: '4,75' });
ok(/tvisvar/.test(r.parts[0].msg), 'margfaldaði tvisvar með 2');
r = chk('S3', { R: '2,373', dU: '18,99', pct: '0,0863' });
ok(r.parts[2].status === 'wrong' && /100/.test(r.parts[2].msg), 'gleymdi ×100');
r = chk('V5', { dt: '38,46', t2: '58,46' });
ok(/R_t1·α|R_t2·α/.test(r.parts[0].msg), 'R_t2 í nefnara (prentvilla) greind');
r = chk('V5', { dt: '45,25', t2: '45,25' });
ok(r.parts[0].status === 'correct' && /t₁/.test(r.parts[1].msg), 'gleymdi + t₁');
r = chk('V6', { Ra: '8,54', Rb: '6,8075' });
ok(/núllið/.test(r.parts[1].msg), 'Δt yfir núllið (5 í stað 25)');
r = chk('V6', { Ra: '8,925', Rb: '6,4225' });
ok(/hitastigið sjálft/.test(r.parts[0].msg), 'notaði t₂ í stað Δt');
r = chk('V1', { R: '3,558' }, 'p4');
ok(r.parts[0].status === 'correct', 'V1 með þvermáli – rétt');
r = chk('V1', { R: '0,8895' }, 'p4');
ok(/π·d²|radíus/.test(r.parts[0].msg), 'þvermál/radíus rugl greint');
r = chk('V1', { R: '2000,3' });
ok(/1000/.test(r.parts[0].msg), 'einingavilla ×1000');
r = chk('S7', { len: '2l', R: '1,78', dU: '16,91', U1: '197,09' });
ok(r.parts[3].status === 'wrong' && /U₁ = U₂ \+ ΔU/.test(r.parts[3].msg), 'U₁ = U₂ − ΔU greint');
r = chk('S7', { len: 'l', R: '0,89', dU: '8,455', U1: '222,455' });
ok(r.parts[0].status === 'wrong' && r.parts[1].status === 'wrong' && r.parts[3].status !== 'correct', 'S7 einleiðaravilla');
r = chk('S2', { R: '2', dU: '16' });
ok(r.parts[1].status === 'follow' && r.parts[1].credit === 0.5, 'fylgivilla fær hálft stig');
r = chk('S5', { R: '0,13', A: '24,6' });
ok(r.parts[1].status === 'close' && r.parts[1].credit === 1, 'S5: svar kennarans (24,6) telst rétt með ábendingu');
r = chk('S4', { R: '0,5', l: '42,13' });
ok(/deila með 2/.test(r.parts[1].msg), 'S4: gleymdi ÷2');
r = chk('V2', { l: '150.0' });
ok(r.score === 1, 'punktur sem tugabrotsmerki');
r = chk('V2', { l: 'abc' });
ok(r.parts[0].status === 'empty', 'ólesanlegt svar');
r = chk('V2', { l: '153' });
ok(r.parts[0].status === 'close', '2 % frávik → telst rétt (námundun)');
r = chk('V2', { l: '170' });
ok(r.parts[0].status === 'wrong' && r.score === 0, 'rangt svar');
r = chk('V3', { rho: '0,1', mat: 'platina' });
ok(r.score === 1, 'V3: platína (0,098) líka samþykkt');
r = chk('V3', { rho: '0,1', mat: 'kopar' });
ok(r.parts[1].status === 'wrong', 'V3: rangt efni');

section('Hugtakaspurningar og kennsluefni');
const ids = new Set();
RF.concepts.forEach((c) => { ok(!ids.has(c.id), 'einkvæmt auðkenni ' + c.id); ids.add(c.id); ok(c.opts.length >= 2 && [].concat(c.a).every((i) => i < c.opts.length), c.id + ' rétt svar til'); ok(RF.cats[c.cat], c.id + ' flokkur'); });
ok(RF.concepts.length >= 40, RF.concepts.length + ' hugtakaspurningar');
ok(RF.conceptCorrect(RF.concept('c1-5'), [4, 3, 2, 1, 0]) && !RF.conceptCorrect(RF.concept('c1-5'), [0, 1]), 'fjölval');
RF.lessons.forEach((ch) => ch.sections.forEach((s) => s.quiz.forEach((q) => ok(RF.concept(q), s.id + ' vísar í ' + q))));
ok(RF.lessons.length === 4, 'fjórir kaflar');
RF.methods.forEach((m) => m.types.forEach((tid) => ok(RF.ptype(tid), 'spjald ' + m.id + ' → ' + tid)));
RF.problemTypes.forEach((t) => t.cards.forEach((c) => ok(RF.method(c), t.id + ' → spjald ' + c)));

section('Flýtihjálp „Hvaða dæmi er þetta?“');
const exp = { 'Mér er gefin lengd, þverflatarmál og efni.': [1], 'Mér er gefið viðnám og ég á að finna lengd.': [2], 'Mér er gefin fjarlægð og straumur og ég á að finna spennufall.': [7, 8], 'Mér er gefið spennufall og ég á að finna þverflatarmál.': [12], 'Mér er gefið viðnám við tvö hitastig.': [6], 'Mér er gefið spennufall og ég á að finna spennu spennugjafans.': [10] };
RF.quickIds.forEach((q) => { if (exp[q.say]) ok(JSON.stringify(RF.identify(q.g, q.find).cards) === JSON.stringify(exp[q.say]), q.say + ' → ' + RF.identify(q.g, q.find).cards); });

section('Framvinda (store)');
RF.store.load();
RF.store.reset();
const pr = RF.makeProblem('V1', 'orig');
RF.store.recordProblem(pr, { score: 1 }, false);
RF.store.recordProblem(pr, { score: 0 }, false);
RF.store.recordProblem(pr, { score: 1 }, true);
let st = RF.store.get().types.V1;
ok(st.tries === 3 && st.solo === 1 && st.assisted === 1, 'skráning tilrauna');
ok(RF.store.typeMastery('V1') > 0 && RF.store.typeMastery('V1') < 1, 'færni milli 0 og 1');
const topic = RF.checkTopics.find((t) => t.id === 'R');
RF.store.get().checklist.R = { skil: true, formula: true, hjalp: true, an: true, tilbuin: true };
ok(RF.store.topicStatus(topic).ready === true, 'gátlisti: tilbúin/n þegar frammistaða styður');
const t2 = RF.checkTopics.find((t) => t.id === 'hiti');
RF.store.get().checklist.hiti = { skil: true, formula: true, hjalp: true, an: true, tilbuin: true };
ok(RF.store.topicStatus(t2).ready === false, 'gátlisti: sjálfsmat eitt nægir ekki');
const json = RF.store.exportJSON();
RF.store.reset();
ok(!RF.store.get().types.V1, 'endurstilling');
RF.store.importJSON(json);
ok(RF.store.get().types.V1.tries === 3, 'útflutningur og innflutningur');
let threw = false; try { RF.store.importJSON('{"v":9}'); } catch (e) { threw = true; } ok(threw, 'hafnar rangri skrá');

section('PDF');
require(path.join(root, 'vendor/pdf-fonts.js'));
require(path.join(root, 'js/pdf.js'));
require(path.join(root, 'js/guide-pdf.js'));
RF._jsPDF = require(path.join(root, 'vendor/jspdf.umd.min.js')).jsPDF;
(async () => {
  const fs = await RF.pdf.formulaSheet();
  ok(fs.pages === 1, 'formúlublað er 1 bls. (kvarði ' + fs.scale + ')');
  const en = await RF.pdf.examNotes();
  ok(en.pages === 2, 'prófglósur eru 2 bls. (kvarði ' + en.scale + ')');
  const po = await RF.pdf.problemOverview();
  ok(po.pages >= 1, 'verkefnayfirlit ' + po.pages + ' bls.');
  const sg = await RF.pdf.studyGuide();
  ok(sg.pages === 31, 'dæmaleiðarvísir er 31 bls. (' + sg.pages + ', kvarði ' + sg.scale + ')');
  const head = Buffer.from(fs.doc.output('arraybuffer')).slice(0, 5).toString();
  ok(head === '%PDF-', 'raunveruleg PDF-skrá');
  const N1 = { title: 'Próf', pages: 1, cards: [1, 7], forget: [7], types: ['S7'], comments: { 7: 'Muna ×2' }, own: [{ title: 'Mitt', text: 'ΔU = 4 V' }], showTable: false, showTraps: false };
  const n1 = await RF.pdf.myNotes(N1);
  ok(n1.pages === 1, 'mínar glósur 1 bls.');
  const N2 = { ...N1, pages: 2, cards: RF.methods.map((m) => m.id), types: RF.problemTypes.map((t) => t.id), showTable: true, showTraps: true };
  const n2 = await RF.pdf.myNotes(N2);
  ok(n2.pages <= 3, 'mínar glósur, allt valið: ' + n2.pages + ' bls.');
  const txt = Buffer.from(n1.doc.output('arraybuffer')).toString('latin1');
  ok(txt.includes('/RFSans') || txt.includes('FontFile2'), 'letur innfellt');
  console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' prófanir stóðust, ' + fail + ' féllu.');
  process.exit(fail ? 1 : 0);
})();

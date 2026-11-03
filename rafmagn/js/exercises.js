/*
 * exercises.js — verkefnabanki: æfingar og prófspurningar.
 * Rétt svör eru reiknuð með Calc svo þau stemmi alltaf við reiknivélarnar.
 * examOnly: spurningin birtist aðeins í prófham.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./calc.js'), require('./explain.js'));
  else root.Exercises = factory(root.Calc, root.Explain);
})(typeof self !== 'undefined' ? self : this, function (Calc, Explain) {
  'use strict';

  const S = Explain.sym;
  const F = Explain.frac;

  const TOPICS = [
    { id: 'ohm', name: 'Lögmál Ohms', short: 'Ohm' },
    { id: 'seriesR', name: 'Heildarviðnám í raðtengingu', short: 'Raðtenging: R_H' },
    { id: 'seriesU', name: 'Spennuföll í raðtengingu', short: 'Raðtenging: spennuföll' },
    { id: 'parallelR', name: 'Heildarviðnám í hliðtengingu', short: 'Hliðtenging: R_H' },
    { id: 'parallelI', name: 'Greinastraumar og heildarstraumur', short: 'Hliðtenging: straumar' },
    { id: 'units', name: 'Einingabreytingar', short: 'Einingar' },
    { id: 'concepts', name: 'Hugtök: hvað er eins og hvað leggst saman', short: 'Hugtök' },
    { id: 'mixed', name: 'Blönduð tenging [Prófefni]', short: 'Blönduð tenging' },
  ];

  const COUNT = ['', 'Eitt', 'Tvö', 'Þrjú', 'Fjögur', 'Fimm', 'Sex'];
  function listAnd(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' og ' + items[items.length - 1];
  }
  function rList(rTexts) { return listAnd(rTexts.map(function (t, i) { return S('R', i + 1) + ' = ' + t; })); }
  function nonDuplicate(mistakes, correct) {
    return mistakes.filter(function (m) { return Number.isFinite(m.value) && m.value > 0 && Calc.relDiff(m.value, correct) > 0.01; });
  }
  const UNITS_OF = { U: ['V'], I: ['A', 'mA'], R: ['Ω', 'kΩ'] };

  /* ---------- Byggjarar ---------- */

  function ohmEx(o) {
    const known = {};
    const units = {};
    Object.keys(o.given).forEach(function (k) {
      const qv = Calc.quantity(o.given[k]);
      known[k] = qv.value; units[k] = qv.unit;
    });
    const ex = Explain.ohm(o.find, known, units);
    const v = ex.value;
    const wrong = {
      U: [{ value: known.I / known.R, msg: 'Þú deildir í stað þess að margfalda. Spennan er U = I · R.' },
        { value: known.R / known.I, msg: 'Þú deildir í stað þess að margfalda. Spennan er U = I · R.' }],
      I: [{ value: known.U * known.R, msg: 'Þú margfaldaðir í stað þess að deila. Straumurinn er I = U / R.' },
        { value: known.R / known.U, msg: 'Brotið snýr öfugt. Straumurinn er I = U / R — spennan fer fyrir ofan strikið.' }],
      R: [{ value: known.U * known.I, msg: 'Þú margfaldaðir í stað þess að deila. Viðnámið er R = U / I.' },
        { value: known.I / known.U, msg: 'Brotið snýr öfugt. Viðnámið er R = U / I — spennan fer fyrir ofan strikið.' }],
    }[o.find];
    const labels = {
      U: o.given.U || '?', R: o.given.R || '?', I: o.given.I || (o.find === 'I' ? '?' : null),
    };
    return {
      id: o.id, topic: o.topic || 'ohm', type: 'numeric', title: o.title, examOnly: !!o.examOnly,
      prompt: o.prompt,
      diagram: { kind: 'series', U: labels.U, R: [labels.R], I: labels.I },
      answers: [{
        key: o.find, label: S(o.find) + ' (' + { U: 'spenna', I: 'straumur', R: 'viðnám' }[o.find] + ')',
        q: o.find, value: v, units: o.units || UNITS_OF[o.find], unit: o.unit,
        mistakes: nonDuplicate(wrong.concat(o.mistakes || []), v),
      }],
      hint: o.hint,
      solution: ex.steps,
    };
  }

  function seriesEx(o) {
    const qs = o.R.map(Calc.quantity);
    const rs = qs.map(function (x) { return x.value; });
    const U = o.U ? Calc.quantity(o.U).value : null;
    const ex = Explain.series(U, rs, qs.map(function (x) { return x.unit; }));
    const r = ex.result;
    const k = rs.length;
    const pR = Calc.parallelResistance(rs);
    const answers = [];
    const drops = o.R.map(function () { return null; });
    let showI = null;
    o.ask.forEach(function (key) {
      if (key === 'RH') {
        answers.push({ key: key, label: S('R', 'H') + ' (heildarviðnám)', q: 'R', value: r.RH, units: UNITS_OF.R,
          mistakes: nonDuplicate([
            { value: pR, msg: 'Þetta er heildarviðnám hliðtengingar. Í raðtengingu leggurðu viðnámin einfaldlega saman.' },
            { value: r.RH / k, msg: 'Þú tókst meðaltal. Í raðtengingu leggjast viðnámin saman — ekki deila með fjöldanum.' },
          ], r.RH) });
      } else if (key === 'I') {
        showI = '?';
        answers.push({ key: key, label: S('I', 'H') + ' (heildarstraumur)', q: 'I', value: r.I, units: UNITS_OF.I,
          mistakes: nonDuplicate([
            { value: U / rs[0], msg: 'Þú deildir aðeins með einu viðnámi. Notaðu heildarviðnámið: I_H = U_H / R_H.' },
            { value: U / pR, msg: 'Þú notaðir heildarviðnám hliðtengingar. Í raðtengingu er R_H summa viðnámanna.' },
            { value: U * r.RH, msg: 'Þú margfaldaðir í stað þess að deila. Straumurinn er I_H = U_H / R_H.' },
            { value: r.RH / U, msg: 'Brotið snýr öfugt. Straumurinn er I_H = U_H / R_H.' },
          ], r.I) });
      } else if (/^U\d$/.test(key)) {
        const i = +key.slice(1) - 1;
        drops[i] = '?';
        answers.push({ key: key, label: S('U', i + 1) + ' (spennufall yfir ' + S('R', i + 1) + ')', q: 'U', value: r.drops[i], units: UNITS_OF.U,
          mistakes: nonDuplicate([
            { value: U, msg: 'Þetta er spenna spennugjafans. Yfir hvert viðnám fellur aðeins hluti hennar: U = I_H · R.' },
            { value: U / k, msg: 'Spennan skiptist aðeins jafnt ef viðnámin eru jafnstór. Reiknaðu U = I_H · R fyrir þetta viðnám.' },
            { value: U / rs[i], msg: 'Þetta er straumur, ekki spenna. Spennufallið er U = I_H · R.' },
          ], r.drops[i]) });
      }
    });
    const wantsCurrent = o.ask.some(function (a) { return a !== 'RH'; });
    const intro = o.prompt || (COUNT[k] + ' viðnám eru raðtengd' + (o.U ? ' við ' + o.U + ' spennugjafa' : '') + ': ' + rList(o.R) + '.');
    return {
      id: o.id, topic: o.topic, type: 'numeric', title: o.title, examOnly: !!o.examOnly,
      prompt: intro + ' ' + (o.task || ''),
      diagram: { kind: 'series', U: o.U || '', R: o.R, I: showI, drops: drops.some(Boolean) ? drops : null },
      answers: answers,
      hint: o.hint || (wantsCurrent
        ? 'Finndu fyrst heildarviðnámið R_H. Notaðu síðan lögmál Ohms á alla rásina, I_H = U_H / R_H. Sami straumur fer um öll viðnámin, svo spennufallið yfir hvert viðnám er U = I_H · R.'
        : 'Í raðtengingu leggjast viðnámin saman. Hafðu öll viðnám í sömu einingu áður en þú leggur saman.'),
      solution: ex.steps,
    };
  }

  function parallelEx(o) {
    const qs = o.R.map(Calc.quantity);
    const rs = qs.map(function (x) { return x.value; });
    const U = o.U ? Calc.quantity(o.U).value : null;
    const ex = Explain.parallel(U, rs, qs.map(function (x) { return x.unit; }));
    const r = ex.result;
    const k = rs.length;
    const sR = Calc.seriesResistance(rs);
    const answers = [];
    const currents = o.R.map(function () { return null; });
    let showI = null;
    o.ask.forEach(function (key) {
      if (key === 'RH') {
        const prod = rs.reduce(function (a, b) { return a * b; }, 1);
        answers.push({ key: key, label: S('R', 'H') + ' (heildarviðnám)', q: 'R', value: r.RH, units: UNITS_OF.R,
          mistakes: nonDuplicate([
            { value: sR, msg: 'Þetta er summa viðnámanna — hún gildir í raðtengingu. Í hliðtengingu er R_H minna en minnsta viðnámið.' },
            { value: r.invSum, msg: 'Þú gleymdir að snúa við í lokin. Þú fannst 1/R_H; R_H = 1 / (summan).' },
            { value: k === 3 ? prod / sR : NaN, msg: 'Formúlan góða gildir aðeins fyrir tvö viðnám. Notaðu 1/R_H = 1/R₁ + 1/R₂ + 1/R₃.' },
            { value: sR / k, msg: 'Þú tókst meðaltal viðnámanna. Notaðu andhverfuformúluna 1/R_H = 1/R₁ + 1/R₂ + …' },
          ], r.RH) });
      } else if (key === 'IH') {
        showI = '?';
        answers.push({ key: key, label: S('I', 'H') + ' (heildarstraumur)', q: 'I', value: r.IH, units: UNITS_OF.I,
          mistakes: nonDuplicate([
            { value: U / sR, msg: 'Þú notaðir summu viðnámanna eins og í raðtengingu. Leggðu frekar saman greinastraumana (eða notaðu I_H = U_H / R_H).' },
            { value: r.currents[0], msg: 'Þetta er aðeins straumurinn í einni grein. Heildarstraumurinn er summa allra greinastrauma.' },
          ], r.IH) });
      } else if (/^I\d$/.test(key)) {
        const i = +key.slice(1) - 1;
        currents[i] = '?';
        answers.push({ key: key, label: S('I', i + 1) + ' (straumur í gegnum ' + S('R', i + 1) + ')', q: 'I', value: r.currents[i], units: UNITS_OF.I,
          mistakes: nonDuplicate([
            { value: r.IH, msg: 'Þetta er heildarstraumurinn. Straumurinn í einni grein er I = U_H / R fyrir það viðnám.' },
            { value: r.IH / k, msg: 'Straumurinn skiptist aðeins jafnt ef viðnámin eru jafnstór. Reiknaðu I = U_H / R fyrir þessa grein.' },
            { value: U * rs[i], msg: 'Þú margfaldaðir í stað þess að deila. Straumurinn er I = U / R.' },
          ], r.currents[i]) });
      }
    });
    const wantsCurrent = o.ask.some(function (a) { return a !== 'RH'; });
    const intro = o.prompt || (COUNT[k] + ' viðnám eru hliðtengd' + (o.U ? ' við ' + o.U + ' spennugjafa' : '') + ': ' + rList(o.R) + '.');
    return {
      id: o.id, topic: o.topic, type: 'numeric', title: o.title, examOnly: !!o.examOnly,
      prompt: intro + ' ' + (o.task || ''),
      diagram: { kind: 'parallel', U: o.U || '', R: o.R, I: showI, currents: currents.some(Boolean) ? currents : null },
      answers: answers,
      hint: o.hint || (wantsCurrent
        ? 'Sama spenna, U_H, er yfir hverri grein. Reiknaðu straum í hverri grein með I = U_H / R og leggðu greinastraumana saman til að fá I_H.'
        : (k === 2 ? 'Notaðu 1/R_H = 1/R₁ + 1/R₂ og mundu að snúa við í lokin — eða formúluna góðu fyrir tvö viðnám.'
          : 'Notaðu 1/R_H = 1/R₁ + 1/R₂ + … og snúðu við í lokin. Formúlan góða á ekki beint við fleiri en tvö viðnám.')),
      solution: ex.steps,
    };
  }

  function unitEx(o) {
    const from = Calc.quantity(o.from);
    const v = from.value;
    const sameNumber = Calc.toSI(from.input, o.to);
    const otherWay = Calc.toSI(Calc.fromSI(Calc.toSI(from.input, o.to), from.unit), o.to); // öfug átt
    const toFactorText = o.factor;
    return {
      id: o.id, topic: 'units', type: 'numeric', title: o.title, examOnly: !!o.examOnly,
      prompt: o.prompt || ('Breyttu ' + o.from + ' í ' + o.to + '.'),
      answers: [{
        key: 'x', label: o.label || ('Svar í ' + o.to), q: from.q, value: v, units: [o.to],
        mistakes: nonDuplicate([
          { value: sameNumber, msg: 'Þú skrifaðir sömu tölu og áður. Talan breytist þegar einingin breytist — ' + toFactorText + '.' },
          { value: otherWay, msg: 'Þú breyttir í öfuga átt. ' + toFactorText + '.' },
        ], v),
      }],
      hint: o.hint,
      solution: o.solution || [{ title: 'Umbreyting', html: [toFactorText + '.', o.from + ' = ' + Calc.formatIn(v, o.to)] }],
    };
  }

  function mcEx(o) {
    return {
      id: o.id, topic: o.topic, type: 'mc', title: o.title, examOnly: !!o.examOnly,
      prompt: o.prompt, diagram: o.diagram || null,
      options: o.options.map(function (x) { return { text: x[0], correct: !!x[1], why: x[2] || '' }; }),
      hint: o.hint,
      solution: o.solution,
    };
  }

  function numEx(o) {
    return {
      id: o.id, topic: o.topic, type: 'numeric', title: o.title, examOnly: !!o.examOnly,
      prompt: o.prompt, diagram: o.diagram || null,
      answers: o.answers.map(function (a) { return Object.assign({ units: UNITS_OF[a.q] }, a); }),
      hint: o.hint, solution: o.solution,
    };
  }

  /* ---------- Verkefnabankinn ---------- */
  const q = function (t) { return Calc.quantity(t).value; };

  const BANK = [
    /* Lögmál Ohms */
    ohmEx({ id: 'ohm-1', title: 'Straumur í einfaldri rás', find: 'I', given: { U: '12 V', R: '4 Ω' },
      prompt: 'Viðnám upp á 4 Ω er tengt við 12 V spennugjafa. Hver er straumurinn í rásinni?',
      hint: 'Þú þekkir spennu og viðnám og leitar að straumi. Hvaða útgáfa af lögmáli Ohms hefur I eitt sér öðrum megin?' }),
    ohmEx({ id: 'ohm-2', title: 'Spenna yfir viðnám', find: 'U', given: { I: '0,5 A', R: '220 Ω' },
      prompt: 'Straumurinn í gegnum 220 Ω viðnám er 0,5 A. Hver er spennan yfir viðnámið?',
      hint: 'Spenna er straumur sinnum viðnám.' }),
    ohmEx({ id: 'ohm-3', title: 'Viðnám út frá spennu og straumi', find: 'R', given: { U: '9 V', I: '30 mA' },
      prompt: '9 V rafhlaða knýr 30 mA straum í gegnum viðnám. Hversu stórt er viðnámið?',
      hint: 'Breyttu fyrst straumnum í amper (30 mA = ? A). Viðnám er spenna deilt með straumi.' }),
    ohmEx({ id: 'ohm-4', title: 'Straumur um 1 kΩ', find: 'I', given: { U: '9 V', R: '1 kΩ' },
      prompt: 'Spennan yfir 1 kΩ viðnám er 9 V. Hver er straumurinn? Þú mátt svara í A eða mA.',
      hint: 'Breyttu 1 kΩ í Ω áður en þú deilir. Svarið verður lítið í amperum — mA getur hentað betur.' }),
    ohmEx({ id: 'ohm-5', title: 'Spenna með straum í mA', find: 'U', given: { I: '20 mA', R: '470 Ω' },
      prompt: 'Straumurinn í gegnum 470 Ω viðnám er 20 mA. Hver er spennan yfir viðnámið?',
      hint: 'Breyttu 20 mA í amper fyrst. Notaðu síðan U = I · R.',
      mistakes: [{ value: 20 * 470, msg: 'Þú margfaldaðir með 20 í stað 0,02. Breyttu 20 mA í amper (0,02 A) áður en þú margfaldar.' }] }),
    mcEx({ id: 'ohm-6', topic: 'ohm', title: 'Rétta formúlan',
      prompt: 'Þú þekkir spennuna ' + S('U') + ' og strauminn ' + S('I') + '. Hvaða formúlu notarðu til að finna viðnámið ' + S('R') + '?',
      options: [
        [S('R') + ' = ' + S('U') + ' · ' + S('I'), false, 'Margfeldið U · I er ekki viðnám. Byrjaðu á U = I · R og deildu báðum megin með I.'],
        [S('R') + ' = ' + S('U') + ' / ' + S('I'), true],
        [S('R') + ' = ' + S('I') + ' / ' + S('U'), false, 'Brotið snýr öfugt. Spennan á að vera fyrir ofan strikið: R = U / I.'],
      ],
      hint: 'Byrjaðu á U = I · R. Hvað þarftu að gera til að fá R eitt sér?',
      solution: [{ title: 'Umrita lögmál Ohms', html: [S('U') + ' = ' + S('I') + ' · ' + S('R'), 'Deilum báðum megin með ' + S('I') + ': ' + S('R') + ' = ' + F(S('U'), S('I'))] }] }),
    ohmEx({ id: 'ohm-x1', examOnly: true, title: 'Viðnám hitaelements', find: 'R', given: { U: '230 V', I: '2 A' },
      prompt: 'Hitaelement er tengt við 230 V og straumurinn er 2 A. Hvert er viðnám elementsins?',
      hint: 'R = U / I.' }),
    ohmEx({ id: 'ohm-x2', examOnly: true, title: 'Straumur um 1,5 kΩ', find: 'I', given: { U: '4,5 V', R: '1,5 kΩ' },
      prompt: 'Spennan yfir 1,5 kΩ viðnám er 4,5 V. Hver er straumurinn?',
      hint: 'Breyttu kΩ í Ω og notaðu I = U / R.' }),
    mcEx({ id: 'ohm-x3', examOnly: true, topic: 'ohm', title: 'Tvöföld spenna',
      prompt: 'Spennan yfir viðnám er tvöfölduð en viðnámið helst óbreytt. Hvað gerist við strauminn?',
      options: [
        ['Hann helmingast.', false, 'Samkvæmt I = U / R vex straumurinn með spennunni þegar R er fast.'],
        ['Hann helst óbreyttur.', false, 'Straumurinn breytist þegar spennan breytist og viðnámið er fast: I = U / R.'],
        ['Hann tvöfaldast.', true],
      ],
      hint: 'Skoðaðu I = U / R. Hvað gerist við brotið ef teljarinn tvöfaldast?',
      solution: [{ title: 'Lögmál Ohms', html: [S('I') + ' = ' + F(S('U'), S('R')) + '. Ef ' + S('U') + ' tvöfaldast og ' + S('R') + ' er óbreytt, tvöfaldast ' + S('I') + ' líka.'] }] }),

    /* Heildarviðnám í raðtengingu */
    seriesEx({ id: 'sr-1', topic: 'seriesR', title: 'Þrjú raðtengd viðnám', R: ['100 Ω', '200 Ω', '300 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '?' }),
    seriesEx({ id: 'sr-2', topic: 'seriesR', title: 'Blandaðar einingar', R: ['1 kΩ', '470 Ω', '330 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '? Athugaðu einingarnar.',
      hint: 'Breyttu 1 kΩ í Ω áður en þú leggur saman. Þú mátt svara í Ω eða kΩ.' }),
    numEx({ id: 'sr-3', topic: 'seriesR', title: 'Óþekkt viðnám í raðtengingu',
      prompt: 'Tvö viðnám eru raðtengd við 12 V spennugjafa. Straumurinn í rásinni er 0,05 A og ' + S('R', 1) + ' = 100 Ω. Finndu heildarviðnámið ' + S('R', 'H') + ' og viðnámið ' + S('R', 2) + '.',
      diagram: { kind: 'series', U: '12 V', R: ['100 Ω', '?'], I: '0,05 A' },
      answers: [
        { key: 'RH', label: S('R', 'H') + ' (heildarviðnám)', q: 'R', value: 240,
          mistakes: [{ value: 0.6, msg: 'Þú margfaldaðir. Heildarviðnámið er R_H = U_H / I_H.' }] },
        { key: 'R2', label: S('R', 2), q: 'R', value: 140,
          mistakes: [{ value: 340, msg: 'Þú lagðir R₁ við R_H. Í raðtengingu er R_H = R₁ + R₂, svo R₂ = R_H − R₁.' }, { value: 240, msg: 'Þetta er heildarviðnámið. Dragðu R₁ frá: R₂ = R_H − R₁.' }] },
      ],
      hint: 'Notaðu lögmál Ohms á alla rásina til að finna R_H. Í raðtengingu er R_H = R₁ + R₂.',
      solution: [
        { title: 'Heildarviðnám út frá lögmáli Ohms', html: [S('R', 'H') + ' = ' + F(S('U', 'H'), S('I', 'H')) + ' = ' + F('12 V', '0,05 A') + ' = 240 Ω'] },
        { title: 'Draga þekkta viðnámið frá', html: [S('R', 'H') + ' = ' + S('R', 1) + ' + ' + S('R', 2) + ' ⇒ ' + S('R', 2) + ' = ' + S('R', 'H') + ' − ' + S('R', 1) + ' = 240 Ω − 100 Ω = 140 Ω'] },
        { title: 'Athugun', html: ['100 Ω + 140 Ω = 240 Ω og ' + F('12 V', '240 Ω') + ' = 0,05 A ✓'] },
      ] }),
    mcEx({ id: 'sr-4', topic: 'seriesR', title: 'Hvað getur R_H verið?',
      prompt: 'Viðnámin 10 Ω, 20 Ω og 30 Ω eru raðtengd. Hvað af eftirfarandi er rétt um heildarviðnámið?',
      diagram: { kind: 'series', U: '', R: ['10 Ω', '20 Ω', '30 Ω'] },
      options: [
        [S('R', 'H') + ' = 20 Ω, sem er meðaltal viðnámanna.', false, 'Í raðtengingu leggjast viðnámin saman — það er ekki tekið meðaltal.'],
        [S('R', 'H') + ' ≈ 5,45 Ω, sem er minna en minnsta viðnámið.', false, 'Þetta er heildarviðnám hliðtengingar. Í raðtengingu verður R_H stærra en hvert einstakt viðnám.'],
        [S('R', 'H') + ' = 60 Ω, sem er stærra en hvert einstakt viðnám.', true],
      ],
      hint: 'Straumurinn þarf að fara í gegnum öll viðnámin hvert á eftir öðru.',
      solution: [{ title: 'Leggja saman', html: [S('R', 'H') + ' = 10 Ω + 20 Ω + 30 Ω = 60 Ω', 'Í raðtengingu er heildarviðnámið alltaf stærra en hvert einstakt viðnám.'] }] }),
    seriesEx({ id: 'sr-x1', examOnly: true, topic: 'seriesR', title: 'Fjögur jafnstór viðnám', R: ['2,2 kΩ', '2,2 kΩ', '2,2 kΩ', '2,2 kΩ'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '?' }),
    seriesEx({ id: 'sr-x2', examOnly: true, topic: 'seriesR', title: 'Fjögur ólík viðnám', R: ['47 Ω', '68 Ω', '150 Ω', '220 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '?' }),

    /* Spennuföll í raðtengingu */
    seriesEx({ id: 'su-1', topic: 'seriesU', title: 'Raðtenging, 12 V', U: '12 V', R: ['100 Ω', '200 Ω'], ask: ['RH', 'I', 'U1', 'U2'],
      task: 'Reiknaðu heildarviðnámið, heildarstrauminn og spennufallið yfir hvort viðnám.' }),
    seriesEx({ id: 'su-2', topic: 'seriesU', title: 'Raðtenging í kΩ', U: '9 V', R: ['1 kΩ', '2 kΩ'], ask: ['I', 'U1', 'U2'],
      task: 'Reiknaðu strauminn og spennufallið yfir hvort viðnám.' }),
    seriesEx({ id: 'su-3', topic: 'seriesU', title: 'Þrjú viðnám, 24 V', U: '24 V', R: ['100 Ω', '200 Ω', '300 Ω'], ask: ['I', 'U1', 'U2', 'U3'],
      task: 'Reiknaðu strauminn og spennufallið yfir hvert viðnám.' }),
    numEx({ id: 'su-4', topic: 'seriesU', title: 'Út frá spennuföllum',
      prompt: 'Tvö viðnám eru raðtengd. Spennufallið yfir ' + S('R', 1) + ' er 3 V og yfir ' + S('R', 2) + ' er 5 V. Straumurinn í rásinni er 0,1 A. Hver er spenna spennugjafans ' + S('U', 'H') + ' og hversu stórt er ' + S('R', 1) + '?',
      diagram: { kind: 'series', U: '?', R: ['?', '?'], drops: ['3 V', '5 V'], I: '0,1 A' },
      answers: [
        { key: 'UH', label: S('U', 'H') + ' (spenna spennugjafans)', q: 'U', value: 8,
          mistakes: [{ value: 2, msg: 'Þú dróst spennuföllin hvort frá öðru. Í raðtengingu leggjast spennuföllin saman.' }, { value: 5, msg: 'Þetta er aðeins annað spennufallið. U_H er summa beggja.' }] },
        { key: 'R1', label: S('R', 1), q: 'R', value: 30,
          mistakes: [{ value: 0.3, msg: 'Þú margfaldaðir. Viðnámið er R = U / I.' }, { value: 80, msg: 'Þetta er heildarviðnámið. Notaðu spennufallið yfir R₁: R₁ = U₁ / I.' }, { value: 50, msg: 'Þetta er R₂. Notaðu spennufallið yfir R₁, sem er 3 V.' }] },
      ],
      hint: 'Í raðtengingu leggjast spennuföllin saman. Sami straumur fer um bæði viðnámin, svo R₁ = U₁ / I.',
      solution: [
        { title: 'Leggja spennuföllin saman', html: [S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' = 3 V + 5 V = 8 V'] },
        { title: 'Lögmál Ohms fyrir R₁', html: [S('R', 1) + ' = ' + F(S('U', 1), S('I')) + ' = ' + F('3 V', '0,1 A') + ' = 30 Ω'] },
        { title: 'Athugun', html: [S('R', 2) + ' = ' + F('5 V', '0,1 A') + ' = 50 Ω, ' + S('R', 'H') + ' = 80 Ω og ' + F('8 V', '80 Ω') + ' = 0,1 A ✓'] },
      ] }),
    mcEx({ id: 'su-5', topic: 'seriesU', title: 'Hvar fellur mest spenna?',
      prompt: 'Í raðtengingu eru ' + S('R', 1) + ' = 100 Ω og ' + S('R', 2) + ' = 300 Ω. Yfir hvort viðnámið fellur meiri spenna?',
      diagram: { kind: 'series', U: '', R: ['100 Ω', '300 Ω'] },
      options: [
        ['Yfir ' + S('R', 1) + ', því straumurinn fer fyrst í gegnum það.', false, 'Straumurinn er sá sami alls staðar í raðtengingu. Röðin skiptir ekki máli.'],
        ['Jafn mikil spenna fellur yfir bæði.', false, 'Spennan skiptist aðeins jafnt ef viðnámin eru jafnstór. Hér er R₂ þrisvar sinnum stærra.'],
        ['Yfir ' + S('R', 2) + ', því sami straumur fer um bæði og ' + S('U') + ' = ' + S('I') + ' · ' + S('R') + '.', true],
      ],
      hint: 'Hvað er eins fyrir bæði viðnámin í raðtengingu? Notaðu það í U = I · R.',
      solution: [{ title: 'Sami straumur', html: ['Sami straumur ' + S('I') + ' fer um bæði viðnámin. Þá er ' + S('U', 1) + ' = ' + S('I') + ' · 100 Ω og ' + S('U', 2) + ' = ' + S('I') + ' · 300 Ω, svo ' + S('U', 2) + ' er þrisvar sinnum stærra en ' + S('U', 1) + '.'] }] }),
    seriesEx({ id: 'su-x1', examOnly: true, topic: 'seriesU', title: 'Raðtenging, 220 Ω og 380 Ω', U: '12 V', R: ['220 Ω', '380 Ω'], ask: ['I', 'U1', 'U2'],
      task: 'Reiknaðu strauminn og spennufallið yfir hvort viðnám.' }),
    seriesEx({ id: 'su-x2', examOnly: true, topic: 'seriesU', title: 'Spennufall yfir R₃', U: '6 V', R: ['10 Ω', '20 Ω', '30 Ω'], ask: ['I', 'U3'],
      task: 'Reiknaðu heildarstrauminn og spennufallið yfir ' + S('R', 3) + '.' }),

    /* Heildarviðnám í hliðtengingu */
    parallelEx({ id: 'pr-1', topic: 'parallelR', title: 'Tvö hliðtengd viðnám', R: ['100 Ω', '200 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '? Námundaðu að hæfilegri nákvæmni, t.d. einum aukastaf.' }),
    parallelEx({ id: 'pr-2', topic: 'parallelR', title: 'Þrjú jafnstór viðnám', R: ['300 Ω', '300 Ω', '300 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '?' }),
    parallelEx({ id: 'pr-3', topic: 'parallelR', title: '6 Ω og 3 Ω', R: ['6 Ω', '3 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '?' }),
    parallelEx({ id: 'pr-4', topic: 'parallelR', title: 'Tvö 1 kΩ viðnám', R: ['1 kΩ', '1 kΩ'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '? Þú mátt svara í Ω eða kΩ.' }),
    mcEx({ id: 'pr-5', topic: 'parallelR', title: 'Hvað getur R_H verið?',
      prompt: S('R', 1) + ' = 10 Ω og ' + S('R', 2) + ' = 40 Ω eru hliðtengd. Hvert er heildarviðnámið?',
      diagram: { kind: 'parallel', U: '', R: ['10 Ω', '40 Ω'] },
      options: [
        ['50 Ω', false, 'Þetta er summa viðnámanna, sem á við um raðtengingu. Í hliðtengingu er R_H minna en minnsta viðnámið.'],
        ['25 Ω', false, 'Þetta er meðaltal viðnámanna. Í hliðtengingu er R_H minna en minnsta viðnámið.'],
        ['8 Ω', true],
        ['10 Ω', false, 'R_H er alltaf minna en minnsta viðnámið í hliðtengingu — ekki jafnt því.'],
      ],
      hint: 'Heildarviðnámið í hliðtengingu er alltaf minna en minnsta viðnámið. Prófaðu formúluna góðu.',
      solution: [{ title: 'Formúlan góða — fyrir tvö viðnám', html: [S('R', 'H') + ' = ' + F('10 · 40', '10 + 40') + ' = ' + F('400', '50') + ' = 8 Ω', '8 Ω er minna en 10 Ω, eins og á að vera. ✓'] }] }),
    mcEx({ id: 'pr-6', topic: 'parallelR', title: 'Þrjú viðnám í hliðtengingu',
      prompt: 'Þrjú viðnám eru hliðtengd. Hvaða aðferð gefur rétt heildarviðnám?',
      options: [
        ['Að reikna ' + F(S('R', 1) + ' · ' + S('R', 2) + ' · ' + S('R', 3), S('R', 1) + ' + ' + S('R', 2) + ' + ' + S('R', 3)) + '.', false, 'Formúlan góða gildir aðeins fyrir nákvæmlega tvö viðnám. Fyrir þrjú gefur þessi útgáfa rangt svar (og jafnvel ranga einingu, Ω²).'],
        ['Að leggja viðnámin saman.', false, 'Það gildir í raðtengingu. Í hliðtengingu leggjast andhverfurnar 1/R saman.'],
        ['Að reikna ' + F('1', S('R', 'H')) + ' = ' + F('1', S('R', 1)) + ' + ' + F('1', S('R', 2)) + ' + ' + F('1', S('R', 3)) + ' og snúa svo við.', true],
      ],
      hint: 'Hvaða formúla gildir fyrir hvaða fjölda viðnáma sem er?',
      solution: [{ title: 'Andhverfuformúlan', html: ['Almenna formúlan ' + F('1', S('R', 'H')) + ' = ' + F('1', S('R', 1)) + ' + ' + F('1', S('R', 2)) + ' + ' + F('1', S('R', 3)) + ' gildir fyrir hvaða fjölda viðnáma sem er. Í lokin er snúið við: ' + S('R', 'H') + ' = 1 / (summan).',
        'Formúluna góðu má aðeins nota á tvö viðnám í einu. Með henni mætti reikna tvö viðnám fyrst og síðan niðurstöðuna með því þriðja, en ekki öll þrjú í einni formúlu.'] }] }),
    parallelEx({ id: 'pr-x1', examOnly: true, topic: 'parallelR', title: '12 Ω og 4 Ω', R: ['12 Ω', '4 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '?' }),
    parallelEx({ id: 'pr-x2', examOnly: true, topic: 'parallelR', title: 'Þrjú ólík viðnám', R: ['20 Ω', '30 Ω', '60 Ω'], ask: ['RH'],
      task: 'Hvert er heildarviðnámið ' + S('R', 'H') + '?' }),

    /* Greinastraumar og heildarstraumur */
    parallelEx({ id: 'pi-1', topic: 'parallelI', title: 'Hliðtenging, 12 V', U: '12 V', R: ['100 Ω', '200 Ω'], ask: ['I1', 'I2', 'IH'],
      task: 'Reiknaðu strauminn í hvorri grein og heildarstrauminn ' + S('I', 'H') + '.' }),
    parallelEx({ id: 'pi-2', topic: 'parallelI', title: 'Hliðtenging í kΩ', U: '9 V', R: ['1 kΩ', '3 kΩ'], ask: ['I1', 'I2', 'IH'],
      task: 'Reiknaðu strauminn í hvorri grein og heildarstrauminn.' }),
    parallelEx({ id: 'pi-3', topic: 'parallelI', title: 'Þrjár jafnar greinar', U: '6 V', R: ['30 Ω', '30 Ω', '30 Ω'], ask: ['I1', 'I2', 'I3', 'IH'],
      task: 'Reiknaðu strauminn í hverri grein og heildarstrauminn.' }),
    numEx({ id: 'pi-4', topic: 'parallelI', title: 'Óþekkt grein',
      prompt: 'Tvö viðnám eru hliðtengd við 12 V spennugjafa. Heildarstraumurinn er 0,5 A og straumurinn í gegnum ' + S('R', 1) + ' er 0,2 A. Finndu strauminn ' + S('I', 2) + ' og viðnámið ' + S('R', 2) + '.',
      diagram: { kind: 'parallel', U: '12 V', R: ['?', '?'], currents: ['0,2 A', '?'], I: '0,5 A' },
      answers: [
        { key: 'I2', label: S('I', 2) + ' (straumur í gegnum ' + S('R', 2) + ')', q: 'I', value: 0.3,
          mistakes: [{ value: 0.7, msg: 'Þú lagðir strauminn við heildarstrauminn. Greinastraumarnir leggjast saman í I_H, svo I₂ = I_H − I₁.' }, { value: 0.5, msg: 'Þetta er heildarstraumurinn. Dragðu I₁ frá.' }] },
        { key: 'R2', label: S('R', 2), q: 'R', value: 40,
          mistakes: [{ value: 24, msg: 'Þú notaðir heildarstrauminn. Notaðu strauminn í grein 2: R₂ = U / I₂.' }, { value: 3.6, msg: 'Þú margfaldaðir. Viðnámið er R = U / I.' }, { value: 60, msg: 'Þetta er R₁. Notaðu I₂ til að finna R₂.' }] },
      ],
      hint: 'Heildarstraumurinn er summa greinastraumanna. Sama spenna, 12 V, er yfir hvorri grein.',
      solution: [
        { title: 'Greinastraumar leggjast saman', html: [S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' ⇒ ' + S('I', 2) + ' = ' + S('I', 'H') + ' − ' + S('I', 1) + ' = 0,5 A − 0,2 A = 0,3 A'] },
        { title: 'Sama spenna yfir hverja grein', html: [S('R', 2) + ' = ' + F(S('U', 'H'), S('I', 2)) + ' = ' + F('12 V', '0,3 A') + ' = 40 Ω'] },
        { title: 'Athugun', html: [S('R', 1) + ' = ' + F('12 V', '0,2 A') + ' = 60 Ω og ' + F('12 V', '60 Ω') + ' + ' + F('12 V', '40 Ω') + ' = 0,2 A + 0,3 A = 0,5 A ✓'] },
      ] }),
    parallelEx({ id: 'pi-x1', examOnly: true, topic: 'parallelI', title: 'Hliðtenging, 24 V', U: '24 V', R: ['40 Ω', '60 Ω'], ask: ['RH', 'I1', 'I2', 'IH'],
      task: 'Reiknaðu heildarviðnámið, strauminn í hvorri grein og heildarstrauminn.' }),
    parallelEx({ id: 'pi-x2', examOnly: true, topic: 'parallelI', title: 'Þrjár ólíkar greinar', U: '12 V', R: ['24 Ω', '48 Ω', '16 Ω'], ask: ['I1', 'I2', 'I3', 'IH'],
      task: 'Reiknaðu strauminn í hverri grein og heildarstrauminn.' }),

    /* Einingabreytingar */
    unitEx({ id: 'u-1', title: 'mA í A', from: '250 mA', to: 'A', factor: '1 A = 1000 mA, svo deilt er með 1000',
      hint: 'Ein amper eru 1000 milliamper. Verður talan stærri eða minni þegar farið er yfir í stærri einingu?' }),
    unitEx({ id: 'u-2', title: 'A í mA', from: '0,035 A', to: 'mA', factor: '1 A = 1000 mA, svo margfaldað er með 1000',
      hint: 'Milliamper er minni eining, svo talan verður stærri.' }),
    unitEx({ id: 'u-3', title: 'kΩ í Ω', from: '4,7 kΩ', to: 'Ω', factor: '1 kΩ = 1000 Ω, svo margfaldað er með 1000',
      hint: '„Kíló“ þýðir þúsund.' }),
    unitEx({ id: 'u-4', title: 'Ω í kΩ', from: '680 Ω', to: 'kΩ', factor: '1 kΩ = 1000 Ω, svo deilt er með 1000',
      hint: 'Kílóohm er stærri eining, svo talan verður minni.' }),
    mcEx({ id: 'u-5', topic: 'units', title: 'Sama gildi',
      prompt: 'Straumurinn í rás er 0,02 A. Hvaða gildi er það sama?',
      options: [
        ['2 mA', false, 'Færðu kommuna þrjú sæti til hægri: 0,02 A = 20 mA.'],
        ['20 mA', true],
        ['200 mA', false, 'Það væri 0,2 A. Margfaldaðu 0,02 með 1000.'],
        ['0,02 mA', false, 'Talan þarf að breytast þegar einingin breytist: margfaldaðu með 1000.'],
      ],
      hint: '1 A = 1000 mA.',
      solution: [{ title: 'Umbreyting', html: ['0,02 A · 1000 = 20 mA'] }] }),
    numEx({ id: 'u-6', topic: 'units', title: 'Breyta fyrst, reikna svo',
      prompt: 'Spennan yfir viðnám er 5 V og viðnámið er 2,5 kΩ. Reiknaðu strauminn og svaraðu í mA.',
      diagram: { kind: 'series', U: '5 V', R: ['2,5 kΩ'], I: '?' },
      answers: [{ key: 'I', label: S('I') + ' (straumur)', q: 'I', value: 0.002, units: ['mA'],
        mistakes: [{ value: 2, msg: 'Þú deildir með 2,5 í stað 2500 Ω. Breyttu kΩ í Ω áður en þú deilir — eða athugaðu einingu svarsins.' }] }],
      hint: 'Breyttu 2,5 kΩ í Ω, reiknaðu I = U / R í amperum og breyttu svo í mA.',
      solution: [
        { title: 'Breyta í Ω', html: ['2,5 kΩ = 2500 Ω'] },
        { title: 'Lögmál Ohms', html: [S('I') + ' = ' + F('5 V', '2500 Ω') + ' = 0,002 A'] },
        { title: 'Breyta í mA', html: ['0,002 A · 1000 = 2 mA'] },
      ] }),
    unitEx({ id: 'u-x1', examOnly: true, title: 'A í mA', from: '0,006 A', to: 'mA', factor: '1 A = 1000 mA, svo margfaldað er með 1000',
      hint: 'Milliamper er minni eining.' }),
    unitEx({ id: 'u-x2', examOnly: true, title: 'kΩ í Ω', from: '12 kΩ', to: 'Ω', factor: '1 kΩ = 1000 Ω, svo margfaldað er með 1000',
      hint: '„Kíló“ þýðir þúsund.' }),

    /* Hugtök */
    mcEx({ id: 'c-1', topic: 'concepts', title: 'Eins í raðtengingu',
      prompt: 'Hvaða stærð er sú sama fyrir öll viðnám í raðtengingu?',
      options: [
        ['Spennan', false, 'Spennan skiptist á milli viðnámanna í raðtengingu. Það er í hliðtengingu sem spennan er sú sama.'],
        ['Straumurinn', true],
        ['Viðnámið', false, 'Viðnámin geta verið misstór. Spurt er um stærð sem er eins fyrir þau öll.'],
      ],
      hint: 'Í raðtengingu er aðeins ein leið fyrir strauminn.',
      solution: [{ title: 'Ein leið', html: ['Í raðtengingu er aðeins ein leið, svo sami straumur fer um öll viðnámin: ' + S('I', 'H') + ' = ' + S('I', 1) + ' = ' + S('I', 2) + ' = …'] }] }),
    mcEx({ id: 'c-2', topic: 'concepts', title: 'Eins í hliðtengingu',
      prompt: 'Hvaða stærð er sú sama yfir allar greinar í hliðtengingu?',
      options: [
        ['Spennan', true],
        ['Straumurinn', false, 'Straumurinn skiptist á milli greinanna. Hann er aðeins jafn í greinum með jafnstór viðnám.'],
        ['Viðnámið', false, 'Viðnámin geta verið misstór. Spurt er um stærð sem er eins í öllum greinum.'],
      ],
      hint: 'Hver grein er tengd beint á milli sömu tveggja punkta og spennugjafinn.',
      solution: [{ title: 'Sömu tengipunktar', html: ['Hver grein tengist beint yfir spennugjafann, svo sama spenna er yfir þeim öllum: ' + S('U', 'H') + ' = ' + S('U', 1) + ' = ' + S('U', 2) + ' = …'] }] }),
    mcEx({ id: 'c-3', topic: 'concepts', title: 'Leggst saman í hliðtengingu',
      prompt: 'Hvað leggst saman í hliðtengingu?',
      options: [
        ['Viðnámin: ' + S('R', 'H') + ' = ' + S('R', 1) + ' + ' + S('R', 2) + ' + …', false, 'Þetta gildir í raðtengingu. Í hliðtengingu leggjast andhverfurnar 1/R saman.'],
        ['Spennurnar: ' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + …', false, 'Þetta gildir í raðtengingu. Í hliðtengingu er spennan sú sama yfir hverja grein.'],
        ['Greinastraumarnir: ' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + …', true],
      ],
      hint: 'Straumurinn kemur frá spennugjafanum og skiptist á milli greinanna.',
      solution: [{ title: 'Straumurinn skiptist', html: ['Heildarstraumurinn skiptist á greinarnar og sameinast aftur, svo ' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + … (og andhverfur viðnámanna leggjast saman: ' + F('1', S('R', 'H')) + ' = ' + F('1', S('R', 1)) + ' + ' + F('1', S('R', 2)) + ' + …).'] }] }),
    mcEx({ id: 'c-4', topic: 'concepts', title: 'Leggst saman í raðtengingu',
      prompt: 'Hvað leggst saman í raðtengingu?',
      options: [
        ['Straumarnir', false, 'Í raðtengingu er straumurinn sá sami alls staðar. Straumar leggjast saman í hliðtengingu.'],
        ['Viðnámin og spennuföllin', true],
        ['Andhverfur viðnámanna (1/R)', false, 'Þetta gildir í hliðtengingu.'],
      ],
      hint: 'Hugsaðu um eina langa leið þar sem straumurinn fer í gegnum öll viðnámin.',
      solution: [{ title: 'Raðtenging', html: [S('R', 'H') + ' = ' + S('R', 1) + ' + ' + S('R', 2) + ' + … og ' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + …'] }] }),
    mcEx({ id: 'c-5', topic: 'concepts', title: 'Nýtt viðnám í hliðtengingu',
      prompt: 'Þú bætir þriðja viðnáminu við hliðtengingu tveggja viðnáma. Hvað gerist við heildarviðnámið?',
      options: [
        ['Það eykst.', false, 'Í hliðtengingu bætist við ný leið fyrir strauminn, svo heildarviðnámið minnkar.'],
        ['Það minnkar.', true],
        ['Það helst óbreytt.', false, 'Nýja greinin bætir við leið fyrir strauminn og breytir því heildarviðnáminu.'],
      ],
      hint: 'Ný grein er ný leið fyrir strauminn.',
      solution: [{ title: 'Fleiri leiðir', html: ['Ný grein bætir nýjum lið við ' + F('1', S('R', 'H')) + '. Summan stækkar og þá minnkar ' + S('R', 'H') + '.'] }] }),
    mcEx({ id: 'c-x1', examOnly: true, topic: 'concepts', title: 'Nýtt viðnám í raðtengingu',
      prompt: 'Þú bætir viðnámi við raðtengingu en spenna spennugjafans er óbreytt. Hvað gerist við heildarstrauminn?',
      options: [
        ['Hann eykst.', false, 'Heildarviðnámið eykst og þá minnkar straumurinn: I_H = U_H / R_H.'],
        ['Hann minnkar.', true],
        ['Hann helst óbreyttur.', false, 'R_H breytist þegar viðnámi er bætt við, svo straumurinn breytist líka.'],
      ],
      hint: 'Hvað gerist við R_H? Notaðu svo I_H = U_H / R_H.',
      solution: [{ title: 'Meira viðnám, minni straumur', html: [S('R', 'H') + ' eykst og ' + S('I', 'H') + ' = ' + F(S('U', 'H'), S('R', 'H')) + ' minnkar.'] }] }),
    mcEx({ id: 'c-x2', examOnly: true, topic: 'concepts', title: 'Summa greinastrauma',
      prompt: 'Í hliðtengingu er ' + S('I', 1) + ' = 2 A og ' + S('I', 2) + ' = 3 A. Hver er heildarstraumurinn?',
      options: [
        ['1,2 A', false, 'Þetta er formúlan góða notuð á strauma. Greinastraumar leggjast einfaldlega saman.'],
        ['3 A', false, 'Heildarstraumurinn er summa greinastraumanna, ekki stærsti straumurinn.'],
        ['5 A', true],
      ],
      hint: 'Hvað leggst saman í hliðtengingu?',
      solution: [{ title: 'Summa', html: [S('I', 'H') + ' = 2 A + 3 A = 5 A'] }] }),
  ];

  /* ======================================================================
   * [Prófefni] — dæmi byggð á æfingadæmum áfangans (2.1.1 Raðtengingar,
   * 2.2.1 Hliðtengingar, 2.3 Blönduð tenging og sýnidæmum í glósum 2.1).
   * ====================================================================== */

  /** Byggir blandaða rás úr textagildum: Rn(1, '20 Ω'), Sr(...), Pr(...). */
  function Rn(name, text) { return { name: name, R: Calc.quantity(text).value, text: text }; }
  function Sr() { return { s: Array.prototype.slice.call(arguments) }; }
  function Pr() { return { p: Array.prototype.slice.call(arguments) }; }
  function subList(nm) { return listAnd(nm.split(',').map(function (n) { return S('R', n); })); }

  function mixedEx(o) {
    const U = Calc.quantity(o.U).value;
    const ex = Explain.network(U, o.tree);
    const r = ex.result;
    const labels = {};
    Calc.leaves(o.tree).forEach(function (l) { labels[l.name] = l.text; });
    const allS = Calc.seriesResistance(Calc.leaves(o.tree).map(function (l) { return l.R; }));
    const allP = Calc.parallelResistance(Calc.leaves(o.tree).map(function (l) { return l.R; }));
    const answers = o.ask.map(function (key) {
      if (key === 'RH') {
        return { key: key, label: S('R', 'H') + ' (heildarviðnám)', q: 'R', value: r.RH, units: UNITS_OF.R,
          mistakes: nonDuplicate([
            { value: allS, msg: 'Þú lagðir öll viðnámin saman eins og allt væri raðtengt. Finndu fyrst hvaða mótstöður eru hliðtengdar.' },
            { value: allP, msg: 'Þú reiknaðir eins og allt væri hliðtengt. Finndu fyrst hvaða mótstöður eru raðtengdar.' },
          ], r.RH) };
      }
      if (key === 'IH') return { key: key, label: S('I', 'H') + ' (heildarstraumur)', q: 'I', value: r.IH, units: UNITS_OF.I, mistakes: nonDuplicate([{ value: U / allS, msg: 'Þú notaðir summu allra viðnáma. Notaðu rétt heildarviðnám R_H.' }], r.IH) };
      const kind = key.charAt(0), nm = key.slice(2);
      const node = r.nodes[nm];
      if (!node) throw new Error('Óþekktur hluti ' + key + ' í ' + o.id);
      const multi = nm.indexOf(',') >= 0;
      if (kind === 'U') {
        return { key: key, label: S('U', nm) + (multi ? ' (spenna yfir ' + subList(nm) + ')' : ' (spennufall yfir ' + S('R', nm) + ')'), q: 'U', value: node.U, units: UNITS_OF.U,
          mistakes: nonDuplicate([{ value: U, msg: 'Þetta er spenna spennugjafans. Yfir þennan hluta fellur aðeins hluti hennar.' }], node.U) };
      }
      return { key: key, label: S('I', nm) + (multi ? ' (straumur í gegnum ' + subList(nm) + ')' : ' (straumur í gegnum ' + S('R', nm) + ')'), q: 'I', value: node.I, units: UNITS_OF.I,
        mistakes: nonDuplicate([{ value: r.IH, msg: 'Þetta er heildarstraumurinn. Í hliðtengdum hluta skiptist straumurinn á greinarnar.' }], node.I) };
    });
    return {
      id: o.id, topic: 'mixed', type: 'numeric', title: o.title, examOnly: !!o.examOnly, profefni: o.profefni,
      prompt: o.prompt + ' ' + (o.task || ''),
      diagram: { kind: 'network', U: o.U, tree: o.tree, labels: labels, I: o.ask.indexOf('IH') >= 0 ? '?' : null },
      answers: answers,
      hint: o.hint || 'Greindu fyrst hvaða mótstöður eru raðtengdar og hverjar hliðtengdar. Reiknaðu innstu hópana fyrst, síðan heildarviðnámið, svo I_H = U_H / R_H. Í raðtengdum hluta er sami straumur (U = I · R), í hliðtengdum hluta sama spenna (I = U / R).',
      solution: ex.steps,
    };
  }
  /** Bætir uppruna [Prófefni] við æfingu sem byggð er með öðrum byggjurum. */
  function pf(source, ex) { ex.profefni = source; return ex; }
  const N = function (key, label, value, mistakes) { return { key: key, label: label, q: 'N', value: value, units: ['stk.'], mistakes: mistakes || [] }; };

  const PROF = [
    /* ---- 2.1.1 Raðtengingar ---- */
    pf('Raðtengingar 2.1.1 · dæmi 1', seriesEx({ id: 'pf-r1', topic: 'seriesU', title: 'Þrjár mótstöður við 24 V', U: '24 V', R: ['10 Ω', '15 Ω', '23 Ω'], ask: ['RH', 'I', 'U1', 'U2', 'U3'],
      prompt: 'Þrjár raðtengdar mótstöður, 10 Ω, 15 Ω og 23 Ω, eru tengdar við 24 V spennugjafa.',
      task: 'Reiknaðu heildarviðnámið, strauminn frá spennugjafanum og spennufall hverrar mótstöðu. Athugaðu svo hvort niðurstaðan kemur heim við 2. lögmál Kirchhoffs (summa spennufallanna = 24 V).' })),
    pf('Raðtengingar 2.1.1 · dæmi 2', numEx({ id: 'pf-r2', topic: 'seriesR', title: 'Óþekkt fjórða mótstaða',
      prompt: 'Fjórar raðtengdar mótstöður hafa heildarviðnámið 1260 Ω. Straumurinn í rásinni er 180 mA. ' + S('R', 1) + ' = 120 Ω, ' + S('R', 2) + ' = 560 Ω og ' + S('R', 3) + ' = 220 Ω, en ' + S('R', 4) + ' er óþekkt. Reiknaðu ' + S('R', 4) + ' og spennu spennugjafans.',
      diagram: { kind: 'series', U: '?', R: ['120 Ω', '560 Ω', '220 Ω', '?'], I: '180 mA' },
      answers: [
        { key: 'R4', label: S('R', 4), q: 'R', value: 360, mistakes: [{ value: 900, msg: 'Þetta er summa þekktu mótstaðanna. Dragðu hana frá heildarviðnáminu: R₄ = R_H − (R₁ + R₂ + R₃).' }, { value: 2160, msg: 'Þú lagðir saman í stað þess að draga frá. R₄ = R_H − (R₁ + R₂ + R₃).' }] },
        { key: 'U', label: S('U', 'H') + ' (spenna spennugjafans)', q: 'U', value: 226.8, mistakes: [{ value: 226800, msg: 'Breyttu 180 mA í 0,18 A áður en þú margfaldar.' }] },
      ],
      hint: 'Í raðtengingu er R_H = R₁ + R₂ + R₃ + R₄, svo óþekkta mótstaðan er R_H mínus hinar. Spennan er U = I · R_H (breyttu mA í A).',
      solution: [
        { title: 'Óþekkta mótstaðan', html: [S('R', 4) + ' = ' + S('R', 'H') + ' − (' + S('R', 1) + ' + ' + S('R', 2) + ' + ' + S('R', 3) + ') = 1260 Ω − (120 + 560 + 220) Ω = 1260 Ω − 900 Ω = 360 Ω'] },
        { title: 'Spenna spennugjafans', html: ['180 mA = 0,18 A', S('U', 'H') + ' = ' + S('I') + ' · ' + S('R', 'H') + ' = 0,18 A · 1260 Ω = 226,8 V'] },
      ] })),
    pf('Raðtengingar 2.1.1 · dæmi 3', numEx({ id: 'pf-r3', topic: 'seriesU', title: 'Út frá mælalestri',
      prompt: 'Tvær mótstöður, ' + S('R', 1) + ' og ' + S('R', 2) + ', eru raðtengdar við 10 V spennugjafa. Straummælir sýnir 20 mA og spennumælir tengdur yfir ' + S('R', 2) + ' sýnir 5,6 V. Reiknaðu spennufallið yfir ' + S('R', 1) + ', viðnám beggja mótstaðanna og heildarviðnámið.',
      diagram: { kind: 'series', U: '10 V', R: ['?', '?'], drops: ['?', '5,6 V'], I: '20 mA' },
      answers: [
        { key: 'U1', label: S('U', 1) + ' (spennufall yfir ' + S('R', 1) + ')', q: 'U', value: 4.4, mistakes: [{ value: 15.6, msg: 'Spennuföllin leggjast saman í 10 V: U₁ = U − U₂.' }] },
        { key: 'R1', label: S('R', 1), q: 'R', value: 220, mistakes: [{ value: 0.22, msg: 'Breyttu 20 mA í 0,02 A áður en þú deilir.' }] },
        { key: 'R2', label: S('R', 2), q: 'R', value: 280, mistakes: [{ value: 0.28, msg: 'Breyttu 20 mA í 0,02 A áður en þú deilir.' }] },
        { key: 'RH', label: S('R', 'H'), q: 'R', value: 500 },
      ],
      hint: '2. lögmál Kirchhoffs: U = U₁ + U₂. Sami straumur, 20 mA = 0,02 A, fer um báðar mótstöður: R = U / I.',
      solution: [
        { title: '2. lögmál Kirchhoffs', html: [S('U', 1) + ' = ' + S('U') + ' − ' + S('U', 2) + ' = 10 V − 5,6 V = 4,4 V'] },
        { title: 'Lögmál Ohms fyrir hvora mótstöðu', html: ['20 mA = 0,02 A', S('R', 1) + ' = ' + F('4,4 V', '0,02 A') + ' = 220 Ω', S('R', 2) + ' = ' + F('5,6 V', '0,02 A') + ' = 280 Ω'] },
        { title: 'Heildarviðnám', html: [S('R', 'H') + ' = 220 Ω + 280 Ω = 500 Ω (athugun: ' + F('10 V', '500 Ω') + ' = 0,02 A ✓)'] },
      ] })),
    pf('Raðtengingar 2.1.1 · dæmi 4', numEx({ id: 'pf-r4', topic: 'seriesU', title: 'Fjórar mótstöður og 0,03 A',
      prompt: 'Fjórar mótstöður, 220 Ω, 120 Ω, 300 Ω og 260 Ω, eru raðtengdar. Spennugjafinn keyrir 0,03 A jafnstraum í rásinni. Reiknaðu heildarviðnámið, spennu spennugjafans og spennuna yfir 300 Ω mótstöðuna.',
      diagram: { kind: 'series', U: '?', R: ['220 Ω', '120 Ω', '300 Ω', '260 Ω'], drops: [null, null, '?', null], I: '0,03 A' },
      answers: [
        { key: 'RH', label: S('R', 'H'), q: 'R', value: 900 },
        { key: 'U', label: S('U', 'H') + ' (spenna spennugjafans)', q: 'U', value: 27, mistakes: [{ value: 30000, msg: 'Þú deildir í stað þess að margfalda. U = I · R_H.' }] },
        { key: 'U3', label: 'Spenna yfir 300 Ω', q: 'U', value: 9, mistakes: [{ value: 27, msg: 'Þetta er heildarspennan. Notaðu aðeins 300 Ω: U = I · R.' }] },
      ],
      hint: 'R_H er summa mótstaðanna. Sami straumur fer um þær allar, svo U = I · R gildir bæði um alla rásina og hverja mótstöðu.',
      solution: [
        { title: 'Heildarviðnám', html: [S('R', 'H') + ' = 220 + 120 + 300 + 260 = 900 Ω'] },
        { title: 'Spenna spennugjafans', html: [S('U', 'H') + ' = ' + S('I') + ' · ' + S('R', 'H') + ' = 0,03 A · 900 Ω = 27 V'] },
        { title: 'Spenna yfir 300 Ω', html: [S('U', 3) + ' = 0,03 A · 300 Ω = 9 V'] },
      ] })),
    pf('Raðtengingar 2.1.1 · dæmi 5', numEx({ id: 'pf-r5', topic: 'seriesU', title: 'Fellimótstaða fyrir ljóskastara',
      prompt: 'Ljóskastari (' + S('R', 2) + ') sem er gerður fyrir 110 V dregur 10 A. Það á að tengja hann við 230 V netspennu. Til þess að hann eyðileggist ekki er raðtengd við hann fellimótstaða (' + S('R', 1) + ') sem fellir spennuna mátulega mikið. Hve mörg volt þarf að fella (' + S('U', 1) + ') og hve stór þarf fellimótstaðan að vera?',
      diagram: { kind: 'series', U: '230 V', R: ['?', 'ljóskastari'], drops: ['?', '110 V'], I: '10 A' },
      answers: [
        { key: 'U1', label: S('U', 1) + ' (spenna sem þarf að fella)', q: 'U', value: 120, mistakes: [{ value: 340, msg: 'Spennuföllin leggjast saman í 230 V: U₁ = 230 V − 110 V.' }, { value: 110, msg: 'Þetta er spennan yfir ljóskastarann. Fellimótstaðan tekur afganginn: 230 V − 110 V.' }] },
        { key: 'R1', label: S('R', 1) + ' (fellimótstaða)', q: 'R', value: 12, mistakes: [{ value: 23, msg: 'Þú notaðir 230 V. Fellimótstaðan fær aðeins U₁ = 120 V: R₁ = U₁ / I.' }, { value: 11, msg: 'Þetta er viðnám ljóskastarans (110 V / 10 A). Notaðu U₁ = 120 V.' }] },
      ],
      hint: 'Spennuföllin leggjast saman: U = U₁ + U₂. Sami straumur, 10 A, fer um bæði fellimótstöðuna og ljóskastarann.',
      solution: [
        { title: 'Spenna sem þarf að fella', html: [S('U', 1) + ' = ' + S('U') + ' − ' + S('U', 2) + ' = 230 V − 110 V = 120 V'] },
        { title: 'Stærð fellimótstöðunnar', html: [S('R', 1) + ' = ' + F(S('U', 1), S('I')) + ' = ' + F('120 V', '10 A') + ' = 12 Ω'] },
      ] })),
    pf('Raðtengingar 2.1.1 · dæmi 6', numEx({ id: 'pf-r6', topic: 'seriesU', title: 'LED-díóður í röð',
      prompt: 'Hve margar 1,8 V LED-díóður, sem hver dregur 25 mA, mætti raðtengja við spennugjafa sem gefur 9 V? Hver er þá heildarstraumur rásarinnar?',
      answers: [
        N('n', S('n') + ' (fjöldi díóða)', 5, [{ value: 16.2, msg: 'Þú margfaldaðir. Deildu spennu spennugjafans með spennunni yfir hverja díóðu: n = U / U_LED.' }]),
        { key: 'I', label: S('I') + ' (heildarstraumur)', q: 'I', value: 0.025, mistakes: [{ value: 0.125, msg: 'Í raðtengingu leggjast straumar ekki saman — sami straumur, 25 mA, fer um allar díóðurnar.' }] },
      ],
      hint: 'Spennuföllin yfir díóðurnar leggjast saman í 9 V. Og í raðtengingu fer sami straumurinn í gegnum þær allar.',
      solution: [
        { title: 'Fjöldi díóða', html: [S('n') + ' = ' + F(S('U'), S('U', 'LED')) + ' = ' + F('9 V', '1,8 V') + ' = 5 stk.'] },
        { title: 'Straumur', html: ['Í raðtengdri rás rennur einn og sami straumurinn í gegn: ' + S('I') + ' = 25 mA.'] },
      ] })),
    pf('Raðtengingar 2.1.1 · dæmi 7 a–b', numEx({ id: 'pf-r7', topic: 'seriesU', title: 'Pera og fellimótstaða',
      prompt: 'Spennugjafinn gefur 24 V yfir raðtengda mótstöðu (' + S('R', 1) + ') og peru (' + S('R', 2) + '). Viðnám perunnar er 450 Ω og hún er gerð fyrir 9 V. Mátulegur straumur, og jafnframt hámarksstraumur, er 20 mA. Lágmarksstraumur til að peran lýsi er 13 mA. Hvað þarf spennufallið yfir ' + S('R', 1) + ' að vera og hve stórt þarf ' + S('R', 1) + ' að vera til þess að spennan yfir peruna verði 9 V?',
      diagram: { kind: 'series', U: '24 V', R: ['?', '450 Ω'], drops: ['?', '9 V'], I: '20 mA' },
      answers: [
        { key: 'U1', label: S('U', 'R1') + ' (spennufall yfir ' + S('R', 1) + ')', q: 'U', value: 15, mistakes: [{ value: 33, msg: 'Dragðu spennuna yfir peruna frá: 24 V − 9 V.' }] },
        { key: 'R1', label: S('R', 1), q: 'R', value: 750, mistakes: [{ value: 1200, msg: 'Þú notaðir 24 V. Mótstaðan fær aðeins 15 V: R₁ = 15 V / 0,02 A.' }, { value: 0.75, msg: 'Breyttu 20 mA í 0,02 A áður en þú deilir.' }] },
      ],
      hint: 'U = U_R1 + U_R2, svo U_R1 = 24 V − 9 V. Straumurinn á að vera 20 mA = 0,02 A í gegnum báðar.',
      solution: [
        { title: 'Spennufall yfir R₁', html: [S('U', 'R1') + ' = ' + S('U') + ' − ' + S('U', 'R2') + ' = 24 V − 9 V = 15 V'] },
        { title: 'Viðnám R₁', html: [S('R', 1) + ' = ' + F(S('U', 'R1'), S('I')) + ' = ' + F('15 V', '0,02 A') + ' = 750 Ω'] },
      ] })),
    pf('Raðtengingar 2.1.1 · dæmi 7 c', mcEx({ id: 'pf-r7c', topic: 'seriesU', title: 'Ef R₁ væri 500 Ω',
      prompt: 'Í sömu rás (24 V, pera 450 Ω, hámarksstraumur 20 mA, lágmarksstraumur 13 mA) er ' + S('R', 1) + ' = 500 Ω í stað 750 Ω. Hvað gerist?',
      diagram: { kind: 'series', U: '24 V', R: ['500 Ω', '450 Ω'], I: '?' },
      options: [
        [S('I', 'H') + ' ≈ 13 mA, svo peran lýsir rétt svo.', false, 'Reiknaðu: R_H = 500 + 450 = 950 Ω og I = 24 V / 950 Ω.'],
        [S('I', 'H') + ' ≈ 25 mA, sem er yfir 20 mA hámarkinu, svo glóðarþráðurinn brennur í sundur.', true],
        [S('I', 'H') + ' ≈ 48 mA, en peran þolir það.', false, 'Þú notaðir aðeins 500 Ω. Í raðtengingu er R_H = 500 Ω + 450 Ω = 950 Ω.'],
        ['Straumurinn verður áfram 20 mA því peran ræður straumnum.', false, 'Straumurinn ræðst af heildarviðnáminu: I = U / R_H. Minna R₁ gefur meiri straum.'],
      ],
      hint: 'Reiknaðu nýja heildarviðnámið og svo I_H = U / R_H. Berðu saman við 20 mA.',
      solution: [{ title: 'Útreikningur', html: [S('R', 'H') + ' = 500 Ω + 450 Ω = 950 Ω', S('I', 'H') + ' = ' + F('24 V', '950 Ω') + ' ≈ 0,0253 A = 25,3 mA', '25,3 mA > 20 mA, svo glóðarþráður perunnar brennur í sundur vegna of mikils straums.'] }] })),
    pf('Raðtengingar 2.1.1 · dæmi 7 d', numEx({ id: 'pf-r7d', topic: 'seriesU', title: 'Ef straumurinn væri 12 mA',
      prompt: 'Í sömu rás (24 V, pera ' + S('R', 2) + ' = 450 Ω, lágmarksstraumur 13 mA) er straumurinn í gegnum peruna 12 mA. Hver er þá spennan yfir peruna og yfir ' + S('R', 1) + '? Lýsir peran?',
      diagram: { kind: 'series', U: '24 V', R: ['?', '450 Ω'], drops: ['?', '?'], I: '12 mA' },
      answers: [
        { key: 'U2', label: S('U', 'R2') + ' (spenna yfir peruna)', q: 'U', value: 5.4, mistakes: [{ value: 5400, msg: 'Breyttu 12 mA í 0,012 A áður en þú margfaldar.' }] },
        { key: 'U1', label: S('U', 'R1') + ' (spenna yfir ' + S('R', 1) + ')', q: 'U', value: 18.6, mistakes: [{ value: 29.4, msg: 'Spennuföllin leggjast saman í 24 V: U_R1 = 24 V − U_R2.' }] },
      ],
      hint: 'U_R2 = I · R₂ með I = 0,012 A. Svo 2. lögmál Kirchhoffs fyrir U_R1. Berðu strauminn saman við 13 mA.',
      solution: [
        { title: 'Spenna yfir peruna', html: [S('U', 'R2') + ' = ' + S('I') + ' · ' + S('R', 2) + ' = 0,012 A · 450 Ω = 5,4 V'] },
        { title: 'Spenna yfir R₁', html: [S('U', 'R1') + ' = 24 V − 5,4 V = 18,6 V'] },
        { title: 'Lýsir peran?', html: ['Nei. 12 mA er undir 13 mA lágmarksstraumnum, svo peran hættir að lýsa.'] },
      ] })),
    pf('Glósur 2.1 · dæmi 2', seriesEx({ id: 'pf-r8', topic: 'seriesU', title: 'Þrjár jafnstórar mótstöður', U: '90 V', R: ['30 Ω', '30 Ω', '30 Ω'], ask: ['RH', 'I', 'U1'],
      prompt: 'Þrjár raðtengdar 30 Ω mótstöður eru tengdar við 90 V.',
      task: 'Reiknaðu heildarviðnámið, strauminn og spennufallið yfir hverja mótstöðu.',
      hint: 'Þegar n mótstöður eru jafnstórar er R_H = n · R og spennufallið yfir hverja U = U_H / n.' })),
    pf('Glósur 2.1 · dæmi 3', seriesEx({ id: 'pf-r9', topic: 'seriesU', title: '1 kΩ og 20 Ω í röð', U: '51 V', R: ['1 kΩ', '20 Ω'], ask: ['RH', 'I', 'U1', 'U2'],
      prompt: 'Tvær raðtengdar mótstöður, ' + S('R', 1) + ' = 1 kΩ og ' + S('R', 2) + ' = 20 Ω, eru tengdar við 51 V.',
      task: 'Reiknaðu heildarviðnámið, strauminn og spennufallið yfir hvora mótstöðu. Taktu eftir hvar meiri spenna fellur.' })),
    pf('Glósur 2.1 · dæmi 4', numEx({ id: 'pf-r10', topic: 'seriesR', title: 'Fjórar mótstöður, R₃ óþekkt',
      prompt: 'Fjórar mótstöður eru raðtengdar. ' + S('R', 'H') + ' = 1,95 kΩ, ' + S('R', 1) + ' = 390 Ω, ' + S('R', 2) + ' = 270 Ω og ' + S('R', 4) + ' = 820 Ω. Straumurinn er 20 mA. Finndu heildarspennuna, ' + S('R', 3) + ' og strauminn í gegnum ' + S('R', 3) + '.',
      diagram: { kind: 'series', U: '?', R: ['390 Ω', '270 Ω', '?', '820 Ω'], I: '20 mA' },
      answers: [
        { key: 'U', label: S('U', 'H'), q: 'U', value: 39, mistakes: [{ value: 39000, msg: 'Breyttu 20 mA í 0,02 A og 1,95 kΩ í 1950 Ω.' }] },
        { key: 'R3', label: S('R', 3), q: 'R', value: 470, mistakes: [{ value: 1480, msg: 'Þetta er summa þekktu mótstaðanna. Dragðu hana frá R_H.' }] },
        { key: 'I3', label: S('I', 'R3') + ' (straumur í gegnum ' + S('R', 3) + ')', q: 'I', value: 0.02 },
      ],
      hint: 'U = I · R_H. Óþekkta mótstaðan er R_H mínus hinar. Og í raðtengingu fer sami straumur um allar.',
      solution: [
        { title: 'Heildarspenna', html: [S('U', 'H') + ' = 0,02 A · 1950 Ω = 39 V'] },
        { title: 'Óþekkta mótstaðan', html: [S('R', 3) + ' = 1950 − (390 + 270 + 820) = 1950 − 1480 = 470 Ω'] },
        { title: 'Straumur', html: [S('I', 'R3') + ' = ' + S('I', 'H') + ' = 20 mA'] },
      ] })),
    pf('Raðtengingar 2.1.1 · dæmi 1 b', mcEx({ id: 'pf-r11', topic: 'concepts', title: 'Tenging mæla',
      prompt: 'Í æfingunum á oft að sýna á tengimyndinni mæla til að mæla straum og spennu. Hvernig eru mælarnir tengdir?',
      options: [
        ['Straummælir (A) er hliðtengdur yfir mótstöðu og spennumælir (V) er raðtengdur í rásina.', false, 'Öfugt. Straumurinn þarf að fara í gegnum straummælinn, og spennumælir mælir mismun milli tveggja punkta.'],
        ['Straummælir (A) er raðtengdur í rásina og spennumælir (V) er hliðtengdur yfir mótstöðuna.', true],
        ['Báðir mælar eru raðtengdir í rásina.', false, 'Spennumælir mælir spennu yfir íhlut og er því tengdur hlið við hlið við hann.'],
      ],
      hint: 'Straumurinn sem á að mæla þarf að fara í gegnum straummælinn. Spennan er mismunur milli tveggja punkta.',
      solution: [{ title: 'Mælar', html: ['Straummælir (A) er settur í röð við það sem hann mælir, svo sami straumur fer í gegnum hann.', 'Spennumælir (V) er tengdur yfir íhlutinn (hliðtengdur), svo hann fær sömu spennu og íhluturinn.'] }] })),
    pf('Glósur 2.1 og 2.3 · lögmál Kirchhoffs', mcEx({ id: 'pf-k1', topic: 'concepts', title: 'Lögmál Kirchhoffs',
      prompt: 'Hvað segir <strong>2. lögmál Kirchhoffs</strong>?',
      options: [
        ['Summa strauma sem streyma að greinipunkti er jöfn summu strauma sem streyma frá honum.', false, 'Þetta er 1. lögmál Kirchhoffs (um strauma), sem á við hliðtengingar.'],
        ['Summa spennufalla í lokaðri straumrás er jöfn spennugjafaspennunni.', true],
        ['Spennan er jöfn straumi sinnum viðnámi.', false, 'Þetta er lögmál Ohms, U = I · R.'],
      ],
      hint: '1. lögmálið fjallar um strauma, 2. lögmálið um spennu.',
      solution: [{ title: 'Lögmál Kirchhoffs', html: ['<strong>1. lögmál (straumur, hliðtenging):</strong> Summa strauma að greinipunkti = summa strauma frá honum. Þess vegna ' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + …',
        '<strong>2. lögmál (spenna, raðtenging):</strong> Summa spennufalla í lokaðri straumrás = spennugjafaspennan. Þess vegna ' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + …'] }] })),

    /* ---- 2.2.1 Hliðtengingar ---- */
    pf('Hliðtengingar 2.2.1 · dæmi 1', mcEx({ id: 'pf-h1', topic: 'concepts', title: 'Hvers vegna hliðtengt við net?',
      prompt: 'Hvers vegna eru tæki eða álög venjulega hliðtengd við net, en ekki raðtengd?',
      options: [
        ['Þá skiptist netspennan jafnt á milli tækjanna.', false, 'Það gerist í raðtengingu, og þá fengi ekkert tæki fulla spennu.'],
        ['Hvert tæki fær fulla netspennu og virkar óháð hinum; ef slökkt er á einu eða það bilar halda hin áfram.', true],
        ['Þá fer sami straumur í gegnum öll tækin.', false, 'Sami straumur fer um öll tæki í raðtengingu. Í hliðtengingu tekur hvert tæki sinn straum.'],
        ['Þá verður heildarviðnámið stærra og straumurinn minni.', false, 'Öfugt: hvert nýtt tæki í hliðtengingu minnkar heildarviðnámið og eykur heildarstrauminn.'],
      ],
      hint: 'Hugsaðu um ljósaperur heima: hvað gerist við hinar ef ein springur?',
      solution: [{ title: 'Hliðtenging við net', html: ['Í hliðtengingu er sama spenna yfir hverri grein, svo hvert tæki fær fulla netspennu (t.d. 230 V) sem það er gert fyrir.', 'Hver grein er sjálfstæð: ef ein rofnar halda hinar áfram. Í raðtengingu myndi straumurinn rofna í allri rásinni og spennan skiptast á milli tækjanna.'] }] })),
    pf('Hliðtengingar 2.2.1 · dæmi 2', parallelEx({ id: 'pf-h2', topic: 'parallelI', title: '20 Ω og 60 Ω við 18 V', U: '18 V', R: ['20 Ω', '60 Ω'], ask: ['RH', 'IH', 'I1', 'I2'],
      prompt: 'Tvær mótstöður, 20 Ω og 60 Ω, eru hliðtengdar við 18 V spennugjafa.', task: 'Reiknaðu heildarviðnámið, heildarstrauminn og greinastraumana.' })),
    pf('Hliðtengingar 2.2.1 · dæmi 3', parallelEx({ id: 'pf-h3', topic: 'parallelI', title: '10, 20 og 40 Ω við 10 V', U: '10 V', R: ['10 Ω', '20 Ω', '40 Ω'], ask: ['RH', 'IH', 'I1', 'I2', 'I3'],
      prompt: 'Þrjár mótstöður, 10 Ω, 20 Ω og 40 Ω, eru hliðtengdar við 10 V spennugjafa.', task: 'Reiknaðu heildarviðnámið, heildarstrauminn og greinastraumana.' })),
    pf('Hliðtengingar 2.2.1 · dæmi 3 (5)', numEx({ id: 'pf-h3b', topic: 'parallelI', title: 'Rásin rofnar við 40 Ω',
      prompt: 'Í sömu rás (10 V; 10 Ω, 20 Ω og 40 Ω hliðtengdar) rofnar rásin við 40 Ω mótstöðuna. Reiknaðu greinastraumana og heildarstrauminn eftir breytinguna.',
      diagram: { kind: 'parallel', U: '10 V', R: ['10 Ω', '20 Ω'], currents: ['?', '?'], I: '?' },
      answers: [
        { key: 'I1', label: S('I', 1) + ' (10 Ω)', q: 'I', value: 1 },
        { key: 'I2', label: S('I', 2) + ' (20 Ω)', q: 'I', value: 0.5 },
        { key: 'IH', label: S('I', 'H') + ' eftir breytinguna', q: 'I', value: 1.5, mistakes: [{ value: 1.75, msg: 'Þetta var heildarstraumurinn fyrir breytinguna. Nú fer enginn straumur um 40 Ω greinina.' }] },
      ],
      hint: 'Spennan yfir hinar greinarnar breytist ekki — hún er enn 10 V. Hvað gerist þá við straum þeirra?',
      solution: [
        { title: 'Hinar greinarnar breytast ekki', html: ['Sama spenna, 10 V, er áfram yfir hinum greinunum: ' + S('I', 1) + ' = ' + F('10 V', '10 Ω') + ' = 1 A og ' + S('I', 2) + ' = ' + F('10 V', '20 Ω') + ' = 0,5 A'] },
        { title: 'Heildarstraumur minnkar', html: [S('I', 'H') + ' = 1 A + 0,5 A = 1,5 A (var 1,75 A). Straumurinn 0,25 A í 40 Ω greininni hverfur.'] },
      ] })),
    pf('Hliðtengingar 2.2.1 · dæmi 4', numEx({ id: 'pf-h4', topic: 'parallelR', title: 'Hve mörg álög má hliðtengja?',
      prompt: 'Hve margar 800 Ω mótstöður (álög) er hægt að hliðtengja ef heildarviðnámið má ekki fara niður fyrir 40 Ω?',
      answers: [N('n', S('n') + ' (fjöldi)', 20, [{ value: 32000, msg: 'Þú margfaldaðir. Fyrir n jafnstórar mótstöður er R_H = R / n, svo n = R / R_H.' }])],
      hint: 'n jafnstórar mótstöður í hliðtengingu gefa R_H = R / n.',
      solution: [{ title: 'Jafnstórar mótstöður', html: [S('R', 'H') + ' = ' + F(S('R'), S('n')) + ' ⇒ ' + S('n') + ' = ' + F(S('R'), S('R', 'H')) + ' = ' + F('800 Ω', '40 Ω') + ' = 20 stk.', 'Með 21 mótstöðu færi heildarviðnámið niður fyrir 40 Ω (800/21 ≈ 38 Ω).'] }] })),
    pf('Hliðtengingar 2.2.1 · dæmi 5', numEx({ id: 'pf-h5', topic: 'parallelR', title: 'Bæta við mótstöðu svo R_H = 10 Ω',
      prompt: 'Tvær mótstöður, 20 Ω og 40 Ω, eru hliðtengdar við 10 V spennugjafa. Reiknaðu heildarviðnámið. Hve stóra mótstöðu (' + S('R', 3) + ') þarf að hliðtengja við þær til að heildarviðnámið verði 10 Ω? Finndu svo heildarstrauminn og strauminn í gegnum ' + S('R', 3) + ' eftir breytinguna.',
      diagram: { kind: 'parallel', U: '10 V', R: ['20 Ω', '40 Ω', '?'], currents: [null, null, '?'], I: '?' },
      answers: [
        { key: 'RH1', label: S('R', 'H') + ' fyrir breytingu', q: 'R', value: 40 / 3, mistakes: [{ value: 60, msg: 'Þetta er summa — í hliðtengingu notarðu 1/R_H = 1/R₁ + 1/R₂.' }] },
        { key: 'R3', label: S('R', 3), q: 'R', value: 40, mistakes: [{ value: 10, msg: 'R₃ er ekki sama og nýja heildarviðnámið. Notaðu 1/R₃ = 1/R_H − 1/R₁ − 1/R₂.' }, { value: 3.333333333, msg: 'Þú dróst viðnámin frá. Dragðu frá andhverfurnar: 1/R₃ = 1/10 − 1/20 − 1/40.' }] },
        { key: 'IH', label: S('I', 'H') + ' eftir breytingu', q: 'I', value: 1 },
        { key: 'I3', label: S('I', 3), q: 'I', value: 0.25 },
      ],
      hint: 'Andhverfurnar leggjast saman: 1/R_H = 1/R₁ + 1/R₂ + 1/R₃. Leystu fyrir 1/R₃ og snúðu við.',
      solution: [
        { title: 'Heildarviðnám fyrir breytingu', html: [S('R', 'H') + ' = ' + F('20 · 40', '20 + 40') + ' = ' + F('800', '60') + ' ≈ 13,33 Ω (formúlan góða)'] },
        { title: 'Óþekkta mótstaðan', html: [F('1', S('R', 3)) + ' = ' + F('1', S('R', 'H')) + ' − ' + F('1', S('R', 1)) + ' − ' + F('1', S('R', 2)) + ' = ' + F('1', '10') + ' − ' + F('1', '20') + ' − ' + F('1', '40') + ' = 0,1 − 0,05 − 0,025 = 0,025', S('R', 3) + ' = ' + F('1', '0,025') + ' = 40 Ω'] },
        { title: 'Straumar eftir breytingu', html: [S('I', 'H') + ' = ' + F('10 V', '10 Ω') + ' = 1 A', S('I', 1) + ' = 0,5 A, ' + S('I', 2) + ' = 0,25 A, ' + S('I', 3) + ' = ' + F('10 V', '40 Ω') + ' = 0,25 A (samtals 1 A ✓)'] },
      ] })),
    pf('Hliðtengingar 2.2.1 · dæmi 6', parallelEx({ id: 'pf-h6', topic: 'parallelI', title: '25, 20 og 50 Ω við 230 V', U: '230 V', R: ['25 Ω', '20 Ω', '50 Ω'], ask: ['IH', 'I3'],
      prompt: 'Þrjár mótstöður, 25 Ω, 20 Ω og 50 Ω, eru hliðtengdar við 230 V spennugjafa.', task: 'Reiknaðu heildarstrauminn og strauminn í gegnum 50 Ω mótstöðuna.' })),
    (function () {
      const e = pf('Hliðtengingar 2.2.1 · dæmi 7', parallelEx({ id: 'pf-h7', topic: 'parallelI', title: '380, 160 og 470 Ω við 230 V', U: '230 V', R: ['380 Ω', '160 Ω', '470 Ω'], ask: ['RH', 'IH', 'I3'],
        prompt: 'Þrjár mótstöður, 380 Ω, 160 Ω og 470 Ω, eru hliðtengdar við 230 V spennugjafa.', task: 'Reiknaðu heildarviðnámið, heildarstrauminn og strauminn í gegnum 470 Ω mótstöðuna.' }));
      e.note = 'Í verkefnablaðinu stendur 470 Ω í texta en R₃ = 4700 Ω í uppgefnum stærðum. Hér er notað 470 Ω eins og í textanum — spurðu kennarann ef þú ert í vafa.';
      return e;
    })(),
    (function () {
      const e = pf('Hliðtengingar 2.2.1 · dæmi 8', parallelEx({ id: 'pf-h8', topic: 'parallelI', title: '5, 1000 og 2000 Ω við 230 V', U: '230 V', R: ['5 Ω', '1000 Ω', '2000 Ω'], ask: ['RH', 'I1', 'IH'],
        prompt: 'Þrjár mótstöður, 5 Ω, 1000 Ω og 2000 Ω, eru hliðtengdar við 230 V spennugjafa.', task: 'Reiknaðu heildarviðnámið. Um hvaða mótstöðu fer mestur straumur, og hve miklu munar á honum og heildarstraumnum?' }));
      const r = Calc.parallel(230, [5, 1000, 2000]);
      e.answers.push({ key: 'D', label: 'Mismunur ' + S('I', 'H') + ' − ' + S('I', 1), q: 'I', value: r.IH - r.currents[0], units: UNITS_OF.I });
      e.solution.push({ title: 'Mismunur', html: ['Mestur straumur fer um minnsta viðnámið, 5 Ω: ' + S('I', 1) + ' = 46 A.', S('I', 'H') + ' − ' + S('I', 1) + ' = ' + Calc.formatIn(r.IH, 'A') + ' − 46 A = ' + Calc.formatIn(r.IH - r.currents[0], 'A') + ' (straumur hinna tveggja greinanna).'] });
      return e;
    })(),
    pf('Hliðtengingar 2.2.1 · dæmi 9', parallelEx({ id: 'pf-h9', topic: 'parallelR', title: 'Fjórar ólíkar mótstöður', R: ['22 Ω', '15 Ω', '33 Ω', '57 Ω'], ask: ['RH'],
      prompt: 'Mótstöðurnar 22 Ω, 15 Ω, 33 Ω og 57 Ω eru hliðtengdar.', task: 'Hvert er heildarviðnámið?' })),
    pf('Hliðtengingar 2.2.1 · dæmi 10', parallelEx({ id: 'pf-h10', topic: 'parallelR', title: 'Fjórar mótstöður í kΩ-stærð', R: ['8200 Ω', '1500 Ω', '2700 Ω', '3300 Ω'], ask: ['RH'],
      prompt: 'Mótstöðurnar 8200 Ω, 1500 Ω, 2700 Ω og 3300 Ω eru hliðtengdar.', task: 'Hvert er heildarviðnámið?' })),
    pf('Hliðtengingar 2.2.1 · dæmi 11–14', numEx({ id: 'pf-h11', topic: 'parallelR', title: 'Jafnstórar mótstöður í hliðtengingu',
      prompt: 'Hvert er heildarviðnámið þegar eftirfarandi mótstöður eru hliðtengdar? a) Þrjár 20 Ω. b) Fjórar 20 Ω. c) Þrjár 100 Ω. d) Fimm 100 Ω.',
      answers: [
        { key: 'a', label: 'a) 3 × 20 Ω', q: 'R', value: 20 / 3, mistakes: [{ value: 60, msg: 'Þú margfaldaðir — það á við um raðtengingu. Í hliðtengingu er R_H = R / n.' }] },
        { key: 'b', label: 'b) 4 × 20 Ω', q: 'R', value: 5, mistakes: [{ value: 80, msg: 'Í hliðtengingu er R_H = R / n.' }] },
        { key: 'c', label: 'c) 3 × 100 Ω', q: 'R', value: 100 / 3, mistakes: [{ value: 300, msg: 'Í hliðtengingu er R_H = R / n.' }] },
        { key: 'd', label: 'd) 5 × 100 Ω', q: 'R', value: 20, mistakes: [{ value: 500, msg: 'Í hliðtengingu er R_H = R / n.' }] },
      ],
      hint: 'n jafnstórar mótstöður í hliðtengingu: R_H = R / n.',
      solution: [{ title: 'R_H = R / n', html: ['a) 20 Ω / 3 ≈ 6,67 Ω', 'b) 20 Ω / 4 = 5 Ω', 'c) 100 Ω / 3 ≈ 33,3 Ω', 'd) 100 Ω / 5 = 20 Ω', 'Sama fæst með andhverfuformúlunni, t.d. 1/R_H = 1/20 + 1/20 + 1/20 = 3/20.'] }] })),
    pf('Hliðtengingar 2.2.1 · dæmi 15', numEx({ id: 'pf-h15', topic: 'parallelI', title: 'Finna R₃ út frá heildarstraumi',
      prompt: 'Þrjár mótstöður eru hliðtengdar við 240 V. ' + S('R', 1) + ' = 100 Ω og ' + S('R', 2) + ' = 60 Ω. Heildarstraumurinn er 14,4 A. Finndu ' + S('R', 3) + '. Síðan er 20 Ω mótstöðu (' + S('R', 4) + ') bætt við í hliðtengingu. Hver verður þá heildarstraumurinn?',
      diagram: { kind: 'parallel', U: '240 V', R: ['100 Ω', '60 Ω', '?'], I: '14,4 A' },
      answers: [
        { key: 'R3', label: S('R', 3), q: 'R', value: 30, mistakes: [{ value: 16.6666667, msg: 'Þetta er heildarviðnámið (240 V / 14,4 A). Finndu fyrst strauminn í R₃: I₃ = I_H − I₁ − I₂.' }] },
        { key: 'IH2', label: S('I', 'H') + ' með ' + S('R', 4), q: 'I', value: 26.4, mistakes: [{ value: 12, msg: 'Þetta er aðeins straumurinn í R₄. Bættu honum við fyrri heildarstrauminn.' }] },
      ],
      hint: 'Reiknaðu straum í þekktu greinunum (I = U / R). Afgangurinn af heildarstraumnum fer í gegnum R₃.',
      solution: [
        { title: 'Þekktar greinar', html: [S('I', 1) + ' = ' + F('240 V', '100 Ω') + ' = 2,4 A, ' + S('I', 2) + ' = ' + F('240 V', '60 Ω') + ' = 4 A'] },
        { title: 'Straumur og viðnám R₃ (1. lögmál Kirchhoffs)', html: [S('I', 3) + ' = 14,4 − 2,4 − 4 = 8 A', S('R', 3) + ' = ' + F('240 V', '8 A') + ' = 30 Ω'] },
        { title: 'Ný grein R₄', html: [S('I', 4) + ' = ' + F('240 V', '20 Ω') + ' = 12 A', S('I', 'H') + ' = 14,4 A + 12 A = 26,4 A'] },
      ] })),
    pf('Hliðtengingar 2.2.1 · dæmi 16', numEx({ id: 'pf-h16', topic: 'parallelI', title: 'Straumar og R₃',
      prompt: 'Þrjár mótstöður eru hliðtengdar við 32 V. ' + S('R', 1) + ' = 16 Ω, ' + S('R', 2) + ' = 4 Ω og straumurinn í gegnum ' + S('R', 3) + ' er 4 A. Reiknaðu ' + S('I', 1) + ', ' + S('I', 2) + ', ' + S('I', 'H') + ' og ' + S('R', 3) + '.',
      diagram: { kind: 'parallel', U: '32 V', R: ['16 Ω', '4 Ω', '?'], currents: ['?', '?', '4 A'], I: '?' },
      answers: [
        { key: 'I1', label: S('I', 1), q: 'I', value: 2 }, { key: 'I2', label: S('I', 2), q: 'I', value: 8 },
        { key: 'IH', label: S('I', 'H'), q: 'I', value: 14 }, { key: 'R3', label: S('R', 3), q: 'R', value: 8, mistakes: [{ value: 128, msg: 'Þú margfaldaðir. R = U / I.' }] },
      ],
      hint: 'Sama spenna, 32 V, yfir hverri grein. I = U / R, R = U / I og I_H er summa greinastraumanna.',
      solution: [{ title: 'Útreikningur', html: [S('I', 1) + ' = ' + F('32 V', '16 Ω') + ' = 2 A', S('I', 2) + ' = ' + F('32 V', '4 Ω') + ' = 8 A', S('I', 'H') + ' = 2 + 8 + 4 = 14 A', S('R', 3) + ' = ' + F('32 V', '4 A') + ' = 8 Ω'] }] })),
    pf('Hliðtengingar 2.2.1 · dæmi 17', numEx({ id: 'pf-h17', topic: 'parallelI', title: 'Finna R₁ út frá straumum',
      prompt: 'Þrjár mótstöður eru hliðtengdar. Heildarstraumurinn er 438 mA og straumurinn í gegnum ' + S('R', 1) + ' er 152 mA. ' + S('R', 2) + ' = 5,1 kΩ og ' + S('R', 3) + ' = 2,7 kΩ. Reiknaðu spennuna yfir rásina og viðnámið ' + S('R', 1) + '.',
      diagram: { kind: 'parallel', U: '?', R: ['?', '5,1 kΩ', '2,7 kΩ'], currents: ['152 mA', null, null], I: '438 mA' },
      answers: [
        { key: 'U', label: S('U') + ' (spenna yfir rásina)', q: 'U', value: 0.286 / (1 / 5100 + 1 / 2700) },
        { key: 'R1', label: S('R', 1), q: 'R', value: (0.286 / (1 / 5100 + 1 / 2700)) / 0.152 },
      ],
      hint: 'Straumurinn í R₂ og R₃ saman er I_H − I₁. Sú grein (R₂ ‖ R₃) hefur sama U og R₁.',
      solution: [
        { title: 'Straumur í R₂ og R₃ saman', html: ['438 mA − 152 mA = 286 mA = 0,286 A'] },
        { title: 'Viðnám R₂ og R₃ saman (formúlan góða)', html: [S('R', '2,3') + ' = ' + F('5100 · 2700', '5100 + 2700') + ' ≈ 1765,4 Ω'] },
        { title: 'Spenna og R₁', html: [S('U') + ' = 0,286 A · 1765,4 Ω ≈ 504,9 V', S('R', 1) + ' = ' + F('504,9 V', '0,152 A') + ' ≈ 3322 Ω ≈ 3,32 kΩ'] },
      ] })),
    pf('Hliðtengingar 2.2.1 · dæmi 18', numEx({ id: 'pf-h18', topic: 'parallelR', title: 'Mótstaða svo I_H verði 0,5 A',
      prompt: 'Þrjár mótstöður, 10 kΩ, 10 kΩ og 5 kΩ, eru hliðtengdar og heildarstraumurinn er 0,4 A. Hve stóra mótstöðu (' + S('R', 4) + ') þarf að hliðtengja við þær til að heildarstraumurinn verði 0,5 A?',
      diagram: { kind: 'parallel', U: '?', R: ['10 kΩ', '10 kΩ', '5 kΩ', '?'], I: '0,4 A' },
      answers: [
        { key: 'U', label: S('U') + ' (spenna yfir rásina)', q: 'U', value: 1000 },
        { key: 'R4', label: S('R', 4), q: 'R', value: 10000, mistakes: [{ value: 2000, msg: 'Þetta er nýja heildarviðnámið (1000 V / 0,5 A). R₄ fær aðeins aukastrauminn 0,1 A.' }] },
      ],
      hint: 'Finndu R_H og spennuna fyrst (U = I_H · R_H). Nýja greinin þarf að taka 0,5 − 0,4 = 0,1 A.',
      solution: [
        { title: 'Heildarviðnám og spenna', html: [F('1', S('R', 'H')) + ' = ' + F('1', '10000') + ' + ' + F('1', '10000') + ' + ' + F('1', '5000') + ' = 0,0004 ⇒ ' + S('R', 'H') + ' = 2500 Ω', S('U') + ' = 0,4 A · 2500 Ω = 1000 V'] },
        { title: 'Nýja greinin', html: [S('I', 4) + ' = 0,5 A − 0,4 A = 0,1 A', S('R', 4) + ' = ' + F('1000 V', '0,1 A') + ' = 10000 Ω = 10 kΩ'] },
      ] })),

    /* ---- 2.3 Blönduð tenging ---- */
    pf('Blönduð tenging 2.3 · sýnidæmi 1', mixedEx({ id: 'pf-b1', title: 'R₁ + (R₂ ‖ R₃) + R₄', U: '9 V',
      tree: Sr(Rn(1, '20 Ω'), Pr(Rn(2, '45 Ω'), Rn(3, '90 Ω')), Rn(4, '40 Ω')), ask: ['RH', 'IH', 'U:2,3', 'I:2', 'I:3', 'U:1', 'U:4'],
      prompt: 'Fjórar mótstöður eru tengdar við 9 V: ' + S('R', 2) + ' = 45 Ω og ' + S('R', 3) + ' = 90 Ω eru hliðtengdar, og sá hópur er raðtengdur við ' + S('R', 1) + ' = 20 Ω og ' + S('R', 4) + ' = 40 Ω.',
      task: 'Reiknaðu heildarviðnámið, heildarstrauminn, spennuna yfir ' + S('R', 2) + ' og ' + S('R', 3) + ', straumana ' + S('I', 2) + ' og ' + S('I', 3) + ' og spennuföllin yfir ' + S('R', 1) + ' og ' + S('R', 4) + '.' })),
    pf('Blönduð tenging 2.3 · sýnidæmi 2', mixedEx({ id: 'pf-b2', title: 'R₁ ‖ (R₂ + R₃) ‖ R₄', U: '8,7 V',
      tree: Pr(Rn(1, '40 Ω'), Sr(Rn(2, '20 Ω'), Rn(3, '60 Ω')), Rn(4, '50 Ω')), ask: ['RH', 'IH', 'I:1', 'I:2,3', 'I:4', 'U:2', 'U:3'],
      prompt: 'Við 8,7 V eru þrjár greinar hliðtengdar: ' + S('R', 1) + ' = 40 Ω, raðtengdu mótstöðurnar ' + S('R', 2) + ' = 20 Ω og ' + S('R', 3) + ' = 60 Ω, og ' + S('R', 4) + ' = 50 Ω.',
      task: 'Reiknaðu heildarviðnámið, heildarstrauminn, straum í hverri grein og spennuföllin yfir ' + S('R', 2) + ' og ' + S('R', 3) + '.' })),
    pf('Blönduð tenging 2.3 · sýnidæmi 3', mixedEx({ id: 'pf-b3', title: 'Fimm 12 Ω mótstöður', U: '7,5 V',
      tree: Pr(Rn(1, '12 Ω'), Sr(Rn(2, '12 Ω'), Pr(Rn(3, '12 Ω'), Sr(Rn(4, '12 Ω'), Rn(5, '12 Ω'))))), ask: ['RH', 'IH', 'I:1', 'I:2', 'U:2', 'U:3', 'I:3', 'I:4,5', 'U:4'],
      prompt: 'Fimm 12 Ω mótstöður eru tengdar við 7,5 V eins og myndin sýnir: ' + S('R', 4) + ' og ' + S('R', 5) + ' eru raðtengdar og hliðtengdar við ' + S('R', 3) + '; sá hópur er raðtengdur við ' + S('R', 2) + '; og allt það er hliðtengt við ' + S('R', 1) + '.',
      task: 'Reiknaðu heildarviðnámið, heildarstrauminn og strauma og spennur í hverjum hluta.' })),
    pf('Glósur 2.1 · mynd 3', mixedEx({ id: 'pf-b4', title: '(R₁ + R₂) ‖ (R₃ + R₄)', U: '12 V',
      tree: Pr(Sr(Rn(1, '100 Ω'), Rn(2, '200 Ω')), Sr(Rn(3, '150 Ω'), Rn(4, '150 Ω'))), ask: ['RH', 'IH', 'I:1,2', 'U:1', 'U:2', 'U:3'],
      prompt: 'Tvær greinar eru hliðtengdar við 12 V. Í annarri eru ' + S('R', 1) + ' = 100 Ω og ' + S('R', 2) + ' = 200 Ω raðtengdar, í hinni ' + S('R', 3) + ' = 150 Ω og ' + S('R', 4) + ' = 150 Ω.',
      task: 'Reiknaðu heildarviðnámið, heildarstrauminn, strauminn í grein ' + S('R', 1) + '–' + S('R', 2) + ' og spennuföllin yfir ' + S('R', 1) + ', ' + S('R', 2) + ' og ' + S('R', 3) + '.' })),
    pf('Blönduð tenging 2.3 · æfing', mixedEx({ id: 'pf-b5', examOnly: true, title: 'R₁ + (R₂ ‖ R₃)', U: '12 V',
      tree: Sr(Rn(1, '10 Ω'), Pr(Rn(2, '30 Ω'), Rn(3, '60 Ω'))), ask: ['RH', 'IH', 'U:1', 'U:2,3', 'I:2'],
      prompt: S('R', 2) + ' = 30 Ω og ' + S('R', 3) + ' = 60 Ω eru hliðtengdar og sá hópur er raðtengdur við ' + S('R', 1) + ' = 10 Ω. Spennan er 12 V.',
      task: 'Reiknaðu heildarviðnámið, heildarstrauminn, spennuföllin og strauminn í gegnum ' + S('R', 2) + '.' })),
    pf('Blönduð tenging 2.3', mcEx({ id: 'pf-b6', topic: 'mixed', title: 'Hvað er eins í blandaðri rás?',
      prompt: 'Í rásinni ' + S('R', 1) + ' + (' + S('R', 2) + ' ‖ ' + S('R', 3) + ') + ' + S('R', 4) + ' (sýnidæmi 1). Hvað af eftirfarandi er rétt?',
      diagram: { kind: 'network', U: '', tree: Sr(Rn(1, '20 Ω'), Pr(Rn(2, '45 Ω'), Rn(3, '90 Ω')), Rn(4, '40 Ω')), labels: {} },
      options: [
        ['Sama spenna er yfir ' + S('R', 2) + ' og ' + S('R', 3) + ', og heildarstraumurinn fer bæði um ' + S('R', 1) + ' og ' + S('R', 4) + '.', true],
        ['Sami straumur fer um ' + S('R', 2) + ' og ' + S('R', 3) + '.', false, 'R₂ og R₃ eru hliðtengdar: straumurinn skiptist á milli þeirra, en spennan yfir þær er sú sama.'],
        ['Sama spenna er yfir allar fjórar mótstöðurnar.', false, 'Aðeins hliðtengdar mótstöður hafa sömu spennu. R₁, (R₂‖R₃) og R₄ eru raðtengd og spennan skiptist á milli þeirra.'],
      ],
      hint: 'Raðtengt = sami straumur. Hliðtengt = sama spenna. Hvaða hlutar eru hvort?',
      solution: [{ title: 'Greining', html: [S('R', 2) + ' og ' + S('R', 3) + ' eru hliðtengdar: sama spenna (3 V), straumurinn skiptist (0,067 A og 0,033 A).', S('R', 1) + ', hópurinn ' + S('R', '2,3') + ' og ' + S('R', 4) + ' eru raðtengd: sami heildarstraumur (0,1 A) fer um þau, og spennuföllin 2 V + 3 V + 4 V = 9 V.'] }] })),
  ];

  PROF.forEach(function (e) { BANK.push(e); });

  const byId = {};
  BANK.forEach(function (e) {
    if (byId[e.id]) throw new Error('Tvítekið auðkenni: ' + e.id);
    byId[e.id] = e;
  });

  function practice() { return BANK.filter(function (e) { return !e.examOnly; }); }
  function topicName(id) { const t = TOPICS.find(function (x) { return x.id === id; }); return t ? t.name : id; }

  /** Einfaldur endurtakanlegur slembigjafi (mulberry32). */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /** Velur 10 spurningar: eina úr hverjum efnisflokki og afganginn af handahófi. */
  function buildExam(seed, size) {
    size = size || 10;
    const rand = rng(seed);
    const chosen = [];
    TOPICS.forEach(function (t) {
      const pool = shuffle(BANK.filter(function (e) { return e.topic === t.id; }), rand);
      // Spurningar sem birtast aðeins í prófham eru valdar á undan þegar hægt er.
      pool.sort(function (a, b) { return (b.examOnly ? 1 : 0) - (a.examOnly ? 1 : 0); });
      chosen.push(pool[0].id);
    });
    const rest = shuffle(BANK.filter(function (e) { return chosen.indexOf(e.id) < 0; }), rand);
    while (chosen.length < size && rest.length) chosen.push(rest.shift().id);
    return shuffle(chosen, rand);
  }

  return { TOPICS: TOPICS, BANK: BANK, byId: byId, practice: practice, topicName: topicName, buildExam: buildExam, rng: rng, quantity: q };
});

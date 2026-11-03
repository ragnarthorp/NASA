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

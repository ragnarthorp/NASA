/*
 * explain.js — býr til skref-fyrir-skref lausnir (HTML-strengi) fyrir reiknivélar og æfingar.
 * Reiknar með fullri nákvæmni og námundar aðeins birtingu.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./calc.js'));
  else root.Explain = factory(root.Calc);
})(typeof self !== 'undefined' ? self : this, function (Calc) {
  'use strict';

  const SUBDIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  function subText(n) { return String(n).split('').map(function (c) { return SUBDIGITS[+c] || c; }).join(''); }

  /** Tákn með undirskrift, t.d. sym('R','H') → R<sub>H</sub>. */
  function sym(base, sub) {
    return '<var>' + base + '</var>' + (sub != null && sub !== '' ? '<sub>' + sub + '</sub>' : '');
  }
  function frac(num, den) {
    return '<span class="frac" role="group" aria-label="brot"><span class="num">' + num + '</span><span class="den">' + den + '</span></span>';
  }
  function q(x, qty) { return Calc.formatIn(x, Calc.BASE_UNIT[qty]); }
  function both(x, qty) { return Calc.formatBoth(x, qty); }
  function eq(x) { return Calc.eqSign(x); }
  function n(x) { return Calc.formatNumber(x); }
  function joinSym(base, count, op) {
    const parts = [];
    for (let i = 1; i <= count; i++) parts.push(sym(base, i));
    return parts.join(op);
  }

  /** Umbreyting í grunneiningar, t.d. „2,2 kΩ = 2200 Ω“. inputs: [{ value (SI), unit, label }] */
  function conversions(inputs) {
    const lines = [];
    inputs.forEach(function (it) {
      if (!it.unit) return;
      const base = Calc.BASE_UNIT[Calc.unitInfo(it.unit).q];
      if (it.unit === base) return;
      lines.push(it.label + ' = ' + Calc.formatIn(it.value, it.unit) + ' = ' + q(it.value, Calc.unitInfo(it.unit).q));
    });
    return lines;
  }

  const FORMULA = {
    U: sym('U') + ' = ' + sym('I') + ' · ' + sym('R'),
    I: sym('I') + ' = ' + frac(sym('U'), sym('R')),
    R: sym('R') + ' = ' + frac(sym('U'), sym('I')),
  };
  const OHM_WHY = {
    U: 'Þú þekkir strauminn og viðnámið. Þá margfaldarðu þau saman: meiri straumur eða meira viðnám gefur meiri spennu.',
    I: 'Þú þekkir spennuna og viðnámið. Þá deilirðu spennunni með viðnáminu: meira viðnám gefur minni straum.',
    R: 'Þú þekkir spennuna og strauminn. Þá deilirðu spennunni með straumnum: því minni straumur við sömu spennu, því meira viðnám.',
  };

  /**
   * Lögmál Ohms. known: { U, I, R } í grunneiningum; units: valdar einingar innsláttar.
   */
  function ohm(find, known, units) {
    units = units || {};
    const value = Calc.ohm(find, known);
    const given = ['U', 'I', 'R'].filter(function (k) { return k !== find; });
    const conv = conversions(given.map(function (k) { return { value: known[k], unit: units[k], label: sym(k) }; }));
    let subst;
    if (find === 'U') subst = sym('U') + ' = ' + q(known.I, 'I') + ' · ' + q(known.R, 'R');
    else if (find === 'I') subst = sym('I') + ' = ' + frac(q(known.U, 'U'), q(known.R, 'R'));
    else subst = sym('R') + ' = ' + frac(q(known.U, 'U'), q(known.I, 'I'));
    const result = sym(find) + ' ' + eq(value) + ' ' + both(value, find);
    const steps = [];
    steps.push({ title: 'Velja formúlu', html: [FORMULA[find], OHM_WHY[find]] });
    if (conv.length) steps.push({ title: 'Breyta í samræmdar einingar (V, A, Ω)', html: conv });
    steps.push({ title: 'Setja tölurnar inn', html: [subst] });
    steps.push({ title: 'Niðurstaða', html: [result] });
    return { value: value, formula: FORMULA[find], conversions: conv, substitution: subst, result: result, explanation: OHM_WHY[find], steps: steps };
  }

  function resistorInputs(rs, units) {
    return rs.map(function (r, i) { return { value: r, unit: units && units[i], label: sym('R', i + 1) }; });
  }

  /** Raðtenging: U í V, rs í Ω, rUnits valdar einingar (fyrir umbreytingarskref). */
  function series(U, rs, rUnits) {
    const onlyR = U == null;
    const r = onlyR ? { RH: Calc.seriesResistance(rs) } : Calc.series(U, rs);
    const k = rs.length;
    const steps = [];
    const conv = conversions(resistorInputs(rs, rUnits));
    if (conv.length) steps.push({ title: 'Breyta í ohm (Ω)', html: conv });

    const sumTerms = rs.map(function (x) { return q(x, 'R'); }).join(' + ');
    steps.push({
      title: 'Leggja viðnámin saman',
      html: [sym('R', 'H') + ' = ' + joinSym('R', k, ' + ') + (k > 1 ? ' = ' + sumTerms : '') + ' ' + eq(r.RH) + ' ' + both(r.RH, 'R')
      ].concat(k > 1 ? ['Athugun: ' + sym('R', 'H') + ' er stærra en hvert einstakt viðnám. ✓'] : []),
    });
    if (onlyR) return { result: r, steps: steps, check: true };
    steps.push({
      title: 'Reikna heildarstraum',
      html: [sym('I', 'H') + ' = ' + frac(sym('U', 'H'), sym('R', 'H')) + ' = ' + frac(q(U, 'U'), q(r.RH, 'R')) + ' ' + eq(r.I) + ' ' + both(r.I, 'I'),
        'Sami straumur fer um öll viðnámin: ' + joinSym('I', k, ' = ') + ' = ' + sym('I', 'H') + '.'],
    });
    steps.push({
      title: 'Reikna spennufall yfir hvert viðnám',
      html: rs.map(function (x, i) {
        return sym('U', i + 1) + ' = ' + sym('I', 'H') + ' · ' + sym('R', i + 1) + ' = ' + q(r.I, 'I') + ' · ' + q(x, 'R') + ' ' + eq(r.drops[i]) + ' ' + both(r.drops[i], 'U');
      }),
    });
    const ok = Calc.relDiff(r.sumU, U) < 1e-9;
    steps.push({
      title: 'Athuga summu spennufalla',
      html: [joinSym('U', k, ' + ') + ' = ' + r.drops.map(function (x) { return q(x, 'U'); }).join(' + ') + ' ' + eq(r.sumU) + ' ' + q(r.sumU, 'U'),
        ok ? 'Summan er jöfn spennu spennugjafans, ' + sym('U', 'H') + ' = ' + q(U, 'U') + '. ✓ Stenst.'
          : 'Summan stemmir ekki við ' + sym('U', 'H') + ' — farðu yfir útreikninginn.'],
      check: ok,
    });
    return { result: r, steps: steps, check: ok };
  }

  /** Hliðtenging: almenna andhverfuformúlan; „formúlan góða“ sem aukaleið fyrir tvö viðnám. */
  function parallel(U, rs, rUnits) {
    const onlyR = U == null;
    const r = Calc.parallel(onlyR ? 1 : U, rs);
    const k = rs.length;
    const steps = [];
    const conv = conversions(resistorInputs(rs, rUnits));
    if (conv.length) steps.push({ title: 'Breyta í ohm (Ω)', html: conv });

    const invTerms = [];
    for (let i = 1; i <= k; i++) invTerms.push(frac('1', sym('R', i)));
    const invNums = rs.map(function (x) { return frac('1', q(x, 'R')); });
    const invVals = rs.map(function (x) { return n(1 / x); });
    const rh = [
      frac('1', sym('R', 'H')) + ' = ' + invTerms.join(' + ') + ' = ' + invNums.join(' + '),
      frac('1', sym('R', 'H')) + ' ' + (rs.some(function (x) { return Calc.isRounded(1 / x); }) ? '≈' : '=') + ' ' + invVals.join(' + ') + ' ' + eq(r.invSum) + ' ' + n(r.invSum) + ' 1/Ω',
      sym('R', 'H') + ' = ' + frac('1', n(r.invSum) + ' 1/Ω') + ' ' + eq(r.RH) + ' ' + both(r.RH, 'R'),
    ];
    const minR = Math.min.apply(null, rs);
    rh.push('Athugun: ' + sym('R', 'H') + ' er minna en minnsta viðnámið (' + q(minR, 'R') + '). ✓');
    steps.push({ title: 'Finna heildarviðnám', html: rh });
    if (k === 2) {
      const prod = rs[0] * rs[1];
      const sum = rs[0] + rs[1];
      steps.push({
        title: 'Önnur leið: Formúlan góða — fyrir tvö viðnám',
        html: [sym('R', 'H') + ' = ' + frac(sym('R', 1) + ' · ' + sym('R', 2), sym('R', 1) + ' + ' + sym('R', 2)) + ' = ' +
          frac(n(rs[0]) + ' · ' + n(rs[1]), n(rs[0]) + ' + ' + n(rs[1])) + ' = ' + frac(n(prod), n(sum)) + ' ' + eq(r.good) + ' ' + both(r.good, 'R'),
          'Sama niðurstaða. Athugaðu að þessa formúlu má aðeins nota beint á nákvæmlega tvö viðnám.'],
      });
    }
    if (onlyR) return { result: { RH: r.RH, invSum: r.invSum, good: r.good }, steps: steps, check: true };
    steps.push({
      title: 'Sama spenna yfir hverja grein',
      html: [joinSym('U', k, ' = ') + ' = ' + sym('U', 'H') + ' = ' + q(U, 'U')],
    });
    steps.push({
      title: 'Reikna straum í hverri grein',
      html: rs.map(function (x, i) {
        return sym('I', i + 1) + ' = ' + frac(sym('U', 'H'), sym('R', i + 1)) + ' = ' + frac(q(U, 'U'), q(x, 'R')) + ' ' + eq(r.currents[i]) + ' ' + both(r.currents[i], 'I');
      }),
    });
    steps.push({
      title: 'Leggja greinastrauma saman',
      html: [sym('I', 'H') + ' = ' + joinSym('I', k, ' + ') + ' = ' + r.currents.map(function (x) { return q(x, 'I'); }).join(' + ') + ' ' + eq(r.IH) + ' ' + both(r.IH, 'I')],
    });
    const ok = Calc.relDiff(r.IH, r.IHcheck) < 1e-9;
    steps.push({
      title: 'Athuga heildarstraum',
      html: [sym('I', 'H') + ' = ' + frac(sym('U', 'H'), sym('R', 'H')) + ' = ' + frac(q(U, 'U'), q(r.RH, 'R')) + ' ' + eq(r.IHcheck) + ' ' + both(r.IHcheck, 'I'),
        ok ? 'Sama niðurstaða og summa greinastraumanna. ✓ Stenst.' : 'Niðurstöðurnar stemma ekki — farðu yfir útreikninginn.'],
      check: ok,
    });
    return { result: r, steps: steps, check: ok };
  }

  return { sym: sym, frac: frac, subText: subText, conversions: conversions, FORMULA: FORMULA, ohm: ohm, series: series, parallel: parallel };
});

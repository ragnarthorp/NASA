/*
 * grade.js — svaramat fyrir töluleg svör og krossaspurningar.
 * Svör eru borin saman í grunneiningum (V, A, Ω) svo 0,02 A og 20 mA teljist sama svar.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./calc.js'));
  else root.Grade = factory(root.Calc);
})(typeof self !== 'undefined' ? self : this, function (Calc) {
  'use strict';

  // Hlutfallsleg vikmörk: 0,5 % nær yfir námundun í þrjá markverða stafi.
  const REL_TOL = 0.005;
  // Svar sem er rétt námundað í þann fjölda aukastafa sem nemandinn gaf er samþykkt ef það
  // hefur a.m.k. svona marga markverða stafi (t.d. 67 Ω fyrir 66,67 Ω).
  const MIN_SIG_FOR_ROUNDING = 2;
  // Innan þessa fráviks fær nemandi að vita að hann sé nálægt.
  const NEAR_TOL = 0.05;

  /** Fjöldi markverðra stafa í innslegnu svari (núll aftast í heiltölu teljast ekki með). */
  function significantDigits(text) {
    let s = String(text).trim().replace(/^[+-]/, '').replace(/e.*$/i, '');
    const hasSep = /[.,]/.test(s);
    s = s.replace(/[.,]/g, '').replace(/^0+/, '');
    if (!hasSep) s = s.replace(/0+$/, '');
    return Math.max(s.length, 1);
  }
  function decimals(text) {
    const s = String(text).trim().replace(/e.*$/i, '');
    const m = /[.,](\d*)$/.exec(s);
    return m ? m[1].length : 0;
  }

  function within(a, b, tol) { return Calc.relDiff(a, b) <= tol; }

  /**
   * Metur tölulegt svar.
   * @param raw texti nemandans, unit valin eining, answer { value (grunneining), mistakes? }
   * @returns { status: 'correct'|'invalid'|'unit'|'rounded'|'near'|'mistake'|'wrong', message }
   */
  function gradeNumeric(raw, unit, answer) {
    const p = Calc.parseNumber(raw);
    if (!p.ok) return { status: 'invalid', message: p.message };
    const correct = answer.value;
    const given = Calc.toSI(p.value, unit);
    const res = function (status, message) { return { status: status, message: message, value: given }; };

    if (given <= 0) {
      return res('wrong', 'Svarið á að vera jákvæð tala. Athugaðu formerkið og útreikninginn.');
    }
    if (within(given, correct, REL_TOL)) return res('correct', 'Rétt!');

    // Námundun: rétt gildi námundað í jafn marga aukastafi og nemandinn gaf, í valinni einingu.
    const d = decimals(p.text);
    const correctInUnit = Calc.fromSI(correct, unit);
    const halfStep = 0.5 * Math.pow(10, -d) * (1 + 1e-9);
    const roundsCorrectly = Math.abs(p.value - correctInUnit) <= halfStep;
    if (roundsCorrectly) {
      if (significantDigits(p.text) >= MIN_SIG_FOR_ROUNDING) return res('correct', 'Rétt (námundað).');
      return res('rounded', 'Svarið er of mikið námundað. Gefðu a.m.k. tvo til þrjá markverða stafa, eða veldu minni einingu (t.d. mA í stað A).');
    }

    const mistakes = answer.mistakes || [];
    for (let i = 0; i < mistakes.length; i++) {
      if (within(given, mistakes[i].value, REL_TOL)) return res('mistake', mistakes[i].msg);
    }
    // Röng eining: talan væri rétt ef deilt eða margfaldað væri með 1000.
    if (within(given * 1000, correct, REL_TOL) || within(given / 1000, correct, REL_TOL)) {
      return res('unit', 'Talan virðist rétt en einingin ekki. Athugaðu hvaða eining er valin (1 A = 1000 mA, 1 kΩ = 1000 Ω).');
    }

    if (within(given, correct, NEAR_TOL)) {
      return res('near', 'Nálægt, en ekki nógu nákvæmt. Athugaðu námundun á milli skrefa og haltu fleiri aukastöfum.');
    }
    if (given > correct * 5 || given < correct / 5) {
      return res('wrong', 'Ekki rétt — svarið er langt frá réttu gildi. Athugaðu hvort þú notaðir rétta formúlu og samræmdar einingar.');
    }
    return res('wrong', 'Ekki rétt. Prófaðu vísbendinguna eða farðu aftur yfir skrefin.');
  }

  /** Metur krossaspurningu. options[i].correct segir hvaða svar er rétt. */
  function gradeChoice(index, options) {
    if (index == null || index < 0 || index >= options.length) {
      return { status: 'invalid', message: 'Veldu einn svarmöguleika.' };
    }
    const opt = options[index];
    if (opt.correct) return { status: 'correct', message: 'Rétt!' };
    return { status: 'wrong', message: opt.why || 'Ekki rétt.' };
  }

  return {
    REL_TOL: REL_TOL, NEAR_TOL: NEAR_TOL,
    significantDigits: significantDigits, decimals: decimals,
    gradeNumeric: gradeNumeric, gradeChoice: gradeChoice,
  };
});

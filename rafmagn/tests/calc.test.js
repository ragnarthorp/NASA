'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Calc = require('../js/calc.js');
const Explain = require('../js/explain.js');

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);

test('Raðtenging: 12 V, 100 Ω og 200 Ω', () => {
  const r = Calc.series(12, [100, 200]);
  close(r.RH, 300);
  close(r.I, 0.04);
  close(Calc.fromSI(r.I, 'mA'), 40);
  close(r.drops[0], 4);
  close(r.drops[1], 8);
  close(r.sumU, 12);
  assert.equal(Calc.formatBoth(r.I, 'I'), '0,04 A (= 40 mA)');
  assert.equal(Calc.formatBoth(r.RH, 'R'), '300 Ω');
});

test('Hliðtenging: 12 V, 100 Ω og 200 Ω', () => {
  const r = Calc.parallel(12, [100, 200]);
  close(r.RH, 200 / 3);
  assert.equal(Calc.formatNumber(r.RH), '66,6667');
  assert.equal(Calc.eqSign(r.RH), '≈');
  close(r.currents[0], 0.12);
  close(r.currents[1], 0.06);
  close(r.IH, 0.18);
  close(r.IHcheck, 0.18);
  close(r.good, r.RH);
  assert.equal(Calc.formatIn(r.IH, 'A'), '0,18 A');
  assert.equal(Calc.eqSign(r.IH), '=');
});

test('Þrjú 300 Ω viðnám í hliðtengingu gefa 100 Ω', () => {
  close(Calc.parallelResistance([300, 300, 300]), 100);
  assert.equal(Calc.formatNumber(Calc.parallelResistance([300, 300, 300])), '100');
  assert.equal(Calc.parallel(12, [300, 300, 300]).good, null, 'formúlan góða á ekki við þrjú viðnám');
});

test('Lögmál Ohms: 9 V og 1 kΩ gefa 9 mA', () => {
  const R = Calc.toSI(1, 'kΩ');
  assert.equal(R, 1000);
  const I = Calc.ohm('I', { U: 9, R });
  close(I, 0.009);
  assert.equal(Calc.fromSI(I, 'mA'), 9);
  assert.equal(Calc.formatBoth(I, 'I'), '0,009 A (= 9 mA)');
  close(Calc.ohm('U', { I: 0.009, R: 1000 }), 9);
  close(Calc.ohm('R', { U: 9, I: 0.009 }), 1000);
});

test('Tugabrotskomma og punktur', () => {
  assert.equal(Calc.parseNumber('4,7').value, 4.7);
  assert.equal(Calc.parseNumber('4.7').value, 4.7);
  assert.equal(Calc.parseNumber(' 0,04 ').value, 0.04);
  assert.equal(Calc.parseNumber(',5').value, 0.5);
  assert.equal(Calc.parseNumber('1 000').value, 1000);
  assert.equal(Calc.parseNumber('1e3').value, 1000);
  assert.equal(Calc.parseNumber('−3').value, -3);
  const amb = Calc.parseNumber('1.000');
  assert.equal(amb.value, 1);
  assert.match(amb.warning, /1000/);
  assert.equal(Calc.parseNumber('0,250').warning, null);
});

test('Ógilt inntak er hafnað með íslenskum skilaboðum', () => {
  for (const [raw, code] of [['', 'empty'], ['   ', 'empty'], ['abc', 'invalid'], ['1,2,3', 'separators'], ['1.000,5', 'separators'],
    ['Infinity', 'nonfinite'], ['∞', 'nonfinite'], ['1e999', 'nonfinite'], ['NaN', 'invalid'], ['12V', 'invalid'], ['--3', 'invalid']]) {
    const p = Calc.parseNumber(raw);
    assert.equal(p.ok, false, raw);
    assert.equal(p.code, code, raw);
    assert.ok(p.message.length > 10);
  }
  assert.equal(Calc.parseQuantity('0', 'Ω').code, 'nonpositive');
  assert.match(Calc.parseQuantity('0', 'Ω').message, /skammhlaup/);
  assert.equal(Calc.parseQuantity('-5', 'V').code, 'nonpositive');
  assert.equal(Calc.parseQuantity('1e-15', 'A').code, 'range');
  assert.equal(Calc.parseQuantity('1e15', 'Ω').code, 'range');
  const ok = Calc.parseQuantity('2,2', 'kΩ');
  assert.equal(ok.ok, true);
  assert.equal(ok.value, 2200);
});

test('Útreikningsföll hafna ógildum gildum', () => {
  assert.throws(() => Calc.series(12, [100, 0]), RangeError);
  assert.throws(() => Calc.parallel(12, [100, -1]), RangeError);
  assert.throws(() => Calc.parallel(NaN, [100]), RangeError);
  assert.throws(() => Calc.ohm('I', { U: 9, R: Infinity }), RangeError);
  assert.throws(() => Calc.seriesResistance([]), RangeError);
});

test('Einingabreytingar', () => {
  assert.equal(Calc.toSI(20, 'mA'), 0.02);
  assert.equal(Calc.fromSI(0.02, 'mA'), 20);
  assert.equal(Calc.toSI(4.7, 'kΩ'), 4700);
  assert.equal(Calc.fromSI(680, 'kΩ'), 0.68);
  assert.equal(Calc.fromSI(0.009, 'mA'), 9);
  assert.equal(Calc.quantity('2,2 kΩ').value, 2200);
});

test('Námundun í birtingu og engin örsmá gildi sem 0', () => {
  assert.equal(Calc.formatNumber(1 / 3), '0,333333');
  assert.equal(Calc.formatNumber(2 / 3, 3), '0,667');
  assert.equal(Calc.formatNumber(12000), '12000');
  assert.equal(Calc.formatNumber(0.1 + 0.2), '0,3');
  assert.equal(Calc.formatBest(2e-6, 'I'), '2 µA');
  assert.equal(Calc.formatBest(5e-8, 'I'), '0,05 µA');
  assert.equal(Calc.formatBest(1.234e-9, 'I'), '0,001234 µA');
  assert.match(Calc.formatNumber(1.5e-12), /1,5 · 10⁻¹²/);
  assert.equal(Calc.formatBest(4700, 'R'), '4,7 kΩ');
  assert.equal(Calc.formatBest(2.2e6, 'R'), '2,2 MΩ');
  assert.equal(Calc.formatBest(0.5, 'U'), '500 mV');
  assert.equal(Calc.formatBoth(6900, 'R'), '6900 Ω (= 6,9 kΩ)');
  // Mjög smár straumur birtist ekki sem 0 A.
  const tiny = Calc.series(1e-6, [1e9, 1e9]).I;
  assert.notEqual(Calc.formatBest(tiny, 'I'), '0 A');
  assert.ok(!/^0 /.test(Calc.formatBoth(tiny, 'I')));
});

test('Hliðtenging: heildarviðnám er minna en minnsta viðnámið; raðtenging stærra en hvert', () => {
  const lists = [[1, 2], [10, 20, 30], [4.7, 1000, 1e6], [300, 300, 300], [5, 5, 5, 5, 5, 5]];
  for (const rs of lists) {
    assert.ok(Calc.parallelResistance(rs) < Math.min(...rs));
    assert.ok(Calc.seriesResistance(rs) > Math.max(...rs));
  }
});

test('Skref-fyrir-skref lausnir innihalda aldrei NaN eða Infinity', () => {
  const cases = [
    Explain.series(12, [100, 200]), Explain.series(9, [1000, 2000], ['kΩ', 'kΩ']), Explain.series(null, [10, 20, 30]),
    Explain.parallel(12, [100, 200]), Explain.parallel(12, [300, 300, 300]), Explain.parallel(null, [6, 3]),
    Explain.parallel(5, [1, 2, 3, 4, 5, 6]), Explain.series(1e-6, [1e9, 1e9]),
  ];
  for (const c of cases) {
    const text = JSON.stringify(c.steps);
    assert.ok(!/NaN|Infinity|undefined/.test(text), text);
    assert.equal(c.check, true);
  }
  const ohm = Explain.ohm('I', { U: 9, R: 1000 }, { R: 'kΩ' });
  assert.match(ohm.result, /0,009 A \(= 9 mA\)/);
  assert.match(ohm.conversions[0], /1 kΩ = 1000 Ω/);
  const s = Explain.series(12, [100, 200]);
  const html = JSON.stringify(s.steps);
  assert.match(html, /300 Ω/);
  assert.match(html, /4 V/);
  assert.match(html, /8 V/);
  const p = Explain.parallel(12, [100, 200]);
  assert.match(JSON.stringify(p.steps), /Formúlan góða — fyrir tvö viðnám/);
  assert.ok(!/Formúlan góða/.test(JSON.stringify(Explain.parallel(12, [1, 2, 3]).steps)));
});

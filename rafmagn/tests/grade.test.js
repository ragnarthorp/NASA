'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Calc = require('../js/calc.js');
const Grade = require('../js/grade.js');
const Exercises = require('../js/exercises.js');
const Diagrams = require('../js/diagrams.js');

const g = (raw, unit, value, mistakes) => Grade.gradeNumeric(raw, unit, { value, mistakes }).status;

test('0,02 A og 20 mA teljast sama svar', () => {
  assert.equal(g('0,02', 'A', 0.02), 'correct');
  assert.equal(g('20', 'mA', 0.02), 'correct');
  assert.equal(g('0.02', 'A', 0.02), 'correct');
  assert.equal(g('40', 'mA', 0.04), 'correct');
  assert.equal(g('9', 'mA', 0.009), 'correct');
  assert.equal(g('0,009', 'A', 0.009), 'correct');
  assert.equal(g('1,8', 'kΩ', 1800), 'correct');
});

test('Röng eining fær sérstaka endurgjöf', () => {
  assert.equal(g('20', 'A', 0.02), 'unit');
  assert.equal(g('0,02', 'mA', 0.02), 'unit');
  assert.equal(g('300', 'kΩ', 300), 'unit');
});

test('Námundun: 66,6667 Ω', () => {
  const v = 200 / 3;
  assert.equal(g('66,6667', 'Ω', v), 'correct');
  assert.equal(g('66,67', 'Ω', v), 'correct');
  assert.equal(g('66,7', 'Ω', v), 'correct');
  assert.equal(g('67', 'Ω', v), 'correct');
  assert.equal(g('0,0667', 'kΩ', v), 'correct');
  assert.equal(g('66', 'Ω', v), 'near');
  assert.equal(g('75', 'Ω', v), 'wrong');
  assert.equal(g('0,07', 'kΩ', v), 'rounded', 'of mikið námundað');
});

test('Svör nálægt vikmörkum (0,5 %)', () => {
  // Rétt gildi 100: 100,49 innan, 100,51 utan (og ekki rétt námundað).
  assert.equal(g('100,49', 'Ω', 100), 'correct');
  assert.equal(g('99,51', 'Ω', 100), 'correct');
  assert.equal(g('100,51', 'Ω', 100), 'near');
  assert.equal(g('99,4', 'Ω', 100), 'near');
  // 0,0171429 A (12 V / 700 Ω): 17,1 mA og 17 mA samþykkt, 17,3 mA ekki.
  const I = 12 / 700;
  assert.equal(g('17,1', 'mA', I), 'correct');
  assert.equal(g('17', 'mA', I), 'correct');
  assert.equal(g('0,0171', 'A', I), 'correct');
  assert.equal(g('17,3', 'mA', I), 'near');
  assert.equal(g('0,02', 'A', I), 'rounded');
});

test('Ógild svör og algeng mistök', () => {
  assert.equal(g('', 'A', 1), 'invalid');
  assert.equal(g('abc', 'A', 1), 'invalid');
  assert.equal(g('Infinity', 'A', 1), 'invalid');
  assert.equal(g('-0,04', 'A', 0.04), 'wrong');
  assert.equal(g('0', 'A', 0.04), 'wrong');
  const r = Grade.gradeNumeric('66,7', 'Ω', { value: 300, mistakes: [{ value: 200 / 3, msg: 'Hliðtenging!' }] });
  assert.equal(r.status, 'mistake');
  assert.equal(r.message, 'Hliðtenging!');
  assert.equal(Grade.gradeChoice(null, [{ correct: true }]).status, 'invalid');
  assert.equal(Grade.gradeChoice(0, [{ correct: false, why: 'x' }, { correct: true }]).message, 'x');
  assert.equal(Grade.gradeChoice(1, [{ correct: false }, { correct: true }]).status, 'correct');
});

test('Markverðir stafir og aukastafir', () => {
  assert.equal(Grade.significantDigits('0,07'), 1);
  assert.equal(Grade.significantDigits('66,7'), 3);
  assert.equal(Grade.significantDigits('300'), 1);
  assert.equal(Grade.significantDigits('300,0'), 4);
  assert.equal(Grade.decimals('66,67'), 2);
  assert.equal(Grade.decimals('67'), 0);
});

test('Verkefnabankinn: fjöldi, efnisflokkar og gild svör', () => {
  const practice = Exercises.practice();
  assert.ok(practice.length >= 24, 'a.m.k. 24 æfingar');
  for (const t of Exercises.TOPICS) {
    assert.ok(practice.some((e) => e.topic === t.id), 'æfing í ' + t.id);
  }
  assert.ok(practice.some((e) => e.type === 'mc') && practice.some((e) => e.type === 'numeric'));
  for (const e of Exercises.BANK) {
    assert.ok(e.title && e.prompt && e.hint && e.solution && e.solution.length, e.id);
    const text = JSON.stringify(e);
    assert.ok(!/NaN|Infinity|undefined/.test(text), e.id);
    if (e.type === 'numeric') {
      for (const a of e.answers) {
        assert.ok(Number.isFinite(a.value) && a.value > 0, e.id + ' ' + a.key);
        assert.ok(a.units.length >= 1);
        // Rétta svarið í hverri leyfðri einingu, námundað í 4 markverða stafi, er samþykkt.
        for (const u of a.units) {
          const shown = Calc.formatNumber(Calc.fromSI(a.value, u), 4);
          assert.equal(Grade.gradeNumeric(shown, u, a).status, 'correct', `${e.id} ${a.key} ${shown} ${u}`);
        }
        for (const m of a.mistakes || []) assert.ok(Calc.relDiff(m.value, a.value) > 0.01, e.id + ' mistake == correct');
      }
    } else {
      assert.equal(e.options.filter((o) => o.correct).length, 1, e.id + ' nákvæmlega eitt rétt svar');
      e.options.filter((o) => !o.correct).forEach((o) => assert.ok(o.why, e.id + ' skýring á röngu svari'));
    }
    if (e.diagram) {
      const svg = Diagrams[e.diagram.kind](e.diagram);
      assert.match(svg, /^<svg/);
      assert.ok(!/NaN|undefined/.test(svg), e.id);
    }
  }
});

test('Lykilsvör í verkefnabankanum', () => {
  const ans = (id, key) => Exercises.byId[id].answers.find((a) => a.key === key).value;
  const close = (a, b) => assert.ok(Calc.relDiff(a, b) < 1e-9, `${a} ≉ ${b}`);
  close(ans('su-1', 'RH'), 300); close(ans('su-1', 'I'), 0.04); close(ans('su-1', 'U1'), 4); close(ans('su-1', 'U2'), 8);
  close(ans('pr-1', 'RH'), 200 / 3); close(ans('pi-1', 'I1'), 0.12); close(ans('pi-1', 'I2'), 0.06); close(ans('pi-1', 'IH'), 0.18);
  close(ans('pr-2', 'RH'), 100); close(ans('ohm-4', 'I'), 0.009); close(ans('sr-2', 'RH'), 1800);
  close(ans('u-1', 'x'), 0.25); close(ans('u-2', 'x'), 0.035); close(ans('u-4', 'x'), 680);
  close(ans('pr-x2', 'RH'), 10); close(ans('pi-x2', 'IH'), 1.5); close(ans('su-x1', 'U2'), 7.6);
});

test('Prófið: 10 ólíkar spurningar, allir efnisflokkar, endurtakanlegt', () => {
  for (let seed = 1; seed < 60; seed++) {
    const ids = Exercises.buildExam(seed);
    assert.equal(ids.length, 10);
    assert.equal(new Set(ids).size, 10);
    const topics = new Set(ids.map((id) => Exercises.byId[id].topic));
    assert.equal(topics.size, Exercises.TOPICS.length);
  }
  assert.deepEqual(Exercises.buildExam(7), Exercises.buildExam(7));
});

test('Tengimyndir laga sig að fjölda viðnáma', () => {
  for (let n = 1; n <= 6; n++) {
    const R = Array.from({ length: n }, (_, i) => (i + 1) * 100 + ' Ω');
    const s = Diagrams.series({ U: '12 V', R, I: '?' });
    const p = Diagrams.parallel({ U: '12 V', R, I: '?' });
    assert.equal((s.match(/class="res"/g) || []).length, n);
    assert.equal((p.match(/class="res"/g) || []).length, n);
  }
  assert.match(Diagrams.series({ U: '<b>', R: ['1 Ω'] }), /&lt;b&gt;/, 'texti er kóðaður');
});

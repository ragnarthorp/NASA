/*
 * calc.js — þáttun talna, einingar, birting og útreikningar fyrir rað- og hliðtengingu.
 * Hreinar aðgerðir án DOM. Virkar bæði í vafra (window.Calc) og í Node (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Calc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- Einingar ---------- */
  // exp = veldi af tíu miðað við grunneiningu (V, A, Ω).
  const UNITS = {
    'V': { q: 'U', exp: 0 },
    'mV': { q: 'U', exp: -3 },
    'A': { q: 'I', exp: 0 },
    'mA': { q: 'I', exp: -3 },
    'µA': { q: 'I', exp: -6 },
    'Ω': { q: 'R', exp: 0 },
    'kΩ': { q: 'R', exp: 3 },
    'MΩ': { q: 'R', exp: 6 },
    'µV': { q: 'U', exp: -6 },
    'kV': { q: 'U', exp: 3 },
    'mΩ': { q: 'R', exp: -3 },
  };
  const BASE_UNIT = { U: 'V', I: 'A', R: 'Ω' };
  // Einingar sem nemandi getur valið í reitum.
  const INPUT_UNITS = { U: ['V'], I: ['A', 'mA'], R: ['Ω', 'kΩ'] };
  // Einingar með forskeytum í einingabreyti, frá minnstu til stærstu.
  const PREFIX_UNITS = { U: ['µV', 'mV', 'V', 'kV'], I: ['µA', 'mA', 'A'], R: ['mΩ', 'Ω', 'kΩ', 'MΩ'] };
  const PREFIXES = [
    { p: 'µ', name: 'míkró', text: 'milljónasti hluti (÷ 1.000.000)' },
    { p: 'm', name: 'millí', text: 'þúsundasti hluti (÷ 1000)' },
    { p: 'k', name: 'kíló', text: 'þúsund (× 1000)' },
    { p: 'M', name: 'mega', text: 'milljón (× 1.000.000)' },
  ];

  // Ráðum við innsláttargildi á þessu bili (í grunneiningu) svo útreikningar flæði ekki yfir.
  const MIN_INPUT = 1e-9;
  const MAX_INPUT = 1e12;

  function unitInfo(unit) {
    const u = UNITS[unit];
    if (!u) throw new Error('Óþekkt eining: ' + unit);
    return u;
  }
  // Margföldun/deiling með heiltöluveldi af tíu gefur nákvæmari niðurstöðu en að margfalda með 0,001.
  function toSI(value, unit) {
    const e = unitInfo(unit).exp;
    return e >= 0 ? value * Math.pow(10, e) : value / Math.pow(10, -e);
  }
  function fromSI(value, unit) {
    const e = unitInfo(unit).exp;
    return e >= 0 ? value / Math.pow(10, e) : value * Math.pow(10, -e);
  }

  /* ---------- Þáttun ---------- */
  const NUMBER_RE = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)(e[+-]?\d+)?$/i;

  function parseNumber(raw) {
    const original = raw == null ? '' : String(raw);
    const s = original.trim().replace(/[\s   ]/g, '').replace(/[−–]/g, '-');
    if (!s) return { ok: false, code: 'empty', message: 'Reiturinn er tómur. Sláðu inn tölu.' };
    if (/^[+-]?(inf|infinity|∞)$/i.test(s)) {
      return { ok: false, code: 'nonfinite', message: 'Óendanlegt gildi er ekki leyft. Sláðu inn venjulega tölu.' };
    }
    const seps = (s.match(/[.,]/g) || []).length;
    if (seps > 1) {
      return { ok: false, code: 'separators', message: 'Notaðu aðeins eitt tugabrotsmerki (kommu eða punkt) og engin þúsundaskil, t.d. 1500 eða 4,7.' };
    }
    if (!NUMBER_RE.test(s)) {
      return { ok: false, code: 'invalid', message: '„' + original.trim() + '“ er ekki tala. Notaðu tölustafi og kommu eða punkt sem tugabrotsmerki, t.d. 4,7.' };
    }
    const value = Number(s.replace(',', '.'));
    if (!Number.isFinite(value)) {
      return { ok: false, code: 'nonfinite', message: 'Talan er of stór til að hægt sé að reikna með henni.' };
    }
    let warning = null;
    const m = /^(\d{1,3})[.,](\d{3})$/.exec(s);
    if (m && m[1] !== '0') {
      warning = 'Túlkað sem ' + formatNumber(value) + ' (komma og punktur eru tugabrotsmerki). Ef þú áttir við ' + m[1] + m[2] + ', skrifaðu það án punkts eða kommu.';
    }
    return { ok: true, value: value, text: s, warning: warning };
  }

  const POSITIVE_REASON = {
    U: 'Í þessum reiknivélum þarf spenna spennugjafans að vera stærri en 0 V.',
    I: 'Í þessum reiknivélum þarf straumurinn að vera stærri en 0 A.',
    R: 'Viðnám þarf að vera stærra en 0 Ω. Viðnám upp á 0 Ω væri skammhlaup og neikvætt viðnám er ekki til í þessum námsþætti.',
  };

  /** Les jákvætt gildi í gefinni einingu og skilar því í grunneiningu (V, A eða Ω). */
  function parseQuantity(raw, unit) {
    const q = unitInfo(unit).q;
    const p = parseNumber(raw);
    if (!p.ok) return p;
    if (p.value <= 0) {
      return { ok: false, code: 'nonpositive', message: 'Gildið þarf að vera stærra en núll. ' + POSITIVE_REASON[q] };
    }
    const si = toSI(p.value, unit);
    if (!Number.isFinite(si) || si < MIN_INPUT || si > MAX_INPUT) {
      return {
        ok: false, code: 'range',
        message: 'Gildið er utan þess bils sem reiknivélin ræður við (frá ' + formatNumber(MIN_INPUT) + ' til ' + formatNumber(MAX_INPUT) + ' ' + BASE_UNIT[q] + ').',
      };
    }
    return { ok: true, value: si, input: p.value, unit: unit, warning: p.warning };
  }

  /* ---------- Birting ---------- */
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };

  /** Talan með allt að `sig` markverðum stöfum, íslensk tugabrotskomma, engin þúsundaskil. */
  function formatNumber(x, sig) {
    sig = sig || 6;
    if (!Number.isFinite(x)) throw new Error('formatNumber fékk ógilda tölu');
    if (x === 0) return '0';
    const ax = Math.abs(x);
    if (ax >= 1e7 || ax < 1e-4) return formatScientific(x, sig);
    // Námundað í `sig` markverða stafi; String() gefur venjulegan rithátt á þessu bili.
    const s = String(Number(x.toPrecision(sig)));
    if (/e/i.test(s)) return formatScientific(x, sig);
    return s.replace('.', ',');
  }
  function formatScientific(x, sig) {
    sig = sig || 6;
    const parts = x.toExponential(sig - 1).split('e');
    let mant = parts[0];
    if (mant.indexOf('.') >= 0) mant = mant.replace(/0+$/, '').replace(/\.$/, '');
    const exp = String(Number(parts[1])).split('').map(function (c) { return SUP[c] || c; }).join('');
    return mant.replace('.', ',') + ' · 10' + exp;
  }
  /** Er birta talan nákvæm eða námunduð? */
  function isRounded(x, sig) {
    return Math.abs(Number(x.toPrecision(sig || 6)) - x) > 1e-12 * Math.abs(x);
  }
  function eqSign(x, sig) { return isRounded(x, sig) ? '≈' : '='; }

  /** Velur hentugustu einingu svo smá gildi birtist aldrei sem 0. */
  function bestUnit(valueSI, q) {
    const a = Math.abs(valueSI);
    if (q === 'I') { if (a >= 1 || a === 0) return 'A'; if (a >= 1e-3) return 'mA'; return 'µA'; }
    if (q === 'U') { if (a >= 1 || a === 0) return 'V'; return 'mV'; }
    if (q === 'R') { if (a >= 1e6) return 'MΩ'; if (a >= 1e3) return 'kΩ'; return 'Ω'; }
    throw new Error('Óþekkt stærð: ' + q);
  }
  function formatIn(valueSI, unit, sig) {
    return formatNumber(fromSI(valueSI, unit), sig) + ' ' + unit;
  }
  function formatBest(valueSI, q, sig) {
    return formatIn(valueSI, bestUnit(valueSI, q), sig);
  }
  /** Grunneining (t.d. „0,04 A“) og hentug eining í sviga ef hún er önnur („= 40 mA“). */
  function formatBoth(valueSI, q, sig) {
    const base = BASE_UNIT[q];
    const best = bestUnit(valueSI, q);
    const a = Math.abs(valueSI);
    const baseOk = a === 0 || (a >= 1e-4 && a < 1e7);
    if (best === base) return formatIn(valueSI, base, sig);
    if (!baseOk) return formatIn(valueSI, best, sig);
    return formatIn(valueSI, base, sig) + ' (= ' + formatIn(valueSI, best, sig) + ')';
  }

  /* ---------- Útreikningar ---------- */
  function assertPositive(x, name) {
    if (typeof x !== 'number' || !Number.isFinite(x) || x <= 0) {
      throw new RangeError((name || 'Gildi') + ' þarf að vera endanleg tala stærri en núll.');
    }
  }
  function assertList(rs) {
    if (!Array.isArray(rs) || rs.length === 0) throw new RangeError('Það þarf a.m.k. eitt viðnám.');
    rs.forEach(function (r, i) { assertPositive(r, 'R' + (i + 1)); });
  }
  function finite(x) {
    if (!Number.isFinite(x)) throw new RangeError('Niðurstaðan varð ekki endanleg tala.');
    return x;
  }

  /** Lögmál Ohms. find = 'U' | 'I' | 'R'; known inniheldur hinar tvær í grunneiningum. */
  function ohm(find, known) {
    if (find === 'U') { assertPositive(known.I, 'I'); assertPositive(known.R, 'R'); return finite(known.I * known.R); }
    if (find === 'I') { assertPositive(known.U, 'U'); assertPositive(known.R, 'R'); return finite(known.U / known.R); }
    if (find === 'R') { assertPositive(known.U, 'U'); assertPositive(known.I, 'I'); return finite(known.U / known.I); }
    throw new Error('Óþekkt stærð: ' + find);
  }

  function seriesResistance(rs) {
    assertList(rs);
    return finite(rs.reduce(function (a, b) { return a + b; }, 0));
  }
  function parallelResistance(rs) {
    assertList(rs);
    const inv = rs.reduce(function (a, r) { return a + 1 / r; }, 0);
    return finite(1 / inv);
  }
  /** „Formúlan góða“ — aðeins fyrir nákvæmlega tvö viðnám. */
  function twoResistorParallel(r1, r2) {
    assertPositive(r1, 'R1'); assertPositive(r2, 'R2');
    return finite((r1 * r2) / (r1 + r2));
  }

  function series(U, rs) {
    assertPositive(U, 'U');
    const RH = seriesResistance(rs);
    const I = finite(U / RH);
    const drops = rs.map(function (r) { return finite(I * r); });
    const sumU = drops.reduce(function (a, b) { return a + b; }, 0);
    return { U: U, R: rs.slice(), RH: RH, I: I, drops: drops, sumU: sumU };
  }

  function parallel(U, rs) {
    assertPositive(U, 'U');
    assertList(rs);
    const invSum = rs.reduce(function (a, r) { return a + 1 / r; }, 0);
    const RH = finite(1 / invSum);
    const currents = rs.map(function (r) { return finite(U / r); });
    const IH = currents.reduce(function (a, b) { return a + b; }, 0);
    return {
      U: U, R: rs.slice(), invSum: invSum, RH: RH, currents: currents, IH: finite(IH),
      IHcheck: finite(U / RH),
      good: rs.length === 2 ? twoResistorParallel(rs[0], rs[1]) : null,
    };
  }

  /**
   * Einingabreytir: breytir gildi í allar einingar með forskeytum fyrir sömu stærð.
   * Skilar [{ unit, value, op }] þar sem op lýsir aðgerðinni, t.d. '× 1000' eða '÷ 1000'.
   */
  function convertAll(value, unit) {
    const from = unitInfo(unit);
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new RangeError('Gildið þarf að vera endanleg tala.');
    return PREFIX_UNITS[from.q].map(function (u) {
      const d = from.exp - unitInfo(u).exp;
      const factor = formatNumber(Math.pow(10, Math.abs(d))).replace(/^(\d)(\d{3})(\d{3})$/, '$1.$2.$3');
      return {
        unit: u,
        value: d >= 0 ? value * Math.pow(10, d) : value / Math.pow(10, -d),
        op: d === 0 ? '' : (d > 0 ? '× ' : '÷ ') + factor,
      };
    });
  }

  /** Hlutfallslegt frávik, notað í sannprófun. */
  function relDiff(a, b) {
    const d = Math.abs(a - b);
    const m = Math.max(Math.abs(a), Math.abs(b));
    return m === 0 ? 0 : d / m;
  }

  /** Les t.d. „2,2 kΩ“ eða „20 mA“ í { value (grunneining), q, unit, input }. */
  function quantity(text) {
    const m = /^\s*([^\s]+)\s*(\S+)\s*$/.exec(text);
    if (!m) throw new Error('Ólæsilegt magn: ' + text);
    const unit = m[2];
    const p = parseNumber(m[1]);
    if (!p.ok) throw new Error('Ólæsilegt magn: ' + text);
    return { value: toSI(p.value, unit), q: unitInfo(unit).q, unit: unit, input: p.value };
  }

  return {
    UNITS: UNITS, BASE_UNIT: BASE_UNIT, INPUT_UNITS: INPUT_UNITS, PREFIX_UNITS: PREFIX_UNITS, PREFIXES: PREFIXES, convertAll: convertAll, MIN_INPUT: MIN_INPUT, MAX_INPUT: MAX_INPUT,
    unitInfo: unitInfo, toSI: toSI, fromSI: fromSI,
    parseNumber: parseNumber, parseQuantity: parseQuantity, quantity: quantity,
    formatNumber: formatNumber, formatScientific: formatScientific, isRounded: isRounded, eqSign: eqSign,
    bestUnit: bestUnit, formatIn: formatIn, formatBest: formatBest, formatBoth: formatBoth,
    ohm: ohm, seriesResistance: seriesResistance, parallelResistance: parallelResistance,
    twoResistorParallel: twoResistorParallel, series: series, parallel: parallel, relDiff: relDiff,
  };
});

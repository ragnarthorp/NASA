/*
 * diagrams.js — SVG-tengimyndir fyrir rað- og hliðtengingu (IEC-tákn: viðnám sem rétthyrningur).
 * Aðgerðirnar skila SVG-streng. Merkingar eru gefnar sem tilbúnir textar (t.d. „100 Ω“ eða „?“).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Diagrams = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  /** Texti með undirskrift: label(x, y, 'R', '1', ' = 100 Ω'). */
  function label(x, y, base, sub, rest, opts) {
    opts = opts || {};
    const anchor = opts.anchor || 'middle';
    const cls = opts.cls || 'lbl';
    let t = '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" class="' + cls + '">' +
      '<tspan font-style="italic">' + esc(base) + '</tspan>';
    if (sub) t += '<tspan dy="5" font-size="11">' + esc(sub) + '</tspan><tspan dy="-5">' + esc(rest || '') + '</tspan>';
    else t += esc(rest || '');
    return t + '</text>';
  }
  function plain(x, y, text, opts) {
    opts = opts || {};
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (opts.anchor || 'middle') + '" class="' + (opts.cls || 'val') + '">' + esc(text) + '</text>';
  }
  function hRes(cx, y) { return '<rect class="res" x="' + (cx - 32) + '" y="' + (y - 12) + '" width="64" height="24" rx="2"/>'; }
  function vRes(x, cy) { return '<rect class="res" x="' + (x - 12) + '" y="' + (cy - 32) + '" width="24" height="64" rx="2"/>'; }
  function arrow(x, y, dir) {
    // Lítil fyllt ör sem bendir í straumstefnu.
    const s = 7;
    let pts;
    if (dir === 'right') pts = [[x + s, y], [x - s, y - s], [x - s, y + s]];
    else if (dir === 'left') pts = [[x - s, y], [x + s, y - s], [x + s, y + s]];
    else if (dir === 'down') pts = [[x, y + s], [x - s, y - s], [x + s, y - s]];
    else pts = [[x, y - s], [x - s, y + s], [x + s, y + s]];
    return '<polygon class="arrow" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/>';
  }
  function battery(x, yc) {
    return '<line class="w" x1="' + (x - 22) + '" y1="' + (yc - 7) + '" x2="' + (x + 22) + '" y2="' + (yc - 7) + '"/>' +
      '<line class="w thick" x1="' + (x - 11) + '" y1="' + (yc + 7) + '" x2="' + (x + 11) + '" y2="' + (yc + 7) + '"/>' +
      plain(x - 30, yc - 10, '+', { cls: 'pol' }) + plain(x - 30, yc + 22, '−', { cls: 'pol' });
  }
  function svgOpen(w, h, aria) {
    const minW = Math.round(Math.min(w, 560) * 0.62);
    return '<svg class="circuit" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
      '" style="max-width:100%;height:auto;min-width:' + minW + 'px" role="img" aria-label="' + esc(aria) + '"><title>' + esc(aria) + '</title>';
  }
  function eqText(v) { return v === '' || v == null ? '' : ' = ' + v; }
  function describe(kind, o) {
    const names = o.R.map(function (v, i) { return 'R' + (i + 1) + eqText(v); });
    const head = kind === 'series' ? (o.R.length === 1 ? 'Einföld rás: spennugjafi og eitt viðnám. ' : 'Raðtenging: ' + o.R.length + ' viðnám á sömu leið. ')
      : 'Hliðtenging: ' + o.R.length + ' viðnám, hvert í sinni grein. ';
    let s = head + 'Spennugjafi UH' + eqText(o.U) + '. ' + names.join(', ') + '.';
    if (o.I) s += ' Straumur I' + (kind === 'series' && o.R.length === 1 ? '' : 'H') + ' = ' + o.I + '.';
    if (o.drops) s += ' Spennuföll: ' + o.drops.map(function (d, i) { return 'U' + (i + 1) + ' = ' + d; }).join(', ') + '.';
    if (o.currents) s += ' Greinastraumar: ' + o.currents.map(function (d, i) { return 'I' + (i + 1) + ' = ' + d; }).join(', ') + '.';
    return s;
  }

  /**
   * Raðtenging. o = { U: '12 V', R: ['100 Ω', …], drops?: ['4 V', …], I?: '40 mA', single?: bool }
   * Fleiri en þrjú viðnám dreifast á efri og neðri vír svo myndin haldist þétt.
   */
  function series(o) {
    const n = o.R.length;
    const top = n <= 3 ? n : Math.ceil(n / 2);
    const bottom = n - top;
    const slot = 135, x0 = 60, yT = 70, yB = 240, yc = 155;
    const xr = x0 + 100 + (top - 1) * slot + 100;
    const W = xr + 125, H = 300;
    const single = n === 1;
    let s = svgOpen(W, H, o.aria || describe('series', o));
    s += '<path class="w" d="M' + x0 + ' ' + (yc - 7) + ' V' + yT + ' H' + xr + ' V' + yB + ' H' + x0 + ' V' + (yc + 7) + '"/>';
    s += battery(x0, yc);
    s += label(x0 + 26, yc - 4, 'U', single ? '' : 'H', single ? '' : '', { anchor: 'start', cls: 'lbl strong' });
    s += plain(x0 + 26, yc + 16, o.U, { anchor: 'start', cls: 'val' });
    for (let i = 0; i < n; i++) {
      const onTop = i < top;
      const cx = onTop ? x0 + 100 + i * slot : xr - 100 - (i - top) * slot;
      const y = onTop ? yT : yB;
      s += hRes(cx, y);
      const nameY = onTop ? yT - 22 : yB + 40;
      s += label(cx, nameY, 'R', single ? '' : String(i + 1), eqText(o.R[i]), { cls: 'lbl' });
      if (o.drops && o.drops[i] != null) {
        s += label(cx, onTop ? yT + 36 : yB - 24, 'U', single ? '' : String(i + 1), eqText(o.drops[i]), { cls: 'lbl drop' });
      }
    }
    if (o.I !== undefined && o.I !== null) {
      s += arrow(xr, yc, 'down');
      s += label(xr + 14, yc - 4, 'I', single ? '' : 'H', '', { anchor: 'start', cls: 'lbl cur' });
      s += plain(xr + 14, yc + 16, o.I, { anchor: 'start', cls: 'val cur' });
    }
    return s + '</svg>';
  }

  /** Hliðtenging. o = { U, R: [...], currents?: [...], I?: heildarstraumur } */
  function parallel(o) {
    const n = o.R.length;
    const x0 = 100, yT = 60, yB = 250, yc = 155, gap = 140;
    const bx = function (i) { return x0 + 125 + i * gap; };
    const last = bx(n - 1);
    const W = last + 118, H = 290;
    let s = svgOpen(W, H, o.aria || describe('parallel', o));
    s += '<path class="w" d="M' + x0 + ' ' + (yc - 7) + ' V' + yT + ' H' + last + ' V' + yB + ' H' + x0 + ' V' + (yc + 7) + '"/>';
    s += battery(x0, yc);
    s += label(x0 - 30, yc - 30, 'U', 'H', '', { anchor: 'end', cls: 'lbl strong' });
    s += plain(x0 - 30, yc + 52, o.U, { anchor: 'end', cls: 'val' });
    for (let i = 0; i < n; i++) {
      const x = bx(i);
      if (i < n - 1) {
        s += '<line class="w" x1="' + x + '" y1="' + yT + '" x2="' + x + '" y2="' + yB + '"/>';
        s += '<circle class="dot" cx="' + x + '" cy="' + yT + '" r="4.5"/><circle class="dot" cx="' + x + '" cy="' + yB + '" r="4.5"/>';
      }
      s += vRes(x, yc);
      s += label(x + 20, yc - 6, 'R', String(i + 1), '', { anchor: 'start', cls: 'lbl' });
      s += plain(x + 20, yc + 14, o.R[i], { anchor: 'start', cls: 'val' });
      if (o.currents && o.currents[i] != null) {
        s += arrow(x, yT + 42, 'down');
        s += label(x + 14, yT + 34, 'I', String(i + 1), eqText(o.currents[i]), { anchor: 'start', cls: 'lbl cur' });
      }
    }
    if (o.I !== undefined && o.I !== null) {
      s += arrow(x0 + 62, yT, 'right');
      s += label(x0 + 62, yT - 14, 'I', 'H', eqText(o.I), { cls: 'lbl cur' });
    }
    return s + '</svg>';
  }

  return { series: series, parallel: parallel, esc: esc };
});

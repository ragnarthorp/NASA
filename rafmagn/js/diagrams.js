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

  /* ---------- Blönduð tenging ---------- */
  // Hnútar: { R, name } (mótstaða), { s: [...] } (raðtengt), { p: [...] } (hliðtengt).
  function measure(node) {
    if (node.R !== undefined || node.name !== undefined && !node.s && !node.p) return { w: 116, h: 64, port: 42 };
    const kids = (node.s || node.p).map(measure);
    if (node.s) {
      const port = Math.max.apply(null, kids.map(function (k) { return k.port; }));
      const h = Math.max.apply(null, kids.map(function (k) { return port - k.port + k.h; }));
      return { w: kids.reduce(function (a, k) { return a + k.w; }, 0), h: h, port: port, kids: kids };
    }
    const W = Math.max.apply(null, kids.map(function (k) { return k.w; }));
    let y = 0; const ys = [];
    kids.forEach(function (k) { ys.push(y); y += k.h + 10; });
    return { w: W + 44, h: y - 10, port: kids[0].port, kids: kids, ys: ys, inner: W };
  }
  function drawNode(node, m, x, y, labels) {
    let s = '';
    if (!node.s && !node.p) {
      const py = y + m.port;
      s += '<line class="w" x1="' + x + '" y1="' + py + '" x2="' + (x + m.w) + '" y2="' + py + '"/>';
      s += hRes(x + m.w / 2, py);
      const val = labels && labels[node.name] != null ? labels[node.name] : '';
      s += label(x + m.w / 2, py - 20, 'R', String(node.name), eqText(val), { cls: 'lbl' });
      return s;
    }
    if (node.s) {
      let cx = x;
      node.s.forEach(function (c, i) {
        const k = m.kids[i];
        s += drawNode(c, k, cx, y + m.port - k.port, labels);
        cx += k.w;
      });
      return s;
    }
    const L = x + 12, Rr = x + m.w - 12;
    const ports = m.kids.map(function (k, i) { return y + m.ys[i] + k.port; });
    const last = ports[ports.length - 1];
    s += '<line class="w" x1="' + x + '" y1="' + ports[0] + '" x2="' + L + '" y2="' + ports[0] + '"/>';
    s += '<line class="w" x1="' + Rr + '" y1="' + ports[0] + '" x2="' + (x + m.w) + '" y2="' + ports[0] + '"/>';
    s += '<line class="w" x1="' + L + '" y1="' + ports[0] + '" x2="' + L + '" y2="' + last + '"/>';
    s += '<line class="w" x1="' + Rr + '" y1="' + ports[0] + '" x2="' + Rr + '" y2="' + last + '"/>';
    node.p.forEach(function (c, i) {
      const k = m.kids[i];
      const bx = x + 22;
      const py = ports[i];
      s += '<line class="w" x1="' + L + '" y1="' + py + '" x2="' + bx + '" y2="' + py + '"/>';
      s += drawNode(c, k, bx, y + m.ys[i], labels);
      s += '<line class="w" x1="' + (bx + k.w) + '" y1="' + py + '" x2="' + Rr + '" y2="' + py + '"/>';
      if (i < node.p.length - 1) s += '<circle class="dot" cx="' + L + '" cy="' + py + '" r="4"/><circle class="dot" cx="' + Rr + '" cy="' + py + '" r="4"/>';
    });
    return s;
  }
  function treeText(node) {
    if (!node.s && !node.p) return 'R' + node.name;
    return '(' + (node.s || node.p).map(treeText).join(node.s ? ' raðtengt við ' : ' hliðtengt við ') + ')';
  }
  /** Blönduð tenging. o = { U: '9 V', tree, labels: { '1': '20 Ω', … }, I?: heildarstraumur } */
  function network(o) {
    const m = measure(o.tree);
    const xb = 78, x0 = 118, y0 = 16;
    const py = y0 + m.port;
    const yb = y0 + m.h + 34;
    const xr = x0 + m.w + 22;
    const W = xr + 100, H = yb + 18;
    const yc = (py + yb) / 2;
    const aria = o.aria || ('Blönduð tenging: ' + treeText(o.tree) + '. Spennugjafi UH' + eqText(o.U) + '. ' +
      Object.keys(o.labels || {}).map(function (k) { return 'R' + k + eqText(o.labels[k]); }).join(', ') + '.');
    let s = svgOpen(W, H, aria);
    s += '<path class="w" d="M' + xb + ' ' + (yc - 7) + ' V' + py + ' H' + x0 + ' M' + (x0 + m.w) + ' ' + py + ' H' + xr + ' V' + yb + ' H' + xb + ' V' + (yc + 7) + '"/>';
    s += drawNode(o.tree, m, x0, y0, o.labels);
    s += battery(xb, yc);
    s += label(xb - 30, yc - 30, 'U', 'H', '', { anchor: 'end', cls: 'lbl strong' });
    s += plain(xb - 30, yc + 52, o.U || '', { anchor: 'end', cls: 'val' });
    if (o.I !== undefined && o.I !== null) {
      s += arrow(xr, yc, 'down');
      s += label(xr + 14, yc - 4, 'I', 'H', '', { anchor: 'start', cls: 'lbl cur' });
      s += plain(xr + 14, yc + 16, o.I, { anchor: 'start', cls: 'val cur' });
    }
    return s + '</svg>';
  }

  return { series: series, parallel: parallel, network: network, esc: esc };
});

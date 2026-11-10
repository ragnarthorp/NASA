/* PDF-útflutningur með jsPDF (vendor/jspdf.umd.min.js) og innfelldu Unicode-letri (vendor/pdf-fonts.js:
   hlutmengi úr Liberation Sans – íslenskir stafir, grísk tákn, ², ₁, −, ·, →, ≈ …).
   Formúlur eru teiknaðar sem vektor: brot með striki, lágletur og hátt letur.
   Sami kóði keyrir í vafra (persónulegar glósur) og í Node (tools/build-pdfs.js býr til forútbúnu skrárnar). */
(function (G) {
  const RF = (G.RF = G.RF || {});
  const U = RF.util;
  const g = U.fmt, f = U.fmtS;
  const PT = 0.3528; // mm á hvert punkt
  const A4 = { w: 210, h: 297 };
  const INK = '#14202b', MUTED = '#55636f', LINE = '#c9d3dc';

  /* ---------- hleðsla ---------- */
  let fontsPromise = null;
  function loadFonts() {
    if (G.NASA_PDF_FONTS) return Promise.resolve(true);
    if (!fontsPromise) fontsPromise = new Promise((ok, bad) => {
      const s = document.createElement('script');
      s.src = 'vendor/pdf-fonts.js';
      s.onload = () => (G.NASA_PDF_FONTS ? ok(true) : bad(new Error('Leturgerð fannst ekki.')));
      s.onerror = () => bad(new Error('Gat ekki hlaðið leturgerð fyrir PDF.'));
      document.head.appendChild(s);
    });
    return fontsPromise;
  }
  function jsPDFCtor() {
    const J = (G.jspdf && G.jspdf.jsPDF) || RF._jsPDF;
    if (!J) throw new Error('PDF-safnið (jsPDF) hlóðst ekki.');
    return J;
  }
  function newDoc(title) {
    const J = jsPDFCtor();
    const doc = new J({ unit: 'mm', format: 'a4', compress: true });
    const F = G.NASA_PDF_FONTS;
    for (const st of ['normal', 'bold', 'italic', 'bolditalic']) { doc.addFileToVFS('rf-' + st + '.ttf', F[st]); doc.addFont('rf-' + st + '.ttf', 'RFSans', st); }
    doc.setFont('RFSans', 'normal');
    doc.setProperties({ title: title || 'Rafmagnsfræði 1', subject: 'Prófundirbúningur – rafleiðarar, viðnám og spennufall', creator: 'Prófundirbúningur – Rafmagnsfræði 1' });
    doc.setLineJoin('round');
    return doc;
  }
  let measureDoc = null;
  const mdoc = () => (measureDoc = measureDoc || newDoc());

  /* Tákn sem leturgerðin hefur ekki */
  const clean = (s) => String(s).replace(/⇒/g, '→').replace(/[✓✔]/g, '').replace(/★/g, '').replace(/⁺/g, '+').replace(/⁻/g, '−').replace(/ /g, ' ');

  /* ---------- formúlur og texti ---------- */
  const setF = (doc, style, size) => { doc.setFont('RFSans', style); doc.setFontSize(size); };
  function resolveBold(nodes) {
    let b = false;
    const out = [];
    nodes.forEach((n) => {
      if (n.t !== 'txt') { out.push({ ...n, b }); return; }
      n.v.split('**').forEach((seg, i) => { if (i > 0) b = !b; if (seg) out.push({ t: 'txt', v: seg, b }); });
    });
    return out;
  }
  function layout(doc, nodes, size, bold, italic) {
    const items = [];
    let x = 0, a = size * PT * 0.74, d = size * PT * 0.22;
    for (const n of nodes) {
      const B = n.b !== undefined ? n.b : bold;
      if (n.t === 'txt') {
        const style = B ? (italic ? 'bolditalic' : 'bold') : italic ? 'italic' : 'normal';
        setF(doc, style, size);
        const w = doc.getTextWidth(n.v);
        items.push({ x, k: 't', s: n.v, style, size });
        x += w;
      } else if (n.t === 'sub' || n.t === 'sup') {
        const b = layout(doc, n.v, size * 0.7, B, italic);
        const dy = n.t === 'sub' ? size * PT * 0.24 : -size * PT * 0.36;
        items.push({ x, k: 'b', b, dy });
        x += b.w + 0.15;
        a = Math.max(a, b.a - dy);
        d = Math.max(d, b.d + dy);
      } else {
        const nb = layout(doc, n.n, size * 0.9, B, italic), db = layout(doc, n.d, size * 0.9, B, italic);
        const pad = size * PT * 0.18, axis = size * PT * 0.27, gap = size * PT * 0.17;
        const w = Math.max(nb.w, db.w) + 2 * pad;
        items.push({ x: x + 0.3, k: 'f', nb, db, w, axis, gap });
        x += w + 0.6;
        a = Math.max(a, axis + gap + nb.d + nb.a);
        d = Math.max(d, gap + db.a + db.d - axis);
      }
    }
    return { w: x, a, d, items };
  }
  function draw(doc, box, x0, y0, color) {
    for (const it of box.items) {
      if (it.k === 't') { setF(doc, it.style, it.size); doc.setTextColor(color || INK); doc.text(it.s, x0 + it.x, y0); }
      else if (it.k === 'b') draw(doc, it.b, x0 + it.x, y0 + it.dy, color);
      else {
        draw(doc, it.nb, x0 + it.x + (it.w - it.nb.w) / 2, y0 - it.axis - it.gap - it.nb.d, color);
        doc.setDrawColor(color || INK);
        doc.setLineWidth(0.22);
        doc.line(x0 + it.x, y0 - it.axis, x0 + it.x + it.w, y0 - it.axis);
        draw(doc, it.db, x0 + it.x + (it.w - it.db.w) / 2, y0 - it.axis + it.gap + it.db.a, color);
      }
    }
  }
  const mathBox = (doc, src, size, bold, italic) => layout(doc, resolveBold(U.parseMath(clean(src))), size, bold, italic);

  /* Brýtur ríkan texta (með formúlum) í línur */
  function wrapRich(doc, src, size, maxW, bold, italic) {
    const nodes = resolveBold(U.parseMath(clean(src)));
    const words = [];
    let cur = null;
    const push = () => { if (cur && cur.length) words.push(cur); cur = null; };
    for (const n of nodes) {
      if (n.t === 'txt') {
        const parts = n.v.split(/( +)/);
        parts.forEach((p, i) => {
          if (/^ +$/.test(p)) { push(); return; }
          if (!p) return;
          if (!cur) cur = [];
          cur.push({ ...n, v: p });
        });
      } else { if (!cur) cur = []; cur.push(n); }
    }
    push();
    const lines = [];
    let line = [];
    let lw = 0;
    setF(doc, bold ? 'bold' : 'normal', size);
    const sp = doc.getTextWidth(' ');
    for (const w of words) {
      const b = layout(doc, w, size, bold, italic);
      if (line.length && lw + sp + b.w > maxW) { lines.push(line); line = []; lw = 0; }
      if (line.length) { line.push({ t: 'txt', v: ' ', b: w[0].b }); lw += sp; }
      line.push(...w);
      lw += b.w;
    }
    if (line.length) lines.push(line);
    return lines.map((ln) => layout(doc, ln, size, bold, italic));
  }

  /* ---------- blokkir ---------- */
  const hex = (c) => c;
  function famColor(fam) { return RF.families[fam].color; }
  function lighten(hexc, k) { const n = parseInt(hexc.slice(1), 16); const r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255; const L = (v) => Math.round(v + (255 - v) * k); return '#' + [L(r), L(gg), L(b)].map((v) => v.toString(16).padStart(2, '0')).join(''); }

  /* Málsgrein: { src, size, bold, color, indent, bullet, gapAfter } */
  function Para(o) {
    return {
      measure(doc, w, s) { this.lines = wrapRich(doc, o.src, (o.size || 8.6) * s, w - (o.indent || 0) * s - (o.bullet ? 3 * s : 0), o.bold, o.italic); this.lh = this.lines.map((l) => l.a + l.d + 0.55 * s); return this.lh.reduce((a, b) => a + b, 0) + (o.gapAfter ?? 0.6) * s; },
      draw(doc, x, y, w, s) {
        let yy = y;
        const ix = x + (o.indent || 0) * s + (o.bullet ? 3 * s : 0);
        this.lines.forEach((l, i) => {
          yy += l.a;
          if (o.bullet && i === 0) { doc.setFillColor(o.bulletColor || MUTED); doc.circle(x + (o.indent || 0) * s + 1.1 * s, yy - l.a * 0.38, 0.55 * s, 'F'); }
          draw(doc, l, ix, yy, o.color);
          yy += l.d + 0.55 * s;
        });
      },
    };
  }
  /* Fyrirsögn hluta með litaðri línu */
  function Head(text, fam, o = {}) {
    return {
      keep: true,
      measure(doc, w, s) { return (o.size || 10.5) * s * PT + 3.4 * s; },
      draw(doc, x, y, w, s) {
        const col = fam ? famColor(fam) : '#1b3a57';
        setF(doc, 'bold', (o.size || 10.5) * s);
        doc.setTextColor(col);
        doc.text(clean(text), x, y + (o.size || 10.5) * s * PT * 0.8 + 0.6 * s);
        doc.setDrawColor(col);
        doc.setLineWidth(0.5 * s);
        doc.line(x, y + (o.size || 10.5) * s * PT + 1.5 * s, x + w, y + (o.size || 10.5) * s * PT + 1.5 * s);
      },
    };
  }
  /* Ein formúla, minnkuð ef hún er of breið */
  function Formula(src, o = {}) {
    return {
      measure(doc, w, s) { let size = (o.size || 11) * s; let b = mathBox(doc, src, size); if (b.w > w - 2 * s) { size *= (w - 2 * s) / b.w; b = mathBox(doc, src, size); } this.b = b; return b.a + b.d + (o.gap ?? 1.2) * s; },
      draw(doc, x, y, w, s) { const b = this.b; draw(doc, b, x + (o.center ? (w - b.w) / 2 : (o.indent || 0) * s), y + b.a + 0.3 * s, o.color); },
    };
  }
  function Gap(mm) { return { measure: (doc, w, s) => mm * s, draw() {} }; }
  function Break() { return { pagebreak: true, measure: () => 0, draw() {} }; }
  function ColBreak() { return { colbreak: true, measure: () => 0, draw() {} }; }

  /* Tafla: rows = [[cell, …]], cells eru ríkur texti. cols = hlutföll breidda. */
  function Table(rows, cols, o = {}) {
    return {
      measure(doc, w, s) {
        const size = (o.size || 8) * s;
        const tot = cols.reduce((a, b) => a + b, 0);
        this.cw = cols.map((c) => (c / tot) * w);
        this.rows = rows.map((r, ri) => { const cells = r.map((c, ci) => wrapRich(doc, String(c), size, this.cw[ci] - 1.6 * s, ri === 0 && o.header !== false)); const hgt = Math.max(...cells.map((ls) => ls.reduce((a, l) => a + l.a + l.d + 0.35 * s, 0))) + 1.1 * s; return { cells, hgt }; });
        return this.rows.reduce((a, r) => a + r.hgt, 0) + (o.gapAfter ?? 1.4) * s;
      },
      draw(doc, x, y, w, s) {
        let yy = y;
        this.rows.forEach((r, ri) => {
          if (ri === 0 && o.header !== false) { doc.setFillColor(o.headFill || '#e8eef4'); doc.rect(x, yy, w, r.hgt, 'F'); }
          else if (o.zebra && ri % 2 === 0) { doc.setFillColor('#f5f8fa'); doc.rect(x, yy, w, r.hgt, 'F'); }
          if (o.rowColor && o.rowColor[ri]) { doc.setFillColor(lighten(o.rowColor[ri], 0.85)); doc.rect(x, yy, w, r.hgt, 'F'); }
          let xx = x;
          r.cells.forEach((ls, ci) => { let ly = yy + 0.55 * s; ls.forEach((l) => { ly += l.a; draw(doc, l, xx + 0.8 * s, ly, ri === 0 && o.header !== false ? '#1b3a57' : INK); ly += l.d + 0.35 * s; }); xx += this.cw[ci]; });
          doc.setDrawColor(LINE); doc.setLineWidth(0.15);
          doc.line(x, yy + r.hgt, x + w, yy + r.hgt);
          yy += r.hgt;
        });
      },
    };
  }

  /* Litað kassasvæði utan um aðrar blokkir */
  function Box(children, o = {}) {
    return {
      measure(doc, w, s) {
        const pad = (o.pad ?? 1.6) * s;
        this.pad = pad;
        this.hh = o.title ? 5.4 * s : 0;
        this.ch = children.map((c) => c.measure(doc, w - 2 * pad, s));
        return this.hh + pad + this.ch.reduce((a, b) => a + b, 0) + pad * 0.6 + (o.gapAfter ?? 2) * s;
      },
      draw(doc, x, y, w, s) {
        const col = o.color || '#1b3a57';
        const hgt = this.hh + this.pad + this.ch.reduce((a, b) => a + b, 0) + this.pad * 0.6;
        doc.setFillColor(o.fill || lighten(col, 0.93));
        doc.setDrawColor(col);
        doc.setLineWidth((o.star ? 0.7 : 0.3) * s);
        doc.roundedRect(x, y, w, hgt, 1.6 * s, 1.6 * s, 'FD');
        if (o.title) {
          doc.setFillColor(col);
          doc.roundedRect(x, y, w, this.hh, 1.6 * s, 1.6 * s, 'F');
          doc.rect(x, y + this.hh - 1.6 * s, w, 1.6 * s, 'F');
          let tx = x + 1.6 * s;
          if (o.num != null) {
            doc.setFillColor('#ffffff');
            doc.circle(x + 3.6 * s, y + this.hh / 2, 2.15 * s, 'F');
            setF(doc, 'bold', 8.6 * s);
            doc.setTextColor(col);
            const nw = doc.getTextWidth(String(o.num));
            doc.text(String(o.num), x + 3.6 * s - nw / 2, y + this.hh / 2 + 1.05 * s);
            tx = x + 6.6 * s;
          }
          const avail = x + w - tx - (o.star ? 6 : 1.4) * s;
          let tsz = 8.6 * s, tb = mathBox(doc, o.title, tsz, true);
          if (tb.w > avail) { tsz *= avail / tb.w; tb = mathBox(doc, o.title, tsz, true); }
          draw(doc, tb, tx, y + this.hh / 2 + tsz * PT * 0.36, '#ffffff');
          if (o.star) drawStar(doc, x + w - 3.4 * s, y + this.hh / 2, 1.9 * s, '#ffd447');
        }
        let yy = y + this.hh + this.pad;
        children.forEach((c, i) => { c.draw(doc, x + this.pad, yy, w - 2 * this.pad, s); yy += this.ch[i]; });
      },
    };
  }
  function drawStar(doc, cx, cy, r, color) {
    const pts = [];
    for (let i = 0; i < 10; i++) { const ang = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.45 : r; pts.push([cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]); }
    const lines = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    doc.setFillColor(color);
    doc.lines(lines, pts[0][0], pts[0][1], [1, 1], 'F', true);
  }

  /* Tengimynd tvíleiðara */
  function TwoWire(o = {}) {
    return {
      measure: (doc, w, s) => 24 * s,
      draw(doc, x, y, w, s) {
        const cx = x + 6 * s, cy = y + 11 * s, R = 4.2 * s, xr = x + w - 6 * s;
        doc.setDrawColor(INK); doc.setLineWidth(0.3 * s);
        doc.circle(cx, cy, R, 'S');
        setF(doc, 'normal', 9 * s); doc.setTextColor(INK); doc.text('~', cx - 1.2 * s, cy + 1.2 * s);
        doc.setDrawColor('#b8692f'); doc.setLineWidth(0.9 * s);
        doc.line(cx, y + 4 * s, xr, y + 4 * s); doc.line(cx, y + 18 * s, xr, y + 18 * s);
        doc.setDrawColor(INK); doc.setLineWidth(0.3 * s);
        doc.line(cx, y + 4 * s, cx, cy - R); doc.line(cx, y + 18 * s, cx, cy + R);
        doc.rect(xr - 1.8 * s, cy - 4 * s, 3.6 * s, 8 * s, 'S');
        doc.line(xr, y + 4 * s, xr, cy - 4 * s); doc.line(xr, cy + 4 * s, xr, y + 18 * s);
        const T = (t, tx, ty, col, sz) => { const b = mathBox(doc, t, (sz || 7.4) * s); draw(doc, b, tx - b.w / 2, ty, col); };
        T('fram: l →', x + w / 2, y + 2.6 * s, '#0b7a70');
        T('← til baka: l', x + w / 2, y + 22.6 * s, '#0b7a70');
        T('U_1', cx + R + 3 * s, cy + 1 * s, INK, 7);
        T('U_2', xr - 4.6 * s, cy + 1 * s, INK, 7);
        T('**Leið straumsins = 2·l**', x + w / 2, cy + 1.2 * s, '#0b7a70', 8);
      },
    };
  }

  /* Aðferðaspjald */
  function MethodCard(m, o = {}) {
    const fam = m.fam, col = famColor(fam);
    const kids = [Formula(m.formula, { size: o.fsize || 11.5, gap: 0.8 })];
    const altN = o.compact ? Math.min(m.alt.length, 2) : m.alt.length;
    m.alt.slice(0, altN).forEach((a) => {
      const ix = a.indexOf(':');
      if (ix > 0 && ix < 40 && a.slice(ix + 1).includes('=')) { kids.push(Para({ src: a.slice(0, ix + 1), size: 7.2, color: MUTED, gapAfter: 0.1 })); kids.push(Formula(a.slice(ix + 1).trim(), { size: (o.fsize || 11.5) * 0.85, gap: 0.6, indent: 2 })); }
      else kids.push(a.includes('=') ? Formula(a, { size: (o.fsize || 11.5) * 0.85, gap: 0.6 }) : Para({ src: a, size: 7.6, color: MUTED }));
    });
    kids.push(Para({ src: '**Þarf:** ' + m.needs, size: 7.6, gapAfter: 0.4 }));
    if (o.steps) m.steps.forEach((st, i) => kids.push(Para({ src: (i + 1) + '. ' + st, size: 7.4, gapAfter: 0.15 })));
    if (o.example) kids.push(Para({ src: '**Dæmi:** ' + m.example, size: 7.6, gapAfter: 0.4 }));
    if (o.traps) kids.push(Para({ src: '**Varastu:** ' + m.mistakes.join(' · '), size: 7.4, color: '#8a2a12', gapAfter: 0.2 }));
    if (o.comment) kids.push(Para({ src: '**Mín athugasemd:** ' + o.comment, size: 7.8, italic: true, color: '#5a4300', gapAfter: 0.2 }));
    return Box(kids, { title: 'Ég á að finna: ' + m.find, num: m.id, color: col, star: o.star, gapAfter: o.gapAfter ?? 1.8, fill: o.star ? '#fffbea' : undefined });
  }

  const matTable = (size) => Table([['Efni', 'ρ (Ω·mm²/m)', 'α (1/°C)'], ...['silfur', 'kopar', 'gull', 'al', 'volfram', 'nikkel', 'platina', 'jarn', 'manganin', 'konstantan', 'kromnikkel'].map((k) => { const m = RF.mat(k); return [(m.src === 'kennari' ? '**' + m.name + '**' : m.name + '*'), g(m.rho, 5), m.alpha >= 0.001 ? (m.srcA === 'kennari' ? '**' + g(m.alpha, 5) + '**' : g(m.alpha, 5) + '*') : '≈ 0']; })], [1.5, 1.1, 0.9], { size: size || 7.4, zebra: true, gapAfter: 0.6 });

  /* ---------- flæði á síður ---------- */
  function flow(doc, blocks, cfg, s, drawIt) {
    const M = cfg.margin, top = M + (cfg.headH || 0), bottom = A4.h - M - 5;
    const colW = (A4.w - 2 * M - (cfg.cols - 1) * cfg.gap) / cfg.cols;
    let page = 0, col = 0, y = top, overflow = false;
    const startPage = () => { if (drawIt) { if (page > 0) doc.addPage(); } };
    startPage();
    const nextCol = () => { col++; y = top; if (col >= cfg.cols) { col = 0; page++; startPage(); } };
    const placed = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.pagebreak) { if (col !== 0 || y !== top) { col = cfg.cols; nextCol(); } continue; }
      if (b.colbreak) { if (y !== top) nextCol(); continue; }
      let hgt = b.measure(doc, colW, s);
      // fyrirsögn má ekki standa ein neðst
      let need = hgt;
      if (b.keep && blocks[i + 1] && !blocks[i + 1].pagebreak) { const nh = blocks[i + 1].measure(doc, colW, s); need += nh < (bottom - top) * 0.5 ? nh : 30; }
      if (y + need > bottom && y > top) { nextCol(); hgt = b.measure(doc, colW, s); }
      if (y + hgt > bottom) overflow = true;
      const x = M + col * (colW + cfg.gap);
      if (drawIt) b.draw(doc, x, y, colW, s);
      placed.push({ page, col, y });
      y += hgt;
    }
    return { pages: page + 1, overflow };
  }
  function decorate(doc, cfg, pages) {
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      const M = cfg.margin;
      doc.setFillColor('#123047');
      doc.rect(0, 0, A4.w, 2.2, 'F');
      setF(doc, 'bold', 12.5);
      doc.setTextColor('#123047');
      doc.text(clean(cfg.title), M, M + 3.2);
      setF(doc, 'normal', 8);
      doc.setTextColor(MUTED);
      const sub = clean(cfg.subtitle || '');
      doc.text(sub, A4.w - M - doc.getTextWidth(sub), M + 3.2);
      doc.setDrawColor(LINE); doc.setLineWidth(0.3);
      doc.line(M, M + 5.2, A4.w - M, M + 5.2);
      setF(doc, 'normal', 7);
      doc.setTextColor(MUTED);
      const foot = 'Rafmagnsfræði 1 · Prófundirbúningur · Litir og númer = sömu aðferðaspjöld og á vefnum' + (pages > 1 ? '   ·   bls. ' + p + ' / ' + pages : '');
      doc.text(foot, M, A4.h - M + 1.5);
    }
  }
  /* Finnur stærsta kvarða (≤ 1) sem kemur efninu á `target` síður */
  function fit(blocksFn, cfg, target, minS) {
    const doc = mdoc();
    let s = cfg.maxScale || 1, res;
    while (true) {
      res = flow(doc, blocksFn(s), cfg, s, false);
      if ((res.pages <= target && !res.overflow) || s <= minS) break;
      s = Math.round((s - 0.02) * 100) / 100;
    }
    return { s, pages: res.pages, overflow: res.overflow };
  }
  function render(title, blocksFn, cfg, target, minS) {
    const fr = fit(blocksFn, cfg, target, minS);
    const doc = newDoc(title);
    const res = flow(doc, blocksFn(fr.s), cfg, fr.s, true);
    decorate(doc, cfg, res.pages);
    return { doc, pages: res.pages, scale: fr.s };
  }
  const out = (r) => ({ doc: r.doc, pages: r.pages, scale: r.scale, blob: r.doc.output('blob') });

  /* ================= SKJÖLIN ================= */
  const twoRule = (s) => Box([Para({ src: '**Tvíleiðari:** gefin lengd l = fjarlægð frá gjafa að álagi. Straumurinn fer fram OG til baka → lengd straumleiðar = **2·l**.', size: 8.2 }), Formula('R_l = \\f{ρ·l·2}{A}', { size: 11.5, center: true, gap: 0.4 })], { color: '#0b7a70', fill: '#e3f6f3', gapAfter: 1.8 });
  const stepsList = () => Box([Para({ src: '**1** Hvað er gefið? (skrifa niður með einingum)  **2** Hvað á að finna?  **3** Hvaða spjald / formúla?  **4** Umrita ef þarf  **5** Setja inn: l í **m**, A í **mm²**  **6** Svar með einingu – ekki námunda millinðurstöður  **7** Er svarið rökrétt?', size: 7.8 })], { title: 'Lausnarskref', color: '#1b3a57', gapAfter: 1.8 });
  const symbolsTable = () => Table([['Tákn', 'Stærð', 'Eining'], ['R', 'viðnám', 'Ω'], ['ρ', 'eðlisviðnám (hró)', 'Ω·mm²/m'], ['G', 'eðlisleiðni á glærum (σ/γ)', 'S'], ['l · A', 'lengd · þverflatarmál', 'm · mm²'], ['d · r', 'þvermál (Φ) · radíus', 'mm'], ['α', 'hitastuðull', '1/°C'], ['Δt', 't_2 − t_1', '°C'], ['I · U', 'straumur · spenna', 'A · V'], ['ΔU', 'spennufall', 'V'], ['U_1 · U_2', 'spenna gjafa · álags', 'V']], [0.8, 1.8, 1], { size: 7.2, gapAfter: 1.2 });
  const quickTable = (size) => Table([['Mér er gefið …', 'Finna', 'Spjald'], ...RF.quickIds.map((q) => { const r = RF.identify(q.g, q.find); return [q.say.replace(/^Mér er (gefin|gefið) /, '').replace(/\.$/, ''), RF.findOptions.find((o) => o.k === q.find).label, r.cards.join(' → ')]; })], [2.3, 1.45, 0.6], { size: size || 7.2 });

  RF.pdf = {
    ensure: () => (G.NASA_PDF_FONTS ? Promise.resolve(true) : loadFonts()),
    ready: () => !!G.NASA_PDF_FONTS,

    /* A. Eins blaðsíðna formúlublað */
    async formulaSheet() {
      await RF.pdf.ensure();
      const cfg = { maxScale: 1.16, margin: 8, cols: 3, gap: 3.6, headH: 8, title: 'Formúlublað – Rafmagnsfræði 1', subtitle: 'Rafleiðarar · viðnám · hitastig · spennufall' };
      const blocks = (s) => [
        twoRule(s),
        ...RF.methods.map((m) => MethodCard(m, { compact: true, fsize: 11, gapAfter: 1.5 })),
        Head('Eðlisviðnám og hitastuðlar (20 °C)', 'R', { size: 9 }), matTable(7.2),
        Para({ src: 'Feitletrað = gildi kennara. * = almennt gildi (óstaðfest í gögnum).', size: 6.6, color: MUTED }),
        stepsList(s),
        Head('Tákn og einingar', null, { size: 9 }), symbolsTable(),
        Head('Hvaða spjald?', null, { size: 9 }), quickTable(6.9),
      ];
      return out(render('Formúlublað – Rafmagnsfræði 1', blocks, cfg, 1, 0.7));
    },

    /* B. Tveggja blaðsíðna prófglósur */
    async examNotes() {
      await RF.pdf.ensure();
      const cfg = { maxScale: 1.14, margin: 8, cols: 2, gap: 5, headH: 8, title: 'Prófglósur – Rafmagnsfræði 1', subtitle: 'Bls. 1: leiðarar, eiginleikar, viðnám · Bls. 2: spennuföll' };
      const b = (src) => Para({ src, size: 8.2, bullet: true, gapAfter: 0.25 });
      const blocks = (s) => [
        Head('1 · Rafleiðarar og flokkun', 'R'),
        b('**Málmar:** frjálsar **rafeindir** bera strauminn; efnið breytist ekki.'),
        b('**Vökvar (raflausnir):** **jónir** bera strauminn – plúsjónir að mínusskauti. Efnið flyst til.'),
        b('**Lofttegundir:** leiða aðeins **jónaðar** (neisti, elding, flúrpera).'),
        b('**Hálfleiðarar** (kísill, german): leiðni milli leiðara og einangrara, **eykst með hita** (NTC). Díóður, smárar.'),
        b('**Einangrarar:** gler, postulín, PVC, gúmmí, glimmer, olía, þurrt loft.'),
        b('**Galvanhúðun:** hlutur á **mínusskaut** í raflausn; málmjónir setjast á hann.'),
        Table([['Málmur', 'ρ', 'Notkun'], ['Silfur', '0,0167', 'besti leiðari – snertur'], ['Kopar (eir)', '0,0178', 'lagnir, kaplar – ódýr, góður'], ['Gull', '≈ 0,024', 'húðun tengja – tærist ekki'], ['Ál', '0,0278', 'loftlínur – létt og ódýrt']], [1.1, 0.8, 2.2], { size: 7.6, zebra: true }),
        Para({ src: 'Kafli 1 er byggður á almennri þekkingu (glærur 3.1/3.2 fylgdu ekki).', size: 6.6, color: MUTED }),
        Head('2 · Eiginleikar og leiðni', 'R'),
        b('R ræðst af **efni (ρ)**, **lengd** (lengri → meira R), **þverflatarmáli** (gildari → minna R) og **hita**.'),
        b('**ρ** = viðnám 1 m × 1 mm² við 20 °C, eining **Ω·mm²/m**. Lítið ρ = góður leiðari.'),
        b('**Eðlisleiðni** = 1/ρ. Á glærum táknuð **G** (S); víða σ eða γ, og þá G = 1/R (leiðni hlutar).'),
        b('**PTC:** R eykst með hita (málmar). **NTC:** R minnkar með hita (hálfleiðarar). Manganín: α ≈ 0.'),
        b('Þvermál tvöfaldast → A × 4 → R ÷ 4.  **A = \\f{π·d^2}{4} = π·r^2**'),
        Head('3 · Viðnám og hitastig', 'R'),
        ...[1, 2, 3, 4, 5, 6].map((id) => MethodCard(RF.method(id), { example: true, fsize: 11, gapAfter: 1.4 })),
        Head('Töflugildi (20 °C)', 'R', { size: 9 }), matTable(7.2),
        Break(),
        Head('4 · Spennuföll', 'U'),
        b('Hluti spennunnar fer í að knýja strauminn gegnum leiðarana: **spennufall ΔU**.'),
        b('Leiðsla og álag raðtengd: **R_H = R_l + R_{álag}**. Álagið fær **U_2 = U_1 − ΔU**.'),
        TwoWire(),
        twoRule(s),
        ...[7, 8, 9, 10, 11, 12].map((id) => MethodCard(RF.method(id), { example: true, fsize: 11, gapAfter: 1.4 })),
        Head('Hvaða dæmi er þetta?', 'U', { size: 9.5 }), quickTable(7.2),
        Head('Dæmagerðir kennarans', 'U', { size: 9.5 }),
        Table([['Dæmi', 'Gefið → finna', 'Spjald', 'Svar'], ...RF.problemTypes.map((t) => { const pp = t.original.p, v = t.solve(pp).v; return [t.id, t.title, t.cards.join(', '), t.parts(pp).map((pt) => RF.valueTextPlain(pt, v[pt.k])).join(' · ')]; })], [0.5, 2.2, 0.6, 1.9], { size: 6.9, zebra: true }),
        Head('Algengustu mistökin', 'T', { size: 9.5 }),
        ...['Gleyma **×2** fyrir tvíleiðara (eða ÷2 í hámarkslengd).', 'Rugla **þvermáli og radíus**: A = π·d²/4, ekki π·d².', 'Gleyma **×100** í prósentu. Deila með **U₁**, ekki U₂.', 'Δt yfir núllið: 10 °C → −15 °C er **25 °C**.', 'Hitadæmi: deila með **R_t1·α** (upphafsviðnám) og muna **+ t₁**.', 'Lengd í **m** (km × 1000), A í **mm²**.', '**Námunda of snemma** (R = 0,13 → 24,6 í stað 24,03 mm²).', 'U₁ = U₂ **+** ΔU (gjafinn þarf meira).'].map((x) => Para({ src: x, size: 7.8, bullet: true, bulletColor: '#b4530a', gapAfter: 0.2 })),
      ];
      return out(render('Prófglósur – Rafmagnsfræði 1', blocks, cfg, 2, 0.7));
    },

    /* Verkefnayfirlit: öll 13 dæmi kennarans með lausn */
    async problemOverview() {
      await RF.pdf.ensure();
      const cfg = { margin: 12, cols: 2, gap: 6, headH: 8, title: 'Verkefnayfirlit – æfingadæmi kennarans', subtitle: '3.3.1 Viðnám (V1–V6) · 3.4.1 Spennufall (S1–S7)' };
      const blocks = (s) => {
        const out2 = [];
        RF.problemTypes.forEach((t, i) => {
          if (i === 6) out2.push(Break());
          const pr = RF.makeProblem(t.id, 'orig');
          const sol = t.solve(pr.p);
          const kids = [Para({ src: pr.text, size: 8.2, gapAfter: 0.8 }), Para({ src: '**Aðferðaspjald:** ' + t.cards.map((c) => c + ' (' + RF.method(c).find.toLowerCase() + ')').join(', '), size: 7.4, color: MUTED, gapAfter: 0.6 })];
          sol.steps.forEach((st) => {
            if (st.diagram) { kids.push(Para({ src: '**' + st.h + '**', size: 7.6, gapAfter: 0.2 })); kids.push(TwoWire()); return; }
            kids.push(Para({ src: '**' + st.h + '**', size: 7.6, gapAfter: 0.2 }));
            st.m.forEach((ml) => kids.push(Formula(ml, { size: 9.2, gap: 0.5, indent: 1.5 })));
          });
          kids.push(Para({ src: '**Svar:** ' + t.parts(pr.p).map((pt) => pt.label + ' = ' + RF.valueTextPlain(pt, sol.v[pt.k])).join(' · '), size: 8, color: '#0b5b3b', gapAfter: 0.3 }));
          kids.push(Para({ src: 'Svar kennarans: ' + t.original.teacher, size: 7.2, color: MUTED, gapAfter: 0 }));
          out2.push(Box(kids, { title: t.id + ' · ' + t.title + '  (' + t.source + ')', color: famColor(t.fam), gapAfter: 2.6 }));
        });
        return out2;
      };
      return out(render('Verkefnayfirlit – Rafmagnsfræði 1', blocks, cfg, 6, 0.8));
    },

    /* E. Mínar eigin glósur út frá vali nemanda */
    notesBlocks(N) {
      return (s) => {
        const bl = [];
        const chosen = RF.methods.filter((m) => N.cards.includes(m.id));
        const fams = ['R', 'T', 'U'];
        const famTitle = { R: 'Viðnám og efni', T: 'Hitastig', U: 'Spennufall' };
        const rich = s >= 0.9;
        fams.forEach((fm) => {
          const ms = chosen.filter((m) => m.fam === fm);
          if (!ms.length) return;
          bl.push(Head(famTitle[fm], fm, { size: 10 }));
          if (fm === 'U' && ms.some((m) => [7, 8, 11, 12].includes(m.id))) bl.push(twoRule(s));
          ms.forEach((m) => bl.push(MethodCard(m, { example: rich || N.forget.includes(m.id), traps: N.showTraps && (rich || N.forget.includes(m.id)), steps: N.forget.includes(m.id), star: N.forget.includes(m.id), comment: N.comments[m.id], fsize: 11, gapAfter: 1.5 })));
        });
        if (N.types.length) {
          bl.push(Head('Dæmagerðir sem ég vil muna', null, { size: 10 }));
          N.types.forEach((tid) => { const t = RF.ptype(tid); bl.push(Box([Para({ src: '**Gefið:** ' + t.given(t.original.p).map((x) => x[0] + ' = ' + x[1]).join(', '), size: 7.6, gapAfter: 0.3 }), Para({ src: '**Aðferð:** spjald ' + t.cards.join(' → ') + ' · ' + t.skills.join(' · '), size: 7.6, gapAfter: 0.3 }), Para({ src: '**Svar kennarans:** ' + t.original.teacher, size: 7.6, gapAfter: 0 })], { title: t.id + ' · ' + t.title, color: famColor(t.fam), gapAfter: 1.4 })); });
        }
        if (N.own.length) {
          bl.push(Head('Mín eigin dæmi', null, { size: 10 }));
          N.own.forEach((o) => bl.push(Box([Para({ src: o.text || '–', size: 8, gapAfter: 0 })], { title: o.title, color: '#5b4a8a', gapAfter: 1.4 })));
        }
        if (N.showTable) { bl.push(Head('Töflugildi (20 °C)', 'R', { size: 9 })); bl.push(matTable(7.2)); }
        if (N.showTraps) {
          bl.push(Head('Algeng mistök', 'T', { size: 9 }));
          ['Tvíleiðari: **×2** (hámarkslengd: **÷2**).', 'A = π·d²/4 – ekki π·d².', '% = ΔU/U₁ **·100**.', 'Δt yfir núllið. Nefnari: **R_t1·α**. Muna **+ t₁**.', 'l í m, A í mm². Ekki námunda of snemma.'].forEach((x) => bl.push(Para({ src: x, size: 7.8, bullet: true, bulletColor: '#b4530a', gapAfter: 0.2 })));
        }
        if (!bl.length) bl.push(Para({ src: 'Ekkert valið. Veldu formúlur á vefnum.', size: 10 }));
        return bl;
      };
    },
    notesCfg(N) { return { margin: 8, cols: N.pages === 1 ? 3 : 2, gap: 4, headH: 8, title: clean(N.title || 'Mínar prófglósur'), subtitle: 'Rafmagnsfræði 1 · ' + N.pages + ' bls. · stjarna = ég gleymi þessu oft' }; },
    estimateNotes(N) {
      if (!RF.pdf.ready()) return null;
      const fr = fit(RF.pdf.notesBlocks(N), RF.pdf.notesCfg(N), N.pages, 0.74);
      return { pages: fr.pages, scale: fr.s };
    },
    async myNotes(N) {
      await RF.pdf.ensure();
      return out(render(N.title || 'Mínar prófglósur', RF.pdf.notesBlocks(N), RF.pdf.notesCfg(N), N.pages, 0.74));
    },
  };
  RF.pdf._lib = { Para, Head, Formula, Box, Table, Gap, Break, ColBreak, TwoWire, MethodCard, matTable, flow, decorate, render, fit, mathBox, draw, setF, clean, lighten, famColor, drawStar, A4, PT, INK, MUTED, LINE, out };
  RF.valueTextPlain = (part, v) => (part.kind === 'choice' ? (Array.isArray(v) ? v : [v]).map((x) => (part.options.find((o) => o.v === x) || { label: x }).label).join(' / ') : f(v) + ' ' + (part.unit || ''));
})(typeof globalThis !== 'undefined' ? globalThis : window);

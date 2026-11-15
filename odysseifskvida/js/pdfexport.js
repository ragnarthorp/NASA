/* PDF-útflutningur glósa með jsPDF (../vendor/jspdf.umd.min.js) og innfelldu Unicode-letri
   (../vendor/pdf-fonts.js: hlutmengi úr Liberation Sans, styður íslensku, „gæsalappir“, – og …).
   Texti er raunverulegur vektor-texti með sjálfvirkri línu- og síðuskiptingu – ekki skjáskot.
   Virkar bæði í vafra og í Node (sjá tests/pdf.test.js). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OdyPdf = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const INK = [28, 32, 36], MUTED = [92, 98, 104], ACCENT = [140, 74, 38], RULE = [205, 200, 192], QUOTE_BAR = [196, 140, 100];

  /* Fjarlægir stafi sem letrið hefur ekki (t.d. broskarla) í stað þess að þeir verði að rusli. */
  const SUPPORTED = /[\u0009\u000A -~ -ɏͰ-Ͽ -⁯⁰-₟₠-⃏℀-⅏⅐-↏←-⇿∀-⋿■-◿✓-✗]/u;
  function clean(s) {
    return Array.from(String(s == null ? '' : s).normalize('NFC').replace(/\r\n?/g, '\n').replace(/­/g, '').replace(/\t/g, '    '))
      .map(c => (SUPPORTED.test(c) ? c : (c.codePointAt(0) > 0xffff ? '' : '?'))).join('');
  }

  function build(jsPDF, fonts, model) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    let FAM = 'helvetica';
    if (fonts && fonts.normal) {
      for (const st of ['normal', 'bold', 'italic', 'bolditalic']) {
        doc.addFileToVFS('ody-' + st + '.ttf', fonts[st]);
        doc.addFont('ody-' + st + '.ttf', 'OdySans', st);
      }
      FAM = 'OdySans';
    } else {
      throw new Error('Leturgerð fyrir PDF vantar; íslenskir stafir myndu ekki skila sér.');
    }
    doc.setProperties({ title: model.title + ' – mínar glósur', subject: 'Glósur nemanda', creator: 'Lestrarstofa – Ódysseifskviða' });
    doc.setLanguage && doc.setLanguage('is');

    const W = 210, H = 297, M = 20, CW = W - 2 * M, TOP = 22, BOTTOM = H - 20;
    let y = TOP;
    const lh = size => size * 0.3528 * 1.45;
    const font = (style, size, color) => { doc.setFont(FAM, style); doc.setFontSize(size); doc.setTextColor(...(color || INK)); };
    const newPage = () => { doc.addPage(); y = TOP; };
    const need = h => { if (y + h > BOTTOM) { newPage(); return true; } return false; };

    /* Skrifar texta með línuskiptingu; skiptir um síðu eftir þörfum. `bar` teiknar lóðrétta línu (tilvitnun). */
    function para(text, style, size, opts) {
      const o = Object.assign({ indent: 0, color: INK, gapAfter: 2, bar: null }, opts);
      font(style, size, o.color);
      const width = CW - o.indent;
      const blocks = clean(text).split('\n');
      const L = lh(size);
      for (const b of blocks) {
        const lines = b.length ? doc.splitTextToSize(b, width) : [''];
        for (const line of lines) {
          if (need(L)) font(style, size, o.color);
          if (o.bar) { doc.setDrawColor(...o.bar); doc.setLineWidth(0.8); doc.line(M + 1, y - L * 0.72, M + 1, y + L * 0.28); }
          doc.text(line, M + o.indent, y);
          y += L;
        }
      }
      y += o.gapAfter;
    }
    function rule(color) { need(4); doc.setDrawColor(...(color || RULE)); doc.setLineWidth(0.25); doc.line(M, y, W - M, y); y += 5; }

    // forsíðuhaus
    font('bold', 20, INK);
    y += 2;
    para(model.title, 'bold', 20, { gapAfter: 1 });
    para('Mínar glósur', 'normal', 13, { color: MUTED, gapAfter: 1 });
    para(`${model.scopeLabel} · ${model.count} ${model.count === 1 ? 'glósa' : 'glósur'} · ${fmt(model.generatedAt)}`, 'normal', 9.5, { color: MUTED, gapAfter: 3 });
    rule(ACCENT);
    if (!model.items.length) para('Engar glósur.', 'italic', 11);

    let cur = null;
    for (const it of model.items) {
      if (it.section !== cur) {
        need(lh(14) + lh(10) * 4);
        if (cur !== null) y += 3;
        para(it.section, 'bold', 14, { color: ACCENT, gapAfter: 2 });
        cur = it.section;
      }
      need(lh(10) * 6 + 4);
      para(`Glósa ${it.n}`, 'bold', 10, { color: MUTED, gapAfter: 0.5 });
      para(`${it.work}\n${it.section}\n${it.location}`, 'normal', 10, { color: MUTED, gapAfter: 0.5 });
      para(`Tegund: ${it.type}${it.orphan ? ' · ATH: tenging við texta fannst ekki' : ''}`, 'normal', 10, { color: MUTED, gapAfter: 2 });
      if (it.quote != null) {
        para('Valinn frumtexti:', 'bold', 10, { gapAfter: 0.5 });
        para(it.quote, 'italic', 10.5, { indent: 5, bar: QUOTE_BAR, color: [60, 60, 60], gapAfter: 2.5 });
      }
      para('Mín glósa:', 'bold', 10, { gapAfter: 0.5 });
      para(it.body.trim() ? it.body : '(tóm glósa)', it.body.trim() ? 'normal' : 'italic', 11, { gapAfter: 3 });
      rule();
    }

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      font('normal', 8.5, MUTED);
      doc.text(clean(`${model.title} – mínar glósur`), M, H - 10);
      doc.text(clean(`Síða ${i} af ${pages}`), W - M, H - 10, { align: 'right' });
    }
    return doc;
  }

  function fmt(d) {
    const x = d instanceof Date ? d : new Date(d);
    const p = n => String(n).padStart(2, '0');
    return `${x.getDate()}.${x.getMonth() + 1}.${x.getFullYear()} kl. ${p(x.getHours())}:${p(x.getMinutes())}`;
  }

  return { build, clean };
});

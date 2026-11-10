/* Æfingapróf (PDF) – uppsett eins og próf frá kennara. Nemandinn leysir það með Dæmaleiðarvísinum:
   finnur dæmagerðina, formúluna og töflugildin sjálfur. Tölum er breytt frá dæmum kennarans.
   Aftast: lausnablað með svörum og vísun á blaðsíðu í leiðarvísinum. */
(function (G) {
  const RF = G.RF;
  const L = () => RF.pdf._lib;
  const fs = RF.util.fmtS, g = RF.util.fmt;

  /* Hluti B: dæmi í blandaðri röð. p = tölur (breyttar frá dæmum kennarans). */
  const B = [
    { t: 'S2', p: { mat: 'kopar', l: 35, A: 1.5, I: 13 } },
    { t: 'V1', p: { mat: 'kopar', l: 250, d: 1.2 }, text: 'Reiknaðu viðnámið í 250 m löngum eirvír sem er 1,2 mm í þvermál.' },
    { t: 'V5', p: { mat: 'kopar', R1: 12, t1: 18, R2: 14.6 }, text: 'Spóla er undin úr eir/kopar-vír. Áður en spenna er sett yfir hana er viðnám hennar mælt við 18 °C hita og það reynist vera 12 Ω. Eftir að straumur hefur runnið í henni um tíma er viðnám hennar aftur mælt og reynist það þá vera 14,6 Ω. Hvað er spólan þá orðin heit?' },
    { t: 'S4', p: { mat: 'kopar', A: 2.5, I: 16, dU: 6.9 }, text: 'Hve langt er hægt að leggja kapal sem er 2,5 mm² tvíleiðari úr eir (kopar), ef spennufallið yfir hann má vera 6,9 V við 16 A straum?' },
    { t: 'L1' },
    { t: 'V3', p: { l: 150, A: 2.5, R: 1.67 }, text: '150 m langur málmþráður hefur viðnámið 1,67 Ω og er 2,5 mm² að þverflatarmáli. Hvert er eðlisviðnám efnisins? Hvaða málmur gæti þetta verið?' },
    { t: 'S7', p: { mat: 'kopar', l: 60, A: 2.5, I: 16, U2: 218 } },
    { t: 'V6', p: { mat: 'nikkel', R1: 12, t1: 15, ta: 60, tb: -20 } },
    { t: 'S1', p: { mat: 'kopar', l: 90, d: 1.78 }, text: 'Reiknaðu viðnámið í 90 m löngum tvíleiðara úr eir (kopar). Hvor leiðari er 1,78 mm í þvermál.' },
    { t: 'H1' },
    { t: 'V2', p: { mat: 'kromnikkel', R: 22, A: 0.5 }, text: 'Það á að vinda 22 Ω hitaþráð í brauðrist úr krómnikkelþræði með þverflatarmálið 0,5 mm². Reiknaðu lengd þráðarins.' },
    { t: 'S5', p: { mat: 'kopar', l: 70, I: 40, dU: 9.2 } },
    { t: 'V4', p: { mat: 'kopar', l: 180, A: 4, to: ['al', 'jarn'] }, text: 'Koparvír (leiðari) er 180 m langur og þverflatarmál hans er 4 mm². a) Í staðinn fyrir hann er settur leiðari úr áli. Hvert verður þverflatarmál nýja leiðarans miðað við að viðnám hans verði það sama og koparvírsins? b) Næst er settur leiðari úr járni. Hvert verður þverflatarmál hans miðað við að viðnámið verði það sama?' },
    { t: 'S3', p: { mat: 'kopar', l: 60, A: 2.5, I: 20, U: 230 }, text: 'Vatnshitakútur tengist rafmagnstöflu með 60 m löngum tvíleiðara úr eir sem er 2,5 mm². Straumurinn er 20 A og spennan 230 V. a) Hvert er viðnám leiðaranna? b) Hve mikið spennufall er í leiðurunum? c) Hve stór hundraðshluti af heildarspennu er spennufallið?' },
    { t: 'S6', p: { mat: 'kopar', l: 150, A: 1.5, I: 6 }, text: 'Hvað verður spennufallið yfir 150 m langan tvíleiðara úr eir sem er 1,5 mm² að þverflatarmáli þegar um hann fer 6 A straumur?' },
  ];

  /* Dæmi sem ekki eru í dæmabankanum (sbr. L1 og H1 í leiðarvísinum) */
  const MAN = {
    L1: {
      text: 'Álvír er 250 m langur og 6 mm² að þverflatarmáli. Eðlisleiðni áls er 36 m/(Ω·mm²). a) Hvert er eðlisviðnám áls? b) Hvert er viðnám vírsins? c) Hver er leiðni vírsins?',
      parts: [['a) Eðlisviðnám ρ', 'Ω·mm²/m', 1 / 36], ['b) Viðnám R', 'Ω', 250 / (36 * 6)], ['c) Leiðni G', 'S', (36 * 6) / 250]],
      sol: 'ρ = 1/γ = 1/36 = 0,02778 · R = l/(γ·A) = 250/(36·6) = 1,157 Ω · G = 1/R = 0,864 S',
    },
    H1: (() => {
      const Rl = (0.0178 * 25 * 2) / 1.5, RH = Rl + 25, I = 230 / RH, dU = I * Rl;
      return {
        text: 'Hraðsuðuketill er tengdur við 230 V töflu með 25 m löngum tvíleiðara úr eir sem er 1,5 mm² að þverflatarmáli. Viðnám ketilsins er 25 Ω. a) Hvert er viðnám leiðslunnar? b) Hvert er heildarviðnám rásarinnar? c) Hver er straumurinn? d) Hver er spennan yfir katlinum?',
        parts: [['a) Viðnám leiðslu R_l', 'Ω', Rl], ['b) Heildarviðnám R_H', 'Ω', RH], ['c) Straumur I', 'A', I], ['d) Spenna á katli U_2', 'V', 230 - dU]],
        sol: 'R_l = 0,0178·25·2/1,5 = ' + fs(Rl) + ' Ω · R_H = ' + fs(Rl) + ' + 25 = ' + fs(RH) + ' Ω · I = 230/' + fs(RH) + ' = ' + fs(I) + ' A · ΔU = I·R_l = ' + fs(dU) + ' V · U₂ = 230 − ' + fs(dU) + ' = ' + fs(230 - dU) + ' V',
      };
    })(),
  };

  /* Hluti A: hugtök */
  const A = [
    { q: 'Nefndu fjóra flokka rafleiðara og hvað ber strauminn í hverjum þeirra.', lines: 3, ans: 'Málmar (frjálsar rafeindir) · vökvar/raflausnir (jónir) · lofttegundir (jónað gas) · hálfleiðarar (rafeindir, meira þegar heitt). Einangrarar leiða nær ekkert.', ref: 'flokkar' },
    { q: 'Hvers vegna er ál notað í loftlínur en kopar í raflagnir innanhúss?', lines: 2, ans: 'Ál er létt og ódýrt (leiðir um 64 % á við kopar). Kopar leiðir betur og þarf minna þverflatarmál – hentar í lagnir.', ref: 'tables1' },
    { q: 'Lýstu galvanhúðun. Við hvaða skaut er hluturinn sem á að húða tengdur?', lines: 2, ans: 'Hlutur og húðunarmálmur í raflausn; straumurinn flytur jákvæðar málmjónir á hlutinn. Hluturinn er tengdur við mínusskautið (−).', ref: 'flokkar' },
    { q: 'Hvað er eðlisleiðni og hvernig tengist hún eðlisviðnámi? Reiknaðu eðlisleiðni kopars.', lines: 2, ans: 'Eðlisleiðni = 1/ρ (hve vel efnið leiðir). Kopar: 1/0,0178 = 56,2 m/(Ω·mm²).', ref: 'tables1' },
    { q: 'Hvað merkir táknið Δ í ΔU og Δt? Hvað er NTC-viðnám?', lines: 2, ans: 'Δ = breyting (ΔU = spennufall, Δt = hitastigsbreyting). NTC: viðnámið minnkar þegar það hitnar (neikvæður hitastuðull).', ref: 'sym' },
  ];

  const note = (t) => (t[0] === 'V' ? 'Ath.! Ekki skrifa meir en tvo aukastafi í svari.' : t[0] === 'S' || t === 'H1' ? '*Ath. Eðlisviðnám eirs sbr. tafla yfir eðlisviðnám. *Ath. Miðaðu við 20 °C hita á leiðaranum.' : '');

  function item(i) {
    const b = B[i];
    if (MAN[b.t]) return { id: b.t, text: MAN[b.t].text, parts: MAN[b.t].parts.map(([lab, unit, v]) => ({ label: lab, unit, v })), sol: MAN[b.t].sol };
    const t = RF.ptype(b.t);
    const sol = t.solve(b.p);
    if (!t.valid(b.p, sol.v)) throw new Error('Ógilt prófdæmi ' + b.t);
    const parts = t.parts(b.p).map((pt) => ({ label: pt.label, unit: pt.unit || '', v: sol.v[pt.k], pt }));
    return { id: b.t, text: b.text || t.text(b.p), parts, steps: sol.steps };
  }

  /* Svarlína: „a) Viðnám R = ______ Ω“ */
  function AnswerLine(label, unit) {
    return {
      measure: (doc, w, s) => 8.5 * s,
      draw(doc, x, y, w, s) {
        const { mathBox, draw, setF } = L();
        const b = mathBox(doc, label + ' =', 11 * s, true);
        draw(doc, b, x + 4 * s, y + 6 * s, '#14202b');
        const lx = x + 6 * s + b.w, lw = 48 * s;
        doc.setDrawColor('#55636f'); doc.setLineWidth(0.3 * s);
        doc.line(lx, y + 6.6 * s, lx + lw, y + 6.6 * s);
        setF(doc, 'normal', 11 * s); doc.setTextColor('#14202b');
        if (unit) doc.text(unit, lx + lw + 2 * s, y + 6 * s);
      },
    };
  }
  /* Rúðustrikað reikningssvæði (dauft, sparar tóner) */
  function WorkArea(hmm) {
    return {
      measure: (doc, w, s) => (hmm + 2) * s,
      draw(doc, x, y, w, s) {
        doc.setDrawColor('#e2e7ec'); doc.setLineWidth(0.15);
        const step = 5 * s;
        for (let yy = y; yy <= y + hmm * s + 0.01; yy += step) doc.line(x, yy, x + w, yy);
        for (let xx = x; xx <= x + w + 0.01; xx += step) doc.line(xx, y, xx, y + hmm * s);
      },
    };
  }
  function Lines(n) {
    return {
      measure: (doc, w, s) => (n * 7.5 + 2) * s,
      draw(doc, x, y, w, s) { doc.setDrawColor('#b9c3cc'); doc.setLineWidth(0.25 * s); for (let i = 1; i <= n; i++) doc.line(x + 4 * s, y + i * 7.5 * s, x + w, y + i * 7.5 * s); },
    };
  }
  /* Spurning: „12) texti …   (6 stig)“ – haldið saman á síðu */
  function Question(nr, text, pts, extra) {
    const { Para } = L();
    return {
      measure(doc, w, s) { this.p = Para({ src: text, size: 11.5, gapAfter: 0.6 }); this.h1 = this.p.measure(doc, w - 26 * s, s); this.e = extra ? Para({ src: extra, size: 9.5, color: '#55636f', gapAfter: 0.8 }) : null; this.h2 = this.e ? this.e.measure(doc, w - 10 * s, s) : 0; return this.h1 + this.h2 + 1 * s; },
      draw(doc, x, y, w, s) {
        const { setF } = L();
        setF(doc, 'bold', 12 * s); doc.setTextColor('#123047'); doc.text(nr + ')', x, y + 4.4 * s);
        this.p.draw(doc, x + 10 * s, y, w - 26 * s, s);
        setF(doc, 'normal', 9.5 * s); doc.setTextColor('#55636f');
        const ps = '(' + pts + ' stig)'; doc.text(ps, x + w - doc.getTextWidth(ps), y + 4.4 * s);
        if (this.e) this.e.draw(doc, x + 10 * s, y + this.h1, w - 10 * s, s);
      },
    };
  }
  /* Hópur blokka sem má ekki slíta á milli síðna */
  function Keep(blocks) {
    return {
      measure(doc, w, s) { this.hs = blocks.map((b) => b.measure(doc, w, s)); return this.hs.reduce((a, b) => a + b, 0); },
      draw(doc, x, y, w, s) { let yy = y; blocks.forEach((b, i) => { b.draw(doc, x, yy, w, s); yy += this.hs[i]; }); },
    };
  }

  RF.pdf.practiceExam = async function () {
    await RF.pdf.ensure();
    const { Para, Box, Table, Break, Head, Gap, render, out } = L();
    // blaðsíðutöl leiðarvísisins (fyrir lausnablaðið)
    await RF.pdf.studyGuide();
    const PG = RF.pdf._guidePG || {};
    const items = B.map((_, i) => item(i));
    const ptsB = 6, ptsA = 2;
    const total = A.length * ptsA + items.length * ptsB;
    const cfg = { margin: 14, cols: 1, gap: 0, headH: 8, title: 'Æfingapróf – Rafmagnsfræði 1', subtitle: 'Rafleiðarar · viðnám, leiðni og spennuföll' };
    const blocks = () => {
      const bl = [];
      bl.push({
        measure: (doc, w, s) => 22 * s,
        draw(doc, x, y, w, s) {
          const { setF } = L();
          setF(doc, 'bold', 11 * s); doc.setTextColor('#14202b');
          doc.text('Nafn:', x, y + 6 * s); doc.text('Dagsetning:', x + w * 0.62, y + 6 * s);
          doc.setDrawColor('#55636f'); doc.setLineWidth(0.3 * s);
          doc.line(x + 13 * s, y + 6.6 * s, x + w * 0.58, y + 6.6 * s); doc.line(x + w * 0.62 + 24 * s, y + 6.6 * s, x + w, y + 6.6 * s);
          doc.text('Einkunn:', x, y + 16 * s); doc.line(x + 19 * s, y + 16.6 * s, x + 45 * s, y + 16.6 * s);
          setF(doc, 'normal', 11 * s); doc.text('Stig:          / ' + total, x + w * 0.62, y + 16 * s);
        },
      });
      bl.push(Box([
        Para({ src: '**Leyfð hjálpargögn:** Dæmaleiðarvísir (töflur og formúlur) og reiknivél.', size: 11, gapAfter: 0.6 }),
        Para({ src: '**Tími:** 80 mínútur.   **Sýndu alla útreikninga** – rétt aðferð gefur stig þó svarið sé ekki alveg rétt.', size: 11, gapAfter: 0.6 }),
        Para({ src: 'Skrifaðu **einingar** með öllum svörum. Eðlisviðnám og hitastuðla finnur þú í **töflunni** í leiðarvísinum. Miðaðu við 20 °C nema annað sé tekið fram.', size: 11, gapAfter: 0 }),
      ], { title: 'Leiðbeiningar', color: '#123047', gapAfter: 4 }));
      bl.push(Head('Hluti A – Hugtök  (' + A.length * ptsA + ' stig)', null, { size: 12 }));
      A.forEach((a, i) => bl.push(Keep([Question(i + 1, a.q, ptsA), Lines(a.lines), Gap(2)])));
      bl.push(Break());
      bl.push(Head('Hluti B – Reiknidæmi  (' + items.length * ptsB + ' stig)', null, { size: 12 }));
      bl.push(Para({ src: 'Byrjaðu á að finna hvers konar dæmi þetta er (sjá „Hvaða dæmi er þetta?“ í leiðarvísinum). Skrifaðu niður það sem er gefið áður en þú reiknar.', size: 10.5, color: '#3d4a55', gapAfter: 3 }));
      items.forEach((it, i) => {
        const nr = A.length + i + 1;
        const ext = [];
        if (it.id === 'S7') ext.push(Para({ src: '   a) Gerðu tengimynd og merktu inn gefnar stærðir.', size: 11, gapAfter: 0.5 }), WorkArea(22));
        it.parts.forEach((pt) => { if (pt.pt && pt.pt.kind === 'choice' && pt.pt.k === 'len') return; ext.push(AnswerLine(pt.pt && pt.pt.kind === 'choice' ? pt.label : pt.label, pt.unit)); });
        bl.push(Keep([Question(nr, it.text, ptsB, note(it.id)), WorkArea(it.parts.length > 2 ? 38 : 30), ...ext, Gap(5)]));
      });
      bl.push(Para({ src: '**Gangi þér vel!**', size: 12, gapAfter: 0 }));
      // lausnablað
      bl.push(Break());
      bl.push(Head('Lausnablað – lestu ekki fyrr en prófinu er lokið', 'T', { size: 12 }));
      bl.push(Para({ src: 'Dálkurinn **Dæmagerð** segir hvar dæmið er útskýrt í Dæmaleiðarvísinum. Svör eru námunduð; ±1 % telst rétt.', size: 10.5, gapAfter: 2 }));
      bl.push(Table([['Nr.', 'Svar', 'Hvar í leiðarvísi'], ...A.map((a, i) => [String(i + 1), a.ans, 'bls. ' + (PG[a.ref] || '–')])], [0.4, 4.6, 1.1], { size: 9.8, zebra: true, gapAfter: 3 }));
      bl.push(Table([['Nr.', 'Svör', 'Dæmagerð'], ...items.map((it, i) => [String(A.length + i + 1), it.sol ? it.sol : it.parts.map((pt) => pt.label.replace(/^[a-e]\)\s*/, (m) => m) + ' = **' + (pt.pt ? RF.valueTextPlain(pt.pt, pt.v) : fs(pt.v) + ' ' + pt.unit) + '**').join(' · '), it.id + ', bls. ' + (PG[it.id] || '–')])], [0.4, 4.6, 1.1], { size: 9.8, zebra: true, gapAfter: 0 }));
      return bl;
    };
    return out(render('Æfingapróf – Rafmagnsfræði 1', blocks, cfg, 99, 1));
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

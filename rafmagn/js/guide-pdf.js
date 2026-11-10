/* Dæmaleiðarvísir (PDF): einföld og myndræn leiðsögn fyrir nemendur sem eiga erfitt með langan texta.
   Bls. 1: hvað stafirnir þýða. Bls. 2: hvaða dæmi er þetta? (flæðirit + tafla með blaðsíðutilvísunum).
   Bls. 3–15: ein dæmagerð á hverri síðu – á mannamáli, hvernig þekkja má dæmið, formúla, útreikningur, gildra. */
(function (G) {
  const RF = G.RF;
  const L = () => RF.pdf._lib;
  const g = RF.util.fmt;

  /* ---------- orðabók táknanna ---------- */
  const SYM = {
    R: ['R', 'Viðnám', 'Hve mikið vírinn bremsar rafmagnið. Meira R = erfiðara fyrir strauminn.', 'Ω (óm)', 'R'],
    I: ['I', 'Straumur', 'Hve mikið rafmagn rennur. Eins og vatnið sem rennur í slöngu.', 'A (amper)', 'U'],
    U: ['U', 'Spenna', 'Krafturinn sem ýtir rafmagninu áfram. Eins og þrýstingurinn í slöngunni.', 'V (volt)', 'U'],
    ρ: ['ρ', 'Eðlisviðnám (borið fram „hró“)', 'Hve tregt efnið sjálft er. Kopar er lítið tregur, járn meira. Flettu upp í töflu.', 'Ω·mm²/m', 'R'],
    l: ['l', 'Lengd', 'Hve langur vírinn er.', 'm (metrar)', 'R'],
    A: ['A', 'Þverflatarmál', 'Hve sver vírinn er: flatarmál sneiðarinnar ef þú klippir hann í sundur.', 'mm²', 'R'],
    d: ['d', 'Þvermál (líka Φ)', 'Breidd vírsins, þvert í gegnum miðjuna.', 'mm', 'R'],
    r: ['r', 'Radíus', 'Hálft þvermál: r = d/2.', 'mm', 'R'],
    t: ['t', 'Hitastig', 'Hve heitt eða kalt er.', '°C', 'T'],
    α: ['α', 'Hitastuðull (borið fram „alfa“)', 'Hve mikið viðnámið breytist fyrir hverja gráðu. Kopar: 0,0039.', '1/°C', 'T'],
    Δ: ['Δ', 'Delta = BREYTING', 'Δ fyrir framan staf þýðir „breytingin á“. Δt = hve mikið hitinn breyttist. ΔU = hve mörg volt töpuðust.', '–', 'T'],
    π: ['π', 'Pí', 'Alltaf um 3,14. Er notað þegar reiknað er með hringjum.', '–', 'R'],
    sub: ['t_1  t_2', 'Litlu tölurnar niðri', '1 = í byrjun, 2 = í lokin. U_1 = við spennugjafann, U_2 = við tækið (álagið).', '–', 'U'],
    Rl: ['R_l', 'Litla l-ið niðri = leiðsla', 'R_l er viðnám leiðslunnar sjálfrar (víranna), ekki tækisins.', 'Ω', 'U'],
    pct: ['%', 'Prósent', 'Hluti af hundraði. 5 % af 230 V = 11,5 V.', '%', 'U'],
  };

  /* ---------- hver dæmagerð á mannamáli ---------- */
  const T = {
    V1: { say: 'Hve mikið bremsar vírinn rafmagnið?', clues: ['lengd í **m**', '**mm²** (sverleiki)', 'efni: **kopar, ál** …', 'spurt um **Ω**'], find: 'Viðnám **R**', syms: ['R', 'ρ', 'l', 'A'], pic: 'wire', trap: 'Ef **þvermál** (mm) er gefið: reiknaðu fyrst A = π·d²/4.' },
    V2: { say: 'Hve langur þarf vírinn að vera til að fá ákveðið viðnám?', clues: ['viðnám **Ω** er gefið', '**mm²**', 'efni', 'spurt um **lengd**'], find: 'Lengd **l**', syms: ['l', 'R', 'A', 'ρ'], pic: 'wire', trap: 'R og A eru **uppi** (sinnum), ρ er **niðri** (deilt með).' },
    V3: { say: 'Úr hvaða efni er vírinn? Reiknaðu ρ og leitaðu í töflunni.', clues: ['lengd **m**', 'viðnám **Ω**', '**mm²**', '„hvaða málmur?“'], find: 'Eðlisviðnám **ρ** og efnið', syms: ['ρ', 'R', 'A', 'l'], pic: 'wire', trap: 'Svarið er tala. Berðu hana saman við töfluna til að finna efnið.' },
    V4: { say: 'Skipt er um efni, en viðnámið á að vera eins. Hve sver þarf nýi vírinn að vera?', clues: ['**tvö efni**', '„**sama viðnám**“', 'lengd og mm²'], find: 'Nýtt þverflatarmál **A**', syms: ['R', 'A', 'ρ', 'l'], pic: 'swap', trap: 'Tvö skref: fyrst **R** með gamla efninu, svo **A** með nýja efninu.' },
    V5: { say: 'Vírinn hitnaði og viðnámið jókst. Hve heitur varð hann?', clues: ['**tvö viðnám** (Ω)', '**eitt hitastig** (°C)', '„hve heit?“'], find: 'Hitastig **t_2**', syms: ['Δ', 't', 'R', 'α', 'sub'], pic: 'thermo', trap: 'Deildu með **fyrra** viðnáminu R_{t1}. Mundu að **leggja t₁ við** í lokin.' },
    V6: { say: 'Hvað verður viðnámið þegar vírinn hitnar eða kólnar?', clues: ['**eitt viðnám** (Ω)', '**tvö hitastig** (°C)', 'hitnar / kólnar'], find: 'Nýtt viðnám **R_{t2}**', syms: ['R', 'α', 'Δ', 't', 'sub'], pic: 'thermo', trap: 'Hitnar → **plús**. Kólnar → **mínus**. Frá 10 °C niður í −15 °C eru **25** gráður.' },
    S1: { say: 'Hve mikið viðnám er í kapli með tveimur vírum?', clues: ['„**tvíleiðari**“ / kapall', 'lengd **m**', '**mm²**'], find: 'Viðnám leiðslu **R_l**', syms: ['Rl', 'ρ', 'l', 'A'], pic: 'two', trap: 'Rafmagnið fer **fram og til baka**: margfaldaðu með **2**.' },
    S2: { say: 'Hve mörg volt tapast á leiðinni í vírunum?', clues: ['straumur **A**', 'tvíleiðari', 'lengd **m**', '**mm²**'], find: 'Spennufall **ΔU**', syms: ['Δ', 'U', 'I', 'Rl'], pic: 'two', trap: 'Fyrst R_l (með **×2**), svo sinnum I.' },
    S3: { say: 'Hve stór hluti af spennunni tapast í vírunum?', clues: ['spenna **V** gefin', 'straumur **A**', 'spurt um **%**'], find: 'Spennufall í **%**', syms: ['pct', 'Δ', 'U', 'sub'], pic: 'two', trap: 'Mundu **·100**. Deildu með spennu **gjafans** (U₁).' },
    S4: { say: 'Hve langur má kapallinn mest vera?', clues: ['„spennufallið **má vera** … V“', 'straumur **A**', '**mm²**', '„hve langt?“'], find: 'Lengd **l**', syms: ['l', 'R', 'Δ', 'I'], pic: 'two', trap: 'Í lokin: **deildu með 2**, því vírinn fer fram og til baka.' },
    S5: { say: 'Hve sver þarf kapallinn að vera svo ekki tapist of mörg volt?', clues: ['„spennufallið **má vera** … V“', 'fjarlægð **m**', 'straumur **A**', 'spurt um **mm²**'], find: 'Þverflatarmál **A**', syms: ['A', 'R', 'Δ', 'I'], pic: 'two', trap: 'Ekki námunda R of mikið. Veldu svo næstu **staðalstærð** fyrir ofan (t.d. 25 mm²).' },
    S6: { say: 'Hve mörg volt tapast í langri leiðslu?', clues: ['löng leiðsla **m**', 'straumur **A**', 'tvíleiðari', '**mm²**'], find: 'Spennufall **ΔU**', syms: ['Δ', 'U', 'I', 'Rl'], pic: 'two', trap: 'Gleymdu ekki **×2**. Löng leiðsla = mörg volt tapast.' },
    S7: { say: 'Hve mikla spennu þarf að senda af stað svo tækið fái nóg?', clues: ['spenna **yfir tækinu** (U₂)', 'straumur **A**', 'fjarlægð **m**', 'spurt um **spennugjafann**'], find: 'Spenna gjafans **U_1**', syms: ['U', 'sub', 'Δ', 'Rl'], pic: 'two', trap: 'Gjafinn þarf **meira** en tækið fær: U₁ = U₂ **+** ΔU.' },
  };
  const ORDER = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
  const PG = {}; // blaðsíðutöl, fyllt út sjálfkrafa (tvær umferðir)
  const pageOf = (id) => PG[id] || '?';
  const mark = (b, k) => { b.mark = k; return b; };

  /* ---------- sérsniðnar blokkir ---------- */
  const Custom = (hmm, fn) => ({ measure: (doc, w, s) => hmm * s, draw: fn });

  /* Lína í orðabók: hringur með tákni, heiti, skýring, eining */
  function SymRow(key) {
    const [sym, name, meaning, unit, fam] = SYM[key];
    return {
      measure(doc, w, s) {
        const { mathBox } = L();
        this.lines = L().Para({ src: meaning, size: 10.2 }).measure(doc, w - 74 * s, s);
        this.h = Math.max(11.4 * s, 5.2 * s + this.lines);
        return this.h + 1.0 * s;
      },
      draw(doc, x, y, w, s) {
        const { mathBox, draw, setF, famColor, lighten, Para, INK, MUTED } = L();
        const col = famColor(fam);
        doc.setFillColor(lighten(col, 0.97)); doc.setDrawColor(lighten(col, 0.6)); doc.setLineWidth(0.25 * s);
        doc.roundedRect(x, y, w, this.h, 2.5 * s, 2.5 * s, 'FD');
        doc.setFillColor('#ffffff'); doc.setDrawColor(col); doc.setLineWidth(0.7 * s);
        doc.roundedRect(x + 2 * s, y + this.h / 2 - 5.4 * s, 20 * s, 10.8 * s, 5.4 * s, 5.4 * s, 'FD');
        let b = mathBox(doc, sym, 17 * s, true);
        if (b.w > 17 * s) b = mathBox(doc, sym, 17 * s * (17 * s) / b.w, true);
        draw(doc, b, x + 12 * s - b.w / 2, y + this.h / 2 + 2.2 * s, col);
        setF(doc, 'bold', 11.5 * s); doc.setTextColor(INK);
        doc.text(name, x + 26 * s, y + 5.6 * s);
        Para({ src: meaning, size: 10.2 }).measure(doc, w - 74 * s, s);
        const p = Para({ src: meaning, size: 10.2 }); p.measure(doc, w - 74 * s, s); p.draw(doc, x + 26 * s, y + 6.8 * s, w - 74 * s, s);
        setF(doc, 'bold', 11 * s); doc.setTextColor(col);
        const uw = doc.getTextWidth(unit);
        doc.text(unit, x + w - 4 * s - uw, y + this.h / 2 + 1.4 * s);
        setF(doc, 'normal', 7 * s); doc.setTextColor(MUTED);
        if (unit !== '–') doc.text('eining', x + w - 4 * s - doc.getTextWidth('eining'), y + this.h / 2 - 3.2 * s);
      },
    };
  }

  /* Pillur (vísbendingar) sem raðast í línur */
  function Chips(items, color, o = {}) {
    return {
      measure(doc, w, s) {
        const { mathBox } = L();
        const size = (o.size || 11.5) * s, padX = 3.4 * s, hh = size * 0.3528 * 1.75, gap = 2.6 * s;
        this.items = items.map((t) => ({ b: mathBox(doc, t, size) }));
        let x = 0, y = 0;
        this.items.forEach((it) => { const iw = it.b.w + 2 * padX; if (x && x + iw > w) { x = 0; y += hh + gap; } it.x = x; it.y = y; it.w = iw; x += iw + gap; });
        this.hh = hh;
        return y + hh + (o.gapAfter ?? 3) * s;
      },
      draw(doc, x, y, w, s) {
        const { draw, lighten } = L();
        this.items.forEach((it) => {
          doc.setFillColor(lighten(color, 0.95)); doc.setDrawColor(color); doc.setLineWidth(0.35 * s);
          doc.roundedRect(x + it.x, y + it.y, it.w, this.hh, this.hh / 2, this.hh / 2, 'FD');
          draw(doc, it.b, x + it.x + 3.4 * s, y + it.y + this.hh / 2 + it.b.a * 0.36, '#14202b');
        });
      },
    };
  }

  /* Lítil fyrirsögn með tákni */
  function Label(text, color, o = {}) {
    return Custom(o.h || 10.5, (doc, x, y, w, s) => {
      const { setF, clean } = L();
      doc.setFillColor('#ffffff'); doc.setDrawColor(color); doc.setLineWidth(0.5 * s); doc.circle(x + 2.2 * s, y + 3.6 * s, 2.2 * s, 'FD');
      setF(doc, 'bold', 8 * s); doc.setTextColor(color);
      const n = String(o.n || '');
      if (n) doc.text(n, x + 2.2 * s - doc.getTextWidth(n) / 2, y + 4.7 * s);
      setF(doc, 'bold', 12.5 * s); doc.setTextColor(color);
      doc.text(clean(text), x + 6.6 * s, y + 5 * s);
    });
  }

  /* Formúlur í röð með „→ svo“ á milli; brotnar í nýja línu ef plássið þrýtur */
  function FormulaRow(list) {
    return {
      measure(doc, w, s) {
        const { mathBox } = L();
        let size = 21 * s;
        const build = (sz) => {
          const bs = list.map((f) => mathBox(doc, f, sz));
          const sep = 13 * s;
          const rows = [[]];
          let x = 0;
          bs.forEach((b) => { if (x && x + sep + b.w > w - 2 * s) { rows.push([]); x = 0; } if (x) x += sep; rows[rows.length - 1].push({ b, x }); x += b.w; });
          return rows.map((r) => ({ items: r, a: Math.max(...r.map((i) => i.b.a)), d: Math.max(...r.map((i) => i.b.d)) }));
        };
        this.rows = build(size);
        this.h = this.rows.reduce((t, r) => t + r.a + r.d + 3 * s, 0);
        return this.h + 1.5 * s;
      },
      draw(doc, x, y, w, s) {
        const { draw, setF, MUTED } = L();
        let yy = y + 1.5 * s;
        this.rows.forEach((r) => {
          yy += r.a;
          r.items.forEach((it, i) => {
            if (i > 0) { setF(doc, 'bold', 18 * s); doc.setTextColor(MUTED); doc.text('→', x + it.x - 10.5 * s, yy - 0.8 * s); }
            draw(doc, it.b, x + it.x + 1 * s, yy, '#14202b');
          });
          yy += r.d + 3 * s;
        });
      },
    };
  }

  /* ---------- myndir ---------- */
  function picWire(doc, x, y, w, h, s, col) {
    const { setF, draw, mathBox } = L();
    const cy = y + h * 0.45, r = 6 * s, x0 = x + 6 * s, x1 = x + w - 14 * s;
    doc.setFillColor('#fbeee3'); doc.setDrawColor('#b8692f'); doc.setLineWidth(0.5 * s); doc.rect(x0, cy - r, x1 - x0, 2 * r, 'FD');
    doc.setFillColor('#f6dcc5'); doc.setDrawColor('#7d4318'); doc.setLineWidth(0.4 * s);
    doc.ellipse(x1, cy, r * 0.45, r, 'FD');
    doc.setDrawColor(col); doc.setLineWidth(0.5 * s);
    doc.line(x0, cy + r + 4 * s, x1, cy + r + 4 * s);
    doc.line(x0, cy + r + 2.5 * s, x0, cy + r + 5.5 * s); doc.line(x1, cy + r + 2.5 * s, x1, cy + r + 5.5 * s);
    const T = (t, tx, ty, c, sz) => { const b = mathBox(doc, t, (sz || 11) * s, true); draw(doc, b, tx - b.w / 2, ty, c); };
    T('l = lengd', (x0 + x1) / 2, cy + r + 10 * s, col);
    T('A', x1 + 8 * s, cy + 1.5 * s, col, 13);
    T('sneiðin', x1 + 8 * s, cy + 6.5 * s, col, 7.5);
  }
  function picThermo(doc, x, y, w, h, s, col) {
    const { draw, mathBox } = L();
    const tx = x + 12 * s, top = y + 3 * s, bot = y + h - 9 * s;
    doc.setFillColor('#ffffff'); doc.setDrawColor('#55636f'); doc.setLineWidth(0.5 * s);
    doc.roundedRect(tx - 3 * s, top, 6 * s, bot - top, 3 * s, 3 * s, 'FD');
    doc.setFillColor('#fbe3dd'); doc.setDrawColor('#d64527'); doc.setLineWidth(0.5 * s); doc.circle(tx, bot + 1.5 * s, 4.6 * s, 'FD');
    doc.setFillColor('#f3b4a6'); doc.rect(tx - 1.6 * s, top + (bot - top) * 0.3, 3.2 * s, (bot - top) * 0.72, 'F');
    const T = (t, ax, ay, c, sz) => { const b = mathBox(doc, t, (sz || 10.5) * s, true); draw(doc, b, ax, ay, c); };
    T('t_1  →  t_2', x + 24 * s, y + 9 * s, col, 12);
    T('R_{t1}  →  R_{t2}', x + 24 * s, y + 18 * s, col, 12);
    T('Hitnar: R eykst', x + 24 * s, y + 27 * s, '#14202b', 9.5);
    T('Kólnar: R minnkar', x + 24 * s, y + 33 * s, '#14202b', 9.5);
  }
  function picSwap(doc, x, y, w, h, s, col) {
    const { draw, mathBox } = L();
    const T = (t, ax, ay, c, sz) => { const b = mathBox(doc, t, (sz || 10) * s, true); draw(doc, b, ax, ay, c); };
    doc.setFillColor('#f1f3f5'); doc.setDrawColor('#7a8794'); doc.setLineWidth(0.5 * s); doc.rect(x + 4 * s, y + 6 * s, w - 26 * s, 9 * s, 'FD');
    T('ál – sverari', x + 6 * s, y + 12.6 * s, '#14202b', 9);
    doc.setFillColor('#fbeee3'); doc.setDrawColor('#b8692f'); doc.rect(x + 4 * s, y + 22 * s, w - 26 * s, 6 * s, 'FD');
    T('kopar – grennri', x + 6 * s, y + 26.8 * s, '#7d4318', 9);
    T('= sama R', x + w - 20 * s, y + 20 * s, col, 11);
  }
  function picTwo(doc, x, y, w, h, s) {
    const tw = L().TwoWire();
    tw.draw(doc, x, y + 2 * s, w, s * 1.3);
  }
  const PICS = { wire: picWire, thermo: picThermo, swap: picSwap, two: picTwo };

  /* ---------- síður ---------- */
  function headerBand(title, sub, fam, right) {
    return Custom(19, (doc, x, y, w, s) => {
      const { setF, famColor, mathBox, draw } = L();
      const col = fam ? famColor(fam) : '#123047';
      doc.setFillColor(L().lighten(col, 0.94)); doc.setDrawColor(col); doc.setLineWidth(0.8 * s); doc.roundedRect(x, y, w, 16 * s, 3 * s, 3 * s, 'FD');
      const b = mathBox(doc, title, 19 * s, true); draw(doc, b, x + 5 * s, y + 10.5 * s, col);
      if (sub) { setF(doc, 'bold', 10 * s); const rw = right ? doc.getTextWidth(right) + 9 * s : 4 * s; let fs = 10 * s; setF(doc, 'normal', fs); const avail = w - (5 * s + b.w + 4 * s) - rw; if (doc.getTextWidth(sub) > avail) { fs *= Math.max(0.6, avail / doc.getTextWidth(sub)); setF(doc, 'normal', fs); } if (doc.getTextWidth(sub) <= avail) { doc.setTextColor('#55636f'); doc.text(sub, x + 5 * s + b.w + 4 * s, y + 10.2 * s); } }
      if (right) { setF(doc, 'bold', 10 * s); doc.setTextColor(col); doc.text(right, x + w - 5 * s - doc.getTextWidth(right), y + 10.2 * s); }
    });
  }


  /* Skýring á mannamáli fyrir hvert skref */
  function stepWhy(st, id) {
    const h = st.h;
    const base = {
      'Formúla': 'Veldu formúluna sem hefur stafinn sem þú leitar að einan vinstra megin við =.',
      'Formúla – umrituð': 'Formúlunni er snúið svo stafurinn sem þú leitar að standi einn vinstra megin. Það sem var neðan við strikið fer upp hinum megin, og öfugt.',
      'Settu tölurnar inn': 'Settu tölurnar í stað stafanna. Reiknaðu fyrst það sem er ofan við strikið, deildu svo með því sem er neðan við það.',
      'Berðu saman við töfluna': 'Finndu efnið í töflunni á bls. ' + pageOf('tables1') + ' sem hefur næstum sama ρ. Það er svarið.',
      'Hitastigsbreytingin': 'Δ þýðir breyting. Hér finnum við hve margar gráður hitinn breyttist. Deilt er með FYRRA viðnáminu.',
      'Lokahitastigið': 'Δt er bara breytingin. Leggðu hana við hitann í byrjun til að fá hitann í lokin.',
      'Formúlur': 'Hitnar: leggja við (+). Kólnar: draga frá (−).',
      'Spennufallið': 'Spennufall = hve mörg volt tapast í vírunum. Straumur sinnum viðnám leiðslunnar.',
      'Spennufall í prósentum': 'Deildu voltunum sem tapast með spennu gjafans og margfaldaðu með 100.',
      'Leyft viðnám (Ohmslögmál)': 'Ef vitað er hve mörg volt mega tapast og hve mikill straumurinn er, má finna hve mikið viðnám vírarnir mega hafa: R = ΔU / I.',
      'Lengd – umrituð formúla': 'R·A/ρ gefur lengd ALLS vírsins. Kapallinn er með tvo víra (fram og til baka), svo deilt er með 2.',
      'Þverflatarmál – umrituð formúla': 'Hér er formúlunni snúið til að finna sverleikann A. Margfaldað með 2 af því vírarnir eru tveir.',
      'Leyft spennufall í voltum': 'Prósentunni er breytt í volt: % sinnum spennan, deilt með 100.',
      'Viðnám leiðslunnar (tvíleiðari)': 'Í kapli eru tveir vírar: rafmagnið fer FRAM eftir öðrum og TIL BAKA eftir hinum. Þess vegna er margfaldað með 2.',
      'Breyttu lengdinni í metra': 'Formúlurnar nota metra. 1 km = 1000 m.',
      'Finndu þverflatarmálið út frá þvermálinu': 'Þvermál er ekki það sama og þverflatarmál. Helmingaðu þvermálið (r = d/2) og reiknaðu A = π·r².',
      'Viðnám upphaflega leiðarans': 'Fyrst reiknum við viðnám gamla vírsins. Nýi vírinn á að hafa nákvæmlega sama viðnám.',
    };
    const key = h.replace(/^[a-e]\)\s*/, '');
    if (base[key]) return base[key];
    if (/^[a-e]\) Nýtt efni/.test(h)) return 'Sama viðnám R, en nýtt ρ. Efni sem leiðir verr (meira ρ) þarf sverari vír.';
    if (/Hitun upp/.test(h)) return 'Hitinn hækkar: finndu Δt (mismuninn) og LEGGÐU breytinguna við.';
    if (/Kólnun niður/.test(h)) return 'Hitinn lækkar: finndu Δt og DRAGÐU breytinguna frá.' + (/−/.test(h) ? ' Teldu gráðurnar yfir núllið.' : '');
    if (/Spennufallið/.test(h)) return base['Spennufallið'];
    if (/Spenna spennugjafans/.test(h)) return 'Gjafinn þarf að gefa spennuna sem tækið fær PLÚS voltin sem tapast í vírunum.';
    if (/Spennufall í %/.test(h)) return base['Spennufall í prósentum'];
    return null;
  }

  /* „Ef dæmið gefur þvermál eða radíus“ – reiknað með tölum dæmisins sjálfs */
  function diameterBox(id, p, col) {
    const { Box, Para, Formula } = L();
    const g2 = (x) => RF.util.fmt(x, 2), f = RF.util.fmtS;
    if (id === 'S5') {
      const A = RF.ptype('S5').solve(p).v.A;
      const dd = 2 * Math.sqrt(A / Math.PI);
      return Box([Para({ src: 'Svarið A er í mm². Ef spurt er um **þvermál** vírsins: snúðu A = π·r² við.', size: 11, gapAfter: 0.6 }), Formula('r = √(A / π) = √(' + f(A) + ' / 3,14) = ' + g2(dd / 2) + ' mm    →    d = 2·r = ' + g2(dd) + ' mm', { size: 12.5, gap: 0.4, indent: 2 })], { title: 'Ef spurt er um þvermál', color: famColorL('R'), gapAfter: 3 });
    }
    if (!['V1', 'V2', 'V3', 'V4', 'S1', 'S2', 'S3', 'S4', 'S6', 'S7'].includes(id) || p.A == null) return null;
    const A0 = p.A, d = Math.round(2 * Math.sqrt(A0 / Math.PI) * 100) / 100, r = d / 2, A = Math.PI * r * r;
    return Box([
      Para({ src: 'Hér er gefið **' + g2(A0) + ' mm²** (þverflatarmál). Segjum að dæmið hefði í staðinn gefið **þvermál d = ' + g2(d) + ' mm**. Þá reiknarðu A fyrst:', size: 11, gapAfter: 1 }),
      Formula('1)  r = \\f{d}{2} = \\f{' + g2(d) + '}{2} = ' + RF.util.fmt(r, 3) + ' mm', { size: 13, gap: 0.6, indent: 3 }),
      Formula('2)  A = π·r^2 = 3,14·' + RF.util.fmt(r, 3) + '·' + RF.util.fmt(r, 3) + ' = ' + f(A) + ' mm²', { size: 13, gap: 0.6, indent: 3 }),
      Para({ src: '3)  Notaðu svo **A ≈ ' + g2(A) + ' mm²** í formúlunni eins og hér fyrir ofan.   **Radíus gefinn?** Slepptu skrefi 1.   Sjá líka töfluna á bls. ' + pageOf('tables2') + '.', size: 11, gapAfter: 0 }),
    ], { title: 'Ef dæmið gefur þvermál eða radíus í stað mm²', color: famColorL('R'), gapAfter: 3 });
  }
  const famColorL = (f) => L().famColor(f);

  /* Tveir dálkar: teikning vinstra megin, blokkir hægra megin */
  function Side(leftW, leftH, drawLeft, right) {
    return {
      measure(doc, w, s) { this.rh = right.map((b) => b.measure(doc, w - leftW * s, s)); this.h = Math.max(leftH * s, this.rh.reduce((a, b) => a + b, 0)); return this.h + 2 * s; },
      draw(doc, x, y, w, s) { drawLeft(doc, x, y, leftW * s, this.h, s); let yy = y; right.forEach((b, i) => { b.draw(doc, x + leftW * s, yy, w - leftW * s, s); yy += this.rh[i]; }); },
    };
  }

  /* Súlurit yfir eðlisviðnám góðra leiðara */
  function RhoBars(keys) {
    return {
      measure: (doc, w, s) => (keys.length * 8.2 + 3) * s,
      draw(doc, x, y, w, s) {
        const { setF, famColor, lighten } = L();
        const max = 0.1, bx = x + 34 * s, bw = 62 * s;
        keys.forEach((k, i) => {
          const m = RF.mat(k), yy = y + i * 8.2 * s;
          if (i % 2 === 0) { doc.setFillColor('#f4f7fa'); doc.rect(x, yy, w, 8.2 * s, 'F'); }
          setF(doc, m.src === 'kennari' ? 'bold' : 'normal', 11 * s); doc.setTextColor('#14202b');
          doc.text(m.name.replace(/ \(.*\)/, '') + (m.src === 'kennari' ? '' : '*'), x + 2 * s, yy + 5.6 * s);
          const bc = k === 'kopar' ? famColor('U') : famColor('R'); doc.setFillColor(lighten(bc, 0.82)); doc.setDrawColor(bc); doc.setLineWidth(0.35 * s);
          doc.roundedRect(bx, yy + 1.8 * s, Math.max(1, (m.rho / max) * bw), 4.6 * s, 1 * s, 1 * s, 'FD');
          setF(doc, 'bold', 11 * s); doc.setTextColor('#14202b');
          doc.text(RF.util.fmt(m.rho, 5), bx + bw + 3 * s, yy + 5.6 * s);
          setF(doc, 'normal', 9.4 * s); doc.setTextColor('#3d4a55');
          const use = doc.splitTextToSize(m.use, w - (bx + bw + 22 * s - x));
          doc.text(use[0], bx + bw + 21 * s, yy + 5.4 * s);
        });
      },
    };
  }

  function tablesPage1() {
    const { Break, Para, Table, famColor } = L();
    const alphaRow = (k) => { const m = RF.mat(k); const a = m.alpha; return [(m.srcA === 'kennari' ? '**' + m.name + '**' : m.name + '*'), a >= 0.001 ? RF.util.fmt(a, 5) : '≈ 0', a >= 0.001 ? 'Um ' + RF.util.fmt(a * 100, 2) + ' % á hverja gráðu' : 'Breytist nær ekkert', a >= 0.001 ? RF.util.fmt(10 * (1 + a * 10), 3) + ' Ω' : '10 Ω']; };
    return [
      Break(),
      mark(headerBand('Mikilvægar töflur: efnin', 'Eðlisviðnám, hitastuðlar og flokkar efna', null, 'bls. ' + pageOf('tables1')), 'tables1'),
      Label('Eðlisviðnám ρ – hve tregt er efnið?', famColor('R'), { n: 'A' }),
      Para({ src: '**Stutt súla = lítið ρ = góður leiðari.**  Eining: Ω·mm²/m (við 20 °C).  Kopar er grænn: hann er notaður mest.', size: 11, gapAfter: 1.5 }),
      RhoBars(['silfur', 'kopar', 'gull', 'al', 'volfram', 'nikkel', 'platina', 'jarn']),
      Para({ src: '**Mótstöðuefni** hafa MIKIÐ ρ. Þau eru notuð þegar maður VILL fá viðnám og hita:', size: 11, gapAfter: 1 }),
      Table([['Efni', 'ρ (Ω·mm²/m)', 'Miðað við kopar', 'Notkun'], ...['manganin', 'konstantan', 'kromnikkel'].map((k) => { const m = RF.mat(k); return [(m.src === 'kennari' ? '**' + m.name + '**' : m.name + '*'), RF.util.fmt(m.rho, 4), 'um ' + Math.round(m.rho / 0.0178) + ' sinnum meira', m.use]; })], [1.2, 1, 1.3, 2.6], { size: 10.5, zebra: true, gapAfter: 1 }),
      Para({ src: '**Feitletrað** = gildi frá kennara.  * = almennt gildi úr handbókum (ekki í gögnum kennara).', size: 9.5, color: '#55636f', gapAfter: 3 }),
      Label('Hitastuðull α – hve mikið breytist viðnámið við hita?', famColor('T'), { n: 'B' }),
      Table([['Efni', 'α (1/°C)', 'Á mannamáli', '10 Ω hitað um 10 °C verður'], ...['kopar', 'nikkel', 'al', 'silfur', 'platina', 'jarn', 'volfram', 'manganin'].map(alphaRow)], [1.3, 0.9, 2.1, 1.6], { size: 10.5, zebra: true, gapAfter: 3 }),
      Label('Flokkar efna – hvað ber strauminn?', famColor('U'), { n: 'C' }),
      Table([['Flokkur', 'Hvað ber strauminn?', 'Dæmi'], ['**Málmar**', 'Frjálsar rafeindir', 'Kopar, ál, silfur, gull'], ['**Vökvar** (raflausnir)', 'Jónir (hlaðnar agnir)', 'Saltvatn, sýra, rafgeymir'], ['**Lofttegundir**', 'Aðeins jónað gas', 'Elding, neisti, flúrpera'], ['**Hálfleiðarar**', 'Rafeindir – meira þegar heitt', 'Kísill, german, díóður'], ['**Einangrarar**', 'Nær ekkert', 'Gler, postulín, plast, gúmmí']], [1.4, 1.8, 2], { size: 10.5, zebra: true, gapAfter: 0.5 }),
      Para({ src: 'Flokkunin byggir á almennri þekkingu – glærur 3.1/3.2 fylgdu ekki með gögnunum.', size: 9, color: '#55636f', gapAfter: 0 }),
    ];
  }

  function circleFig(doc, x, y, w, h, s) {
    const { setF, draw, mathBox } = L();
    const cx = x + w / 2 - 2 * s, cy = y + 22 * s, R = 17 * s;
    doc.setFillColor('#fbeee3'); doc.setDrawColor('#7d4318'); doc.setLineWidth(0.6 * s);
    doc.circle(cx, cy, R, 'FD');
    doc.setDrawColor('#123047'); doc.setLineWidth(0.8 * s); doc.line(cx - R, cy, cx + R, cy);
    doc.setDrawColor('#b4530a'); doc.setLineWidth(0.8 * s); doc.setLineDashPattern([1.6 * s, 1.2 * s], 0); doc.line(cx, cy, cx, cy - R); doc.setLineDashPattern([], 0);
    doc.setFillColor('#123047'); doc.circle(cx, cy, 0.9 * s, 'F');
    const T = (t, tx, ty, c) => { const b = mathBox(doc, t, 12 * s, true); draw(doc, b, tx - b.w / 2, ty, c); };
    T('d = þvermál', cx, cy + R + 6 * s, '#123047');
    T('r', cx + 3.5 * s, cy - R / 2, '#b4530a');
    setF(doc, 'normal', 9 * s); doc.setTextColor('#55636f');
    doc.text('A = allur litaði flöturinn', cx - doc.getTextWidth('A = allur litaði flöturinn') / 2, cy + R + 11.5 * s);
  }

  function tablesPage2() {
    const { Break, Para, Table, Formula, Box, famColor } = L();
    const f = RF.util.fmtS, g2 = (x) => RF.util.fmt(x, 3);
    const ds = [0.5, 0.8, 1, 1.13, 1.38, 1.6, 1.78, 2, 2.26, 2.5, 3];
    const forms = [['Viðnám', 'R = \\f{ρ·l}{A}', 'V1'], ['Lengd', 'l = \\f{R·A}{ρ}', 'V2'], ['Eðlisviðnám', 'ρ = \\f{R·A}{l}', 'V3'], ['Þverflatarmál', 'A = \\f{ρ·l}{R}', 'V4'], ['Hitastig', 'Δt = \\f{R_{t2} − R_{t1}}{R_{t1}·α}', 'V5'], ['Viðnám við nýjan hita', 'R_{t2} = R_{t1} ± R_{t1}·α·Δt', 'V6'], ['Viðnám kapals (2 vírar)', 'R_l = \\f{ρ·l·2}{A}', 'S1'], ['Spennufall', 'ΔU = I·R_l', 'S2'], ['Spennufall í %', '% = \\f{ΔU}{U_1}·100', 'S3'], ['Leyft viðnám', 'R = \\f{ΔU}{I}', 'S4'], ['Spenna á tæki / gjafa', 'U_2 = U_1 − ΔU', 'S7']];
    return [
      Break(),
      mark(headerBand('Mikilvægar töflur: sverleiki og einingar', 'Þvermál → mm², kaplar, einingar, allar formúlur', null, 'bls. ' + pageOf('tables2')), 'tables2'),
      Label('Þvermál eða radíus → þverflatarmál A', famColor('R'), { n: 'D' }),
      Side(60, 54, circleFig, [
        Para({ src: '**Þvermál d** = breiddin þvert yfir. **Radíus r** = frá miðju út í brún = **helmingur** af d.', size: 11.5, gapAfter: 1.6 }),
        Para({ src: '**Ef radíus r er gefinn:**', size: 11.5, gapAfter: 0.4 }),
        Formula('A = π·r^2 = 3,14·r·r', { size: 14, gap: 1.4, indent: 4 }),
        Para({ src: '**Ef þvermál d er gefið:**  tvö skref', size: 11.5, gapAfter: 0.4 }),
        Formula('1)  r = \\f{d}{2}      2)  A = π·r^2', { size: 14, gap: 1, indent: 4 }),
        Para({ src: 'Eða í einu skrefi:  A = π·d²/4', size: 10.5, color: '#55636f', indent: 4, gapAfter: 1.2 }),
        Box([Para({ src: '**Dæmi:** d = 2 mm → r = 1 mm → A = 3,14·1·1 = **3,14 mm²**', size: 11.5, gapAfter: 0.4 }), Para({ src: '**Varúð:** π·d² (án ÷4) gefur **4 sinnum** of mikið!', size: 11.5, color: '#8a2a12', gapAfter: 0 })], { color: '#b4530a', fill: '#fdeedd', pad: 1.8, gapAfter: 0 }),
      ]),
      Table([['Þvermál d (mm)', ...ds.map((x) => RF.util.fmt(x, 2))], ['Radíus r (mm)', ...ds.map((x) => RF.util.fmt(x / 2, 3))], ['**A (mm²)**', ...ds.map((x) => '**' + f(Math.PI * x * x / 4).replace(/(,\d\d)\d+$/, '$1') + '**')]], [2.1, ...ds.map(() => 1)], { size: 9.6, gapAfter: 3.5 }),
      Label('Staðalstærðir kapla (mm²)', famColor('U'), { n: 'E' }),
      Chips(RF.stdAreas.slice(0, 11).map((a) => RF.util.fmt(a, 2)), famColor('U'), { size: 12, gapAfter: 1.5 }),
      Para({ src: 'Ef þú reiknar t.d. 24,03 mm² velurðu **næstu stærð fyrir ofan: 25 mm²**. Aldrei minni, því þá tapast of mörg volt.', size: 11, gapAfter: 3.5 }),
      Label('Einingar – breyttu fyrst í rétta einingu', '#123047', { n: 'F' }),
      Table([['Ef þú sérð …', 'Breyttu í …', 'Dæmi'], ['km (kílómetrar)', 'm: sinnum 1000', '0,2 km = 200 m'], ['cm / mm (lengd)', 'm: deilt með 100 / 1000', '50 cm = 0,5 m'], ['kΩ (kíló-óm)', 'Ω: sinnum 1000', '2,2 kΩ = 2200 Ω'], ['mA (milliamper)', 'A: deilt með 1000', '500 mA = 0,5 A'], ['kV (kílóvolt)', 'V: sinnum 1000', '0,4 kV = 400 V'], ['% (prósent)', 'hlutfall: deilt með 100', '5 % = 0,05']], [1.5, 1.7, 1.5], { size: 10.5, zebra: true, gapAfter: 3.5 }),
      Break(),
      mark(headerBand('Allar formúlurnar á einum stað', 'Finndu það sem þú átt að finna – farðu svo á síðuna', null, 'bls. ' + pageOf('forms')), 'forms'),
      Para({ src: 'Vinstra megin er það sem spurt er um. Í miðjunni er formúlan. Til hægri er síðan þar sem dæmið er útskýrt.', size: 11.5, gapAfter: 2.5 }),
      Table([['Ég á að finna …', 'Formúla', 'Dæmi', 'Bls.'], ...forms.map(([a, fm, id]) => [a, fm, '**' + id + '**', String(pageOf(id))])], [1.9, 2.6, 0.6, 0.6], { size: 14, zebra: true, gapAfter: 3 }),
      Box([Para({ src: '**Spennufall í kapli með tveimur vírum, í einu skrefi:**', size: 12, gapAfter: 0.8 }), Formula('ΔU = I·\\f{ρ·l·2}{A}', { size: 18, gap: 0.6, indent: 4 }), Para({ src: '**Hámarkslengd:**  l = R·A/(ρ·2)      **Nauðsynlegt þverflatarmál:**  A = ρ·l·2/R', size: 12, gapAfter: 0 })], { color: famColor('U'), gapAfter: 0 }),
    ];
  }

  function page1() {
    const { Para, Box, Formula } = L();
    return [
      mark(headerBand('Hvað þýða stafirnir?', 'Orðabók – flettu hingað þegar þú ert óviss', null, 'bls. 1'), 'sym'),
      Box([Para({ src: '**Hugsaðu um rafmagn eins og vatn í slöngu:**  spennan **U** ýtir · straumurinn **I** rennur · viðnámið **R** þrengir að.', size: 11.5, gapAfter: 0.3 })], { color: '#0b7a70', fill: '#e3f6f3', gapAfter: 2.4 }),
      ...['R', 'I', 'U', 'ρ', 'l', 'A', 'd', 'r', 't', 'α', 'Δ', 'π', 'sub', 'Rl', 'pct'].map(SymRow),
      Box([Para({ src: '**Svona lestu formúlu:**   strik = **deilt með** (efra deilt með neðra)  ·  punktur **·** = **sinnum**  ·  **=** „er jafnt og“', size: 10.8, gapAfter: 0.2 }), Formula('R = \\f{ρ·l}{A}   →   „R er ρ sinnum l, deilt með A“', { size: 13, gap: 0.2 })], { color: '#1b3a57', gapAfter: 0 }),
    ];
  }

  function flowChart() {
    return Custom(78, (doc, x, y, w, s) => {
      const { setF, famColor, lighten, mathBox, draw, INK } = L();
      const box = (bx, by, bw, bh, fill, stroke, text, sz, bold, tc) => {
        doc.setFillColor(fill); doc.setDrawColor(stroke); doc.setLineWidth(0.5 * s);
        doc.roundedRect(bx, by, bw, bh, 3 * s, 3 * s, 'FD');
        const lines = text.split('\n');
        lines.forEach((ln, i) => { const b = mathBox(doc, ln, sz * s, bold); draw(doc, b, bx + bw / 2 - b.w / 2, by + bh / 2 + (i - (lines.length - 1) / 2) * sz * s * 0.42 + sz * s * 0.13, tc || INK); });
      };
      const arrow = (x1, y1, x2, y2, label) => {
        doc.setDrawColor('#55636f'); doc.setLineWidth(0.6 * s); doc.line(x1, y1, x2, y2);
        const a = Math.atan2(y2 - y1, x2 - x1), k = 2.4 * s;
        doc.setFillColor('#55636f');
        doc.triangle(x2, y2, x2 - k * Math.cos(a - 0.5), y2 - k * Math.sin(a - 0.5), x2 - k * Math.cos(a + 0.5), y2 - k * Math.sin(a + 0.5), 'F');
        if (label) { setF(doc, 'bold', 9.5 * s); doc.setTextColor('#55636f'); doc.text(label, (x1 + x2) / 2 + 1.5 * s, (y1 + y2) / 2 - 1.2 * s); }
      };
      const qw = w * 0.56, qx = x, rx = x + qw + 16 * s, rw = w - qw - 16 * s, bh = 15 * s;
      const C = { R: famColor('R'), T: famColor('T'), U: famColor('U') };
      box(qx, y, qw, 11 * s, '#eef3f7', '#1b3a57', '**Lestu dæmið. Finndu einingar og orð.**', 11.5, true);
      arrow(qx + qw / 2, y + 11 * s, qx + qw / 2, y + 16 * s);
      box(qx, y + 16 * s, qw, bh, '#ffffff', C.T, 'Er **°C**, „hitnar“ eða „kólnar“ í dæminu?', 11, false);
      arrow(qx + qw, y + 16 * s + bh / 2, rx, y + 16 * s + bh / 2, 'JÁ');
      box(rx, y + 16 * s, rw, bh, lighten(C.T, 0.94), C.T, '**HITI**\nbls. ' + pageOf('V5') + '–' + (pageOf('V6') + 1), 12, true, C.T);
      arrow(qx + qw / 2, y + 16 * s + bh, qx + qw / 2, y + 37 * s, 'NEI');
      box(qx, y + 37 * s, qw, bh, '#ffffff', C.U, 'Er **A** (straumur), **V** (spenna),\nkapall eða tvíleiðari?', 11, false);
      arrow(qx + qw, y + 37 * s + bh / 2, rx, y + 37 * s + bh / 2, 'JÁ');
      box(rx, y + 37 * s, rw, bh, lighten(C.U, 0.94), C.U, '**SPENNUFALL**\nbls. ' + pageOf('S1') + '–' + (pageOf('S7') + 1), 12, true, C.U);
      arrow(qx + qw / 2, y + 37 * s + bh, qx + qw / 2, y + 58 * s, 'NEI');
      box(qx, y + 58 * s, qw, bh, lighten(C.R, 0.94), C.R, '**VÍR OG EFNI**  (m, mm², Ω, kopar …)\nbls. ' + pageOf('V1') + '–' + (pageOf('V4') + 1), 11.5, true, C.R);
    });
  }
  function famPanel(fam, title, rows) {
    const { Box, Table, famColor } = L();
    return Box([Table([['Ég á að finna …', 'Dæmi', 'Bls.'], ...rows.map(([what, id]) => [what, '**' + id + '**', String(pageOf(id))])], [3.4, 0.7, 0.6], { size: 10.5, zebra: true, gapAfter: 0 })], { title, color: famColor(fam), gapAfter: 2.6 });
  }
  function page2() {
    const { Break, Box, Para } = L();
    return [
      Break(),
      mark(headerBand('Hvaða dæmi er þetta?', 'Svaraðu spurningunum – fylgdu örvunum', null, 'bls. ' + pageOf('which')), 'which'),
      flowChart(),
      famPanel('R', 'Vír og efni  ·  m, mm², Ω, kopar, ál', [['Hve mikið bremsar vírinn?  (viðnám R)', 'V1'], ['Hve langur er vírinn?  (lengd l)', 'V2'], ['Úr hvaða efni?  (ρ)', 'V3'], ['Nýtt efni, sama viðnám  (A)', 'V4']]),
      famPanel('T', 'Hiti  ·  °C, hitnar, kólnar, α', [['Hve heitt varð?  (tvö viðnám gefin)', 'V5'], ['Nýtt viðnám við nýjan hita  (tvö hitastig gefin)', 'V6']]),
      famPanel('U', 'Spennufall  ·  A, V, kapall, tvíleiðari', [['Viðnám kapalsins  (R_l)', 'S1'], ['Hve mörg volt tapast?  (ΔU)', 'S2'], ['Hve mörg % tapast?', 'S3'], ['Hve langur má kapallinn vera?', 'S4'], ['Hve sver þarf kapallinn að vera?  (mm²)', 'S5'], ['Volt sem tapast í langri leiðslu', 'S6'], ['Spenna gjafans  (U₁)', 'S7']]),
      Box([Para({ src: '**1.**  Kapall / tvíleiðari → rafmagnið fer **fram og til baka** → **× 2**', size: 12, gapAfter: 1 }), Para({ src: '**2.**  Lengd í **metrum**, sverleiki í **mm²**. Þvermál er ekki það sama og mm².', size: 12, gapAfter: 1 }), Para({ src: '**3.**  Skrifaðu alltaf **einingu** með svarinu (Ω, m, mm², V, °C, %).', size: 12, gapAfter: 0 })], { title: 'Þrjár reglur sem gilda alltaf', color: '#123047', gapAfter: 0 }),
    ];
  }

  function typePage(id) {
    const { Para, Box, Formula, Break, famColor, mathBox, draw, setF, MUTED, clean } = L();
    const t = RF.ptype(id), d = T[id], col = famColor(t.fam);
    const pr = RF.makeProblem(id, 'orig');
    const sol = t.solve(pr.p);
    const famName = { R: 'Vír og efni', T: 'Hiti', U: 'Spennufall' }[t.fam];
    const out = [Break(), mark(headerBand(id + '  ' + t.title, famName, t.fam, 'bls. ' + pageOf(id)), id)];
    // á mannamáli + mynd
    out.push(Custom(44, (doc, x, y, w, s) => {
      const lw = w * 0.56;
      const p = Para({ src: d.say, size: 16, bold: true, color: '#14202b' });
      p.measure(doc, lw, s);
      setF(doc, 'bold', 9 * s); doc.setTextColor(col); doc.text('Á MANNAMÁLI', x, y + 4 * s);
      p.draw(doc, x, y + 6 * s, lw, s);
      PICS[d.pic](doc, x + lw + 6 * s, y, w - lw - 6 * s, 42 * s, s, col);
    }));
    out.push(Label('Þú þekkir dæmið á þessu', col, { n: '1' }));
    out.push(Chips(d.clues, col, { size: 12.5, gapAfter: 4 }));
    out.push(Label('Þú átt að finna', col, { n: '2' }));
    out.push(Chips([d.find], col, { size: 14, gapAfter: 4 }));
    out.push(Label('Formúlan', col, { n: '3' }));
    const formulas = { V1: ['R = \\f{ρ·l}{A}'], V2: ['l = \\f{R·A}{ρ}'], V3: ['ρ = \\f{R·A}{l}'], V4: ['R = \\f{ρ·l}{A}', 'A = \\f{ρ_{nýtt}·l}{R}'], V5: ['Δt = \\f{R_{t2} − R_{t1}}{R_{t1}·α}', 't_2 = t_1 + Δt'], V6: ['R_{t2} = R_{t1} ± R_{t1}·α·Δt'], S1: ['R_l = \\f{ρ·l·2}{A}'], S2: ['R_l = \\f{ρ·l·2}{A}', 'ΔU = I·R_l'], S3: ['ΔU = I·R_l', '% = \\f{ΔU}{U_1}·100'], S4: ['R = \\f{ΔU}{I}', 'l = \\f{R·A}{ρ·2}'], S5: ['R = \\f{ΔU}{I}', 'A = \\f{ρ·l·2}{R}'], S6: ['ΔU = I·\\f{ρ·l·2}{A}'], S7: ['R_l = \\f{ρ·l·2}{A}', 'ΔU = I·R_l', 'U_1 = U_2 + ΔU'] }[id];
    const legend = d.syms.map((k) => '**' + SYM[k][0] + '** = ' + SYM[k][1].toLowerCase().replace(/ \(.*\)/, '')).join('   ·   ');
    out.push(Box([FormulaRow(formulas), Para({ src: legend, size: 10.5, color: MUTED, gapAfter: 0 })], { color: col, gapAfter: 4 }));
    out.push(Box([Para({ src: '**Næsta síða:** dæmi kennarans reiknað skref fyrir skref, með skýringu á hverju skrefi.', size: 11.5, gapAfter: 0 })], { color: col, fill: '#ffffff', gapAfter: 0 }));
    // útreikningur – sér síða
    out.push(Break(), headerBand(id + '  Svona reiknarðu', t.title, t.fam, 'bls. ' + (pageOf(id) === '?' ? '?' : pageOf(id) + 1)));
    out.push(Label('Svona reiknarðu – dæmi kennarans (' + t.source + ')', col, { n: '4' }));
    out.push(Box([Para({ src: pr.text, size: 11, color: '#33414d', gapAfter: 0 })], { color: '#9aa7b2', fill: '#f4f6f8', pad: 2.2, gapAfter: 3.5 }));
    out.push(Para({ src: '**Hvað er gefið?**  Skrifaðu tölurnar niður með einingum:', size: 11.5, color: '#14202b', gapAfter: 1 }));
    out.push(Chips(t.given(pr.p).map(([sy, val, nm]) => '**' + sy + '** = ' + val + '  (' + (nm === 'ρ úr töflu' || nm === 'α úr töflu' ? nm.replace('úr töflu', 'úr töflu á bls. ' + pageOf('tables1')) : nm) + ')'), '#55636f', { size: 11, gapAfter: 3.5 }));
    let n = 0;
    sol.steps.forEach((st) => {
      if (st.diagram) return;
      n++;
      out.push(Para({ src: '**' + n + '.  ' + clean(st.h) + '**', size: 12.5, color: col, gapAfter: 0.4 }));
      const why = stepWhy(st, id);
      if (why) out.push(Para({ src: why, size: 10.8, color: '#3d4a55', indent: 5, gapAfter: 0.8 }));
      st.m.forEach((ml) => out.push(Formula(ml, { size: 15.5, gap: 1.6, indent: 6 })));
      out.push(Custom(2, () => {}));
    });
    const parts = t.parts(pr.p);
    out.push(Box([Para({ src: '**Svar:**  ' + parts.map((pt) => pt.label.replace(/^[a-e]\)\s*/, '') + ' = **' + RF.valueTextPlain(pt, sol.v[pt.k]) + '**').join('   ·   '), size: 12.5, gapAfter: 0 })], { color: '#11704a', fill: '#e2f5ea', pad: 2.4, gapAfter: 3 }));
    const db = diameterBox(id, pr.p, col);
    if (db) out.push(db);
    out.push(Box([Para({ src: '**Passaðu þig!**  ' + d.trap, size: 13, gapAfter: 0 })], { color: '#b4530a', fill: '#fdeedd', pad: 2.6, gapAfter: 0 }));
    return out;
  }

  RF.pdf.studyGuide = async function () {
    await RF.pdf.ensure();
    const { render, out } = L();
    const cfg = { maxScale: 1, margin: 12, cols: 1, gap: 0, headH: 8, title: 'Dæmaleiðarvísir – Rafmagnsfræði 1', subtitle: 'Hvaða dæmi er þetta og hvernig reikna ég það?' };
    const blocks = () => [...page1(), ...tablesPage1(), ...tablesPage2(), ...page2(), ...ORDER.flatMap(typePage)];
    const { flow, fit } = L();
    for (let pass = 0; pass < 2; pass++) {
      const fr = fit(blocks, cfg, 99, 1);
      const res = flow(RF.pdf._mdoc(), blocks(fr.s), cfg, fr.s, false);
      Object.assign(PG, res.marks);
    }
    return out(render('Dæmaleiðarvísir – Rafmagnsfræði 1', blocks, cfg, 99, 1));
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

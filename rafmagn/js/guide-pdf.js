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
    γ: ['γ', 'Eðlisleiðni (gamma, á glærum G)', 'Hve VEL efnið leiðir. Öfugt við ρ: γ = 1/ρ. Kopar ≈ 56.', 'm/(Ω·mm²)', 'R'],
    G: ['G', 'Leiðni', 'Hve vel EINN vír eða hlutur leiðir. Öfugt við viðnám: G = 1/R.', 'S (siemens)', 'R'],
    ohm: ['U=I·R', 'Ohmslögmál', 'Spenna = straumur sinnum viðnám. Má snúa við: I = U/R og R = U/I.', '–', 'U'],
    RH: ['R_H', 'Heildarviðnám', 'Viðnám leiðslunnar og tækisins lagt saman: R_H = R_l + R_álag.', 'Ω', 'U'],
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
        this.h = Math.max(10.2 * s, 4.8 * s + this.lines);
        return this.h + 0.8 * s;
      },
      draw(doc, x, y, w, s) {
        const { mathBox, draw, setF, famColor, lighten, Para, INK, MUTED } = L();
        const col = famColor(fam);
        doc.setFillColor(lighten(col, 0.97)); doc.setDrawColor(lighten(col, 0.6)); doc.setLineWidth(0.25 * s);
        doc.roundedRect(x, y, w, this.h, 2.5 * s, 2.5 * s, 'FD');
        doc.setFillColor('#ffffff'); doc.setDrawColor(col); doc.setLineWidth(0.7 * s);
        doc.roundedRect(x + 2 * s, y + this.h / 2 - 4.5 * s, 20 * s, 9 * s, 4.5 * s, 4.5 * s, 'FD');
        let b = mathBox(doc, sym, 15 * s, true);
        if (b.w > 17 * s) b = mathBox(doc, sym, 15 * s * (17 * s) / b.w, true);
        draw(doc, b, x + 12 * s - b.w / 2, y + this.h / 2 + 1.9 * s, col);
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
    if (!['V1', 'V2', 'V3', 'V4', 'S1', 'S2', 'S3', 'S4', 'S6'].includes(id) || p.A == null) return null;
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
    const { Break, Para, Table, Box, famColor } = L();
    const alphaRow = (k) => { const m = RF.mat(k); const a = m.alpha; return [(m.srcA === 'kennari' ? '**' + m.name + '**' : m.name + '*'), a >= 0.001 ? RF.util.fmt(a, 5) : '≈ 0', a >= 0.001 ? 'Um ' + RF.util.fmt(a * 100, 2) + ' % á hverja gráðu' : 'Breytist nær ekkert', a >= 0.001 ? RF.util.fmt(10 * (1 + a * 10), 3) + ' Ω' : '10 Ω']; };
    return [
      Break(),
      mark(headerBand('Mikilvægar töflur: efnin', 'Eðlisviðnám, hitastuðlar og flokkar efna', null, 'bls. ' + pageOf('tables1')), 'tables1'),
      Label('Eðlisviðnám ρ – hve tregt er efnið?', famColor('R'), { n: 'A' }),
      Para({ src: '**Stutt súla = lítið ρ = góður leiðari.**  Eining: Ω·mm²/m (við 20 °C).  Kopar er grænn: hann er notaður mest.', size: 11, gapAfter: 1.5 }),
      RhoBars(['silfur', 'kopar', 'gull', 'al', 'volfram', 'nikkel', 'platina', 'jarn']),
      Box([Para({ src: '**Eðlisleiðni γ = 1/ρ** – hve VEL efnið leiðir (öfugt við ρ). Mikið γ = góður leiðari.', size: 11, gapAfter: 0.6 }), Para({ src: 'Silfur **59,9** · Kopar **56,2** · Gull **41,0** · Ál **36,0** · Járn **10,0**   (m/(Ω·mm²))', size: 11, gapAfter: 0.6 }), Para({ src: 'Fáirðu γ í dæmi: **ρ = 1/γ**, t.d. 1/56 = 0,0179. Sjá dæmi L1 á bls. ' + pageOf('L1') + '.', size: 10.5, color: '#3d4a55', gapAfter: 0 })], { color: famColor('R'), pad: 1.8, gapAfter: 2.5 }),
      Para({ src: '**Mótstöðuefni** hafa MIKIÐ ρ. Þau eru notuð þegar maður VILL fá viðnám og hita:', size: 11, gapAfter: 1 }),
      Table([['Efni', 'ρ (Ω·mm²/m)', 'Miðað við kopar', 'Notkun'], ...['manganin', 'konstantan', 'kromnikkel'].map((k) => { const m = RF.mat(k); return [(m.src === 'kennari' ? '**' + m.name + '**' : m.name + '*'), RF.util.fmt(m.rho, 4), 'um ' + Math.round(m.rho / 0.0178) + ' sinnum meira', m.use]; })], [1.2, 1, 1.3, 2.6], { size: 10.5, zebra: true, gapAfter: 1 }),
      Para({ src: '**Feitletrað** = gildi frá kennara.  * = almennt gildi úr handbókum (ekki í gögnum kennara).', size: 9.5, color: '#55636f', gapAfter: 3 }),
      Label('Hitastuðull α – hve mikið breytist viðnámið við hita?', famColor('T'), { n: 'B' }),
      Table([['Efni', 'α (1/°C)', 'Á mannamáli', '10 Ω hitað um 10 °C verður'], ...['kopar', 'nikkel', 'al', 'silfur', 'platina', 'jarn', 'volfram', 'manganin'].map(alphaRow)], [1.3, 0.9, 2.1, 1.6], { size: 10.5, zebra: true, gapAfter: 3 }),
      Break(),
      mark(headerBand('Mikilvægar töflur: flokkar efna', 'Leiðarar, einangrarar og galvanhúðun', null, 'bls. ' + pageOf('flokkar')), 'flokkar'),
      Label('Flokkar efna – hvað ber strauminn?', famColor('U'), { n: 'C' }),
      Table([['Flokkur', 'Hvað ber strauminn?', 'Dæmi'], ['**Málmar**', 'Frjálsar rafeindir', 'Kopar, ál, silfur, gull'], ['**Vökvar** (raflausnir)', 'Jónir (hlaðnar agnir)', 'Saltvatn, sýra, rafgeymir'], ['**Lofttegundir**', 'Aðeins jónað gas', 'Elding, neisti, flúrpera'], ['**Hálfleiðarar**', 'Rafeindir – meira þegar heitt', 'Kísill, german, díóður'], ['**Einangrarar**', 'Nær ekkert', 'Gler, postulín, plast, gúmmí']], [1.4, 1.8, 2], { size: 12, zebra: true, gapAfter: 0.5 }),
      Para({ src: 'Flokkunin byggir á almennri þekkingu – glærur 3.1/3.2 fylgdu ekki með gögnunum.', size: 9, color: '#55636f', gapAfter: 2.5 }),
      Label('Galvanhúðun (galvanísering) – straumur í vökva', famColor('U'), { n: 'D' }),
      Side(62, 40, galvFig, [
        Para({ src: '**Til hvers?** Að setja þunnt málmlag (sink, nikkel, króm, silfur) á hlut, svo hann ryðgi ekki eða verði fallegri.', size: 11, gapAfter: 1.2 }),
        Para({ src: '**1.** Hluturinn fer á **mínusskautið (−)**.', size: 11, gapAfter: 0.5 }),
        Para({ src: '**2.** Húðunarmálmurinn fer á **plússkautið (+)**.', size: 11, gapAfter: 0.5 }),
        Para({ src: '**3.** Bæði ofan í **raflausn**. Straumurinn ber **jákvæðar málmjónir** yfir á hlutinn, þar sem þær setjast sem lag.', size: 11, gapAfter: 1.2 }),
        Para({ src: '**Mundu:** plúsjónir fara alltaf að **mínus**. Heitgalvanísering (stáli dýft í bráðið sink) notar ekki straum.', size: 10.2, color: '#3d4a55', gapAfter: 0 }),
      ]),
    ];
  }

  function galvFig(doc, x, y, w, h, s) {
    const { setF } = L();
    const tx = x + 4 * s, tw = w - 10 * s, ty = y + 12 * s, th = 26 * s;
    doc.setFillColor('#eef8f6'); doc.setDrawColor('#0b7a70'); doc.setLineWidth(0.5 * s);
    doc.rect(tx, ty, tw, th, 'FD');
    const ax = tx + 9 * s, kx = tx + tw - 13 * s;
    doc.setFillColor('#fbeee3'); doc.setDrawColor('#b8692f'); doc.rect(ax, ty - 6 * s, 4 * s, th, 'FD');
    doc.setFillColor('#f1f3f5'); doc.setDrawColor('#55636f'); doc.rect(kx, ty - 6 * s, 4 * s, th, 'FD');
    setF(doc, 'bold', 12 * s); doc.setTextColor('#b8692f'); doc.text('+', ax + 0.6 * s, ty - 7.5 * s);
    doc.setTextColor('#55636f'); doc.text('−', kx + 0.6 * s, ty - 7.5 * s);
    setF(doc, 'normal', 7.5 * s); doc.setTextColor('#14202b');
    doc.text('sink', ax - 1 * s, ty + th + 4 * s); doc.text('hlutur', kx - 2 * s, ty + th + 4 * s);
    doc.setDrawColor('#b8692f'); doc.setLineWidth(0.5 * s);
    [0, 1, 2].forEach((i) => { const yy = ty + 6 * s + i * 7 * s, x1 = ax + 7 * s, x2 = kx - 3 * s; doc.circle(x1 + (x2 - x1) * (0.2 + i * 0.25), yy, 1.6 * s, 'S'); doc.line(x1 + (x2 - x1) * (0.2 + i * 0.25) + 2.5 * s, yy, x2, yy); doc.line(x2, yy, x2 - 1.5 * s, yy - 1 * s); doc.line(x2, yy, x2 - 1.5 * s, yy + 1 * s); });
    setF(doc, 'normal', 7 * s); doc.setTextColor('#0b7a70'); doc.text('raflausn', tx + tw / 2 - 5 * s, ty + th - 1.5 * s);
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
    const forms = [['Viðnám', 'R = \\f{ρ·l}{A}', 'V1'], ['Lengd', 'l = \\f{R·A}{ρ}', 'V2'], ['Eðlisviðnám', 'ρ = \\f{R·A}{l}', 'V3'], ['Þverflatarmál', 'A = \\f{ρ·l}{R}', 'V4'], ['Eðlisleiðni', 'γ = \\f{1}{ρ}', 'L1'], ['Leiðni vírs', 'G = \\f{1}{R}', 'L1'], ['Viðnám út frá γ', 'R = \\f{l}{γ·A}', 'L1'], ['Hitastig', 'Δt = \\f{R_{t2} − R_{t1}}{R_{t1}·α}', 'V5'], ['Viðnám við nýjan hita', 'R_{t2} = R_{t1} ± R_{t1}·α·Δt', 'V6'], ['Viðnám kapals (2 vírar)', 'R_l = \\f{ρ·l·2}{A}', 'S1'], ['Spennufall', 'ΔU = I·R_l', 'S2'], ['Spennufall í %', '% = \\f{ΔU}{U_1}·100', 'S3'], ['Leyft viðnám', 'R = \\f{ΔU}{I}', 'S4'], ['Spenna á tæki / gjafa', 'U_2 = U_1 − ΔU', 'S7'], ['Heildarviðnám', 'R_H = R_l + R_{álag}', 'H1'], ['Straumur (Ohmslögmál)', 'I = \\f{U}{R_H}', 'H1']];
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
      Box([Para({ src: '**Svona lestu formúlu:**   strik = **deilt með** (efra deilt með neðra)  ·  punktur **·** = **sinnum**  ·  **=** „er jafnt og“', size: 10.8, gapAfter: 0.2 }), Formula('R = \\f{ρ·l}{A}   →   „R er ρ sinnum l, deilt með A“', { size: 13, gap: 0.2 })], { color: '#1b3a57', gapAfter: 3 }),
      Para({ src: 'Vinstra megin er það sem spurt er um. Í miðjunni er formúlan. Til hægri er síðan þar sem dæmið er útskýrt.', size: 11.5, gapAfter: 2.5 }),
      Table([['Ég á að finna …', 'Formúla', 'Dæmi', 'Bls.'], ...forms.map(([a, fm, id]) => [a, fm, '**' + id + '**', String(pageOf(id))])], [1.9, 2.6, 0.6, 0.6], { size: 12, zebra: true, gapAfter: 3 }),
      Box([Para({ src: '**Spennufall í kapli með tveimur vírum, í einu skrefi:**', size: 12, gapAfter: 0.8 }), Formula('ΔU = I·\\f{ρ·l·2}{A}', { size: 18, gap: 0.6, indent: 4 }), Para({ src: '**Hámarkslengd:**  l = R·A/(ρ·2)      **Nauðsynlegt þverflatarmál:**  A = ρ·l·2/R', size: 12, gapAfter: 0 })], { color: famColor('U'), gapAfter: 0 }),
    ];
  }


  /* ---------- Reiknivélin: takkar teiknaðir í réttri röð ---------- */
  const KEYS = {
    V1: [['0,0178', '×', '179,8', '÷', '1,6', '=']],
    V2: [['43', '×', '1,5', '÷', '0,43', '=']],
    V3: [['5', '×', '2,4', '÷', '120', '=']],
    V4: [['0,0278', '×', '200', '÷', '4', '='], ['0,0178', '×', '200', '÷', 'Ans', '=']],
    V5: [['(', '10', '−', '8,5', ')', '÷', '(', '8,5', '×', '0,0039', ')', '='], ['Ans', '+', '20', '=']],
    V6: [['7', '+', '7', '×', '0,0055', '×', '40', '='], ['7', '−', '7', '×', '0,0055', '×', '25', '=']],
    L1: [['1', '÷', '0,0178', '='], ['0,0178', '×', '100', '÷', '2,5', '='], ['1', '÷', 'Ans', '=']],
    S1: [['0,0178', '×', '50', '×', '2', '÷', '0,75', '=']],
    S2: [['0,0178', '×', '50', '×', '2', '÷', '0,75', '='], ['Ans', '×', '8', '=']],
    S3: [['0,0178', '×', '50', '×', '2', '÷', '0,75', '×', '8', '='], ['Ans', '÷', '220', '×', '100', '=']],
    S4: [['5', '÷', '10', '='], ['Ans', '×', '1,5', '÷', '0,0178', '÷', '2', '=']],
    S5: [['8', '÷', '60', '='], ['0,0178', '×', '90', '×', '2', '÷', 'Ans', '=']],
    S6: [['8', '×', '0,0178', '×', '100', '×', '2', '÷', '1', '=']],
    S7: [['0,0178', '×', '75', '×', '2', '÷', '1,5', '='], ['Ans', '×', '9,5', '='], ['Ans', '+', '214', '=']],
    H1: [['0,4', '+', '21,6', '='], ['220', '÷', 'Ans', '=']],
  };
  function KeysBox(id, col) {
    const rows = KEYS[id];
    if (!rows) return null;
    return {
      measure(doc, w, s) { return (9 + rows.length * 9.5) * s; },
      draw(doc, x, y, w, s) {
        const { setF, lighten } = L();
        doc.setFillColor('#ffffff'); doc.setDrawColor('#9aa7b2'); doc.setLineWidth(0.3 * s);
        doc.roundedRect(x, y, w, (6 + rows.length * 9.5) * s, 2 * s, 2 * s, 'FD');
        setF(doc, 'bold', 10.5 * s); doc.setTextColor('#14202b');
        doc.text('Á reiknivélinni:', x + 3 * s, y + 5.2 * s);
        setF(doc, 'normal', 8.8 * s); doc.setTextColor('#55636f');
        const tip = 'Komma er oft punktur á reiknivél (0,0178 → 0.0178). Ans = síðasta svar.';
        doc.text(tip, x + w - 3 * s - doc.getTextWidth(tip), y + 5.2 * s);
        rows.forEach((row, ri) => {
          let kx = x + 4 * s;
          const ky = y + 7.5 * s + ri * 9.5 * s;
          row.forEach((k) => {
            const op = /^[×÷+−=()]$/.test(k);
            setF(doc, 'bold', (op ? 13 : 11) * s);
            const kw = Math.max(op ? 7 : 9, doc.getTextWidth(k) / s + 4) * s;
            if (k === '=') { doc.setFillColor(lighten(col, 0.8)); doc.setDrawColor(col); }
            else if (op) { doc.setFillColor('#f1f3f5'); doc.setDrawColor('#7a8794'); }
            else if (k === 'Ans') { doc.setFillColor('#fff6dc'); doc.setDrawColor('#b4880a'); }
            else { doc.setFillColor('#ffffff'); doc.setDrawColor('#55636f'); }
            doc.setLineWidth(0.35 * s);
            doc.roundedRect(kx, ky, kw, 7 * s, 1.4 * s, 1.4 * s, 'FD');
            doc.setTextColor(k === '=' ? col : '#14202b');
            doc.text(k, kx + kw / 2 - doc.getTextWidth(k) / 2, ky + 5 * s);
            kx += kw + 1.6 * s;
          });
        });
      },
    };
  }

  /* ---------- Snjöll forsíða ---------- */
  function iconFor(kind, doc, cx, cy, r, s, col) {
    if (kind === 'R') { doc.setFillColor('#fbeee3'); doc.setDrawColor('#b8692f'); doc.setLineWidth(0.5 * s); doc.rect(cx - r, cy - r * 0.32, r * 1.7, r * 0.64, 'FD'); doc.setFillColor('#f6dcc5'); doc.ellipse(cx + r * 0.7, cy, r * 0.18, r * 0.32, 'FD'); }
    if (kind === 'T') { doc.setFillColor('#ffffff'); doc.setDrawColor('#55636f'); doc.setLineWidth(0.5 * s); doc.roundedRect(cx - r * 0.18, cy - r, r * 0.36, r * 1.5, r * 0.18, r * 0.18, 'FD'); doc.setFillColor('#fbe3dd'); doc.setDrawColor('#d64527'); doc.circle(cx, cy + r * 0.6, r * 0.34, 'FD'); doc.setFillColor('#f3b4a6'); doc.rect(cx - r * 0.08, cy - r * 0.4, r * 0.16, r * 0.8, 'F'); }
    if (kind === 'U') { doc.setDrawColor('#b8692f'); doc.setLineWidth(0.9 * s); doc.line(cx - r * 0.7, cy - r * 0.45, cx + r * 0.7, cy - r * 0.45); doc.line(cx - r * 0.7, cy + r * 0.45, cx + r * 0.7, cy + r * 0.45); doc.setDrawColor('#14202b'); doc.setLineWidth(0.4 * s); doc.setFillColor('#ffffff'); doc.circle(cx - r * 0.85, cy, r * 0.3, 'FD'); doc.rect(cx + r * 0.72, cy - r * 0.25, r * 0.22, r * 0.5, 'FD'); doc.line(cx - r * 0.85, cy - r * 0.3, cx - r * 0.85, cy - r * 0.45); doc.line(cx - r * 0.85, cy + r * 0.3, cx - r * 0.85, cy + r * 0.45); doc.line(cx + r * 0.83, cy - r * 0.25, cx + r * 0.83, cy - r * 0.45); doc.line(cx + r * 0.83, cy + r * 0.25, cx + r * 0.83, cy + r * 0.45); }
  }
  function cover() {
    const { Para, Box, Table, famColor } = L();
    const doors = [
      { fam: 'R', title: 'VÍR OG EFNI', see: 'm · mm² · Ω · kopar, ál · „hvaða efni?“', ids: [['V1', 'viðnám'], ['V2', 'lengd'], ['V3', 'efni / ρ'], ['V4', 'skipta um efni'], ['L1', 'leiðni']] },
      { fam: 'T', title: 'HITI', see: '°C · hitnar · kólnar · α', ids: [['V5', 'hve heitt?'], ['V6', 'R við nýjan hita']] },
      { fam: 'U', title: 'SPENNUFALL', see: 'A · V · kapall · tvíleiðari · tæki', ids: [['S1', 'R kapals'], ['S2', 'volt sem tapast'], ['S3', '% sem tapast'], ['S4', 'hámarkslengd'], ['S5', 'sverleiki'], ['S6', 'löng leiðsla'], ['S7', 'spenna gjafans'], ['H1', 'heildarviðnám']] },
    ];
    const steps = [['1', 'Lestu dæmið', 'Strikaðu undir tölur, einingar og orð (m, mm², °C, A, V …).'], ['2', 'Veldu lit', 'Hvaða hurð passar? Fylgdu litnum á flipunum á brún síðnanna.'], ['3', 'Flettu og reiknaðu', 'Finndu síðuna. Fylgdu skrefunum og takkaröðinni á reiknivélina.']];
    return [
      mark({
        measure: (doc, w, s) => 34 * s,
        draw(doc, x, y, w, s) {
          const { setF } = L();
          doc.setDrawColor('#123047'); doc.setLineWidth(1 * s); doc.roundedRect(x, y, w, 30 * s, 4 * s, 4 * s, 'S');
          setF(doc, 'bold', 30 * s); doc.setTextColor('#123047'); doc.text('Dæmaleiðarvísir', x + 7 * s, y + 15 * s);
          setF(doc, 'normal', 13 * s); doc.setTextColor('#3d4a55'); doc.text('Rafmagnsfræði 1 · rafleiðarar, viðnám, leiðni og spennuföll', x + 7 * s, y + 24 * s);
          ['R', 'T', 'U'].forEach((f, i) => iconFor(f, doc, x + w - 52 * s + i * 17 * s, y + 15 * s, 6 * s, s, famColor(f)));
        },
      }, 'cover'),
      {
        measure: (doc, w, s) => 31 * s,
        draw(doc, x, y, w, s) {
          const { setF, Para: P } = L();
          setF(doc, 'bold', 12.5 * s); doc.setTextColor('#123047'); doc.text('Svona notarðu heftið', x, y + 4 * s);
          const bw = (w - 8 * s) / 3;
          steps.forEach(([n, t, d], i) => {
            const bx = x + i * (bw + 4 * s), by = y + 7 * s;
            doc.setFillColor('#ffffff'); doc.setDrawColor('#123047'); doc.setLineWidth(0.4 * s); doc.roundedRect(bx, by, bw, 22 * s, 3 * s, 3 * s, 'FD');
            doc.setFillColor('#ffffff'); doc.circle(bx + 6 * s, by + 6 * s, 4 * s, 'FD');
            setF(doc, 'bold', 13 * s); doc.setTextColor('#123047'); doc.text(n, bx + 6 * s - doc.getTextWidth(n) / 2, by + 7.6 * s);
            setF(doc, 'bold', 12 * s); doc.text(t, bx + 12 * s, by + 7.6 * s);
            const pp = P({ src: d, size: 9.8, color: '#3d4a55', gapAfter: 0 }); pp.measure(doc, bw - 6 * s, s); pp.draw(doc, bx + 3 * s, by + 11 * s, bw - 6 * s, s);
            if (i < 2) { doc.setDrawColor('#55636f'); doc.setLineWidth(0.6 * s); const ax = bx + bw + 0.4 * s; doc.line(ax, by + 11 * s, ax + 3.2 * s, by + 11 * s); }
          });
        },
      },
      {
        measure: (doc, w, s) => 104 * s,
        draw(doc, x, y, w, s) {
          const { setF, lighten, mathBox, draw } = L();
          setF(doc, 'bold', 12.5 * s); doc.setTextColor('#123047'); doc.text('Veldu hurð – hvað sérðu í dæminu?', x, y + 4 * s);
          const bw = (w - 8 * s) / 3, by = y + 8 * s, bh = 94 * s;
          doors.forEach((d, i) => {
            const col = famColor(d.fam), bx = x + i * (bw + 4 * s);
            doc.setFillColor(lighten(col, 0.95)); doc.setDrawColor(col); doc.setLineWidth(0.9 * s);
            doc.roundedRect(bx, by, bw, bh, 4 * s, 4 * s, 'FD');
            iconFor(d.fam, doc, bx + bw / 2, by + 11 * s, 7.5 * s, s, col);
            setF(doc, 'bold', 13 * s); doc.setTextColor(col); doc.text(d.title, bx + bw / 2 - doc.getTextWidth(d.title) / 2, by + 26 * s);
            setF(doc, 'normal', 8.6 * s); doc.setTextColor('#3d4a55');
            const seeL = doc.splitTextToSize('Þú sérð: ' + d.see, bw - 6 * s);
            seeL.forEach((ln, k) => doc.text(ln, bx + 3 * s, by + 32 * s + k * 3.8 * s));
            let yy = by + 32 * s + seeL.length * 3.8 * s + 2.5 * s;
            doc.setDrawColor(lighten(col, 0.5)); doc.setLineWidth(0.3 * s); doc.line(bx + 3 * s, yy - 1.5 * s, bx + bw - 3 * s, yy - 1.5 * s);
            d.ids.forEach(([id, what]) => {
              setF(doc, 'bold', 10.5 * s); doc.setTextColor(col); doc.text(id, bx + 3 * s, yy + 3.6 * s);
              setF(doc, 'normal', 10 * s); doc.setTextColor('#14202b'); doc.text(what, bx + 12 * s, yy + 3.6 * s);
              setF(doc, 'bold', 10 * s); const pg = 'bls. ' + pageOf(id); doc.setTextColor(col); doc.text(pg, bx + bw - 3 * s - doc.getTextWidth(pg), yy + 3.6 * s);
              yy += 6.2 * s;
            });
          });
        },
      },
      Box([Table([['Ég þarf að finna …', 'Bls.', 'Ég þarf að finna …', 'Bls.'],
        ['Hvað stafirnir þýða (ρ, Δ, α …)', String(pageOf('sym')), 'Þvermál → mm², einingar', String(pageOf('tables2'))],
        ['Orðin á mannamáli + reiknivélin', String(pageOf('words')), 'Allar formúlurnar', String(pageOf('forms'))],
        ['Eðlisviðnám ρ og hitastuðlar α', String(pageOf('tables1')), '„Hvaða dæmi er þetta?“ (flæðirit)', String(pageOf('which'))],
        ['Flokkar efna og galvanhúðun', String(pageOf('flokkar')), 'Æfingapróf: sér hefti', '–']], [2.6, 0.5, 2.6, 0.5], { size: 11, zebra: true, gapAfter: 0 })], { title: 'Flettu hratt', color: '#123047', gapAfter: 0 }),
    ];
  }

  /* ---------- Orðalisti og reiknivélin ---------- */
  function wordsPage() {
    const { Break, Table, Box, Para, famColor } = L();
    const W = [
      ['Spennugjafi', 'Það sem gefur rafmagnið: tafla, rafhlaða, rafall.'],
      ['Álag', 'Tækið sem NOTAR rafmagnið: ofn, pera, ketill, mótor.'],
      ['Leiðari / leiðsla', 'Vírarnir sem flytja rafmagnið frá gjafa að álagi.'],
      ['Einleiðari', 'Einn vír. Lengdin er bara lengd vírsins.'],
      ['Tvíleiðari / kapall', 'Tveir vírar saman. Rafmagnið fer FRAM og TIL BAKA → lengd × 2.'],
      ['Viðnám', 'Hve mikið hlutur bremsar rafmagnið (Ω).'],
      ['Eðlisviðnám', 'Hve tregt EFNIÐ sjálft er (ρ). Stendur í töflu.'],
      ['Leiðni / eðlisleiðni', 'Öfugt við viðnám: hve VEL hluturinn / efnið leiðir.'],
      ['Þverflatarmál', 'Hve sver vírinn er: flatarmál sneiðarinnar (mm²).'],
      ['Hitastuðull', 'Hve mikið viðnám breytist fyrir hverja gráðu (α).'],
      ['Spennufall', 'Volt sem tapast á leiðinni í vírunum (ΔU).'],
      ['Staðalstærð', 'Kaplar fást bara í ákveðnum stærðum: 1,5 · 2,5 · 4 · 6 … mm².'],
      ['Rafeind / jón', 'Rafeind: örsmá hlaðin ögn í málmi. Jón: hlaðið atóm í vökva.'],
      ['Einangrari', 'Efni sem leiðir nær ekkert: plast, gler, gúmmí.'],
      ['Ohmslögmál', 'U = I · R. Spenna = straumur sinnum viðnám.'],
    ];
    return [
      Break(),
      mark(headerBand('Orðin á mannamáli', 'og hvernig þú notar reiknivélina', null, 'bls. ' + pageOf('words')), 'words'),
      Table([['Orð', 'Hvað þýðir það?'], ...W.map(([a, b]) => ['**' + a + '**', b])], [1.3, 3.6], { size: 11.5, zebra: true, gapAfter: 4 }),
      Box([
        Para({ src: '**1. Komma eða punktur:** á flestum reiknivélum er komman punktur. 0,0178 slærðu inn sem **0.0178**.', size: 11.5, gapAfter: 1 }),
        Para({ src: '**2. Strik = deilt með:** slærðu inn það sem er ofan við strikið, svo **÷**, svo það sem er fyrir neðan.', size: 11.5, gapAfter: 1 }),
        Para({ src: '**3. Svigi:** ef fleiri en ein tala er fyrir neðan strikið: **÷ ( 8,5 × 0,0039 )**. Án sviga verður svarið vitlaust!', size: 11.5, gapAfter: 1 }),
        Para({ src: '**4. Ans-takkinn** geymir síðasta svar. Notaðu hann í stað þess að skrifa niður námundaða tölu.', size: 11.5, gapAfter: 1 }),
        Para({ src: '**5. π og x²:** A = π·r² slærðu inn sem **π × r x²** (eða π × r × r).', size: 11.5, gapAfter: 1 }),
        Para({ src: '**6. Athugaðu svarið:** er það í réttri stærðargráðu? Viðnám í vír er oftast undir 10 Ω, spennufall oftast nokkur volt.', size: 11.5, gapAfter: 0 }),
      ], { title: 'Reiknivélin – 6 ráð', color: famColor('U'), gapAfter: 0 }),
    ];
  }

  /* ---------- Flipar á spássíu ---------- */
  function drawTabs(doc, pages) {
    const { setF, famColor, lighten } = L();
    const secs = [
      { name: 'BYRJAÐU HÉR', col: '#123047', from: 1, to: (PG.V1 || 99) - 1 },
      { name: 'VÍR OG EFNI', col: famColor('R'), from: PG.V1, to: (PG.L1 || 0) + 1 },
      { name: 'HITI', col: famColor('T'), from: PG.V5, to: (PG.V6 || 0) + 1 },
      { name: 'SPENNUFALL', col: famColor('U'), from: PG.S1, to: (PG.H1 || 0) + 1 },
    ];
    const tabH = 52, top = 30, gap = 6;
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      secs.forEach((sc, i) => {
        const y = top + i * (tabH + gap), on = p >= sc.from && p <= sc.to;
        doc.setFillColor(on ? lighten(sc.col, 0.82) : '#ffffff');
        doc.setDrawColor(on ? sc.col : '#d6dee6'); doc.setLineWidth(on ? 0.7 : 0.25);
        doc.roundedRect(200.6, y, 7.6, tabH, 1.6, 1.6, 'FD');
        setF(doc, 'bold', 7.6); doc.setTextColor(on ? sc.col : '#b9c3cc');
        const tw = doc.getTextWidth(sc.name);
        doc.text(sc.name, 205.5, y + tabH / 2 + tw / 2, { angle: 90 });
      });
    }
  }

  function page1() {
    const { Para, Box, Formula } = L();
    return [
      L().Break(),
      mark(headerBand('Hvað þýða stafirnir?', 'Orðabók – flettu hingað þegar þú ert óviss', null, 'bls. ' + pageOf('sym')), 'sym'),
      Box([Para({ src: '**Hugsaðu um rafmagn eins og vatn í slöngu:**  spennan **U** ýtir · straumurinn **I** rennur · viðnámið **R** þrengir að.', size: 11.5, gapAfter: 0.3 })], { color: '#0b7a70', fill: '#e3f6f3', gapAfter: 2.4 }),
      ...['R', 'I', 'U', 'ohm', 'ρ', 'γ', 'G', 'l', 'A', 'd', 'r', 't', 'α', 'Δ', 'π', 'sub', 'Rl', 'RH', 'pct'].map(SymRow),
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
      box(qx, y + 37 * s, qw, bh, '#ffffff', C.U, 'Er **A** (straumur), **V** (spenna),\nkapall, tvíleiðari eða tæki/álag?', 11, false);
      arrow(qx + qw, y + 37 * s + bh / 2, rx, y + 37 * s + bh / 2, 'JÁ');
      box(rx, y + 37 * s, rw, bh, lighten(C.U, 0.94), C.U, '**SPENNUFALL**\nbls. ' + pageOf('S1') + '–' + (pageOf('H1') + 1), 12, true, C.U);
      arrow(qx + qw / 2, y + 37 * s + bh, qx + qw / 2, y + 58 * s, 'NEI');
      box(qx, y + 58 * s, qw, bh, lighten(C.R, 0.94), C.R, '**VÍR OG EFNI**  (m, mm², Ω, kopar …)\nbls. ' + pageOf('V1') + '–' + (pageOf('L1') + 1), 11.5, true, C.R);
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
      famPanel('R', 'Vír og efni  ·  m, mm², Ω, kopar, ál', [['Hve mikið bremsar vírinn?  (viðnám R)', 'V1'], ['Hve langur er vírinn?  (lengd l)', 'V2'], ['Úr hvaða efni?  (ρ)', 'V3'], ['Nýtt efni, sama viðnám  (A)', 'V4'], ['Hve VEL leiðir vírinn?  (leiðni G, eðlisleiðni γ)', 'L1']]),
      famPanel('T', 'Hiti  ·  °C, hitnar, kólnar, α', [['Hve heitt varð?  (tvö viðnám gefin)', 'V5'], ['Nýtt viðnám við nýjan hita  (tvö hitastig gefin)', 'V6']]),
      famPanel('U', 'Spennufall  ·  A, V, kapall, tvíleiðari', [['Viðnám kapalsins  (R_l)', 'S1'], ['Hve mörg volt tapast?  (ΔU)', 'S2'], ['Hve mörg % tapast?', 'S3'], ['Hve langur má kapallinn vera?', 'S4'], ['Hve sver þarf kapallinn að vera?  (mm²)', 'S5'], ['Volt sem tapast í langri leiðslu', 'S6'], ['Spenna gjafans  (U₁)', 'S7'], ['Heildarviðnám og straumur  (R_H, I)', 'H1']]),
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
    const kb = KeysBox(id, col); if (kb) out.push(kb);
    out.push(Box([Para({ src: '**Svar:**  ' + parts.map((pt) => pt.label.replace(/^[a-e]\)\s*/, '') + ' = **' + RF.valueTextPlain(pt, sol.v[pt.k]) + '**').join('   ·   '), size: 12.5, gapAfter: 0 })], { color: '#11704a', fill: '#e2f5ea', pad: 2.4, gapAfter: 3 }));
    const db = diameterBox(id, pr.p, col);
    if (db) out.push(db);
    out.push(Box([Para({ src: '**Passaðu þig!**  ' + d.trap, size: 13, gapAfter: 0 })], { color: '#b4530a', fill: '#fdeedd', pad: 2.6, gapAfter: 0 }));
    return out;
  }


  /* Handskrifaðar dæmasíður fyrir efni sem ekki er í æfingadæmum kennarans */
  const MANUAL = {
    L1: {
      title: 'Leiðni og eðlisleiðni', fam: 'R', pic: 'wire', source: 'æfingadæmi (byggt á glærum 3.3)',
      say: 'Hve VEL leiðir vírinn? Leiðni er andstæðan við viðnám.',
      clues: ['„**leiðni**“ / „**eðlisleiðni**“', 'eining **S** (siemens)', 'eining **m/(Ω·mm²)**', 'γ eða G gefið í stað ρ'],
      find: 'Leiðni **G** eða eðlisleiðni **γ**', syms: ['γ', 'ρ', 'G', 'R'],
      formulas: ['γ = \\f{1}{ρ}', 'G = \\f{1}{R}', 'R = \\f{l}{γ·A}'],
      text: 'Koparvír er 100 m langur og 2,5 mm² að þverflatarmáli. Eðlisviðnám kopars er 0,0178 Ω·mm²/m. a) Hver er eðlisleiðni kopars? b) Hvert er viðnám vírsins? c) Hver er leiðni vírsins?',
      given: ['**l** = 100 m  (lengd)', '**A** = 2,5 mm²  (þverflatarmál)', '**ρ** = 0,0178 Ω·mm²/m  (kopar)'],
      steps: [
        ['a) Eðlisleiðnin', 'Eðlisleiðni er 1 deilt með ρ. Lítið ρ → mikil eðlisleiðni → góður leiðari.', ['γ = \\f{1}{ρ} = \\f{1}{0,0178} = 56,18 m/(Ω·mm²)']],
        ['b) Viðnám vírsins', 'Venjulega formúlan R = ρ·l/A. Ef dæmið gefur γ í stað ρ: deildu með γ í staðinn, R = l/(γ·A). Útkoman er sú sama.', ['R = \\f{ρ·l}{A} = \\f{0,0178·100}{2,5} = 0,712 Ω', 'eða:  R = \\f{l}{γ·A} = \\f{100}{56,18·2,5} = 0,712 Ω']],
        ['c) Leiðni vírsins', 'Leiðni er 1 deilt með viðnáminu. Lítið viðnám → mikil leiðni. Eining: siemens (S).', ['G = \\f{1}{R} = \\f{1}{0,712} = 1,40 S']],
      ],
      answer: 'γ = **56,18 m/(Ω·mm²)** · R = **0,712 Ω** · G = **1,40 S**',
      trap: 'Á glærum kennarans er **G** notað um eðlisleiðni. Í mörgum bókum er G = leiðni vírs (1/R) og eðlisleiðni táknuð **γ** eða **σ**. Skoðaðu **eininguna**: S = leiðni vírs, m/(Ω·mm²) = eðlisleiðni efnis.',
    },
    H1: {
      title: 'Heildarviðnám og straumur', fam: 'U', pic: 'two', source: 'byggt á glæru 3.4, dæmi 1',
      say: 'Leiðslan og tækið eru í röð. Hvert er heildarviðnámið og hve mikill straumur rennur?',
      clues: ['viðnám **tækisins** (álagsins)', 'viðnám **víranna**', 'spenna **V**', 'spurt um **straum A**'],
      find: 'Heildarviðnám **R_H** og straumur **I**', syms: ['RH', 'Rl', 'I', 'U'],
      formulas: ['R_H = R_l + R_{álag}', 'I = \\f{U}{R_H}'],
      text: 'Rafmagnsofn er tengdur við 220 V töflu. Viðnám ofnsins er 21,6 Ω og hvor vír leiðslunnar hefur viðnámið 0,2 Ω. a) Hvert er heildarviðnámið? b) Hver er straumurinn? c) Hvert er spennufallið í leiðslunni og spennan yfir ofninum?',
      given: ['**U₁** = 220 V  (taflan)', '**R_{álag}** = 21,6 Ω  (ofninn)', '0,2 Ω  (hvor vír)'],
      steps: [
        ['Viðnám leiðslunnar', 'Tveir vírar, 0,2 Ω hvor. Straumurinn fer í gegnum báða, svo þú leggur saman.', ['R_l = 0,2 + 0,2 = 0,4 Ω']],
        ['a) Heildarviðnám', 'Straumurinn fer í gegnum leiðsluna OG ofninn. Viðnám í röð leggjast saman.', ['R_H = R_l + R_{álag} = 0,4 + 21,6 = 22 Ω']],
        ['b) Straumurinn (Ohmslögmál)', 'Spenna deilt með HEILDARviðnámi gefur strauminn.', ['I = \\f{U}{R_H} = \\f{220}{22} = 10 A']],
        ['c) Spennufall og spenna á ofninum', 'Volt sem tapast í vírunum = straumur sinnum viðnám víranna. Ofninn fær afganginn (sjá S2 og S7).', ['ΔU = I·R_l = 10·0,4 = 4 V', 'U_2 = U_1 − ΔU = 220 − 4 = 216 V']],
      ],
      answer: 'R_H = **22 Ω** · I = **10 A** · ΔU = **4 V** · U₂ = **216 V**',
      trap: 'Notaðu **heildarviðnámið** (vírar + tæki) til að finna strauminn – ekki bara viðnám tækisins.',
    },
  };
  function manualPage(id) {
    const { Para, Box, Formula, Break, famColor, setF, MUTED } = L();
    const d = MANUAL[id], col = famColor(d.fam);
    const famName = { R: 'Vír og efni', U: 'Spennufall' }[d.fam];
    const out = [Break(), mark(headerBand(id + '  ' + d.title, famName, d.fam, 'bls. ' + pageOf(id)), id)];
    out.push(Custom(44, (doc, x, y, w, s) => {
      const lw = w * 0.56;
      const p = Para({ src: d.say, size: 16, bold: true, color: '#14202b' });
      p.measure(doc, lw, s);
      setF(doc, 'bold', 9 * s); doc.setTextColor(col); doc.text('Á MANNAMÁLI', x, y + 4 * s);
      p.draw(doc, x, y + 6 * s, lw, s);
      PICS[d.pic](doc, x + lw + 6 * s, y, w - lw - 6 * s, 42 * s, s, col);
    }));
    out.push(Label('Þú þekkir dæmið á þessu', col, { n: '1' }), Chips(d.clues, col, { size: 12.5, gapAfter: 4 }));
    out.push(Label('Þú átt að finna', col, { n: '2' }), Chips([d.find], col, { size: 14, gapAfter: 4 }));
    out.push(Label('Formúlan', col, { n: '3' }));
    const legend = d.syms.map((k) => '**' + SYM[k][0] + '** = ' + SYM[k][1].toLowerCase().replace(/ \(.*\)/, '')).join('   ·   ');
    out.push(Box([FormulaRow(d.formulas), Para({ src: legend, size: 10.5, color: MUTED, gapAfter: 0 })], { color: col, gapAfter: 4 }));
    out.push(Box([Para({ src: '**Næsta síða:** dæmi reiknað skref fyrir skref, með skýringu á hverju skrefi.', size: 11.5, gapAfter: 0 })], { color: col, fill: '#ffffff', gapAfter: 0 }));
    out.push(Break(), headerBand(id + '  Svona reiknarðu', d.title, d.fam, 'bls. ' + (pageOf(id) === '?' ? '?' : pageOf(id) + 1)));
    out.push(Label('Svona reiknarðu – ' + d.source, col, { n: '4' }));
    out.push(Box([Para({ src: d.text, size: 11, color: '#33414d', gapAfter: 0 })], { color: '#9aa7b2', fill: '#f4f6f8', pad: 2.2, gapAfter: 3.5 }));
    out.push(Para({ src: '**Hvað er gefið?**  Skrifaðu tölurnar niður með einingum:', size: 11.5, color: '#14202b', gapAfter: 1 }));
    out.push(Chips(d.given, '#55636f', { size: 11, gapAfter: 3.5 }));
    d.steps.forEach(([h, why, ms], i) => {
      out.push(Para({ src: '**' + (i + 1) + '.  ' + h + '**', size: 12.5, color: col, gapAfter: 0.4 }));
      out.push(Para({ src: why, size: 10.8, color: '#3d4a55', indent: 5, gapAfter: 0.8 }));
      ms.forEach((ml) => out.push(Formula(ml, { size: 15.5, gap: 1.6, indent: 6 })));
      out.push(Custom(2, () => {}));
    });
    const kb2 = KeysBox(id, col); if (kb2) out.push(kb2);
    out.push(Box([Para({ src: '**Svar:**  ' + d.answer, size: 12.5, gapAfter: 0 })], { color: '#11704a', fill: '#e2f5ea', pad: 2.4, gapAfter: 3 }));
    out.push(Box([Para({ src: '**Passaðu þig!**  ' + d.trap, size: 13, gapAfter: 0 })], { color: '#b4530a', fill: '#fdeedd', pad: 2.6, gapAfter: 0 }));
    return out;
  }

  RF.pdf.studyGuide = async function () {
    await RF.pdf.ensure();
    const { render, out } = L();
    const cfg = { maxScale: 1, margin: 12, cols: 1, gap: 0, headH: 8, title: 'Dæmaleiðarvísir – Rafmagnsfræði 1', subtitle: 'Hvaða dæmi er þetta og hvernig reikna ég það?' };
    const blocks = () => [...cover(), ...page1(), ...wordsPage(), ...tablesPage1(), ...tablesPage2(), ...page2(), ...['V1', 'V2', 'V3', 'V4'].flatMap(typePage), ...manualPage('L1'), ...['V5', 'V6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'].flatMap(typePage), ...manualPage('H1')];
    const { flow, fit } = L();
    for (let pass = 0; pass < 2; pass++) {
      const fr = fit(blocks, cfg, 99, 1);
      const res = flow(RF.pdf._mdoc(), blocks(fr.s), cfg, fr.s, false);
      Object.assign(PG, res.marks);
    }
    RF.pdf._guidePG = PG;
    const r = render('Dæmaleiðarvísir – Rafmagnsfræði 1', blocks, cfg, 99, 1);
    drawTabs(r.doc, r.pages);
    return out(r);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

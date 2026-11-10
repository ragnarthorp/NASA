/* Dæmabanki: 13 dæmagerðir byggðar á æfingadæmum kennarans (3.3.1 og 3.4.1).
   Hver dæmagerð hefur: upprunalegt dæmi (orðrétt), forstillt afbrigði (létt/miðlungs/erfitt),
   slembigjafa sem býr til eðlisfræðilega rétt dæmi, lausnarferli, vísbendingar og algeng mistök.
   NÝ AFBRIGÐI: bættu hlut við `presets` í viðkomandi dæmagerð – forritið þarf ekki að breytast. */
(function (G) {
  const RF = (G.RF = G.RF || {});
  const P = RF.phys, U = RF.util;
  const f = U.fmtS, g = U.fmt;
  const M = (k) => RF.materials[k];

  RF.levels = { lett: 'Létt', midl: 'Miðlungs', erf: 'Erfitt' };

  /* Fallbeyging efnisheita: „úr kopar“, „úr áli“ … */
  const DAT = { kopar: 'kopar (eir)', al: 'áli', silfur: 'silfri', jarn: 'járni', nikkel: 'nikkel', platina: 'platínu', manganin: 'manganíni', konstantan: 'konstantani', kromnikkel: 'krómnikkel', volfram: 'volframi', gull: 'gulli' };
  const dat = (k) => DAT[k] || M(k).short;
  const RESIST = ['manganin', 'konstantan', 'kromnikkel', 'volfram'];

  /* ---- sameiginleg hjálparföll ---- */
  const Lm = (p) => (p.lkm != null ? p.lkm * 1000 : p.l);
  const Am = (p) => (p.d != null ? P.areaFromDiameter(p.d) : p.A);
  const lTxt = (p) => (p.lkm != null ? g(p.lkm) + ' km' : g(p.l) + ' m');
  const aShort = (p) => (p.d != null ? g(p.d) + ' mm í þvermál' : g(p.A) + ' mm²');
  const rhoLine = (k) => 'ρ_{' + M(k).short + '} = ' + g(M(k).rho, 5) + ' Ω·mm²/m';
  const alphaLine = (k) => 'α_{' + M(k).short + '} = ' + g(M(k).alpha, 5) + ' /°C';
  const tC = (t) => (t > 0 ? '+' : '') + g(t) + ' °C';
  const tP = (t) => g(t) + ' °C';
  const sgn = (x) => (x < 0 ? '(' + g(x) + ')' : g(x));

  function prep(p, steps, o) {
    if (p.lkm != null)
      steps.push({ h: 'Breyttu lengdinni í metra', m: ['l = ' + g(p.lkm) + ' km = ' + g(Lm(p)) + ' m'], n: '1 km = 1000 m. Formúlurnar nota l í metrum.' });
    if (p.d != null)
      steps.push({ h: 'Finndu þverflatarmálið út frá þvermálinu', m: ['A = \\f{π·d^2}{4}', 'A = \\f{π·' + g(p.d) + '^2}{4} = ' + f(Am(p)) + ' mm²'], n: 'Jafngilt: r = d/2 = ' + g(p.d / 2) + ' mm og A = π·r².' });
  }
  /* Algeng mistök tengd gefnum stærðum (þvermál, km, rangt efni) */
  function geoMistakes(p, extra) {
    const out = [];
    if (p.lkm != null) out.push({ o: { l: p.lkm }, msg: 'Þú virðist ekki hafa breytt km í metra. 1 km = 1000 m.', code: 'km' });
    if (p.d != null) {
      out.push({ o: { A: Math.PI * p.d * p.d }, msg: 'Þú notaðir π·d² án þess að deila með 4 (eða settir þvermálið inn sem radíus). Rétt: A = π·d²/4 = π·r².', code: 'radius' });
      out.push({ o: { A: p.d }, msg: 'Þú notaðir þvermálið sem þverflatarmál. Reiknaðu fyrst A = π·d²/4.', code: 'dA' });
      out.push({ o: { A: (Math.PI * p.d * p.d) / 16 }, msg: 'Þú settir radíusinn inn í formúluna fyrir þvermál. Annaðhvort A = π·d²/4 eða A = π·r², ekki blanda saman.', code: 'radius' });
    }
    const mk = p.mat;
    if (mk && mk !== 'kopar' && !(extra && extra.noMat)) out.push({ o: { rho: M('kopar').rho }, msg: 'Þú notaðir eðlisviðnám kopars, en efnið hér er ' + M(mk).short + ' (ρ = ' + g(M(mk).rho, 5) + ').', code: 'rho' });
    if (mk === 'kopar' && !(extra && extra.noMat)) out.push({ o: { rho: M('al').rho }, msg: 'Þú notaðir eðlisviðnám áls. Kopar hefur ρ = 0,0178 Ω·mm²/m.', code: 'rho' });
    return out;
  }
  const roundSig = (x, n) => { if (x === 0) return 0; const d = n - 1 - Math.floor(Math.log10(Math.abs(x))); return U.round(x, Math.max(0, d)); };

  /* ================================================================== */
  const T = [];

  /* ---------------- V1 – Reikna viðnám ---------------- */
  T.push({
    id: 'V1', ch: 3, fam: 'R', cards: [1], title: 'Reikna viðnám leiðara', short: 'Viðnám leiðara',
    source: '3.3.1 – dæmi 1', skills: ['R = ρ·l/A', 'Eðlisviðnám úr töflu', 'Einingar: m, mm², Ω'],
    original: { text: 'Reiknaðu viðnámið í 179,8 m löngum eirvír sem hefur þverflatarmálið 1,6 mm².', p: { mat: 'kopar', l: 179.8, A: 1.6 }, teacher: 'R = 2 Ω (2,0003 Ω)' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', l: 100, A: 2.5 } },
      { level: 'lett', p: { mat: 'kopar', l: 50, A: 1.5 } },
      { level: 'midl', p: { mat: 'al', l: 250, A: 4 } },
      { level: 'midl', p: { mat: 'kopar', l: 315.5, A: 6 } },
      { level: 'erf', p: { mat: 'kopar', l: 628, d: 2 }, note: 'Dæmi af glæru 3.3 (eirþráður 2 mm í þvermál)' },
      { level: 'erf', p: { mat: 'al', lkm: 1.2, d: 2.5 } },
    ],
    gen(r, lv) {
      if (lv === 'lett') return { mat: 'kopar', l: r.pick([10, 20, 25, 50, 100, 150, 200]), A: r.pick([1, 1.5, 2.5, 4]) };
      if (lv === 'midl') return { mat: r.pick(['kopar', 'al', 'kopar']), l: r.step(30, 400, 0.5), A: r.pick([0.75, 1, 1.5, 2.5, 4, 6, 10]) };
      return r() < 0.5 ? { mat: r.pick(['kopar', 'al', 'silfur', 'jarn']), l: r.step(20, 800, 1), d: r.pick([0.5, 0.8, 1, 1.2, 1.6, 2, 2.5]) }
        : { mat: r.pick(['kopar', 'al']), lkm: r.step(0.2, 3, 0.05), A: r.pick([2.5, 4, 6, 10, 16]) };
    },
    valid: (p, v) => v.R > 0.01 && v.R < 500,
    text: (p) => 'Leiðari úr ' + dat(p.mat) + ' er ' + lTxt(p) + ' langur og ' + (p.d != null ? g(p.d) + ' mm í þvermál' : 'þverflatarmál hans er ' + g(p.A) + ' mm²') + '. Reiknaðu viðnám leiðarans.',
    table: (p) => [rhoLine(p.mat)],
    parts: () => [{ k: 'R', label: 'Viðnám R', unit: 'Ω' }],
    solve(p, o = {}) {
      const rho = o.rho ?? M(p.mat).rho, l = o.l ?? Lm(p), A = o.A ?? Am(p);
      const R = o.f === 'flip' ? (rho * A) / l : o.f === 'mul' ? rho * l * A : (rho * l) / A;
      const st = [];
      prep(p, st, o);
      st.push({ h: 'Formúla', m: ['R = \\f{ρ·l}{A}'], n: rhoLine(p.mat) });
      st.push({ h: 'Settu tölurnar inn', m: ['R = \\f{' + g(rho, 5) + '·' + g(l) + '}{' + f(A) + '} = \\f{' + f(rho * l) + '}{' + f(A) + '}', 'R = ' + f(R) + ' Ω'], ans: true });
      return { v: { R }, steps: st };
    },
    mistakes: (p) => [
      ...geoMistakes(p),
      { o: { f: 'flip' }, msg: 'Þú settir A í teljarann og l í nefnarann. Rétt: R = ρ·l/A — lengri leiðari hefur meira viðnám.' },
      { o: { f: 'mul' }, msg: 'Þú margfaldaðir með A. Gildari leiðari hefur MINNA viðnám, svo deila á með A.' },
    ],
    given: (p) => [['l', lTxt(p), 'lengd'], p.d != null ? ['d', g(p.d) + ' mm', 'þvermál'] : ['A', g(p.A) + ' mm²', 'þverflatarmál'], ['efni', M(p.mat).short, 'ρ úr töflu']],
    find: () => [['R', 'viðnám í Ω']],
    fq: { right: 'R = \\f{ρ·l}{A}', wrong: ['R = \\f{ρ·A}{l}', 'R = ρ·l·A', 'R = \\f{l·A}{ρ}'], why: 'Viðnám vex með lengd (l í teljara) og minnkar þegar leiðarinn er gildari (A í nefnara).' },
    rearr: (p) => 'Ekki þarf að umrita: R stendur þegar ein vinstra megin.' + (p.d != null ? ' En fyrst þarf að breyta þvermáli í þverflatarmál.' : ''),
    hints: (p) => ['Úr hvaða efni er leiðarinn? Flettu upp eðlisviðnámi (ρ) þess í töflunni.', p.d != null ? 'Þú færð þvermál, ekki þverflatarmál. Reiknaðu fyrst A = π·d²/4.' : 'Gefið er l og A – formúlan tengir þau við R og ρ.', 'R = ρ·l/A, með l í metrum og A í mm².'],
    sanity: (p, v) => 'Viðnám á hvern metra: ' + f(v.R / Lm(p)) + ' Ω/m. Til samanburðar hefur 1 mm² koparvír um 0,018 Ω/m — svarið á að vera í sama stærðarflokki miðað við efni og sverleika.',
  });

  /* ---------------- V2 – Reikna lengd ---------------- */
  T.push({
    id: 'V2', ch: 3, fam: 'R', cards: [2], title: 'Reikna lengd leiðara', short: 'Lengd leiðara',
    source: '3.3.1 – dæmi 2', skills: ['Umrita R = ρ·l/A → l = R·A/ρ', 'Eðlisviðnám mótstöðuefna'],
    original: { text: 'Það á að vinda 43 Ω mótstöðu úr manganínþræði með þverflatarmálið 1,5 mm². Reiknaðu lengd þráðarins.', p: { mat: 'manganin', R: 43, A: 1.5 }, teacher: 'l = 150 m' },
    presets: [
      { level: 'lett', p: { mat: 'konstantan', R: 10, A: 0.5 } },
      { level: 'lett', p: { mat: 'kopar', R: 1, A: 1.5 } },
      { level: 'midl', p: { mat: 'kromnikkel', R: 25, A: 0.8 } },
      { level: 'midl', p: { mat: 'al', R: 2, A: 10 } },
      { level: 'erf', p: { mat: 'manganin', R: 100, d: 0.5 } },
      { level: 'erf', p: { mat: 'kopar', R: 0.5, d: 1.6 } },
    ],
    gen(r, lv) {
      if (lv === 'lett') return { mat: r.pick(['manganin', 'konstantan', 'kromnikkel']), R: r.pick([5, 10, 20, 25, 40, 50, 100]), A: r.pick([0.25, 0.5, 1, 1.5]) };
      if (lv === 'midl') { const mat = r.pick(['kopar', 'al', 'manganin', 'kromnikkel', 'konstantan']); return { mat, R: RESIST.includes(mat) || mat === 'konstantan' ? r.step(2, 80, 0.5) : r.step(0.2, 5, 0.1), A: r.pick([0.5, 0.75, 1, 1.5, 2.5, 4]) }; }
      return { mat: r.pick(['manganin', 'konstantan', 'kromnikkel', 'volfram']), R: r.step(5, 150, 0.5), d: r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1]) };
    },
    valid: (p, v) => v.l > 0.5 && v.l < 3000,
    text(p) {
      const a = p.d != null ? 'sem er ' + g(p.d) + ' mm í þvermál' : 'með þverflatarmálið ' + g(p.A) + ' mm²';
      if (RESIST.includes(p.mat) || p.mat === 'konstantan') return 'Það á að vinda ' + g(p.R) + ' Ω mótstöðu úr ' + dat(p.mat) + 'þræði ' + a + '. Reiknaðu lengd þráðarins.';
      return 'Leiðari úr ' + dat(p.mat) + ' ' + a + ' á að hafa viðnámið ' + g(p.R) + ' Ω. Hve langur er leiðarinn?';
    },
    table: (p) => [rhoLine(p.mat)],
    parts: () => [{ k: 'l', label: 'Lengd l', unit: 'm' }],
    solve(p, o = {}) {
      const rho = o.rho ?? M(p.mat).rho, A = o.A ?? Am(p), R = p.R;
      const l = o.f === 'flip' ? (R * rho) / A : o.f === 'noA' ? R / rho : (R * A) / rho;
      const st = [];
      prep(p, st, o);
      st.push({ h: 'Formúla – umrituð', m: ['R = \\f{ρ·l}{A}  ⇒  l = \\f{R·A}{ρ}'], n: rhoLine(p.mat) });
      st.push({ h: 'Settu tölurnar inn', m: ['l = \\f{' + g(R) + '·' + f(A) + '}{' + g(rho, 5) + '} = \\f{' + f(R * A) + '}{' + g(rho, 5) + '}', 'l = ' + f(l) + ' m'], ans: true });
      return { v: { l }, steps: st };
    },
    mistakes: (p) => [
      ...geoMistakes(p),
      { o: { f: 'flip' }, msg: 'Þú settir ρ í teljarann og A í nefnarann. Umritun: margfaldaðu báðar hliðar með A og deildu með ρ → l = R·A/ρ.' },
      { o: { f: 'noA' }, msg: 'Þú gleymdir að margfalda með þverflatarmálinu A.' },
    ],
    given: (p) => [['R', g(p.R) + ' Ω', 'viðnám'], p.d != null ? ['d', g(p.d) + ' mm', 'þvermál'] : ['A', g(p.A) + ' mm²', 'þverflatarmál'], ['efni', M(p.mat).short, 'ρ úr töflu']],
    find: () => [['l', 'lengd í m']],
    fq: { right: 'l = \\f{R·A}{ρ}', wrong: ['l = \\f{R·ρ}{A}', 'l = \\f{ρ·A}{R}', 'l = R·ρ·A'], why: 'Byrjað er á R = ρ·l/A. Margfaldaðu báðar hliðar með A og deildu með ρ.' },
    rearr: () => 'Umrita þarf R = ρ·l/A: margfaldaðu báðar hliðar með A (R·A = ρ·l) og deildu síðan með ρ.',
    hints: (p) => ['Þú veist viðnámið sem á að nást. Óþekkta stærðin er lengdin.', 'Byrjaðu á R = ρ·l/A og einangraðu l.', 'l = R·A/ρ. Mótstöðuefni (t.d. manganín) hafa hátt ρ, svo þráðurinn verður ekki mjög langur.'],
    sanity: (p, v) => 'Athugun: settu lengdina aftur inn: ρ·l/A = ' + g(M(p.mat).rho, 5) + '·' + f(v.l) + '/' + f(Am(p)) + ' = ' + f((M(p.mat).rho * v.l) / Am(p)) + ' Ω ✓',
  });

  /* ---------------- V3 – Reikna eðlisviðnám ---------------- */
  T.push({
    id: 'V3', ch: 3, fam: 'R', cards: [4], title: 'Reikna eðlisviðnám og þekkja efnið', short: 'Eðlisviðnám',
    source: '3.3.1 – dæmi 3', skills: ['ρ = R·A/l', 'Bera saman við töflu'],
    original: { text: '120 m langur málmþráður hefur viðnámið 5 Ω og er 2,4 mm² að þverflatarmáli. Hvert er eðlisviðnám efnisins? Hvaða málmur gæti þetta verið?', p: { R: 5, A: 2.4, l: 120 }, teacher: 'ρ = 0,1 Ω·mm²/m → járn' },
    presets: [
      { level: 'lett', p: { l: 100, A: 1, R: 1.78 } },
      { level: 'lett', p: { l: 200, A: 2, R: 2.78 } },
      { level: 'midl', p: { l: 50, A: 0.5, R: 43 } },
      { level: 'midl', p: { l: 12, A: 0.25, R: 52.8 } },
      { level: 'erf', p: { l: 80, d: 0.8, R: 8.75 } },
      { level: 'erf', p: { lkm: 0.5, A: 1.5, R: 9.27 } },
    ],
    gen(r, lv) {
      const pool = lv === 'lett' ? ['kopar', 'al', 'manganin'] : ['kopar', 'al', 'manganin', 'kromnikkel', 'volfram', 'konstantan'];
      for (let i = 0; i < 50; i++) {
        const mat = r.pick(pool);
        let p;
        if (lv === 'lett') p = { l: r.pick([10, 20, 50, 100, 200]), A: r.pick([1, 1.5, 2, 2.5]) };
        else if (lv === 'midl') p = { l: r.step(10, 300, 5), A: r.pick([0.5, 0.75, 1, 1.5, 2.5, 4]) };
        else p = r() < 0.5 ? { l: r.step(5, 200, 1), d: r.pick([0.3, 0.5, 0.8, 1, 1.2, 1.6]) } : { lkm: r.step(0.2, 2, 0.1), A: r.pick([1.5, 2.5, 4, 6]) };
        p.R = roundSig((M(mat).rho * Lm(p)) / Am(p), 3);
        const rho = (p.R * Am(p)) / Lm(p);
        if (Math.abs(rho - M(mat).rho) / M(mat).rho < 0.01) return p;
      }
      return { l: 100, A: 1, R: 1.78 };
    },
    valid: (p, v) => v.rho > 0.01 && v.rho < 2 && p.R > 0.05 && p.R < 1000,
    text: (p) => lTxt(p) + ' langur málmþráður hefur viðnámið ' + g(p.R) + ' Ω og er ' + (p.d != null ? g(p.d) + ' mm í þvermál' : g(p.A) + ' mm² að þverflatarmáli') + '. Hvert er eðlisviðnám efnisins? Hvaða málmur gæti þetta verið?',
    table: () => ['Notaðu töfluna yfir eðlisviðnám til að þekkja efnið.'],
    parts: () => [
      { k: 'rho', label: 'Eðlisviðnám ρ', unit: 'Ω·mm²/m' },
      { k: 'mat', label: 'Líklegasta efnið', kind: 'choice', options: Object.values(RF.materials).map((m) => ({ v: m.key, label: m.name })) },
    ],
    solve(p, o = {}) {
      const l = o.l ?? Lm(p), A = o.A ?? Am(p);
      const rho = o.f === 'flip' ? (p.R * l) / A : (p.R * A) / l;
      const best = RF.closestMaterials(rho);
      const ok = best.filter((b) => b.diff <= 0.03).map((b) => b.m.key);
      const st = [];
      prep(p, st, o);
      st.push({ h: 'Formúla – umrituð', m: ['R = \\f{ρ·l}{A}  ⇒  ρ = \\f{R·A}{l}'] });
      st.push({ h: 'Settu tölurnar inn', m: ['ρ = \\f{' + g(p.R) + '·' + f(A) + '}{' + g(l) + '} = \\f{' + f(p.R * A) + '}{' + g(l) + '}', 'ρ = ' + f(rho) + ' Ω·mm²/m'], ans: true });
      st.push({ h: 'Berðu saman við töfluna', m: best.slice(0, 3).map((b) => b.m.short + ': ' + g(b.m.rho, 5) + (b.diff < 0.03 ? '  ✓' : '')), n: 'Líklegast: ' + best[0].m.short + (ok.length > 1 ? ' (' + ok.slice(1).map((k) => M(k).short).join(', ') + ' er líka mjög nálægt)' : '') + '.', ans: true });
      return { v: { rho, mat: ok.length ? ok : [best[0].m.key] }, steps: st };
    },
    mistakes: (p) => [...geoMistakes(p, { noMat: true }), { o: { f: 'flip' }, msg: 'Þú settir l í teljarann og A í nefnarann. Rétt: ρ = R·A/l.' }],
    given: (p) => [['l', lTxt(p), 'lengd'], ['R', g(p.R) + ' Ω', 'viðnám'], p.d != null ? ['d', g(p.d) + ' mm', 'þvermál'] : ['A', g(p.A) + ' mm²', 'þverflatarmál']],
    find: () => [['ρ', 'eðlisviðnám í Ω·mm²/m'], ['efni', 'með samanburði við töflu']],
    fq: { right: 'ρ = \\f{R·A}{l}', wrong: ['ρ = \\f{R·l}{A}', 'ρ = \\f{l·A}{R}', 'ρ = R·l·A'], why: 'Úr R = ρ·l/A: margfaldaðu með A og deildu með l.' },
    rearr: () => 'Umrita þarf R = ρ·l/A: margfaldaðu báðar hliðar með A og deildu með l → ρ = R·A/l.',
    hints: () => ['Hér er efnið óþekkt – það er einmitt það sem á að finna.', 'Umritaðu R = ρ·l/A þannig að ρ standi ein.', 'Berðu útkomuna saman við töfluna: hvaða efni hefur næstum sama ρ?'],
    sanity: (p, v) => 'Málmar hafa ρ frá um 0,016 (silfur) upp í um 1,1 (krómnikkel). Útkoman ' + f(v.rho) + ' passar við ' + M(v.mat[0]).short + '.',
    choiceNote: (p, v) => (v.mat.length > 1 ? 'Fleiri en eitt efni passa (innan 3 %): ' + v.mat.map((k) => M(k).short).join(', ') + '. Í svari kennarans við upprunalega dæminu er svarið járn.' : ''),
  });

  /* ---------------- V4 – Skipta um leiðaraefni ---------------- */
  T.push({
    id: 'V4', ch: 3, fam: 'R', cards: [1, 3], title: 'Skipta um leiðaraefni (sama viðnám)', short: 'Skipta um efni',
    source: '3.3.1 – dæmi 4', skills: ['R = ρ·l/A', 'A = ρ·l/R', 'Hlutfall: A₂ = A₁·ρ₂/ρ₁'],
    original: { text: 'Álvír (leiðari) er 200 m langur og þverflatarmál hans er 4 mm². a) Í staðinn fyrir hann er settur leiðari úr eir/kopar. Hvert verður þverflatarmál nýja leiðarans miðað við að viðnám hans verði það sama og álvírsins? b) Næst er settur leiðari úr platínu. Hvert verður þverflatarmál hans miðað við að viðnámið verði það sama og álvírsins?', p: { mat: 'al', l: 200, A: 4, to: ['kopar', 'platina'] }, teacher: 'R = 1,39 Ω · a) 2,56 mm² · b) 14,1 mm²' },
    presets: [
      { level: 'lett', p: { mat: 'al', l: 100, A: 10, to: ['kopar'] } },
      { level: 'lett', p: { mat: 'kopar', l: 50, A: 1.5, to: ['al'] } },
      { level: 'midl', p: { mat: 'kopar', l: 150, A: 2.5, to: ['al', 'silfur'] } },
      { level: 'midl', p: { mat: 'al', l: 300, A: 16, to: ['kopar', 'jarn'] } },
      { level: 'erf', p: { mat: 'kopar', l: 80, d: 1.6, to: ['al', 'platina'] } },
      { level: 'erf', p: { mat: 'al', lkm: 0.45, A: 25, to: ['kopar', 'silfur'] } },
    ],
    gen(r, lv) {
      const mat = r.pick(['al', 'kopar']);
      const others = ['kopar', 'al', 'silfur', 'platina', 'jarn', 'gull'].filter((k) => k !== mat);
      const first = mat === 'al' ? 'kopar' : 'al';
      if (lv === 'lett') return { mat, l: r.pick([50, 100, 150, 200]), A: r.pick([2.5, 4, 6, 10, 16]), to: [first] };
      const second = r.pick(others.filter((k) => k !== first));
      if (lv === 'midl') return { mat, l: r.step(50, 500, 10), A: r.pick([1.5, 2.5, 4, 6, 10, 16]), to: [first, second] };
      return { mat, l: r.step(40, 400, 5), d: r.pick([1, 1.2, 1.6, 2, 2.5, 3]), to: [first, second] };
    },
    valid: (p, v) => p.to.every((k) => v['A_' + k] > 0.1 && v['A_' + k] < 600),
    text(p) {
      const L = 'abc';
      let s = 'Leiðari úr ' + dat(p.mat) + ' er ' + lTxt(p) + ' langur og ' + (p.d != null ? g(p.d) + ' mm í þvermál' : 'þverflatarmál hans er ' + g(p.A) + ' mm²') + '. Reiknaðu fyrst viðnám hans. ';
      p.to.forEach((k, i) => { s += L[i] + ') Í staðinn er settur leiðari úr ' + dat(k) + '. Hvert þarf þverflatarmál hans að vera svo viðnámið verði það sama? '; });
      return s.trim();
    },
    table: (p) => [p.mat, ...p.to].map(rhoLine),
    parts: (p) => [{ k: 'R', label: 'Viðnám upphaflega leiðarans', unit: 'Ω' }, ...p.to.map((k, i) => ({ k: 'A_' + k, label: 'abc'[i] + ') Þverflatarmál – ' + M(k).short, unit: 'mm²' }))],
    solve(p, o = {}) {
      const l = o.l ?? Lm(p), A = o.A ?? Am(p), r1 = o.rho ?? M(p.mat).rho;
      const R = (r1 * l) / A;
      const v = { R };
      const st = [];
      prep(p, st, o);
      st.push({ h: 'Viðnám upphaflega leiðarans', m: ['R = \\f{ρ·l}{A} = \\f{' + g(r1, 5) + '·' + g(l) + '}{' + f(A) + '} = ' + f(R) + ' Ω'], ans: true });
      p.to.forEach((k, i) => {
        const r2 = M(k).rho;
        const Ak = o.f === 'inv' ? (A * r1) / r2 : (r2 * l) / R;
        v['A_' + k] = Ak;
        st.push({ h: 'abc'[i] + ') Nýtt efni: ' + M(k).short, m: ['A = \\f{ρ·l}{R} = \\f{' + g(r2, 5) + '·' + g(l) + '}{' + f(R) + '} = ' + f(Ak) + ' mm²'], n: 'Flýtileið: A_2 = A_1·ρ_2/ρ_1 = ' + f(A) + '·' + g(r2, 5) + '/' + g(r1, 5) + ' = ' + f((A * r2) / r1) + ' mm² (lengdin styttist út).', ans: true });
      });
      return { v, steps: st };
    },
    mistakes: (p) => [...geoMistakes(p, { noMat: true }), { o: { f: 'inv' }, msg: 'Þú snerir hlutfallinu við. Efni með MEIRA eðlisviðnám þarf GILDARI leiðara til að viðnámið haldist.' }],
    given: (p) => [['efni 1', M(p.mat).short, 'upphaflegt efni'], ['l', lTxt(p), 'lengd'], p.d != null ? ['d', g(p.d) + ' mm', 'þvermál'] : ['A', g(p.A) + ' mm²', 'þverflatarmál'], ['ný efni', p.to.map((k) => M(k).short).join(', '), 'ρ úr töflu']],
    find: (p) => [['R', 'viðnám upphaflega leiðarans'], ...p.to.map((k) => ['A', 'þverflatarmál – ' + M(k).short])],
    fq: { right: 'A = \\f{ρ·l}{R}', wrong: ['A = \\f{R·l}{ρ}', 'A = \\f{ρ·R}{l}', 'A = ρ·l·R'], why: 'Fyrst R = ρ·l/A með gamla efninu. Síðan sama R, nýtt ρ: A = ρ·l/R.' },
    rearr: () => 'Tvö skref: (1) R með upphaflega efninu. (2) Umrita R = ρ·l/A → A = ρ·l/R og nota nýja ρ-gildið.',
    hints: () => ['„Sama viðnám“ þýðir: reiknaðu R upphaflega leiðarans fyrst.', 'Lengdin er sú sama. Aðeins efnið (ρ) og þverflatarmálið breytast.', 'A = ρ·l/R með ρ nýja efnisins. Betra leiðandi efni (minna ρ) → grennri leiðari.'],
    sanity: (p, v) => p.to.map((k) => M(k).short + (M(k).rho < M(p.mat).rho ? ' leiðir betur → minna A' : ' leiðir verr → meira A') + ' (' + f(v['A_' + k]) + ' mm²)').join(' · '),
  });

  /* ---------------- V5 – Reikna hitastig ---------------- */
  T.push({
    id: 'V5', ch: 3, fam: 'T', cards: [6], title: 'Reikna hitastig út frá viðnámi', short: 'Lokahitastig',
    source: '3.3.1 – dæmi 5', skills: ['Δt = (R_t2 − R_t1)/(R_t1·α)', 't₂ = t₁ + Δt', 'Hitastuðull kopars'],
    original: { text: 'Spóla er undin úr eir/kopar-vír. Áður en spenna er sett yfir hana er viðnám hennar mælt við 20 °C hita og það reynist vera 8,5 Ω. Eftir að spenna er sett yfir hana og straumur runnið í henni um tíma er viðnám hennar aftur mælt (eftir að spennan var aftengd) og reynist það þá vera 10 Ω. Hvað er spólan þá orðin heit?', p: { mat: 'kopar', R1: 8.5, t1: 20, R2: 10 }, teacher: 'Δt = 45,25 °C → t₂ = 65,25 °C' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', R1: 10, t1: 20, R2: 11.95 } },
      { level: 'lett', p: { mat: 'kopar', R1: 100, t1: 20, R2: 115.6 } },
      { level: 'midl', p: { mat: 'nikkel', R1: 5, t1: 10, R2: 6.1 } },
      { level: 'midl', p: { mat: 'kopar', R1: 2.4, t1: 15, R2: 2.9 } },
      { level: 'erf', p: { mat: 'kopar', R1: 12, t1: 20, R2: 10.5 } },
      { level: 'erf', p: { mat: 'nikkel', R1: 50, t1: 25, R2: 61.3 } },
    ],
    gen(r, lv) {
      let mat, R1, t1, t2;
      if (lv === 'lett') { mat = 'kopar'; R1 = r.pick([2, 4, 5, 8, 10, 20, 50, 100]); t1 = 20; t2 = r.step(40, 120, 5); }
      else if (lv === 'midl') { mat = r.pick(['kopar', 'nikkel']); R1 = r.step(1, 30, 0.5); t1 = r.pick([10, 15, 20, 25]); t2 = t1 + r.step(20, 90, 1); }
      else { mat = r.pick(['kopar', 'nikkel', 'al']); R1 = r.step(1, 80, 0.5); t1 = r.pick([15, 18, 20, 22, 25]); t2 = r() < 0.5 ? t1 - r.step(15, 45, 1) : t1 + r.step(25, 110, 1); }
      const R2 = U.round(P.rAtTemp(R1, M(mat).alpha, t1, t2), R1 >= 20 ? 1 : 2);
      return { mat, R1, t1, R2 };
    },
    valid: (p, v) => v.t2 > -50 && v.t2 < 250 && Math.abs(v.dt) > 5,
    text(p) {
      const a = M(p.mat).srcA === 'kennari' ? '' : ' (α = ' + g(M(p.mat).alpha, 5) + ' /°C)';
      if (p.R2 >= p.R1) return 'Spóla er undin úr ' + dat(p.mat) + 'vír' + a + '. Við ' + tP(p.t1) + ' mælist viðnám hennar ' + g(p.R1) + ' Ω. Eftir að straumur hefur runnið um hana í nokkurn tíma mælist viðnámið ' + g(p.R2) + ' Ω. Hvað er spólan þá orðin heit?';
      return 'Leiðari úr ' + dat(p.mat) + a + ' hefur viðnámið ' + g(p.R1) + ' Ω við ' + tP(p.t1) + '. Úti í kulda mælist viðnám hans ' + g(p.R2) + ' Ω. Hvert er hitastig leiðarans þá?';
    },
    table: (p) => [alphaLine(p.mat)],
    parts: () => [{ k: 'dt', label: 'Hitastigsbreyting Δt', unit: '°C', abs: 0.3 }, { k: 't2', label: 'Lokahitastig t₂', unit: '°C', abs: 0.3 }],
    solve(p, o = {}) {
      const a = o.alpha ?? M(p.mat).alpha;
      const dt = o.f === 'r2den' ? (p.R2 - p.R1) / (p.R2 * a) : (p.R2 - p.R1) / (p.R1 * a);
      const t2 = o.f === 'not1' ? dt : p.t1 + dt;
      const st = [
        { h: 'Formúla', m: ['Δt = \\f{R_{t2} − R_{t1}}{R_{t1}·α}', 't_2 = t_1 + Δt'], n: alphaLine(p.mat) + '. R_{t1} = ' + g(p.R1) + ' Ω er viðnámið við upphafshitastigið.' },
        { h: 'Hitastigsbreytingin', m: ['Δt = \\f{' + g(p.R2) + ' − ' + g(p.R1) + '}{' + g(p.R1) + '·' + g(a, 5) + '} = \\f{' + f(p.R2 - p.R1) + '}{' + f(p.R1 * a) + '} = ' + f(dt) + ' °C'], ans: true },
        { h: 'Lokahitastigið', m: ['t_2 = ' + g(p.t1) + ' + ' + sgn(U.round(dt, 2)) + ' = ' + f(t2) + ' °C'], ans: true },
      ];
      return { v: { dt, t2 }, steps: st };
    },
    mistakes: (p) => [
      { o: { f: 'r2den' }, msg: 'Þú deildir með R_t2·α. Rétt er að deila með upphafsviðnáminu R_t1·α. (Sama villa er í vélrituðu formúlunni á svarglæru 3.3.1 – útreikningur kennarans notar samt R_t1.)' },
      { o: { f: 'not1' }, msg: 'Þetta er hitastigsBREYTINGIN Δt. Leggðu upphafshitastigið t₁ við til að fá lokahitastigið.', parts: ['t2'] },
      { o: { alpha: p.mat === 'kopar' ? 0.0055 : 0.0039 }, msg: 'Athugaðu hitastuðulinn: kopar α = 0,0039, nikkel α = 0,0055.' },
    ],
    given: (p) => [['R_t1', g(p.R1) + ' Ω', 'viðnám í upphafi'], ['t₁', tP(p.t1), 'upphafshitastig'], ['R_t2', g(p.R2) + ' Ω', 'viðnám í lokin'], ['efni', M(p.mat).short, 'α úr töflu']],
    find: () => [['Δt', 'hitastigsbreyting'], ['t₂', 'lokahitastig']],
    fq: { right: 'Δt = \\f{R_{t2} − R_{t1}}{R_{t1}·α}', wrong: ['Δt = \\f{R_{t2} − R_{t1}}{R_{t2}·α}', 'Δt = \\f{R_{t1}·α}{R_{t2} − R_{t1}}', 'Δt = (R_{t2} − R_{t1})·α'], why: 'Breyting viðnáms = R_t1·α·Δt. Deildu með R_t1·α til að fá Δt. Nefnarinn notar UPPHAFSviðnámið.' },
    rearr: () => 'Úr R_t2 = R_t1 + R_t1·α·Δt: dragðu R_t1 frá báðum hliðum og deildu með R_t1·α.',
    hints: (p) => ['Viðnámið breyttist af því að hitastigið breyttist. Finndu fyrst Δt.', 'Viðnámsbreytingin er ' + f(p.R2 - p.R1) + ' Ω. Deildu henni með R_t1·α (upphafsviðnámið!).', 'Ekki gleyma: lokahitastig = upphafshitastig + Δt.'],
    sanity: (p, v) => (p.R2 > p.R1 ? 'Viðnámið jókst → hitastigið hækkaði. ' : 'Viðnámið minnkaði → hitastigið lækkaði. ') + 'Athugun: R_t1·(1 + α·Δt) = ' + f(P.rAtTemp(p.R1, M(p.mat).alpha, 0, v.dt)) + ' Ω ≈ ' + g(p.R2) + ' Ω ✓',
  });

  /* ---------------- V6 – Viðnám við hitabreytingu ---------------- */
  T.push({
    id: 'V6', ch: 3, fam: 'T', cards: [5], title: 'Viðnám við hitabreytingu (hitun og kólnun)', short: 'Viðnám og hiti',
    source: '3.3.1 – dæmi 6', skills: ['R_t2 = R_t1 ± R_t1·α·Δt', 'Δt yfir núllið', 'Hitastuðull nikkels'],
    original: { text: 'Leiðari (vír) úr nikkel hefur viðnámið 7 Ω við hitastigið 10 °C. Reiknaðu út viðnám hans við: a) +50 °C  b) −15 °C', p: { mat: 'nikkel', R1: 7, t1: 10, ta: 50, tb: -15 }, teacher: 'a) 8,54 Ω · b) 6,0375 Ω ≈ 6 Ω' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', R1: 1, t1: 20, ta: 80, tb: -20 }, note: 'Dæmi af glæru 3.3' },
      { level: 'lett', p: { mat: 'kopar', R1: 10, t1: 20, ta: 70, tb: 0 } },
      { level: 'midl', p: { mat: 'nikkel', R1: 15, t1: 20, ta: 90, tb: -10 } },
      { level: 'midl', p: { mat: 'kopar', R1: 4.5, t1: 15, ta: 75, tb: -25 } },
      { level: 'erf', p: { mat: 'al', R1: 2, t1: 20, ta: 120, tb: -40 } },
      { level: 'erf', p: { mat: 'nikkel', R1: 120, t1: -5, ta: 35, tb: -30 } },
    ],
    gen(r, lv) {
      if (lv === 'lett') return { mat: 'kopar', R1: r.pick([1, 2, 5, 10, 20, 50, 100]), t1: 20, ta: 20 + r.pick([20, 30, 40, 50, 60]), tb: r.pick([0, -10, -20]) };
      if (lv === 'midl') { const t1 = r.pick([10, 15, 20, 25]); return { mat: r.pick(['kopar', 'nikkel']), R1: r.step(1, 50, 0.5), t1, ta: t1 + r.step(20, 80, 5), tb: r.step(-30, 5, 5) }; }
      const t1 = r.pick([-5, 0, 10, 15, 25]);
      return { mat: r.pick(['nikkel', 'kopar', 'al']), R1: r.step(0.5, 150, 0.5), t1, ta: t1 + r.step(30, 120, 5), tb: t1 - r.step(15, 50, 5) };
    },
    valid: (p, v) => p.tb < p.t1 && p.ta > p.t1 && v.Rb > 0,
    text(p) {
      const a = M(p.mat).srcA === 'kennari' ? '' : ' (α = ' + g(M(p.mat).alpha, 5) + ' /°C)';
      return 'Leiðari (vír) úr ' + dat(p.mat) + a + ' hefur viðnámið ' + g(p.R1) + ' Ω við hitastigið ' + tP(p.t1) + '. Reiknaðu út viðnám hans við: a) ' + tC(p.ta) + '  b) ' + tC(p.tb);
    },
    table: (p) => [alphaLine(p.mat)],
    parts: (p) => [{ k: 'Ra', label: 'a) Viðnám við ' + tC(p.ta), unit: 'Ω' }, { k: 'Rb', label: 'b) Viðnám við ' + tC(p.tb), unit: 'Ω' }],
    solve(p, o = {}) {
      const a = o.alpha ?? M(p.mat).alpha;
      const dA = p.ta - p.t1, dB = p.t1 - p.tb;
      let Ra = p.R1 + p.R1 * a * dA, Rb = p.R1 - p.R1 * a * dB;
      if (o.f === 'useT2') { Ra = p.R1 * (1 + a * p.ta); Rb = p.R1 * (1 - a * Math.abs(p.tb)); }
      if (o.f === 'sign') { Ra = p.R1 - p.R1 * a * dA; Rb = p.R1 + p.R1 * a * dB; }
      if (o.f === 'zero') { Rb = p.R1 - p.R1 * a * Math.abs(Math.abs(p.tb) - Math.abs(p.t1)); Ra = NaN; }
      if (o.f === 'only') { Ra = p.R1 * a * dA; Rb = p.R1 * a * dB; }
      const st = [
        { h: 'Formúlur', m: ['Hitun: R_{t2} = R_{t1} + R_{t1}·α·Δt', 'Kólnun: R_{t2} = R_{t1} − R_{t1}·α·Δt'], n: alphaLine(p.mat) },
        { h: 'a) Hitun upp í ' + tC(p.ta), m: ['Δt = ' + g(p.ta) + ' − ' + sgn(p.t1) + ' = ' + g(dA) + ' °C', 'R_{t2} = ' + g(p.R1) + ' + ' + g(p.R1) + '·' + g(a, 5) + '·' + g(dA) + ' = ' + g(p.R1) + ' + ' + f(p.R1 * a * dA), 'R_{t2} = ' + f(Ra) + ' Ω'], ans: true },
        { h: 'b) Kólnun niður í ' + tC(p.tb), m: ['Δt = ' + g(p.t1) + ' − ' + sgn(p.tb) + ' = ' + g(dB) + ' °C', 'R_{t2} = ' + g(p.R1) + ' − ' + g(p.R1) + '·' + g(a, 5) + '·' + g(dB) + ' = ' + g(p.R1) + ' − ' + f(p.R1 * a * dB), 'R_{t2} = ' + f(Rb) + ' Ω'], ans: true, n: p.tb < 0 && p.t1 > 0 ? 'Talið er yfir núllið: frá ' + tP(p.t1) + ' niður í ' + tP(p.tb) + ' eru ' + g(dB) + ' gráður.' : '' },
      ];
      return { v: { Ra, Rb }, steps: st };
    },
    mistakes: (p) => [
      { o: { f: 'useT2' }, msg: 'Þú notaðir hitastigið sjálft í stað hitastigsbreytingarinnar. Δt = mismunur upphafs- og lokahitastigs.' },
      { o: { f: 'sign' }, msg: 'Formerkið snýr öfugt: við hitun eykst viðnám málma (leggja við), við kólnun minnkar það (draga frá).' },
      { o: { f: 'zero' }, msg: 'Δt er ekki rétt: teldu yfir núllið. Frá ' + tP(p.t1) + ' niður í ' + tP(p.tb) + ' eru ' + g(p.t1 - p.tb) + ' gráður.' },
      { o: { f: 'only' }, msg: 'Þú reiknaðir aðeins breytinguna R_t1·α·Δt. Leggðu hana við (eða dragðu frá) upphafsviðnáminu.' },
      { o: { alpha: p.mat === 'kopar' ? 0.0055 : 0.0039 }, msg: 'Rangur hitastuðull. Kopar: α = 0,0039 · nikkel: α = 0,0055.' },
    ],
    given: (p) => [['R_t1', g(p.R1) + ' Ω', 'viðnám við t₁'], ['t₁', tP(p.t1), 'upphafshitastig'], ['t₂', tC(p.ta) + ' og ' + tC(p.tb), 'ný hitastig'], ['efni', M(p.mat).short, 'α úr töflu']],
    find: () => [['R_t2', 'viðnám við hvort hitastig']],
    fq: { right: 'R_{t2} = R_{t1} + R_{t1}·α·Δt', wrong: ['R_{t2} = R_{t1}·α·Δt', 'R_{t2} = R_{t1} + α·t_2', 'R_{t2} = \\f{R_{t1}}{α·Δt}'], why: 'Viðnámið breytist um R_t1·α·Δt. Sú breyting bætist við (hitun) eða dregst frá (kólnun) upphafsviðnáminu.' },
    rearr: () => 'Ekki þarf að umrita. Mikilvægast: finndu Δt rétt og veldu + (hitun) eða − (kólnun).',
    hints: (p) => ['Byrjaðu á að finna Δt fyrir hvort hitastig – mismuninn frá ' + tP(p.t1) + '.', 'Í b-lið kólnar leiðarinn' + (p.tb < 0 && p.t1 > 0 ? ' niður fyrir núll – teldu gráðurnar yfir núllið' : '') + '.', 'Viðnámsbreytingin er R_t1·α·Δt. Hitun: leggja við. Kólnun: draga frá.'],
    sanity: (p, v) => 'Viðnámið á að vera MEIRA en ' + g(p.R1) + ' Ω í a-lið (' + f(v.Ra) + ') og MINNA í b-lið (' + f(v.Rb) + ').',
  });

  /* ================= Spennufall ================= */
  const twoNote = 'Tvíleiðari: straumurinn fer eftir öðrum leiðaranum að álaginu og til baka eftir hinum. Lengd straumleiðarinnar er því 2·l.';
  function wireR(p, o) {
    const rho = o.rho ?? M(p.mat).rho, l = o.l ?? Lm(p), A = o.A ?? Am(p);
    const k = o.f === 'single' ? 1 : o.f === 'four' ? 4 : 2;
    return { rho, l, A, R: (k * rho * l) / A };
  }
  function wireSteps(p, st, w, o) {
    prep(p, st, o);
    st.push({ h: 'Viðnám leiðslunnar (tvíleiðari)', m: ['R_l = \\f{ρ·l·2}{A} = \\f{' + g(w.rho, 5) + '·' + g(w.l) + '·2}{' + f(w.A) + '} = \\f{' + f(w.rho * w.l * 2) + '}{' + f(w.A) + '}', 'R_l = ' + f(w.R) + ' Ω'], n: twoNote, ans: true });
  }
  const twoMist = (p) => [
    ...geoMistakes(p),
    { o: { f: 'single' }, msg: 'Þú gleymdir að margfalda með 2. ' + twoNote, code: 'two' },
    { o: { f: 'four' }, msg: 'Þú margfaldaðir tvisvar með 2. Fjarlægðin l er aðeins tvöfölduð einu sinni.', code: 'two' },
  ];
  const wireGiven = (p) => [['l', lTxt(p), 'fjarlægð (aðra leið)'], p.d != null ? ['d', g(p.d) + ' mm', 'þvermál'] : ['A', g(p.A) + ' mm²', 'þverflatarmál'], ['efni', M(p.mat).short, 'ρ úr töflu']];
  const genWire = (r, lv) => {
    if (lv === 'lett') return { mat: 'kopar', l: r.pick([10, 15, 20, 25, 30, 40, 50]), A: r.pick([1.5, 2.5, 4]) };
    if (lv === 'midl') return { mat: r.pick(['kopar', 'kopar', 'al']), l: r.step(20, 150, 5), A: r.pick([0.75, 1, 1.5, 2.5, 4, 6, 10]) };
    return r() < 0.5 ? { mat: r.pick(['kopar', 'al']), lkm: r.step(0.1, 0.4, 0.01), A: r.pick([4, 6, 10, 16, 25]) } : { mat: 'kopar', l: r.step(20, 150, 5), d: r.pick([0.8, 1.13, 1.38, 1.6, 1.78, 2.26]) };
  };
  const currentFor = (r, A) => Math.min(r.pick([5, 6, 8, 10, 13, 16, 20, 25, 32]), Math.max(4, Math.round(A * 7)));

  /* ---------------- S1 – Viðnám tvíleiðara ---------------- */
  T.push({
    id: 'S1', ch: 4, fam: 'U', cards: [7], title: 'Viðnám tvíleiðara', short: 'Viðnám tvíleiðara',
    source: '3.4.1 – dæmi 1', skills: ['R_l = ρ·l·2/A', 'Fram og til baka'],
    original: { text: 'Reiknaðu viðnámið í 50 m löngum tvíleiðara úr eir (kopar) sem hefur þverflatarmálið 0,75 mm². Miðaðu við 20 °C hita á leiðaranum.', p: { mat: 'kopar', l: 50, A: 0.75 }, teacher: 'R_l = 2,373 Ω' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', l: 10, A: 1.5 } },
      { level: 'lett', p: { mat: 'kopar', l: 25, A: 2.5 } },
      { level: 'midl', p: { mat: 'kopar', l: 40, A: 0.75 } },
      { level: 'midl', p: { mat: 'al', l: 120, A: 6 } },
      { level: 'erf', p: { mat: 'kopar', lkm: 0.2, A: 4 } },
      { level: 'erf', p: { mat: 'kopar', l: 35, d: 1.13 } },
    ],
    gen: genWire,
    valid: (p, v) => v.R > 0.02 && v.R < 20,
    text: (p) => 'Reiknaðu viðnámið í ' + lTxt(p) + ' löngum tvíleiðara úr ' + dat(p.mat) + ' sem ' + (p.d != null ? 'er ' + g(p.d) + ' mm í þvermál (hvor leiðari)' : 'hefur þverflatarmálið ' + g(p.A) + ' mm²') + '. Miðaðu við 20 °C hita á leiðaranum.',
    table: (p) => [rhoLine(p.mat)],
    parts: () => [{ k: 'R', label: 'Viðnám leiðslunnar R_l', unit: 'Ω' }],
    solve(p, o = {}) { const w = wireR(p, o), st = []; wireSteps(p, st, w, o); return { v: { R: w.R }, steps: st }; },
    mistakes: twoMist,
    given: wireGiven,
    find: () => [['R_l', 'viðnám beggja leiðaranna']],
    fq: { right: 'R_l = \\f{ρ·l·2}{A}', wrong: ['R_l = \\f{ρ·l}{A}', 'R_l = \\f{ρ·l}{2·A}', 'R_l = \\f{2·A}{ρ·l}'], why: twoNote },
    rearr: () => 'Ekki þarf að umrita. Mundu bara 2-ið: tveir leiðarar, hvor jafnlangur og fjarlægðin.',
    hints: () => ['Tvíleiðari = tveir vírar í sama kapli. Hvað er straumleiðin löng?', 'Straumurinn fer fram og til baka: heildarlengd vírs er 2·l.', 'R_l = ρ·l·2/A.'],
    sanity: (p, v) => 'Einn vír væri ' + f(v.R / 2) + ' Ω. Tveir vírar (fram og til baka) → ' + f(v.R) + ' Ω.',
  });

  /* ---------------- S2 – Spennufall ---------------- */
  T.push({
    id: 'S2', ch: 4, fam: 'U', cards: [7, 8], title: 'Spennufall í tvíleiðara', short: 'Spennufall',
    source: '3.4.1 – dæmi 2', skills: ['R_l = ρ·l·2/A', 'ΔU = I·R_l'],
    original: { text: 'Hve mikið spennufall verður í leiðaranum í dæmi 1 (50 m tvíleiðari úr eir, 0,75 mm²), ef 8 A straumur fer um hann?', p: { mat: 'kopar', l: 50, A: 0.75, I: 8 }, teacher: 'ΔU = 18,98 V' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', l: 20, A: 1.5, I: 10 } },
      { level: 'lett', p: { mat: 'kopar', l: 30, A: 2.5, I: 16 } },
      { level: 'midl', p: { mat: 'kopar', l: 45, A: 1.5, I: 13 } },
      { level: 'midl', p: { mat: 'al', l: 80, A: 10, I: 32 } },
      { level: 'erf', p: { mat: 'kopar', l: 60, d: 1.38, I: 10 } },
      { level: 'erf', p: { mat: 'kopar', lkm: 0.15, A: 4, I: 25 } },
    ],
    gen(r, lv) { const p = genWire(r, lv); p.I = currentFor(r, Am(p)); return p; },
    valid: (p, v) => v.dU > 0.3 && v.dU < 60,
    text: (p) => 'Hve mikið spennufall verður í ' + lTxt(p) + ' löngum tvíleiðara úr ' + dat(p.mat) + ', ' + aShort(p) + ', ef ' + g(p.I) + ' A straumur fer um hann? Reiknaðu fyrst viðnám leiðslunnar.',
    table: (p) => [rhoLine(p.mat)],
    parts: () => [{ k: 'R', label: 'Viðnám leiðslunnar R_l', unit: 'Ω' }, { k: 'dU', label: 'Spennufall ΔU', unit: 'V', from: (p, s) => p.I * s.R }],
    solve(p, o = {}) {
      const w = wireR(p, o), st = [];
      wireSteps(p, st, w, o);
      const dU = p.I * w.R;
      st.push({ h: 'Spennufallið', m: ['ΔU = I·R_l = ' + g(p.I) + '·' + f(w.R) + ' = ' + f(dU) + ' V'], ans: true });
      return { v: { R: w.R, dU }, steps: st };
    },
    mistakes: twoMist,
    given: (p) => [...wireGiven(p), ['I', g(p.I) + ' A', 'straumur']],
    find: () => [['R_l', 'viðnám leiðslunnar'], ['ΔU', 'spennufall í V']],
    fq: { right: 'ΔU = I·R_l', wrong: ['ΔU = \\f{I}{R_l}', 'ΔU = \\f{R_l}{I}', 'ΔU = I + R_l'], why: 'Ohmslögmál fyrir leiðsluna sjálfa: spennan sem „tapast“ í leiðaranum er straumur sinnum viðnám leiðarans.' },
    rearr: () => 'Tvö skref: (1) R_l = ρ·l·2/A. (2) ΔU = I·R_l. Ekki þarf að umrita.',
    hints: () => ['Spennufall verður af því að leiðslan sjálf hefur viðnám.', 'Finndu fyrst R_l – munið að þetta er tvíleiðari (×2).', 'Margfaldaðu R_l með straumnum: ΔU = I·R_l.'],
    sanity: (p, v) => 'Spennufall í heimilislögnum er oftast nokkur volt. Hér: ' + f(v.dU) + ' V af t.d. 230 V = ' + f((v.dU / 230) * 100) + ' %.',
  });

  /* ---------------- S3 – Spennufall í prósentum ---------------- */
  T.push({
    id: 'S3', ch: 4, fam: 'U', cards: [7, 8, 9], title: 'Spennufall í prósentum', short: 'Spennufall í %',
    source: '3.4.1 – dæmi 3', skills: ['ΔU = I·R_l', '% = ΔU/U₁·100'],
    original: { text: 'Leiðarinn í dæmi 1 og 2 (50 m tvíleiðari úr eir, 0,75 mm², 8 A) er notaður við 220 V spennu. Hve stór hundraðshluti (%) er þá spennufallið í leiðaranum?', p: { mat: 'kopar', l: 50, A: 0.75, I: 8, U: 220 }, teacher: '8,62 % (nákvæmt: 8,63 %)' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', l: 20, A: 2.5, I: 16, U: 230 } },
      { level: 'lett', p: { mat: 'kopar', l: 50, A: 2.5, I: 24, U: 230 }, note: 'Vatnshitakútur – glæra 3.4, dæmi 3' },
      { level: 'midl', p: { mat: 'kopar', l: 50, A: 4, I: 24, U: 230 }, note: 'Glæra 3.4, dæmi 3c (4 mm²)' },
      { level: 'midl', p: { mat: 'kopar', l: 35, A: 1.5, I: 10, U: 230 } },
      { level: 'erf', p: { mat: 'al', l: 150, A: 16, I: 40, U: 400 } },
      { level: 'erf', p: { mat: 'kopar', lkm: 0.12, A: 6, I: 20, U: 230 } },
    ],
    gen(r, lv) { const p = genWire(r, lv); p.I = currentFor(r, Am(p)); p.U = lv === 'erf' ? r.pick([230, 400]) : r.pick([220, 230]); return p; },
    valid: (p, v) => v.pct > 0.5 && v.pct < 15,
    text: (p) => g(Lm(p)) + ' m langur tvíleiðari úr ' + dat(p.mat) + ', ' + aShort(p) + ', flytur ' + g(p.I) + ' A straum frá ' + g(p.U) + ' V spennugjafa.' + (p.lkm != null ? ' (Lengdin er ' + lTxt(p) + '.)' : '') + ' a) Reiknaðu viðnám leiðarans. b) Reiknaðu spennufallið. c) Hve stór hundraðshluti (%) af spennunni er spennufallið?',
    table: (p) => [rhoLine(p.mat)],
    parts: () => [
      { k: 'R', label: 'a) Viðnám R_l', unit: 'Ω' },
      { k: 'dU', label: 'b) Spennufall ΔU', unit: 'V', from: (p, s) => p.I * s.R },
      { k: 'pct', label: 'c) Spennufall í %', unit: '%', from: (p, s) => (s.dU / p.U) * 100 },
    ],
    solve(p, o = {}) {
      const w = wireR(p, o), st = [];
      wireSteps(p, st, w, o);
      const dU = p.I * w.R;
      const pct = o.f === 'nopct' ? dU / p.U : o.f === 'u2' ? (dU / (p.U - dU)) * 100 : (dU / p.U) * 100;
      st.push({ h: 'Spennufallið', m: ['ΔU = I·R_l = ' + g(p.I) + '·' + f(w.R) + ' = ' + f(dU) + ' V'], ans: true });
      st.push({ h: 'Spennufall í prósentum', m: ['% = \\f{ΔU}{U_1}·100 = \\f{' + f(dU) + '}{' + g(p.U) + '}·100 = ' + f(pct) + ' %'], ans: true, n: 'Á einni svarglæru 3.4.1 vantar „·100“ í formúluna – útkoman þar (8,62 %) er samt reiknuð sem prósenta.' });
      return { v: { R: w.R, dU, pct }, steps: st };
    },
    mistakes: (p) => [
      ...twoMist(p),
      { o: { f: 'nopct' }, msg: 'Þú gleymdir að margfalda með 100. ΔU/U₁ er hlutfall (t.d. 0,086); sinnum 100 gefur prósentu (8,6 %).', parts: ['pct'] },
      { o: { f: 'u2' }, msg: 'Þú deildir með spennunni á álaginu (U₂). Hlutfallið er reiknað af spennu spennugjafans U₁.', parts: ['pct'] },
    ],
    given: (p) => [...wireGiven(p), ['I', g(p.I) + ' A', 'straumur'], ['U₁', g(p.U) + ' V', 'spenna gjafans']],
    find: () => [['R_l', 'viðnám'], ['ΔU', 'spennufall'], ['%', 'hlutfall af U₁']],
    fq: { right: '% = \\f{ΔU}{U_1}·100', wrong: ['% = \\f{ΔU}{U_1}', '% = \\f{U_1}{ΔU}·100', '% = ΔU·U_1·100'], why: 'Hlutfall = hluti/heild. Heildin er spenna gjafans U₁. Sinnum 100 til að fá prósentu.' },
    rearr: () => 'Þrjú skref, engin umritun: R_l → ΔU = I·R_l → % = ΔU/U₁·100.',
    hints: () => ['Byrjaðu á viðnámi leiðslunnar (tvíleiðari ×2).', 'Spennufall: ΔU = I·R_l.', 'Prósenta: deildu ΔU með spennu gjafans og margfaldaðu með 100.'],
    sanity: (p, v) => 'Til viðmiðunar: á glæru 3.4 kemur fram að í skipum má spennufall ekki vera yfir 6 %. Hér ' + f(v.pct) + ' %' + (v.pct > 6 ? ' – of mikið, sverari kapal þyrfti.' : ' – innan þeirra marka.'),
  });

  /* ---------------- S4 – Hámarkslengd ---------------- */
  T.push({
    id: 'S4', ch: 4, fam: 'U', cards: [11], title: 'Hámarkslengd kapals', short: 'Hámarkslengd',
    source: '3.4.1 – dæmi 4', skills: ['R = ΔU/I', 'l = R·A/ρ', '÷ 2 fyrir tvíleiðara'],
    original: { text: 'Hve langt er hægt að leggja kapal sem er 1,5 mm² tvíleiðari úr eir (kopar), ef spennufallið yfir hann má vera 5 V við 10 A straum?', p: { mat: 'kopar', A: 1.5, I: 10, dU: 5 }, teacher: 'R = 0,5 Ω → l = 42,1/2 = 21 m' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', A: 2.5, I: 16, dU: 4 } },
      { level: 'lett', p: { mat: 'kopar', A: 1.5, I: 10, dU: 6.9 } },
      { level: 'midl', p: { mat: 'kopar', A: 4, I: 25, dU: 9.2 } },
      { level: 'midl', p: { mat: 'al', A: 16, I: 50, dU: 10 } },
      { level: 'erf', p: { mat: 'kopar', A: 2.5, I: 16, U: 230, pmax: 3 } },
      { level: 'erf', p: { mat: 'kopar', A: 6, I: 32, U: 400, pmax: 4 } },
    ],
    gen(r, lv) {
      const A = lv === 'lett' ? r.pick([1.5, 2.5, 4]) : r.pick([1.5, 2.5, 4, 6, 10, 16]);
      const mat = lv === 'midl' ? r.pick(['kopar', 'kopar', 'al']) : 'kopar';
      const I = currentFor(r, A);
      if (lv === 'erf') return { mat, A, I, U: r.pick([230, 400]), pmax: r.pick([2, 3, 4, 5]) };
      return { mat, A, I, dU: lv === 'lett' ? r.pick([3, 4, 5, 6, 8, 10]) : r.step(2, 12, 0.1) };
    },
    valid: (p, v) => v.l > 3 && v.l < 600,
    text(p) {
      if (p.pmax != null) return 'Kapall, tvíleiðari úr ' + dat(p.mat) + ' með þverflatarmálið ' + g(p.A) + ' mm², tengir ' + g(p.I) + ' A álag við ' + g(p.U) + ' V spennugjafa. Spennufallið má mest vera ' + g(p.pmax) + ' % af spennunni. a) Hve mörg volt má spennufallið vera? b) Hvert má viðnám kapalsins mest vera? c) Hve langt má vera frá spennugjafa að álagi?';
      return 'Hve langt er hægt að leggja kapal sem er ' + g(p.A) + ' mm² tvíleiðari úr ' + dat(p.mat) + ', ef spennufallið yfir hann má vera ' + g(p.dU) + ' V við ' + g(p.I) + ' A straum?';
    },
    table: (p) => [rhoLine(p.mat)],
    parts: (p) => [
      ...(p.pmax != null ? [{ k: 'dU', label: 'a) Leyft spennufall ΔU', unit: 'V' }] : []),
      { k: 'R', label: (p.pmax != null ? 'b) ' : '') + 'Leyft viðnám kapalsins R', unit: 'Ω', from: (q, s) => (s.dU ?? q.dU) / q.I },
      { k: 'l', label: (p.pmax != null ? 'c) ' : '') + 'Hámarksfjarlægð l', unit: 'm', from: (q, s) => (s.R * q.A) / (2 * M(q.mat).rho) },
    ],
    solve(p, o = {}) {
      const rho = o.rho ?? M(p.mat).rho;
      const dU = p.pmax != null ? (p.pmax * p.U) / 100 : p.dU;
      const R = o.f === 'useU' ? (p.U ?? 230) / p.I : dU / p.I;
      const l = o.f === 'single' ? (R * p.A) / rho : (R * p.A) / (2 * rho);
      const st = [];
      if (p.pmax != null) st.push({ h: 'Leyft spennufall í voltum', m: ['ΔU = \\f{%·U_1}{100} = \\f{' + g(p.pmax) + '·' + g(p.U) + '}{100} = ' + f(dU) + ' V'], ans: true });
      st.push({ h: 'Leyft viðnám (Ohmslögmál)', m: ['R = \\f{ΔU}{I} = \\f{' + f(dU) + '}{' + g(p.I) + '} = ' + f(R) + ' Ω'], ans: true, n: 'Þetta er viðnám BEGGJA leiðaranna samanlagt.' });
      st.push({ h: 'Lengd – umrituð formúla', m: ['l = \\f{R·A}{ρ·2} = \\f{' + f(R) + '·' + g(p.A) + '}{' + g(rho, 5) + '·2} = \\f{' + f(R * p.A) + '}{' + f(rho * 2) + '}', 'l = ' + f(l) + ' m'], ans: true, n: 'R·A/ρ = ' + f((R * p.A) / rho) + ' m er heildarlengd vírsins. Deilt með 2 fæst fjarlægðin (lengd kapalsins).' });
      return { v: { ...(p.pmax != null ? { dU } : {}), R, l }, steps: st };
    },
    mistakes: (p) => [
      { o: { f: 'single' }, msg: 'Þú gleymdir að deila með 2. R·A/ρ gefur heildarlengd vírsins (fram og til baka); kapallinn er helmingur þess.', code: 'two', parts: ['l'] },
      { o: { f: 'useU' }, msg: 'Þú notaðir spennu kerfisins í stað leyfilegs spennufalls. R kapalsins = leyft ΔU / I.' },
      ...geoMistakes(p).filter((x) => x.code === 'rho'),
    ],
    given: (p) => [['A', g(p.A) + ' mm²', 'þverflatarmál'], ['I', g(p.I) + ' A', 'straumur'], p.pmax != null ? ['%', g(p.pmax) + ' % af ' + g(p.U) + ' V', 'leyft spennufall'] : ['ΔU', g(p.dU) + ' V', 'leyft spennufall'], ['efni', M(p.mat).short + ', tvíleiðari', 'ρ úr töflu']],
    find: () => [['R', 'leyft viðnám'], ['l', 'hámarksfjarlægð']],
    fq: { right: 'l = \\f{R·A}{ρ·2}', wrong: ['l = \\f{R·A}{ρ}', 'l = \\f{ρ·2}{R·A}', 'l = \\f{R·ρ}{A·2}'], why: 'Úr R = ρ·l·2/A: margfaldaðu með A og deildu með ρ·2. R fæst fyrst úr R = ΔU/I.' },
    rearr: () => 'Tvær umritanir: (1) ΔU = I·R → R = ΔU/I. (2) R = ρ·l·2/A → l = R·A/(ρ·2).',
    hints: (p) => [p.pmax != null ? 'Byrjaðu á að breyta prósentunni í volt: ΔU = %·U/100.' : 'Hvaða viðnám má kapallinn hafa? Notaðu Ohmslögmál með leyfðu spennufalli.', 'R = ΔU/I. Þetta er viðnám beggja leiðaranna.', 'l = R·A/ρ er heildarlengd vírsins – deildu með 2 til að fá fjarlægðina.'],
    sanity: (p, v) => 'Athugun: R_l = ρ·l·2/A = ' + f((M(p.mat).rho * v.l * 2) / p.A) + ' Ω og ΔU = I·R_l = ' + f((p.I * M(p.mat).rho * v.l * 2) / p.A) + ' V ✓',
  });

  /* ---------------- S5 – Nauðsynlegt þverflatarmál ---------------- */
  T.push({
    id: 'S5', ch: 4, fam: 'U', cards: [12], title: 'Nauðsynlegt þverflatarmál', short: 'Þverflatarmál kapals',
    source: '3.4.1 – dæmi 5', skills: ['R = ΔU/I', 'A = ρ·l·2/R', 'Staðalstærðir'],
    original: { text: 'Reiknaðu þverflatarmál eirleiðara í tvíleiðara kapli, sem tengir álag sem er í 90 m fjarlægð frá spennugjafa. Straumurinn er 60 A. Spennufallið í kaplinum má vera 8 V.', p: { mat: 'kopar', l: 90, I: 60, dU: 8 }, teacher: 'R = 0,13 Ω → A = 24,6 mm² (námundað of snemma; nákvæmt 24,03 mm²)' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', l: 20, I: 10, dU: 4 } },
      { level: 'lett', p: { mat: 'kopar', l: 50, I: 16, dU: 6 } },
      { level: 'midl', p: { mat: 'kopar', l: 40, I: 25, dU: 6.9 } },
      { level: 'midl', p: { mat: 'al', l: 100, I: 40, dU: 10 } },
      { level: 'erf', p: { mat: 'kopar', l: 60, I: 32, U: 230, pmax: 3 } },
      { level: 'erf', p: { mat: 'kopar', lkm: 0.12, I: 50, U: 400, pmax: 5 } },
    ],
    gen(r, lv) {
      if (lv === 'lett') return { mat: 'kopar', l: r.pick([10, 20, 25, 30, 40, 50]), I: r.pick([10, 16, 20]), dU: r.pick([4, 5, 6, 8]) };
      if (lv === 'midl') return { mat: r.pick(['kopar', 'kopar', 'al']), l: r.step(20, 150, 5), I: r.pick([16, 20, 25, 32, 40, 50, 63]), dU: r.step(4, 12, 0.1) };
      return r() < 0.5 ? { mat: 'kopar', l: r.step(20, 150, 5), I: r.pick([16, 20, 25, 32, 40]), U: r.pick([230, 400]), pmax: r.pick([2, 3, 4, 5]) } : { mat: 'kopar', lkm: r.step(0.1, 0.3, 0.01), I: r.pick([25, 32, 40, 50, 63]), U: 400, pmax: r.pick([3, 4, 5]) };
    },
    valid: (p, v) => v.A > 0.5 && v.A < 120,
    text(p) {
      if (p.pmax != null) return 'Álag sem tekur ' + g(p.I) + ' A er í ' + lTxt(p) + ' fjarlægð frá ' + g(p.U) + ' V spennugjafa og tengist með tvíleiðara kapli úr ' + dat(p.mat) + '. Spennufallið má mest vera ' + g(p.pmax) + ' %. a) Hve mörg volt má spennufallið vera? b) Hvert má viðnám kapalsins vera? c) Hvert þarf þverflatarmál leiðaranna að vera? Hvaða staðalstærð velur þú?';
      return 'Reiknaðu þverflatarmál ' + (p.mat === 'kopar' ? 'eirleiðara' : 'álleiðara') + ' í tvíleiðara kapli, sem tengir álag sem er í ' + lTxt(p) + ' fjarlægð frá spennugjafa. Straumurinn er ' + g(p.I) + ' A. Spennufallið í kaplinum má vera ' + g(p.dU) + ' V.';
    },
    table: (p) => [rhoLine(p.mat)],
    parts: (p) => [
      ...(p.pmax != null ? [{ k: 'dU', label: 'a) Leyft spennufall ΔU', unit: 'V' }] : []),
      { k: 'R', label: (p.pmax != null ? 'b) ' : '') + 'Leyft viðnám kapalsins R', unit: 'Ω', from: (q, s) => (s.dU ?? q.dU) / q.I },
      { k: 'A', label: (p.pmax != null ? 'c) ' : '') + 'Nauðsynlegt þverflatarmál A', unit: 'mm²', from: (q, s) => (M(q.mat).rho * Lm(q) * 2) / s.R },
    ],
    solve(p, o = {}) {
      const rho = o.rho ?? M(p.mat).rho, l = o.l ?? Lm(p);
      const dU = p.pmax != null ? (p.pmax * p.U) / 100 : p.dU;
      let R = dU / p.I;
      if (o.f === 'early') R = U.round(R, 2);
      const A = o.f === 'single' ? (rho * l) / R : (rho * l * 2) / R;
      const st = [];
      prep(p, st, o);
      if (p.pmax != null) st.push({ h: 'Leyft spennufall í voltum', m: ['ΔU = \\f{%·U_1}{100} = \\f{' + g(p.pmax) + '·' + g(p.U) + '}{100} = ' + f(dU) + ' V'], ans: true });
      st.push({ h: 'Leyft viðnám (Ohmslögmál)', m: ['R = \\f{ΔU}{I} = \\f{' + f(dU) + '}{' + g(p.I) + '} = ' + U.fmt(R, 5) + ' Ω'], ans: true, n: 'Haltu öllum aukastöfum í R áfram í næsta skref.' });
      const std = RF.nextStdArea(A);
      st.push({ h: 'Þverflatarmál – umrituð formúla', m: ['A = \\f{ρ·l·2}{R} = \\f{' + g(rho, 5) + '·' + g(l) + '·2}{' + U.fmt(R, 5) + '}', 'A = ' + f(A) + ' mm²'], ans: true, n: (std ? 'Næsta staðalstærð fyrir ofan: ' + g(std) + ' mm². ' : '') + (p.l === 90 && p.I === 60 ? 'Á svarglæru er R námundað í 0,13 Ω, sem gefur 24,6 mm². Nákvæmt svar er 24,03 mm².' : '') });
      return { v: { ...(p.pmax != null ? { dU } : {}), R, A }, steps: st };
    },
    mistakes: (p) => [
      { o: { f: 'early' }, ok: true, msg: 'Næstum rétt! Þú námundaðir R of snemma (eins og á svarglærunni). Haltu fleiri aukastöfum í millinðurstöðum.', parts: ['A'] },
      { o: { f: 'single' }, msg: 'Þú gleymdir að margfalda með 2. Tvíleiðari: leiðin fram og til baka er 2·l.', code: 'two', parts: ['A'] },
      ...geoMistakes(p).filter((x) => x.code !== 'radius' && x.code !== 'dA'),
    ],
    given: (p) => [['l', lTxt(p), 'fjarlægð'], ['I', g(p.I) + ' A', 'straumur'], p.pmax != null ? ['%', g(p.pmax) + ' % af ' + g(p.U) + ' V', 'leyft spennufall'] : ['ΔU', g(p.dU) + ' V', 'leyft spennufall'], ['efni', M(p.mat).short + ', tvíleiðari', 'ρ úr töflu']],
    find: () => [['R', 'leyft viðnám'], ['A', 'þverflatarmál í mm²']],
    fq: { right: 'A = \\f{ρ·l·2}{R}', wrong: ['A = \\f{ρ·l}{R}', 'A = \\f{R·l·2}{ρ}', 'A = \\f{R}{ρ·l·2}'], why: 'Úr R = ρ·l·2/A: skiptu á R og A. R fæst fyrst úr R = ΔU/I.' },
    rearr: () => 'Tvær umritanir: (1) R = ΔU/I. (2) R = ρ·l·2/A → A = ρ·l·2/R.',
    hints: (p) => [p.pmax != null ? 'Breyttu prósentunni í volt fyrst.' : 'Leyft spennufall og straumur gefa leyft viðnám (Ohmslögmál).', 'R = ΔU/I — ekki námunda R mikið!', 'A = ρ·l·2/R. Veldu svo næstu staðalstærð fyrir ofan.'],
    sanity: (p, v) => 'Næsta staðalstærð: ' + (RF.nextStdArea(v.A) ? g(RF.nextStdArea(v.A)) + ' mm²' : '–') + '. Minni kapall myndi gefa meira spennufall en leyft er.',
  });

  /* ---------------- S6 – Spennufall á langri leiðslu ---------------- */
  T.push({
    id: 'S6', ch: 4, fam: 'U', cards: [8, 10], title: 'Spennufall á langri leiðslu', short: 'Löng leiðsla',
    source: '3.4.1 – dæmi 6', skills: ['ΔU = I·ρ·l·2/A', 'U₂ = U₁ − ΔU'],
    original: { text: 'Hvað verður spennufallið yfir 100 m langan tvíleiðara úr eir sem er 1 mm² að þverflatarmáli þegar um hann fer 8 A straumur? Miðaðu við 20 °C hita á leiðaranum.', p: { mat: 'kopar', l: 100, A: 1, I: 8 }, teacher: 'ΔU = 28,48 V' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', l: 50, A: 1, I: 5 } },
      { level: 'lett', p: { mat: 'kopar', l: 100, A: 2.5, I: 10 } },
      { level: 'midl', p: { mat: 'kopar', l: 100, A: 1.5, I: 8, U: 230 }, note: 'Ljósalampar – glæra 3.4, dæmi 2' },
      { level: 'midl', p: { mat: 'al', l: 200, A: 10, I: 20 } },
      { level: 'erf', p: { mat: 'kopar', lkm: 0.25, A: 6, I: 18, U: 230 } },
      { level: 'erf', p: { mat: 'kopar', l: 120, d: 1.6, I: 9, U: 230 } },
    ],
    gen(r, lv) {
      const p = lv === 'lett' ? { mat: 'kopar', l: r.pick([50, 60, 80, 100]), A: r.pick([1, 1.5, 2.5]) } : genWire(r, lv);
      if (lv !== 'lett' && p.l != null && p.l < 60) p.l += 60;
      p.I = currentFor(r, Am(p));
      if (lv !== 'lett') p.U = r.pick([220, 230]);
      return p;
    },
    valid: (p, v) => v.dU > 0.5 && v.dU < 60 && (p.U == null || v.U2 > p.U * 0.8),
    text: (p) => 'Hvað verður spennufallið yfir ' + lTxt(p) + ' langan tvíleiðara úr ' + dat(p.mat) + ' sem er ' + (p.d != null ? g(p.d) + ' mm í þvermál' : g(p.A) + ' mm² að þverflatarmáli') + ' þegar um hann fer ' + g(p.I) + ' A straumur?' + (p.U != null ? ' Spenna spennugjafans er ' + g(p.U) + ' V. Hver verður spennan á álaginu?' : ''),
    table: (p) => [rhoLine(p.mat)],
    parts: (p) => [
      { k: 'R', label: 'Viðnám leiðslunnar R_l', unit: 'Ω' },
      { k: 'dU', label: 'Spennufall ΔU', unit: 'V', from: (q, s) => q.I * s.R },
      ...(p.U != null ? [{ k: 'U2', label: 'Spenna á álagi U₂', unit: 'V', from: (q, s) => q.U - s.dU }] : []),
    ],
    solve(p, o = {}) {
      const w = wireR(p, o), st = [];
      wireSteps(p, st, w, o);
      const dU = p.I * w.R;
      st.push({ h: 'Spennufallið', m: ['ΔU = I·R_l = ' + g(p.I) + '·' + f(w.R) + ' = ' + f(dU) + ' V'], ans: true, n: 'Í einu skrefi: ΔU = I·\\f{ρ·l·2}{A}' });
      const v = { R: w.R, dU };
      if (p.U != null) {
        v.U2 = o.f === 'add' ? p.U + dU : p.U - dU;
        st.push({ h: 'Spennan á álaginu', m: ['U_2 = U_1 − ΔU = ' + g(p.U) + ' − ' + f(dU) + ' = ' + f(v.U2) + ' V'], ans: true });
      }
      return { v, steps: st };
    },
    mistakes: (p) => [...twoMist(p), { o: { f: 'add' }, msg: 'Álagið fær MINNI spennu en gjafinn gefur: U₂ = U₁ − ΔU.', parts: ['U2'] }],
    given: (p) => [...wireGiven(p), ['I', g(p.I) + ' A', 'straumur'], ...(p.U != null ? [['U₁', g(p.U) + ' V', 'spenna gjafans']] : [])],
    find: (p) => [['ΔU', 'spennufall'], ...(p.U != null ? [['U₂', 'spenna á álagi']] : [])],
    fq: { right: 'ΔU = I·\\f{ρ·l·2}{A}', wrong: ['ΔU = I·\\f{ρ·l}{A}', 'ΔU = \\f{ρ·l·2}{I·A}', 'ΔU = I·\\f{A}{ρ·l·2}'], why: 'ΔU = I·R_l og R_l = ρ·l·2/A (tvíleiðari).' },
    rearr: () => 'Engin umritun. Reiknaðu R_l (×2) og margfaldaðu með I.',
    hints: () => ['Leiðslan er löng – hún hefur töluvert viðnám.', 'R_l = ρ·l·2/A (tvíleiðari).', 'ΔU = I·R_l.'],
    sanity: (p, v) => 'ΔU = ' + f(v.dU) + ' V. ' + (v.dU / 230 > 0.05 ? 'Það er meira en 5 % af 230 V – í raun þyrfti sverari kapal.' : 'Það er innan við 5 % af 230 V.'),
  });

  /* ---------------- S7 – Spenna spennugjafa ---------------- */
  T.push({
    id: 'S7', ch: 4, fam: 'U', cards: [7, 8, 10], title: 'Spenna spennugjafans (með tengimynd)', short: 'Spenna gjafans',
    source: '3.4.1 – dæmi 7', skills: ['Tengimynd', 'R_l = ρ·l·2/A', 'ΔU = I·R_l', 'U₁ = U₂ + ΔU'], diagram: true,
    original: { text: 'Fjarlægð á milli spennugjafa og álags er 75 m. Álagið tekur 9,5 A og spennan yfir það er 214 V. a) Gerðu tengimynd og merktu inn gefnar stærðir. b) Leiðarinn er úr eir og þverflatarmál hans er 1,5 mm². Hvert er viðnám leiðarans? c) Hve mikið spennufall verður í leiðaranum? d) Hver er spenna spennugjafans?', p: { mat: 'kopar', l: 75, A: 1.5, I: 9.5, U2: 214 }, teacher: 'R_l = 1,78 Ω · ΔU = 16,91 V · U₁ = 230,91 V' },
    presets: [
      { level: 'lett', p: { mat: 'kopar', l: 50, A: 1.5, I: 10, U2: 220 } },
      { level: 'lett', p: { mat: 'kopar', l: 25, A: 2.5, I: 16, U2: 225 } },
      { level: 'midl', p: { mat: 'kopar', l: 100, A: 1.5, I: 8, U2: 211 } },
      { level: 'midl', p: { mat: 'al', l: 60, A: 6, I: 20, U2: 220 } },
      { level: 'erf', p: { mat: 'kopar', l: 80, A: 2.5, I: 16, U2: 215, pct: true } },
      { level: 'erf', p: { mat: 'kopar', lkm: 0.12, A: 4, I: 20, U2: 218, pct: true } },
    ],
    gen(r, lv) {
      const p = genWire(r, lv);
      p.I = currentFor(r, Am(p));
      p.U2 = r.step(205, 226, 1);
      if (lv === 'erf') p.pct = true;
      return p;
    },
    valid: (p, v) => v.dU > 0.5 && v.dU < 40,
    text(p) {
      return 'Fjarlægð á milli spennugjafa og álags er ' + lTxt(p) + '. Álagið tekur ' + g(p.I) + ' A og spennan yfir það er ' + g(p.U2) + ' V. a) Gerðu tengimynd og merktu inn gefnar stærðir. b) Leiðarinn (tvíleiðari) er úr ' + dat(p.mat) + ' og ' + (p.d != null ? 'hvor leiðari er ' + g(p.d) + ' mm í þvermál' : 'þverflatarmál hans er ' + g(p.A) + ' mm²') + '. Hvert er viðnám leiðarans? c) Hve mikið spennufall verður í leiðaranum? d) Hver er spenna spennugjafans?' + (p.pct ? ' e) Hve mörg % af spennu gjafans er spennufallið?' : '');
    },
    table: (p) => [rhoLine(p.mat)],
    parts: (p) => [
      { k: 'len', label: 'a) Hve langa leið fer straumurinn í leiðurunum?', kind: 'choice', options: [{ v: 'l', label: g(Lm(p)) + ' m' }, { v: '2l', label: g(Lm(p) * 2) + ' m' }, { v: 'half', label: g(Lm(p) / 2) + ' m' }] },
      { k: 'R', label: 'b) Viðnám leiðarans R_l', unit: 'Ω' },
      { k: 'dU', label: 'c) Spennufall ΔU', unit: 'V', from: (q, s) => q.I * s.R },
      { k: 'U1', label: 'd) Spenna spennugjafans U₁', unit: 'V', from: (q, s) => q.U2 + s.dU },
      ...(p.pct ? [{ k: 'pct', label: 'e) Spennufall í %', unit: '%', from: (q, s) => (s.dU / s.U1) * 100 }] : []),
    ],
    solve(p, o = {}) {
      const w = wireR(p, o), st = [];
      st.push({ h: 'a) Tengimynd', m: [], n: 'Spennugjafi U₁ vinstra megin, álag U₂ = ' + g(p.U2) + ' V hægra megin, tveir leiðarar á milli, hvor ' + lTxt(p) + '. Straumurinn ' + g(p.I) + ' A fer fram eftir öðrum og til baka eftir hinum → leiðin er ' + g(Lm(p) * 2) + ' m.', diagram: true });
      wireSteps(p, st, w, o);
      const dU = p.I * w.R;
      const U1 = o.f === 'sub' ? p.U2 - dU : p.U2 + dU;
      st.push({ h: 'c) Spennufallið', m: ['ΔU = I·R_l = ' + g(p.I) + '·' + f(w.R) + ' = ' + f(dU) + ' V'], ans: true });
      st.push({ h: 'd) Spenna spennugjafans', m: ['U_1 = U_2 + ΔU = ' + g(p.U2) + ' + ' + f(dU) + ' = ' + f(U1) + ' V'], ans: true, n: 'Gjafinn þarf að gefa spennuna á álaginu AUK þess sem tapast í leiðslunni.' });
      const v = { len: ['2l'], R: w.R, dU, U1 };
      if (p.pct) { v.pct = (dU / U1) * 100; st.push({ h: 'e) Spennufall í %', m: ['% = \\f{ΔU}{U_1}·100 = \\f{' + f(dU) + '}{' + f(U1) + '}·100 = ' + f(v.pct) + ' %'], ans: true }); }
      return { v, steps: st };
    },
    mistakes: (p) => [...twoMist(p), { o: { f: 'sub' }, msg: 'Þú dróst spennufallið frá. Spennugjafinn er „ofar“ en álagið: U₁ = U₂ + ΔU.', parts: ['U1'] }],
    given: (p) => [['l', lTxt(p), 'fjarlægð'], ['I', g(p.I) + ' A', 'straumur'], ['U₂', g(p.U2) + ' V', 'spenna á álagi'], p.d != null ? ['d', g(p.d) + ' mm', 'þvermál'] : ['A', g(p.A) + ' mm²', 'þverflatarmál'], ['efni', M(p.mat).short, 'ρ úr töflu']],
    find: (p) => [['R_l', 'viðnám leiðslu'], ['ΔU', 'spennufall'], ['U₁', 'spenna gjafans'], ...(p.pct ? [['%', 'spennufall í %']] : [])],
    fq: { right: 'U_1 = U_2 + ΔU', wrong: ['U_1 = U_2 − ΔU', 'U_1 = ΔU − U_2', 'U_1 = U_2·ΔU'], why: 'Gjafinn gefur U₁. Hluti hennar tapast í leiðslunni (ΔU) og álagið fær afganginn U₂. Því er U₁ = U₂ + ΔU.' },
    rearr: () => 'U₂ = U₁ − ΔU umritast í U₁ = U₂ + ΔU.',
    hints: (p) => ['Teiknaðu: gjafi – tveir leiðarar – álag. Hve löng er straumleiðin?', 'R_l = ρ·l·2/A og ΔU = I·R_l.', 'Gjafinn þarf meiri spennu en álagið fær: U₁ = U₂ + ΔU.'],
    sanity: (p, v) => 'U₁ (' + f(v.U1) + ' V) á að vera aðeins hærri en U₂ (' + g(p.U2) + ' V). Mismunurinn er spennufallið.',
  });

  /* ================================================================== */
  T.forEach((t, i) => { t.order = i; });
  RF.problemTypes = T;
  RF.ptype = (id) => T.find((t) => t.id === id);

  /* Býr til dæmi: { tid, key, level, p, text, orig, note }
     src: 'orig' | 'p0'..'pN' (forstillt) | { seed, level } (slembið) */
  RF.makeProblem = function (tid, src) {
    const t = RF.ptype(tid);
    if (src === 'orig' || src === undefined) return { tid, key: tid + ':orig', level: 'midl', p: t.original.p, text: t.original.text, orig: true, teacher: t.original.teacher };
    if (typeof src === 'string' && src[0] === 'p') {
      const i = +src.slice(1), pr = t.presets[i];
      return { tid, key: tid + ':' + src, level: pr.level, p: pr.p, text: pr.text || t.text(pr.p), note: pr.note };
    }
    const seed = src.seed >>> 0, level = src.level || 'midl';
    const r = RF.util.rng(seed);
    for (let i = 0; i < 80; i++) {
      const p = t.gen(r, level);
      const v = t.solve(p).v;
      if (t.valid(p, v) && Object.values(v).every((x) => Array.isArray(x) || isFinite(x))) return { tid, key: tid + ':s' + seed + ':' + level, level, p, text: t.text(p), gen: true, seed };
    }
    return RF.makeProblem(tid, 'orig');
  };
  /* Endurgerir dæmi út frá lykli (fyrir vistun og „æfa það sem ég gerði rangt“) */
  RF.problemFromKey = function (key) {
    const [tid, a, lv] = key.split(':');
    if (!RF.ptype(tid)) return null;
    if (a === 'orig') return RF.makeProblem(tid, 'orig');
    if (a[0] === 'p') return RF.makeProblem(tid, a);
    if (a[0] === 's') return RF.makeProblem(tid, { seed: +a.slice(1), level: lv });
    return null;
  };
  RF.variantList = function (tid) {
    const t = RF.ptype(tid);
    return [{ src: 'orig', level: 'midl', label: 'Upprunalegt dæmi kennarans', orig: true }, ...t.presets.map((pr, i) => ({ src: 'p' + i, level: pr.level, label: 'Afbrigði ' + (i + 1), note: pr.note }))];
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

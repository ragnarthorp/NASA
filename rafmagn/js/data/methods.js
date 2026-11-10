/* Aðferðaspjöld: „Ég á að finna …“. Sömu númer og litir eru notuð á vefnum, í dæmabankanum og í PDF-glósunum.
   Þetta eru gögn – hægt að breyta texta án þess að snerta forritið. */
(function (G) {
  const RF = (G.RF = G.RF || {});

  RF.families = {
    R: { name: 'Viðnám og efni', color: '#1d5fa8', soft: '#e3eefb' },
    T: { name: 'Hitastig', color: '#b4530a', soft: '#fdeedd' },
    U: { name: 'Spennufall', color: '#0b7a70', soft: '#dcf3f0' },
  };

  RF.methods = [
    {
      id: 1, fam: 'R', find: 'Viðnám leiðara', sym: 'R', unit: 'Ω',
      formula: 'R = \\f{ρ·l}{A}',
      alt: [],
      needs: 'ρ (efni, úr töflu) · l í m · A í mm²',
      steps: ['Finndu ρ efnisins í töflu', 'Ef þvermál er gefið: reiknaðu A fyrst (spjald 3)', 'Settu inn og deildu'],
      example: 'Kopar, 100 m, 2,5 mm²: R = \\f{0,0178·100}{2,5} = 0,712 Ω',
      mistakes: ['Þvermál d er ekki þverflatarmál A', 'Lengd í metrum (km × 1000)'],
      types: ['V1'],
    },
    {
      id: 2, fam: 'R', find: 'Lengd leiðara', sym: 'l', unit: 'm',
      formula: 'l = \\f{R·A}{ρ}',
      alt: ['Tvíleiðari (fjarlægð): l = \\f{R·A}{2·ρ}'],
      needs: 'R í Ω · A í mm² · ρ (efni)',
      steps: ['Margfaldaðu R og A', 'Deildu með ρ', 'Tvíleiðari? Deildu líka með 2'],
      example: '43 Ω manganín, 1,5 mm²: l = \\f{43·1,5}{0,43} = 150 m',
      mistakes: ['Snúa brotinu við (ρ í teljara)', 'Gleyma ÷2 þegar spurt er um fjarlægð með tvíleiðara'],
      types: ['V2'],
    },
    {
      id: 3, fam: 'R', find: 'Þverflatarmál', sym: 'A', unit: 'mm²',
      formula: 'A = \\f{ρ·l}{R}',
      alt: ['Út frá þvermáli: A = \\f{π·d^2}{4} = π·r^2', 'Skipt um efni, sama R: A_2 = A_1·\\f{ρ_2}{ρ_1}'],
      needs: 'ρ · l í m · R í Ω — eða þvermál d í mm',
      steps: ['Gefið þvermál? Notaðu A = π·d²/4', 'Annars: A = ρ·l/R', 'Nýtt efni með sama viðnám: reiknaðu R fyrst'],
      example: 'd = 2 mm: A = \\f{π·2^2}{4} = 3,14 mm²',
      mistakes: ['Nota π·d² án ÷4 (eða d í stað r í π·r²)', 'Rugla saman þvermáli og radíus'],
      types: ['V4'],
    },
    {
      id: 4, fam: 'R', find: 'Eðlisviðnám / hvaða efni', sym: 'ρ', unit: 'Ω·mm²/m',
      formula: 'ρ = \\f{R·A}{l}',
      alt: ['Eðlisleiðni: γ = \\f{1}{ρ} (á glærum: G)'],
      needs: 'R í Ω · A í mm² · l í m',
      steps: ['Reiknaðu ρ', 'Berðu saman við töflu', 'Næsta gildi = líklegasta efnið'],
      example: '120 m, 5 Ω, 2,4 mm²: ρ = \\f{5·2,4}{120} = 0,1 → járn',
      mistakes: ['Snúa brotinu við', 'Gleyma að bera saman við töfluna'],
      types: ['V3'],
    },
    {
      id: 5, fam: 'T', find: 'Viðnám við nýtt hitastig', sym: 'R_{t2}', unit: 'Ω',
      formula: 'R_{t2} = R_{t1} + R_{t1}·α·Δt',
      alt: ['Kólnun: R_{t2} = R_{t1} − R_{t1}·α·Δt', 'Sama í einni línu: R_{t2} = R_{t1}·(1 + α·(t_2 − t_1))'],
      needs: 'R_{t1} · α (efni) · Δt = |t_2 − t_1|',
      steps: ['Δt = mismunur hitastiga', 'Hitun: leggja við · Kólnun: draga frá', 'R_{t1} er viðnámið við upphafshitastigið'],
      example: 'Nikkel 7 Ω, 10 °C → 50 °C: 7 + 7·0,0055·40 = 8,54 Ω',
      mistakes: ['Nota t₂ í stað Δt', 'Δt frá 10 °C til −15 °C er 25 °C (ekki 5)', 'Leggja við þegar kólnar'],
      types: ['V6'],
    },
    {
      id: 6, fam: 'T', find: 'Hitastig (út frá viðnámi)', sym: 't_2', unit: '°C',
      formula: 'Δt = \\f{R_{t2} − R_{t1}}{R_{t1}·α}',
      alt: ['Lokahitastig: t_2 = t_1 + Δt'],
      needs: 'R_{t1} (upphaf) · R_{t2} (lok) · α · t_1',
      steps: ['Reiknaðu viðnámsbreytinguna', 'Deildu með R_{t1}·α (upphafsviðnámið!)', 'Leggðu t₁ við Δt'],
      example: 'Kopar 8,5 Ω við 20 °C → 10 Ω: Δt = \\f{1,5}{8,5·0,0039} = 45,25 → t₂ = 65,25 °C',
      mistakes: ['R_{t2} í nefnara (villa á einni svarglæru)', 'Gleyma að leggja t₁ við'],
      types: ['V5'],
    },
    {
      id: 7, fam: 'U', find: 'Viðnám tvíleiðara', sym: 'R_l', unit: 'Ω',
      formula: 'R_l = \\f{2·ρ·l}{A}',
      alt: ['l = fjarlægð frá gjafa að álagi (aðra leiðina)'],
      needs: 'ρ · l (fjarlægð) í m · A í mm²',
      steps: ['Straumurinn fer FRAM og TIL BAKA', 'Heildarlengd vírs = 2·l', 'R_l = 2·ρ·l/A'],
      example: 'Kopar, 50 m, 0,75 mm²: R_l = \\f{2·0,0178·50}{0,75} = 2,373 Ω',
      mistakes: ['Gleyma × 2 (algengasta villan!)', 'Margfalda með 2 tvisvar'],
      types: ['S1'],
    },
    {
      id: 8, fam: 'U', find: 'Spennufall', sym: 'ΔU', unit: 'V',
      formula: 'ΔU = I·R_l',
      alt: ['Í einu skrefi: ΔU = I·\\f{2·ρ·l}{A}'],
      needs: 'I í A · R_l (spjald 7)',
      steps: ['Reiknaðu R_l leiðslunnar (×2 fyrir tvíleiðara)', 'Margfaldaðu með straumnum'],
      example: 'Kopar 100 m, 1 mm², 8 A: ΔU = 8·\\f{2·0,0178·100}{1} = 28,48 V',
      mistakes: ['Nota viðnám álagsins í stað leiðslunnar', 'Gleyma × 2'],
      types: ['S2', 'S6'],
    },
    {
      id: 9, fam: 'U', find: 'Spennufall í %', sym: '%', unit: '%',
      formula: 'ΔU% = \\f{ΔU}{U_1}·100',
      alt: ['Leyft spennufall út frá %: ΔU = \\f{%·U_1}{100}'],
      needs: 'ΔU · U₁ (spenna spennugjafans)',
      steps: ['Deildu ΔU með U₁', 'Margfaldaðu með 100'],
      example: '\\f{18,99}{220}·100 = 8,63 %',
      mistakes: ['Gleyma × 100 (svar 0,086 í stað 8,6 %)', 'Deila með U₂ í stað U₁'],
      types: ['S3'],
    },
    {
      id: 10, fam: 'U', find: 'Spenna á álagi / spennugjafa', sym: 'U', unit: 'V',
      formula: 'U_2 = U_1 − ΔU',
      alt: ['Spenna spennugjafans: U_1 = U_2 + ΔU'],
      needs: 'U₁ eða U₂ · ΔU',
      steps: ['U₁ = við gjafann (töfluna), U₂ = við álagið', 'Álagið fær MINNA en gjafinn gefur'],
      example: '214 V á álagi, ΔU = 16,91 V: U_1 = 214 + 16,91 = 230,91 V',
      mistakes: ['Draga frá þegar á að leggja við', 'Ruglast á U₁ og U₂'],
      types: ['S7'],
    },
    {
      id: 11, fam: 'U', find: 'Hámarkslengd kapals', sym: 'l', unit: 'm',
      formula: 'R = \\f{ΔU}{I}',
      alt: ['Síðan: l = \\f{R·A}{2·ρ}'],
      needs: 'Leyft ΔU · I · A · ρ',
      steps: ['Leyft viðnám R = ΔU/I', 'l = R·A/ρ', 'Deildu með 2 (tvíleiðari) → fjarlægð'],
      example: '1,5 mm², 10 A, 5 V: R = 0,5 Ω → l = \\f{0,5·1,5}{2·0,0178} = 21,07 m',
      mistakes: ['Gleyma ÷2 (fæst tvöföld lengd)', 'Nota spennu kerfisins í stað leyfilegs spennufalls'],
      types: ['S4'],
    },
    {
      id: 12, fam: 'U', find: 'Nauðsynlegt þverflatarmál', sym: 'A', unit: 'mm²',
      formula: 'R = \\f{ΔU}{I}',
      alt: ['Síðan: A = \\f{2·ρ·l}{R}', 'Veldu næstu staðalstærð fyrir ofan'],
      needs: 'Leyft ΔU · I · l (fjarlægð) · ρ',
      steps: ['Leyft viðnám R = ΔU/I', 'A = 2·ρ·l/R', 'Ekki námunda R of snemma!'],
      example: '90 m, 60 A, 8 V: R = 0,1333 Ω → A = \\f{2·0,0178·90}{0,1333} = 24,03 mm² → 25 mm²',
      mistakes: ['Gleyma × 2', 'Námunda R í 0,13 → 24,6 mm² (of snemma)'],
      types: ['S5'],
    },
  ];
  RF.method = (id) => RF.methods.find((m) => m.id === id);

  /* ---------- „Hvaða dæmi er þetta?“ ---------- */
  RF.givenChips = [
    { k: 'l', label: 'Lengd / fjarlægð' },
    { k: 'A', label: 'Þverflatarmál (mm²)' },
    { k: 'd', label: 'Þvermál (mm)' },
    { k: 'mat', label: 'Efni (kopar, ál …)' },
    { k: 'R', label: 'Viðnám' },
    { k: 'R2', label: 'Viðnám við tvö hitastig' },
    { k: 't', label: 'Hitastig' },
    { k: 'I', label: 'Straumur' },
    { k: 'U', label: 'Spenna (gjafa eða álags)' },
    { k: 'dU', label: 'Spennufall (leyft eða mælt)' },
    { k: 'pct', label: 'Spennufall í %' },
    { k: 'two', label: 'Tvíleiðari / kapall' },
  ];
  RF.findOptions = [
    { k: 'R', label: 'Viðnám' },
    { k: 'l', label: 'Lengd' },
    { k: 'A', label: 'Þverflatarmál' },
    { k: 'rho', label: 'Eðlisviðnám / efni' },
    { k: 'Rt', label: 'Viðnám við annað hitastig' },
    { k: 't', label: 'Hitastig' },
    { k: 'dU', label: 'Spennufall' },
    { k: 'pct', label: 'Spennufall í %' },
    { k: 'U', label: 'Spennu á álagi eða gjafa' },
  ];

  /* Skilar { cards:[id], title, text, warn[] } */
  RF.identify = function (g, find) {
    const has = (k) => !!g[k];
    const warn = [];
    let cards = [], title = '', text = '';
    const needRho = () => { if (has('mat')) warn.push('Flettu upp ρ efnisins í töflunni.'); };
    if (has('d')) warn.push('Þvermál gefið → reiknaðu fyrst A = π·d²/4 (spjald 3).');
    switch (find) {
      case 'R':
        if (has('dU') && has('I')) { cards = [11]; title = 'Leyft viðnám út frá spennufalli'; text = 'Þú ert með spennufall og straum: R = ΔU / I.'; }
        else if (has('two')) { cards = [7]; title = 'Viðnám tvíleiðara'; text = 'Kapall/tvíleiðari: straumurinn fer fram og til baka, svo R = 2·ρ·l/A.'; needRho(); }
        else { cards = [1]; title = 'Viðnámsdæmi'; text = 'Þetta er líklega viðnámsdæmi. Þú þarft eðlisviðnám efnisins og formúluna R = ρ·l/A.'; needRho(); }
        break;
      case 'l':
        if (has('dU') || has('pct')) { cards = [11]; title = 'Hámarkslengd kapals'; text = 'Leyft spennufall gefið: finndu fyrst R = ΔU/I, síðan l = R·A/(2·ρ).'; if (has('pct')) warn.push('% gefið → ΔU = %·U₁/100 fyrst.'); }
        else { cards = [2]; title = 'Lengdardæmi'; text = 'Viðnám gefið og finna á lengd: l = R·A/ρ.' + (has('two') ? ' Tvíleiðari → deildu líka með 2 til að fá fjarlægðina.' : ''); }
        needRho();
        break;
      case 'A':
        if (has('dU') || has('pct')) { cards = [12]; title = 'Nauðsynlegt þverflatarmál'; text = 'Leyft spennufall gefið: R = ΔU/I og síðan A = 2·ρ·l/R. Veldu næstu staðalstærð fyrir ofan.'; if (has('pct')) warn.push('% gefið → ΔU = %·U₁/100 fyrst.'); }
        else if (has('d')) { cards = [3]; title = 'Þverflatarmál út frá þvermáli'; text = 'A = π·d²/4 (eða π·r² með r = d/2).'; }
        else { cards = [3]; title = 'Þverflatarmálsdæmi'; text = 'A = ρ·l/R. Ef skipt er um efni og viðnámið á að haldast: reiknaðu R fyrst með gamla efninu.'; }
        needRho();
        break;
      case 'rho':
        cards = [4]; title = 'Eðlisviðnám – hvaða efni?'; text = 'ρ = R·A/l og berðu svo saman við töfluna.'; break;
      case 'Rt':
        cards = [5]; title = 'Viðnám við nýtt hitastig'; text = 'Notaðu hitastuðulinn: R_t2 = R_t1 + R_t1·α·Δt (dragðu frá ef kólnar).'; if (has('mat')) warn.push('Flettu upp α efnisins (kopar 0,0039 · nikkel 0,0055).'); break;
      case 't':
        cards = [6]; title = 'Hitastigsdæmi'; text = 'Viðnám við tvö hitastig: Δt = (R_t2 − R_t1)/(R_t1·α) og t₂ = t₁ + Δt.'; break;
      case 'dU':
        cards = has('R') ? [8] : [7, 8]; title = 'Spennufallsdæmi'; text = has('R') ? 'ΔU = I·R.' : 'Fjarlægð og straumur gefin: finndu R leiðslunnar (×2 fyrir tvíleiðara) og síðan ΔU = I·R.'; needRho(); break;
      case 'pct':
        cards = has('dU') ? [9] : [7, 8, 9]; title = 'Spennufall í prósentum'; text = 'ΔU/U₁·100. Ef ΔU vantar: reiknaðu R og ΔU fyrst.'; break;
      case 'U':
        cards = has('dU') ? [10] : [7, 8, 10]; title = 'Spenna á álagi eða spennugjafa'; text = 'Gjafinn þarf að gefa meira en álagið fær: U₁ = U₂ + ΔU og U₂ = U₁ − ΔU.'; break;
      default:
        title = 'Veldu hvað þú átt að finna'; text = '';
    }
    if ((find === 'dU' || find === 'pct' || find === 'U' || find === 'l' || find === 'A') && !has('two') && (has('I') || has('dU')))
      warn.push('Er þetta kapall/tvíleiðari? Þá er lengd straumleiðarinnar 2·l.');
    return { cards, title, text, warn };
  };

  /* Dæmigerðar setningar → niðurstaða (birt sem flýtihnappar og í PDF) */
  RF.quickIds = [
    { say: 'Mér er gefin lengd, þverflatarmál og efni.', g: { l: 1, A: 1, mat: 1 }, find: 'R' },
    { say: 'Mér er gefið viðnám og ég á að finna lengd.', g: { R: 1, A: 1, mat: 1 }, find: 'l' },
    { say: 'Mér er gefin fjarlægð og straumur og ég á að finna spennufall.', g: { l: 1, I: 1, A: 1, mat: 1, two: 1 }, find: 'dU' },
    { say: 'Mér er gefið spennufall og ég á að finna þverflatarmál.', g: { dU: 1, I: 1, l: 1, two: 1 }, find: 'A' },
    { say: 'Mér er gefið viðnám við tvö hitastig.', g: { R2: 1, t: 1, mat: 1 }, find: 't' },
    { say: 'Mér er gefið viðnám og hitastig og spurt um viðnám við annað hitastig.', g: { R: 1, t: 1, mat: 1 }, find: 'Rt' },
    { say: 'Mér er gefið spennufall og ég á að finna spennu spennugjafans.', g: { dU: 1, U: 1 }, find: 'U' },
    { say: 'Mér er gefið leyft spennufall og ég á að finna hve langur kapallinn má vera.', g: { dU: 1, I: 1, A: 1, two: 1 }, find: 'l' },
  ];
})(typeof globalThis !== 'undefined' ? globalThis : window);

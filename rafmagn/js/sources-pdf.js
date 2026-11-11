/* Yfirlit: hvað á að finna í hverri dæmagerð, hvernig spurningin byrjar og hvar skýringar og sýnidæmi eru í námsefninu.
   Glærunúmer = blaðsíðunúmer í PDF-skjölum kennarans (staðfest með því að lesa hverja glæru). */
(function (G) {
  const RF = G.RF;
  const L = () => RF.pdf._lib;

  const SRC = [
    ['3.3', 'Rafleiðarar – viðnám (glærur, 12 bls.)'],
    ['3.3.1', 'Viðnám – 6 æfingadæmi, svör kennara á bls. 2–5'],
    ['3.4', 'Rafleiðarar – spennufall (glærur, 21 bls.)'],
    ['3.4.1', 'Spennufall – 7 æfingadæmi á bls. 2–5, svör í sér skjali (sömu bls.)'],
  ];

  /* [id, heiti, hvað á að finna, upphaf spurningar, skýring, sýnidæmi, æfingadæmi] */
  const ROWS = [
    ['V1', 'Viðnám leiðara', 'Viðnám R (Ω) út frá lengd, þverflatarmáli (eða þvermáli) og efni.', '„Reiknaðu viðnámið í 179,8 m löngum eirvír sem hefur þverflatarmálið …“ / „Hve mikið er viðnámið í eirþræði sem er 628 m langur og 2 mm í þvermál?“', '3.3 gl. 5 (formúlur), gl. 9 (einingar), gl. 10 (samantekt, A = r²·π)', '3.3 gl. 3 (20 m eir, Φ 1,6 mm → 0,178 Ω) · 3.3 gl. 4 (628 m, 2 mm þvermál → 3,56 Ω)', '3.3.1 dæmi 1 · svar bls. 2'],
    ['V2', 'Lengd leiðara', 'Lengd l (m) þegar viðnám, þverflatarmál og efni eru gefin.', '„Það á að vinda 43 Ω mótstöðu úr manganín þræði með þverflatarmálið … Reiknaðu lengd þráðarins.“', '3.3 gl. 5 (l = R·A/ρ), gl. 10', 'Ekkert sýnidæmi á glærum – aðeins formúlan.', '3.3.1 dæmi 2 · svar bls. 2'],
    ['V3', 'Eðlisviðnám – hvaða efni?', 'Eðlisviðnám ρ og hvaða málmur það gæti verið (borið saman við töflu).', '„120 m langur málmþráður hefur viðnámið 5 Ω … Hvert er eðlisviðnám efnisins? Hvaða málmur gæti þetta verið?“', '3.3 gl. 5 (ρ = R·A/l), gl. 10 · tafla yfir eðlisviðnám (fylgdi ekki)', 'Ekkert sýnidæmi á glærum.', '3.3.1 dæmi 3 · svar bls. 2 (járn)'],
    ['V4', 'Skipta um leiðaraefni', 'Nýtt þverflatarmál A þegar skipt er um efni en viðnámið á að haldast.', '„Álvír (leiðari) er 200 m langur … Í staðinn fyrir hann er settur leiðari úr eir/kopar. Hvert verður þverflatarmál nýja leiðarans …“', '3.3 gl. 5 (R = ρ·l/A og A = ρ·l/R)', 'Ekkert sýnidæmi á glærum.', '3.3.1 dæmi 4 a–b · svar bls. 3'],
    ['V5', 'Hitastig út frá viðnámi', 'Hitastigsbreytingu Δt og lokahitastig t₂ út frá viðnámi fyrir og eftir hitun.', '„Spóla er undin úr eir/kopar-vír. Áður en spenna er sett yfir hana er viðnám hennar mælt við 20 °C … Hvað er spólan þá orðin heit?“', '3.3 gl. 8 (Δt = (R_t2 − R_t1)/(R_t1·α)), gl. 10 · 3.4 gl. 20', 'Ekkert sýnidæmi á glærum (gl. 6–7 reikna í hina áttina).', '3.3.1 dæmi 5 · svar bls. 4 (prentvilla í formúlu: R_t2 í nefnara)'],
    ['V6', 'Viðnám við hitabreytingu', 'Viðnám R_t2 við nýtt hitastig, bæði við hitun og kólnun.', '„Leiðari (vír) úr nikkel hefur viðnámið 7 Ω við hitastigið 10 °C. Reiknaðu út viðnám hans við: a) +50 °C b) −15 °C“', '3.3 gl. 8 (hitun/kólnun), gl. 10 · 3.4 gl. 20', '3.3 gl. 6–7 (eirleiðsla 1 Ω við 20 °C → 80 °C = 1,234 Ω)', '3.3.1 dæmi 6 · svar bls. 5'],
    ['L1', 'Leiðni og eðlisleiðni', 'Eðlisleiðni (1/ρ) og leiðni (1/R).', 'Engin spurning í gögnum kennarans – sjá æfingadæmi í leiðarvísi.', '3.3 gl. 9 og 3.4 gl. 18: aðeins í töflu („Eðlisleiðni G, Siemens“). Annað úr Rafbók (fylgdi ekki).', 'Ekkert sýnidæmi.', 'Engin æfing í gögnum.'],
    ['S1', 'Viðnám tvíleiðara', 'Viðnám R_l í kapli með tveimur leiðurum (×2).', '„Reiknaðu viðnámið í 50 m löngum tvíleiðara úr eir (kopar) sem hefur þverflatarmálið 0,75 mm²“', '3.4 gl. 5 (R_l = ρ·l·2/A), gl. 14 („Ath. … verður að margfalda lengd með 2“), gl. 19', '3.4 dæmi 2, gl. 13–15 (100 m, 1,5 mm² → 2,37 Ω)', '3.4.1 dæmi 1 · svar bls. 2'],
    ['S2', 'Spennufall', 'Spennufall ΔU (V) í leiðslu: ΔU = I·R_l.', '„Hve mikið spennufall verður í leiðaranum í dæmi 1, ef 8 A straumur fer um hann?“', '3.4 gl. 4 (hvað er spennufall), gl. 5 (ΔU = I·R_l), gl. 19', '3.4 dæmi 1, gl. 8–10 (ofn 10 A, 0,4 Ω → 4 V) · dæmi 2, gl. 15 c', '3.4.1 dæmi 2 · svar bls. 2'],
    ['S3', 'Spennufall í %', 'Hve stór hluti spennunnar tapast: ΔU/U₁·100.', '„Ef spennan, sem leiðarinn í dæmi 1 er notaður í, er 220 V, hve stór hundraðshluti (%) er þá spennufallið …?“', '3.4 gl. 12 (% = ΔU/U₁·100, 6 % regla í skipum), gl. 19', '3.4 dæmi 1, gl. 12 (4/220·100 = 1,82 %) · dæmi 3, gl. 16–17 (án lausnar)', '3.4.1 dæmi 3 · svar bls. 2 (vantar ·100 í formúlu)'],
    ['S4', 'Hámarkslengd kapals', 'Hve langur kapallinn má vera: R = ΔU/I, síðan l = R·A/(ρ·2).', '„Hve langt er hægt að leggja kapal sem er 1,5 mm² tvíleiðari úr eir (kopar), ef spennufallið yfir hann má vera 5 V við 10 A straum?“', '3.4 gl. 5 og 19 (formúlur), gl. 7 (Ohmslögmál). Umritunin er ekki sýnd á glærum.', 'Ekkert sýnidæmi á glærum – aðeins í svörum.', '3.4.1 dæmi 4 · svar bls. 3 (21 m)'],
    ['S5', 'Nauðsynlegt þverflatarmál', 'Hve sver kapallinn þarf að vera: R = ΔU/I, síðan A = ρ·l·2/R.', '„Reiknaðu þverflatarmál eirleiðara í tvíleiðara kapli, sem tengir álag sem er í 90 m fjarlægð frá spennugjafa …“', '3.4 gl. 5 og 19, gl. 7 (Ohmslögmál). Umritunin er ekki sýnd á glærum.', 'Ekkert sýnidæmi á glærum – aðeins í svörum.', '3.4.1 dæmi 5 · svar bls. 3 (R námundað of snemma)'],
    ['S6', 'Spennufall á langri leiðslu', 'Spennufall ΔU = I·ρ·l·2/A í einu skrefi.', '„Hvað verður spennufallið yfir 100 m langan tvíleiðara úr eir sem er 1 mm² að þverflatarmáli þegar um hann fer 8 A straumur?“', '3.4 gl. 5 (ΔU = I·ρ·l·2/A), gl. 19', '3.4 dæmi 2, gl. 13–15 (18,98 V)', '3.4.1 dæmi 6 · svar bls. 4'],
    ['S7', 'Spenna spennugjafans', 'Tengimynd, R_l, ΔU og spenna gjafans U₁ = U₂ + ΔU.', '„Fjarlægð á milli spennugjafa og álags er 75 m. Álagið tekur 9,5 A og spennan yfir það er 214 V. a) Gerðu tengimynd …“', '3.4 gl. 11 (U₂ = U₁ − ΔU), gl. 14 (tengimynd og ×2)', '3.4 dæmi 1, gl. 11 (220 − 4 = 216 V) · dæmi 2, gl. 14 (tengimynd) og 15 d (211,02 V)', '3.4.1 dæmi 7 a–d · svar bls. 5'],
    ['H1', 'Heildarviðnám og straumur', 'Heildarviðnám R_H = R_l + R_álag og straumur I = U/R_H.', '„Rafmagnsofn sem dregur 10 A er tengdur við 220 V töflu …“ (sýnidæmi á glæru)', '3.4 gl. 6 (R_H = R_l + R_álag), gl. 7 (I = U/R_H)', '3.4 dæmi 1, gl. 8–9 (ofn, hvor vír 0,2 Ω)', 'Engin æfing í 3.4.1.'],
  ];
  const CONCEPTS = [
    ['Flokkar rafleiðara, málmar, vökvar, gös, hálfleiðarar, einangrarar, galvanhúðun', 'Glærur 3.1 / 3.1.1 / 3.2 / 3.2.1 og Rafbók kafli 3 – fylgdu ekki með. Efnisyfirlit á 3.3 gl. 2 og 3.4 gl. 2 sýnir að kaflarnir eru til.'],
    ['Tákn, einingar, gríska stafrófið', '3.3 gl. 9 og 11 · 3.4 gl. 18'],
    ['Allar formúlur á einum stað', '3.3 gl. 10 · 3.4 gl. 19–20'],
    ['Heimildir kennarans', '3.3 gl. 12 (Rafbók kafli 4) · 3.4 gl. 21 (Rafbók kafli 6) – fylgdu ekki.'],
  ];

  RF.pdf.sourceMap = async function () {
    await RF.pdf.ensure();
    const { Para, Box, Table, Head, render, out, famColor } = L();
    await RF.pdf.studyGuide();
    const PG = RF.pdf._guidePG || {};
    const famOf = (id) => (id === 'V5' || id === 'V6' ? 'T' : id[0] === 'S' || id === 'H1' ? 'U' : 'R');
    const webOf = (id) => (id === 'L1' ? 'Kafli 2' : id[0] === 'V' ? 'Kafli 3 · Æfa ' + id : id === 'H1' ? 'Kafli 4' : 'Kafli 4 · Æfa ' + id);
    const cfg = { margin: 12, cols: 1, gap: 0, headH: 8, title: 'Hvar er hvað? – Rafmagnsfræði 1', subtitle: 'Dæmagerðir, orðalag og hvar skýringar og sýnidæmi eru' };
    const row = (label, txt, o = {}) => Para({ src: '**' + label + '**  ' + txt, size: o.size || 10.3, color: o.color || '#14202b', italic: o.italic, gapAfter: 0.7 });
    const blocks = () => [
      Box([
        Para({ src: '**gl. 5** = glæra (blaðsíða) 5 í PDF-skjali kennarans.  **Skýring** = þar sem formúla eða hugtak er útskýrt.  **Sýnidæmi** = reiknað dæmi á glæru.  **Æfing** = æfingadæmi með svari kennara.', size: 10.5, gapAfter: 1 }),
        Table([['Skjal', 'Innihald'], ...SRC.map(([a, b]) => ['**' + a + '**', b])], [0.6, 4], { size: 10, zebra: true, gapAfter: 0 }),
      ], { title: 'Svona lestu listann', color: '#123047', gapAfter: 3 }),
      ...ROWS.map(([id, title, find, q, expl, ex, prac]) => Box([
        row('Á að finna:', find),
        row('Spurningin byrjar svona:', q, { color: '#33414d', italic: true }),
        row('Skýring:', expl),
        row('Sýnidæmi:', ex),
        row('Æfing:', prac),
        row('Hjá okkur:', 'Leiðarvísir bls. ' + (PG[id] || '–') + '–' + (PG[id] ? PG[id] + 1 : '') + ' · Vefur: ' + webOf(id), { color: '#55636f', size: 9.6 }),
      ], { title: id + ' · ' + title, color: famColor(famOf(id)), gapAfter: 2.4 })),
      Head('Hugtök og annað efni', null, { size: 11.5 }),
      Table([['Efni', 'Hvar í námsefninu'], ...CONCEPTS], [2, 3.2], { size: 10, zebra: true, gapAfter: 0 }),
    ];
    return out(render('Hvar er hvað – Rafmagnsfræði 1', blocks, cfg, 99, 1));
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);

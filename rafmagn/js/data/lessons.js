/* Kennsluefni í fjórum köflum. <f>…</f> = formúla í línu, <fb>…</fb> = formúla í sér línu,
   <div data-widget="…"></div> = gagnvirk skýringarmynd. quiz = hugtakaspurningar í lok hluta. */
(function (G) {
  const RF = (G.RF = G.RF || {});
  RF.lessons = [
    {
      id: 'k1', n: 1, title: 'Rafleiðarar og flokkun', fam: 'R',
      intro: 'Hvaða efni leiða rafmagn, hvernig og til hvers þau eru notuð.',
      unverified: 'Glærur 3.1 og 3.2 (flokkar og yfirlit) og kaflar 3–4 í Rafbók fylgdu ekki með gögnunum. Þessi kafli byggir á almennri þekkingu á efninu og hefur ekki verið borinn saman við glærur kennarans. Berðu hann saman við þínar glósur.',
      sections: [
        {
          id: 'k1-flokkar', title: 'Flokkar rafleiðara',
          html: `<p>Rafstraumur er hreyfing hlaðinna einda. Efni eru flokkuð eftir því <b>hvaða eindir</b> bera strauminn og <b>hve vel</b> þau leiða:</p>
<div class="grid4">
<div class="tile"><b>1. Málmar</b><span>Frjálsar <b>rafeindir</b> bera strauminn. Efnið breytist ekki. Silfur, kopar, gull, ál, járn.</span></div>
<div class="tile"><b>2. Vökvar (raflausnir)</b><span><b>Jónir</b> bera strauminn. Efnið breytist (rafgreining). Saltvatn, sýrur, rafgeymasýra.</span></div>
<div class="tile"><b>3. Lofttegundir</b><span>Leiða aðeins þegar þær eru <b>jónaðar</b>: neisti, elding, flúrpera, rafsuðubogi.</span></div>
<div class="tile"><b>4. Hálfleiðarar</b><span>Leiða betur eftir því sem þeir hitna. Kísill (Si), german (Ge). Díóður, smárar, NTC.</span></div>
</div>
<p><b>Einangrarar</b> eru andstæðan: nær engar frjálsar hleðslur. Gler, postulín, PVC-plast, gúmmí, glimmer, olía, þurrt loft.</p>`,
          quiz: ['c1-7', 'c1-12'],
        },
        {
          id: 'k1-malmar', title: 'Leiðni málma – silfur, kopar, gull og ál',
          html: `<p>Í málmum eru ytri rafeindir lauslega bundnar og geta færst á milli frumeinda. Þegar spenna er sett á færast þær allar í sömu átt – það er straumurinn.</p>
<div data-widget="materials"></div>
<table class="tbl"><thead><tr><th>Málmur</th><th>ρ (Ω·mm²/m)</th><th>Helsta notkun</th></tr></thead><tbody>
<tr><td>Silfur</td><td>0,0167</td><td>Besti leiðarinn, en dýr: snertur, rofar</td></tr>
<tr><td>Kopar (eir)</td><td>0,0178</td><td>Raflagnir, kaplar, spólur – næstum jafn góður og silfur, miklu ódýrari</td></tr>
<tr><td>Gull</td><td>≈ 0,024</td><td>Húðun á tengjum – tærist ekki</td></tr>
<tr><td>Ál</td><td>0,0278</td><td>Loftlínur og stórir strengir – létt og ódýrt</td></tr>
</tbody></table>
<p class="tip"><b>Mundu röðina:</b> silfur → kopar → gull → ál (frá bestu leiðni).</p>`,
          quiz: ['c1-1', 'c1-2', 'c1-3', 'c1-11'],
        },
        {
          id: 'k1-vokvar', title: 'Vökvar, gös og galvanhúðun',
          html: `<p>Í <b>raflausn</b> eru jónir: <b>jákvæðar</b> (t.d. Cu²⁺, Na⁺) fara að <b>mínusskautinu</b> og <b>neikvæðar</b> að plússkautinu. Efnið sjálft flyst til.</p>
<div data-widget="galvan"></div>
<p><b>Galvanhúðun</b> nýtir þetta: hluturinn sem á að húða er tengdur við <b>mínusskautið</b> og settur í raflausn með jónum húðunarmálmsins. Málmjónirnar setjast á hlutinn sem þunnt lag (sink, króm, nikkel, silfur, gull).</p>
<p><b>Lofttegundir</b> eru venjulega einangrarar. Við háa spennu jónast gasið og leiðir: elding, neisti, flúrpera, neonljós.</p>`,
          quiz: ['c1-6', 'c1-8', 'c1-9', 'c1-10'],
        },
        {
          id: 'k1-half', title: 'Hálfleiðarar og einangrarar',
          html: `<p><b>Hálfleiðarar</b> (kísill, german) leiða illa þegar þeir eru kaldir en betur þegar þeir hitna – öfugt við málma. Leiðni þeirra má stýra með íblöndun. Úr þeim eru gerðar díóður, smárar, ljósdíóður og NTC-hitanemar.</p>
<p><b>Einangrarar</b> hafa mjög mikið eðlisviðnám. Þeir halda straumnum þar sem hann á að vera og verja fólk.</p>
<div class="grid2"><div class="tile"><b>Einangrunarefni (nefndu 5)</b><span>Gler · postulín · PVC-plast · gúmmí · glimmer · olía · pappír · lakk · þurrt loft</span></div>
<div class="tile"><b>Hálfleiðarar</b><span>Kísill (Si) · german (Ge) · notkun: díóður, smárar, NTC</span></div></div>`,
          quiz: ['c1-4', 'c1-5', 'c1-14', 'c1-13'],
        },
      ],
    },
    {
      id: 'k2', n: 2, title: 'Eiginleikar rafleiðara og leiðni', fam: 'R',
      intro: 'Hvað ræður viðnámi leiðara: efni, lengd, sverleiki og hitastig.',
      sections: [
        {
          id: 'k2-fjogur', title: 'Fjórir þættir ráða viðnámi',
          html: `<p>Viðnám leiðara <f>R</f> (í ohmum, Ω) ræðst af fjórum þáttum:</p>
<ol class="big"><li><b>Efninu</b> – eðlisviðnámi <f>ρ</f></li><li><b>Lengdinni</b> <f>l</f> – lengri leiðari = <b>meira</b> viðnám</li><li><b>Þverflatarmálinu</b> <f>A</f> – gildari leiðari = <b>minna</b> viðnám</li><li><b>Hitastiginu</b> – í málmum eykst viðnám þegar þeir hitna</li></ol>
<p>Prófaðu sjálf/ur: breyttu lengd og sverleika og sjáðu viðnámið breytast.</p>
<div data-widget="conductor"></div>
<fb>R = \\f{ρ·l}{A}</fb>`,
          quiz: ['c2-1', 'c2-2'],
        },
        {
          id: 'k2-rho', title: 'Eðlisviðnám og eðlisleiðni',
          html: `<p><b>Eðlisviðnám</b> <f>ρ</f> (gríski stafurinn „hró“) er viðnám leiðara úr efninu sem er <b>1 m langur</b> og <b>1 mm²</b> að þverflatarmáli, við 20 °C.</p>
<p>Eining: <f>Ω·mm²/m</f>. (Á glærunum stendur bara „Ohm“, en fullgilda einingin passar við l í metrum og A í mm².)</p>
<p><b>Eðlisleiðni</b> er andhverfan: <f>\\f{1}{ρ}</f>. Kopar: <f>\\f{1}{0,0178}</f> ≈ 56 m/(Ω·mm²).</p>
<div class="note"><b>Um táknin:</b> Á glærum kennarans er eðlisleiðni táknuð <b>G</b> með einingu siemens. Í mörgum bókum er eðlisleiðni táknuð <b>σ</b> (sigma) eða <b>γ</b>, og þá er <b>G</b> notað um <i>leiðni hlutar</i>, <f>G = \\f{1}{R}</f>. Notaðu táknin sem kennarinn notar í prófinu – aðalatriðið er að leiðni er andhverfa viðnáms.</div>`,
          quiz: ['c2-4', 'c2-5', 'c2-6', 'c2-7'],
        },
        {
          id: 'k2-thvermal', title: 'Þvermál, radíus og þverflatarmál',
          html: `<p>Vír er sívalningur. Þverskurðurinn er hringur:</p>
<div data-widget="circle"></div>
<fb>A = π·r^2 = \\f{π·d^2}{4}</fb>
<p><b>d</b> = þvermál (á glærum: Φ), <b>r</b> = radíus = d/2. Dæmi af glæru: þvermál 2 mm → r = 1 mm → <f>A = 1^2·π = 3,14 mm²</f>.</p>
<p class="warn"><b>Algeng mistök:</b> að nota <f>π·d^2</f> (gleyma ÷4) eða setja þvermálið inn sem radíus. Það gefur fjórfalt of mikið þverflatarmál.</p>
<p class="note">Athugið: í verkefninu er bent á að á spurningaglæru 3.2.1 komi önnur flatarmálsformúla fram. Sú glæra fylgdi ekki gögnunum svo það er óstaðfest, en rétta formúlan er <f>A = \\f{π·d^2}{4}</f>.</p>`,
          quiz: ['c2-15', 'c2-3'],
        },
        {
          id: 'k2-hiti', title: 'Hitastig, hitastuðull, NTC og PTC',
          html: `<p>Þegar málmur hitnar titra frumeindirnar meira og rafeindirnar rekast oftar á þær – viðnámið <b>eykst</b>. Hve mikið segir <b>hitastuðullinn</b> <f>α</f> (alfa):</p>
<p>Kopar: <f>α = 0,0039 /°C</f> → viðnámið breytist um 0,39 % á hverja gráðu. Nikkel: <f>α = 0,0055 /°C</f>.</p>
<div data-widget="temp"></div>
<div class="grid2"><div class="tile"><b>PTC</b> (jákvæður hitastuðull)<span>Viðnám <b>eykst</b> með hita. Allir hreinir málmar.</span></div>
<div class="tile"><b>NTC</b> (neikvæður hitastuðull)<span>Viðnám <b>minnkar</b> með hita. Hálfleiðarar, kol, NTC-hitanemar.</span></div></div>
<p><b>Manganín</b> og <b>konstantan</b> hafa hitastuðul nær núlli – þess vegna eru þau notuð í nákvæmar mótstöður.</p>`,
          quiz: ['c2-8', 'c2-9', 'c2-10', 'c2-11', 'c2-12'],
        },
        {
          id: 'k2-tvi', title: 'Einleiðari og tvíleiðari',
          html: `<p><b>Einleiðari:</b> einn vír. Lengdin í formúlunni er lengd vírsins.</p>
<p><b>Tvíleiðari:</b> kapall með tveimur leiðurum. Straumurinn fer frá spennugjafanum <b>að álaginu</b> eftir öðrum leiðaranum og <b>til baka</b> eftir hinum. Þegar fjarlægðin <f>l</f> er gefin er straumleiðin því <b>2·l</b>.</p>
<div data-widget="twowire"></div>
<fb>R_l = \\f{ρ·l·2}{A}</fb>`,
          quiz: ['c2-13', 'c2-16', 'c2-14'],
        },
      ],
    },
    {
      id: 'k3', n: 3, title: 'Viðnám – útreikningar', fam: 'R',
      intro: 'Formúlan R = ρ·l/A, umritanir hennar og viðnám við hitabreytingu.',
      sections: [
        {
          id: 'k3-formula', title: 'Viðnámsformúlan',
          html: `<fb>R = \\f{ρ·l}{A}</fb>
<table class="tbl"><thead><tr><th>Tákn</th><th>Stærð</th><th>Eining</th></tr></thead><tbody>
<tr><td><f>R</f></td><td>Viðnám</td><td>Ω (ohm)</td></tr>
<tr><td><f>ρ</f></td><td>Eðlisviðnám (úr töflu)</td><td>Ω·mm²/m</td></tr>
<tr><td><f>l</f></td><td>Lengd leiðarans</td><td>m</td></tr>
<tr><td><f>A</f></td><td>Þverflatarmál</td><td>mm²</td></tr></tbody></table>
<div class="example"><b>Sýnidæmi (glæra 3.3):</b> 628 m eirþráður, 2 mm í þvermál.<br>
<f>A = 1^2·π = 3,14 mm²</f> → <f>R = \\f{0,0178·628}{3,14} = 3,56 Ω</f></div>
<div data-widget="calcR"></div>`,
          quiz: ['c3-1', 'c3-4', 'c3-5'],
        },
        {
          id: 'k3-umritun', title: 'Umritun: lengd, þverflatarmál og eðlisviðnám',
          html: `<p>Sama formúlan er notuð til að finna hvaða stærð sem er. Óþekkta stærðin er einangruð:</p>
<div class="grid3">
<div class="tile"><b>Lengd</b><fb>l = \\f{R·A}{ρ}</fb></div>
<div class="tile"><b>Þverflatarmál</b><fb>A = \\f{ρ·l}{R}</fb></div>
<div class="tile"><b>Eðlisviðnám</b><fb>ρ = \\f{R·A}{l}</fb></div></div>
<div data-widget="triangle"></div>
<p class="tip"><b>Skipt um efni, sama viðnám:</b> reiknaðu fyrst R með gamla efninu og síðan <f>A = \\f{ρ_{nýtt}·l}{R}</f>. Flýtileið: <f>A_2 = A_1·\\f{ρ_2}{ρ_1}</f>.</p>
<p class="tip"><b>Hvaða efni?</b> Reiknaðu ρ og berðu saman við töfluna. Dæmi kennarans: <f>ρ = \\f{5·2,4}{120} = 0,1</f> → járn.</p>`,
          quiz: ['c3-2', 'c3-3'],
        },
        {
          id: 'k3-hiti', title: 'Viðnám við hitabreytingu',
          html: `<fb>R_{t2} = R_{t1} + R_{t1}·α·Δt</fb>
<p>Hitun: leggja breytinguna við. Kólnun: draga frá: <f>R_{t2} = R_{t1} − R_{t1}·α·Δt</f>.</p>
<table class="tbl"><tbody><tr><td><f>R_{t1}</f></td><td>viðnám við upphafshitastig <f>t_1</f></td></tr><tr><td><f>R_{t2}</f></td><td>viðnám við lokahitastig <f>t_2</f></td></tr><tr><td><f>Δt</f></td><td>hitastigsbreyting (mismunur, í °C)</td></tr><tr><td><f>α</f></td><td>hitastuðull efnisins</td></tr></tbody></table>
<div class="example"><b>Sýnidæmi (glæra 3.3):</b> Eirleiðsla 1 Ω við 20 °C. Viðnám við 80 °C?<br>Δt = 60 °C → <f>R_{t2} = 1 + 1·0,0039·60 = 1,234 Ω</f></div>
<p class="warn"><b>Yfir núllið:</b> frá +10 °C niður í −15 °C er Δt = <b>25</b> °C, ekki 5.</p>`,
          quiz: ['c3-8', 'c3-7', 'c3-10'],
        },
        {
          id: 'k3-lokahiti', title: 'Lokahitastig út frá mældu viðnámi',
          html: `<p>Ef viðnámið er mælt fyrir og eftir hitun má reikna hve heitur leiðarinn varð (t.d. spóla í mótor):</p>
<fb>Δt = \\f{R_{t2} − R_{t1}}{R_{t1}·α}</fb><fb>t_2 = t_1 + Δt</fb>
<p class="warn"><b>Prentvilla í svörum:</b> Í vélrituðu formúlunni á svarglæru 3.3.1 (dæmi 5) stendur <f>R_{t2}</f> í nefnaranum. Rétt er <b>upphafsviðnámið</b> <f>R_{t1}</f> – og það er líka það sem kennarinn notar í útreikningnum sjálfum.</p>
<div class="example"><b>Dæmi 5:</b> 8,5 Ω við 20 °C → 10 Ω.<br><f>Δt = \\f{10 − 8,5}{8,5·0,0039} = \\f{1,5}{0,03315} = 45,25 °C</f> → <f>t_2 = 20 + 45,25 = 65,25 °C</f></div>`,
          quiz: ['c3-6', 'c3-9'],
        },
      ],
    },
    {
      id: 'k4', n: 4, title: 'Spennuföll', fam: 'U',
      intro: 'Hvers vegna spennan á álaginu er lægri en spenna gjafans og hvernig það er reiknað.',
      sections: [
        {
          id: 'k4-hvad', title: 'Hvað er spennufall?',
          html: `<p>Hluti spennunnar sem spennugjafinn gefur fer í að <b>knýja strauminn í gegnum leiðarana</b>. Sá hluti kallast <b>spennufall</b> eða spennutap, <f>ΔU</f>. Afgangurinn er spennan á álaginu.</p>
<p>Spennufall verður af því að leiðararnir hafa viðnám. Leiðsla og álag eru raðtengd:</p>
<fb>R_H = R_l + R_{álag}</fb>
<div data-widget="drop"></div>`,
          quiz: ['c4-1', 'c4-2', 'c4-5'],
        },
        {
          id: 'k4-tvi', title: 'Tvíleiðari – fram og til baka',
          html: `<p>Þetta er atriði sem <b>verður</b> að kunna: þegar gefin er <b>fjarlægð</b> milli spennugjafa og álags og leiðslan er tvíleiðari, fer straumurinn <b>fram</b> eftir öðrum leiðaranum og <b>til baka</b> eftir hinum.</p>
<div data-widget="twowire"></div>
<fb>R_l = \\f{ρ·l·2}{A}</fb><fb>ΔU = I·R_l = I·\\f{ρ·l·2}{A}</fb>
<p class="warn"><b>Algengasta villan:</b> að gleyma ×2. Þá verður viðnámið og spennufallið helmingi of lítið.</p>
<div class="example"><b>Glæra 3.4, dæmi 2:</b> 100 m, 1,5 mm² kopar, 8 A, 230 V.<br><f>R_l = \\f{0,0178·100·2}{1,5} = 2,37 Ω</f> · <f>ΔU = 8·2,37 = 18,98 V</f> · <f>U_2 = 230 − 18,98 = 211,02 V</f></div>`,
          quiz: ['c4-3', 'c4-6', 'c4-12'],
        },
        {
          id: 'k4-alag', title: 'Spenna á álagi og spenna gjafans',
          html: `<fb>U_2 = U_1 − ΔU</fb><fb>U_1 = U_2 + ΔU</fb>
<p><f>U_1</f> = spenna spennugjafans (töflunnar), <f>U_2</f> = spenna yfir álaginu. Álagið fær alltaf <b>minna</b> en gjafinn gefur.</p>
<div class="example"><b>Glæra 3.4, dæmi 1:</b> Ofn tekur 10 A, hvor vír 0,2 Ω (samtals 0,4 Ω), tafla 220 V.<br><f>ΔU = 10·0,4 = 4 V</f> → <f>U_2 = 220 − 4 = 216 V</f></div>
<div data-widget="s7diagram"></div>`,
          quiz: ['c4-4', 'c4-9'],
        },
        {
          id: 'k4-pct', title: 'Spennufall í prósentum',
          html: `<fb>% = \\f{ΔU}{U_1}·100</fb>
<p>Deilt er með spennu <b>gjafans</b>. Án „·100“ fæst hlutfall (t.d. 0,018) en ekki prósenta.</p>
<p class="note">Á einni svarglæru 3.4.1 (dæmi 3) vantar „·100“ í formúluna, þó útkoman (8,62 %) sé prósenta. Rétt: <f>\\f{18,99}{220}·100 = 8,63 %</f>.</p>
<p>Á glæru 3.4 kemur fram að samkvæmt reglugerð um rafkerfi í skipum má spennufall ekki vera yfir <b>6 %</b>. Dæmi: <f>\\f{4}{220}·100 = 1,82 %</f>.</p>`,
          quiz: ['c4-10', 'c4-8'],
        },
        {
          id: 'k4-honnun', title: 'Hámarkslengd og nauðsynlegt þverflatarmál',
          html: `<p>Þegar <b>leyft spennufall</b> er gefið er byrjað á Ohmslögmáli til að finna hve mikið viðnám kapallinn má hafa:</p>
<fb>R = \\f{ΔU}{I}</fb>
<div class="grid2"><div class="tile"><b>Hámarkslengd</b><fb>l = \\f{R·A}{ρ·2}</fb><span>Dæmi 4: 1,5 mm², 10 A, 5 V → R = 0,5 Ω → l = 21 m</span></div>
<div class="tile"><b>Nauðsynlegt þverflatarmál</b><fb>A = \\f{ρ·l·2}{R}</fb><span>Dæmi 5: 90 m, 60 A, 8 V → R = 0,1333 Ω → A = 24,03 mm² → veljum 25 mm²</span></div></div>
<p class="warn"><b>Ekki námunda of snemma:</b> á svarglærunni er R námundað í 0,13 Ω, sem gefur 24,6 mm². Með R = 0,13333 fæst 24,03 mm².</p>
<p>Ef leyfilegt spennufall er gefið í %: <f>ΔU = \\f{%·U_1}{100}</f> fyrst.</p>`,
          quiz: ['c4-11', 'c4-7'],
        },
      ],
    },
  ];
  RF.lessonSection = (id) => { for (const ch of RF.lessons) for (const s of ch.sections) if (s.id === id) return { ch, s }; return null; };
})(typeof globalThis !== 'undefined' ? globalThis : window);

/* Kennsluáætlanir. Hver pakki er settur einu sinni inn í gögnin (líka hjá þeim sem eru þegar byrjaðir).
   Vikur eru auðkenndar með mánudegi vikunnar. Verkefni með sama id eru ekki sett inn tvisvar. */
window.NAM_PACKS = [
  {
    id: 'rafl-H26-2',
    course: 'rafl',
    info: {
      code: 'RAFL1GA04AR',
      name: 'Raflagnir – efnisfræði og lagnir',
      teacher: 'Eygló Rut Sveinsdóttir (eyr@tskoli.is)',
      notes: 'Mætingarskylda: undir 80% mætingu er hætta á brottvísun úr áfanganum.\n' +
        'Lykilmatsþættir (verkefni 7 og lokapróf): heimilt að krefjast lágmarkseinkunnar 5,0.\n' +
        'Ekki má spennusetja nema kennari sé viðstaddur.\n' +
        'Námsgögn og skil eru í kennslukerfinu.'
    },
    plan: [
      { week: '2026-10-19', topic: 'Verkefni 1: klær og hulsur. Starf rafiðnaðarmannsins, öryggismál', reading: 'Kennsla hefst 19. okt.' },
      { week: '2026-10-26', topic: 'Verkefni 2: efnisfræði', reading: '' },
      { week: '2026-11-02', topic: 'Verkefni 3 og 4: einfaldir rofar, krónurofar og samrofar', reading: '' },
      { week: '2026-11-09', topic: 'Verkefni 5: krossrofar · Próf 1', reading: 'Próf 1 fös. 13. nóv. kl. 12' },
      { week: '2026-11-16', topic: 'Verkefni 6a og 6b', reading: 'Mán. 16. nóv. námsmat (miðspannarmat)' },
      { week: '2026-11-23', topic: 'Verkefni 7a og 7b (lokaverkefni)', reading: 'Skil á verkefni 6 mið. 25. nóv.' },
      { week: '2026-11-30', topic: 'Verkefni 8 · lokapróf', reading: 'Skil á verkefni 7 mið. 2. des. Lokapróf fös. 4. des. kl. 12' },
      { week: '2026-12-07', topic: 'Verkefni 8, frágangur', reading: 'Kennslu lýkur 11. des.' },
      { week: '2026-12-14', topic: 'Upptöku- og sjúkrapróf 14. des.', reading: 'Lokaeinkunnir birtar 16. des.' }
    ],
    tasks: [
      { id: 'rafl-ahaettumat', title: 'Áhættumat', kind: 'verkefni', due: '2026-11-02', time: '23:59', weight: '', done: true, submitted: '2026-11-05', score: 'Skilað seint', notes: '' },
      { id: 'rafl-v1', title: 'Verkefni 1: klær og hulsur, öryggismál', kind: 'verkefni', due: '2026-11-04', time: '23:59', weight: 5, done: true, submitted: '2026-10-23', score: '100%', notes: '' },
      { id: 'rafl-v2', title: 'Verkefni 2: efnisfræði', kind: 'verkefni', due: '2026-11-04', time: '23:59', weight: 5, done: true, submitted: '2026-10-28', score: '85%', notes: '' },
      { id: 'rafl-v3', title: 'Verkefni 3: einfaldir rofar, krónurofar og samrofar', kind: 'verkefni', due: '2026-11-11', time: '23:59', weight: 10, done: true, submitted: '2026-11-06', score: '80%', notes: '' },
      { id: 'rafl-v4', title: 'Verkefni 4: einfaldir rofar, krónurofar og samrofar', kind: 'verkefni', due: '2026-11-11', time: '23:59', weight: 10, done: false, notes: 'Merkt „vantar“ í kennslukerfinu. Hafðu samband við kennara um skil.' },
      { id: 'rafl-p1', title: 'Próf 1 í Raflögnum A', kind: 'prof', due: '2026-11-13', time: '12:00', weight: 15, done: false, notes: 'Próf um miðja spönn.' },
      { id: 'rafl-v5', title: 'Verkefni 5: krossrofar', kind: 'verkefni', due: '2026-11-13', time: '23:59', weight: 10, done: false, notes: '' },
      { id: 'rafl-v6', title: 'Verkefni 6 (6a og 6b)', kind: 'verkefni', due: '2026-11-25', time: '23:59', weight: 10, done: false, notes: '' },
      { id: 'rafl-v7', title: 'Lokaverkefni: verkefni 7 (7a og 7b)', kind: 'verkefni', due: '2026-12-02', time: '23:59', weight: 10, done: false, notes: 'Lykilmatsþáttur.' },
      { id: 'rafl-p2', title: 'Lokapróf í Raflögnum A', kind: 'prof', due: '2026-12-04', time: '12:00', weight: 20, done: false, notes: 'Lykilmatsþáttur. Námsáætlunin setur prófið í viku 50 en kennslukerfið segir 4. des. kl. 12. Staðfestu hjá kennara.' },
      { id: 'rafl-v8', title: 'Verkefni 8', kind: 'verkefni', due: '2026-12-07', time: '', weight: 5, done: false, notes: 'Nákvæmur skiladagur er ekki kominn. Námsáætlunin segir viku 50 (7.–11. des.), svo hér er miðað við upphaf vikunnar.' }
    ]
  }
];

/* Námsleiðbeiningar og gátlistar. Lykillinn er id verkefnis.
   Efnið er unnið úr námsáætluninni, verkefnablöðum 1–5, Hugtökum í Raflögnum, áhættumati, kapallögnum og straumþolstöflum ÍST 200:2006. Hakið sjálft vistast á verkefninu (t.checked). */
window.NAM_STUDY = {
  'rafl-p1': {
    intro: 'Próf um miðja spönn, 15% af einkunn. Prófið er bóklegt. Listinn nær yfir verkefni 1–5 (afeinangrun og hulsur, bretti, teikningar og tákn, rofar og tenglar), hugtök kennarans, áspenntar kapallagnir, straumþol leiðara og öryggi og áhættumat. Prófið er í kennslukerfinu og lokar kl. 12:00 á föstudag, svo það verður líklega tekið í Raflagnatímanum um morguninn (8:30–12:05).',
    how: [
      'Hafðu verkefnablöð 3, 4 og 5 fyrir framan þig. Þar eru teikningarnar sem prófið byggir líklega á.',
      'Teiknaðu fjöllínumynd eftir minni fyrir hvert verkefnablað: einn vír í einu, fasi, núll, jörð, millilínur og hlauparar. Berðu hana saman við það sem þú tengdir á brettinu. Ef þú getur teiknað þessar þrjár geturðu svarað flestum spurningum um tengingar.',
      'Rektu strauminn í krossrofatengingunni (verkefni 5) í öllum rofastöðum og athugaðu að hver rofi kveiki og slökkvi óháð hinum.',
      'Lærðu hugtök kennarans (millilína, hlauparar, vippa, rammi) og tölurnar í kapallögnum: 6–8 cm að fyrstu spennu, 11–20 cm (helst 15 cm) milli spenna og 1 cm kápa inn í dós.',
      'Æfðu að lesa straumþolstöfluna: finndu rétta töflu (einangrun og fjöldi álagsleiðara), svo lagnaraðferð og síðast gildleika. 1,5 mm² Cu PVC í B1 = 17,5 A.',
      'Farðu yfir efni verkefna 1 og 2, öryggisatriðin og áhættumatið. Segðu þau upphátt eða búðu til spjöld.',
      'Hakaðu við hvert atriði sem þú getur útskýrt án þess að líta í gögnin. Óhökuðu atriðin rifjarðu upp í fyrramálið, í 10 mínútur.',
      'Í prófinu: Lestu hverja spurningu tvisvar. Teiknaðu rásina á blað áður en þú svarar spurningu um tengingu.'
    ],
    sections: [
      { title: 'Afeinangrun og hulsur (verkefni 1)', items: [
        { id: 'p1-verkf', text: 'Verkfærin: bítari til að afeinangra einþátta vír og endahulsutöng til að pressa hulsur.' },
        { id: 'p1-saera', text: 'Af hverju má aldrei særa koparinn.', hint: 'Særður vír brotnar eftir fáar beygjur, eins og þú prófaðir í verkefni 1 (manstu hve margar beygjur hann þoldi?). Sárið minnkar líka þversniðið svo vírinn getur hitnað.' },
        { id: 'p1-kapall', text: 'Hvað 3×1,5q kapall er.', hint: 'Þrír leiðarar, hver 1,5 mm². Kápan er ytri einangrunin utan um alla vírana. Hver vír hefur sína eigin einangrun.' },
        { id: 'p1-lengdir', text: 'Rétt röð við afeinangrun: fyrst um 5 cm af kápunni, síðan um 1 cm af hverjum vír, án þess að særa vírana undir.' },
        { id: 'p1-hulsur', text: 'Hvenær nota skal endahulsur.', hint: 'Á fjölþátta (mjúkan) vír eins og lampasnúru, svo þræðirnir haldist saman og skrúfan klemmi vel. Einþátta vír þarf ekki hulsu.' }
      ] },
      { title: 'Uppsetning á bretti (verkefni 2)', items: [
        { id: 'p1-efni', text: 'Heiti og hlutverk efnisins: loftadós, veggdós, rofa- og tengladós, tengidós, 16 mm plaströr, rörastútur, nippill og rörspennur.' },
        { id: 'p1-stutar', text: 'Rörið á að ná alveg í botninn á rörastútnum. Gerðu ráð fyrir því þegar rörið er mælt og beygt.' },
        { id: 'p1-maela', text: 'Að mæla eftir málsetningum á teikningu og merkja með merkivél, aldrei krota.', hint: 'Þú myndir ekki krota á vegg heima hjá viðskiptavini.' },
        { id: 'p1-rod', text: 'Að hugsa röðina fyrir fram: dósirnar og rörin í stútunum þarf að festa saman.' }
      ] },
      { title: 'Teikningar og tákn (verkefni 3–5)', items: [
        { id: 'p1-takn-dos', text: 'Táknin á verkefnablöðunum: stór hringur = tengidós, kross = ljós, kross með þverstriki = vegglampi, bolli á staf = tengill.' },
        { id: 'p1-takn-rofar', text: 'Rofatáknin: lítill hringur með einu flaggi = einfaldur rofi, tvö flögg sömu megin = krónurofi, flögg í gagnstæðar áttir = samrofi, krossuð flögg = krossrofi.', hint: 'Berðu þetta saman við táknin í kennslukerfinu ef kennarinn notar aðra útgáfu.' },
        { id: 'p1-stafir', text: 'Bókstafirnir á teikningunni segja hvaða rofi stýrir hvaða ljósi (rofi a stýrir ljósi a o.s.frv.).' },
        { id: 'p1-fjollinu', text: 'Munurinn á einlínumynd (eins og á verkefnablaðinu) og fjöllínumynd, þar sem hver vír er teiknaður.', hint: 'Fyrsta skrefið í verkefnum 3, 4 og 5 er að rissa upp fjöllínumynd.' }
      ] },
      { title: 'Rofarnir (verkefni 3–5)', items: [
        { id: 'p1-einf', text: 'Einfaldur rofi (verkefni 3, rofi a): kveikir og slekkur á einu ljósi frá einum stað.', hint: 'Rofinn rýfur fasann. Núllið fer beint í ljósið, aldrei í gegnum rofann.' },
        { id: 'p1-krono', text: 'Krónurofi (verkefni 3 og 4, rofi b/c): stýrir tveimur ljósum hvoru fyrir sig frá einum stað.', hint: 'Einn fasi inn og tvær millilínur út, ein í hvort ljós.' },
        { id: 'p1-sam', text: 'Samrofar (verkefni 4, rofar a): sama ljósið frá tveimur stöðum.', hint: 'Fasinn fer í sameiginlega tengið á öðrum rofanum, tveir hlauparar liggja á milli rofanna og millilínan fer frá sameiginlega tenginu á hinum að ljósinu.' },
        { id: 'p1-kross', text: 'Krossrofar (verkefni 5): eitt ljós frá fjórum stöðum, samrofi – krossrofi – krossrofi – samrofi.', hint: 'Krossrofinn tekur tvo hlaupara inn og tvo út og víxlar þeim. Hann tengist aldrei beint í ljós. Fyrir hvern stað umfram tvo bætist einn krossrofi við.' },
        { id: 'p1-rekja', text: 'Að rekja leið straumsins í hverri stöðu rofanna og sýna að hver rofi kveiki og slökkvi.' },
        { id: 'p1-virar', text: 'Hve marga víra þarf í rörið milli dósa í hverri tengingu.' }
      ] },
      { title: 'Tenglar, kló og frágangur (verkefni 3–5)', items: [
        { id: 'p1-litir', text: 'Litakóðar víra og að draga víra í rör með réttum litum.', hint: 'Brúnn = fasi (L), blár = núll (N), gul-grænn = jörð (PE).' },
        { id: 'p1-tengill', text: 'Tengill: fasi og núll í tengilinn og jörðin í jarðtengið.' },
        { id: 'p1-klo', text: 'Að tengja kló með hulsum á lausataug í tengidós.', hint: 'Lausataug er snúran með klónni. Hún er fjölþátta og þarf því hulsur.' },
        { id: 'p1-dosir', text: 'Að ganga frá ónotuðum dósum á viðeigandi hátt (með loki).' },
        { id: 'p1-spenna', text: 'Ferlið í lokin: kennari staðfestir, spennusett með kennara og mælt.', hint: 'Spennusetja ALDREI án kennara.' }
      ] },
      { title: 'Hugtök kennarans', items: [
        { id: 'p1-millilina', text: 'Millilína: vírinn frá rofa í ljós.', hint: 'Má vera nánast hvaða litur sem er nema brúnn, blár eða gul-grænn.' },
        { id: 'p1-hlauparar', text: 'Hlauparar: alltaf 2 vírar, eins á litinn, sem fara á milli rofa.', hint: 'Mega ekki vera brúnir, bláir eða gul-grænir.' },
        { id: 'p1-vippa', text: 'Vippa fer framan á rofa. Rammi er í kringum rofa og tengla. Tengill = innstunga.' },
        { id: 'p1-rofareglur', text: 'Hvaða rofar vinna með öðrum rofum.', hint: 'Krónurofi: ekki með öðrum rofum. Samrofi: sem einfaldur rofi (fasi + millilína) eða með öðrum (fasi + 2 hlauparar). Krossrofi: tengist bara í aðra rofa, aldrei beint í ljós.' }
      ] },
      { title: 'Áspenntar kapallagnir', items: [
        { id: 'p1-kap-fyrsta', text: 'Bil að fyrstu spennu frá beygju, rofa, tengli eða tengidós: 6–8 cm.' },
        { id: 'p1-kap-bil', text: 'Bil milli spenna: 11–20 cm, helst sem næst 15 cm.', hint: 'Mæla milli fyrstu og síðustu spennu og deila með fjölda bila. Dæmi: 78 cm / 5 = 15,6 cm.' },
        { id: 'p1-kap-kapa', text: 'Kápan nær aðeins 1 cm inn í tengidós, en inn í þann rafbúnað sem á að tengja.' },
        { id: 'p1-kap-lagning', text: 'Lárétt lögn sem næst lofti, beygjur sem næst 90°, kapall sléttur og spenna negld beint inn.' },
        { id: 'p1-kap-tog', text: 'Togfestur þar sem það á við. Herða nippla og festa kapla við rillur í töflu.' }
      ] },
      { title: 'Straumþol leiðara (ÍST 200:2006)', items: [
        { id: 'p1-st-hvad', text: 'Hvað straumþol er og hvað hefur áhrif á það.', hint: 'Straumurinn sem leiðari má flytja að staðaldri án þess að hitna um of. Hefur áhrif: lagnaraðferð, einangrun (PVC 70 °C, XLPE 90 °C), fjöldi álagsleiðara, umhverfishiti (30 °C loft / 20 °C jörð), hneppi og kopar eða ál.' },
        { id: 'p1-st-adferdir', text: 'Lagnaraðferðirnar A1, A2, B1, B2, C og D.', hint: 'A1/A2: í röri í varmaeinangruðum vegg. B1/B2: í röri á vegg. C: strengur beint á vegg. D: í jörð. Tala 1 = einangraðir leiðarar, tala 2 = fjölleiðarastrengur.' },
        { id: 'p1-st-lesa', text: 'Að lesa töflu 52A.2: 1,5 mm² Cu, PVC, 2 álagsleiðarar.', hint: 'A1 14,5 A · B1 17,5 A · C 19,5 A. Fyrir 2,5 mm²: A1 19,5 A · B1 24 A · C 27 A.' },
        { id: 'p1-st-thrir', text: 'Þrír álagsleiðarar (tafla 52A.4) gefa lægra straumþol.', hint: '1,5 mm² B1: 15,5 A í stað 17,5 A.' }
      ] },
      { title: 'Öryggi og áhættumat', items: [
        { id: 'p1-straumur', text: 'Áhrif rafstraums á líkamann.', hint: 'Það er straumurinn í gegnum líkamann sem veldur skaðanum. Um 30 mA geta verið hættuleg, og þess vegna slær lekastraumsrofi út við 30 mA.' },
        { id: 'p1-vor', text: 'Munurinn á vari (öryggi) og lekastraumsrofa.', hint: 'Varið ver lögnina gegn yfirálagi og skammhlaupi. Lekastraumsrofinn ver fólk gegn snertihættu.' },
        { id: 'p1-5reglur', text: 'Fimm öryggisreglurnar áður en unnið er við lögn.', hint: '1) Rjúfa. 2) Tryggja gegn endurinnsetningu. 3) Ganga úr skugga um spennuleysi. 4) Jarðtengja og skammhleypa. 5) Girða af eða hylja nálæga spennuhafa hluti.' },
        { id: 'p1-starf', text: 'Starf rafiðnaðarmannsins og hver ber ábyrgð á raflögnum.', hint: 'Aðeins löggiltur rafverktaki má bera ábyrgð á raflagnavinnu.' },
        { id: 'p1-ahaettumat', text: 'Áhættumat rafmagnsstofu: helstu hættur og viðbrögð.', hint: 'Hnífur: skera frá sér. Bítari: rétt stærð. Borvél: ekki halda við patrónu. Vír: augnhlífar. Stólar: nota tröppu. Raflost (230 V og 24 V): ekki spennusetja án kennara. Slys: 112.' }
      ] }
    ]
  },
  'rafl-p2': {
    intro: 'Lokapróf, 20% af einkunn og lykilmatsþáttur. Heimilt er að krefjast lágmarkseinkunnar 5,0. Það nær líklega yfir allt efni spannarinnar: efni Próf 1, verkefni 6–8 og fjöllínumyndir, tengingar og tákn. Kennslukerfið segir fös. 4. des. kl. 12:00 en námsáætlunin viku 50, svo staðfestu dagsetninguna hjá kennaranum.',
    how: [
      'Tveimur vikum fyrir: Skoðaðu niðurstöðu Próf 1 og merktu hvaða spurningar fóru illa.',
      'Viku fyrir: Farðu yfir gátlistann fyrir Próf 1 og hakaðu aftur við það sem þú kannt.',
      'Eftir hvert verkefni 6–8: Bættu lykilatriðum þess hér við undir „Mín atriði“ meðan efnið er ferskt.',
      '2–3 dögum fyrir: Teiknaðu allar tengingarnar eftir minni, bæði sem einlínu- og fjöllínumyndir.',
      'Daginn fyrir: Aðeins óhökuð atriði. Farðu snemma að sofa.'
    ],
    sections: [
      { title: 'Efni Próf 1', items: [
        { id: 'p2-p1', text: 'Gátlistinn fyrir Próf 1: afeinangrun, bretti, tákn, rofarnir fjórir, tenglar og öryggi.' },
        { id: 'p2-mistok', text: 'Þær spurningar sem fóru illa í Próf 1.' }
      ] },
      { title: 'Fjöllínumyndir, tengingar og tákn', items: [
        { id: 'p2-takn', text: 'Teiknitákn fyrir rofa, tengla, ljós, dósir og töflu.' },
        { id: 'p2-einlina', text: 'Að breyta einlínumynd í fjöllínumynd og öfugt.' },
        { id: 'p2-lesa', text: 'Að lesa teikningu og telja víra milli dósa.' }
      ] },
      { title: 'Verkefni 6–8', items: [
        { id: 'p2-v6', text: 'Efni verkefnis 6 (6a og 6b).' },
        { id: 'p2-v7', text: 'Efni verkefnis 7, lokaverkefnisins (7a og 7b).' },
        { id: 'p2-v8', text: 'Efni verkefnis 8.' }
      ] }
    ]
  },
  'rafl-v4': {
    intro: 'Verkefnið er merkt „vantar“ í kennslukerfinu. Það gildir 10%, svo það borgar sig að bjarga því. Á brettinu eru tveir samrofar (a) sem stýra ljósi a, krónurofi (b/c) sem stýrir vegglampa b og ljósi c, og einn tengill. Metið er: þekking á rofum og tenglum, nákvæmni og vinnubrögð, vinna eftir teikningu, umgengni og hvort verkinu er lokið á tíma.',
    sections: [{ title: 'Til að klára', items: [
      { id: 'v4-tala', text: 'Talaðu við Eygló í næsta tíma (fös. kl. 8:30) og spurðu hvort þú megir skila verkefninu seint.' },
      { id: 'v4-teikna', text: 'Rissaðu upp fjöllínumynd: samrofarnir tveir, krónurofinn og tengillinn.' },
      { id: 'v4-draga', text: 'Dragðu víra í rör með réttum litum.' },
      { id: 'v4-tengja', text: 'Tengdu og festu búnaðinn.' },
      { id: 'v4-dosir', text: 'Gakktu frá ónotuðum dósum.' },
      { id: 'v4-klo', text: 'Tengdu kló með hulsum á lausataug í tengidós.' },
      { id: 'v4-kennari', text: 'Fáðu staðfestingu kennara, spennusettu með kennara og mældu. Aldrei án kennara.' },
      { id: 'v4-skila', text: 'Skilaðu í kennslukerfið.' }
    ] }]
  },
  'rafl-v5': {
    intro: 'Krossrofar, 10%. Eitt ljós stýrt frá fjórum stöðum (samrofi – krossrofi – krossrofi – samrofi) og einn tengill. Efnið er líka á Próf 1, svo verkefnið nýtist sem upprifjun.',
    sections: [{ title: 'Til að klára', items: [
      { id: 'v5-teikna', text: 'Rissaðu upp fjöllínumynd: samrofi – krossrofi – krossrofi – samrofi, auk tengilsins.' },
      { id: 'v5-draga', text: 'Dragðu víra í rör með réttum litum.' },
      { id: 'v5-tengja', text: 'Tengdu og festu búnaðinn.' },
      { id: 'v5-dosir', text: 'Gakktu frá ónotuðum dósum.' },
      { id: 'v5-klo', text: 'Tengdu kló með hulsum á lausataug í tengidós.' },
      { id: 'v5-kennari', text: 'Fáðu staðfestingu kennara, spennusettu með kennara og mældu. Prófaðu að hver rofi kveiki og slökkvi.' },
      { id: 'v5-skila', text: 'Skilaðu í kennslukerfið fyrir kl. 23:59.' }
    ] }]
  },
  'rafl-v6': {
    intro: 'Verkefni 6a og 6b, 10%. Unnið í viku 47.',
    sections: [{ title: 'Til að klára', items: [
      { id: 'v6-lysing', text: 'Lestu verkefnalýsinguna fyrir 6a og 6b í kennslukerfinu.' },
      { id: 'v6-a', text: 'Ljúktu við 6a.' },
      { id: 'v6-b', text: 'Ljúktu við 6b.' },
      { id: 'v6-skoda', text: 'Láttu kennarann skoða áður en spennusett er.' },
      { id: 'v6-skila', text: 'Skilaðu í kennslukerfið fyrir kl. 23:59.' }
    ] }]
  },
  'rafl-v7': {
    intro: 'Lokaverkefni (7a og 7b), 10% og lykilmatsþáttur. Heimilt er að krefjast lágmarkseinkunnar 5,0. Unnið í viku 48.',
    sections: [{ title: 'Til að klára', items: [
      { id: 'v7-lysing', text: 'Lestu verkefnalýsinguna og matskvarðann í kennslukerfinu.' },
      { id: 'v7-a', text: 'Ljúktu við 7a.' },
      { id: 'v7-b', text: 'Ljúktu við 7b.' },
      { id: 'v7-skoda', text: 'Láttu kennarann skoða áður en spennusett er.' },
      { id: 'v7-frag', text: 'Gakktu frá: snyrtilegur frágangur gildir.' },
      { id: 'v7-skila', text: 'Skilaðu í kennslukerfið fyrir kl. 23:59.' }
    ] }]
  },
  'rafl-v8': {
    intro: 'Verkefni 8, 5%. Skiladagur er ekki kominn í kennslukerfið. Námsáætlunin segir viku 50.',
    sections: [{ title: 'Til að klára', items: [
      { id: 'v8-dags', text: 'Fáðu skiladaginn staðfestan og uppfærðu hann hér.' },
      { id: 'v8-lysing', text: 'Lestu verkefnalýsinguna í kennslukerfinu.' },
      { id: 'v8-skila', text: 'Skilaðu í kennslukerfið.' }
    ] }]
  }
};

/* Æfingapróf. Lykillinn er id prófs. c = rétt svar (vísir í a), ref = atriði í gátlistanum,
   sym = teiknitákn sem birtist með spurningunni. Svarmöguleikar birtast í slembiröð. */
window.NAM_QUIZ = {
  'rafl-p1': [
    { q: 'Hvað þýðir „3×1,5q“ á kapli?', a: ['Þrír leiðarar, hver 1,5 mm²', 'Kapall úr 1,5 mm vír, 3 m á lengd', 'Þrjú lög af einangrun, 1,5 mm þykk', 'Kapall fyrir 3 A við 1,5 kV'], c: 0, why: '3 er fjöldi leiðara og 1,5q er þversnið hvers leiðara í mm² (q = fermillimetrar).', ref: 'p1-kapall' },
    { q: 'Af hverju má ekki særa koparinn við afeinangrun?', a: ['Særður vír brotnar eftir fáar beygjur og þversniðið minnkar', 'Einangrunin losnar af vírnum', 'Koparinn oxast strax og verður grænn', 'Það skiptir aðeins máli á fjölþátta vír'], c: 0, why: 'Í verkefni 1 sástu að særður vír þolir fáar beygjur. Minna þversnið þýðir líka að vírinn getur hitnað.', ref: 'p1-saera' },
    { q: 'Á hvaða vír eru endahulsur notaðar?', a: ['Fjölþátta (mjúkan) vír, t.d. lampasnúru', 'Einþátta vír í rörum', 'Eingöngu jarðvír', 'Alla víra sem fara í tengil'], c: 0, why: 'Hulsan heldur þráðunum saman svo enginn stakur þráður standi út og skrúfan klemmi vel. Einþátta vír þarf ekki hulsu.', ref: 'p1-hulsur' },
    { q: 'Með hvaða verkfæri er æft að afeinangra einþátta vír í verkefni 1?', a: ['Bítara', 'Endahulsutöng', 'Rörbeygju', 'Merkivél'], c: 0, why: 'Bítarinn er notaður á einþátta vír. Endahulsutöngin pressar hulsur á fjölþátta vír.', ref: 'p1-verkf' },
    { q: 'Í hvaða röð er kapall afeinangraður í verkefni 1?', a: ['Fyrst um 5 cm af kápunni, síðan um 1 cm af hverjum vír', 'Fyrst vírarnir, síðan kápan', 'Allt í einu, um 6 cm', 'Kápan er látin vera og aðeins vírarnir afeinangraðir'], c: 0, why: 'Kápan fyrst, varlega svo vírarnir undir særist ekki, síðan um 1 cm af hverjum vír.', ref: 'p1-lengdir' },
    { q: 'Hvaða hlutverk hefur brúnn vír?', a: ['Fasi (L)', 'Núll (N)', 'Jörð (PE)', 'Hann er eingöngu notaður sem hlaupari'], c: 0, why: 'Brúnn = fasi, blár = núll, gul-grænn = jörð.', ref: 'p1-litir' },
    { q: 'Hvaða hlutverk hefur blár vír?', a: ['Núll (N)', 'Fasi (L)', 'Jörð (PE)', 'Millilína'], c: 0, why: 'Brúnn = fasi, blár = núll, gul-grænn = jörð.', ref: 'p1-litir' },
    { q: 'Má nota gul-grænan vír sem millilínu ef annan lit vantar?', a: ['Nei, gul-grænn er eingöngu jörð', 'Já, ef hann er merktur', 'Já, í lausataug', 'Já, ef kennarinn er ekki á staðnum'], c: 0, why: 'Gul-grænn er alltaf jörð (PE) og má aldrei nota í annað.', ref: 'p1-litir' },
    { q: 'Hvernig er staðsetning búnaðar merkt á spónaplötunni í verkefni 2?', a: ['Með merkivél, eftir málsetningum á teikningu', 'Með tússpenna beint á plötuna', 'Búnaðurinn er skrúfaður á án mælinga', 'Með blýanti yfir alla plötuna'], c: 0, why: 'Ekki krota á plötuna. Þú myndir ekki gera það á vegg heima hjá fólki.', ref: 'p1-maela' },
    { q: 'Hve langt á plaströrið að ná inn í rörastútinn?', a: ['Alveg í botninn', 'Um það bil hálfa leið', 'Rétt inn fyrir brúnina', 'Rörið á ekki að fara inn í stútinn'], c: 0, why: 'Rörið á að ná alveg í botn stútsins. Gerðu ráð fyrir því þegar rörið er mælt og beygt.', ref: 'p1-stutar' },
    { q: 'Hvaða stærð af plaströrum var notuð í verkefni 2?', a: ['16 mm', '10 mm', '25 mm', '32 mm'], c: 0, why: 'Í efnislistanum eru 16 mm plaströr og spennur fyrir 16 mm rör.', ref: 'p1-efni' },
    { q: 'Hvaða leiðara rýfur einfaldur rofi?', a: ['Fasann', 'Núllið', 'Jörðina', 'Bæði fasa og núll'], c: 0, why: 'Rofinn rýfur fasann. Núllið fer beint í ljósið. Ef núllið væri rofið væri spenna á ljósinu þótt slökkt væri.', ref: 'p1-einf' },
    { q: 'Hvað gerir krónurofi?', a: ['Stýrir tveimur ljósum hvoru fyrir sig frá einum stað', 'Stýrir einu ljósi frá tveimur stöðum', 'Dimmir ljós', 'Stýrir einu ljósi frá þremur stöðum'], c: 0, why: 'Krónurofi er tveir rofar í einum. Í verkefnum 3 og 4 stýrir hann ljósum b og c.', ref: 'p1-krono' },
    { q: 'Hvað fer út úr krónurofa að ljósunum?', a: ['Tvær millilínur, ein í hvort ljós', 'Ein sameiginleg millilína', 'Tveir hlauparar sem fara að öðrum rofa', 'Núll og jörð'], c: 0, why: 'Einn fasi fer inn og tvær millilínur út, ein í hvort ljós.', ref: 'p1-krono' },
    { q: 'Hverju stýra tveir samrofar?', a: ['Einu ljósi frá tveimur stöðum', 'Tveimur ljósum frá einum stað', 'Tengli', 'Einu ljósi frá fjórum stöðum'], c: 0, why: 'Samrofar eru t.d. notaðir í stigagangi: kveikt niðri og slökkt uppi. Í verkefni 4 stýra samrofar a ljósi a.', ref: 'p1-sam' },
    { q: 'Hvað liggur á milli tveggja samrofa?', a: ['Tveir hlauparar', 'Einn núllvír', 'Eingöngu jarðvír', 'Fasi og núll'], c: 0, why: 'Fasinn fer í sameiginlega tengið á öðrum rofanum, tveir hlauparar liggja á milli og millilínan fer frá hinum að ljósinu.', ref: 'p1-sam' },
    { q: 'Hve marga krossrofa þarf til að stýra einu ljósi frá fjórum stöðum?', a: ['Tvo, ásamt tveimur samrofum', 'Einn', 'Fjóra', 'Þrjá'], c: 0, why: 'Tveir samrofar sjá um tvo staði. Hver staður umfram tvo kallar á einn krossrofa. Þannig var verkefni 5.', ref: 'p1-kross' },
    { q: 'Hvar er krossrofi settur í rásina?', a: ['Á milli tveggja samrofa, á hlauparana', 'Milli tengidósar og fyrsta rofa', 'Á eftir ljósinu', 'Í staðinn fyrir annan samrofann'], c: 0, why: 'Krossrofinn tekur tvo hlaupara inn og tvo út og víxlar þeim. Hann tengist aldrei beint í ljós.', ref: 'p1-kross' },
    { q: 'Hvað er fjöllínumynd?', a: ['Mynd þar sem hver vír er teiknaður', 'Mynd þar sem lögnin er sýnd með einni línu', 'Grunnmynd af húsi', 'Listi yfir efni í verkefnið'], c: 0, why: 'Teikningarnar á verkefnablöðunum eru einlínumyndir. Í fjöllínumynd sést hver vír: fasi, núll, jörð, millilínur og hlauparar.', ref: 'p1-fjollinu' },
    { q: 'Hvert er fyrsta skrefið í verkefnum 3, 4 og 5?', a: ['Rissa upp fjöllínumynd', 'Draga víra í rör', 'Tengja kló á lausataug', 'Spennusetja og mæla'], c: 0, why: 'Fyrst er rissað hvernig á að framkvæma verkið, svo dregið í, tengt og fest.', ref: 'p1-fjollinu' },
    { q: 'Hvað segja bókstafirnir (a, b, c) á teikningunum?', a: ['Hvaða rofi stýrir hvaða ljósi', 'Í hvaða röð á að tengja', 'Lit víranna', 'Stærð dósanna'], c: 0, why: 'Rofi merktur a stýrir ljósi merktu a o.s.frv.', ref: 'p1-stafir' },
    { q: 'Hvenær má spennusetja brettið?', a: ['Aðeins eftir staðfestingu kennara og með kennara', 'Þegar öll ljós eru komin í', 'Eftir eigin mælingu', 'Þegar verkefninu er lokið á réttum tíma'], c: 0, why: 'Spennusetja ALDREI án kennara. Kennarinn staðfestir, spennusett er með kennara og svo mælt.', ref: 'p1-spenna' },
    { q: 'Hvað er lausataug?', a: ['Snúran með klónni, fjölþátta og þarf hulsur', 'Einþátta vír dreginn í rör', 'Laus jarðvír í dós', 'Hlaupari milli samrofa'], c: 0, why: 'Í verkefnum 3–5 er kló tengd með hulsum á lausataug í tengidós.', ref: 'p1-klo' },
    { q: 'Hvernig er gengið frá ónotuðum dósum?', a: ['Lokað með dósaloki', 'Þær eru fjarlægðar', 'Þær eru hafðar opnar til síðari nota', 'Fylltar með einangrunarlímbandi'], c: 0, why: 'Dósalok eru í efnislistanum. Ónotaðar dósir eiga ekki að standa opnar.', ref: 'p1-dosir' },
    { q: 'Hvar tengist jarðvírinn í tengli?', a: ['Í jarðtengið', 'Með fasanum', 'Með núllinu', 'Hann er ekki tengdur í tengil'], c: 0, why: 'Fasi og núll fara í tengilinn og jörðin í jarðtengið.', ref: 'p1-tengill' },
    { q: 'Við hvaða lekastraum slær lekastraumsrofi til verndar fólki út?', a: ['30 mA', '30 A', '10 A', '3 A'], c: 0, why: 'Straumur um líkamann af stærðargráðunni 30 mA getur verið hættulegur.', ref: 'p1-straumur' },
    { q: 'Gegn hverju ver varið (öryggið) fyrst og fremst?', a: ['Yfirálagi og skammhlaupi í lögninni', 'Snertihættu fyrir fólk', 'Eldingum', 'Spennufalli'], c: 0, why: 'Varið ver lögnina. Lekastraumsrofinn ver fólk.', ref: 'p1-vor' },
    { q: 'Hver er fyrsta af fimm öryggisreglunum áður en unnið er við lögn?', a: ['Rjúfa', 'Jarðtengja og skammhleypa', 'Ganga úr skugga um spennuleysi', 'Girða af nálæga spennuhafa hluti'], c: 0, why: 'Rjúfa, tryggja gegn endurinnsetningu, ganga úr skugga um spennuleysi, jarðtengja og skammhleypa, girða af.', ref: 'p1-5reglur' },
    { q: 'Hver má bera ábyrgð á raflagnavinnu?', a: ['Löggiltur rafverktaki', 'Hver sem á réttu verkfærin', 'Húseigandinn', 'Nemi í grunndeild'], c: 0, why: 'Raflagnavinna er löggilt starf.', ref: 'p1-starf' },
    { q: 'Hvað er millilína?', a: ['Vírinn frá rofa í ljós', 'Vírarnir tveir á milli samrofa', 'Núllvírinn', 'Vírinn frá töflu í tengidós'], c: 0, why: 'Millilína fer frá rofa í ljós. Hlaupararnir eru vírarnir á milli rofa.', ref: 'p1-millilina' },
    { q: 'Hvað eru hlauparar?', a: ['Tveir vírar, eins á litinn, sem fara á milli rofa', 'Vírinn frá rofa í ljós', 'Fasi og núll í tengli', 'Jarðvírar í lausataug'], c: 0, why: 'Hlauparar eru alltaf 2 vírar, eins á litinn, á milli rofa.', ref: 'p1-hlauparar' },
    { q: 'Hvaða lit mega hlauparar EKKI hafa?', a: ['Brúnan, bláan eða gul-grænan', 'Svartan', 'Gráan', 'Þeir mega hafa hvaða lit sem er'], c: 0, why: 'Hlauparar og millilína mega vera nánast hvaða litur sem er nema brúnn, blár og gul-grænn.', ref: 'p1-hlauparar' },
    { q: 'Hvað er vippa?', a: ['Hluturinn sem fer framan á rofa', 'Ramminn í kringum tengil', 'Annað orð yfir krónurofa', 'Festing fyrir rör'], c: 0, why: 'Vippan fer framan á rofann. Ramminn er í kringum rofa og tengla.', ref: 'p1-vippa' },
    { q: 'Má nota krónurofa með öðrum rofum?', a: ['Nei', 'Já, með samrofa', 'Já, með krossrofa', 'Já, ef hlaupararnir eru eins á litinn'], c: 0, why: 'Krónurofi hefur 2 kveikingar og er ekki hægt að nota með öðrum rofum.', ref: 'p1-rofareglur' },
    { q: 'Hvernig er samrofi tengdur þegar hann er notaður sem einfaldur rofi?', a: ['Einn fasi og ein millilína', 'Einn fasi og tveir hlauparar', 'Tvær millilínur', 'Hann er ekki hægt að nota þannig'], c: 0, why: 'Sem einfaldur rofi: fasi og ein millilína. Með öðrum rofum: fasi og 2 hlauparar.', ref: 'p1-rofareglur' },
    { q: 'Hvert tengist krossrofi?', a: ['Bara í aðra rofa, aldrei beint í ljós', 'Beint í ljósið', 'Beint í tengidósina', 'Í tengil'], c: 0, why: 'Krossrofi tengist alltaf bara í aðra rofa.', ref: 'p1-rofareglur' },
    { q: 'Hvaða bil er gott frá tengidós eða beygju að fyrstu spennu?', a: ['6–8 cm', '1–2 cm', '15–20 cm', '30 cm'], c: 0, why: 'Haldið alltaf sama bili að fyrstu spennu, gott er að hafa 6–8 cm.', ref: 'p1-kap-fyrsta' },
    { q: 'Hvert á bilið milli spenna að vera?', a: ['11–20 cm, helst sem næst 15 cm', '5–8 cm', '25–30 cm', 'Það skiptir ekki máli ef kapallinn er sléttur'], c: 0, why: 'Jafnt bil, 11–20 cm. Góð regla er að halda því sem næst 15 cm.', ref: 'p1-kap-bil' },
    { q: 'Lengdin milli fyrstu og síðustu spennu er 78 cm og bilin eiga að vera 5. Hvert er bilið?', a: ['15,6 cm', '13 cm', '19,5 cm', '16 cm'], c: 0, why: '78 cm / 5 = 15,6 cm.', ref: 'p1-kap-bil' },
    { q: 'Hve langt á kápa kapalsins að ná inn í tengidós?', a: ['1 cm', 'Alls ekki inn', '5 cm', 'Alveg að tengingunni'], c: 0, why: 'Kápan á einungis að ná 1 cm inn í tengidósina. Að rafbúnaði á hún hins vegar að ná inn í búnaðinn.', ref: 'p1-kap-kapa' },
    { q: 'Hvar er lárétt kapallögn lögð á vegg?', a: ['Eins nálægt lofti og kostur er', 'Í miðri hæð', 'Rétt ofan við gólf', 'Þar sem styst er'], c: 0, why: 'Lárétta lögn skal leggja eins nálægt lofti og kostur er.', ref: 'p1-kap-lagning' },
    { q: 'Hvað er straumþol leiðara?', a: ['Sá straumur sem leiðarinn má flytja að staðaldri án þess að hitna um of', 'Spennan sem einangrunin þolir', 'Viðnám leiðarans á metra', 'Stærð varsins í töflunni'], c: 0, why: 'Straumþol er gefið í amperum og fer m.a. eftir lagnaraðferð, einangrun og fjölda álagsleiðara.', ref: 'p1-st-hvad' },
    { q: 'Straumþol 1,5 mm² koparleiðara, PVC, tveir álagsleiðarar, einangraðir leiðarar í röri á vegg (B1)?', a: ['17,5 A', '14,5 A', '19,5 A', '24 A'], c: 0, why: 'Tafla 52A.2, lína 1,5 mm², dálkur B1 = 17,5 A.', ref: 'p1-st-lesa' },
    { q: 'Sami leiðari (1,5 mm², PVC, 2 álagsleiðarar) í röri í varmaeinangruðum vegg (A1)?', a: ['14,5 A', '17,5 A', '19,5 A', '22 A'], c: 0, why: 'Varmaeinangraður veggur kælir verst, svo A1 gefur lægsta gildið: 14,5 A.', ref: 'p1-st-lesa' },
    { q: 'Straumþol 2,5 mm² koparleiðara, PVC, tveir álagsleiðarar, B1?', a: ['24 A', '19,5 A', '27 A', '17,5 A'], c: 0, why: 'Tafla 52A.2, lína 2,5 mm², dálkur B1 = 24 A.', ref: 'p1-st-lesa' },
    { q: 'Hvað gerist við straumþolið ef þrír leiðarar flytja álagsstraum í stað tveggja?', a: ['Það lækkar', 'Það hækkar', 'Það breytist ekki', 'Það tvöfaldast'], c: 0, why: 'Fleiri álagsleiðarar mynda meiri hita. 1,5 mm² í B1 fer úr 17,5 A í 15,5 A (tafla 52A.4).', ref: 'p1-st-thrir' },
    { q: 'Af hverju hefur XLPE-einangrun hærra straumþol en PVC?', a: ['Leiðarinn má verða 90 °C í stað 70 °C', 'XLPE er þykkari', 'XLPE er aðeins notað á ál', 'XLPE leiðir straum betur'], c: 0, why: 'Hámarkshiti leiðara: PVC 70 °C, XLPE/EPR 90 °C.', ref: 'p1-st-hvad' },
    { q: 'Hvaða lagnaraðferð er „strengur festur beint á trévegg“?', a: ['C', 'A1', 'B2', 'D'], c: 0, why: 'A = í röri í varmaeinangruðum vegg, B = í röri á vegg, C = strengur beint á vegg, D = í jörð.', ref: 'p1-st-adferdir' },
    { q: 'Við hvaða umhverfishita miðast straumþolstöflurnar í lofti?', a: ['30 °C', '20 °C', '0 °C', '70 °C'], c: 0, why: '30 °C í lofti og 20 °C í jörð. Leiðrétt er með stuðli úr töflu 52A.14.', ref: 'p1-st-hvad' },
    { q: 'Hvernig á að skera með hníf samkvæmt áhættumatinu?', a: ['Frá sér, ekki að sér', 'Að sér til að hafa stjórn', 'Aðeins með hanska, áttin skiptir ekki máli', 'Á lærinu'], c: 0, why: 'Hnífur: hætta á skurði, skera frá sér ekki að sér.', ref: 'p1-ahaettumat' },
    { q: 'Hvað á að nota í stað stóls til að ná upp?', a: ['Tröppu', 'Vinnuborðið', 'Kassa', 'Stól ef hann er stöðugur'], c: 0, why: 'Ekki nota stóla sem tröppu. Nota tröppu.', ref: 'p1-ahaettumat' },
    { q: 'Hvað á að nota við vinnu með vír vegna augnhættu?', a: ['Augnhlífar', 'Hjálm', 'Eyrnahlífar', 'Ekkert sérstakt'], c: 0, why: 'Í áhættumatinu er augnskaði hættan við vír, og viðbrögðin eru augnhlífar.', ref: 'p1-ahaettumat' },
    { q: 'Í hvaða númer er hringt ef slys verður?', a: ['112', '1700', '1818', '911'], c: 0, why: 'Muna að 112.', ref: 'p1-ahaettumat' },
    { sym: 'einfaldur', q: 'Hvaða tákn er þetta?', a: ['Einfaldur rofi', 'Krónurofi', 'Samrofi', 'Krossrofi'], c: 0, why: 'Lítill hringur með einu flaggi = einfaldur rofi.', ref: 'p1-takn-rofar' },
    { sym: 'krono', q: 'Hvaða tákn er þetta?', a: ['Krónurofi', 'Samrofi', 'Einfaldur rofi', 'Krossrofi'], c: 0, why: 'Tvö flögg sömu megin = krónurofi (tveir rofar í einum).', ref: 'p1-takn-rofar' },
    { sym: 'sam', q: 'Hvaða tákn er þetta?', a: ['Samrofi', 'Krónurofi', 'Krossrofi', 'Einfaldur rofi'], c: 0, why: 'Flögg í gagnstæðar áttir = samrofi.', ref: 'p1-takn-rofar' },
    { sym: 'kross', q: 'Hvaða tákn er þetta?', a: ['Krossrofi', 'Samrofi', 'Krónurofi', 'Ljós'], c: 0, why: 'Krossuð flögg = krossrofi.', ref: 'p1-takn-rofar' },
    { sym: 'tengill', q: 'Hvaða tákn er þetta?', a: ['Tengill', 'Ljós', 'Tengidós', 'Rofi'], c: 0, why: 'Bolli á staf = tengill.', ref: 'p1-takn-dos' },
    { sym: 'ljos', q: 'Hvaða tákn er þetta?', a: ['Ljós', 'Krossrofi', 'Tengill', 'Tengidós'], c: 0, why: 'Kross = ljós (lampastæði).', ref: 'p1-takn-dos' }
  ]
};

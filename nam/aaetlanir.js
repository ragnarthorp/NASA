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
   Efnið er unnið úr námsáætluninni og verkefnablöðum 1–5. Hakið sjálft vistast á verkefninu (t.checked). */
window.NAM_STUDY = {
  'rafl-p1': {
    intro: 'Próf um miðja spönn, 15% af einkunn. Það nær yfir verkefni 1–5: afeinangrun og hulsur, uppsetningu á bretti, teikningar og tákn, rofana fjóra og tengla. Öryggisatriðin úr námsáætluninni eru líka á listanum. Prófið er í kennslukerfinu og lokar kl. 12:00 á föstudag, svo það verður líklega tekið í Raflagnatímanum um morguninn (8:30–12:05).',
    how: [
      'Hafðu verkefnablöð 3, 4 og 5 fyrir framan þig. Þar eru teikningarnar sem prófið byggir líklega á.',
      'Teiknaðu fjöllínumynd eftir minni fyrir hvert verkefnablað: einn vír í einu, fasi, núll, jörð og rofavírar. Berðu hana saman við það sem þú tengdir á brettinu. Ef þú getur teiknað þessar þrjár geturðu svarað flestum spurningum um tengingar.',
      'Rektu strauminn í krossrofatengingunni (verkefni 5) í öllum rofastöðum og athugaðu að hver rofi kveiki og slökkvi óháð hinum.',
      'Farðu yfir efni verkefna 1 og 2 og öryggisatriðin. Segðu þau upphátt eða búðu til spjöld.',
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
        { id: 'p1-krono', text: 'Krónurofi (verkefni 3 og 4, rofi b/c): stýrir tveimur ljósum hvoru fyrir sig frá einum stað.', hint: 'Einn fasi inn og tveir rofavírar út, sinn að hvoru ljósi.' },
        { id: 'p1-sam', text: 'Samrofar (verkefni 4, rofar a): sama ljósið frá tveimur stöðum.', hint: 'Fasinn fer í sameiginlega tengið á öðrum rofanum, tveir víxlvírar liggja á milli rofanna og rofavírinn fer frá sameiginlega tenginu á hinum að ljósinu.' },
        { id: 'p1-kross', text: 'Krossrofar (verkefni 5): eitt ljós frá fjórum stöðum, samrofi – krossrofi – krossrofi – samrofi.', hint: 'Krossrofinn tekur tvo víxlvíra inn og tvo út og víxlar þeim. Fyrir hvern stað umfram tvo bætist einn krossrofi við.' },
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
      { title: 'Öryggi og starfið (úr námsáætlun)', items: [
        { id: 'p1-straumur', text: 'Áhrif rafstraums á líkamann.', hint: 'Það er straumurinn í gegnum líkamann sem veldur skaðanum. Um 30 mA geta verið hættuleg, og þess vegna slær lekastraumsrofi út við 30 mA.' },
        { id: 'p1-vor', text: 'Munurinn á vari (öryggi) og lekastraumsrofa.', hint: 'Varið ver lögnina gegn yfirálagi og skammhlaupi. Lekastraumsrofinn ver fólk gegn snertihættu.' },
        { id: 'p1-5reglur', text: 'Fimm öryggisreglurnar áður en unnið er við lögn.', hint: '1) Rjúfa. 2) Tryggja gegn endurinnsetningu. 3) Ganga úr skugga um spennuleysi. 4) Jarðtengja og skammhleypa. 5) Girða af eða hylja nálæga spennuhafa hluti.' },
        { id: 'p1-starf', text: 'Starf rafiðnaðarmannsins og hver ber ábyrgð á raflögnum.', hint: 'Aðeins löggiltur rafverktaki má bera ábyrgð á raflagnavinnu.' }
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

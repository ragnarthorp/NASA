// Skýrslur nemenda um skutlutilraunina (Þemadagar – Eðlisfræði, 20. október 2026).
// Nöfn nemenda eru ekki skráð hér því vefurinn er opinber; hver skýrsla er auðkennd með númeri sínu.
//
// Til að bæta við skýrslu: afritaðu eina færslu og fylltu út.
//   maelingar.timi / maelingar.vegalengd: { hefdbundin, hringlaga } með
//     gildi    – einstakar mælingar ef þær eru gefnar (annars [])
//     tala     – talan sem hópurinn notaði (meðaltal, besta kast eða eina mæling)
//     lysing   – hvað talan táknar, t.d. "meðaltal 6 kasta"
//   eining: "s", "skref" eða "hænuskref". Ef ekkert var mælt er gildið null.
//   Eigindleg niðurstaða (án mælinga) fer í "eigindlegt".
//   kaflar.<lykill>.mat: "gott" | "bæta" | "vantar"

window.SKUTLUR = {
  verkefni: "Flýgur hringlaga skutla betur en hefðbundin skutla?",
  dagsetning: "20. október 2026",

  kaflar: [
    { lykill: "tilgangur", heiti: "1. Tilgangur og rannsóknarspurning" },
    { lykill: "tilgata", heiti: "2. Tilgáta" },
    { lykill: "efni", heiti: "3. Efni og áhöld" },
    { lykill: "framkvaemd", heiti: "4. Framkvæmd" },
    { lykill: "nidurstodur", heiti: "5. Niðurstöður" },
    { lykill: "tulkun", heiti: "6. Túlkun" },
    { lykill: "umraedur", heiti: "7. Umræður" },
    { lykill: "setning", heiti: "Niðurstaða í einni setningu" }
  ],

  skyrslur: [
    {
      nr: "234",
      titill: "Skutlu-tilraunin",
      fjoldi: 7,
      betur: "Lengur í loftinu, stöðugri og fallegra flug",
      maelt: ["tími"],
      kost: "2 köst á hvora skutlu, lengri tíminn skráður",
      stadur: "Kastað af svölum",
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 5, lysing: "lengra kastið af tveimur, talið í sekúndum" },
          hringlaga: { gildi: [], tala: 20, lysing: "lengra kastið af tveimur, talið í sekúndum" }
        },
        vegalengd: null
      },
      eigindlegt: { vegalengd: "Fullyrt að hringlaga hafi farið lengra, en ekkert mælt" },
      spa: { timi: "hringlaga", vegalengd: null },
      sigurvegari: { timi: "hringlaga", vegalengd: null },
      tilgataStodst: { segja: "já", gogn: "já" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla? „Hringlaga skutlan flýr lengra vegna stærra flatarmál vængsins og minni núningsviðnám í hlutfalli við lyftikraft. Hún var lengur í loftinu og fór lengra í vegalengd.“", athugasemd: "Niðurstöður eru komnar inn í tilgangskaflann. „Betur“ er ekki skilgreint hér." },
        tilgata: { mat: "gott", texti: "Hringlótta skutlan verði lengur í loftinu, meira stöðug, eigi auðveldara með að fljúga og fljúgi á fallegri hátt en sú oddhvassa.", athugasemd: "Skýr spá, en „stöðug“ og „fallegri“ eru ekki mælanleg." },
        efni: { mat: "bæta", texti: "Blöð, iPad, límstifti.", athugasemd: "Ekki tekið fram hvernig tíminn var mældur (talið í sekúndum)." },
        framkvaemd: { mat: "gott", texti: "Gerðu 11 skutlur eftir kennslumyndbandi (7 oddhvassar, 4 kringlóttar), völdu eina af hvorri gerð af handahófi, köstuðu hvorri tvisvar af svölunum og töldu sekúndurnar. Lengri tíminn skráður.", athugasemd: "Handahófsval skutlu er gott. Aðeins tvö köst á hvora skutlu og tíminn talinn, ekki tekinn." },
        nidurstodur: { mat: "bæta", texti: "Hringlaga: 20 s á lofti. Oddhvöss: 5 s á lofti. 4 köst alls, 2 á hvora skutlu.", athugasemd: "Bara besta kastið skráð, ekki öll köst eða meðaltal." },
        tulkun: { mat: "bæta", texti: "Kringlótta skutlan var 20 sekúndur í loftinu á meðan hefðbundna skutlan var bara 5 sekúndur, „sem þýðir að kringlótta skutlan var 25% lengur í loftinu“. Hún hefur meiri flöt fyrir loftið að halda í.", athugasemd: "Reikningsvilla: 20 s er fjórfaldur tími 5 s (300% lengur), ekki 25%." },
        umraedur: { mat: "bæta", texti: "Tilgátan reyndist rétt. Áhugavert væri að kanna hvernig skutlurnar haga sér án súrefnis eða aðdráttarafls.", athugasemd: "Engin umræða um óvissu eða hvað hefði mátt gera betur." },
        setning: { mat: "gott", texti: "Hringlóttu skutlurnar flugu fallegra og lengur en oddhvössu, sem sýnir að hringlóttu skutlurnar fljúga betur." }
      },
      athugasemdir: [
        "Prósentureikningur rangur (25% í stað 300%).",
        "Fullyrt að hringlaga hafi farið lengra án þess að vegalengd væri mæld.",
        "20 s flugtími af svölum er mjög langur miðað við aðra hópa; hæðin skýrir það líklega að hluta."
      ]
    },

    {
      nr: "9843",
      titill: "Skutlutilraun",
      fjoldi: 6,
      betur: "Ekki skilgreint (skoðuðu bæði vegalengd og tíma á lofti)",
      maelt: ["tími"],
      kost: "4 köst alls, eftir nokkrar prufur",
      stadur: "Fyrst á gangi, síðan á stærra svæði",
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 3.21, lysing: "óljóst hvort það er eitt kast eða meðaltal" },
          hringlaga: { gildi: [], tala: 5.2, lysing: "óljóst hvort það er eitt kast eða meðaltal" }
        },
        vegalengd: null
      },
      eigindlegt: { vegalengd: "Hefðbundin fór lengra (metið með auga, ekki mælt)" },
      spa: { timi: null, vegalengd: "hefdbundin" },
      sigurvegari: { timi: "hringlaga", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "já", gogn: "já" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint." },
        tilgata: { mat: "gott", texti: "Hefðbundin skutla fer lengra en hringlaga skutla. Erfiðast verður að kasta hringskutlunum.", athugasemd: "Skýr og prófanleg spá, en ekki rökstudd." },
        efni: { mat: "gott", texti: "Blað, límstifti, iPad til að skrá tímann, blýantur." },
        framkvaemd: { mat: "gott", texti: "Horfðu á myndbönd og bjuggu til skutlur. Í fyrstu tilraunum á gangi fóru hringskutlurnar alltaf í vegginn, svo þau fóru á stærra svæði og fundu út hvernig á að kasta þeim. Myndskreyttar leiðbeiningar um brot hringskutlu fylgja.", athugasemd: "Góð lýsing á því hvernig aðferðin var bætt. Fjöldi kasta á hvora skutlu kemur ekki fram." },
        nidurstodur: { mat: "bæta", texti: "Hver fer lengra? Hefðbundin. Hvor er lengur í loftinu? Hringskutla. Hefðbundin: 3,21 s. Hringskutla: 5,2 s. Fjöldi tilrauna: 4.", athugasemd: "Vegalengd ekki mæld. Óljóst hvort tímarnir eru eitt kast eða meðaltal." },
        tulkun: { mat: "gott", texti: "Hringlaga skutlan er lengur á lofti en fer til hliðar og upp og niður. Hefðbundna skutlan „sker loftið“ og fer beint og lengra, en er styttri í loftinu.", athugasemd: "Reyna að útskýra muninn út frá lögun." },
        umraedur: { mat: "gott", texti: "Tilgátan reyndist rétt. Hringskutlurnar fóru í sundur í byrjun; þau límdu endana saman og þá flugu þær betur. Áhugavert væri að mæla vegalengdina miklu nákvæmar.", athugasemd: "Gott að sjá eigin veikleika (vegalengd ekki mæld nákvæmlega)." },
        setning: { mat: "gott", texti: "Hefðbundin skutla fer lengra, en hringlaga skutlan er lengur í loftinu." }
      },
      athugasemdir: [
        "Eini hópurinn sem lýsir því hvernig skutlan er brotin, með myndum.",
        "Vegalengd metin með auga en ekki mæld."
      ]
    },

    {
      nr: "321",
      titill: "Skutluskýrslan",
      fjoldi: 6,
      betur: "Hraðar (en mældu tíma á lofti)",
      maelt: ["tími"],
      kost: "2 köst á hvora skutlu, tveir kastarar",
      stadur: "Sami staður, svipaður kraftur",
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [1.26, 1.16], tala: 1.21, lysing: "meðaltal 2 kasta" },
          hringlaga: { gildi: [1.34, 1.51], tala: 1.425, lysing: "meðaltal 2 kasta" }
        },
        vegalengd: null
      },
      eigindlegt: {},
      spa: { timi: null, vegalengd: null },
      sigurvegari: { timi: "hringlaga", vegalengd: null },
      tilgataStodst: { segja: "ekki sagt", gogn: "nei" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Hvor skutlan fer hraðar? Vilja einnig skoða hvers vegna þær fljúga.", athugasemd: "Spurt um hraða en mældur var tími á lofti. Til að meta hraða þarf líka vegalengd." },
        tilgata: { mat: "gott", texti: "Hefðbundna skutlan fer hraðar því hún er mjórri og oddhvassari að framan og hefur minni loftmótstöðu. Hringlaga skutlan er breiðari og mætir meira lofti.", athugasemd: "Vel rökstudd með loftmótstöðu." },
        efni: { mat: "gott", texti: "A4 blöð, kennslumyndbönd á YouTube, skeiðklukka og hendurnar." },
        framkvaemd: { mat: "gott", texti: "Ein skutla af hvorri gerð úr eins pappír. Kastað á sama stað með svipuðum krafti, tíminn tekinn með skeiðklukku. Tveir kastarar, hvor kastaði einu sinni.", athugasemd: "Hugsað um að halda breytum föstum (sami pappír, staður, kraftur). Fá köst." },
        nidurstodur: { mat: "gott", texti: "Venjuleg: 1,26 s og 1,16 s, meðaltal 1,21 s. Hringlaga: 1,34 s og 1,51 s, meðaltal 1,425 s.", athugasemd: "Öll gildi og meðaltöl skráð. Hringlaga lengur á lofti í báðum köstum." },
        tulkun: { mat: "bæta", texti: "„En af hverju er munur?“ Túlkunin er sett fram í myndrænum spjöldum: lögun hefur áhrif á loftmótstöðu, lyftikraft, stöðugleika og hraða.", athugasemd: "Enginn eiginn texti; spjöldin virðast gervigreindarunnin. Ekki rætt hvort tilgátan um hraða stóðst." },
        umraedur: { mat: "bæta", texti: "„Tilgátan okkar var að hringlaga skutlan yrði lengur á lofti.“ Áhugavert væri að kanna fleiri gerðir af skutlum.", athugasemd: "Stangast á við tilgátukaflann (hefðbundin hraðari). Ekki sagt hvort tilgátan stóðst." },
        setning: { mat: "bæta", texti: "Það er greinilegur munur á skutlunum og opið á skutlunni hafði gríðarleg áhrif á flugtíma.", athugasemd: "Of sterkt orðað: munurinn er um 0,2 s eftir aðeins tvö köst á hvora." }
      },
      athugasemdir: [
        "Rannsóknarspurning (hraði), tilgáta og mæling (tími á lofti) passa ekki saman.",
        "Tilgáta sett fram á tvo ólíka vegu í skýrslunni.",
        "Túlkun að mestu í myndum sem virðast gerðar með gervigreind."
      ]
    },

    {
      nr: "444",
      titill: "Skutlu tilraun",
      fjoldi: 6,
      betur: "Lengri tími á flugi og lengri vegalengd",
      maelt: ["tími", "vegalengd"],
      kost: "6 köst með hefðbundinni, 7 með hringlaga",
      stadur: "Á gangi",
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [2.12, 1.88, 1.38, 1.48, 1.51, 1.26], tala: 1.605, lysing: "meðaltal 6 kasta" },
          hringlaga: { gildi: [2.09, 0.66, 1.06, 1.16, 1.13, 1.31, 2.03], tala: 1.35, lysing: "meðaltal 7 kasta" }
        },
        vegalengd: {
          eining: "skref",
          hefdbundin: { gildi: [12, 4, 10, 7, 8, 8.5], tala: 8.25, lysing: "meðaltal 6 kasta" },
          hringlaga: { gildi: [2, 2, 1, 2, 2.5, 1, 0.2], tala: 1.5, lysing: "meðaltal 7 kasta" }
        }
      },
      eigindlegt: {},
      spa: { timi: "hringlaga", vegalengd: "hringlaga" },
      sigurvegari: { timi: "hefdbundin", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "nei", gogn: "nei" },
      kaflar: {
        tilgangur: { mat: "gott", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla? Með tilliti til tíma á flugi og vegalengdar sem skutlan ferðaðist.", athugasemd: "Eini hópurinn sem skilgreinir „betur“ beint í rannsóknarspurningunni." },
        tilgata: { mat: "gott", texti: "Hringlaga skutlan flýgur betur þar sem hún hleypir meira lofti í gegnum sig; loftið streitist meira gegn venjulegu skutlunni.", athugasemd: "Rökstudd tilgáta." },
        efni: { mat: "gott", texti: "A4 blöð, límstifti, iPad." },
        framkvaemd: { mat: "gott", texti: "Tvær gerðir skutlna eftir myndbandi. Kastað á gangi, hefðbundinni 6 sinnum og hringlaga 7 sinnum. Tími á flugi tekinn og vegalengd mæld í skrefum. Meðaltal reiknað.", athugasemd: "Flest köst allra hópa og bæði tími og vegalengd mæld." },
        nidurstodur: { mat: "gott", texti: "Meðaltími: hringlaga 1,35 s, hefðbundin 1,605 s. Meðalvegalengd: hringlaga 1,5 skref, hefðbundin 8,25 skref. Hefðbundin var bæði lengur á flugi og flaug lengra.", athugasemd: "Öll gildi og útreikningar sýndir á handskrifuðu blaði. Útreikningar réttir (vegalengd hringlaga er 1,53 skref)." },
        tulkun: { mat: "bæta", texti: "„Hér má sjá helstu útreikninga tilraunarinnar“ ásamt mynd af útreikningum.", athugasemd: "Útreikningar sýndir en engin skýring á því hvers vegna hefðbundna skutlan flaug betur." },
        umraedur: { mat: "gott", texti: "Tilgátan reyndist röng. Kom á óvart hve miklu betri hefðbundna skutlan var. Voru ekki viss um hvernig best væri að kasta hringlaga skutlunni og myndu næst gefa sér meiri tíma í að finna það út.", athugasemd: "Heiðarlegt mat á eigin aðferð og raunhæf hugmynd að framhaldi." },
        setning: { mat: "gott", texti: "Venjuleg skutla flýgur betur en hringlaga skutla." }
      },
      athugasemdir: [
        "Ítarlegustu mæligögnin: öll köst skráð og meðaltöl reiknuð rétt.",
        "Eini hópurinn þar sem tilgátan stóðst ekki – og hópurinn segir það skýrt."
      ]
    },

    {
      nr: "832",
      titill: "Skutlutilraun",
      fjoldi: 5,
      betur: "Ekki skilgreint (vegalengd og tími á lofti)",
      maelt: ["tími", "vegalengd"],
      kost: "Kemur ekki fram",
      stadur: "Á gangi",
      maelingar: {
        timi: {
          eining: "s",
          hefdbundin: { gildi: [], tala: 2.66, lysing: "„2 sekúndur og 66 sekúndubrot“" },
          hringlaga: { gildi: [], tala: 1.09, lysing: "„1 sekúnda og 9 sekúndubrot“" }
        },
        vegalengd: {
          eining: "hænuskref",
          hefdbundin: { gildi: [], tala: 35, lysing: "eitt gildi" },
          hringlaga: { gildi: [], tala: 6, lysing: "eitt gildi" }
        }
      },
      eigindlegt: {},
      spa: { timi: null, vegalengd: "hefdbundin" },
      sigurvegari: { timi: "hefdbundin", vegalengd: "hefdbundin" },
      tilgataStodst: { segja: "já", gogn: "að hluta" },
      kaflar: {
        tilgangur: { mat: "bæta", texti: "Flýgur hringlaga skutla betur en hefðbundin skutla?", athugasemd: "Spurning úr sniðmátinu óbreytt; „betur“ ekki skilgreint." },
        tilgata: { mat: "gott", texti: "Venjulega skutlan fer lengra því hún er oddhvöss og sker loftið. Hringskutlan safnar svo miklu lofti að hún fer hægar.", athugasemd: "Rökstudd tilgáta um vegalengd." },
        efni: { mat: "gott", texti: "Blöð og iPad (tímaklukka og myndavél)." },
        framkvaemd: { mat: "bæta", texti: "Bjuggu til skutlur eftir myndböndum á Classroom, köstuðu þeim eftir ganginum og mældu hversu langt þær fóru og hversu lengi þær voru í loftinu.", athugasemd: "Ekki tekið fram hversu oft var kastað eða hvernig vegalengd var mæld." },
        nidurstodur: { mat: "bæta", texti: "Vegalengd: venjuleg 35 hænuskref, hringlaga 6 hænuskref. Tími á lofti: venjuleg 2,66 s, hringlaga 1,09 s.", athugasemd: "Eitt gildi á hvora skutlu; óljóst hvort það er eitt kast eða meðaltal." },
        tulkun: { mat: "bæta", texti: "Lögun og kastkraftur hafa áhrif. Hringskutlan er breið með gat í miðjunni og fer því styttra „og er mun lengur í loftinu“. Venjulega skutlan sker loftið og kemst hraðar.", athugasemd: "Segir hringskutluna lengur á lofti, en þeirra eigin mæling sýnir hið gagnstæða (1,09 s á móti 2,66 s)." },
        umraedur: { mat: "bæta", texti: "Tilgátan var að venjulega skutlan færi lengra og hringskutlan væri lengur í loftinu; hún reyndist rétt. Áhugavert væri að kasta af þaki skólans.", athugasemd: "Bætir við spá um tíma sem var ekki í tilgátukaflanum. Gögnin styðja bara vegalengdarhlutann." },
        setning: { mat: "bæta", texti: "Venjulega skutlan fór lengra og hringskutlan var lengur í loftinu.", athugasemd: "Seinni hlutinn stangast á við mælingarnar." }
      },
      athugasemdir: [
        "Ályktun um tíma á lofti stangast á við eigin mælingar.",
        "Tilgátan í umræðukafla er víðari en í tilgátukafla."
      ]
    }
  ]
};

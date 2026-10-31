# Vaktaplan

Vefur til að útbúa vaktaplan fyrir vinnustað. Hreint HTML/CSS/JavaScript sem keyrir í vafra án netþjóns. Opnaðu `vaktaplan/index.html`, eða hýstu möppuna (t.d. á GitHub Pages). PDF-safnið og leturgerðirnar eru sóttar úr `../vendor/`.

**Vaktatímabil:** 16. hvers mánaðar til 15. næsta mánaðar.

## Skrefin

1. **Grunnur:** vinnustaður, tímabil, vinnustundir á viku í 100% starfi, reglur (lágmarkshvíld, hámark vinnudaga í röð, hve langt má fara yfir vinnuskyldu, hvort óskir um frí eru bindandi, uppfylling vinnuskyldu) og tímamörk og álagsprósentur.
2. **Vaktir:** sjálfgefið er fast vaktaskipulag:
   - **Virkir dagar:** 1×8–13 (3 á fimmtudögum), 1×8–16, 1×9–16, 1×14–21 og 2×16–23.
   - **Helgar:** 2×9–16, 1×12–20 og 2×16–23.
   - **Nætur:** 23–08, en 23–09 aðfaranótt laugardags og sunnudags.

   Hverri vakt fylgir, heiti, tími, ógreitt hlé, litur, flokkur (tengir vaktina við óskir starfsfólks), „telst sem“ (afbrigði, t.d. 08–13, sem telst með aðalvaktinni í mönnun) og mönnunarþörf fyrir hvern vikudag, rauða daga og stórhátíðardaga. Hámark á vakt er valfrjálst. Vakt sem lýkur fyrir upphafstíma nær yfir miðnætti og telst til upphafsdagsins.
3. **Starfsfólk:** innbyggður starfsmannalisti sem fylgir öllum tímabilum. Smellt er á starfsmann til að breyta:
   - **Starfshlutfall og staða:** í starfi, **tímavinna** (tilfallandi tímar, ekki í vaktaplani) eða í leyfi (ekki í vaktaplani).
   - **Breytingar frá dagsetningu:** t.d. „úr 30% í tímavinnu frá 15.11.“ Vinnuskyldan reiknast dag fyrir dag eftir hlutfallinu sem gildir hverju sinni.
   - **Óskir um vaktir:** fyrir hvern flokk (morgunvaktir, kvöldvaktir, morgunvaktir um helgar, millivaktir um helgar, kvöldvaktir um helgar og næturvaktir) er valið **Helst**, **Má** eða **Ekki**.
   - **Forgangur** (hár, venjulegur eða lágur) ræður þegar óskir rekast á.
   - **Föst vakt:** starfsmaður fær vaktina alla daga sem hún er í boði, nema annað sé ákveðið (t.d. sjúkraliði á 8–16).
   - **Hámark helga** á tímabili og **hámark vinnudaga í röð**.
   - Staðan **Ekki á vaktaplani** er t.d. fyrir forstöðumann.
   - Vikustundir (t.d. 40 fyrir dagvinnu), föst vinnuskylda, flutt staða og vikudagar sem viðkomandi vinnur ekki.

   Hægt er að líma inn lista (`Nafn; hlutfall; starfsheiti`, þar sem hlutfallið má vera 80, 80%, 0,8 eða TV). Listinn sýnir vinnuskyldu, tíma á vöktum og **útistandandi tíma** fyrir hvern starfsmann.
4. **Hátíðis- og rauðir dagar:** íslenskir frídagar eru merktir sjálfkrafa og flokkaðir sér:
   - **Stórhátíðardagar (★):** nýársdagur, föstudagurinn langi, páskadagur, hvítasunnudagur, 17. júní, aðfangadagur frá kl. 12, jóladagur og gamlársdagur frá kl. 12.
   - **Rauðir dagar:** skírdagur, annar í páskum, sumardagurinn fyrsti, 1. maí, uppstigningardagur, annar í hvítasunnu, frídagur verslunarmanna og annar í jólum.
   Hægt er að breyta hvaða degi sem er, gefa honum heiti og láta hann gilda frá ákveðnum tíma.
5. **Óskir og fjarvistir:** ósk um frí, ósk um ákveðna vakt og fjarvistir (orlof, veikindi, námskeið, launalaust leyfi og eigin tegundir) á dagabili.
6. **Vaktaplan:** smelltu á dag í hausnum til að breyta vöktum þess dags: fjölda á hverri vakt, eða tilfallandi vakt með eigin tíma. **Innlestur á vaktaóskum** (eða fastra vakta) úr CSV- eða Excel-skjali (ein lína á starfsmann, einn dálkur á dag eins og „16.11 mán.“, reitir eins og „08:00-16:00“). Tímabilið er lesið úr skjalinu ef það er tilgreint. Innlesnar vaktir læsast, ný afbrigði vakta verða til sjálfkrafa og nýir starfsmenn bætast á listann. **Árekstrar í óskum** birtast strax í spjaldi fyrir ofan töfluna, án röðunar:
   - **Fleiri óskir en pláss:** fleiri óska eftir vakt en laus pláss eru, að teknu tilliti til fastra og læstra vakta.
   - **Vakt ekki í boði:** óskuð vakt er ekki í boði þann dag.
   - **Brot á reglum eða forsendum:** ósk brýtur reglu eða forsendu starfsmanns, t.d. „Ekki“, hvíldartíma, vinnudaga í röð, hámark helga, óskir umfram vinnuskyldu, tímavinnu eða leyfi.

   Hægt er að bregðast við hverjum árekstri beint: **Veita** (vaktin sett inn læst), **Hafna**, **Færa á** aðra vakt með laust pláss, **+1 pláss**, breyta vöktum dagsins eða opna starfsmannablaðið. Árekstrar eru líka merktir í töflunni (⚠ í haus og mönnunarlínu, brotinn rammi um óskina). **Manna allar lausar vaktir** fyllir í ómannaðar vaktir með lausu starfsfólki án þess að breyta því sem er komið. Ef ekki tekst að manna innan vinnuskyldu er leyft að fara umfram hana (aukatími). Til að losa **óheppilega vakt** er smellt á hana og valið **Raða aftur án þessarar vaktar**. Shift- eða Ctrl-smellur, eða „Velja fleiri…“, velur nokkrar í einu. Vaktin er tekin af viðkomandi, hann er bannaður á henni („Hreinsa bönn“ fjarlægir það) og losuðu plássin fá annað laust starfsfólk, en öðru er ekki breytt. **Uppfylltar óskir eru fastar** og eru aldrei færðar við endurröðun eða uppstokkun. Til að breyta þeim þarf að „Hafna ósk“. Síðan kemur sjálfvirk röðun og handvirkar breytingar í töflu (smella á reit eða slá inn kóða). Handvirkar vaktir læsast og haldast þegar raðað er aftur. Neðst sést mönnun á móti þörf (smelltu til að breyta þörf einstaks dags) og listi yfir athugasemdir.
7. **Útreikningar:** vinnuskylda, unnar stundir, fjarvistir, mismunur og staða fyrir hvern starfsmann, skipting í dagvinnu, kvöld, nætur, helgar, rauða daga og stórhátíðir, álagsstundir og fjöldi vakta eftir tegund.
8. **Útgáfa:** PDF fyrir allt planið, vikuplan (eina viku eða allar) og einstaklingsplan (einn eða alla), JSON fyrir öll gögnin eða valda viku eða starfsmann, og nýtt tímabil sem tekur stöðu starfsfólks með sér.

## Útreikningar

- **Vinnuskylda** = (virkir dagar mán–fös − frídagar á virkum degi) × (vikustundir ÷ 5) × starfshlutfall. Dagur sem gildir frá hádegi telst hálfur. Hægt er að slökkva á lækkun vegna frídaga.
- **Fjarvistir** sem teljast til vinnuskyldu reiknast sem (vikustundir ÷ 5) × starfshlutfall fyrir hvern virkan dag.
- **Unnar stundir** eru flokkaðar eftir tíma og degi. Stórhátíð og rauður dagur ganga framar helgum, og helgar ganga framar dagvinnu, kvöldi og nótt. Vakt sem nær yfir miðnætti er flokkuð eftir þeim degi sem hver klukkustund fellur á.
- **Álagsstundir** = Σ stundir í flokki × álagsprósenta flokks.
- **Útistandandi** = vinnuskylda − (unnið + fjarvistir). Jákvæð tala eru tímar sem á eftir að raða, neikvæð tala tímar umfram vinnuskyldu.
- **Staða** = (unnið + fjarvistir − vinnuskylda) + flutt staða.
- Vinnuskylda reiknast fyrir hvern virkan dag eftir starfshlutfalli þann dag. Dagar í tímavinnu eða leyfi gefa enga vinnuskyldu.

## Sjálfvirk röðun

Röðunin fer fram í þremur skrefum: 1) **fastar vaktir**, 2) **óskir um vaktir**, og ef fleiri óska eftir sömu vakt en pláss er ræður forgangur og síðan hver hefur fengið hlutfallslega fæstar óskir uppfylltar, 3) **það sem eftir er**. Í þriðja skrefinu fer röðunin í gegnum tímabilið dag fyrir dag og setur á hverja vakt þann starfsmann sem á mest eftir af vinnuskyldu sinni hlutfallslega, og tekur þá tillit til „Helst/Má/Ekki“. Um leið virðir hún reglurnar: leyfðar vaktir, vikudaga sem starfsmaður vinnur ekki, fjarvistir, óskir, lágmarkshvíld, hámark vinnudaga í röð og hámark yfir vinnuskyldu. Hún jafnar líka helgar og nætur eftir starfshlutfalli, heldur helgum saman og forðast staka frídaga. Nokkur hundruð útgáfur eru prófaðar með mismunandi slembiþáttum og sú besta valin. Þar vega ómannaðar vaktir þyngst, síðan óuppfylltar óskir og ójöfn dreifing uppfylltra óska. Læstar vaktir og fjarvistir haldast óbreyttar.

## Skrár

- `index.html`, `style.css`
- `js/engine.js`: dagsetningar, íslenskir frídagar, vinnuskylda, flokkun stunda, röðun og yfirferð (hrein föll sem má keyra í Node)
- `js/defaults.js`: sjálfgefnar reglur og sýnidæmi
- Valfrjáls skrá með fleiri sýnidæmum (t.d. `js/sample-nov.js`) getur skráð sig í `window.VP_SAMPLES` og birtist þá í valinu „Hlaða sýnidæmi“. Excel-innlestur sækir [SheetJS](https://sheetjs.com) 0.18.5 af cdnjs þegar þarf.
- `js/app.js`: viðmót
- `js/pdf.js`: PDF-útgáfa (jsPDF)

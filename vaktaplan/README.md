# Vaktaplan

Vefur til að útbúa vaktaplan fyrir vinnustað. Hreint HTML/CSS/JavaScript sem keyrir í vafra án netþjóns. Opnaðu `vaktaplan/index.html`, eða hýstu möppuna (t.d. á GitHub Pages). PDF-safnið og leturgerðirnar eru sóttar úr `../vendor/`.

**Vaktatímabil:** 16. hvers mánaðar til 15. næsta mánaðar.

## Skrefin

1. **Grunnur:** vinnustaður, tímabil, vinnustundir á viku í 100% starfi, reglur (lágmarkshvíld, hámark vinnudaga í röð, hve langt má fara yfir vinnuskyldu, hvort óskir um frí eru bindandi, uppfylling vinnuskyldu) og tímamörk og álagsprósentur.
2. **Vaktir:** kóði, heiti, tími, ógreitt hlé, litur og mönnunarþörf fyrir hvern vikudag, rauða daga og stórhátíðardaga. Hámark á vakt er valfrjálst. Vakt sem lýkur fyrir upphafstíma nær yfir miðnætti og telst til upphafsdagsins.
3. **Starfsfólk:** nafn, starfsheiti, starfshlutfall, föst vinnuskylda (valfrjálst), leyfðar vaktir, vikudagar sem starfsmaður vinnur ekki og flutt staða frá fyrra tímabili. Hægt er að líma inn lista úr Excel.
4. **Hátíðis- og rauðir dagar:** íslenskir frídagar eru merktir sjálfkrafa og flokkaðir sér:
   - **Stórhátíðardagar (★):** nýársdagur, föstudagurinn langi, páskadagur, hvítasunnudagur, 17. júní, aðfangadagur frá kl. 12, jóladagur og gamlársdagur frá kl. 12.
   - **Rauðir dagar:** skírdagur, annar í páskum, sumardagurinn fyrsti, 1. maí, uppstigningardagur, annar í hvítasunnu, frídagur verslunarmanna og annar í jólum.
   Hægt er að breyta hvaða degi sem er, gefa honum heiti og láta hann gilda frá ákveðnum tíma.
5. **Óskir og fjarvistir:** ósk um frí, ósk um ákveðna vakt og fjarvistir (orlof, veikindi, námskeið, launalaust leyfi og eigin tegundir) á dagabili.
6. **Vaktaplan:** sjálfvirk röðun og handvirkar breytingar í töflu (smella á reit eða slá inn kóða). Handvirkar vaktir læsast og haldast þegar raðað er aftur. Neðst sést mönnun á móti þörf (smelltu til að breyta þörf einstaks dags) og listi yfir athugasemdir.
7. **Útreikningar:** vinnuskylda, unnar stundir, fjarvistir, mismunur og staða fyrir hvern starfsmann, skipting í dagvinnu, kvöld, nætur, helgar, rauða daga og stórhátíðir, álagsstundir og fjöldi vakta eftir tegund.
8. **Útgáfa:** PDF fyrir allt planið, vikuplan (eina viku eða allar) og einstaklingsplan (einn eða alla), JSON fyrir öll gögnin eða valda viku eða starfsmann, og nýtt tímabil sem tekur stöðu starfsfólks með sér.

## Útreikningar

- **Vinnuskylda** = (virkir dagar mán–fös − frídagar á virkum degi) × (vikustundir ÷ 5) × starfshlutfall. Dagur sem gildir frá hádegi telst hálfur. Hægt er að slökkva á lækkun vegna frídaga.
- **Fjarvistir** sem teljast til vinnuskyldu reiknast sem (vikustundir ÷ 5) × starfshlutfall fyrir hvern virkan dag.
- **Unnar stundir** eru flokkaðar eftir tíma og degi. Stórhátíð og rauður dagur ganga framar helgum, og helgar ganga framar dagvinnu, kvöldi og nótt. Vakt sem nær yfir miðnætti er flokkuð eftir þeim degi sem hver klukkustund fellur á.
- **Álagsstundir** = Σ stundir í flokki × álagsprósenta flokks.
- **Staða** = (unnið + fjarvistir − vinnuskylda) + flutt staða.

## Sjálfvirk röðun

Röðunin fer í gegnum tímabilið dag fyrir dag og setur á hverja vakt þann starfsmann sem á mest eftir af vinnuskyldu sinni hlutfallslega. Um leið virðir hún reglurnar: leyfðar vaktir, vikudaga sem starfsmaður vinnur ekki, fjarvistir, óskir, lágmarkshvíld, hámark vinnudaga í röð og hámark yfir vinnuskyldu. Hún jafnar líka helgar og nætur eftir starfshlutfalli, heldur helgum saman og forðast staka frídaga. Nokkur hundruð útgáfur eru prófaðar með mismunandi slembiþáttum og sú besta valin, þar sem ómannaðar vaktir vega þyngst. Læstar vaktir og fjarvistir haldast óbreyttar.

## Skrár

- `index.html`, `style.css`
- `js/engine.js`: dagsetningar, íslenskir frídagar, vinnuskylda, flokkun stunda, röðun og yfirferð (hrein föll sem má keyra í Node)
- `js/defaults.js`: sjálfgefnar reglur og sýnidæmi
- `js/app.js`: viðmót
- `js/pdf.js`: PDF-útgáfa (jsPDF)

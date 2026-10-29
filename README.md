# NASA · Skólanámskrá

Vefur til að hanna skólanámskrá NASA (náttúrufræði- og samfélagsgreinar í 8.–10. bekk Norðlingaskóla).

Vefurinn er hreinn HTML/CSS/JavaScript og þarf hvorki netþjón né nettengingu. Opnaðu `index.html` í vafra, eða hýstu möppuna, til dæmis á GitHub Pages.

## Skrefin

1. **Grunnur:** heiti, skóli og þriggja ára tímabil. Hér er líka hægt að opna vistaða námskrá (JSON) og byrja á grunni sem þegar hefur verið saminn.
2. **Um kennsluna:** almennar upplýsingar í köflum sem má breyta (samkennsla 60/40, þemu, val nemenda, hækkunar- og rannsóknarverkefni, agað bóklegt nám).
3. **Hæfniflokkar:** flokkarnir níu (sameiginlegur kjarni og dýpkun), markmið um vægi (samtals 100%) og hlutfall greinasviða. Smelltu á flokk til að sjá yfirflokka og hæfniviðmið aðalnámskrár sem honum tilheyra og til að bæta viðfangsefni við þema.
4. **Þemu:** áherslulínur í hæfniflokkum, tengdar hæfniviðmiðum. Hver lína hefur vægi (×0,5–×3, sjálfgefið ×1) sem ræður hlut hennar í þemanu. Smellt er á sneið í þemamyndinni til að bæta við línu. Hvert þema má sækja sér sem PDF eða JSON.
5. **Verkefni:** banki hækkunarverkefna (1–3 stig) og rannsóknarverkefna.
6. **Námsmat:** B-próf (D, C, C+, B), forgjöf 8. og 9. bekkjar, hækkunarstig og A-próf, lokaeinkunn úr 10. bekk (vegið meðaltal þemaeinkunna: D=4, C=5, C+=6, B=7, B+=8, A=9; 10 fyrir framúrskarandi rannsóknarverkefni) og stuðningsúrræði, ásamt reiknivélum.
7. **Jafnvægi:** vægi hæfniflokka vegið með vikufjölda yfir þriggja ára tímabil, borið saman við markmið, og þekja hæfniviðmiða.
8. **Útgáfa:** gátlisti, PDF-skjal og JSON-skrá.

## Vistun

- Vinnan vistast sjálfkrafa í vafranum (`localStorage`).
- **Sækja JSON** vistar alla námskrána í eina skrá. **Opna skrá** les hana aftur inn. Einnig má draga skrá inn á síðuna.
- Þemaskrár og safnafrit úr eldri þemamyndavefnum (útgáfu 4) má flytja inn sem þemu. Flokkurinn „Mannvera, heilsa og sjálfsmynd“ verður þá „Lífið, heilsa og sjálfsmynd“.

## Markdown

Textareitir styðja markdown og það birtist eins á vefnum og í PDF: `**feitt**`, `*skáletrað*`, `~~yfirstrikað~~`, `` `kóði` ``, `[tengill](https://…)`, fyrirsagnir (`#`, `##`, `###`), punktalista og tölusetta lista (undirlistar með inndrætti), tilvitnanir (`>`), lárétta línu (`---`) og kóðablokkir (```` ``` ````). Línuskil innan efnisgreinar haldast.

## Skrár

- `index.html`, `css/style.css`
- `js/curriculum.js`: hæfniviðmið við lok 10. bekkjar úr aðalnámskrá (22. og 24. kafla) og vörpun yfirflokka á hæfniflokka NASA
- `js/defaults.js`: hæfniflokkar NASA, sjálfgefinn texti, námsmatsreglur og sýnidæmi
- `js/markdown.js`: markdown-þáttari sem vefurinn og PDF-skjalið nota bæði
- `js/app.js`: viðmót og útreikningar
- `js/pdf.js`: PDF-útgáfa
- `vendor/jspdf.umd.min.js`: [jsPDF](https://github.com/parallax/jsPDF) 2.5.1 (MIT-leyfi)
- `vendor/pdf-fonts.js`: leturgerðir fyrir PDF, hlutmengi úr Liberation Sans/Mono (SIL Open Font License, sjá `vendor/pdf-fonts-LICENSE.txt`)

## Skýrslusmiðja farartækja

`skyrsla/index.html` er sjálfstæður vefur fyrir nemendur í vísindasmiðjunni (farartæki: siglt með farm, flug og lending, nákvæm ferð niður stiga). Hópurinn svarar ítarlegum spurningum í 12 skrefum (tilgangur, tilgáta, hönnun, efni, framkvæmd, prófanir, túlkun, umræður, samvinna, frágangur, sjálfsmat) og fær í lokin uppsetta skýrslu sem má prenta eða vista sem PDF.

- Hjálp við hverja spurningu: leiðbeiningar, setningabyrjanir, orðamælir og dæmi úr fyrirmyndarskýrslu.
- Tilraunatafla reiknar árangur (x af 10) og valin eðlisfræðihugtök verða að spurningum í túlkuninni.
- Myndir af hópnum, skissum og smíðinni fara á rétta staði. Þar sem mynd vantar stendur t.d. „[Setjið mynd af hópnum hér]“.
- **Ekki er hægt að prenta skýrsluna fyrr en mynd af lokaafurðinni og mynd af stöðinni eftir frágang eru komnar inn.**
- Vinnan vistast í vafranum (IndexedDB). „Vista afrit“ sækir allt, líka myndir, í eina skrá sem má opna á annarri tölvu.

## Draugahúsið

`draugahus/index.html` er gagnvirkt draugahús á þremur hæðum (efri hæð, jarðhæð, kjallari). Í byrjun er aðeins jarðhæðin opin, og þar aðeins eldhúsið. Hvert herbergi hefur þraut og þegar hún er leyst opnast næstu herbergi og að lokum næsta hæð. Læstar hæðir eru daufar og óskýrar.

- `draugahus/hus.js`: hæðir, herbergi (marghyrningar í pixlum myndanna), reglur um hvað opnar hvað (`krefst`) og þrautirnar (orð, tala eða fjölval, með vísbendingu).
- `draugahus/utvarp.js`: útvarpsþrautin í eldhúsinu. Fimm lagbútar (`draugahus/hljod/`) opnast einn af öðrum og nemendur raða heiti hvers lags úr stafaflísum. Hægt er að spila bútinn aftur eða láta hann endurtaka sig, og eftir rangt svar verða flísar á réttum stað grænar. Eftir tvær rangar tilraunir birtist flytjandinn.
- `draugahus/stafarod.js`: þrautin í borðstofunni. Hljóð spilast og nemendur smella á stafina í svarinu í réttri röð. Réttur stafur verður grænn, en rangur stafur þýðir að byrja upp á nýtt.
- `draugahus/skotleikur.js`: „Skjóttu Trójumenn!“ í Salnum. Nöfn falla niður og bogmaður skýtur örvum þvert á fallið. Teljarinn byrjar í 10, lækkar um einn fyrir hvern Trójumann og hækkar um einn fyrir Grikki og guði. Eftir þrjú röng skot byrjar leikurinn upp á nýtt.
- `draugahus/ordla.js`: Wordle í Sandvík með íslensku lyklaborði. Slembiorð er valið úr listanum og ef sex tilraunir duga ekki kemur nýtt orð.
- `draugahus/hengilas.js`: hengilás í Hádegismóum með átta talnahjólum (0–9) og tengli á verkefni í Google Classroom. Rétta talnarunan opnar efri hæðina. Hún er geymd sem fingrafar en ekki sem texti. Nýtt fingrafar fæst í vafranum með `THRAUTIR.hengilas.fingrafar('12345678')`.
- `draugahus/rodun.js`: röðunarþrautir í Móum. Þrjár þrautir í röð með fimm hjólum, og á hverju hjóli eru allir svarmöguleikarnir. Þegar röðin er rétt verður ljós þrautarinnar grænt.
- `draugahus/skeidklukka.js`: skeiðklukka í Melum. Nemendur stöðva hana eftir nákvæmlega 10,00 sekúndur án þess að sjá tímann. Svindlkóði frá kennara opnar herbergið líka. Hann er geymdur sem fingrafar, eins og lykill lássins.
- `draugahus/sjoorrusta.js`: sjóorrusta á Svölum á 5×5 borði, með einu tveggja reita skipi og einu eins reits skipi. Skip mega ekki snertast, ekki heldur á horn. Tölvan sér ekki skip leikmannsins. Hún velur skot í hlutfalli við hve mörg skip geta enn legið yfir hverjum reit og eltir skip sem hún hefur hitt.
- `draugahus/myndagata.js`: myndagáta í Mýri. Póstkort af París, New York eða London birtist í 24 slembibútum á 10 sekúndum. Ef tíminn rennur út kemur annað póstkort. Hástafir, broddar og bil skipta ekki máli í svörum.
- `draugahus/enigma.js` og `draugahus/enigmathraut.js`: dulmálsvél í Hátúni. Hún er Enigma I með snúðum I–V, endurkastara B eða C, hringstillingum, upphafsstöðu og tengiborði. Nemendur líma inn dulmálið og vélin skilar textanum, með snúðum sem snúast og ljósaborði. Þegar rétti textinn er kominn eiga nemendur að leyfa kennara að heyra söguna. Kennarinn gefur þeim þá kóða sem opnar kjallarann. Textinn og kóðinn eru geymdir sem fingraför.
- `draugahus/draugahus.js`: vélin sem teiknar, læsir og opnar. Framvinda vistast í vafranum (`localStorage`).
- `draugahus/index.html?allt` opnar öll herbergi til að prófa.
- **Kennaralykill:** smelltu fimm sinnum hratt á heiti herbergis (í glugga þess) og sláðu inn kennaralykilinn. Þá er herbergið leyst. Fimm smell á titilinn „Draugahúsið“ efst opna kennaraspjald þar sem leysa má einstök herbergi, heilar hæðir eða allt húsið. Lykillinn er geymdur sem fingrafar í `hus.js` (`kennaralykill`). Eftir að hann hefur verið sleginn inn einu sinni þarf ekki að slá hann inn aftur fyrr en síðan er endurhlaðin.

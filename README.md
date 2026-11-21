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

## Annars stigs jöfnur (STÆ2AH, kafli 7)

`annars-stigs/index.html` er sjálfstæður æfingarvefur. Kjarninn er **algebruvél**: liðir eru dregnir yfir = (formerkið snýst), tala fyrir framan sviga er dregin inn í hann, svigi er dreginn á annan sviga (hver liður við hvern), líkir liðir eru dregnir saman, og hægt er að velja liði og taka út fyrir sviga. Hvert skref skráist sem lína „á blaði“ með merki af formúlublaðinu (Þ1, Þ2, Þ3, A1).

1. **Hvað er annars stigs jafna?** Einkennið x², x² = k á grafi (af hverju ±), fleygbogi með sleðum (0, 1 eða 2 lausnir) og þrjú stig af „þekktu hana í sjón“.
2. **Raðaðu á staðalform** í vélinni, í öruggum skrefum: færa yfir =, sameina, raða, svigar, mínus fyrir framan sviga, svigi í öðru veldi, tveir svigar, A mínus, allt saman og eigið dæmi. Ný slembidæmi fást með „+ Nýtt dæmi“.
3. **A, B og C:** lesa af með formerkjum, liður sem vantar, og raða fyrst og lesa svo af.
4. **Lausnarformúlan:** sýnidæmi skref fyrir skref, reikna D (A2) og hvað það segir, lausnarformúlan (A3) í föstum skrefum (A, B, C → D → √D → −B og 2A → x), ein lausn eða engin, brot og liðir sem vantar, og allt saman frá óraðaðri jöfnu. Innsetning í D og formúluna er dregin (draga og sleppa), útreikningar eru slegnir inn; endurgjöf er sniðna að formerkjavillum, sér lausnirnar á fleygboganum og prófar þær með því að setja inn í jöfnuna.

Framvinda vistast í vafranum (`localStorage`).

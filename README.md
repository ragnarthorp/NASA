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
4. **Lausnarformúlan:** sýnidæmi skref fyrir skref, reikna D (A2) og hvað það segir, lausnarformúlan (A3) í föstum skrefum (A, B, C → D → √D → −B og 2A → x), ein lausn eða engin, brot og liðir sem vantar, og allt saman frá óraðaðri jöfnu. Innsetning í D og formúluna er dregin (draga og sleppa). D er reiknað í röð aðgerða: veldi, svo 4·A·C (þættir dregnir saman), svo mínus mínus og loks plús/mínus, og vélin stöðvar ef röðin er röng. Aðrir útreikningar eru slegnir inn; endurgjöf er sniðna að formerkjavillum, sér lausnirnar á fleygboganum og prófar þær með því að setja inn í jöfnuna.

5. **Styttri leiðir:** lausnarformúlan virkar alltaf, en: vantar C → x út fyrir sviga í algebruvélinni og núllreglan (ekki deila með x); vantar B → x² = tala og ±; ágiskun (Þ4) með því að smella á talnapör; og „Hvaða leið er styst?“.
6. **Prófaðu þig:** slembipróf (5, 8 eða 10 dæmi; létt, miðlungs, erfitt eða blandað) sem leyst er á blaði. Lausn hvers dæmis er sýnd línu fyrir línu; nemandinn merkir rétt/rangt og getur bent á línuna þar sem hann fór út af. Út frá því birtist hvað þarf að æfa, með ráðum og tengli á æfingu.

Framvinda vistast í vafranum (`localStorage`).

**Vinnubók til útprentunar:** `annars-stigs/vinnubok/vinnubok-annars-stigs.pdf` (26 síður A4, svart/hvítt) fylgir hlutum 1–6: spurningar með rúmum skriflínum, formúlureitir (A1, A2, A3, Þ1–Þ4), hnitakerfi til að teikna fleygboga með 0, 1 og 2 núllstöðvum, matskvarði (auðvelt–erfitt) á spássíu, 10 reitir fyrir sjálfsprófið og drög að glósublaðinu. Búin til með `vinnubok/vinnubok.py` (Python + reportlab; keyrð tvisvar svo efnisyfirlitið fái blaðsíðutöl).

## Veldi og rætur (STÆ2AH, kafli 5)

`veldi-og-raetur/index.html` er sjálfstæður æfingarvefur í sama stíl (grænn, ●). Kjarninn er **veldavél**: þættir með sama stofni eru dregnir saman (vélin skrifar x²⁺³ og nemandinn reiknar veldisvísinn), smellt er á sviga (veldið á alla þætti, V3/V5) og rætur (rót → brotið veldi, R1), tölur undir rót eru þáttaðar (FACT: 27 = □^□), uppi og niðri er spurt „hvar eru fleiri?“ (V2) og mínus-veldi dregið yfir brotastrikið (V6). Skrefin fjögur ① rætur ② svigar ③ sami stofn ④ mínus-veldi eru sýnd og lýst upp.

1. **Hvað er veldi?** Veldi skrifað út (stofn, veldisvísir) og mínus og veldi.
2. **Reglurnar í vélinni:** V1, V5, V3, V2, mínus og brot í sviga, allt saman.
3. **Veldið 0 og neikvæð veldi:** helmingunartafla 2⁴ … 2⁻³, V6, n í veldisvísi (SVIGI utan um það sem er dregið frá).
4. **Rætur og brotin veldi:** R1, FACT, brotin veldi (samnefna), sami rótarvísir, allt saman.
5. **Prófaðu þig:** slembipróf á blaði, lausn línu fyrir línu, merking og greining.

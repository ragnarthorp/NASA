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

## Skutlutilraunin (`skutlur/`)

Sérstakur vefur með yfirliti yfir skýrslur nemenda um skutlutilraunina á þemadögum (hringlaga og hefðbundin pappírsskutla). Opnaðu `skutlur/index.html`.

- **Yfirlit:** helstu tölur, myndrit yfir tíma á lofti og vegalengd, tafla yfir allar skýrslur og mat á hverjum lið.
- **Skýrslur:** hver skýrsla fyrir sig, með mælingum (einstökum köstum þegar þau eru gefin), athugasemdum og öllum liðum.
- **Liðir:** hver liður (tilgangur, tilgáta, …, niðurstaða í einni setningu) borinn saman milli skýrslna.

Gögnin eru í `skutlur/skyrslur.js`; nýrri skýrslu er bætt við með því að afrita færslu þar. Nöfn nemenda eru ekki skráð því vefurinn er opinber.

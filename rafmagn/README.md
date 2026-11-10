# Prófundirbúningur – Rafmagnsfræði 1

Íslenskur námsvef fyrir prófið „Rafleiðarar. Viðnám, leiðni og spennuföll“. Á vefnum eru kennsla í fjórum köflum, 13 dæmagerðir kennarans með nýjum afbrigðum, einkakennari, prófhermir, formúluleit, gátlisti og PDF-glósur.

## Keyrsla

Vefurinn er statískur og þarf hvorki bakenda, innskráningu né byggingarskref.

- **Einfaldast:** opnaðu `index.html` í vafra.
- **Mælt með** (þá virkar vefurinn líka án nets eftir fyrstu heimsókn):
  ```bash
  cd rafmagn
  ```
  ```bash
  python3 -m http.server 8000
  ```
  Opnaðu svo http://localhost:8000.
- **Hýsing:** settu möppuna `rafmagn/` á hvaða vefhýsingu sem er, t.d. GitHub Pages.

Framvindan vistast í `localStorage` á tækinu. Undir **Framvinda** er hægt að flytja hana út og inn sem JSON.

## Prófanir

```bash
node tests/test.js
```
Þetta keyrir 540 sjálfvirkar prófanir. Þær ná yfir formúlur og umritanir, öll 13 upprunalegu dæmin borin saman við svör kennarans, forstillt afbrigði, 11 700 slembidæmi, yfirferð svara, greiningu mistaka, framvindu, gátlista og PDF-úttak.

```bash
node tools/build-pdfs.js
```
Þetta býr aftur til forútbúnu PDF-skjölin í `pdf/` með sama kóða og vefurinn notar.

## Skipulag

| Eining | Skrá |
|---|---|
| Hjálparföll, tölusnið, formúlurithátt­ur | `js/core/util.js` |
| Reiknivél, formúlur, efnistafla | `js/core/physics.js` |
| Yfirferð svara og greining mistaka | `js/core/checker.js` |
| Framvinda, gátlisti, útflutningur | `js/core/store.js` |
| Aðferðaspjöld 1–12 og „Hvaða dæmi er þetta?“ | `js/data/methods.js` |
| Dæmabanki (V1–V6, S1–S7) og verkefnagjafi | `js/data/problems.js` |
| Hugtakaspurningar | `js/data/concepts.js` |
| Kennsluefni í fjórum köflum | `js/data/lessons.js` |
| PDF-útflutningur (jsPDF og innfellt letur) | `js/pdf.js` |
| Dæmaleiðarvísir (31 bls., myndrænn) | `js/guide-pdf.js` |
| Viðmót: græjur, dæmi og einkakennari, síður og leiðarkerfi | `js/ui/*.js` |

**Nýtt afbrigði af dæmi:** bættu `{ level: 'midl', p: { … } }` í `presets` viðkomandi dæmagerðar í `js/data/problems.js`. **Ný hugtakaspurning:** bættu hlut í `RF.concepts` í `js/data/concepts.js`. Ekki þarf að breyta forritinu sjálfu.

## Heimildir og athugasemdir

Byggt á glærum 3.3, 3.3.1 (með svörum), 3.4 og 3.4.1 (með svörum). **Eftirfarandi vantaði og er merkt óstaðfest á vefnum:**

- glærur 3.1, 3.1.1, 3.2 og 3.2.1
- verklegar æfingar 3.3.2 og 3.4.2
- Rafbók, kaflar 3, 4 og 6
- einstaklingsverkefnið úr kennslustund
- tafla kennarans yfir eðlisviðnám

Leiðréttingar, staðfestar í upprunaskjölunum:

- **3.3.1, dæmi 5:** formúlan á svarglærunni er með R_t2 í nefnara. Rétt er R_t1·α, og þá fæst 65,25 °C.
- **3.4.1, dæmi 3:** í formúluna vantar „·100“.
- **3.4.1, dæmi 5:** R er námundað of snemma á svarglærunni (24,6 mm²). Nákvæmt svar er 24,03 mm². Bæði svörin teljast rétt í yfirferð.

Villan í flatarmálsformúlu á glæru 3.2.1 er óstaðfest, þar sem glæran fylgdi ekki. Á vefnum er alls staðar notað A = π·d²/4.

Leyfi: jsPDF (MIT) og Liberation Sans (SIL OFL), sjá `vendor/`.

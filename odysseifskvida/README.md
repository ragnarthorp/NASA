# Lestrarstofa – Ódysseifskviða

Rólegt lestrarumhverfi þar sem nemendur lesa *Ódysseifskviðu – endursögn* (formáli, 24 þættir, „Helstu nöfn“ og „Texti og myndir“), velja textabúta, endurvinna þá og skrá eigin glósur. Aðaltæki er iPad í Safari. Allt viðmót er á íslensku.

- Engin innskráning, engar greiddar þjónustur, engin AI-þjónusta í keyrslu og engar sendingar nemendagagna út af tækinu.
- Hreint HTML/CSS/JavaScript eins og restin af geymslunni – ekkert build-skref. PDF-útflutningur notar `../vendor/jspdf.umd.min.js` og `../vendor/pdf-fonts.js` (Liberation Sans, styður íslensku), sem eru þegar í geymslunni.

## Keyrsla

Vefurinn er kyrrstæður. Opnaðu `odysseifskvida/index.html` beint í vafra, eða keyrðu lítinn vefþjón úr rót geymslunnar (svo `../vendor/` finnist):

```bash
node odysseifskvida/tests/server.js 8765
```

og opnaðu `http://127.0.0.1:8765/odysseifskvida/`. Á iPad þarf síðuna hýsta, t.d. á innra neti skólans eða á GitHub Pages. Síðan hefur **ekki** verið birt opinberlega. Ef hún er hýst ein og sér þarf `vendor/`-mappan úr rót geymslunnar að fylgja með (eða laga slóðina `VENDOR` í `js/app.js`).

Það er ekkert build-skref.

## Frumtexti og útdráttur

- `heimild/Odysseifskvida-endursogn.pdf` er óbreytt frumskjal (SHA-256 `3dc9a938…c504c`).
- `tools/extract.py` er endurkeyranlegur útdráttur (Python 3 + `pdfplumber`):

  ```bash
  cd odysseifskvida && python3 tools/extract.py
  ```

  Hann skrifar `data/odysseifskvida.json` (frumgögn), `data/odysseifskvida.js` (sömu gögn fyrir vafrann) og `data/utdrattur-skyrsla.md` (yfirlit og óvissuatriði). Úttakið er ákvarðað: sama PDF gefur sömu skrár.
- Hlutverk texta eru greind eftir leturgerð og stærð (sjá haus skriftunnar): fyrirsögn, meginmál, tilvitnun (þýðing Sveinbjarnar Egilssonar), heimildarlína, nafnalistafærsla. Myndatextar (EB Garamond skáletur 9,6 pt) og myndaskráin í „Texti og myndir“ eru ekki í lestrartexta en þeir eru skráðir í skýrslunni.
- Efnisyfirlitið (PDF-síða 3) er tvídálka. Það er lesið dálk fyrir dálk og eingöngu notað til að sannprófa kaflaheitin. Öll 24 heitin stemma. Vefurinn býr til sitt eigið efnisyfirlit úr staðfestum kaflaheitum.
- Prentuð síðunúmer eru staðfest á PDF-síðum 3–51 (þau eru jöfn PDF-síðunni). Á síðum 1–2 er ekkert prentað númer og þar er „PDF-síða“ notað.
- Línur sem brotna vegna síðubreiddar eru sameinaðar. Ekkert er umorðað eða leiðrétt.
- Óvissa sem bíður yfirferðar er í `data/utdrattur-skyrsla.md`. Í þessu skjali endar engin efnisgrein á síðuskilum. Í tveimur tilvikum (síður 11→12 og 19→20) fyllir síðasta lína síðu línuna og endar á punkti. Það er túlkað sem ný efnisgrein og skráð sem óvissa.

### Gagnalíkan

Hver textaeining hefur `id` (t.d. `thattur-01-003`), kafla, `type` (`efnisgrein`, `tilvitnun`, `heimild`, `nafn`, `titill`), `n` (númer innan kaflans; allar einingar eru númeraðar í einni röð og sýndar sem „Efnisgrein n“) og `pages`: kort af stafabilum, `[{offset, pdfPage, printedPage}]`. Ef eining nær yfir síðuskil er nýtt bil skráð við þann staf þar sem næsta síða hefst, svo að val fái rétta síðu eða síðubil. Tilvitnun og heimildarlína eru tengdar með `sourceId`/`quoteId`. Skjalið hefur `document.id = "odysseifskvida-endursogn"` og `document.version = "sha256-…"` (fyrstu 16 stafir SHA-256 af PDF).

## Glósur og tengingar

Glósa geymir auðkenni og útgáfu skjals, kafla, upphaf og endi sem `{unitId, offset}` (stafastaðsetningar í texta einingar, ekki skjáhnit), lista eininga, óbreyttan valinn texta, 40 stafa samhengi á undan og eftir, PDF-síðubil og staðfest prentað síðubil, ásamt tegund, texta nemandans og innsettu afriti (við endurvinnslu). Tengingar breytast ekki við leturstillingar, gluggabreytingu eða endurhleðslu. Við hleðslu er hver tenging sannprófuð á móti textanum.

- **Textaval**: Venjulegt textaval Safari (löng snerting og valhandföng). Engir sérsmíðaðir snertigestir eru notaðir. Valstika birtist neðst með „Skrifa eigin glósu“ og „Endurvinna valinn texta“. Valið er tekið gilt aðeins ef báðir endar eru í lestrartextanum. Val yfir samliggjandi efnisgreinar innan kafla er stutt.
- **Varaleið**: Pennahnappurinn „Glósa við efnisgrein n“ við hverja efnisgrein.
- **Tegundir**: Endursögn, Athugasemd, Spurning, Endurvinnsla og Tilvitnun, hver með lit, tákni og heiti. Ef innsett afrit er óbreytt við vistun er glósan merkt „Tilvitnun“. Að öðru leyti er textinn ekki metinn og vistun aldrei hindruð.
- **Glósuspjald**: Glósur í röð textans, sía eftir kafla og tegund, breyta, eyða með „Afturkalla“ og „Fara á textastað“. Staðurinn er auðkenndur með CSS Custom Highlight API (Safari 17.2+), annars með auðkenningu efnisgreinar. Textanum er ekki breytt.

## Vistun, vinnuskrá og Drive

- Glósur, ritdrög, stillingar og lestrarstaður vistast sjálfkrafa í **IndexedDB** í þessum vafra á þessu tæki. Ef IndexedDB virkar ekki er localStorage notað sem varaleið. Ef hvorugt virkar birtist villuborði. „Vistað í þessu tæki“ birtist aðeins eftir að færslan hefur verið staðfest.
- Þetta er **ekki** sjálfvirk Drive-vistun. Safari getur hreinsað gögn vefsíðu sem hefur ekki verið opnuð í nokkra daga, og þau hverfa líka ef vafragögn eru hreinsuð. Nemendur eru því hvattir til að vista vinnuskrá.
- **Vista vinnuskrá**: JSON-skrá (`format: "odysseifskvida-vinnuskra"`, `formatVersion: 1`) með öllum glósum, tengingum, stillingum, lestrarstað og auðkenni og útgáfu skjals. Ef vafrinn styður Web Share með skrám birtist „Deila eða vista í Files…“. Þar má velja „Vista í Files“ og t.d. Google Drive, ef Drive-forritið er sett upp. „Sækja skrá“ er alltaf í boði. Vefurinn getur ekki staðfest hvar skráin endar og fullyrðir það ekki.
- **Opna vinnuskrá**: Staðlaður skráavalari (Files, þar með talið Drive ef það er tengt). Snið, útgáfa sniðs, skjalauðkenni, útgáfa texta og hver tenging eru sannprófuð. Röng eða skemmd skrá breytir engu. Skrá úr annarri útgáfu textans er hafnað í stað þess að tengja glósurnar í hljóði. Áður en glósum er skipt út er beðið um staðfestingu og boðið öryggisafrit. Vinnuskrár eru ekki sameinaðar í þessari útgáfu.

## Útflutningur

„Flytja út“ neðst í glósuspjaldinu býður upp á PDF eða Markdown (.md), allar glósur eða núverandi síu, röð í textanum (sjálfgefið) eða eftir stofnun, og hvort valinn frumtexti fylgi. Hver glósa hefur heiti verks, þátt og kaflaheiti, „Bls.“ (staðfest) eða „PDF-síða“, efnisgrein eða bil, tegund og texta nemandans. Frumtexti er greinilega aðgreindur. Talið er sannreynt svo að engin vistuð glósa falli niður.

- PDF er búið til með jsPDF í vafranum. Textinn er raunverulegur vektor-texti með innfelldu Unicode-letri og sjálfvirkri línu- og síðuskiptingu, ekki skjáskot. Stafir sem letrið hefur ekki (t.d. broskarlar) falla út.
- Markdown er UTF-8 (með BOM svo eldri forrit lesi stafina rétt). Það hefur skýrar fyrirsagnir og frumtexta í `>`-tilvitnun. Merki í texta nemandans sem annars yrðu fyrirsagnir, tilvitnanir eða HTML eru gerð óvirk.
- Allur innfluttur texti og nemendatexti er meðhöndlaður sem gögn (`textContent`), aldrei sem HTML.

## Prófanir

```bash
cd odysseifskvida
npm test          # kjarni (tengingar, vinnuskrá, Markdown) og PDF: node --test
npm run test:ui   # viðmótspróf með Playwright (iPad-hermun)
```

- `tests/core.test.js`: Prófar að allir þættir og kaflar skili sér og að myndatextar séu ekki í meginmáli. Prófar einnig að tilvitnanir og heimildarlínur séu aðgreindar, stöðug auðkenni, síðukort, val yfir efnisgreina- og síðuskil, regluna um óbreytta endurvinnslu, röðun og síur, vinnuskrá fram og til baka, rangar og skemmdar skrár, tóma stöðu og Markdown (langar glósur, íslenskir stafir, óvirk merki).
- `tests/pdf.test.js`: Býr til raunverulegt margra síðna PDF með sama jsPDF og letri og les textann aftur með `pdftotext`.
- `tests/ui.test.js`: Prófar val, glósu, endurvinnslu, varaleið, skarandi glósur og val í valmynd sem verður ekki glósa. Prófar einnig leturstækkun og endurhleðslu, síu, breytingu, eyðingu og afturköllun, að fara á textastað, útflutning í MD og PDF og vinnuskrá (ranga, skemmda og rétta með öryggisafriti). Auk þess vistunarvillur (IndexedDB lokað og villa við skrif), ritdrög, lóðrétta og lárétta stöðu, lága sýnilega hæð (eins og með opið skjályklaborð), heiti hnappa og 44×44 snertifleti.
- Viðmótsprófin keyra í Chromium með iPad-hermun (snerting, iPad-skjástærð). WebKit er notað ef það er uppsett (`ODY_BROWSER=webkit`). **Hermun kemur ekki í stað prófunar á raunverulegu iPad.**

### Gátlisti fyrir prófun á iPad (Safari)

1. Opna síðuna, fara í gegnum efnisyfirlit og fyrri/næsta kafla, loka Safari og opna aftur: lestrarstaður og stillingar haldast.
2. Löng snerting á orði, draga valhandföngin yfir tvær efnisgreinar: valstika birtist neðst og Safari-valmyndin truflast ekki. „Endurvinna valinn texta“ setur textann í ritreit.
3. Með opið skjályklaborð (lóðrétt og lárétt, einnig með ytra lyklaborði og fljótandi lyklaborði): ritreitur og „Vista glósu“ sjást og hægt er að vista.
4. Pennahnappurinn við efnisgrein virkar með fingri og með VoiceOver (heiti „Glósa við efnisgrein n“).
5. Leturstækkun, Serif og Sans-serif, línubil, breidd og þrír bakgrunnar. Valáhersla sést vel í öllum. Klípuaðdráttur í Safari virkar.
6. Lárétt staða: glósuspjald birtist sem hliðarspjald. Lóðrétt staða: spjald birtist yfir textanum og textinn heldur breidd.
7. „Flytja út“ → PDF og MD → „Deila eða vista í Files…“ → Vista í Files / Drive. Opna skrána og athuga ð, þ, æ og ö og langar glósur.
8. „Vista vinnuskrá“ og síðan „Opna vinnuskrá“ úr Files eða Drive. Prófa líka ranga skrá.
9. Einkavafur (Private Browsing) og fullt geymslupláss: skýr villuskilaboð birtast.

## Þekktar takmarkanir

- Engin samstilling milli tækja. Vinnuskrá er leiðin til að flytja vinnu. Vinnuskrár eru ekki sameinaðar.
- Safari getur eytt staðbundnum gögnum vefsíðu eftir nokkra daga án notkunar (ITP), nema síðunni sé bætt við heimaskjá.
- Glósur úr vinnuskrá frá annarri útgáfu textans eru ekki fluttar inn (engin sjálfvirk endurtenging).
- Varanleg auðkenning glósustaða í textanum krefst CSS Custom Highlight API (Safari 17.2+). Í eldri vöfrum sést fjöldi glósa við pennahnappinn og staðurinn er auðkenndur sem heil efnisgrein.
- Letrið í PDF (Liberation Sans-hlutmengi) inniheldur ekki broskarla eða sjaldgæf tákn. Þau falla út í PDF en haldast í Markdown og vinnuskrá.
- Viðmótið hefur aðeins verið prófað sjálfvirkt í Chromium með iPad-hermun, ekki á raunverulegu iPad eða í WebKit.

## Skrár

- `index.html`, `css/app.css`
- `js/core.js`: Textagögn, tengingar, glósulíkan, vinnuskrá og Markdown. Hreinar aðgerðir, prófaðar í Node.
- `js/store.js`: IndexedDB-vistun með staðfestingu.
- `js/pdfexport.js`: PDF-útflutningur (jsPDF).
- `js/app.js`: Viðmót.
- `data/`: Útdregin textagögn og útdráttarskýrsla.
- `heimild/`: Óbreytt frumskjal.
- `tools/extract.py`: Útdráttur.
- `tests/`: Próf og lítill vefþjónn.

/* Spilastokkurinn: 20 spil.
   tegund: "bolvun" | "verkefni" | "spurning"
   stig:   1–3 (bölvanir gefa ekki stig)
   thraut: þrautin sem þarf að leysa til að snúa spilinu við.
           Í bili er hver þraut spurning með einu réttu svari (svor = leyfileg svör).
           Nýjar tegundir þrauta má skrá í SPIL_THRAUTIR í js/spil.js. */
window.SPIL = [
  { tegund: "verkefni", stig: 1, titill: "Mæld skref", texti: "Teljið hve mörg skref eru frá innganginum að næsta tré og takið mynd af trénu.",
    thraut: { gerd: "svar", spurning: "Hvað er 7 × 8?", svor: ["56"] } },
  { tegund: "spurning", stig: 2, titill: "Hitamælir", texti: "Spyrjið hitt liðið: Eruð þið nær vatni eða fjær en fyrir 10 mínútum?",
    thraut: { gerd: "svar", spurning: "Við hvaða hitastig (°C) frýs vatn?", svor: ["0", "0°", "0 °c", "0°c", "núll"] } },
  { tegund: "bolvun", titill: "Bölvun þokunnar", texti: "Liðið sem dregur þetta spil má ekki nota kort í 10 mínútur.",
    thraut: { gerd: "svar", spurning: "Hver er efnatákn súrefnis?", svor: ["o", "o2"] } },
  { tegund: "verkefni", stig: 3, titill: "Laufasafn", texti: "Finnið fimm ólíkar tegundir laufblaða og raðið þeim frá minnsta til stærsta.",
    thraut: { gerd: "svar", spurning: "Hve margar reikistjörnur eru í sólkerfinu?", svor: ["8", "átta"] } },
  { tegund: "spurning", stig: 1, titill: "Ratsjá", texti: "Er hitt liðið innan 500 metra frá ykkur? Svarið verður að vera já eða nei.",
    thraut: { gerd: "svar", spurning: "Hvað er 144 deilt með 12?", svor: ["12", "tólf"] } },
  { tegund: "verkefni", stig: 2, titill: "Steinn í vasa", texti: "Finnið stein sem er þyngri en 100 g og vegið hann á næstu vog.",
    thraut: { gerd: "svar", spurning: "Hvaða reikistjarna er næst sólinni?", svor: ["merkúr", "merkur"] } },
  { tegund: "bolvun", titill: "Bölvun hægagangsins", texti: "Liðið má aðeins ganga, ekki hlaupa, þar til það hefur leyst næstu þraut.",
    thraut: { gerd: "svar", spurning: "Hver er höfuðborg Noregs?", svor: ["osló", "oslo"] } },
  { tegund: "spurning", stig: 3, titill: "Ljósmynd", texti: "Biðjið hitt liðið að senda mynd af því hæsta sem það sér beint fram undan.",
    thraut: { gerd: "svar", spurning: "Hvað heitir stærsti jökull Íslands?", svor: ["vatnajökull"] } },
  { tegund: "verkefni", stig: 1, titill: "Vindátt", texti: "Ákvarðið vindáttina án síma og skrifið hana niður.",
    thraut: { gerd: "svar", spurning: "Hve margar gráður eru í rétthyrndu horni?", svor: ["90", "90°", "níutíu"] } },
  { tegund: "spurning", stig: 2, titill: "Samsvörun", texti: "Er hitt liðið í sama hverfi og þið?",
    thraut: { gerd: "svar", spurning: "Hvaða lofttegund anda plöntur að sér við ljóstillífun?", svor: ["koltvísýringur", "co2", "koldíoxíð"] } },
  { tegund: "bolvun", titill: "Bölvun þagnarinnar", texti: "Næstu 5 mínútur má liðið aðeins tjá sig með bendingum.",
    thraut: { gerd: "svar", spurning: "Hvað er 15 % af 200?", svor: ["30", "þrjátíu"] } },
  { tegund: "verkefni", stig: 3, titill: "Hæðarmæling", texti: "Áætlið hæð hússins sem þið standið við með skugga og staf.",
    thraut: { gerd: "svar", spurning: "Hve margir sentímetrar eru í einum metra?", svor: ["100", "hundrað"] } },
  { tegund: "spurning", stig: 1, titill: "Fjarlægð", texti: "Spyrjið hitt liðið hvort það sé nær skóla eða sundlaug.",
    thraut: { gerd: "svar", spurning: "Hvert er minnsta frumtalan?", svor: ["2", "tveir"] } },
  { tegund: "verkefni", stig: 2, titill: "Fuglatalning", texti: "Teljið alla fugla sem þið sjáið á þremur mínútum og greinið tvær tegundir.",
    thraut: { gerd: "svar", spurning: "Hvað heitir fræðigreinin um veður?", svor: ["veðurfræði"] } },
  { tegund: "bolvun", titill: "Bölvun áttavitans", texti: "Liðið verður að fara 100 metra í norður áður en það heldur áfram.",
    thraut: { gerd: "svar", spurning: "Hvað er 9²?", svor: ["81"] } },
  { tegund: "spurning", stig: 3, titill: "Armar", texti: "Biðjið hitt liðið að nefna næsta safn við sig.",
    thraut: { gerd: "svar", spurning: "Hvaða frumefni hefur efnatáknið Fe?", svor: ["járn"] } },
  { tegund: "verkefni", stig: 1, titill: "Hljóðkort", texti: "Lokið augunum í eina mínútu og skrifið niður öll hljóð sem þið heyrið.",
    thraut: { gerd: "svar", spurning: "Hve margar mínútur eru í 3 klukkustundum?", svor: ["180"] } },
  { tegund: "spurning", stig: 2, titill: "Hæð yfir sjó", texti: "Er hitt liðið hærra yfir sjávarmáli en þið?",
    thraut: { gerd: "svar", spurning: "Hvað heitir hæsta fjall Íslands?", svor: ["hvannadalshnúkur", "hvannadalshnjúkur"] } },
  { tegund: "verkefni", stig: 3, titill: "Smíði", texti: "Byggið turn úr náttúrulegum efnum sem er minnst 30 cm hár og stendur í eina mínútu.",
    thraut: { gerd: "svar", spurning: "Hvað er 2 + 2 × 2?", svor: ["6", "sex"] } },
  { tegund: "bolvun", titill: "Bölvun spegilsins", texti: "Næsta spurning sem liðið spyr kostar tvöfalt.",
    thraut: { gerd: "svar", spurning: "Hvaða dýr er stærst á jörðinni?", svor: ["steypireyður", "steypireiður", "steypireyðurin"] } }
];

'use strict';
// Hæfniflokkar NASA. Þrír mynda sameiginlegan kjarna; hinir sex dýpka sérstök svið.
const GROUPS={
  core:{name:'Sameiginlegur kjarni',short:'Kjarni',color:'#39775d'},
  natt:{name:'Náttúrufræði · dýpkun',short:'Náttúrufræði',color:'#177d88'},
  sam:{name:'Samfélagsfræði · dýpkun',short:'Samfélagsfræði',color:'#b86140'}
};
const CATS=[
  {id:'work',name:'Vinnulag og rannsóknir',short:['Vinnulag og','rannsóknir'],group:'core',icon:'search',
   desc:'Gegnumgangandi vinnulag beggja greinasviða: hugtakanotkun, læsi á texta og gögn, athuganir og tilraunir, heimildarýni, skoðanamyndun, gagnrýnin umræða, miðlun og lýðræðislegt samstarf. Hér á agað bóklegt nám heima, svo sem glósutækni, fyrirlestrar og úthald í lestri.'},
  {id:'environment',name:'Umhverfi, sjálfbærni og samfélag',short:['Umhverfi, sjálfbærni','og samfélag'],group:'core',icon:'leaf',
   desc:'Vistfræði og samspil manns og náttúru: hringrásir efna og orku, vistkerfi, líffræðileg fjölbreytni, veðurfar og loftslagsbreytingar, auðlindir, neysla, sjálfbær þróun, kortalæsi og samfélög heimsins.'},
  {id:'life',name:'Lífið, heilsa og sjálfsmynd',short:['Lífið, heilsa','og sjálfsmynd'],group:'core',icon:'cell',
   desc:'Hér eiga lífvísindin heima: frumur, erfðir, þróun, flokkun lífvera, örverur, plöntur, sveppir, dýr og líffærakerfi mannsins. Flokkurinn tengir lífvísindin við heilsu, kynheilbrigði og sjálfsmynd: félagsmótun, tilfinningar, hugarfar, virðingu og staðalmyndir. Vistfræðin (vistkerfi og líffræðileg fjölbreytni) er í flokknum Umhverfi, sjálfbærni og samfélag.'},
  {id:'energy',name:'Orkan',short:['Orkan'],group:'natt',icon:'bolt',
   desc:'Orka og varðveisla hennar, nýting orku, varmi, rafmagn og segulmagn, bylgjur, kraftar, hreyfing og massi.'},
  {id:'chem',name:'Efnin',short:['Efnin'],group:'natt',icon:'flask',
   desc:'Uppbygging efna, lotukerfið, efnajöfnur, efnabreytingar, varðveisla massa, leysni og sýrustig.'},
  {id:'space',name:'Alheimurinn',short:['Alheimurinn'],group:'natt',icon:'planet',
   desc:'Jörðin og mótun lands, náttúruhamfarir, tunglið, sólkerfið og myndun og þróun stjarna.'},
  {id:'history',name:'Saga',short:['Saga'],group:'sam',icon:'book',
   desc:'Sögulegar heimildir, fjölskyldan, heimabyggð, Íslandssaga, mannkynssaga, söguleg þróun og áhrif sögunnar á samtímann.'},
  {id:'civic',name:'Borgaravitund',short:['Borgaravitund'],group:'sam',icon:'building',
   desc:'Reglur, mannréttindi, samfélagsgerð, lýðræði, stjórnkerfi, velferð og samneysla, slysavarnir, umferð og geta til aðgerða.'},
  {id:'ethics',name:'Siðferði og trú',short:['Siðferði og trú'],group:'sam',icon:'balance',
   desc:'Virðing fyrir fjölbreytileika, trú og lífsviðhorf, trúarbrögð heimsins og áhrif þeirra á einstaklinga, samfélög og sögu.'}
];

const DEFAULT_INFO=[
  {title:'Samkennsla náttúru- og samfélagsgreina',body:
'NASA er samkennsla á **náttúrugreinum** og **samfélagsgreinum** í 8.–10. bekk. Greinasviðin eru kennd saman í þemum þannig að nemendur sjái hvernig þekking úr ólíkum greinum fléttast saman.\n\nHlutföll greinasviðanna taka mið af viðmiðunarstundaskrá aðalnámskrár: um **60% samfélagsgreinar** og **40% náttúrugreinar**. Kennslan og námsmatið er aldursblandað.'},
  {title:'Þemu og val nemenda',body:
'Kennslan fer fram í **þemum**. Þau geta tengst stuttum verkefnum, til dæmis í smiðjum eða á uppbrotsdögum, eða staðið í lengri tíma, jafnvel margar vikur.\n\nÞemun geta breyst milli tímabila til að tengjast því sem efst er á baugi í heiminum og til að leyfa nemendum að taka þátt í vali á viðfangsefnum. Undir þemunum liggja hæfniviðmið aðalnámskrár sem búið er að flokka, bæði í yfirflokka aðalnámskrár og í sérstaka hæfniflokka NASA.'},
  {title:'Hæfniflokkar NASA',body:
'Hæfniviðmið aðalnámskrár eru flokkuð í níu hæfniflokka. Flokkunin skiptist í **sameiginlegan kjarna** og flokka sem **dýpka sérstök svið**:\n\n- Sameiginlegur kjarni: Vinnulag og rannsóknir; Umhverfi, sjálfbærni og samfélag; Lífið, heilsa og sjálfsmynd.\n- Náttúrufræði: Orkan, Efnin, Alheimurinn.\n- Samfélagsfræði: Saga, Borgaravitund, Siðferði og trú.\n\nLífvísindin (frumur, erfðir, þróun, lífverur og líffærakerfi) tilheyra flokknum *Lífið, heilsa og sjálfsmynd* en vistfræðin flokknum *Umhverfi, sjálfbærni og samfélag*.\n\nSamtals skulu hlutföll hæfniflokka vera 100%. Þegar hæfnisvið eru vegin yfir hvert þriggja ára tímabil skulu þau vera sem næst því hlutfalli sem skólanámskrá kveður á um. Að hluta eru hæfnisvið greinanna sameiginleg, til dæmis þegar kemur að vinnulagi, sjálfbærni og öðrum nátengdum þáttum.'},
  {title:'Hækkunar- og rannsóknarverkefni',body:
'Nemendur taka að auki þátt í vali á viðfangsefnum í gegnum hækkunar- og rannsóknarverkefni.\n\n- **Hækkunarverkefni** eru nemendastýrð verkefni sem nemendur og kennarar koma sér saman um. Þau byggja á hæfniflokkum NASA og eru unnin samhliða þemanu. Fyrir hækkunarverkefni má fá 1 til 3 stig. Stigin safnast saman og nota má þau til að hækka einkunn á B-prófi.\n- **Rannsóknarverkefni** eru stærri verkefni sem nemendur geta unnið þegar þeir hafa ítrekað sýnt fram á afbragðshæfni. Þau styðjast við sama matskvarða og A-próf (A, B+, B).'},
  {title:'Vinnulag og agað bóklegt nám',body:
'Í kennslunni er lögð áhersla á að nemendur öðlist **úthald til agaðs bóklegs náms**. Þeir læra glósutækni og sitja fyrirlestra auk þess að vinna margvísleg verkefni.\n\nNotaðir eru hæfniflokkar með bein tengsl við lokaeinkunn. Því er lýst nánar í kaflanum um námsmat.'}
];

const DEFAULT_TARGETS={work:12,environment:12,life:12,energy:8,chem:7,space:7,history:14,civic:14,ethics:14};

const DEFAULT_ASSESSMENT={
  bIntro:'B-próf er próf úr efni þemalotunnar. Það mælir hæfni sem er sambærileg við fyrsta hæfniþrep framhaldsskóla.',
  bBands:[
    {grade:'B',min:80,label:'hefur náð hæfninni'},
    {grade:'C+',min:70,label:'á mörkum þess að hafa náð hæfninni'},
    {grade:'C',min:50,label:'á réttri leið'},
    {grade:'D',min:0,label:'ófullnægjandi árangur'}
  ],
  handicap:{'8':10,'9':5,'10':0},
  pointValue:2,
  maxPoints:0,
  aIntro:'A-próf eru þung próf án hjálpargagna. Nemandi sem nær B á B-prófi (með eða án hækkunarstiga) öðlast rétt til töku A-prófs.',
  research:'Rannsóknarverkefni styðjast við sama matskvarða og A-próf: A, B+ og B.',
  aMax:25,aA:20,aBplus:15,
  finalIntro:'Lokaeinkunn úr 10. bekk er reiknuð út frá vegnu meðaltali einkunna fyrir hvert þema. Vægi hvers þema ræðst af tímalengd þess í vikum. Bókstafseinkunnum er breytt í gildi, meðaltalið reiknað og því varpað yfir á talnakvarða.',
  gradeValues:{'A':4,'B+':3.75,'B':3,'C+':2.75,'C':2,'D':1},
  scale:[{min:4,grade:10},{min:3.75,grade:9},{min:3.375,grade:8},{min:3,grade:7},{min:2.75,grade:6},{min:2,grade:5},{min:0,grade:4}],
  support:'Kennarar leggja mat á stuðningsúrræði, til dæmis upplestur efnis og aðlögun. Ef frávik eru veruleg og gera samræmi matskvarða og íslenska hæfnistigans ómarktækt er einkunn sérstaklega merkt í samræmi við kröfur námskrár.',
  notes:''
};

function demoThemes(){
  const L=(category,note)=>({category,note,criteria:[]});
  return [
    {title:'Hreyfing: Frá Aristótelesi til Newtons',summary:'Nemandi kynnist ólíkum hugmyndum um hreyfingu í gegnum tíðina.',year:'',period:'Lota 1',weeks:6,kind:'Þemalota',entries:[
      {...L('work','Tilraunir Galileós með skábrautir, pendúlamælingar og fallmælingar.'),criteria:['nv3','nv5']},
      {...L('work','**Stærðfræðilegt læsi og gögn:** kerfisbundin reikningsaðferð fyrir formúlur og vinna með mælieiningar (N, kg, m/s²).'),criteria:['nv2']},
      {...L('work','**Gagnrýnin upplýsingarýni og heimildir:** greining á sögulegum frumgögnum, teikningum Galileós af tunglum Júpíters og einkaskjölum Newtons.'),criteria:['sv2','sv3']},
      {...L('work','**Gagnrýnin hugsun:** einkunnarorðin *Nullius in verba* – „ekki trúa neinu blint“.'),criteria:['nv6']},
      L('work','Miðlar niðurstöðum tilrauna í stuttri skýrslu.'),
      {...L('energy','**Kraftar og hreyfing:** skilningur á krafti, massa, hraða og hröðun.'),criteria:['no8']},
      {...L('energy','**Lögmál Newtons þrjú:** tregðulögmálið, F = m·a og átak og gagntak.'),criteria:['no8']},
      {...L('energy','**Frjálst fall og tregða:** tilraunir Galileós um að massi breyti ekki fallhraða og áhrif loftviðnáms.'),criteria:['no8','no9']},
      L('chem','**Fornar efnafræðihugmyndir:** frumefnalíkan Aristótelesar (jörð, vatn, loft, eldur).'),
      {...L('chem','**Massi og eðlismassi:** skilningur á massa hluta óháð staðsetningu.'),criteria:['no9']},
      {...L('space','**Athuganir á sólkerfinu:** athuganir Galileós á tunglum Júpíters og kvartilaskiptum Venusar.'),criteria:['na5']},
      {...L('space','**Heimsmyndin:** sólmiðjukenningin gegn jarðmiðjukenningu Aristótelesar og Ptolemajosar.'),criteria:['na5','nv7']},
      {...L('space','**Aðdráttarafl hnatta:** þyngdarlögmál Newtons milli jarðar, tungls og sólar.'),criteria:['na4','na5']},
      {...L('history','Setur grískt samfélag í sögulegt samhengi.'),criteria:['sh5']},
      {...L('history','**Söguleg þróun vísinda:** frá Grikklandi hinu forna til endurreisnar og vísindabyltingar.'),criteria:['sh6']},
      L('history','**Ævisögur:** Aristóteles, Galileó og Newton.'),
      {...L('history','**Varðveisla heimilda:** einkaskjöl og gullgerðarskrif Newtons.'),criteria:['sh1']},
      {...L('civic','**Prentfrelsi og ritskoðun:** samanburður á Ítalíu og Hollandi á 17. öld.'),criteria:['sb2','sb3']},
      {...L('ethics','**Átök vísinda og kirkju:** réttarhöldin yfir Galileó.'),criteria:['st4']},
      {...L('ethics','**Trúarbrögð og heimsmynd:** hvernig kenningar Aristótelesar samþættust heimsmynd miðaldakirkjunnar.'),criteria:['st2','st4']}
    ]},
    {title:'Grísk goðafræði',summary:'Nemandi kynnist grískri goðafræði og tengslum hennar við sögulega atburði.',year:'',period:'Lota 2',weeks:3,kind:'Þemalota',entries:[
      ...['Kynnist helstu guðum og gyðjum grískrar goðafræði.','Túlkar frásagnir og tákn í goðsögum.','Ræðir siðferðilegar spurningar í goðsögunum.','Greinir áhrif trúar og lífsviðhorfa á samfélag.'].map((n,i)=>({...L('ethics',n),criteria:[['st3'],['st3'],['st2'],['st4']][i]})),
      ...['Metur áreiðanleika heimilda um goðafræði.','Ber saman ólíkar heimildir og sjónarhorn.','Miðlar niðurstöðum með eigin orðum.'].map((n,i)=>({...L('work',n),criteria:[['sv3'],['sv2'],['sv6']][i]})),
      ...['Tengir goðsögur við sögulega atburði.','Setur grískt samfélag í sögulegt samhengi.','Ræðir hlutverk heimilda í túlkun fortíðar.'].map((n,i)=>({...L('history',n),criteria:[['sh5'],['sh5'],['sh1']][i]}))
    ]}
  ];
}

function demoProjects(){
  return [
    {kind:'hækkun',title:'Líkan af sólkerfinu í réttum hlutföllum',category:'space',points:2,description:'Nemandi reiknar fjarlægðir og stærðir og setur upp líkan á skólalóðinni.'},
    {kind:'hækkun',title:'Viðtal við eldri borgara um breytingar í heimabyggð',category:'history',points:1,description:'Hljóðritað viðtal og stutt samantekt.'},
    {kind:'rannsókn',title:'Örplast í Elliðaám',category:'environment',points:0,description:'Sýnataka, greining og skýrsla með tilgátu, aðferð og niðurstöðum.'}
  ];
}

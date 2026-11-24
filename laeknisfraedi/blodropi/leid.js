'use strict';
/* Ferð blóðdropans: staðir, valkostir og leiðir (hnit í viewBox 0 0 600 660).
   Hægri hlið hjartans er vinstra megin á myndinni, eins og horft sé framan á manneskju. */

const ORGANS = {
  heili:  {acc:'heilann', name:'Heili', gen:'heilanum', row:495, sat:0.65, vein:'svc',
           info:'Heilinn er aðeins um 2% af líkamsþyngdinni en notar um 20% af súrefninu.'},
  nyru:   {acc:'nýrun', name:'Nýru', gen:'nýrunum', row:535, sat:0.90, vein:'ivc',
           info:'Nýrun fá um fimmtung alls blóðs til að sía það, en nota lítið súrefni. Blóðið fer því þaðan nánast rautt.'},
  vodvar: {acc:'vöðvana í fótunum', name:'Vöðvar í fótum', gen:'vöðvunum', row:575, sat:0.60, vein:'ivc',
           info:'Vöðvar nota mikið súrefni. Við mikla áreynslu getur mettunin í bláæðablóðinu frá þeim farið niður í 20–30%.'},
  tharmar:{acc:'þarmana', name:'Þarmar', gen:'þörmunum', row:615, sat:0.75, vein:'portal',
           info:'Blóðið tekur upp næringarefni úr þörmunum, t.d. sykur og amínósýrur.'},
};

const NOT_BACK='Blóðið rennur alltaf áfram: frá slagæðum um háræðar til bláæða, aldrei til baka.';
const ONE_WAY='Lokurnar opnast aðeins í eina átt. Þær eru einstefnuhlið hjartans.';
const ART_OUT='Ósæðin er slagæð og flytur blóð frá hjartanu, ekki til þess.';

const STATES = {
  ra:{name:'Hægri gátt', lat:'atrium dextrum', pt:[220,295],
      info:'Hér safnast súrefnissnautt blóð úr öllum líkamanum. Í vegg hægri gáttar er sínushnúturinn, gangráður hjartans.',
      opts:[{to:'tv',label:'Þríblöðkuloka'},{label:'Tvíblöðkuloka',why:'Tvíblöðkulokan er milli vinstri gáttar og vinstri slegils. Gáttaskilin aðskilja gáttirnar svo blóðið kemst ekki á milli.'},{label:'Ósæð',why:'Ósæðin liggur út úr vinstri slegli, ekki hægri gátt.'}]},
  tv:{name:'Þríblöðkuloka', lat:'valva tricuspidalis', pt:[220,345],
      info:'Lokan hefur þrjú blöð: tri (þrír) + cuspis (oddur). Hún opnast þegar gáttin dregst saman og lokast þegar slegillinn dregst saman.',
      opts:[{to:'rv',label:'Hægri slegill'},{label:'Aftur í hægri gátt',why:ONE_WAY},{label:'Vinstri slegill',why:'Sleglaskilin aðskilja slegilana. Blóðið kemst ekki á milli.'}]},
  rv:{name:'Hægri slegill', lat:'ventriculus dexter', pt:[228,400],
      info:'Hægri slegill dælir blóðinu stutta leið, til lungnanna. Veggurinn er þynnri en í vinstri slegli.',
      opts:[{to:'pv',label:'Lungnaloka'},{label:'Ósæðarloka',why:'Ósæðarlokan er í útgangi vinstri slegils. Úr hægri slegli fer blóðið til lungnanna.'},{label:'Þríblöðkuloka',why:'Þríblöðkulokan lokast þegar slegillinn dregst saman. Þá heyrist fyrra hjartahljóðið, „lúbb“.'}]},
  pv:{name:'Lungnaloka', lat:'valva trunci pulmonalis', pt:[272,358],
      info:'Þriggja blaða loka sem hleypir blóðinu úr hægri slegli út í lungnaslagæðina.',
      opts:[{to:'pa',label:'Lungnaslagæð'},{label:'Lungnabláæðar',why:'Lungnabláæðarnar flytja blóð frá lungunum til hjartans, ekki öfugt.'},{label:'Ósæð',why:'Ósæðin byrjar í vinstri slegli.'}]},
  pa:{name:'Lungnaslagæð', lat:'truncus pulmonalis', pt:[272,200],
      info:'Eina slagæðin sem flytur súrefnissnautt blóð. Slagæð er skilgreind eftir stefnu: hún flytur blóð frá hjartanu.',
      opts:[{to:'lcap',label:'Háræðar í lungum'},{label:'Vinstri gátt',why:'Blóðið þarf fyrst að fara um lungun til að sækja súrefni.'},{label:'Barki',why:'Barkinn er loftvegur. Blóð og loft mætast aldrei beint, aðeins í gegnum örþunna veggi lungnablaðranna.'}]},
  lcap:{name:'Háræðar í lungum', lat:'capillares pulmonales', pt:[300,95],
      info:'Háræðarnar liggja utan um lungnablöðrurnar. Koltvísýringur fer úr blóðinu út í loftið og súrefni inn í blóðið. Dropinn er hér í um 0,75 sekúndur og verður skærrauður.',
      opts:[{to:'pvn',label:'Lungnabláæðar'},{label:'Lungnaslagæð',why:NOT_BACK},{label:'Út með útöndunarloftinu',why:'Blóðið fer ekki út í loftið. Aðeins lofttegundir fara í gegnum veggi lungnablaðranna.'}]},
  pvn:{name:'Lungnabláæðar', lat:'venae pulmonales', pt:[380,215],
      info:'Fjórar bláæðar sem flytja súrefnisríkt blóð til hjartans. Einu bláæðarnar sem flytja súrefnisríkt blóð.',
      opts:[{to:'la',label:'Vinstri gátt'},{label:'Hægri gátt',why:'Hægri gátt tekur við blóði frá líkamanum. Blóð frá lungunum fer í vinstri gátt.'},{label:'Vinstri slegill',why:'Blóðið fer fyrst í gáttina og þaðan niður í slegilinn.'}]},
  la:{name:'Vinstri gátt', lat:'atrium sinistrum', pt:[380,295],
      info:'Tekur við súrefnisríku blóði frá lungunum.',
      opts:[{to:'mv',label:'Tvíblöðkuloka'},{label:'Þríblöðkuloka',why:'Þríblöðkulokan er hægra megin í hjartanu.'},{label:'Ósæðarloka',why:'Ósæðarlokan er í útgangi vinstri slegils. Fyrst þarf blóðið að komast niður í slegilinn.'}]},
  mv:{name:'Tvíblöðkuloka', lat:'valva mitralis', pt:[380,345],
      info:'Lokan hefur tvö blöð og er líka kölluð míturloka því hún minnir á biskupsmítur.',
      opts:[{to:'lv',label:'Vinstri slegill'},{label:'Aftur í vinstri gátt',why:ONE_WAY},{label:'Hægri slegill',why:'Sleglaskilin aðskilja slegilana.'}]},
  lv:{name:'Vinstri slegill', lat:'ventriculus sinister', pt:[372,405],
      info:'Öflugasti hluti hjartans. Veggurinn er um þrisvar sinnum þykkari en í hægri slegli því hann dælir blóði um allan líkamann.',
      opts:[{to:'av',label:'Ósæðarloka'},{label:'Lungnaloka',why:'Lungnalokan er í útgangi hægri slegils.'},{label:'Tvíblöðkuloka',why:'Tvíblöðkulokan lokast þegar slegillinn dregst saman, svo blóðið fer ekki aftur upp í gáttina.'}]},
  av:{name:'Ósæðarloka', lat:'valva aortae', pt:[425,410],
      info:'Rétt ofan við lokuna greinast kransæðarnar frá ósæðinni og næra hjartavöðvann sjálfan. Þegar lokan lokast heyrist seinna hjartahljóðið, „dúbb“.',
      opts:[{to:'ao',label:'Ósæð'},{label:'Lungnaslagæð',why:'Lungnaslagæðin byrjar í hægri slegli.'},{label:'Holæð',why:'Holæðarnar flytja blóð til hjartans, ekki frá því.'}]},
  ao:{name:'Ósæð', lat:'aorta', pt:[510,450], organ:true,
      info:'Stærsta slagæð líkamans, um 2,5 cm í þvermál. Hér er blóðþrýstingurinn hæstur. Ósæðin greinist í slagæðar til allra líffæra. Hvert viltu fara?'},
  cap:{name:'Háræðar', lat:'capillares', info:''},
  blaaed:{name:'Bláæðar', lat:'venae',
      info:'Í bláæðunum er þrýstingurinn lágur. Lokur í æðunum og vöðvarnir í kring hjálpa blóðinu upp til hjartans.'},
  portaed:{name:'Portæð', lat:'vena portae', pt:[132,615],
      info:'Sérstök bláæð sem flytur næringarríkt blóð frá þörmunum til lifrarinnar.',
      opts:[{to:'lifur',label:'Lifur'},{label:'Hægri gátt',why:'Fyrst þarf lifrin að vinna úr blóðinu.'},{label:'Nýru',why:'Portæðin liggur til lifrarinnar.'}]},
  lifur:{name:'Lifur', lat:'hepar', pt:[100,615],
      info:'Lifrin geymir sykur sem glýkógen, gerir eiturefni óvirk og myndar prótein í blóðvökvann.',
      opts:[{to:'ivc',label:'Neðri holæð'},{label:'Efri holæð',why:'Efri holæð safnar blóði frá höfði og handleggjum. Lifrin er í kviðnum.'},{label:'Gallblaðra',why:'Í gallblöðruna fer gall frá lifrinni, ekki blóð.'}]},
  svc:{name:'Efri holæð', lat:'vena cava superior', pt:[60,300],
      info:'Safnar blóði frá höfði, hálsi og handleggjum.',
      opts:[{to:'end',label:'Hægri gátt'},{label:'Vinstri gátt',why:'Vinstri gátt tekur aðeins við blóði frá lungunum.'},{label:'Hægri slegill',why:'Blóðið fer fyrst í gáttina.'}]},
  ivc:{name:'Neðri holæð', lat:'vena cava inferior', pt:[100,400],
      info:'Stærsta bláæð líkamans. Safnar blóði úr fótum og kvið.',
      opts:[{to:'end',label:'Hægri gátt'},{label:'Vinstri gátt',why:'Vinstri gátt tekur aðeins við blóði frá lungunum.'},{label:'Hægri slegill',why:'Blóðið fer fyrst í gáttina.'}]},
};

/* Leiðin sem dropinn fer á leið inn á hvern stað. ox: frá hvaða punkti litur dropans breytist. */
function arrivePath(to, ctx){
  const r=ctx.organ?ORGANS[ctx.organ].row:0;
  switch(to){
    case 'tv':return {pts:[[220,295],[220,345]]};
    case 'rv':return {pts:[[220,345],[228,400]]};
    case 'pv':return {pts:[[228,400],[262,385],[272,358]]};
    case 'pa':return {pts:[[272,358],[272,200]]};
    case 'lcap':return {pts:[[272,200],[272,170],[200,170],[200,95],[300,95]],ox:3};
    case 'pvn':return {pts:[[300,95],[400,95],[400,170],[380,170],[380,215]]};
    case 'la':return {pts:[[380,215],[380,295]]};
    case 'mv':return {pts:[[380,295],[380,345]]};
    case 'lv':return {pts:[[380,345],[372,405]]};
    case 'av':return {pts:[[372,405],[425,410]]};
    case 'ao':return {pts:[[425,410],[510,410],[510,450]]};
    case 'cap':return {pts:[[510,450],[510,r],[480,r],[315,r]],ox:2};
    case 'blaaed':return {pts:[[315,r],[150,r],[125,r]]};
    case 'portaed':return {pts:[[315,615],[150,615],[132,615]]};
    case 'lifur':return {pts:[[132,615],[106,615]]};
    case 'svc':return {pts:[[125,495],[60,495],[60,300]]};
    case 'ivc':return ctx.from==='lifur'?{pts:[[106,615],[100,600],[100,400]]}:{pts:[[125,r],[100,r],[100,400]]};
    case 'end':return ctx.from==='svc'?{pts:[[60,300],[60,230],[215,230],[215,280]]}:{pts:[[100,400],[100,315],[175,315],[208,300]]};
  }
}

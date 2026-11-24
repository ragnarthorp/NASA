'use strict';
/* Líffærakort: kerfi, líffæri og teikningar (SVG, viewBox 0 0 300 640, framhlið).
   Hægri hlið manneskjunnar er vinstra megin á myndinni, eins og þegar læknir horfir á sjúkling. */

const SYSTEMS = [
  {id:'blodras', name:'Blóðrásarkerfi', latin:'systema cardiovasculare', col:'#c4162f',
   role:'Hjartað dælir blóði um æðarnar. Blóðið flytur súrefni og næringu til allra frumna og tekur koltvísýring og úrgang frá þeim.',
   works:['ondun','melting','thvag'], spec:'Hjartalækningar', specLat:'cardiologia', doctor:'hjartalæknir',
   disease:['Kransæðastífla (hjartaáfall)','Háþrýstingur','Takttruflanir'], parts:['cardi','angi','arteri','phleb','haem']},
  {id:'ondun', name:'Öndunarkerfi', latin:'systema respiratorium', col:'#d9607a',
   role:'Flytur loft inn og út úr lungunum. Í lungnablöðrunum fer súrefni yfir í blóðið og koltvísýringur úr því.',
   works:['blodras','vodvar','tauga'], spec:'Lungnalækningar', specLat:'pulmonologia', doctor:'lungnalæknir',
   disease:['Astmi','Lungnabólga','Lungnateppa (COPD)'], parts:['pneum','pulmon','bronch','trache','pnoea']},
  {id:'melting', name:'Meltingarkerfi', latin:'systema digestorium', col:'#c98a2b',
   role:'Brýtur fæðuna niður í smáar sameindir sem frásogast í blóðið. Það sem ekki nýtist fer út sem saur.',
   works:['blodras','innkirtla'], spec:'Meltingarlækningar', specLat:'gastroenterologia', doctor:'meltingarlæknir',
   disease:['Magasár','Botnlangabólga','Lifrarbólga'], parts:['gastr','enter','hepat','itis','ectomia']},
  {id:'tauga', name:'Taugakerfi', latin:'systema nervosum', col:'#7a5bc4',
   role:'Tekur við boðum frá skynfærunum, vinnur úr þeim og sendir boð til vöðva og kirtla. Hraðasta boðkerfi líkamans.',
   works:['vodvar','innkirtla','ondun'], spec:'Taugalækningar', specLat:'neurologia', doctor:'taugalæknir',
   disease:['Heilablóðfall','Flogaveiki','Mígreni'], parts:['neur','encephal','algia','plegia']},
  {id:'thvag', name:'Þvagkerfi', latin:'systema urinarium', col:'#c9a31c',
   role:'Nýrun sía blóðið, losa úrgangsefni og stjórna vatns- og saltmagni líkamans. Þvagið safnast í þvagblöðruna.',
   works:['blodras','innkirtla'], spec:'Nýrna- og þvagfæralækningar', specLat:'nephrologia, urologia', doctor:'nýrnalæknir eða þvagfæraskurðlæknir',
   disease:['Nýrnasteinar','Þvagfærasýking','Nýrnabilun'], parts:['nephr','ur']},
  {id:'innkirtla', name:'Innkirtlakerfi', latin:'systema endocrinum', col:'#2e9b8f',
   role:'Kirtlar senda hormón út í blóðið sem stjórna vexti, efnaskiptum, blóðsykri og kynþroska. Hægara en taugakerfið en áhrifin vara lengur.',
   works:['tauga','melting','aexlun'], spec:'Innkirtlalækningar', specLat:'endocrinologia', doctor:'innkirtlalæknir',
   disease:['Sykursýki','Vanvirkur skjaldkirtill','Ofvirkur skjaldkirtill'], parts:['glyc','hyper','hypo','haem']},
  {id:'onaemi', name:'Ónæmis- og sogæðakerfi', latin:'systema lymphaticum', col:'#4f9a3f',
   role:'Ver líkamann gegn sýklum. Hvít blóðkorn þroskast í beinmerg og hóstarkirtli og safnast í eitla og milta. Sogæðar flytja vökva úr vefjunum aftur í blóðið.',
   works:['blodras','stod'], spec:'Ónæmis- og ofnæmislækningar', specLat:'immunologia', doctor:'ónæmislæknir',
   disease:['Ofnæmi','Sjálfsofnæmissjúkdómar','Einkirningasótt'], parts:['leuk','cyt']},
  {id:'stod', name:'Stoðkerfi', latin:'systema skeletale', col:'#a8977c',
   role:'Beinagrindin ber líkamann uppi, verndar líffærin og myndar blóðkorn í beinmergnum. Fullorðinn maður hefur 206 bein.',
   works:['vodvar','onaemi'], spec:'Bæklunarlækningar', specLat:'orthopaedia', doctor:'bæklunarlæknir',
   disease:['Beinbrot','Beinþynning','Hryggskekkja'], parts:['oste','cost']},
  {id:'vodvar', name:'Vöðvakerfi', latin:'systema musculare', col:'#b0413a',
   role:'Vöðvar dragast saman og hreyfa líkamann. Þrjár gerðir: beinagrindarvöðvar sem við stjórnum sjálf, sléttir vöðvar í innyflum og hjartavöðvinn.',
   works:['stod','tauga','ondun'], spec:'Endurhæfingarlækningar', specLat:'medicina physicalis', doctor:'endurhæfingarlæknir og sjúkraþjálfari',
   disease:['Tognun','Vöðvarýrnun'], parts:['my','algia']},
  {id:'hud', name:'Húð', latin:'integumentum commune', col:'#d39466',
   role:'Stærsta líffæri líkamans. Ver gegn sýklum og vatnstapi, stjórnar hita með svita, skynjar snertingu og myndar D-vítamín í sólarljósi.',
   works:['onaemi','tauga'], spec:'Húðlækningar', specLat:'dermatologia', doctor:'húðlæknir',
   disease:['Exem','Sortuæxli','Bólur'], parts:['dermat','cut','epi','sub']},
  {id:'aexlun', name:'Æxlunarkerfi', latin:'systema genitale', col:'#b9508f',
   role:'Myndar kynfrumur (egg og sáðfrumur) og kynhormón. Í leginu þroskast fóstur á meðgöngu.',
   works:['innkirtla','thvag'], spec:'Kvensjúkdóma- og fæðingarlækningar', specLat:'gynaecologia, obstetricia', doctor:'kvensjúkdómalæknir',
   disease:['Kynsjúkdómar, t.d. klamydía','Ófrjósemi'], parts:[]},
];

/* Teikniföll. P: fyllt form. E: sporbaugur. S: lína (breidd, litur). D: skrautlína inni í formi. */
const P=(d)=>({d}), E=(cx,cy,rx,ry,t)=>({e:[cx,cy,rx,ry],t}), S=(d,w,col)=>({d,w:w||3,col}), D=(d)=>({d,deco:true});
const RED='#c4162f', BLUE='#2d4a8a';
const mirror=d=>d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,(m,x,y)=>`${300-+x} ${y}`);

const BODY = {
  head:E(150,58,34,44),
  neck:P('M136 94 L164 94 L166 130 L134 130 Z'),
  torso:P('M136 126 C120 130 100 132 92 140 C80 150 74 175 72 205 L64 280 L58 345 C56 360 60 372 68 372 C76 372 78 360 76 345 L84 282 L92 215 C94 200 98 190 100 185 L102 260 C100 290 102 310 104 330 C104 350 104 372 108 390 L112 480 L114 590 C112 610 116 622 130 624 C142 624 142 614 140 600 L142 480 L146 395 C148 388 152 388 154 395 L158 480 L160 600 C158 614 158 624 170 624 C184 622 188 610 186 590 L188 480 L192 390 C196 372 196 350 196 330 C198 310 200 290 198 260 L200 185 C202 190 206 200 208 215 L216 282 L224 345 C222 360 224 372 232 372 C240 372 244 360 242 345 L236 280 L228 205 C226 175 220 150 208 140 C200 132 180 130 164 126 Z'),
};

const ribs=[];for(let i=0;i<7;i++){const y=150+i*14;ribs.push(S(`M147 ${y} C128 ${y-6} 108 ${y+2} 104 ${y+16}`,3),S(mirror(`M147 ${y} C128 ${y-6} 108 ${y+2} 104 ${y+16}`),3));}
const vert=[];for(let y=102;y<330;y+=9)vert.push(P(`M146 ${y} L154 ${y} L154 ${y+7} L146 ${y+7} Z`));

/* Líffæri í teikniröð (aftast fyrst). sys: kerfin sem líffærið tilheyrir, fyrst aðalkerfið. */
const ORGANS = [
  // Húð
  {id:'hud', name:'Húð', lat:'cutis', sys:['hud'], shapes:[{skin:true}],
   desc:'Um 2 m² og 4–5 kg hjá fullorðnum. Ysta lagið, yfirhúðin (epidermis), endurnýjast á um fjórum vikum.'},
  // Stoðkerfi
  {id:'hofudkupa', name:'Höfuðkúpa', lat:'cranium', sys:['stod'], shapes:[S('M150 18 C124 18 118 40 118 58 C118 76 126 88 136 92 L136 100 L164 100 L164 92 C174 88 182 76 182 58 C182 40 176 18 150 18 Z',4)],
   desc:'Ver heilann. Gerð úr mörgum beinum sem gróa saman eftir fæðingu.'},
  {id:'hryggsula', name:'Hryggsúla', lat:'columna vertebralis', sys:['stod'], shapes:vert,
   desc:'33 hryggjarliðir sem verja mænuna og bera líkamann uppi.'},
  {id:'rifbein', name:'Rifbein', lat:'costae', sys:['stod'], shapes:ribs,
   desc:'Tólf pör sem mynda brjóstkassann og verja hjarta og lungu.'},
  {id:'bringubein', name:'Bringubein', lat:'sternum', sys:['stod'], shapes:[P('M146 140 L154 140 L155 210 L150 218 L145 210 Z')],
   desc:'Flatt bein framan á brjóstinu sem flest rifbein festast við. Þar er þrýst í hjartahnoði.'},
  {id:'vidbein', name:'Viðbein', lat:'clavicula', sys:['stod'], shapes:[S('M146 134 C130 132 116 138 104 140',4),S(mirror('M146 134 C130 132 116 138 104 140'),4)],
   desc:'Tengir handlegginn við bolinn. Brotnar oft við fall á útrétta hönd.'},
  {id:'mjadmagrind', name:'Mjaðmagrind', lat:'pelvis', sys:['stod'], shapes:[P('M110 320 C120 340 136 352 150 350 C164 352 180 340 190 320 C186 346 174 364 160 368 L140 368 C126 364 114 346 110 320 Z')],
   desc:'Ber þunga efri hluta líkamans og verndar þvagblöðru og æxlunarfæri.'},
  {id:'upphandleggsbein', name:'Upphandleggsbein', lat:'humerus', sys:['stod'], shapes:[S('M98 148 L80 252',5),S(mirror('M98 148 L80 252'),5)],
   desc:'Bein upphandleggsins, milli axlar og olnboga.'},
  {id:'laerleggur', name:'Lærleggur', lat:'femur', sys:['stod'], shapes:[S('M126 372 L127 478',7),S(mirror('M126 372 L127 478'),7)],
   desc:'Lengsta og sterkasta bein líkamans.'},
  {id:'skoflungur', name:'Sköflungur', lat:'tibia', sys:['stod'], shapes:[S('M127 490 L126 596',6),S(mirror('M127 490 L126 596'),6)],
   desc:'Sterka beinið framan á fótleggnum. Kantinn má finna undir húðinni.'},
  // Vöðvakerfi
  {id:'brjostvodvi', name:'Brjóstvöðvi', lat:'musculus pectoralis major', sys:['vodvar'], shapes:[P('M148 140 C134 136 112 140 102 152 C104 168 120 182 148 178 Z'),P(mirror('M148 140 C134 136 112 140 102 152 C104 168 120 182 148 178 Z'))],
   desc:'Stór vöðvi á brjóstinu sem færir handlegginn fram og inn að líkamanum.'},
  {id:'kvidvodvi', name:'Beinn kviðvöðvi', lat:'musculus rectus abdominis', sys:['vodvar'], shapes:[P('M136 238 L164 238 L166 326 L134 326 Z'),D('M150 238 L150 326 M135 260 L165 260 M135 282 L165 282 M134 304 L166 304')],
   desc:'Beygir bolinn fram og styður innyflin. Hann myndar „sexpakkann“.'},
  {id:'tvihofdi', name:'Tvíhöfði', lat:'musculus biceps brachii', sys:['vodvar'], shapes:[E(86,200,7,26,'rotate(12 86 200)'),E(214,200,7,26,'rotate(-12 214 200)')],
   desc:'Beygir olnbogann. Beinagrindarvöðvi sem við stjórnum sjálf.'},
  {id:'ferhofdi', name:'Ferhöfði', lat:'musculus quadriceps femoris', sys:['vodvar'], shapes:[E(127,430,13,42),E(173,430,13,42)],
   desc:'Fjórir vöðvar framan á lærinu sem rétta úr hnénu.'},
  // Taugakerfi
  {id:'heili', name:'Heili', lat:'encephalon', sys:['tauga'], shapes:[E(150,46,28,24),D('M150 24 L150 68 M128 40 C134 34 140 44 146 38 M154 38 C160 44 166 34 172 40 M126 54 C134 50 138 58 144 52 M156 52 C162 58 166 50 174 54')],
   desc:'Um 86 milljarðar taugafrumna. Stjórnar hugsun, minni, tilfinningum, hreyfingum og skynjun.'},
  {id:'maena', name:'Mæna', lat:'medulla spinalis', sys:['tauga'], shapes:[S('M150 70 L150 330',4)],
   desc:'Liggur inni í hryggnum og flytur boð milli heila og líkama. Sum viðbrögð gerast í mænunni sjálfri.'},
  {id:'taugar', name:'Taugar', lat:'nervi', sys:['tauga'], shapes:[S('M150 140 C122 140 102 150 88 200 L70 340',2),S(mirror('M150 140 C122 140 102 150 88 200 L70 340'),2),S('M150 328 C140 344 132 360 130 400 L129 600',2),S(mirror('M150 328 C140 344 132 360 130 400 L129 600'),2),S('M150 200 L106 226 M150 250 L106 280',1.5),S(mirror('M150 200 L106 226 M150 250 L106 280'),1.5)],
   desc:'Knippi taugaþráða sem flytja boð til og frá öllum hlutum líkamans, sum á yfir 100 m/s.'},
  // Æðar
  {id:'slagaedar', name:'Slagæðar', lat:'arteriae', sys:['blodras'], shapes:[S('M162 172 C132 152 104 160 90 210 L74 340',2.5,RED),S('M164 170 C186 152 202 160 212 210 L228 340',2.5,RED),S('M160 330 C150 344 138 360 134 400 L133 600',2.5,RED),S('M160 330 C168 344 172 360 172 400 L172 600',2.5,RED),S('M155 172 L157 100',2.5,RED)],
   desc:'Flytja blóð frá hjartanu undir háum þrýstingi. Púlsinn finnst í þeim, t.d. á úlnlið og hálsi.'},
  {id:'blaaedar', name:'Bláæðar', lat:'venae', sys:['blodras'], shapes:[S('M144 174 C118 152 96 162 84 212 L66 340',2.5,BLUE),S('M146 172 C190 150 208 166 218 212 L234 340',2.5,BLUE),S('M144 330 C134 344 124 360 122 400 L121 600',2.5,BLUE),S('M144 330 C160 342 166 360 166 400 L166 600',2.5,BLUE),S('M144 172 L140 100',2.5,BLUE)],
   desc:'Flytja blóð til hjartans. Lokur í þeim hindra að blóðið renni til baka.'},
  {id:'holaedar', name:'Holæðar', lat:'venae cavae', sys:['blodras'], shapes:[S('M145 168 L145 200 M145 214 L144 330',6,BLUE)],
   desc:'Tvær stærstu bláæðarnar. Flytja súrefnissnautt blóð aftur í hægri gátt hjartans.'},
  {id:'osaed', name:'Ósæð', lat:'aorta', sys:['blodras'], shapes:[S('M157 196 C156 166 174 164 166 184 L160 330',7,RED)],
   desc:'Stærsta slagæð líkamans. Flytur súrefnisríkt blóð frá vinstri slegli út um allan líkamann.'},
  // Melting (aftari hlutar)
  {id:'velinda', name:'Vélinda', lat:'oesophagus', sys:['melting'], shapes:[S('M150 104 L151 226 C152 236 160 242 168 244',5)],
   desc:'Vöðvarör sem flytur fæðuna úr kokinu niður í magann með bylgjuhreyfingum.'},
  {id:'ristill', name:'Ristill', lat:'colon', sys:['melting'], shapes:[S('M116 352 L116 316 C116 308 122 306 130 306 L172 306 C180 306 186 310 186 318 L186 340 C186 352 174 352 162 352',10)],
   desc:'Tekur upp vatn og sölt úr fæðuleifunum. Þar lifa milljarðar gagnlegra baktería.'},
  {id:'endatharmur', name:'Endaþarmur', lat:'rectum', sys:['melting'], shapes:[S('M162 352 C156 356 152 362 152 378',8)],
   desc:'Síðasti hluti meltingarvegarins. Geymir saur þar til hann er losaður.'},
  {id:'botnlangi', name:'Botnlangi', lat:'appendix vermiformis', sys:['melting'], shapes:[S('M116 356 C116 366 112 370 106 368',4)],
   desc:'Lítill ormlaga totur á ristlinum. Ef hann bólgnar þarf oft að fjarlægja hann (appendectomia).'},
  {id:'smatharmar', name:'Smáþarmar', lat:'intestinum tenue', sys:['melting'], shapes:[P('M128 318 C140 312 162 312 174 318 C178 330 176 342 170 346 C156 350 142 350 130 346 C124 340 124 328 128 318 Z'),D('M132 324 C140 320 146 330 154 324 C162 318 168 328 172 324 M130 334 C138 330 144 340 152 334 C160 328 166 340 172 336 M134 343 C142 339 150 346 158 342 C164 339 168 344 170 342')],
   desc:'Um 6 metra langir. Þar frásogast flest næringarefni í gegnum milljónir smárra totna.'},
  // Þvagkerfi
  {id:'nyru', name:'Nýru', lat:'renes', sys:['thvag'], shapes:[P('M114 270 C104 270 104 296 114 300 C120 302 122 294 119 286 C122 278 120 270 114 270 Z'),P(mirror('M114 268 C104 268 104 294 114 298 C120 300 122 292 119 284 C122 276 120 268 114 268 Z'))],
   desc:'Sía um 180 lítra af blóðvökva á sólarhring en mynda aðeins 1–2 lítra af þvagi. Mynda líka rauðkornavaka (EPO).'},
  {id:'thvagleidarar', name:'Þvagleiðarar', lat:'ureteres', sys:['thvag'], shapes:[S('M116 298 C120 320 136 340 144 352',2),S('M184 296 C180 320 164 340 156 352',2)],
   desc:'Mjó rör sem flytja þvagið frá nýrunum niður í þvagblöðruna.'},
  {id:'thvagbladra', name:'Þvagblaðra', lat:'vesica urinaria', sys:['thvag'], shapes:[E(150,358,13,10)],
   desc:'Teygjanlegur vöðvapoki sem rúmar um hálfan lítra af þvagi.'},
  {id:'thvagras', name:'Þvagrás', lat:'urethra', sys:['thvag'], shapes:[S('M150 368 L150 388',2.5)],
   desc:'Rörið sem þvagið fer út um.'},
  // Innkirtlar
  {id:'nyrnahettur', name:'Nýrnahettur', lat:'glandulae suprarenales', sys:['innkirtla'], shapes:[P('M107 272 L114 262 L121 272 Z'),P('M179 270 L186 260 L193 270 Z')],
   desc:'Sitja ofan á nýrunum. Mynda adrenalín við álag og hræðslu, og hormónið kortisól.'},
  {id:'bris', name:'Bris', lat:'pancreas', sys:['melting','innkirtla'], shapes:[P('M126 296 C140 288 165 290 190 284 C192 290 188 295 180 296 C160 298 140 300 128 302 Z')],
   desc:'Myndar meltingarensím sem fara út í skeifugörnina og hormónin insúlín og glúkagon sem stjórna blóðsykrinum.'},
  {id:'heiladingull', name:'Heiladingull', lat:'hypophysis', sys:['innkirtla'], shapes:[E(150,70,3.5,3.5)],
   desc:'Kirtill á stærð við baun undir heilanum. Stjórnar mörgum öðrum kirtlum og myndar vaxtarhormón.'},
  // Öndun
  {id:'nefhol', name:'Nefhol', lat:'cavum nasi', sys:['ondun'], shapes:[E(150,80,6,8)],
   desc:'Hitar, rakar og síar loftið áður en það fer niður í lungun.'},
  {id:'barkakyli', name:'Barkakýli', lat:'larynx', sys:['ondun'], shapes:[P('M143 102 L157 102 L156 114 L144 114 Z')],
   desc:'Geymir raddböndin. Barkalokið lokar barkanum þegar við kyngjum.'},
  {id:'barki', name:'Barki', lat:'trachea', sys:['ondun'], shapes:[P('M146 114 L154 114 L154 160 L146 160 Z'),D('M146 122 L154 122 M146 130 L154 130 M146 138 L154 138 M146 146 L154 146 M146 154 L154 154')],
   desc:'Rör styrkt með brjóskhringjum sem flytur loftið niður að lungunum.'},
  {id:'berkjur', name:'Berkjur', lat:'bronchi', sys:['ondun'], shapes:[S('M150 158 L136 178 L128 196 M136 178 L124 182',3.5),S(mirror('M150 158 L136 178 L128 196 M136 178 L124 182'),3.5)],
   desc:'Barkinn greinist í tvær berkjur sem greinast áfram í sífellt minni greinar, eins og tré á hvolfi.'},
  {id:'skjaldkirtill', name:'Skjaldkirtill', lat:'glandula thyroidea', sys:['innkirtla'], shapes:[E(143,122,5,7),E(157,122,5,7),P('M144 124 L156 124 L156 128 L144 128 Z')],
   desc:'Fiðrildislaga kirtill framan á hálsinum. Hormón hans (þýroxín) stjórna hraða efnaskiptanna.'},
  {id:'lungu', name:'Lungu', lat:'pulmones', sys:['ondun'], shapes:[P('M146 160 C132 150 108 168 104 200 C101 222 104 234 112 236 C125 234 138 232 146 228 Z'),P('M154 160 C168 150 192 168 196 200 C199 222 196 234 188 236 C180 234 172 232 166 230 C172 220 172 206 160 198 C156 190 154 176 154 160 Z')],
   desc:'Svampkennd líffæri með um 300 milljón lungnablöðrum. Þar fer súrefnið yfir í blóðið.', link:['../lungnahermir/index.html','Opna lungnaherminn']},
  {id:'thind', name:'Þind', lat:'diaphragma', sys:['ondun','vodvar'], shapes:[S('M104 238 C120 222 140 224 150 232 C160 224 182 222 196 238',4)],
   desc:'Hvelfdur vöðvi undir lungunum. Þegar hún dregst saman fletst hún út og loft sogast inn í lungun.'},
  // Hjartað
  {id:'hjarta', name:'Hjarta', lat:'cor', sys:['blodras'], shapes:[{d:'M160 224 C145 214 138 202 142 192 C146 184 156 185 160 193 C164 185 174 184 178 192 C182 202 175 214 160 224 Z',t:'rotate(-22 160 205)'}],
   desc:'Fjögurra hólfa vöðvadæla á stærð við krepptan hnefa. Slær um 100.000 sinnum á sólarhring.', link:['../hjartalinurit/index.html','Opna hjartalínuritið']},
  // Melting (fremri hlutar)
  {id:'lifur', name:'Lifur', lat:'hepar', sys:['melting'], shapes:[P('M102 240 C120 232 150 232 172 240 C170 250 160 256 140 262 C125 268 112 272 106 270 C100 262 100 250 102 240 Z')],
   desc:'Stærsti kirtill líkamans. Myndar gall, geymir orku og hreinsar eiturefni úr blóðinu.'},
  {id:'gallblada', name:'Gallblaðra', lat:'vesica biliaris', sys:['melting'], shapes:[E(136,267,5,8)],
   desc:'Geymir gall frá lifrinni. Gallið hjálpar til við meltingu fitu.'},
  {id:'magi', name:'Magi', lat:'gaster', sys:['melting'], shapes:[P('M168 240 C180 236 196 244 196 262 C196 280 182 288 168 286 C158 285 152 280 156 274 C162 274 172 272 176 262 C178 252 170 248 166 246 Z')],
   desc:'Blandar fæðunni við magasýru og ensím. Sýran drepur líka flesta sýkla.'},
  // Ónæmiskerfi
  {id:'milta', name:'Milta', lat:'splen', sys:['onaemi'], shapes:[E(192,258,6,12)],
   desc:'Síar blóðið, fjarlægir gömul rauðkorn og geymir hvít blóðkorn.'},
  {id:'hostarkirtill', name:'Hóstarkirtill', lat:'thymus', sys:['onaemi'], shapes:[E(150,170,9,9)],
   desc:'Þar þroskast T-eitilfrumur. Hann er stærstur í æsku og minnkar eftir kynþroska.'},
  {id:'halskirtlar', name:'Hálskirtlar', lat:'tonsillae', sys:['onaemi'], shapes:[E(143,94,3.5,3),E(157,94,3.5,3)],
   desc:'Eitilvefur aftast í kokinu sem grípur sýkla sem berast inn um munn og nef.'},
  {id:'eitlar', name:'Eitlar', lat:'nodi lymphatici', sys:['onaemi'], shapes:[[132,110],[168,110],[110,162],[190,162],[106,170],[194,170],[124,356],[176,356],[130,362],[170,362]].map(([x,y])=>E(x,y,3.2,3.2)),
   desc:'Um 600 litlir hnúðar á sogæðunum. Bólgna þegar líkaminn berst við sýkingu, t.d. á hálsinum við hálsbólgu.'},
  // Æxlunarfæri
  {id:'eggjaleidarar', name:'Eggjaleiðarar', lat:'tubae uterinae', sys:['aexlun'], sex:'f', shapes:[S('M142 330 C136 322 130 322 128 327',2.5),S(mirror('M142 330 C136 322 130 322 128 327'),2.5)],
   desc:'Flytja eggið frá eggjastokknum til legsins. Þar verður frjóvgunin.'},
  {id:'eggjastokkar', name:'Eggjastokkar', lat:'ovaria', sys:['aexlun','innkirtla'], sex:'f', shapes:[E(127,331,5,4),E(173,331,5,4)],
   desc:'Mynda egg og hormónin estrógen og prógesterón.'},
  {id:'leg', name:'Leg', lat:'uterus', sys:['aexlun'], sex:'f', shapes:[P('M140 330 C140 322 160 322 160 330 C160 340 154 346 150 350 C146 346 140 340 140 330 Z')],
   desc:'Vöðvamikið líffæri þar sem fóstur þroskast á meðgöngu.'},
  {id:'sadras', name:'Sáðrás', lat:'ductus deferens', sys:['aexlun'], sex:'m', shapes:[S('M143 388 C132 372 134 350 146 368',2),S(mirror('M143 388 C132 372 134 350 146 368'),2)],
   desc:'Flytur sáðfrumur frá eistunum.'},
  {id:'eistu', name:'Eistu', lat:'testes', sys:['aexlun','innkirtla'], sex:'m', shapes:[E(143,395,5,7),E(157,395,5,7)],
   desc:'Mynda sáðfrumur og hormónið testósterón.'},
  {id:'blodruhals', name:'Blöðruhálskirtill', lat:'prostata', sys:['aexlun'], sex:'m', shapes:[E(150,373,6,5)],
   desc:'Kirtill undir þvagblöðrunni sem myndar hluta sæðisvökvans.'},
];

/* Líffæri sem spurt er um í „Hvar er …?“: vel aðgreind og sýnileg. */
const WHERE_POOL = ['heili','skjaldkirtill','barki','lungu','hjarta','lifur','magi','gallblada','bris','milta','nyru','thvagbladra','smatharmar','ristill','botnlangi','hostarkirtill'];

/* Sjúkrasögur fyrir „Til hvaða læknis?“ */
const CASES = [
  {sys:'blodras', organ:'hjarta', text:'Maður á sextugsaldri fær þrýstingsverk fyrir brjóstið sem leiðir út í vinstri handlegg þegar hann gengur upp stiga.', why:'Brjóstverkur við áreynslu bendir til þess að kransæðar hjartans séu þrengdar.'},
  {sys:'ondun', organ:'lungu', text:'Stelpa fær hvæsandi öndun og mæði þegar hún hleypur úti í kulda. Henni léttir við púst.', why:'Þetta er lýsing á astma: berkjurnar þrengjast og pústið víkkar þær.'},
  {sys:'melting', organ:'magi', text:'Kona fær brennandi verk ofarlega í kviðinn eftir máltíðir og hefur misst matarlystina.', why:'Þetta gæti verið magasár. Meltingarlæknir getur skoðað magann með speglun (gastroscopia).'},
  {sys:'tauga', organ:'heili', text:'Eldri maður verður skyndilega máttlaus í hægri hendi og á erfitt með að tala.', why:'Einkenni heilablóðfalls. Vinstri hluti heilans stjórnar hægri hlið líkamans og oftast líka málinu. Hringja strax í 112.'},
  {sys:'thvag', organ:'nyru', text:'Maður fær skyndilega mjög sáran verk í síðuna sem leiðir niður í nára og sér blóð í þvaginu.', why:'Dæmigert fyrir nýrnastein sem er á leið niður þvagleiðarann.'},
  {sys:'innkirtla', organ:'bris', text:'Unglingur er alltaf þyrstur, pissar oft og hefur grennst án þess að reyna það.', why:'Einkenni sykursýki af tegund 1: brisið hættir að mynda insúlín og blóðsykurinn hækkar.'},
  {sys:'innkirtla', organ:'skjaldkirtill', text:'Kona er alltaf þreytt og kalt, hefur þyngst og hárið hefur þynnst.', why:'Þetta getur bent til vanvirks skjaldkirtils: of lítið þýroxín hægir á efnaskiptunum.'},
  {sys:'stod', organ:'laerleggur', text:'Fótboltamaður heyrði smell í tæklingu og getur ekki stigið í fótinn. Fóturinn er skakkur.', why:'Líklega beinbrot. Bæklunarlæknar gera við brotin bein.'},
  {sys:'hud', organ:'hud', text:'Fæðingarblettur á baki konu hefur stækkað, er orðinn ójafn á litinn og blæðir stundum.', why:'Breytingar á fæðingarbletti geta bent til sortuæxlis og húðlæknir þarf að skoða hann.'},
  {sys:'aexlun', organ:'leg', text:'Kona er komin 20 vikur á leið og fer í ómskoðun til að athuga hvernig fóstrið vex.', why:'Fæðingarlæknar og ljósmæður fylgjast með meðgöngunni.'},
  {sys:'onaemi', organ:'eitlar', text:'Drengur fær bólgu í varir og útbrot um allan líkamann skömmu eftir að hafa borðað hnetur.', why:'Ofnæmisviðbrögð: ónæmiskerfið bregst við efni sem er í raun hættulaust. Bráðaofnæmi getur verið lífshættulegt.'},
];

'use strict';
/* Kennarasíða: leiðbeiningar og fyrirmæli fyrir gervigreind. Opnast með kóða.
   Athugið: kóðinn er aðeins hindrun á vefnum sjálfum; efnið er ekki dulkóðað og á ekki að innihalda trúnaðarupplýsingar. */
const TEACHER_HASH='31be7928bfc25a427a06c27bb176eced2367def9b1be50445b2d9db3a9104004';
const TEACHER_KEY='nasa-kennarar-opid';
const teacherOpen=()=>{try{return sessionStorage.getItem(TEACHER_KEY)==='1';}catch{return false;}};
async function sha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}

const tp={title:'',weeks:'',year:''};
const PH='[LÍMIÐ NÁMSEFNIÐ HÉR: texta, glósur, glærutexta eða afrit úr bók]';
function catBlock(){return CATS.map(c=>`- ${c.id} = ${c.name} (${GROUPS[c.group].name}): ${c.desc}`).join('\n');}
function critBlock(){return CATS.map(c=>`${c.name} (${c.id}):\n`+CRITERIA.filter(x=>AREA[x.g].nasa===c.id).map(x=>`  ${x.id} | ${AREA[x.g].name} · ${x.s}: ${x.t}`).join('\n')).join('\n');}
function themeLine(){return [tp.title&&`Heiti þema: ${tp.title}`,tp.weeks&&`Lengd: ${tp.weeks} vikur`,tp.year&&`Skólaár: ${tp.year}`].filter(Boolean).join('\n')||'Heiti þema: (stingdu upp á heiti)';}

const PROMPTS=[
 {id:'greina',title:'1. Greina námsefnið',when:'Fyrsta skref: fá yfirsýn yfir efnið áður en því er skipt í áherslur.',text:()=>
`Þú ert reyndur kennari í samþættum náttúru- og samfélagsgreinum á unglingastigi (8.–10. bekkur, aldursblandaður hópur) á Íslandi.

Lestu námsefnið hér að neðan og skilaðu á íslensku:
1. Tillögu að heiti þema og 3–5 setninga lýsingu á því sem nemendur kynnast.
2. Lista yfir 10–20 lykilhugtök með stuttri skýringu á hverju.
3. Helstu viðfangsefni, flokkuð eftir því hvort þau eru náttúrufræðileg, samfélagsleg eða hvort tveggja.
4. Hvað vantar eða er veikt í efninu miðað við unglingastig (t.d. tengingu við Ísland, gagnrýna hugsun, tilraunir).

${themeLine()}

Námsefni:
${PH}`},
 {id:'json',title:'2. Áherslulínur sem má flytja beint inn',when:'Aðalskrefið: gervigreindin skiptir efninu í áherslulínur í hæfniflokkum NASA, tengir hæfniviðmið og skilar JSON sem límt er inn hér neðar.',text:()=>
`Þú ert að hjálpa kennara að skrá þema í skólanámskrá NASA (samþættar náttúru- og samfélagsgreinar, 8.–10. bekkur, Norðlingaskóli).

Verkefni: Breyttu námsefninu hér að neðan í áherslulínur. Hver lína er ein afmörkuð áhersla (það sem nemendur læra eða gera) og tilheyrir einum hæfniflokki.

HÆFNIFLOKKAR NASA (notaðu auðkennið vinstra megin í "category"):
${catBlock()}

HÆFNIVIÐMIÐ AÐALNÁMSKRÁR við lok 10. bekkjar (notaðu auðkennin, t.d. "no8", í "criteria"):
${critBlock()}

REGLUR:
- Skrifaðu á vandaðri íslensku. Engin tilvísunarnúmer á borð við [1], ekkert LaTeX ($...$) og engin HTML-tákn (&amp;). Skrifaðu t.d. −2 °C, F = m · a og CO₂.
- Hver lína byrjar á feitletruðu heiti og síðan lýsingu: "**Heiti:** Lýsing í einni til tveimur setningum."
- 12–25 línur. Dreifðu á þá flokka sem efnið gefur raunverulegt tilefni til; ekki búa til línur til að fylla flokka.
- "weight" er 1 nema áherslan sé sérstaklega veigamikil (1.5, 2, 2.5 eða 3) eða smávægileg (0.5).
- "criteria": 1–3 hæfniviðmið sem línan þjálfar í raun. Ekki tengja viðmið sem eru aðeins snert lauslega.
- Skilaðu EINGÖNGU gildu JSON, án skýringa fyrir eða eftir, á þessu sniði:

{
  "format": "nasa-thema",
  "version": 2,
  "title": "${tp.title||'Heiti þema'}",
  "summary": "Lýsing á þemanu í 2–5 setningum. Má nota **feitletrun** og punktalista.",
  "year": "${tp.year||''}",
  "period": "",
  "weeks": ${+tp.weeks||'null'},
  "kind": "Þemalota",
  "entries": [
    {"category": "energy", "note": "**Kraftar og hreyfing:** Nemendur ...", "weight": 1, "criteria": ["no8"]}
  ]
}

${themeLine()}

Námsefni:
${PH}`},
 {id:'markmid',title:'3. Niðurgreind markmið („Ég get …“)',when:'Brýtur áherslulínur niður í skýr markmið fyrir nemendur og tengir þau við B- og A-stig.',text:()=>
`Hér eru áherslulínur í þema í NASA (náttúru- og samfélagsgreinar, 8.–10. bekkur, aldursblandað).

Fyrir hverja línu skaltu skrifa á íslensku:
- 2–3 niðurgreind markmið á máli nemenda sem byrja á „Ég get …“ og lýsa sýnilegri hegðun (útskýrt, borið saman, reiknað, metið …), ekki „skilið“ eða „þekkt“.
- Hvað nemandi sýnir til að ná **B** (hefur náð hæfninni, um 80% á B-prófi; sambærilegt við 1. hæfniþrep framhaldsskóla).
- Hvað aðgreinir **A** (dýpri skilningur, yfirfærsla á nýjar aðstæður, án hjálpargagna).

Settu niðurstöðuna fram sem töflu: Áherslulína | Ég get … | B | A.

Áherslulínur:
[LÍMIÐ ÁHERSLULÍNUR ÞEMANS HÉR]`},
 {id:'prof',title:'4. Drög að B-prófi og A-prófi',when:'Prófspurningar tengdar áherslulínum. Kennarinn fer alltaf yfir og lagar.',text:()=>
`Búðu til drög að prófum fyrir þema í NASA (náttúru- og samfélagsgreinar, 8.–10. bekkur, aldursblandað). Skrifaðu á íslensku.

B-próf:
- Mælir hæfni sambærilega við 1. hæfniþrep framhaldsskóla. 80% árangur eða meira = B.
- 12–20 spurningar sem ná yfir allar áherslulínur, blanda af stuttum svörum, útskýringum og einu verkefni með gögnum (tafla eða graf).
- Merktu hverja spurningu með áherslulínunni sem hún prófar og stigafjölda.

A-próf:
- Þungt próf án hjálpargagna, samtals 25 stig. 20–25 stig = A, 15–19 = B+.
- 3–5 spurningar sem krefjast yfirfærslu, samþættingar náttúru- og samfélagsgreina og rökstuðnings.

Láttu fylgja svarlykil og matsviðmið fyrir hverja spurningu.

Áherslulínur:
[LÍMIÐ ÁHERSLULÍNUR ÞEMANS HÉR]`},
 {id:'haekkun',title:'5. Hugmyndir að hækkunar- og rannsóknarverkefnum',when:'Verkefnabanki: nemendastýrð verkefni (1–3 stig) og stærri rannsóknarverkefni.',text:()=>
`Stingdu upp á verkefnum fyrir þema í NASA (8.–10. bekkur). Skrifaðu á íslensku.

1. Átta hækkunarverkefni: nemendastýrð verkefni sem nemandi og kennari koma sér saman um. Fyrir hvert: heiti, hæfniflokkur NASA, stigafjöldi (1 = lítið, um 1–2 kennslustundir; 2 = miðlungs; 3 = umfangsmikið), lýsing í 2–3 setningum og hvað nemandi skilar.
2. Tvö rannsóknarverkefni fyrir nemendur sem hafa ítrekað sýnt afburðahæfni: rannsóknarspurning, aðferð, gögn og afurð. Þau eru metin á kvarðanum A, B+, B.

Hæfniflokkar NASA:
${catBlock()}

${themeLine()}
Lýsing á þemanu / áherslulínur:
[LÍMIÐ LÝSINGU EÐA ÁHERSLULÍNUR HÉR]`},
 {id:'adlogun',title:'6. Aðlögun texta og stuðningur',when:'Léttlestrarútgáfa, orðalisti eða þýðing á ensku efni.',text:()=>
`Aðlagaðu textann hér að neðan fyrir nemendur í 8.–10. bekk sem þurfa stuðning í lestri. Skrifaðu á íslensku.

1. Léttlestrarútgáfa: stuttar setningar, algeng orð, sama innihald og hugtök. Feitletraðu lykilhugtök.
2. Orðalisti með 10–15 lykilhugtökum og einfaldri skýringu.
3. Fimm skilningsspurningar, frá einfaldri upprifjun að einni sem krefst rökstuðnings.
Ef textinn er á ensku skaltu þýða hann fyrst á vandaða íslensku.

Texti:
${PH}`},
 {id:'yfirlestur',title:'7. Yfirlestur á áherslulínum',when:'Lokaskref: hreinsa texta áður en hann fer inn í námskrána.',text:()=>
`Lestu yfir áherslulínurnar hér að neðan. Leiðréttu stafsetningu, málfar og innsláttarvillur á íslensku. Fjarlægðu tilvísunarnúmer á borð við [1] eða tölur sem límast við orð, breyttu LaTeX ($...$) og HTML-táknum (&amp;) í venjulegan texta, og ensk orð í íslensk þar sem það á við. Haltu sniðinu "**Heiti:** Lýsing." Breyttu ekki efnislegu innihaldi. Skilaðu leiðréttum línum og lista yfir það sem þú breyttir.

Áherslulínur:
[LÍMIÐ ÁHERSLULÍNUR HÉR]`}
];

VIEWS.kennarar={render(){
  if(!teacherOpen())return intro('Fyrir kennara','Kennarasvæði','Hér eru hagnýtar leiðbeiningar fyrir kennara um vefinn og um notkun gervigreindar við að breyta námsefni í áherslur og markmið. Sláðu inn kóðann til að opna.')+
    `<section class="panel" style="max-width:420px"><form id="tForm"><div class="field"><label for="tCode">Kóði</label><input id="tCode" inputmode="numeric" autocomplete="off" autofocus></div><button class="primary">Opna</button><p class="notice" id="tErr" role="alert"></p></form></section>`;
  return intro('Fyrir kennara','Leiðbeiningar fyrir kennara','Hagnýtar leiðbeiningar um hvernig vefurinn nýtist við skipulag NASA og hvernig gervigreind getur hjálpað til við að breyta völdu námsefni í áherslulínur, niðurgreind markmið, próf og verkefni.','<button data-act="tLock">Loka kennarasvæði</button>')+
  `<nav class="panel tnav">${['Vinnuferlið','Vefurinn skref fyrir skref','Gervigreind: fyrirmæli','Líma inn frá gervigreind','Gæðaeftirlit og góð ráð'].map((t,i)=>`<a href="#t${i}">${t}</a>`).join('')}</nav>

  <section class="panel" id="t0"><h2>Vinnuferlið í stuttu máli</h2><div class="markdown">${markdown(
`1. **Veldu efni.** Kennarahópurinn velur þema, gjarnan með nemendum og út frá því sem er efst á baugi. Skoðaðu fyrst **Jafnvægi** til að sjá hvaða hæfniflokkar og hæfniviðmið hafa fengið of lítið vægi síðustu tvö ár.
2. **Safnaðu námsefninu.** Texta, glærur, greinar, myndbandshandrit eða kafla úr bók.
3. **Láttu gervigreind greina og skipta efninu** (fyrirmæli 1 og 2 hér að neðan). Afurðin er JSON-skrá með áherslulínum í hæfniflokkum NASA, tengdum hæfniviðmiðum.
4. **Límdu niðurstöðuna inn** neðst á þessari síðu. Þemað birtist þá í skrefi 4 (Þemu).
5. **Farðu yfir og lagaðu.** Kennarinn ber ábyrgð á innihaldinu: lagaðu orðalag, vægi og tengd hæfniviðmið í þemaritlinum.
6. **Búðu til markmið, próf og verkefni** (fyrirmæli 3–6).
7. **Skráðu vikufjölda** og athugaðu **Jafnvægi**. Sæktu **Námskrá · JSON** og vistaðu á sameiginlegu drifi.`)}</div></section>

  <section class="panel" id="t1"><h2>Vefurinn skref fyrir skref</h2><div class="markdown">${markdown(
`- **Vistun:** Vinnan vistast sjálfkrafa í vafranum, en **aðeins á þeirri tölvu og í þeim vafra**. Sæktu **Námskrá · JSON** í lok hverrar vinnulotu og geymdu á sameiginlegu drifi. Sá sem tekur við opnar skrána með **Opna skrá**.
- **Samvinna:** Tveir kennarar ættu ekki að vinna samtímis í sömu skrá. Til að deila einu þema má nota **Sækja þetta þema: JSON** í þemaritlinum. Sá sem fær skrána opnar hana með **Opna skrá** og þemað bætist við námskrána hans.
- **Skref 3 · Hæfniflokkar:** Hér er vægið (samtals 100%, 50/50 milli sviða). Smelltu á flokk til að sjá hvaða hæfniviðmið aðalnámskrár tilheyra honum.
- **Skref 4 · Þemu:** Ein lína er ein áhersla. Smelltu á sneið í þemamyndinni til að bæta við línu í þeim flokki. Vægi línu (×0,5–×3) segir hve stór hluti þemans hún er. Undir hverri línu er **Tengja hæfniviðmið**.
- **Skref 6 · Námsmat:** Reglur um B-próf, forgjöf, hækkunarstig, A-próf og lokaeinkunn, með reiknivélum til að prófa dæmi.
- **Skref 7 · Jafnvægi:** Veldu rúllandi þriggja ára glugga. Rauð frávik (yfir 2 prósentustig) segja hvaða flokkum þarf að sinna í þemavali næsta árs. Neðst sést hvaða hæfniviðmið eru enn ótengd.
- **Skref 8 · Útgáfa:** Gátlisti og PDF-skjal til birtingar.
- **Markdown:** **feitletrun** með tveimur stjörnum, *skáletrun* með einni, lista með - eða 1. Sjá yfirlit undir hverjum textareit.`)}</div></section>

  <section class="panel" id="t2"><h2>Gervigreind: fyrirmæli til að afrita</h2>
  <p class="hint">Fyrirmælin virka í algengum spjallmennum (t.d. Claude, ChatGPT, Gemini eða Copilot). Fylltu út reitina hér fyrir neðan; þeir bætast sjálfkrafa inn í fyrirmælin. Afritaðu síðan, límdu inn í spjallið og settu námsefnið í stað hornklofans. Listar yfir hæfniflokka og hæfniviðmið eru teknir beint úr vefnum og eru því alltaf réttir.</p>
  <div class="row"><div class="field"><label for="tpTitle">Heiti þema</label><input id="tpTitle" data-tp="title" value="${esc(tp.title)}"></div><div class="field"><label for="tpWeeks">Vikur</label><input id="tpWeeks" type="number" min="0" step="0.5" data-tp="weeks" value="${esc(tp.weeks)}"></div><div class="field"><label for="tpYear">Skólaár</label><select id="tpYear" data-tp="year"><option value="">Óskilgreint</option>${allYears().map(y=>`<option ${tp.year===y?'selected':''}>${esc(y)}</option>`).join('')}</select></div></div>
  <div id="tPrompts"></div></section>

  <section class="panel" id="t3"><h2>Líma inn frá gervigreind</h2><p class="hint">Límdu JSON-svarið úr fyrirmælum 2 hér og veldu <b>Flytja inn</b>. Þemað bætist við námskrána og opnast í skrefi 4. Ef svarið er umlukið \`\`\`json … \`\`\` er það í lagi.</p>
  <textarea id="tPaste" style="min-height:180px;font-family:ui-monospace,monospace;font-size:12.5px" placeholder='{"format":"nasa-thema", "title":"…", "entries":[…]}'></textarea>
  <div class="toolbar" style="margin-top:10px"><button class="primary" data-act="tImport">Flytja inn</button><span class="hint" id="tPasteMsg" role="status" style="margin:0"></span></div></section>

  <section class="panel" id="t4"><h2>Gæðaeftirlit og góð ráð</h2><div class="markdown">${markdown(
`- **Kennarinn ber ábyrgð.** Gervigreind getur fullyrt rangt, ruglað ártölum eða búið til heimildir. Staðreyndaprófaðu nöfn, ártöl, tölur og eðlisfræði.
- **Persónuvernd:** Settu aldrei nöfn nemenda, einkunnir eða aðrar persónuupplýsingar inn í gervigreind.
- **Höfundaréttur:** Notaðu útdrætti úr námsefni, ekki heilar bækur. Skráðu hvaðan efnið kemur í lýsingu þemans.
- **Algengar villur í svörum:** tilvísunarnúmer ([1], [3][4]), LaTeX ($F = m \\cdot a$), HTML-tákn (&amp;amp;), enskuslettur og tölur sem límast við orð. Fyrirmæli 7 hreinsa þetta.
- **Ekki of margar línur.** 12–25 línur í lengri þemalotu, 3–8 í smiðju. Notaðu vægi frekar en að endurtaka sömu áherslu.
- **Hæfniviðmið:** Tengdu aðeins það sem er í raun þjálfað og metið. Betra er að tengja færri viðmið vel en mörg lauslega.
- **Jafnvægi yfir tíma:** Eitt þema þarf ekki að vera 50/50. Það sem skiptir máli er rúllandi þriggja ára glugginn.
- **Láttu gervigreind spyrja þig:** Bættu við „Spurðu mig þriggja spurninga um nemendahópinn áður en þú svarar“ til að fá markvissari niðurstöðu.`)}</div></section>`;
},
after(){if(teacherOpen())this.prompts();else{$('tForm').onsubmit=async e=>{e.preventDefault();let ok=false;try{ok=await sha256($('tCode').value.trim())===TEACHER_HASH;}catch{$('tErr').textContent='Vafrinn styður ekki kóðaprófun. Opnaðu vefinn í nýlegum vafra.';return;}
  if(ok){try{sessionStorage.setItem(TEACHER_KEY,'1');}catch{}render();}else{$('tErr').textContent='Rangur kóði.';$('tCode').select();}};}},
prompts(){$('tPrompts').innerHTML=PROMPTS.map(p=>`<div class="prompt"><div class="toolbar" style="justify-content:space-between"><h3 style="margin:0">${esc(p.title)}</h3><button class="small" data-copy="${p.id}">Afrita</button></div><p class="hint" style="margin:4px 0 8px">${esc(p.when)}</p><details><summary>Sýna fyrirmælin</summary><pre>${esc(p.text())}</pre></details></div>`).join('');}
};

document.addEventListener('input',e=>{const k=e.target.dataset?.tp;if(k===undefined)return;tp[k]=e.target.value;if(ui.step==='kennarar')VIEWS.kennarar.prompts();});
document.addEventListener('click',async e=>{
  const ta=e.target.closest('.tnav a');if(ta){e.preventDefault();document.querySelector(ta.getAttribute('href'))?.scrollIntoView({behavior:'smooth'});return;}
  const c=e.target.closest('[data-copy]');
  if(c){const p=PROMPTS.find(x=>x.id===c.dataset.copy);try{await navigator.clipboard.writeText(p.text());toast('Fyrirmæli afrituð. Límdu þau inn í spjallmennið.');}catch{const ta=document.createElement('textarea');ta.value=p.text();document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Fyrirmæli afrituð.');}return;}
  const b=e.target.closest('[data-act]');if(!b)return;
  if(b.dataset.act==='tLock'){try{sessionStorage.removeItem(TEACHER_KEY);}catch{}go('start');}
  if(b.dataset.act==='tImport'){
    const raw=$('tPaste').value.trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'');
    try{
      const o=JSON.parse(raw),list=Array.isArray(o)?o:Array.isArray(o.themes)?o.themes:[o];
      if(!list.length||!list.every(t=>t&&typeof t.title==='string'&&Array.isArray(t.entries)))throw Error('Svarið inniheldur ekki þema með "title" og "entries".');
      let n=0,bad=0;list.forEach(t=>{bad+=t.entries.filter(e=>!CAT[e?.category]&&e?.category!=='human').length;const th=normTheme({...t,id:uid()});D.themes.push(th);ui.theme=th.id;n++;});
      changed();$('tPaste').value='';toast(n+(n===1?' þema flutt inn.':' þemu flutt inn.')+(bad?` ${bad} línur fengu flokkinn Vinnulag því flokkurinn var óþekktur.`:''));go('themes');
    }catch(err){$('tPasteMsg').textContent='Ekki tókst að lesa svarið: '+(err.message||'ógilt JSON')+'. Athugaðu að afrita allt svarið.';}
  }
});
if(location.hash==='#kennarar')go('kennarar',false);

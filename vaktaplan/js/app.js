'use strict';
/* Vaktaplan · viðmót. Gögnin (S) vistast í localStorage og má sækja/opna sem JSON. */
const KEY='vaktaplan.v1',STEP_KEY='vaktaplan.step';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=1)=>VP.fmtNum(n,d);
const fmtS=(n,d=1)=>(n>0.005?'+':'')+fmt(n,d);
const STEPS=[
  {id:'grunnur',t:'Grunnur'},{id:'vaktir',t:'Vaktir'},{id:'starfsfolk',t:'Starfsfólk'},{id:'dagatal',t:'Hátíðis- og rauðir dagar'},
  {id:'oskir',t:'Óskir og fjarvistir'},{id:'plan',t:'Vaktaplan'},{id:'utreikningar',t:'Útreikningar'},{id:'utgafa',t:'Útgáfa'}];

/* ---------- Gögn ---------- */
function normalize(s){
  const d=VPD.sampleState();
  s=Object.assign({version:1,workplace:{name:'',unit:'',manager:''},plan:{},locks:{},wishes:{},needOverride:{}},s||{});
  s.rules=Object.assign(VPD.defaultRules(),s.rules||{});s.rules.rates=Object.assign(VPD.defaultRules().rates,s.rules.rates||{});
  s.period=s.period&&s.period.year?s.period:d.period;
  s.shifts=(s.shifts||[]).map(x=>({id:x.id||VPD.uid('s'),code:x.code||'?',name:x.name||'',start:x.start||'08:00',end:x.end||'16:00',break:+x.break||0,
    color:x.color||'#cccccc',demand:Array.from({length:9},(_,i)=>x.demand&&x.demand[i]!=null?x.demand[i]:(i<7?0:'')),max:x.max??'',cat:x.cat||'',countsAs:x.countsAs||''}));
  s.absTypes=s.absTypes&&s.absTypes.length?s.absTypes:VPD.defaultAbsTypes();
  s.employees=(s.employees||[]).map(e=>newEmp(e));
  if(!Array.isArray(s.holidays))s.holidays=VP.holidaysForPeriod(s.period);
  for(const k of ['plan','locks','wishes','needOverride'])if(!s[k]||typeof s[k]!=='object')s[k]={};
  return s;
}
function newEmp(e={}){
  let pl=e.prefLevels&&typeof e.prefLevels==='object'?e.prefLevels:null;
  if(!pl){pl={};if(e.prefs&&e.prefs.length)VP.PREF_CATS.forEach(([k])=>pl[k]=e.prefs.includes(k)?2:0);}
  return {id:e.id||VPD.uid('e'),name:e.name||'',title:e.title||'',pct:e.pct??100,status:e.status||'active',prefs:[],prefLevels:pl,
  priority:e.priority||2,fixedShift:e.fixedShift||'',maxWeekends:e.maxWeekends??'',maxConsec:e.maxConsec??'',
  changes:e.changes||[],allowed:e.allowed||[],noDays:e.noDays||[],carry:e.carry??0,fixedTarget:e.fixedTarget??'',weekly:e.weekly??'',note:e.note||''};}
const SAMPLES=()=>[{id:'demo',name:'Almennt sýnidæmi',build:()=>({state:VPD.sampleState()})},...(window.VP_SAMPLES||[])];
function sampleState(id){const x=SAMPLES().find(z=>z.id===id)||SAMPLES()[0];const r=x.build();return {state:normalize(r.state),report:r.report};}
function load(){try{const r=localStorage.getItem(KEY);return r?normalize(JSON.parse(r)):null;}catch(e){return null;}}
let S=load()||sampleState((window.VP_SAMPLES||[])[0]?.id||'demo').state;
let step=Math.min(+(()=>{try{return localStorage.getItem(STEP_KEY)}catch(e){return 0}})()||0,STEPS.length-1);
let saveT=null;
function save(){
  clearTimeout(saveT);
  saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S));$('#saveState').textContent='Vistað í vafranum kl. '+new Date().toTimeString().slice(0,5);}
    catch(e){$('#saveState').textContent='Ekki tókst að vista í vafranum: '+e.message;}},250);
}
const undo=[];
function pushUndo(){undo.push(JSON.stringify(S));if(undo.length>40)undo.shift();updUndo();}
function doUndo(){if(!undo.length)return;S=normalize(JSON.parse(undo.pop()));save();render();toast('Síðasta breyting afturkölluð');}
function updUndo(){const b=$('#undoBtn');if(b)b.disabled=!undo.length;}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2600);}
async function download(name,data,type){
  const blob=data instanceof Blob?data:new Blob([data],{type});
  const dl=window.claude&&window.claude.use?await window.claude.use('downloads').catch(()=>null):null;
  if(dl){try{await dl.save({filename:name,data:blob});toast('Vistað: '+name);}catch(e){if(e&&e.code!=='declined')toast('Ekki tókst að vista skrána ('+(e.code||e.message)+')');}return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
}
window.VPDownload=download;
/* Staðfesting í síðunni sjálfri (confirm/prompt virka ekki alls staðar). Skilar true/false, eða texta/null ef input er gefið. */
function ask(msg,{ok='Já, halda áfram',cancel='Hætta við',input=null}={}){
  return new Promise(res=>{
    const back=document.createElement('div');back.className='dlg-back';
    back.innerHTML=`<div class="dlg" role="dialog" aria-modal="true"><p>${esc(msg).replace(/\n/g,'<br>')}</p>${input!=null?`<input id="dlgIn" value="${esc(input)}">`:''}
      <div class="toolbar"><button id="dlgNo">${esc(cancel)}</button><button id="dlgOk" class="primary">${esc(ok)}</button></div></div>`;
    document.body.appendChild(back);
    const close=v=>{back.remove();res(v);};
    back.querySelector('#dlgOk').onclick=()=>close(input!=null?back.querySelector('#dlgIn').value:true);
    back.querySelector('#dlgNo').onclick=()=>close(input!=null?null:false);
    back.addEventListener('click',e=>{if(e.target===back)close(input!=null?null:false);});
    back.addEventListener('keydown',e=>{if(e.key==='Escape')close(input!=null?null:false);if(e.key==='Enter'&&input!=null)back.querySelector('#dlgOk').click();});
    (back.querySelector('#dlgIn')||back.querySelector('#dlgOk')).focus();
  });
}
function choose(msg,choices){
  return new Promise(res=>{
    const back=document.createElement('div');back.className='dlg-back';
    back.innerHTML=`<div class="dlg" role="dialog" aria-modal="true"><p>${esc(msg)}</p><div class="choices">${choices.map(([v,t],j)=>`<button data-c="${j}" class="${j?'':'primary'}">${esc(t)}</button>`).join('')}</div>
      <div class="toolbar"><button id="dlgNo">Hætta við</button></div></div>`;
    document.body.appendChild(back);const close=v=>{back.remove();res(v);};
    back.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>close(choices[+b.dataset.c][0]));
    back.querySelector('#dlgNo').onclick=()=>close(null);
    back.addEventListener('keydown',e=>{if(e.key==='Escape')close(null);});back.querySelector('[data-c]').focus();
  });
}
/* Vaktir eins dags: breyta fjölda á hverri vakt eða bæta við tilfallandi vakt */
function dayEditor(d){
  const C=VP.buildCtx(S),i=C.idx[d];if(i==null)return;
  const base={...C,state:{...S,needOverride:{}}};
  const main=C.shifts.filter(s=>!s.countsAs&&(!s.adhoc||S.needOverride[d+'|'+s.id]!=null||VP.needFor(C,i,s)>0));
  const back=document.createElement('div');back.className='dlg-back';
  const f=C.infos[i];
  back.innerHTML=`<div class="dlg wide" role="dialog" aria-modal="true"><h2 style="margin:0">Vaktir ${esc(VP.dateLabel(d))}${f.hol?` <span class="lg ${f.hol.kind}">${esc(f.hol.name)}</span>`:''}</h2>
    <p class="muted small" style="margin:0">Fjöldi á hverri vakt þennan dag. Sjálfgefið kemur frá vaktaskipulaginu (skref 2). Breyttar tölur eru feitletraðar.</p>
    <table class="data dayed"><thead><tr><th>Vakt</th><th>Tími</th><th class="num">Sjálfgefið</th><th class="num">Þennan dag</th></tr></thead><tbody>
    ${main.map(s=>{const def=VP.needFor(base,i,s),cur=S.needOverride[d+'|'+s.id];return `<tr><td><span class="sw" style="background:${s.color}"></span>${esc(s.code)} · ${esc(s.name)}${s.adhoc?' <span class="tag">tilfallandi</span>':''}</td><td>${esc(s.start)}–${esc(s.end)}</td><td class="num">${def}</td>
      <td class="num"><input type="number" min="0" class="xs ${cur!=null?'ovr':''}" data-dn="${s.id}" value="${cur??def}" data-def="${def}"></td></tr>`;}).join('')}
    </tbody></table>
    <h3 style="margin:6px 0 0">Tilfallandi vakt</h3>
    <div class="row" style="align-items:end"><div class="field" style="margin:0"><label>Hefst</label><input type="time" id="adS" value="10:00"></div><div class="field" style="margin:0"><label>Lýkur</label><input type="time" id="adE" value="14:00"></div>
     <div class="field" style="margin:0;max-width:90px"><label>Fjöldi</label><input type="number" id="adN" min="1" value="1"></div><button id="adAdd">+ Bæta við</button></div>
    <div class="toolbar" style="justify-content:space-between"><button id="dReset">Endurstilla dag</button><span class="toolbar"><button id="dNo">Hætta við</button><button id="dOk" class="primary">Vista</button></span></div></div>`;
  document.body.appendChild(back);
  const close=()=>back.remove();
  back.querySelector('#dNo').onclick=close;back.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  back.querySelector('#dOk').onclick=()=>{pushUndo();back.querySelectorAll('[data-dn]').forEach(inp=>{const k=d+'|'+inp.dataset.dn,v=inp.value.trim();
      if(v===''||+v===+inp.dataset.def)delete S.needOverride[k];else S.needOverride[k]=Math.max(0,parseInt(v)||0);});
    save();close();render();toast('Vaktir '+VP.dateLabel(d)+' uppfærðar');};
  back.querySelector('#dReset').onclick=()=>{pushUndo();for(const k of Object.keys(S.needOverride))if(k.startsWith(d+'|'))delete S.needOverride[k];save();close();render();toast('Sjálfgefnar vaktir '+VP.dateLabel(d));};
  back.querySelector('#adAdd').onclick=()=>{const a=back.querySelector('#adS').value,b=back.querySelector('#adE').value,n=Math.max(1,parseInt(back.querySelector('#adN').value)||1);
    if(!a||!b){toast('Veldu tíma');return;}
    const t=VP.shiftTimes({start:a,end:b==='00:00'?'24:00':b});
    let sh=S.shifts.find(x=>x.adhoc&&x.start===a&&x.end===(b==='00:00'?'24:00':b));
    pushUndo();
    if(!sh){sh={id:VPD.uid('s'),code:`${+a.slice(0,2)}-${+b.slice(0,2)}`,name:'Tilfallandi vakt',start:a,end:b==='00:00'?'24:00':b,break:0,color:'#d9c7a7',
      cat:VP.guessCat(t.m0,t.m1,f.weekend||!!f.hol),demand:[0,0,0,0,0,0,0,0,0],max:'',countsAs:'',adhoc:true};S.shifts.push(sh);}
    S.needOverride[d+'|'+sh.id]=(+S.needOverride[d+'|'+sh.id]||0)+n;save();close();render();dayEditor(d);};
  back.querySelector('input').focus();
}
function setPath(path,val){const ks=path.split('.');let o=S;for(let i=0;i<ks.length-1;i++)o=o[ks[i]];o[ks[ks.length-1]]=val;}
function getPath(path){return path.split('.').reduce((o,k)=>o==null?o:o[k],S);}
const K=(e,d)=>e+'|'+d;
const shiftById=id=>S.shifts.find(s=>s.id===id),absById=id=>S.absTypes.find(a=>a.id===id),empById=id=>S.employees.find(e=>e.id===id);
const fileSlug=()=>(S.workplace.name||'vaktaplan').toLowerCase().replace(/ð/g,'d').replace(/þ/g,'th').replace(/æ/g,'ae').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'')+'-'+VP.periodRange(S.period.year,S.period.month).start.slice(0,7);
function textColor(hex){const h=(hex||'#ccc').replace('#','');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return (r*299+g*587+b*114)/1000>150?'#1d2b2f':'#fff';}

/* ---------- Ramminn ---------- */
function renderStepper(){
  $('#stepper').innerHTML=STEPS.map((s,i)=>`<button data-step="${i}" ${i===step?'aria-current="step"':''}><span class="n">${i+1}</span>${esc(s.t)}</button>`).join('');
}
function render(){
  renderStepper();
  $('#periodBadge').textContent=VP.periodLabel(S.period);
  $('#wpName').textContent=S.workplace.name||'Vaktaplan';
  const v=$('#view');closePop();
  v.innerHTML=VIEWS[STEPS[step].id]();
  AFTER[STEPS[step].id]?.();
  updUndo();
}
function go(i){step=Math.max(0,Math.min(STEPS.length-1,i));try{localStorage.setItem(STEP_KEY,step);}catch(e){}render();window.scrollTo(0,0);}
function rerender(){const sx=window.scrollX,sy=window.scrollY;render();window.scrollTo(sx,sy);}
const navBtns=()=>`<div class="navbtns">${step>0?`<button data-go="${step-1}">← ${esc(STEPS[step-1].t)}</button>`:'<span></span>'}${step<STEPS.length-1?`<button class="primary" data-go="${step+1}">${esc(STEPS[step+1].t)} →</button>`:''}</div>`;
const intro=(t,p)=>`<div class="intro"><div><p class="eyebrow">Skref ${step+1} af ${STEPS.length}</p><h1>${esc(t)}</h1>${p?`<p>${p}</p>`:''}</div></div>`;
const num=(k,v,attrs='')=>`<input type="number" data-k="${k}" data-num value="${esc(v)}" ${attrs}>`;

/* ---------- Skref 1: Grunnur ---------- */
function periodOptions(){
  const cur=VPD.nextPeriod(),opts=[];
  for(let y=cur.year-1;y<=cur.year+2;y++)for(let m=1;m<=12;m++){const p={year:y,month:m};opts.push(`<option value="${y}-${m}" ${S.period.year===y&&S.period.month===m?'selected':''}>${esc(VP.periodLabel(p))}</option>`);}
  return opts.join('');
}
const VIEWS={};const AFTER={};
VIEWS.grunnur=()=>{
  const C=VP.buildCtx(S),R=S.rules,full=VP.round2(C.effWorkdays*C.daily);
  return intro('Grunnupplýsingar','Vaktatímabilið er frá 16. hvers mánaðar til 15. næsta mánaðar. Hér eru líka reglurnar sem vaktaröðunin fylgir og forsendur útreikninga.')+`
  <div class="grid2">
   <section class="panel"><h2>Vinnustaður</h2>
    <div class="field"><label>Heiti vinnustaðar</label><input data-k="workplace.name" data-hdr value="${esc(S.workplace.name)}"></div>
    <div class="row"><div class="field"><label>Deild / eining</label><input data-k="workplace.unit" value="${esc(S.workplace.unit)}"></div>
    <div class="field"><label>Ábyrgðarmaður plans</label><input data-k="workplace.manager" value="${esc(S.workplace.manager)}"></div></div>
    <h2 style="margin-top:8px">Tímabil</h2>
    <div class="row" style="align-items:end"><button id="pPrev" title="Fyrra tímabil">←</button>
     <div class="field" style="margin:0;flex:1"><label>Vaktatímabil</label><select id="periodSel">${periodOptions()}</select></div>
     <button id="pNext" title="Næsta tímabil">→</button></div>
    <div class="facts">
     <div><b>${C.n}</b><span>dagar</span></div><div><b>${C.workdays}</b><span>virkir dagar (mán–fös)</span></div>
     <div><b>${fmt(C.holReduction)}</b><span>frídagar á virkum degi</span></div><div><b>${fmt(full)}</b><span>klst. vinnuskylda í 100% starfi</span></div></div>
   </section>
   <section class="panel"><h2>Vinnuskylda</h2>
    <div class="row"><div class="field"><label>Vinnustundir á viku í 100% starfi</label>${num('rules.weekly',R.weekly,'min="1" max="60" step="0.1" data-re')}</div>
    <div class="field"><label>Vikmörk mismunar (klst.)</label>${num('rules.hourTolerance',R.hourTolerance,'min="0" step="0.5"')}</div></div>
    <label class="check"><input type="checkbox" data-k="rules.holidaysReduce" data-re ${R.holidaysReduce?'checked':''}> Rauðir dagar og stórhátíðardagar á virkum degi lækka vinnuskyldu (hálfur dagur ef dagurinn gildir frá hádegi)</label>
    <p class="hint">Vinnuskylda starfsmanns = (virkir dagar − frídagar á virkum degi) × ${fmt(C.daily,2)} klst. × starfshlutfall. Fjarvistir sem teljast til vinnuskyldu (t.d. orlof og veikindi) reiknast á sama hátt fyrir hvern virkan dag. Fyrir einstakan starfsmann má setja fasta vinnuskyldu í skrefinu Starfsfólk.</p>
   </section>
  </div>
  <section class="panel"><h2>Reglur við vaktaröðun</h2>
   <div class="grid4">
    <div class="field"><label>Lágmarkshvíld milli vakta (klst.)</label>${num('rules.minRest',R.minRest,'min="0" max="24" step="0.5"')}</div>
    <div class="field"><label>Hámark vinnudaga í röð</label>${num('rules.maxConsec',R.maxConsec,'min="1" max="14"')}</div>
    <div class="field"><label>Má fara mest yfir vinnuskyldu um (klst.)</label>${num('rules.maxOver',R.maxOver,'min="0" step="0.5"')}</div>
   </div>
   <label class="check"><input type="checkbox" data-k="rules.hardWishes" ${R.hardWishes?'checked':''}> Óskir um frí eru bindandi (annars reynir röðunin að virða þær en má víkja frá þeim)</label>
   <label class="check"><input type="checkbox" data-k="rules.fillUp" ${R.fillUp?'checked':''}> Fylla upp í vinnuskyldu með aukavöktum umfram lágmarksmönnun (að hámarki „hámark á vakt“ ef það er skráð)</label>
   <label class="check"><input type="checkbox" data-k="rules.wishFirst" ${R.wishFirst!==false?'checked':''}> Úthluta óskum um vaktir fyrst. Ef fleiri óska eftir vakt en pláss er ræður forgangur starfsmanns, síðan hver hefur fengið hlutfallslega fæstar óskir uppfylltar.</label>
   <label class="check"><input type="checkbox" data-k="rules.lockManual" ${R.lockManual?'checked':''}> Læsa vöktum sem eru settar inn handvirkt svo þær haldist þegar raðað er aftur</label>
   <p class="hint">Hvíldartími samkvæmt vinnutímaákvæðum kjarasamninga er að jafnaði 11 klst. á sólarhring og a.m.k. einn frídagur á viku.</p>
   <p class="hint"><b>Röð röðunar:</b> 1) föstu vaktir, 2) óskir um vaktir, 3) það sem eftir er. Þá er valinn sá sem á hlutfallslega mest eftir af vinnuskyldu, með tilliti til „Helst/Má/Ekki“, jafnrar dreifingar helga og nátta eftir starfshlutfalli, hvíldar, vinnudaga í röð og hámarks helga. Nokkur hundruð útgáfur eru prófaðar og sú sanngjarnasta valin. Forsendur hvers starfsmanns eru stilltar á starfsmannablaðinu.</p>
  </section>
  <section class="panel"><h2>Tímamörk og álag</h2>
   <p class="hint">Unnar stundir eru flokkaðar eftir því hvenær þær eru unnar. Á rauðum dögum og stórhátíðardögum gilda þeir flokkar framar öðrum. Álagsprósentur eru notaðar til að reikna álagsstundir (klst. × %). Breyttu þeim í samræmi við kjarasamning.</p>
   <div class="grid4">
    <div class="field"><label>Dagvinna hefst</label><input type="time" data-k="rules.dayStart" data-re value="${esc(R.dayStart)}"></div>
    <div class="field"><label>Dagvinnu lýkur / kvöld hefst</label><input type="time" data-k="rules.dayEnd" data-re value="${esc(R.dayEnd)}"></div>
    <div class="field"><label>Kvöldi lýkur / nótt hefst</label><input type="time" data-k="rules.eveningEnd" data-re value="${esc(R.eveningEnd==='24:00'?'00:00':R.eveningEnd)}"></div>
   </div>
   <div class="grid5">${['evening','night','weekend','red','major'].map(c=>`<div class="field"><label>${VP.CAT_NAMES[c]} (%)</label>${num('rules.rates.'+c,R.rates[c],'min="0" step="0.01"')}</div>`).join('')}</div>
  </section>
  <section class="panel"><h2>Byrja upp á nýtt</h2>
   <div class="toolbar"><select id="sampleSel" style="width:auto">${SAMPLES().map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select><button id="loadSample">Hlaða sýnidæmi</button><button id="startBlank" class="danger">Byrja með autt plan</button><button data-act="open">Opna JSON-skrá</button></div>
   <p class="hint">„Byrja með autt plan“ eyðir vöktum, starfsfólki og plani í vafranum. Sæktu JSON-afrit fyrst ef þú vilt geyma núverandi vinnu.</p>
  </section>`+navBtns();
};
AFTER.grunnur=()=>{
  $('#periodSel').onchange=e=>{const [y,m]=e.target.value.split('-').map(Number);setPeriod({year:y,month:m});};
  $('#pPrev').onclick=()=>{let {year:y,month:m}=S.period;m--;if(m<1){m=12;y--;}setPeriod({year:y,month:m});};
  $('#pNext').onclick=()=>{let {year:y,month:m}=S.period;m++;if(m>12){m=1;y++;}setPeriod({year:y,month:m});};
  $('#loadSample').onclick=async()=>{const id=$('#sampleSel').value,nm=$('#sampleSel').selectedOptions[0].textContent;
    if(!await ask(`Skipta núverandi gögnum út fyrir „${nm}“?`))return;pushUndo();S=sampleState(id).state;lastGen=null;save();render();toast(nm+' hlaðið');};
  $('#startBlank').onclick=async()=>{if(!await ask('Eyða öllum vöktum, starfsfólki og plani?'))return;pushUndo();
    S=normalize({workplace:{name:'',unit:'',manager:''},period:S.period,rules:S.rules,shifts:[],employees:[],absTypes:VPD.defaultAbsTypes()});save();render();};
};
function setPeriod(p){
  const custom=(S.holidays||[]).filter(h=>h.custom);
  S.period=p;const {start,end}=VP.periodRange(p.year,p.month);
  const auto=VP.holidaysForPeriod(p),dates=new Set(auto.map(h=>h.date));
  S.holidays=[...auto,...custom.filter(h=>h.date>=start&&h.date<=end&&!dates.has(h.date))].sort((a,b)=>a.date<b.date?-1:1);
  save();render();
}

/* ---------- Skref 2: Vaktir ---------- */
const DEM_HEAD=['Mán','Þri','Mið','Fim','Fös','Lau','Sun','Rauður','Stórhát.'];
VIEWS.vaktir=()=>intro('Tegundir vakta','Skráðu vaktirnar, tíma þeirra og hve marga þarf á hverja vakt eftir vikudögum. Vakt sem lýkur fyrir upphafstíma nær yfir miðnætti og telst til dagsins sem hún hefst. Ef reitur fyrir rauðan dag eða stórhátíðardag er auður gildir mönnun sunnudags. <b>Flokkur</b> tengir vaktina við óskir starfsfólks (t.d. „Kvöldvaktir um helgar“). <b>Telst sem</b> gerir vakt að afbrigði (t.d. 08–13 í stað 08–16) sem telst með aðalvaktinni í mönnun. Afbrigði verða sjálfkrafa til við innlestur.')+`
 <section class="panel"><div class="tablewrap"><table class="edit shifts"><thead><tr><th>Litur</th><th>Kóði</th><th>Heiti</th><th>Hefst</th><th>Lýkur</th><th>Ógreitt hlé (mín.)</th><th>Klst.</th><th title="Flokkur sem starfsfólk velur sér (óskir)">Flokkur</th><th title="Afbrigði telst með þessari vakt í mönnun">Telst sem</th>
  ${DEM_HEAD.map((d,i)=>`<th class="dem ${i>=7?(i===7?'red':'major'):i>=5?'wkend':''}">${d}</th>`).join('')}<th title="Hámark á vakt þegar fyllt er upp í vinnuskyldu">Hámark</th><th></th></tr></thead><tbody>
  ${S.shifts.map((s,i)=>{const t=VP.shiftTimes(s);return `<tr>
   <td><input type="color" data-k="shifts.${i}.color" value="${esc(s.color)}"></td>
   <td><input class="code" data-k="shifts.${i}.code" maxlength="3" value="${esc(s.code)}"></td>
   <td><input data-k="shifts.${i}.name" value="${esc(s.name)}"></td>
   <td><input type="time" data-k="shifts.${i}.start" data-re value="${esc(s.start)}"></td>
   <td><input type="time" data-k="shifts.${i}.end" data-re value="${esc(s.end==='24:00'?'00:00':s.end)}"></td>
   <td><input type="number" class="sm" data-k="shifts.${i}.break" data-num data-re min="0" step="5" value="${esc(s.break)}"></td>
   <td class="num"><b>${fmt(t.hours,2)}</b>${t.m1>1440?'<span class="tag" title="Nær yfir miðnætti">+1</span>':''}</td>
   <td><select data-k="shifts.${i}.cat" data-re class="sel-sm"><option value="">–</option>${VP.PREF_CATS.map(([k,n])=>`<option value="${k}" ${s.cat===k?'selected':''}>${n}</option>`).join('')}</select></td>
   <td><select data-k="shifts.${i}.countsAs" data-re class="sel-sm"><option value="">Sjálfstæð vakt</option>${S.shifts.filter(x=>x.id!==s.id&&!x.countsAs).map(x=>`<option value="${x.id}" ${s.countsAs===x.id?'selected':''}>${esc(x.code+' · '+x.name)}</option>`).join('')}</select></td>
   ${s.countsAs?`<td class="dem muted" colspan="9" style="font-size:12px">Telst með ${esc(shiftById(s.countsAs)?.name||'')} í mönnun</td>`:s.demand.map((v,j)=>`<td class="dem"><input type="number" class="xs" data-k="shifts.${i}.demand.${j}" data-numblank min="0" value="${esc(v)}" ${j>=7?'placeholder="sun"':''}></td>`).join('')}
   <td><input type="number" class="xs" data-k="shifts.${i}.max" data-numblank min="0" value="${esc(s.max)}" placeholder="–"></td>
   <td><button class="small ghost danger" data-delshift="${i}" title="Eyða vakt">✕</button></td></tr>`;}).join('')}
  </tbody></table></div>
  <div class="toolbar" style="margin-top:12px"><button id="addShift">+ Bæta við vakt</button>
   <span class="hint" style="margin:0">Dæmi: Dagvakt 08:00–16:00, Kvöldvakt 16:00–00:00, Næturvakt 23:30–08:00, Langvakt 08:00–20:00.</span></div>
 </section>
 <section class="panel"><h2>Mönnun á viku</h2>${weekDemandSummary()}</section>`+navBtns();
function weekDemandSummary(){
  if(!S.shifts.length)return '<p class="muted">Engar vaktir skráðar.</p>';
  let tot=0;const rows=S.shifts.filter(s=>!s.countsAs).map(s=>{const t=VP.shiftTimes(s);const n=s.demand.slice(0,7).reduce((a,b)=>a+(+b||0),0);tot+=n*t.hours;return `<tr><td>${esc(s.code)} · ${esc(s.name)}</td><td class="num">${n}</td><td class="num">${fmt(n*t.hours)}</td></tr>`;}).join('');
  const C=VP.buildCtx(S),fte=tot/((+S.rules.weekly)||40);
  return `<table class="data"><thead><tr><th>Vakt</th><th class="num">Vaktir á viku</th><th class="num">Klst. á viku</th></tr></thead><tbody>${rows}</tbody>
  <tfoot><tr><td>Samtals</td><td></td><td class="num">${fmt(tot)}</td></tr></tfoot></table>
  <p class="hint">Lágmarksmönnun samsvarar um <b>${fmt(fte,2)} stöðugildum</b> (${fmt(tot)} klst. ÷ ${fmt(S.rules.weekly)}). Starfsfólk í vaktaplani er samtals <b>${fmt(C.emps.reduce((a,e)=>{const x=VP.empOn(e,C.dates[C.n-1]);return a+(x.status==='active'?x.pct:0);},0)/100,2)} stöðugildi</b>.</p>`;
}
AFTER.vaktir=()=>{
  $('#addShift').onclick=()=>{const i=S.shifts.length;S.shifts.push({id:VPD.uid('s'),code:String.fromCharCode(65+i%26),name:'Ný vakt',start:'08:00',end:'16:00',break:0,
    color:VPD.SHIFT_COLORS[i%VPD.SHIFT_COLORS.length],demand:[1,1,1,1,1,1,1,'',''],max:'',cat:'',countsAs:''});save();render();};
  $$('[data-delshift]').forEach(b=>b.onclick=async()=>{const s=S.shifts[+b.dataset.delshift];if(!await ask(`Eyða vaktinni „${s.name}“? Hún verður líka fjarlægð úr planinu.`))return;
    pushUndo();S.shifts.splice(+b.dataset.delshift,1);for(const [k,v] of Object.entries(S.plan))if(v.s===s.id)delete S.plan[k];
    S.employees.forEach(e=>e.allowed=e.allowed.filter(x=>x!==s.id));S.shifts.forEach(x=>{if(x.countsAs===s.id)x.countsAs='';});save();render();});
};

/* ---------- Skref 3: Starfsfólk ---------- */
let selEmp=null;
const statusBadge=st=>`<span class="badge st-${st}">${esc(VP.STATUS_NAMES[st]||st)}</span>`;
function parsePct(v){const t=String(v??'').trim();if(/^tv$/i.test(t)||/tímav/i.test(t))return {status:'hourly',pct:0};
  const n=parseFloat(t.replace(/\s+/g,'').replace('%','').replace(',','.'));if(isNaN(n))return null;return {status:'active',pct:n<=1&&t.indexOf('%')<0&&n>0?n*100:n};}
VIEWS.starfsfolk=()=>{
  const st=VP.stats(S),C=st.C,last=C.dates[C.n-1],first=C.dates[0];
  const rowOf=e=>{const o=st.emp.find(x=>x.id===e.id),now=VP.empOn(e,last),beg=VP.empOn(e,first),changed=now.pct!==beg.pct||now.status!==beg.status;
    const pl=VP.PREF_CATS.map(([k,n])=>[k,n,VP.prefLevel(e,k)]),hi=pl.filter(x=>x[2]===2),no=pl.filter(x=>x[2]===0);
    const fx=e.fixedShift&&shiftById(e.fixedShift);
    const prefs=(fx?`<span class="pref fixed">Föst: ${esc(fx.code)}</span>`:'')+hi.map(x=>`<span class="pref">${esc(x[1])}</span>`).join('')+no.map(x=>`<span class="pref no">Ekki ${esc(x[1].toLowerCase())}</span>`).join('')+(!hi.length&&!no.length&&!fx?'<span class="muted small">Allar vaktir</span>':'')+(e.priority&&+e.priority!==2?`<span class="pref prio">Forgangur: ${esc(VP.PRIORITY_NAMES[e.priority])}</span>`:'');
    return `<button class="emp-row ${selEmp===e.id?'sel':''}" data-emp="${e.id}">
      <span class="en"><b>${esc(e.name||'(nafnlaus)')}</b>${e.title?`<small>${esc(e.title)}</small>`:''}</span>
      <span class="ep">${now.status==='active'?fmt(now.pct)+'%':statusBadge(now.status)}${changed?`<small title="Breyting á tímabilinu">frá ${beg.status==='active'?fmt(beg.pct)+'%':VP.STATUS_NAMES[beg.status]}</small>`:''}</span>
      <span class="eprefs">${o?prefs:''}</span>
      <span class="num">${o?fmt(o.target):'–'}</span><span class="num muted">${o&&o.wished?fmt(o.wished):'–'}</span><span class="num">${o?fmt(o.total):'–'}</span>
      <span class="num ${o&&o.outstanding<-(+S.rules.hourTolerance||0)?'bad':''}"><b>${o?fmt(o.outstanding):'–'}</b></span></button>`;};
  const inPlan=S.employees.filter(e=>C.emps.includes(e)),out=S.employees.filter(e=>!C.emps.includes(e));
  return intro('Starfsfólk',`Starfsmannalistinn fylgir öllum tímabilum. Smelltu á starfsmann til að breyta starfshlutfalli, skrá breytingu frá ákveðnum degi eða velja hvaða vaktir hann vill (óskir). Starfsfólk í <b>tímavinnu</b> eða <b>leyfi</b> er ekki í vaktaplaninu. <b>Útistandandi</b> = vinnuskylda − tímar sem þegar eru á vöktum (og fjarvistir).`)+`
 <div class="split emp-split">
  <section class="panel"><div class="emp-head"><span>Nafn</span><span>Hlutfall</span><span>Óskir og forsendur</span><span class="num">Vinnuskylda</span><span class="num" title="Klst. í óskuðum vöktum">Óskir</span><span class="num">Á vöktum</span><span class="num">Útistandandi</span></div>
   <h3 class="grp">Í vaktaplani (${inPlan.length})</h3>${inPlan.map(rowOf).join('')||'<p class="muted">Enginn.</p>'}
   ${out.length?`<h3 class="grp">Utan vaktaplans: tímavinna, leyfi o.fl. (${out.length})</h3>${out.map(rowOf).join('')}`:''}
   <div class="toolbar" style="margin-top:14px"><button id="addEmp">+ Nýr starfsmaður</button></div>
  </section>
  <section class="panel sticky emp-edit">${selEmp&&empById(selEmp)?empEditor(empById(selEmp),C):`<h2>Veldu starfsmann</h2><p class="muted">Smelltu á nafn í listanum til að breyta starfshlutfalli, stöðu, óskum um vaktir og fleiru.</p>
   <h2 style="margin-top:22px">Líma inn lista</h2>
   <p class="hint">Ein lína á starfsmann: <code>Nafn; starfshlutfall; starfsheiti</code> (semíkomma eða tab á milli, t.d. úr Excel). Hlutfall má skrifa 80, 80%, 0,8 eða TV fyrir tímavinnu. Starfsfólk sem er þegar á listanum fær nýja hlutfallið.</p>
   <textarea id="pasteEmps" rows="5" placeholder="Anna Jónsdóttir; 80%&#10;Jón Jónsson; TV"></textarea>
   <div class="toolbar" style="margin-top:10px"><button id="addPasted">Bæta við / uppfæra</button></div>`}</section>
 </div>`+navBtns();
};
function empEditor(e,C){
  const i=S.employees.indexOf(e),o=VP.stats(S).emp.find(x=>x.id===e.id),dl=VP.dailyOf(C,e)*5;
  const ch=(e.changes||[]).map((c,j)=>({...c,j})).sort((a,b)=>a.from<b.from?-1:1);
  return `<div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">${esc(e.name||'Nýr starfsmaður')}</h2><button class="small ghost" id="closeEmp">Loka ✕</button></div>
  <div class="row" style="margin-top:14px"><div class="field"><label>Nafn</label><input data-k="employees.${i}.name" data-re value="${esc(e.name)}"></div>
   <div class="field"><label>Starfsheiti</label><input data-k="employees.${i}.title" value="${esc(e.title)}"></div></div>
  <div class="row"><div class="field"><label>Staða</label><select data-k="employees.${i}.status" data-re>${Object.entries(VP.STATUS_NAMES).map(([k,n])=>`<option value="${k}" ${e.status===k?'selected':''}>${n}</option>`).join('')}</select></div>
   <div class="field"><label>Starfshlutfall %</label><input type="number" data-k="employees.${i}.pct" data-num data-re min="0" max="100" step="0.1" value="${esc(e.pct)}" ${e.status!=='active'?'disabled':''}></div></div>
  <p class="hint" style="margin-top:-6px">${e.status==='hourly'?'Tímavinna: tilfallandi tímar, ekki fastar vaktir og ekki í vaktaplani.':e.status==='leave'?'Í leyfi: ekki í vaktaplani og engin vinnuskylda.':`Vinnuskylda á tímabilinu: <b>${fmt(o?o.target:0)} klst.</b>${o?` · á vöktum ${fmt(o.total)} · útistandandi <b>${fmt(o.outstanding)}</b>`:''}`}</p>
  <h3>Óskir um vaktir</h3>
  <table class="plv">${VP.PREF_CATS.map(([k,n])=>{const lv=VP.prefLevel(e,k);return `<tr><td>${n}</td><td><div class="seg small">${VP.PREF_LEVELS.map(([v,t])=>`<button data-plv="${k}|${v}" class="${lv===v?'on lv'+v:''}">${t}</button>`).join('')}</div></td></tr>`;}).join('')}</table>
  <p class="hint"><b>Helst</b>: röðunin velur starfsmanninn frekar á slíkar vaktir. <b>Má</b>: kemur til greina. <b>Ekki</b>: aldrei sett á slíkar vaktir.</p>
  <div class="row"><div class="field"><label>Forgangur þegar óskir rekast á</label><select data-k="employees.${i}.priority" data-num data-re>${Object.entries(VP.PRIORITY_NAMES).map(([k,n])=>`<option value="${k}" ${+e.priority===+k?'selected':''}>${n}</option>`).join('')}</select></div>
   <div class="field"><label>Föst vakt</label><select data-k="employees.${i}.fixedShift" data-re><option value="">Engin</option>${S.shifts.filter(x=>!x.countsAs).map(x=>`<option value="${x.id}" ${e.fixedShift===x.id?'selected':''}>${esc(x.code+' · '+x.name)}</option>`).join('')}</select></div></div>
  <div class="row"><div class="field"><label>Hámark helga á tímabili</label><input type="number" data-k="employees.${i}.maxWeekends" data-numblank min="0" max="6" value="${esc(e.maxWeekends)}" placeholder="engin mörk"></div>
   <div class="field"><label>Hámark vinnudaga í röð</label><input type="number" data-k="employees.${i}.maxConsec" data-numblank min="1" max="14" value="${esc(e.maxConsec)}" placeholder="${esc(S.rules.maxConsec)} (almenn regla)"></div></div>
  <p class="hint">Föst vakt er sett á starfsmanninn alla daga sem hún er í boði og hann er laus, nema annað sé ákveðið (t.d. með því að breyta reit í planinu).</p>
  <h3>Breytingar á tímabili</h3>
  ${ch.length?`<ul class="changes">${ch.map(c=>`<li><b>Frá ${esc(VP.dateLabel(c.from))}:</b> ${c.status&&c.status!=='active'?esc(VP.STATUS_NAMES[c.status]):''}${(c.status==='active'||!c.status)&&c.pct!==''&&c.pct!=null?fmt(c.pct)+'%':''}${c.note?` <span class="muted">· ${esc(c.note)}</span>`:''} <button class="small ghost danger" data-delch="${c.j}">✕</button></li>`).join('')}</ul>`:'<p class="muted small">Engar breytingar skráðar.</p>'}
  <div class="row chform"><div class="field"><label>Gildir frá</label><input type="date" id="chFrom" value="${VP.periodRange(S.period.year,S.period.month).start}"></div>
   <div class="field"><label>Ný staða</label><select id="chStatus">${Object.entries(VP.STATUS_NAMES).map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select></div>
   <div class="field"><label>Nýtt hlutfall %</label><input type="number" id="chPct" min="0" max="100" step="0.1" value="${esc(e.pct)}"></div></div>
  <div class="field"><label>Athugasemd</label><input id="chNote" placeholder="t.d. skv. breytingablaði"></div>
  <div class="toolbar"><button id="addCh">Skrá breytingu</button></div>
  <details style="margin-top:16px"><summary>Fleiri stillingar</summary>
   <div class="row" style="margin-top:10px"><div class="field"><label>Vikustundir í 100% (autt = ${fmt(S.rules.weekly)})</label><input type="number" data-k="employees.${i}.weekly" data-numblank data-re step="0.5" value="${esc(e.weekly)}" placeholder="${fmt(S.rules.weekly)}"></div>
    <div class="field"><label>Föst vinnuskylda (klst.)</label><input type="number" data-k="employees.${i}.fixedTarget" data-numblank data-re step="0.5" value="${esc(e.fixedTarget)}" placeholder="reiknuð"></div>
    <div class="field"><label>Flutt staða (klst.)</label><input type="number" data-k="employees.${i}.carry" data-num step="0.25" value="${esc(e.carry)}"></div></div>
   <label>Vinnur ekki</label><div class="chips" style="margin-bottom:12px">${VP.DAYS_SHORT.map((d,j)=>`<button class="chip day ${e.noDays.includes(j)?'off':''}" data-noday="${j}" title="${VP.DAYS[j]}">${d}</button>`).join('')}</div>
   <div class="field"><label>Athugasemd</label><input data-k="employees.${i}.note" value="${esc(e.note)}"></div>
   <div class="toolbar"><button class="small" data-mv="-1">↑ Færa upp</button><button class="small" data-mv="1">↓ Færa niður</button><button class="small danger" id="delEmp">Eyða starfsmanni</button></div>
  </details>`;
}
AFTER.starfsfolk=()=>{
  $$('[data-emp]').forEach(b=>b.onclick=()=>{selEmp=b.dataset.emp;rerender();});
  $('#addEmp').onclick=()=>{const e=newEmp({name:'',pct:100});S.employees.push(e);selEmp=e.id;save();rerender();const n=$('.emp-edit input');n&&n.focus();};
  const e=selEmp&&empById(selEmp);
  if(!e){
    $('#addPasted').onclick=()=>{const lines=$('#pasteEmps').value.split('\n').map(l=>l.trim()).filter(Boolean);let n=0,u=0;pushUndo();
      for(const l of lines){const p=l.split(/\t|;/).map(x=>x.trim());if(!p[0])continue;const pr=parsePct(p[1]??'100')||{status:'active',pct:100};
        const ex=S.employees.find(x=>x.name.trim().toLowerCase()===p[0].toLowerCase());
        if(ex){ex.pct=pr.pct||ex.pct;ex.status=pr.status;if(p[2])ex.title=p[2];u++;}
        else{S.employees.push(newEmp({name:p[0],title:p[2]||'',pct:pr.pct,status:pr.status}));n++;}}
      save();render();toast(`${n} bætt við, ${u} uppfærð`);};
    return;
  }
  $('#closeEmp').onclick=()=>{selEmp=null;rerender();};
  $$('[data-plv]').forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.plv.split('|');e.prefLevels={...e.prefLevels,[k]:+v};e.prefs=[];save();rerender();});
  $$('[data-noday]').forEach(b=>b.onclick=()=>{const j=+b.dataset.noday;e.noDays=e.noDays.includes(j)?e.noDays.filter(x=>x!==j):[...e.noDays,j].sort();save();rerender();});
  $('#chStatus').onchange=()=>{$('#chPct').disabled=$('#chStatus').value!=='active';};
  $('#addCh').onclick=()=>{const from=$('#chFrom').value;if(!from){toast('Veldu dagsetningu');return;}pushUndo();
    const status=$('#chStatus').value;e.changes.push({from,status,pct:status==='active'?(+$('#chPct').value||0):'',note:$('#chNote').value.trim()});
    save();rerender();toast('Breyting skráð frá '+VP.dateLabel(from));};
  $$('[data-delch]').forEach(b=>b.onclick=()=>{pushUndo();e.changes.splice(+b.dataset.delch,1);save();rerender();});
  $$('[data-mv]').forEach(b=>b.onclick=()=>{const i=S.employees.indexOf(e),j=i+(+b.dataset.mv);if(j<0||j>=S.employees.length)return;
    [S.employees[i],S.employees[j]]=[S.employees[j],S.employees[i]];save();rerender();});
  $('#delEmp').onclick=async()=>{if(!await ask(`Eyða ${e.name||'starfsmanni'} af starfsmannalistanum? Vaktir og óskir hans hverfa líka.`))return;pushUndo();
    S.employees.splice(S.employees.indexOf(e),1);for(const m of [S.plan,S.locks,S.wishes])for(const k of Object.keys(m))if(k.startsWith(e.id+'|'))delete m[k];selEmp=null;save();render();};
};

/* ---------- Skref 4: Dagatal ---------- */
let selDay=null;
function calendarHtml(click=true){
  const dates=VP.periodDates(S.period),hol={};S.holidays.forEach(h=>hol[h.date]=h);
  const first=VP.dow(dates[0]),cells=[];for(let i=0;i<first;i++)cells.push('<div class="cal-d empty"></div>');
  dates.forEach(d=>{const h=hol[d],w=VP.dow(d),p=VP.parse(d);
    cells.push(`<${click?'button':'div'} class="cal-d ${w>=5?'wkend':''} ${h?h.kind:''} ${selDay===d?'sel':''}" ${click?`data-day="${d}"`:''}>
      <span class="dn">${p.getUTCDate()}.${p.getUTCDate()===1||d===dates[0]?' '+VP.MONTHS[p.getUTCMonth()].slice(0,3):''}</span>
      ${h?`<span class="hn">${h.kind==='major'?'★ ':''}${esc(h.name)}${h.from?` <small>frá ${esc(h.from)}</small>`:''}</span>`:''}</${click?'button':'div'}>`);});
  return `<div class="cal"><div class="cal-h">${VP.DAYS_SHORT.map(d=>`<div>${d}</div>`).join('')}</div><div class="cal-g">${cells.join('')}</div></div>`;
}
VIEWS.dagatal=()=>{
  const h=selDay&&S.holidays.find(x=>x.date===selDay);
  return intro('Hátíðisdagar og rauðir dagar','Íslenskir frídagar tímabilsins eru merktir sjálfkrafa. <b>Stórhátíðardagar</b> (★) og <b>rauðir dagar</b> (almennir frídagar) eru aðgreindir: þeir hafa hvor sína mönnun á vöktum, sinn álagsflokk í útreikningum og sinn lit í planinu. Smelltu á dag til að breyta.')+`
 <div class="split">
  <section class="panel">${calendarHtml()}<div class="legend" style="margin-top:12px"><span class="lg major">★ Stórhátíðardagur</span><span class="lg red">Rauður dagur</span><span class="lg wkend">Helgi</span></div></section>
  <section class="panel sticky">
   ${selDay?`<h2>${esc(VP.dateLabel(selDay))}</h2>
    <div class="seg">${[['','Venjulegur dagur'],['red','Rauður dagur'],['major','★ Stórhátíðardagur']].map(([k,t])=>`<button data-kind="${k}" class="${(h?h.kind:'')===k?'on':''}">${t}</button>`).join('')}</div>
    <div class="toolbar" style="margin-top:12px"><button id="dayShifts">Breyta vöktum dagsins</button></div>
    ${h?`<div class="field" style="margin-top:14px"><label>Heiti</label><input id="holName" value="${esc(h.name)}"></div>
    <div class="field"><label>Gildir frá kl. (autt = allan daginn)</label><input type="time" id="holFrom" value="${esc(h.from)}"></div>
    <p class="hint">Aðfangadagur og gamlársdagur teljast stórhátíðardagar frá kl. 12. Vaktir sem hefjast fyrir þann tíma fá mönnun venjulegs vikudags.</p>`:''}`
   :'<h2>Veldu dag</h2><p class="muted">Smelltu á dag í dagatalinu til að merkja hann sem rauðan dag eða stórhátíðardag, eða til að breyta heiti hans.</p>'}
   <h2 style="margin-top:20px">Frídagar á tímabilinu</h2>
   ${S.holidays.length?`<ul class="hol-list">${S.holidays.map(x=>`<li><span class="lg ${x.kind}">${x.kind==='major'?'★ Stórhátíð':'Rauður dagur'}</span> <b>${esc(VP.dateLabel(x.date))}</b> ${esc(x.name)}${x.from?` (frá kl. ${esc(x.from)})`:''}</li>`).join('')}</ul>`:'<p class="muted">Engir frídagar á þessu tímabili.</p>'}
   <div class="toolbar"><button id="resetHol">Endurheimta íslenska frídaga</button></div>
  </section></div>`+navBtns();
};
AFTER.dagatal=()=>{
  $$('.cal-d[data-day]').forEach(b=>b.onclick=()=>{selDay=b.dataset.day;render();});
  const ds=$('#dayShifts');if(ds)ds.onclick=()=>dayEditor(selDay);
  $$('[data-kind]').forEach(b=>b.onclick=()=>{const k=b.dataset.kind;let h=S.holidays.find(x=>x.date===selDay);
    if(!k){S.holidays=S.holidays.filter(x=>x.date!==selDay);}
    else if(h){h.kind=k;h.custom=true;}
    else S.holidays.push({date:selDay,name:k==='major'?'Stórhátíðardagur':'Frídagur',kind:k,from:'',custom:true});
    S.holidays.sort((a,b)=>a.date<b.date?-1:1);save();render();});
  const n=$('#holName'),f=$('#holFrom');
  if(n)n.oninput=()=>{const h=S.holidays.find(x=>x.date===selDay);h.name=n.value;h.custom=true;save();};
  if(n)n.onchange=()=>render();
  if(f)f.onchange=()=>{const h=S.holidays.find(x=>x.date===selDay);h.from=f.value;h.custom=true;save();render();};
  $('#resetHol').onclick=async()=>{if(!await ask('Endurheimta sjálfgefna íslenska frídaga fyrir tímabilið? Eigin breytingar hverfa.'))return;S.holidays=VP.holidaysForPeriod(S.period);save();render();};
};

/* ---------- Skref 5: Óskir og fjarvistir ---------- */
function entryLabel(kind,id){
  if(kind==='off')return 'Ósk um frí';
  if(kind==='s'){const s=shiftById(id);return 'Ósk um '+(s?s.name:'vakt');}
  const a=absById(id);return a?a.name:'Fjarvist';
}
function listEntries(){
  const dates=VP.periodDates(S.period),out=[];
  S.employees.forEach(e=>{
    const runs=[];let cur=null;
    dates.forEach(d=>{const k=K(e.id,d),w=S.wishes[k],p=S.plan[k];
      const items=[];if(w&&w.off)items.push(['off','']);if(w&&w.s)items.push(['s',w.s]);if(p&&p.a)items.push(['a',p.a]);
      const sig=items.map(x=>x.join(':')).join(',');
      if(cur&&cur.sig===sig&&sig&&VP.addDays(cur.to,1)===d){cur.to=d;}
      else{if(cur&&cur.sig)runs.push(cur);cur={sig,items,from:d,to:d};}});
    if(cur&&cur.sig)runs.push(cur);
    runs.forEach(r=>r.items.forEach(([kind,id])=>out.push({e,kind,id,from:r.from,to:r.to})));
  });
  return out;
}
VIEWS.oskir=()=>{
  const {start,end}=VP.periodRange(S.period.year,S.period.month),L=listEntries();
  return intro('Óskir og fjarvistir','Skráðu óskir um frí eða ákveðnar vaktir og fjarvistir eins og orlof, veikindi og námskeið. Fjarvistir eru alltaf virtar við röðun. Þetta má líka gera beint í planinu með því að smella á reit.')+`
 <div class="split">
  <section class="panel sticky"><h2>Ný skráning</h2>
   <div class="field"><label>Starfsmaður</label><select id="wEmp">${S.employees.map(e=>`<option value="${e.id}">${esc(e.name||'(nafnlaus)')}</option>`).join('')}</select></div>
   <div class="field"><label>Tegund</label><select id="wType">
    <optgroup label="Óskir"><option value="off|">Ósk um frí</option>${S.shifts.map(s=>`<option value="s|${s.id}">Ósk um ${esc(s.name)} (${esc(s.code)})</option>`).join('')}</optgroup>
    <optgroup label="Fjarvistir">${S.absTypes.map(a=>`<option value="a|${a.id}">${esc(a.name)} (${esc(a.code)})</option>`).join('')}</optgroup></select></div>
   <div class="row"><div class="field"><label>Frá</label><input type="date" id="wFrom" min="${start}" max="${end}" value="${start}"></div>
   <div class="field"><label>Til og með</label><input type="date" id="wTo" min="${start}" max="${end}" value="${start}"></div></div>
   <label class="check"><input type="checkbox" id="wWeekdays"> Aðeins virka daga (mán–fös)</label>
   <div class="toolbar"><button class="primary" id="wAdd">Skrá</button></div>
  </section>
  <section class="panel"><h2>Skráðar óskir og fjarvistir (${L.length})</h2>
   ${L.length?`<table class="data"><thead><tr><th>Starfsmaður</th><th>Tegund</th><th>Dagsetning</th><th></th></tr></thead><tbody>
   ${L.map((x,i)=>`<tr><td>${esc(x.e.name)}</td><td><span class="pill ${x.kind==='a'?'abs':'wish'}" ${x.kind==='a'?`style="background:${esc(absById(x.id)?.color)}"`:''}>${esc(entryLabel(x.kind,x.id))}</span></td>
     <td>${esc(VP.dateLabel(x.from))}${x.to!==x.from?' – '+esc(VP.dateLabel(x.to)):''}</td><td><button class="small ghost danger" data-delw="${i}">Eyða</button></td></tr>`).join('')}
   </tbody></table>`:'<p class="muted">Ekkert skráð enn.</p>'}
  </section></div>
  <section class="panel"><h2>Tegundir fjarvista</h2>
   <p class="hint">„Telst til vinnuskyldu“ þýðir að hver virkur dagur í fjarvist reiknast sem unninn dagur (vinnustundir á dag × starfshlutfall).</p>
   <table class="edit"><thead><tr><th>Litur</th><th>Kóði</th><th>Heiti</th><th>Telst til vinnuskyldu</th><th></th></tr></thead><tbody>
   ${S.absTypes.map((a,i)=>`<tr><td><input type="color" data-k="absTypes.${i}.color" value="${esc(a.color)}"></td><td><input class="code" maxlength="3" data-k="absTypes.${i}.code" value="${esc(a.code)}"></td>
    <td><input data-k="absTypes.${i}.name" value="${esc(a.name)}"></td><td><input type="checkbox" data-k="absTypes.${i}.credit" ${a.credit?'checked':''}></td>
    <td><button class="small ghost danger" data-delabs="${i}">✕</button></td></tr>`).join('')}</tbody></table>
   <div class="toolbar" style="margin-top:10px"><button id="addAbs">+ Ný tegund</button></div>
  </section>`+navBtns();
};
AFTER.oskir=()=>{
  const L=listEntries();
  $('#wFrom').onchange=()=>{if($('#wTo').value<$('#wFrom').value)$('#wTo').value=$('#wFrom').value;};
  $('#wAdd').onclick=()=>{
    const e=$('#wEmp').value,[kind,id]=$('#wType').value.split('|');let a=$('#wFrom').value,b=$('#wTo').value;
    if(!e||!a){toast('Veldu starfsmann og dagsetningu');return;}if(!b||b<a)b=a;
    pushUndo();let n=0;
    for(let d=a;d<=b;d=VP.addDays(d,1)){if($('#wWeekdays').checked&&VP.dow(d)>=5)continue;const k=K(e,d);n++;
      if(kind==='a'){S.plan[k]={a:id};delete S.locks[k];}
      else if(kind==='off')S.wishes[k]={off:true};else S.wishes[k]={s:id};}
    save();render();toast(n+' dögum bætt við');};
  $$('[data-delw]').forEach(b=>b.onclick=()=>{const x=L[+b.dataset.delw];pushUndo();
    for(let d=x.from;d<=x.to;d=VP.addDays(d,1)){const k=K(x.e.id,d);if(x.kind==='a'){if(S.plan[k]&&S.plan[k].a===x.id)delete S.plan[k];}else delete S.wishes[k];}
    save();render();});
  $('#addAbs').onclick=()=>{S.absTypes.push({id:VPD.uid('a'),code:'X',name:'Ný fjarvist',color:'#dddddd',credit:false});save();render();};
  $$('[data-delabs]').forEach(b=>b.onclick=async()=>{const a=S.absTypes[+b.dataset.delabs];if(!await ask(`Eyða tegundinni „${a.name}“ og öllum skráningum hennar?`))return;pushUndo();
    S.absTypes.splice(+b.dataset.delabs,1);for(const [k,v] of Object.entries(S.plan))if(v.a===a.id)delete S.plan[k];save();render();});
};

/* ---------- Skref 6: Vaktaplan ---------- */
let lastGen=null,warnFilter='all',gridEmpIds=[];
/* Innlestur á völdum vöktum úr CSV eða Excel */
function loadXlsxLib(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  return new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>window.XLSX?ok(window.XLSX):no(Error('Excel-safnið hlóðst ekki'));s.onerror=()=>no(Error('Excel-safnið hlóðst ekki. Vistaðu skjalið sem CSV og reyndu aftur.'));document.head.appendChild(s);});
}
async function importFile(file){
  try{
    let rows;
    if(/\.xlsx?$/i.test(file.name)){const X=await loadXlsxLib();const wb=X.read(await file.arrayBuffer(),{type:'array'});
      rows=X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:false,defval:''});}
    else rows=VP.parseCsv(await file.text());
    const mode=await choose(`Hvernig á að setja vaktirnar í „${file.name}“ inn?`,[['wish','Sem óskir (röðunin úthlutar þeim sanngjarnt)'],['lock','Sem fastar vaktir (læstar)']]);
    if(!mode)return;
    pushUndo();const rep=VP.importTable(S,rows,{mode});save();lastGen=null;render();
    const L=[mode==='wish'?`${rep.wishes} óskir um vaktir lesnar inn${rep.count>rep.wishes?` og ${rep.count-rep.wishes} fjarvistir`:''}.`:`${rep.count} vaktir lesnar inn og læstar${rep.replaced?` (${rep.replaced} skrifuðu yfir eldri færslur)`:''}.`];
    if(rep.ignored.length)L.push('Hunsað (ekki á vaktaplani): '+[...new Set(rep.ignored)].join(', ')+'.');
    if(rep.periodChanged)L.push('Tímabil stillt á '+VP.periodLabel(S.period)+' samkvæmt skjalinu.');
    if(rep.newEmps.length)L.push('Nýir á starfsmannalista (skráðu starfshlutfall): '+rep.newEmps.join(', ')+'.');
    if(rep.newShifts.length)L.push('Ný afbrigði vakta: '+rep.newShifts.join('; ')+'.');
    if(rep.inactive.length)L.push('Á vakt þrátt fyrir tímavinnu/leyfi: '+rep.inactive.slice(0,8).join(', ')+(rep.inactive.length>8?' …':'')+'.');
    if(rep.unknown.length)L.push('Óþekkt gildi, ekki lesin inn: '+rep.unknown.slice(0,8).join('; ')+(rep.unknown.length>8?' …':'')+'.');
    L.push(mode==='wish'?'Smelltu á „Búa til vaktaplan“ til að fá tillögu að vaktaplani.':'Smelltu á „Búa til vaktaplan“ til að raða á vaktirnar sem eftir eru.');
    await ask(L.join('\n\n'),{ok:'Í lagi',cancel:'Loka'});
  }catch(err){console.error(err);toast('Innlestur tókst ekki: '+err.message);}
}
function cellHtml(e,d,C,i){
  const k=K(e.id,d),v=S.plan[k],w=S.wishes[k],lock=S.locks[k],f=C.infos[i];
  let cls='cell',style='',txt='',title=[];
  if(v&&v.s&&C.shift[v.s]){const s=C.shift[v.s];txt=s.code;if(txt.length>3)cls+=' long';style=`background:${s.color};color:${textColor(s.color)}`;title.push(`${s.name} ${s.start}–${s.end}`);}
  else if(v&&v.a&&C.abs[v.a]){const a=C.abs[v.a];txt=a.code;cls+=' abs';style=`background:${a.color};color:${textColor(a.color)}`;title.push(a.name);}
  if(w&&w.off){cls+=' wishoff';title.push('Ósk um frí');if(v&&v.s)cls+=' conflict';}
  if(w&&w.s){const s=C.shift[w.s];cls+=v&&v.s===w.s?' granted':' wishs';title.push((v&&v.s===w.s?'Ósk uppfyllt: ':'Ósk um ')+(s?s.name+' '+s.start+'–'+s.end:'vakt'));if(!txt&&s)txt=`<span class="ghosttxt">${esc(s.code)}?</span>`;}
  if(lock)cls+=' locked';
  const ed=C.empDays[e.id][i];if(ed.status!=='active'){cls+=' inactive';title.push(VP.STATUS_NAMES[ed.status]);}
  if(f.weekend)cls+=' wkend';if(f.hol)cls+=' '+f.hol.kind;
  return `<td class="${f.weekend?'wkend':''} ${f.hol?f.hol.kind:''}"><button class="${cls}" data-cell="${e.id}|${d}" style="${style}" title="${esc(e.name+' · '+VP.dateLabel(d)+(title.length?' · '+title.join(' · '):''))}">${txt&&txt.startsWith('<')?txt:esc(txt)}${lock?'<i class="lk"></i>':''}</button></td>`;
}
VIEWS.plan=()=>{
  const st=VP.stats(S),C=st.C,warn=VP.validate(S);
  if(!C.emps.length||!S.shifts.length)return intro('Vaktaplan','')+`<section class="panel"><p>Skráðu fyrst ${!S.shifts.length?'vaktir':'starfsfólk'} áður en planið er búið til.</p></section>`+navBtns();
  const under=warn.filter(w=>w.type==='under'),missing=st.days.reduce((a,r)=>a+Object.values(r.shifts).reduce((b,x)=>b+Math.max(0,x.need-x.have),0),0);
  const ovDays=new Set(Object.keys(S.needOverride).map(k=>k.split('|')[0]));
  const head=C.dates.map((d,i)=>{const f=C.infos[i],p=VP.parse(d);return `<th class="dh ${f.weekend?'wkend':''} ${f.hol?f.hol.kind:''}"><button class="dhb ${ovDays.has(d)?'ovr':''}" data-day="${d}" title="${esc(VP.dateLabel(d)+(f.hol?' · '+f.hol.name:'')+(ovDays.has(d)?' · breytt vaktafyrirkomulag':'')+' · smelltu til að breyta vöktum dagsins')}">
    <span class="wd">${VP.DAYS_1[f.dow]}</span><span class="dn">${p.getUTCDate()}</span>${f.hol?`<span class="hm">${f.hol.kind==='major'?'★':'●'}</span>`:ovDays.has(d)?'<span class="hm">✎</span>':''}</button></th>`;}).join('');
  const used=new Set(st.usedShifts.map(x=>x.id));
  gridEmpIds=C.emps.map(e=>e.id);
  const rows=C.emps.map(e=>{const o=st.emp.find(x=>x.id===e.id);
    return `<tr><th class="nm"><span>${esc(e.name||'(nafnlaus)')}</span><small>${o.status==='mixed'?'breyting á tímabili':fmt(o.pctMax)+'%'}${e.prefs.length?' · '+esc(e.prefs.map(p=>VP.PREF_NAME[p]).join(', ')):''}</small></th>${C.dates.map((d,i)=>cellHtml(e,d,C,i)).join('')}
    <td class="sum">${o.shifts}</td><td class="sum">${fmt(o.total)}</td><td class="sum">${fmt(o.target)}</td><td class="sum ${o.outstanding<-(+S.rules.hourTolerance||0)?'bad':o.outstanding>(+S.rules.hourTolerance||0)?'todo':''}"><b>${fmt(o.outstanding)}</b></td></tr>`;}).join('');
  const cov=C.shifts.filter(s=>!s.countsAs&&used.has(s.id)).map(s=>`<tr class="cov"><th class="nm"><span><span class="sw" style="background:${s.color}"></span>${esc(s.code)} · ${esc(s.name)}</span><small>mannað / þörf</small></th>
    ${st.days.map((r,i)=>{const x=r.shifts[s.id],ov=S.needOverride[r.date+'|'+s.id]!=null;return `<td class="${C.infos[i].weekend?'wkend':''} ${C.infos[i].hol?C.infos[i].hol.kind:''}"><button class="covc ${x.have<x.need?'under':x.have>x.need?'over':x.need?'ok':''} ${ov?'ovr':''}" data-need="${r.date}|${s.id}" title="${esc(s.name+' '+VP.dateLabel(r.date)+': '+x.have+' af '+x.need+(x.names.length?' · '+x.names.join(', '):'')+'. Smelltu til að breyta þörf.')}">${x.need||x.have?x.have+'/'+x.need:'·'}</button></td>`;}).join('')}<td colspan="4"></td></tr>`).join('');
  const shown=warn.filter(w=>w.type!=='over'&&(warnFilter==='all'||w.level===warnFilter));
  return intro('Vaktaplan',`Smelltu á <b>Búa til vaktaplan</b> til að raða sjálfvirkt. Smelltu á reit til að breyta handvirkt, eða veldu reit og sláðu inn kóða vaktar (Delete tæmir, örvatakkar færa). Læstar vaktir (<i class="lk inline"></i>) haldast þegar raðað er aftur. Með <b>Lesa inn vaktaóskir</b> eru óskir starfsfólks lesnar úr CSV- eða Excel-skjali (ein lína á starfsmann, einn dálkur á dag, tímar eins og „08:00-16:00“). Óskir birtast sem „8-16?“. Röðunin úthlutar þeim fyrst og sanngjarnt, og raðar svo á það sem eftir er. <b>Smelltu á dag</b> í hausnum til að breyta vöktum þess dags.`)+`
 <section class="panel planbar">
  <div class="toolbar">
   <button class="primary" id="genBtn">⚙ Búa til vaktaplan</button>
   <button id="clearBtn" title="Fjarlægja allar vaktir sem eru ekki læstar">Hreinsa ólæstar vaktir</button>
   <button id="lockAll">Læsa öllum vöktum</button><button id="unlockAll">Aflæsa öllu</button>
   <button id="undoBtn" title="Afturkalla (Ctrl+Z)">↶ Afturkalla</button>
   <button id="importBtn" title="Lesa inn vaktaóskir eða valdar vaktir starfsfólks (CSV eða Excel)">⤓ Lesa inn vaktaóskir</button>
   <button id="clearWishes" title="Fjarlægja allar óskir um vaktir á tímabilinu">Hreinsa óskir</button>
  </div>
  <div class="kpis">
   <div class="${missing?'bad':'good'}"><b>${missing}</b><span>vaktir ómannaðar</span></div>
   <div><b>${fmt(st.tot.have)}/${fmt(st.tot.need)}</b><span>mönnun skv. þörf</span></div>
   <div><b>${fmt(st.tot.worked)}</b><span>klst. á vöktum</span></div>
   <div><b>${fmt(st.tot.target)}</b><span>klst. vinnuskylda alls</span></div>
  </div>
  ${lastGen?`<p class="hint" style="margin:8px 0 0">Síðasta röðun: ${lastGen.runs} útgáfur prófaðar á ${fmt(lastGen.ms/1000,1)} sek., sú besta valin.${lastGen.unfilled?` Ekki tókst að manna ${lastGen.unfilled} vaktir. Bættu við starfsfólki, rýmkaðu reglur eða breyttu mönnunarþörf.`:''}</p>`:''}
 </section>
 <div class="legend">${st.usedShifts.map(s=>`<span class="lg" style="background:${s.color};color:${textColor(s.color)}"><b>${esc(s.code)}</b> ${esc(s.name)} ${esc(s.start)}–${esc(s.end)}</span>`).join('')}
  ${S.absTypes.map(a=>`<span class="lg" style="background:${a.color};color:${textColor(a.color)}"><b>${esc(a.code)}</b> ${esc(a.name)}</span>`).join('')}
  <span class="lg wishoff-lg">Ósk um frí</span><span class="lg major">★ Stórhátíð</span><span class="lg red">● Rauður dagur</span></div>
 <div class="gridwrap"><table class="pgrid"><thead><tr><th class="nm corner">${esc(VP.periodLabel(S.period))}</th>${head}<th class="sum" title="Fjöldi vakta">Vaktir</th><th class="sum" title="Unnar stundir + fjarvistir sem teljast til vinnuskyldu">Klst.</th><th class="sum">Skylda</th><th class="sum" title="Útistandandi: vinnuskylda − klst. (jákvætt = vantar tíma, neikvætt = umfram)">Útist.</th></tr></thead>
  <tbody>${rows}</tbody><tbody class="covb">${cov}</tbody></table></div>
 ${st.hourly.length?`<p class="hint">Ekki í vaktaplani: ${st.hourly.map(h=>`${esc(h.name)} (${esc(VP.STATUS_NAMES[h.status].toLowerCase())})`).join(', ')}.</p>`:''}
 <section class="panel" style="margin-top:20px"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">Athugasemdir (${shown.length})</h2>
  <div class="seg small">${[['all','Allt'],['error','Mönnun'],['warn','Viðvaranir'],['info','Óskir']].map(([k,t])=>`<button data-wf="${k}" class="${warnFilter===k?'on':''}">${t}</button>`).join('')}</div></div>
  ${shown.length?`<ul class="warns">${shown.slice(0,200).map(w=>`<li class="${w.level}">${esc(w.msg)}</li>`).join('')}${shown.length>200?`<li>… og ${shown.length-200} til viðbótar</li>`:''}</ul>`:'<p class="muted" style="margin-top:10px">Engar athugasemdir. 👍</p>'}
 </section>`+navBtns();
};
AFTER.plan=()=>{
  if(!$('#genBtn'))return;
  $('#genBtn').onclick=()=>{
    const b=$('#genBtn');b.disabled=true;b.textContent='Raða…';
    setTimeout(()=>{const t0=performance.now();pushUndo();
      try{const r=VP.generate(S);S.plan=r.plan;lastGen={...r,ms:performance.now()-t0};save();render();toast(r.unfilled?`Plan tilbúið, en ${r.unfilled} vaktir eru ómannaðar`:'Vaktaplan tilbúið');}
      catch(err){console.error(err);toast('Villa við röðun: '+err.message);b.disabled=false;}},30);};
  $('#clearBtn').onclick=()=>{pushUndo();for(const [k,v] of Object.entries(S.plan))if(v.s&&!S.locks[k])delete S.plan[k];save();render();};
  $('#lockAll').onclick=()=>{pushUndo();for(const [k,v] of Object.entries(S.plan))if(v.s)S.locks[k]=true;save();render();};
  $('#unlockAll').onclick=()=>{pushUndo();S.locks={};save();render();};
  $('#undoBtn').onclick=doUndo;
  $('#importBtn').onclick=()=>$('#importInput').click();
  $('#clearWishes').onclick=async()=>{if(!await ask('Fjarlægja allar óskir um vaktir á þessu tímabili? Óskir um frí haldast.'))return;pushUndo();
    const C=VP.buildCtx(S);for(const [k,w] of Object.entries(S.wishes))if(w.s&&C.idx[k.split('|')[1]]!=null)delete S.wishes[k];save();render();};
  $$('.dhb').forEach(b=>b.onclick=()=>dayEditor(b.dataset.day));
  $$('[data-wf]').forEach(b=>b.onclick=()=>{warnFilter=b.dataset.wf;render();});
  $$('[data-cell]').forEach(b=>{b.onclick=ev=>{ev.stopPropagation();openPop(b);};b.onkeydown=cellKey;});
  $$('[data-need]').forEach(b=>b.onclick=async()=>{const [d,id]=b.dataset.need.split('|'),s=shiftById(id),C=VP.buildCtx(S),i=C.idx[d];
    const k=d+'|'+id,cur=S.needOverride[k];const def=VP.needFor({...C,state:{...S,needOverride:{}}},i,C.shift[id]);
    const v=await ask(`Mönnunarþörf á ${s.name} ${VP.dateLabel(d)}.\nSjálfgefið: ${def}. Skildu eftir autt til að nota sjálfgefið.`,{input:cur??'',ok:'Vista'});
    if(v===null)return;pushUndo();if(v.trim()==='')delete S.needOverride[k];else S.needOverride[k]=Math.max(0,parseInt(v)||0);save();render();});
  const gw=$('.gridwrap');if(gw&&AFTER._scroll!=null){gw.scrollLeft=AFTER._scroll;}if(gw)gw.onscroll=()=>AFTER._scroll=gw.scrollLeft;
  if(AFTER._focus){const el=document.querySelector(`[data-cell="${AFTER._focus}"]`);el&&el.focus();AFTER._focus=null;}
};
function setCell(key,val,{keepWish=true}={}){
  pushUndo();
  if(val==null){delete S.plan[key];delete S.locks[key];}
  else{S.plan[key]=val;if(val.s&&S.rules.lockManual)S.locks[key]=true;if(val.a)delete S.locks[key];}
  save();
}
function cellKey(ev){
  const b=ev.currentTarget,key=b.dataset.cell,[eid,d]=key.split('|');
  const moves={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};
  if(moves[ev.key]){ev.preventDefault();const ei=gridEmpIds.indexOf(eid),dates=VP.periodDates(S.period),di=dates.indexOf(d);
    const [dy,dx]=moves[ev.key],e2=gridEmpIds[ei+dy],d2=dates[di+dx];if(e2&&d2){const el=document.querySelector(`[data-cell="${e2}|${d2}"]`);el&&el.focus();}return;}
  if(ev.key==='Delete'||ev.key==='Backspace'){ev.preventDefault();setCell(key,null);AFTER._focus=key;render();return;}
  if(ev.ctrlKey||ev.metaKey||ev.altKey||ev.key.length!==1)return;
  const ch=ev.key.toLowerCase(),s=S.shifts.find(x=>x.code.toLowerCase()===ch),a=!s&&S.absTypes.find(x=>x.code.toLowerCase()===ch);
  if(s||a){ev.preventDefault();setCell(key,s?{s:s.id}:{a:a.id});AFTER._focus=key;render();}
}
let popEl=null;
function closePop(){if(popEl){popEl.remove();popEl=null;}}
function openPop(btn){
  closePop();
  const key=btn.dataset.cell,[eid,d]=key.split('|'),e=empById(eid),v=S.plan[key]||{},w=S.wishes[key]||{},C=VP.buildCtx(S),f=C.info(d);
  popEl=document.createElement('div');popEl.className='pop';popEl.setAttribute('role','dialog');
  popEl.innerHTML=`<div class="pop-h"><b>${esc(e.name)}</b><span>${esc(VP.dateLabel(d))}${f.hol?` · <span class="lg ${f.hol.kind}">${f.hol.kind==='major'?'★ ':''}${esc(f.hol.name)}</span>`:''}</span></div>
   <div class="pop-o">${S.shifts.map(s=>`<button data-ps="${s.id}" class="${v.s===s.id?'on':''}"><span class="code" style="background:${s.color};color:${textColor(s.color)}">${esc(s.code)}</span>${esc(s.name)}<small>${esc(s.start)}–${esc(s.end)}</small></button>`).join('')}</div>
   <div class="pop-o abs">${S.absTypes.map(a=>`<button data-pa="${a.id}" class="${v.a===a.id?'on':''}"><span class="code" style="background:${a.color};color:${textColor(a.color)}">${esc(a.code)}</span>${esc(a.name)}</button>`).join('')}</div>
   <div class="pop-f">
    <label class="check"><input type="checkbox" id="pWish" ${w.off?'checked':''}> Ósk um frí</label>
    <label class="check"><input type="checkbox" id="pLock" ${S.locks[key]?'checked':''} ${v.s?'':'disabled'}> Læst</label>
    <button class="small" id="pClear">Tæma reit</button></div>`;
  document.body.appendChild(popEl);
  const r=btn.getBoundingClientRect(),pw=popEl.offsetWidth,ph=popEl.offsetHeight;
  let x=r.left+window.scrollX,y=r.bottom+window.scrollY+4;
  if(x+pw>window.scrollX+document.documentElement.clientWidth-8)x=window.scrollX+document.documentElement.clientWidth-pw-8;
  if(r.bottom+ph>window.innerHeight-8&&r.top>ph)y=r.top+window.scrollY-ph-4;
  popEl.style.left=Math.max(8,x)+'px';popEl.style.top=y+'px';
  const done=()=>{closePop();AFTER._focus=key;render();};
  popEl.querySelectorAll('[data-ps]').forEach(b=>b.onclick=()=>{setCell(key,{s:b.dataset.ps});done();});
  popEl.querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{setCell(key,{a:b.dataset.pa});done();});
  popEl.querySelector('#pClear').onclick=()=>{setCell(key,null);done();};
  popEl.querySelector('#pWish').onchange=ev=>{pushUndo();if(ev.target.checked)S.wishes[key]={off:true};else delete S.wishes[key];save();done();};
  popEl.querySelector('#pLock').onchange=ev=>{pushUndo();if(ev.target.checked)S.locks[key]=true;else delete S.locks[key];save();done();};
  popEl.addEventListener('keydown',ev=>{if(ev.key==='Escape'){closePop();btn.focus();}});
  (popEl.querySelector('.on')||popEl.querySelector('button')).focus();
}
document.addEventListener('click',ev=>{if(popEl&&!popEl.contains(ev.target))closePop();});

/* ---------- Skref 7: Útreikningar ---------- */
VIEWS.utreikningar=()=>{
  const st=VP.stats(S),C=st.C,R=S.rules,t=st.tot;
  const catCols=VP.CATS.map(c=>`<th class="num">${VP.CAT_NAMES[c]}${c!=='day'?`<small>${fmt(R.rates[c],2)}%</small>`:''}</th>`).join('');
  const max=Math.max(1,...st.emp.map(o=>Math.abs(o.balance)));
  return intro('Útreikningar',`Vinnuskylda tímabilsins: ${C.workdays} virkir dagar${C.holReduction?` − ${fmt(C.holReduction)} frídagar á virkum degi`:''} = <b>${fmt(C.effWorkdays)} dagar × ${fmt(C.daily,2)} klst.</b> í 100% starfi. Unnar stundir eru flokkaðar eftir tímamörkum og dögum (sjá Grunnur).`)+`
 <div class="kpis big">
  <div><b>${fmt(t.target)}</b><span>klst. vinnuskylda alls</span></div><div><b>${fmt(t.worked)}</b><span>klst. á vöktum</span></div>
  <div><b>${fmt(t.credit)}</b><span>klst. fjarvistir (reiknaðar)</span></div><div class="${t.have<t.need?'bad':'good'}"><b>${t.need?fmt(t.have/t.need*100,1):100}%</b><span>mönnun skv. þörf</span></div></div>
 <section class="panel"><h2>Vinnustundir og staða</h2><div class="tablewrap"><table class="data stat"><thead><tr><th>Starfsmaður</th><th class="num">Hlutf.</th><th class="num">Vinnu&shy;skylda</th><th class="num">Vaktir</th><th class="num">Á vöktum</th><th class="num">Fjarvistir</th><th class="num">Samtals</th><th class="num">Útistand&shy;andi</th><th class="num">Flutt</th><th class="num">Staða</th><th style="min-width:120px"></th></tr></thead><tbody>
 ${st.emp.map(o=>`<tr><td><b>${esc(o.name)}</b></td><td class="num">${fmt(o.pctMax)}%</td><td class="num">${fmt(o.target)}</td><td class="num">${o.shifts}</td><td class="num">${fmt(o.worked)}</td><td class="num">${fmt(o.credit)}</td><td class="num">${fmt(o.total)}</td>
   <td class="num ${o.outstanding<-(+R.hourTolerance||0)?'bad':''}">${fmt(o.outstanding)}</td><td class="num">${fmtS(o.carry)}</td><td class="num"><b>${fmtS(o.balance)}</b></td>
   <td><div class="bal"><span class="${o.balance<0?'neg':'pos'}" style="width:${Math.abs(o.balance)/max*50}%"></span></div></td></tr>`).join('')}
 </tbody><tfoot><tr><td>Samtals</td><td></td><td class="num">${fmt(t.target)}</td><td class="num">${st.emp.reduce((a,o)=>a+o.shifts,0)}</td><td class="num">${fmt(t.worked)}</td><td class="num">${fmt(t.credit)}</td><td class="num">${fmt(t.worked+t.credit)}</td><td class="num">${fmt(t.target-t.worked-t.credit)}</td><td></td><td></td><td></td></tr></tfoot></table></div>
 <p class="hint">Samtals = stundir á vöktum + fjarvistir sem teljast til vinnuskyldu. Útistandandi = vinnuskylda − samtals (jákvætt: tímar sem á eftir að raða, neikvætt: umfram). Staða = samtals − vinnuskylda + flutt staða frá fyrra tímabili. Vinnuskylda reiknast fyrir hvern virkan dag eftir starfshlutfalli þann dag, svo breytingar á tímabilinu skila sér.</p>
 ${st.hourly.length?`<p class="hint">Ekki í vaktaplani: ${st.hourly.map(h=>`${esc(h.name)} (${esc(VP.STATUS_NAMES[h.status].toLowerCase())})`).join(', ')}.</p>`:''}</section>
 <section class="panel"><h2>Skipting vinnustunda og álag</h2><div class="tablewrap"><table class="data stat"><thead><tr><th>Starfsmaður</th>${catCols}<th class="num">Álags&shy;stundir</th><th class="num">Helgar</th><th class="num">Nætur</th><th class="num">Frídaga&shy;vaktir</th><th class="num">Óskaðar vaktir</th><th class="num">Óskir um frí</th></tr></thead><tbody>
 ${st.emp.map(o=>`<tr><td><b>${esc(o.name)}</b></td>${VP.CATS.map(c=>`<td class="num">${o.cats[c]?fmt(o.cats[c],2):'–'}</td>`).join('')}<td class="num"><b>${fmt(o.premium,2)}</b></td><td class="num" title="${o.weekendDays} helgardagar">${o.weekends}</td><td class="num">${o.nights}</td><td class="num">${o.holidayShifts}</td><td class="num">${o.wishShift?o.wishShiftKept+'/'+o.wishShift:'–'}</td><td class="num">${o.wishOff?o.wishOffKept+'/'+o.wishOff:'–'}</td></tr>`).join('')}
 </tbody><tfoot><tr><td>Samtals</td>${VP.CATS.map(c=>`<td class="num">${fmt(t.cats[c],2)}</td>`).join('')}<td class="num">${fmt(st.emp.reduce((a,o)=>a+o.premium,0),2)}</td><td></td><td></td><td></td><td></td><td></td></tr></tfoot></table></div>
 <p class="hint">Álagsstundir = Σ (stundir í flokki × álagsprósenta). Dæmi: 8 klst. á stórhátíðardegi með 90% álagi gefa 7,2 álagsstundir. „Helgar“ er fjöldi helga sem unnið er á, „Frídagavaktir“ eru vaktir á rauðum dögum og stórhátíðardögum.</p></section>
 <section class="panel"><h2>Vaktir eftir tegund</h2><div class="tablewrap"><table class="data stat"><thead><tr><th>Starfsmaður</th>${C.shifts.map(s=>`<th class="num"><span class="sw" style="background:${s.color}"></span>${esc(s.code)}</th>`).join('')}${S.absTypes.map(a=>`<th class="num">${esc(a.code)}</th>`).join('')}</tr></thead><tbody>
 ${st.emp.map(o=>`<tr><td>${esc(o.name)}</td>${C.shifts.map(s=>`<td class="num">${o.byShift[s.id]||'–'}</td>`).join('')}${S.absTypes.map(a=>`<td class="num">${o.abs[a.id]||'–'}</td>`).join('')}</tr>`).join('')}
 </tbody></table></div></section>`+navBtns();
};

/* ---------- Skref 8: Útgáfa ---------- */
function weeksOfPeriod(){
  const dates=VP.periodDates(S.period),W=[];
  dates.forEach(d=>{const k=VP.isoWeek(d);let w=W[W.length-1];if(!w||w.week!==k){w={week:k,dates:[]};W.push(w);}w.dates.push(d);});
  return W;
}
VIEWS.utgafa=()=>{
  const W=weeksOfPeriod(),st=VP.stats(S),missing=st.days.reduce((a,r)=>a+Object.values(r.shifts).reduce((b,x)=>b+Math.max(0,x.need-x.have),0),0);
  const planned=Object.values(S.plan).some(v=>v.s);
  return intro('Útgáfa','Sæktu planið sem PDF til að prenta eða senda, eða sem JSON-skrá til að geyma og opna síðar.')+`
 ${!planned?'<div class="alert">Planið er tómt. Farðu í skrefið Vaktaplan og búðu það til fyrst.</div>':missing?`<div class="alert">Athugið: ${missing} vaktir eru enn ómannaðar.</div>`:''}
 <div class="cards">
  <div class="card"><h3>Allt planið</h3><p>Allt tímabilið á einni síðu (A4 langsnið, eða A3 ef þarf) með skýringum, mönnun og útreikningum fyrir hvern starfsmann.</p>
   <label class="check"><input type="checkbox" id="pdfStats" checked> Taka með útreikninga</label>
   <button class="primary" data-pdf="full">Sækja PDF</button></div>
  <div class="card"><h3>Vikuplan</h3><p>Ein vika á síðu: hverjir eru á hvaða vakt hvern dag, með tímum og vikustundum.</p>
   <select id="weekSel"><option value="all">Allar vikur (ein vika á síðu)</option>${W.map((w,i)=>`<option value="${i}">Vika ${w.week}: ${esc(VP.shortDate(w.dates[0]))}–${esc(VP.shortDate(w.dates[w.dates.length-1]))}</option>`).join('')}</select>
   <button class="primary" data-pdf="week">Sækja PDF</button></div>
  <div class="card"><h3>Einstaklingsplan</h3><p>Vaktir eins starfsmanns með tímum, frídögum og stundauppgjöri.</p>
   <select id="empSel"><option value="all">Allir starfsmenn (einn á síðu)</option>${VP.buildCtx(S).emps.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select>
   <button class="primary" data-pdf="person">Sækja PDF</button></div>
  <div class="card"><h3>JSON</h3><p>Öll gögn: vaktir, starfsfólk, frídagar, óskir, planið og reglur. Hægt að opna aftur hér eða nota í önnur kerfi.</p>
   <div class="toolbar"><button class="primary" data-act="save">Sækja JSON</button><button data-act="open">Opna JSON</button></div>
   <details><summary>JSON fyrir vikuplan eða einstakling</summary>
    <div class="toolbar" style="margin-top:8px"><button data-json="week">Vika (valin að ofan)</button><button data-json="person">Starfsmaður (valinn að ofan)</button></div></details></div>
  <div class="card"><h3>Næsta tímabil</h3><p>Stofnar nýtt tímabil með sömu vöktum, starfsfólki og reglum. Staða hvers starfsmanns flyst yfir sem „flutt staða“. Sæktu JSON af núverandi tímabili fyrst.</p>
   <button id="nextPeriod">Stofna næsta tímabil</button></div>
 </div>`+navBtns();
};
AFTER.utgafa=()=>{
  $$('[data-pdf]').forEach(b=>b.onclick=async()=>{
    const kind=b.dataset.pdf,old=b.textContent;b.disabled=true;b.textContent='Bý til PDF…';
    try{
      if(kind==='full')await VPPDF.full(S,{stats:$('#pdfStats').checked});
      if(kind==='week'){const v=$('#weekSel').value,W=weeksOfPeriod();await VPPDF.week(S,v==='all'?W:[W[+v]]);}
      if(kind==='person'){const v=$('#empSel').value;await VPPDF.person(S,v==='all'?VP.buildCtx(S).emps.map(e=>e.id):[v]);}
    }catch(err){console.error(err);toast('Villa: '+err.message);}
    b.disabled=false;b.textContent=old;});
  $$('[data-json]').forEach(b=>b.onclick=()=>{
    const st=VP.stats(S),C=st.C,sh=id=>{const s=C.shift[id];return s?{code:s.code,name:s.name,start:s.start,end:s.end,hours:s.hours}:null;};
    const entry=(e,d)=>{const v=S.plan[K(e.id,d)],f=C.info(d);return {date:d,weekday:VP.DAYS[f.dow],holiday:f.hol?{name:f.hol.name,kind:f.hol.kind==='major'?'stórhátíðardagur':'rauður dagur',from:f.hol.from||null}:null,
      shift:v&&v.s?sh(v.s):null,absence:v&&v.a&&C.abs[v.a]?C.abs[v.a].name:null,wish:S.wishes[K(e.id,d)]||null};};
    if(b.dataset.json==='week'){const v=$('#weekSel').value,W=weeksOfPeriod(),ws=v==='all'?W:[W[+v]];
      const data={workplace:S.workplace,period:VP.periodRange(S.period.year,S.period.month),weeks:ws.map(w=>({week:w.week,from:w.dates[0],to:w.dates[w.dates.length-1],
        days:w.dates.map(d=>({date:d,weekday:VP.DAYS[VP.dow(d)],holiday:C.info(d).hol||null,shifts:C.shifts.filter(s=>!s.countsAs).map(s=>({code:s.code,name:s.name,start:s.start,end:s.end,
          staff:C.emps.filter(e=>{const v=S.plan[K(e.id,d)];return v&&v.s&&C.shift[v.s]&&VP.covId(C,v.s)===s.id;}).map(e=>{const v=S.plan[K(e.id,d)];return v.s===s.id?e.name:`${e.name} (${C.shift[v.s].start}–${C.shift[v.s].end})`;})}))}))}))};
      download(fileSlug()+(v==='all'?'-vikur':'-vika-'+ws[0].week)+'.json',JSON.stringify(data,null,2),'application/json');}
    else{const v=$('#empSel').value,ids=v==='all'?C.emps.map(e=>e.id):[v];
      const data={workplace:S.workplace,period:VP.periodRange(S.period.year,S.period.month),employees:ids.map(id=>{const e=empById(id),o=st.emp.find(x=>x.id===id);
        return {name:e.name,title:e.title,pct:e.pct,summary:{target:o.target,worked:VP.round2(o.worked),absenceCredit:VP.round2(o.credit),outstanding:VP.round2(o.outstanding),diff:VP.round2(o.diff),carry:o.carry,balance:VP.round2(o.balance),
          hoursByCategory:Object.fromEntries(VP.CATS.map(c=>[VP.CAT_NAMES[c],VP.round2(o.cats[c])])),premiumHours:VP.round2(o.premium)},days:C.dates.map(d=>entry(e,d))};})};
      download(fileSlug()+(v==='all'?'-starfsmenn':'-'+(empById(v).name||'starfsmadur').toLowerCase().replace(/ð/g,'d').replace(/þ/g,'th').replace(/æ/g,'ae').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w]+/g,'-'))+'.json',JSON.stringify(data,null,2),'application/json');}
  });
  $('#nextPeriod').onclick=async()=>{
    if(!await ask('Stofna næsta tímabil? Planið fyrir núverandi tímabil helst í skránni en staða starfsfólks flyst yfir sem „flutt staða“.'))return;
    pushUndo();const st=VP.stats(S);S.employees.forEach(e=>{const o=st.emp.find(x=>x.id===e.id);if(o)e.carry=VP.round2(o.balance);});
    let {year:y,month:m}=S.period;m++;if(m>12){m=1;y++;}S.locks={};lastGen=null;setPeriod({year:y,month:m});step=5;render();toast('Nýtt tímabil: '+VP.periodLabel(S.period));};
};

/* ---------- Almennt ---------- */
function saveJson(){download(fileSlug()+'.json',JSON.stringify({app:'vaktaplan',...S},null,2),'application/json');}
function openJson(file){
  const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.shifts||!d.employees)throw Error('Skráin er ekki vaktaplan.');
    pushUndo();delete d.app;S=normalize(d);save();render();toast('Opnað: '+file.name);}catch(e){toast('Ekki tókst að opna skrána: '+e.message);}};r.readAsText(file);
}
document.addEventListener('input',ev=>{
  const el=ev.target;if(!el.dataset||!el.dataset.k)return;
  let v=el.type==='checkbox'?el.checked:el.value;
  if(el.dataset.num!=null){if(v==='')return;v=+v;}
  if(el.dataset.numblank!=null)v=v===''?'':+v;
  if(el.type==='time'&&v==='00:00'&&/(\.end|eveningEnd)$/.test(el.dataset.k))v='24:00';
  setPath(el.dataset.k,v);save();
  if(el.dataset.hdr!=null)$('#wpName').textContent=S.workplace.name||'Vaktaplan';
});
document.addEventListener('change',ev=>{const el=ev.target;if(!(el.dataset&&el.dataset.k&&(el.dataset.re!=null||el.type==='checkbox'||el.type==='color')))return;
  setTimeout(()=>{const a=document.activeElement,k=a&&a.dataset&&a.dataset.k,sx=window.scrollX,sy=window.scrollY;render();window.scrollTo(sx,sy);
    if(k){const n=document.querySelector(`[data-k="${k}"]`);n&&n.focus();}},0);});
document.addEventListener('click',ev=>{
  const t=ev.target.closest('[data-step],[data-go],[data-act]');if(!t)return;
  if(t.dataset.step!=null)go(+t.dataset.step);
  else if(t.dataset.go!=null)go(+t.dataset.go);
  else if(t.dataset.act==='save')saveJson();
  else if(t.dataset.act==='open')$('#fileInput').click();
  else if(t.dataset.act==='pdf')VPPDF.full(S,{stats:true}).catch(e=>toast('Villa: '+e.message));
});
$('#importInput').onchange=ev=>{const f=ev.target.files[0];if(f)importFile(f);ev.target.value='';};
$('#fileInput').onchange=ev=>{const f=ev.target.files[0];if(f)openJson(f);ev.target.value='';};
document.addEventListener('dragover',ev=>ev.preventDefault());
document.addEventListener('drop',ev=>{ev.preventDefault();const f=ev.dataTransfer.files[0];if(f)openJson(f);});
document.addEventListener('keydown',ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key==='z'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ev.preventDefault();doUndo();}});
window.addEventListener('resize',closePop);
render();save();

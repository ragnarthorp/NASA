'use strict';
/* NASA · Skólanámskrá. Öll gögn eru í einum hlut (D) sem vistast í vafranum og má sækja/opna sem JSON. */
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const CAT=Object.fromEntries(CATS.map(c=>[c.id,c]));
const AREA=Object.fromEntries(AREAS.map(a=>[a.id,a]));
const CRIT=Object.fromEntries(CRITERIA.map(c=>[c.id,c]));
const catColor=id=>GROUPS[CAT[id].group].color;
const areasOf=catId=>AREAS.filter(a=>a.nasa===catId);
const SUBJECT={natt:'Náttúrugreinar',sam:'Samfélagsgreinar'};
const KINDS=['Þemalota','Smiðja','Uppbrotsdagur','Annað'];
const STORE='nasa-skolanamskra-v2';
const fmt=(n,d=1)=>{const f=10**d,v=Math.round((+n||0)*f)/f;return String(v).replace('.',',');};
const pct=p=>fmt(p*100)+'%';
const uid=()=>globalThis.crypto?.randomUUID?.()||('id'+Date.now().toString(36)+Math.random().toString(36).slice(2));
const clone=o=>JSON.parse(JSON.stringify(o));
const critLabel=id=>{const c=CRIT[id];return c?AREA[c.g].name+' · '+c.s:id;};

let D;
const ui={step:'start',theme:null,cat:'work',year:'',search:'',allCrit:false,balYears:null,uncoveredOnly:false,calc:{grade:'9',b:72,pts:2,a:''}};

/* ---------- gögn ---------- */
function fresh(){
  return {format:'nasa-skolanamskra',version:2,
    meta:{title:'Skólanámskrá NASA',school:'Norðlingaskóli',grades:'8.–10. bekkur',cycleStart:new Date().getMonth()>6?new Date().getFullYear():new Date().getFullYear()-1,authors:'',updated:null},
    ratio:{natt:40,coreNatt:50},
    targets:{...DEFAULT_TARGETS},
    info:clone(DEFAULT_INFO),
    catNotes:Object.fromEntries(CATS.map(c=>[c.id,''])),
    assessment:clone(DEFAULT_ASSESSMENT),
    themes:[],projects:[]};
}
const str=(v,max=20000)=>typeof v==='string'?v.slice(0,max):'';
const numIn=(v,lo,hi,dflt)=>{const n=Number(v);return v!==null&&v!==''&&Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):dflt;};
const mapCat=id=>id==='human'?'life':id;
function normTheme(t){
  if(!t||typeof t!=='object')throw Error('Ógilt þema.');
  return {id:typeof t.id==='string'&&t.id?t.id:uid(),title:str(t.title,150),summary:str(t.summary),year:str(t.year,20),period:str(t.period,80),
    weeks:numIn(t.weeks,0,52,null)||null,kind:KINDS.includes(t.kind)?t.kind:'Þemalota',
    entries:(Array.isArray(t.entries)?t.entries:[]).slice(0,600).map(e=>({id:uid(),category:CAT[mapCat(e?.category)]?mapCat(e.category):'work',note:str(e?.note,5000),criteria:(Array.isArray(e?.criteria)?e.criteria:[]).filter(id=>CRIT[id])}))};
}
function normProject(p){
  return {id:uid(),kind:p?.kind==='rannsókn'?'rannsókn':'hækkun',title:str(p?.title,200),category:CAT[mapCat(p?.category)]?mapCat(p.category):'work',
    points:numIn(p?.points,0,3,1),theme:str(p?.theme,80),description:str(p?.description)};
}
function normalize(o){
  if(!o||o.format!=='nasa-skolanamskra')throw Error('Þetta er ekki námskrárskrá NASA.');
  const d=fresh();
  for(const k of Object.keys(d.meta))if(k in (o.meta||{}))d.meta[k]=k==='cycleStart'?numIn(o.meta[k],2000,2100,d.meta[k]):str(o.meta[k],300)||(k==='updated'?null:'');
  d.ratio.natt=numIn(o.ratio?.natt,0,100,40);d.ratio.coreNatt=numIn(o.ratio?.coreNatt,0,100,50);
  for(const c of CATS)d.targets[c.id]=numIn(o.targets?.[c.id]??o.targets?.[c.id==='life'?'human':c.id],0,100,d.targets[c.id]);
  if(Array.isArray(o.info))d.info=o.info.slice(0,60).map(s=>({title:str(s?.title,200),body:str(s?.body)}));
  for(const c of CATS)d.catNotes[c.id]=str(o.catNotes?.[c.id]);
  const a=o.assessment||{},A=d.assessment;
  A.bIntro=str(a.bIntro)||A.bIntro;A.aIntro=str(a.aIntro)||A.aIntro;A.research=str(a.research)||A.research;A.notes=str(a.notes);
  if(Array.isArray(a.bBands))A.bBands.forEach(b=>{const m=a.bBands.find(x=>x?.grade===b.grade);if(m){b.min=b.grade==='D'?0:numIn(m.min,0,100,b.min);b.label=str(m.label,200)||b.label;}});
  for(const g of ['8','9','10'])A.handicap[g]=numIn(a.handicap?.[g],0,100,A.handicap[g]);
  A.pointValue=numIn(a.pointValue,0,100,A.pointValue);A.maxPoints=numIn(a.maxPoints,0,99,A.maxPoints);
  A.finalIntro=str(a.finalIntro)||A.finalIntro;A.support=typeof a.support==='string'?a.support:A.support;
  for(const g of Object.keys(A.gradeValues))A.gradeValues[g]=numIn(a.gradeValues?.[g],0,10,A.gradeValues[g]);
  if(Array.isArray(a.scale))A.scale.forEach((s,i)=>{const m=a.scale.find(x=>x?.grade===s.grade);if(m&&s.min>0)s.min=numIn(m.min,0,10,s.min);});
  A.aMax=numIn(a.aMax,1,1000,A.aMax);A.aA=numIn(a.aA,0,1000,A.aA);A.aBplus=numIn(a.aBplus,0,1000,A.aBplus);
  d.themes=(Array.isArray(o.themes)?o.themes:[]).slice(0,400).map(normTheme);
  const ids=new Set();d.themes.forEach(t=>{if(ids.has(t.id))t.id=uid();ids.add(t.id);});
  d.projects=(Array.isArray(o.projects)?o.projects:[]).slice(0,1000).map(normProject);
  return d;
}
function load(){try{const s=localStorage.getItem(STORE);D=s?normalize(JSON.parse(s)):fresh();}catch{D=fresh();}}
let saveTimer;
function changed(){D.meta.updated=new Date().toISOString();clearTimeout(saveTimer);saveTimer=setTimeout(persist,300);}
function persist(){
  try{localStorage.setItem(STORE,JSON.stringify(D));$('saveState').textContent='Vistað sjálfkrafa í þessum vafra kl. '+new Date().toLocaleTimeString('is-IS',{hour:'2-digit',minute:'2-digit'})+'. Sæktu JSON til að varðveita eða deila.';}
  catch{$('saveState').textContent='Ekki tókst að vista í vafranum. Sæktu JSON-skrá til að varðveita vinnuna.';}
}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),3200);}
function setPath(obj,path,val){const ks=path.split('.');let o=obj;for(let i=0;i<ks.length-1;i++)o=o[ks[i]];o[ks.at(-1)]=val;}
function getPath(obj,path){return path.split('.').reduce((o,k)=>o?.[k],obj);}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);}
const themeFileBase=t=>'NASA-'+((mdPlain(t.title)||'thema').replace(/[^\p{L}\p{N}_-]+/gu,'-').replace(/^-|-$/g,'').slice(0,70)||'thema');
const fileBase=()=>(D.meta.title||'NASA-skolanamskra').replace(/[^\p{L}\p{N}_-]+/gu,'-').replace(/^-|-$/g,'').slice(0,70)||'NASA';
function cycleYears(){const s=+D.meta.cycleStart||2026;return [0,1,2].map(i=>(s+i)+'–'+(s+i+1));}
function allYears(){const ys=new Set(cycleYears());D.themes.forEach(t=>t.year&&ys.add(t.year));return [...ys].sort();}
function themeById(id){return D.themes.find(t=>t.id===id);}

/* ---------- útreikningar ---------- */
function shares(entries){const counts=Object.fromEntries(CATS.map(c=>[c.id,0]));entries.forEach(e=>counts[e.category]++);const n=entries.length;return {counts,total:n,weights:Object.fromEntries(CATS.map(c=>[c.id,n?counts[c.id]/n:0]))};}
function entryNatt(e){
  if(e.criteria.length)return e.criteria.filter(id=>AREA[CRIT[id].g].subject==='natt').length/e.criteria.length;
  const g=CAT[e.category].group;return g==='natt'?1:g==='sam'?0:D.ratio.coreNatt/100;
}
function aggregate(list){
  const w=Object.fromEntries(CATS.map(c=>[c.id,0]));let weeks=0,natt=0;const included=[],excluded=[];
  for(const t of list){
    if(!t.weeks||!t.entries.length){excluded.push(t);continue;}
    const s=shares(t.entries);weeks+=t.weeks;included.push(t);
    CATS.forEach(c=>w[c.id]+=t.weeks*s.weights[c.id]);
    natt+=t.weeks*t.entries.reduce((a,e)=>a+entryNatt(e),0)/t.entries.length;
  }
  if(weeks){CATS.forEach(c=>w[c.id]/=weeks);natt/=weeks;}
  return {weights:w,weeks,natt:weeks?natt:null,included,excluded};
}
function themeNatt(t){return t.entries.length?t.entries.reduce((a,e)=>a+entryNatt(e),0)/t.entries.length:null;}
const targetSum=()=>CATS.reduce((a,c)=>a+(+D.targets[c.id]||0),0);
function targetNatt(){const s=targetSum()||1;return CATS.reduce((a,c)=>{const g=c.group,v=+D.targets[c.id]||0;return a+(g==='natt'?v:g==='core'?v*D.ratio.coreNatt/100:0);},0)/s;}
const targetWeights=()=>{const s=targetSum()||1;return Object.fromEntries(CATS.map(c=>[c.id,(+D.targets[c.id]||0)/s]));};
function coverage(list){const m=Object.fromEntries(CRITERIA.map(c=>[c.id,new Set()]));list.forEach(t=>t.entries.forEach(e=>e.criteria.forEach(id=>m[id]?.add(t.title||'Ónefnt þema'))));return m;}

/* ---------- þemamynd (hjól) ---------- */
const ANG={energy:240,chem:180,space:120,history:300,civic:0,ethics:60,work:270,environment:30,life:150};
function point(r,a){const t=a*Math.PI/180;return [+(500+r*Math.cos(t)).toFixed(2),+(520+r*Math.sin(t)).toFixed(2)];}
function wedge(ri,ro,a,b){const A=point(ro,a),B=point(ro,b),C=point(ri,b),E=point(ri,a),f=b-a>180?1:0;return `M${A} A${ro},${ro} 0 ${f} 1 ${B} L${C} A${ri},${ri} 0 ${f} 0 ${E} Z`;}
const ICONS={search:'<circle cx="19" cy="19" r="13"/><path d="M29 29l13 13"/>',leaf:'<path d="M10 40C-2 14 13 2 38 5c5 24-7 39-28 35zm-3 5L34 11M21 28l-1-13"/>',
  cell:'<ellipse cx="24" cy="24" rx="21" ry="17"/><circle cx="28" cy="21" r="6"/><circle cx="28" cy="21" r="1.5"/><path d="M9 28q4-4 8 0M13 14q3 3 6 0M20 35q3-3 6 0"/>',
  bolt:'<path d="M29 3L10 27h15l-6 19 22-27H27z"/>',flask:'<path d="M17 3h14M19 3v17L7 42q-2 4 3 4h29q5 0 3-4L29 20V3M13 32h23"/><circle cx="24" cy="38" r="2"/>',
  planet:'<circle cx="24" cy="24" r="17"/><ellipse cx="24" cy="24" rx="25" ry="7"/><circle cx="43" cy="3" r="2"/>',
  book:'<path d="M3 6l21-4 21 4v37l-21 4-21-4zM24 2v45M9 15l9-2m-9 12 9-2m-9 12 9-2m12-20 9 2m-9 8 9 2m-9 8 9 2"/>',
  building:'<path d="M1 14L24 3l23 11H1zm6 7v20m17-20v20m17-20v20M2 46h44"/>',balance:'<path d="M24 3v43M4 14h40M8 14L1 31h14L8 14zm32 0-7 17h14L40 14zM12 46h24"/>'};
function iconSVG(id,x,y,sz,col){return `<g transform="translate(${x-sz/2} ${y-sz/2}) scale(${sz/48})" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[CAT[id].icon]}</g>`;}
function tint(hex,t){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)),base=[248,247,243];return '#'+rgb.map((v,i)=>Math.round(base[i]+(v-base[i])*t).toString(16).padStart(2,'0')).join('');}
function txt(x,y,s,size,fill,weight=400,extra=''){return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}"${extra}>${esc(s)}</text>`;}
/* values: id -> hlutfall (0–1). opts.sub: id -> aukalína, opts.selected, opts.interactive, opts.label */
function wheelSVG(values,opts={}){
  const max=Math.max(...CATS.map(c=>values[c.id]||0))||1;
  let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 60 1000 920" width="1000" height="920" role="img" aria-label="${esc(opts.label||'Þemamynd')}: ${CATS.map(c=>esc(c.name)+' '+pct(values[c.id]||0)).join(', ')}">`;
  o+=`<rect x="0" y="60" width="1000" height="920" fill="#f8f7f3"/>`;
  o+=txt(120,120,'NÁTTÚRUFRÆÐI',17,'#177d88',700,' letter-spacing="1.5"')+txt(880,120,'SAMFÉLAGSFRÆÐI',17,'#b86140',700,' letter-spacing="1.5"');
  for(const c of CATS){
    const core=c.group==='core',a=ANG[c.id],ri=core?66:238,ro=core?228:426,half=core?60:30,v=values[c.id]||0,on=v>0,col=GROUPS[c.group].color;
    let [x,y]=point(core?148:336,a);if(core&&c.id!=='work')y+=6;if(c.id==='work')y+=8;
    const sel=opts.selected===c.id?' sel':'';
    o+=opts.interactive?`<g class="chartsector${sel}" tabindex="0" role="button" data-category="${c.id}" aria-label="${esc(c.name)}: ${pct(v)}">`:'<g>';
    o+=`<title>${esc(c.name)} · ${pct(v)}</title><path class="slice" d="${wedge(ri,ro,a-half+0.9,a+half-0.9)}" fill="${on?tint(col,0.12+0.5*v/max):tint(col,0.06)}"/>`;
    const fs=core?16:21,lh=core?19:24,top=y-(core?44:50);
    o+=iconSVG(c.id,x,top,core?28:36,on?col:'#a5b1ab');
    c.short.forEach((s,i)=>o+=txt(x,y+i*lh,s,fs,on?'#183e43':'#86968f',700));
    let yy=y+c.short.length*lh+(core?6:8);
    o+=txt(x,yy,pct(v),core?20:24,on?col:'#a5b1ab',700);
    if(opts.sub?.[c.id]){yy+=core?18:22;o+=txt(x,yy,opts.sub[c.id],core?12:14,'#5d7373',400);}
    if(c.tag){yy+=core?24:28;o+=`<rect x="${x-46}" y="${yy-14}" width="92" height="20" rx="10" fill="#e5efc9"/>`+txt(x,yy+1,c.tag.toUpperCase(),11,'#4c6a12',700,' letter-spacing="1"');}
    o+='</g>';
  }
  o+=`<circle cx="500" cy="520" r="62" fill="#183e43"/>`+txt(500,517,'NASA',22,'#f8f7f3',700)+txt(500,540,'KJARNI',10,'#c4dace',700,' letter-spacing="2"');
  return o+'</svg>';
}
const legend=()=>`<div class="legend">${Object.values(GROUPS).map(g=>`<span><i style="background:${g.color}"></i>${esc(g.name)}</span>`).join('')}<span>Dekkri litur = meira vægi</span></div>`;

/* ---------- skref ---------- */
const STEPS=[
  {id:'start',name:'Grunnur',desc:'Heiti, tímabil og upphafspunktur: ný námskrá eða opna vistaða skrá.'},
  {id:'info',name:'Um kennsluna',desc:'Almennar upplýsingar: samkennsla, þemu, verkefni og vinnulag.'},
  {id:'cats',name:'Hæfniflokkar',desc:'Flokkarnir níu, tengsl við aðalnámskrá og markmið um vægi.'},
  {id:'themes',name:'Þemu',desc:'Þemalotur, áherslur og tengd hæfniviðmið.'},
  {id:'projects',name:'Verkefni',desc:'Banki hækkunar- og rannsóknarverkefna.'},
  {id:'assess',name:'Námsmat',desc:'B-próf, hækkunarstig og A-próf, með reiknivél.'},
  {id:'balance',name:'Jafnvægi',desc:'Tímavegið vægi yfir þriggja ára tímabil og þekja hæfniviðmiða.'},
  {id:'export',name:'Útgáfa',desc:'Gátlisti, PDF-skjal og JSON-skrá.'}
];
function renderStepper(){$('stepper').innerHTML=STEPS.map((s,i)=>`<button data-step="${s.id}" ${ui.step===s.id?'aria-current="step"':''}><span class="n">${i+1}</span>${esc(s.name)}</button>`).join('');}
function go(step,focus=true){
  if(!VIEWS[step])step='start';ui.step=step;renderStepper();render();
  if(location.hash!=='#'+step)history.replaceState(null,'','#'+step);
  if(focus){window.scrollTo({top:0});$('view').focus({preventScroll:true});}
}
function render(){const v=VIEWS[ui.step];$('view').innerHTML=v.render();v.after?.();}
const intro=(eyebrow,title,text,tools='')=>`<section class="intro"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${text}</p></div>${tools?`<div class="toolbar">${tools}</div>`:''}</section>`;
const field=(label,path,attrs='',type='text')=>`<div class="field"><label for="f-${path}">${esc(label)}</label><input id="f-${path}" type="${type}" data-path="${path}" ${type==='number'?'data-type="number"':''} value="${esc(getPath(D,path)??'')}" ${attrs}></div>`;
const area=(label,path,attrs='',preview=true)=>`<div class="field"><label for="f-${path}">${esc(label)}</label><textarea id="f-${path}" data-path="${path}" ${attrs}>${esc(getPath(D,path)??'')}</textarea>${preview?`<div class="markdown md-preview" data-preview="${path}">${markdown(getPath(D,path))}</div>`:''}</div>`;
const mdHint='<p class="hint">Markdown: **feitletrað**, *skáletrað*, ~~yfirstrikað~~, `kóði`, # fyrirsögn, - eða 1. fyrir lista (inndráttur fyrir undirlista), &gt; tilvitnun, --- lína og [texti](https://…) tengill.</p>';
const catOptions=v=>Object.entries(GROUPS).map(([g,G])=>`<optgroup label="${esc(G.name)}">${CATS.filter(c=>c.group===g).map(c=>`<option value="${c.id}" ${v===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</optgroup>`).join('');
const badge=c=>`<span class="badge ${c.group}">${esc(GROUPS[c.group].short)}</span>${c.tag?` <span class="badge life">${esc(c.tag)}</span>`:''}`;

function stepStatus(){
  const ts=targetSum(),agg=aggregate(D.themes),cov=coverage(D.themes),covered=Object.values(cov).filter(s=>s.size).length;
  return {
    start:!!D.meta.title.trim(),info:D.info.some(s=>s.body.trim()),cats:Math.abs(ts-100)<0.01,themes:D.themes.length>0&&D.themes.every(t=>t.weeks&&t.entries.length),
    projects:D.projects.length>0,assess:true,balance:agg.weeks>0,export:false,_ts:ts,_agg:agg,_covered:covered
  };
}

const VIEWS={};
/* 1. Grunnur */
VIEWS.start={render(){
  const st=stepStatus();
  return intro('Skref 1 · Grunnur','Skólanámskrá NASA','Hér er skólanámskrá náttúru- og samfélagsgreina í Norðlingaskóla hönnuð skref fyrir skref. Vinnan vistast sjálfkrafa í vafranum. Sæktu JSON-skrá til að varðveita hana og opnaðu hana síðar til að halda áfram eða byggja nýja útgáfu á eldri grunni.')+
  `<div class="grid2"><section class="panel"><h2>Upplýsingar um námskrána</h2>
    ${field('Heiti','meta.title','maxlength="150"')}
    <div class="row">${field('Skóli','meta.school','maxlength="120"')}${field('Árgangar','meta.grades','maxlength="60"')}</div>
    <div class="row">${field('Fyrsta skólaár þriggja ára tímabils','meta.cycleStart','min="2000" max="2100" step="1"','number')}${field('Ábyrgð / höfundar','meta.authors','maxlength="300"')}</div>
    <p class="hint" id="cycleHint">Tímabil: ${esc(cycleYears().join(', '))}. Vægi hæfniflokka er metið yfir þessi þrjú skólaár.</p>
  </section>
  <section class="panel"><h2>Upphafspunktur</h2>
    <div class="cards">
      <div class="card"><h3>Opna vistaða námskrá</h3><p>Byrjaðu á grunni sem þegar hefur verið saminn (JSON-skrá úr þessum vef). Einnig má flytja inn þemaskrár úr eldri þemamyndavefnum.</p><button class="primary" data-act="open">Opna JSON-skrá</button></div>
      <div class="card"><h3>Sýnidæmi</h3><p>Bætir tveimur sýniþemum og nokkrum verkefnum við námskrána svo hægt sé að skoða virknina.</p><button data-act="demo">Bæta við sýnidæmum</button></div>
      <div class="card"><h3>Byrja frá grunni</h3><p>Hreinsar alla vinnu í vafranum og hleður inn sjálfgefnum texta og markmiðum.</p><button class="danger" data-act="reset">Ný námskrá</button></div>
    </div>
  </section></div>
  <section class="panel"><h2>Skrefin</h2><p class="hint">Farðu í gegnum skrefin í röð eða hoppaðu beint í það sem þarf að vinna. Grænn punktur merkir að skrefið sé fullunnið.</p>
  <div class="cards">${STEPS.slice(1).map((s,i)=>`<button class="card stepcard" data-step="${s.id}"><span class="n">SKREF ${i+2}</span><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p>${s.id!=='export'&&s.id!=='assess'?`<span class="check"><span class="dot ${st[s.id]?'ok':'no'}">${st[s.id]?'✓':'!'}</span>${esc(stepNote(s.id,st))}</span>`:''}</button>`).join('')}</div></section>`;
},update(p){if(p==='meta.cycleStart')$('cycleHint').textContent='Tímabil: '+cycleYears().join(', ')+'. Vægi hæfniflokka er metið yfir þessi þrjú skólaár.';}};
function stepNote(id,st){
  switch(id){
    case 'info':return D.info.length+' kaflar';
    case 'cats':return 'Markmið samtals '+fmt(st._ts)+'%';
    case 'themes':return D.themes.length+' þemu · '+D.themes.reduce((a,t)=>a+(t.weeks||0),0)+' vikur';
    case 'projects':return D.projects.length+' verkefni í banka';
    case 'balance':return st._covered+' af '+CRITERIA.length+' hæfniviðmiðum tengd';
  }return '';
}

/* 2. Um kennsluna */
VIEWS.info={render(){
  return intro('Skref 2 · Um kennsluna','Almennar upplýsingar','Lýstu kennslunni: samkennslu greinasviða, þemum, vali nemenda, verkefnum og vinnulagi. Textinn birtist fremst í PDF-skjali námskrárinnar. Kaflana má breyta, færa til, eyða og bæta við.','<button data-act="addSection" class="primary">+ Nýr kafli</button>')+
  `<section class="panel">${mdHint}<div id="sections">${this.sections()}</div></section>`;
},sections(){
  return D.info.length?D.info.map((s,i)=>`<div class="section-edit"><div class="head"><input aria-label="Fyrirsögn kafla ${i+1}" data-path="info.${i}.title" value="${esc(s.title)}" placeholder="Fyrirsögn">
    <button class="small" data-act="secUp" data-i="${i}" ${i?'':'disabled'} aria-label="Færa upp">↑</button><button class="small" data-act="secDown" data-i="${i}" ${i<D.info.length-1?'':'disabled'} aria-label="Færa niður">↓</button><button class="small danger" data-act="secDel" data-i="${i}" aria-label="Eyða kafla">×</button></div>
    <textarea aria-label="Texti kafla ${i+1}" data-path="info.${i}.body">${esc(s.body)}</textarea><div class="markdown md-preview" data-preview="info.${i}.body">${markdown(s.body)}</div></div>`).join(''):'<div class="empty">Engir kaflar. Veldu „Nýr kafli“.</div>';
}};

/* 3. Hæfniflokkar */
VIEWS.cats={render(){
  return intro('Skref 3 · Hæfniflokkar','Hæfniflokkar NASA','Hæfniviðmið aðalnámskrár eru flokkuð í níu hæfniflokka: þrjá í sameiginlegum kjarna og sex sem dýpka sérstök svið. Smelltu á flokk til að sjá hvaða yfirflokkar og hæfniviðmið aðalnámskrár tilheyra honum og til að bæta viðfangsefni við þema.')+
  `<div class="grid2"><div><section class="panel"><h2>Markmið um vægi</h2><div class="wheel" id="catWheel"></div>${legend()}</section>
    <section class="panel"><h2>Hlutföll hæfniflokka</h2><p class="hint">Samtals skulu hlutföll hæfniflokka vera 100%. Vegið yfir hvert þriggja ára tímabil skal vægi þemanna vera sem næst þessum hlutföllum.</p><div id="targets"></div></section></div>
    <section class="panel catinfo" id="catInfo"></section></div>
  <section class="panel"><h2>Tenging við aðalnámskrá</h2><p class="hint">Hver yfirflokkur aðalnámskrár tilheyrir einum hæfniflokki NASA. Í kjarnanum mætast yfirflokkar beggja greinasviða.</p><div id="mapping">${this.mapping()}</div></section>`;
},after(){this.wheel();this.targets();this.info();},
wheel(){$('catWheel').innerHTML=wheelSVG(targetWeights(),{interactive:true,selected:ui.cat,label:'Markmið um vægi'});},
targets(){
  const ts=targetSum(),tn=targetNatt();
  $('targets').innerHTML=`<table class="maptable"><thead><tr><th>Hæfniflokkur</th><th>Svið</th><th class="num">Vægi %</th></tr></thead><tbody>${CATS.map(c=>`<tr><td><span class="swatch" style="background:${catColor(c.id)}"></span>${esc(c.name)}</td><td>${badge(c)}</td><td class="num"><input type="number" min="0" max="100" step="1" data-path="targets.${c.id}" data-type="number" value="${D.targets[c.id]}" aria-label="Vægi ${esc(c.name)}"></td></tr>`).join('')}
  <tr><td colspan="2"><b>Samtals</b></td><td class="num"><span class="sum ${Math.abs(ts-100)<0.01?'good':'bad'}" id="tsum">${fmt(ts)}%</span></td></tr></tbody></table>
  <div id="targetSplit">${this.split(tn)}</div>
  <div class="row" style="margin-top:12px">${field('Markmið: hlutur náttúrugreina (%)','ratio.natt','min="0" max="100"','number')}${field('Hlutur náttúrugreina í kjarna (%)','ratio.coreNatt','min="0" max="100"','number')}</div>
  <p class="hint">Kjarnaflokkarnir eru sameiginlegir. Þegar áhersla í þema er tengd hæfniviðmiðum er hlutur greinasviðanna reiknaður út frá þeim; annars er notað hlutfallið hér að ofan.</p>`;
},
split(tn){const n=Math.round(tn*100),goal=D.ratio.natt;return `<div class="ratio" aria-label="Hlutfall greinasviða í markmiðum"><div style="width:${n}%;background:#177d88">Náttúrugreinar ${n}%</div><div style="width:${100-n}%;background:#b86140">Samfélagsgreinar ${100-n}%</div></div><p class="hint">Markmið aðalnámskrár: um ${goal}% náttúrugreinar og ${100-goal}% samfélagsgreinar.${Math.abs(n-goal)>3?' <span class="notice">Hlutföllin víkja meira en 3 prósentustig frá markmiði.</span>':''}</p>`;},
info(){
  const c=CAT[ui.cat],cov=coverage(D.themes),uses=D.themes.flatMap(t=>t.entries.filter(e=>e.category===c.id).map(e=>({t,e})));
  $('catInfo').innerHTML=`<div class="eyebrow">${esc(GROUPS[c.group].name)}</div><h2><svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true"><g fill="none" stroke="${catColor(c.id)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[c.icon]}</g></svg>${esc(c.name)}</h2>
  <p>${badge(c)} <span class="chip">Markmið ${fmt(D.targets[c.id])}%</span></p><p>${esc(c.desc)}</p>
  <h3 style="margin-top:18px">Bæta viðfangsefni við þema</h3>
  ${D.themes.length?`<div class="row" style="align-items:end"><div class="field" style="margin:0"><label for="addTheme">Þema</label><select id="addTheme">${D.themes.map(t=>`<option value="${t.id}" ${t.id===ui.theme?'selected':''}>${esc(t.title||'Ónefnt þema')}</option>`).join('')}</select></div><button class="primary" data-act="catAdd">+ Bæta við í ${esc(c.name)}</button></div>`:`<div class="empty">Ekkert þema er til. <button class="small" data-act="catAddNew">Stofna þema með áherslu í þessum flokki</button></div>`}
  <h3 style="margin-top:18px">Viðfangsefni skólans í flokknum</h3>
  <textarea data-path="catNotes.${c.id}" aria-label="Viðfangsefni í ${esc(c.name)}" placeholder="T.d. föst viðfangsefni, námsefni eða áherslur sem alltaf eru teknar fyrir í þessum flokki.">${esc(D.catNotes[c.id])}</textarea><div class="markdown md-preview" data-preview="catNotes.${c.id}">${markdown(D.catNotes[c.id])}</div>
  <h3 style="margin-top:18px">Viðfangsefni í þemum (${uses.length})</h3>
  ${uses.length?`<ul class="markdown" style="font-size:13px;padding-left:18px">${uses.slice(0,40).map(u=>`<li><b>${esc(u.t.title||'Ónefnt þema')}:</b> ${inlineMD(u.e.note.split('\n')[0]||'Áhersla án skýringar')}</li>`).join('')}</ul>${uses.length>40?'<p class="hint">…og fleiri.</p>':''}`:'<p class="hint">Engar áherslur í þessum flokki enn.</p>'}
  <h3 style="margin-top:18px">Yfirflokkar og hæfniviðmið aðalnámskrár</h3><p class="hint">Hæfniviðmið við lok 10. bekkjar: „Við lok 10. bekkjar getur nemandi…“. Talan sýnir í hve mörgum þemum viðmiðið er tengt.</p>
  ${areasOf(c.id).map(a=>`<div class="area ${a.subject}"><h4><span>${esc(a.name)}</span><span class="chip ${a.subject}">${SUBJECT[a.subject]}</span></h4><ul>${CRITERIA.filter(x=>x.g===a.id).map(x=>`<li><b>${esc(x.s)}:</b> ${esc(x.t)}. <span class="cov ${cov[x.id].size?'':'zero'}">(${cov[x.id].size} þemu)</span></li>`).join('')}</ul></div>`).join('')}`;
},
mapping(){
  return `<table class="maptable"><thead><tr><th>Hæfniflokkur NASA</th><th>Náttúrugreinar (22. kafli)</th><th>Samfélagsgreinar (24. kafli)</th><th class="num">Hæfniviðmið</th></tr></thead><tbody>${CATS.map(c=>{const as=areasOf(c.id);return `<tr><td><span class="swatch" style="background:${catColor(c.id)}"></span><b>${esc(c.name)}</b>${c.tag?` <span class="badge life">${esc(c.tag)}</span>`:''}</td><td>${as.filter(a=>a.subject==='natt').map(a=>`<span class="chip natt">${esc(a.name)}</span>`).join('')||'–'}</td><td>${as.filter(a=>a.subject==='sam').map(a=>`<span class="chip sam">${esc(a.name)}</span>`).join('')||'–'}</td><td class="num">${CRITERIA.filter(x=>as.some(a=>a.id===x.g)).length}</td></tr>`;}).join('')}</tbody></table>`;
},
update(p){if(p.startsWith('targets.')||p.startsWith('ratio.')){this.wheel();$('tsum').textContent=fmt(targetSum())+'%';$('tsum').className='sum '+(Math.abs(targetSum()-100)<0.01?'good':'bad');$('targetSplit').innerHTML=this.split(targetNatt());}}};

/* 4. Þemu */
function newTheme(extra={}){const t=normTheme({title:'',summary:'',year:cycleYears()[0],period:'',weeks:null,kind:'Þemalota',entries:[],...extra});D.themes.push(t);ui.theme=t.id;changed();return t;}
function filteredThemes(){const q=ui.search.trim().toLowerCase();return D.themes.filter(t=>(!ui.year||(ui.year==='__none'?!t.year:t.year===ui.year))&&(!q||(t.title+' '+t.summary+' '+t.period).toLowerCase().includes(q)));}
VIEWS.themes={render(){
  if(ui.theme&&!themeById(ui.theme))ui.theme=null;
  if(!ui.theme&&D.themes.length)ui.theme=D.themes[0].id;
  return intro('Skref 4 · Þemu','Þemu og áherslur','Hvert þema fær áherslulínur í hæfniflokkum. Ein lína jafngildir einni áherslu og vægi flokks í þemanu er hlutfall lína. Tengdu línur við hæfniviðmið aðalnámskrár til að fylgjast með þekju og hlutfalli greinasviða.','<button class="primary" data-act="newTheme">+ Nýtt þema</button>')+
  `<section class="panel"><div class="filters"><div class="field"><label for="yearFilter">Skólaár</label><select id="yearFilter"><option value="">Öll skólaár</option>${allYears().map(y=>`<option ${ui.year===y?'selected':''}>${esc(y)}</option>`).join('')}<option value="__none" ${ui.year==='__none'?'selected':''}>Óskilgreint skólaár</option></select></div><div class="field" style="flex:1"><label for="themeSearch">Leita</label><input id="themeSearch" type="search" value="${esc(ui.search)}" placeholder="Leita í heitum og skýringum"></div></div><div id="themeList"></div></section>
  <div id="themeEditor"></div>`;
},after(){this.list();this.editor();},
list(){const ts=filteredThemes();$('themeList').innerHTML=ts.length?`<div class="themelist">${ts.map(t=>`<button class="themecard" data-theme="${t.id}" aria-pressed="${t.id===ui.theme}"><strong>${esc(t.title||'Ónefnt þema')}</strong><small>${esc([t.year||'Óskilgreint ár',t.period,t.kind].filter(Boolean).join(' · '))}</small><small>${t.weeks?fmt(t.weeks)+' vikur':'Vikufjölda vantar'} · ${t.entries.length} áherslur</small></button>`).join('')}</div>`:'<div class="empty">Engin þemu passa við síuna. Veldu „Nýtt þema“ til að byrja.</div>';},
editor(){
  const t=themeById(ui.theme);
  if(!t){$('themeEditor').innerHTML='';return;}
  const i=D.themes.indexOf(t),P='themes.'+i,years=allYears();
  $('themeEditor').innerHTML=`<div class="split"><section class="panel"><div class="toolbar" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">Þemaritill</h2><span class="toolbar"><button class="small" data-act="dupTheme">Afrita</button><button class="small danger" data-act="delTheme">Eyða þema</button></span></div>
    <div class="themedl"><span>Sækja þetta þema:</span><button class="primary" data-act="themePdf">PDF</button><button data-act="themeJson">JSON</button></div>
    ${field('Heiti þema',P+'.title','maxlength="150" placeholder="T.d. Hreyfing: Frá Aristótelesi til Newtons"')}
    ${area('Stutt skýring á þemanu',P+'.summary','placeholder="Nemandi kynnist…"')}
    <div class="row"><div class="field"><label for="f-year">Skólaár</label><select id="f-year" data-path="${P}.year"><option value="">Óskilgreint</option>${years.map(y=>`<option ${t.year===y?'selected':''}>${esc(y)}</option>`).join('')}</select></div>
    ${field('Tímabil / lota',P+'.period','maxlength="80" placeholder="T.d. Haust eða Lota 2"')}</div>
    <div class="row">${field('Tímalengd (vikur)',P+'.weeks','min="0" max="52" step="0.5"','number')}<div class="field"><label for="f-kind">Tegund</label><select id="f-kind" data-path="${P}.kind">${KINDS.map(k=>`<option ${t.kind===k?'selected':''}>${k}</option>`).join('')}</select></div></div>
    ${mdHint}
    <div class="stats"><div class="stat"><strong id="stTotal"></strong><span>áherslulínur</span></div><div class="stat"><strong id="stUsed"></strong><span>virkir flokkar</span></div><div class="stat"><strong id="stNatt"></strong><span>náttúrugr. / samfélagsgr.</span></div></div>
    <h2>Hæfniflokkar og áherslur</h2><p class="hint">Veldu flokk fyrir hverja línu. + bætir við línu í sama flokki. Þú getur líka smellt á sneið í myndinni.</p>
    <label class="check" style="font-weight:400"><input type="checkbox" id="allCrit" ${ui.allCrit?'checked':''}> Sýna öll hæfniviðmið (ekki bara þau sem tilheyra flokki línunnar)</label>
    <div id="entries"></div><button class="primary" data-act="addEntry">+ Bæta við áherslu</button></section>
    <section class="panel sticky"><h2>Þemamynd</h2><div class="wheel" id="themeWheel"></div>${legend()}<div id="themeDetails"></div></section></div>`;
  this.entries();this.refresh();
},
entries(){
  const t=themeById(ui.theme),i=D.themes.indexOf(t);
  $('entries').innerHTML=t.entries.length?t.entries.map((e,j)=>{
    const P=`themes.${i}.entries.${j}`,list=ui.allCrit?AREAS:areasOf(e.category);
    return `<div class="entry" data-j="${j}" style="border-left-color:${catColor(e.category)}"><div class="entrynum">ÁHERSLA ${j+1}</div>
    <div class="entryhead"><select data-path="${P}.category" data-rerender="1" aria-label="Hæfniflokkur línu ${j+1}">${catOptions(e.category)}</select><button data-act="dupEntry" title="Ný lína í sama flokki" aria-label="Bæta við línu í sama flokki">+</button><button data-act="delEntry" title="Eyða línu" aria-label="Eyða línu ${j+1}">×</button></div>
    <textarea aria-label="Skýring línu ${j+1}" data-path="${P}.note" placeholder="T.d. Heimildalæsi: nemandi metur ólíkar heimildir.">${esc(e.note)}</textarea><div class="markdown md-preview" data-preview="${P}.note">${markdown(e.note)}</div>
    <div class="linked">${e.criteria.map(id=>`<span class="chip ${AREA[CRIT[id].g].subject}" title="${esc(CRIT[id].t)}">${esc(critLabel(id))}</span>`).join('')}</div>
    <details><summary>Tengja hæfniviðmið (${e.criteria.length})</summary><div class="critlist">${list.map(a=>`<div class="ah">${esc(a.name)} · ${SUBJECT[a.subject]}</div>${CRITERIA.filter(x=>x.g===a.id).map(x=>`<label><input type="checkbox" data-crit="${x.id}" ${e.criteria.includes(x.id)?'checked':''}><span><b>${esc(x.s)}:</b> ${esc(x.t)}</span></label>`).join('')}`).join('')}</div></details></div>`;
  }).join(''):'<div class="empty">Engar áherslur enn. Veldu „Bæta við áherslu“ eða smelltu á sneið í myndinni.</div>';
},
refresh(){
  const t=themeById(ui.theme);if(!t)return;const s=shares(t.entries),n=themeNatt(t);
  $('stTotal').textContent=s.total;$('stUsed').textContent=CATS.filter(c=>s.counts[c.id]).length;$('stNatt').textContent=n==null?'–':Math.round(n*100)+' / '+(100-Math.round(n*100));
  $('themeWheel').innerHTML=wheelSVG(s.weights,{interactive:true,label:t.title||'Þemamynd'});
  $('themeDetails').innerHTML=s.total?CATS.filter(c=>s.counts[c.id]).map(c=>`<div class="detail"><h3><span>${esc(c.name)}</span><span class="chip">${s.counts[c.id]} / ${s.total} · ${pct(s.weights[c.id])}</span></h3><ul>${t.entries.filter(e=>e.category===c.id).map(e=>`<li class="markdown">${markdown(e.note||'Áhersla án skýringar')}</li>`).join('')}</ul></div>`).join(''):'';
},
addEntry(category='work',after){
  const t=themeById(ui.theme);if(!t)return;const at=after==null?t.entries.length:after+1;
  t.entries.splice(at,0,{id:uid(),category,note:'',criteria:[]});changed();this.entries();this.refresh();this.list();
  const el=$('entries').querySelector(`.entry[data-j="${at}"] textarea`);el?.focus();el?.scrollIntoView({block:'center',behavior:'smooth'});
},
update(p,el){
  const t=themeById(ui.theme);
  if(el?.dataset.rerender){this.entries();}
  if(/\.(title|year|period|weeks|kind)$/.test(p)&&p.split('.').length===3)this.list();
  if(t)this.refresh();
}};

/* 5. Verkefni */
VIEWS.projects={render(){
  return intro('Skref 5 · Verkefni','Hækkunar- og rannsóknarverkefni','Hækkunarverkefni eru nemendastýrð verkefni sem nemendur og kennarar koma sér saman um og byggja á hæfniflokkum NASA. Fyrir þau fást 1–3 stig sem nýta má til hækkunar á B-prófi. Rannsóknarverkefni eru stærri verkefni fyrir nemendur sem hafa ítrekað sýnt afbragðshæfni og styðjast við sama matskvarða og A-próf (A, B+, B). Hér má byggja upp banka hugmynda.',
  '<button class="primary" data-act="addProj" data-kind="hækkun">+ Hækkunarverkefni</button><button data-act="addProj" data-kind="rannsókn">+ Rannsóknarverkefni</button>')+
  `<div class="split"><section class="panel"><h2>Dreifing á hæfniflokka</h2><div class="wheel" id="projWheel"></div><p class="hint">Fjöldi verkefna í hverjum hæfniflokki.</p></section><section class="panel" id="projList"></section></div>`;
},after(){this.list();this.wheel();},
wheel(){const s=shares(D.projects);$('projWheel').innerHTML=wheelSVG(s.weights,{label:'Verkefnabanki',sub:Object.fromEntries(CATS.map(c=>[c.id,s.counts[c.id]?s.counts[c.id]+' verkefni':'']))});},
list(){
  const block=(kind,title)=>{const ps=D.projects.map((p,i)=>({p,i})).filter(x=>x.p.kind===kind);return `<h2>${title} (${ps.length})</h2>${ps.length?ps.map(({p,i})=>`<div class="proj" style="border-left:5px solid ${catColor(p.category)}">
    <div class="row"><div class="field" style="flex:3;margin:0"><label for="pt${i}">Heiti</label><input id="pt${i}" data-path="projects.${i}.title" value="${esc(p.title)}" maxlength="200"></div>
    <div class="field" style="margin:0"><label for="pc${i}">Hæfniflokkur</label><select id="pc${i}" data-path="projects.${i}.category">${catOptions(p.category)}</select></div>
    ${kind==='hækkun'?`<div class="field" style="margin:0;min-width:90px;flex:0"><label for="pp${i}">Stig</label><select id="pp${i}" data-path="projects.${i}.points" data-type="number">${[1,2,3].map(n=>`<option ${p.points===n?'selected':''}>${n}</option>`).join('')}</select></div>`:''}</div>
    <div class="row"><div class="field" style="margin:0"><label for="pth${i}">Tengt þema (valfrjálst)</label><select id="pth${i}" data-path="projects.${i}.theme"><option value="">Ekkert sérstakt þema</option>${D.themes.map(t=>`<option value="${t.id}" ${p.theme===t.id?'selected':''}>${esc(t.title||'Ónefnt þema')}</option>`).join('')}</select></div></div>
    <div class="field" style="margin:0"><label for="pd${i}">Lýsing og viðmið</label><textarea id="pd${i}" data-path="projects.${i}.description" style="min-height:60px">${esc(p.description)}</textarea></div>
    ${kind==='rannsókn'?'<p class="hint" style="margin:0">Metið á kvarða A-prófa: A, B+ eða B.</p>':''}<div><button class="small danger" data-act="delProj" data-i="${i}">Eyða verkefni</button></div></div>`).join(''):'<div class="empty">Engin verkefni enn.</div>'}`;};
  $('projList').innerHTML=block('hækkun','Hækkunarverkefni')+'<div style="height:18px"></div>'+block('rannsókn','Rannsóknarverkefni');
},
update(p){if(/\.category$/.test(p)){this.wheel();this.list();}}};

/* 6. Námsmat */
function bandFor(score){return [...D.assessment.bBands].sort((a,b)=>b.min-a.min).find(b=>score>=b.min)||D.assessment.bBands.at(-1);}
function calc(){
  const A=D.assessment,c=ui.calc,raw=Math.max(0,Math.min(100,+c.b||0)),h=+A.handicap[c.grade]||0,pts=Math.max(0,+c.pts||0),used=A.maxPoints>0?Math.min(pts,A.maxPoints):pts;
  const score=Math.min(100,raw+h+used*A.pointValue),band=bandFor(score),eligible=band.grade==='B';
  let final=band.grade,why=`B-próf: ${fmt(raw)}% + forgjöf ${fmt(h)} + hækkunarstig ${used}×${fmt(A.pointValue)} = ${fmt(score)}% → ${band.grade} (${band.label}).`;
  if(eligible){
    if(c.a===''||c.a==null)why+=' Nemandinn á rétt á A-prófi.';
    else{const a=+c.a;if(a>=A.aA){final='A';why+=` A-próf: ${a} af ${A.aMax} stigum → A.`;}else if(a>=A.aBplus){final='B+';why+=` A-próf: ${a} af ${A.aMax} stigum → B+.`;}else why+=` A-próf: ${a} af ${A.aMax} stigum hækkar ekki einkunn; hún helst B.`;}
  }
  return {final,why,eligible};
}
const LETTERS=['A','B+','B','C+','C','D'];
const sortedScale=()=>[...D.assessment.scale].sort((a,b)=>b.min-a.min);
function scaleRange(i,sc=sortedScale()){
  const s=sc[i],up=sc[i-1];
  if(!up)return fmt(s.min,3)+' eða hærra';
  if(!s.min)return 'undir '+fmt(sc[i-1].min,3);
  return fmt(s.min,3)+' til undir '+fmt(up.min,3);
}
function finalGrade(rows){
  const A=D.assessment;let sw=0,s=0;
  rows.forEach(r=>{const w=+r.weight||0;if(w>0&&r.grade in A.gradeValues){sw+=w;s+=w*A.gradeValues[r.grade];}});
  if(!sw)return null;
  const avg=Math.round(s/sw*10000)/10000,sc=sortedScale().find(x=>avg>=x.min)||D.assessment.scale.at(-1);
  return {avg,grade:sc.grade,weight:sw};
}
function finalRows(){
  if(!ui.final){const ts=D.themes.filter(t=>t.weeks).slice(0,4),gs=['A','B','B+','C+'];
    ui.final=ts.length?ts.map((t,i)=>({theme:t.id,weight:t.weeks,grade:gs[i%4]})):[{theme:'',weight:4,grade:'B'},{theme:'',weight:6,grade:'A'},{theme:'',weight:3,grade:'C+'}];}
  return ui.final;
}
VIEWS.assess={render(){
  const A=D.assessment,bands=A.bBands;
  return intro('Skref 6 · Námsmat','Námsmat í þemum','Notaðir eru hæfniflokkar með bein tengsl við lokaeinkunn. Hvert þema endar á B-prófi; nemandi sem nær B öðlast rétt til töku A-prófs. Hækkunarstig úr hækkunarverkefnum má nýta til að hækka einkunn á B-prófi.')+
  `<section class="panel"><h2>Leiðin að einkunn</h2><div class="flow"><div class="step"><b>Þemalota</b>Fyrirlestrar, glósur, verkefni og hæfniflokkar þemans.</div><div class="arrow">→</div><div class="step"><b>Hækkunarverkefni</b>1–3 stig fyrir hvert verkefni. Stigin safnast saman.</div><div class="arrow">→</div><div class="step"><b>B-próf</b>Hæfni sambærileg við 1. hæfniþrep framhaldsskóla. D, C, C+ eða B.</div><div class="arrow">→</div><div class="step"><b>A-próf / rannsóknarverkefni</b>Fyrir þá sem ná B. Metið A, B+ eða B. ${A.aMax} stig, án hjálpargagna. Getur aðeins hækkað.</div><div class="arrow">→</div><div class="step"><b>Lokaeinkunn</b>Vegið meðaltal þemaeinkunna í lok 10. bekkjar, varpað á kvarðann 4–10.</div></div></section>
  <div class="grid2"><section class="panel"><h2>B-próf</h2>${area('Lýsing',"assessment.bIntro",'style="min-height:70px"')}
    <div class="scale">${bands.map((b,i)=>`<div class="grade"><b>${b.grade}</b><input aria-label="Lýsing ${b.grade}" data-path="assessment.bBands.${i}.label" value="${esc(b.label)}">${b.grade==='D'?'<small style="margin-top:8px">Undir mörkum C</small>':`<label style="margin-top:6px;font-size:11px" for="band${i}">Lágmark (%)</label><input id="band${i}" type="number" min="0" max="100" data-type="number" data-path="assessment.bBands.${i}.min" value="${b.min}">`}</div>`).join('')}</div>
    <p class="hint">B = hefur náð hæfninni (að jafnaði 80% árangur eða meira). Mörk C+ og C eru tillögur sem má aðlaga.</p>
    <h3>Forgjöf eftir árgangi</h3><p class="hint">Kennslan og námsmatið er aldursblandað. Nemendur í 8. og 9. bekk fá minnkandi forgjöf sem hverfur í 10. bekk. Forgjöfin bætist við árangur á B-prófi (prósentustig).</p>
    <div class="row">${['8','9','10'].map(g=>field(g+'. bekkur','assessment.handicap.'+g,'min="0" max="100" step="0.5"','number')).join('')}</div>
    <h3>Hækkunarstig</h3><div class="row">${field('Prósentustig fyrir hvert hækkunarstig','assessment.pointValue','min="0" max="100" step="0.5"','number')}${field('Hámark stiga á hvert B-próf (0 = ekkert)','assessment.maxPoints','min="0" max="99" step="1"','number')}</div></section>
  <section class="panel"><h2>A-próf og rannsóknarverkefni</h2>${area('Lýsing','assessment.aIntro','style="min-height:70px"')}
    <div class="scale" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px"><div class="grade"><b>A</b><small>Framúrskarandi hæfni</small></div><div class="grade"><b>B+</b><small>Umfram hæfniviðmið</small></div><div class="grade"><b>B</b><small>Hefur náð hæfninni</small></div></div>
    <div class="row">${field('Heildarstig','assessment.aMax','min="1" step="1"','number')}${field('A frá (stig)','assessment.aA','min="0" step="1"','number')}${field('B+ frá (stig)','assessment.aBplus','min="0" step="1"','number')}</div>
    <p class="hint" id="aRule"></p>
    ${area('Rannsóknarverkefni','assessment.research','style="min-height:60px"')}
    ${area('Annað um námsmat','assessment.notes','placeholder="T.d. endurtekning prófa, sérúrræði, skráning í Mentor."')}
    <h2 style="margin-top:20px">Reiknivél</h2><p class="hint">Prófaðu reglurnar á dæmi um nemanda.</p>
    <div class="row"><div class="field"><label for="cG">Árgangur</label><select id="cG" data-calc="grade">${['8','9','10'].map(g=>`<option value="${g}" ${ui.calc.grade===g?'selected':''}>${g}. bekkur</option>`).join('')}</select></div>
    <div class="field"><label for="cB">B-próf (%)</label><input id="cB" type="number" min="0" max="100" data-calc="b" value="${esc(ui.calc.b)}"></div>
    <div class="field"><label for="cP">Hækkunarstig</label><input id="cP" type="number" min="0" max="30" data-calc="pts" value="${esc(ui.calc.pts)}"></div>
    <div class="field"><label for="cA">A-próf (stig)</label><input id="cA" type="number" min="0" data-calc="a" value="${esc(ui.calc.a)}" placeholder="Ekki tekið"></div></div>
    <div class="result" id="calcOut"></div></section></div>
  <section class="panel"><h2>Lokaeinkunn úr 10. bekk</h2><div class="grid2"><div>
    ${area('Lýsing','assessment.finalIntro','style="min-height:80px"')}
    <h3>Gildi bókstafseinkunna</h3><div class="row">${LETTERS.map(g=>field(g,'assessment.gradeValues.'+g,'min="0" max="10" step="0.05" style="text-align:right"','number')).join('')}</div>
    <h3>Vörpun yfir á talnakvarða</h3><table class="maptable"><thead><tr><th>Vegið meðaltal</th><th class="num">Lágmark</th><th class="num">Einkunn</th></tr></thead><tbody id="scaleRows">${this.scaleRows()}</tbody></table>
    <h3 style="margin-top:16px">Stuðningsúrræði</h3>${area('Mat á stuðningsúrræðum og sérmerking einkunna','assessment.support','style="min-height:90px"')}
  </div><div>
    <h3>Reiknivél fyrir lokaeinkunn</h3><p class="hint">Veldu þemu og einkunn nemandans í hverju þeirra. Vægi er sjálfgefið vikufjöldi þemans en má breyta.</p>
    <div id="finalRows"></div><button class="small" data-act="finalAdd">+ Bæta við þema</button>
    <div class="result" id="finalOut" style="margin-top:14px"></div>
  </div></div></section>`;
},after(){this.out();this.finalRows();},
scaleRows(){const sc=sortedScale();return sc.map((s,i)=>{const k=D.assessment.scale.indexOf(s);return `<tr><td>${esc(scaleRange(i,sc))}</td><td class="num">${s.min?`<input type="number" min="0" max="10" step="0.005" data-type="number" data-path="assessment.scale.${k}.min" value="${s.min}" aria-label="Lágmark fyrir ${s.grade}">`:'–'}</td><td class="num"><b>${s.grade}</b></td></tr>`;}).join('');},
finalRows(){
  const rows=finalRows();
  $('finalRows').innerHTML=rows.map((r,i)=>`<div class="row" style="align-items:end;margin-bottom:8px"><div class="field" style="flex:3;margin:0"><label for="fr${i}">Þema</label><select id="fr${i}" data-final="${i}.theme"><option value="">Annað / óskráð þema</option>${D.themes.map(t=>`<option value="${t.id}" ${r.theme===t.id?'selected':''}>${esc(t.title||'Ónefnt þema')}</option>`).join('')}</select></div>
  <div class="field" style="margin:0;min-width:80px;flex:1"><label for="fw${i}">Vægi</label><input id="fw${i}" type="number" min="0" step="0.5" data-final="${i}.weight" value="${esc(r.weight)}"></div>
  <div class="field" style="margin:0;min-width:80px;flex:1"><label for="fg${i}">Einkunn</label><select id="fg${i}" data-final="${i}.grade">${LETTERS.map(g=>`<option ${r.grade===g?'selected':''}>${g}</option>`).join('')}</select></div>
  <button class="small danger" data-act="finalDel" data-i="${i}" aria-label="Fjarlægja línu">×</button></div>`).join('')||'<div class="empty">Engin þemu í útreikningi.</div>';
  this.finalOut();
},
finalOut(){
  const rows=finalRows(),r=finalGrade(rows),A=D.assessment;
  $('finalOut').innerHTML=r?`<b>${r.grade}</b><p>Vegið meðaltal ${fmt(r.avg,3)} (${rows.filter(x=>+x.weight>0).map(x=>x.grade+' = '+fmt(A.gradeValues[x.grade],2)+' × '+fmt(+x.weight)).join(', ')}; samanlagt vægi ${fmt(r.weight)}).</p>`:'<b>–</b><p>Skráðu a.m.k. eitt þema með vægi.</p>';
},
out(){const r=calc(),A=D.assessment;$('calcOut').innerHTML=`<b>${esc(r.final)}</b><p>${esc(r.why)}</p>`;$('aRule').textContent=`${A.aA}–${A.aMax} stig gefa A. ${A.aBplus}–${A.aA-1} stig gefa B+. ${A.aBplus-1} stig eða færri hækka ekki einkunn. Ekki er hægt að lækka í einkunn við töku A-prófs.`;},
update(p){this.out();this.finalOut();if(/^assessment\.scale\./.test(p))$('scaleRows').querySelectorAll('tr').forEach((tr,i)=>tr.firstElementChild.textContent=scaleRange(i));}};

/* 7. Jafnvægi */
VIEWS.balance={render(){
  const ys=allYears();if(!ui.balYears)ui.balYears=new Set([...cycleYears(),'']);
  return intro('Skref 7 · Jafnvægi','Jafnvægi yfir þriggja ára tímabil','Vægi hvers þema er vegið með vikufjölda þess. Hér sérðu hvernig valin skólaár standast markmið um hlutföll hæfniflokka og greinasviða og hvaða hæfniviðmið aðalnámskrár hafa ekki enn verið tengd þema.')+
  `<section class="panel"><h2>Skólaár í útreikningi</h2><div class="toolbar">${ys.map(y=>`<label class="check" style="font-weight:400;margin-right:12px"><input type="checkbox" data-year="${esc(y)}" ${ui.balYears.has(y)?'checked':''}> ${esc(y)}${cycleYears().includes(y)?'':' (utan tímabils)'}</label>`).join('')}<label class="check" style="font-weight:400"><input type="checkbox" data-year="" ${ui.balYears.has('')?'checked':''}> Óskilgreint skólaár</label></div><div id="balInfo" class="hint"></div></section>
  <div class="grid2"><section class="panel"><h2>Tímavegið vægi</h2><div class="wheel" id="balWheel"></div>${legend()}</section><section class="panel"><h2>Markmið og raun</h2><div id="balTable"></div></section></div>
  <section class="panel"><h2>Skólaár og þemu</h2><div id="balYears"></div></section>
  <section class="panel"><div class="toolbar" style="justify-content:space-between"><h2 style="margin:0">Þekja hæfniviðmiða</h2><label class="check" style="font-weight:400"><input type="checkbox" id="uncov" ${ui.uncoveredOnly?'checked':''}> Sýna aðeins ótengd hæfniviðmið</label></div><div id="balCov"></div></section>`;
},
sel(){return D.themes.filter(t=>ui.balYears.has(t.year||''));},
after(){
  const list=this.sel(),a=aggregate(list),tw=targetWeights(),cov=coverage(list);
  $('balInfo').textContent=`${list.length} þemu valin · ${a.included.length} í útreikningi · ${fmt(a.weeks)} vikur.`+(a.excluded.length?' Ekki talið með (vantar vikur eða áherslur): '+a.excluded.map(t=>t.title||'Ónefnt þema').join('; ')+'.':'');
  $('balWheel').innerHTML=wheelSVG(a.weights,{label:'Tímavegið vægi',sub:Object.fromEntries(CATS.map(c=>[c.id,'markmið '+pct(tw[c.id])]))});
  const n=a.natt==null?null:Math.round(a.natt*100);
  $('balTable').innerHTML=`<table class="maptable"><thead><tr><th>Hæfniflokkur</th><th class="num">Markmið</th><th class="num">Raun</th><th class="num">Frávik</th><th></th></tr></thead><tbody>${CATS.map(c=>{const d=(a.weights[c.id]-tw[c.id])*100;return `<tr><td><span class="swatch" style="background:${catColor(c.id)}"></span>${esc(c.name)}</td><td class="num">${pct(tw[c.id])}</td><td class="num">${a.weeks?pct(a.weights[c.id]):'–'}</td><td class="num" style="color:${Math.abs(d)>3?'#a3402a':'inherit'}">${a.weeks?(d>0?'+':'')+fmt(d):'–'}</td><td><div class="bar" aria-hidden="true"><span style="width:${Math.min(100,a.weights[c.id]*250)}%;background:${catColor(c.id)}"></span><em style="left:${Math.min(100,tw[c.id]*250)}%"></em></div></td></tr>`;}).join('')}</tbody></table>
  <p class="hint">Strikið á súlunni sýnir markmið. Frávik yfir 3 prósentustig eru rauðmerkt.</p>
  <h3>Greinasvið</h3>${n==null?'<p class="hint">Engin þemu með vikufjölda og áherslum.</p>':`<div class="ratio"><div style="width:${n}%;background:#177d88">Náttúrugreinar ${n}%</div><div style="width:${100-n}%;background:#b86140">Samfélagsgreinar ${100-n}%</div></div><p class="hint">Markmið: ${D.ratio.natt}% / ${100-D.ratio.natt}%.${Math.abs(n-D.ratio.natt)>3?' <span class="notice">Víkur meira en 3 prósentustig frá markmiði.</span>':''}</p>`}`;
  const yrs=[...new Set(list.map(t=>t.year||''))].sort();
  $('balYears').innerHTML=list.length?`<table class="maptable"><thead><tr><th>Skólaár</th><th>Þemu</th><th class="num">Vikur</th><th class="num">Náttúrugr.</th></tr></thead><tbody>${yrs.map(y=>{const ts=list.filter(t=>(t.year||'')===y),ag=aggregate(ts);return `<tr><td>${esc(y||'Óskilgreint')}</td><td>${ts.map(t=>`<span class="chip">${esc(t.title||'Ónefnt þema')}${t.weeks?' · '+fmt(t.weeks)+' v.':''}</span>`).join('')}</td><td class="num">${fmt(ag.weeks)}</td><td class="num">${ag.natt==null?'–':Math.round(ag.natt*100)+'%'}</td></tr>`;}).join('')}</tbody></table>`:'<div class="empty">Engin þemu á völdum skólaárum.</div>';
  const covered=CRITERIA.filter(c=>cov[c.id].size).length;
  $('balCov').innerHTML=`<p class="hint">${covered} af ${CRITERIA.length} hæfniviðmiðum (${pct(covered/CRITERIA.length)}) eru tengd a.m.k. einu þema á völdum skólaárum.</p>`+CATS.map(c=>{const crits=CRITERIA.filter(x=>AREA[x.g].nasa===c.id&&(!ui.uncoveredOnly||!cov[x.id].size));if(!crits.length)return '';const k=CRITERIA.filter(x=>AREA[x.g].nasa===c.id),kc=k.filter(x=>cov[x.id].size).length;
    return `<div class="area ${c.group==='natt'?'natt':c.group==='sam'?'sam':''}" style="border-color:${catColor(c.id)}"><h4><span>${esc(c.name)}</span><span class="cov">${kc} / ${k.length} tengd</span></h4><ul>${crits.map(x=>`<li><b>${esc(AREA[x.g].name)} · ${esc(x.s)}</b> <span class="cov ${cov[x.id].size?'':'zero'}">${cov[x.id].size?esc([...cov[x.id]].join(', ')):'Ekki tengt'}</span></li>`).join('')}</ul></div>`;}).join('');
}};

/* 8. Útgáfa */
VIEWS.export={render(){
  const st=stepStatus(),a=st._agg,tn=a.natt,checks=[
    [D.meta.title.trim(),'Námskráin hefur heiti.'],
    [D.info.length&&D.info.every(s=>s.title.trim()&&s.body.trim()),'Allir kaflar um kennsluna hafa fyrirsögn og texta.'],
    [Math.abs(st._ts-100)<0.01,`Hlutföll hæfniflokka eru samtals 100% (nú ${fmt(st._ts)}%).`],
    [D.themes.length,`Þemu eru skráð (${D.themes.length}).`],
    [D.themes.length&&D.themes.every(t=>t.weeks),'Öll þemu hafa vikufjölda.'],
    [D.themes.length&&D.themes.every(t=>t.entries.length),'Öll þemu hafa áherslulínur.'],
    [tn!=null&&Math.abs(tn*100-D.ratio.natt)<=3,`Hlutfall greinasviða er innan 3 prósentustiga frá markmiði${tn!=null?' (nú '+Math.round(tn*100)+'% náttúrugreinar)':''}.`],
    [st._covered===CRITERIA.length,`Öll hæfniviðmið eru tengd þema (${st._covered} af ${CRITERIA.length}).`],
    [D.projects.some(p=>p.kind==='hækkun'),'Dæmi um hækkunarverkefni eru í verkefnabanka.']
  ];
  return intro('Skref 8 · Útgáfa','Gefa út námskrána','Sæktu námskrána sem PDF-skjal til birtingar eða sem JSON-skrá sem hægt er að opna aftur hér á vefnum til að halda áfram eða byggja næstu útgáfu á.')+
  `<div class="grid2"><section class="panel"><h2>Gátlisti</h2>${checks.map(([ok,t])=>`<div class="check"><span class="dot ${ok?'ok':'no'}">${ok?'✓':'!'}</span>${esc(t)}</div>`).join('')}<p class="hint">Gátlistinn er leiðbeinandi. Hægt er að gefa út PDF þótt eitthvað vanti.</p></section>
  <section class="panel"><h2>PDF-skjal</h2><p class="hint">Skjalið inniheldur forsíðu, almennar upplýsingar, hæfniflokka, námsmat og verkefnabanka. Veldu hvað fleira á að fylgja.</p>
    <label class="check" style="font-weight:400"><input type="checkbox" id="pdfThemes" checked> Þemu með þemamyndum og áherslum</label>
    <label class="check" style="font-weight:400"><input type="checkbox" id="pdfBalance" checked> Jafnvægi yfir tímabilið</label>
    <label class="check" style="font-weight:400"><input type="checkbox" id="pdfCrit" checked> Viðauki: hæfniviðmið aðalnámskrár eftir hæfniflokkum</label>
    <div class="toolbar" style="margin-top:12px"><button class="primary" data-act="pdf" id="pdfBtn">Sækja PDF</button><button data-act="print">Prenta</button></div>
    <h2 style="margin-top:24px">JSON-skrá</h2><p class="hint">JSON-skráin geymir alla námskrána. Opnaðu hana síðar með „Opna skrá“ til að byrja með grunn sem þegar hefur verið saminn.</p>
    <div class="toolbar"><button class="primary" data-act="save">Sækja JSON</button><button data-act="open">Opna JSON</button><button data-act="saveThemes">Sækja aðeins þemu</button></div></section></div>`;
}};

/* ---------- atburðir ---------- */
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset.path){
    let v=el.type==='checkbox'?el.checked:el.value;
    if(el.dataset.type==='number')v=v===''?null:Number(v);
    if(/^themes\.\d+\.weeks$/.test(el.dataset.path)&&v!=null)v=Math.max(0,Math.min(52,v))||null;
    if(el.dataset.path.startsWith('targets.'))v=v==null?0:Math.max(0,Math.min(100,v));
    setPath(D,el.dataset.path,v);changed();
    const pv=document.querySelector(`[data-preview="${CSS.escape(el.dataset.path)}"]`);if(pv)pv.innerHTML=markdown(v);
    VIEWS[ui.step].update?.(el.dataset.path,el);return;
  }
  if(el.dataset.final){const [i,k]=el.dataset.final.split('.'),r=finalRows()[+i];r[k]=el.value;
    if(k==='theme'){const t=themeById(el.value);if(t?.weeks)r.weight=t.weeks;VIEWS.assess.finalRows();}else VIEWS.assess.finalOut();return;}
  if(el.dataset.calc){ui.calc[el.dataset.calc]=el.value;VIEWS.assess.out();return;}
  if(el.id==='themeSearch'){ui.search=el.value;VIEWS.themes.list();}
});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.crit){
    const j=+el.closest('.entry').dataset.j,t=themeById(ui.theme),en=t.entries[j];
    en.criteria=el.checked?[...new Set([...en.criteria,el.dataset.crit])]:en.criteria.filter(x=>x!==el.dataset.crit);changed();
    const box=el.closest('.entry');box.querySelector('.linked').innerHTML=en.criteria.map(id=>`<span class="chip ${AREA[CRIT[id].g].subject}" title="${esc(CRIT[id].t)}">${esc(critLabel(id))}</span>`).join('');
    box.querySelector('summary').textContent=`Tengja hæfniviðmið (${en.criteria.length})`;VIEWS.themes.refresh();return;
  }
  if(el.id==='yearFilter'){ui.year=el.value;VIEWS.themes.list();return;}
  if(el.id==='allCrit'){ui.allCrit=el.checked;VIEWS.themes.entries();return;}
  if(el.dataset.year!==undefined&&ui.step==='balance'){el.checked?ui.balYears.add(el.dataset.year):ui.balYears.delete(el.dataset.year);VIEWS.balance.after();return;}
  if(el.id==='uncov'){ui.uncoveredOnly=el.checked;VIEWS.balance.after();return;}
  if(el.id==='fileInput')openFiles([...el.files]).finally(()=>el.value='');
});
document.addEventListener('click',e=>{
  const step=e.target.closest('[data-step]');if(step){go(step.dataset.step);return;}
  const card=e.target.closest('[data-theme]');if(card){ui.theme=card.dataset.theme;VIEWS.themes.list();VIEWS.themes.editor();return;}
  const sector=e.target.closest('[data-category]');if(sector){sectorClick(sector.dataset.category);return;}
  const b=e.target.closest('[data-act]');if(!b)return;act(b.dataset.act,b);
});
document.addEventListener('keydown',e=>{const s=e.target.closest?.('[data-category]');if(s&&(e.key==='Enter'||e.key===' ')){e.preventDefault();sectorClick(s.dataset.category);}});
function sectorClick(cat){
  if(ui.step==='themes'){VIEWS.themes.addEntry(cat);return;}
  if(ui.step==='cats'){ui.cat=cat;VIEWS.cats.wheel();VIEWS.cats.info();document.querySelector(`#catWheel [data-category="${cat}"]`)?.focus();if(innerWidth<760)$('catInfo').scrollIntoView({behavior:'smooth'});}
}
function act(a,b){
  const T=VIEWS.themes;
  switch(a){
    case 'open':$('fileInput').click();break;
    case 'save':saveJSON();break;
    case 'saveThemes':download(new Blob([JSON.stringify({format:'nasa-skolanamskra',version:2,meta:D.meta,themes:D.themes},null,2)],{type:'application/json'}),fileBase()+'-themu.json');break;
    case 'pdf':exportPDF();break;
    case 'print':printDoc();break;
    case 'demo':{const ys=cycleYears();demoThemes().forEach((t,i)=>D.themes.push(normTheme({...t,year:ys[0]})));D.projects.push(...demoProjects().map(normProject));changed();toast('Sýnidæmum bætt við: 2 þemu og 3 verkefni.');render();break;}
    case 'reset':if(confirm('Hreinsa alla vinnu í vafranum og byrja á nýrri námskrá? Sæktu JSON fyrst ef þú vilt halda vinnunni.')){D=fresh();ui.theme=null;ui.balYears=null;ui.final=null;changed();persist();render();toast('Ný námskrá stofnuð.');}break;
    case 'addSection':D.info.push({title:'Nýr kafli',body:''});changed();$('sections').innerHTML=VIEWS.info.sections();$('sections').lastElementChild.querySelector('input')?.select();break;
    case 'secUp':case 'secDown':{const i=+b.dataset.i,j=a==='secUp'?i-1:i+1;[D.info[i],D.info[j]]=[D.info[j],D.info[i]];changed();$('sections').innerHTML=VIEWS.info.sections();break;}
    case 'secDel':if(confirm('Eyða kaflanum „'+(D.info[+b.dataset.i].title||'')+'“?')){D.info.splice(+b.dataset.i,1);changed();$('sections').innerHTML=VIEWS.info.sections();}break;
    case 'newTheme':newTheme();ui.year='';ui.search='';render();$('f-themes.'+(D.themes.length-1)+'.title')?.focus();break;
    case 'themePdf':exportThemePDF(themeById(ui.theme),b);break;
    case 'themeJson':{const t=themeById(ui.theme);download(new Blob([JSON.stringify({format:'nasa-thema',version:2,...t,projects:D.projects.filter(p=>p.theme===t.id).map(({id,theme,...p})=>p)},null,2)],{type:'application/json'}),themeFileBase(t)+'.json');toast('JSON fyrir þemað sótt.');break;}
    case 'dupTheme':{const t=themeById(ui.theme),c=normTheme({...clone(t),id:uid(),title:(t.title||'Þema')+' (afrit)'});D.themes.splice(D.themes.indexOf(t)+1,0,c);ui.theme=c.id;changed();render();toast('Þema afritað.');break;}
    case 'delTheme':{const t=themeById(ui.theme);if(confirm('Eyða þemanu „'+(t.title||'Ónefnt þema')+'“?')){D.themes.splice(D.themes.indexOf(t),1);D.projects.forEach(p=>{if(p.theme===t.id)p.theme='';});ui.theme=null;changed();render();}break;}
    case 'addEntry':T.addEntry();break;
    case 'dupEntry':{const j=+b.closest('.entry').dataset.j;T.addEntry(themeById(ui.theme).entries[j].category,j);break;}
    case 'delEntry':{const j=+b.closest('.entry').dataset.j;themeById(ui.theme).entries.splice(j,1);changed();T.entries();T.refresh();T.list();break;}
    case 'catAdd':ui.theme=$('addTheme').value;go('themes');VIEWS.themes.addEntry(ui.cat);break;
    case 'catAddNew':newTheme({entries:[]});go('themes');VIEWS.themes.addEntry(ui.cat);break;
    case 'addProj':D.projects.push(normProject({kind:b.dataset.kind,category:'work',points:1}));changed();VIEWS.projects.list();VIEWS.projects.wheel();$('pt'+(D.projects.length-1))?.focus();break;
    case 'finalAdd':finalRows().push({theme:'',weight:1,grade:'B'});VIEWS.assess.finalRows();break;
    case 'finalDel':finalRows().splice(+b.dataset.i,1);VIEWS.assess.finalRows();break;
    case 'delProj':D.projects.splice(+b.dataset.i,1);changed();VIEWS.projects.list();VIEWS.projects.wheel();break;
  }
}
function saveJSON(){download(new Blob([JSON.stringify(D,null,2)],{type:'application/json'}),fileBase()+'.json');toast('JSON-skrá sótt.');}
async function openFiles(files){
  if(!files.length)return;
  try{
    let added=0;
    for(const f of files){
      if(f.size>20e6)throw Error('Skráin „'+f.name+'“ er of stór.');
      let o;try{o=JSON.parse(await f.text());}catch{throw Error('Skráin „'+f.name+'“ er ekki gild JSON-skrá.');}
      if(o?.format==='nasa-skolanamskra'&&o.info){
        const next=normalize(o);
        if(!confirm('Opna námskrána „'+(next.meta.title||f.name)+'“ og skipta út núverandi vinnu?'))continue;
        D=next;ui.theme=null;ui.balYears=null;ui.final=null;changed();persist();toast('Námskrá opnuð: '+(D.meta.title||f.name));
      }else{
        const list=o?.format==='nasa-skolanamskra'?o.themes:o?.libraryVersion===1?o.themes:[o];
        if(!Array.isArray(list)||!list.length||!list.every(t=>t&&typeof t.title==='string'&&Array.isArray(t.entries)))throw Error('Skráin „'+f.name+'“ inniheldur hvorki námskrá né þemu.');
        list.forEach(t=>{const n=normTheme({...t,id:uid()});D.themes.push(n);ui.theme=n.id;added++;
          if(Array.isArray(t.projects))D.projects.push(...t.projects.slice(0,200).map(p=>({...normProject(p),theme:n.id})));});changed();
      }
    }
    if(added)toast(added+(added===1?' þema flutt':' þemu flutt')+' inn í námskrána.');
    render();renderStepper();
  }catch(err){toast(err.message||'Ekki tókst að opna skrána.');}
}
$('openFile').onclick=()=>$('fileInput').click();
$('saveFile').onclick=saveJSON;
$('pdfTop').onclick=()=>exportPDF();
window.addEventListener('hashchange',()=>{const s=location.hash.slice(1);if(s!==ui.step&&VIEWS[s])go(s);});
document.addEventListener('dragover',e=>e.preventDefault());
document.addEventListener('drop',e=>{e.preventDefault();const fs=[...(e.dataTransfer?.files||[])].filter(f=>/json$/i.test(f.name)||f.type.includes('json'));if(fs.length)openFiles(fs);});

load();
go(location.hash.slice(1)||'start',false);
if(D.meta.updated)$('saveState').textContent='Vinna úr vafranum opnuð. Síðast breytt '+new Date(D.meta.updated).toLocaleString('is-IS')+'.';

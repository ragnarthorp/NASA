'use strict';
/* Vaktaplan · reiknivél: dagsetningar, íslenskir frídagar, vinnuskylda, flokkun vinnustunda,
   sjálfvirk vaktaröðun og yfirferð. Hrein föll án DOM svo hægt sé að prófa þau í Node. */
(function(root){
const DAY=86400000;
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d));};
const addDays=(s,n)=>iso(new Date(parse(s).getTime()+n*DAY));
const dow=s=>(parse(s).getUTCDay()+6)%7;            // 0 = mánudagur … 6 = sunnudagur
const diffDays=(a,b)=>Math.round((parse(b)-parse(a))/DAY);
const toMin=t=>{if(t==null||t==='')return null;const [h,m]=String(t).split(':').map(Number);return (h||0)*60+(m||0);};
const fmtTime=m=>{m=((m%1440)+1440)%1440;return pad(Math.floor(m/60))+':'+pad(m%60);};
const round2=x=>Math.round(x*100)/100;
/* Íslenskt talnasnið óháð stillingum vafrans: 1.272,5 */
function fmtNum(n,d=1){n=+n||0;let [i,f]=Math.abs(n).toFixed(d).split('.');f=(f||'').replace(/0+$/,'');
  i=i.replace(/\B(?=(\d{3})+(?!\d))/g,'.');const neg=n<0&&(+i.replace(/\./g,'')>0||f);return (neg?'−':'')+i+(f?','+f:'');}
const todayLabel=()=>{const d=new Date();return d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();};

const MONTHS=['janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'];
const DAYS=['mánudagur','þriðjudagur','miðvikudagur','fimmtudagur','föstudagur','laugardagur','sunnudagur'];
const DAYS_PL=['mánudögum','þriðjudögum','miðvikudögum','fimmtudögum','föstudögum','laugardögum','sunnudögum'];
const DAYS_SHORT=['mán','þri','mið','fim','fös','lau','sun'];
const DAYS_1=['M','Þ','M','F','F','L','S'];
const CATS=['day','evening','night','weekend','red','major'];
const CAT_NAMES={day:'Dagvinna',evening:'Kvöld',night:'Nótt',weekend:'Helgar',red:'Rauðir dagar',major:'Stórhátíðir'};
/* Flokkar vakta sem starfsfólk velur sér (óskir) */
const PREF_CATS=[['morning','Morgunvaktir'],['evening','Kvöldvaktir'],['weekendMorning','Morgunvaktir um helgar'],['weekendMid','Millivaktir um helgar'],['weekendEvening','Kvöldvaktir um helgar'],['night','Næturvaktir']];
const PREF_NAME=Object.fromEntries(PREF_CATS);
const STATUS_NAMES={active:'Í starfi',hourly:'Tímavinna',leave:'Í leyfi',off:'Ekki á vaktaplani'};
const PREF_LEVELS=[[2,'Helst'],[1,'Má'],[0,'Ekki']];
const PRIORITY_NAMES={1:'Hár',2:'Venjulegur',3:'Lágur'};
/* Hve mikið starfsmaður vill vaktir í flokki: 2 = helst, 1 = má, 0 = ekki */
function prefLevel(e,cat){
  if(!cat)return 1;const L=e.prefLevels;
  if(L&&Object.keys(L).length)return L[cat]??1;
  if(e.prefs&&e.prefs.length)return e.prefs.includes(cat)?2:0;
  return 1;
}
/* Giskar á flokk út frá tíma og hvort dagurinn er helgi */
function guessCat(m0,m1,weekend){
  if(m1>1440||m0>=21*60||m0<5*60)return 'night';
  if(weekend)return m0<11*60?'weekendMorning':m0<14*60?'weekendMid':'weekendEvening';
  return m0<12*60?'morning':'evening';
}
/* Starfshlutfall og staða starfsmanns á tilteknum degi (breytingar gilda frá dagsetningu) */
function empOn(e,date){
  let pct=+e.pct||0,status=e.status||'active';
  for(const c of (e.changes||[]).slice().sort((a,b)=>a.from<b.from?-1:1)){if(c.from>date)break;if(c.pct!==''&&c.pct!=null)pct=+c.pct;if(c.status)status=c.status;}
  return {pct,status};
}

function isoWeek(s){
  const d=parse(s),t=new Date(d.getTime());t.setUTCDate(t.getUTCDate()+3-((d.getUTCDay()+6)%7));
  const y=t.getUTCFullYear(),first=new Date(Date.UTC(y,0,4));
  return 1+Math.round(((t-first)/DAY-3+((first.getUTCDay()+6)%7))/7);
}
function periodRange(year,month){ // month 1–12: tímabil 16. þess mánaðar til 15. næsta mánaðar
  const start=`${year}-${pad(month)}-16`,ny=month===12?year+1:year,nm=month===12?1:month+1;
  return {start,end:`${ny}-${pad(nm)}-15`};
}
function periodDates(p){const {start,end}=periodRange(p.year,p.month),L=[];for(let d=start;d<=end;d=addDays(d,1))L.push(d);return L;}
function periodLabel(p){const {start,end}=periodRange(p.year,p.month),a=parse(start),b=parse(end);
  return `16. ${MONTHS[a.getUTCMonth()]}${a.getUTCFullYear()!==b.getUTCFullYear()?' '+a.getUTCFullYear():''} – 15. ${MONTHS[b.getUTCMonth()]} ${b.getUTCFullYear()}`;}
function dateLabel(s,withDay=true){const d=parse(s);return (withDay?DAYS_SHORT[dow(s)]+'. ':'')+d.getUTCDate()+'. '+MONTHS[d.getUTCMonth()];}
function shortDate(s){const d=parse(s);return d.getUTCDate()+'.'+(d.getUTCMonth()+1)+'.';}

/* ---------- Íslenskir frídagar ---------- */
function easter(y){
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
    h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
    mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;
  return `${y}-${pad(mo)}-${pad(da)}`;
}
/* kind: 'major' = stórhátíðardagur, 'red' = almennur frídagur (rauður dagur). from = frá hvaða tíma dagurinn gildir. */
function icelandicHolidays(y){
  const E=easter(y),L=[],add=(date,name,kind,from='')=>L.push({date,name,kind,from});
  add(`${y}-01-01`,'Nýársdagur','major');
  add(addDays(E,-3),'Skírdagur','red');
  add(addDays(E,-2),'Föstudagurinn langi','major');
  add(E,'Páskadagur','major');
  add(addDays(E,1),'Annar í páskum','red');
  let s=`${y}-04-19`;while(dow(s)!==3)s=addDays(s,1);
  add(s,'Sumardagurinn fyrsti','red');
  add(`${y}-05-01`,'Hátíðisdagur verkafólks','red');
  add(addDays(E,39),'Uppstigningardagur','red');
  add(addDays(E,49),'Hvítasunnudagur','major');
  add(addDays(E,50),'Annar í hvítasunnu','red');
  add(`${y}-06-17`,'Þjóðhátíðardagurinn','major');
  let v=`${y}-08-01`;while(dow(v)!==0)v=addDays(v,1);
  add(v,'Frídagur verslunarmanna','red');
  add(`${y}-12-24`,'Aðfangadagur','major','12:00');
  add(`${y}-12-25`,'Jóladagur','major');
  add(`${y}-12-26`,'Annar í jólum','red');
  add(`${y}-12-31`,'Gamlársdagur','major','12:00');
  return L.sort((a,b)=>a.date<b.date?-1:1);
}
function holidaysForPeriod(p){
  const {start,end}=periodRange(p.year,p.month);
  return [...icelandicHolidays(p.year),...icelandicHolidays(p.year+1)].filter(h=>h.date>=start&&h.date<=end);
}

/* ---------- Samhengi (forreiknað) ---------- */
function shiftTimes(sh){
  const start=toMin(sh.start)??0;let end=toMin(sh.end)??start;
  if(end<=start)end+=1440;
  const dur=end-start,brk=Math.min(Math.max(+sh.break||0,0),dur);
  return {m0:start,m1:end,dur,hours:(dur-brk)/60,paidFactor:dur?(dur-brk)/dur:0};
}
function buildCtx(state){
  const R=state.rules,dates=periodDates(state.period),n=dates.length,idx={};
  dates.forEach((d,i)=>idx[d]=i);
  const hol={};for(const h of state.holidays||[])hol[h.date]=h;
  const info=d=>{const w=dow(d),h=hol[d]||null;return {dow:w,weekend:w>=5,hol:h,holFrom:h?(toMin(h.from)||0):null};};
  const infos=dates.map(info);
  const shifts=(state.shifts||[]).map(s=>({...s,...shiftTimes(s)}));
  const shift={};shifts.forEach(s=>shift[s.id]=s);
  const abs={};(state.absTypes||[]).forEach(a=>abs[a.id]=a);
  const allEmps=state.employees||[],empDays={};
  allEmps.forEach(e=>empDays[e.id]=dates.map(d=>empOn(e,d)));
  const P0=state.plan||{};
  const emps=allEmps.filter(e=>empDays[e.id].some(x=>x.status==='active')||(e.status!=='off'&&dates.some(d=>{const v=P0[e.id+'|'+d];return v&&v.s;})));
  const C={state,R,dates,n,idx,hol,infos,info,shifts,shift,abs,emps,allEmps,empDays,
    dayStart:toMin(R.dayStart)??480,dayEnd:toMin(R.dayEnd)??1020,eveEnd:toMin(R.eveningEnd)??1440,
    rest:(+R.minRest||0)*60,maxConsec:+R.maxConsec||99,maxOver:R.maxOver===''||R.maxOver==null?999:+R.maxOver,
    hardWish:R.hardWishes!==false,daily:(+R.weekly||40)/5};
  if(C.eveEnd<=C.dayEnd)C.eveEnd=1440;
  // virkir dagar (mán–fös) og lækkun vegna frídaga
  let wd=0,holRed=0;
  infos.forEach(f=>{if(f.dow<5){wd++;if(f.hol)holRed+=f.holFrom>0?0.5:1;}});
  C.workdays=wd;C.holReduction=R.holidaysReduce!==false?holRed:0;C.effWorkdays=wd-C.holReduction;
  // dagsetningarbundin hlutföll fyrir fjarvistir: hversu mikið af virkum degi er „dagvinnudagur“
  C.dayCredit=infos.map(f=>f.dow>=5?0:!f.hol?1:R.holidaysReduce!==false?(f.holFrom>0?0.5:0):1);
  C.catCache={};
  C.night=s=>{const c=catMinutes(C,null,s,{dow:0,weekend:false,hol:null,holFrom:null});return c.night>s.dur/2;};
  shifts.forEach(s=>s.isNight=C.night(s));
  return C;
}
const dailyOf=(C,e)=>(e.weekly!==''&&e.weekly!=null&&+e.weekly>0?+e.weekly:(+C.R.weekly||40))/5;
/* Vinnuskylda: summa yfir virka daga af (vikustundir/5 × starfshlutfall þann dag), aðeins dagar í starfi (ekki tímavinna/leyfi) */
function targetHours(C,e){
  if(e.fixedTarget!==''&&e.fixedTarget!=null&&!isNaN(+e.fixedTarget))return +e.fixedTarget;
  const D=C.empDays[e.id]&&C.allEmps.includes(e)?C.empDays[e.id]:C.dates.map(d=>empOn(e,d)),dl=dailyOf(C,e);
  return round2(D.reduce((s,x,i)=>s+(x.status==='active'?C.dayCredit[i]*dl*x.pct/100:0),0));
}
/* Hve mikið af fjarvistardegi telst til vinnuskyldu (klst.) */
function absenceCredit(C,e,i,absId){const a=C.abs[absId];if(!a||!a.credit)return 0;const x=(C.empDays[e.id]||[])[i]||empOn(e,C.dates[i]);
  return x.status==='active'?C.dayCredit[i]*dailyOf(C,e)*x.pct/100:0;}
/* Vaktir sem starfsmaður má taka: eftir óskum (flokkum), annars eftir lista, annars allar */
const WEEKEND_PATTERNS={all:'Allar helgar',A:'Aðra hvora helgi (A)',B:'Aðra hvora helgi (B)',none:'Engar helgar'};
const PRIO_SCOPES={all:'Alla daga',weekdays:'Aðeins virka daga',weekends:'Aðeins um helgar'};
/* Númer helgar innan tímabilsins (0 = fyrsta helgin) fyrir vakt á degi i; næturvakt aðfaranótt laugardags telst til helgarinnar */
function weekendIdx(C,i,sh){
  if(!C._wk){C._wk=[];let k=-1,prev=null;C.dates.forEach((d,j)=>{const w=C.infos[j].dow;if(w>=5){const iw=isoWeek(d);if(iw!==prev){k++;prev=iw;}C._wk[j]=k;}else C._wk[j]=null;});
    C._wkNext=C.dates.map((d,j)=>{for(let x=j;x<C.n;x++)if(C._wk[x]!=null)return C._wk[x];return k+1;});}
  if(C._wk[i]!=null)return C._wk[i];
  if(sh&&C.infos[i].dow===4&&sh.m1>1440)return C._wkNext[i];
  return null;
}
function weekendDates(C,par){const o=[];C.dates.forEach((d,i)=>{const k=weekendIdx(C,i,null);if(k!=null&&k%2===par)o.push(d);});return o;}
/* Hvort starfsmaður má taka vakt á degi i skv. föstum forsendum (vikudagabönn, helgamynstur) */
function empRuleBlock(C,e,i,sh){
  const cat=shiftCat(C,sh),dw=C.infos[i].dow;
  for(const r of e.dayRules||[])if((r.days||[]).includes(dw)&&(!r.cats||!r.cats.length||r.cats.includes(cat)))return `ekki ${r.cats&&r.cats.length?r.cats.map(c=>(PREF_NAME[c]||c).toLowerCase()).join('/'):'vaktir'} á ${DAYS_PL[dw]}`;
  const p=e.weekendPattern||'all';
  if(p!=='all'){const k=weekendIdx(C,i,sh);if(k!=null){if(p==='none')return 'tekur engar helgar';if((k%2===0?'A':'B')!==p)return `tekur aðeins helgar ${p}`;}}
  return null;
}
function shiftCat(C,s){const m=C.shift[covId(C,s.id)];return s.cat||(m&&m.cat)||'';}
function allowedIds(C,e){
  let ids=C.shifts.filter(s=>prefLevel(e,shiftCat(C,s))>0).map(s=>s.id);
  const hasPref=(e.prefLevels&&Object.keys(e.prefLevels).length)||(e.prefs&&e.prefs.length);
  if(!hasPref&&e.allowed&&e.allowed.length)ids=ids.filter(id=>e.allowed.includes(id));
  return new Set(ids);
}
/* Afbrigði vaktar (t.d. 08–13 í stað 08–16) telst með aðalvaktinni í mönnun */
function covId(C,id){const s=C.shift[id];return s&&s.countsAs&&s.countsAs!==id&&C.shift[s.countsAs]?s.countsAs:id;}

/* ---------- Flokkun mínútna vaktar eftir tíma og degi ---------- */
function catOfMinute(C,m,f){
  if(f.hol&&m>=f.holFrom)return f.hol.kind==='major'?'major':'red';
  if(f.weekend)return 'weekend';
  if(m>=C.dayStart&&m<C.dayEnd)return 'day';
  if(m>=C.dayEnd&&m<C.eveEnd)return 'evening';
  return 'night';
}
function catMinutes(C,date,sh,fixedInfo){
  const out={day:0,evening:0,night:0,weekend:0,red:0,major:0};
  let t=sh.m0;
  while(t<sh.m1){
    const off=Math.floor(t/1440),m=t%1440;
    const f=fixedInfo||(C.idx[date]!=null&&off===0?C.infos[C.idx[date]]:C.info(addDays(date,off)));
    const bounds=[C.dayStart,C.dayEnd,C.eveEnd,1440];if(f.hol&&f.holFrom>0)bounds.push(f.holFrom);
    const next=Math.min(...bounds.filter(b=>b>m),1440);
    const segEnd=Math.min(off*1440+next,sh.m1);
    out[catOfMinute(C,m,f)]+=segEnd-t;t=segEnd;
  }
  return out;
}
function shiftCats(C,date,shId){
  const k=date+'|'+shId;if(C.catCache[k])return C.catCache[k];
  const sh=C.shift[shId],m=catMinutes(C,date,sh),o={};
  for(const c of CATS)o[c]=m[c]/60*sh.paidFactor;
  return C.catCache[k]=o;
}

/* ---------- Mönnunarþörf ---------- */
function needFor(C,i,sh){
  if(sh.countsAs&&sh.countsAs!==sh.id&&C.shift[sh.countsAs])return 0;
  const d=C.dates[i],ov=(C.state.needOverride||{})[d+'|'+sh.id];
  if(ov!==undefined&&ov!==''&&ov!==null)return +ov||0;
  const f=C.infos[i],dem=sh.demand||[];
  const val=j=>{const v=dem[j];return v===''||v==null?null:+v||0;};
  if(f.hol&&!(f.holFrom>0&&sh.m0<f.holFrom)){
    const v=val(f.hol.kind==='major'?8:7);if(v!=null)return v;
    return val(6)??0;
  }
  return val(f.dow)??0;
}

/* ---------- Slembitölur ---------- */
function rng32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ---------- Sjálfvirk röðun ---------- */
function prepare(C){
  const S=C.state,E=C.emps;
  const wishes=E.map(e=>C.dates.map(d=>(S.wishes||{})[e.id+'|'+d]||null));
  // virk vinnuskylda í röðun: almenn regla telur flutta stöðu með (báðar áttir); á spjaldi „vinna upp skuld“ telur aðeins skuld
  const target=E.map(e=>{const c=+e.carry||0;return targetHours(C,e)-(S.rules.carryInTarget?c:e.carryIn?Math.min(0,c):0);});
  const mustMeet=E.map(e=>!!e.mustMeet);   // skuld (neikvæð staða) bætist við vinnuskyldu
  const credit=E.map((e,ei)=>C.dates.reduce((s,d,i)=>{const v=S.plan[e.id+'|'+d];return s+(v&&v.a?absenceCredit(C,e,i,v.a):0);},0));
  const pctf=E.map(e=>Math.max(C.empDays[e.id].reduce((a,x)=>Math.max(a,x.status==='active'?x.pct:0),0)/100,0.05));
  const allowed=E.map(e=>allowedIds(C,e));
  const avail=E.map(e=>C.empDays[e.id].map(x=>x.status==='active'));
  const noDays=E.map(e=>new Set(e.noDays||[]));
  const nightOk=E.map((e,ei)=>C.shifts.some(s=>s.isNight&&allowed[ei].has(s.id)));
  const need=C.dates.map((d,i)=>C.shifts.map(s=>needFor(C,i,s)));
  const lvl=E.map(e=>C.shifts.map(s=>prefLevel(e,shiftCat(C,s))));
  const prio=E.map(e=>+e.priority||2);
  const fixed=E.map(e=>e.fixedShift&&C.shift[e.fixedShift]?C.shift[e.fixedShift]:null);
  const maxWk=E.map(e=>e.maxWeekends===''||e.maxWeekends==null?null:+e.maxWeekends);
  const maxCon=E.map(e=>e.maxConsec===''||e.maxConsec==null||!(+e.maxConsec>0)?C.maxConsec:+e.maxConsec);
  const asked=E.map((e,ei)=>wishes[ei].filter(w=>w&&w.s&&C.shift[w.s]).length);
  const wkKey=C.dates.map((d,i)=>C.infos[i].dow>=5?isoWeek(d):null);
  const B=S.blocks||{},blocked=E.map(e=>C.dates.map(d=>{const b=B[e.id+'|'+d];return b&&b.length?new Set(b):null;}));
  const onlyW=E.map(e=>!!e.onlyWishes);
  const partner=E.map(e=>e.weekendWith?E.findIndex(x=>x.id===e.weekendWith):-1);
  const scope=E.map(e=>e.priorityScope||'all');
  const nightPref=E.map(e=>prefLevel(e,'night')===2);
  const mix=E.map(e=>S.rules.keepMix!==false&&e.mix&&Object.keys(e.mix).length?e.mix:null);
  const shCat=C.shifts.map(sh=>shiftCat(C,sh));
  const empOver=E.map(e=>e.maxOver===''||e.maxOver==null||isNaN(+e.maxOver)?null:+e.maxOver);
  const gCap=+S.rules.maxWeekHours>0?+S.rules.maxWeekHours:null;
  const weekCap=E.map(e=>{const c=e.maxWeekHours===''||e.maxWeekHours==null||!(+e.maxWeekHours>0)?null:+e.maxWeekHours;return c!=null&&gCap!=null?Math.min(c,gCap):(c??gCap);});
  const weekKey=C.dates.map(d=>isoWeek(d));
  const d0=C.dates[0],PT=S.prevTail||{};
  const prev=E.map(e=>{const L=(PT[e.id]||[]).filter(x=>x.date<d0).sort((a,b)=>a.date<b.date?-1:1);if(!L.length)return null;
    let lastEnd=-1e9,lastNight=false,run=0;
    L.forEach(x=>{const off=diffDays(d0,x.date)*1440,end=off+x.m1;if(end>lastEnd){lastEnd=end;}});
    const last=L[L.length-1];lastNight=diffDays(last.date,d0)===1&&last.m1>1440;
    for(let k=1;k<=14;k++){const dd=addDays(d0,-k);if(L.some(x=>x.date===dd))run++;else break;}
    let nights=0;for(let k=1;k<=14;k++){const dd=addDays(d0,-k);if(L.some(x=>x.date===dd&&x.m1>1440))nights++;else break;}
    return {lastEnd,lastNight,run,nights};});
  const hasHelst=E.map(e=>PREF_CATS.some(([c])=>prefLevel(e,c)===2));
  return {mix,shCat,mustMeet,empOver,weekCap,weekKey,prev,hasHelst,nightPref,onlyW,partner,scope,blocked,wishes,target,credit,pctf,allowed,avail,noDays,nightOk,need,lvl,prio,fixed,maxWk,maxCon,asked,wkKey};
}
function runOnce(C,P,rnd,noise,pace){
  const S=C.state,E=C.emps,N=C.n,SH=C.shifts,shIdx={};SH.forEach((s,j)=>shIdx[s.id]=j);
  const grid=E.map(e=>C.dates.map(d=>{const k=e.id+'|'+d,v=S.plan[k];if(!v)return null;
    if(v.a)return {a:v.a};const w=(S.wishes||{})[k];
    if(v.s&&C.shift[v.s]&&(S.locks[k]||(w&&w.s===v.s)))return {s:v.s,lock:true};return null;}));  // uppfylltar óskir haldast alltaf
  const hours=P.credit.slice(),wk=E.map(()=>0),nt=E.map(()=>0),cnt=C.dates.map(()=>SH.map(()=>0));
  const isWk=i=>C.infos[i].weekend||!!C.infos[i].hol;
  grid.forEach((row,ei)=>row.forEach((c,i)=>{if(c&&c.s){const s=C.shift[c.s];hours[ei]+=s.hours;cnt[i][shIdx[covId(C,c.s)]]++;if(isWk(i))wk[ei]++;if(s.isNight)nt[ei]++;}}));
  let unfilled=0,softViol=0;const holes=[],granted=E.map(()=>0);
  const catCnt=E.map(()=>({})),catTot=E.map(()=>0);
  const addCat=(ei,id)=>{const c=P.shCat[shIdx[id]];if(!c)return;catCnt[ei][c]=(catCnt[ei][c]||0)+1;catTot[ei]++;};
  grid.forEach((row,ei)=>row.forEach(c=>{if(c&&c.s)addCat(ei,c.s);}));
  const wkSets=E.map(()=>new Map());
  const addWk=(ei,i,dlt)=>{const k=P.wkKey[i];if(k==null)return;const m=wkSets[ei];m.set(k,(m.get(k)||0)+dlt);if(!m.get(k))m.delete(k);};
  grid.forEach((row,ei)=>row.forEach((c,i)=>{if(c&&c.s)addWk(ei,i,1);}));
  const can=(ei,i,sh,tol)=>{
    const row=grid[ei];if(row[i])return false;
    if(!P.avail[ei][i]||!P.allowed[ei].has(sh.id)||P.noDays[ei].has(C.infos[i].dow))return false;
    if(P.blocked[ei][i]&&P.blocked[ei][i].has(covId(C,sh.id)))return false;
    if(P.onlyW[ei]){const w2=P.wishes[ei][i];if(!(w2&&w2.s===sh.id)&&!(P.fixed[ei]&&P.fixed[ei].id===sh.id))return false;}
    if(empRuleBlock(C,E[ei],i,sh))return false;
    if(C.R.noAfterNight!==false){const pv=i>0?row[i-1]:null;if(pv&&pv.s&&C.shift[pv.s].m1>1440&&sh.m1<=1440)return false;   // næturvakt í röð er leyfð
      if(sh.m1>1440&&i<N-1&&row[i+1]&&row[i+1].s&&C.shift[row[i+1].s].m1<=1440)return false;}
    const w=P.wishes[ei][i];if(w&&w.off&&C.hardWish)return false;
    const st=i*1440+sh.m0,en=i*1440+sh.m1;
    for(let j=Math.max(0,i-2);j<i;j++){const p=row[j];if(p&&p.s&&j*1440+C.shift[p.s].m1+C.rest>st)return false;}
    for(let j=i+1;j<=Math.min(N-1,i+2);j++){const q=row[j];if(q&&q.s&&en+C.rest>j*1440+C.shift[q.s].m0)return false;}
    const pv0=P.prev[ei];
    if(pv0&&i<=1){if(st<pv0.lastEnd+C.rest)return false;if(i===0&&pv0.lastNight&&sh.m1<=1440&&C.R.noAfterNight!==false)return false;}
    let run=1,j0=i-1;for(;j0>=0&&row[j0]&&row[j0].s;j0--)run++;if(j0<0&&pv0)run+=pv0.run;for(let j=i+1;j<N&&row[j]&&row[j].s;j++)run++;
    if(run>P.maxCon[ei])return false;
    if(P.maxWk[ei]!=null&&P.wkKey[i]!=null&&!wkSets[ei].has(P.wkKey[i])&&wkSets[ei].size+1>P.maxWk[ei])return false;
    if(hours[ei]+sh.hours>P.target[ei]+(tol??(P.empOver[ei]??C.maxOver))+1e-6)return false;
    if(sh.m1>1440&&+C.R.maxNightsRow>0){let nr=1,jn=i-1;for(;jn>=0&&row[jn]&&row[jn].s&&C.shift[row[jn].s].m1>1440;jn--)nr++;if(jn<0&&pv0)nr+=pv0.nights||0;
      for(let j=i+1;j<N&&row[j]&&row[j].s&&C.shift[row[j].s].m1>1440;j++)nr++;if(nr>+C.R.maxNightsRow)return false;}
    if(P.weekCap[ei]!=null){const wk0=P.weekKey[i];let wh=sh.hours;for(let j=0;j<N;j++)if(P.weekKey[j]===wk0&&row[j]&&row[j].s)wh+=C.shift[row[j].s].hours;if(wh>P.weekCap[ei]+1e-6)return false;}
    if(pace&&tol==null&&hours[ei]+sh.hours>P.target[ei]*(i+1)/N+pace)return false;
    return true;
  };
  const score=(ei,i,sh)=>{
    const row=grid[ei],t=P.target[ei]||1;
    let s=(hours[ei]/t)*100;
    if(C.R.weekendPairs&&sh.m1<=1440){const w=C.infos[i].dow;if(w===5||w===6){const o=w===5?i+1:i-1;if(o>=0&&o<N){const oc=row[o];s+=oc&&oc.s?-80:60;}}}
    if(sh.m1>1440&&C.R.nightBlocks){   // næturvaktir í blokkum: fös–sun (helgarhópur), mán–þri, mið–fim
      const w=C.infos[i].dow,start=w===0||w===2||w===4,p=i>0?row[i-1]:null,pn=p&&p.s&&C.shift[p.s].m1>1440;
      if(!start){if(pn)s-=300;else{const other=i>0&&grid.some((r2,ej)=>ej!==ei&&r2[i-1]&&r2[i-1].s&&C.shift[r2[i-1].s].m1>1440);if(other)s+=120;}}
      else{if(pn)s+=80;const len=w===4?3:2,room=P.target[ei]+(P.empOver[ei]??C.maxOver)-hours[ei];if(room<len*sh.hours-0.01)s+=150;}}   // byrjar blokk: þarf tíma fyrir alla blokkina
    if(P.tmpl){const tv=P.tmpl[ei][i];if(tv&&covId(C,tv)===covId(C,sh.id))s-=50;else if(tv==='')s+=20;}   // rúllandi plan: sama og síðast
    if(P.mustMeet[ei]&&hours[ei]<P.target[ei])s-=80;   // verður að ná vinnuskyldu
    const after=hours[ei]+sh.hours;if(after>P.target[ei])s+=(after-P.target[ei])*12;
    const w=P.wishes[ei][i];
    if(w){if(w.off)s+=400;else if(w.s===sh.id)s-=250;else if(w.s)s+=60;}
    if(P.mix[ei]){const c=P.shCat[shIdx[sh.id]];if(c){const cur=((catCnt[ei][c]||0)+1)/(catTot[ei]+1);s+=(cur-(P.mix[ei][c]||0))*140;}}  // hlutfall vaktategunda eins og síðast
    const lv=P.lvl[ei][shIdx[sh.id]];if(lv===2)s-=40;else if(P.hasHelst[ei])s+=25;  // þeir sem hafa „Helst“ fara síður á aðrar vaktir
    const pa=P.partner[ei];if(pa>=0){const k=weekendIdx(C,i,sh);if(k!=null){const pe=E[pa],pp=pe.weekendPattern||'all';
      let on;if(pp==='A'||pp==='B')on=(k%2===0?'A':'B')===pp;else on=grid[pa].some((c,j)=>c&&c.s&&weekendIdx(C,j,C.shift[c.s])===k);
      s+=on?-30:45;}}
    const wpE=E[ei].weekendPattern;if(isWk(i)&&!(wpE==='A'||wpE==='B'||P.partner[ei]>=0))s+=wk[ei]/P.pctf[ei]*7;
    if(sh.isNight){if(P.nightPref[ei])s-=20;else s+=nt[ei]/P.pctf[ei]*5;}
    const wp=E[ei].weekendPattern;if(wp==='A'||wp==='B'){const k=weekendIdx(C,i,sh);s+=k!=null?-60:45;}  // helgarnar hans ganga fyrir virkum dögum
    const p=i>0?row[i-1]:null;
    if(p&&p.s===sh.id)s-=6;                     // samfella í sömu vakt
    else if(p&&p.s&&C.shift[p.s].isNight&&!sh.isNight)s+=10;
    if(i>1&&!p&&row[i-2]&&row[i-2].s)s+=5;      // forðast stakan frídag
    const f=C.infos[i];if(f.dow===6&&p&&p.s)s-=10; // helgi saman
    if(f.dow===5&&i<N-1&&row[i+1]&&row[i+1].s)s-=10;
    return s+rnd()*noise;
  };
  const assign=(ei,i,sh)=>{grid[ei][i]={s:sh.id};addCat(ei,sh.id);hours[ei]+=sh.hours;cnt[i][shIdx[covId(C,sh.id)]]++;if(isWk(i))wk[ei]++;if(sh.isNight)nt[ei]++;addWk(ei,i,1);
    const w=P.wishes[ei][i];if(w&&w.off)softViol++;if(w&&w.s===sh.id)granted[ei]++;};
  const unassign=(ei,i)=>{const c=grid[ei][i];if(!c||!c.s)return;const sh=C.shift[c.s];grid[ei][i]=null;hours[ei]-=sh.hours;cnt[i][shIdx[covId(C,sh.id)]]--;
    if(isWk(i))wk[ei]--;if(sh.isNight)nt[ei]--;addWk(ei,i,-1);const ct=P.shCat[shIdx[sh.id]];if(ct){catCnt[ei][ct]--;catTot[ei]--;}const w=P.wishes[ei][i];if(w&&w.s===sh.id)granted[ei]--;};
  const free=(i,sh)=>P.need[i][shIdx[covId(C,sh.id)]]-cnt[i][shIdx[covId(C,sh.id)]];
  // 1) fastar vaktir (t.d. sjúkraliði á 8–16 alla virka daga)
  for(let i=0;i<N;i++)E.forEach((e,ei)=>{const sh=P.fixed[ei],w=P.wishes[ei][i];if(w&&(w.off||(w.s&&w.s!==(sh&&sh.id))))return;if(sh&&free(i,sh)>0&&can(ei,i,sh))assign(ei,i,sh);});
  // 2) óskir: úthlutað fyrst; ef fleiri óska en pláss er ræður forgangur, síðan hver hefur fengið hlutfallslega fæstar óskir
  if(C.R.wishFirst!==false)for(let i=0;i<N;i++){
    const L=[];E.forEach((e,ei)=>{const w=P.wishes[ei][i];if(w&&w.s&&C.shift[w.s]&&!grid[ei][i])L.push({ei,sh:C.shift[w.s],r:rnd()});});
    const wkd=C.infos[i].weekend||!!C.infos[i].hol,pr=ei=>P.scope[ei]==='all'||(P.scope[ei]==='weekdays')===!wkd?P.prio[ei]:2;
    L.sort((a,b)=>pr(a.ei)-pr(b.ei)||granted[a.ei]/Math.max(1,P.asked[a.ei])-granted[b.ei]/Math.max(1,P.asked[b.ei])||a.r-b.r);
    for(const x of L)if(free(i,x.sh)>0&&can(x.ei,i,x.sh))assign(x.ei,i,x.sh);
  }
  // 2a) næturvaktir í heilum blokkum: fös–sun (helgarhópur), mán–þri, mið–fim, hver blokk hjá einum starfsmanni
  if(C.R.nightBlocks){
    const nightFor=j=>SH.find(sh=>sh.m1>1440&&!sh.countsAs&&P.need[j][shIdx[sh.id]]>0);
    for(let i=0;i<N;i++){const w=C.infos[i].dow;if(!(w===0||w===2||w===4)&&i>0)continue;
      const len=w===4?3:w===0||w===2?2:(w===1||w===3?1:(w===5?2:1)),days=[];for(let j=i;j<Math.min(N,i+len);j++)days.push(j);
      const open=days.filter(j=>{const sh=nightFor(j);return sh&&free(j,sh)>0;});if(!open.length)continue;
      const holder=E.findIndex((e,ei)=>days.some(j=>grid[ei][j]&&grid[ei][j].s&&C.shift[grid[ei][j].s].m1>1440));
      const cands=holder>=0?[holder]:E.map((e,ei)=>ei).filter(ei=>P.allowed[ei].has(nightFor(open[0]).id))
        .map(ei=>({ei,k:w===4?(P.nightPref[ei]?-1000:0)+(hours[ei]/(P.target[ei]||1))*100-(P.mix[ei]?(P.mix[ei].night||0)*200:0)+rnd()*noise
          :-(((P.mix[ei]?P.mix[ei].night||0:0)*(P.target[ei]||0)/7.5)-nt[ei])*60+(hours[ei]/(P.target[ei]||1))*30+rnd()*noise})).sort((a,b)=>a.k-b.k).map(x=>x.ei);   // helgarblokkir til næturfólks, virka daga dreift eftir næturhlutfalli
      for(const ei of cands){const done=[];let ok=true;
        for(const j of open){const sh=nightFor(j);if(can(ei,j,sh)){assign(ei,j,sh);done.push(j);}else{ok=false;break;}}
        if(ok)break;done.forEach(j=>unassign(ei,j));}
    }
  }
  // 2a2) helgarvaktir í pörum: sá sem vinnur helgi vinnur bæði laugardag og sunnudag (dagvaktir)
  if(C.R.weekendPairs){
    const dayOpen=j=>SH.filter(sh=>sh.m1<=1440&&!sh.countsAs&&free(j,sh)>0);
    for(let i=0;i<N-1;i++){if(C.infos[i].dow!==5)continue;const j=i+1;
      const workedOne=ei=>(grid[ei][i]&&grid[ei][i].s?1:0)+(grid[ei][j]&&grid[ei][j].s?1:0);
      const cands=E.map((e,ei)=>ei).map(ei=>({ei,k:(workedOne(ei)===1?-1000:0)+wk[ei]/P.pctf[ei]*10+(hours[ei]/(P.target[ei]||1))*100+rnd()*noise}))
        .sort((a,b)=>a.k-b.k).map(x=>x.ei);
      for(const ei of cands){
        const has=[grid[ei][i],grid[ei][j]];if(has[0]&&has[1])continue;
        const need=[!has[0]?i:null,!has[1]?j:null].filter(x=>x!=null);
        const done=[];let ok=true;
        for(const d of need){const pref=has[0]&&has[0].s?has[0].s:has[1]&&has[1].s?has[1].s:(done.length?grid[ei][done[0]].s:null);
          const opts=dayOpen(d).sort((a,b)=>(b.id===pref)-(a.id===pref));const sh=opts.find(o=>can(ei,d,o));
          if(sh){assign(ei,d,sh);done.push(d);}else{ok=false;break;}}
        if(!ok)done.forEach(d=>unassign(ei,d));
        if(!dayOpen(i).length&&!dayOpen(j).length)break;
      }
    }
  }
  // 2b) rúllandi plan: fyrirkomulag síðasta tímabils flutt inn eins óbreytt og hægt er
  let tmplKept=0,tmplTotal=0;
  if(P.tmpl&&!P.tmplSoft){for(let i=0;i<N;i++){const ord=E.map((e,ei)=>ei).sort(()=>rnd()-.5);
    for(const ei of ord){const t=P.tmpl[ei][i];if(!t)continue;const sh=C.shift[t];if(!sh)continue;
      if(grid[ei][i]&&grid[ei][i].s){continue;}
      if(!grid[ei][i]&&free(i,sh)>0&&can(ei,i,sh))assign(ei,i,sh);}}}
  // 3) fylla það sem eftir er
  for(let i=0;i<N;i++){
    const order=SH.map((sh,j)=>{const rem=P.need[i][j]-cnt[i][j];return {sh,j,rem,el:rem>0?E.reduce((a,_,ei)=>a+(can(ei,i,sh)?1:0),0):0};})
      .filter(o=>o.rem>0).sort((a,b)=>(a.el-a.rem)-(b.el-b.rem)||(rnd()-.5));
    for(const o of order){
      for(let r=0;r<o.rem;r++){
        let best=-1,bs=Infinity;
        for(let ei=0;ei<E.length;ei++){if(!can(ei,i,o.sh))continue;const sc=score(ei,i,o.sh);if(sc<bs){bs=sc;best=ei;}}
        if(best<0){unfilled+=o.rem-r;holes.push({i,shift:o.sh.id,missing:o.rem-r});break;}
        assign(best,i,o.sh);
      }
    }
  }
  if(C.R.fillUp){
    const minH=Math.min(...SH.map(s=>s.hours).filter(h=>h>0));
    let changed=true,guard=0;
    while(changed&&guard++<500){
      changed=false;
      const order=E.map((e,ei)=>ei).filter(ei=>P.target[ei]-hours[ei]>=minH*0.75||(P.mustMeet[ei]&&hours[ei]<P.target[ei]-0.01)).sort((a,b)=>(P.mustMeet[b]-P.mustMeet[a])||(hours[a]-P.target[a])-(hours[b]-P.target[b]));
      for(const ei of order){
        let best=null,bs=Infinity;
        for(let i=0;i<N;i++)SH.forEach((sh,j)=>{
          if(P.need[i][j]<=0)return;
          if(sh.max!==''&&sh.max!=null&&cnt[i][j]>=+sh.max)return;
          if(!can(ei,i,sh,P.mustMeet[ei]?(P.empOver[ei]??C.maxOver):Math.min(C.maxOver,sh.hours/2)))return;
          const sc=cnt[i][j]/P.need[i][j]*10+(isWk(i)?3:0)+score(ei,i,sh)/50+rnd()*noise/3;
          if(sc<bs){bs=sc;best={i,sh};}
        });
        if(best){assign(ei,best.i,best.sh);changed=true;}
      }
    }
  }
  // heildarmat
  let dev=0;E.forEach((e,ei)=>{const d=hours[ei]-P.target[ei];dev+=d*d;if(P.mustMeet[ei]&&d<-0.01)dev+=2000-d*100;});
  const spread=(arr,mask)=>{const v=arr.map((x,ei)=>x/P.pctf[ei]).filter((_,ei)=>mask(ei));if(v.length<2)return 0;const m=v.reduce((a,b)=>a+b,0)/v.length;return v.reduce((a,b)=>a+(b-m)*(b-m),0);};
  let blocks=0;grid.forEach(row=>row.forEach((c,i)=>{if(c&&c.s&&!(row[i-1]&&row[i-1].s)&&!(row[i+1]&&row[i+1].s))blocks++;}));
  const holeDays={};holes.forEach(h=>holeDays[h.i]=(holeDays[h.i]||0)+h.missing);
  const clump=Object.values(holeDays).reduce((a,b)=>a+b*b,0);
  let missed=0;const ratios=[];E.forEach((e,ei)=>{if(P.asked[ei]){missed+=P.asked[ei]-granted[ei];ratios.push(granted[ei]/P.asked[ei]);}});
  const rm=ratios.reduce((a,b)=>a+b,0)/(ratios.length||1),rvar=ratios.reduce((a,b)=>a+(b-rm)*(b-rm),0);
  let mixDev=0;E.forEach((e,ei)=>{if(!P.mix[ei]||!catTot[ei])return;PREF_CATS.forEach(([c])=>{const d=(catCnt[ei][c]||0)/catTot[ei]-(P.mix[ei][c]||0);mixDev+=d*d*catTot[ei];});});
  if(P.tmpl)E.forEach((e,ei)=>C.dates.forEach((d,i)=>{const t=P.tmpl[ei][i];if(t){tmplTotal++;const g=grid[ei][i];if(g&&g.s&&covId(C,g.s)===covId(C,t))tmplKept++;}}));
  const sc=unfilled*10000+clump*40+mixDev*60+(tmplTotal-tmplKept)*80+dev+softViol*300+missed*120+rvar*600+spread(wk,()=>true)*4+spread(nt,ei=>P.nightOk[ei]&&!P.nightPref[ei])*3+blocks*2;
  return {grid,score:sc,unfilled,holes,tmplKept,tmplTotal};
}
function generate(state,opts={}){
  const C=buildCtx(state),P=prepare(C);
  P.tmplSoft=!!opts.templateSoft;
  if(opts.template){const T=opts.template;P.tmpl=C.emps.map(e=>C.dates.map(d=>{const v=T[e.id+'|'+d];return v===undefined?undefined:v;}));}
  const runs=opts.runs??300,ms=opts.ms??1800,t0=Date.now(),rnd=rng32(opts.seed??(Date.now()%2147483647));
  let best=null,tried=0;
  for(let r=0;r<runs;r++){
    if(r>=6&&Date.now()-t0>ms)break;
    const res=runOnce(C,P,rnd,r===0?0:r<runs/2?15:35,[0,0,24,16][r%4]);tried++;
    if(!best||res.score<best.score)best=res;
  }
  const plan={};
  C.emps.forEach((e,ei)=>best.grid[ei].forEach((c,i)=>{if(c)plan[e.id+'|'+C.dates[i]]=c.a?{a:c.a}:{s:c.s};}));
  // halda færslum utan tímabils óbreyttum
  const inPlan=new Set(C.emps.map(e=>e.id));
  for(const [k,v] of Object.entries(state.plan||{})){const [eid,d]=k.split('|');if(C.idx[d]==null||!inPlan.has(eid))plan[k]=v;}
  return {plan,tmplKept:best.tmplKept,tmplTotal:best.tmplTotal,unfilled:best.unfilled,holes:best.holes.map(h=>({date:C.dates[h.i],shift:h.shift,missing:h.missing})),runs:tried,score:best.score};
}

/* ---------- Tölfræði ---------- */
function stats(state){
  const C=buildCtx(state),S=state;
  const emp=C.emps.map(e=>{
    const o={id:e.id,name:e.name,pct:+e.pct||0,target:targetHours(C,e),carry:+e.carry||0,shifts:0,worked:0,credit:0,
      cats:Object.fromEntries(CATS.map(c=>[c,0])),byShift:{},abs:{},weekendDays:0,weekends:0,nights:0,holidayShifts:0,wishOff:0,wishOffKept:0,wishShift:0,wishShiftKept:0,wished:0};
    const wkSet=new Set();
    C.dates.forEach((d,i)=>{
      const k=e.id+'|'+d,v=S.plan[k],w=(S.wishes||{})[k];
      if(v&&v.s&&C.shift[v.s]){const sh=C.shift[v.s];o.shifts++;o.worked+=sh.hours;o.byShift[v.s]=(o.byShift[v.s]||0)+1;
        const c=shiftCats(C,d,v.s);for(const x of CATS)o.cats[x]+=c[x];
        const f=C.infos[i];if(f.weekend){o.weekendDays++;wkSet.add(isoWeek(d));}
        if(f.hol)o.holidayShifts++;if(sh.isNight)o.nights++;}
      if(v&&v.a){o.abs[v.a]=(o.abs[v.a]||0)+1;o.credit+=absenceCredit(C,e,i,v.a);}
      if(w&&w.off){o.wishOff++;if(!(v&&v.s))o.wishOffKept++;}
      if(w&&w.s){o.wishShift++;if(v&&v.s===w.s)o.wishShiftKept++;if(C.shift[w.s])o.wished+=C.shift[w.s].hours;}
    });
    o.weekends=wkSet.size;
    o.total=o.worked+o.credit;o.diff=o.total-o.target;o.balance=o.diff+o.carry;o.outstanding=o.target-o.total;
    const D=C.empDays[e.id];o.status=D.every(x=>x.status===D[0].status)?D[0].status:'mixed';o.pctNow=D[D.length-1].pct;o.pctMax=Math.max(...D.map(x=>x.status==='active'?x.pct:0));
    const R=S.rules.rates||{};o.premium=['evening','night','weekend','red','major'].reduce((s,c)=>s+o.cats[c]*(+R[c]||0)/100,0);
    return o;
  });
  const days=C.dates.map((d,i)=>{
    const row={date:d,info:C.infos[i],shifts:{},staff:0,hours:0};
    C.shifts.forEach(sh=>{row.shifts[sh.id]={have:0,need:needFor(C,i,sh),names:[]};});
    C.emps.forEach(e=>{const v=S.plan[e.id+'|'+d];if(v&&v.s&&C.shift[v.s]){const x=row.shifts[covId(C,v.s)];x.have++;x.names.push(e.name);row.staff++;row.hours+=C.shift[v.s].hours;}});
    return row;
  });
  const tot={target:0,worked:0,credit:0,need:0,have:0,cats:Object.fromEntries(CATS.map(c=>[c,0]))};
  emp.forEach(o=>{tot.target+=o.target;tot.worked+=o.worked;tot.credit+=o.credit;for(const c of CATS)tot.cats[c]+=o.cats[c];});
  days.forEach(r=>Object.values(r.shifts).forEach(x=>{tot.need+=x.need;tot.have+=Math.min(x.have,x.need);}));
  const used=new Set();days.forEach(r=>Object.entries(r.shifts).forEach(([id,x])=>{if(x.need||x.have)used.add(id);}));
  C.emps.forEach(e=>C.dates.forEach(d=>{const v=S.plan[e.id+'|'+d],w=(S.wishes||{})[e.id+'|'+d];if(v&&v.s)used.add(v.s);if(w&&w.s)used.add(w.s);}));
  const usedShifts=C.shifts.filter(s=>used.has(s.id));
  const hourly=C.allEmps.filter(e=>!C.emps.includes(e)).map(e=>({id:e.id,name:e.name,status:C.empDays[e.id][C.n-1].status}));
  return {C,emp,days,tot,hourly,usedShifts,workdays:C.workdays,holReduction:C.holReduction,effWorkdays:C.effWorkdays};
}

/* ---------- Yfirferð ---------- */
/* Vinnudagar í röð strax fyrir tímabilið (úr síðustu dögum fyrra tímabils) */
function prevRunOf(state,e){const L=(state.prevTail||{})[e.id]||[],d0=periodDates(state.period)[0];let run=0;
  for(let k=1;k<=14;k++){const dd=addDays(d0,-k);if(L.some(x=>x.date===dd))run++;else break;}return run;}
function validate(state){
  const C=buildCtx(state),S=state,out=[],N=C.n;
  C.dates.forEach((d,i)=>C.shifts.forEach(sh=>{
    if(sh.countsAs&&C.shift[sh.countsAs]&&sh.countsAs!==sh.id)return;
    const need=needFor(C,i,sh);let have=0;C.emps.forEach(e=>{const v=S.plan[e.id+'|'+d];if(v&&v.s&&C.shift[v.s]&&covId(C,v.s)===sh.id)have++;});
    if(have<need)out.push({level:'error',type:'under',date:d,shift:sh.id,msg:`${dateLabel(d)}: vantar ${need-have} á ${sh.name} (${have}/${need})`});
    else if(have>need)out.push({level:'info',type:'over',date:d,shift:sh.id,msg:`${dateLabel(d)}: ${have-need} umfram á ${sh.name} (${have}/${need})`});
  }));
  C.emps.forEach(e=>{
    const row=C.dates.map(d=>S.plan[e.id+'|'+d]||null),allowed=allowedIds(C,e),noD=new Set(e.noDays||[]),D=C.empDays[e.id];
    const pr=prevRunOf(S,e);let run=pr,runStart=-pr,told=false;
    row.forEach((c,i)=>{
      const d=C.dates[i],w=(S.wishes||{})[e.id+'|'+d];
      if(c&&c.s&&C.shift[c.s]){
        const sh=C.shift[c.s];
        if(run===0){runStart=i;told=false;}run++;
        const mc=+e.maxConsec>0?+e.maxConsec:C.maxConsec,sd=runStart<0?addDays(C.dates[0],runStart):C.dates[runStart];
        if(run>mc&&!told&&(told=true))out.push({level:'warn',type:'consec',emp:e.id,date:d,msg:`${e.name}: ${run} vinnudagar í röð frá ${dateLabel(sd)}${runStart<0?' (með síðustu dögum fyrra tímabils)':''}, hámark ${mc}`});
        for(let j=i+1;j<=Math.min(N-1,i+2);j++){const q=row[j];if(q&&q.s&&C.shift[q.s]){const gap=(j*1440+C.shift[q.s].m0)-(i*1440+sh.m1);
          if(gap<C.rest)out.push({level:'warn',type:'rest',emp:e.id,date:d,msg:`${e.name}: aðeins ${round2(gap/60)} klst. hvíld milli ${sh.code} (${dateLabel(d)}) og ${C.shift[q.s].code} (${dateLabel(C.dates[j])})`});break;}}
        if(D[i].status!=='active')out.push({level:D[i].status==='hourly'?'info':'warn',type:'status',emp:e.id,date:d,msg:`${e.name} er á vakt ${dateLabel(d)} en er skráð í ${STATUS_NAMES[D[i].status].toLowerCase()} þann dag`});
        const rb=empRuleBlock(C,e,i,sh);if(rb)out.push({level:'warn',type:'rule',emp:e.id,date:d,msg:`${e.name}: ${sh.code} ${dateLabel(d)} (${rb})`});
        if(C.R.noAfterNight!==false&&sh.m1<=1440&&i>0&&row[i-1]&&row[i-1].s&&C.shift[row[i-1].s]&&C.shift[row[i-1].s].m1>1440)out.push({level:'warn',type:'afternight',emp:e.id,date:d,msg:`${e.name}: vakt ${dateLabel(d)} sama dag og næturvakt lýkur`});
        const bl=(S.blocks||{})[e.id+'|'+d];if(bl&&bl.includes(covId(C,c.s)))out.push({level:'warn',type:'block',emp:e.id,date:d,msg:`${e.name}: ${sh.code} ${dateLabel(d)} var tekin út („raða aftur án“) en er komin aftur inn`});
        if(!allowed.has(c.s))out.push({level:'warn',type:'allowed',emp:e.id,date:d,msg:`${e.name}: ${sh.name} ${dateLabel(d)} er ekki á lista yfir vaktir starfsmanns`});
        if(noD.has(C.infos[i].dow))out.push({level:'warn',type:'noday',emp:e.id,date:d,msg:`${e.name} vinnur að jafnaði ekki á ${DAYS_PL[C.infos[i].dow]} (${dateLabel(d)})`});
        if(w&&w.off)out.push({level:'warn',type:'wish',emp:e.id,date:d,msg:`${e.name}: á vakt þrátt fyrir ósk um frí ${dateLabel(d)}`});
      }else{run=0;told=false;}
      if(w&&w.s&&!(c&&c.s===w.s)&&C.shift[w.s])out.push({level:'info',type:'wishshift',emp:e.id,date:d,msg:`${e.name}: ósk um ${C.shift[w.s].name} ${dateLabel(d)} ekki uppfyllt`});
    });
  });
  C.emps.forEach(e=>{const W={};const L0=(S.prevTail||{})[e.id]||[];let nr=0;for(let k=1;k<=14;k++){const dd=addDays(C.dates[0],-k);if(L0.some(x=>x.date===dd&&x.m1>1440))nr++;else break;}
    C.dates.forEach((d,i)=>{const v=S.plan[e.id+'|'+d];const sh=v&&v.s&&C.shift[v.s];if(sh){const k=isoWeek(d);W[k]=(W[k]||0)+sh.hours;}
      if(sh&&sh.m1>1440){nr++;if(+S.rules.maxNightsRow>0&&nr===+S.rules.maxNightsRow+1)out.push({level:'warn',type:'nights',emp:e.id,date:d,msg:`${e.name}: fleiri en ${S.rules.maxNightsRow} næturvaktir í röð (${dateLabel(d)})`});}else nr=0;});
    const cap=Math.min(+e.maxWeekHours>0?+e.maxWeekHours:1e9,+S.rules.maxWeekHours>0?+S.rules.maxWeekHours:1e9);
    Object.entries(W).forEach(([k,h])=>{if(h>cap+1e-6)out.push({level:'warn',type:'week',emp:e.id,msg:`${e.name}: ${fmtNum(h)} klst. í viku ${k} (hámark ${fmtNum(cap)})`});});});
  const st=stats(state),tol=+S.rules.hourTolerance||4;
  st.emp.forEach(o=>{const e=C.emps.find(x=>x.id===o.id);if(e&&e.mustMeet){const need=o.target-(e.carryIn||S.rules.carryInTarget?Math.min(0,o.carry):0);
    if(o.total<need-0.01)out.push({level:'warn',type:'must',emp:o.id,msg:`${o.name} á að ná vinnuskyldu en vantar ${fmtNum(need-o.total)} klst. (${fmtNum(o.total)} af ${fmtNum(need)})`});}});
  st.emp.forEach(o=>{if(Math.abs(o.diff)>tol)out.push({level:'warn',type:'hours',emp:o.id,msg:`${o.name}: ${o.diff>0?'+':''}${fmtNum(o.diff)} klst. miðað við vinnuskyldu (${fmtNum(o.total)} af ${fmtNum(o.target)})`});});
  return out;
}

/* ---------- Innlestur á völdum vöktum (CSV/Excel) ----------
   Tafla þar sem ein lína er starfsmaður og hver dálkur dagur (t.d. „16.11 mán.“) og reitir eru tímar („08:00-16:00“),
   kóðar vakta eða kóðar fjarvista. Innlesnar vaktir eru læstar svo röðunin raðar aðeins á það sem eftir er. */
function parseCsv(text){
  text=String(text||'').replace(/^﻿/,'');
  const first=text.split(/\r?\n/).filter(l=>l.trim()).slice(0,5).join('\n');
  const cnt=c=>(first.match(new RegExp(c==='\t'?'\\t':'\\'+c,'g'))||[]).length;
  const delim=['\t',';',','].sort((a,b)=>cnt(b)-cnt(a))[0];
  const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
    else if(ch==='"')q=true;
    else if(ch===delim){row.push(cur);cur='';}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur='';}
    else cur+=ch;}
  if(cur!==''||row.length){row.push(cur);rows.push(row);}
  return rows;
}
const normName=s=>String(s||'').normalize('NFC').toLowerCase().replace(/\s+/g,' ').trim();
const hhmm=m=>pad(Math.floor(m/60)%24||(m>0&&m%1440===0?24:0))+':'+pad(m%60);
function parseRange(v){
  const m=String(v).trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*[-–—]\s*(\d{1,2})(?:[:.](\d{2}))?$/);
  if(!m)return null;const a=+m[1]*60+(+m[2]||0);let b=+m[3]*60+(+m[4]||0);
  if(a>=1440||b>1440)return null;if(b<=a)b+=1440;return {m0:a,m1:b};
}
function importTable(state,rows,opts={}){
  const uid=p=>p+Math.random().toString(36).slice(2,9);
  rows=(rows||[]).map(r=>(r||[]).map(c=>c==null?'':String(c).trim()));
  const rep={matched:[],prev:0,period:null,count:0,replaced:0,wishes:0,newEmps:[],newShifts:[],unknown:[],inactive:[],ignored:[]};const asWish=opts.mode==='wish';
  // tímabil úr skjalinu, t.d. „16.11.2026 - 15.12.2026“
  for(const r of rows)for(const c of r){const m=c.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if(m&&!rep.period&&+m[1]===16){rep.period={year:+m[3],month:+m[2]};}}
  const asPrev=opts.mode==='prev';
  const mixCnt={};if(asPrev){state.prevTail={};state.prevPlan={};}
  if(rep.period&&!asPrev&&(rep.period.year!==state.period.year||rep.period.month!==state.period.month)&&opts.setPeriod!==false){
    const custom=(state.holidays||[]).filter(h=>h.custom);state.period=rep.period;const {start,end}=periodRange(rep.period.year,rep.period.month);
    const auto=holidaysForPeriod(rep.period),ad=new Set(auto.map(h=>h.date));
    state.holidays=[...auto,...custom.filter(h=>h.date>=start&&h.date<=end&&!ad.has(h.date))].sort((a,b)=>a.date<b.date?-1:1);rep.periodChanged=true;}
  const {start,end}=periodRange(state.period.year,state.period.month),sy=+start.slice(0,4),ey=+end.slice(0,4);
  const dateOf=c=>{let m=c.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return `${m[1]}-${m[2]}-${m[3]}`;
    m=c.match(/^(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?(?![\d:])/);if(!m)return null;const d=+m[1],mo=+m[2];if(d<1||d>31||mo<1||mo>12)return null;
    if(m[3]){let y=+m[3];if(y<100)y+=2000;return `${y}-${pad(mo)}-${pad(d)}`;}
    for(const y of [sy,ey]){const x=`${y}-${pad(mo)}-${pad(d)}`;if(x>=start&&x<=end)return x;}return `${sy}-${pad(mo)}-${pad(d)}`;};
  // dagsetningalínur: skjal getur verið í mörgum vikublokkum (t.d. eitt blað á viku), hver með sína dagsetningalínu
  const nDates=r=>r.filter(c=>c&&!/\d{4}\s*[-–]/.test(c)&&!/\d:\d/.test(c)&&dateOf(c)).length;
  const best=Math.max(0,...rows.map(nDates)),heads=rows.map((r,i)=>i).filter(i=>nDates(rows[i])>=2&&(best<3||nDates(rows[i])>=2));
  if(!heads.length||best<2||(heads.length===1&&best<3))throw Error('Fann ekki línu með dagsetningum (t.d. „16.11 mán.“) í skjalinu.');
  const colsOf=i=>{const o={};rows[i].forEach((c,j)=>{const d=c&&!/\d:\d/.test(c)&&dateOf(c);if(d)o[j]=d;});return o;};
  const hi=heads[0],headCols=Object.fromEntries(heads.map(i=>[i,colsOf(i)]));let cols=headCols[hi];
  const firstCol=Math.min(...heads.map(i=>Math.min(...Object.keys(headCols[i]).map(Number))));
  let nameCol=-1,nb=0;for(let j=0;j<firstCol;j++){const n=rows.slice(hi+1).filter(r=>r[j]&&/[a-zA-Z\u00C0-\u00FF]/.test(r[j])).length;if(n>nb){nb=n;nameCol=j;}}
  if(nameCol<0)throw Error('Fann ekki dálk með nöfnum starfsfólks vinstra megin við dagsetningarnar.');
  const byName={};(state.employees||[]).forEach(e=>byName[normName(e.name)]=e);
  for(let ri=hi+1;ri<rows.length;ri++){const r=rows[ri];
    if(headCols[ri]){cols=headCols[ri];continue;}
    const name=r[nameCol];if(!name||!/[a-zA-Z\u00C0-\u00FF]/.test(name))continue;
    let e=byName[normName(name)];
    if(!e){const t=normName(name).split(' '),C2=(state.employees||[]).filter(x=>{const u=normName(x.name).split(' ');return u[0]===t[0]&&(u.length<2||t.length<2||u[1]===t[1]);});
      if(C2.length===1)e=C2[0];else{const C3=(state.employees||[]).filter(x=>normName(x.name).split(' ')[0]===t[0]);if(C3.length===1)e=C3[0];
        else{const C4=(state.employees||[]).filter(x=>{const u=normName(x.name).split(' ')[0];return u.length>=3&&t[0].length>=3&&(u.startsWith(t[0])||t[0].startsWith(u));});if(C4.length===1)e=C4[0];}}
      if(e)rep.matched.push(`${name} → ${e.name}`);}
    if(e&&e.status==='off'&&!(e.changes||[]).length){rep.ignored.push(name);continue;}
    if(!e&&asPrev){rep.unknown.push(name+' (ekki á starfsmannalista)');continue;}
    const cells=Object.entries(cols).filter(([j])=>r[j]);
    if(!e){if(!cells.length&&opts.addEmpty===false)continue;
      e={id:uid('e'),name,title:'',pct:0,status:'active',prefs:[],changes:[],allowed:[],noDays:[],carry:0,fixedTarget:'',weekly:'',note:'Bætt við úr innlestri. Skráðu starfshlutfall.'};
      state.employees.push(e);byName[normName(name)]=e;rep.newEmps.push(name);}
    for(const [j,d] of cells){
      if(asPrev){const t=parseRange(r[j]);if(t){state.prevPlan=state.prevPlan||{};(state.prevPlan[e.id]=state.prevPlan[e.id]||[]).push({date:d,m0:t.m0,m1:t.m1});}
        if(t){const wkd=dow(d)>=5,c=guessCat(t.m0,t.m1,wkd);mixCnt[e.id]=mixCnt[e.id]||{};mixCnt[e.id][c]=(mixCnt[e.id][c]||0)+1;}
        if(t&&d<start&&d>=addDays(start,-7)){state.prevTail=state.prevTail||{};const L=state.prevTail[e.id]=state.prevTail[e.id]||[];
          L.push({date:d,m0:t.m0,m1:t.m1});rep.prev++;}continue;}
      if(d<start||d>end)continue;
      const v=r[j],k=e.id+'|'+d;let C=buildCtx(state);const i=C.idx[d],f=C.infos[i],wk=f.weekend||!!f.hol;
      const t=parseRange(v);let val=null;
      if(t){
        const same=C.shifts.filter(s=>s.m0===t.m0&&s.m1===t.m1),cat=guessCat(t.m0,t.m1,wk);
        let sh=same.find(s=>needFor(C,i,C.shift[covId(C,s.id)])>0)||same.find(s=>(s.cat||'')===cat);
        if(!sh){
          const mains=C.shifts.filter(s=>!s.countsAs&&s.cat===cat&&needFor(C,i,s)>0).sort((a,b)=>Math.abs(a.m0-t.m0)-Math.abs(b.m0-t.m0));
          const main=mains[0]||null;let code=`${Math.floor(t.m0/60)}-${Math.floor(t.m1/60)%24}`;
          const codes=new Set(state.shifts.map(s=>s.code));if(codes.has(code)){let n=2;while(codes.has(code+'·'+n))n++;code=code+'·'+n;}
          const ns={id:uid('s'),code,name:(main?main.name:PREF_NAME[cat].replace(/ir( um helgar)?$/,'$1').replace(/vakt$/,'vakt')),start:hhmm(t.m0),end:hhmm(t.m1),break:0,
            color:main?main.color:'#c9c3b6',demand:[0,0,0,0,0,0,0,'',''],max:'',cat,countsAs:main?main.id:''};
          state.shifts.push(ns);rep.newShifts.push(`${ns.code}: ${hhmm(t.m0)}–${hhmm(t.m1)}`+(main?` (telst sem ${main.name})`:''));C=buildCtx(state);sh=C.shift[ns.id];
        }
        val={s:sh.id};
      }else{
        const lc=v.toLowerCase(),s2=state.shifts.find(s=>s.code.toLowerCase()===lc),a2=!s2&&(state.absTypes||[]).find(a=>a.code.toLowerCase()===lc||a.name.toLowerCase()===lc);
        if(s2)val={s:s2.id};else if(a2)val={a:a2.id};
      }
      if(!val){rep.unknown.push(`${name} ${dateLabel(d)}: „${v}“`);continue;}
      if(val.s&&asWish){state.wishes=state.wishes||{};state.wishes[k]={s:val.s};rep.wishes++;rep.count++;}
      else{if(state.plan[k])rep.replaced++;state.plan[k]=val;if(val.s)state.locks[k]=true;else delete state.locks[k];rep.count++;}
      if(val.s&&empOn(e,d).status!=='active')rep.inactive.push(`${name} ${dateLabel(d)}`);
    }
  }
  if(asPrev){const all=Object.values(state.prevPlan||{}).flat().map(x=>x.date).sort();
    state.prevRange=rep.period?periodRange(rep.period.year,rep.period.month):all.length?{start:all[0],end:all[all.length-1]}:null;
    (state.employees||[]).forEach(e=>{const m=mixCnt[e.id];if(!m)return;const tot=Object.values(m).reduce((a,b)=>a+b,0);
    e.mix=Object.fromEntries(Object.entries(m).map(([c,n])=>[c,round2(n/tot)]));rep.mix=(rep.mix||0)+1;});}
  return rep;
}
/* ---------- Rúllandi plan ----------
   Vaktaskipulagið er forsendan, óskir eru settar inn, og fyrirkomulag síðasta tímabils er flutt inn eins óbreytt og hægt er.
   Hver dagur tekur mið af sama degi fyrir 4 vikum (sami vikudagur og sama helgi í tveggja vikna hrynjandi, svo helgarhópar haldast);
   ef sá dagur er utan síðasta tímabils er notað 6, 2 eða 8 vikum fyrr. '' í sniðmáti = frídagur síðast. */
function matchShiftFor(C,i,m0,m1){
  const wk=C.infos[i].weekend||!!C.infos[i].hol,same=C.shifts.filter(s=>s.m0===m0&&s.m1===m1);
  const ok=same.find(s=>needFor(C,i,C.shift[covId(C,s.id)])>0);if(ok)return ok.id;
  const cat=guessCat(m0,m1,wk),mains=C.shifts.filter(s=>!s.countsAs&&s.cat===cat&&needFor(C,i,s)>0)
    .sort((a,b)=>(Math.abs(a.m0-m0)+Math.abs(a.m1-m1))-(Math.abs(b.m0-m0)+Math.abs(b.m1-m1)));
  return mains[0]?mains[0].id:null;
}
function rollingTemplate(state){
  const C=buildCtx(state),PP=state.prevPlan||{},pr=state.prevRange,T={};let mapped=0,src=0;
  if(!pr)return {T,mapped,src};
  C.emps.forEach(e=>{const L=PP[e.id];if(!L||!L.length)return;const byD={};L.forEach(x=>{if(!byD[x.date])byD[x.date]=x;});
    C.dates.forEach((d,i)=>{for(const off of [28,42,14,56]){const sd=addDays(d,-off);if(sd<pr.start||sd>pr.end)continue;
      const x=byD[sd];if(x){src++;const id=matchShiftFor(C,i,x.m0,x.m1);if(id){T[e.id+'|'+d]=id;mapped++;}}else T[e.id+'|'+d]='';break;}});});
  return {T,mapped,src};
}
/* Hlutfall vaktategunda (flokka) hjá starfsmanni í plani tímabilsins */
function mixOf(state,e){const C=buildCtx(state),m={};let t=0;C.dates.forEach(d=>{const v=state.plan[e.id+'|'+d];if(v&&v.s&&C.shift[v.s]){const c=shiftCat(C,C.shift[v.s]);if(c){m[c]=(m[c]||0)+1;t++;}}});
  return t?Object.fromEntries(Object.entries(m).map(([c,n])=>[c,round2(n/t)])):null;}

/* ---------- Árekstrar í óskum ----------
   Greint beint út frá óskum, mönnunarþörf, föstum/læstum vöktum og reglum, án þess að raða.
   over: fleiri óska eftir vakt en pláss er; noslot: óskuð vakt er ekki í boði þann dag; rule: ósk brýtur reglu eða forsendu starfsmanns. */
function wishConflicts(state){
  const C=buildCtx(state),S=state,W=S.wishes||{},E=C.emps,over=[],noslot=[],rule=[],keys=new Set(),days=new Set(),free={};
  const minRest=C.rest,hhh=x=>round2(x/60);
  C.dates.forEach((d,i)=>{
    const slots={},slot=id=>slots[id]||(slots[id]={date:d,main:id,need:needFor(C,i,C.shift[id]),taken:0,takenBy:[],wishers:[]});
    E.forEach(e=>{
      const k=e.id+'|'+d,w=W[k],v=S.plan[k],ws=w&&w.s&&C.shift[w.s]?w.s:null,act=C.empDays[e.id][i].status==='active';
      if(v&&v.s&&C.shift[v.s]&&(S.locks[k]||(ws&&v.s===ws))){const sl=slot(covId(C,v.s));sl.taken++;sl.takenBy.push(e.name);
        if(ws)slot(covId(C,ws)).wishers.push({e,key:k,ws,granted:v.s===ws});return;}
      if(!ws){const f=e.fixedShift&&C.shift[e.fixedShift];
        if(f&&act&&!(w&&w.off)&&!(v&&v.a)&&!(e.noDays||[]).includes(C.infos[i].dow)&&needFor(C,i,C.shift[covId(C,f.id)])>0){const sl=slot(covId(C,f.id));sl.taken++;sl.takenBy.push(e.name+' (föst vakt)');}
        return;}
      if(!act)return;
      if(ws===e.fixedShift&&!(v&&v.a)){const sl=slot(covId(C,ws));sl.taken++;sl.takenBy.push(e.name+' (föst vakt)');sl.wishers.push({e,key:k,ws,granted:true,fixed:true});return;}
      slot(covId(C,ws)).wishers.push({e,key:k,ws,granted:false});
    });
    free[d]={};C.shifts.forEach(x=>{if(!x.countsAs)free[d][x.id]=needFor(C,i,x);});
    Object.values(slots).forEach(sl=>{free[d][sl.main]=sl.need-sl.taken-sl.wishers.filter(x=>!x.granted).length;});
    Object.values(slots).forEach(sl=>{
      const pend=sl.wishers.filter(x=>!x.granted),avail=sl.need-sl.taken;
      if(!pend.length)return;
      if(sl.need<=0){pend.forEach(x=>{noslot.push({date:d,main:sl.main,emp:x.e.id,name:x.e.name,key:x.key,ws:x.ws});keys.add(x.key);days.add(d);});return;}
      if(pend.length>Math.max(0,avail)){over.push({...sl,avail:Math.max(0,avail),pending:pend.length});pend.forEach(x=>keys.add(x.key));days.add(d);}
    });
  });
  // reglur og forsendur hvers starfsmanns
  E.forEach(e=>{
    const D=C.empDays[e.id],lvl=s=>prefLevel(e,shiftCat(C,s)),tgt=targetHours(C,e),maxCon=e.maxConsec===''||e.maxConsec==null||!(+e.maxConsec>0)?C.maxConsec:+e.maxConsec;
    const row=C.dates.map(d=>{const k=e.id+'|'+d,w=W[k],v=S.plan[k];
      if(w&&w.s&&C.shift[w.s])return {k,s:C.shift[w.s],wish:true,abs:v&&v.a};
      if(v&&v.s&&C.shift[v.s]&&S.locks[k])return {k,s:C.shift[v.s],wish:false};return null;});
    const add=(i,reason,fix)=>{const x=row[i];rule.push({date:C.dates[i],emp:e.id,name:e.name,key:x?x.k:null,ws:x&&x.s.id,reason,fix});if(x)keys.add(x.k);};
    let hrs=0,run=prevRunOf(S,e),told=false,wk=new Set();
    row.forEach((x,i)=>{
      if(!x){run=0;told=false;return;}
      hrs+=x.s.hours;
      if(x.wish){
        if(D[i].status!=='active')add(i,`er í ${STATUS_NAMES[D[i].status].toLowerCase()} þennan dag`);
        else if(x.abs)add(i,'er með skráða fjarvist þennan dag');
        if(lvl(x.s)===0)add(i,`er merkt „Ekki“ við ${(PREF_NAME[shiftCat(C,x.s)]||'').toLowerCase()}`,'level');
        if((e.noDays||[]).includes(C.infos[i].dow))add(i,`vinnur að jafnaði ekki á ${DAYS_PL[C.infos[i].dow]}`);
        const rb=empRuleBlock(C,e,i,x.s);if(rb)add(i,rb,'emp');
      }
      if(C.R.noAfterNight!==false&&x.s.m1>1440&&row[i+1]&&row[i+1].s.m1<=1440&&(x.wish||row[i+1].wish))add(i,`vakt ${dateLabel(C.dates[i+1])} sama dag og næturvakt lýkur`);
      for(let j=i+1;j<=Math.min(C.n-1,i+2);j++){const y=row[j];if(y){const gap=(j*1440+y.s.m0)-(i*1440+x.s.m1);
        if(gap<minRest&&(x.wish||y.wish))add(i,`aðeins ${hhh(gap)} klst. hvíld fram að ${y.s.code} ${dateLabel(C.dates[j])}`);break;}}
      run++;if(run>maxCon&&!told&&(told=true))add(i,`${run} vinnudagar í röð${i<maxCon?' (með síðustu dögum fyrra tímabils)':''}, hámark ${maxCon}`);
      if(C.infos[i].dow>=5)wk.add(isoWeek(C.dates[i]));
    });
    if(e.maxWeekends!==''&&e.maxWeekends!=null&&wk.size>+e.maxWeekends)rule.push({emp:e.id,name:e.name,reason:`óskar eftir ${wk.size} helgum en hámark er ${e.maxWeekends}`,fix:'emp'});
    const mo=e.maxOver===''||e.maxOver==null||isNaN(+e.maxOver)?C.maxOver:+e.maxOver;
    if(hrs>tgt+mo+1e-6)rule.push({emp:e.id,name:e.name,reason:`óskir eru ${fmtNum(hrs)} klst. en vinnuskylda ${fmtNum(tgt)}${mo?` (+${fmtNum(mo)} leyfilegt umfram)`:''}`,fix:'emp'});
    if(+e.maxWeekHours>0){const W={};row.forEach((x,i)=>{if(x){const k=isoWeek(C.dates[i]);W[k]=(W[k]||0)+x.s.hours;}});
      Object.entries(W).filter(([k,h])=>h>+e.maxWeekHours+1e-6).forEach(([k,h])=>rule.push({emp:e.id,name:e.name,reason:`óskir í viku ${k} eru ${fmtNum(h)} klst. en hámark ${fmtNum(e.maxWeekHours)} klst. á viku`,fix:'emp'}));}
  });
  return {over,noslot,rule,keys,days,free,count:over.length+noslot.length+rule.length};
}
/* Veita ósk: setja vaktina inn læsta og losa ólæstar vaktir á sama plássi ef það yfirfyllist */
function grantWish(state,key){
  const w=(state.wishes||{})[key];if(!w||!w.s)return false;
  state.plan[key]={s:w.s};state.locks[key]=true;
  const C=buildCtx(state),d=key.split('|')[1],i=C.idx[d],main=covId(C,w.s),need=needFor(C,i,C.shift[main]);
  const on=C.emps.map(e=>e.id+'|'+d).filter(k=>{const v=state.plan[k];return v&&v.s&&C.shift[v.s]&&covId(C,v.s)===main;});
  let extra=on.length-need;
  for(const k of on){if(extra<=0)break;const ow=(state.wishes||{})[k];if(k!==key&&!state.locks[k]&&!(ow&&ow.s===state.plan[k].s)){delete state.plan[k];extra--;}}
  return true;
}

/* Manna lausar vaktir án þess að hrófla við því sem er komið: allar núverandi vaktir haldast.
   1. umferð virðir hámark umfram vinnuskyldu; 2. umferð (relax) leyfir aukatíma ef enn vantar. */
function fillPlan(state,opts={}){
  // 1) innan vinnuskyldu  2) tímavinnufólk (ef leyft)  3) aukatími fastráðinna ef enn vantar
  const before=state.plan,g=(T)=>generate(T,{runs:opts.runs??160,ms:opts.ms??1000,seed:opts.seed,template:opts.template,templateSoft:opts.templateSoft});
  const mk=(plan)=>{const T=JSON.parse(JSON.stringify(state));if(plan)T.plan=plan;T.locks=T.locks||{};
    for(const [k,v] of Object.entries(T.plan))if(v.s)T.locks[k]=true;T.rules={...T.rules,fillUp:false};return T;};
  let r=g(mk()),plan=r.plan,hourly=0,extra=0;
  if(r.unfilled&&opts.useHourly){const T=mk(plan),ids=[];
    T.employees.forEach(e=>{if(e.status==='off'||e.status==='leave')return;const D=periodDates(T.period).map(d=>empOn(e,d));
      if(D.some(x=>x.status==='hourly')){ids.push(e.id);e.status='active';e.changes=[];e.pct=0;e.fixedTarget=0;e.maxOver=60;e.onlyWishes=false;}});
    if(ids.length){const r3=g(T);hourly=Object.keys(r3.plan).filter(k=>r3.plan[k].s&&!(plan[k]&&plan[k].s)&&ids.includes(k.split('|')[0])).length;plan=r3.plan;r=r3;}}
  if(r.unfilled&&opts.relax!==false){const T=mk(plan);T.rules.maxOver=999;
    const r2=g(T);extra=Object.keys(r2.plan).filter(k=>r2.plan[k].s&&!(plan[k]&&plan[k].s)).length;plan=r2.plan;r=r2;}
  const added=Object.keys(plan).filter(k=>plan[k].s&&!(before[k]&&before[k].s===plan[k].s));
  return {plan,added,overtime:extra,hourly,unfilled:r.unfilled,holes:r.holes};
}

const API={rollingTemplate,matchShiftFor,mixOf,WEEKEND_PATTERNS,PRIO_SCOPES,weekendIdx,weekendDates,empRuleBlock,fillPlan,wishConflicts,grantWish,PREF_LEVELS,PRIORITY_NAMES,prefLevel,shiftCat,PREF_CATS,PREF_NAME,STATUS_NAMES,guessCat,empOn,allowedIds,covId,dailyOf,importTable,parseCsv,fmtNum,todayLabel,pad,iso,parse,addDays,dow,diffDays,toMin,fmtTime,round2,isoWeek,periodRange,periodDates,periodLabel,dateLabel,shortDate,
  MONTHS,DAYS,DAYS_PL,DAYS_SHORT,DAYS_1,CATS,CAT_NAMES,easter,icelandicHolidays,holidaysForPeriod,shiftTimes,buildCtx,targetHours,absenceCredit,
  shiftCats,needFor,generate,stats,validate};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VP=API;
})(typeof window!=='undefined'?window:globalThis);

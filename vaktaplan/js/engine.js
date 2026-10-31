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
const DAYS_SHORT=['mán','þri','mið','fim','fös','lau','sun'];
const DAYS_1=['M','Þ','M','F','F','L','S'];
const CATS=['day','evening','night','weekend','red','major'];
const CAT_NAMES={day:'Dagvinna',evening:'Kvöld',night:'Nótt',weekend:'Helgar',red:'Rauðir dagar',major:'Stórhátíðir'};
/* Flokkar vakta sem starfsfólk velur sér (óskir) */
const PREF_CATS=[['morning','Morgunvaktir'],['evening','Kvöldvaktir'],['weekendMorning','Morgunvaktir um helgar'],['weekendMid','Millivaktir um helgar'],['weekendEvening','Kvöldvaktir um helgar'],['night','Næturvaktir']];
const PREF_NAME=Object.fromEntries(PREF_CATS);
const STATUS_NAMES={active:'Í starfi',hourly:'Tímavinna',leave:'Í leyfi'};
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
  const emps=allEmps.filter(e=>empDays[e.id].some(x=>x.status==='active'));
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
function allowedIds(C,e){
  if(e.prefs&&e.prefs.length){const P=new Set(e.prefs);return new Set(C.shifts.filter(s=>{const m=C.shift[covId(C,s.id)];const c=s.cat||(m&&m.cat);return !c||P.has(c);}).map(s=>s.id));}
  if(e.allowed&&e.allowed.length)return new Set(e.allowed);
  return new Set(C.shifts.map(s=>s.id));
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
  const target=E.map(e=>targetHours(C,e));
  const credit=E.map((e,ei)=>C.dates.reduce((s,d,i)=>{const v=S.plan[e.id+'|'+d];return s+(v&&v.a?absenceCredit(C,e,i,v.a):0);},0));
  const pctf=E.map(e=>Math.max(C.empDays[e.id].reduce((a,x)=>Math.max(a,x.status==='active'?x.pct:0),0)/100,0.05));
  const allowed=E.map(e=>allowedIds(C,e));
  const avail=E.map(e=>C.empDays[e.id].map(x=>x.status==='active'));
  const noDays=E.map(e=>new Set(e.noDays||[]));
  const nightOk=E.map((e,ei)=>C.shifts.some(s=>s.isNight&&allowed[ei].has(s.id)));
  const need=C.dates.map((d,i)=>C.shifts.map(s=>needFor(C,i,s)));
  return {wishes,target,credit,pctf,allowed,avail,noDays,nightOk,need};
}
function runOnce(C,P,rnd,noise,pace){
  const S=C.state,E=C.emps,N=C.n,SH=C.shifts,shIdx={};SH.forEach((s,j)=>shIdx[s.id]=j);
  const grid=E.map(e=>C.dates.map(d=>{const k=e.id+'|'+d,v=S.plan[k];if(!v)return null;
    if(v.a)return {a:v.a};if(v.s&&S.locks[k]&&C.shift[v.s])return {s:v.s,lock:true};return null;}));
  const hours=P.credit.slice(),wk=E.map(()=>0),nt=E.map(()=>0),cnt=C.dates.map(()=>SH.map(()=>0));
  const isWk=i=>C.infos[i].weekend||!!C.infos[i].hol;
  grid.forEach((row,ei)=>row.forEach((c,i)=>{if(c&&c.s){const s=C.shift[c.s];hours[ei]+=s.hours;cnt[i][shIdx[covId(C,c.s)]]++;if(isWk(i))wk[ei]++;if(s.isNight)nt[ei]++;}}));
  let unfilled=0,softViol=0;const holes=[];
  const can=(ei,i,sh,tol)=>{
    const row=grid[ei];if(row[i])return false;
    if(!P.avail[ei][i]||!P.allowed[ei].has(sh.id)||P.noDays[ei].has(C.infos[i].dow))return false;
    const w=P.wishes[ei][i];if(w&&w.off&&C.hardWish)return false;
    const st=i*1440+sh.m0,en=i*1440+sh.m1;
    for(let j=Math.max(0,i-2);j<i;j++){const p=row[j];if(p&&p.s&&j*1440+C.shift[p.s].m1+C.rest>st)return false;}
    for(let j=i+1;j<=Math.min(N-1,i+2);j++){const q=row[j];if(q&&q.s&&en+C.rest>j*1440+C.shift[q.s].m0)return false;}
    let run=1;for(let j=i-1;j>=0&&row[j]&&row[j].s;j--)run++;for(let j=i+1;j<N&&row[j]&&row[j].s;j++)run++;
    if(run>C.maxConsec)return false;
    if(hours[ei]+sh.hours>P.target[ei]+(tol??C.maxOver)+1e-6)return false;
    if(pace&&tol==null&&hours[ei]+sh.hours>P.target[ei]*(i+1)/N+pace)return false;
    return true;
  };
  const score=(ei,i,sh)=>{
    const row=grid[ei],t=P.target[ei]||1;
    let s=(hours[ei]/t)*100;
    const after=hours[ei]+sh.hours;if(after>P.target[ei])s+=(after-P.target[ei])*12;
    const w=P.wishes[ei][i];
    if(w){if(w.off)s+=400;else if(w.s===sh.id)s-=250;else if(w.s)s+=60;}
    if(isWk(i))s+=wk[ei]/P.pctf[ei]*7;
    if(sh.isNight)s+=nt[ei]/P.pctf[ei]*5;
    const p=i>0?row[i-1]:null;
    if(p&&p.s===sh.id)s-=6;                     // samfella í sömu vakt
    else if(p&&p.s&&C.shift[p.s].isNight&&!sh.isNight)s+=10;
    if(i>1&&!p&&row[i-2]&&row[i-2].s)s+=5;      // forðast stakan frídag
    const f=C.infos[i];if(f.dow===6&&p&&p.s)s-=10; // helgi saman
    if(f.dow===5&&i<N-1&&row[i+1]&&row[i+1].s)s-=10;
    return s+rnd()*noise;
  };
  const assign=(ei,i,sh)=>{grid[ei][i]={s:sh.id};hours[ei]+=sh.hours;cnt[i][shIdx[covId(C,sh.id)]]++;if(isWk(i))wk[ei]++;if(sh.isNight)nt[ei]++;
    const w=P.wishes[ei][i];if(w&&w.off)softViol++;};
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
      const order=E.map((e,ei)=>ei).filter(ei=>P.target[ei]-hours[ei]>=minH*0.75).sort((a,b)=>(hours[a]-P.target[a])-(hours[b]-P.target[b]));
      for(const ei of order){
        let best=null,bs=Infinity;
        for(let i=0;i<N;i++)SH.forEach((sh,j)=>{
          if(P.need[i][j]<=0)return;
          if(sh.max!==''&&sh.max!=null&&cnt[i][j]>=+sh.max)return;
          if(!can(ei,i,sh,Math.min(C.maxOver,sh.hours/2)))return;
          const sc=cnt[i][j]/P.need[i][j]*10+(isWk(i)?3:0)+score(ei,i,sh)/50+rnd()*noise/3;
          if(sc<bs){bs=sc;best={i,sh};}
        });
        if(best){assign(ei,best.i,best.sh);changed=true;}
      }
    }
  }
  // heildarmat
  let dev=0;E.forEach((e,ei)=>{const d=hours[ei]-P.target[ei];dev+=d*d;});
  const spread=(arr,mask)=>{const v=arr.map((x,ei)=>x/P.pctf[ei]).filter((_,ei)=>mask(ei));if(v.length<2)return 0;const m=v.reduce((a,b)=>a+b,0)/v.length;return v.reduce((a,b)=>a+(b-m)*(b-m),0);};
  let blocks=0;grid.forEach(row=>row.forEach((c,i)=>{if(c&&c.s&&!(row[i-1]&&row[i-1].s)&&!(row[i+1]&&row[i+1].s))blocks++;}));
  const holeDays={};holes.forEach(h=>holeDays[h.i]=(holeDays[h.i]||0)+h.missing);
  const clump=Object.values(holeDays).reduce((a,b)=>a+b*b,0);
  const sc=unfilled*10000+clump*40+dev+softViol*300+spread(wk,()=>true)*4+spread(nt,ei=>P.nightOk[ei])*3+blocks*2;
  return {grid,score:sc,unfilled,holes};
}
function generate(state,opts={}){
  const C=buildCtx(state),P=prepare(C);
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
  return {plan,unfilled:best.unfilled,holes:best.holes.map(h=>({date:C.dates[h.i],shift:h.shift,missing:h.missing})),runs:tried,score:best.score};
}

/* ---------- Tölfræði ---------- */
function stats(state){
  const C=buildCtx(state),S=state;
  const emp=C.emps.map(e=>{
    const o={id:e.id,name:e.name,pct:+e.pct||0,target:targetHours(C,e),carry:+e.carry||0,shifts:0,worked:0,credit:0,
      cats:Object.fromEntries(CATS.map(c=>[c,0])),byShift:{},abs:{},weekendDays:0,weekends:0,nights:0,holidayShifts:0,wishOff:0,wishOffKept:0,wishShift:0,wishShiftKept:0};
    const wkSet=new Set();
    C.dates.forEach((d,i)=>{
      const k=e.id+'|'+d,v=S.plan[k],w=(S.wishes||{})[k];
      if(v&&v.s&&C.shift[v.s]){const sh=C.shift[v.s];o.shifts++;o.worked+=sh.hours;o.byShift[v.s]=(o.byShift[v.s]||0)+1;
        const c=shiftCats(C,d,v.s);for(const x of CATS)o.cats[x]+=c[x];
        const f=C.infos[i];if(f.weekend){o.weekendDays++;wkSet.add(isoWeek(d));}
        if(f.hol)o.holidayShifts++;if(sh.isNight)o.nights++;}
      if(v&&v.a){o.abs[v.a]=(o.abs[v.a]||0)+1;o.credit+=absenceCredit(C,e,i,v.a);}
      if(w&&w.off){o.wishOff++;if(!(v&&v.s))o.wishOffKept++;}
      if(w&&w.s){o.wishShift++;if(v&&v.s===w.s)o.wishShiftKept++;}
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
  const hourly=C.allEmps.filter(e=>!C.emps.includes(e)).map(e=>({id:e.id,name:e.name,status:C.empDays[e.id][C.n-1].status}));
  return {C,emp,days,tot,hourly,workdays:C.workdays,holReduction:C.holReduction,effWorkdays:C.effWorkdays};
}

/* ---------- Yfirferð ---------- */
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
    let run=0,runStart=0;
    row.forEach((c,i)=>{
      const d=C.dates[i],w=(S.wishes||{})[e.id+'|'+d];
      if(c&&c.s&&C.shift[c.s]){
        const sh=C.shift[c.s];
        if(run===0)runStart=i;run++;
        if(run===C.maxConsec+1)out.push({level:'warn',type:'consec',emp:e.id,date:C.dates[runStart],msg:`${e.name}: fleiri en ${C.maxConsec} vinnudagar í röð frá ${dateLabel(C.dates[runStart])}`});
        for(let j=i+1;j<=Math.min(N-1,i+2);j++){const q=row[j];if(q&&q.s&&C.shift[q.s]){const gap=(j*1440+C.shift[q.s].m0)-(i*1440+sh.m1);
          if(gap<C.rest)out.push({level:'warn',type:'rest',emp:e.id,date:d,msg:`${e.name}: aðeins ${round2(gap/60)} klst. hvíld milli ${sh.code} (${dateLabel(d)}) og ${C.shift[q.s].code} (${dateLabel(C.dates[j])})`});break;}}
        if(D[i].status!=='active')out.push({level:'warn',type:'status',emp:e.id,date:d,msg:`${e.name} er á vakt ${dateLabel(d)} en er skráð í ${STATUS_NAMES[D[i].status].toLowerCase()} þann dag`});
        if(!allowed.has(c.s))out.push({level:'warn',type:'allowed',emp:e.id,date:d,msg:`${e.name}: ${sh.name} ${dateLabel(d)} er ekki á lista yfir vaktir starfsmanns`});
        if(noD.has(C.infos[i].dow))out.push({level:'warn',type:'noday',emp:e.id,date:d,msg:`${e.name} vinnur að jafnaði ekki á ${DAYS[C.infos[i].dow]}um (${dateLabel(d)})`});
        if(w&&w.off)out.push({level:'warn',type:'wish',emp:e.id,date:d,msg:`${e.name}: á vakt þrátt fyrir ósk um frí ${dateLabel(d)}`});
      }else run=0;
      if(w&&w.s&&!(c&&c.s===w.s)&&C.shift[w.s])out.push({level:'info',type:'wishshift',emp:e.id,date:d,msg:`${e.name}: ósk um ${C.shift[w.s].name} ${dateLabel(d)} ekki uppfyllt`});
    });
  });
  const st=stats(state),tol=+S.rules.hourTolerance||4;
  st.emp.forEach(o=>{if(Math.abs(o.diff)>tol)out.push({level:'warn',type:'hours',emp:o.id,msg:`${o.name}: ${o.diff>0?'+':''}${round2(o.diff)} klst. miðað við vinnuskyldu (${round2(o.total)} af ${round2(o.target)})`});});
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
  const rep={period:null,count:0,replaced:0,newEmps:[],newShifts:[],unknown:[],inactive:[]};
  // tímabil úr skjalinu, t.d. „16.11.2026 - 15.12.2026“
  for(const r of rows)for(const c of r){const m=c.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if(m&&!rep.period&&+m[1]===16){rep.period={year:+m[3],month:+m[2]};}}
  if(rep.period&&(rep.period.year!==state.period.year||rep.period.month!==state.period.month)&&opts.setPeriod!==false){
    const custom=(state.holidays||[]).filter(h=>h.custom);state.period=rep.period;const {start,end}=periodRange(rep.period.year,rep.period.month);
    const auto=holidaysForPeriod(rep.period),ad=new Set(auto.map(h=>h.date));
    state.holidays=[...auto,...custom.filter(h=>h.date>=start&&h.date<=end&&!ad.has(h.date))].sort((a,b)=>a.date<b.date?-1:1);rep.periodChanged=true;}
  const {start,end}=periodRange(state.period.year,state.period.month),sy=+start.slice(0,4),ey=+end.slice(0,4);
  const dateOf=c=>{let m=c.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return `${m[1]}-${m[2]}-${m[3]}`;
    m=c.match(/^(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?(?![\d:])/);if(!m)return null;const d=+m[1],mo=+m[2];if(d<1||d>31||mo<1||mo>12)return null;
    if(m[3]){let y=+m[3];if(y<100)y+=2000;return `${y}-${pad(mo)}-${pad(d)}`;}
    for(const y of [sy,ey]){const x=`${y}-${pad(mo)}-${pad(d)}`;if(x>=start&&x<=end)return x;}return `${sy}-${pad(mo)}-${pad(d)}`;};
  let hi=-1,best=0;rows.forEach((r,i)=>{const n=r.filter(c=>c&&!/\d{4}\s*[-–]/.test(c)&&dateOf(c)).length;if(n>best){best=n;hi=i;}});
  if(hi<0||best<3)throw Error('Fann ekki línu með dagsetningum (t.d. „16.11 mán.“) í skjalinu.');
  const cols={};rows[hi].forEach((c,j)=>{const d=c&&dateOf(c);if(d)cols[j]=d;});
  const firstCol=Math.min(...Object.keys(cols).map(Number));
  let nameCol=-1,nb=0;for(let j=0;j<firstCol;j++){const n=rows.slice(hi+1).filter(r=>r[j]&&/[a-zA-Z\u00C0-\u00FF]/.test(r[j])).length;if(n>nb){nb=n;nameCol=j;}}
  if(nameCol<0)throw Error('Fann ekki dálk með nöfnum starfsfólks vinstra megin við dagsetningarnar.');
  const byName={};(state.employees||[]).forEach(e=>byName[normName(e.name)]=e);
  for(const r of rows.slice(hi+1)){
    const name=r[nameCol];if(!name||!/[a-zA-Z\u00C0-\u00FF]/.test(name))continue;
    let e=byName[normName(name)];
    const cells=Object.entries(cols).filter(([j])=>r[j]);
    if(!e){if(!cells.length&&opts.addEmpty===false)continue;
      e={id:uid('e'),name,title:'',pct:0,status:'active',prefs:[],changes:[],allowed:[],noDays:[],carry:0,fixedTarget:'',weekly:'',note:'Bætt við úr innlestri. Skráðu starfshlutfall.'};
      state.employees.push(e);byName[normName(name)]=e;rep.newEmps.push(name);}
    for(const [j,d] of cells){
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
      if(state.plan[k])rep.replaced++;
      state.plan[k]=val;if(val.s)state.locks[k]=true;else delete state.locks[k];rep.count++;
      if(val.s&&empOn(e,d).status!=='active')rep.inactive.push(`${name} ${dateLabel(d)}`);
    }
  }
  return rep;
}

const API={PREF_CATS,PREF_NAME,STATUS_NAMES,guessCat,empOn,allowedIds,covId,dailyOf,importTable,parseCsv,fmtNum,todayLabel,pad,iso,parse,addDays,dow,diffDays,toMin,fmtTime,round2,isoWeek,periodRange,periodDates,periodLabel,dateLabel,shortDate,
  MONTHS,DAYS,DAYS_SHORT,DAYS_1,CATS,CAT_NAMES,easter,icelandicHolidays,holidaysForPeriod,shiftTimes,buildCtx,targetHours,absenceCredit,
  shiftCats,needFor,generate,stats,validate};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VP=API;
})(typeof window!=='undefined'?window:globalThis);

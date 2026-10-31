'use strict';
/* Vaktaplan · PDF-útgáfa með jsPDF (../vendor/jspdf.umd.min.js) og íslenskum leturgerðum (../vendor/pdf-fonts.js). */
(function(){
/* Leturgerðirnar liggja við hliðina á jsPDF-skránni, hvar sem hún er. */
const FONT_SRC=(()=>{const j=[...document.scripts].find(s=>/jspdf\.umd(\.min)?\.js/.test(s.src));return j?j.src.replace(/jspdf\.umd(\.min)?\.js.*$/,'pdf-fonts.js'):'../vendor/pdf-fonts.js';})();
function loadFonts(){
  if(window.NASA_PDF_FONTS)return Promise.resolve(true);
  return new Promise(ok=>{const s=document.createElement('script');s.src=FONT_SRC;s.onload=()=>ok(!!window.NASA_PDF_FONTS);s.onerror=()=>ok(false);document.head.appendChild(s);});
}
const latin1=s=>String(s??'').replace(/[„“”]/g,'"').replace(/[‘’]/g,"'").replace(/[–—−]/g,'-').replace(/…/g,'...').replace(/★/g,'*').replace(/[^\x00-\xFF]/g,'');
const uni=s=>String(s??'').replace(/★/g,'*');
const rgb=h=>{h=(h||'#cccccc').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};
const light=(h,a=0.55)=>rgb(h).map(c=>Math.round(c+(255-c)*a));
const dark=h=>{const [r,g,b]=rgb(h);return (r*299+g*587+b*114)/1000<150;};
const fmt=(n,d=1)=>VP.fmtNum(n,d);
const fmtS=(n,d=1)=>(n>0.005?'+':'')+fmt(n,d);
const INK='#1f3a40',MUTED='#667a7c',LINE='#c9d3d1',WK='#eef1f0',RED='#fbe1de',REDT='#b3261e',MAJ='#e8a19a',MAJT='#7a0f0a';

async function writer(format='a4',orientation='landscape'){
  if(!window.jspdf?.jsPDF)throw Error('PDF-safnið (jsPDF) hlóðst ekki.');
  const doc=new window.jspdf.jsPDF({unit:'mm',format,orientation,compress:true});
  let FAM='helvetica',SAFE=latin1;
  if(await loadFonts()){const F=window.NASA_PDF_FONTS;
    for(const st of ['normal','bold','italic','bolditalic']){doc.addFileToVFS('vp-'+st+'.ttf',F[st]);doc.addFont('vp-'+st+'.ttf','VPSans',st);}
    FAM='VPSans';SAFE=uni;}
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
  const w={doc,W,H,M:10};
  w.font=(style='normal',size=9,color=INK)=>{doc.setFont(FAM,style);doc.setFontSize(size);doc.setTextColor(...(Array.isArray(color)?color:rgb(color)));};
  w.text=(s,x,y,o)=>doc.text(SAFE(s),x,y,o);
  w.fit=(s,maxW)=>{s=SAFE(s);if(doc.getTextWidth(s)<=maxW)return s;while(s.length>1&&doc.getTextWidth(s+'…')>maxW)s=s.slice(0,-1);return s+'…';};
  w.rect=(x,y,ww,h,fill,stroke)=>{if(fill)doc.setFillColor(...(Array.isArray(fill)?fill:rgb(fill)));if(stroke){doc.setDrawColor(...rgb(stroke));doc.setLineWidth(0.15);}
    doc.rect(x,y,ww,h,fill&&stroke?'FD':fill?'F':'S');};
  w.line=(x1,y1,x2,y2,c=LINE,lw=0.15)=>{doc.setDrawColor(...rgb(c));doc.setLineWidth(lw);doc.line(x1,y1,x2,y2);};
  w.cellText=(s,x,y,cw,ch,{align='center',size=7,style='normal',color=INK}={})=>{w.font(style,size,color);const t=w.fit(s,cw-1.2);
    const ty=y+ch/2+size*0.3528*0.35;if(align==='center')w.text(t,x+cw/2,ty,{align:'center'});else if(align==='right')w.text(t,x+cw-0.8,ty,{align:'right'});else w.text(t,x+0.9,ty);};
  w.footer=(label)=>{const n=doc.getNumberOfPages();for(let p=1;p<=n;p++){doc.setPage(p);w.font('normal',7,MUTED);
    w.text(label,w.M,H-5);w.text(`Síða ${p} af ${n}`,W-w.M,H-5,{align:'right'});}};
  return w;
}
function header(w,S,title,sub){
  const {doc,W,M}=w;
  w.font('bold',15,INK);w.text(title,M,M+5);
  w.font('normal',9,MUTED);w.text([S.workplace.name,S.workplace.unit].filter(Boolean).join(' · ')+(sub?'  ·  '+sub:''),M,M+10.5);
  w.font('normal',8,MUTED);w.text('Útbúið '+VP.todayLabel()+(S.workplace.manager?' · '+S.workplace.manager:''),W-M,M+5,{align:'right'});
  w.line(M,M+13,W-M,M+13,INK,0.4);
  return M+17;
}
function legend(w,S,C,y,{abs=true,hol=true}={}){
  const {M,W}=w;let x=M;const h=4.4;
  const chip=(code,label,fill,tc)=>{w.font('bold',7);const cw=Math.max(5,w.doc.getTextWidth(code)+2.4);w.font('normal',7);const lw=w.doc.getTextWidth(label)+3;
    if(x+cw+lw>W-M){x=M;y+=h+1.5;}w.rect(x,y,cw,h,fill,LINE);w.cellText(code,x,y,cw,h,{style:'bold',color:tc});w.font('normal',7,INK);w.text(label,x+cw+1,y+h*0.72);x+=cw+lw+2;};
  C.shifts.forEach(s=>chip(s.code,`${s.name} ${s.start}–${s.end} (${fmt(s.hours,2)} klst.)`,s.color,dark(s.color)?'#ffffff':INK));
  if(abs)S.absTypes.forEach(a=>chip(a.code,a.name,a.color,dark(a.color)?'#ffffff':INK));
  if(hol){chip('*','Stórhátíðardagur',MAJ,MAJT);chip(' ','Rauður dagur',RED,REDT);chip(' ','Helgi',WK,INK);}
  return y+h+3;
}
const dayFill=f=>f.hol?(f.hol.kind==='major'?MAJ:RED):f.weekend?WK:null;
const save=(w,name)=>window.VPDownload?window.VPDownload(name,w.doc.output('blob'),'application/pdf'):w.doc.save(name);
const slug=S=>(S.workplace.name||'vaktaplan').toLowerCase().replace(/ð/g,'d').replace(/þ/g,'th').replace(/æ/g,'ae').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'')+'-'+VP.periodRange(S.period.year,S.period.month).start.slice(0,7);

/* ---------- Allt planið ---------- */
async function full(S,opts={}){
  const st=VP.stats(S),C=st.C,n=C.n,E=C.emps;
  const big=E.length>32||n>31&&E.length>24;
  const w=await writer(big?'a3':'a4','landscape'),{doc,W,H,M}=w;
  const nameW=40,sumW=[10,12,12,12],sumT=sumW.reduce((a,b)=>a+b,0),dayW=(W-2*M-nameW-sumT)/n,rowH=E.length>24?4.6:5.4,headH=8.5;
  const title='Vaktaplan',sub=VP.periodLabel(S.period);
  let y=header(w,S,title,sub);y=legend(w,S,C,y);
  const drawHead=y=>{
    w.rect(M,y,nameW,headH,'#ffffff',LINE);w.cellText('Starfsmaður',M,y,nameW,headH,{align:'left',style:'bold',size:7.5});
    C.dates.forEach((d,i)=>{const f=C.infos[i],x=M+nameW+i*dayW,fill=dayFill(f)||'#ffffff',tc=f.hol?(f.hol.kind==='major'?MAJT:REDT):INK;
      w.rect(x,y,dayW,headH,fill,LINE);w.font('normal',5.6,tc);w.text(VP.DAYS_1[f.dow],x+dayW/2,y+3,{align:'center'});
      w.font('bold',6.6,tc);w.text(String(VP.parse(d).getUTCDate())+(f.hol&&f.hol.kind==='major'?'*':''),x+dayW/2,y+6.8,{align:'center'});});
    let x=M+nameW+n*dayW;['Vaktir','Klst.','Skylda','Útist.'].forEach((t,j)=>{w.rect(x,y,sumW[j],headH,'#ffffff',LINE);w.cellText(t,x,y,sumW[j],headH,{style:'bold',size:6.5});x+=sumW[j];});
    return y+headH;
  };
  y=drawHead(y);
  const covH=4.2,bottom=H-12;
  E.forEach((e,ri)=>{
    if(y+rowH>bottom-(ri===E.length-1?C.shifts.length*covH:0)){doc.addPage();y=header(w,S,title,sub+' · framhald');y=drawHead(y);}
    const o=st.emp.find(x=>x.id===e.id);
    w.rect(M,y,nameW,rowH,ri%2?'#fafbfb':'#ffffff',LINE);
    w.font('bold',7,INK);w.text(w.fit(e.name,nameW-11),M+0.9,y+rowH*0.66);w.font('normal',6,MUTED);w.text(fmt(o.pctMax)+'%',M+nameW-0.8,y+rowH*0.66,{align:'right'});
    C.dates.forEach((d,i)=>{const x=M+nameW+i*dayW,v=S.plan[e.id+'|'+d],f=C.infos[i];
      if(v&&v.s&&C.shift[v.s]){const s=C.shift[v.s];w.rect(x,y,dayW,rowH,s.color,LINE);w.cellText(s.code,x,y,dayW,rowH,{style:'bold',size:s.code.length>3?4.6:s.code.length>2?5.6:6.6,color:dark(s.color)?'#ffffff':INK});}
      else if(v&&v.a&&C.abs[v.a]){const a=C.abs[v.a];w.rect(x,y,dayW,rowH,a.color,LINE);w.cellText(a.code,x,y,dayW,rowH,{size:6,color:dark(a.color)?'#ffffff':INK});}
      else{const fl=dayFill(f);w.rect(x,y,dayW,rowH,fl?light(fl,0.35):'#ffffff',LINE);}
    });
    let x=M+nameW+n*dayW;const vals=[String(o.shifts),fmt(o.total),fmt(o.target),fmt(o.outstanding)];
    vals.forEach((t,j)=>{w.rect(x,y,sumW[j],rowH,'#ffffff',LINE);w.cellText(t,x,y,sumW[j],rowH,{size:6.6,align:'right',style:j===3?'bold':'normal',color:j===3&&o.outstanding<-(+S.rules.hourTolerance||0)?REDT:INK});x+=sumW[j];});
    y+=rowH;
  });
  // mönnun
  y+=1;
  C.shifts.filter(s=>!s.countsAs).forEach(s=>{
    if(y+covH>bottom){doc.addPage();y=header(w,S,title,sub+' · framhald');y=drawHead(y);}
    w.rect(M,y,nameW,covH,light(s.color,0.6),LINE);w.cellText(`Mönnun ${s.code} (mannað/þörf)`,M,y,nameW,covH,{align:'left',size:5.8});
    st.days.forEach((r,i)=>{const x=M+nameW+i*dayW,c=r.shifts[s.id];w.rect(x,y,dayW,covH,c.have<c.need?'#fbe1de':'#ffffff',LINE);
      if(c.need||c.have)w.cellText(c.have+'/'+c.need,x,y,dayW,covH,{size:4.9,color:c.have<c.need?REDT:MUTED,style:c.have<c.need?'bold':'normal'});});
    y+=covH;
  });
  // frídagar
  const hol=S.holidays.filter(h=>C.idx[h.date]!=null);
  if(hol.length){y+=4;if(y+6>bottom){doc.addPage();y=header(w,S,title,sub);}
    w.font('bold',7.5,INK);w.text('Frídagar á tímabilinu:',M,y);w.font('normal',7.5,INK);
    w.text(hol.map(h=>`${VP.dateLabel(h.date)} ${h.name}${h.from?' (frá kl. '+h.from+')':''} – ${h.kind==='major'?'stórhátíðardagur':'rauður dagur'}`).join('   ·   '),M+31,y,{maxWidth:W-2*M-31});}
  if(opts.stats)statsPages(w,S,st,title,sub);
  w.footer(`${S.workplace.name||'Vaktaplan'} · ${VP.periodLabel(S.period)}`);
  await save(w,slug(S)+'-heildarplan.pdf');
}
function statsPages(w,S,st,title,sub){
  const {doc,W,H,M}=w,R=S.rules,C=st.C;doc.addPage();let y=header(w,S,'Útreikningar',sub);
  w.font('normal',8,MUTED);
  w.text(`Vinnuskylda: ${C.workdays} virkir dagar${C.holReduction?' − '+fmt(C.holReduction)+' frídagar á virkum degi':''} = ${fmt(C.effWorkdays)} dagar × ${fmt(C.daily,2)} klst. í 100% starfi = ${fmt(C.effWorkdays*C.daily)} klst. Dagvinna ${R.dayStart}–${R.dayEnd}, kvöld til ${R.eveningEnd}.`,M,y);y+=5;
  const cols=[['Starfsmaður',44,'l'],['Hlutf.',12],['Skylda',15],['Vaktir',12],['Á vöktum',16],['Fjarv.',14],['Samtals',16],['Útist.',14],['Flutt',13],['Staða',14],
    ...VP.CATS.map(c=>[VP.CAT_NAMES[c]+(c!=='day'?` ${fmt(R.rates[c],2)}%`:''),c==='day'?15:17]),['Álagsst.',15]];
  const tw=cols.reduce((a,c)=>a+c[1],0),sc=(W-2*M)/tw;cols.forEach(c=>c[1]*=sc);
  const rh=5.4,drawH=()=>{let x=M;cols.forEach(([t,cw,al])=>{w.rect(x,y,cw,8,'#e9efee',LINE);w.font('bold',6.3,INK);
    const lines=doc.splitTextToSize(t,cw-1.2);lines.slice(0,2).forEach((l,k)=>w.text(l,al==='l'?x+0.9:x+cw-0.8,y+3.2+k*2.8,{align:al==='l'?'left':'right'}));x+=cw;});y+=8;};
  drawH();
  const row=(vals,bold,fill)=>{if(y+rh>H-14){doc.addPage();y=header(w,S,'Útreikningar',sub+' · framhald');drawH();}
    let x=M;vals.forEach((v,j)=>{const [,cw,al]=cols[j];w.rect(x,y,cw,rh,fill||'#ffffff',LINE);w.cellText(v,x,y,cw,rh,{align:al==='l'?'left':'right',size:7,style:bold||j===9?'bold':'normal'});x+=cw;});y+=rh;};
  st.emp.forEach(o=>row([o.name,fmt(o.pctMax)+'%',fmt(o.target),String(o.shifts),fmt(o.worked),fmt(o.credit),fmt(o.total),fmt(o.outstanding),fmtS(o.carry),fmtS(o.balance),
    ...VP.CATS.map(c=>o.cats[c]?fmt(o.cats[c],2):'–'),fmt(o.premium,2)]));
  const t=st.tot;row(['Samtals','',fmt(t.target),String(st.emp.reduce((a,o)=>a+o.shifts,0)),fmt(t.worked),fmt(t.credit),fmt(t.worked+t.credit),fmt(t.target-t.worked-t.credit),'','',
    ...VP.CATS.map(c=>fmt(t.cats[c],2)),fmt(st.emp.reduce((a,o)=>a+o.premium,0),2)],true,'#f3f6f5');
  y+=5;w.font('normal',7.5,MUTED);
  ['Samtals = stundir á vöktum + fjarvistir sem teljast til vinnuskyldu. Útistandandi = vinnuskylda − samtals. Staða = samtals − vinnuskylda + flutt staða frá fyrra tímabili.',
   'Álagsstundir = Σ (stundir í flokki × álagsprósenta). Stundir á rauðum dögum og stórhátíðardögum eru í eigin flokkum og ekki taldar með helgum.',
   `Mönnun: ${fmt(t.have)} af ${fmt(t.need)} vöktum mannaðar samkvæmt lágmarksþörf.`].forEach(l=>{w.text(l,M,y,{maxWidth:W-2*M});y+=4.2;});
}

/* ---------- Vikuplan ---------- */
async function week(S,weeks){
  const st=VP.stats(S),C=st.C,w=await writer('a4','landscape'),{doc,W,H,M}=w;
  weeks.forEach((wk,wi)=>{
    if(wi)doc.addPage();
    const first=wk.dates[0],mon=VP.addDays(first,-VP.dow(first)),days=Array.from({length:7},(_,j)=>VP.addDays(mon,j));
    const title=`Vikuplan · vika ${wk.week}`,sub=`${VP.dateLabel(days[0],false)} – ${VP.dateLabel(days[6],false)} ${VP.parse(days[6]).getUTCFullYear()}`;
    let y=header(w,S,title,sub);y=legend(w,S,C,y,{hol:false});
    const lw=34,dw=(W-2*M-lw)/7,inP=d=>C.idx[d]!=null;
    const dayHead=(y,first)=>{w.rect(M,y,lw,10,'#ffffff',LINE);w.cellText(first,M,y,lw,10,{align:'left',style:'bold',size:8});
      days.forEach((d,j)=>{const f=C.info(d),x=M+lw+j*dw,fill=!inP(d)?'#f4f4f4':dayFill(f)||'#ffffff',tc=f.hol?(f.hol.kind==='major'?MAJT:REDT):INK;
        w.rect(x,y,dw,10,fill,LINE);w.font('bold',8,inP(d)?tc:MUTED);w.text(VP.DAYS[f.dow].replace(/^./,c=>c.toUpperCase())+' '+VP.shortDate(d),x+dw/2,y+4,{align:'center'});
        w.font('normal',6.3,inP(d)?tc:MUTED);w.text(w.fit(!inP(d)?'utan tímabils':f.hol?(f.hol.kind==='major'?'* ':'')+f.hol.name+(f.hol.from?' frá '+f.hol.from:''):'',dw-2),x+dw/2,y+7.8,{align:'center'});});
      return y+10;};
    // 1) hverjir á hvaða vakt
    y=dayHead(y,'Vakt');
    C.shifts.forEach(s=>{
      const names=days.map(d=>inP(d)?C.emps.map(e=>{const v=S.plan[e.id+'|'+d];if(!v||!v.s||!C.shift[v.s]||VP.covId(C,v.s)!==s.id)return null;return v.s===s.id?e.name:`${e.name} ${C.shift[v.s].start.slice(0,2)}–${C.shift[v.s].end.slice(0,2)}`;}).filter(Boolean):[]);
      const need=days.map(d=>inP(d)?VP.needFor(C,C.idx[d],s):0);
      const lines=Math.max(1,...names.map(x=>x.length+(1)));const rh=Math.max(9,3+lines*3.4);
      if(y+rh>H-14){doc.addPage();y=header(w,S,title,sub+' · framhald');y=dayHead(y,'Vakt');}
      w.rect(M,y,lw,rh,light(s.color,0.45),LINE);w.font('bold',8,INK);w.text(w.fit(`${s.code} · ${s.name}`,lw-2),M+1,y+4);
      w.font('normal',7,MUTED);w.text(`${s.start}–${s.end}`,M+1,y+7.5);
      days.forEach((d,j)=>{const x=M+lw+j*dw;w.rect(x,y,dw,rh,inP(d)?'#ffffff':'#f4f4f4',LINE);if(!inP(d))return;
        names[j].forEach((nm,k)=>{w.font('normal',7.3,INK);w.text(w.fit(nm,dw-2),x+1,y+3.8+k*3.4);});
        if(need[j]||names[j].length){const short=names[j].length<need[j];w.font(short?'bold':'normal',6,short?REDT:MUTED);
          w.text(short?`vantar ${need[j]-names[j].length}`:`${names[j].length}/${need[j]}`,x+dw-1,y+rh-1.2,{align:'right'});}});
      y+=rh;
    });
    // 2) starfsfólk × dagar
    y+=5;if(y+20>H-14){doc.addPage();y=header(w,S,title,sub+' · framhald');}
    const rh=5.2,sw=14,dw2=(W-2*M-lw-sw)/7;
    const head2=()=>{w.rect(M,y,lw,6,'#e9efee',LINE);w.cellText('Starfsmaður',M,y,lw,6,{align:'left',style:'bold',size:7});
      days.forEach((d,j)=>{const x=M+lw+j*dw2;w.rect(x,y,dw2,6,'#e9efee',LINE);w.cellText(VP.DAYS_SHORT[j]+' '+VP.shortDate(d),x,y,dw2,6,{style:'bold',size:7,color:inP(d)?INK:MUTED});});
      w.rect(M+lw+7*dw2,y,sw,6,'#e9efee',LINE);w.cellText('Klst.',M+lw+7*dw2,y,sw,6,{style:'bold',size:7});y+=6;};
    head2();
    C.emps.forEach(e=>{
      let hrs=0;const cells=days.map(d=>{if(!inP(d))return null;const v=S.plan[e.id+'|'+d];if(v&&v.s&&C.shift[v.s]){const s=C.shift[v.s];hrs+=s.hours;return {t:`${s.code}  ${s.start}–${s.end}`,c:s.color};}
        if(v&&v.a&&C.abs[v.a])return {t:C.abs[v.a].name,c:C.abs[v.a].color};return {t:'',c:null};});
      if(cells.every(c=>!c||!c.t))return;
      if(y+rh>H-14){doc.addPage();y=header(w,S,title,sub+' · framhald');head2();}
      w.rect(M,y,lw,rh,'#ffffff',LINE);w.cellText(e.name,M,y,lw,rh,{align:'left',size:7.2});
      cells.forEach((c,j)=>{const x=M+lw+j*dw2;if(!c){w.rect(x,y,dw2,rh,'#f4f4f4',LINE);return;}
        w.rect(x,y,dw2,rh,c.c?light(c.c,0.35):'#ffffff',LINE);if(c.t)w.cellText(c.t,x,y,dw2,rh,{size:7});});
      w.rect(M+lw+7*dw2,y,sw,rh,'#ffffff',LINE);w.cellText(fmt(hrs),M+lw+7*dw2,y,sw,rh,{size:7,align:'right',style:'bold'});y+=rh;
    });
  });
  w.footer(`${S.workplace.name||'Vaktaplan'} · ${VP.periodLabel(S.period)}`);
  await save(w,slug(S)+(weeks.length===1?'-vika-'+weeks[0].week:'-vikuplan')+'.pdf');
}

/* ---------- Einstaklingsplan ---------- */
async function person(S,ids){
  const st=VP.stats(S),C=st.C,w=await writer('a4','portrait'),{doc,W,H,M}=w,R=S.rules;
  ids.forEach((id,pi)=>{
    if(pi)doc.addPage();
    const e=S.employees.find(x=>x.id===id),o=st.emp.find(x=>x.id===id);if(!e)return;
    let y=header(w,S,e.name||'Starfsmaður',VP.periodLabel(S.period));
    w.font('normal',9,INK);w.text([e.title,fmt(o.pctMax)+'% starf'+(o.status==='mixed'?' (breyting á tímabilinu)':'')].filter(Boolean).join(' · '),M,y);y+=5;
    const cols=[['Dagsetning',30,'l'],['Dagur',24,'l'],['Vakt',40,'l'],['Tími',26,'l'],['Klst.',14,'r'],['Athugasemd',56,'l']];
    const tw=cols.reduce((a,c)=>a+c[1],0),sc=(W-2*M)/tw;cols.forEach(c=>c[1]*=sc);
    const rh=Math.min(5.6,(H-y-78)/(C.n+1));
    let x=M;cols.forEach(([t,cw,al])=>{w.rect(x,y,cw,rh+0.6,'#e9efee',LINE);w.cellText(t,x,y,cw,rh+0.6,{align:al==='l'?'left':'right',style:'bold',size:7.5});x+=cw;});y+=rh+0.6;
    C.dates.forEach((d,i)=>{
      const f=C.infos[i],v=S.plan[e.id+'|'+d],wsh=S.wishes[e.id+'|'+d];
      let shiftTxt='',time='',hrs='',fill=dayFill(f)?light(dayFill(f),0.3):'#ffffff',sc=null;
      if(v&&v.s&&C.shift[v.s]){const s=C.shift[v.s];shiftTxt=`${s.code} · ${s.name}`;time=`${s.start}–${s.end}`;hrs=fmt(s.hours,2);sc=s.color;}
      else if(v&&v.a&&C.abs[v.a]){shiftTxt=C.abs[v.a].name;sc=C.abs[v.a].color;}
      const note=[f.hol?(f.hol.kind==='major'?'Stórhátíðardagur: ':'Rauður dagur: ')+f.hol.name+(f.hol.from?' frá '+f.hol.from:''):'',wsh&&wsh.off?'Ósk um frí':''].filter(Boolean).join(' · ');
      const vals=[VP.dateLabel(d,false),VP.DAYS[f.dow],shiftTxt||'–',time,hrs,note];
      let x=M;vals.forEach((t,j)=>{const [,cw,al]=cols[j];w.rect(x,y,cw,rh,j===2&&sc?light(sc,0.25):fill,LINE);
        w.cellText(t,x,y,cw,rh,{align:al==='l'?'left':'right',size:7.4,style:j===2&&v&&v.s?'bold':'normal',color:j===5&&f.hol?(f.hol.kind==='major'?MAJT:REDT):(t==='–'?MUTED:INK)});x+=cw;});
      y+=rh;
    });
    // samantekt
    y+=5;w.font('bold',10,INK);w.text('Stundauppgjör',M,y);y+=2;
    const box=[['Vinnuskylda',fmt(o.target)+' klst.'],['Á vöktum',fmt(o.worked)+' klst. ('+o.shifts+' vaktir)'],['Fjarvistir (reiknaðar)',fmt(o.credit)+' klst.'],
      ['Samtals',fmt(o.total)+' klst.'],['Útistandandi',fmt(o.outstanding)+' klst.'],['Flutt staða',fmtS(o.carry)+' klst.'],['Staða í lok tímabils',fmtS(o.balance)+' klst.']];
    const bw=(W-2*M)/2-3;
    box.forEach(([k,v],j)=>{const yy=y+2+j*5;w.rect(M,yy,bw,5,j===6?'#e9efee':'#ffffff',LINE);w.cellText(k,M,yy,bw*0.55,5,{align:'left',size:7.8,style:j===6?'bold':'normal'});
      w.cellText(v,M+bw*0.55,yy,bw*0.45,5,{align:'right',size:7.8,style:'bold'});});
    const x2=M+bw+6;
    VP.CATS.forEach((c,j)=>{const yy=y+2+j*5;w.rect(x2,yy,bw,5,'#ffffff',LINE);w.cellText(VP.CAT_NAMES[c]+(c!=='day'?` (${fmt(R.rates[c],2)}%)`:''),x2,yy,bw*0.6,5,{align:'left',size:7.8});
      w.cellText(fmt(o.cats[c],2)+' klst.',x2+bw*0.6,yy,bw*0.4,5,{align:'right',size:7.8});});
    {const yy=y+2+6*5;w.rect(x2,yy,bw,5,'#e9efee',LINE);w.cellText('Álagsstundir',x2,yy,bw*0.6,5,{align:'left',size:7.8,style:'bold'});w.cellText(fmt(o.premium,2),x2+bw*0.6,yy,bw*0.4,5,{align:'right',size:7.8,style:'bold'});}
  });
  w.footer(`${S.workplace.name||'Vaktaplan'} · ${VP.periodLabel(S.period)}`);
  const one=ids.length===1&&S.employees.find(x=>x.id===ids[0]);
  await save(w,slug(S)+(one?'-'+(one.name||'starfsmadur').toLowerCase().replace(/ð/g,'d').replace(/þ/g,'th').replace(/æ/g,'ae').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w]+/g,'-'):'-einstaklingar')+'.pdf');
}
window.VPPDF={full,week,person};
})();

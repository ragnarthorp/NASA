'use strict';
/* PDF-útgáfa námskrárinnar með jsPDF (vendor/jspdf.umd.min.js). Texti er vektor-texti; þemamyndir eru PNG. */
const PDF_SAFE=s=>String(s??'').replace(/[„“”″]/g,'"').replace(/[‘’‚′]/g,"'").replace(/[–—−]/g,'-').replace(/…/g,'...').replace(/[•●]/g,'-').replace(/[→⇒]/g,'->').replace(/[  ]/g,' ').replace(/[^\x00-\xFF]/g,'');

function svgToPng(svg,width){
  return new Promise((ok,no)=>{
    const vb=svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number),h=Math.round(width*vb[3]/vb[2]);
    const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
    img.onload=()=>{const c=document.createElement('canvas');c.width=width;c.height=h;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,width,h);x.drawImage(img,0,0,width,h);URL.revokeObjectURL(u);ok({data:c.toDataURL('image/png'),ratio:h/width});};
    img.onerror=()=>{URL.revokeObjectURL(u);no(Error('Ekki tókst að teikna mynd.'));};
    img.src=u;
  });
}

async function buildPDF(opt={themes:true,balance:true,crit:true}){
  if(!window.jspdf?.jsPDF)throw Error('PDF-safnið (jsPDF) hlóðst ekki.');
  const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
  const W=210,H=297,M=18,CW=W-2*M,BOTTOM=H-18;
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const INK='#183e43',MUTED='#5d7373',LINE='#d6ddda';
  let y=M;
  const font=(style='normal',size=10,color=INK)=>{doc.setFont('helvetica',style);doc.setFontSize(size);doc.setTextColor(...rgb(color));};
  const lh=size=>size*0.3528*1.42;
  const fill=(c)=>doc.setFillColor(...rgb(c));
  const rect=(x,yy,w,h,c,r=0)=>{fill(c);r?doc.roundedRect(x,yy,w,h,r,r,'F'):doc.rect(x,yy,w,h,'F');};
  const text=(s,x,yy,o)=>doc.text(PDF_SAFE(s),x,yy,o);
  const title=D.meta.title||'Skólanámskrá NASA';
  function newPage(){doc.addPage();y=M+10;}
  function need(h){if(y+h>BOTTOM){newPage();return true;}return false;}

  /* ríkur texti úr markdown */
  function runsOf(node,st={}){
    if(node.nodeType===3)return [{t:node.textContent,b:!!st.b,i:!!st.i}];
    const tag=node.nodeName,n={b:st.b||tag==='STRONG'||/^H[1-3]$/.test(tag),i:st.i||tag==='EM'};
    return [...node.childNodes].flatMap(c=>runsOf(c,n));
  }
  const styleOf=r=>r.b&&r.i?'bolditalic':r.b?'bold':r.i?'italic':'normal';
  function wrap(runs,width,size){
    const lines=[];let line=[],used=0;
    const push=()=>{lines.push(line);line=[];used=0;};
    for(const r of runs){
      for(const tok of PDF_SAFE(r.t).split(/(\s+)/)){
        if(!tok)continue;
        const space=/^\s+$/.test(tok),word=space?' ':tok;
        doc.setFont('helvetica',styleOf(r));doc.setFontSize(size);
        let w=doc.getTextWidth(word);
        if(space&&!line.length)continue;
        if(!space&&used+w>width&&line.length){while(line.length&&line.at(-1).space){used-=line.pop().w;}push();}
        if(!space&&w>width){let s='';for(const ch of word){if(doc.getTextWidth(s+ch)>width&&s){line.push({...r,t:s,w:doc.getTextWidth(s)});push();s='';}s+=ch;}line.push({...r,t:s,w:doc.getTextWidth(s)});used=doc.getTextWidth(s);continue;}
        line.push({...r,t:word,w,space});used+=w;
      }
    }
    if(line.length)push();
    return lines;
  }
  function drawLines(lines,x,size,color=INK){
    for(const ln of lines){
      need(lh(size));
      let xx=x;for(const s of ln){font(styleOf(s),size,color);doc.text(s.t,xx,y+size*0.3528);xx+=s.w;}
      y+=lh(size);
    }
  }
  function rich(md,x=M,width=CW,size=10,color=INK){
    const root=document.createElement('div');root.innerHTML=markdown(md);
    for(const block of root.children){
      if(block.tagName==='UL'||block.tagName==='OL'){
        [...block.children].forEach((li,i)=>{
          const lines=wrap(runsOf(li),width-6,size);need(lh(size));
          font('normal',size,color);doc.text(block.tagName==='UL'?'-':(i+1)+'.',x+1,y+size*0.3528);
          drawLines(lines,x+6,size,color);y+=0.8;
        });y+=1.5;
      }else{
        const h=/^H[1-3]$/.test(block.tagName),sz=h?size+1.5:size;
        if(h)y+=1;drawLines(wrap(runsOf(block),width,sz),x,sz,color);y+=h?0.8:2;
      }
    }
  }
  function plain(s,x=M,width=CW,size=10,style='normal',color=INK){drawLines(wrap([{t:s,b:style.includes('bold'),i:style.includes('italic')}],width,size),x,size,color);}
  function h1(s,num){newPage();font('bold',9,MUTED);text((num?'KAFLI '+num:'VIÐAUKI').toUpperCase(),M,y);y+=6;font('bold',22,INK);const ls=doc.splitTextToSize(PDF_SAFE(s),CW);ls.forEach(l=>{doc.text(l,M,y+6);y+=9.5;});rect(M,y+1,24,1.2,'#177d88');y+=8;}
  function h2(s,color=INK){need(16);y+=2;font('bold',14,color);doc.splitTextToSize(PDF_SAFE(s),CW).forEach(l=>{doc.text(l,M,y+5);y+=6.6;});y+=1.5;}
  function h3(s,color=INK){need(12);font('bold',11,color);doc.splitTextToSize(PDF_SAFE(s),CW).forEach(l=>{doc.text(l,M,y+4);y+=5.4;});y+=1;}
  function table(cols,rows,{size=9,head=true,zebra=true}={}){
    const pad=1.8,widths=cols.map(c=>c.w*CW);
    const rowH=cells=>Math.max(...cells.map((c,i)=>{font(c?.bold?'bold':'normal',size);return doc.splitTextToSize(PDF_SAFE(c?.t??c),widths[i]-2*pad).length;}))*lh(size)+2*pad;
    const drawRow=(cells,bg,bold=false,color=INK)=>{
      const h=rowH(cells.map(c=>bold?{t:c?.t??c,bold:true}:c));
      if(need(h)&&head)drawRow(cols.map(c=>c.h),'#e4ece8',true,MUTED);
      if(bg)rect(M,y,CW,h,bg);
      let x=M;cells.forEach((c,i)=>{const cell=typeof c==='object'&&c?c:{t:c};font(bold||cell.bold?'bold':'normal',size,cell.color||color);
        const ls=doc.splitTextToSize(PDF_SAFE(cell.t),widths[i]-2*pad);ls.forEach((l,k)=>doc.text(l,cols[i].right?x+widths[i]-pad:x+pad,y+pad+size*0.3528+k*lh(size),cols[i].right?{align:'right'}:undefined));
        if(cell.dot){fill(cell.dot);doc.circle(x+pad-0.2,y+pad+1.3,1.1,'F');}x+=widths[i];});
      doc.setDrawColor(...rgb(LINE));doc.setLineWidth(0.2);doc.line(M,y+h,M+CW,y+h);y+=h;
    };
    if(head)drawRow(cols.map(c=>c.h),'#e4ece8',true,MUTED);
    rows.forEach((r,i)=>drawRow(r,zebra&&i%2?'#f6f8f7':null));
    y+=4;
  }
  async function wheelImg(values,o,wmm){const img=await svgToPng(wheelSVG(values,o),1500);const h=wmm*img.ratio;need(h+4);doc.addImage(img.data,'PNG',M+(CW-wmm)/2,y,wmm,h,undefined,'FAST');y+=h+3;}
  function legendLine(){font('normal',8,MUTED);let x=M+(CW-150)/2;Object.values(GROUPS).forEach(g=>{fill(g.color);doc.roundedRect(x,y-2.6,3,3,0.6,0.6,'F');text(g.name,x+4.5,y);x+=50;});y+=6;}

  /* forsíða */
  rect(0,0,W,78,INK);
  font('bold',40,'#ffffff');text('NASA',M,34);
  font('normal',11,'#c4dace');text('Náttúrufræði- og samfélagsgreinar',M,44);text(D.meta.school||'',M,51);
  font('bold',9,'#c4dace');text('SKÓLANÁMSKRÁ',W-M,34,{align:'right'});text(D.meta.grades||'',W-M,41,{align:'right'});
  y=92;font('bold',24,INK);doc.splitTextToSize(PDF_SAFE(title),CW).forEach(l=>{doc.text(l,M,y+7);y+=10.5;});
  y+=3;font('normal',11,MUTED);
  text(['Tímabil: '+cycleYears().join(', '),D.meta.authors?'Ábyrgð: '+D.meta.authors:'','Útgáfa: '+(d=>d.getDate()+'. '+['janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'][d.getMonth()]+' '+d.getFullYear())(new Date())].filter(Boolean).join('   ·   '),M,y+4);y+=12;
  await wheelImg(targetWeights(),{label:'Markmið um vægi'},128);legendLine();
  font('normal',9,MUTED);plain('Myndin sýnir markmið skólanámskrárinnar um vægi hæfniflokka yfir þriggja ára tímabil. Innri hringurinn er sameiginlegur kjarni greinasviðanna; ytri hringurinn dýpkar náttúrufræði (vinstri) og samfélagsfræði (hægri).',M,CW,9,'normal',MUTED);

  /* efnisyfirlit */
  const chapters=['Um kennsluna','Hæfniflokkar','Námsmat','Hækkunar- og rannsóknarverkefni'];
  if(opt.themes&&D.themes.length)chapters.push('Þemu');
  if(opt.balance)chapters.push('Jafnvægi yfir tímabilið');
  let ch=0;

  /* 1. Um kennsluna */
  h1(chapters[ch],++ch);
  D.info.forEach(s=>{h2(s.title);rich(s.body,M,CW,10.5);y+=2;});

  /* 2. Hæfniflokkar */
  h1(chapters[ch],++ch);
  rich('Hæfniviðmið aðalnámskrár eru flokkuð í níu hæfniflokka NASA: þrjá í **sameiginlegum kjarna** og sex sem **dýpka sérstök svið**. Samtals skulu hlutföll hæfniflokka vera 100%. Þegar hæfnisvið eru vegin yfir hvert þriggja ára tímabil skulu þau vera sem næst því hlutfalli sem hér er sett fram.',M,CW,10.5);y+=2;
  table([{h:'Hæfniflokkur',w:.34},{h:'Svið',w:.17},{h:'Yfirflokkar aðalnámskrár',w:.37},{h:'Vægi',w:.12,right:true}],
    [...CATS.map(c=>[{t:c.name+(c.tag?' ('+c.tag.toLowerCase()+')':''),bold:true,dot:catColor(c.id)},GROUPS[c.group].short,areasOf(c.id).map(a=>a.name).join(', '),fmt(+D.targets[c.id]||0)+'%']),[{t:'Samtals',bold:true},'','',{t:fmt(targetSum())+'%',bold:true}]]);
  const tn=Math.round(targetNatt()*100);
  plain(`Samkvæmt markmiðunum skiptist námið um það bil ${tn}% á náttúrugreinar og ${100-tn}% á samfélagsgreinar (markmið aðalnámskrár: ${D.ratio.natt}% / ${100-D.ratio.natt}%). Í kjarnanum er gert ráð fyrir að ${D.ratio.coreNatt}% tilheyri náttúrugreinum nema áherslur séu tengdar hæfniviðmiðum.`,M,CW,10);y+=3;
  for(const c of CATS){
    need(30);const col=catColor(c.id);rect(M,y,CW,9,tint(col,0.18),2);font('bold',11.5,col);text(c.name,M+3,y+6.1);font('normal',8.5,MUTED);text(GROUPS[c.group].name+(c.tag?' · '+c.tag:'')+' · markmið '+fmt(+D.targets[c.id]||0)+'%',W-M-3,y+6,{align:'right'});y+=12;
    plain(c.desc,M,CW,10);
    if(D.catNotes[c.id].trim()){font('bold',9,MUTED);need(8);text('VIÐFANGSEFNI SKÓLANS',M,y+3);y+=5;rich(D.catNotes[c.id],M,CW,10);}
    y+=3;
  }

  /* 3. Námsmat */
  const A=D.assessment;
  h1(chapters[ch],++ch);
  rich('Notaðir eru hæfniflokkar með bein tengsl við lokaeinkunn. Hverri þemalotu lýkur með **B-prófi**. Nemandi sem nær B öðlast rétt til töku **A-prófs**. Samhliða þemanu geta nemendur unnið **hækkunarverkefni** og nýtt stigin til að hækka einkunn á B-prófi.',M,CW,10.5);
  h2('B-próf');rich(A.bIntro,M,CW,10.5);
  const sorted=[...A.bBands].sort((a,b)=>b.min-a.min);
  table([{h:'Einkunn',w:.16},{h:'Merking',w:.56},{h:'Viðmið',w:.28,right:true}],sorted.map((b,i)=>[{t:b.grade,bold:true},b.label,b.grade==='D'?'undir '+fmt(sorted[i-1]?.min??0)+'%':fmt(b.min)+'% eða meira']));
  h3('Forgjöf eftir árgangi');
  plain(`Kennslan og námsmatið er aldursblandað. Nemendur í 8. og 9. bekk fá minnkandi forgjöf sem hverfur þegar þeir koma í 10. bekk: ${fmt(A.handicap['8'])} prósentustig í 8. bekk, ${fmt(A.handicap['9'])} í 9. bekk og ${fmt(A.handicap['10'])} í 10. bekk.`,M,CW,10);y+=2;
  h3('Hækkunarstig');
  plain(`Fyrir hækkunarverkefni má fá 1 til 3 stig. Stigin safnast saman og hvert stig hækkar árangur á B-prófi um ${fmt(A.pointValue)} prósentustig${A.maxPoints>0?`, að hámarki ${A.maxPoints} stig á hvert B-próf`:''}. Nemandi sem nær B með eða án hækkunarstiga öðlast rétt til töku A-prófs.`,M,CW,10);y+=2;
  h2('A-próf');rich(A.aIntro,M,CW,10.5);
  table([{h:'Stig á A-prófi',w:.3},{h:'Niðurstaða',w:.7}],[[`${A.aA}–${A.aMax}`,{t:'A',bold:true}],[`${A.aBplus}–${A.aA-1}`,{t:'B+',bold:true}],[`0–${A.aBplus-1}`,'Einkunn hækkar ekki (helst B)']]);
  plain('Ekki er hægt að lækka í einkunn við töku A-prófs.',M,CW,10,'italic');
  if(A.notes.trim()){h3('Annað um námsmat');rich(A.notes,M,CW,10.5);}

  /* 4. Verkefni */
  h1(chapters[ch],++ch);
  rich('**Hækkunarverkefni** eru nemendastýrð verkefni sem nemendur og kennarar koma sér saman um og byggja á hæfniflokkum NASA. **Rannsóknarverkefni** eru stærri verkefni sem nemendur geta unnið þegar þeir hafa ítrekað sýnt fram á afbragðshæfni.',M,CW,10.5);
  for(const [kind,label] of [['hækkun','Hækkunarverkefni'],['rannsókn','Rannsóknarverkefni']]){
    const ps=D.projects.filter(p=>p.kind===kind);h2(label+' ('+ps.length+')');
    if(!ps.length){plain('Engin verkefni skráð.',M,CW,10,'italic',MUTED);continue;}
    for(const p of ps){need(14);const col=catColor(p.category);font('bold',10.5,INK);const tl=doc.splitTextToSize(PDF_SAFE(p.title||'Ónefnt verkefni'),CW-8);fill(col);doc.circle(M+1.5,y+2.6,1.3,'F');tl.forEach(l=>{doc.text(l,M+5,y+4);y+=5;});
      font('normal',8.5,MUTED);const th=themeById(p.theme);text([CAT[p.category].name,kind==='hækkun'?p.points+(p.points===1?' stig':' stig'):'',th?'Þema: '+(th.title||'Ónefnt'):''].filter(Boolean).join(' · '),M+5,y+3);y+=5;
      if(p.description.trim()){const x0=M+5;rich(p.description,x0,CW-5,9.5);}y+=2;}
  }

  /* 5. Þemu */
  if(opt.themes&&D.themes.length){
    h1(chapters[ch],++ch);
    const ts=[...D.themes].sort((a,b)=>(a.year||'~').localeCompare(b.year||'~','is')||(a.period||'').localeCompare(b.period||'','is'));
    plain(`Í námskránni eru ${ts.length} þemu, samtals ${fmt(ts.reduce((a,t)=>a+(t.weeks||0),0))} vikur. Ein áherslulína jafngildir einni áherslu og vægi hæfniflokks í þema er hlutfall lína í flokknum.`,M,CW,10.5);y+=2;
    table([{h:'Þema',w:.42},{h:'Skólaár',w:.18},{h:'Lota',w:.2},{h:'Vikur',w:.1,right:true},{h:'Línur',w:.1,right:true}],ts.map(t=>[{t:t.title||'Ónefnt þema',bold:true},t.year||'-',[t.period,t.kind].filter(Boolean).join(' · '),t.weeks?fmt(t.weeks):'-',String(t.entries.length)]));
    for(const t of ts){
      newPage();
      font('bold',9,MUTED);text([t.year||'Óskilgreint skólaár',t.period,t.kind,t.weeks?fmt(t.weeks)+' vikur':'vikufjölda vantar'].filter(Boolean).join(' · ').toUpperCase(),M,y);y+=3;
      font('bold',18,INK);doc.splitTextToSize(PDF_SAFE(t.title||'Ónefnt þema'),CW).forEach(l=>{doc.text(l,M,y+6.5);y+=8.5;});y+=2;
      if(t.summary.trim())rich(t.summary,M,CW,10.5);
      const s=shares(t.entries);
      if(s.total){await wheelImg(s.weights,{label:t.title},92);const n=themeNatt(t);font('normal',8.5,MUTED);text(`${s.total} áherslulínur · ${CATS.filter(c=>s.counts[c.id]).length} virkir flokkar · um ${Math.round(n*100)}% náttúrugreinar og ${100-Math.round(n*100)}% samfélagsgreinar`,W/2,y,{align:'center'});y+=7;}
      for(const c of CATS.filter(c=>s.counts[c.id])){
        need(22);const col=catColor(c.id);rect(M,y,CW,8,tint(col,0.18),2);font('bold',11,col);text(c.name,M+3,y+5.6);font('normal',8.5,MUTED);text(`${s.counts[c.id]} af ${s.total} línum · ${pct(s.weights[c.id])}`,W-M-3,y+5.5,{align:'right'});y+=11;
        t.entries.filter(e=>e.category===c.id).forEach((e,i)=>{
          need(10);font('bold',9,col);text(String(i+1)+'.',M+1,y+3.6);
          rich(e.note||'Áhersla án skýringar.',M+7,CW-7,10);
          if(e.criteria.length){y-=1;plain('Hæfniviðmið: '+e.criteria.map(critLabel).join('; '),M+7,CW-7,8.5,'italic',MUTED);y+=1;}
        });y+=2;
      }
      const tp=D.projects.filter(p=>p.theme===t.id);
      if(tp.length){h3('Tengd verkefni');tp.forEach(p=>plain('- '+(p.title||'Ónefnt verkefni')+' ('+(p.kind==='hækkun'?p.points+' stig':'rannsóknarverkefni')+')',M,CW,10));}
    }
  }

  /* 6. Jafnvægi */
  if(opt.balance){
    h1(chapters[ch],++ch);
    const list=D.themes.filter(t=>cycleYears().includes(t.year)),a=aggregate(list),tw=targetWeights();
    plain(`Tímavegið vægi þema á skólaárunum ${cycleYears().join(', ')}: ${a.included.length} þemu, samtals ${fmt(a.weeks)} vikur. Vægi hvers flokks er summa (vikur þema × hlutfall flokks í þemanu) deilt með heildarvikum.`,M,CW,10.5);y+=2;
    if(a.weeks){
      await wheelImg(a.weights,{label:'Tímavegið vægi',sub:Object.fromEntries(CATS.map(c=>[c.id,'markmið '+pct(tw[c.id])]))},110);
      table([{h:'Hæfniflokkur',w:.46},{h:'Markmið',w:.18,right:true},{h:'Raun',w:.18,right:true},{h:'Frávik',w:.18,right:true}],CATS.map(c=>{const d=(a.weights[c.id]-tw[c.id])*100;return [{t:c.name,dot:catColor(c.id)},pct(tw[c.id]),pct(a.weights[c.id]),{t:(d>0?'+':'')+fmt(d),color:Math.abs(d)>3?'#a3402a':INK}];}));
      const n=Math.round(a.natt*100);plain(`Hlutfall greinasviða: ${n}% náttúrugreinar og ${100-n}% samfélagsgreinar (markmið ${D.ratio.natt}% / ${100-D.ratio.natt}%).`,M,CW,10.5,'bold');
      const cov=coverage(list),covered=CRITERIA.filter(c=>cov[c.id].size).length,miss=CRITERIA.filter(c=>!cov[c.id].size);
      y+=2;plain(`${covered} af ${CRITERIA.length} hæfniviðmiðum aðalnámskrár eru tengd a.m.k. einu þema á tímabilinu.`,M,CW,10.5);
      if(miss.length){h3('Hæfniviðmið sem enn eru ótengd');CATS.forEach(c=>{const m=miss.filter(x=>AREA[x.g].nasa===c.id);if(m.length)plain(c.name+': '+m.map(x=>x.s+' ('+AREA[x.g].name+')').join(', '),M,CW,9.5);});}
    }else plain('Engin þema á tímabilinu hafa bæði vikufjölda og áherslulínur.',M,CW,10.5,'italic',MUTED);
  }

  /* Viðauki */
  if(opt.crit){
    h1('Hæfniviðmið aðalnámskrár eftir hæfniflokkum NASA');
    plain('Hæfniviðmið við lok 10. bekkjar úr Aðalnámskrá grunnskóla, 22. kafla (náttúrugreinar) og 24. kafla (samfélagsgreinar). Við lok 10. bekkjar getur nemandi:',M,CW,10.5,'italic',MUTED);y+=2;
    for(const c of CATS){
      need(24);const col=catColor(c.id);rect(M,y,CW,8,tint(col,0.18),2);font('bold',11,col);text(c.name,M+3,y+5.6);if(c.tag){font('bold',8,'#4c6a12');text(c.tag.toUpperCase(),W-M-3,y+5.4,{align:'right'});}y+=11;
      for(const a of areasOf(c.id)){
        h3(a.name+' · '+SUBJECT[a.subject],a.subject==='natt'?'#177d88':'#b86140');
        CRITERIA.filter(x=>x.g===a.id).forEach(x=>{need(9);rich(`- **${x.s}:** ${x.t}.`,M,CW,9.5);y-=1.5;});y+=2;
      }
    }
  }

  /* síðuhaus og -fótur */
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){
    doc.setPage(i);
    if(i>1){fill('#177d88');doc.rect(M,10,1.2,5,'F');font('bold',8,INK);text('NASA · SKÓLANÁMSKRÁ',M+3,14);font('normal',8,MUTED);text((D.meta.school||'')+' · '+(D.meta.grades||''),W-M,14,{align:'right'});doc.setDrawColor(...rgb(LINE));doc.setLineWidth(0.2);doc.line(M,17.5,W-M,17.5);}
    doc.setDrawColor(...rgb(LINE));doc.line(M,H-12,W-M,H-12);font('normal',8,MUTED);text(title.slice(0,90),M,H-7.5);text(`${i} / ${n}`,W-M,H-7.5,{align:'right'});
  }
  return doc;
}
async function exportPDF(){
  const btns=[$('pdfTop'),$('pdfBtn')].filter(Boolean);btns.forEach(b=>{b.disabled=true;b.dataset.label=b.textContent;b.textContent='Útbý PDF…';});
  try{
    const opt={themes:$('pdfThemes')?.checked??true,balance:$('pdfBalance')?.checked??true,crit:$('pdfCrit')?.checked??true};
    const doc=await buildPDF(opt);
    download(doc.output('blob'),fileBase()+'.pdf');toast('PDF-skjal sótt.');
  }catch(err){console.error(err);toast('Ekki tókst að útbúa PDF: '+(err.message||err));}
  finally{btns.forEach(b=>{b.disabled=false;b.textContent=b.dataset.label||'Sækja PDF';});}
}
async function printDoc(){
  try{
    const opt={themes:$('pdfThemes')?.checked??true,balance:$('pdfBalance')?.checked??true,crit:$('pdfCrit')?.checked??true};
    const doc=await buildPDF(opt),u=URL.createObjectURL(doc.output('blob'));
    const w=window.open(u,'_blank');if(!w){download(doc.output('blob'),fileBase()+'.pdf');toast('Sprettigluggi lokaður: PDF var sótt í staðinn.');}
    setTimeout(()=>URL.revokeObjectURL(u),60000);
  }catch(err){toast('Ekki tókst að útbúa skjal til prentunar.');}
}

'use strict';
/* PDF-útgáfa með jsPDF (vendor/jspdf.umd.min.js). Texti er vektor-texti með innfelldri Unicode-leturgerð
   (vendor/pdf-fonts.js) svo íslenskir stafir, gæsalappir, gríska, ₂, ≤ o.fl. skili sér. Markdown er teiknað
   út frá sama þáttara og vefurinn notar (js/markdown.js). Þemamyndir eru PNG. */

function svgToPng(svg,width){
  return new Promise((ok,no)=>{
    const vb=svg.match(/viewBox="([\d.\s-]+)"/)[1].split(/\s+/).map(Number),h=Math.round(width*vb[3]/vb[2]);
    const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
    img.onload=()=>{const c=document.createElement('canvas');c.width=width;c.height=h;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,width,h);x.drawImage(img,0,0,width,h);URL.revokeObjectURL(u);ok({data:c.toDataURL('image/png'),ratio:h/width});};
    img.onerror=()=>{URL.revokeObjectURL(u);no(Error('Ekki tókst að teikna mynd.'));};
    img.src=u;
  });
}
function loadPdfFonts(){
  if(window.NASA_PDF_FONTS)return Promise.resolve(true);
  return new Promise(ok=>{const s=document.createElement('script');s.src='vendor/pdf-fonts.js';s.onload=()=>ok(!!window.NASA_PDF_FONTS);s.onerror=()=>ok(false);document.head.appendChild(s);});
}
/* Stafir sem leturgerðin hefur (sjá hlutmengið í vendor/pdf-fonts.js). */
const PDF_GLYPHS=/[ -~ -ɏͰ-Ͽ -⁯⁰-₟₠-⃏℀-⅏⅐-↏←-⇿∀-⋿■-◿✓-✗\n]/u;
const pdfUnicode=s=>[...String(s??'').replace(/⁻/g,'-').replace(/⇒/g,'→').replace(/­/g,'')].map(c=>PDF_GLYPHS.test(c)?c:c.codePointAt(0)>0xFFFF?'':'?').join('');
const pdfLatin1=s=>String(s??'').replace(/[„“”″]/g,'"').replace(/[‘’‚′]/g,"'").replace(/[–—−]/g,'-').replace(/…/g,'...').replace(/[•●◦▪]/g,'-').replace(/[→⇒]/g,'->').replace(/[  ]/g,' ').replace(/[^\x00-\xFF]/g,'');

async function pdfWriter(){
  if(!window.jspdf?.jsPDF)throw Error('PDF-safnið (jsPDF) hlóðst ekki.');
  const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
  let FAM='helvetica',MONO='courier',SAFE=pdfLatin1;
  if(await loadPdfFonts()){
    const F=window.NASA_PDF_FONTS;
    for(const st of ['normal','bold','italic','bolditalic']){doc.addFileToVFS('nasa-'+st+'.ttf',F[st]);doc.addFont('nasa-'+st+'.ttf','NASASans',st);}
    doc.addFileToVFS('nasa-mono.ttf',F.mono);doc.addFont('nasa-mono.ttf','NASAMono','normal');
    FAM='NASASans';MONO='NASAMono';SAFE=pdfUnicode;
  }
  const W=210,H=297,M=18,CW=W-2*M,BOTTOM=H-18;
  const INK='#183e43',MUTED='#5d7373',LINE='#d6ddda',LINK='#177d88';
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const w={doc,W,H,M,CW,INK,MUTED,LINE,y:M,bars:[]};
  const styleOf=r=>r.b&&r.i?'bolditalic':r.b?'bold':r.i?'italic':'normal';
  const setRun=(r,size)=>{if(r.code||r.mono)doc.setFont(MONO,'normal');else doc.setFont(FAM,styleOf(r));doc.setFontSize(r.code?size*0.92:size);};
  w.font=(style='normal',size=10,color=INK)=>{doc.setFont(FAM,style);doc.setFontSize(size);doc.setTextColor(...rgb(color));};
  w.lh=size=>size*0.3528*1.42;
  w.fill=c=>doc.setFillColor(...rgb(c));
  w.rect=(x,y,ww,h,c,r=0)=>{w.fill(c);r?doc.roundedRect(x,y,ww,h,r,r,'F'):doc.rect(x,y,ww,h,'F');};
  w.text=(s,x,y,o)=>doc.text(SAFE(s),x,y,o);
  w.newPage=()=>{doc.addPage();w.y=M+10;};
  w.need=h=>{if(w.y+h>BOTTOM){w.newPage();return true;}return false;};
  w.line=(x1,y1,x2,y2,c=LINE,lw=0.2)=>{doc.setDrawColor(...rgb(c));doc.setLineWidth(lw);doc.line(x1,y1,x2,y2);};

  /* línuröð (runs) úr markdown innan línu */
  function runsOf(node,st={}){
    if(node.nodeType===3)return node.textContent?[{t:node.textContent,...st}]:[];
    if(node.nodeName==='BR')return [{br:true}];
    const tag=node.nodeName,n={...st};
    if(tag==='STRONG'||tag==='B')n.b=true;
    if(tag==='EM'||tag==='I')n.i=true;
    if(tag==='S'||tag==='DEL')n.s=true;
    if(tag==='CODE')n.code=true;
    if(tag==='A')n.href=node.getAttribute('href');
    return [...node.childNodes].flatMap(c=>runsOf(c,n));
  }
  w.inline=(md,base={})=>{const d=document.createElement('div');d.innerHTML=inlineMD(md);return runsOf(d,base);};
  w.wrap=(runs,width,size)=>{
    const lines=[];let line=[],used=0;
    const push=()=>{while(line.length&&line.at(-1).space&&!line.at(-1).mono)used-=line.pop().w;lines.push(line);line=[];used=0;};
    for(const r of runs){
      if(r.br){push();continue;}
      for(const tok of SAFE(r.t).split(/([ \t\n ]+)/)){
        if(!tok)continue;
        const space=/^[ \t\n ]+$/.test(tok),word=space&&!r.mono?' ':tok;
        setRun(r,size);
        const wd=doc.getTextWidth(word);
        if(space){if(line.length||r.mono){line.push({...r,t:' ',w:wd,space:true});used+=wd;}continue;}
        if(used+wd>width&&line.length)push();
        if(wd>width){let s='';for(const ch of word){if(doc.getTextWidth(s+ch)>width&&s){line.push({...r,t:s,w:doc.getTextWidth(s)});push();setRun(r,size);s='';}s+=ch;}line.push({...r,t:s,w:doc.getTextWidth(s)});used=doc.getTextWidth(s);continue;}
        line.push({...r,t:word,w:wd});used+=wd;
      }
    }
    if(line.length||!lines.length)push();
    return lines;
  };
  /* teiknar línur; síðuskil eftir þörfum; tilvitnunarstrik (w.bars) fylgja hverri línu */
  w.drawLine=(ln,x,base,size,color,align)=>{
    let xx=x;if(align==='right')xx=x-ln.reduce((a,s)=>a+s.w,0);
    for(const s of ln){
      setRun(s,size);const col=s.href?LINK:color;doc.setTextColor(...rgb(col));
      if(s.code&&!s.space){w.rect(xx-0.4,base-size*0.3528*0.82,s.w+0.8,size*0.3528*1.12,'#e7eeea',0.6);doc.setTextColor(...rgb(col));}
      doc.text(s.t,xx,base);
      if(s.s)w.line(xx,base-size*0.3528*0.3,xx+s.w,base-size*0.3528*0.3,col,0.25);
      if(s.href&&!s.space){w.line(xx,base+0.5,xx+s.w,base+0.5,col,0.15);doc.link(xx,base-size*0.3528,s.w,size*0.3528*1.2,{url:s.href});}
      xx+=s.w;
    }
  };
  w.drawLines=(lines,x,size,color=INK)=>{
    for(const ln of lines){
      const h=w.lh(size);w.need(h);
      w.bars.forEach(bx=>w.rect(bx,w.y-0.3,0.8,h+0.6,'#b9c9c0'));
      w.drawLine(ln,x,w.y+size*0.3528,size,color);w.y+=h;
    }
  };
  /* markdown-blokkir */
  w.blocks=(blocks,x,width,size,color,depth=0,tight=false)=>{
    blocks.forEach((b,k)=>{
      const last=k===blocks.length-1;
      switch(b.type){
        case 'h':{const sz=size+[0,4,2.5,1][b.level];w.y+=k?1.5:0;w.need(w.lh(sz)+w.lh(size));w.drawLines(w.wrap(w.inline(b.text,{b:true}),width,sz),x,sz,color);w.y+=1;break;}
        case 'p':{const runs=b.lines.flatMap((l,i)=>i?[{br:true},...w.inline(l)]:w.inline(l));w.drawLines(w.wrap(runs,width,size),x,size,color);if(!(tight&&last))w.y+=tight?0.6:size*0.2;break;}
        case 'hr':w.need(5);w.y+=1.5;w.line(x,w.y,x+width,w.y);w.y+=3;break;
        case 'code':{const sz=size*0.9;w.y+=0.5;for(const raw of b.text.split('\n')){const ls=w.wrap([{t:raw||' ',mono:true}],width-4,sz);for(const ln of ls){const h=w.lh(sz);w.need(h);w.rect(x,w.y,width,h,'#eef3f0');w.drawLine(ln,x+2,w.y+sz*0.3528,sz,color);w.y+=h;}}w.y+=2;break;}
        case 'quote':{w.bars.push(x);w.blocks(b.blocks,x+4,width-4,size,MUTED,depth);w.bars.pop();w.y+=1;break;}
        case 'list':{
          const mw=b.ordered?Math.max(5,String(b.start+b.items.length-1).length*2.1+2.6):4.2;
          b.items.forEach((it,i)=>{
            w.need(w.lh(size));
            const mark=b.ordered?(b.start+i)+'.':['•','◦','▪'][depth%3];
            w.font(b.ordered?'normal':'bold',size,color);w.text(SAFE===pdfLatin1&&!b.ordered?'-':mark,x+(b.ordered?0:0.6),w.y+size*0.3528);
            w.blocks(it.blocks,x+mw,width-mw,size,color,depth+1,true);w.y+=0.5;
          });
          if(!tight)w.y+=size*0.15;break;
        }
      }
    });
  };
  w.rich=(md,x=M,width=CW,size=10,color=INK)=>w.blocks(parseMD(md),x,width,size,color);
  w.plain=(s,x=M,width=CW,size=10,style='normal',color=INK)=>w.drawLines(w.wrap([{t:s,b:style.includes('bold'),i:style.includes('italic')}],width,size),x,size,color);
  w.inlineText=(md,x=M,width=CW,size=10,base={},color=INK)=>w.drawLines(w.wrap(w.inline(md,base),width,size),x,size,color);
  w.heading=(md,size,color=INK,x=M,width=CW)=>{w.drawLines(w.wrap(w.inline(md,{b:true}),width,size),x,size,color);};
  w.h1=(s,label)=>{w.newPage();w.font('bold',9,MUTED);w.text(label.toUpperCase(),M,w.y);w.y+=3;w.heading(s,22);w.rect(M,w.y+1,24,1.2,'#177d88');w.y+=8;};
  w.h2=(s,color=INK)=>{w.need(28);w.y+=2;w.heading(s,14,color);w.y+=1.5;};
  w.h3=(s,color=INK)=>{w.need(24);w.heading(s,11,color);w.y+=1;};
  /* tafla; frumur mega innihalda markdown innan línu */
  w.table=(cols,rows,{size=9,zebra=true}={})=>{
    const pad=1.8,widths=cols.map(c=>c.w*CW);
    const cellOf=c=>typeof c==='object'&&c?c:{t:c};
    const layout=(cells,bold)=>cells.map((c,i)=>{const cell=cellOf(c);return {cell,lines:w.wrap(w.inline(String(cell.t??''),{b:bold||!!cell.bold}),widths[i]-2*pad-(cell.dot?2.6:0),size)};});
    const drawRow=(cells,bg,bold,color,isHead)=>{
      let L=layout(cells,bold);const h=Math.max(...L.map(l=>l.lines.length))*w.lh(size)+2*pad;
      if(w.need(h)&&!isHead)drawRow(cols.map(c=>c.h),'#e4ece8',true,MUTED,true);
      if(bg)w.rect(M,w.y,CW,h,bg);
      let x=M;L.forEach(({cell,lines},i)=>{
        const right=cols[i].right,x0=x+pad+(cell.dot?2.6:0);
        if(cell.dot){w.fill(cell.dot);doc.circle(x+pad+0.9,w.y+pad+1.3,1.1,'F');}
        lines.forEach((ln,k)=>w.drawLine(ln,right?x+widths[i]-pad:x0,w.y+pad+size*0.3528+k*w.lh(size),size,cell.color||color,right?'right':null));
        x+=widths[i];
      });
      w.line(M,w.y+h,M+CW,w.y+h);w.y+=h;
    };
    w.need(w.lh(size)*2+4*pad+8);
    drawRow(cols.map(c=>c.h),'#e4ece8',true,MUTED,true);
    rows.forEach((r,i)=>drawRow(r,zebra&&i%2?'#f6f8f7':null,false,INK,false));
    w.y+=4;
  };
  w.wheel=async(values,o,wmm)=>{const img=await svgToPng(wheelSVG(values,o),1500);const h=wmm*img.ratio;w.need(h+4);doc.addImage(img.data,'PNG',M+(CW-wmm)/2,w.y,wmm,h,undefined,'FAST');w.y+=h+3;};
  w.legend=()=>{w.font('normal',8,MUTED);let x=M+(CW-150)/2;Object.values(GROUPS).forEach(g=>{w.fill(g.color);doc.roundedRect(x,w.y-2.6,3,3,0.6,0.6,'F');w.text(g.name,x+4.5,w.y);x+=50;});w.y+=6;};
  w.band=(label,right,col,sub)=>{w.need(22);w.rect(M,w.y,CW,8,tint(col,0.18),2);w.font('bold',11,col);w.text(label,M+3,w.y+5.6);if(right){w.font('normal',8.5,MUTED);w.text(right,W-M-3,w.y+5.5,{align:'right'});}w.y+=11;};
  w.frame=(head,title)=>{
    const n=doc.getNumberOfPages();
    for(let i=1;i<=n;i++){
      doc.setPage(i);
      if(i>1){w.fill('#177d88');doc.rect(M,10,1.2,5,'F');w.font('bold',8,INK);w.text(head,M+3,14);w.font('normal',8,MUTED);w.text((D.meta.school||'')+' · '+(D.meta.grades||''),W-M,14,{align:'right'});w.line(M,17.5,W-M,17.5);}
      w.line(M,H-12,W-M,H-12);w.font('normal',8,MUTED);w.text(mdPlain(title).slice(0,90),M,H-7.5);w.text(`${i} / ${n}`,W-M,H-7.5,{align:'right'});
    }
  };
  return w;
}
const isDate=d=>d.getDate()+'. '+['janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'][d.getMonth()]+' '+d.getFullYear();

/* Eitt þema; notað bæði í heildarskjali og þegar stakt þema er sótt. */
async function themeSection(w,t){
  const {M,CW,W,MUTED,INK}=w;
  w.font('bold',9,MUTED);w.text([t.year||'Óskilgreint skólaár',t.period,t.kind,t.weeks?fmt(t.weeks)+' vikur':'vikufjölda vantar'].filter(Boolean).join(' · ').toUpperCase(),M,w.y);w.y+=3;
  w.heading(t.title||'Ónefnt þema',18);w.y+=2;
  if(t.summary.trim())w.rich(t.summary,M,CW,10.5);
  const s=shares(t.entries);
  if(s.total){await w.wheel(s.weights,{label:mdPlain(t.title)},92);const n=themeNatt(t);w.font('normal',8.5,MUTED);w.text(`${s.total} áherslulínur · ${CATS.filter(c=>s.counts[c.id]).length} virkir flokkar · um ${Math.round(n*100)}% náttúrugreinar og ${100-Math.round(n*100)}% samfélagsgreinar`,W/2,w.y,{align:'center'});w.y+=7;}
  for(const c of CATS.filter(c=>s.counts[c.id])){
    const col=catColor(c.id);w.band(c.name,`${s.counts[c.id]} af ${s.total} línum · ${pct(s.weights[c.id])}`,col);
    t.entries.filter(e=>e.category===c.id).forEach((e,i)=>{
      w.need(10);w.font('bold',9,col);w.text(String(i+1)+'.',M+1,w.y+3.6);
      w.rich(e.note||'Áhersla án skýringar.',M+7,CW-7,10);
      if(e.criteria.length){w.y-=0.5;w.plain('Hæfniviðmið: '+e.criteria.map(critLabel).join('; '),M+7,CW-7,8.5,'italic',MUTED);w.y+=1.5;}
    });w.y+=2;
  }
  const tp=D.projects.filter(p=>p.theme===t.id);
  if(tp.length){w.h3('Tengd verkefni');w.rich(tp.map(p=>'- '+(p.title||'Ónefnt verkefni')+' ('+(p.kind==='hækkun'?p.points+' stig':'rannsóknarverkefni, metið A, B+ eða B')+')').join('\n'),M,CW,10);}
}

async function buildPDF(opt={themes:true,balance:true,crit:true}){
  const w=await pdfWriter(),{doc,W,M,CW,INK,MUTED}=w;
  const title=D.meta.title||'Skólanámskrá NASA';

  /* forsíða */
  w.rect(0,0,W,78,INK);
  w.font('bold',40,'#ffffff');w.text('NASA',M,34);
  w.font('normal',11,'#c4dace');w.text('Náttúrufræði- og samfélagsgreinar',M,44);w.text(D.meta.school||'',M,51);
  w.font('bold',9,'#c4dace');w.text('SKÓLANÁMSKRÁ',W-M,34,{align:'right'});w.text(D.meta.grades||'',W-M,41,{align:'right'});
  w.y=90;w.heading(title,24);w.y+=2;
  w.plain(['Tímabil: '+cycleYears().join(', '),D.meta.authors?'Ábyrgð: '+D.meta.authors:'','Útgáfa: '+isDate(new Date())].filter(Boolean).join('   ·   '),M,CW,11,'normal',MUTED);w.y+=6;
  await w.wheel(targetWeights(),{label:'Markmið um vægi'},128);w.legend();
  w.plain('Myndin sýnir markmið skólanámskrárinnar um vægi hæfniflokka yfir þriggja ára tímabil. Innri hringurinn er sameiginlegur kjarni greinasviðanna; ytri hringurinn dýpkar náttúrufræði (vinstri) og samfélagsfræði (hægri).',M,CW,9,'normal',MUTED);

  const chapters=['Um kennsluna','Hæfniflokkar','Námsmat','Hækkunar- og rannsóknarverkefni'];
  if(opt.themes&&D.themes.length)chapters.push('Þemu');
  if(opt.balance)chapters.push('Jafnvægi yfir tímabilið');
  let ch=0;const chapter=()=>{w.h1(chapters[ch],'Kafli '+(ch+1));ch++;};

  /* 1. Um kennsluna */
  chapter();
  D.info.forEach(s=>{w.h2(s.title);w.rich(s.body,M,CW,10.5);w.y+=2;});

  /* 2. Hæfniflokkar */
  chapter();
  w.rich('Hæfniviðmið aðalnámskrár eru flokkuð í níu hæfniflokka NASA: þrjá í **sameiginlegum kjarna** og sex sem **dýpka sérstök svið**. Samtals skulu hlutföll hæfniflokka vera 100%. Þegar hæfnisvið eru vegin yfir hvert þriggja ára tímabil skulu þau vera sem næst því hlutfalli sem hér er sett fram.',M,CW,10.5);w.y+=2;
  w.table([{h:'Hæfniflokkur',w:.34},{h:'Svið',w:.17},{h:'Yfirflokkar aðalnámskrár',w:.37},{h:'Vægi',w:.12,right:true}],
    [...CATS.map(c=>[{t:c.name,bold:true,dot:catColor(c.id)},GROUPS[c.group].short,areasOf(c.id).map(a=>a.name).join(', '),fmt(+D.targets[c.id]||0)+'%']),[{t:'Samtals',bold:true},'','',{t:fmt(targetSum())+'%',bold:true}]]);
  const tn=Math.round(targetNatt()*100);
  w.plain(`Samkvæmt markmiðunum skiptist námið um það bil ${tn}% á náttúrugreinar og ${100-tn}% á samfélagsgreinar (markmið aðalnámskrár: ${D.ratio.natt}% / ${100-D.ratio.natt}%). Í kjarnanum er gert ráð fyrir að ${D.ratio.coreNatt}% tilheyri náttúrugreinum nema áherslur séu tengdar hæfniviðmiðum.`,M,CW,10);w.y+=3;
  for(const c of CATS){
    w.need(30);w.band(c.name,GROUPS[c.group].name+' · markmið '+fmt(+D.targets[c.id]||0)+'%',catColor(c.id));
    w.plain(c.desc,M,CW,10);
    if(D.catNotes[c.id].trim()){w.need(10);w.font('bold',9,MUTED);w.text('VIÐFANGSEFNI SKÓLANS',M,w.y+3);w.y+=5;w.rich(D.catNotes[c.id],M,CW,10);}
    w.y+=3;
  }

  /* 3. Námsmat */
  const A=D.assessment;
  chapter();
  w.rich('Notaðir eru hæfniflokkar með bein tengsl við lokaeinkunn. Hverri þemalotu lýkur með **B-prófi**. Nemandi sem nær B öðlast rétt til töku **A-prófs**. Samhliða þemanu geta nemendur unnið **hækkunarverkefni** og nýtt stigin til að hækka einkunn á B-prófi.',M,CW,10.5);
  w.h2('B-próf');w.rich(A.bIntro,M,CW,10.5);
  const sorted=[...A.bBands].sort((a,b)=>b.min-a.min);
  w.table([{h:'Einkunn',w:.16},{h:'Merking',w:.56},{h:'Viðmið',w:.28,right:true}],sorted.map((b,i)=>[{t:b.grade,bold:true},b.label,b.grade==='D'?'undir '+fmt(sorted[i-1]?.min??0)+'%':fmt(b.min)+'% eða meira']));
  w.h3('Forgjöf eftir árgangi');
  w.plain(`Kennslan og námsmatið er aldursblandað. Nemendur í 8. og 9. bekk fá minnkandi forgjöf sem hverfur þegar þeir koma í 10. bekk: ${fmt(A.handicap['8'])} prósentustig í 8. bekk, ${fmt(A.handicap['9'])} í 9. bekk og ${fmt(A.handicap['10'])} í 10. bekk.`,M,CW,10);w.y+=2;
  w.h3('Hækkunarstig');
  w.plain(`Fyrir hækkunarverkefni má fá 1 til 3 stig. Stigin safnast saman og hvert stig hækkar árangur á B-prófi um ${fmt(A.pointValue)} prósentustig${A.maxPoints>0?`, að hámarki ${A.maxPoints} stig á hvert B-próf`:''}. Nemandi sem nær B með eða án hækkunarstiga öðlast rétt til töku A-prófs.`,M,CW,10);w.y+=2;
  w.h2('A-próf og rannsóknarverkefni');w.rich(A.aIntro,M,CW,10.5);
  w.table([{h:'Stig á A-prófi',w:.3},{h:'Niðurstaða',w:.7}],[[`${A.aA}–${A.aMax}`,{t:'A',bold:true}],[`${A.aBplus}–${A.aA-1}`,{t:'B+',bold:true}],[`0–${A.aBplus-1}`,'Einkunn hækkar ekki (helst B)']]);
  w.plain('Ekki er hægt að lækka í einkunn við töku A-prófs.',M,CW,10,'italic');w.y+=2;
  if(A.research.trim())w.rich(A.research,M,CW,10.5);
  w.h2('Lokaeinkunn úr 10. bekk');w.rich(A.finalIntro,M,CW,10.5);
  w.h3('Gildi bókstafseinkunna');
  w.table(LETTERS.map(g=>({h:g,w:1/6})),[LETTERS.map(g=>fmt(A.gradeValues[g],3))]);
  w.h3('Vörpun yfir á talnakvarða');
  const sc=sortedScale();w.table([{h:'Vegið meðaltal',w:.7},{h:'Einkunn',w:.3,right:true}],sc.map((s,i)=>[scaleRange(i,sc),{t:String(s.grade),bold:true}]));
  if(A.support.trim()){w.h3('Stuðningsúrræði');w.rich(A.support,M,CW,10.5);}
  if(A.notes.trim()){w.h3('Annað um námsmat');w.rich(A.notes,M,CW,10.5);}

  /* 4. Verkefni */
  chapter();
  w.rich('**Hækkunarverkefni** eru nemendastýrð verkefni sem nemendur og kennarar koma sér saman um og byggja á hæfniflokkum NASA. **Rannsóknarverkefni** eru stærri verkefni sem nemendur geta unnið þegar þeir hafa ítrekað sýnt fram á afbragðshæfni. Þau styðjast við sama matskvarða og A-próf: A, B+ og B.',M,CW,10.5);
  for(const [kind,label] of [['hækkun','Hækkunarverkefni'],['rannsókn','Rannsóknarverkefni']]){
    const ps=D.projects.filter(p=>p.kind===kind);w.h2(label+' ('+ps.length+')');
    if(!ps.length){w.plain('Engin verkefni skráð.',M,CW,10,'italic',MUTED);continue;}
    for(const p of ps){
      w.need(16);w.fill(catColor(p.category));doc.circle(M+1.5,w.y+2.4,1.3,'F');
      w.heading(p.title||'Ónefnt verkefni',10.5,INK,M+5,CW-5);
      const th=themeById(p.theme);w.plain([CAT[p.category].name,kind==='hækkun'?p.points+' stig':'metið A, B+ eða B',th?'Þema: '+mdPlain(th.title||'Ónefnt'):''].filter(Boolean).join(' · '),M+5,CW-5,8.5,'normal',MUTED);w.y+=0.5;
      if(p.description.trim())w.rich(p.description,M+5,CW-5,9.5);
      w.y+=2;
    }
  }

  /* 5. Þemu */
  if(opt.themes&&D.themes.length){
    chapter();
    const ts=[...D.themes].sort((a,b)=>(a.year||'~').localeCompare(b.year||'~','is')||(a.period||'').localeCompare(b.period||'','is'));
    w.plain(`Í námskránni eru ${ts.length} þemu, samtals ${fmt(ts.reduce((a,t)=>a+(t.weeks||0),0))} vikur. Ein áherslulína jafngildir einni áherslu og vægi hæfniflokks í þema er hlutfall lína í flokknum.`,M,CW,10.5);w.y+=2;
    w.table([{h:'Þema',w:.42},{h:'Skólaár',w:.18},{h:'Lota',w:.2},{h:'Vikur',w:.1,right:true},{h:'Línur',w:.1,right:true}],ts.map(t=>[{t:t.title||'Ónefnt þema',bold:true},t.year||'-',[t.period,t.kind].filter(Boolean).join(' · '),t.weeks?fmt(t.weeks):'-',String(t.entries.length)]));
    for(const t of ts){w.newPage();await themeSection(w,t);}
  }

  /* 6. Jafnvægi */
  if(opt.balance){
    chapter();
    const list=D.themes.filter(t=>cycleYears().includes(t.year)),a=aggregate(list),tw=targetWeights();
    w.plain(`Tímavegið vægi þema á skólaárunum ${cycleYears().join(', ')}: ${a.included.length} þemu, samtals ${fmt(a.weeks)} vikur. Vægi hvers flokks er summa (vikur þema × hlutfall flokks í þemanu) deilt með heildarvikum.`,M,CW,10.5);w.y+=2;
    if(a.weeks){
      await w.wheel(a.weights,{label:'Tímavegið vægi',sub:Object.fromEntries(CATS.map(c=>[c.id,'markmið '+pct(tw[c.id])]))},110);
      w.table([{h:'Hæfniflokkur',w:.46},{h:'Markmið',w:.18,right:true},{h:'Raun',w:.18,right:true},{h:'Frávik',w:.18,right:true}],CATS.map(c=>{const d=(a.weights[c.id]-tw[c.id])*100;return [{t:c.name,dot:catColor(c.id)},pct(tw[c.id]),pct(a.weights[c.id]),{t:(d>0?'+':'')+fmt(d),color:Math.abs(d)>3?'#a3402a':INK}];}));
      const n=Math.round(a.natt*100);w.plain(`Hlutfall greinasviða: ${n}% náttúrugreinar og ${100-n}% samfélagsgreinar (markmið ${D.ratio.natt}% / ${100-D.ratio.natt}%).`,M,CW,10.5,'bold');
      const cov=coverage(list),covered=CRITERIA.filter(c=>cov[c.id].size).length,miss=CRITERIA.filter(c=>!cov[c.id].size);
      w.y+=2;w.plain(`${covered} af ${CRITERIA.length} hæfniviðmiðum aðalnámskrár eru tengd a.m.k. einu þema á tímabilinu.`,M,CW,10.5);
      if(miss.length){w.h3('Hæfniviðmið sem enn eru ótengd');CATS.forEach(c=>{const m=miss.filter(x=>AREA[x.g].nasa===c.id);if(m.length)w.rich('**'+c.name+':** '+m.map(x=>x.s+' ('+AREA[x.g].name+')').join(', '),M,CW,9.5);});}
    }else w.plain('Engin þema á tímabilinu hafa bæði vikufjölda og áherslulínur.',M,CW,10.5,'italic',MUTED);
  }

  /* Viðauki */
  if(opt.crit){
    w.h1('Hæfniviðmið aðalnámskrár eftir hæfniflokkum NASA','Viðauki');
    w.plain('Hæfniviðmið við lok 10. bekkjar úr Aðalnámskrá grunnskóla, 22. kafla (náttúrugreinar) og 24. kafla (samfélagsgreinar). Við lok 10. bekkjar getur nemandi:',M,CW,10.5,'italic',MUTED);w.y+=2;
    for(const c of CATS){
      w.band(c.name,GROUPS[c.group].name,catColor(c.id));
      for(const a of areasOf(c.id)){
        w.h3(a.name+' · '+SUBJECT[a.subject],a.subject==='natt'?'#177d88':'#b86140');
        w.rich(CRITERIA.filter(x=>x.g===a.id).map(x=>`- **${x.s}:** ${x.t}.`).join('\n'),M,CW,9.5);w.y+=1;
      }
    }
  }
  w.frame('NASA · SKÓLANÁMSKRÁ',title);
  return w.doc;
}

async function buildThemePDF(t){
  const w=await pdfWriter(),{W,M,INK}=w;
  w.rect(0,0,W,30,INK);
  w.font('bold',22,'#ffffff');w.text('NASA',M,19);
  w.font('normal',9.5,'#c4dace');w.text('Þemaáætlun · '+(D.meta.school||'')+' · '+(D.meta.grades||''),M+30,18.6);
  w.font('normal',8.5,'#c4dace');w.text(isDate(new Date()),W-M,18.6,{align:'right'});
  w.y=42;await themeSection(w,t);
  w.frame('NASA · ÞEMAÁÆTLUN',t.title||'Ónefnt þema');
  return w.doc;
}

function pdfOpts(){return {themes:$('pdfThemes')?.checked??true,balance:$('pdfBalance')?.checked??true,crit:$('pdfCrit')?.checked??true};}
async function withBusy(btns,fn){
  btns=btns.filter(Boolean);btns.forEach(b=>{b.disabled=true;b.dataset.label=b.textContent;b.textContent='Útbý PDF…';});
  try{await fn();}catch(err){console.error(err);toast('Ekki tókst að útbúa PDF: '+(err.message||err));}
  finally{btns.forEach(b=>{b.disabled=false;b.textContent=b.dataset.label||'Sækja PDF';});}
}
function exportPDF(){return withBusy([$('pdfTop'),$('pdfBtn')],async()=>{const doc=await buildPDF(pdfOpts());download(doc.output('blob'),fileBase()+'.pdf');toast('PDF-skjal sótt.');});}
function exportThemePDF(t,btn){return withBusy([btn],async()=>{const doc=await buildThemePDF(t);download(doc.output('blob'),themeFileBase(t)+'.pdf');toast('PDF fyrir þemað sótt.');});}
async function printDoc(){
  try{
    const doc=await buildPDF(pdfOpts()),blob=doc.output('blob'),u=URL.createObjectURL(blob);
    const win=window.open(u,'_blank');if(!win){download(blob,fileBase()+'.pdf');toast('Sprettigluggi lokaður: PDF var sótt í staðinn.');}
    setTimeout(()=>URL.revokeObjectURL(u),60000);
  }catch(err){toast('Ekki tókst að útbúa skjal til prentunar.');}
}

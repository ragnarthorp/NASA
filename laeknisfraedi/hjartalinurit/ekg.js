'use strict';
/* Hjartalínurit: hermir takta (spenna í mV sem fall af tíma í sekúndum).
   Hvert slag er summa Gauss-bylgna (P, Q, R, S, T). Takturinn ræður hvenær slög koma og hvernig þau líta út. */

const RHYTHMS = {
  sinus:  {name:'Sínustaktur', latin:'rhythmus sinus', hr:[30,200,72], danger:0},
  af:     {name:'Gáttatif', latin:'fibrillatio atriorum', hr:[60,170,110], danger:1},
  flutter:{name:'Gáttaflökt', latin:'flutter atriorum', hr:[75,150,150], danger:1},
  pvc:    {name:'Aukaslög frá sleglum', latin:'extrasystole ventricularis', hr:[50,110,72], danger:0},
  av1:    {name:'AV-rof 1. gráðu', latin:'', hr:[50,110,68], danger:0},
  av3:    {name:'Algjört AV-rof', latin:'3. gráðu AV-rof', hr:[60,110,80], danger:2},
  stemi:  {name:'ST-hækkun', latin:'bráð kransæðastífla', hr:[50,130,85], danger:2},
  vt:     {name:'Sleglahraðtaktur', latin:'tachycardia ventricularis', hr:[140,240,180], danger:2},
  vf:     {name:'Sleglatif', latin:'fibrillatio ventriculorum', hr:null, danger:3},
  asys:   {name:'Rafleysa', latin:'asystolia', hr:null, danger:3},
};

const INFO = {
  sinus:{what:'Sínushnúturinn (SA-hnútur) í hægri gátt er gangráður hjartans. Boðin breiðast um gáttirnar (P-bylgja), tefjast örlítið í AV-hnútnum (PR-bil) og fara svo um His-knippið og Purkinje-þræðina til sleglanna (QRS). T-bylgjan er endurskautun sleglanna.',
    see:['P-bylgja á undan hverjum QRS','Reglulegt bil milli slaga','PR-bil 0,12–0,20 s og mjór QRS (undir 0,12 s)'],
    risk:''},
  af:{what:'Gáttirnar fá óskipuleg boð úr mörgum áttum, mörg hundruð á mínútu, og titra í stað þess að dragast saman. AV-hnúturinn hleypir boðum niður til sleglanna á óreglulegum tíma.',
    see:['Engar P-bylgjur, grunnlínan titrar','Bilið milli QRS er algjörlega óreglulegt','Mjór QRS'],
    risk:'Algengasta takttruflunin, einkum hjá eldra fólki. Blóð getur storknað í gáttunum og valdið heilablóðfalli. Meðhöndlað með blóðþynningu og lyfjum.'},
  flutter:{what:'Eitt boð hringsólar í hægri gátt um 300 sinnum á mínútu. AV-hnúturinn hleypir aðeins hluta boðanna niður, oft öðru hverju (2:1), svo púlsinn verður um 150.',
    see:['Sagtennt grunnlína (F-bylgjur), um 5 á sekúndu','Reglulegir, mjóir QRS'],
    risk:'Ekki bráðhættulegt en þreytandi fyrir hjartað. Oft hægt að lækna með brennsluaðgerð.'},
  pvc:{what:'Fruma í slegli sendir boð of snemma. Boðið fer hægt um vöðvann sjálfan í stað leiðslukerfisins, svo slagið verður breitt og afbrigðilegt. Á eftir kemur hlé.',
    see:['Snemmbúið, breitt slag án P-bylgju','T-bylgja aukaslagsins snýr öfugt','Hlé á eftir (uppbótarhlé)'],
    risk:'Algeng og oftast meinlaus. Fólk finnur fyrir „aukaslagi“ eða að hjartað „sleppi úr“. Kaffi, streita og svefnleysi geta aukið þau.'},
  av1:{what:'Boðin tefjast lengur en eðlilegt er í AV-hnútnum, en þau komast öll í gegn.',
    see:['PR-bil lengra en 0,20 s, meira en einn stór reitur','Annars eðlilegt rit'],
    risk:'Oftast meinlaust. Sést stundum hjá vel þjálfuðu íþróttafólki.'},
  av3:{what:'Engin boð komast frá gáttum til slegla. Gáttirnar slá í takt við sínushnútinn en sleglarnir fylgja eigin varagangráði, sem er miklu hægari (30–40 slög á mínútu).',
    see:['P-bylgjur og QRS koma óháð hvort öðru','Hægur, breiður QRS','PR-bilið er alltaf breytilegt'],
    risk:'Svimi, yfirlið og mæði því heilinn fær of lítið blóð. Meðhöndlað með gangráði.'},
  stemi:{what:'Kransæð lokast og hluti hjartavöðvans fær ekki súrefni (hjartaáfall, infarctus myocardii). Skaddaði vöðvinn breytir rafsviði hjartans.',
    see:['ST-bilið, milli QRS og T, liggur hátt yfir grunnlínu','T-bylgjan rennur saman við ST-bilið'],
    risk:'Bráðatilfelli: hringja í 112. Opna þarf æðina sem fyrst með hjartaþræðingu. „Tími er hjartavöðvi.“'},
  vt:{what:'Boð hringsóla í slegli og hann slær 150–250 sinnum á mínútu. Sleglarnir ná ekki að fyllast af blóði milli slaga.',
    see:['Breiðir, reglulegir og hraðir QRS','Engar sjáanlegar P-bylgjur'],
    risk:'Lífshættulegt. Getur breyst í sleglatif. Oft þarf rafstuð.'},
  vf:{what:'Sleglarnir titra óskipulega og dæla engu blóði. Þetta er hjartastopp.',
    see:['Óreglulegar bylgjur af öllum stærðum','Engir QRS og enginn púls'],
    risk:'Hringja í 112, hefja hjartahnoð og nota hjartastuðtæki (AED) strax. Rafstuðið getur komið á eðlilegum takti aftur.'},
  asys:{what:'Engin rafvirkni er í hjartanu. Þetta er hjartastopp.',
    see:['Nánast bein lína'],
    risk:'Hjartahnoð og lyf. Rafstuð virkar ekki á beina línu, þótt bíómyndir sýni það oft.'},
};

/* Flokkar sem nemendur eiga að þekkja í æfingunni. */
const CATS = [
  {id:'normal', name:'Eðlilegur sínustaktur', r:'sinus', hr:[62,95]},
  {id:'brady',  name:'Hægtaktur',             r:'sinus', hr:[36,52]},
  {id:'tachy',  name:'Hraðtaktur',            r:'sinus', hr:[115,165]},
  {id:'af',     name:'Gáttatif',              r:'af',    hr:[85,140]},
  {id:'flutter',name:'Gáttaflökt',            r:'flutter',hr:[150,150]},
  {id:'pvc',    name:'Aukaslög frá sleglum',  r:'pvc',   hr:[64,84]},
  {id:'av1',    name:'AV-rof 1. gráðu',       r:'av1',   hr:[58,80]},
  {id:'av3',    name:'Algjört AV-rof',        r:'av3',   hr:[70,95]},
  {id:'stemi',  name:'ST-hækkun',             r:'stemi', hr:[70,100]},
  {id:'vt',     name:'Sleglahraðtaktur',      r:'vt',    hr:[160,210]},
  {id:'vf',     name:'Sleglatif',             r:'vf',    hr:[0,0]},
  {id:'asys',   name:'Rafleysa',              r:'asys',  hr:[0,0]},
];

const G=(t,c,s)=>{const x=(t-c)/s;return Math.exp(-0.5*x*x);};
const sig=x=>1/(1+Math.exp(-x));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const rnd=(a,b)=>a+Math.random()*(b-a);

/* Straumur slaga fyrir einn takt. ensure(t) býr til slög fram að tíma t. */
function makeStream(r, hr, opts={}){
  const S={r, hr, beats:[], ps:[], tEnd:0, next:opts.start??0.35, last:null, cnt:0, k:4, nextP:opts.start??0.3, nextV:0.9};
  const pr = r==='av1'?0.32:0.16;
  function addSinus(tq,rr,st){
    const qt=clamp(0.4*Math.sqrt(rr),0.3,0.46);
    S.ps.push({tp:tq-0.04-pr+0.05});
    S.beats.push({tq,kind:'N',rr,tT:tq-0.04+qt-0.09,tw:0.045*clamp(Math.sqrt(rr),0.8,1.1),st:st||0,pTime:tq-0.04-pr+0.05});
  }
  S.ensure=function(until){
    while(S.tEnd<until){
      const base=60/Math.max(1,S.hr);
      if(r==='sinus'||r==='av1'||r==='stemi'){
        const rr=base*(1+rnd(-0.02,0.02));
        addSinus(S.next,rr,r==='stemi'?0.28:0);S.next+=rr;S.tEnd=S.next;
      }else if(r==='pvc'){
        const rr=base*(1+rnd(-0.02,0.02));
        if(S.last==null){addSinus(S.next,rr);S.last=S.next;S.tEnd=S.last+rr;continue;}
        S.cnt++;
        if(S.cnt>=S.k){
          S.beats.push({tq:S.last+0.55*rr,kind:'V',rr});
          const t2=S.last+2*rr;addSinus(t2,rr);S.last=t2;S.cnt=0;S.k=Math.floor(rnd(3,6));
        }else{const t2=S.last+rr;addSinus(t2,rr);S.last=t2;}
        S.tEnd=S.last+rr;
      }else if(r==='af'){
        const rr=base*rnd(0.6,1.4);
        S.beats.push({tq:S.next,kind:'N',rr,tT:S.next+0.22,tw:0.04,st:0});S.next+=rr;S.tEnd=S.next;
      }else if(r==='flutter'){
        const ratio=clamp(Math.round(300/S.hr),2,4), rr=0.2*ratio;
        S.beats.push({tq:S.next,kind:'N',rr,tT:S.next+0.2,tw:0.035,st:0});S.next+=rr;S.tEnd=S.next;
      }else if(r==='av3'){
        // Gáttir og sleglar óháð hvort öðru.
        const pp=base*(1+rnd(-0.02,0.02));
        while(S.nextP<S.tEnd+3){S.ps.push({tp:S.nextP});S.nextP+=pp;}
        const vv=60/38*(1+rnd(-0.02,0.02));
        S.beats.push({tq:S.nextV,kind:'E',rr:vv});S.nextV+=vv;S.tEnd=S.nextV;
      }else if(r==='vt'){
        const rr=60/clamp(S.hr,140,240);
        S.beats.push({tq:S.next,kind:'VT',rr});S.next+=rr;S.tEnd=S.next;
      }else{S.tEnd=until+5;} // vf, asys: engin slög
    }
  };
  S.setHr=function(h){S.hr=h;};
  return S;
}

function lower(arr,key,t){let lo=0,hi=arr.length;while(lo<hi){const m=(lo+hi)>>1;if(arr[m][key]<t)lo=m+1;else hi=m;}return lo;}

/* Spenna í mV á tíma t. */
function voltage(S,t){
  let v=0.02*Math.sin(2*Math.PI*0.23*t);           // hæg sveifla grunnlínu (öndun)
  const r=S.r;
  if(r!=='af'&&r!=='flutter'){
    for(let i=lower(S.ps,'tp',t-0.15);i<S.ps.length&&S.ps[i].tp<t+0.15;i++)v+=0.15*G(t,S.ps[i].tp,0.022);
  }
  for(let i=lower(S.beats,'tq',t-0.8);i<S.beats.length&&S.beats[i].tq<t+0.35;i++){
    const b=S.beats[i],q=b.tq;
    if(b.kind==='N'){
      v+=-0.08*G(t,q-0.022,0.008)+1.1*G(t,q,0.009)-0.22*G(t,q+0.022,0.008);
      v+=(b.st?0.38:0.28)*G(t,b.tT,b.tw);
      if(b.st)v+=b.st*sig((t-(q+0.03))/0.006)*(1-sig((t-(b.tT+0.03))/0.03));
    }else if(b.kind==='V'){
      v+=1.45*G(t,q,0.03)-0.5*G(t,q+0.065,0.03)-0.38*G(t,q+0.3,0.06);
    }else if(b.kind==='E'){
      v+=0.95*G(t,q,0.024)-0.32*G(t,q+0.05,0.024)+0.26*G(t,q+0.34,0.06);
    }else if(b.kind==='VT'){
      v+=1.25*G(t,q,0.045)-0.95*G(t,q+0.13,0.05);
    }
  }
  if(r==='af')v+=0.05*Math.sin(2*Math.PI*6.3*t)+0.04*Math.sin(2*Math.PI*8.7*t+1)+0.03*Math.sin(2*Math.PI*11.1*t+2);
  if(r==='flutter'){const ph=(((t+0.08)%0.2)+0.2)%0.2/0.2;v+=ph<0.75?0.1-0.27*ph/0.75:-0.17+0.27*(ph-0.75)/0.25;}
  if(r==='vf'){const a=0.35+0.2*Math.sin(2*Math.PI*0.3*t);v+=a*(Math.sin(2*Math.PI*5.1*t)+0.6*Math.sin(2*Math.PI*3.7*t+1.3)+0.4*Math.sin(2*Math.PI*7.3*t+0.4))/1.6;}
  if(r==='asys')v+=0.01*Math.sin(2*Math.PI*1.3*t);
  return v;
}

/* Púls: meðalbil síðustu slaga fram að tíma t. */
function pulseAt(S,t){
  const i=lower(S.beats,'tq',t)-1;
  if(i<1||t-S.beats[i].tq>3)return 0;
  const n=Math.min(4,i);return Math.round(60*n/(S.beats[i].tq-S.beats[i-n].tq));
}

/* Hvaða hluti hjartans er virkur á tíma t (0–1). */
function activity(S,t){
  const a={atria:0,av:0,vent:0,repol:0,label:'Hvíld milli slaga'};
  const r=S.r;
  if(r==='af'){a.atria=0.35+0.35*Math.abs(Math.sin(t*37)*Math.sin(t*23));}
  else if(r==='flutter'){a.atria=0.3+0.5*Math.max(0,Math.sin(2*Math.PI*5*t));}
  else for(let i=lower(S.ps,'tp',t-0.2);i<S.ps.length&&S.ps[i].tp<t+0.1;i++)a.atria=Math.max(a.atria,G(t,S.ps[i].tp+0.01,0.04));
  if(r==='vf'){a.vent=0.3+0.5*Math.abs(Math.sin(t*31)*Math.sin(t*17));}
  for(let i=lower(S.beats,'tq',t-0.6);i<S.beats.length&&S.beats[i].tq<t+0.4;i++){
    const b=S.beats[i];
    if(b.kind==='N'&&b.pTime!=null&&t>b.pTime+0.04&&t<b.tq-0.03)a.av=1;
    if(b.kind==='N'&&(r==='af'||r==='flutter')&&t>b.tq-0.09&&t<b.tq-0.03)a.av=1;
    const w=b.kind==='N'?0.035:0.06;
    a.vent=Math.max(a.vent,G(t,b.tq,w));
    const tT=b.tT??b.tq+0.3;
    a.repol=Math.max(a.repol,G(t,tT,0.07));
  }
  if(r==='vf')a.label='Sleglarnir titra óskipulega og dæla engu';
  else if(r==='asys')a.label='Engin rafvirkni';
  else if(a.vent>0.4)a.label='Sleglarnir afskautast og dragast saman (QRS)';
  else if(a.av)a.label='Boðin tefjast í AV-hnútnum (PR-bil)';
  else if(a.atria>0.45&&r!=='af'&&r!=='flutter')a.label='Gáttirnar afskautast og dragast saman (P)';
  else if(a.repol>0.4)a.label='Sleglarnir endurskautast og slaka á (T)';
  else if(r==='af')a.label='Gáttirnar titra óskipulega';
  else if(r==='flutter')a.label='Boð hringsólar í hægri gátt';
  return a;
}

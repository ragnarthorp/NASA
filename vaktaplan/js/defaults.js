'use strict';
/* Sjálfgefin gögn og sýnidæmi fyrir vaktaplanið. */
(function(root){
const uid=(p='x')=>p+Math.random().toString(36).slice(2,9);
function nextPeriod(today=new Date()){
  let y=today.getFullYear(),m=today.getMonth()+1;
  if(today.getDate()>=16){m++;if(m>12){m=1;y++;}}       // næsta tímabil sem ekki er hafið
  return {year:y,month:m};
}
const SHIFT_COLORS=['#f3c969','#8fc1e3','#9b8fd6','#8cd1a8','#f2a07b','#e59ac2','#b7c96a','#6fc7c1','#d9a96b','#a3b1c6'];
function defaultRules(){
  return {weekly:40,minRest:11,maxConsec:6,maxOver:4,hourTolerance:6,hardWishes:true,fillUp:true,wishFirst:true,lockManual:true,holidaysReduce:true,
    dayStart:'08:00',dayEnd:'17:00',eveningEnd:'24:00',rates:{evening:33.33,night:45,weekend:45,red:45,major:90}};
}
function defaultAbsTypes(){
  return [
    {id:'aO',code:'O',name:'Orlof',color:'#bfe3c9',credit:true},
    {id:'aV',code:'V',name:'Veikindi',color:'#f4c2c2',credit:true},
    {id:'aNk',code:'Nk',name:'Námskeið',color:'#d6d1f0',credit:true},
    {id:'aL',code:'L',name:'Launalaust leyfi',color:'#e2e2e2',credit:false}
  ];
}
/* Fast vaktaskipulag (sjálfgefið). Mönnun: [mán,þri,mið,fim,fös,lau,sun,rauður dagur,stórhátíð]; autt = eins og sunnudagur.
   Virkir dagar: 1×8–13 (+2 á fimmtudögum), 1×8–16, 1×9–16, 1×14–21, 2×16–23. Helgar: 2×9–16, 1×12–20, 2×16–23.
   Nætur: 23–08, en 23–09 aðfaranótt laugardags og sunnudags. */
function standardShifts(){
  const S=(id,code,name,start,end,color,cat,demand)=>({id,code,name,start,end,break:0,color,cat,demand,max:'',countsAs:''});
  return [
    S('s813','8-13','Morgunvakt 8–13','08:00','13:00','#f6d88a','morning',[1,1,1,3,1,0,0,'','']),
    S('s816','8-16','Morgunvakt 8–16','08:00','16:00','#f3c969','morning',[1,1,1,1,1,0,0,'','']),
    S('s916','9-16','Morgunvakt 9–16','09:00','16:00','#e9b949','morning',[1,1,1,1,1,0,0,'','']),
    S('s1421','14-21','Kvöldvakt 14–21','14:00','21:00','#a9cfe8','evening',[1,1,1,1,1,0,0,'','']),
    S('s1623','16-23','Kvöldvakt 16–23','16:00','23:00','#8fc1e3','evening',[2,2,2,2,2,0,0,'','']),
    S('sH916','9-16','Helgarvakt 9–16','09:00','16:00','#f2a07b','weekendMorning',[0,0,0,0,0,2,2,'','']),
    S('sH1220','12-20','Millivakt um helgi 12–20','12:00','20:00','#8cd1a8','weekendMid',[0,0,0,0,0,1,1,'','']),
    S('sH1623','16-23','Kvöldvakt um helgi 16–23','16:00','23:00','#6fc7c1','weekendEvening',[0,0,0,0,0,2,2,'','']),
    S('sN','23-8','Næturvakt 23–08','23:00','08:00','#9b8fd6','night',[1,1,1,1,0,0,1,'','']),
    S('sNH','23-9','Næturvakt um helgi 23–09','23:00','09:00','#7d6fc4','night',[0,0,0,0,1,1,0,'',''])
  ];
}
function sampleState(){
  const shifts=standardShifts();
  const E=(name,title,pct,prefLevels={},extra={})=>({id:uid('e'),name,title,pct,status:'active',prefLevels,priority:2,fixedShift:'',maxWeekends:'',maxConsec:'',
    prefs:[],changes:[],allowed:[],noDays:[],carry:0,fixedTarget:'',weekly:'',note:'',...extra});
  const employees=[
    E('Anna Jónsdóttir','Sjúkraliði',100,{morning:2,night:0},{fixedShift:'s816',weekly:40,noDays:[5,6]}),
    E('Bjarni Sigurðsson','Starfsmaður',80,{evening:2,weekendEvening:2}),
    E('Guðrún Helgadóttir','Starfsmaður',90,{morning:2,weekendMorning:2,night:0}),
    E('Ólafur Pétursson','Starfsmaður',80,{night:2},{priority:1}),
    E('Sigríður Kristjánsdóttir','Starfsmaður',80,{evening:2,night:0}),
    E('Jón Einarsson','Starfsmaður',70,{night:2,morning:0,evening:0}),
    E('Katrín Magnúsdóttir','Starfsmaður',100,{}),
    E('Helgi Þórsson','Starfsmaður',60,{weekendMorning:2,weekendMid:2,weekendEvening:2},{maxWeekends:3}),
    E('María Gunnarsdóttir','Starfsmaður',50,{evening:2,night:0}),
    E('Pétur Ágústsson','Starfsmaður',80,{}),
    E('Sara Ólafsdóttir','Starfsmaður',70,{morning:2}),
    E('Tómas Guðmundsson','Starfsmaður',60,{weekendEvening:2,evening:2})
  ];
  return {version:1,workplace:{name:'Vinnustaðurinn minn',unit:'',manager:''},period:nextPeriod(),rules:{...defaultRules(),weekly:36},
    shifts,absTypes:defaultAbsTypes(),employees,holidays:null,plan:{},locks:{},wishes:{},needOverride:{}};
}
const API={uid,nextPeriod,defaultRules,defaultAbsTypes,sampleState,standardShifts,SHIFT_COLORS};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VPD=API;
})(typeof window!=='undefined'?window:globalThis);

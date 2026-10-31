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
  return {weekly:40,minRest:11,maxConsec:6,maxOver:4,hourTolerance:6,hardWishes:true,fillUp:true,lockManual:true,holidaysReduce:true,
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
function sampleState(){
  const shifts=[
    {id:'sD',code:'D',name:'Dagvakt',start:'08:00',end:'16:00',break:0,color:'#f3c969',demand:[2,2,2,2,2,2,2,2,2],max:''},
    {id:'sK',code:'K',name:'Kvöldvakt',start:'16:00',end:'24:00',break:0,color:'#8fc1e3',demand:[2,2,2,2,2,2,2,2,2],max:''},
    {id:'sN',code:'N',name:'Næturvakt',start:'23:30',end:'08:00',break:0,color:'#9b8fd6',demand:[1,1,1,1,1,1,1,1,1],max:''}
  ];
  const E=(name,title,pct,allowed=[],noDays=[])=>({id:uid('e'),name,title,pct,allowed,noDays,carry:0,fixedTarget:'',note:''});
  const employees=[
    E('Anna Jónsdóttir','Deildarstjóri',100,['sD'],[5,6]),
    E('Bjarni Sigurðsson','Sjúkraliði',100),
    E('Guðrún Helgadóttir','Sjúkraliði',90,['sD','sK']),
    E('Ólafur Pétursson','Hjúkrunarfræðingur',80),
    E('Sigríður Kristjánsdóttir','Sjúkraliði',80,['sD','sK']),
    E('Jón Einarsson','Starfsmaður',70,['sN']),
    E('Katrín Magnúsdóttir','Hjúkrunarfræðingur',100),
    E('Helgi Þórsson','Starfsmaður',60,['sD','sK']),
    E('María Gunnarsdóttir','Starfsmaður',50,['sK','sN']),
    E('Pétur Ágústsson','Sjúkraliði',80)
  ];
  return {version:1,workplace:{name:'Vinnustaðurinn minn',unit:'',manager:''},period:nextPeriod(),rules:defaultRules(),
    shifts,absTypes:defaultAbsTypes(),employees,holidays:null,plan:{},locks:{},wishes:{},needOverride:{}};
}
const API={uid,nextPeriod,defaultRules,defaultAbsTypes,sampleState,SHIFT_COLORS};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VPD=API;
})(typeof window!=='undefined'?window:globalThis);

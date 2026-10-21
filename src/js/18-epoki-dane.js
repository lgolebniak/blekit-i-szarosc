/* ================= EPOKI: dane jednostek ================= */
const SIDE_ACW=SIDE.map(s=>Object.assign({},s));
function legSlots(u,n){const dir=clDir(u.side),o=[];
  if(u.rf==='testudo'){const rows=Math.ceil(n/3);for(let j=0;j<n;j++){const c=j%3,r=Math.floor(j/3);o.push([(1-c)*6*dir,(r-(rows-1)/2)*6]);}return o;}
  if(u.rf==='wedge'){for(let j=0;j<n;j++){const r=Math.ceil(j/2),sd=j%2?-1:1;o.push([-dir*r*7,j?sd*r*7:0]);}return o;}
  if(u.rf==='orbis'){for(let j=0;j<n;j++){const a=j/n*TAU;o.push([Math.cos(a)*13,Math.sin(a)*13]);}return o;}
  return infSlots(u,n);}
function mgSlots(u,n){const d=clDir(u.side);return[[5*d,0],[-5*d,-6],[-5*d,6]].slice(0,n);}
const RF_NAME={line:'Linia',testudo:'Żółw',wedge:'Klin',orbis:'Koło'};
const KD={
  inf:{base:'inf',men:6,name:'Piechota',unit:'Pułk',pick:'x',pos:[150,270],ai:'flat',beh:'acwInf',label:'Ludzie'},
  cav:{base:'cav',men:4,name:'Kawaleria',unit:'Szwadron',pick:'y',pos:[72,'cav'],ai:'cav',beh:'acwSabre',label:'Jeźdźcy'},
  lan:{base:'cav',men:4,lance:true,name:'Ułani',unit:'Szwadron ułanów',pick:'y',pos:[72,'cav'],ai:'lance',beh:'acwLance',label:'Jeźdźcy'},
  art:{base:'art',men:3,name:'Artyleria',unit:'Bateria',pick:'b',pos:[44,'art'],two:true,ai:'artArc',beh:'acwCannon',label:'Kanonierzy'},
  // --- Rzym ---
  leg:{base:'inf',men:8,name:'Legioniści',unit:'Kohorta',pick:'x',pos:[165,270],ai:'leg',beh:'leg',label:'Legioniści',slots:legSlots,init:u=>{u.rf='line';},
    status:u=>`${RF_NAME[u.rf]}${u.formT>0?' (zmiana)':''} · A: szyk · RT: pilum${u.cd2>0?` za ${Math.ceil(u.cd2)} s`:''}`},
  arc:{base:'inf',men:6,name:'Łucznicy',unit:'Oddział łuczników',pick:'x',pos:[100,150],ai:'arc',beh:'arc',label:'Łucznicy',init:u=>{u.aimMin=60;u.aimMax=360;u.reloadMax=3;},
    status:u=>u.aiming?`Odległość ${Math.round((u.aimR-60)/300*100)}% – puść A`:u.reload>0?'Napinają łuki…':'A: na wprost · trzymaj: łukiem'},
  eq:{base:'cav',men:4,name:'Jazda',unit:'Ala jazdy',pick:'y',pos:[72,'cav'],ai:'cav',beh:'acwSabre',label:'Jeźdźcy'},
  bal:{base:'art',men:2,name:'Balista',unit:'Balista',pick:'b',pos:[44,170],ai:'artFlat',beh:'bal',label:'Obsługa',init:u=>{u.reloadMax=3.5;u.maxR=820;},
    status:u=>u.reload>0?'Napinanie cięciwy…':'Gotowa – A: bełt na wprost (przebija szereg)'},
  ona:{base:'art',men:3,name:'Onager',unit:'Onager',pick:'b',pos:[44,370],ai:'artArc',beh:'acwCannon',label:'Obsługa',
    init:u=>{u.fixedElev=60;u.minR=150;u.maxR=620;u.reloadBase=10;u.noPowder=true;u.projKind='stone';u.aimSpd=240;}},
  // --- Wrzesień 1939 ---
  rif:{base:'inf',men:6,name:'Piechota',unit:'Pluton',pick:'x',pos:[165,270],ai:'flat',beh:'rif',label:'Żołnierze',range:230,gren:true,init:u=>{u.reloadMax=1.7;},
    status:u=>`${u.supT>0?'PRZYGWOŻDŻENI · ':''}${u.coneOn?'SKOS – drążek góra–dół, puść A':u.reload>0?'Przeładowanie':'A: ogień · trzymaj = skos'} · RT: granat${u.cd2>0?` (${Math.ceil(u.cd2)} s)`:''}`},
  mg:{base:'inf',men:3,name:'Ckm',unit:'Drużyna ckm',pick:'x',pos:[110,150],ai:'mg',beh:'mg',label:'Obsługa',slots:mgSlots,init:u=>{u.mgY=0;u.heat=0;},
    status:u=>u.over?'Lufa przegrzana – czekaj':u.firing?'SERIA – drążek sieje na boki':'Trzymaj A = seria'},
  tank:{base:'tank',men:1,name:'Czołg',unit:'Czołg',pick:'y',pos:[84,400],ai:'tank',beh:'tank',label:'Pancerz',init:u=>{u.reloadMax=3.2;u.track=false;},
    status:u=>`${u.reload>0?'Ładowanie działa':'A: działo'} · RT: km`},
  at:{base:'art',men:3,name:'Działo ppanc',unit:'Działo ppanc',pick:'b',pos:[44,170],ai:'artFlat',beh:'at',label:'Obsługa',init:u=>{u.reloadMax=2.6;u.maxR=820;},
    status:u=>u.coneOn?'SKOS – drążek góra–dół, puść A':u.reload>0?'Ładowanie':'A: strzał · trzymaj = skos'},
  mor:{base:'art',men:2,name:'Moździerz',unit:'Moździerz',pick:'b',pos:[44,370],ai:'artArc',beh:'acwCannon',label:'Obsługa',mor:true,
    init:u=>{u.fixedElev=70;u.minR=90;u.maxR=600;u.reloadBase=4.5;u.projKind='mshell';u.ammo2='he';u.aimSpd=300;},
    status:u=>acwStatus(u)+` · ${u.ammo2==='smoke'?'DYM':'odłamkowy'} (RT)`}
};
const ERAS={
  acw:{name:'Wojna secesyjna',years:'1861 – 1865',keys:['inf','cav','lan','art'],presets:PRESETS,max:{inf:12,cav:8,lan:6,art:4},info:null,
    hint:'X piechota · Y konnica · B armata · LB/RB'},
  rome:{name:'Legiony Rzymu',years:'49 p.n.e. · Cezar kontra Pompejusz',keys:['leg','arc','eq','bal','ona'],
    presets:[{n:'Legion',leg:6,arc:2,eq:2,bal:1,ona:1},{n:'Mur tarcz',leg:8,arc:1,eq:1,bal:1,ona:1},{n:'Grad strzał',leg:4,arc:4,eq:2,bal:1,ona:1},{n:'Machiny',leg:5,arc:2,eq:1,bal:2,ona:2},{n:'Jazda',leg:5,arc:1,eq:4,bal:1,ona:1}],
    max:{leg:12,arc:6,eq:6,bal:3,ona:3},
    info:{leg:['Legioniści','8 ludzi · tarcza i miecz','A: linia → żółw → klin → koło · RT: pilum'],arc:['Łucznicy','6 łuczników · strzał po łuku','Krótko A: na wprost. Trzymaj: łukiem ponad przeszkodami.'],
      eq:['Jazda','4 jeźdźców · szyk, galop, dęba','A: cios. Nie cofa się.'],bal:['Balista','ciężki bełt płasko na wprost','Przebija do 3 ludzi w linii. Tylko góra–dół.'],
      ona:['Onager','kamień wysokim łukiem','Łamie żółwia i mosty. Ładuje ~10 s.']},
    hint:'X piechota/strzelcy · Y jazda/słonie · B machiny · RT pilum',
    sides:[{name:'Cezar',gen:'Cezara',coat:'#a8322b',coatD:'#7a2019',pants:'#c99a6e',hat:'#a8aeb2',ui:'#ff8a78',uiD:'#7a2a22',flag:['#a8322b','#e0b84a'],shield:'#b8302a',crest:'#e8c04a'},
           {name:'Pompejusz',gen:'Pompejusza',coat:'#d8d0b6',coatD:'#aaa288',pants:'#c99a6e',hat:'#a8aeb2',ui:'#86b4ff',uiD:'#2b4a8f',flag:['#2b4a8f','#e8e2d0'],shield:'#2d4f96',crest:'#e8e2d0'}]},
  ww2:{name:'Wrzesień 1939',years:'Polska kontra Niemcy',keys:['rif','mg','tank','at','mor'],
    presets:[{n:'Batalion',rif:5,mg:2,tank:2,at:2,mor:1},{n:'Pancerni',rif:4,mg:1,tank:4,at:2,mor:1},{n:'Obrona',rif:5,mg:3,tank:1,at:2,mor:1},{n:'Ogień',rif:4,mg:2,tank:2,at:1,mor:3},{n:'Piechota',rif:8,mg:2,tank:1,at:1,mor:0}],
    max:{rif:10,mg:4,tank:4,at:3,mor:3},
    info:{rif:['Piechota','6 żołnierzy · karabiny, granaty','A: ogień na wprost · RT: granat (psuje gąsienice).'],mg:['Ckm','3 ludzi · ciągła seria','Trzymaj A i prowadź serię. Przygważdża piechotę.'],
      tank:['Czołg','pancerz mocny z przodu','A: działo · RT: km. Rozjeżdża piechotę.'],at:['Działo ppanc','strzał płaski na wprost','Z bliska przebija czołg od przodu.'],
      mor:['Moździerz','wysoki tor, odłamki lub dym','RT: zmiana amunicji. Dym zasłania ogień.']},
    hint:'X piechota/ckm/rusznica · Y czołg · B działo/moździerz · RT',
    sides:[{name:'Polacy',gen:'Polaków',coat:'#6d6b3e',coatD:'#50502d',pants:'#5f5e36',hat:'#585a33',ui:'#ff7a7a',uiD:'#8a2a2a',flag:['#ffffff','#d4213d'],veh:'#5e5a38',helm:'pl'},
           {name:'Niemcy',gen:'Niemców',coat:'#5e6655',coatD:'#454c40',pants:'#4f5648',hat:'#4c5149',ui:'#c8d4c0',uiD:'#4a5048',flag:['#4c5149','#c8d4c0'],veh:'#585d5e',helm:'de'}]}
};
let ERA=ERAS.acw;
function setEra(e){G.era=e;ERA=ERAS[e];TYPES=ERA.keys;PRESETS=ERA.presets;MAXT=ERA.max;
  for(let i=0;i<2;i++){Object.assign(SIDE[i],SIDE_ACW[i]);if(ERA.sides)Object.assign(SIDE[i],ERA.sides[i]);}
  for(let p=0;p<2;p++){const a=G.army[p];for(const k in a)if(KD[k])delete a[k];Object.assign(a,PRESETS[0]);delete a.n;a.preset=0;a.ready=false;a.row=0;}
  if(e!=='acw')G.rules='classic';}
G.era='acw';


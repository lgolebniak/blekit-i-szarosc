/* ================= JEDNOSTKI I STAN ================= */
const SPEC={
  inf:{men:6,spd:20,range:125,reload:3.4,r:20,name:'Piechota',unit:'Pułk'},
  cav:{men:4,spd:40,r:22,name:'Kawaleria',unit:'Szwadron'},
  art:{men:3,spd:13,range:380,min:70,reload:5.5,r:16,name:'Artyleria',unit:'Bateria'},
  tank:{men:1,spd:26,r:14,name:'Czołg',unit:'Czołg'}
};
const FORM={line:{spd:1,fire:1,label:'Linia'},col:{spd:1.35,fire:.34,label:'Kolumna'},sq:{spd:.35,fire:.6,label:'Czworobok'}};
const ROM=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const SIDE=[
  {name:'Niebiescy',gen:'Niebieskich',coat:'#2b4a8f',coatD:'#1c3163',pants:'#6d88c0',hat:'#18244a',ui:'#78a4ff',uiD:'#23407e',flag:['#2b4a8f','#ece6d2']},
  {name:'Szarzy',gen:'Szarych',coat:'#8f928a',coatD:'#6a6d66',pants:'#a8986e',hat:'#524f47',ui:'#e6b45e',uiD:'#7a6440',flag:['#a8322b','#dccb98']}
];
const HORSE=['#6b4423','#4a2f1a','#8a5a2b','#3a2c22'],HORSED=['#4a2e16','#2e1d10','#5e3c1c','#221a14'];
const WINSCORE=90;
let PRESETS=[{n:'Zrównoważona',inf:6,cav:2,lan:2,art:2},{n:'Mur piechoty',inf:9,cav:1,lan:0,art:2},{n:'Szarża',inf:4,cav:4,lan:3,art:1},{n:'Grom armat',inf:6,cav:1,lan:1,art:4},{n:'Ułani',inf:5,cav:1,lan:4,art:2}];
let TYPES=['inf','cav','lan','art'];
let MAXT={inf:12,cav:8,lan:6,art:4};

const G={state:'title',mode:'pvp',sel0:0,help:false,helpPage:0,rules:'classic',res:[{inf:0,cav:0,lan:0,art:0},{inf:0,cav:0,lan:0,art:0}],spawnQ:[],csel:[0,0],cpu:{},
  army:[{inf:6,cav:2,lan:2,art:2,row:0,ready:false,preset:0},{inf:6,cav:2,lan:2,art:2,row:0,ready:false,preset:0}],dying:[],loose:[],
  mapSel:0,weatherSel:0,mapRow:0,terr:null,tctx:null,weather:'clear',wind:{x:.5,y:0},
  sel:[0,0],rallyCd:[0,0],score:[0,0],objOwner:-1,objProg:0,t:0,deployT:30,ready:[false,false],
  stats:null,winner:null,reason:'',shake:0,msgs:[],routAll:[0,0],pauseSel:0,endT:0,loadIdx:0};
let units=[],parts=[],projs=[],uid=1;const smokeG=new Float32Array(GW*GH);

const isCPU=s=>G.mode==='cpu'&&s===1;
const humanOf=s=>isCPU(s)?-1:s;
const unitName=u=>u.key&&KD[u.key]?`${ROM[u.num]} ${KD[u.key].unit}`:u.lance?`${ROM[u.num]} Szwadron ułanów`:`${ROM[u.num]} ${SPEC[u.type].unit}`;
const typeName=u=>u.key&&KD[u.key]?KD[u.key].name:u.lance?'Ułani':SPEC[u.type].name;
function msg(side,text){G.msgs.push({side,text,t:0});if(G.msgs.length>6)G.msgs.shift();}

function slot(u,j,n){
  if(u.type==='inf'){if(u.form==='line')return[0,(j-(n-1)/2)*7];
    if(u.form==='col'){const rows=Math.ceil(n/2);return[-(Math.floor(j/2))*7+(rows-1)*3.5,((j%2)-.5)*7];}
    const a=j/n*TAU;return[Math.cos(a)*9,Math.sin(a)*9];}
  if(u.type==='cav'){if(u.form==='col'){const rows=Math.ceil(n/2);return[-(Math.floor(j/2))*12+(rows-1)*6,((j%2)-.5)*11];}return[0,(j-(n-1)/2)*11];}
  return([[-9,-5],[-9,5],[-14,0]])[j]||[-12,0];
}
function placeMen(u,snap,dt){
  let n=0;for(const m of u.men)if(m.alive)n++;
  const c=Math.cos(u.fa),s=Math.sin(u.fa);let j=0;const sp=Math.max(SPEC[u.type].spd*2.2,34)*(u.charging?2:1);
  for(const m of u.men){if(!m.alive)continue;const[f,sd]=slot(u,j++,n);let tx=u.x+c*f-s*sd,ty=u.y+s*f+c*sd;
    if(passF(u.type,tx,ty)<=0&&!u.rout){tx=u.x+(tx-u.x)*.3;ty=u.y+(ty-u.y)*.3;}
    if(snap){m.x=tx;m.y=ty;continue;}
    const dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy);
    if(d>.4){const st=Math.min(d,sp*dt);m.x+=dx/d*st;m.y+=dy/d*st;m.anim+=st*.22;m.mv=1;}else m.mv=Math.max(0,(m.mv||0)-dt*5);}
}
function mkUnit(side,type,num,x,y){
  const fa=side===0?0:Math.PI;
  const u={id:uid++,side,type,num,x,y,fa,men:[],n:SPEC[type].men,morale:100,reload:0,stance:'hold',form:'line',formT:0,ammo:'ball',stamina:100,charging:false,
    rout:false,aimR:150,aiming:false,aimDir:1,setup:0,path:null,pathT:0,pi:0,pgx:0,pgy:0,firedT:0,underFire:0,dead:false,gone:false,moving:false,
    hx:x,hy:y,ai:{role:'enemy',sq:0,autoSq:false,fall:0},hitFlash:0,recoil:0,inMelee:0,kills:0,lance:false};
  for(let i=0;i<SPEC[type].men;i++)u.men.push({x,y,alive:true,anim:Math.random()*4,mv:0,hc:Math.floor(Math.random()*4)});
  placeMen(u,true,0);return u;
}
function nearestPassXY(type,x,y){if(passF(type,x,y)>0)return[x,y];for(let r=6;r<90;r+=6)for(let a=0;a<TAU;a+=.5){const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(passF(type,nx,ny)>0)return[nx,ny];}return[x,y];}
function spawnArmies(){
  units=[];uid=1;
  const ord=k=>k===0?0:(k%2?-1:1)*Math.ceil(k/2);
  for(let side=0;side<2;side++){const a=G.army[side],pos=[];
    for(let k=0;k<a.inf;k++){const col=Math.floor(k/7),r=k%7;pos.push(['inf',k+1,190-col*50,270+ord(r)*42]);}
    const cy=[96,444,54,486,150,390,200,340,120,420,80,460,170,370];const nc=a.cav+(a.lan||0);for(let k=0;k<nc;k++){const L=k>=a.cav;pos.push(['cav',L?k-a.cav+1:k+1,k<4?122:k<8?96:150,cy[k%cy.length],L]);}
    for(let k=0;k<a.art;k++)pos.push(['art',k+1,64,270+ord(k)*58]);
    let ri=0;
    for(const[type,num,x0,y0,L]of pos){let x=x0,y=y0;if(side===1){x=W-x0;if(MAP.def.sym==='rot')y=H-y0;}
      [x,y]=nearestPassXY(type,x,y);const u=mkUnit(side,type,num,x,y);u.lance=!!L;
      if(type==='inf'){u.ai.role=(ri++%3===1)?'obj':'enemy';}
      if(type==='cav'&&num===1)u.ai.role='obj';
      units.push(u);}}
}
function sideUnits(s){return units.filter(u=>u.side===s&&!u.dead&&!u.gone);}
function selUnit(p){return units.find(u=>u.id===G.sel[p]&&!u.dead&&!u.gone)||null;}
function cycleSel(p,dir){const L=sideUnits(p);if(!L.length)return;let i=L.findIndex(u=>u.id===G.sel[p]);i=(i+dir+L.length)%L.length;if(i<0)i=0;G.sel[p]=L[i].id;AU.ui();}
function fixSel(){for(let p=0;p<2;p++){if(!selUnit(p)){const L=sideUnits(p);const nr=L.find(u=>!u.rout)||L[0];G.sel[p]=nr?nr.id:0;}}}


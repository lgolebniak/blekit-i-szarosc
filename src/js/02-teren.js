/* ================= TEREN ================= */
const T={GRASS:0,FOREST:1,WATER:2,FORD:3,BRIDGE:4,ROAD:5,ROCK:6,WALL:7,WHEAT:8,MUD:9,HOUSE:10,PALISADE:11,SWAMP:12,TRENCH:13,SANDBAG:14,RUINS:15,WIRE:16,FENCE:17};
// mnożniki prędkości [piechota, konnica, artyleria]
// mnożniki prędkości [piechota, konnica, artyleria, czołg, słoń]
const TSPD=[[1,1,1,1,1],[.6,.38,.3,.45,.5],[0,0,0,0,0],[.45,.5,.3,.5,.6],[1,1,1,1,1],[1.2,1.2,1.35,1.2,1.1],[0,0,0,0,0],[.4,0,0,.5,0],[.85,.8,.7,.9,.9],[.55,.5,.35,.35,.5],[0,0,0,0,0],
  [.3,0,0,0,0],[.45,.3,.2,.15,.25],[.8,.35,.3,.6,.3],[.45,0,0,.6,0],[.6,.3,0,.3,.3],[0,0,0,.8,.6],[.5,0,0,.8,.5]];
// mnożnik trafienia celu stojącego na danym polu
const TCOVER=[1,.6,1.2,1.2,1,1,1,.5,.85,1,1,.45,1.1,.35,.5,.45,1.1,.7];
const TI={inf:0,cav:1,art:2,tank:3,ele:4};
const OBJ={x:480,y:270,r:46};
const DEPLOY=240;

function MapB(seed){this.t=new Uint8Array(GW*GH);this.h=new Uint8Array(GW*GH);this.n=makeNoise(seed*13+5);}
MapB.prototype.fill=function(v){this.t.fill(v);};
MapB.prototype.each=function(x0,y0,x1,y1,fn){const a=Math.max(0,Math.floor(x0/TS)),b=Math.max(0,Math.floor(y0/TS)),c=Math.min(GW-1,Math.floor(x1/TS)),d=Math.min(GH-1,Math.floor(y1/TS));
  for(let ty=b;ty<=d;ty++)for(let tx=a;tx<=c;tx++)fn(tx,ty,tx*TS+TS/2,ty*TS+TS/2);};
MapB.prototype.circle=function(cx,cy,r,v,rough=.35){const m=r*(1+rough);this.each(cx-m,cy-m,cx+m,cy+m,(tx,ty,px,py)=>{
  const rr=r*(1+rough*(this.n(px/37+cx*.01,py/37)-.5)*2);if(Math.hypot(px-cx,py-cy)<rr)this.t[ty*GW+tx]=v;});};
MapB.prototype.rect=function(x,y,w,h,v){this.each(x,y,x+w-1,y+h-1,(tx,ty)=>{this.t[ty*GW+tx]=v;});};
MapB.prototype.path=function(pts,w,v){for(let i=0;i<pts.length-1;i++){const[ax,ay]=pts[i],[bx,by]=pts[i+1];const L=Math.hypot(bx-ax,by-ay),st=Math.ceil(L/4);
  for(let s=0;s<=st;s++){const k=s/st,x=lerp(ax,bx,k),y=lerp(ay,by,k),rr=w/2+2;this.each(x-rr,y-rr,x+rr,y+rr,(tx,ty,px,py)=>{if(Math.hypot(px-x,py-y)<=rr)this.t[ty*GW+tx]=v;});}}};
MapB.prototype.hill=function(cx,cy,r,l,rough=.3){const m=r*(1+rough);this.each(cx-m,cy-m,cx+m,cy+m,(tx,ty,px,py)=>{
  const rr=r*(1+rough*(this.n(px/45+9,py/45)-.5)*2);if(Math.hypot(px-cx,py-cy)<rr){const i=ty*GW+tx;if(this.h[i]<l)this.h[i]=l;}});};
MapB.prototype.sym=function(mode){for(let ty=0;ty<GH;ty++)for(let tx=GW/2;tx<GW;tx++){const sx=GW-1-tx,sy=mode==='rot'?GH-1-ty:ty;
  this.t[ty*GW+tx]=this.t[sy*GW+sx];this.h[ty*GW+tx]=this.h[sy*GW+sx];}};

const MAPS=[
{name:'Kamienny Bród',sym:'rot',seed:11,
 desc:'Rzeka przecina pole. Dwa mosty na skrzydłach, płytki bród w centrum – tam powiewa sztandar. W wodzie nikt nie jest bezpieczny.',
 build(m){m.fill(T.GRASS);
  m.hill(150,250,80,1);m.hill(140,245,36,2);
  m.circle(270,100,62,T.FOREST);m.circle(170,440,66,T.FOREST);m.circle(340,370,40,T.FOREST);
  m.circle(320,200,38,T.WHEAT,.3);
  m.path([[0,300],[120,290],[260,240],[400,110],[480,100]],10,T.ROAD);
  m.path([[260,240],[330,300],[400,440],[480,440]],10,T.ROAD);
  m.path([[330,300],[470,270]],8,T.ROAD);
  m.circle(425,270,32,T.MUD,.5);
  m.path([[468,-10],[462,120],[474,200],[466,280],[472,360],[462,460],[470,560]],22,T.WATER);
  m.rect(444,246,40,48,T.FORD);
  m.rect(432,90,48,22,T.BRIDGE);m.rect(432,428,48,22,T.BRIDGE);
  m.path([[236,168],[296,156]],6,T.WALL);
  m.sym('rot');}},
{name:'Cmentarne Wzgórze',sym:'mirror',seed:23,
 desc:'Grzbiet w centrum osłonięty kamiennymi murkami. Ze wzgórza armaty sięgają dalej, a piechota strzela celniej w dół stoku.',
 build(m){m.fill(T.GRASS);
  m.hill(480,270,170,1,.22);m.hill(480,270,82,2,.22);
  m.circle(270,130,68,T.WHEAT,.25);m.circle(280,420,62,T.WHEAT,.25);
  m.circle(110,90,50,T.FOREST);m.circle(110,460,54,T.FOREST);
  m.circle(470,86,36,T.FOREST);m.circle(470,454,36,T.FOREST);
  m.path([[0,270],[960,270]],10,T.ROAD);
  m.path([[396,190],[388,248]],6,T.WALL);m.path([[388,294],[396,352]],6,T.WALL);
  m.path([[246,214],[330,220]],6,T.WALL);
  m.sym('mirror');}},
{name:'Gęstwina',sym:'rot',seed:37,
 desc:'Gęsty las z polanami i strumieniem z trzema brodami. Konnica grzęźnie w chaszczach, piechota w lesie jest trudnym celem.',
 build(m){m.fill(T.FOREST);
  m.rect(0,110,215,320,T.GRASS);m.circle(150,270,150,T.GRASS,.3);
  m.circle(470,270,96,T.GRASS,.35);m.circle(330,110,60,T.GRASS,.4);m.circle(320,430,55,T.GRASS,.4);
  m.path([[0,270],[480,270]],10,T.ROAD);m.path([[210,300],[320,430]],8,T.ROAD);
  m.path([[380,-10],[395,150],[375,300],[405,420],[385,560]],16,T.WATER);
  m.rect(352,258,56,24,T.FORD);m.rect(376,410,44,24,T.FORD);m.rect(372,118,44,24,T.FORD);
  m.rect(432,214,26,20,T.HOUSE);
  m.circle(456,344,22,T.MUD);
  m.sym('rot');}},
{name:'Pole Pszenicy',sym:'mirror',seed:41,
 desc:'Otwarte pola, płoty i folwark pośrodku. Wysokie zboże ukrywa oddziały przed ogniem z daleka – dopóki same nie strzelą.',
 build(m){m.fill(T.GRASS);
  m.rect(230,50,190,150,T.WHEAT);m.rect(230,345,190,140,T.WHEAT);
  m.path([[232,216],[414,216]],6,T.WALL);m.path([[232,328],[326,328]],6,T.WALL);m.path([[374,328],[414,328]],6,T.WALL);
  m.circle(330,270,34,T.MUD,.5);
  m.circle(90,80,50,T.FOREST);m.circle(90,470,50,T.FOREST);
  m.hill(120,270,60,1);
  m.path([[0,270],[960,270]],10,T.ROAD);
  m.rect(446,194,34,30,T.HOUSE);m.rect(440,318,40,26,T.HOUSE);
  m.sym('mirror');}},
{name:'Orla Przełęcz',sym:'mirror',seed:53,
 desc:'Skalne masywy zostawiają trzy przejścia: wąski most w środku i dwa brody na krańcach. Wzgórza po bokach to gniazda dla armat.',
 build(m){m.fill(T.GRASS);
  m.hill(235,140,78,1);m.hill(228,132,38,2);m.hill(235,400,78,1);m.hill(228,408,38,2);
  m.circle(340,270,32,T.FOREST);
  m.path([[0,270],[960,270]],10,T.ROAD);
  m.path([[478,-10],[478,560]],14,T.WATER);
  m.rect(0,0,960,24,T.ROCK);m.rect(0,516,960,24,T.ROCK);
  m.circle(480,150,78,T.ROCK,.12);m.circle(480,390,78,T.ROCK,.12);
  m.circle(405,150,34,T.ROCK,.35);m.circle(405,390,34,T.ROCK,.35);
  m.rect(456,244,24,52,T.BRIDGE);
  m.rect(456,24,24,40,T.FORD);m.rect(456,476,24,40,T.FORD);
  m.sym('mirror');}}
];
MAPS.forEach(m=>{if(!m.era)m.era='acw';});
MAPS.push(
{era:'rome',name:'Castra',sym:'mirror',seed:61,
 desc:'Każda armia ma obóz za palisadą z bramą od strony wroga. Strumień w środku przejdziesz mostem lub brodami. Machiny na wzgórzu w obozie strzelają dalej i szybciej ładują.',
 build(m){m.fill(T.GRASS);m.hill(150,270,95,1);m.hill(120,270,40,2);
  m.circle(360,110,44,T.FOREST);m.circle(360,430,44,T.FOREST);m.circle(330,205,24,T.SWAMP,.4);m.circle(330,338,24,T.SWAMP,.4);
  m.path([[0,270],[960,270]],10,T.ROAD);
  m.path([[30,186],[250,186]],6,T.PALISADE);m.path([[30,354],[250,354]],6,T.PALISADE);
  m.path([[250,186],[250,246]],6,T.PALISADE);m.path([[250,296],[250,354]],6,T.PALISADE);
  m.path([[478,-10],[478,560]],14,T.WATER);m.rect(456,254,24,32,T.BRIDGE);m.rect(456,96,24,40,T.FORD);m.rect(456,404,24,40,T.FORD);
  m.sym('mirror');}},
{era:'rome',name:'Bagniste Pole',sym:'rot',seed:67,
 desc:'Pas bagien przecina pole. Przejdziesz groblą (drogą) albo dwoma suchymi przesmykami. W bagnie wszyscy grzęzną, a żółw najbardziej.',
 build(m){m.fill(T.GRASS);m.circle(200,90,60,T.FOREST);m.circle(170,455,52,T.FOREST);m.hill(250,300,60,1);m.circle(300,170,40,T.WHEAT,.3);
  m.path([[420,-10],[440,140],[418,300],[446,560]],96,T.SWAMP);
  m.rect(392,84,96,28,T.GRASS);m.rect(392,420,96,28,T.GRASS);
  m.path([[0,270],[960,270]],10,T.ROAD);m.sym('rot');}},
{era:'rome',name:'Farsalos',sym:'rot',seed:71,
 desc:'Rozległa równina. Rzeka osłania jedno skrzydło każdej armii, gaje oliwne i łagodne wzgórza dają trochę osłony. Mało przeszkód – liczy się szyk.',
 build(m){m.fill(T.GRASS);m.path([[-10,46],[200,58],[380,40],[490,54]],30,T.WATER);m.rect(280,36,24,36,T.FORD);
  m.hill(300,390,70,1);m.hill(160,330,40,1);m.circle(360,250,26,T.FOREST,.5);m.circle(250,160,22,T.FOREST,.5);m.circle(420,420,24,T.FOREST,.5);
  m.circle(200,470,50,T.WHEAT,.3);m.path([[0,300],[480,270]],8,T.ROAD);m.sym('rot');}},
{era:'ww2',name:'Nad Bzurą',sym:'rot',seed:81,mines:[[380,236,56,70,7]],
 desc:'Rzeka z dwoma mostami i brodem. Przed mostami okopy i worki z piaskiem, w centrum ruiny wsi, przy brodzie pole minowe.',
 build(m){m.fill(T.GRASS);m.circle(190,440,60,T.FOREST);m.circle(260,110,50,T.FOREST);
  m.circle(340,300,40,T.RUINS,.5);m.rect(326,286,14,14,T.HOUSE);
  m.path([[0,300],[260,240],[400,110],[480,100]],10,T.ROAD);m.path([[260,240],[400,440],[480,440]],10,T.ROAD);
  m.path([[230,140],[244,180],[230,220],[244,260],[230,300],[244,340],[230,380]],8,T.TRENCH);
  m.path([[300,160],[300,220]],6,T.WIRE);m.path([[300,330],[300,400]],6,T.WIRE);
  m.path([[468,-10],[462,120],[474,200],[466,280],[472,360],[462,460],[470,560]],22,T.WATER);
  m.rect(444,246,40,48,T.FORD);m.rect(432,90,48,22,T.BRIDGE);m.rect(432,428,48,22,T.BRIDGE);
  m.rect(408,74,14,14,T.SANDBAG);m.rect(408,112,14,14,T.SANDBAG);
  m.sym('rot');}},
{era:'ww2',name:'Wizna',sym:'mirror',seed:87,mines:[[420,236,60,68,8]],
 desc:'Linie umocnień naprzeciw siebie: okopy, gniazda z worków, druty i pole minowe na drodze w centrum. Skrzydła zamykają bagna.',
 build(m){m.fill(T.GRASS);m.circle(480,60,110,T.SWAMP,.3);m.circle(480,480,110,T.SWAMP,.3);
  m.path([[0,270],[960,270]],10,T.ROAD);
  m.path([[250,110],[262,150],[250,190],[262,230],[250,270],[262,310],[250,350],[262,390],[250,430]],8,T.TRENCH);
  m.rect(270,190,14,24,T.SANDBAG);m.rect(270,330,14,24,T.SANDBAG);
  m.path([[340,140],[340,240]],6,T.WIRE);m.path([[340,300],[340,400]],6,T.WIRE);
  m.circle(380,120,26,T.RUINS,.5);m.circle(380,420,26,T.RUINS,.5);m.circle(140,120,40,T.FOREST);m.circle(140,420,40,T.FOREST);
  m.sym('mirror');}},
{era:'ww2',name:'Mokra',sym:'rot',seed:93,mines:[[390,410,70,50,6]],
 desc:'Skraj lasu, pola i wieś w ruinach pośrodku. Okopy pod lasem, rozrzucone zasieki i małe pole minowe na skrzydle.',
 build(m){m.fill(T.GRASS);m.circle(150,110,90,T.FOREST);m.circle(300,70,50,T.FOREST);m.circle(260,380,60,T.WHEAT,.3);m.circle(350,180,40,T.MUD,.5);
  m.circle(470,270,56,T.RUINS,.45);m.rect(446,240,20,16,T.HOUSE);
  m.path([[0,250],[480,250]],10,T.ROAD);
  m.path([[240,170],[254,210],[240,250],[254,290],[240,330]],8,T.TRENCH);
  m.path([[330,300],[370,340]],6,T.WIRE);m.path([[320,120],[360,100]],6,T.WIRE);
  m.sym('rot');}}
);
// pola minowe: prostokąty z lewej połowy + ich lustrzane/obrócone odbicia
function mineRects(def){const out=[];for(const[x,y,w,h,n]of def.mines||[]){out.push([x,y,w,h,n]);if(!def.minesOne)out.push([W-x-w,def.sym==='rot'?H-y-h:y,w,h,n]);}return out;}
function setTile(x,y,v){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=GW||ty>=GH)return;MAP.t[ty*GW+tx]=v;}
let MAP=null;const MAPDATA=[];
function buildMap(i){const d=MAPS[i],m=new MapB(d.seed);d.build(m);return{t:m.t,h:m.h,def:d,idx:i};}
function tAt(x,y){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=GW||ty>=GH)return T.ROCK;return MAP.t[ty*GW+tx];}
function hAt(x,y){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=GW||ty>=GH)return 0;return MAP.h[ty*GW+tx];}
function passF(type,x,y){return TSPD[tAt(x,y)][TI[type]];}


/* ================= XX WIEK: STANOWISKA, SNAJPER, UŁANI 1939, ZASŁONA DYMNA, ZRZUT ================= */
// Stanowiska (2–4 na bitwę, parami w lustrze): zajmuje je piechota albo snajper. Kule nie dochodzą do załogi;
// stanowisko niszczą wybuchy (granat pół trafienia, pocisk armaty, czołgu, moździerza i bomba – całe). Po zniszczeniu załoga wychodzi.
const POST={
  bunkier:{name:'Bunkier',hp:4,w:'ckm',ammo:100},
  okop:{name:'Gniazdo ckm',hp:2,w:'ckm',ammo:50},
  bateria:{name:'Stanowisko działa',hp:3,w:'dzialo',ammo:10},
  dom:{name:'Umocniony dom',hp:3,w:'ckm',ammo:50},
  wieza:{name:'Wieża strzelnicza',hp:2,w:'wieza',ammo:0}};
const POST_TYPES=['bunkier','okop','bateria','dom','wieza'],POSTABLE=new Set(['rif','snp']);
const postFree=(x,y)=>{for(let dy=-14;dy<=14;dy+=7)for(let dx=-14;dx<=14;dx+=7){const t=tAt(x+dx,y+dy);if(passF('inf',x+dx,y+dy)<=0||t===T.WATER||t===T.FORD||t===T.BRIDGE)return false;}return true;};
function postsInit(){G.posts=[];if(G.era!=='ww2')return;const n=2+Math.floor(R()*3),pairs=Math.floor(n/2),rot=MAP.def.sym==='rot';
  const add=(type,x,y)=>G.posts.push({type,x,y,hp:POST[type].hp,ammo:POST[type].ammo,owner:-1,unit:null,capT:0,capS:-1,reload:0,heat:0,over:false,mgY:0,mgT:0,dead:false});
  const far=(x,y)=>G.posts.every(p=>dist(p.x,p.y,x,y)>110);
  for(let k=0,tries=0;k<pairs&&tries<400;tries++){const x=330+R()*120,y=70+R()*400,x2=W-x,y2=rot?H-y:y;
    if(!postFree(x,y)||!postFree(x2,y2)||!far(x,y)||!far(x2,y2))continue;const type=POST_TYPES[Math.floor(R()*POST_TYPES.length)];add(type,x,y);add(type,x2,y2);k++;}
  if(n%2)for(let tries=0;tries<200;tries++){const y=70+R()*400;if(postFree(W/2,y)&&far(W/2,y)){add(POST_TYPES[Math.floor(R()*POST_TYPES.length)],W/2,y);break;}}}
function occupy(u,p){p.unit=u;p.owner=u.side;u.post=p;u.prone=false;u.dug=false;u.coneOn=false;u.gAim=false;
  msg(u.side,`${unitName(u)} zajmuje: ${POST[p.type].name}!`);AU.bugle(BUG.flag);}
function leavePost(u,forced){const p=u.post;if(!p)return;p.unit=null;u.post=null;const dir=clDir(u.side);
  u.men.forEach((m,j)=>{if(!m.alive)return;m.x=p.x-dir*(14+(j%2)*7);m.y=p.y+(j-2.5)*8;});clCentroid(u);
  if(forced){const al=u.men.filter(m=>m.alive);if(al.length&&R()<.6)killMan(u,al[Math.floor(R()*al.length)],'ball');msg(u.side,`${POST[p.type].name} zniszczony – załoga musi wyjść!`);}
  else msg(u.side,`${unitName(u)} opuszcza stanowisko.`);}
function postHit(p,dmg,side){if(p.dead)return;p.hp-=dmg;for(let i=0;i<8;i++)parts.push({k:'dirt',x:p.x,y:p.y-4,z:6,vx:(R()-.5)*60,vy:(R()-.5)*30,vz:40+R()*50,life:0,max:.8,c:R()<.5?'#8a847a':'#5a4630'});AU.impact(p.x);
  if(p.unit&&dmg>=1&&R()<.25){const al=p.unit.men.filter(m=>m.alive);if(al.length)killMan(p.unit,al[Math.floor(R()*al.length)],'ball');}
  if(p.hp<=0){p.dead=true;if(p.unit)leavePost(p.unit,true);else msg(side>=0?side:0,`${POST[p.type].name} zniszczony.`);G.shake=Math.max(G.shake,3);
    const g=G.tctx;if(g){pdisc(g,p.x,p.y,11,'rgba(70,64,56,.85)');for(let k=0;k<14;k++){g.fillStyle=R()<.5?'#8a8278':'#4a443c';g.fillRect(Math.round(p.x+(R()-.5)*22),Math.round(p.y+(R()-.5)*14),2+Math.floor(R()*3),2);}}}}
// strzały z karabinów maszynowych i dział stanowisk
function postMg(u,p,dt,fire,ySteer){const dir=clDir(u.side);if(p.over&&p.heat<.35)p.over=false;
  if(!fire||p.over||p.ammo<=0){p.heat=Math.max(0,p.heat-dt*.22);p.firing=false;return;}
  p.firing=true;p.mgY=clamp(p.mgY+ySteer*dt,-380,380);p.heat+=dt*.25;if(p.heat>=1){p.over=true;msg(u.side,`${POST[p.type].name}: lufa przegrzana!`);}
  p.mgT-=dt;if(p.mgT<=0){p.mgT=.085;p.ammo--;const a=Math.atan2(p.mgY,380),sx=p.x+dir*12;
    bullets.push({x:sx,y:p.y,vx:dir*380*Math.cos(a),vy:380*Math.sin(a)+(R()-.5)*10,left:380,side:u.side,src:'mg',kind:'mg',pk:.3,sup:true});
    parts.push({k:'flash',x:sx,y:p.y-6,life:0,max:.04});if(R()<.5)AU.burst(.06,1900,'bandpass',1,.13,AU.pan(p.x));G.stats[u.side].shots++;u.firedT=3;
    if(p.ammo===0)msg(u.side,`${POST[p.type].name}: koniec taśmy – zostają karabiny.`);}}
function postGun(u,p,a){if(p.reload>0||p.ammo<=0)return false;const[cx,cy]=coneVec(u,a),bx=p.x+cx*14;p.reload=2.5;p.ammo--;u.firedT=3;
  const b={x:bx,y:p.y+cy*14,vx:cx*520,vy:cy*520,left:600,side:u.side,src:'at',kind:'shell',pk:.6,boom:8,bk:.6};b.ap=bb=>{const tr=600-bb.left;return tr<300?.75:tr<550?.45:.25;};bullets.push(b);
  parts.push({k:'flash',x:bx,y:p.y-6,life:0,max:.08,big:1});addSmoke(bx,p.y-6,2,false);AU.cannon(p.x);G.shake=Math.max(G.shake,1.2);G.stats[u.side].shots++;return true;}
// cel dla samoobrony stanowiska: najbliższy wróg w stożku ±45° przed stanowiskiem
function postTarget(u,p,rg,pref){const dir=clDir(u.side);let best=null,bd=1e9;
  for(const e of units){if(e.side===u.side||e.dead||e.gone||e.state==='enter'||e.post)continue;const dx=(e.x-p.x)*dir,dy=e.y-p.y;if(dx<15||dx>rg||Math.abs(dy)>dx)continue;
    const d=dx+Math.abs(dy)-(pref&&pref(e)?400:0);if(d<bd){bd=d;best=e;}}return best;}
// zachowanie oddziału w stanowisku: gracz steruje bronią stanowiska, komputer i oddział bez sterowania strzelają sami
function postBeh(u,dt,I){const p=u.post,P=POST[p.type],dir=clDir(u.side),tower=P.w==='wieza';u.moving=false;
  u.men.forEach((m,j)=>{if(!m.alive)return;m.x=p.x+((j%3)-1)*4;m.y=p.y+Math.floor(j/3)*3-1;m.mv=0;});u.x=p.x;u.y=p.y;
  p.reload=Math.max(0,p.reload-dt);if(!I.bat)return;
  const snp=u.key==='snp',rifRange=snp?450:230,mult=tower?1.6:1;
  const shoot=a=>{if(snp)return sniperShot(u,a,rifRange*mult,tower);return clVolley(u,{reload:1.7,range:rifRange*mult,spd:420,pk:.7*(tower?1.3:1),kind:'rifle',ang:a});};
  if(I.hum){
    if(P.w==='ckm'&&p.ammo>0&&!snp)postMg(u,p,dt,I.A,I.y*240);
    else{const a=coneFire(u,I,dt);if(a!==null){if(P.w==='dzialo'&&p.ammo>0&&!snp){if(!postGun(u,p,a))AU.bad();}else if(!shoot(a))AU.bad();}}
    return;}
  // samoobrona i komputer
  if(P.w==='ckm'&&p.ammo>0&&!snp){const t=postTarget(u,p,380*AUTO_RANGE,e=>e.type==='inf');
    if(t){const dx=Math.max(40,(t.x-p.x)*dir),want=clamp((t.y-p.y)*380/dx,-380,380);postMg(u,p,dt,true,clamp((want-p.mgY)*6,-240,240));}else postMg(u,p,dt,false,0);return;}
  if(P.w==='dzialo'&&p.ammo>0&&!snp){const t=postTarget(u,p,600*AUTO_RANGE,e=>e.type==='tank');if(t&&p.reload<=0)postGun(u,p,clamp(Math.atan2(t.y-p.y,(t.x-p.x)*dir),-CONE,CONE));return;}
  const t=postTarget(u,p,rifRange*mult*AUTO_RANGE);if(t&&u.reload<=0&&!u.pendVol)shoot(clamp(Math.atan2(t.y-p.y,(t.x-p.x)*dir),-CONE,CONE));}
function postTick(dt){if(!G.posts||!G.posts.length)return;
  for(const p of G.posts){if(p.dead)continue;if(p.unit&&(p.unit.dead||p.unit.gone||p.unit.n===0)){p.unit.post=null;p.unit=null;}
    if(p.unit)continue;let cand=null;
    for(const u of units){if(u.dead||u.gone||u.state==='enter'||u.post||!POSTABLE.has(u.key))continue;if(dist(u.x,u.y,p.x,p.y)<22){cand=u;break;}}
    if(!cand){p.capT=0;p.capS=-1;continue;}if(p.capS!==cand.side){p.capS=cand.side;p.capT=0;}p.capT+=dt;if(p.capT>1.5)occupy(cand,p);}}
// najbliższe wolne stanowisko (komputer idzie je zająć)
function freePostNear(u,rg){let best=null,bd=rg;for(const p of G.posts||[]){if(p.dead||p.unit)continue;const d=dist(u.x,u.y,p.x,p.y);if(d<bd){bd=d;best=p;}}return best;}
function drawPost(p){const[x0,y0]=P(p.x,p.y),x=Math.round(x0),y=Math.round(y0),r=spr(x,y,true),own=p.owner>=0?SIDE[p.owner]:null;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-13,y-1,26,4);
  if(p.dead){r(-11,-3,22,4,'#5a544c');r(-7,-5,6,2,'#7a746a');r(3,-4,5,2,'#6a645a');return;}
  const T0=p.type;
  if(T0==='bunkier'){r(-12,-9,24,9,'#7a7c78');r(-12,-9,24,2,'#9a9c96');r(-8,-6,16,2,'#1a1a18');r(-12,-1,24,1,'#4a4c48');}
  else if(T0==='okop'||T0==='bateria'){for(let k=-12;k<12;k+=4){r(k,-4,4,3,'#8a7a52');r(k+1,-5,3,1,'#bcaa7c');}r(-8,-7,4,3,'#8a7a52');r(4,-7,4,3,'#8a7a52');
    if(T0==='bateria'){r(-3,-9,4,4,'#4a4c46');r(1,-8,13,2,'#34363a');}else{r(0,-7,10,1,'#26282a');}}
  else if(T0==='dom'){r(-10,-12,20,11,'#c8b898');r(-12,-16,24,5,'#8a3a2a');r(-6,-8,4,3,'#1a1a18');r(3,-8,4,3,'#1a1a18');for(let k=-12;k<12;k+=4)r(k,-3,4,3,'#8a7a52');}
  else{r(-8,-30,2,30,'#5a3e22');r(6,-30,2,30,'#5a3e22');r(-7,-18,14,1,'#6a4a2a');r(-10,-32,20,4,'#7a5a36');r(-11,-36,22,3,'#4a3218');r(-9,-29,18,1,'#4a3218');}
  if(p.unit){const S=SIDE[p.unit.side],hy=T0==='wieza'?-35:T0==='dom'?-9:-8,n=Math.min(3,p.unit.n);for(let k=0;k<n;k++)r(-5+k*4,hy,3,2,S.hat);
    if(p.firing&&Math.floor(G.t*20)%2)r(12,hy+1,2,2,'#fff2a0');}
  // proporzec właściciela
  const fx=-12,top=T0==='wieza'?-46:-22;r(fx,top,1,top<-30?14:12,'#3b2a1a');r(fx+1,top,5,2,own?own.flag[0]:'#e8e2d0');r(fx+1,top+2,5,2,own?own.flag[1]:'#cfc8b4');
  if(p.capT>0&&!p.unit){ctx.strokeStyle=SIDE[p.capS].ui;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-6,14,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,p.capT/1.5));ctx.stroke();ctx.lineWidth=1;}}

/* --- snajper: celny pojedynczy strzał; lekko „dociąga” do najbliższego wroga w kierunku celowania --- */
function sniperShot(u,a,rg,tower){if(u.reload>0)return false;const g=u.men.find(m=>m.alive);if(!g)return false;const dir=clDir(u.side);
  let best=null,bd=.14;for(const e of units){if(e.side===u.side||e.dead||e.gone||e.post||e.type==='tank')continue;for(const m of e.men){if(!m.alive)continue;
    const dx=(m.x-g.x)*dir,dy=m.y-g.y;if(dx<10||Math.hypot(dx,dy)>rg)continue;const da=Math.abs(Math.atan2(dy,dx)-a);if(da<bd){bd=da;best=Math.atan2(dy,dx);}}}
  if(best!==null)a=best;const[cx,cy]=coneVec(u,a);u.reload=3.5*(u.prone?1.2:1);u.firedT=3;
  bullets.push({x:g.x+cx*8,y:g.y+cy*8,vx:cx*900,vy:cy*900,left:rg,side:u.side,src:'snp',kind:'rifle',pk:tower?1:.95});
  parts.push({k:'flash',x:g.x+cx*9,y:g.y-6,life:0,max:.05});AU.burst(.25,1500,'bandpass',.9,.3,AU.pan(u.x));AU.burst(.6,300,'lowpass',1,.12,AU.pan(u.x));G.stats[u.side].shots++;return true;}
BEH.snp=function(u,dt,I){if(u.post)return postBeh(u,dt,I);const{x,y}=I,sp=20*(u.supT>0?.4:1)*(u.prone?.4:1),a=coneFire(u,I,dt);
  if(u.prone){const mv=Math.abs(x)>.2||Math.abs(y)>.2;u.dugT=mv?0:(u.dugT||0)+dt;u.dug=u.dugT>4;}
  if(I.A&&I.bat)clMoveMen(u,0,0,dt,false,1,I.hum);else clMoveMen(u,x*sp,y*sp,dt,false,2,I.hum);
  if(a!==null&&!sniperShot(u,a,450,false)&&I.hum)AU.bad();};
AUTO.snp=function(u,dt){if(u.post||u.reload>0)return;const dir=clDir(u.side),g=u.men.find(m=>m.alive);if(!g)return;let t=null,bd=1e9;
  for(const e of units){if(e.side===u.side||e.dead||e.gone||e.post||e.type==='tank'||e.state==='enter')continue;const dx=(e.x-g.x)*dir,dy=e.y-g.y;if(dx<20||dx>300||Math.abs(dy)>dx)continue;if(dx<bd){bd=dx;t=e;}}
  if(t)sniperShot(u,Math.atan2(t.y-g.y,(t.x-g.x)*dir),450,false);};
CPU.snp=function(u,dt,foes,dir,c){if(u.post)return idle0;const tw=freePostNear(u,320);
  if(tw&&!foes.some(f=>dist(f.x,f.y,u.x,u.y)<150)){const v=steer(u,tw.x,tw.y,dt);return{x:v[0],y:v[1],A:false};}
  const t=nearestBy(foes.filter(f=>f.type!=='tank'&&!f.post),u)||nearestBy(foes,u);if(!t)return idle0;const dx=(t.x-u.x)*dir;
  if(dx>400||dx<0){const v=steer(u,t.x-dir*360,t.y,dt);return{x:v[0],y:v[1],A:false};}
  if(Math.abs(t.y-u.y)>dx*.9)return{x:0,y:clamp((t.y-u.y)/20,-1,1),A:false};
  const fire=u.reload<=0&&!c.lastA;c.lastA=fire;return{x:0,y:0,A:fire};};
CPUSCORE.snp=(u,f)=>u.post?20:u.reload<=0&&f.some(e=>Math.abs(e.x-u.x)<420)?48:30;
KD.snp={base:'inf',men:2,name:'Snajper',unit:'Para snajperska',pick:'x',pos:[120,430],ai:'snp',beh:'snp',label:'Strzelcy',prone:true,slots:(u,n)=>{const d=clDir(u.side);return[[4*d,0],[-4*d,6]].slice(0,n);},
  status:u=>u.post?`${POST[u.post.type].name} · A: celny strzał (dalej) · ↑ wyjdź`:`${u.prone?(u.dug?'OKOPANI · ':'LEŻĄ · '):''}${u.coneOn?'CELUJE – puść A':u.reload>0?'Przeładowanie':'A: celny strzał · trzymaj = kierunek'} · ${u.prone?'↑ wstań':'↓ padnij'}`};
// ułani 1939: jazda z szablami – szybka szarża, bezbronna wobec ckm
KD.kaw={base:'cav',men:4,name:'Ułani',unit:'Szwadron ułanów',pick:'y',pos:[72,140],ai:'cav',beh:'acwSabre',label:'Jeźdźcy'};
Object.assign(FACTIONS.pl.info,{snp:['Snajper','2 ludzi · karabin z lunetą','A: celny strzał. Z wieży sięga dalej.'],kaw:['Ułani','4 jeźdźców · szable','Szybka szarża, A: cięcie. Uwaga na ckm!']});
FACTIONS.pl.keys=['rif','mg','ppk','tank','at','mor','snp','kaw'];FACTIONS.pl.max=Object.assign({},FACTIONS.pl.max,{snp:2,kaw:4});
FACTIONS.pl.presets=[...FACTIONS.pl.presets,{n:'Krojanty',rif:4,mg:1,ppk:1,tank:1,at:1,mor:1,snp:1,kaw:2}];
FACTIONS.de.keys=['rif','mg','ppk','tank','at','mor','snp'];FACTIONS.de.max=Object.assign({},FACTIONS.de.max,{snp:2});
FACTIONS.de.presets=[...FACTIONS.de.presets,{n:'Strzelcy wyborowi',rif:4,mg:2,ppk:1,tank:2,at:1,mor:0,snp:2}];
AMMO.snp=20;

/* --- zasłona dymna (krzyżak ←) i zrzut zaopatrzenia (krzyżak →) --- */
function supportReset(){G.smoke=[3,3];G.smokeCd=[0,0];G.supply=[0,1].map(s=>FAC[s].air?2:0);G.supCd=[0,0];G.crates=[];}
function callSmoke(side,u){if(!u||G.smoke[side]<=0||G.t<G.smokeCd[side]){if(humanOf(side)>=0)AU.bad();return false;}G.smoke[side]--;G.smokeCd[side]=G.t+8;
  const dir=clDir(side);for(const dy of[-28,0,28])smokeCloud(u.x+dir*60,u.y+dy);msg(side,'Zasłona dymna!');return true;}
function callSupply(side,u){if(!u||G.supply[side]<=0||G.t<G.supCd[side]){if(humanOf(side)>=0)AU.bad();return false;}G.supply[side]--;G.supCd[side]=G.t+25;
  const pl={side,dir:clDir(side),x:side===0?-60:W+60,y:clamp(u.y,40,H-20),alt:AIR.alt,bombs:0,dropX:0,down:false,supply:true,tx:u.x};pl.snd=planeSound(pl);G.planes.push(pl);
  msg(side,'Zrzut zaopatrzenia – samolot w drodze!');return true;}
function supplyTick(dt){if(!G.crates)return;
  for(const pl of G.planes)if(pl.supply&&!pl.dropped&&!pl.down&&(pl.x-pl.tx)*pl.dir>-20){pl.dropped=true;G.crates.push({x:pl.x,y:pl.y+(R()-.5)*10,h:pl.alt,side:pl.side,life:45});AU.tone(500,.3,'triangle',.05);}
  for(let i=G.crates.length-1;i>=0;i--){const c=G.crates[i];if(c.h>0){c.h=Math.max(0,c.h-26*dt);c.x+=G.wind.x*6*dt;continue;}c.life-=dt;if(c.life<=0){G.crates.splice(i,1);continue;}
    for(const u of units){if(u.dead||u.gone||u.state==='enter')continue;if(!u.men.some(m=>m.alive&&dist(m.x,m.y,c.x,c.y)<16)&&dist(u.x,u.y,c.x,c.y)>14)continue;
      if(u.shotsMax!==undefined)u.shots=u.shotsMax;if(u.gren!==undefined)u.gren=Math.min(GREN.n,u.gren+3);u.heat=0;u.over=false;if(u.post)u.post.ammo+=POST[u.post.type].w==='dzialo'?5:50;
      msg(u.side,u.side===c.side?`${unitName(u)}: zaopatrzenie! Amunicja i granaty uzupełnione.`:`${unitName(u)} przejmuje zrzut wroga!`);AU.ok2();G.crates.splice(i,1);break;}}
  // komputer: zrzut dla oddziału bez amunicji lub granatów, dym gdy piechota jest przygwożdżona
  if(G.mode==='cpu'&&G.state==='battle'){const low=units.find(u=>u.side===1&&!u.dead&&!u.gone&&u.state!=='enter'&&(u.shots===0||u.gren===0));if(low&&G.supply[1]>0&&G.t>G.supCd[1])callSupply(1,low);
    const s=clSel(1);if(s&&s.key==='rif'&&s.supT>0&&!s.post&&G.smoke[1]>0&&G.t>G.smokeCd[1]&&R()<dt*.5)callSmoke(1,s);}}
function drawCrates(){for(const c of G.crates||[]){const[x0,y0]=P(c.x,c.y),x=Math.round(x0),y=Math.round(y0-c.h);
  if(c.h>0){ctx.fillStyle='#f0ece0';ctx.beginPath();ctx.arc(x,y-12,7,Math.PI,0);ctx.fill();ctx.strokeStyle='rgba(240,236,224,.7)';ctx.beginPath();ctx.moveTo(x-7,y-12);ctx.lineTo(x,y-2);ctx.lineTo(x+7,y-12);ctx.stroke();}
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x0)-4,Math.round(y0),9,2);ctx.fillStyle='#7a5a32';ctx.fillRect(x-4,y-5,8,5);ctx.fillStyle='#e8e2d0';ctx.fillRect(x-1,y-5,2,5);ctx.fillRect(x-4,y-3,8,1);}}

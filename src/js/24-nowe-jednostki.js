/* ================= NOWE JEDNOSTKI ================= */
RF_NAME.phalanx='Falanga';
const _legSlots=legSlots;
function legSlots2(u,n){if(u.rf==='phalanx'){const d=clDir(u.side),o=[];for(let j=0;j<n;j++){const c=j%4,r=Math.floor(j/4);o.push([-d*r*7,(c-1.5)*8]);}return o;}return _legSlots(u,n);}
KD.leg.slots=legSlots2;KD.leg.forms=['line','testudo','wedge','orbis'];
KD.arc.pos=[105,305];KD.bal.pos=[60,222];KD.ona.pos=[60,318];
Object.assign(KD,{
  lib:{base:'inf',men:8,name:'Piechota libijska',unit:'Oddział libijski',pick:'x',pos:[165,270],ai:'leg',beh:'leg',label:'Piechurzy',slots:legSlots2,forms:['line','phalanx'],init:u=>{u.rf='line';},
    status:u=>`${RF_NAME[u.rf]}${u.formT>0?' (zmiana)':''} · A: szyk`},
  sli:{base:'inf',men:6,name:'Procarze',unit:'Procarze',pick:'x',pos:[105,305],ai:'arc',beh:'arc',label:'Procarze',init:u=>{u.aimMin=60;u.aimMax=300;u.reloadMax=2.5;u.ammoKind='sling';},
    status:u=>u.aiming?`Odległość ${Math.round((u.aimR-60)/240*100)}% – puść A`:u.reload>0?'Zakładają kamienie…':'A: na wprost · trzymaj: łukiem'},
  num:{base:'cav',men:4,name:'Jazda numidyjska',unit:'Jazda numidyjska',pick:'y',pos:[72,'cav'],ai:'num',beh:'num',label:'Jeźdźcy',
    status:u=>u.reload>0?'Sięgają po oszczepy…':'Ruch w każdą stronę · A: rzut oszczepami'},
  ele:{base:'ele',men:1,name:'Słonie bojowe',unit:'Słoń bojowy',pick:'y',pos:[96,'cav'],ai:'ele',beh:'ele',label:'Wytrzymałość',init:u=>{u.hp=4;u.panicT=0;u.chargeT=0;u.tiredT=0;},
    status:u=>u.panicT>0?'PANIKA – nie słucha!':u.chargeT>0?'SZARŻA SŁONI':u.tiredT>0?'Zmęczony':'A: szarża'},
  war:{base:'inf',men:8,name:'Wojownicy',unit:'Drużyna',pick:'x',pos:[165,270],ai:'war',beh:'war',label:'Wojownicy',init:u=>{u.furyT=0;u.tiredT=0;},
    status:u=>u.furyT>0?'FURIA!':u.tiredT>0?`Zmęczeni (${Math.ceil(u.tiredT)} s)`:'A: furia – szarża'},
  gcav:{base:'cav',men:4,name:'Jazda galijska',unit:'Jazda galijska',pick:'y',pos:[72,'cav'],ai:'cav',beh:'acwSabre',label:'Jeźdźcy'},
  ppk:{base:'inf',men:2,name:'Rusznica ppanc',unit:'Rusznica ppanc',pick:'x',pos:[130,392],ai:'ppk',beh:'ppk',label:'Obsługa',init:u=>{u.reloadMax=3;},slots:(u,n)=>{const d=clDir(u.side);return[[4*d,0],[-4*d,7]].slice(0,n);},
    status:u=>u.coneOn?'SKOS – drążek góra–dół, puść A':u.reload>0?'Przeładowanie':'A: strzał · trzymaj = skos'}
});
SPEC.ele={men:1,spd:20,r:14,name:'Słoń',unit:'Słoń'};

/* --- zachowania --- */
const _BEHleg=BEH.leg;
BEH.leg=function(u,dt,I){const forms=kdOf(u).forms;
  if(I.Ap){u.rf=forms[(forms.indexOf(u.rf)+1)%forms.length];u.formT=.8;AU.ui();I={...I,Ap:false};}
  if(u.key!=='leg')I={...I,Rp:false};
  const sp={line:22,testudo:11,wedge:28,orbis:0,phalanx:16}[u.rf]*(u.formT>0?.5:1)*(G.weather==='rain'?.9:1)*(u.rf==='testudo'&&tAt(u.x,u.y)===T.SWAMP?.5:1);
  if(u.rf==='line'){const{x,y}=I,horiz=Math.abs(x)>.3&&Math.abs(x)>=Math.abs(y),vert=Math.abs(y)>.3&&Math.abs(y)>Math.abs(x);
    if(horiz){u.s=Math.min(1,u.s+dt*.7);u.colDir=Math.sign(x);}else if(vert)u.s=Math.max(0,u.s-dt*1.1);
    clMoveMen(u,x*sp,y*sp,dt,false,vert?2.2:horiz?1.2:0,I.hum);}
  else{u.s=Math.max(0,u.s-dt*2);clMoveMen(u,I.x*sp,I.y*sp,dt,false,2.6,I.hum);}
  if(I.Rp&&I.bat){if(u.cd2>0||u.rf==='testudo'||u.rf==='orbis'){if(I.hum)AU.bad();}
    else{const sv=u.reload;u.reload=0;clVolley(u,{reload:.01,range:95,spd:170,pk:.7,kind:'pilum',noPowder:true});u.reload=sv;u.cd2=5;}}};
BEH.num=function(u,dt,I){clMoveMen(u,I.x*58,I.y*58,dt,false,2,I.hum);u.charging=false;
  if(I.Ap&&I.bat&&!clVolley(u,{reload:3,range:120,spd:220,pk:.55,kind:'jav',noPowder:true})&&I.hum)AU.bad();};
BEH.war=function(u,dt,I){const{x,y,dir}=I;u.tiredT=Math.max(0,(u.tiredT||0)-dt);
  if(u.furyT>0){u.furyT-=dt;u.s=0;clMoveMen(u,dir*55,(I.inp?y:0)*30,dt,false,.6,I.hum);if(R()<.4)dustAt(u.x-dir*6+(R()-.5)*20,u.y+(R()-.5)*30,1);
    if(u.furyT<=0){u.tiredT=6;msg(u.side,`${unitName(u)} – opadają z sił.`);}}
  else{const sp=26*(u.tiredT>0?.6:1)*(u.supT>0?.4:1);clMoveMen(u,x*sp,y*sp,dt,false,.8,I.hum);
    if(I.Ap&&I.bat){if(u.tiredT>0){if(I.hum)AU.bad();}else{u.furyT=4;AU.burst(.7,700,'bandpass',1,.45,AU.pan(u.x));AU.tone(260,.6,'sawtooth',.08,0,160,900);msg(u.side,`${unitName(u)}: furia! Szarża!`);}}}};
BEH.ele=function(u,dt,I){const dir=clDir(u.side);let vx=0,vy=0;u.moving=false;
  if(u.panicT>0){u.panicT-=dt;vx=-dir*46;vy=Math.sin(G.t*3+u.id)*22;}
  else if(u.chargeT>0){u.chargeT-=dt;vx=dir*50;vy=(I.inp?I.y:0)*30;if(u.chargeT<=0)u.tiredT=3;}
  else{u.tiredT=Math.max(0,(u.tiredT||0)-dt);const sp=20*(u.tiredT>0?.6:1);vx=I.x*sp;vy=I.y*sp;
    if(I.Ap&&I.bat){if(u.tiredT>0){if(I.hum)AU.bad();}else{u.chargeT=3.5;AU.tone(420,.7,'sawtooth',.09,0,600,1500);msg(u.side,`${unitName(u)}: szarża słoni!`);}}}
  if(vx||vy){const f=Math.max(.25,passF('ele',u.x,u.y)),nx=u.x+vx*f*dt,ny=clamp(u.y+vy*f*dt,34,H-12);
    const ok=(X,Y)=>{const t=tAt(X,Y);if(u.panicT>0&&(X<4||X>W-4))return true;if(t===T.WATER)return I.hum&&u.panicT<=0;return passF('ele',X,Y)>0;};
    if(ok(nx,ny)){u.x=nx;u.y=ny;u.moving=true;}else if(ok(nx,u.y)){u.x=nx;u.moving=true;}else if(ok(u.x,ny)){u.y=ny;u.moving=true;}
    if(u.panicT<=0)u.x=clamp(u.x,10,W-10);
    if(u.moving){u.anim=(u.anim||0)+dt*6;if(R()<.3)dustAt(u.x-dir*10,u.y,1,'140,120,85');}}
  if(tAt(u.x,u.y)===T.WIRE)crushWire(u.x,u.y);
  if(u.moving){const rate=(u.chargeT>0||u.panicT>0)?5:1.2;
    for(const e of units){if(e===u||e.dead||e.gone||e.type==='tank'||e.type==='ele')continue;if(e.side===u.side&&u.panicT<=0)continue;if(Math.abs(e.x-u.x)>60||Math.abs(e.y-u.y)>60)continue;
      for(const m of e.men)if(m.alive&&dist(m.x,m.y,u.x,u.y)<10&&R()<rate*dt)killMan(e,m,'trample');}}
  if(u.panicT>0&&(u.x<-10||u.x>W+10)){u.gone=true;msg(u.side,`${unitName(u)} uciekł z pola bitwy.`);}
  clCrew(u,false,dt);};
BEH.ppk=function(u,dt,I){const sp=24*(u.supT>0?.4:1),a=coneFire(u,I,dt);if(I.A&&I.bat)clMoveMen(u,0,0,dt,false,2,I.hum);else clMoveMen(u,I.x*sp,I.y*sp,dt,false,2,I.hum);
  if(a!==null){if(u.reload>0){if(I.hum)AU.bad();}else if(useShot(u)){const g=u.men.find(m=>m.alive),[cx,cy]=coneVec(u,a),dir=clDir(u.side);u.reload=3;u.firedT=3;
    const b={x:g.x+cx*8,y:g.y+cy*8,vx:cx*700,vy:cy*700,left:420,side:u.side,src:u.key,kind:'atr',pk:.75};b.ap=bb=>{const tr=420-bb.left;return tr<150?.3:.15;};bullets.push(b);
    parts.push({k:'flash',x:g.x+dir*10,y:g.y-3,life:0,max:.06});addSmoke(g.x+dir*10,g.y-3,1,false);AU.musket(u.x,2);G.stats[u.side].shots++;}}};
// czołg: jeździ w każdą stronę (kadłub obraca się za drążkiem); przy celowaniu sam obraca się w kierunek strzału
BEH.tank=function(u,dt,I){const{x,y}=I,mag=Math.min(1,Math.hypot(x,y));u.moving=false;if(u.hd===undefined)u.hd=u.side===0?0:Math.PI;
  if(u.tAim)u.hd+=clamp(angDiff(u.hd,tankAimH(u)),-1.8*dt,1.8*dt);
  else if(mag>.25){const want=Math.atan2(y,x);let d=angDiff(u.hd,want),rev=false;if(Math.abs(d)>2.4){rev=true;d=angDiff(u.hd,want+Math.PI);}
    u.hd+=clamp(d,-1.3*dt,1.3*dt);
    if(!u.track&&mag>.6&&Math.cos(d)>.7&&!u.aiming){const pf=passF('tank',u.x,u.y),f=pf>0?pf:.5,sp=(rev?-12:26)*f*mag;
      const ok=(X,Y)=>{const t=tAt(X,Y);if(t===T.WATER)return I.hum;return passF('tank',X,Y)>0;};
      const nx=clamp(u.x+Math.cos(u.hd)*sp*dt,10,W-10),ny=clamp(u.y+Math.sin(u.hd)*sp*dt,34,H-12);
      if(ok(nx,ny)){u.x=nx;u.y=ny;u.moving=true;}else if(ok(nx,u.y)){u.x=nx;u.moving=true;}else if(ok(u.x,ny)){u.y=ny;u.moving=true;}}
    u.anim=(u.anim||0)+dt*10;if(u.moving&&R()<.3)dustAt(u.x-Math.cos(u.hd)*12,u.y-Math.sin(u.hd)*6,1,'120,105,80');}
  const c=Math.cos(u.hd),s=Math.sin(u.hd);
  if(I.bat)tankGun(u,dt,I);else u.aiming=false;
  if(I.R&&I.bat){u.mgT=(u.mgT||0)-dt;if(u.mgT<=0){u.mgT=.14;bullets.push({x:u.x+c*12,y:u.y+s*6,vx:c*360+(R()-.5)*10,vy:s*360+(R()-.5)*18,left:320,side:u.side,src:u.key,kind:'mg',pk:.25,sup:true});
      parts.push({k:'flash',x:u.x+c*12,y:u.y+s*6-7,life:0,max:.04});if(R()<.5)AU.burst(.05,1900,'bandpass',1,.1,AU.pan(u.x));}}
  if(tAt(u.x,u.y)===T.WIRE)crushWire(u.x,u.y);
  if(tAt(u.x,u.y)===T.BRIDGE&&nearBroken(u.x,u.y)&&R()<dt*.9){breakBridge(u.x,u.y,u.side);msg(u.side,`${unitName(u)}: most załamał się pod czołgiem!`);}
  clCrew(u,false,dt);};

/* --- obrażenia: pancerz według kierunku kadłuba, słonie, druty, miny --- */
function tankHit(e,ap,side,fromX,fromY){if(e.dead)return;const hd=e.hd!==undefined?e.hd:(e.side===0?0:Math.PI);
  const a=Math.abs(angDiff(hd,Math.atan2((fromY!==undefined?fromY:e.y)-e.y,fromX-e.x))),mul=a<1.05?1:a<2.1?2:2.5,eff=Math.min(.95,ap*mul);
  parts.push({k:'flash',x:e.x,y:e.y-8,life:0,max:.1,big:1});AU.impact(e.x);G.shake=Math.max(G.shake,2);
  if(R()<eff){const m=e.men.find(q=>q.alive);if(m){killMan(e,m,'boom');if(side>=0)G.stats[side].hits++;}}
  else if(!e.track&&R()<.35){e.track=true;msg(e.side,`${unitName(e)}: gąsienica zerwana!`);}
  else{for(let i=0;i<6;i++)parts.push({k:'spark',x:e.x,y:e.y-8,vx:(R()-.5)*60,vy:-R()*40,life:0,max:.3});AU.tone(1400,.08,'square',.05);}}
function eleWound(e,m,kind){
  if(kind==='drown'){m.alive=false;G.stats[e.side].lost++;for(let i=0;i<14;i++)parts.push({k:'dirt',x:e.x,y:e.y,z:0,vx:(R()-.5)*40,vy:(R()-.5)*14,vz:50+R()*60,life:0,max:.9,c:'#d8ecf4'});msg(e.side,`${unitName(e)} tonie w rzece.`);return;}
  const ch={shot:.35,melee:.3,ball:1,boom:1,trample:0}[kind];if(R()>=(ch===undefined?.3:ch))return;
  e.hp-=kind==='ball'?2:1;e.hitFlash=.3;AU.tone(320,.35,'sawtooth',.06,0,420,1300);
  if(e.hp<=0){m.alive=false;G.stats[e.side].lost++;dustAt(e.x,e.y,8);const g=G.tctx;
    if(g){const r=flipR(g,Math.round(e.x),Math.round(e.y),e.side===0);r(-13,-1,26,3,'rgba(0,0,0,.3)');r(-11,-7,20,7,'#77736c');r(-11,-2,20,2,'#5e5a54');r(8,-6,5,5,'#77736c');r(12,-2,4,1,'#f0ead8');r(-4,-9,8,3,SIDE[e.side].coat);}
    msg(e.side,`${unitName(e)} pada.`);}
  else if(e.hp<=1||R()<.25)elePanic(e);}
function elePanic(e){if(e.panicT>0||e.dead||e.state==='enter')return;e.panicT=4;e.chargeT=0;msg(e.side,`${unitName(e)}: słoń wpada w panikę!`);AU.tone(520,.6,'sawtooth',.09,0,520,1600);}
function crushWire(x,y){const t=tAt(x,y);if(t!==T.WIRE)return;setTile(x,y,T.GRASS);const g=G.tctx;if(!g)return;const X=Math.floor(x/TS)*TS,Y=Math.floor(y/TS)*TS;
  g.fillStyle='rgba(60,70,40,.8)';g.fillRect(X,Y,TS,TS);g.fillStyle='#8a9096';for(let k=0;k<6;k++)g.fillRect(X+Math.floor(R()*11),Y+Math.floor(R()*11),2,1);g.fillStyle='#4a3420';g.fillRect(X+2,Y+8,5,1);}
function breakPalisade(x,y){if(tAt(x,y)!==T.PALISADE&&tAt(x,y)!==T.FENCE)return;setTile(x,y,T.GRASS);const g=G.tctx;if(!g)return;const X=Math.floor(x/TS)*TS,Y=Math.floor(y/TS)*TS;
  g.fillStyle='rgba(70,82,44,.9)';g.fillRect(X,Y,TS,TS);for(let k=0;k<5;k++){g.fillStyle=R()<.5?'#6a4a2a':'#4a3218';g.fillRect(X+Math.floor(R()*9),Y+Math.floor(R()*10),3,1);}}
function mineBoom(mn){mn.gone=true;blast(mn.x,mn.y,13,.85,-1);G.shake=Math.max(G.shake,3);AU.cannon(mn.x);
  for(const e of units)if((e.type==='tank')&&!e.dead&&dist(e.x,e.y,mn.x,mn.y)<16)tankHit(e,.25,-1,mn.x,mn.y+40);}
const _eraTick=eraTick;
function eraTick2(dt){_eraTick(dt);if(!G.mines)return;
  for(const mn of G.mines){if(mn.gone)continue;for(const u of units){if(u.dead||u.gone||u.state==='enter'||Math.abs(u.x-mn.x)>70||Math.abs(u.y-mn.y)>70)continue;
    const r=u.type==='tank'||u.type==='ele'?10:5;let hit=false;for(const m of u.men)if(m.alive&&dist(m.x,m.y,mn.x,mn.y)<r){hit=true;break;}
    if(hit){mineBoom(mn);msg(u.side,`${unitName(u)} wszedł na minę!`);break;}}}
  G.mines=G.mines.filter(m=>!m.gone);}
function layMines(){G.mines=[];for(const[x,y,w,h,n]of mineRects(MAP.def))for(let i=0;i<n;i++){const mx=x+R()*w,my=y+R()*h;if(tAt(mx,my)!==T.WATER)G.mines.push({x:mx,y:my});}}

/* --- komputer --- */
Object.assign(CPUSCORE,{num:()=>44,ele:()=>50,war:()=>45,ppk:(u,f)=>f.some(e=>e.type==='tank')?52:30});
const _CPUleg=CPU.leg;
CPU.leg=function(u,dt,foes,dir,c){const forms=kdOf(u).forms;if(forms.includes('testudo'))return _CPUleg(u,dt,foes,dir,c);
  const t=nearestBy(foes.filter(f=>f.type==='inf'),u)||nearestBy(foes,u),dx=Math.abs(t.x-u.x),dy=t.y-u.y;
  const threat=foes.some(f=>f.type==='cav'&&dist(f.x,f.y,u.x,u.y)<200)||foes.some(f=>(f.key==='arc'||f.key==='bal')&&Math.abs(f.x-u.x)<400);
  const want=threat&&dx>90?'phalanx':'line';if(want!==u.rf){const A=!c.lastA;c.lastA=A;return{x:0,y:0,A};}c.lastA=false;
  if(dx>40){const v=steer(u,t.x,t.y,dt);return{x:v[0],y:v[1],A:false};}return{x:dir*.5,y:clamp(dy/20,-1,1),A:false};};
Object.assign(CPU,{
  num(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.key==='arc'||f.key==='bal'||f.key==='ona'),u)||nearestBy(foes,u),dx=(t.x-u.x)*dir,dy=t.y-u.y;
    const ix=dx>125?dir:dx<75?-dir:0,iy=clamp(dy/16,-1,1),fire=Math.abs(dy)<22&&dx<125&&dx>0&&u.reload<=0&&!c.lastA;c.lastA=fire;
    if(Math.abs(dx)>300){const v=steer(u,t.x-dir*110,t.y,dt);return{x:v[0],y:v[1],A:false};}return{x:ix,y:iy,A:fire};},
  ele(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.type==='inf'),u)||nearestBy(foes,u),dx=Math.abs(t.x-u.x),dy=t.y-u.y;
    if(u.chargeT>0)return{x:0,y:clamp(dy/16,-1,1),A:false};
    if(dx>330){const v=steer(u,t.x-dir*250,t.y,dt);return{x:v[0],y:v[1],A:false};}
    const go=Math.abs(dy)<14&&u.tiredT<=0&&!c.lastA;c.lastA=go;return{x:0,y:clamp(dy/14,-1,1),A:go};},
  war(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.type==='inf'),u)||nearestBy(foes,u),dx=Math.abs(t.x-u.x),dy=t.y-u.y;
    if(u.furyT>0)return{x:0,y:clamp(dy/16,-1,1),A:false};
    const go=dx<170&&Math.abs(dy)<30&&u.tiredT<=0&&!c.lastA;c.lastA=go;if(go)return{x:0,y:0,A:true};
    const v=steer(u,t.x,t.y,dt);return{x:v[0],y:v[1],A:false};},
  ppk(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.type==='tank'),u)||nearestBy(foes.filter(f=>f.type==='inf'),u)||nearestBy(foes,u);const g=u.men.find(m=>m.alive)||u,dx=Math.abs(t.x-g.x),dy=t.y-g.y;
    if(dx>260){const v=steer(u,t.x-dir*180,t.y,dt);return{x:v[0],y:v[1],A:false};}
    const tol=t.type==='tank'?5:2.5;if(Math.abs(dy)>tol)return{x:0,y:clamp(dy/8,-1,1),A:false};const fire=u.reload<=0&&!c.lastA;c.lastA=fire;return{x:0,y:0,A:fire};},
  tank(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.key==='at'||f.key==='mg'||f.key==='rif'||f.key==='ppk'),u)||nearestBy(foes,u),dx=Math.abs(t.x-u.x);
    if(dx>320&&!u.track){const v=steer(u,t.x-dir*250,t.y,dt);return{x:v[0],y:v[1],A:false};}
    const want=Math.atan2(t.y-u.y,t.x-u.x),d=Math.abs(angDiff(u.hd,want));const fire=d<.07&&u.reload<=0&&!c.lastA;c.lastA=fire;
    return{x:Math.cos(want)*.45,y:Math.sin(want)*.45,A:fire,R:t.type==='inf'&&d<.25&&dx<300};}
});

/* --- grafika --- */
function eraSoldier(x,y,s,right,anim,moving,aim,flag,crew,flash){
  const u=DRAWU,S=SIDE[s],r=spr(x,y,right),skin='#d7ae86',key=u&&u.key;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x-3,y-1,6,2);
  if(G.era==='ww2'&&u&&(u.supT>0||((key==='mg'||key==='ppk')&&DRAWI===0)||u.type==='art')){
    if((key==='mg'||key==='ppk')&&DRAWI===0){r(-6,-2,3,2,S.pants);r(-3,-3,5,3,S.coat);r(2,-4,2,2,skin);r(1,-5,4,1,S.hat);
      if(key==='mg'){r(4,-3,7,1,'#26282a');r(10,-3,1,1,'#26282a');r(7,-2,1,2,'#26282a');if(u.firing&&Math.floor(G.t*20)%2)r(11,-4,2,2,'#fff2a0');}
      else{r(4,-3,11,1,'#3e2a18');r(14,-3,1,1,'#8a9096');r(9,-2,1,2,'#26282a');}return true;}
    kneel(x,y,s,right);r(0,-10,4,1,S.hat);r(-1,-9,6,1,S.hat);return true;}
  const f=moving?(Math.floor(anim)%2):-1,P=S.pants,B='#221a12';
  if(f===0){r(-2,-4,1,3,P);r(1,-4,1,3,P);}else if(f===1){r(-1,-4,1,3,P);r(0,-4,1,3,P);}else{r(-2,-4,1,3,P);r(0,-4,1,3,P);}
  r(-2,-1,1,1,B);r(f===0?1:0,-1,1,1,B);
  if(G.era==='rome'){
    r(-2,-8,4,4,flash?'#fff':S.coat);r(-2,-8,1,4,flash?'#fff':S.coatD);r(-2,-5,4,1,'#6a4a2a');r(-1,-10,3,2,skin);
    if(key==='war'){r(-2,-12,4,2,S.hat);r(-3,-11,1,4,S.hat);r(0,-9,2,1,S.hat);r(-2,-8,4,4,flash?'#fff':'#8a5a2a');r(-1,-7,1,1,S.coat);r(1,-6,1,1,S.coat);
      r(1,-11,3,8,S.shield);r(2,-8,1,2,'#e0c060');if(u&&u.furyT>0)r(-1,-16,1,6,'#d8dce0');else r(-2,-9,1,5,'#c8ccd0');return true;}
    if(key==='sli'){r(-2,-11,4,1,S.hat);r(-2,-12,3,1,S.hat);const sw=u&&(u.aiming||u.firedT>2.5);
      if(sw){const a=G.t*18;r(Math.round(Math.cos(a)*3),-14+Math.round(Math.sin(a)*2),1,1,'#6a4a2a');r(0,-12,1,2,skin);}else r(2,-8,1,4,'#6a4a2a');return true;}
    if(key==='lib'){r(-2,-12,4,2,S.hat);r(-1,-13,2,1,S.hat);r(-2,-10,1,1,S.hat);
      if(u&&u.rf==='phalanx'){r(1,-9,11,1,'#6a4a2a');r(12,-9,1,1,'#c8ccd0');}else{r(-3,-18,1,14,'#6a4a2a');r(-3,-19,1,2,'#c8ccd0');}
      r(1,-9,3,5,S.shield);r(2,-10,1,1,S.shield);r(2,-4,1,1,S.shield);r(2,-7,1,1,'#f0d070');return true;}
    r(-2,-12,4,2,S.hat);r(-2,-10,1,1,S.hat);r(-1,-13,3,1,S.crest);
    if(crew)return true;
    if(key==='arc'){r(-3,-10,1,5,'#6b4a2a');if(aim||u.aiming){r(2,-11,1,7,'#7a5a30');r(3,-12,1,1,'#7a5a30');r(3,-4,1,1,'#7a5a30');r(0,-8,2,1,skin);}else r(2,-12,1,8,'#7a5a30');return true;}
    if(key==='leg'&&(u.rf==='testudo'||u.rf==='orbis')){r(-3,-14,7,2,S.shield);r(0,-14,1,1,'#e0c060');}
    else{r(-3,-17,1,13,'#6a4a2a');r(-3,-18,1,2,'#c8ccd0');}
    r(1,-10,3,8,S.shield);r(2,-7,1,2,'#e0c060');r(1,-10,3,1,'#e0c060');
    if(flag){r(-4,-24,1,20,'#6a4a2a');r(-7,-23,6,5,S.flag[0]);r(-7,-24,6,1,S.flag[1]);r(-5,-26,2,2,'#e0c060');}
    return true;}
  r(-2,-8,4,4,flash?'#fff':S.coat);r(-2,-8,1,4,flash?'#fff':S.coatD);r(-2,-5,4,1,'#2a2418');r(-1,-10,3,2,skin);
  if(S.helm==='de'){r(-2,-12,5,2,S.hat);r(-3,-11,1,1,S.hat);r(3,-11,1,1,S.hat);}else{r(-2,-12,4,2,S.hat);r(-1,-13,3,1,S.hat);r(-3,-11,1,1,S.hat);r(2,-11,1,1,S.hat);}
  if(crew)return true;
  if(aim){r(1,-8,6,1,'#3e2a18');r(7,-8,1,1,'#8a9096');}else{r(2,-13,1,8,'#3e2a18');r(2,-14,1,1,'#8a9096');}
  return true;}
function drawTank(u,x,y){x=Math.round(x);y=Math.round(y);const S=SIDE[u.side],col=u.hitFlash>.15?'#ffffff':S.veh,hd=u.hd!==undefined?u.hd:(u.side===0?0:Math.PI),c=Math.cos(hd),s=Math.sin(hd);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-14,y-1,28,3);const ph=Math.floor(u.anim||0)%3;
  const insig=(r,ox,oy)=>{if(S.helm==='de'){r(ox+1,oy,1,3,'#f0f0f0');r(ox,oy+1,3,1,'#f0f0f0');}else{r(ox,oy,2,1,'#ffffff');r(ox,oy+1,2,1,'#d4213d');r(ox+2,oy,2,1,'#d4213d');r(ox+2,oy+1,2,1,'#ffffff');}};
  if(Math.abs(c)>=.5||!Number.isFinite(hd)){const rc=Math.round(u.recoil*2),r=spr(x-(c>0?rc:-rc),y,c>0);
    r(-13,-5,26,5,'#24241f');for(let k=-12;k<13;k+=3)r(k+ph-1,-5,1,5,'#46463e');for(let k=-10;k<11;k+=5)r(k,-3,2,2,'#6a6a60');
    r(-12,-10,24,5,col);r(-12,-10,24,1,'#9a9a88');r(-12,-6,24,1,'rgba(0,0,0,.25)');
    r(-5,-15,11,5,col);r(-4,-16,9,1,'#9a9a88');r(6,-13,12,2,'#2e2e2a');r(18,-13,1,2,'#141414');insig(r,-10,-9);}
  else{const r=spr(x,y,true),front=s>0;
    r(-11,-9,4,9,'#24241f');r(7,-9,4,9,'#24241f');for(let k=-8;k<0;k+=3){r(-11,k+ph,4,1,'#46463e');r(7,k+ph,4,1,'#46463e');}
    r(-7,-11,14,8,col);r(-7,-11,14,1,'#9a9a88');r(-5,-16,10,5,col);r(-4,-17,8,1,'#9a9a88');
    if(front){r(-1,-14,2,3,'#141414');r(-2,-15,4,1,'#2e2e2a');insig(r,3,-8);}else{r(-1,-19,2,3,'#2e2e2a');r(-6,-5,2,2,'#1a1a18');r(4,-5,2,2,'#1a1a18');}}
  if(u.track){if(R()<.2)parts.push({k:'smoke',x:u.x-c*10,y:u.y-4,vx:0,vy:-6,r:2,g:4,life:0,max:2,a:.4});}}
function drawElephant(u,x,y){x=Math.round(x);y=Math.round(y);const dir=clDir(u.side),right=u.panicT>0?dir<0:dir>0,r=spr(x,y,right),S=SIDE[u.side],G1=u.hitFlash>.15?'#ffffff':'#8a8680',G2='#6a6660';
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-13,y-1,26,3);const f=u.moving?Math.floor(u.anim||0)%2:0;
  [-9,-5,3,7].forEach((lx,i)=>r(lx,-6+((i+f)%2),3,6-((i+f)%2),G2));
  r(-11,-17,20,11,G1);r(-11,-8,20,2,G2);r(-9,-18,16,1,'#a8a49c');r(-12,-15,1,6,G2);
  r(7,-18,6,9,G1);r(5,-17,3,7,G2);r(10,-16,1,1,'#222');r(12,-11,4,1,'#f0ead8');
  if(u.panicT>0){r(13,-24,2,7,G1);r(12,-25,2,1,G1);}else{r(12,-10,2,7,G1);r(11,-4,2,1,G1);}
  r(-7,-24,11,6,S.coat);r(-7,-24,11,1,S.flag[1]);r(3,-27,2,2,'#c99a6e');r(-4,-32,1,9,'#6a4a2a');r(-4,-33,1,1,'#c8ccd0');}
PROJDRAW.sling=function(p,x,y){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x),Math.round(y),1,1);ctx.fillStyle='#8a867c';ctx.fillRect(Math.round(x),Math.round(y-p.h),2,1);};
BULLET_LOOK.jav=['#6a4a2a',5,1];BULLET_LOOK.arrowf=['#4e3520',5,1];BULLET_LOOK.slingf=['#8a867c',2,1];BULLET_LOOK.atr=['#fff3c4',4,1];
const _eraChip=eraChip;
function eraChip2(type,x,y,col){ctx.fillStyle=col;
  switch(type){case'lib':ctx.fillRect(x+1,y+1,6,6);ctx.fillRect(x+7,y-2,1,11);return true;
    case'sli':ctx.fillRect(x+3,y,2,6);ctx.fillRect(x+2,y+6,1,3);ctx.fillRect(x+5,y+6,1,3);pdisc(ctx,x+7,y+1,1,col);return true;
    case'num':return _eraChip('eq',x,y,col)||(chipIcon('cav',x,y,col),true);
    case'ele':ctx.fillRect(x-1,y+2,10,5);ctx.fillRect(x+8,y+1,3,4);ctx.fillRect(x+10,y+5,1,3);ctx.fillRect(x,y+7,2,2);ctx.fillRect(x+6,y+7,2,2);return true;
    case'war':ctx.fillRect(x+2,y,3,2);ctx.fillRect(x+1,y+2,5,4);ctx.fillRect(x+1,y+6,1,3);ctx.fillRect(x+4,y+6,1,3);ctx.fillRect(x+6,y-1,1,6);return true;
    case'gcav':return false;
    case'ppk':ctx.fillRect(x-1,y+5,12,1);ctx.fillRect(x+1,y+6,3,2);ctx.fillRect(x+6,y+6,1,3);return true;}
  return _eraChip(type,x,y,col);}


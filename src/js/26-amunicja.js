/* ================= BALANS: czołg strzela jak armata, limit amunicji dla najmocniejszej broni ================= */
const AMMO={tank:12,at:14,mor:10,ppk:10,ona:8,bal:14,art:15};
const RESUPPLY={tank:true,ppk:true};
G.ammoLimit=true;
function initAmmo(u){if(G.ammoLimit&&AMMO[u.key]){u.shots=u.shotsMax=AMMO[u.key];}else{u.shots=u.shotsMax=undefined;}}
function noAmmo(u){if(!(u.noAmmoT>G.t)){msg(u.side,`${unitName(u)}: brak amunicji!${RESUPPLY[u.key]?' Wróć do swojej strefy po zapasy.':''}`);u.noAmmoT=G.t+3;}}
function useShot(u){if(u.shots===undefined)return true;if(u.shots<=0){noAmmo(u);return false;}u.shots--;if(u.shots===0)msg(u.side,`${unitName(u)}: ostatni pocisk!`);return true;}
// czołg: trzymasz A – pasek odległości (60–460), puszczasz – pocisk spada w tej odległości w kierunku lufy
function tankFire(u,range,manual){if(u.reload>0||G.state!=='battle')return false;if(!useShot(u))return false;
  u.reload=3.2;u.firedT=3;u.recoil=1;const c=Math.cos(u.hd),s=Math.sin(u.hd),bx=u.x+c*18,by=u.y+s*10;
  const rr=clamp(range,u.aimMin,u.aimMax)*(1+(R()-.5)*(manual?.04:.12)),a=u.hd+(R()-.5)*(manual?.02:.05);
  projs.push({kind:'tshell',x:bx,y:by,sx:bx,sy:by,tx:u.x+Math.cos(a)*rr,ty:u.y+Math.sin(a)*rr,t:0,T:.15+rr/900,H:Math.max(4,rr*.04),h:0,a,bounce:0,side:u.side,src:u.key,hit:new Set(),low:false,rr,fromX:u.x,fromY:u.y});
  parts.push({k:'flash',x:bx,y:by-12,life:0,max:.1,big:1});addSmoke(bx,by-12,3,true);AU.cannon(u.x);G.shake=Math.max(G.shake,2);G.stats[u.side].shots++;
  const hp=humanOf(u.side);if(hp>=0)rumble(hp,.6,.3,200);return true;}
function tshellImpact(p){const t=tAt(p.tx,p.ty);if(t===T.BRIDGE)breakBridge(p.tx,p.ty,p.side);
  if(t===T.WATER||t===T.FORD){for(let i=0;i<10;i++)parts.push({k:'dirt',x:p.tx,y:p.ty,z:0,vx:(R()-.5)*30,vy:(R()-.5)*16,vz:60+R()*60,life:0,max:.8,c:'#bcd6e2'});AU.impact(p.tx,true);}
  blast(p.tx,p.ty,12,.8,p.side,p.src);
  for(const e of units)if(e.type==='tank'&&!e.dead&&!e.gone&&dist(e.x,e.y,p.tx,p.ty)<13)tankHit(e,.35,p.side,p.fromX,p.fromY);}
PROJDRAW.tshell=function(p,x,y){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x),Math.round(y),2,1);ctx.fillStyle='#fff0b0';ctx.fillRect(Math.round(x)-1,Math.round(y-p.h)-1,3,2);};
// działo czołgu strzela tylko w przód i po skosach (±45°). Etap 1: trzymasz A – drążek góra–dół ustawia kierunek, czołg sam się obraca;
// puszczasz. Etap 2: drugie A trzymane – pasek odległości (60–460), puszczasz = strzał. Drążek przed drugim A anuluje celowanie.
const tankAimH=u=>clDir(u.side)>0?u.aimA:Math.PI-u.aimA;
const relCone=(u,h)=>Math.atan2(Math.sin(h),clDir(u.side)*Math.cos(h));
function tankGun(u,dt,I){const can=u.reload<=0&&(u.shots===undefined||u.shots>0),st=u.tAim||0;
  if(!I.inp){u.tAim=0;u.aiming=false;return;}
  if(st===0){if(I.Ap){if(!can){if(I.hum){AU.bad();if(u.shots===0)noAmmo(u);}return;}u.tAim=1;u.aimA=clamp(relCone(u,u.hd),-CONE,CONE);if(I.hum)AU.ui();}return;}
  if(st===1){u.aimA=clamp(u.aimA+I.y*1.3*dt,-CONE,CONE);if(!I.A){u.tAim=2;u.tWait=0;}return;}
  if(st===2){u.tWait+=dt;if(Math.hypot(I.x,I.y)>.6||u.tWait>5){u.tAim=0;return;}if(I.Ap&&can){u.tAim=3;u.aiming=true;u.aimDir=1;u.aimR=u.aimMin;}return;}
  if(I.A){u.aimR+=u.aimDir*300*dt;if(u.aimR>u.aimMax){u.aimR=u.aimMax;u.aimDir=-1;}if(u.aimR<u.aimMin){u.aimR=u.aimMin;u.aimDir=1;}}
  else{u.tAim=0;u.aiming=false;u.hd=tankAimH(u);tankFire(u,u.aimR,true);}}
KD.tank.init=u=>{u.reloadMax=3.2;u.track=false;u.hd=u.side===0?0:Math.PI;u.aimMin=60;u.aimMax=460;};
KD.tank.status=u=>u.tAim===1?'KIERUNEK: drążek góra–dół, puść A':u.tAim===2?'A: trzymaj = odległość · drążek = anuluj':u.tAim===3?`Odległość ${Math.round(u.aimR)} kroków – puść A`:`${u.reload>0?'Ładowanie działa':'Trzymaj A = kierunek strzału'} · RT: km`;
// uzupełnianie amunicji: czołg i rusznica w swojej strefie, na postoju
const _eraTick2=eraTick2;
function eraTick3(dt){_eraTick2(dt);if(!G.ammoLimit)return;
  for(const u of units){if(u.dead||u.gone||u.shotsMax===undefined||!RESUPPLY[u.key]||u.shots>=u.shotsMax)continue;
    const still=u.type==='tank'?!u.moving:!u.men.some(m=>m.alive&&m.mv>.2);
    if(inZone(u.side,u.x)&&still){u.resT=(u.resT||0)+dt;if(u.resT>2.5){u.resT=0;u.shots++;if(u.shots===u.shotsMax)msg(u.side,`${unitName(u)}: amunicja uzupełniona.`);}}else u.resT=0;}}
// samoobrona czołgu i rusznicy z limitem amunicji
AUTO.tank=function(u,dt){const c=Math.cos(u.hd||0),s=Math.sin(u.hd||0);
  for(const e of units){if(e.side===u.side||e.dead||e.gone||e.state==='enter')continue;const d=dist(u.x,u.y,e.x,e.y),da=Math.abs(angDiff(u.hd||0,Math.atan2(e.y-u.y,e.x-u.x)));
    if(u.reload<=0&&!u.aiming&&!u.tAim&&d<u.aimMax*AUTO_RANGE&&d>u.aimMin&&da<.06&&Math.abs(relCone(u,u.hd))<=CONE&&(u.shots===undefined||u.shots>0))tankFire(u,d,false);
    if(e.type==='inf'&&d<320*AUTO_RANGE&&da<.2){u.mgT=(u.mgT||0)-dt;if(u.mgT<=0){u.mgT=.14;bullets.push({x:u.x+c*12,y:u.y+s*6,vx:c*360,vy:s*360+(R()-.5)*18,left:320*AUTO_RANGE,side:u.side,src:u.key,kind:'mg',pk:.25,sup:true});
      if(R()<.5)AU.burst(.05,1900,'bandpass',1,.1,AU.pan(u.x));}}}};
const _autoPpk=AUTO.ppk;AUTO.ppk=function(u,dt){if(u.shots===0)return;const before=u.reload;_autoPpk(u,dt);if(u.shots!==undefined&&u.reload>before)u.shots--;};
// komputer: czołg celuje odległością, bez amunicji wraca po zapasy
CPU.tank=function(u,dt,foes,dir,c){
  if(u.shots===0){const hx=u.side===0?DEPLOY-60:W-DEPLOY+60;if(Math.abs(u.x-hx)>20){const v=steer(u,hx,u.y,dt);return{x:v[0],y:v[1],A:false};}return idle0;}
  const t=nearestBy(foes.filter(f=>f.key==='at'||f.key==='mg'||f.key==='rif'||f.key==='ppk'),u)||nearestBy(foes,u),d=dist(u.x,u.y,t.x,t.y);
  const h=Math.atan2(t.y-u.y,t.x-u.x),a=relCone(u,h),mg=t.type==='inf'&&d<300&&Math.abs(angDiff(u.hd,h))<.25,st=u.tAim||0;
  if(st===3){const want=clamp(d*(1+c.aimErr),u.aimMin+5,u.aimMax-3);return{x:0,y:0,A:u.aimR<want||u.aimDir<0};}
  if(st===1){const da=clamp(a,-CONE,CONE)-u.aimA;return Math.abs(da)>.02?{x:0,y:clamp(da*10,-1,1),A:true}:idle0;}
  if(st===2){if(Math.abs(angDiff(u.hd,tankAimH(u)))<.1){c.aimErr=(R()-.5)*.1;return{x:0,y:0,A:true};}return idle0;}
  if((d>u.aimMax*.9||Math.abs(a)>CONE)&&!u.track){const v=steer(u,t.x-dir*300,t.y,dt);return{x:v[0],y:v[1],A:false,R:mg};}
  return{x:0,y:0,A:u.reload<=0&&Math.abs(a)<=CONE,R:mg};};
const idle0={x:0,y:0,A:false};


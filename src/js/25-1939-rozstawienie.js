/* ================= 1939: ROZSTAWIENIE, SAMOOBRONA, NISZCZENIE PRZESZKÓD ================= */
const AUTO_RANGE=.75;
// --- rozstawienie przed bitwą ---
function inZone(side,x){return side===0?x<=DEPLOY:x>=W-DEPLOY;}
function deployMove(u,dx,dy){const ty=u.type,single=ty==='art'||ty==='tank'||ty==='ele';
  const pts=single?[[u.x,u.y]]:u.men.filter(m=>m.alive).map(m=>[m.x,m.y]);
  const ok=pts.every(([x,y])=>{const nx=x+dx,ny=y+dy;return inZone(u.side,nx)&&nx>6&&ny>34&&ny<H-10&&tAt(nx,ny)!==T.WATER&&passF(ty,nx,ny)>0;});
  if(!ok)return false;
  if(single){u.x+=dx;u.y+=dy;clCrew(u,true,0);}
  else{for(const m of u.men)if(m.alive){m.x+=dx;m.y+=dy;m.anim+=Math.hypot(dx,dy)*.22;m.mv=1;}clCentroid(u);}
  u.tx=u.x;u.ty=u.y;return true;}
function deployStep(dt){G.deployT-=dt;
  for(let p=0;p<2;p++){if(humanOf(p)<0)continue;const u=clSel(p);if(!u)continue;const c=input.ctl[p],sp=70*dt;
    if(Math.abs(c.lx)>.2||Math.abs(c.ly)>.2){if(!deployMove(u,c.lx*sp,c.ly*sp)){deployMove(u,c.lx*sp,0);deployMove(u,0,c.ly*sp);}}
    if(u.type==='tank'&&(c.p.rt||c.b.rt))u.hd=angDiff(0,(u.hd||0)+dt*2.2);}
  for(const u of units)for(const m of u.men)m.mv=Math.max(0,(m.mv||0)-dt*5);
  if(G.deployT<=0||(G.ready[0]&&G.ready[1])){G.state='battle';AU.bugle(BUG.charge);msg(0,'Do boju!');}}
function snapDeploy(){for(const u of units){if(u.state!=='enter')continue;
  if(u.type==='art'||u.type==='tank'||u.type==='ele'){u.x=u.tx;u.y=u.ty;clCrew(u,true,0);}
  else{for(const m of u.men)if(m.alive){m.x=u.tx+m.ox;m.y=u.ty+m.oy;m.mv=0;}clCentroid(u);}
  u.state=u.type==='cav'?'idle':'ready';}}

// --- samoobrona oddziałów bez sterowania (bez moździerzy i dział) ---
function nearestAlignedMan(u,shooters,rg,filter,tol){const dir=clDir(u.side);
  for(const e of units){if(e.side===u.side||e.dead||e.gone||e.state==='enter'||(filter&&!filter(e)))continue;if(Math.abs(e.x-u.x)>rg+60)continue;
    for(const m of shooters){for(const o of e.men){if(!o.alive)continue;const dx=(o.x-m.x)*dir;if(dx>4&&dx<rg&&Math.abs(o.y-m.y)<tol)return[e,o,m];}}}return null;}
const AUTO={
  rif(u,dt){if(u.reload>0)return;const rg=230*AUTO_RANGE,al=u.men.filter(m=>m.alive);
    if(nearestAlignedMan(u,al,rg,e=>e.type!=='tank',3.5))clVolley(u,{reload:1.7,range:rg,spd:420,pk:.7,kind:'rifle'});},
  ppk(u,dt){if(u.reload>0)return;const g=u.men.find(m=>m.alive);if(!g)return;const rg=420*AUTO_RANGE,dir=clDir(u.side);
    for(const e of units){if(e.side===u.side||e.dead||e.gone||e.type!=='tank')continue;const dx=(e.x-g.x)*dir;
      if(dx>4&&dx<rg&&Math.abs(e.y-g.y)<5){u.reload=3;u.firedT=3;const b={x:g.x+dir*8,y:g.y,vx:dir*700,vy:0,left:rg,side:u.side,src:u.key,kind:'atr',pk:.75};b.ap=bb=>{const tr=rg-bb.left;return tr<150?.3:.15;};
        bullets.push(b);parts.push({k:'flash',x:g.x+dir*10,y:g.y-3,life:0,max:.06});AU.musket(u.x,2);G.stats[u.side].shots++;return;}}},
  mg(u,dt){if(u.over){u.firing=false;return;}const g=u.men.find(m=>m.alive);if(!g)return;const rg=380*AUTO_RANGE,dir=clDir(u.side);let best=null,bd=1e9;
    for(const e of units){if(e.side===u.side||e.dead||e.gone||e.type!=='inf'||e.state==='enter')continue;for(const o of e.men){if(!o.alive)continue;const dx=(o.x-g.x)*dir;
      if(dx>20&&dx<rg&&Math.abs(o.y-g.y)<=dx){const d=dx+Math.abs(o.y-g.y)*2;if(d<bd){bd=d;best=o;}}}}
    if(!best){u.firing=false;return;}u.firing=true;const dx=Math.max(40,(best.x-g.x)*dir),want=(best.y-g.y)*380/dx;u.mgY+=clamp(want-(u.mgY||0),-90*dt,90*dt);
    u.heat=(u.heat||0)+dt*.5;if(u.heat>=1){u.over=true;u.firing=false;return;}
    u.mgT=(u.mgT||0)-dt;if(u.mgT<=0){u.mgT=.1;bullets.push({x:g.x+dir*9,y:g.y,vx:dir*380,vy:u.mgY+(R()-.5)*10,left:rg,side:u.side,src:u.key,kind:'mg',pk:.3,sup:true});
      parts.push({k:'flash',x:g.x+dir*10,y:g.y-3,life:0,max:.04});if(R()<.5)AU.burst(.06,1900,'bandpass',1,.12,AU.pan(u.x));G.stats[u.side].shots++;u.firedT=3;}},
  tank(u,dt){const c=Math.cos(u.hd||0),s=Math.sin(u.hd||0);
    for(const e of units){if(e.side===u.side||e.dead||e.gone||e.state==='enter')continue;const d=dist(u.x,u.y,e.x,e.y),da=Math.abs(angDiff(u.hd||0,Math.atan2(e.y-u.y,e.x-u.x)));
      if(u.reload<=0&&d<760*AUTO_RANGE&&da<.06){u.reload=3.2;u.firedT=3;u.recoil=1;const bx=u.x+c*18,by=u.y+s*10;
        bullets.push({x:bx,y:by,vx:c*480,vy:s*480,left:760*AUTO_RANGE,side:u.side,src:u.key,kind:'shell',pk:.6,boom:10,bk:.75,ap:.35});
        parts.push({k:'flash',x:bx,y:by-12,life:0,max:.1,big:1});addSmoke(bx,by-12,3,true);AU.cannon(u.x);G.stats[u.side].shots++;}
      if(e.type==='inf'&&d<320*AUTO_RANGE&&da<.2){u.mgT=(u.mgT||0)-dt;if(u.mgT<=0){u.mgT=.14;bullets.push({x:u.x+c*12,y:u.y+s*6,vx:c*360,vy:s*360+(R()-.5)*18,left:320*AUTO_RANGE,side:u.side,src:u.key,kind:'mg',pk:.25,sup:true});
        if(R()<.5)AU.burst(.05,1900,'bandpass',1,.1,AU.pan(u.x));}}}}
};
function autoDefend(u,dt){if(G.era!=='ww2'||G.state!=='battle'||u.state==='enter'||u.dead)return;const f=AUTO[u.key];if(f)f(u,dt);}

// --- przeszkody niszczone ostrzałem na wprost; granaty i moździerze lecą nad nimi ---
// przeszkody dla strzałów na wprost (wszystkie epoki): szansa zatrzymania kuli przy wejściu na pole, wytrzymałość, co zostaje po zniszczeniu
// skała: zatrzymuje wszystko, kruszą ją tylko armaty i czołg; dom: zatrzymuje kule, aż ostrzał zrobi z niego ruinę;
// las i zboże: każde pole zatrzymuje część kul – przez pas lasu nie przechodzi zwykle od 1/3 do 2/3
const OBST={[T.ROCK]:{stop:1,hp:40,heavy:true,to:T.RUINS},[T.HOUSE]:{stop:1,hp:30,to:T.RUINS},[T.WALL]:{stop:.6,hp:16,to:T.GRASS},
  [T.SANDBAG]:{stop:.6,hp:12,to:T.GRASS},[T.PALISADE]:{stop:.5,hp:10,to:T.GRASS},[T.FENCE]:{stop:.3,hp:6,to:T.GRASS},[T.RUINS]:{stop:.35},
  [T.FOREST]:{stop:.15,soft:true},[T.WHEAT]:{stop:.06,soft:true}};
const HEAVY=new Set(['art','dz','at','tank']);
const BULLET_DMG={mg:.5,rifle:1,musket:1,pistol:.5,atr:2,shell:6,bolt:2,pilum:.5,jav:.5,arrowf:.3,slingf:.5};
function obstacleHit(x,y,dmg,src){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=GW||ty>=GH)return;
  const i=ty*GW+tx,t=MAP.t[i],O=OBST[t];if(!O||!O.hp)return;if(!MAP.thp)MAP.thp=new Float32Array(GW*GH);
  if(R()<.6)parts.push({k:'dust',x:x,y:y-4,vx:(R()-.5)*20,vy:-10,life:0,max:.4,c:t===T.SANDBAG?'190,170,120':'150,140,125'});
  if(O.heavy&&!HEAVY.has(src))return;
  const hp=O.hp,before=MAP.thp[i];MAP.thp[i]+=dmg;const g=G.tctx,X=tx*TS,Y=ty*TS;
  if(g&&before<hp*.5&&MAP.thp[i]>=hp*.5){for(let k=0;k<4;k++){g.fillStyle='rgba(30,24,16,.8)';g.fillRect(X+Math.floor(R()*10),Y+Math.floor(R()*9),2,1);}}
  if(MAP.thp[i]>=hp){MAP.thp[i]=0;MAP.t[i]=O.to;
    for(let k=0;k<10;k++)parts.push({k:'dirt',x:X+6,y:Y+6,z:2,vx:(R()-.5)*50,vy:(R()-.5)*30,vz:40+R()*50,life:0,max:.8,c:t===T.SANDBAG?'#b8a67a':'#8a847a'});AU.impact(X+6,true);
    if(g){if(t===T.HOUSE||t===T.ROCK){g.fillStyle=t===T.ROCK?'rgba(96,90,80,.9)':'rgba(60,56,50,.85)';g.fillRect(X,t===T.HOUSE?Y-6:Y,TS,TS+(t===T.HOUSE?6:0));for(let k=0;k<8;k++){g.fillStyle=R()<.5?'#8a8278':'#5a524a';g.fillRect(X+Math.floor(R()*10),Y-(t===T.HOUSE?4:0)+Math.floor(R()*12),3,2);}}
      else{g.fillStyle='rgba(70,82,44,.9)';g.fillRect(X,Y,TS,TS);for(let k=0;k<7;k++){g.fillStyle=t===T.SANDBAG?(R()<.5?'#b8a67a':'#8a7a52'):(R()<.5?'#8a847a':'#6a645a');g.fillRect(X+Math.floor(R()*10),Y+Math.floor(R()*10),2+Math.floor(R()*2),1+Math.floor(R()*2));}}}}}
function areaObstacleHit(x,y,Rr,dmg,src){for(let dy=-Rr;dy<=Rr;dy+=TS/2)for(let dx=-Rr;dx<=Rr;dx+=TS/2){if(dx*dx+dy*dy<=Rr*Rr)obstacleHit(x+dx,y+dy,dmg/4,src);}}


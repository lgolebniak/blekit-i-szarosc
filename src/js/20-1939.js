/* ================= WRZESIEŃ 1939: zachowania ================= */
BEH.rif=function(u,dt,I){const{x,y}=I,sp=26*(G.weather==='rain'?.9:1)*(u.supT>0?.4:1);
  const horiz=Math.abs(x)>.3&&Math.abs(x)>=Math.abs(y),vert=Math.abs(y)>.3&&Math.abs(y)>Math.abs(x);
  if(horiz){u.s=Math.min(1,u.s+dt*.7);u.colDir=Math.sign(x);}else if(vert)u.s=Math.max(0,u.s-dt*1.1);
  clMoveMen(u,x*sp,y*sp,dt,false,vert?2.2:horiz?1.2:0,I.hum);
  if(I.Ap&&I.bat&&!clVolley(u,{reload:1.7,range:230,spd:420,pk:.7,kind:'rifle'})&&I.hum)AU.bad();
  if(I.Rp&&I.bat){if(u.cd2>0){if(I.hum)AU.bad();}else{const dir=clDir(u.side);u.cd2=6;
    projs.push({kind:'gren',x:u.x,y:u.y,sx:u.x+dir*5,sy:u.y,tx:u.x+dir*(70+R()*12),ty:u.y+(R()-.5)*10,t:0,T:.75,H:24,h:0,a:u.fa,bounce:0,side:u.side,src:u.key,hit:new Set(),low:false});}}};
BEH.mg=function(u,dt,I){const{x,y,A}=I;if(u.over&&u.heat<.35)u.over=false;
  const firing=A&&I.bat&&!u.over;u.firing=firing;if(!firing)u.heat=Math.max(0,(u.heat||0)-dt*.22);
  if(!firing){const sp=15*(u.supT>0?.4:1);clMoveMen(u,x*sp,y*sp,dt,false,2,I.hum);u.mgY*=Math.pow(.25,dt);}
  else{clMoveMen(u,0,0,dt,false,1,I.hum);u.mgY=clamp((u.mgY||0)+y*80*dt,-100,100);u.heat+=dt*.28;
    if(u.heat>=1){u.over=true;msg(u.side,`${unitName(u)}: lufa przegrzana!`);}
    u.mgT=(u.mgT||0)-dt;if(u.mgT<=0){u.mgT=.085;const g=u.men.find(m=>m.alive),dir=clDir(u.side);
      if(g){const L=380,sp=380;bullets.push({x:g.x+dir*9,y:g.y,vx:dir*sp,vy:u.mgY*sp/L+(R()-.5)*10,left:L,side:u.side,src:u.key,kind:'mg',pk:.3,sup:true});
        parts.push({k:'flash',x:g.x+dir*10,y:g.y-3,life:0,max:.04});if(R()<.5)AU.burst(.06,1900,'bandpass',1,.13,AU.pan(u.x));if(R()<.25)addSmoke(g.x+dir*9,g.y-3,1,false);G.stats[u.side].shots++;u.firedT=3;}}}};
BEH.tank=function(u,dt,I){const{x,y}=I,dir=clDir(u.side);u.moving=false;
  if(!u.track&&(Math.abs(x)>.15||Math.abs(y)>.15)){const pf=passF('tank',u.x,u.y),f=pf>0?pf:.5;
    const ok=(X,Y)=>{const t=tAt(X,Y);if(t===T.WATER)return I.hum;return passF('tank',X,Y)>0;};
    const nx=clamp(u.x+x*26*f*dt,10,W-10),ny=clamp(u.y+y*20*f*dt,34,H-12);
    if(ok(nx,ny)){u.x=nx;u.y=ny;u.moving=true;}else if(ok(nx,u.y)){u.x=nx;u.moving=true;}else if(ok(u.x,ny)){u.y=ny;u.moving=true;}
    if(u.moving){u.anim=(u.anim||0)+dt*10;if(R()<.3)dustAt(u.x-dir*12,u.y,1,'120,105,80');}}
  if(I.Ap&&I.bat){if(u.reload>0){if(I.hum)AU.bad();}
    else{u.reload=3.2;u.firedT=3;u.recoil=1;const bx=u.x+dir*18;
      bullets.push({x:bx,y:u.y,vx:dir*480,vy:0,left:760,side:u.side,src:u.key,kind:'shell',pk:.6,boom:10,bk:.75,ap:.35});
      parts.push({k:'flash',x:bx,y:u.y-12,life:0,max:.1,big:1});addSmoke(bx,u.y-12,3,true);AU.cannon(u.x);G.shake=Math.max(G.shake,2);G.stats[u.side].shots++;
      const hp=humanOf(u.side);if(hp>=0)rumble(hp,.6,.3,200);}}
  if(I.R&&I.bat){u.mgT=(u.mgT||0)-dt;if(u.mgT<=0){u.mgT=.14;bullets.push({x:u.x+dir*12,y:u.y,vx:dir*360,vy:(R()-.5)*18,left:320,side:u.side,src:u.key,kind:'mg',pk:.25,sup:true});
      parts.push({k:'flash',x:u.x+dir*12,y:u.y-7,life:0,max:.04});if(R()<.5)AU.burst(.05,1900,'bandpass',1,.1,AU.pan(u.x));}}
  if(tAt(u.x,u.y)===T.BRIDGE&&nearBroken(u.x,u.y)&&R()<dt*.9){breakBridge(u.x,u.y,u.side);msg(u.side,`${unitName(u)}: most załamał się pod czołgiem!`);}
  clCrew(u,false,dt);};
BEH.at=function(u,dt,I){artVert(u,I.y,dt);
  if(I.Ap&&I.bat){if(u.reload>0||u.setup>0){if(I.hum)AU.bad();}
    else if(useShot(u)){const dir=clDir(u.side),bx=u.x+dir*14;u.reload=2.6;u.firedT=3;u.recoil=1;
      const b={x:bx,y:u.y,vx:dir*520,vy:0,left:820,side:u.side,src:u.key,kind:'shell',pk:.6,boom:7,bk:.6};b.ap=bb=>{const tr=820-bb.left;return tr<300?.75:tr<550?.45:.25;};bullets.push(b);
      parts.push({k:'flash',x:bx,y:u.y-6,life:0,max:.08,big:1});addSmoke(bx,u.y-6,2,false);AU.cannon(u.x);G.shake=Math.max(G.shake,1.2);G.stats[u.side].shots++;}}
  clCrew(u,false,dt);};
function nearBroken(x,y){if(!MAP.broken)return false;const tx=Math.floor(x/TS),ty=Math.floor(y/TS);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(MAP.broken.has((ty+dy)*GW+tx+dx))return true;return false;}

/* --- wybuchy, pancerz, dym --- */
function blast(x,y,Rr,k,side,src){for(let i=0;i<10;i++)parts.push({k:'dirt',x,y,z:0,vx:(R()-.5)*50,vy:(R()-.5)*30,vz:50+R()*60,life:0,max:.8,c:R()<.5?'#5a4630':'#7a6446'});
  parts.push({k:'flash',x,y:y-4,life:0,max:.1,big:1});addSmoke(x,y-3,2,false);const t=tAt(x,y);if(t!==T.WATER&&t!==T.BRIDGE&&t!==T.FORD&&Rr>=10)decalCrater(x,y);AU.impact(x);
  for(const e of units){if(e.dead||e.gone||e.type==='tank'||dist(x,y,e.x,e.y)>Rr+50)continue;
    for(const m of e.men){if(!m.alive)continue;const d=dist(x,y,m.x,m.y);if(d<Rr&&R()<k*(1-.4*d/Rr)*eff(src,e.key)){killMan(e,m,'ball');if(side>=0&&e.side!==side)G.stats[side].hits++;}}}
  for(let dy=-Rr;dy<=Rr;dy+=TS)for(let dx=-Rr;dx<=Rr;dx+=TS)if(tAt(x+dx,y+dy)===T.WIRE)crushWire(x+dx,y+dy);
  areaObstacleHit(x,y,Math.max(Rr,10),8);}
function grenImpact(p){blast(p.tx,p.ty,14,.75,p.side,p.src);
  for(const e of units){if(e.type!=='tank'||e.dead||e.gone)continue;if(dist(p.tx,p.ty,e.x,e.y)<14&&!e.track&&R()<.6){e.track=true;msg(e.side,`${unitName(e)}: granat zerwał gąsienicę!`);}}}
function smokeCloud(x,y){for(let i=0;i<24;i++)parts.push({k:'smoke',x:x+(R()-.5)*40,y:y+(R()-.5)*30,vx:G.wind.x*4+(R()-.5)*3,vy:G.wind.y*4+(R()-.5)*3,r:6+R()*5,g:6,life:0,max:9+R()*3,a:.7});
  const tx=Math.floor(x/TS),ty=Math.floor(y/TS);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=tx+dx,Y=ty+dy;if(X>=0&&Y>=0&&X<GW&&Y<GH)smokeG[Y*GW+X]+=7;}AU.burst(.5,400,'lowpass',1,.3,AU.pan(x));}
function tankHit(e,ap,side,fromX){if(e.dead)return;const eff=isFront(e,fromX)?ap:Math.min(.95,ap*2.2);
  parts.push({k:'flash',x:e.x,y:e.y-8,life:0,max:.1,big:1});AU.impact(e.x);G.shake=Math.max(G.shake,2);
  if(R()<eff){const m=e.men.find(q=>q.alive);if(m){killMan(e,m,'boom');G.stats[side].hits++;}}
  else if(!e.track&&R()<.35){e.track=true;msg(e.side,`${unitName(e)}: gąsienica zerwana!`);}
  else{for(let i=0;i<6;i++)parts.push({k:'spark',x:e.x,y:e.y-8,vx:(R()-.5)*60,vy:-R()*40,life:0,max:.3});AU.tone(1400,.08,'square',.05);}}
function tankDestroy(e,m,kind){m.alive=false;G.stats[e.side].lost++;e.hitFlash=.3;const x=e.x,y=e.y;
  if(kind==='drown'){for(let i=0;i<16;i++)parts.push({k:'dirt',x,y,z:0,vx:(R()-.5)*40,vy:(R()-.5)*14,vz:50+R()*60,life:0,max:.9,c:'#d8ecf4'});AU.impact(x,true);msg(e.side,`${unitName(e)} zatonął.`);return;}
  for(let i=0;i<20;i++)parts.push({k:'dirt',x,y,z:4,vx:(R()-.5)*80,vy:(R()-.5)*50,vz:60+R()*90,life:0,max:1.1,c:R()<.5?'#2a2a26':'#ff9a40'});
  parts.push({k:'flash',x,y:y-8,life:0,max:.25,big:1});addSmoke(x,y-8,8,true);AU.cannon(x);G.shake=Math.max(G.shake,4);
  const g=G.tctx;if(g){const r=flipR(g,Math.round(x),Math.round(y),e.side===0);r(-13,-2,26,4,'rgba(0,0,0,.35)');r(-12,-6,24,5,'#2a2724');r(-5,-10,10,4,'#34302c');r(4,-9,9,2,'#2a2724');r(-8,-7,4,2,'#4a3a2a');}
  const ti=Math.floor(y/TS)*GW+Math.floor(x/TS),t=MAP.t[ti];if(t!==T.BRIDGE&&t!==T.FORD&&t!==T.WATER)MAP.t[ti]=T.WALL;
  (G.fires||(G.fires=[])).push({x,y,t:30});msg(e.side,`${unitName(e)} zniszczony!`);}
function eraTick(dt){if(!G.fires)return;for(let i=G.fires.length-1;i>=0;i--){const f=G.fires[i];f.t-=dt;if(f.t<=0){G.fires.splice(i,1);continue;}
  if(R()<dt*4)parts.push({k:'smoke',x:f.x+(R()-.5)*8,y:f.y-10,vx:G.wind.x*8,vy:-6,r:3,g:6,life:0,max:4,a:.5});
  if(R()<dt*8)parts.push({k:'spark',x:f.x+(R()-.5)*10,y:f.y-8,vx:(R()-.5)*10,vy:-18,life:0,max:.4});}}
function eraSprites(){}


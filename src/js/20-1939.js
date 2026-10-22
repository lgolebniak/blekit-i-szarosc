/* ================= WRZESIEŃ 1939: zachowania ================= */
// celowanie w stożku ±45°: krótkie A = strzał na wprost, przytrzymane A = drążek góra–dół ustawia skos, puszczenie = strzał
const CONE=Math.PI/4,CONE_HOLD=.22;
const coneVec=(u,a)=>[clDir(u.side)*Math.cos(a),Math.sin(a)];
function coneFire(u,I,dt){if(!I.bat||!I.inp){u.aHold=0;u.coneOn=false;return null;}
  if(I.A){u.aHold=(u.aHold||0)+dt;if(u.aHold>CONE_HOLD){if(!u.coneOn){u.coneOn=true;u.aimA=0;}u.aimA=clamp(u.aimA+I.y*1.4*dt,-CONE,CONE);}return null;}
  if(!u.aHold)return null;const a=u.coneOn?u.aimA:0;u.aHold=0;u.coneOn=false;return a;}
function coneLines(u,S){ctx.save();ctx.strokeStyle=S.ui;ctx.lineWidth=1;
  const ray=(x,y,a,L,al)=>{const[vx,vy]=coneVec(u,a);ctx.globalAlpha=al;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+vx*L,y+vy*L);ctx.stroke();};
  if(u.gAim){ctx.setLineDash([2,2]);ray(u.x,u.y,u.gA,u.gR,.8);const[vx,vy]=coneVec(u,u.gA);ctx.setLineDash([]);ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(u.x+vx*u.gR,u.y+vy*u.gR,7,0,TAU);ctx.stroke();ctx.restore();return;}
  if(u.type==='tank'){const L=u.tAim===3?u.aimR:u.aimMax;ray(u.x,u.y,-CONE,70,.3);ray(u.x,u.y,CONE,70,.3);ctx.setLineDash([3,3]);ray(u.x,u.y,u.aimA,L,.85);
    if(u.tAim===3){const[vx,vy]=coneVec(u,u.aimA);ctx.setLineDash([]);ctx.beginPath();ctx.arc(u.x+vx*L,u.y+vy*L,9,0,TAU);ctx.stroke();}}
  else{ctx.setLineDash([2,3]);if(u.type==='art')ray(u.x,u.y,u.aimA,artMaxRange(u),.6);else for(const m of u.men)if(m.alive)ray(m.x,m.y,u.aimA,u.key==='ppk'?420:230,.4);}
  ctx.restore();}
// piechota: krzyżak ↓ = padnij (kryją się, po 4 s bez ruchu okopują się, drążek = czołganie), ↑ = powstań
function setProne(u,v){if(!!u.prone===v)return;u.prone=v;u.dugT=0;u.dug=false;u.formT=.5;if(humanOf(u.side)>=0)AU.ui();}
// granaty: trzymasz RT – drążek góra–dół ustawia kierunek, pasek odległość; puszczasz = rzut. 4–6 ludzi rzuca 2 granaty, 1–3 – jeden.
const GREN={min:30,max:120,spd:130,n:5};
function grenAim(u,I,dt){if(!I.bat||!I.inp){u.gAim=false;return;}
  if(I.R&&u.gren>0&&u.cd2<=0){if(!u.gAim){u.gAim=true;u.gR=GREN.min;u.gDir=1;u.gA=0;}
    u.gR+=u.gDir*GREN.spd*dt;if(u.gR>GREN.max){u.gR=GREN.max;u.gDir=-1;}if(u.gR<GREN.min){u.gR=GREN.min;u.gDir=1;}u.gA=clamp(u.gA+I.y*1.4*dt,-CONE,CONE);}
  else if(u.gAim){u.gAim=false;throwGren(u,u.gR,u.gA);}
  else if(I.Rp&&I.hum){AU.bad();if(u.gren<=0)msg(u.side,`${unitName(u)}: brak granatów!`);}}
function throwGren(u,r,a){const al=u.men.filter(m=>m.alive),n=Math.min(u.gren||0,al.length>=4?2:1);if(!n)return false;u.gren-=n;u.cd2=4;const[cx,cy]=coneVec(u,a);
  for(let i=0;i<n;i++){const m=al[Math.floor(i*al.length/n)],rr=r*(1+(R()-.5)*.12),tx=u.x+cx*rr+(R()-.5)*6,ty=u.y+cy*rr+(n>1?(i?7:-7):0)+(R()-.5)*5;
    projs.push({kind:'gren',x:m.x,y:m.y,sx:m.x,sy:m.y,tx,ty,t:0,T:.45+rr/300,H:14+rr*.15,h:0,a:0,bounce:0,side:u.side,src:u.key,hit:new Set(),low:false});}
  AU.burst(.2,1200,'bandpass',1,.15,AU.pan(u.x));return true;}
BEH.rif=function(u,dt,I){if(u.post)return postBeh(u,dt,I);const{x,y}=I,sp=26*(G.weather==='rain'?.9:1)*(u.supT>0?.4:1)*(u.prone?.3:1),a=coneFire(u,I,dt);
  if(u.prone){const moving=Math.abs(x)>.2||Math.abs(y)>.2;u.dugT=moving&&!I.A&&!u.gAim?0:(u.dugT||0)+dt;if(!u.dug&&u.dugT>4){u.dug=true;msg(u.side,`${unitName(u)} okopali się.`);}else if(u.dugT===0)u.dug=false;}
  if((I.A||u.gAim)&&I.bat)clMoveMen(u,0,0,dt,false,1,I.hum);
  else{const horiz=Math.abs(x)>.3&&Math.abs(x)>=Math.abs(y),vert=Math.abs(y)>.3&&Math.abs(y)>Math.abs(x);
    if(horiz){u.s=Math.min(1,u.s+dt*.7);u.colDir=Math.sign(x);}else if(vert)u.s=Math.max(0,u.s-dt*1.1);
    clMoveMen(u,x*sp,y*sp,dt,false,vert?2.2:horiz?1.2:0,I.hum);}
  if(a!==null&&!clVolley(u,{reload:1.7*(u.prone?1.3:1),range:230,spd:420,pk:.7,kind:'rifle',ang:a})&&I.hum)AU.bad();
  grenAim(u,I,dt);};
BEH.mg=function(u,dt,I){const{x,y,A}=I;if(u.over&&u.heat<.35)u.over=false;
  const firing=A&&I.bat&&!u.over;u.firing=firing;if(!firing)u.heat=Math.max(0,(u.heat||0)-dt*.22);
  if(!firing){const sp=15*(u.supT>0?.4:1);clMoveMen(u,x*sp,y*sp,dt,false,2,I.hum);u.mgY*=Math.pow(.25,dt);}
  else{clMoveMen(u,0,0,dt,false,1,I.hum);u.mgY=clamp((u.mgY||0)+y*240*dt,-380,380);u.heat+=dt*.28;
    if(u.heat>=1){u.over=true;msg(u.side,`${unitName(u)}: lufa przegrzana!`);}
    u.mgT=(u.mgT||0)-dt;if(u.mgT<=0){u.mgT=.085;const g=u.men.find(m=>m.alive),dir=clDir(u.side);
      if(g){const L=380,sp=380,a=Math.atan2(u.mgY,L);bullets.push({x:g.x+dir*9,y:g.y,vx:dir*sp*Math.cos(a),vy:sp*Math.sin(a)+(R()-.5)*10,left:L,side:u.side,src:u.key,kind:'mg',pk:.3,sup:true});
        parts.push({k:'flash',x:g.x+dir*10,y:g.y-3,life:0,max:.04});if(R()<.5)AU.burst(.06,1900,'bandpass',1,.13,AU.pan(u.x));if(R()<.25)addSmoke(g.x+dir*9,g.y-3,1,false);G.stats[u.side].shots++;u.firedT=3;}}}};
BEH.at=function(u,dt,I){const a=coneFire(u,I,dt);if(!(I.A&&I.bat))artVert(u,I.y,dt);
  if(a!==null){if(u.reload>0||u.setup>0){if(I.hum)AU.bad();}
    else if(useShot(u)){const[cx,cy]=coneVec(u,a),bx=u.x+cx*14;u.reload=2.3;u.firedT=3;u.recoil=1;
      const b={x:bx,y:u.y+cy*14,vx:cx*520,vy:cy*520,left:600,side:u.side,src:u.key,kind:'shell',pk:.6,boom:7,bk:.6};b.ap=bb=>{const tr=600-bb.left;return tr<300?.75:tr<550?.45:.25;};bullets.push(b);
      parts.push({k:'flash',x:bx,y:u.y-6,life:0,max:.08,big:1});addSmoke(bx,u.y-6,2,false);AU.cannon(u.x);G.shake=Math.max(G.shake,1.2);G.stats[u.side].shots++;}}
  clCrew(u,false,dt);};
function nearBroken(x,y){if(!MAP.broken)return false;const tx=Math.floor(x/TS),ty=Math.floor(y/TS);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(MAP.broken.has((ty+dy)*GW+tx+dx))return true;return false;}

/* --- wybuchy, pancerz, dym --- */
function blast(x,y,Rr,k,side,src){for(let i=0;i<10;i++)parts.push({k:'dirt',x,y,z:0,vx:(R()-.5)*50,vy:(R()-.5)*30,vz:50+R()*60,life:0,max:.8,c:R()<.5?'#5a4630':'#7a6446'});
  parts.push({k:'flash',x,y:y-4,life:0,max:.1,big:1});addSmoke(x,y-3,2,false);const t=tAt(x,y);if(t!==T.WATER&&t!==T.BRIDGE&&t!==T.FORD&&Rr>=10)decalCrater(x,y);AU.impact(x);
  for(const p of G.posts||[])if(!p.dead&&dist(x,y,p.x,p.y)<Rr+10)postHit(p,src==='rif'?.5:1,side);
  for(const e of units){if(e.dead||e.gone||e.type==='tank'||e.post||dist(x,y,e.x,e.y)>Rr+50)continue;
    const kp=e.prone&&!HEAVY.has(src)?(e.dug?.4:.6):1;
    for(const m of e.men){if(!m.alive)continue;const d=dist(x,y,m.x,m.y);if(d<Rr&&R()<k*kp*(1-.4*d/Rr)*eff(src,e.key)){killMan(e,m,'ball');if(side>=0&&e.side!==side)G.stats[side].hits++;}}}
  for(let dy=-Rr;dy<=Rr;dy+=TS)for(let dx=-Rr;dx<=Rr;dx+=TS)if(tAt(x+dx,y+dy)===T.WIRE)crushWire(x+dx,y+dy);
  areaObstacleHit(x,y,Math.max(Rr,10),8,src);}
function grenImpact(p){blast(p.tx,p.ty,14,.75,p.side,p.src);
  for(const e of units){if(e.type!=='tank'||e.dead||e.gone)continue;if(dist(p.tx,p.ty,e.x,e.y)<16)grenTank(e,p.side);}}
// czołg od granatów: 1 trafienie – zwalnia, 2 – zerwana gąsienica (unieruchomiony), 3 – zniszczony
function grenTank(e,side){e.gh=(e.gh||0)+1;
  if(e.gh===1){e.slow=true;msg(e.side,`${unitName(e)}: granat uszkodził czołg – zwalnia!`);}
  else if(e.gh===2){e.track=true;msg(e.side,`${unitName(e)}: gąsienica zerwana – czołg unieruchomiony!`);}
  else{const m=e.men.find(q=>q.alive);if(m){killMan(e,m,'boom');if(side>=0)G.stats[side].hits++;}}}
function smokeCloud(x,y){for(let i=0;i<24;i++)parts.push({k:'smoke',x:x+(R()-.5)*40,y:y+(R()-.5)*30,vx:G.wind.x*4+(R()-.5)*3,vy:G.wind.y*4+(R()-.5)*3,r:6+R()*5,g:6,life:0,max:9+R()*3,a:.7});
  const tx=Math.floor(x/TS),ty=Math.floor(y/TS);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=tx+dx,Y=ty+dy;if(X>=0&&Y>=0&&X<GW&&Y<GH)smokeG[Y*GW+X]+=7;}AU.burst(.5,400,'lowpass',1,.3,AU.pan(x));}
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


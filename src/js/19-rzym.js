/* ================= RZYM: zachowania ================= */
BEH.leg=function(u,dt,I){const{x,y}=I,sp={line:22,testudo:11,wedge:28,orbis:0}[u.rf]*(u.formT>0?.5:1)*(G.weather==='rain'?.9:1);
  if(u.rf==='line'){const horiz=Math.abs(x)>.3&&Math.abs(x)>=Math.abs(y),vert=Math.abs(y)>.3&&Math.abs(y)>Math.abs(x);
    if(horiz){u.s=Math.min(1,u.s+dt*.7);u.colDir=Math.sign(x);}else if(vert)u.s=Math.max(0,u.s-dt*1.1);
    clMoveMen(u,x*sp,y*sp,dt,false,vert?2.2:horiz?1.2:0,I.hum);}
  else{u.s=Math.max(0,u.s-dt*2);clMoveMen(u,x*sp,y*sp,dt,false,2.6,I.hum);}
  if(I.Ap){const o=['line','testudo','wedge','orbis'];u.rf=o[(o.indexOf(u.rf)+1)%4];u.formT=.8;AU.ui();}
  if(I.Rp&&I.bat){if(u.cd2>0||u.rf==='testudo'||u.rf==='orbis'){if(I.hum)AU.bad();}
    else{const sv=u.reload;u.reload=0;clVolley(u,{reload:.01,range:95,spd:170,pk:.7,kind:'pilum',noPowder:true});u.reload=sv;u.cd2=5;}}};
BEH.arc=function(u,dt,I){const{x,y,A}=I;if(!I.inp){u.aHold=0;u.aiming=false;}
  if(!u.aiming){const sp=24*(G.weather==='rain'?.9:1),horiz=Math.abs(x)>.3&&Math.abs(x)>=Math.abs(y),vert=Math.abs(y)>.3&&Math.abs(y)>Math.abs(x);
    if(horiz){u.s=Math.min(1,u.s+dt*.7);u.colDir=Math.sign(x);}else if(vert)u.s=Math.max(0,u.s-dt*1.1);
    clMoveMen(u,x*sp,y*sp,dt,false,vert?2.2:horiz?1.2:0,I.hum);}
  else clMoveMen(u,0,0,dt,false,0,I.hum);
  if(!I.bat)return;
  // krótkie A = strzał na wprost (zatrzymują go przeszkody), trzymane A = łukiem ponad przeszkodami
  if(A&&u.reload<=0){u.aHold=(u.aHold||0)+dt;if(u.aHold>.22){if(!u.aiming){u.aiming=true;u.aimDir=1;u.aimR=u.aimMin;}u.aimR+=u.aimDir*260*dt;if(u.aimR>u.aimMax){u.aimR=u.aimMax;u.aimDir=-1;}if(u.aimR<u.aimMin){u.aimR=u.aimMin;u.aimDir=1;}}}
  else if(u.aiming){u.aiming=false;u.aHold=0;arrowVolley(u);}
  else if(u.aHold>0){u.aHold=0;const sl=u.ammoKind==='sling';clVolley(u,{reload:sl?2:2.4,range:sl?220:260,spd:sl?260:300,pk:sl?.5:.6,kind:sl?'slingf':'arrowf',noPowder:true});u.reload=u.reloadMax*.8;}
  else if(I.Ap&&I.hum)AU.bad();};
function arrowVolley(u){const dir=clDir(u.side),kind=u.ammoKind||'arrow';u.reload=u.reloadMax||3;u.firedT=3;let k=0;
  for(const m of u.men){if(!m.alive)continue;k++;const rr=u.aimR*(1+(R()-.5)*.1);
    projs.push({kind,x:m.x,y:m.y,sx:m.x+dir*4,sy:m.y,tx:m.x+dir*rr,ty:m.y+(R()-.5)*12,t:0,T:.45+rr/520+R()*.1,H:rr*(kind==='sling'?.12:.28),h:0,a:u.fa,bounce:0,side:u.side,src:u.key,hit:new Set(),low:false});}
  G.stats[u.side].shots+=k;AU.burst(.25,2600,'highpass',1,.16,AU.pan(u.x));}
function arrowImpact(p){let hit=false;
  for(const e of units){if(e.dead||e.gone||e.type==='tank'||dist(p.tx,p.ty,e.x,e.y)>60)continue;
    for(const m of e.men){if(!m.alive||dist(p.tx,p.ty,m.x,m.y)>(e.type==='ele'?10:5))continue;hit=true;
      let pr=(p.kind==='sling'?.5:.6)*Math.min(1,TCOVER[tAt(m.x,m.y)]);if(e.key==='leg')pr*=e.rf==='testudo'?.06:e.rf==='orbis'?.4:1;
      pr*=eff(p.src,e.key);if(R()<pr){killMan(e,m,'shot');if(e.side!==p.side)G.stats[p.side].hits++;}break;}if(hit)break;}
  if(!hit&&G.tctx&&tAt(p.tx,p.ty)!==T.WATER){const g=G.tctx;g.fillStyle='#5a4028';g.fillRect(Math.round(p.tx),Math.round(p.ty)-3,1,3);g.fillStyle='#e8e2d0';g.fillRect(Math.round(p.tx),Math.round(p.ty)-4,1,1);}}
function artVert(u,y,dt){if(Math.abs(y)>.2){const ny=clamp(u.y+y*CLS.art.spd*Math.max(.3,passF('art',u.x,u.y))*dt,32,H-10);if(passF('art',u.x,ny)>0)u.y=ny;u.setup=.3;}}
BEH.bal=function(u,dt,I){artVert(u,I.y,dt);
  if(I.Ap&&I.bat){if(u.reload>0||u.setup>0){if(I.hum)AU.bad();}
    else if(useShot(u)){const dir=clDir(u.side);u.reload=3*(hAt(u.x,u.y)>0?.8:1);u.firedT=3;u.recoil=1;u.shotT=.3;
      bullets.push({x:u.x+dir*12,y:u.y,vx:dir*430,vy:0,left:artMaxRange(u),side:u.side,src:u.key,kind:'bolt',pk:.85,pierce:3});
      AU.burst(.3,900,'bandpass',2,.35,AU.pan(u.x));AU.tone(150,.15,'square',.07);G.stats[u.side].shots++;}}
  clCrew(u,false,dt);};


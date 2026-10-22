/* ================= GRAFIKA: POLE BITWY ================= */
let rainDrops=[],fogCan=null,cloudCan=null,vignette=null;
function initFx(){rainDrops=[];for(let i=0;i<180;i++)rainDrops.push({x:R()*W,y:R()*H,l:4+R()*5,v:260+R()*120});
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  fogCan=mk(240,135);{const g=fogCan.getContext('2d'),nz=makeNoise(99),im=g.createImageData(240,135);for(let y=0;y<135;y++)for(let x=0;x<240;x++){const v=nz(x/22,y/22)*.7+nz(x/7,y/7)*.3;const i=(y*240+x)*4;im.data[i]=205;im.data[i+1]=212;im.data[i+2]=208;im.data[i+3]=clamp((v-.25)*230,0,200);}g.putImageData(im,0,0);}
  cloudCan=mk(240,135);{const g=cloudCan.getContext('2d'),nz=makeNoise(77),im=g.createImageData(240,135);for(let y=0;y<135;y++)for(let x=0;x<240;x++){const v=nz(x/30,y/30);const i=(y*240+x)*4;im.data[i+3]=v>.62?clamp((v-.62)*500,0,60):0;}g.putImageData(im,0,0);}
  vignette=mk(W,H);{const g=vignette.getContext('2d'),gr=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=gr;g.fillRect(0,0,W,H);}}
function drawWater(){const t=G.t;ctx.fillStyle='rgba(210,232,240,.4)';for(const w of MAP.water){const ox=(t*7+w.p)%12;ctx.fillRect(Math.floor(w.x+ox),w.y+w.q,2,1);ctx.fillRect(Math.floor(w.x+(ox+6)%12),w.y+(w.q+5)%11,1,1);}}
function drawClouds(){if(!cloudCan||G.weather==='fog')return;const ox=(G.t*G.wind.x*6)%W,oy=(G.t*G.wind.y*6)%H;ctx.imageSmoothingEnabled=true;ctx.globalAlpha=G.weather==='rain'?1:.8;
  for(const dx of[-W,0,W])for(const dy of[-H,0,H])ctx.drawImage(cloudCan,ox+dx,oy+dy,W,H);ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;}
function objectiveGround(){const ox=OBJ.x,oy=OBJ.y,own=G.objOwner,col=own>=0?SIDE[own].ui:'#e8e2d0';
  ctx.save();ctx.strokeStyle=col;ctx.globalAlpha=.55;ctx.setLineDash([3,4]);ctx.lineDashOffset=-G.t*6;ctx.beginPath();ctx.arc(ox,oy,OBJ.r,0,TAU);ctx.stroke();ctx.setLineDash([]);
  if(Math.abs(G.objProg)>.01&&Math.abs(G.objProg)<1){ctx.globalAlpha=.9;ctx.lineWidth=3;ctx.strokeStyle=SIDE[G.objProg<0?0:1].ui;ctx.beginPath();ctx.arc(ox,oy,OBJ.r,-Math.PI/2,-Math.PI/2+TAU*Math.abs(G.objProg));ctx.stroke();}
  ctx.restore();}
function objectiveFlag(){const[ox,oy]=P(OBJ.x,OBJ.y),own=G.objOwner;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(ox-1,oy,6,2);ctx.fillStyle='#3b2a1a';ctx.fillRect(ox,oy-30,2,30);ctx.fillStyle='#c9a24a';ctx.fillRect(ox-1,oy-32,4,2);
  const fc=own>=0?SIDE[own].flag:['#e8e2d0','#cfc8b4'];for(let i=0;i<12;i++){const wy=Math.round(Math.sin(G.t*5+i*.7)*1.5);ctx.fillStyle=fc[0];ctx.fillRect(ox+2+i,oy-29+wy,1,4);ctx.fillStyle=fc[1];ctx.fillRect(ox+2+i,oy-25+wy,1,3);}}
function overlaysFor(p){const show=G.state==='deploy'||input.ctl[p].b.lt;if(!show)return;ctx.save();ctx.setLineDash([2,4]);ctx.lineWidth=1;
  for(const u of sideUnits(p)){ctx.strokeStyle=SIDE[p].ui;ctx.globalAlpha=.35;
    if(u.type==='inf'){const rr=SPEC.inf.range*(1+.15*hAt(u.x,u.y)),cone=u.form==='sq'?Math.PI:.6;ctx.beginPath();ctx.moveTo(u.x,u.y);ctx.arc(u.x,u.y,rr,u.fa-cone,u.fa+cone);ctx.closePath();ctx.stroke();}
    else if(u.type==='art'){ctx.beginPath();ctx.arc(u.x,u.y,artMaxRange(u),0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(u.x,u.y,SPEC.art.min,0,TAU);ctx.stroke();}
    ctx.globalAlpha=.9;bar(Math.round(u.x-8),Math.round(u.y+5),16,2,u.morale/100,u.morale<40?'#e05a4a':'#e8d9a0');}
  ctx.restore();}
function selectionGround(p){const u=selUnit(p);if(!u)return;const S=SIDE[p],r=SPEC[u.type].r+2,x=Math.round(u.x),y=Math.round(u.y-2),a=.6+.4*Math.sin(G.t*6);
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle=S.ui;const L=5,ry=Math.round(r*.8);
  for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const cx=x+sx*r,cy=y+sy*ry;ctx.fillRect(sx<0?cx:cx-L+1,cy,L,1);ctx.fillRect(cx,sy<0?cy:cy-L+1,1,L);}ctx.restore();
  if(u.type==='art'&&G.state!=='deploy'){ctx.save();ctx.strokeStyle=S.ui;
    if(u.ammo==='ball'){const rr=u.aiming?u.aimR:artMaxRange(u);ctx.globalAlpha=u.aiming?.95:.3;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(u.x+Math.cos(u.fa)*14,u.y+Math.sin(u.fa)*14);ctx.lineTo(u.x+Math.cos(u.fa)*rr,u.y+Math.sin(u.fa)*rr);ctx.stroke();ctx.setLineDash([]);
      if(u.aiming){const tx=u.x+Math.cos(u.fa)*rr,ty=u.y+Math.sin(u.fa)*rr;ctx.beginPath();ctx.arc(tx,ty,9,0,TAU);ctx.stroke();ctx.fillStyle=S.ui;ctx.fillRect(Math.round(tx)-4,Math.round(ty),9,1);ctx.fillRect(Math.round(tx),Math.round(ty)-3,1,7);}}
    else{ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(u.x,u.y);ctx.arc(u.x,u.y,170,u.fa-.33,u.fa+.33);ctx.closePath();ctx.stroke();}ctx.restore();}
  if(u.type==='inf'&&G.state==='battle'){const rr=SPEC.inf.range*(1+.15*hAt(u.x,u.y));ctx.save();ctx.strokeStyle=S.ui;ctx.globalAlpha=.25;ctx.setLineDash([1,4]);ctx.beginPath();ctx.arc(u.x,u.y,rr,u.fa-.6,u.fa+.6);ctx.stroke();ctx.restore();}}
function selectionLabel(p){const u=selUnit(p);if(!u)return;const[x,y]=P(u.x,u.y);txt(unitName(u),x,y-SPEC[u.type].r-(u.type==='cav'?14:9),14,SIDE[p].ui,'center');}
// wspólne rysowanie żołnierzy (w obu trybach) – pozycje rzutowane
function drawMenList(list){const items=[];
  for(const p of G.posts||[])items.push({y:p.y+.4,post:p});
  for(const u of list){if(u.gone||u.post)continue;if(u.type==='tank'||u.type==='ele'){if(!u.dead&&u.n>0)items.push({y:u.y+.5,u,tank:true});continue;}
    let fi=-1,ai=0;u.men.forEach((m,i)=>{if(!m.alive||m.wrap)return;if(fi<0&&u.type!=='art'&&G.era!=='ww2')fi=i;items.push({y:m.y,u,m,flag:i===fi,idx:ai++});});
    if(u.type==='art'&&u.n>0&&!u.dead)items.push({y:u.y+.5,u,gun:true});}
  for(const d of G.dying)items.push({y:d.y-.2,dying:d});for(const h of G.loose)items.push({y:h.y,loose:h});
  items.sort((a,b)=>a.y-b.y);
  for(const it of items){if(it.post){drawPost(it.post);continue;}if(it.dying){DRAWU=null;drawDying(it.dying);continue;}if(it.tank){const[tx,ty]=P(it.u.x,it.u.y);if(it.u.type==='ele')drawElephant(it.u,tx,ty);else drawTank(it.u,tx,ty);continue;}if(it.loose){const h=it.loose,[hx,hy]=P(h.x,h.y);drawRider(hx,hy,0,h.right,h.anim,true,false,false,h.hc,false,false,-1,true);continue;}
    const u=it.u;if(it.gun){const[gx,gy]=P(u.x,u.y);if(GUNDRAW[u.key])GUNDRAW[u.key](u,gx,gy);else drawGun(u,gx,gy);continue;}DRAWU=u;DRAWM=it.m;DRAWI=it.idx;const m=it.m,flash=u.hitFlash>.17,[sx,sy]=P(m.x,m.y);
    let right=Math.cos(u.fa)>=0;if(u.type==='inf'&&u.form==='sq')right=m.x>=u.x;
    if(u.type==='cav')drawRider(sx,sy,u.side,right,m.anim,m.mv>.2,u.charging,it.flag,m.hc,flash,u.lance,u.slashT>0?1-u.slashT/.4:-1,false,u.rearT>0);
    else drawSoldier(sx,sy,u.side,right,m.anim,m.mv>.2,u.type==='inf'&&u.firedT>2.3,it.flag,u.type==='art',flash);}DRAWU=null;}
function drawUnitsTac(){drawMenList(units);
  for(const u of units){if(u.dead||u.gone)continue;const[x,y]=P(u.x,u.y);
    if(u.rout&&Math.floor(G.t*4)%2===0)txt('!',x,y-24,20,'#ff6a55','center');
    if(u.charging&&u.moving&&R()<.5)dustAt(u.x+(R()-.5)*20,u.y,1,'140,120,85');}}
function drawProjs(){for(const p of projs){const[x,y]=P(p.x,p.y);if(p.kind&&PROJDRAW[p.kind]){PROJDRAW[p.kind](p,x,y);continue;}ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x)-1,Math.round(y),3,1);ctx.fillStyle='#161616';ctx.fillRect(Math.round(x)-1,Math.round(y-p.h)-1,3,3);ctx.fillStyle='#6a6a6a';ctx.fillRect(Math.round(x)-1,Math.round(y-p.h)-1,1,1);}}
function drawParts(){for(const p of parts){const k=p.life/p.max,[x,y]=P(p.x,p.y);
  if(p.k==='smoke'){ctx.globalAlpha=p.a*(1-k)*(k<.1?k*10:1);pdisc(ctx,x,y,Math.round(p.r),'#e6e3da');ctx.globalAlpha=p.a*(1-k)*.5;pdisc(ctx,x+1,y+1,Math.max(1,Math.round(p.r)-1),'#b9b6ac');}
  else if(p.k==='flash'){ctx.globalAlpha=1-k;pdisc(ctx,x,y,p.big?4:1,'#fff4c0');if(p.big)pdisc(ctx,x,y,2,'#ffffff');}
  else if(p.k==='dust'){ctx.globalAlpha=(1-k)*.8;ctx.fillStyle=`rgba(${p.c},1)`;ctx.fillRect(Math.round(x),Math.round(y),2,2);}
  else if(p.k==='spark'){ctx.globalAlpha=1-k;ctx.fillStyle='#fff6d0';ctx.fillRect(Math.round(x),Math.round(y),1,1);}
  else if(p.k==='dirt'){ctx.globalAlpha=1-k*k;ctx.fillStyle=p.c;ctx.fillRect(Math.round(x),Math.round(y-p.z),2,2);}
  else if(p.k==='pellet'){ctx.globalAlpha=(1-k)*.8;ctx.strokeStyle='#fff0b0';const q=Math.min(1,k*2.2);const[ax,ay]=P(lerp(p.x,p.x2,q*.6),lerp(p.y,p.y2,q*.6)),[bx,by]=P(lerp(p.x,p.x2,q),lerp(p.y,p.y2,q));ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();}
  else if(p.k==='ring'){ctx.globalAlpha=1-k;ctx.strokeStyle=p.c;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,160*k,100*k,0,0,TAU);ctx.stroke();ctx.lineWidth=1;}}
  ctx.globalAlpha=1;}
function drawWeatherScreen(){
  if(G.weather==='rain'){ctx.fillStyle='rgba(30,40,60,.18)';ctx.fillRect(0,0,W,H);ctx.strokeStyle=G.sleet?'rgba(236,240,246,.6)':'rgba(190,205,225,.45)';ctx.beginPath();
    for(const d of rainDrops){d.y+=d.v/(G.sleet?110:60);d.x+=G.wind.x*2;if(d.y>H){d.y=-10;d.x=R()*W;}if(d.x>W)d.x-=W;if(d.x<0)d.x+=W;ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+G.wind.x*2,d.y+d.l);}ctx.stroke();}
  if(G.weather==='fog'&&fogCan){ctx.fillStyle='rgba(200,206,204,.16)';ctx.fillRect(0,0,W,H);const ox=(G.t*G.wind.x*10)%W;ctx.imageSmoothingEnabled=true;ctx.globalAlpha=.85;for(const dx of[-W,0,W])ctx.drawImage(fogCan,ox+dx,0,W,H);ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;}
  if(vignette)ctx.drawImage(vignette,0,0);}
function drawField(){
  const classic=G.rules==='classic';
  // 1) warstwa ziemi w układzie świata
  ctx=GCTX;ctx.drawImage(G.terr,0,0);drawWater();drawClouds();
  if(classic)clGround();
  else{if(G.state==='deploy'){ctx.fillStyle='rgba(120,164,255,.08)';ctx.fillRect(0,0,DEPLOY+18,H);ctx.fillStyle='rgba(230,180,94,.08)';ctx.fillRect(W-DEPLOY-18,0,DEPLOY+18,H);
      ctx.fillStyle='rgba(255,255,255,.25)';for(let y=30;y<H;y+=8){ctx.fillRect(DEPLOY+18,y,1,4);ctx.fillRect(W-DEPLOY-18,y,1,4);}}
    objectiveGround();for(let p=0;p<2;p++)if(humanOf(p)>=0){overlaysFor(p);selectionGround(p);}}
  ctx=SCR;
  // 2) rzut na ekran i obiekty stojące
  ctx.save();if(G.shake>0)ctx.translate(Math.round((R()-.5)*G.shake*2),Math.round((R()-.5)*G.shake*2));
  blitGround();
  if(classic){drawMenList(units);clSprites();}else{objectiveFlag();drawUnitsTac();}
  drawProjs();drawParts();
  if(classic)clLabels();else for(let p=0;p<2;p++)if(humanOf(p)>=0)selectionLabel(p);
  ctx.restore();drawWeatherScreen();
}


/* ================= GRAFIKA: POSTACIE ================= */
const FONT_T="'BiS Mono','Courier New','Segoe UI',monospace",FONT_D="'BiS Display','BiS Mono',Georgia,'Segoe UI',serif";
function txt(s,x,y,size,col,align='left',disp=false,shadow=true){ctx.font=`${size}px ${disp?FONT_D:FONT_T}`;ctx.textAlign=align;ctx.textBaseline='alphabetic';
  if(shadow){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillText(s,x+1,y+1);}ctx.fillStyle=col;ctx.fillText(s,x,y);}
function bar(x,y,w,h,f,col,bg='rgba(0,0,0,.55)'){ctx.fillStyle=bg;ctx.fillRect(x,y,w,h);ctx.fillStyle=col;ctx.fillRect(x,y,Math.round(w*clamp(f,0,1)),h);}
function spr(x,y,right){return(dx,dy,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(right?x+dx:x-dx-w+1,y+dy,w,h);};}
function flagAt(r,S,x,top){r(-3,top,1,Math.abs(top)-2,'#3b2a1a');const t=G.t*7+x*.13;for(let i=0;i<6;i++){const wy=Math.round(Math.sin(t+i*.9));r(-4-i,top+wy,1,2,S.flag[0]);r(-4-i,top+2+wy,1,2,S.flag[1]);}}
function drawSoldier(x,y,s,right,anim,moving,aim,flag,crew,flash){
  x=Math.round(x);y=Math.round(y);if(G.era!=='acw'&&eraSoldier(x,y,s,right,anim,moving,aim,flag,crew,flash))return;const S=SIDE[s],r=spr(x,y,right);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x-3,y-1,6,2);
  const f=moving?(Math.floor(anim)%2):-1,P=S.pants,B='#221a12';
  if(f===0){r(-2,-4,1,3,P);r(1,-4,1,3,P);r(-2,-1,1,1,B);r(1,-1,1,1,B);}
  else if(f===1){r(-1,-4,1,3,P);r(0,-4,1,3,P);r(-1,-1,1,1,B);r(0,-1,1,1,B);}
  else{r(-2,-4,1,3,P);r(0,-4,1,3,P);r(-2,-1,1,1,B);r(0,-1,1,1,B);}
  r(-2,-8,4,4,flash?'#ffffff':S.coat);r(-2,-8,1,4,flash?'#ffffff':S.coatD);r(-2,-5,4,1,'#1b1712');r(-1,-8,1,1,'#d9d0b4');r(0,-7,1,1,'#d9d0b4');
  r(-1,-10,3,2,'#d7ae86');r(-2,-11,4,1,S.hat);r(-1,-12,3,1,S.hat);r(2,-11,1,1,'#111');
  if(crew)r(2,-10,1,7,'#6b4a2a');
  else if(aim){r(1,-8,6,1,'#5a3b1e');r(7,-8,1,1,'#b8bec4');}
  else{r(2,-14,1,9,'#4e3520');r(2,-15,1,1,'#b8bec4');}
  if(flag)flagAt(r,S,x,-21);
}
function drawRider(x,y,s,right,anim,moving,charging,flag,hc,flash,lance,slash=-1,noRider=false,rear=false){
  x=Math.round(x);y=Math.round(y);const S=SIDE[s],r0=spr(x,y,right),Hc=HORSE[hc],Hd=HORSED[hc];
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x-7,y-1,14,2);
  if(rear){// koń staje dęba: zad na ziemi, przód w górze, przednie nogi wierzgają
    const k=Math.floor(G.t*10)%2;r0(-5,-4,1,3,Hd);r0(-3,-4,1,3,Hd);r0(-5,-1,1,1,'#16110c');r0(-3,-1,1,1,'#16110c');
    r0(-6,-8,6,4,Hc);r0(-1,-10,4,4,Hc);r0(2,-12,3,4,Hc);r0(-6,-5,6,1,Hd);
    r0(3,-16,2,4,Hc);r0(4,-18,3,2,Hc);r0(6,-17,1,1,Hd);r0(4,-19,1,1,Hc);r0(2,-15,1,3,Hd);
    r0(4,-10+k,1,3,Hd);r0(6,-11-k,1,3,Hd);r0(-7,-8,1,1,Hd);r0(-8,-7,1,4,Hd);}
  else{const f=moving?Math.floor(anim*1.4)%4:-1,sh=f<0?[0,0,0,0]:[[1,-1,1,-1],[0,0,0,0],[-1,1,-1,1],[0,0,0,0]][f];
    [-5,-3,2,4].forEach((lx,i)=>{r0(lx+sh[i],-4,1,3,Hd);r0(lx+sh[i],-1,1,1,'#16110c');});
    r0(-6,-8,11,4,Hc);r0(-6,-5,11,1,Hd);r0(-7,-8,1,1,Hd);r0(-8,-7,1,4,Hd);
    r0(4,-11,2,4,Hc);r0(5,-12,3,2,Hc);r0(7,-11,1,1,Hd);r0(5,-13,1,1,Hc);r0(3,-11,1,3,Hd);}
  if(noRider)return;
  const ry=rear?-2:0,rx=rear?-1:0,r=(dx,dy,w,h,c)=>r0(dx+rx,dy+ry,w,h,c);
  r(-1,-9,2,2,S.pants);r(0,-7,1,2,'#1b1712');
  r(-2,-13,3,4,flash?'#ffffff':S.coat);r(-2,-13,1,4,flash?'#ffffff':S.coatD);r(-1,-15,2,2,'#d7ae86');if(G.era==='rome'){r(-2,-17,4,2,S.hat);r(-1,-18,3,1,S.crest||'#e0c060');}else{r(-2,-16,4,1,S.hat);r(-1,-17,2,1,S.hat);}
  if(lance){const Wd='#8a6a40';
    if(charging){for(let k=0;k<14;k++)r(1+k,-13+Math.floor(k/5),1,1,Wd);r(15,-10,1,1,'#e8ecef');r(3,-14,3,1,S.flag[0]);r(3,-13,3,1,S.flag[1]);}
    else{r(1,-27,1,16,Wd);r(1,-28,1,1,'#e8ecef');r(2,-27,3,1,S.flag[0]);r(2,-26,3,1,S.flag[1]);}}
  else if(slash>=0){const f=Math.min(3,Math.floor(slash*4)),C='#eef2f5';
    if(f===0)r(-1,-21,1,6,C);else if(f===1){for(let k=0;k<6;k++)r(1+k,-19+k,1,1,C);}else if(f===2)r(2,-12,8,1,C);else{for(let k=0;k<5;k++)r(2+k,-11+k,1,1,C);}}
  else if(charging||rear)r(1,-21,1,6,'#dfe3e7');else r(1,-11,1,4,'#9aa0a6');
  if(flag&&!lance)flagAt(r,S,x,-25);
}
function drawGun(u,px,py){if(px===undefined){px=u.x;py=u.y;}const c=Math.cos(u.fa),s=Math.sin(u.fa),x=px-c*u.recoil*3,y=py-s*u.recoil*3;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x-8),Math.round(y-1),16,3);
  for(let k=0;k<11;k++){ctx.fillStyle='#5a3e22';ctx.fillRect(Math.round(x-c*k),Math.round(y-2-s*k*.8),2,2);}
  const wx=-s*5,wy=c*3,far=wy<0?1:-1;
  pdisc(ctx,x+wx*far,y-3+wy*far,3,'#3b2a1a');pdisc(ctx,x+wx*far,y-3+wy*far,1,'#8a6a3a');
  for(let k=-3;k<=12;k++){ctx.fillStyle=k>=11?'#3a2c16':'#7b5f2c';ctx.fillRect(Math.round(x+c*k)-1,Math.round(y-6+s*k*.8)-1,3,3);}
  for(let k=-2;k<=10;k++){ctx.fillStyle='#b99550';ctx.fillRect(Math.round(x+c*k),Math.round(y-7+s*k*.8),1,1);}
  pdisc(ctx,x-wx*far,y-3-wy*far,3,'#3b2a1a');pdisc(ctx,x-wx*far,y-3-wy*far,1,'#8a6a3a');}

function kneel(x,y,s,right){const S=SIDE[s],r=spr(x,y,right);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x-3,y-1,7,2);
  r(-2,-2,4,2,S.pants);r(-3,-1,1,1,'#221a12');r(-2,-6,4,4,S.coat);r(-2,-6,1,4,S.coatD);r(1,-8,3,2,'#d7ae86');r(0,-9,4,1,S.hat);r(3,-3,5,1,'#4e3520');}
function drawDying(d){const k=Math.min(1,d.t/d.T);let[sx,sy]=P(d.x+d.ox,d.y);sx=Math.round(sx);sy=Math.round(sy);
  if(d.kind==='drown'){const sink=Math.round(k*(d.cav?20:14));ctx.save();ctx.beginPath();ctx.rect(sx-24,sy-44,48,44);ctx.clip();
    if(d.cav)drawRider(sx,sy+sink,d.side,d.right,d.t*8,true,false,false,d.hc,false,d.lance,-1);
    else{drawSoldier(sx,sy+sink,d.side,d.right,d.t*6,true,false,false,d.crew,false);if(k<.75){ctx.fillStyle='#d7ae86';const w=Math.floor(d.t*8)%2;ctx.fillRect(sx-3,sy+sink-13-w,1,3);ctx.fillRect(sx+3,sy+sink-12-w,1,3);}}
    ctx.restore();ctx.strokeStyle=`rgba(225,242,250,${.85*(1-k)})`;ctx.beginPath();ctx.ellipse(sx,sy,4+k*11,2+k*4,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(sx,sy,2+k*5,1+k*2,0,0,TAU);ctx.stroke();return;}
  if(!d.cav){const z=d.kind==='ball'?Math.round(Math.sin(k*Math.PI)*9):0;
    if(k<.3)drawSoldier(sx+(d.right?-1:1),sy-z,d.side,d.right,0,false,false,false,d.crew,k<.1);else if(k<.55)kneel(sx,sy-z,d.side,d.right);else lyingSoldier(ctx,sx,sy-z,d.side,!d.right,d.crew);return;}
  const dir=d.right?1:-1;
  if(!d.flee&&k<.3){drawRider(sx,sy-Math.round(k*6),d.side,d.right,0,false,false,false,d.hc,k<.1,d.lance,-1);return;}
  const q=d.flee?Math.min(1,k/.6):clamp((k-.3)/.4,0,1);
  if(!d.flee)lyingHorse(ctx,sx,sy,d.hc,d.right);
  if(q<1){const rx=sx+dir*Math.round(q*8),ry=sy-Math.round(Math.sin(q*Math.PI)*10+(1-q)*6);if(q<.6)drawSoldier(rx,ry,d.side,d.right,0,false,false,false,true,q<.15);else kneel(rx,ry,d.side,d.right);}
  else lyingSoldier(ctx,sx+dir*7,sy+2,d.side,!d.right,d.crew);}

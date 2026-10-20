/* ================= GRAFIKA EPOK ================= */
let DRAWU=null,DRAWM=null,DRAWI=0;
function eraSoldier(x,y,s,right,anim,moving,aim,flag,crew,flash){
  const u=DRAWU,S=SIDE[s],r=spr(x,y,right),skin='#d7ae86';
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x-3,y-1,6,2);
  if(G.era==='ww2'&&u&&(u.supT>0||(u.key==='mg'&&DRAWI===0)||u.type==='art')){// przygwożdżeni / obsługa – nisko
    if(u.key==='mg'&&DRAWI===0){r(-6,-2,3,2,S.pants);r(-3,-3,5,3,S.coat);r(2,-4,2,2,skin);r(1,-5,4,1,S.hat);r(4,-3,7,1,'#26282a');r(10,-3,1,1,'#26282a');r(7,-2,1,2,'#26282a');
      if(u.firing&&Math.floor(G.t*20)%2)r(11,-4,2,2,'#fff2a0');return true;}
    kneel(x,y,s,right);r(0,-10,4,1,S.hat);r(-1,-9,6,1,S.hat);return true;}
  const f=moving?(Math.floor(anim)%2):-1,P=S.pants,B='#221a12';
  if(f===0){r(-2,-4,1,3,P);r(1,-4,1,3,P);}else if(f===1){r(-1,-4,1,3,P);r(0,-4,1,3,P);}else{r(-2,-4,1,3,P);r(0,-4,1,3,P);}
  r(-2,-1,1,1,B);r(f===0?1:0,-1,1,1,B);
  if(G.era==='rome'){
    r(-2,-8,4,4,flash?'#fff':S.coat);r(-2,-8,1,4,flash?'#fff':S.coatD);r(-2,-5,4,1,'#6a4a2a');
    r(-1,-10,3,2,skin);r(-2,-12,4,2,S.hat);r(-2,-10,1,1,S.hat);r(-1,-13,3,1,S.crest);
    if(crew)return true;
    if(u&&u.key==='arc'){r(-3,-10,1,5,'#6b4a2a');if(aim||u.aiming){r(2,-11,1,7,'#7a5a30');r(3,-12,1,1,'#7a5a30');r(3,-4,1,1,'#7a5a30');r(0,-8,2,1,skin);}else{r(2,-12,1,8,'#7a5a30');}return true;}
    if(u&&u.key==='leg'&&(u.rf==='testudo'||u.rf==='orbis')){r(-3,-14,7,2,S.shield);r(0,-14,1,1,'#e0c060');}
    else{r(-3,-17,1,13,'#6a4a2a');r(-3,-18,1,2,'#c8ccd0');}
    r(1,-10,3,8,S.shield);r(2,-7,1,2,'#e0c060');r(1,-10,3,1,'#e0c060');
    if(flag){r(-4,-24,1,20,'#6a4a2a');r(-7,-23,6,5,S.flag[0]);r(-7,-24,6,1,S.flag[1]);r(-5,-26,2,2,'#e0c060');}
    return true;}
  // 1939
  r(-2,-8,4,4,flash?'#fff':S.coat);r(-2,-8,1,4,flash?'#fff':S.coatD);r(-2,-5,4,1,'#2a2418');
  r(-1,-10,3,2,skin);
  if(S.helm==='de'){r(-2,-12,5,2,S.hat);r(-3,-11,1,1,S.hat);r(3,-11,1,1,S.hat);}else{r(-2,-12,4,2,S.hat);r(-1,-13,3,1,S.hat);r(-3,-11,1,1,S.hat);r(2,-11,1,1,S.hat);}
  if(crew)return true;
  if(aim){r(1,-8,6,1,'#3e2a18');r(7,-8,1,1,'#8a9096');}else{r(2,-13,1,8,'#3e2a18');r(2,-14,1,1,'#8a9096');}
  return true;}
function drawBallista(u,x,y){const d=clDir(u.side),r=spr(Math.round(x),Math.round(y),d>0),loaded=u.reload<=0;
  r(-8,-1,16,2,'rgba(0,0,0,.3)');r(-6,-4,12,3,'#6a4a2a');r(-1,-9,2,5,'#5a3e22');r(-6,-10,14,2,'#7a5a36');
  r(4,-14,1,4,'#4e3520');r(4,-8,1,4,'#4e3520');r(3,-15,2,1,'#4e3520');r(3,-4,2,1,'#4e3520');
  if(loaded){r(-4,-11,10,1,'#3a2a18');r(6,-11,2,1,'#c8ccd0');r(-4,-14,1,3,'#d8d0b4');r(-4,-8,1,3,'#d8d0b4');}else{r(3,-13,1,6,'#d8d0b4');}}
function drawOnager(u,x,y){const d=clDir(u.side),r=spr(Math.round(x),Math.round(y),d>0),back=u.reload<=0||u.aiming;
  r(-10,-1,20,2,'rgba(0,0,0,.3)');r(-9,-4,18,3,'#6a4a2a');r(-9,-5,18,1,'#8a6a40');r(1,-11,2,7,'#5a3e22');r(0,-12,4,1,'#7a5a36');
  if(back){for(let k=0;k<10;k++)r(-k,-5-Math.round(k*.8),2,1,'#4e3520');r(-10,-14,3,2,'#6a6a62');}else{for(let k=0;k<9;k++)r(Math.round(k*.3),-5-k,2,1,'#4e3520');r(2,-16,2,2,'#4e3520');}}
function drawATGun(u,x,y){const d=clDir(u.side),rc=Math.round(u.recoil*3),r=spr(Math.round(x)-d*rc,Math.round(y),d>0),S=SIDE[u.side];
  r(-10,-1,20,2,'rgba(0,0,0,.3)');r(-10,-3,8,1,'#3a3a36');r(-10,-2,8,1,'#3a3a36');pdisc(ctx,x-d*rc,y-3,3,'#2a2a26');
  r(-2,-10,3,7,S.veh);r(-2,-10,3,1,'#8a8a80');r(0,-7,14,2,'#34363a');r(14,-7,1,2,'#1e1e1e');}
function drawMortar(u,x,y){const d=clDir(u.side),r=spr(Math.round(x),Math.round(y),d>0);
  r(-4,-1,8,2,'rgba(0,0,0,.3)');r(-3,-2,6,1,'#3a3a36');for(let k=0;k<8;k++)r(Math.round(k*.45),-3-k,2,1,'#34363a');r(3,-12,2,1,'#1e1e1e');r(1,-5,1,3,'#3a3a36');}
function drawTank(u,x,y){x=Math.round(x);y=Math.round(y);const d=clDir(u.side),rc=Math.round(u.recoil*2),S=SIDE[u.side],r=spr(x-d*rc,y,d>0),col=u.hitFlash>.15?'#ffffff':S.veh;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-14,y-1,28,3);
  r(-13,-5,26,5,'#24241f');const ph=Math.floor(u.anim||0)%3;for(let k=-12;k<13;k+=3)r(k+ph-1,-5,1,5,'#46463e');for(let k=-10;k<11;k+=5)r(k,-3,2,2,'#6a6a60');
  r(-12,-10,24,5,col);r(-12,-10,24,1,'#9a9a88');r(-12,-6,24,1,'rgba(0,0,0,.25)');
  r(-5,-15,11,5,col);r(-4,-16,9,1,'#9a9a88');r(6,-13,12,2,'#2e2e2a');r(18,-13,1,2,'#141414');
  if(S.helm==='de'){r(-9,-9,1,3,'#f0f0f0');r(-10,-8,3,1,'#f0f0f0');}else{r(-10,-9,2,1,'#ffffff');r(-10,-8,2,1,'#d4213d');r(-8,-9,2,1,'#d4213d');r(-8,-8,2,1,'#ffffff');}
  if(u.track){r(-13,-5,6,5,'#6a3a20');if(R()<.2)parts.push({k:'smoke',x:u.x-d*10,y:u.y-4,vx:0,vy:-6,r:2,g:4,life:0,max:2,a:.4});}}
const GUNDRAW={bal:drawBallista,ona:drawOnager,at:drawATGun,mor:drawMortar};
const PROJDRAW={
  arrow(p,x,y){const k=Math.min(1,p.t/p.T),vy=Math.cos(Math.PI*k)*p.H*Math.PI/p.T,vx=(p.tx-p.sx)/p.T,a=Math.atan2(-vy*.5,vx);ctx.strokeStyle='#3a2a18';ctx.beginPath();ctx.moveTo(x-Math.cos(a)*3,y-p.h-Math.sin(a)*3);ctx.lineTo(x+Math.cos(a)*2,y-p.h+Math.sin(a)*2);ctx.stroke();},
  gren(p,x,y){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x),Math.round(y),2,1);ctx.fillStyle='#2e3024';ctx.fillRect(Math.round(x),Math.round(y-p.h)-1,2,2);},
  stone(p,x,y){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x)-2,Math.round(y),5,2);pdisc(ctx,x,y-p.h,2,'#7a766c');ctx.fillStyle='#a8a296';ctx.fillRect(Math.round(x)-1,Math.round(y-p.h)-1,1,1);},
  mshell(p,x,y){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x),Math.round(y),2,1);ctx.fillStyle='#1a1a18';ctx.fillRect(Math.round(x),Math.round(y-p.h)-1,2,3);}};
function eraChip(type,x,y,col){ctx.fillStyle=col;
  switch(type){
    case'leg':ctx.fillRect(x+1,y,6,9);ctx.fillStyle='#e0c060';ctx.fillRect(x+3,y+4,2,1);return true;
    case'arc':for(let k=0;k<9;k++)ctx.fillRect(x+2+Math.round(Math.sin(k/8*Math.PI)*3),y+k,1,1);ctx.fillRect(x+2,y,1,9);ctx.fillRect(x,y+4,7,1);return true;
    case'eq':return false;
    case'bal':ctx.fillRect(x,y+5,9,2);ctx.fillRect(x+6,y+1,1,9);ctx.fillRect(x,y+3,9,1);return true;
    case'ona':ctx.fillRect(x,y+7,10,2);for(let k=0;k<7;k++)ctx.fillRect(x+4-k*.4,y+6-k,2,1);ctx.fillRect(x,y,3,2);return true;
    case'rif':return false;
    case'mg':ctx.fillRect(x,y+4,10,2);ctx.fillRect(x+2,y+6,1,3);ctx.fillRect(x+6,y+6,1,3);ctx.fillRect(x+1,y+2,3,2);return true;
    case'tank':ctx.fillRect(x-1,y+5,12,3);ctx.fillRect(x+2,y+2,6,3);ctx.fillRect(x+8,y+3,5,1);return true;
    case'at':ctx.fillRect(x+3,y+1,2,6);ctx.fillRect(x+4,y+4,8,1);pdisc(ctx,x+3,y+7,2,col);return true;
    case'mor':for(let k=0;k<7;k++)ctx.fillRect(x+2+Math.round(k*.5),y+8-k,2,1);ctx.fillRect(x,y+8,7,1);return true;}
  return false;}


/* ================= GRAFIKA EPOK ================= */
let DRAWU=null,DRAWM=null,DRAWI=0;
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


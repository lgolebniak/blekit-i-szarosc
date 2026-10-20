/* ================= CZĄSTECZKI, DYM, ŚLADY ================= */
function smokeAt(x,y){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=GW||ty>=GH)return 0;return smokeG[ty*GW+tx];}
function addSmoke(x,y,n,big){
  for(let i=0;i<n;i++)parts.push({k:'smoke',x:x+(R()-.5)*6,y:y+(R()-.5)*4,vx:G.wind.x*9+(R()-.5)*6,vy:G.wind.y*9+(R()-.5)*4-2,r:(big?5:2.5)+R()*2,g:big?9:5,life:0,max:(big?7:4.5)+R()*2.5,a:big?.6:.42});
  const tx=Math.floor(x/TS),ty=Math.floor(y/TS);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=tx+dx,Y=ty+dy;if(X>=0&&Y>=0&&X<GW&&Y<GH)smokeG[Y*GW+X]+=(dx||dy?.12:.35)*n*(big?1.6:1);}
}
function dustAt(x,y,n,col){for(let i=0;i<n;i++)parts.push({k:'dust',x,y,vx:(R()-.5)*26,vy:-R()*18,life:0,max:.35+R()*.3,c:col||'150,128,90'});}
/* --- ciała poległych (rysowane też na ekranie w animacji) --- */
function flipR(g,x,y,right){return(dx,dy,w,h,col)=>{g.fillStyle=col;g.fillRect(right?x+dx:x-dx-w+1,y+dy,w,h);};}
function lyingSoldier(g,x,y,s,right,crew){x=Math.round(x);y=Math.round(y);const S=SIDE[s],r=flipR(g,x,y,right);
  r(-6,0,12,1,'rgba(0,0,0,.25)');r(-6,-2,3,2,S.pants);r(-7,-2,1,2,'#1b1712');r(-3,-3,4,3,S.coat);r(-3,-1,4,1,S.coatD);r(1,-3,2,2,'#d7ae86');
  r(4,-1,2,1,S.hat);r(4,-2,1,1,S.hat);if(!crew){r(-4,1,9,1,'#4e3520');r(5,1,1,1,'#b8bec4');}}
function lyingHorse(g,x,y,hc,right){x=Math.round(x);y=Math.round(y);const r=flipR(g,x,y,right),Hc=HORSE[hc],Hd=HORSED[hc];
  r(-8,1,17,1,'rgba(0,0,0,.25)');r(-6,-4,12,4,Hc);r(-6,-1,12,1,Hd);r(6,-4,2,2,Hc);r(8,-3,3,2,Hc);r(10,-2,1,1,Hd);r(-8,-3,2,1,Hd);
  [-4,-2,3,5].forEach(lx=>r(lx,0,1,2,Hd));}
function bakeBody(d){const g=G.tctx;if(!g||d.kind==='drown')return;
  if(d.cav&&!d.flee)lyingHorse(g,d.x+d.ox,d.y,d.hc,d.right);
  lyingSoldier(g,d.x+d.ox+(d.cav?(d.right?7:-7):0),d.y+(d.cav?2:0),d.side,!d.right,d.crew);}
function decalCrater(x,y){const g=G.tctx;if(!g)return;x=Math.round(x);y=Math.round(y);
  pdisc(g,x,y,7,'rgba(92,72,44,.55)');pdisc(g,x,y+1,5,'rgba(52,38,22,.8)');pdisc(g,x,y+1,3,'rgba(26,18,10,.9)');
  g.fillStyle='rgba(30,22,12,.9)';g.fillRect(x-4,y-3,8,1);g.fillStyle='rgba(176,146,98,.7)';g.fillRect(x-6,y+5,12,1);
  for(let i=0;i<9;i++){const a=R()*TAU,d=8+R()*6;g.fillStyle=R()<.5?'rgba(96,74,46,.8)':'rgba(140,112,74,.7)';g.fillRect(Math.round(x+Math.cos(a)*d),Math.round(y+Math.sin(a)*d*.7),2,1);}}
function gunWreck(u){const g=G.tctx;if(!g)return;const x=Math.round(u.x),y=Math.round(u.y);pdisc(g,x+2,y,5,'rgba(0,0,0,.25)');
  g.fillStyle='#4a3a20';g.fillRect(x-7,y-3,13,3);g.fillStyle='#2a2014';g.fillRect(x+4,y-4,3,3);pdisc(g,x-5,y+1,3,'#3b2a1a');g.fillStyle='#6a4a2a';g.fillRect(x+3,y+1,6,1);}
function updDying(dt){for(let i=G.dying.length-1;i>=0;i--){const d=G.dying[i];d.t+=dt;if(d.kind==='ball')d.ox=-d.dir*Math.min(1,d.t/d.T)*10;
    if(d.kind==='drown'&&R()<dt*6)parts.push({k:'dirt',x:d.x+(R()-.5)*6,y:d.y,z:0,vx:(R()-.5)*16,vy:0,vz:30+R()*30,life:0,max:.5,c:'#cfe4ee'});
    if(d.t>=d.T){bakeBody(d);G.dying.splice(i,1);}}
  for(let i=G.loose.length-1;i>=0;i--){const h=G.loose[i];h.x+=h.vx*dt;h.y+=h.vy*dt;h.anim+=Math.abs(h.vx)*dt*.22;if(h.x<-30||h.x>W+30)G.loose.splice(i,1);}}
function updParts(dt){
  if(G.dying)updDying(dt);
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life+=dt;if(p.life>=p.max){parts.splice(i,1);continue;}
    if(p.k==='smoke'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.g*dt/p.max*1.6;p.vx*=.995;}
    else if(p.k==='dust'||p.k==='spark'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;}
    else if(p.k==='dirt'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=160*dt;if(p.z<0){p.z=0;p.vz=0;p.vx*=.5;p.vy*=.5;}}
    else if(p.k==='drop'){p.y+=p.vy*dt;}}
  if(parts.length>1600)parts.splice(0,parts.length-1600);
  const k=Math.pow(.8,dt);for(let i=0;i<smokeG.length;i++)smokeG[i]*=k;
}


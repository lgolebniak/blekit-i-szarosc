/* ================= PRZEBIEG BITWY ================= */
function playerCmds(p){const c=input.ctl[p];
  if(c.p.lb||c.p.left)cycleSel(p,-1);if(c.p.rb||c.p.right)cycleSel(p,1);
  if(c.p.up){for(const u of sideUnits(p))u.stance='adv';msg(p,'Rozkaz: cała armia – naprzód!');AU.bugle(BUG.flag);}
  if(c.p.down){for(const u of sideUnits(p)){u.stance='hold';u.hx=u.x;u.hy=u.y;}msg(p,'Rozkaz: cała armia – trzymać pozycje.');AU.ui();}
  if(c.p.b&&G.state==='battle'){const u=selUnit(p);if(u)rally(p,u.x,u.y);}
  if(c.p.start){if(G.state==='deploy'){G.ready[p]=!G.ready[p];AU.ok2();}else if(G.state==='battle'){G.state='pause';G.pauseSel=0;AU.ui();}}}
function updObjective(dt){const c=[0,0];for(const u of units)if(!u.dead&&!u.gone&&!u.rout&&dist(u.x,u.y,OBJ.x,OBJ.y)<OBJ.r+8)c[u.side]++;
  const sp=s=>dt*.28*(1+.25*(c[s]-1));
  if(c[0]&&!c[1])G.objProg=Math.max(-1,G.objProg-sp(0));else if(c[1]&&!c[0])G.objProg=Math.min(1,G.objProg+sp(1));
  if(G.objProg<=-1&&G.objOwner!==0){G.objOwner=0;msg(0,'Niebiescy zdobyli sztandar!');AU.bugle(BUG.flag);}
  if(G.objProg>=1&&G.objOwner!==1){G.objOwner=1;msg(1,'Szarzy zdobyli sztandar!');AU.bugle(BUG.flag);}
  if(G.objOwner===0&&G.objProg>0)G.objOwner=-1;if(G.objOwner===1&&G.objProg<0)G.objOwner=-1;
  if(G.objOwner>=0)G.score[G.objOwner]+=dt;}
function endBattle(w,reason){G.winner=w;G.reason=reason;G.state='end';G.endT=0;AU.bugle(BUG.win);for(let p=0;p<2;p++)if(humanOf(p)>=0)rumble(p,.4,.6,500);}
function checkVictory(dt){const act=[0,0],alive=[0,0];for(const u of units)if(!u.dead&&!u.gone){alive[u.side]++;if(!u.rout)act[u.side]++;}
  const lose=[0,0];for(let s=0;s<2;s++){if(act[s]===0&&alive[s]>0)G.routAll[s]+=dt;else G.routAll[s]=0;lose[s]=alive[s]===0||G.routAll[s]>8;}
  if(lose[0]&&lose[1])return endBattle(-1,'Obie armie rozbite');
  if(lose[0])return endBattle(1,'Armia Niebieskich rozbita');if(lose[1])return endBattle(0,'Armia Szarych rozbita');
  if(G.score[0]>=WINSCORE)return endBattle(0,'Sztandar utrzymany do końca');if(G.score[1]>=WINSCORE)return endBattle(1,'Sztandar utrzymany do końca');}
function cpuCommander(){if(G.mode!=='cpu'||G.rallyCd[1]>0)return;const r=units.find(u=>u.side===1&&u.rout&&!u.dead&&!u.gone&&u.x<W-60);if(r)rally(1,r.x,r.y);}
function beginBattle(){G.state='battle';AU.bugle(BUG.charge);msg(0,'Do boju!');for(const u of units){u.hx=u.x;u.hy=u.y;}}
function stepBattle(dt){
  G.t+=dt;
  for(let p=0;p<2;p++)if(humanOf(p)>=0)playerCmds(p);
  if(G.state!=='battle'&&G.state!=='deploy')return;
  for(const u of units)updUnit(u,dt);
  separate(dt);fixSel();
  if(G.state==='battle'){updMelee(dt);updProjs(dt);updObjective(dt);G.rallyCd[0]=Math.max(0,G.rallyCd[0]-dt);G.rallyCd[1]=Math.max(0,G.rallyCd[1]-dt);cpuCommander();checkVictory(dt);}
  else if(G.state==='deploy'){G.deployT-=dt;if(G.deployT<=0||(G.ready[0]&&G.ready[1]))beginBattle();}
}


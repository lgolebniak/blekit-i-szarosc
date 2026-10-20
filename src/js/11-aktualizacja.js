/* ================= AKTUALIZACJA JEDNOSTEK ================= */
function controllerOf(u){if(isCPU(u.side))return-1;return G.sel[u.side]===u.id?u.side:-1;}
function blockedByEnemy(u,x,y){for(const e of units){if(e.side===u.side||e.dead||e.gone)continue;const lim=(SPEC[u.type].r+SPEC[e.type].r)*.55;const d1=dist(x,y,e.x,e.y);if(d1<lim&&d1<dist(u.x,u.y,e.x,e.y))return true;}return false;}
function tryMove(u,nx,ny){const ok=(x,y)=>(passF(u.type,x,y)>0||(u.rout&&(x<4||x>W-4)))&&!blockedByEnemy(u,x,y);
  if(ok(nx,ny)){u.x=nx;u.y=ny;return true;}if(ok(nx,u.y)){u.x=nx;return true;}if(ok(u.x,ny)){u.y=ny;return true;}return false;}
function handleActions(u,c,p,dt){
  const A=c.b.a||c.b.rt,Ap=c.p.a||c.p.rt,bat=G.state==='battle';
  if(u.type==='inf'&&Ap&&bat){if(!tryVolley(u,true))AU.bad();}
  if(u.type==='cav')u.charging=A&&u.stamina>3&&bat;
  if(u.type==='art'&&bat){
    if(u.ammo==='ball'){if(A){if(!u.aiming){u.aiming=true;u.aimDir=1;u.aimR=SPEC.art.min;}const mr=artMaxRange(u);u.aimR+=u.aimDir*230*dt;
        if(u.aimR>mr){u.aimR=mr;u.aimDir=-1;}if(u.aimR<SPEC.art.min){u.aimR=SPEC.art.min;u.aimDir=1;}}
      else if(u.aiming){u.aiming=false;if(!fireCannon(u,u.aimR,true))AU.bad();}}
    else if(Ap){if(!fireCannon(u,0,true))AU.bad();}}
  if(c.p.x){if(u.type==='art'){u.ammo=u.ammo==='ball'?'can':'ball';AU.ui();}
    else if(u.type==='inf'){setForm(u,u.form==='line'?'col':u.form==='col'?'sq':'line');u.ai.autoSq=false;AU.ui();}
    else{setForm(u,u.form==='line'?'col':'line');AU.ui();}}
  if(c.p.y){u.stance=u.stance==='hold'?'adv':'hold';u.hx=u.x;u.hy=u.y;AU.ui();}
}
function updUnit(u,dt){
  if(u.dead||u.gone)return;
  u.n=0;for(const m of u.men)if(m.alive)u.n++;
  if(u.n===0){u.dead=true;u.charging=false;if(u.type==='art')gunWreck(u);msg(u.side,`${unitName(u)} (${SPEC[u.type].name.toLowerCase()}) rozbity do nogi.`);return;}
  const sp=SPEC[u.type];
  u.reload=Math.max(0,u.reload-dt);u.formT=Math.max(0,u.formT-dt);u.firedT-=dt;u.underFire-=dt;u.inMelee-=dt;
  u.hitFlash=Math.max(0,u.hitFlash-dt);u.recoil=Math.max(0,u.recoil-dt*3);
  if(u.underFire<=0&&u.inMelee<=0)u.morale=Math.min(100,u.morale+(u.rout?5:2)*dt);u.morale=Math.max(0,u.morale);
  if(G.state==='battle'){
    if(!u.rout&&u.morale<18){u.rout=true;u.charging=false;u.aiming=false;msg(u.side,`${unitName(u)} łamie szyk i ucieka!`);}
    if(u.rout&&u.morale>48){u.rout=false;u.hx=u.x;u.hy=u.y;msg(u.side,`${unitName(u)} wraca do walki.`);}}
  let mx=0,my=0,face=null,strafe=false;const ctl=controllerOf(u);
  if(u.rout){const ex=u.side===0?-40:W+40;const v=steer(u,u.side===0?6:W-6,u.y,dt);mx=v[0];my=v[1];if(u.x<40||u.x>W-40){mx=Math.sign(ex-u.x);my=0;}}
  else if(ctl>=0){const c=input.ctl[ctl];mx=c.lx;my=c.ly;if(Math.hypot(mx,my)<.2)mx=my=0;
    if(c.pad&&Math.hypot(c.rx,c.ry)>.55){face=Math.atan2(c.ry,c.rx);strafe=true;}
    else if(c.kRot){u.fa+=c.kRot*(u.type==='art'?1:2.2)*dt;strafe=true;}
    handleActions(u,c,ctl,dt);}
  else if(G.state!=='deploy'){const o=aiUnit(u,dt);mx=o.mx;my=o.my;face=o.face;}
  const mag=Math.min(1,Math.hypot(mx,my));
  if(mag>.01){let s=sp.spd*passF(u.type,u.x,u.y)*(u.type==='inf'?FORM[u.form].spd:u.type==='cav'&&u.form==='col'?1.12:1);
    if(passF(u.type,u.x,u.y)<=0)s=sp.spd*.5;
    if(u.type==='cav'&&u.charging&&u.stamina>0)s*=2.1;if(u.rout)s*=1.15;else if(u.morale<40)s*=.85;
    if(G.weather==='rain')s*=.9;if(strafe)s*=.6;if(u.formT>0)s*=.5;
    if(u.type==='art'){u.setup=1.4;u.aiming=false;}
    const n=Math.hypot(mx,my),vx=mx/n*mag*s,vy=my/n*mag*s;
    u.moving=tryMove(u,u.x+vx*dt,u.y+vy*dt);if(!strafe&&u.moving)face=Math.atan2(vy,vx);}
  else{u.moving=false;if(u.type==='art'&&u.setup>0)u.setup-=dt;}
  if(face!==null){const tr=u.type==='art'?.9:u.type==='cav'?3.2:2.2;const d=angDiff(u.fa,face);u.fa+=clamp(d,-tr*dt,tr*dt);}
  if(u.type==='cav'){if(u.charging&&u.moving)u.stamina-=22*dt;else u.stamina=Math.min(100,u.stamina+(u.moving?6:12)*dt);if(u.stamina<=0){u.stamina=0;u.charging=false;}}
  if(G.state==='deploy'){if(u.side===0)u.x=Math.min(u.x,DEPLOY);else u.x=Math.max(u.x,W-DEPLOY);}
  if(!u.rout){u.x=clamp(u.x,8,W-8);u.y=clamp(u.y,32,H-10);}
  else{u.y=clamp(u.y,32,H-10);if(u.x<-10||u.x>W+10){u.gone=true;msg(u.side,`${unitName(u)} zbiegł z pola bitwy.`);return;}}
  if(ctl>=0&&u.moving){u.hx=u.x;u.hy=u.y;}
  placeMen(u,false,dt);
}
function separate(dt){for(let i=0;i<units.length;i++){const a=units[i];if(a.dead||a.gone)continue;for(let j=i+1;j<units.length;j++){const b=units[j];
  if(b.dead||b.gone||b.side!==a.side)continue;const d=dist(a.x,a.y,b.x,b.y),lim=(SPEC[a.type].r+SPEC[b.type].r)*.75;
  if(d<lim){const ux=d>.01?(b.x-a.x)/d:1,uy=d>.01?(b.y-a.y)/d:0,push=(lim-d)*.5*Math.min(1,dt*5);
    if(passF(a.type,a.x-ux*push,a.y-uy*push)>0){a.x-=ux*push;a.y-=uy*push;}if(passF(b.type,b.x+ux*push,b.y+uy*push)>0){b.x+=ux*push;b.y+=uy*push;}}}}}


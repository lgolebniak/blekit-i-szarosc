/* ================= TRYB KLASYCZNY – silnik wspólny dla wszystkich epok ================= */
const CLS={inf:{spd:24,reload:2.3,range:200},cav:{trot:46,gallop:84,walk:34,steer:42},lan:{walk:22,sprint:92},art:{spd:18}};
let bullets=[];
const clDir=s=>s===0?1:-1;
const clX=(s,x)=>s===0?x:W-x;
const clY=(s,y)=>s===1&&MAP.def.sym==='rot'?H-y:y;
const CREW=[[-9,-5],[-9,5],[-14,0]];
const kdOf=u=>KD[u.key]||KD[u.type]||{};
const keyOrd=k=>{const i=TYPES.indexOf(k);return i<0?9:i;};
// szyki: piechota linia ↔ kolumna marszowa, konnica szereg ↔ jeden za drugim
function infSlots(u,n){const cd=u.colDir||clDir(u.side),o=[];for(let j=0;j<n;j++){const c=j-(n-1)/2;o.push([lerp((j%2)*8-4,-cd*c*9,u.s),lerp(c*11,((j%2)-.5)*6,u.s)]);}return o;}
function cavSlots(u,n){const dir=clDir(u.side),o=[];
  if(u.lance&&u.state==='ride'){for(let j=0;j<n;j++){const c=j-(n-1)/2;
      if(u.form==='line')o.push([0,c*15]);else if(u.form==='wedge'){const r=Math.ceil(j/2),sd=j%2?-1:1;o.push([-dir*r*13,j?sd*r*13:0]);}else o.push([-dir*c*16,0]);}return o;}
  for(let j=0;j<n;j++){const c=j-(n-1)/2;o.push([lerp((j%2)*4-2,-dir*c*16,u.s),lerp(c*15,0,u.s)]);}return o;}
function slotsOf(u,n){const f=kdOf(u).slots;if(f)return f(u,n);return u.type==='cav'?cavSlots(u,n):infSlots(u,n);}
function clCrew(u,snap,dt){
  if(u.type==='tank'||u.type==='ele'){for(const m of u.men)if(m.alive){if(!snap){m.anim+=Math.hypot(u.x-m.x,u.y-m.y)*.3;m.mv=u.moving?1:0;}m.x=u.x;m.y=u.y;}return;}
  const dir=clDir(u.side);let j=0;
  for(const m of u.men){if(!m.alive)continue;const o=CREW[j++]||[-12,0];const tx=u.x+o[0]*dir,ty=u.y+o[1];
    if(snap){m.x=tx;m.y=ty;continue;}const dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy);
    if(d>.4){const st=Math.min(d,40*dt);m.x+=dx/d*st;m.y+=dy/d*st;m.anim+=st*.22;m.mv=1;}else m.mv=Math.max(0,m.mv-dt*5);}}
function clSpawn(side,key,slot=0){
  const res=G.res[side];if(!res[key]||res[key]<=0)return null;res[key]--;
  const kd=KD[key],type=kd.base,num=G.army[side][key]-res[key],dir=clDir(side);
  const py=kd.pos[1],y0=py==='cav'?(G.cavSlot[side]++%2?400:140):py==='art'?(slot?370:170):py,x0=kd.pos[0];
  let[tx,ty]=nearestPassXY(type,clX(side,x0),clY(side,y0));
  const sx=side===0?-26:W+26;
  const u=mkUnit(side,type,num,sx,ty);
  if(u.men.length!==kd.men)u.men=Array.from({length:kd.men},()=>({x:sx,y:ty,alive:true,anim:R()*4,mv:0,hc:Math.floor(R()*4)}));
  Object.assign(u,{cl:true,key,lance:!!kd.lance,elev:20,form:'line',state:'enter',tx,ty,slot,fa:side===0?0:Math.PI,prevA:false,prevR:false,passed:0,enterT:0,s:0,colDir:dir,slashT:0,slashCd:0,gallop:false,supT:0});
  if(kd.init)kd.init(u);initAmmo(u);
  if(type==='art'||type==='tank'||type==='ele'){u.x=sx;u.y=ty;clCrew(u,true,0);}
  else{const n=u.men.length,sl=slotsOf(u,n);u.men.forEach((m,j)=>{m.ox=sl[j][0];m.oy=sl[j][1];m.x=sx+m.ox-dir*R()*16;m.y=ty+m.oy;m.cool=0;});}
  units.push(u);return u;
}
function clCentroid(u){if(u.type==='art'||u.type==='tank'||u.type==='ele')return;let sx=0,sy=0,n=0;for(const m of u.men)if(m.alive&&!m.wrap){sx+=m.x;sy+=m.y;n++;}if(n){u.x=sx/n;u.y=sy/n;}}
// wszyscy idą równolegle (ten sam wektor), a k>0 ściąga ich łagodnie do szyku; przeszkody rozpraszają
function clMoveMen(u,vx,vy,dt,ride,k,human,avoid){
  const al=u.men.filter(m=>m.alive&&!m.wrap),n=al.length;if(!n)return;
  const sl=slotsOf(u,n);let cx=0,cy=0;for(const m of al){cx+=m.x;cy+=m.y;}cx/=n;cy/=n;
  let mx0=0,my0=0;for(const q of sl){mx0+=q[0]/n;my0+=q[1]/n;}for(const q of sl){q[0]-=mx0;q[1]-=my0;}
  const lim=u.type==='cav'?45:26;
  const ok=(x,y)=>{if(ride&&(x<3||x>W-3))return true;const t=tAt(x,y);if(t===T.WATER)return!!human&&tAt(cx+vx*dt*8,cy+vy*dt*8)===T.WATER;return passF(u.type,x,y)>0;};
  al.forEach((m,j)=>{const pf=passF(u.type,m.x,m.y),f=pf>0?pf:.5;
    let cvx=(cx+sl[j][0]-m.x)*k,cvy=(cy+sl[j][1]-m.y)*k;const cm=Math.hypot(cvx,cvy);if(cm>lim){cvx*=lim/cm;cvy*=lim/cm;}
    let evy=0;if(ride&&vx){const sg=Math.sign(vx),fx=m.x+sg*8,bf=!ok(fx,m.y)||!ok(m.x+sg*15,m.y);m.stuckT=bf||m.noProg>.6?(m.stuckT||0)+dt:0;
      if(bf&&(avoid||m.stuckT>1)){let o=0;for(let off=6;off<220;off+=6){if(ok(fx,m.y-off)&&ok(m.x,m.y-off)){o=-1;break;}if(ok(fx,m.y+off)&&ok(m.x,m.y+off)){o=1;break;}}evy=o*44;cvx=cvy=0;}}
    let esc=null;if(ride&&vx&&(m.esc||m.stuckT>1.2)){if(!m.esc){m.esc=astar(u.type,m.x,m.y,m.x+Math.sign(vx)*60,m.y)||[];m.ei=0;m.escT=3;}
      m.escT-=dt;while(m.ei<m.esc.length&&dist(m.x,m.y,m.esc[m.ei][0],m.esc[m.ei][1])<6)m.ei++;
      if(m.ei>=m.esc.length||m.escT<=0){m.esc=null;m.stuckT=0;m.noProg=0;}else esc=m.esc[m.ei];}
    let nx=m.x+(vx*f+cvx)*dt,ny=clamp(m.y+(vy*f+cvy+evy)*dt,32,H-10);
    if(esc){const d=dist(m.x,m.y,esc[0],esc[1])||1,sp=Math.abs(vx)*Math.max(f,.5)*.8;nx=m.x+(esc[0]-m.x)/d*sp*dt;ny=m.y+(esc[1]-m.y)/d*sp*dt;}
    let mx=m.x,my=m.y;if(ok(nx,ny)){mx=nx;my=ny;}else if(ok(nx,m.y))mx=nx;else if(ok(m.x,ny))my=ny;
    if(!ride)mx=clamp(mx,6,W-6);
    if(ride&&vx&&!esc){const want=Math.abs(vx*f*dt);m.noProg=Math.abs(mx-m.x)<want*.25?(m.noProg||0)+dt:0;}
    const d=Math.hypot(mx-m.x,my-m.y);if(d>.02){m.anim+=d*.22;m.mv=1;}else m.mv=Math.max(0,m.mv-dt*5);m.x=mx;m.y=my;});
  const lm=u.type==='cav'?9:5;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=al[i],b=al[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    if(d<lm&&d>.01){const p=(lm-d)*.25,ax=a.x-dx/d*p,ay=a.y-dy/d*p,bx=b.x+dx/d*p,by=b.y+dy/d*p;if(ok(ax,ay)){a.x=ax;a.y=ay;}if(ok(bx,by)){b.x=bx;b.y=by;}}}}
// salwa na wprost (muszkiety, karabiny, pilum) – parametry zależne od jednostki
function clVolley(u,o={}){if(u.reload>0||u.pendVol)return false;const rl=o.reload||CLS.inf.reload;
  u.reload=rl*(G.weather==='rain'&&!o.noPowder?1.4:1);u.firedT=3;
  const dl=o.delay!==undefined?o.delay:G.rules!=='classic'?0:o.kind==='pilum'||o.kind==='jav'?.2:o.kind==='rifle'?.25:.35;
  if(dl>0){u.pendVol={o,t:dl};AU.tone(900,.04,'square',.03);return true;}doVolley(u,o);return true;}
function doVolley(u,o){const rg=o.range||CLS.inf.range;u.firedT=3;const dir=clDir(u.side);let k=0;
  const ca=Math.cos(o.ang||0),sa=Math.sin(o.ang||0),sp=o.spd||300;
  for(const m of u.men){if(!m.alive||(o.who&&!o.who(m)))continue;k++;const bx=m.x+dir*7*ca;
    bullets.push({x:bx,y:m.y+7*sa,vx:dir*sp*ca,vy:sp*sa,left:rg*(1+.15*hAt(m.x,m.y)),side:u.side,src:u.key,wall:false,kind:o.kind||'musket',pk:o.pk||.85});
    if(!o.noPowder){parts.push({k:'flash',x:bx,y:m.y-8,life:0,max:.07});addSmoke(bx,m.y-8,1,false);}}
  G.stats[u.side].shots+=k;if(o.noPowder)AU.burst(.25,1800,'bandpass',1,.2,AU.pan(u.x));else AU.musket(u.x,k);return true;}
function isFront(e,fromX){return(fromX-e.x)*clDir(e.side)>0;}
function updBullets(dt){
  for(let i=bullets.length-1;i>=0;i--){const b=bullets[i],stp=Math.hypot(b.vx,b.vy||0)*dt;b.x+=b.vx*dt;b.y+=(b.vy||0)*dt;b.left-=stp;b.dist=(b.dist||0)+stp;
    let kill=b.left<=0||b.x<-5||b.x>W+5||b.y<28||b.y>H;
    const t=tAt(b.x,b.y),ti=Math.floor(b.y/TS)*GW+Math.floor(b.x/TS);
    if(ti!==b.ti){b.ti=ti;const O=OBST[t];if(O&&b.dist>14&&R()<O.stop*(b.boom&&O.soft?.5:1)){kill=true;obstacleHit(b.x,b.y,BULLET_DMG[b.kind]||1,b.src);}}
    if(!kill&&G.era==='ww2'&&smokeAt(b.x,b.y)>3&&R()<dt*5)kill=true;
    if(!kill)for(const e of units){if(e.side===b.side||e.dead||e.gone)continue;if(Math.abs(e.y-b.y)>80||Math.abs(e.x-b.x)>80)continue;
      if(e.type==='tank'){if(Math.abs(e.x-b.x)<13&&Math.abs(e.y-b.y)<7){kill=true;if(b.ap)tankHit(e,(typeof b.ap==='function'?b.ap(b):b.ap)*eff(b.src,e.key)*evade(e),b.side,b.x-b.vx,b.y-(b.vy||0));else{parts.push({k:'spark',x:b.x,y:b.y-8,vx:-b.vx*.05,vy:-20,life:0,max:.2});}break;}continue;}
      if(e.type==='ele'){if(Math.abs(e.x-b.x)<11&&Math.abs(e.y-b.y)<6){kill=true;const m=e.men.find(q=>q.alive);if(m){if(b.kind==='pilum'&&R()<.4)elePanic(e);killMan(e,m,b.boom?'ball':'shot');}break;}continue;}
      if(e.type==='art'&&Math.abs(e.x-b.x)<7&&Math.abs(e.y-b.y)<4){kill=true;dustAt(b.x,b.y-5,2,'210,190,130');break;}
      for(const m of e.men){if(!m.alive||(b.hit&&b.hit.has(m)))continue;const ty=e.type==='cav'?5:3.5;
        if(b.sup&&e.type==='inf'&&Math.abs(m.y-b.y)<10&&Math.abs(m.x-b.x)<7)e.supT=2.5;
        if(Math.abs(m.y-b.y)<=ty&&Math.abs(m.x-b.x)<=5){
          if(e.key==='leg'&&e.rf==='testudo'&&isFront(e,b.x-b.vx)){
            if(b.kind==='pilum'){kill=true;if(R()<.5){e.rf='line';e.formT=.8;msg(e.side,`${unitName(e)}: pilum rozbija żółwia!`);}break;}
            if(R()>.1){kill=true;dustAt(b.x,b.y-6,1,'200,190,160');break;}}
          let p=(b.pk||.85)*Math.min(1,TCOVER[tAt(m.x,m.y)])*(smokeAt(b.x,b.y)>2?.8:1)*(e.supT>0?.5:1)*eff(b.src,e.key)*evade(e,m);
          if(b.boom){kill=true;break;}
          if(R()<p){killMan(e,m,'shot');G.stats[b.side].hits++;if(b.pierce>1){b.pierce--;(b.hit||(b.hit=new Set())).add(m);continue;}}
          kill=true;break;}}
      if(kill)break;}
    if(kill){if(b.boom)blast(b.x,b.y,b.boom,b.bk||.7,b.side,b.src);else if(b.left<=0)dustAt(b.x,b.y,1);bullets.splice(i,1);}}}
const _updBullets1=updBullets;updBullets=function(dt){const n=Math.max(1,Math.ceil(dt*120));for(let i=0;i<n;i++)_updBullets1(dt/n);};
/* --- walka wręcz --- */
let clMeleeT=0;
function clStrike(a,b,m,o,d){
  if(b.type==='tank')return 0;
  if(a.type==='tank')return a.moving&&d<8?.14:0;
  if(a.type==='ele')return a.chargeT>0||a.panicT>0?.5:.15;
  let p=0;
  if(a.type==='cav'){
    if(a.slashT>0)p=b.type==='cav'?(b.slashT>0?.22:.4):.45;
    else if(a.lance&&a.state==='ride'&&(o.x-m.x)*clDir(a.side)>-2)p=a.gallop?.32:.1;
    else if(a.gallop&&b.type!=='cav'&&d<6)p=.07;}
  else if(a.key==='leg'||a.key==='lib')p=({line:.06,wedge:.1,testudo:.012,orbis:.05,phalanx:.05}[a.rf]||.06)*(a.rf==='wedge'&&b.rf==='line'?1.3:1);
  else if(a.key==='war')p=.06*(a.furyT>0?2:a.tiredT>0?.6:1);
  else if(a.type==='inf')p=a.key==='arc'||a.key==='mg'?.015:b.type==='cav'?.035:b.type==='art'?.06:.025;
  else p=.01;
  if(b.key==='leg'||b.key==='lib'){const front=isFront(b,m.x);if(b.rf==='testudo')p*=front?.35:1;else if(b.rf==='orbis')p*=a.type==='cav'?.15:.6;else if(b.rf==='phalanx'&&front)p*=a.type==='cav'||a.type==='ele'?.2:.4;else if(b.rf==='wedge'&&!front)p*=1.2;}
  if(a.supT>0)p*=.5;
  return p;}
function clMelee(dt){clMeleeT-=dt;if(clMeleeT>0)return;clMeleeT=.1;
  const L=units.filter(u=>!u.dead&&!u.gone&&u.state!=='enter');
  for(const u of L)for(const m of u.men)if(m.cool>0)m.cool-=.1;
  for(const a of L)for(const b of L){if(a.side===b.side||Math.abs(a.x-b.x)>100||Math.abs(a.y-b.y)>100)continue;
    const reach=a.type==='cav'?(a.lance?13:11):a.type==='tank'?9:a.type==='ele'?10:7;
    for(const m of a.men){if(!m.alive||m.cool>0)continue;for(const o of b.men){if(!o.alive)continue;const d=dist(m.x,m.y,o.x,o.y);if(d>reach)continue;
      const p=clStrike(a,b,m,o,d);if(p<=0||R()>=p)continue;
      const kind=(a.type==='cav'&&a.slashT<=0&&!a.lance)||a.type==='tank'?'trample':'melee';killMan(b,o,kind);m.cool=a.type==='tank'?.1:.35;
      parts.push({k:'spark',x:(m.x+o.x)/2,y:(m.y+o.y)/2-8,vx:(R()-.5)*30,vy:-20,life:0,max:.25});if(R()<.5&&a.type!=='tank')AU.clash(m.x);break;}}}}
function clQueue(side,key,slot){if(G.res[side][key]>0)G.spawnQ.push({side,key,slot,t:2.2});}
function clSpawnTick(dt){for(let i=G.spawnQ.length-1;i>=0;i--){const q=G.spawnQ[i];q.t-=dt;if(q.t<=0){G.spawnQ.splice(i,1);const u=clSpawn(q.side,q.key,q.slot);if(u)msg(q.side,`${unitName(u)} nadciąga z odwodu.`);}}}
function cavAvoid(u){const dir=clDir(u.side),ty=u.type==='tank'?'tank':'cav';
  const clear=y=>{for(let a=8;a<=38;a+=6)if(passF(ty,u.x+dir*a,y)<=0)return false;return true;};if(clear(u.y))return 0;
  for(let off=12;off<260;off+=12){if(u.y-off>36&&clear(u.y-off)&&passF(ty,u.x,u.y-off)>0)return-1;if(u.y+off<H-12&&clear(u.y+off)&&passF(ty,u.x,u.y+off)>0)return 1;}return 0;}
/* --- zachowania jednostek wojny secesyjnej (inne epoki dopisują swoje w BEH) --- */
const BEH={
  acwInf(u,dt,I){const sp=CLS.inf.spd*(G.weather==='rain'?.9:1)*(u.supT>0?.4:1),{x,y}=I;
    const horiz=Math.abs(x)>.3&&Math.abs(x)>=Math.abs(y),vert=Math.abs(y)>.3&&Math.abs(y)>Math.abs(x);
    if(horiz){u.s=Math.min(1,u.s+dt*.7);u.colDir=Math.sign(x);}else if(vert)u.s=Math.max(0,u.s-dt*1.1);
    clMoveMen(u,x*sp,y*sp,dt,false,vert?2.2:horiz?1.2:0,I.hum);
    if(I.Ap&&I.bat&&!clVolley(u)&&I.hum)AU.bad();},
  acwLance(u,dt,I){const{x,y,dir}=I;
    if(u.state==='idle'){u.charging=false;u.gallop=false;u.s=Math.max(0,u.s-dt*1.2);clMoveMen(u,x*CLS.lan.walk,y*CLS.lan.walk,dt,false,2,I.hum);
      if(I.bat&&I.Ap){u.state='ride';u.form='col';u.charging=true;u.gallop=true;AU.bugle(BUG.charge);msg(u.side,`${unitName(u)}: szarża z kopiami!`);}}
    else{u.gallop=true;u.charging=true;if(I.Ap){u.form=u.form==='col'?'line':u.form==='line'?'wedge':'col';AU.ui();}const ay=I.inp?y:cavAvoid(u)*.8;
      clMoveMen(u,dir*CLS.lan.sprint,ay*CLS.cav.steer,dt,true,2.2,I.hum,!I.inp);
      if(R()<.7)dustAt(u.x-dir*10+(R()-.5)*16,u.y+(R()-.5)*30,1,'140,120,85');
      let all=true;for(const m of u.men){if(!m.alive)continue;if(!m.wrap&&(m.x<-12||m.x>W+12))m.wrap=true;if(!m.wrap)all=false;}
      if(all)clReenter(u);}},
  acwSabre(u,dt,I){const{x,y,dir}=I;
    if(u.state==='idle'){u.s=Math.max(0,u.s-dt*1.2);clMoveMen(u,0,y*CLS.cav.steer*.7,dt,false,2,I.hum);
      if(I.bat&&x*dir>.5){u.state='ride';u.charging=true;AU.bugle(BUG.rally);msg(u.side,`${unitName(u)} – ruszają w szyku!`);}}
    else if(u.state==='halt'){u.charging=false;u.gallop=false;u.s=Math.max(0,u.s-dt*1.2);
      if(u.rearT>0)clMoveMen(u,0,0,dt,false,1,I.hum);
      else{clMoveMen(u,(x*dir<0?0:x)*CLS.cav.walk,y*CLS.cav.walk,dt,false,2,I.hum);
        if(I.bat&&x*dir>.5){u.fwdT=(u.fwdT||0)+dt;if(u.fwdT>.8){u.state='ride';u.fwdT=0;u.charging=true;msg(u.side,`${unitName(u)} – znów do szarży!`);}}else u.fwdT=0;}}
    else{if(I.inp&&x*dir<-.5){u.state='halt';u.rearT=.7;u.gallop=false;u.charging=false;u.fwdT=0;AU.tone(760,.4,'sawtooth',.05,0,-360,1400);}
      else{u.gallop=!!I.inp&&x*dir>.5;u.s=u.gallop?Math.min(1,u.s+dt*1.6):Math.max(0,u.s-dt*1.2);
        const ay=I.inp?y:cavAvoid(u)*.8;clMoveMen(u,dir*(u.gallop?CLS.cav.gallop:CLS.cav.trot),ay*CLS.cav.steer,dt,true,2.2,I.hum,!I.inp);
        if(R()<(u.gallop?.7:.35))dustAt(u.x-dir*10+(R()-.5)*16,u.y+(R()-.5)*30,1,'140,120,85');
        for(const m of u.men)if(m.alive&&(m.x<-12||m.x>W+12)){m.alive=false;m.out=true;u.passed++;G.stats[u.side].through++;}}}
    if(I.Ap&&u.slashCd<=0&&u.state!=='idle'){u.slashT=.4;u.slashCd=.55;AU.clash(u.x);}},
  acwCannon(u,dt,I){const{y,A}=I,MIN=u.minR||SPEC.art.min;
    if(Math.abs(y)>.2&&!u.aiming){const ny=clamp(u.y+y*CLS.art.spd*Math.max(.3,passF('art',u.x,u.y))*dt,32,H-10);if(passF('art',u.x,ny)>0)u.y=ny;u.setup=.35;}
    if(I.Rp&&u.key==='mor'){u.ammo2=u.ammo2==='smoke'?'he':'smoke';AU.ui();}
    if(I.bat){if(A&&u.aiming&&Math.abs(y)>.2&&!u.fixedElev)u.elev=clamp((u.elev||20)-y*40*dt,5,65);
      if(A){if(!u.aiming){u.aiming=true;u.aimDir=1;u.aimR=MIN;}const mr=artMaxRange(u);u.aimR+=u.aimDir*(u.aimSpd||330)*dt;
        if(u.aimR>mr){u.aimR=mr;u.aimDir=-1;}if(u.aimR<MIN){u.aimR=MIN;u.aimDir=1;}}
      else if(u.aiming){u.aiming=false;u.ammo='ball';if(!fireCannon(u,u.aimR,true)&&I.hum)AU.bad();}}
    clCrew(u,false,dt);}
};
function clUpdate(u,dt,inp){
  if(u.dead||u.gone)return;
  u.n=0;for(const m of u.men)if(m.alive)u.n++;
  if(u.n===0){u.dead=true;u.charging=false;u.pendVol=null;
    if(u.type==='cav'&&u.passed>0)msg(u.side,`${unitName(u)} – przedarli się przez linie wroga!`);else if(u.type!=='tank')msg(u.side,`${unitName(u)} – oddział rozbity.`);
    if(u.type==='art')gunWreck(u);clQueue(u.side,u.key,u.slot);return;}
  u.reload=Math.max(0,u.reload-dt);u.firedT-=dt;u.hitFlash=Math.max(0,u.hitFlash-dt);u.recoil=Math.max(0,u.recoil-dt*3);u.setup=Math.max(0,u.setup-dt);u.underFire-=dt;
  u.slashT=Math.max(0,u.slashT-dt);u.slashCd=Math.max(0,u.slashCd-dt);u.rearT=Math.max(0,(u.rearT||0)-dt);u.supT=Math.max(0,(u.supT||0)-dt);
  u.cd2=Math.max(0,(u.cd2||0)-dt);u.formT=Math.max(0,(u.formT||0)-dt);
  if(u.pendVol){u.pendVol.t-=dt;if(u.pendVol.t<=0){const pv=u.pendVol;u.pendVol=null;if(u.n>0&&u.state!=='enter')doVolley(u,pv.o);}}
  const dir=clDir(u.side);
  if(u.state==='enter'){let done=true;u.enterT+=dt;
    if(u.type==='art'||u.type==='tank'||u.type==='ele'){const d=u.tx-u.x;if(Math.abs(d)>1){u.x+=Math.sign(d)*Math.min(Math.abs(d),34*dt);done=false;u.moving=true;}else u.moving=false;clCrew(u,false,dt);}
    else for(const m of u.men){if(!m.alive)continue;const tx=u.tx+m.ox,ty=u.ty+m.oy,dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy),sp=(u.type==='cav'?60:30)*dt;
      if(d>1){const st=Math.min(d,sp);m.x+=dx/d*st;m.y+=dy/d*st;m.anim+=st*.22;m.mv=1;done=false;}else m.mv=0;}
    clCentroid(u);if(done||u.enterT>6)u.state=u.type==='cav'?'idle':'ready';return;}
  if(!inp){u.prevA=false;u.prevR=false;u.aiming=false;}
  const x=inp?inp.x:0,y=inp?inp.y:0,A=!!(inp&&inp.A),Rr=!!(inp&&inp.R);
  const I={x,y,A,R:Rr,Ap:A&&!u.prevA,Rp:Rr&&!u.prevR,hum:!!(inp&&inp.human),bat:G.state==='battle',dir,inp};u.prevA=A;u.prevR=Rr;
  (BEH[kdOf(u).beh]||BEH.acwInf)(u,dt,I);
  if(!inp)autoDefend(u,dt);
  // rzeka: poza brodem i mostem żołnierze toną
  for(const m of u.men)if(m.alive&&tAt(m.x,m.y)===T.WATER){killMan(u,m,'drown');if(!(u.drownT>G.t)){msg(u.side,`${unitName(u)}: ${u.type==='tank'?'czołg tonie w rzece':'żołnierze toną w rzece'}!`);u.drownT=G.t+3;}}
  clCentroid(u);
}
function clReenter(u){const dir=clDir(u.side),sx=u.side===0?-26:W+26;const al=u.men.filter(m=>m.alive);
  const pt=nearestPassXY('cav',clX(u.side,72),clamp(u.y,70,H-70));u.s=0;const sl=cavSlots(u,al.length);
  al.forEach((m,j)=>{m.wrap=false;m.ox=sl[j][0];m.oy=sl[j][1];m.x=sx+m.ox-dir*R()*16;m.y=pt[1]+m.oy;});
  Object.assign(u,{tx:pt[0],ty:pt[1],state:'enter',enterT:0,gallop:false,charging:false,x:sx,y:pt[1]});u.passed++;G.stats[u.side].through++;
  msg(u.side,`${unitName(u)} – przelecieli przez pole i wjeżdżają od nowa.`);}
/* --- wybór sterowanego oddziału --- */
function clOrder(p){return units.filter(u=>u.side===p&&!u.dead&&!u.gone).sort((a,b)=>keyOrd(a.key)-keyOrd(b.key)||a.slot-b.slot);}
function clSel(p){return units.find(u=>u.id===G.csel[p]&&!u.dead&&!u.gone)||null;}
function clAutoSel(p){if(clSel(p))return;const L=clOrder(p);const f=L.find(u=>kdOf(u).pick==='x')||L.find(u=>u.state!=='enter')||L[0];G.csel[p]=f?f.id:0;}
function clCycle(p,d){const L=clOrder(p);if(!L.length)return;let i=L.findIndex(u=>u.id===G.csel[p]);i=(i+d+L.length)%L.length;G.csel[p]=L[i].id;AU.ui();}
function clPick(p,letter){const L=clOrder(p).filter(u=>kdOf(u).pick===letter);if(!L.length){AU.bad();return;}const cur=L.findIndex(u=>u.id===G.csel[p]);G.csel[p]=L[(cur+1)%L.length].id;AU.ui();}
function clPlayer(p){const c=input.ctl[p];
  if(c.p.lb||c.p.left)clCycle(p,-1);if(c.p.rb||c.p.right)clCycle(p,1);
  if(c.p.x)clPick(p,'x');if(c.p.y)clPick(p,'y');if(c.p.b)clPick(p,'b');
  if(c.p.start&&G.state==='battle'){G.state='pause';G.pauseSel=0;AU.ui();}
  else if(c.p.start&&G.state==='deploy'){G.ready[p]=!G.ready[p];AU.ok2();}}
/* --- komputer: steruje JEDNYM oddziałem naraz, z opóźnieniem reakcji --- */
function nearestBy(list,u){let b=null,bd=1e9;for(const f of list){const d=dist(u.x,u.y,f.x,f.y);if(d<bd){bd=d;b=f;}}return b;}
function cpuScore(u,foes){const ai=kdOf(u).ai;
  if(ai==='flat'){let s=40;const rc=foes.find(f=>f.type==='cav'&&f.state==='ride');if(rc&&Math.abs(rc.x-u.x)<320)s+=70;return s;}
  if(ai==='cav'||ai==='lance'){if(u.state==='ride'&&foes.some(f=>f.men.some(o=>o.alive&&Math.abs(o.x-u.x)<40&&Math.abs(o.y-u.y)<30)))return 85;let s=u.state==='ride'?(cavAvoid(u)?72:48):(foes.some(f=>f.type==='art')?52:28);if(G.t<10&&u.state!=='ride')s-=40;return s;}
  if(ai==='artArc'||ai==='artFlat'){const mr=artMaxRange(u),mn=u.minR||SPEC.art.min;const ok=foes.some(f=>Math.abs(f.x-u.x)<mr-10&&Math.abs(f.x-u.x)>mn+10);return ok&&u.reload<=0&&u.shots!==0?58:4;}
  return CPUSCORE[ai]?CPUSCORE[ai](u,foes):40;}
function cpuPick(dt){const c=G.cpu;c.t-=dt;c.hold-=dt;const cur=clSel(1),live=cur&&cur.state!=='enter';
  if(live&&c.hold>0)return;if(live&&c.t>0)return;c.t=.4;
  const mine=clOrder(1).filter(u=>u.state!=='enter');if(!mine.length)return;
  const foes=units.filter(u=>u.side===0&&!u.dead&&!u.gone&&u.state!=='enter');
  let best=null,bs=-1e9;
  for(const u of mine){let s=cpuScore(u,foes);
    const thr=foes.find(f=>(f.type==='cav'&&f.state==='ride'||f.type==='ele'||f.furyT>0)&&dist(f.x,f.y,u.x,u.y)<220&&eff(u.key,f.key)>=1);if(thr&&(u.type==='inf'||u.type==='art'))s+=45;
    if(u.pendVol||u.aiming)s+=30;s+=R()*18;if(cur&&u.id===cur.id)s+=10;if(s>bs){bs=s;best=u;}}
  if(best&&(!cur||best.id!==cur.id)){G.csel[1]=best.id;c.react=.22+R()*.25;c.lastA=false;}
  c.hold=best&&best.type==='cav'?3.5:1.6+R()*1.4;}
function alignPair(u,t,dir){const menOf=f=>f.men.filter(m=>m.alive);let best=1e9,bdx=1e9;
  for(const m of menOf(u))for(const o of menOf(t)){if((o.x-m.x)*dir<0)continue;const lead=(Math.abs(o.x-m.x)/300+.35)*(t.vy||0),dy=o.y+lead-m.y;if(Math.abs(dy)<Math.abs(best)){best=dy;bdx=Math.abs(o.x-m.x);}}return[best,bdx];}
function cpuClassic(u,dt){const c=G.cpu;const idle={x:0,y:0,A:false};if(c.react>0){c.react-=dt;return idle;}
  const dir=clDir(u.side);const foes=units.filter(f=>f.side!==u.side&&!f.dead&&!f.gone&&f.state!=='enter');if(!foes.length)return idle;
  const kd=kdOf(u),ai=kd.ai,menOf=f=>f.men.filter(m=>m.alive);
  if(CPU[ai])return CPU[ai](u,dt,foes,dir,c);
  if(ai==='flat'){const rg=kd.range||CLS.inf.range;
    const t=foes.find(f=>f.type==='cav'&&f.state==='ride'&&Math.abs(f.x-u.x)<300)||bestTarget(u,foes.filter(f=>f.type!=='tank'))||nearestBy(foes,u);
    const[best,bdx]=alignPair(u,t,dir);
    let iy=0,ix=0;if(Math.abs(best)<200){if(Math.abs(best)>1.5)iy=clamp(best/6,-1,1);}else iy=clamp((t.y-u.y)/14,-1,1);
    const dx=Math.abs(t.x-u.x);const fire=Math.abs(best)<3&&bdx<rg&&u.reload<=0&&!c.lastA;c.lastA=fire;
    const gren=kd.gren&&u.cd2<=0&&dx<85&&Math.abs(t.y-u.y)<25;
    const blocked=passF('inf',u.x+dir*22,u.y)<=0||tAt(u.x+dir*22,u.y)===T.WATER;
    if(t.type!=='cav'&&(dx>rg*.85||(blocked&&dx>70))){const v=steer(u,t.x-dir*150,t.y,dt);return{x:v[0],y:v[1],A:fire,R:gren};}
    if(t.type!=='cav'&&Math.abs(iy)<.5&&dx<90&&!kd.gren)ix=-dir*.6;
    return{x:ix,y:iy,A:fire,R:gren};}
  if(ai==='lance'){const t=nearestBy(foes.filter(f=>f.type==='art'),u)||nearestBy(foes,u);
    if(u.state==='idle'){const dy=t.y-u.y,go=Math.abs(dy)<16&&!c.lastA;c.lastA=go;return{x:0,y:clamp(dy/20,-1,1),A:go};}
    let iy=clamp((t.y-u.y)/16,-1,1);const av=cavAvoid(u);if(av)iy=av;const fl=u.form==='col'&&!av&&Math.abs(t.x-u.x)<160&&!c.lastA;c.lastA=fl;return{x:0,y:iy,A:fl};}
  if(ai==='cav'){
    const t=bestTarget(u,foes)||nearestBy(foes,u);
    if(u.state==='halt')return{x:dir,y:clamp((t.y-u.y)/20,-1,1),A:false};
    if(u.state==='idle'){const dy=t.y-u.y;return{x:Math.abs(dy)<18?dir:0,y:clamp(dy/20,-1,1),A:false};}
    let ty=u.y,bd=1e9,near=1e9;for(const f of foes)for(const o of menOf(f)){const ax=(o.x-u.x)*dir;if(ax<-5||ax>260)continue;const d=ax+Math.abs(o.y-u.y)*1.5;if(d<bd){bd=d;ty=o.y;}if(Math.abs(o.y-u.y)<20)near=Math.min(near,Math.abs(ax));}
    let iy=clamp((ty-u.y)/16,-1,1);const av=cavAvoid(u);if(av)iy=av;
    const vt=volleyThreat(u,dir);if(vt&&!av&&near>40){iy=u.y>vt.y?1:-1;if(u.y<60)iy=1;if(u.y>H-60)iy=-1;}
    const slash=near<22&&u.slashCd<=0&&!c.lastA;c.lastA=slash;
    return{x:bd>90?dir:0,y:iy,A:slash};}
  // artyleria po łuku (armata, onager, moździerz)
  const mr=artMaxRange(u),mn=u.minR||SPEC.art.min,inr=foes.filter(f=>Math.abs(f.x-u.x)<mr&&Math.abs(f.x-u.x)>mn),
    tg=inr.sort((a,b)=>(b.n+(b.type==='art'?0:2)+(kd.mor&&b.key==='mg'?4:0))-(a.n+(a.type==='art'?0:2)+(kd.mor&&a.key==='mg'?4:0)))[0]||nearestBy(foes,u);
  const Tf=.3+Math.abs(tg.x-u.x)/650*(1+(((u.fixedElev||u.elev||20))-20)/40),px=tg.x+(tg.vx||0)*Tf,py=tg.y+(tg.vy||0)*Tf,dy=py-u.y;
  if(!u.aiming){if(Math.abs(dy)>4)return{x:0,y:clamp(dy/10,-1,1),A:false};if(u.reload>0||u.setup>0)return idle;c.aimErr=(R()-.5)*.08;return{x:0,y:0,A:true};}
  const wantEl=tg.type==='art'?52:18,ey=u.fixedElev?0:Math.abs(wantEl-u.elev)>3?(wantEl>u.elev?-1:1):0;
  const want=clamp(Math.abs(px-u.x)*(1+c.aimErr*.6),mn+5,mr-3);return{x:0,y:ey,A:ey!==0||u.aimR<want||u.aimDir<0};}
/* --- przebieg --- */
function clStart(){units=[];uid=1;bullets=[];G.evDone={};
  G.res=[0,1].map(s=>{const r={};for(const k of TY(s))r[k]=G.army[s][k]||0;return r;});G.spawnQ=[];G.cavSlot=[0,0];
  for(const s of[0,1])for(const k of TY(s)){clSpawn(s,k,0);if(KD[k].two)clSpawn(s,k,1);}
  if(MAP.def.mines)layMines();else G.mines=[];
  G.csel=[0,0];G.cpu={t:0,hold:0,react:1.5,aimErr:0,lastA:false};G.state='battle';
  if(G.era==='ww2'){snapDeploy();G.state='deploy';G.deployT=40;G.ready=[false,isCPU(1)];msg(0,'Rozstaw oddziały w swojej strefie. Start = gotowi.');}
  else msg(0,'Oddziały wchodzą na pole. Sterujesz jednym naraz – X, Y, B lub LB/RB.');}
const resLeft=s=>TY(s).reduce((a,k)=>a+(G.res[s][k]||0),0);
function clVictory(){const alive=[0,0];for(const u of units)if(!u.dead&&!u.gone)alive[u.side]++;
  const l0=alive[0]+resLeft(0)===0,l1=alive[1]+resLeft(1)===0;
  const lost=s=>SIDE[s].lose||`${SIDE[s].name} stracili wszystkie oddziały`;
  if(l0&&l1)endBattle(-1,'Obie armie wyczerpane');else if(l0)endBattle(1,lost(0));else if(l1)endBattle(0,lost(1));}
function clStep(dt){G.t+=dt;
  for(let p=0;p<2;p++)if(humanOf(p)>=0)clPlayer(p);
  if(G.state==='deploy'){for(let p=0;p<2;p++)clAutoSel(p);deployStep(dt);return;}
  if(G.state!=='battle')return;
  if(G.mode==='cpu')cpuPick(dt);
  const inputs={},acw=G.era==='acw';
  for(let p=0;p<2;p++){const u=clSel(p);if(!u||u.state==='enter')continue;
    if(isCPU(p))inputs[u.id]=cpuClassic(u,dt);else{const c=input.ctl[p];inputs[u.id]={x:c.lx,y:c.ly,A:acw?(c.b.a||c.b.rt):c.b.a,R:!acw&&c.b.rt,human:true};}}
  for(const u of units)clUpdate(u,dt,inputs[u.id]||null);
  trackVel(dt);updBullets(dt);clMelee(dt);updProjs(dt);clSpawnTick(dt);eraTick3(dt);scenTick(dt);
  for(let p=0;p<2;p++)clAutoSel(p);
  if(G.state==='battle')clVictory();}
/* --- grafika trybu klasycznego --- */
function clGround(){if(G.state==='deploy'){ctx.globalAlpha=.13;ctx.fillStyle=SIDE[0].ui;ctx.fillRect(0,0,DEPLOY,H);ctx.fillStyle=SIDE[1].ui;ctx.fillRect(W-DEPLOY,0,DEPLOY,H);ctx.globalAlpha=1;ctx.fillStyle='rgba(255,255,255,.7)';for(let y=30;y<H;y+=8){ctx.fillRect(DEPLOY,y,2,4);ctx.fillRect(W-DEPLOY-1,y,2,4);}}
  for(let p=0;p<2;p++){const u=clSel(p);if(!u)continue;const S=SIDE[p],hum=humanOf(p)>=0,kd=kdOf(u);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const m of u.men)if(m.alive&&!m.wrap){x0=Math.min(x0,m.x);y0=Math.min(y0,m.y);x1=Math.max(x1,m.x);y1=Math.max(y1,m.y);}
  if(u.type==='art'||u.type==='tank'||u.type==='ele'){const w=u.type==='art'?0:12;x0=Math.min(x0,u.x-w);x1=Math.max(x1,u.x+w);}
  if(u.type==='art'||u.type==='tank'||u.type==='ele'){y0=Math.min(y0,u.y);y1=Math.max(y1,u.y);}
  if(x0>1e8||y0>1e8)continue;ctx.save();ctx.strokeStyle=S.ui;ctx.globalAlpha=hum?.55+.35*Math.sin(G.t*6):.4;ctx.setLineDash(hum?[3,3]:[1,4]);
  ctx.beginPath();ctx.ellipse((x0+x1)/2,(y0+y1)/2,Math.max(4,(x1-x0)/2+12),Math.max(4,(y1-y0)/2+8),0,0,TAU);ctx.stroke();ctx.setLineDash([]);
  if(hum&&(u.coneOn||u.tAim))coneLines(u,S);
  if(kd.ai==='flat'&&hum&&u.reload<=0&&!u.coneOn){const rg=kd.range||CLS.inf.range;ctx.globalAlpha=.18;ctx.fillStyle=S.ui;const dir=clDir(p);for(const m of u.men)if(m.alive)ctx.fillRect(Math.round(dir>0?m.x+8:m.x-8-rg),Math.round(m.y),rg,1);}
  if(u.key==='mg'&&hum&&u.firing){const g=u.men.find(m=>m.alive);if(g){const dir=clDir(p);ctx.globalAlpha=.25;ctx.strokeStyle=S.ui;ctx.beginPath();ctx.moveTo(g.x+dir*8,g.y);ctx.lineTo(g.x+dir*380,g.y+u.mgY);ctx.stroke();}}
  ctx.restore();}}
const BULLET_LOOK={musket:['#fff3c4',2,1],rifle:['#fff3c4',2,1],mg:['#ffe070',3,1],pilum:['#6a4a2a',6,1],bolt:['#4e3520',7,1],shell:['#fff0b0',3,2]};
function clSprites(){for(const u of units){if(!u.aiming||u.dead||u.gone)continue;const[x,y]=P(u.x,u.y),X=Math.round(x)-17,Y=Math.round(y)+4;
    const mn=u.aimMin!=null?u.aimMin:(u.minR||SPEC.art.min),mx=u.aimMax||artMaxRange(u),f=clamp((u.aimR-mn)/(mx-mn),0,1);
    ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(X,Y,34,7);ctx.fillStyle=SIDE[u.side].ui;ctx.fillRect(X+1,Y+1,Math.round(32*f),5);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(X+11,Y+1,1,5);ctx.fillRect(X+22,Y+1,1,5);
    if(u.type==='art'&&!u.fixedElev){const dir=clDir(u.side),ea=(u.elev||20)*Math.PI/180,hi=u.elev>=45;ctx.strokeStyle=hi?'#ffd27a':'#e8e2d0';ctx.beginPath();ctx.moveTo(x+dir*6,y-6);ctx.lineTo(x+dir*(6+Math.cos(ea)*16),y-6-Math.sin(ea)*16);ctx.stroke();
      txt(`${Math.round(u.elev)}°`,x+dir*24,y-16,13,hi?'#ffd27a':'#e8e2d0','center');}}
  for(const b of bullets){const[x,y]=P(b.x,b.y),L=BULLET_LOOK[b.kind]||BULLET_LOOK.musket;ctx.fillStyle=L[0];ctx.fillRect(Math.round(x)-(b.vx<0?L[1]:0),Math.round(y)-8-(b.kind==='pilum'?2:0),L[1],L[2]);}
  if(typeof eraSprites==='function')eraSprites();}
function clLabels(){for(let p=0;p<2;p++){const u=clSel(p);if(!u)continue;const al=u.men.filter(m=>m.alive&&!m.wrap);if(!al.length)continue;const[x,y]=P(u.x,Math.min(...al.map(m=>m.y),u.y));
  const off=u.type==='cav'?(u.lance?34:30):u.type==='tank'?26:u.type==='ele'?38:24;
  if(humanOf(p)>=0)txt(unitName(u),x,y-off,14,SIDE[p].ui,'center');else txt('▼ komputer',x,y-off,13,SIDE[p].ui,'center');}}
function acwStatus(u){
  if(u.type==='inf')return(u.reload>0?'Ładowanie':'Gotowi – A: salwa')+(u.s>.5?' · kolumna':' · szyk');
  if(u.lance)return u.state==='idle'?'Stępa – ustaw się, A: szarża':`SZARŻA · ${u.form==='line'?'linia':u.form==='wedge'?'klin':'jeden za drugim'} · A: szyk`;
  if(u.type==='cav')return u.state==='idle'?'Czeka – drążek w przód: ruszają':u.state==='halt'?(u.rearT>0?'Konie stają dęba!':'Stoją – ruch w pionie i w przód, A: cięcie'):u.gallop?'GALOP – A: cięcie, w tył: stój':'Kłus – A: cięcie, w tył: stój';
  const mn=u.minR||SPEC.art.min;return u.aiming?`Siła ${Math.round((u.aimR-mn)/(artMaxRange(u)-mn)*100)}%`+(u.fixedElev?'':` · kąt ${Math.round(u.elev)}° ${u.elev>=45?'wysoki':'płaski'}`):u.reload>0?'Ładowanie':'Gotowa – trzymaj A, puść = strzał';}
function clPanel(p){const u=clSel(p),S=SIDE[p],w=280,h=58,x=p===0?8:W-8-w,y=H-h-8;
  ctx.fillStyle='rgba(12,14,12,.8)';ctx.fillRect(x,y,w,h);ctx.fillStyle=S.uiD;ctx.fillRect(x,y,w,2);
  ctx.fillStyle='rgba(12,14,12,.7)';ctx.fillRect(x,y-20,w,18);txt(ERA.hint,x+8,y-6,15,'#c9b98a');
  if(!u){txt('Brak oddziałów na polu',x+10,y+30,18,'#aaa');return;}const kd=kdOf(u);
  txt(`${unitName(u)} · ${typeName(u)}`,x+8,y+18,18,S.ui);txt(u.type==='tank'?(u.track?'Gąsienica zerwana!':'Sprawny'):u.type==='ele'?`Wytrzymałość ${u.hp}/4`:`${kd.label||'Ludzie'} ${u.n}/${u.men.length}`,x+8,y+34,16,u.track||u.panicT>0?'#ff9a7a':'#e8e2d0');
  if(u.shotsMax!==undefined)txt(`Amunicja ${u.shots}/${u.shotsMax}`,x+104,y+34,15,u.shots===0?'#ff7a60':u.shots<=3?'#e0b24a':'#cfc6a8');
  const st=u.state==='enter'?'Nadciąga z odwodu…':kd.status?kd.status(u):acwStatus(u);
  txt(st,x+8,y+50,16,'#cfc6a8');
  const rmax=u.reloadMax||(u.type==='art'?(u.reloadBase||SPEC.art.reload)*1.9:CLS.inf.reload*1.4);
  if(u.reload>0&&u.type!=='cav')bar(x+206,y+28,64,5,1-u.reload/rmax,'#d0a050');
  if(u.key==='mg')bar(x+206,y+38,64,4,u.heat||0,u.over?'#e05a4a':'#e0a060');}
function clHUD(){ctx.fillStyle='rgba(10,12,10,.8)';ctx.fillRect(0,0,W,26);ctx.fillStyle='#6a5a30';ctx.fillRect(0,26,W,1);
  for(let p=0;p<2;p++){const S=SIDE[p],r=G.res[p],sp=TY(p).length>4?36:42;let x=p===0?10:W-10;
    txt(S.name.toUpperCase(),x,18,18,S.ui,p===0?'left':'right');const nw=Math.max(104,Math.ceil(ctx.measureText(S.name.toUpperCase()).width)+14);x+=p===0?nw:-nw;
    for(const k of TY(p)){const n=r[k]||0,ix=p===0?x:x-30;chipIcon(k,ix,7,n>0?S.ui:'#5a4a44');txt(`×${n}`,ix+13,18,16,n>0?'#e8e2d0':'#6a625a');x+=p===0?sp:-sp;}}
  txt((VARIANTS[G.variant].hud||ERA.name).toUpperCase(),W/2,18,16,'#c9a24a','center',false,false);txt(weatherLabel(),W/2,44,16,'#d8cfb2','center');
  for(let p=0;p<2;p++)if(humanOf(p)>=0)clPanel(p);
  drawMsgs();
  if(G.state==='deploy'){ctx.fillStyle='rgba(10,12,10,.75)';ctx.fillRect(W/2-210,54,420,70);
    txt(`Rozstaw wojska · ${Math.max(0,Math.ceil(G.deployT))} s`,W/2,82,26,'#f0e2b0','center',true);txt('Drążek: przesuń oddział · RT: obróć czołg · Start: gotowi',W/2,100,15,'#c9b98a','center');
    for(let p=0;p<2;p++){const r=G.ready[p]||isCPU(p);txt(`${SIDE[p].name}: ${r?'GOTOWI':'Start = gotowi'}`,W/2+(p?105:-105),118,16,r?'#9fe07a':SIDE[p].ui,'center');}}}


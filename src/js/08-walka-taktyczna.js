/* ================= WALKA ================= */
function reloadMod(u){return(G.weather==='rain'?1.4:1)*(u.morale<40?1.25:1);}
function randAlive(e){const a=e.men.filter(m=>m.alive);return a.length?a[Math.floor(R()*a.length)]:null;}
function flankOf(e,fx,fy){if(e.type==='inf'&&e.form==='sq')return 1;const a=Math.abs(angDiff(e.fa,Math.atan2(fy-e.y,fx-e.x)));return a<.9?1:a<2.2?1.35:1.7;}
function coverAt(m,fx,fy){let c=TCOVER[tAt(m.x,m.y)];const d=dist(m.x,m.y,fx,fy)||1;const bx=m.x+(fx-m.x)/d*9,by=m.y+(fy-m.y)/d*9;const bt=tAt(bx,by);
  if(bt===T.WALL||bt===T.HOUSE)c=Math.min(c,.55);return c;}
function hitMods(u,e,m){let p=1;
  p*=e.type==='inf'?(e.form==='col'?1.25:e.form==='sq'?1.3:1):e.type==='cav'?1.15:.8;
  const hs=hAt(u.x,u.y),ht=hAt(e.x,e.y);p*=hs>ht?1.2:hs<ht?.85:1;
  p*=1-Math.min(.5,(smokeAt(u.x,u.y)+smokeAt(m.x,m.y))*.1);
  if(G.weather==='rain')p*=.8;if(u.morale<40)p*=.8;return p;}
function canSee(u,e,d){if(G.weather==='fog'&&d>170)return false;const t=tAt(e.x,e.y);
  if(t===T.WHEAT&&e.firedT<=0&&d>100)return false;if(t===T.FOREST&&e.firedT<=0&&d>150)return false;return true;}
function findTarget(u,range,cone,minR=0){let best=null,bs=1e9;
  for(const e of units){if(e.side===u.side||e.dead||e.gone)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>range+8||d<minR)continue;
    if(Math.abs(angDiff(u.fa,Math.atan2(e.y-u.y,e.x-u.x)))>cone)continue;if(!canSee(u,e,d))continue;
    const s=d+(e.rout?70:0);if(s<bs){bs=s;best=e;}}return best;}
function killMan(e,m,kind,fl=1){if(!m.alive)return;if(e.type==='tank'){tankDestroy(e,m,kind);return;}if(e.type==='ele'){eleWound(e,m,kind);return;}m.alive=false;G.stats[e.side].lost++;
  const cav=e.type==='cav',dir=e.side===0?1:-1;
  const d={x:m.x,y:m.y,ox:0,side:e.side,cav,crew:e.type==='art',lance:e.lance,hc:m.hc||0,right:Math.cos(e.fa)>=0,kind,t:0,T:kind==='drown'?1.5:cav?1.0:.8,flee:cav&&kind!=='drown'&&R()<.4,dir};
  G.dying.push(d);
  if(d.flee)G.loose.push({x:m.x,y:m.y,vx:-dir*(50+R()*20),vy:0,hc:d.hc,right:dir<0,anim:0});
  if(kind==='drown'){for(let i=0;i<10;i++)parts.push({k:'dirt',x:m.x,y:m.y,z:0,vx:(R()-.5)*30,vy:(R()-.5)*10,vz:50+R()*50,life:0,max:.7,c:'#d8ecf4'});AU.impact(m.x,true);}
  else dustAt(m.x,m.y-2,3);
  e.morale-=(kind==='melee'?4:kind==='ball'?7:6)*fl;e.hitFlash=.25;e.underFire=2.5;const hp=humanOf(e.side);if(hp>=0)rumble(hp,.1,.3,80);}
function breakBridge(x,y,side){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=GW||ty>=GH)return;const i=ty*GW+tx;if(MAP.t[i]!==T.BRIDGE)return;MAP.t[i]=T.WATER;(MAP.broken||(MAP.broken=new Set())).add(i);
  const g=G.tctx,X=tx*TS,Y=ty*TS;
  if(g){g.fillStyle='#2e5a78';g.fillRect(X+1,Y,TS-2,TS);g.fillStyle='#1c3a50';g.fillRect(X+1,Y,TS-2,3);
    for(let k=0;k<7;k++){g.fillStyle=R()<.5?'#8a6640':'#4a3220';if(R()<.5)g.fillRect(R()<.5?X:X+TS-3,Y+Math.floor(R()*(TS-2)),3,1);else g.fillRect(X+1+Math.floor(R()*(TS-3)),R()<.5?Y:Y+TS-2,1,3);}}
  MAP.water.push({x:X,y:Y,p:R()*12,q:Math.floor(R()*10)});
  for(let k=0;k<16;k++)parts.push({k:'dirt',x:X+6,y:Y+6,z:2,vx:(R()-.5)*70,vy:(R()-.5)*40,vz:60+R()*80,life:0,max:1,c:R()<.5?'#8a6640':'#5a4026'});
  msg(side,'Most trafiony – w pomoście ziewa dziura!');}

function tryVolley(u,manual){
  if(G.state!=='battle'||u.type!=='inf'||u.reload>0||u.formT>0||u.rout||u.n<=0)return false;
  const range=SPEC.inf.range*(1+.15*hAt(u.x,u.y));
  const t=findTarget(u,range,u.form==='sq'?4:.6);
  if(!t&&!manual)return false;
  u.reload=SPEC.inf.reload*reloadMod(u);u.firedT=3;
  const alive=u.men.filter(m=>m.alive),k=Math.max(1,Math.round(alive.length*FORM[u.form].fire));
  const shooters=u.form==='sq'?alive.filter((m,i)=>i%2===0).slice(0,k):alive.slice(0,k);
  const fl=t?flankOf(t,u.x,u.y):1;
  for(const m of shooters){const a=t?Math.atan2(t.y-m.y,t.x-m.x):u.fa;const mx=m.x+Math.cos(a)*7,my=m.y-7+Math.sin(a)*3;
    parts.push({k:'flash',x:mx,y:my,life:0,max:.07});addSmoke(mx,my,1,false);G.stats[u.side].shots++;
    if(t){const tm=randAlive(t);if(!tm)break;const d=dist(m.x,m.y,tm.x,tm.y);
      const p=.33*(1-.55*Math.min(1,d/range))*coverAt(tm,m.x,m.y)*hitMods(u,t,tm)*Math.sqrt(fl);
      if(R()<p){killMan(t,tm,'shot',fl);G.stats[u.side].hits++;u.kills++;}else dustAt(tm.x+(R()-.5)*16,tm.y+(R()-.5)*6,1);}
    else dustAt(u.x+Math.cos(u.fa)*range*.7+(R()-.5)*20,u.y+Math.sin(u.fa)*range*.7+(R()-.5)*20,1);}
  if(t){t.morale-=1.5*fl;t.underFire=2.5;}
  AU.musket(u.x,k);return true;
}
function artMaxRange(u){if(u.maxR)return u.maxR*(1+.15*hAt(u.x,u.y));return G.rules==='classic'?580*(1+.15*hAt(u.x,u.y)):SPEC.art.range*(1+.18*hAt(u.x,u.y));}
function fireCannon(u,range,manual){
  if(G.state!=='battle'||u.reload>0||u.setup>0||u.rout||u.n<=0)return false;if(!useShot(u))return false;
  u.reload=(u.reloadBase||SPEC.art.reload)*([9,1.9,1.35,1][u.n]||1)*reloadMod(u)*(G.rules==='classic'&&hAt(u.x,u.y)>0?.85:1);u.firedT=3;u.recoil=1;const MIN=u.minR||SPEC.art.min;
  const c=Math.cos(u.fa),s=Math.sin(u.fa),gx=u.x+c*14,gy=u.y-5+s*14,hp=humanOf(u.side);
  if(!u.noPowder&&G.weather==='rain'&&R()<.12){addSmoke(gx,gy,2,false);AU.fizzle(gx);msg(u.side,`${unitName(u)}: niewypał, mokry proch!`);return true;}
  if(u.noPowder){dustAt(gx,gy,4);AU.tone(90,.25,'triangle',.3,0,-40);AU.burst(.3,600,'lowpass',1,.4,AU.pan(u.x));}else if(u.key==='mor'){parts.push({k:'flash',x:gx,y:gy-4,life:0,max:.08});addSmoke(gx,gy-4,2,false);AU.burst(.4,500,'lowpass',1,.6,AU.pan(u.x));}else{parts.push({k:'flash',x:gx,y:gy,life:0,max:.13,big:1});addSmoke(gx,gy,6,true);AU.cannon(u.x);}
  G.shake=Math.max(G.shake,u.ammo==='ball'?3:2.5);if(hp>=0)rumble(hp,.7,.4,240);G.stats[u.side].shots++;
  if(u.ammo==='ball'){const mr=artMaxRange(u);const clp=G.rules==='classic';const rr=clamp(range,MIN,mr)*(1+(R()-.5)*(manual?(clp?.025:.05):.12));const a=u.fa+(R()-.5)*(manual?(clp?.012:.035):.07);
    const cl=G.rules==='classic',el=u.fixedElev||u.elev||20,high=cl&&el>=45;
    projs.push({x:gx,y:gy,sx:gx,sy:gy+5,tx:u.x+Math.cos(a)*rr,ty:u.y+Math.sin(a)*rr,t:0,T:cl?.3+rr/650*(1+(el-20)/40):.3+rr/520,H:cl?Math.min(230,rr*Math.tan(el*Math.PI/180)/4):rr*.13,h:0,a,bounce:cl?(high?0:1):2,side:u.side,src:u.key,hit:new Set(),low:false,rr,kill:cl?(high?1:.5):null,kind:u.projKind||'ball',ap:u.key==='mor'?.5:u.key==='ona'?.3:.4,smoke:u.ammo2==='smoke'});}
  else{const RR=170;for(let i=0;i<16;i++){const a=u.fa+(R()-.5)*.62,l=RR*(.45+R()*.55);parts.push({k:'pellet',x:gx,y:gy,x2:gx+Math.cos(a)*l,y2:gy+Math.sin(a)*l,life:0,max:.12});}
    for(const e of units){if(e.side===u.side||e.dead||e.gone)continue;if(dist(u.x,u.y,e.x,e.y)>RR+30)continue;let hits=0;const fl=flankOf(e,u.x,u.y);
      for(const m of e.men){if(!m.alive)continue;const d=dist(gx,gy,m.x,m.y);if(d>RR)continue;if(Math.abs(angDiff(u.fa,Math.atan2(m.y-gy,m.x-gx)))>.33)continue;
        const p=(.5*(1-d/RR)+.1)*coverAt(m,gx,gy)*(e.type==='cav'?1.2:1);if(R()<p){killMan(e,m,'shot',fl);hits++;}}
      if(hits){G.stats[u.side].hits+=hits;e.morale-=6;e.underFire=3;}}}
  return true;
}
function updProjs(dt){
  for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.t+=dt;const k=Math.min(1,p.t/p.T);p.x=lerp(p.sx,p.tx,k);p.y=lerp(p.sy,p.ty,k);p.h=Math.sin(Math.PI*k)*p.H;
    if(p.low){for(const e of units){if(e.dead||e.gone||dist(p.x,p.y,e.x,e.y)>32)continue;
      if(e.type==='tank')continue;for(const m of e.men){if(!m.alive||p.hit.has(m))continue;if(dist(p.x,p.y,m.x,m.y)<6){p.hit.add(m);if(R()<(p.kill!=null?p.kill:.6)*eff(p.src,e.key)){killMan(e,m,'ball',1.2);if(e.side!==p.side)G.stats[p.side].hits++;}}}}
      if(R()<.5)dustAt(p.x,p.y,1);}
    if(k>=1){projs.splice(i,1);impact(p);}}
}
function impact(p){if(p.kind==='tshell')return tshellImpact(p);if(p.kind==='arrow'||p.kind==='sling')return arrowImpact(p);if(p.kind==='gren')return grenImpact(p);if(p.smoke)return smokeCloud(p.tx,p.ty);const t=tAt(p.tx,p.ty);
  if(t===T.WATER||t===T.FORD){for(let i=0;i<10;i++)parts.push({k:'dirt',x:p.tx,y:p.ty,z:0,vx:(R()-.5)*30,vy:(R()-.5)*16,vz:60+R()*60,life:0,max:.8,c:'#bcd6e2'});AU.impact(p.tx,true);}
  else{for(let i=0;i<12;i++)parts.push({k:'dirt',x:p.tx,y:p.ty,z:0,vx:(R()-.5)*50,vy:(R()-.5)*30,vz:50+R()*70,life:0,max:.9,c:R()<.5?'#5a4630':'#7a6446'});
    if(t===T.BRIDGE)breakBridge(p.tx,p.ty,p.side);else if(t===T.PALISADE||t===T.FENCE)breakPalisade(p.tx,p.ty);else if(t===T.WIRE)crushWire(p.tx,p.ty);else if(t!==T.HOUSE&&t!==T.ROCK)decalCrater(p.tx,p.ty);areaObstacleHit(p.tx,p.ty,14,12,p.src);AU.impact(p.tx);G.shake=Math.max(G.shake,1.5);}
  const RK=G.rules==='classic'&&p.rr?10*(p.rr<300?2:p.rr<600?1.5:1):9;
  for(const e of units){if(e.dead||e.gone)continue;const de=dist(p.tx,p.ty,e.x,e.y);if(de>55+RK)continue;
    if(e.type==='tank'){if(de<RK+6)tankHit(e,(p.ap||.35)*eff(p.src,e.key),p.side,p.sx,p.sy);continue;}
    if(e.key==='leg'&&e.rf==='testudo'&&de<RK+18){e.rf='line';e.formT=.8;msg(e.side,`${unitName(e)}: kamień rozbił żółwia!`);}
    for(const m of e.men){if(!m.alive||p.hit.has(m))continue;const dm=dist(p.tx,p.ty,m.x,m.y);if(dm<RK+(e.type==='ele'?7:0)){p.hit.add(m);if(R()<(p.kill!=null?p.kill:.85-.35*dm/RK)*eff(p.src,e.key)){killMan(e,m,'ball',1.2);if(e.side!==p.side)G.stats[p.side].hits++;}}}
    e.morale-=e.side===p.side?4:10;e.underFire=3;}
  if(p.bounce>0&&t!==T.BRIDGE&&t!==T.FOREST&&t!==T.ROCK&&t!==T.HOUSE&&t!==T.MUD&&t!==T.WATER){const L=55+R()*25;
    projs.push({x:p.tx,y:p.ty,sx:p.tx,sy:p.ty,tx:p.tx+Math.cos(p.a)*L,ty:p.ty+Math.sin(p.a)*L,t:0,T:.24,H:5,h:0,a:p.a,bounce:p.bounce-1,side:p.side,src:p.src,hit:p.hit,low:true,kill:p.kill});}
}
let meleeTick=0;
function updMelee(dt){meleeTick-=dt;if(meleeTick>0)return;meleeTick=.25;
  for(let i=0;i<units.length;i++){const a=units[i];if(a.dead||a.gone)continue;for(let j=i+1;j<units.length;j++){const b=units[j];
    if(b.dead||b.gone||b.side===a.side)continue;if(dist(a.x,a.y,b.x,b.y)>SPEC[a.type].r+SPEC[b.type].r+4)continue;
    a.inMelee=b.inMelee=.6;meleeRound(a,b);meleeRound(b,a);if(R()<.4)AU.clash((a.x+b.x)/2);}}}
function meleeRound(a,b){const fl=flankOf(b,a.x,a.y);
  for(const m of a.men){if(!m.alive)continue;let near=null,nd=a.type==='cav'?12:9;
    for(const o of b.men){if(!o.alive)continue;const d=dist(m.x,m.y,o.x,o.y);if(d<nd){nd=d;near=o;}}if(!near)continue;
    let p;if(a.type==='cav'){p=.2*(a.charging?2.3:1)*(a.lance&&a.charging?1.3:1);if(b.type==='inf'&&b.form==='sq')p*=.2;if(b.type==='art')p*=1.4;}
    else if(a.type==='inf')p=b.type==='cav'?(a.form==='sq'?.24:.05):b.type==='art'?.12:.07;else p=.03;
    if(a.rout)p*=.3;if(a.formT>0)p*=.5;p*=Math.sqrt(fl);
    if(R()<p){killMan(b,near,'melee',fl);parts.push({k:'spark',x:near.x,y:near.y-6,vx:(R()-.5)*30,vy:-20,life:0,max:.25});}}}
function rally(side,cx,cy){if(G.rallyCd[side]>0){if(humanOf(side)>=0)AU.bad();return false;}G.rallyCd[side]=40;
  for(const u of units){if(u.side!==side||u.dead||u.gone)continue;if(dist(u.x,u.y,cx,cy)<160){u.morale=Math.min(100,u.morale+40);if(u.rout&&u.morale>30)u.rout=false;}}
  parts.push({k:'ring',x:cx,y:cy,life:0,max:1,c:SIDE[side].ui});AU.bugle(BUG.rally);msg(side,'Zryw! Oddziały w pobliżu odzyskują ducha.');return true;}
function setForm(u,f){if(u.form===f)return;u.form=f;u.formT=u.type==='inf'?1.3:.6;}


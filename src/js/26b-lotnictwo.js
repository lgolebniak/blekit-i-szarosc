/* ================= LOTNICTWO (XX wiek): nalot na wysokości wybranego oddziału ================= */
// LT: samolot przelatuje nad polem na wysokości wybranego oddziału i zrzuca bomby nad połową wroga.
// Ckm pod jego torem może go zestrzelić. Każda strona ma kilka nalotów na bitwę (odstęp 20 s).
FACTIONS.pl.air={name:'PZL.23 Karaś',n:2};FACTIONS.de.air={name:'Ju 87 Stuka',n:2,siren:true};
const AIR={alt:70,spd:230,bombs:5,cd:20,lead:.8};// bomba leci dalej z prędkością samolotu (lead) – pilot zrzuca ją z wyprzedzeniem
function airReset(){G.planes=[];G.bombs=[];G.air=[0,1].map(s=>FAC[s].air?FAC[s].air.n:0);G.airCd=[0,0];G.cpuAirT=30+R()*15;}
function callAir(side,y){const A=FAC[side].air;if(!A||G.state!=='battle')return false;
  if(G.air[side]<=0||G.t<G.airCd[side]){if(humanOf(side)>=0)AU.bad();return false;}
  G.air[side]--;G.airCd[side]=G.t+AIR.cd;const pl={side,dir:clDir(side),x:side===0?-60:W+60,y:clamp(y,40,H-20),alt:AIR.alt,bombs:AIR.bombs,dropX:0,down:false,siren:!!A.siren,sir:false};
  pl.snd=planeSound(pl);G.planes.push(pl);msg(side,`Nalot! ${A.name} nad polem bitwy.`);return true;}
function planeSound(pl){if(!AU.ok())return null;const c=AU.ctx,o=c.createOscillator(),o2=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();
  o.type=o2.type='sawtooth';o.frequency.value=82;o2.frequency.value=84.5;f.type='lowpass';f.frequency.value=700;g.gain.value=0;
  o.connect(f);o2.connect(f);f.connect(g);let p=null;if(c.createStereoPanner){p=c.createStereoPanner();g.connect(p);p.connect(AU.master);}else g.connect(AU.master);
  o.start();o2.start();g.gain.setTargetAtTime(.14,c.currentTime,.4);return{o,o2,g,p};}
function planeSoundEnd(s){if(!s||!AU.ctx)return;const t=AU.ctx.currentTime;s.g.gain.setTargetAtTime(0,t,.3);s.o.stop(t+1.5);s.o2.stop(t+1.5);}
function airTick(dt){if(!G.planes)return;
  // komputer wzywa nalot na wysokości najliczniejszego oddziału gracza
  if(G.mode==='cpu'&&G.state==='battle'&&G.air[1]>0&&G.t>G.airCd[1]){G.cpuAirT-=dt;if(G.cpuAirT<=0){G.cpuAirT=25+R()*20;
    const tg=units.filter(u=>u.side===0&&!u.dead&&!u.gone&&u.state!=='enter'&&u.x<W*.6).sort((a,b)=>(b.n+(b.type==='tank'?3:0))-(a.n+(a.type==='tank'?3:0)))[0];if(tg)callAir(1,tg.y);}}
  for(let i=G.planes.length-1;i>=0;i--){const pl=G.planes[i];
    if(pl.down){pl.x+=pl.dir*AIR.spd*.7*dt;pl.alt-=45*dt;if(R()<dt*20)parts.push({k:'smoke',x:pl.x,y:pl.y-pl.alt,vx:0,vy:-4,r:3,g:6,life:0,max:2.5,a:.6});
      if(pl.alt<=0){blast(pl.x,pl.y,14,.6,-1,'air');addSmoke(pl.x,pl.y,6,true);(G.fires||(G.fires=[])).push({x:pl.x,y:pl.y,t:20});planeSoundEnd(pl.snd);G.planes.splice(i,1);}continue;}
    pl.x+=pl.dir*AIR.spd*dt;if(pl.snd&&pl.snd.p)pl.snd.p.pan.value=AU.pan(clamp(pl.x,0,W));
    const over=pl.dir>0?pl.x>W/2:pl.x<W/2;
    if(over&&pl.siren&&!pl.sir){pl.sir=true;AU.tone(420,1.6,'sawtooth',.07,0,700,2200);}
    const fall=Math.sqrt(2*pl.alt/260),lx=pl.x+pl.dir*AIR.spd*AIR.lead*fall,enemyHalf=pl.dir>0?lx>W/2:lx<W/2;
    if(enemyHalf&&pl.bombs>0&&Math.abs(pl.x-pl.dropX)>24&&lx>10&&lx<W-10&&units.some(e=>e.side!==pl.side&&!e.dead&&!e.gone&&Math.abs(e.x-lx)<40&&Math.abs(e.y-pl.y)<55)){
      pl.dropX=pl.x;pl.bombs--;G.bombs.push({x:pl.x,y:pl.y+(R()-.5)*16,h:pl.alt,vh:0,vx:pl.dir*AIR.spd*AIR.lead,side:pl.side});AU.tone(1300,.7,'sine',.04,0,-900);}
    // ogień przeciwlotniczy: ckm pod torem lotu
    for(const u of units){if(u.side===pl.side||u.key!=='mg'||u.dead||u.gone||u.over||u.state==='enter')continue;const g=u.men.find(m=>m.alive);if(!g)continue;
      if(Math.abs(g.y-pl.y)<90&&Math.abs(g.x-pl.x)<150){u.aaT=(u.aaT||0)-dt;if(u.aaT<=0){u.aaT=.12;parts.push({k:'pellet',x:g.x,y:g.y-6,x2:pl.x+(R()-.5)*20,y2:pl.y-pl.alt+(R()-.5)*10,life:0,max:.1});if(R()<.5)AU.burst(.05,1900,'bandpass',1,.1,AU.pan(g.x));}
        if(R()<dt*.45){pl.down=true;msg(u.side,`${unitName(u)} zestrzelił samolot!`);AU.impact(pl.x);}}}
    if(pl.x<-80||pl.x>W+80){planeSoundEnd(pl.snd);G.planes.splice(i,1);}}
  for(let i=G.bombs.length-1;i>=0;i--){const b=G.bombs[i];b.vh+=260*dt;b.h-=b.vh*dt;b.x+=b.vx*dt;
    if(b.h<=0){G.bombs.splice(i,1);blast(b.x,b.y,20,.9,b.side,'air');G.shake=Math.max(G.shake,3.5);AU.cannon(b.x);addSmoke(b.x,b.y-4,4,true);
      for(const e of units)if(e.type==='tank'&&!e.dead&&!e.gone&&dist(e.x,e.y,b.x,b.y)<20)tankHit(e,.5,b.side,b.x,b.y-40);}}}
// rysowanie: samoloty i spadające bomby nad polem (z cieniem na ziemi)
function eraSprites(){if(!G.planes)return;
  for(const b of G.bombs){const[x,y]=P(b.x,b.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x)-1,Math.round(y),3,1);ctx.fillStyle='#2a2a26';ctx.fillRect(Math.round(x),Math.round(y-b.h)-2,2,4);}
  for(const pl of G.planes)drawPlane(pl);}
function drawPlane(pl){const[gx,gy]=P(pl.x,pl.y),S=SIDE[pl.side],c=pl.down?'#3a3630':(S.veh||'#6a6a5a');
  ctx.fillStyle=`rgba(0,0,0,${Math.max(.08,.3-pl.alt*.002)})`;ctx.fillRect(Math.round(gx)-11,Math.round(gy),22,2);ctx.fillRect(Math.round(gx)-2,Math.round(gy)-3,5,8);
  const x=Math.round(gx),y=Math.round(gy-pl.alt),r=spr(x,y,pl.dir>0);
  r(-11,-2,21,4,c);r(-11,1,21,1,'rgba(0,0,0,.25)');r(-13,-6,3,5,c);r(-14,-2,5,1,c);
  r(-4,1,9,2,'#2a2a28');r(-3,-1,7,1,'rgba(255,255,255,.25)');r(-1,-4,4,2,'#9ab4c8');
  r(10,-1,2,2,'#1a1a18');r(12,-4,1,8,'rgba(230,230,230,.5)');
  if(S.helm==='de'){r(-7,-2,1,3,'#111');r(-8,-1,3,1,'#111');}else{r(-8,-2,2,1,'#fff');r(-6,-2,2,1,'#d4213d');r(-8,-1,2,1,'#d4213d');r(-6,-1,2,1,'#fff');}
  if(pl.down&&R()<.5){ctx.fillStyle='#ff9a40';ctx.fillRect(x-2,y-3,3,3);}}
function airHUD(){if(!G.air)return;for(let p=0;p<2;p++){if(!FAC[p].air)continue;const n=G.air[p],cd=Math.max(0,Math.ceil(G.airCd[p]-G.t));
  txt(`Lotnictwo ×${n}${n&&cd?` (${cd} s)`:''}${humanOf(p)>=0?' · LT':''}`,p?W-10:10,44,15,n?SIDE[p].ui:'#6a625a',p?'right':'left');}}

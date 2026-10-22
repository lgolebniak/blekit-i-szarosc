// Test mechaniki: husaria i ułani bez cofania, cięcie husarii w miejscu, zasięg dział, piki na sztorc, nalot.
const {chromium}=require(process.env.PW||'playwright');
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1920,height:1080}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);
  const r=await pg.evaluate(()=>{const out={};const dt=1/30;for(let i=0;i<MAPS.length;i++)prepMap(i);
    const step=(n,keys={})=>{for(let i=0;i<n;i++){for(const k of['KeyF','KeyW','KeyS','KeyD','KeyA','ShiftLeft'])KEYS[k]=!!keys[k];pollInput(dt);clStep(dt);}};
    const sel=k=>{const u=units.find(u=>u.side===0&&u.key===k&&!u.dead);if(u)G.csel[0]=u.id;return u;};
    // husaria: cofanie zablokowane, bez kopii A = cięcie w miejscu, drążek w przód = szarża
    setVariant('kirch');G.mode='pvp';G.weatherSel=1;startBattle();step(200);
    let h=sel('hus');const x0=h.x;step(40,{KeyA:1});out.husCofa=+(h.x-x0).toFixed(1);
    for(const m of h.men)m.kopia=false;step(1,{KeyF:1});out.husCiecie=h.slashT>0&&h.state==='idle';step(5);
    step(35,{KeyD:1});out.husSzarza=h.state;
    // ułani (secesja): cofanie zablokowane
    setVariant('acw');G.rules='classic';startBattle();step(200);const l=sel('lan');const lx=l.x;step(40,{KeyA:1});out.ulaniCofa=+(l.x-lx).toFixed(1);
    // słoń: cofanie zablokowane
    setVariant('rome_c');G.rules='classic';startBattle();step(200);const el=units.find(u=>u.side===1&&u.key==='ele');if(el){G.csel[1]=el.id;const ex=el.x;for(let i=0;i<40;i++){KEYS.ArrowRight=true;pollInput(dt);clStep(dt);}KEYS.ArrowRight=false;out.slonCofa=+(el.x-ex).toFixed(1);}
    // zasięg dział: nie sięga oddziałów wroga z pozycji wyjściowej
    out.zasieg={};for(const v of['acw','kirch','rome','ww2','gett']){setVariant(v);G.rules='classic';startBattle();if(G.state==='deploy')snapDeploy();step(220);
      let worst=-1e9;for(const g of units.filter(u=>u.type==='art'&&!u.dead)){const mr=artMaxRange(g);for(const e of units.filter(e=>e.side!==g.side&&!e.dead&&e.state!=='enter')){const d=Math.abs(e.x-g.x);worst=Math.max(worst,mr-d);}}
      out.zasieg[v]=Math.round(worst);}
    // piki: husaria na pikinierów w marszu i na sztorc
    const duel=form=>{let k=0;for(let n=0;n<30;n++){setVariant('kirch');G.mode='pvp';startBattle();units=[];bullets=[];projs=[];G.res=[{hus:1},{pik:1}];
      const hu=clSpawn(0,'hus'),pk=clSpawn(1,'pik');snapDeploy();const mv=(u,X,Y)=>{const dx=X-u.x,dy=Y-u.y;for(const m of u.men){m.x+=dx;m.y+=dy;m.mv=0;}u.x=X;u.y=Y;};
      mv(pk,560,300);pk.rf=form;pk.formT=0;mv(hu,330,300);Object.assign(hu,{state:'ride',form:'line',charging:true,gallop:true});
      for(let i=0;i<120;i++){for(const u of units)clUpdate(u,dt,u===hu?{x:0,y:0,A:false,human:true}:null);if(form==='line')pk.rf='line';updBullets(dt);clMelee(dt);}
      k+=4-hu.men.filter(m=>m.alive).length;}return+(k/30).toFixed(2);};
    out.husStratyPikiMarsz=duel('line');out.husStratyPikiSztorc=duel('phalanx');
    // nalot
    out.zabici=0;for(let n=0;n<3;n++){setVariant('ww2');G.mode='pvp';startBattle();snapDeploy();G.state='battle';const pre=G.stats[1].lost,t=units.find(u=>u.side===1&&u.key==='rif');
      out.nalot=callAir(0,t.y);for(let i=0;i<30*6;i++)clStep(dt);out.zabici+=G.stats[1].lost-pre;}const t=units.find(u=>u.side===1&&u.key==='rif');out.nalotyZostalo=G.air[0];out.drugiOdRazu=callAir(0,t.y);
    setVariant('ww2');startBattle();snapDeploy();G.state='battle';callAir(0,250);for(let i=0;i<50;i++)clStep(dt);
    for(const k in KEYS)KEYS[k]=false;return out;});
  await pg.waitForTimeout(100);
  const box=await pg.evaluate(()=>{drawField();drawHUD();const r=cv.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};});
  await pg.screenshot({path:require('path').resolve(__dirname,'../zrzuty/nalot.png'),clip:box});
  console.log(JSON.stringify(r));
  const z=Object.values(r.zasieg);
  const ok=Math.abs(r.husCofa)<1&&r.husCiecie&&r.husSzarza==='ride'&&Math.abs(r.ulaniCofa)<1&&Math.abs(r.slonCofa||0)<1&&r.slonCofa!==undefined&&z.every(v=>v<0)&&r.husStratyPikiSztorc>r.husStratyPikiMarsz&&r.nalot&&r.zabici>0&&r.nalotyZostalo===1&&!r.drugiOdRazu&&!errs.length;
  console.log(errs.join('\n')||'bez błędów strony');await b.close();if(!ok){console.error('TEST MECHANIKI NIEUDANY');process.exit(1);}console.log('Mechanika OK');})();

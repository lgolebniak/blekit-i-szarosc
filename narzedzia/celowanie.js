// Test sterowania 1939: skos piechoty, ckm na boki, czołg – kierunek, potem siła; strzał tylko w stożku ±45°.
const {chromium}=require(process.env.PW||'playwright');
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);
  const r=await pg.evaluate(()=>{setVariant('ww2');G.mode='pvp';G.weatherSel=1;for(let i=0;i<MAPS.length;i++)prepMap(i);startBattle();G.state='battle';
    const dt=1/30,step=(n,keys)=>{for(let i=0;i<n;i++){for(const k of['KeyF','KeyW','KeyS','KeyD','KeyA'])KEYS[k]=!!keys[k];pollInput(dt);clStep(dt);}};
    const sel=k=>{const u=units.find(u=>u.side===0&&u.key===k);G.csel[0]=u.id;return u;};
    const out={};
    // piechota: krótko = na wprost
    let u=sel('rif');u.reload=0;bullets.length=0;step(2,{KeyF:1});step(20,{});out.rifProsto=bullets.filter(b=>b.side===0&&b.kind==='rifle').map(b=>+(Math.atan2(b.vy,b.vx)*57.3).toFixed(1));
    // piechota: trzymaj + drążek w dół = skos
    u.reload=0;bullets.length=0;step(30,{KeyF:1,KeyS:1});step(20,{});out.rifSkos=bullets.filter(b=>b.side===0&&b.kind==='rifle').map(b=>+(Math.atan2(b.vy,b.vx)*57.3).toFixed(1));
    // ckm: seria z drążkiem w górę – kąt rośnie do 45°
    u=sel('mg');bullets.length=0;step(60,{KeyF:1,KeyW:1});step(2,{});const mg=bullets.filter(b=>b.side===0&&b.kind==='mg').map(b=>Math.atan2(b.vy,b.vx)*57.3);out.mgMin=Math.round(Math.min(...mg));out.mgMax=Math.round(Math.max(...mg));
    // czołg: trzymaj A + drążek w dół (kierunek), puść, drugie A trzymane (siła), puść
    u=sel('tank');u.reload=0;projs.length=0;const hd0=u.hd;
    step(25,{KeyF:1,KeyS:1});out.etap1=u.tAim;step(3,{});out.etap2=u.tAim;step(20,{});
    step(15,{KeyF:1});out.etap3=u.tAim;step(1,{});
    const p=projs.find(p=>p.kind==='tshell');out.czolgKat=p?+(Math.atan2(p.ty-u.y,p.tx-u.x)*57.3).toFixed(1):null;out.czolgDystans=p?Math.round(p.rr):null;out.etapPo=u.tAim;
    // czołg: drążek przed drugim A anuluje
    u.reload=0;step(10,{KeyF:1});step(2,{});step(5,{KeyD:1});out.anulowano=u.tAim===0;
    for(const k in KEYS)KEYS[k]=false;return out;});
  console.log(JSON.stringify(r));
  const ok=r.rifProsto.length&&r.rifProsto.every(a=>Math.abs(a)<1)&&r.rifSkos.length&&r.rifSkos.every(a=>a>5&&a<=45.5)&&r.mgMin<=-40&&r.etap1===1&&r.etap2===2&&r.etap3===3&&r.czolgKat>5&&r.czolgKat<=47&&r.anulowano&&!errs.length;
  console.log(errs.join('\n')||'bez błędów strony');await b.close();if(!ok){console.error('TEST CELOWANIA NIEUDANY');process.exit(1);}console.log('Celowanie OK');})();

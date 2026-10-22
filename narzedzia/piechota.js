// Test 1939: granaty z kierunkiem i odległością, granaty a czołg, padnij (km czołgu, rozjeżdżanie), przegrzewanie km czołgu.
const {chromium}=require(process.env.PW||'playwright');
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);
  const r=await pg.evaluate(()=>{const out={},dt=1/30;for(let i=0;i<MAPS.length;i++)prepMap(i);
    const fresh=()=>{setVariant('ww2');G.mode='pvp';G.weatherSel=1;startBattle();snapDeploy();G.state='battle';MAP.t.fill(T.GRASS);units=[];bullets=[];projs=[];G.res=[{rif:1,tank:1},{rif:1,tank:1}];};
    const mv=(u,X,Y)=>{const dx=X-u.x,dy=Y-u.y;for(const m of u.men){m.x+=dx;m.y+=dy;m.mv=0;}u.x=X;u.y=Y;};
    const tick=(n,inp={})=>{for(let i=0;i<n;i++){for(const u of units)clUpdate(u,dt,inp[u.id]||null);updBullets(dt);clMelee(dt);updProjs(dt);}};
    // granaty: trzymaj RT z drążkiem w dół, puść – 6 ludzi rzuca 2
    fresh();let p=clSpawn(0,'rif');snapDeploy();mv(p,300,270);
    tick(20,{[p.id]:{x:0,y:1,A:false,R:true,human:true,inp:1}});out.celujeGranatem=!!p.gAim;const kat=p.gA;
    tick(1,{[p.id]:{x:0,y:0,A:false,R:false,human:true}});out.granatyLeca=projs.filter(q=>q.kind==='gren').length;out.zostalo=p.gren;out.katGranatu=+(kat*57.3).toFixed(0);
    for(const m of p.men.slice(0,4))m.alive=false;p.cd2=0;tick(1);throwGren(p,80,0);out.granatyPrzy2Ludziach=projs.filter(q=>q.kind==='gren').length-out.granatyLeca;
    // granaty a czołg: kolejne trafienia
    fresh();p=clSpawn(0,'rif');const tk=clSpawn(1,'tank');snapDeploy();mv(p,300,270);mv(tk,380,270);tk.hd=Math.PI;const stany=[];
    for(let k=0;k<4&&!tk.dead;k++){projs.push({kind:'gren',x:tk.x,y:tk.y,sx:tk.x,sy:tk.y,tx:tk.x,ty:tk.y,t:0,T:.1,H:5,h:0,a:0,bounce:0,side:0,src:'rif',hit:new Set(),low:false});tick(6);
      stany.push(tk.dead||tk.n===0?'zniszczony':tk.track?'unieruchomiony':tk.slow?'zwalnia':'cały');}
    out.czolgPoGranatach=stany;
    // padnij: km czołgu przez 4 s do stojących i do leżących, potem przejazd przez leżących
    const kmTest=prone=>{fresh();const q=clSpawn(0,'rif'),t=clSpawn(1,'tank');snapDeploy();mv(q,500,270);mv(t,700,q.men[2].y);t.hd=Math.PI;if(prone){setProne(q,true);q.formT=0;}
      const n0=q.men.filter(m=>m.alive).length;let k=0;for(let i=0;i<30;i++){t.heat=0;t.over=false;tick(1,{[t.id]:{x:0,y:0,A:false,R:true,human:true},[q.id]:{x:0,y:0,A:false,human:true}});}return n0-q.men.filter(m=>m.alive).length;};
    let st=0,le=0;for(let i=0;i<80;i++){st+=kmTest(false);le+=kmTest(true);}out.kmStojacy=st;out.kmLezacy=le;
    fresh();const q=clSpawn(0,'rif'),t=clSpawn(1,'tank');snapDeploy();mv(q,500,270);mv(t,560,270);t.hd=Math.PI;setProne(q,true);q.cd2=99;q.gren=0;
    const n0=q.men.filter(m=>m.alive).length;tick(90,{[t.id]:{x:-1,y:0,A:false,human:true}});out.rozjechaniLezacy=n0-q.men.filter(m=>m.alive).length;
    // przegrzanie km czołgu
    fresh();const t2=clSpawn(0,'tank');snapDeploy();tick(150,{[t2.id]:{x:0,y:0,A:false,R:true,human:true}});out.kmPrzegrzany=!!t2.over;
    return out;});
  console.log(JSON.stringify(r));
  const ok=r.celujeGranatem&&r.granatyLeca===2&&r.zostalo===3&&r.katGranatu>10&&r.granatyPrzy2Ludziach===1&&r.czolgPoGranatach.slice(0,3).join()==='zwalnia,unieruchomiony,zniszczony'
    &&r.kmLezacy<r.kmStojacy*.8&&r.rozjechaniLezacy===0&&r.kmPrzegrzany&&!errs.length;
  console.log(errs.join('\n')||'bez błędów strony');await b.close();if(!ok){console.error('TEST PIECHOTY NIEUDANY');process.exit(1);}console.log('Piechota OK');})();

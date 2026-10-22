// Test 1939: stanowiska (losowanie 2–4, zajmowanie, odporność na kule, niszczenie wybuchami, ckm z taśmą), snajper, zrzut, dym, ułani.
const {chromium}=require(process.env.PW||'playwright');
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(1500);
  const r=await pg.evaluate(()=>{const out={},dt=1/30;for(let i=0;i<MAPS.length;i++)prepMap(i);
    const fresh=()=>{setVariant('ww2');G.mode='pvp';G.weatherSel=1;startBattle();snapDeploy();G.state='battle';MAP.t.fill(T.GRASS);units=[];bullets=[];projs=[];G.planes=[];G.crates=[];G.res=[{rif:20,tank:2,snp:2},{rif:20,tank:2,snp:2}];};
    const mv=(u,X,Y)=>{const dx=X-u.x,dy=Y-u.y;for(const m of u.men){m.x+=dx;m.y+=dy;m.mv=0;}u.x=X;u.y=Y;};
    const tick=(n,inp={})=>{for(let i=0;i<n;i++){for(const u of units)clUpdate(u,dt,inp[u.id]||null);updBullets(dt);clMelee(dt);updProjs(dt);postTick(dt);supplyTick(dt);airTick&&airTick(dt);}};
    const alive=u=>u.men.filter(m=>m.alive).length;
    // losowanie: zawsze 2–4 stanowiska
    const ile=[];for(let i=0;i<30;i++){setVariant('ww2');G.mode='pvp';startBattle();snapDeploy();ile.push(G.posts.length);}out.ileMin=Math.min(...ile);out.ileMax=Math.max(...ile);
    setVariant('acw');G.mode='pvp';startBattle();snapDeploy();out.secesjaBezStanowisk=G.posts.length===0;
    // zajęcie bunkra: piechota stoi przy nim 1,5 s
    fresh();G.posts=[];const bk={type:'bunkier',x:400,y:270,hp:4,ammo:100,owner:-1,unit:null,capT:0,capS:-1,reload:0,heat:0,over:false,mgY:0,mgT:0,dead:false};G.posts.push(bk);
    const p=clSpawn(0,'rif');snapDeploy();mv(p,400,270);const idle={x:0,y:0,A:false,human:true};tick(55,{[p.id]:idle});out.zajety=p.post===bk&&bk.owner===0;
    // ckm stanowiska zużywa taśmę
    tick(30,{[p.id]:{x:0,y:0,A:true,human:true}});out.tasmaPo1s=bk.ammo;
    // kule wroga nie szkodzą załodze
    const n0=alive(p);for(let k=0;k<60;k++)bullets.push({x:520,y:270+(k%5-2)*3,vx:-420,vy:0,left:300,side:1,src:'rif',kind:'rifle',pk:1});tick(30,{[p.id]:idle});out.straty_odKul=n0-alive(p);out.bunkierCaly=bk.hp===4;
    // trafienia pociskami: po 4 bunkier zniszczony, załoga wychodzi
    for(let k=0;k<4;k++)postHit(bk,1,1);out.bunkierZniszczony=bk.dead&&!p.post&&!bk.unit;
    // granat to pół trafienia
    fresh();G.posts=[{type:'okop',x:400,y:270,hp:2,ammo:50,owner:-1,unit:null,capT:0,capS:-1,reload:0,heat:0,over:false,mgY:0,mgT:0,dead:false}];const ok=G.posts[0];
    projs.push({kind:'gren',x:400,y:270,sx:400,sy:270,tx:400,ty:270,t:0,T:.1,H:5,h:0,a:0,bounce:0,side:1,src:'rif',hit:new Set(),low:false});tick(6);out.okopPoGranacie=ok.hp;
    // czołg nie może zająć stanowiska
    fresh();G.posts=[{type:'wieza',x:400,y:270,hp:2,ammo:0,owner:-1,unit:null,capT:0,capS:-1,reload:0,heat:0,over:false,mgY:0,mgT:0,dead:false}];const tw=G.posts[0];
    const tk=clSpawn(0,'tank');snapDeploy();mv(tk,400,270);tick(60,{[tk.id]:idle});out.czolgNieZajmuje=!tw.unit;
    // snajper na wieży: celne strzały na daleki dystans
    fresh();G.posts=[tw];tw.unit=null;tw.owner=-1;const s=clSpawn(0,'snp');snapDeploy();mv(s,400,270);tick(55,{[s.id]:idle});out.snajperNaWiezy=s.post===tw;
    let traf=0,proby=0;for(let i=0;i<12;i++){units=units.filter(u=>u===s);bullets=[];const e=clSpawn(1,'rif');mv(e,400+520,270+(i%3-1)*30);e.formT=0;const m0=alive(e);s.reload=0;
      sniperShot(s,Math.atan2(e.y-270,520),450*1.6,true);proby++;tick(45,{[s.id]:idle,[e.id]:idle});traf+=m0-alive(e);}
    out.snajperTrafienia=traf+'/'+proby;
    // zrzut: samolot zrzuca skrzynię, piechota ją podnosi i dostaje granaty
    fresh();const q=clSpawn(0,'rif');snapDeploy();mv(q,300,270);q.gren=0;G.supply=[2,2];G.supCd=[0,0];out.zrzutWezwany=callSupply(0,q);
    for(let i=0;i<30*14&&!(G.crates[0]&&G.crates[0].h===0);i++)tick(1,{[q.id]:idle});out.skrzyniaWyladowala=!!G.crates[0]||q.gren>0;if(G.crates[0])mv(q,G.crates[0].x,G.crates[0].y);tick(3,{[q.id]:idle});out.granatyPoZrzucie=q.gren;
    // dym: 3 ładunki, potem odmowa
    fresh();const d=clSpawn(0,'rif');snapDeploy();let dym=0;for(let i=0;i<5;i++){G.smokeCd=[0,0];if(callSmoke(0,d))dym++;}out.dymow=dym;
    // ułani są tylko w 1939 polskiej armii (nie pod Monte Cassino)
    out.ulani1939=FACTIONS.pl.keys.includes('kaw');
    return out;});
  console.log(JSON.stringify(r));
  const ok=r.ileMin>=2&&r.ileMax<=4&&r.ileMax>r.ileMin&&r.secesjaBezStanowisk&&r.zajety&&r.tasmaPo1s<100&&r.tasmaPo1s>80&&r.straty_odKul===0&&r.bunkierCaly&&r.bunkierZniszczony
    &&r.okopPoGranacie===1.5&&r.czolgNieZajmuje&&r.snajperNaWiezy&&+r.snajperTrafienia.split('/')[0]>=8&&r.zrzutWezwany&&r.skrzyniaWyladowala&&r.granatyPoZrzucie===3&&r.dymow===3&&r.ulani1939&&!errs.length;
  console.log(errs.join('\n')||'bez błędów strony');await b.close();if(!ok){console.error('TEST STANOWISK NIEUDANY');process.exit(1);}console.log('Stanowiska OK');})();

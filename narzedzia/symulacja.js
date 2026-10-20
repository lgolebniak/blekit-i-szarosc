const {chromium}=require(process.env.PW||'playwright');
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:760}});
  const errs=[];pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text());});
  await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(3500);
  for(const v of ['acw','rome','rome_c','rome_g','ww2','kirch','klusz','choc']){
    const r=await pg.evaluate(async(v)=>{
      setVariant(v);G.mode='cpu';
      for(let i=0;i<MAPS.length;i++)prepMap(i);
      // komputer po stronie 1 + losowy wzorzec
      G.army[1].ready=true;
      startBattle();
      const out={v,map:MAPS[eraMaps()[G.mapSel]].name,weather:G.weather,sleet:G.sleet,units0:units.filter(u=>u.side===0).map(u=>u.key),units1:units.filter(u=>u.side===1).map(u=>u.key)};
      // gracz 0: prosty „bot” – wybiera husarię i szarżuje, co jakiś czas zmienia oddział
      let t=0,errs=[];const dt=1/30;
      const press=(c,on)=>{KEYS[c]=on;};
      for(let i=0;i<30*150&&G.state!=='end';i++){
        t+=dt;
        const ph=Math.floor(t*2)%8;
        press('KeyF',ph===1||ph===5);press('KeyD',ph>=2&&ph<5);press('KeyW',ph===6);press('KeyS',ph===7);
        if(i%300===0){press('KeyT',true);}else if(i%300===2)press('KeyT',false);
        if(i%900===450){press('KeyR',true);}else if(i%900===452)press('KeyR',false);
        try{pollInput(dt);if(G.state==='pause')G.state='battle';clStep(dt);updParts(dt);if(i%15===0){drawField();drawHUD();}}catch(e){errs.push(e.message+' @'+(e.stack||'').split('\n')[1]);if(errs.length>5)break;}
      }
      for(const k in KEYS)KEYS[k]=false;
      const hus=units.filter(u=>u.key==='hus');
      Object.assign(out,{state:G.state,winner:G.winner,reason:G.reason,t:Math.round(G.t),stats:G.stats,res:G.res,through:G.stats.map(s=>s.through),
        alive:[0,1].map(s=>units.filter(u=>u.side===s&&!u.dead&&!u.gone).map(u=>u.key+':'+u.n+(u.key==='hus'?'k'+u.men.filter(m=>m.alive&&m.kopia).length:'')).join(' ')),
        palisadeTiles:Array.from(MAP.t).filter(x=>x===T.PALISADE).length,fenceTiles:Array.from(MAP.t).filter(x=>x===T.FENCE).length,errs});
      return out;},v);
    console.log(JSON.stringify(r));
    if(r.state!=='end'){}
    await pg.screenshot({path:require('path').resolve(__dirname,'../zrzuty')+'/shot_'+v+'.png'});
  }
  console.log(errs.slice(0,10).join('\n')||'no page errors');
  await b.close();})();

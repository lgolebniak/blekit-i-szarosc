const {chromium}=require(process.env.PW||'playwright');
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(2500);
  const r=await pg.evaluate(()=>{setVariant('kirch');G.mode='pvp';G.weatherSel=1;for(let i=0;i<MAPS.length;i++)prepMap(i);
    const run=(tkey,form,flank,att='hus')=>{let kills=0,loss=0,broke=0;const N=40;
      for(let n=0;n<N;n++){startBattle();units=[];bullets=[];projs=[];G.res=[{[att]:1},{[tkey]:1}];
        const h=clSpawn(0,att),e=clSpawn(1,tkey);snapDeploy();
        const mv=(u,X,Y)=>{const dx=X-u.x,dy=Y-u.y;for(const m of u.men){m.x+=dx;m.y+=dy;}u.x=X;u.y=Y;};
        mv(e,560,300);if(e.key==='pik'){e.rf=form;e.formT=0;}
        if(flank){// atak z boku: obracamy stronę – pikinierzy patrzą w lewo, więc uderzamy od prawej (od tyłu)
          mv(h,560,140);}else mv(h,330,300);
        if(att==='hus'){h.state='ride';h.form='line';h.charging=true;h.gallop=true;}
        h.state=att==='hus'?'ride':h.state;
        const e0=e.men.filter(m=>m.alive).length;
        for(let i=0;i<120;i++){const dt=1/30;
          const inp={x:0,y:flank?1:0,A:false,human:true};
          for(const u of units)clUpdate(u,dt,u===h?inp:null);
          trackVel(dt);updBullets(dt);clMelee(dt);updProjs(dt);
          if(flank&&h.y>290)inp.y=0;}
        kills+=e0-e.men.filter(m=>m.alive).length;loss+=4-h.men.filter(m=>m.alive).length;broke+=h.men.filter(m=>m.alive&&!m.kopia).length+ (4-h.men.filter(m=>m.alive).length);}
      return{target:tkey+(form?'/'+form:'')+(flank?' z boku':''),avgKills:(kills/N).toFixed(2),avgHusLost:(loss/N).toFixed(2)};};
    return[run('mus'),run('pik','phalanx'),run('pik','line')];});
  console.log(JSON.stringify(r,null,1));console.log(errs.join('\n')||'no errors');await b.close();})();

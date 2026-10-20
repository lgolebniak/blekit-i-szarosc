/* ================= PĘTLA ================= */
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  try{pollInput(dt);
  if(G.loadIdx<MAPS.length&&G.state!=='deploy'&&G.state!=='battle'){prepMap(G.loadIdx++);if(!vignette)initFx();}
  for(const m of G.msgs)m.t+=dt;
  switch(G.state){
    case'title':G.t+=dt;stepTitle();drawTitle();break;
    case'army':G.t+=dt;stepArmy();drawArmy();break;
    case'map':G.t+=dt;stepMap();drawMap();break;
    case'deploy':case'battle':if(G.rules==='classic')clStep(dt);else stepBattle(dt);updParts(dt);G.shake=Math.max(0,G.shake-dt*8);if(G.state==='pause'){drawField();drawHUD();drawPause();break;}drawField();drawHUD();break;
    case'pause':stepPause();drawField();drawHUD();if(G.state==='pause')drawPause();break;
    case'end':G.t+=dt;updParts(dt);stepEnd(dt);drawField();drawHUD();if(G.state==='end')drawEnd();break;}
  }catch(e){ctx=SCR;console.error(e);ctx.fillStyle='#300';ctx.fillRect(0,H-24,W,24);ctx.fillStyle='#fff';ctx.font='14px monospace';ctx.textAlign='left';ctx.fillText('Błąd: '+e.message,8,H-8);}
  requestAnimationFrame(frame);}
let started=false;const go=()=>{if(started)return;started=true;last=performance.now();requestAnimationFrame(frame);};
(document.fonts&&document.fonts.load?Promise.all([document.fonts.load(`40px ${FONT_D}`,'Błękit ąęśćżźńół'),document.fonts.load(`16px ${FONT_T}`,'Zażółć gęślą jaźń ◀▶')]).catch(()=>{}):Promise.resolve()).then(go);
setTimeout(go,2500);

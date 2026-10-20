/* ================= SZTUCZNA INTELIGENCJA ================= */
function nearestEnemy(u,filter){let b=null,bd=1e9;for(const e of units){if(e.side===u.side||e.dead||e.gone)continue;if(filter&&!filter(e))continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;b=e;}}return[b,bd];}
function aiGoal(u){
  if(u.ai.role==='obj'&&G.objOwner!==u.side){const o=((u.id%3)-1)*22;return[OBJ.x+o,OBJ.y-o];}
  const[e]=nearestEnemy(u,x=>!x.rout);if(e)return[e.x,e.y];return[OBJ.x,OBJ.y];}
function holdReturn(u,o,dt){if(dist(u.x,u.y,u.hx,u.hy)>14){const v=steer(u,u.hx,u.hy,dt);o.mx=v[0]*.8;o.my=v[1]*.8;}}
function pickCavTarget(u,maxD){let best=null,bs=1e9,bd=0;for(const e of units){if(e.side===u.side||e.dead||e.gone)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>maxD)continue;
  const s=d+(e.type==='art'?-130:0)+(e.rout?-80:0)+(e.type==='inf'&&e.form==='sq'?420:0)+(e.type==='cav'?40:0)-(6-e.n)*14+(tAt(e.x,e.y)===T.FOREST?120:0);
  if(s<bs){bs=s;best=e;bd=d;}}return[best,bd];}
function aiUnit(u,dt){
  const cpu=isCPU(u.side),stance=cpu?'adv':u.stance,o={mx:0,my:0,face:null};
  if(u.type==='inf'){
    const[ec,ecd]=nearestEnemy(u,e=>e.type==='cav'&&!e.rout);
    if(ec&&ecd<115){u.ai.sq+=dt;if(u.ai.sq>.7&&u.form!=='sq'){setForm(u,'sq');u.ai.autoSq=true;}}
    else{u.ai.sq=0;if(u.form==='sq'&&u.ai.autoSq&&(!ec||ecd>190)){setForm(u,'line');u.ai.autoSq=false;}}
    const range=SPEC.inf.range*(1+.15*hAt(u.x,u.y));const t=findTarget(u,range,Math.PI);
    if(t){o.face=Math.atan2(t.y-u.y,t.x-u.x);if(u.form==='sq'||Math.abs(angDiff(u.fa,o.face))<.35)tryVolley(u,false);
      if(stance==='adv'&&dist(u.x,u.y,t.x,t.y)>range*.8&&u.reload>1){const v=steer(u,t.x,t.y,dt);o.mx=v[0]*.5;o.my=v[1]*.5;}}
    else if(stance==='adv'&&!(cpu&&u.morale<45)){const g=aiGoal(u);const v=steer(u,g[0],g[1],dt);o.mx=v[0];o.my=v[1];}
    else holdReturn(u,o,dt);
  } else if(u.type==='cav'){
    if(u.ai.fall>0){u.ai.fall-=dt;u.charging=false;const v=steer(u,u.side===0?90:W-90,u.y,dt);o.mx=v[0];o.my=v[1];return o;}
    const[t,d]=pickCavTarget(u,stance==='adv'?520:100);
    if(t&&!(t.type==='inf'&&t.form==='sq'&&d>60)){const v=steer(u,t.x,t.y,dt);o.mx=v[0];o.my=v[1];u.charging=d<140&&(u.stamina>40||(u.charging&&u.stamina>5));}
    else{u.charging=false;if(stance==='adv'){const g=aiGoal(u);const v=steer(u,g[0],g[1],dt);o.mx=v[0]*.7;o.my=v[1]*.7;}else holdReturn(u,o,dt);}
    if(u.stamina<12&&u.inMelee<=0&&stance==='adv')u.ai.fall=3;
  } else {
    const mr=artMaxRange(u),t=findTarget(u,mr,Math.PI,SPEC.art.min*.6);
    if(t){const d=dist(u.x,u.y,t.x,t.y);o.face=Math.atan2(t.y-u.y,t.x-u.x);if(Math.abs(angDiff(u.fa,o.face))<.07&&u.reload<=0&&u.setup<=0){u.ammo=d<150?'can':'ball';fireCannon(u,d,false);}}
    else if(stance==='adv'){const[e,ed]=nearestEnemy(u);if(e&&ed>mr*.8){const v=steer(u,e.x,e.y,dt);o.mx=v[0];o.my=v[1];}}
    else holdReturn(u,o,dt);
  }
  return o;
}


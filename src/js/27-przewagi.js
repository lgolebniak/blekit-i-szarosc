/* ================= PRZEWAGI (kamień–papier–nożyce), UNIKI W RUCHU, MĄDRZEJSZY KOMPUTER ================= */
// klasy jednostek – różne frakcje o tej samej roli dzielą klasę
const UCLASS={inf:'inf',cav:'cav',lan:'lan',art:'art',
  leg:'heavy',lib:'heavy',war:'heavy',arc:'missile',sli:'missile',eq:'rcav',num:'rcav',gcav:'rcav',bal:'flat',ona:'arcm',ele:'beast',
  rif:'rif',mg:'mg',ppk:'ppk',tank:'tank',at:'at',mor:'mor'};
// kto jest skuteczniejszy od kogo (każda jednostka ma tyle samo przewag co słabości)
const BEATS={
  cav:['inf'],inf:['art'],art:['lan'],lan:['cav'],
  heavy:['rcav','missile'],rcav:['missile','flat'],missile:['flat','arcm','beast'],flat:['arcm','heavy','beast'],arcm:['heavy','rcav'],beast:['heavy','rcav'],
  rif:['at','mor'],mg:['rif','ppk'],ppk:['tank','mor'],tank:['rif','mg'],at:['ppk','tank'],mor:['mg','at']};
const EFF_UP=1.35,EFF_DN=1/1.35;
function eff(a,b){if(!a||!b||G.rules!=='classic')return 1;const ca=UCLASS[a],cb=UCLASS[b];if(!ca||!cb||ca===cb)return 1;
  if((BEATS[ca]||[]).includes(cb))return EFF_UP;if((BEATS[cb]||[]).includes(ca))return EFF_DN;return 1;}
// cel w ruchu trudniej trafić (kule i bełty lecą po prostej – można uskoczyć)
function evade(e,m){if(G.rules!=='classic')return 1;
  if(e.type==='cav'){if(e.gallop)return .55;if(e.state==='ride')return .75;return m&&m.mv>.2?.85:1;}
  if(e.type==='tank'||e.type==='ele')return e.moving?.85:1;
  return m&&m.mv>.2?.85:1;}
// walka wręcz z przewagami
const _clStrike=clStrike;
clStrike=function(a,b,m,o,d){return _clStrike(a,b,m,o,d)*eff(a.key,b.key);};
// prędkość oddziałów (do wyprzedzania celu)
function trackVel(dt){if(dt<=0)return;for(const u of units){if(u.dead||u.gone)continue;if(u.px===undefined){u.px=u.x;u.py=u.y;u.vx=0;u.vy=0;continue;}
  const vx=(u.x-u.px)/dt,vy=(u.y-u.py)/dt;u.vx=lerp(u.vx||0,clamp(vx,-120,120),.15);u.vy=lerp(u.vy||0,clamp(vy,-120,120),.15);u.px=u.x;u.py=u.y;}}
// komputer: wybiera cele, na które ma przewagę
function bestTarget(u,list){let b=null,bs=1e9;for(const f of list){const e=eff(u.key,f.key),s=dist(u.x,u.y,f.x,f.y)/(e*e);if(s<bs){bs=s;b=f;}}return b;}
// zagrożenie salwą: wroga piechota szykuje strzał na naszej wysokości
function volleyThreat(u,dir){for(const e of units){if(e.side===u.side||e.dead||e.gone||!e.pendVol)continue;const dx=(e.x-u.x)*dir;if(dx<-10||dx>260)continue;
  for(const m of e.men)if(m.alive&&Math.abs(m.y-u.y)<28)return e;}return null;}

// strona pomocy: kto na kogo (liczone z tabeli przewag, dla wybranej wersji)
function matchups(){const keys=[...new Set([...TY(0),...TY(1)])];
  return keys.map(k=>{const up=[],dn=[];for(const o of keys){if(o===k)continue;const e=eff(k,o);if(e>1)up.push(KD[o].name);else if(e<1)dn.push(KD[o].name);}return[KD[k].name,up,dn];});}
function drawMatchups(){ctx.fillStyle='rgba(14,16,12,.9)';ctx.fillRect(44,44,W-88,H-88);txt('Przewagi jednostek (tryb klasyczny)',W/2,82,30,INK,'center',true);
  if(G.rules!=='classic'){const r=G.rules;G.rules='classic';var L=matchups();G.rules=r;}else var L=matchups();
  txt('ODDZIAŁ',70,114,16,BRASS);txt('SKUTECZNIEJSZY PRZECIW  (+35%)',250,114,16,'#9fd08a');txt('SŁABSZY PRZECIW  (−26%)',600,114,16,'#e89a7a');
  let y=138;
  for(const[n,up,dn]of L){txt(n,70,y,17,INK);const e1=wrap(up.join(', ')||'–',250,y,330,15,14,'#cfe6c2'),e2=wrap(dn.join(', ')||'–',600,y,290,15,14,'#efc8b6');y=Math.max(y+24,Math.max(e1,e2)+22);}
  if(y<H-110)wrap('Salwa pada chwilę po komendzie – cel może jeszcze uskoczyć. Jazda w galopie jest trafiana o 45% rzadziej, w kłusie o 25%, każdy oddział w marszu o 15%.',70,Math.min(y+4,H-110),820,18,16,BRASS);}


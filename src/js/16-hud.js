/* ================= HUD (tryb taktyczny) ================= */
function chipIcon(type,x,y,col){if(eraChip2(type,x,y,col))return;if(type==='eq'||type==='gcav')type='cav';if(type==='rif')type='inf';type=CHIP_ALIAS[type]||type;ctx.fillStyle=col;
  if(type==='inf'){ctx.fillRect(x+2,y,3,2);ctx.fillRect(x+1,y+2,4,4);ctx.fillRect(x+1,y+6,1,3);ctx.fillRect(x+4,y+6,1,3);ctx.fillRect(x+6,y-2,1,9);}
  else if(type==='cav'){ctx.fillRect(x,y+3,8,3);ctx.fillRect(x+7,y+1,2,3);ctx.fillRect(x+8,y,2,2);ctx.fillRect(x,y+6,1,3);ctx.fillRect(x+6,y+6,1,3);ctx.fillRect(x+3,y-1,2,4);}
  else if(type==='lan'){ctx.fillRect(x,y+4,8,3);ctx.fillRect(x+7,y+2,2,3);ctx.fillRect(x,y+7,1,2);ctx.fillRect(x+6,y+7,1,2);ctx.fillRect(x+3,y+1,2,3);for(let k=0;k<9;k++)ctx.fillRect(x+2+k,y+2-Math.floor(k/3),1,1);}
  else{ctx.fillRect(x,y+3,9,2);ctx.fillRect(x+7,y+2,2,1);pdisc(ctx,x+3,y+6,2,col);}}
function drawRoster(p){const L=units.filter(u=>u.side===p),S=SIDE[p],cw=22;
  L.forEach((u,i)=>{const x=p===0?8+i*cw:W-8-cw+2-i*cw,y=4;const sel=G.sel[p]===u.id&&humanOf(p)>=0;
    const bad=u.dead||u.gone;ctx.fillStyle=bad?'rgba(40,20,18,.8)':u.rout&&Math.floor(G.t*4)%2?'rgba(150,40,30,.85)':'rgba(255,255,255,.07)';ctx.fillRect(x,y,cw-2,17);
    if(sel){ctx.fillStyle=S.ui;ctx.fillRect(x-1,y-1,cw,1);ctx.fillRect(x-1,y+17,cw,1);ctx.fillRect(x-1,y-1,1,19);ctx.fillRect(x+cw-2,y-1,1,19);}
    chipIcon(u.type,x+5,y+4,bad?'#5a4a44':u.rout?'#ffd0c0':S.ui);
    if(!bad){bar(x+1,y+15,cw-4,1,u.n/SPEC[u.type].men,'#e8d9a0','rgba(0,0,0,.6)');if(u.stance==='adv'){ctx.fillStyle='#9fe07a';ctx.fillRect(x+cw-5,y+1,2,2);}}
    else{ctx.fillStyle='#8a3a30';for(let k=0;k<12;k++){ctx.fillRect(x+4+k,y+3+k,1,1);ctx.fillRect(x+15-k,y+3+k,1,1);}}});}
function drawUnitPanel(p){const u=selUnit(p),S=SIDE[p],w=250,h=58,x=p===0?8:W-8-w,y=H-h-8;
  ctx.fillStyle='rgba(12,14,12,.78)';ctx.fillRect(x,y,w,h);ctx.fillStyle=S.uiD;ctx.fillRect(x,y,w,2);
  if(!u){txt('Brak oddziałów',x+10,y+30,18,'#aaa');return;}
  txt(`${unitName(u)} · ${typeName(u)}`,x+8,y+18,18,S.ui);
  txt(`Ludzie ${u.n}/${SPEC[u.type].men}`,x+8,y+34,16,'#e8e2d0');txt('Morale',x+112,y+34,16,'#e8e2d0');bar(x+166,y+26,76,6,u.morale/100,u.morale<40?'#e05a4a':u.morale<70?'#e0b24a':'#8fd06a');
  let st=u.rout?'UCIEKA – nie słucha rozkazów':'';
  if(!u.rout){const sn=u.stance==='hold'?'Trzymaj':'Naprzód';
    if(u.type==='inf')st=`${FORM[u.form].label} · ${sn}`+(u.formT>0?' · zmiana szyku':u.reload>0?'':' · gotowi');
    else if(u.type==='cav')st=`${u.form==='line'?'Szereg':'Kolumna'} · ${sn}${u.charging?' · SZARŻA':''}`;
    else st=`${u.ammo==='ball'?'Kula':'Kartacz'} · ${sn}`+(u.setup>0?' · rozstawianie':u.reload>0?'':' · gotowa');}
  txt(st,x+8,y+50,16,u.rout?'#ff8a70':'#cfc6a8');
  if(u.type==='cav')bar(x+180,y+44,60,5,u.stamina/100,'#7ec3e0');
  else if(u.reload>0)bar(x+180,y+44,60,5,1-u.reload/(SPEC[u.type].reload*1.6),'#d0a050');
  const rc=G.rallyCd[p];txt(rc>0?`Zryw ${Math.ceil(rc)}s`:'Zryw [B] gotowy',p===0?x+w+8:x-8,y+h-4,15,rc>0?'#8a8470':'#e6c56a',p===0?'left':'right');}
function weatherLabel(){const wn=G.sleet&&G.weather==='rain'?'Deszcz ze śniegiem':{clear:'Pogodnie',rain:'Deszcz',fog:'Mgła'}[G.weather];const ar=['→','↘','↓','↙','←','↖','↑','↗'][Math.round(((Math.atan2(G.wind.y,G.wind.x)+TAU)%TAU)/(TAU/8))%8];return`${wn} · wiatr ${ar}`;}
function drawMsgs(){let my=H-80;const vis=G.msgs.filter(m=>m.t<5);for(let i=vis.length-1;i>=0&&my>H-150;i--){const m=vis[i];ctx.globalAlpha=clamp(5-m.t,0,1);txt(m.text,W/2,my,17,SIDE[m.side].ui,'center');my-=16;}ctx.globalAlpha=1;}
function drawHUD(){
  if(G.rules==='classic')return clHUD();
  ctx.fillStyle='rgba(10,12,10,.8)';ctx.fillRect(0,0,W,26);ctx.fillStyle='#6a5a30';ctx.fillRect(0,26,W,1);
  drawRoster(0);drawRoster(1);
  const cx=W/2;txt(G.state==='deploy'?'ROZSTAWIENIE':'SZTANDAR',cx,12,14,'#c9a24a','center',false,false);
  bar(cx-100,15,96,6,G.score[0]/WINSCORE,SIDE[0].ui);ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(cx+4,15,96,6);ctx.fillStyle=SIDE[1].ui;const w1=Math.round(96*clamp(G.score[1]/WINSCORE,0,1));ctx.fillRect(cx+100-w1,15,w1,6);
  ctx.fillStyle=G.objOwner>=0?SIDE[G.objOwner].ui:'#e8e2d0';ctx.fillRect(cx-1,13,2,10);
  txt(weatherLabel(),cx,44,16,'#d8cfb2','center');
  for(let p=0;p<2;p++)if(humanOf(p)>=0)drawUnitPanel(p);
  drawMsgs();
  if(G.state==='deploy'){ctx.fillStyle='rgba(10,12,10,.7)';ctx.fillRect(W/2-190,52,380,64);
    txt(`Rozstaw wojska · ${Math.max(0,Math.ceil(G.deployT))} s`,W/2,80,26,'#f0e2b0','center',true);
    for(let p=0;p<2;p++){const r=G.ready[p]||isCPU(p);txt(`${SIDE[p].name}: ${r?'GOTOWI':'Start = gotowi'}`,W/2+(p?95:-95),106,17,r?'#9fe07a':SIDE[p].ui,'center');}}
}


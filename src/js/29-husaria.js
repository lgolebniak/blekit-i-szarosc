/* ================= RZECZPOSPOLITA XVII w.: HUSARIA I TRZY BITWY ================= */
// Kircholm 1605 · Kłuszyn 1610 · Chocim 1673 – scenariusze z historycznym składem i mapą
const CHIP_ALIAS={hus:'lan',pan:'cav',sip:'cav',boj:'cav',rajt:'cav',haj:'inf',mus:'inf',strz:'inf',jan:'inf',dz:'art'};
CLS.hus={walk:34,sprint:90};
G.sleet=false;
const plVol=(reload,range,pk,o={})=>Object.assign({reload,range,spd:300,pk,kind:'musket'},o);
const muskInit=u=>{u.reloadMax=kdOf(u).vol.reload*1.4;};
Object.assign(KD,{
  hus:{base:'cav',men:4,lance:true,name:'Husaria',unit:'Chorągiew husarska',pick:'y',pos:[72,'cav'],ai:'hus',beh:'hus',label:'Husarze',
    init:u=>{for(const m of u.men)m.kopia=true;},
    status:u=>{const al=u.men.filter(m=>m.alive),k=al.filter(m=>m.kopia).length;
      return u.state==='ride'?`SZARŻA · kopie ${k}/${al.length} · A: koncerz · RT: ${u.form==='line'?'klin':'linia'}`:u.state==='halt'?'Zwrot – konie zwalniają':`Stępa · kopie ${k}/${al.length} · A: szarża`;}},
  pan:{base:'cav',men:4,name:'Pancerni',unit:'Chorągiew pancerna',pick:'y',pos:[72,'cav'],ai:'cav',beh:'acwSabre',label:'Jeźdźcy'},
  haj:{base:'inf',men:6,name:'Hajducy',unit:'Rota hajducka',pick:'x',pos:[160,270],ai:'flat',beh:'musk',label:'Hajducy',range:190,vol:plVol(2.6,190,.8),melee:1.6,sap:true,init:muskInit},
  dz:{base:'art',men:3,name:'Działa',unit:'Działo',pick:'b',pos:[44,'art'],two:true,ai:'artArc',beh:'acwCannon',label:'Puszkarze',init:u=>{u.maxR=700;}},
  mus:{base:'inf',men:6,name:'Muszkieterowie',unit:'Rota muszkieterów',pick:'x',pos:[165,200],ai:'flat',beh:'musk',label:'Muszkieterzy',range:210,vol:plVol(2.8,210,.8),init:muskInit},
  pik:{base:'inf',men:8,name:'Pikinierzy',unit:'Rota pikinierów',pick:'x',pos:[175,330],ai:'leg',beh:'leg',label:'Pikinierzy',slots:legSlots2,forms:['line','phalanx'],init:u=>{u.rf='line';},
    status:u=>`${u.rf==='phalanx'?'Jeż – piki w przód':'Linia'}${u.formT>0?' (zmiana)':''} · A: szyk`},
  rajt:{base:'cav',men:4,name:'Rajtaria',unit:'Kompania rajtarów',pick:'y',pos:[84,'cav'],ai:'skirm',beh:'skirm',label:'Rajtarzy',spd:44,vol:plVol(3.2,85,.6,{spd:320,kind:'pistol'}),
    status:u=>u.reload>0?'Nabijają pistolety…':'Ruch w każdą stronę · A: salwa z pistoletów'},
  strz:{base:'inf',men:6,name:'Strzelcy',unit:'Prikaz strzelców',pick:'x',pos:[150,270],ai:'flat',beh:'musk',label:'Strzelcy',range:180,vol:plVol(3,180,.75),melee:1.3,init:muskInit},
  boj:{base:'cav',men:4,name:'Jazda bojarska',unit:'Sotnia bojarska',pick:'y',pos:[72,'cav'],ai:'cav',beh:'acwSabre',label:'Jeźdźcy'},
  jan:{base:'inf',men:6,name:'Janczarzy',unit:'Orta janczarów',pick:'x',pos:[160,270],ai:'flat',beh:'musk',label:'Janczarzy',range:200,vol:plVol(2.6,200,.85),melee:2,init:muskInit},
  sip:{base:'cav',men:4,name:'Spahisi',unit:'Chorągiew spahisów',pick:'y',pos:[72,'cav'],ai:'cav',beh:'acwSabre',label:'Jeźdźcy'}
});
AMMO.dz=15;BULLET_LOOK.pistol=['#fff3c4',2,1];
const PL17INFO={
  hus:['Husaria','4 husarzy · kopia, koncerz, skrzydła','Kopia dłuższa od piki, pęka. Potem A: koncerz.'],
  pan:['Pancerni','4 jeźdźców · kolczuga i szabla','Kłus, galop, dęba. A: cięcie.'],
  haj:['Hajducy','6 piechurów · rusznice i czekany','A: salwa. Rozbierają płoty i palisady.'],
  dz:['Działa','działo + 3 puszkarzy','Trzymaj A = siła. Kula łamie płoty i wały.'],
  mus:['Muszkieterowie','6 strzelców · ciężkie muszkiety','A: salwa – daleko, ale wolno ładują.'],
  pik:['Pikinierzy','8 ludzi · długie piki','A: linia ↔ jeż. Jeż zatrzymuje jazdę.'],
  rajt:['Rajtaria','4 rajtarów · pistolety','Każdy kierunek. A: pistolety z bliska.'],
  strz:['Strzelcy','6 ludzi · rusznice i berdysze','A: salwa. Berdysze – groźni wręcz.'],
  boj:['Jazda bojarska','4 jeźdźców · szable','Kłus, galop, dęba. A: cięcie.'],
  jan:['Janczarzy','6 ludzi · muszkiety, jatagany','A: salwa. Jatagany – najgroźniejsi wręcz.'],
  sip:['Spahisi','4 jeźdźców · szable','Kłus, galop, dęba. A: cięcie.']};
const PL17C={
  rp:{name:'Rzeczpospolita',gen:'Rzeczypospolitej',lose:'Wojsko Rzeczypospolitej rozbite',coat:'#9a2a2a',coatD:'#6e1c1c',pants:'#c8a060',hat:'#4a3020',ui:'#ff8f7a',uiD:'#7a2a22',flag:['#d4213d','#f0ece0']},
  swe:{name:'Szwedzi',gen:'Szwedów',coat:'#3a5e9a',coatD:'#27416e',pants:'#8a7a5a',hat:'#2a2a2a',ui:'#ffd860',uiD:'#7a6420',flag:['#2a5a9a','#f0c830']},
  mos:{name:'Moskwa',gen:'Moskwy',lose:'Wojska moskiewskie i najemne rozbite',coat:'#4e6e3a',coatD:'#364e28',pants:'#6a5a3a',hat:'#7a2a22',ui:'#9fe07a',uiD:'#3e5a28',flag:['#c8a030','#7a2a22']},
  tur:{name:'Turcy',gen:'Turków',coat:'#2e6a8a',coatD:'#1e4a62',pants:'#c8b080',hat:'#f0ece0',ui:'#7ad8d0',uiD:'#1e5a5a',flag:['#b8302a','#f0ece0']}};
const rpFac=(presets,max)=>({keys:['hus','pan','haj','dz'],total:12,max,info:PL17INFO,colors:PL17C.rp,presets});
Object.assign(FACTIONS,{
  rp_k:rpFac([{n:'Chodkiewicz',hus:6,pan:2,haj:3,dz:1},{n:'Skrzydła',hus:7,pan:3,haj:1,dz:1},{n:'Ostrożnie',hus:4,pan:2,haj:4,dz:2}],{hus:8,pan:4,haj:5,dz:2}),
  swe:{keys:['mus','pik','rajt','dz'],total:15,max:{mus:8,pik:8,rajt:6,dz:3},info:PL17INFO,colors:PL17C.swe,
    presets:[{n:'Karol IX',mus:6,pik:4,rajt:3,dz:2},{n:'Mur pik',mus:4,pik:7,rajt:2,dz:2},{n:'Rajtaria',mus:5,pik:3,rajt:5,dz:2}]},
  rp_l:rpFac([{n:'Żółkiewski',hus:7,pan:2,haj:2,dz:1},{n:'Szarża za szarżą',hus:8,pan:2,haj:1,dz:1},{n:'Z piechotą',hus:5,pan:2,haj:4,dz:1}],{hus:8,pan:4,haj:5,dz:2}),
  mos:{keys:['strz','mus','pik','boj','rajt','dz'],total:16,max:{strz:5,mus:6,pik:5,boj:8,rajt:5,dz:2},info:PL17INFO,colors:PL17C.mos,
    presets:[{n:'Szujski i De la Gardie',strz:3,mus:3,pik:2,boj:4,rajt:3,dz:1},{n:'Najemnicy',strz:1,mus:5,pik:4,boj:2,rajt:3,dz:1},{n:'Jazda bojarska',strz:3,mus:2,pik:1,boj:7,rajt:2,dz:1}]},
  rp_c:rpFac([{n:'Sobieski',hus:5,pan:2,haj:4,dz:1},{n:'Szturm piechoty',hus:4,pan:1,haj:5,dz:2},{n:'Husaria',hus:7,pan:2,haj:2,dz:1}],{hus:8,pan:4,haj:6,dz:2}),
  tur:{keys:['jan','sip','dz'],total:12,max:{jan:9,sip:6,dz:3},info:PL17INFO,colors:PL17C.tur,
    presets:[{n:'Husajn Pasza',jan:6,sip:4,dz:2},{n:'Janczarzy',jan:8,sip:2,dz:2},{n:'Spahisi',jan:5,sip:5,dz:2}]}
});
ERAS.pl17={name:'Husaria',years:'1605 – 1673',keys:[],presets:[],max:{},info:PL17INFO,hint:'X piechota · Y jazda · B działa · RT klin'};
Object.assign(VARIANTS,{
  kirch:{era:'pl17',fac:['rp_k','swe'],sub:'Kircholm · 27 września 1605 · Chodkiewicz kontra Karol IX',hud:'Kircholm 1605',
    tip:'Szwedzi stoją na wzgórzach – wywab ich w dół, potem husaria!',
    hist:'Historycznie: 3,5 tys. żołnierzy Chodkiewicza rozgromiło ponad 11 tys. Szwedów. Szwedzi stracili do 9 tys., Polacy ok. 100.'},
  klusz:{era:'pl17',fac:['rp_l','mos'],sub:'Kłuszyn · 4 lipca 1610 · Żółkiewski kontra Szujski i De la Gardie',hud:'Kłuszyn 1610',
    tip:'Szukaj luk w płotach – tam wpadnie husaria.',
    hist:'Historycznie: ok. 6,5 tys. żołnierzy Żółkiewskiego pobiło ok. 35 tys. Rosjan i najemników – husaria szarżowała wielokrotnie.'},
  choc:{era:'pl17',fac:['rp_c','tur'],sub:'Chocim · 11 listopada 1673 · Sobieski kontra Husajn Pasza',hud:'Chocim 1673',
    tip:'Hajducy przy palisadzie robią wyłom, działa też. Potem husaria!',
    hist:'Historycznie: Sobieski zdobył obóz turecki (po ok. 30 tys. żołnierzy po obu stronach). Zginęło kilkanaście tysięcy Turków.'}});
VAR_ORDER.push('kirch','klusz','choc');
Object.assign(VAR_LABEL,{kirch:'Bitwa pod Kircholmem',klusz:'Bitwa pod Kłuszynem',choc:'Bitwa pod Chocimiem'});

/* --- mapy scenariuszy (niesymetryczne) --- */
MAPS.push(
{era:'pl17',scen:'kirch',name:'Kircholm',seed:105,
 desc:'27 września 1605. Szwedzi Karola IX stoją na wzgórzach nad Dźwiną – stamtąd ich muszkiety i działa sięgają dalej. Wywab ich w dół i rozbij szyk husarią.',
 build(m){m.fill(T.GRASS);
  m.path([[-10,52],[200,40],[420,58],[640,42],[970,56]],34,T.WATER);
  m.hill(780,280,190,1,.25);m.hill(800,270,95,2,.25);m.hill(140,300,60,1);
  m.circle(170,470,70,T.FOREST);m.circle(250,110,40,T.FOREST);m.circle(880,480,56,T.FOREST);m.circle(560,476,40,T.FOREST);
  m.circle(450,300,52,T.MUD,.5);m.circle(330,160,42,T.WHEAT,.3);m.circle(620,170,40,T.WHEAT,.3);
  m.path([[0,280],[300,300],[520,270],[960,260]],10,T.ROAD);
  m.rect(820,84,30,22,T.HOUSE);m.rect(866,92,24,20,T.HOUSE);
  m.path([[660,140],[690,190]],6,T.FENCE);}},
{era:'pl17',scen:'klusz',name:'Kłuszyn',seed:111,
 desc:'4 lipca 1610. Najemna piechota De la Gardiego kryje się za płotami – konnica ich nie przeskoczy. Husaria wpada w luki, a po przejeździe przez pole wraca z nowymi kopiami.',
 build(m){m.fill(T.GRASS);
  m.circle(120,60,90,T.FOREST,.3);m.circle(460,34,80,T.FOREST,.3);m.circle(860,50,90,T.FOREST,.3);
  m.circle(200,510,80,T.FOREST,.3);m.circle(560,520,90,T.FOREST,.3);m.circle(900,500,70,T.FOREST,.3);
  m.circle(420,190,44,T.RUINS,.4);m.rect(400,166,26,18,T.HOUSE);m.rect(444,204,22,16,T.HOUSE);
  m.circle(300,350,50,T.WHEAT,.3);m.circle(520,340,46,T.WHEAT,.3);m.circle(860,270,30,T.MUD,.5);
  m.path([[0,270],[960,270]],10,T.ROAD);
  m.path([[640,96],[640,168]],6,T.FENCE);m.path([[640,228],[640,246]],6,T.FENCE);m.path([[640,294],[640,312]],6,T.FENCE);m.path([[640,372],[640,446]],6,T.FENCE);
  m.path([[598,100],[640,96]],6,T.FENCE);m.path([[598,446],[640,446]],6,T.FENCE);}},
{era:'pl17',scen:'choc',name:'Chocim',seed:117,wx:'rain',sleet:true,tint:'rgba(226,232,240,.16)',
 desc:'11 listopada 1673, deszcz ze śniegiem. Turcy Husajna Paszy siedzą za wałami starego obozu nad Dniestrem. Hajducy rozbierają palisadę, działa robią wyłomy – wtedy husaria wjeżdża do obozu.',
 build(m){m.fill(T.GRASS);
  m.path([[480,-10],[600,30],[760,46],[970,40]],34,T.WATER);m.rect(748,20,24,48,T.BRIDGE);
  m.circle(905,104,30,T.ROCK,.2);m.rect(884,84,34,24,T.HOUSE);
  m.hill(200,270,70,1);m.circle(120,470,70,T.FOREST);m.circle(330,90,40,T.FOREST);m.circle(380,470,40,T.FOREST);
  m.path([[0,270],[690,270]],10,T.ROAD);
  m.path([[668,80],[668,500]],12,T.MUD);
  m.path([[690,70],[690,240]],6,T.PALISADE);m.path([[690,300],[690,505]],6,T.PALISADE);m.path([[690,505],[960,505]],6,T.PALISADE);
  m.rect(790,150,20,14,T.HOUSE);m.rect(850,390,20,14,T.HOUSE);m.rect(820,440,18,14,T.HOUSE);}}
);

/* --- zachowania --- */
// piechota z muszkietami: jak w wojnie secesyjnej, parametry salwy z tabeli jednostek
BEH.musk=function(u,dt,I){const kd=kdOf(u),sp=(kd.spd||22)*(G.weather==='rain'?.9:1),{x,y}=I;
  const horiz=Math.abs(x)>.3&&Math.abs(x)>=Math.abs(y),vert=Math.abs(y)>.3&&Math.abs(y)>Math.abs(x);
  if(horiz){u.s=Math.min(1,u.s+dt*.7);u.colDir=Math.sign(x);}else if(vert)u.s=Math.max(0,u.s-dt*1.1);
  clMoveMen(u,x*sp,y*sp,dt,false,vert?2.2:horiz?1.2:0,I.hum);
  if(I.Ap&&I.bat&&!clVolley(u,kd.vol)&&I.hum)AU.bad();};
// rajtaria: ruch w każdą stronę, salwa z pistoletów z bliska
BEH.skirm=function(u,dt,I){const kd=kdOf(u),sp=kd.spd||44;clMoveMen(u,I.x*sp,I.y*sp,dt,false,2,I.hum);u.charging=false;u.gallop=false;
  if(I.Ap&&I.bat&&!clVolley(u,kd.vol)&&I.hum)AU.bad();};
// husaria: stępa (każdy kierunek) → szarża z kopiami → koncerz; zwrot drążkiem w tył; po przejeździe przez pole wraca z nowymi kopiami
BEH.hus=function(u,dt,I){const{x,y,dir}=I;
  if(u.state==='idle'){u.charging=false;u.gallop=false;u.s=Math.max(0,u.s-dt*1.2);
    clMoveMen(u,x*CLS.hus.walk,y*CLS.hus.walk,dt,false,2,I.hum);
    const al=u.men.filter(m=>m.alive),need=al.some(m=>!m.kopia),still=!al.some(m=>m.mv>.2);
    if(need&&still&&inZone(u.side,u.x)){u.armT=(u.armT||0)+dt;if(u.armT>3){u.armT=0;for(const m of al)m.kopia=true;msg(u.side,`${unitName(u)}: nowe kopie z taboru!`);AU.ui();}}else u.armT=0;
    if(I.bat&&I.Ap){u.state='ride';u.form='line';u.charging=true;u.gallop=true;AU.bugle(BUG.charge);msg(u.side,`${unitName(u)}: husaria – szarża!`);}}
  else if(u.state==='halt'){u.charging=false;u.gallop=false;clMoveMen(u,0,0,dt,false,1.5,I.hum);if(u.rearT<=0)u.state='idle';}
  else{u.gallop=true;u.charging=true;
    if(I.inp&&x*dir<-.5&&!u.men.some(m=>m.alive&&m.wrap)){u.state='halt';u.rearT=.6;u.gallop=false;u.charging=false;AU.tone(700,.35,'sawtooth',.05,0,-300,1400);return;}
    if(I.Rp){u.form=u.form==='line'?'wedge':'line';AU.ui();}
    const ay=I.inp?y:cavAvoid(u)*.8;
    clMoveMen(u,dir*CLS.hus.sprint,ay*CLS.cav.steer,dt,true,2.2,I.hum,!I.inp);
    if(R()<.8)dustAt(u.x-dir*10+(R()-.5)*16,u.y+(R()-.5)*30,1,'140,120,85');
    let all=true;for(const m of u.men){if(!m.alive)continue;if(!m.wrap&&(m.x<-12||m.x>W+12))m.wrap=true;if(!m.wrap)all=false;}
    if(all){clReenter(u);return;}
    if(I.Ap&&u.slashCd<=0){u.slashT=.4;u.slashCd=.55;AU.clash(u.x);}}};
// po przejeździe przez całe pole husaria bierze nowe kopie
const _clReenterPL=clReenter;
clReenter=function(u){_clReenterPL(u);if(u.key==='hus'){for(const m of u.men)if(m.alive)m.kopia=true;msg(u.side,`${unitName(u)}: nowe kopie – można szarżować znowu!`);}};
function lanceSplinter(m,side){const dir=clDir(side);for(let i=0;i<6;i++)parts.push({k:'dirt',x:m.x+dir*14,y:m.y,z:12,vx:dir*(10+R()*40),vy:(R()-.5)*30,vz:30+R()*50,life:0,max:.7,c:R()<.5?'#d8c088':'#a83a2a'});
  AU.burst(.12,2600,'highpass',2,.25,AU.pan(m.x));}

/* --- walka wręcz XVII w.: kopia dłuższa od piki, jeż pikinierów, zbroja husarii --- */
function pl17Strike(a,b,m,o,d){let p;const kd=kdOf(a),front=(o.x-m.x)*clDir(a.side)>-2;
  if(a.key==='hus'){if(a.state==='ride'&&a.gallop&&m.kopia&&front)p=.7;else if(a.slashT>0)p=b.type==='cav'?.32:.48;else p=a.state==='ride'&&a.gallop&&b.type!=='cav'&&d<7?.08:.02;}
  else if(a.type==='cav'){if(kd.beh==='skirm')p=.03;else if(a.slashT>0)p=b.type==='cav'?(b.slashT>0?.22:.4):.45;else if(a.gallop&&b.type!=='cav'&&d<6)p=.07;else p=.01;}
  else if(a.key==='pik')p=a.rf==='phalanx'?.06*(b.type==='cav'?2.6:1):.045*(b.type==='cav'?1.6:1);
  else if(a.type==='inf')p=(b.type==='cav'?.035:b.type==='art'?.06:.025)*(kd.melee||1);
  else p=.01;
  if(b.key==='pik'){const fr=isFront(b,m.x);if(b.rf==='phalanx'&&fr)p*=a.key==='hus'&&m.kopia?.4:a.type==='cav'?.2:.5;else if(!fr)p*=1.25;else if(a.key==='hus')p*=1.15;}
  if(b.key==='hus')p*=.8;
  if(a.formT>0)p*=.6;
  return p;}
const _clStrikePL=clStrike;
clStrike=function(a,b,m,o,d){return G.era==='pl17'?pl17Strike(a,b,m,o,d)*eff(a.key,b.key):_clStrikePL(a,b,m,o,d);};
// walka wręcz: zasięg zależny od broni (kopia 17, pika 10–13) i pękanie kopii
clMelee=function(dt){clMeleeT-=dt;if(clMeleeT>0)return;clMeleeT=.1;
  const L=units.filter(u=>!u.dead&&!u.gone&&u.state!=='enter');
  for(const u of L)for(const m of u.men)if(m.cool>0)m.cool-=.1;
  for(const a of L)for(const b of L){if(a.side===b.side||Math.abs(a.x-b.x)>100||Math.abs(a.y-b.y)>100)continue;
    const base=a.type==='cav'?(a.lance?13:11):a.type==='tank'?9:a.type==='ele'?10:7;
    for(const m of a.men){if(!m.alive||m.cool>0)continue;const kop=a.key==='hus'&&m.kopia&&a.state==='ride'&&a.gallop;
      const reach=kop?17:a.key==='pik'?(a.rf==='phalanx'?13:10):base;
      for(const o of b.men){if(!o.alive)continue;const d=dist(m.x,m.y,o.x,o.y);if(d>reach)continue;
        const p=clStrike(a,b,m,o,d);if(p<=0)continue;const hit=R()<p;
        if(kop&&(o.x-m.x)*clDir(a.side)>-2&&(hit||R()<.25)){m.kopia=false;lanceSplinter(m,a.side);}
        if(!hit)continue;
        const kind=(a.type==='cav'&&a.slashT<=0&&!a.lance)||a.type==='tank'?'trample':'melee';killMan(b,o,kind);m.cool=a.type==='tank'?.1:.35;
        parts.push({k:'spark',x:(m.x+o.x)/2,y:(m.y+o.y)/2-8,vx:(R()-.5)*30,vy:-20,life:0,max:.25});if(R()<.5&&a.type!=='tank')AU.clash(m.x);break;}}}};
// zbroja husarza: kule trafiają rzadziej
const _evadePL=evade;evade=function(e,m){const v=_evadePL(e,m);return e.key==='hus'?v*.8:v;};
// przewagi epoki: każda klasa 2 przewagi i 2 słabości
Object.assign(UCLASS,{hus:'hcav',pik:'pike',haj:'shot',mus:'shot',strz:'shot',jan:'shot',pan:'lcav',sip:'lcav',boj:'lcav',rajt:'skir',dz:'gun'});
Object.assign(BEATS,{hcav:['shot','lcav'],pike:['hcav','lcav'],shot:['pike','skir'],lcav:['skir','gun'],skir:['pike','gun'],gun:['hcav','shot']});

/* --- wyłomy: kula armatnia i hajducy łamią płoty i palisady (wyłom na 3 pola) --- */
const _breakPalPL=breakPalisade;
breakPalisade=function(x,y){if(G.era!=='pl17')return _breakPalPL(x,y);for(const dy of[-TS,0,TS])_breakPalPL(x,y+dy);};
const _impactPL=impact;
impact=function(p){if(G.era==='pl17'&&(!p.kind||p.kind==='ball')){for(const dx of[0,-8,8]){const t=tAt(p.tx+dx,p.ty);if(t===T.PALISADE||t===T.FENCE){breakPalisade(p.tx+dx,p.ty);break;}}}return _impactPL(p);};
function pl17Tick(dt){if(G.era!=='pl17'||G.state!=='battle')return;
  // kula tocząca się po ziemi zatrzymuje się na płocie albo palisadzie i robi w nim wyłom
  for(const p of projs){if(!p.low)continue;const t=tAt(p.x,p.y);if(t===T.PALISADE||t===T.FENCE){breakPalisade(p.x,p.y);p.tx=p.x;p.ty=p.y;p.t=p.T;p.bounce=0;}}
  for(const u of units){if(u.dead||u.gone||u.state==='enter'||!kdOf(u).sap)continue;const dir=clDir(u.side);
    for(const m of u.men){if(!m.alive)continue;for(const ox of[dir*8,dir*3]){const t=tAt(m.x+ox,m.y);if(t!==T.PALISADE&&t!==T.FENCE)continue;
      const i=Math.floor(m.y/TS)*GW+Math.floor((m.x+ox)/TS);const S=MAP.sap||(MAP.sap={});S[i]=(S[i]||0)+dt;
      if(R()<dt*3)dustAt(m.x+ox,m.y-3,1,'150,120,80');
      if(S[i]>(t===T.FENCE?1.5:3)){delete S[i];breakPalisade(m.x+ox,m.y);AU.impact(m.x,true);
        if(!(u.sapT>G.t)){msg(u.side,`${unitName(u)}: wyłom w ${t===T.FENCE?'płocie':'palisadzie'}!`);u.sapT=G.t+4;}}
      break;}}}}
const _eraTick3PL=eraTick3;eraTick3=function(dt){_eraTick3PL(dt);pl17Tick(dt);
  for(const u of units)if(u.gone&&!u.dead&&!u.queued&&u.cl){u.queued=true;u.pendVol=null;clQueue(u.side,u.key,u.slot);}
  for(const u of units){if(u.dead||u.gone||u.state==='enter')continue;
    if(u.shotsMax!==undefined&&u.shots===0&&!RESUPPLY[u.key]&&u.reload<=0&&!u.aiming&&!projs.some(p=>p.side===u.side&&p.src===u.key)){u.gone=u.queued=true;msg(u.side,`${unitName(u)}: koniec amunicji – schodzi z pola.`);clQueue(u.side,u.key,u.slot);continue;}
    if(u.state==='ride'&&u.men.some(m=>m.alive&&m.wrap)&&u.men.some(m=>m.alive&&!m.wrap)){u.wrapT=(u.wrapT||0)+dt;if(u.wrapT>6){u.wrapT=0;clReenter(u);}}else u.wrapT=0;}};
// samoobrona: piechota bez sterowania strzela do 75% zasięgu, pikinierzy sami stają w jeża przed szarżą
const _autoDefPL=autoDefend;
autoDefend=function(u,dt){if(G.era!=='pl17')return _autoDefPL(u,dt);if(G.state!=='battle'||u.state==='enter'||u.dead)return;const kd=kdOf(u);
  if(kd.beh==='musk'&&u.reload<=0&&!u.pendVol){const rg=kd.vol.range*AUTO_RANGE;if(nearestAlignedMan(u,u.men.filter(m=>m.alive),rg,null,3.5))clVolley(u,Object.assign({},kd.vol,{range:rg}));}
  if(u.key==='pik'&&u.rf==='line'&&u.formT<=0&&units.some(e=>e.side!==u.side&&!e.dead&&!e.gone&&e.type==='cav'&&e.state==='ride'&&dist(e.x,e.y,u.x,u.y)<150)){u.rf='phalanx';u.formT=.8;}};

/* --- komputer --- */
CPUSCORE.tank=u=>u.track||u.shots===0?12:50;
Object.assign(CPUSCORE,{hus:u=>u.state==='ride'?(cavAvoid(u)?72:50):(G.t<8?12:46),skirm:()=>44});
CPU.hus=function(u,dt,foes,dir,c){const al=u.men.filter(m=>m.alive),armed=al.filter(m=>m.kopia).length;
  const soft=foes.filter(f=>!(f.key==='pik'&&f.rf==='phalanx'));const t=bestTarget(u,soft.length?soft:foes)||nearestBy(foes,u);
  if(!t||u.state==='halt')return idle0;
  if(u.state==='idle'){
    if(armed<al.length*.5){if(inZone(u.side,u.x))return idle0;const hx=u.side===0?DEPLOY*.45:W-DEPLOY*.45,back=Math.abs(u.x-hx),fwd=u.side===0?W-u.x:u.x;
      if(back<fwd*.8){const v=steer(u,hx,u.y,dt);return{x:v[0],y:v[1],A:false};}}
    const dy=t.y-u.y,go=Math.abs(dy)<16&&!c.lastA;c.lastA=go;return{x:0,y:clamp(dy/20,-1,1),A:go};}
  let ty=t.y,bd=1e9,near=1e9;
  for(const f of foes)for(const o of f.men){if(!o.alive)continue;const ax=(o.x-u.x)*dir;if(ax<-5||ax>300)continue;const d=ax+Math.abs(o.y-u.y)*1.5;if(d<bd){bd=d;ty=o.y;}if(Math.abs(o.y-u.y)<20)near=Math.min(near,Math.abs(ax));}
  let iy=clamp((ty-u.y)/16,-1,1);const av=cavAvoid(u);if(av)iy=av;
  const vt=volleyThreat(u,dir);if(vt&&!av&&near>60&&armed===0)iy=u.y>vt.y?1:-1;
  const slash=near<24&&u.slashCd<=0&&armed<al.length&&!c.lastA;c.lastA=slash;
  return{x:dir,y:iy,A:slash};};
CPU.skirm=function(u,dt,foes,dir,c){const rg=kdOf(u).vol.range,t=bestTarget(u,foes)||nearestBy(foes,u);if(!t)return idle0;
  const dx=(t.x-u.x)*dir;
  if(Math.abs(dx)>rg*3){const v=steer(u,t.x-dir*rg*.8,t.y,dt);return{x:v[0],y:v[1],A:false};}
  const[best,bdx]=alignPair(u,t,dir),iy=Math.abs(best)<200?(Math.abs(best)>1.5?clamp(best/6,-1,1):0):clamp((t.y-u.y)/14,-1,1);
  const ix=dx>rg*.9?dir:dx<rg*.5?-dir:0,fire=Math.abs(best)<3&&bdx<rg&&u.reload<=0&&!c.lastA;c.lastA=fire;
  return{x:ix,y:iy,A:fire};};

/* --- start bitwy: pogoda historyczna, śnieg pod Chocimiem, podpowiedź scenariusza --- */
const _startBattlePL=startBattle;
startBattle=function(){const md=MAPS[eraMaps()[G.mapSel]];_startBattlePL();
  if(md&&md.wx&&G.weatherSel===0)G.weather=md.wx;G.sleet=!!(md&&md.sleet)&&G.weather==='rain';
  if(G.era!=='pl17'||!G.tctx)return;const g=G.tctx;
  if(md.tint){g.fillStyle=md.tint;g.fillRect(0,0,W,H);}else{g.fillStyle='rgba(255,220,150,.05)';g.fillRect(0,0,W,H);}
  if(md.sleet)for(let i=0;i<2600;i++){const x=R()*W,y=R()*H,t=tAt(x,y);if(t===T.WATER||t===T.BRIDGE)continue;g.fillStyle=R()<.5?'rgba(244,246,250,.85)':'rgba(220,226,234,.7)';g.fillRect(Math.round(x),Math.round(y),R()<.3?2:1,1);}
  const V=VARIANTS[G.variant];if(V.tip)msg(0,V.tip);};
const _drawMapPL=drawMap;
drawMap=function(){const md=MAPS[eraMaps()[G.mapSel]],h=!!(md&&md.wx);WEATHERS[0]=h?'Historyczna':'Losowa';WDESC[0]=h?'Pogoda jak w dniu bitwy: deszcz ze śniegiem – wolniejsze ładowanie, działa mogą nie wypalić.':'Pogoda zostanie wylosowana.';_drawMapPL();};

/* --- grafika: żupany, kołpaki, moriony, börki janczarów, skrzydła husarii --- */
function pl17Soldier(x,y,s,right,anim,moving,aim,flag,crew,flash){
  const u=DRAWU,S=SIDE[s],r=spr(x,y,right),skin='#d7ae86',key=u&&u.key;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x-3,y-1,6,2);
  let coat=S.coat,coatD=S.coatD,P=S.pants;if(key==='haj'){coat='#3e5e9e';coatD='#2a4272';P='#3e5e9e';}
  const f=moving?(Math.floor(anim)%2):-1;
  if(f===0){r(-2,-4,1,3,P);r(1,-4,1,3,P);}else if(f===1){r(-1,-4,1,3,P);r(0,-4,1,3,P);}else{r(-2,-4,1,3,P);r(0,-4,1,3,P);}
  const boot=key==='haj'||key==='strz'||key==='jan'?'#7a3020':'#221a12';r(-2,-1,1,1,boot);r(f===0?1:0,-1,1,1,boot);
  const long=key==='strz'||key==='jan';
  r(-2,-8,4,long?6:4,flash?'#fff':coat);r(-2,-8,1,long?6:4,flash?'#fff':coatD);r(-2,-5,4,1,key==='jan'?'#c8a040':'#2a2016');
  r(-1,-10,3,2,skin);
  if(key==='pik'){r(-2,-12,4,2,'#a8aeb2');r(-3,-11,6,1,'#8a9096');r(-1,-13,2,1,'#c8ccd0');r(-2,-8,4,2,flash?'#fff':'#b8bec4');}
  else if(key==='mus'){r(-3,-11,7,1,S.hat);r(-2,-13,4,2,S.hat);r(1,-14,1,1,'#e0c060');}
  else if(key==='strz'){r(-2,-13,4,3,S.hat);r(-2,-11,4,1,'#5a4030');}
  else if(key==='jan'){r(-2,-15,4,5,'#f0ece0');r(-3,-13,1,5,'#d8d2c2');r(-1,-11,3,1,'#c8a040');}
  else if(key==='haj'){r(-2,-12,4,2,'#7a2a22');r(-2,-11,4,1,'#4a3020');r(1,-14,1,2,'#e8e2d0');}
  else{r(-2,-12,4,2,S.hat);r(-2,-11,4,1,'#3a2a1a');}
  if(crew)return true;
  if(key==='pik'){if(u&&u.rf==='phalanx'){r(1,-9,14,1,'#6a4a2a');r(15,-9,2,1,'#c8ccd0');}else{r(2,-26,1,23,'#6a4a2a');r(2,-27,1,2,'#c8ccd0');}}
  else if(aim){r(1,-8,7,1,'#4e3520');r(8,-8,1,1,'#9aa0a6');}
  else{r(2,-15,1,10,'#4e3520');r(2,-16,1,1,'#9aa0a6');
    if(key==='strz'){r(-3,-16,1,12,'#6a4a2a');r(-5,-17,2,4,'#c8ccd0');}else if(key==='haj'){r(-3,-7,1,4,'#6a4a2a');r(-4,-8,2,2,'#c8ccd0');}}
  if(flag)flagAt(r,S,x,-24);
  return true;}
const _eraSoldierPL=eraSoldier;
eraSoldier=function(x,y,s,right,anim,moving,aim,flag,crew,flash){return G.era==='pl17'?pl17Soldier(x,y,s,right,anim,moving,aim,flag,crew,flash):_eraSoldierPL(x,y,s,right,anim,moving,aim,flag,crew,flash);};
function plBlade(r,slash,up){if(slash>=0){const f=Math.min(3,Math.floor(slash*4)),C='#eef2f5';
    if(f===0)r(-1,-21,1,6,C);else if(f===1){for(let k=0;k<6;k++)r(1+k,-19+k,1,1,C);}else if(f===2)r(2,-12,8,1,C);else{for(let k=0;k<5;k++)r(2+k,-11+k,1,1,C);}}
  else if(up)r(1,-21,1,6,'#dfe3e7');else r(1,-11,1,4,'#9aa0a6');}
const WING=[[-3,-13],[-3,-14],[-4,-15],[-4,-16],[-5,-17],[-5,-18],[-5,-19],[-5,-20],[-4,-21],[-4,-22],[-3,-23]];
const _drawRiderPL=drawRider;
drawRider=function(x,y,s,right,anim,moving,charging,flag,hc,flash,lance,slash=-1,noRider=false,rear=false){
  if(G.era!=='pl17'||noRider)return _drawRiderPL(x,y,s,right,anim,moving,charging,flag,hc,flash,lance,slash,noRider,rear);
  _drawRiderPL(x,y,s,right,anim,moving,charging,flag,hc,flash,lance,slash,true,rear);
  x=Math.round(x);y=Math.round(y);const u=DRAWU,m=u&&u.men?DRAWM:null,key=u&&u.key,S=SIDE[s],r0=spr(x,y,right),ry=rear?-2:0,rx=rear?-1:0,r=(dx,dy,w,h,c)=>r0(dx+rx,dy+ry,w,h,c);
  let coat=S.coat,coatD=S.coatD;if(key==='pan'){coat='#8a8e92';coatD='#6a6e72';}else if(key==='rajt'){coat='#3a3c40';coatD='#26282a';}
  r(-1,-9,2,2,S.pants);r(0,-7,1,2,key==='hus'||key==='pan'?'#c8a040':'#1b1712');
  r(-2,-13,3,4,flash?'#fff':coat);r(-2,-13,1,4,flash?'#fff':coatD);r(-1,-15,2,2,'#d7ae86');
  if(key==='hus'){
    r(-1,-13,2,3,flash?'#fff':'#c0c6cc');r(-1,-13,1,1,'#e8ecef');
    r(-2,-17,3,2,'#9aa0a6');r(-1,-18,2,1,'#c8ccd0');r(-3,-15,1,2,'#8a9096');
    r(-3,-12,2,2,'#c8a050');r(-3,-11,1,1,'#5a3a1a');
    const fl=moving&&charging?Math.floor(G.t*12+hc)%2:0;
    WING.forEach(([wx,wy],k)=>{r(wx,wy,1,1,'#6a4a2a');r(wx-1-(k>5?fl:0),wy,1,1,k%2?'#f0ece0':'#c8c2b0');});
    if(!m||m.kopia!==false){const Wd='#d8c088',St='#a83a2a';
      if(charging){for(let k=0;k<20;k++)r(1+k,-13+Math.floor(k/7),1,1,k%4<2?Wd:St);r(21,-10,1,1,'#e8ecef');r(14,-14,4,1,S.flag[0]);r(14,-13,3,1,S.flag[1]);}
      else{r(1,-33,1,22,Wd);for(let k=0;k<22;k+=4)r(1,-33+k,1,2,St);r(1,-34,1,1,'#e8ecef');r(2,-33,5,1,S.flag[0]);r(2,-32,4,1,S.flag[1]);r(3,-31,2,1,S.flag[0]);}}
    else plBlade(r,slash,charging||rear);
    return;}
  if(key==='pan'){r(-2,-17,4,2,'#8a9096');r(-3,-15,1,3,'#6a6e72');r(-1,-18,2,1,'#a8aeb2');}
  else if(key==='sip'){r(-2,-17,4,2,'#f0ece0');r(-1,-18,2,1,'#b8302a');}
  else if(key==='boj'){r(-2,-18,4,3,S.hat);r(-2,-16,4,1,'#5a4030');}
  else if(key==='rajt'){r(-3,-16,6,1,'#1a1a1c');r(-2,-18,4,2,'#1a1a1c');r(-1,-13,2,2,'#5a5e62');}
  else{r(-2,-16,4,1,S.hat);r(-1,-17,2,1,S.hat);}
  if(key==='rajt'){if(u&&u.firedT>2.5){r(1,-12,5,1,'#3a3a3a');r(6,-12,1,1,'#fff4c0');}else r(1,-11,1,3,'#3a3a3a');return;}
  plBlade(r,slash,charging||rear);};
const _eraChip2PL=eraChip2;
eraChip2=function(type,x,y,col){
  if(type==='pik'){ctx.fillStyle=col;ctx.fillRect(x+2,y+1,3,2);ctx.fillRect(x+1,y+3,4,4);ctx.fillRect(x+1,y+7,1,2);ctx.fillRect(x+4,y+7,1,2);ctx.fillRect(x+6,y-4,1,13);return true;}
  if(type==='hus'){ctx.fillStyle=col;ctx.fillRect(x,y+4,8,3);ctx.fillRect(x+7,y+2,2,3);ctx.fillRect(x,y+7,1,2);ctx.fillRect(x+6,y+7,1,2);ctx.fillRect(x+3,y+1,2,3);for(let k=0;k<9;k++)ctx.fillRect(x+2+k,y+2-Math.floor(k/3),1,1);ctx.fillRect(x+1,y-3,1,5);ctx.fillRect(x,y-2,1,3);return true;}
  return _eraChip2PL(type,x,y,col);};


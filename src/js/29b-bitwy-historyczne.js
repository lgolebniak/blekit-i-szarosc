/* ================= BITWY HISTORYCZNE: Kanny, Alezja, Wiedeń, Waterloo, Gettysburg, Monte Cassino ================= */
// każda bitwa: własna mapa, składy stron (często nierówne), opis, wynik historyczny i zdarzenia w czasie (posiłki)
const facOf=(base,o)=>Object.assign({},FACTIONS[base],o);
Object.assign(FACTIONS,{
  carth_k:{keys:['lib','war','sli','num','gcav'],total:12,max:{lib:6,war:6,sli:4,num:4,gcav:3},cry:'carth',colors:FACTIONS.carth.colors,
    info:Object.assign({},FACTIONS.gaul.info,FACTIONS.carth.info,{war:['Galowie i Iberowie','8 ludzi · środek półksiężyca','A: furia – szarża, potem zmęczenie.'],gcav:['Jazda iberyjska','4 jeźdźców · ciężka jazda','Kłus, galop, dęba. A: cios.']}),
    presets:[{n:'Hannibal',lib:4,war:3,sli:2,num:2,gcav:1},{n:'Półksiężyc',lib:3,war:5,sli:2,num:1,gcav:1},{n:'Jazda',lib:3,war:3,sli:1,num:3,gcav:2}]},
  rom_k:{keys:['leg','arc','eq'],total:16,max:{leg:13,arc:4,eq:4},cry:'rom',info:ERAS.rome.info,colors:Object.assign({},ERAS.rome.sides[0],{name:'Rzymianie',gen:'Rzymian'}),
    presets:[{n:'Warron',leg:12,arc:2,eq:2},{n:'Głęboki szyk',leg:13,arc:1,eq:2},{n:'Więcej jazdy',leg:10,arc:2,eq:4}]},
  gaul_a:facOf('gaul',{total:16,max:{war:12,sli:5,gcav:4},cry:'gaul',presets:[{n:'Odsiecz',war:11,sli:3,gcav:2},{n:'Nawała',war:12,sli:2,gcav:2},{n:'Jeźdźcy',war:9,sli:3,gcav:4}]}),
  rp_w:facOf('rp_k',{cry:'rp_k',max:{hus:9,pan:4,haj:4,dz:2},presets:[{n:'Sobieski',hus:7,pan:2,haj:2,dz:1},{n:'Wielka szarża',hus:9,pan:2,haj:0,dz:1},{n:'Z piechotą',hus:6,pan:2,haj:3,dz:1}]}),
  tur_w:facOf('tur',{total:16,cry:'tur',max:{jan:10,sip:6,dz:3},presets:[{n:'Kara Mustafa',jan:9,sip:5,dz:2},{n:'Janczarzy',jan:10,sip:3,dz:3},{n:'Spahisi',jan:8,sip:6,dz:2}]}),
  brit:{keys:['inf','cav','art'],total:12,max:{inf:9,cav:4,art:3},info:null,cry:'brit',
    colors:{name:'Brytyjczycy',gen:'Wellingtona',coat:'#b0302a',coatD:'#7a1e18',pants:'#d8d4c8',hat:'#1a1a1a',ui:'#ff8a7a',uiD:'#7a2a22',flag:['#1e3a8a','#c8102e']},
    presets:[{n:'Wellington',inf:7,cav:3,art:2},{n:'Czworoboki',inf:9,cav:1,art:2},{n:'Jazda',inf:6,cav:4,art:2}]},
  fr:{keys:['inf','cav','lan','art'],total:14,max:{inf:8,cav:4,lan:3,art:4},info:null,cry:'fr',
    colors:{name:'Francuzi',gen:'Napoleona',coat:'#2a3f8f',coatD:'#1c2b63',pants:'#e8e4d8',hat:'#1a1a1a',ui:'#8fb0ff',uiD:'#2a3f8f',flag:['#2a3f8f','#f0ece0']},
    presets:[{n:'Napoleon',inf:6,cav:3,lan:2,art:3},{n:'Kirasjerzy',inf:5,cav:4,lan:2,art:3},{n:'Wielka bateria',inf:6,cav:2,lan:2,art:4}]},
  union_g:facOf('union',{keys:['inf','cav','art'],total:12,max:{inf:9,cav:2,art:4},cry:'union',presets:[{n:'Meade',inf:8,cav:1,art:3},{n:'Mur piechoty',inf:9,cav:1,art:2},{n:'Działa',inf:7,cav:1,art:4}]}),
  confed_g:facOf('confed',{keys:['inf','cav','art'],total:14,max:{inf:10,cav:2,art:4},cry:'confed',presets:[{n:'Lee i Pickett',inf:9,cav:1,art:4},{n:'Szarża',inf:10,cav:2,art:2},{n:'Kanonada',inf:8,cav:2,art:4}]}),
  pl_c:facOf('pl',{total:14,cry:'pl',presets:[{n:'Anders',rif:6,mg:2,ppk:1,tank:2,at:1,mor:2},{n:'Szturm',rif:7,mg:2,ppk:1,tank:1,at:1,mor:2},{n:'Pancerni',rif:5,mg:2,ppk:1,tank:3,at:1,mor:2}]}),
  de_c:facOf('de',{total:12,cry:'de',presets:[{n:'Spadochroniarze',rif:5,mg:3,ppk:0,tank:1,at:2,mor:1},{n:'Gniazda ckm',rif:4,mg:4,ppk:0,tank:1,at:2,mor:1},{n:'Obrona',rif:6,mg:3,ppk:0,tank:0,at:2,mor:1}]})
});
Object.assign(VARIANTS,{
  cannae:{era:'rome',scen:true,fac:['carth_k','rom_k'],sub:'Kanny · 2 sierpnia 216 p.n.e. · Hannibal kontra Rzym',hud:'Kanny 216 p.n.e.',
    tip:'Wpuść legiony w środek, potem zamknij je z boków jazdą.',
    hist:'Historycznie: ok. 50 tys. żołnierzy Hannibala okrążyło ok. 80 tys. Rzymian; zginęło 50–70 tys. Rzymian.'},
  alesia:{era:'rome',scen:true,fac:['caesar','gaul_a'],sub:'Alezja · wrzesień 52 p.n.e. · Cezar kontra Galowie',hud:'Alezja 52 p.n.e.',
    tip:'Utrzymaj palisadę – za nią legiony i machiny są groźne.',
    hist:'Historycznie: Rzymianie odparli wielką armię odsieczy, Wercyngetoryks skapitulował, a Galia uległa Rzymowi.',
    events:[{t:75,side:1,add:{war:3,gcav:1},msg:'Wercassivellaunus prowadzi odsiecz – nowe hufce Galów!'}]},
  vienna:{era:'pl17',scen:true,fac:['rp_w','tur_w'],sub:'Wiedeń · 12 września 1683 · Sobieski kontra Kara Mustafa',hud:'Wiedeń 1683',
    tip:'Zejdź ze wzgórz i rozbij obóz turecki – husaria przesądzi bitwę.',
    hist:'Historycznie: ok. 70 tys. żołnierzy Sobieskiego i cesarskich rozbiło ponad 100 tys. Turków. Wiedeń ocalał.',
    events:[{t:60,side:0,add:{hus:3},msg:'Z Kahlenbergu rusza husaria – największa szarża jazdy w dziejach!'}]},
  waterloo:{era:'acw',scen:true,fac:['brit','fr'],sub:'Waterloo · 18 czerwca 1815 · Wellington kontra Napoleon',hud:'Waterloo 1815',
    tip:'Trzymaj grzbiet i folwarki – po południu nadejdą Prusacy.',
    hist:'Historycznie: Wellington utrzymał grzbiet, a nadejście Prusaków Blüchera przesądziło o klęsce Napoleona.',
    events:[{t:100,side:0,add:{inf:2,cav:1,art:1},msg:'Prusacy Blüchera nadciągają z lewej flanki!'}]},
  gett:{era:'acw',scen:true,fac:['union_g','confed_g'],sub:'Gettysburg · 3 lipca 1863 · Meade kontra Lee (szarża Picketta)',hud:'Gettysburg 1863',
    tip:'Za kamiennym murkiem jesteś bezpieczniejszy – niech przyjdą przez pole.',
    hist:'Historycznie: ok. 12,5 tys. Konfederatów ruszyło na Cmentarny Grzbiet; ponad połowa padła, została ranna lub trafiła do niewoli.'},
  cassino:{era:'ww2',scen:true,fac:['pl_c','de_c'],sub:'Monte Cassino · maj 1944 · II Korpus Polski kontra Niemcy',hud:'Monte Cassino 1944',
    tip:'Skały zatrzymują kule – kruszą je tylko działa i czołgi.',
    hist:'18 maja 1944 Polacy zatknęli flagę na ruinach klasztoru. Poległo ponad 900 polskich żołnierzy.'}
});
Object.assign(VAR_LABEL,{cannae:'Bitwa pod Kannami',alesia:'Oblężenie Alezji',vienna:'Odsiecz wiedeńska',waterloo:'Bitwa pod Waterloo',gett:'Bitwa pod Gettysburgiem',cassino:'Bitwa o Monte Cassino'});
VAR_ORDER.length=0;VAR_ORDER.push('rome','rome_c','cannae','rome_g','alesia','kirch','klusz','choc','vienna','waterloo','acw','gett','ww2','cassino');

MAPS.push(
{era:'rome',scen:'cannae',name:'Kanny',seed:201,
 desc:'2 sierpnia 216 p.n.e. Hannibal stawia Galów i Iberów półksiężycem w środku, Libijczyków na skrzydłach. Gdy legiony wepchną się w środek, zamknij je z boków jazdą.',
 build(m){m.fill(T.GRASS);
  m.path([[-10,508],[260,496],[520,512],[760,498],[970,506]],30,T.WATER);m.rect(300,486,40,30,T.FORD);m.rect(660,484,40,30,T.FORD);
  m.circle(310,110,24,T.FOREST,.5);m.circle(650,130,26,T.FOREST,.5);m.circle(480,60,22,T.FOREST,.5);
  m.circle(230,330,44,T.WHEAT,.3);m.circle(740,350,46,T.WHEAT,.3);m.hill(110,250,70,1);m.hill(860,250,60,1);
  m.path([[0,240],[960,250]],8,T.ROAD);}},
{era:'rome',scen:'alesia',name:'Alezja',seed:207,
 desc:'Wrzesień 52 p.n.e. Cezar otoczył Alezję wałami. Od zewnątrz uderza armia odsieczy Galów. Za palisadą i rowami legiony i machiny są groźne – trzymaj bramy.',
 build(m){m.fill(T.GRASS);
  m.hill(70,90,70,1);m.hill(60,80,34,2);m.rect(30,60,30,20,T.HOUSE);m.rect(76,96,24,16,T.HOUSE);
  m.path([[340,30],[340,530]],10,T.MUD);m.path([[366,30],[366,530]],8,T.MUD);
  m.path([[312,34],[312,150]],6,T.PALISADE);m.path([[312,196],[312,346]],6,T.PALISADE);m.path([[312,392],[312,530]],6,T.PALISADE);
  for(const[x,y]of[[410,80],[430,240],[405,300],[425,460]])m.path([[x,y],[x+14,y+24]],6,T.FENCE);
  m.hill(780,110,95,1);m.hill(800,100,45,2);m.circle(620,430,60,T.FOREST,.35);m.circle(880,440,46,T.FOREST,.3);m.circle(540,200,40,T.WHEAT,.3);
  m.path([[312,173],[960,180]],8,T.ROAD);}},
{era:'pl17',scen:'vienna',name:'Wiedeń',seed:213,
 desc:'12 września 1683. Odsiecz Sobieskiego schodzi ze wzgórz Lasu Wiedeńskiego na obóz Kara Mustafy. Winnice i rowy spowalniają marsz, a w obozie czekają janczarzy.',
 build(m){m.fill(T.GRASS);
  m.path([[-10,40],[300,52],[600,38],[970,48]],34,T.WATER);
  m.hill(130,280,200,1,.3);m.hill(110,280,110,2,.3);
  m.circle(40,150,50,T.FOREST,.35);m.circle(50,440,56,T.FOREST,.35);m.circle(220,100,36,T.FOREST,.4);m.circle(230,470,38,T.FOREST,.4);
  m.rect(300,150,90,60,T.WHEAT);m.rect(300,330,90,60,T.WHEAT);m.circle(470,280,30,T.MUD,.4);
  for(const[x,y]of[[700,160],[750,210],[690,340],[780,390],[840,150],[860,300],[720,450]])m.rect(x,y,18,12,T.HOUSE);
  m.path([[900,90],[880,140],[905,190],[885,240]],8,T.TRENCH);m.rect(930,70,30,50,T.HOUSE);
  m.path([[0,290],[960,270]],10,T.ROAD);}},
{era:'acw',scen:'waterloo',name:'Waterloo',seed:219,
 desc:'18 czerwca 1815. Wellington trzyma grzbiet Mont-Saint-Jean, przed nim folwarki Hougoumont i La Haye Sainte. Ziemia rozmiękła po ulewie. Wytrwaj do nadejścia Prusaków.',
 build(m){m.fill(T.GRASS);
  for(const y of[110,200,290,380,450])m.hill(210,y,95,1,.25);for(const y of[130,270,410])m.hill(780,y,90,1,.25);
  for(const[a,b]of[[40,120],[160,250],[310,400],[440,520]])m.path([[300,a],[300,b]],6,T.FENCE);
  m.path([[372,74],[452,74]],6,T.WALL);m.path([[372,74],[372,150]],6,T.WALL);m.path([[372,150],[452,150]],6,T.WALL);m.path([[452,74],[452,98]],6,T.WALL);m.path([[452,126],[452,150]],6,T.WALL);
  m.rect(388,92,30,22,T.HOUSE);m.circle(500,110,30,T.FOREST,.4);
  m.rect(420,300,30,22,T.HOUSE);m.path([[408,290],[468,290]],6,T.WALL);m.path([[408,340],[468,340]],6,T.WALL);
  m.circle(560,220,40,T.MUD,.5);m.circle(600,380,50,T.MUD,.5);m.circle(520,470,40,T.WHEAT,.3);m.circle(640,120,46,T.WHEAT,.3);
  m.path([[0,280],[960,276]],10,T.ROAD);m.rect(840,240,24,18,T.HOUSE);}},
{era:'acw',scen:'gett',name:'Gettysburg',seed:225,
 desc:'3 lipca 1863. Po kanonadzie 150 dział Konfederaci Lee idą przez otwarte pole na Cmentarny Grzbiet. Unia czeka za kamiennym murkiem; płoty przy drodze spowalniają atak.',
 build(m){m.fill(T.GRASS);
  m.hill(170,280,170,1,.25);m.hill(90,80,60,2);m.hill(110,480,55,2);m.circle(110,488,26,T.ROCK,.35);
  m.path([[262,110],[262,250],[285,262],[285,420]],6,T.WALL);m.circle(240,255,18,T.FOREST,.4);
  m.hill(810,280,150,1,.25);for(const y of[80,210,340,470])m.circle(950,y,34,T.FOREST,.3);
  m.path([[520,-10],[560,560]],10,T.ROAD);
  for(const o of[-16,16])for(const[a,b]of[[0,110],[150,250],[290,400],[440,540]])m.path([[520+o+a*40/570,a],[520+o+b*40/570,b]],6,T.FENCE);
  m.circle(420,160,40,T.WHEAT,.3);m.circle(670,380,50,T.WHEAT,.3);m.rect(600,120,20,16,T.HOUSE);}},
{era:'ww2',scen:'cassino',name:'Monte Cassino',seed:231,mines:[[560,330,60,60,6]],minesOne:true,
 desc:'Maj 1944. II Korpus gen. Andersa szturmuje wzgórza pod Monte Cassino. Niemieccy spadochroniarze bronią się w skałach i ruinach klasztoru.',
 build(m){m.fill(T.GRASS);
  m.hill(840,270,150,1,.3);m.hill(850,260,80,2,.3);m.hill(560,110,100,1,.3);m.hill(570,100,50,2,.3);m.hill(460,430,80,1,.3);
  m.circle(500,230,30,T.ROCK,.4);m.circle(640,190,26,T.ROCK,.4);m.circle(690,420,34,T.ROCK,.4);m.circle(420,80,22,T.ROCK,.4);m.circle(760,110,24,T.ROCK,.4);
  m.circle(860,260,52,T.RUINS,.35);m.rect(842,236,20,16,T.HOUSE);m.rect(880,280,16,14,T.HOUSE);
  m.path([[720,120],[734,170],[720,220],[734,270],[720,330],[734,380],[720,430]],8,T.TRENCH);m.path([[640,300],[640,350]],6,T.WIRE);
  m.circle(120,120,56,T.FOREST,.35);m.circle(160,460,56,T.FOREST,.35);m.circle(300,300,40,T.FOREST,.4);
  m.path([[0,300],[200,320],[380,280],[600,330],[780,300],[960,320]],8,T.ROAD);}}
);

// zdarzenia scenariusza: posiłki wchodzą do odwodu; rodzaj bez oddziału na polu wchodzi od razu
function scenTick(dt){const V=VARIANTS[G.variant];if(!V||!V.events||G.state!=='battle')return;
  V.events.forEach((e,i)=>{if(G.evDone[i]||G.t<e.t)return;G.evDone[i]=true;
    for(const k in e.add){if(!TY(e.side).includes(k)||!e.add[k])continue;G.res[e.side][k]=(G.res[e.side][k]||0)+e.add[k];
      if(!units.some(u=>u.side===e.side&&u.key===k&&!u.dead&&!u.gone)&&!G.spawnQ.some(q=>q.side===e.side&&q.key===k))clQueue(e.side,k,0);}
    msg(e.side,e.msg);AU.bugle(BUG.charge);});}

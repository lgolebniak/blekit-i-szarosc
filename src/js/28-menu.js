/* ================= MENU ================= */
const INK='#f0e2b0',BRASS='#c9a24a',DIM='#a39a80';
function panel(x,y,w,h,edge){ctx.fillStyle='rgba(12,15,13,.86)';ctx.fillRect(x,y,w,h);ctx.fillStyle=edge||'#6a5a30';ctx.fillRect(x,y,w,2);ctx.fillRect(x,y+h-1,w,1);}
function bgField(){const m=MAPDATA[eraMaps()[G.mapSel]]||MAPDATA[0];if(m){ctx.drawImage(m.canvas,0,0);}else{ctx.fillStyle='#2c3a22';ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='rgba(8,10,9,.55)';ctx.fillRect(0,0,W,H);if(vignette)ctx.drawImage(vignette,0,0);}
function wrap(s,x,y,maxW,lh,size,col,align='left'){ctx.font=`${size}px ${FONT_T}`;const words=s.split(' ');let line='';for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(line,x,y,size,col,align);y+=lh;line=w;}else line=t;}if(line)txt(line,x,y,size,col,align);return y;}
const TITLE_ITEMS=['Epoka','Strony','Dwóch graczy','Gracz kontra komputer','Sterowanie'];
const VAR_LABEL={acw:'Wojna secesyjna',rome:'Rzym: wojna domowa',rome_c:'Rzym kontra Kartagina',rome_g:'Rzym kontra Galowie',ww2:'Wrzesień 1939'};
const sumArmy=(a,p)=>TY(p).reduce((s,k)=>s+(a[k]||0),0);
// scenariusz historyczny ma własną mapę; zwykła epoka pokazuje mapy bez scenariusza
const eraMaps=()=>{const sc=VARIANTS[G.variant].scen;return MAPS.map((m,i)=>m.era===G.era&&(sc?m.scen===G.variant:!m.scen)?i:-1).filter(i=>i>=0);};
const TOT=p=>FAC[p].total||12;
function stepTitle(){const a=input.any;
  if(G.help){if(a.nl||a.nr){G.helpPage=((G.helpPage||0)+(a.nr?1:2))%3;AU.ui();}if(a.a||a.b||a.start){G.help=false;AU.ui();}return;}
  if(a.y&&input.pads){swapPads();AU.ok2();return;}
  const NT=TITLE_ITEMS.length;if(a.nu){G.sel0=(G.sel0+NT-1)%NT;AU.ui();}if(a.nd){G.sel0=(G.sel0+1)%NT;AU.ui();}
  if(G.sel0===1&&(a.nl||a.nr||a.a)){G.sides=((G.sides||0)+(a.nl?2:1))%3;setVariant(G.variant);AU.ok2();return;}
  if(G.sel0===0&&(a.nl||a.nr||a.a)){const L=VAR_ORDER.length,i=VAR_ORDER.indexOf(G.variant),n=VAR_ORDER[(i+(a.nl?L-1:1))%L];setVariant(n);AU.ok2();return;}
  if(a.a||a.start){AU.ok2();if(G.sel0===4){G.help=true;return;}G.mode=G.sel0===3?'cpu':'pvp';
    for(let p=0;p<2;p++){G.army[p].ready=false;G.army[p].row=0;}
    if(G.mode==='cpu'&&input.slot[0]===null&&input.slot[1]!==null)swapPads();
    if(G.mode==='cpu'){const pi=Math.floor(R()*PR(1).length),pr=PR(1)[pi];for(const k of TY(1))G.army[1][k]=pr[k]||0;Object.assign(G.army[1],{ready:true,preset:pi});}
    G.state='army';}}
// podpowiedź o padach: https, podgląd, Xbox (tryb „Sterowanie grą”), brak padu
function padNote(){
  if(!input.api||!input.secure)return['Pady działają tylko na stronie https:// albo z pliku otwartego w przeglądarce.',true];
  if(input.blocked)return['Pady zablokowane w podglądzie – otwórz grę bezpośrednio w przeglądarce.',true];
  if(input.browse)return['Pad działa jak mysz przeglądarki: przytrzymaj Menu (≡) i wybierz „Sterowanie grą”.',true];
  if(!input.pads&&input.xbox)return['Xbox: przytrzymaj przycisk Menu (≡) i wybierz „Sterowanie grą”, potem naciśnij A.',true];
  if(!input.pads)return['Podłącz pad i naciśnij A · pierwszy pad = Gracz 1, drugi = Gracz 2',false];
  if(!AU.ok())return['Naciśnij przycisk, aby włączyć dźwięk.',false];
  return[`A – wybierz · drążek – przewijaj${input.pads?' · Y – zamień pady graczy':''}`,false];}
function msgPad(i){G.padMsg={i,t:G.t};AU.ok2();if(G.state==='battle'||G.state==='deploy')msg(i,`Pad ${input.slot[i]+1} steruje: Gracz ${i+1}`);}
function drawTitle(){bgField();
  // przelatujący dym
  const t=G.t;for(let i=0;i<14;i++){const x=(i*97+t*14)%(W+80)-40,y=320+Math.sin(i*1.7+t*.3)*120;ctx.globalAlpha=.08;pdisc(ctx,x,y,26+i%3*8,'#e6e3da');}ctx.globalAlpha=1;
  txt(VARIANTS[G.variant].sub,W/2,92,22,BRASS,'center');
  txt('Błękit i Szarość',W/2,168,76,INK,'center',true);
  txt({acw:'Bitwy na dwa pady: piechota, konnica, armaty',rome:'Legiony, łucznicy, jazda i machiny oblężnicze',ww2:'Piechota, ckm, czołgi, działa i moździerze',pl17:'Husaria, pancerni, piechota i działa Rzeczypospolitej'}[G.era],W/2,204,24,DIM,'center');
  const V=VARIANTS[G.variant],sd=['Strony historyczne',`Obie strony: ${sideName(V,0)}`,`Obie strony: ${sideName(V,1)}`][G.sides||0];
  TITLE_ITEMS.forEach((s0,i)=>{const lab=i===0?VAR_LABEL[G.variant]:i===1?sd:s0,s=i<2&&G.sel0===i?`◀  ${lab}  ▶`:lab,y=262+i*38,on=G.sel0===i;if(on){ctx.fillStyle='rgba(201,162,74,.16)';ctx.fillRect(W/2-230,y-27,460,36);ctx.fillStyle=BRASS;ctx.fillRect(W/2-230,y-27,3,36);}
    txt(s,W/2,y,i===1?(on?26:24):(on?34:30),on?INK:DIM,'center',true);});
  const pads=[0,1].map(p=>`Gracz ${p+1} · ${SIDE[p].name}: ${input.slot[p]!==null?input.ctl[p].src:input.pads?'naciśnij A na padzie':input.ctl[p].src}`);
  const fl=G.padMsg&&G.t-G.padMsg.t<1.5?G.padMsg.i:-1;
  txt(pads[0],24,H-44,18,fl===0?INK:SIDE[0].ui);txt(pads[1],W-24,H-44,18,fl===1?INK:SIDE[1].ui,'right');
  const [note,bad]=padNote();txt(note,W/2,H-16,bad?16:18,bad?'#ff9a7a':BRASS,'center');
  if(G.help)drawHelp();}
function drawHelp(){panel(40,40,W-80,H-80,BRASS);const pg=G.helpPage||0;
  if(pg===2){drawMatchups();txt('◀ ▶ kolejna strona · A / B – wróć',W/2,H-52,18,BRASS,'center');return;}
  txt(pg===0?'Sterowanie · zasady klasyczne':'Sterowanie · zasady taktyczne',W/2,82,32,INK,'center',true);
  const ERAROWS={rome:[['Lewy drążek','Wszyscy idą równolegle. Legion: przód = kolumna marszowa (w linii), góra–dół = szyk. Jazda: ruszają w przód, galop, w tył = dęba. Machiny: tylko góra i dół.','WASD','Strzałki'],
    ['A','Legion: zmiana szyku linia → żółw → klin → koło · Łucznicy: trzymaj = odległość, puść = salwa · Jazda: cios · Balista: bełt · Onager: trzymaj = siła','F / Spacja','Enter / K'],
    ['RT','Legion: rzut pilum (tylko linia i klin) – pilum rozbija żółwia','V','M'],
    ['Kartagina / Galowie','Libijczycy: A = linia ↔ falanga · procarze jak łucznicy · Numidowie: ruch w każdą stronę, A = oszczepy · słonie: A = szarża, ranne wpadają w panikę · Galowie: A = furia, potem zmęczenie','',''],['X / Y / B','Legion i łucznicy / jazda / balista i onager','R/T/G','J/I/L'],['LB / RB','Poprzedni / następny oddział','Q / E','U / O'],['Start / drążek','Pauza','Esc / 1','Backspace / 0']],
   ww2:[['Lewy drążek','Wszyscy idą równolegle. Czołg jeździ w każdą stronę, ale strzela tylko w przód i po skosach. Działo i moździerz tylko góra–dół.','WASD','Strzałki'],
    ['A','Krótko = strzał na wprost, trzymaj = skos do 45° (drążek góra–dół), puść = strzał · Ckm: trzymaj = seria, drążek sieje na boki · Czołg: trzymaj = kierunek, drugie A = odległość · Moździerz: trzymaj = siła','F / Spacja','Enter / K'],
    ['RT','Piechota: granat · Czołg: karabin maszynowy · Moździerz: odłamkowy / dymny','V','M'],['X / Y / B','Piechota, ckm, rusznica / czołg / działo i moździerz','R/T/G','J/I/L'],['LB / RB','Poprzedni / następny oddział','Q / E','U / O'],['Start / drążek','Rozstawienie: gotowi · w bitwie: pauza','Esc / 1','Backspace / 0'],
    ['Samoobrona','Oddziały bez sterowania same strzelają w obronie do 75% zasięgu: piechota, ckm, rusznica, czołg. Moździerz i działo tylko pod Twoim sterowaniem. Ostrzał na wprost niszczy worki, ruiny, domy i murki – granat i moździerz lecą nad nimi.','','']],
   pl17:[['Lewy drążek','Husaria w stępie: każdy kierunek. W szarży: góra–dół, w tył = zwrot. Pancerni, spahisi: jak szabliści. Rajtaria: każdy kierunek. Działa: góra–dół.','WASD','Strzałki'],
    ['A','Husaria: szarża, potem cios koncerzem · Piechota: salwa · Pikinierzy: linia ↔ jeż · Rajtaria: pistolety · Działo: trzymaj = siła','F / Spacja','Enter / K'],
    ['RT','Husaria w szarży: linia ↔ klin','V','M'],
    ['Kopie','Kopia husarza jest dłuższa od piki i pęka przy uderzeniu. Nowe kopie: po przejeździe przez pole albo 3 s postoju w swojej strefie.','',''],
    ['X / Y / B','Piechota i pikinierzy / jazda i husaria / działa','R/T/G','J/I/L'],['LB / RB','Poprzedni / następny oddział','Q / E','U / O'],['Start / drążek','Pauza','Esc / 1','Backspace / 0']]};
  const rows=pg===0&&ERAROWS[G.era]?ERAROWS[G.era]:pg===0?[['Lewy drążek','Wszyscy idą równolegle. Piechota: marsz w przód wydłuża kolumnę, góra–dół wraca do szyku. Szabliści: w przód ruszają w szyku, trzymany w przód = galop w kolumnie, w tył = konie stają dęba i stoją (wtedy ruch w pionie i do przodu, bez cofania; przytrzymany przód = znów szarża). Ułani: stępa w każdą stronę. Armata: góra i dół; przy trzymanym A drążek góra/dół zmienia kąt.','WASD','Strzałki'],
    ['A lub RT','Piechota: salwa na wprost · Szabliści: cięcie (tylko wtedy zabijają) · Ułani: szarża sprintem jeden za drugim, kolejne A: linia → klin → kolumna, po przejechaniu wjeżdżają od nowa · Armata: trzymaj = siła, puść = strzał; kąt płaski (<45°) = jedno odbicie, 50% zabicia; wysoki (≥45°) = bez odbicia, 100%','F / Spacja','Enter / K'],
    ['X','Wybierz piechotę','R','J'],['Y','Wybierz konnicę / ułanów (kolejno)','T','I'],['B','Wybierz armatę (drugi raz – druga armata)','G','L'],
    ['LB / RB','Poprzedni / następny oddział','Q / E','U / O'],['Start / drążek','Pauza','Esc / 1','Backspace / 0']]
   :[['Lewy drążek','Ruch wybranego oddziału','WASD','Strzałki'],['Prawy drążek','Obrót frontu bez zmiany kierunku marszu','Z / C','< / >'],
    ['A lub RT','Salwa · szarża (trzymaj) · armata: trzymaj = odległość, puść = strzał','F / Spacja','Enter / K'],['X','Szyk: linia → kolumna → czworobok · armata: kula / kartacz','R','J'],
    ['Y','Postawa oddziału: Trzymaj / Naprzód','T','I'],['LB / RB','Poprzedni / następny oddział','Q / E','U / O'],['B','Zryw: morale +40 w promieniu (co 40 s)','G','L'],
    ['Krzyżak ↑ / ↓','Cała armia: Naprzód / Trzymaj','2 / 3','P / ;'],['LT','Pokaż zasięgi i morale','L. Shift','P. Shift'],['Start / drążek','Gotowi (rozstawienie) · pauza','Esc / 1','Backspace / 0']];
  txt('PAD XBOX',70,118,17,BRASS);txt('AKCJA',230,118,17,BRASS);txt('GRACZ 1',690,118,17,SIDE[0].ui);txt('GRACZ 2',800,118,17,SIDE[1].ui);
  let y=144;for(const r of rows){txt(r[0],70,y,19,INK);const ey=wrap(r[1],230,y,440,16,17,'#cfc6a8');txt(r[2],690,y,17,DIM);txt(r[3],800,y,17,DIM);y=Math.max(y+28,ey+22);}
  if(pg===0)wrap('Sterujesz jednym oddziałem naraz, pozostałe stoją. Rzekę przejdziesz tylko brodem lub mostem – w głębinie żołnierze toną. Kula armatnia robi dziurę w moście.',70,y+6,820,18,17,BRASS);
  txt('◀ ▶ kolejna strona · A / B – wróć',W/2,H-52,18,BRASS,'center');}
function armyAdjust(a,type,d,p){const sum=sumArmy(a,p);
  if(d<0){if(a[type]>0)a[type]--;else return AU.bad();}
  else{if(a[type]>=MX(p)[type])return AU.bad();if(sum>=TOT(p)){const others=TY(p).filter(t=>t!==type&&a[t]>0).sort((x,y)=>a[y]-a[x]);if(!others.length)return AU.bad();a[others[0]]--;}a[type]++;}
  AU.ui();}
function stepArmy(){
  for(let p=0;p<2;p++){if(isCPU(p))continue;const c=input.ctl[p],a=G.army[p];
    if(a.ready){if(c.p.b||c.p.a||c.p.start){a.ready=false;AU.ui();}continue;}
    const NR=TY(p).length+1;if(c.p.nu){a.row=(a.row+NR-1)%NR;AU.ui();}if(c.p.nd){a.row=(a.row+1)%NR;AU.ui();}
    const types=TY(p);
    if(a.row<types.length){if(c.p.nl)armyAdjust(a,types[a.row],-1,p);if(c.p.nr)armyAdjust(a,types[a.row],1,p);}
    if(c.p.x){a.preset=(a.preset+1)%PR(p).length;const pr=PR(p)[a.preset];for(const k of types)a[k]=pr[k]||0;AU.ui();}
    if(c.p.start||(c.p.a&&a.row===types.length)){if(sumArmy(a,p)===TOT(p)){a.ready=true;AU.ok2();}else AU.bad();}
    else if(c.p.a)a.row=Math.min(types.length,a.row+1);
    if(c.p.b){G.state='title';AU.ui();return;}}
  if(G.army[0].ready&&G.army[1].ready){G.state='map';G.mapRow=0;}}
const TYPEINFO={inf:['Piechota','6 żołnierzy · salwa na wprost','Klasyczne: marsz w przód = kolumna, góra–dół = powrót do szyku.'],
  cav:['Kawaleria z szablami','4 jeźdźców · kłus w szyku, galop w kolumnie','Zabija tylko przy cięciu (Fire). Groźna dla kanonierów.'],
  lan:['Ułani z kopiami','4 jeźdźców · kopie opuszczone do szarży','Kłują w pędzie bez Fire. Najmocniejsi w galopie.'],
  art:['Artyleria','armata + 3 kanonierów · kula z odbiciem','Kula odbija się, przebija szeregi i dziurawi mosty.']};
function drawArmy(){bgField();txt('Skład armii',W/2,46,38,INK,'center',true);txt(TOT(0)===TOT(1)?`${TOT(0)} oddziałów na gracza · w zasadach klasycznych wchodzą na pole kolejno z odwodu`:`Scenariusz: ${SIDE[0].name} ${TOT(0)} oddziałów, ${SIDE[1].name} ${TOT(1)} · wchodzą kolejno z odwodu`,W/2,70,19,DIM,'center');
  for(let p=0;p<2;p++){const a=G.army[p],S=SIDE[p],x=p===0?20:490,y=82,w=450,h=430;panel(x,y,w,h,S.ui);
    if(S.name.length>10){txt(isCPU(p)?'Komputer':'Gracz '+(p+1),x+16,y+18,15,DIM);txt(S.name,x+16,y+40,22,S.ui,'left',true);}
    else txt(`${isCPU(p)?'Komputer':'Gracz '+(p+1)} · ${S.name}`,x+16,y+32,24,S.ui,'left',true);
    const TP=TY(p),sum=sumArmy(a,p),RH=TP.length>5?54:TP.length>4?64:80,SC=TP.length>5?1.6:2;txt(`Wzorzec [X]: ${PR(p)[a.preset].n}`,x+w-16,y+20,15,DIM,'right');txt(`Oddziały ${sum}/${TOT(p)}`,x+w-16,y+37,15,sum===TOT(p)?'#9fe07a':'#e0a060','right');
    TP.forEach((t,i)=>{const ry=y+46+i*RH,on=a.row===i&&!a.ready&&!isCPU(p),kd=KD[t];
      if(on){ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(x+8,ry,w-16,RH-4);ctx.fillStyle=S.ui;ctx.fillRect(x+8,ry,3,RH-4);}
      ctx.save();ctx.translate(x+40,ry+RH-(SC<2?12:18));ctx.scale(SC,SC);const an=G.t*6;
      const fake={x:0,y:0,fa:0,recoil:0,side:p,key:t,rf:'line',type:kd.base,reload:0,anim:an,hitFlash:0,track:false,aiming:false,supT:0,panicT:0,moving:false,hd:p?Math.PI:0};DRAWU=fake;DRAWI=1;
      if(kd.base==='inf')drawSoldier(0,0,p,true,an,on,false,false,false,false);else if(kd.base==='cav')drawRider(0,0,p,true,an,on,on,false,p+(kd.lance?2:0),false,!!kd.lance);
      else if(kd.base==='tank')drawTank(fake,0,0);else if(kd.base==='ele')drawElephant(fake,0,0);else if(GUNDRAW[t])GUNDRAW[t](fake,0,0);else drawGun(fake);
      DRAWU=null;ctx.restore();
      const info=INFO(p)[t],small=RH<80;txt(info[0],x+78,ry+(small?19:22),small?20:22,INK);txt(info[1],x+78,ry+(small?35:40),16,'#cfc6a8');if(RH>=60)wrap(info[2],x+78,ry+(small?51:57),small?290:270,15,15,DIM);
      txt(on?'◀':'',x+w-96,ry+RH/2+6,26,BRASS,'center');txt(String(a[t]||0),x+w-64,ry+RH/2+10,40,INK,'center',true);txt(on?'▶':'',x+w-32,ry+RH/2+6,26,BRASS,'center');});
    const ry=y+h-52,on=a.row===TP.length||a.ready;
    ctx.fillStyle=a.ready?'rgba(120,200,110,.25)':on?'rgba(201,162,74,.25)':'rgba(255,255,255,.05)';ctx.fillRect(x+16,ry,w-32,40);
    txt(a.ready?'GOTOWI DO BOJU':'Gotowi [A / Start]',x+w/2,ry+29,26,a.ready?'#9fe07a':on?INK:DIM,'center',true);}
  txt('Drążek: wybór i zmiana liczby · X: gotowy wzorzec · B: wstecz',W/2,H-10,17,BRASS,'center');}
const WEATHERS=['Losowa','Pogodnie','Deszcz','Mgła'];
const WDESC=['Pogoda zostanie wylosowana.','Pełna widoczność.','Deszcz: wolniejsze ładowanie, gorsza celność, armaty mogą nie wypalić.','Mgła: oddziały nie widzą wroga dalej niż 170 kroków (tryb taktyczny). Armata celowana ręcznie strzela na pełny zasięg.'];
const RDESC={classic:'Zasady klasyczne, jak na Amidze: sterujesz jednym oddziałem naraz, żołnierze idą równolegle, konnica pędzi tylko do przodu, armaty jeżdżą góra–dół. Na polu 1 piechota, 1 konnica i 2 armaty – reszta czeka w odwodzie.',
  tac:'Zasady taktyczne: wszystkie 12 oddziałów naraz, szyki, morale i ucieczki, zryw, flanki i sztandar do zdobycia w centrum.'};
const ADESC='Amunicja ograniczona (tryb klasyczny): czołg 12, działo ppanc 14, moździerz 10, rusznica 10, armata 15, onager 8, balista 14 strzałów. Czołg i rusznica uzupełniają zapasy, stojąc w swojej strefie. Nowy oddział z odwodu ma pełny zapas.';
const VXDESC=()=>'Okrzyki bojowe: chór męski syntezowany w grze (działa offline) i lektor z syntezy mowy przeglądarki. '+(TTS.ok&&TTS.voices.length?`Głosy lektora w systemie: ${TTS.voices.length}.`:'Ta przeglądarka nie ma głosów syntezy – zostaje sam chór.');
const VDESC='Widok ukośny: pole widziane pod kątem jak w oryginale. Z góry: płaski widok taktyczny.';
function stepMap(){const a=input.any,N=7;
  if(a.nu){G.mapRow=(G.mapRow+N-1)%N;AU.ui();}if(a.nd){G.mapRow=(G.mapRow+1)%N;AU.ui();}
  const lr=a.nl?-1:a.nr?1:0;
  if(lr){AU.ui();if(G.mapRow===0){const n=eraMaps().length;G.mapSel=(G.mapSel+n+lr)%n;}else if(G.mapRow===1){if(G.era==='acw')G.rules=G.rules==='classic'?'tac':'classic';else AU.bad();}
    else if(G.mapRow===2)G.weatherSel=(G.weatherSel+4+lr)%4;else if(G.mapRow===3)VIEW.on=!VIEW.on;else if(G.mapRow===4)G.ammoLimit=!G.ammoLimit;else if(G.mapRow===5){G.vox=(G.vox+3+lr)%3;if(G.vox)setTimeout(()=>cry(G.vox===2?'hurra_pl':'bogurodzica',W/2,{n:6}),50);}}
  if(a.start||(a.a&&G.mapRow===6)){AU.ok2();startBattle();return;}if(a.a)G.mapRow=Math.min(6,G.mapRow+1);
  if(a.b){G.state='army';for(let p=0;p<2;p++)if(!isCPU(p))G.army[p].ready=false;AU.ui();}}
function drawMap(){bgField();txt('Pole bitwy',W/2,50,40,INK,'center',true);
  eraMaps().forEach((mi,i)=>{const m=MAPS[mi],x=24+i*184,y=74,on=i===G.mapSel,md=MAPDATA[mi];ctx.fillStyle=on?BRASS:'#3a3a30';ctx.fillRect(x-3,y-3,182,103);
    if(md)ctx.drawImage(md.thumb,x-2,y-2,180,101);else{ctx.fillStyle='#222';ctx.fillRect(x-2,y-2,180,101);txt('rysuję…',x+88,y+52,16,DIM,'center');}
    if(!on){ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(x-2,y-2,180,101);}txt(m.name,x+88,y+120,19,on?INK:DIM,'center');});
  const m=MAPS[eraMaps()[G.mapSel]];panel(24,206,W-48,262,G.mapRow===0?BRASS:'#6a5a30');
  txt(m.name,44,240,30,INK,'left',true);wrap(m.desc,44,264,560,19,19,'#d8cfb2');
  const LEG={acw:[['Las','część kul grzęźnie w drzewach'],['Murek','zatrzymuje 60% kul, armata burzy'],['Dom','chroni, aż ostrzał zrobi ruinę'],['Wzgórze','dalszy zasięg, celniej w dół'],['Skała','skruszy ją tylko armata'],['Bród / woda','łatwy cel, marsz wolny']],
    rome:[['Palisada','osłona, jazda i machiny nie przejdą'],['Las','strzały na wprost grzęzną'],['Łuk','krótko: na wprost, trzymaj: ponad'],['Wzgórze','machiny dalej i szybciej'],['Bagno','wszyscy grzęzną, żółw najbardziej'],['Bród / most','jedyne przejścia przez wodę']],
    ww2:[['Okop','osłona 65 % dla piechoty'],['Worki / mur','zatrzymują część kul, pociski burzą'],['Dom','chroni, aż ostrzał zrobi ruinę'],['Skała','skruszą ją tylko działa i czołg'],['Druty','stop dla piechoty – czołg rozjeżdża'],['Miny','ukryte – tablice ostrzegają']],
    pl17:[['Wzgórze','dalszy zasięg ognia'],['Płot','osłona, konnica nie przejdzie'],['Palisada','tylko piechota, wolno'],['Wyłom','kula lub hajducy łamią płot/wał'],['Las','część kul grzęźnie w drzewach'],['Rzeka','w głębinie żołnierze toną']]};
  const leg=LEG[G.era];
  leg.forEach((l,i)=>{txt(l[0],640,240+i*21,18,BRASS);txt(l[1],735,240+i*21,16,'#cfc6a8');});
  const rows=[['Zasady',G.rules==='classic'?(G.era==='acw'?'Klasyczne':'Klasyczne (jedyne w tej epoce)'):'Taktyczne'],['Pogoda',WEATHERS[G.weatherSel]],['Widok',VIEW.on?'Ukośny':'Z góry'],['Amunicja',G.ammoLimit?'Ograniczona':'Bez limitu'],['Okrzyki',['Wyłączone','Tylko chór','Chór + lektor'][G.vox]]];
  rows.forEach((r,i)=>{const y=332+i*22,on=G.mapRow===i+1;if(on){ctx.fillStyle='rgba(201,162,74,.14)';ctx.fillRect(36,y-18,420,23);}
    txt(r[0],44,y,20,on?INK:DIM);txt(`${on?'◀ ':''}${r[1]}${on?' ▶':''}`,160,y,22,on?INK:'#cfc6a8');});
  const d=G.mapRow===2?WDESC[G.weatherSel]:G.mapRow===3?VDESC:G.mapRow===4?ADESC:G.mapRow===5?VXDESC():RDESC[G.rules];wrap(d,44,446,860,17,16,DIM);
  const on2=G.mapRow===6;ctx.fillStyle=on2?'rgba(201,162,74,.3)':'rgba(255,255,255,.05)';ctx.fillRect(W/2-150,478,300,36);txt('Do boju!',W/2,505,28,on2?INK:DIM,'center',true);
  txt('▲ ▼ wiersz · ◀ ▶ zmiana · A / Start: zaczynamy · B: wstecz',W/2,H-6,16,BRASS,'center');}
function startBattle(){const base=prepMap(eraMaps()[G.mapSel]);MAP=Object.assign({},base,{t:base.t.slice(),water:base.water.slice()});G.terr=document.createElement('canvas');G.terr.width=W;G.terr.height=H;G.tctx=G.terr.getContext('2d');G.tctx.drawImage(MAP.canvas,0,0);G.fires=[];
  if(G.era==='rome'){G.tctx.fillStyle='rgba(255,196,110,.07)';G.tctx.fillRect(0,0,W,H);}
  if(G.era==='ww2'){G.tctx.fillStyle='rgba(80,72,52,.12)';G.tctx.fillRect(0,0,W,H);for(let i=0;i<26;i++){const cx=120+R()*720,cy=40+R()*470;if(tAt(cx,cy)!==T.WATER&&tAt(cx,cy)!==T.BRIDGE&&tAt(cx,cy)!==T.HOUSE)decalCrater(cx,cy);}}
  G.weather=G.weatherSel===0?['clear','clear','rain','fog'][Math.floor(R()*4)]:['','clear','rain','fog'][G.weatherSel];
  const wa=R()*TAU,ws=.4+R()*.8;G.wind={x:Math.cos(wa)*ws,y:Math.sin(wa)*ws*.5};
  parts=[];projs=[];bullets=[];G.dying=[];G.loose=[];smokeG.fill(0);Object.assign(G,{score:[0,0],objProg:0,objOwner:-1,rallyCd:[0,0],ready:[false,G.mode==='cpu'],msgs:[],routAll:[0,0],t:0,deployT:30,winner:null,shake:0});
  G.stats=[0,1].map(()=>({shots:0,hits:0,lost:0,through:0}));initFx();
  if(G.rules==='classic'){clStart();AU.bugle(BUG.charge);return;}
  spawnArmies();G.sel=[0,0];fixSel();G.state='deploy';AU.bugle(BUG.call);
  msg(0,'Rozstaw oddziały w swojej strefie. Start = gotowi.');}
const PAUSE_ITEMS=['Wznów bitwę','Rewanż','Menu główne'];
function stepPause(){const a=input.any;if(a.nu){G.pauseSel=(G.pauseSel+2)%3;AU.ui();}if(a.nd){G.pauseSel=(G.pauseSel+1)%3;AU.ui();}
  if(a.b||(a.start&&G.pauseSel===0)){G.state='battle';return;}
  if(a.a||a.start){AU.ok2();if(G.pauseSel===0)G.state='battle';else if(G.pauseSel===1)startBattle();else G.state='title';}}
function drawPause(){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);panel(W/2-200,150,400,230,BRASS);txt('Pauza',W/2,200,44,INK,'center',true);
  PAUSE_ITEMS.forEach((s,i)=>{const y=252+i*40,on=G.pauseSel===i;txt((on?'▶ ':'')+s,W/2,y,26,on?INK:DIM,'center');});}
function stepEnd(dt){G.endT+=dt;if(G.endT<1.2)return;const a=input.any;if(a.a||a.start){startBattle();}else if(a.b){G.state='title';}}
function drawEnd(){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H);panel(W/2-280,90,560,360,G.winner>=0?SIDE[G.winner].ui:BRASS);
  const head=G.winner<0?'Remis':`Zwycięstwo ${SIDE[G.winner].gen}`;txt(head,W/2,150,48,G.winner>=0?SIDE[G.winner].ui:INK,'center',true);txt(G.reason,W/2,182,24,'#d8cfb2','center');if(VARIANTS[G.variant].hist)wrap(VARIANTS[G.variant].hist,W/2,204,520,15,14,BRASS,'center');
  const hy=VARIANTS[G.variant].hist?18:0,cols=[W/2-60,W/2+110];txt(SIDE[0].name,cols[0],228+hy,22,SIDE[0].ui,'center');txt(SIDE[1].name,cols[1],228+hy,22,SIDE[1].ui,'center');
  const rows=[['Polegli i ranni',s=>G.stats[s].lost],['Strzały',s=>G.stats[s].shots],['Celność',s=>G.stats[s].shots?Math.round(G.stats[s].hits/G.stats[s].shots*100)+' %':'–'],
    ...(G.rules==='classic'?[['Oddziały pozostałe',s=>units.filter(u=>u.side===s&&!u.dead&&!u.gone).length+resLeft(s)],['Szarże przez linie',s=>G.stats[s].through]]:[['Oddziały w boju',s=>units.filter(u=>u.side===s&&!u.dead&&!u.gone).length+'/12'],['Czas przy sztandarze',s=>Math.floor(G.score[s])+' s']])];
  rows.forEach((r,i)=>{const y=262+hy+i*28;txt(r[0],W/2-250,y,20,DIM);txt(String(r[1](0)),cols[0],y,22,INK,'center');txt(String(r[1](1)),cols[1],y,22,INK,'center');});
  if(G.endT>1.2)txt('A: rewanż na tej samej mapie · B: menu główne',W/2,428,20,BRASS,'center');}


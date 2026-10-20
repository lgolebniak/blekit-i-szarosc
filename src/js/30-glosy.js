/* ================= GŁOSY BITWY: chór formantowy, okrzyki bojowe, lektor, odgłosy pola ================= */
// chór męski syntetyzowany w WebAudio (działa offline) + opcjonalny lektor z syntezy mowy przeglądarki
G.vox=2;// 2 = chór + lektor, 1 = tylko chór, 0 = bez okrzyków
const VOW={a:[730,1090,2440],e:[530,1840,2480],i:[290,2250,3000],o:[540,840,2410],u:[330,780,2240],y:[420,1500,2450]};
// spółgłoski: [częstotliwość, filtr, Q, czas, głośność]
const CONS={s:[5500,'bandpass',1.2,.09,.5],z:[4500,'bandpass',1.5,.08,.35],c:[5000,'bandpass',1.2,.06,.45],dz:[4200,'bandpass',1.4,.06,.35],sz:[2800,'bandpass',1.5,.09,.45],
  h:[1400,'bandpass',.6,.08,.35],k:[2500,'bandpass',1,.03,.4],t:[4000,'bandpass',1,.025,.4],p:[1000,'bandpass',1,.02,.3],b:[400,'lowpass',1,.02,.25],
  d:[2500,'bandpass',1,.02,.25],g:[1500,'bandpass',1,.025,.25],f:[6000,'highpass',.7,.07,.25],w:[300,'lowpass',1,.03,.1],j:[2600,'bandpass',2,.02,.08]};
const PLOS='bpdtgkcj';
function vSyl(tok){const[s,n,d]=tok.split('/'),m=s.toLowerCase().match(/^([^aeiouy]*)([aeiouy]+)([^aeiouy]*)$/)||['','',s,''];
  const c=m[1],vg=m[2];return{c:CONS[c.slice(0,2)]?c.slice(0,2):c.slice(0,1),r:c.includes('r'),v:vg[vg.length-1],glide:vg.length>1&&vg[0]==='i',tail:m[3],n:+n||0,d:+d||.2};}
const VOX={bus:null,lastScream:0,
  init(){if(this.bus||!AU.ctx)return;const c=AU.ctx;this.bus=c.createDynamicsCompressor();this.bus.threshold.value=-18;this.bus.ratio.value=4;
    const g=c.createGain();g.gain.value=1.5;this.bus.connect(g);g.connect(AU.master);},
  // sylaby: "bo/0/.4 gu/2/.4" (sylaba / półtony / czas); o: x, n (głosy), base (Hz), shout, vol, rate, oct
  sing(text,o={}){if(!AU.ok()||G.vox<1)return 0;this.init();const c=AU.ctx,syl=text.split(' ').map(vSyl),t0=c.currentTime+(o.delay||0)+.02;
    const out=c.createGain();out.gain.value=o.vol||.5;let node=out;
    if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=o.x!==undefined?AU.pan(o.x):0;out.connect(p);node=p;}node.connect(this.bus);
    const n=o.n||6,rate=o.rate||1;let end=t0;
    for(let k=0;k<n;k++)end=Math.max(end,this.voice(c,t0,syl,o,k,rate,out));
    this.cons(c,t0,syl,o,rate,out);
    if(o.shout)this.breath(c,t0,syl,rate,out,end);
    return end-c.currentTime;},
  voice(c,t0,syl,o,k,rate,out){const osc=c.createOscillator();osc.type=o.soft?'triangle':'sawtooth';osc.detune.value=(R()-.5)*(o.spread||(o.shout?60:24));
    const lfo=c.createOscillator();lfo.frequency.value=4.5+R()*2;const lg=c.createGain();lg.gain.value=o.shout?28:14;lfo.connect(lg);lg.connect(osc.detune);
    const amp=c.createGain();amp.gain.value=0;
    const fs=[0,1,2].map(i=>{const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=[5,8,11][i];const g=c.createGain();g.gain.value=[1.6,.9,.45][i];osc.connect(f);f.connect(g);g.connect(amp);return f;});
    amp.connect(out);const pk=1/Math.sqrt(o.n||6),oct=o.oct&&k%3===0?2:1,ff=(o.f||1)*(oct>1?1.08:1);
    let t=t0+(o.shout?R()*.09:R()*.035);
    for(const s of syl){const f0=(o.base||120)*Math.pow(2,s.n/12)*oct*(1+(R()-.5)*(o.shout?.06:.012)),d=s.d*rate;
      osc.frequency.setTargetAtTime(f0,t,.02);
      if(o.shout){osc.frequency.setTargetAtTime(f0*1.14,t+.03,.05);osc.frequency.setTargetAtTime(f0*.78,t+d*.55,d*.3);}
      const V=VOW[s.v]||VOW.a;
      if(s.glide)fs.forEach((f,i)=>f.frequency.setTargetAtTime(VOW.i[i]*ff,t,.01));
      fs.forEach((f,i)=>f.frequency.setTargetAtTime(V[i]*ff,t+(s.glide?.05:0),.03));
      const A=amp.gain;
      if(s.c&&PLOS.includes(s.c[0])){A.setTargetAtTime(.02*pk,t,.006);A.setTargetAtTime(pk,t+.035,.025);}
      else if(s.c){A.setTargetAtTime(.3*pk,t,.01);A.setTargetAtTime(pk,t+.05,.03);}
      else A.setTargetAtTime(pk,t,.03);
      if(s.r)for(let j=0;j<3;j++){A.setTargetAtTime(.25*pk,t+.04+j*.034,.005);A.setTargetAtTime(pk,t+.057+j*.034,.005);}
      if(s.tail){if(s.tail==='j')fs.forEach((f,i)=>f.frequency.setTargetAtTime(VOW.i[i]*ff,t+d*.7,.03));
        else if('tdkgbp'.includes(s.tail[0]))A.setTargetAtTime(0,t+d*.82,.01);else A.setTargetAtTime(.35*pk,t+d*.8,.02);}
      t+=d;}
    amp.gain.setTargetAtTime(0,t,o.shout?.12:.09);
    const st=t+.8;osc.start(t0);lfo.start(t0);osc.stop(st);lfo.stop(st);return t;},
  // szumy spółgłosek (jeden szum na cały oddział)
  cons(c,t0,syl,o,rate,out){let t=t0;const src=c.createBufferSource();src.buffer=AU.noise;src.loop=true;const f=c.createBiquadFilter(),g=c.createGain();g.gain.value=0;src.connect(f);f.connect(g);g.connect(out);
    const hit=(key,at)=>{const C=CONS[key];if(!C)return;f.type=C[1];f.frequency.setValueAtTime(C[0],at);f.Q.setValueAtTime(C[2],at);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(C[4]*.9,at+.008);g.gain.setTargetAtTime(0,at+C[3]*.6,C[3]*.3);};
    for(const s of syl){const d=s.d*rate;if(s.c)hit(s.c,t-.02);if(s.tail){const k=CONS[s.tail.slice(0,2)]?s.tail.slice(0,2):s.tail.slice(-1);hit(k,t+d*.8);}t+=d;}
    src.start(t0);src.stop(t+.3);},
  // oddech krzyku: szum przez formant samogłoski
  breath(c,t0,syl,rate,out,end){const src=c.createBufferSource();src.buffer=AU.noise;src.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=3;const g=c.createGain();g.gain.value=0;
    src.connect(f);f.connect(g);g.connect(out);let t=t0;for(const s of syl){const V=VOW[s.v]||VOW.a;f.frequency.setTargetAtTime(V[1],t,.03);g.gain.setTargetAtTime(.22,t+.02,.03);t+=s.d*rate;}
    g.gain.setTargetAtTime(0,end,.1);src.start(t0);src.stop(end+.6);},
  // krzyk rannego
  scream(x){if(!AU.ok()||G.vox<1)return;const now=performance.now();if(now-this.lastScream<520)return;this.lastScream=now;
    const v=['a','o','u','e'][Math.floor(R()*4)],h=R()<.5?'h':'';this.sing(`${h}${v}${v}/0/${(.25+R()*.3).toFixed(2)}`,{x,n:1,base:170+R()*120,shout:true,vol:.28});},
  // rżenie konia
  neigh(x,vol=.22){if(!AU.ok())return;const c=AU.ctx,t=c.currentTime;const o=c.createOscillator();o.type='sawtooth';const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1500;f.Q.value=2;
    const am=c.createOscillator();am.frequency.value=13+R()*5;const ag=c.createGain();ag.gain.value=180;am.connect(ag);ag.connect(o.frequency);
    const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.05);g.gain.setTargetAtTime(0,t+.75,.15);
    o.frequency.setValueAtTime(700,t);o.frequency.linearRampToValueAtTime(1250,t+.18);o.frequency.linearRampToValueAtTime(950,t+.5);o.frequency.linearRampToValueAtTime(520,t+1);
    let n=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=AU.pan(x);g.connect(p);n=p;}o.connect(f);f.connect(g);n.connect(AU.master);o.start(t);am.start(t);o.stop(t+1.3);am.stop(t+1.3);}
};
/* --- lektor: synteza mowy przeglądarki (jeśli są głosy w systemie) --- */
const TTS={ok:typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined',voices:[],
  load(){if(!this.ok)return;try{this.voices=speechSynthesis.getVoices()||[];}catch(e){this.ok=false;}},
  pick(lang){const L=lang.slice(0,2),vs=this.voices.filter(v=>(v.lang||'').toLowerCase().startsWith(L));
    return vs.find(v=>/male|mężczyzna|adam|krzysztof|jacek|marek|david|guy|mark|stefan|conrad|ahmet|tolga|dmitri|pavel|mattias/i.test(v.name)&&!/female/i.test(v.name))||vs[0]||null;},
  say(text,lang,o={}){if(!this.ok||G.vox<2||!AU.ok())return;try{if(speechSynthesis.speaking&&!o.prio)return;if(o.prio)speechSynthesis.cancel();
    if(!this.voices.length)this.load();let v=this.pick(lang),l=lang;if(!v){v=this.pick('pl');l='pl-PL';}
    const u=new SpeechSynthesisUtterance(text);u.lang=l;if(v)u.voice=v;u.pitch=o.pitch||.7;u.rate=o.rate||1.05;u.volume=o.vol||1;speechSynthesis.speak(u);}catch(e){}}};
TTS.load();if(TTS.ok)try{speechSynthesis.onvoiceschanged=()=>TTS.load();}catch(e){}
/* --- okrzyki: tekst lektora, język, sylaby dla chóru --- */
const CRY={
  bogurodzica:{syl:'bo/0/.46 gu/2/.46 ro/3/.46 dzi/2/.46 ca/0/.8 dzie/3/.46 wi/5/.46 ca/3/.46 a/2/.5 a/0/1',choir:true,lyric:'♪ Bogurodzica, dziewica… ♪'},
  jezus:{tts:'Jezus Maria!',lang:'pl-PL',syl:'je/0/.16 zus/2/.22 ma/3/.18 ri/2/.14 ja/0/.6'},
  bij:{tts:'Bij! Zabij!',lang:'pl-PL',syl:'bij/2/.3 za/0/.14 bij/3/.6'},
  wiwat:{tts:'Wiwat! Wiwat!',lang:'pl-PL',syl:'wi/0/.18 wat/3/.4 wi/0/.18 waat/5/.8'},
  pal:{tts:'Pal!',lang:'pl-PL',cmd:true},ognia:{tts:'Ognia!',lang:'pl-PL',cmd:true},
  hurra_pl:{tts:'Huraaa!',lang:'pl-PL',syl:'hu/0/.14 rraa/2/1'},
  hurrah_en:{tts:'Hurrah!',lang:'en-US',syl:'hu/0/.14 rraa/2/.9'},
  rebel:{tts:'Yee-haw!',lang:'en-US',syl:'wa/7/.12 hu/12/.16 wa/7/.12 hu/12/.2 ii/14/.5',hi:true},
  fire_en:{tts:'Fire!',lang:'en-US',cmd:true},
  hurra_de:{tts:'Hurra!',lang:'de-DE',syl:'hu/0/.14 rraa/2/.9'},feuer:{tts:'Feuer!',lang:'de-DE',cmd:true},
  gud:{tts:'Gud med oss!',lang:'sv-SE',syl:'gud/0/.26 med/2/.18 oos/3/.6'},fyr:{tts:'Ge fyr!',lang:'sv-SE',cmd:true},
  ura:{tts:'Uraaa!',lang:'ru-RU',syl:'u/0/.2 rraa/3/1'},pali:{tts:'Pali!',lang:'ru-RU',cmd:true},
  allah:{tts:'Allah! Allah!',lang:'tr-TR',syl:'al/0/.14 laah/3/.45 al/0/.14 laah/3/.7'},ates:{tts:'Ateş!',lang:'tr-TR',cmd:true},
  venus:{tts:'Venus Victrix!',lang:'it-IT',syl:'we/0/.2 nus/2/.25 wik/3/.2 triks/2/.6'},
  hercules:{tts:'Hercules Invictus!',lang:'it-IT',syl:'her/0/.2 ku/2/.15 les/3/.25 in/2/.15 wik/3/.2 tus/0/.6'},
  hannibal:{tts:'Hannibal!',lang:'it-IT',syl:'han/0/.2 ni/3/.15 baal/2/.8'},
  gaul:{syl:'a/0/.3 u/5/.2 a/7/.2 u/5/.2 aa/9/.9',hi:true}};
// kto co krzyczy: szarża, zwarcie, rozkaz salwy, zwycięstwo (wg frakcji, z wyjątkami dla jednostek)
const FCRY={
  union:{charge:'hurrah_en',fire:'fire_en',win:'hurrah_en'},confed:{charge:'rebel',fire:'fire_en',win:'rebel'},
  caesar:{charge:'venus',win:'venus'},pompey:{charge:'hercules',win:'hercules'},carth:{charge:'hannibal',win:'hannibal'},gaul:{charge:'gaul',win:'gaul'},
  pl:{charge:'hurra_pl',fire:'ognia',win:'hurra_pl'},de:{charge:'hurra_de',fire:'feuer',win:'hurra_de'},
  rp_k:{charge:'bij',fire:'pal',win:'wiwat'},rp_l:{charge:'bij',fire:'pal',win:'wiwat'},rp_c:{charge:'bij',fire:'pal',win:'wiwat'},
  swe:{charge:'gud',fire:'fyr',win:'gud'},
  mos:{charge:'ura',fire:'pali',win:'ura',unit:{mus:{charge:'gud',fire:'fyr'},pik:{charge:'gud'},rajt:{charge:'gud',fire:'fyr'}}},
  tur:{charge:'allah',fire:'ates',win:'allah'}};
const facId=s=>(VARIANTS[G.variant]||{}).fac?VARIANTS[G.variant].fac[s]:null;
function cryKey(u,ev){const F=FCRY[facId(u.side)];if(!F)return null;const U=F.unit&&F.unit[u.key];return(U&&U[ev])||F[ev]||null;}
const VOXCD={side:[0,0],cmd:[0,0],bog:-99};
function cry(key,x,o={}){const C=CRY[key];if(!C)return;
  if(C.syl)VOX.sing(C.syl,{x,n:o.n||(C.choir?10:7),base:(C.hi?150:115)*(o.pitch||1),shout:!C.choir,soft:C.choir,vol:o.vol||(C.choir?.55:.5),rate:o.rate||1,oct:C.choir,spread:C.choir?22:0});
  if(C.tts)TTS.say(C.tts,C.lang,{pitch:C.hi?1.2:.65,rate:C.cmd?1.1:1,prio:o.prio});}
// zdarzenia
function voxCharge(u){if(G.vox<1||G.state!=='battle')return;const s=u.side;
  if(u.key==='hus'){// husaria: Bogurodzica (najwyżej co 30 s), między nimi „Jezus Maria!” albo „Bij! Zabij!”
    whoosh(u.x);if(G.t-VOXCD.bog>30){VOXCD.bog=G.t;cry('bogurodzica',u.x);msg(s,CRY.bogurodzica.lyric);VOXCD.side[s]=G.t+6;return;}
    if(G.t<VOXCD.side[s])return;VOXCD.side[s]=G.t+4;cry(R()<.5?'jezus':'bij',u.x);return;}
  if(G.t<VOXCD.side[s])return;VOXCD.side[s]=G.t+4;const k=cryKey(u,'charge');if(k)cry(k,u.x);
  if(k==='gaul')carnyx(u.x);if(u.type==='cav'&&R()<.6)VOX.neigh(u.x,.16);}
function voxFire(u){if(G.vox<1||G.state!=='battle'||G.t<VOXCD.cmd[u.side])return;VOXCD.cmd[u.side]=G.t+5+R()*3;const k=cryKey(u,'fire');if(!k)return;
  if(G.vox>=2&&TTS.ok&&TTS.voices.length)cry(k,u.x);else VOX.sing('o/0/.12 aa/2/.3',{x:u.x,n:1,base:140,shout:true,vol:.35});}
function voxMelee(u){if(G.vox<1||G.t<VOXCD.side[u.side]||(u.meleeCryT||0)>G.t)return;u.meleeCryT=G.t+12;VOXCD.side[u.side]=G.t+4;
  const k=u.key==='hus'?(R()<.5?'jezus':'bij'):cryKey(u,'charge');if(k&&CRY[k].syl)cry(k,u.x,{n:5,vol:.42});}
/* --- odgłosy pola --- */
function whoosh(x){if(!AU.ok())return;const c=AU.ctx,t=c.currentTime,s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=1.5;
  f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(2600,t+.8);f.frequency.exponentialRampToValueAtTime(700,t+1.6);
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.18,t+.5);g.gain.setTargetAtTime(0,t+1.1,.25);
  let n=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=AU.pan(x);g.connect(p);n=p;}s.connect(f);f.connect(g);n.connect(AU.master);s.start(t,0,1.6);}
function hoof(x,vol){if(!AU.ok())return;AU.burst(.05,170+R()*90,'lowpass',2,vol,AU.pan(x));}
function drum(t,vol,low){if(!AU.ok())return;const c=AU.ctx,at=c.currentTime+t;if(low){AU.tone(58,.35,'sine',vol,t,-20);AU.burst(.2,180,'lowpass',1,vol*.6,0,t);}else{AU.burst(.09,1700,'bandpass',1.2,vol,0,t);AU.tone(190,.06,'triangle',vol*.5,t);}}
function drumRoll(vol=.12){for(let i=0;i<10;i++)drum(i*.07,vol*(.4+i*.06));drum(.8,vol*1.2);drum(1.1,vol);drum(1.25,vol);drum(1.4,vol*1.3);}
// mehter: kös (wielki bęben), nakkare i zurna w skali hidżaz
function mehter(vol=.1){if(!AU.ok())return;const sc=[0,1,4,5,7,8,10,12],mel=[4,5,4,2,1,2,4,1,0,0];let t=0;
  for(let i=0;i<mel.length;i++){const d=i%4===3?.6:.3;AU.tone(293.7*Math.pow(2,sc[mel[i]]/12),d*.95,'square',vol*.45,t,0,2400);if(i%2===0)drum(t,vol*1.6,true);else drum(t,vol*.8);t+=d;}
  for(let i=0;i<4;i++)drum(t+i*.15,vol*(i===3?1.8:1),i===3);}
function carnyx(x){if(!AU.ok())return;const c=AU.ctx,t=c.currentTime,o=c.createOscillator();o.type='sawtooth';const am=c.createOscillator();am.frequency.value=28;const ag=c.createGain();ag.gain.value=6;am.connect(ag);ag.connect(o.frequency);
  o.frequency.setValueAtTime(90,t);o.frequency.linearRampToValueAtTime(140,t+.4);o.frequency.setValueAtTime(140,t+1.3);o.frequency.linearRampToValueAtTime(70,t+2);
  const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=1300;f.Q.value=4;const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.2,t+.2);g.gain.setTargetAtTime(0,t+1.8,.2);
  let n=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=AU.pan(x);g.connect(p);n=p;}o.connect(f);f.connect(g);n.connect(AU.master);o.start(t);am.start(t);o.stop(t+2.6);am.stop(t+2.6);}
// pętla dźwięków: szarże, tętent, bębny i mehter w tle
function voxTick(dt){if(G.state!=='battle'||!AU.ok())return;let hooves=0;
  for(const u of units){if(u.dead||u.gone||u.state==='enter')continue;
    const ch=u.state==='ride'||u.furyT>0||u.chargeT>0;if(ch&&!u._ch)voxCharge(u);u._ch=ch;
    if(u.type==='cav'&&hooves<3&&(u.gallop||u.state==='ride'||u.moving||u.men.some(m=>m.alive&&m.mv>.5))){hooves++;u.hoofT=(u.hoofT||0)-dt;
      if(u.hoofT<=0){const fast=u.gallop||u.state==='ride';u.hoofT=(fast?.085:.16)*(.8+R()*.4);hoof(u.x,(fast?.09:.05)*Math.min(1,u.n/3));}}}
  G.ambT=(G.ambT===undefined?6:G.ambT)-dt;
  if(G.ambT<=0&&G.vox>=1){G.ambT=14+R()*12;const f=[facId(0),facId(1)];
    if(f.includes('tur'))mehter(.07);else if(G.era==='acw'||f.includes('swe')||G.era==='pl17')drumRoll(.07);else if(f.includes('gaul')&&R()<.5)carnyx(R()*W);
    else if(G.era==='ww2')AU.burst(1.6,90,'lowpass',.7,.25,(R()-.5)*1.6);}}
/* --- podpięcie pod silnik --- */
const _clVolleyV=clVolley;clVolley=function(u,o){const r=_clVolleyV(u,o);if(r&&!(o&&o.noPowder&&u.key!=='num'))voxFire(u);return r;};
const _killManV=killMan;
killMan=function(e,m,kind,fl){const was=m.alive;_killManV(e,m,kind,fl);if(!was||m.alive||kind==='drown')return;
  if(e.type!=='tank'&&e.type!=='ele'&&R()<.35)VOX.scream(m.x);if(e.type==='cav'&&R()<.25)VOX.neigh(m.x,.12);
  if(kind==='melee'||kind==='trample'){let a=null,bd=60;for(const u of units){if(u.side===e.side||u.dead||u.gone)continue;const d=dist(u.x,u.y,m.x,m.y);if(d<bd){bd=d;a=u;}}if(a)voxMelee(a);}};
const _eraTick3V=eraTick3;eraTick3=function(dt){_eraTick3V(dt);voxTick(dt);};
const _endBattleV=endBattle;endBattle=function(w,reason){_endBattleV(w,reason);if(w<0||G.vox<1)return;const k=cryKey({side:w,key:''},'win');if(k)setTimeout(()=>cry(k,w===0?W*.3:W*.7,{n:10,prio:true}),900);};
const _startBattleV=startBattle;startBattle=function(){_startBattleV();VOXCD.side=[0,0];VOXCD.cmd=[0,0];VOXCD.bog=-99;G.ambT=8;try{if(TTS.ok)speechSynthesis.cancel();}catch(e){}
  if(G.vox<1||G.rules!=='classic')return;const f=[facId(0),facId(1)];
  if(G.era==='pl17'){VOXCD.bog=0;setTimeout(()=>{cry('bogurodzica',W*.25,{n:12,vol:.5});msg(0,CRY.bogurodzica.lyric);},1600);}
  if(f.includes('tur'))setTimeout(()=>mehter(.09),5200);else if(G.era==='acw'||f.includes('swe'))setTimeout(()=>drumRoll(.1),1500);else if(f.includes('gaul'))setTimeout(()=>carnyx(W*.75),2000);};

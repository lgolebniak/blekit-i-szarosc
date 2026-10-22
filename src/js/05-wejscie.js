/* ================= WEJŚCIE: pady Xbox + klawiatura ================= */
const KEYS={};
/* --- Xbox / Edge: pad w „trybie przeglądarki” wysyła klawisze GamepadA, GamepadB… – przechwytujemy je, żeby B nie cofało strony --- */
try{navigator.gamepadInputEmulation='gamepad';}catch(e){}
const GPKEY={195:'GpA',196:'GpB',197:'GpX',198:'GpY',199:'GpRB',200:'GpLB',201:'GpLT',202:'GpRT',203:'GpUp',204:'GpDown',205:'GpLeft',206:'GpRight',
  207:'GpMenu',208:'GpView',209:'GpL3',210:'GpR3',211:'GpLSUp',212:'GpLSDown',213:'GpLSRight',214:'GpLSLeft',166:'GpB'};
const GPNAME={GamepadA:'GpA',GamepadB:'GpB',GamepadX:'GpX',GamepadY:'GpY',GamepadRightShoulder:'GpRB',GamepadLeftShoulder:'GpLB',GamepadLeftTrigger:'GpLT',GamepadRightTrigger:'GpRT',
  GamepadDPadUp:'GpUp',GamepadDPadDown:'GpDown',GamepadDPadLeft:'GpLeft',GamepadDPadRight:'GpRight',GamepadMenu:'GpMenu',GamepadView:'GpView',
  GamepadLeftThumbstickButton:'GpL3',GamepadRightThumbstickButton:'GpR3',GamepadLeftThumbstickUp:'GpLSUp',GamepadLeftThumbstickDown:'GpLSDown',
  GamepadLeftThumbstickRight:'GpLSRight',GamepadLeftThumbstickLeft:'GpLSLeft',BrowserBack:'GpB',GoBack:'GpB',NavigationCancel:'GpB',NavigationAccept:'GpA'};
const gpKey=e=>GPNAME[e.key]||GPKEY[e.keyCode]||null;
function browseMode(){if(!input.browse){input.browse=true;if(typeof msg==='function'&&(G.state==='battle'||G.state==='deploy'))msg(0,'Pad w trybie przeglądarki: przytrzymaj Menu (≡) i wybierz „Sterowanie grą”.');}}
addEventListener('keydown',e=>{const g=gpKey(e);if(g){KEYS[g]=true;e.preventDefault();e.stopPropagation();browseMode();return;}
  KEYS[e.code]=true;AU.init();armBackTrap();if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Backspace','Tab','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();},true);
addEventListener('keyup',e=>{const g=gpKey(e);if(g){KEYS[g]=false;e.preventDefault();e.stopPropagation();return;}KEYS[e.code]=false;},true);
addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=false;});
// A klikające jak mysz (kursor przeglądarki) = przycisk A gracza 1, trzymanie działa jak trzymanie A
cv.addEventListener('pointerdown',e=>{AU.init();cv.focus();armBackTrap();if(input.pads||input.browse)KEYS.PtrA=true;});
addEventListener('pointerup',()=>{KEYS.PtrA=false;});addEventListener('pointercancel',()=>{KEYS.PtrA=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('gamepadconnected',()=>AU.init());
// pułapka na „wstecz”: przycisk B w trybie przeglądarki cofa stronę – zatrzymujemy to i zamieniamy na B w grze
let backArmed=false;
function armBackTrap(){if(backArmed)return;backArmed=true;try{history.pushState({bis:1},'');}catch(e){}}
addEventListener('popstate',()=>{try{history.pushState({bis:1},'');}catch(e){}
  if(performance.now()-(input.lastPadB||0)>300){KEYS.NavB=true;setTimeout(()=>{KEYS.NavB=false;},120);browseMode();}});
addEventListener('beforeunload',e=>{if(G.state==='battle'||G.state==='deploy'||G.state==='pause'){e.preventDefault();e.returnValue='';}});
const key=c=>!!KEYS[c];
const KB=[
  {mv:['KeyA','KeyD','KeyW','KeyS'],rot:['KeyZ','KeyC'],a:['KeyF','Space','GpA','PtrA'],b:['KeyG','GpB','NavB'],x:['KeyR','GpX'],y:['KeyT','GpY'],lb:['KeyQ','GpLB'],rb:['KeyE','GpRB'],lt:['ShiftLeft','GpLT'],rt:['KeyV','GpRT'],start:['Escape','Digit1','GpMenu','GpL3','GpR3'],up:['Digit2','GpUp'],down:['Digit3','GpDown'],left:['GpLeft','Digit4'],right:['GpRight','Digit5']},
  {mv:['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'],rot:['Comma','Period'],a:['Enter','KeyK','Numpad0'],b:['KeyL'],x:['KeyJ'],y:['KeyI'],lb:['KeyU'],rb:['KeyO'],lt:['ShiftRight'],rt:['KeyM'],start:['Backspace','Digit0'],up:['KeyP'],down:['Semicolon'],left:['BracketLeft'],right:['BracketRight']}
];
const BTN=['a','b','x','y','lb','rb','lt','rt','back','start','up','down','left','right','l3','r3'];
const PADMAP={a:0,b:1,x:2,y:3,lb:4,rb:5,lt:6,rt:7,back:8,start:9,l3:10,r3:11,up:12,down:13,left:14,right:15};
const mkCtl=()=>({lx:0,ly:0,rx:0,ry:0,kRot:0,b:{},p:{},r:{},src:'Klawiatura',pad:false});
const input={ctl:[mkCtl(),mkCtl()],padIdx:[null,null],slot:[null,null],swallow:[false,false],prev:[{},{}],rep:[{},{}],blocked:false,any:{},
  pads:0,seen:false,browse:false,lastPadB:0,xbox:/xbox/i.test(navigator.userAgent),secure:window.isSecureContext!==false,api:!!navigator.getGamepads};
function getPads(){try{return navigator.getGamepads?[...navigator.getGamepads()].filter(g=>g&&g.connected&&g.buttons&&g.buttons.length):[];}catch(e){input.blocked=true;return[];}}
// pady przypisywane do graczy w kolejności pierwszego naciśnięcia: pierwszy = Gracz 1 (Niebiescy), drugi = Gracz 2 (Szarzy)
const padActive=g=>g.buttons.some(b=>b&&(b.pressed||b.value>.5))||[0,1,2,3].some(k=>Math.abs(g.axes[k]||0)>.7);
function assignPads(gps){
  for(let i=0;i<2;i++)if(input.slot[i]!==null&&!gps.some(g=>g.index===input.slot[i]))input.slot[i]=null;
  for(const g of gps){if(input.slot.includes(g.index)||!padActive(g))continue;const i=input.slot.indexOf(null);if(i<0)break;
    input.slot[i]=g.index;input.swallow[i]=true;AU.init();if(typeof msgPad==='function')msgPad(i);}}
function swapPads(){input.slot.reverse();input.swallow=[true,true];}
function pollInput(dt){
  const gps=getPads();input.pads=gps.length;if(gps.length)input.seen=true;assignPads(gps);
  for(let i=0;i<2;i++){
    const c=input.ctl[i],k=KB[i],gp=gps.find(g=>g.index===input.slot[i])||null;input.padIdx[i]=gp?gp.index:null;
    const cur={};for(const n of BTN)cur[n]=k[n]?k[n].some(key):false;
    let lx=(key(k.mv[1])?1:0)-(key(k.mv[0])?1:0),ly=(key(k.mv[3])?1:0)-(key(k.mv[2])?1:0);
    if(i===0){lx+=(key('GpLSRight')?1:0)-(key('GpLSLeft')?1:0);ly+=(key('GpLSDown')?1:0)-(key('GpLSUp')?1:0);lx=clamp(lx,-1,1);ly=clamp(ly,-1,1);}
    c.kRot=(key(k.rot[1])?1:0)-(key(k.rot[0])?1:0);c.rx=0;c.ry=0;c.pad=!!gp;
    if(gp){const dz=v=>Math.abs(v)<.2?0:(v-Math.sign(v)*.2)/.8;const ax=gp.axes;
      lx=clamp(lx+dz(ax[0]||0),-1,1);ly=clamp(ly+dz(ax[1]||0),-1,1);c.rx=dz(ax[2]||0);c.ry=dz(ax[3]||0);
      for(const n of BTN){const bb=gp.buttons[PADMAP[n]];if(bb&&(bb.pressed||bb.value>.5))cur[n]=true;}
      if(gp.buttons[1]&&gp.buttons[1].pressed)input.lastPadB=performance.now();
      c.src=`Pad ${gp.index+1}`;}
    else c.src=(i===0?'Klawiatura (WASD)':'Klawiatura (strzałki)')+(input.pads?' · A na padzie':'');
    // Start zastępczo: wciśnięcie lewego lub prawego drążka (na Xboxie przycisk Menu bywa przechwytywany przez przeglądarkę)
    cur.start=cur.start||cur.l3||cur.r3;
    const m=Math.hypot(lx,ly);if(m>1){lx/=m;ly/=m;}c.lx=lx;c.ly=ly;
    cur.nu=cur.up||ly<-.6;cur.nd=cur.down||ly>.6;cur.nl=cur.left||lx<-.6;cur.nr=cur.right||lx>.6;
    if(input.swallow[i]){input.prev[i]=Object.assign({},cur);input.swallow[i]=false;}
    const prev=input.prev[i];c.b=cur;c.p={};c.r={};
    for(const n in cur){c.p[n]=cur[n]&&!prev[n];c.r[n]=!cur[n]&&!!prev[n];}
    for(const n of['nu','nd','nl','nr']){if(cur[n]){input.rep[i][n]=(input.rep[i][n]||0)+dt;if(input.rep[i][n]>.4){input.rep[i][n]=.31;c.p[n]=true;}}else input.rep[i][n]=0;}
    if(gp&&Object.values(c.p).some(Boolean))AU.init();
    input.prev[i]=cur;
  }
  const a=input.any={};for(const n of[...BTN,'nu','nd','nl','nr'])a[n]=input.ctl[0].p[n]||input.ctl[1].p[n];
}
function rumble(pi,strong,weak,ms){const idx=input.padIdx[pi];if(idx===null)return;try{const gp=navigator.getGamepads()[idx];const va=gp&&gp.vibrationActuator;
  if(va&&va.playEffect)va.playEffect('dual-rumble',{duration:ms,strongMagnitude:strong,weakMagnitude:weak}).catch(()=>{});}catch(e){}}


/* ================= WIDOK UKOŚNY ================= */
const VIEW={on:true,kT:.8,kB:1,Y0:34,a:0,b:1};
function setupView(){const c=(H-VIEW.Y0-2)/(H*(VIEW.kT+VIEW.kB)/2);VIEW.a=c*(VIEW.kB-VIEW.kT)/(2*H);VIEW.b=c*VIEW.kT;}
setupView();
function P(x,y){if(!VIEW.on)return[x,y];const k=VIEW.kT+(VIEW.kB-VIEW.kT)*y/H;return[W/2+(x-W/2)*k,VIEW.Y0+VIEW.a*y*y+VIEW.b*y];}
function invY(sy){const d=sy-VIEW.Y0;return(-VIEW.b+Math.sqrt(VIEW.b*VIEW.b+4*VIEW.a*d))/(2*VIEW.a);}
const GCAN=document.createElement('canvas');GCAN.width=W;GCAN.height=H;const GCTX=GCAN.getContext('2d');GCTX.imageSmoothingEnabled=false;
let backdrop=null;
function makeBackdrop(){backdrop=document.createElement('canvas');backdrop.width=W;backdrop.height=H;const g=backdrop.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1c2a2c');gr.addColorStop(.12,'#2b3a28');gr.addColorStop(1,'#223018');g.fillStyle=gr;g.fillRect(0,0,W,H);
  const nz=makeNoise(5);for(let x=0;x<W;x+=2){const h=10+nz(x/40,1)*26;g.fillStyle='#1f2d1c';g.fillRect(x,VIEW.Y0-h+8,2,h);g.fillStyle='#283a22';g.fillRect(x,VIEW.Y0-h*.5+8,2,h*.5);}}
function blitGround(){if(!VIEW.on){SCR.drawImage(GCAN,0,0);return;}if(!backdrop)makeBackdrop();SCR.drawImage(backdrop,0,0);
  const top=Math.floor(VIEW.Y0);for(let sy=top;sy<H;sy++){const wy=invY(sy+.5);if(wy<0||wy>=H)continue;const k=VIEW.kT+(VIEW.kB-VIEW.kT)*wy/H,w=Math.round(W*k);SCR.drawImage(GCAN,0,Math.floor(wy),W,1,Math.round(W/2-w/2),sy,w,1);}
  const gr=SCR.createLinearGradient(0,VIEW.Y0,0,VIEW.Y0+40);gr.addColorStop(0,'rgba(170,190,180,.35)');gr.addColorStop(1,'rgba(170,190,180,0)');SCR.fillStyle=gr;SCR.fillRect(0,VIEW.Y0,W,40);}


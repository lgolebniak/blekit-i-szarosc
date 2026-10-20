'use strict';
/* ================= RDZEŃ ================= */
const W=960,H=540,TS=12,GW=80,GH=45,TAU=Math.PI*2;
const cv=document.getElementById('c');let ctx=cv.getContext('2d');const SCR=ctx;
ctx.imageSmoothingEnabled=false;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(ax,ay,bx,by)=>Math.hypot(bx-ax,by-ay);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};
const R=Math.random;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function makeNoise(seed){const r=mulberry32(seed),P=256,v=new Float32Array(P*P);for(let i=0;i<v.length;i++)v[i]=r();
  const s=t=>t*t*(3-2*t);
  return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),u=s(x-xi),w=s(y-yi);const g=(a,b)=>v[((b&255)*P)+(a&255)];
    return lerp(lerp(g(xi,yi),g(xi+1,yi),u),lerp(g(xi,yi+1),g(xi+1,yi+1),u),w);};}
function fit(){const aw=innerWidth-32,ah=innerHeight;const s=Math.max(.3,Math.min(aw/W,ah/H));cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px';}
addEventListener('resize',fit);fit();


/* ================= ŚCIEŻKI A* ================= */
const AS={g:new Float32Array(GW*GH),f:new Float32Array(GW*GH),from:new Int32Array(GW*GH),st:new Uint8Array(GW*GH),heap:new Int32Array(GW*GH*8)};
function nearestPassTile(ti,x,y){let tx=clamp(Math.floor(x/TS),0,GW-1),ty=clamp(Math.floor(y/TS),0,GH-1);if(TSPD[MAP.t[ty*GW+tx]][ti]>0)return ty*GW+tx;
  for(let r=1;r<10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const X=tx+dx,Y=ty+dy;if(X<0||Y<0||X>=GW||Y>=GH)continue;if(TSPD[MAP.t[Y*GW+X]][ti]>0)return Y*GW+X;}return-1;}
function astar(type,sx,sy,gx,gy){const ti=TI[type];const cost=i=>{const s=TSPD[MAP.t[i]][ti];return s>0?1/s:0;};
  const s=clamp(Math.floor(sy/TS),0,GH-1)*GW+clamp(Math.floor(sx/TS),0,GW-1),g=nearestPassTile(ti,gx,gy);if(g<0)return null;
  AS.st.fill(0);const gX=g%GW,gY=Math.floor(g/GW);const hf=i=>{const dx=Math.abs(i%GW-gX),dy=Math.abs(Math.floor(i/GW)-gY);return(dx+dy-.586*Math.min(dx,dy))*.74;};
  const F=AS.f,heap=AS.heap;let hn=0;
  const push=i=>{heap[hn]=i;let k=hn++;while(k>0){const pk=(k-1)>>1;if(F[heap[pk]]<=F[heap[k]])break;const t=heap[pk];heap[pk]=heap[k];heap[k]=t;k=pk;}};
  const pop=()=>{const top=heap[0];heap[0]=heap[--hn];let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<hn&&F[heap[l]]<F[heap[m]])m=l;if(r<hn&&F[heap[r]]<F[heap[m]])m=r;if(m===k)break;const t=heap[m];heap[m]=heap[k];heap[k]=t;k=m;}return top;};
  AS.g[s]=0;F[s]=hf(s);AS.from[s]=-1;AS.st[s]=1;push(s);let it=0;
  while(hn>0&&it++<6000){const c=pop();if(AS.st[c]===2)continue;AS.st[c]=2;if(c===g)break;const cx=c%GW,cy=Math.floor(c/GW);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=GW||ny>=GH||hn>=heap.length-2)continue;
      const ni=ny*GW+nx;if(AS.st[ni]===2)continue;const cc=cost(ni);if(!cc)continue;if(dx&&dy&&(!cost(cy*GW+nx)||!cost(ny*GW+cx)))continue;
      const ng=AS.g[c]+cc*(dx&&dy?1.414:1);if(AS.st[ni]===0||ng<AS.g[ni]){AS.g[ni]=ng;F[ni]=ng+hf(ni);AS.from[ni]=c;AS.st[ni]=1;push(ni);}}}
  if(AS.st[g]!==2)return null;const path=[];let c=g,guard=0;while(c!==-1&&c!==s&&guard++<4000){path.push([(c%GW)*TS+TS/2,Math.floor(c/GW)*TS+TS/2]);c=AS.from[c];}
  path.reverse();return path;}
function steer(u,gx,gy,dt){if(dist(u.x,u.y,gx,gy)<7)return[0,0];u.pathT-=dt;
  if(!u.path||u.pathT<=0||dist(u.pgx,u.pgy,gx,gy)>36){u.path=astar(u.type,u.x,u.y,gx,gy);u.pathT=1.1+R()*.6;u.pgx=gx;u.pgy=gy;u.pi=0;}
  let tx=gx,ty=gy;if(u.path&&u.path.length){while(u.pi<u.path.length-1&&dist(u.x,u.y,u.path[u.pi][0],u.path[u.pi][1])<10)u.pi++;
    const q=u.path[Math.min(u.pi+1,u.path.length-1)];if(u.pi<u.path.length-1||dist(u.x,u.y,gx,gy)>18){tx=q[0];ty=q[1];}}
  const d=dist(u.x,u.y,tx,ty)||1;return[(tx-u.x)/d,(ty-u.y)/d];}


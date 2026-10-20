/* ================= RENDER TERENU (z głębią pod widok ukośny) ================= */
function pdisc(g,cx,cy,r,col){g.fillStyle=col;cx=Math.round(cx);cy=Math.round(cy);for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(Math.max(0,r*r-dy*dy+r*.5)));g.fillRect(cx-w,cy+dy,w*2+1,1);}}
function renderTerrain(map){
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const img=g.createImageData(W,H),D=img.data,cls=new Uint8Array(W*H);
  const n=makeNoise(map.def.seed+101),n2=makeNoise(map.def.seed+202),n3=makeNoise(map.def.seed+303);
  const rng=mulberry32(map.def.seed+7);
  const hs=(x,y)=>{const fx=x/TS-.5,fy=y/TS-.5;const x0=clamp(Math.floor(fx),0,GW-1),y0=clamp(Math.floor(fy),0,GH-1),x1=Math.min(GW-1,x0+1),y1=Math.min(GH-1,y0+1);const u=clamp(fx-x0,0,1),v=clamp(fy-y0,0,1);
    const h=map.h;return lerp(lerp(h[y0*GW+x0],h[y0*GW+x1],u),lerp(h[y1*GW+x0],h[y1*GW+x1],u),v);};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const jx=x+(n(x/11,y/11)-.5)*10,jy=y+(n(x/11+40,y/11)-.5)*10;
    const tx=clamp(Math.floor(jx/TS),0,GW-1),ty=clamp(Math.floor(jy/TS),0,GH-1);
    let t=map.t[ty*GW+tx];
    const et=map.t[clamp(Math.floor(y/TS),0,GH-1)*GW+clamp(Math.floor(x/TS),0,GW-1)];
    if(t===T.BRIDGE||t===T.WALL||t===T.HOUSE||t===T.PALISADE||t===T.SANDBAG||t===T.WIRE||t===T.FENCE)t=T.GRASS;
    if(et===T.HOUSE||et===T.WALL||et===T.PALISADE||et===T.SANDBAG||et===T.WIRE||et===T.FENCE)t=T.GRASS;if(et===T.TRENCH)t=T.TRENCH;
    if(et===T.BRIDGE)t=T.WATER;
    const v=n2(x/2.2,y/2.2),v2=n3(x/18,y/18);
    let r,gg,b;
    switch(t){
      case T.FOREST: r=54+v*10;gg=78+v*12;b=34+v*6;break;
      case T.WATER:{const w=n3(x/6,y/3);r=46+w*14;gg=92+w*18;b=138+w*22;if(w>.78){r+=44;gg+=44;b+=40;}break;}
      case T.FORD:{r=84+v*14;gg=126+v*14;b=146+v*12;if(v>.84){r=160;gg=154;b=136;}break;}
      case T.ROAD: r=170+v*16-v2*10;gg=146+v*14-v2*8;b=96+v*10;if(n2(x/1.3,y/7)>.8){r-=18;gg-=16;b-=12;}break;
      case T.ROCK:{const k=n3(x/5,y/5);r=128+k*44+v*10;gg=120+k*42+v*10;b=108+k*38+v*8;if(v<.12){r-=30;gg-=30;b-=28;}break;}
      case T.WHEAT: r=204+v*22;gg=168+v*18;b=70+v*14;if(((x+Math.floor(y/2))%4)===0){r-=26;gg-=26;b-=14;}break;
      case T.SWAMP:{const w=n3(x/5,y/5);r=64+v*14;gg=82+v*12;b=50+v*8;if(w>.6){r=56;gg=84;b=90;if(v>.75){r+=30;gg+=36;b+=36;}}else if(v>.88){r=140;gg=150;b=78;}break;}
      case T.TRENCH: r=104+v*14;gg=82+v*10;b=54+v*8;break;
      case T.RUINS: r=112+v*20;gg=104+v*18;b=92+v*14;if(v<.15){r=52;gg=46;b=40;}break;
      case T.MUD: r=112+v*12;gg=92+v*10;b=58+v*8;if(n3(x/7,y/7)>.62){r=78;gg=70;b=52;if(v>.7){r+=30;gg+=34;b+=36;}}break;
      default: r=96+v*16+v2*10;gg=132+v*18+v2*8;b=56+v*10;
        if(v>.93&&n(x*.7,y*.7)>.6){r=230;gg=220;b=150;}
    }
    if(t!==T.WATER&&t!==T.FORD){const h0=hs(x,y);if(h0>0){const sh=(hs(x-2,y-2)-hs(x+2,y+2))*60;r+=h0*9+sh;gg+=h0*11+sh;b+=h0*4+sh*.6;
      const a=hs(x+1,y),c2=hs(x,y+1);if((h0<.5)!==(a<.5)||(h0<.5)!==(c2<.5)||(h0<1.5)!==(a<1.5)||(h0<1.5)!==(c2<1.5)){r-=22;gg-=20;b-=14;}
      // ściana stoku widoczna od strony patrzącego (południe)
      const dn=hs(x,y+4);if(h0-dn>.25){r-=16;gg-=18;b-=10;}}}
    const i=(y*W+x)*4;D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;
    cls[y*W+x]=t===T.WATER?1:t===T.FORD?3:t===T.ROCK?2:0;
  }
  // druga faza: skarpy, brzegi, cienie – złudzenie wysokości
  const put=(i,rr,gg,bb,a=1)=>{D[i]=lerp(D[i],rr,a);D[i+1]=lerp(D[i+1],gg,a);D[i+2]=lerp(D[i+2],bb,a);};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,cl=cls[k],i=k*4;
    if(cl===1||cl===3){let up=0;const depth=cl===1?6:3;for(let d=1;d<=depth;d++){if(y-d<0)break;const q=cls[k-d*W];if(q===0||q===2){up=d;break;}}
      if(up){const f=up/depth;const stripe=(x+Math.floor(n(x/3,y)*3))%4===0?-10:0;put(i,122-f*44+stripe,96-f*36+stripe,58-f*20,1);continue;}
      let dn=0;for(let d=1;d<=2;d++){if(y+d>=H)break;const q=cls[k+d*W];if(q===0||q===2){dn=d;break;}}
      if(dn){put(i,20,40,60,.35);}}
    else if(cl===2){let dn=0;for(let d=1;d<=8;d++){if(y+d>=H)break;if(cls[k+d*W]!==2){dn=d;break;}}
      if(dn){const f=1-dn/8;const st=(x%3===0)?-16:(x%3===1?6:0);put(i,88-f*30+st,82-f*30+st,74-f*26+st,1);if(dn===1)put(i,52,48,44,1);}
      else{let up=0;for(let d=1;d<=2;d++){if(y-d<0)break;if(cls[k-d*W]!==2){up=d;break;}}if(up)put(i,196,190,176,.6);}}
    else{let up=0;for(let d=1;d<=5;d++){if(y-d<0)break;if(cls[k-d*W]===2){up=d;break;}}if(up)put(i,20,26,16,.45*(1-up/6));
      if(y+1<H&&(cls[k+W]===1)){put(i,168,190,110,.5);}}
  }
  g.putImageData(img,0,0);
  const water=[];
  for(let ty=0;ty<GH;ty++)for(let tx=0;tx<GW;tx++){const t=map.t[ty*GW+tx],X=tx*TS,Y=ty*TS;
    if(t===T.WATER)water.push({x:X,y:Y,p:rng()*12,q:Math.floor(rng()*10)});
    if(t===T.FORD){for(let k=0;k<3;k++){g.fillStyle='rgba(220,215,195,.6)';g.fillRect(X+Math.floor(rng()*11),Y+Math.floor(rng()*11),2,1);}}
    if(t===T.MUD){g.fillStyle='rgba(40,30,20,.25)';g.fillRect(X+Math.floor(rng()*9),Y+Math.floor(rng()*10),3,1);}
    if(t===T.ROCK&&rng()<.3){const bx=X+rng()*12,by=Y+rng()*12,r=2+Math.floor(rng()*3);pdisc(g,bx+1,by+2,r,'rgba(30,26,22,.45)');pdisc(g,bx,by,r,'#8f897d');pdisc(g,bx-1,by-1,Math.max(1,r-2),'#b8b1a2');}
    if(t===T.WHEAT){for(let k=0;k<5;k++){g.fillStyle=rng()<.5?'#ecd07a':'#a8862f';g.fillRect(X+Math.floor(rng()*12),Y+Math.floor(rng()*12),1,2);}}
  }
  // mosty z bocznym licem
  for(let ty=0;ty<GH;ty++)for(let tx=0;tx<GW;tx++){if(map.t[ty*GW+tx]!==T.BRIDGE)continue;const X=tx*TS,Y=ty*TS;
    const hor=(tx>0&&map.t[ty*GW+tx-1]!==T.WATER)||(tx<GW-1&&map.t[ty*GW+tx+1]!==T.WATER);
    g.fillStyle='#8a6640';g.fillRect(X,Y,TS,TS);g.fillStyle='#65482a';
    for(let k=0;k<TS;k+=3){if(hor)g.fillRect(X+k,Y,1,TS);else g.fillRect(X,Y+k,TS,1);}
    const up=ty>0&&map.t[(ty-1)*GW+tx]===T.BRIDGE,dn=ty<GH-1&&map.t[(ty+1)*GW+tx]===T.BRIDGE;
    const lf=tx>0&&map.t[ty*GW+tx-1]===T.BRIDGE,rt=tx<GW-1&&map.t[ty*GW+tx+1]===T.BRIDGE;
    g.fillStyle='#3e2a16';
    if(!up){g.fillRect(X,Y-1,TS,2);g.fillRect(X+2,Y-4,1,4);g.fillRect(X+8,Y-4,1,4);g.fillRect(X,Y-4,TS,1);}
    if(!dn){g.fillStyle='#4e3620';g.fillRect(X,Y+TS,TS,4);g.fillStyle='#2e1e10';for(let k=1;k<TS;k+=4)g.fillRect(X+k,Y+TS,1,4);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X,Y+TS+4,TS,2);
      g.fillStyle='#3e2a16';g.fillRect(X,Y+TS-2,TS,2);g.fillRect(X+2,Y+TS-5,1,4);g.fillRect(X+8,Y+TS-5,1,4);g.fillRect(X,Y+TS-5,TS,1);}
    if(!hor){g.fillStyle='#3e2a16';if(!lf)g.fillRect(X,Y,2,TS);if(!rt)g.fillRect(X+TS-2,Y,2,TS);}
  }
  // murki z przednim licem
  for(let ty=0;ty<GH;ty++)for(let tx=0;tx<GW;tx++){if(map.t[ty*GW+tx]!==T.WALL)continue;const X=tx*TS,Y=ty*TS;
    const lr=(tx>0&&map.t[ty*GW+tx-1]===T.WALL)||(tx<GW-1&&map.t[ty*GW+tx+1]===T.WALL);
    const ud=(ty>0&&map.t[(ty-1)*GW+tx]===T.WALL)||(ty<GH-1&&map.t[(ty+1)*GW+tx]===T.WALL);
    const horiz=lr||!ud;
    for(let k=0;k<TS;k+=3){const col=rng()<.5?'#b4ae9c':'#9a9482';
      if(horiz){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+k,Y+9,3,2);g.fillStyle='#6f6a5c';g.fillRect(X+k,Y+6,3,3);g.fillStyle=col;g.fillRect(X+k,Y+3,3,3);g.fillStyle='#cfc8b4';g.fillRect(X+k,Y+3,2,1);}
      else{g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+8,Y+k+2,2,3);g.fillStyle='#6f6a5c';g.fillRect(X+4,Y+k+2,3,3);g.fillStyle=col;g.fillRect(X+4,Y+k,3,3);g.fillStyle='#cfc8b4';g.fillRect(X+4,Y+k,2,1);}}}
  // umocnienia: palisada, worki, druty, okopy, ruiny
  const nb=(tx,ty,v)=>tx>=0&&ty>=0&&tx<GW&&ty<GH&&map.t[ty*GW+tx]===v;
  for(let ty=0;ty<GH;ty++)for(let tx=0;tx<GW;tx++){const t=map.t[ty*GW+tx],X=tx*TS,Y=ty*TS;
    if(t===T.FENCE){const lr=nb(tx-1,ty,t)||nb(tx+1,ty,t),ud=nb(tx,ty-1,t)||nb(tx,ty+1,t),hz=lr||!ud;// płot z żerdzi
      g.fillStyle='rgba(0,0,0,.28)';if(hz)g.fillRect(X,Y+9,TS,2);else g.fillRect(X+7,Y,2,TS);
      for(let k=0;k<TS;k+=6){g.fillStyle='#4a3218';if(hz)g.fillRect(X+k+1,Y+1,2,9);else g.fillRect(X+4,Y+k-2,2,8);g.fillStyle='#8a6a40';if(hz)g.fillRect(X+k+1,Y+1,1,1);else g.fillRect(X+4,Y+k-2,1,1);}
      g.fillStyle='#9a7a4a';if(hz){g.fillRect(X,Y+3,TS,1);g.fillRect(X,Y+6,TS,1);}else{g.fillRect(X+3,Y,1,TS);g.fillRect(X+6,Y,1,TS);}
      g.fillStyle='#6a4a2a';if(hz){g.fillRect(X,Y+4,TS,1);g.fillRect(X,Y+7,TS,1);}else{g.fillRect(X+4,Y,1,TS);g.fillRect(X+7,Y,1,TS);}}
    if(t===T.PALISADE||t===T.SANDBAG||t===T.WIRE||t===T.TRENCH){const lr=nb(tx-1,ty,t)||nb(tx+1,ty,t),ud=nb(tx,ty-1,t)||nb(tx,ty+1,t),hz=lr||!ud;
      if(t===T.PALISADE){for(let k=0;k<TS;k+=2){const px=hz?X+k:X+5,py=hz?Y+2:Y+k-3;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(px+1,py+8,2,2);g.fillStyle=k%4?'#6a4a2a':'#7a5832';g.fillRect(px,py+1,2,8);g.fillStyle='#c8a870';g.fillRect(px,py,1,1);g.fillStyle='#4a3218';g.fillRect(px+1,py+2,1,7);}}
      else if(t===T.SANDBAG){for(let k=0;k<TS;k+=4){const px=hz?X+k:X+3,py=hz?Y+4:Y+k;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(px,py+5,5,2);g.fillStyle='#8a7a52';g.fillRect(px,py+2,5,3);g.fillStyle='#bcaa7c';g.fillRect(px,py+2,4,2);
          const qx=hz?px+2:px+1,qy=hz?py-1:py+1;g.fillStyle='#8a7a52';g.fillRect(qx,qy,5,3);g.fillStyle='#c8b688';g.fillRect(qx,qy,4,2);}}
      else if(t===T.WIRE){g.fillStyle='#4a3420';for(let k=1;k<TS;k+=6){if(hz)g.fillRect(X+k,Y+3,1,6);else g.fillRect(X+4,Y+k,4,1);}
        g.fillStyle='#a8aeb4';for(let k=0;k<TS;k++){const o=(k%4<2)?k%4:4-k%4;if(hz){g.fillRect(X+k,Y+3+o,1,1);g.fillRect(X+k,Y+7-o,1,1);}else{g.fillRect(X+3+o,Y+k,1,1);g.fillRect(X+7-o,Y+k,1,1);}}}
      else{g.fillStyle='#3a2a18';if(hz)g.fillRect(X,Y+4,TS,4);else g.fillRect(X+4,Y,4,TS);g.fillStyle='#8a7248';if(hz){g.fillRect(X,Y+3,TS,1);g.fillRect(X,Y+8,TS,1);}else{g.fillRect(X+3,Y,1,TS);g.fillRect(X+8,Y,1,TS);}
        g.fillStyle='#22180e';if(hz)g.fillRect(X,Y+4,TS,1);else g.fillRect(X+4,Y,1,TS);}}
    if(t===T.RUINS&&rng()<.7){const n=1+Math.floor(rng()*3);for(let k=0;k<n;k++){const px=X+Math.floor(rng()*10),py=Y+Math.floor(rng()*10);
      if(rng()<.3){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(px+1,py+2,4,6);g.fillStyle='#9a9286';g.fillRect(px,py-3,4,8);g.fillStyle='#6a6258';g.fillRect(px,py+1,4,1);g.fillStyle='#2a2622';g.fillRect(px+1,py-1,2,2);}
      else if(rng()<.5){g.fillStyle='#2a221c';g.fillRect(px,py,6,1);}else{g.fillStyle=rng()<.5?'#8a8278':'#a8a094';g.fillRect(px,py,2,2);}}}}
  // tablice ostrzegawcze przy polach minowych
  for(const[x,y,w,h]of mineRects(map.def)){for(const[cx,cy]of[[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(cx+1,cy,3,1);g.fillStyle='#4a3420';g.fillRect(cx,cy-6,1,6);g.fillStyle='#e0c040';g.fillRect(cx-2,cy-9,5,4);g.fillStyle='#1a1a1a';g.fillRect(cx,cy-8,1,2);}}
  // zabudowania – ściana frontowa + dach
  const seen=new Uint8Array(GW*GH),houses=[];
  for(let i=0;i<GW*GH;i++){if(map.t[i]!==T.HOUSE||seen[i])continue;let x0=99,y0=99,x1=0,y1=0;const st=[i];seen[i]=1;
    while(st.length){const c=st.pop(),cx=c%GW,cy=Math.floor(c/GW);x0=Math.min(x0,cx);y0=Math.min(y0,cy);x1=Math.max(x1,cx);y1=Math.max(y1,cy);
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const ni=ny*GW+nx;if(!seen[ni]&&map.t[ni]===T.HOUSE){seen[ni]=1;st.push(ni);}}}
    houses.push([x0*TS,y0*TS,(x1-x0+1)*TS,(y1-y0+1)*TS]);}
  // drzewa i domy razem, sortowane po y (drzewa z pniami – efekt wysokości)
  const objs=[];
  for(let ty=0;ty<GH;ty++)for(let tx=0;tx<GW;tx++){if(map.t[ty*GW+tx]!==T.FOREST)continue;const k=2+(rng()<.5?1:0);for(let i=0;i<k;i++)objs.push({k:'t',x:tx*TS+rng()*TS,y:tx*0+ty*TS+rng()*TS,r:3+Math.floor(rng()*3),s:rng()});}
  for(const h of houses)objs.push({k:'h',x:h[0],y:h[1]+h[3],h});
  objs.sort((a,b)=>a.y-b.y);
  for(const o of objs){
    if(o.k==='t'){const{x,y,r,s}=o;g.fillStyle='rgba(10,20,5,.35)';g.fillRect(Math.round(x-r+2),Math.round(y),r*2+2,2);
      g.fillStyle='#4a3320';g.fillRect(Math.round(x),Math.round(y-4),2,5);
      const pal=s<.33?['#2c4a20','#3f662c','#5c8a3c']:s<.66?['#305224','#467232','#66943f']:['#284420','#3a5e2a','#548036'];
      const cy=y-4-r;pdisc(g,x,cy,r,pal[0]);pdisc(g,x-.5,cy-.8,r-1,pal[1]);pdisc(g,x-1.2,cy-1.6,Math.max(1,r-3),pal[2]);}
    else{const[X,Y,w,h]=o.h,wall=10,top=Y-6;
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X+4,Y+h,w,4);g.fillRect(X+w,top+6,4,h);
      g.fillStyle='#d6c4a4';g.fillRect(X,Y+h-wall,w,wall);g.fillStyle='#a8967a';g.fillRect(X,Y+h-1,w,1);
      for(let k=4;k<w-4;k+=8){g.fillStyle='#3a3026';g.fillRect(X+k,Y+h-8,3,3);g.fillStyle='#8aa0b0';g.fillRect(X+k,Y+h-8,1,1);}
      g.fillStyle='#5a3a22';g.fillRect(X+Math.floor(w/2)-2,Y+h-7,4,7);
      g.fillStyle='#983f2c';g.fillRect(X-2,top,w+4,h-wall+6);
      for(let k=2;k<h-wall+6;k+=3){g.fillStyle='#74301f';g.fillRect(X-2,top+k,w+4,1);}
      g.fillStyle='#c0604a';g.fillRect(X-2,top+Math.floor((h-wall+6)/2),w+4,1);g.fillStyle='#5a4a3c';g.fillRect(X+w-8,top-5,3,6);}
  }
  map.water=water;
  return c;
}
function makeThumb(canvas){const c=document.createElement('canvas');c.width=192;c.height=108;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.drawImage(canvas,0,0,192,108);
  g.fillStyle='#f2e6b8';g.fillRect(Math.round(OBJ.x/5),Math.round(OBJ.y/5)-5,1,6);g.fillRect(Math.round(OBJ.x/5)+1,Math.round(OBJ.y/5)-5,3,2);return c;}
function prepMap(i){if(MAPDATA[i])return MAPDATA[i];const m=buildMap(i);m.canvas=renderTerrain(m);m.thumb=makeThumb(m.canvas);MAPDATA[i]=m;return m;}


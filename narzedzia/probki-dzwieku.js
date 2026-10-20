const {chromium}=require(process.env.PW||'playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'../index.html'));await pg.waitForTimeout(2000);
  const jobs=[['bogurodzica','choir'],['jezus',''],['bij',''],['hurra_pl',''],['rebel',''],['allah',''],['ura',''],['gud',''],['venus',''],['gaul','carnyx'],['mehter','mehter'],['bitwa','mix']];
  for(const[k,mode] of jobs){
    const r=await pg.evaluate(async([k,mode])=>{const SR=44100,len=mode==='mix'?9:6;const off=new OfflineAudioContext(2,SR*len,SR);
      const save={ctx:AU.ctx,master:AU.master,noise:AU.noise,ok:AU.ok,bus:VOX.bus,vox:G.vox};
      AU.ctx=off;AU.master=off.createGain();AU.master.gain.value=.5;AU.master.connect(off.destination);VOX.bus=null;G.vox=1;
      const nb=off.createBuffer(1,SR*1.6,SR),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=nb;AU.ok=()=>true;
      if(mode==='mehter')mehter(.12);else if(mode==='mix'){drumRoll(.1);cry('bij',300);setTimeout(()=>{},0);
        // salwa, armata, krzyki, rżenie, tętent – skrót bitwy
        const t0=0;for(let i=0;i<25;i++)AU.burst(.05,200,'lowpass',2,.09,-.4,1+i*.09);AU.musket(700,3);VOX.neigh(200,.18);
        for(let i=0;i<4;i++){VOX.lastScream=0;VOX.scream(300+i*100);}AU.cannon(800);whoosh(250);}
      else{cry(k,480,{n:mode==='choir'?12:8});if(mode==='carnyx')carnyx(480);}
      const buf=await off.startRendering();
      Object.assign(AU,{ctx:save.ctx,master:save.master,noise:save.noise,ok:save.ok});VOX.bus=save.bus;G.vox=save.vox;
      const L=buf.getChannelData(0),R2=buf.getChannelData(1);let pk=0,ss=0,nan=0;for(let i=0;i<L.length;i++){const v=L[i];if(!isFinite(v))nan++;pk=Math.max(pk,Math.abs(v),Math.abs(R2[i]));ss+=v*v;}
      // 16-bit WAV
      const n=L.length,ab=new ArrayBuffer(44+n*4),dv=new DataView(ab);const w=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
      w(0,'RIFF');dv.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*4,true);
      const g=pk>0.98?0.98/pk:1;for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R2[i]*g))*32767,true);}
      let bin='';const u8=new Uint8Array(ab);for(let i=0;i<u8.length;i+=32768)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
      return{k,peak:pk.toFixed(3),rms:Math.sqrt(ss/n).toFixed(4),nan,b64:btoa(bin)};},[k,mode]);
    fs.writeFileSync(require('path').resolve(__dirname,'../probki')+'/'+k+'.wav',Buffer.from(r.b64,'base64'));console.log(r.k,'peak',r.peak,'rms',r.rms,'nan',r.nan);}
  console.log(errs.join('\n')||'no errors');await b.close();})();

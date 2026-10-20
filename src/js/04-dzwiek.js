/* ================= DŹWIĘK (synteza WebAudio) ================= */
const AU={ctx:null,master:null,noise:null,
  init(){try{if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.5;this.master.connect(this.ctx.destination);
    const len=Math.floor(this.ctx.sampleRate*1.6),b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.noise=b;}catch(e){}},
  ok(){return this.ctx&&this.ctx.state==='running';},
  pan(x){return clamp((x/W)*2-1,-1,1)*.8;},
  burst(dur,freq,type,q,vol,pan=0,delay=0){if(!this.ok())return;const c=this.ctx,t=c.currentTime+delay;const s=c.createBufferSource();s.buffer=this.noise;s.playbackRate.value=.8+Math.random()*.4;
    const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    s.connect(f);f.connect(g);let node=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);node=p;}node.connect(this.master);s.start(t,Math.random()*.4,dur+.05);},
  tone(f,dur,type,vol,delay=0,slide=0,lp=0){if(!this.ok())return;const c=this.ctx,t=c.currentTime+delay;const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.linearRampToValueAtTime(Math.max(20,f+slide),t+dur);const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.02);
    g.gain.setValueAtTime(vol,t+dur*.7);g.gain.exponentialRampToValueAtTime(.0001,t+dur);let n=o;if(lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl);n=fl;}
    n.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.05);},
  musket(x,n){const p=this.pan(x);for(let i=0;i<Math.min(n,3);i++)this.burst(.2+Math.random()*.12,1300+Math.random()*900,'bandpass',.8,.32,p,i*.035+Math.random()*.04);this.burst(.5,320,'lowpass',1,.16,p);},
  cannon(x){const p=this.pan(x);this.burst(1.3,380,'lowpass',.7,.95,p);this.tone(58,.7,'sine',.6,0,-30);this.burst(.12,2600,'highpass',.5,.3,p);},
  impact(x,soft){const p=this.pan(x);this.burst(soft?.35:.6,soft?600:220,'lowpass',1,soft?.25:.5,p);},
  clash(x){const p=this.pan(x);this.burst(.07,4200,'highpass',3,.14,p);if(Math.random()<.5)this.tone(2300+Math.random()*900,.06,'triangle',.04);},
  fizzle(x){this.burst(.45,3200,'highpass',.4,.12,this.pan(x));},
  ui(){this.tone(660,.05,'square',.05);},
  ok2(){this.tone(880,.07,'square',.05);this.tone(1320,.09,'square',.04,.06);},
  bad(){this.tone(180,.12,'square',.05);},
  bugle(seq){const e=(typeof G!=='undefined'&&G.era)||'acw',k=e==='rome'?.5:e==='ww2'?2:1,w=e==='ww2'?'triangle':'sawtooth';let t=0;for(const[f,d]of seq){if(f)this.tone(f*k,d*.92,w,e==='ww2'?.07:.11,t,0,e==='rome'?900:1800);t+=d;}}
};
const BUG={
  call:[[392,.14],[523,.14],[659,.14],[784,.4],[0,.08],[659,.14],[784,.55]],
  charge:[[392,.1],[392,.1],[523,.1],[659,.2],[523,.1],[659,.1],[784,.5]],
  rally:[[523,.14],[659,.14],[784,.36]],
  win:[[392,.2],[523,.2],[659,.2],[784,.45],[659,.2],[784,.9]],
  flag:[[659,.12],[784,.3]]
};


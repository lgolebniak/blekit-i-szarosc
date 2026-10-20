/* ================= KOMPUTER: nowe jednostki ================= */
const CPUSCORE={leg:()=>45,arc:(u,f)=>f.some(e=>Math.abs(e.x-u.x)<380)&&u.reload<=0?52:30,mg:()=>44,tank:()=>50};
const CPU={
  leg(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.type==='inf'),u)||nearestBy(foes,u),dx=Math.abs(t.x-u.x),dy=t.y-u.y;
    const ranged=foes.some(f=>(f.key==='arc'||f.key==='bal')&&Math.abs(f.x-u.x)<420),cavNear=foes.find(f=>f.type==='cav'&&f.state==='ride'&&dist(f.x,f.y,u.x,u.y)<180);
    const want=cavNear?'orbis':dx<110?'wedge':ranged?'testudo':'line';
    if(want!==u.rf){const A=!c.lastA;c.lastA=A;return{x:0,y:0,A};}c.lastA=false;
    if(want==='orbis')return{x:0,y:0,A:false};
    const pil=u.rf!=='testudo'&&u.cd2<=0&&dx<95&&Math.abs(dy)<25;
    if(dx>40){const v=steer(u,t.x,t.y,dt);return{x:v[0],y:v[1],A:false,R:pil};}
    return{x:dir*.5,y:clamp(dy/20,-1,1),A:false,R:pil};},
  arc(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.type==='inf'&&!(f.key==='leg'&&f.rf==='testudo')),u)||nearestBy(foes,u),dx=Math.abs(t.x-u.x),dy=t.y-u.y;
    if(u.aiming){const want=clamp(dx*(1+c.aimErr),u.aimMin+5,u.aimMax-3);return{x:0,y:0,A:u.aimR<want||u.aimDir<0};}
    if(dx>340){const v=steer(u,t.x-dir*260,t.y,dt);return{x:v[0],y:v[1],A:false};}
    if(Math.abs(dy)>3)return{x:0,y:clamp(dy/14,-1,1),A:false};
    if(u.reload>0)return{x:0,y:0,A:false};c.aimErr=(R()-.5)*.08;return{x:0,y:0,A:true};},
  artFlat(u,dt,foes,dir,c){const pref=u.key==='at'?foes.filter(f=>f.type==='tank'):foes.filter(f=>f.type==='inf'&&!(f.key==='leg'&&f.rf==='testudo'));
    const t=nearestBy(pref,u)||nearestBy(foes,u);let best=t.y-u.y;
    if(t.type!=='tank')for(const o of t.men)if(o.alive&&Math.abs(o.y-u.y)<Math.abs(best))best=o.y-u.y;
    const tol=t.type==='tank'?5:2;if(Math.abs(best)>tol)return{x:0,y:clamp(best/8,-1,1),A:false};
    const fire=u.reload<=0&&u.setup<=0&&!c.lastA;c.lastA=fire;return{x:0,y:0,A:fire};},
  mg(u,dt,foes,dir,c){const g=u.men.find(m=>m.alive)||u;const t=nearestBy(foes.filter(f=>f.type==='inf'),u)||nearestBy(foes.filter(f=>f.type!=='tank'),u)||nearestBy(foes,u);const dx=Math.abs(t.x-g.x);
    if(dx>360&&!u.firing){const v=steer(u,t.x-dir*300,t.y,dt);return{x:v[0],y:v[1],A:false};}
    if(u.over||u.heat>.9)return{x:0,y:0,A:false};const wantY=(t.y-g.y)*380/Math.max(60,dx),d=wantY-(u.mgY||0);
    return{x:0,y:u.firing?(d>5?1:d<-5?-1:0):0,A:true};},
  tank(u,dt,foes,dir,c){const t=nearestBy(foes.filter(f=>f.key==='at'||f.key==='mg'||f.key==='rif'),u)||nearestBy(foes,u);const dx=Math.abs(t.x-u.x),dy=t.y-u.y;
    if(dx>320&&!u.track){const v=steer(u,t.x-dir*250,t.y,dt);return{x:v[0],y:v[1],A:false};}
    const iy=Math.abs(dy)>4?clamp(dy/12,-1,1):0,ix=u.track?0:dx<150?-dir*.5:0;
    const fire=Math.abs(dy)<5&&u.reload<=0&&!c.lastA;c.lastA=fire;return{x:ix,y:iy,A:fire,R:t.type==='inf'&&Math.abs(dy)<20&&dx<300};}
};


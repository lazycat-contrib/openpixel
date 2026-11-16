// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

function P(g,x,y,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),1,1)}
function L(g,x0,y0,x1,y1,c,th){th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<2000;i++){g.fillRect(x0-o,y0-o,th,th);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}

const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const toH=a=>'#'+a.map(v=>clamp(rd(v),0,255).toString(16).padStart(2,'0')).join('');
function mix(a,b,t){const A=hx(a),B=hx(b);return toH(A.map((v,i)=>v+(B[i]-v)*t))}
const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];


// ================= creative ideas: shared drawing kit =================
// A frame is painted into a Uint32 framebuffer (exact pixels, no blending), then canvas ops may add strokes on top.
const UC=new Map();function UU(h){let v=UC.get(h);if(v===undefined){v=U(h);UC.set(h,v)}return v}
function FB(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const im=x.createImageData(w,h);
  return{w,h,c,x,im,d:new Uint32Array(im.data.buffer)}}
function fbPut(F,g){g.putImageData(F.im,0,0)}

// pixel / span / rect in the framebuffer (colours are hex strings or U ints)
const cu=c=>typeof c==='number'?c:UU(c);
function fp(F,x,y,c){x|=0;y|=0;if(x<0||y<0||x>=F.w||y>=F.h)return;F.d[y*F.w+x]=cu(c)}
function fr(F,x,y,w,h,c){c=cu(c);let x0=Math.max(0,fl(x)),y0=Math.max(0,fl(y)),x1=Math.min(F.w,fl(x)+fl(w)),y1=Math.min(F.h,fl(y)+fl(h));for(let j=y0;j<y1;j++)F.d.fill(c,j*F.w+x0,j*F.w+x1)}
function fdisc(F,cx,cy,r,c){c=cu(c);for(let y=-Math.ceil(r);y<=Math.ceil(r);y++){const yy=y;const w=Math.sqrt(Math.max(0,r*r-yy*yy));if(r*r-yy*yy<0)continue;const a=rd(cx-w),b=rd(cx+w);const Y=rd(cy)+y;if(Y<0||Y>=F.h)continue;
  const x0=Math.max(0,a),x1=Math.min(F.w-1,b);if(x1>=x0)F.d.fill(c,Y*F.w+x0,Y*F.w+x1+1)}}
function fell(F,cx,cy,rx,ry,c){c=cu(c);const Y0=Math.ceil(cy-ry),Y1=fl(cy+ry);for(let Y=Y0;Y<=Y1;Y++){if(Y<0||Y>=F.h)continue;const t=(Y+0.5-cy)/ry;if(Math.abs(t)>1)continue;const w=rx*Math.sqrt(1-t*t);const x0=Math.max(0,rd(cx-w)),x1=Math.min(F.w,rd(cx+w));if(x1>x0)F.d.fill(c,Y*F.w+x0,Y*F.w+x1)}}
function fpoly(F,pts,c){c=cu(c);let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}
  for(let y=Math.max(0,fl(y0));y<=Math.min(F.h-1,Math.ceil(y1));y++){const yc=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=Math.max(0,rd(xs[k])),xb=Math.min(F.w,rd(xs[k+1]));if(xb>xa)F.d.fill(c,y*F.w+xa,y*F.w+xb)}}}

// a thick stroke along a polyline (round-ish: discs at points)
function fstroke(F,pts,c,r){for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));for(let k=0;k<=n;k++){const t=k/n;fdisc(F,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,c)}}}
// quadratic / cubic point helpers
const qb=(a,b,c,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*c[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*c[1]];
function qpts(a,b,c,n){const o=[];for(let i=0;i<=n;i++)o.push(qb(a,b,c,i/n));return o}
// per-pixel painter over a box: f(x,y) returns colour (string/int) or null to keep
function fpaint(F,x0,y0,x1,y1,f){x0=Math.max(0,fl(x0));y0=Math.max(0,fl(y0));x1=Math.min(F.w,Math.ceil(x1));y1=Math.min(F.h,Math.ceil(y1));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const c=f(x,y);if(c!=null)F.d[y*F.w+x]=cu(c)}}

const sm=t=>t<0?0:t>1?1:t*t*(3-2*t);
const lerp=(a,b,t)=>a+(b-a)*t;
const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);

// ---- vector shapes rasterised through a transform (for pieces that zoom): crisp at every scale, clipped to a box
// T = {s, ox, oy} maps room (x,y) -> screen (ox + x*s, oy + y*s); C = [x0,y0,x1,y1] integer clip
function vpoly(F,pts,c,T,C){c=cu(c);const P=pts.map(p=>[T.ox+p[0]*T.s,T.oy+p[1]*T.s]);let y0=1e9,y1=-1e9;for(const p of P){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}
  const ya=Math.max(Math.ceil(C[1]),fl(y0)),yb=Math.min(Math.ceil(C[3])-1,Math.ceil(y1));
  for(let y=ya;y<=yb;y++){const yc=y+0.5,xs=[];for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=Math.max(Math.ceil(C[0]),rd(xs[k])),xb=Math.min(Math.ceil(C[2]),rd(xs[k+1]));if(xb>xa)F.d.fill(c,y*F.w+xa,y*F.w+xb)}}}

function vell(F,cx,cy,rx,ry,c,T,C){const n=Math.max(12,Math.min(64,fl((rx+ry)*T.s*0.8)));const p=[];for(let i=0;i<n;i++){const a=i/n*2*PI;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry])}vpoly(F,p,c,T,C)}
function vline(F,x0,y0,x1,y1,w,c,T,C){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1;const mw=Math.max(w,0.6/T.s);const nx=-dy/l*mw/2,ny=dx/l*mw/2;vpoly(F,[[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]],c,T,C)}

// ================= creative ideas: shared sound (from new-frontiers-2 n0_sound.js) =================
// everything is synthesised in the browser: noise beds through filters, oscillators, a generated reverb; nothing is loaded
let SND=null,SND_WANT=false,SND_LAST=0;
function sndOn(ctx0){if(SND)return SND;let ctx=ctx0;if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  const sr=ctx.sampleRate,master=ctx.createGain();master.gain.value=ctx0?0.8:0;master.connect(ctx.destination);
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=18000;lp.Q.value=0.5;lp.connect(master);
  const bus=ctx.createGain();bus.gain.value=1;bus.connect(lp);
  const ir=ctx.createBuffer(2,sr*3,sr);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.6)*(i<sr*0.01?i/(sr*0.01):1)}
  const rev=ctx.createConvolver();rev.buffer=ir;const revG=ctx.createGain();revG.gain.value=0.6;rev.connect(revG);revG.connect(bus);
  const nb=(len,brown)=>{const b=ctx.createBuffer(1,sr*len,sr),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(brown){l=(l+0.02*w)/1.02;d[i]=l*3.5}else d[i]=w}return b};
  SND={ctx,master,bus,lp,rev,white:nb(2,false),brown:nb(4,true),beds:{},vol:0,clock:null,ks:new Map(),
    at(){return this.clock!=null?this.clock:this.ctx.currentTime+0.03}};
  if(!ctx0){ctx.resume&&ctx.resume();
    // the sound follows the picture: when the animation stops ticking (paused, tab hidden) it fades out
    SND.iv=setInterval(()=>{if(!SND)return;const live=performance.now()-SND_LAST<220,target=live?0.8:0;if(target!==SND.vol){SND.vol=target;const now=SND.ctx.currentTime;SND.master.gain.cancelScheduledValues(now);SND.master.gain.setTargetAtTime(target,now,live?0.12:0.04)}},60)}
  return SND}
function sndOff(){if(!SND)return;clearInterval(SND.iv);try{SND.ctx.close()}catch(e){}SND=null}
const SND_CTL={type:'toggle',key:'sound',label:'声音',get def(){return SND_WANT}};
function sndInit(S){S.pu=null;if(S.opt.sound)sndOn()}
function sndOpt(S,k){if(k!=='sound')return;SND_WANT=!!S.opt.sound;if(SND_WANT)sndOn();else sndOff()}
// called from a piece's tick: works out the previous frame so events fire once when the loop crosses them
function sndTick(S,LOOPT,fn){if(!SND||!S.opt.sound)return;SND_LAST=performance.now();const u=S.t%LOOPT;let pu=S.pu==null?u-1:S.pu;
  if(u<pu)pu=(pu>=LOOPT-3&&u<3)?-1:u-1;else if(u-pu>30)pu=u-1;S.pu=u;fn(SND,S,u,pu,S.t)}
const crossed=(pu,u,x)=>pu<x&&u>=x;
// ---- building blocks ----
function bed(A,name,src,ft,f,q,freq){let b=A.beds[name];if(b)return b;const c=A.ctx;let s;
  if(src==='white'||src==='brown'){s=c.createBufferSource();s.buffer=A[src];s.loop=true;s.loopStart=Math.random()}else{s=c.createOscillator();s.type=src;s.frequency.value=freq||110}
  const fi=c.createBiquadFilter();fi.type=ft;fi.frequency.value=f;fi.Q.value=q||0.7;const g=c.createGain();g.gain.value=0;s.connect(fi);fi.connect(g);g.connect(A.bus);s.start();
  return A.beds[name]={s,f:fi,g}}
function bset(A,name,vol,f,tc,freq){const b=A.beds[name];if(!b)return;const t=A.at();b.g.gain.setTargetAtTime(Math.max(0,vol),t,tc||0.25);if(f)b.f.frequency.setTargetAtTime(f,t,tc||0.25);if(freq&&b.s.frequency)b.s.frequency.setTargetAtTime(freq,t,tc||0.25)}
function env(A,node,t0,a,peak,dur,out,wet){const g=A.ctx.createGain();g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+a+dur);node.connect(g);g.connect(out||A.bus);
  if(wet){const w=A.ctx.createGain();w.gain.value=wet;g.connect(w);w.connect(A.rev)}return g}
function tone(A,type,f,t0,dur,vol,o){o=o||{};const c=A.ctx,s=c.createOscillator();s.type=type;s.frequency.setValueAtTime(f,t0);if(o.to)s.frequency.exponentialRampToValueAtTime(o.to,t0+(o.glide||dur));if(o.det)s.detune.value=o.det;
  let n=s;if(o.ft){const fi=c.createBiquadFilter();fi.type=o.ft;fi.frequency.value=o.ff;fi.Q.value=o.q||0.7;s.connect(fi);n=fi}env(A,n,t0,o.a||0.005,vol,dur,null,o.wet);s.start(t0);s.stop(t0+(o.a||0.005)+dur+0.05)}
function noise(A,t0,dur,vol,ft,f,o){o=o||{};const c=A.ctx,s=c.createBufferSource();s.buffer=o.brown?A.brown:A.white;s.loop=true;const fi=c.createBiquadFilter();fi.type=ft;fi.frequency.setValueAtTime(f,t0);if(o.to)fi.frequency.exponentialRampToValueAtTime(o.to,t0+(o.glide||dur));fi.Q.value=o.q||0.7;s.connect(fi);
  env(A,fi,t0,o.a||0.003,vol,dur,null,o.wet);s.start(t0,Math.random()*1.5);s.stop(t0+(o.a||0.003)+dur+0.05)}


// ================= 1. 一生如圆 : a life told in match cuts; the same circle survives every cut =================


// ================= 2. 放大镜下的早餐 : an aerial desert that turns out to be toast seen through a magnifier =================


// ================= 3. 格子外 : a girl climbs out of a comic panel after her balloon =================
// Rule of the piece: inside a panel everything is coloured by that panel's light; in the white gutters between panels
// (outside any story) she, the balloon and the cat are only ink lines on paper.


// ================= 4. 手影 : hand shadows on a bedroom wall that run away on their own =================


// ================= 5. 画中画 : a painter painting the room he is in; the camera falls into the canvas forever =================
// Every level is the same room drawn from vector shapes through a transform, so it stays crisp at any zoom.
// Each level inward is one season later; after four levels the picture is back where it began.


// ================= 6. 活拼图 : only the pieces already put in place are alive =================


// ================= 7. 水洼倒影 : the puddles on a rainy street reflect a different street =================
// Two worlds share one street: a cold rainy night and a lantern festival with a whale in the air.
// Each puddle shows the OTHER world (background mirrored about the building line, people about their feet).
// A girl jumps into the big puddle, the camera tilts down into it, the picture turns over, and we are on the other side.


// ================= batch 3 kit: small shared helpers for the twenty short idea pieces =================
const pk=(r,g,b)=>(0xff000000|(clamp(rd(b),0,255)<<16)|(clamp(rd(g),0,255)<<8)|clamp(rd(r),0,255))>>>0;
const mixV=(v,w,a)=>pk((v&255)+((w&255)-(v&255))*a,((v>>8)&255)+(((w>>8)&255)-((v>>8)&255))*a,((v>>16)&255)+(((w>>16)&255)-((v>>16)&255))*a);

// stepped glow: three flat rings blended toward a colour
function glowV(B,cx,cy,r,col,a){col=cu(col);for(let y=fl(cy-r);y<=cy+r;y++)for(let x=fl(cx-r);x<=cx+r;x++){if(x<0||y<0||x>=B.w||y>=B.h)continue;const d=Math.hypot(x+0.5-cx,y+0.5-cy)/r;if(d>=1)continue;const s=d<0.4?1:d<0.7?0.6:0.3;const i=y*B.w+x;B.d[i]=mixV(B.d[i],col,a*s)}}
// tint a whole box toward a colour (flat, for light/night)
function tintBox(B,x0,y0,x1,y1,col,a){col=cu(col);x0=Math.max(0,fl(x0));y0=Math.max(0,fl(y0));x1=Math.min(B.w,fl(x1));y1=Math.min(B.h,fl(y1));for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*B.w+x;B.d[i]=mixV(B.d[i],col,a)}}

// common piece wrapper
function piece(o){const W=480,H=270,F=FB(W,H),L=o.loop;
  SAMPLES.push({id:o.id,name:o.name,w:W,h:H,thumb:o.thumb||40,tags:o.tags,about:o.about,
    controls:[SND_CTL].concat((o.btns||[]).map(([label,t])=>({type:'button',label,act(s){s.t=t}}))),
    init(s){sndInit(s)},onOpt(s,k){sndOpt(s,k)},onLeave:sndOff,
    tick(s){sndTick(s,L,(A,S,u,pu)=>o.sound&&o.sound(A,u,pu,x=>crossed(pu,u,x),A.at()))},
    draw(s,g){const t=((s.t%L)+L)%L;o.draw(F,t);fbPut(F,g)},
    info(s){const t=((s.t%L)+L)%L;return o.info?o.info(t):fl(t/24)+' / '+fl(L/24)+' 秒'}})}

// ================= d01 鱼缸里的海 : a goldfish tank on a desk is bigger on the inside =================
(function(){
const TX0=112,TY0=84,TX1=368,TY1=208,C=[TX0,TY0,TX1,TY1],L=900;
// whale outline in its own coordinates (facing left, ~136 long), drawn through a transform so it stays crisp at any size
const WB=[[0,2],[6,-6],[18,-12],[36,-15],[58,-14],[78,-10],[94,-5],[106,-1],[114,1],[106,5],[90,9],[70,13],[48,15],[26,14],[10,10],[2,6]];
const WBK=[[6,-6],[18,-12],[36,-15],[58,-14],[78,-10],[94,-5],[78,-7],[58,-11],[36,-12],[18,-9]];
const WBL=[[2,6],[10,10],[26,14],[48,15],[70,13],[90,9],[70,10],[48,11],[26,10],[10,7]];
function whale(F,x,y,s,dir,t,haze){const flap=Math.sin(t*0.05)*5,h=c=>mix(c,'#0e3a5a',haze);const T={s,ox:x,oy:y};const m=p=>p.map(([a,b])=>[(a-60)*dir,b]);
  vpoly(F,m([[112,0],[124,-9+flap],[136,-13+flap],[130,-3+flap],[137,8+flap],[125,6+flap],[113,2]]),h('#22305a'),T,C);
  vpoly(F,m(WB),h('#2a3a68'),T,C);vpoly(F,m(WBK),h('#3a4c86'),T,C);vpoly(F,m(WBL),h('#8a9ec4'),T,C);
  for(let k=0;k<4;k++)vline(F,(10+k*2-60)*dir,7+k,(38+k*4-60)*dir,11+k,0.7,h('#6a7eaa'),T,C);
  for(const[a,b]of [[4,-2],[8,-5],[12,-1],[22,-11],[30,-12],[60,-12]])vell(F,(a-60)*dir,b,0.9,0.9,h('#6a7eaa'),T,C);
  vpoly(F,m([[30,10],[40,12],[54,28-flap*0.6],[48,30-flap*0.6],[34,16]]),h('#22305a'),T,C);vline(F,(30-60)*dir,10,(48-60)*dir,30-flap*0.6,0.8,h('#a8bce0'),T,C);
  vell(F,(14-60)*dir,2,2.2,1.8,h('#0a1020'),T,C);vell(F,(14.6-60)*dir,1.4,0.7,0.6,h('#c8d8ff'),T,C)}
const BGR=FB(480,270);
{const B=BGR;fpaint(B,0,0,480,270,(x,y)=>((x%24)<2?'#2c2e42':'#28293c'));
  fr(B,20,50,70,4,'#3a2a24');for(let i=0;i<9;i++){const h=18+fl(hash(i,1,2)*12);fr(B,24+i*7,50-h,6,h,['#6a3a3a','#3a4a6a','#5a5a3a','#4a3a5a','#6a5a40'][i%5]);fr(B,24+i*7,50-h,6,1,'#8a7a6a')}
  // desk
  fr(B,0,212,480,58,'#4a3022');fr(B,0,212,480,3,'#7a5238');fr(B,0,215,480,1,'#3a241a');for(let x=0;x<480;x+=60)fr(B,x,222,1,48,'#40281c');
  // lamp at the right
  fr(B,440,150,4,62,'#2a2228');fr(B,428,208,28,4,'#2a2228');fpoly(B,[[420,150],[464,150],[456,124],[428,124]],'#c88a3a');fr(B,428,124,28,2,'#e8b060');
  glowV(B,442,138,46,'#f0b060',0.12);for(let x=380;x<480;x++)for(let y=215;y<240;y++){const d=Math.abs(x-442)/60+(y-215)/40;if(d<1)B.d[y*480+x]=mixV(B.d[y*480+x],UU('#f0b060'),d<0.5?0.18:0.1)}
  // the tank's blue light on the wall and desk
  tintBox(B,96,60,384,212,'#34607a',0.1);for(let x=110;x<370;x++)for(let y=215;y<232;y++)B.d[y*480+x]=mixV(B.d[y*480+x],UU('#4a9ac0'),y<222?0.22:0.12)}
function inside(F,t,wh){// water, rays, the deep floor receding, the whale, ornaments, goldfish
  fpaint(F,TX0,TY0,TX1,TY1,(x,y)=>y<104?'#2a8aa8':y<124?'#227a9c':y<146?'#1a6890':y<168?'#155a80':'#104c70');
  for(let k=0;k<5;k++){const x0=140+k*52+Math.sin(t*0.01+k)*6;fpoly(F,[[x0,TY0],[x0+10,TY0],[x0-30,TY1],[x0-44,TY1]].map(p=>[clamp(p[0],TX0,TX1),p[1]]),'#2a90b0')}
  // far ridges: three layers, lighter = further
  const ridge=(y0,amp,seed,c)=>fpaint(F,TX0,TY0,TX1,TY1,(x,y)=>{const h=y0-amp*(0.5+0.5*Math.sin(x*0.03+seed)+0.3*Math.sin(x*0.071+seed*2));return y>h?c:null});
  ridge(150,8,1,'#1a6488');ridge(166,10,4,'#145878');
  if(wh&&wh.s<0.9)whale(F,wh.x,wh.y,wh.s,wh.dir,t,wh.haze);
  ridge(182,8,7,'#104a66');
  if(wh&&wh.s>=0.9)whale(F,wh.x,wh.y,wh.s,wh.dir,t,wh.haze);
  // gravel, a castle ornament, a diver, plants
  fpaint(F,TX0,190,TX1,TY1,(x,y)=>{const h=hash(x,y,3);return y<192?'#c8a870':h<0.2?'#a88a58':h<0.35?'#d8c08a':'#bca068'});
  {const x=150,y=192;fr(F,x,y-30,26,30,'#b8a890');fr(F,x+4,y-40,8,12,'#a89880');fr(F,x+16,y-38,8,10,'#a89880');for(const dx of [4,8,16,20])fr(F,x+dx,y-42+(dx>12?2:0),2,2,'#a89880');fr(F,x+9,y-14,8,14,'#2a3040');fdisc(F,x+13,y-14,4,'#2a3040');fr(F,x+5,y-26,3,4,'#2a3040');fr(F,x+19,y-26,3,4,'#2a3040');fr(F,x,y-30,26,1,'#d8c8b0')}
  {const x=320,y=192;fr(F,x-4,y-10,8,10,'#c8a040');fdisc(F,x,y-14,5,'#d8b050');fdisc(F,x+1,y-14,3,'#3a5a6a');fr(F,x-5,y-2,4,2,'#3a3a3a');fr(F,x+1,y-2,4,2,'#3a3a3a')}
  for(const[x,h,c]of [[128,40,'#3a8a3a'],[134,30,'#4aa04a'],[290,46,'#3a8a3a'],[350,34,'#4aa04a'],[356,26,'#3a8a3a']])for(let k=0;k<h;k++){const sw=Math.sin(t*0.05+k*0.15+x)*k*0.06;fr(F,rd(x+sw),190-k,2,1,c)}
  // bubbles from the diver
  for(let i=0;i<8;i++){const a=((t*0.9+i*16)%120);const bx=321+Math.sin(a*0.2+i)*2,by=176-a;if(by>TY0+1){fp(F,bx,by,'#a8e0f0');fp(F,bx+1,by,'#a8e0f0');fp(F,bx,by-1,'#d8f4ff')}}}
function fish(F,x,y,dir,t,i){const w=Math.sin(t*0.3+i)*1.5;const X=d=>x+d*dir;
  fell(F,x,y,5,3,'#e8702a');fell(F,X(1),y-1,3,1.5,'#f8a050');fpoly(F,[[X(-4),y],[X(-9),y-3+w],[X(-9),y+3+w]],'#f08a3a');fp(F,X(3),y-1,'#1a1a1a');fr(F,rd(X(-1)),y-4,2,1,'#f08a3a')}
function cat(F,t,puff){const x=404,y=212,O='#1a1820',c='#5a5866',d='#46444f',rim='#6ac0d8';const p=puff?2:0;
  fell(F,x+2,y-12,13+p,13+p,O);fell(F,x+2,y-12,12+p,12+p,c);for(let k=0;k<3;k++)fr(F,x+4+k*4,y-22+k,2,10,d);
  fdisc(F,x-6,y-28-p,9+p,O);fdisc(F,x-6,y-28-p,8+p,c);const ea=puff?3:0;fpoly(F,[[x-13,y-32-p],[x-12-ea,y-42+ea*2-p],[x-7,y-35-p]],O);fpoly(F,[[x-3,y-35-p],[x+2+ea,y-43+ea*2-p],[x+2,y-31-p]],O);fp(F,x-11,y-36-p,'#c88a8a');
  fr(F,x-13,y-29-p,3,2,puff?'#f0f080':'#c8d050');fp(F,x-13,y-29-p,'#1a1a1a');
  for(let k=0;k<12;k++)fp(F,x-10-(k>6?1:0),y-6-k*2,rim);fr(F,x-14,y-28-p,1,6,rim);
  const sw=Math.sin(t*0.08)*6;fstroke(F,qpts([x+14,y-4],[x+26,y-8+sw],[x+24,y-26+sw],10),O,2.4);fstroke(F,qpts([x+14,y-4],[x+26,y-8+sw],[x+24,y-26+sw],10),c,1.4);
  if(puff)for(let k=0;k<16;k++){const a=-PI*0.9+k*0.12;fp(F,x+2+Math.cos(a)*16,y-12+Math.sin(a)*16,O)}
  fr(F,x-12,y-3,6,3,O);fr(F,x-11,y-3,4,2,c)}
function draw(F,t){F.d.set(BGR.d);
  // whale path: far speck -> turn and approach -> eye at the glass -> back into the deep
  let wh=null;
  if(t<200){const u=t/200;wh={x:400-u*190,y:136,s:0.12,dir:1}}
  else if(t<420){const u=sm((t-200)/220);wh={x:lerp(210,250,u),y:lerp(136,150,u),s:lerp(0.12,1.0,u*u),dir:u<0.08?1:-1}}
  else if(t<560){const u=(t-420)/140;{const v=sm(Math.min(1,u*1.6));wh={x:lerp(250,74,v),y:lerp(150,133,v),s:lerp(1.0,3.6,v),dir:-1}}}
  else if(t<720){const u=sm((t-560)/160);wh={x:lerp(74,150,u),y:lerp(133,150,u),s:lerp(3.6,0.1,Math.sqrt(u)),dir:-1}}
  if(wh)wh.haze=clamp(0.75-wh.s*0.7,0,0.75);
  inside(F,t,wh);
  // goldfish: they dart behind the castle when the whale is close
  const hide=t>430&&t<600;for(let i=0;i<3;i++){const p=t*0.012+i*2.1;let x=240+Math.sin(p)*100,y=120+i*18+Math.sin(p*1.7)*6;const dir=Math.cos(p)>0?1:-1;if(hide){const k=sm(Math.min(1,(t-430)/30))*(1-sm(Math.max(0,(t-570)/30)));x=lerp(x,162+i*4,k);y=lerp(y,176-i*3,k);if(k>0.9){if(i===0)fish(F,147,174,-1,t,0);continue}}fish(F,rd(x),rd(y),dir,t,i)}
  // when the whale is near, the whole tank darkens under it
  if(wh&&wh.s>2)tintBox(F,TX0,TY0,TX1,TY1,'#06182a',wh.s>3?0.35:0.2);
  // glass, lid, water surface, base
  fr(F,TX0,TY0,TX1-TX0,1,'#8ad8ec');const rip=t>740&&t<800;for(let x=TX0;x<TX1;x++){const yy=TY0+(rip?rd(Math.sin((x-360)*0.3-t*0.5)*Math.max(0,1-(t-740)/60)*1.5):0);fp(F,x,yy,'#c8f0ff')}
  fr(F,TX0-4,TY0-14,TX1-TX0+8,6,'#2a2a30');fr(F,TX0-4,TY0-14,TX1-TX0+8,1,'#4a4a54');fr(F,TX0,TY0-8,TX1-TX0,8,'#1a2a34');
  fr(F,TX0-4,TY1,TX1-TX0+8,4,'#2a2a30');fr(F,TX0-2,TY0-8,2,TY1-TY0+8,'#3a4a54');fr(F,TX1,TY0-8,2,TY1-TY0+8,'#3a4a54');
  for(let y=TY0;y<TY1;y++){fp(F,TX0+6,y,mixV(F.d[y*480+TX0+6],UU('#ffffff'),0.25));fp(F,TX0+8,y,mixV(F.d[y*480+TX0+8],UU('#ffffff'),0.15))}
  fr(F,TX1-26,TY0+6,4,10,'#f0c070');fr(F,TX1-20,TY0+6,2,10,'#f0c070');// lamp reflected in the glass
  cat(F,t,t>468&&t<560);
  // paw taps the glass
  if(t>730&&t<790){const k=Math.sin((t-730)/60*PI*3);const px=372-rd(Math.max(0,k)*6);fstroke(F,[[392,196],[px,190]],'#1a1820',3);fstroke(F,[[392,196],[px,190]],'#5a5866',2)}}
piece({id:'tank',name:'鱼缸里的海',loop:L,thumb:500,draw,
  tags:['鱼缸比它看起来大得多','远处的小黑点是一头鲸','鲸游近，眼睛贴到玻璃上','金鱼躲进城堡，猫炸毛','鲸只是路过，又回到深处'],
  about:'夜里书桌上一只小鱼缸，三条金鱼，一座塑料城堡，一个冒泡的潜水员。可是鱼缸后面的海底一层层往远处退，远得看不到头。远处有个小黑点慢慢转过身来，越游越近，越来越大，原来是一头鲸。它游到玻璃跟前，一只眼睛占满整个鱼缸，看了看桌上的猫。金鱼躲进城堡，猫毛全炸开。鲸又转身游回深处。猫过了好一会儿，伸爪子敲了敲玻璃。',
  btns:[['从头',0],['鲸游近',380]],
  sound(A,u,pu,X,at){bed(A,'hum','brown','lowpass',220);bset(A,'hum',0.05,null,0.5);
    if(u%37===0)tone(A,'sine',400+hash(u,1,1)*300,at,0.08,0.02,{to:900});
    if(X(210)||X(380))[0,0.5].forEach((d,i)=>tone(A,'sine',[140,175][i],at+d,3,0.04,{to:[95,120][i],glide:2.6,wet:0.6}));
    if(X(440))tone(A,'sine',55,at,4,0.08,{to:40});if(X(470))noise(A,at,0.5,0.05,'bandpass',4200,{q:2});
    if(X(740)||X(752))tone(A,'triangle',1800,at,0.03,0.04,{to:1200})}});
})();

// ================= d02 红绿灯小人 : the little green man walks out of the pedestrian light =================
// He stays made of LED dots wherever he goes: every body cell is a lamp on a 4 px pitch.


// ================= d03 时针和分针 : two people ride the hands of a tower clock and meet eleven times in twelve hours =================


// ================= d04 雪人的循环 : follow one snowman's water through a year =================
// snowman -> melt -> puddle -> vapour -> its own cloud -> rain -> snow -> the kids build it again


// ================= d05 地铁线路图 : zoom into a dot on the metro map, it is a real train; the girl getting off is looking at that map =================
// Everything is vector, drawn through one camera transform, so the zoom in and the push into the phone stay crisp.


// ================= d06 天气预报 : the icons on the weather map turn into real weather =================


// ================= d07 心电图 : the heartbeat on a monitor becomes mountains, then a calm sea, then a second, tiny heartbeat =================
// Everything stays in one phosphor green ramp, like the monitor.


// ================= d08 加载中 : a tiny worker pushes the progress bar; at 99% it sticks, so they break through =================


// ================= d09 俄罗斯方块城 : the falling pieces are buildings; full rows don't vanish, people move in =================


// ================= d10 月亮是猫 : the moon is a white cat asleep in the sky; the phases are a blanket pulled over it =================


// ================= d11 墨迹测试 : one symmetric ink blot keeps flowing from one answer into the next =================
// The ink is a field of soft blobs on the right half, mirrored; morphing a shape means moving its blobs.


// ================= d12 万花筒 : a mandala that turns out to be the street outside, seen through a girl's toy kaleidoscope =================


// ================= d13 抽屉里的世界 : every drawer of an old dresser holds a little world; the cat travels through them =================


// ================= d14 换台 : every channel spills out of the TV into the living room =================


// ================= d15 时间切片 : one street cut into 24 vertical strips, each strip a different hour of the same day =================


// ================= d16 车窗 : in every tunnel the train window turns into a mirror, and the mirror shows a girl in the empty seat opposite =================


// ================= d17 沙漏城 : the sand that runs down builds a desert city; turn the glass over and the city runs back down into dunes =================


// ================= d18 一张纸 : a sheet's whole life: letter, paper plane, paper boat, pulp, a new sheet, a new letter =================


// ================= d19 掌纹 : a tiny traveller walks the lines of a palm; the life line is a whole life =================


// ================= d20 跷跷板 : the sun and the moon sit on the two ends of a seesaw; whoever goes to sleep weighs their end down =================


// ================= d21 雨伞下 : seen from above, every umbrella hides its own weather =================


// ================= d22 电梯 : every floor the elevator doors open onto another world =================


// ================= d23 日晷 : the gnomon's shadow is a little person who spends the day going round the dial =================


// ================= d24 洗衣机 : behind the porthole of a washing machine is a sea; the lost red sock sails away on it =================


// ================= d25 翻页小人 : the stick man in a textbook's corner flipbook runs off the last page and onto the desk =================


// ================= d26 雾镜 : a smiley drawn on a steamed-up mirror lives as long as the fog does =================


// ================= d27 天花板 : lying in bed, the cracks in the ceiling turn into rivers and the damp stain into a sea =================


// ================= d28 雪地脚印 : nobody is visible; the whole story is told by footprints appearing in fresh snow =================


// ================= d29 窗帘缝 : a strip of sun through the curtains crosses a dark room; whatever it touches comes alive =================


// ================= d30 键盘城 : a keyboard is a little city; what gets typed on it happens to the city =================


// ================= d31 霓虹猫 : a cat made of neon tube can only live inside the signs; between them it runs along the wires =================


// ================= d32 一杯茶 : from above, a cup of tea is a lake with a fisherman; stirring, sugar and drinking are weather =================


// ================= d33 楼窗 : an apartment block at night; the residents switch their lights so the windows draw pictures =================


// ================= d34 山谷回声 : a girl shouts across a canyon; the words fly, bounce back, and the last echo answers =================


// ================= d35 电线五线谱 : five power lines are a staff, the sparrows on them are notes; a girl walking underneath plays them =================


// ================= d36 雨刷 : on a long rainy drive, every sweep of the wiper wipes in a different place, until it wipes in home =================


// ================= d37 气泡 : every big bubble in a glass of soda carries something; when it pops at the top, the thing gets out =================


// ================= d38 冰箱 : the moment the fridge door shuts and the light goes out, the food throws a party =================


// ================= d39 晾衣绳 : washing on a line, and the wind turns it into a puppet show =================


// ================= d40 星座 : the constellations join their dots, come alive and chase each other across the sky =================


// ================= player =================
const cv=document.getElementById('cv'),g=cv.getContext('2d'),stage=document.getElementById('stage');
const $=id=>document.getElementById(id);
let cur=0,S=null,paused=false,speed=1,acc=0,last=performance.now(),visible=true;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce)paused=true;
function newState(def){const s={t:0,opt:{}};for(const c of def.controls||[])if(c.key)s.opt[c.key]=c.def;def.init(s);return s}
function fit(){const d=SAMPLES[cur],aw=stage.clientWidth-2,ah=Math.max(200,innerHeight*0.66);let sc=Math.min(aw/d.w,ah/d.h);if(sc>=2)sc=fl(sc);
  cv.style.width=fl(d.w*sc)+'px';cv.style.height=fl(d.h*sc)+'px';S.scale=sc}
function render(){g.imageSmoothingEnabled=false;SAMPLES[cur].draw(S,g);syncUI()}
function syncUI(){const d=SAMPLES[cur];$('info').textContent=(d.info?d.info(S)+' · ':'')+`${d.w}×${d.h}`+(S.scale>=2?` ×${S.scale}`:'');
  for(const el of $('ctls').querySelectorAll('[data-key]')){const k=el.dataset.key,v=S.opt[k];
    if(el.dataset.type==='seg')for(const b of el.querySelectorAll('button'))b.classList.toggle('on',String(b.dataset.v)===String(v));
    else if(el.dataset.type==='toggle'){el.classList.toggle('on',!!v);el.setAttribute('aria-pressed',!!v)}
    else if(el.dataset.type==='range'&&document.activeElement!==el)el.value=v}}
function tick(){SAMPLES[cur].tick(S);S.t++}
function select(i){if(SAMPLES[cur]&&S&&SAMPLES[cur].onLeave)SAMPLES[cur].onLeave(S);cur=i;const d=SAMPLES[i];cv.width=d.w;cv.height=d.h;S=newState(d);
  $('nm').textContent=d.name;$('about').textContent=d.about;
  $('tags').innerHTML='<li class="h">TECHNIQUES</li>'+d.tags.map(t=>`<li>${t}</li>`).join('');
  const box=$('ctls');box.innerHTML='';
  for(const c of d.controls||[]){
    if(c.type==='seg'){const lab=document.createElement('span');lab.className='lab';lab.textContent=c.label;const seg=document.createElement('div');seg.className='seg';seg.dataset.key=c.key;seg.dataset.type='seg';
      for(const[v,l]of c.options){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.v=v;b.onclick=()=>{S.opt[c.key]=v;d.onOpt&&d.onOpt(S,c.key);render()};seg.appendChild(b)}
      box.append(lab,seg)}
    else if(c.type==='toggle'){const b=document.createElement('button');b.type='button';b.textContent=c.label;b.dataset.key=c.key;b.dataset.type='toggle';b.onclick=()=>{S.opt[c.key]=!S.opt[c.key];d.onOpt&&d.onOpt(S,c.key);render()};box.append(b)}
    else if(c.type==='range'){const lab=document.createElement('label');lab.className='lab';lab.textContent=c.label;lab.htmlFor='rg-'+c.key;const r=document.createElement('input');r.type='range';r.id='rg-'+c.key;r.min=c.min;r.max=c.max;r.step='0.1';r.dataset.key=c.key;r.dataset.type='range';
      r.oninput=()=>{S.opt[c.key]=+r.value;render()};box.append(lab,r)}
    else if(c.type==='button'){const b=document.createElement('button');b.type='button';b.textContent=c.label;b.onclick=()=>{c.act(S);render()};box.append(b)}}
  for(const[k,el]of [...$('tabs').children].entries())el.classList.toggle('on',k===i);
  cv.style.touchAction=d.onPointer?'none':'auto';fit();render();try{history.replaceState(null,'','#'+d.id)}catch(e){}}
// speed control
for(const[v,l]of [[0.25,'¼'],[0.5,'½'],[1,'1×'],[2,'2×'],[4,'4×']]){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.v=v;b.onclick=()=>{speed=v;for(const x of $('spd').children)x.classList.toggle('on',+x.dataset.v===speed)};$('spd').appendChild(b)}
for(const x of $('spd').children)x.classList.toggle('on',+x.dataset.v===speed);
function setPaused(p){paused=p;$('play').textContent=p?'播放':'暂停'}
$('play').onclick=()=>setPaused(!paused);
$('stepb').onclick=()=>{setPaused(true);tick();render()};
function cpos(e){const r=cv.getBoundingClientRect(),d=SAMPLES[cur];return[(e.clientX-r.left)/r.width*d.w,(e.clientY-r.top)/r.height*d.h]}
cv.addEventListener('pointerdown',e=>{const d=SAMPLES[cur],p=cpos(e);if(d.onPointer){try{cv.setPointerCapture(e.pointerId)}catch(_){}d.onPointer(S,p[0],p[1],'down',1);e.preventDefault()}if(d.onClick)d.onClick(S,p[0],p[1]);render()});
cv.addEventListener('pointermove',e=>{const d=SAMPLES[cur];if(d.onPointer){const p=cpos(e);d.onPointer(S,p[0],p[1],'move',e.buttons)}});
cv.addEventListener('pointerup',e=>{const d=SAMPLES[cur];if(d.onPointer){const p=cpos(e);d.onPointer(S,p[0],p[1],'up',0)}});
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const d=SAMPLES[cur];
  if(d.onKey&&d.onKey(S,e.key,true)){e.preventDefault();return}
  if(e.key===' '){e.preventDefault();setPaused(!paused)}else if(e.key==='ArrowRight'){e.preventDefault();setPaused(true);tick();render()}
  else{const k='1234567890-='.indexOf(e.key);if(k>=0&&k<SAMPLES.length)select(k);else if(e.key==='['||e.key===']')select((cur+(e.key===']'?1:SAMPLES.length-1))%SAMPLES.length)}});
addEventListener('keyup',e=>{const d=SAMPLES[cur];if(d.onKey)d.onKey(S,e.key,false)});
// thumbnails
SAMPLES.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='tab';const c=document.createElement('canvas');c.width=d.w;c.height=d.h;
  const st=newState(d);st.t=d.thumb||40;const tg=c.getContext('2d');tg.imageSmoothingEnabled=false;d.draw(st,tg);
  const tl=document.createElement('span');tl.className='tl';tl.innerHTML=`<span class="k">${i+1}</span>${d.name}`;b.append(c,tl);b.onclick=()=>select(i);$('tabs').appendChild(b)});
new ResizeObserver(()=>{if(S){fit();render()}}).observe(stage);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage);
const start=Math.max(0,SAMPLES.findIndex(d=>'#'+d.id===location.hash));select(start);setPaused(paused);
function loop(now){const dt=Math.min(0.25,(now-last)/1000);last=now;
  if(!paused&&visible){acc+=dt*24*speed;let n=0;while(acc>=1&&n<8){tick();acc-=1;n++}if(n)render()}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);

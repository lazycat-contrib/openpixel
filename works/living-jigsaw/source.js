// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),fl(w),fl(h))}

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};

// 3x5 pixel font
const F3={'D':'110101101101110','E':'111100111100111','O':'111101101101111','C':'111100100100111','L':'100100100100111','A':'111101111101101','R':'110101110101101','0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001010010','8':'111101111101111','9':'111101111001111','+':'000010111010000','-':'000000111000000','M':'101111111101101','K':'101101110101101','H':'101101111101101','/':'001001010100100',' ':'000000000000000'};


const SAMPLES=[];

// stepped fade to black: brightness snapped to quarters, applied to the finished frame
function fadeK(g,w,h,k){k=Math.round(clamp(k,0,1)*4)/4;if(k>=1)return;if(k<=0){R(g,0,0,w,h,'#000000');return}
  const im=g.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){d[i]=d[i]*k;d[i+1]=d[i+1]*k;d[i+2]=d[i+2]*k}g.putImageData(im,0,0)}


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
function fline(F,x0,y0,x1,y1,c,th){c=cu(c);th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<3000;i++){for(let a=0;a<th;a++)for(let b=0;b<th;b++){const X=x0-o+a,Y=y0-o+b;if(X>=0&&Y>=0&&X<F.w&&Y<F.h)F.d[Y*F.w+X]=c}if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
// a thick stroke along a polyline (round-ish: discs at points)
function fstroke(F,pts,c,r){for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));for(let k=0;k<=n;k++){const t=k/n;fdisc(F,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,r,c)}}}

// per-pixel painter over a box: f(x,y) returns colour (string/int) or null to keep
function fpaint(F,x0,y0,x1,y1,f){x0=Math.max(0,fl(x0));y0=Math.max(0,fl(y0));x1=Math.min(F.w,Math.ceil(x1));y1=Math.min(F.h,Math.ceil(y1));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const c=f(x,y);if(c!=null)F.d[y*F.w+x]=cu(c)}}

// 3x5 numerals into framebuffer
function fnum(F,s,x,y,c,sc){sc=sc||1;let cx=x;for(const ch of s){const b=F3[ch]||F3[' '];for(let i=0;i<15;i++)if(b[i]==='1')fr(F,cx+(i%3)*sc,y+fl(i/3)*sc,sc,sc,c);cx+=4*sc}}

const sm=t=>t<0?0:t>1?1:t*t*(3-2*t);
const lerp=(a,b,t)=>a+(b-a)*t;
const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
// a capsule limb/finger with outline, base and a light stripe offset toward the light (lx,ly)
function cap(F,pts,r,o,b,l,lx,ly){fstroke(F,pts,o,r+1);fstroke(F,pts,b,r);if(l){const k=r*0.45;fstroke(F,pts.map(p=>[p[0]+lx*k,p[1]+ly*k]),l,Math.max(0.6,r*0.38))}}
// cel-shaded blob: list of ellipses [cx,cy,rx,ry,colour] painted in order
function cels(F,list){for(const e of list)fell(F,e[0],e[1],e[2],e[3],e[4])}


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
// a struck bell: inharmonic partials, the low ones ring longest
function bell(A,t0,f,vol,wet){[[0.5,1,7],[1,0.8,5],[1.19,0.55,3.6],[1.5,0.4,3],[2,0.5,2.4],[2.52,0.25,1.6],[2.66,0.2,1.3],[3.01,0.18,1.1],[4.2,0.12,0.7]].forEach(([r,a,d])=>tone(A,'sine',f*r,t0,d,vol*a,{a:0.004,wet:wet==null?0.5:wet}))}
// a plucked string (Karplus-Strong), rendered once per pitch
function pluck(A,t0,f,vol,wet,out){const c=A.ctx,key=Math.round(f*10);let b=A.ks.get(key);if(!b){const sr=c.sampleRate,N=Math.round(sr/f),len=Math.floor(sr*2.8);b=c.createBuffer(1,len,sr);const d=b.getChannelData(0);
    for(let i=0;i<N;i++)d[i]=Math.random()*2-1;d[N]=d[0];for(let i=N+1;i<len;i++)d[i]=0.4985*(d[i-N]+d[i-N-1]);A.ks.set(key,b)}
  const s=c.createBufferSource();s.buffer=b;const g=c.createGain();g.gain.value=vol;s.connect(g);g.connect(out||A.bus);if(wet){const w=c.createGain();w.gain.value=wet;g.connect(w);w.connect(out?A.master:A.rev)}s.start(t0)}

const mtof=m=>440*Math.pow(2,(m-69)/12);

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
(function(){
const W=480,H=270,F=FB(W,H);
const BW=300,BH=180,BX=90,BY=45,NC=10,NR=6,PS=30;// board, 10x6 pieces of 30 px
const PIC=FB(BW,BH),PIC0=FB(BW,BH);
// ------------------------------------------------------------------ piece shapes: cells with round tabs on shared edges
const TABH=[],TABV=[];{const r=rng(17);for(let j=0;j<NR;j++){TABH.push([]);for(let i=0;i<NC-1;i++)TABH[j].push(r()<0.5?1:-1)}for(let j=0;j<NR-1;j++){TABV.push([]);for(let i=0;i<NC;i++)TABV[j].push(r()<0.5?1:-1)}}
const OWN=new Int16Array(BW*BH);
for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){let i=fl(x/PS),j=fl(y/PS);let o=j*NC+i;const px=x+0.5,py=y+0.5;
  // a tab is a round head (r 5, centred 6 px over the edge) on a narrower neck
  const tab=(ex,ey,sg,ax,ay)=>{const cx=ex+sg*6*ax,cy=ey+sg*6*ay;if(Math.hypot(px-cx,py-cy)<5.2)return true;const a=ax?(px-ex)*sg:(py-ey)*sg,b=ax?Math.abs(py-ey):Math.abs(px-ex);return a>=-0.5&&a<3&&b<2.6};
  for(let ii=Math.max(0,i-1);ii<=Math.min(NC-2,i);ii++){const ex=(ii+1)*PS,ey=j*PS+PS/2,sg=TABH[j][ii];if(tab(ex,ey,sg,1,0))o=j*NC+(sg>0?ii:ii+1)}
  for(let jj=Math.max(0,j-1);jj<=Math.min(NR-2,j);jj++){const ey=(jj+1)*PS,ex=i*PS+PS/2,sg=TABV[jj][i];if(tab(ex,ey,sg,0,1))o=(sg>0?jj:jj+1)*NC+i}
  OWN[y*BW+x]=o}
// bounding boxes of each piece's pixels
const PB=[];for(let k=0;k<NC*NR;k++)PB.push([1e9,1e9,-1,-1]);for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const b=PB[OWN[y*BW+x]];if(x<b[0])b[0]=x;if(y<b[1])b[1]=y;if(x>b[2])b[2]=x;if(y>b[3])b[3]=y}
// ------------------------------------------------------------------ placing order: edges first, then the inside row by row; the last one is on the road where the bus waits
const LASTP=4*NC+6;
const ORDER=[];{for(let k=0;k<NC*NR;k++){const i=k%NC,j=fl(k/NC);if(i===0||j===0||i===NC-1||j===NR-1)ORDER.push(k)}for(let j=1;j<NR-1;j++)for(let i=1;i<NC-1;i++){const k=j*NC+i;if(k!==LASTP)ORDER.push(k)}
  const r=rng(3);for(let a=ORDER.length-1;a>20;a--){if(r()<0.3){const b=20+fl(r()*(a-20));[ORDER[a],ORDER[b]]=[ORDER[b],ORDER[a]]}}ORDER.push(LASTP)}
const STEP=7,FLY=14,T_LAST=ORDER.length*STEP+150,LOOP=T_LAST+FLY+420;
const placeT=new Array(NC*NR);ORDER.forEach((k,n)=>placeT[k]=n<ORDER.length-1?n*STEP:T_LAST);
// where each loose piece waits: around the board on the table
const HOME=[];{const r=rng(8);const spots=[];for(let y=6;y<H-30;y+=27)for(const x of [6,34,60,W-90,W-62,W-36])spots.push([x,y]);for(let x=96;x<W-96;x+=34){spots.push([x,4]);spots.push([x,H-34])}
  for(let k=0;k<NC*NR;k++){const s=spots[k%spots.length];HOME.push([s[0]+fl(r()*6-3),s[1]+fl(r()*6-3)])}}
const placed=(k,t)=>t>=placeT[k]+FLY;
const pieceAt=(x,y)=>{x=fl(x);y=fl(y);if(x<0||y<0||x>=BW||y>=BH)return -1;return OWN[y*BW+x]};
// ------------------------------------------------------------------ actors that can only move through placed pieces
function simulate(t){// returns positions: boat, bus, birds (step from 0; each waits when the piece ahead is missing)
  let boat=20,bus=-30,bird=40,ferry=280;
  for(let u=0;u<t;u+=2){const ok=(x,y)=>{const k=pieceAt(((x%BW)+BW)%BW,y);return k<0||placed(k,u)};
    if(ok(boat+30,82))boat+=0.6;if(ok(bus+40,128))bus+=1.0;if(ok(bird+12,26))bird+=1.2;if(ok(ferry-20,100))ferry-=0.4}
  return{boat,bus,bird,ferry}}
// ------------------------------------------------------------------ the picture: a seaside town on a summer afternoon
function picture(B,t,A,lit){
  fpaint(B,0,0,BW,BH,(x,y)=>y<14?'#5aa8e0':y<30?'#74b8e8':y<44?'#94cceE'.toLowerCase():'#b4dcf2');
  fdisc(B,60,24,10,'#fff6c8');fdisc(B,60,24,7,'#fffce8');
  for(const[x0,y,w]of [[40,16,40],[150,10,52],[230,22,36]]){const x=((x0+t*0.08)%(BW+60))-30;fr(B,x,y,w,6,'#ffffff');fr(B,x+6,y-4,w-16,4,'#ffffff');fr(B,x+4,y+6,w-8,1,'#d8ecf8')}
  // headland and lighthouse on the right
  fpoly(B,[[206,53],[226,46],[246,38],[300,33],[300,53]],'#6a9a4a');fpoly(B,[[226,46],[246,38],[300,33],[300,39],[250,43]],'#8ab85a');fr(B,206,52,94,1,'#4a7a3a');
  fr(B,268,10,12,34,'#f4f0e8');fr(B,268,16,12,5,'#d8343a');fr(B,268,28,12,5,'#d8343a');fr(B,266,6,16,5,'#3a3a4a');fr(B,270,7,8,3,lit?'#fff4a0':'#a8b0b8');
  if(lit){const a=t*0.05;fpoly(B,[[274,8],[274+Math.cos(a)*60,8+Math.sin(a)*14-6],[274+Math.cos(a)*60,8+Math.sin(a)*14+6]],'#fff8d0')}
  // sea with glints
  fr(B,0,53,BW,59,'#2a7ab8');for(let j=0;j<12;j++){const y=54+j*5;for(let x=0;x<BW;x++){if(((x+fl(t*(0.2+j*0.04))+j*17)%(22+j))<3)fp(B,x,y,j<4?'#5aa0d8':'#4a92cc')}}
  // sailboat (from the simulation) and a little ferry
  {const x=((A.boat%BW)+BW)%BW,y=82;fpoly(B,[[x-14,y],[x+14,y],[x+10,y+6],[x-10,y+6]],'#c84a3a');fr(B,x-1,y-26,2,26,'#5a3a2a');fpoly(B,[[x+1,y-26],[x+14,y-2],[x+1,y-2]],'#ffffff');fpoly(B,[[x-1,y-20],[x-11,y-2],[x-1,y-2]],'#f2e6c8');fr(B,x-16,y+6,32,1,'#9ad0f0')}
  {const x=((A.ferry%BW)+BW)%BW,y=100;fr(B,x-12,y-4,24,6,'#f4f0e8');fr(B,x-8,y-8,14,4,'#e8b030');fr(B,x-12,y+2,24,2,'#3a4a6a');fr(B,x+12,y+3,8,1,'#9ad0f0')}
  // birds
  for(let i=0;i<4;i++){const x=((A.bird+i*12)%BW+BW)%BW,y=26+(i%2)*5+Math.sin(t*0.1+i)*2,f=(fl(t/5)+i)%2;fp(B,x-2,y-f,'#2a3a4a');fp(B,x-1,y,'#2a3a4a');fp(B,x,y+1,'#2a3a4a');fp(B,x+1,y,'#2a3a4a');fp(B,x+2,y-f,'#2a3a4a')}
  // sea wall, promenade with lamp posts, the road
  fr(B,0,112,BW,6,'#c8b89a');fr(B,0,112,BW,1,'#e8dcc0');for(let x=8;x<BW;x+=40){fr(B,x,96,2,16,'#3a3a4a');fr(B,x-2,94,6,3,'#3a3a4a')}
  fr(B,0,118,BW,22,'#6a6a72');for(let x=0;x<BW;x+=16)fr(B,x+((fl(t*0)%16)),128,8,1,'#e8e4d8');fr(B,0,118,BW,1,'#4a4a52');fr(B,0,139,BW,1,'#8a8a90');
  // the bus (it waits at missing pieces)
  {const x=A.bus,y=134;if(x>-40&&x<BW+40){fr(B,x-24,y-16,46,14,'#3a8a5a');fr(B,x-24,y-16,46,3,'#5ab07a');for(let k=0;k<5;k++)fr(B,x-20+k*8,y-12,6,5,'#cfe8f4');fr(B,x+17,y-12,4,8,'#cfe8f4');fdisc(B,x-14,y-1,3,'#2a2a30');fdisc(B,x+12,y-1,3,'#2a2a30');fr(B,x+20,y-6,2,2,'#fff4a0')}}
  // houses: a row of bright fronts with roofs, windows, laundry and a cat
  const cols=['#f2c8a0','#e8e0c8','#a8d0e0','#f0a890','#f4e0a0','#c8d8b0','#e8b8c8','#f2c8a0'];
  for(let i=0;i<8;i++){const x=i*38-4,w=36,h=26+(i*13)%14,y=BH-h;fr(B,x,y,w,h,cols[i]);fpoly(B,[[x-2,y],[x+w/2,y-12],[x+w+2,y]],['#c84a3a','#3a5a8a','#d8843a','#5a4a6a'][i%4]);
    for(let k=0;k<2;k++){fr(B,x+6+k*16,y+6,8,8,'#3a4a6a');fr(B,x+7+k*16,y+7,6,6,lit&&(i+k)%3===0?'#fff0a0':'#8ac0e0');fr(B,x+10+k*16,y+7,1,6,'#3a4a6a')}
    fr(B,x+w/2-4,BH-12,8,12,'#7a4a3a')}
  fline(B,40,150,76,150,'#5a5a5a');for(const[x,c]of [[46,'#e85a5a'],[56,'#ffffff'],[66,'#5a8ae8']])fr(B,x,151,7,8,c);
  {const x=196,y=BH-38-12+4;const wag=Math.sin(t*0.2)*2;fr(B,x,y,8,5,'#2a2a30');fr(B,x+6,y-3,4,4,'#2a2a30');fp(B,x+6,y-4,'#2a2a30');fp(B,x+9,y-4,'#2a2a30');fline(B,x,y+1,x-4,y-4+wag,'#2a2a30')}
}
// ------------------------------------------------------------------ hand that brings the last piece
function hand(x,y){cap(F,[[x+40,y+90],[x+16,y+30]],12,'#8a5a48','#3a5a8a','#5a7aaa',-0.5,-0.7);
  cels(F,[[x+12,y+22,15,13,'#8a5a48'],[x+12,y+21,14,12,'#e8b496']]);for(let k=0;k<4;k++)cap(F,[[x+4+k*7,y+16],[x+2+k*6,y+4]],3.2,'#8a5a48','#e8b496','#f6ceb6',-0.4,-0.8);cap(F,[[x-2,y+22],[x-6,y+10]],3.4,'#8a5a48','#e8b496','#f6ceb6',-0.4,-0.8)}
function draw(s,g){const t=((s.t%LOOP)+LOOP)%LOOP;
  const end=T_LAST+FLY;const scatter=t>LOOP-110?sm(seg(t,LOOP-110,LOOP-40)):0;
  // table: green felt with a faint weave, the empty board tray
  fpaint(F,0,0,W,H,(x,y)=>((x+y)%5===0)?'#2c5a46':'#2a5442');
  fr(F,BX-3,BY-3,BW+6,BH+6,'#1e3e30');fr(F,BX,BY,BW,BH,'#c8b48c');for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const k=OWN[y*BW+x];if(x>0&&OWN[y*BW+x-1]!==k||y>0&&OWN[(y-1)*BW+x]!==k)fp(F,BX+x,BY+y,'#b4a07a')}
  // the frozen picture for loose pieces and the live one for placed pieces
  if(!PIC0.done){picture(PIC0,0,simulate(0),false);PIC0.done=true}
  const A=simulate(Math.min(t,LOOP-110));const allIn=t>=end;picture(PIC,t,A,allIn);
  const seamFade=allIn?seg(t,end+150,end+230):0;
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const k=OWN[y*BW+x];if(!placed(k,t)||scatter>0&&k%2===0&&scatter>0.01)continue;const i=(BY+y)*W+BX+x;F.d[i]=PIC.d[y*BW+x];
    // seams between placed pieces: a thin darker line that fades away once the picture is complete
    if(seamFade<1&&(x>0&&OWN[y*BW+x-1]!==k||y>0&&OWN[(y-1)*BW+x]!==k)){if(seamFade<0.5||((x+y)%2===0&&seamFade<0.9)){const v=F.d[i];F.d[i]=(0xff000000|(((v>>16)&255)*0.72)<<16|(((v>>8)&255)*0.72)<<8|((v&255)*0.72))>>>0}}}
  // loose and flying pieces (frozen picture), with a shadow that grows while lifted
  const drawPiece=(k,px,py,lift,src)=>{const b=PB[k];for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++){if(OWN[y*BW+x]!==k)continue;const sx=rd(px+x-b[0]+lift*0.6),sy=rd(py+y-b[1]+lift);if(sx>=0&&sy>=0&&sx<W&&sy<H)F.d[sy*W+sx]=UU('#1a3428')}
    for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++){if(OWN[y*BW+x]!==k)continue;const sx=rd(px+x-b[0]),sy=rd(py+y-b[1]);if(sx<0||sy<0||sx>=W||sy>=H)continue;
      const edge=(x===b[0]||y===b[1]||OWN[y*BW+x-1]!==k||OWN[(y-1)*BW+x]!==k||x===b[2]||y===b[3]||OWN[y*BW+x+1]!==k||OWN[(y+1)*BW+x]!==k);F.d[sy*W+sx]=edge?UU('#e8dcc0'):src.d[y*BW+x]}};
  const order=[];for(let k=0;k<NC*NR;k++){if(!placed(k,t)||(scatter>0&&k%2===0))order.push(k)}
  order.sort((a,b)=>placeT[b]-placeT[a]);
  for(const k of order){const b=PB[k];const tgt=[BX+b[0],BY+b[1]];let p=HOME[k],lift=0;
    if(scatter>0&&k%2===0){const u=scatter;p=[lerp(tgt[0],HOME[k][0],u),lerp(tgt[1],HOME[k][1],u)];lift=Math.sin(u*PI)*8;drawPiece(k,p[0],p[1],lift,PIC);continue}
    if(k===LASTP&&t>=T_LAST-150&&t<T_LAST){const u=sm(seg(t,T_LAST-150,T_LAST-60));p=[lerp(HOME[k][0],tgt[0]+10,u),lerp(HOME[k][1],tgt[1]+40,u)];lift=6*u;drawPiece(k,p[0],p[1],lift,PIC0);hand(p[0]+4,p[1]+18);continue}
    if(t>=placeT[k]){const u=sm(seg(t,placeT[k],placeT[k]+FLY));const from=k===LASTP?[tgt[0]+10,tgt[1]+40]:HOME[k];p=[lerp(from[0],tgt[0],u),lerp(from[1],tgt[1],u)];lift=Math.sin(u*PI)*8+(k===LASTP?6*(1-u):0);drawPiece(k,p[0],p[1],lift,PIC0);if(k===LASTP)hand(p[0]+4,p[1]+18);continue}
    drawPiece(k,p[0],p[1],0,PIC0)}
  // counter
  const n=NC*NR-order.length+(scatter>0?0:0);fnum(F,String(Math.min(NC*NR,ORDER.filter(k=>placed(k,t)).length)).padStart(2,'0')+'/60',W-58,H-10,'#8ab8a0',1);
  fbPut(F,g);if(t<10)fadeK(g,W,H,t/10);if(t>LOOP-12)fadeK(g,W,H,(LOOP-t)/12)}
SAMPLES.push({id:'jigsaw',name:'活拼图',w:W,h:H,thumb:420,
  tags:['拼上去的块才会动，散在桌上的块是静止的','船、公交车和鸟遇到缺的那块就停下来等','最后一块正好在路上，公交车一直在它前面等','最后一块放下：灯塔亮起，窗户亮灯，拼缝慢慢消失','拼图边缘的凸起是每条边随机定的'],
  about:'绿色桌布上摊着一盒六十片的拼图，画的是夏天下午的海边小镇。一片一片拼上去：先拼边框，再拼中间。拼上去的块会动起来，云在飘，海在闪光，船在走；还散在桌上的块是静止的。画里的东西只能在拼好的地方走动，帆船、渡轮、公交车和一群鸟碰到还缺着的那一块就停下来等。公交车在路中间一直等着最后那一块。一只手把最后一块按下去，公交车开走了，灯塔亮了，屋子里的灯也亮了，拼缝慢慢淡掉，整幅画成了一个完整的、活着的小镇。然后拼图被拆开，从头再来。',
  controls:[SND_CTL,{type:'button',label:'从头',act(s){s.t=0}},{type:'button',label:'最后一块',act(s){s.t=T_LAST-160}},{type:'button',label:'拼完',act(s){s.t=T_LAST+FLY+20}}],
  init(s){sndInit(s)},onOpt(s,k){sndOpt(s,k)},onLeave:sndOff,tick(s){sndTick(s,LOOP,sound)},draw,
  info(s){const t=((s.t%LOOP)+LOOP)%LOOP;return '第 '+fl(t/24)+' 秒 / '+fl(LOOP/24)}});
function sound(A,S,u,pu){const at=A.at(),X=x=>crossed(pu,u,x);const n=ORDER.filter(k=>placed(k,u)).length;
  bed(A,'sea','brown','lowpass',400);bset(A,'sea',0.02+0.1*(n/60),null,0.6);
  // a click for each piece pressed in; the music adds a voice every 15 pieces
  for(const k of ORDER)if(X(placeT[k]+FLY)){noise(A,at,0.02,0.18,'bandpass',2200+hash(k,1,1)*800,{q:3});tone(A,'sine',180,at,0.05,0.05,{to:90})}
  const scale=[60,62,64,67,69,72,74,76];if(u%12===0){const i=fl(u/12);if(n>=0)pluck(A,at,mtof(scale[(i*3)%8]+12),0.06+0.05*(n/60),0.5);if(n>=15&&i%2===0)pluck(A,at,mtof(scale[(i*5)%8]),0.07,0.4);if(n>=30&&i%4===0)pluck(A,at,mtof(48+[0,5,7,3][fl(i/4)%4]),0.1,0.4);if(n>=45&&i%3===1)bell(A,at,mtof(scale[(i*7)%8]+24),0.012,0.6)}
  if(X(T_LAST+FLY)){bell(A,at,mtof(84),0.05,0.7);tone(A,'square',mtof(67),at+0.1,0.15,0.04);tone(A,'square',mtof(72),at+0.25,0.3,0.04)}
  if(u>T_LAST+FLY&&u<T_LAST+FLY+120&&u%24===0)tone(A,'triangle',mtof(55),at,0.2,0.04)}
})();


// ================= d01 鱼缸里的海 : a goldfish tank on a desk is bigger on the inside =================


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

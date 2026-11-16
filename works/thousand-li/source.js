// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),fl(w),fl(h))}
function P(g,x,y,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),1,1)}
function L(g,x0,y0,x1,y1,c,th){th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<2000;i++){g.fillRect(x0-o,y0-o,th,th);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}

function poly(g,pts,c){let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}g.fillStyle=c;
  for(let y=fl(y0);y<=Math.ceil(y1);y++){const yc=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=rd(xs[k]),xb=rd(xs[k+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1)}}}
function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];

// ================= cinema helpers =================
// bitmap CJK text: rasterize once with the system font, keep only pixels over an alpha threshold (no anti-aliasing reaches the stage)
const ZC={};
function zglyphs(str,size,bold){const key=str+'|'+size+'|'+(bold?1:0);if(ZC[key])return ZC[key];
  // supersample 4x, then keep a pixel when enough of its cell is covered: cleaner strokes than thresholding a small render
  const K=4,c=document.createElement('canvas'),tg=c.getContext('2d'),f=`${bold?'bold ':''}${size*K}px "PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif`;
  tg.font=f;const w=Math.ceil(tg.measureText(str).width/K)+2,h=size+4;c.width=w*K;c.height=h*K;tg.font=f;tg.textBaseline='top';tg.fillStyle='#fff';tg.fillText(str,K,K);
  const d=tg.getImageData(0,0,w*K,h*K).data,px=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0;for(let j=0;j<K;j++)for(let i=0;i<K;i++)s+=d[((y*K+j)*w*K+x*K+i)*4+3];if(s/(K*K*255)>(bold?0.42:0.3))px.push(x,y)}
  return ZC[key]={w,h,px}}
function ztxt(g,str,x,y,c,size,oc,align,bold){const G=zglyphs(str,size||10,bold);if(align==='c')x-=fl(G.w/2);else if(align==='r')x-=G.w;x=rd(x);y=rd(y);const p=G.px;
  if(oc){g.fillStyle=oc;for(let i=0;i<p.length;i+=2){g.fillRect(x+p[i]-1,y+p[i+1],3,1);g.fillRect(x+p[i],y+p[i+1]-1,1,3)}}
  g.fillStyle=c;for(let i=0;i<p.length;i+=2)g.fillRect(x+p[i],y+p[i+1],1,1);return G.w}
// stepped fade to black: brightness snapped to quarters, applied to the finished frame
function fadeK(g,w,h,k){k=Math.round(clamp(k,0,1)*4)/4;if(k>=1)return;if(k<=0){R(g,0,0,w,h,'#000000');return}
  const im=g.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){d[i]=d[i]*k;d[i+1]=d[i+1]*k;d[i+2]=d[i+2]*k}g.putImageData(im,0,0)}

const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);

// ================= masterwork helpers =================
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}

// rising puffs (steam, smoke, breath): stateless, a puff's age comes from time so any frame can be drawn
const BLOB=[['#'],['##','##'],['.##.','####','.##.'],['.###.','#####','#####','.###.']];
function blob(g,x,y,s,col){const b=BLOB[s];g.fillStyle=col;const ox=fl(x)-fl(b[0].length/2),oy=fl(y)-fl(b.length/2);for(let j=0;j<b.length;j++)for(let i=0;i<b[j].length;i++)if(b[j][i]==='#')g.fillRect(ox+i,oy+j,1,1)}
function puffs(g,x,y,t,o){const n=o.n||4,life=o.life||48,rise=o.rise||0.35,cols=o.cols,mx=o.max==null?3:o.max;for(let i=0;i<n;i++){const a=((t+i*life/n+(o.ph||0))%life),k=a/life;
  const px_=x+Math.sin(a*0.12+i*1.7+(o.ph||0))*(o.wob==null?1.5:o.wob)*k+(o.drift||0)*a,py=y-a*rise;if(o.top!=null&&py<o.top)continue;
  const sz=Math.min(mx,k<0.2?0:k<0.45?1:k<0.75?2:3);blob(g,px_,py,sz,cols[Math.min(cols.length-1,fl(k*cols.length))])}}


// ================= sound: every piece's soundscape is synthesised live with WebAudio; nothing is a recording =================
const SND={ctx:null,on:false,live:null,stop:null,out:null};
function sndCtx(){if(!SND.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;SND.ctx=new C();const comp=SND.ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;comp.connect(SND.ctx.destination);
    SND.out=SND.ctx.createGain();SND.out.gain.value=0.8;SND.out.connect(comp);
    const n=SND.ctx.sampleRate*3,b=SND.ctx.createBuffer(1,n,SND.ctx.sampleRate),d=b.getChannelData(0);let p=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;p=0.97*p+0.03*w;d[i]=w*0.6+p*2.2}SND.noise=b}
  if(SND.ctx.state==='suspended')SND.ctx.resume();return SND.ctx}
// a looping noise source through a filter, with its own gain node returned for modulation
function sNoise(ctx,dest,type,f,q,vol){const s=ctx.createBufferSource();s.buffer=SND.noise;s.loop=true;s.loopStart=Math.random();const fl_=ctx.createBiquadFilter();fl_.type=type;fl_.frequency.value=f;fl_.Q.value=q||0.7;const gn=ctx.createGain();gn.gain.value=vol;s.connect(fl_);fl_.connect(gn);gn.connect(dest);s.start();return {s,f:fl_,g:gn,stop(){try{s.stop()}catch(e){}}}}
// a slow wobble on any AudioParam
function sLfo(ctx,param,rate,depth){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=rate;g.gain.value=depth;o.connect(g);g.connect(param);o.start();return {stop(){try{o.stop()}catch(e){}}}}
// plucked string: a few harmonics with fast attack and an exponential fall; 'bright' adds a buzzing upper partial
function sPluck(ctx,dest,f,o){o=o||{};const t=ctx.currentTime+(o.at||0),dec=o.dec||1.2,v=o.vol||0.2;const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+0.004);g.gain.exponentialRampToValueAtTime(0.0008,t+dec);g.connect(dest);
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(o.bright||3000,t);lp.frequency.exponentialRampToValueAtTime(Math.max(200,f*1.5),t+dec*0.6);lp.connect(g);
  for(const [m,a,tp] of [[1,1,'triangle'],[2,0.5,'sine'],[3,0.25,o.bright?'sawtooth':'sine'],[4.02,0.12,'sine']]){const os=ctx.createOscillator(),og=ctx.createGain();os.type=tp;os.frequency.setValueAtTime(f*m*(o.bend?1.03:1),t);if(o.bend)os.frequency.exponentialRampToValueAtTime(f*m,t+0.12);og.gain.value=a;os.connect(og);og.connect(lp);os.start(t);os.stop(t+dec+0.05)}}
// a held tone with breath and vibrato (flute, fiddle, voice-like)
function sTone(ctx,dest,f,dur,o){o=o||{};const t=ctx.currentTime+(o.at||0),v=o.vol||0.1;const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(o.att||0.08));g.gain.setValueAtTime(v,t+dur*0.7);g.gain.linearRampToValueAtTime(0,t+dur);g.connect(dest);
  const os=ctx.createOscillator();os.type=o.type||'sine';os.frequency.setValueAtTime(f*(o.slide||1),t);os.frequency.exponentialRampToValueAtTime(f,t+Math.min(0.2,dur*0.3));
  const vb=ctx.createOscillator(),vg=ctx.createGain();vb.frequency.value=o.vibR||5.5;vg.gain.value=f*(o.vib||0.008);vb.connect(vg);vg.connect(os.frequency);
  let node=os;if(o.bp){const b=ctx.createBiquadFilter();b.type='bandpass';b.frequency.value=o.bp;b.Q.value=o.q||2;os.connect(b);node=b}node.connect(g);os.start(t);vb.start(t);os.stop(t+dur+0.05);vb.stop(t+dur+0.05);
  if(o.breath){const s=ctx.createBufferSource();s.buffer=SND.noise;const b=ctx.createBiquadFilter();b.type='bandpass';b.frequency.value=f*2;b.Q.value=3;const bg=ctx.createGain();bg.gain.setValueAtTime(0,t);bg.gain.linearRampToValueAtTime(v*o.breath,t+0.05);bg.gain.linearRampToValueAtTime(0,t+dur);s.connect(b);b.connect(bg);bg.connect(dest);s.start(t,Math.random());s.stop(t+dur+0.05)}}
// a burst of filtered noise: splashes, knocks, crashes, growls
function sBurst(ctx,dest,o){const t=ctx.currentTime+(o.at||0),dur=o.dur||0.3,v=o.vol||0.3;const s=ctx.createBufferSource();s.buffer=SND.noise;const b=ctx.createBiquadFilter();b.type=o.type||'bandpass';b.frequency.setValueAtTime(o.f||800,t);if(o.f2)b.frequency.exponentialRampToValueAtTime(o.f2,t+dur);b.Q.value=o.q||1;
  const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(o.att||0.005));g.gain.exponentialRampToValueAtTime(0.0008,t+dur);s.connect(b);b.connect(g);g.connect(dest);s.start(t,Math.random()*2);s.stop(t+dur+0.05)}
// a struck body: woodblock, gong, bell; inharmonic partials, each with its own decay
function sStrike(ctx,dest,f,o){o=o||{};const t=ctx.currentTime+(o.at||0),v=o.vol||0.25,dec=o.dec||0.15;for(const [m,a,dk] of (o.parts||[[1,1,1],[2.76,0.5,0.6],[5.4,0.25,0.35]])){const os=ctx.createOscillator(),g=ctx.createGain();os.type='sine';os.frequency.setValueAtTime(f*m*(o.drop?1.06:1),t);if(o.drop)os.frequency.exponentialRampToValueAtTime(f*m,t+0.3);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+0.003);g.gain.exponentialRampToValueAtTime(0.0006,t+dec*dk);os.connect(g);g.connect(dest);os.start(t);os.stop(t+dec*dk+0.05)}}
const PENTA=[0,2,4,7,9],note=(base,deg)=>base*Math.pow(2,(PENTA[((deg%5)+5)%5]+12*Math.floor(deg/5))/12);
const MIYAKO=[0,1,5,7,8],noteM=(base,deg)=>base*Math.pow(2,(MIYAKO[((deg%5)+5)%5]+12*Math.floor(deg/5))/12);

// ================= 1. 千里江山（青绿山水长卷） =================
(function(){
const W=320,H=180,WW=1500,TOP=5,BOT=175,TITLE=1412,LOOPT=2400;
// mineral pigments on aged silk: azurite at the crowns, malachite through the body, ochre at the feet
const SILK='#d8c79d',SILK2='#cfbd92',SILK3='#c5b186',INK='#2e2a24',INK2='#4a4436';
const NEAR=['#245e82','#2f7286','#3b8480','#4f9474','#6c9e66','#94a05a','#b08a4a','#b8703c'];
const NEARD=['#173e5c','#1f5262','#28605c','#336a50','#4a7246','#6a7240','#7e5c30','#844a26'];
const MID=['#4a7e98','#5a8c94','#6e9a8c','#86a684','#a2ae7c','#b8a268'];
const MIDD=['#365e78','#426c74','#527a6e','#668666','#828c5e','#94804e'];
const FAR=['#8aa8a8','#9cb2a2','#aebb9e','#bfc19c'];
const WATER='#b6c3a0',WATER2='#a6b896',WAVE='#8ea48a',WAVEF='#a2b293',FOAM='#dcd4b0';
const WL=124;// near water line
let LAY=null;
function n2(x,y,s){const xi=fl(x),yi=fl(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
// ---------- a single peak: concave flanks, a knotted crown, ridges fanning down from every knot; faces left of a ridge lit, right of it in shade ----------
const NL=['#2c7494','#348286','#3f927c','#58a070','#7ea864','#aca456','#c28a48','#c87a40'];
const NS=['#1c5070','#22626a','#2a6e60','#3c7a56','#58804c','#7e7c44','#946238','#8e5430'];
const NK=['#123a56','#174a54','#1e544a','#2a5c40','#3e6038','#5c5a32','#6c4628','#643c22'];
const ML=['#5a8ea4','#669a9c','#78a694','#94b08a','#b2b482','#c0a46e'],MS=['#46748c','#527e84','#62887c','#788e70','#94946a','#a08a5a'];
function peak(o,cx,base,h,wl,wr,seed,tone,opt){opt=opt||{};
  if(tone==='far'){const tops=prof(cx,base,h,wl,wr,seed,opt);for(const [x,ty] of tops)for(let y=Math.ceil(ty);y<base;y++){const v=(y-ty)/(h*0.8)+(n2(x*0.2,y*0.1,seed)-0.5)*0.2;P(o,x,y,FAR[clamp(fl(v*FAR.length),0,FAR.length-1)])}return tops}
  if(!opt.keep&&base<128){const e=128-base;base+=e;h+=e}
  const CL=tone==='mid'?ML:NL,CS=tone==='mid'?MS:NS,CK=tone==='mid'?MS:NK,N=CL.length,rs=rng(seed);
  const tops=prof(cx,base,h,wl,wr,seed,opt),x0=tops[0][0],top=x=>{const i=x-x0;return i>=0&&i<tops.length?tops[i][1]:1e9};
  // ridges: from each knot of the skyline, running downhill and fanning outward
  const rid=[];let crest=0;for(let i=1;i<tops.length;i++)if(tops[i][1]<tops[crest][1])crest=i;
  for(let i=3;i<tops.length-3;i++){const y=tops[i][1];if(y<=tops[i-1][1]&&y<=tops[i+1][1]&&y<tops[i-3][1]-0.5&&y<tops[i+3][1]-0.5){const x=tops[i][0],u=(x-cx)/(x<cx?wl:wr);rid.push([x,y,u*0.55+(rs()-0.5)*0.35])}}
  // extra ridges that start part-way down a flank
  for(let k=0;k<(opt.folds||4);k++){const side=rs()<0.5?-1:1,u=0.25+rs()*0.55,x=fl(cx+side*u*(side<0?wl:wr)),y=top(x)+2+rs()*4;rid.push([x,y,side*(0.35+rs()*0.4)])}
  const ridX=(r,y)=>r[0]+(y-r[1])*r[2];
  const col=(x,y)=>{const ty=top(x),d=(y-(base-h))/h,dd=(y-ty)/(h*0.6);let v=0.35*d+0.65*Math.min(1,dd);v+=(n2(x*0.2,y*0.12,seed+3)-0.5)*0.14;v=Math.pow(clamp(v,0,1),1.5);
    let dl=1e9,dr=1e9,onR=false;for(const r of rid){if(y<r[1])continue;const rx=ridX(r,y),dx=x-rx;if(Math.abs(dx)<0.5)onR=true;if(dx>=0&&dx<dl)dl=dx;if(dx<0&&-dx<dr)dr=-dx}
    if(dl===1e9&&dr===1e9){dl=x>=tops[crest][0]?1:1e9;dr=x<tops[crest][0]?1:1e9}
    const shade=dl<dr;const b=clamp(fl(v*N),0,N-1);return onR&&n2(x*0.4,y*0.4,seed+9)>0.3?CK[b]:shade?CS[b]:CL[b]};
  for(const [x,ty] of tops){if(x<0||x>=WW)continue;for(let y=Math.ceil(ty);y<base;y++)P(o,x,y,col(x,y))}
  // hemp-fibre strokes: short dark lines down the shaded faces
  const ns=fl((wl+wr)*h/110*(opt.dense||1));
  for(let i=0;i<ns;i++){const xs=fl(cx-wl+rs()*(wl+wr)),ty=top(xs);if(ty>base-4)continue;let y=Math.ceil(ty)+2+fl(rs()*h*0.6);if(y>=base-1)continue;
    const dir=xs<cx?-1:1,len=2+fl(rs()*Math.min(8,h*0.2));let fx=xs;
    for(let k=0;k<len&&y<base-1;k++){const xi=rd(fx);if(y>top(xi)+1){const v=clamp(fl(Math.pow(clamp(0.35*(y-(base-h))/h+0.65*Math.min(1,(y-top(xi))/(h*0.6)),0,1),1.5)*N),0,N-1);P(o,xi,y,CK[v])}y++;fx+=dir*(0.3+rs()*0.4)}}
  // the skyline itself, dark, broken in places
  for(const [x,ty] of tops){const y=Math.ceil(ty);if(y>=base-1)continue;if(n2(x*0.3,5,seed)<0.15)continue;const v=clamp(fl(Math.pow(clamp(0.35*(y-(base-h))/h,0,1),1.25)*N),0,N-1);P(o,x,y,CK[v])}
  for(const [x,ty] of tops){if(rs()<(opt.moss||0.14)&&ty<base-6){const y=Math.ceil(ty);P(o,x,y,'#163636');if(rs()<0.5)P(o,x+1,y,'#163636')}}
  const nt=fl((wl+wr)*(opt.trees||0.07));for(let i=0;i<nt;i++){const x=fl(cx-wl+rs()*(wl+wr)),ty=Math.ceil(top(x));if(ty>base-8)continue;pine(o,x,ty+1,2+fl(rs()*3),rs)}
  return tops}
function prof(cx,base,h,wl,wr,seed,opt){const lean=opt.lean||0,pw=opt.p||2.0,tops=[];
  for(let x=fl(cx-wl);x<=cx+wr;x++){let u=x<cx?(cx-x)/wl:(x-cx)/wr;u=Math.max(0,Math.sqrt(u*u+0.004)-0.063);
    let s=opt.round?Math.pow(Math.max(0,1-u*u),0.8):opt.dome?Math.pow(Math.max(0,1-Math.pow(u,opt.dome)),0.6)*(1-0.12*u):Math.pow(Math.max(0,1-u),pw);
    // knotted crown and shoulders: a few rounded humps riding on the profile
    s+=0.055*Math.max(0,Math.sin(u*14+seed*1.7))*(1-u)*Math.min(1,u*5);s*=1+0.08*(n2(x*0.16,0,seed)-0.5);
    tops.push([x,base-h*s+lean*(1-s)])}
  return tops}
function pine(o,x,y,h,rs){const c1='#1c3e38',c2='#2e5a46';L(o,x,y,x,y-h-1,'#4a3a2a');for(let k=0;k<h;k++){const yy=y-1-k*1.4-1,w=fl((h-k)*0.7)+1;R(o,x-w+1,fl(yy),w*2-1,1,k%2?c2:c1)}P(o,x,y-h*1.4-2,c1)}
function leafy(o,x,y,r,rs,c){c=c||['#2a5040','#3f6a4a','#5a7e50'];for(let i=0;i<r*3;i++){const a=rs()*6.28,d=rs()*r,xx=rd(x+Math.cos(a)*d*1.2),yy=rd(y+Math.sin(a)*d*0.8);P(o,xx,yy,c[yy<y-r*0.3?2:yy<y+1?1:0])}L(o,x,y+r,x,y+r*0.2,'#4a3a2a')}
// ---------- architecture ----------
function roof(o,x,y,w,h,c){c=c||'#3c3c44';poly(o,[[x-2,y+h],[x+1,y],[x+w-1,y],[x+w+2,y+h]],c);P(o,x-3,y+h-1,c);P(o,x+w+2,y+h-1,c);R(o,x,y,w,1,'#5a5a62');R(o,x-2,y+h,w+4,1,'#24242a')}
function house(o,x,y,w,hh,rh){// y = ground
  R(o,x,y-hh,w,hh,'#ebe2c4');for(let i=0;i<=w;i+=fl(w/2)||1)R(o,x+Math.min(i,w-1),y-hh,1,hh,'#8a5a3a');R(o,x,y-1,w,1,'#a88a5a');
  roof(o,x,y-hh-rh,w,rh)}
function pavilion(o,x,y,w,tiers,stilts){if(stilts){for(let i=0;i<=w;i+=3)R(o,x+i,y,1,stilts,'#5a3a26');R(o,x-1,y,w+2,1,'#6a4a2e')}
  let yy=y;for(let k=0;k<tiers;k++){const ww=w-k*4,xx=x+k*2;R(o,xx,yy-5,ww,5,'#e8dcbc');for(let i=0;i<ww;i+=3)R(o,xx+i,yy-5,1,5,'#a0503a');R(o,xx,yy-1,ww,1,'#7a3a2a');roof(o,xx,yy-8,ww,3);yy-=8}
  P(o,x+fl(w/2),yy-1,'#24242a')}
function fence(o,x0,x1,y){for(let x=x0;x<=x1;x++){P(o,x,y-2,'#7a5a3a');if(x%2===0)P(o,x,y-1,'#7a5a3a')}}
// ---------- the world, painted once ----------
function build(){const [c,o]=mkc(WW,H);
  R(o,0,0,WW,H,SILK);
  // aged silk: long faint fibres and a few broad stains, all one step darker
  {const rs=rng(5);for(let i=0;i<900;i++){const x=fl(rs()*WW),y=fl(rs()*H),w=4+fl(rs()*30);R(o,x,y,w,1,rs()<0.8?SILK2:'#dccca4')}
   for(let i=0;i<8;i++){const x=rs()*WW,y=20+rs()*120,rx=20+rs()*50,ry=6+rs()*18;for(let yy=-ry;yy<=ry;yy++){const w=rx*Math.sqrt(1-(yy/ry)**2)*(0.8+0.2*n2(yy*0.3,i,4));R(o,x-w,y+yy,w*2,1,SILK2)}}}
  // far water: a pale band where silk becomes water
  for(let y=96;y<WL;y++){for(let x=0;x<TITLE;x++){const k=(y-96)/(WL-96);if(hash(x>>3,y,9)<k*1.3)P(o,x,y,k>0.6?WATER2:'#c8c69e')}}
  // ----- distant ranges along the horizon -----
  const rf=rng(11);for(let x=-40;x<TITLE;x+=26+fl(rf()*40)){const h=8+rf()*22;peak(o,x,100,h,18+rf()*30,18+rf()*30,100+x,'far',{p:1.3})}
  // ----- the main ranges, right (start of the scroll) to left -----
  // near water fills everything below the shore line first; land masses paint over it
  for(let y=WL;y<BOT;y++)for(let x=0;x<TITLE;x++)P(o,x,y,y>WL+30?WATER:WATER2);
  // massifs: a crowd of steep, round-crowned rock masses, tallest at the back, each lower one stepping forward and down
  const massif=(cx,H,Wd,seed)=>{const rs=rng(seed),L_=[[cx,H,H*0.3,0]];const n=10+fl(rs()*5);
    for(let i=0;i<n;i++){const side=rs()<0.5?-1:1,d=Math.pow(rs(),0.8),x=cx+side*d*Wd,h=H*(0.92-0.62*d)*(0.45+0.55*rs());L_.push([x,h,h*(0.26+rs()*0.2),i+1])}
    L_.sort((a,b)=>b[1]-a[1]);for(const [x,h,hw,k] of L_){const big=h>H*0.7;peak(o,x,130,h,hw*(0.8+rs()*0.5),hw*(0.8+rs()*0.5),seed*31+k,big&&k%2?'mid':'near',{dome:2+rs()*1.6,trees:0.13,folds:3+fl(rs()*3),moss:0.18})}};
  massif(1270,104,110,22);massif(1090,150,100,32);massif(660,140,100,42);massif(180,126,120,52);

  // islets in the open water (x 300-560)
  peak(o,420,104,22,30,30,61,'mid',{keep:1});peak(o,470,106,14,24,28,62,'far');peak(o,360,104,18,24,30,63,'far');
  peak(o,520,136,16,34,22,64,'near',{moss:0.3,round:1});peak(o,330,140,10,30,20,65,'near',{round:1});
  // foothills: rows of low rounded hills stepping down to the water in front of every range, with groves in their saddles
  const fh=(x0,x1,base,seed)=>{const rs=rng(seed);let x=x0;while(x<x1){const w=14+rs()*22,h=8+rs()*16;peak(o,x+w*0.5,base+fl(rs()*4),h,w*0.6,w*0.7,seed*7+fl(x),'near',{round:1,folds:2,trees:0.14,moss:0.25});x+=w*0.75+rs()*10}};
  fh(1190,1395,126,3);fh(955,1180,130,4);fh(565,760,130,5);fh(35,315,128,6);
  // shores: ochre banks with a light sandy lip under every massif
  const shore=(x0,x1,y,depth,seed)=>{for(let x=x0;x<=x1;x++){const u=(x-x0)/(x1-x0),e=Math.sin(u*PI),yy=fl(y+(1-e)*depth*0.3+n2(x*0.1,0,seed)*2);for(let k=0;k<fl(depth*e+1);k++){P(o,x,yy+k,k===0?'#b8a06c':k<2?'#c89a5c':'#a8783e')}P(o,x,yy+fl(depth*e+1),'#dccca0')}};
  shore(1185,1400,130,6,1);shore(950,1182,133,6,2);shore(560,762,133,5,3);shore(30,320,131,6,4);
  // ----- the village at the start, the waterfall valley, the temple, the long bridge, the waterwheel hamlet -----
  {const rs=rng(70);
   // village on the right bank
   for(const [x,y,w] of [[1330,131,10],[1345,129,8],[1360,132,12],[1306,133,9],[1290,134,8]]){house(o,x,y,w,4,3)}
   fence(o,1288,1300,136);fence(o,1352,1376,135);
   for(const [x,y] of [[1318,134],[1376,133],[1284,135],[1340,133]])leafy(o,x,y-5,4,rs);
   // temple in the cleft of the great massif
   pavilion(o,1102,96,12,2,0);house(o,1086,100,10,4,3);house(o,1118,101,9,4,3);R(o,1100,96,16,1,'#a88a5a');
   for(let i=0;i<10;i++){P(o,1108+(i%2),97+i,'#a88a5a')}// stair down
   // cliff pavilion over group C
   pavilion(o,640,76,10,1,0);house(o,620,128,10,4,3);house(o,604,130,8,4,3);house(o,724,128,12,4,3);
   for(const [x,y] of [[634,128],[714,128],[596,130]])leafy(o,x,y-5,4,rs);
   // hamlet on the closing shore, with the mill house
   for(const [x,y,w] of [[200,128,12],[220,126,9],[150,130,10],[100,130,8],[260,129,10]])house(o,x,y,w,4,3);
   house(o,74,131,12,6,4);// mill
   for(const [x,y] of [[186,128],[238,127],[124,130],[284,130]])leafy(o,x,y-5,4,rs);
   // pines in groves at the feet of the ranges
   for(let i=0;i<70;i++){const g_=[[960,1180,128],[1190,1380,126],[560,760,128],[40,310,126]][i%4];const x=fl(g_[0]+rs()*(g_[1]-g_[0])),y=g_[2]+fl(rs()*5);pine(o,x,y,3+fl(rs()*4),rs)}}
  // ----- the long bridge (x 760-950) with its two-storey pavilion -----
  {const y=124;for(let x=760;x<=950;x++){P(o,x,y,'#7a4e2c');P(o,x,y+1,'#5a3a22');if(x%3===0)P(o,x,y-2,'#7a4e2c');P(o,x,y-3,'#8a5e38')}
   for(let x=764;x<=948;x+=8){R(o,x,y+2,1,10,'#5a3a22');R(o,x+1,y+2,1,10,'#6a4a2e');P(o,x,y+12,'#4a3a2a')}
   pavilion(o,848,y,16,2,0);R(o,846,y,20,1,'#7a4e2c')}
  // ----- the inscription panel at the start of the scroll -----
  {const x0=TITLE;R(o,x0,0,WW-x0,H,'#e4d8b4');R(o,x0,0,3,H,'#7a6a4a');R(o,x0+3,0,1,H,'#a8966c');
   const rs=rng(9);for(let i=0;i<120;i++){R(o,x0+4+fl(rs()*84),fl(rs()*H),3+fl(rs()*14),1,'#dcd0aa')}
   // four large characters, right to left, in ink; a seal under them
   const T=['千','里','江','山'];for(let i=0;i<4;i++)ztxt(o,T[i],x0+46,22+i*30,INK,26,null,'c',true);
   seal(o,x0+38,146,'江','山');seal(o,x0+8,10,'宣','和')}
  // a collector's seal near the far end, and the painter's at the bridge
  seal(o,12,140,'希','孟');seal(o,1384,150,'御','覽');
  // mounting strips above and below
  R(o,0,0,WW,TOP,'#9aa6a0');R(o,0,TOP-1,WW,1,'#6e7a78');R(o,0,BOT,WW,H-BOT,'#9aa6a0');R(o,0,BOT,WW,1,'#6e7a78');
  for(let x=0;x<WW;x+=6){P(o,x,2,'#b4bcb4');P(o,x+3,H-3,'#b4bcb4')}
  return c}
function seal(o,x,y,a,b){R(o,x,y,16,16,'#b4322a');R(o,x+1,y+1,14,14,'#c23a2e');
  // carved characters: white strokes cut out of the red
  ztxt(o,a,x+11,y+1,'#f0dcc0',7,null,'c',true);ztxt(o,b,x+4,y+1,'#f0dcc0',7,null,'c',true);
  // chipped border
  P(o,x,y,'#d8c79d');P(o,x+15,y+9,'#d8c79d');P(o,x+6,y+15,'#d8c79d')}
// ---------- moving things, all functions of time ----------
function boat(o,x,y,t,kind,f){const bob=Math.sin(t*0.08+x)>0.3?1:0;y+=bob;
  if(kind==='sail'){// junk with a battened sail
    for(let i=-7;i<=7;i++){P(o,x+i,y,'#5a3a24');if(Math.abs(i)<6)P(o,x+i,y+1,'#3e2a1c')}P(o,x-8,y-1,'#5a3a24');P(o,x+8,y-1,'#5a3a24');
    L(o,x+f,y-1,x+f,y-18,'#3a2a1e');for(let k=0;k<6;k++){const w=7-fl(k*0.3);R(o,x+f*2-(f<0?w:0),y-17+k*2.4,w,2,k%2?'#d8c49a':'#c8b080');R(o,x+f*2-(f<0?w:0),fl(y-15+k*2.4),w,1,'#8a7050')}
    R(o,x-3,y-3,5,2,'#6a4a2e')}
  else{// sampan, a fisherman poling, mat cabin
    for(let i=-5;i<=5;i++)P(o,x+i,y,'#5a3a24');P(o,x-6,y-1,'#5a3a24');P(o,x+6,y-1,'#5a3a24');R(o,x-3,y-3,5,3,'#6a5232');R(o,x-2,y-4,3,1,'#6a5232');
    const ph=(t*0.04+x*0.1)%1,lean=ph<0.5?1:2;const px_=x+f*4;R(o,px_,y-5,1,4,'#4a6a8a');P(o,px_,y-6,'#e8c8a0');R(o,px_-1,y-7,3,1,'#a08a5a');L(o,px_+f*lean,y-6,px_-f*(3-lean),y+3,'#7a5a3a')}}
function walker(o,x,y,t,f,kind){const st=fl(t/6)%2;
  if(kind==='donkey'){R(o,x-3,y-4,7,2,'#6a6a72');P(o,x+3*f,y-5,'#6a6a72');P(o,x+4*f,y-6,'#6a6a72');P(o,x-2,y-2+(st?0:0),'#4a4a52');P(o,x+2,y-2,'#4a4a52');P(o,x-2+(st?1:0),y-1,'#4a4a52');P(o,x+2-(st?1:0),y-1,'#4a4a52');
    R(o,x-1,y-8,2,4,'#3a5a7a');P(o,x,y-9,'#e8c8a0');R(o,x-1,y-10,3,1,'#2a2a2a');return}
  R(o,x,y-6,2,4,kind==='porter'?'#8a6a4a':'#e4dcc4');P(o,x,y-7,'#e8c8a0');P(o,x+1,y-7,'#e8c8a0');P(o,x,y-8,'#2a2a2a');
  P(o,x+(st?0:-1),y-1,INK2);P(o,x+1+(st?0:1),y-1,INK2);P(o,x,y-2,INK2);P(o,x+1,y-2,INK2);
  if(kind==='porter'){L(o,x-4,y-7,x+5,y-7,'#6a4a2a');R(o,x-5,y-6,2,3,'#9a7a4a');R(o,x+5,y-6,2,3,'#9a7a4a')}
  else if(kind==='staff'){L(o,x+2*f+(f<0?-1:1),y-7,x+2*f+(f<0?-1:1),y,'#6a4a2a')}}
// people along paths: [x0,y0,x1,y1, period(frames), phase, kind]
const PATHS=[[1300,135,1380,133,900,0,'staff'],[1360,133,1290,136,700,300,'porter'],[950,124,760,124,1100,0,'staff'],[760,124,950,124,1300,500,'donkey'],[830,124,945,124,800,200,'porter'],
  [1104,97,1104,106,600,100,'staff'],[150,131,250,128,900,50,'porter'],[270,130,110,131,1000,400,'staff']];
const BOATS=[[1240,1400,150,0.08,'boat'],[1180,1420,162,-0.05,'sail'],[960,1150,148,0.06,'boat'],[860,940,140,-0.04,'boat'],[300,560,120,0.07,'sail'],[320,540,150,-0.09,'boat'],[380,560,112,0.04,'sail'],
  [560,760,156,0.06,'boat'],[40,300,158,-0.05,'sail'],[120,280,146,0.07,'boat'],[700,900,166,-0.06,'sail']];
function camX(t){const k=(t%LOOPT)/LOOPT;const e=k<0.03?0:k>0.97?1:(k-0.03)/0.94;return (WW-W)*(1-ease(e)*0.9-e*0.1)}
function draw(s,g){if(!LAY)LAY=build();const t=s.t;let cx=camX(t)+(s.off||0);cx=clamp(cx,0,WW-W);cx=fl(cx);
  g.imageSmoothingEnabled=false;g.drawImage(LAY,cx,0,W,H,0,0,W,H);
  const o=g;g.save();g.translate(-cx,0);
  // wave lines on the near water: scalloped strokes that drift and breathe
  for(let y=WL+2;y<BOT-1;y+=(y<WL+20?3:4)){const per=y<WL+16?5:y<WL+34?6:8,sp=(y%2?1:-1)*0.05,amp=y<WL+16?0:1;
    for(let x=cx-8;x<cx+W+8;x++){if(x<0||x>=TITLE)continue;if(n2(x*0.04,y*0.7,7)<0.42)continue;const ph=((x+t*sp+y*1.7)%per+per)%per;
      // skip land: only stroke where the painted layer is water
      if(!isW(x,y))continue;if(ph<per*0.5){const yy=y+(ph<1||ph>=per*0.5-1?0:amp);P(o,x,yy,y<WL+12?WAVEF:WAVE)}}}
  // the waterfall in the great massif and a thread in group C
  fall(o,1066,84,124,t,2);fall(o,626,92,128,t,2);fall(o,150,88,124,t,1);
  // mist: unpainted silk drifting across the feet of the mountains
  for(const [x0,y,w,sp] of [[1180,104,90,0.05],[1000,96,120,-0.04],[1300,92,70,0.03],[600,98,110,0.05],[700,84,60,-0.03],[120,94,130,0.04],[230,106,80,-0.05],[880,108,120,0.03],[420,98,90,-0.02]]){
    const xx=x0+Math.sin(t*0.002*sp*20+x0)*30+t*sp*0.3%40;mist(o,xx,y,w,x0)}
  // waterwheel by the mill
  wheel(o,66,138,t);
  // boats
  for(const [a,b,y,v,k] of BOATS){const span=b-a,p=((t*v)%span+span)%span,x=v>0?a+p:b-(span-p);if(x<cx-20||x>cx+W+20)continue;boat(o,fl(x),y,t,k,v>0?1:-1)}
  // travellers
  for(const [x0,y0,x1,y1,per,ph,k] of PATHS){const u=((t+ph)%per)/per;const x=x0+(x1-x0)*u,y=y0+(y1-y0)*u;if(x<cx-10||x>cx+W+10)continue;walker(o,fl(x),fl(y),t,x1>x0?1:-1,k)}
  // smoke from the village kitchens
  for(const [x,y] of [[1334,124],[1364,125],[204,121],[78,121]]){if(x<cx-20||x>cx+W+20)continue;puffs(o,x,y,t,{n:4,life:70,rise:0.25,drift:-0.05,cols:['#e8e0c6','#e0d6b8','#d8cca8'],max:2})}
  // geese crossing the open water
  {const gx=900-((t*0.35)%1100),gy=60+Math.sin(t*0.01)*4;if(gx>cx-60&&gx<cx+W+20)for(let i=0;i<9;i++){const k=i===0?0:Math.ceil(i/2),side=i%2?1:-1,x=fl(gx+k*5),y=fl(gy+k*3*side*0.7+k*1.2*(side>0?1:0));const up=fl(t/5+i)%2;P(o,x,y,INK2);P(o,x-1,y-up,INK2);P(o,x+1,y-up,INK2)}}
  g.restore();
  // stepped fade at the turn of the loop
  const k=(t%LOOPT)/LOOPT;if(k>0.985)fadeK(g,W,H,1-(k-0.985)/0.015*1);else if(k<0.008)fadeK(g,W,H,k/0.008)}
let WM=null;function isW(x,y){if(!WM){WM=new Uint8Array(WW*H);const c=LAY.getContext('2d'),d=new Uint32Array(c.getImageData(0,0,WW,H).data.buffer),A=U(WATER),B=U(WATER2);for(let i=0;i<d.length;i++)WM[i]=d[i]===A||d[i]===B?1:0}return WM[y*WW+x]===1}
function fall(o,x,y0,y1,t,w){// a cascade in steps: every ledge shifts the ribbon a pixel sideways and throws a little foam
  let xx=x;for(let y=y0;y<y1;y++){const ledge=hash(x,fl(y/9),3)<0.5&&y%9===0;if(ledge){xx+=hash(x,y,5)<0.5?-1:1;P(o,xx-1,y,FOAM);P(o,xx+w,y,FOAM)}
    for(let i=0;i<w;i++){const ph=((y-t*0.7+i*5+hash(x+i,1)*9)%7+7)%7;P(o,xx+i,y,ph<1?'#8eaeaa':ph<3?'#d6dccc':'#f2ecd8')}}
  for(let i=-3;i<w+3;i++){const k=fl(t/4+i)%3;P(o,xx+i,y1-(k===0?1:0),FOAM)}}
function mist(o,x,y,w,seed){// cloud = blank silk with a scalloped crown and a pale rim
  for(let i=0;i<w;i++){const u=i/w,env=Math.pow(Math.sin(u*PI),0.6),h=fl(env*(5+4*Math.abs(Math.sin(i*0.16+seed))));if(h<1)continue;const xx=fl(x+i);R(o,xx,y-h,1,h+2,SILK);P(o,xx,y-h,'#e6d9b4')}
  for(let i=4;i<w-4;i+=1){if(hash(i,seed,2)<0.6)P(o,fl(x+i),y+2,'#e6d9b4')}}
function wheel(o,x,y,t){const r=7,a0=t*0.03;for(let a=0;a<64;a++){const th=a/64*6.283;P(o,rd(x+Math.cos(th)*r),rd(y+Math.sin(th)*r),'#5a3a22')}
  for(let k=0;k<8;k++){const th=a0+k*PI/4;L(o,x,y,x+Math.cos(th)*r,y+Math.sin(th)*r,'#7a5a3a');R(o,rd(x+Math.cos(th)*(r+1))-1,rd(y+Math.sin(th)*(r+1))-1,2,2,'#6a4a2e')}
  P(o,x,y,'#3a2a1e');for(let i=0;i<4;i++){const k=fl(t/3+i)%4;P(o,x+r+1+i,y+r-2+k,FOAM)}}
SAMPLES.push({id:'jiangshan',name:'千里江山',w:W,h:H,thumb:200,
  tags:['北宋青绿山水','石青石绿赭石三层设色','披麻皴','手卷从右往左展读','留白即云雾','可拖动'],
  about:'仿王希孟《千里江山图》的青绿山水长卷：画面在旧绢底上，从右往左慢慢展开，和看真手卷的顺序一样。山顶敷石青，山腰石绿，山脚赭石，山脊有麻皮皴和苔点；云雾就是没有上色的绢。江上渔船摇橹、帆船往来，长桥上有挑担的、骑驴的、拄杖的行人，山寺、瀑布、水车、炊烟都在动。按住画面左右拖动可以自己展卷。',
  controls:[],init(s){s.off=0},tick(s){},draw,
  onPointer(s,x,y,ev){if(ev==='down'){s.dx=x;s.o0=s.off}else if(ev==='move'&&s.dx!=null){s.off=s.o0-(x-s.dx)*1.5}else if(ev==='up')s.dx=null},
  info(s){return '卷首 → 卷尾 '+fl((1-camX(s.t)/(WW-W))*100)+'%'}});
})();

// ================= 2. 敦煌飞天 =================


// ================= 3. 皮影戏《武松打虎》 =================


// ================= 4. 大桥骤雨（歌川广重风） =================


// ================= 5. 虎鹊图（朝鲜民画 까치호랑이） =================


// ================= 6. 神奈川冲浪里（葛饰北斋） =================


// ================= 7. 清明上河图·虹桥 =================


// ================= soundscapes, one per piece; events are tied to the same frame clock as the pictures =================
(function(){
const R_=Math.random,pick=a=>a[fl(R_()*a.length)];
const walk={};// a melody that wanders a step or two at a time
function step(k,lo,hi){let v=walk[k]==null?fl((lo+hi)/2):walk[k];v+=pick([-2,-1,-1,1,1,2,0]);v=clamp(v,lo,hi);walk[k]=v;return v}
const SFX={
  // river, wind in the reeds, a guqin plucked now and then, birds
  jiangshan:{amb(c,o){const w=sNoise(c,o,'lowpass',420,0.6,0.07),wi=sNoise(c,o,'bandpass',900,0.4,0.018);return [w,wi,sLfo(c,w.g.gain,0.13,0.03),sLfo(c,wi.g.gain,0.07,0.012)]},
    ev(t,c,o){if(t%30===0&&R_()<0.7){const d=step('qin',-3,9);sPluck(c,o,note(146.8,d),{dec:2.8,vol:0.16,bend:R_()<0.4,bright:1800});if(R_()<0.25)sPluck(c,o,note(146.8,d+5),{dec:2.4,vol:0.07,at:0.18})}
      if(R_()<0.006){for(let i=0;i<2+fl(R_()*3);i++)sTone(c,o,2600+R_()*900,0.07,{at:i*0.11,slide:1.25,vol:0.025})}}},
  // a low drone in the cave, pipa phrases with tremolo, wind chimes
  feitian:{amb(c,o){const d1=c.createOscillator(),d2=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();d1.frequency.value=110;d2.frequency.value=164.8;d1.type=d2.type='triangle';lp.type='lowpass';lp.frequency.value=380;g.gain.value=0.05;d1.connect(lp);d2.connect(lp);lp.connect(g);g.connect(o);d1.start();d2.start();
      const air=sNoise(c,o,'highpass',2800,0.5,0.008);return [{stop(){d1.stop();d2.stop()}},air,sLfo(c,g.gain,0.09,0.02)]},
    ev(t,c,o){if(t%10===0&&R_()<0.5){const d=step('pipa',0,11),f=note(220,d);if(R_()<0.18){for(let i=0;i<8;i++)sPluck(c,o,f,{at:i*0.055,dec:0.35,vol:0.09,bright:5000})}else sPluck(c,o,f,{dec:1.1,vol:0.14,bright:5200,bend:R_()<0.3})}
      if(R_()<0.01)sStrike(c,o,1800+R_()*1200,{vol:0.03,dec:2.2,parts:[[1,1,1],[2.4,0.4,0.7],[3.9,0.2,0.4]]})}},
  // shadow play: clapper and fiddle while he walks, a roar, a whoosh, the gong when the staff lands, knocks for the punches, a drum-and-gong flourish at the end
  piying:{amb(c,o){const n=sNoise(c,o,'lowpass',600,0.5,0.012);return [n]},
    ev(t0,c,o){const t=t0%720;const block=(f,v)=>sStrike(c,o,f||1500,{vol:v||0.16,dec:0.08,parts:[[1,1,1],[2.2,0.3,0.5]]});
      const gong=(f,v,dec)=>{sStrike(c,o,f,{vol:v,dec:dec,drop:true,parts:[[1,1,1],[1.48,0.6,0.8],[2.12,0.5,0.6],[2.93,0.3,0.45],[4.1,0.2,0.3]]});sBurst(c,o,{type:'highpass',f:2500,dur:dec*0.4,vol:v*0.4})};
      const FID=[0,2,3,2,0,-1,0,2,4,3,2,0];
      if(t<110||(t>=500&&t<540)){if(t%12===0)block(t%24===0?1400:1700);if(t%24===0){const d=FID[(t/24)%FID.length];sTone(c,o,note(392,d),0.9,{type:'sawtooth',bp:1300,q:1.5,vol:0.07,vib:0.014,slide:0.97})}}
      if(t===134){sBurst(c,o,{type:'lowpass',f:500,f2:120,dur:1.3,vol:0.5,att:0.08});sTone(c,o,85,1.2,{type:'sawtooth',bp:400,q:2,vol:0.14,vib:0.04,vibR:22})}
      if(t===176)sBurst(c,o,{f:500,f2:2400,q:2,dur:0.5,vol:0.25,att:0.15});
      if(t===208){sStrike(c,o,70,{vol:0.35,dec:0.4,parts:[[1,1,1]]});block(900,0.2)}
      if(t===258){gong(170,0.4,3.2);block(1300,0.3)}
      if(t>=344&&t<452&&(t-344)%9===0){sBurst(c,o,{type:'lowpass',f:500,dur:0.12,vol:0.4});block((t-344)%18?1700:1200,0.22)}
      if(t===470)gong(110,0.3,2.5);
      if(t>=540&&t<600){if(t%4===0)sStrike(c,o,120,{vol:0.2,dec:0.15,parts:[[1,1,1],[1.6,0.4,0.6]]});if((t-540)%12===0)sBurst(c,o,{type:'highpass',f:4000,dur:0.6,vol:0.2})}
      if(t===600)gong(150,0.4,3)}},
  // the shower: hiss on the river, heavier gusts, drops on the planks, thunder far off
  yudachi:{amb(c,o){const r1=sNoise(c,o,'highpass',1400,0.5,0.16),r2=sNoise(c,o,'bandpass',4200,0.8,0.06),r3=sNoise(c,o,'lowpass',260,0.6,0.06);return [r1,r2,r3,sLfo(c,r1.g.gain,0.06,0.06),sLfo(c,r3.g.gain,0.04,0.03)]},
    ev(t,c,o){if(R_()<0.35)sBurst(c,o,{f:2000+R_()*3000,q:3,dur:0.04,vol:0.02+R_()*0.03});
      if(t%11===0&&R_()<0.5)sStrike(c,o,260+R_()*80,{vol:0.04,dec:0.06,parts:[[1,1,1]]});
      if(t%640===320){sBurst(c,o,{type:'lowpass',f:220,f2:60,dur:5,vol:0.6,att:0.4});sBurst(c,o,{type:'lowpass',f:900,f2:120,dur:1.2,vol:0.2,att:0.02,at:0.15})}}},
  // wind in the pine, a gayageum now and then, the magpie scolding, one big yawn
  hojak:{amb(c,o){const w=sNoise(c,o,'bandpass',650,0.6,0.05);return [w,sLfo(c,w.g.gain,0.1,0.03),sLfo(c,w.f.frequency,0.05,200)]},
    ev(t0,c,o){const t=t0%480;const chat=(t>40&&t<110)||(t>300&&t<370)||(t>160&&t<190);
      if(chat&&t%3===0&&fl(t/3)%2===0){sTone(c,o,2300+R_()*600,0.06,{type:'square',bp:3000,q:3,vol:0.05,slide:1.35});sBurst(c,o,{f:3500,q:2,dur:0.05,vol:0.03})}
      if(t===380)sTone(c,o,140,2.4,{type:'sawtooth',bp:520,q:1.2,vol:0.12,vib:0.03,vibR:3,slide:1.6,att:0.4});
      if(t===120||t===260)sBurst(c,o,{f:1200,f2:3000,q:1,dur:0.25,vol:0.06});
      if(t%40===0&&R_()<0.6){const d=step('gaya',-2,8);sPluck(c,o,note(196,d),{dec:2.2,vol:0.18,bend:true,bright:2200})}}},
  // the sea: a roar that swells, hiss of spray, now and then a crash; a shakuhachi on the old Japanese scale
  nami:{amb(c,o){const r=sNoise(c,o,'lowpass',650,0.5,0.24),h=sNoise(c,o,'highpass',3000,0.5,0.035);return [r,h,sLfo(c,r.g.gain,0.11,0.1),sLfo(c,r.f.frequency,0.07,250),sLfo(c,h.g.gain,0.11,0.02)]},
    ev(t,c,o){if(t%96===40)sBurst(c,o,{type:'lowpass',f:1400,f2:180,dur:2.4,vol:0.3,att:0.2});
      if(t%64===0&&R_()<0.55){const d=step('shaku',0,8);sTone(c,o,noteM(293.7,d),1.8,{vol:0.07,breath:0.7,vib:0.012,vibR:4.5,slide:0.96,att:0.25})}}},
  // the crowd: babble on several bands, water, the boat crew's heave-ho and shouts from the rail as it comes in
  hongqiao:{amb(c,o){const S_=[];for(const [f,r] of [[480,4.1],[820,5.3],[1300,6.7],[2100,3.7]]){const n=sNoise(c,o,'bandpass',f,5,0.075);S_.push(n,sLfo(c,n.f.frequency,r,f*0.35),sLfo(c,n.g.gain,r*0.6,0.035))}S_.push(sNoise(c,o,'lowpass',380,0.6,0.08));return S_},
    ev(t0,c,o){const t=t0%1440,bX=300-t*0.33;
      if(bX<280&&bX>40&&R_()<0.08)sTone(c,o,500+R_()*350,0.25+R_()*0.25,{type:'sawtooth',bp:900+R_()*500,q:4,vol:0.05,slide:1.25,vib:0.03});
      if(bX<235&&bX>150&&t%30===0){sTone(c,o,330,0.35,{type:'sawtooth',bp:750,q:3,vol:0.07});sTone(c,o,294,0.45,{type:'sawtooth',bp:700,q:3,vol:0.07,at:0.4})}
      if(R_()<0.03)sBurst(c,o,{f:280,q:8,dur:0.15,vol:0.03});
      if(t%60===0&&R_()<0.5){const d=step('di',3,12);sTone(c,o,note(587,d),0.7,{vol:0.03,breath:0.5,vib:0.015})}}}};
SND.fx=SFX;
// wire every piece to the shared switch: a '声音' toggle, ambience while the piece is on screen, events on its ticks
function sndStop(){if(SND.bus){const b=SND.bus,st=SND.stops;try{b.gain.setTargetAtTime(0,SND.ctx.currentTime,0.08)}catch(e){}setTimeout(()=>{for(const x of st)try{x.stop()}catch(e){}try{b.disconnect()}catch(e){}},500)}SND.bus=null;SND.stops=[];SND.live=null}
function sndStart(d){const c=sndCtx();if(!c)return;sndStop();const b=c.createGain();b.gain.value=0;b.connect(SND.out);b.gain.setTargetAtTime(1,c.currentTime,0.3);SND.bus=b;SND.live=d;SND.stops=SFX[d.id].amb(c,b)||[]}
for(const d of SAMPLES){const fx=SFX[d.id];if(!fx)continue;d.controls=(d.controls||[]).concat([{type:'toggle',key:'snd',label:'声音',def:false}]);
  const i0=d.init,t0=d.tick,l0=d.onLeave,o0=d.onOpt;
  d.init=function(s){i0.call(d,s);s.opt.snd=SND.on;if(SND.on&&SND.ctx)sndStart(d)};
  d.tick=function(s){t0.call(d,s);if(SND.on&&SND.live===d&&SND.ctx&&SND.ctx.state==='running')fx.ev(s.t,SND.ctx,SND.bus,s)};
  d.onLeave=function(s){if(l0)l0.call(d,s);if(SND.live===d)sndStop()};
  d.onOpt=function(s,k){if(o0)o0.call(d,s,k);if(k==='snd'){SND.on=!!s.opt.snd;if(SND.on)sndStart(d);else sndStop()}}}
{const sp0=setPaused;setPaused=function(p){sp0(p);if(SND.ctx){if(p)SND.ctx.suspend();else if(SND.on)SND.ctx.resume()}}}
document.addEventListener('visibilitychange',()=>{if(!SND.ctx)return;if(document.hidden)SND.ctx.suspend();else if(SND.on&&!paused)SND.ctx.resume()});
})();

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
for(const[v,l]of [[0.25,'¼'],[0.5,'½'],[1,'1×'],[2,'2×']]){const b=document.createElement('button');b.type='button';b.textContent=l;b.dataset.v=v;b.onclick=()=>{speed=v;for(const x of $('spd').children)x.classList.toggle('on',+x.dataset.v===speed)};$('spd').appendChild(b)}
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
  const st=newState(d);for(let k=0;k<(d.thumb||40);k++){d.tick(st);st.t++}const tg=c.getContext('2d');tg.imageSmoothingEnabled=false;d.draw(st,tg);
  const tl=document.createElement('span');tl.className='tl';tl.innerHTML=`<span class="k">${i+1}</span>${d.name}`;b.append(c,tl);b.onclick=()=>select(i);$('tabs').appendChild(b)});
new ResizeObserver(()=>{if(S){fit();render()}}).observe(stage);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage);
const start=Math.max(0,SAMPLES.findIndex(d=>'#'+d.id===location.hash));select(start);setPaused(paused);
function loop(now){const dt=Math.min(0.25,(now-last)/1000);last=now;
  if(!paused&&visible){acc+=dt*24*speed;let n=0;while(acc>=1&&n<8){tick();acc-=1;n++}if(n)render()}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);

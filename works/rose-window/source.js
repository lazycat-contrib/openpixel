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
function disc(g,cx,cy,r,c){cx=rd(cx);cy=rd(cy);r=rd(r);g.fillStyle=c;if(r<=0){g.fillRect(cx,cy,1,1);return}
  for(let y=-r;y<=r;y++){const w=fl(Math.sqrt(r*r-y*y)+0.35);g.fillRect(cx-w,cy+y,w*2+1,1)}}

function poly(g,pts,c){let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}g.fillStyle=c;
  for(let y=fl(y0);y<=Math.ceil(y1);y++){const yc=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=rd(xs[k]),xb=rd(xs[k+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1)}}}
function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}

const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];

// recolor every pixel inside a mask through a cached palette map (used for light beams: a lit pixel becomes a lighter solid colour, never a blend)
function litMap(cache,u,tint,amt){let v=cache.get(u);if(v===undefined){const r=u&255,gg=(u>>8)&255,b=(u>>16)&255,T=hx(tint);
  const q=x=>Math.round(x/8)*8;v=((255<<24)|(clamp(q(b+(T[2]-b)*amt),0,255)<<16)|(clamp(q(gg+(T[1]-gg)*amt),0,255)<<8)|clamp(q(r+(T[0]-r)*amt),0,255))>>>0;cache.set(u,v)}return v}


// ================= masterwork helpers =================
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}

// light a polygon on a canvas: every opaque pixel inside steps toward the tint through a cached map (stays a solid colour)
function lightPoly(ctx,pts,tint,amt,w,h){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
  x0=clamp(fl(x0),0,w-1);y0=clamp(fl(y0),0,h-1);x1=clamp(Math.ceil(x1),0,w);y1=clamp(Math.ceil(y1),0,h);if(x1<=x0||y1<=y0)return;
  const im=ctx.getImageData(x0,y0,x1-x0,y1-y0),u=new Uint32Array(im.data.buffer),cache=new Map();
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){let inside=false;const yc=y+0.5,xc=x+0.5;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc)&&xc<a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))inside=!inside}
    if(!inside)continue;const k=(y-y0)*(x1-x0)+(x-x0);if((u[k]>>>24)!==255)continue;u[k]=litMap(cache,u[k],tint,amt)}
  ctx.putImageData(im,x0,y0)}


// ================= europe helpers =================
// draw a sprite from strings; '.' is transparent
function spr(g,x,y,rows,pal,flip){x=rd(x);y=rd(y);for(let r=0;r<rows.length;r++){const row=rows[r],n=row.length;for(let c=0;c<n;c++){const ch=row[c];if(ch==='.'||ch===' ')continue;g.fillStyle=pal[ch];g.fillRect(x+(flip?n-1-c:c),y+r,1,1)}}}
// paint a figure from shapes on a scratch canvas, then ring it with a 1px ink line (outside the shape, 4-neighbour)
const _SC={};
function figure(w,h,fn,ink,key){const k=key||(w+'x'+h);let s=_SC[k];if(!s){s=mkc(w,h);_SC[k]=s}const [c,x]=s;x.clearRect(0,0,w,h);fn(x);
  if(ink){const im=x.getImageData(0,0,w,h),u=new Uint32Array(im.data.buffer),o=new Uint32Array(u),I=U(ink);
    for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=y*w+xx;if(u[i]>>>24)continue;if((xx>0&&u[i-1]>>>24)||(xx<w-1&&u[i+1]>>>24)||(y>0&&u[i-w]>>>24)||(y<h-1&&u[i+w]>>>24))o[i]=I}
    u.set(o);x.putImageData(im,0,0)}return c}

const uRGB=v=>[v&255,(v>>8)&255,(v>>16)&255];const rgbU=(r,g_,b)=>((255<<24)|(clamp(rd(b),0,255)<<16)|(clamp(rd(g_),0,255)<<8)|clamp(rd(r),0,255))>>>0;


// ================= 1. 泥金手抄本 =================


// ================= 2. 哥特玫瑰窗 =================
(function(){
const W=320,H=180,LOOPT=1440;
const RC=[160,54],RR=44,BASE=136;
// glass palettes: [dim, mid, bright] for each hue
const GL={b:['#141e5a','#1e3aa0','#3a62d8'],B:['#1a2a78','#2a52c8','#5a88f0'],r:['#5a0c18','#a01828','#e0384a'],y:['#6a4a10','#c8961e','#f4d050'],g:['#0e3a22','#1e7a42','#4ab868'],p:['#2e1240','#62287e','#9a50b8'],w:['#4a4e66','#a8b0c8','#e8ecf8']};
const LEAD='#0c0a18',STONE=['#141022','#1e1830','#2a2240','#3a3052','#4a4064'];
let LAY=null;
// what is at window coordinate (x,y): null for stone, or [hue, pane id]
function glassAt(x,y){const dx=x-RC[0],dy=y-RC[1],r=Math.hypot(dx,dy);let a=Math.atan2(dy,dx);if(a<0)a+=2*PI;
  if(r<RR+0.5){
    if(r<7){if(r<2.2)return['w',3];if(r>4.6&&r<5.4)return['L',0];if(r>2.2&&r<4.6&&(fl(a/(PI/4)+0.5)%2))return['r',4];return['y',1]}if(r<9)return r<8.2?['r',2]:null;
    if(r<10.5)return null;
    if(r<30){const sec=a/(PI/6),k=fl(sec),f=sec-k-0.5;const hw=0.38*(1-Math.max(0,(r-23)/7.5)**2)*(r<13?(r-10.5)/2.5:1);if(Math.abs(f)>hw)return null;
      // each petal: a ruby rim, a blue ground, and one medallion with a figure of gold and green
      const px_=f*r*PI/6*2,py_=r;const md=Math.hypot(px_*1.0,(r-20));
      if(Math.abs(f)>hw-0.07||r>29.2)return['r',k*10+1];
      if(md<4.2){if(md>3.3)return['L',0];return md<1.6?['w',k*10+5]:[(k%2?'y':'g'),k*10+4]}
      if(r>12.5&&r<14)return['L',0];
      const pane=fl(r/5)+fl((px_+20)/4)*3;return[k%2?'B':'b',k*10+6+(pane%3)]}
    if(r<32.5)return null;
    if(r<RR-1){const k=fl(a/(PI/12)+0.5)%24,ca=k*PI/12,cx=Math.cos(ca)*38.4,cy=Math.sin(ca)*38.4,d=Math.hypot(dx-cx,dy-cy);
      if(d<4.6){if(d<1.4)return['w',600+k];return[k%3===0?'r':k%3===1?'B':'g',500+k]}
      // spandrels between roundels: deep blue glass
      if(d>5.8&&r>34&&r<RR-2)return['b',700+k];return null}
    return null}
  // the five lancets below
  for(let i=0;i<5;i++){const lx=120+i*18,lw=12;if(x>=lx&&x<lx+lw&&y<BASE-4){const top=104+(i===2?-4:0);const cx=lx+lw/2;const ay=top+Math.abs(x+0.5-cx)*0.9;if(y>=ay&&y<BASE-6){
      // a standing saint in each lancet: halo, face, robe; the rest blue with red border
      const rx=x-lx,ry=y-top;if(rx===0||rx===lw-1)return['r',800+i];const cxr=Math.abs(rx+0.5-lw/2);
      if(ry>=6&&ry<10&&cxr<3)return cxr<1.6&&ry>=7&&ry<9?['w',820+i]:['y',830+i];
      if(ry>=10&&ry<28&&cxr<2.5+(ry-10)*0.08)return[['r','g','p','y','B'][i],840+i+fl(ry/6)*7];
      return[(ry>>2)%2&&rx%4===1?'B':'b',860+i+(ry>>2)*5]}}}
  return null}
function patchHue(u,v){const rn=Math.hypot(u,v)*RR;let a=Math.atan2(-v,u);if(a<0)a+=2*PI;
  if(v<-1.08){const i=fl((u+0.98)/0.41);if(i<0||i>4||((u+0.98)/0.41-i)>0.68||v<-1.75)return null;return ['r','g','p','y','B'][i]}
  if(rn<7.5)return 'y';if(rn<10.5)return null;
  if(rn<29){const sec=a/(PI/6),k=fl(sec),f=sec-k-0.5;if(Math.abs(f)>0.33)return null;const md=Math.hypot(f*20*PI/6*2,rn-20);if(md<3.5)return k%2?'y':'g';return k%2?'B':'b'}
  if(rn>33&&rn<43){const k=fl(a/(PI/12)+0.5)%24,ca=k*PI/12;if(Math.hypot(Math.cos(a)*rn-Math.cos(ca)*38.4,Math.sin(a)*rn-Math.sin(ca)*38.4)<4.4)return k%3===0?'r':k%3===1?'B':'g'}return null}
function glassLo(x,y){const G=glassAt(x,y);if(!G)return null;if(G[0]==='L'){const r=Math.hypot(x-RC[0],y-RC[1]);return r<30&&r>10.5?'B':null}return G[0]}
function build(){
  const [bg,bx]=mkc(W,H),[win,wx]=mkc(W,H);
  // ---- the transept wall: ashlar courses, darker toward the edges, a little bounce light around the window
  for(let y=0;y<BASE;y++)for(let x=0;x<W;x++){const cy=fl(y/7),off=(cy%2)*9,bxk=fl((x+off)/18);const d=Math.hypot(x-RC[0],(y-RC[1])*0.9);const hv=hash(bxk,cy,5);let s=hv<0.7?1:hv<0.94?2:0;if(d<RR+18&&hv<0.6)s=2;if(d<RR+7)s=3;if(x<40||x>280)s=Math.min(s,1);
    const mort=(y%7===0)||((x+off)%18===0);P(bx,x,y,mort?STONE[0]:STONE[s]);if(!mort&&y%7===1&&s>1)P(bx,x,y,STONE[s+1])}
  // pointed relieving arch over the window: two arcs struck from just off the centre line, three mouldings
  for(let k=0;k<3;k++){const r=60+k*4,d=6,sy=RC[1]+12;for(let y=0;y<=sy;y++){const h=sy-y;if(h>Math.sqrt(r*r-d*d))continue;const xo=Math.sqrt(r*r-h*h)-d;for(const sgn of [-1,1]){const x=rd(RC[0]+sgn*xo);P(bx,x,y,STONE[4-k]);P(bx,x+sgn,y,STONE[0]);if(k===0)P(bx,x-sgn,y,STONE[3])}}}
  // the window's stone: deep shadow everywhere glass is not, with a lit inner edge
  for(let y=RC[1]-RR-3;y<BASE-2;y++)for(let x=RC[0]-RR-3;x<=RC[0]+RR+3;x++){const r=Math.hypot(x-RC[0],y-RC[1]);const inL=y>=98&&x>=118&&x<206&&y<BASE-4;if(r>RR+2.5&&!inL)continue;
    const G=glassAt(x,y);if(!G||G[0]==='L'){if(r<=RR+2.5||inL&&!(r>RR+2.5&&y<100))P(bx,x,y,r>RR+0.5&&r<=RR+2.5?STONE[4]:LEAD)}}
  // lancet sill
  R(bx,114,BASE-6,92,2,STONE[4]);R(bx,114,BASE-4,92,4,STONE[2]);
  // floor: stone flags in perspective, darker in the distance
  for(let y=BASE;y<H;y++){const z=(y-BASE+6)/50;for(let x=0;x<W;x++){const X=(x-160)/(y-BASE+6),row=fl(Math.log(y-BASE+6)*7);const tile=(fl(X*3)+row)&1;
      const line=Math.abs(X*3-rd(X*3))<0.04*(1+1/z)||((y-BASE+6)%fl(2+z*6)===0);let c=tile?'#2a2438':'#262033';if(y-BASE<6)c='#1e1a2c';P(bx,x,y,line?'#221c30':c)}}
  R(bx,0,BASE,W,1,STONE[4]);
  // ---- foreground clustered piers left and right, each a bundle of shafts; capitals near the top
  for(const [x0,dir] of [[0,1],[290,-1]]){const SH=[0,1,2,3,2,1,0];for(let x=0;x<30;x++){const k=x<4?0:x<9?1:x<13?3:x<17?2:x<22?4:x<26?2:1;const c=dir>0?STONE[[0,1,2,3,2,1][k]||1]:STONE[[1,2,3,2,1,0][k]||1];R(bx,x0+x,0,1,H,c);if(x===8||x===16||x===23)R(bx,x0+x,0,1,H,STONE[0])}
    R(bx,x0,18,30,4,STONE[3]);R(bx,x0,18,30,1,STONE[4]);R(bx,x0,22,30,2,STONE[0]);R(bx,x0-2,H-12,34,12,STONE[2]);R(bx,x0-2,H-12,34,1,STONE[3])}
  // wooden chairs in rows, seen from behind, in front of the wall
  for(let row=0;row<3;row++){const y=146+row*11,s=1+row*0.3;for(let i=0;i<12;i++){const cx=rd(150+i*15*s*0.8-(row*6)),cw=rd(9*s);if(cx<176||cx+cw>232)continue;
      R(bx,cx,y,cw,rd(2*s),'#3a2418');R(bx,cx,y,cw,1,'#5a3a24');R(bx,cx,y-rd(7*s),rd(2*s),rd(14*s),'#2a1810');R(bx,cx+cw-rd(2*s),y-rd(7*s),rd(2*s),rd(14*s),'#2a1810');R(bx,cx,y-rd(7*s),cw,rd(2*s),'#3a2418');R(bx,cx+1,y-rd(4*s),cw-2,1,'#2e1c12')}}
  // votive candle stand on the right
  R(bx,236,150,40,2,'#3a2a20');R(bx,236,150,40,1,'#6a5030');R(bx,238,152,2,22,'#2a1e18');R(bx,272,152,2,22,'#2a1e18');R(bx,234,140,44,1,'#6a5030');R(bx,234,141,44,1,'#3a2a20');
  // ---- the glass at three light levels (overcast, sun, sun with sparkle handled at draw)
  const lv=[];for(let L_=0;L_<3;L_++){const [c,x]=mkc(W,H);for(let y=0;y<BASE;y++)for(let xx=RC[0]-RR-1;xx<=RC[0]+RR+1;xx++){const G=glassAt(xx,y);if(!G||G[0]==='L')continue;const pal=GL[G[0]];const id=G[1];
      // each pane has its own small offset so the glass is never flat
      const j=hash(id,7,1);let s=L_===0?0:L_===1?1:2;if(L_===2&&j<0.35)s=1;if(L_===1&&j<0.2)s=0;
      // the sun comes from the upper right: those panes are a step brighter
      if(L_>0&&xx-RC[0]-(y-RC[1])*-1>18&&s<2)s++;
      P(x,xx,y,pal[s])}lv.push(c)}
  // floor patch lookup: the glass as seen from the floor, flipped (the top of the window lands nearest us)
  LAY={bg,lv};}
function draw(S,g){if(!LAY)build();const t=S.t%LOOPT,T=S.t;
  // sun strength: two clouds pass in each loop, the light dropping and returning in steps
  const cl=k=>{const a=(t-k)/24;return a<0||a>14?2:a<1?1:a<13?0:1};const sun=Math.min(cl(380),cl(1000));
  const drift=Math.sin(t/LOOPT*2*PI)*8;
  g.drawImage(LAY.bg,0,0);
  // beams: one broad hull and four brighter rays, from the window down to the floor patch
  const pcx=104+drift,pcy=162,prx=62,pry=15,sh=0.9;
  if(sun>0){const amt=sun===2?0.14:0.07;
    const hull=[[RC[0]+RR*0.7,RC[1]-RR*0.7],[RC[0]-RR*0.75,RC[1]-RR*0.65],[pcx-prx,pcy+2],[pcx-prx*0.3,pcy+pry],[pcx+prx,pcy+pry*0.6],[RC[0]+RR,RC[1]+8]];
    lightPoly(g,hull,'#c8b8f0',amt,W,H);
    for(const [a,w,f] of [[-0.6,6,0.12],[0.1,5,0.1],[0.7,7,0.14],[1.4,4,0.1]]){const wx=RC[0]+Math.cos(a+PI*1.1)*RR*0.6,wy=RC[1]+Math.sin(a+PI*1.1)*RR*0.6,fx=pcx+Math.cos(a+PI*1.1)*prx*0.7-10,fy=pcy-Math.sin(a+PI*1.1)*pry*0.5;
      lightPoly(g,[[wx-w,wy],[wx+w,wy],[fx+w*2.5,fy],[fx-w*2.5,fy]],'#f0e0ff',f*(sun===2?1:0.5),W,H)}}
  // the window itself
  g.drawImage(LAY.lv[sun===2?2:sun===1?1:0],0,0);
  // sparkle: a few panes flare white-hot for a moment when the sun is out
  if(sun===2)for(let k=0;k<5;k++){const ph=(T+k*53)%110;if(ph<6){const a=hash(fl((T+k*53)/110),k,2)*2*PI,r=12+hash(fl((T+k*53)/110),k,3)*30;const x=rd(RC[0]+Math.cos(a)*r),y=rd(RC[1]+Math.sin(a)*r);const im=g.getImageData(x,y,1,1).data;if(im[0]+im[1]+im[2]>150){P(g,x,y,'#ffffff');if(ph>1&&ph<4){P(g,x-1,y,'#e8ecf8');P(g,x+1,y,'#e8ecf8');P(g,x,y-1,'#e8ecf8');P(g,x,y+1,'#e8ecf8')}}}}
  // the rose projected on the floor: every floor pixel inside the patch looks up the glass it would see, and takes a solid colour halfway to it
  if(sun>0){const im=g.getImageData(0,BASE,W,H-BASE),u=new Uint32Array(im.data.buffer),cache=new Map();const amt=sun===2?0.42:0.2;
    for(let y=BASE+1;y<H;y++)for(let x=0;x<W;x++){const dy=y-pcy;const G=patchHue((x-pcx+dy*0.9)/prx,dy/pry);if(!G)continue;const col=GL[G][2];const k=(y-BASE)*W+x;const key=u[k]*31+col.charCodeAt(2)*7+col.charCodeAt(4)+col.charCodeAt(6)*13;let v=cache.get(key);
      if(v===undefined){const [r,gg,b]=uRGB(u[k]),C=hx(col);const q=c=>Math.round(c/6)*6;v=rgbU(q(r+(C[0]-r)*amt),q(gg+(C[1]-gg)*amt),q(b+(C[2]-b)*amt));cache.set(key,v)}u[k]=v}
    g.putImageData(im,0,BASE)}
  // dust motes drifting in the light
  if(sun>0)for(let i=0;i<46;i++){const a=hash(i,1,9),b=hash(i,2,9);let y=(b*120+T*(0.06+a*0.05))%120+30;const k=(y-30)/130;const x=rd(RC[0]-20+(pcx-RC[0])*k+(a-0.5)*90*(0.4+k)+Math.sin(T*0.02+i)*3);
    if(((T>>3)+i)%5===0)continue;P(g,x,rd(y),sun===2?(i%3?'#d8d0f0':'#fff4d8'):'#7a7090')}
  // candles: flames flicker on three frames; the warm glow is a lit ring on the stand
  for(let i=0;i<9;i++){const cx=238+i*4+(i%2),cy=146-(i%2)*2,h=3+(i*7)%3;R(g,cx,cy-h,2,h,'#e8e0c8');P(g,cx+1,cy-h,'#b8b098');const f=(fl(T/3)+i*5)%4;
    if(i!==4||t>560){P(g,cx,cy-h-1,'#ffb040');P(g,cx,cy-h-2,f===0?'#fff0a0':'#ffd060');if(f!==3)P(g,cx,cy-h-3,'#fff4c0');if(f===1)P(g,cx+1,cy-h-2,'#ff9a30')}}
  {const pts=[];for(let i=0;i<16;i++){const a=i/16*2*PI;pts.push([256+Math.cos(a)*26,140+Math.sin(a)*12])}lightPoly(g,pts,'#ffb040',0.1+((S.t>>2)%3===0?0.02:0),W,H);const p2=[];for(let i=0;i<12;i++){const a=i/12*2*PI;p2.push([256+Math.cos(a)*16,141+Math.sin(a)*6])}lightPoly(g,p2,'#ffc060',0.1,W,H)}
  // a pilgrim crosses, lights the fifth candle, kneels a while, rises and leaves
  pilgrim(g,t);
  // pigeons on the capital of the left pier
  const pg=fl(T/14)%10;spr(g,10,12,pg<8?['.kk..','kgggk','.kggg','..kk.']:['.kk..','kgggk','kgggg','..kk.'],{k:'#2a2436',g:'#6a6880'})}
function pilgrim(g,t){let x,pose='walk';const A=420,B=540,C=880,D=1000;
  if(t<A)x=330-(t-200)*0.33;else if(t<B){x=256;pose=t<A+60?'reach':'stand'}else if(t<C){x=256;pose='kneel'}else if(t<D){x=256;pose='stand'}else x=256+(t-D)*0.3;
  if(t<200||x>330)return;x=rd(x);const y=160,step=fl(t/8)%2;
  const c=figure(14,26,k=>{const ox=7;
    if(pose==='kneel'){poly(k,[[ox-3,6],[ox+3,6],[ox+5,18],[ox+5,25],[ox-4,25],[ox-4,18]],'#4a3a5a');disc(k,ox-1,4,3,'#4a3a5a');R(k,ox-4,22,9,3,'#3a2c48');P(k,ox-3,5,'#c8a080');L(k,ox-4,10,ox-5,14,'#c8a080')}
    else{poly(k,[[ox-3,3],[ox+2,3],[ox+4,22],[ox-4,22]],'#4a3a5a');disc(k,ox-1,2,3,'#4a3a5a');P(k,ox-3,3,'#c8a080');P(k,ox-3,4,'#b89070');
      if(pose==='walk'){R(k,ox-3+step*2,22,2,3,'#2a2030');R(k,ox+1-step*2,22,2,3,'#2a2030')}else{R(k,ox-3,22,2,3,'#2a2030');R(k,ox+1,22,2,3,'#2a2030')}
      if(pose==='reach'){L(k,ox-2,8,ox-6,7,'#4a3a5a',2);P(k,ox-7,6,'#c8a080')}
      for(let yy=6;yy<22;yy+=4)P(k,ox+2,yy,'#3a2c48')}
    L(k,ox+3,4,ox+4,21,'#5e4c70')},'#140e1c','pil');
  g.drawImage(c,x-7,y-14);
  // candlelight on the face
  if(pose!=='walk')P(g,x-4,y-10+(pose==='kneel'?0:0),'#f0c890')}
SAMPLES.push({id:'cathedral',name:'哥特玫瑰窗',w:W,h:H,thumb:300,
  tags:['十二瓣玫瑰窗','彩色玻璃投影到地面','分级体积光','灰尘在光里浮动','云过时光线逐级减弱','烛台与朝圣者'],
  about:'站在一座哥特大教堂的十字交叉处，看横厅墙上的玫瑰窗：中心是金色圆窗，外面一圈十二片花瓣，再外面是二十四个小圆窗，石头窗棂把玻璃分成一格一格，以沙特尔大教堂那种深蓝为主，夹着宝石红、金和绿。窗下五扇尖顶窗里各站着一位圣徒。太阳从窗后右上方照进来，在昏暗的空气里打出几道光柱，地上那块彩色光斑真的是玫瑰窗的倒影：每个地面像素都去找它头顶对应的那块玻璃，取一半颜色，所以花瓣和圆窗会上下颠倒地印在石板和椅背上，并随着太阳慢慢移动。云飘过去时光线一级一级暗下去又亮回来，玻璃的亮度也跟着变。一位朝圣者走进来点了一支蜡烛，跪下祈祷，再起身离开。60 秒一圈。',
  controls:[],init(s){},tick(s){},draw,
  info(s){return '第 '+fl((s.t%LOOPT)/24)+' 秒 / 60'}});
})();

// ================= 3. 窗边读信的女子 =================


// ================= 4. 峡湾极光 =================


// ================= 5. 黑森林童话 =================


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

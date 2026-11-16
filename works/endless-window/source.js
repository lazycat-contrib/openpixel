// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;

function P(g,x,y,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),1,1)}
function L(g,x0,y0,x1,y1,c,th){th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<2000;i++){g.fillRect(x0-o,y0-o,th,th);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function disc(g,cx,cy,r,c){cx=rd(cx);cy=rd(cy);r=rd(r);g.fillStyle=c;if(r<=0){g.fillRect(cx,cy,1,1);return}
  for(let y=-r;y<=r;y++){const w=fl(Math.sqrt(r*r-y*y)+0.35);g.fillRect(cx-w,cy+y,w*2+1,1)}}
function ell(g,cx,cy,rx,ry,c){cx=rd(cx);cy=rd(cy);g.fillStyle=c;if(ry<1){g.fillRect(cx-rx,cy,rx*2+1,1);return}
  for(let y=-ry;y<=ry;y++){const w=fl(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry)))+0.3);g.fillRect(cx-w,cy+y,w*2+1,1)}}

function poly(g,pts,c){let y0=1e9,y1=-1e9;for(const p of pts){if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}g.fillStyle=c;
  for(let y=fl(y0);y<=Math.ceil(y1);y++){const yc=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>yc)!==(b[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const xa=rd(xs[k]),xb=rd(xs[k+1]);if(xb>xa)g.fillRect(xa,y,xb-xa,1)}}}
function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

function vn(x,seed){const i=fl(x),f=x-i,a=hash(i,seed),b=hash(i+1,seed),u=f*f*(3-2*f);return a+(b-a)*u}


const SAMPLES=[];


// ================= masterwork helpers =================
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}


// ================= 1. 永登之塔 (Penrose stairs) =================


// ================= 2. 无尽之窗 (infinite zoom) =================
(function(){
const W=320,H=180,RZ=8,PX=140,PY=78.75,PW=40,PH=22.5,LEVT=192;
// every scene is drawn from shapes in its own 320x180 space and re-rasterised at the current scale each frame,
// so it stays crisp pixel art at every size. Each scene's centre window (PX,PY,PW,PH) holds the next scene at 1/8.
let G=null,TS=1,TX=0,TY=0,CL=[0,0,W,H];
const sx_=x=>TX+x*TS,sy_=y=>TY+y*TS;
function vis(a,b,a2,b2){return a2>CL[0]&&a<CL[2]&&b2>CL[1]&&b<CL[3]}
function zr(x,y,w,h,c){let a=Math.round(sx_(x)),b=Math.round(sy_(y)),a2=Math.round(sx_(x+w)),b2=Math.round(sy_(y+h));
  if(a2===a&&w*TS>=0.34)a2=a+1;if(b2===b&&h*TS>=0.34)b2=b+1;if(a2<=a||b2<=b||!vis(a,b,a2,b2))return;G.fillStyle=c;G.fillRect(a,b,a2-a,b2-b)}
function zp(pts,c){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const q=pts.map(p=>{const x=sx_(p[0]),y=sy_(p[1]);if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;return[x,y]});
  if(!vis(x0,y0,x1,y1))return;if(x1-x0<0.6&&y1-y0<0.6){if((x1-x0)*(y1-y0)>0.02)P(G,x0,y0,c);return}poly(G,q,c)}
function zd(cx,cy,r,c){const x=sx_(cx),y=sy_(cy),rr=r*TS;if(!vis(x-rr-1,y-rr-1,x+rr+1,y+rr+1))return;if(rr<0.5){if(rr>0.18)P(G,x,y,c);return}disc(G,x,y,rr,c)}
function ze(cx,cy,rx,ry,c){const x=sx_(cx),y=sy_(cy),a=rx*TS,b=ry*TS;if(!vis(x-a-1,y-b-1,x+a+1,y+b+1))return;if(a<0.5&&b<0.5){if(a*b>0.04)P(G,x,y,c);return}ell(G,x,y,Math.max(0,rd(a)),Math.max(0,rd(b)),c)}
function zl(x0,y0,x1,y1,c,th){const a=sx_(x0),b=sy_(y0),a2=sx_(x1),b2=sy_(y1);if(!vis(Math.min(a,a2)-1,Math.min(b,b2)-1,Math.max(a,a2)+1,Math.max(b,b2)+1))return;
  const t_=th?Math.max(1,rd(th*TS)):1;if(Math.abs(a2-a)+Math.abs(b2-b)<0.5){if(TS>0.25)P(G,a,b,c);return}L(G,a,b,a2,b2,c,t_)}
function zclip(x,y,w,h,fn){const a=Math.round(sx_(x)),b=Math.round(sy_(y)),a2=Math.round(sx_(x+w)),b2=Math.round(sy_(y+h));const save=CL.slice();CL=[Math.max(save[0],a),Math.max(save[1],b),Math.min(save[2],a2),Math.min(save[3],b2)];
  if(CL[2]>CL[0]&&CL[3]>CL[1]){G.save();G.beginPath();G.rect(CL[0],CL[1],CL[2]-CL[0],CL[3]-CL[1]);G.clip();fn();G.restore()}CL=save}
function zpx(x,y,c,sz){const a=sx_(x),b=sy_(y);if(!vis(a-1,b-1,a+1,b+1))return;const n=sz?Math.max(1,rd(sz*TS)):1;G.fillStyle=c;G.fillRect(fl(a-(n-1)/2),fl(b-(n-1)/2),n,n)}
// ---------------------------------------------------------------- L0 her room, from above
function room(t){
  // floor planks under a cool moonlit patch
  zr(0,0,W,H,'#5c3a30');
  for(let r=0;r<20;r++){const y=r*9;if(r%3===1)zr(0,y,W,9,'#62402f');zr(0,y,W,1,'#3e2620');const off=(r*97)%150;for(let x=-off;x<W;x+=150){zr(x,y,1,9,'#3e2620')}
    for(let k=0;k<3;k++){const gx=hash(r,k,1)*W,gw=20+hash(r,k,2)*40;zr(gx,y+3+k*2,gw,1,'#54362a')}}
  // moonlight from a window off-frame left: a pale slanted patch with the window bars' shadows
  zp([[0,22],[58,22],[92,176],[0,176]],'#5e5470');for(let k=0;k<3;k++){const y=22+k*52;zp([[0,y+24],[64+k*11,y+24],[66+k*11,y+28],[0,y+28]],'#5c3a30')}zp([[26,22],[30,22],[64,176],[60,176]],'#5c3a30');
  for(let r=0;r<20;r++){const y=r*9;if(y>22&&y<176){const xe=58+(y-22)*34/154;zr(0,y,xe,1,'#4a4260');const off=(r*97)%150;for(let x=-off;x<xe;x+=150)if(x>0)zr(x,y,1,9,'#4a4260')}}
  // rug under the chair
  zr(108,128,124,52,'#2c4656');zr(112,132,116,44,'#38586a');zr(116,136,108,36,'#2c4656');for(let i=0;i<12;i++)zr(120+i*9,152,4,4,'#c8a050');
  // desk with its shadow
  zr(92,60,168,72,'#2a1a18');zr(86,54,168,72,'#9a6644');zr(86,54,168,2,'#c08a5a');zr(86,124,168,2,'#6e4430');
  for(let i=0;i<5;i++)zr(86,68+i*12,168,1,'#8c5a3c');
  // pool of lamplight on the desk (a lighter solid wood, stepped)
  zclip(86,54,168,70,()=>{ze(214,84,74,40,'#a8704a');ze(214,84,56,30,'#b47a50');ze(214,84,40,22,'#c48a5c');ze(216,82,24,13,'#d29a68');for(let i=0;i<5;i++)zr(86,68+i*12,168,1,'#8c5a3c')});
  // lamp: weighted base, arm, shade seen from above with a hot rim
  zd(232,64,7,'#2a3a34');zd(232,64,5,'#3e544a');zl(232,64,214,78,'#2a3a34',2);zd(214,80,10,'#24342e');zd(214,80,8,'#3c5a4c');zd(212,78,4,'#ffe6a0');zp([[205,76],[206,74],[208,72]],'#7a9a88');
  // mug of tea and its steam
  zd(110,72,7,'#1e1416');zd(108,70,7,'#d8d0c0');zd(108,70,5,'#6e3a24');zd(106,68,2,'#9a5a38');zr(114,68,4,4,'#d8d0c0');
  for(let i=0;i<4;i++){const a=((t*0.6+i*12)%48)/48;const xx=108+Math.sin(t*0.05+i*2)*3*a,yy=66-a*22;zd(xx,yy,1+a*2.2,a<0.5?'#cfc6c6':'#b0a6b0')}
  // books and pencils
  zr(96,100,22,16,'#3a2a5a');zr(95,98,22,16,'#5a4290');zr(95,98,22,2,'#8070b8');zr(98,101,18,10,'#4a3680');
  zr(100,96,18,14,'#a03a3a');zr(100,96,18,2,'#d06a5a');
  zl(236,104,252,96,'#e0b040');zl(237,105,253,97,'#c08a20');P(G,sx_(252),sy_(96),'#f0c8a0');zl(232,112,246,114,'#4a8a6a');zl(232,113,246,115,'#3a6a52');
  zr(240,116,6,4,'#e88a9a');zr(240,116,6,1,'#ffb0c0');
  // sketchpad: spiral-bound, the drawing in the middle is the window to the next scene
  zr(132,74,62,40,'#2a1a18');zr(128,70,64,40,'#d8ccb8');zr(128,70,64,38,'#f2e8d4');zr(128,70,64,1,'#fff8ea');
  for(let i=0;i<14;i++){zd(132+i*4.4,70,1,'#5a5a66');zpx(132+i*4.4,69,'#b0b0bc')}
  zr(PX-1,PY-1,PW+2,PH+2,'#8a8478');
  // the girl from above: back, shoulders, hair with a clip, arms on the desk
  const br=Math.sin(t*0.06)*0.5;
  // chair back
  zr(136,150,54,8,'#3a2420');zr(136,150,54,2,'#5a3a30');
  // sweater: shoulders and back
  ze(163,146+br,26,12,'#c88a32');ze(163,144+br,24,10,'#e0a440');ze(156,141+br,10,4,'#f0bc5c');
  // left arm resting on the pad corner
  zp([[142,140],[130,118],[136,112],[150,134]],'#d89838');zp([[142,140],[136,124],[140,122],[148,134]],'#c08030');zd(134,112,4,'#f2c4a0');zr(131,110,6,2,'#ffdcc0');
  // right arm drawing: the hand travels in little strokes near the drawing's lower right corner
  const ph=t*0.22,hx=176+Math.sin(ph)*3+Math.sin(ph*0.37)*2,hy=104+Math.cos(ph*1.3)*1.5;
  zp([[180,142],[188,134],[hx+5,hy+4],[hx-1,hy+6]],'#d89838');zp([[183,140],[188,134],[hx+5,hy+4],[hx+2,hy+6]],'#c08030');
  zd(hx+1,hy+3,4,'#f2c4a0');zr(hx-2,hy+1,5,2,'#ffdcc0');
  zl(hx-1,hy+2,hx-4,hy-3,'#e0b040',1);zpx(hx-4,hy-3,'#3c3a36');
  // head: hair crown, parting highlight, clip
  zp([[158,138+br],[168,138+br],[170,150+br],[164,160+br],[160,152+br]],'#2a1a22');zl(163,140+br,165,156+br,'#4a3038');
  zd(163,133+br,13,'#2a1a22');zd(162,131+br,11,'#3c2630');
  for(let i=0;i<7;i++){const q=-2.6+i*0.55;zl(163+Math.cos(q)*3,131+br+Math.sin(q)*3,163+Math.cos(q)*11,131+br+Math.sin(q)*11,'#2e1c26')}
  zd(160,127+br,3,'#5a3a46');zpx(158,126+br,'#7a5a66');zd(164,138+br,2.5,'#e85a6a');

  ze(163,121+br,7,2,'#2a1a22');
  // cat asleep on the rug corner, breathing
  const cb=Math.sin(t*0.08)>0?1:0;ze(222,160,12+cb,9+cb,'#d8803a');ze(220,158,10,7,'#f0a050');zd(212,164,5,'#d8803a');zd(211,163,4,'#f0a050');
  zp([[208,160],[209,156],[211,159]],'#d8803a');zp([[214,160],[215,156],[217,159]],'#d8803a');zl(230,166,214,170,'#c06a2a',2);
  for(let i=0;i<3;i++)zl(218+i*4,152,220+i*4,158,'#c06a2a');P(G,sx_(209),sy_(164),'#3a2020');
  // a plant in the corner
  zd(292,150,12,'#6a3a2a');zd(292,150,10,'#3a2420');for(let i=0;i<9;i++){const a=i*0.7+Math.sin(t*0.03+i)*0.05,r=14+(i%3)*4;zp([[292,150],[292+Math.cos(a-0.12)*r*0.6,150+Math.sin(a-0.12)*r*0.6],[292+Math.cos(a)*r,150+Math.sin(a)*r],[292+Math.cos(a+0.12)*r*0.6,150+Math.sin(a+0.12)*r*0.6]],i%2?'#3a7a4a':'#5aa05a')}
}
// ---------------------------------------------------------------- L1 the drawing: a lighthouse in pencil
const PAP='#f2e8d4',G1='#cfc4ae',G2='#9a9282',G3='#625c52',G4='#3a3630';
function jit(i,t){// code-rendered "boil": endpoints wander a quarter unit, three variants cycling
  const v=fl(t/5)%3;return(hash(i,v,77)-0.5)*0.7}
function sketch(t){
  zr(0,0,W,H,PAP);
  let k=0;const ln=(x0,y0,x1,y1,c)=>{k++;zl(x0+jit(k,t),y0+jit(k+500,t),x1+jit(k+900,t),y1+jit(k+1300,t),c)};
  const HZ=128;
  // night sky: diagonal hatching in two passes, denser near the top; the moon and the beam are left bare paper
  const bare=(x,y)=>Math.hypot(x-58,y-34)<21||(x>186&&Math.abs((y-90)-(x-186)*0.02)<10+(x-186)*0.28);
  for(let i=0;i<96;i++){const x=-80+i*4.6;const len=36+hash(i,1,3)*70;for(let sgm=0;sgm<6;sgm++){const q0=sgm/6,q1=(sgm+1)/6;const xa=x+len*0.7*q0,ya=len*0.62*q0,xb=x+len*0.7*q1,yb=len*0.62*q1;
      if(yb>HZ-6||bare((xa+xb)/2,(ya+yb)/2))continue;ln(xa,ya,xb,yb,i%3?G1:G2)}}
  for(let i=0;i<46;i++){const x=-30+i*8;if(!bare(x+12,10))ln(x,0,x+24,20,G2)}
  // a scalloped pencil cloud
  for(let i=0;i<7;i++){const cx=236+i*9,cy=30+Math.sin(i*1.3)*2,r=6+(i%3)*2;for(let a=0;a<12;a++){const q=PI+a/11*PI;zpx(cx+Math.cos(q)*r,cy+Math.sin(q)*r*0.8,G3)}}
  ln(228,32,302,32,G3);
  // moon, outlined, with a few craters
  for(let a=0;a<72;a++){const q=a/72*PI*2;const r=17+jit(a,t)*0.5;zpx(58+Math.cos(q)*r,34+Math.sin(q)*r,G3)}
  zd(52,30,3,G1);zd(64,40,2,G1);zd(62,27,1.5,G1);zd(50,42,1,G1);
  // the beams: pencil edges fanning right and left
  ln(184,86,320,58,G3);ln(184,95,320,126,G3);ln(136,86,0,72,G2);ln(136,95,0,104,G2);
  // sea: horizon, wave strokes getting longer toward us, and a far sailboat with its lamp
  zl(0,HZ,W,HZ,G3);
  for(let r=0;r<16;r++){const y=HZ+3+r*3.2+r*r*0.1;for(let x=-10+((r*13)%17);x<W;x+=16+r*1.4){const w=6+r*0.9;const bob=Math.sin(t*0.05+x*0.1+r)*0.7;if(x+w>112&&x<208&&y>150)continue;ln(x,y+bob,x+w,y+bob,r<5?G2:G3)}}
  ln(258,124,266,124,G4);ln(260,124,262,113,G3);ln(262,113,262,124,G3);ln(262,114,267,123,G3);zpx(262,111,G4);
  // rocks at the foot of the tower and the surf breaking on them
  zp([[100,180],[108,160],[124,150],[196,150],[212,158],[222,180]],PAP);
  for(let i=0;i<34;i++){const x=104+i*3.4;ln(x,180,x+8,156+Math.abs(i-17)*0.4,G2)}
  ln(100,180,108,160,G4);ln(108,160,124,150,G4);ln(196,150,212,158,G4);ln(212,158,222,180,G4);ln(140,166,150,158,G3);ln(170,170,184,160,G3);
  const surf=(Math.sin(t*0.06)+1)/2;for(let i=0;i<9;i++){const q=i/8*PI;const r=6+surf*8;ln(104+Math.cos(q)*r*0.3,162-Math.sin(q)*r,104+Math.cos(q)*r*0.5,160-Math.sin(q)*r*0.7,G3);ln(216-Math.cos(q)*r*0.3,164-Math.sin(q)*r,216-Math.cos(q)*r*0.5,162-Math.sin(q)*r*0.7,G3)}
  // tower: tapering, two hatched bands, shaded on the right with vertical strokes, three small windows
  const tw=y=>23+(y-107)*0.17;const TB=156;
  ln(160-tw(107),107,160-tw(TB),TB,G4);ln(160+tw(107),107,160+tw(TB),TB,G4);
  for(let bnd=0;bnd<2;bnd++){const y0=114+bnd*20,y1=y0+8;ln(160-tw(y0),y0,160+tw(y0),y0,G3);ln(160-tw(y1),y1,160+tw(y1),y1,G3);
    for(let x=-1;x<=1;x+=0.08){ln(160+x*tw(y0),y0,160+x*tw(y1)+1.6,y1,G2)}}
  for(let i=0;i<9;i++){const q=0.55+i*0.05;ln(160+tw(108)*q,108,160+tw(TB)*q,TB-1,G1)}
  for(const wy of[126,146]){zr(157,wy,6,6,G3);zr(158,wy+1,4,4,PAP)}
  // gallery and railing
  ln(126,101.5,194,101.5,G4);ln(124,105,196,105,G4);ln(126,108,194,108,G3);for(let x=128;x<=192;x+=3.5)ln(x,96,x,101,G3);ln(126,95.5,194,95.5,G3);
  // lantern: the glazing is the next world; mullions and the dome are drawn round it
  ln(PX-2,PY-1,PX-2,PY+PH+1,G4);ln(PX+PW+1,PY-1,PX+PW+1,PY+PH+1,G4);ln(PX-2,PY-1,PX+PW+1,PY-1,G4);ln(PX-2,PY+PH+1,PX+PW+1,PY+PH+1,G4);
  ln(PX-6,PY-2,PX-6,PY+PH+2,G3);ln(PX+PW+5,PY-2,PX+PW+5,PY+PH+2,G3);ln(PX-6,PY-3,PX+PW+5,PY-3,G3);
  for(let a=0;a<=24;a++){const q=PI+a/24*PI;zpx(160+Math.cos(q)*27,PY-3+Math.sin(q)*16,G4)}
  for(let i=0;i<9;i++){const x=137+i*5.5;ln(x,PY-6-Math.sin((i+0.5)/9*PI)*8,x+1.5,PY-4,i>5?G3:G2)}
  ln(160,PY-19,160,PY-28,G4);zd(160,PY-29,2,G3);ln(156,PY-24,164,PY-24,G3);
  // birds: two-stroke ticks, flapping
  for(let i=0;i<5;i++){const bx=214+i*16+Math.sin(t*0.02+i)*4,by=52+i*6+Math.cos(t*0.03+i)*2,up=((t>>3)+i)%2?2:-1;ln(bx-4,by-up,bx,by,G4);ln(bx,by,bx+4,by-up,G4)}
  // her initials in the corner
  ln(288,170,291,164,G3);ln(291,164,294,170,G3);ln(289,168,293,168,G3);ln(297,164,297,170,G3);ln(297,170,301,170,G3);
}
// ---------------------------------------------------------------- L2 the lamp room, the keeper at his telescope
const SKY2=['#0e1430','#121a3a','#162044','#1a264c','#202e56'];
function keeper(t){
  // sky through the glazing: banded night, a low moon over the sea, stars
  zr(0,0,W,H,'#0e1430');for(let i=0;i<5;i++)zr(0,30+i*17,W,17,SKY2[i]);
  zr(0,112,W,40,'#0c1834');for(let r=0;r<8;r++){const y=114+r*3;for(let x=(r*23)%31;x<W;x+=31+r*3)zr(x+Math.sin(t*0.04+r+x)*2,y,8+r,1,'#1e3060')}
  zd(52,96,7,'#f0e6c0');zd(55,94,6,'#1a264c');for(let r=0;r<5;r++)zr(46-r,114+r*4,10+r*2,1,'#c8bc90');
  for(let i=0;i<70;i++){const x=hash(i,2,2)*W,y=30+hash(i,3,2)*80;zpx(x,y,((t>>4)+i)%9===0?'#ffffff':i%3?'#8890c0':'#e0e4ff')}
  // glazing: brass mullions on a 40 x 22.5 grid, the centre pane is the next world
  for(let c=0;c<=8;c++){const x=-20+c*40;zr(x-2,26,4,104,'#6a4a22');zr(x-2,26,1,104,'#c8a050');zr(x+1,26,1,104,'#3a2814')}
  for(let r=0;r<5;r++){const y=33.75+r*22.5;zr(0,y-1.5,W,3,'#6a4a22');zr(0,y-1.5,W,1,'#c8a050')}
  // ceiling: copper ribs converging
  zr(0,0,W,28,'#2a1a1a');for(let i=0;i<9;i++){const x=i*40-20;zp([[x-3,0],[x+3,0],[x+2,28],[x-2,28]],'#4a2a22');zl(x-2,0,x-1,28,'#8a5a3a')}zr(0,24,W,4,'#5a3424');zr(0,24,W,1,'#9a6a44');
  // parapet wall under the glass, warm-lit from the lens, and the iron gallery floor
  zr(0,128,W,26,'#c89a70');zr(0,128,W,2,'#f0c898');for(let x=0;x<W;x+=24)zr(x,130,1,24,'#a87a58');zr(0,152,W,2,'#7a5040');
  zr(0,154,W,26,'#2a2228');for(let y=156;y<H;y+=4)zr(0,y,W,1,'#3a3038');for(let x=4;x<W;x+=8)zr(x,154,1,26,'#3a3038');
  // the lens: a beehive of glass rings around the flame, turning
  const LX=262,LY=96;
  zr(LX-30,150,60,6,'#6a4a22');zr(LX-24,140,48,12,'#4a3018');zr(LX-24,140,48,2,'#c8a050');
  for(let r=0;r<11;r++){const y=48+r*8.6,w=24+Math.sin((r+0.5)/11*PI)*16;const ph=(t*0.04+r*0.3)%1;
    zr(LX-w,y,w*2,8,r%2?'#5a8a96':'#4a7a88');zr(LX-w,y,w*2,1,'#d8f4f4');zr(LX-w,y+6,w*2,2,'#2e5866');
    // bright facets sliding round as the lens turns
    const fx=LX-w+((ph*w*2)%(w*2-4));zr(fx,y+1,4,5,'#f0ffff');const f2=LX-w+(((ph+0.5)*w*2)%(w*2-2));zr(f2,y+1,2,5,'#a8e0e0')}
  zr(LX-6,90,12,16,'#fff0b0');zr(LX-3,86,6,24,'#ffffe8');zr(LX-34,48,4,96,'#6a4a22');zr(LX+30,48,4,96,'#6a4a22');
  // the beam leaves through the right-hand panes when it swings past
  const sw=(Math.sin(t*0.03)+1)/2;if(sw>0.6){const k=(sw-0.6)/0.4;zp([[LX+30,84],[W,60-k*30],[W,132+k*10],[LX+30,108]],'#3a4c74')}
  // the keeper: cap, white beard, pea coat, the brass telescope raised to the centre pane
  const br=Math.sin(t*0.05)*0.6,KX=84;
  zp([[KX-20,154],[KX-18,112],[KX-10,98],[KX+10,98],[KX+16,112],[KX+18,154]],'#1e2a4a');
  zp([[KX+6,100],[KX+10,98],[KX+16,112],[KX+18,154],[KX+12,154],[KX+12,112]],'#34466e');
  for(let i=0;i<3;i++){zpx(KX+4,112+i*9,'#e8c060',2)}
  zr(KX-14,146,10,8,'#141c30');zr(KX+2,146,10,8,'#141c30');zr(KX-16,154,14,3,'#0e0e14');zr(KX+2,154,14,3,'#0e0e14');
  // head
  zd(KX,86+br,10,'#e8b48a');zp([[KX+6,84+br],[KX+11,86+br],[KX+7,89+br]],'#e8b48a');
  zp([[KX-8,88+br],[KX+9,88+br],[KX+8,100+br],[KX+2,106+br],[KX-6,100+br]],'#ece8e0');zp([[KX+1,92+br],[KX+8,90+br],[KX+7,100+br],[KX+2,106+br]],'#c8c4c0');
  zd(KX+5,84+br,1,'#2a1a1a');zr(KX+2,81+br,7,1,'#d8d4d0');
  zp([[KX-11,80+br],[KX-9,73+br],[KX+9,72+br],[KX+11,79+br]],'#1a2238');zr(KX-12,79+br,26,3,'#141a2c');zr(KX+6,79+br,10,2,'#0e1420');zpx(KX,75+br,'#e8c060',2);
  // arms raise the telescope; rim light from the lens on the right edge
  zp([[KX+8,102],[KX+20,92],[KX+24,96],[KX+12,108]],'#1e2a4a');zd(KX+22,92,3,'#e8b48a');
  zp([[KX+12,90],[KX+50,80],[KX+51,84],[KX+13,95]],'#a87a2a');zp([[KX+12,90],[KX+50,80],[KX+50,81],[KX+12,91]],'#f0d080');zr(KX+10,88,4,8,'#6a4a1a');zr(KX+47,78,4,8,'#c89a3a');
  zl(KX+18,100,KX+18,150,'#5a6a9a');zl(KX+11,80+br,KX+11,96+br,'#ffd8a8');
  // stool, oil can, the log book
  zr(140,138,22,4,'#5a3424');zr(143,142,3,12,'#3a2018');zr(156,142,3,12,'#3a2018');zr(144,128,14,10,'#7a2a2a');zr(144,128,14,2,'#a84a3a');zr(146,130,10,1,'#e8d8c0');
  zr(190,140,10,14,'#4a5a4a');zr(190,140,10,2,'#7a8a7a');zl(200,142,206,136,'#4a5a4a',2)}
// ---------------------------------------------------------------- L3 the night side of the Earth
const EX=120,EY=300,ER=260;
function landAt(x,y){// continents from a few lumpy blobs, tested in scene units
  const n=vn(x*0.03+y*0.011,4)*0.6+vn(y*0.045-x*0.02,9)*0.4;const c=Math.hypot((x-160)*0.8,y-90);return n+Math.max(0,0.5-c/80)>0.56}
function earth(t){
  zr(0,0,W,H,'#0e1430');
  for(let i=0;i<120;i++){const x=hash(i,5,1)*W,y=hash(i,6,1)*H;zpx(x,y,((t>>3)+i)%11===0?'#ffffff':i%4?'#5a6496':'#c8d0ff')}
  // the moon, half lit
  zd(42,40,12,'#2a3050');zp([[42,28],[48,30],[53,36],[54,44],[50,50],[42,52],[46,46],[48,40],[46,34]],'#d8d4c8');
  // atmosphere and the disc
  zd(EX,EY,ER+3,'#2a4a8a');zd(EX,EY,ER+1,'#1c3266');zd(EX,EY,ER,'#0a1226');
  // land: scanned in 2-unit cells so it scales like everything else
  const cs=2;for(let y=EY-ER;y<H;y+=cs)for(let x=EX-ER;x<EX+ER;x+=cs){const dx=x+1-EX,dy=y+1-EY;if(dx*dx+dy*dy>(ER-1)*(ER-1))continue;if(landAt(x,y))zr(x,y,cs,cs,'#18223e')}
  // city lights: dense at the coast cities, one bright metropolis in the centre
  for(let i=0;i<900;i++){const x=EX-ER+hash(i,7,3)*ER*2,y=EY-ER+hash(i,8,3)*(H-EY+ER);const dx=x-EX,dy=y-EY;if(dx*dx+dy*dy>(ER-3)*(ER-3)||!landAt(x,y))continue;
    const near=Math.hypot(x-160,y-90);if(near<28&&hash(i,9,3)<0.6)continue;zpx(x,y,hash(i,10,3)<0.3?'#ffe8a0':'#d89040')}
  {const XS=cityStreetsX(),YS=cityStreetsY();const mx=v=>PX+v/RZ,my=v=>PY+v/RZ;
   // the city's streets keep going past the window, broken into shorter runs as they reach the suburbs
   const road=(x0,y0,x1,y1,dd)=>{if(!landAt((x0+x1)/2,(y0+y1)/2))return;zl(x0,y0,x1,y1,dd<0.55?'#7a5028':'#4e3a2e')};
   for(let i=-14;i<=17;i++){const x=mx(XS[((i%XS.length)+XS.length)%XS.length])+Math.floor(i/XS.length)*W/RZ;for(let j=-6;j<10;j++){const y0=PY-8+j*4.4,dd=Math.hypot((x-160)*0.8,y0-90)/30;if(x>PX-0.5&&x<PX+PW+0.5&&y0>PY-4.5&&y0<PY+PH)continue;if(hash(i,j,21)<dd*dd*dd)continue;road(x,y0,x,y0+4.4,dd)}}
   for(let j=-8;j<=15;j++){const y=my(YS[((j%YS.length)+YS.length)%YS.length])+Math.floor(j/YS.length)*H/RZ;for(let i=-10;i<13;i++){const x0=PX-10+i*5,dd=Math.hypot((x0-160)*0.8,y-90)/30;if(y>PY-0.5&&y<PY+PH+0.5&&x0>PX-5&&x0<PX+PW)continue;if(hash(i,j,22)<dd*dd*dd)continue;road(x0,y,x0+5,y,dd)}}
   for(let i=0;i<260;i++){const a=hash(i,11,4)*PI*2,r=14+Math.pow(hash(i,12,4),1.3)*36;const x=160+Math.cos(a)*r*1.3,y=90+Math.sin(a)*r*0.8;if(landAt(x,y))zpx(x,y,r<26?'#fff4c8':'#e8a040')}}
  // the day side: a thin bright crescent on the right limb
  for(let y=EY-ER;y<H;y+=1){const w=Math.sqrt(Math.max(0,ER*ER-(y-EY)*(y-EY)));const k=Math.max(0,(w-40)/ER);const cw=2+k*k*10;zr(EX+w-cw,y,cw,1,y<EY-ER+30?'#e8f4ff':'#8ac8f0');zr(EX+w-cw-1.5,y,1.5,1,'#3a6aaa')}
  // a station drifting across, solar panels glinting
  const sx=((t*0.15)%380)-30,sy=36+sx*0.12;zr(sx-6,sy,4,2,'#3a4a8a');zr(sx+2,sy,4,2,'#3a4a8a');zr(sx-2,sy-0.5,4,3,'#c8c8d0');if(((t>>2)%6)===0)zpx(sx,sy,'#ffffff')}
// ---------------------------------------------------------------- L4 the city from above
function cityStreetsX(){return[-6,38,82,118,138,182,202,238,282,326]}
function cityStreetsY(){return[-4,30,56.75,76.75,103.25,123.25,150,184]}
function city(t){
  zr(0,0,W,H,'#18223e');
  const XS=cityStreetsX(),YS=cityStreetsY();
  // blocks: roofs of many heights; brighter toward the centre
  for(let i=0;i+1<XS.length;i++)for(let j=0;j+1<YS.length;j++){const x0=XS[i]+2,x1=XS[i+1]-2,y0=YS[j]+2,y1=YS[j+1]-2;const cx=(x0+x1)/2,cy=(y0+y1)/2,d=Math.hypot(cx-160,cy-90);
    if(x0>=PX-1&&x1<=PX+PW+1&&y0>=PY-1&&y1<=PY+PH+1){zr(x0,y0,x1-x0,y1-y0,'#2a2e3e');continue}
    zr(x0,y0,x1-x0,y1-y0,d<90?'#1e2438':'#161c30');
    // subdivide into buildings
    const rs=rng(i*31+j*7);let x=x0;while(x<x1-3){const w=Math.min(x1-x,6+fl(rs()*16));let y=y0;while(y<y1-3){const h=Math.min(y1-y,6+fl(rs()*12));
        const tone=rs();const far=d>96;zr(x+0.5,y+0.5,w-1,h-1,far?(tone<0.5?'#1c2440':'#202844'):tone<0.3?'#2a3048':tone<0.6?'#222840':'#30364e');zr(x+0.5,y+0.5,w-1,1,far?'#262e4a':'#3e4660');
        const tall=d<80&&rs()<0.18;if(tall){zr(x+1.5,y+1.5,w-1,h-1,'#0c1020');zr(x+0.5,y+0.5,w-1.5,h-1.5,'#3a4260');zr(x+0.5,y+0.5,w-1.5,1,'#5a6480');zpx(x+w/2,y+h/2,(((t>>3)+i+j)%4===0)?'#ff3a3a':'#5a1a1a')}
        if(rs()<0.7)zpx(x+2+rs()*(w-4),y+2+rs()*(h-4),d<70?'#ffe6a0':'#c08040');
        y+=h}x+=w}}
  // a park and the river with two bridges
  // the park: two blocks of trees round a pond, lamps along a path
  zr(204,32,76,22,'#12241c');for(let i=0;i<46;i++)zd(206+hash(i,1,6)*72,34+hash(i,2,6)*18,1.5+hash(i,3,6),hash(i,4,6)<0.3?'#24442e':'#1a3424');ze(250,43,9,5,'#0a1424');ze(250,43,7,3,'#122040');
  zl(206,52,278,34,'#3a3a3a');for(let k=0;k<8;k++)zpx(206+k*9.6,52-k*2.4,'#ffe6a0');
  // the stadium, its floodlit pitch
  ze(60,42,30,11,'#2a3048');ze(60,42,26,9,'#4a5068');zr(42,37,36,10,'#2e6a3e');zr(42,37,36,10,'#2e6a3e');zl(60,37,60,47,'#6aaa6a');for(const[a,b]of[[34,32],[86,32],[34,52],[86,52]])zpx(a,b,'#ffffff',2);
  zp([[0,128],[60,140],[120,160],[180,172],[260,180],[0,180]],'#0a1020');zp([[0,132],[60,144],[118,163],[160,174],[0,180]],'#0c1428');
  for(let i=0;i<14;i++){const x=hash(i,3,7)*240,y=134+x*0.17+hash(i,4,7)*16;zr(x,y,3+hash(i,5,7)*6,0.6,'#3a4a7a')}
  // streets: sodium avenues, with traffic running both ways
  for(const x of XS){zr(x-1.5,0,3,H,'#7a5028');zr(x-0.5,0,1,H,'#e8a040')}
  for(const y of YS){zr(0,y-1.5,W,3,'#7a5028');zr(0,y-0.5,W,1,'#e8a040')}
  // the old diagonal boulevard, brighter, through the lower left
  zp([[-10,96],[-6,92],[120,180],[112,180]],'#7a5028');zl(-8,94,116,180,'#ffc060');
  for(const x of XS)for(const y of YS){zr(x-2,y-2,4,4,'#9a6a34');zpx(x,y,'#fff0c0')}
  for(let i=0;i<260;i++){const vert=i%2===0,lane=hash(i,1,8)<0.5?-1:1;const idx=fl(hash(i,2,8)*(vert?XS.length:YS.length));const base=vert?XS[idx]:YS[idx];
    const span=vert?H+20:W+20,sp=0.25+hash(i,3,8)*0.4;const u=((hash(i,4,8)*span+t*sp*lane)%span+span)%span-10;
    const col=lane>0?'#fff8e0':'#ff4a3a';if(vert)zpx(base+lane*0.8,u,col);else zpx(u,base+lane*0.8,col)}
  // the one roof we are falling toward: a lit square in its middle
  zr(PX-2,PY-2,PW+4,PH+4,'#2a2e3e')}
// ---------------------------------------------------------------- L5 her rooftop
function roof(t){
  zr(0,0,W,H,'#2a2e3e');
  // membrane seams and gravel flecks
  for(let y=6;y<H;y+=18)zr(0,y,W,1,'#242838');for(let i=0;i<500;i++)zpx(hash(i,1,9)*W,hash(i,2,9)*H,i%3?'#323648':'#22263a');
  // warm glow spilling from the skylight in two steps
  zr(PX-14,PY-10,PW+28,PH+20,'#3a3640');zr(PX-7,PY-5,PW+14,PH+10,'#4a4044');
  // skylight frame
  zr(PX-4,PY-4,PW+8,PH+8,'#8a8e9a');zr(PX-4,PY-4,PW+8,1.5,'#c8ccd4');zr(PX-3,PY-3,PW+6,PH+6,'#5a5e6a');
  // water tank with staves and hoops
  zd(52,40,24,'#1a1c26');zd(48,36,24,'#6a4a34');for(let a=0;a<16;a++){const q=a/16*PI*2;zl(48,36,48+Math.cos(q)*24,36+Math.sin(q)*24,'#5a3c2a')}zd(48,36,6,'#4a3226');zd(47,35,3,'#7a5a42');
  // air-con units with turning fans
  for(const[ax,ay]of[[238,24],[270,24]]){zr(ax+2,ay+2,26,26,'#1a1c26');zr(ax,ay,26,26,'#9aa0aa');zr(ax,ay,26,1.5,'#d0d4dc');zd(ax+13,ay+13,10,'#4a4e58');
    const a0=t*0.5+ax;for(let k=0;k<3;k++){const q=a0+k*PI*2/3;zp([[ax+13,ay+13],[ax+13+Math.cos(q)*9,ay+13+Math.sin(q)*9],[ax+13+Math.cos(q+0.6)*9,ay+13+Math.sin(q+0.6)*9]],'#2a2e38')}zd(ax+13,ay+13,2,'#c8ccd4')}
  // pipes
  zr(0,70,96,4,'#5a5e6a');zr(0,70,96,1,'#8a8e9a');zr(92,70,4,40,'#5a5e6a');zr(200,120,120,3,'#5a5e6a');zr(200,120,120,1,'#8a8e9a');
  // planters along the edge with small trees seen from above
  for(let i=0;i<5;i++){const x=28+i*26,y=150;zr(x-9,y-9,20,20,'#1a1c26');zr(x-10,y-10,20,20,'#6a4a34');zd(x,y,8,'#2a5a3a');zd(x-2,y-2,6,'#3a7a4a');zd(x-3,y-3,3,'#5aa05a')}
  // laundry line with sheets lifting in the wind
  zl(214,62,300,92,'#c8ccd4');for(let i=0;i<3;i++){const x=226+i*24,y=66+i*8.4,fl_=Math.sin(t*0.12+i)*2;zp([[x,y],[x+16,y+5.6],[x+16+fl_,y+16+fl_],[x+fl_,y+11]],i===1?'#e88a8a':'#e8e4dc');zl(x,y,x+16,y+5.6,'#ffffff')}
  // a deck chair and two pigeons
  zr(200,140,16,26,'#1a1c26');zr(198,138,16,26,'#3a6a8a');for(let k=0;k<5;k++)zr(198,140+k*5,16,1,'#5a8aaa');
  for(let i=0;i<2;i++){const px=120+i*10+(((t>>5)+i)%3),py=40+i*4;ze(px,py,3,2,'#8a8a9a');zd(px+3,py-1,1.4,'#6a6a7a');zpx(px+4.5,py-1,'#e8a040')}
  // string lights zigzagging across, bulbs alternating
  for(let k=0;k<4;k++){const x0=0+k*80,x1=x0+80,y0=k%2?20:56,y1=k%2?56:20;zl(x0,y0,x1,y1,'#14161e');for(let b=1;b<8;b++){const q=b/8;zd(x0+(x1-x0)*q,y0+(y1-y0)*q+1,1.3,((b+k+(t>>4))%3)?'#ffd27a':'#fff4c8')}}
  // parapet at the frame edge
  zr(0,0,W,3,'#4a4e5a');zr(0,H-3,W,3,'#4a4e5a');zr(0,0,3,H,'#4a4e5a');zr(W-3,0,3,H,'#4a4e5a')}
// ---------------------------------------------------------------- scene table
const SC=[{f:room,avg:'#7a5a44'},{f:sketch,avg:'#d8ccb8'},{f:keeper,avg:'#2a2a46'},{f:earth,avg:'#141c38'},{f:city,avg:'#262a3e'},{f:roof,avg:'#2e3242'}];
function avgOf(i){return SC[i%SC.length].avg}
function drawLevel(i,s,ox,oy,depth,t){
  TS=s;TX=ox;TY=oy;SC[i%SC.length].f(t);
  const a=Math.round(sx_(PX)),b=Math.round(sy_(PY)),a2=Math.round(sx_(PX+PW)),b2=Math.round(sy_(PY+PH));
  if(a2-a<1||b2-b<1)return;
  const save=CL.slice();CL=[Math.max(save[0],a),Math.max(save[1],b),Math.min(save[2],a2),Math.min(save[3],b2)];
  if(CL[2]>CL[0]&&CL[3]>CL[1]){G.save();G.beginPath();G.rect(CL[0],CL[1],CL[2]-CL[0],CL[3]-CL[1]);G.clip();
    if(depth<2&&a2-a>=4)drawLevel(i+1,s/RZ,sx_(PX),sy_(PY),depth+1,t);else{G.fillStyle=avgOf(i+1);G.fillRect(a,b,a2-a,b2-b)}
    G.restore()}
  CL=save}
function draw(s,g){const [O,o]=s.O||(s.O=mkc(W,H));G=o;o.imageSmoothingEnabled=false;CL=[0,0,W,H];
  const z=s.z,lev=fl(z),f=z-lev,sc=Math.pow(RZ,f);
  drawLevel(((lev%SC.length)+SC.length)%SC.length,sc,160-160*sc,90-90*sc,0,s.t);
  g.drawImage(O,0,0)}
SAMPLES.push({id:'zoom',name:'无尽之窗',w:W,h:H,thumb:40,
  tags:['无限缩放','逐帧重新光栅化','六层嵌套首尾相接','俯视与正视的接力','铅笔线的程序绘制抖动'],
  about:'镜头一直往前推，永远推不到底：女孩在速写本上画一座灯塔，灯塔里的老守塔人举着望远镜看窗外，窗外挂着夜里的地球，地球上亮着一座城，城里有一栋楼的天窗，天窗底下就是正在画画的她。六层世界一层套一层，第六层的窗户里又是第一层。每一层都不是放大的图片，而是在当前尺寸下重新一笔一笔画出来的，所以推到哪里都是清清楚楚的像素。可以在画面上左右拖动，自己推拉镜头。',
  controls:[{type:'seg',key:'dir',label:'镜头',def:1,options:[[1,'推进'],[0,'停'],[-1,'拉远']]}],
  init(s){s.z=0},tick(s){if(!s.drag)s.z+=s.opt.dir/LEVT;if(s.z<0)s.z+=SC.length*64},
  onPointer(s,x,y,type,b){if(type==='down'){s.drag={x,z:s.z}}else if(type==='move'&&s.drag&&b){s.z=Math.max(0,s.drag.z+(x-s.drag.x)/W*2)}else if(type==='up')s.drag=null},
  draw,info(s){return '第 '+(((fl(s.z)%SC.length)+SC.length)%SC.length+1)+' 层 · 已推进 '+fl(s.z)+' 层'}});
})();

// ================= 3. 五十年 (one shot through six eras) =================


// ================= 4. 十二个像素 (a life in 4x3 pixels) =================


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

// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;

function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),fl(w),fl(h))}
function P(g,x,y,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),1,1)}

function disc(g,cx,cy,r,c){cx=rd(cx);cy=rd(cy);r=rd(r);g.fillStyle=c;if(r<=0){g.fillRect(cx,cy,1,1);return}
  for(let y=-r;y<=r;y++){const w=fl(Math.sqrt(r*r-y*y)+0.35);g.fillRect(cx-w,cy+y,w*2+1,1)}}

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


// ================= masterwork helpers =================
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}


// ================= 1. 永登之塔 (Penrose stairs) =================
(function(){
const W=320,H=180,OX=136,OY=30;
// isometric 2:1 projection: +1 x -> (+2,+1), +1 y -> (-2,+1), +1 z -> (0,-2). The view direction (1,1,1) projects to nothing,
// so a spiral that climbs k while drifting (k,k) sideways closes on screen into a ring that rises forever.
const NA=5,NC=2,ST=12,WB=10,RZ=2,K=36,ZB=-140,ZF=-12;
const XB=WB+NA*ST,OUT=XB+WB;
// a general orthographic camera turned about the vertical: at 45 degrees it is exactly the 2:1 isometric view above
let CA=Math.SQRT1_2,SA=Math.SQRT1_2;const K2=2*Math.SQRT2,K1=Math.SQRT2;
let OXv=OX,OYv=OY;const SX=(x,y)=>OXv+K2*(x*CA-y*SA),SY=(x,y,z)=>OYv+K1*(x*SA+y*CA)-2*z,DEP=(x,y,z)=>K1*(x*SA+y*CA)+z;
let STAT=null;
const LS=(()=>{const v=[-0.62,0.58,0.36],n=Math.hypot(...v);return v.map(a=>a/n)})(); // toward the sun: low, screen-left
let LAY=null;
// the ring: corner0, A x5, corner1, B x5, corner2, C x2, corner3, D x2 (then corner0 again, 27 up and 27 nearer)
function ringBoxes(){const bx=[];let z=0;const add=(x0,x1,y0,y1)=>{bx.push({x0,x1,y0,y1,z0:ZB,z1:z,m:'stone',step:bx.length});z+=RZ};
  add(0,WB,0,WB);
  for(let i=1;i<=NA;i++)add(WB+(i-1)*ST,WB+i*ST,0,WB);
  const XB=WB+NA*ST;add(XB,XB+WB,0,WB);
  for(let j=1;j<=NA;j++)add(XB,XB+WB,WB+(j-1)*ST,WB+j*ST);
  const YC=WB+NA*ST;add(XB,XB+WB,YC,YC+WB);
  for(let l=1;l<=NC;l++)add(XB-l*ST,XB-(l-1)*ST,YC,YC+WB);
  const X3=XB-NC*ST-WB;add(X3,X3+WB,YC,YC+WB);
  for(let m=1;m<=NC;m++)add(X3,X3+WB,YC-m*ST,YC-(m-1)*ST);
  return bx}
function build(ang){
  const A_=(45+ang)*D2R;CA=Math.cos(A_);SA=Math.sin(A_);
  // turn about the middle of the ring, so the tower stays put on screen
  const cx=44,cy=44;OXv=OX+2*(cx-cy)-K2*(cx*CA-cy*SA);OYv=OY+(cx+cy)-K1*(cx*SA+cy*CA);
  const boxes=ringBoxes();
  // courtyard floor deep inside, a balcony on the front wall, a bell loft on corner2, a buttress
  boxes.push({x0:K+WB,x1:XB,y0:WB,y1:XB,z0:ZF-4,z1:ZF,m:'floor'});
  boxes.push({x0:WB,x1:K+WB,y0:WB,y1:K+WB,z0:ZF-4,z1:ZF,m:'floor'});
  boxes.push({x0:54,x1:66,y0:OUT,y1:OUT+5,z0:-22,z1:-20,m:'stone'});        // balcony on the front face
  boxes.push({x0:OUT,x1:OUT+5,y0:26,y1:38,z0:-36,z1:-34,m:'stone'});        // balcony on the right face
  boxes.push({x0:OUT,x1:OUT+1.5,y0:0,y1:OUT+1.5,z0:-3,z1:-1,m:'cornice'});
  boxes.push({x0:K,x1:OUT,y0:OUT,y1:OUT+1.5,z0:-3,z1:-1,m:'cornice'});
  const zb=new Float32Array(W*H).fill(-1e9),wx=new Float32Array(W*H),wy=new Float32Array(W*H),wz=new Float32Array(W*H),fc=new Int8Array(W*H).fill(-1),bi=new Int16Array(W*H).fill(-1);
  const put=(px,py,x,y,z,f,b)=>{const i=py*W+px,d=DEP(x,y,z);if(d>zb[i]){zb[i]=d;wx[i]=x;wy[i]=y;wz[i]=z;fc[i]=f;bi[i]=b}};
  // each face is a plane, so every pixel inverts to one world point; the box is the bounds of its projected corners
  const bb=(pts)=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const q of pts){const x=SX(q[0],q[1]),y=SY(q[0],q[1],q[2]);a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x);d=Math.max(d,y)}return[Math.max(0,fl(a)-1),Math.max(0,fl(b)-1),Math.min(W-1,Math.ceil(c)+1),Math.min(H-1,Math.ceil(d)+1)]};
  boxes.forEach((b,k)=>{
    {const h=b.z1,[x0,y0,x1,y1]=bb([[b.x0,b.y0,h],[b.x1,b.y0,h],[b.x0,b.y1,h],[b.x1,b.y1,h]]);
     for(let py=y0;py<=y1;py++)for(let px=x0;px<=x1;px++){const u=(px+0.5-OXv)/K2,v=(py+0.5-OYv+2*h)/K1,x=u*CA+v*SA,y=-u*SA+v*CA;if(x>=b.x0&&x<b.x1&&y>=b.y0&&y<b.y1)put(px,py,x,y,h,0,k)}}
    {const X=b.x1,[x0,y0,x1,y1]=bb([[X,b.y0,b.z0],[X,b.y1,b.z0],[X,b.y0,b.z1],[X,b.y1,b.z1]]);
     for(let py=y0;py<=y1;py++)for(let px=x0;px<=x1;px++){const u=(px+0.5-OXv)/K2,y=(X*CA-u)/SA,z=(K1*(X*SA+y*CA)-(py+0.5-OYv))/2;if(y>=b.y0&&y<b.y1&&z>=b.z0&&z<b.z1)put(px,py,X,y,z,1,k)}}
    {const Y=b.y1,[x0,y0,x1,y1]=bb([[b.x0,Y,b.z0],[b.x1,Y,b.z0],[b.x0,Y,b.z1],[b.x1,Y,b.z1]]);
     for(let py=y0;py<=y1;py++)for(let px=x0;px<=x1;px++){const u=(px+0.5-OXv)/K2,x=(u+Y*SA)/CA,z=(K1*(x*SA+Y*CA)-(py+0.5-OYv))/2;if(x>=b.x0&&x<b.x1&&z>=b.z0&&z<b.z1)put(px,py,x,Y,z,2,k)}}});
  // the seam: the spiral is real 3D, so near corner0 the far end of flight D sits 27 nearer than corner0 while drawing over the same pixels.
  // everything there already agrees except that corner0 has no lower neighbour; nothing to patch.
  // cast shadows: slab test along the sun ray against every box
  const shadow=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++){if(fc[i]<0)continue;const f=fc[i];const n=f===0?[0,0,1]:f===1?[1,0,0]:[0,1,0];const ndl=n[0]*LS[0]+n[1]*LS[1]+n[2]*LS[2];
    if(ndl<=0.02){shadow[i]=2;continue}
    const o=[wx[i]+n[0]*0.05,wy[i]+n[1]*0.05,wz[i]+n[2]*0.05];
    for(const b of boxes){let t0=0.01,t1=400;const lo=[b.x0,b.y0,b.z0],hi=[b.x1,b.y1,b.z1];let hit=true;
      for(let a=0;a<3;a++){if(Math.abs(LS[a])<1e-6){if(o[a]<lo[a]||o[a]>hi[a]){hit=false;break}continue}
        let ta=(lo[a]-o[a])/LS[a],tb=(hi[a]-o[a])/LS[a];if(ta>tb){const q=ta;ta=tb;tb=q}t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1){hit=false;break}}
      if(hit){shadow[i]=1;break}}}
  LAY={boxes,zb,wx,wy,wz,fc,bi,shadow,ang};
  LAY.base=paint();
  if(!STAT)STAT={sky:paintSky(),cBack:cloudStrip(11,W*2,40,['#f8c49c','#e4a08e','#ca8486','#b47282'],120),cFront:cloudStrip(23,W*2,30,['#fcd4ac','#eeae96','#d48e8c','#bc7886'],90)};
  Object.assign(LAY,STAT);
}
// ---- materials ----
const STONE={top:['#f4d9a4','#e6c08a'],topS:['#8a7aa2','#7c6c96'],ly:['#d8a474','#c48e62'],lyS:['#6a5684','#5e4c78'],rx:['#7a5e86','#6c5278'],nose:'#fff0c8',noseS:'#a898bc',joint:'#b48a62',jointS:'#54446e',jointR:'#5a4468',
  winL:'#ffd27a',winL2:'#ffad52',winD:'#2a1e3c',frame:'#3c2c4a'};
function paint(){
  const [c,x]=mkc(W,H),im=x.createImageData(W,H),u=new Uint32Array(im.data.buffer);const {zb,wx,wy,wz,fc,bi,shadow,boxes}=LAY;
  const col=new Map();const UC=h=>{let v=col.get(h);if(v===undefined){v=U(h);col.set(h,v)}return v};
  for(let i=0;i<W*H;i++){const f=fc[i];if(f<0)continue;const b=boxes[bi[i]],X=wx[i],Y=wy[i],Z=wz[i],sh=shadow[i]>0;let h;
    if(b.m==='floor'){// cloister: flagstone walk around a square of grass
      const inG=X>WB+6&&X<XB-6&&Y>WB+6&&Y<XB-6;if(inG){h=sh?'#3c5a5a':'#7ca05a';if(hash(fl(X*2),fl(Y*2),9)>0.8)h=sh?'#34504e':'#94b868'}
      else{h=sh?'#5a4a72':'#d8b488';if(((X+0.3)%4<0.5)||((Y+0.3)%4<0.5))h=sh?'#4c3e64':'#b8946c'}
      if(f!==0)h=f===1?'#2e2244':'#4a3a5e'}
    else if(b.m==='loft'){h=f===0?'#e6c08a':f===1?'#5e4472':(sh?'#5e4c78':'#c48e62');
      // open arches of the bell loft
      if(f!==0){const u_=f===1?Y:X,v=Z;const cu=f===1?63:63;if(Math.abs(u_-cu)<2.2&&v>19&&v<27.5-(Math.abs(u_-cu)>1.4?0.8:0))h='#1c1430'}}
    else if(b.m==='cornice'){h=f===0?'#ffe0aa':f===1?'#5a4468':(sh?'#4e3e66':'#b07e58')}
    else if(b.m==='roof'){h=f===0?'#b04a3a':f===1?'#5a2032':'#8a3038'}
    else if(f===0){// step tops: slabs with a lit nose on the low edge and seams between slabs
      const S_=STONE;h=sh?S_.topS[0]:S_.top[0];
      // screen-space step edges: the row right under a lower tread is this tread's lit nose; the row right under a higher tread is a contact shadow
      const up=i-W;if(up>=0&&fc[up]>=0&&bi[up]!==bi[i]){const bu=boxes[bi[up]];if(bu.m==='stone'&&bu.z1<b.z1-0.1)h=sh?S_.noseS:S_.nose}
}
    else{// walls: brick courses every 2 units of height, staggered joints, windows at fixed world spots
      const S_=STONE,uu=f===1?Y:X,vv=Z;const lit=f===2&&!sh;
      let base=f===1?S_.rx[0]:(lit?S_.ly[0]:S_.lyS[0]);
      const course=Math.floor(vv/2),inc=vv-course*2;if(inc<0.5)base=f===1?S_.jointR:(lit?S_.joint:S_.jointS);
      else{const jj=Math.floor((uu+(course%2)*3)/6),ju=(uu+(course%2)*3)-jj*6;if(ju<0.5)base=f===1?S_.jointR:(lit?S_.joint:S_.jointS);else if((jj*7+course*3)%5===0)base=f===1?S_.rx[1]:(lit?S_.ly[1]:S_.lyS[1])}
      // the band at the top of every step column (the stair stringer) is smooth and catches the light
      if(b.m==='stone'&&b.step!=null&&vv>b.z1-3.2){base=f===1?'#8a6c92':(lit?'#e8bc86':'#76628e');if(vv>b.z1-0.6)base=f===1?'#a084a6':(lit?'#ffe0aa':'#9a86b2')}
      h=base;
      // windows: tall arches on the outer faces (x=69 / y=69), small slits on the courtyard walls
      const w=winAt(f,X,Y,Z);if(w)h=w}
    u[i]=UC(h)}
  x.putImageData(im,0,0);return c}
function winAt(f,X,Y,Z){
  const uu=f===1?Y:X;
  const outer=(f===1&&X>OUT-0.5)||(f===2&&Y>OUT-0.5);
  const rows=outer?[[4,6],[-12,7],[-30,8]]:[[-4,3]];
  for(const[zc,hh]of rows){const cols=outer?(f===1?[10,30,50,68]:[42,56,70]):(f===1?[50]:[24,40,56]);
    for(const cu of cols){const du=Math.abs(uu-cu),dz=Z-zc;const half=outer?2.2:1.2;
      // round-arched top: the opening narrows over the last unit
      const top=hh-(du>half-0.8?0.9:0);if(du<half+0.6&&dz>-0.6&&dz<top+0.6&&!(du<half&&dz>0&&dz<top))return STONE.frame;
      if(du<half&&dz>0&&dz<top){const lit=hash(cu,zc*3,f)>0.35;if(!lit)return STONE.winD;return dz<1.2?STONE.winL2:STONE.winL}}}
  return null}
const SKY=['#2c2a5c','#3a326a','#4c3a74','#62427a','#7c4a7c','#9a5478','#b8606e','#d47062','#e88a5c','#f4a65a','#fcc46c'];
function paintSky(){const [c,x]=mkc(W,H);const HS=[16,14,13,12,11,10,9,8,8,7,6];let y0=0;
  for(let i=0;i<SKY.length;i++){R(x,0,y0,W,HS[i],SKY[i]);if(i>0){const rs=rng(70+i);let xx=0;while(xx<W){const w=5+fl(rs()*26);if(rs()<0.5)R(x,xx,y0-1,w,1,SKY[i]);else R(x,xx,y0,w,1,SKY[i-1]);xx+=w+3+fl(rs()*22)}}y0+=HS[i]}
  R(x,0,y0,W,H-y0,SKY[SKY.length-1]);
  // sun, low on the left, sliced by haze
  const sx=26,sy=112,r=12;disc(x,sx,sy,r+7,'#fbb866');disc(x,sx,sy,r+3,'#fdd07c');
  for(let y=-r;y<=r;y++){const w=fl(Math.sqrt(r*r-y*y));if(y>3&&((sy+y)%4)<Math.min(2,(y-3)/4))continue;R(x,sx-w,sy+y,w*2+1,1,y<-5?'#fffbe0':'#fff0b0')}
  // far impossible towers, cool silhouettes
  const far=(cx,top,w,col,cap)=>{R(x,cx-w,top,w*2,H-top,col);R(x,cx-w-1,top+4,w*2+2,2,col);if(cap){poly(x,[[cx-w-2,top],[cx,top-cap],[cx+w+2,top]],col)}};
  far(304,58,5,'#6a4c7c',14);far(290,96,3,'#7a5480',8);far(12,92,3,'#a2627a',10);
  // windows on the far towers
  for(const[a,b]of[[304,68],[304,80],[304,94],[290,104],[12,102]])P(x,a,b,'#ffcf7a');
  // first stars and a thin moon
  const rs=rng(5);for(let i=0;i<26;i++){const a=fl(rs()*W),b=fl(rs()*30);P(x,a,b,rs()<0.3?'#fff4d0':'#8c86c0')}
  disc(x,262,16,5,'#fff0c8');disc(x,264,14,5,SKY[0]);
  return c}
// cloud sea: a wide strip of heaped cumulus built once as a mask, shaded by depth below its top edge (lit crowns, cool bellies), then scrolled
function cloudStrip(seed,w,h,cols,lumps){const [c,x]=mkc(w,h),mk=new Uint8Array(w*h),rs=rng(seed);
  for(let i=0;i<lumps;i++){const cx=rs()*w,r=3+rs()*rs()*11,cy=h-4-rs()*rs()*14-r*0.5;for(let yy=fl(cy-r);yy<h;yy++)for(let xx=fl(cx-r);xx<=cx+r;xx++){const dx=xx-cx,dy=Math.min(0,yy-cy);if(dx*dx+dy*dy<=r*r&&yy>=0)mk[yy*w+((xx%w)+w)%w]=1}}
  for(let xx=0;xx<w;xx++){let d=0;for(let yy=0;yy<h;yy++){const i=yy*w+xx;if(!mk[i]){d=0;continue}
      // left-lit: pixels whose left neighbour is empty get the bright rim
      const lft=mk[yy*w+((xx-1+w)%w)];const k=d===0?0:d<2?1:d<5?2:3;let col=cols[k];if(!lft&&d<6)col=cols[0];P(x,xx,yy,col);d++}}
  return c}
function cloudLayer(o,img,t,sp,y){const w=img.width,off=fl(t*sp)%w;o.drawImage(img,-off,y);o.drawImage(img,w-off,y)}
// ---- monks ----
// 7x12, drawn facing screen-right; o hood, f face, b robe, c cord, k hand, d feet. Shading is by screen column (sun on the left), applied after mirroring
const SPR={front:['...oo..','..oooo.','.oooof.','.oooff.','.ooooo.','..bbbb.','.bbbbbk','.cccbb.','.bbbbb.','.bbbbb.','bbbbbbb','.d...d.'],
          back:['..oo...','.oooo..','.ooooo.','.ooooo.','.ooooo.','..bbbb.','.bbbbb.','.bcccb.','.bbbbb.','.bbbbb.','bbbbbbb','.d...d.']};
const ORD=[{o:['#d07a3a','#8a4220','#5e2a18'],b:['#c86a30','#8a4020','#5a2618'],c:'#f0c060',f:'#f4c49a',k:'#f4c49a',d:'#2a1620'},
           {o:['#8a86b8','#4e4878','#342e58'],b:['#7c78aa','#48426e','#2e2850'],c:'#c8c4e0',f:'#e8b48a',k:'#e8b48a',d:'#1c1426'}];
function lanePts(off){// off>0 = toward the outside of the ring
  const a=5-off,b=XB+5+off,c=K+5-off;return[[a,a],[b,a],[b,b],[c,b],[c,c]]}
function laneLen(pts){let s=0;for(let i=0;i<4;i++)s+=Math.abs(pts[i+1][0]-pts[i][0])+Math.abs(pts[i+1][1]-pts[i][1]);return s}
function laneAt(pts,u){const tot=laneLen(pts);u=((u%tot)+tot)%tot;for(let i=0;i<4;i++){const dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1],l=Math.abs(dx)+Math.abs(dy);if(u<=l){const k=u/l;return{x:pts[i][0]+dx*k,y:pts[i][1]+dy*k,dx:Math.sign(dx),dy:Math.sign(dy)}}u-=l}return{x:pts[4][0],y:pts[4][1],dx:0,dy:-1}}
function topAt(x,y){let best=null;for(const b of LAY.boxes){if(b.m!=='stone'||b.step==null)continue;if(x>=b.x0&&x<b.x1&&y>=b.y0&&y<b.y1)best=b}return best?best.z1:0}
function drawMonk(o,zb,m){const {x,y,dx,dy,z,ord,fr,lamp}=m;const sx=rd(SX(x,y)),sy=rd(SY(x,y,z));
  const view=(dx>0||dy>0)?'front':'back',flip=(dx<0||dy>0);// sprites face screen-right; screen-left movers are mirrored
  const sp=SPR[view],C=ORD[ord];const ph=fr&3,bob=(ph===1||ph===3)?-1:0;
  const foot=DEP(x,y,z);
  const put=(px,py,colr,r)=>{if(px<0||px>=W||py<0||py>=H)return;const ii=py*W+px;if(foot+(12-r)*0.5+3>=zb[ii]){o.fillStyle=colr;o.fillRect(px,py,1,1)}};
  for(let r=0;r<12;r++){const row=sp[r];for(let i=0;i<7;i++){const ch=row[i];if(ch==='.')continue;
      const xi=flip?6-i:i;
      // stride: on the passing frames the feet come together under the robe
      if(r===11&&(ph===1||ph===3))continue;
      const sh=xi<=2?0:xi<=4?1:2;let colr;
      if(ch==='o')colr=C.o[sh];else if(ch==='b')colr=C.b[sh];else if(ch==='c')colr=C.c;else if(ch==='f')colr=xi<=3?C.f:'#c08870';else if(ch==='k')colr=C.k;else colr=C.d;
      put(sx-3+xi,sy-12+r+bob,colr,r)}}
  if(ph===1||ph===3)put(sx,sy-1+bob,C.d,11);
  // the lamp-bearer: a pole over the shoulder with a lantern swinging in front
  if(lamp){const fx=flip?-1:1,hx=sx+fx*4,hy=sy-7+bob;for(let k=0;k<5;k++)put(hx+fx*rd(k*0.4),hy-k,'#3a2418',9);const sw=rd(Math.sin(m.u*0.4));const lx=hx+fx*2+sw,ly=hy-3;
    put(lx,ly-1,'#3a2418',10);put(lx,ly,'#ffe8a0',10);put(lx-1,ly,'#ffb84a',10);put(lx+1,ly,'#ffb84a',10);put(lx,ly+1,'#ffb84a',10);put(lx,ly+2,'#3a2418',10)}}
// long evening shadow of a monk: a streak away from the sun along the tread it stands on
function monkShadow(o,m){const {x,y,z}=m;for(let k=2;k<=16;k++){const X=x+k*0.31,Y=y-k*0.29;const sx=rd(SX(X,Y)),sy=rd(SY(X,Y,z));
    for(const dxx of [0,-1]){const px=sx+dxx,py=sy;if(px<0||px>=W||py<0||py>=H)continue;const i=py*W+px;if(LAY.fc[i]!==0||Math.abs(LAY.wz[i]-z)>0.01||LAY.shadow[i])continue;
      o.fillStyle='#b494a8';o.fillRect(px,py,1,1)}}}
// an olive tree in the cloister garden, depth-tested against the walls
function tree(o,t){const X=30,Y=22,Z=ZF,sx=rd(SX(X,Y)),sy=rd(SY(X,Y,Z)),d0=DEP(X,Y,Z);const zb=LAY.zb;
  const put=(px,py,c,h)=>{if(px<0||px>=W||py<0||py>=H)return;if(d0+h*0.5+2>=zb[py*W+px]){o.fillStyle=c;o.fillRect(px,py,1,1)}};
  for(let k=0;k<7;k++){put(sx,sy-k,'#4a2e2a',k);if(k===3)put(sx+1,sy-k-1,'#4a2e2a',k)}
  for(let k=1;k<=12;k++)put(sx+k,sy+rd(k*0.05)-(k>3&&k<10?1:0),'#4a6a50',0),put(sx+k,sy+rd(k*0.05),'#4a6a50',0);
  const sw=Math.sin(t*0.05);
  const blobs=[[0,-11,6],[-4,-9,4],[4,-8,4],[1,-15,4]];
  for(const[bx,by,r]of blobs)for(let yy=-r;yy<=r;yy++)for(let xx=-r-1;xx<=r+1;xx++){if((xx*xx)/((r+1)*(r+1))+(yy*yy)/(r*r)>1)continue;const lean=rd(sw*(-(by+yy))/14);
    const lit=xx+yy<-2;const rim=xx<-r+1;put(sx+bx+xx+lean,sy+by+yy,rim||lit?'#d6c878':(yy>r-2?'#3c5448':'#6a8a50'),-(by+yy))}}
const LOOPT=1440;
function monksAt(t){const out=[];
  // the ascending order walks the inner lane clockwise on screen (A,B,C,D = up); the descending order walks the outer lane the other way
  const inner=lanePts(-2.5),outer=lanePts(2.5),Li=laneLen(inner),Lo=laneLen(outer);
  const NUP=9,NDN=6,vUp=Li/(LOOPT/4),vDn=Lo/(LOOPT/3);
  for(let i=0;i<NUP;i++){const u=t*vUp+i*Li/NUP+(i===3?2:0);const p=laneAt(inner,u);out.push({...p,u,ord:0,lamp:i===0,fr:fl((t*vUp+i*7)/2.6)})}
  for(let i=0;i<NDN;i++){const u=-(t*vDn)+i*Lo/NDN+5;const p=laneAt(outer,u);out.push({x:p.x,y:p.y,u,dx:-p.dx,dy:-p.dy,ord:1,lamp:i===2,fr:fl((t*vDn+i*5)/2.6)})}
  for(const m of out)m.z=topAt(m.x,m.y);
  // the seam: a monk near corner0 on its approach from flight D is drawn from the copy 27 nearer, so he passes in front of things correctly
  for(const m of out){if(m.x<WB+0.01&&m.y<WB+0.01&&false){}}
  return out}
function draw(s,g){const ang=s.opt.view||0;if(!LAY||LAY.ang!==ang)build(ang);const t=s.t;const [O,o]=LAY.O||(LAY.O=mkc(W,H));
  o.drawImage(LAY.sky,0,0);
  cloudLayer(o,LAY.cBack,t,0.06,128);R(o,0,168,W,12,'#c27a84');
  // birds wheeling around the bell loft
  for(let i=0;i<5;i++){const a=t*0.018+i*1.3,bx=SX(84,40)+Math.cos(a)*(30+i*6),by=SY(84,40,50)+Math.sin(a)*10-i*3;const up=((t>>2)+i)%2;P(o,bx,by,'#2a1e3c');P(o,bx-1,by-up,'#2a1e3c');P(o,bx+1,by-up,'#2a1e3c')}
  o.drawImage(LAY.base,0,0);
  tree(o,t);
  const ms=monksAt(t);ms.sort((a,b)=>DEP(a.x,a.y,a.z)-DEP(b.x,b.y,b.z));
  for(const m of ms)monkShadow(o,m);
  for(const m of ms)drawMonk(o,LAY.zb,m);
  cloudLayer(o,LAY.cFront,t,0.15,152);
  g.drawImage(O,0,0)}
SAMPLES.push({id:'stairs',name:'永登之塔',w:W,h:H,thumb:120,
  tags:['彭罗斯阶梯','等距投影的视线方向','逐像素深度缓冲','解析阴影','可转动的真实三维','两支永远走不完的队伍'],
  about:'一座修道院的屋顶是一圈台阶，一队修士顺时针一直往上走，另一队逆时针一直往下走，谁都走不到头。这不是画出来的错觉贴图：塔是一个真实的三维螺旋，绕一圈升高 27 格，同时朝我们靠近 27 格，在这个等距视角下这两段位移刚好抵消，所以首尾在屏幕上严丝合缝。光影、遮挡、投影全部是按这个三维形体逐像素算出来的。拖动下面的「转动视角」，镜头一偏，首尾就会错开，露出它其实是一段螺旋，修士走到接缝处会瞬移；回到正位，它又闭合成一圈。',
  controls:[{type:'range',key:'view',label:'转动视角',min:-40,max:40,def:0},{type:'button',label:'回到正位',act(s){s.opt.view=0}}],init(s){},tick(s){},draw,
  info(s){return (s.opt.view?'视角偏了 '+Math.abs(s.opt.view).toFixed(0)+'° · ':'')+'已登 '+fl(s.t*18*4/LOOPT)+' 级'}});
})();

// ================= 2. 无尽之窗 (infinite zoom) =================


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

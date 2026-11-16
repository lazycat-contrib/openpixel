// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

const PF={
'0':['.###.','#..##','#.#.#','##..#','#...#','#...#','.###.'],'1':['..#..','.##..','#.#..','..#..','..#..','..#..','#####'],
'2':['.###.','#...#','....#','..##.','.#...','#....','#####'],'3':['####.','....#','....#','.###.','....#','....#','####.'],
'4':['...#.','..##.','.#.#.','#..#.','#####','...#.','...#.'],'5':['#####','#....','####.','....#','....#','#...#','.###.'],
'6':['.###.','#....','#....','####.','#...#','#...#','.###.'],'7':['#####','....#','...#.','..#..','.#...','.#...','.#...'],
'8':['.###.','#...#','#...#','.###.','#...#','#...#','.###.'],'9':['.###.','#...#','#...#','.####','....#','....#','.###.'],
'A':['.###.','#...#','#...#','#####','#...#','#...#','#...#'],'B':['####.','#...#','#...#','####.','#...#','#...#','####.'],
'C':['.###.','#...#','#....','#....','#....','#...#','.###.'],'D':['####.','#...#','#...#','#...#','#...#','#...#','####.'],
'E':['#####','#....','#....','####.','#....','#....','#####'],'F':['#####','#....','#....','####.','#....','#....','#....'],
'G':['.###.','#...#','#....','#.###','#...#','#...#','.####'],'H':['#...#','#...#','#...#','#####','#...#','#...#','#...#'],
'I':['###','.#.','.#.','.#.','.#.','.#.','###'],'J':['..###','...#.','...#.','...#.','#..#.','#..#.','.##..'],
'K':['#...#','#..#.','#.#..','##...','#.#..','#..#.','#...#'],'L':['#....','#....','#....','#....','#....','#....','#####'],
'M':['#...#','##.##','#.#.#','#.#.#','#...#','#...#','#...#'],'N':['#...#','##..#','#.#.#','#..##','#...#','#...#','#...#'],
'O':['.###.','#...#','#...#','#...#','#...#','#...#','.###.'],'P':['####.','#...#','#...#','####.','#....','#....','#....'],
'Q':['.###.','#...#','#...#','#...#','#.#.#','#..#.','.##.#'],'R':['####.','#...#','#...#','####.','#.#..','#..#.','#...#'],
'S':['.####','#....','#....','.###.','....#','....#','####.'],'T':['#####','..#..','..#..','..#..','..#..','..#..','..#..'],
'U':['#...#','#...#','#...#','#...#','#...#','#...#','.###.'],'V':['#...#','#...#','#...#','#...#','.#.#.','.#.#.','..#..'],
'W':['#...#','#...#','#...#','#.#.#','#.#.#','##.##','#...#'],'X':['#...#','#...#','.#.#.','..#..','.#.#.','#...#','#...#'],
'Y':['#...#','#...#','.#.#.','..#..','..#..','..#..','..#..'],'Z':['#####','....#','...#.','..#..','.#...','#....','#####'],
'+':['.....','..#..','..#..','#####','..#..','..#..','.....'],'-':['.....','.....','.....','#####','.....','.....','.....'],
'!':['#','#','#','#','#','.','#'],'?':['.###.','#...#','....#','..##.','..#..','.....','..#..'],'.':['.','.','.','.','.','.','#'],
':':['.','.','#','.','.','#','.'],'/':['....#','....#','...#.','..#..','.#...','#....','#....'],'x':['.....','.....','#...#','.#.#.','..#..','.#.#.','#...#'],
'%':['##..#','##..#','...#.','..#..','.#...','#..##','#..##'],"'":['#','#','.','.','.','.','.'],'*':['.....','#.#.#','.###.','#####','.###.','#.#.#','.....'],
'(':['.#','#.','#.','#.','#.','#.','.#'],')':['#.','.#','.#','.#','.#','.#','#.'],',':['..','..','..','..','..','.#','#.'],'=':['.....','.....','#####','.....','#####','.....','.....'],
'<':['...#','..#.','.#..','#...','.#..','..#.','...#'],'>':['#...','.#..','..#.','...#','..#.','.#..','#...'],'#':['.#.#.','#####','.#.#.','.#.#.','.#.#.','#####','.#.#.'],
'_':['.....','.....','.....','.....','.....','.....','#####'],' ':['...','...','...','...','...','...','...']};
const TD=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001001001','111101111101111','111101111001111'];

// ================= NX: a true-colour pixel engine =================
// Every frame is drawn at 480x270 into albedo + per-pixel normal + emissive + light-gain buffers.
// Then lights are accumulated (normal-mapped, linear space), composed with haze and additive glow,
// graded, tone-mapped, and a bright-pass is handed to the display for bloom. Pixels stay crisp; light is soft.
const NX=(function(){
const W=480,H=270,N=W*H;
const alb=new Uint32Array(N),em=new Uint8Array(N),nxb=new Int8Array(N),nyb=new Int8Array(N),lk=new Uint8Array(N);
const LR=new Float32Array(N),LG=new Float32Array(N),LB=new Float32Array(N);
const AR=new Float32Array(N),AG=new Float32Array(N),AB=new Float32Array(N);
const OR=new Float32Array(N),OG=new Float32Array(N),OB=new Float32Array(N);
const ER=new Float32Array(N),EG=new Float32Array(N),EB=new Float32Array(N),bgf=new Uint8Array(N);
const img=new ImageData(W,H),o32=new Uint32Array(img.data.buffer);
const BW=W>>1,BH=H>>1,bimg=new ImageData(BW,BH),b32=new Uint32Array(bimg.data.buffer);
// sRGB byte -> linear, and linear -> display byte through a soft shoulder (bright light rolls off instead of clipping)
const LIN=new Float32Array(256);for(let i=0;i<256;i++)LIN[i]=Math.pow(i/255,2.2);
const TM=new Uint8Array(4097);for(let i=0;i<=4096;i++){let x=i/1024;const k=0.82;if(x>k)x=k+(1-k)*(1-Math.exp(-(x-k)/(1-k)));TM[i]=Math.round(Math.pow(Math.min(1,x),1/2.2)*255)}
const lin=c=>[LIN[c>>16&255],LIN[c>>8&255],LIN[c&255]];
// ---------------- state ----------------
let ox=0,oy=0,LKV=255;
const S={W,H,alb,em,nxb,nyb,lk,LR,LG,LB,AR,AG,AB,OR,OG,OB,img,bimg,lights:[],parts:[],
  amb:[[0.05,0.05,0.08],[0.05,0.05,0.08]],haze:0.0,hazeTint:[1,1,1],bloomThr:0.12,bloomK:1.0,lq:0,
  grade:{lift:[0,0,0],gain:[1,1,1],sat:1},vig:0.5,staticK:1,flash:0,flashC:[1,1,1],ca:0,post:null,
  cam:{x:0,y:0,tx:0,ty:0,trauma:0,kx:0,ky:0,sx:0,sy:0},frame:0,noBloom:false,raw:false};
let vigMap=new Float32Array(N),vigFor=-1;
function bakeVig(){if(vigFor===S.vig)return;vigFor=S.vig;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x+0.5)/W-0.5,dy=((y+0.5)/H-0.5)*0.75,d=Math.sqrt(dx*dx+dy*dy)/0.62;vigMap[y*W+x]=1-S.vig*Math.pow(Math.min(1,d),2.4)}}
// ---------------- random ----------------
let seed=1;const rnd=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const rr=(a,b)=>a+(b-a)*rnd(),ri=(a,b)=>Math.floor(a+(b-a+1)*rnd());
const hash=(a,b,c)=>{let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)+Math.imul(c|0,2147483647);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
const pmod=(a,m)=>((a%m)+m)%m;
// ---------------- colour helpers ----------------
const rgb=(r,g,b)=>((r&255)<<16)|((g&255)<<8)|(b&255);
const hex=s=>parseInt(s.replace('#',''),16);
const mix=(a,b,t)=>{const r=(a>>16&255)+((b>>16&255)-(a>>16&255))*t,g=(a>>8&255)+((b>>8&255)-(a>>8&255))*t,bl=(a&255)+((b&255)-(a&255))*t;return rgb(Math.round(r),Math.round(g),Math.round(bl))};
const mul=(a,k)=>rgb(Math.min(255,(a>>16&255)*k),Math.min(255,(a>>8&255)*k),Math.min(255,(a&255)*k));
// ---------------- frame start ----------------
function begin(){S.lights.length=0;alb.fill(0);em.fill(0);nxb.fill(0);nyb.fill(0);lk.fill(255);bgf.fill(0);AR.fill(0);AG.fill(0);AB.fill(0);LKV=255;ox=Math.round(S.cam.x+S.cam.sx);oy=Math.round(S.cam.y+S.cam.sy);if(BG)copyBG()}
// ---------------- a baked world-space background layer + static light maps (copied per frame, so big scenes cost nothing) ----------------
let BG=null;
function makeLayer(w,h){return{w,h,c:new Uint32Array(w*h),e:new Uint8Array(w*h),nx:new Int8Array(w*h),ny:new Int8Array(w*h),lk:new Uint8Array(w*h).fill(255),sl:null,fl:null}}
function lpx(L,x,y,c,e,nX,nY,g){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=L.w||y>=L.h)return;const q=y*L.w+x;L.c[q]=c;L.e[q]=e||0;L.nx[q]=nX||0;L.ny[q]=nY||0;if(g!=null)L.lk[q]=g}
function setBG(L){BG=L}
function copyBG(){const L=BG;for(let y=0;y<H;y++){const wy=y+oy;if(wy<0||wy>=L.h)continue;let x0=Math.max(0,-ox),x1=Math.min(W,L.w-ox);if(x1<=x0)continue;const q0=wy*L.w+x0+ox,p0=y*W+x0,n=x1-x0;
  alb.set(L.c.subarray(q0,q0+n),p0);em.set(L.e.subarray(q0,q0+n),p0);nxb.set(L.nx.subarray(q0,q0+n),p0);nyb.set(L.ny.subarray(q0,q0+n),p0);lk.set(L.lk.subarray(q0,q0+n),p0);bgf.fill(1,p0,p0+n)}}
// bake static lights into two world maps: one with the layer's normals, one for flat (moving) things passing through
function bakeStatic(L,lights,amb){const n=L.w*L.h;const sl=[new Float32Array(n),new Float32Array(n),new Float32Array(n)],fl=[new Float32Array(n),new Float32Array(n),new Float32Array(n)];
  for(let y=0;y<L.h;y++){const a=amb(y);for(let x=0;x<L.w;x++){const q=y*L.w+x;for(let k=0;k<3;k++){sl[k][q]=a[k];fl[k][q]=a[k]}}}
  for(const l of lights){const c=lin(l.c),r=l.r,r2=r*r,z=l.z==null?r*0.35:l.z,i=l.i==null?1:l.i;
    for(let y=Math.max(0,Math.floor(l.y-r));y<=Math.min(L.h-1,Math.ceil(l.y+r));y++)for(let x=Math.max(0,Math.floor(l.x-r));x<=Math.min(L.w-1,Math.ceil(l.x+r));x++){const dx=x+0.5-l.x,dy=y+0.5-l.y,d2=dx*dx+dy*dy;if(d2>=r2)continue;
      let a=1-d2/r2;a*=a;const q=y*L.w+x,inv=1/Math.sqrt(d2+z*z);const nX=L.nx[q]/127,nY=L.ny[q]/127,nz=Math.sqrt(Math.max(0,1-nX*nX-nY*nY));
      const nd=Math.max(0,(-dx*nX-dy*nY+z*nz)*inv)*L.lk[q]/255,fd=z*inv;for(let k=0;k<3;k++){sl[k][q]+=c[k]*i*a*nd;fl[k][q]+=c[k]*i*a*fd}}}
  L.sl=sl;L.fl=fl}
function world(){ox=Math.round(S.cam.x+S.cam.sx);oy=Math.round(S.cam.y+S.cam.sy)}
function screen(){ox=0;oy=0}
function setOff(x,y){ox=x;oy=y}
function gain(v){LKV=v}
// ---------------- pixel writers (world coordinates unless screen() is on) ----------------
function px(x,y,c,e,nX,nY){x=x-ox;y=y-oy;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;alb[p]=c;em[p]=e||0;nxb[p]=nX||0;nyb[p]=nY||0;lk[p]=LKV;bgf[p]=0}
function pxa(x,y,c,a){x=x-ox;y=y-oy;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;alb[p]=mix(alb[p],c,a)}
function emAdd(x,y,e){x=x-ox;y=y-oy;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;em[p]=Math.min(255,em[p]+e)}
function rect(x,y,w,h,c,e,nX,nY){x=Math.round(x);y=Math.round(y);for(let j=0;j<h;j++)for(let i=0;i<w;i++)px(x+i,y+j,c,e,nX,nY)}
function recta(x,y,w,h,c,a){x=Math.round(x);y=Math.round(y);for(let j=0;j<h;j++)for(let i=0;i<w;i++)pxa(x+i,y+j,c,a)}
function line(x0,y0,x1,y1,c,e){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;
  for(let k=0;k<2000;k++){px(x0,y0,c,e);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
function disc(cx,cy,r,c,e){const r2=r*r;for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy;if(dx*dx+dy*dy<=r2)px(x,y,c,e)}}
function ring(cx,cy,r,w,c,e){const a=(r-w)*(r-w),b=r*r;for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy,d=dx*dx+dy*dy;if(d<=b&&d>=a)px(x,y,c,e)}}
// shaded ball with real normals: fn(nx,ny,nz)->colour
function ball(cx,cy,rx,ry,fn,e){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const u=(x+0.5-cx)/rx,v=(y+0.5-cy)/ry,d=u*u+v*v;if(d>1)continue;const nz=Math.sqrt(1-d);const c=fn(u,v,nz,x,y);if(c==null)continue;px(x,y,c,e,Math.round(u*120),Math.round(v*120))}}
// ---------------- additive light-only pixels (sparks, flares). They add to the final image and to bloom ----------------
function addPx(x,y,c,k){x=Math.round(x)-ox;y=Math.round(y)-oy;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;AR[p]+=LIN[c>>16&255]*k;AG[p]+=LIN[c>>8&255]*k;AB[p]+=LIN[c&255]*k}
function glow(cx,cy,r,c,k){const sx=cx-ox,sy=cy-oy,cr=LIN[c>>16&255]*k,cg=LIN[c>>8&255]*k,cb=LIN[c&255]*k,r2=r*r;
  const x0=Math.max(0,Math.floor(sx-r)),x1=Math.min(W-1,Math.ceil(sx+r)),y0=Math.max(0,Math.floor(sy-r)),y1=Math.min(H-1,Math.ceil(sy+r));
  for(let y=y0;y<=y1;y++){const dy=y+0.5-sy;for(let x=x0;x<=x1;x++){const dx=x+0.5-sx,d=dx*dx+dy*dy;if(d>=r2)continue;let a=1-d/r2;a=a*a*a;const p=y*W+x;AR[p]+=cr*a;AG[p]+=cg*a;AB[p]+=cb*a}}}
// ---------------- lights ----------------
function light(x,y,r,c,i,z){S.lights.push({x,y,r,c:typeof c==='number'?lin(c):c,i:i==null?1:i,z:z==null?r*0.35:z})}
const NZ=new Float32Array(65536);for(let i=0;i<256;i++)for(let j=0;j<256;j++){const a=(i<<24>>24)/127,b=(j<<24>>24)/127;NZ[(i<<8)|j]=Math.sqrt(Math.max(0,1-a*a-b*b))}
function applyLights(){const A0=S.amb[0],A1=S.amb[1];
  if(BG&&BG.sl){const k=S.staticK,L=BG,s0=L.sl[0],s1=L.sl[1],s2=L.sl[2],f0=L.fl[0],f1=L.fl[1],f2=L.fl[2];for(let y=0;y<H;y++){const wy=y+oy;for(let x=0;x<W;x++){const p=y*W+x,wx=x+ox;if(wy<0||wy>=L.h||wx<0||wx>=L.w){LR[p]=LG[p]=LB[p]=0.02;continue}const q=wy*L.w+wx;
    if(bgf[p]){LR[p]=s0[q]*k;LG[p]=s1[q]*k;LB[p]=s2[q]*k}else{const kk=k*lk[p]/255;LR[p]=f0[q]*kk;LG[p]=f1[q]*kk;LB[p]=f2[q]*kk}}}}
  else for(let y=0;y<H;y++){const t=y/(H-1),ar=A0[0]+(A1[0]-A0[0])*t,ag=A0[1]+(A1[1]-A0[1])*t,ab=A0[2]+(A1[2]-A0[2])*t;const o=y*W;for(let x=0;x<W;x++){LR[o+x]=ar;LG[o+x]=ag;LB[o+x]=ab}}
  for(const L of S.lights){const sx=L.x-ox,sy=L.y-oy,r=L.r,r2=r*r,z=L.z,z2=z*z,cr=L.c[0]*L.i,cg=L.c[1]*L.i,cb=L.c[2]*L.i;
    const x0=Math.max(0,Math.floor(sx-r)),x1=Math.min(W-1,Math.ceil(sx+r)),y0=Math.max(0,Math.floor(sy-r)),y1=Math.min(H-1,Math.ceil(sy+r));
    for(let y=y0;y<=y1;y++){const dy=y+0.5-sy;let p=y*W+x0;for(let x=x0;x<=x1;x++,p++){const dx=x+0.5-sx,d2=dx*dx+dy*dy;if(d2>=r2)continue;
      const g=lk[p];if(g===0)continue;let a=1-d2/r2;a*=a;
      const nX=nxb[p],nY=nyb[p];const ndl=(nX===0&&nY===0?z:(-dx*nX-dy*nY)*0.007874+z*NZ[((nX&255)<<8)|(nY&255)])/Math.sqrt(d2+z2);if(ndl<=0)continue;const f=a*ndl*g*0.0039216;
      LR[p]+=cr*f;LG[p]+=cg*f;LB[p]+=cb*f}}}}
// ---------------- compose: albedo x light + emissive + haze + additive -> linear output ----------------
function compose(){const hz=S.haze,ht=S.hazeTint,q=S.lq;
  for(let p=0;p<N;p++){const c=alb[p],r=LIN[c>>16&255],g=LIN[c>>8&255],b=LIN[c&255];let lr,lg,lb;
    if(lk[p]===0){lr=lg=lb=1}else{lr=LR[p];lg=LG[p];lb=LB[p];if(q){lr=Math.round(lr*q)/q;lg=Math.round(lg*q)/q;lb=Math.round(lb*q)/q}}
    const e=em[p]*(2.2/255),er=r*e+AR[p],eg=g*e+AG[p],eb=b*e+AB[p];ER[p]=er;EG[p]=eg;EB[p]=eb;
    OR[p]=r*lr+er+LR[p]*hz*ht[0];OG[p]=g*lg+eg+LG[p]*hz*ht[1];OB[p]=b*lb+eb+LB[p]*hz*ht[2]}}
function composeRaw(){ER.fill(0);EG.fill(0);EB.fill(0);for(let p=0;p<N;p++){const c=alb[p];OR[p]=LIN[c>>16&255];OG[p]=LIN[c>>8&255];OB[p]=LIN[c&255]}}
// ---------------- final: grade, vignette, flash, tone map, bloom bright-pass ----------------
function finish(){bakeVig();const G=S.grade,l0=G.lift[0],l1=G.lift[1],l2=G.lift[2],g0=G.gain[0],g1=G.gain[1],g2=G.gain[2],sat=G.sat,fl=S.flash,fc=S.flashC,raw=S.raw;
  for(let p=0;p<N;p++){let r=OR[p],g=OG[p],b=OB[p];
    if(!raw){r=l0+r*g0;g=l1+g*g1;b=l2+b*g2;if(sat!==1){const y=r*0.3+g*0.59+b*0.11;r=y+(r-y)*sat;g=y+(g-y)*sat;b=y+(b-y)*sat}
      if(lk[p]!==0){const v=vigMap[p];r*=v;g*=v;b*=v}
      if(fl>0){r=r*(1-fl)+fc[0]*fl;g=g*(1-fl)+fc[1]*fl;b=b*(1-fl)+fc[2]*fl}}
    OR[p]=r;OG[p]=g;OB[p]=b;
    const ir=r<=0?0:r>=4?4096:(r*1024)|0,ig=g<=0?0:g>=4?4096:(g*1024)|0,ib=b<=0?0:b>=4?4096:(b*1024)|0;
    o32[p]=0xff000000|TM[ib]<<16|TM[ig]<<8|TM[ir]}
  if(S.ca>0&&!raw){const k=S.ca;const row=new Uint32Array(W);for(let y=0;y<H;y++){const o=y*W;row.set(o32.subarray(o,o+W));for(let x=0;x<W;x++){const s=Math.round(k*(x-W/2)/(W/2));
    const xr=Math.max(0,Math.min(W-1,x-s)),xb=Math.max(0,Math.min(W-1,x+s));o32[o+x]=(row[x]&0xff00ff00)|(row[xr]&0xff)|(row[xb]&0xff0000)}}}
  // bloom bright-pass at half resolution
  const th=S.bloomThr,bk=S.bloomK;
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const p=(y*2)*W+x*2;let r=0,g=0,b=0;
    for(let k=0;k<4;k++){const q=p+(k&1)+(k>>1)*W;let v=ER[q]-th;if(v>0)r+=v;v=OR[q]-1.2;if(v>0)r+=v*0.5;v=EG[q]-th;if(v>0)g+=v;v=OG[q]-1.2;if(v>0)g+=v*0.5;v=EB[q]-th;if(v>0)b+=v;v=OB[q]-1.2;if(v>0)b+=v*0.5}
    r*=bk*0.25;g*=bk*0.25;b*=bk*0.25;const cr=Math.min(255,Math.sqrt(r)*255)|0,cg=Math.min(255,Math.sqrt(g)*255)|0,cb=Math.min(255,Math.sqrt(b)*255)|0;
    b32[y*BW+x]=0xff000000|cb<<16|cg<<8|cr}}
const PT={};function render(){let t=performance.now();applyLights();PT.l=performance.now()-t;t=performance.now();if(S.raw)composeRaw();else compose();PT.c=performance.now()-t;t=performance.now();if(S.post&&!S.raw)S.post(S);PT.p=performance.now()-t;t=performance.now();finish();PT.f=performance.now()-t}
// ---------------- sprites: rows of characters + a palette map. map value: colour | [colour, emissive] ----------------
function spr(rows,map){const h=rows.length,w=Math.max(...rows.map(r=>r.length));const c=new Int32Array(w*h).fill(-1),e=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const ch=rows[y][x];if(ch==='.'||ch===' ')continue;const m=map[ch];if(m==null)throw new Error('sprite char '+ch);
    if(Array.isArray(m)){c[y*w+x]=m[0];e[y*w+x]=m[1]}else c[y*w+x]=m}
  const s={w,h,c,e,nx:new Int8Array(w*h),ny:new Int8Array(w*h)};return s}
function sprFn(w,h,fn){const c=new Int32Array(w*h).fill(-1),e=new Uint8Array(w*h),nx=new Int8Array(w*h),ny=new Int8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=fn(x,y);if(v==null)continue;const i=y*w+x;if(typeof v==='number')c[i]=v;else{c[i]=v[0];e[i]=v[1]||0;nx[i]=v[2]||0;ny[i]=v[3]||0}}
  return{w,h,c,e,nx,ny}}
// auto normals: a "pillow" height from the distance to the silhouette edge; k = bevel width, str = steepness
function pillow(s,k,str){const{w,h,c}=s;k=k||3;str=str==null?1:str;const hm=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(c[y*w+x]<0)continue;let d=k;
    for(let j=-k;j<=k;j++)for(let i=-k;i<=k;i++){const X=x+i,Y=y+j;const out=X<0||Y<0||X>=w||Y>=h||c[Y*w+X]<0;if(out){const dd=Math.max(Math.abs(i),Math.abs(j))-0.5;if(dd<d)d=dd}}
    hm[y*w+x]=Math.max(0,d)/k}
  const at=(x,y)=>x<0||y<0||x>=w||y>=h?0:hm[y*w+x];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(c[y*w+x]<0)continue;let gx=(at(x+1,y)-at(x-1,y))*str,gy=(at(x,y+1)-at(x,y-1))*str;const l=Math.hypot(gx,gy,1);
    s.nx[y*w+x]=Math.round(-gx/l*127);s.ny[y*w+x]=Math.round(-gy/l*127)}
  return s}
// normals from an explicit height function h(x,y) (bricks, panels)
function heightN(w,h,hf,str){const nx=new Int8Array(w*h),ny=new Int8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const gx=(hf(x+1,y)-hf(x-1,y))*str,gy=(hf(x,y+1)-hf(x,y-1))*str,l=Math.hypot(gx,gy,1);nx[y*w+x]=Math.round(-gx/l*127);ny[y*w+x]=Math.round(-gy/l*127)}return{nx,ny}}
// outline a sprite (adds a 1px border in colour oc on transparent neighbours; grows the sprite by 1 on every side)
function outline(s,oc,diag){const w=s.w+2,h=s.h+2;const o={w,h,c:new Int32Array(w*h).fill(-1),e:new Uint8Array(w*h),nx:new Int8Array(w*h),ny:new Int8Array(w*h)};
  for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const i=y*s.w+x,j=(y+1)*w+x+1;o.c[j]=s.c[i];o.e[j]=s.e[i];o.nx[j]=s.nx[i];o.ny[j]=s.ny[i]}
  const src=o.c.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(src[y*w+x]>=0)continue;let n=false;
    for(const[dx,dy]of diag?[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]:[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&src[Y*w+X]>=0){n=true;break}}
    if(n){o.c[y*w+x]=oc;o.nx[y*w+x]=0}}
  return o}
function flipX(s){const o={w:s.w,h:s.h,c:new Int32Array(s.w*s.h),e:new Uint8Array(s.w*s.h),nx:new Int8Array(s.w*s.h),ny:new Int8Array(s.w*s.h)};
  for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const i=y*s.w+x,j=y*s.w+s.w-1-x;o.c[j]=s.c[i];o.e[j]=s.e[i];o.nx[j]=-s.nx[i];o.ny[j]=s.ny[i]}return o}
// blit: o = {flip, white (0..1 flash to white), tint [colour, amount], em (add emissive), sil (draw as one colour), a (alpha 0..1)}
function blit(s,x,y,o){x=Math.round(x);y=Math.round(y);const fl=o&&o.flip,wh=o&&o.white,ti=o&&o.tint,ea=(o&&o.em)||0,sil=o&&o.sil,al=o&&o.a;
  for(let j=0;j<s.h;j++){const Y=y+j-oy;if(Y<0||Y>=H)continue;for(let i=0;i<s.w;i++){const si=j*s.w+(fl?s.w-1-i:i);let c=s.c[si];if(c<0)continue;const X=x+i-ox;if(X<0||X>=W)continue;
    const p=Y*W+X;bgf[p]=0;if(sil!=null){if(al!=null&&al<1)alb[p]=mix(alb[p],sil,al);else{alb[p]=sil;em[p]=ea;lk[p]=LKV;nxb[p]=0;nyb[p]=0}continue}
    if(wh)c=mix(c,0xffffff,wh);if(ti)c=mix(c,ti[0],ti[1]);
    if(al!=null&&al<1){alb[p]=mix(alb[p],c,al);continue}
    alb[p]=c;em[p]=Math.min(255,s.e[si]+ea+(wh?Math.round(wh*90):0));nxb[p]=fl?-s.nx[si]:s.nx[si];nyb[p]=s.ny[si];lk[p]=LKV}}}
// general transformed draw: anchor (ax,ay) in sprite pixels lands on (x,y); rot radians; sx,sy scale (squash/stretch); nearest sampling
function blitX(s,x,y,o){const ax=o.ax==null?s.w/2:o.ax,ay=o.ay==null?s.h/2:o.ay,rot=o.rot||0,sx=o.sx||1,sy=o.sy||1,fl=o.flip,wh=o.white||0,ea=o.em||0,sil=o.sil;
  if(!rot&&sx===1&&sy===1){blit(s,x-(fl?s.w-ax:ax),y-ay,o);return}
  const ca=Math.cos(rot),sa=Math.sin(rot);const R=Math.hypot(Math.max(ax,s.w-ax)*Math.abs(sx),Math.max(ay,s.h-ay)*Math.abs(sy))+2;
  for(let Y=Math.floor(y-R);Y<=Math.ceil(y+R);Y++){const yy=Y-oy;if(yy<0||yy>=H)continue;for(let X=Math.floor(x-R);X<=Math.ceil(x+R);X++){const xx=X-ox;if(xx<0||xx>=W)continue;
    const dx=X+0.5-x,dy=Y+0.5-y;let u=(dx*ca+dy*sa)/sx,v=(-dx*sa+dy*ca)/sy;if(fl)u=-u;const i=Math.floor(u+ax),j=Math.floor(v+ay);if(i<0||j<0||i>=s.w||j>=s.h)continue;
    const si=j*s.w+i;let c=s.c[si];if(c<0)continue;const p=yy*W+xx;bgf[p]=0;
    if(sil!=null){alb[p]=sil;em[p]=ea;lk[p]=LKV;nxb[p]=0;nyb[p]=0;continue}
    if(wh)c=mix(c,0xffffff,wh);alb[p]=c;em[p]=Math.min(255,s.e[si]+ea+(wh?Math.round(wh*90):0));
    let nX=s.nx[si]*(fl?-1:1),nY=s.ny[si];nxb[p]=Math.round(nX*ca-nY*sa);nyb[p]=Math.round(nX*sa+nY*ca);lk[p]=LKV}}}
// a writable sprite grid (characters are composed into one, then outlined and given normals)
function grid(w,h){const g={w,h,c:new Int32Array(w*h).fill(-1),e:new Uint8Array(w*h),nx:new Int8Array(w*h),ny:new Int8Array(w*h)};
  g.set=(x,y,c,e)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=w||y>=h)return;g.c[y*w+x]=c;g.e[y*w+x]=e||0};
  g.get=(x,y)=>{x=Math.round(x);y=Math.round(y);return x<0||y<0||x>=w||y>=h?-1:g.c[y*w+x]};
  g.stamp=(s,x,y)=>{for(let j=0;j<s.h;j++)for(let i=0;i<s.w;i++){const v=s.c[j*s.w+i];if(v>=0)g.set(x+i,y+j,v,s.e[j*s.w+i])}};return g}
// a screen-space image layer for parallax (opaque where a=1); par() copies it with horizontal wrap, light gain g
function mkImg(w,h){return{w,h,c:new Uint32Array(w*h),e:new Uint8Array(w*h),a:new Uint8Array(w*h),nx:new Int8Array(w*h),ny:new Int8Array(w*h)}}
function ipx(L,x,y,c,e,nX,nY){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=L.w||y>=L.h)return;const q=y*L.w+x;L.c[q]=c;L.e[q]=e||0;L.a[q]=1;L.nx[q]=nX||0;L.ny[q]=nY||0}
function par(L,sx,sy,g,wrap){sx=Math.round(sx);sy=Math.round(sy);for(let y=0;y<L.h;y++){const Y=sy+y;if(Y<0||Y>=H)continue;const r=y*L.w,o=Y*W;for(let x=0;x<W;x++){let u=x-sx;if(wrap!==false)u=((u%L.w)+L.w)%L.w;else if(u<0||u>=L.w)continue;const q=r+u;if(!L.a[q])continue;const p=o+x;alb[p]=L.c[q];em[p]=L.e[q];nxb[p]=L.nx[q];nyb[p]=L.ny[q];lk[p]=g==null?255:g;bgf[p]=0}}}
// ---------------- particles ----------------
// k: 'px' pixel, 'spark' streak along its velocity (additive), 'glow' soft additive blob, 'smoke' albedo puff, 'chunk' solid bit with gravity and bounce, 'ring' expanding ring, 'fn' custom draw
function part(o){const q=Object.assign({x:0,y:0,vx:0,vy:0,g:0,dr:1,life:30,t:0,k:'px',c:0xffffff,e:255,sz:1,i:1},o);S.parts.push(q);return q}
function stepParts(floor){const ps=S.parts;let n=0;for(let i=0;i<ps.length;i++){const q=ps[i];q.t++;if(q.t>=q.life)continue;q.vy+=q.g;q.vx*=q.dr;q.vy*=q.dr;q.x+=q.vx;q.y+=q.vy;
    if(q.upd)q.upd(q);
    if(floor&&(q.k==='chunk'||q.bounce)){const fy=floor(q.x,q.y);if(fy!=null&&q.y>=fy){q.y=fy;if(Math.abs(q.vy)>0.6){q.vy*=-0.45;q.vx*=0.7}else{q.vy=0;q.vx*=0.85}}}
    ps[n++]=q}ps.length=n}
function drawParts(layer){for(const q of S.parts){if((q.layer||0)!==(layer||0))continue;const u=q.t/q.life,f=1-u;
  switch(q.k){
  case 'px':if(q.add)addPx(q.x,q.y,q.c,q.i*f);else px(Math.round(q.x),Math.round(q.y),q.c,Math.round(q.e*f));break;
  case 'spark':{const L=Math.max(1,Math.hypot(q.vx,q.vy)*(q.len||1.6));const a=Math.atan2(q.vy,q.vx);const n=Math.ceil(L);for(let k=0;k<=n;k++){const s=k/n;addPx(q.x-Math.cos(a)*L*s,q.y-Math.sin(a)*L*s,q.c,q.i*f*(1-s*0.7)*2)}
    px(Math.round(q.x),Math.round(q.y),q.c2||0xffffff,Math.round(255*f));break}
  case 'glow':glow(q.x,q.y,q.sz*(q.grow?1+u*q.grow:1),q.c,q.i*(q.fade===false?1:f));break;
  case 'smoke':{const r=q.sz*(1+u*(q.grow||1.5));const a=(q.a||0.6)*f;for(let y=Math.floor(q.y-r);y<=q.y+r;y++)for(let x=Math.floor(q.x-r);x<=q.x+r;x++){const dx=x+0.5-q.x,dy=y+0.5-q.y;if(dx*dx+dy*dy<=r*r)pxa(x,y,q.c,a)}break}
  case 'chunk':rect(Math.round(q.x),Math.round(q.y)-q.sz+1,q.sz,q.sz,q.c,q.t<q.life*0.3?q.e:0);break;
  case 'ring':ring(q.x,q.y,q.sz+(q.r1-q.sz)*Math.sqrt(u),Math.max(1,(q.w||3)*f),q.c,Math.round(255*f));break;
  case 'fn':q.draw(q,u);break}}}
// ---------------- camera: smoothed follow + trauma shake + kick ----------------
function camStep(){const c=S.cam;c.x+=(c.tx-c.x)*0.12;c.y+=(c.ty-c.y)*0.12;c.trauma=Math.max(0,c.trauma-0.03);const s=c.trauma*c.trauma,t=S.frame;
  c.sx=s*9*(Math.sin(t*1.7)*0.6+Math.sin(t*3.1+1)*0.4)+c.kx;c.sy=s*7*(Math.sin(t*2.3+2)*0.6+Math.sin(t*4.7)*0.4)+c.ky;c.kx*=0.7;c.ky*=0.7;
  S.flash=Math.max(0,S.flash-0.08);S.ca=Math.max(0,S.ca-0.25)}
function shake(a){S.cam.trauma=Math.min(1,S.cam.trauma+a)}
function kick(dx,dy){S.cam.kx+=dx;S.cam.ky+=dy}
// ---------------- text: 5x7 pixel font, 3x5 digits, CJK rasterised from the system font at 4x ----------------
const S8=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
function ptext(str,x,y,c,o){o=o||{};const sc=o.scale||1,e=o.em||0;str=String(str).toUpperCase();let w=0;for(const ch of str){const g=PF[ch]||PF[' '];w+=(g[0].length+1)*sc}w-=sc;
  if(o.align==='c')x-=Math.floor(w/2);else if(o.align==='r')x-=w;x=Math.round(x);y=Math.round(y);
  const pass=(col,dx,dy,ee)=>{let cx=x;for(const ch of str){const g=PF[ch]||PF[' '];for(let j=0;j<7;j++)for(let i=0;i<g[j].length;i++)if(g[j][i]==='#')rect(cx+i*sc+dx,y+j*sc+dy,sc,sc,col,ee);cx+=(g[0].length+1)*sc}};
  if(o.ink!=null)for(const[dx,dy]of S8)pass(o.ink,dx,dy,0);if(o.shadow!=null)pass(o.shadow,sc,sc,0);pass(c,0,0,e);return w}
function tiny(str,x,y,c,e){let cx=Math.round(x);for(const ch of String(str)){const b=TD[+ch];if(b&&ch!==' ')for(let i=0;i<15;i++)if(b[i]==='1')px(cx+i%3,y+Math.floor(i/3),c,e||0);cx+=4}return cx-x-1}
const GC=new Map();let gcv=null,gcg=null;
const FAM='"PingFang SC","Hiragino Sans GB","Noto Sans SC","Noto Sans CJK SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif';
const FAMS={kai:'"Kaiti SC","STKaiti","KaiTi","AR PL UKai CN","Noto Serif SC","Noto Serif CJK SC","Songti SC",serif',serif:'"Songti SC","Noto Serif SC","Noto Serif CJK SC","SimSun",serif'};
function glyph(ch,size,bold,fam){const key=ch+'|'+size+'|'+(bold?1:0)+'|'+(fam||'');let G=GC.get(key);if(G)return G;
  if(ch===' '){G={w:Math.round(size*0.35),px:[]};GC.set(key,G);return G}
  const K=4;if(!gcv){gcv=document.createElement('canvas');gcg=gcv.getContext('2d',{willReadFrequently:true})}
  const f=(bold?'bold ':'')+(size*K)+'px '+(fam?FAMS[fam]||fam:FAM);gcg.font=f;const mw=gcg.measureText(ch).width;const w=Math.max(1,Math.round(mw/K)),h=size+3;
  gcv.width=(w+2)*K;gcv.height=h*K;gcg.font=f;gcg.textBaseline='top';gcg.fillStyle='#fff';gcg.fillText(ch,K,K*0.5);
  const d=gcg.getImageData(0,0,gcv.width,gcv.height).data,pp=[],CW=gcv.width;
  for(let y=0;y<h;y++)for(let x=0;x<w+2;x++){let s=0;for(let j=0;j<K;j++)for(let i=0;i<K;i++)s+=d[((y*K+j)*CW+x*K+i)*4+3];if(s/(K*K*255)>(bold?0.42:0.34))pp.push(x-1,y)}
  G={w,px:pp};GC.set(key,G);return G}
function measure(str,size,bold,fam){let w=0;for(const ch of String(str))w+=glyph(ch,size,bold,fam).w;return w}
// o: size, bold, align, ink (8-way outline), shadow, em, sp (letter spacing)
function text(str,x,y,c,o){o=o||{};const size=o.size||12,sp=o.sp||0;str=String(str);const w=measure(str,size,o.bold,o.fam)+sp*(str.length-1);if(o.align==='c')x-=Math.floor(w/2);else if(o.align==='r')x-=w;x=Math.round(x);y=Math.round(y);
  const pass=(col,dx,dy,ee,list)=>{let cx=x;for(const ch of str){const G=glyph(ch,size,o.bold,o.fam);const q=G.px;for(let i=0;i<q.length;i+=2)for(const[ax,ay]of list)px(cx+q[i]+dx+ax,y+q[i+1]+dy+ay,col,ee);cx+=G.w+sp}};
  if(o.ink!=null)pass(o.ink,0,0,o.inkEm||0,S8);if(o.shadow!=null)pass(o.shadow,1,1,0,[[0,0]]);pass(c,0,0,o.em||0,[[0,0]]);return w}
// ---------------- sound: tiny WebAudio synth, nothing loaded ----------------
const SND={on:false,ctx:null,last:{},master:null,nb:null};
function sndInit(){if(SND.ctx)return;try{const C=new (window.AudioContext||window.webkitAudioContext)();SND.ctx=C;SND.master=C.createGain();SND.master.gain.value=0.5;
  const comp=C.createDynamicsCompressor();SND.master.connect(comp);comp.connect(C.destination);
  const nb=C.createBuffer(1,C.sampleRate,C.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.nb=nb}catch(e){SND.ctx=null}}
function tone(type,f0,f1,dur,vol,t0,dest){const C=SND.ctx,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);o.connect(g);g.connect(dest||SND.master);o.start(t0);o.stop(t0+dur+0.02)}
function noise(dur,vol,t0,ftype,f0,f1,q){const C=SND.ctx,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=SND.nb;f.type=ftype||'lowpass';f.frequency.setValueAtTime(f0||3000,t0);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1||f0||3000),t0+dur);f.Q.value=q||0.7;
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);s.connect(f);f.connect(g);g.connect(SND.master);s.start(t0,Math.random()*0.5);s.stop(t0+dur+0.02)}
const SFX={
  shot:(t,p)=>{tone('square',900*p,180*p,0.07,0.07,t);noise(0.05,0.12,t,'highpass',3000,1500)},
  pew:(t,p)=>{tone('sawtooth',1400*p,300*p,0.09,0.05,t);tone('square',700*p,200*p,0.06,0.04,t)},
  hit:(t,p)=>{noise(0.08,0.25,t,'lowpass',2600*p,400);tone('sine',180*p,60,0.08,0.25,t)},
  crit:(t,p)=>{noise(0.12,0.3,t,'lowpass',5000,500);tone('square',1600*p,400,0.1,0.06,t);tone('sine',220,50,0.14,0.3,t)},
  boom:(t,p)=>{noise(0.7,0.55,t,'lowpass',1800*p,60);tone('sine',110*p,28,0.6,0.6,t);noise(0.15,0.3,t,'highpass',4000,1000)},
  big:(t,p)=>{noise(1.6,0.7,t,'lowpass',2400,40);tone('sine',90,22,1.4,0.8,t);tone('sawtooth',220,30,1.0,0.12,t)},
  coin:(t,p)=>{tone('square',988*p,988*p,0.05,0.05,t);tone('square',1319*p,1319*p,0.12,0.05,t+0.05)},
  jump:(t,p)=>{tone('square',260*p,620*p,0.11,0.05,t)},
  land:(t,p)=>{noise(0.06,0.12,t,'lowpass',900,200)},
  dash:(t,p)=>{noise(0.18,0.25,t,'bandpass',800*p,5000,1.2)},
  slash:(t,p)=>{noise(0.12,0.35,t,'bandpass',5000*p,900,1.5);tone('triangle',520*p,160,0.09,0.06,t)},
  hurt:(t,p)=>{tone('sawtooth',500*p,90,0.25,0.12,t);noise(0.12,0.2,t,'lowpass',1500,300)},
  power:(t,p)=>{[0,4,7,12,16].forEach((s,i)=>tone('square',440*p*Math.pow(2,s/12),440*p*Math.pow(2,s/12),0.09,0.05,t+i*0.06))},
  laser:(t,p)=>{tone('sawtooth',1800*p,120,0.35,0.07,t);tone('square',900*p,60,0.35,0.05,t)},
  door:(t,p)=>{tone('triangle',110,220,0.4,0.2,t);noise(0.4,0.15,t,'lowpass',600,200)},
  blip:(t,p)=>{tone('square',660*p,660*p,0.04,0.04,t)},
  thud:(t,p)=>{tone('sine',120*p,40,0.18,0.4,t);noise(0.1,0.2,t,'lowpass',700,150)},
  clang:(t,p)=>{tone('square',1800*p,1700*p,0.18,0.05,t);tone('triangle',2400*p,2300*p,0.3,0.06,t);noise(0.05,0.2,t,'highpass',5000,3000)},
  whoosh:(t,p)=>{noise(0.35,0.18,t,'bandpass',400*p,3000,0.9)},
};
function sfx(name,vol,pitch){if(!SND.on||!SND.ctx||S.mute)return;const C=SND.ctx;if(SND.last[name]&&C.currentTime-SND.last[name]<0.035)return;SND.last[name]=C.currentTime;
  try{const g=SND.master.gain.value;SFX[name](C.currentTime+0.005,(pitch||1)*(0.96+Math.random()*0.08))}catch(e){}}
return {PT,W,H,N,S,LIN,lin,rgb,hex,mix,mul,rnd,rr,ri,hash,pmod,setSeed:v=>{seed=v|0},
  begin,world,screen,makeLayer,lpx,setBG,bakeStatic,setOff,gain,px,pxa,emAdd,rect,recta,line,disc,ring,ball,addPx,glow,light,render,
  spr,sprFn,pillow,heightN,outline,flipX,blit,blitX,grid,img:mkImg,ipx,par,part,stepParts,drawParts,camStep,shake,kick,
  ptext,tiny,text,measure,glyph,SND,sndInit,sfx,
  get ox(){return ox},get oy(){return oy}};
})();

const PIXART={pal:{},art:{}};
(function(){const PAL={bo:{k:'0e0a12',a:'1c1a24',b:'2a2834',c:'3c3a48',d:'54525e',e:'706c78',r:'e8c070',R:'fff2c0',
 g:'7a5a24',G:'b88a3a',H:'e0b860',f:'4a4038',F:'7a6e60',h:'a89a84',j:'d0c4ac',
 m:'2a0c12',n:'4a1218',o:'6e1a20',p:'922830',q:'d86a48',y:'ffb040',Y:'fff6d0',
 s:'5a606c',t:'8a92a0',u:'c8d0dc',v:'f4f0e0',l:'2a1c18',L:'46302a'}};
const ART={};
ART.bhelm={pal:'bo',mirror:1,rows:[
'........rrrr',
'......rrdddd',
'.....rdcccdd',
'....rdcbbccd',
'...rdcbbbbcd',
'...kcbbaabcc',
'..kcbbaaabcc',
'..kbbaaaabbc',
'..kbaaaaabbc',
'..kbakkkkkbb',
'..kbakyYYykb',
'..kbakkkkkkb',
'..kbaabbbaab',
'..kbaaakaaab',
'..kbaakakaab',
'...kbaaaaaab',
'...kbaaaaaab',
'....kbaaaaaa',
'....kkbaaaaa',
'.....kkkbbbb',
]};
ART.bcrown={pal:'bo',rows:[
'.....................................kk.....',
'..................................kk.kRk....',
'.................................kRjkkjFk...',
'..................................kjFkjFk...',
'...............................kk..kFjFk....',
'..............................kRjk.kFFk.....',
'...............................kjFkFFk..kk..',
'................................kFjFk..kRjk.',
'...kk...........................kFFk..kjFk..',
'..kRjk..........................kFFkkkjFk...',
'..kjFk.........................kFFjjjFFk....',
'..kjFk..kk.....................kFFFFFkk.....',
'...kFkkkRk.....................kFFfkk.......',
'...kFFjjFk....................kFFfk.........',
'....kFFFk.....................kFffk.........',
'....kFFfk....................kFFfk..........',
'.....kFfk....r...r...r...r...kFfk...........',
'.....kFFfk..rHk.rHk.rHk.rHk.kFfk............',
'......kFfkkkHGkkHGkkHGkkHGkkFfk.............',
'.......kHHHHGGHHGGHHGGHHGGHHGk..............',
'.......kGGgGGgGGgGGgGGgGGgGGgk..............',
'........kkkkkkkkkkkkkkkkkkkkk...............',
]};
ART.bmane={pal:'bo',mirror:1,rows:[
'.................kkRjjjRjjjj',
'..............kkRjjhhjjhhjjh',
'...........kkRjjhhFhhhFhhhFh',
'.........kRjjhhFFhFFhFFhFFhF',
'.......kRjjhhFhFFfFFfFFfFFfF',
'.....kRjjhhFFhFffFfFffFFffFf',
'....kjjhhFFhFFfFffkFfkFfkffk',
'...kjhhFFhFFfFfkffkfkkfkkfkk',
'..kjhFFhFFfFfkfkkfk.kk.kk.k.',
'..kjhFhFFfFfkfkkk...........',
'.kjhFhFfFfkfkk..............',
'.kjhFhFfFfkk................',
'.kjFhFfFfk..................',
'.kjFhFffkk..................',
'..kFhFfk....................',
'..kFfFk.....................',
'...kfk......................',
]};
ART.bchest={pal:'bo',mirror:1,rows:[
'....kcbbbbbbbbbbcc',
'....kcbbbbbbbbbbbc',
'...kgcbbbbbbbbbbbc',
'...kGcbbbbbbbbbbbc',
'...kGbbbbbbbbbgGGG',
'...kGbbbbbbbbgGHHH',
'...kGbbbbbbbgGHGGG',
'...kGbbbbbbbgGHGgg',
'...kGabbbbbbgGHGGG',
'...kGabbbbbbbgGHHH',
'...kGaabbbbbbbgGGG',
'...kGaabbbbbbbbbbb',
'...kGaaabbbbbbbbbb',
'...kgaaaabbbbbbbbb',
'....kgaaaaabbbbbbb',
'....kkgggggggggggg',
'....kcddddddddcccc',
'....kbbbbbbbbbbbbb',
'....kabbbbbbbbbbbb',
'....kkkkkkkkkkkkkk',
'....kcdddddddddccc',
'....kbbbbbbbbbbbbb',
'....kaaaaaaaaaaaaa',
'....klLLLLLLLLkgGH',
'....kllllllllLkgGG',
'....kkkkkkkkkkkkkk',
]};
ART.bpaul={pal:'bo',rows:[
'........kkrrrrrrrk............',
'......krrdeeeeedddrk..........',
'.....krdeddddddddcdrk.........',
'....krdddcccccccccccdrk.......',
'...krddcccbbbbbbbbbccdrk......',
'...kddccbbbbbbbbbbbbbccdk.....',
'..kGHHHHHHHHHHHHHHHHHHHHGk....',
'..kgGGGGGGGGGGGGGGGGGGGGGgk...',
'..kcccccccccccccccccccccccrk..',
'..kbbbbbbbbbbbbbbbbbbbbbbbck..',
'...kaaaaaaaaaaaaaaaaaaaaabbk..',
'...kkkkkkkkkkkkkkkkkkkkkkkck..',
'....kccccccccccccccccccccccrk.',
'....kbbbbbbbbbbbbbbbbbbbbbbck.',
'.....kaaaaaaaaaaaaaaaaaaaabbk.',
'.....kkkkkkkkkkkkkkkkkkkkkkck.',
'......kcccccccccccccccccccccrk',
'......kbbbbbbbbbbbbbbbbbbbbbck',
'.......kaaaaaaaaaaaaaaaaaaaabk',
'.......kgGGGGGGGGGGGGGGGGGGGgk',
'........kkkkkkkkkkkkkkkkkkkkk.',
]};
ART.bskirt={pal:'bo',mirror:1,rows:[
'.....knnoonnookGpppppp',
'.....knnoonnookGpoooop',
'....knnnoonnnokGpoooop',
'....knnnoonnnokGpoooop',
'....knnmoonmnokGpogggo',
'....knnmoonmnokGpogHHg',
'...knnnmoonmnnkGpogHgg',
'...knnmmoonmmnkGpogHHg',
'...knnmmoonmmnkGpoggGg',
'...knnmmoonmmnkGpooogg',
'..kqnnmmoonmmnkGpooooo',
'..kqnmmmoonmmnkGpooooo',
'..kqnmmmoonmmnkGpoooon',
'..kqnmmnoonmmnkGpoooon',
'.kqnnmmnoonmmnkGpoooon',
'.kqnmmmnoonmmnkGpooonn',
'.kqnmmmnoonmmnkGpooonn',
'.kqnmmnnoonmmnkGpooonn',
'.kqnmmnnoonmmnkGpooonn',
'.kqnmmnnoonmmnkGpoonnn',
'kqnnmmnnoonmmnkGpoonnn',
'kqnnmmnnoonmmnkGpoonnn',
'kqnmmmnnoonmmnkGpoonnn',
'kqnmmmnnoonmmmkGpoonnn',
'kqnmmmnnoonmmmkGpoonnn',
'kqnmmmnnoonmmmkGpoonnm',
'kqnmmmnnoonmmmkGpoonnm',
'kqnmmmnnoonmmmkGpoonnm',
'kqnmmkknoonmmmkGpoonnm',
'kqnmk.kknoonmmkGpoonnm',
'kqnk...kkoonmmkGpoonnm',
'kqk.....kkonmmkGpoonnm',
'kk.......kkkmmkGpoonmm',
'............kkkGpoonmm',
'..............kGgGgGgG',
'..............kkkkkkkk',
]};
ART.blegs={pal:'bo',mirror:1,rows:[
'....kbccbk......',
'....kbccbk......',
'...kabccbbk.....',
'...kabcdcbk.....',
'...kGHHHHGk.....',
'...kgGGGGgk.....',
'...kabccbbk.....',
'...kabccbbk.....',
'...kaabcbbk.....',
'...kaabbbbk.....',
'....kaabbk......',
'....kaabbk......',
'....kaaabk......',
'...kcccccck.....',
'..kbbbbbbbbk....',
'.kaaaaaaaaaak...',
'.kkkkkkkkkkkk...',
]};
ART.bsigil={pal:'bo',rows:[
'..r...r...',
'.rH.rHr.rH',
'.GHGHHHGHG',
'..GGGGGGG.',
'...GgggG..',
'....GHG...',
'....gGg...',
'.....g....',
]};

Object.assign(PIXART.pal,PAL);Object.assign(PIXART.art,ART)})();
(function(){const PAL={kn:{k:'120e18',a:'232634',b:'343848',c:'4a5062',d:'687084',e:'8e96a8',r:'d8b878',R:'fbe6b0',
 m:'1c1416',n:'2c2226',o:'40323a',p:'5a4644',q:'b89060',l:'2e2018',L:'4e3626',g:'8a6a30',G:'c89a48',w:'3a2418',W:'5a3a24',x:'7a5432',s:'9aa4b4',S:'e8eef8'}};
const ART={};
// back view, mirrored about the spine; sun ahead, so the back is in shade and every top edge carries a gold rim
ART.kback={pal:'kn',mirror:1,rows:[
'...............rrr',
'.............rrdee',
'............rdccde',
'............rcbcde',
'...........kcbbcde',
'...........kbbacde',
'...........kbaacdd',
'...........keceecd',
'...........kbaabcd',
'...........kbaabcc',
'...........kabaabc',
'............kaabbc',
'.....rrrr..kcbaabb',
'...rrdeedrkcbbaaab',
'..rdedccdckqqqpppo',
'.rdcccbbcqpppoooon',
'.rccbbbbkpooonnnnm',
'kdcbbaabkonnnnmmmm',
'kcbbaaabkgGgnnmmnm',
'krrdcbbkkonnmnoonm',
'kddcbbak.konmnoonm',
'kcbbaak..kqonnmoon',
'.kbaak...kqonnmoon',
'..kkk....kqonmmnoo',
'.........kqonmmnoo',
'........kqoonmmnoo',
'........kqoonmnnoo',
'........kqonnmnooo',
'........kqonnmnoop',
'........kqonmmnoop',
'.......kqoonmmnoop',
'.......kqoonmnnoop',
'.......kqonnmnnoop',
'.......kqonnmnnoon',
'.......kqonmmnoonn',
'.......kqonmmnoonm',
'......kqoonmmnoonm',
'......kqoonmnnoonm',
'......kqonnmnnoonm',
'......kqonnmnooonm',
'......kqonmmnooonm',
'......kqonmmnoopnm',
'......kqonmmnoopnm',
'.....kqoonmmnoopnm',
'.....kqoonmmnoopnm',
'.....kqoonmmnooonm',
'.....kqgGgnmmngGgm',
'.....kqoonkmmmnoon',
'......kqk..kmnk.kn',
'.......k....kk...k',
]};
ART.klegs={pal:'kn',mirror:1,rows:[
'..kbccbk..',
'..kbccbk..',
'..kabcbk..',
'..kabbbk..',
'..kaabbk..',
'..knnnnk..',
'..knmmnk..',
'..kbcdck..',
'..kbccck..',
'.kabccck..',
'.kabcccbk.',
'.kabbccbk.',
'.kaabbcbk.',
'.kaabbbbk.',
'..kaabbk..',
'..kaaabk..',
'..klLLlk..',
'..klLLlk..',
'..kllLlk..',
'.kllllllk.',
'.kkkkkkkk.',
]};
// a larger helm for the painted knight, seen from behind: a rounded great helm, a riveted band, a mail aventail spilling onto the shoulders
ART.khelm={pal:'kn',mirror:1,rows:[
'......rrrr',
'....rrReee',
'...rdeeddd',
'..rddcccdd',
'..rdccbbcd',
'.kdcbbbbcc',
'.kcbbaabcc',
'.kcbaaabbc',
'.kcbaaabbc',
'.kecdeecde',
'.kbaaaaabb',
'.kbaaaaabb',
'.kbaaaaabb',
'..kbaaaaab',
'..kbaaaaab',
'.kbcbcbcbc',
'kbcbcbcbcb',
'kkbkbkbkbk',
]};

Object.assign(PIXART.pal,PAL);Object.assign(PIXART.art,ART)})();
// ================= RIG: bones, poses and cloth for the painted figures — joint positions only, nothing is rendered as geometry =================
const RIG=(function(){
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],scl=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=a=>Math.hypot(a[0],a[1],a[2]),norm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]};
const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const I4=()=>[1,0,0,0, 0,1,0,0, 0,0,1,0];
function mmul(a,b){const o=new Array(12);for(let r=0;r<3;r++){for(let c=0;c<3;c++)o[r*4+c]=a[r*4]*b[c]+a[r*4+1]*b[4+c]+a[r*4+2]*b[8+c];o[r*4+3]=a[r*4]*b[3]+a[r*4+1]*b[7]+a[r*4+2]*b[11]+a[r*4+3]}return o}
function rotE(rx,ry,rz){const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
  // Ry * Rx * Rz
  const Rz=[cz,-sz,0,0, sz,cz,0,0, 0,0,1,0],Rx=[1,0,0,0, 0,cx,-sx,0, 0,sx,cx,0],Ry=[cy,0,sy,0, 0,1,0,0, -sy,0,cy,0];return mmul(Ry,mmul(Rx,Rz))}
function trs(t,rx,ry,rz){const m=rotE(rx||0,ry||0,rz||0);m[3]=t[0];m[7]=t[1];m[11]=t[2];return m}
const ap=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2]+m[3],m[4]*v[0]+m[5]*v[1]+m[6]*v[2]+m[7],m[8]*v[0]+m[9]*v[1]+m[10]*v[2]+m[11]];
const apv=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[4]*v[0]+m[5]*v[1]+m[6]*v[2],m[8]*v[0]+m[9]*v[1]+m[10]*v[2]];
function skeleton(defs){return defs.map(d=>({n:d[0],p:d[1],o:d[2]}))}
function solve(sk,pose,root){const M={};for(const b of sk){const r=pose[b.n]||[0,0,0];const local=trs(b.o,r[0],r[1],r[2]);M[b.n]=b.p?mmul(M[b.p],local):mmul(root,local)}return M}
function lerpPose(a,b,t){const o={};for(const k in a){const x=a[k],y=b[k]||x;o[k]=typeof x==='number'?x+((typeof y==='number'?y:x)-x)*t:[x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t]}for(const k in b)if(!(k in o))o[k]=b[k];return o}
function clip(keys,t,loop){const end=keys[keys.length-1][0];if(loop)t=((t%end)+end)%end;else t=Math.max(0,Math.min(end,t));
  for(let i=0;i<keys.length-1;i++){const[a,pa]=keys[i],[b,pb]=keys[i+1];if(t>=a&&t<=b){let u=(t-a)/Math.max(1e-6,b-a);u=u*u*(3-2*u);return lerpPose(pa,pb,u)}}return keys[keys.length-1][1]}
function cloth(cols,rows,w,h){const pts=[];for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=(i/(cols-1)-0.5)*w,y=-j/(rows-1)*h;pts.push({p:[x,y,0],o:[x,y,0]})}return{cols,rows,w,h,pts,seg:h/(rows-1),sw:w/(cols-1),init:false}}
function clothStep(c,anchors,wind,colliders){const{cols,rows,pts}=c;
  if(!c.init){for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=anchors[i];const q=pts[j*cols+i];q.p=[a[0],a[1]-j*c.seg,a[2]];q.o=q.p.slice()}c.init=true}
  for(let i=0;i<cols;i++){pts[i].p=anchors[i].slice();pts[i].o=anchors[i].slice()}
  for(let k=cols;k<pts.length;k++){const q=pts[k];const v=sub(q.p,q.o);q.o=q.p;q.p=add(add(q.p,scl(v,0.94)),[wind[0],wind[1]-0.0065,wind[2]])}
  for(let it=0;it<4;it++){
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*cols+i;if(i+1<cols)link(pts[k],pts[k+1],c.sw,j===0);if(j+1<rows)link(pts[k],pts[k+cols],c.seg,j===0)}
    for(const col of colliders||[])for(let k=cols;k<pts.length;k++){const q=pts[k];const d=sub(q.p,col.c);const l=len(d);if(l<col.r){q.p=add(col.c,scl(d,col.r/(l||1)))}}
    for(let k=cols;k<pts.length;k++)if(pts[k].p[1]<0.03)pts[k].p[1]=0.03}}
function link(a,b,rest,pinA){const d=sub(b.p,a.p);const l=len(d)||1e-6;const e=(l-rest)/l;if(pinA){b.p=sub(b.p,scl(d,e))}else{a.p=add(a.p,scl(d,e*0.5));b.p=sub(b.p,scl(d,e*0.5))}}
return{dot,sub,add,scl,cross,len,norm,lerp3,I4,mmul,rotE,trs,ap,apv,skeleton,solve,lerpPose,clip,cloth,clothStep}})();

// ================= PIX: a native-resolution pixel painter =================
// Characters are painted fresh every frame into a small canvas, pixel by pixel at screen resolution: hand-typed stamps
// for the detailed parts (helm, crown, pauldrons, cape), banded colour ramps for limbs and cloth (no dithering),
// then one finishing pass that draws seams between parts, a rim of backlight on the silhouette and a dark outline.
const PIX=(function(){
const {mix,W,H,S}=NX;
const hx=s=>parseInt(s,16);
const EM=new Set();function emis(...cs){for(const c of cs)EM.add(typeof c==='string'?hx(c):c)}
const ST={};
function stamp(name){let s=ST[name];if(s)return s;const a=PIXART.art[name];if(!a)throw new Error('no stamp '+name);let rows=a.rows;if(a.mirror)rows=rows.map(r=>r+[...r].reverse().join(''));const pal=PIXART.pal[a.pal];
  const h=rows.length,w=Math.max(...rows.map(r=>r.length));const c=new Int32Array(w*h).fill(-1);
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const ch=rows[y][x];if(ch==='.'||ch===' ')continue;if(pal[ch]==null)throw new Error(name+' bad char '+ch);c[y*w+x]=hx(pal[ch])}
  return ST[name]={w,h,c}}
function cv(w,h){return{w,h,z:new Float32Array(w*h).fill(1e9),c:new Int32Array(w*h).fill(-1),id:new Uint8Array(w*h),e:new Uint8Array(w*h),nr:new Uint8Array(w*h),x0:w,y0:h,x1:-1,y1:-1}}
function clear(C){if(C.x1<0)return;for(let y=Math.max(0,C.y0-1);y<=Math.min(C.h-1,C.y1+1);y++){const a=y*C.w+Math.max(0,C.x0-1),b=y*C.w+Math.min(C.w-1,C.x1+1)+1;C.c.fill(-1,a,b);C.z.fill(1e9,a,b);C.id.fill(0,a,b);C.e.fill(0,a,b);C.nr.fill(0,a,b)}C.x0=C.w;C.y0=C.h;C.x1=-1;C.y1=-1}
function put(C,x,y,col,id,e,nr,z){x|=0;y|=0;if(x<0||y<0||x>=C.w||y>=C.h)return;if(z!=null){const q=y*C.w+x;if(z>=C.z[q])return;C.z[q]=z}if(x<C.x0)C.x0=x;if(x>C.x1)C.x1=x;if(y<C.y0)C.y0=y;if(y>C.y1)C.y1=y;const p=y*C.w+x;C.c[p]=col;C.id[p]=id||0;C.e[p]=e!=null?e:(EM.has(col)?255:0);C.nr[p]=nr||0}
// o: {flip, id, nr (no rim), tint:[c,k]}
function stampTo(C,name,x,y,o){const s=stamp(name);const fl=o&&o.flip,id=(o&&o.id)||0,nr=o&&o.nr,ti=o&&o.tint;x=Math.round(x);y=Math.round(y);
  for(let j=0;j<s.h;j++)for(let i=0;i<s.w;i++){let c=s.c[j*s.w+(fl?s.w-1-i:i)];if(c<0)continue;const e=EM.has(c)?255:0;if(ti&&!e)c=mix(c,ti[0],ti[1]);put(C,x+i,y+j,c,id,e,nr)}}
// ---------------- shading: a pseudo-normal per pixel, lit and snapped to a hand-picked ramp ----------------
// LT = {k:[x,y,z] toward the light (screen x right, y down, z toward the viewer), kk key strength, amb, f front fill}
function lit(nx,ny,nz,LT){const d=nx*LT.k[0]+ny*LT.k[1]+nz*LT.k[2];return LT.amb+LT.kk*Math.max(0,d)+LT.f*nz}
function band(r,L){const n=r.length;let i=Math.floor(L*n);return r[i<0?0:i>=n?n-1:i]}
// an ellipsoid seen face-on; o.rot turns it; o.clip(x,y) can veto pixels; o.fn(L,u,v) can override the colour
function ell(C,cx,cy,rx,ry,ramp,LT,o){o=o||{};const rot=o.rot||0,ca=Math.cos(rot),sa=Math.sin(rot),R=Math.max(rx,ry)+1,id=o.id||0,bias=o.bias||0;
  for(let y=Math.floor(cy-R);y<=Math.ceil(cy+R);y++)for(let x=Math.floor(cx-R);x<=Math.ceil(cx+R);x++){const dx=x+0.5-cx,dy=y+0.5-cy;const u=(dx*ca+dy*sa)/rx,v=(-dx*sa+dy*ca)/ry;const s=u*u+v*v;if(s>1)continue;
    if(o.clip&&!o.clip(x,y,u,v))continue;const nz=Math.sqrt(1-s);const nx=u*ca-v*sa,ny=u*sa+v*ca;const L=lit(nx,ny,nz,LT)+bias;put(C,x,y,o.fn?o.fn(L,u,v,x,y):band(ramp,L),id,null,o.nr,o.z)}}
// a tapered capsule (a limb): sphere-swept segment, so ends round off and the shading wraps across the width
function cap(C,x0,y0,x1,y1,r0,r1,ramp,LT,o){o=o||{};const id=o.id||0,bias=o.bias||0;const dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1e-6;const R=Math.max(r0,r1)+1;
  for(let y=Math.floor(Math.min(y0,y1)-R);y<=Math.ceil(Math.max(y0,y1)+R);y++)for(let x=Math.floor(Math.min(x0,x1)-R);x<=Math.ceil(Math.max(x0,x1)+R);x++){
    const px=x+0.5-x0,py=y+0.5-y0;let t=(px*dx+py*dy)/l2;t=t<0?0:t>1?1:t;const qx=px-dx*t,qy=py-dy*t;const r=r0+(r1-r0)*t;const d2=qx*qx+qy*qy;if(d2>r*r)continue;
    const nx=qx/r,ny=qy/r,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));const L=lit(nx,ny,nz,LT)+bias;let zz;if(o.za!=null){zz=o.za+(o.zb-o.za)*t;zz-=nz*r*zz/o.F}const col=o.fn?o.fn(L,t,Math.sqrt(d2)/r,x,y):band(ramp,L);if(col==null||col<0)continue;put(C,x,y,col,id,null,o.nr,zz)}}
// a filled polygon; colour from fn(x,y) (cloth folds, blades), or a flat lit normal with a bevel on the edges that face the light
function poly(C,pts,fn,id,nr,zf){let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}const n=pts.length;
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yc=y+0.5;const xs=[];for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];if((a[1]<=yc)!==(b[1]<=yc)){xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){for(let x=Math.ceil(xs[k]-0.5);x<=Math.floor(xs[k+1]-0.5);x++){const c=fn(x,y);if(c==null||c<0)continue;put(C,x,y,c,id,null,nr,zf?zf(x,y):undefined)}}}}
// a blade along a curved spine: pts = spine points from hilt to tip, w(t) half-width; cols {d,m,l,e} dark, mid, light, edge
function blade(C,spine,w0,w1,cols,id,glow){const n=spine.length;const L=[],Rr=[];
  for(let i=0;i<n;i++){const p=spine[i],q=spine[Math.min(n-1,i+1)],o=spine[Math.max(0,i-1)];let tx=q[0]-o[0],ty=q[1]-o[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const t=i/(n-1);const w=w0+(w1-w0)*t;
    L.push([p[0]-ty*w,p[1]+tx*w]);Rr.push([p[0]+ty*w*0.9,p[1]-tx*w*0.9])}
  const pts=L.concat(Rr.reverse());let bz;
  poly(C,pts,(x,y)=>{// nearest spine sample gives which side of the fuller we are on
    let bi=0,bd=1e9;for(let i=0;i<n;i++){const d=(spine[i][0]-x-0.5)**2+(spine[i][1]-y-0.5)**2;if(d<bd){bd=d;bi=i}}bz=spine[bi][2];
    const p=spine[bi],q=spine[Math.min(n-1,bi+1)],o=spine[Math.max(0,bi-1)];let tx=q[0]-o[0],ty=q[1]-o[1];const l=Math.hypot(tx,ty)||1;const s=((x+0.5-p[0])*(-ty/l)+(y+0.5-p[1])*(tx/l));const w=w0+(w1-w0)*bi/(n-1);const u=s/w;
    if(u>0.62)return cols.e;if(u>0.25)return cols.l;if(Math.abs(u)<0.12&&bi<n*0.8)return cols.d;return u<-0.55?cols.d:cols.m},id,0,()=>bz);
  if(glow)for(let i=0;i<n;i++){const p=L[i];put(C,p[0],p[1],cols.e,id,glow,0,spine[i][2]!=null?spine[i][2]-0.01:undefined)}}
// ellip3: an ellipsoid given its centre and three world axes (radius included). cam = {r:[right], f:[forward], proj(x,y,z)}.
// fn(p, L, x, y) gets the local surface point p (unit sphere coordinates along the axes) and the lit value L; it returns a colour, or -1 to leave the pixel.
function ellip3(C,cen,ax,ramp,LT,cam,fn,id,nr){const pc=cam.proj(cen[0],cen[1],cen[2]);if(!pc)return;const k=cam.F/pc[2];const r=cam.r,f=cam.f;
  const sx=[0,0,0],sy=[0,0,0],cz=[0,0,0],un=[];for(let i=0;i<3;i++){const v=ax[i];sx[i]=k*(v[0]*r[0]+v[2]*r[2]);sy[i]=-k*v[1];cz[i]=v[0]*f[0]+v[2]*f[2];const l=Math.hypot(v[0],v[1],v[2])||1;un.push([v[0]/l,v[1]/l,v[2]/l])}
  const a=sx[0]*sx[0]+sx[1]*sx[1]+sx[2]*sx[2],b=sx[0]*sy[0]+sx[1]*sy[1]+sx[2]*sy[2],d=sy[0]*sy[0]+sy[1]*sy[1]+sy[2]*sy[2];const det=a*d-b*b;if(det<1e-6)return;const ia=d/det,ib=-b/det,id2=a/det;
  let n0=[sx[1]*sy[2]-sx[2]*sy[1],sx[2]*sy[0]-sx[0]*sy[2],sx[0]*sy[1]-sx[1]*sy[0]];const nl=Math.hypot(n0[0],n0[1],n0[2])||1;n0=[n0[0]/nl,n0[1]/nl,n0[2]/nl];
  if(n0[0]*cz[0]+n0[1]*cz[1]+n0[2]*cz[2]>0)n0=[-n0[0],-n0[1],-n0[2]];
  const ex=Math.sqrt(a),ey=Math.sqrt(d);const cx=pc[0],cy=pc[1];
  for(let y=Math.floor(cy-ey);y<=Math.ceil(cy+ey);y++)for(let x=Math.floor(cx-ex);x<=Math.ceil(cx+ex);x++){const dx=x+0.5-cx,dy=y+0.5-cy;const u=ia*dx+ib*dy,v=ib*dx+id2*dy;
    const p0=[sx[0]*u+sy[0]*v,sx[1]*u+sy[1]*v,sx[2]*u+sy[2]*v];const s2=p0[0]*p0[0]+p0[1]*p0[1]+p0[2]*p0[2];if(s2>1)continue;const q=Math.sqrt(1-s2);const p=[p0[0]+n0[0]*q,p0[1]+n0[1]*q,p0[2]+n0[2]*q];
    const nw=[un[0][0]*p[0]+un[1][0]*p[0+1]*0+un[1][0]*p[1]+un[2][0]*p[2]-un[1][0]*p[1]*0,un[0][1]*p[0]+un[1][1]*p[1]+un[2][1]*p[2],un[0][2]*p[0]+un[1][2]*p[1]+un[2][2]*p[2]];
    const L=lit(nw[0]*r[0]+nw[2]*r[2],-nw[1],-(nw[0]*f[0]+nw[2]*f[2]),LT);const col=fn?fn(p,L,x,y):band(ramp,L);if(col==null||col<0)continue;put(C,x,y,col,id,null,nr,pc[2]+p[0]*cz[0]+p[1]*cz[1]+p[2]*cz[2])}}
// a screen quad with (u,v) across it: two triangles, barycentric
function quad(C,A,B,Cc,D,fn,id){tri2(C,A,B,Cc,[0,0],[1,0],[1,1],fn,id);tri2(C,A,Cc,D,[0,0],[1,1],[0,1],fn,id)}
function tri2(C,A,B,Cc,ta,tb,tc,fn,id){const x0=Math.floor(Math.min(A[0],B[0],Cc[0])),x1=Math.ceil(Math.max(A[0],B[0],Cc[0])),y0=Math.floor(Math.min(A[1],B[1],Cc[1])),y1=Math.ceil(Math.max(A[1],B[1],Cc[1]));
  const ar=(B[0]-A[0])*(Cc[1]-A[1])-(Cc[0]-A[0])*(B[1]-A[1]);if(Math.abs(ar)<1e-6)return;const inv=1/ar;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const px=x+0.5,py=y+0.5;const w0=((B[0]-px)*(Cc[1]-py)-(Cc[0]-px)*(B[1]-py))*inv,w1=((Cc[0]-px)*(A[1]-py)-(A[0]-px)*(Cc[1]-py))*inv,w2=1-w0-w1;if(w0<0||w1<0||w2<0)continue;
    const u=w0*ta[0]+w1*tb[0]+w2*tc[0],v=w0*ta[1]+w1*tb[1]+w2*tc[1];const col=fn(u,v,x,y);if(col==null||col<0)continue;put(C,x,y,col,id,null,0,A.length>2?w0*A[2]+w1*B[2]+w2*Cc[2]:undefined)}}
// ---------------- finishing: seams, rim light, outline ----------------
// o: {ink, rim (colour), rimUp, rimSide (0..1 strength), seam (true), selout (colour mixed into the outline where it touches rim)}
function finish(C,o){const w=C.w,h=C.h,c=C.c,id=C.id,N=w*h;const ink=o.ink;if(C.x1<0)return;const bx0=Math.max(1,C.x0-1),bx1=Math.min(w-2,C.x1+1),by0=Math.max(1,C.y0-1),by1=Math.min(h-2,C.y1+1);
  if(o.seam){const mk=new Uint8Array(N);for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const p=y*w+x;if(c[p]<0)continue;const me=id[p];
      for(const q of[p-1,p+1,p-w,p+w])if(c[q]>=0&&id[q]<me&&id[q]!==0&&!(o.noSeam&&o.noSeam(me,id[q]))){mk[p]=1;break}}
    for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const p=y*w+x;if(mk[p]&&!C.e[p])c[p]=mix(c[p],ink,0.62)}}
  const rim=new Uint8Array(N);if(o.rim!=null){for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const p=y*w+x;if(c[p]<0||C.e[p]||C.nr[p])continue;
      const up=c[p-w]<0,lf=c[p-1]<0,rt=c[p+1]<0;let k=0;if(lf)k=o.rimL!=null?o.rimL:o.rimSide;if(rt)k=Math.max(k,o.rimR!=null?o.rimR:o.rimSide);if(up)k=Math.max(k,o.rimUp);if(k>0){c[p]=mix(c[p],o.rim,k);rim[p]=up?1:0}}}
  const src=c.slice();for(let y=by0-1;y<=by1+1;y++)for(let x=bx0-1;x<=bx1+1;x++){if(x<0||y<0||x>=w||y>=h)continue;const p=y*w+x;if(src[p]>=0)continue;let n=0,r=0;
    if(x>0&&src[p-1]>=0){n++;r+=rim[p-1]}if(x<w-1&&src[p+1]>=0){n++;r+=rim[p+1]}if(y>0&&src[p-w]>=0){n++;r+=rim[p-w]}if(y<h-1&&src[p+w]>=0){n++;r+=rim[p+w]}
    if(n){c[p]=r&&o.selout!=null?o.selout:ink;C.e[p]=0}}}
// ---------------- onto the screen ----------------
// o: {a (alpha), white (flash 0..1), dissolve(x,y)->true drops the pixel, gold (dissolve edge colour), tint:[c,k]}
function blit(C,x0,y0,o){o=o||{};x0=Math.round(x0);y0=Math.round(y0);const alb=S.alb,em=S.em,lk=S.lk,nxb=S.nxb,nyb=S.nyb;const w=C.w,h=C.h;if(C.x1<0)return;
  for(let y=Math.max(0,C.y0-1);y<=Math.min(h-1,C.y1+1);y++){const Y=y0+y;if(Y<0||Y>=H)continue;for(let x=Math.max(0,C.x0-1);x<=Math.min(w-1,C.x1+1);x++){const p=y*w+x;let c=C.c[p];if(c<0)continue;const X=x0+x;if(X<0||X>=W)continue;let e=C.e[p];
    if(o.dissolve){const d=o.dissolve(x,y);if(d===1)continue;if(d===2){c=o.gold;e=230}}
    if(o.white)c=mix(c,0xfff4e0,o.white);if(o.tint)c=mix(c,o.tint[0],o.tint[1]);const q=Y*W+X;
    if(o.a!=null&&o.a<1){alb[q]=mix(alb[q],c,o.a);continue}alb[q]=c;em[q]=e;lk[q]=0;nxb[q]=0;nyb[q]=0}}}
return{stamp,cv,clear,put,stampTo,lit,band,ell,cap,poly,blade,finish,blit,emis,hx,ellip3,quad,tri2}})();

const GAMES=[];
// ================= FIG: the knight and the king as posable skeletons, painted pixel by pixel from whatever angle the camera holds =================
// Bones only say where the joints are. Every part is painted in screen space with hand-picked ramps; the ellipsoid parts carry their own
// surface coordinates, so a visor slit, a chest sigil or the painted face of a shield stays where it belongs as the view turns around them.
const FIG=(function(){
const {W,H,mix,hash}=NX;const X=PIX,RG=RIG;const {sub,add,scl,norm,dot,cross,ap,apv}=RG;
X.emis('ffb040','fff6d0','ff9a3c');
function skel(s){return RG.skeleton([['hips',null,[0,0.95*s,0]],['spine','hips',[0,0.1*s,0]],['chest','spine',[0,0.26*s,0]],['neck','chest',[0,0.27*s,0]],['head','neck',[0,0.05*s,0]],
  ['armR','chest',[0.21*s,0.2*s,0]],['foreR','armR',[0,-0.29*s,0]],['handR','foreR',[0,-0.26*s,0]],['armL','chest',[-0.21*s,0.2*s,0]],['foreL','armL',[0,-0.29*s,0]],['handL','foreL',[0,-0.26*s,0]],
  ['thighR','hips',[0.1*s,-0.04*s,0]],['shinR','thighR',[0,-0.44*s,0]],['footR','shinR',[0,-0.44*s,0]],['thighL','hips',[-0.1*s,-0.04*s,0]],['shinL','thighL',[0,-0.44*s,0]],['footL','shinL',[0,-0.44*s,0]]])}
let SN=null;const SCN=()=>SN||SCENE;
const KS=1.1,BS=3.0,KSK=skel(KS),BSK=skel(BS);
// ---------------- poses (bone euler angles; root = [drop, pitch]) ----------------
const KN={
 idle:{root:[0,0,0],hips:[0,0.1,0],spine:[0.08,0,0],chest:[0.05,-0.2,0],head:[-0.08,0.15,0],armR:[-0.3,0,0.2],foreR:[-0.75,0,0],handR:[0.35,0,0],armL:[-0.55,0,-0.3],foreL:[-1.25,0.2,0.25],handL:[0,0,0],
   thighR:[-0.3,0,0.1],shinR:[0.42,0,0],footR:[-0.12,0,0],thighL:[0.18,0,-0.1],shinL:[0.3,0,0],footL:[-0.48,0,0]},
 idle2:{root:[-0.02,0,0],hips:[0,0.1,0],spine:[0.11,0,0],chest:[0.06,-0.22,0],head:[-0.1,0.15,0],armR:[-0.32,0,0.22],foreR:[-0.8,0,0],handR:[0.35,0,0],armL:[-0.58,0,-0.3],foreL:[-1.28,0.2,0.25],handL:[0,0,0],
   thighR:[-0.34,0,0.1],shinR:[0.5,0,0],footR:[-0.16,0,0],thighL:[0.16,0,-0.1],shinL:[0.38,0,0],footL:[-0.54,0,0]},
 run1:{root:[0.02,0,0],hips:[0,0,0],spine:[0.3,0,0],chest:[0,0.15,0],head:[-0.25,0,0],armR:[0.5,0,0.15],foreR:[-0.6,0,0],handR:[0.6,0,0],armL:[-0.7,0,-0.25],foreL:[-1.2,0.2,0.2],handL:[0,0,0],thighR:[-0.9,0,0],shinR:[0.5,0,0],footR:[0.2,0,0],thighL:[0.55,0,0],shinL:[0.9,0,0],footL:[0.1,0,0]},
 run2:{root:[-0.05,0,0],hips:[0,0,0],spine:[0.3,0,0],chest:[0,0,0],head:[-0.25,0,0],armR:[0,0,0.15],foreR:[-0.7,0,0],handR:[0.6,0,0],armL:[-0.5,0,-0.25],foreL:[-1.2,0.2,0.2],handL:[0,0,0],thighR:[-0.2,0,0],shinR:[1.5,0,0],footR:[0,0,0],thighL:[0.05,0,0],shinL:[0.2,0,0],footL:[-0.2,0,0]},
 run3:{root:[0.02,0,0],hips:[0,0,0],spine:[0.3,0,0],chest:[0,-0.15,0],head:[-0.25,0,0],armR:[-0.6,0,0.15],foreR:[-0.6,0,0],handR:[0.6,0,0],armL:[-0.4,0,-0.25],foreL:[-1.2,0.2,0.2],handL:[0,0,0],thighR:[0.55,0,0],shinR:[0.9,0,0],footR:[0.1,0,0],thighL:[-0.9,0,0],shinL:[0.5,0,0],footL:[0.2,0,0]},
 run4:{root:[-0.05,0,0],hips:[0,0,0],spine:[0.3,0,0],chest:[0,0,0],head:[-0.25,0,0],armR:[-0.2,0,0.15],foreR:[-0.7,0,0],handR:[0.6,0,0],armL:[-0.5,0,-0.25],foreL:[-1.2,0.2,0.2],handL:[0,0,0],thighR:[0.05,0,0],shinR:[0.2,0,0],footR:[-0.2,0,0],thighL:[-0.2,0,0],shinL:[1.5,0,0],footL:[0,0,0]},
 tuck:{root:[-0.35,0,0],hips:[0,0,0],spine:[0.9,0,0],chest:[0.4,0,0],head:[0.3,0,0],armR:[-0.8,0,0.3],foreR:[-1.6,0,0],handR:[1.2,0,0],armL:[-1.0,0,-0.3],foreL:[-1.8,0,0.2],handL:[0,0,0],thighR:[-1.9,0,0],shinR:[2.3,0,0],footR:[0,0,0],thighL:[-1.7,0,0],shinL:[2.4,0,0],footL:[0,0,0]},
 a1w:{root:[-0.04,0,0],hips:[0,0.3,0],spine:[0.1,0.2,0],chest:[0,0.55,0],head:[-0.05,-0.5,0],armR:[-0.6,0,1.45],foreR:[-0.9,0,0],handR:[0.2,0.6,0.3],armL:[-0.5,0,-0.3],foreL:[-1.2,0.2,0.2],handL:[0,0,0],thighR:[0.1,0,0.15],shinR:[0.3,0,0],footR:[-0.4,0,0],thighL:[-0.5,0,-0.1],shinL:[0.5,0,0],footL:[0,0,0]},
 a1s:{root:[-0.08,0,0],hips:[0,-0.3,0],spine:[0.25,-0.2,0],chest:[0.1,-0.75,0],head:[-0.1,0.6,0],armR:[-1.5,0,-0.25],foreR:[-0.15,0,0],handR:[0.0,-1.1,0],armL:[-0.3,0,-0.5],foreL:[-1.0,0.2,0.2],handL:[0,0,0],thighR:[-0.7,0,0.15],shinR:[0.8,0,0],footR:[-0.1,0,0],thighL:[0.4,0,-0.1],shinL:[0.3,0,0],footL:[-0.6,0,0]},
 a2w:{root:[-0.06,0,0],hips:[0,-0.3,0],spine:[0.2,-0.2,0],chest:[0.1,-0.8,0],head:[-0.1,0.6,0],armR:[-1.2,0,-0.5],foreR:[-1.4,0,0],handR:[0.2,-1.3,0],armL:[-0.4,0,-0.4],foreL:[-1.1,0.2,0.2],handL:[0,0,0],thighR:[-0.6,0,0.15],shinR:[0.7,0,0],footR:[-0.1,0,0],thighL:[0.4,0,-0.1],shinL:[0.3,0,0],footL:[-0.6,0,0]},
 a2s:{root:[-0.08,0,0],hips:[0,0.35,0],spine:[0.25,0.25,0],chest:[0.1,0.7,0],head:[-0.1,-0.6,0],armR:[-0.9,0,1.5],foreR:[-0.1,0,0],handR:[0.0,1.2,0.2],armL:[-0.5,0,-0.3],foreL:[-1.2,0.2,0.2],handL:[0,0,0],thighR:[0.3,0,0.15],shinR:[0.3,0,0],footR:[-0.5,0,0],thighL:[-0.7,0,-0.1],shinL:[0.8,0,0],footL:[-0.1,0,0]},
 hw:{root:[-0.1,0,0],hips:[0,0,0],spine:[-0.15,0,0],chest:[-0.1,0.1,0],head:[0.1,0,0],armR:[-2.9,0,0.25],foreR:[-0.7,0,0],handR:[0.1,0,0],armL:[-2.6,0,-0.1],foreL:[-1.4,0.2,0.2],handL:[0,0,0],thighR:[0.3,0,0.1],shinR:[0.4,0,0],footR:[-0.7,0,0],thighL:[-0.5,0,-0.1],shinL:[0.5,0,0],footL:[0,0,0]},
 hs:{root:[-0.3,0,0],hips:[0,0,0],spine:[0.6,0,0],chest:[0.25,0,0],head:[-0.4,0,0],armR:[-1.1,0,0.05],foreR:[-0.1,0,0],handR:[0.9,0,0],armL:[-0.6,0,-0.3],foreL:[-1.0,0.2,0.2],handL:[0,0,0],thighR:[-1.0,0,0.1],shinR:[1.2,0,0],footR:[-0.2,0,0],thighL:[0.6,0,-0.1],shinL:[0.6,0,0],footL:[-1.1,0,0]},
 drink:{root:[0,0,0],hips:[0,0.1,0],spine:[-0.05,0,0],chest:[-0.05,-0.1,0],head:[0.35,0,0],armR:[-0.2,0,0.25],foreR:[-0.6,0,0],handR:[0.4,0,0],armL:[-1.2,0,-0.1],foreL:[-2.2,0.4,0.4],handL:[0,0,0],thighR:[-0.2,0,0.1],shinR:[0.3,0,0],footR:[-0.1,0,0],thighL:[0.15,0,-0.1],shinL:[0.2,0,0],footL:[-0.35,0,0]},
 hurt:{root:[-0.05,0,0],hips:[0,0,0],spine:[-0.4,0,0.1],chest:[-0.2,0.2,0],head:[0.4,0,0],armR:[0.4,0,0.6],foreR:[-0.5,0,0],handR:[0.2,0,0],armL:[0.2,0,-0.6],foreL:[-0.8,0,0],handL:[0,0,0],thighR:[-0.5,0,0.1],shinR:[0.6,0,0],footR:[-0.1,0,0],thighL:[0.3,0,-0.1],shinL:[0.4,0,0],footL:[-0.6,0,0]},
 thrust:{root:[-0.12,0,0],hips:[0,0,0],spine:[0.3,0,0],chest:[0.05,0.05,0],head:[-0.45,0,0],armR:[-2.1,0,-0.05],foreR:[0,0,0],handR:[1.35,0,0],armL:[-0.2,0,-0.4],foreL:[-0.6,0,0],handL:[0,0,0],thighR:[-0.9,0,0.1],shinR:[0.9,0,0],footR:[0,0,0],thighL:[0.5,0,-0.1],shinL:[0.4,0,0],footL:[-0.9,0,0]},
 down:{root:[-0.7,0,0],hips:[0,0,0],spine:[0.9,0,0],chest:[0.3,0,0],head:[0.5,0,0],armR:[-0.2,0,0.4],foreR:[-0.3,0,0],handR:[0.5,0,0],armL:[-0.2,0,-0.4],foreL:[-0.3,0,0],handL:[0,0,0],thighR:[-1.6,0,0.1],shinR:[2.4,0,0],footR:[0.6,0,0],thighL:[-1.5,0,-0.1],shinL:[2.4,0,0],footL:[0.6,0,0]},
};
const BK={
 idle:{root:[0,0,0],hips:[0,-0.1,0],spine:[0.28,0,0],chest:[0.12,0.1,0],head:[-0.3,0,0],armR:[-0.15,0,0.3],foreR:[-0.35,0,0],handR:[0.75,0.15,0],armL:[-0.4,0,-0.35],foreL:[-0.7,0,0],handL:[0,0,0],
   thighR:[-0.3,0,0.18],shinR:[0.45,0,0],footR:[-0.15,0,0],thighL:[0.2,0,-0.18],shinL:[0.35,0,0],footL:[-0.55,0,0]},
 idle2:{root:[-0.06,0,0],hips:[0,-0.1,0],spine:[0.32,0,0],chest:[0.14,0.12,0],head:[-0.32,0,0],armR:[-0.17,0,0.32],foreR:[-0.4,0,0],handR:[0.75,0.15,0],armL:[-0.45,0,-0.35],foreL:[-0.75,0,0],handL:[0,0,0],
   thighR:[-0.34,0,0.18],shinR:[0.55,0,0],footR:[-0.2,0,0],thighL:[0.18,0,-0.18],shinL:[0.45,0,0],footL:[-0.63,0,0]},
 walk1:{root:[0,0,0],hips:[0,0,0],spine:[0.3,0,0],chest:[0.1,0.15,0],head:[-0.3,0,0],armR:[0.1,0,0.3],foreR:[-0.3,0,0],handR:[0.75,0.15,0],armL:[-0.5,0,-0.35],foreL:[-0.7,0,0],handL:[0,0,0],thighR:[-0.5,0,0.15],shinR:[0.4,0,0],footR:[0.1,0,0],thighL:[0.35,0,-0.15],shinL:[0.6,0,0],footL:[-0.4,0,0]},
 walk2:{root:[0,0,0],hips:[0,0,0],spine:[0.3,0,0],chest:[0.1,-0.15,0],head:[-0.3,0,0],armR:[-0.3,0,0.3],foreR:[-0.3,0,0],handR:[0.75,0.15,0],armL:[-0.2,0,-0.35],foreL:[-0.7,0,0],handL:[0,0,0],thighR:[0.35,0,0.15],shinR:[0.6,0,0],footR:[-0.4,0,0],thighL:[-0.5,0,-0.15],shinL:[0.4,0,0],footL:[0.1,0,0]},
 raise:{root:[0,0,0],hips:[0,0.1,0],spine:[-0.15,0,0],chest:[-0.15,0.2,0],head:[0.1,0,0],armR:[-2.95,0,0.35],foreR:[-0.35,0,0],handR:[-0.3,0,0],armL:[-2.5,0,-0.2],foreL:[-0.9,0,0],handL:[0,0,0],thighR:[-0.3,0,0.2],shinR:[0.4,0,0],footR:[-0.1,0,0],thighL:[0.3,0,-0.2],shinL:[0.3,0,0],footL:[-0.6,0,0]},
 slam:{root:[-0.25,0,0],hips:[0,0,0],spine:[0.7,0,0],chest:[0.3,0,0],head:[-0.5,0,0],armR:[-1.0,0,0.1],foreR:[-0.15,0,0],handR:[1.1,0,0],armL:[-1.1,0,-0.1],foreL:[-0.3,0,0],handL:[0,0,0],thighR:[-0.9,0,0.2],shinR:[1.0,0,0],footR:[-0.1,0,0],thighL:[0.6,0,-0.2],shinL:[0.6,0,0],footL:[-1.2,0,0]},
 sw1:{root:[-0.05,0,0],hips:[0,0.45,0],spine:[0.2,0.3,0],chest:[0.05,0.75,0],head:[-0.25,-0.6,0],armR:[-0.7,0,1.45],foreR:[-0.35,0,0],handR:[0.35,0.7,0.2],armL:[-0.6,0,-0.3],foreL:[-0.9,0,0],handL:[0,0,0],thighR:[0.1,0,0.25],shinR:[0.4,0,0],footR:[-0.5,0,0],thighL:[-0.5,0,-0.2],shinL:[0.5,0,0],footL:[0,0,0]},
 sw2:{root:[-0.15,0,0],hips:[0,-0.45,0],spine:[0.35,-0.3,0],chest:[0.1,-0.85,0],head:[-0.3,0.7,0],armR:[-1.5,0,-0.3],foreR:[-0.1,0,0],handR:[0.45,-1.0,0],armL:[-0.4,0,-0.6],foreL:[-0.6,0,0],handL:[0,0,0],thighR:[-0.7,0,0.2],shinR:[0.8,0,0],footR:[-0.1,0,0],thighL:[0.45,0,-0.2],shinL:[0.4,0,0],footL:[-0.85,0,0]},
 cast:{root:[0,0,0],hips:[0,-0.2,0],spine:[0.05,0,0],chest:[-0.1,-0.3,0],head:[-0.1,0.2,0],armR:[-0.15,0,0.35],foreR:[-0.35,0,0],handR:[0.75,0.15,0],armL:[-2.4,0,-0.5],foreL:[-0.6,0,0],handL:[0,0,0],thighR:[-0.3,0,0.18],shinR:[0.4,0,0],footR:[-0.1,0,0],thighL:[0.2,0,-0.18],shinL:[0.35,0,0],footL:[-0.55,0,0]},
 throw:{root:[-0.05,0,0],hips:[0,0.2,0],spine:[0.3,0,0],chest:[0.1,0.3,0],head:[-0.3,0,0],armR:[-0.15,0,0.35],foreR:[-0.35,0,0],handR:[0.75,0.15,0],armL:[-1.5,0,-0.2],foreL:[-0.1,0,0],handL:[0,0,0],thighR:[-0.5,0,0.18],shinR:[0.6,0,0],footR:[-0.1,0,0],thighL:[0.3,0,-0.18],shinL:[0.3,0,0],footL:[-0.6,0,0]},
 crouch:{root:[-0.55,0,0],hips:[0,0,0],spine:[0.7,0,0],chest:[0.2,0,0],head:[-0.5,0,0],armR:[0.3,0,0.4],foreR:[-0.5,0,0],handR:[0.75,0.15,0],armL:[0.2,0,-0.4],foreL:[-0.5,0,0],handL:[0,0,0],thighR:[-1.5,0,0.2],shinR:[2.0,0,0],footR:[-0.5,0,0],thighL:[-1.3,0,-0.2],shinL:[2.0,0,0],footL:[-0.7,0,0]},
 air:{root:[0,0,0],hips:[0,0,0],spine:[-0.2,0,0],chest:[-0.1,0,0],head:[0.1,0,0],armR:[-3.0,0,0.2],foreR:[-0.3,0,0],handR:[-0.2,0,0],armL:[-2.7,0,-0.1],foreL:[-0.6,0,0],handL:[0,0,0],thighR:[-1.2,0,0.1],shinR:[1.8,0,0],footR:[0,0,0],thighL:[-0.4,0,-0.1],shinL:[1.5,0,0],footL:[0,0,0]},
 kneel:{root:[-0.95,0,0],hips:[0,0,0],spine:[0.75,0,0],chest:[0.3,0,0],head:[-0.2,0,0],armR:[0.2,0,0.3],foreR:[-0.6,0,0],handR:[1.2,0,0],armL:[-0.6,0,-0.2],foreL:[-0.9,0,0],handL:[0,0,0],thighR:[-1.4,0,0.15],shinR:[1.45,0,0],footR:[0,0,0],thighL:[0.1,0,-0.15],shinL:[1.9,0,0],footL:[0.3,0,0]},
 roar:{root:[-0.15,0,0],hips:[0,0,0],spine:[-0.25,0,0],chest:[-0.25,0,0],head:[-0.35,0,0],armR:[-0.6,0,1.25],foreR:[-0.4,0,0],handR:[0.6,0.2,0],armL:[-0.6,0,-1.25],foreL:[-0.4,0,0],handL:[0,0,0],thighR:[-0.5,0,0.3],shinR:[0.7,0,0],footR:[-0.2,0,0],thighL:[-0.5,0,-0.3],shinL:[0.7,0,0],footL:[-0.2,0,0]},
};
function rootM(x,y,z,yaw,pitch,dy){return RG.mmul(RG.trs([x,y+(dy||0),z],0,yaw,0),RG.trs([0,0,0],pitch||0,0,0))}
// the knight's roll: the whole body turns over the hip once
function knightMats(x,z,yaw,pose,spin){const r=pose.root||[0,0,0];
  const R0=spin?RG.mmul(RG.trs([x,0.55*KS,z],0,yaw,0),RG.mmul(RG.trs([0,0,0],spin,0,0),RG.trs([0,-0.55*KS+r[0]*KS,0]))):rootM(x,0,z,yaw,r[1],r[0]*KS);return RG.solve(KSK,pose,R0)}
function bossMats(x,y,z,yaw,pose){const r=pose.root||[0,0,0];return RG.solve(BSK,pose,rootM(x,y,z,yaw,r[1],r[0]*BS))}
// ---------------- capes: a cloth grid hung from the shoulder blades, stepped in tick ----------------
const capeK=()=>RG.cloth(4,7,0.42,1.05),capeB=()=>RG.cloth(6,9,1.35,3.4);
function capeAnch(M,s,w,y,z,n){const a=[];for(let i=0;i<n;i++){const u=i/(n-1)-0.5;a.push(ap(M.chest,[u*w*s,y*s,(z-Math.abs(u)*0.06)*s]))}return a}
function behind(c,M,s,m){const hc=ap(M.hips,[0,0.1*s,0]);let bk=apv(M.hips,[0,0,-1]);bk=norm([bk[0],0,bk[2]]);for(let k=c.cols;k<c.pts.length;k++){const q=c.pts[k];if(q.p[1]>hc[1])continue;const d=dot(sub(q.p,hc),bk);if(d<m){const dd=scl(bk,m-d);q.p=add(q.p,dd);q.o=add(q.o,scl(dd,0.8))}}}
function stepKnightCape(c,M,wind){const s=KS;RG.clothStep(c,capeAnch(M,s,0.36,0.27,-0.15,c.cols),wind,[{c:ap(M.chest,[0,0.12*s,0]),r:0.19*s},{c:ap(M.hips,[0,-0.06*s,-0.02*s]),r:0.2*s},{c:ap(M.shinR,[0,0,0]),r:0.08*s},{c:ap(M.shinL,[0,0,0]),r:0.08*s}]);behind(c,M,s,0.16*s)}
function stepBossCape(c,M,wind){const s=BS;RG.clothStep(c,capeAnch(M,s,0.42,0.24,-0.22,c.cols),wind,[{c:ap(M.chest,[0,0.12*s,-0.02*s]),r:0.23*s},{c:ap(M.hips,[0,-0.06*s,-0.03*s]),r:0.22*s},{c:ap(M.shinR,[0,0,0]),r:0.1*s},{c:ap(M.shinL,[0,0,0]),r:0.1*s}]);behind(c,M,s,0.24*s)}
// ---------------- camera and light, refreshed before painting ----------------
let CM=null,LT=null,RIMK=0.6,LX=0,BACK=1;
function begin(){const c=SCN().CAM;CM={r:[c.c,0,-c.s],f:[c.s,0,c.c],F:c.F,proj:SCN().proj};const sd=SCN().SUND;
  let lx=sd[0]*c.c-sd[2]*c.s,ly=-sd[1],lz=-(sd[0]*c.s+sd[2]*c.c);const l=Math.hypot(lx,ly,lz);lx/=l;ly/=l;lz/=l;
  BACK=Math.max(0,-lz);LX=lx;LT={k:[lx,ly,lz],kk:1.0-0.22*(1-BACK),amb:0.16-0.04*(1-BACK),f:0.46-0.2*(1-BACK)};RIMK=0.22+0.66*BACK;if(SCN().light){const o=SCN().light(lx,ly,lz,BACK);LT=o.LT;RIMK=o.rimk}}
const pj=v=>CM.proj(v[0],v[1],v[2]);
const camN=n=>[dot(n,CM.r),-n[1],-dot(n,CM.f)];// a world normal in the painter's light space
const litN=(n,bias)=>X.lit(...camN(n),LT)+(bias||0);
let SC=1;// radii below are in skeleton units: scaled by the figure's size
function capW(C,a,b,r0,r1,ramp,o){r0*=SC;r1*=SC;const A=pj(a),B=pj(b);if(!A||!B)return null;o.za=A[2];o.zb=B[2];o.F=CM.F;X.cap(C,A[0],A[1],B[0],B[1],Math.max(0.6,r0*CM.F/A[2]),Math.max(0.6,r1*CM.F/B[2]),ramp,LT,o);return[A,B]}
function ellW(C,cen,ax,ramp,fn,id,nr){X.ellip3(C,cen,ax,ramp,LT,CM,fn,id,nr)}
function quadW(C,A,B,Cc,D,fn,id){const a=pj(A),b=pj(B),c=pj(Cc),d=pj(D);if(!a||!b||!c||!d)return;X.quad(C,a,b,c,d,fn,id)}
// painter's list: parts sorted far to near; ids are handed out in that order so seams fall on the nearer part's edge
let ID=1;const nid=()=>ID<250?ID++:250;
function list(){const a=[];return{add(pt,fn,bias){const c=SCN().toCam(pt[0],pt[1],pt[2]);a.push({z:c[2]-(bias||0),fn})},run(){a.sort((u,v)=>v.z-u.z);ID=1;for(const it of a)it.fn()}}}
const fr=x=>x-Math.floor(x);
// a cloth grid painted cell by cell: folds across u, a ragged hem, the lining shown when we see its inside
function paintCloth(C,cl,out,ramp,lining,o){const{cols,rows,pts}=cl;const id=nid();const SU=o.su||3,SV=2;const nu=(cols-1)*SU+1,nv=(rows-1)*SV+1;
  const G=(i,j)=>pts[Math.min(rows-1,j)*cols+Math.min(cols-1,i)].p;
  // a finer grid, bilinear between the simulated points, pushed in and out into real folds that deepen toward the hem
  const FP=[];for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const ci=Math.min(cols-2,Math.floor(i/SU)),cj=Math.min(rows-2,Math.floor(j/SV)),fu=i/SU-ci,fv=j/SV-cj;
    const p=add(scl(add(scl(G(ci,cj),1-fu),scl(G(ci+1,cj),fu)),1-fv),scl(add(scl(G(ci,cj+1),1-fu),scl(G(ci+1,cj+1),fu)),fv));
    const tu=sub(G(ci+1,cj),G(ci,cj)),tv=sub(G(ci,cj+1),G(ci,cj));let n=norm(cross(tu,tv));if(dot(n,out)<0)n=scl(n,-1);
    const gu=i/(nu-1),gv=j/(nv-1);const d=o.amp*Math.sin(gu*Math.PI*o.folds+o.ph+gv*0.9)*(0.25+0.75*gv);FP.push(add(p,scl(n,d)))}
  const NP=[];for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=FP[j*nu+Math.max(0,i-1)],b=FP[j*nu+Math.min(nu-1,i+1)],c=FP[Math.max(0,j-1)*nu+i],d=FP[Math.min(nv-1,j+1)*nu+i];let n=norm(cross(sub(b,a),sub(d,c)));if(dot(n,out)<0)n=scl(n,-1);NP.push(n)}
  const cam=[SCN().CAM.x,SCN().CAM.h,SCN().CAM.z];const cells=[];
  for(let j=0;j<nv-1;j++)for(let i=0;i<nu-1;i++){const k=j*nu+i;const m=scl(add(add(FP[k],FP[k+1]),add(FP[k+nu],FP[k+nu+1])),0.25);cells.push({i,j,k,z:SCN().toCam(m[0],m[1],m[2])[2]})}
  cells.sort((u,v)=>v.z-u.z);
  for(const q of cells){const k=q.k;const n0=NP[k],n1=NP[k+1],n2=NP[k+nu+1],n3=NP[k+nu];const nm=norm(add(add(n0,n1),add(n2,n3)));const inside=dot(nm,sub(cam,FP[k]))<0;const rp=inside?lining:ramp;
    const L4=[n0,n1,n2,n3].map(n=>Math.min(0.86,litN(inside?scl(n,-1):n,inside?-0.1:0)));
    quadW(C,FP[k],FP[k+1],FP[k+nu+1],FP[k+nu],(u,v)=>{const gu=(q.i+u)/(nu-1),gv=(q.j+v)/(nv-1);const ti=Math.floor(gu*o.tat),tf=gu*o.tat-ti;const cut=(o.rag*hash(ti,3,o.seed)+(ti%3===1?o.rag*0.5:0))*(1-Math.abs(tf-0.5)*1.6)+0.012;if(gv>1-cut)return -1;
      let Lv=(L4[0]*(1-u)+L4[1]*u)*(1-v)+(L4[3]*(1-u)+L4[2]*u)*v;Lv-=gv*0.05;if(o.trim&&gv<0.03)return X.band(o.trim,Lv+0.1);return X.band(rp,Lv)},id)}}
// a skirt of panels hanging from the belt; the bottom edge follows the thighs
function skirt(q,C,M,s,o){const n=o.n;const J=(b,v)=>ap(M[b],[v[0]*s,v[1]*s,v[2]*s]);
  const dR=sub(J('shinR',[0,0,0]),J('hips',[0.1,-0.48,0])),dL=sub(J('shinL',[0,0,0]),J('hips',[-0.1,-0.48,0]));
  for(let i=0;i<n;i++){const a0=(i/n-0.5)*Math.PI*2,a1=((i+1)/n-0.5)*Math.PI*2,am=(a0+a1)/2;const len=o.len(i,am);
    const T0=J('hips',[Math.sin(a0)*o.rt,o.top,Math.cos(a0)*o.rt*o.dz]),T1=J('hips',[Math.sin(a1)*o.rt,o.top,Math.cos(a1)*o.rt*o.dz]);
    const leg=(a)=>{const sx=Math.sin(a);const w=Math.max(0,Math.cos(a))*0.7+0.25;return scl(sx>0?dR:dL,w*Math.min(1,Math.abs(sx)*1.6+0.3))};
    const B0=add(J('hips',[Math.sin(a0)*o.rb,o.top-len,Math.cos(a0)*o.rb*o.dz]),leg(a0)),B1=add(J('hips',[Math.sin(a1)*o.rb,o.top-len,Math.cos(a1)*o.rb*o.dz]),leg(a1));
    const mid=scl(add(add(T0,T1),add(B0,B1)),0.25);
    q.add(mid,()=>{let nn=norm(cross(sub(T1,T0),sub(B0,T0)));const outw=sub(mid,J('hips',[0,o.top-len*0.5,0]));if(dot(nn,outw)<0)nn=scl(nn,-1);const Lb=litN(nn);const id=nid();
      quadW(C,T0,T1,B1,B0,(u,v)=>{const c=o.col(i,am,u,v,Lb);return c},id)},o.bias||0)}}
// ================= the knight =================
const RST=[0x14141c,0x1e202a,0x2a2d3a,0x3a3e4c,0x4e5262,0x666b7c,0x838899],RCAPE=[0x140e10,0x1e1618,0x2a2022,0x382a2a,0x4a3834,0x5c483e,0x705a4c],
  RLIN=[0x0e0a0c,0x161012,0x22181a,0x2e2224],RLEA=[0x1a120e,0x281c16,0x3a2a1e,0x4e3828,0x664a34],RGOLD=[0x3e2a10,0x6a4c1e,0x9a7430,0xc89c48,0xeccb7c,0xfff0c0],
  RWOOD=[0x22160e,0x342216,0x4a3020,0x60402a,0x7a5434,0x946a42],RPAINT=[0x2a0e0e,0x40161a,0x5a2024,0x762c2c,0x8e3a32],RMAIL=[0x16161e,0x24262e,0x343844,0x4a4e5a,0x60667a];
const KBL={d:0x4a505c,m:0x8c94a2,l:0xc4ccd8,e:0xfff8e8};
const KC=X.cv(W,H),BC=X.cv(W,H);
function paintKnight(M,o){o=o||{};X.clear(KC);begin();const s=KS,C=KC;SC=s;const q=list();
  const J=(b,v)=>v?ap(M[b],[v[0]*s,v[1]*s,v[2]*s]):ap(M[b],[0,0,0]),V=(b,v)=>apv(M[b],[v[0]*s,v[1]*s,v[2]*s]);
  const back=V('chest',[0,0,-1]);
  // cape
  if(o.cape){const cl=o.cape;let m=[0,0,0];for(const p of cl.pts)m=add(m,p.p);m=scl(m,1/cl.pts.length);
    q.add(m,()=>paintCloth(C,cl,back,RCAPE,RLIN,{folds:5,amp:0.035*s,ph:0.4,rag:0.12,tat:9,seed:5}),-0.02)}
  // chest: a breastplate with a ridge down the middle; the back plate shows lames
  {const c=J('chest',[0,0.15,0.0]);q.add(c,()=>ellW(C,c,[V('chest',[0.205,0,0]),V('chest',[0,0.175,0]),V('chest',[0,0,0.14])],RST,(p,Lv)=>{let k=Lv;
    if(p[2]>0.2&&Math.abs(p[0])<0.08)k+=0.12;if(p[2]<0&&fr(p[1]*2.6)<0.16)k-=0.16;if(p[1]>0.78)k+=0.06;return X.band(RST,k)},nid()))}
  {const c=J('spine',[0,0.12,0]);q.add(c,()=>ellW(C,c,[V('spine',[0.17,0,0]),V('spine',[0,0.14,0]),V('spine',[0,0,0.125])],RST,(p,Lv)=>X.band(RST,Lv-0.04+(fr(p[1]*1.6+0.5)<0.2?-0.18:0.04)),nid()),-0.01)}
  {const c=J('hips',[0,0.03,0]);q.add(c,()=>ellW(C,c,[V('hips',[0.185,0,0]),V('hips',[0,0.05,0]),V('hips',[0,0,0.14])],RLEA,(p,Lv)=>p[2]>0.82&&Math.abs(p[0])<0.32?X.band(RGOLD,Lv+0.1):X.band(RLEA,Lv),nid()),0.02)}
  // the skirt: a dark tabard front and back, mail at the sides
  skirt(q,C,M,s,{n:10,rt:0.17,rb:0.235,top:-0.01,dz:0.85,len:(i,a)=>Math.abs(Math.cos(a))>0.8?0.4:0.3,bias:0.01,
    col:(i,a,u,v,Lb)=>{const tab=Math.abs(Math.cos(a))>0.8;if(v>0.9-hash(i,2,9)*0.12&&tab)return -1;if(!tab)return X.band(RMAIL,Lb-0.04+(fr(v*7)<0.3?-0.1:0));return X.band(RCAPE,Lb+(u<0.1||u>0.9?-0.1:0)+(v<0.08?0.08:0))}});
  // legs
  for(const sd of['R','L']){const hp=J('thigh'+sd),kn=J('shin'+sd),an=J('foot'+sd),toe=J('foot'+sd,[0,-0.035,0.15]),heel=J('foot'+sd,[0,-0.03,-0.05]);
    q.add(scl(add(hp,kn),0.5),()=>capW(C,hp,kn,0.085,0.07,RMAIL,{id:nid(),fn:(Lv,t)=>X.band(RMAIL,Lv+(fr(t*6)<0.25?-0.08:0))}));
    q.add(scl(add(kn,an),0.5),()=>capW(C,kn,an,0.064,0.05,RST,{id:nid(),fn:(Lv,t,r)=>X.band(RST,Lv+(t>0.85?-0.12:0)+(r<0.3?0.05:0))}));
    {const c=J('shin'+sd,[0,0.0,0.035]);q.add(c,()=>ellW(C,c,[V('shin'+sd,[0.07,0,0]),V('shin'+sd,[0,0.075,0]),V('shin'+sd,[0,0,0.055])],RST,(p,Lv)=>X.band(RST,Lv+0.08+(p[1]<-0.55?-0.2:0)),nid()),0.03)}
    q.add(scl(add(heel,toe),0.5),()=>capW(C,heel,toe,0.055,0.045,RLEA,{id:nid()}),0.01)}
  // arms, pauldrons, gauntlets
  for(const sd of['R','L']){const sg=sd==='R'?1:-1;const sh=J('arm'+sd),el=J('fore'+sd),wr=J('hand'+sd),hd=J('hand'+sd,[0,-0.045,0.01]);
    q.add(scl(add(sh,el),0.5),()=>capW(C,sh,el,0.062,0.053,RMAIL,{id:nid(),fn:(Lv,t)=>X.band(RMAIL,Lv+(fr(t*5)<0.25?-0.1:0))}));
    q.add(scl(add(el,wr),0.5),()=>capW(C,el,wr,0.056,0.064,RST,{id:nid(),fn:(Lv,t,r)=>X.band(RST,Lv+(t>0.86?0.1:0)+(t<0.12?-0.12:0))}),0.01);
    {const c=J('fore'+sd,[0,0,-0.02]);q.add(c,()=>ellW(C,c,[V('fore'+sd,[0.06,0,0]),V('fore'+sd,[0,0.06,0]),V('fore'+sd,[0,0,0.07])],RST,(p,Lv)=>X.band(RST,Lv+0.06),nid()),0.02)}
    q.add(hd,()=>ellW(C,hd,[V('hand'+sd,[0.05,0,0]),V('hand'+sd,[0,0.055,0]),V('hand'+sd,[0,0,0.06])],RLEA,null,nid()),0.03);
    {const c=J('arm'+sd,[0.035*sg,0.02,0]);q.add(c,()=>{for(let i=2;i>=0;i--){const cc=J('arm'+sd,[(0.035+i*0.012)*sg,0.02-i*0.06,0]);
      ellW(C,cc,[V('arm'+sd,[0.13-i*0.012,0,0]),V('arm'+sd,[0,0.095,0]),V('arm'+sd,[0,0,0.135-i*0.01])],RST,(p,Lv)=>{let k=Lv+(i===0?0.06:0);if(p[1]<-0.72)return X.band(RGOLD,k-0.05);return X.band(RST,k)},nid())}},0.12)}}
  // gorget and helm: a rounded great helm, a riveted brow band, the visor slit, a low crest
  {const c=J('neck',[0,0.02,0]);q.add(c,()=>ellW(C,c,[V('neck',[0.105,0,0]),V('neck',[0,0.06,0]),V('neck',[0,0,0.1])],RMAIL,(p,Lv)=>X.band(RMAIL,Lv+(fr(p[1]*3)<0.4?-0.08:0.02)),nid()),0.05)}
  {const c=J('head',[0,0.12,0.005]);q.add(c,()=>ellW(C,c,[V('head',[0.112,0,0]),V('head',[0,0.138,0]),V('head',[0,0,0.128])],RST,(p,Lv)=>{let k=Lv+0.02;
    if(p[2]>0.35&&p[1]>-0.04&&p[1]<0.12&&Math.abs(p[0])<0.8)return 0x0a080e;
    if(p[2]>0.55&&p[1]<-0.2&&p[1]>-0.6&&fr((p[0]+1)*5)<0.35)return 0x0e0c12;// breaths
    if(p[1]>-0.18&&p[1]<-0.06)k+=0.08;if(Math.abs(p[0])<0.11&&p[1]>0.15)k+=0.16;if(p[1]<-0.82)k-=0.1;return X.band(RST,k)},nid()),0.04)}
  // the shield on the left forearm: painted face outward, planks and straps inside
  if(!o.noShield){const c=J('foreL',[-0.1,-0.15,0.02]);const n=V('foreL',[-0.035,0,0]),a1=V('foreL',[0,0.36,0]),a2=V('foreL',[0,0,0.36]);
    q.add(c,()=>ellW(C,c,[a1,a2,n],RWOOD,(p,Lv)=>{const rr=Math.hypot(p[0],p[1]);if(rr>0.86)return X.band(RST,Lv+0.06);
      if(p[2]>0){if(rr<0.2)return X.band(RGOLD,Lv+(rr<0.1?0.15:0));const ang=Math.atan2(p[1],p[0]);const sun=rr<0.52&&rr>0.3;if(sun||(rr<0.86&&rr>0.52&&fr(ang/Math.PI*4+0.25)<0.18))return X.band(RPAINT,Lv+0.08-rr*0.1);return X.band(RWOOD,Lv-0.02+(fr(p[0]*3.5)<0.1?-0.14:0))}
      if(Math.abs(p[1])<0.14&&Math.abs(p[0])<0.6)return X.band(RLEA,Lv);return X.band(RWOOD,Lv-0.08+(fr(p[0]*3.5)<0.1?-0.14:0))},nid()),o.shieldBias!=null?o.shieldBias:0.06)}
  // the sword in the right hand
  const hs=J('handR',[0,-0.04,0.0]);let blade=null;
  {const g0=J('handR',[0,-0.04,-0.075]),g1=J('handR',[0,-0.04,0.08]),gl=J('handR',[-0.13,-0.04,0.1]),gr=J('handR',[0.13,-0.04,0.1]),pm=J('handR',[0,-0.04,-0.095]);
    const sp=[];for(let i=0;i<=10;i++)sp.push(J('handR',[0,-0.04,0.12+0.86*(o.swL||1)*i/10]));const mid=sp[5];
    q.add(mid,()=>{capW(C,g0,g1,0.017,0.017,RLEA,{id:nid(),nr:1});const S2=sp.map(pj);if(S2.every(v=>v)){const k0=CM.F/S2[0][2],k1=CM.F/S2[10][2];X.blade(C,S2,Math.max(1.4,0.034*s*k0),Math.max(1.0,0.018*s*k1),KBL,nid(),o.glow||0);blade=[S2[0],S2[10]]}
      capW(C,gl,gr,0.014,0.014,RGOLD,{id:nid(),bias:0.15});const pp=pj(pm);if(pp)X.ell(C,pp[0],pp[1],Math.max(1.2,0.026*s*CM.F/pp[2]),Math.max(1.2,0.026*s*CM.F/pp[2]),RGOLD,LT,{id:ID-1,z:pp[2]-0.02})},0.08)}
  if(o.flask){const f=J('handL',[0,-0.06,0.05]);q.add(f,()=>{const pp=pj(f);if(pp){const r=Math.max(1.5,0.04*s*CM.F/pp[2]);X.ell(C,pp[0],pp[1],r,r*1.3,[0x7a1a10,0xc83a18,0xff7a30,0xffc070],LT,{id:nid(),bias:0.5,nr:1,z:pp[2]-0.05});X.put(C,pp[0],pp[1]-1,0xfff0c0,ID-1,255,1,pp[2]-0.06)}},0.2)}
  q.run();
  X.finish(C,{ink:0x0c0a10,rim:0xf2d290,rimUp:0.85*RIMK,rimL:RIMK*(0.25+0.5*Math.max(0,-LX)),rimR:RIMK*(0.25+0.5*Math.max(0,LX)),seam:true,selout:0x5a4220});
  const hp=pj(J('head',[0,0.15,0]));C.head=hp;C.hand=blade?blade[0]:null;C.tip=blade?blade[1]:null;return C}
// ================= the king =================
const RIRON=[0x121018,0x1c1a24,0x262430,0x34323f,0x45424f,0x5a5664,0x726c78],RIRONL=[0x1a1820,0x262430,0x34323f,0x45424f,0x5a5664,0x726c78,0x8e8894],
  BGOLD=[0x3e2a10,0x6a4c1e,0x9a7430,0xc89c48,0xeccb7c,0xfff0c0],RCRIM=[0x1a060a,0x300a10,0x4a1016,0x66161c,0x861e24,0xa42c2a,0xc04434],RCLIN=[0x10040a,0x1a060c,0x260a10,0x340e14],
  RFUR=[0x2e2824,0x4a4038,0x6a5e52,0x8e8270,0xb4a690,0xd8ccb2],RBONE=[0x2e261e,0x4a4032,0x6e604c,0x968668,0xbcae8c,0xe0d4b4],BLEA=[0x1a120e,0x2a1c18,0x3c2a22,0x52382a,0x6a4a36];
const BBL={d:0x3a3e4a,m:0x7a828e,l:0xb8c0cc,e:0xfff4dc},BBLG={d:0x6a4a1e,m:0xc89c48,l:0xffe6a0,e:0xfffbe8};
function paintBoss(M,o){o=o||{};X.clear(BC);begin();const s=BS,C=BC;SC=s;const q=list();
  const J=(b,v)=>v?ap(M[b],[v[0]*s,v[1]*s,v[2]*s]):ap(M[b],[0,0,0]),V=(b,v)=>apv(M[b],[v[0]*s,v[1]*s,v[2]*s]);
  const back=V('chest',[0,0,-1]);
  if(o.cape){const cl=o.cape;let m=[0,0,0];for(const p of cl.pts)m=add(m,p.p);m=scl(m,1/cl.pts.length);
    q.add(m,()=>paintCloth(C,cl,back,RCRIM,RCLIN,{folds:6,amp:0.05*s,ph:1.1,rag:0.16,tat:13,seed:7,su:4}),-0.05)}
  // the long tattered skirt: crimson panels, iron tassets, a gold-bordered tabard front and back
  skirt(q,C,M,s,{n:14,rt:0.2,rb:0.3,top:-0.02,dz:0.82,len:(i,a)=>0.62+hash(i,1,13)*0.24+(Math.abs(Math.cos(a))>0.9?0.12:0),bias:0.02,
    col:(i,a,u,v,Lb)=>{const ca=Math.cos(a);const tab=Math.abs(ca)>0.9;const rag=hash(i,4,13)*0.2+hash(Math.floor(u*4),i,5)*0.1;if(v>1-rag)return -1;
      if(i%5===2&&!tab)return X.band(RIRON,Lb+(fr(v*4)<0.18?-0.2:0.02)+(v>0.4?-0.06:0));
      if(tab){if(u<0.12||u>0.88)return X.band(BGOLD,Lb+(v<0.06?0.12:0));return X.band(RCRIM,Lb+0.08-v*0.12+(Math.abs(u-0.5)<0.05?0.06:0))}
      return X.band(RCRIM,Lb-0.02+Math.sin(u*Math.PI*2+i)*0.06-v*0.08)}});
  // torso: a barrel of plate, pectorals, the gold sun sigil, banded faulds, a belt
  {const c=J('chest',[0,0.15,0]);q.add(c,()=>ellW(C,c,[V('chest',[0.27,0,0]),V('chest',[0,0.21,0]),V('chest',[0,0,0.22])],RIRON,(p,Lv)=>X.band(RIRON,Lv+(p[2]<0&&fr(p[1]*2.4)<0.14?-0.16:0)),nid()))}
  {const c=J('chest',[0,0.16,0.075]);q.add(c,()=>ellW(C,c,[V('chest',[0.2,0,0]),V('chest',[0,0.15,0]),V('chest',[0,0,0.135])],RIRONL,(p,Lv)=>{if(p[2]<0)return -1;const d=Math.hypot(p[0],p[1]+0.08);
    if(p[2]>0.6&&d<0.24){if(d<0.1)return X.band(RIRON,Lv-0.1);return X.band(BGOLD,Lv+0.1)}if(p[2]>0.6&&d<0.42&&Math.abs(Math.atan2(p[1]+0.08,p[0])*8/Math.PI%1)<0.25)return X.band(BGOLD,Lv-0.05);
    let k=Lv;if(p[1]>0.7&&p[1]<0.84)return X.band(BGOLD,Lv-0.05);if(Math.abs(p[0])<0.06)k-=0.16;if(p[1]<-0.8)k-=0.1;return X.band(RIRONL,k)},nid()),0.01)}
  {const c=J('spine',[0,0.12,0]);q.add(c,()=>ellW(C,c,[V('spine',[0.215,0,0]),V('spine',[0,0.18,0]),V('spine',[0,0,0.17])],RIRON,(p,Lv)=>X.band(RIRON,Lv+(fr(p[1]*1.5+0.5)<0.2?-0.18:0.04)),nid()),-0.01)}
  {const c=J('hips',[0,0.02,0]);q.add(c,()=>ellW(C,c,[V('hips',[0.215,0,0]),V('hips',[0,0.065,0]),V('hips',[0,0,0.165])],BLEA,(p,Lv)=>p[2]>0.84&&Math.abs(p[0])<0.28?X.band(BGOLD,Lv+0.12):X.band(BLEA,Lv+(Math.abs(p[1])<0.2?0.04:0)),nid()),0.03)}
  // the mane: ragged fur heaped over the shoulders and the back of the neck
  const maneId=nid();for(let k=0;k<14;k++){const a=(k/13-0.5)*3.6;const c=J('chest',[Math.sin(a)*0.24,0.29+hash(k,2,17)*0.05,-Math.cos(a)*0.12-0.02]);
    q.add(c,()=>ellW(C,c,[V('chest',[0.09,0,0]),V('chest',[0,0.075+hash(k,1,17)*0.035,0]),V('chest',[0,0,0.095])],RFUR,(p,Lv)=>{const st=fr(p[0]*2.6+hash(k,5,17)+p[1]*0.4);if(p[1]<-0.5&&st>0.5)return -1;return X.band(RFUR,Lv*0.8-0.08+(st<0.18?-0.18:st>0.8?0.1:0)-(p[1]<-0.3?0.06:0))},maneId),0.06)}
  // legs
  for(const sd of['R','L']){const hp=J('thigh'+sd),kn=J('shin'+sd),an=J('foot'+sd),toe=J('foot'+sd,[0,-0.04,0.18]),heel=J('foot'+sd,[0,-0.03,-0.06]);
    q.add(scl(add(hp,kn),0.5),()=>capW(C,hp,kn,0.145,0.112,RIRON,{id:nid(),fn:(Lv,t)=>X.band(RIRON,Lv+(fr(t*4)<0.2?-0.12:0))}));
    q.add(scl(add(kn,an),0.5),()=>capW(C,kn,an,0.108,0.08,RIRONL,{id:nid(),fn:(Lv,t,r)=>X.band(RIRONL,Lv-0.04+(t>0.86?-0.14:0)+(r<0.3?0.05:0))}));
    {const c=J('shin'+sd,[0,0.0,0.05]);q.add(c,()=>ellW(C,c,[V('shin'+sd,[0.11,0,0]),V('shin'+sd,[0,0.1,0]),V('shin'+sd,[0,0,0.08])],BGOLD,(p,Lv)=>Math.hypot(p[0],p[1])<0.42&&p[2]>0.5?X.band(RIRON,Lv+0.05):X.band(BGOLD,Lv-0.1),nid()),0.04)}
    q.add(scl(add(heel,toe),0.5),()=>capW(C,heel,toe,0.085,0.06,RIRON,{id:nid(),fn:(Lv,t)=>X.band(RIRON,Lv+(t>0.75?0.08:0))}),0.01)}
  // arms: lamed pauldrons with a gold lip, vambraces with a gold band, plated fists
  for(const sd of['R','L']){const sg=sd==='R'?1:-1;const sh=J('arm'+sd),el=J('fore'+sd),wr=J('hand'+sd),hd=J('hand'+sd,[0,-0.05,0.01]);
    q.add(scl(add(sh,el),0.5),()=>capW(C,sh,el,0.11,0.092,RIRON,{id:nid(),fn:(Lv,t)=>X.band(RIRON,Lv+(fr(t*5)<0.22?-0.16:0.02))}));
    q.add(scl(add(el,wr),0.5),()=>capW(C,el,wr,0.088,0.11,RIRON,{id:nid(),fn:(Lv,t,r)=>t>0.66&&t<0.76?X.band(BGOLD,Lv-0.05):X.band(RIRON,Lv+(t>0.9?0.12:0))}),0.01);
    {const c=J('fore'+sd,[0,0,-0.02]);q.add(c,()=>ellW(C,c,[V('fore'+sd,[0.1,0,0]),V('fore'+sd,[0,0.09,0]),V('fore'+sd,[0,0,0.105])],RIRON,(p,Lv)=>X.band(RIRON,Lv+0.06),nid()),0.02)}
    q.add(hd,()=>{ellW(C,hd,[V('hand'+sd,[0.085,0,0]),V('hand'+sd,[0,0.08,0]),V('hand'+sd,[0,0,0.09])],RIRON,(p,Lv)=>X.band(RIRON,Lv+(p[1]<-0.3&&fr(p[0]*2.5)<0.3?0.14:0)),nid())},0.03);
    {const c=J('arm'+sd,[0.06*sg,0.05,0]);q.add(c,()=>{for(let i=2;i>=0;i--){const cc=J('arm'+sd,[(0.07+i*0.018)*sg,0.05-i*0.06,0]);
      ellW(C,cc,[V('arm'+sd,[0.21-i*0.025,0,0]),V('arm'+sd,[0,0.085,0]),V('arm'+sd,[0,0,0.2-i*0.02])],i===0?RIRONL:RIRON,(p,Lv)=>{if(p[1]<-0.66)return X.band(BGOLD,Lv);if(p[1]<-0.36&&p[1]>-0.52&&fr(Math.atan2(p[2],p[0])*2.2)<0.07)return X.band(BGOLD,Lv+0.2);return X.band(i===0?RIRONL:RIRON,Lv+(p[1]>0.5&&i===0?0.05:0))},nid())}},0.2)}}
  // gorget, helm with burning eyes, the broken antler crown
  {const c=J('neck',[0,0.02,0]);q.add(c,()=>ellW(C,c,[V('neck',[0.13,0,0]),V('neck',[0,0.07,0]),V('neck',[0,0,0.12])],RIRON,null,nid()),0.04)}
  const eyes=o.eyes==null?1:o.eyes;
  {const c=J('head',[0,0.12,0.01]);q.add(c,()=>ellW(C,c,[V('head',[0.12,0,0]),V('head',[0,0.14,0]),V('head',[0,0,0.13])],RIRON,(p,Lv)=>{let k=Lv+0.02;
    if(p[2]>0.42&&p[1]>-0.06&&p[1]<0.14&&Math.abs(p[0])<0.78){const e=Math.min(Math.abs(p[0]-0.4),Math.abs(p[0]+0.4));if(eyes>0.5&&e<0.12&&p[1]>-0.02&&p[1]<0.1)return e<0.05?0xfff6d0:0xffb040;return 0x0a0810}
    if(p[2]>0.6&&p[1]<-0.25&&Math.abs(p[0])<0.05)return 0x0e0c12;
    if(Math.abs(p[0])<0.1&&p[1]>0.1)k+=0.14;if(p[1]<-0.85)k-=0.12;return X.band(RIRON,k)},nid()),0.03)}
  {const c=J('head',[0,0.22,0]);q.add(c,()=>{ellW(C,c,[V('head',[0.135,0,0]),V('head',[0,0.035,0]),V('head',[0,0,0.14])],BGOLD,(p,Lv)=>X.band(BGOLD,Lv+(Math.abs(p[1])<0.25?0.06:-0.04)),nid());
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2+0.3;const b0=J('head',[Math.sin(a)*0.125,0.24,Math.cos(a)*0.13]),b1=J('head',[Math.sin(a)*0.13,0.31,Math.cos(a)*0.135]);capW(C,b0,b1,0.016,0.004,BGOLD,{id:nid(),bias:0.1})}
    const tine=(a,b,r)=>capW(C,J('head',a),J('head',b),r,r*0.45,RBONE,{id:nid(),bias:0.05});
    tine([0.1,0.24,0],[0.22,0.45,-0.04],0.024);tine([0.2,0.4,-0.03],[0.33,0.5,0.03],0.016);tine([0.18,0.36,-0.03],[0.2,0.57,-0.08],0.015);tine([0.21,0.44,-0.04],[0.27,0.62,-0.02],0.012);
    tine([-0.1,0.24,0],[-0.17,0.36,-0.02],0.024);tine([-0.16,0.33,-0.02],[-0.19,0.39,0.02],0.012)},0.06)}
  // the greatsword: a long curved blade, gold guard; it burns gold in the second phase
  let blade=null;
  {const g0=J('handR',[0,-0.05,-0.1]),g1=J('handR',[0,-0.05,0.1]),gl=J('handR',[-0.17,-0.05,0.12]),gr=J('handR',[0.17,-0.05,0.12]),pm=J('handR',[0,-0.05,-0.12]);
    const L0=o.swL||1;const sp=[];for(let i=0;i<=12;i++){const t=i/12;sp.push(J('handR',[0,-0.05+t*t*0.16,0.14+1.38*L0*t]))}
    q.add(sp[6],()=>{capW(C,g0,g1,0.025,0.025,BLEA,{id:nid(),nr:1});const S2=sp.map(pj);if(S2.every(v=>v)){const k0=CM.F/S2[0][2],k1=CM.F/S2[12][2];X.blade(C,S2,Math.max(2,0.072*s*k0),Math.max(1.4,0.04*s*k1),o.gold?BBLG:BBL,nid(),o.glow||0);blade=[S2[0],S2[12]]}
      capW(C,gl,gr,0.024,0.024,BGOLD,{id:nid(),bias:0.12});const pp=pj(pm);if(pp){const r=Math.max(1.5,0.035*s*CM.F/pp[2]);X.ell(C,pp[0],pp[1],r,r,BGOLD,LT,{id:ID-1,z:pp[2]-0.05})}},0.1)}
  q.run();
  X.finish(C,{ink:0x0c0910,rim:0xf6d68c,rimUp:0.8*RIMK,rimL:RIMK*(0.22+0.45*Math.max(0,-LX)),rimR:RIMK*(0.22+0.45*Math.max(0,LX)),seam:true,selout:0x6a4a1e});
  C.head=pj(J('head',[0,0.14,0]));C.hand=blade?blade[0]:null;C.tip=blade?blade[1]:null;C.foot=pj(J('hips',[0,-0.95,0]));C.top=pj(J('head',[0,0.6,0]));return C}
return{use:sc=>{SN=sc},skel,rootM,K:{capW,ellW,quadW,list,nid,paintCloth,skirt,pj,litN,fr,setSC:v=>{SC=v},LT:()=>LT,RIMK:()=>RIMK,LX:()=>LX,CM:()=>CM},KN,BK,KS,BS,KSK,BSK,clip:RG.clip,lerp:RG.lerpPose,knightMats,bossMats,capeK,capeB,stepKnightCape,stepBossCape,paintKnight,paintBoss,begin,KC,BC}})();

// ================= the arena under the golden tree, painted for any camera =================
// The camera is a position, a heading and a height; the horizon stays level (lens shift, no tilt), so pillars stay upright.
// The sky is one painted panorama all the way round; the floor is painted per pixel from world coordinates (each stone's tone
// is baked, its mortar lines drawn only where they land as a clean pixel); pillars and braziers are painted at their own size.
const SCENE=(function(){
const {W,H,S,mix,hash,pmod}=NX;
const vn2=(x,y,s)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=hash(i,j,s),b=hash(i+1,j,s),c=hash(i,j+1,s),d=hash(i+1,j+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
const fbm=(x,y,s)=>(vn2(x,y,s)*0.55+vn2(x*2.1,y*2.1,s+1)*0.28+vn2(x*4.3,y*4.3,s+2)*0.17);
// ---------------- the camera ----------------
const CAM={x:0,z:0,h:3.4,yaw:0,F:600,HZ:128,c:1,s:0};
function setCam(o){Object.assign(CAM,o);CAM.c=Math.cos(CAM.yaw);CAM.s=Math.sin(CAM.yaw)}
function toCam(x,y,z){const dx=x-CAM.x,dz=z-CAM.z;return[dx*CAM.c-dz*CAM.s,y,dx*CAM.s+dz*CAM.c]}
function proj(x,y,z){const dx=x-CAM.x,dz=z-CAM.z;const xc=dx*CAM.c-dz*CAM.s,zc=dx*CAM.s+dz*CAM.c;if(zc<0.6)return null;return[W/2+CAM.F*xc/zc,CAM.HZ+CAM.F*(CAM.h-y)/zc,zc]}
const ARENA={x:0,z:21.7,r:13.5};const SUNAZ=0.1,SUNEL=0.26;// the sun sits just right of the tree, low
const SUND=[Math.sin(SUNAZ)*Math.cos(SUNEL),Math.sin(SUNEL),Math.cos(SUNAZ)*Math.cos(SUNEL)];
// ---------------- sky panorama: azimuth around, elevation up; 600 px per radian ----------------
const PF=600,PW=Math.round(Math.PI*2*PF),PUP=300,PDN=10,PH=PUP+PDN;
const PANO=new Int32Array(PW*PH),PEM=new Uint8Array(PW*PH);
const SKYC=[0x2e3c5e,0x3a4a6c,0x46567a,0x56688a,0x627395,0x707e9c,0x828aa2,0x9898a6,0xb0a6a4,0xc8b2a0,0xdcbe9c,0xebc898,0xf4d29a,0xfadca4,0xfee6b4,0xfff0c8];
(function(){const pput=(u,ev,c,e)=>{u=pmod(Math.round(u),PW);const r=PUP-Math.round(ev);if(r<0||r>=PH)return;PANO[r*PW+u]=c;PEM[r*PW+u]=e||0};
  const sunU=SUNAZ*PF,sunE=64;// in the old screen: x=300, 64 rows above the horizon
  for(let r=0;r<PH;r++)for(let u=0;u<PW;u++){const ev=PUP-r;const a=(u>PW/2?u-PW:u)/PF;// azimuth, -pi..pi
    const da=Math.atan2(Math.sin(a-SUNAZ),Math.cos(a-SUNAZ))*PF;const dx=da/220,dy=(ev-sunE)/120;const g=Math.max(0,1-Math.sqrt(dx*dx+dy*dy));
    let t=(128-ev)/132*0.86*0.8+0.2+g*0.3+Math.sin(a*11+ev*0.05)*0.01;let i=Math.floor(t*SKYC.length);i=Math.max(0,Math.min(SKYC.length-1,i));let c=SKYC[i];
    // clouds: long streaks wrapped round the sky; the undersides near the sun catch fire
    const cx=Math.sin(a)*PF,cz=Math.cos(a)*PF;const n=fbm(cx*0.006+cz*0.004+40,ev*0.07,11)+fbm(cx*0.02+cz*0.013+40,ev*0.12,12)*0.25-(ev<30?0.12:0)-(ev>150?0.06:0);
    if(n>0.62&&ev>4){const nb=fbm(cx*0.006+cz*0.004+40,(ev-3)*0.07,11)+fbm(cx*0.02+cz*0.013+40,(ev-3)*0.12,12)*0.25;const under=nb<n-0.015;
      let cc=mix(c,0x8a7e98,0.35);if(n>0.7)cc=mix(c,0xb4a2a8,0.45);if(under)cc=mix(0xe8c49a,0xfff4d8,g);else if(n>0.78)cc=mix(c,0xd8c2b0,0.5);if(g>0.55&&under)cc=0xfff8e0;c=cc}
    PANO[r*PW+u]=c}
  // the golden tree: braided trunk, broad backlit crown
  {const cx=sunU,base=6,top=70;const CL=[];for(let i=0;i<150;i++){const a=hash(i,1,5)*Math.PI,rr=Math.sqrt(hash(i,2,5));const x=cx+Math.cos(a)*165*rr*(hash(i,4,5)<0.5?-1:1)*0.98,y=72+Math.sin(a)*40*rr-hash(i,3,5)*16+6;CL.push([x,y,7+hash(i,5,5)*12])}
    CL.sort((p,q)=>q[1]-p[1]);const RAMP=[0x5a3a18,0x7e5420,0xa0702a,0xc4923a,0xdeb256,0xf2d282,0xfff0c0];const sd=(x,y)=>Math.hypot((x-cx)/150,(y-sunE)/60);
    for(const[qx,qy,qr]of CL)for(let y=Math.floor(qy-qr);y<=qy+qr;y++)for(let x=Math.floor(qx-qr*1.4);x<=qx+qr*1.4;x++){const uu=(x-qx)/(qr*1.4),v=-(y-qy)/qr;const s=uu*uu+v*v;if(s>1)continue;
      const edge=fbm(x*0.25,y*0.25,21);if(s>0.55+edge*0.4)continue;const lf=fbm(x*0.35,y*0.5,22);
      let k=0.18+s*0.5-v*0.12+(lf-0.5)*0.5+Math.max(0,0.5-sd(x,y))*0.6;const i=Math.max(0,Math.min(6,Math.floor(k*7)));const sp=hash(x,y,23)<0.012&&i>=3;pput(x,y,sp?0xfff8e0:RAMP[i],sp?255:i>=5?150:i>=4?70:12)}
    for(let b=0;b<5;b++){let x=cx+(b-2)*2,y=top-6;const ang=-Math.PI/2+(b-2)*0.5;let dx=Math.cos(ang),dy=-Math.sin(ang);for(let i=0;i<46;i++){x+=dx*1.4;y+=dy*0.8;dy-=0.012;if(fbm(x*0.3,y*0.3,24)<0.5){const q=(PUP-Math.round(y))*PW+pmod(Math.round(x),PW);if(PEM[q]>0||PANO[q]>0x400000){pput(x,y,0x5a3a18,10);pput(x,y-1,0x7e5420,10)}}}}
    for(let k=0;k<7;k++)for(let y=base;y<top;y++){const uu=(y-base)/(top-base);const w=13-uu*6+(uu>0.75?(uu-0.75)*30:0);const x=cx+Math.sin(y*0.13+k*0.9)*w*0.55+(k-3)*w*0.14;
      for(let d=-1;d<=1;d++)pput(x+d,y,d===-1?0x6a4418:d===0?0xa8742a:0xe0b050,d===1?140:60)}}
  // mountains all the way round: far range in haze, nearer cliffs (high where the castle stands), a ruined cathedral behind
  for(let u=0;u<PW;u++){const a=(u>PW/2?u-PW:u)/PF;const ca=Math.cos(a)*9,sa=Math.sin(a)*9;
    const h1=14+(fbm(ca*1.1+5,sa*1.1+5,31)*1.4-0.2)*26+(Math.abs(a)>2.2?14:0)*fbm(ca,sa,35);for(let ev=Math.round(h1);ev>=-PDN;ev--){pput(u,ev,ev>h1-2?0xd6b8a8:mix(0xb8a0a4,0xd0b4a0,(h1-ev)/30))}
    const cliff=(a>-0.95&&a<-0.12)?38-(a+0.12)*-12*0+(fbm(ca*3,sa*3,32)*1.4-0.2)*14*(1-(a+0.95)/0.83):8+(fbm(ca*2.4,sa*2.4,33)*1.4-0.2)*9+(a>1.2&&a<2.6?10*fbm(ca*1.7,sa*1.7,36):0);
    for(let ev=Math.round(cliff);ev>=-PDN;ev--)pput(u,ev,ev>cliff-1?0xb08c88:ev>cliff-3?0x8a7280:mix(0x7a6676,0x9a8282,(cliff-ev)/40))}
  // the castle on the cliff
  const T=[[34,40,8,1],[44,62,10,1],[58,46,22,0],[62,74,8,1],[80,56,9,1],[92,38,18,0],[106,48,7,1],[118,30,6,1]];
  for(const[x0,h,w,roof]of T){const u0=x0-240,by=30;for(let y=by;y<by+h;y++)for(let x=0;x<w;x++)pput(u0+x,y,x===w-1?0xb0908a:x===0?0x5e4e62:0x6e5c70);
    if(roof){const rh=Math.round(w*1.3);for(let j=0;j<rh;j++){const hw=(w/2+1)*(1-j/rh);for(let x=Math.round(w/2-hw);x<=w/2+hw;x++)pput(u0+x,by+h+j,x>w/2?0x9a7c80:0x5a4a5e)}}
    else for(let x=0;x<w;x+=2)pput(u0+x,by+h,0x6e5c70);
    for(let k=0;k<2;k++)if(hash(x0,k,3)<0.7)pput(u0+2+((hash(x0,k,4)*(w-3))|0),by+h-5-k*7,0xffc060,220)}
  // behind us: a broken cathedral on the far ridge, its rose window empty against the evening
  {const u0=Math.round(Math.PI*PF)-60,by=26;const P=[[0,58,10],[12,40,26],[40,70,9],[52,34,20],[74,48,8]];
    for(const[x0,h,w]of P)for(let y=by;y<by+h;y++)for(let x=0;x<w;x++){const brk=y>by+h-6&&hash(x0+x,y,9)<0.4;if(brk)continue;pput(u0+x0+x,y,x===0?0x564658:x===w-1?0x8a7480:0x665668)}
    for(let a=0;a<40;a++){const an=a/40*Math.PI*2;pput(u0+25+Math.cos(an)*6,by+30+Math.sin(an)*6,0xc8a890)}}
})();
// ---------------- the floor: a baked tone per stone, mortar drawn per pixel ----------------
const GX0=-44,GZ0=-24,GT=12,GWN=88*GT,GHN=92*GT;const GTONE=new Int32Array(GWN*GHN);
const STONE=[0x6e6458,0x7a7062,0x867a6a,0x928472,0x9e9078];
const PILLARS=[];(function(){for(let i=0;i<12;i++){const a=i/12*Math.PI*2+0.26;const x=Math.cos(a)*ARENA.r,z=ARENA.z+Math.sin(a)*ARENA.r;PILLARS.push({x,z,h:hash(i,1,9)<0.4?2.6+hash(i,2,9)*3:7.5,r:0.62,i,broken:hash(i,1,9)<0.4})}})();
const WALLS=[];(function(){for(let i=0;i<26;i++){const a0=i/26*Math.PI*2+0.05,a1=a0+(0.12+hash(i,1,6)*0.08);if(hash(i,2,6)<0.25)continue;const R=19.5+hash(i,3,6)*1.5;
  WALLS.push({x0:Math.cos(a0)*R,z0:ARENA.z+Math.sin(a0)*R,x1:Math.cos(a1)*R,z1:ARENA.z+Math.sin(a1)*R,h:0.8+hash(i,4,6)*2.8,i})}})();
const BRAZ=[{x:-5.4,z:19.6},{x:5.4,z:19.6},{x:-5.4,z:23.8},{x:5.4,z:23.8}];
function inArena(wx,wz){const r=Math.hypot(wx-ARENA.x,wz-ARENA.z);return r<ARENA.r+fbm(wx*0.3,wz*0.3,41)*2.4-1.2}
(function(){const tl=Math.tan(SUNEL);
  for(let j=0;j<GHN;j++){const wz=GZ0+(j+0.5)/GT;for(let i=0;i<GWN;i++){const wx=GX0+(i+0.5)/GT;let c;
    if(inArena(wx,wz)){const row=Math.floor(wz/1.1),off=(row&1)*0.75,col=Math.floor((wx+off)/1.5);const h=hash(col,row,3);c=STONE[Math.floor(1+h*3.2)];if(h<0.12)c=mix(c,0x5a5048,0.4);
      const ms=fbm(wx*0.35,wz*0.35,32);if(ms>0.6)c=mix(c,0x6e7a3e,Math.min(0.7,(ms-0.6)*4))}
    else{const n=fbm(wx*0.25,wz*0.12,42);c=n>0.55?0x9a9446:n>0.42?0x868a3e:0x727a36;if(hash(Math.floor(wx*3),Math.floor(wz*2),44)<0.04)c=0xd8c060}
    // long shadows of the colonnade, cast away from the low sun
    let sh=0;for(const p of PILLARS){const L=p.h/tl;const ax=wx-p.x,az=wz-p.z;const along=-(ax*SUND[0]+az*SUND[2]);if(along<0||along>L)continue;const across=Math.abs(ax*SUND[2]-az*SUND[0]);if(across<p.r*1.1)sh=Math.max(sh,0.55*(1-along/L*0.6))}
    if(sh)c=mix(c,0x3a3048,sh);
    for(const b of BRAZ){const d=Math.hypot(wx-b.x,wz-b.z);if(d<4)c=mix(c,0xff9a40,(1-d/4)*(1-d/4)*0.45)}
    GTONE[j*GWN+i]=c}}})();
const RINGS=[3.6,4.4];
function drawFloor(){const alb=S.alb,em=S.em,lk=S.lk;const F=CAM.F,h=CAM.h,HZ=CAM.HZ,c=CAM.c,s=CAM.s;
  for(let y=Math.max(0,Math.floor(HZ));y<H;y++){const zc=Math.min(600,F*h/(y+0.5-HZ));if(zc<0)continue;const k=zc/F;const dzdy=zc/(y+0.5-HZ);
    const fogT=Math.min(1,Math.max(0,(zc-24)/70))*0.85;
    for(let x=0;x<W;x++){const xc=(x+0.5-W/2)*k;const wx=CAM.x+xc*c+zc*s,wz=CAM.z-xc*s+zc*c;
      // the pixel's footprint on the floor, per world axis
      const dxx=k*c,dzx=-k*s,dxc=(x+0.5-W/2)/F*dzdy;const dxy=dxc*c+dzdy*s,dzy=-dxc*s+dzdy*c;const fx=Math.abs(dxx)+Math.abs(dxy),fz=Math.abs(dzx)+Math.abs(dzy);
      const ti=Math.floor((wx-GX0)*GT),tj=Math.floor((wz-GZ0)*GT);let col;
      if(ti>=0&&tj>=0&&ti<GWN&&tj<GHN){col=GTONE[tj*GWN+ti];
        if(fz<0.4&&fx<0.6&&inArenaFast(wx,wz)){const rowf=wz/1.1,row=Math.floor(rowf),fr=rowf-row,dz=Math.min(fr,1-fr)*1.1;
          if(dz<fz*0.55)col=mix(col,0x3e362e,fz<0.2?0.7:0.4);else if(fz<0.12&&fr<0.08)col=mix(col,0xb8a88e,0.3);
          const off=(row&1)*0.75,colf=(wx+off)/1.5,fc=colf-Math.floor(colf),dx=Math.min(fc,1-fc)*1.5;if(dx<fx*0.55&&fx<0.3)col=mix(col,0x3e362e,0.6);
          const rr=Math.hypot(wx-ARENA.x,wz-ARENA.z),fp=Math.max(fx,fz)*0.6+0.04;for(const R0 of RINGS)if(Math.abs(rr-R0)<fp)col=mix(col,0xc8a050,0.7);
          if(rr>3.65&&rr<4.35&&Math.abs(rr-4)<fp*1.2&&pmod(Math.floor(Math.atan2(wz-ARENA.z,wx-ARENA.x)*14/Math.PI),2)===0)col=mix(col,0xe0b860,0.6)}}
      else{const n=vn2(wx*0.25,wz*0.12,42);col=n>0.55?0x9a9446:n>0.42?0x868a3e:0x727a36}
      // the low sun bleaches the floor near the horizon in its direction
      const az=Math.atan2(xc*c+zc*s,-xc*s+zc*c);const gl=Math.max(0,1-Math.abs(az-SUNAZ)*1.4)*Math.max(0,1-(y-HZ)/70);
      col=mix(col,0xe6c89a,fogT);if(gl>0)col=mix(col,0xfff0c8,gl*0.45);
      const q=y*W+x;alb[q]=col;em[q]=0;lk[q]=0}}}
function inArenaFast(wx,wz){const dx=wx-ARENA.x,dz=wz-ARENA.z;return dx*dx+dz*dz<(ARENA.r+0.8)*(ARENA.r+0.8)}
function drawSky(){const alb=S.alb,em=S.em,lk=S.lk;const F=CAM.F,HZ=CAM.HZ;const top=Math.min(H,Math.ceil(HZ)+PDN);
  const ucol=new Int32Array(W);for(let x=0;x<W;x++)ucol[x]=pmod(Math.round((CAM.yaw+Math.atan((x+0.5-W/2)/F))*PF),PW);const vk=PF/F;
  for(let y=0;y<top;y++){let r=PUP-Math.round((HZ-y-0.5)*vk);if(r<0)r=0;if(r>=PH)r=PH-1;const ro=r*PW;for(let x=0;x<W;x++){const q=y*W+x,u=ucol[x];alb[q]=PANO[ro+u];em[q]=PEM[ro+u];lk[q]=0}}}
// ---------------- pillars and braziers: painted at their projected size ----------------
const PRAMP=[0x2e2830,0x433a3e,0x5a4e4e,0x74665e,0x958470,0xc8b496,0xf0dcb0];
const PCACHE=new Map();
// face: how much the visible face is lit by the sun (0 backlit .. 1 front lit); side: which edge catches the sun (-1 left, 1 right)
function paintPillar(p,sc,face,side){const qs=Math.round(Math.log(sc)*25);sc=Math.exp(qs/25);face=Math.round(face*4)/4;const key=p.i+'|'+qs+'|'+face+'|'+side;let o=PCACHE.get(key);if(o)return o;if(PCACHE.size>300)PCACHE.clear();
  const w=Math.max(3,Math.round(p.r*2*sc)),h=Math.round(p.h*sc),cw=Math.round(w*1.5),ch=Math.max(2,Math.round(0.45*sc));
  const C=PIX.cv(cw+6,h+ch*2+6);const cx=(cw+6)/2;const top=ch+3,bot=top+h;
  for(let y=top;y<bot;y++)for(let x=0;x<w;x++){const u=(x+0.5)/w*2-1;const fl=w>=8&&((x%4)===0);const edge=u*side>0.7?0.42:u*side<-0.8?0.1:0;
    let L=0.33+face*0.3+edge+(1-Math.abs(u))*0.08-(face>0.5?Math.max(0,-u*side)*0.2:0)+(fl?-0.1:0)-(y-top)/h*0.06;PIX.put(C,cx-w/2+x,y,PIX.band(PRAMP,L),1)}
  if(!p.broken){for(let y=top-ch;y<top;y++)for(let x=-2;x<w+2;x++)PIX.put(C,cx-w/2+x,y,PIX.band(PRAMP,y===top-ch?0.8:0.3+face*0.3),2);for(let x=-3;x<w+3;x++)PIX.put(C,cx-w/2+x,top-ch-1,PIX.band(PRAMP,0.62+face*0.15),2)}
  else{for(let x=0;x<w;x++){const d=Math.floor(hash(x,p.i,4)*4*sc/30+Math.abs(x-w*0.3)*0.4);for(let y=top;y<top+d;y++){const q=y*C.w+Math.round(cx-w/2+x);C.c[q]=-1;C.id[q]=0}PIX.put(C,cx-w/2+x,top+d,PIX.band(PRAMP,0.8),1)}}
  for(let y=bot;y<bot+ch;y++)for(let x=-3;x<w+3;x++)PIX.put(C,cx-w/2+x,y,PIX.band(PRAMP,(x>w*0.7)===(side>0)?0.42+face*0.2:0.26+face*0.2),3);
  PIX.finish(C,{ink:0x2a2026,rim:0xffe8b8,rimUp:0.8*(1-face),rimSide:0.35*(1-face),seam:true});o={C,ox:cx,oy:bot+ch};if(PCACHE.size>400)PCACHE.clear();PCACHE.set(key,o);return o}
// what the camera sees of the sun: how front-lit a surface facing the camera is, and which screen side the sun is on
function sunView(){const sx=SUND[0]*CAM.c-SUND[2]*CAM.s,sz=SUND[0]*CAM.s+SUND[2]*CAM.c;return{face:Math.max(0,-sz)*0.9+0.05,side:sx>=0?1:-1,sx,sz}}
// the scenery items, for depth sorting with the characters
function items(t){const out=[];const sv=sunView();
  for(const p of PILLARS){const pr=proj(p.x,0,p.z);if(!pr||pr[2]<(CAM.near||9))continue;const sc=CAM.F/pr[2];if(pr[0]<-sc*2||pr[0]>W+sc*2)continue;out.push({z:pr[2],draw:()=>{const o=paintPillar(p,sc,sv.face,sv.side);PIX.blit(o.C,pr[0]-o.ox,pr[1]-o.oy+1)}})}
  for(const b of BRAZ){const pr=proj(b.x,0,b.z);if(!pr)continue;out.push({z:pr[2],draw:()=>brazier(pr,CAM.F/pr[2],t+b.x*7)})}
  for(const w of WALLS){const A=proj(w.x0,0,w.z0),B=proj(w.x1,0,w.z1);if(!A||!B||A[2]<Math.min(6,CAM.near||6)||B[2]<Math.min(6,CAM.near||6))continue;out.push({z:(A[2]+B[2])/2,draw:()=>wall(w,A,B,sv)})}
  return out}
// a ruined wall: drawn column by column with perspective-correct interpolation, courses of blocks, a broken top
const WRAMP=[0x3a3236,0x4e4446,0x665a56,0x7e7066,0x9a8a7a,0xbca88e,0xe0cca8];
function wall(w,A,B,sv){const L=Math.hypot(w.x1-w.x0,w.z1-w.z0);const nx=-(w.z1-w.z0)/L,nz=(w.x1-w.x0)/L;// the face normal
  let lit=nx*SUND[0]+nz*SUND[2];const tc=toCam(CAM.x+nx,0,CAM.z+nz);// which face we see
  const ccn=[nx*CAM.c-nz*CAM.s,nx*CAM.s+nz*CAM.c];if(ccn[1]>0)lit=-lit;const base=0.3+Math.max(0,lit)*0.45;
  let P=A,Q=B;if(P[0]>Q[0]){P=B;Q=A}const flip=P!==A;const x0=Math.max(0,Math.ceil(P[0])),x1=Math.min(W-1,Math.floor(Q[0]));const iz0=1/P[2],iz1=1/Q[2];
  for(let x=x0;x<=x1;x++){const s=(x+0.5-P[0])/Math.max(1e-6,Q[0]-P[0]);const iz=iz0+(iz1-iz0)*s;const z=1/iz;const t=(s*iz1)/iz;const u=(flip?1-t:t)*L;
    const yb=CAM.HZ+CAM.F*CAM.h*iz;const top=w.h*(0.75+0.25*Math.sin(u*2.1+w.i))-(hash(Math.floor(u*2),w.i,7)<0.3?0.35:0);const yt=CAM.HZ+CAM.F*(CAM.h-top)*iz;
    for(let y=Math.max(0,Math.ceil(yt));y<=Math.min(H-1,yb);y++){const v=(yb-y)/(CAM.F*iz);const course=Math.floor(v/0.45),bu=(u+(course&1)*0.5)/0.9;const fv=v/0.45-course,fu=bu-Math.floor(bu);
      let Lv=base+(hash(Math.floor(bu),course,w.i)-0.5)*0.12;const pxm=0.9/(CAM.F*iz);if(fv<pxm*0.6*1.5&&CAM.F*iz*0.45>3)Lv-=0.18;else if(fu<pxm&&CAM.F*iz*0.9>4)Lv-=0.14;if(y<=yt+1)Lv+=0.3*(1-sv.face*0.5);
      const fogT=Math.min(1,Math.max(0,(z-24)/70))*0.85;const q=y*W+x;S.alb[q]=mix(PIX.band(WRAMP,Lv),0xe6c89a,fogT);S.em[q]=0;S.lk[q]=0}}}
function brazier(s,scale,t){const sc=scale/27.6;const bx=Math.round(s[0]),by=Math.round(s[1]);
  for(let i=-1;i<=1;i++)NX.line(bx+i*5*sc,by,bx+i*2*sc,by-24*sc,0x241c1c);
  for(let i=-8;i<=8;i++){const yy=by-28*sc+Math.abs(i)*0.25;NX.px(Math.round(bx+i*sc),Math.round(yy),0x2a2020);NX.px(Math.round(bx+i*sc),Math.round(yy)-1,i<0?0x5a4038:0x3a2c28)}
  for(let k=0;k<26;k++){const ph=((t*0.06+k*0.173)%1+1)%1;const a=k*2.39;const r=(6-ph*5)*sc;const fx=bx+Math.cos(a+t*0.03)*r*0.8+Math.sin(t*0.1+k)*ph*2,fy=by-30*sc-ph*22*sc;
    const col=ph<0.25?0xfff4c0:ph<0.5?0xffc050:ph<0.75?0xff7a28:0xb83a18;const sz=ph<0.5&&sc>0.7?2:1;for(let j=0;j<sz;j++)for(let i=0;i<sz;i++)NX.px(Math.round(fx)+i,Math.round(fy)+j,col,ph<0.75?255:120)}
  NX.glow(bx,by-34*sc,26*sc,0xff9040,0.55)}
// a soft round shadow on the floor
function shadow(x,z,r,k){const n=24;const pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const p=proj(x+Math.cos(a)*r,0,z+Math.sin(a)*r);if(!p)return;pts.push(p)}
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}const cx=(x0+x1)/2,cy=(y0+y1)/2,rx=(x1-x0)/2,ry=Math.max(1,(y1-y0)/2);
  for(let y=Math.floor(y0);y<=y1;y++)for(let xx=Math.floor(x0);xx<=x1;xx++){if(xx<0||y<0||xx>=W||y>=H)continue;const u=(xx+0.5-cx)/rx,v=(y+0.5-cy)/ry;const d=u*u+v*v;if(d>1)continue;const q=y*W+xx;S.alb[q]=mix(S.alb[q],0x2a2234,k*(d<0.5?1:0.6))}}
function drawBack(){drawSky();drawFloor();const sv=sunView();// the sun's own glow, where it is on screen
  const sp=proj(CAM.x+SUND[0]*1e4,SUND[1]*1e4*0+0,CAM.z+SUND[2]*1e4);SUNP=null;if(sp){const sy=CAM.HZ-64*CAM.F/PF;SUNP=[sp[0],sy];
    const x0=Math.max(0,Math.floor(sp[0]-70)),x1=Math.min(W-1,Math.ceil(sp[0]+70)),y0=Math.max(0,Math.floor(sy-70)),y1=Math.min(H-1,Math.ceil(sy+70));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)SKYM[y*W+x]=S.alb[y*W+x]}}
// the sun's halo goes on last, and only where nothing stands in front of the sun: a figure in the way keeps a faint fringe
const SKYM=new Int32Array(W*H);let SUNP=null;
function sunGlow(){if(!SUNP)return;const[cx,cy]=SUNP,r=70,r2=r*r;for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(H-1,Math.ceil(cy+r));y++)for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(W-1,Math.ceil(cx+r));x++){
  const dx=x+0.5-cx,dy=y+0.5-cy,d=dx*dx+dy*dy;if(d>=r2)continue;let a=1-d/r2;a=a*a*a*0.45;const p=y*W+x;if(S.alb[p]!==SKYM[p])a*=0.15;NX.addPx(x,y,0xffd890,a)}}
return{CAM,setCam,toCam,proj,drawBack,sunGlow,items,shadow,sunView,ARENA,SUND,fbm,PILLARS}})();

// ================= 1. 断冠骑士 — a souls boss fight seen through several cameras, every pixel painted =================
(function(){
const {W,H,S,mix,hash,rect,recta,text,sfx}=NX;
const SC=SCENE,X=PIX;
const KZ=15.6,BZ=21.7,BOSSN='断冠骑士 瓦尔德';
const pj=(x,z,h)=>SC.proj(x,h||0,z);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
const angD=(a,b)=>((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;
// ---------------- state ----------------
function init(g){g.k={x:-1.1,z:9.5,yaw:0,hp:1,fp:0.62,st:1,flask:3,act:'walk',at:0,run:0,ifr:0,rollDir:[0,1],chain:0,hurtT:0,lastHit:-1};
  g.b={x:0.2,z:BZ,h:0,yaw:Math.PI,hp:1,stance:0,broken:0,act:'kneel',at:0,aid:0,phase:1,aspd:1,cd:70,flash:0,die:0,tx:0,tz:BZ,rise:0,hitBy:-1};
  g.mode='intro';g.mt=0;g.p=[];g.trK=[];g.trB=[];g.dmgNum=0;g.dmgT=0;g.runes=12840;g.red=0;g.fogA=1;g.dag=[];g.waves=[];g.bossShow=0;g.ink=1;g.shake=0;g.slow=0;g.auto=false;g.baitDone=false;g.lastKey=-1;
  g.capeK=FIG.capeK();g.capeB=FIG.capeB();g.view=g.view||'auto';g.shot='back';g.shotT=0;g.side=1;g.orb=0;g.cam=null;g.vlab=0;posePass(g);direct(g)}
// ---------------- the king's moves: windup, a held beat, the hit frame, recovery ----------------
const MOVES={
 slam:{len:118,hit:58,dmg:0.32,glint:44},  // raised high, held — the delay that baits an early roll — then crashes down where you stood
 sweep:{len:88,hit:36,dmg:0.24},           // a flat cut across the whole arena: roll through it
 daggers:{len:96,hit:9999,dmg:0.12},       // three blades of light thrown one after another
 leap:{len:120,hit:62,dmg:0.3},            // up out of sight, down onto you
 roar:{len:104,hit:40,dmg:0.16}};          // phase two: a blast of gold, the blade ignites
function bossAct(g,a){const b=g.b;b.act=a;b.at=0;b.aid++;b.hitDone=false;if(a==='slam'||a==='leap'){b.tx=g.k.x;b.tz=g.k.z}if(a==='daggers')b.thrown=0;sfx(a==='roar'?'big':'whoosh',0.5,0.7)}
function tickBoss(g){const b=g.b,k=g.k;b.at+=b.aspd;b.flash=Math.max(0,b.flash-0.12);if(!b.broken)b.stance=Math.max(0,b.stance-0.06);
  const face=Math.atan2(k.x-b.x,k.z-b.z);const turn=sp=>{const d=angD(b.yaw,face);b.yaw+=clamp(d,-sp,sp)};
  if(b.broken>0){if(!(k.act==='rip'))b.broken--;if(b.broken<=0){b.broken=0;b.act='idle';b.at=0;b.stance=0;b.ripped=false;b.cd=50}return}
  if(b.act==='kneel'||b.act==='dead')return;
  if(b.act==='rise'){turn(0.02);if(b.at>90){b.act='idle';b.at=0;b.cd=40}return}
  const dx=k.x-b.x,dz=k.z-b.z,d=Math.hypot(dx,dz);
  if(b.act==='idle'||b.act==='walk'){b.cd-=b.aspd;turn(0.03);
    // he turns to keep you in front of him and closes in, heavy steps
    if(Math.abs(dx)>0.6){b.x+=Math.sign(dx)*0.022*b.aspd;b.act='walk'}else if(b.act==='walk'&&b.at>30)b.act='idle';
    if(b.z>BZ-1.2&&d>7.5)b.z-=0.012;else if(b.z<BZ&&d<5.5)b.z+=0.01;
    if(b.cd<=0){const ph1=['slam','sweep','daggers','sweep','leap','slam'],ph2=['sweep','slam','leap','daggers','sweep','slam'];
      if(b.phase===1&&b.hp<0.5){b.phase=2;bossAct(g,'roar');return}
      const Ls=b.phase===1?ph1:ph2;bossAct(g,Ls[b.aid%Ls.length])}
    return}
  const M=MOVES[b.act];
  if(b.act==='slam'&&b.at<M.glint){b.tx+=(k.x-b.tx)*0.25;b.tz=k.z;turn(0.05)}if(b.act==='leap'&&b.at<50){b.tx+=(k.x-b.tx)*0.2;b.tz=k.z;turn(0.05)}
  if(b.act==='sweep'&&b.at<24||b.act==='daggers'||b.act==='roar')turn(0.03);
  if(b.act==='daggers'){for(const tAt of[40,56,72])if(b.at>=tAt&&b.at-b.aspd<tAt){const hand=[b.x+Math.cos(b.yaw)*-1.6,b.z-Math.sin(b.yaw)*-1.6-0.2,5.4];g.dag.push({p:hand.slice(),t:0,to:[k.x+(hash(b.aid,tAt,1)-0.5)*0.8,k.z,1.1],hit:false});sfx('laser',0.4,1.4)}}
  if(b.act==='leap'){if(b.at>34&&b.at<62){const u=(b.at-34)/28;b.x+=(b.tx-b.x)*0.1;b.z+=(Math.max(b.tz+3.6,19.2)-b.z)*0.1;b.h=Math.sin(u*Math.PI)*6.5}else b.h=0}
  if(M.hit&&b.at>=M.hit&&!b.hitDone){b.hitDone=true;landBossHit(g)}
  if(b.at>=M.len){b.act='idle';b.at=0;b.cd=(b.phase===2?26:40)+hash(b.aid,3,3)*24}}
function landBossHit(g){const b=g.b,k=g.k;let hit=false;const d=Math.hypot(k.x-b.x,k.z-b.z);
  if(b.act==='slam'){g.shake=0.9;sfx('boom',0.8,0.8);ring(g,b.tx,b.tz-0.5,4.5,0xffe2a0);dust(g,b.tx,b.tz-0.5,26);hit=Math.abs(k.x-b.tx)<1.5&&Math.abs(k.z-b.tz)<2.2}
  if(b.act==='sweep'){sfx('slash',0.8,0.6);hit=d<9}
  if(b.act==='leap'){g.shake=1;sfx('boom',1,0.6);ring(g,b.x,b.z-0.3,6,0xffe2a0);dust(g,b.x,b.z-0.3,40);hit=Math.abs(k.x-b.x)<2.6}
  if(b.act==='roar'){g.shake=0.7;b.aspd=1.22;ring(g,b.x,b.z,9,0xffd27a);for(let i=0;i<60;i++)part(g,{x:b.x,z:b.z,h:3,vx:(hash(i,1,4)-0.5)*0.4,vz:(hash(i,2,4)-0.5)*0.3,vh:hash(i,3,4)*0.2,life:50,c:0xffd27a,em:255});hit=d<6.5}
  if(hit&&k.ifr<=0)hurtKnight(g,MOVES[b.act].dmg,b.act)}
function hurtKnight(g,dmg,src){const k=g.k;k.hp-=dmg;if(g.auto)k.hp=Math.max(0.16,k.hp);k.act='hurt';k.at=0;g.red=1;g.shake=Math.max(g.shake,0.6);g.stop=6;sfx('hurt',0.8);
  for(let i=0;i<14;i++)part(g,{x:k.x,z:k.z-0.1,h:1.2,vx:(hash(i,7,S.frame)-0.5)*0.12,vz:-0.02,vh:hash(i,8,S.frame)*0.12,g:0.008,life:26,c:0xb01820,em:0});
  if(k.hp<=0){k.hp=0;k.act='dead';k.at=0;g.mode='died';g.mt=0;sfx('big',1,0.4)}}
// ---------------- the knight ----------------
function knightAct(g,a,arg){const k=g.k;k.act=a;k.at=0;if(a==='roll'){k.rollDir=arg;k.st-=0.2;sfx('whoosh',0.5,1.3)}if(a==='a1'||a==='a2'){k.st-=0.12;sfx('whoosh',0.4,1.6)}if(a==='heavy'){k.st-=0.26}if(a==='rip')sfx('power',0.6,0.8)}
// the stick in world terms: the autopilot already thinks in the arena's axes; a player's stick follows the camera
function stick(g,pad){let x=pad.x||0,y=-(pad.y||0);if(pad.auto||!g.cam)return[x,y];const c=Math.cos(g.cam.yaw),s=Math.sin(g.cam.yaw);let wx=x*c+y*s,wz=-x*s+y*c;const l=Math.hypot(wx,wz);if(l>1){wx/=l;wz/=l}return[wx,wz]}
function tickKnight(g,pad){const k=g.k,b=g.b;k.at++;k.ifr--;k.st=Math.min(1,k.st+(k.act==='idle'||k.act==='walk'?0.012:0.004));
  const d=Math.hypot(b.x-k.x,b.z-k.z);const busy=['roll','a1','a2','heavy','flask','hurt','rip','dead'].includes(k.act);
  if(k.act==='dead')return;
  if(!busy){const[mx,mz]=stick(g,pad);
    if(mx||mz){k.act='walk';k.run+=1;k.x+=mx*0.05;k.z+=mz*0.045}else if(k.act==='walk')k.act='idle';
    if(pad.jump&&k.st>0.05){knightAct(g,'roll',mx||mz?[mx,mz]:[(k.x<b.x?-1:1),0]);k.ifr=15}
    else if(pad.fire&&k.st>0.05){if(b.broken>0&&!b.ripped&&d<5.6&&Math.abs(k.x-b.x)<2)knightAct(g,'rip');else knightAct(g,'a1')}
    else if(pad.dash&&k.st>0.1)knightAct(g,'heavy');
    else if(pad.special&&k.flask>0)knightAct(g,'flask')}
  // action timelines
  if(k.act==='roll'){if(k.at<18){k.x+=k.rollDir[0]*0.13;k.z+=k.rollDir[1]*0.1}if(k.at===2)dust(g,k.x,k.z,6);if(k.at>=24){k.act='idle'}}
  if(k.act==='a1'||k.act==='a2'){if(k.at<14&&d>4.6)k.z+=0.05;if(k.at===12)swingHit(g,0.034,8);if(k.at>14&&pad.fire&&k.act==='a1'&&k.st>0.05){knightAct(g,'a2')}else if(k.at>=28)k.act='idle'}
  if(k.act==='heavy'){if(k.at>16&&k.at<32&&d>4.6)k.z+=0.06;if(k.at===32)swingHit(g,0.075,22);if(k.at>=52)k.act='idle'}
  if(k.act==='flask'){if(k.at===30){k.hp=Math.min(1,k.hp+0.45);k.flask--;sfx('power',0.5,1.4);for(let i=0;i<20;i++)part(g,{x:k.x+(hash(i,1,9)-0.5)*0.8,z:k.z,h:hash(i,2,9)*1.6,vh:0.03,life:40,c:0xffb060,em:220})}if(k.at>=52)k.act='idle'}
  if(k.act==='hurt'){k.z-=0.03;if(k.at>=26)k.act='idle'}
  if(k.act==='rip'){// step in, drive the blade into the kneeling king, wrench it free
    if(k.at<16){k.x+=(b.x-0.2-k.x)*0.12;k.z+=(b.z-3.0-k.z)*0.12}
    if(k.at===22){b.ripped=true;b.broken=Math.max(b.broken,30);g.stop=14;g.slow=40;b.hp-=0.18;b.flash=1;g.dmgNum=Math.round(0.18*3120);g.dmgT=90;g.shake=0.8;sfx('crit',1);for(let i=0;i<40;i++)part(g,{x:b.x,z:b.z-1,h:2.2,vx:(hash(i,1,5)-0.5)*0.3,vz:-hash(i,2,5)*0.1,vh:(hash(i,3,5)-0.3)*0.25,g:0.01,life:34,c:i%3?0xff9a40:0xfff0c0,em:255})}
    if(k.at>=70){k.act='idle';k.z=Math.min(k.z,b.z-4.2);if(b.hp<=0.001)fell(g)}}
  k.x=clamp(k.x,-5,5);g.b.x=clamp(g.b.x,-4.5,4.5);k.z=clamp(k.z,g.mode==='intro'?8:13.2,Math.min(18.6,b.z-2.8));
  // lock-on: he always squares up to the king, except mid-roll
  const want=k.act==='roll'?Math.atan2(k.rollDir[0],k.rollDir[1]):Math.atan2(b.x-k.x,b.z-k.z);k.yaw+=angD(k.yaw,want)*(k.act==='roll'?0.5:0.2)}
function swingHit(g,dmg,st){const k=g.k,b=g.b;const d=Math.hypot(b.x-k.x,b.z-k.z);if(d>6.6||Math.abs(b.x-k.x)>3.2||b.act==='rise'||b.act==='kneel'||b.act==='dead'||b.h>2)return;
  b.hp-=dmg;b.flash=1;b.stance+=st;g.dmgNum=(g.dmgT>0?g.dmgNum:0)+Math.round(dmg*3120);g.dmgT=70;g.stop=dmg>0.08?7:4;g.shake=Math.max(g.shake,dmg>0.08?0.5:0.25);sfx('hit',0.8,dmg>0.08?0.7:1);
  const hx=b.x+(k.x-b.x)*0.3,hz=b.z-1.4;for(let i=0;i<16;i++)part(g,{x:hx,z:hz,h:2.4+hash(i,4,S.frame)*1.2,vx:(hash(i,1,S.frame)-0.5)*0.25,vz:0,vh:(hash(i,2,S.frame)-0.2)*0.2,g:0.012,life:16+(i%8),c:i%2?0xffe8a0:0xff9a40,em:255,k:'spark'});
  if(b.hp<=0){b.hp=0.0001;b.stance=100;b.broken=0}
  if(b.stance>=100&&!b.broken){b.broken=150;b.ripped=false;b.act='broken';b.at=0;b.stance=100;sfx('big',0.8,1.3);g.shake=0.5}}
function fell(g){const b=g.b;b.hp=0;b.act='dead';b.die=1;g.mode='felled';g.mt=0;sfx('big',1,0.5);g.runes+=48000}
// ---------------- particles, rings, dust, daggers ----------------
function part(g,o){g.p.push(Object.assign({x:0,z:0,h:0,vx:0,vz:0,vh:0,g:0,t:0,life:30,c:0xffffff,em:0,k:'pt'},o))}
function ring(g,x,z,r,c){g.waves.push({x,z,r,t:0,c})}
function dust(g,x,z,n){for(let i=0;i<n;i++){const a=hash(i,S.frame,2)*Math.PI*2;part(g,{x,z,h:0.1,vx:Math.cos(a)*0.08*hash(i,3,S.frame),vz:Math.sin(a)*0.05,vh:0.02+hash(i,4,S.frame)*0.03,g:0.001,life:40+hash(i,5,S.frame)*30,c:0xc8b090,k:'dust',sz:1+hash(i,6,S.frame)*2})}}
function tickFX(g){for(const q of g.p){q.t++;q.x+=q.vx;q.z+=q.vz;q.h+=q.vh;q.vh-=q.g;if(q.h<0&&q.k!=='mote'){q.h=0;q.vh*=-0.3;q.vx*=0.6}q.vx*=0.97;q.vz*=0.97}g.p=g.p.filter(q=>q.t<q.life);
  for(const w of g.waves)w.t++;g.waves=g.waves.filter(w=>w.t<40);
  const k=g.k;for(const d of g.dag){d.t++;if(d.hit)continue;const dx=d.to[0]-d.p[0],dz=d.to[1]-d.p[1],dh=d.to[2]-d.p[2];const Ln=Math.hypot(dx,dz,dh);const sp=0.5;
    if(Ln<sp){d.hit=true;if(k.ifr<=0&&Math.abs(k.x-d.to[0])<0.7&&Math.abs(k.z-d.to[1])<1.2)hurtKnight(g,MOVES.daggers.dmg,'dag');for(let i=0;i<10;i++)part(g,{x:d.p[0],z:d.p[1],h:d.p[2],vx:(hash(i,1,d.t)-0.5)*0.2,vh:hash(i,2,d.t)*0.1,g:0.01,life:18,c:0xffe8a0,em:255});continue}
    d.p=[d.p[0]+dx/Ln*sp,d.p[1]+dz/Ln*sp,d.p[2]+dh/Ln*sp]}
  g.dag=g.dag.filter(d=>d.t<200&&!(d.hit&&d.t>4));
  // gold motes drifting from the tree, always
  if(S.frame%3===0)part(g,{x:(hash(S.frame,1,7)-0.5)*30,z:8+hash(S.frame,2,7)*34,h:hash(S.frame,3,7)*6,vx:0.004,vh:0.006,life:200,c:0xffe6a0,em:200,k:'mote'})}
// ---------------- poses: keyframed on the bone skeletons, timed to the moves ----------------
const KN=FIG.KN,BK=FIG.BK,clip=FIG.clip;
function knightPose(g){const k=g.k,t=k.at;
  switch(k.act){
    case'walk':return clip([[0,KN.run1],[8,KN.run2],[16,KN.run3],[24,KN.run4],[32,KN.run1]],k.run,true);
    case'roll':return KN.tuck;
    case'a1':return clip([[0,KN.idle],[9,KN.a1w],[13,KN.a1s],[28,KN.idle]],t);
    case'a2':return clip([[0,KN.a1s],[9,KN.a2w],[13,KN.a2s],[28,KN.idle]],t);
    case'heavy':return clip([[0,KN.idle],[18,KN.hw],[26,KN.hw],[32,KN.hs],[52,KN.idle]],t);
    case'flask':return clip([[0,KN.idle],[14,KN.drink],[40,KN.drink],[52,KN.idle]],t);
    case'hurt':return clip([[0,KN.hurt],[26,KN.idle]],t);
    case'rip':return clip([[0,KN.idle],[14,KN.a2w],[22,KN.thrust],[60,KN.thrust],[70,KN.idle]],t);
    case'dead':return clip([[0,KN.hurt],[30,KN.down]],t);
    default:return clip([[0,KN.idle],[50,KN.idle2],[100,KN.idle]],S.frame,true)}}
function bossPose(g){const b=g.b,t=b.at;
  if(b.broken>0)return clip([[0,BK.idle],[14,BK.kneel]],150-b.broken);
  switch(b.act){
    case'kneel':case'dead':return BK.kneel;
    case'rise':return clip([[0,BK.kneel],[20,BK.kneel],[90,BK.idle]],t);
    case'walk':return clip([[0,BK.walk1],[30,BK.walk2],[60,BK.walk1]],S.frame,true);
    case'slam':return clip([[0,BK.idle],[26,BK.raise],[54,BK.raise],[59,BK.slam],[90,BK.slam],[116,BK.idle]],t);
    case'sweep':return clip([[0,BK.idle],[22,BK.sw1],[30,BK.sw1],[37,BK.sw2],[60,BK.sw2],[86,BK.idle]],t);
    case'daggers':return clip([[0,BK.idle],[24,BK.cast],[38,BK.cast],[42,BK.throw],[50,BK.cast],[54,BK.cast],[58,BK.throw],[66,BK.cast],[70,BK.cast],[74,BK.throw],[82,BK.cast],[96,BK.idle]],t);
    case'leap':return clip([[0,BK.idle],[26,BK.crouch],[32,BK.air],[58,BK.air],[63,BK.slam],[82,BK.slam],[118,BK.idle]],t);
    case'roar':return clip([[0,BK.idle],[26,BK.crouch],[38,BK.roar],[80,BK.roar],[102,BK.idle]],t);
    default:return clip([[0,BK.idle],[70,BK.idle2],[140,BK.idle]],S.frame,true)}}
// pose, bones and capes advance in tick, so a hit-stop freezes the cloth too
function posePass(g){const k=g.k,b=g.b;const spin=k.act==='roll'&&k.at<24?Math.min(1,k.at/24)*Math.PI*2:0;
  g.kM=FIG.knightMats(k.x,k.z,k.yaw,knightPose(g),spin);g.bM=FIG.bossMats(b.x,b.h,b.z,b.yaw,bossPose(g));
  const wd=[Math.sin(S.frame*0.013)*0.0012+0.0006,0,-0.0008];FIG.stepKnightCape(g.capeK,g.kM,wd);FIG.stepBossCape(g.capeB,g.bM,[wd[0]*1.5,0,wd[2]*1.5])}
// ---------------- cameras ----------------
// back: over the knight's shoulder, locked on; side: square to the fight, against the sun; king: over the king's shoulder, down at you;
// high: a crane looking down across the ring; hero: low in front of the king; rip: tight on the riposte; free: an orbit you turn with N / M
const VIEWS=['auto','back','side','king','high','free'],VNAME={auto:'自动导演',back:'背后锁定',side:'侧面',king:'王的视角',high:'俯瞰',free:'自由环绕',hero:'仰望',rip:'处决特写'};
function shotCam(g,kind){const k=g.k,b=g.b;let dx=b.x-k.x,dz=b.z-k.z;const dl=Math.hypot(dx,dz)||1;dx/=dl;dz/=dl;const rx=dz,rz=-dx;const mx=(k.x+b.x)/2,mz=(k.z+b.z)/2;
  const look=(cx,cz,tx,tz)=>Math.atan2(tx-cx,tz-cz);
  const aim=(c,ty,y)=>{const zc=(mx-c.x)*Math.sin(c.yaw)+(mz-c.z)*Math.cos(c.yaw);c.HZ=y-c.F*(c.h-ty)/Math.max(1,zc);return c};
  switch(kind){
    case'back':{const x=k.x-dx*15.6+rx*1.1,z=k.z-dz*15.6+rz*1.1;return{x,z,h:3.4,yaw:look(x,z,k.x+dx*30+rx*1.1,k.z+dz*30+rz*1.1),F:600,HZ:128,near:9}}
    case'side':{const s=g.side;const x=mx+rx*12.5*s,z=mz+rz*12.5*s;return{x,z,h:2.3,yaw:look(x,z,mx,mz),F:360,HZ:172,near:8}}
    case'king':{const x=b.x+dx*9.5-rx*7,z=b.z+dz*9.5-rz*7;const c={x,z,h:7,yaw:look(x,z,k.x+rx*1.2,k.z+rz*1.2),F:440,near:3};const zc=Math.hypot(k.x-x,k.z-z);c.HZ=200-c.F*(c.h-0.9)/zc;return c}
    case'high':{const x=mx-dx*15+rx*7*g.side,z=mz-dz*15+rz*7*g.side;return aim({x,z,h:12,yaw:look(x,z,mx,mz),F:330,near:6},2.5,150)}
    case'hero':{const x=b.x-dx*14+rx*5,z=b.z-dz*14+rz*5;return{x,z,h:1.0,yaw:look(x,z,b.x+rx*0.6,b.z+rz*0.6),F:400,HZ:214,near:4}}
    case'rip':{const cx=b.x-dx*2,cz=b.z-dz*2;const x=cx+rx*7.5*g.side,z=cz+rz*7.5*g.side;return{x,z,h:1.9,yaw:look(x,z,cx,cz),F:540,HZ:150,near:3}}
    case'free':{const R=13,x=mx+Math.sin(g.orb)*R,z=mz+Math.cos(g.orb)*R;return aim({x,z,h:4.2,yaw:look(x,z,mx,mz),F:440,near:5},2.2,170)}}}
// the director: picks a shot for what is happening, holds it, cuts back to the lock-on
function direct(g){const b=g.b,k=g.k;g.shotT++;const auto=g.view==='auto';let want=g.shot;
  if(!auto){want=g.view}
  else if(g.mode==='intro')want=g.mt<130?'back':g.mt<290?'hero':'back';
  else if(g.mode==='felled')want='free';
  else if(g.mode==='died')want='high';
  else if(k.act==='rip')want='rip';
  else if(!g.auto)want='back';
  else{const fresh=b.at<4;
    if(b.act==='sweep'&&fresh)want='side';else if(b.act==='daggers'&&fresh)want='king';else if(b.act==='leap'&&fresh)want='high';else if(b.act==='roar'&&fresh)want='hero';
    else if((b.act==='idle'||b.act==='walk')&&b.broken===0&&g.shot!=='back'&&g.shotT>50)want='back'}
  if(want!==g.shot){const minHold=g.shot==='rip'?40:!auto?0:g.shot==='back'?30:90;if(g.shotT>=minHold||!auto||k.act==='rip'||g.mode!=='fight'){g.shot=want;g.shotT=0;g.cut=true;if(want==='side'||want==='high'||want==='rip')g.side=hash(b.aid,S.frame>>6,3)<0.5?1:-1;if(want==='free'&&g.mode==='felled')g.orb=g.cam?g.cam.yaw+Math.PI:0;if(!auto)g.vlab=90}}
  if(g.shot==='free'){g.orb+=g.orbIn?g.orbIn*0.03:0.004}
  const tgt=shotCam(g,g.shot);if(!g.cam||g.cut){g.cam=Object.assign({},tgt);g.cut=false;return}
  const c=g.cam,kk=g.shot==='free'?0.25:0.08;for(const f of['x','z','h','F','HZ','near'])c[f]+=(tgt[f]-c[f])*kk;c.yaw+=angD(c.yaw,tgt.yaw)*kk}
// ---------------- the game loop ----------------
function tick(g,pad){g.mt++;const k=g.k,b=g.b;g.red=Math.max(0,g.red-0.035);g.dmgT=Math.max(0,g.dmgT-1);g.shake=Math.max(0,g.shake-0.04);g.ink=Math.max(0,g.ink-0.025);g.auto=!!pad.auto;if(g.slow>0)g.slow--;g.vlab=Math.max(0,g.vlab-1);
  if(pad.alt){g.view=VIEWS[(VIEWS.indexOf(g.view)+1)%VIEWS.length];g.vlab=90}g.orbIn=pad.orbit||0;
  if(g.mode==='intro'){const t=g.mt;
    // walk out of the fog gate behind the camera, the king kneeling at the centre of the ring; he rises and the name appears
    if(t<130){k.act='walk';k.run++;k.z+=0.047;k.x+=(-1.1-k.x)*0.05}else if(k.act==='walk')k.act='idle';
    g.fogA=Math.max(0,1-t/70);
    if(t===140){b.act='rise';b.at=0;sfx('door',0.6,0.5)}if(t>140)b.at++;
    if(t>150)g.bossShow=Math.min(1,g.bossShow+0.02);
    if(t>=290){g.mode='fight';g.mt=0;b.act='idle';b.at=0;b.cd=30}
    if(b.act==='rise'&&b.at>130)b.act='idle';
    k.yaw+=angD(k.yaw,Math.atan2(b.x-k.x,b.z-k.z))*0.2;b.yaw+=angD(b.yaw,Math.atan2(k.x-b.x,k.z-b.z))*0.02;
    tickFX(g);posePass(g);direct(g);return}
  if(g.mode==='fight'){tickKnight(g,pad);tickBoss(g)}
  if(g.mode==='felled'){b.die++;if(g.mt>420){const v=g.view;const n={d:g.d,view:v};init(n);Object.assign(g,n)}}
  if(g.mode==='died'){k.at++;if(g.mt>260){const v=g.view;const n={d:g.d,view:v};init(n);Object.assign(g,n);g.mode='fight';g.k.z=KZ;g.k.x=-1.1;g.b.act='idle';g.b.cd=60;g.bossShow=1;g.fogA=0;g.ink=0;posePass(g)}}
  tickFX(g);posePass(g);direct(g)}
// ---------------- the autopilot: reads the king's windups like a player would ----------------
function threat(g){const b=g.b;const M=MOVES[b.act];if(M&&M.hit<9999&&!b.hitDone)return(M.hit-b.at)/b.aspd;
  let best=99;for(const d of g.dag){if(d.hit)continue;const Ln=Math.hypot(d.to[0]-d.p[0],d.to[1]-d.p[1],d.to[2]-d.p[2]);best=Math.min(best,Ln/0.5)}return best}
function ai(g){const k=g.k,b=g.b;const pad={auto:true,x:0,y:0,fire:false,jump:false,dash:false,special:false};if(g.mode!=='fight'||k.act==='dead')return pad;
  const d=Math.hypot(b.x-k.x,b.z-k.z);const th=threat(g);const key=b.act+':'+b.aid+':'+g.dag.filter(x=>!x.hit).length;
  if(['roll','a1','a2','heavy','flask','rip','hurt'].includes(k.act)){if(k.act==='a1'&&b.broken===0&&(b.act==='idle'||b.act==='walk')&&b.cd>12)pad.fire=true;return pad}
  // the first delayed slam: roll too early, get caught — the lesson every player learns
  const want=b.act==='slam'&&!g.baitDone&&k.hp>0.8?30:b.act==='slam'?6:b.act==='leap'?7:b.act==='sweep'?7:b.act==='roar'?6:6;
  const late=b.phase===2&&hash(b.aid,5,11)<0.3;if(late&&th>2)return pad;
  if(th<=want&&g.lastKey!==key&&k.st>0.1){g.lastKey=key;if(b.act==='slam'&&!g.baitDone)g.baitDone=true;
    const side=k.x<b.x?-1:1;pad.jump=true;pad.x=b.act==='sweep'?0:side;pad.y=b.act==='sweep'||b.act==='roar'?1:0;if(b.act==='sweep'&&d<7)pad.y=-1;return pad}
  if(b.broken>0){if(d>5.2||Math.abs(k.x-b.x)>1.6){pad.x=Math.sign(b.x-0.2-k.x)*(Math.abs(b.x-0.2-k.x)>0.3?1:0);pad.y=d>5.2?-1:0}else pad.fire=true;return pad}
  const safe=(b.act==='idle'||b.act==='walk')&&b.cd>18;
  if(k.hp<0.5&&k.flask>0&&safe&&d>5.6){pad.special=true;return pad}
  if(k.hp<0.5&&k.flask>0&&safe){pad.y=1;return pad}
  const open=(b.act==='idle'||b.act==='walk')&&b.cd>16||(MOVES[b.act]&&b.hitDone&&b.at<MOVES[b.act].len-20);
  if(d>6.2){pad.y=-1;pad.x=Math.abs(k.x-b.x)>1.5?Math.sign(b.x-k.x):0;return pad}
  if(open&&k.st>0.3){if(hash(b.aid,k.chain++,7)<0.22)pad.dash=true;else pad.fire=true;return pad}
  pad.x=Math.sin(g.mt*0.02)>0?1:-1;if(Math.abs(k.x-b.x)>2.4)pad.x=Math.sign(b.x-k.x);return pad}
// ---------------- drawing helpers ----------------
function triA(a,b,c,col,al,em){const pts=[a,b,c];let y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(H-1,Math.ceil(Math.max(a[1],b[1],c[1])));
  for(let y=y0;y<=y1;y++){const yc=y+0.5;const xs=[];for(let i=0;i<3;i++){const p=pts[i],q=pts[(i+1)%3];if((p[1]<=yc)!==(q[1]<=yc))xs.push(p[0]+(yc-p[1])/(q[1]-p[1])*(q[0]-p[0]))}if(xs.length<2)continue;xs.sort((u,v)=>u-v);
    for(let x=Math.max(0,Math.ceil(xs[0]-0.5));x<=Math.min(W-1,Math.floor(xs[1]-0.5));x++){const p=y*W+x;S.alb[p]=mix(S.alb[p],col,al);if(em)S.em[p]=Math.max(S.em[p],em)}}}
// a pixel smear: only the outer part of the blade's sweep, a crescent that thins as it ages
function smear(tr,col,em){const m=(s,k)=>[s.h[0]+(s.t[0]-s.h[0])*k,s.h[1]+(s.t[1]-s.h[1])*k];for(let i=1;i<tr.length;i++){const a=tr[i-1],b=tr[i];const age=b.age;if(age>3||Math.hypot(a.t[0]-b.t[0],a.t[1]-b.t[1])>90)continue;const al=[0.62,0.45,0.28,0.14][age];const k0=0.6+age*0.1;
  const a0=m(a,k0),b0=m(b,k0),a1=m(a,1),b1=m(b,1);triA(a0,a1,b1,col,al,age===0?em:0);triA(a0,b1,b0,col,al,age===0?em:0)}}
function band(y,h,a){for(let j=-h;j<=h;j++){const k=1-Math.abs(j)/h;recta(0,y+j,W,1,0x000000,a*Math.min(1,k*1.6))}}
function trail(g,arr,C,live){if(g._tf!==S.frame){for(const s of arr)s.age++}const a2=arr.filter(s=>s.age<6);arr.length=0;arr.push(...a2);
  if(live&&C.tip&&C.hand&&!arr.some(s=>s.f===S.frame))arr.push({h:[C.hand[0],C.hand[1]],t:[C.tip[0],C.tip[1]],age:0,f:S.frame})}
// ---------------- draw ----------------
function draw(g){NX.setBG(null);NX.begin();NX.screen();NX.gain(0);const t=S.frame,k=g.k,b=g.b;
  S.lq=0;S.haze=0;S.vig=0.42;S.bloomThr=0.18;S.post=null;S.amb=[[1,1,1],[1,1,1]];S.grade={lift:[0.012,0.008,0.02],gain:[1.03,1.0,0.96],sat:1.05};
  // camera shake moves the camera itself
  const sh=g.shake*g.shake;const c=g.cam;SC.setCam(Object.assign({},c,{HZ:c.HZ+Math.cos(t*2.3)*sh*4,yaw:c.yaw+Math.sin(t*1.9)*sh*0.008}));SC.CAM.near=c.near;
  SC.drawBack();
  // shockwave rings on the floor
  for(const w of g.waves){const u=w.t/40;const r=w.r*Math.sqrt(u);for(let a=0;a<160;a++){const an=a/160*Math.PI*2;const p=pj(w.x+Math.cos(an)*r,w.z+Math.sin(an)*r*0.9,0);if(!p)continue;NX.addPx(p[0],p[1],w.c,1.5*(1-u));NX.addPx(p[0],p[1]+1,w.c,0.6*(1-u))}}
  const it=SC.items(t);
  // --- the king ---
  if(g.mode!=='felled'||b.die<300)it.push({z:SC.toCam(b.x,0,b.z)[2],draw(){SC.shadow(b.x,b.z,2.1*Math.max(0.4,1-b.h/9),0.5*Math.max(0.3,1-b.h/8));
    const C=FIG.paintBoss(g.bM,{cape:g.capeB,glow:b.phase===2?200:0,gold:b.phase===2});
    if(b.act==='dead'){const dv=Math.max(0,(b.die-40)/220);const fy=C.foot?C.foot[1]:H,ty=C.top?C.top[1]:0;const cut=fy+12-dv*(fy-ty+40);// dissolve upward from the feet, a seam of gold
      PIX.blit(C,0,0,{dissolve:(x,y)=>{const n=hash(x>>1,y>>1,77)*14;return y+n>cut+14?1:y+n>cut?2:0},gold:0xffe6a0});
      if(dv>0&&dv<1&&t%2===0&&C.foot)for(let i=0;i<6;i++){const px=C.foot[0]+(hash(i,t,3)-0.5)*(fy-ty)*0.5,py=cut-hash(i,t,4)*20;g.p.push({x:0,z:0,h:0,vx:0,vz:0,vh:0,g:0,t:0,life:70,c:0xffe6a0,em:255,k:'scr',sx:px,sy:py,svx:(hash(i,t,5)-0.5)*0.4,svy:-0.6-hash(i,t,6)*0.8})}}
    else PIX.blit(C,0,0,{white:b.flash>0.8?0.25:0,tint:b.flash>0.4&&b.flash<=0.8?[0xffe8c0,0.18]:null});
    trail(g,g.trB,C,b.act==='sweep'&&b.at>=30&&b.at<=40||b.act==='slam'&&b.at>=54&&b.at<=61||b.act==='leap'&&b.at>=58&&b.at<=64);smear(g.trB,b.phase===2?0xffe2a0:0xf0eadc,b.phase===2?90:0);
    if(b.phase===2&&b.act!=='dead'&&C.hand&&C.tip)NX.glow((C.hand[0]+C.tip[0])/2,(C.hand[1]+C.tip[1])/2,30,0xffc060,0.25);
    // the slam's glint: a star on the blade's tip before it falls
    if(b.act==='slam'&&b.at>MOVES.slam.glint&&b.at<MOVES.slam.glint+12&&C.tip){const u=(b.at-MOVES.slam.glint)/12;const gx=Math.round(C.tip[0]),gy=Math.round(C.tip[1]);const r=Math.round(9*Math.sin(u*Math.PI));for(let i=-r;i<=r;i++){NX.addPx(gx+i,gy,0xffffff,1.3*(1-Math.abs(i)/(r+1)));NX.addPx(gx,gy+i,0xffffff,1.3*(1-Math.abs(i)/(r+1)))}NX.glow(gx,gy,8,0xffe0a0,1)}}});
  // --- the knight ---
  it.push({z:SC.toCam(k.x,0,k.z)[2],draw(){SC.shadow(k.x,k.z,0.62,0.55);const C=FIG.paintKnight(g.kM,{cape:g.capeK,flask:k.act==='flask'&&k.at>14&&k.at<44});
    PIX.blit(C,0,0,{tint:k.act==='hurt'&&k.at<4?[0xff5040,0.22]:null});
    trail(g,g.trK,C,(k.act==='a1'||k.act==='a2')&&k.at>=9&&k.at<=14||k.act==='heavy'&&k.at>=26&&k.at<=33||k.act==='rip'&&k.at>=15&&k.at<=23);smear(g.trK,0xfff8ea,30);
    if(k.act==='flask'&&k.at>18&&k.at<44){const p=pj(k.x,k.z,1.5);if(p)NX.glow(p[0],p[1],14,0xff8a40,0.8)}}});
  it.sort((u,v)=>v.z-u.z);for(const o of it)o.draw();
  g._tf=S.frame;
  // daggers of light, growing as they come
  for(const d of g.dag){if(d.hit)continue;const p=pj(d.p[0],d.p[1],d.p[2]);const f=(s)=>pj(d.p[0]-(d.to[0]-d.p[0])*s,d.p[1]-(d.to[1]-d.p[1])*s,d.p[2]-(d.to[2]-d.p[2])*s);const q=f(0.08),q2=f(0.2);if(!p||!q||!q2)continue;
    NX.line(q2[0],q2[1],q[0],q[1],0xffb050,160);NX.line(q[0],q[1],p[0],p[1],0xfff8e0,255);NX.line(q[0]+1,q[1],p[0]+1,p[1],0xffe8a0,255);NX.glow(p[0],p[1],4,0xffd27a,0.7)}
  SC.sunGlow();
  // fog gate behind us as we enter
  if(g.fogA>0.01){for(let y=150;y<H;y++)for(let x=0;x<W;x+=1){const n=SC.fbm(x*0.03+t*0.01,y*0.05,61);const a=g.fogA*Math.max(0,(y-150)/120)*(0.4+n*0.6);if(a>0.05){const p=y*W+x;S.alb[p]=mix(S.alb[p],0xf4ecd8,Math.min(0.9,a))}}}
  // particles
  for(const q of g.p){const u=q.t/q.life;if(q.k==='scr'){q.sx+=q.svx;q.sy+=q.svy;NX.px(Math.round(q.sx),Math.round(q.sy),q.c,Math.round(255*(1-u)));continue}
    const p=pj(q.x,q.z,q.h);if(!p)continue;const x=Math.round(p[0]),y=Math.round(p[1]);
    if(q.k==='mote'){const a=Math.sin(u*Math.PI);if(a>0.3)NX.px(x,y,q.c,Math.round(200*a));continue}
    if(q.k==='dust'){const r=Math.round((q.sz||1)*(1+u*2)*SC.CAM.F/p[2]/40);recta(x-r,y-r,r*2+1,r*2,q.c,0.45*(1-u));continue}
    if(q.k==='spark'){const v=pj(q.x-q.vx*2,q.z,q.h-q.vh*2);if(v&&Math.abs(v[0]-x)+Math.abs(v[1]-y)<24)NX.line(Math.round(v[0]),Math.round(v[1]),x,y,q.c,255);continue}
    NX.px(x,y,q.c,q.em?Math.round(q.em*(1-u*0.5)):0)}
  if(g.red>0)for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=x/W-0.5,dy=y/H-0.5;const v=(dx*dx+dy*dy)*2.4*g.red;if(v>0.12){const p=y*W+x;S.alb[p]=mix(S.alb[p],0x5a0808,Math.min(0.6,v-0.12))}}
  hud(g);
  if(g.ink>0)recta(0,0,W,H,0x000000,g.ink);
  NX.gain(255)}
function hud(g){const k=g.k,b=g.b;const t=S.frame;
  const bar=(x,y,w,v,c,c2)=>{recta(x-1,y-1,w+2,6,0x000000,0.55);rect(x,y,w,4,0x241e1c);rect(x,y,Math.round(w*v),4,c);rect(x,y,Math.round(w*v),1,c2);rect(x-1,y-1,1,6,0x9a8a64);rect(x+w,y-1,1,6,0x9a8a64)};
  const cine=g.shot==='hero'||g.shot==='rip';
  if((g.mode==='fight'||g.mode==='felled')&&!cine){bar(14,12,150,k.hp,0xa01c26,0xe8605a);bar(14,20,110,k.fp,0x2846b0,0x6a8aff);bar(14,28,130,Math.max(0,k.st),0x2e7e36,0x7ad87a);
    const qx=26,qy=H-46;for(const[dx,dy]of[[0,-18],[-18,0],[18,0],[0,18]]){recta(qx+dx-8,qy+dy-8,16,16,0x000000,0.45);rect(qx+dx-8,qy+dy-8,16,1,0x6a5e48);rect(qx+dx-8,qy+dy+7,16,1,0x6a5e48)}
    const fx=qx,fy=qy+18;NX.disc(fx,fy+2,4,0xc83a2a,90);rect(fx-1,fy-6,3,4,0xb8a890);NX.tiny(String(k.flask),fx+5,fy+3,0xf0e8d8);
    for(const[dx,dy,c]of[[0,-18,0xd8d0b8],[-18,0,0x6a8ad8],[18,0,0xd8d8e0]])rect(qx+dx-1,qy+dy-4,2,8,c);
    recta(W-82,H-24,70,14,0x000000,0.5);text(String(g.runes),W-16,H-23,0xf0e8d8,{size:10,align:'r',fam:'serif'})}
  if((g.mode==='fight'&&!cine||g.mode==='intro'&&g.bossShow>0)&&b.act!=='dead'){const bw=300,bx=(W-bw)/2,by=250;const v=g.mode==='intro'?g.bossShow:1;text(BOSSN,bx,by-12,0xf0e8d8,{size:10,fam:'serif',shadow:0x000000});
    recta(bx-1,by-1,bw+2,6,0x000000,0.6);rect(bx,by,bw,4,0x2a1a18);const hw=Math.round(bw*Math.max(0,b.hp)*v);if(g.dmgT>0)rect(bx+hw,by,Math.round(bw*Math.min(1,b.hp+g.dmgNum/3120))-hw,4,0xe8c060);rect(bx,by,hw,4,0x8a1818);rect(bx,by,hw,1,0xd85a4a);rect(bx-1,by-1,1,6,0x9a8a64);rect(bx+bw,by-1,1,6,0x9a8a64);
    if(g.dmgT>0)text(String(g.dmgNum),bx+bw,by-12,0xf0e8d8,{size:10,align:'r',fam:'serif',shadow:0x000000});
    if(g.mode==='fight'){const s=pj(b.x,b.z,b.h+3.9+(b.broken>0?-2:0));if(s){const lx=Math.round(s[0]),ly=Math.round(s[1]);NX.ring(lx,ly,2.5,1,0xf0f0f0,20);NX.px(lx,ly,0xffffff,80)}}}
  if(g.mode==='intro'&&g.mt>170&&g.mt<280){const a=Math.min(1,(g.mt-170)/20)*Math.min(1,(280-g.mt)/20);band(150,26,0.55*a);if(a>0.2){text(BOSSN,W/2,136,mix(0x000000,0xf0e8d8,a),{size:20,align:'c',fam:'serif',shadow:0x000000});text('破碎王冠之主',W/2,164,mix(0x000000,0xb8a888,a),{size:10,align:'c',fam:'serif'})}}
  if(g.mode==='felled'&&g.mt>40){const a=Math.min(1,(g.mt-40)/30)*Math.min(1,(380-g.mt)/30);band(132,24,0.6*a);text('击败强敌',W/2,118,mix(0x000000,0xffd27a,a),{size:22,align:'c',fam:'serif',em:Math.round(120*a),sp:6});text('ENEMY FELLED',W/2,146,mix(0x000000,0xe8c070,a*0.8),{size:10,align:'c',fam:'serif',sp:3})}
  if(g.mode==='died'&&g.mt>40){const a=Math.min(1,(g.mt-40)/40);band(135,26,0.7*a);text('你死了',W/2,118,mix(0x000000,0xa01818,a),{size:26,align:'c',fam:'serif',sp:10});text('YOU DIED',W/2,150,mix(0x000000,0x8a1818,a),{size:10,align:'c',fam:'serif',sp:4})}
  if(cine||g.k.act==='rip'&&g.k.at>20&&g.k.at<70){const a=cine?1:Math.min(1,(g.k.at-20)/6)*Math.min(1,(70-g.k.at)/8);recta(0,0,W,20,0x000000,0.92*a);recta(0,H-20,W,20,0x000000,0.92*a)}
  // which camera: named when it changes by hand, and quietly in the corner while the director is choosing
  if(g.vlab>0){const a=Math.min(1,g.vlab/20);recta(W-118,8,108,15,0x000000,0.5*a);text('镜头 · '+VNAME[g.view],W-16,10,mix(0x000000,0xf0e8d8,a),{size:10,align:'r',fam:'serif'})}
  else if(g.view==='auto'&&g.mode==='fight'&&!cine){text(VNAME[g.shot]||'',W-16,10,0x8a8070,{size:10,align:'r',fam:'serif'})}}
GAMES.push({id:'souls',name:'断冠骑士',ref:'对标：艾尔登法环 · 首领战（多机位 / 自由视角）',keys:'方向键 移动 · J 轻攻击（连按两段）· L 重攻击 · K/空格 翻滚 · U 喝药 · V 切换镜头 · N / M 自由环绕时转镜头',thumbAt:900,views:VIEWS.map(v=>[v,VNAME[v]]),
  about:['同一场首领战，五个机位：骑士背后锁定、侧面、断冠骑士的肩后（王的视角）、高处俯瞰、绕场自由环绕。默认由“自动导演”按战况切镜：横扫切到侧面，飞刃切到王的视角，跃击切到俯瞰，咆哮切到低机位仰望，处决给特写；也可以在上方“镜头”里固定任一机位，或按 V 轮换。',
    '没有三维模型。两个人物只有一副骨架：骨架给出每个关节在场景里的位置，头盔、胸甲、肩甲、护膝、盾、剑都按当前机位逐像素重新上色，用手挑的色阶分层，描暗边和金色逆光边，不用抖动。椭圆部件带着自己的表面坐标，所以面甲缝、胸前的太阳纹、盾面的彩绘转到哪一侧都在原位。披风是布料模拟，按褶皱逐像素上色，看到里衬时换成暗色。',
    '光是真实方向：太阳在巨树右侧偏低，镜头朝着太阳时人物逆光、只剩金边，转到首领身后变成正面受光。首领有延迟下砸、横扫、跃击、光刃和二阶段咆哮；骑士可以翻滚、两段轻攻击、重攻击、喝药，打满架势后上前处决，击败后首领从脚下化成金光消散。方向键按当前镜头的方向移动。'],
  tags:['逐像素程序绘制，无三维模型','五个机位 + 自动导演','自由环绕视角','真实太阳方向的逆光金边','布料披风与褶皱','延迟下砸与剑尖闪光','架势破防 → 处决特写','二阶段金色咆哮','金色消散'],
  init,tick,draw,ai,info:g=>({intro:'入场',fight:'交战',felled:'击败',died:'死亡'}[g.mode]||'')+' · '+(VNAME[g.shot]||'')+' k:'+g.k.act+' b:'+g.b.act+':'+Math.round(g.b.at)+' hp'+g.k.hp.toFixed(2)+' bhp'+g.b.hp.toFixed(2)});
})();


// ================= 4. 雪夜伏虎 — a staff monkey against a tiger general in a snowed-in temple, third-person lock-on =================


// ================= 5. 风之原野 — open-world glide in the style of a big adventure game: behind the back, over a whole valley =================
// The land is a heightmap drawn column by column front to back (each column fills only what is still empty above it), with a
// depth buffer so trees, the campfire and the shrine are hidden by hills. Ground colour comes from a baked map of hand ramps
// (grass, forest floor, sand, layered cliff rock, snow) and baked sunlight with terrain shadows; cloud shadows drift over it.


// ================= 6. 星杯网球 — a cartoon tennis final in the style of a big party-sports game: the broadcast camera behind the baseline =================
// The stadium is drawn per screen column: the court floor is solved per pixel (lines never thinner than a pixel, never flickering),
// the walls and the stepped stands are marched outward from where the floor ends, and every riser face carries a row of little
// fans who are painted per pixel from their seat cell. Players are the same skeleton-and-repaint figures as the other scenes,
// with chibi proportions. Every rally is recorded, so a winning point can be replayed from the courtside camera.


// ================= 7. 假面之夜 — a turn-based battle in the style of a stylish persona RPG: over the shoulder, then every camera trick =================
// A moonlit ballroom drawn per pixel (checkered floor, a ring of windows and curtains, a coffered ceiling), three phantom thieves and
// three shadows on the shared skeleton figures. Each turn starts over the actor's shoulder with the command menu; a skill rips the
// mask off, a giant persona rises behind, the weakness hit knocks the shadow down and a cut-in says 1 MORE; three downs make a
// HOLD UP, then the all-out attack and the finishing card.


// ================= player: 60 Hz fixed step, hit-stop and slow motion, autopilot / keyboard takeover, display with bloom =================
(function(){
const $=id=>document.getElementById(id);
const {W,H,S}=NX;
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const low=document.createElement('canvas');low.width=W;low.height=H;const lg=low.getContext('2d');
const half=document.createElement('canvas');half.width=W>>1;half.height=H>>1;const hg=half.getContext('2d');
const b1=document.createElement('canvas');b1.width=W;b1.height=H;const b1g=b1.getContext('2d');
const b2=document.createElement('canvas');b2.width=W>>1;b2.height=H>>1;const b2g=b2.getContext('2d');
// does canvas filter blur work here? (Safari: no) — otherwise a mip chain
const FILT=(()=>{try{const c=document.createElement('canvas');c.width=c.height=9;const g=c.getContext('2d');g.filter='blur(2px)';g.fillStyle='#fff';g.fillRect(4,4,1,1);return g.getImageData(1,4,1,1).data[3]>0}catch(e){return false}})();
const mips=[[120,68],[60,34],[30,17]].map(([w,h])=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c});
let viewSel='auto',syncView=null,skip=false,slow=false,avg=8,cur=0,G=null,paused=false,speed=1,acc=0,last=performance.now(),visible=true,mode='auto',idle=0,pipe='full',scale=2;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce)paused=true;
const keys=new Set(),pressed=new Set();
const mouse={x:W/2,y:H/2,down:false,active:false};
function newGame(d){NX.setSeed(1234+cur*77);S.lq=0;S.post=null;S.ca=0;S.parts.length=0;S.cam={x:0,y:0,tx:0,ty:0,trauma:0,kx:0,ky:0,sx:0,sy:0};S.flash=0;S.ca=0;S.frame=0;
  const g={t:0,stop:0,ts:1,tsT:0,d,view:viewSel};d.init(g);return g}
function readPad(){const k=c=>keys.has(c);const pad={x:(k('ArrowRight')||k('KeyD')?1:0)-(k('ArrowLeft')||k('KeyA')?1:0),y:(k('ArrowDown')||k('KeyS')?1:0)-(k('ArrowUp')||k('KeyW')?1:0),
  fire:k('KeyJ')||k('KeyZ')||mouse.down,jump:pressed.has('KeyK')||pressed.has('KeyX')||pressed.has('Space'),jumpHeld:k('KeyK')||k('KeyX')||k('Space'),
  dash:pressed.has('ShiftLeft')||pressed.has('ShiftRight')||pressed.has('KeyL')||pressed.has('KeyC'),alt:pressed.has('KeyI')||pressed.has('KeyV'),special:pressed.has('KeyU')||pressed.has('KeyQ'),mouse:mouse.active?{x:mouse.x,y:mouse.y}:null};
  pressed.clear();return pad}
function step(){const d=G.d;
  if(G.stop>0){G.stop--;NX.camStep();S.frame++;return}
  let pad;if(mode==='play'){pad=readPad();if(!pad.x&&!pad.y&&!pad.fire&&!pad.jumpHeld&&!mouse.active)idle++;else idle=0;if(idle>60*8){setMode('auto')}}else{pressed.clear();pad=d.ai(G)}
  pad.orbit=(keys.has('KeyM')?1:0)-(keys.has('KeyN')?1:0);if(G.view!==viewSel){viewSel=G.view;if(syncView)syncView()}
  d.tick(G,pad);G.t++;S.frame++;NX.camStep()}
function frame(){G.d.draw(G);S.raw=pipe==='raw';NX.render();lg.putImageData(S.img,0,0);
  ctx.imageSmoothingEnabled=false;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.drawImage(low,0,0,cv.width,cv.height);
  if(pipe!=='full')return;
  hg.putImageData(S.bimg,0,0);ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=true;
  if(FILT){b1g.clearRect(0,0,W,H);b1g.filter='blur(2px)';b1g.drawImage(half,0,0,W,H);b1g.filter='none';
    b2g.clearRect(0,0,W>>1,H>>1);b2g.filter='blur(7px)';b2g.drawImage(half,0,0);b2g.filter='none';
    ctx.globalAlpha=0.85;ctx.drawImage(b1,0,0,cv.width,cv.height);ctx.globalAlpha=1;ctx.drawImage(b2,0,0,cv.width,cv.height)}
  else{let src=half;const al=[0.7,0.8,0.9];mips.forEach((m,i)=>{const g=m.getContext('2d');g.imageSmoothingEnabled=true;g.clearRect(0,0,m.width,m.height);g.drawImage(src,0,0,m.width,m.height);src=m;ctx.globalAlpha=al[i];ctx.drawImage(m,0,0,cv.width,cv.height)});ctx.globalAlpha=1}
  ctx.globalCompositeOperation='source-over';syncInfo()}
function fit(){const aw=stage.clientWidth-2,ah=Math.max(220,innerHeight*0.72);let sc=Math.min(aw/W,ah/H);const dpr=devicePixelRatio||1;
  const css=sc>=2?Math.floor(sc*(devicePixelRatio||1))/(devicePixelRatio||1):Math.max(1,sc);const dev=Math.max(1,Math.min(4,Math.round(css*dpr)));if(cv.width!==W*dev){cv.width=W*dev;cv.height=H*dev}scale=dev;
  cv.style.width=Math.floor(W*css)+'px';cv.style.height=Math.floor(H*css)+'px'}
function syncInfo(){const d=G.d;$('info').textContent=(d.info?d.info(G)+' · ':'')+'480×270'+(mode==='play'?' · 手动':' · 自动')}
// ---------------- controls ----------------
const rail=$('rail');
function seg(label,opts,get,set){const l=document.createElement('span');l.className='lab';l.textContent=label;const s=document.createElement('div');s.className='seg';
  for(const[v,t]of opts){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{set(v);sync()};b.dataset.v=v;s.appendChild(b)}
  const sync=()=>{for(const b of s.children)b.classList.toggle('on',String(b.dataset.v)===String(get()))};rail.append(l,s);sync();return sync}
const btn=(t,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;b.onclick=fn;rail.appendChild(b);return b};
const playB=btn('暂停',()=>setPaused(!paused));
btn('重开',()=>{G=newGame(GAMES[cur]);frame()});
const syncMode=seg('操作',[['auto','自动演示'],['play','我来玩']],()=>mode,v=>{setMode(v);cv.focus()});
const vbox=document.createElement('span');vbox.style.display='contents';rail.appendChild(vbox);
function buildViews(d){vbox.innerHTML='';syncView=null;if(!d.views)return;viewSel=d.views[0][0];const r0=rail.lastChild;syncView=seg('镜头',d.views,()=>viewSel,v=>{viewSel=v;if(G){G.view=v;G.vlab=90}if(paused)frame()});const nodes=[...rail.childNodes].slice(-2);vbox.append(...nodes)}
seg('画面',[['full','完整'],['nobloom','去泛光'],['raw','只有像素']],()=>pipe,v=>{pipe=v;frame()});
seg('速度',[[0.25,'¼'],[0.5,'½'],[1,'1×']],()=>speed,v=>{speed=v});
const sndB=btn('声音 关',()=>{NX.sndInit();NX.SND.on=!NX.SND.on;sndB.textContent=NX.SND.on?'声音 开':'声音 关';sndB.classList.toggle('on',NX.SND.on);if(NX.SND.ctx&&NX.SND.ctx.state==='suspended')NX.SND.ctx.resume()});
const info=document.createElement('span');info.id='info';rail.appendChild(info);
function setMode(m){mode=m;idle=0;syncMode();$('hint').textContent=m==='play'?(GAMES[cur].keys||''):'自动演示中 · 按任意方向键或点“我来玩”接管'}
function setPaused(p){paused=p;playB.textContent=p?'播放':'暂停'}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const gameKey=/^(Arrow|Key[WASDJKLZXCIUVQ]|Space|Shift)/.test(e.code);
  if(e.code==='KeyP'){setPaused(!paused);return}
  if(e.code==='KeyV'&&G&&G.d.views){const vs=G.d.views.map(v=>v[0]);viewSel=G.view=vs[(vs.indexOf(G.view)+1)%vs.length];G.vlab=90;if(syncView)syncView();if(paused)frame();e.preventDefault();return}
  if(e.code==='KeyN'||e.code==='KeyM'){keys.add(e.code);e.preventDefault();return}
  if(gameKey&&document.activeElement!==document.body&&document.activeElement!==cv&&e.code==='Space')return;
  if(gameKey){if(mode!=='play')setMode('play');if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);e.preventDefault()}});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
function cpos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
cv.addEventListener('pointermove',e=>{if(mode!=='play')return;const p=cpos(e);mouse.x=p[0];mouse.y=p[1];mouse.active=true});
cv.addEventListener('pointerdown',e=>{cv.focus();if(mode!=='play'){setMode('play')}const p=cpos(e);mouse.x=p[0];mouse.y=p[1];mouse.active=true;mouse.down=true});
addEventListener('pointerup',()=>{mouse.down=false});
cv.addEventListener('pointerleave',()=>{mouse.active=false});
// ---------------- cartridges ----------------
const carts=$('carts');carts.style.setProperty('--n',GAMES.length);
function select(i){cur=i;const d=GAMES[i];buildViews(d);G=newGame(d);$('nm').textContent=d.name;$('about').innerHTML=d.about.map(p=>'<p>'+p+'</p>').join('');$('tags').innerHTML=d.tags.map(t=>'<li>'+t+'</li>').join('');
  $('lede').textContent=LEDE;for(const[k,c]of [...carts.children].entries())c.classList.toggle('on',k===i);setMode('auto');try{history.replaceState(null,'','#'+d.id)}catch(e){}frame()}
const LEDE='用大作真正的镜头重做，每个像素都是直接画出来的：人物、车、树和地面都在原生分辨率上按位置逐像素上色，不贴三维模型的面。每一幅对标一款游戏、用它自己的镜头：首领战的锁定与多机位、开放世界赛车的车后追尾……默认自动演示，按方向键随时接管，有镜头选项的可以按 V 切换。';
GAMES.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='cart';const c=document.createElement('canvas');c.width=W;c.height=H;
  const nm=document.createElement('span');nm.className='nm';nm.textContent=(i+1)+' · '+d.name;const rf=document.createElement('span');rf.className='ref';rf.textContent=d.ref;b.append(c,nm,rf);b.onclick=()=>select(i);carts.appendChild(b);d._thumb=c});
function thumbs(){for(const d of GAMES){const keep=[cur,G];cur=GAMES.indexOf(d);viewSel=d.views?d.views[0][0]:'auto';G=newGame(d);for(let k=0;k<(d.thumbAt||300);k++)step();d.draw(G);S.raw=false;NX.render();
  const g=d._thumb.getContext('2d');g.putImageData(S.img,0,0);cur=keep[0];G=keep[1]}}
new ResizeObserver(()=>{fit();if(G)frame()}).observe(stage);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage);
const start=Math.max(0,GAMES.findIndex(d=>'#'+d.id===location.hash));
thumbs();fit();select(start);setPaused(paused);
function loop(now){const dt=Math.min(0.1,(now-last)/1000);last=now;
  if(!paused&&visible){acc+=dt*60*speed*(G.ts||1);let n=0;while(acc>=1&&n<6){step();acc-=1;n++}skip=!skip;if(n&&(!slow||!skip)){const t0=performance.now();frame();const ft=performance.now()-t0;avg=avg*0.95+ft*0.05;slow=avg>14}}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.__TT={step:()=>step(),frame,select,get G(){return G},setPipe:v=>{pipe=v}};
})();

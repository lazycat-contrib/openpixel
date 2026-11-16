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


// ================= 1. 断冠骑士 — a souls boss fight seen through several cameras, every pixel painted =================


// ================= 2. 落日环线 — open-world racing behind the car at golden hour; ground, sky, trees and cars painted per pixel =================
(function(){
const {W,H,S,mix,hash,pmod,rect,recta,text,sfx}=NX;
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
const angD=(a,b)=>((b-a+Math.PI*3)%TAU)-Math.PI;
const vn2=(x,y,s)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=hash(i,j,s),b=hash(i+1,j,s),c=hash(i,j+1,s),d=hash(i+1,j+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
const fbm=(x,y,s)=>vn2(x,y,s)*0.55+vn2(x*2.1,y*2.1,s+1)*0.28+vn2(x*4.3,y*4.3,s+2)*0.17;
const band=(r,v)=>r[v<0?0:v>=1?r.length-1:Math.floor(v*r.length)];
// ---------------- the sun: low in the south-west, so the lakeside straight drives straight into it ----------------
const SUNAZ=-1.78,SUNEL=0.2;const SUN=[Math.sin(SUNAZ)*Math.cos(SUNEL),Math.sin(SUNEL),Math.cos(SUNAZ)*Math.cos(SUNEL)];
const SUNH=[-SUN[0]/Math.hypot(SUN[0],SUN[2]),-SUN[2]/Math.hypot(SUN[0],SUN[2])];// the way shadows fall
const TANEL=Math.tan(SUNEL);
// ---------------- the circuit: a loop round the lake, festival straight, hill crest, lakeside, forest esses ----------------
const CP=[[-170,-262,6],[-40,-264,6],[90,-262,6.5],[200,-246,8],[276,-196,11],[322,-118,16],[338,-40,22],[341,18,26],[339,50,27.4],[333,80,19],[318,126,11],[284,190,6],[206,248,3.2],[90,274,2.4],[-50,280,2.4],[-170,270,3],[-250,226,6],[-292,150,9],[-258,80,11],[-296,6,12],[-262,-66,12],[-306,-140,10],[-292,-214,8],[-246,-254,6.5]];
let WORLD=null;window.__HZW=()=>WORLD;
function build(){if(WORLD)return WORLD;const t0=performance.now();
  // Catmull-Rom through the control points, resampled to one sample per metre
  const n=CP.length,dense=[];for(let i=0;i<n;i++){const a=CP[(i-1+n)%n],b=CP[i],c=CP[(i+1)%n],d=CP[(i+2)%n];for(let k=0;k<240;k++){const t=k/240,t2=t*t,t3=t2*t;const f=(p,q,r,s)=>0.5*(2*q+(-p+r)*t+(2*p-5*q+4*r-s)*t2+(-p+3*q-3*r+s)*t3);dense.push([f(a[0],b[0],c[0],d[0]),f(a[1],b[1],c[1],d[1]),f(a[2],b[2],c[2],d[2])])}}
  const cum=[0];for(let i=1;i<=dense.length;i++){const p=dense[i-1],q=dense[i%dense.length];cum.push(cum[i-1]+Math.hypot(q[0]-p[0],q[1]-p[1]))}
  const LEN=Math.floor(cum[dense.length]);const TX=new Float32Array(LEN),TZ=new Float32Array(LEN),TY=new Float32Array(LEN),TH=new Float32Array(LEN),TK=new Float32Array(LEN);
  let j=0;for(let s=0;s<LEN;s++){while(cum[j+1]<s)j++;const u=(s-cum[j])/(cum[j+1]-cum[j]);const p=dense[j],q=dense[(j+1)%dense.length];TX[s]=p[0]+(q[0]-p[0])*u;TZ[s]=p[1]+(q[1]-p[1])*u;TY[s]=p[2]+(q[2]-p[2])*u}
  for(let s=0;s<LEN;s++){const a=pmod(s-1,LEN),b=(s+1)%LEN;TH[s]=Math.atan2(TX[b]-TX[a],TZ[b]-TZ[a])}
  for(let s=0;s<LEN;s++){let k=0;for(let d=-6;d<6;d++)k+=angD(TH[pmod(s+d,LEN)],TH[pmod(s+d+1,LEN)]);TK[s]=k/12}
  // where the race starts: on the festival straight
  let S0=0,bd=1e9;for(let s=0;s<LEN;s++){const d=Math.hypot(TX[s]+30,TZ[s]+263);if(d<bd){bd=d;S0=s}}
  // ---- the 2 m grid: road distance, height, light ----
  const GN=512,CELL=2,ORG=-512,G1=GN+1,NG=G1*G1;
  const RD=new Float32Array(NG).fill(99),RDA=new Float32Array(NG).fill(99),RS=new Float32Array(NG);
  for(let s=0;s<LEN;s++){const x=TX[s],z=TZ[s],h=TH[s],fx=Math.sin(h),fz=Math.cos(h),rx=Math.cos(h),rz=-Math.sin(h);const ci=Math.round((x-ORG)/CELL),cj=Math.round((z-ORG)/CELL);
    for(let jj=cj-21;jj<=cj+21;jj++)for(let ii=ci-21;ii<=ci+21;ii++){if(ii<0||jj<0||ii>GN||jj>GN)continue;const dx=ORG+ii*CELL-x,dz=ORG+jj*CELL-z;const lat=dx*rx+dz*rz,al=dx*fx+dz*fz;const d=Math.hypot(lat,al);const q=jj*G1+ii;
      if(d<RDA[q]){RDA[q]=d;RD[q]=Math.abs(al)<0.8?lat:(lat<0?-d:d);RS[q]=s+al}}}
  const roadY=s=>{const i=Math.floor(s),f=s-i;return TY[pmod(i,LEN)]*(1-f)+TY[pmod(i+1,LEN)]*f};
  const baseH=(x,z)=>{const r=Math.hypot(x+10,z);let h=7+(fbm(x/210+3,z/210+7,31)-0.5)*44+(fbm(x/60,z/60,32)-0.5)*7+sstep(330,500,r)*70*(0.6+0.8*fbm(x/90,z/90,33));
    const e=((x-15)/215)**2+((z-128)/112)**2;const lk=1-sstep(0.75,1.5,e);return h*(1-lk)+(-5+e*6)*lk};
  const HT=new Float32Array(NG);let HMAX=-1e9;
  for(let jj=0;jj<=GN;jj++)for(let ii=0;ii<=GN;ii++){const q=jj*G1+ii,x=ORG+ii*CELL,z=ORG+jj*CELL;let h=baseH(x,z);const d=RDA[q];
    if(d<42){const ry=roadY(RS[q])-0.04;const w=1-sstep(6.5,26,d);h=h*(1-w)+ry*w}HT[q]=h;if(h>HMAX)HMAX=h}
  // fields: a warped grid of hedged plots; forests; tone
  const FOR=new Float32Array(NG),TN=new Float32Array(NG),WX=new Float32Array(NG),WZ=new Float32Array(NG);
  for(let jj=0;jj<=GN;jj++)for(let ii=0;ii<=GN;ii++){const q=jj*G1+ii,x=ORG+ii*CELL,z=ORG+jj*CELL;
    FOR[q]=fbm(x/130+11,z/130+5,41)+(x<-170?0.22:0)+(Math.hypot(x+10,z)>380?0.12:0)-(Math.abs(z+262)<70&&Math.abs(x)<200?0.5:0);
    TN[q]=fbm(x/14,z/14,42);WX[q]=x+(fbm(x/160,z/160,43)-0.5)*70;WZ[q]=z+(fbm(x/160+9,z/160+9,44)-0.5)*70}
  // light: slope against the low sun, terrain shadows marched toward the sun
  const LT=new Float32Array(NG);const hN=(ii,jj)=>HT[clamp(jj,0,GN)*G1+clamp(ii,0,GN)];
  for(let jj=0;jj<=GN;jj++)for(let ii=0;ii<=GN;ii++){const q=jj*G1+ii;const nx=(hN(ii-1,jj)-hN(ii+1,jj))/(2*CELL),nz=(hN(ii,jj-1)-hN(ii,jj+1))/(2*CELL);const l=Math.hypot(nx,1,nz);
    let lam=(nx*SUN[0]+SUN[1]+nz*SUN[2])/l;lam=Math.max(0,lam);
    let sh=1;const h0=HT[q]+0.4;for(let k=1;k<70;k++){const d=k*4;const ii2=Math.round(ii+SUN[0]/Math.cos(SUNEL)*d/CELL),jj2=Math.round(jj+SUN[2]/Math.cos(SUNEL)*d/CELL);if(ii2<0||jj2<0||ii2>GN||jj2>GN)break;if(HT[jj2*G1+ii2]>h0+d*TANEL){sh=0;break}}
    LT[q]=Math.min(1,lam*1.6)*sh}
  // ---- trees: forest stands, hedgerow oaks, lone field trees; their long evening shadows go into the light grid ----
  const TREES=[];const at=(A,x,z)=>{let gx=clamp((x-ORG)/CELL,0,GN-0.001),gz=clamp((z-ORG)/CELL,0,GN-0.001);const i=gx|0,j=gz|0,fx=gx-i,fz=gz-j,q=j*G1+i;return A[q]+(A[q+1]-A[q])*fx+(A[q+G1]-A[q])*fz+(A[q]-A[q+1]-A[q+G1]+A[q+G1+1])*fx*fz};
  for(let jj=0;jj<150;jj++)for(let ii=0;ii<150;ii++){const x=ORG+ii*6.8+hash(ii,jj,51)*5,z=ORG+jj*6.8+hash(ii,jj,52)*5;const f=at(FOR,x,z),rd=at(RDA,x,z),h=at(HT,x,z);
    if(rd<9||h<0.8||Math.hypot(x+10,z)>505)continue;const pr=hash(ii,jj,53);let keep=f>0.62?pr<0.85:f>0.55?pr<0.35:pr<0.012;
    // hedgerows: trees along plot edges
    if(!keep&&f<0.55){const wx=at(WX,x,z),wz=at(WZ,x,z);const ex=Math.abs(pmod(wx,72)-36)>33,ez=Math.abs(pmod(wz,56)-28)>25;if((ex||ez)&&pr<0.16)keep=true}
    if(!keep)continue;const pine=f>0.7&&hash(ii,jj,54)<0.45||h>45&&hash(ii,jj,55)<0.7;const kind=pine?2:hash(ii,jj,56)<0.22?1:0;
    const th=(kind===2?15:kind===1?16:12)*(0.75+hash(ii,jj,57)*0.5);TREES.push({x,z,y:h,h:th,kind,v:Math.floor(hash(ii,jj,58)*4),r:th*(kind===2?0.22:kind===1?0.2:0.4)})}
  for(const tr of TREES){// shadow: trunk, then the crown's long ellipse thrown away from the sun
    const len=tr.h/TANEL,c0=tr.h*0.35/TANEL;const steps=Math.ceil(len/1.5);
    for(let k=0;k<steps;k++){const d=k*1.5;const cx=tr.x+SUNH[0]*d,cz=tr.z+SUNH[1]*d;const inCrown=d>c0;const rad=inCrown?tr.r*Math.sin(Math.PI*clamp((d-c0)/(len-c0),0,1))**0.6:0.4;if(rad<0.5)continue;
      const r2=Math.ceil(rad/CELL);const ci=Math.round((cx-ORG)/CELL),cj=Math.round((cz-ORG)/CELL);for(let jj=cj-r2;jj<=cj+r2;jj++)for(let ii=ci-r2;ii<=ci+r2;ii++){if(ii<0||jj<0||ii>GN||jj>GN)continue;const dd=Math.hypot(ORG+ii*CELL-cx,ORG+jj*CELL-cz);if(dd<rad)LT[jj*G1+ii]*=0.25}}}
  // ---- the festival: barriers, flags, crowds along the start straight; fences out in the fields ----
  const PROPS=[];const tp=(s,lat)=>{const i=pmod(Math.round(s),LEN),h=TH[i];return[TX[i]+Math.cos(h)*lat,TZ[i]-Math.sin(h)*lat,TY[i],h]};
  for(let s=S0-150;s<S0+120;s+=3)for(const sd of[-1,1]){const p=tp(s,sd*8.6),q=tp(s+3,sd*8.6);PROPS.push({k:'bar',x:(p[0]+q[0])/2,z:(p[1]+q[1])/2,a:p,b:q,i:Math.floor(s/3)})}
  for(let s=S0-140;s<S0+110;s+=11)for(const sd of[-1,1]){const p=tp(s+sd*3,sd*9.6);PROPS.push({k:'flag',x:p[0],z:p[1],y:at(HT,p[0],p[1]),h:p[3],c:Math.floor(hash(s,sd,61)*4),ph:hash(s,sd,62)*6})}
  for(let s=S0-135;s<S0+105;s+=1.1)for(const sd of[-1,1])for(let r=0;r<3;r++){if(hash(Math.round(s*10),sd*3+r,63)<0.25)continue;const p=tp(s+hash(Math.round(s*10),r,64),sd*(10.6+r*1.15+hash(Math.round(s*10),r,65)*0.4));
    PROPS.push({k:'fan',x:p[0],z:p[1],y:at(HT,p[0],p[1])+r*0.25,v:Math.floor(hash(Math.round(s*10),sd+r*5,66)*24),ph:hash(Math.round(s*10),r,67)*40})}
  for(let s=0;s<LEN;s+=4){const ss=pmod(s-S0,LEN);if(ss<160||ss>LEN-200)continue;const zone=fbm(s/300,0.5,68);if(zone<0.5)continue;for(const sd of[-1,1]){const p=tp(s,sd*10.5);if(at(FOR,p[0],p[1])>0.55)continue;PROPS.push({k:'post',x:p[0],z:p[1],y:at(HT,p[0],p[1]),s,sd})}}
  {const pm=new Map();for(const o of PROPS)if(o.k==='post')pm.set(o.s*3+o.sd,o);for(const o of PROPS)if(o.k==='post')o.nx=pm.get((o.s+4)*3+o.sd)}
  // balloons drifting over the valley, turbines on the southern ridge
  const BAL=[[-120,40,95,0],[160,-60,140,1],[60,330,120,2],[-330,320,170,3],[380,200,110,1],[-60,-420,150,2],[250,-380,190,0]].map(([x,z,y,v],i)=>({k:'bal',x,z,y,v,ph:i*1.7}));
  const TURB=[];for(let i=0;i<7;i++){const a=-2.3+i*0.2,r=455+hash(i,1,71)*25;const x=Math.cos(a)*r,z=Math.sin(a)*r;TURB.push({k:'turb',x,z,y:at(HT,x,z),ph:i*0.9})}
  // the speed trap on the lakeside straight
  let STS=0;bd=1e9;for(let s=0;s<LEN;s++){const d=Math.hypot(TX[s]-40,TZ[s]-277);if(d<bd){bd=d;STS=s}}const st=tp(STS,-8);
  PROPS.push({k:'trap',x:st[0],z:st[1],y:st[2]});
  WORLD={LEN,TX,TZ,TY,TH,TK,S0,STS,GN,CELL,ORG,G1,RD,RDA,RS,HT,HMAX,FOR,TN,WX,WZ,LT,TREES,PROPS:PROPS.concat(BAL,TURB),at,roadY};
  WORLD.ms=performance.now()-t0;return WORLD}
// ---------------- the sky: one painted panorama, sun, streaked clouds lit from below, far ridges ----------------
const PF=360,PW=Math.round(TAU*PF),PUP=262,PDN=40,PH=PUP+PDN;let PANO=null,PEM=null,FOGC=null;const SUNU=Math.round(pmod(SUNAZ,TAU)*PF);
const SKYS=[0xfff2b8,0xfee49a,0xfdd27a,0xfabd62,0xf4a456,0xe88c56,0xd6745c,0xbc6266,0x9c566e,0x7c4e74,0x5e4874,0x48426e,0x383c66,0x2e365e,0x283258];
const SKYA=[0xe0aca6,0xd49ea6,0xc492a6,0xb088a6,0x9a80a6,0x867aa6,0x7474a2,0x666e9e,0x5a6898,0x50628e,0x485a86,0x40527c,0x384a72,0x324268,0x2c3a60];
function buildSky(){if(PANO)return;PANO=new Int32Array(PW*PH);PEM=new Uint8Array(PW*PH);FOGC=new Int32Array(PW);
  for(let r=0;r<PH;r++){const el=(PUP-r)/PF;for(let u=0;u<PW;u++){const az=u/PF;const dx=Math.sin(az)*Math.cos(el),dy=Math.sin(el),dz=Math.cos(az)*Math.cos(el);const cs=dx*SUN[0]+dy*SUN[1]+dz*SUN[2];
    const g=Math.max(0,cs),gq=Math.floor(Math.pow(g,2.2)*5)/5;const t=Math.pow(clamp(el/0.7,0,1),0.62)+Math.max(0,0.08-el)*-0.6;
    const i=clamp(Math.floor(t*15-g*g*2.2),0,14);let c=mix(SKYA[i],SKYS[i],gq);
    // belt of Venus: the pink band opposite the sun
    if(cs<-0.3&&el>0.02&&el<0.09)c=mix(c,0xe8a8b0,0.5);
    // the sun and its halo
    const ang=Math.acos(clamp(cs,-1,1));let e=0;if(ang<0.024){c=ang<0.017?0xfffbe8:0xfff0b0;e=255}else if(ang<0.06)c=mix(c,0xfff0b8,0.6),e=60;else if(ang<0.11)c=mix(c,0xffe0a0,0.3);
    // clouds: long streaks on a high plane, bright undersides toward the sun
    if(el>0.012&&!e){const k=1/Math.max(0.05,dy);const px=dx*k,pz=dz*k;const cn=fbm(px*0.35+pz*0.12,pz*0.9-px*0.1,81)*0.8+fbm(px*1.4,pz*3,82)*0.3-0.08-el*0.25;
      if(cn>0.5){const k2=1/Math.max(0.05,dy+0.012);const cn2=fbm(dx*k2*0.35+dz*k2*0.12,dz*k2*0.9-dx*k2*0.1,81)*0.8+fbm(dx*k2*1.4,dz*k2*3,82)*0.3-0.08-el*0.25;const under=cn2<cn-0.01;
        let cc;if(g>0.5)cc=under?(cn>0.6?0xfff0c8:0xffcf8a):(cn>0.62?0xe89a78:0xc77e78);else if(g>0.15)cc=under?(cn>0.6?0xf8b890:0xe4987e):(cn>0.6?0xb07888:0x946e8a);else cc=under?(cn>0.6?0xe4a6a8:0xc890a0):(cn>0.6?0x8a7898:0x76708e);
        c=cn<0.53?mix(c,cc,0.5):cc;if(g>0.85&&under&&cn>0.58)e=120}}
    PANO[r*PW+u]=c;PEM[r*PW+u]=e}}
  // far ridges round the horizon (the near hills are real terrain)
  for(let u=0;u<PW;u++){const az=u/PF;const h1=0.018+fbm(Math.cos(az)*3+5,Math.sin(az)*3,85)*0.05,h2=0.006+fbm(Math.cos(az)*7,Math.sin(az)*7+3,86)*0.03;const hc=PANO[(PUP-4)*PW+u];
    for(let r=PUP-Math.round(h1*PF);r<PH;r++)PANO[r*PW+u]=mix(hc,0x6c5c8a,0.45);for(let r=PUP-Math.round(h2*PF);r<PH;r++)PANO[r*PW+u]=mix(hc,0x56487a,0.62);
    for(let r=PUP+1;r<PH;r++)PANO[r*PW+u]=mix(hc,0x3a3062,0.6);FOGC[u]=mix(PANO[(PUP-2)*PW+u],hc,0.5)}}
// ---------------- ramps (shadow → sunlit, golden hour) ----------------
const RA={asph:[0x1c1926,0x231f2d,0x2b2634,0x342e3c,0x3f3745,0x4c424e,0x5e5058,0x766460],
  gravel:[0x3a3040,0x4c404c,0x625258,0x7c6862,0x98806e,0xb89a7e],
  pas:[0x1c2630,0x24342e,0x2e4230,0x3c5232,0x506434,0x6a7838,0x8a8c40,0xb0a44c],
  stub:[0x342a36,0x4e3c3a,0x6c5238,0x8c6a3c,0xae8642,0xcaa050,0xe4bc64,0xf8d888],
  plough:[0x281c26,0x3a2829,0x4e342e,0x664232,0x7e5236,0x9a643c,0xb87a46],
  crop:[0x162428,0x1e3030,0x283e30,0x344e30,0x445f30,0x5a7234,0x76883a],
  hedge:[0x121a20,0x1a2624,0x223226,0x2e4028,0x3e502a,0x52622e],
  litter:[0x201822,0x2e2026,0x422a2a,0x58342c,0x72402e,0x904e30,0xb26034,0xd47a3c],
  rock:[0x26242e,0x363240,0x4a444e,0x605860,0x7a6e72,0x968680,0xb4a08e],
  sand:[0x463a44,0x62504e,0x80685c,0x9e8068,0xbc9a76,0xd8b688,0xeccc9c],
  line:[0x7c7690,0x9c94a8,0xc0b6c0,0xe2d6d2,0xfff0dc],kred:[0x4a1424,0x6e1c2a,0x96262e,0xc2343a,0xe8503e],kwht:[0x8a84a0,0xaaa2b4,0xcac0c8,0xe8dcd6,0xfff2e0]};
// ---------------- the camera: level horizon (lens shift only), so trees and posts stay upright ----------------
const HC={x:0,z:0,h:3,yaw:0,F:350,HZ:100,c:1,s:0};
function setCam(o){Object.assign(HC,o);HC.c=Math.cos(HC.yaw);HC.s=Math.sin(HC.yaw)}
function proj(x,y,z){const dx=x-HC.x,dz=z-HC.z;const xc=dx*HC.c-dz*HC.s,zc=dx*HC.s+dz*HC.c;if(zc<0.3)return null;return[W/2+HC.F*xc/zc,HC.HZ+HC.F*(HC.h-y)/zc,zc]}
const camZ=(x,z)=>(x-HC.x)*HC.s+(z-HC.z)*HC.c;
// ---------------- ground + sky: one column at a time, near to far, a y-buffer and a depth buffer ----------------
const ZB=new Float32Array(W*H),FOGL=new Int32Array(W),ROWE=new Float32Array(H),COLU=new Int32Array(W);
const FOGT=new Float32Array(1001);for(let i=0;i<=1000;i++){const f=1-Math.exp(-i/520);FOGT[i]=Math.floor(f*f*10)/10*0.92}
function fogK(z){return FOGT[z>1000?1000:z|0]}
function mixf(a,b,t){const k=(t*256)|0,j=256-k;return((((a>>16&255)*j+(b>>16&255)*k)>>8)<<16)|((((a>>8&255)*j+(b>>8&255)*k)>>8)<<8)|(((a&255)*j+(b&255)*k)>>8)}
let GQ=0,GFX=0,GFZ=0,G1V=513;const blq=A=>{const q=GQ;return A[q]+(A[q+1]-A[q])*GFX+(A[q+G1V]-A[q])*GFZ+(A[q]-A[q+1]-A[q+G1V]+A[q+G1V+1])*GFX*GFZ};
function renderWorld(t){const Wd=WORLD,{HT,RD,RS,LT,TN,FOR,WX,WZ,G1,GN,ORG,CELL,TK,LEN,S0}=Wd;const F=HC.F,HZ=HC.HZ,ch=HC.h,cs=HC.s,cc=HC.c;const alb=S.alb,em=S.em,lk=S.lk;
  for(let y=0;y<H;y++)ROWE[y]=Math.atan((HZ-y-0.5)/F);
  const hcg=ch-Wd.at(HT,HC.x,HC.z);const z0=clamp(F*Math.max(0.25,hcg)/(H-HZ+30)*0.85,0.4,8);const ZFAR=900;
  const lim=GN-0.001;
  for(let x=0;x<W;x++){const ax=(x+0.5-W/2)/F,dxz=cs+ax*cc,dzz=cc-ax*cs;const cu=pmod(Math.round((HC.yaw+Math.atan(ax))*PF),PW);COLU[x]=cu;const fogc=FOGC[cu];FOGL[x]=fogc;
    let yb=H,z=z0;
    while(z<ZFAR){PRF.it=(PRF.it||0)+1;const wx=HC.x+dxz*z,wz=HC.z+dzz*z;let gx=(wx-ORG)/CELL,gz=(wz-ORG)/CELL;gx=gx<0?0:gx>lim?lim:gx;gz=gz<0?0:gz>lim?lim:gz;
      const i=gx|0,j=gz|0,fx=gx-i,fz=gz-j,q=j*G1+i;const h0=HT[q],h1=HT[q+1],h2=HT[q+G1];
      let hg=h0+(h1-h0)*fx+(h2-h0)*fz+(h0-h1-h2+HT[q+G1+1])*fx*fz;const water=hg<0;const hs=water?0:hg;const sy=HZ+F*(ch-hs)/z;
      if(sy<yb){let top=Math.ceil(sy-0.5);if(top<0)top=0;const fk=fogK(z);
        if(water){// the lake: the sky mirrored, rippled, the sun's road of glitter
          const shore=hg>-0.35;for(let y=top;y<yb;y++){const p=y*W+x;const re=-ROWE[y];const rip=Math.sin(wx*0.45+wz*0.9+t*0.05+y*0.6)+Math.sin(wx*0.13-wz*0.3-t*0.031);let rr=PUP-Math.round(re*PF*(1+rip*0.08));rr=rr<0?0:rr>PUP?PUP:rr;
            let c=PANO[rr*PW+cu];let e=PEM[rr*PW+cu];c=mixf(c,0x1a2240,0.22+Math.min(0.4,re*3));if(shore&&y===top)c=mixf(c,0xf0d8c0,0.45);
            e=0;{let du=cu-SUNU;if(du>PW/2)du-=PW;if(du<-PW/2)du+=PW;const wdt=6+re*PF*0.5;if(du>-wdt&&du<wdt&&re<0.2&&hash(x,y,t>>2)<0.5-Math.abs(du)/wdt*0.4){c=0xfff4cc;e=200}}
            if(fk>0)c=mixf(c,fogc,fk*0.7);alb[p]=c;em[p]=e;lk[p]=0;ZB[p]=z}}
        else{PRF.gc=(PRF.gc||0)+1;GQ=q;GFX=fx;GFZ=fz;const c0=groundCol(blq,q,wx,wz,z,hg,F,Wd);const c=fk>0?mixf(c0,fogc,fk):c0;for(let y=top;y<yb;y++){const p=y*W+x;alb[p]=c;em[p]=0;lk[p]=0;ZB[p]=z}}
        yb=top;if(yb<=0)break}
      if(z>40&&sy>yb+60)z+=0.04*z;// far below the skyline already: skip ahead
      z+=z<20?z*z*0.0016:0.012*z+0.4;if(yb<HZ-F*(Wd.HMAX-ch)/z)break}
    for(let y=0;y<yb;y++){const p=y*W+x;let rr=PUP-Math.round(ROWE[y]*PF);rr=rr<0?0:rr>=PH?PH-1:rr;alb[p]=PANO[rr*PW+cu];em[p]=PEM[rr*PW+cu];lk[p]=0;ZB[p]=1e9}}}
// near-ground grain: a tiled noise texture instead of noise evaluated per sample; plot types precomputed
const NZT=new Float32Array(256*256);for(let j=0;j<256;j++)for(let i=0;i<256;i++)NZT[j*256+i]=vn2(i*0.25,j*0.25,9)-0.5;
function nzt(x,z){x*=4;z*=4;const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j;const i0=i&255,j0=j&255,i1=(i+1)&255,j1=(j+1)&255;const a=NZT[j0*256+i0],b=NZT[j0*256+i1],c=NZT[j1*256+i0],d=NZT[j1*256+i1];return a+(b-a)*fx+(c-a)*fz+(a-b-c+d)*fx*fz}
const PLT=new Int8Array(4096),PLC=new Float32Array(4096),PLSN=new Float32Array(4096);for(let i=0;i<4096;i++){const cx=(i>>6)-32,cz=(i&63)-32;PLT[i]=Math.floor(hash(cx,cz,91)*5);const an=hash(cx,cz,92)*Math.PI;PLC[i]=Math.cos(an);PLSN[i]=Math.sin(an)}
function groundCol(bl,q,wx,wz,z,hg,F,Wd){const foot=z/F;const LT=Wd.LT,TN=Wd.TN;const lt=bl(LT),tn=bl(TN);const near=z<26;
  const rq=Wd.RD[q];const d=rq<30&&rq>-30?bl(Wd.RD):99;const ad=d<0?-d:d;
  if(ad<6.6){const s=bl(Wd.RS);const LEN=Wd.LEN;
    if(ad<5.0){let v=0.1+0.85*lt+(tn-0.5)*0.35+(near?nzt(wx*0.33,wz*0.33)*0.12:0);let c=band(RA.asph,v);
      // markings: solid edges, dashed centre, the start line chequer
      const h2=foot*0.5;let m=Math.max(0,Math.min(ad+h2,4.56)-Math.max(ad-h2,4.32))/foot;let ds=s-Wd.S0;if(ds<0)ds+=LEN;if(ds>=LEN)ds-=LEN;
      if(ad<0.3&&pmod(s,10)<4)m=Math.max(m,Math.max(0,Math.min(ad+h2,0.1)-Math.max(ad-h2,-0.1))/foot);
      if(ds<1.6||ds>LEN-0.5){const ck=(Math.floor((d+5)/0.8)+Math.floor(ds/0.8))&1;return ck?band(RA.line,0.2+0.8*lt):0x16141c}
      if(ds>LEN-62&&ds<LEN-2&&pmod(ds,8)<0.25&&ad>0.6&&ad<4)m=1;
      if(m>0.2)c=m>0.7?band(RA.line,0.2+0.8*lt):mixf(c,band(RA.line,0.2+0.8*lt),0.5);return c}
    const si=pmod(Math.round(s),LEN);if(ad<6.1&&Math.abs(Wd.TK[si])>0.011){const red=(Math.floor(s/1.6)&1)===0;return band(red?RA.kred:RA.kwht,0.15+0.85*lt)}
    return band(RA.gravel,0.1+0.85*lt+(tn-0.5)*0.4)}
  if(hg<1.2)return band(RA.sand,0.12+0.85*lt+(tn-0.5)*0.3);
  const HT=Wd.HT,h0=HT[q];
  // steep ground shows rock
  if(Math.abs(HT[q+1]-h0)+Math.abs(HT[q+513]-h0)>2.2)return band(RA.rock,0.1+0.85*lt+(tn-0.5)*0.4);
  const fo=bl(Wd.FOR);
  if(fo>0.6)return band(RA.litter,0.08+0.8*lt+(tn-0.5)*0.5+(near?nzt(wx*0.22,wz*0.22)*0.3:0));
  // the patchwork: hedged plots, each its own crop, mown in stripes
  const fx=bl(Wd.WX),fz=bl(Wd.WZ);const cx=Math.floor(fx/72),cz=Math.floor(fz/56);const mx=fx-cx*72,mz=fz-cz*56;const ex=mx<36?mx:72-mx,ez=mz<28?mz:56-mz;
  if((ex<ez?ex:ez)<1.3+foot*0.4)return band(RA.hedge,0.1+0.8*lt+(tn-0.5)*0.3);
  const pi=((cx+32)&63)*64+((cz+32)&63);const ty=PLT[pi];const sp=wx*PLC[pi]+wz*PLSN[pi];
  const g=(near?nzt(wx*0.2,wz*0.2)*0.22:0)+(tn-0.5)*0.35;
  if(ty===0||ty===4){const st=foot<1.5&&pmod(sp,7)<3.5?0.09:0;return band(RA.stub,0.1+0.85*lt+g+st)}
  if(ty===1)return band(RA.pas,0.1+0.85*lt+g+(foot<1.2&&pmod(sp,9)<4.5?0.07:0));
  if(ty===2){const fr=foot<0.5&&pmod(sp,1.6)<0.6?-0.12:0;return band(RA.plough,0.1+0.85*lt+g+fr)}
  return band(RA.crop,0.1+0.85*lt+g+(foot<0.4&&pmod(sp,1.1)<0.45?-0.1:0))}
// ---------------- sprites painted at their own size: trees, spectators, balloons ----------------
const SPC=new Map();
const TRR=[[0x2c1420,0x4a1c22,0x6e2424,0x96302a,0xbc4630,0xdc6838,0xf09048],[0x2a1a1c,0x48261e,0x6e3a1e,0x985420,0xc07426,0xe09a34,0xf6c050],[0x281a20,0x442424,0x6a3022,0x904226,0xb85a2c,0xd87e36,0xf0a646],[0x1e2020,0x2e3424,0x484a26,0x6a6228,0x907c2e,0xb89a3a,0xdcbc50]];
const PINE=[0x0c1418,0x122022,0x1a2c26,0x243a2a,0x30482c,0x445a30,0x6a6a36];
function paintTree(kind,v,hp,back){const key='t'+kind+v+'_'+hp+(back?'b':'');let sp=SPC.get(key);if(sp)return sp;
  const w=Math.ceil(hp*(kind===0?0.95:kind===1?0.5:0.55))+4,h=hp+2;const c=new Int32Array(w*h).fill(-1),e=new Uint8Array(w*h);const cx=w/2;
  const put=(x,y,col,ee)=>{x|=0;y|=0;if(x<0||y<0||x>=w||y>=h)return;c[y*w+x]=col;e[y*w+x]=ee||0};
  const rp=kind===2?PINE:TRR[v];const LX=back?0.1:-0.75,LY=back?-0.35:-0.45,LZ=back?-0.6:0.5;
  // trunk
  const tw=Math.max(1,Math.round(hp*(kind===1?0.035:0.05)));const tTop=kind===2?h*0.25:h*0.55;const bark=kind===1?[0x5a5058,0xb8acac,0xe8dcd4]:[0x1e1418,0x3a2a26,0x5a4232];
  for(let y=Math.floor(tTop);y<h;y++)for(let i=0;i<tw;i++){const x=Math.round(cx-tw/2+i);put(x,y,i===0&&!back?bark[2]:i===tw-1?bark[0]:bark[1]);if(kind===1&&hash(x,y,5)<0.12)put(x,y,0x2a2228)}
  if(kind===2){// conifer: stacked jagged tiers
    const tiers=Math.max(2,Math.round(hp/7));for(let k=0;k<tiers;k++){const y0=1+(h*0.82)*k/tiers*0.92,y1=y0+h*0.82/tiers*1.5;const wb=(w*0.48)*(0.3+0.7*(k+1)/tiers);
      for(let y=Math.floor(y0);y<Math.min(h,y1);y++){const u=(y-y0)/(y1-y0);const hw=wb*u+0.5;for(let x=Math.floor(cx-hw);x<=Math.ceil(cx+hw);x++){const dx=(x+0.5-cx)/Math.max(1,hw);if(Math.abs(dx)>1)continue;if(u>0.75&&hash(x,k,y)<0.5&&Math.abs(dx)>0.5)continue;
        const L=0.42-dx*(back?0:0.45)*(LX<0?1:-1)*-1+(1-u)*0.18-(k/tiers)*0.08-u*0.18;put(x,y,band(rp,L))}}}}
  else{// broadleaf: overlapping clumps, each its own little lit dome, drawn top to bottom
    const ry=kind===1?h*0.36:h*0.33,rx=kind===1?w*0.42:w*0.46,cy=kind===1?h*0.4:h*0.38;const n=clamp(Math.round(hp/(kind===1?5:4)),3,30);const bl=[];
    for(let i=0;i<n;i++){const a=hash(i,hp,v*7+kind)*TAU,rr=Math.sqrt(hash(i,hp+1,v*7+kind))*0.72;bl.push([cx+Math.cos(a)*rx*rr,cy+Math.sin(a)*ry*rr,Math.max(1.2,(0.32+hash(i,hp+2,v)*0.2)*rx)])}
    bl.sort((a,b)=>a[1]-b[1]);
    for(const[bx,by,br]of bl)for(let y=Math.floor(by-br);y<=by+br;y++)for(let x=Math.floor(bx-br);x<=bx+br;x++){const u=(x+0.5-bx)/br,vv=(y+0.5-by)/br;const an=Math.atan2(vv,u);const dd=u*u+vv*vv;
      if(dd*(1+(hp>16?0.22*(hash(Math.floor(an*3+bx),Math.floor(by),3)-0.5):0))>1)continue;const nz=Math.sqrt(Math.max(0,1-dd));
      const glob=-(y-cy)/ry*0.22-(x-cx)/rx*(back?0:0.18);const lf=hp>36?(vn2(x*6/hp*3,y*6/hp*3,v+kind*5)-0.5)*0.32+(vn2(x*0.5,y*0.5,v+11)-0.5)*0.12:0;const L=0.3+(u*LX+vv*LY+nz*LZ)*0.42+glob+lf;put(x,y,band(rp,L))}}
  // edge: dark on the shadow side, or a burning rim when the sun is behind
  const src=c.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=y*w+x;if(src[p]<0)continue;const emp=(xx,yy)=>xx<0||yy<0||xx>=w||yy>=h||src[yy*w+xx]<0;
    if(back){if(kind!==2&&hp>=22&&emp(x,y-1)||kind===2&&hp>=22&&y<h*0.12&&emp(x,y-1)){c[p]=kind===2?0xd88a50:hp>40?0xffd88a:0xf0b060;e[p]=kind===2?20:hp>40?90:40}else if(emp(x,y+1))c[p]=rp[0]}
    else if(emp(x,y+1)||emp(x+1,y))c[p]=rp[0]}
  sp={w,h,c,e};SPC.set(key,sp);return sp}
const SHIRT=[0xe83e7a,0x2ec4d8,0xf6a232,0xf2f0e8,0x6a4ad8,0x38b058,0xe84a3a,0x1a1a26];
function paintFan(v,hp,arm){const key='f'+v+'_'+hp+arm;let sp=SPC.get(key);if(sp)return sp;const w=Math.max(3,Math.round(hp*0.6)),h=hp+1;const c=new Int32Array(w*h).fill(-1),e=new Uint8Array(w*h);const cx=w/2;
  const put=(x,y,col)=>{x|=0;y|=0;if(x>=0&&y>=0&&x<w&&y<h)c[y*w+x]=col};const sh=SHIRT[v%8],sk=[0xf0c8a0,0xc8946a,0x8a5a3a][v%3],hair=[0x1a1214,0x5a3a20,0xd8b060,0x2a1a1a][(v>>2)%4];
  if(hp<6){put(cx,0,hair);for(let y=1;y<h;y++)put(cx,y,y<h*0.6?sh:0x2a2430);if(arm&&hp>3)put(cx+1,0,sk);sp={w,h,c,e};SPC.set(key,sp);return sp}
  const hr=Math.max(1,hp*0.09),hy=hr+(arm?hp*0.08:0)+0.5;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=x+0.5-cx,dy=y+0.5-hy;if(dx*dx+dy*dy<=hr*hr)put(x,y,dy<-hr*0.2?hair:dx<0?mix(sk,0xffffff,0.15):sk)}
  const t0=hy+hr,t1=t0+hp*0.36;for(let y=Math.floor(t0);y<t1;y++){const hw=hp*0.16;for(let x=Math.floor(cx-hw);x<cx+hw;x++)put(x,y,x<cx-hw+1?mix(sh,0xffffff,0.25):x>cx+hw-1.5?mix(sh,0x000000,0.35):sh)}
  for(let y=Math.floor(t1);y<h;y++)for(const s of[-1,1])for(let k=0;k<Math.max(1,hp*0.07);k++)put(cx+s*hp*0.07-0.5+k,y,0x2a2634);
  const aw=Math.max(1,Math.round(hp*0.05));if(arm){for(const s of[-1,1])for(let k=0;k<hp*0.3;k++)for(let i=0;i<aw;i++)put(cx+s*(hp*0.17+k*0.25)+i,t0+hp*0.06-k,k>hp*0.25?sk:sh)}
  else for(const s of[-1,1])for(let k=0;k<hp*0.3;k++)for(let i=0;i<aw;i++)put(cx+s*hp*0.18+i-(s>0?aw:0),t0+k,k>hp*0.24?sk:mix(sh,0x000000,0.15))
  sp={w,h,c,e};SPC.set(key,sp);return sp}
const BALC=[[0xe83e7a,0xf6c232],[0x2ec4d8,0xf2f0e8],[0xf6a232,0xd8402a],[0x6a4ad8,0xf2c0e8]];
function paintBalloon(v,hp){const key='b'+v+'_'+hp;let sp=SPC.get(key);if(sp)return sp;const w=Math.ceil(hp*0.78)+2,h=hp+1;const c=new Int32Array(w*h).fill(-1),e=new Uint8Array(w*h);const cx=w/2,ry=hp*0.4,rx=hp*0.38;const[c1,c2]=BALC[v];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=(x+0.5-cx)/rx,vv=(y+0.5-ry)/ry;const taper=vv>0?1-vv*0.55:1;if(vv>1.25)continue;if(u*u/(taper*taper)+(vv<0?vv*vv:Math.min(1,vv*vv*0.6))>1)continue;
    const gore=Math.floor((Math.asin(clamp(u/taper,-1,1))+1.6)*2.4);let col=gore%2?c1:c2;const lt=0.55-u*0.5-vv*0.2;col=lt<0.25?mix(col,0x2a1a3a,0.5):lt>0.75?mix(col,0xfff0d0,0.35):col;c[y*w+x]=col}
  for(let y=Math.round(ry*2.05);y<h;y++)for(let x=Math.round(cx-hp*0.05);x<=cx+hp*0.05;x++)if(x>=0&&x<w)c[y*w+x]=y>h-hp*0.08?0x5a3a22:0x3a2a20;
  sp={w,h,c,e};SPC.set(key,sp);return sp}
const sizeQ=hp=>{if(hp<24)return Math.max(2,Math.round(hp));return Math.round(Math.pow(1.06,Math.round(Math.log(hp)/Math.log(1.06))))};
// blit a sprite with its base at (sx,sy), depth-tested against the ground, fogged
function spans(sp){if(sp.sa)return;const a=new Int16Array(sp.h),b=new Int16Array(sp.h);for(let y=0;y<sp.h;y++){let lo=sp.w,hi=-1;for(let x=0;x<sp.w;x++)if(sp.c[y*sp.w+x]>=0){if(x<lo)lo=x;hi=x}a[y]=lo;b[y]=hi}sp.sa=a;sp.sb=b}
function blitSpr(sp,sx,sy,z,flip,fk,fogc){const x0=Math.round(sx-sp.w/2),y0=Math.round(sy-sp.h+1);const alb=S.alb,em=S.em,lk=S.lk;spans(sp);
  if(x0>=W||y0>=H||x0+sp.w<0||y0+sp.h<0)return;
  for(let y=Math.max(0,-y0);y<Math.min(sp.h,H-y0);y++){const Y=y0+y;let a=flip?sp.w-1-sp.sb[y]:sp.sa[y],b=flip?sp.w-1-sp.sa[y]:sp.sb[y];if(b<a)continue;a=Math.max(a,-x0);b=Math.min(b,W-1-x0);for(let x=a;x<=b;x++){const X=x0+x;const sx2=flip?sp.w-1-x:x;let c=sp.c[y*sp.w+sx2];if(c<0)continue;const p=Y*W+X;if(z>=ZB[p])continue;
    if(fk>0)c=mixf(c,fogc!=null?fogc:FOGL[X],fk);alb[p]=c;em[p]=sp.e[y*sp.w+sx2];lk[p]=0;ZB[p]=z}}}
// ---------------- the cars: a lofted body, glass, wing and wheels, rasterized and painted per pixel from their own coordinates ----------------
// car space: x right, y up, z forward; 4.5 m long, 1.96 m wide.
const WB=1.36,WT=0.86,WR=0.345;
function bodyParams(z){const hw=z<-2.0?0.97-(z+2.0)*-0.36:z>1.9?0.95-(z-1.9)*0.36:z<-0.9?0.97:z>1.0?0.955:0.94-0.02*Math.cos((z+0.9)/1.9*Math.PI);
  const yb=z<-1.5?0.82+(z+1.5)*0.03:z<0?0.82-(z+1.5)*0.013:z<1.2?0.8-z*0.075:0.71-(z-1.2)*0.15;
  const k=z<-1.75?0:z<-0.45?sstep(-1.75,-0.45,z):z<0.4?1:z<1.3?1-sstep(0.4,1.3,z):0;return[hw,yb,k]}
const CARM=(function(){const v=[],nn=[],tri=[],pt=[];const NSn=34,RING=26;const zs=[];for(let i=0;i<NSn;i++){const u=i/(NSn-1);zs.push(-2.25+4.5*(0.5-0.5*Math.cos(u*Math.PI))*0.15+4.5*u*0.85)}
  const ring=z=>{const[hw,yb,k]=bodyParams(z);const roof=1.2,cw=0.6,top=yb+k*(roof-yb);const half=[[0,0.16],[hw*0.8,0.16],[hw*0.97,0.23],[hw,0.34],[hw,yb-0.17],[hw*0.99,yb-0.07],[hw*0.955,yb]];
    // above the belt: cabin when k=1, a crowned deck when k=0
    const cab=[[hw*0.86,yb+0.02],[hw*0.8+(cw-hw*0.8)*0.45,yb+(top-yb)*0.5],[cw+0.02,top-0.06],[cw*0.86,top-0.015],[cw*0.5,top+0.005],[0,top+0.012]];
    const deck=[[hw*0.86,yb+0.02],[hw*0.7,yb+0.035],[hw*0.52,yb+0.045],[hw*0.36,yb+0.052],[hw*0.18,yb+0.056],[0,yb+0.058]];
    for(let i=0;i<6;i++)half.push([deck[i][0]+(cab[i][0]-deck[i][0])*k,deck[i][1]+(cab[i][1]-deck[i][1])*k]);
    const full=half.slice();for(let i=half.length-2;i>=1;i--)full.push([-half[i][0],half[i][1]]);return{pts:full,k,yb}};
  const R0=[];for(let i=0;i<NSn;i++){const rr=ring(zs[i]);R0.push(rr);for(const p of rr.pts)v.push([p[0],p[1],zs[i]])}
  const M=R0[0].pts.length;const nv=(i,j)=>i*M+pmod(j,M);
  for(let i=0;i<NSn-1;i++)for(let j=0;j<M;j++){const a=nv(i,j),b=nv(i,j+1),c=nv(i+1,j+1),d=nv(i+1,j);const jj=Math.min(j,M-j);const kk=(R0[i].k+R0[i+1].k)/2;
    // which part: glass where the cabin's side window or the front/rear screens are
    let part=1;if(kk>0.55&&(jj===7||jj===8))part=3;if(jj>=9&&kk>0.08&&kk<0.92)part=3;tri.push([a,b,c],[a,c,d]);pt.push(part,part)}
  // smooth normals, pointed away from the car's spine
  for(let i=0;i<v.length;i++)nn.push([0,0,0]);for(const[a,b,c]of tri){const A=v[a],B=v[b],C=v[c];const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],wx=C[0]-A[0],wy=C[1]-A[1],wz=C[2]-A[2];let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;
    const mx=(A[0]+B[0]+C[0])/3,my=(A[1]+B[1]+C[1])/3-0.6;if(nx*mx+ny*my<0){nx=-nx;ny=-ny;nz=-nz}for(const q of[a,b,c]){nn[q][0]+=nx;nn[q][1]+=ny;nn[q][2]+=nz}}
  // end caps: the rear fascia and the nose
  for(const[i,dir]of[[0,-1],[NSn-1,1]]){const c0=v.length;const zc=zs[i];v.push([0,0.45,zc]);nn.push([0,0,dir]);for(let j=0;j<M;j++){const p=v[nv(i,j)];v.push([p[0],p[1],zc]);nn.push([p[0]*0.25,0.05,dir])}
    for(let j=0;j<M;j++){tri.push([c0,c0+1+j,c0+1+(j+1)%M]);pt.push(dir<0?2:4)}}
  return{v,n:nn,tri,pt}})();
// the wing: a blade on two swan-neck stays; a box-ish mesh
const WINGM=(function(){const v=[],nn=[],tri=[],pt=[];const box=(x0,x1,y0,y1,z0,z1,part)=>{const c=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
    const F6=[[0,1,2,3,[0,0,-1]],[5,4,7,6,[0,0,1]],[4,0,3,7,[-1,0,0]],[1,5,6,2,[1,0,0]],[3,2,6,7,[0,1,0]],[4,5,1,0,[0,-1,0]]];for(const f of F6){const b=v.length;for(let k=0;k<4;k++){v.push(c[f[k]]);nn.push(f[4])}tri.push([b,b+1,b+2],[b,b+2,b+3]);pt.push(part,part)}};
  box(-0.88,0.88,1.1,1.145,-2.2,-1.92,5);box(-0.9,-0.88,0.96,1.18,-2.24,-1.88,5);box(0.88,0.9,0.96,1.18,-2.24,-1.88,5);box(-0.5,-0.46,0.84,1.11,-2.12,-1.98,5);box(0.46,0.5,0.84,1.11,-2.12,-1.98,5);
  box(-0.34,0.34,0.95,1.0,1.0,1.1,1);// nothing visible: keeps the mesh honest
  return{v,n:nn,tri:tri.slice(0,-2),pt:pt.slice(0,-2)}})();
const LBM=(function(){const v=[],nn=[],tri=[],pt=[];const c=[[-0.56,1.19,-0.14],[0.56,1.19,-0.14],[0.56,1.29,-0.14],[-0.56,1.29,-0.14],[-0.56,1.19,0.14],[0.56,1.19,0.14],[0.56,1.29,0.14],[-0.56,1.29,0.14]];
  for(const f of[[0,1,2,3,[0,0,-1]],[5,4,7,6,[0,0,1]],[4,0,3,7,[-1,0,0]],[1,5,6,2,[1,0,0]],[3,2,6,7,[0,1,0]]]){const b=v.length;for(let k=0;k<4;k++){v.push(c[f[k]]);nn.push(f[4])}tri.push([b,b+1,b+2],[b,b+2,b+3]);pt.push(8,8)}return{v,n:nn,tri,pt}})();
// a tyre: tread and sidewalls round the axle (x), the rim face as a fan
const TYM=(function(){const v=[],nn=[],tri=[],pt=[];const prof=[[-0.135,0.245],[-0.138,0.3],[-0.115,0.337],[-0.05,0.345],[0.05,0.345],[0.115,0.337],[0.138,0.3],[0.135,0.245]];const NA=22;
  for(let a=0;a<NA;a++){const an=a/NA*TAU;for(const[px,pr]of prof){v.push([px,Math.cos(an)*pr,Math.sin(an)*pr]);const side=Math.abs(px)>0.12?Math.sign(px):0;nn.push([side*0.9,Math.cos(an)*(1-Math.abs(side)*0.6),Math.sin(an)*(1-Math.abs(side)*0.6)])}}
  const M=prof.length;for(let a=0;a<NA;a++)for(let k=0;k<M-1;k++){const i0=a*M+k,i1=((a+1)%NA)*M+k;tri.push([i0,i1,i1+1],[i0,i1+1,i0+1]);pt.push(6,6)}
  // rim discs on both faces (only the outer one is seen)
  for(const sd of[-1,1]){const c0=v.length;v.push([sd*0.11,0,0]);nn.push([sd,0,0]);for(let a=0;a<NA;a++){const an=a/NA*TAU;v.push([sd*0.12,Math.cos(an)*0.247,Math.sin(an)*0.247]);nn.push([sd,0,0])}for(let a=0;a<NA;a++){tri.push([c0,c0+1+a,c0+1+(a+1)%NA]);pt.push(7)}}
  return{v,n:nn,tri,pt}})();
// paints: banded, the top band warmed by the sky
const mkRamp=(d,m,l,hi)=>[mix(d,0x05040a,0.5),d,mix(d,m,0.5),m,mix(m,l,0.5),l,mix(l,hi,0.5),hi];
const PAINTS=[mkRamp(0x0a2a3a,0x137a96,0x3cc0cc,0xfff0d0),mkRamp(0x4a1608,0xc8481c,0xf6913a,0xfff2c8),mkRamp(0x5a5a72,0xc8c4d0,0xf2eee8,0xfffaf0),mkRamp(0x08080e,0x1c1c26,0x3a3a48,0xd8c8c0),mkRamp(0x3a3a06,0xb0b81a,0xe8ec5a,0xfffad0),mkRamp(0x3a060e,0x9c1420,0xe0303a,0xfff0d8),mkRamp(0x40081e,0xd02a74,0xff6aa8,0xfff0f4),mkRamp(0x050508,0x101018,0x262632,0x9a9ab0),mkRamp(0x50505e,0xb8b8c4,0xe8e8f0,0xffffff),mkRamp(0x4a3404,0xd0a010,0xf8d040,0xfff8d0),mkRamp(0x080c24,0x1a2a6a,0x3a56a8,0xc8d8ff),mkRamp(0x0c3a34,0x2a9a84,0x6ad8c0,0xf0fff8)];
const STRIPE=[0xf2f0ec,0x16161e,0xc8142a,0xf2f0ec,0x16161e,0xf2f0ec,0xf2f0ec,0xf2f0ec,0x16161e,0x16161e,0xf2f0ec,0xf2f0ec];
const NOSTRIPE={7:1,8:1,9:1,10:1,11:1};
const GLASS=[0x06070c,0x0c0f18,0x141a26,0x1e2636,0x2e3448,0x4c4c64,0x8a7a86,0xd8a888,0xfcd8a8];
const CARB=[0x060608,0x0c0c10,0x15151a,0x202026,0x2c2c34,0x3e3e48];
const TYRE=[0x070608,0x0e0c10,0x16141a,0x201e26,0x2c2832,0x3c3842];
const RIMC=[0x2a2a30,0x4a4a54,0x6e6e7a,0x9a98a4,0xc8c4cc,0xf0ece8];
// lighting for the car painter; another scene (night city) swaps these
const ENV={sun:SUN,kd:0.52,amb:0.06,sky:0.42,skyK:0.7,skyMax:0.3,sunR:0.25,hor:0.78,gnd:0.06,rim:0xffe2a8,rimK:1,tint:0,tintK:0,t:0};
let PE=0;const CM=new Float32Array(9),CO=[0,0,0];let CTWO=-1,CPAINT=0,CSPIN=0,CBRAKE=0,CPOP=0,CSPD=0;
// local → world, given the car's yaw, pitch (nose up) and roll (right side down)
function carMat(yaw,pitch,roll){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll);
  // roll about z, then pitch about x, then yaw about y
  const a=[cr,-sr,0,sr,cr,0,0,0,1],b=[1,0,0,0,cp,sp,0,-sp,cp],c=[cy,0,sy,0,1,0,-sy,0,cy];const m=(A,B)=>{const o=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)o[i*3+j]=A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j];return o};return m(c,m(b,a))}
const SV=new Float32Array(4000*3),SZV=new Float32Array(4000);
// paint callback: part, local position, local normal → colour (PE set for emissive)
function shadeV(nx,ny,nz,lx,ly,lz){const wnx=CM[0]*nx+CM[1]*ny+CM[2]*nz,wny=CM[3]*nx+CM[4]*ny+CM[5]*nz,wnz=CM[6]*nx+CM[7]*ny+CM[8]*nz;const nl=Math.hypot(wnx,wny,wnz)||1;const Nx=wnx/nl,Ny=wny/nl,Nz=wnz/nl;
  const px=CO[0]+CM[0]*lx+CM[1]*ly+CM[2]*lz,py=CO[1]+CM[3]*lx+CM[4]*ly+CM[5]*lz,pz=CO[2]+CM[6]*lx+CM[7]*ly+CM[8]*lz;let vx=px-HC.x,vy=py-HC.h,vz=pz-HC.z;const vl=Math.hypot(vx,vy,vz)||1;vx/=vl;vy/=vl;vz/=vl;
  const dn=vx*Nx+vy*Ny+vz*Nz;const rx=vx-2*dn*Nx,ry=vy-2*dn*Ny,rz=vz-2*dn*Nz;const SN=ENV.sun;const sun=Math.max(0,Nx*SN[0]+Ny*SN[1]+Nz*SN[2]);const rs=rx*SN[0]+ry*SN[1]+rz*SN[2];
  const refl=ry>0.03?ENV.sky+Math.min(ENV.skyMax,ry*ENV.skyK)+Math.max(0,rs)*ENV.sunR:ry>-0.05?ENV.hor:ENV.gnd;const fres=0.3+0.7*Math.pow(1-Math.min(1,Math.abs(dn)),2.5);
  SH0=ENV.amb+sun*ENV.kd+Math.max(0,Ny)*0.08;SH1=refl;SH2=fres;SH3=rs;SH4=Ny}
let SH0=0,SH1=0,SH2=0,SH3=0,SH4=0;
function tint(c,v){return ENV.tintK&&v>0.5?mixf(c,ENV.tint,ENV.tintK*Math.min(1,(v-0.5)*2)):c}
function paintCar(part,lx,ly,lz,nx,ny,nz){PE=0;shadeV(nx,ny,nz,lx,ly,lz);const base=SH0,refl=SH1,fres=SH2,rs=SH3;const pr=PAINTS[CPAINT];
  const ax=Math.abs(lx);
  if(part===1){// body panels
    const wz=lz>0?WB:-WB;const arch=ax>0.6&&ly<0.72&&Math.hypot(ly-0.33,lz-wz)<0.455;if(arch){const d=Math.hypot(ly-0.33,lz-wz);if(d>0.43)return band(pr,0.35+base*0.4);return 0x050407}
    if(ly<0.235||(ny<-0.2))return band(CARB,0.15+base*0.8);
    let v=base*(1-fres*0.55)+refl*fres*0.95;if(rs>0.985)return 0xfffbe8;if(rs>0.955&&ny>0.2)v=Math.max(v,0.93);
    // stripes over the top, door shut lines, the side intake
    if(STRIPE[CPAINT]!=null&&!NOSTRIPE[CPAINT]&&ny>0.5&&ax>0.11&&ax<0.23)return mix(band(pr,v),STRIPE[CPAINT],0.85);
    if(Math.abs(nx)>0.55&&ly>0.27&&ly<0.74&&(Math.abs(lz-0.74)<0.018||Math.abs(lz+0.64)<0.018))return band(pr,v-0.3);
    if(Math.abs(nx)>0.5&&lz>-1.08&&lz<-0.6&&ly>0.4+(lz+1.08)*0.05&&ly<0.6)return band(CARB,0.2+base*0.6);
    // mirrors' stubs read as a dark notch on the beltline
    if(lz>0.42&&lz<0.62&&ly>0.78&&ly<0.86&&ax>0.8)return band(CARB,0.3+base);
    // tail-light returns wrapping round the rear corners
    if(lz<-1.98&&ly>0.6&&ly<0.74&&ax>0.6){PE=CBRAKE?255:200;return CBRAKE?0xff5040:0xe0202a}
    if(lz>1.95&&ly>0.48&&ly<0.56&&ax>0.5&&ax<0.88){PE=200;return 0xfff4e0}
    if(CTWO>=0&&ly<0.66&&Math.abs(nx)>0.45&&lz>-1.9&&lz<1.7)return tint(band(PAINTS[CTWO],v),v);
    return tint(band(pr,v),v)}
  if(part===3){// glass: the sky in it, a dark interior through it
    let v=refl*fres*1.05+0.05;if(rs>0.97)return 0xfff4d8;return band(GLASS,v)}
  if(part===2){// the rear fascia
    let v=base*(1-fres*0.5)+refl*fres*0.9;
    if(ly>0.62&&ly<0.745){// light band: smoked strip with the LED line, bigger clusters at the ends
      const led=ly>0.66&&ly<0.69&&ax<0.88;const clu=ax>0.6&&ax<0.88&&(Math.abs(ly-0.645)<0.012||Math.abs(ly-0.725)<0.012||Math.abs(ax-0.61)<0.02||Math.abs(ax-0.87)<0.015);
      if(led||clu){PE=CBRAKE?255:210;return CBRAKE?(ly>0.67&&ly<0.68?0xffe0d0:0xff3a30):(ly>0.67&&ly<0.68?0xff8a70:0xd8202c)}return ax>0.6?0x2a080e:0x0e0a10}
    if(ly>0.745)return tint(band(pr,v+0.1),v);
    if(ax<0.27&&ly>0.39&&ly<0.52){// the plate
      const u=(lx+0.27)/0.54,w=(ly-0.39)/0.13;if(u<0.04||u>0.96||w<0.08||w>0.92)return 0x1a1820;const ch=PLATE(u,1-w);return ch?0x14121a:(0.5+base>0.7?0xf8f0e0:0xc8c0c8)}
    if(ly<0.31){// diffuser and the twin exhausts
      for(const sd of[-1,1]){const d=Math.hypot(lx-sd*0.36,ly-0.255);if(d<0.078){if(d>0.06)return band(RIMC,0.4+base);if(CPOP>0){PE=255;return d<0.03?0xfff4c0:0xff9a3a}return d<0.04?0x020203:0x0c0a0e}}
      if(ax<0.7&&pmod(lx+0.05,0.17)<0.026)return band(CARB,0.45+base*0.5);return band(CARB,0.12+base*0.3)}
    if(ax>0.7&&ax<0.82&&ly>0.33&&ly<0.37){PE=80;return 0x8a1418}
    return band(pr,v)}
  if(part===4){// the nose: headlights, grille, splitter
    const v=base*(1-fres*0.5)+refl*fres*0.9;if(ly>0.47&&ly<0.56&&ax>0.42&&ax<0.86){PE=230;return ax>0.8||ly>0.545?0xc8d8f0:0xffffff}
    if(ly<0.42&&ly>0.2&&ax<0.62)return pmod(ly,0.05)<0.012?band(CARB,0.5):band(CARB,0.1);if(ly<0.2)return band(CARB,0.3);return band(pr,v)}
  if(part===5){const v=base*0.9+refl*fres*0.6;return band(CARB,v*0.9+0.08)}
  if(part===8){// a police light bar: red one side, blue the other, taking turns
    const ph=(ENV.t>>3)%4;const left=lx<0;const on=left?ph<2:ph>=2;if(Math.abs(lx)<0.08)return band(CARB,0.3);PE=on?255:30;return left?(on?0xff5060:0x5a1018):(on?0x60a0ff:0x102050)}
  return 0}
// tiny plate letters, 3x5
const PLG={S:'111100111001111',K:'101110100110101',Y:'101101010010010',2:'111001111100111',6:'111100111101111',' ':'000000000000000'};const PLATESTR='SKY 26';
function PLATE(u,w){const n=PLATESTR.length;const ci=Math.floor(u*n*1.0);const cu=u*n-ci;const g=PLG[PLATESTR[ci]];if(!g)return 0;const gx=Math.floor((cu-0.1)/0.8*3),gy=Math.floor((w-0.18)/0.64*5);if(gx<0||gx>2||gy<0||gy>4)return 0;return g[gy*3+gx]==='1'}
function paintWheel(part,lx,ly,lz,nx,ny,nz){PE=0;shadeV(nx,ny,nz,lx,ly,lz);const base=SH0;
  if(part===6){const side=Math.abs(nx)>0.5;if(!side){const groove=Math.abs(lx)<0.1&&pmod(lx+0.1,0.066)<0.012;return band(TYRE,base*0.8+(groove?0:0.12))}return band(TYRE,0.12+base*0.7+(Math.abs(Math.hypot(ly,lz)-0.28)<0.008?0.2:0))}
  // the rim: five split spokes, a pink caliper behind, blurred into rings at speed
  const r=Math.hypot(ly,lz)/0.247,an=Math.atan2(lz,ly);
  if(r>0.93)return band(RIMC,0.35+base*0.6);if(r<0.17)return r<0.09?0xd8d4dc:band(RIMC,0.3+base*0.5);
  const cal=an>1.1&&an<2.2&&r>0.55&&r<0.86;
  if(CSPD>14){const ring=r>0.3&&r<0.37||r>0.82;if(cal)return 0xd03a7a;return ring?band(RIMC,0.5+base*0.4):band(RIMC,0.18+base*0.35)}
  const sa=pmod(an-CSPIN,TAU/5)-TAU/10;const w=0.09+0.08*(1-r);const spoke=Math.abs(sa-0.07)<w*0.5||Math.abs(sa+0.07)<w*0.5;
  if(spoke)return band(RIMC,0.4+base*0.6+(sa>0?0.12:0));if(cal)return 0xd03a7a;return r>0.45?band([0x1a1a20,0x2a2a32,0x3a3a44],base+0.2):0x0a0a0e}
// rasterize a mesh: transformed by CM/CO, projected, z-buffered into a PIX canvas, painted per pixel
function drawMesh(C,m,paint,idBase,X){const v=m.v,nn=m.n,nv=v.length;const F=HC.F,HZ=HC.HZ,ch=HC.h,cs=HC.s,cc=HC.c;
  for(let i=0;i<nv;i++){const p=v[i];let lx=p[0],ly=p[1],lz=p[2];if(X){const t=X(lx,ly,lz);lx=t[0];ly=t[1];lz=t[2]}
    const wx=CO[0]+CM[0]*lx+CM[1]*ly+CM[2]*lz,wy=CO[1]+CM[3]*lx+CM[4]*ly+CM[5]*lz,wz=CO[2]+CM[6]*lx+CM[7]*ly+CM[8]*lz;const dx=wx-HC.x,dz=wz-HC.z;const xc=dx*cc-dz*cs,zc=dx*cs+dz*cc;
    SZV[i]=zc;if(zc<0.25)continue;SV[i*3]=W/2+F*xc/zc;SV[i*3+1]=HZ+F*(ch-wy)/zc;SV[i*3+2]=zc}
  const T=m.tri,PT=m.pt;const cw=C.w,zb=C.z;
  for(let k=0;k<T.length;k++){const[a,b,c]=T[k];if(SZV[a]<0.25||SZV[b]<0.25||SZV[c]<0.25)continue;const ax=SV[a*3],ay=SV[a*3+1],bx=SV[b*3],by=SV[b*3+1],cx=SV[c*3],cy=SV[c*3+1];
    const ar=(bx-ax)*(cy-ay)-(cx-ax)*(by-ay);if(Math.abs(ar)<0.05)continue;const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx))),y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));if(x1<x0||y1<y0)continue;
    {const na=nn[a],nb=nn[b],nc=nn[c];const mx=na[0]+nb[0]+nc[0],my=na[1]+nb[1]+nc[1],mz=na[2]+nb[2]+nc[2];let lx2=mx,ly2=my,lz2=mz;if(X){const p0=X(0,0,0),p1=X(mx,my,mz);lx2=p1[0]-p0[0];ly2=p1[1]-p0[1];lz2=p1[2]-p0[2]}
      const wnx=CM[0]*lx2+CM[1]*ly2+CM[2]*lz2,wny=CM[3]*lx2+CM[4]*ly2+CM[5]*lz2,wnz=CM[6]*lx2+CM[7]*ly2+CM[8]*lz2;const va0=v[a];const wx=CO[0]+CM[0]*va0[0]+CM[1]*va0[1]+CM[2]*va0[2]-HC.x,wy=CO[1]+CM[3]*va0[0]+CM[4]*va0[1]+CM[5]*va0[2]-HC.h,wz=CO[2]+CM[6]*va0[0]+CM[7]*va0[1]+CM[8]*va0[2]-HC.z;
      if(!X&&wnx*wx+wny*wy+wnz*wz>0.02*Math.hypot(wx,wy,wz)*Math.hypot(wnx,wny,wnz))continue}
    const inv=1/ar;const part=PT[k];const va=v[a],vb=v[b],vc=v[c],na=nn[a],nb=nn[b],nc=nn[c];const za=SV[a*3+2],zbv=SV[b*3+2],zcv=SV[c*3+2];
    for(let y=y0;y<=y1;y++){const py=y+0.5;for(let x=x0;x<=x1;x++){const px=x+0.5;const w0=((bx-px)*(cy-py)-(cx-px)*(by-py))*inv,w1=((cx-px)*(ay-py)-(ax-px)*(cy-py))*inv,w2=1-w0-w1;if(w0<-1e-4||w1<-1e-4||w2<-1e-4)continue;
      const z=w0*za+w1*zbv+w2*zcv;const q=y*cw+x;if(z>=zb[q])continue;
      const col=paint(part,w0*va[0]+w1*vb[0]+w2*vc[0],w0*va[1]+w1*vb[1]+w2*vc[1],w0*va[2]+w1*vb[2]+w2*vc[2],w0*na[0]+w1*nb[0]+w2*nc[0],w0*na[1]+w1*nb[1]+w2*nc[1],w0*na[2]+w1*nb[2]+w2*nc[2]);
      if(col<0)continue;PIX.put(C,x,y,col,idBase+part,PE,0,z)}}}}
const CC=PIX.cv(W,H);
// one car into CC: body, wing, four wheels; then seams, the sun's rim, an outline
function paintCarAll(car,o){const M=carMat(car.yaw,car.pitch||0,car.roll||0);for(let i=0;i<9;i++)CM[i]=M[i];CO[0]=car.x;CO[1]=car.y+(car.bob||0);CO[2]=car.z;CPAINT=car.paint;CTWO=car.two==null?-1:car.two;CBRAKE=car.brake?1:0;CPOP=car.pop||0;CSPD=car.v;
  drawMesh(CC,CARM,paintCar,0);if(car.wing!==false)drawMesh(CC,WINGM,paintCar,0);if(car.bar)drawMesh(CC,LBM,paintCar,0);
  const BM=CM.slice(),BO=CO.slice();
  for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const st=sz>0?car.steer*0.38:0;const cst=Math.cos(st),sst=Math.sin(st);CSPIN=car.spin*(sx>0?-1:1);
    // a wheel's own frame: offset to the hub, steered, mirrored so the rim faces out; it does not roll with the body
    const hx=sx*WT,hy=WR-0.005,hz=sz*WB;const X=(lx,ly,lz)=>{lx*=sx;const rx=lx*cst+lz*sst,rz=-lx*sst+lz*cst;return[hx+rx,hy+ly-(car.bob||0),hz+rz]};
    for(let i=0;i<9;i++)CM[i]=BM[i];CO[0]=BO[0];CO[1]=BO[1];CO[2]=BO[2];drawMesh(CC,TYM,(part,lx,ly,lz,nx,ny,nz)=>paintWheel(part,lx*sx,ly,lz,nx*sx,ny,nz),0,X)}
  // rim light from the sun when it is ahead of the camera
  const SN=ENV.sun,sF=SN[0]*HC.s+SN[2]*HC.c,sR=SN[0]*HC.c-SN[2]*HC.s;const back=Math.max(0,sF)*ENV.rimK;
  PIX.finish(CC,{ink:0x07050a,seam:true,rim:ENV.rim,rimUp:(0.2+back*0.6)*Math.min(1,ENV.rimK+0.3),rimL:sR<0?back*0.7:0.05,rimR:sR>0?back*0.7:0.05,selout:0x6a3a2a,noSeam:(a,b)=>a===7&&b===6||a===6&&b===7})}
function blitCar(fk,fogc){const C=CC;if(C.x1<0)return;const alb=S.alb,em=S.em,lk=S.lk;for(let y=Math.max(0,C.y0-1);y<=Math.min(H-1,C.y1+1);y++)for(let x=Math.max(0,C.x0-1);x<=Math.min(W-1,C.x1+1);x++){const p=y*W+x;let c=C.c[p];if(c<0)continue;
    const z=C.z[p]<1e8?C.z[p]:minZ(C,x,y);if(z>ZB[p]+0.3)continue;if(fk>0)c=mix(c,fogc,fk);alb[p]=c;em[p]=C.e[p];lk[p]=0;ZB[p]=z}PIX.clear(C)}
function minZ(C,x,y){let m=1e9;for(const q of[-1,1,-W,W]){const v=C.z[y*W+x+q];if(v<m)m=v}return m}
// the car's long evening shadow: the hull of its footprint and its roof thrown along the sun
function carShadow(car){const M=carMat(car.yaw,0,0);const gy=car.gy;const pts=[];const up=Math.max(0,car.y-gy);
  for(const[x,z]of[[-1,-2.2],[1,-2.2],[1,2.2],[-1,2.2]])for(const hh of[0.15,1.15]){const wx=car.x+M[0]*x+M[2]*z,wz=car.z+M[6]*x+M[8]*z;const d=(hh+up)/TANEL;pts.push([wx+SUNH[0]*d,wz+SUNH[1]*d])}
  const hull=convex(pts);const sp=[];for(const[x,z]of hull){const p=proj(x,gy+0.05,z);if(!p)return;sp.push(p)}
  fillPoly(sp,(p)=>{if(Math.abs(ZB[p]-sp[0][2])>14)return;S.alb[p]=mix(S.alb[p],0x1a1230,0.5)});
  // contact: darker right under the body
  if(up<0.5){const sq=[];for(const[x,z]of[[-0.95,-2.1],[0.95,-2.1],[0.95,2.1],[-0.95,2.1]]){const p=proj(car.x+M[0]*x+M[2]*z,gy+0.05,car.z+M[6]*x+M[8]*z);if(!p)return;sq.push(p)}fillPoly(sq,p=>{S.alb[p]=mix(S.alb[p],0x0a0610,0.55)})}}
function convex(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
  for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}up.pop();lo.pop();return lo.concat(up)}
function fillPoly(pts,fn){let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}y0=Math.max(0,Math.floor(y0));y1=Math.min(H-1,Math.ceil(y1));const n=pts.length;
  for(let y=y0;y<=y1;y++){const yc=y+0.5,xs=[];for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];if((a[1]<=yc)!==(b[1]<=yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}xs.sort((a,b)=>a-b);
    for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-0.5));x<=Math.min(W-1,Math.floor(xs[k+1]-0.5));x++)fn(y*W+x)}}
// ---------------- driving ----------------
const NAMES=['你','阿洛','米娅','卡洛斯','健太','索菲'];
function tIdx(s){return pmod(Math.floor(s),WORLD.LEN)}
function mkCar(i,s,lat){const Wd=WORLD;const k=tIdx(s),h=Wd.TH[k];const x=Wd.TX[k]+Math.cos(h)*lat,z=Wd.TZ[k]-Math.sin(h)*lat;const y=Wd.at(Wd.HT,x,z);
  return{i,name:NAMES[i],paint:i,x,z,y,gy:y,vy:0,yaw:h,vh:h,v:0,steer:0,s,lap:0,air:0,drift:0,spin:0,pitch:0,roll:0,bob:0,brake:false,pop:0,gear:1,rpm:0.3,lane:lat,skill:i===0?1:0.8+hash(i,1,7)*0.07,fin:0,off:0,hb:0,airMax:0,airT:0}}
// the line through each corner: where to be, how fast to go
function aiPad(g,car){const Wd=WORLD;const k=tIdx(car.s);const look=7+car.v*0.55;const tk=tIdx(car.s+look);
  // lateral target: keep a lane, swing out round a slower car ahead
  let lane=car.lane;for(const o of g.cars){if(o===car)continue;const ds=progress(o)-progress(car);if(ds>0&&ds<22&&Math.abs(latOf(o)-lane)<2.4&&o.v<car.v+3){lane=latOf(o)>0?-2.4:2.4;break}}
  const curvAhead=(()=>{let m=0;for(let d=10;d<70+car.v*1.6;d+=6)m=Math.max(m,Math.abs(Wd.TK[tIdx(car.s+d)]));return m})();
  const tx=Wd.TX[tk]+Math.cos(Wd.TH[tk])*lane*0.7,tz=Wd.TZ[tk]-Math.sin(Wd.TH[tk])*lane*0.7;let hd=Math.atan2(tx-car.x,tz-car.z);
  const vmax=82*car.skill;let vt=Math.min(vmax,Math.sqrt(23*car.skill/Math.max(1e-4,curvAhead)));
  // crests: arrive fast enough to fly, not so fast the landing is in the next field
  for(let d=0;d<90;d+=5){const a=tIdx(car.s+d);const vk=(Wd.TY[tIdx(car.s+d+8)]-2*Wd.TY[a]+Wd.TY[tIdx(car.s+d-8)])/64;if(vk<-0.003)vt=Math.min(vt,Math.sqrt(13/-vk)*1.3)}
  // the player's car drifts the tight corners for show
  const want=car.i===0&&g.auto&&curvAhead>0.012&&car.v>24;const turn=Math.sign(Wd.TK[tIdx(car.s+18)]);
  let body=hd;if(want&&Math.abs(Wd.TK[tIdx(car.s+8)])>0.01)body=hd+turn*0.42;
  const st=clamp(angD(car.yaw,body)*2.6,-1,1);const thr=car.v<vt?1:car.v<vt+4?0.3:0;const brk=car.v>vt+4?1:0;
  return{x:st,y:brk?1:thr>0?-thr:0,jumpHeld:want&&Math.abs(Wd.TK[tIdx(car.s+8)])>0.01&&car.drift===0&&car.v>26,auto:true}}
function latOf(car){const Wd=WORLD,k=tIdx(car.s),h=Wd.TH[k];return(car.x-Wd.TX[k])*Math.cos(h)-(car.z-Wd.TZ[k])*Math.sin(h)}
function progress(car){return car.lap*WORLD.LEN+pmod(car.s-WORLD.S0,WORLD.LEN)}
const GEARS=[0,14,26,38,50,63,1e9];
function drive(g,car,pad,dt){const Wd=WORLD;const thr=pad.y<0?-pad.y:0,brk=pad.y>0?pad.y:0;const hb=!!pad.jumpHeld;
  car.steer+=(clamp(pad.x,-1,1)-car.steer)*0.18;const v=car.v;
  // ground: on the road, the gravel, the grass
  const lat=latOf(car);const off=Math.abs(lat)>5.2;car.off=off?car.off+1:0;
  const vmax=(off?42:84)*(car.i===0?1:car.skill);
  const acc=thr*(15*Math.pow(Math.max(0,1-v/vmax),0.6)+(v<14?4:0))-brk*(v>0.5?24:0)-0.004*v*v*0.6-(off?0.05*v:0);
  if(car.air===0)car.v=Math.max(0,v+acc*dt);
  // steering and drifting: the body turns, the velocity follows it — slowly while sliding
  if(hb&&v>14&&Math.abs(car.steer)>0.25&&car.air===0)car.drift=1;
  const yr=car.steer*Math.min(1.75,v*0.075)*(car.drift?1.45:1)*(car.air?0.15:1);car.yaw+=yr*dt;
  if(car.drift&&hb)car.yaw+=car.steer*0.012;
  const slip=angD(car.vh,car.yaw);const grip=car.drift?1.3:11;if(!car.air)car.vh+=slip*Math.min(1,grip*dt);
  if(car.drift){car.v*=1-Math.abs(slip)*0.0025;if(Math.abs(slip)<0.1&&!hb){car.drift++;if(car.drift>8)car.drift=0}else car.drift=1}
  car.slip=angD(car.vh,car.yaw);
  car.x+=Math.sin(car.vh)*car.v*dt;car.z+=Math.cos(car.vh)*car.v*dt;
  car.x=clamp(car.x,-500,500);car.z=clamp(car.z,-500,500);
  // vertical: stick to the ground, or fly off a crest
  const gy=Wd.at(Wd.HT,car.x,car.z);car.gy=Math.max(gy,0);const G=13;
  if(car.air>0){car.vy-=G*dt;car.y+=car.vy*dt;car.air++;car.airMax=Math.max(car.airMax,car.y-car.gy);if(car.y<=car.gy){const imp=-car.vy;car.y=car.gy;car.air=0;car.vy=0;car.land=Math.min(1,imp/9);if(car.i===0&&imp>4){g.shake=Math.min(1,imp/12);sfx('thud',0.7,0.7);dust(g,car,16)}}}
  else{const nvy=(car.gy-car.y)/dt;if(nvy<car.vy-G*dt*1.6&&car.v>20){car.air=1;car.airMax=0;car.vy=Math.min(car.vy,3.2)-G*dt;car.y+=car.vy*dt;car.airT=0}else{car.vy=nvy;car.y=car.gy}}
  // body: pitch with the slope (and nose-down in the air), roll against the turn, bounce on the grass
  const ah=Wd.at(Wd.HT,car.x+Math.sin(car.yaw)*2,car.z+Math.cos(car.yaw)*2),bh=Wd.at(Wd.HT,car.x-Math.sin(car.yaw)*2,car.z-Math.cos(car.yaw)*2);
  const tp=car.air?car.pitch-0.004:Math.atan2(ah-bh,4)+(car.land||0)*-0.05+brk*0.025-thr*0.012;car.pitch+=(tp-car.pitch)*(car.air?0.05:0.3);
  car.roll+=(clamp(-yr*car.v*0.0045,-0.07,0.07)-car.roll)*0.15;car.land=(car.land||0)*0.9;
  car.bob=off&&!car.air?Math.sin(g.t*1.3+car.i)*0.03:0;
  car.spin+=car.v*dt/WR;car.brake=brk>0.3;
  // track position: walk along the samples
  let best=car.s,bd=1e9;for(let d=-30;d<=30;d+=1){const k=tIdx(car.s+d);const dd=(Wd.TX[k]-car.x)**2+(Wd.TZ[k]-car.z)**2;if(dd<bd){bd=dd;best=car.s+d}}
  const prev=pmod(car.s-Wd.S0,Wd.LEN);car.s=pmod(best,Wd.LEN);const now=pmod(car.s-Wd.S0,Wd.LEN);if(prev>Wd.LEN-60&&now<60)car.lap++;if(prev<60&&now>Wd.LEN-60)car.lap--;
  // gears: a shift is a dip and a crackle from the pipes
  let ge=1;while(ge<6&&car.v>GEARS[ge])ge++;if(ge!==car.gear){if(ge>car.gear){car.pop=8;if(car.i===0)sfx('blip',0.25,0.6+ge*0.08)}car.gear=ge}car.pop=Math.max(0,car.pop-1);
  car.rpm=clamp((car.v-GEARS[ge-1])/(Math.min(GEARS[ge],95)-GEARS[ge-1]),0,1)*0.68+0.3;
  // smoke from the rear tyres when sliding or spinning up
  if((car.drift&&Math.abs(car.slip)>0.15||car.v<9&&thr>0.5&&g.mode==='race'&&hash(g.t,car.i,3)<0.3)&&car.air===0&&g.t%2===0){const M=carMat(car.yaw,0,0);for(const sd of[-1,1]){const x=car.x+M[0]*sd*0.9+M[2]*-1.4,z=car.z+M[6]*sd*0.9+M[8]*-1.4;g.smoke.push({x,z,y:car.gy+0.3,vx:(hash(g.t,sd,1)-0.5)*0.03+Math.sin(car.vh)*car.v*0.004,vz:(hash(g.t,sd,2)-0.5)*0.03+Math.cos(car.vh)*car.v*0.004,vy:0.02,r:0.4,t:0,life:60+hash(g.t,sd,3)*40})}}
  if(car.off>4&&car.v>12&&g.t%6===0&&Math.abs(latOf(car))>6.6)dust(g,car,1)}
function dust(g,car,n){for(let i=0;i<n;i++)g.smoke.push({x:car.x+(hash(g.t,i,4)-0.5)*2,z:car.z+(hash(g.t,i,5)-0.5)*2,y:car.gy+0.2,vx:(hash(g.t,i,6)-0.5)*0.08,vz:(hash(g.t,i,7)-0.5)*0.08,vy:0.03,r:0.7,t:0,life:50,dust:1})}
// ---------------- the race ----------------
function init(g){const Wd=build();buildSky();g.cars=[];for(let i=0;i<6;i++){const row=5-i;g.cars.push(mkCar(i,Wd.S0-14-row*9,(i%2?2.3:-2.3)))}g.me=g.cars[0];
  g.mode='intro';g.mt=0;g.smoke=[];g.leaves=[];g.conf=[];g.pop=[];g.chain={pts:0,mult:1,t:0,name:'',nt:0,sub:''};g.banked=0;g.bankT=0;g.shake=0;g.view=g.view||'auto';g.shot='intro';g.time=0;g.trap=0;g.trapV=0;g.jumpDone=false;g.cine=0;g.finT=[];g.cam={x:0,z:0,h:3,yaw:0,F:350,HZ:100};g.ts=1;
  for(const c of g.cars){c.yaw=c.vh=Wd.TH[tIdx(c.s)];c.lap=-1}direct(g)}
function tick(g,pad){g.mt++;const Wd=WORLD;const dt=1/60;
  if(g.mode==='intro'&&g.mt>250){g.mode='count';g.mt=0}
  if(g.mode==='count'){if(g.mt%60===1&&g.mt<180)sfx('blip',0.5,0.8);if(g.mt===180){sfx('power',0.5,1.2);g.mode='race';g.mt=0}}
  const racing=g.mode==='race'||g.mode==='finish';
  for(const car of g.cars){let pd={x:0,y:0};if(racing){pd=car===g.me&&!pad.auto&&g.mode==='race'?pad:aiPad(g,car);if(car.fin)pd={x:aiPad(g,car).x,y:car.v>14?0.4:0}}else if(g.mode==='count'&&g.mt>120)pd={x:0,y:0,jumpHeld:false};drive(g,car,pd,dt)}
  g.auto=!!pad.auto;
  // cars lean on each other rather than pass through
  for(let i=0;i<g.cars.length;i++)for(let j=i+1;j<g.cars.length;j++){const a=g.cars[i],b=g.cars[j];const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<2.4&&d>0.01){const k=(2.4-d)/2/d;a.x-=dx*k;a.z-=dz*k;b.x+=dx*k;b.z+=dz*k}}
  if(racing){g.time+=dt;skills(g)}
  // finishing order
  for(const c of g.cars)if(!c.fin&&c.lap>=1&&g.mode!=='intro'){c.fin=g.finT.length+1;g.finT.push([c.i,g.time]);if(c===g.me){g.mode='finish';g.mt=0;sfx('power',0.6,1);for(let i=0;i<160;i++)g.conf.push({x:hash(i,1,9)*W,y:-hash(i,2,9)*H*0.8,vx:(hash(i,3,9)-0.5)*0.6,vy:0.6+hash(i,4,9)*0.9,c:SHIRT[i%7],ph:hash(i,5,9)*6})}}
  if(g.mode==='finish'&&g.mt>560){const v=g.view;init(g);g.view=v;return}
  // the speed trap
  const me=g.me;const ds=pmod(me.s-Wd.STS,Wd.LEN);if(ds<2&&g.trap===0&&racing){g.trap=150;g.trapV=Math.round(me.v*3.6);addSkill(g,'测速照相',g.trapV*10,g.trapV+' km/h');sfx('coin',0.5,1.4)}if(g.trap>0)g.trap--;
  // smoke, leaves, confetti
  for(const p of g.smoke){p.t++;p.x+=p.vx;p.z+=p.vz;p.y+=p.vy;p.vx*=0.97;p.vz*=0.97;p.r+=p.dust?0.025:0.03}g.smoke=g.smoke.filter(p=>p.t<p.life);
  if(g.t%3===0&&g.leaves.length<40)g.leaves.push({x:W+5,y:hash(g.t,1,11)*H*0.8,vx:-1.2-hash(g.t,2,11)*2.5,vy:0.3+hash(g.t,3,11)*0.6,ph:hash(g.t,4,11)*6,c:[0xe8742a,0xf0a83a,0xc8402a,0xf8c850][g.t%4],t:0});
  for(const l of g.leaves){l.t++;l.x+=l.vx-me.v*0.02;l.y+=l.vy+Math.sin(l.t*0.1+l.ph)*0.4}g.leaves=g.leaves.filter(l=>l.x>-10&&l.y<H+5);
  for(const c of g.conf){c.x+=c.vx+Math.sin(c.ph+g.t*0.07)*0.4;c.y+=c.vy}
  g.shake*=0.9;if(g.chain.nt>0)g.chain.nt--;if(g.bankT>0)g.bankT--;
  direct(g)}
// the skill chain: drifts, air, near misses, the trap — banked after two quiet seconds
function addSkill(g,name,pts,sub){const ch=g.chain;ch.pts+=pts*ch.mult;ch.name=name;ch.sub=sub||'';ch.nt=70;ch.t=120;ch.cnt=(ch.cnt||0)+1;if(ch.cnt%3===0)ch.mult=Math.min(9,ch.mult+1);g.pop.push({name,t:0})}
function skills(g){const me=g.me,ch=g.chain;
  if(me.drift&&Math.abs(me.slip)>0.2&&me.v>15&&me.air===0){me.dpts=(me.dpts||0)+Math.abs(me.slip)*me.v*0.9;ch.t=120;ch.live='漂移';ch.livePts=Math.round(me.dpts)}
  else if(me.dpts>0){addSkill(g,me.dpts>1600?'超级漂移':'漂移',Math.round(me.dpts),'');me.dpts=0;ch.live=''}
  if(me.air>0)me.airT++;else if(me.airT>20){addSkill(g,me.airT>70?'飞跃':'腾空',Math.round(me.airT*18),(me.airMax).toFixed(1)+' m 高');me.airT=0}else me.airT=0;
  for(const o of g.cars){if(o===me)continue;const d=Math.hypot(o.x-me.x,o.z-me.z);if(d<3.4&&me.v>o.v+4&&!o.nm){o.nm=90;addSkill(g,'擦肩而过',400,o.name);sfx('whoosh',0.5,1.4)}if(o.nm>0)o.nm--}
  if(ch.t>0){ch.t--;if(ch.t===0&&ch.pts>0){g.banked+=Math.round(ch.pts);g.bankV=Math.round(ch.pts);g.bankT=110;ch.pts=0;ch.mult=1;ch.cnt=0;sfx('coin',0.45,1)}}}
// ---------------- the camera director ----------------
const VIEWS=['auto','chase','far','bumper'];const VNAME={auto:'自动导演',chase:'近追尾',far:'远追尾',bumper:'保险杠',intro:'航拍',jump:'路边机位',orbit:'环绕'};
function direct(g){const Wd=WORLD,me=g.me;let c=g.cam;const v=g.view;
  let shot=v==='auto'?'chase':v;if(g.mode==='intro')shot='intro';if(g.mode==='finish'&&g.mt>40)shot='orbit';
  if(v==='auto'&&g.mode==='race'){// the crest: cut to a camera by the landing, slow time while the car flies
    if(me.air>6&&!g.jumpDone&&me.v>30){g.jumpDone=true;g.cine=150;const k=tIdx(me.s+me.v*0.9);const h=Wd.TH[k];g.jcam={x:Wd.TX[k]+Math.cos(h)*-12,z:Wd.TZ[k]-Math.sin(h)*-12,y:Wd.TY[k]+3.5}}
    if(g.cine>0){g.cine--;shot='jump';g.ts=me.air>0?0.38:Math.min(1,g.ts+0.03)}else g.ts=1}else g.ts=1;
  if(shot!==g.shot){g.shot=shot;g.snap=true}
  const dy=me.yaw*0.4+me.vh*0.6;let tgt;
  if(shot==='intro'){const u=g.mt/250;const a=-2.4+u*1.3;const k=tIdx(Wd.S0-20);const cx=Wd.TX[k],cz=Wd.TZ[k];const r=60-u*36;tgt={x:cx+Math.sin(a)*r,z:cz+Math.cos(a)*r,h:Wd.TY[k]+26-u*20,F:330,HZ:70+u*26};tgt.yaw=Math.atan2(cx-tgt.x,cz-tgt.z)+0.25-u*0.25;g.snap=true}
  else if(shot==='orbit'){const a=g.mt*0.006+me.yaw+2.4;tgt={x:me.x+Math.sin(a)*8,z:me.z+Math.cos(a)*8,h:me.y+1.6,F:330,HZ:122,yaw:a+Math.PI}}
  else if(shot==='jump'){const j=g.jcam;tgt={x:j.x,z:j.z,h:j.y,F:300,HZ:120+(me.y-j.y)*12};tgt.yaw=Math.atan2(me.x-j.x,me.z-j.z);g.snap=true}
  else{const far=shot==='far',bump=shot==='bumper';const d=bump?-1.7:far?10.5:6.4+me.v*0.012,hh=bump?0.62:far?3.6:1.95;
    const cy=c&&!g.snap?c.yaw+angD(c.yaw,dy)*(bump?0.5:0.11):dy;const x=me.x-Math.sin(cy)*d,z=me.z-Math.cos(cy)*d;let h=me.y+hh+(bump?0:me.pitch*-1.5);
    const gh=Wd.at(Wd.HT,x,z);h=Math.max(h,gh+0.9);tgt={x,z,h,yaw:cy,F:bump?280:far?330:350-me.v*0.55,HZ:bump?132:far?104:100+me.pitch*40}}
  if(!c||g.snap){g.cam=Object.assign({},tgt);g.snap=false}else{const k=shot==='orbit'?0.06:0.5;c.x+=(tgt.x-c.x)*k;c.z+=(tgt.z-c.z)*k;c.h+=(tgt.h-c.h)*(shot==='chase'||shot==='far'?0.25:k);c.yaw=tgt.yaw;c.F+=(tgt.F-c.F)*0.1;c.HZ+=(tgt.HZ-c.HZ)*0.2}}
// ---------------- drawing ----------------
const PRF={};window.__HZP=()=>{const o={};for(const k in PRF)o[k]=+(+PRF[k]).toFixed(1);for(const k in PRF)PRF[k]=0;return o};
function draw(g){const Wd=WORLD;NX.setBG(null);NX.begin();NX.screen();NX.gain(0);const t=S.frame;
  S.lq=0;S.haze=0;S.vig=0.38;S.bloomThr=0.2;S.post=null;S.amb=[[1,1,1],[1,1,1]];S.grade={lift:[0.01,0.006,0.02],gain:[1.03,1.0,0.97],sat:1.06};
  const sh=g.shake*g.shake;const c=g.cam;setCam(Object.assign({},c,{HZ:c.HZ+Math.sin(t*2.9)*sh*3,yaw:c.yaw+Math.sin(t*2.3)*sh*0.006}));
  let _t=performance.now();renderWorld(t);PRF.world=performance.now()-_t;_t=performance.now();
  // everything standing up, sorted far to near
  const it=[];const fw=[HC.s,HC.c];const inView=(x,z,m)=>{const zc=camZ(x,z);if(zc<0.5||zc>700)return 0;const xc=(x-HC.x)*HC.c-(z-HC.z)*HC.s;if(Math.abs(xc)>zc*(W/2/HC.F)+(m||0))return 0;return zc};
  const sR=SUN[0]*HC.c-SUN[2]*HC.s,sF=SUN[0]*HC.s+SUN[2]*HC.c;const back=sF>0.55,flip=sR>0;
  for(const tr of Wd.TREES){const zc=inView(tr.x,tr.z,tr.h);if(!zc||zc>380||zc<5)continue;it.push({z:zc,k:'tree',f:()=>{const p=proj(tr.x,tr.y,tr.z);if(!p)return;const hp=sizeQ(HC.F*tr.h/zc);if(hp<3||hp>330)return;const sp=paintTree(tr.kind,tr.v,hp,back);blitSpr(sp,p[0],p[1]+Math.max(1,hp*0.02),zc,flip,fogK(zc))}})}
  for(const o of Wd.PROPS){const zc=inView(o.x,o.z,o.k==='bal'?40:o.k==='turb'?30:8);if(!zc)continue;if(o.k==='fan'&&zc>160||o.k==='post'&&zc>140||o.k==='bar'&&zc>260)continue;it.push({z:zc,k:o.k,f:()=>drawProp(g,o,zc,t)})}
  // festival arch over the start line
  {const k=tIdx(Wd.S0);const zc=inView(Wd.TX[k],Wd.TZ[k],20);if(zc)it.push({z:zc,f:()=>drawArch(g,k,t)})}
  for(const car of g.cars){const zc=camZ(car.x,car.z);if(zc<0.5&&!(car===g.me&&g.shot==='bumper'))continue;if(car===g.me&&g.shot==='bumper')continue;it.push({z:zc,k:'car',f:()=>{carShadow(car);paintCarAll(car);blitCar(car===g.me?0:fogK(zc),FOGL[W>>1])}})}
  for(const p of g.smoke){const zc=camZ(p.x,p.z);if(zc<1)continue;it.push({z:zc,f:()=>drawPuff(p,zc)})}
  PRF.n=it.length;it.sort((a,b)=>b.z-a.z);for(const o of it){const t1=performance.now();o.f();const k=o.k||'x';PRF[k]=(PRF[k]||0)+performance.now()-t1}PRF.items=performance.now()-_t;
  // leaves blowing across, in the light
  if(g.mode==='race'||g.mode==='intro')for(const l of g.leaves){const x=Math.round(l.x),y=Math.round(l.y);const fl=Math.sin(l.t*0.3+l.ph)>0;NX.px(x,y,l.c);if(fl)NX.px(x+1,y,mix(l.c,0x000000,0.3));else NX.px(x,y+1,mix(l.c,0xfff0c0,0.3))}
  if(g.mode==='finish')for(const cf of g.conf){if(cf.y<0||cf.y>=H)continue;const fl=Math.sin(cf.ph+t*0.2);NX.px(Math.round(cf.x),Math.round(cf.y),cf.c);if(fl>0)NX.px(Math.round(cf.x)+1,Math.round(cf.y),mix(cf.c,0xffffff,0.3))}
  // the sun's glare when the camera looks into it
  {const p=proj(HC.x+SUN[0]*600,HC.h+SUN[1]*600,HC.z+SUN[2]*600);if(p&&p[0]>-60&&p[0]<W+60&&p[1]>-40){const y=Math.round(p[1]);if(y>=0&&y<H&&ZB[y*W+clamp(Math.round(p[0]),0,W-1)]>1e8)NX.glow(p[0],p[1],60,0xffc070,0.35)}}
  hud(g);
  NX.gain(255)}
function drawPuff(p,zc){if(zc<3.5)return;const pp=proj(p.x,p.y,p.z);if(!pp)return;const u=p.t/p.life;const r=Math.min(16,HC.F*p.r/zc);if(r<0.6)return;const a=(1-u)*(1-u)*(p.dust?0.4:0.42)*Math.min(1,(zc-3.5)/4);const c1=p.dust?0x9a7a60:0xd8ccd0,c2=p.dust?0x6a5048:0x9a90a8;
  const cx=pp[0],cy=pp[1]-r*0.6;for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){if(x<0||y<0||x>=W||y>=H)continue;const dx=(x+0.5-cx)/r,dy=(y+0.5-cy)/r,d=dx*dx+dy*dy;if(d>1)continue;const q=y*W+x;if(zc>ZB[q]+1)continue;
    const lit=dx*-0.6+dy*-0.5>0.1;S.alb[q]=mix(S.alb[q],lit?c1:c2,a*(d>0.7?0.6:1))}}
function drawProp(g,o,zc,t){const F=HC.F;const fk=fogK(zc);
  if(o.k==='bar'){// a concrete barrier painted in the festival's stripes
    const a=proj(o.a[0],o.a[2],o.a[1]),b=proj(o.b[0],o.b[2],o.b[1]);if(!a||!b)return;const ha=F*1.05/a[2],hb=F*1.05/b[2];const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]);if(x1-x0>W)return;
    for(let x=Math.max(0,Math.floor(x0));x<=Math.min(W-1,Math.ceil(x1));x++){const u=(x-a[0])/((b[0]-a[0])||1);if(u<0||u>1)continue;const yb=a[1]+(b[1]-a[1])*u,hh=ha+(hb-ha)*u;const zz=a[2]+(b[2]-a[2])*u;
      for(let y=Math.max(0,Math.floor(yb-hh));y<=Math.min(H-1,yb);y++){const p=y*W+x;if(zz>ZB[p])continue;const v=(yb-y)/hh;let c=v>0.86?0xf0e8e0:v>0.4?((o.i+Math.floor(u*2))%2?0xe8327a:0xf2efe8):0x8a8494;if(v<0.12)c=0x2a2430;S.alb[p]=fk?mix(c,FOGL[x],fk):c;S.em[p]=0;S.lk[p]=0;ZB[p]=zz}}return}
  if(o.k==='flag'){// a feather flag on a bent pole, rippling
    const pb=proj(o.x,o.y,o.z);if(!pb)return;const hh=F*6/zc,ww=F*1.1/zc;if(hh<3)return;const cols=[[0xe8327a,0xb01c58],[0x2ec4d8,0x1a7e9a],[0xf6a232,0xc06a1a],[0xf2f0ec,0xb8b0c0]][o.c];
    const x0=pb[0],y0=pb[1];for(let y=0;y<hh;y++){const v=y/hh;const yy=Math.round(y0-y);if(yy<0||yy>=H)continue;const bend=v*v*ww*0.35;const px=Math.round(x0+bend);if(px>=0&&px<W&&zc<ZB[yy*W+px]){S.alb[yy*W+px]=0x2a2430;ZB[yy*W+px]=zc}
      if(v>0.3){const fw=ww*(0.55+0.45*Math.sin((v-0.3)/0.7*Math.PI*0.9));for(let i=1;i<=fw;i++){const xx=Math.round(px+i);if(xx<0||xx>=W)continue;const q=yy*W+xx;if(zc>ZB[q])continue;const wv=Math.sin(i*0.5-t*0.15+o.ph+v*4);S.alb[q]=fk?mix(wv>0.2?cols[0]:cols[1],FOGL[xx],fk):(wv>0.2?cols[0]:cols[1]);S.em[q]=0;S.lk[q]=0;ZB[q]=zc}}}return}
  if(o.k==='fan'){const p=proj(o.x,o.y,o.z);if(!p)return;const hp=sizeQ(F*1.72/zc);if(hp<2)return;const arm=g.mode==='count'||g.mode==='finish'?((t>>3)+o.v)%3!==0:((t+o.ph*10)>>4)%5===0;blitSpr(paintFan(o.v,hp,arm),p[0],p[1],zc,o.v%2===1,fk);return}
  if(o.k==='post'){const p=proj(o.x,o.y,o.z);if(!p)return;const hh=F*1.15/zc,ww=Math.max(1,Math.round(F*0.12/zc));for(let y=0;y<hh;y++){const yy=Math.round(p[1]-y);for(let i=0;i<ww;i++){const xx=Math.round(p[0])+i;if(xx<0||xx>=W||yy<0||yy>=H)continue;const q=yy*W+xx;if(zc>ZB[q])continue;S.alb[q]=fk?mix(i===0?0x7a5a44:0x3a2a26,FOGL[xx],fk):(i===0?0x7a5a44:0x3a2a26);ZB[q]=zc}}
    // rails to the next post
    const k2=o.nx;if(k2){const p2=proj(k2.x,k2.y,k2.z);if(p2)for(const hv of[0.55,0.95]){const ya=p[1]-F*hv/zc,yb2=p2[1]-F*hv/p2[2];const n=Math.ceil(Math.abs(p2[0]-p[0]));for(let i=0;i<=n;i++){const u=i/Math.max(1,n);const xx=Math.round(p[0]+(p2[0]-p[0])*u),yy=Math.round(ya+(yb2-ya)*u);if(xx<0||xx>=W||yy<0||yy>=H)continue;const zz=zc+(p2[2]-zc)*u;const q=yy*W+xx;if(zz>ZB[q])continue;S.alb[q]=fk?mix(0x6a4a3a,FOGL[xx],fk):0x6a4a3a;ZB[q]=zz}}}return}
  if(o.k==='bal'){const y=o.y+Math.sin(t*0.01+o.ph)*3;const p=proj(o.x+Math.sin(t*0.002+o.ph)*20,y,o.z);if(!p)return;const hp=sizeQ(F*26/zc);if(hp<3)return;blitSpr(paintBalloon(o.v,hp),p[0],p[1],zc,false,fogK(zc)*0.8);if(hp>8&&(t+Math.round(o.ph*40))%90<12)NX.glow(p[0],p[1]-hp*0.12,hp*0.15,0xffa040,0.6);return}
  if(o.k==='turb'){const hub=proj(o.x,o.y+46,o.z);const base=proj(o.x,o.y,o.z);if(!hub||!base)return;const col=0xd8d0dc;const cf=mix(col,FOGL[clamp(Math.round(hub[0]),0,W-1)],fk);
    const line=(x0,y0,x1,y1,z)=>{const n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)));for(let i=0;i<=n;i++){const u=i/Math.max(1,n);const x=Math.round(x0+(x1-x0)*u),y=Math.round(y0+(y1-y0)*u);if(x<0||y<0||x>=W||y>=H)continue;const q=y*W+x;if(z>ZB[q])continue;S.alb[q]=cf;S.em[q]=0;S.lk[q]=0}};
    line(base[0],base[1],hub[0],hub[1],zc);const ax=-SUNH[1],az=SUNH[0];for(let b=0;b<3;b++){const an=t*0.02+o.ph+b*TAU/3;const tip=proj(o.x+ax*Math.cos(an)*22,o.y+46+Math.sin(an)*22,o.z+az*Math.cos(an)*22);if(tip)line(hub[0],hub[1],tip[0],tip[1],zc)}return}
  if(o.k==='trap'){const p=proj(o.x,o.y,o.z);if(!p)return;const hh=F*4.5/zc,ww=Math.max(1,F*0.14/zc);for(let y=0;y<hh;y++)for(let i=0;i<ww;i++){const xx=Math.round(p[0]+i),yy=Math.round(p[1]-y);if(xx<0||xx>=W||yy<0||yy>=H)continue;const q=yy*W+xx;if(zc>ZB[q])continue;S.alb[q]=0x3a3a46}
    const bw=F*0.7/zc,bh=F*0.45/zc;for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){const xx=Math.round(p[0]-bw*0.3+x),yy=Math.round(p[1]-hh-y);if(xx<0||xx>=W||yy<0||yy>=H)continue;S.alb[yy*W+xx]=y<1?0xf6a232:0x1a1a22}
    if(g.trap>140)NX.glow(p[0],p[1]-hh,40,0xffffff,1.6)}}
// the festival arch: two lit pylons and a banner across the road
const BANC=new Map();function banner(pw){const w=clamp(Math.round(pw/4)*4,24,400);let B=BANC.get(w);if(B)return B;const h=Math.round(w*0.22);const m=new Uint8Array(w*h);
  const s1='天际线嘉年华',s2='SKYLINE FESTIVAL';const z1=Math.max(6,Math.round(h*0.56)),z2=Math.max(5,Math.round(h*0.22));
  if(w>=60){let x=Math.round((w-NX.measure(s1,z1,true))/2);for(const ch of s1){const G=NX.glyph(ch,z1,true);for(let i=0;i<G.px.length;i+=2){const X=x+G.px[i],Y=Math.round(h*0.05)+G.px[i+1];if(X>=0&&X<w&&Y<h)m[Y*w+X]=1}x+=G.w}}
  if(w>=140){const sp=Math.round(z2*0.2);let x=Math.round((w-NX.measure(s2,z2,true)-sp*15)/2);for(const ch of s2){const G=NX.glyph(ch,z2,true);for(let i=0;i<G.px.length;i+=2){const X=x+G.px[i],Y=Math.round(h*0.7)+G.px[i+1];if(X>=0&&X<w&&Y<h)m[Y*w+X]=2}x+=G.w+sp}}
  B={w,h,m};BANC.set(w,B);return B}
function drawArch(g,k,t){const Wd=WORLD,h=Wd.TH[k];const rx=Math.cos(h),rz=-Math.sin(h);const x0=Wd.TX[k],z0=Wd.TZ[k],y0=Wd.TY[k];
  // pylons: dark truss with pink light strips
  for(const sd of[-1,1]){const px=x0+rx*sd*7.6,pz=z0+rz*sd*7.6;const b=proj(px,y0,pz),tp=proj(px,y0+10.5,pz);if(!b||!tp)continue;const ww=Math.max(2,HC.F*1.1/b[2]);
    for(let y=Math.floor(tp[1]);y<=b[1];y++)for(let x=Math.floor(b[0]-ww/2);x<b[0]+ww/2;x++){if(x<0||y<0||x>=W||y>=H)continue;const q=y*W+x;if(b[2]>ZB[q])continue;const u=(x-(b[0]-ww/2))/ww,v=(y-tp[1])/(b[1]-tp[1]);
      const strip=Math.abs(u-0.5)<0.12;const cr=(Math.abs((v*10+u)%1-0.5)<0.08||Math.abs((v*10-u)%1-0.5)<0.08);let c=strip?0xff4a9a:cr?0x3a3446:u<0.12||u>0.88?0x2a2634:0x14121c;if(strip){S.em[q]=170}else S.em[q]=0;S.alb[q]=c;S.lk[q]=0;ZB[q]=b[2]}}
  // banner between them
  const a=proj(x0-rx*7.6,y0+10.4,z0-rz*7.6),b=proj(x0+rx*7.6,y0+10.4,z0+rz*7.6),a2=proj(x0-rx*7.6,y0+7.8,z0-rz*7.6),b2=proj(x0+rx*7.6,y0+7.8,z0+rz*7.6);if(!a||!b||!a2||!b2)return;
  const xa=Math.min(a[0],b[0]),xb=Math.max(a[0],b[0]);const flipb=a[0]>b[0];const B=banner(xb-xa);
  for(let x=Math.max(0,Math.floor(xa));x<=Math.min(W-1,Math.ceil(xb));x++){let u=(x-a[0])/((b[0]-a[0])||1);if(u<0||u>1)continue;const yt=a[1]+(b[1]-a[1])*u,yb=a2[1]+(b2[1]-a2[1])*u,zz=a[2]+(b[2]-a[2])*u;const uu=flipb?1-u:u;
    for(let y=Math.max(0,Math.floor(yt));y<=Math.min(H-1,yb);y++){const q=y*W+x;if(zz>ZB[q])continue;const v=(y-yt)/((yb-yt)||1);const mx=Math.floor(uu*B.w),my=Math.floor(v*B.h);const mm=B.m[clamp(my,0,B.h-1)*B.w+clamp(mx,0,B.w-1)];
      let c=v<0.06||v>0.94?0x14121c:mix(0xe8327a,0xf6a232,Math.floor(uu*6)/6);if(mm===1)c=0xfff8f0;else if(mm===2)c=0x2a1630;S.alb[q]=c;S.em[q]=mm===1?60:v<0.06||v>0.94?0:30;S.lk[q]=0;ZB[q]=zz}}}
// ---------------- the HUD, in the festival's pink ----------------
function hud(g){const me=g.me,Wd=WORLD,t=S.frame;const HP=0xff3e8e,HO=0xffa040;
  const cine=g.shot==='intro'||g.shot==='jump'||g.shot==='orbit';
  if(g.mode==='intro'){const a=Math.min(1,Math.max(0,(g.mt-30)/30))*Math.min(1,(250-g.mt)/30);if(a>0){recta(0,186,W,48,0x000000,0.45*a);rect(0,186,Math.round(W*a),2,HP);text('天际线嘉年华',W/2,192,mix(0x000000,0xffffff,a),{size:20,align:'c',bold:true});text('落日环线 · 6 辆车 · 1 圈 · 2.4 公里',W/2,216,mix(0x000000,0xffc8de,a),{size:10,align:'c'})}}
  if(g.mode==='count'){const n=3-Math.floor(g.mt/60);const s=n>0?String(n):'出发';const u=(g.mt%60)/60;text(s,W/2,96-u*6,n>0?0xffffff:HO,{size:n>0?36:30,align:'c',bold:true,ink:0x200818})}
  if(g.mode==='race'&&g.mt<50){text('出发！',W/2,92,HO,{size:30,align:'c',bold:true,ink:0x200818})}
  if(g.mode==='intro')return;
  if(!cine||g.shot==='jump'){
    // position and time
    const order=g.cars.slice().sort((a,b)=>(b.fin?1e6-b.fin:progress(b))-(a.fin?1e6-a.fin:progress(a)));const pos=order.indexOf(me)+1;
    recta(10,10,86,38,0x000000,0.42);rect(10,10,3,38,HP);text(String(pos),18,8,0xffffff,{size:30,bold:true});text('/6',40,24,0xffc8de,{size:12,bold:true});text('名次',62,14,0xd8c8d8,{size:10});
    const tm=g.time,mm=Math.floor(tm/60),ss=(tm%60).toFixed(2).padStart(5,'0');text(mm+':'+ss,18,50,0xffffff,{size:10,shadow:0x000000});
    // progress strip along the top
    recta(W/2-90,10,180,5,0x000000,0.45);const pr=clamp(progress(me)/Wd.LEN,0,1);rect(W/2-90,11,Math.round(180*pr),3,HP);for(const o of g.cars){if(o===me)continue;const px=Math.round(W/2-90+180*clamp(progress(o)/Wd.LEN,0,1));rect(px,9,1,7,0xffffff)}
    // speedometer
    const cx=W-44,cy=H-40,R=31;NX.disc(cx,cy,R+4,0x000000);recta(cx-R-4,cy-R-4,1,1,0,0);for(let a=0;a<=40;a++){const an=Math.PI*0.75+a/40*Math.PI*1.5;const red=a>32;const inner=a%5===0?R-6:R-3;for(let r=inner;r<=R;r++)NX.px(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),red?0xff3050:a%5===0?0xffffff:0x8a8098)}
    const an=Math.PI*0.75+me.rpm*Math.PI*1.5;for(let r=0;r<R-4;r++)NX.px(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),HP,120);
    text(String(me.gear),cx,cy-16,0xffffff,{size:20,align:'c',bold:true});text(String(Math.round(me.v*3.6)),cx,cy+6,0xffffff,{size:12,align:'c',bold:true});NX.tiny('KMH',cx-5,cy+21,0x9a90a8);
    // minimap: north turns with the car
    const mx=42,my=H-42,MR=32;NX.disc(mx,my,MR+2,0x1a1622);const ca=Math.cos(-me.yaw),sa=Math.sin(-me.yaw);const sc=0.085;
    for(let s=0;s<Wd.LEN;s+=3){const dx=Wd.TX[s]-me.x,dz=Wd.TZ[s]-me.z;const rx=(dx*ca+dz*sa)*sc,rz=(-dx*sa+dz*ca)*sc;if(rx*rx+rz*rz>MR*MR)continue;NX.px(Math.round(mx+rx),Math.round(my-rz),HP);NX.px(Math.round(mx+rx),Math.round(my-rz+1),0x8a1a48)}
    for(const o of g.cars){if(o===me)continue;const dx=o.x-me.x,dz=o.z-me.z;const rx=(dx*ca+dz*sa)*sc,rz=(-dx*sa+dz*ca)*sc;if(rx*rx+rz*rz>MR*MR)continue;rect(Math.round(mx+rx)-1,Math.round(my-rz)-1,3,3,0xffffff)}
    rect(mx-1,my-3,3,1,HO);rect(mx-2,my-2,5,1,HO);rect(mx-2,my-1,5,2,HO);NX.ring(mx,my,MR+2,1,0x3a3448)}
  // the skill chain
  const ch=g.chain;if(ch.pts>0||ch.live){const live=ch.live?'  +'+ch.livePts:'';recta(W/2-80,58,160,30,0x000000,0.38);rect(W/2-80,58,160,1,HP);text((ch.live||ch.name)+(ch.pts>0?live:''),W/2,60,ch.live?HO:0xffffff,{size:11,align:'c',bold:true});
    text(Math.round(ch.pts||ch.livePts||0).toLocaleString('en')+'  ×'+ch.mult,W/2,74,0xffc8de,{size:10,align:'c'});rect(W/2-80,87,Math.round(160*ch.t/120),1,HO)}
  if(ch.nt>40&&ch.sub)text(ch.sub,W/2,92,0xffffff,{size:10,align:'c',shadow:0x000000});
  if(g.bankT>0){const a=Math.min(1,g.bankT/20);text('技巧分 +'+g.bankV.toLocaleString('en'),W/2,104-(110-g.bankT)*0.1,mix(0x000000,HO,a),{size:12,align:'c',bold:true,ink:0x200818})}
  if(g.trap>60){const u=(150-g.trap)/20;recta(W-150,60,140,26,0x000000,0.5);rect(W-150,60,2,26,HO);text('测速照相',W-142,62,0xffc8de,{size:10});text(g.trapV+' km/h',W-16,62,0xffffff,{size:16,align:'r',bold:true})}
  if(g.mode==='finish'&&g.mt>50){const a=Math.min(1,(g.mt-50)/30);recta(W/2-120,40,240,26+g.finT.length*14+6,0x000000,0.55*a);rect(W/2-120,40,240,2,HP);text('完赛',W/2,46,mix(0x000000,0xffffff,a),{size:14,align:'c',bold:true});
    g.finT.forEach(([ci,tm],i)=>{const y=70+i*14;const c=ci===0?HO:0xe8e0f0;text(String(i+1),W/2-104,y,c,{size:10,bold:true});text(NAMES[ci],W/2-86,y,c,{size:10});text(Math.floor(tm/60)+':'+(tm%60).toFixed(2).padStart(5,'0'),W/2+104,y,c,{size:10,align:'r'})});
    if(g.banked>0)text('技巧分 '+g.banked.toLocaleString('en'),W/2,76+g.finT.length*14,0xffc8de,{size:10,align:'c'})}
  if(cine&&g.shot==='jump'){recta(0,0,W,16,0x000000,0.9);recta(0,H-16,W,16,0x000000,0.9)}
  if(g.vlab>0){g.vlab--;const a=Math.min(1,g.vlab/20);recta(W-118,8,108,15,0x000000,0.5*a);text('镜头 · '+VNAME[g.view],W-16,10,mix(0x000000,0xf0e8d8,a),{size:10,align:'r'})}}
function ai(g){return aiPad(g,g.me)}
self.CARKIT={HC,setCam,proj,camZ,ZB,ENV,PAINTS,paintCarAll,blitCar,carMat,convex,fillPoly,mixf,CC,TANEL};
GAMES.push({id:'horizon',name:'落日环线',ref:'对标：极限竞速：地平线 · 开放世界赛车（车后追尾）',keys:'↑ 油门 · ↓ 刹车 · ← → 转向 · K/空格 手刹漂移 · V 切换镜头',thumbAt:1500,views:VIEWS.map(v=>[v,VNAME[v]]),
  about:['黄昏的乡间环线：嘉年华拱门下发车，六辆车跑一圈两公里半，穿过收割后的麦田和树篱、爬上山脊飞过坡顶、沿着湖边直道冲进落日、在秋天的林子里连续过弯。镜头在车后，像地平线系列那样跟着车身摆动，速度越快视野越宽。',
    '地面每一列像素从近到远逐个采样：路面、标线、弯道路肩、田块的割痕和犁沟、树篱、落叶层、岩石、湖岸的沙都是按世界坐标现画的，用手挑的黄昏色阶分层，没有抖动。太阳很低，山坡和树都投出几十米长的影子；湖面倒映着天空，太阳下面是一条碎金。',
    '车不是贴图：车身按截面放样成曲面，每个像素按它在车上的位置上色——尾灯灯带、车牌、扩散器、双排气、车顶条纹、车窗里的晚霞、轮辋和粉色卡钳，刹车时尾灯更亮，换挡时排气管喷火。树、观众、热气球都按当前大小单独画，逆光时树冠只剩一圈金边。'],
  tags:['逐列采样的地面，按世界坐标上色','黄昏色阶，长影子','湖面倒影与日光碎金','放样车身逐像素上色','漂移 / 腾空 / 擦肩 / 测速技巧链','坡顶飞跃切路边机位慢动作','按大小现画的树和观众','四种镜头'],
  init,tick,draw,ai,info:g=>({intro:'入场',count:'倒数',race:'比赛',finish:'完赛'}[g.mode]||'')+' · '+(VNAME[g.shot]||'')+' v'+Math.round(g.me.v*3.6)+' s'+Math.round(progress(g.me))+' d'+g.me.drift+' air'+g.me.air});
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

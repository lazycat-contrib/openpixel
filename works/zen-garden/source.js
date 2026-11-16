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


// ================= K: a small true-colour pixel core =================
// A 480x270 colour buffer + emissive (for bloom) + depth. Each game owns its own renderer (voxel space, oblique heightfield,
// folding paper) and writes final pixels here; K only handles text, sound, helpers, and the hand-off to the display.
const K=(function(){
const W=480,H=270,N=W*H;
const col=new Uint32Array(N),em=new Uint8Array(N),dep=new Float32Array(N);
const img=new ImageData(W,H),o32=new Uint32Array(img.data.buffer);
const BW=W>>1,BH=H>>1,bimg=new ImageData(BW,BH),b32=new Uint32Array(bimg.data.buffer);
const S={W,H,col,em,dep,img,bimg,frame:0,flash:0,flashC:0xffffff,fade:0,fadeC:0,raw:false,bloomK:1,shx:0,shy:0};
// ---------------- colour helpers ----------------
const rgb=(r,g,b)=>((r<0?0:r>255?255:r|0)<<16)|((g<0?0:g>255?255:g|0)<<8)|(b<0?0:b>255?255:b|0);
const hex=s=>parseInt(s.replace('#',''),16);
function mix(a,b,t){if(t<=0)return a;if(t>=1)return b;const ar=a>>16&255,ag=a>>8&255,ab=a&255;return rgb(ar+((b>>16&255)-ar)*t,ag+((b>>8&255)-ag)*t,ab+((b&255)-ab)*t)}
function mul(a,k){return rgb((a>>16&255)*k,(a>>8&255)*k,(a&255)*k)}
function mulc(a,kr,kg,kb){return rgb((a>>16&255)*kr,(a>>8&255)*kg,(a&255)*kb)}
function add(a,b){return rgb((a>>16&255)+(b>>16&255),(a>>8&255)+(b>>8&255),(a&255)+(b&255))}
// a ramp is a hand-picked list of colours, dark to light; sampling snaps to a step (no gradients, no dither)
const ramp=s=>s.split(' ').map(hex);
function rs(R,t){const n=R.length;let i=Math.floor(t*n);return R[i<0?0:i>=n?n-1:i]}
// ---------------- random ----------------
let seed=1;const rnd=()=>{seed=(seed*1664525+1013904223)|0;return((seed>>>8)&0xffffff)/0x1000000};
const rr=(a,b)=>a+(b-a)*rnd(),ri=(a,b)=>Math.floor(rr(a,b+1));
function hash(x,y){let h=(x|0)*374761393+(y|0)*668265263;h=(h^(h>>>13))*1274126177;h=h^(h>>>16);return(h>>>0)/4294967296}
const pmod=(a,n)=>((a%n)+n)%n;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function vnoise(x,y,s){const X=Math.floor(x),Y=Math.floor(y),fx=x-X,fy=y-Y,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);s=s||0;
  const a=hash(X+s,Y),b=hash(X+1+s,Y),c=hash(X+s,Y+1),d=hash(X+1+s,Y+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,o,s){let v=0,a=0.5,f=1;for(let i=0;i<o;i++){v+=a*vnoise(x*f,y*f,(s||0)+i*31);f*=2;a*=0.5}return v/(1-Math.pow(0.5,o))}
// ---------------- drawing ----------------
function clear(c){col.fill(c);em.fill(0);dep.fill(1e9)}
function px(x,y,c,e){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;col[p]=c;em[p]=e||0}
function pxa(x,y,c,a,e){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;col[p]=mix(col[p],c,a);if(e)em[p]=Math.max(em[p],e)}
function rect(x,y,w,h,c,e){x=Math.round(x);y=Math.round(y);for(let j=Math.max(0,y);j<Math.min(H,y+h);j++)for(let i=Math.max(0,x);i<Math.min(W,x+w);i++){const p=j*W+i;col[p]=c;em[p]=e||0}}
function recta(x,y,w,h,c,a){x=Math.round(x);y=Math.round(y);for(let j=Math.max(0,y);j<Math.min(H,y+h);j++)for(let i=Math.max(0,x);i<Math.min(W,x+w);i++){const p=j*W+i;col[p]=mix(col[p],c,a)}}
function line(x0,y0,x1,y1,c,e){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let er=dx+dy;
  for(let k=0;k<3000;k++){px(x0,y0,c,e);if(x0===x1&&y0===y1)break;const e2=2*er;if(e2>=dy){er+=dy;x0+=sx}if(e2<=dx){er+=dx;y0+=sy}}}
function disc(cx,cy,r,c,e){for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy;if(dx*dx+dy*dy<=r*r)px(x,y,c,e)}}
function disca(cx,cy,r,c,a){for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy;if(dx*dx+dy*dy<=r*r)pxa(x,y,c,a)}}
function ring(cx,cy,r,w,c,e){const r0=Math.max(0,r-w);for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const dx=x+0.5-cx,dy=y+0.5-cy,d=dx*dx+dy*dy;if(d<=r*r&&d>=r0*r0)px(x,y,c,e)}}
// soft additive glow (goes to colour and to bloom)
function glow(cx,cy,r,c,k){const cr=(c>>16&255)*k,cg=(c>>8&255)*k,cb=(c&255)*k;for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(H-1,Math.ceil(cy+r));y++)for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(W-1,Math.ceil(cx+r));x++){
  const dx=x+0.5-cx,dy=y+0.5-cy,d=(dx*dx+dy*dy)/(r*r);if(d>=1)continue;const a=(1-d)*(1-d),p=y*W+x,o=col[p];col[p]=rgb((o>>16&255)+cr*a,(o>>8&255)+cg*a,(o&255)+cb*a);em[p]=Math.min(255,em[p]+a*120*k)}}
// sprites: rows of chars mapped through a palette object; '.' is empty
function spr(rows,map){const h=rows.length,w=Math.max(...rows.map(r=>r.length)),c=new Int32Array(w*h).fill(-1);
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const ch=rows[y][x];if(ch==='.'||ch===' ')continue;const m=map[ch];if(m==null)throw new Error('sprite char '+ch);c[y*w+x]=m}return{w,h,c}}
function blit(s,x,y,o){o=o||{};x=Math.round(x);y=Math.round(y);const fl=o.flip,tint=o.tint,ta=o.ta||0,e=o.em||0,al=o.a;
  for(let j=0;j<s.h;j++){const Y=y+j;if(Y<0||Y>=H)continue;for(let i=0;i<s.w;i++){let c=s.c[j*s.w+(fl?s.w-1-i:i)];if(c<0)continue;const X=x+i;if(X<0||X>=W)continue;const p=Y*W+X;
    if(tint!=null)c=mix(c,tint,ta);if(al!=null)col[p]=mix(col[p],c,al);else col[p]=c;em[p]=e}}}
// ---------------- text: 5x7 latin, 3x5 digits, CJK rasterised from the system font at 4x ----------------
const S8=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
function ptext(str,x,y,c,o){o=o||{};const sc=o.scale||1,e=o.em||0;str=String(str).toUpperCase();let w=0;for(const ch of str){const g=PF[ch]||PF[' '];w+=(g[0].length+1)*sc}w-=sc;
  if(o.align==='c')x-=Math.floor(w/2);else if(o.align==='r')x-=w;x=Math.round(x);y=Math.round(y);
  const pass=(cc,dx,dy,ee)=>{let cx=x;for(const ch of str){const g=PF[ch]||PF[' '];for(let j=0;j<7;j++)for(let i=0;i<g[j].length;i++)if(g[j][i]==='#')rect(cx+i*sc+dx,y+j*sc+dy,sc,sc,cc,ee);cx+=(g[0].length+1)*sc}};
  if(o.ink!=null)for(const[dx,dy]of S8)pass(o.ink,dx,dy,0);if(o.shadow!=null)pass(o.shadow,sc,sc,0);pass(c,0,0,e);return w}
const GC=new Map();let gcv=null,gcg=null;
const FAM='"PingFang SC","Hiragino Sans GB","Noto Sans SC","Noto Sans CJK SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif';
const FAMS={kai:'"Kaiti SC","STKaiti","KaiTi","AR PL UKai CN","Noto Serif SC","Noto Serif CJK SC","Songti SC",serif',serif:'"Songti SC","Noto Serif SC","Noto Serif CJK SC","SimSun",serif'};
function glyph(ch,size,bold,fam){const key=ch+'|'+size+'|'+(bold?1:0)+'|'+(fam||'');let G=GC.get(key);if(G)return G;
  if(ch===' '){G={w:Math.round(size*0.35),px:[]};GC.set(key,G);return G}
  const KK=4;if(!gcv){gcv=document.createElement('canvas');gcg=gcv.getContext('2d',{willReadFrequently:true})}
  const f=(bold?'bold ':'')+(size*KK)+'px '+(fam?FAMS[fam]||fam:FAM);gcg.font=f;const mw=gcg.measureText(ch).width;const w=Math.max(1,Math.round(mw/KK)),h=size+3;
  gcv.width=(w+2)*KK;gcv.height=h*KK;gcg.font=f;gcg.textBaseline='top';gcg.fillStyle='#fff';gcg.fillText(ch,KK,KK*0.5);
  const d=gcg.getImageData(0,0,gcv.width,gcv.height).data,pp=[],CW=gcv.width;
  for(let y=0;y<h;y++)for(let x=0;x<w+2;x++){let s=0;for(let j=0;j<KK;j++)for(let i=0;i<KK;i++)s+=d[((y*KK+j)*CW+x*KK+i)*4+3];if(s/(KK*KK*255)>(bold?0.42:0.34))pp.push(x-1,y)}
  G={w,px:pp};GC.set(key,G);return G}
function measure(str,size,bold,fam){let w=0;for(const ch of String(str))w+=glyph(ch,size,bold,fam).w;return w}
// o: size, bold, align, ink (outline), shadow, em, sp (letter spacing), a (alpha)
function text(str,x,y,c,o){o=o||{};const size=o.size||12,sp=o.sp||0;str=String(str);const w=measure(str,size,o.bold,o.fam)+sp*(str.length-1);if(o.align==='c')x-=Math.floor(w/2);else if(o.align==='r')x-=w;x=Math.round(x);y=Math.round(y);
  const a=o.a==null?1:o.a;const put=a>=1?(X,Y,cc,ee)=>px(X,Y,cc,ee):(X,Y,cc,ee)=>pxa(X,Y,cc,a,ee);
  const pass=(cc,dx,dy,ee,list)=>{let cx=x;for(const ch of str){const G=glyph(ch,size,o.bold,o.fam);const q=G.px;for(let i=0;i<q.length;i+=2)for(const[ax,ay]of list)put(cx+q[i]+dx+ax,y+q[i+1]+dy+ay,cc,ee);cx+=G.w+sp}};
  if(o.ink!=null)pass(o.ink,0,0,0,S8);if(o.shadow!=null)pass(o.shadow,1,1,0,[[0,0]]);pass(c,0,0,o.em||0,[[0,0]]);return w}
// ---------------- present: grade, flash/fade, bloom bright-pass from emissive ----------------
function present(){const raw=S.raw,fl=S.flash,fc=S.flashC,fd=S.fade,fdc=S.fadeC;
  for(let p=0;p<N;p++){let c=col[p];if(!raw){if(fd>0)c=mix(c,fdc,fd);if(fl>0)c=mix(c,fc,fl)}o32[p]=0xff000000|(c&255)<<16|(c&0xff00)|(c>>16&255)}
  const k=S.bloomK;for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const p=(y*2)*W+x*2;let r=0,g=0,b=0;
    for(let j=0;j<4;j++){const q=p+(j&1)+(j>>1)*W,e=em[q];if(!e)continue;const c=col[q],f=e/255*k;r+=(c>>16&255)*f;g+=(c>>8&255)*f;b+=(c&255)*f}
    r=Math.min(255,r/4);g=Math.min(255,g/4);b=Math.min(255,b/4);b32[y*BW+x]=0xff000000|(b<<16)|(g<<8)|r}}
// ---------------- sound: a tiny WebAudio synth ----------------
const SND={on:false,ctx:null,last:{},master:null,nb:null,amb:null};
function sndInit(){if(SND.ctx)return;try{const C=new (window.AudioContext||window.webkitAudioContext)();SND.ctx=C;SND.master=C.createGain();SND.master.gain.value=0.5;
  const comp=C.createDynamicsCompressor();SND.master.connect(comp);comp.connect(C.destination);
  const nb=C.createBuffer(1,C.sampleRate*2,C.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.nb=nb}catch(e){SND.ctx=null}}
function tone(type,f0,f1,dur,vol,t0,att){const C=SND.ctx,o=C.createOscillator(),g=C.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
  if(att){g.gain.setValueAtTime(0.0008,t0);g.gain.exponentialRampToValueAtTime(vol,t0+att)}else g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);o.connect(g);g.connect(SND.master);o.start(t0);o.stop(t0+dur+0.02)}
function noise(dur,vol,t0,ftype,f0,f1,q,att){const C=SND.ctx,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=SND.nb;f.type=ftype||'lowpass';f.frequency.setValueAtTime(f0||3000,t0);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1||f0||3000),t0+dur);f.Q.value=q||0.7;
  if(att){g.gain.setValueAtTime(0.0008,t0);g.gain.exponentialRampToValueAtTime(vol,t0+att)}else g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);s.connect(f);f.connect(g);g.connect(SND.master);s.start(t0,Math.random()*1);s.stop(t0+dur+0.02)}
// a looping filtered-noise bed whose level and colour a game sets every frame (wind, rain, crowd)
function bed(name,ftype,f,q){if(!SND.ctx)return null;SND.beds=SND.beds||{};if(SND.beds[name])return SND.beds[name];const C=SND.ctx,s=C.createBufferSource(),fl=C.createBiquadFilter(),g=C.createGain();
  s.buffer=SND.nb;s.loop=true;fl.type=ftype;fl.frequency.value=f;fl.Q.value=q||0.7;g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(SND.master);s.start();return SND.beds[name]={g,fl}}
function bedSet(name,vol,f){const b=SND.beds&&SND.beds[name];if(!b)return;const t=SND.ctx.currentTime;b.g.gain.setTargetAtTime(SND.on?vol:0,t,0.15);if(f)b.fl.frequency.setTargetAtTime(f,t,0.2)}
function bedsOff(){if(!SND.beds)return;for(const k in SND.beds)SND.beds[k].g.gain.setTargetAtTime(0,SND.ctx.currentTime,0.1)}
function now(){return SND.ctx?SND.ctx.currentTime:0}
const live=()=>SND.on&&SND.ctx&&!S.mute;
return {W,H,N,S,rgb,hex,mix,mul,mulc,add,ramp,rs,rnd,rr,ri,hash,pmod,clamp,lerp,sstep,vnoise,fbm,setSeed:v=>{seed=v|0},
  clear,px,pxa,rect,recta,line,disc,disca,ring,glow,spr,blit,ptext,text,measure,glyph,present,
  SND,sndInit,tone,noise,bed,bedSet,bedsOff,now,live};
})();

const GAMES=[];


// ================= 枯山水: rake a dry garden =================
// A temple garden seen from the veranda. The white gravel is a height field; the rake writes groove profiles into it
// along its path (grooves follow the stroke, five tines), and every pixel is relit each frame from its slope, so ridges
// catch the sun and grooves fall into shade. Rocks are faceted (Voronoi facets over a distance-field dome), sit on moss
// islands and cast shadows that swing with the time of day. A maple drops leaves; the rake pushes them. Rain softens
// and slowly erases the patterns. Tap a rock and the rake draws rings around it.
const ZEN=(function(){const {W,H,S,mix,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const FS=0.62,GY0=66,GY1=228,P=6.2;// foreshortening, gravel rows, groove period (world px)
const GH=new Float32Array(N);// gravel height (only rows GY0..GY1 used)
const MAT=new Uint8Array(N);// 0 sky,1 lit static,2 gravel,3 rock,4 moss,5 dark (unlit),6 lantern window
const ALB=new Uint32Array(N),NX=new Float32Array(N),NY=new Float32Array(N),NZ=new Float32Array(N);
const BLK=new Uint8Array(N);// 1 = rake cannot write here (rocks, moss)
const SH=new Uint8Array(N);// static cast shadow mask (rocks, lantern, wall), rebuilt when the sun moves
const DP=new Uint8Array(N);// dapple mask from maple leaves
const FACE=new Int16Array(N).fill(-1);// rock facet id (for crack lines)
let built=false;
// ---------------- palettes ----------------
const GR=K.ramp('#5f5b52 #7d796d #9c978a #b7b2a3 #cdc9b9 #dfdccd #eeebdf');// gravel, dark->light
const STONE=K.ramp('#2e2c2c #45403c #5b554e #716a60 #898072 #a19887');
const MOSS=K.ramp('#1e2a14 #2c3d18 #3d5320 #52692a #6b8034 #879a44');
// ---------------- light by time of day ----------------
const KEYS=[// L toward the light (x right, y into the scene, z up), sun colour, ambient
  {L:[-0.78,-0.22,0.52],c:[0.86,0.7,0.52],a:[0.34,0.38,0.5],sky:['#f3d6b0','#9ec0d8'],fol:0x23361f},
  {L:[-0.3,-0.36,0.88],c:[0.72,0.7,0.66],a:[0.4,0.42,0.48],sky:['#e9f1f4','#8db8dc'],fol:0x2a4426},
  {L:[0.82,-0.3,0.36],c:[0.98,0.56,0.32],a:[0.3,0.26,0.4],sky:['#ffb46a','#6a5a8a'],fol:0x2a2a22},
  {L:[0.35,0.42,0.72],c:[0.26,0.34,0.56],a:[0.08,0.1,0.18],sky:['#1c2a4a','#0a0e1e'],fol:0x0c1210}];
const LT={L:[0,0,1],c:[1,1,1],a:[0.5,0.5,0.5],night:0,skyA:0,skyB:0,fol:0};
function norm3(v){const l=Math.hypot(v[0],v[1],v[2]);return[v[0]/l,v[1]/l,v[2]/l]}
function setLight(tod){// tod 0..4 cycles through the four keys
  const i=Math.floor(tod)%4,j=(i+1)%4,f=K.sstep(0.55,1,tod-Math.floor(tod));const A=KEYS[i],B=KEYS[j];
  LT.L=norm3([lerp(A.L[0],B.L[0],f),lerp(A.L[1],B.L[1],f),lerp(A.L[2],B.L[2],f)]);
  for(let k=0;k<3;k++){LT.c[k]=lerp(A.c[k],B.c[k],f);LT.a[k]=lerp(A.a[k],B.a[k],f)}
  LT.skyA=mix(K.hex(A.sky[0]),K.hex(B.sky[0]),f);LT.skyB=mix(K.hex(A.sky[1]),K.hex(B.sky[1]),f);LT.fol=mix(A.fol,B.fol,f);
  LT.night=i===3?1-f:j===3?f:0}
// quantised light: 6 steps of direct light, so shading stays banded while the colour of the light drifts
function overcast(r){if(r<=0)return;const k=1-0.72*r;for(let i=0;i<3;i++){LT.c[i]*=k;LT.a[i]=LT.a[i]*(1+0.25*r)}LT.skyA=mix(LT.skyA,0x9a9ea4,r*0.8);LT.skyB=mix(LT.skyB,0x7a7e86,r*0.8);LT.fol=mix(LT.fol,0x2a302c,r*0.4)}
function lightK(ndl,sh){let d=ndl<=0?0:Math.min(1,ndl);d=Math.round(d*6)/6;return d*sh}
function shade(c,ndl,sh,extra){const d=lightK(ndl,sh);const r=(c>>16&255),g=(c>>8&255),b=(c&255);const e=extra||0;
  return rgb(r*(LT.a[0]+LT.c[0]*d+e*1.25),g*(LT.a[1]+LT.c[1]*d+e*0.82),b*(LT.a[2]+LT.c[2]*d+e*0.42))}
// ---------------- geometry helpers ----------------
function polyMask(pts){const m=new Uint8Array(N);let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
  for(let y=Math.max(0,Math.floor(y0));y<=Math.min(H-1,Math.ceil(y1));y++){const xs=[];const yc=y+0.5;
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=yc)!==(b[1]<=yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.round(xs[k]));x<Math.min(W,Math.round(xs[k+1]));x++)m[y*W+x]=1}return m}
function chamfer(m,x0,y0,x1,y1){const d=new Float32Array(N).fill(0);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const p=y*W+x;d[p]=m[p]?1e6:0}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const p=y*W+x;if(!d[p])continue;let v=d[p];if(x>x0)v=Math.min(v,d[p-1]+1);if(y>y0)v=Math.min(v,d[p-W]+1);if(x>x0&&y>y0)v=Math.min(v,d[p-W-1]+1.414);if(x<x1&&y>y0)v=Math.min(v,d[p-W+1]+1.414);d[p]=v}
  for(let y=y1;y>=y0;y--)for(let x=x1;x>=x0;x--){const p=y*W+x;if(!d[p])continue;let v=d[p];if(x<x1)v=Math.min(v,d[p+1]+1);if(y<y1)v=Math.min(v,d[p+W]+1);if(x<x1&&y<y1)v=Math.min(v,d[p+W+1]+1.414);if(x>x0&&y<y1)v=Math.min(v,d[p+W-1]+1.414);d[p]=v}return d}
// ---------------- rocks ----------------
// each rock: silhouette (screen), footprint centre and radii (for rings and shadows), facet seeds
const ROCKS=[
  {pts:[[122,154],[124,142],[129,128],[135,114],[142,104],[149,97],[155,95],[161,99],[165,108],[170,120],[175,133],[179,145],[180,154],[170,159],[150,161],[132,160]],cx:151,cy:153,rx:30,ry:9,seed:3,ring:3},
  {pts:[[178,160],[181,150],[188,145],[196,146],[202,151],[205,160],[196,164],[185,164]],cx:191,cy:158,rx:15,ry:6,seed:9,ring:0},
  {pts:[[282,182],[286,172],[296,166],[312,163],[330,163],[346,167],[354,174],[356,184],[340,190],[310,191],[290,189]],cx:318,cy:182,rx:38,ry:10,seed:5,ring:4},
  {pts:[[380,124],[382,113],[388,104],[395,101],[401,105],[405,114],[407,124],[399,128],[388,128]],cx:393,cy:124,rx:15,ry:5,seed:14,ring:3},
  {pts:[[96,206],[99,199],[106,195],[115,196],[120,202],[119,208],[108,211],[100,210]],cx:108,cy:206,rx:13,ry:5,seed:21,ring:2}];
const MOSSI=[{cx:160,cy:156,rx:56,ry:15,seed:2},{cx:320,cy:184,rx:50,ry:12,seed:7},{cx:393,cy:125,rx:22,ry:6,seed:11},{cx:52,cy:76,rx:60,ry:12,seed:4}];
function buildRock(r,ri){const m=polyMask(r.pts);let x0=W,y0=H,x1=0,y1=0;for(const p of r.pts){x0=Math.min(x0,p[0]|0);x1=Math.max(x1,Math.ceil(p[0]));y0=Math.min(y0,p[1]|0);y1=Math.max(y1,Math.ceil(p[1]))}
  x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1=Math.min(W-1,x1+2);y1=Math.min(H-1,y1+2);const d=chamfer(m,x0,y0,x1,y1);
  // facet seeds: a loose grid jittered by the rock's seed
  const seeds=[];K.setSeed(r.seed*977);const n=Math.max(5,Math.round((x1-x0)*(y1-y0)/150));
  for(let k=0;k<n*3&&seeds.length<n;k++){const x=K.rr(x0,x1),y=K.rr(y0,y1);if(!m[(y|0)*W+(x|0)])continue;if(seeds.some(s=>Math.hypot(s.x-x,(s.y-y)*1.2)<7))continue;seeds.push({x,y,n:[0,0,0],c:0})}
  const own=new Int16Array((x1-x0+1)*(y1-y0+1)).fill(-1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const p=y*W+x;if(!m[p])continue;let best=0,bd=1e9;for(let k=0;k<seeds.length;k++){const s=seeds[k],dd=(s.x-x)**2+((s.y-y)*1.3)**2;if(dd<bd){bd=dd;best=k}}
    own[(y-y0)*(x1-x0+1)+(x-x0)]=best;const gx=(d[p+1]-d[p-1]),gy=(d[p+W]-d[p-W]);const dh=Math.sqrt(Math.max(0,d[p]));
    // dome normal in screen terms: ex right, ey down, ez to camera; then into world (x, depth, up)
    let ex=-gx*0.5,ey=-gy*0.5,ez=0.35+dh*0.18;const l=Math.hypot(ex,ey,ez);ex/=l;ey/=l;ez/=l;const s=seeds[best];s.n[0]+=ex;s.n[1]+=-ez*0.8;s.n[2]+=-ey+ez*0.35;s.c++}
  for(const s of seeds){const jit=[K.rr(-0.25,0.25),K.rr(-0.2,0.2),K.rr(-0.15,0.15)];s.n=norm3([s.n[0]/s.c+jit[0],s.n[1]/s.c+jit[1],s.n[2]/s.c+jit[2]+0.15])}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const p=y*W+x;if(!m[p])continue;const k=own[(y-y0)*(x1-x0+1)+(x-x0)],s=seeds[k];
    MAT[p]=3;BLK[p]=1;FACE[p]=ri*64+k;NX[p]=s.n[0];NY[p]=s.n[1];NZ[p]=s.n[2];
    const lich=fbm(x*0.21,y*0.27,3,ri*13);let a=STONE[3];if(lich>0.66)a=STONE[4];else if(lich<0.3)a=STONE[2];
    if(s.n[2]>0.55&&fbm(x*0.12,y*0.15,3,ri*7+50)>0.5)a=hash(x,y)<0.5?MOSS[3]:MOSS[4];// moss on the tops
    ALB[p]=a}
  // footprint shadow anchor rows for each column
  r.mask=m;r.box=[x0,y0,x1,y1]}
function buildMoss(mi){const {cx,cy,rx,ry,seed}=mi;for(let y=Math.floor(cy-ry-6);y<=cy+ry+6;y++)for(let x=Math.floor(cx-rx-8);x<=cx+rx+8;x++){if(x<0||y<0||x>=W||y>=H)continue;
    const dx=(x-cx)/rx,dy=(y-cy)/ry;const n=fbm(x*0.08,y*0.12,3,seed*5)*0.55;const r=Math.sqrt(dx*dx+dy*dy)+n-0.27;if(r>1)continue;const p=y*W+x;if(MAT[p]===3)continue;
    // cushion bumps: small domes from a noise field
    const b=fbm(x*0.32,y*0.5,2,seed*9+3);const bx=fbm((x+1)*0.32,y*0.5,2,seed*9+3)-b,by=fbm(x*0.32,(y+1)*0.5,2,seed*9+3)-b;const edge=1-r;
    MAT[p]=4;BLK[p]=1;const nn=norm3([-bx*5,-by*3-(edge<0.15?0.4:0),1]);NX[p]=nn[0];NY[p]=nn[1];NZ[p]=nn[2];
    let a=b>0.62?MOSS[4]:b>0.48?MOSS[3]:MOSS[2];if(edge<0.12)a=MOSS[2];if(hash(x*3,y*7)<0.04)a=MOSS[5];ALB[p]=a}}
// ---------------- static scene: sky, foliage, roof, wall, lantern, veranda ----------------
const LAN={x:40,base:88,top:36};// stone lantern foot
function setS(x,y,c,n,m){if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;ALB[p]=c;MAT[p]=m==null?1:m;NX[p]=n[0];NY[p]=n[1];NZ[p]=n[2]}
const NUP=[0,0,1],NFRONT=[0,-1,0.15],NLEFT=[-0.8,-0.5,0.2],NRIGHT=[0.8,-0.5,0.2],NDOWN=[0,-0.6,-0.8];
function build(){if(built)return;built=true;
  // sky and the dark trees beyond the wall are drawn per frame (MAT 0); here mark them
  for(let y=0;y<GY0;y++)for(let x=0;x<W;x++)MAT[y*W+x]=0;
  // roof: tiles along the wall top
  for(let x=0;x<W;x++){for(let y=12;y<20;y++){const t=(x%6),row=y-12;let c=0x3a3c40,n=NUP;if(row<2){c=0x4a4c52;n=[0,0.3,1]}else if(row>=6){c=0x2a2c30;n=NFRONT}else{c=t<3?0x45474c:0x3a3c40;n=t<2?[-0.4,-0.2,0.9]:t>3?[0.4,-0.2,0.9]:NUP}setS(x,y,c,n)}
    // round tile ends
    const t=x%6;setS(x,20,t===0||t===5?0x1c1d20:0x50535a,NFRONT);setS(x,21,t===0||t===5?0x1c1d20:0x3e4046,NFRONT);setS(x,22,t>0&&t<5?0x2a2c30:0x1c1d20,NDOWN)}
  for(let x=0;x<W;x++)setS(x,11,0x2e3034,[0,0.2,1]);
  // plaster wall with five horizontal rank lines, rain stains, a darker base
  for(let y=23;y<60;y++)for(let x=0;x<W;x++){let c=0xc8a66c;const n=fbm(x*0.03,y*0.11,4,40);if(n>0.6)c=mix(c,0x8c7650,clamp((n-0.6)*2.5,0,0.7));
    const st=fbm(x*0.2,y*0.02,3,41);if(st>0.68&&y>30)c=mix(c,0x7a6a4c,0.35);
    let nn=NFRONT;if(y>=55){c=0x6c665c;if((x+((y>>1)&1)*7)%14===0||y===55)c=0x4a4640}
    for(const ly of [29,34,39,44,49])if(y===ly){c=0xf2ead8;nn=[0,-0.8,0.5]}else if(y===ly+1)c=mix(c,0x6a5a3c,0.4);
    setS(x,y,c,nn)}
  for(let x=0;x<W;x++){setS(x,23,0x5a4a34,NDOWN);setS(x,24,0x7a6648,NDOWN)}
  // the strip where wall meets gravel: dark river-stone edging
  for(let y=60;y<GY0;y++)for(let x=0;x<W;x++){const h=hash(x>>1,y);const c=h<0.4?0x4a4844:h<0.75?0x5c5954:0x6e6a62;setS(x,y,c,y===60?NDOWN:NUP)}
  // moss and rocks
  for(const m of MOSSI)buildMoss(m);ROCKS.forEach(buildRock);
  const L=LAN.x,B=LAN.base;
  // stone lantern (kasuga-ish), profile rows from the top: [halfwidth, kind]; kinds t top, f front, e edge, u underside, w window band
  const PROF=[[1,'t'],[2,'f'],[2,'f'],[1,'u'],[3,'t'],[4,'f'],[5,'t'],[6,'t'],[8,'t'],[10,'t'],[12,'t'],[14,'t'],[15,'e'],[13,'u'],
    [8,'b'],[8,'f'],[8,'w'],[8,'w'],[8,'w'],[8,'w'],[8,'w'],[8,'w'],[8,'f'],[8,'b'],[11,'t'],[11,'f'],[11,'f'],[9,'u'],
    [3,'f'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],[4,'b'],[4,'f'],[4,'b'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],[3,'f'],
    [7,'t'],[8,'f'],[8,'f'],[8,'f'],[10,'t'],[10,'f'],[10,'f']];
  const top=B-PROF.length;
  PROF.forEach(([hw,k],j)=>{const y=top+j;for(let i=-hw;i<=hw;i++){const x=L+i;const side=i<-hw*0.45?-1:i>hw*0.45?1:0;let c=0x8a847a,n=side<0?NLEFT:side>0?NRIGHT:NFRONT;
      if(k==='t'){n=[side*0.35,0.1,1];c=0x948e82;if(j>=6&&j<=11&&fbm(x*0.4,y*0.6,2,70)>0.6)c=0x5a6a34}
      else if(k==='e'){c=0x6e685e;n=NFRONT}else if(k==='u'){c=0x3a3632;n=NDOWN}else if(k==='b'){c=0x9a9488}
      else if(k==='w'&&Math.abs(i)<=4){c=0x1c1814;if(i===0||j===19)c=0x6e685e;else{const p=y*W+x;setS(x,y,c,NFRONT,6);continue}}
      if(hash(x*5,y*3)<0.12)c=mix(c,0x4a4640,0.35);if(i===-hw&&k!=='t')c=mix(c,0xb0aa9c,0.35);setS(x,y,c,n)}});
  setS(L-16,top+11,0x948e82,[0,0.1,1]);setS(L+16,top+11,0x948e82,[0,0.1,1]);setS(L-16,top+10,0x948e82,[0,0.1,1]);setS(L+16,top+10,0x948e82,[0,0.1,1]);
  LAN.top=top;
  // tsukubai basin and the bamboo deer-scarer frame (the moving pipe is drawn per frame)
  for(let y=-6;y<=6;y++)for(let x=-12;x<=12;x++){const d=(x/12)**2+(y/5.5)**2;if(d>1)continue;const p=(90+y)*W+84+x;const top=y<0&&d<0.6;setS(84+x,90+y,top?(d<0.45?0x1a2a34:0x8a847a):0x6e695f,top?NUP:(x<-4?NLEFT:x>4?NRIGHT:NFRONT));BLK[p]=1}
    // veranda: weathered planks, a front beam, the posts' feet at the edges
  for(let y=GY1;y<H;y++)for(let x=0;x<W;x++){let c,n=NUP;const yy=y-GY1;
    if(yy<3){c=yy===0?0x2a1c12:0x5a4028;n=NFRONT}else{const pl=Math.floor((yy-3)/9),lp=(yy-3)%9;const g=fbm(x*0.05,y*0.6,3,60+pl);c=mix(0x8a6a48,0x6a4c32,g);if(hash(pl,(x/70)|0)<0.3)c=mix(c,0x9a7a56,0.4);
      if(lp===8)c=0x2a1c12;if(lp===0)c=mix(c,0xb08c64,0.35);if((x+pl*37)%121===0)c=0x3a2a1c;}
    setS(x,y,c,n)}
  for(let p=0;p<N;p++)if(MAT[p]===0&&Math.floor(p/W)>=GY0)MAT[p]=2;
  for(let y=GY0;y<GY1;y++)for(let x=0;x<W;x++){const p=y*W+x;if(MAT[p]===0||MAT[p]===2){MAT[p]=2}}
}
// ---------------- grooves ----------------
const gro=u=>{const c=0.5+0.5*Math.cos(2*Math.PI*u);return Math.pow(c,0.55)};// broad ridges, narrow grooves
function rakeLinesInit(){for(let y=GY0;y<GY1;y++)for(let x=0;x<W;x++){const p=y*W+x;if(MAT[p]!==2)continue;GH[p]=gro((y-GY0)/4)}}
function ringRock(r,a0,a1){const R=Math.max(r.rx,r.ry/FS)+6,nR=r.ring;if(!nR)return;const wcx=r.cx,wcy=r.cy/FS;const Rout=R+nR*P;
  for(let y=Math.max(GY0,Math.floor(r.cy-Rout*FS)-1);y<=Math.min(GY1-1,Math.ceil(r.cy+Rout*FS)+1);y++)for(let x=Math.max(0,Math.floor(r.cx-Rout)-1);x<=Math.min(W-1,Math.ceil(r.cx+Rout)+1);x++){const p=y*W+x;if(MAT[p]!==2||BLK[p])continue;
    const dx=(x-wcx)/(r.rx/(r.ry/FS)),dy=y/FS-wcy;// rings follow the footprint's aspect a little
    const dd=Math.hypot((x-wcx)*0.85+dx*0.15,dy);const d=dd-R;if(d<-P*0.5||d>nR*P)continue;
    if(a0!=null){let a=Math.atan2(dy,x-wcx);a=K.pmod(a-a0,Math.PI*2);if(a>a1)continue}
    const e=d>nR*P-1.5?0.5:1;GH[p]=lerp(GH[p],gro(Math.max(0,d)/P+0.5),e)}}
// write a rake stroke segment (world capsule body only; tines across the stroke)
function rakeSeg(g,x0,y0,x1,y1){const wy0=y0/FS,wy1=y1/FS;const dx=x1-x0,dy=wy1-wy0,L=Math.hypot(dx,dy);if(L<0.01)return 0;const ux=dx/L,uy=dy/L,hw=P*2.5;
  const minx=Math.max(0,Math.floor(Math.min(x0,x1)-hw-1)),maxx=Math.min(W-1,Math.ceil(Math.max(x0,x1)+hw+1));const miny=Math.max(GY0,Math.floor(Math.min(y0,y1)-hw*FS-1)),maxy=Math.min(GY1-1,Math.ceil(Math.max(y0,y1)+hw*FS+1));
  let n=0;for(let y=miny;y<=maxy;y++){const wy=y/FS;for(let x=minx;x<=maxx;x++){const p=y*W+x;if(MAT[p]!==2||BLK[p])continue;const rx=x-x0,ry=wy-wy0;const t=rx*ux+ry*uy;if(t<-0.6||t>L+0.6)continue;const d=-rx*uy+ry*ux;if(Math.abs(d)>hw)continue;
    const u=d/P+2.5;GH[p]=Math.abs(d)>hw-0.8?Math.max(GH[p],0.7):gro(u);n++;
    // leaves in the band get pushed along
  }}
  for(const l of g.leaves)if(l.st===2){const rx=l.x-x0,ry=l.y/FS-wy0,t=rx*ux+ry*uy,d=-rx*uy+ry*ux;if(t>-2&&t<L+2&&Math.abs(d)<hw+1){l.x+=ux*(L+1.5);l.y+=uy*(L+1.5)*FS;l.spin+=0.3}}
  return n}
// rain slowly relaxes the field toward flat; also used per drop
function relax(x,y,r,k){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const X=x+i,Y=y+j;if(X<1||X>=W-1||Y<=GY0||Y>=GY1-1)continue;const p=Y*W+X;if(MAT[p]!==2)continue;GH[p]=lerp(GH[p],(GH[p-1]+GH[p+1]+GH[p-W]+GH[p+W])*0.25*0.96+0.02,k)}}
// ---------------- shadows ----------------
let shKey='';
function buildShadows(){const L=LT.L;const key=Math.round(L[0]*40)+','+Math.round(L[1]*40)+','+Math.round(L[2]*40);if(key===shKey)return;shKey=key;SH.fill(0);
  const hyp=Math.hypot(L[0],L[1]),k=hyp/Math.max(0.12,L[2]);const sx=-L[0]/hyp*k,sy=L[1]/hyp*k*FS;// screen offset per unit height
  const splat=(x,y,h)=>{const X=Math.round(x+sx*h),Y=Math.round(y+sy*h);for(let j=0;j<2;j++)for(let i=0;i<2;i++){const xx=X+i,yy=Y+j;if(xx>=0&&yy>=0&&xx<W&&yy<H)SH[yy*W+xx]=1}};
  for(const r of ROCKS){const [x0,y0,x1,y1]=r.box;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!r.mask[y*W+x])continue;const h=Math.max(0,r.cy-y)*1.1;const fy=r.cy+(y-r.cy)*0.25;for(let t=0;t<=h;t+=1.5)splat(x,fy,t)}}
  // lantern
  for(let y=LAN.top;y<LAN.base;y++)for(let x=LAN.x-16;x<=LAN.x+16;x++){const p=y*W+x;if(MAT[p]!==1&&MAT[p]!==6)continue;const h=LAN.base-y;for(let t=0;t<=h;t+=1.5)splat(x,LAN.base-2,t)}
  // the wall: when the sun is behind it, its shadow lies on the near gravel
  if(L[1]>-0.05){const h=48;const len=Math.round(sy*h);for(let x=0;x<W;x++)for(let y=GY0;y<GY0+Math.max(0,len-4);y++)SH[y*W+x]=1}
  // keep shadows off the rocks' own sunlit faces: only ground-like materials take cast shadow
}
// maple: branches from the top right over the wall; leaf clusters (also cast dappled shadows)
const MAPLE=[];const TIPS=[[350,34],[404,58],[366,70],[440,66],[414,96],[392,30],[430,18],[460,8],[470,50],[380,14],[338,44],[420,40],[452,80],[396,82],[470,90]];
function buildMaple(){K.setSeed(4242);const br=[[[480,0],[430,18],[392,30],[350,34]],[[430,18],[418,40],[404,58]],[[392,30],[372,48],[366,70]],[[480,30],[452,44],[440,66]],[[452,44],[420,78],[414,96]]];
  for(const b of br)for(let i=0;i+1<b.length;i++){const [a,c]=[b[i],b[i+1]];for(let t=0;t<=1;t+=0.02)MAPLE.push({x:lerp(a[0],c[0],t),y:lerp(a[1],c[1],t),br:1,w:i===0&&b===br[0]?3:i===0?2:1})}
  const tips=TIPS;void [[350,34],[404,58],[366,70],[440,66],[414,96],[392,30],[430,18],[460,8],[470,50],[380,14],[338,44],[420,40],[452,80],[396,82],[470,90]];
  for(const [tx,ty] of tips){const n=K.ri(70,95);for(let k=0;k<n;k++){const a=K.rnd()*Math.PI*2,r=Math.sqrt(K.rnd())*13;const ed=r/13;MAPLE.push({x:tx+Math.cos(a)*r*1.5,y:ty+Math.sin(a)*r*0.75,br:0,c:clamp(Math.round(ed*3+K.rr(-1,1.2)+(Math.sin(a)<0?1:0)),0,4),ph:tx*0.1+K.rnd()*0.6})}}
  for(const m of MAPLE)if(!m.br)m.ph=m.ph+K.rnd()*3;
  MAPLE.sort((a,b)=>(a.br?-1:0)-(b.br?-1:0)||a.c-b.c)}
const LEAFC=[0x6a1410,0x9a2214,0xc23a18,0xe0601c,0xf09a2a];
const LEAF=[[0,-1],[-1,0],[0,0],[1,0],[0,1],[-1,1],[1,1]];// a tiny five-point leaf
// ---------------- state ----------------
function init(g){build();if(!MAPLE.length)buildMaple();rakeLinesInit();for(const r of ROCKS)ringRock(r);
  g.tod=0.35;g.todMode=-1;g.rain=0;g.rainOn=false;g.wet=0;g.drops=[];g.leaves=[];g.rake={x:240,y:150,px:240,py:150,ang:0,down:false,lift:1,spd:0};g.prev=null;g.downT=0;g.downX=0;g.downY=0;
  g.ringAnim=null;g.shishi={a:0,fill:0,st:0,t:0};g.steam=[];g.ai={q:[],i:0,cur:null,t:0};g.wind=0;
  for(let i=0;i<14;i++)g.leaves.push({x:K.rr(300,470),y:K.rr(GY0+4,GY1-6),st:2,c:K.ri(0,4),spin:K.rnd()*6,vx:0,vy:0})}
function rockAt(x,y){for(const r of ROCKS){const dx=(x-r.cx)/(r.rx+r.ring*P+6),dy=(y-r.cy)/((r.ry+(r.ring*P+6)*FS));if(dx*dx+dy*dy<1&&r.ring)return r}return null}
function tick(g,pad){const m=pad.mouse;
  // time of day: auto cycle unless fixed
  if(g.todMode<0)g.tod=(g.tod+1/(60*30))%4;else g.tod=lerp(g.tod,g.todMode+0.0,0.04);setLight(g.tod);
  g.wind=Math.sin(g.t*0.004)*0.5+Math.sin(g.t*0.0131)*0.3;
  // rake follows the hand with a spring; pressing lowers it into the gravel
  const R=g.rake;R.px=R.x;R.py=R.y;if(m){const k=m.down?0.32:0.5;R.x+=(m.x-R.x)*k;R.y+=(clamp(m.y,GY0+2,GY1+20)-R.y)*k}
  const down=!!(m&&m.down)&&R.y<GY1-2;R.lift=lerp(R.lift,down?0:1,0.35);
  const vx=R.x-R.px,vy=(R.y-R.py)/FS,sp=Math.hypot(vx,vy);R.spd=lerp(R.spd,down?sp:0,0.3);
  if(sp>0.3){const a=Math.atan2(vy,vx);let da=a-R.ang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;R.ang+=da*(down?0.35:0.2)}
  if(down&&R.lift<0.3&&sp>0.05)rakeSeg(g,R.px,R.py,R.x,R.y);
  // a tap (short press, little movement) on a rock rings it
  if(m&&m.click){g.downT=g.t;g.downX=m.x;g.downY=m.y}
  if(m&&!m.down&&g.downT&&g.t-g.downT<16&&Math.hypot(m.x-g.downX,m.y-g.downY)<5){const r=rockAt(m.x,m.y);if(r)g.ringAnim={r,a:0}}
  if(m&&!m.down)g.downT=0;
  if(g.ringAnim){const A=g.ringAnim;const a0=A.a;A.a+=0.09;ringRock(A.r,a0-0.02+Math.PI*0.5,0.11);if(A.a>Math.PI*2+0.1)g.ringAnim=null}
  // rain: drops pock the gravel and relax the pattern; wetness darkens
  g.rain=lerp(g.rain,g.rainOn?1:0,0.01);g.wet=clamp(g.wet+(g.rain>0.3?0.0012:-0.0004),0,1);
  if(g.rain>0.05){const n=Math.round(g.rain*12);for(let i=0;i<n;i++)g.drops.push({x:K.rr(-20,W),y:K.rr(-40,-5),z:K.rr(GY0+2,H),v:K.rr(5,7)})}
  for(let i=g.drops.length-1;i>=0;i--){const d=g.drops[i];d.y+=d.v;d.x+=0.9;if(d.y>=d.z){if(d.z<GY1&&K.rnd()<0.6)relax(Math.round(d.x),Math.round(d.z),1,0.4);g.drops.splice(i,1);if(g.splash&&g.splash.length<200)g.splash.push({x:d.x,y:d.z,t:0})}}
  g.splash=g.splash||[];for(let i=g.splash.length-1;i>=0;i--){if(++g.splash[i].t>6)g.splash.splice(i,1)}
  // maple leaves fall, flutter, land and stay; old ones on the gravel slowly fade into the pattern
  if(K.rnd()<0.025+Math.abs(g.wind)*0.02){const t=MAPLE[K.ri(0,MAPLE.length-1)];if(!t.br)g.leaves.push({x:t.x,y:t.y,st:1,c:t.c,spin:K.rnd()*6,vx:K.rr(-0.3,0.1),vy:0.25,gy:K.rr(GY0+6,GY1-4)})}
  for(let i=g.leaves.length-1;i>=0;i--){const l=g.leaves[i];if(l.st===1){l.spin+=0.12;l.x+=l.vx+Math.sin(l.spin)*0.5+g.wind*0.4;l.y+=l.vy+Math.cos(l.spin*2)*0.1;if(l.y>=l.gy){const p=Math.round(l.y)*W+Math.round(l.x);if(p>=0&&p<N&&MAT[p]===3){l.gy+=3}else l.st=2}if(l.x<-10)g.leaves.splice(i,1)}
    else if(l.x<-4||l.x>W+4||l.y<GY0||l.y>GY1+4)g.leaves.splice(i,1)}
  if(g.leaves.length>70)g.leaves.splice(0,g.leaves.findIndex(l=>l.st===2)+1);
  // deer-scarer: water fills the pipe, it tips, knocks, returns
  const sh=g.shishi;sh.t++;if(sh.st===0){sh.fill+=1/600;sh.a=sh.fill*0.25;if(sh.fill>=1){sh.st=1}}else if(sh.st===1){sh.a+=0.09;if(sh.a>=0.75){sh.st=2;sh.fill=0;if(K.live()){const t=K.now();K.noise(0.25,0.08,t,'bandpass',900,700,3)}}}
  else if(sh.st===2){sh.a-=0.12;if(sh.a<=-0.06){sh.a=-0.06;sh.st=3;sh.k=0;if(K.live()){const t=K.now();K.tone('triangle',420,380,0.18,0.22,t);K.tone('sine',840,700,0.08,0.1,t);K.noise(0.05,0.12,t,'bandpass',1800,1200,2)}}}
  else{sh.k++;sh.a=-0.06+Math.min(0,Math.sin(sh.k*0.6)*0.03*Math.exp(-sh.k*0.1));if(sh.k>30){sh.st=0;sh.a=0}}
  // steam from the tea cup
  if(g.t%9===0)g.steam.push({x:430+K.rr(-1,1),y:244,t:0,ph:K.rnd()*6});for(let i=g.steam.length-1;i>=0;i--){const s=g.steam[i];s.t++;s.y-=0.22;s.x+=Math.sin(s.t*0.05+s.ph)*0.18+g.wind*0.05;if(s.t>110)g.steam.splice(i,1)}
  // sound: rake crunch follows speed; rain bed
  if(K.live()){K.bed('rake','bandpass',2600,1.4);K.bedSet('rake',clamp(R.spd*0.05,0,0.22)*(down?1:0),1800+R.spd*300);K.bed('rain','lowpass',3200,0.6);K.bedSet('rain',g.rain*0.22,2600);
    if(down&&R.spd>0.6&&K.rnd()<R.spd*0.15){const t=K.now();K.noise(0.02,0.03+R.spd*0.008,t,'highpass',3000+K.rnd()*2500,3000,1)}
    K.bed('night','bandpass',4200,8);K.bedSet('night',LT.night*0.03*(1-g.rain),4200)}
}
// ---------------- draw ----------------
function draw(g){setLight(g.tod);overcast(g.rain);buildShadows();const L=LT.L,night=LT.night;
  // dapple: maple leaf clusters projected on the gravel
  DP.fill(0);{const hyp=Math.hypot(L[0],L[1]),k=hyp/Math.max(0.15,L[2]);const sx=-L[0]/hyp*k,sy=L[1]/hyp*k*FS;
    const sw=g.wind*2*Math.sin(g.t*0.02);for(const [tx,ty] of TIPS){const h=60;const X=tx+sw+sx*h*0.3,Y=GY0+22+ty*0.7+sy*h*0.3;
      for(let yy=Math.max(GY0,Math.floor(Y-12));yy<Math.min(GY1,Y+12);yy++)for(let xx=Math.max(0,Math.floor(X-20));xx<Math.min(W,X+20);xx++){const dx=(xx-X)/20,dy=(yy-Y)/12,d=dx*dx+dy*dy;if(d>1)continue;
        if(fbm((xx-sw)*0.16,yy*0.26,2,77)+(1-d)*0.25>0.62)DP[yy*W+xx]=1}}}
  const lamp=night*(g.t%7===0?0.95:1);const lx=LAN.x,ly=LAN.top+19;
  const wetK=1-g.wet*0.28;const gl=Math.hypot(L[0],L[1]);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;const m=MAT[p];let c;
    if(m===0){// sky and dark trees beyond the wall
      const tr=y>=3+Math.round(4*fbm(x*0.06,0,3,90)+3*Math.sin(x*0.05))?1:0;c=tr?(hash(x>>1,y>>1)<0.2?mix(LT.fol,0xffffff,0.06):LT.fol):mix(LT.skyB,LT.skyA,y/12);
      if(!tr&&night>0.5&&hash(x,y*7)<0.012)c=0xcfd8f0}
    else if(m===2){// gravel: slope toward the light
      const h0=GH[p],gx=(GH[p+1]-GH[p-1])*0.5,gy=(GH[p+W]-GH[p-W])*0.5*FS;const A=0.55;
      // a ridge facing the sun gets light; height field slopes in world units
      const nx=-gx*2.6,ny=gy*2.6,nl=Math.sqrt(nx*nx+ny*ny+1);const ndl=(nx*L[0]+ny*L[1]+L[2])/nl;let sh=SH[p]?0.2:1;if(DP[p])sh*=0.35;
      let base=GR[clamp(Math.round(2.2+h0*3.2+(hash(x,y)<0.06?-1.2:0)+(hash(x*7,y*3)<0.02?1:0)),0,6)];if(g.wet>0)base=K.mul(base,wetK);
      let ex=0;if(lamp>0){const dx=x-lx,dy=(y-ly)/FS;const d2=dx*dx+dy*dy;if(d2<9000){const f=Math.max(0,1-Math.sqrt(d2)/95);const s=(-gx*(-dx)+gy*(-dy))/Math.sqrt(d2+1)*0.8;ex=Math.round(clamp(f*f*(0.9+s),0,1)*5)/5*0.9*lamp}}
      c=shade(base,ndl,sh,ex)}
    else if(m===6){c=night>0.2?mix(0x2a2218,0xffc060,night):0x2a2218;if(night>0.2)em[p]=Math.round(night*200)}
    else{// lit static, rock, moss
      const ndl=NX[p]*L[0]+NY[p]*L[1]+NZ[p]*L[2];let sh=1;if((m===4||m===1)&&SH[p]&&y>=GY0-2)sh=0.3;if(m===4&&DP[p])sh*=0.5;
      let a=ALB[p];if(g.wet>0&&m>=3)a=K.mul(a,1-g.wet*0.25);
      let ex=0;if(lamp>0&&(m===3||m===4||m===1)){const dx=x-lx,dy=(y-ly);const d=Math.hypot(dx,dy*1.4);const rr=m===1?30:52;if(d<rr)ex=Math.round(Math.max(0,1-d/rr)**2*5)/5*(m===1?0.6:0.9)*lamp}
      c=shade(a,ndl,sh,ex);
      // facet edges: a hairline where two facets meet, dark on the lower one
      if(m===3){const f=FACE[p];if(FACE[p+W]!==f&&FACE[p+W]>=0&&hash(x,y)<0.7)c=mix(c,0x14100c,0.22);if(FACE[p-W]<0||FACE[p-1]<0||FACE[p+1]<0)c=mix(c,0x14100c,0.55)}}
    col[p]=c;if(m!==6)em[p]=0}
  // rock bases: a dark contact line where rock meets moss/gravel
  for(const r of ROCKS){const [x0,y0,x1,y1]=r.box;for(let x=x0;x<=x1;x++)for(let y=y1;y>=y0;y--){const p=y*W+x;if(r.mask[p]){col[p+W]=mix(col[p+W],0x0c0a08,0.6);break}}}
  drawShishi(g);drawLeaves(g,2);drawRake(g);drawMaple(g);drawLeaves(g,1);drawVeranda(g);drawRain(g);
  if(lamp>0.1){K.glow(lx,ly,9,0xffb050,0.45*lamp)}
}
function drawShishi(g){const sh=g.shishi;// pivot between two posts, pipe tips toward the basin
  const px=70,py=76,a=0.32+sh.a;const dx=Math.cos(a),dy=Math.sin(a);
  const B1=shade(0xc8b860,0.95,1,0),B2=shade(0x9a8a3a,0.6,1,0),B3=shade(0x5a4e1c,0.35,1,0),NODE=shade(0x6a5a24,0.4,1,0);
  const post=(x)=>{for(let y=py-2;y<py+12;y++){K.px(x,y,B2);K.px(x+1,y,B3)}K.px(x,py-3,B1);K.px(x+1,py-3,B1)};post(px-3);
  for(let t=-16;t<=14;t+=0.5){const x=px+dx*t,y=py+dy*t;const nd=Math.abs(((t+16)%10)-0)<0.6;K.px(x,y-1,nd?NODE:B1);K.px(x,y,nd?NODE:B2);K.px(x,y+1,B3)}
  K.px(px-16*dx,py-16*dy-1,shade(0xe8dca0,1,1,0));K.px(px-16*dx,py-16*dy,shade(0xe8dca0,1,1,0));K.px(px+14*dx,py+14*dy,B3);post(px+2);
  // feed pipe from the wall and its trickle
  for(let x=44;x<px-16;x++){K.px(x,62,B1);K.px(x,63,B2);K.px(x,64,B3)}const ex=px-17;
  for(let y=65;y<py-16*dy-1;y++)if((y+g.t)%3)K.px(ex,y,shade(0xa8d8f0,0.9,1,0));
  if(sh.st===1||sh.st===2){for(let k=0;k<6;k++)K.px(px+14*dx+K.rr(-1,2),py+14*dy+2+k,0xd0ecf8)}}
function drawLeaves(g,st){for(const l of g.leaves){if(l.st!==st)continue;const x=Math.round(l.x),y=Math.round(l.y);const c=LEAFC[l.c];const dk=mix(c,0x200808,0.4);
    if(st===2){const p=y*W+x;const lit=p>=0&&p<N&&SH[p]?0.55:1;for(const [i,j] of LEAF)K.px(x+i,y+j,shade(j>0?dk:c,0.9,lit,0));K.px(x,y+2,shade(0x3a1a0c,0.5,1,0))}
    else{const s=Math.sin(l.spin);if(Math.abs(s)<0.35){K.px(x,y,shade(dk,0.8,1,0));K.px(x+1,y,shade(dk,0.8,1,0))}else for(const [i,j] of LEAF)K.px(x+i*(s>0?1:-1),y+j,shade(c,0.95,1,0))}}}
function drawMaple(g){const sw=g.wind*1.5;
  for(const [tx,ty] of TIPS){const s=Math.round(Math.sin(g.t*0.03+tx*0.1)*sw);for(let y=ty-11;y<=ty+11;y++)for(let x=tx-20;x<=tx+20;x++){const dx=(x-tx)/19,dy=(y-ty)/10,d=dx*dx+dy*dy;if(d>1)continue;const n=fbm(x*0.2,y*0.3,2,tx);if(n+(1-d)*0.35<0.62)continue;
    const lit=fbm(x*0.2+0.6,y*0.3-0.6,2,tx)<n-0.03;K.px(x+s,y,shade(lit?0x8a1c12:0x4a0c0a,lit?0.8:0.3,1,0))}}
  for(const t of MAPLE){const sw=t.br?0:Math.sin(g.t*0.03+t.ph)*g.wind*1.5;const x=Math.round(t.x+sw),y=Math.round(t.y);
    if(t.br){const c=shade(0x2a1a14,0.4,1,0);for(let i=0;i<t.w;i++)K.px(x,y+i,i===0?shade(0x4a3424,0.8,1,0):c)}
    else{const c=LEAFC[t.c];const top=shade(c,0.95,1,0),mid=shade(c,0.6,1,0),bot=shade(mix(c,0x1a0404,0.5),0.4,1,0);const v=(t.ph*7|0)%3;
      if(v===0){K.px(x,y,top);K.px(x+1,y,mid);K.px(x,y+1,bot)}else if(v===1){K.px(x,y-1,top);K.px(x-1,y,top);K.px(x,y,mid);K.px(x+1,y,top);K.px(x,y+1,bot)}else{K.px(x,y,top);K.px(x-1,y+1,mid);K.px(x+1,y+1,bot)}}}}
function drawRake(g){return drawRake2(g)}
function drawRake2(g){const R=g.rake;const lift=R.lift*6;const a=R.ang+Math.PI/2;const ca=Math.cos(a),sa=Math.sin(a)*FS;const cx=R.x,cy=R.y-lift;const hw=P*2.9;
  const W1=shade(0xc49a64,0.95,1,0),W2=shade(0x9a7446,0.6,1,0),W3=shade(0x5e4228,0.35,1,0);
  const L=LT.L,hyp=Math.hypot(L[0],L[1])||1,sk=hyp/Math.max(0.2,L[2]);const ssx=-L[0]/hyp*sk,ssy=L[1]/hyp*sk*FS;
  // handle: from the head toward the viewer, widening with nearness
  const hx=cx+(cx-240)*0.25+20,hy=H+40;const hl=Math.hypot(hx-cx,hy-cy);
  // shadows first (head on the gravel, offset by the sun and by the lift)
  if(R.y<GY1+4){const ox=ssx*(lift+3),oy=ssy*(lift+3)+1;for(let t=-hw;t<=hw;t+=0.5){const x=R.x+ca*t+ox,y=R.y+sa*t+oy;K.pxa(x,y,0x14100a,0.4);K.pxa(x,y+1,0x14100a,0.3)}
    for(let t=0;t<Math.min(hl,60);t+=0.7){const f=t/hl,x=R.x+(hx-cx)*f+ox+ssx*f*14,y=R.y+(hy-cy)*f*0.6+oy+ssy*f*14;if(y<GY1)K.pxa(x,y,0x14100a,0.3)}}
  for(let t=3;t<hl;t+=0.5){const f=t/hl,x=cx+(hx-cx)*f,y=cy+(hy-cy)*f;const w=3+Math.round(f*4);for(let i=0;i<w;i++)K.px(x+i-1,y,i===0?W1:i===w-1?W3:W2)}
  for(let t=-hw;t<=hw;t+=0.5){const x=cx+ca*t,y=cy+sa*t;K.px(x,y-2,W1);K.px(x,y-1,W2);K.px(x,y,W2);K.px(x,y+1,W3)}
  K.px(cx+ca*-hw,cy+sa*-hw-1,W3);K.px(cx+ca*hw,cy+sa*hw-1,W3);
  for(let k=-2;k<=2;k++){const t=k*P;const x=cx+ca*t,y=cy+sa*t;K.px(x,y+2,W2);K.px(x,y+3,W3);if(R.lift>0.5)K.px(x,y+4,W3)}}
function drawRakeOld(g){const R=g.rake;const lift=R.lift*5;const a=R.ang+Math.PI/2;const cx=R.x,cy=R.y-lift;const hw=P*2.6;
  // handle runs toward the viewer, out past the bottom of the frame
  const hx=cx+Math.cos(R.ang+Math.PI)*0+(cx<240?-30:30)*0.3,hy=H+30;
  const wood=shade(0xb08a58,0.8,1,0),woodD=shade(0x7a5a34,0.5,1,0);
  // shadow of the head on the gravel
  if(R.y<GY1){for(let t=-hw;t<=hw;t+=0.5){const x=R.x+Math.cos(a)*t,y=R.y+Math.sin(a)*t*FS+2;K.pxa(x+2,y,0x1a1610,0.35)}}
  const hl=Math.hypot(hx-cx,hy-cy);for(let t=4;t<hl;t+=0.5){const x=cx+(hx-cx)*t/hl,y=cy+(hy-cy)*t/hl;K.px(x,y,wood);K.px(x+1,y,woodD)}
  for(let t=-hw;t<=hw;t+=0.5){const x=cx+Math.cos(a)*t,y=cy+Math.sin(a)*t*FS;K.px(x,y-1,wood);K.px(x,y,woodD)}
  for(let k=-2;k<=2;k++){const t=k*P;const x=cx+Math.cos(a)*t,y=cy+Math.sin(a)*t*FS;K.px(x,y+1,woodD);K.px(x,y+2,shade(0x5a4024,0.5,1,0))}}
function drawVeranda(g){// tea: a cup and a small plate of sweets on the boards
  const c1=shade(0x4a5a5a,0.8,1,0),c2=shade(0x2e3a3a,0.5,1,0),rim=shade(0xd8d0bc,0.9,1,0);
  K.rect(424,246,13,9,c1);K.rect(424,246,4,9,shade(0x5e7070,0.9,1,0));K.rect(433,246,4,9,c2);K.rect(424,245,13,1,rim);K.rect(425,246,11,1,shade(0x5a7a3a,0.6,1,0));K.rect(425,255,11,1,c2);
  for(let i=0;i<14;i++)K.pxa(423+i,257,0x1a1008,0.4);
  K.rect(446,252,20,3,shade(0xd8d4c8,0.9,1,0));K.rect(447,255,18,1,shade(0x8a8478,0.5,1,0));K.rect(450,249,6,4,shade(0xe8a0b0,0.9,1,0));K.rect(457,249,6,4,shade(0x9ab86a,0.9,1,0));
  K.rect(450,249,6,1,shade(0xf8c8d0,1,1,0));K.rect(457,249,6,1,shade(0xc0d890,1,1,0));
  for(const s of g.steam){const a=0.35*Math.sin(Math.PI*s.t/110);K.pxa(s.x,s.y,0xffffff,a);if(s.t>30)K.pxa(s.x+1,s.y,0xffffff,a*0.6)}}
function drawRain(g){if(g.rain<0.02)return;const c=LT.night>0.5?0x9aaac8:0xe8eef4;for(const d of g.drops){for(let k=0;k<6;k++)K.pxa(d.x-k*0.15,d.y-k,c,0.55-k*0.07)}
  for(const s of g.splash||[]){const r=s.t>>1;K.pxa(s.x-r-1,s.y,c,0.5);K.pxa(s.x+r+1,s.y,c,0.5)}}
// ---------------- autoplay: a ghost hand rakes long strokes and rings rocks ----------------
function path(pts,steps){const out=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    for(let k=0;k<steps;k++){const t=k/steps,t2=t*t,t3=t2*t;out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}out.push(pts[pts.length-1]);return out}
const SCRIPT=[
  {stroke:[[10,212],[80,214],[160,216],[240,214],[330,214],[420,214],[475,212]],sp:26},
  {stroke:[[475,100],[420,96],[360,104],[300,128],[250,132],[220,110],[230,86],[290,80],[350,84]],sp:22},
  {tap:ROCKS[2]},
  {stroke:[[12,120],[50,118],[80,134],[90,170],[60,186],[20,184]],sp:22},
  {tap:ROCKS[0]},
  {stroke:[[230,196],[260,180],[250,160],[226,152],[214,170],[232,198],[268,202],[290,200]],sp:20},
  {tap:ROCKS[3]},
  {stroke:[[470,140],[440,150],[430,170],[455,190],[470,200]],sp:22}];
function ai(g){const A=g.ai;A.t++;
  if(!A.cur){const s=SCRIPT[A.i%SCRIPT.length];A.i++;if(s.stroke){A.cur={pts:path(s.stroke,s.sp),k:0,ph:'go'}}else A.cur={tap:s.tap,k:0,ph:'go'};
    if(A.i%5===0&&g.todMode<0){}}
  const C=A.cur;let tx,ty,down=false,click=false;
  if(C.pts){const st=C.pts[0];if(C.ph==='go'){tx=st[0];ty=st[1];const d=Math.hypot(g.rake.x-tx,g.rake.y-ty);if(d<2){C.ph='rake';C.k=0}}
    else if(C.ph==='rake'){C.k+=0.5;const i=Math.min(C.pts.length-1,Math.floor(C.k));tx=C.pts[i][0];ty=C.pts[i][1];down=true;if(C.k===0.5)click=true;if(i>=C.pts.length-1){C.ph='rest';C.k=0}}
    else{tx=g.rake.x;ty=g.rake.y-1;if(++C.k>50)A.cur=null}}
  else{const r=C.tap;tx=r.cx;ty=r.cy-6;C.k++;if(C.k>40&&C.k<44){down=true;click=C.k===41}if(C.k>44&&!g.ringAnim&&C.k>60){if(C.k>130)A.cur=null}}
  return{x:0,y:0,mouse:{x:tx,y:ty,down,click}}}
function info(g){const n=['清晨','正午','黄昏','夜'][Math.floor(g.tod+0.45)%4];return '枯山水 · '+n+(g.rainOn?' · 雨':'')}
function flat(){for(let p=GY0*W;p<GY1*W;p++)if(MAT[p]===2)GH[p]=0.55+(hash(p,7)-0.5)*0.08}
return{init,tick,draw,ai,info,flat}})();
GAMES.push({id:'zen',name:'枯山水',ref:'按住拖动耙白砂 · 点石头画同心圆',keys:'按住拖动：耙出沙纹 · 轻点石头：绕石画圈 · 下面的按钮换时辰、下雨',noHand:true,thumbAt:900,
  init:ZEN.init,tick:ZEN.tick,draw:ZEN.draw,ai:ZEN.ai,info:ZEN.info,
  opts:[{label:g=>'时辰：'+(g.todMode<0?'流转':['清晨','正午','黄昏','夜'][g.todMode]),get:g=>g.todMode>=0,set:g=>{g.todMode=g.todMode>=3?-1:g.todMode+1;if(g.todMode===0)g.tod=Math.floor(g.tod)+0.9}},
    {label:g=>g.rainOn?'雨：下着':'雨：停',get:g=>g.rainOn,set:g=>{g.rainOn=!g.rainOn}},
    {label:'抹平重耙',set:g=>{ZEN.flat()}}],
  about:['从寺院的檐廊往外看：土墙、瓦顶、石灯笼、竹筒添水，一片白砂和五块石头。按住画面拖动，耙子就跟着你的手在白砂上走，五根耙齿犁出五道沟，沟顺着你的笔画转弯。轻点一块石头，耙子会绕着它画出一圈圈同心纹。','白砂是一张高度图，每个像素每帧按自己的坡度重新受光：朝着太阳的砂脊亮，背阴的沟暗，所以同一道纹在清晨、正午、黄昏看起来都不一样，到夜里只剩石灯笼照亮的一小片。石头按块面打光，影子随太阳转。枫叶会落下来，耙子会把它们推开。下雨时雨点一点点把沙纹抹平，砂和石头被打湿变暗。'],
  tags:['耙齿犁出的沙纹顺着你的笔画转弯','每个像素按坡度实时受光，沙纹随时辰变化','石头的块面、苔藓、随太阳转的影子','枫叶飘落，耙子把它们推走','雨点慢慢抹平你耙的纹','竹筒添水每隔一阵敲一声']});



// ================= player: 60 Hz fixed step, hit-stop, keyboard / mouse / touch, attract-mode autoplay, bloom display =================
(function(){
const $=id=>document.getElementById(id);
const {W,H,S}=K;
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage');
const low=document.createElement('canvas');low.width=W;low.height=H;const lg=low.getContext('2d');
const half=document.createElement('canvas');half.width=W>>1;half.height=H>>1;const hg=half.getContext('2d');
const b1=document.createElement('canvas');b1.width=W;b1.height=H;const b1g=b1.getContext('2d');
const b2=document.createElement('canvas');b2.width=W>>1;b2.height=H>>1;const b2g=b2.getContext('2d');
const FILT=(()=>{try{const c=document.createElement('canvas');c.width=c.height=9;const g=c.getContext('2d');g.filter='blur(2px)';g.fillStyle='#fff';g.fillRect(4,4,1,1);return g.getImageData(1,4,1,1).data[3]>0}catch(e){return false}})();
const mips=[[120,68],[60,34],[30,17]].map(([w,h])=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c});
let skip=false,slow=false,avg=8,cur=0,G=null,paused=false,acc=0,last=performance.now(),visible=true,mode='auto',idle=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const keys=new Set(),pressed=new Set();
// mouse / touch: pointer position in game pixels; click = a press this step; stick = the floating joystick for touch play
const mouse={x:W/2,y:H/2,down:false,active:false,click:false,touch:false};
const stick={id:null,ox:0,oy:0,x:0,y:0};
function newGame(d){K.setSeed((Date.now()&0xffff)+cur*77);S.flash=0;S.fade=0;S.frame=0;S.bloomK=1;K.bedsOff();
  const g={t:0,stop:0,ts:1,d,auto:mode==='auto'};d.init(g);return g}
const TB={a:false,b:false,ap:false,bp:false};
function readPad(){const k=c=>keys.has(c);
  let x=(k('ArrowRight')||k('KeyD')?1:0)-(k('ArrowLeft')||k('KeyA')?1:0),y=(k('ArrowDown')||k('KeyS')?1:0)-(k('ArrowUp')||k('KeyW')?1:0);
  if(stick.id!=null){const m=Math.hypot(stick.x,stick.y);if(m>3){const s=Math.min(1,(m-3)/18);x=stick.x/m*s;y=stick.y/m*s}}
  const pad={x,y,
    up:pressed.has('ArrowUp')||pressed.has('KeyW'),down:pressed.has('ArrowDown')||pressed.has('KeyS'),left:pressed.has('ArrowLeft')||pressed.has('KeyA'),right:pressed.has('ArrowRight')||pressed.has('KeyD'),
    fire:k('KeyJ')||k('KeyZ')||k('Space')||TB.a,
    a:pressed.has('KeyJ')||pressed.has('KeyZ')||pressed.has('Space')||pressed.has('Enter')||TB.ap,
    b:pressed.has('KeyK')||pressed.has('KeyX')||pressed.has('Escape')||TB.bp,
    hl:k('ArrowLeft')||k('KeyA')||k('KeyZ')||k('ShiftLeft')||TB.a,hr:k('ArrowRight')||k('KeyD')||k('KeyJ')||k('Slash')||k('ShiftRight')||TB.b,hd:k('ArrowDown')||k('KeyS')||k('Space'),
    bh:k('KeyK')||k('KeyX')||TB.b,
    stick:stick.id!=null,
    mouse:mouse.active?{x:mouse.x,y:mouse.y,down:mouse.down,click:mouse.click,touch:mouse.touch}:null};
  pressed.clear();mouse.click=false;TB.ap=TB.bp=false;return pad}
const HAND=K.spr(['.kk.......','kwwk......','kwwk......','kwwkkk....','kwwkwwkk..','kwwkwwkwkk','kwwwwwwwwk','kwwwwwwwwk','.kwwwwwwk.','..kwwwwk..','..kwwwwk..'],{k:0x1a1418,w:0xf4ecdc});
const HANDD=K.spr(['..........','..........','.kk.......','kwwkkkkk..','kwwkwwkwkk','kwwwwwwwwk','kwwwwwwwwk','kwwwwwwwwk','.kwwwwwwk.','..kwwwwk..','..kwwwwk..'],{k:0x1a1418,w:0xf4ecdc});
function drawHand(){if(!G||G.d.noHand||G.thumb)return;let m=null;if(mode==='play'){if(mouse.active&&!mouse.touch)m={x:mouse.x,y:mouse.y,down:mouse.down}}else m=G._hand;if(!m)return;
  const s=m.down?HANDD:HAND;const st=G.d.handStyle;K.blit(s,Math.round(m.x)-2,Math.round(m.y)-(m.down?2:0))}
function step(){const d=G.d;
  if(G.stop>0){G.stop--;S.frame++;return}
  let pad;
  if(mode==='play'){pad=readPad();const any=pad.x||pad.y||pad.fire||pad.a||pad.b||(pad.mouse&&(pad.mouse.down||pad.mouse.click));if(!any)idle++;else idle=0;
    if(idle>60*40&&(!d.canAttract||d.canAttract(G))){setMode('auto');if(d.onAuto)d.onAuto(G)}}
  else{pressed.clear();mouse.click=false;pad=d.ai(G);G._hand=pad.mouse||null}
  d.tick(G,pad);G.t++;S.frame++;if(S.flash>0){S.flash*=0.86;if(S.flash<0.02)S.flash=0}}
function frame(){G.d.draw(G);drawHand();S.raw=false;K.present();lg.putImageData(S.img,0,0);
  ctx.imageSmoothingEnabled=false;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.drawImage(low,0,0,cv.width,cv.height);
  hg.putImageData(S.bimg,0,0);ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=true;
  if(FILT){b1g.clearRect(0,0,W,H);b1g.filter='blur(2px)';b1g.drawImage(half,0,0,W,H);b1g.filter='none';
    b2g.clearRect(0,0,W>>1,H>>1);b2g.filter='blur(7px)';b2g.drawImage(half,0,0);b2g.filter='none';
    ctx.globalAlpha=0.8;ctx.drawImage(b1,0,0,cv.width,cv.height);ctx.globalAlpha=0.9;ctx.drawImage(b2,0,0,cv.width,cv.height);ctx.globalAlpha=1}
  else{let src=half;const al=[0.6,0.7,0.8];mips.forEach((m,i)=>{const g=m.getContext('2d');g.imageSmoothingEnabled=true;g.clearRect(0,0,m.width,m.height);g.drawImage(src,0,0,m.width,m.height);src=m;ctx.globalAlpha=al[i];ctx.drawImage(m,0,0,cv.width,cv.height)});ctx.globalAlpha=1}
  ctx.globalCompositeOperation='source-over';syncInfo()}
function fit(){const aw=stage.clientWidth-2,ah=Math.max(200,innerHeight*0.74);let sc=Math.min(aw/W,ah/H);const dpr=devicePixelRatio||1;
  const css=sc>=2?Math.floor(sc*dpr)/dpr:Math.max(0.5,sc);const dev=Math.max(1,Math.min(4,Math.round(css*dpr)));if(cv.width!==W*dev){cv.width=W*dev;cv.height=H*dev}
  cv.style.width=Math.floor(W*css)+'px';cv.style.height=Math.floor(H*css)+'px'}
let infoLast='';function syncInfo(){const d=G.d;const s=(d.info?d.info(G):'')+(mode==='play'?'':' · 自己在动');if(s!==infoLast){$('info').textContent=s;infoLast=s}}
// ---------------- controls ----------------
const rail=$('rail');
function seg(label,opts,get,set){const l=document.createElement('span');l.className='lab';l.textContent=label;const s=document.createElement('div');s.className='seg';
  for(const[v,t]of opts){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{set(v);sync()};b.dataset.v=v;s.appendChild(b)}
  const sync=()=>{for(const b of s.children)b.classList.toggle('on',String(b.dataset.v)===String(get()))};rail.append(l,s);sync();return sync}
const btn=(t,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;b.onclick=fn;rail.appendChild(b);return b};
const syncMode=seg('',[['play','亲手摸'],['auto','自己动']],()=>mode,v=>{wake();setMode(v);cv.focus()});
const playB=btn('暂停',()=>setPaused(!paused));
btn('重来',()=>{G=newGame(GAMES[cur]);frame();cv.focus()});
let sndUser=false;
const sndB=btn('声音 开',()=>{K.sndInit();sndUser=true;K.SND.on=!K.SND.on;syncSnd();if(K.SND.ctx&&K.SND.ctx.state==='suspended')K.SND.ctx.resume();if(!K.SND.on)K.bedsOff()});
function syncSnd(){const on=K.SND.on||!sndUser;sndB.textContent=on?'声音 开':'声音 关';sndB.classList.toggle('on',on)}
// sound comes on with the first key or touch (browsers need a gesture), unless the player turned it off
function wake(){if(sndUser)return;K.sndInit();if(K.SND.ctx){K.SND.on=true;if(K.SND.ctx.state==='suspended')K.SND.ctx.resume()}syncSnd()}
const optBox=document.createElement('span');optBox.className='opts';rail.appendChild(optBox);
function buildOpts(){optBox.innerHTML='';const d=GAMES[cur];for(const o of d.opts||[]){const b=document.createElement('button');b.type='button';b.className='btn';b.onclick=()=>{wake();o.set(G);syncOpts();cv.focus()};b._o=o;optBox.appendChild(b)}syncOpts()}
function syncOpts(){for(const b of optBox.children){const o=b._o;const v=o.get?o.get(G):null;b.textContent=typeof o.label==='function'?o.label(G):o.label;b.classList.toggle('on',!!v)}}
setInterval(()=>{if(G)syncOpts()},500);
const info=document.createElement('span');info.id='info';rail.appendChild(info);
function setMode(m){mode=m;idle=0;syncMode();$('hint').textContent=m==='play'?(GAMES[cur].keys||''):'它在自己动 · 把手放上画面就换成你';if(G)G.auto=m==='auto';touchUI()}
function setPaused(p){paused=p;playB.textContent=p?'继续':'暂停'}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const gameKey=/^(Arrow|Key[WASDJKZX]|Space|Enter|Escape)/.test(e.code);
  if(e.code==='KeyP'){setPaused(!paused);return}
  if(gameKey&&(e.code==='Space'||e.code==='Enter')&&document.activeElement&&document.activeElement.tagName==='BUTTON')return;
  if(gameKey){wake();if(paused)setPaused(false);if(mode!=='play'){setMode('play')}if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);e.preventDefault()}});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();if(mode==='play'&&G&&G.d.onBlur)G.d.onBlur(G)});
function cpos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
const coarse=matchMedia('(pointer: coarse)').matches;
let hov=0;cv.addEventListener('pointermove',e=>{const p=cpos(e);if(e.pointerId===stick.id){stick.x=p[0]-stick.ox;stick.y=p[1]-stick.oy}if(mode!=='play'){if(e.pointerType==='mouse'&&GAMES[cur].hover&&++hov>40){hov=0;setMode('play')}else return}mouse.x=p[0];mouse.y=p[1];mouse.active=true;mouse.touch=e.pointerType!=='mouse'});
cv.addEventListener('pointerdown',e=>{cv.focus();wake();const p=cpos(e);e.preventDefault();
  if(mode!=='play'){setMode('play')}
  // touch on a stick game: a touch anywhere starts a floating joystick; the game may also read it as a tap
  if(e.pointerType!=='mouse'&&G.d.touch==='stick'){stick.id=e.pointerId;stick.ox=p[0];stick.oy=p[1];stick.x=stick.y=0}
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  mouse.x=p[0];mouse.y=p[1];mouse.active=true;mouse.down=true;mouse.click=true;mouse.touch=e.pointerType!=='mouse'});
addEventListener('pointerup',e=>{if(e.pointerId===stick.id){stick.id=null;stick.x=stick.y=0}mouse.down=false});
addEventListener('pointercancel',e=>{if(e.pointerId===stick.id){stick.id=null;stick.x=stick.y=0}mouse.down=false});
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')mouse.active=false});
// touch buttons (A / B) for games that want them
const tb=$('tbtn');
function tbtn(lbl,k){const b=document.createElement('button');b.type='button';b.textContent=lbl;
  b.addEventListener('pointerdown',e=>{e.preventDefault();wake();if(mode!=='play'){setMode('play')}TB[k]=true;TB[k+'p']=true});
  const up=()=>{TB[k]=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);tb.appendChild(b);return b}
const tA=tbtn('A','a'),tB=tbtn('B','b');
function touchUI(){const d=GAMES[cur];const show=coarse&&d.tbtn&&mode==='play';tb.style.display=show?'flex':'none';if(show){tA.textContent=d.tbtn[0];tB.textContent=d.tbtn[1]||'B';tB.style.display=d.tbtn[1]?'':'none'}}
// ---------------- cartridges ----------------
const carts=$('carts');
function select(i){cur=i;const d=GAMES[i];mode='auto';G=newGame(d);$('nm').textContent=d.name;$('about').innerHTML=d.about.map(p=>'<p>'+p+'</p>').join('');$('tags').innerHTML=d.tags.map(t=>'<li>'+t+'</li>').join('');
  for(const[k,c]of [...carts.children].entries())c.classList.toggle('on',k===i);buildOpts();setMode(mode);try{history.replaceState(null,'','#'+d.id)}catch(e){}frame()}
GAMES.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='cart';const c=document.createElement('canvas');c.width=W;c.height=H;
  const nm=document.createElement('span');nm.className='nm';nm.textContent=d.name;const rf=document.createElement('span');rf.className='ref';rf.textContent=d.ref;b.append(c,nm,rf);
  b.onclick=()=>{select(i);stage.scrollIntoView({block:'nearest',behavior:'smooth'})};carts.appendChild(b);d._thumb=c});
// thumbnails are simulated one per task after the page is up, so it opens at once; the game being played just lends its live frame
function thumb(d){const keep=[cur,G];cur=GAMES.indexOf(d);G=newGame(d);G.auto=true;G.thumb=true;for(let k=0;k<(d.thumbAt||300);k++){const pad=d.ai(G);if(G.stop>0)G.stop--;else{d.tick(G,pad);G.t++}S.frame++;if(d.thumbUntil&&d.thumbUntil(G))break}d.draw(G);S.raw=false;K.present();
  const g=d._thumb.getContext('2d');g.putImageData(S.img,0,0);cur=keep[0];G=keep[1]}
function thumbs(){const q=GAMES.slice();const one=()=>{const d=q.shift();if(!d)return;thumb(d);setTimeout(one,30)};setTimeout(one,200)}
new ResizeObserver(()=>{fit();if(G)frame()}).observe(stage);
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play'&&G&&G.d.onBlur)G.d.onBlur(G)});
const start=Math.max(0,GAMES.findIndex(d=>'#'+d.id===location.hash));
fit();select(start);thumbs();if(reduce)setPaused(true);syncSnd();
function loop(now){const dt=Math.min(0.1,(now-last)/1000);last=now;
  if(!paused&&visible){acc+=dt*60*(G.ts||1);let n=0;while(acc>=1&&n<5){step();acc-=1;n++}skip=!skip;if(n&&(!slow||!skip)){const t0=performance.now();frame();const ft=performance.now()-t0;avg=avg*0.95+ft*0.05;slow=avg>14}}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.__TT={step:()=>step(),frame,select,get G(){return G},setMode:m=>{setMode(m);G=newGame(GAMES[cur])},press:c=>{pressed.add(c)},hold:(c,on)=>{on?keys.add(c):keys.delete(c)},mouse};
})();

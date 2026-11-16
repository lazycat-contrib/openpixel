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



// ================= 霜窗: a frosted window on a snow night =================
// Inside a dark room, a six-pane wooden window is covered in frost. Outside, a gassho-zukuri village sits in snow at the
// blue hour, every window lit. Your fingertip melts the frost; the meltwater gathers into drops that run down the glass
// and leave clear trails. Frost does not stay away: feather crystals grow back from the edges of what you cleared,
// branch at sixty degrees and close over your drawing. Breath fogs the glass; the steam from the mug fogs it too.
const FROST=(function(){const {W,H,S,mix,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const GX0=48,GX1=432,GY0=22,GY1=218;// glass area (inside the frame)
const MX=[173,307],MY=120,MW=4;// muntins
const GL=new Uint8Array(N);// 1 = glass
const F=new Float32Array(N);// frost crystal density
const HZ=new Float32Array(N);// fog film
const WT=new Float32Array(N),HZ0=new Float32Array(N),CLR=new Uint8Array(N);// wetness (fresh melt)
const OUT=new Uint32Array(N),OUTE=new Uint8Array(N);// the village (static base) and its emissive mask
const ROOM=new Uint32Array(N);// frame, wall, sill (unlit albedo); MATR: 1 wood frame, 2 wall, 3 sill
const MATR=new Uint8Array(N);
let built=false;const HOUSES=[],WINS=[];
function inGlass(x,y){return x>=GX0&&x<GX1&&y>=GY0&&y<GY1&&!(x>=MX[0]-MW/2&&x<MX[0]+MW/2)&&!(x>=MX[1]-MW/2&&x<MX[1]+MW/2)&&!(y>=MY-MW/2&&y<MY+MW/2)}
// ---------------- the village outside ----------------
const SKY=K.ramp('#0a1430 #0f1c3e #15264c #1d325c #27406c #33507c #44628c #5a769c #7690b0');
function o(x,y,c,e){if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;OUT[p]=c;OUTE[p]=e||0}
function tri(cx,by,hw,h,fn){for(let j=0;j<=h;j++){const y=Math.round(by-h+j);const w=hw*j/h;for(let x=Math.round(cx-w);x<=Math.round(cx+w);x++)fn(x,y,(x-cx)/Math.max(1,w),j/h)}}
function buildOut(){
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=clamp((y-10)/115,0,1);o(x,y,SKY[Math.min(8,Math.floor(t*t*9+t*0.4))])}
  K.setSeed(77);for(let i=0;i<70;i++){const x=K.ri(0,W-1),y=K.ri(0,80);o(x,y,K.rnd()<0.3?0xe8eeff:0x8a9ac0)}
  // moon with a soft ring
  const mx=372,my=48;for(let y=-16;y<=16;y++)for(let x=-16;x<=16;x++){const d=Math.hypot(x,y);const p=(my+y)*W+mx+x;if(d<8.5){o(mx+x,my+y,fbm((mx+x)*0.5,(my+y)*0.5,2,5)>0.58?0xd8d0b0:0xf4eed4,200)}else if(d<15)OUT[p]=mix(OUT[p],0x6a80a8,d<11?0.35:0.18)}
  // far mountains: snowfields lit from the moon side (right), forest bands
  const ridge=x=>98+Math.round(14*fbm(x*0.012,0,4,11)-10*Math.sin(x*0.009+1)+Math.abs(Math.sin(x*0.02))*4);
  for(let x=0;x<W;x++){const r=ridge(x);const sl=ridge(x+2)-ridge(x-2);for(let y=r;y<150;y++){const dd=y-r;let c=sl<0?0xb6c6dc:0x8496b4;if(dd>16+fbm(x*0.08,0,2,4)*10)c=hash(x>>1,y>>1)<0.3?0x2e3c56:0x26324a;else if(fbm(x*0.15,y*0.2,2,3)>0.66)c=0x6a7c9a;o(x,y,c)}}
  // valley snow, gently rolling, with blue hollows
  for(let y=128;y<H;y++)for(let x=0;x<W;x++){const v=fbm(x*0.01,y*0.03,3,21);const g=y+v*16;if(g<136)continue;let c=v>0.55?0xc6d4e8:v>0.42?0xaabbd4:0x8ea2c2;if(hash(x,y)<0.004)c=0xffffff;o(x,y,c)}
  // a winding path
  for(let y=150;y<H;y++){const cx=250+Math.sin(y*0.05)*30+(y-150)*0.6;const w=2+(y-150)*0.12;for(let x=Math.round(cx-w);x<=cx+w;x++)o(x,y,mix(0x8a98b4,0x6e7c98,hash(x,y)*0.5))}
  // cedar groves behind the houses
  const cedar=(cx,by,h)=>{tri(cx,by,h*0.24,h,(x,y,u,v)=>{let c=u<-0.2?0x1c2a2a:0x14201e;if((Math.round(v*h)%5===0)&&u<0.4&&hash(x,y)<0.75)c=u<0?0xa8bad4:0x8a9cb8;o(x,y,c)});for(let y=by;y<by+3;y++)o(cx,y,0x1a1410)};
  K.setSeed(31);for(let i=0;i<46;i++){const x=K.ri(0,W),by=K.ri(128,150);cedar(x,by,K.ri(16,30))}
  // houses (gassho-zukuri), back to front
  const HS=[[230,142,0.5],[318,146,0.58],[150,150,0.7],[395,152,0.8],[86,166,1.0],[205,172,1.1],[300,178,1.25],[436,176,1.05],[30,192,1.2]];
  for(const [cx,by,s] of HS){house(cx,by,s)}
  for(let i=0;i<14;i++){const x=K.ri(0,W),by=K.ri(185,215);cedar(x,by,K.ri(26,40))}
}
function house(cx,by,s){const h=Math.round(46*s),hw=Math.round(27*s),sn=Math.max(2,Math.round(4*s));const top=by-h;
  // snow-covered roof (two visible slopes seen gable-on), thatch edge at the eaves, wood gable face with little windows
  tri(cx,by,hw+sn,h+sn,(x,y,u)=>{let c=u<0?0xd6e2f0:0xaebfd8;if(Math.abs(u)>0.94)c=u<0?0xc0cee2:0x96a8c4;o(x,y,c)});
  const gh=h-sn*2,ghw=hw-sn*1.5;tri(cx,by,ghw,gh,(x,y,u,v)=>{let c=v<0.08?0x2a1e18:0x3a2a1e;if((x-cx+40)%Math.max(3,Math.round(6*s))===0)c=0x2c2018;o(x,y,c)});
  // thatch eave band
  for(let x=Math.round(cx-hw-sn);x<=cx+hw+sn;x++){for(let k=0;k<Math.max(2,Math.round(3*s));k++)o(x,by-k,k===0?0x2a2018:0x5a4632)}
  // gable windows: rows of small lit squares
  const rows=Math.max(1,Math.round(3*s));const ws=Math.max(2,Math.round(3*s));
  for(let r=0;r<rows;r++){const yy=Math.round(by-gh*0.25-r*gh*0.24);const half=ghw*(1-(by-yy)/gh)*0.8;const n=Math.max(1,Math.floor(half*2/(ws*2)));
    for(let k=0;k<n;k++){const x=Math.round(cx-half+((k+0.5)/n)*half*2-ws/2);WINS.push({x,y:yy-ws,w:ws,h:ws,on:K.rnd()<0.75,ph:K.rnd()*100,big:0})}}
  // ground floor: lit shoji band below the eaves, snow drift in front
  const fy=by+1,fh=Math.max(4,Math.round(8*s)),fw=Math.round(hw*0.9);for(let y=fy;y<fy+fh;y++)for(let x=cx-fw;x<=cx+fw;x++)o(x,y,0x2a1e16);
  WINS.push({x:cx-fw+2,y:fy+1,w:fw*2-3,h:fh-2,on:K.rnd()<0.85,ph:K.rnd()*100,big:1,lat:Math.max(2,Math.round(4*s))});
  for(let x=cx-fw-6;x<=cx+fw+6;x++){const d=Math.round(2+Math.sin((x-cx)*0.3)*1+s*2);for(let k=0;k<d;k++)o(x,fy+fh-k,0xd0dcec)}
  HOUSES.push({cx,by:fy+fh,s,fw})}
// ---------------- the room: frame, wall, sill ----------------
function buildRoom(){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;
    if(inGlass(x,y)){GL[p]=1;continue}
    const inFrame=x>=GX0-10&&x<GX1+10&&y>=GY0-10&&y<GY1+8;
    if(y>=226&&y<246&&x>=20&&x<460){MATR[p]=3;const yy=y-226;let c=mix(0x6a4a30,0x5a3c26,fbm(x*0.04,y*0.5,3,8));if(yy===0)c=0xa07a52;if(yy===1)c=0x8a6440;if(yy===13)c=0x2a1a10;if(yy>13)c=0x4a3020;ROOM[p]=c}
    else if(inFrame){MATR[p]=1;let c=mix(0x5a3e28,0x4a321e,fbm(x*0.03,y*0.4,3,9));
      // bevels: light on the edge facing the glass top-left
      const nearG=inGlass(x+1,y)||inGlass(x,y+1),nearG2=inGlass(x-1,y)||inGlass(x,y-1);if(nearG)c=0x2a1c12;if(nearG2)c=0x7a583a;
      if(x===GX0-10||y===GY0-10)c=0x2a1c12;if(x===GX0-9||y===GY0-9)c=0x8a6644;ROOM[p]=c}
    else{MATR[p]=2;ROOM[p]=mix(0x3a3430,0x2e2824,fbm(x*0.02,y*0.02,3,12))}}
  // the sill's front edge casts a dark line on the wall below
}
function build(){if(built)return;built=true;buildOut();buildRoom()}
// ---------------- frost growth ----------------
const TIPS=[];const A60=Math.PI/3;
function spawn(x,y,a,gen,life){if(TIPS.length<420)TIPS.push({x,y,a,gen,life,side:K.rnd()<0.5?1:-1,k:0})}
function seedEdge(n){for(let i=0;i<n;i++){const e=K.ri(0,3);let x,y,a;// from the frame and muntins; mostly bottom corners
    if(e===0){x=K.rr(GX0,GX1);y=GY1-1;a=-Math.PI/2+K.rr(-0.6,0.6)}else if(e===1){x=GX0;y=K.rr(GY0,GY1);a=K.rr(-0.6,0.6)}else if(e===2){x=GX1-1;y=K.rr(GY0,GY1);a=Math.PI+K.rr(-0.6,0.6)}else{x=K.rr(GX0,GX1);y=GY0;a=Math.PI/2+K.rr(-0.6,0.6)}
    spawn(x,y,a,0,K.rr(30,90))}}
function growStep(g){for(let i=TIPS.length-1;i>=0;i--){const t=TIPS[i];t.a+=K.rr(-0.06,0.06);const nx=t.x+Math.cos(t.a)*0.8,ny=t.y+Math.sin(t.a)*0.8;const X=Math.round(nx),Y=Math.round(ny);
    if(X<0||Y<0||X>=W||Y>=H||!GL[Y*W+X]){TIPS.splice(i,1);continue}
    const p=Y*W+X;const ahead=Math.round(nx+Math.cos(t.a)*1.6),aheadY=Math.round(ny+Math.sin(t.a)*1.6);const pa=aheadY*W+ahead;
    if(t.k>3&&pa>=0&&pa<N&&F[pa]>0.55&&(X!==Math.round(t.x)||Y!==Math.round(t.y))){TIPS.splice(i,1);continue}
    t.x=nx;t.y=ny;t.k++;F[p]=Math.max(F[p],t.gen===0?1:t.gen===1?0.85:0.65);if(t.gen===0&&K.rnd()<0.5){const q=p+(Math.abs(Math.cos(t.a))>0.7?W:1);if(GL[q])F[q]=Math.max(F[q],0.5)}
    HZ[p]=Math.max(HZ[p],0.25);WT[p]=0;CLR[p]=0;
    // side branches alternate at sixty degrees: feathery fronds
    if(t.gen<3&&t.k>2&&K.rnd()<(t.gen===0?0.42:t.gen===1?0.28:0.1)){t.side=-t.side;spawn(t.x,t.y,t.a+t.side*A60*K.rr(0.85,1.1),t.gen+1,t.life*(t.gen===0?0.32:0.4)*K.rr(0.6,1.2))}
    if(--t.life<=0)TIPS.splice(i,1)}}
// regrowth: frost at the edge of a clearing sends new fronds into it
let clrN=0;const CL=[];
function regrow(g,n){if(!CL.length)return;for(let k=0;k<n;k++){const q=CL[K.ri(0,CL.length-1)];if(!CLR[q])continue;const x0=q%W,y0=(q/W)|0;
    // walk outward from a cleared pixel to the nearest frost, then send a frond back in
    const a=K.rnd()*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);for(let r=1;r<14;r++){const X=Math.round(x0+dx*r),Y=Math.round(y0+dy*r);const p=Y*W+X;if(p<0||p>=N||!GL[p])break;if(F[p]>0.6){spawn(X,Y,a+Math.PI+K.rr(-0.35,0.35),K.rnd()<0.3?1:2,K.rr(8,22));break}}}
  if(g.t%60===0){let j=0;for(let i=0;i<CL.length;i++)if(CLR[CL[i]])CL[j++]=CL[i];CL.length=j}}
// ---------------- state ----------------
function init(g){build();F.fill(0);HZ.fill(0);WT.fill(0);TIPS.length=0;K.setSeed(1234);
  CLR.fill(0);CL.length=0;for(let p=0;p<N;p++)if(GL[p]){const x=p%W,y=(p/W)|0;const e=Math.min(x-GX0,GX1-x,(GY1-y)*1.4,(y-GY0)*2)/90;HZ[p]=HZ0[p]=clamp(1-Math.min(1,e)*0.25+(fbm(x*0.02,y*0.03,3,2)-0.5)*0.35,0.62,1)}
  seedEdge(120);for(let s=0;s<900;s++){growStep(g);if(s%30===0)seedEdge(10)}
  g.drops=[];g.snow=[];g.prev=null;g.walker={x:-20,t:0};g.ai={i:0,cur:null};g.breath=[];g.grow=1;g.wind=0;g.steam=[];g.squeak=0;g.cand=1;
  for(let i=0;i<260;i++)g.snow.push(flake(true))}
function flake(any){const z=K.rnd();return{x:K.rr(0,W),y:any?K.rr(0,H):K.rr(-20,-2),z,v:0.25+z*0.8,ph:K.rnd()*6}}
function melt(g,x,y,r,k){let wsum=0;for(let j=-r-1;j<=r+1;j++)for(let i=-r-1;i<=r+1;i++){const X=Math.round(x+i),Y=Math.round(y+j);if(X<0||Y<0||X>=W||Y>=H)continue;const p=Y*W+X;if(!GL[p])continue;
    const d=Math.hypot(i,j*1.05);if(d>r+0.8)continue;const f=d<r-0.8?1:clamp(r+0.8-d,0,1)*0.6;if(!CLR[p]){CLR[p]=1;CL.push(p)}const was=F[p]+HZ[p]*0.5;F[p]*=1-f*k;HZ[p]*=1-f*k;wsum+=Math.max(0,was-F[p]-HZ[p]*0.5);WT[p]=Math.max(WT[p],f)}
  return wsum}
function tick(g,pad){const m=pad.mouse;g.wind=Math.sin(g.t*0.003)*0.6+Math.sin(g.t*0.011)*0.3;
  // fingertip
  let sp=0;if(m&&m.down){const p0=g.prev||m;const dx=m.x-p0.x,dy=m.y-p0.y;const d=Math.hypot(dx,dy);sp=d;const n=Math.max(1,Math.ceil(d/1.5));let water=0;
      for(let k=1;k<=n;k++){const x=p0.x+dx*k/n,y=p0.y+dy*k/n;water+=melt(g,x,y,3.6,0.97)}
      g.water=(g.water||0)+water;if(g.water>90&&inGlass(Math.round(m.x),Math.round(m.y+6))){g.water=0;g.drops.push({x:m.x+K.rr(-3,3),y:m.y+5,v:0,vol:K.rr(18,40),wob:K.rnd()*6})}
      g.prev={x:m.x,y:m.y}}
  else{if(g.prev&&g.water>30&&g.drops.length<40)g.drops.push({x:g.prev.x,y:g.prev.y+5,v:0,vol:g.water+10,wob:K.rnd()*6});g.prev=null;g.water=0}
  g.squeak=lerp(g.squeak,sp>0.6&&sp<5?1:0,0.3);
  // drops run down, wobble, leave clear trails, slow as they lose water, then freeze into beads
  for(let i=g.drops.length-1;i>=0;i--){const d=g.drops[i];if(d.frozen){if(++d.frozen>900)g.drops.splice(i,1);continue}
    d.v=Math.min(0.45,d.v+0.01);d.y+=d.v*(0.3+K.rnd()*0.9);d.x+=Math.sin(d.y*0.21+d.wob)*0.12;d.vol-=0.09;
    const X=Math.round(d.x),Y=Math.round(d.y);for(let k=-1;k<=1;k++){const p=Y*W+X+k;if(p>=0&&p<N&&GL[p]){F[p]*=k===0?0.2:0.7;HZ[p]*=k===0?0.4:0.8;WT[p]=Math.max(WT[p],k===0?0.9:0.5)}}
    if(d.vol<=0||!inGlass(X,Y+2)){d.frozen=1}}
  // growth and fog return; breath and steam fog the glass
  const gr=g.grow;for(let s=0;s<Math.max(1,gr);s++)growStep(g);if(gr>0&&(gr>1||g.t%3===0))regrow(g,gr>1?4:1);
  if(g.t%3===0)for(let k=0;k<1400;k++){const p=K.ri(GY0*W,GY1*W);if(GL[p]){if(HZ[p]<HZ0[p])HZ[p]=Math.min(HZ0[p],HZ[p]+0.003*gr);else if(HZ[p]>HZ0[p])HZ[p]-=0.004;WT[p]*=0.96}}
  for(let i=g.breath.length-1;i>=0;i--){const b=g.breath[i];b.t++;const r=Math.min(46,b.t*2.2);if(b.t<24)for(let k=0;k<260;k++){const a=K.rnd()*Math.PI*2,rr=Math.sqrt(K.rnd())*r;const X=Math.round(b.x+Math.cos(a)*rr),Y=Math.round(b.y+Math.sin(a)*rr*0.8);const p=Y*W+X;if(p>0&&p<N&&GL[p]){HZ[p]=Math.min(1,HZ[p]+0.08);if(!CLR[p]){CLR[p]=1;CL.push(p)}}}if(b.t>30)g.breath.splice(i,1)}
  if(g.t%10===0)g.steam.push({x:336+K.rr(-2,2),y:222,t:0,ph:K.rnd()*6});
  for(let i=g.steam.length-1;i>=0;i--){const s=g.steam[i];s.t++;s.y-=0.3;s.x+=Math.sin(s.t*0.06+s.ph)*0.25;const X=Math.round(s.x),Y=Math.round(s.y);const p=Y*W+X;if(p>0&&p<N&&GL[p]){HZ[p]=Math.min(0.9,HZ[p]+0.03);HZ[p+1]=Math.min(0.9,HZ[p+1]+0.02)}if(s.t>120)g.steam.splice(i,1)}
  // outside: snow, someone walking the path with a lantern, lights going on and off
  for(const f of g.snow){f.y+=f.v;f.x+=Math.sin(g.t*0.02+f.ph)*0.2*f.z+g.wind*(0.3+f.z*0.6);if(f.y>H+2||f.x<-6||f.x>W+6)Object.assign(f,flake(false))}
  const wk=g.walker;wk.t++;if(wk.t>2600)wk.t=0;
  if(g.t%120===0){const w=WINS[K.ri(0,WINS.length-1)];if(!w.big||K.rnd()<0.3)w.on=!w.on}
  g.cand=0.9+Math.sin(g.t*0.31)*0.04+Math.sin(g.t*0.77)*0.04+(K.rnd()<0.03?-0.08:0);
  if(K.live()){K.bed('wind','bandpass',500,0.8);K.bedSet('wind',0.05+Math.abs(g.wind)*0.05,380+Math.abs(g.wind)*300);
    K.bed('sq','bandpass',1500,18);K.bedSet('sq',g.squeak*0.12,1300+sp*120);
    if(K.rnd()<0.04){const t=K.now();K.tone('sine',5200+K.rnd()*2000,4800,0.03,0.006,t)}}
}
// ---------------- draw ----------------
function walkerPos(t){const u=t/2600;const y=150+u*130;const x=250+Math.sin(y*0.05)*30+(y-150)*0.6;return{x,y,u}}
function draw(g){const cand=g.cand;const cx=118,cy=214;// candle flame
  // outside (with live windows, snow, walker) into col for glass pixels
  for(let p=0;p<N;p++){if(!GL[p])continue;col[p]=OUT[p];em[p]=OUTE[p]}
  for(const w of WINS){if(!w.on)continue;const fl=0.85+0.15*Math.sin(g.t*0.05+w.ph);const c=mix(0xb87830,0xffd48a,fl);
    for(let y=w.y;y<w.y+w.h;y++)for(let x=w.x;x<w.x+w.w;x++){const p=y*W+x;if(p<0||p>=N||!GL[p])continue;let cc=c;if(w.big&&((x-w.x)%w.lat===0||y===w.y+(w.h>>1)))cc=mix(c,0x5a3a18,0.6);col[p]=cc;em[p]=w.big?120:150}
    if(w.big)for(let y=w.y+w.h+2;y<w.y+w.h+8;y++)for(let x=w.x-2;x<w.x+w.w+2;x++){const p=y*W+x;if(p>0&&p<N&&GL[p]&&(x+y)%1===0)col[p]=mix(col[p],0xffc070,0.18*(1-(y-w.y-w.h)/8))}}
  const wp=walkerPos(g.walker.t);if(wp.u<1){const s=0.5+wp.u*1.2;const x=Math.round(wp.x),y=Math.round(wp.y);const hh=Math.round(9*s);for(let j=0;j<hh;j++)for(let i=-1;i<=1;i++){const p=(y-j)*W+x+i;if(p>0&&p<N&&GL[p])col[p]=j>hh-3?0x2a2020:0x3a2a3a}
    const lx=x+Math.round(3*s),ly=y-Math.round(4*s);K.glow(lx,ly,6+s*4,0xffb060,0.6);const pl=ly*W+lx;if(GL[pl]){col[pl]=0xfff0c0;em[pl]=200}}
  for(const f of g.snow){const x=Math.round(f.x),y=Math.round(f.y);const p=y*W+x;if(p<0||p>=N||!GL[p])continue;const c=f.z>0.7?0xf4f8ff:f.z>0.35?0xc8d4ec:0x9aacc8;col[p]=c;if(f.z>0.85&&GL[p+1])col[p+1]=c}
  // glass: fog film, frost crystals, wet trails; the candle warms the frost near it
  for(let y=GY0;y<GY1;y++)for(let x=GX0;x<GX1;x++){const p=y*W+x;if(!GL[p])continue;let c=col[p];const hz=HZ[p],f=F[p],wt=WT[p];
    const dx=x-cx,dy=y-cy,dd=Math.sqrt(dx*dx+dy*dy);const warm=clamp(1-dd/170,0,1)*cand;
    const hcol=mix(0x9cb2cc,0xd0b496,warm*0.6);if(hz>0.02){c=mix(c,hcol,Math.min(0.93,hz*0.97));em[p]=Math.round(em[p]*(1-hz))}
    if(f>0.05){const e=(F[p-W]<0.3)?1:0;let fc=f>0.9?0xeef6ff:f>0.75?0xd2e2f4:0xaec4dc;fc=mix(fc,0xffe0b8,warm*0.45);if(e&&f>0.7)fc=0xffffff;
      c=mix(c,fc,clamp(f*0.95,0,0.95));if(f>0.8&&hash(x,y)<0.02&&((g.t>>3)+x)%7===0){c=0xffffff;em[p]=160}}
    if(wt>0.3&&hz<0.2){if(F[p-1]>0.5||F[p+1]>0.5)c=mix(c,0xffffff,0.25)}
    col[p]=c}
  // drops: a bright highlight, a darker lens rim
  for(const d of g.drops){const x=Math.round(d.x),y=Math.round(d.y);if(d.frozen){K.px(x,y,0xdfeeff);K.px(x,y+1,0x8aa0c0);continue}
    K.px(x-1,y,0x6a84a8);K.px(x+1,y,0x6a84a8);K.px(x,y+1,0x506a90);K.px(x,y,0xf8fcff,120);K.px(x,y-1,0xb8cce4)}
  // room: frame, wall, sill lit by the candle (warm, falling off), cool moonlight on the inner bevels
  for(let p=0;p<N;p++){const m=MATR[p];if(!m)continue;const x=p%W,y=(p/W)|0;const dx=x-cx,dy=(y-cy)*1.3,dd=Math.sqrt(dx*dx+dy*dy);let k=Math.max(0,1-dd/230);k=Math.round(k*k*12)/12;
    const a=ROOM[p];let c=K.mulc(a,0.18+k*1.15*cand,0.17+k*0.88*cand,0.22+k*0.55*cand);if(m===1&&(inGlass(x+1,y)||inGlass(x,y+1)||inGlass(x-1,y)||inGlass(x,y-1)))c=mix(c,0x6a7c9c,0.25);col[p]=c;em[p]=0}
  for(let x=20;x<460;x++){col[246*W+x]=0x0c0806}
  drawSill(g,cx,cy);
}
function drawSill(g,cx,cy){const cand=g.cand;
  // candle in a small brass dish
  K.rect(cx-9,222,19,3,0x8a6a30);K.rect(cx-10,224,21,2,0x5a4018);K.rect(cx-9,222,19,1,0xd8b060);
  K.rect(cx-3,204,7,18,0xe8dcc0);K.rect(cx-3,204,2,18,0xfff4dc);K.rect(cx+2,204,2,18,0xc0b090);K.rect(cx-1,206,2,4,0xd8ccb0);
  K.px(cx,202,0x2a1a10);const fh=5+Math.round((cand-0.9)*20);for(let j=0;j<fh;j++){const w=j<2?0:j<fh-1?1:0;for(let i=-w;i<=w;i++)K.px(cx+i+(j>3?Math.round(Math.sin(g.t*0.2)*0.6):0),201-j,j<2?0xff9030:0xfff0b0,255)}
  K.glow(cx,198,16,0xffa040,0.32*cand);K.glow(cx,199,7,0xfff0c0,0.8);
  // mug with steam
  const mx=328;K.rect(mx,210,17,14,0x9a3a2a);K.rect(mx,210,4,14,0xc05440);K.rect(mx+14,210,3,14,0x6a2418);K.rect(mx,209,17,1,0xe0c8b0);K.rect(mx+1,210,15,1,0x3a2010);
  for(let j=0;j<8;j++){K.px(mx+17,213+j,j===0||j===7?0x8a3020:0x0c0806);K.px(mx+19,213+j,0x6a2418)}K.px(mx+18,213,0x8a3020);K.px(mx+18,220,0x8a3020);
  for(const s of g.steam){const a=0.3*Math.sin(Math.PI*s.t/120);if(!GL[Math.round(s.y)*W+Math.round(s.x)])K.pxa(s.x,s.y,0xffffff,a)}
  // a small snowman figurine on the right of the sill
  const sx=398;K.disc(sx,218,5,0xe8e4dc);K.disc(sx,209,3.6,0xf4f0e8);K.px(sx-1,208,0x1a1418);K.px(sx+1,208,0x1a1418);K.px(sx+2,209,0xe07020);K.rect(sx-4,212,9,2,0xb02a20);K.rect(sx+2,213,2,4,0xb02a20);K.rect(sx-3,203,7,2,0x2a2428);K.rect(sx-2,200,5,3,0x2a2428)}
// ---------------- autoplay: wipe a porthole, a heart, then write 冬 ----------------
function circlePts(cx,cy,r,n){const out=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2*2.6;const k=1-i/n*0.85;out.push([cx+Math.cos(a)*r*k,cy+Math.sin(a)*r*0.9*k])}return out}
function heart(cx,cy,s){const out=[];for(let i=0;i<=60;i++){const t=i/60*Math.PI*2;out.push([cx+16*Math.pow(Math.sin(t),3)*s,cy-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*s])}return out}
const DONG=[// 冬: strokes in a 40-unit box
  [[14,2],[8,12],[2,18]],[[10,8],[30,8],[22,18],[10,26]],[[14,14],[24,20],[36,26]],[[18,30],[22,32]],[[16,37],[22,40]]];
function strokesAt(st,ox,oy,s){return st.map(a=>a.map(([x,y])=>[ox+x*s,oy+y*s]))}
function plan(){const q=[];q.push(circlePts(240,168,24,90));q.push({wait:120});q.push(heart(112,78,2.3));q.push({wait:120});for(const s of strokesAt(DONG,340,36,2.3))q.push(s);q.push({wait:400});q.push({breath:[150,90]});q.push({wait:200});q.push(circlePts(150,90,14,40));q.push({wait:1200});return q}
function ai(g){const A=g.ai;if(!A.q||!A.q.length)A.q=plan();if(!A.cur){A.cur={item:A.q.shift(),k:0,ph:'go'}}
  const C=A.cur,it=C.item;let tx=g._hx||240,ty=g._hy||160,down=false;
  if(it.wait){C.k++;if(C.k>it.wait)A.cur=null}
  else if(it.breath){C.k++;tx=it.breath[0];ty=it.breath[1];if(C.k===30)g.breath.push({x:tx,y:ty,t:0});if(C.k>120)A.cur=null}
  else{const pts=it;if(C.ph==='go'){const [x,y]=pts[0];const dx=x-tx,dy=y-ty,d=Math.hypot(dx,dy);if(d<2){C.ph='draw';C.k=0}else{tx+=dx/d*Math.min(d,3);ty+=dy/d*Math.min(d,3)}}
    else if(C.ph==='draw'){C.k+=0.25;const i=Math.floor(C.k),f=C.k-i;if(i>=pts.length-1){C.ph='up';C.k=0}else{tx=lerp(pts[i][0],pts[i+1][0],f);ty=lerp(pts[i][1],pts[i+1][1],f);down=true}}
    else{C.k++;if(C.k>14)A.cur=null}}
  g._hx=tx;g._hy=ty;return{x:0,y:0,mouse:{x:tx,y:ty,down,click:false}}}
function info(g){return '霜窗 · '+(g.grow>1?'霜长得快':g.grow<1?'霜长得慢':'霜在慢慢长回来')}
return{init,tick,draw,ai,info,breathe:g=>g.breath.push({x:K.rr(150,330),y:K.rr(80,170),t:0})}})();
GAMES.push({id:'frost',name:'霜窗',ref:'用指尖化开窗上的霜 · 霜花会长回来',keys:'按住拖动：用手指化霜、写字 · 按钮：哈一口气 / 霜长的快慢',hover:false,thumbAt:1500,
  init:FROST.init,tick:FROST.tick,draw:FROST.draw,ai:FROST.ai,info:FROST.info,
  opts:[{label:'哈一口气',set:g=>FROST.breathe(g)},{label:g=>'霜：'+(g.grow===1?'慢慢长':g.grow>1?'长得快':'几乎不长'),get:g=>g.grow!==1,set:g=>{g.grow=g.grow===1?3:g.grow===3?0:1}}],
  about:['雪夜，一间黑着灯的屋子，窗台上点着一支蜡烛。六格木窗上结满了霜，窗外是合掌造的雪村，家家户户亮着灯。按住画面拖动，就是用指尖在玻璃上化霜，可以擦出一个看窗外的圆洞，也可以写字、画画。','化掉的霜会变成水，聚成水珠顺着玻璃往下淌，淌过的地方留下一道透明的痕，水珠流尽就冻成一颗小冰珠。霜不会就此退走：羽毛状的霜花从你擦出的边缘重新长进来，按六十度分叉，慢慢把你写的字盖住。哈一口气，玻璃上会起一层雾；杯子的热气也会把上方的玻璃熏模糊。蜡烛把附近的霜照成暖色。'],
  tags:['指尖化霜，化出的水珠顺着玻璃往下淌','霜花按六十度分叉，从边缘长回来盖住你写的字','窗外的雪村：灯会一盏盏亮灭，有人提着灯走过','哈气起雾，杯子的热气也会熏雾玻璃','蜡烛的暖光照在窗框和霜上']});



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

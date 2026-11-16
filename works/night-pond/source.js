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



// ================= 夜池: a moonlit koi pond =================
// Night in a garden: a red arched bridge, a pavilion, a stone lantern and a willow on the far bank, and a pond that
// mirrors all of it. The water surface is a wave field (two-buffer wave equation, half resolution). Every water pixel
// looks up the mirrored bank and sky through the slope of the waves, so a touch breaks the moon into sparks and bends
// the bridge. Under the surface koi swim with bending spines; they gather under your hand, and a tap drops food that
// floats until one rises and gulps it. Lily pads ride the waves. Rain rings the whole pond.
const POND=(function(){const {W,H,S,mix,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const HY=92;// waterline (row where the far bank meets the water)
const WW=240,WH=Math.ceil((H-HY)/2)+2;// wave grid, half res
let A=new Float32Array(WW*WH),B=new Float32Array(WW*WH);
const BANK=new Uint32Array(W*HY),BANKE=new Uint8Array(W*HY);// rendered far bank and sky (static), emissive
const UND=new Uint32Array(N);// underwater layer per frame
let built=false;
// ---------------- far bank ----------------
function bp(x,y,c,e){if(x<0||y<0||x>=W||y>=HY)return;const p=y*W+x;BANK[p]=c;BANKE[p]=e||0}
const SKY=K.ramp('#070c1c #0a1226 #0e1830 #121e3a #182644 #1e2e4e');
function buildBank(){
  for(let y=0;y<HY;y++)for(let x=0;x<W;x++){bp(x,y,SKY[Math.min(5,Math.floor(y/12))])}
  K.setSeed(8);for(let i=0;i<90;i++){const x=K.ri(0,W-1),y=K.ri(0,54);bp(x,y,K.rnd()<0.25?0xe0e8ff:K.rnd()<0.5?0x8890b8:0x5a6488)}
  // moon and halo
  const mx=332,my=24;for(let y=-22;y<=22;y++)for(let x=-22;x<=22;x++){const d=Math.hypot(x,y);if(d<7.5)bp(mx+x,my+y,fbm((x+40)*0.45,(y+40)*0.45,2,3)>0.6?0xe6dcb8:0xfaf4dc,230);else if(d<20){const p=(my+y)*W+mx+x;if(p>=0&&p<W*HY)BANK[p]=mix(BANK[p],0x3a4a6e,d<11?0.4:d<15?0.22:0.1)}}
  // far trees: layered rounded crowns
  for(let x=0;x<W;x++){const t1=48+Math.round(10*fbm(x*0.03,0,3,21)+5*Math.sin(x*0.05));for(let y=t1;y<HY;y++)bp(x,y,hash(x>>1,y>>1)<0.15?0x0e1a16:0x0a1410);
    const t2=62+Math.round(8*fbm(x*0.05,0,3,22));for(let y=t2;y<HY;y++){const lit=fbm(x*0.12,y*0.15,2,23)>0.55;bp(x,y,lit?0x16261c:0x101c16)}}
  // pavilion (left): hipped roof with lit lattice windows
  const pv=(x0,y0,w)=>{for(let j=0;j<12;j++){const hw=w/2+j*1.4;for(let i=-hw;i<=hw;i++)bp(Math.round(x0+i),y0+j,j<2?0x2a2a30:j===11?0x14141a:(i<0?0x22222a:0x1a1a22))}
    bp(Math.round(x0-w/2-17),y0+10,0x2a2a30);bp(Math.round(x0+w/2+17),y0+10,0x2a2a30);
    for(let y=y0+12;y<y0+28;y++)for(let i=-w/2-6;i<=w/2+6;i++){const x=Math.round(x0+i);const post=Math.abs(i)>w/2+3;bp(x,y,post?0x2a1a14:((Math.round(i)+40)%5===0||(y-y0)%6===0?0x5a3a1a:0xd89a4a),post?0:150)}
    for(let i=-w/2-10;i<=w/2+10;i++)bp(Math.round(x0+i),y0+28,0x3a3434)};
  pv(70,52,30);
  // arched bridge (taiko-bashi): red deck curve, railings with posts, the arch opening
  const bx0=150,bx1=300,by=86,ah=26;const arch=x=>by-ah*Math.sin(Math.PI*clamp((x-bx0)/(bx1-bx0),0,1));
  for(let x=bx0-6;x<=bx1+6;x++){const y=Math.round(arch(x));for(let k=0;k<5;k++)bp(x,y+k,k===0?0xd8503a:k<3?0xa8301e:0x6a1a10);
    for(let k=1;k<8;k++)bp(x,y-k,(k===7)?0xc84030:0);if((x-bx0)%10===0)for(let k=1;k<9;k++)bp(x,y-k,k===8?0xe86040:0xb83824);
    // under the arch: dark, and the abutments
    const ins=x>bx0+16&&x<bx1-16;if(!ins)for(let y2=y+5;y2<HY;y2++)bp(x,y2,0x3a2e2a)}
  // the railing: top rail drawn, gaps left transparent to show trees: put back the trees we overwrote with 0
  for(let x=bx0-6;x<=bx1+6;x++){const y=Math.round(arch(x));for(let k=1;k<7;k++){const p=(y-k)*W+x;if(p>=0&&BANK[p]===0)BANK[p]=hash(x,y-k)<0.5?0x101c16:0x0a1410}}
  // stone lantern (right) lit
  const lx=372,ly=86;for(let y=ly-24;y<ly;y++){const j=ly-y;const hw=j<4?5:j<14?2:j<16?6:j<22?4:j<24?7:1;for(let i=-hw;i<=hw;i++)bp(lx+i,y,i<0?0x5a5852:0x3e3c38)}
  for(let y=ly-21;y<ly-16;y++)for(let i=-2;i<=2;i++)bp(lx+i,y,0xffc060,220);
  // bank stones and grass at the waterline
  for(let x=0;x<W;x++){const top=HY-3-Math.round(2*fbm(x*0.1,0,2,5));for(let y=top;y<HY;y++){const st=fbm(x*0.15,y*0.5,2,6);bp(x,y,st>0.5?0x3a3a40:st>0.4?0x2a2a30:0x1a2418)}}
}
function build(){if(built)return;built=true;buildBank()}
// ---------------- koi ----------------
const KOI_T=[// pattern type: base, accent, dark
  {n:'红白',b:0xf2ece2,a:0xd8401e,d:0x1a1414,pat:'patch'},{n:'昭和',b:0x1a1a1e,a:0xd04a20,d:0xf0ece0,pat:'showa'},{n:'黄金',b:0xe8b040,a:0xffe08a,d:0xa06a18,pat:'ogon'},
  {n:'浅黄',b:0x7a8ca0,a:0xd86030,d:0x4a5a70,pat:'asagi'},{n:'丹顶',b:0xf4f0e8,a:0xe0301a,d:0x1a1414,pat:'tancho'},{n:'山吹',b:0xe8c050,a:0xf0e090,d:0xb08020,pat:'ogon'},{n:'红白',b:0xf2ece2,a:0xe0501a,d:0x1a1414,pat:'patch'},{n:'孔雀',b:0x8a9a8a,a:0xe07020,d:0x3a4a44,pat:'asagi'}];
const BODY=[3,4,5,5.5,5.5,5,4.6,4,3.4,2.8,2.2,1.6,1.2,1];// half width along the body (14 segments, head first)
function makeKoi(i){const t=KOI_T[i%KOI_T.length];return{t,x:K.rr(60,420),y:K.rr(HY+40,H-30),a:K.rr(0,6.28),sp:0.5,ph:K.rnd()*6,len:K.rr(24,33),depth:K.rr(0.2,0.8),seed:i*17+3,tx:0,ty:0,wan:K.rr(0,6.28),eat:0,pts:[]}}
function koiPattern(k,u,v,side){const t=k.t;// u 0 head..1 tail, v -1..1
  if(t.pat==='patch'){const n=fbm(u*5+k.seed,v*2,2,k.seed);return n>0.56?t.a:t.b}
  if(t.pat==='tancho'){return (u>0.06&&u<0.2&&Math.abs(v)<0.45)?t.a:t.b}
  if(t.pat==='showa'){const n=fbm(u*5+k.seed,v*2.2,2,k.seed);const m=fbm(u*6+k.seed+9,v*2,2,k.seed+5);return n>0.55?t.a:m>0.62?t.d:t.b}
  if(t.pat==='asagi'){if(Math.abs(v)>0.7)return t.a;return ((Math.round(u*30)+Math.round(v*6))%2===0&&Math.abs(v)<0.5)?t.d:t.b}
  return Math.abs(v)<0.25&&u<0.7?t.a:u>0.85?t.d:t.b}
function koiSpine(k,g){// trail of points: head at (x,y), body follows the recent path + a tail beat
  const pts=k.pts;
  const out=[];let acc=0,j=0;const seg=k.len/(BODY.length-1);out.push({x:k.x,y:k.y});
  for(let i=1;i<pts.length&&out.length<BODY.length;i++){const a=pts[i-1],b=pts[i];acc+=Math.hypot(a.x-b.x,a.y-b.y);while(acc>=seg&&out.length<BODY.length){acc-=seg;out.push({x:b.x,y:b.y})}}
  while(out.length<BODY.length){const l=out[out.length-1];out.push({x:l.x-Math.cos(k.a)*seg,y:l.y-Math.sin(k.a)*seg})}
  // tail beat: lateral offset growing toward the tail
  const beat=Math.sin(g.t*0.18*(0.6+k.sp)+k.ph);for(let i=1;i<out.length;i++){const p=out[i],q=out[i-1];const dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy)||1;const off=beat*(i/out.length)**2*2.6;p.x+=-dy/l*off;p.y+=dx/l*off}
  return out}
function drawKoi(k,g){const sp=koiSpine(k,g);const dk=0.12+k.depth*0.55;const sc=k.len/26;const n=sp.length;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of sp){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)}x0=Math.floor(x0-10);y0=Math.floor(y0-10);x1=Math.ceil(x1+10);y1=Math.ceil(y1+10);
  const put=(x,y,c)=>{if(x<0||x>=W||y<=HY||y>=H)return;UND[y*W+x]=mix(c,0x061418,dk)};
  const fl=Math.sin(g.t*0.12+k.ph);
  for(let y=Math.max(HY+1,y0);y<=Math.min(H-1,y1);y++)for(let x=Math.max(0,x0);x<=Math.min(W-1,x1);x++){
    // nearest point on the spine polyline -> (u along, signed v across)
    let best=1e9,bu=0,bv=0,beyond=0,side=0;for(let i=0;i<n-1;i++){const p=sp[i],q=sp[i+1];const dx=q.x-p.x,dy=q.y-p.y,l2=dx*dx+dy*dy||1;let t=((x+0.5-p.x)*dx+(y+0.5-p.y)*dy)/l2;if(i===n-2&&t>1){beyond=(t-1)*Math.sqrt(l2);side=((x+0.5-p.x)*(-dy)+(y+0.5-p.y)*dx)/Math.sqrt(l2)}t=clamp(t,0,1);const cx=p.x+dx*t,cy=p.y+dy*t;const d=(x+0.5-cx)**2+(y+0.5-cy)**2;
      if(d<best){best=d;bu=(i+t)/(n-1);const l=Math.sqrt(l2);bv=((x+0.5-p.x)*(-dy)+(y+0.5-p.y)*dx)/l}}
    const d=Math.sqrt(best);const bi=bu*(BODY.length-1),i0=Math.floor(bi),fr=bi-i0;const hw=lerp(BODY[i0],BODY[Math.min(BODY.length-1,i0+1)],fr)*sc;
    let c=-1;
    if(d<=hw){const vv=bv/hw;c=koiPattern(k,bu,vv);if(Math.abs(vv)>0.78)c=mix(c,0x1a1010,0.3);else if(vv<-0.25&&vv>-0.7)c=mix(c,0xffffff,0.14);if(bu<0.07)c=mix(c,0xffffff,0.08)}
    else if(bu>0.18&&bu<0.27&&d<hw+2.6*sc*(1+0.25*fl*Math.sign(bv))&&d>hw){c=mix(k.t.b,0xc8d8e0,0.55)}// pectoral fins, translucent
    else if(beyond>0&&beyond<7*sc&&Math.abs(side)<beyond*0.85+0.8&&!(beyond>4*sc&&Math.abs(side)<(beyond-4*sc)*1.2)){c=mix(koiPattern(k,1,0),0xd8e4e8,0.4)}// tail fan beyond the last point
    if(c>=0)put(x,y,c)}
  // eyes
  const h=sp[0],h1=sp[1];const ex=h.x-h1.x,ey=h.y-h1.y,el=Math.hypot(ex,ey)||1;for(const sd of [-1,1])put(Math.round(h.x-ex/el*1.5-ey/el*sd*2.4*sc),Math.round(h.y-ey/el*1.5+ex/el*sd*2.4*sc),0x101010)}
// ---------------- lily pads and flowers ----------------
function makePads(){const P=[];const spots=[[60,230,13],[84,246,10],[40,252,9],[420,140,12],[440,160,9],[400,250,14],[430,236,10],[200,256,11],[120,128,8],[300,120,7]];
  for(const [x,y,r] of spots)P.push({x,y,x0:x,y0:y,r,a:K.rr(0,6.28),flower:K.rnd()<0.3,vx:0,vy:0});return P}
function drawPad(p,g){const r=p.r,ry=r*0.62;for(let j=-Math.ceil(ry);j<=ry;j++)for(let i=-r;i<=r;i++){const d=(i/r)**2+(j/ry)**2;if(d>1)continue;let a=Math.atan2(j/ry,i/r)-p.a;a=K.pmod(a+Math.PI,Math.PI*2)-Math.PI;if(Math.abs(a)<0.18&&d>0.05)continue;
    let c=d>0.8?0x1e3a1c:(j<0?0x3a6a2c:0x2c5424);const vein=Math.abs(Math.sin((Math.atan2(j/ry,i/r))*5))<0.12&&d>0.1&&d<0.85;if(vein)c=0x4a7a34;if(d<0.04)c=0x5a8a3a;
    K.px(Math.round(p.x+i),Math.round(p.y+j),mix(c,0x0a1810,0.35))}
  if(p.flower){const x=Math.round(p.x+r*0.2),y=Math.round(p.y-ry*0.3);const pk=[0xf4c8d8,0xe890b0,0xb85a80];
    for(const [i,j,k] of [[0,-4,0],[-1,-3,0],[1,-3,1],[-2,-2,1],[2,-2,1],[-3,-1,2],[3,-1,2],[-1,-1,0],[0,-2,0],[1,-1,1],[-2,0,2],[2,0,2],[0,-1,0]])K.px(x+i,y+j,pk[k]);K.px(x,y-1,0xf8e080);K.glow(x,y-2,6,0xf0a0c0,0.15)}}
// ---------------- state ----------------
function init(g){build();A.fill(0);B.fill(0);K.setSeed(99);g.koi=[];for(let i=0;i<8;i++)g.koi.push(makeKoi(i));g.pads=makePads();g.food=[];g.flies=[];g.rainOn=false;g.rain=0;g.wind=0;g.ai={t:0,mode:0,x:240,y:180,tx:240,ty:180,k:0};g.prev=null;g.frogT=200;
  for(let i=0;i<22;i++)g.flies.push({x:K.rr(0,W),y:K.rr(30,HY+60),vx:0,vy:0,ph:K.rnd()*6,on:K.rnd()})}
function poke(x,y,amp,r){const gx=Math.round(x/2),gy=Math.round((y-HY)/2);r=r||1.5;const R=Math.ceil(r);
  for(let j=-R;j<=R;j++)for(let i=-R;i<=R;i++){const X=gx+i,Y=gy+j;if(X<1||Y<1||X>=WW-1||Y>=WH-1)continue;const d=Math.hypot(i,j);if(d>r)continue;A[Y*WW+X]+=amp*(1-d/(r+0.5))}}
function waveStep(){// B <- 2A - B + c(lap A), damped; edges reflect a little less
  for(let y=1;y<WH-1;y++){const o=y*WW;for(let x=1;x<WW-1;x++){const p=o+x;const v=(A[p-1]+A[p+1]+A[p-WW]+A[p+WW])*0.5-B[p];B[p]=v*0.993}}const t=A;A=B;B=t}
function onWater(x,y){return y>HY+2&&y<H-1}
function tick(g,pad){const m=pad.mouse;g.wind=lerp(g.wind,g.windOn?1:0,0.02);
  // touch: a press drops food and makes a ring; dragging drags a wake; hovering over the water calls the koi
  if(m&&onWater(m.x,m.y)){if(m.click){poke(m.x,m.y,-9,2.2);plink(0.8);if(g.food.length<14)for(let i=0;i<3;i++)g.food.push({x:m.x+K.rr(-4,4),y:m.y+K.rr(-3,3),t:0,sink:0})}
    if(m.down&&g.prev){const d=Math.hypot(m.x-g.prev.x,m.y-g.prev.y);if(d>0.5){const n=Math.ceil(d/2);for(let k=1;k<=n;k++)poke(lerp(g.prev.x,m.x,k/n),lerp(g.prev.y,m.y,k/n),-1.6*Math.min(2,d/3),1.4)}}
    g.prev=m.down?{x:m.x,y:m.y}:null;g.hover={x:m.x,y:m.y}}else{g.prev=null;g.hover=null}
  // rain and wind disturb the surface
  g.rain=lerp(g.rain,g.rainOn?1:0,0.02);if(g.rain>0.05){const n=g.rain*3;for(let i=0;i<n;i++)if(K.rnd()<n/3)poke(K.rr(4,W-4),K.rr(HY+4,H-2),-K.rr(2,5),1)}
  if(g.wind>0.05&&g.t%2===0)for(let i=0;i<14;i++){const x=K.rr(0,W),y=K.rr(HY,H);poke(x,y,-0.5*g.wind*fbm(x*0.02+g.t*0.01,y*0.03,2,4),2)}
  waveStep();
  // koi: wander; if a hand hovers, gather under it; food draws the nearest one up to gulp
  for(const k of g.koi){let tx,ty,sp=0.45;
    const f=g.food.filter(f=>!f.taken).sort((a,b)=>Math.hypot(a.x-k.x,a.y-k.y)-Math.hypot(b.x-k.x,b.y-k.y))[0];
    if(f&&Math.hypot(f.x-k.x,f.y-k.y)<160){tx=f.x;ty=f.y;sp=1.1;if(Math.hypot(f.x-k.x,f.y-k.y)<9){f.taken=1;k.eat=24;poke(f.x,f.y,-6,1.6);plop()}}
    else if(g.hover&&Math.hypot(g.hover.x-k.x,g.hover.y-k.y)<180){const a=k.seed;tx=g.hover.x+Math.cos(a+g.t*0.01)*34;ty=g.hover.y+Math.sin(a+g.t*0.012)*20;sp=0.75}
    else{k.wan+=K.rr(-0.04,0.04);tx=k.x+Math.cos(k.wan)*40;ty=k.y+Math.sin(k.wan)*30;if(tx<30||tx>W-30||ty<HY+24||ty>H-14){k.wan+=Math.PI*0.6}}
    for(const o of g.koi){if(o===k)continue;const dx=k.x-o.x,dy=k.y-o.y,d=Math.hypot(dx,dy);if(d<22&&d>0.01){const w=f?0.8:2.2;tx+=dx/d*(22-d)*w;ty+=dy/d*(22-d)*w}}
    tx=clamp(tx,20,W-20);ty=clamp(ty,HY+22,H-10);const want=Math.atan2(ty-k.y,tx-k.x);let da=want-k.a;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;k.a+=clamp(da,-0.06,0.06);
    k.sp=lerp(k.sp,sp,0.05);k.x+=Math.cos(k.a)*k.sp;k.y+=Math.sin(k.a)*k.sp*0.8;k.depth=lerp(k.depth,k.eat>0||g.hover&&sp>0.7?0.02:0.3+0.28*Math.sin(g.t*0.004+k.seed),0.03);if(k.eat>0)k.eat--;k.pts.unshift({x:k.x,y:k.y});const need=Math.ceil(k.len*2.2/Math.max(0.3,k.sp));if(k.pts.length>need)k.pts.length=need;
    if(k.sp>0.6&&g.t%8===0)poke(k.x,k.y,-0.4*(1-k.depth),1)}
  for(let i=g.food.length-1;i>=0;i--){const f=g.food[i];f.t++;if(f.taken||f.t>600)g.food.splice(i,1)}
  // pads ride the waves: pushed by the surface slope
  for(const p of g.pads){const gx=Math.round(p.x/2),gy=Math.round((p.y-HY)/2);if(gx>1&&gy>1&&gx<WW-2&&gy<WH-2){const q=gy*WW+gx;p.vx+=(A[q+1]-A[q-1])*0.03;p.vy+=(A[q+WW]-A[q-WW])*0.03}
    p.vx+=(p.x0-p.x)*0.002;p.vy+=(p.y0-p.y)*0.002;p.vx*=0.94;p.vy*=0.94;p.x+=p.vx;p.y+=p.vy;p.a+=p.vx*0.01}
  for(const f of g.flies){f.ph+=0.02;f.vx+=K.rr(-0.04,0.04);f.vy+=K.rr(-0.03,0.03);f.vx*=0.97;f.vy*=0.97;f.x+=f.vx;f.y+=f.vy;if(f.y<30)f.vy+=0.05;if(f.y>HY-4)f.vy-=0.05;if(f.x<0)f.x=W;if(f.x>W)f.x=0;f.on=0.5+0.5*Math.sin(f.ph*3+f.x*0.1)}
  if(K.live()){K.bed('night','bandpass',4600,10);K.bedSet('night',0.035,4600);K.bed('rain','highpass',2500,0.5);K.bedSet('rain',g.rain*0.16,2500);K.bed('wind','bandpass',420,0.7);K.bedSet('wind',g.wind*0.08,420);
    if(--g.frogT<0){g.frogT=K.ri(240,700);const t=K.now();for(let i=0;i<K.ri(2,4);i++){K.tone('square',180+K.rnd()*30,120,0.09,0.03,t+i*0.16);K.noise(0.08,0.02,t+i*0.16,'bandpass',600,300,4)}}}
}
function plink(v){if(!K.live())return;const t=K.now();K.tone('sine',1100+K.rnd()*400,280,0.14,0.08*v,t);K.noise(0.05,0.04*v,t,'bandpass',2200,1200,2)}
function plop(){if(!K.live())return;const t=K.now();K.tone('sine',420,900,0.06,0.07,t);K.tone('sine',260,140,0.1,0.05,t+0.04)}
// ---------------- draw ----------------
function draw(g){
  // bank and sky
  for(let p=0;p<W*HY;p++){col[p]=BANK[p];em[p]=BANKE[p]}
  // fireflies over the bank (and their reflections later)
  // underwater layer: dark water with pebbles, koi, sunk food
  for(let y=HY;y<H;y++){const dd=(y-HY)/(H-HY);for(let x=0;x<W;x++){const n=fbm(x*0.05,y*0.08,2,31);UND[y*W+x]=n>0.62?0x0e2224:n<0.35?0x081618:0x0a1c1e}}
  const ks=g.koi.slice().sort((a,b)=>b.depth-a.depth);for(const k of ks)drawKoi(k,g);
  // water: reflection through the wave slope, mixed with what lies under, glints where slopes catch the moon
  const mx=332,my=24;
  for(let y=HY;y<H;y++){const gy=Math.min(WH-2,Math.max(1,Math.round((y-HY)/2)));const dist=(y-HY)/(H-HY);const fres=0.86-dist*0.5;
    for(let x=0;x<W;x++){const gx=Math.min(WW-2,Math.max(1,x>>1));const q=gy*WW+gx;const sx=A[q+1]-A[q-1],sy=A[q+WW]-A[q-WW];
      // reflected row: mirror around the waterline, pushed by the slope (stronger far away, perspective)
      const shim=Math.sin(y*0.9+g.t*0.07)*Math.sin(y*0.23-g.t*0.03)*(0.6+dist*1.2);let ry=Math.round(2*HY-y-sy*(3+dist*6)),rx=Math.round(x+sx*(3+dist*5)+shim);if(ry>HY-1)ry=HY-1;rx=clamp(rx,0,W-1);
      let rc,re=0;if(ry<0){rc=hash(rx,ry)<0.006?0x6a74a0:0x060a18}else{rc=BANK[ry*W+rx];re=BANKE[ry*W+rx]}rc=K.mulc(rc,0.72,0.78,0.86);
      const ux=clamp(Math.round(x+sx*2),0,W-1),uy=clamp(Math.round(y+sy*2),HY,H-1);const uc=UND[uy*W+ux];
      let c=mix(uc,rc,fres);let e=Math.round(re*fres*0.8);
      // glint: slope that tilts the moon's reflection into view
      const sl=sx*0.6+sy;if(sl<-1.4&&Math.abs(x-mx)<60+dist*60){c=mix(c,0xfff4d8,clamp((-sl-1.4)*0.5,0,0.8));e=Math.max(e,120)}
      else if(sl>1.6)c=mix(c,0x020608,0.25);
      if(sl<-0.25)c=mix(c,0x5a6e92,clamp((-sl-0.25)*0.18,0,0.4));else if(sl>0.3)c=mix(c,0x000204,clamp((sl-0.3)*0.2,0,0.5));
      const p=y*W+x;col[p]=c;em[p]=e}}
  // fireflies and their reflections
  for(const f of g.flies){if(f.on<0.3)continue;const a=(f.on-0.3)/0.7;K.px(f.x,f.y,mix(0x4a6a20,0xe8ff80,a),Math.round(200*a));K.glow(f.x,f.y,4,0xc8f060,0.25*a);
    const ry=Math.round(2*HY-f.y);if(ry<H){K.px(f.x,ry,mix(0x1a2a10,0xa0c050,a*0.7));}}
  for(const p of g.pads)drawPad(p,g);
  for(const f of g.food){if(f.taken)continue;K.px(f.x,f.y,0xb08040);K.px(f.x+1,f.y,0x7a5020)}
  drawWillow(g);drawFore(g);
  // rain streaks
  if(g.rain>0.05){K.setSeed(g.t*13);for(let i=0;i<g.rain*90;i++){const x=K.rr(0,W),y=K.rr(0,H);for(let k=0;k<5;k++)K.pxa(x-k*0.3,y-k,0x8a9ab8,0.35-k*0.05)}}
}
const WIL=[];(function(){K.setSeed(555);for(let s=0;s<44;s++){if(s<6&&K.rnd()<0.6)continue;WIL.push({x0:394+s*2.1+K.rr(-3,3),len:K.ri(50,105),dep:K.rnd(),ph:K.rnd()*6})}WIL.sort((a,b)=>a.dep-b.dep)})();
function drawWillow(g){// a few heavy branches from the top-right corner, then hanging strands of narrow leaves
  for(let t=0;t<1;t+=0.004){const x=Math.round(480-t*110),y=Math.round(-4+Math.sin(t*3)*8+t*6);for(let k=0;k<3;k++)K.px(x,y+k,k===0?0x2a2420:0x16120e)}
  for(const s of WIL){const sw=Math.sin(g.t*0.018+s.ph)*(1.2+g.wind*5);const G=[0x0e1e12,0x163020,0x22442a,0x2e5634,0x3e6a3c];const sh=s.dep<0.5?0:1;
    for(let j=0;j<s.len;j+=1){const f=j/s.len;const x=Math.round(s.x0+sw*f*f+Math.sin(f*2+s.ph)*2),y=j+2;if(y>=H)break;
      K.px(x,y,G[sh]);if(j%3===0){const side=(j/3)%2?1:-1;const c=G[sh+1+((j+s.ph*7|0)%3===0?2:0)];K.px(x+side,y+1,c);K.px(x+side*2,y+2,G[sh+1]);if(f>0.6)K.px(x+side,y+2,c)}}}}
function drawFore(g){// mossy rocks and irises framing the bottom corners
  const rock=(cx,cy,rx,ry,seed)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const dx=(x-cx)/rx,dy=(y-cy)/ry;const n=fbm(x*0.08,y*0.08,2,seed)*0.35;if(dx*dx+dy*dy>1-n+0.2)continue;
      const lit=dx*0.5+dy*0.8<-0.15;const mo=fbm(x*0.2,y*0.25,2,seed+3)>0.55&&dy<0.2;let c=mo?(lit?0x2e4a24:0x1e3218):(lit?0x3a3c44:0x23242a);if(dx*dx+dy*dy>0.8-n+0.2)c=0x101014;K.px(x,y,c)}};
  rock(-6,262,46,22,1);rock(40,268,26,12,2);rock(484,260,40,24,3);rock(446,272,22,10,4);
  const iris=(x0,y0,h,lean,fl)=>{for(let k=0;k<4;k++){const L=h*(0.7+k*0.12),a=lean+(k-1.5)*0.12;for(let j=0;j<L;j++){const f=j/L;const x=Math.round(x0+k*2+Math.sin(a)*j+f*f*lean*10),y=Math.round(y0-Math.cos(a)*j);K.px(x,y,f>0.85?0x3e6a30:k%2?0x24421c:0x2e5424);if(f<0.5)K.px(x+1,y,0x1a3014)}}
    if(fl){const fx=x0+4+Math.round(lean*h*0.7),fy=y0-Math.round(h*0.95);const P=[0x3a2a6a,0x5a44a0,0x8a74d0];for(const [i,j,c] of [[0,-3,2],[-1,-2,1],[1,-2,2],[-2,-1,1],[2,-1,1],[0,-1,2],[-1,0,0],[1,0,1],[0,0,1],[-3,0,0],[3,0,0],[0,1,0]])K.px(fx+i,fy+j,P[c]);K.px(fx,fy-1,0xf0d060)}};
  iris(30,250,30,-0.15,true);iris(52,256,24,0.1,false);iris(12,246,22,-0.25,true);iris(440,252,28,0.2,true);iris(420,258,20,-0.1,false)}
// ---------------- autoplay: wander, feed, trail a finger, sometimes rain ----------------
function ai(g){const A=g.ai;A.t++;A.k++;let down=false,click=false;
  if(A.mode===0){if(A.k===1){A.tx=K.rr(80,400);A.ty=K.rr(HY+40,H-30)}const d=Math.hypot(A.tx-A.x,A.ty-A.y);if(d>2){A.x+=(A.tx-A.x)*0.03;A.y+=(A.ty-A.y)*0.03}if(A.k>150){A.mode=1;A.k=0}}
  else if(A.mode===1){if(A.k===20||A.k===50)click=true;down=A.k>=20&&A.k<24||A.k>=50&&A.k<54;if(A.k>240){A.mode=2;A.k=0}}
  else if(A.mode===2){// trail a finger in an S
    const t=A.k/220;A.x=lerp(90,390,t);A.y=HY+90+Math.sin(t*Math.PI*2)*40;down=A.k>5&&A.k<215;if(A.k===6)click=false;if(A.k>260){A.mode=A.t>2400&&!g._rained?3:0;A.k=0}}
  else{if(A.k===1)g.rainOn=true;if(A.k>500){g.rainOn=false;g._rained=1;A.mode=0;A.k=0}}
  return{x:0,y:0,mouse:{x:A.x,y:A.y,down,click}}}
function dbg(){let m=0;for(let i=0;i<A.length;i++)m=Math.max(m,Math.abs(A[i]));return m}
function info(g){return '夜池 · '+g.koi.length+' 尾锦鲤'+(g.rainOn?' · 雨':'')}
return{init,tick,draw,ai,info,dbg}})();
GAMES.push({id:'pond',name:'夜池',ref:'点水喂鱼 · 手指划水 · 月亮碎成光',keys:'把手停在水面上：锦鲤会游过来 · 点一下：喂鱼、起涟漪 · 按住拖动：手指划水',hover:true,thumbAt:500,
  init:POND.init,tick:POND.tick,draw:POND.draw,ai:POND.ai,info:POND.info,
  opts:[{label:g=>g.rainOn?'雨：下着':'雨：停',get:g=>g.rainOn,set:g=>{g.rainOn=!g.rainOn}},{label:g=>g.windOn?'风：吹着':'风：静',get:g=>g.windOn,set:g=>{g.windOn=!g.windOn}}],
  about:['夏夜的庭院：对岸有红色的太鼓桥、亮着灯的亭子、石灯笼和柳树，池水把这一切倒映出来。把手停在水面上，锦鲤会慢慢游到你手下面；点一下水面，撒下几粒鱼食，最近的那条会浮上来一口吞掉；按住拖动，就是用手指在水里划。','水面是一张波动场，每帧按波动方程推进。每个水面像素都沿着波面的坡度去查倒影，所以一圈涟漪会把月亮打碎成一片碎光，把桥拉弯。水下的锦鲤用一条会弯的脊椎游动，越靠近水面越清楚。睡莲叶随波浮动，萤火虫在水里也有倒影。下雨时整池都是雨圈。'],
  tags:['真实的波动方程：涟漪会扩散、反射、互相叠加','倒影沿波面坡度采样，月亮被打碎成碎光','锦鲤会游到你手下面，抢你撒的鱼食','睡莲叶随波漂动','萤火虫和它们的倒影','下雨、起风都会搅动整池水']});



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

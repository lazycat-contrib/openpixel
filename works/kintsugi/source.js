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
// ================= shared bits for the three games: save data, pixel UI frames, floating numbers, particles, sound cues =================
const STORE=(function(){const mem={};
  return{get(k,d){try{const s=localStorage.getItem('zlyj.'+k);if(s!=null)return JSON.parse(s)}catch(e){}return k in mem?mem[k]:JSON.parse(JSON.stringify(d))},
    set(k,v){mem[k]=v;try{localStorage.setItem('zlyj.'+k,JSON.stringify(v))}catch(e){}}}})();
const UI=(function(){const {rect,recta,px,hex}=K;
  // a chunky pixel frame: dark ink outline, a light bevel on top-left, a dark one bottom-right, a flat face
  function frame(x,y,w,h,face,o){o=o||{};x|=0;y|=0;w|=0;h|=0;const ink=o.ink!=null?o.ink:0x14101c,hi=o.hi!=null?o.hi:K.mix(face,0xffffff,0.28),lo=o.lo!=null?o.lo:K.mix(face,0,0.35);
    if(o.a!=null){recta(x+1,y+1,w-2,h-2,face,o.a)}else rect(x+1,y+1,w-2,h-2,face);
    rect(x+1,y,w-2,1,ink);rect(x+1,y+h-1,w-2,1,ink);rect(x,y+1,1,h-2,ink);rect(x+w-1,y+1,1,h-2,ink);
    rect(x+1,y+1,w-2,1,hi);rect(x+1,y+1,1,h-3,hi);rect(x+1,y+h-2,w-2,1,lo);rect(x+w-2,y+2,1,h-4,lo);
    if(o.shadow)recta(x+2,y+h,w-2,2,0,0.45)}
  function bar(x,y,w,h,t,c,bg){x|=0;y|=0;rect(x,y,w,h,0x14101c);rect(x+1,y+1,w-2,h-2,bg!=null?bg:0x2a2434);const f=Math.round((w-2)*K.clamp(t,0,1));if(f>0){rect(x+1,y+1,f,h-2,c);rect(x+1,y+1,f,1,K.mix(c,0xffffff,0.4))}}
  return{frame,bar}})();
// floating text: score numbers, words. A list owned by each game; world or screen coordinates are the game's business
function Pops(){const L=[];return{L,
  add(x,y,s,c,o){o=o||{};L.push({x,y,s:String(s),c,t:0,life:o.life||46,vy:o.vy!=null?o.vy:-0.9,size:o.size||0,big:o.big||0,cjk:/[^\x00-\x7f]/.test(String(s))})},
  tick(){for(let i=L.length-1;i>=0;i--){const p=L[i];p.t++;p.y+=p.vy;p.vy*=0.92;if(p.t>p.life)L.splice(i,1)}},
  draw(ox,oy){for(const p of L){const x=p.x-(ox||0),y=p.y-(oy||0);const k=p.t<5?(p.big?1+(5-p.t)*0.1:1):1;const fade=p.t>p.life-10?(p.life-p.t)/10:1;if(fade<=0.05)continue;
    if(p.cjk||p.size)K.text(p.s,x,y,p.c,{size:Math.round((p.size||11)*k),bold:true,align:'c',ink:0x14101c,a:fade});
    else{const sc=p.big&&p.t<4?2:1;K.ptext(p.s,x,y,p.c,{align:'c',ink:0x14101c,scale:sc})}}}}}

// sound cues with a per-name rate limit so 200 hits in one frame make one sound
const SFX=(function(){const last={};
  function ok(n,gap){if(!K.live())return false;const t=K.now();if(last[n]&&t-last[n]<(gap||0.03))return false;last[n]=t;return true}
  return{ok,
    blip(f,d,v,type){if(!ok('b'+f,0.02))return;K.tone(type||'square',f,f*1.02,d||0.06,v||0.06,K.now())},
    up(f0,f1,d,v,type,n){if(!ok(n||('u'+f0),0.03))return;K.tone(type||'square',f0,f1,d,v,K.now())},
    hit(v){if(!ok('hit',0.035))return;const t=K.now();K.noise(0.05,v||0.1,t,'bandpass',2400,900,1.2);K.tone('square',220,90,0.05,(v||0.1)*0.5,t)},
    boom(v,f){if(!ok('boom',0.06))return;const t=K.now();K.noise(0.5,v||0.3,t,'lowpass',f||1400,60,0.8);K.tone('sine',90,32,0.4,(v||0.3)*0.9,t)},
    coin(p){if(!ok('coin',0.025))return;const t=K.now(),f=988*(p||1);K.tone('square',f,f,0.05,0.045,t);K.tone('square',f*1.335,f*1.335,0.18,0.045,t+0.05)},
    arp(notes,dt,type,v){if(!ok('arp'+notes[0],0.1))return;const t=K.now();notes.forEach((f,i)=>K.tone(type||'square',f,f,dt*1.6,v||0.05,t+i*dt))}}})();



// ================= 金缮: mend three broken tea bowls with lacquer and gold on a rainy night =================
// The bowl falls and breaks. Move the cursor, J picks a shard up (and drops it), hold K to turn it; near its place it clicks in.
// Then hold J and brush red lacquer along every crack (off the crack it smears), K for the gold tube: hold J over the wet
// lacquer to sift gold onto it, K again for the silk: hold J and rub to polish the gold bright. K when done.
const KIN=(function(){const {W,H,S,mix,clamp,lerp,hash,rnd,rr,vnoise,sstep}=K;const col=S.col,em=S.em;
const BW=230,BH=142,BX=125,BY=12,XC=115,RY=26,RA=110,RB=20,YB=115;// bowl image size, where it sits, rim ellipse, body bottom
const LV=[-0.6,-0.55,0.58],LN=Math.hypot(...LV),LX=LV[0]/LN,LY=LV[1]/LN,LZ=LV[2]/LN;// the paper lamp, up and to the left
const HX=LX,HY=LY,HZ=LZ+1,HN=Math.hypot(HX,HY,HZ);
const TYPES=[
  {n:'天目茶碗',who:'山口先生',say:'祖父传下来的天目，摔成了六片。',ramp:[0x0a0706,0x14100c,0x201810,0x302216,0x48341f],alt:[0x1c130b,0x302010,0x4c3219,0x6c4623,0x8e5e2e],rim:[0x3a220e,0x5a361a,0x7a4a24,0x9a6434,0xbc8448],gloss:1,
    seeds:[[115,128],[32,40],[104,16],[186,30],[58,86],[166,84]]},
  {n:'青瓷碗',who:'陈阿婆',say:'嫁妆里的青瓷碗，碎得厉害。',ramp:[0x2a4a3e,0x46695a,0x648a76,0x86ac94,0xaccab2],alt:[0x1e3a30,0x365848,0x507462,0x6e927c,0x92b29a],rim:[0x5a7a66,0x7a9a84,0x98b8a0,0xb6d2bc,0xd4e8d6],gloss:1,
    seeds:[[115,128],[24,32],[82,14],[150,14],[208,40],[48,84],[128,72],[184,94]]},
  {n:'粉引茶碗',who:'小林',say:'第一次自己烧的碗，舍不得扔。',ramp:[0x7a6e62,0xa09484,0xc2b6a4,0xdcd2c0,0xf0e8da],alt:[0x86685c,0xae8e80,0xccae9e,0xe2c8ba,0xf4ddd0],rim:[0x8a7e70,0xb0a492,0xcec4b2,0xe6dece,0xf8f2e6],gloss:0,
    seeds:[[115,128],[48,22],[144,18],[202,56],[30,64],[94,68],[158,96]]}];
const CLAY=[0x4a2e1c,0x6a4428,0x8a5e3a,0xa87a50];
const GM=[0x4a3418,0x6a4c22,0x8a6a30,0xa6843e,0xbc9a4c],GB=[0x8a5a16,0xb8842a,0xdcaa3c,0xf2ca5c,0xfff0b0],GI=GM.map((c,i)=>mix(c,GB[i],0.5));
const SLOT=[[66,190],[156,226],[262,246],[362,224],[424,186],[70,250],[430,252]];// where the shards come to rest on the cloth
// ---------------- the bowl image: shape, glaze, light; then cracks ----------------
function makeBowl(ti){const T=TYPES[ti],img=new Int32Array(BW*BH).fill(-1),band=new Uint8Array(BW*BH),reg=new Uint8Array(BW*BH);
  const tone=(r,v)=>r[clamp((v*5)|0,0,4)];
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const dx=x+0.5-XC,i=y*BW+x;let rg=0;const e=(dx/RA)**2+((y+0.5-RY)/RB)**2;
    if(e<1)rg=e>0.84?4:1;else if(y>RY&&y<YB){const t=(y-RY)/(YB-RY);if(Math.abs(dx)<RA*(1-0.47*t*t))rg=2}else if(y>=YB&&y<YB+13&&Math.abs(dx)<40-(y-YB)*0.3)rg=3;reg[i]=rg}
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const i=y*BW+x,rg=reg[i];if(!rg)continue;const dx=x+0.5-XC;let c,v;
    if(rg===1){const ex=dx/RA,ey=(y+0.5-RY)/RB,r=Math.hypot(ex,ey);v=0.34+0.34*ex-0.16*ey+(r<0.36?-0.14:0);if(ex<-0.3&&ey<0.2)v-=0.12;// shade from the rim on the left inner wall
      const sp=Math.hypot(ex-0.5,ey+0.34);if(sp<0.12&&T.gloss)v=0.98;c=tone(T.ramp,v);if(ti===0&&r>0.4&&vnoise(Math.atan2(ey,ex)*44,r*3,7)>0.64)c=tone(T.alt,v);if(ti===2&&vnoise(x*0.09,y*0.16,4)>0.72)c=tone(T.alt,v)}
    else if(rg===4){const ex=dx/RA,ey=(y+0.5-RY)/RB;v=0.5-0.4*ex-0.3*ey;c=tone(T.rim,v)}
    else if(rg===2){const t=(y-RY)/(YB-RY),w=RA*(1-0.47*t*t),ph=Math.asin(clamp(dx/w,-1,1)),be=-0.15+t*1.0,nx=Math.sin(ph)*Math.cos(be),ny=Math.sin(be),nz=Math.cos(ph)*Math.cos(be);
      const df=Math.max(0,nx*LX+ny*LY+nz*LZ),sp=Math.max(0,(nx*HX+ny*HY+nz*HZ)/HN);v=0.08+0.82*df+(t>0.8?0.06:0);
      const yg=104+4*vnoise(dx*0.11,0,ti+3);
      if(ti!==1&&y>yg+1){c=CLAY[clamp((v*4)|0,0,3)]}
      else{if(y>yg-2&&ti!==1)v-=0.18;// the thick bead where the glaze stopped
        let r=T.ramp;if(ti===0&&vnoise(ph*44,y*0.02,7)>0.68-0.14*(1-t))r=T.alt;if(ti===1&&t>0.6)v-=0.1;if(ti===2&&vnoise(x*0.08,y*0.12,5)>0.7)r=T.alt;
        const s=sp**18;if(T.gloss&&s>0.6)c=mix(r[4],0xfff4e0,0.7);else if(s>0.6)c=r[4];else{c=tone(r,v+(T.gloss&&s>0.28?0.22:0))}
        const w2=Math.max(0,nx*0.62+ny*-0.2+nz*0.76);if(T.gloss&&w2**40>0.6&&t<0.55)c=mix(c,0x9ab4d4,0.6);// the window, a cool second highlight
        if(ti===2&&hash(x>>1,y>>1)<0.012)c=0x7a4a30}}// 粉引's iron spots
    else{const t=(y-YB)/13;v=0.6-0.5*(dx/40)-t*0.3+0.15*(vnoise(x*0.4,y*0.4,2)-0.5);c=CLAY[clamp((v*4)|0,0,3)]}
    img[i]=c;band[i]=clamp((v*5)|0,0,4)}
  // silhouette outline: darkest glaze tone
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const i=y*BW+x;if(!reg[i])continue;const out=x===0||x===BW-1||y===0||y===BH-1||!reg[i-1]||!reg[i+1]||!reg[i-BW]||!reg[i+BW];if(out){img[i]=reg[i]===3||reg[i]===2&&y>YB-8?CLAY[0]:TYPES[ti].ramp[0];band[i]=0}}
  // shards: a warped Voronoi split; the foot piece is a bit bigger and stays on the stand
  const sd=T.seeds,lab=new Int8Array(BW*BH).fill(-1);
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const i=y*BW+x;if(!reg[i])continue;const wx=x+16*(vnoise(x*0.03,y*0.03,ti*5+1)-0.5)+5*(vnoise(x*0.13,y*0.13,ti*5+2)-0.5),wy=y+16*(vnoise(x*0.03,y*0.03,ti*5+3)-0.5)+5*(vnoise(x*0.13,y*0.13,ti*5+4)-0.5);
    let bk=0,bd=1e9;for(let k=0;k<sd.length;k++){const d=Math.hypot(wx-sd[k][0],(wy-sd[k][1])*1.25)*(k?1:0.82);if(d<bd){bd=d;bk=k}}lab[i]=bk}
  // keep every shard in one piece: stray islands join the neighbour they touch most
  for(let pass=0;pass<3;pass++){const seen=new Uint8Array(BW*BH);for(let k=0;k<sd.length;k++){const comps=[];for(let i=0;i<BW*BH;i++){if(lab[i]!==k||seen[i])continue;const q=[i];seen[i]=1;const cmp=[];while(q.length){const j=q.pop();cmp.push(j);const x=j%BW;for(const n of [x>0?j-1:-1,x<BW-1?j+1:-1,j-BW,j+BW])if(n>=0&&n<BW*BH&&!seen[n]&&lab[n]===k){seen[n]=1;q.push(n)}}comps.push(cmp)}
      comps.sort((a,b)=>b.length-a.length);for(const cmp of comps.slice(1)){const cnt={};for(const j of cmp){const x=j%BW;for(const n of [x>0?j-1:-1,x<BW-1?j+1:-1,j-BW,j+BW])if(n>=0&&n<BW*BH&&lab[n]>=0&&lab[n]!==k)cnt[lab[n]]=(cnt[lab[n]]||0)+1}let bb=-1,bc=0;for(const q in cnt)if(cnt[q]>bc){bc=cnt[q];bb=+q}if(bb>=0)for(const j of cmp)lab[j]=bb}}}
  const crk=new Uint8Array(BW*BH),val=new Uint8Array(BW*BH),oth=new Int8Array(BW*BH).fill(-1),list=[];
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const i=y*BW+x;if(lab[i]<0)continue;for(const n of [x<BW-1?i+1:-1,y<BH-1?i+BW:-1,x>0?i-1:-1,y>0?i-BW:-1])if(n>=0&&lab[n]>=0&&lab[n]!==lab[i]){oth[i]=lab[n];break}
    if(x<BW-1&&lab[i+1]>=0&&lab[i+1]!==lab[i]||y<BH-1&&lab[i+BW]>=0&&lab[i+BW]!==lab[i]){crk[i]=1;list.push(i)}}
  for(const i of list){const x=i%BW,y=(i/BW)|0;for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){const xx=x+k,yy=y+j;if(xx<0||yy<0||xx>=BW||yy>=BH)continue;const n=yy*BW+xx;if(lab[n]>=0)val[n]=1}}
  const sh=sd.map(()=>({px:[],cx:0,cy:0,r:0}));for(let i=0;i<BW*BH;i++)if(lab[i]>=0){const s=sh[lab[i]];s.px.push(i);s.cx+=i%BW;s.cy+=(i/BW)|0}
  for(const s of sh){s.cx/=s.px.length;s.cy/=s.px.length;for(const i of s.px)s.r=Math.max(s.r,Math.hypot(i%BW-s.cx,((i/BW)|0)-s.cy));s.r=Math.ceil(s.r)+2}
  return{img,band,reg,lab,crk,val,oth,list,sh}}
const BOWLS=TYPES.map((_,i)=>makeBowl(i));
// ---------------- the room: paper lamp, rain window, walnut table and an indigo work cloth ----------------
const BG=new Int32Array(W*H);(function(){const lx=56,ly=78;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c;const d=Math.hypot(x-lx,(y-ly)*1.3);const l=clamp(1-d/360,0,1),q=Math.floor(l*l*6)/6;
    if(y<140){c=mix(0x1a1410,0x6a5038,q);if(vnoise(x*0.05,y*0.05,3)>0.7)c=mix(c,0x000000,0.08);if(y>=134)c=mix(0x2a1e14,0x5a4028,q)}// plaster wall, a dark skirting rail
    else{const u=y-140;c=mix(0x1e120a,0x5a3a22,q*0.9+0.1);const gr=vnoise(x*0.012,u*0.25,8);if(gr>0.62)c=mix(c,0x120a06,0.25);if(((u*7+((x*0.03)|0))%41)===0)c=mix(c,0x0a0604,0.4);if(y<144)c=mix(c,0x8a6a4a,0.25)}
    BG[y*W+x]=c}
  // the cloth the shards lie on
  for(let y=158;y<268;y++)for(let x=14;x<466;x++){const e=Math.max(Math.abs(x-240)/226,Math.abs(y-213)/55);if(e>1)continue;const d=Math.hypot(x-lx,(y-ly)*1.3),l=clamp(1-d/380,0,1),q=Math.floor(l*l*5)/5;let c=mix(0x0e1424,0x2a3a5a,q+0.08);
    const sx=(x-14)%22,sy=(y-158)%14;const wave=Math.hypot(sx-11,sy-14);if(Math.abs(wave-9)<0.6||Math.abs(wave-5)<0.6)c=mix(c,0x8a9ab8,0.12);if(e>0.97)c=mix(c,0x000000,0.3);BG[y*W+x]=c}
  // the stand under the bowl
  for(let y=140;y<152;y++)for(let x=BX+XC-60;x<BX+XC+60;x++){const u=(x-BX-XC)/60;BG[y*W+x]=y<143?0x8a5a34:mix(0x5a3420,0x2a160a,(u+1)/2)}
  // paper lamp (andon): a wooden frame round warm paper
  for(let y=30;y<124;y++)for(let x=28;x<84;x++){const fr=x<31||x>80||y<33||(y>74&&y<77)||y>120,lat=(x-28)%14===0&&y>33;let c=fr?0x2a1a10:lat?0xb08850:mix(0xf8dca0,0xffefc8,1-Math.abs(x-56)/28);BG[y*W+x]=c}
  for(let x=24;x<88;x++){BG[28*W+x]=0x1a100a;BG[29*W+x]=0x3a2414}
  // window with a night garden behind rain
  for(let y=10;y<112;y++)for(let x=332;x<468;x++){const fr=x<336||x>463||y<14||y>107||Math.abs(x-400)<2;let c;if(fr)c=0x24180e;else{c=mix(0x0c1424,0x1a2a42,(y-14)/94);const b=vnoise(x*0.06,y*0.02,11);if(y>60+20*vnoise(x*0.03,0,12))c=mix(c,0x0a120e,0.7);if(b>0.7&&y<80)c=mix(c,0x0a100c,0.6)}BG[y*W+x]=c}
  for(const [x,y,r,cc] of [[350,70,3,0xe0a050],[372,64,2,0xf0c070],[440,74,4,0xe09040],[420,58,2,0xd0b080]])for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r)BG[(y+j)*W+x+i]=mix(BG[(y+j)*W+x+i],cc,0.55)})();
// ---------------- game ----------------
function init(g){g.T=0;g.sv=STORE.get('kin1',{best:0})||{best:0};g.pops=Pops();g.st='intro';g.it=0;g.k=0;g.total=0;g.res=[];g.et=0;fresh(g)}
function fresh(g){const B=BOWLS[g.k];g.stage='break';g.ft=0;g.cur={x:240,y:200};g.held=null;g.spd=0;g.md=false;g.aiT=0;
  g.L=new Uint8Array(BW*BH);g.G=new Uint8Array(BW*BH);g.Pl=new Float32Array(BW*BH);g.Sm=new Uint8Array(BW*BH);g.smear=0;g.chips=[];g.dust=[];
  g.pc=B.sh.map((s,k)=>{const sl=SLOT[(k-1+g.k*2)%SLOT.length];return{k,tx:BX+s.cx,ty:BY+s.cy,x:BX+s.cx,y:BY+s.cy,th:0,ex:k?sl[0]+rr(-8,8):BX+s.cx,ey:k?sl[1]+rr(-4,4):BY+s.cy,eth:k?rr(0.8,5.4):0,placed:k===0,sx:BX+s.cx,sy:BY+s.cy}});g.drop=0}
function ai(g){return{x:0,y:0,a:false,b:false,fire:false}}
function snd(g,n){if(!K.live()||g.thumb)return;const t=K.now();
  if(n==='crash'){K.noise(0.6,0.26,t,'highpass',3200,900,0.7);K.tone('sine',110,60,0.2,0.12,t);for(let i=0;i<7;i++){const f=2200+rnd()*2400;K.tone('triangle',f,f*0.98,0.12+rnd()*0.2,0.04,t+0.03+i*0.035)}}
  else if(n==='snap'){K.tone('sine',1500,1480,0.1,0.07,t);K.noise(0.03,0.08,t,'bandpass',3000,3000,2)}
  else if(n==='pick'){K.tone('triangle',2600,2500,0.05,0.03,t)}
  else if(n==='brush'){if(SFX.ok('kbr',0.09))K.noise(0.1,0.025,t,'bandpass',900,700,1)}
  else if(n==='powder'){if(SFX.ok('kpw',0.06))K.noise(0.07,0.02,t,'highpass',7000,6000,1)}
  else if(n==='rub'){if(SFX.ok('krb',0.07))K.noise(0.06,0.03,t,'bandpass',2400,2800,4)}
  else if(n==='done'){[587,659,784,880,1175].forEach((f,i)=>K.tone('triangle',f,f,1.2,0.05,t+i*0.16))}}
function beds(g){if(!K.live()||g.thumb)return;K.bed('kinrain','lowpass',1500,0.5);K.bedSet('kinrain',0.02,1500)}
const wrap=a=>{a%=Math.PI*2;if(a>Math.PI)a-=Math.PI*2;if(a<-Math.PI)a+=Math.PI*2;return a};
function stats(g){const B=BOWLS[g.k];let n=0,go=0,la=0,pl=0;for(const i of B.list){n++;if(g.L[i])la++;if(g.G[i]){go++;pl+=g.Pl[i]}}return{lac:la/n,gold:go/n,pol:go?pl/go:0}}
// screen point -> bowl image index (the bowl is fixed once joined)
const bi=(x,y)=>{const ix=Math.floor(x-BX),iy=Math.floor(y-BY);return ix<0||iy<0||ix>=BW||iy>=BH?-1:iy*BW+ix};
function nearest(g,test){const B=BOWLS[g.k];let best=-1,bd=1e9;for(const i of B.list){if(!test(i))continue;const d=Math.hypot(BX+i%BW+0.5-g.cur.x,BY+((i/BW)|0)+0.5-g.cur.y);if(d<bd){bd=d;best=i}}return best<0?null:{x:BX+best%BW+0.5,y:BY+((best/BW)|0)+0.5,d:bd}}
// the restorer: one shard at a time, then follow the cracks nearest-first with the brush, the tube, the silk
function aiPad(g){const pad={x:0,y:0,a:false,b:false,fire:false,bh:false};g.aiT++;const c=g.cur;const go=(x,y,s)=>{const dx=x-c.x,dy=y-c.y,d=Math.hypot(dx,dy);if(d>0.4){pad.x=clamp(dx/(s*3),-1,1);pad.y=clamp(dy/(s*3),-1,1)}return d};
  if(g.stage==='join'){if(!g.held){const p=g.pc.find(p=>!p.placed);if(!p)return pad;if(go(p.x,p.y,1)<2.5&&g.aiT>8){pad.a=true;g.aiT=0}return pad}
    const p=g.held;go(p.tx-p.ox,p.ty-p.oy,1);if(Math.abs(wrap(p.th))>0.12)pad.bh=true;return pad}
  if(g.stage==='lac'||g.stage==='gold'){const n=g.stage==='lac'?nearest(g,i=>!g.L[i]):nearest(g,i=>g.L[i]&&!g.G[i]);if(!n||(g.stage==='lac'?stats(g).lac:stats(g).gold)>0.99){if(g.aiT>40)pad.b=true;return pad}g.aiT=0;go(n.x,n.y,0.7);pad.fire=n.d<2.2;return pad}
  if(g.stage==='polish'){const st=stats(g);const n=nearest(g,i=>g.G[i]&&g.Pl[i]<0.85);if(!n||st.pol>0.88){if(g.aiT>40)pad.b=true;return pad}g.aiT=0;const w=Math.sin(g.T*0.5)*3;go(n.x+w,n.y+w*0.6,0.5);pad.fire=n.d<6;return pad}
  return pad}
function tick(g,pad){g.T++;g.pops.tick();beds(g);const T=g.T,B=BOWLS[g.k];
  for(const c of g.chips){c.vy+=0.18;c.x+=c.vx;c.y+=c.vy;if(c.y>c.fl){c.y=c.fl;c.vy*=-0.3;c.vx*=0.5}c.l--}g.chips=g.chips.filter(c=>c.l>0);
  for(const d of g.dust){d.vy+=0.04;d.y+=d.vy;d.x+=d.vx;d.l--}g.dust=g.dust.filter(d=>d.l>0);
  if(g.st==='intro'){g.it++;tickBreak(g);if(g.it>220||g.it>60&&(pad.a||pad.b)&&!g.auto){g.st='play';g.ft=g.it}return}
  if(g.st==='end'){g.et++;if(g.et>600&&(pad.a||g.auto&&g.et>700))init(g);return}
  const P=g.auto?aiPad(g):pad;g.ft++;
  if(g.stage==='break'){tickBreak(g);if(g.ft>110){g.stage='join';g.ft=0}return}
  // the cursor: keys accelerate while held; the mouse puts it where it is
  const m=P.mouse,c=g.cur,ox=c.x,oy=c.y;if(m&&!m.touch&&!g.auto){c.x=m.x;c.y=m.y}else{const mv=Math.hypot(P.x||0,P.y||0);g.spd=mv>0.1?Math.min(g.auto?1.6:3,g.spd+0.06):0;const s=g.auto?(g.stage==='join'?2.4:g.stage==='lac'?1.1:2):1+g.spd;c.x=clamp(c.x+(P.x||0)*s,4,W-4);c.y=clamp(c.y+(P.y||0)*s,4,H-4)}
  const mdown=!!(m&&m.down&&!g.auto),press=P.a||mdown&&!g.md,rel=!mdown&&g.md&&!g.auto;g.md=mdown;const hold=P.fire||mdown;
  if(g.stage==='join'){if(press&&!g.held){let best=null,bd=1e9;for(const p of g.pc){if(p.placed)continue;const d=Math.hypot(p.x-c.x,p.y-c.y);if(d<BOWLS[g.k].sh[p.k].r*0.8&&d<bd&&underShard(g,p,c.x,c.y)){bd=d;best=p}}if(!best)for(const p of g.pc){if(p.placed)continue;const d=Math.hypot(p.x-c.x,p.y-c.y);if(d<14&&d<bd){bd=d;best=p}}
      if(best){g.held=best;best.ox=c.x-best.x;best.oy=c.y-best.y;snd(g,'pick');g.pc.splice(g.pc.indexOf(best),1);g.pc.push(best)}}
    else if((press&&!mdown||rel)&&g.held){g.held=null}
    const p=g.held;if(p){p.x=c.x-p.ox;p.y=c.y-p.oy;if(P.bh)p.th=wrap(p.th+0.055);
      if(Math.hypot(p.x-p.tx,p.y-p.ty)<7&&Math.abs(wrap(p.th))<0.32){p.placed=true;p.x=p.tx;p.y=p.ty;p.th=0;g.held=null;snd(g,'snap');g.pops.add(p.tx,p.ty-10,'嗒',0xf0e0c0,{size:11,life:40});
        if(g.pc.every(q=>q.placed)){g.stage='lac';g.ft=0;g.pops.add(240,24,'碗拼好了 · 上漆',0xf0d0a0,{size:12,life:80})}}}
    return}
  if(g.stage==='lac'){if(hold)paint(g,c.x,c.y,ox,oy,'lac');if(P.b){g.stage='gold';g.ft=0;g.pops.add(240,24,'撒金粉',0xf8d870,{size:12,life:60})}return}
  if(g.stage==='gold'){if(hold){paint(g,c.x,c.y,ox,oy,'gold');for(let k=0;k<3;k++)g.dust.push({x:c.x+rr(-2,2),y:c.y-12,vx:rr(-0.2,0.2),vy:rr(0.3,0.8),l:rr(10,18)|0})}if(P.b){g.stage='polish';g.ft=0;g.pops.add(240,24,'打磨',0xfff0c0,{size:12,life:60})}return}
  if(g.stage==='polish'){if(hold)paint(g,c.x,c.y,ox,oy,'polish');if(P.b){finish(g)}return}
  if(g.stage==='show'){if(g.ft===20)snd(g,'done');if(g.ft>420||g.ft>140&&!g.auto&&(pad.a||pad.b)){if(g.k<2){g.k++;fresh(g)}else{g.st='end';g.et=0;if(g.total>g.sv.best){g.sv.best=g.total;STORE.set('kin1',g.sv)}}}}}
function underShard(g,p,x,y){const s=BOWLS[g.k].sh[p.k],dx=x-p.x,dy=y-p.y,co=Math.cos(-p.th),si=Math.sin(-p.th),sx=Math.floor(s.cx+co*dx-si*dy),sy=Math.floor(s.cy+si*dx+co*dy);return sx>=0&&sy>=0&&sx<BW&&sy<BH&&BOWLS[g.k].lab[sy*BW+sx]===p.k}
function tickBreak(g){const t=g.st==='intro'?g.it:g.ft;// falls 40 frames, then the pieces fly out and settle on the cloth
  if(t===40){snd(g,'crash');for(let i=0;i<40;i++)g.chips.push({x:BX+XC+rr(-40,40),y:BY+120,vx:rr(-3,3),vy:rr(-4,-1),fl:rr(150,262),l:rr(60,120)|0,c:BOWLS[g.k].img[BOWLS[g.k].list[(i*37)%BOWLS[g.k].list.length]]})}
  for(const p of g.pc){if(!p.k)continue;if(t<40){p.x=p.sx;p.y=p.sy-(1-(t/40)**2)*70;p.th=0}else{const u=clamp((t-40)/50,0,1),e=1-(1-u)**3;p.x=lerp(p.sx,p.ex,e);p.y=lerp(p.sy,p.ey,e)-Math.sin(u*Math.PI)*30;p.th=lerp(0,p.eth,e)}}
  g.drop=t<40?(1-(t/40)**2)*70:0}
function paint(g,x,y,ox,oy,mode){const B=BOWLS[g.k];const steps=Math.max(1,Math.ceil(Math.hypot(x-ox,y-oy)));const mv=Math.hypot(x-ox,y-oy);let hit=false;
  for(let s=1;s<=steps;s++){const px=lerp(ox,x,s/steps),py=lerp(oy,y,s/steps),r=mode==='polish'?4.5:mode==='gold'?3.2:1.6;
    for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){if(i*i+j*j>r*r)continue;const id=bi(px+i,py+j);if(id<0||!B.reg[id])continue;
      if(mode==='lac'){if(B.val[id]){if(!g.L[id]){g.L[id]=1;hit=true}}else if(!g.Sm[id]){g.Sm[id]=1;g.smear++}}
      else if(mode==='gold'){if((g.L[id]||g.Sm[id])&&!g.G[id]&&rnd()<0.7){g.G[id]=1;hit=true}}
      else if(g.G[id]&&mv>0.3){g.Pl[id]=Math.min(1,g.Pl[id]+mv*0.03);hit=true}}}
  snd(g,mode==='lac'?'brush':mode==='gold'?'powder':'rub')}
function finish(g){const st=stats(g);const sm=clamp(1-g.smear/160,0,1);g.sc=Math.round(600*st.gold+250*st.gold*st.pol+150*sm);g.total+=g.sc;g.res.push(TYPES[g.k].n+' '+g.sc);g.stage='show';g.ft=0;g.st2=st;g.sm=sm}
// ---------------- drawing ----------------
function pixel(g,B,i,glint){// one bowl pixel with whatever is on it: crack, lacquer, gold
  let c=B.img[i];if(g.Sm[i])c=g.G[i]?GM[clamp(B.band[i],0,4)]:0x4a1610;
  if(B.val[i]&&(g.L[i]||B.crk[i])){if(g.G[i]){const p=g.Pl[i],b=clamp(B.band[i]+1,0,4);c=p<0.35?GM[b]:p<0.75?GI[b]:GB[b];if(p>0.75&&glint(i))c=0xfffbe8}
    else if(g.L[i])c=0x6a1a12;else if(B.crk[i])c=0x161010}
  return c}
function glintF(g){const T=g.T;return i=>{const x=i%BW,y=(i/BW)|0;const s=((x+y*0.6)-((T*1.6)%260)+40);return s>-3&&s<3}}
function drawBowl(g,X,Y,sc,forceAll){const B=BOWLS[g.k],gl=glintF(g);// placed shards in the bowl (a scaled copy for the shelf)
  const placed=new Uint8Array(B.sh.length);for(const p of g.pc)if(p.placed||forceAll)placed[p.k]=1;
  if(sc===1){for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const i=y*BW+x,k=B.lab[i];if(k<0||!placed[k])continue;let c=pixel(g,B,i,gl);if(B.oth[i]>=0&&!placed[B.oth[i]])c=CLAY[2+(((x+y)>>2)&1)];
      const p=(Y+y)*W+X+x;if(X+x<0||X+x>=W||Y+y<0||Y+y>=H)continue;col[p]=c;if(c===0xfffbe8)em[p]=70;else if(g.G[i]&&g.Pl[i]>0.75)em[p]=14}return}
  const w=Math.ceil(BW*sc),h=Math.ceil(BH*sc);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=((y/sc)|0)*BW+((x/sc)|0);if(B.lab[i]<0)continue;K.px(X+x,Y+y,pixel(g,B,i,gl))}}
function drawLoose(g,p,lift){const B=BOWLS[g.k],s=B.sh[p.k],co=Math.cos(-p.th),si=Math.sin(-p.th),R=s.r;
  for(let pass=0;pass<2;pass++){const ox=pass?0:3+lift,oy=pass?0:4+lift;for(let y=Math.floor(p.y-R);y<=p.y+R;y++)for(let x=Math.floor(p.x-R);x<=p.x+R;x++){if(x<0||y<0||x>=W||y>=H)continue;const dx=x+0.5-p.x,dy=y+0.5-p.y,sx=Math.floor(s.cx+co*dx-si*dy),sy=Math.floor(s.cy+si*dx+co*dy);
    if(sx<0||sy<0||sx>=BW||sy>=BH)continue;const i=sy*BW+sx;if(B.lab[i]!==p.k)continue;if(!pass){const q=(y+oy)*W+x+ox;if(y+oy<H&&x+ox<W)col[q]=mix(col[q],0x000000,0.45);continue}
    let c=B.img[i];if(B.oth[i]>=0)c=CLAY[2+(((sx+sy)>>2)&1)];col[y*W+x]=c;em[y*W+x]=0}}}
function tool(g){const c=g.cur,x=Math.round(c.x),y=Math.round(c.y),st=g.stage;// the hand tool, tip at the cursor
  if(st==='join'){if(g.held){K.disc(x+4,y+4,4,0xd8a878);K.disc(x+7,y+7,4,0xc8986a);K.rect(x+3,y-1,2,5,0xe0b088)}else{for(let k=0;k<6;k++){K.px(x-6+k,y,0xf0e0c0);K.px(x+1+k,y,0xf0e0c0);K.px(x,y-6+k,0xf0e0c0);K.px(x,y+1+k,0xf0e0c0)}K.px(x,y,0xffffff)}return}
  if(st==='lac'){for(let k=0;k<26;k++){const c2=k<3?0x6a1a12:k<7?0x2a1a10:k%6===0?0x6a8a3a:0x9ab05a;K.px(x+k*0.7,y+k,c2);K.px(x+1+k*0.7,y+k,c2)}return}
  if(st==='gold'){for(let k=0;k<22;k++){const c2=k<3?0xd8b860:k%7===0?0x4a6a2a:0x8aa050;K.rect(x-2+k*0.5,y-12-k,5,1,c2)}K.rect(x-2,y-13,5,2,0xe8d090);return}
  if(st==='polish'){for(let j=0;j<10;j++)for(let i=0;i<14;i++){const fold=(i+j)%5===0;K.px(x-3+i+(j>>1),y-2+j,fold?0xd8d0c4:0xf2ece0)}K.disc(x+12,y+10,5,0xd8a878)}}
function room(g){col.set(BG);const T=g.T;// rain on the window, lamp flicker
  for(let k=0;k<70;k++){const x=336+((hash(k,1)*126)|0),sp=2+hash(k,2)*2,y=14+((T*sp+hash(k,3)*94)%94);for(let j=0;j<5;j++)if(y+j<108)K.pxa(x,y+j,0x8a9ab8,0.35)}
  for(let k=0;k<12;k++){const x=338+((hash(k,7)*122)|0),y=16+((T*0.15+hash(k,8)*90)%90);K.px(x,y,0xaab8d0);K.px(x,y+1,0x6a7a98)}
  const fl=0.85+0.15*vnoise(T*0.05,0,2);K.glow(56,78,48,0xffd090,0.16*fl);tools(g)}
function tools(g){const st=g.stage;// the kit laid out on the cloth; the one in use glows
  const on=(x,y,k)=>{if(st===k&&g.st==='play')K.glow(x,y,22,0xffd890,0.12)};
  on(96,232,'lac');K.disc(97,236,13,0x0a0604);K.disc(96,234,13,0x1a0e0a);K.disc(96,233,10,0x5a140e);K.disc(93,231,3,0x8a2a1a);// lacquer dish
  for(let k=0;k<30;k++)K.rect(112+k,226+k*0.25,1,2,k<4?0x2a1a10:0x9ab05a);// brush on its rest
  on(206,236,'gold');for(let j=0;j<14;j++)for(let i=0;i<24;i++){if(Math.abs(i-12)+j*0.6>13)continue;K.px(194+i,228+j,j<2?0xd8ccb0:0xece2c8)}for(let j=0;j<6;j++)for(let i=0;i<12-j;i++)K.px(200+i+j*0.5,233+j*0.7,(i+j)%3?0xd8a840:0xf8d870,10);// a paper fold of gold powder
  for(let k=0;k<22;k++)K.rect(222+k,240-k*0.3,4,2,k%7===0?0x4a6a2a:0x8aa050);
  on(318,236,'polish');for(let j=0;j<16;j++)for(let i=0;i<26;i++){const f=(i+j*2)%9;K.px(306+i+(j>>2),228+j,f===0?0xc8c0b4:f<3?0xe6e0d4:0xf4f0e8)}// silk
  for(let k=0;k<16;k++)K.px(346+k,238-k*0.4,0x8a6a4a);K.disc(363,232,2.4,0xf0ece0)}// the tooth burnisher

function draw(g){em.fill(0);const T=g.T;
  if(g.st==='end'){shelf(g);hud(g);return}
  room(g);
  for(const c of g.chips)K.px(c.x,c.y,c.c);
  const B=BOWLS[g.k];const lift=g.st==='intro'||g.stage==='break'?g.drop:0;
  if(lift>0){// the whole bowl falling
    const sv=g.pc.map(p=>p.placed);g.pc.forEach(p=>p.placed=true);drawBowl(g,BX,BY-Math.round(lift),1);g.pc.forEach((p,i)=>p.placed=sv[i])}
  else{drawBowl(g,BX,BY,1);for(const p of g.pc)if(!p.placed)drawLoose(g,p,p===g.held?4:0)}
  for(const d of g.dust)K.px(d.x,d.y,(d.l&3)?0xe8c060:0xfff0b0,40);
  if(g.stage==='show')showFx(g);
  if(g.st==='play'&&g.stage!=='break'&&g.stage!=='show')tool(g);
  hud(g)}
function showFx(g){const t=g.ft;// a warm sweep of lamp light across the mended bowl
  const sx=BX-40+((t*1.4)%320);for(let y=BY;y<BY+BH;y++)for(let x=Math.max(BX,sx-10);x<Math.min(BX+BW,sx+10);x++){const i=(y-BY)*BW+(x-BX);if(BOWLS[g.k].lab[i]<0)continue;K.pxa(x,y,0xfff0d0,0.08)}}
function shelf(g){// a tokonoma alcove: three mended bowls on a dark board, a hanging scroll
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=y<188?mix(0x2a2018,0x5a4630,clamp(1-Math.hypot(x-240,y-90)/300,0,1)**1.5):y<200?0x1a0e08:mix(0x3a2414,0x24160c,(y-200)/70);col[y*W+x]=c}
  K.rect(214,10,52,92,0xe8dcc0);K.rect(214,10,52,4,0x5a3a2a);K.rect(214,98,52,4,0x5a3a2a);K.text('破',240,30,0x1a1410,{size:20,fam:'kai',align:'c'});K.text('而',240,54,0x1a1410,{size:20,fam:'kai',align:'c'});K.text('美',240,78,0x1a1410,{size:20,fam:'kai',align:'c'});
  const k0=g.k;for(let k=0;k<3;k++){g.k=k;const sv=g.kept&&g.kept[k];if(!sv)continue;const L=g.L,G=g.G,Pl=g.Pl,Sm=g.Sm;g.L=sv.L;g.G=sv.G;g.Pl=sv.Pl;g.Sm=sv.Sm;const x0=22+k*150,y0=110;drawBowl(g,x0,y0,0.6,true);g.L=L;g.G=G;g.Pl=Pl;g.Sm=Sm}g.k=k0}
function hud(g){if(g.st==='intro'){const a=clamp((g.it-100)/30,0,1)*clamp((220-g.it)/20,0,1);K.text('金 缮',240,8,0xf8d870,{size:26,bold:true,fam:'kai',align:'c',a,sp:10,ink:0x1a0e08});
    K.text('碎了的碗，用漆粘好，再描上金。裂痕是它的一部分。',240,250,0xf0e0c0,{size:10,align:'c',a,ink:0x1a0e08});return}
  if(g.st==='end'){const a=clamp(g.et/50,0,1);K.text('三只碗 · '+g.total+' 分',240,226,0xf8d870,{size:16,bold:true,fam:'kai',align:'c',a,ink:0x000000});K.text(g.res.join(' · ')+(g.sv.best?' · 最高 '+g.sv.best:''),240,248,0xe0d0b0,{size:9,align:'c',a,ink:0x000000});return}
  const o=TYPES[g.k];K.text('第 '+(g.k+1)+'/3 只 · '+o.n+' · 总分 '+g.total,8,6,0xf0e0c0,{size:10,ink:0x000000});
  if(g.stage==='break'&&g.ft<100)K.text(o.who+'：'+o.say,240,262,0xf0e0c0,{size:9,align:'c',ink:0x000000});
  const st=g.stage!=='break'&&g.stage!=='join'?stats(g):null;
  if(g.stage==='join'){const n=g.pc.filter(p=>!p.placed).length;K.text('还差 '+n+' 片',472,6,0xf0e0c0,{size:10,align:'r',ink:0x000000});if(!g.auto&&g.ft<1200)K.text('J 拿起 / 放下碎片 · 按住 K 转动 · 放到原位会自己卡进去',240,262,0xf0e0c0,{size:9,align:'c',ink:0x000000})}
  if(g.stage==='lac'){meter('漆',st.lac,0x9a2a1a);if(!g.auto)K.text('按住 J 沿着裂缝涂漆 · 涂到外面会脏 · 涂完按 K',240,262,0xf0e0c0,{size:9,align:'c',ink:0x000000})}
  if(g.stage==='gold'){meter('金',st.gold,0xe0b040);if(!g.auto)K.text('按住 J 在湿漆上撒金粉 · 撒完按 K',240,262,0xf0e0c0,{size:9,align:'c',ink:0x000000})}
  if(g.stage==='polish'){meter('亮',st.pol,0xfff0b0);if(!g.auto)K.text('按住 J 来回擦金线，擦得越久越亮 · 好了按 K',240,262,0xf0e0c0,{size:9,align:'c',ink:0x000000})}
  if(g.stage==='show'&&g.ft>40){const a=clamp((g.ft-40)/30,0,1),s=g.st2;K.text(o.n+' · '+g.sc+' 分',240,226,0xf8d870,{size:16,bold:true,fam:'kai',align:'c',a,ink:0x000000});
    K.text('金线 '+Math.round(s.gold*100)+'% · 光泽 '+Math.round(s.pol*100)+'% · 干净 '+Math.round(g.sm*100)+'%',240,246,0xe0d0b0,{size:9,align:'c',a,ink:0x000000});
    K.text(g.sc>850?o.who+'：比摔之前还好看。':g.sc>650?o.who+'：谢谢你，它又能用了。':o.who+'：嗯……能用就好。',240,260,0xe0d0b0,{size:9,align:'c',a,ink:0x000000})}
  g.pops.draw(0,0)}
function meter(lb,v,c){K.text(lb,394,6,0xf0e0c0,{size:10,ink:0x000000});UI.bar(408,8,64,7,v,c)}
function info(g){return '金缮 · 总分 '+(g.total||0)+(g.sv&&g.sv.best?' · 最高 '+g.sv.best:'')}
// keep each finished bowl's lacquer and gold for the alcove at the end
return{init,tick:(g,p)=>{const st=g.stage;tick(g,p);if(st==='polish'&&g.stage==='show'&&!(g.kept&&g.kept[g.k]))(g.kept=g.kept||[])[g.k]={L:g.L,G:g.G,Pl:g.Pl,Sm:g.Sm}},draw,ai,info}})();
GAMES.push({id:'kintsugi',name:'金缮',ref:'手艺 · 金缮修复碎瓷',keys:'方向键 / 鼠标移动 · J 拿起放下碎片，按住 K 转动 · 按住 J 涂漆 / 撒金 / 打磨 · K 下一步 · 手机：摇杆 + 按钮',touch:'stick',tbtn:['拿 / 涂','转 / 下一步'],thumbAt:1500,
  init:KIN.init,tick:KIN.tick,draw:KIN.draw,ai:KIN.ai,info:KIN.info,canAttract:g=>g.st==='intro'||g.k===0&&g.stage==='break',
  about:['雨夜，纸灯下的工作台。三位客人送来摔碎的茶碗：一只天目、一只青瓷、一只粉引。碗落地碎开，碎片散在靛蓝布上，露出里面的素胎。','先把碎片一片片拿起来、转到对的角度放回去，靠近原位会自己卡进去。再沿着每一道裂缝涂上红漆，涂到外面就脏了；趁漆没干撒上金粉；最后用丝绸来回擦，金线才会亮起来。'],
  tags:['碗摔下来碎成真正能拼回去的几片','碎片断口露出素胎的颜色','靠近原位咔嗒一声卡进去','先红漆后金粉，两层手艺','擦得越久，金线越亮，光会沿着金线走','三种釉：天目兔毫、青瓷、粉引铁斑','最后三只碗摆进壁龛']});



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
function step(){const d=G.d;
  if(G.stop>0){G.stop--;S.frame++;return}
  let pad;
  if(mode==='play'){pad=readPad();const any=pad.x||pad.y||pad.fire||pad.a||pad.b||(pad.mouse&&(pad.mouse.down||pad.mouse.click));if(!any)idle++;else idle=0;
    if(idle>60*45&&(!d.canAttract||d.canAttract(G))){setMode('auto');G=newGame(d)}}
  else{pressed.clear();mouse.click=false;pad=d.ai(G)}
  d.tick(G,pad);G.t++;S.frame++;if(S.flash>0){S.flash*=0.86;if(S.flash<0.02)S.flash=0}}
function frame(){G.d.draw(G);S.raw=false;K.present();lg.putImageData(S.img,0,0);
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
let infoLast='';function syncInfo(){const d=G.d;const s=(d.info?d.info(G):'')+(mode==='play'?'':' · 演示中');if(s!==infoLast){$('info').textContent=s;infoLast=s}}
// ---------------- controls ----------------
const rail=$('rail');
function seg(label,opts,get,set){const l=document.createElement('span');l.className='lab';l.textContent=label;const s=document.createElement('div');s.className='seg';
  for(const[v,t]of opts){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{set(v);sync()};b.dataset.v=v;s.appendChild(b)}
  const sync=()=>{for(const b of s.children)b.classList.toggle('on',String(b.dataset.v)===String(get()))};rail.append(l,s);sync();return sync}
const btn=(t,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;b.onclick=fn;rail.appendChild(b);return b};
const syncMode=seg('',[['play','我来玩'],['auto','看演示']],()=>mode,v=>{wake();setMode(v);G=newGame(GAMES[cur]);cv.focus()});
const playB=btn('暂停',()=>setPaused(!paused));
btn('重开',()=>{G=newGame(GAMES[cur]);frame();cv.focus()});
let sndUser=false;
const sndB=btn('声音 开',()=>{K.sndInit();sndUser=true;K.SND.on=!K.SND.on;syncSnd();if(K.SND.ctx&&K.SND.ctx.state==='suspended')K.SND.ctx.resume();if(!K.SND.on)K.bedsOff()});
function syncSnd(){const on=K.SND.on||!sndUser;sndB.textContent=on?'声音 开':'声音 关';sndB.classList.toggle('on',on)}
// sound comes on with the first key or touch (browsers need a gesture), unless the player turned it off
function wake(){if(sndUser)return;K.sndInit();if(K.SND.ctx){K.SND.on=true;if(K.SND.ctx.state==='suspended')K.SND.ctx.resume()}syncSnd()}
const info=document.createElement('span');info.id='info';rail.appendChild(info);
function setMode(m){mode=m;idle=0;syncMode();$('hint').textContent=m==='play'?(GAMES[cur].keys||''):'演示中 · 按任意键或点画面开始玩';if(G)G.auto=m==='auto';touchUI()}
function setPaused(p){paused=p;playB.textContent=p?'继续':'暂停'}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const gameKey=/^(Arrow|Key[WASDJKZX]|Space|Enter|Escape)/.test(e.code);
  if(e.code==='KeyP'){setPaused(!paused);return}
  if(gameKey&&(e.code==='Space'||e.code==='Enter')&&document.activeElement&&document.activeElement.tagName==='BUTTON')return;
  if(gameKey){wake();if(paused)setPaused(false);if(mode!=='play'){setMode('play');G=newGame(GAMES[cur]);e.preventDefault();return}if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);e.preventDefault()}});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();if(mode==='play'&&G&&G.d.onBlur)G.d.onBlur(G)});
function cpos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
const coarse=matchMedia('(pointer: coarse)').matches;
cv.addEventListener('pointermove',e=>{const p=cpos(e);if(e.pointerId===stick.id){stick.x=p[0]-stick.ox;stick.y=p[1]-stick.oy}if(mode!=='play')return;mouse.x=p[0];mouse.y=p[1];mouse.active=true;mouse.touch=e.pointerType!=='mouse'});
cv.addEventListener('pointerdown',e=>{cv.focus();wake();const p=cpos(e);e.preventDefault();
  if(mode!=='play'){setMode('play');G=newGame(GAMES[cur]);return}
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
  b.addEventListener('pointerdown',e=>{e.preventDefault();wake();if(mode!=='play'){setMode('play');G=newGame(GAMES[cur]);return}TB[k]=true;TB[k+'p']=true});
  const up=()=>{TB[k]=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);tb.appendChild(b);return b}
const tA=tbtn('A','a'),tB=tbtn('B','b');
function touchUI(){const d=GAMES[cur];const show=coarse&&d.tbtn&&mode==='play';tb.style.display=show?'flex':'none';if(show){tA.textContent=d.tbtn[0];tB.textContent=d.tbtn[1]||'B';tB.style.display=d.tbtn[1]?'':'none'}}
// ---------------- cartridges ----------------
const carts=$('carts');
function select(i){cur=i;const d=GAMES[i];mode='auto';G=newGame(d);$('nm').textContent=d.name;$('about').innerHTML=d.about.map(p=>'<p>'+p+'</p>').join('');$('tags').innerHTML=d.tags.map(t=>'<li>'+t+'</li>').join('');
  for(const[k,c]of [...carts.children].entries())c.classList.toggle('on',k===i);setMode(mode);try{history.replaceState(null,'','#'+d.id)}catch(e){}frame()}
GAMES.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='cart';const c=document.createElement('canvas');c.width=W;c.height=H;
  const nm=document.createElement('span');nm.className='nm';nm.textContent=d.name;const rf=document.createElement('span');rf.className='ref';rf.textContent=d.ref;b.append(c,nm,rf);
  b.onclick=()=>{select(i);stage.scrollIntoView({block:'nearest',behavior:'smooth'})};carts.appendChild(b);d._thumb=c});
// thumbnails are simulated one per task after the page is up, so it opens at once; the game being played just lends its live frame
function thumb(d){const keep=[cur,G];cur=GAMES.indexOf(d);G=newGame(d);G.auto=true;G.thumb=true;for(let k=0;k<(d.thumbAt||300);k++){const pad=d.ai(G);if(G.stop>0)G.stop--;else{d.tick(G,pad);G.t++}S.frame++}d.draw(G);S.raw=false;K.present();
  const g=d._thumb.getContext('2d');g.putImageData(S.img,0,0);cur=keep[0];G=keep[1]}
function thumbs(){const q=GAMES.slice();const one=()=>{const d=q.shift();if(!d)return;if(GAMES.indexOf(d)===cur){if(!d._lent){d._lent=1;q.push(d)}else{d.draw(G);S.raw=false;K.present();d._thumb.getContext('2d').putImageData(S.img,0,0)}}else thumb(d);setTimeout(one,30)};setTimeout(one,200)}
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

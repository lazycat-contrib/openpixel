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
// particles: point/streak bits with gravity and drag, drawn as 1–3 px
function Parts(){const L=[];return{L,
  add(x,y,vx,vy,c,o){o=o||{};if(L.length>1600)return;L.push({x,y,vx,vy,c,t:0,life:o.life||30,g:o.g!=null?o.g:0.08,dr:o.dr!=null?o.dr:0.96,s:o.s||1,e:o.e||0,c2:o.c2,floor:o.floor})},
  burst(x,y,n,sp,cols,o){for(let i=0;i<n;i++){const a=K.rnd()*Math.PI*2,v=sp*(0.35+K.rnd()*0.65);this.add(x,y,Math.cos(a)*v,Math.sin(a)*v-(o&&o.up||0),cols[i%cols.length],o)}},
  tick(){for(let i=L.length-1;i>=0;i--){const p=L[i];p.t++;p.vy+=p.g;p.vx*=p.dr;p.vy*=p.dr;p.x+=p.vx;p.y+=p.vy;if(p.floor!=null&&p.y>p.floor){p.y=p.floor;p.vy*=-0.4;p.vx*=0.6}if(p.t>p.life)L.splice(i,1)}},
  draw(ox,oy){ox=ox||0;oy=oy||0;for(const p of L){const c=p.c2!=null&&p.t>p.life*0.55?p.c2:p.c;const s=p.t>p.life*0.7&&p.s>1?p.s-1:p.s;K.rect(p.x-ox-(s>>1),p.y-oy-(s>>1),s,s,c,p.e)}}}}



// ================= 拉坯: throw a pot on the wheel. Steady the clay, pull the walls up between your hands, shape it to the master's outline, fire it =================
// The pot is a stack of 1 px rings, each with a radius and a wall thickness. Pinching the wall while the hands rise thins it and lifts the clay
// into new rings at the rim; holding the hands at a radius moves the wall there and stretching it thins it. Too thin and it tears; too steep a
// step from one ring to the next and it slumps. The same rings are drawn spinning (grog specks travel round, throwing lines catch the light) and,
// after the kiln, glazed: celadon with crackle, temmoku with oil spots, Jun blue with purple splashes.
const POT=(function(){const {W,H,S,mix,clamp,lerp,hash,rnd,rr,vnoise}=K;const col=S.col,em=S.em;
const mx=(a,b,t)=>{const ar=a>>16&255,ag=a>>8&255,ab=a&255;return((ar+(((b>>16&255)-ar)*t>>8))<<16)|((ag+(((b>>8&255)-ag)*t>>8))<<8)|(ab+(((b&255)-ab)*t>>8))};
const CX=240,BY=214,MAXH=150;
const TGT=[
 {name:'青瓷碗',glaze:'celadon',pts:[[0,20],[4,28],[12,40],[22,50],[30,56],[34,58]]},
 {name:'天目梅瓶',glaze:'temmoku',pts:[[0,22],[10,28],[36,38],[62,44],[76,40],[90,26],[98,14],[104,12],[108,14]]},
 {name:'钧窑玉壶春',glaze:'jun',pts:[[0,22],[10,30],[26,38],[42,36],[60,24],[76,14],[88,12],[100,16],[110,22]]}];
function tprof(t){const p=t.pts,top=p[p.length-1][0],r=new Float32Array(top+1);for(let k=0;k<=top;k++){let i=1;while(i<p.length-1&&p[i][0]<k)i++;const a=p[i-1],b=p[i],u=clamp((k-a[0])/Math.max(1,b[0]-a[0]),0,1),s=u*u*(3-2*u);r[k]=a[1]+(b[1]-a[1])*(0.5*u+0.5*s)}return r}
for(const t of TGT){t.r=tprof(t);t.h=t.r.length;let v=0;for(let k=0;k<t.h;k++)v+=t.r[k]*4.5;t.vol=v}
// ---------------- the studio, baked: a warm plaster wall, shelves of finished pots, a window with afternoon light, the wheel ----------------
let ST=null;
function bake(){if(ST)return ST;K.setSeed(1212);const A=new Int32Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const n=vnoise(x*0.03,y*0.03,1)*0.6+vnoise(x*0.15,y*0.15,2)*0.4;let c=mix(0x6a5040,0x8a6a52,n);const sun=clamp(1-Math.abs((x-60)-(y*0.6))/90,0,1)*clamp(1-y/230,0,1);c=mix(c,0xe8b878,sun*0.35);A[y*W+x]=c}
  // window, upper left: bright panes, the frame, light shafts falling across the room
  for(let y=20;y<110;y++)for(let x=24;x<104;x++){const fr=x<28||x>99||y<24||y>105||Math.abs(x-64)<2||Math.abs(y-64)<2;A[y*W+x]=fr?0x3a2618:mix(0xfff0c8,0xf8d898,(y-24)/80)}
  // shelves on the right with pots in silhouette and a few glazed ones catching light
  for(const sy of[70,130]){for(let x=330;x<470;x++){for(let y=sy;y<sy+4;y++)A[y*W+x]=y===sy?0xa87a50:0x5a3a24;for(let y=sy+4;y<sy+7;y++)A[y*W+x]=mix(A[y*W+x],0x2a1a10,0.4)}
    for(let k=0;k<5;k++){const px=342+k*27,h=12+(hash(k,sy)*18|0),w=6+(hash(k,sy+1)*6|0),gc=[0x5a8a7a,0x3a2a24,0x6a7aa8,0xa86a3a,0xd8d0c0][(k+sy)%5];
      for(let j=0;j<h;j++){const u=j/h,r=Math.round(w*(0.55+0.6*Math.sin(u*Math.PI*0.9+0.2)));for(let q=-r;q<=r;q++){const y=sy-1-j;A[y*W+px+q]=mix(gc,q<0?0xffffff:0x000000,q<0?0.12+(q===-r+1?0.25:0):0.25*q/r)}}}}
  // floor and the wheel: a splash pan, the steel head
  for(let y=228;y<H;y++)for(let x=0;x<W;x++)A[y*W+x]=mix(0x4a3628,0x3a2a1e,vnoise(x*0.04,y*0.2,3));
  for(let y=210;y<H;y++)for(let x=CX-120;x<=CX+120;x++){const u=(x-CX)/120,v=(y-232)/20;const d=u*u+v*v;if(d>1)continue;let c=d>0.86?0x2a2a30:mix(0x8a8478,0x5a564e,v*0.5+0.5);if(d<0.86&&hash(x,y)<0.03)c=0xb8a890;A[y*W+x]=c}
  // a bucket of slip and a sponge, tools on the bench
  for(let y=196;y<230;y++)for(let x=40;x<74;x++){const e=x===40||x===73;A[y*W+x]=y<199?0x8a8a90:e?0x3a3a40:mix(0x6a6a70,0x4a4a50,(x-40)/34)}for(let x=42;x<72;x++)A[198*W+x]=0x9a8a7a;
  ST=A;return A}
// ---------------- the clay ----------------
function newClay(g,ti){const t=TGT[ti];const h0=Math.round(Math.max(18,t.h*0.42)),r0=34,t0=Math.min(r0-2,t.vol*1.18/(h0*r0));g.cr=[];g.ct=[];for(let k=0;k<h0;k++){g.cr.push(r0-(k>h0-4?(k-h0+4)*1.2:0));g.ct.push(t0)}g.V=0;g.wob=6;g.lines=new Float32Array(MAXH);g.ai={}}
function init(g){bake();g.T=0;g.sv=STORE.get('pottery1',{best:0});g.parts=Parts();g.pops=Pops();g.state='intro';g.it=0;g.ti=0;g.spin=0;g.done=[];g.hand={h:20,r:60,touch:false};g.ph=0;g.fails=0;g.ai={};g.total=0;start(g,0)}
function start(g,ti){g.ti=ti;newClay(g,ti);g.state=g.state==='intro'?'intro':'center';g.cen=0;g.fail=null;g.time=0;g.hand={h:12,r:70,touch:false};g.ai={}}
function snd(n,a){if(!K.live())return;const t=K.now();
  if(n==='tear'){K.noise(0.4,0.1,t,'lowpass',900,150,1);K.tone('sine',140,50,0.4,0.05,t)}
  else if(n==='cut'){K.noise(0.25,0.05,t,'highpass',4000,2500,2)}
  else if(n==='done'){[392,523,659,784].forEach((f,i)=>K.tone('triangle',f,f,0.6,0.03,t+i*0.1))}
  else if(n==='kiln'){K.noise(2.5,0.05,t,'lowpass',500,200,0.7)}
  else if(n==='ping'){// cooling glaze pings
    for(let i=0;i<6;i++){const f=2400+rnd()*2200;K.tone('sine',f,f,0.25,0.012,t+rnd()*1.5)}}
  else if(n==='reveal'){[523,659,784,1047,1319].forEach((f,i)=>{K.tone('sine',f,f,1.5,0.03,t+i*0.12);K.tone('sine',f*2,f*2,0.5,0.008,t+i*0.12)})}}
function beds(g){if(!K.live()||g.thumb)return;const on=g.state==='throw'||g.state==='center';K.bed('wheel','lowpass',160,0.7);K.bedSet('wheel',on?0.03:0.005,120+(on?60:0));K.bed('wet','bandpass',900,1.4);K.bedSet('wet',on&&g.hand.touch?0.03:0,700+g.hand.h*4)}
const H_=g=>g.cr.length;
function tick(g,pad){g.T++;g.parts.tick();g.pops.tick();beds(g);if(g.state==='center'||g.state==='throw')g.spin+=0.22;
  if(g.state==='intro'){g.it++;g.spin+=0.1;if(g.it>200||g.it>40&&(pad.a||pad.b)&&!g.auto)g.state='center';return}
  if(g.state==='kiln'){g.kt++;if(g.kt===2)snd('kiln');if(g.kt===200)snd('ping');if(g.kt>=230){g.state='reveal';g.rt=0;snd('reveal')}return}
  if(g.state==='reveal'){g.rt++;g.spin+=0.012;if(g.rt>260&&(pad.a||pad.b||g.auto&&g.rt>330)){if(g.ti<TGT.length-1)start(g,g.ti+1);else{g.state='shelf';g.st=0;if(g.total>(g.sv.best||0)){g.sv.best=g.total;if(!g.auto)STORE.set('pottery1',g.sv)}}}return}
  if(g.state==='shelf'){g.st++;if(g.st>400&&(pad.a||g.auto&&g.st>460)){const keep=g.sv;init(g);g.state='center'}return}
  if(g.state==='broke'){g.bt++;if(g.bt>110){g.fails++;newClay(g,g.ti);g.state='center';g.cen=0}return}
  // the hands: the pointer places them (pressed = on the clay); arrows move them, J holds them on the clay
  const hd=g.hand,m=pad.mouse;const oh=hd.h;
  if(m&&!pad.stick){hd.h=clamp(BY-m.y,0,MAXH);hd.r=clamp(Math.abs(m.x-CX),4,100);hd.touch=!!m.down}else{hd.h=clamp(hd.h-(pad.y||0)*1.1,0,MAXH);hd.r=clamp(hd.r+(pad.x||0)*0.7,4,100);hd.touch=!!pad.fire}
  const dh=hd.h-oh;
  if(g.state==='center'){// the lump wobbles until both hands hold it steady near its waist
    const near=hd.touch&&hd.h<H_(g)+6&&hd.r<g.cr[Math.min(H_(g)-1,Math.max(0,hd.h|0))]+6;if(near){g.wob=Math.max(0,g.wob-0.045);g.cen++}if(g.wob<=0.05){g.state='throw';g.pops.add(CX,BY-H_(g)-16,'泥定住了',0xfff0d8,{size:10})}
    g.time++;return}
  g.time++;
  // throwing: in contact, the wall goes to the hands' radius; rising while pinching thins it and the clay climbs to the rim
  const n=H_(g);if(hd.touch&&hd.h<n+2){const k0=Math.round(hd.h);for(let k=Math.max(0,k0-6);k<=Math.min(n-1,k0+6);k++){const w=Math.exp(-((k-k0)*(k-k0))/10);const old=g.cr[k];const nr=old+clamp((hd.r-old)*0.12*w,-0.5,0.5);if(nr<g.ct[k]+1.5){continue}g.ct[k]*=old/nr;g.cr[k]=nr;
      if(dh>0){const th=Math.min(g.ct[k]-1,0.16*dh*w*Math.min(1.5,g.ct[k]/4));if(th>0){g.ct[k]-=th;g.V+=g.cr[k]*th}}g.lines[k]=Math.min(1,g.lines[k]+0.02*w)}
    if(g.T%4===0)g.parts.add(CX+(hash(g.T,1)<0.5?-1:1)*hd.r,BY-hd.h,rr(-0.6,0.6),rr(-0.5,0.2),0xb88a6a,{life:20,g:0.12})}
  // clay pulled up becomes new rings at the rim
  while(H_(g)<MAXH){const t=g.cr.length-1,need=g.cr[t]*g.ct[t];if(g.V<need)break;g.V-=need;g.cr.push(g.cr[t]-0.15);g.ct.push(g.ct[t]);g.lines[t+1]=g.lines[t]}
  // failures: a torn wall or a ring that juts out too far from the one under it
  for(let k=1;k<H_(g)&&!g.fail;k++){if(g.ct[k]<1.6)g.fail=['裂了',k];else if(Math.abs(g.cr[k]-g.cr[k-1])>2.8)g.fail=['塌了',k]}
  if(g.fail){g.state='broke';g.bt=0;snd('tear');g.pops.add(CX,BY-g.fail[1]-12,g.fail[0]+'——重来',0xffd8c8,{size:11,life:90});for(let i=0;i<40;i++)g.parts.add(CX+rr(-40,40),BY-g.fail[1]+rr(-6,6),rr(-1.5,1.5),rr(-2,0),0x9a6a4a,{life:40,g:0.15});return}
  // K: below the rim it cuts the rim off with the wire; above the rim it says the pot is finished
  if(pad.b){if(hd.h<H_(g)-2&&hd.h>4){const cut=Math.round(hd.h);g.cr.length=cut;g.ct.length=cut;g.V=0;snd('cut');g.parts.burst(CX,BY-cut,16,1.2,[0xb88a6a,0x8a5a3a],{life:30,g:0.12})}else finish(g)}}
function finish(g){const t=TGT[g.ti];let err=0;const n=Math.max(t.h,H_(g));for(let k=0;k<n;k++){const a=k<H_(g)?g.cr[k]:0,b=k<t.h?t.r[k]:0;err+=Math.abs(a-b)}err/=n;
  const sc=Math.max(0,Math.round(1000-err*90-g.fails*80-Math.max(0,g.time-1800)*0.1));const grade=sc>880?'名品':sc>720?'上品':sc>500?'良品':'次品';g.score=sc;g.grade=grade;g.total+=sc;
  g.done[g.ti]={cr:g.cr.slice(),ct:g.ct.slice(),glaze:t.glaze,grade,sc,seed:g.T};g.state='kiln';g.kt=0;snd('done')}
// ---------------- autoplay: pull the walls up in passes until tall enough, then shape top to bottom, cut the rim, finish ----------------
function ai(g){const pad={x:0,y:0,a:false,b:false,fire:false,mouse:null};const A=g.ai,hd=g.hand;const t=TGT[g.ti];
  if(g.state==='reveal'){pad.a=g.rt>330;return pad}if(g.state==='shelf'){pad.a=g.st>460;return pad}
  const goto=(h,r,touch)=>{pad.mouse={x:CX+r,y:BY-h,down:touch}};
  if(g.state==='center'){const n=H_(g);goto(n*0.5,g.cr[Math.round(n*0.5)]-1,true);return pad}
  if(g.state!=='throw'){goto(hd.h,hd.r,false);return pad}
  if(!A.mode){A.mode='pull';A.h=1;A.pass=0}
  const n=H_(g);
  if(A.mode==='pull'){if(n>=t.h+6||A.pass>9){A.mode='shape';A.h=n+2;return pad}
    if(A.h>=n-1){A.pass++;A.h=1;goto(1,g.cr[0]+4,false);return pad}A.h+=0.9;const k=Math.min(n-1,Math.round(A.h));const want=Math.min(g.cr[k],t.r[Math.min(t.h-1,k)]+4);goto(A.h,want-0.6,true);return pad}
  if(A.mode==='shape'){if(A.h<=1){A.pass2=(A.pass2||0)+1;if(A.pass2>=3){A.mode='cut';return pad}A.h=n+1}A.h-=0.6;const k=Math.max(0,Math.min(t.h-1,Math.round(A.h)));goto(A.h,t.r[k],A.h<n);return pad}
  if(A.mode==='cut'){if(n>t.h+1){goto(t.h,t.r[t.h-1]+12,false);if(Math.abs(hd.h-t.h)<1)pad.b=true;return pad}goto(n+20,40,false);A.f=(A.f||0)+1;if(A.f>30)pad.b=true;return pad}
  return pad}
// ---------------- drawing ----------------
const GL={celadon:{a:0x8ab8a0,b:0x4a7a68,hi:0xe8fff0},temmoku:{a:0x3a2418,b:0x140a06,hi:0xc8b090},jun:{a:0x6a90c8,b:0x3a5088,hi:0xe8f0ff}};
function pot(cr,ct,cx,by,o){// o: {spin, wob, lines, glaze, seed, lit}
  const n=cr.length;const L=o.glaze?GL[o.glaze]:null;
  for(let k=0;k<n;k++){const y=by-k;if(y<0)continue;const r=cr[k],wo=o.wob?Math.sin(o.spin*1+k*0.05)*o.wob*(0.3+k/60):0,c0=cx+wo;const dr=k>0?cr[k]-cr[k-1]:0;
    for(let x=Math.floor(c0-r);x<=Math.ceil(c0+r);x++){const u=(x+0.5-c0)/r;if(u<-1||u>1||x<0||x>=W)continue;const sn=Math.sqrt(1-u*u);
      // light from the upper left; a slope facing up catches more of it
      let l=0.42+0.45*sn*(0.6-u*0.5)+0.25*(-dr)*sn;l=clamp(l,0.08,1.1);let c;
      if(!L){const ang=Math.asin(u)+o.spin,s=ang*r;const sp=hash(Math.floor(s*0.9)&1023,k)<0.05;const ln=o.lines?o.lines[k]:0;const ring=Math.sin(k*1.6+cr[k]*0.3)*ln;
        c=mix(0x5a3020,0xc88a62,clamp(l+ring*0.12,0,1));if(sp)c=mix(c,0x3a2014,0.5);if(sn>0.55&&u<-0.25&&u>-0.55&&(k%7<3))c=mix(c,0xf0c8a8,0.25)}
      else{// glaze: colour pooling darker where the wall steps in, crackle, oil spots or splashes, the bare foot
        const ang=Math.asin(u)+o.spin,s=ang*r;const pool=clamp(-dr*0.6+0.2,0,1);c=mix(L.b,L.a,clamp(l*0.95-pool*0.3,0,1));
        if(o.glaze==='celadon'){const cr_=vnoise(s*0.35,k*0.35,o.seed&63);if(Math.abs(cr_-0.5)<0.02)c=mix(c,0x3a5040,0.5)}
        if(o.glaze==='temmoku'){const sx=Math.floor(s*0.5)&2047,sy=(k/3|0)+o.seed,h=hash(sx,sy);if(h<0.09){const fx=(s*0.5)%1,fy=(k/3)%1;const dd=(fx-0.5)**2+(fy-0.5)**2;if(dd<0.09)c=mix(c,dd<0.04?0xc8d0d8:0x8a6a4a,dd<0.04?0.75:0.5)}if(k>n-5)c=mix(c,0x9a6a3a,0.65)}
        if(o.glaze==='jun'){const pu=vnoise(s*0.08,k*0.05,(o.seed&31)+5);if(pu>0.62)c=mix(c,0x9a3a7a,clamp((pu-0.62)*4,0,0.85))}
        if(k<4)c=mix(0x6a4a30,0x9a7050,l);
        // specular: a window highlight that stays still while the pot turns
        const spec=Math.exp(-((u+0.42)*(u+0.42))/0.006)*sn;if(spec>0.2&&k>4)c=mix(c,L.hi,clamp(spec-0.2,0,0.8));if(k>4&&Math.abs(u-0.62)<0.04)c=mix(c,L.hi,0.18)}
      if(Math.abs(u)>0.97)c=mix(c,0x1a0e08,0.4);if(o.heat)c=mix(c,mix(0xff6a20,0xfff0c0,o.heat),0.25+o.heat*0.6);col[y*W+x]=c;if(o.lit)em[y*W+x]=o.lit}}
  // the rim and the opening, seen a little from above
  const t=n-1;if(t<0)return;const r=cr[t],ri=Math.max(1,r-ct[t]),wo=o.wob?Math.sin(o.spin+t*0.05)*o.wob*(0.3+t/60):0;const ey=Math.max(1.5,r*0.18);
  for(let j=-Math.ceil(ey);j<=Math.ceil(ey);j++)for(let x=Math.floor(cx+wo-r);x<=Math.ceil(cx+wo+r);x++){const u=(x+0.5-cx-wo)/r,v=j/ey;if(u*u+v*v>1)continue;const ui=(x+0.5-cx-wo)/ri,vi=j/(ri/r*ey);const inside=ui*ui+vi*vi<1;const y=by-t+j;if(y<0||x<0||x>=W)continue;
    let c=inside?(L?mix(L.b,0x000000,0.45+v*0.3):mix(0x3a2014,0x5a3020,-v*0.5+0.5)):(L?mix(L.a,L.hi,0.3-v*0.3):mix(0xb07a58,0xd89a72,-v*0.5+0.5));col[y*W+x]=c}}
function hands(g){const hd=g.hand;if(g.state!=='throw'&&g.state!=='center')return;const n=H_(g);const k=clamp(Math.round(hd.h),0,n-1);const wallR=hd.touch&&hd.h<n+2?g.cr[k]:hd.r;const y=BY-hd.h;
  for(const sd of[-1,1]){const x=CX+sd*(wallR+1);// forearm from the lower corner to the wrist, a cupped palm, fingers on the clay
    const ax=sd<0?-20:W+20,ay=Math.min(H+30,y+90),wx=x+sd*16,wy=y+8;const L=Math.hypot(wx-ax,wy-ay),nx=-(wy-ay)/L,ny=(wx-ax)/L;
    for(let s2=0;s2<=L;s2+=0.6){const px=ax+(wx-ax)*s2/L,py=ay+(wy-ay)*s2/L,w=9-s2/L*2;for(let q=-w;q<=w;q+=0.6){const lt=(q*sd)/w;K.px(Math.round(px+nx*q),Math.round(py+ny*q),Math.abs(q)>w-1?0x5a3420:mix(0xe0a878,0x9a643e,clamp(lt*0.5+0.5,0,1)))}}
    for(let j=-9;j<=9;j++)for(let q=-2;q<16;q++){if((q-7)*(q-7)/72+j*j/90>1)continue;const X=Math.round(x+sd*(q+1)),Y=Math.round(y+j);const edge=(q-7)*(q-7)/72+j*j/90>0.8;const clay=hd.touch&&q<5;K.px(X,Y,edge?0x6a3e24:clay?mix(0xb88a6a,0x8a5a3a,(j+9)/18):mix(0xeab48a,0xb07850,clamp(q/16+(j+9)/36,0,1)))}
    for(let f=0;f<4;f++){const fy=Math.round(y-7+f*4.2);for(let q=-1;q<3;q++){K.px(Math.round(x+sd*q),fy,hd.touch?0x8a5a3a:0xd8a078);K.px(Math.round(x+sd*q),fy+1,hd.touch?0x7a4a2a:0xb88058)}}}}
function draw(g){const A=bake(),T=g.T;for(let i=0;i<W*H;i++){col[i]=A[i];em[i]=0}
  // dust in the window light
  for(let k=0;k<50;k++){const x=((k*53+T*0.15*(1+k%3))%300)+20,y=((k*97+Math.sin(T*0.01+k)*20)%200)+20;const sun=clamp(1-Math.abs((x-60)-(y*0.6))/80,0,1);if(sun>0.2)K.pxa(x,y,0xfff0c8,sun*0.6)}
  const t=TGT[g.ti];
  if(g.state==='kiln'){kiln(g);hud(g);return}
  if(g.state==='reveal'){reveal(g);hud(g);return}
  if(g.state==='shelf'){shelf(g);hud(g);return}
  // the master's outline, dotted
  if(g.state==='throw'||g.state==='center')for(let k=0;k<t.h;k+=2)for(const sd of[-1,1]){const x=Math.round(CX+sd*t.r[k]),y=BY-k;if(((k>>1)+(T>>3))%3){K.pxa(x,y,0xfff0d8,0.8);K.pxa(x+sd,y,0x3a2010,0.4)}}
  // wheel head, then the clay with slip shine; the spinning shows in the specks and the throwing lines
  for(let y=BY-2;y<BY+8;y++)for(let x=CX-70;x<=CX+70;x++){const u=(x-CX)/70,v=(y-BY-3)/5;if(u*u+v*v>1)continue;col[y*W+x]=v<0?mix(0xa8a8a8,0x6a6a6a,u*0.5+0.5):0x3a3a3a}
  if(g.state==='broke'){const sl=Math.min(1,g.bt/40);const cr=g.cr.map((r,k)=>r+(k>g.fail[1]-4?sl*(k-g.fail[1]+4)*1.4:0)),ct=g.ct;const keep=Math.max(4,Math.round(g.cr.length*(1-sl*0.5)));pot(cr.slice(0,keep),ct.slice(0,keep),CX,BY,{spin:g.spin,wob:sl*6})}
  else pot(g.cr,g.ct,CX,BY,{spin:g.spin,wob:g.wob,lines:g.lines});
  hands(g);g.parts.draw(0,0);g.pops.draw(0,0);
  // wall thickness gauge at the hands' height
  if(g.state==='throw'){const n=H_(g),k=clamp(Math.round(g.hand.h),0,n-1);const th=g.ct[k];UI.bar(14,250,80,6,clamp(th/8,0,1),th<2.4?0xff6a4a:0xd8a870);K.text('壁厚',98,247,0xf0e0d0,{size:9,ink:0x000000})}
  hud(g)}
function kiln(g){const k=g.kt;// a wood kiln at night: the door glows, flames lick out of the spy hole, the pot inside goes from red to white heat
  for(let y=40;y<240;y++)for(let x=120;x<360;x++){const i=y*W+x;if(y<100&&((x-240)/120)**2+((y-100)/60)**2>1)continue;const row=y>>3,br=y%8===0||((x+(row%2)*8)%16===0);col[i]=br?0x2a1a14:mix(0x7a4030,0x5a2a1e,vnoise(x*0.2,y*0.2,3));if(y<100&&((x-240)/120)**2+((y-100)/60)**2>0.9)col[i]=0x3a2018}
  const heat=clamp(k/160,0,1)*(k>200?clamp((230-k)/30,0,1):1);for(let y=110;y<232;y++)for(let x=176;x<304;x++){const i=y*W+x;const top=y<130&&((x-240)/64)**2+((y-130)/20)**2>1;if(top)continue;
    const n=vnoise(x*0.09,y*0.035+k*0.09,9)*0.7+vnoise(x*0.25,y*0.1+k*0.2,10)*0.3;const v=clamp(n*1.3-(232-y)/150+0.25,0,1)*(0.35+heat*0.75);let c=v<0.25?mix(0x140604,0x6a1a08,v/0.25):v<0.55?mix(0x6a1a08,0xff6a1a,(v-0.25)/0.3):v<0.8?mix(0xff6a1a,0xffd070,(v-0.55)/0.25):mix(0xffd070,0xfff8e0,(v-0.8)/0.2);col[i]=c;em[i]=v*200|0}
  const d=g.done[g.ti];pot(d.cr,d.ct,240,226,{spin:0,wob:0,heat:heat,lit:heat*120|0});
  for(let i=0;i<40;i++){const x=200+((i*37+k*3)%80),y=104-((k*2+i*13)%60);K.pxa(x,y,0xffa040,0.5)}
  K.text(k<200?'入窑 · 烧到一千二百多度':'出窑 · 冷却时釉面会发出细响',W/2,12,0xffe0c0,{size:11,fam:'kai',align:'c',ink:0x000000})}
function reveal(g){const d=g.done[g.ti],r=g.rt;// on a stand under a soft spot, turning slowly
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,dd=Math.hypot(x-240,(y-150)*1.2);col[i]=mix(0x6a5038,0x0a0806,clamp(dd/200,0,1));em[i]=0}
  for(let y=214;y<232;y++)for(let x=170;x<310;x++){const u=(x-240)/70,v=(y-222)/9;if(u*u+v*v>1)continue;col[y*W+x]=v<-0.3?mix(0x7a4a2a,0x5a3218,u*0.5+0.5):0x2a1608}
  pot(d.cr,d.ct,240,214,{spin:g.spin,glaze:d.glaze,seed:d.seed});
  const a=clamp((r-40)/40,0,1);K.text(TGT[g.ti].name,W/2,18,0xf8ecd8,{size:20,fam:'kai',align:'c',a,sp:4,ink:0x000000});K.text(d.grade+' · '+d.sc+' 分',W/2,46,d.grade==='名品'?0xffd870:0xe8d8c0,{size:12,align:'c',a,ink:0x000000});
  if(r>60){const s=Math.min(1,(r-60)/12),sz=Math.round(26+(1-s)*24);const x=360-sz/2,y=150-sz/2;for(let j=0;j<sz;j++)for(let q=0;q<sz;q++){if(hash(q*5+x,j*3)<((q<1||j<1||q>sz-2||j>sz-2)?0.3:0.05))continue;K.pxa(x+q,y+j,0xb8282a,0.9*s)}K.text(d.grade[0],x+sz/2,y+sz*0.06,0xf8e8d0,{size:Math.round(sz*0.4),fam:'kai',align:'c',a:s});K.text(d.grade[1],x+sz/2,y+sz*0.5,0xf8e8d0,{size:Math.round(sz*0.4),fam:'kai',align:'c',a:s})}}
function shelf(g){for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0;col[i]=mix(0x3a2a20,0x2a1e16,vnoise(x*0.03,y*0.03,2));em[i]=0}
  for(let x=40;x<440;x++)for(let y=206;y<214;y++)col[y*W+x]=y===206?0xb88a5a:0x6a4428;
  g.done.forEach((d,i)=>{if(!d)return;const s=0.72,cr=[],ct=[];for(let k=0;k<d.cr.length*s;k++){cr.push(d.cr[Math.floor(k/s)]*s);ct.push(d.ct[Math.floor(k/s)]*s)}pot(cr,ct,120+i*120,205,{spin:g.st*0.01+i,glaze:d.glaze,seed:d.seed});K.text(TGT[i].name+' · '+d.grade,120+i*120,222,0xf0e0c8,{size:10,align:'c',fam:'kai'})});
  const a=clamp(g.st/40,0,1);K.text('一窑三器',W/2,24,0xf8ecd8,{size:22,fam:'kai',align:'c',a,sp:6});K.text('总分 '+g.total+(g.sv.best?' · 最高 '+g.sv.best:''),W/2,56,0xe0d0b8,{size:10,align:'c',a})}
function hud(g){if(g.state==='intro'){const a=clamp((g.it-20)/30,0,1)*clamp((200-g.it)/30,0,1);K.text('拉 坯',W/2,30,0xfff0d8,{size:30,bold:true,fam:'kai',align:'c',ink:0x1a0e08,a,sp:10});K.text('转盘上一团泥。先扶稳它，再把它拉成师傅画的样子',W/2,70,0xf0e0c8,{size:10,align:'c',ink:0x1a0e08,a});return}
  if(g.state==='center'||g.state==='throw'||g.state==='broke'){K.text('第'+'一二三'[g.ti]+'件 · '+TGT[g.ti].name,14,10,0xfff0d8,{size:12,fam:'kai',ink:0x000000});
    K.text(g.state==='center'?'按住双手扶稳泥团，等它不再晃':'按住贴泥，往上提就拉薄拉高 · 左右是收放 · K 在口沿下切口 / 在上方完成',W/2,H-12,0xf0e0d0,{size:9,align:'c',ink:0x000000});
    if(g.state==='center')UI.bar(W/2-40,22,80,5,1-g.wob/6,0xd8a870)}}
function info(g){return '拉坯 · 第'+(g.ti+1)+'件'+(g.sv&&g.sv.best?' · 最高 '+g.sv.best:'')}
return{init,tick,draw,ai,info}})();
GAMES.push({id:'pottery',name:'拉坯',ref:'手艺 · 转盘上的陶泥',keys:'鼠标：手的位置，按住就贴到泥上；往上提就把泥拉高拉薄，左右移动收口放肚 · 键盘：方向键移手，按住 J 贴泥 · K：手在口沿下面就用线切口，在上面就完成送窑 · 手机：手指就是手',touch:'pointer',tbtn:['贴泥','切 / 完成'],thumbAt:1950,
  init:POT.init,tick:POT.tick,draw:POT.draw,ai:POT.ai,info:POT.info,canAttract:g=>g.state==='center'||g.state==='intro',
  about:['陶工的转盘上有一团泥。先用两手扶稳，再一圈圈往上拉，拉成师傅画好的样子：一只碗，一只梅瓶，一只玉壶春。','泥拉得太薄会裂，一圈比下一圈凸出太多会塌。做好了切口、上釉、进窑，开窑才知道成色：青瓷开片，天目油滴，钧窑紫斑。'],
  tags:['坯是一摞 1 像素的泥圈，每圈有半径和壁厚','往上提时捏薄的泥会堆到口沿上，长成新的一圈','转动靠泥里的砂点和拉坯纹','三种釉：开片、油滴、窑变紫斑']});



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

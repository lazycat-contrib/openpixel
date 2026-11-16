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


// ================= shared bits for the twenty pieces: an autoplay queue, easing, palettes =================
// AIQ: the demo hand walks a queue of [x, y, down, frames, fn?] steps; plan(g, A) refills it when empty.
function AIQ(g,plan){const A=g.ai||(g.ai={q:[],k:0,x:240,y:135,down:false,sx:240,sy:135});if(!A.q.length)plan(g,A);if(!A.q.length)A.q.push([A.x,A.y,false,30]);const tg=A.q[0];A.k++;
  if(A.k===1){A.sx=A.x;A.sy=A.y;if(tg[4])tg[4](g)}const k=Math.min(1,A.k/Math.max(1,tg[3]));const e=tg[5]==='lin'?k:(k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2);
  A.x=A.sx+(tg[0]-A.sx)*e;A.y=A.sy+(tg[1]-A.sy)*e;const down=tg[2],click=down&&!A.down;A.down=down;if(A.k>=tg[3]){A.q.shift();A.k=0}
  return{x:0,y:0,mouse:{x:A.x,y:A.y,down,click}}}
// a stroke helper: push a polyline as one pressed drag
function aiStroke(A,pts,spd){const p0=pts[0];A.q.push([p0[0],p0[1],false,24],[p0[0],p0[1],true,3]);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];A.q.push([b[0],b[1],true,Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/(spd||3))),null,'lin'])}A.q.push([pts[pts.length-1][0],pts[pts.length-1][1],false,6])}
// shared mouse tracker: previous position, velocity, press edges
function MT(g,m){const T=g._mt||(g._mt={x:240,y:135,px:240,py:135,vx:0,vy:0,down:false,pdown:false,on:false});T.pdown=T.down;
  if(m){T.px=T.on?T.x:m.x;T.py=T.on?T.y:m.y;T.x=m.x;T.y=m.y;T.vx=T.vx*0.6+(T.x-T.px)*0.4;T.vy=T.vy*0.6+(T.y-T.py)*0.4;T.down=m.down;T.on=true;T.click=m.click}else{T.on=false;T.down=false;T.click=false}
  T.up=T.pdown&&!T.down;return T}



// ================= 冰裂: a frozen lake that sings when it cracks =================
// Looking straight down at black lake ice under a dusting of snow. Drag to sweep the snow away and find what froze in
// it: stacks of white methane bubbles, a leaf, a koi drifting slowly underneath. Tap to strike the ice: cracks race out
// radially, branch and join in rings, and the lake answers with that falling, laser-like ping ice makes. Hold and the
// crack keeps growing until dark water wells up through it and spreads under the snow.
const ICE=(function(){const {W,H,S,mix,mul,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const BASE=new Uint32Array(N),SN=new Float32Array(N),CK=new Float32Array(N),WA=new Float32Array(N),CID=new Uint16Array(N);let built=false;
function build(){built=true;K.setSeed(1414);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const f=fbm(x*0.008,y*0.008,4,1401),f2=fbm(x*0.04,y*0.01,3,1402);let c=mix(0x06161f,0x14364a,f*0.9+0.1);c=mix(c,0x1c4a5e,Math.max(0,f2-0.55)*1.5);BASE[y*W+x]=c}
  // old healed cracks deep in the ice: faint pale planes
  for(let k=0;k<26;k++){let x=K.rr(0,W),y=K.rr(0,H),a=K.rr(0,6.28);const n=K.ri(30,140);for(let i=0;i<n;i++){a+=K.rr(-0.2,0.2);x+=Math.cos(a);y+=Math.sin(a);const X=Math.round(x),Y=Math.round(y);if(X<0||Y<0||X>=W-2||Y>=H-2)break;const p=Y*W+X;BASE[p]=mix(BASE[p],0x5a8aa0,0.35);BASE[p+W+1]=mix(BASE[p+W+1],0x3a6a80,0.2)}}
  // stacks of frozen bubbles: discs seen from above, each layer a little offset and smaller
  for(let k=0;k<90;k++){const cx=K.rr(10,W-10),cy=K.rr(10,H-10);const n=K.ri(2,6);const big=K.rr(1.5,5);for(let j=0;j<n;j++){const r=big*(1-j*0.13)*K.rr(0.8,1.1),ox=cx+j*K.rr(0.5,1.6),oy=cy+j*K.rr(-0.4,0.8);const dep=1-j/n;
    for(let y=Math.floor(oy-r-1);y<=oy+r+1;y++)for(let x=Math.floor(ox-r-1);x<=ox+r+1;x++){if(x<0||y<0||x>=W||y>=H)continue;const d=Math.hypot(x-ox,y-oy);if(d>r)continue;const p=y*W+x;const rim=d>r-1;const hl=Math.hypot(x-ox+r*0.35,y-oy+r*0.35)<r*0.3;BASE[p]=mix(BASE[p],hl?0xffffff:rim?0xd8eef8:0x8ab8c8,(rim?0.75:hl?0.9:0.35)*(0.45+0.55*dep))}}}
  // a frozen maple leaf and some grass blades
  {const lx=330,ly=70;for(let y=-8;y<=8;y++)for(let x=-8;x<=8;x++){const a=Math.atan2(y,x),r=Math.hypot(x,y);const lim=6+2.5*Math.cos(a*5);if(r<lim){const p=(ly+y)*W+lx+x;BASE[p]=mix(BASE[p],r<1||(Math.abs(Math.sin(a*5))<0.12)?0x6a2a10:0xb8441c,0.55)}}for(let i=0;i<8;i++)BASE[(ly+8+i)*W+lx+(i>>2)]=mix(BASE[(ly+8+i)*W+lx],0x6a2a10,0.5)}
  for(let k=0;k<12;k++){let x=K.rr(0,W),y=K.rr(0,H),a=K.rr(0,6.28);for(let i=0;i<K.ri(14,30);i++){a+=0.02;x+=Math.cos(a);y+=Math.sin(a);const X=Math.round(x),Y=Math.round(y);if(X>=0&&Y>=0&&X<W&&Y<H)BASE[Y*W+X]=mix(BASE[Y*W+X],0x8a8a4a,0.35)}}}
function init(g){if(!built)build();CK.fill(0);WA.fill(0);CID.fill(0);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const f=fbm(x*0.012,y*0.012,4,1403);SN[y*W+x]=clamp((f-0.53)*3.4+(hash(x,y)-0.5)*0.15,0,1)}
  g.tips=[];g.pw=[];g.cid=1;g.hold=null;g.fish={x:150,y:150,a:0,v:0.4,flee:0};g.drift=[]}
function ping(big){if(!K.live())return;const t=K.now();const f0=K.rr(2400,4200);K.noise(0.05,0.08*big,t,'highpass',2000,3000,0.8,0.001);
  // dispersion: the high part arrives first and falls; echoes repeat it
  for(let e=0;e<4;e++){const tt=t+0.04+e*0.13;const v=0.05*big*Math.pow(0.55,e);K.tone('sine',f0,f0*0.08,0.5,v,tt,0.002);K.tone('sine',f0*0.6,f0*0.05,0.6,v*0.5,tt+0.01,0.002)}K.tone('sine',180,60,0.8,0.05*big,t,0.004)}
function strike(g,x,y,pow){const id=g.cid++;const n=K.ri(5,8)+Math.round(pow*3);const a0=K.rr(0,6.28);
  for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2+K.rr(-0.25,0.25);g.tips.push({x,y,a,life:K.rr(60,150)*(0.6+pow),id,w:1,gen:0})}
  for(const r of [K.rr(10,18),K.rr(26,40)])for(let i=0;i<n;i++){const a=a0+(i+0.5)/n*Math.PI*2;g.tips.push({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,a:a+Math.PI/2*(K.rnd()<0.5?1:-1),life:r*0.5,id,w:0.7,gen:1,delay:Math.round(r*0.7)})}
  ping(0.6+pow*0.5);if(Math.hypot(g.fish.x-x,g.fish.y-y)<90){g.fish.flee=90;g.fish.a=Math.atan2(g.fish.y-y,g.fish.x-x)}}
function tick(g,pad){const T=MT(g,pad.mouse);
  if(T.on&&T.down){const sp=Math.hypot(T.vx,T.vy);
    if(T.click)g.hold={x:T.x,y:T.y,t:0,mv:0};
    if(g.hold){g.hold.t++;g.hold.mv=Math.max(g.hold.mv,Math.hypot(T.x-g.hold.x,T.y-g.hold.y));
      if(g.hold.mv<8){if(g.hold.t===8)strike(g,g.hold.x,g.hold.y,0.3);if(g.hold.t>30&&g.hold.t%26===0){strike(g,g.hold.x+K.rr(-3,3),g.hold.y+K.rr(-3,3),0.5);}
        if(g.hold.t>70){const r=Math.min(80,(g.hold.t-70)*0.5);for(let k=0;k<40;k++){const a=K.rnd()*6.28,rr=Math.sqrt(K.rnd())*r;const X=Math.round(g.hold.x+Math.cos(a)*rr),Y=Math.round(g.hold.y+Math.sin(a)*rr);if(X>=0&&Y>=0&&X<W&&Y<H){const p=Y*W+X;WA[p]=Math.min(1,WA[p]+(CK[p]>0?0.5:0.08))}}
          if(K.live()&&SFX.ok('gl',0.3))K.noise(0.4,0.02,K.now(),'lowpass',400,200,0.8,0.05)}}}
    // sweeping: brush the snow aside, powder flies the way you swept
    if(sp>1&&(!g.hold||g.hold.mv>=8)){const r=7;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const X=Math.round(T.x+dx),Y=Math.round(T.y+dy);if(X<0||Y<0||X>=W||Y>=H)continue;const d=Math.hypot(dx,dy);if(d>r)continue;const p=Y*W+X;const take=SN[p]*0.6*(1-d/r);if(take>0.05&&K.rnd()<0.08)g.pw.push({x:X,y:Y,vx:T.vx*K.rr(0.3,0.9)+K.rr(-0.5,0.5),vy:T.vy*K.rr(0.3,0.9)+K.rr(-0.5,0.5),z:K.rr(1,4),vz:K.rr(0.2,1),m:take*4});SN[p]-=take}
      if(K.live()&&SFX.ok('sw',0.07))K.noise(0.12,Math.min(0.05,sp*0.004),K.now(),'bandpass',3000,2000,0.6,0.01)}}
  else{if(g.hold&&g.hold.t<8&&g.hold.mv<8)strike(g,g.hold.x,g.hold.y,0.25);g.hold=null}
  // crack tips race outward, wander, branch, and stop when they meet another crack
  let grow=0;for(let i=g.tips.length-1;i>=0;i--){const tp=g.tips[i];if(tp.delay>0){tp.delay--;continue}
    for(let s=0;s<3;s++){tp.a+=K.rr(-0.18,0.18)*(tp.gen?1:0.45);tp.x+=Math.cos(tp.a);tp.y+=Math.sin(tp.a);tp.life--;const X=Math.round(tp.x),Y=Math.round(tp.y);
      if(X<1||Y<1||X>=W-1||Y>=H-1||tp.life<=0){g.tips.splice(i,1);break}const p=Y*W+X;if(CK[p]>0&&CID[p]!==tp.id){g.tips.splice(i,1);break}
      CK[p]=Math.max(CK[p],tp.w);CID[p]=tp.id;grow++;if(tp.gen<3&&K.rnd()<0.012)g.tips.push({x:tp.x,y:tp.y,a:tp.a+(K.rnd()<0.5?1:-1)*K.rr(0.4,1.1),life:tp.life*K.rr(0.3,0.6),id:tp.id,w:tp.w*0.75,gen:tp.gen+1})}}
  if(grow&&K.live()&&SFX.ok('tk',0.05))K.noise(0.015,0.02,K.now(),'highpass',5000,5000,1,0.001);
  // water creeps along cracks and soaks into nearby snow; slowly refreezes
  if(g.t%2===0)for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const p=y*W+x;const w=WA[p];if(w<0.02)continue;const s=w*0.06;for(const q of [p-1,p+1,p-W,p+W]){if(WA[q]<w){const k=CK[q]>0?1:0.25;WA[q]+=s*k;WA[p]-=s*k*0.6}}WA[p]*=0.9993}
  for(let i=g.pw.length-1;i>=0;i--){const q=g.pw[i];q.x+=q.vx;q.y+=q.vy;q.vx*=0.93;q.vy*=0.93;q.vz-=0.08;q.z+=q.vz;if(q.z<=0){const X=Math.round(q.x),Y=Math.round(q.y);if(X>=1&&Y>=1&&X<W-1&&Y<H-1){SN[Y*W+X]=Math.min(1,SN[Y*W+X]+q.m*0.5);for(const d of [1,-1,W,-W])SN[Y*W+X+d]=Math.min(1,SN[Y*W+X+d]+q.m*0.12)}g.pw.splice(i,1)}}
  // the koi glides under the ice
  const f=g.fish;if(f.flee>0){f.flee--;f.v=lerp(f.v,1.6,0.1)}else{f.v=lerp(f.v,0.35,0.02);f.a+=Math.sin(g.t*0.007)*0.012+(Math.atan2(135-f.y,240-f.x)-f.a)*0.002}f.x+=Math.cos(f.a)*f.v;f.y+=Math.sin(f.a)*f.v;if(f.x<-30)f.x=W+30;if(f.x>W+30)f.x=-30;if(f.y<-30)f.y=H+30;if(f.y>H+30)f.y=-30;
  if(K.SND.ctx){K.bed('icew','bandpass',700,0.8);K.bedSet('icew',0.008,600)}}
function draw(g){const t=g.t;const f=g.fish;
  col.set(BASE);em.fill(0);
  // koi under the ice: soft, dark-orange, blurred by the depth
  {const ca=Math.cos(f.a),sa=Math.sin(f.a);for(let j=-6;j<=6;j++)for(let i=-18;i<=14;i++){const u=i/16,v=j/(5*(1-Math.abs(u+0.1)*0.7)+0.5);const tail=i<-12?Math.sin(t*0.15)*3*((-12-i)/6):0;const vv=(j-tail)/(i<-12?4*(1+(-12-i)/6):5*(1-Math.abs(u+0.1)*0.6));if(Math.abs(vv)>1)continue;
    const sw=Math.sin(t*0.1+i*0.25)*1.2*((14-i)/32);const X=Math.round(f.x+ca*i-sa*(j+sw)),Y=Math.round(f.y+sa*i+ca*(j+sw));if(X<0||Y<0||X>=W||Y>=H)continue;const p=Y*W+X;const spot=hash(Math.round(i/3),Math.round(j/3)+40)<0.4;col[p]=mix(col[p],spot?0xc84a1a:0xe8d8c8,0.3*(1-Math.abs(vv)*0.6))}}
  for(let p=0;p<N;p++){let c=col[p];const w=WA[p],s=SN[p],k=CK[p];
    if(w>0.02)c=mix(c,mix(0x05121a,0x0a2230,hash(p,7)),Math.min(0.75,w));
    if(k>0){const vis=1-Math.min(0.8,s);c=mix(c,0xf0fcff,Math.min(1,0.55+k*0.45)*vis);em[p]=Math.min(255,22*k*vis)}
    if(s>0.12){const x=p%W,y=(p/W)|0;const q=s<0.3?0.35:s<0.55?0.62:s<0.8?0.85:1;const sh=SN[Math.max(0,p-W-1)]-s;let sc=sh>0.08?0xc4d4e2:sh<-0.08?0xffffff:0xe8f0f6;if(hash(x,y)<0.015)sc=0xffffff;const wet=Math.min(1,w*2.5);sc=mix(sc,0x7a8a96,wet);c=mix(c,sc,q)}
    col[p]=c}
  // crack depth: a refracted shadow below-right and a pale fracture plane under the ice
  for(let y=H-3;y>=0;y--)for(let x=W-3;x>=0;x--){const p=y*W+x;if(CK[p]<=0||SN[p]>0.5)continue;const q=p+W+1;if(CK[q]<=0)col[q]=mix(col[q],0x02080e,0.5);const q2=p+2*W+2;if(CK[q2]<=0&&SN[q2]<0.5)col[q2]=mix(col[q2],0x8ac0d8,0.22*CK[p])}
  // flying powder
  for(const q of g.pw){K.pxa(q.x,q.y-q.z,0xffffff,0.8);K.pxa(q.x,q.y,0x5a7080,0.2)}
  // drifting snow dust and a cold light glint
  for(let k=0;k<40;k++){const x=(hash(k,1)*W+t*(0.3+hash(k,2)*0.4))%W,y=(hash(k,3)*H+Math.sin(t*0.01+k)*10+H)%H;K.pxa(x,y,0xffffff,0.35)}}
function ai(g){return AIQ(g,(g,A)=>{const r=K.rnd();
  if(r<0.35){const cx=K.rr(80,400),cy=K.rr(50,220);const pts=[];for(let k=0;k<10;k++)pts.push([cx+K.rr(-40,40),cy+(k%2?-1:1)*K.rr(10,30)]);aiStroke(A,pts,K.rr(3,6));A.q.push([A.x,A.y,false,40])}
  else if(r<0.75){for(let k=0;k<K.ri(1,3);k++){const x=K.rr(40,440),y=K.rr(30,240);A.q.push([x,y,false,40],[x,y,true,4],[x,y,false,K.ri(50,120)])}}
  else{const x=K.rr(100,380),y=K.rr(60,210);A.q.push([x,y,false,40],[x,y,true,K.ri(160,280)],[x,y,false,120])}})}
function info(g){return'冰裂 · '+(g.hold&&g.hold.t>70?'水从裂缝里涌上来':g.tips.length?'裂纹在跑':'结冰的湖面')}
return{init,tick,draw,ai,info};})();
GAMES.push({id:'ice',name:'冰裂',ref:'敲裂冰面，听它唱歌',keys:'拖动：扫开积雪，看冰里冻着什么 · 点一下：敲冰，裂纹放射出去，冰面发出激光一样的回响 · 按住：裂纹越来越长，水从缝里涌上来',thumbAt:1200,
  init:ICE.init,tick:ICE.tick,draw:ICE.draw,ai:ICE.ai,info:ICE.info,
  opts:[{label:'重新铺雪',set:g=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const f=K.fbm(x*0.012,y*0.012,4,1403);SN[y*W+x]=K.clamp((f-0.53)*3.4,0,1)}}}],
  about:['从正上方看一片结了黑冰的湖，上面落着一层薄雪。拖动是扫雪：雪粉朝你扫的方向飞出去，落在别处又积起来，扫开的地方露出冰里冻住的东西：一串串白色的气泡、一片枫叶、几根草，还有一条锦鲤在冰下慢慢游。','点一下是敲冰：裂纹从敲的地方放射出去，一边跑一边分叉，碰到别的裂纹就停下，再连成一圈圈环形；同时冰面发出那种从高到低、像激光一样的回响。按住不放，裂纹会一次次加长，最后黑色的湖水从缝里涌上来，顺着裂纹渗开，把雪泡成灰色。鱼听到敲击会吓得游走。'],
  tags:['扫开积雪，雪粉飞到别处','冰里冻着气泡、枫叶和草','裂纹放射、分叉、连成环','真实的冰裂声：高到低的回响','按住：湖水从裂缝里涌出','冰下一条锦鲤']});



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

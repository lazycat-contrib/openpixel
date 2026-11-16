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



// ================= 光绘: long-exposure light painting on a night beach =================
// The camera is on a tripod with the shutter open. Press and drag to wave a lit sparkler: its white-hot head leaves a
// ribbon and its branching sparks leave fine gold scratches, and nothing fades for a long time because the film keeps
// collecting light. Hold still and you start swinging burning steel wool on a cord: a sphere of orange streaks, sparks
// skipping off the wet sand. The wet sand mirrors whatever you paint, the swash keeps re-wetting it, the stars turn into
// arcs, and the lighthouse beam fans out. "新底片" closes the shutter and starts a fresh frame.
const LPAINT=(function(){const {W,H,S,mix,clamp,lerp,hash,fbm,rgb}=K;const col=S.col,em=S.em,N=W*H;
const BG=new Uint32Array(N),WET=new Float32Array(N);let built=false;
const AR=new Float32Array(N),AG=new Float32Array(N),AB=new Float32Array(N);// the film
const HZ=116,SH=184;// horizon, mean shoreline (also the mirror line for the painting)
const REGB=new Uint8Array(N);// 0 sky, 1 sea, 2 sand, 3 silhouette (rocks, pier, headland)
const POLE=[96,14];
const STARS=[];
function build(){built=true;K.setSeed(77);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;let c,r;
    if(y<HZ){r=0;const t=y/HZ;c=mix(0x03050e,0x0e1a2e,Math.pow(t,1.6));const mw=Math.abs((y-70)+(x-260)*0.5)/36;const m=Math.max(0,1-mw)*fbm(x*0.03,y*0.03,4,61);if(m>0.25)c=mix(c,0x2a3450,Math.min(0.5,(m-0.25)*1.4));
      if(y>HZ-10)c=mix(c,0x1e2c3a,(y-HZ+10)/10*0.5)}
    else if(y<SH-4+Math.round(2*Math.sin(x*0.05))){r=1;const d=(y-HZ)/(SH-HZ);c=mix(0x0a1422,0x081018,d)}
    else{r=2;const d=(y-SH)/(H-SH);c=mix(0x14141a,0x2a2622,clamp(d*1.4,0,1));const g=hash(x,y);if(g<0.08)c=mix(c,0x0a0a0e,0.4);else if(g>0.95)c=mix(c,0x4a4238,0.3)}
    BG[p]=c;REGB[p]=r}
  // headland and lighthouse on the right
  for(let x=360;x<W;x++){const top=HZ-Math.round(Math.max(0,(x-360)*0.22)+6*fbm(x*0.05,1,3,62))+2;for(let y=top;y<HZ+3;y++){const p=y*W+x;BG[p]=y===top?0x1a2028:0x0a0e14;REGB[p]=3}}
  const LH=[432,HZ-26-6];for(let y=LH[1];y<HZ-24+8;y++){const w=y<LH[1]+3?2:3;for(let x=-w;x<=w;x++){const p=y*W+LH[0]+x;BG[p]=((y-LH[1])>>2)%2&&y>LH[1]+4?0x8a8a90:0xd8d8dc;REGB[p]=3}}
  // rocks on the left and old pier posts walking out into the sea
  for(let x=0;x<120;x++){const top=SH-Math.round(18*Math.exp(-(((x-20)/50)**2))+8*fbm(x*0.08,2,3,63));for(let y=top;y<SH+6;y++){const p=y*W+x;const n=fbm(x*0.15,y*0.15,2,64);BG[p]=y-top<2?0x2a2e36:n>0.55?0x161a20:0x0e1116;REGB[p]=3}}
  for(let k=0;k<9;k++){const x=128+k*15,yb=SH-2-k*7,h=16-k*1.2,w=k<3?3:2;for(let y=Math.round(yb-h);y<yb;y++)for(let i=0;i<w;i++){const p=y*W+x+i;BG[p]=i===0?0x2a2420:0x16120e;REGB[p]=3}}
  K.setSeed(5);STARS.length=0;for(let i=0;i<240;i++){const x=K.rr(0,W),y=K.rr(0,HZ-4);const dx=x-POLE[0],dy=y-POLE[1];STARS.push({r:Math.hypot(dx,dy),a:Math.atan2(dy,dx),b:K.rnd()<0.1?1:K.rnd()<0.4?0.5:0.25,c:K.rnd()<0.3?0xffd8b0:K.rnd()<0.5?0xc0d0ff:0xffffff})}}
// ---------------- the film ----------------
function addPx(x,y,r,g,b){x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const p=y*W+x;AR[p]+=r;AG[p]+=g;AB[p]+=b}
function addLine(x0,y0,x1,y1,r,g,b){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let k=0;k<=n;k++){const u=k/n;addPx(x0+(x1-x0)*u+0.5,y0+(y1-y0)*u+0.5,r,g,b)}}
function addSoft(x,y,rad,r,g,b){for(let j=-rad;j<=rad;j++)for(let i=-rad;i<=rad;i++){const d=(i*i+j*j)/(rad*rad+0.01);if(d>1)continue;const k=(1-d)*(1-d);addPx(x+i+0.5,y+j+0.5,r*k,g*k,b*k)}}
// ---------------- sound ----------------
function crackle(v){if(!SFX.ok('crk',0.03))return;const t=K.now();K.noise(0.03,0.05*v,t,'highpass',5000+K.rnd()*3000,4000,0.7)}
function swish(v){if(!SFX.ok('swish',0.12))return;const t=K.now();K.noise(0.22,0.1*v,t,'bandpass',500,1600,1.2,0.08)}
function shutter(){if(!K.live())return;const t=K.now();K.noise(0.03,0.25,t,'bandpass',3000,2000,2);K.noise(0.04,0.2,t+0.09,'bandpass',2200,1500,2)}
// ---------------- state ----------------
function clearFilm(){AR.fill(0);AG.fill(0);AB.fill(0)}
function init(g){if(!built)build();clearFilm();WET.fill(0);g.sp=[];g.hd=null;g.hold=0;g.wool=null;g.exp=0;g.shut=0;g.hue=0;g.rain=0;g.wand=g.wand||0;g.ai={q:[],k:0,x:240,y:150,down:false,sx:0,sy:0,n:0};g.swash=0;g.pm=null}
function hueRGB(h){const f=n=>{const k=(n+h*6)%6;return Math.max(0,Math.min(1,Math.abs(k-3)-1))};return[f(5),f(3),f(1)]}
function emitSpark(g,x,y,vx,vy,life,gen,warm){g.sp.push({x,y,px:x,py:y,vx,vy,t:0,life,gen,warm,fl:SH+6+K.rnd()*K.rnd()*70})}
function tick(g,pad){const m=pad.mouse;g.exp++;
  if(g.shut>0){g.shut--;if(g.shut===8){clearFilm();g.exp=0}}
  const down=m&&m.down;
  if(down){const x=m.x,y=m.y;
    if(!g.hd)g.hd={x,y};const sp=Math.hypot(x-g.hd.x,y-g.hd.y);
    if(sp<0.7){g.hold++}else{g.hold=Math.max(0,g.hold-3);if(g.wool&&sp>3){g.wool=null}}
    if(g.hold>34&&!g.wool){g.wool={a:0,r:4,cx:x,cy:y}}
    if(g.wool){const w=g.wool;w.cx=lerp(w.cx,x,0.2);w.cy=lerp(w.cy,y,0.2);w.r=Math.min(30,w.r+0.6);const pa=w.a;w.a+=0.34;
      const ox=w.cx+Math.cos(pa)*w.r,oy=w.cy+Math.sin(pa)*w.r*0.92,nx=w.cx+Math.cos(w.a)*w.r,ny=w.cy+Math.sin(w.a)*w.r*0.92;
      addLine(ox,oy,nx,ny,0.1,0.045,0.015);
      // the burning wool sheds a ring of sparks, flung along the tangent
      for(let k=0;k<16;k++){const u=K.rnd();const ax=w.a-0.34*u,px=w.cx+Math.cos(ax)*w.r,py=w.cy+Math.sin(ax)*w.r*0.92;const tv=K.rr(3,8);
        emitSpark(g,px,py,-Math.sin(ax)*tv+K.rr(-0.6,0.6),Math.cos(ax)*tv*0.92+K.rr(-0.6,0.6),K.ri(22,60),0,1)}
      if(Math.floor(pa/(Math.PI))!==Math.floor(w.a/Math.PI))swish(1);crackle(1.4)}
    else{// sparkler: a white-hot head drawing a ribbon, sparks that fork
      let r=1.0,gg=0.82,b=0.5;if(g.wand===1){g.hue=(g.hue+0.004+sp*0.002)%1;const c=hueRGB(g.hue);r=c[0]*1.1;gg=c[1]*1.1;b=c[2]*1.1}
      const st=Math.max(1,Math.ceil(sp/2)),ik=sp<0.5?0.03:0.45;addLine(g.hd.x,g.hd.y,x,y,r*ik,gg*ik,b*ik);addLine(g.hd.x,g.hd.y+1,x,y+1,r*ik*0.3,gg*ik*0.3,b*ik*0.3);addLine(g.hd.x+1,g.hd.y,x+1,y,r*ik*0.3,gg*ik*0.3,b*ik*0.3);
      if(g.wand===0){const n=2+Math.round(Math.min(sp,6)*0.5);for(let k=0;k<n;k++){const a=K.rnd()*6.283,v=K.rr(0.8,3.2);emitSpark(g,x,y,Math.cos(a)*v,Math.sin(a)*v,K.ri(5,14),0,0)}crackle(0.8)}
      else if(K.rnd()<0.3){const c=hueRGB(g.hue);g.sp.push({x,y,px:x,py:y,vx:K.rr(-0.4,0.4),vy:K.rr(-0.4,0.2),t:0,life:30,gen:9,warm:2,c})}}
    g.hd={x,y}}
  else{g.hd=null;g.hold=0;g.wool=null}
  // sparks: gravity, drag, forking for sparkler sparks, skipping off the sand for wool sparks
  for(let k=g.sp.length-1;k>=0;k--){const s=g.sp[k];s.px=s.x;s.py=s.y;s.t++;s.vy+=s.warm===1?0.11:s.warm===2?0.005:0.06;s.vx*=0.97;s.vy*=0.97;s.x+=s.vx;s.y+=s.vy;
    if(s.warm===1){const fl=s.fl;if(s.y>fl&&s.vy>0){s.y=fl;s.vy*=-0.42;s.vx*=0.8;if(K.rnd()<0.3)emitSpark(g,s.x,s.y,s.vx+K.rr(-1,1),-K.rr(0.5,2),12,1,1)}}
    const a=1-s.t/s.life;let r,gg,b;
    if(s.warm===1){r=1.0*a+0.3;gg=0.45*a+0.08;b=0.12*a}else if(s.warm===2){r=s.c[0];gg=s.c[1];b=s.c[2]}else{r=1;gg=0.75+0.2*a;b=0.35+0.5*a*a}
    const k2=(s.warm===1?0.045:s.warm===2?0.02:0.028)*a;addLine(s.px,s.py,s.x,s.y,r*k2,gg*k2,b*k2);
    if(s.warm===0&&s.gen<2&&s.t===Math.floor(s.life*0.6)&&K.rnd()<0.55){for(let j=0;j<3;j++){const aa=K.rnd()*6.283,v=K.rr(0.5,1.8);emitSpark(g,s.x,s.y,s.vx*0.5+Math.cos(aa)*v,s.vy*0.5+Math.sin(aa)*v,K.ri(3,8),s.gen+1,0)}}
    if(s.t>=s.life)g.sp.splice(k,1)}
  if(g.sp.length>2600)g.sp.splice(0,g.sp.length-2600);
  // star trails: every star exposes its current spot a little
  if(g.shut===0){const w=g.exp*0.00016;for(const s of STARS){const a=s.a+w;const x=POLE[0]+Math.cos(a)*s.r,y=POLE[1]+Math.sin(a)*s.r;if(y<0||y>=HZ-3||x<0||x>=W)continue;if(REGB[(y|0)*W+(x|0)]!==0)continue;
    const k=s.b*0.02;addPx(x,y,(s.c>>16&255)/255*k,(s.c>>8&255)/255*k,(s.c&255)/255*k)}}
  // the film slowly forgets (a very long exposure, not a forever one)
  if(g.t%2===0){for(let p=0;p<N;p++){AR[p]*=0.9993;AG[p]*=0.9993;AB[p]*=0.9993}}
  // swash: a sheet of water runs up the sand and slides back, leaving a mirror
  g.swash=(g.t%420)/420;const run=Math.sin(Math.PI*Math.min(1,g.swash*1.6))*0.95;
  for(let y=SH-6;y<H;y++){const lim=SH+run*34;for(let x=0;x<W;x++){const p=y*W+x;if(REGB[p]!==2)continue;const edge=lim+Math.sin(x*0.04+g.t*0.01)*4+fbm(x*0.03,g.t*0.002,2,65)*6;if(y<edge)WET[p]=1;else WET[p]*=0.9985}}
  if(K.SND.ctx){K.bed('surf','lowpass',600,0.5);K.bedSet('surf',0.04+0.05*Math.sin(Math.PI*Math.min(1,g.swash*1.6)),500+400*run);K.bed('fizz','highpass',4200,0.6);K.bedSet('fizz',down&&!g.wool&&g.wand===0?0.05:g.wool?0.04:0,4200)}}
// ---------------- render ----------------
function tm(v){return 1-Math.exp(-v*1.6)}
function draw(g){const t=g.t;
  if(g.shut>0&&g.shut<=14){col.fill(0);em.fill(0);if(g.shut>8)K.recta(0,0,W,H,0x000000,1);return}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x;const reg=REGB[p];let r=AR[p],gg=AG[p],b=AB[p];
    // the sea and the wet sand mirror the painting about the shoreline; the sea breaks it up more
    if(reg===1||reg===2){const wet=reg===1?0.55:WET[p]*0.75;if(wet>0.02){const dy=y-SH;const off=reg===1?Math.round(Math.sin(y*0.8+t*0.05)*2+Math.sin(y*0.31-t*0.03)*2):Math.round(Math.sin(y*0.5+t*0.03)*(0.5+dy*0.03));
        let my=2*SH-y-(reg===1?-6:0);if(reg===1)my=y-(SH-y)*0+0;// sea: only faint diffuse glow of the scene
        if(reg===2&&my>=0&&my<H){const sx=clamp(x+off,0,W-1),q=my*W+sx;const k=wet*(1-Math.min(1,dy/90));r+=AR[q]*k;gg+=AG[q]*k;b+=AB[q]*k}}}
    let c=BG[p];
    if(reg===1){// sea: dark swells, foam lines rolling in
      const d=(y-HZ)/(SH-HZ);const ph=(1/(d+0.08))*2.2-t*0.02;const wv=Math.sin(ph*6.283+Math.sin(x*0.02)*1.5+fbm(x*0.03,y*0.1,2,66)*2);if(wv>0.975-d*0.04)c=mix(c,0x2a3a48,0.5+d*0.3);
      const sw=g.swash;if(y>SH-8&&y<SH-3&&fbm(x*0.05,t*0.01,2,67)>0.45-sw*0.2)c=mix(c,0x6a7a88,0.4)}
    if(reg===2&&WET[p]>0.05)c=mix(c,0x0a0c12,WET[p]*0.45);
    if(r+gg+b>0.002){const R=tm(r),G=tm(gg),B=tm(b);const hot=Math.max(0,(r+gg+b)-2.4)*0.15;c=rgb((c>>16&255)+255*(R+hot),(c>>8&255)+255*(G+hot),(c&255)+255*(B+hot));em[p]=Math.min(255,(R+G+B)*90)}else em[p]=0;
    col[p]=c}
  // swash foam edge
  const run=Math.sin(Math.PI*Math.min(1,g.swash*1.6))*0.95;const lim=SH+run*34;
  for(let x=0;x<W;x++){const edge=Math.round(lim+Math.sin(x*0.04+t*0.01)*4+fbm(x*0.03,t*0.002,2,65)*6);for(let j=-1;j<=0;j++){const y=edge+j;if(y<SH-2||y>=H)continue;const p=y*W+x;if(REGB[p]!==2)continue;if(fbm(x*0.2,y*0.3+t*0.01,2,68)>0.42)col[p]=mix(col[p],0x5a6470,0.5)}}
  // lighthouse lamp and its turning beam (live only: the film is exposed by the painter, the beam is just ambience)
  const ba=t*0.02;const lx=432,ly=HZ-30;K.glow(lx,ly,6,0xfff0c0,0.8);const bx=Math.cos(ba);if(bx<0){const len=150*(-bx);for(let k=4;k<len;k++){const x=Math.round(lx-k),hw=k*0.08;for(let j=-hw;j<=hw;j++){const y=Math.round(ly+j-k*0.03);if(y<0||y>=HZ||x<0)continue;const p=y*W+x;col[p]=K.add(col[p],rgb(30*(1-k/len),26*(1-k/len),18*(1-k/len)))}}}
  // live sparkler / wool: brighter "now"
  if(g.hd&&!g.wool){K.glow(g.hd.x,g.hd.y,9,g.wand===1?(rgb(...hueRGB(g.hue).map(v=>v*255))):0xffe8b0,0.9);K.px(g.hd.x,g.hd.y,0xffffff,255)}
  if(g.wool){const w=g.wool;const x=w.cx+Math.cos(w.a)*w.r,y=w.cy+Math.sin(w.a)*w.r*0.92;K.glow(x,y,12,0xff9a40,1);K.line(w.cx,w.cy,x,y,0x2a1a10);K.glow(w.cx,w.cy,40,0xff7a30,0.12)}
  for(const s of g.sp){const x=Math.round(s.x),y=Math.round(s.y);if(x<0||y<0||x>=W||y>=H)continue;const p=y*W+x;col[p]=s.warm===1?0xffc080:s.warm===2?rgb(s.c[0]*255,s.c[1]*255,s.c[2]*255):0xfff4d0;em[p]=220}
  // unlit sparkler under a hovering mouse (cursor)
  if(g._hov&&!g.hd){const x=Math.round(g._hov.x),y=Math.round(g._hov.y);K.line(x,y,x+5,y+9,0x6a6a70);K.px(x,y,0x9a8a7a);K.px(x+1,y+1,0x5a5048)}
  if(g.shut>0&&g.shut<=8){K.recta(0,0,W,H,0x000000,g.shut/8)}}
// ---------------- autoplay: write, spin, draw ----------------
const GLY={// strokes in a unit box
  guang:[[[0.5,0.04],[0.5,0.4]],[[0.24,0.14],[0.33,0.34]],[[0.77,0.12],[0.66,0.34]],[[0.08,0.45],[0.92,0.45]],[[0.4,0.45],[0.38,0.7],[0.14,0.96]],[[0.6,0.45],[0.6,0.88],[0.68,0.95],[0.94,0.95],[0.94,0.84]]],
  heart:[(()=>{const L=[];for(let k=0;k<=40;k++){const a=k/40*Math.PI*2;const x=16*Math.pow(Math.sin(a),3),y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));L.push([0.5+x/36,0.45+y/36])}return L})()],
  spiral:[(()=>{const L=[];for(let k=0;k<=80;k++){const a=k/80*Math.PI*6;const r=0.04+k/80*0.46;L.push([0.5+Math.cos(a)*r,0.5+Math.sin(a)*r*0.9])}return L})()],
  star:[[[0.5,0.02],[0.62,0.38],[0.98,0.38],[0.69,0.6],[0.8,0.96],[0.5,0.74],[0.2,0.96],[0.31,0.6],[0.02,0.38],[0.38,0.38],[0.5,0.02]]]};
function aiPlan(g,A){const Q=A.q;A.n++;const r=A.n%6;
  const writ=(name,cx,cy,sz,spd)=>{for(const st of GLY[name]){const p0=st[0];Q.push([cx+(p0[0]-0.5)*sz,cy+(p0[1]-0.5)*sz,false,24]);Q.push([cx+(p0[0]-0.5)*sz,cy+(p0[1]-0.5)*sz,true,3]);
      for(let k=1;k<st.length;k++){const a=st[k-1],b=st[k];const d=Math.hypot(b[0]-a[0],b[1]-a[1])*sz;Q.push([cx+(b[0]-0.5)*sz,cy+(b[1]-0.5)*sz,true,Math.max(2,Math.round(d/spd))])}Q.push([Q[Q.length-1][0],Q[Q.length-1][1],false,4])}};
  if(r===1)writ('guang',240,112,110,1.8);
  else if(r===2){const x=K.rr(120,360),y=K.rr(110,140);Q.push([x,y,false,40],[x,y,true,200],[x,y,false,30])}
  else if(r===3)writ('heart',K.rr(100,380),K.rr(80,120),80,2.2);
  else if(r===4)writ(K.rnd()<0.5?'spiral':'star',K.rr(120,360),K.rr(80,120),90,2.4);
  else if(r===5){const x=K.rr(160,320),y=K.rr(100,140);Q.push([x,y,false,40],[x,y,true,170],[x,y,false,30])}
  else{Q.push([240,140,false,90,'shut'])}}
function ai(g){const A=g.ai;if(!A.q.length)aiPlan(g,A);const tg=A.q[0];A.k++;if(A.k===1){A.sx=A.x;A.sy=A.y;if(tg[4]==='shut'){g.shut=14;shutter()}}const k=Math.min(1,A.k/tg[3]);
  const e=tg[2]?k:(k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2);A.x=lerp(A.sx,tg[0],e);A.y=lerp(A.sy,tg[1],e);const down=tg[2],click=down&&!A.down;A.down=down;if(A.k>=tg[3]){A.q.shift();A.k=0}
  // a little tremble so held positions are not perfectly still
  return{x:0,y:0,mouse:{x:A.x,y:A.y,down,click}}}
function info(g){return'光绘 · '+(g.wool?'钢丝棉在转':g.hd?(g.wand===1?'彩光棒':'烟花棒'):'快门开着 '+Math.floor(g.exp/60)+' 秒')}
return{init,tick,draw,ai,info,shut:g=>{g.shut=14;shutter()}};})();
GAMES.push({id:'lightpaint',name:'光绘',ref:'快门开着 · 用烟花棒在夜里写字',keys:'按住拖动：烟花棒画出光 · 按住不动：甩起燃烧的钢丝棉 · 新底片：关快门重来',noHand:true,thumbAt:700,
  init:LPAINT.init,tick:(g,pad)=>{g._hov=pad.mouse;LPAINT.tick(g,pad)},draw:LPAINT.draw,ai:LPAINT.ai,info:LPAINT.info,
  opts:[{label:g=>g.wand===1?'光：彩光棒':'光：烟花棒',get:g=>g.wand===1,set:g=>{g.wand=g.wand===1?0:1}},{label:'新底片',get:()=>false,set:g=>LPAINT.shut(g)}],
  about:['夜里的海滩，相机架在三脚架上，快门一直开着。按住拖动就是挥一根点着的烟花棒：白热的火头拉出一条光带，分叉的火星划出细细的金线，而且不会马上消失，因为底片一直在收光。换成彩光棒，光带会一路变色。','按住不动，就开始甩一团燃烧的钢丝棉：一个橙色光球，火星沿切线甩出去，落到湿沙上再弹起来。湿沙把你画的一切倒映出来，浪一次次冲上来又退下去，重新把沙子打湿；天上的星星慢慢拉成弧线，远处灯塔在转。点“新底片”，快门合上，重新开始一张。'],
  tags:['长曝光：光在底片上累积，久久不散','烟花棒火星会分叉，钢丝棉火星会在沙上弹跳','湿沙倒映光绘，浪冲上来重新打湿','星星随曝光时间拉成星轨','彩光棒一路变色','烟花棒的嘶嘶声、钢丝棉的呼呼声和海浪']});



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

// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),fl(w),fl(h))}
function P(g,x,y,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),1,1)}

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];

// stepped fade to black: brightness snapped to quarters, applied to the finished frame
function fadeK(g,w,h,k){k=Math.round(clamp(k,0,1)*4)/4;if(k>=1)return;if(k<=0){R(g,0,0,w,h,'#000000');return}
  const im=g.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){d[i]=d[i]*k;d[i+1]=d[i+1]*k;d[i+2]=d[i+2]*k}g.putImageData(im,0,0)}

const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);


// ================= 1. 细胞里的搬运工 =================


// ================= 2. 一滴露水 =================


// ================= 3. 黑烟囱 =================


// ================= 4. 星系相撞 =================
(function(){
const W=320,H=180,N=W*H,LOOPT=780,NS=7000,SUB=5,DT=0.05,EPS2=0.09;
// three hue ramps, 6 levels each: galaxy A blue, mixed lavender, galaxy B gold
const RAMP=[
 ['#0a0c22','#16205a','#26408a','#4a72b8','#8ab4e4','#e4f2ff'],
 ['#140c26','#2c1e58','#4a3a86','#7a68b2','#b8a8dc','#f4ecff'],
 ['#180e18','#3a2030','#6a3c3a','#a8704e','#e0b478','#fff4d8']].map(r=>r.map(U));
const BG=U('#05060f');
let STAR=null;
function stars(){const c=new Uint32Array(N).fill(BG);const r=rng(3);
  for(let i=0;i<420;i++){const x=fl(r()*W),y=fl(r()*H),b=r();c[y*W+x]=U(b<0.7?'#1a1e36':b<0.92?'#3a4064':'#8a90b0')}
  // far background galaxies: tiny tilted smudges, a few with a core
  for(let i=0;i<14;i++){const x=fl(r()*W),y=fl(r()*H),a=r()*PI,len=2+fl(r()*3);for(let k=-len;k<=len;k++){const px=x+rd(Math.cos(a)*k),py=y+rd(Math.sin(a)*k*0.5);if(px>=0&&px<W&&py>=0&&py<H)c[py*W+px]=U(Math.abs(k)<1?'#8a7a6a':'#2a2840')}}
  STAR=c}
function mkGal(s,core,nrm,spin,n,tag,r){// a thin disk with two loose arms, stars on circular orbits around the core
  const up=Math.abs(nrm[2])<0.9?[0,0,1]:[1,0,0];const u=norm(cross(up,nrm)),v=cross(nrm,u);
  for(let i=0;i<n;i++){const rr=0.35+Math.pow(r(),0.85)*2.7,arm=r()<0.5?0:PI;const th=arm+Math.log(rr)*2.6+(r()-0.5)*0.9;const vc=Math.sqrt(1*rr*rr/Math.pow(rr*rr+EPS2,1.5))*spin;
    const p=[0,1,2].map(k=>core.p[k]+rr*(Math.cos(th)*u[k]+Math.sin(th)*v[k])+(r()-0.5)*0.08*nrm[k]);
    const w=[0,1,2].map(k=>core.v[k]+vc*(-Math.sin(th)*u[k]+Math.cos(th)*v[k]));
    s.px.push(p[0],p[1],p[2]);s.pv.push(w[0],w[1],w[2]);s.tag.push(tag|(r()<0.05?2:0)|(r()<0.06?4:0))}}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)};
function init(s){s.cores=[{p:[-7,0,0],v:[0.14,-0.13,0]},{p:[7,0,0],v:[-0.14,0.13,0]}];s.px=[];s.pv=[];s.tag=[];const r=rng(7);
  mkGal(s,s.cores[0],norm([0.15,-0.2,1]),1,NS,0,r);mkGal(s,s.cores[1],norm([0.6,0.5,0.7]),1,NS,1,r);
  s.px=Float32Array.from(s.px);s.pv=Float32Array.from(s.pv);s.tag=Uint8Array.from(s.tag);s.sf=new Uint8Array(s.tag.length);s.prev=new Float32Array(N);s.f=0}
function tick(s){if(s.f>=LOOPT){init(s);return}s.f++;if(s.f>700)return; // hold the merger still for the last seconds
  const c=s.cores,px=s.px,pv=s.pv,n=px.length/3;
  for(let st=0;st<SUB;st++){
    const d=[0,1,2].map(k=>c[1].p[k]-c[0].p[k]),r2=d[0]*d[0]+d[1]*d[1]+d[2]*d[2]+EPS2,r=Math.sqrt(r2),kk=1/(r2*r);
    for(let k=0;k<3;k++){c[0].v[k]+=d[k]*kk*DT;c[1].v[k]-=d[k]*kk*DT}
    if(s.f>130){const fr=1-0.0007,vm=[0,1,2].map(k=>(c[0].v[k]+c[1].v[k])/2);for(const C of c)for(let k=0;k<3;k++)C.v[k]=vm[k]+(C.v[k]-vm[k])*fr}
    for(const C of c)for(let k=0;k<3;k++)C.p[k]+=C.v[k]*DT;
    const a0=c[0].p,a1=c[1].p;
    for(let i=0;i<n;i++){const j=i*3;let ax=0,ay=0,az=0;
      let dx=a0[0]-px[j],dy=a0[1]-px[j+1],dz=a0[2]-px[j+2],q=dx*dx+dy*dy+dz*dz+EPS2,iq=1/(q*Math.sqrt(q));ax+=dx*iq;ay+=dy*iq;az+=dz*iq;
      dx=a1[0]-px[j];dy=a1[1]-px[j+1];dz=a1[2]-px[j+2];q=dx*dx+dy*dy+dz*dz+EPS2;iq=1/(q*Math.sqrt(q));ax+=dx*iq;ay+=dy*iq;az+=dz*iq;
      pv[j]+=ax*DT;pv[j+1]+=ay*DT;pv[j+2]+=az*DT;px[j]+=pv[j]*DT;px[j+1]+=pv[j+1]*DT;px[j+2]+=pv[j+2]*DT}}}
function cam(s){// slow orbit of the camera around the encounter, pulling back as the tails grow
  const f=s.f,az=0.4+f*0.0007,el=0.85-f*0.00025,zoom=10-5.2*ease(clamp((f-40)/420,0,1));
  const ca=Math.cos(az),sa=Math.sin(az),ce=Math.cos(el),se=Math.sin(el);
  return{zoom,R:[ca,sa,0],U:[-sa*se,ca*se,ce]}}
function draw(s,g){if(!STAR)stars();
  const C=cam(s),px=s.px,n=px.length/3,tag=s.tag;
  const cm=[0,1,2].map(k=>(s.cores[0].p[k]+s.cores[1].p[k])/2);
  const prj=(x,y,z)=>{x-=cm[0];y-=cm[1];z-=cm[2];return[W/2+(x*C.R[0]+y*C.R[1]+z*C.R[2])*C.zoom,H/2-(x*C.U[0]+y*C.U[1]+z*C.U[2])*C.zoom]};
  // density of each galaxy's stars per pixel
  const dA=new Float32Array(N),dB=new Float32Array(N),sp=new Int32Array(n);
  for(let i=0;i<n;i++){const j=i*3,p=prj(px[j],px[j+1],px[j+2]),x=fl(p[0]),y=fl(p[1]);if(x<0||y<0||x>=W||y>=H){sp[i]=-1;continue}const q=y*W+x;sp[i]=q;if(tag[i]&1)dB[q]+=1;else dA[q]+=1}
  // smooth twice with a 3x3 box, then posterize into flat bands: glow without blending
  const blur=(a)=>{const b=new Float32Array(N);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;b[i]=(a[i-W-1]+2*a[i-W]+a[i-W+1]+2*a[i-1]+4*a[i]+2*a[i+1]+a[i+W-1]+2*a[i+W]+a[i+W+1])/16}return b};  // binomial: round, not square
  const sA=blur(blur(blur(blur(dA)))),sB=blur(blur(blur(blur(dB))));
  const im=g.createImageData(W,H),u=new Uint32Array(im.data.buffer);
  for(let i=0;i<N;i++){const t=sA[i]+sB[i];let lv=t>7?5:t>3?4:t>1.3?3:t>0.5?2:t>0.2?1:0;
    if(!lv){u[i]=STAR[i];continue}const fr=sB[i]/t;const h=fr<0.3?0:fr>0.7?2:1;u[i]=RAMP[h][lv]}
  // compression: when gas piles up faster than before, a star-forming knot lights up pink for a while
  const tot=new Float32Array(N);for(let i=0;i<N;i++)tot[i]=sA[i]+sB[i];
  for(let i=0;i<n;i++){const q=sp[i];if(q<0)continue;if(tag[i]&4){if(tot[q]-s.prev[q]>0.06&&tot[q]>0.5&&s.f>100)s.sf[i]=90}
    if(s.sf[i]>0){s.sf[i]--;u[q]=U(s.sf[i]>60?'#ffffff':s.sf[i]>25?'#ff8ab8':'#c04a8a')}
    else if(tag[i]&2)u[q]=RAMP[tag[i]&1?2:0][tot[q]>1.5?5:4]}
  s.prev=tot;
  g.putImageData(im,0,0);
  // nuclei: hot, with a short cross
  for(const k of[0,1]){const p=prj(...s.cores[k].p),x=fl(p[0]),y=fl(p[1]);R(g,x-1,y-1,3,3,'#fff4d8');P(g,x,y,'#ffffff');P(g,x-2,y,'#ffe0a0');P(g,x+2,y,'#ffe0a0');P(g,x,y-2,'#ffe0a0');P(g,x,y+2,'#ffe0a0')}
  // a foreground star of our own galaxy with diffraction spikes
  {const x=268,y=34,tw=Math.sin(s.t*0.07)>0.6?1:0;R(g,x-1,y-1,3,3,'#e8f0ff');P(g,x,y,'#ffffff');for(let k=2;k<6+tw;k++){const c=k<4?'#a8c0f0':'#4a5a90';P(g,x+k,y,c);P(g,x-k,y,c);P(g,x,y+k,c);P(g,x,y-k,c)}}
  if(s.f>720)fadeK(g,W,H,1-(s.f-720)/60);else if(s.f<24)fadeK(g,W,H,s.f/24);
}
SAMPLES.push({id:'galaxy',name:'星系相撞',w:W,h:H,thumb:330,
  tags:['宇宙尺度','14000 颗恒星的引力模拟','潮汐尾与恒星桥','动力学摩擦导致合并','压缩触发的恒星形成','密度色调分离出的平涂辉光'],
  about:'两个旋涡星系在几亿年里相遇、擦身而过、再被引力拉回来合并成一个。画面里 14000 个点各自按两个星系核的引力实时计算轨道（Toomre 兄弟 1972 年用的那种受限多体模型），所以那两条长长的潮汐尾和中间的恒星桥不是画出来的，是算出来的；我负责的是把每个像素的恒星密度分成六级平涂色带，蓝色属于一个星系、金色属于另一个，混在一起的地方是淡紫色。气体被挤压的地方会突然点亮粉色的恒星形成区。镜头在相撞过程中慢慢绕行并拉远。',
  controls:[{type:'button',label:'从头开始',act(s){init(s)}}],init,tick,draw,
  info(s){return '约 '+fl(s.f*2.6)+' 百万年'}});
})();

// ================= 5. 十的二十六次方 =================


// ================= 6. 黑洞 =================


// ================= 7. 太阳边缘 =================


// ================= 8. 雪花 =================


// ================= 9. 坠入指尖 =================


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

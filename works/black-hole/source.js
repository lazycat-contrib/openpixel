// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

"use strict";
// ================= helpers =================
const fl=Math.floor, rd=Math.round, PI=Math.PI, D2R=PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),fl(w),fl(h))}
function P(g,x,y,c){g.fillStyle=c;g.fillRect(fl(x),fl(y),1,1)}
function L(g,x0,y0,x1,y1,c,th){th=th||1;x0=rd(x0);y0=rd(y0);x1=rd(x1);y1=rd(y1);g.fillStyle=c;
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let e=dx+dy;const o=(th-1)>>1;
  for(let i=0;i<2000;i++){g.fillRect(x0-o,y0-o,th,th);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}

const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];


// ================= shared noise for the micro/macro pieces =================
function h3(x,y,z,s){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,1274126177)^Math.imul(s,2246822519);h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;return(h&0xffff)/65535}
function vn3(x,y,z,s){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z);let fx=x-xi,fy=y-yi,fz=z-zi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);
  const a=h3(xi,yi,zi,s),b=h3(xi+1,yi,zi,s),c=h3(xi,yi+1,zi,s),d=h3(xi+1,yi+1,zi,s),e=h3(xi,yi,zi+1,s),f=h3(xi+1,yi,zi+1,s),g=h3(xi,yi+1,zi+1,s),k=h3(xi+1,yi+1,zi+1,s);
  const x1=a+(b-a)*fx,x2=c+(d-c)*fx,x3=e+(f-e)*fx,x4=g+(k-g)*fx,y1=x1+(x2-x1)*fy,y2=x3+(x4-x3)*fy;return(y1+(y2-y1)*fz)*2-1}
function vn2(x,y,s){const xi=Math.floor(x),yi=Math.floor(y);let fx=x-xi,fy=y-yi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
  const a=h3(xi,yi,0,s),b=h3(xi+1,yi,0,s),c=h3(xi,yi+1,0,s),d=h3(xi+1,yi+1,0,s);return(a+(b-a)*fx+(c-a+(a-b+d-c)*fx)*fy)*2-1}

// ================= 1. 细胞里的搬运工 =================


// ================= 2. 一滴露水 =================


// ================= 3. 黑烟囱 =================


// ================= 4. 星系相撞 =================


// ================= 5. 十的二十六次方 =================


// ================= 6. 黑洞 =================
(function(){
const W=320,H=180,CX=160,CY=92,SC=0.21,D=400,PXA=0.21/400,RIN=5.2,ROUT=27;
// photon paths in the Schwarzschild metric (units of M): u=1/r obeys u''=3u^2-u. One table of u(phi) per impact parameter b.
const NB=1000,DB=0.05,DPH=0.012,NPH=960;
let TAB=null;
function buildTable(){const U=new Float32Array(NB*NPH).fill(-1),END=new Float32Array(NB),KIND=new Uint8Array(NB);
  const h=DPH/3;
  for(let i=1;i<NB;i++){const b=i*DB;let u=1/D,w=1/(b*b)-u*u*(1-2*u);if(w<0){KIND[i]=2;END[i]=0;continue}w=Math.sqrt(w);let ph=0,k=0,peri=false;
    const f=(u)=>3*u*u-u;U[i*NPH]=u;
    for(let s=1;s<NPH*3;s++){// RK4 on (u,w)
      const k1u=w,k1w=f(u),k2u=w+h/2*k1w,k2w=f(u+h/2*k1u),k3u=w+h/2*k2w,k3w=f(u+h/2*k2u),k4u=w+h*k3w,k4w=f(u+h*k3u);
      const un=u+h/6*(k1u+2*k2u+2*k3u+k4u);w=w+h/6*(k1w+2*k2w+2*k3w+k4w);ph+=h;
      if(un>=0.5){KIND[i]=1;END[i]=ph;U[i*NPH+fl(ph/DPH)]=0.5;break}                 // fell through the horizon
      if(un<=0){KIND[i]=2;END[i]=ph-h*un/(un-u);break}                                 // escaped to infinity
      u=un;if(s%3===0){k=s/3;if(k<NPH)U[i*NPH+k]=u}}
    if(!KIND[i]){KIND[i]=1;END[i]=NPH*DPH-0.01}}
  TAB={U,END,KIND}}
// disk colour ramp: from the dull red receding side to the white-hot approaching side
const RAMP=['#120403','#2e0905','#561306','#86240a','#bc4210','#e66c22','#fa9c40','#ffcc78','#fff0cc','#ffffff'].map(U);
const SKY=['#05040c','#0c0a1c','#161230','#241a44'].map(U);
const STAR=[U('#6a6a8a'),U('#b8bcd8'),U('#ffffff'),U('#ffd8a8'),U('#a8c8ff')];
let GEO=null,GE=-1;
// per-pixel geometry for a camera elevation: where each pixel's light came from (disk point or sky direction)
function geometry(e){const n=W*H,G={kind:new Uint8Array(n),r:new Float32Array(n),psi:new Float32Array(n),g:new Float32Array(n),lon:new Float32Array(n),lat:new Float32Array(n),order:new Uint8Array(n)};
  const se=Math.sin(e),ce=Math.cos(e);const c=[0,-ce,se],sy_=[0,se,ce];const{U,END,KIND}=TAB;
  for(let py=0;py<H;py++)for(let px=0;px<W;px++){const i=py*W+px,dx=px+0.5-CX,dy=CY-(py+0.5);const rho=Math.hypot(dx,dy),b=rho*SC,bi=Math.min(NB-1,Math.max(1,Math.round(b/DB)));
    const ca=dx/(rho||1),sa=dy/(rho||1);const v=[ca,sa*sy_[1],sa*sy_[2]];
    let phi=Math.atan2(-c[2],v[2]);phi=((phi%PI)+PI)%PI;if(phi<1e-4)phi=PI;
    let hit=false;for(let k=0;k<4;k++){const ph=phi+k*PI;if(ph>=END[bi])break;const q=ph/DPH,qi=fl(q);const u0=U[bi*NPH+qi],u1=U[bi*NPH+qi+1];const u=u1>0?u0+(u1-u0)*(q-qi):u0;if(u<=0)break;const r=1/u;
      if(r>=RIN&&r<=ROUT){const cp=Math.cos(ph),sp=Math.sin(ph);const P=[r*(cp*c[0]+sp*v[0]),r*(cp*c[1]+sp*v[1]),r*(cp*c[2]+sp*v[2])];const psi=Math.atan2(P[1],P[0]);
        // Doppler + gravitational shift: gas orbits counter-clockwise at sqrt(1/r); the photon leaves toward the camera along the path's tangent
        const tdir=[-(-sp*c[0]+cp*v[0]),-(-sp*c[1]+cp*v[1]),-(-sp*c[2]+cp*v[2])];const vel=[-Math.sin(psi),Math.cos(psi),0],beta=Math.sqrt(1/r);
        const cosT=vel[0]*tdir[0]+vel[1]*tdir[1];const gam=1/Math.sqrt(1-beta*beta);const g=Math.sqrt(1-3/r)/(gam*(1-beta*cosT))*Math.sqrt(1-2/r)/Math.sqrt(1-3/r);
        G.kind[i]=1;G.r[i]=r;G.psi[i]=psi;G.g[i]=g;G.order[i]=k;hit=true;break}}
    if(hit)continue;
    if(KIND[bi]===1){G.kind[i]=0;continue}
    const pe=END[bi],cp=Math.cos(pe),sp=Math.sin(pe);const d=[cp*c[0]+sp*v[0],cp*c[1]+sp*v[1],cp*c[2]+sp*v[2]];G.kind[i]=2;G.lon[i]=Math.atan2(d[1],d[0]);G.lat[i]=Math.asin(clamp(d[2],-1,1))}
  return G}
function draw(s,g){if(!TAB)buildTable();const t=s.t;
  // the camera rises and sinks slowly above the disk plane
  const e=(7+5.5*Math.sin(t*0.0035))*D2R;const ek=Math.round(e/D2R*8);if(ek!==GE){GEO=geometry(ek/8*D2R);GE=ek}
  const im=g.createImageData(W,H),u=new Uint32Array(im.data.buffer),G=GEO,rot=t*0.0011;
  for(let i=0;i<W*H;i++){const k=G.kind[i];
    if(k===0){u[i]=U('#000000');continue}
    if(k===2){// sky, in pixel units of the unbent view: stars in cells, a faint dusty band, all bent by the hole
      const X=(G.lon[i]-PI/2)/PXA+t*0.35,Y=G.lat[i]/PXA;const ci=Math.floor(X/9),cj=Math.floor(Y/9);
      const band=Y*0.9-X*0.42+20+Math.sin(X*0.01)*12;const bn=Math.exp(-band*band/2600)*(0.55+0.45*vn2(X*0.03,Y*0.03,3));let col=SKY[bn>0.72?3:bn>0.48?2:bn>0.22?1:0];
      const hh=hash(ci,cj,5);if(hh<0.42){const sx=(ci+0.2+0.6*hash(ci,cj,6))*9,sy=(cj+0.2+0.6*hash(ci,cj,7))*9;const dd=Math.hypot(X-sx,Y-sy);const rad=0.55+0.6*hash(ci,cj,8)+(hh<0.05?0.5:0);
        if(dd<rad)col=STAR[hh<0.03?2:hh<0.06?3:hh<0.09?4:hh<0.2?1:0]}
      u[i]=col;continue}
    // disk: Keplerian shear (inner gas laps faster), streaky turbulence, brightness from temperature and Doppler beaming
    const r=G.r[i],om=0.55*Math.pow(r,-1.5),ps=G.psi[i]-om*t;
    const n=vn3(Math.cos(ps)*2.4,Math.sin(ps)*2.4,Math.log(r)*10,11)*0.6+vn3(Math.cos(ps)*6,Math.sin(ps)*6,Math.log(r)*26,12)*0.4;
    const T=Math.pow(r/RIN,-0.75)*Math.pow(Math.max(0.02,1-Math.sqrt(RIN/r)),0.25)*2.2;
    let I=Math.pow(T,1.9)*Math.pow(G.g[i],3.4)*(0.6+0.55*n)*(G.order[i]>=1?1.5:1)*1.3;
    // the outer rim of the disk thins out into wisps
    if(r>ROUT-8&&n<(r-ROUT+8)/8-0.4){u[i]=k===1&&G.order[i]>0?U('#000000'):SKY[0];if(G.order[i]===0)u[i]=SKY[0];continue}
    const lv=I>2.1?9:I>1.5?8:I>1.05?7:I>0.72?6:I>0.48?5:I>0.31?4:I>0.19?3:I>0.1?2:I>0.04?1:0;u[i]=RAMP[lv]}
  g.putImageData(im,0,0);
  // a flare: a hot clump on the innermost orbit, drawn where its light lands (every pixel whose disk point is near it)
  // (done by brightening the disk pixels whose (r,psi) are near the clump)
  {const r0=7.2,om=0.55*Math.pow(r0,-1.5),p0=t*om*1+1.3;const im2=g.getImageData(0,0,W,H),u2=new Uint32Array(im2.data.buffer);let any=false;
   for(let i=0;i<W*H;i++){if(G.kind[i]!==1)continue;const dr=G.r[i]-r0;if(dr*dr>1.6)continue;let dp=G.psi[i]-p0;dp=Math.atan2(Math.sin(dp),Math.cos(dp));if(Math.abs(dp)>0.35)continue;
     const q=dr*dr/1.6+dp*dp/0.12;if(q<1){u2[i]=q<0.35?RAMP[9]:RAMP[Math.min(9,8)];any=true}}
   if(any)g.putImageData(im2,0,0)}
  // a small ring ship crossing in front for scale: twelve modules on a slowly turning ring, the side facing the disk lit orange
  {const T=(t%(24*48))/(24*48);if(T>0&&T<1){const x=W+30-T*(W+60),y=150+T*14,rr=8,ry=2.8,sp=t*0.02;
    const mod=(front)=>{for(let k=0;k<12;k++){const a=k/12*6.2832+sp,sn=Math.sin(a);if((sn>=0)!==front)continue;const px=rd(x+Math.cos(a)*rr),py=rd(y+sn*ry),lit=Math.cos(a)<0.3;
      if(front){R(g,px-1,py-1,3,2,lit?'#d87a34':'#4a3c42');P(g,px-1,py-1,lit?'#ffd49a':'#6e5e64')}else R(g,px-1,py-1,2,2,lit?'#7a4422':'#241c22')}};
    mod(false);for(let k=0;k<4;k++){const a=k/4*6.2832+sp+0.26;L(g,x,y,x+Math.cos(a)*rr,y+Math.sin(a)*ry,'#3a3036')}
    R(g,rd(x)-1,rd(y)-3,3,5,'#4a3e44');P(g,rd(x)-1,rd(y)-3,'#f0b070');P(g,rd(x),rd(y)+2,'#a8d8ff');mod(true);if((t>>3)&1)P(g,rd(x+rr+2),rd(y),'#ff4a3a')}}
}
SAMPLES.push({id:'hole',name:'黑洞',w:W,h:H,thumb:200,
  tags:['史瓦西度规下逐像素追踪光线','吸积盘被引力弯到黑洞上下','光子环','多普勒增亮：一边白热一边暗红','开普勒剪切的旋转气体','背景星空被透镜拉成弧'],
  about:'一个四千万倍太阳质量的黑洞，周围是绕它旋转的吸积盘。我们从盘面上方稍高一点的地方看过去，所以本来在黑洞背后的那一半盘子，被引力把光弯过来，像一道光环架在黑洞的上方和下方；紧贴黑色阴影的那一圈细亮线，是绕着黑洞转了几乎一整圈才逃出来的光。左边的气体朝我们奔来，被多普勒效应提亮成白色，右边远去的一侧暗成深红。内圈转得比外圈快，所以纹理会被慢慢剪切成一圈圈的细丝。背景的星星在缓慢移动，经过黑洞边缘时会被拉成弧线、一分为二。每一帧都是按广义相对论把每个像素的光倒着追回去算出来的。',
  controls:[],init(s){},tick(s){},draw,
  info(s){return '相机仰角 '+(7+5.5*Math.sin(s.t*0.0035)).toFixed(1)+'°'}});
})();

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

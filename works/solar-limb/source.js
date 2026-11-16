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
function disc(g,cx,cy,r,c){cx=rd(cx);cy=rd(cy);r=rd(r);g.fillStyle=c;if(r<=0){g.fillRect(cx,cy,1,1);return}
  for(let y=-r;y<=r;y++){const w=fl(Math.sqrt(r*r-y*y)+0.35);g.fillRect(cx-w,cy+y,w*2+1,1)}}

function hash(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul((b|0)+0x9e37,668265263)^Math.imul((c|0)+0x7f4a,1274126177);
  h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;h=Math.imul(h,0x45d9f3b);h^=h>>>15;return (h>>>0)/4294967296}

const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

const U=h=>{const a=hx(h);return((255<<24)|(a[2]<<16)|(a[1]<<8)|a[0])>>>0};


const SAMPLES=[];

// ================= cinema helpers =================
// bitmap CJK text: rasterize once with the system font, keep only pixels over an alpha threshold (no anti-aliasing reaches the stage)
const ZC={};
function zglyphs(str,size,bold){const key=str+'|'+size+'|'+(bold?1:0);if(ZC[key])return ZC[key];
  // supersample 4x, then keep a pixel when enough of its cell is covered: cleaner strokes than thresholding a small render
  const K=4,c=document.createElement('canvas'),tg=c.getContext('2d'),f=`${bold?'bold ':''}${size*K}px "PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif`;
  tg.font=f;const w=Math.ceil(tg.measureText(str).width/K)+2,h=size+4;c.width=w*K;c.height=h*K;tg.font=f;tg.textBaseline='top';tg.fillStyle='#fff';tg.fillText(str,K,K);
  const d=tg.getImageData(0,0,w*K,h*K).data,px=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0;for(let j=0;j<K;j++)for(let i=0;i<K;i++)s+=d[((y*K+j)*w*K+x*K+i)*4+3];if(s/(K*K*255)>(bold?0.42:0.3))px.push(x,y)}
  return ZC[key]={w,h,px}}
function ztxt(g,str,x,y,c,size,oc,align,bold){const G=zglyphs(str,size||10,bold);if(align==='c')x-=fl(G.w/2);else if(align==='r')x-=G.w;x=rd(x);y=rd(y);const p=G.px;
  if(oc){g.fillStyle=oc;for(let i=0;i<p.length;i+=2){g.fillRect(x+p[i]-1,y+p[i+1],3,1);g.fillRect(x+p[i],y+p[i+1]-1,1,3)}}
  g.fillStyle=c;for(let i=0;i<p.length;i+=2)g.fillRect(x+p[i],y+p[i+1],1,1);return G.w}

const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);


// ================= shared noise for the micro/macro pieces =================
function h3(x,y,z,s){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,1274126177)^Math.imul(s,2246822519);h=Math.imul(h^(h>>>13),1103515245);h^=h>>>16;return(h&0xffff)/65535}

function vn2(x,y,s){const xi=Math.floor(x),yi=Math.floor(y);let fx=x-xi,fy=y-yi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
  const a=h3(xi,yi,0,s),b=h3(xi+1,yi,0,s),c=h3(xi,yi+1,0,s),d=h3(xi+1,yi+1,0,s);return(a+(b-a)*fx+(c-a+(a-b+d-c)*fx)*fy)*2-1}

// ================= 1. 细胞里的搬运工 =================


// ================= 2. 一滴露水 =================


// ================= 3. 黑烟囱 =================


// ================= 4. 星系相撞 =================


// ================= 5. 十的二十六次方 =================


// ================= 6. 黑洞 =================


// ================= 7. 太阳边缘 =================
(function(){
const W=320,H=180,R=760,SCX=150,SCY=118+760,LOOPT=24*40;
const PH=['#3a0a02','#5a1404','#842406','#ae3c0a','#d65a12','#f07e1e','#fca232','#ffc458','#ffe08a','#fff4c8'].map(U);
const toSU=(x,y)=>{const dx=x-SCX,dy=y-SCY,dd=Math.hypot(dx,dy);return[Math.acos(Math.sqrt(Math.max(0,R*R-dd*dd))/R)*R,Math.atan2(dy,dx)*R]};
const SPOT=[toSU(104,158),toSU(117,160),toSU(92,157)];
const CORO=['#6a1a08','#441008','#2a0a06','#190605','#0d0303','#050102'].map(U),CHR=['#ff5a2a','#c8301a','#a8281a','#e0482a'].map(U);
const limbY=x=>SCY-Math.sqrt(Math.max(0,R*R-(x-SCX)*(x-SCX)));
// prominence loops anchored on the limb: footpoints (screen x), height, thickness
const LOOPS=[[34,78,46,3],[42,70,30,3],[50,62,16,2],[196,262,64,4],[206,252,46,3],[214,244,30,3],[222,236,15,2]];
function surf(s,u,t){// granulation: a drifting Voronoi net in arc coordinates; returns 0..1 (lane .. hot centre)
  const cs=13,ci=Math.floor(u/cs),cj=Math.floor(s/cs);let d1=99,d2=99,id=0;
  for(let j=cj-1;j<=cj+1;j++)for(let i=ci-1;i<=ci+1;i++){const ph=hash(i,j,4)*6.28;const px=(i+0.5+0.38*Math.sin(t*0.01+ph))*cs,py=(j+0.5+0.38*Math.cos(t*0.013+ph*1.7))*cs;
    const d=Math.hypot(u-px,s-py);if(d<d1){d2=d1;d1=d;id=i*7919+j}else if(d<d2)d2=d}
  const edge=d2-d1;const life=0.5+0.5*Math.sin(t*0.02+hash(id,1,9)*6.28);return clamp(edge/5,0,1)*(0.7+0.3*life)}
function draw(s,g){const t=s.t,lt=t%LOOPT,sec=lt/24;
  const im=g.createImageData(W,H),u=new Uint32Array(im.data.buffer);
  // eruption timeline: flux emerges (0-6 s), the big arcade's outer loop rises from 18 s, tears open at 27 s into a CME, flare ribbons and a post-flare arcade
  const er=sec<18?0:sec<27?Math.pow((sec-18)/9,2.4):1,k=sec-27,flare=sec>26.5?(sec<28?1:Math.max(0,1-(sec-28)/10)):0;
  // CME geometry: a bright compressed front, a dark cavity, a twisted bright core
  const kk=Math.max(0,k),cmx=229+kk*3,cmy=40-6*kk-1.2*kk*kk,crx=34+kk*9,cry=30+kk*7;
  // corona: brightness falls off with height, slower along radial streamers; the CME front piles it up, its cavity empties it
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=x-SCX,dy=y-SCY,dd=Math.hypot(dx,dy),h=dd-R;const i=y*W+x;
    if(h>0){const a=Math.atan2(dy,dx);const ray=vn2(a*13,t*0.0012,7)*0.8+vn2(a*38,t*0.003,8)*0.2;let sc=9+22*Math.pow(ray,1.4);
      sc*=1+0.5*flare*Math.max(0,1-Math.abs(x-229)/70);
      if(k>0&&y<cmy+cry*0.5){const q=Math.hypot((x-cmx)/crx,(y-cmy)/cry);if(q<0.9)sc*=0.6;else if(q<1.1)sc*=2.2}
      const v=h/sc;u[i]=CORO[v<0.45?0:v<1.1?1:v<2?2:v<3.4?3:v<5.4?4:5];continue}
    // photosphere: limb darkening times granulation, a sunspot group, flare brightening
    const pz=Math.sqrt(R*R-dd*dd)/R,th=Math.acos(pz),ph=Math.atan2(dy,dx);const S=th*R,Uc=ph*R;
    let b=surf(S,Uc,t);const mo=vn2(S*0.045,Uc*0.03+t*0.002,21)*0.6+vn2(S*0.12,Uc*0.08,22)*0.4;
    let I=(0.42+0.58*Math.pow(pz,0.5))*(0.62+0.28*b+0.3*mo);if(mo>0.42)I+=0.12;  // bright plage where the field bunches up
    if(h>-2.2)I=1.02;else if(h>-4)I=Math.max(I,0.86);  // the limb brightens in this light
    // sunspot: umbra and radial penumbra filaments, foreshortened near the limb because it sits on the sphere
    for(let q=0;q<3;q++){const sp=[S-SPOT[q][0],Uc-SPOT[q][1],[15,7,6][q]];const sx=sp[0],sy=sp[1],r=Math.hypot(sx,sy);if(r<sp[2]){const fa=Math.atan2(sy,sx);
      I=r<sp[2]*0.45?0.12:(0.3+0.12*(Math.sin(fa*28+hash(fl(fa*8),3,3))>0?1:0))*(0.9+0.2*b)}else if(r<sp[2]+2)I*=0.88}
    const lv=clamp(Math.floor(I*9.2),0,9);u[i]=PH[lv]}
  // chromosphere: a thin red rim with spicules flickering along it
  for(let x=0;x<W;x++){const ly=limbY(x),yi=fl(ly);if(yi<1||yi>=H)continue;u[(yi)*W+x]=CHR[0];if(yi-1>=0)u[(yi-1)*W+x]=CHR[1];
    const hgt=fl(3+7*hash(x,fl(t/5+hash(x,2)*9),3)),lean=hash(x,fl(t/7),4)<0.5?0:(hash(x,3,5)<0.5?-1:1);if(hash(x,1,1)<0.8)for(let k=2;k<hgt+2;k++){const xx=x+(k>3?lean:0),yy=yi-k;if(yy>=0&&xx>=0&&xx<W)u[yy*W+xx]=CHR[k<hgt?2:3]}}
  g.putImageData(im,0,0);
  // prominence loops: banded tubes, with knots of plasma raining down both legs toward the surface
  const TH=['#5a1206','#8a2408','#b8380c','#e05a18','#ff8a2a','#ffc060'];
  // a prominence loop as a bundle of thin twisting threads; it frays toward the apex
  const TH2=['#8a2408','#e05a18','#ff8a2a','#ffc060','#ffe8a8','#fff8e0'];
  const loop=(x0,x1,h,w,lift,seed,pal)=>{pal=pal||TH;const n=80,nt=4+w*3,base=[];const H0=h+lift*40;
    for(let k=0;k<=n;k++){const s_=k/n;const x=x0+(x1-x0)*s_+Math.sin(s_*PI)*lift*0.15*(x1-x0)+Math.sin(s_*PI)*(h*0.12)*(hash(seed,1,1)-0.5);
      const y=limbY(x0+(x1-x0)*s_)+1-H0*Math.pow(Math.sin(s_*PI),0.85)*(1+0.1*Math.sin(s_*PI*3+t*0.012+seed));base.push([x,y])}
    for(let j=0;j<nt;j++){const a=(hash(seed,j,2)-0.5)*w*1.4,f=1+fl(hash(seed,j,3)*3),p=hash(seed,j,4)*6.28,c=pal[clamp(1+fl(hash(seed,j,5)*5),1,5)];let lx=null,ly=null;
      for(let k=0;k<=n;k++){const s_=k/n,q=Math.sin(s_*PI);const off=a*(0.6+0.8*q)+Math.sin(s_*f*PI*2+p+t*0.02)*(0.8+2.2*q*q)*(w*0.4);
        const b0=base[k],b1=base[Math.min(n,k+1)],b2=base[Math.max(0,k-1)],tx=b1[0]-b2[0],ty=b1[1]-b2[1],tl=Math.hypot(tx,ty)||1;const x=b0[0]-ty/tl*off,y=b0[1]+tx/tl*off;
        if(lx!==null&&!(q>0.7&&hash(seed*31+j,fl(k/4),fl(t/9))<0.18))L(g,lx,ly,x,y,c);lx=x;ly=y}}
    // coronal rain: knots sliding from the apex down each leg, accelerating
    for(let q=0;q<4+w;q++){const ph=((t*0.005+q/(4+w)+seed*0.37)%1),sd=q&1,s_=sd?0.5+0.5*ph*ph:0.5-0.5*ph*ph;const p=base[Math.round(s_*n)];P(g,p[0],p[1],'#ffe8a8');P(g,p[0],p[1]+1,'#ffb050')}
    return base};
  // a hedgerow prominence: a fence of wavering vertical strands on the left
  for(let j=0;j<46;j++){const x0=24+j*1.3+hash(j,1,8)*2,hgt=18+26*Math.sin(j/46*PI)*(0.6+0.4*hash(j,2,8)),y0=limbY(x0);let lx=x0,ly=y0;
    for(let k=1;k<=hgt;k+=2){const x=x0+Math.sin(k*0.2+j+t*0.015)*2.2*(k/hgt),y=y0-k;if(!(k>hgt*0.7&&hash(j,fl(k/3),fl(t/8))<0.3))L(g,lx,ly,x,y,TH[clamp(1+fl(hash(j,3,8)*5),1,5)]);lx=x;ly=y}}
  const em=sec<6?0.25+0.75*ease(sec/6):1;
  for(let q=3;q<LOOPS.length;q++){const L0=LOOPS[q];const big=q===3;if(big&&er>=1&&k>0)continue;loop(L0[0],L0[1],L0[2]*(big?em:1),L0[3],big?er:0,q+1)}
  if(k>0){
    // the CME as a lightbulb: legs rooted at the old footpoints pinch into a neck and open into the expanding front;
    // the legs reconnect and vanish after a few seconds, the bulb keeps flying out
    const legs=Math.max(0,1-k/6),nkx=cmx,nky=cmy+cry*1.25;
    for(let j=0;j<16;j++){const dr=-hash(j,1,31)*0.2,ph=hash(j,2,31)*6.28,c=TH[clamp(5-fl(-dr*22)+(hash(j,3,31)<0.3?-1:0),1,5)],pts=[];
      const a0=PI*0.72,a1=PI*2.28;
      for(let a=a0;a<=a1+1e-6;a+=0.02){const w=1+dr+0.1*(vn2(a*3+j*0.05,k*0.4,34)-0.5)+0.02*Math.sin(a*9+ph+t*0.03);pts.push([cmx+Math.cos(a)*crx*w,cmy+Math.sin(a)*cry*w])}
      // legs: from the bulb down to the footpoints; as they reconnect their lower ends pinch together at a neck below the bulb
      for(const sd of[-1,1]){const fx0=(sd<0?204:254)+(j-8)*0.5,fx=fx0+(nkx-fx0)*(1-legs),fy=limbY(fx0)+(nky-limbY(fx0))*(1-legs),e=sd<0?pts[0]:pts[pts.length-1],nx=cmx+sd*crx*0.3*legs,ny=cmy+cry*1.05,leg=[];
        for(let q=1;q<=20;q++){const s_=q/20,m=1-s_;leg.push([m*m*e[0]+2*m*s_*nx+s_*s_*fx+Math.sin(s_*9+j)*0.8*legs,m*m*e[1]+2*m*s_*ny+s_*s_*fy])}
        if(sd<0)pts.unshift(...leg.reverse());else pts.push(...leg)}
      for(let q=1;q<pts.length;q++){const a=pts[q-1],b=pts[q];if(hash(j,q>>1,fl(t/4))<0.12)continue;L(g,a[0],a[1],b[0],b[1],c)}}
    // striations: short radial streaks inside the front
    for(let q=0;q<40;q++){const a=PI*(0.85+1.3*hash(q,1,35)),r0=0.8+0.15*hash(q,2,35);const x0=cmx+Math.cos(a)*crx*r0,y0=cmy+Math.sin(a)*cry*r0;L(g,x0,y0,x0+Math.cos(a)*3,y0+Math.sin(a)*3,TH[2+(q%3)])}
    // the current sheet: a thin bright line from the arcade top up to the neck while reconnection runs
    if(legs>0.05){const ty=limbY(229)-((6+Math.min(k,10)*1.6))-2;for(let y=fl(nky);y<ty;y++)if(hash(y,fl(t/2),36)<0.75*legs)P(g,229+(hash(y>>2,fl(t/3),37)<0.3?1:0),y,legs>0.5?'#ffe8a8':'#ff8a2a')}
    // the core: the erupted filament, a knotted twisted rope riding in the cavity
    {const ccx=cmx,ccy=cmy+cry*0.36,len=13+k*5,arch=7+k*2.2;for(let j=0;j<7;j++){let lx=null,ly=null;const amp=(3.5+k*1.1)*(0.6+0.8*hash(j,4,32)),ph=j*0.9;
      for(let q=0;q<=40;q++){const s_=q/40-0.5,x=ccx+s_*len*2+Math.cos(s_*PI*3+ph+k*0.5)*amp*0.4,y=ccy-Math.cos(s_*PI)*arch+Math.sin(s_*PI*3+ph+k*0.5)*amp*(0.6+0.8*vn2(q*0.3,j+t*0.01,33));
        if(lx!==null)L(g,lx,ly,x,y,['#b8380c','#e05a18','#ff8a2a','#ffc060','#ffe8a8','#ff8a2a','#fff8e0'][j]);lx=x;ly=y;if(j===6&&q%9===4)disc(g,x,y,1.2+k*0.15,'#fff8e0')}}}
    // flare ribbons: two thin white-hot lines on the surface that drift apart as the arcade grows
    const sep=16+Math.min(k,10)*1.4;
    if(flare>0.05)for(const sd of[-1,1]){const fx=229+sd*sep;for(let x=fx-12;x<=fx+12;x++){const y=fl(limbY(x)+3.5+1.4*Math.sin(x*0.6+sd*2)+(hash(fl(x),sd+3,7)<0.3?1:0));
      const e=Math.abs(x-fx)/12,c=flare>0.6&&e<0.7?'#ffffff':flare>0.3&&e<0.9?'#fff0b0':'#ffb050';P(g,x,y,c);if(e<0.5)P(g,x,y+1,flare>0.5?'#ffe080':'#f07e1e');if(hash(fl(x),fl(t/3),2)<0.25)P(g,x,y-1,'#ffd070')}}
    // the post-flare arcade: hot small loops rooted in the ribbons, rising and finally draining away
    const ah=(6+Math.min(k,10)*1.6)*(sec>37?Math.max(0,1-(sec-37)/3):1);
    if(ah>1)for(let j=0;j<4;j++)loop(229-sep+j*3,229+sep-j*3,ah*(1-j*0.2),1,0,20+j,TH2)}
  // Earth to scale: a hundred and nine of it fit across the Sun
  {const er_=R*2/109/2;const ex=40,ey=30;disc(g,ex,ey,er_,'#0e1c3a');disc(g,ex+0.6,ey-0.6,er_-0.8,'#2a5aa8');disc(g,ex+1.6,ey-1,er_-2.6,'#3a78c8');P(g,ex+2,ey-3,'#e8ecf0');P(g,ex-1,ey,'#4a8a4a');P(g,ex,ey+1,'#4a8a4a');
   ztxt(g,'地球（同比例）',ex,ey+er_+3,'#c8a080',9,'#050102','c')}
}
SAMPLES.push({id:'sun',name:'太阳边缘',w:W,h:H,thumb:24*25,
  tags:['米粒组织的对流网格','临边昏暗','色球针状体','日珥磁环与日冕雨','日冕物质抛射','和地球同比例'],
  about:'贴近太阳的边缘看过去。表面是一格一格翻滚的米粒组织，每一粒都是一团从底下涌上来的热气，比整个中国还大；越靠近边缘，光穿过的气体越厚，颜色就越暗越红。边缘上是一层不停闪动的针状体。几道巨大的磁环拱在表面上方，炽热的等离子体顺着磁力线像雨一样往下落。每过四十秒，最外面那道磁环会被越撑越高，最后挣断飞出去，在它的两个脚点留下两道耀斑亮带。右上角那颗小小的蓝色星球是同比例的地球。',
  controls:[],init(s){},tick(s){},draw,
  info(s){const sec=(s.t%LOOPT)/24;return sec<18?'磁环稳定':sec<27?'磁环正在升高':'日冕物质抛射'}});
})();

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

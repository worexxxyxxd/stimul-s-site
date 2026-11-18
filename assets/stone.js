/* Иллюстрации камня: рисуются, пока в папке img/ нет настоящих фото */
(function(){
"use strict";
var DPR=Math.min(window.devicePixelRatio||1,2);
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hsl(h,s,l,a){return "hsla("+h.toFixed(1)+","+s.toFixed(1)+"%,"+l.toFixed(1)+"%,"+(a==null?1:a)+")"}

/* шумовые текстуры: мелкое зерно и крупная пятнистость */
var grain=document.createElement("canvas");grain.width=grain.height=256;
(function(){var g=grain.getContext("2d"),d=g.createImageData(256,256),r=rng(7);for(var i=0;i<d.data.length;i+=4){var v=r()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)})();
var mottle=document.createElement("canvas");mottle.width=mottle.height=48;
(function(){var g=mottle.getContext("2d"),d=g.createImageData(48,48),r=rng(11);for(var i=0;i<d.data.length;i+=4){var v=90+r()*80|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)})();

function sizeCanvas(cv){var r=cv.getBoundingClientRect();var w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));cv.width=w*DPR;cv.height=h*DPR;var c=cv.getContext("2d");c.setTransform(DPR,0,0,DPR,0,0);return {c:c,w:w,h:h}}

/* ————— камень ————— */
var COLORS={
  white:{name:"Белый",h:40,s:18,l:84,v:5},
  beige:{name:"Бежевый",h:36,s:30,l:72,v:7},
  gold:{name:"Золотистый",h:38,s:48,l:60,v:9},
  pink:{name:"Розовый",h:18,s:30,l:70,v:7},
  grey:{name:"Серый",h:40,s:6,l:58,v:8}
};
var FINISHES={
  sawn:{name:"Пиленый",text:"Ровная лицевая сторона после распила. Строгий, аккуратный фасад с чёткой геометрией швов.",use:"Фасады в современном и классическом стиле, внутренняя отделка"},
  rough:{name:"Рваный край",text:"Лицо ровное, а края сколоты вручную. Живая граница камня даёт выразительную игру света и тени.",use:"Фасады, цоколь, заборы и столбы"},
  rock:{name:"Скала",text:"Выпуклая колотая поверхность, как у природной скалы. Самая рельефная и «крепостная» фактура.",use:"Цоколь, углы-рустики, ограды"},
  tumbled:{name:"Галтованный",text:"Камень обкатывают в барабане: углы смягчаются, поверхность выглядит состаренной, словно ей сотня лет.",use:"Интерьер, камины, акцентные стены, дорожки"}
};

function blockPath(c,x,y,w,h,fin,R,u){
  c.beginPath();
  if(fin==="tumbled"){var rr=Math.min(w,h)*(.18+R()*.12);
    if(c.roundRect){c.roundRect(x,y,w,h,rr)}else{c.rect(x,y,w,h)}return}
  if(fin==="sawn"){var j=.6*u;c.moveTo(x+R()*j,y+R()*j);c.lineTo(x+w-R()*j,y+R()*j);c.lineTo(x+w-R()*j,y+h-R()*j);c.lineTo(x+R()*j,y+h-R()*j);c.closePath();return}
  var amp=(fin==="rock"?4.5:3.4)*u,step=7*u,pts=[],i,n;
  n=Math.max(2,Math.round(w/step));for(i=0;i<n;i++)pts.push([x+w*i/n,y+R()*amp]);
  n=Math.max(2,Math.round(h/step));for(i=0;i<n;i++)pts.push([x+w-R()*amp,y+h*i/n]);
  n=Math.max(2,Math.round(w/step));for(i=0;i<n;i++)pts.push([x+w-w*i/n,y+h-R()*amp]);
  n=Math.max(2,Math.round(h/step));for(i=0;i<n;i++)pts.push([x+R()*amp,y+h-h*i/n]);
  c.moveTo(pts[0][0],pts[0][1]);for(i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();
}

function drawBlock(c,b,col,fin,R,u,opt){
  opt=opt||{};
  var x=b.x,y=b.y,w=b.w,h=b.h;
  var L=col.l+(R()-.5)*col.v*2, H=col.h+(R()-.5)*7, S=Math.max(0,col.s+(R()-.5)*10);
  blockPath(c,x,y,w,h,fin,rng(b.seed),u);
  c.save();
  c.shadowColor="rgba(10,6,2,.55)";c.shadowBlur=(fin==="rock"?9:5)*u;c.shadowOffsetX=2*u;c.shadowOffsetY=3*u;
  c.fillStyle=hsl(H,S,L);c.fill();
  c.restore();
  c.save();c.clip();
  var g;
  if(fin==="rock"){
    g=c.createRadialGradient(x+w*.35,y+h*.3,1,x+w*.5,y+h*.5,Math.max(w,h)*.75);
    g.addColorStop(0,"rgba(255,244,225,.32)");g.addColorStop(.55,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(20,10,0,.45)");
    c.fillStyle=g;c.fillRect(x,y,w,h);
    for(var k=0;k<7;k++){c.beginPath();var cx=x+R()*w,cy=y+R()*h,rad=(8+R()*18)*u;c.moveTo(cx+rad,cy);for(var a=1;a<6;a++){var an=a/6*Math.PI*2,rr2=rad*(.6+R()*.6);c.lineTo(cx+Math.cos(an)*rr2,cy+Math.sin(an)*rr2)}c.closePath();c.fillStyle=R()<.5?"rgba(255,245,230,.10)":"rgba(30,18,6,.12)";c.fill()}
  }else{
    g=c.createLinearGradient(x,y,x+w,y+h);
    g.addColorStop(0,"rgba(255,246,230,"+(fin==="tumbled"?.16:.1)+")");g.addColorStop(1,"rgba(25,14,4,"+(fin==="tumbled"?.3:.18)+")");
    c.fillStyle=g;c.fillRect(x,y,w,h);
  }
  if(fin==="sawn"&&!opt.noSaw){c.strokeStyle="rgba(40,25,10,.05)";c.lineWidth=1;for(var sy=y+3;sy<y+h;sy+=3*u+R()*3){c.beginPath();c.moveTo(x,sy);c.lineTo(x+w,sy+R()*1.5);c.stroke()}}
  /* ракушечник: поры и вкрапления */
  var nS=(w*h)/(260*u*u)*(opt.speck==null?1:opt.speck);
  for(var s=0;s<nS;s++){c.beginPath();c.ellipse(x+R()*w,y+R()*h,(.5+R()*1.6)*u,(.4+R()*1.1)*u,R()*3,0,7);c.fillStyle=R()<.7?"rgba(60,40,18,"+(.12+R()*.2)+")":"rgba(255,250,240,"+(.15+R()*.2)+")";c.fill()}
  /* фаска: свет сверху-слева, тень снизу-справа */
  c.lineWidth=(fin==="tumbled"?6:3)*u;
  c.translate(1.6*u,1.6*u);blockPath(c,x,y,w,h,fin,rng(b.seed),u);c.strokeStyle="rgba(255,248,235,.30)";c.stroke();
  c.translate(-3.2*u,-3.2*u);blockPath(c,x,y,w,h,fin,rng(b.seed),u);c.strokeStyle="rgba(25,14,4,.40)";c.stroke();
  c.restore();
}

function layoutCourses(x0,y0,W,H,rowMin,rowMax,bMin,bMax,gap,R){
  var out=[],y=y0;
  while(y<y0+H){
    var rh=rowMin+R()*(rowMax-rowMin); if(y+rh>y0+H-rowMin*.6) rh=y0+H-y;
    var x=x0-R()*bMax*.8;
    while(x<x0+W){
      var bw=bMin+R()*(bMax-bMin);
      if(R()<.16&&rh>rowMin*1.3){var h1=rh*(.4+R()*.2);
        out.push({x:x+gap/2,y:y+gap/2,w:bw-gap,h:h1-gap,seed:R()*1e9|0});
        out.push({x:x+gap/2,y:y+h1+gap/2,w:bw-gap,h:rh-h1-gap,seed:R()*1e9|0});
      }else out.push({x:x+gap/2,y:y+gap/2,w:bw-gap,h:rh-gap,seed:R()*1e9|0});
      x+=bw;
    }
    y+=rh;
  }
  return out;
}

function finishSurface(c,W,H,strength){
  c.save();
  c.globalCompositeOperation="overlay";c.globalAlpha=.22*strength;
  c.fillStyle=c.createPattern(grain,"repeat");c.fillRect(0,0,W,H);
  c.globalCompositeOperation="soft-light";c.globalAlpha=.55*strength;c.imageSmoothingEnabled=true;
  c.drawImage(mottle,0,0,W,H);
  c.restore();
}

function wall(c,x,y,W,H,col,fin,R,u,sizes){
  sizes=sizes||{};
  var rmin=(sizes.rmin||30)*u,rmax=(sizes.rmax||48)*u,bmin=(sizes.bmin||48)*u,bmax=(sizes.bmax||120)*u;
  var gap=(fin==="sawn"?4:fin==="tumbled"?7:6)*u;
  var blocks=layoutCourses(x,y,W,H,rmin,rmax,bmin,bmax,gap,R);
  for(var i=0;i<blocks.length;i++){drawBlock(c,blocks[i],col,fin,rng(blocks[i].seed),u,sizes)}
}

function mortar(c,x,y,W,H,col){c.fillStyle=hsl(col.h,Math.max(4,col.s*.45),col.l*.42);c.fillRect(x,y,W,H)}

/* ————— фасад с арочным окном ————— */
function drawFacade(cv,seed){
  var S=sizeCanvas(cv),c=S.c,W=S.w,H=S.h,R=rng(seed);
  var u=Math.max(.55,Math.min(1.25,Math.max(W,H)/900));
  var upper=COLORS.beige,plinthCol={h:34,s:10,l:50,v:9},trim={h:40,s:24,l:82,v:3};
  var plH=H*.2,corH=46*u,belt=16*u;
  mortar(c,0,0,W,H,upper);
  wall(c,0,corH,W,H-plH-corH,upper,"rough",R,u,{rmin:30,rmax:44,bmin:46,bmax:118,speck:1.2});
  mortar(c,0,H-plH,W,plH,plinthCol);
  wall(c,0,H-plH+belt,W,plH-belt,plinthCol,"rock",R,u,{rmin:Math.max(32,(plH-belt)/u/2.2),rmax:Math.max(44,(plH-belt)/u/1.6),bmin:70,bmax:150,speck:.6});
  /* пояс над цоколем */
  c.save();c.shadowColor="rgba(0,0,0,.55)";c.shadowBlur=10*u;c.shadowOffsetY=6*u;
  c.fillStyle=hsl(trim.h,trim.s,trim.l-6);c.fillRect(0,H-plH-2*u,W,belt+2*u);c.restore();
  var gb=c.createLinearGradient(0,H-plH,0,H-plH+belt);gb.addColorStop(0,"rgba(255,250,240,.45)");gb.addColorStop(.35,"rgba(255,250,240,0)");gb.addColorStop(1,"rgba(40,25,10,.4)");c.fillStyle=gb;c.fillRect(0,H-plH-2*u,W,belt+2*u);
  /* карниз */
  var bands=[[0,10,-14],[10,12,8],[22,6,-4],[28,10,14],[38,8,-10]];
  for(var i=0;i<bands.length;i++){var bd=bands[i];var gg=c.createLinearGradient(0,bd[0]*u,0,(bd[0]+bd[1])*u);gg.addColorStop(0,hsl(trim.h,trim.s,trim.l+bd[2]*.3));gg.addColorStop(1,hsl(trim.h,trim.s,trim.l+bd[2]*.3-12));c.fillStyle=gg;c.fillRect(0,bd[0]*u,W,bd[1]*u)}
  var cs=c.createLinearGradient(0,corH,0,corH+26*u);cs.addColorStop(0,"rgba(20,12,4,.55)");cs.addColorStop(1,"rgba(20,12,4,0)");c.fillStyle=cs;c.fillRect(0,corH,W,26*u);

  /* окно */
  var narrow=W<560;
  var ww=Math.min(W*(narrow?.36:.27),300*u), wx=W*(narrow?.58:.56)-ww/2, wTop=corH+H*.12+ww/2, wBot=H-plH-H*.1;
  if(wBot-wTop<ww*.5){wBot=wTop+ww*.5}
  var r=ww/2,cx=wx+r,ring=26*u,jamb=22*u;
  /* очистка под обрамление */
  c.fillStyle=hsl(upper.h,upper.s*.4,upper.l*.38);
  c.beginPath();c.moveTo(wx-jamb-6*u,wBot+4*u);c.lineTo(wx-jamb-6*u,wTop);c.arc(cx,wTop,r+ring+6*u,Math.PI,0);c.lineTo(wx+ww+jamb+6*u,wBot+4*u);c.closePath();c.fill();
  /* откосы-рустики */
  var y=wBot,alt=0;
  while(y>wTop+4*u){var qh=Math.min(28*u,y-wTop);var ext=alt%2?8*u:20*u;
    drawBlock(c,{x:wx-jamb-ext+jamb*.0,y:y-qh+2*u,w:jamb+ext,h:qh-4*u,seed:R()*1e9|0},trim,"sawn",R,u,{speck:.5,noSaw:true});
    drawBlock(c,{x:wx+ww,y:y-qh+2*u,w:jamb+ext,h:qh-4*u,seed:R()*1e9|0},trim,"sawn",R,u,{speck:.5,noSaw:true});
    y-=qh;alt++}
  /* клинчатая арка */
  var N=11;
  for(var k=0;k<N;k++){
    var a0=Math.PI+k/N*Math.PI+.012,a1=Math.PI+(k+1)/N*Math.PI-.012,key=(k===5);
    var ro=r+ring+(key?14*u:0),ri=r-(key?0:0);
    c.beginPath();c.arc(cx,wTop,ro,a0,a1);c.arc(cx,wTop,ri,a1,a0,true);c.closePath();
    c.save();c.shadowColor="rgba(10,6,2,.55)";c.shadowBlur=6*u;c.shadowOffsetX=2*u;c.shadowOffsetY=3*u;
    c.fillStyle=hsl(trim.h+(R()-.5)*4,trim.s,trim.l+(key?2:-2)+(R()-.5)*5);c.fill();c.restore();
    c.save();c.clip();var am=(a0+a1)/2;var gx=c.createLinearGradient(cx+Math.cos(am)*ri,wTop+Math.sin(am)*ri,cx+Math.cos(am)*ro,wTop+Math.sin(am)*ro);
    gx.addColorStop(0,"rgba(30,18,6,.25)");gx.addColorStop(1,"rgba(255,248,235,.18)");c.fillStyle=gx;c.fillRect(cx-ro,wTop-ro,ro*2,ro);
    if(key){c.fillStyle="rgba(255,248,235,.12)";c.fillRect(cx-ro,wTop-ro,ro,ro)}
    c.restore();
  }
  /* проём и стекло */
  c.beginPath();c.moveTo(wx,wBot);c.lineTo(wx,wTop);c.arc(cx,wTop,r,Math.PI,0);c.lineTo(wx+ww,wBot);c.closePath();
  c.save();c.clip();
  var gl=c.createLinearGradient(wx,wTop-r,wx+ww,wBot);gl.addColorStop(0,"#3B4652");gl.addColorStop(.5,"#1C232B");gl.addColorStop(1,"#0E1217");c.fillStyle=gl;c.fillRect(wx-2,wTop-r-2,ww+4,wBot-wTop+r+4);
  c.fillStyle="rgba(255,214,160,.10)";c.beginPath();c.moveTo(wx,wTop+ww*.2);c.lineTo(wx+ww*.55,wTop-r);c.lineTo(wx+ww*.8,wTop-r);c.lineTo(wx,wTop+ww*.65);c.closePath();c.fill();
  /* тёплый свет в комнате */
  var rg=c.createRadialGradient(cx,wBot-10*u,2,cx,wBot,ww*.9);rg.addColorStop(0,"rgba(255,190,110,.32)");rg.addColorStop(1,"rgba(255,190,110,0)");c.fillStyle=rg;c.fillRect(wx,wTop-r,ww,wBot-wTop+r);
  /* рама */
  c.strokeStyle="#D9D2C4";c.lineWidth=7*u;c.stroke();
  c.lineWidth=3.5*u;c.beginPath();c.moveTo(cx,wTop-r);c.lineTo(cx,wBot);c.moveTo(wx,wTop);c.lineTo(wx+ww,wTop);c.moveTo(wx,wTop+(wBot-wTop)*.55);c.lineTo(wx+ww,wTop+(wBot-wTop)*.55);c.stroke();
  c.restore();
  /* тень откоса */
  c.save();c.beginPath();c.moveTo(wx,wBot);c.lineTo(wx,wTop);c.arc(cx,wTop,r,Math.PI,0);c.lineTo(wx+ww,wBot);c.closePath();c.clip();
  var sh=c.createLinearGradient(wx,0,wx+18*u,0);sh.addColorStop(0,"rgba(0,0,0,.6)");sh.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=sh;c.fillRect(wx,wTop-r,18*u,wBot-wTop+r);
  var sh2=c.createLinearGradient(0,wTop-r,0,wTop-r+28*u);sh2.addColorStop(0,"rgba(0,0,0,.55)");sh2.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=sh2;c.fillRect(wx,wTop-r,ww,28*u);
  c.restore();
  /* подоконный слив */
  drawBlock(c,{x:wx-jamb-14*u,y:wBot,w:ww+jamb*2+28*u,h:14*u,seed:R()*1e9|0},trim,"sawn",R,u,{speck:.3,noSaw:true});
  var ss=c.createLinearGradient(0,wBot+14*u,0,wBot+40*u);ss.addColorStop(0,"rgba(20,12,4,.5)");ss.addColorStop(1,"rgba(20,12,4,0)");c.fillStyle=ss;c.fillRect(wx-jamb-14*u,wBot+14*u,ww+jamb*2+28*u,26*u);

  finishSurface(c,W,H,1);
  /* скользящий свет заката */
  c.save();
  var lg=c.createLinearGradient(0,0,W,H);lg.addColorStop(0,"rgba(255,170,80,.22)");lg.addColorStop(.5,"rgba(255,170,80,0)");lg.addColorStop(1,"rgba(10,6,20,.5)");
  c.globalCompositeOperation="soft-light";c.fillStyle=lg;c.fillRect(0,0,W,H);
  c.globalCompositeOperation="source-over";var vg=c.createLinearGradient(0,H*.7,0,H);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.35)");c.fillStyle=vg;c.fillRect(0,0,W,H);
  c.restore();
}

/* ————— горы, карьер, заготовки ————— */
function ridge(W,base,amp,rough,R){
  var n=129,p=new Array(n);p[0]=base+(R()-.5)*amp;p[n-1]=base+(R()-.5)*amp;
  (function sub(a,b,d){if(b-a<2)return;var m=(a+b)>>1;p[m]=(p[a]+p[b])/2+(R()-.5)*d;sub(a,m,d*rough);sub(m,b,d*rough)})(0,n-1,amp);
  return p.map(function(v,i){return [i/(n-1)*W,v]});
}
function drawRoute(cv,seed){
  var S=sizeCanvas(cv),c=S.c,W=S.w,H=S.h,R=rng(seed),u=Math.max(.6,Math.min(1.4,W/1200));
  var sky=c.createLinearGradient(0,0,0,H*.75);sky.addColorStop(0,"#2C2A33");sky.addColorStop(.45,"#6B4E4A");sky.addColorStop(.8,"#D49A63");sky.addColorStop(1,"#E9C08A");
  c.fillStyle=sky;c.fillRect(0,0,W,H);
  var sx=W*.7,sy=H*.42;var sg=c.createRadialGradient(sx,sy,2,sx,sy,W*.45);sg.addColorStop(0,"rgba(255,226,170,.9)");sg.addColorStop(.06,"rgba(255,210,150,.55)");sg.addColorStop(1,"rgba(255,180,110,0)");c.fillStyle=sg;c.fillRect(0,0,W,H);
  c.fillStyle="rgba(255,236,200,.95)";c.beginPath();c.arc(sx,sy,16*u,0,7);c.fill();
  var layers=[
    {b:.46,a:.20,r:.55,col:"#9A7F74",fog:.35},
    {b:.54,a:.18,r:.56,col:"#7A625A",fog:.3},
    {b:.62,a:.14,r:.58,col:"#574740",fog:.24},
    {b:.70,a:.10,r:.6,col:"#3A2F2A",fog:.0,quarry:true},
  ];
  for(var i=0;i<layers.length;i++){
    var L=layers[i],pts=ridge(W,H*L.b,H*L.a,L.r,R);
    if(L.quarry)pts.forEach(function(p){var d=(p[0]-W*.3)/(W*.26);p[1]-=H*.24*Math.exp(-d*d)});
    c.beginPath();c.moveTo(0,H);pts.forEach(function(p){c.lineTo(p[0],p[1])});c.lineTo(W,H);c.closePath();
    var lg=c.createLinearGradient(0,H*(L.b-L.a),0,H);lg.addColorStop(0,L.col);lg.addColorStop(1,"#1A1513");c.fillStyle=lg;c.fill();
    /* освещённые склоны */
    c.save();c.clip();c.globalCompositeOperation="soft-light";var lit=c.createLinearGradient(sx,0,0,0);lit.addColorStop(0,"rgba(255,200,140,.5)");lit.addColorStop(1,"rgba(0,0,0,.2)");c.fillStyle=lit;c.fillRect(0,0,W,H);c.restore();
    if(L.fog){var fg=c.createLinearGradient(0,H*(L.b+.02),0,H*(L.b+.14));fg.addColorStop(0,"rgba(233,192,138,0)");fg.addColorStop(.5,"rgba(233,192,138,"+L.fog+")");fg.addColorStop(1,"rgba(233,192,138,0)");c.fillStyle=fg;c.fillRect(0,H*(L.b+.02),W,H*.12)}
    if(L.quarry){
      /* уступы карьера, врезанные в склон: чем ниже, тем шире */
      var qx0=W*.16,qx1=W*.44,qc=(qx0+qx1)/2,hw=(qx1-qx0)/2,steps=5;
      var top=H;pts.forEach(function(p){if(p[0]>qc-hw*.4&&p[0]<qc+hw*.4)top=Math.min(top,p[1])});
      var topY=top+H*.07,stepH=(H*.8-topY)/steps;
      for(var s=0;s<steps;s++){
        var k=.42+.58*(s+1)/steps,kp=.42+.58*s/steps,yy=topY+s*stepH;
        var x0=qc-hw*kp,x1=qc+hw*kp*.85;
        var face=c.createLinearGradient(0,yy,0,yy+stepH);face.addColorStop(0,"#D9C4A0");face.addColorStop(1,"#9E8564");
        c.fillStyle=face;c.beginPath();c.moveTo(x0,yy);c.lineTo(x1,yy);c.lineTo(qc+hw*k*.85,yy+stepH*.78);c.lineTo(qc-hw*k,yy+stepH*.78);c.closePath();c.fill();
        c.fillStyle="#5C4A3C";c.beginPath();c.moveTo(qc-hw*k,yy+stepH*.78);c.lineTo(qc+hw*k*.85,yy+stepH*.78);c.lineTo(qc+hw*k*.85,yy+stepH);c.lineTo(qc-hw*k,yy+stepH);c.closePath();c.fill();
        c.fillStyle="rgba(255,240,215,.5)";c.fillRect(x0,yy-1.5*u,x1-x0,2*u);
        c.strokeStyle="rgba(80,55,30,.3)";c.lineWidth=1;
        for(var vx=x0+12*u;vx<x1;vx+=(16+R()*26)*u){c.beginPath();c.moveTo(vx,yy+1);c.lineTo(vx+(R()-.5)*3,yy+stepH*.76);c.stroke()}
      }
    }
  }
  /* передний план: земля и заготовки */
  var gpts=ridge(W,H*.86,H*.04,.5,R);
  c.beginPath();c.moveTo(0,H);gpts.forEach(function(p){c.lineTo(p[0],p[1])});c.lineTo(W,H);c.closePath();c.fillStyle="#171210";c.fill();
  var blocks=[[.58,.86,90,46,40],[.66,.88,120,58,46],[.76,.84,80,40,34],[.71,.81,70,34,30],[.86,.89,110,54,44],[.93,.86,70,40,30]];
  blocks.sort(function(a,b){return a[1]-b[1]});
  blocks.forEach(function(b){c.fillStyle="rgba(0,0,0,.4)";c.beginPath();c.ellipse(W*b[0]+b[4]*u*.15,H*b[1]+3*u,b[2]*u*.65,6*u,0,0,7);c.fill()});
  blocks.forEach(function(b){
    var bx=W*b[0],by=H*b[1],bw=b[2]*u,bh=b[3]*u,dp=b[4]*u*.5;
    if(bx-bw/2>W)return;
    var x=bx-bw/2,y=by-bh;
    c.fillStyle="#B79E7B";c.fillRect(x,y,bw,bh);
    var fg2=c.createLinearGradient(x,0,x+bw,0);fg2.addColorStop(0,"rgba(255,215,160,.35)");fg2.addColorStop(1,"rgba(40,25,10,.35)");c.fillStyle=fg2;c.fillRect(x,y,bw,bh);
    c.fillStyle="#E2CDA8";c.beginPath();c.moveTo(x,y);c.lineTo(x+dp,y-dp*.55);c.lineTo(x+bw+dp,y-dp*.55);c.lineTo(x+bw,y);c.closePath();c.fill();
    c.fillStyle="#6E5A42";c.beginPath();c.moveTo(x+bw,y);c.lineTo(x+bw+dp,y-dp*.55);c.lineTo(x+bw+dp,y+bh-dp*.55);c.lineTo(x+bw,y+bh);c.closePath();c.fill();
    c.strokeStyle="rgba(60,40,20,.22)";c.lineWidth=1;for(var ly=y+5*u;ly<y+bh;ly+=4*u){c.beginPath();c.moveTo(x,ly);c.lineTo(x+bw,ly);c.stroke()}
  });
  finishSurface(c,W,H,.55);
  var dk=c.createLinearGradient(0,0,0,H*.45);dk.addColorStop(0,"rgba(16,14,16,.55)");dk.addColorStop(1,"rgba(16,14,16,0)");c.fillStyle=dk;c.fillRect(0,0,W,H*.45);
  var bt=c.createLinearGradient(0,H*.8,0,H);bt.addColorStop(0,"rgba(26,23,21,0)");bt.addColorStop(1,"rgba(26,23,21,1)");c.fillStyle=bt;c.fillRect(0,H*.8,W,H*.2);
}

/* ————— плитняк для мощения ————— */
function drawPaving(c,W,H,R,u){
  var col={h:34,s:16,l:58,v:10};mortar(c,0,0,W,H,{h:30,s:20,l:40});
  var cell=46*u,cols=Math.ceil(W/cell)+2,rows=Math.ceil(H/cell)+2,P=[];
  for(var j=0;j<rows;j++){P[j]=[];for(var i=0;i<cols;i++)P[j][i]=[(i-1)*cell+(R()-.5)*cell*.6,(j-1)*cell+(R()-.5)*cell*.6]}
  for(j=0;j<rows-1;j++)for(i=0;i<cols-1;i++){
    var q=[P[j][i],P[j][i+1],P[j+1][i+1],P[j+1][i]],mx=0,my=0;q.forEach(function(p){mx+=p[0]/4;my+=p[1]/4});
    var g=.13;var pts=q.map(function(p){return [p[0]+(mx-p[0])*g,p[1]+(my-p[1])*g]});
    c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(var k=1;k<4;k++)c.lineTo(pts[k][0],pts[k][1]);c.closePath();
    c.save();c.shadowColor="rgba(0,0,0,.5)";c.shadowBlur=4*u;c.shadowOffsetY=2*u;
    c.fillStyle=hsl(col.h+(R()-.5)*10,col.s+(R()-.5)*10,col.l+(R()-.5)*col.v*2);c.fill();c.restore();
    c.save();c.clip();var gg=c.createLinearGradient(mx-cell/2,my-cell/2,mx+cell/2,my+cell/2);gg.addColorStop(0,"rgba(255,245,230,.2)");gg.addColorStop(1,"rgba(20,10,0,.25)");c.fillStyle=gg;c.fillRect(mx-cell,my-cell,cell*2,cell*2);c.restore();
  }
  finishSurface(c,W,H,1);
}

/* ————— карниз для декора ————— */
function drawDecor(c,W,H,R,u){
  var col=COLORS.beige,t={h:40,s:22,l:80,v:3};mortar(c,0,0,W,H,col);
  wall(c,0,H*.55,W,H*.45,col,"sawn",R,u,{rmin:24,rmax:30,bmin:50,bmax:90});
  var prof=[[0,.08,6],[.08,.06,-8],[.14,.1,10],[.24,.05,-6],[.29,.12,4],[.41,.05,-10],[.46,.09,8]];
  prof.forEach(function(p){var y=p[0]*H,h=p[1]*H;var g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,hsl(t.h,t.s,t.l+p[2]*.6));g.addColorStop(1,hsl(t.h,t.s,t.l+p[2]*.6-14));c.fillStyle=g;c.fillRect(0,y,W,h)});
  /* сухарики */
  for(var x=4*u;x<W;x+=16*u){c.fillStyle=hsl(t.h,t.s,t.l-4);c.fillRect(x,.24*H,9*u,.05*H);c.fillStyle="rgba(0,0,0,.35)";c.fillRect(x+9*u,.24*H,3*u,.05*H)}
  var sh=c.createLinearGradient(0,.55*H,0,.55*H+16*u);sh.addColorStop(0,"rgba(0,0,0,.55)");sh.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=sh;c.fillRect(0,.55*H,W,16*u);
  finishSurface(c,W,H,1);
}

/* ————— плёночное зерно и царапины для «старого» фото ————— */
function drawAgedGrain(cv){
  var S=sizeCanvas(cv),c=S.c,W=S.w,H=S.h,R=rng(99);
  c.fillStyle="#fff";c.fillRect(0,0,W,H);
  c.globalAlpha=.18;c.fillStyle=c.createPattern(grain,"repeat");c.fillRect(0,0,W,H);c.globalAlpha=1;
  c.strokeStyle="rgba(70,50,30,.35)";
  for(var i=0;i<9;i++){var x=R()*W;c.lineWidth=.4+R()*.8;c.beginPath();c.moveTo(x,R()*H*.3);c.lineTo(x+(R()-.5)*8,H*(.5+R()*.5));c.stroke()}
  for(i=0;i<70;i++){c.fillStyle="rgba(60,40,20,"+(.15+R()*.35)+")";c.beginPath();c.arc(R()*W,R()*H,R()*1.4+.2,0,7);c.fill()}
  for(i=0;i<5;i++){c.strokeStyle="rgba(90,70,40,.3)";c.lineWidth=.6;c.beginPath();var x0=R()*W,y0=R()*H;c.moveTo(x0,y0);c.quadraticCurveTo(x0+R()*30,y0+R()*20,x0+R()*40-10,y0+R()*40);c.stroke()}
}


function drawWallArt(cv){
  var S=sizeCanvas(cv),c=S.c,W=S.w,H=S.h;
  var col=COLORS[cv.dataset.color||"beige"],fin=cv.dataset.finish||"sawn",u=+(cv.dataset.scale||.7);
  var sz=fin==="tumbled"?{rmin:26,rmax:40,bmin:40,bmax:90}:fin==="rock"?{rmin:44,rmax:64,bmin:70,bmax:150}:{rmin:34,rmax:50,bmin:60,bmax:140};
  if(fin==="rock")sz.speck=.6;
  mortar(c,0,0,W,H,col);wall(c,0,0,W,H,col,fin,rng(+(cv.dataset.seed||17)),u,sz);finishSurface(c,W,H,1);
  var lg=c.createLinearGradient(0,0,W,H);lg.addColorStop(0,"rgba(255,235,205,.16)");lg.addColorStop(1,"rgba(10,8,20,.28)");
  c.save();c.globalCompositeOperation="soft-light";c.fillStyle=lg;c.fillRect(0,0,W,H);c.restore();
}
function drawOne(cv){
  var k=cv.dataset.art,R=rng(+(cv.dataset.seed||5));
  if(k==="facade")drawFacade(cv,+(cv.dataset.seed||1907));
  else if(k==="route")drawRoute(cv,+(cv.dataset.seed||77));
  else if(k==="grain")drawAgedGrain(cv);
  else if(k==="wall")drawWallArt(cv);
  else{var S=sizeCanvas(cv);if(k==="decor")drawDecor(S.c,S.w,S.h,R,.6);else if(k==="paving")drawPaving(S.c,S.w,S.h,R,.6)}
}
function renderIn(root){
  (root||document).querySelectorAll("canvas[data-art]").forEach(function(cv){
    var w=Math.round(cv.getBoundingClientRect().width);
    if(!w||cv._w===w)return;cv._w=w;drawOne(cv);
  });
}
function blockCanvas(W,H,color,fin,seed){
  var cv=document.createElement("canvas");cv.width=W;cv.height=H;var c=cv.getContext("2d");
  var col=COLORS[color]||COLORS.beige,R=rng(seed||1),u=W/260;
  c.fillStyle=hsl(col.h,col.s,col.l);c.fillRect(0,0,W,H);
  drawBlock(c,{x:-14*u,y:-14*u,w:W+28*u,h:H+28*u,seed:seed||1},col,fin,R,u,{noSaw:fin!=="sawn",speck:1.3});
  finishSurface(c,W,H,1);return cv;
}
window.StoneArt={renderIn:renderIn,blockCanvas:blockCanvas,COLORS:COLORS,FINISHES:FINISHES};
var lastW=window.innerWidth,t;
window.addEventListener("resize",function(){if(window.innerWidth===lastW)return;lastW=window.innerWidth;clearTimeout(t);t=setTimeout(function(){renderIn(document)},150)});
if(document.readyState!=="loading")renderIn(document);else document.addEventListener("DOMContentLoaded",function(){renderIn(document)});
})();

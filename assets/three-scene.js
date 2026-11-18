/* 3D-сцены сайта: каменный портал, горы с карьером, образец камня.
   Если WebGL недоступен, остаются 2D-иллюстрации. */
(function(){
"use strict";
if(!window.THREE||!window.StoneArt)return;
var T=window.THREE;
function glOK(){try{var c=document.createElement("canvas");return !!(window.WebGLRenderingContext&&(c.getContext("webgl")||c.getContext("experimental-webgl")))}catch(e){return false}}
if(!glOK())return;
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ——— материалы камня из процедурных текстур ——— */
var texCache={};
function stoneTex(color,fin,seed,w,h){
  var k=[color,fin,seed,w,h].join("|");if(texCache[k])return texCache[k];
  var t=new T.CanvasTexture(StoneArt.blockCanvas(w||256,h||256,color,fin,seed));
  t.encoding=T.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=T.RepeatWrapping;
  return texCache[k]=t;
}
function stoneMat(color,fin,seed,w,h){
  var t=stoneTex(color,fin,seed,w,h);
  return new T.MeshStandardMaterial({map:t,bumpMap:t,bumpScale:fin==="rock"?0.07:0.03,roughness:.92,metalness:0});
}

/* ——— общий каркас сцены ——— */
function Stage(el,build){
  var host=el.querySelector(".gl");if(!host)return;
  var r;try{r=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power"})}catch(e){return}
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=.82;
  host.appendChild(r.domElement);
  var scene=new T.Scene(),cam=new T.PerspectiveCamera(35,1,.1,120);
  var ptr={x:0,y:0,tx:0,ty:0};
  el.addEventListener("pointermove",function(e){var b=el.getBoundingClientRect();ptr.tx=((e.clientX-b.left)/b.width-.5)*2;ptr.ty=((e.clientY-b.top)/b.height-.5)*2});
  el.addEventListener("pointerleave",function(){ptr.tx=0;ptr.ty=0});
  var api=build(scene,cam,r,el,ptr)||{};
  var w=0,h=0;
  function size(){var b=host.getBoundingClientRect();if(b.width<2||b.height<2)return false;
    if(b.width!==w||b.height!==h){w=b.width;h=b.height;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(api.resize)api.resize(w,h)}return true}
  var visible=false,running=false,clock=0,last=0;
  function frame(now){
    if(!visible){running=false;return}
    var dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(!reduce)clock+=dt;
    ptr.x+=(ptr.tx-ptr.x)*.06;ptr.y+=(ptr.ty-ptr.y)*.06;
    if(size()){if(api.update)api.update(clock,dt);r.render(scene,cam)}
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible&&!running){running=true;last=0;requestAnimationFrame(frame)}},{rootMargin:"120px"}).observe(el);
  el.classList.add("is-3d");el._stage=api;
  return api;
}

/* ——— 1. Каменный портал с арочным окном ——— */
function portal(scene,cam,r,el,ptr){
  scene.add(new T.HemisphereLight(0xffe7c8,0x15100c,.3));
  var key=new T.DirectionalLight(0xffd2a0,1.35);key.position.set(-5,6,7);scene.add(key);
  var rim=new T.DirectionalLight(0xc39b5f,1.6);rim.position.set(6,3,-6);scene.add(rim);
  var fill=new T.PointLight(0x8094b0,.35,40);fill.position.set(5,-3,7);scene.add(fill);
  var g=new T.Group();scene.add(g);
  var parts=[],D=.75;
  function add(m,dir,amp){m.userData.base=m.position.clone();m.userData.dir=dir.normalize();m.userData.amp=amp==null?1:amp;m.userData.ph=Math.random()*6.28;g.add(m);parts.push(m);return m}
  function box(w,h,d,mat,x,y,z){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z||0);return m}

  var wallM=[stoneMat("beige","rough",11),stoneMat("gold","rough",12),stoneMat("beige","sawn",13)];
  var trimM=[stoneMat("beige","sawn",21),stoneMat("white","sawn",22)];
  var plM=[stoneMat("grey","rock",31),stoneMat("grey","rock",32)];

  /* цоколь */
  [-1.42,0,1.42].forEach(function(x,i){add(box(1.36,.78,D+.2,plM[i%2],x,-2.02,0),new T.Vector3(x*.5,-1,.6),1.2)});
  /* пояс-отлив */
  add(box(4.6,.16,D+.32,trimM[0],0,-1.54,0),new T.Vector3(0,-.4,1),.8);
  /* откосы: рустованные камни */
  var y=-1.22,i;
  for(i=0;i<6;i++){
    var len=i%2?.62:.95;
    add(box(len,.42,D,trimM[i%2],-1.12-len/2,y,0),new T.Vector3(-1,0,.5),1);
    add(box(len,.42,D,trimM[(i+1)%2],1.12+len/2,y,0),new T.Vector3(1,0,.5),1);
    y+=.46;
  }
  var spring=y-.23;
  /* клинчатая арка */
  var N=9,Ri=1.12,Ro=1.8;
  for(i=0;i<N;i++){
    var a0=i/N*Math.PI+.012,a1=(i+1)/N*Math.PI-.012,key5=(i===4),ro=key5?Ro+.22:Ro;
    var s=new T.Shape();
    s.moveTo(Math.cos(a0)*Ri,Math.sin(a0)*Ri);s.absarc(0,0,Ri,a0,a1,false);
    s.lineTo(Math.cos(a1)*ro,Math.sin(a1)*ro);s.absarc(0,0,ro,a1,a0,true);
    var geo=new T.ExtrudeGeometry(s,{depth:D,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,curveSegments:10});
    geo.translate(0,0,-D/2);
    var m=new T.Mesh(geo,key5?stoneMat("gold","sawn",41):trimM[i%2]);m.position.set(0,spring,key5?.06:0);
    var am=(a0+a1)/2;add(m,new T.Vector3(Math.cos(am),Math.sin(am),.4),1.3);
  }
  /* стекло и переплёт */
  var op=new T.Shape();op.moveTo(-1.1,-1.36);op.lineTo(-1.1,spring);op.absarc(0,spring,1.1,Math.PI,0,true);op.lineTo(1.1,-1.36);op.lineTo(-1.1,-1.36);
  var glass=new T.Mesh(new T.ShapeGeometry(op,24),new T.MeshStandardMaterial({color:0x10161d,roughness:.12,metalness:.75,emissive:0x2a1a08,emissiveIntensity:.35}));
  glass.position.z=-.18;g.add(glass);
  var frM=new T.MeshStandardMaterial({color:0xd8d0c2,roughness:.5});
  var fr=new T.Group();fr.position.z=-.12;g.add(fr);
  fr.add(box(.07,spring+1.36+1.1,.06,frM,0,(spring+1.1-1.36)/2,0));
  fr.add(box(2.2,.07,.06,frM,0,spring,0));
  fr.add(box(2.2,.07,.06,frM,0,(spring-1.36)/2,0));
  /* фрагменты стены по сторонам */
  var rows=[-1.22,-.76,-.3,.16,.62,1.08];
  rows.forEach(function(yy,ri){
    var x=ri%2?2.05:2.25,cnt=ri<2?3:ri<4?2:1;
    for(var k=0;k<cnt;k++){var w=.62+((ri*7+k*3)%4)*.12;
      add(box(w,.42,D*.92,wallM[(ri+k)%3],-(x+w/2),yy,-.04),new T.Vector3(-1,(Math.random()-.5)*.4,.3),1.6+k*.6);
      add(box(w,.42,D*.92,wallM[(ri+k+1)%3],(x+w/2),yy,-.04),new T.Vector3(1,(Math.random()-.5)*.4,.3),1.6+k*.6);
      x+=w+.04;}
  });
  /* парящие осколки */
  var loose=[];
  for(i=0;i<7;i++){var sz=.14+Math.random()*.2;var m2=new T.Mesh(new T.BoxGeometry(sz,sz*.8,sz*.9),plM[i%2]);
    var ang=i/7*Math.PI*2;m2.position.set(Math.cos(ang)*3.3,1.0+Math.sin(ang)*2.2,.6+Math.random());m2.userData.sp=.2+Math.random()*.4;g.add(m2);loose.push(m2)}

  g.position.y=-.45;
  return{
    resize:function(w,h){var a=w/h;cam.position.set(0,.6,a<1.3?15.5/Math.min(1,a)*1.05:13.6);cam.lookAt(0,.45,0)},
    update:function(t){
      var ex=.05+.05*Math.sin(t*.7);
      parts.forEach(function(m){var d=m.userData;var k=ex*d.amp*(1+.35*Math.sin(t*.9+d.ph));m.position.set(d.base.x+d.dir.x*k,d.base.y+d.dir.y*k,d.base.z+d.dir.z*k)});
      loose.forEach(function(m,j){m.rotation.x+=.004*m.userData.sp*(reduce?0:1);m.rotation.y+=.006*m.userData.sp*(reduce?0:1);m.position.y+=Math.sin(t*1.1+j)*.0015});
      g.rotation.y=Math.sin(t*.22)*.32+ptr.x*.28;g.rotation.x=-.04+ptr.y*.07;
    }
  };
}

/* ——— 2. Горы с уступами карьера ——— */
function hash(x,y){var s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s)}
function vnoise(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;var u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  var a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y){var s=0,a=.5,f=1;for(var i=0;i<5;i++){s+=a*vnoise(x*f,y*f);f*=2.03;a*=.5}return s}
function mountains(scene,cam,r,el,ptr){
  scene.fog=new T.Fog(0x1e1813,16,58);
  scene.add(new T.HemisphereLight(0xe8b98a,0x0b0a09,.35));
  var sun=new T.DirectionalLight(0xffb070,2.0);sun.position.set(8,6,-20);scene.add(sun);
  var front=new T.DirectionalLight(0x8a7a6a,.35);front.position.set(-4,6,10);scene.add(front);
  var W=64,Dp=44,geo=new T.PlaneGeometry(W,Dp,190,130);geo.rotateX(-Math.PI/2);
  var pos=geo.attributes.position,cols=[],cDark=new T.Color(0x2a221c),cMid=new T.Color(0x5b4a3c),cHigh=new T.Color(0x9a8270),cQ=new T.Color(0xd5c09c),tmp=new T.Color();
  var qx=-5.5,qz=-7;
  for(var i=0;i<pos.count;i++){
    var x=pos.getX(i),z=pos.getZ(i);
    var far=Math.max(0,-z-2)/(Dp/2);
    var hgt=Math.pow(fbm(x*.09+3,z*.09+7),1.6)*(1.2+far*20)+far*3.5;
    var near=Math.max(0,z-4);hgt*=Math.max(.3,1-near*.15);
    var dq=Math.hypot((x-qx)*.8,(z-qz));
    var q=0;
    if(dq<4.2){var bench=Math.max(0,hgt);var stepH=.55;var qh=Math.floor(bench/stepH)*stepH;var f=Math.min(1,(4.2-dq)/1.2);hgt=hgt*(1-f)+qh*f;q=f}
    pos.setY(i,hgt);
    var hn=Math.min(1,hgt/7);
    tmp.copy(cDark).lerp(cMid,Math.min(1,hn*1.6));if(hn>.55)tmp.lerp(cHigh,(hn-.55)*1.6);
    if(q>0)tmp.lerp(cQ,q*.4);
    cols.push(tmp.r,tmp.g,tmp.b);
  }
  geo.setAttribute("color",new T.Float32BufferAttribute(cols,3));geo.computeVertexNormals();
  var land=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));
  land.position.z=-10;scene.add(land);
  /* заготовки камня на переднем плане */
  var bm=[stoneMat("beige","sawn",51),stoneMat("white","sawn",52),stoneMat("gold","sawn",53)];
  var stack=new T.Group();scene.add(stack);
  [[3.2,0,.6,1.1,.6,.7,.2],[4.3,0,.2,.9,.55,.65,-.25],[3.6,.6,.45,.8,.45,.6,.1],[5.3,0,1.0,.7,.45,.55,.5],[2.3,0,1.4,.6,.4,.5,-.4]].forEach(function(b,j){
    var m=new T.Mesh(new T.BoxGeometry(b[3],b[4],b[5]),bm[j%3]);m.position.set(b[0],b[1]+b[4]/2+.02,b[2]);m.rotation.y=b[6];stack.add(m)});
  var ground=new T.Mesh(new T.PlaneGeometry(40,12),new T.MeshStandardMaterial({color:0x1a1512,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(0,0,4);scene.add(ground);
  /* солнце */
  var sunM=new T.Mesh(new T.CircleGeometry(1.1,40),new T.MeshBasicMaterial({color:0xffe2b0,fog:false}));sunM.position.set(9,7.5,-40);scene.add(sunM);
  var mobile=false;
  return{
    resize:function(w,h){mobile=w/h<1.3},
    update:function(t){
      var cx=Math.sin(t*.06)*1.4+ptr.x*.8;
      cam.position.set(cx+(mobile?2.4:0),2.6-ptr.y*.25,mobile?13:10.5);
      cam.lookAt(cx*.4+(mobile?1:0),3.4,-8);
    }
  };
}

/* ——— 3. Образец камня (вращение мышью/пальцем) ——— */
function sample(scene,cam,r,el,ptr){
  scene.add(new T.HemisphereLight(0xfff0dc,0x14100c,.35));
  var key=new T.DirectionalLight(0xffdcb0,1.4);key.position.set(-4,5,6);scene.add(key);
  var rim=new T.DirectionalLight(0xc39b5f,1.3);rim.position.set(5,1,-5);scene.add(rim);
  var g=new T.Group();scene.add(g);
  var defs=[[0,-.62,0,2.3,1.0,1.1],[-.05,.43,.05,1.5,.9,1.0],[1.55,-.75,.2,.85,.75,.9]];
  var meshes=defs.map(function(d){var m=new T.Mesh(new T.BoxGeometry(d[3],d[4],d[5]));m.position.set(d[0],d[1],d[2]);g.add(m);return m});
  var shadow=new T.Mesh(new T.CircleGeometry(2.4,48),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.35}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.15;shadow.scale.set(1,.55,1);scene.add(shadow);
  function setStone(color,fin){
    meshes.forEach(function(m,j){
      var d=defs[j],px=function(v){return Math.max(64,Math.round(v*180))};
      var mats=[[d[5],d[4]],[d[5],d[4]],[d[3],d[5]],[d[3],d[5]],[d[3],d[4]],[d[3],d[4]]].map(function(s,f){return stoneMat(color,fin,100+j*10+f,px(s[0]),px(s[1]))});
      m.material=mats;
    });
  }
  setStone("beige","sawn");
  var rotY=-.5,vel=reduce?0:.004,drag=null;
  el.addEventListener("pointerdown",function(e){drag={x:e.clientX};el.setPointerCapture&&el.setPointerCapture(e.pointerId)});
  el.addEventListener("pointermove",function(e){if(!drag)return;var dx=e.clientX-drag.x;drag.x=e.clientX;rotY+=dx*.012;vel=dx*.0008});
  el.addEventListener("pointerup",function(){drag=null});el.addEventListener("pointercancel",function(){drag=null});
  return{
    set:setStone,
    resize:function(w,h){var a=w/h;cam.position.set(0,1.6,a<1?9/a:8.2);cam.lookAt(0,-.15,0)},
    update:function(t){if(!drag){rotY+=vel;vel+=((reduce?0:.004)-vel)*.02}g.rotation.y=rotY;g.rotation.x=.12+ptr.y*.05}
  };
}

var builders={portal:portal,mountains:mountains,sample:sample};
document.querySelectorAll("[data-scene]").forEach(function(el){var b=builders[el.dataset.scene];if(b)try{Stage(el,b)}catch(e){el.classList.remove("is-3d")}});
})();

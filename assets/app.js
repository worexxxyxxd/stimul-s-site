(function(){
"use strict";
var PHONE="+7 925 809-09-99", WA="79258090999";

/* мобильное меню */
document.querySelectorAll(".hdr").forEach(function(h){
  var bg=h.querySelector(".burger"),nav=h.querySelector(".nav");if(!bg||!nav)return;
  bg.addEventListener("click",function(){var o=nav.classList.toggle("open");bg.setAttribute("aria-expanded",o)});
  nav.addEventListener("click",function(e){if(e.target.tagName==="A"){nav.classList.remove("open");bg.setAttribute("aria-expanded","false")}});
});

/* копирование номера */
document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest(".copy");if(!b)return;
  var done=function(){b.textContent="Скопировано";setTimeout(function(){b.textContent="Копировать"},2000)};
  var sel=function(){var el=b.parentNode.querySelector(".c-big");if(!el)return;var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent="Выделено"};
  try{navigator.clipboard.writeText(PHONE).then(done,sel)}catch(err){sel()}
});

/* заявка: собираем текст и отправляем в WhatsApp */
document.querySelectorAll("form.req").forEach(function(form){
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var ph=form.querySelector("[name=phone]"),err=form.querySelector(".err"),ok=form.querySelector(".ok");
    if(ph.value.replace(/\D/g,"").length<10){ph.setAttribute("aria-invalid","true");err.hidden=false;ph.focus();return}
    ph.removeAttribute("aria-invalid");err.hidden=true;
    var v=function(n){var el=form.querySelector("[name="+n+"]");return el&&el.value.trim()||"—"};
    var txt="Заявка с сайта СТИМУЛ-С\nИмя: "+v("name")+"\nТелефон: "+v("phone")+"\nУслуга: "+v("work")+"\nОбъект: "+v("msg");
    ok.innerHTML="";
    var p=document.createElement("p");p.textContent="Заявка сформирована. Отправьте её в WhatsApp, и мы свяжемся с вами.";
    var a=document.createElement("a");a.href="https://wa.me/"+WA+"?text="+encodeURIComponent(txt);a.target="_blank";a.rel="noopener";a.textContent="Отправить в WhatsApp →";
    var s=document.createElement("p");s.className="small";s.textContent="Или позвоните: "+PHONE;
    ok.append(p,a,s);ok.hidden=false;
  });
});

/* 3D-наклон карточек за курсором */
var fine=window.matchMedia&&matchMedia("(hover:hover) and (pointer:fine)").matches;
var calm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
if(fine&&!calm)document.querySelectorAll(".tilt-wrap").forEach(function(w){
  var t=w.querySelector(".tilt");if(!t)return;
  w.addEventListener("pointermove",function(e){var b=w.getBoundingClientRect();var x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
    t.style.transform="rotateY("+(x*10).toFixed(2)+"deg) rotateX("+(-y*8).toFixed(2)+"deg) translateZ(10px)"});
  w.addEventListener("pointerleave",function(){t.style.transform=""});
});

/* подбор камня: 3D-образец или 2D-запасной вариант */
var cfg=document.getElementById("cfg-stage");
if(cfg&&window.StoneArt){
  var C=StoneArt.COLORS,F=StoneArt.FINISHES;
  var get=function(n){var el=document.querySelector("input[name="+n+"]:checked");return el?el.value:null};
  var apply=function(){
    var c=get("clr")||"beige",f=get("fin")||"sawn";
    document.getElementById("cfg-name").textContent=C[c].name+" · "+F[f].name;
    document.getElementById("cfg-text").textContent=F[f].text;
    document.getElementById("cfg-use").textContent="Где хорош: "+F[f].use;
    if(cfg._stage&&cfg._stage.set)cfg._stage.set(c,f);
    var fb=cfg.querySelector("canvas.fallback");if(fb){fb.dataset.color=c;fb.dataset.finish=f;fb._w=0;StoneArt.renderIn(cfg)}
  };
  document.querySelectorAll("input[name=clr],input[name=fin]").forEach(function(i){i.addEventListener("change",apply)});
  apply();
}

document.querySelectorAll("[data-year]").forEach(function(y){y.textContent=new Date().getFullYear()});
})();

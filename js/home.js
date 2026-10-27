// Home: hero letters + lock screen
// Hero letters: build spans, then let them lift and glow near the pointer.
(function(){
  var el=document.getElementById('name');
  var letters=['S','H','I','N','N'];
  var spans=[];
  letters.forEach(function(ch,i){
    var s=document.createElement('span');
    s.textContent=ch; s.style.setProperty('--i',i); s.setAttribute('aria-hidden','true');
    el.appendChild(s); spans.push(s);
  });
  var k=document.createElement('span');
  k.className='kanji'; k.textContent='信'; k.style.setProperty('--i',5); k.setAttribute('aria-hidden','true');
  el.appendChild(k); spans.push(k);

  var calm=window.matchMedia('(prefers-reduced-motion:reduce)');
  if(calm.matches) return;

  var raf=null, px=0, py=0;
  function paint(){
    raf=null;
    spans.forEach(function(s){
      var r=s.getBoundingClientRect();
      var dx=px-(r.left+r.width/2), dy=py-(r.top+r.height/2);
      var d=Math.sqrt(dx*dx+dy*dy);
      var f=Math.max(0,1-d/380);
      s.style.transform='translateY('+(-f*28)+'px) skewX('+(dx/-40*f)+'deg)';
      s.style.color=f>.55?'var(--lime)':'';
    });
  }
  function move(e){
    px=e.clientX; py=e.clientY;
    if(!raf) raf=requestAnimationFrame(paint);
  }
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('pointerleave',function(){
    spans.forEach(function(s){s.style.transform='';s.style.color=''});
  });
  // after the entrance animation, make hover movement immediate
  setTimeout(function(){ spans.forEach(function(s){s.style.animation='none'}); },1600);
})();
(function(){
  var lock=document.getElementById('lock'), btn=document.getElementById('unlock');
  var clock=document.getElementById('clock'), date=document.getElementById('date');
  function tick(){
    var d=new Date();
    clock.textContent=d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false});
    date.textContent=d.toLocaleDateString([], {weekday:'long',day:'numeric',month:'long'});
  }
  tick(); var t=setInterval(tick,15000);
  function open(){
    clearInterval(t);
    document.body.classList.remove('locked');
    lock.classList.add('gone');
    try{sessionStorage.setItem('unlocked','1')}catch(e){}
    setTimeout(function(){lock.style.display='none'},900);
  }
  try{ if(sessionStorage.getItem('unlocked')){ lock.style.display='none'; document.body.classList.remove('locked'); return; } }catch(e){}
  btn.addEventListener('click',open);
  btn.focus();
  var y0=null;
  lock.addEventListener('pointerdown',function(e){y0=e.clientY});
  lock.addEventListener('pointerup',function(e){ if(y0!==null && y0-e.clientY>60) open(); y0=null; });
  lock.addEventListener('wheel',function(e){ if(e.deltaY>20) open(); },{passive:true});
})();

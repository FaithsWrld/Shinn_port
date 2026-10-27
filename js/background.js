// Living background. CSS handles the soft drifting light (cheap, GPU). This canvas draws
// the node network: it swirls around the cursor, ripples on click, and reacts to scroll.
(function(){
  var c=document.getElementById('bg'); if(!c) return;
  var ctx=c.getContext('2d');
  var follow=document.getElementById('follow');
  var calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COL='185,131,255', LINK=125, REACH=190;
  var W=0,H=0,dpr=1,P=[],pulses=[];
  var mx=0,my=0,sx=0,sy=0,active=false,fresh=true,lastY=window.scrollY,sp=0;

  function mk(){return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.4+.8,t:Math.random()*6.28};}

  function size(){
    var w=c.clientWidth||window.innerWidth, h=c.clientHeight||window.innerHeight;
    // Phones fire resize while scrolling (address bar). Ignore height-only wobbles.
    if(W && w===W && Math.abs(h-H)<200) return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=w; H=h;
    c.width=Math.round(W*dpr); c.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.round(Math.min(100,Math.max(34,W*H/16000)));
    if(W<700) n=Math.round(n*.65);
    while(P.length<n) P.push(mk());
    P.length=n;
    if(calm) draw();
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    var i,j,p,q,dx,dy,d,f;
    if(!calm){
      for(i=0;i<P.length;i++){
        p=P[i]; p.t+=.01;
        p.x+=p.vx+Math.sin(p.t)*.08;
        p.y+=p.vy+Math.cos(p.t*.9)*.08+sp*p.r*.4;
        if(active){
          dx=p.x-sx; dy=p.y-sy; d=Math.sqrt(dx*dx+dy*dy)||1;
          if(d<REACH){ f=1-d/REACH; p.x+=dx/d*f*1.4-dy/d*f*.7; p.y+=dy/d*f*1.4+dx/d*f*.7; }
        }
        for(j=0;j<pulses.length;j++){
          dx=p.x-pulses[j].x; dy=p.y-pulses[j].y; d=Math.sqrt(dx*dx+dy*dy)||1;
          if(Math.abs(d-pulses[j].r)<45){ p.x+=dx/d*3; p.y+=dy/d*3; }
        }
        if(p.x<-20)p.x=W+20; else if(p.x>W+20)p.x=-20;
        if(p.y<-20)p.y=H+20; else if(p.y>H+20)p.y=-20;
      }
    }
    ctx.lineWidth=1;
    for(i=0;i<P.length;i++){
      p=P[i];
      for(j=i+1;j<P.length;j++){
        q=P[j]; dx=p.x-q.x; dy=p.y-q.y;
        if(dx>LINK||dx<-LINK||dy>LINK||dy<-LINK) continue;
        d=Math.sqrt(dx*dx+dy*dy);
        if(d<LINK){
          var a=(1-d/LINK)*.22;
          if(active){ var mdx=(p.x+q.x)/2-sx, mdy=(p.y+q.y)/2-sy; if(mdx*mdx+mdy*mdy<REACH*REACH) a*=2.3; }
          ctx.strokeStyle='rgba('+COL+','+a+')';
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
      if(active){
        dx=p.x-sx; dy=p.y-sy; d=Math.sqrt(dx*dx+dy*dy);
        if(d<REACH){
          ctx.strokeStyle='rgba('+COL+','+((1-d/REACH)*.5)+')';
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(sx,sy); ctx.stroke();
        }
      }
    }
    ctx.fillStyle='rgba('+COL+',.65)';
    for(i=0;i<P.length;i++){ ctx.beginPath(); ctx.arc(P[i].x,P[i].y,P[i].r,0,6.283); ctx.fill(); }
    for(i=0;i<pulses.length;i++){
      ctx.strokeStyle='rgba('+COL+','+(Math.max(0,1-pulses[i].r/600)*.4)+')';
      ctx.lineWidth=2; ctx.beginPath(); ctx.arc(pulses[i].x,pulses[i].y,pulses[i].r,0,6.283); ctx.stroke();
    }
  }

  function frame(){
    if(fresh&&active){sx=mx;sy=my;fresh=false;}
    sx+=(mx-sx)*.14; sy+=(my-sy)*.14;
    var y=window.scrollY; sp=sp*.9+(y-lastY)*-.1; lastY=y;
    for(var i=pulses.length-1;i>=0;i--){ pulses[i].r+=9; if(pulses[i].r>600) pulses.splice(i,1); }
    draw();
    if(follow){ follow.style.transform='translate3d('+(sx-260)+'px,'+(sy-260)+'px,0)'; follow.style.opacity=active?'1':'0'; }
    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;active=true;},{passive:true});
  window.addEventListener('pointerdown',function(e){mx=e.clientX;my=e.clientY;active=true;if(!calm)pulses.push({x:e.clientX,y:e.clientY,r:0});},{passive:true});
  window.addEventListener('pointerup',function(e){if(e.pointerType==='touch')active=false;},{passive:true});
  document.addEventListener('pointerleave',function(){active=false;});
  window.addEventListener('blur',function(){active=false;});
  var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,200);});

  size();
  if(!calm) requestAnimationFrame(frame);
})();

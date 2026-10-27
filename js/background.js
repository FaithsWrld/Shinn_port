// Living background: drifting nodes that swirl around the cursor, link up near it,
// ripple on click, and get nudged by scrolling. Respects reduced-motion.
(function(){
  var c=document.getElementById('bg'); if(!c) return;
  var ctx=c.getContext('2d');
  var calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COL='185,131,255', LINK=125, REACH=190;
  var W,H,dpr,P=[],pulses=[];
  var mx=0,my=0,sx=0,sy=0,active=false,fresh=true;
  var lastY=window.scrollY,sp=0,tm=0;

  function mk(){return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.4+.8,t:Math.random()*6.28};}
  function size(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=window.innerWidth; H=window.innerHeight;
    c.width=W*dpr; c.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.round(Math.min(110,Math.max(36,W*H/15000)));
    if(W<700) n=Math.round(n*.7);
    while(P.length<n) P.push(mk());
    P.length=n;
    if(calm) draw();
  }

  function blob(x,y,r,a){
    var g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,'rgba(124,58,237,'+a+')'); g.addColorStop(1,'rgba(124,58,237,0)');
    ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // slow ambient light, alive even with no cursor
    blob(W*(.25+.12*Math.sin(tm*.0004)), H*(.3+.1*Math.cos(tm*.0005)), Math.max(W,H)*.45, .16);
    blob(W*(.78+.1*Math.cos(tm*.00035)), H*(.7+.12*Math.sin(tm*.00045)), Math.max(W,H)*.4, .12);
    if(active) blob(sx,sy,280,.26);

    var i,j,p,q,dx,dy,d,f;
    for(i=0;i<P.length;i++){
      p=P[i];
      if(!calm){
        p.t+=.01;
        p.x+=p.vx+Math.sin(p.t)*.08;
        p.y+=p.vy+Math.cos(p.t*.9)*.08+sp*p.r*.5;
        if(active){
          dx=p.x-sx; dy=p.y-sy; d=Math.sqrt(dx*dx+dy*dy)||1;
          if(d<REACH){
            f=1-d/REACH;
            p.x+=dx/d*f*1.4-dy/d*f*.7;   // push out + swirl
            p.y+=dy/d*f*1.4+dx/d*f*.7;
          }
        }
        for(j=0;j<pulses.length;j++){
          dx=p.x-pulses[j].x; dy=p.y-pulses[j].y; d=Math.sqrt(dx*dx+dy*dy)||1;
          if(Math.abs(d-pulses[j].r)<45){ p.x+=dx/d*3; p.y+=dy/d*3; }
        }
        if(p.x<-20)p.x=W+20; else if(p.x>W+20)p.x=-20;
        if(p.y<-20)p.y=H+20; else if(p.y>H+20)p.y=-20;
      }
    }
    // links between nodes
    ctx.lineWidth=1;
    for(i=0;i<P.length;i++){
      p=P[i];
      for(j=i+1;j<P.length;j++){
        q=P[j]; dx=p.x-q.x; dy=p.y-q.y; d=Math.sqrt(dx*dx+dy*dy);
        if(d<LINK){
          var a=(1-d/LINK)*.2;
          if(active){
            var mdx=(p.x+q.x)/2-sx, mdy=(p.y+q.y)/2-sy;
            if(mdx*mdx+mdy*mdy<REACH*REACH) a*=2.4;
          }
          ctx.strokeStyle='rgba('+COL+','+a+')';
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
      // web to the cursor
      if(active){
        dx=p.x-sx; dy=p.y-sy; d=Math.sqrt(dx*dx+dy*dy);
        if(d<REACH){
          ctx.strokeStyle='rgba('+COL+','+((1-d/REACH)*.5)+')';
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(sx,sy); ctx.stroke();
        }
      }
    }
    // nodes
    ctx.fillStyle='rgba('+COL+',.6)';
    for(i=0;i<P.length;i++){
      ctx.beginPath(); ctx.arc(P[i].x,P[i].y,P[i].r,0,6.283); ctx.fill();
    }
    // click ripples
    for(i=0;i<pulses.length;i++){
      ctx.strokeStyle='rgba('+COL+','+(Math.max(0,1-pulses[i].r/600)*.4)+')';
      ctx.lineWidth=2; ctx.beginPath(); ctx.arc(pulses[i].x,pulses[i].y,pulses[i].r,0,6.283); ctx.stroke();
    }
  }

  function frame(t){
    tm=t||0;
    if(fresh&&active){sx=mx;sy=my;fresh=false;}
    sx+=(mx-sx)*.14; sy+=(my-sy)*.14;
    var y=window.scrollY; sp=sp*.9+(y-lastY)*-.12; lastY=y;
    for(var i=pulses.length-1;i>=0;i--){pulses[i].r+=9; if(pulses[i].r>600)pulses.splice(i,1);}
    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;active=true;},{passive:true});
  window.addEventListener('pointerdown',function(e){mx=e.clientX;my=e.clientY;active=true;if(!calm)pulses.push({x:e.clientX,y:e.clientY,r:0});},{passive:true});
  window.addEventListener('pointerup',function(e){if(e.pointerType==='touch')active=false;},{passive:true});
  document.addEventListener('pointerleave',function(){active=false;});
  window.addEventListener('blur',function(){active=false;});
  var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,150);});

  size();
  if(!calm) requestAnimationFrame(frame);
})();

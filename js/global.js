// Shared: current-page nav state + footer year
(function(){
  var here=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('nav a').forEach(function(a){
    var file=a.getAttribute('href').split('#')[0].split('/').pop();
    if(file===here && a.getAttribute('href').indexOf('#')===-1) a.setAttribute('aria-current','page');
  });
  var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();
})();

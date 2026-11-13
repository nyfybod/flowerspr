(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('details[data-smooth-faq]').forEach(details=>{
  const summary=details.querySelector('summary');
  if(!summary||!details.animate)return;
  let animation=null,targetOpen=details.open;
  const settle=()=>{
   const old=animation;animation=null;
   if(old){old.onfinish=null;old.cancel();}
   details.open=targetOpen;details.style.height='';details.style.overflow='';
  };
  summary.addEventListener('click',event=>{
   if(event.target.closest('a,button,input'))return;
   if(reduced.matches){if(animation)settle();return;}
   event.preventDefault();
   const start=details.getBoundingClientRect().height;
   targetOpen=animation?!targetOpen:!details.open;
   if(animation){animation.onfinish=null;animation.cancel();animation=null;}
   details.style.height='auto';
   details.open=targetOpen;
   const end=details.getBoundingClientRect().height;
   details.open=true;
   details.style.height=end+'px';details.style.overflow='hidden';
   const current=details.animate([{height:start+'px'},{height:end+'px'}],{
    duration:300,easing:'cubic-bezier(.22,.65,.3,1)'
   });
   animation=current;
   current.onfinish=()=>{if(animation===current)settle();};
  });
  reduced.addEventListener('change',()=>{if(reduced.matches&&animation)settle();});
 });
})();

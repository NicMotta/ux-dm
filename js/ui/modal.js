'use strict';
/* Modales y avisos */
/* ---------- modal y aviso ---------- */
function askChoice({title,text,buttons}){
  return new Promise(res=>{
    const root=$('#modalRoot');
    root.innerHTML=`<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="actions">${buttons.map((b,i)=>`<button class="btn ${b.kind||''}" data-i="${i}">${esc(b.label)}</button>`).join('')}</div></div></div>`;
    const close=v=>{root.innerHTML='';document.removeEventListener('keydown',onKey,true);res(v);};
    const onKey=e=>{if(e.key==='Escape'){e.stopPropagation();close(null);}};
    document.addEventListener('keydown',onKey,true);
    root.firstChild.addEventListener('click',e=>{
      if(e.target.classList.contains('modal-back'))return close(null);
      const b=e.target.closest('[data-i]');if(b)close(buttons[+b.dataset.i].value);
    });
    (root.querySelector('.btn.primary,.btn.danger')||root.querySelector('.btn:last-child')).focus();
  });
}
let toastTimer;
function toast(m){const e=$('#toast');e.textContent=m;e.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{e.hidden=true;},3400);}

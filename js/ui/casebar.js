'use strict';
/* Panel: barra de la casuística */
/* ---------- barra de la casuística ---------- */
function renderCaseBar(){
  const st=curStep(),c=curCase();
  $('#casebar').innerHTML=`<div class="t"><div class="eyebrow">${esc(st.name)}</div><div class="ttl">${esc(c.name)}</div></div>
   <button class="btn small" data-cb="pdf" title="Descargar esta casuística como PDF">PDF</button>
   <button class="btn small" data-cb="json" title="Descargar esta casuística como JSON editable">JSON</button>`;
  $('#btnImg').disabled=false;
}

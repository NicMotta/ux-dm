'use strict';
/* Panel: detalle del mapeo */
/* ---------- detalle ---------- */
const fld=(lab,f,val,o={})=>`<div class="field"><label for="f-${f}">${lab}</label>${o.area
  ?`<textarea id="f-${f}" data-f="${f}" class="${o.mono?'mono':''}" placeholder="${esc(o.ph||'')}" spellcheck="false">${esc(val)}</textarea>`
  :`<input id="f-${f}" data-f="${f}" class="${o.mono?'mono':''}" placeholder="${esc(o.ph||'')}" value="${esc(val)}" autocomplete="off" spellcheck="false">`}</div>`;
function annSummary(a){
  return a.source==='service'?`${a.method} ${a.endpoint||'—'}`:a.source==='hardcoded'?(a.text?`“${a.text}”`:'texto fijo'):(a.rule||'regla del front');
}
function renderInspector(){
  const c=curCase(),a=S.selId&&findAnn(c,S.selId),el=$('#insp');
  if(!a){
    const list=owners(c);
    el.innerHTML=`<div class="eyebrow">${esc(curStep().name)} · Casuística</div><h3>${esc(c.name)}</h3>
     <div class="field"><label for="c-name">Nombre</label><input id="c-name" data-cf="name" value="${esc(c.name)}" autocomplete="off"></div>
     <div class="field"><label for="c-desc">Descripción y condiciones</label><textarea id="c-desc" data-cf="description" placeholder="Ej: usuario con tarjeta de crédito, 3 cuotas sin interés, saldo suficiente">${esc(c.description)}</textarea></div>
     <div class="head-row"><span class="lbl">Mapeo de la casuística (${list.length})</span></div>
     ${list.length?`<div class="list">${list.map(x=>`<div class="li" data-sel="${x.id}"><span class="num" style="--c:${SRC_VAR[x.source]}">${numOf(c,x)}</span><div class="tx"><div class="a">${esc(x.label||'Sin nombre')}</div><div class="b">${esc(annSummary(x))}</div></div><span class="tag" style="--c:${SRC_VAR[x.source]}">${SRC[x.source]}</span></div>`).join('')}</div>`
      :`<div class="note">Todavía no hay marcas. Elegí el recuadro (R) y dibujalo sobre un texto o campo de la imagen. Con la flecha (A) señalás el elemento desde un recuadro.</div>`}`;
    return;
  }
  const o=ownerOf(c,a),n=numOf(c,a),col=SRC_VAR[o.source],linked=o!==a;
  let h=`<div class="eyebrow">${a.type==='box'?'Recuadro':'Flecha'}${linked?' unida al recuadro '+n:' · mapeo propio'}</div>
   <h3><span class="num" style="--c:${col}">${n}</span><span id="hLabel">${esc(o.label||'Sin nombre')}</span></h3>`;
  if(linked)h+=`<div class="note">Esta flecha sale del recuadro ${n} y señala el elemento. Los datos se completan en ese recuadro.<br><button class="btn small" data-sel="${o.id}">Ir al recuadro ${n}</button></div>`;
  else if(a.type==='arrow')h+=`<div class="note">Flecha libre: lleva su propio mapeo. Si arrastrás su cola hasta un recuadro, pasa a depender de él.</div>`;
  h+=fld('Elemento en pantalla','label',o.label,{ph:'Ej: Monto total, Número de tarjeta'});
  h+=`<div class="field"><span class="lbl">Origen del dato</span><div class="seg" role="group" aria-label="Origen del dato">${Object.keys(SRC).map(k=>`<button data-set="source" data-v="${k}" class="${o.source===k?'on':''}">${SRC[k]}</button>`).join('')}</div></div>`;
  if(o.source==='service'){
    h+=fld('Servicio / API','service',o.service,{ph:'payments-api'});
    h+=`<div class="field"><span class="lbl">Método HTTP</span><div class="chips">${METHODS.map(m=>`<button class="chip${o.method===m?' on':''}" data-set="method" data-v="${m}">${m}</button>`).join('')}</div></div>`;
    h+=fld('Endpoint','endpoint',o.endpoint,{mono:1,ph:'/v1/orders/{orderId}'});
    h+=fld('Objeto o campo de la respuesta','path',o.path,{mono:1,ph:'order.totals.grandTotal'});
    h+=`<div class="two"><div class="field"><label for="f-dtype">Tipo</label><select id="f-dtype" data-f="dtype">${DTYPES.map(t=>`<option${o.dtype===t?' selected':''}>${t}</option>`).join('')}</select></div>${fld('Formato','format',o.format,{ph:'ARS, 2 decimales'})}</div>`;
    h+=fld('Ejemplo de request o response','example',o.example,{area:1,mono:1,ph:'{ "grandTotal": 48500.00 }'});
  }else if(o.source==='hardcoded'){
    h+=fld('Texto literal','text',o.text,{area:1,ph:'Pagá con tarjeta'});
    h+=fld('Clave de i18n (opcional)','i18n',o.i18n,{mono:1,ph:'checkout.card.title'});
  }else{
    h+=fld('Regla o fórmula','rule',o.rule,{area:1,ph:'total / cantidad de cuotas'});
    h+=fld('Depende de','deps',o.deps,{ph:'Cuotas elegidas, total del pedido'});
  }
  h+=fld('Notas','notes',o.notes,{area:1,ph:'Condiciones de visibilidad, estados de error, validaciones…'});
  h+=`<button class="btn danger" data-del>Eliminar ${a.type==='box'?'recuadro':'flecha'}</button>`;
  el.innerHTML=h;
}
function initInspector(){
  const el=$('#insp');
  el.addEventListener('input',e=>{
    const t=e.target,c=curCase();
    if(t.dataset.cf){pushUndo(null,'cf'+t.dataset.cf);c[t.dataset.cf]=t.value;if(t.dataset.cf==='name'){renderTree();renderCaseBar();}save();return;}
    const f=t.dataset.f;if(!f)return;const a=findAnn(c,S.selId);if(!a)return;
    pushUndo(null,'f'+f+a.id);ownerOf(c,a)[f]=t.value;
    if(f==='label'){const h=$('#hLabel');if(h)h.textContent=t.value||'Sin nombre';}
    save();
  });
  el.addEventListener('change',e=>{if(e.target.dataset.f==='dtype'){const c=curCase(),a=findAnn(c,S.selId);if(a){pushUndo();ownerOf(c,a).dtype=e.target.value;save();}}});
  el.addEventListener('click',e=>{
    const c=curCase(),set=e.target.closest('[data-set]');
    if(set){const a=findAnn(c,S.selId);if(!a)return;pushUndo();ownerOf(c,a)[set.dataset.set]=set.dataset.v;renderAnns();renderInspector();renderTree();save();return;}
    const sel=e.target.closest('[data-sel]');if(sel)return select(sel.dataset.sel);
    if(e.target.closest('[data-del]'))deleteSelected();
  });
}

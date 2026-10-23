'use strict';
/* Lienzo: selección y edición */
/* ---------- selección y edición ---------- */
function select(id){S.selId=id;renderAnns();renderInspector();}
function afterAnnChange(){
  const c=curCase();if(S.selId&&!findAnn(c,S.selId))S.selId=null;
  renderAnns();renderInspector();renderTree();save();updateUndoUI();
}
function deleteSelected(){
  const c=curCase(),a=findAnn(c,S.selId);if(!a)return;
  pushUndo();
  const gone=new Set([a.id]);
  if(a.type==='box')c.anns.forEach(r=>{if(r.type==='arrow'&&r.fromId===a.id)gone.add(r.id);});
  c.anns=c.anns.filter(x=>!gone.has(x.id));S.selId=null;afterAnnChange();
  if(gone.size>1)toast(`Se eliminó el recuadro y ${gone.size-1} flecha(s) unida(s)`);
}
function dupSelected(){
  const c=curCase(),a=findAnn(c,S.selId);if(!a)return;
  pushUndo();const n=JSON.parse(JSON.stringify(a));n.id=uid();
  if(a.type==='box'){n.x+=16;n.y+=16;}else{n.x2+=16;n.y2+=16;if(!n.fromId){n.x1+=16;n.y1+=16;}}
  c.anns.push(n);S.selId=n.id;afterAnnChange();
}
function nudge(dx,dy){
  const c=curCase(),a=findAnn(c,S.selId);if(!a)return;
  pushUndo(null,'nudge');
  if(a.type==='box'){a.x+=dx;a.y+=dy;}else{a.x2+=dx;a.y2+=dy;if(!a.fromId||!boxById(c,a.fromId)){a.x1+=dx;a.y1+=dy;}}
  renderAnns();save();
}
function setTool(t){
  S.tool=t;vp.dataset.tool=t;
  document.querySelectorAll('.tool[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
}

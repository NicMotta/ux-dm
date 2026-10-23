'use strict';
/* Historial de deshacer/rehacer */
/* ---------- historial (por casuística) ---------- */
function H(){const id=S.caseId;if(!S.hist.has(id))S.hist.set(id,{u:[],r:[],key:'',t:0});return S.hist.get(id);}
function pushUndo(pre,key){
  const h=H(),now=Date.now();
  if(key&&h.key===key&&now-h.t<1200){h.t=now;return;}
  h.key=key||'';h.t=now;h.u.push(pre||JSON.stringify(curCase().anns));
  if(h.u.length>100)h.u.shift();
  h.r=[];updateUndoUI();
}
function undo(){const h=H();if(!h.u.length)return;h.r.push(JSON.stringify(curCase().anns));curCase().anns=JSON.parse(h.u.pop());h.key='';afterAnnChange();}
function redo(){const h=H();if(!h.r.length)return;h.u.push(JSON.stringify(curCase().anns));curCase().anns=JSON.parse(h.r.pop());h.key='';afterAnnChange();}
function updateUndoUI(){const h=H();$('#btnUndo').disabled=!h.u.length;$('#btnRedo').disabled=!h.r.length;}

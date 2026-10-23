'use strict';
/* Arranque y conexión de la interfaz */
function applyTheme(t,say){
  if(t==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t;
  try{localStorage.setItem('uxdm-theme',t);}catch(e){}
  if(say)toast('Tema: '+({auto:'automático',light:'claro',dark:'oscuro'}[t]));
}
function togglePanel(cls){$('#main').classList.toggle(cls);setTimeout(()=>{if(curCase().image)fitView();else applyView();},30);}

function bindUI(){
  $('#btnLeft').onclick=()=>togglePanel('no-left');
  $('#btnRight').onclick=()=>togglePanel('no-right');
  let th='auto';try{th=localStorage.getItem('uxdm-theme')||'auto';}catch(e){}
  applyTheme(th);
  $('#btnTheme').onclick=()=>{const o=['auto','light','dark'],cur=document.documentElement.dataset.theme||'auto';applyTheme(o[(o.indexOf(cur)+1)%3],true);};
  $('#projName').addEventListener('input',e=>{S.project.name=e.target.value;save();});

  $('#addStep').onclick=()=>{const st=mkStep('Paso '+(S.project.steps.length+1));S.project.steps.push(st);selectCase(st.id,st.cases[0].id);setTimeout(()=>startRename('step',st.id),20);};
  $('#toggleAll').onclick=toggleAllSteps;
  $('#tree').addEventListener('click',e=>{
    const b=e.target.closest('[data-do]');
    if(b){e.stopPropagation();treeAction(b.dataset.do,b.dataset.step,b.dataset.case);return;}
    const row=e.target.closest('[data-act]');if(!row||e.target.closest('.rename'))return;
    if(row.dataset.act==='case')selectCase(row.dataset.step,row.dataset.case);
    else{const id=row.dataset.step;S.collapsed.has(id)?S.collapsed.delete(id):S.collapsed.add(id);renderTree();}
  });
  $('#casebar').addEventListener('click',e=>{const b=e.target.closest('[data-cb]');if(!b)return;b.dataset.cb==='pdf'?exportCasePDF():exportCaseJSON();});

  const menu=$('#fileMenu');
  $('#btnFile').onclick=e=>{e.stopPropagation();menu.hidden=!menu.hidden;};
  document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('.menu'))menu.hidden=true;});
  menu.addEventListener('click',async e=>{
    const m=e.target.closest('[data-m]');if(!m)return;menu.hidden=true;
    if(m.dataset.m==='import')$('#fileJson').click();
    else if(m.dataset.m==='exportProject')exportProjectJSON();
    else if(m.dataset.m==='pdfProject')exportProjectPDF();
    else if(m.dataset.m==='newProject'){
      const ok=await askChoice({title:'Nuevo proyecto vacío',text:'Se reemplaza el proyecto actual. Si querés conservarlo, exportalo antes en JSON.',buttons:[{label:'Cancelar',value:false},{label:'Crear proyecto vacío',value:true,kind:'danger'}]});
      if(!ok)return;S.project=mkProject('Mi proyecto');S.hist.clear();S.stepId=S.project.steps[0].id;S.caseId=S.project.steps[0].cases[0].id;S.selId=null;loadCaseView();refreshAll();save();
    }
  });
  $('#fileJson').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)importFile(f);});

  document.querySelectorAll('.tool[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
  $('#btnUndo').onclick=undo;$('#btnRedo').onclick=redo;
  const pick=()=>$('#fileImg').click();
  $('#btnImg').onclick=pick;$('#pickImg').onclick=pick;
  $('#fileImg').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)handleImageFile(f);});

  $('#zIn').onclick=()=>zoomCenter(1.25);$('#zOut').onclick=()=>zoomCenter(1/1.25);
  $('#zFit').onclick=fitView;$('#zLbl').onclick=()=>zoomCenter(1/V.z);
  const wl=()=>{$('#zWheel').textContent=S.wheelZoom?'Rueda: zoom':'Rueda: mover';};
  try{S.wheelZoom=localStorage.getItem('uxdm-wheel')!=='pan';}catch(e){}
  wl();
  $('#zWheel').onclick=()=>{S.wheelZoom=!S.wheelZoom;try{localStorage.setItem('uxdm-wheel',S.wheelZoom?'zoom':'pan');}catch(e){}wl();toast(S.wheelZoom?'La rueda hace zoom. Con Ctrl+rueda o pellizco también.':'La rueda mueve el lienzo. Con Ctrl+rueda o pellizco hacés zoom.');};
}

(async function init(){
  initCanvas();initInspector();bindUI();
  if(innerWidth<1000)$('#main').classList.add('no-left');
  const saved=await loadSaved();
  if(saved&&saved.project&&saved.project.steps){
    S.project=normProject(saved.project);
    const st=S.project.steps.find(s=>s.id===saved.stepId)||S.project.steps[0];
    S.stepId=st.id;S.caseId=(st.cases.find(c=>c.id===saved.caseId)||st.cases[0]).id;
    setSaveState('Guardado en este navegador');
  }else{
    S.project=mkProject('Mi proyecto');S.stepId=S.project.steps[0].id;S.caseId=S.project.steps[0].cases[0].id;
    setSaveState('Proyecto nuevo');
  }
  loadCaseView();refreshAll();
})();


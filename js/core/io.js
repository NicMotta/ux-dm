'use strict';
/* Descargas e importación/exportación JSON */
/* ---------- descargas ---------- */
function download(name,blob){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
}
const jsonBlob=o=>new Blob([JSON.stringify(o,null,2)],{type:'application/json'});
function exportProjectJSON(){download(`${slug(S.project.name)}.uxmap.json`,jsonBlob(S.project));toast('Proyecto exportado en JSON');}
function exportCaseJSON(){
  const st=curStep(),c=curCase();
  download(`${slug(S.project.name)}_${slug(st.name)}_${slug(c.name)}.uxmap.json`,jsonBlob({format:'ux-data-mapping',version:1,kind:'case',project:S.project.name,step:st.name,case:c}));
  toast('Casuística exportada en JSON');
}

/* ---------- importación ---------- */
async function importData(obj){
  if(!obj||obj.format!=='ux-data-mapping')throw new Error('El archivo no parece un JSON de UX Data Mapping.');
  if(obj.kind==='case'){
    const c=normCase(obj.case);c.id=uid();curStep().cases.push(c);S.caseId=c.id;S.selId=null;
    refreshAll();save();toast(`Casuística “${c.name}” agregada a ${curStep().name}`);return;
  }
  const p=normProject(obj);
  const ch=await askChoice({title:'Importar proyecto',text:`“${p.name}” tiene ${p.steps.length} paso(s). ¿Qué querés hacer con el proyecto actual?`,buttons:[{label:'Cancelar',value:'x'},{label:'Agregar sus pasos al actual',value:'add'},{label:'Reemplazar el actual',value:'rep',kind:'primary'}]});
  if(ch==='x'||!ch)return;
  if(ch==='rep'){S.project=p;S.hist.clear();}
  else{p.steps.forEach(s=>{s.id=uid();s.cases.forEach(c=>c.id=uid());S.project.steps.push(s);});}
  const st=ch==='rep'?S.project.steps[0]:p.steps[0];S.stepId=st.id;S.caseId=st.cases[0].id;S.selId=null;
  refreshAll();save();toast('Proyecto importado');
}
async function importFile(file){
  try{await importData(JSON.parse(await file.text()));}
  catch(e){toast(e instanceof SyntaxError?'El archivo no es un JSON válido.':e.message);}
}

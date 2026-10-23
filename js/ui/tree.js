'use strict';
/* Panel: árbol de pasos y casuísticas */
/* ---------- árbol ---------- */
function renderTree(){
  $('#tree').innerHTML=S.project.steps.map((st,si)=>{
    const col=S.collapsed.has(st.id);
    return `<div class="step${col?' collapsed':''}">
      <div class="step-row" data-act="toggle" data-step="${st.id}">
        <span class="chev">${ico('chev')}</span><span class="cnt">${si+1}</span><span class="nm" data-rename="step" data-step="${st.id}">${esc(st.name)}</span>
        <span class="acts">${act('rnStep',st.id,'','Renombrar paso','edit')}${act('stepUp',st.id,'','Subir paso','up')}${act('stepDown',st.id,'','Bajar paso','down')}${act('stepDel',st.id,'','Eliminar paso','trash')}</span>
      </div>
      ${col?'':st.cases.map(c=>`<div class="case-row${c.id===S.caseId?' active':''}" data-act="case" data-step="${st.id}" data-case="${c.id}">
        <div style="flex:1;min-width:0"><div class="nm" data-rename="case" data-case="${c.id}">${esc(c.name)}</div><div class="sub">${owners(c).length} marca(s) · ${c.image?'con imagen':'sin imagen'}</div></div>
        <span class="acts">${act('rnCase',st.id,c.id,'Renombrar casuística','edit')}${act('caseUp',st.id,c.id,'Subir','up')}${act('caseDown',st.id,c.id,'Bajar','down')}${act('caseDup',st.id,c.id,'Duplicar casuística','copy')}${act('caseDel',st.id,c.id,'Eliminar casuística','trash')}</span>
      </div>`).join('')+`<button class="add-case" data-do="caseAdd" data-step="${st.id}">${ico('plus')} Casuística</button>`}
    </div>`;
  }).join('');
  const all=allCollapsed(),tg=$('#toggleAll'),t=all?'Expandir todos los pasos':'Colapsar todos los pasos';
  tg.innerHTML=ico(all?'expandAll':'collapseAll');tg.title=t;tg.setAttribute('aria-label',t);
}
const allCollapsed=()=>S.project.steps.every(s=>S.collapsed.has(s.id));
function toggleAllSteps(){
  if(allCollapsed())S.collapsed.clear();else S.project.steps.forEach(s=>S.collapsed.add(s.id));
  renderTree();
}
function startRename(kind,stepId,caseId){
  const el=$(kind==='step'?`.nm[data-rename="step"][data-step="${stepId}"]`:`.nm[data-rename="case"][data-case="${caseId}"]`);if(!el)return;
  const st=S.project.steps.find(s=>s.id===stepId),obj=kind==='step'?st:st.cases.find(c=>c.id===caseId);
  const inp=document.createElement('input');inp.className='rename';inp.value=obj.name;el.replaceWith(inp);inp.focus();inp.select();
  let done=false;
  const fin=ok=>{if(done)return;done=true;if(ok&&inp.value.trim()){obj.name=inp.value.trim();save();}renderTree();renderCaseBar();renderInspector();};
  inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')fin(true);else if(e.key==='Escape')fin(false);});
  inp.addEventListener('blur',()=>fin(true));
  inp.addEventListener('click',e=>e.stopPropagation());
}
async function treeAction(d,stId,csId){
  const P=S.project,si=P.steps.findIndex(s=>s.id===stId),st=P.steps[si],ci=csId?st.cases.findIndex(c=>c.id===csId):-1;
  if(d==='rnStep')return startRename('step',stId);
  if(d==='rnCase')return startRename('case',stId,csId);
  if(d==='stepUp'||d==='stepDown'){moveItem(P.steps,si,d==='stepUp'?-1:1);}
  else if(d==='caseUp'||d==='caseDown'){moveItem(st.cases,ci,d==='caseUp'?-1:1);}
  else if(d==='caseAdd'){const c=mkCase('Casuística '+(st.cases.length+1));st.cases.push(c);S.collapsed.delete(stId);return selectCase(stId,c.id);}
  else if(d==='caseDup')return dupCase(stId,csId);
  else if(d==='stepDel'||d==='caseDel'){
    if(d==='stepDel'&&P.steps.length===1)return toast('Tiene que quedar al menos un paso.');
    if(d==='caseDel'&&st.cases.length===1)return toast('Cada paso necesita al menos una casuística.');
    const nm=d==='stepDel'?st.name:st.cases[ci].name;
    const ok=await askChoice({title:d==='stepDel'?'Eliminar paso':'Eliminar casuística',text:d==='stepDel'?`Se elimina “${nm}” con todas sus casuísticas y marcas.`:`Se elimina “${nm}” con su imagen y sus marcas.`,buttons:[{label:'Cancelar',value:false},{label:'Eliminar',value:true,kind:'danger'}]});
    if(!ok)return;
    if(d==='stepDel'){P.steps.splice(si,1);}else st.cases.splice(ci,1);
    if(!P.steps.some(s=>s.id===S.stepId)||!curStep().cases.some(c=>c.id===S.caseId)){const s=P.steps[Math.min(si,P.steps.length-1)];S.stepId=s.id;S.caseId=s.cases[Math.min(Math.max(ci,0),s.cases.length-1)].id;S.selId=null;loadCaseView();}
  }
  refreshAll();save();
}

'use strict';
/* Operaciones sobre pasos y casuísticas */
/* ---------- operaciones sobre pasos y casuísticas ---------- */
function selectCase(stepId,caseId){S.stepId=stepId;S.caseId=caseId;S.selId=null;loadCaseView();refreshAll();save();}
function dupCase(stepId,caseId){
  const st=S.project.steps.find(s=>s.id===stepId),i=st.cases.findIndex(c=>c.id===caseId);
  const n=JSON.parse(JSON.stringify(st.cases[i]));n.id=uid();n.name+=' (copia)';st.cases.splice(i+1,0,n);selectCase(stepId,n.id);
}
function moveItem(arr,i,d){const j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];}

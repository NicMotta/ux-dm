'use strict';
/* Modelo de datos y geometría */
/* ---------- modelo ---------- */
function blankData(){return {label:'',source:'service',service:'',dmName:'',dmLink:'',method:'GET',endpoint:'',path:'',dtype:'string',format:'',example:'',text:'',i18n:'',rule:'',deps:'',notes:''};}
function mkCase(name){return {id:uid(),name:name||'Casuística nueva',description:'',image:null,w:0,h:0,anns:[]};}
function mkStep(name,caseName){return {id:uid(),name:name||'Paso nuevo',cases:[mkCase(caseName||'Casuística 1')]};}
function mkProject(name){return {format:'ux-data-mapping',version:1,name:name||'Mi proyecto',steps:[mkStep('Paso 1')]};}
function mkBox(x,y,w,h){return {id:uid(),type:'box',x,y,w,h,...blankData()};}
function mkArrow(x1,y1,x2,y2,fromId){return {id:uid(),type:'arrow',fromId:fromId||null,x1,y1,x2,y2,...blankData()};}
function normCase(c){c=c||{};return {id:c.id||uid(),name:c.name||'Casuística',description:c.description||'',image:c.image||null,w:c.w||0,h:c.h||0,anns:(c.anns||[]).map(a=>({...blankData(),...a,id:a.id||uid()}))};}
function normProject(p){return {format:'ux-data-mapping',version:1,name:p.name||'Mi proyecto',steps:(p.steps&&p.steps.length?p.steps:[{name:'Paso 1',cases:[{}]}]).map(s=>({id:s.id||uid(),name:s.name||'Paso',cases:(s.cases&&s.cases.length?s.cases:[{}]).map(normCase)}))};}

const curStep=()=>S.project.steps.find(s=>s.id===S.stepId)||S.project.steps[0];
const curCase=()=>{const st=curStep();return st.cases.find(c=>c.id===S.caseId)||st.cases[0];};
const findAnn=(c,id)=>c.anns.find(a=>a.id===id);
const boxById=(c,id)=>c.anns.find(a=>a.id===id&&a.type==='box');
/* El dueño de los datos: un recuadro, una flecha libre, o el recuadro al que está unida la flecha */
function ownerOf(c,a){if(a.type==='arrow'&&a.fromId){const b=boxById(c,a.fromId);if(b)return b;}return a;}
const isOwner=(c,a)=>ownerOf(c,a)===a;
const owners=c=>c.anns.filter(a=>isOwner(c,a));
const numOf=(c,a)=>owners(c).indexOf(ownerOf(c,a))+1;

/* ---------- geometría ---------- */
function arrowPts(c,a){
  const b=a.fromId&&boxById(c,a.fromId);
  if(!b)return {x1:a.x1,y1:a.y1,x2:a.x2,y2:a.y2};
  const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=a.x2-cx,dy=a.y2-cy,m=Math.max(Math.abs(dx)/(b.w/2),Math.abs(dy)/(b.h/2));
  if(!isFinite(m)||m<=1)return {x1:cx,y1:cy,x2:a.x2,y2:a.y2,hidden:true};
  return {x1:cx+dx/m,y1:cy+dy/m,x2:a.x2,y2:a.y2};
}
function headPoints(x1,y1,x2,y2,L,W){
  const t=Math.atan2(y2-y1,x2-x1),bx=x2-L*Math.cos(t),by=y2-L*Math.sin(t),px=-Math.sin(t)*W/2,py=Math.cos(t)*W/2;
  return [[x2,y2],[bx+px,by+py],[bx-px,by-py]];
}
const boxAt=(c,x,y)=>{for(let i=c.anns.length-1;i>=0;i--){const a=c.anns[i];if(a.type==='box'&&x>=a.x&&x<=a.x+a.w&&y>=a.y&&y<=a.y+a.h)return a;}return null;};

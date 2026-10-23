'use strict';
/* Guardado local en IndexedDB */
/* ---------- guardado local (IndexedDB) ---------- */
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('ux-data-mapping',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function dbGet(k){const d=await idb();return new Promise((res,rej)=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}
async function dbSet(k,v){const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);});}
let saveTimer=null;
function setSaveState(t){const e=$('#saveState');if(e)e.textContent=t;}
function save(){
  setSaveState('Guardando…');clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    try{await dbSet('state',{project:S.project,stepId:S.stepId,caseId:S.caseId});setSaveState('Guardado en este navegador');}
    catch(e){setSaveState('No se pudo guardar localmente: exportá el JSON');}
  },350);
}
async function loadSaved(){try{return await dbGet('state');}catch(e){return null;}}

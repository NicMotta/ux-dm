'use strict';
/* Utilidades, constantes y estado global de la aplicación */
const $=(s,r=document)=>r.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,10);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>(String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase())||'mapeo';

const SRC={service:'Servicio',hardcoded:'Estático',calculated:'Calculado'};
const SRC_VAR={service:'var(--svc)',hardcoded:'var(--hc)',calculated:'var(--calc)'};
const SRC_HEX={service:'#0b7285',hardcoded:'#c2410c',calculated:'#7c3aed'}; // para PDF
const METHODS=['GET','POST','PUT','PATCH','DELETE'];
const DTYPES=['string','number','boolean','date','array','object'];

const S={project:null,stepId:null,caseId:null,selId:null,tool:'select',hist:new Map(),collapsed:new Set(),wheelZoom:true};

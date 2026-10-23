'use strict';
/* Paneles: íconos y refresco general de la interfaz */
const IC={
  up:'<path d="m4 10 4-4 4 4"/>',down:'<path d="m4 6 4 4 4-4"/>',chev:'<path d="m4 6 4 4 4-4"/>',plus:'<path d="M8 3v10M3 8h10"/>',
  copy:'<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"/>',
  trash:'<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5M7 7v4M9 7v4"/>',
  edit:'<path d="m3 13 .6-2.8 6.8-6.8a1.4 1.4 0 0 1 2 2l-6.8 6.8z"/>',
  collapseAll:'<path d="m5 2.5 3 3 3-3M5 13.5l3-3 3 3M2.5 8h11"/>',expandAll:'<path d="m5 5.5 3-3 3 3M5 10.5l3 3 3-3M2.5 8h11"/>'
};
const ico=n=>`<svg class="i" viewBox="0 0 16 16">${IC[n]}</svg>`;
const act=(d,st,cs,t,i)=>`<button data-do="${d}" data-step="${st}" ${cs?`data-case="${cs}"`:''} title="${t}" aria-label="${t}" class="${d.endsWith('Del')?'del':''}">${ico(i)}</button>`;

function refreshAll(){
  $('#projName').value=S.project.name;
  renderTree();renderCaseBar();renderInspector();renderAnns();updateUndoUI();
}

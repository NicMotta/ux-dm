'use strict';
/* Lienzo: dibujo SVG de recuadros y flechas */
/* ---------- dibujo SVG ---------- */
const CUR={nw:'nwse-resize',se:'nwse-resize',ne:'nesw-resize',sw:'nesw-resize',n:'ns-resize',s:'ns-resize',e:'ew-resize',w:'ew-resize'};
function badge(x,y,n,col,u){
  return `<g pointer-events="none"><circle cx="${x}" cy="${y}" r="${10*u}" style="fill:${col};stroke:var(--panel)" stroke-width="${1.5*u}"/><text x="${x}" y="${y}" dy=".35em" text-anchor="middle" font-size="${11*u}" font-weight="700" font-family="IBM Plex Mono,monospace" style="fill:var(--on)">${n}</text></g>`;
}
function boxSVG(c,a,u){
  const col=SRC_VAR[a.source],s=a.id===S.selId;
  return `<g class="ann" data-id="${a.id}"><rect class="shape" x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="${2*u}" fill-opacity=".1" stroke-width="${2*u}" style="fill:${col};stroke:${col}"/>`
   +(s?`<rect x="${a.x-3*u}" y="${a.y-3*u}" width="${a.w+6*u}" height="${a.h+6*u}" fill="none" stroke-width="${1.5*u}" stroke-dasharray="${5*u} ${3*u}" style="stroke:var(--accent)" pointer-events="none"/>`:'')
   +badge(a.x,a.y,numOf(c,a),col,u)+`</g>`;
}
function arrowSVG(c,a,u){
  const o=ownerOf(c,a),col=SRC_VAR[o.source],p=arrowPts(c,a),s=a.id===S.selId;
  if(p.hidden)return '';
  const L=15*u,t=Math.atan2(p.y2-p.y1,p.x2-p.x1),lx=p.x2-(L-2*u)*Math.cos(t),ly=p.y2-(L-2*u)*Math.sin(t);
  const hp=headPoints(p.x1,p.y1,p.x2,p.y2,L,12*u).map(q=>q.join(',')).join(' ');
  const free=!a.fromId||!boxById(c,a.fromId);
  return `<g class="ann" data-id="${a.id}">`
   +`<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" stroke-width="${16*u}" style="stroke:transparent"/>`
   +(s?`<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" stroke-width="${7*u}" stroke-linecap="round" opacity=".35" style="stroke:var(--accent)" pointer-events="none"/>`:'')
   +`<line x1="${p.x1}" y1="${p.y1}" x2="${lx}" y2="${ly}" stroke-width="${2.5*u}" stroke-linecap="round" style="stroke:${col}" pointer-events="none"/>`
   +`<polygon points="${hp}" style="fill:${col}" pointer-events="none"/>`
   +(free?badge(p.x1,p.y1,numOf(c,a),col,u):`<circle cx="${p.x1}" cy="${p.y1}" r="${3.5*u}" style="fill:${col}" pointer-events="none"/>`)
   +`</g>`;
}
function handlesSVG(c,a,u){
  const sq=(k,x,y)=>`<rect data-handle="${k}" data-id="${a.id}" x="${x-4.5*u}" y="${y-4.5*u}" width="${9*u}" height="${9*u}" stroke-width="${1.5*u}" style="fill:var(--panel);stroke:var(--accent);cursor:${CUR[k]}"/>`;
  if(a.type==='box'){
    const mx=a.x+a.w/2,my=a.y+a.h/2,r=a.x+a.w,b=a.y+a.h;
    return sq('nw',a.x,a.y)+sq('n',mx,a.y)+sq('ne',r,a.y)+sq('e',r,my)+sq('se',r,b)+sq('s',mx,b)+sq('sw',a.x,b)+sq('w',a.x,my);
  }
  const p=arrowPts(c,a),ci=(k,x,y)=>`<circle data-handle="${k}" data-id="${a.id}" cx="${x}" cy="${y}" r="${6*u}" stroke-width="${1.5*u}" style="fill:var(--panel);stroke:var(--accent);cursor:grab"/>`;
  return ci('start',p.x1,p.y1)+ci('end',p.x2,p.y2);
}
function renderAnns(){
  const c=curCase(),u=1/V.z;let h='';
  svg.setAttribute('width',c.w||0);svg.setAttribute('height',c.h||0);
  c.anns.forEach(a=>{if(a.type==='box')h+=boxSVG(c,a,u);});
  c.anns.forEach(a=>{if(a.type==='arrow')h+=arrowSVG(c,a,u);});
  if(draft){
    if(draft.kind==='box')h+=`<rect x="${draft.x}" y="${draft.y}" width="${draft.w}" height="${draft.h}" fill-opacity=".08" stroke-width="${2*u}" stroke-dasharray="${6*u} ${4*u}" style="fill:var(--accent);stroke:var(--accent)" pointer-events="none"/>`;
    else{const p=arrowPts(c,{fromId:draft.fromId,x1:draft.x1,y1:draft.y1,x2:draft.x2,y2:draft.y2});
      h+=`<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" stroke-width="${2.5*u}" stroke-dasharray="${6*u} ${4*u}" style="stroke:var(--accent)" pointer-events="none"/>`;}
  }
  const s=S.selId&&findAnn(c,S.selId);if(s)h+=handlesSVG(c,s,u);
  svg.innerHTML=h;
}

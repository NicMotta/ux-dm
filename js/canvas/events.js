'use strict';
/* Lienzo: eventos de puntero y teclado */
/* ---------- eventos ---------- */
function pt(e){const r=vp.getBoundingClientRect();return {x:(e.clientX-r.left-V.x)/V.z,y:(e.clientY-r.top-V.y)/V.z,sx:e.clientX-r.left,sy:e.clientY-r.top};}
function startPan(e){drag={mode:'pan',sx:e.clientX,sy:e.clientY,ox:V.x,oy:V.y};vp.classList.add('panning');vp.setPointerCapture(e.pointerId);}

function initCanvas(){
  vp.addEventListener('wheel',e=>{
    e.preventDefault();const r=vp.getBoundingClientRect();
    if(e.ctrlKey||e.metaKey||S.wheelZoom)zoomAt(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),e.clientX-r.left,e.clientY-r.top);
    else{V.x-=e.deltaX;V.y-=e.deltaY;applyView();}
  },{passive:false});

  vp.addEventListener('pointerdown',e=>{
    if(e.button!==0&&e.button!==1)return;
    if(document.activeElement&&document.activeElement!==document.body)document.activeElement.blur();
    const c=curCase(),p=pt(e);
    if(e.button===1||S.tool==='pan'||spaceDown){e.preventDefault();startPan(e);return;}
    vp.setPointerCapture(e.pointerId);
    if(S.tool==='box'&&c.image){drag={mode:'draw',kind:'box',p0:p};draft={kind:'box',x:p.x,y:p.y,w:0,h:0};return;}
    if(S.tool==='arrow'&&c.image){const b=boxAt(c,p.x,p.y);drag={mode:'draw',kind:'arrow',p0:p,fromId:b?b.id:null};draft={kind:'arrow',x1:p.x,y1:p.y,x2:p.x,y2:p.y,fromId:b?b.id:null};return;}
    if(S.tool!=='select'){startPan(e);return;}
    const hEl=e.target.closest&&e.target.closest('[data-handle]'),aEl=e.target.closest&&e.target.closest('[data-id]');
    if(hEl){
      const a=findAnn(c,hEl.dataset.id),k=hEl.dataset.handle;
      drag={mode:(k==='start'||k==='end')?'arrowEnd':'resize',id:a.id,h:k,p0:p,orig:JSON.parse(JSON.stringify(a)),pre:JSON.stringify(c.anns),moved:false};
    }else if(aEl){
      const a=findAnn(c,aEl.dataset.id);if(S.selId!==a.id)select(a.id);
      drag={mode:'move',id:a.id,p0:p,orig:JSON.parse(JSON.stringify(a)),pre:JSON.stringify(c.anns),moved:false};
    }else{select(null);startPan(e);}
  });

  vp.addEventListener('pointermove',e=>{
    if(!drag)return;const c=curCase(),p=pt(e);
    if(drag.mode==='pan'){V.x=drag.ox+(e.clientX-drag.sx);V.y=drag.oy+(e.clientY-drag.sy);applyView();return;}
    if(drag.mode==='draw'){
      if(drag.kind==='box')draft={kind:'box',x:Math.min(p.x,drag.p0.x),y:Math.min(p.y,drag.p0.y),w:Math.abs(p.x-drag.p0.x),h:Math.abs(p.y-drag.p0.y)};
      else draft={kind:'arrow',x1:drag.p0.x,y1:drag.p0.y,x2:p.x,y2:p.y,fromId:drag.fromId};
      renderAnns();return;
    }
    const a=findAnn(c,drag.id);if(!a)return;
    const dx=p.x-drag.p0.x,dy=p.y-drag.p0.y,o=drag.orig;
    if(Math.abs(dx)+Math.abs(dy)>2/V.z)drag.moved=true;
    if(!drag.moved)return;
    if(drag.mode==='move'){
      if(a.type==='box'){a.x=o.x+dx;a.y=o.y+dy;}
      else{a.x2=o.x2+dx;a.y2=o.y2+dy;if(!a.fromId||!boxById(c,a.fromId)){a.x1=o.x1+dx;a.y1=o.y1+dy;}}
    }else if(drag.mode==='resize'){
      const k=drag.h,r=o.x+o.w,b=o.y+o.h;let nx=o.x,ny=o.y,nr=r,nb=b;
      if(k.includes('w'))nx=Math.min(p.x,r-8);
      if(k.includes('e'))nr=Math.max(p.x,o.x+8);
      if(k.includes('n'))ny=Math.min(p.y,b-8);
      if(k.includes('s'))nb=Math.max(p.y,o.y+8);
      a.x=nx;a.y=ny;a.w=nr-nx;a.h=nb-ny;
    }else if(drag.mode==='arrowEnd'){
      if(drag.h==='end'){a.x2=p.x;a.y2=p.y;}
      else{a.fromId=null;a.x1=p.x;a.y1=p.y;}
    }
    renderAnns();
  });

  const finish=e=>{
    if(!drag)return;const d=drag;drag=null;vp.classList.remove('panning');
    const c=curCase();
    if(d.mode==='pan')return;
    if(d.mode==='draw'&&draft){
      const dr=draft;draft=null;
      if(d.kind==='box'&&dr.w>6&&dr.h>6){pushUndo();const b=mkBox(dr.x,dr.y,dr.w,dr.h);c.anns.push(b);S.selId=b.id;setTool('select');afterAnnChange();setTimeout(()=>{const f=$('#f-label');if(f)f.focus();},30);return;}
      if(d.kind==='arrow'&&Math.hypot(dr.x2-dr.x1,dr.y2-dr.y1)>12){pushUndo();const a=mkArrow(dr.x1,dr.y1,dr.x2,dr.y2,dr.fromId);c.anns.push(a);S.selId=a.id;setTool('select');afterAnnChange();return;}
      renderAnns();return;
    }
    if(d.moved){
      const a=findAnn(c,d.id);
      if(a&&d.mode==='arrowEnd'&&d.h==='start'){const b=boxAt(c,a.x1,a.y1);if(b)a.fromId=b.id;}
      pushUndo(d.pre);afterAnnChange();
    }
  };
  vp.addEventListener('pointerup',finish);
  vp.addEventListener('pointercancel',finish);
  vp.addEventListener('dblclick',e=>{
    if(S.tool!=='select')return;const p=pt(e),b=boxAt(curCase(),p.x,p.y);
    if(b){select(b.id);setTimeout(()=>{const f=$('#f-label');if(f){f.focus();f.select();}},20);}
  });

  document.addEventListener('keydown',e=>{
    const t=e.target;
    if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
    if($('.modal-back'))return;
    const k=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
    if(mod&&k==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
    if(mod&&k==='y'){e.preventDefault();redo();return;}
    if(mod&&k==='d'){e.preventDefault();dupSelected();return;}
    if(mod||e.altKey)return;
    if(k===' '){e.preventDefault();if(!spaceDown){spaceDown=true;vp.style.cursor='grab';}return;}
    if(k==='v')setTool('select');else if(k==='r')setTool('box');else if(k==='a')setTool('arrow');else if(k==='h')setTool('pan');
    else if(k==='escape'){select(null);setTool('select');}
    else if(k==='delete'||k==='backspace'){e.preventDefault();deleteSelected();}
    else if(k==='+'||k==='=')zoomCenter(1.2);else if(k==='-')zoomCenter(1/1.2);else if(k==='0')fitView();
    else if(k.startsWith('arrow')&&S.selId){e.preventDefault();const s=e.shiftKey?10:1;nudge(k==='arrowleft'?-s:k==='arrowright'?s:0,k==='arrowup'?-s:k==='arrowdown'?s:0);}
  });
  document.addEventListener('keyup',e=>{if(e.key===' '){spaceDown=false;vp.style.cursor='';}});
  window.addEventListener('blur',()=>{spaceDown=false;vp.style.cursor='';});

  const stage=$('#stage');
  ['dragenter','dragover'].forEach(n=>stage.addEventListener(n,e=>{if([...(e.dataTransfer?.types||[])].includes('Files')){e.preventDefault();stage.classList.add('dragging');}}));
  stage.addEventListener('dragleave',e=>{if(e.target===stage||!stage.contains(e.relatedTarget))stage.classList.remove('dragging');});
  stage.addEventListener('drop',e=>{
    e.preventDefault();stage.classList.remove('dragging');
    const f=e.dataTransfer.files[0];if(!f)return;
    if(/\.json$/i.test(f.name)||f.type==='application/json')importFile(f);else handleImageFile(f);
  });
  document.addEventListener('paste',e=>{
    const t=e.target;if(t&&(/^(INPUT|TEXTAREA)$/.test(t.tagName)||t.isContentEditable))return;
    const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'));
    if(it){e.preventDefault();handleImageFile(it.getAsFile());}
  });
  window.addEventListener('resize',()=>{if(S.project&&!curCase().image)fitView();});
}


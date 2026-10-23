'use strict';
/* Lienzo: zoom, desplazamiento y carga de la vista de la casuística */
const V={x:0,y:0,z:1};
const vp=$('#viewport'),world=$('#world'),svg=$('#svg'),img=$('#img');
let lastZ=null,draft=null,drag=null,spaceDown=false;

function applyView(){
  world.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.z})`;
  vp.style.backgroundPosition=`${V.x}px ${V.y}px`;
  vp.style.backgroundSize=`${24*V.z}px ${24*V.z}px`;
  $('#zLbl').textContent=Math.round(V.z*100)+'%';
  if(V.z!==lastZ){lastZ=V.z;renderAnns();}
}
function fitView(){
  const c=curCase(),r=vp.getBoundingClientRect();
  if(!c||!c.image){V.x=r.width/2;V.y=r.height/2;V.z=1;applyView();return;}
  const padX=84,top=84,bottom=64;
  V.z=Math.max(.05,Math.min((r.width-padX*2)/c.w,(r.height-top-bottom)/c.h,1.5));
  V.x=(r.width-c.w*V.z)/2;V.y=top+(r.height-top-bottom-c.h*V.z)/2;applyView();
}
function zoomAt(f,cx,cy){
  const z=Math.max(.05,Math.min(8,V.z*f)),k=z/V.z;
  V.x=cx-(cx-V.x)*k;V.y=cy-(cy-V.y)*k;V.z=z;applyView();
}
function zoomCenter(f){const r=vp.getBoundingClientRect();zoomAt(f,r.width/2,r.height/2);}

function loadCaseView(){
  const c=curCase();
  if(c.image){
    img.src=c.image;img.width=c.w;img.height=c.h;img.style.display='block';
    world.style.width=c.w+'px';world.style.height=c.h+'px';$('#empty').hidden=true;
  }else{
    img.removeAttribute('src');img.style.display='none';world.style.width='0';world.style.height='0';$('#empty').hidden=false;
  }
  draft=null;lastZ=null;fitView();updateUndoUI();
}

'use strict';
/* Lienzo: carga de imágenes */
/* ---------- imágenes ---------- */
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('No se pudo leer la imagen'));i.src=src;});}
async function setImageFromFile(file,mode){
  try{
    const url=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});
    const im=await loadImage(url);let w=im.naturalWidth,h=im.naturalHeight,data=url;const MAX=2400;
    if(Math.max(w,h)>MAX){const k=MAX/Math.max(w,h);w=Math.round(w*k);h=Math.round(h*k);const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(im,0,0,w,h);data=cv.toDataURL('image/png');}
    let c=curCase();
    if(mode==='new'){c=mkCase('Casuística '+(curStep().cases.length+1));curStep().cases.push(c);S.caseId=c.id;S.selId=null;}
    c.image=data;c.w=w;c.h=h;loadCaseView();refreshAll();save();
  }catch(e){toast(e.message||'No se pudo cargar la imagen');}
}
async function handleImageFile(file){
  if(!file||!/^image\//.test(file.type)){toast('Ese archivo no es una imagen.');return;}
  if(!curCase().image)return setImageFromFile(file,'replace');
  const ch=await askChoice({title:'Esta casuística ya tiene una imagen',text:'Podés reemplazarla (las marcas se quedan en su lugar) o crear una casuística nueva con esta imagen.',buttons:[{label:'Cancelar',value:'x'},{label:'Reemplazar imagen',value:'rep'},{label:'Nueva casuística',value:'new',kind:'primary'}]});
  if(ch==='rep')await setImageFromFile(file,'replace');else if(ch==='new')await setImageFromFile(file,'new');
}

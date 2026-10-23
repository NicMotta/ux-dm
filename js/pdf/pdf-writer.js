'use strict';
/* Generador de PDF propio (sin dependencias): página con la imagen marcada + detalle del mapeo */
const PDFW=(()=>{
  const HW=[].concat(
    [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278],
    Array(10).fill(556),
    [278,278,584,584,584,556,1015],
    [667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611],
    [278,278,278,469,556,333],
    [556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500],
    [334,260,334,584]);
  const WIN={0x20AC:128,0x2026:133,0x2018:145,0x2019:146,0x201C:147,0x201D:148,0x2022:149,0x2013:150,0x2014:151,0x2122:153};
  const GRAY=[110,118,136],INK=[22,26,40],LINE=[212,216,226];
  const MG=40,PW=595.28,PH=841.89;
  const hex=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));

  function enc(s){
    s=String(s==null?'':s).replace(/\r\n?/g,'\n').replace(/→/g,'->').replace(/[   ]/g,' ').replace(/\t/g,'  ');
    let o='';
    for(const ch of s){const c=ch.codePointAt(0);
      if(c===10||(c>=32&&c<=126)||(c>=128&&c<=159)||(c>=160&&c<=255))o+=ch;else if(WIN[c])o+=String.fromCharCode(WIN[c]);else o+='?';}
    return o;
  }
  const pesc=s=>s.replace(/([\\()])/g,'\\$1');
  const latin1=s=>{const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i)&255;return b;};
  function tw(s,size,o={}){
    if(o.mono)return s.length*.6*size;
    let w=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);w+=(c>=32&&c<=126)?HW[c-32]:600;}
    return w*size/1000*(o.bold?1.08:1);
  }
  function wrap(text,size,maxW,o={}){
    const out=[];
    enc(text).split('\n').forEach(par=>{
      if(!par.trim()){out.push('');return;}
      let line='';
      par.split(' ').forEach(word=>{
        if(tw(word,size,o)>maxW){
          if(line){out.push(line);line='';}
          let chunk='';
          for(const ch of word){if(tw(chunk+ch,size,o)>maxW){out.push(chunk);chunk='';}chunk+=ch;}
          line=chunk;return;
        }
        const cand=line?line+' '+word:word;
        if(tw(cand,size,o)>maxW){out.push(line);line=word;}else line=cand;
      });
      out.push(line);
    });
    return out;
  }

  class Page{
    constructor(w,h){this.w=w;this.h=h;this.ops=[];this.imgs=[];this.footer='';}
    col(c){return c.map(v=>(v/255).toFixed(3)).join(' ');}
    rect(x,y,w,h,o={}){
      let s='q ';if(o.fill)s+=this.col(o.fill)+' rg ';if(o.stroke)s+=this.col(o.stroke)+' RG '+(o.lw||1)+' w ';
      s+=`${x.toFixed(2)} ${(this.h-y-h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${o.fill&&o.stroke?'B':o.fill?'f':'S'} Q`;this.ops.push(s);
    }
    line(x1,y1,x2,y2,c,lw){this.ops.push(`q ${this.col(c)} RG ${lw||.5} w ${x1.toFixed(2)} ${(this.h-y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.h-y2).toFixed(2)} l S Q`);}
    text(x,y,s,o={}){this.ops.push(`BT /${o.font||'F1'} ${o.size||10} Tf ${this.col(o.color||INK)} rg 1 0 0 1 ${x.toFixed(2)} ${(this.h-y).toFixed(2)} Tm (${pesc(enc(s))}) Tj ET`);}
    image(key,x,y,w,h){if(this.imgs.indexOf(key)<0)this.imgs.push(key);this.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${(this.h-y-h).toFixed(2)} cm /${key} Do Q`);}
  }

  class Doc{
    constructor(title){this.title=title;this.pages=[];this.images={};}
    addPage(w,h){const p=new Page(w,h);this.pages.push(p);return p;}
    addImage(key,bytes,w,h){this.images[key]={bytes,w,h};}
    build(){
      const n=this.pages.length;
      this.pages.forEach((p,i)=>{
        if(p.footer)p.text(MG,p.h-22,wrap(p.footer,7.5,p.w-2*MG-70)[0]||'',{size:7.5,color:GRAY});
        const t=`Pág. ${i+1} de ${n}`;p.text(p.w-MG-tw(enc(t),7.5),p.h-22,t,{size:7.5,color:GRAY});
      });
      const chunks=[],offs=[];let len=0;
      const push=x=>{const b=typeof x==='string'?latin1(x):x;chunks.push(b);len+=b.length;};
      const obj=(id,parts)=>{offs[id]=len;push(id+' 0 obj\n');parts.forEach(push);push('\nendobj\n');};
      let next=7;const imgId={};Object.keys(this.images).forEach(k=>{imgId[k]=next++;});
      const pg=this.pages.map(()=>({cid:next++,pid:next++}));
      const d=new Date(),z=v=>String(v).padStart(2,'0'),stamp=`${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;
      push('%PDF-1.4\n%'+String.fromCharCode(0xE2,0xE3,0xCF,0xD3)+'\n');
      obj(1,['<< /Type /Catalog /Pages 2 0 R >>']);
      obj(2,[`<< /Type /Pages /Count ${pg.length} /Kids [${pg.map(x=>x.pid+' 0 R').join(' ')}] >>`]);
      obj(3,['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>']);
      obj(4,['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>']);
      obj(5,['<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>']);
      obj(6,[`<< /Title (${pesc(enc(this.title))}) /Creator (UX Data Mapping) /CreationDate (D:${stamp}) >>`]);
      Object.keys(this.images).forEach(k=>{const im=this.images[k];
        obj(imgId[k],[`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`,im.bytes,'\nendstream']);});
      this.pages.forEach((p,i)=>{
        const content=latin1(p.ops.join('\n'));
        obj(pg[i].cid,[`<< /Length ${content.length} >>\nstream\n`,content,'\nendstream']);
        const xo=p.imgs.map(k=>`/${k} ${imgId[k]} 0 R`).join(' ');
        obj(pg[i].pid,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p.w.toFixed(2)} ${p.h.toFixed(2)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> /XObject << ${xo} >> >> /Contents ${pg[i].cid} 0 R >>`]);
      });
      const xr=len;let x=`xref\n0 ${next}\n0000000000 65535 f \n`;
      for(let i=1;i<next;i++)x+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
      push(x+`trailer\n<< /Size ${next} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xr}\n%%EOF\n`);
      const out=new Uint8Array(len);let o=0;chunks.forEach(c=>{out.set(c,o);o+=c.length;});return out;
    }
  }

  /* ----- imagen con marcas, rasterizada ----- */
  async function renderCaseJpeg(c){
    const im=await loadImage(c.image),cv=document.createElement('canvas');cv.width=c.w;cv.height=c.h;
    const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.w,c.h);g.drawImage(im,0,0,c.w,c.h);
    const u=Math.max(1,Math.max(c.w,c.h)/900);
    c.anns.forEach(a=>{if(a.type!=='box')return;const col=SRC_HEX[a.source];g.fillStyle=col+'22';g.fillRect(a.x,a.y,a.w,a.h);g.strokeStyle=col;g.lineWidth=2.5*u;g.strokeRect(a.x,a.y,a.w,a.h);});
    c.anns.forEach(a=>{
      if(a.type!=='arrow')return;const col=SRC_HEX[ownerOf(c,a).source],p=arrowPts(c,a);if(p.hidden)return;
      const L=16*u,t=Math.atan2(p.y2-p.y1,p.x2-p.x1);
      g.strokeStyle=col;g.fillStyle=col;g.lineWidth=3*u;g.lineCap='round';
      g.beginPath();g.moveTo(p.x1,p.y1);g.lineTo(p.x2-(L-2*u)*Math.cos(t),p.y2-(L-2*u)*Math.sin(t));g.stroke();
      g.beginPath();headPoints(p.x1,p.y1,p.x2,p.y2,L,13*u).forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();
    });
    c.anns.forEach(a=>{
      if(!isOwner(c,a))return;
      const col=SRC_HEX[a.source],p=a.type==='box'?{x:a.x,y:a.y}:(q=>({x:q.x1,y:q.y1}))(arrowPts(c,a));
      g.beginPath();g.arc(p.x,p.y,11*u,0,Math.PI*2);g.fillStyle=col;g.fill();g.lineWidth=1.5*u;g.strokeStyle='#fff';g.stroke();
      g.fillStyle='#fff';g.font=`700 ${12*u}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(String(numOf(c,a)),p.x,p.y+.5*u);
    });
    const bin=atob(cv.toDataURL('image/jpeg',.92).split(',')[1]),bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return {bytes,w:c.w,h:c.h};
  }

  /* ----- composición ----- */
  function legend(p,xr,y){
    let x=xr;[['service','Servicio'],['hardcoded','Estático'],['calculated','Calculado']].reverse().forEach(([k,l])=>{
      x-=tw(l,8);p.text(x,y,l,{size:8,color:GRAY});x-=11;p.rect(x,y-7,8,8,{fill:hex(SRC_HEX[k])});x-=14;});
  }
  function rowsFor(o){
    const r=[];
    if(o.source==='service'){
      if(o.service)r.push(['Servicio',o.service]);
      if(o.endpoint)r.push(['Endpoint',`${o.method} ${o.endpoint}`,1]);
      if(o.path)r.push(['Objeto / campo',o.path,1]);
      r.push(['Tipo',o.dtype+(o.format?'   Formato: '+o.format:'')]);
      if(o.example)r.push(['Ejemplo',o.example,1]);
    }else if(o.source==='hardcoded'){
      r.push(['Texto literal',o.text||'(sin completar)']);if(o.i18n)r.push(['Clave i18n',o.i18n,1]);
    }else{r.push(['Regla',o.rule||'(sin completar)']);if(o.deps)r.push(['Depende de',o.deps]);}
    if(o.notes)r.push(['Notas',o.notes]);
    return r;
  }
  function header(p,pw,y,st,c){
    p.text(MG,y+8,enc(st.name).toUpperCase(),{size:8,font:'F2',color:GRAY});legend(p,pw-MG,y+8);y+=20;
    wrap(c.name,17,pw-2*MG,{bold:1}).forEach(l=>{p.text(MG,y+14,l,{size:17,font:'F2'});y+=22;});
    wrap(c.description||'',9.5,pw-2*MG).slice(0,5).forEach(l=>{if(l||c.description){p.text(MG,y+10,l,{size:9.5,color:[70,78,96]});y+=13;}});
    return y+8;
  }
  async function addCase(doc,proj,st,c,key){
    const footer=`${proj}  ·  ${st.name}  ·  ${c.name}`;let tp,ty;
    const newTable=first=>{
      tp=doc.addPage(PW,PH);tp.footer=footer;ty=MG;
      if(first)ty=header(tp,PW,ty,st,c);else{tp.text(MG,ty+8,`${st.name}  ·  ${c.name}`,{size:8,color:GRAY});ty+=22;}
      tp.text(MG,ty+12,'Detalle del mapeo',{size:12,font:'F2'});ty+=24;
    };
    if(c.image){
      const r=await renderCaseJpeg(c),portrait=c.h/c.w>1.15,pw=portrait?PW:PH,ph=portrait?PH:PW;
      doc.addImage(key,r.bytes,r.w,r.h);
      const p=doc.addPage(pw,ph);p.footer=footer;
      const top=header(p,pw,MG,st,c),bw=pw-2*MG,bh=ph-MG-30-top,k=Math.min(bw/r.w,bh/r.h),w=r.w*k,h=r.h*k,x=MG+(bw-w)/2;
      p.image(key,x,top,w,h);p.rect(x,top,w,h,{stroke:LINE,lw:.6});
      newTable(false);
    }else newTable(true);
    const list=owners(c);
    if(!list.length){tp.text(MG,ty+10,'Esta casuística todavía no tiene marcas.',{size:10,color:GRAY});return;}
    const cw=PW-2*MG,kx=MG+32,vx=kx+84,vw=PW-MG-vx;
    list.forEach((o,i)=>{
      const col=hex(SRC_HEX[o.source]),tag=SRC[o.source].toUpperCase();
      const ll=wrap(o.label||'(sin nombre)',11,cw-32-90,{bold:1}).slice(0,3),headH=Math.max(18,ll.length*14+4);
      const rows=rowsFor(o).map(([k,v,m])=>{let ls=wrap(v,9,vw,{mono:!!m});if(ls.length>24)ls=ls.slice(0,24).concat('...');return {k,m,ls};});
      const bh=headH+6+rows.reduce((s,r)=>s+r.ls.length*12+3,0)+16;
      if(ty+bh>PH-MG-26)newTable(false);
      const p=tp;p.rect(MG,ty,24,16,{fill:col});
      const ns=String(i+1);p.text(MG+12-tw(ns,9,{bold:1})/2,ty+11.5,ns,{size:9,font:'F2',color:[255,255,255]});
      ll.forEach((l,j)=>p.text(kx,ty+11.5+j*14,l,{size:11,font:'F2'}));
      p.text(PW-MG-tw(tag,7.5,{bold:1}),ty+11,tag,{size:7.5,font:'F2',color:col});
      let y=ty+headH+4;
      rows.forEach(r=>{p.text(kx,y+9,r.k,{size:8.5,font:'F2',color:GRAY});r.ls.forEach((l,j)=>p.text(vx,y+9+j*12,l,{size:r.m?8.5:9,font:r.m?'F3':'F1'}));y+=r.ls.length*12+3;});
      p.line(MG,ty+bh-8,PW-MG,ty+bh-8,LINE,.5);ty+=bh;
    });
  }
  function addIndex(doc,P){
    const p=doc.addPage(PW,PH);p.footer=P.name;let y=MG+10;
    wrap(P.name,24,PW-2*MG,{bold:1}).forEach(l=>{p.text(MG,y+18,l,{size:24,font:'F2'});y+=30;});
    p.text(MG,y+12,'Mapeo de datos de UX  ·  '+new Date().toLocaleDateString('es-AR'),{size:10,color:GRAY});y+=40;
    P.steps.forEach((s,si)=>{
      if(y>PH-MG-60)return;
      p.text(MG,y+12,`${si+1}. ${s.name}`,{size:12,font:'F2'});y+=22;
      s.cases.forEach(c=>{if(y>PH-MG-40)return;p.text(MG+14,y+10,`${c.name}   (${owners(c).length} marca(s))`,{size:10,color:[60,68,86]});y+=16;});
      y+=10;
    });
  }
  return {Doc,Page,wrap,tw,enc,addCase,addIndex};
})();
if(typeof module!=='undefined')module.exports=PDFW;

'use strict';
/* Exportación a PDF de una casuística o del proyecto completo */
async function exportCasePDF(){
  toast('Generando PDF…');
  try{
    const st=curStep(),c=curCase(),doc=new PDFW.Doc(`${S.project.name} - ${c.name}`);
    await PDFW.addCase(doc,S.project.name,st,c,'Im0');
    download(`${slug(S.project.name)}_${slug(st.name)}_${slug(c.name)}.pdf`,new Blob([doc.build()],{type:'application/pdf'}));
    toast('PDF de la casuística descargado');
  }catch(e){console.error(e);toast('No se pudo generar el PDF: '+e.message);}
}
async function exportProjectPDF(){
  toast('Generando PDF del proyecto…');
  try{
    const P=S.project,doc=new PDFW.Doc(P.name);PDFW.addIndex(doc,P);let n=0;
    for(const st of P.steps)for(const c of st.cases)await PDFW.addCase(doc,P.name,st,c,'Im'+(n++));
    download(`${slug(P.name)}_completo.pdf`,new Blob([doc.build()],{type:'application/pdf'}));
    toast('PDF del proyecto descargado');
  }catch(e){console.error(e);toast('No se pudo generar el PDF: '+e.message);}
}

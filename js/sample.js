'use strict';
/* Proyecto de ejemplo: una pantalla dibujada por código, con marcas ya cargadas, para ver cómo se usa */
function sampleImage(){
  const W=390,H=640,cv=document.createElement('canvas');cv.width=W;cv.height=H;
  const g=cv.getContext('2d'),F='sans-serif';
  const rr=(x,y,w,h,r,fill,stroke)=>{g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.stroke();}};
  const tx=(s,x,y,font,col,al)=>{g.font=font;g.fillStyle=col;g.textAlign=al||'left';g.fillText(s,x,y);};
  g.fillStyle='#f4f5fa';g.fillRect(0,0,W,H);
  g.fillStyle='#fff';g.fillRect(0,0,W,56);
  tx('Paso 1 de 3',20,33,`500 13px ${F}`,'#6b7287');
  tx('Pagá con tarjeta',16,100,`700 22px ${F}`,'#1b2033');
  tx('Total a pagar',16,138,`400 13px ${F}`,'#6b7287');
  tx('$ 48.500,00',16,172,`700 28px ${F}`,'#1b2033');
  tx('Medio de pago',16,214,`500 13px ${F}`,'#6b7287');
  rr(16,224,358,56,10,'#fff','#d6dae6');
  rr(30,244,26,18,3,'#1a3fd1');g.fillStyle='#fff';g.fillRect(30,249,26,3);
  tx('Visa •••• 4242',66,258,`500 16px ${F}`,'#1b2033');
  g.strokeStyle='#8a90a5';g.lineWidth=2;g.beginPath();g.moveTo(346,249);g.lineTo(351,254);g.lineTo(356,249);g.stroke();
  tx('Cuotas',16,316,`500 13px ${F}`,'#6b7287');
  rr(16,326,358,56,10,'#fff','#d6dae6');
  tx('3 cuotas de $ 16.166,67',30,360,`500 16px ${F}`,'#1b2033');
  rr(16,392,84,22,11,'#d9f3e4');tx('Sin interés',28,407,`700 12px ${F}`,'#1b7a46');
  tx('Código de seguridad',16,446,`500 13px ${F}`,'#6b7287');
  rr(16,456,358,56,10,'#fff','#d6dae6');
  tx('•••',30,490,`500 16px ${F}`,'#1b2033');tx('3 dígitos al dorso',358,489,`400 12px ${F}`,'#8a90a5','right');
  tx('Tus datos están protegidos',16,540,`400 12px ${F}`,'#6b7287');
  rr(16,572,358,52,10,'#1f3fd1');tx('Continuar',195,604,`700 16px ${F}`,'#fff','center');
  return cv.toDataURL('image/png');
}
function makeSample(){
  const P=mkProject('Checkout de pagos (ejemplo)');
  const s1=P.steps[0];s1.name='Pago con tarjeta';
  const c1=s1.cases[0];c1.name='Tarjeta de crédito en cuotas';
  c1.description='Usuario logueado con una tarjeta de crédito guardada. Elige 3 cuotas sin interés y el saldo alcanza. Este proyecto es un ejemplo: borralo o usalo para probar.';
  c1.image=sampleImage();c1.w=390;c1.h=640;
  const B=(x,y,w,h,d)=>Object.assign(mkBox(x,y,w,h),d);
  const b1=B(12,74,200,34,{label:'Título de la pantalla',source:'hardcoded',text:'Pagá con tarjeta',i18n:'checkout.card.title',notes:'Texto fijo, no cambia según la casuística.'});
  const b2=B(12,146,196,36,{label:'Monto total a pagar',source:'service',service:'orders-api',method:'GET',endpoint:'/v2/orders/{orderId}',path:'order.totals.grandTotal',dtype:'number',format:'ARS, 2 decimales, miles con punto',example:'{ "order": { "totals": { "grandTotal": 48500.00 } } }',notes:'Si grandTotal es 0 se omite el paso de pago.'});
  const b3=B(62,240,140,26,{label:'Tarjeta seleccionada',source:'service',service:'wallet-api',method:'GET',endpoint:'/v1/customers/me/cards',path:'cards[default=true].brand, cards[].last4',dtype:'string',format:'{brand} •••• {last4}',notes:'Se preselecciona la tarjeta marcada como default.'});
  const b4=B(26,342,206,26,{label:'Cuotas disponibles',source:'service',service:'payments-api',method:'POST',endpoint:'/v1/installments/simulate',path:'installments[].count, installments[].amountPerInstallment',dtype:'array',format:'{count} cuotas de {amount}',example:'{ "orderId": "A-1029", "cardBin": "450799" }',notes:'La flecha indica que el mismo servicio alimenta el tag “Sin interés” (installments[].interestFree).'});
  const b5=B(12,526,184,20,{label:'Leyenda de seguridad',source:'hardcoded',text:'Tus datos están protegidos',i18n:'checkout.card.securityNote'});
  const b6=B(150,586,90,26,{label:'Texto del botón principal',source:'hardcoded',text:'Continuar',i18n:'common.actions.continue',notes:'Se habilita cuando hay una cuota elegida y el código de seguridad tiene 3 dígitos.'});
  const a1=mkArrow(0,0,60,392,b4.id);
  const a2=Object.assign(mkArrow(120,298,46,262,null),{label:'Logo de la marca de la tarjeta',source:'calculated',rule:'Según cards[].brand se elige el ícono. Si la marca no se reconoce, se muestra el ícono genérico.',deps:'Tarjeta seleccionada (marca)'});
  c1.anns=[b1,b2,b3,b4,b5,b6,a1,a2];
  const c2=mkCase('Tarjeta de débito, sin cuotas');c2.description='Débito: no se muestra el selector de cuotas.';s1.cases.push(c2);
  const s2=mkStep('Confirmación del pago','Pago aprobado');P.steps.push(s2);
  return P;
}


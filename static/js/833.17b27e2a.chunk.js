"use strict";(self.webpackChunkaa_webauthn_demo=self.webpackChunkaa_webauthn_demo||[]).push([[833],{75439:(e,t,a)=>{a.d(t,{M:()=>i});var s=a(56816),n=a(80184);const i=e=>{let{buttonText:t,onClick:a,disabled:i=!1,testId:l="",loading:r=!1,sx:d}=e;return(0,n.jsx)(s.Z,{size:"small",variant:"contained",sx:{...d,backgroundColor:"black",borderRadius:2},onClick:a,disabled:i,"data-testid":l,loading:r,children:t})}},42833:(e,t,a)=>{a.r(t),a.d(t,{default:()=>b});var s=a(77257),n=a(57621),i=a(39504),l=a(20890),r=a(72363),d=a(75439),o=a(95400),c=a(22382),u=a(42139),h=a(70188),x=a(80184);const p=e=>{let{setAttachment:t}=e;return(0,x.jsx)(c.Z,{options:h.yJ,sx:{width:288,py:1,pr:1},renderInput:e=>(0,x.jsx)(u.Z,{...e,label:"Authenticator Attachment"}),onChange:(e,a)=>{t(null===a||void 0===a?void 0:a.value)},isOptionEqualToValue:(e,t)=>e.value===t.value,"data-testid":"autocomplete-authenticator-attachment"})},b=(0,s.Pi)((()=>{const{appStore:e}=(0,o.oR)(),t=e.isInit;return(0,x.jsx)(x.Fragment,{children:(0,x.jsxs)(n.Z,{variant:"outlined",sx:{minWidth:275,borderRadius:5},children:[(0,x.jsxs)(i.Z,{sx:{pb:1},children:[(0,x.jsx)(l.Z,{display:"inline",sx:{fontSize:26},children:"Create Passkey"}),t&&(0,x.jsx)(l.Z,{display:"inline",sx:{fontSize:14,color:"blue"},children:" (Passkey Initialized)"})]}),(0,x.jsxs)(r.Z,{sx:{pl:2,pr:2,pb:2},children:[(0,x.jsx)(p,{setAttachment:t=>{e.attachment=t}}),(0,x.jsx)(d.M,{buttonText:"Create Passkey",onClick:async()=>{const t=await e.initialize();e.snackBarMessage=!0===t?"Passkey created successfully!":`${t.toString()}`,e.openSnackBar=!0},testId:"create-passkey"})]})]})})}))}}]);
//# sourceMappingURL=833.17b27e2a.chunk.js.map
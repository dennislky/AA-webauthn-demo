"use strict";(self.webpackChunkaa_webauthn_demo=self.webpackChunkaa_webauthn_demo||[]).push([[511],{75439:(e,n,r)=>{r.d(n,{M:()=>a});var o=r(56816),t=r(80184);const a=e=>{let{buttonText:n,onClick:r,disabled:a=!1,testId:s="",loading:i=!1,sx:l}=e;return(0,t.jsx)(o.Z,{size:"small",variant:"contained",sx:{...l,backgroundColor:"black",borderRadius:2},onClick:r,disabled:a,"data-testid":s,loading:i,children:n})}},55511:(e,n,r)=>{r.r(n),r.d(n,{default:()=>b});var o=r(72791),t=r(77257),a=r(57621),s=r(39504),i=r(20890),l=r(72363),c=r(42139),d=r(50533),u=r(17303),p=r(75439),x=r(33077),m=r(70188),h=r(80184);const b=(0,t.Pi)((()=>{const{appStore:e}=(0,x.oR)(),n=e.accountAddress,[r,t]=(0,o.useState)(!1),[b,y]=(0,o.useState)("");return n?(0,h.jsx)(h.Fragment,{children:(0,h.jsxs)(a.Z,{variant:"outlined",sx:{minWidth:275,borderRadius:5},children:[(0,h.jsx)(s.Z,{sx:{pb:1},children:(0,h.jsx)(i.Z,{display:"inline",sx:{fontSize:26},children:"Add Recovery Email"})}),(0,h.jsxs)(l.Z,{sx:{pl:2,pr:2,pb:2},children:[(0,h.jsx)(c.Z,{id:"email",label:"Email",variant:"filled",onChange:e=>{y(e.target.value)}}),(0,h.jsx)(p.M,{buttonText:"Add Recovery Email",sx:{ml:1},onClick:()=>(async n=>{let{email:r}=n;e.accountAddress||(e.snackBarMessage="Please create account first",e.openSnackBar=!0);try{t(!0);const n=await e.getNewAccountBuilder(),r=new u.vU(["function execute(address,uint256,bytes)"]).encodeFunctionData("execute",[m.m$,0,"0x"]);n.setCallData(r);const o=await e.client.sendUserOperation(n);e.addRecoveryEmailTxHash=o.userOpHash}catch(o){console.error(o),e.snackBarMessage=`${o.toString()}`,e.openSnackBar=!0}finally{t(!1)}})({email:b}),testId:"send-transaction",loading:r})]}),e.addRecoveryEmailTxHash&&(0,h.jsx)(s.Z,{sx:{pb:1},children:e.addRecoveryEmailTxHash&&(0,h.jsxs)(i.Z,{sx:{fontSize:16},children:["Transaction Details: ",(0,h.jsx)(d.Z,{underline:"always",target:"_blank",rel:"noopener",href:`https://dashboard.tenderly.co/tx/sepolia/${e.addRecoveryEmailTxHash}?trace=0`,children:e.addRecoveryEmailTxHash})]})})]})}):null}))},50533:(e,n,r)=>{r.d(n,{Z:()=>C});var o=r(63366),t=r(87462),a=r(72791),s=r(63733),i=r(94419),l=r(14036),c=r(66934),d=r(31402),u=r(23031),p=r(42071),x=r(20890),m=r(75878),h=r(21217);function b(e){return(0,h.Z)("MuiLink",e)}const y=(0,m.Z)("MuiLink",["root","underlineNone","underlineHover","underlineAlways","button","focusVisible"]);var v=r(18529),Z=r(94860);const f={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"},k=e=>{let{theme:n,ownerState:r}=e;const o=(e=>f[e]||e)(r.color),t=(0,v.DW)(n,`palette.${o}`,!1)||r.color,a=(0,v.DW)(n,`palette.${o}Channel`);return"vars"in n&&a?`rgba(${a} / 0.4)`:(0,Z.Fq)(t,.4)};var g=r(80184);const w=["className","color","component","onBlur","onFocus","TypographyClasses","underline","variant","sx"],S=(0,c.ZP)(x.Z,{name:"MuiLink",slot:"Root",overridesResolver:(e,n)=>{const{ownerState:r}=e;return[n.root,n[`underline${(0,l.Z)(r.underline)}`],"button"===r.component&&n.button]}})((e=>{let{theme:n,ownerState:r}=e;return(0,t.Z)({},"none"===r.underline&&{textDecoration:"none"},"hover"===r.underline&&{textDecoration:"none","&:hover":{textDecoration:"underline"}},"always"===r.underline&&(0,t.Z)({textDecoration:"underline"},"inherit"!==r.color&&{textDecorationColor:k({theme:n,ownerState:r})},{"&:hover":{textDecorationColor:"inherit"}}),"button"===r.component&&{position:"relative",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none","&::-moz-focus-inner":{borderStyle:"none"},[`&.${y.focusVisible}`]:{outline:"auto"}})})),C=a.forwardRef((function(e,n){const r=(0,d.Z)({props:e,name:"MuiLink"}),{className:c,color:x="primary",component:m="a",onBlur:h,onFocus:y,TypographyClasses:v,underline:Z="always",variant:k="inherit",sx:C}=r,R=(0,o.Z)(r,w),{isFocusVisibleRef:j,onBlur:A,onFocus:D,ref:T}=(0,u.Z)(),[B,M]=a.useState(!1),$=(0,p.Z)(n,T),E=(0,t.Z)({},r,{color:x,component:m,focusVisible:B,underline:Z,variant:k}),F=(e=>{const{classes:n,component:r,focusVisible:o,underline:t}=e,a={root:["root",`underline${(0,l.Z)(t)}`,"button"===r&&"button",o&&"focusVisible"]};return(0,i.Z)(a,b,n)})(E);return(0,g.jsx)(S,(0,t.Z)({color:x,className:(0,s.Z)(F.root,c),classes:v,component:m,onBlur:e=>{A(e),!1===j.current&&M(!1),h&&h(e)},onFocus:e=>{D(e),!0===j.current&&M(!0),y&&y(e)},ref:$,ownerState:E,variant:k,sx:[...Object.keys(f).includes(x)?[]:[{color:x}],...Array.isArray(C)?C:[C]]},R))}))}}]);
//# sourceMappingURL=511.f862a9e6.chunk.js.map
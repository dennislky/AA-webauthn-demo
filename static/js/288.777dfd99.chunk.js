(self.webpackChunkaa_webauthn_demo=self.webpackChunkaa_webauthn_demo||[]).push([[288],{75439:(e,t,r)=>{"use strict";r.d(t,{M:()=>s});var a=r(56816),n=r(80184);const s=e=>{let{buttonText:t,onClick:r,disabled:s=!1,testId:c="",loading:o=!1,sx:i}=e;return(0,n.jsx)(a.Z,{size:"small",variant:"contained",sx:{...i,backgroundColor:"black",borderRadius:2},onClick:r,disabled:s,"data-testid":c,loading:o,children:t})}},98697:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>y});var a=r(72791),n=r(77257),s=r(57621),c=r(39504),o=r(20890),i=r(72363),l=r(50533),d=r(49673),u=r(87499),h=r(75439),p=r(95400),g=r(98402),x=r(70188),b=r(80184);const y=(0,n.Pi)((()=>{const{appStore:e}=(0,p.oR)(),t=e.isInit,[r,n]=(0,a.useState)(!1);return t?(0,b.jsx)(b.Fragment,{children:(0,b.jsxs)(s.Z,{variant:"outlined",sx:{minWidth:275,borderRadius:5},children:[(0,b.jsx)(c.Z,{sx:{pb:1},children:(0,b.jsx)(o.Z,{display:"inline",sx:{fontSize:26},children:"Create Account"})}),(0,b.jsx)(i.Z,{sx:{pl:2,pr:2,pb:2},children:(0,b.jsx)(h.M,{buttonText:"Create Account",onClick:async()=>{e.isInit||(e.snackBarMessage="Please create passkey first",e.openSnackBar=!0);try{n(!0);const t=new g.A(e.transports,x.cc,e.createCredential,e.publicKey),r=await d.Client.init(x.Bp,{entryPoint:x.m$,overrideBundlerRpc:x.kK}),a=await u.SmartAccount.init(t,x.Bp,{overrideBundlerRpc:x.kK,entryPoint:x.m$,factory:x.BJ,paymasterMiddleware:d.Presets.Middleware.verifyingPaymaster(x.RZ,{type:"payg"})});console.log("accountBuilder",a);const s=await r.sendUserOperation(a);e.accountAddress=a.getSender(),e.createAccountTxHash=s.userOpHash}catch(t){console.error(t),e.snackBarMessage=`${t.toString()}`,e.openSnackBar=!0}finally{n(!1)}},testId:"create-account",loading:r})}),e.createAccountTxHash&&(0,b.jsxs)(c.Z,{sx:{pb:1},children:[e.createAccountTxHash&&(0,b.jsxs)(o.Z,{sx:{fontSize:16},children:["Transaction Details: ",(0,b.jsx)(l.Z,{underline:"always",target:"_blank",rel:"noopener",href:`https://dashboard.tenderly.co/tx/sepolia/${e.createAccountTxHash}?trace=0`,children:e.createAccountTxHash})]}),e.accountAddress&&(0,b.jsxs)(o.Z,{sx:{fontSize:16},children:["Account Address: ",(0,b.jsx)(l.Z,{underline:"always",target:"_blank",rel:"noopener",href:`https://sepolia.etherscan.io/address/${e.accountAddress}`,children:e.accountAddress})]}),e.accountBalance>0&&(0,b.jsxs)(o.Z,{sx:{fontSize:16},children:["Account Balance: ",(0,b.jsx)(l.Z,{underline:"always",target:"_blank",rel:"noopener",href:`https://sepolia.etherscan.io/address/${e.accountAddress}`,children:e.accountBalance})]})]})]})}):null}))},98402:(e,t,r)=>{"use strict";r.d(t,{A:()=>l});var a=r(2257),n=r(73580),s=r(19967),c=r(51063),o=r(36411),i=r(19778).Buffer;class l{constructor(e,t,r,a){this.transports=e,this.addr=t,this.credential=r,this.publicKey=a}signatureLength(){return 1280}address(){return this.addr}async data(){const e=await(0,c.pJ)(this.publicKey);console.log("jwk",e);const t=i.from(s.P6.parseBase64url(e.x.toString())),r=i.from(s.P6.parseBase64url(e.y.toString()));return n.defaultAbiCoder.encode(["uint256","uint256"],[a.O$.from(t),a.O$.from(r)])}shouldRemoveLeadingZero(e){return 0===e[0]&&0!==(128&e[1])}async sign(e){const t=s.P6.toBase64url((0,n.arrayify)(e)).replace(/=/g,"");console.log("challenge",t),console.log("create credential",this.credential);const r=s.P6.parseBase64url(t),i=await(0,o.YR)(r,this.credential.rawId,this.transports);console.log("get credential",i.credential);const l=(new TextDecoder).decode(s.P6.parseBase64url(s.P6.toBase64url(i.credential.clientDataJSON))),d=l.indexOf(t),u=l.substring(0,d),h=l.substring(d+t.length),p=new Uint8Array(i.credential.authenticatorData),g=(0,c.bL)(i.credential.signature);let x=g.r,b=g.s;this.shouldRemoveLeadingZero(x)&&(x=x.slice(1)),this.shouldRemoveLeadingZero(b)&&(b=b.slice(1));const y=n.defaultAbiCoder.encode(["uint256","uint256"],[a.O$.from(x),a.O$.from(b)]);return console.log(y,p,u,h),n.defaultAbiCoder.encode(["bytes","bytes","string","string"],[y,p,u,h])}}},46601:()=>{},89214:()=>{},8623:()=>{},7748:()=>{},85568:()=>{},56619:()=>{},83736:()=>{},77108:()=>{},52361:()=>{},94616:()=>{}}]);
//# sourceMappingURL=288.777dfd99.chunk.js.map
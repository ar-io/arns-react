import{r as n,k as h,_ as m,j as e,aP as y,am as c,ao as l,aQ as v,c as w,a as C,aA as j,an as b,aR as N,aS as S,W as E}from"./index-8036de61.js";(function(){try{var t=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},s=new Error().stack;s&&(t._sentryDebugIds=t._sentryDebugIds||{},t._sentryDebugIds[s]="38e6162b-2ee7-4e18-e1b0-1976868a46ca",t._sentryDebugIdIdentifier="sentry-dbid-38e6162b-2ee7-4e18-e1b0-1976868a46ca")}catch{}})();var A={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"}},{tag:"path",attrs:{d:"M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z"}}]},name:"plus",theme:"outlined"};const D=A;var T=function(s,i){return n.createElement(h,m({},s,{ref:i,icon:D}))};const I=n.forwardRef(T),k=t=>n.createElement("svg",{width:"current",height:"current",viewBox:"0 0 16 16",fill:"current",xmlns:"http://www.w3.org/2000/svg",...t},n.createElement("path",{d:"M14.0004 8.00028C14.0004 8.13289 13.9477 8.26006 13.8539 8.35383C13.7602 8.4476 13.633 8.50028 13.5004 8.50028H3.70727L7.35414 12.1465C7.4006 12.193 7.43745 12.2481 7.46259 12.3088C7.48773 12.3695 7.50067 12.4346 7.50067 12.5003C7.50067 12.566 7.48773 12.631 7.46259 12.6917C7.43745 12.7524 7.4006 12.8076 7.35414 12.854C7.30769 12.9005 7.25254 12.9373 7.19184 12.9625C7.13115 12.9876 7.06609 13.0006 7.00039 13.0006C6.9347 13.0006 6.86964 12.9876 6.80895 12.9625C6.74825 12.9373 6.6931 12.9005 6.64664 12.854L2.14664 8.35403C2.10016 8.30759 2.06328 8.25245 2.03811 8.19175C2.01295 8.13105 2 8.06599 2 8.00028C2 7.93457 2.01295 7.86951 2.03811 7.80881C2.06328 7.74811 2.10016 7.69296 2.14664 7.64653L6.64664 3.14653C6.74046 3.05271 6.86771 3 7.00039 3C7.13308 3 7.26032 3.05271 7.35414 3.14653C7.44796 3.24035 7.50067 3.3676 7.50067 3.50028C7.50067 3.63296 7.44796 3.76021 7.35414 3.85403L3.70727 7.50028H13.5004C13.633 7.50028 13.7602 7.55296 13.8539 7.64672C13.9477 7.74049 14.0004 7.86767 14.0004 8.00028Z",fill:"current"}));function u({to:t,body:s}){return e.jsx(y,{to:t,className:"link hover",style:{textDecoration:"none",width:"100%"},children:e.jsx("div",{className:"flex flex-column center white radius",style:{minWidth:"175px",minHeight:"100px",width:"100%",padding:"0px",gap:"15px",textDecoration:"none",position:"relative",fontSize:"18px",border:"1px solid var(--text-faded)"},children:s})})}const L=({interactionType:t,...s})=>{switch(t){case c.INCREASE_UNDERNAMES:return e.jsxs("span",{className:"white center",children:[e.jsx(l,{style:{fontSize:18,color:"var(--success-green)"}}),"  Undernames Increased"]});case c.EXTEND_LEASE:return e.jsxs("span",{className:"white center",children:[e.jsx(l,{style:{fontSize:18,color:"var(--success-green)"}}),"  Your lease has been extended"]});case c.BUY_RECORD:return e.jsxs("span",{className:"flex white center",style:{gap:"8px",width:"100%",padding:"0px 24px"},children:[e.jsx("span",{children:e.jsx(l,{style:{fontSize:18,color:"var(--success-green)"}})})," ",e.jsx("b",{children:v(s==null?void 0:s.name)})," is yours!"]});default:return e.jsx("span",{className:"flex white center",children:"Transaction Success"})}};function P(){const[{interactionResult:t,interactionType:s,workflowName:i,transactionData:o},p]=w(),d=C(),[a,f]=n.useState(),[r,g]=n.useState();if(n.useEffect(()=>{t||d("/"),a?p({type:"reset"}):(g({transactionData:o,interactionType:s,interactionResult:t}),f(j({interactionType:s,transactionData:{...o,deployedTransactionId:t==null?void 0:t.id}})))},[a]),!a||!r)return e.jsx(b,{loading:!0,message:"Loading..."});const x=N(i,{...r.transactionData,deployedTransactionId:r.interactionResult.id}).trim();return e.jsx("div",{className:"page center",children:e.jsxs("div",{className:"flex-column center",style:{gap:"20px",width:"700px"},children:[e.jsx("div",{className:"flex flex-row center radius",style:{width:"700px",height:"90px",background:"var(--green-bg)",border:"1px solid #44AF69",fontSize:"18px",marginBottom:"20px"},children:L({...r.transactionData,interactionType:r.interactionType})}),e.jsxs("div",{className:"flex-column center",style:{gap:"20px"},children:[e.jsxs("div",{className:"flex flex-row center",style:{justifyContent:"space-between",boxSizing:"border-box",gap:"20px"},children:[e.jsx(u,{to:`/manage/ants/${x}`,body:e.jsxs("div",{className:"flex flex-column center",style:{gap:"15px"},children:[e.jsx(S,{width:"20px",fill:"var(--text-grey)"}),"Configure Domain"]})}),e.jsx(u,{to:`/manage/ants/${x}/undernames`,body:e.jsxs("div",{className:"flex flex-column center",style:{gap:"15px"},children:[e.jsx(I,{style:{color:"var(--text-grey)",fontSize:"20px"}}),"Add Undernames"]})})]}),e.jsx(E,{...a,overrides:{...a.overrides},compact:!1,bordered:!0}),e.jsx("div",{className:"flex flex-row center",style:{justifyContent:"flex-start"},children:e.jsxs("button",{className:"flex button hover center white",onClick:()=>d("/manage"),style:{gap:"10px"},children:[e.jsx(k,{width:"20px",fill:"var(--text-grey)"}),"Back to Manage Assets"]})})]})]})})}export{P as default};
//# sourceMappingURL=TransactionComplete-a09176e4.js.map
import{aU as h,bx as m,be as b,c0 as v,c1 as L,c2 as O,b4 as P,aZ as B,c3 as F,c4 as M,c5 as Y,j as t,a as H,aE as X,aW as G,aX as $,b as q,aF as z,r as w,c6 as _,c7 as Z,by as J,aM as K,bE as Q,c8 as V,c9 as ee}from"./index-074df9e9.js";import{A as te}from"./ANTCard-1b1a6eba.js";import{W as re}from"./WarningCard-604e5777.js";import{T as se}from"./TransactionCost-ecaaf669.js";import{S as ae}from"./StepProgressBar-a5ba2875.js";import{g as j}from"./transaction-descriptions-6c7593d6.js";import"./useBreakpoint-68e5bcd6.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},s=new Error().stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="777fbab0-917c-4b9a-d2f1-76523796fb01",e._sentryDebugIdIdentifier="sentry-dbid-777fbab0-917c-4b9a-d2f1-76523796fb01")}catch{}})();async function ne({payload:e,workflowName:s,owner:f,arioContract:d,processId:y,dispatch:g,signer:u,ao:E,scheduler:l=Y}){var r;let n;const a=setTimeout(()=>{h.emit("network:ao:congested",!0)},1e4);try{if(!d)throw new Error("ArIO provider is not defined");if(!u)throw new Error("signer is not defined");switch(g({type:"setSigning",payload:!0}),s){case m.BUY_RECORD:{const{name:o,type:S,years:I}=e;let i=e.processId;if(i==="atomic"){const c=e.state||L(f.toString(),(r=e.targetId)==null?void 0:r.toString());i=await O({state:c,signer:P(u),ao:E,scheduler:l,luaCodeTxId:B}),await F.init({signer:u,processId:M}).register({processId:i}).catch(x=>{h.emit("error",new Error(`Failed to register ANT process: ${x}. You may need to manually register the process`))})}const T=await d.buyRecord({name:b(o),type:S,years:I,processId:i});e.processId=i,n=T;break}case m.EXTEND_LEASE:n=await d.extendLease({name:b(e.name),years:e.years},v);break;case m.INCREASE_UNDERNAMES:n=await d.increaseUndernameLimit({name:b(e.name),increaseCount:e.qty},v);break;default:throw new Error(`Unsupported workflow name: ${s}`)}}catch(o){h.emit("error",o)}finally{g({type:"setSigning",payload:!1}),clearTimeout(a)}if(!n)throw new Error("Failed to dispatch ArIO interaction");const p={deployer:f.toString(),processId:y.toString(),id:n.id,type:"interaction",payload:e};return g({type:"setWorkflowName",payload:s}),g({type:"setInteractionResult",payload:p}),p}function D({workflowName:e,...s}){switch(e){case m.INCREASE_UNDERNAMES:case m.EXTEND_LEASE:return t.jsx("h1",{className:"flex white text-[2rem]",style:{width:"100%",paddingBottom:"30px"},children:"Review"});case m.BUY_RECORD:return"Review your Purchase";default:return}}function ge(){var R;const e=H(),[{ioTicker:s,arioContract:f,ioProcessId:d,aoNetwork:y,aoClient:g}]=X(),[{arnsEmitter:u},E]=G(),[{walletAddress:l,wallet:n}]=$(),[{workflowName:a,interactionType:p,transactionData:r,interactionResult:o},S]=q(),I=z(),[i,T]=w.useState(),[c,N]=w.useState(_(p)),[x,C]=w.useState(D({workflowName:a})),[A,k]=w.useState(j({workflowName:a,ioTicker:s}));w.useEffect(()=>{if(!r&&!a){e("/");return}T(Z({interactionType:p,transactionData:{...r,deployedTransactionId:o==null?void 0:o.id}})),k(j({workflowName:a,ioTicker:s})),N(_(p)),C(D({workflowName:a}))},[r,o,a,p,l]);async function U(){try{if(!(f instanceof V))throw new Error("Wallet must be connected to dispatch transactions.");if(!r||!a)throw new Error("Transaction data is missing");if(!l)throw new Error("Wallet address is missing");await ne({arioContract:f,workflowName:a,payload:r,owner:l,processId:d,dispatch:S,signer:n==null?void 0:n.arconnectSigner,ao:g,scheduler:y.SCHEDULER}),e("/transaction/complete")}catch(W){h.emit("error",W)}finally{l&&ee({emitter:u,dispatch:E,ioProcessId:d,walletAddress:l})}}return i?t.jsx("div",{className:"page",children:t.jsxs("div",{className:"flex flex-column center",style:I?{}:{gap:"0px",maxWidth:"900px",width:"100%"},children:[c&&c.length?t.jsx("div",{className:"flex flex-row",style:{marginBottom:"20px",width:"100%"},children:t.jsx(ae,{stage:3,stages:c})}):t.jsx(t.Fragment,{}),typeof x=="string"?t.jsx("div",{className:"flex flex-row text-large white bold center",style:{height:"100%",padding:"50px 0px",borderTop:c!=null&&c.length?"solid 1px var(--text-faded)":""},children:x}):x,t.jsx(te,{...i,bordered:!0,compact:!0,overrides:{...i.overrides,targetId:(R=r==null?void 0:r.targetId)==null?void 0:R.toString()}}),t.jsx(se,{feeWrapperStyle:{alignItems:"center",justifyContent:"center",height:"100%"},fee:{[s]:r==null?void 0:r.interactionPrice},info:A&&t.jsx("div",{children:t.jsx(re,{wrapperStyle:{padding:"10px",fontSize:"14px",alignItems:"center"},customIcon:t.jsx(K,{width:"20px",fill:"var(--accent)"}),text:A})})}),t.jsx("div",{className:"flex",style:{marginTop:20,width:"100%",justifyContent:"flex-end"},children:t.jsx(Q,{onNext:()=>U(),onBack:()=>e(-1),backText:"Back",nextText:"Confirm"})})]})}):t.jsx(J,{loading:!0,message:"Loading transaction data..."})}export{ge as default};
//# sourceMappingURL=TransactionReview-ccc571e5.js.map
var ps=Object.defineProperty;var xs=(e,t,n)=>t in e?ps(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var qe=(e,t,n)=>(xs(e,typeof t!="symbol"?t+"":t,n),n);import{s as Vn,m as Gn,b as R,d as rr,e as U,a as v,f as W,h as oe,S as B,c as D,i as we,u as $e,j as V,k as A,l as Ne,o as ct,P as zo,n as j,D as ws,t as q,p as Ft,q as ln,r as k,v as F,w as $s,x as Rt,y as Cs,z as Ss,A as wn,F as ks,B as Es,C as Ds,E as Kt,G as Ms,H as As,I as Fs,J as or,K as Kr,L as Ts,M as qt,$ as Ro,N as Br,O as Is,Q as Ps,R as zn,T as Ls,U as Os,V as qs}from"./production-a91f3a76.js";(function(){try{var e=typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},t=new Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="997d91be-6dd1-4667-f9b4-93781933c0dc",e._sentryDebugIdIdentifier="sentry-dbid-997d91be-6dd1-4667-f9b4-93781933c0dc")}catch{}})();var _s=e=>e!=null,zs=e=>e.filter(_s);function Rs(e){return(...t)=>{for(const n of e)n&&n(...t)}}var E=e=>typeof e=="function"&&!e.length?e():e,Hn=e=>Array.isArray(e)?e:e?[e]:[];function Ks(e,...t){return typeof e=="function"?e(...t):e}var Bs=j;function Ns(e,t,n,r){const o=e.length,s=t.length;let a=0;if(!s){for(;a<o;a++)n(e[a]);return}if(!o){for(;a<s;a++)r(t[a]);return}for(;a<s&&t[a]===e[a];a++);let l,i;t=t.slice(a),e=e.slice(a);for(l of t)e.includes(l)||r(l);for(i of e)t.includes(i)||n(i)}function Us(e){const[t,n]=R(),r=e!=null&&e.throw?(c,d)=>{throw n(c instanceof Error?c:new Error(d)),c}:(c,d)=>{n(c instanceof Error?c:new Error(d))},o=e!=null&&e.api?Array.isArray(e.api)?e.api:[e.api]:[globalThis.localStorage].filter(Boolean),s=e!=null&&e.prefix?`${e.prefix}.`:"",a=new Map,l=new Proxy({},{get(c,d){let h=a.get(d);h||(h=R(void 0,{equals:!1}),a.set(d,h)),h[0]();const y=o.reduce((m,b)=>{if(m!==null||!b)return m;try{return b.getItem(`${s}${d}`)}catch(p){return r(p,`Error reading ${s}${d} from ${b.name}`),null}},null);return y!==null&&(e!=null&&e.deserializer)?e.deserializer(y,d,e.options):y}}),i=(c,d,h)=>{const y=e!=null&&e.serializer?e.serializer(d,c,h??e.options):d,m=`${s}${c}`;o.forEach(p=>{try{p.getItem(m)!==y&&p.setItem(m,y)}catch(x){r(x,`Error setting ${s}${c} to ${y} in ${p.name}`)}});const b=a.get(c);b&&b[1]()},u=c=>o.forEach(d=>{try{d.removeItem(`${s}${c}`)}catch(h){r(h,`Error removing ${s}${c} from ${d.name}`)}}),f=()=>o.forEach(c=>{try{c.clear()}catch(d){r(d,`Error clearing ${c.name}`)}}),g=()=>{const c={},d=(h,y)=>{if(!c.hasOwnProperty(h)){const m=y&&(e!=null&&e.deserializer)?e.deserializer(y,h,e.options):y;m&&(c[h]=m)}};return o.forEach(h=>{if(typeof h.getAll=="function"){let y;try{y=h.getAll()}catch(m){r(m,`Error getting all values from in ${h.name}`)}for(const m of y)d(m,y[m])}else{let y=0,m;try{for(;m=h.key(y++);)c.hasOwnProperty(m)||d(m,h.getItem(m))}catch(b){r(b,`Error getting all values from ${h.name}`)}}}),c};return(e==null?void 0:e.sync)!==!1&&Ft(()=>{const c=d=>{var y;let h=!1;o.forEach(m=>{try{m!==d.storageArea&&d.key&&d.newValue!==m.getItem(d.key)&&(d.newValue?m.setItem(d.key,d.newValue):m.removeItem(d.key),h=!0)}catch(b){r(b,`Error synching api ${m.name} from storage event (${d.key}=${d.newValue})`)}}),h&&d.key&&((y=a.get(d.key))==null||y[1]())};"addEventListener"in globalThis?(globalThis.addEventListener("storage",c),j(()=>globalThis.removeEventListener("storage",c))):(o.forEach(d=>{var h;return(h=d.addEventListener)==null?void 0:h.call(d,"storage",c)}),j(()=>o.forEach(d=>{var h;return(h=d.removeEventListener)==null?void 0:h.call(d,"storage",c)})))}),[l,i,{clear:f,error:t,remove:u,toJSON:g}]}var rf=Us,Vs=e=>(typeof e.clear=="function"||(e.clear=()=>{let t;for(;t=e.key(0);)e.removeItem(t)}),e),Nr=e=>{if(!e)return"";let t="";for(const n in e){if(!e.hasOwnProperty(n))continue;const r=e[n];t+=r instanceof Date?`; ${n}=${r.toUTCString()}`:typeof r=="boolean"?`; ${n}`:`; ${n}=${r}`}return t},_e=Vs({_cookies:[globalThis.document,"cookie"],getItem:e=>{var t;return((t=_e._cookies[0][_e._cookies[1]].match("(^|;)\\s*"+e+"\\s*=\\s*([^;]+)"))==null?void 0:t.pop())??null},setItem:(e,t,n)=>{const r=_e.getItem(e);_e._cookies[0][_e._cookies[1]]=`${e}=${t}${Nr(n)}`;const o=Object.assign(new Event("storage"),{key:e,oldValue:r,newValue:t,url:globalThis.document.URL,storageArea:_e});window.dispatchEvent(o)},removeItem:e=>{_e._cookies[0][_e._cookies[1]]=`${e}=deleted${Nr({expires:new Date(0)})}`},key:e=>{let t=null,n=0;return _e._cookies[0][_e._cookies[1]].replace(/(?:^|;)\s*(.+?)\s*=\s*[^;]+/g,(r,o)=>(!t&&o&&n++===e&&(t=o),"")),t},get length(){let e=0;return _e._cookies[0][_e._cookies[1]].replace(/(?:^|;)\s*.+?\s*=\s*[^;]+/g,t=>(e+=t?1:0,"")),e}}),Gs=1024,Dt=796,ir=700,Hs="bottom-right",jn="bottom",of="system",js=!1,Ko=500,Ws=500,Bo=500,Qs=Object.keys(Vn)[0],Ur=1,Ys=Object.keys(Gn)[0],Xs=we({client:void 0,onlineManager:void 0,queryFlavor:"",version:"",shadowDOMTarget:void 0});function K(){return $e(Xs)}var No=we(void 0),sf=e=>{const[t,n]=R(null),r=()=>{const a=t();a!=null&&(a.close(),n(null))},o=(a,l)=>{if(t()!=null)return;const i=window.open("","TSQD-Devtools-Panel",`width=${a},height=${l},popup`);if(!i)throw new Error("Failed to open popup. Please allow popups for this site to view the devtools in picture-in-picture mode.");i.document.head.innerHTML="",i.document.body.innerHTML="",Ds(i.document),i.document.title="TanStack Query Devtools",i.document.body.style.margin="0",i.addEventListener("pagehide",()=>{e.setLocalStore("pip_open","false"),n(null)}),[...(K().shadowDOMTarget||document).styleSheets].forEach(u=>{try{const f=[...u.cssRules].map(h=>h.cssText).join(""),g=document.createElement("style"),c=u.ownerNode;let d="";c&&"id"in c&&(d=c.id),d&&g.setAttribute("id",d),g.textContent=f,i.document.head.appendChild(g)}catch{const g=document.createElement("link");if(u.href==null)return;g.rel="stylesheet",g.type=u.type,g.media=u.media.toString(),g.href=u.href,i.document.head.appendChild(g)}}),rr(["focusin","focusout","pointermove","keydown","pointerdown","pointerup","click","mousedown","input"],i.document),e.setLocalStore("pip_open","true"),n(i)};U(()=>{(e.localStore.pip_open??"false")==="true"&&!e.disabled&&o(Number(window.innerWidth),Number(e.localStore.height||Ws))}),U(()=>{const a=(K().shadowDOMTarget||document).querySelector("#_goober"),l=t();if(a&&l){const i=new MutationObserver(()=>{const u=(K().shadowDOMTarget||l.document).querySelector("#_goober");u&&(u.textContent=a.textContent)});i.observe(a,{childList:!0,subtree:!0,characterDataOldValue:!0}),j(()=>{i.disconnect()})}});const s=D(()=>({pipWindow:t(),requestPipWindow:o,closePipWindow:r,disabled:e.disabled??!1}));return v(No.Provider,{value:s,get children(){return e.children}})},sr=()=>D(()=>{const t=$e(No);if(!t)throw new Error("usePiPWindow must be used within a PiPProvider");return t()}),Zs=we(()=>"dark");function pe(){return $e(Zs)}var Uo={À:"A",Á:"A",Â:"A",Ã:"A",Ä:"A",Å:"A",Ấ:"A",Ắ:"A",Ẳ:"A",Ẵ:"A",Ặ:"A",Æ:"AE",Ầ:"A",Ằ:"A",Ȃ:"A",Ç:"C",Ḉ:"C",È:"E",É:"E",Ê:"E",Ë:"E",Ế:"E",Ḗ:"E",Ề:"E",Ḕ:"E",Ḝ:"E",Ȇ:"E",Ì:"I",Í:"I",Î:"I",Ï:"I",Ḯ:"I",Ȋ:"I",Ð:"D",Ñ:"N",Ò:"O",Ó:"O",Ô:"O",Õ:"O",Ö:"O",Ø:"O",Ố:"O",Ṍ:"O",Ṓ:"O",Ȏ:"O",Ù:"U",Ú:"U",Û:"U",Ü:"U",Ý:"Y",à:"a",á:"a",â:"a",ã:"a",ä:"a",å:"a",ấ:"a",ắ:"a",ẳ:"a",ẵ:"a",ặ:"a",æ:"ae",ầ:"a",ằ:"a",ȃ:"a",ç:"c",ḉ:"c",è:"e",é:"e",ê:"e",ë:"e",ế:"e",ḗ:"e",ề:"e",ḕ:"e",ḝ:"e",ȇ:"e",ì:"i",í:"i",î:"i",ï:"i",ḯ:"i",ȋ:"i",ð:"d",ñ:"n",ò:"o",ó:"o",ô:"o",õ:"o",ö:"o",ø:"o",ố:"o",ṍ:"o",ṓ:"o",ȏ:"o",ù:"u",ú:"u",û:"u",ü:"u",ý:"y",ÿ:"y",Ā:"A",ā:"a",Ă:"A",ă:"a",Ą:"A",ą:"a",Ć:"C",ć:"c",Ĉ:"C",ĉ:"c",Ċ:"C",ċ:"c",Č:"C",č:"c",C̆:"C",c̆:"c",Ď:"D",ď:"d",Đ:"D",đ:"d",Ē:"E",ē:"e",Ĕ:"E",ĕ:"e",Ė:"E",ė:"e",Ę:"E",ę:"e",Ě:"E",ě:"e",Ĝ:"G",Ǵ:"G",ĝ:"g",ǵ:"g",Ğ:"G",ğ:"g",Ġ:"G",ġ:"g",Ģ:"G",ģ:"g",Ĥ:"H",ĥ:"h",Ħ:"H",ħ:"h",Ḫ:"H",ḫ:"h",Ĩ:"I",ĩ:"i",Ī:"I",ī:"i",Ĭ:"I",ĭ:"i",Į:"I",į:"i",İ:"I",ı:"i",Ĳ:"IJ",ĳ:"ij",Ĵ:"J",ĵ:"j",Ķ:"K",ķ:"k",Ḱ:"K",ḱ:"k",K̆:"K",k̆:"k",Ĺ:"L",ĺ:"l",Ļ:"L",ļ:"l",Ľ:"L",ľ:"l",Ŀ:"L",ŀ:"l",Ł:"l",ł:"l",Ḿ:"M",ḿ:"m",M̆:"M",m̆:"m",Ń:"N",ń:"n",Ņ:"N",ņ:"n",Ň:"N",ň:"n",ŉ:"n",N̆:"N",n̆:"n",Ō:"O",ō:"o",Ŏ:"O",ŏ:"o",Ő:"O",ő:"o",Œ:"OE",œ:"oe",P̆:"P",p̆:"p",Ŕ:"R",ŕ:"r",Ŗ:"R",ŗ:"r",Ř:"R",ř:"r",R̆:"R",r̆:"r",Ȓ:"R",ȓ:"r",Ś:"S",ś:"s",Ŝ:"S",ŝ:"s",Ş:"S",Ș:"S",ș:"s",ş:"s",Š:"S",š:"s",Ţ:"T",ţ:"t",ț:"t",Ț:"T",Ť:"T",ť:"t",Ŧ:"T",ŧ:"t",T̆:"T",t̆:"t",Ũ:"U",ũ:"u",Ū:"U",ū:"u",Ŭ:"U",ŭ:"u",Ů:"U",ů:"u",Ű:"U",ű:"u",Ų:"U",ų:"u",Ȗ:"U",ȗ:"u",V̆:"V",v̆:"v",Ŵ:"W",ŵ:"w",Ẃ:"W",ẃ:"w",X̆:"X",x̆:"x",Ŷ:"Y",ŷ:"y",Ÿ:"Y",Y̆:"Y",y̆:"y",Ź:"Z",ź:"z",Ż:"Z",ż:"z",Ž:"Z",ž:"z",ſ:"s",ƒ:"f",Ơ:"O",ơ:"o",Ư:"U",ư:"u",Ǎ:"A",ǎ:"a",Ǐ:"I",ǐ:"i",Ǒ:"O",ǒ:"o",Ǔ:"U",ǔ:"u",Ǖ:"U",ǖ:"u",Ǘ:"U",ǘ:"u",Ǚ:"U",ǚ:"u",Ǜ:"U",ǜ:"u",Ứ:"U",ứ:"u",Ṹ:"U",ṹ:"u",Ǻ:"A",ǻ:"a",Ǽ:"AE",ǽ:"ae",Ǿ:"O",ǿ:"o",Þ:"TH",þ:"th",Ṕ:"P",ṕ:"p",Ṥ:"S",ṥ:"s",X́:"X",x́:"x",Ѓ:"Г",ѓ:"г",Ќ:"К",ќ:"к",A̋:"A",a̋:"a",E̋:"E",e̋:"e",I̋:"I",i̋:"i",Ǹ:"N",ǹ:"n",Ồ:"O",ồ:"o",Ṑ:"O",ṑ:"o",Ừ:"U",ừ:"u",Ẁ:"W",ẁ:"w",Ỳ:"Y",ỳ:"y",Ȁ:"A",ȁ:"a",Ȅ:"E",ȅ:"e",Ȉ:"I",ȉ:"i",Ȍ:"O",ȍ:"o",Ȑ:"R",ȑ:"r",Ȕ:"U",ȕ:"u",B̌:"B",b̌:"b",Č̣:"C",č̣:"c",Ê̌:"E",ê̌:"e",F̌:"F",f̌:"f",Ǧ:"G",ǧ:"g",Ȟ:"H",ȟ:"h",J̌:"J",ǰ:"j",Ǩ:"K",ǩ:"k",M̌:"M",m̌:"m",P̌:"P",p̌:"p",Q̌:"Q",q̌:"q",Ř̩:"R",ř̩:"r",Ṧ:"S",ṧ:"s",V̌:"V",v̌:"v",W̌:"W",w̌:"w",X̌:"X",x̌:"x",Y̌:"Y",y̌:"y",A̧:"A",a̧:"a",B̧:"B",b̧:"b",Ḑ:"D",ḑ:"d",Ȩ:"E",ȩ:"e",Ɛ̧:"E",ɛ̧:"e",Ḩ:"H",ḩ:"h",I̧:"I",i̧:"i",Ɨ̧:"I",ɨ̧:"i",M̧:"M",m̧:"m",O̧:"O",o̧:"o",Q̧:"Q",q̧:"q",U̧:"U",u̧:"u",X̧:"X",x̧:"x",Z̧:"Z",z̧:"z"},Js=Object.keys(Uo).join("|"),ea=new RegExp(Js,"g");function ta(e){return e.replace(ea,t=>Uo[t])}var Fe={CASE_SENSITIVE_EQUAL:7,EQUAL:6,STARTS_WITH:5,WORD_STARTS_WITH:4,CONTAINS:3,ACRONYM:2,MATCHES:1,NO_MATCH:0};function Vr(e,t,n){var r;if(n=n||{},n.threshold=(r=n.threshold)!=null?r:Fe.MATCHES,!n.accessors){const a=Gr(e,t,n);return{rankedValue:e,rank:a,accessorIndex:-1,accessorThreshold:n.threshold,passed:a>=n.threshold}}const o=ia(e,n.accessors),s={rankedValue:e,rank:Fe.NO_MATCH,accessorIndex:-1,accessorThreshold:n.threshold,passed:!1};for(let a=0;a<o.length;a++){const l=o[a];let i=Gr(l.itemValue,t,n);const{minRanking:u,maxRanking:f,threshold:g=n.threshold}=l.attributes;i<u&&i>=Fe.MATCHES?i=u:i>f&&(i=f),i=Math.min(i,f),i>=g&&i>s.rank&&(s.rank=i,s.passed=!0,s.accessorIndex=a,s.accessorThreshold=g,s.rankedValue=l.itemValue)}return s}function Gr(e,t,n){return e=Hr(e,n),t=Hr(t,n),t.length>e.length?Fe.NO_MATCH:e===t?Fe.CASE_SENSITIVE_EQUAL:(e=e.toLowerCase(),t=t.toLowerCase(),e===t?Fe.EQUAL:e.startsWith(t)?Fe.STARTS_WITH:e.includes(` ${t}`)?Fe.WORD_STARTS_WITH:e.includes(t)?Fe.CONTAINS:t.length===1?Fe.NO_MATCH:na(e).includes(t)?Fe.ACRONYM:ra(e,t))}function na(e){let t="";return e.split(" ").forEach(r=>{r.split("-").forEach(s=>{t+=s.substr(0,1)})}),t}function ra(e,t){let n=0,r=0;function o(i,u,f){for(let g=f,c=u.length;g<c;g++)if(u[g]===i)return n+=1,g+1;return-1}function s(i){const u=1/i,f=n/t.length;return Fe.MATCHES+f*u}const a=o(t[0],e,0);if(a<0)return Fe.NO_MATCH;r=a;for(let i=1,u=t.length;i<u;i++){const f=t[i];if(r=o(f,e,r),!(r>-1))return Fe.NO_MATCH}const l=r-a;return s(l)}function Hr(e,t){let{keepDiacritics:n}=t;return e=`${e}`,n||(e=ta(e)),e}function oa(e,t){let n=t;typeof t=="object"&&(n=t.accessor);const r=n(e);return r==null?[]:Array.isArray(r)?r:[String(r)]}function ia(e,t){const n=[];for(let r=0,o=t.length;r<o;r++){const s=t[r],a=sa(s),l=oa(e,s);for(let i=0,u=l.length;i<u;i++)n.push({itemValue:l[i],attributes:a})}return n}var jr={maxRanking:1/0,minRanking:-1/0};function sa(e){return typeof e=="function"?jr:{...jr,...e}}var aa={data:""},la=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||aa,ua=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,ca=/\/\*[^]*?\*\/|  +/g,Wr=/\n+/g,Et=(e,t)=>{let n="",r="",o="";for(let s in e){let a=e[s];s[0]=="@"?s[1]=="i"?n=s+" "+a+";":r+=s[1]=="f"?Et(a,s):s+"{"+Et(a,s[1]=="k"?"":t)+"}":typeof a=="object"?r+=Et(a,t?t.replace(/([^,])+/g,l=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,i=>/&/.test(i)?i.replace(/&/g,l):l?l+" "+i:i)):s):a!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=Et.p?Et.p(s,a):s+":"+a+";")}return n+(t&&o?t+"{"+o+"}":o)+r},at={},Vo=e=>{if(typeof e=="object"){let t="";for(let n in e)t+=n+Vo(e[n]);return t}return e},da=(e,t,n,r,o)=>{let s=Vo(e),a=at[s]||(at[s]=(i=>{let u=0,f=11;for(;u<i.length;)f=101*f+i.charCodeAt(u++)>>>0;return"go"+f})(s));if(!at[a]){let i=s!==e?e:(u=>{let f,g,c=[{}];for(;f=ua.exec(u.replace(ca,""));)f[4]?c.shift():f[3]?(g=f[3].replace(Wr," ").trim(),c.unshift(c[0][g]=c[0][g]||{})):c[0][f[1]]=f[2].replace(Wr," ").trim();return c[0]})(e);at[a]=Et(o?{["@keyframes "+a]:i}:i,n?"":"."+a)}let l=n&&at.g?at.g:null;return n&&(at.g=at[a]),((i,u,f,g)=>{g?u.data=u.data.replace(g,i):u.data.indexOf(i)===-1&&(u.data=f?i+u.data:u.data+i)})(at[a],t,r,l),a},fa=(e,t,n)=>e.reduce((r,o,s)=>{let a=t[s];if(a&&a.call){let l=a(n),i=l&&l.props&&l.props.className||/^go/.test(l)&&l;a=i?"."+i:l&&typeof l=="object"?l.props?"":Et(l,""):l===!1?"":l}return r+o+(a??"")},"");function Y(e){let t=this||{},n=e.call?e(t.p):e;return da(n.unshift?n.raw?fa(n,[].slice.call(arguments,1),t.p):n.reduce((r,o)=>Object.assign(r,o&&o.call?o(t.p):o),{}):n,la(t.target),t.g,t.o,t.k)}Y.bind({g:1});Y.bind({k:1});function Go(e){var t,n,r="";if(typeof e=="string"||typeof e=="number")r+=e;else if(typeof e=="object")if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(n=Go(e[t]))&&(r&&(r+=" "),r+=n)}else for(n in e)e[n]&&(r&&(r+=" "),r+=n);return r}function L(){for(var e,t,n=0,r="",o=arguments.length;n<o;n++)(e=arguments[n])&&(t=Go(e))&&(r&&(r+=" "),r+=t);return r}var Qr=()=>{};function ga(e,t){const n=Kt(e),{onChange:r}=t;let o=new Set(t.appear?void 0:n);const s=new WeakSet,[a,l]=R([],{equals:!1}),[i]=qs(),u=t.exitMethod==="remove"?Qr:g=>{l(c=>(c.push.apply(c,g),c));for(const c of g)s.delete(c)},f=t.exitMethod==="remove"?Qr:t.exitMethod==="keep-index"?(g,c,d)=>g.splice(d,0,c):(g,c)=>g.push(c);return D(g=>{const c=a(),d=e();if(d[Ro],Kt(i))return i(),g;if(c.length){const h=g.filter(y=>!c.includes(y));return c.length=0,r({list:h,added:[],removed:[],unchanged:h,finishRemoved:u}),h}return Kt(()=>{const h=new Set(d),y=d.slice(),m=[],b=[],p=[];for(const w of d)(o.has(w)?p:m).push(w);let x=!m.length;for(let w=0;w<g.length;w++){const $=g[w];h.has($)||(s.has($)||(b.push($),s.add($)),f(y,$,w)),x&&$!==y[w]&&(x=!1)}return!b.length&&x?g:(r({list:y,added:m,removed:b,unchanged:p,finishRemoved:u}),o=h,y)})},t.appear?[]:n.slice())}function Me(...e){return Rs(e)}var Yr=e=>e instanceof Element;function Wn(e,t){if(t(e))return e;if(typeof e=="function"&&!e.length)return Wn(e(),t);if(Array.isArray(e)){const n=[];for(const r of e){const o=Wn(r,t);o&&(Array.isArray(o)?n.push.apply(n,o):n.push(o))}return n.length?n:null}return null}function ha(e,t=Yr,n=Yr){const r=D(e),o=D(()=>Wn(r(),t));return o.toArray=()=>{const s=o();return Array.isArray(s)?s:s?[s]:[]},o}function ya(e){return D(()=>{const t=e.name||"s";return{enterActive:(e.enterActiveClass||t+"-enter-active").split(" "),enter:(e.enterClass||t+"-enter").split(" "),enterTo:(e.enterToClass||t+"-enter-to").split(" "),exitActive:(e.exitActiveClass||t+"-exit-active").split(" "),exit:(e.exitClass||t+"-exit").split(" "),exitTo:(e.exitToClass||t+"-exit-to").split(" "),move:(e.moveClass||t+"-move").split(" ")}})}function Ho(e){requestAnimationFrame(()=>requestAnimationFrame(e))}function ma(e,t,n,r){const{onBeforeEnter:o,onEnter:s,onAfterEnter:a}=t;o==null||o(n),n.classList.add(...e.enter),n.classList.add(...e.enterActive),queueMicrotask(()=>{if(!n.parentNode)return r==null?void 0:r();s==null||s(n,()=>l())}),Ho(()=>{n.classList.remove(...e.enter),n.classList.add(...e.enterTo),(!s||s.length<2)&&(n.addEventListener("transitionend",l),n.addEventListener("animationend",l))});function l(i){(!i||i.target===n)&&(n.removeEventListener("transitionend",l),n.removeEventListener("animationend",l),n.classList.remove(...e.enterActive),n.classList.remove(...e.enterTo),a==null||a(n))}}function va(e,t,n,r){const{onBeforeExit:o,onExit:s,onAfterExit:a}=t;if(!n.parentNode)return r==null?void 0:r();o==null||o(n),n.classList.add(...e.exit),n.classList.add(...e.exitActive),s==null||s(n,()=>l()),Ho(()=>{n.classList.remove(...e.exit),n.classList.add(...e.exitTo),(!s||s.length<2)&&(n.addEventListener("transitionend",l),n.addEventListener("animationend",l))});function l(i){(!i||i.target===n)&&(r==null||r(),n.removeEventListener("transitionend",l),n.removeEventListener("animationend",l),n.classList.remove(...e.exitActive),n.classList.remove(...e.exitTo),a==null||a(n))}}var Xr=e=>{const t=ya(e);return ga(ha(()=>e.children).toArray,{appear:e.appear,exitMethod:"keep-index",onChange({added:n,removed:r,finishRemoved:o,list:s}){const a=t();for(const i of n)ma(a,e,i);const l=[];for(const i of s)i.isConnected&&(i instanceof HTMLElement||i instanceof SVGElement)&&l.push({el:i,rect:i.getBoundingClientRect()});queueMicrotask(()=>{const i=[];for(const{el:u,rect:f}of l)if(u.isConnected){const g=u.getBoundingClientRect(),c=f.left-g.left,d=f.top-g.top;(c||d)&&(u.style.transform=`translate(${c}px, ${d}px)`,u.style.transitionDuration="0s",i.push(u))}document.body.offsetHeight;for(const u of i){let f=function(g){(g.target===u||/transform$/.test(g.propertyName))&&(u.removeEventListener("transitionend",f),u.classList.remove(...a.move))};u.classList.add(...a.move),u.style.transform=u.style.transitionDuration="",u.addEventListener("transitionend",f)}});for(const i of r)va(a,e,i,()=>o([i]))}})},Rn=Symbol("fallback");function Zr(e){for(const t of e)t.dispose()}function ba(e,t,n,r={}){const o=new Map;return j(()=>Zr(o.values())),()=>{const a=e()||[];return a[Ro],Kt(()=>{var f,g;if(!a.length)return Zr(o.values()),o.clear(),r.fallback?[Br(d=>(o.set(Rn,{dispose:d}),r.fallback()))]:[];const l=new Array(a.length),i=o.get(Rn);if(!o.size||i){i==null||i.dispose(),o.delete(Rn);for(let c=0;c<a.length;c++){const d=a[c],h=t(d,c);s(l,d,c,h)}return l}const u=new Set(o.keys());for(let c=0;c<a.length;c++){const d=a[c],h=t(d,c);u.delete(h);const y=o.get(h);y?(l[c]=y.mapped,(f=y.setIndex)==null||f.call(y,c),y.setItem(()=>d)):s(l,d,c,h)}for(const c of u)(g=o.get(c))==null||g.dispose(),o.delete(c);return l})};function s(a,l,i,u){Br(f=>{const[g,c]=R(l),d={setItem:c,dispose:f};if(n.length>1){const[h,y]=R(i);d.setIndex=y,d.mapped=n(g,h)}else d.mapped=n(g);o.set(u,d),a[i]=d.mapped})}}function $n(e){const{by:t}=e;return D(ba(()=>e.each,typeof t=="function"?t:n=>n[t],e.children,"fallback"in e?{fallback:()=>e.fallback}:void 0))}function pa(e,t,n,r){return e.addEventListener(t,n,r),Bs(e.removeEventListener.bind(e,t,n,r))}function xa(e,t,n,r){const o=()=>{Hn(E(e)).forEach(s=>{s&&Hn(E(t)).forEach(a=>pa(s,a,n,r))})};typeof e=="function"?U(o):V(o)}function wa(e,t){const n=new ResizeObserver(e);return j(n.disconnect.bind(n)),{observe:r=>n.observe(r,t),unobserve:n.unobserve.bind(n)}}function jo(e,t,n){const r=new WeakMap,{observe:o,unobserve:s}=wa(a=>{for(const l of a){const{contentRect:i,target:u}=l,f=Math.round(i.width),g=Math.round(i.height),c=r.get(u);(!c||c.width!==f||c.height!==g)&&(t(i,u,l),r.set(u,{width:f,height:g}))}},n);U(a=>{const l=zs(Hn(E(e)));return Ns(l,a,o,s),l},[])}var $a=/((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;function Jr(e){const t={};let n;for(;n=$a.exec(e);)t[n[1]]=n[2];return t}function An(e,t){if(typeof e=="string"){if(typeof t=="string")return`${e};${t}`;e=Jr(e)}else typeof t=="string"&&(t=Jr(t));return{...e,...t}}function Ca(e,t,n=-1){return n in e?[...e.slice(0,n),t,...e.slice(n)]:[...e,t]}function Qn(e,t){const n=[...e],r=n.indexOf(t);return r!==-1&&n.splice(r,1),n}function Sa(e){return typeof e=="number"}function _t(e){return Object.prototype.toString.call(e)==="[object String]"}function ka(e){return typeof e=="function"}function un(e){return t=>`${e()}-${t}`}function Ke(e,t){return e?e===t||e.contains(t):!1}function en(e,t=!1){const{activeElement:n}=Ze(e);if(!(n!=null&&n.nodeName))return null;if(Wo(n)&&n.contentDocument)return en(n.contentDocument.body,t);if(t){const r=n.getAttribute("aria-activedescendant");if(r){const o=Ze(n).getElementById(r);if(o)return o}}return n}function Ea(e){return Ze(e).defaultView||window}function Ze(e){return e?e.ownerDocument||e:document}function Wo(e){return e.tagName==="IFRAME"}var ar=(e=>(e.Escape="Escape",e.Enter="Enter",e.Tab="Tab",e.Space=" ",e.ArrowDown="ArrowDown",e.ArrowLeft="ArrowLeft",e.ArrowRight="ArrowRight",e.ArrowUp="ArrowUp",e.End="End",e.Home="Home",e.PageDown="PageDown",e.PageUp="PageUp",e))(ar||{});function lr(e){var t;return typeof window<"u"&&window.navigator!=null?e.test(((t=window.navigator.userAgentData)==null?void 0:t.platform)||window.navigator.platform):!1}function Fn(){return lr(/^Mac/i)}function Da(){return lr(/^iPhone/i)}function Ma(){return lr(/^iPad/i)||Fn()&&navigator.maxTouchPoints>1}function Aa(){return Da()||Ma()}function Fa(){return Fn()||Aa()}function ce(e,t){return t&&(ka(t)?t(e):t[0](t[1],e)),e==null?void 0:e.defaultPrevented}function be(e){return t=>{for(const n of e)ce(t,n)}}function Ta(e){return Fn()?e.metaKey&&!e.ctrlKey:e.ctrlKey&&!e.metaKey}function Ee(e){if(e)if(Ia())e.focus({preventScroll:!0});else{const t=Pa(e);e.focus(),La(t)}}var bn=null;function Ia(){if(bn==null){bn=!1;try{document.createElement("div").focus({get preventScroll(){return bn=!0,!0}})}catch{}}return bn}function Pa(e){let t=e.parentNode;const n=[],r=document.scrollingElement||document.documentElement;for(;t instanceof HTMLElement&&t!==r;)(t.offsetHeight<t.scrollHeight||t.offsetWidth<t.scrollWidth)&&n.push({element:t,scrollTop:t.scrollTop,scrollLeft:t.scrollLeft}),t=t.parentNode;return r instanceof HTMLElement&&n.push({element:r,scrollTop:r.scrollTop,scrollLeft:r.scrollLeft}),n}function La(e){for(const{element:t,scrollTop:n,scrollLeft:r}of e)t.scrollTop=n,t.scrollLeft=r}var Qo=["input:not([type='hidden']):not([disabled])","select:not([disabled])","textarea:not([disabled])","button:not([disabled])","a[href]","area[href]","[tabindex]","iframe","object","embed","audio[controls]","video[controls]","[contenteditable]:not([contenteditable='false'])"],Oa=[...Qo,'[tabindex]:not([tabindex="-1"]):not([disabled])'],ur=Qo.join(":not([hidden]),")+",[tabindex]:not([disabled]):not([hidden])",qa=Oa.join(':not([hidden]):not([tabindex="-1"]),');function Yo(e,t){const r=Array.from(e.querySelectorAll(ur)).filter(eo);return t&&eo(e)&&r.unshift(e),r.forEach((o,s)=>{if(Wo(o)&&o.contentDocument){const a=o.contentDocument.body,l=Yo(a,!1);r.splice(s,1,...l)}}),r}function eo(e){return Xo(e)&&!_a(e)}function Xo(e){return e.matches(ur)&&cr(e)}function _a(e){return parseInt(e.getAttribute("tabindex")||"0",10)<0}function cr(e,t){return e.nodeName!=="#comment"&&za(e)&&Ra(e,t)&&(!e.parentElement||cr(e.parentElement,e))}function za(e){if(!(e instanceof HTMLElement)&&!(e instanceof SVGElement))return!1;const{display:t,visibility:n}=e.style;let r=t!=="none"&&n!=="hidden"&&n!=="collapse";if(r){if(!e.ownerDocument.defaultView)return r;const{getComputedStyle:o}=e.ownerDocument.defaultView,{display:s,visibility:a}=o(e);r=s!=="none"&&a!=="hidden"&&a!=="collapse"}return r}function Ra(e,t){return!e.hasAttribute("hidden")&&(e.nodeName==="DETAILS"&&t&&t.nodeName!=="SUMMARY"?e.hasAttribute("open"):!0)}function Ka(e,t,n){const r=t!=null&&t.tabbable?qa:ur,o=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode(s){var a;return(a=t==null?void 0:t.from)!=null&&a.contains(s)?NodeFilter.FILTER_REJECT:s.matches(r)&&cr(s)&&(!(t!=null&&t.accept)||t.accept(s))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});return t!=null&&t.from&&(o.currentNode=t.from),o}function to(e){for(;e&&!Ba(e);)e=e.parentElement;return e||document.scrollingElement||document.documentElement}function Ba(e){const t=window.getComputedStyle(e);return/(auto|scroll)/.test(t.overflow+t.overflowX+t.overflowY)}function Na(){}function Ua(e,t){const[n,r]=e;let o=!1;const s=t.length;for(let a=s,l=0,i=a-1;l<a;i=l++){const[u,f]=t[l],[g,c]=t[i],[,d]=t[i===0?a-1:i-1]||[0,0],h=(f-c)*(n-u)-(u-g)*(r-f);if(c<f){if(r>=c&&r<f){if(h===0)return!0;h>0&&(r===c?r>d&&(o=!o):o=!o)}}else if(f<c){if(r>f&&r<=c){if(h===0)return!0;h<0&&(r===c?r<d&&(o=!o):o=!o)}}else if(r==f&&(n>=g&&n<=u||n>=u&&n<=g))return!0}return o}function X(e,t){return W(e,t)}var Xt=new Map,no=new Set;function ro(){if(typeof window>"u")return;const e=n=>{if(!n.target)return;let r=Xt.get(n.target);r||(r=new Set,Xt.set(n.target,r),n.target.addEventListener("transitioncancel",t)),r.add(n.propertyName)},t=n=>{if(!n.target)return;const r=Xt.get(n.target);if(r&&(r.delete(n.propertyName),r.size===0&&(n.target.removeEventListener("transitioncancel",t),Xt.delete(n.target)),Xt.size===0)){for(const o of no)o();no.clear()}};document.body.addEventListener("transitionrun",e),document.body.addEventListener("transitionend",t)}typeof document<"u"&&(document.readyState!=="loading"?ro():document.addEventListener("DOMContentLoaded",ro));function Yn(e,t){const n=oo(e,t,"left"),r=oo(e,t,"top"),o=t.offsetWidth,s=t.offsetHeight;let a=e.scrollLeft,l=e.scrollTop;const i=a+e.offsetWidth,u=l+e.offsetHeight;n<=a?a=n:n+o>i&&(a+=n+o-i),r<=l?l=r:r+s>u&&(l+=r+s-u),e.scrollLeft=a,e.scrollTop=l}function oo(e,t,n){const r=n==="left"?"offsetLeft":"offsetTop";let o=0;for(;t.offsetParent&&(o+=t[r],t.offsetParent!==e);){if(t.offsetParent.contains(e)){o-=e[r];break}t=t.offsetParent}return o}function Va(e,t){var n,r;if(document.contains(e)){const o=document.scrollingElement||document.documentElement;if(window.getComputedStyle(o).overflow==="hidden"){let a=to(e);for(;e&&a&&e!==o&&a!==o;)Yn(a,e),e=a,a=to(e)}else{const{left:a,top:l}=e.getBoundingClientRect();(n=e==null?void 0:e.scrollIntoView)==null||n.call(e,{block:"nearest"});const{left:i,top:u}=e.getBoundingClientRect();(Math.abs(a-i)>1||Math.abs(l-u)>1)&&((r=e.scrollIntoView)==null||r.call(e,{block:"nearest"}))}}}var Zo={border:"0",clip:"rect(0 0 0 0)","clip-path":"inset(50%)",height:"1px",margin:"0 -1px -1px 0",overflow:"hidden",padding:"0",position:"absolute",width:"1px","white-space":"nowrap"};function Be(e){return t=>(e(t),()=>e(void 0))}function Tn(e,t){const[n,r]=R(io(t==null?void 0:t()));return U(()=>{var o;r(((o=e())==null?void 0:o.tagName.toLowerCase())||io(t==null?void 0:t()))}),n}function io(e){return _t(e)?e:void 0}function de(e){const[t,n]=oe(e,["as"]);if(!t.as)throw new Error("[kobalte]: Polymorphic is missing the required `as` prop.");return v(ws,W(n,{get component(){return t.as}}))}var Ga=["id","name","validationState","required","disabled","readOnly"];function Ha(e){const t=`form-control-${Ne()}`,n=X({id:t},e),[r,o]=R(),[s,a]=R(),[l,i]=R(),[u,f]=R(),g=(y,m,b)=>{const p=b!=null||r()!=null;return[b,r(),p&&m!=null?y:void 0].filter(Boolean).join(" ")||void 0},c=y=>[l(),u(),y].filter(Boolean).join(" ")||void 0,d=D(()=>({"data-valid":E(n.validationState)==="valid"?"":void 0,"data-invalid":E(n.validationState)==="invalid"?"":void 0,"data-required":E(n.required)?"":void 0,"data-disabled":E(n.disabled)?"":void 0,"data-readonly":E(n.readOnly)?"":void 0}));return{formControlContext:{name:()=>E(n.name)??E(n.id),dataset:d,validationState:()=>E(n.validationState),isRequired:()=>E(n.required),isDisabled:()=>E(n.disabled),isReadOnly:()=>E(n.readOnly),labelId:r,fieldId:s,descriptionId:l,errorMessageId:u,getAriaLabelledBy:g,getAriaDescribedBy:c,generateId:un(()=>E(n.id)),registerLabel:Be(o),registerField:Be(a),registerDescription:Be(i),registerErrorMessage:Be(f)}}}var Jo=we();function cn(){const e=$e(Jo);if(e===void 0)throw new Error("[kobalte]: `useFormControlContext` must be used within a `FormControlContext.Provider` component");return e}function ei(e){const t=cn(),n=X({id:t.generateId("description")},e);return U(()=>j(t.registerDescription(n.id))),v(de,W({as:"div"},()=>t.dataset(),n))}function ti(e){const t=cn(),n=X({id:t.generateId("error-message")},e),[r,o]=oe(n,["forceMount"]),s=()=>t.validationState()==="invalid";return U(()=>{s()&&j(t.registerErrorMessage(o.id))}),v(B,{get when(){return r.forceMount||s()},get children(){return v(de,W({as:"div"},()=>t.dataset(),o))}})}function ja(e){let t;const n=cn(),r=X({id:n.generateId("label")},e),[o,s]=oe(r,["ref"]),a=Tn(()=>t,()=>"label");return U(()=>j(n.registerLabel(s.id))),v(de,W({as:"label",ref(l){const i=Me(u=>t=u,o.ref);typeof i=="function"&&i(l)},get for(){return D(()=>a()==="label")()?n.fieldId():void 0}},()=>n.dataset(),s))}function Wa(e,t){U(ct(e,n=>{if(n==null)return;const r=Qa(n);r!=null&&(r.addEventListener("reset",t,{passive:!0}),j(()=>{r.removeEventListener("reset",t)}))}))}function Qa(e){return Ya(e)?e.form:e.closest("form")}function Ya(e){return e.matches("textarea, input, select, button")}function dn(e){var a;const[t,n]=R((a=e.defaultValue)==null?void 0:a.call(e)),r=D(()=>{var l;return((l=e.value)==null?void 0:l.call(e))!==void 0}),o=D(()=>{var l;return r()?(l=e.value)==null?void 0:l.call(e):t()});return[o,l=>{Kt(()=>{var u;const i=Ks(l,o());return Object.is(i,o())||(r()||n(i),(u=e.onChange)==null||u.call(e,i)),i})}]}function ni(e){const[t,n]=dn(e);return[()=>t()??!1,n]}function Xa(e){const[t,n]=dn(e);return[()=>t()??[],n]}function Za(e={}){const[t,n]=ni({value:()=>E(e.isSelected),defaultValue:()=>!!E(e.defaultIsSelected),onChange:s=>{var a;return(a=e.onSelectedChange)==null?void 0:a.call(e,s)}});return{isSelected:t,setIsSelected:s=>{!E(e.isReadOnly)&&!E(e.isDisabled)&&n(s)},toggle:()=>{!E(e.isReadOnly)&&!E(e.isDisabled)&&n(!t())}}}var Ja=Object.defineProperty,In=(e,t)=>{for(var n in t)Ja(e,n,{get:t[n],enumerable:!0})},ri=we();function oi(){return $e(ri)}function el(){const e=oi();if(e===void 0)throw new Error("[kobalte]: `useDomCollectionContext` must be used within a `DomCollectionProvider` component");return e}function ii(e,t){return!!(t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_PRECEDING)}function tl(e,t){var o;const n=t.ref();if(!n)return-1;let r=e.length;if(!r)return-1;for(;r--;){const s=(o=e[r])==null?void 0:o.ref();if(s&&ii(s,n))return r+1}return 0}function nl(e){const t=e.map((r,o)=>[o,r]);let n=!1;return t.sort(([r,o],[s,a])=>{const l=o.ref(),i=a.ref();return l===i||!l||!i?0:ii(l,i)?(r>s&&(n=!0),-1):(r<s&&(n=!0),1)}),n?t.map(([r,o])=>o):e}function si(e,t){const n=nl(e);e!==n&&t(n)}function rl(e){var o,s;const t=e[0],n=(o=e[e.length-1])==null?void 0:o.ref();let r=(s=t==null?void 0:t.ref())==null?void 0:s.parentElement;for(;r;){if(n&&r.contains(n))return r;r=r.parentElement}return Ze(r).body}function ol(e,t){U(()=>{const n=setTimeout(()=>{si(e(),t)});j(()=>clearTimeout(n))})}function il(e,t){if(typeof IntersectionObserver!="function"){ol(e,t);return}let n=[];U(()=>{const r=()=>{const a=!!n.length;n=e(),a&&si(e(),t)},o=rl(e()),s=new IntersectionObserver(r,{root:o});for(const a of e()){const l=a.ref();l&&s.observe(l)}j(()=>s.disconnect())})}function sl(e={}){const[t,n]=Xa({value:()=>E(e.items),onChange:s=>{var a;return(a=e.onItemsChange)==null?void 0:a.call(e,s)}});il(t,n);const r=s=>(n(a=>{const l=tl(a,s);return Ca(a,s,l)}),()=>{n(a=>{const l=a.filter(i=>i.ref()!==s.ref());return a.length===l.length?a:l})});return{DomCollectionProvider:s=>v(ri.Provider,{value:{registerItem:r},get children(){return s.children}})}}function al(e){const t=el(),n=X({shouldRegisterItem:!0},e);U(()=>{if(!n.shouldRegisterItem)return;const r=t.registerItem(n.getItem());j(r)})}function ai(e){let t=e.startIndex??0;const n=e.startLevel??0,r=[],o=i=>{if(i==null)return"";const u=e.getKey??"key",f=_t(u)?i[u]:u(i);return f!=null?String(f):""},s=i=>{if(i==null)return"";const u=e.getTextValue??"textValue",f=_t(u)?i[u]:u(i);return f!=null?String(f):""},a=i=>{if(i==null)return!1;const u=e.getDisabled??"disabled";return(_t(u)?i[u]:u(i))??!1},l=i=>{var u;if(i!=null)return _t(e.getSectionChildren)?i[e.getSectionChildren]:(u=e.getSectionChildren)==null?void 0:u.call(e,i)};for(const i of e.dataSource){if(_t(i)||Sa(i)){r.push({type:"item",rawValue:i,key:String(i),textValue:String(i),disabled:a(i),level:n,index:t}),t++;continue}if(l(i)!=null){r.push({type:"section",rawValue:i,key:"",textValue:"",disabled:!1,level:n,index:t}),t++;const u=l(i)??[];if(u.length>0){const f=ai({dataSource:u,getKey:e.getKey,getTextValue:e.getTextValue,getDisabled:e.getDisabled,getSectionChildren:e.getSectionChildren,startIndex:t,startLevel:n+1});r.push(...f),t+=f.length}}else r.push({type:"item",rawValue:i,key:o(i),textValue:s(i),disabled:a(i),level:n,index:t}),t++}return r}function ll(e,t=[]){return D(()=>{const n=ai({dataSource:E(e.dataSource),getKey:E(e.getKey),getTextValue:E(e.getTextValue),getDisabled:E(e.getDisabled),getSectionChildren:E(e.getSectionChildren)});for(let r=0;r<t.length;r++)t[r]();return e.factory(n)})}var ul=new Set(["Avst","Arab","Armi","Syrc","Samr","Mand","Thaa","Mend","Nkoo","Adlm","Rohg","Hebr"]),cl=new Set(["ae","ar","arc","bcc","bqi","ckb","dv","fa","glk","he","ku","mzn","nqo","pnb","ps","sd","ug","ur","yi"]);function dl(e){if(Intl.Locale){const n=new Intl.Locale(e).maximize().script??"";return ul.has(n)}const t=e.split("-")[0];return cl.has(t)}function fl(e){return dl(e)?"rtl":"ltr"}function li(){let e=typeof navigator<"u"&&(navigator.language||navigator.userLanguage)||"en-US";return{locale:e,direction:fl(e)}}var Xn=li(),tn=new Set;function so(){Xn=li();for(const e of tn)e(Xn)}function gl(){const[e,t]=R(Xn),n=D(()=>e());return Ft(()=>{tn.size===0&&window.addEventListener("languagechange",so),tn.add(t),j(()=>{tn.delete(t),tn.size===0&&window.removeEventListener("languagechange",so)})}),{locale:()=>n().locale,direction:()=>n().direction}}var hl=we();function $t(){const e=gl();return $e(hl)||e}var Kn=new Map;function yl(e){const{locale:t}=$t(),n=D(()=>t()+Object.entries(e).sort((r,o)=>r[0]<o[0]?-1:1).join());return D(()=>{const r=n();let o;return Kn.has(r)&&(o=Kn.get(r)),o||(o=new Intl.Collator(t(),e),Kn.set(r,o)),o})}var lt=class ui extends Set{constructor(n,r,o){super(n);qe(this,"anchorKey");qe(this,"currentKey");n instanceof ui?(this.anchorKey=r||n.anchorKey,this.currentKey=o||n.currentKey):(this.anchorKey=r,this.currentKey=o)}};function ml(e){const[t,n]=dn(e);return[()=>t()??new lt,n]}function ci(e){return Fa()?e.altKey:e.ctrlKey}function zt(e){return Fn()?e.metaKey:e.ctrlKey}function ao(e){return new lt(e)}function vl(e,t){if(e.size!==t.size)return!1;for(const n of e)if(!t.has(n))return!1;return!0}function bl(e){const t=X({selectionMode:"none",selectionBehavior:"toggle"},e),[n,r]=R(!1),[o,s]=R(),a=D(()=>{const y=E(t.selectedKeys);return y!=null?ao(y):y}),l=D(()=>{const y=E(t.defaultSelectedKeys);return y!=null?ao(y):new lt}),[i,u]=ml({value:a,defaultValue:l,onChange:y=>{var m;return(m=t.onSelectionChange)==null?void 0:m.call(t,y)}}),[f,g]=R(E(t.selectionBehavior)),c=()=>E(t.selectionMode),d=()=>E(t.disallowEmptySelection)??!1,h=y=>{(E(t.allowDuplicateSelectionEvents)||!vl(y,i()))&&u(y)};return U(()=>{const y=i();E(t.selectionBehavior)==="replace"&&f()==="toggle"&&typeof y=="object"&&y.size===0&&g("replace")}),U(()=>{g(E(t.selectionBehavior)??"toggle")}),{selectionMode:c,disallowEmptySelection:d,selectionBehavior:f,setSelectionBehavior:g,isFocused:n,setFocused:r,focusedKey:o,setFocusedKey:s,selectedKeys:i,setSelectedKeys:h}}function pl(e){const[t,n]=R(""),[r,o]=R(-1);return{typeSelectHandlers:{onKeyDown:a=>{var c;if(E(e.isDisabled))return;const l=E(e.keyboardDelegate),i=E(e.selectionManager);if(!l.getKeyForSearch)return;const u=xl(a.key);if(!u||a.ctrlKey||a.metaKey)return;u===" "&&t().trim().length>0&&(a.preventDefault(),a.stopPropagation());let f=n(d=>d+u),g=l.getKeyForSearch(f,i.focusedKey())??l.getKeyForSearch(f);g==null&&wl(f)&&(f=f[0],g=l.getKeyForSearch(f,i.focusedKey())??l.getKeyForSearch(f)),g!=null&&(i.setFocusedKey(g),(c=e.onTypeSelect)==null||c.call(e,g)),clearTimeout(r()),o(window.setTimeout(()=>n(""),500))}}}}function xl(e){return e.length===1||!/^[A-Z]/i.test(e)?e:""}function wl(e){return e.split("").every(t=>t===e[0])}function $l(e,t,n){const o=W({selectOnFocus:()=>E(e.selectionManager).selectionBehavior()==="replace"},e),s=()=>t(),{direction:a}=$t();let l={top:0,left:0};xa(()=>E(o.isVirtualized)?void 0:s(),"scroll",()=>{const m=s();m&&(l={top:m.scrollTop,left:m.scrollLeft})});const{typeSelectHandlers:i}=pl({isDisabled:()=>E(o.disallowTypeAhead),keyboardDelegate:()=>E(o.keyboardDelegate),selectionManager:()=>E(o.selectionManager)}),u=()=>E(o.orientation)??"vertical",f=m=>{var _,C,I,N,G,te,Z,ie;ce(m,i.onKeyDown),m.altKey&&m.key==="Tab"&&m.preventDefault();const b=t();if(!(b!=null&&b.contains(m.target)))return;const p=E(o.selectionManager),x=E(o.selectOnFocus),w=z=>{z!=null&&(p.setFocusedKey(z),m.shiftKey&&p.selectionMode()==="multiple"?p.extendSelection(z):x&&!ci(m)&&p.replaceSelection(z))},$=E(o.keyboardDelegate),O=E(o.shouldFocusWrap),T=p.focusedKey();switch(m.key){case(u()==="vertical"?"ArrowDown":"ArrowRight"):{if($.getKeyBelow){m.preventDefault();let z;T!=null?z=$.getKeyBelow(T):z=(_=$.getFirstKey)==null?void 0:_.call($),z==null&&O&&(z=(C=$.getFirstKey)==null?void 0:C.call($,T)),w(z)}break}case(u()==="vertical"?"ArrowUp":"ArrowLeft"):{if($.getKeyAbove){m.preventDefault();let z;T!=null?z=$.getKeyAbove(T):z=(I=$.getLastKey)==null?void 0:I.call($),z==null&&O&&(z=(N=$.getLastKey)==null?void 0:N.call($,T)),w(z)}break}case(u()==="vertical"?"ArrowLeft":"ArrowUp"):{if($.getKeyLeftOf){m.preventDefault();const z=a()==="rtl";let Q;T!=null?Q=$.getKeyLeftOf(T):Q=z?(G=$.getFirstKey)==null?void 0:G.call($):(te=$.getLastKey)==null?void 0:te.call($),w(Q)}break}case(u()==="vertical"?"ArrowRight":"ArrowDown"):{if($.getKeyRightOf){m.preventDefault();const z=a()==="rtl";let Q;T!=null?Q=$.getKeyRightOf(T):Q=z?(Z=$.getLastKey)==null?void 0:Z.call($):(ie=$.getFirstKey)==null?void 0:ie.call($),w(Q)}break}case"Home":if($.getFirstKey){m.preventDefault();const z=$.getFirstKey(T,zt(m));z!=null&&(p.setFocusedKey(z),zt(m)&&m.shiftKey&&p.selectionMode()==="multiple"?p.extendSelection(z):x&&p.replaceSelection(z))}break;case"End":if($.getLastKey){m.preventDefault();const z=$.getLastKey(T,zt(m));z!=null&&(p.setFocusedKey(z),zt(m)&&m.shiftKey&&p.selectionMode()==="multiple"?p.extendSelection(z):x&&p.replaceSelection(z))}break;case"PageDown":if($.getKeyPageBelow&&T!=null){m.preventDefault();const z=$.getKeyPageBelow(T);w(z)}break;case"PageUp":if($.getKeyPageAbove&&T!=null){m.preventDefault();const z=$.getKeyPageAbove(T);w(z)}break;case"a":zt(m)&&p.selectionMode()==="multiple"&&E(o.disallowSelectAll)!==!0&&(m.preventDefault(),p.selectAll());break;case"Escape":m.defaultPrevented||(m.preventDefault(),E(o.disallowEmptySelection)||p.clearSelection());break;case"Tab":if(!E(o.allowsTabNavigation)){if(m.shiftKey)b.focus();else{const z=Ka(b,{tabbable:!0});let Q,J;do J=z.lastChild(),J&&(Q=J);while(J);Q&&!Q.contains(document.activeElement)&&Ee(Q)}break}}},g=m=>{var w,$;const b=E(o.selectionManager),p=E(o.keyboardDelegate),x=E(o.selectOnFocus);if(b.isFocused()){m.currentTarget.contains(m.target)||b.setFocused(!1);return}if(m.currentTarget.contains(m.target)){if(b.setFocused(!0),b.focusedKey()==null){const O=_=>{_!=null&&(b.setFocusedKey(_),x&&b.replaceSelection(_))},T=m.relatedTarget;T&&m.currentTarget.compareDocumentPosition(T)&Node.DOCUMENT_POSITION_FOLLOWING?O(b.lastSelectedKey()??((w=p.getLastKey)==null?void 0:w.call(p))):O(b.firstSelectedKey()??(($=p.getFirstKey)==null?void 0:$.call(p)))}else if(!E(o.isVirtualized)){const O=s();if(O){O.scrollTop=l.top,O.scrollLeft=l.left;const T=O.querySelector(`[data-key="${b.focusedKey()}"]`);T&&(Ee(T),Yn(O,T))}}}},c=m=>{const b=E(o.selectionManager);m.currentTarget.contains(m.relatedTarget)||b.setFocused(!1)},d=m=>{s()===m.target&&m.preventDefault()},h=()=>{var O,T;const m=E(o.autoFocus);if(!m)return;const b=E(o.selectionManager),p=E(o.keyboardDelegate);let x;m==="first"&&(x=(O=p.getFirstKey)==null?void 0:O.call(p)),m==="last"&&(x=(T=p.getLastKey)==null?void 0:T.call(p));const w=b.selectedKeys();w.size&&(x=w.values().next().value),b.setFocused(!0),b.setFocusedKey(x);const $=t();$&&x==null&&!E(o.shouldUseVirtualFocus)&&Ee($)};return Ft(()=>{o.deferAutoFocus?setTimeout(h,0):h()}),U(ct([s,()=>E(o.isVirtualized),()=>E(o.selectionManager).focusedKey()],m=>{var w;const[b,p,x]=m;if(p)x&&((w=o.scrollToKey)==null||w.call(o,x));else if(x&&b){const $=b.querySelector(`[data-key="${x}"]`);$&&Yn(b,$)}})),{tabIndex:D(()=>{if(!E(o.shouldUseVirtualFocus))return E(o.selectionManager).focusedKey()==null?0:-1}),onKeyDown:f,onMouseDown:d,onFocusIn:g,onFocusOut:c}}function di(e,t){const n=()=>E(e.selectionManager),r=()=>E(e.key),o=()=>E(e.shouldUseVirtualFocus),s=p=>{n().selectionMode()!=="none"&&(n().selectionMode()==="single"?n().isSelected(r())&&!n().disallowEmptySelection()?n().toggleSelection(r()):n().replaceSelection(r()):p!=null&&p.shiftKey?n().extendSelection(r()):n().selectionBehavior()==="toggle"||zt(p)||"pointerType"in p&&p.pointerType==="touch"?n().toggleSelection(r()):n().replaceSelection(r()))},a=()=>n().isSelected(r()),l=()=>E(e.disabled)||n().isDisabled(r()),i=()=>!l()&&n().canSelectItem(r());let u=null;const f=p=>{i()&&(u=p.pointerType,p.pointerType==="mouse"&&p.button===0&&!E(e.shouldSelectOnPressUp)&&s(p))},g=p=>{i()&&p.pointerType==="mouse"&&p.button===0&&E(e.shouldSelectOnPressUp)&&E(e.allowsDifferentPressOrigin)&&s(p)},c=p=>{i()&&(E(e.shouldSelectOnPressUp)&&!E(e.allowsDifferentPressOrigin)||u!=="mouse")&&s(p)},d=p=>{!i()||!["Enter"," "].includes(p.key)||(ci(p)?n().toggleSelection(r()):s(p))},h=p=>{l()&&p.preventDefault()},y=p=>{const x=t();o()||l()||!x||p.target===x&&n().setFocusedKey(r())},m=D(()=>{if(!(o()||l()))return r()===n().focusedKey()?0:-1}),b=D(()=>E(e.virtualized)?void 0:r());return U(ct([t,r,o,()=>n().focusedKey(),()=>n().isFocused()],([p,x,w,$,O])=>{p&&x===$&&O&&!w&&document.activeElement!==p&&(e.focus?e.focus():Ee(p))})),{isSelected:a,isDisabled:l,allowsSelection:i,tabIndex:m,dataKey:b,onPointerDown:f,onPointerUp:g,onClick:c,onKeyDown:d,onMouseDown:h,onFocus:y}}var Cl=class{constructor(e,t){qe(this,"collection");qe(this,"state");this.collection=e,this.state=t}selectionMode(){return this.state.selectionMode()}disallowEmptySelection(){return this.state.disallowEmptySelection()}selectionBehavior(){return this.state.selectionBehavior()}setSelectionBehavior(e){this.state.setSelectionBehavior(e)}isFocused(){return this.state.isFocused()}setFocused(e){this.state.setFocused(e)}focusedKey(){return this.state.focusedKey()}setFocusedKey(e){(e==null||this.collection().getItem(e))&&this.state.setFocusedKey(e)}selectedKeys(){return this.state.selectedKeys()}isSelected(e){if(this.state.selectionMode()==="none")return!1;const t=this.getKey(e);return t==null?!1:this.state.selectedKeys().has(t)}isEmpty(){return this.state.selectedKeys().size===0}isSelectAll(){if(this.isEmpty())return!1;const e=this.state.selectedKeys();return this.getAllSelectableKeys().every(t=>e.has(t))}firstSelectedKey(){let e;for(const t of this.state.selectedKeys()){const n=this.collection().getItem(t),r=(n==null?void 0:n.index)!=null&&(e==null?void 0:e.index)!=null&&n.index<e.index;(!e||r)&&(e=n)}return e==null?void 0:e.key}lastSelectedKey(){let e;for(const t of this.state.selectedKeys()){const n=this.collection().getItem(t),r=(n==null?void 0:n.index)!=null&&(e==null?void 0:e.index)!=null&&n.index>e.index;(!e||r)&&(e=n)}return e==null?void 0:e.key}extendSelection(e){if(this.selectionMode()==="none")return;if(this.selectionMode()==="single"){this.replaceSelection(e);return}const t=this.getKey(e);if(t==null)return;const n=this.state.selectedKeys(),r=n.anchorKey||t,o=new lt(n,r,t);for(const s of this.getKeyRange(r,n.currentKey||t))o.delete(s);for(const s of this.getKeyRange(t,r))this.canSelectItem(s)&&o.add(s);this.state.setSelectedKeys(o)}getKeyRange(e,t){const n=this.collection().getItem(e),r=this.collection().getItem(t);return n&&r?n.index!=null&&r.index!=null&&n.index<=r.index?this.getKeyRangeInternal(e,t):this.getKeyRangeInternal(t,e):[]}getKeyRangeInternal(e,t){const n=[];let r=e;for(;r!=null;){const o=this.collection().getItem(r);if(o&&o.type==="item"&&n.push(r),r===t)return n;r=this.collection().getKeyAfter(r)}return[]}getKey(e){const t=this.collection().getItem(e);return t?!t||t.type!=="item"?null:t.key:e}toggleSelection(e){if(this.selectionMode()==="none")return;if(this.selectionMode()==="single"&&!this.isSelected(e)){this.replaceSelection(e);return}const t=this.getKey(e);if(t==null)return;const n=new lt(this.state.selectedKeys());n.has(t)?n.delete(t):this.canSelectItem(t)&&(n.add(t),n.anchorKey=t,n.currentKey=t),!(this.disallowEmptySelection()&&n.size===0)&&this.state.setSelectedKeys(n)}replaceSelection(e){if(this.selectionMode()==="none")return;const t=this.getKey(e);if(t==null)return;const n=this.canSelectItem(t)?new lt([t],t,t):new lt;this.state.setSelectedKeys(n)}setSelectedKeys(e){if(this.selectionMode()==="none")return;const t=new lt;for(const n of e){const r=this.getKey(n);if(r!=null&&(t.add(r),this.selectionMode()==="single"))break}this.state.setSelectedKeys(t)}selectAll(){this.selectionMode()==="multiple"&&this.state.setSelectedKeys(new Set(this.getAllSelectableKeys()))}clearSelection(){const e=this.state.selectedKeys();!this.disallowEmptySelection()&&e.size>0&&this.state.setSelectedKeys(new lt)}toggleSelectAll(){this.isSelectAll()?this.clearSelection():this.selectAll()}select(e,t){this.selectionMode()!=="none"&&(this.selectionMode()==="single"?this.isSelected(e)&&!this.disallowEmptySelection()?this.toggleSelection(e):this.replaceSelection(e):this.selectionBehavior()==="toggle"||t&&t.pointerType==="touch"?this.toggleSelection(e):this.replaceSelection(e))}isSelectionEqual(e){if(e===this.state.selectedKeys())return!0;const t=this.selectedKeys();if(e.size!==t.size)return!1;for(const n of e)if(!t.has(n))return!1;for(const n of t)if(!e.has(n))return!1;return!0}canSelectItem(e){if(this.state.selectionMode()==="none")return!1;const t=this.collection().getItem(e);return t!=null&&!t.disabled}isDisabled(e){const t=this.collection().getItem(e);return!t||t.disabled}getAllSelectableKeys(){const e=[];return(n=>{for(;n!=null;){if(this.canSelectItem(n)){const r=this.collection().getItem(n);if(!r)continue;r.type==="item"&&e.push(n)}n=this.collection().getKeyAfter(n)}})(this.collection().getFirstKey()),e}},lo=class{constructor(e){qe(this,"keyMap",new Map);qe(this,"iterable");qe(this,"firstKey");qe(this,"lastKey");this.iterable=e;for(const r of e)this.keyMap.set(r.key,r);if(this.keyMap.size===0)return;let t,n=0;for(const[r,o]of this.keyMap)t?(t.nextKey=r,o.prevKey=t.key):(this.firstKey=r,o.prevKey=void 0),o.type==="item"&&(o.index=n++),t=o,t.nextKey=void 0;this.lastKey=t.key}*[Symbol.iterator](){yield*this.iterable}getSize(){return this.keyMap.size}getKeys(){return this.keyMap.keys()}getKeyBefore(e){var t;return(t=this.keyMap.get(e))==null?void 0:t.prevKey}getKeyAfter(e){var t;return(t=this.keyMap.get(e))==null?void 0:t.nextKey}getFirstKey(){return this.firstKey}getLastKey(){return this.lastKey}getItem(e){return this.keyMap.get(e)}at(e){const t=[...this.getKeys()];return this.getItem(t[e])}};function Sl(e){const t=bl(e),r=ll({dataSource:()=>E(e.dataSource),getKey:()=>E(e.getKey),getTextValue:()=>E(e.getTextValue),getDisabled:()=>E(e.getDisabled),getSectionChildren:()=>E(e.getSectionChildren),factory:s=>e.filter?new lo(e.filter(s)):new lo(s)},[()=>e.filter]),o=new Cl(r,t);return Ms(()=>{const s=t.focusedKey();s!=null&&!r().getItem(s)&&t.setFocusedKey(void 0)}),{collection:r,selectionManager:()=>o}}var ke=e=>typeof e=="function"?e():e,kl=e=>{const t=D(()=>{const a=ke(e.element);if(a)return getComputedStyle(a)}),n=()=>{var a;return((a=t())==null?void 0:a.animationName)??"none"},[r,o]=R(ke(e.show)?"present":"hidden");let s="none";return U(a=>{const l=ke(e.show);return Kt(()=>{var f;if(a===l)return l;const i=s,u=n();l?o("present"):u==="none"||((f=t())==null?void 0:f.display)==="none"?o("hidden"):o(a===!0&&i!==u?"hiding":"hidden")}),l}),U(()=>{const a=ke(e.element);if(!a)return;const l=u=>{u.target===a&&(s=n())},i=u=>{const g=n().includes(u.animationName);u.target===a&&g&&r()==="hiding"&&o("hidden")};a.addEventListener("animationstart",l),a.addEventListener("animationcancel",i),a.addEventListener("animationend",i),j(()=>{a.removeEventListener("animationstart",l),a.removeEventListener("animationcancel",i),a.removeEventListener("animationend",i)})}),{present:()=>r()==="present"||r()==="hiding",state:r}},El=kl,fi=El,Cn="data-kb-top-layer",gi,Zn=!1,dt=[];function rn(e){return dt.findIndex(t=>t.node===e)}function Dl(e){return dt[rn(e)]}function Ml(e){return dt[dt.length-1].node===e}function hi(){return dt.filter(e=>e.isPointerBlocking)}function Al(){return[...hi()].slice(-1)[0]}function dr(){return hi().length>0}function yi(e){var n;const t=rn((n=Al())==null?void 0:n.node);return rn(e)<t}function Fl(e){dt.push(e)}function Tl(e){const t=rn(e);t<0||dt.splice(t,1)}function Il(){for(const{node:e}of dt)e.style.pointerEvents=yi(e)?"none":"auto"}function Pl(e){if(dr()&&!Zn){const t=Ze(e);gi=document.body.style.pointerEvents,t.body.style.pointerEvents="none",Zn=!0}}function Ll(e){if(dr())return;const t=Ze(e);t.body.style.pointerEvents=gi,t.body.style.length===0&&t.body.removeAttribute("style"),Zn=!1}var Te={layers:dt,isTopMostLayer:Ml,hasPointerBlockingLayer:dr,isBelowPointerBlockingLayer:yi,addLayer:Fl,removeLayer:Tl,indexOf:rn,find:Dl,assignPointerEventToLayers:Il,disableBodyPointerEvents:Pl,restoreBodyPointerEvents:Ll},Ol={};In(Ol,{Button:()=>zl,Root:()=>fr});var ql=["button","color","file","image","reset","submit"];function _l(e){const t=e.tagName.toLowerCase();return t==="button"?!0:t==="input"&&e.type?ql.indexOf(e.type)!==-1:!1}function fr(e){let t;const n=X({type:"button"},e),[r,o]=oe(n,["ref","type","disabled"]),s=Tn(()=>t,()=>"button"),a=D(()=>{const u=s();return u==null?!1:_l({tagName:u,type:r.type})}),l=D(()=>s()==="input"),i=D(()=>s()==="a"&&(t==null?void 0:t.getAttribute("href"))!=null);return v(de,W({as:"button",ref(u){const f=Me(g=>t=g,r.ref);typeof f=="function"&&f(u)},get type(){return a()||l()?r.type:void 0},get role(){return!a()&&!i()?"button":void 0},get tabIndex(){return!a()&&!i()&&!r.disabled?0:void 0},get disabled(){return a()||l()?r.disabled:void 0},get"aria-disabled"(){return!a()&&!l()&&r.disabled?!0:void 0},get"data-disabled"(){return r.disabled?"":void 0}},o))}var zl=fr,Rl=["top","right","bottom","left"],Xe=Math.min,Pe=Math.max,Sn=Math.round,pn=Math.floor,pt=e=>({x:e,y:e}),Kl={left:"right",right:"left",bottom:"top",top:"bottom"},Bl={start:"end",end:"start"};function Jn(e,t,n){return Pe(e,Xe(t,n))}function Tt(e,t){return typeof e=="function"?e(t):e}function xt(e){return e.split("-")[0]}function Ut(e){return e.split("-")[1]}function mi(e){return e==="x"?"y":"x"}function gr(e){return e==="y"?"height":"width"}function Mt(e){return["top","bottom"].includes(xt(e))?"y":"x"}function hr(e){return mi(Mt(e))}function Nl(e,t,n){n===void 0&&(n=!1);const r=Ut(e),o=hr(e),s=gr(o);let a=o==="x"?r===(n?"end":"start")?"right":"left":r==="start"?"bottom":"top";return t.reference[s]>t.floating[s]&&(a=kn(a)),[a,kn(a)]}function Ul(e){const t=kn(e);return[er(e),t,er(t)]}function er(e){return e.replace(/start|end/g,t=>Bl[t])}function Vl(e,t,n){const r=["left","right"],o=["right","left"],s=["top","bottom"],a=["bottom","top"];switch(e){case"top":case"bottom":return n?t?o:r:t?r:o;case"left":case"right":return t?s:a;default:return[]}}function Gl(e,t,n,r){const o=Ut(e);let s=Vl(xt(e),n==="start",r);return o&&(s=s.map(a=>a+"-"+o),t&&(s=s.concat(s.map(er)))),s}function kn(e){return e.replace(/left|right|bottom|top/g,t=>Kl[t])}function Hl(e){return{top:0,right:0,bottom:0,left:0,...e}}function vi(e){return typeof e!="number"?Hl(e):{top:e,right:e,bottom:e,left:e}}function En(e){const{x:t,y:n,width:r,height:o}=e;return{width:r,height:o,top:n,left:t,right:t+r,bottom:n+o,x:t,y:n}}function uo(e,t,n){let{reference:r,floating:o}=e;const s=Mt(t),a=hr(t),l=gr(a),i=xt(t),u=s==="y",f=r.x+r.width/2-o.width/2,g=r.y+r.height/2-o.height/2,c=r[l]/2-o[l]/2;let d;switch(i){case"top":d={x:f,y:r.y-o.height};break;case"bottom":d={x:f,y:r.y+r.height};break;case"right":d={x:r.x+r.width,y:g};break;case"left":d={x:r.x-o.width,y:g};break;default:d={x:r.x,y:r.y}}switch(Ut(t)){case"start":d[a]-=c*(n&&u?-1:1);break;case"end":d[a]+=c*(n&&u?-1:1);break}return d}var jl=async(e,t,n)=>{const{placement:r="bottom",strategy:o="absolute",middleware:s=[],platform:a}=n,l=s.filter(Boolean),i=await(a.isRTL==null?void 0:a.isRTL(t));let u=await a.getElementRects({reference:e,floating:t,strategy:o}),{x:f,y:g}=uo(u,r,i),c=r,d={},h=0;for(let y=0;y<l.length;y++){const{name:m,fn:b}=l[y],{x:p,y:x,data:w,reset:$}=await b({x:f,y:g,initialPlacement:r,placement:c,strategy:o,middlewareData:d,rects:u,platform:a,elements:{reference:e,floating:t}});f=p??f,g=x??g,d={...d,[m]:{...d[m],...w}},$&&h<=50&&(h++,typeof $=="object"&&($.placement&&(c=$.placement),$.rects&&(u=$.rects===!0?await a.getElementRects({reference:e,floating:t,strategy:o}):$.rects),{x:f,y:g}=uo(u,c,i)),y=-1)}return{x:f,y:g,placement:c,strategy:o,middlewareData:d}};async function on(e,t){var n;t===void 0&&(t={});const{x:r,y:o,platform:s,rects:a,elements:l,strategy:i}=e,{boundary:u="clippingAncestors",rootBoundary:f="viewport",elementContext:g="floating",altBoundary:c=!1,padding:d=0}=Tt(t,e),h=vi(d),m=l[c?g==="floating"?"reference":"floating":g],b=En(await s.getClippingRect({element:(n=await(s.isElement==null?void 0:s.isElement(m)))==null||n?m:m.contextElement||await(s.getDocumentElement==null?void 0:s.getDocumentElement(l.floating)),boundary:u,rootBoundary:f,strategy:i})),p=g==="floating"?{x:r,y:o,width:a.floating.width,height:a.floating.height}:a.reference,x=await(s.getOffsetParent==null?void 0:s.getOffsetParent(l.floating)),w=await(s.isElement==null?void 0:s.isElement(x))?await(s.getScale==null?void 0:s.getScale(x))||{x:1,y:1}:{x:1,y:1},$=En(s.convertOffsetParentRelativeRectToViewportRelativeRect?await s.convertOffsetParentRelativeRectToViewportRelativeRect({elements:l,rect:p,offsetParent:x,strategy:i}):p);return{top:(b.top-$.top+h.top)/w.y,bottom:($.bottom-b.bottom+h.bottom)/w.y,left:(b.left-$.left+h.left)/w.x,right:($.right-b.right+h.right)/w.x}}var Wl=e=>({name:"arrow",options:e,async fn(t){const{x:n,y:r,placement:o,rects:s,platform:a,elements:l,middlewareData:i}=t,{element:u,padding:f=0}=Tt(e,t)||{};if(u==null)return{};const g=vi(f),c={x:n,y:r},d=hr(o),h=gr(d),y=await a.getDimensions(u),m=d==="y",b=m?"top":"left",p=m?"bottom":"right",x=m?"clientHeight":"clientWidth",w=s.reference[h]+s.reference[d]-c[d]-s.floating[h],$=c[d]-s.reference[d],O=await(a.getOffsetParent==null?void 0:a.getOffsetParent(u));let T=O?O[x]:0;(!T||!await(a.isElement==null?void 0:a.isElement(O)))&&(T=l.floating[x]||s.floating[h]);const _=w/2-$/2,C=T/2-y[h]/2-1,I=Xe(g[b],C),N=Xe(g[p],C),G=I,te=T-y[h]-N,Z=T/2-y[h]/2+_,ie=Jn(G,Z,te),z=!i.arrow&&Ut(o)!=null&&Z!==ie&&s.reference[h]/2-(Z<G?I:N)-y[h]/2<0,Q=z?Z<G?Z-G:Z-te:0;return{[d]:c[d]+Q,data:{[d]:ie,centerOffset:Z-ie-Q,...z&&{alignmentOffset:Q}},reset:z}}}),Ql=function(e){return e===void 0&&(e={}),{name:"flip",options:e,async fn(t){var n,r;const{placement:o,middlewareData:s,rects:a,initialPlacement:l,platform:i,elements:u}=t,{mainAxis:f=!0,crossAxis:g=!0,fallbackPlacements:c,fallbackStrategy:d="bestFit",fallbackAxisSideDirection:h="none",flipAlignment:y=!0,...m}=Tt(e,t);if((n=s.arrow)!=null&&n.alignmentOffset)return{};const b=xt(o),p=Mt(l),x=xt(l)===l,w=await(i.isRTL==null?void 0:i.isRTL(u.floating)),$=c||(x||!y?[kn(l)]:Ul(l)),O=h!=="none";!c&&O&&$.push(...Gl(l,y,h,w));const T=[l,...$],_=await on(t,m),C=[];let I=((r=s.flip)==null?void 0:r.overflows)||[];if(f&&C.push(_[b]),g){const Z=Nl(o,a,w);C.push(_[Z[0]],_[Z[1]])}if(I=[...I,{placement:o,overflows:C}],!C.every(Z=>Z<=0)){var N,G;const Z=(((N=s.flip)==null?void 0:N.index)||0)+1,ie=T[Z];if(ie)return{data:{index:Z,overflows:I},reset:{placement:ie}};let z=(G=I.filter(Q=>Q.overflows[0]<=0).sort((Q,J)=>Q.overflows[1]-J.overflows[1])[0])==null?void 0:G.placement;if(!z)switch(d){case"bestFit":{var te;const Q=(te=I.filter(J=>{if(O){const le=Mt(J.placement);return le===p||le==="y"}return!0}).map(J=>[J.placement,J.overflows.filter(le=>le>0).reduce((le,ye)=>le+ye,0)]).sort((J,le)=>J[1]-le[1])[0])==null?void 0:te[0];Q&&(z=Q);break}case"initialPlacement":z=l;break}if(o!==z)return{reset:{placement:z}}}return{}}}};function co(e,t){return{top:e.top-t.height,right:e.right-t.width,bottom:e.bottom-t.height,left:e.left-t.width}}function fo(e){return Rl.some(t=>e[t]>=0)}var Yl=function(e){return e===void 0&&(e={}),{name:"hide",options:e,async fn(t){const{rects:n}=t,{strategy:r="referenceHidden",...o}=Tt(e,t);switch(r){case"referenceHidden":{const s=await on(t,{...o,elementContext:"reference"}),a=co(s,n.reference);return{data:{referenceHiddenOffsets:a,referenceHidden:fo(a)}}}case"escaped":{const s=await on(t,{...o,altBoundary:!0}),a=co(s,n.floating);return{data:{escapedOffsets:a,escaped:fo(a)}}}default:return{}}}}};async function Xl(e,t){const{placement:n,platform:r,elements:o}=e,s=await(r.isRTL==null?void 0:r.isRTL(o.floating)),a=xt(n),l=Ut(n),i=Mt(n)==="y",u=["left","top"].includes(a)?-1:1,f=s&&i?-1:1,g=Tt(t,e);let{mainAxis:c,crossAxis:d,alignmentAxis:h}=typeof g=="number"?{mainAxis:g,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...g};return l&&typeof h=="number"&&(d=l==="end"?h*-1:h),i?{x:d*f,y:c*u}:{x:c*u,y:d*f}}var Zl=function(e){return e===void 0&&(e=0),{name:"offset",options:e,async fn(t){var n,r;const{x:o,y:s,placement:a,middlewareData:l}=t,i=await Xl(t,e);return a===((n=l.offset)==null?void 0:n.placement)&&(r=l.arrow)!=null&&r.alignmentOffset?{}:{x:o+i.x,y:s+i.y,data:{...i,placement:a}}}}},Jl=function(e){return e===void 0&&(e={}),{name:"shift",options:e,async fn(t){const{x:n,y:r,placement:o}=t,{mainAxis:s=!0,crossAxis:a=!1,limiter:l={fn:m=>{let{x:b,y:p}=m;return{x:b,y:p}}},...i}=Tt(e,t),u={x:n,y:r},f=await on(t,i),g=Mt(xt(o)),c=mi(g);let d=u[c],h=u[g];if(s){const m=c==="y"?"top":"left",b=c==="y"?"bottom":"right",p=d+f[m],x=d-f[b];d=Jn(p,d,x)}if(a){const m=g==="y"?"top":"left",b=g==="y"?"bottom":"right",p=h+f[m],x=h-f[b];h=Jn(p,h,x)}const y=l.fn({...t,[c]:d,[g]:h});return{...y,data:{x:y.x-n,y:y.y-r}}}}},eu=function(e){return e===void 0&&(e={}),{name:"size",options:e,async fn(t){const{placement:n,rects:r,platform:o,elements:s}=t,{apply:a=()=>{},...l}=Tt(e,t),i=await on(t,l),u=xt(n),f=Ut(n),g=Mt(n)==="y",{width:c,height:d}=r.floating;let h,y;u==="top"||u==="bottom"?(h=u,y=f===(await(o.isRTL==null?void 0:o.isRTL(s.floating))?"start":"end")?"left":"right"):(y=u,h=f==="end"?"top":"bottom");const m=d-i.top-i.bottom,b=c-i.left-i.right,p=Xe(d-i[h],m),x=Xe(c-i[y],b),w=!t.middlewareData.shift;let $=p,O=x;if(g?O=f||w?Xe(x,b):b:$=f||w?Xe(p,m):m,w&&!f){const _=Pe(i.left,0),C=Pe(i.right,0),I=Pe(i.top,0),N=Pe(i.bottom,0);g?O=c-2*(_!==0||C!==0?_+C:Pe(i.left,i.right)):$=d-2*(I!==0||N!==0?I+N:Pe(i.top,i.bottom))}await a({...t,availableWidth:O,availableHeight:$});const T=await o.getDimensions(s.floating);return c!==T.width||d!==T.height?{reset:{rects:!0}}:{}}}};function Vt(e){return bi(e)?(e.nodeName||"").toLowerCase():"#document"}function Le(e){var t;return(e==null||(t=e.ownerDocument)==null?void 0:t.defaultView)||window}function ft(e){var t;return(t=(bi(e)?e.ownerDocument:e.document)||window.document)==null?void 0:t.documentElement}function bi(e){return e instanceof Node||e instanceof Le(e).Node}function We(e){return e instanceof Element||e instanceof Le(e).Element}function Je(e){return e instanceof HTMLElement||e instanceof Le(e).HTMLElement}function go(e){return typeof ShadowRoot>"u"?!1:e instanceof ShadowRoot||e instanceof Le(e).ShadowRoot}function fn(e){const{overflow:t,overflowX:n,overflowY:r,display:o}=Qe(e);return/auto|scroll|overlay|hidden|clip/.test(t+r+n)&&!["inline","contents"].includes(o)}function tu(e){return["table","td","th"].includes(Vt(e))}function Pn(e){return[":popover-open",":modal"].some(t=>{try{return e.matches(t)}catch{return!1}})}function yr(e){const t=mr(),n=We(e)?Qe(e):e;return n.transform!=="none"||n.perspective!=="none"||(n.containerType?n.containerType!=="normal":!1)||!t&&(n.backdropFilter?n.backdropFilter!=="none":!1)||!t&&(n.filter?n.filter!=="none":!1)||["transform","perspective","filter"].some(r=>(n.willChange||"").includes(r))||["paint","layout","strict","content"].some(r=>(n.contain||"").includes(r))}function nu(e){let t=wt(e);for(;Je(t)&&!Nt(t);){if(yr(t))return t;if(Pn(t))return null;t=wt(t)}return null}function mr(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function Nt(e){return["html","body","#document"].includes(Vt(e))}function Qe(e){return Le(e).getComputedStyle(e)}function Ln(e){return We(e)?{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}:{scrollLeft:e.scrollX,scrollTop:e.scrollY}}function wt(e){if(Vt(e)==="html")return e;const t=e.assignedSlot||e.parentNode||go(e)&&e.host||ft(e);return go(t)?t.host:t}function pi(e){const t=wt(e);return Nt(t)?e.ownerDocument?e.ownerDocument.body:e.body:Je(t)&&fn(t)?t:pi(t)}function sn(e,t,n){var r;t===void 0&&(t=[]),n===void 0&&(n=!0);const o=pi(e),s=o===((r=e.ownerDocument)==null?void 0:r.body),a=Le(o);return s?t.concat(a,a.visualViewport||[],fn(o)?o:[],a.frameElement&&n?sn(a.frameElement):[]):t.concat(o,sn(o,[],n))}function xi(e){const t=Qe(e);let n=parseFloat(t.width)||0,r=parseFloat(t.height)||0;const o=Je(e),s=o?e.offsetWidth:n,a=o?e.offsetHeight:r,l=Sn(n)!==s||Sn(r)!==a;return l&&(n=s,r=a),{width:n,height:r,$:l}}function vr(e){return We(e)?e:e.contextElement}function Bt(e){const t=vr(e);if(!Je(t))return pt(1);const n=t.getBoundingClientRect(),{width:r,height:o,$:s}=xi(t);let a=(s?Sn(n.width):n.width)/r,l=(s?Sn(n.height):n.height)/o;return(!a||!Number.isFinite(a))&&(a=1),(!l||!Number.isFinite(l))&&(l=1),{x:a,y:l}}var ru=pt(0);function wi(e){const t=Le(e);return!mr()||!t.visualViewport?ru:{x:t.visualViewport.offsetLeft,y:t.visualViewport.offsetTop}}function ou(e,t,n){return t===void 0&&(t=!1),!n||t&&n!==Le(e)?!1:t}function At(e,t,n,r){t===void 0&&(t=!1),n===void 0&&(n=!1);const o=e.getBoundingClientRect(),s=vr(e);let a=pt(1);t&&(r?We(r)&&(a=Bt(r)):a=Bt(e));const l=ou(s,n,r)?wi(s):pt(0);let i=(o.left+l.x)/a.x,u=(o.top+l.y)/a.y,f=o.width/a.x,g=o.height/a.y;if(s){const c=Le(s),d=r&&We(r)?Le(r):r;let h=c,y=h.frameElement;for(;y&&r&&d!==h;){const m=Bt(y),b=y.getBoundingClientRect(),p=Qe(y),x=b.left+(y.clientLeft+parseFloat(p.paddingLeft))*m.x,w=b.top+(y.clientTop+parseFloat(p.paddingTop))*m.y;i*=m.x,u*=m.y,f*=m.x,g*=m.y,i+=x,u+=w,h=Le(y),y=h.frameElement}}return En({width:f,height:g,x:i,y:u})}function iu(e){let{elements:t,rect:n,offsetParent:r,strategy:o}=e;const s=o==="fixed",a=ft(r),l=t?Pn(t.floating):!1;if(r===a||l&&s)return n;let i={scrollLeft:0,scrollTop:0},u=pt(1);const f=pt(0),g=Je(r);if((g||!g&&!s)&&((Vt(r)!=="body"||fn(a))&&(i=Ln(r)),Je(r))){const c=At(r);u=Bt(r),f.x=c.x+r.clientLeft,f.y=c.y+r.clientTop}return{width:n.width*u.x,height:n.height*u.y,x:n.x*u.x-i.scrollLeft*u.x+f.x,y:n.y*u.y-i.scrollTop*u.y+f.y}}function su(e){return Array.from(e.getClientRects())}function $i(e){return At(ft(e)).left+Ln(e).scrollLeft}function au(e){const t=ft(e),n=Ln(e),r=e.ownerDocument.body,o=Pe(t.scrollWidth,t.clientWidth,r.scrollWidth,r.clientWidth),s=Pe(t.scrollHeight,t.clientHeight,r.scrollHeight,r.clientHeight);let a=-n.scrollLeft+$i(e);const l=-n.scrollTop;return Qe(r).direction==="rtl"&&(a+=Pe(t.clientWidth,r.clientWidth)-o),{width:o,height:s,x:a,y:l}}function lu(e,t){const n=Le(e),r=ft(e),o=n.visualViewport;let s=r.clientWidth,a=r.clientHeight,l=0,i=0;if(o){s=o.width,a=o.height;const u=mr();(!u||u&&t==="fixed")&&(l=o.offsetLeft,i=o.offsetTop)}return{width:s,height:a,x:l,y:i}}function uu(e,t){const n=At(e,!0,t==="fixed"),r=n.top+e.clientTop,o=n.left+e.clientLeft,s=Je(e)?Bt(e):pt(1),a=e.clientWidth*s.x,l=e.clientHeight*s.y,i=o*s.x,u=r*s.y;return{width:a,height:l,x:i,y:u}}function ho(e,t,n){let r;if(t==="viewport")r=lu(e,n);else if(t==="document")r=au(ft(e));else if(We(t))r=uu(t,n);else{const o=wi(e);r={...t,x:t.x-o.x,y:t.y-o.y}}return En(r)}function Ci(e,t){const n=wt(e);return n===t||!We(n)||Nt(n)?!1:Qe(n).position==="fixed"||Ci(n,t)}function cu(e,t){const n=t.get(e);if(n)return n;let r=sn(e,[],!1).filter(l=>We(l)&&Vt(l)!=="body"),o=null;const s=Qe(e).position==="fixed";let a=s?wt(e):e;for(;We(a)&&!Nt(a);){const l=Qe(a),i=yr(a);!i&&l.position==="fixed"&&(o=null),(s?!i&&!o:!i&&l.position==="static"&&!!o&&["absolute","fixed"].includes(o.position)||fn(a)&&!i&&Ci(e,a))?r=r.filter(f=>f!==a):o=l,a=wt(a)}return t.set(e,r),r}function du(e){let{element:t,boundary:n,rootBoundary:r,strategy:o}=e;const a=[...n==="clippingAncestors"?Pn(t)?[]:cu(t,this._c):[].concat(n),r],l=a[0],i=a.reduce((u,f)=>{const g=ho(t,f,o);return u.top=Pe(g.top,u.top),u.right=Xe(g.right,u.right),u.bottom=Xe(g.bottom,u.bottom),u.left=Pe(g.left,u.left),u},ho(t,l,o));return{width:i.right-i.left,height:i.bottom-i.top,x:i.left,y:i.top}}function fu(e){const{width:t,height:n}=xi(e);return{width:t,height:n}}function gu(e,t,n){const r=Je(t),o=ft(t),s=n==="fixed",a=At(e,!0,s,t);let l={scrollLeft:0,scrollTop:0};const i=pt(0);if(r||!r&&!s)if((Vt(t)!=="body"||fn(o))&&(l=Ln(t)),r){const g=At(t,!0,s,t);i.x=g.x+t.clientLeft,i.y=g.y+t.clientTop}else o&&(i.x=$i(o));const u=a.left+l.scrollLeft-i.x,f=a.top+l.scrollTop-i.y;return{x:u,y:f,width:a.width,height:a.height}}function Bn(e){return Qe(e).position==="static"}function yo(e,t){return!Je(e)||Qe(e).position==="fixed"?null:t?t(e):e.offsetParent}function Si(e,t){const n=Le(e);if(Pn(e))return n;if(!Je(e)){let o=wt(e);for(;o&&!Nt(o);){if(We(o)&&!Bn(o))return o;o=wt(o)}return n}let r=yo(e,t);for(;r&&tu(r)&&Bn(r);)r=yo(r,t);return r&&Nt(r)&&Bn(r)&&!yr(r)?n:r||nu(e)||n}var hu=async function(e){const t=this.getOffsetParent||Si,n=this.getDimensions,r=await n(e.floating);return{reference:gu(e.reference,await t(e.floating),e.strategy),floating:{x:0,y:0,width:r.width,height:r.height}}};function yu(e){return Qe(e).direction==="rtl"}var ki={convertOffsetParentRelativeRectToViewportRelativeRect:iu,getDocumentElement:ft,getClippingRect:du,getOffsetParent:Si,getElementRects:hu,getClientRects:su,getDimensions:fu,getScale:Bt,isElement:We,isRTL:yu};function mu(e,t){let n=null,r;const o=ft(e);function s(){var l;clearTimeout(r),(l=n)==null||l.disconnect(),n=null}function a(l,i){l===void 0&&(l=!1),i===void 0&&(i=1),s();const{left:u,top:f,width:g,height:c}=e.getBoundingClientRect();if(l||t(),!g||!c)return;const d=pn(f),h=pn(o.clientWidth-(u+g)),y=pn(o.clientHeight-(f+c)),m=pn(u),p={rootMargin:-d+"px "+-h+"px "+-y+"px "+-m+"px",threshold:Pe(0,Xe(1,i))||1};let x=!0;function w($){const O=$[0].intersectionRatio;if(O!==i){if(!x)return a();O?a(!1,O):r=setTimeout(()=>{a(!1,1e-7)},1e3)}x=!1}try{n=new IntersectionObserver(w,{...p,root:o.ownerDocument})}catch{n=new IntersectionObserver(w,p)}n.observe(e)}return a(!0),s}function vu(e,t,n,r){r===void 0&&(r={});const{ancestorScroll:o=!0,ancestorResize:s=!0,elementResize:a=typeof ResizeObserver=="function",layoutShift:l=typeof IntersectionObserver=="function",animationFrame:i=!1}=r,u=vr(e),f=o||s?[...u?sn(u):[],...sn(t)]:[];f.forEach(b=>{o&&b.addEventListener("scroll",n,{passive:!0}),s&&b.addEventListener("resize",n)});const g=u&&l?mu(u,n):null;let c=-1,d=null;a&&(d=new ResizeObserver(b=>{let[p]=b;p&&p.target===u&&d&&(d.unobserve(t),cancelAnimationFrame(c),c=requestAnimationFrame(()=>{var x;(x=d)==null||x.observe(t)})),n()}),u&&!i&&d.observe(u),d.observe(t));let h,y=i?At(e):null;i&&m();function m(){const b=At(e);y&&(b.x!==y.x||b.y!==y.y||b.width!==y.width||b.height!==y.height)&&n(),y=b,h=requestAnimationFrame(m)}return n(),()=>{var b;f.forEach(p=>{o&&p.removeEventListener("scroll",n),s&&p.removeEventListener("resize",n)}),g==null||g(),(b=d)==null||b.disconnect(),d=null,i&&cancelAnimationFrame(h)}}var bu=Zl,pu=Jl,xu=Ql,wu=eu,$u=Yl,Cu=Wl,Su=(e,t,n)=>{const r=new Map,o={platform:ki,...n},s={...o.platform,_c:r};return jl(e,t,{...o,platform:s})},br=we();function pr(){const e=$e(br);if(e===void 0)throw new Error("[kobalte]: `usePopperContext` must be used within a `Popper` component");return e}var ku=q('<svg display="block" viewBox="0 0 30 30" style="transform:scale(1.02)"><g><path fill="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"></path><path stroke="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z">'),tr=30,mo=tr/2,Eu={top:180,right:-90,bottom:0,left:90};function xr(e){const t=pr(),n=X({size:tr},e),[r,o]=oe(n,["ref","style","size"]),s=()=>t.currentPlacement().split("-")[0],a=Du(t.contentRef),l=()=>{var c;return((c=a())==null?void 0:c.getPropertyValue("background-color"))||"none"},i=()=>{var c;return((c=a())==null?void 0:c.getPropertyValue(`border-${s()}-color`))||"none"},u=()=>{var c;return((c=a())==null?void 0:c.getPropertyValue(`border-${s()}-width`))||"0px"},f=()=>Number.parseInt(u())*2*(tr/r.size),g=()=>`rotate(${Eu[s()]} ${mo} ${mo}) translate(0 2)`;return v(de,W({as:"div",ref(c){const d=Me(t.setArrowRef,r.ref);typeof d=="function"&&d(c)},"aria-hidden":"true",get style(){return An({position:"absolute","font-size":`${r.size}px`,width:"1em",height:"1em","pointer-events":"none",fill:l(),stroke:i(),"stroke-width":f()},r.style)}},o,{get children(){const c=ku(),d=c.firstChild;return V(()=>A(d,"transform",g())),c}}))}function Du(e){const[t,n]=R();return U(()=>{const r=e();r&&n(Ea(r).getComputedStyle(r))}),t}function Mu(e){const t=pr(),[n,r]=oe(e,["ref","style"]);return v(de,W({as:"div",ref(o){const s=Me(t.setPositionerRef,n.ref);typeof s=="function"&&s(o)},"data-popper-positioner":"",get style(){return An({position:"absolute",top:0,left:0,"min-width":"max-content"},n.style)}},r))}function vo(e){const{x:t=0,y:n=0,width:r=0,height:o=0}=e??{};if(typeof DOMRect=="function")return new DOMRect(t,n,r,o);const s={x:t,y:n,width:r,height:o,top:n,right:t+r,bottom:n+o,left:t};return{...s,toJSON:()=>s}}function Au(e,t){return{contextElement:e,getBoundingClientRect:()=>{const r=t(e);return r?vo(r):e?e.getBoundingClientRect():vo()}}}function Fu(e){return/^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(e)}var Tu={top:"bottom",right:"left",bottom:"top",left:"right"};function Iu(e,t){const[n,r]=e.split("-"),o=Tu[n];return r?n==="left"||n==="right"?`${o} ${r==="start"?"top":"bottom"}`:r==="start"?`${o} ${t==="rtl"?"right":"left"}`:`${o} ${t==="rtl"?"left":"right"}`:`${o} center`}function Pu(e){const t=X({getAnchorRect:c=>c==null?void 0:c.getBoundingClientRect(),placement:"bottom",gutter:0,shift:0,flip:!0,slide:!0,overlap:!1,sameWidth:!1,fitViewport:!1,hideWhenDetached:!1,detachedPadding:0,arrowPadding:4,overflowPadding:8},e),[n,r]=R(),[o,s]=R(),[a,l]=R(t.placement),i=()=>{var c;return Au((c=t.anchorRef)==null?void 0:c.call(t),t.getAnchorRect)},{direction:u}=$t();async function f(){var O,T;const c=i(),d=n(),h=o();if(!c||!d)return;const y=((h==null?void 0:h.clientHeight)||0)/2,m=typeof t.gutter=="number"?t.gutter+y:t.gutter??y;d.style.setProperty("--kb-popper-content-overflow-padding",`${t.overflowPadding}px`),c.getBoundingClientRect();const b=[bu(({placement:_})=>{const C=!!_.split("-")[1];return{mainAxis:m,crossAxis:C?void 0:t.shift,alignmentAxis:t.shift}})];if(t.flip!==!1){const _=typeof t.flip=="string"?t.flip.split(" "):void 0;if(_!==void 0&&!_.every(Fu))throw new Error("`flip` expects a spaced-delimited list of placements");b.push(xu({padding:t.overflowPadding,fallbackPlacements:_}))}(t.slide||t.overlap)&&b.push(pu({mainAxis:t.slide,crossAxis:t.overlap,padding:t.overflowPadding})),b.push(wu({padding:t.overflowPadding,apply({availableWidth:_,availableHeight:C,rects:I}){const N=Math.round(I.reference.width);_=Math.floor(_),C=Math.floor(C),d.style.setProperty("--kb-popper-anchor-width",`${N}px`),d.style.setProperty("--kb-popper-content-available-width",`${_}px`),d.style.setProperty("--kb-popper-content-available-height",`${C}px`),t.sameWidth&&(d.style.width=`${N}px`),t.fitViewport&&(d.style.maxWidth=`${_}px`,d.style.maxHeight=`${C}px`)}})),t.hideWhenDetached&&b.push($u({padding:t.detachedPadding})),h&&b.push(Cu({element:h,padding:t.arrowPadding}));const p=await Su(c,d,{placement:t.placement,strategy:"absolute",middleware:b,platform:{...ki,isRTL:()=>u()==="rtl"}});if(l(p.placement),(O=t.onCurrentPlacementChange)==null||O.call(t,p.placement),!d)return;d.style.setProperty("--kb-popper-content-transform-origin",Iu(p.placement,u()));const x=Math.round(p.x),w=Math.round(p.y);let $;if(t.hideWhenDetached&&($=(T=p.middlewareData.hide)!=null&&T.referenceHidden?"hidden":"visible"),Object.assign(d.style,{top:"0",left:"0",transform:`translate3d(${x}px, ${w}px, 0)`,visibility:$}),h&&p.middlewareData.arrow){const{x:_,y:C}=p.middlewareData.arrow,I=p.placement.split("-")[0];Object.assign(h.style,{left:_!=null?`${_}px`:"",top:C!=null?`${C}px`:"",[I]:"100%"})}}U(()=>{const c=i(),d=n();if(!c||!d)return;const h=vu(c,d,f,{elementResize:typeof ResizeObserver=="function"});j(h)}),U(()=>{var h;const c=n(),d=(h=t.contentRef)==null?void 0:h.call(t);!c||!d||queueMicrotask(()=>{c.style.zIndex=getComputedStyle(d).zIndex})});const g={currentPlacement:a,contentRef:()=>{var c;return(c=t.contentRef)==null?void 0:c.call(t)},setPositionerRef:r,setArrowRef:s};return v(br.Provider,{value:g,get children(){return t.children}})}var Ei=Object.assign(Pu,{Arrow:xr,Context:br,usePopperContext:pr,Positioner:Mu});function Lu(e){const t=n=>{var r;n.key===ar.Escape&&((r=e.onEscapeKeyDown)==null||r.call(e,n))};U(()=>{var r;if(E(e.isDisabled))return;const n=((r=e.ownerDocument)==null?void 0:r.call(e))??Ze();n.addEventListener("keydown",t),j(()=>{n.removeEventListener("keydown",t)})})}var bo="interactOutside.pointerDownOutside",po="interactOutside.focusOutside";function Ou(e,t){let n,r=Na;const o=()=>Ze(t()),s=g=>{var c;return(c=e.onPointerDownOutside)==null?void 0:c.call(e,g)},a=g=>{var c;return(c=e.onFocusOutside)==null?void 0:c.call(e,g)},l=g=>{var c;return(c=e.onInteractOutside)==null?void 0:c.call(e,g)},i=g=>{var d;const c=g.target;return!(c instanceof HTMLElement)||c.closest(`[${Cn}]`)||!Ke(o(),c)||Ke(t(),c)?!1:!((d=e.shouldExcludeElement)!=null&&d.call(e,c))},u=g=>{function c(){const d=t(),h=g.target;if(!d||!h||!i(g))return;const y=be([s,l]);h.addEventListener(bo,y,{once:!0});const m=new CustomEvent(bo,{bubbles:!1,cancelable:!0,detail:{originalEvent:g,isContextMenu:g.button===2||Ta(g)&&g.button===0}});h.dispatchEvent(m)}g.pointerType==="touch"?(o().removeEventListener("click",c),r=c,o().addEventListener("click",c,{once:!0})):c()},f=g=>{const c=t(),d=g.target;if(!c||!d||!i(g))return;const h=be([a,l]);d.addEventListener(po,h,{once:!0});const y=new CustomEvent(po,{bubbles:!1,cancelable:!0,detail:{originalEvent:g,isContextMenu:!1}});d.dispatchEvent(y)};U(()=>{E(e.isDisabled)||(n=window.setTimeout(()=>{o().addEventListener("pointerdown",u,!0)},0),o().addEventListener("focusin",f,!0),j(()=>{window.clearTimeout(n),o().removeEventListener("click",r),o().removeEventListener("pointerdown",u,!0),o().removeEventListener("focusin",f,!0)}))})}var Di=we();function qu(){return $e(Di)}function _u(e){let t;const n=qu(),[r,o]=oe(e,["ref","disableOutsidePointerEvents","excludedElements","onEscapeKeyDown","onPointerDownOutside","onFocusOutside","onInteractOutside","onDismiss","bypassTopMostLayerCheck"]),s=new Set([]),a=g=>{s.add(g);const c=n==null?void 0:n.registerNestedLayer(g);return()=>{s.delete(g),c==null||c()}};Ou({shouldExcludeElement:g=>{var c;return t?((c=r.excludedElements)==null?void 0:c.some(d=>Ke(d(),g)))||[...s].some(d=>Ke(d,g)):!1},onPointerDownOutside:g=>{var c,d,h;!t||Te.isBelowPointerBlockingLayer(t)||!r.bypassTopMostLayerCheck&&!Te.isTopMostLayer(t)||((c=r.onPointerDownOutside)==null||c.call(r,g),(d=r.onInteractOutside)==null||d.call(r,g),g.defaultPrevented||(h=r.onDismiss)==null||h.call(r))},onFocusOutside:g=>{var c,d,h;(c=r.onFocusOutside)==null||c.call(r,g),(d=r.onInteractOutside)==null||d.call(r,g),g.defaultPrevented||(h=r.onDismiss)==null||h.call(r)}},()=>t),Lu({ownerDocument:()=>Ze(t),onEscapeKeyDown:g=>{var c;!t||!Te.isTopMostLayer(t)||((c=r.onEscapeKeyDown)==null||c.call(r,g),!g.defaultPrevented&&r.onDismiss&&(g.preventDefault(),r.onDismiss()))}}),Ft(()=>{if(!t)return;Te.addLayer({node:t,isPointerBlocking:r.disableOutsidePointerEvents,dismiss:r.onDismiss});const g=n==null?void 0:n.registerNestedLayer(t);Te.assignPointerEventToLayers(),Te.disableBodyPointerEvents(t),j(()=>{t&&(Te.removeLayer(t),g==null||g(),Te.assignPointerEventToLayers(),Te.restoreBodyPointerEvents(t))})}),U(ct([()=>t,()=>r.disableOutsidePointerEvents],([g,c])=>{if(!g)return;const d=Te.find(g);d&&d.isPointerBlocking!==c&&(d.isPointerBlocking=c,Te.assignPointerEventToLayers()),c&&Te.disableBodyPointerEvents(g),j(()=>{Te.restoreBodyPointerEvents(g)})},{defer:!0}));const f={registerNestedLayer:a};return v(Di.Provider,{value:f,get children(){return v(de,W({as:"div",ref(g){const c=Me(d=>t=d,r.ref);typeof c=="function"&&c(g)}},o))}})}function Mi(e={}){const[t,n]=ni({value:()=>E(e.open),defaultValue:()=>!!E(e.defaultOpen),onChange:a=>{var l;return(l=e.onOpenChange)==null?void 0:l.call(e,a)}}),r=()=>{n(!0)},o=()=>{n(!1)};return{isOpen:t,setIsOpen:n,open:r,close:o,toggle:()=>{t()?o():r()}}}var Re={};In(Re,{Description:()=>ei,ErrorMessage:()=>ti,Item:()=>Ii,ItemControl:()=>Pi,ItemDescription:()=>Li,ItemIndicator:()=>Oi,ItemInput:()=>qi,ItemLabel:()=>_i,Label:()=>zi,RadioGroup:()=>zu,Root:()=>Ri});var Ai=we();function Fi(){const e=$e(Ai);if(e===void 0)throw new Error("[kobalte]: `useRadioGroupContext` must be used within a `RadioGroup` component");return e}var Ti=we();function gn(){const e=$e(Ti);if(e===void 0)throw new Error("[kobalte]: `useRadioGroupItemContext` must be used within a `RadioGroup.Item` component");return e}function Ii(e){const t=cn(),n=Fi(),r=`${t.generateId("item")}-${Ne()}`,o=X({id:r},e),[s,a]=oe(o,["value","disabled","onPointerDown"]),[l,i]=R(),[u,f]=R(),[g,c]=R(),[d,h]=R(),[y,m]=R(!1),b=D(()=>n.isSelectedValue(s.value)),p=D(()=>s.disabled||t.isDisabled()||!1),x=O=>{ce(O,s.onPointerDown),y()&&O.preventDefault()},w=D(()=>({...t.dataset(),"data-disabled":p()?"":void 0,"data-checked":b()?"":void 0})),$={value:()=>s.value,dataset:w,isSelected:b,isDisabled:p,inputId:l,labelId:u,descriptionId:g,inputRef:d,select:()=>n.setSelectedValue(s.value),generateId:un(()=>a.id),registerInput:Be(i),registerLabel:Be(f),registerDescription:Be(c),setIsFocused:m,setInputRef:h};return v(Ti.Provider,{value:$,get children(){return v(de,W({as:"div",role:"group",onPointerDown:x},w,a))}})}function Pi(e){const t=gn(),n=X({id:t.generateId("control")},e),[r,o]=oe(n,["onClick","onKeyDown"]);return v(de,W({as:"div",onClick:l=>{var i;ce(l,r.onClick),t.select(),(i=t.inputRef())==null||i.focus()},onKeyDown:l=>{var i;ce(l,r.onKeyDown),l.key===ar.Space&&(t.select(),(i=t.inputRef())==null||i.focus())}},()=>t.dataset(),o))}function Li(e){const t=gn(),n=X({id:t.generateId("description")},e);return U(()=>j(t.registerDescription(n.id))),v(de,W({as:"div"},()=>t.dataset(),n))}function Oi(e){const t=gn(),n=X({id:t.generateId("indicator")},e),[r,o]=oe(n,["ref","forceMount"]),[s,a]=R(),{present:l}=fi({show:()=>r.forceMount||t.isSelected(),element:()=>s()??null});return v(B,{get when(){return l()},get children(){return v(de,W({as:"div",ref(i){const u=Me(a,r.ref);typeof u=="function"&&u(i)}},()=>t.dataset(),o))}})}function qi(e){const t=cn(),n=Fi(),r=gn(),o=X({id:r.generateId("input")},e),[s,a]=oe(o,["ref","style","aria-labelledby","aria-describedby","onChange","onFocus","onBlur"]),l=()=>[s["aria-labelledby"],r.labelId(),s["aria-labelledby"]!=null&&a["aria-label"]!=null?a.id:void 0].filter(Boolean).join(" ")||void 0,i=()=>[s["aria-describedby"],r.descriptionId(),n.ariaDescribedBy()].filter(Boolean).join(" ")||void 0,[u,f]=R(!1),g=h=>{if(ce(h,s.onChange),h.stopPropagation(),!u()){n.setSelectedValue(r.value());const y=h.target;y.checked=r.isSelected()}f(!1)},c=h=>{ce(h,s.onFocus),r.setIsFocused(!0)},d=h=>{ce(h,s.onBlur),r.setIsFocused(!1)};return U(ct([()=>r.isSelected(),()=>r.value()],h=>{if(!h[0]&&h[1]===r.value())return;f(!0);const y=r.inputRef();y==null||y.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0})),y==null||y.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},{defer:!0})),U(()=>j(r.registerInput(a.id))),v(de,W({as:"input",ref(h){const y=Me(r.setInputRef,s.ref);typeof y=="function"&&y(h)},type:"radio",get name(){return t.name()},get value(){return r.value()},get checked(){return r.isSelected()},get required(){return t.isRequired()},get disabled(){return r.isDisabled()},get readonly(){return t.isReadOnly()},get style(){return An({...Zo},s.style)},get"aria-labelledby"(){return l()},get"aria-describedby"(){return i()},onChange:g,onFocus:c,onBlur:d},()=>r.dataset(),a))}function _i(e){const t=gn(),n=X({id:t.generateId("label")},e);return U(()=>j(t.registerLabel(n.id))),v(de,W({as:"label",get for(){return t.inputId()}},()=>t.dataset(),n))}function zi(e){return v(ja,W({as:"span"},e))}function Ri(e){let t;const n=`radiogroup-${Ne()}`,r=X({id:n,orientation:"vertical"},e),[o,s,a]=oe(r,["ref","value","defaultValue","onChange","orientation","aria-labelledby","aria-describedby"],Ga),[l,i]=dn({value:()=>o.value,defaultValue:()=>o.defaultValue,onChange:h=>{var y;return(y=o.onChange)==null?void 0:y.call(o,h)}}),{formControlContext:u}=Ha(s);Wa(()=>t,()=>i(o.defaultValue??""));const f=()=>u.getAriaLabelledBy(E(s.id),a["aria-label"],o["aria-labelledby"]),g=()=>u.getAriaDescribedBy(o["aria-describedby"]),c=h=>h===l(),d={ariaDescribedBy:g,isSelectedValue:c,setSelectedValue:h=>{if(!(u.isReadOnly()||u.isDisabled())&&(i(h),t))for(const y of t.querySelectorAll("[type='radio']")){const m=y;m.checked=c(m.value)}}};return v(Jo.Provider,{value:u,get children(){return v(Ai.Provider,{value:d,get children(){return v(de,W({as:"div",ref(h){const y=Me(m=>t=m,o.ref);typeof y=="function"&&y(h)},role:"radiogroup",get id(){return E(s.id)},get"aria-invalid"(){return u.validationState()==="invalid"||void 0},get"aria-required"(){return u.isRequired()||void 0},get"aria-disabled"(){return u.isDisabled()||void 0},get"aria-readonly"(){return u.isReadOnly()||void 0},get"aria-orientation"(){return o.orientation},get"aria-labelledby"(){return f()},get"aria-describedby"(){return g()}},()=>u.dataset(),a))}})}})}var zu=Object.assign(Ri,{Description:ei,ErrorMessage:ti,Item:Ii,ItemControl:Pi,ItemDescription:Li,ItemIndicator:Oi,ItemInput:qi,ItemLabel:_i,Label:zi}),Ru=class{constructor(e,t,n){qe(this,"collection");qe(this,"ref");qe(this,"collator");this.collection=e,this.ref=t,this.collator=n}getKeyBelow(e){let t=this.collection().getKeyAfter(e);for(;t!=null;){const n=this.collection().getItem(t);if(n&&n.type==="item"&&!n.disabled)return t;t=this.collection().getKeyAfter(t)}}getKeyAbove(e){let t=this.collection().getKeyBefore(e);for(;t!=null;){const n=this.collection().getItem(t);if(n&&n.type==="item"&&!n.disabled)return t;t=this.collection().getKeyBefore(t)}}getFirstKey(){let e=this.collection().getFirstKey();for(;e!=null;){const t=this.collection().getItem(e);if(t&&t.type==="item"&&!t.disabled)return e;e=this.collection().getKeyAfter(e)}}getLastKey(){let e=this.collection().getLastKey();for(;e!=null;){const t=this.collection().getItem(e);if(t&&t.type==="item"&&!t.disabled)return e;e=this.collection().getKeyBefore(e)}}getItem(e){var t,n;return((n=(t=this.ref)==null?void 0:t.call(this))==null?void 0:n.querySelector(`[data-key="${e}"]`))??null}getKeyPageAbove(e){var s;const t=(s=this.ref)==null?void 0:s.call(this);let n=this.getItem(e);if(!t||!n)return;const r=Math.max(0,n.offsetTop+n.offsetHeight-t.offsetHeight);let o=e;for(;o&&n&&n.offsetTop>r;)o=this.getKeyAbove(o),n=o!=null?this.getItem(o):null;return o}getKeyPageBelow(e){var s;const t=(s=this.ref)==null?void 0:s.call(this);let n=this.getItem(e);if(!t||!n)return;const r=Math.min(t.scrollHeight,n.offsetTop-n.offsetHeight+t.offsetHeight);let o=e;for(;o&&n&&n.offsetTop<r;)o=this.getKeyBelow(o),n=o!=null?this.getItem(o):null;return o}getKeyForSearch(e,t){var o;const n=(o=this.collator)==null?void 0:o.call(this);if(!n)return;let r=t!=null?this.getKeyBelow(t):this.getFirstKey();for(;r!=null;){const s=this.collection().getItem(r);if(s){const a=s.textValue.slice(0,e.length);if(s.textValue&&n.compare(a,e)===0)return r}r=this.getKeyBelow(r)}}};function Ku(e,t,n){const r=yl({usage:"search",sensitivity:"base"}),o=D(()=>{const s=E(e.keyboardDelegate);return s||new Ru(e.collection,t,r)});return $l({selectionManager:()=>E(e.selectionManager),keyboardDelegate:o,autoFocus:()=>E(e.autoFocus),deferAutoFocus:()=>E(e.deferAutoFocus),shouldFocusWrap:()=>E(e.shouldFocusWrap),disallowEmptySelection:()=>E(e.disallowEmptySelection),selectOnFocus:()=>E(e.selectOnFocus),disallowTypeAhead:()=>E(e.disallowTypeAhead),shouldUseVirtualFocus:()=>E(e.shouldUseVirtualFocus),allowsTabNavigation:()=>E(e.allowsTabNavigation),isVirtualized:()=>E(e.isVirtualized),scrollToKey:s=>{var a;return(a=E(e.scrollToKey))==null?void 0:a(s)},orientation:()=>E(e.orientation)},t)}var Nn="focusScope.autoFocusOnMount",Un="focusScope.autoFocusOnUnmount",xo={bubbles:!1,cancelable:!0},wo={stack:[],active(){return this.stack[0]},add(e){var t;e!==this.active()&&((t=this.active())==null||t.pause()),this.stack=Qn(this.stack,e),this.stack.unshift(e)},remove(e){var t;this.stack=Qn(this.stack,e),(t=this.active())==null||t.resume()}};function Bu(e,t){const[n,r]=R(!1),o={pause(){r(!0)},resume(){r(!1)}};let s=null;const a=h=>{var y;return(y=e.onMountAutoFocus)==null?void 0:y.call(e,h)},l=h=>{var y;return(y=e.onUnmountAutoFocus)==null?void 0:y.call(e,h)},i=()=>Ze(t()),u=()=>{const h=i().createElement("span");return h.setAttribute("data-focus-trap",""),h.tabIndex=0,Object.assign(h.style,Zo),h},f=()=>{const h=t();return h?Yo(h,!0).filter(y=>!y.hasAttribute("data-focus-trap")):[]},g=()=>{const h=f();return h.length>0?h[0]:null},c=()=>{const h=f();return h.length>0?h[h.length-1]:null},d=()=>{const h=t();if(!h)return!1;const y=en(h);return!y||Ke(h,y)?!1:Xo(y)};U(()=>{const h=t();if(!h)return;wo.add(o);const y=en(h);if(!Ke(h,y)){const b=new CustomEvent(Nn,xo);h.addEventListener(Nn,a),h.dispatchEvent(b),b.defaultPrevented||setTimeout(()=>{Ee(g()),en(h)===y&&Ee(h)},0)}j(()=>{h.removeEventListener(Nn,a),setTimeout(()=>{const b=new CustomEvent(Un,xo);d()&&b.preventDefault(),h.addEventListener(Un,l),h.dispatchEvent(b),b.defaultPrevented||Ee(y??i().body),h.removeEventListener(Un,l),wo.remove(o)},0)})}),U(()=>{const h=t();if(!h||!E(e.trapFocus)||n())return;const y=b=>{const p=b.target;p!=null&&p.closest(`[${Cn}]`)||(Ke(h,p)?s=p:Ee(s))},m=b=>{const x=b.relatedTarget??en(h);x!=null&&x.closest(`[${Cn}]`)||Ke(h,x)||Ee(s)};i().addEventListener("focusin",y),i().addEventListener("focusout",m),j(()=>{i().removeEventListener("focusin",y),i().removeEventListener("focusout",m)})}),U(()=>{const h=t();if(!h||!E(e.trapFocus)||n())return;const y=u();h.insertAdjacentElement("afterbegin",y);const m=u();h.insertAdjacentElement("beforeend",m);function b(x){const w=g(),$=c();x.relatedTarget===w?Ee($):Ee(w)}y.addEventListener("focusin",b),m.addEventListener("focusin",b);const p=new MutationObserver(x=>{for(const w of x)w.previousSibling===m&&(m.remove(),h.insertAdjacentElement("beforeend",m)),w.nextSibling===y&&(y.remove(),h.insertAdjacentElement("afterbegin",y))});p.observe(h,{childList:!0,subtree:!1}),j(()=>{y.removeEventListener("focusin",b),m.removeEventListener("focusin",b),y.remove(),m.remove(),p.disconnect()})})}var Nu="data-live-announcer";function Uu(e){U(()=>{E(e.isDisabled)||j(Vu(E(e.targets),E(e.root)))})}var Zt=new WeakMap,ze=[];function Vu(e,t=document.body){const n=new Set(e),r=new Set,o=i=>{for(const c of i.querySelectorAll(`[${Nu}], [${Cn}]`))n.add(c);const u=c=>{if(n.has(c)||c.parentElement&&r.has(c.parentElement)&&c.parentElement.getAttribute("role")!=="row")return NodeFilter.FILTER_REJECT;for(const d of n)if(c.contains(d))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_ACCEPT},f=document.createTreeWalker(i,NodeFilter.SHOW_ELEMENT,{acceptNode:u}),g=u(i);if(g===NodeFilter.FILTER_ACCEPT&&s(i),g!==NodeFilter.FILTER_REJECT){let c=f.nextNode();for(;c!=null;)s(c),c=f.nextNode()}},s=i=>{const u=Zt.get(i)??0;i.getAttribute("aria-hidden")==="true"&&u===0||(u===0&&i.setAttribute("aria-hidden","true"),r.add(i),Zt.set(i,u+1))};ze.length&&ze[ze.length-1].disconnect(),o(t);const a=new MutationObserver(i=>{for(const u of i)if(!(u.type!=="childList"||u.addedNodes.length===0)&&![...n,...r].some(f=>f.contains(u.target))){for(const f of u.removedNodes)f instanceof Element&&(n.delete(f),r.delete(f));for(const f of u.addedNodes)(f instanceof HTMLElement||f instanceof SVGElement)&&(f.dataset.liveAnnouncer==="true"||f.dataset.reactAriaTopLayer==="true")?n.add(f):f instanceof Element&&o(f)}});a.observe(t,{childList:!0,subtree:!0});const l={observe(){a.observe(t,{childList:!0,subtree:!0})},disconnect(){a.disconnect()}};return ze.push(l),()=>{a.disconnect();for(const i of r){const u=Zt.get(i);if(u==null)return;u===1?(i.removeAttribute("aria-hidden"),Zt.delete(i)):Zt.set(i,u-1)}l===ze[ze.length-1]?(ze.pop(),ze.length&&ze[ze.length-1].observe()):ze.splice(ze.indexOf(l),1)}}var xn=new Map,Gu=e=>{U(()=>{const t=ke(e.style)??{},n=ke(e.properties)??[],r={};for(const s in t)r[s]=e.element.style[s];const o=xn.get(e.key);o?o.activeCount++:xn.set(e.key,{activeCount:1,originalStyles:r,properties:n.map(s=>s.key)}),Object.assign(e.element.style,e.style);for(const s of n)e.element.style.setProperty(s.key,s.value);j(()=>{var a;const s=xn.get(e.key);if(s){if(s.activeCount!==1){s.activeCount--;return}xn.delete(e.key);for(const[l,i]of Object.entries(s.originalStyles))e.element.style[l]=i;for(const l of s.properties)e.element.style.removeProperty(l);e.element.style.length===0&&e.element.removeAttribute("style"),(a=e.cleanup)==null||a.call(e)}})})},$o=Gu,Hu=(e,t)=>{switch(t){case"x":return[e.clientWidth,e.scrollLeft,e.scrollWidth];case"y":return[e.clientHeight,e.scrollTop,e.scrollHeight]}},ju=(e,t)=>{const n=getComputedStyle(e),r=t==="x"?n.overflowX:n.overflowY;return r==="auto"||r==="scroll"||e.tagName==="HTML"&&r==="visible"},Wu=(e,t,n)=>{const r=t==="x"&&window.getComputedStyle(e).direction==="rtl"?-1:1;let o=e,s=0,a=0,l=!1;do{const[i,u,f]=Hu(o,t),g=f-i-r*u;(u!==0||g!==0)&&ju(o,t)&&(s+=g,a+=u),o===(n??document.documentElement)?l=!0:o=o._$host??o.parentElement}while(o&&!l);return[s,a]},[Co,So]=R([]),Qu=e=>Co().indexOf(e)===Co().length-1,Yu=e=>{const t=W({element:null,enabled:!0,hideScrollbar:!0,preventScrollbarShift:!0,preventScrollbarShiftMode:"padding",restoreScrollPosition:!0,allowPinchZoom:!1},e),n=Ne();let r=[0,0],o=null,s=null;U(()=>{ke(t.enabled)&&(So(u=>[...u,n]),j(()=>{So(u=>u.filter(f=>f!==n))}))}),U(()=>{if(!ke(t.enabled)||!ke(t.hideScrollbar))return;const{body:u}=document,f=window.innerWidth-u.offsetWidth;if(ke(t.preventScrollbarShift)){const g={overflow:"hidden"},c=[];f>0&&(ke(t.preventScrollbarShiftMode)==="padding"?g.paddingRight=`calc(${window.getComputedStyle(u).paddingRight} + ${f}px)`:g.marginRight=`calc(${window.getComputedStyle(u).marginRight} + ${f}px)`,c.push({key:"--scrollbar-width",value:`${f}px`}));const d=window.scrollY,h=window.scrollX;$o({key:"prevent-scroll",element:u,style:g,properties:c,cleanup:()=>{ke(t.restoreScrollPosition)&&f>0&&window.scrollTo(h,d)}})}else $o({key:"prevent-scroll",element:u,style:{overflow:"hidden"}})}),U(()=>{!Qu(n)||!ke(t.enabled)||(document.addEventListener("wheel",l,{passive:!1}),document.addEventListener("touchstart",a,{passive:!1}),document.addEventListener("touchmove",i,{passive:!1}),j(()=>{document.removeEventListener("wheel",l),document.removeEventListener("touchstart",a),document.removeEventListener("touchmove",i)}))});const a=u=>{r=ko(u),o=null,s=null},l=u=>{const f=u.target,g=ke(t.element),c=Xu(u),d=Math.abs(c[0])>Math.abs(c[1])?"x":"y",h=d==="x"?c[0]:c[1],y=Eo(f,d,h,g);let m;g&&nr(g,f)?m=!y:m=!0,m&&u.cancelable&&u.preventDefault()},i=u=>{const f=ke(t.element),g=u.target;let c;if(u.touches.length===2)c=!ke(t.allowPinchZoom);else{if(o==null||s===null){const d=ko(u).map((y,m)=>r[m]-y),h=Math.abs(d[0])>Math.abs(d[1])?"x":"y";o=h,s=h==="x"?d[0]:d[1]}if(g.type==="range")c=!1;else{const d=Eo(g,o,s,f);f&&nr(f,g)?c=!d:c=!0}}c&&u.cancelable&&u.preventDefault()}},Xu=e=>[e.deltaX,e.deltaY],ko=e=>e.changedTouches[0]?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0],Eo=(e,t,n,r)=>{const o=r!==null&&nr(r,e),[s,a]=Wu(e,t,o?r:void 0);return!(n>0&&Math.abs(s)<=1||n<0&&Math.abs(a)<1)},nr=(e,t)=>{if(e.contains(t))return!0;let n=t;for(;n;){if(n===e)return!0;n=n._$host??n.parentElement}return!1},Zu=Yu,Ju=Zu,Ki=we();function Bi(){return $e(Ki)}function gt(){const e=Bi();if(e===void 0)throw new Error("[kobalte]: `useMenuContext` must be used within a `Menu` component");return e}var Ni=we();function wr(){const e=$e(Ni);if(e===void 0)throw new Error("[kobalte]: `useMenuItemContext` must be used within a `Menu.Item` component");return e}var Ui=we();function et(){const e=$e(Ui);if(e===void 0)throw new Error("[kobalte]: `useMenuRootContext` must be used within a `MenuRoot` component");return e}function $r(e){let t;const n=et(),r=gt(),o=X({id:n.generateId(`item-${Ne()}`)},e),[s,a]=oe(o,["ref","textValue","disabled","closeOnSelect","checked","indeterminate","onSelect","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]),[l,i]=R(),[u,f]=R(),[g,c]=R(),d=()=>r.listState().selectionManager(),h=()=>a.id,y=()=>d().focusedKey()===h(),m=()=>{var C;(C=s.onSelect)==null||C.call(s),s.closeOnSelect&&setTimeout(()=>{r.close(!0)})};al({getItem:()=>{var C;return{ref:()=>t,type:"item",key:h(),textValue:s.textValue??((C=g())==null?void 0:C.textContent)??(t==null?void 0:t.textContent)??"",disabled:s.disabled??!1}}});const b=di({key:h,selectionManager:d,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>s.disabled},()=>t),p=C=>{ce(C,s.onPointerMove),C.pointerType==="mouse"&&(s.disabled?r.onItemLeave(C):(r.onItemEnter(C),C.defaultPrevented||(Ee(C.currentTarget),r.listState().selectionManager().setFocused(!0),r.listState().selectionManager().setFocusedKey(h()))))},x=C=>{ce(C,s.onPointerLeave),C.pointerType==="mouse"&&r.onItemLeave(C)},w=C=>{ce(C,s.onPointerUp),!s.disabled&&C.button===0&&m()},$=C=>{if(ce(C,s.onKeyDown),!C.repeat&&!s.disabled)switch(C.key){case"Enter":case" ":m();break}},O=D(()=>{if(s.indeterminate)return"mixed";if(s.checked!=null)return s.checked}),T=D(()=>({"data-indeterminate":s.indeterminate?"":void 0,"data-checked":s.checked&&!s.indeterminate?"":void 0,"data-disabled":s.disabled?"":void 0,"data-highlighted":y()?"":void 0})),_={isChecked:()=>s.checked,dataset:T,setLabelRef:c,generateId:un(()=>a.id),registerLabel:Be(i),registerDescription:Be(f)};return v(Ni.Provider,{value:_,get children(){return v(de,W({as:"div",ref(C){const I=Me(N=>t=N,s.ref);typeof I=="function"&&I(C)},get tabIndex(){return b.tabIndex()},get"aria-checked"(){return O()},get"aria-disabled"(){return s.disabled},get"aria-labelledby"(){return l()},get"aria-describedby"(){return u()},get"data-key"(){return b.dataKey()},get onPointerDown(){return be([s.onPointerDown,b.onPointerDown])},get onPointerUp(){return be([w,b.onPointerUp])},get onClick(){return be([s.onClick,b.onClick])},get onKeyDown(){return be([$,b.onKeyDown])},get onMouseDown(){return be([s.onMouseDown,b.onMouseDown])},get onFocus(){return be([s.onFocus,b.onFocus])},onPointerMove:p,onPointerLeave:x},T,a))}})}function Vi(e){const t=X({closeOnSelect:!1},e),[n,r]=oe(t,["checked","defaultChecked","onChange","onSelect"]),o=Za({isSelected:()=>n.checked,defaultIsSelected:()=>n.defaultChecked,onSelectedChange:a=>{var l;return(l=n.onChange)==null?void 0:l.call(n,a)},isDisabled:()=>r.disabled});return v($r,W({role:"menuitemcheckbox",get checked(){return o.isSelected()},onSelect:()=>{var a;(a=n.onSelect)==null||a.call(n),o.toggle()}},r))}var ec=we();function On(){return $e(ec)}var an={next:(e,t)=>e==="ltr"?t==="horizontal"?"ArrowRight":"ArrowDown":t==="horizontal"?"ArrowLeft":"ArrowUp",previous:(e,t)=>an.next(e==="ltr"?"rtl":"ltr",t)},Do={first:e=>e==="horizontal"?"ArrowDown":"ArrowRight",last:e=>e==="horizontal"?"ArrowUp":"ArrowLeft"};function Gi(e){const t=et(),n=gt(),r=On(),{direction:o}=$t(),s=X({id:t.generateId("trigger")},e),[a,l]=oe(s,["ref","id","disabled","onPointerDown","onClick","onKeyDown","onMouseOver","onFocus"]);let i=()=>t.value();r!==void 0&&(i=()=>t.value()??a.id,r.lastValue()===void 0&&r.setLastValue(i));const u=Tn(()=>n.triggerRef(),()=>"button"),f=D(()=>{var b;return u()==="a"&&((b=n.triggerRef())==null?void 0:b.getAttribute("href"))!=null});U(ct(()=>r==null?void 0:r.value(),b=>{var p;f()&&b===i()&&((p=n.triggerRef())==null||p.focus())}));const g=()=>{r!==void 0?n.isOpen()?r.value()===i()&&r.closeMenu():(r.autoFocusMenu()||r.setAutoFocusMenu(!0),n.open(!1)):n.toggle(!0)},c=b=>{ce(b,a.onPointerDown),b.currentTarget.dataset.pointerType=b.pointerType,!a.disabled&&b.pointerType!=="touch"&&b.button===0&&g()},d=b=>{ce(b,a.onClick),a.disabled||b.currentTarget.dataset.pointerType==="touch"&&g()},h=b=>{if(ce(b,a.onKeyDown),!a.disabled){if(f())switch(b.key){case"Enter":case" ":return}switch(b.key){case"Enter":case" ":case Do.first(t.orientation()):b.stopPropagation(),b.preventDefault(),Va(b.currentTarget),n.open("first"),r==null||r.setAutoFocusMenu(!0),r==null||r.setValue(i);break;case Do.last(t.orientation()):b.stopPropagation(),b.preventDefault(),n.open("last");break;case an.next(o(),t.orientation()):if(r===void 0)break;b.stopPropagation(),b.preventDefault(),r.nextMenu();break;case an.previous(o(),t.orientation()):if(r===void 0)break;b.stopPropagation(),b.preventDefault(),r.previousMenu();break}}},y=b=>{var p;ce(b,a.onMouseOver),((p=n.triggerRef())==null?void 0:p.dataset.pointerType)!=="touch"&&!a.disabled&&r!==void 0&&r.value()!==void 0&&r.setValue(i)},m=b=>{ce(b,a.onFocus),r!==void 0&&b.currentTarget.dataset.pointerType!=="touch"&&r.setValue(i)};return U(()=>j(n.registerTriggerId(a.id))),v(fr,W({ref(b){const p=Me(n.setTriggerRef,a.ref);typeof p=="function"&&p(b)},get"data-kb-menu-value-trigger"(){return t.value()},get id(){return a.id},get disabled(){return a.disabled},"aria-haspopup":"true",get"aria-expanded"(){return n.isOpen()},get"aria-controls"(){return D(()=>!!n.isOpen())()?n.contentId():void 0},get"data-highlighted"(){return i()!==void 0&&(r==null?void 0:r.value())===i()?!0:void 0},get tabIndex(){return r!==void 0?r.value()===i()||r.lastValue()===i()?0:-1:void 0},onPointerDown:c,onMouseOver:y,onClick:d,onKeyDown:h,onFocus:m,role:r!==void 0?"menuitem":void 0},()=>n.dataset(),l))}var tc=we();function Hi(){return $e(tc)}function ji(e){let t;const n=et(),r=gt(),o=On(),s=Hi(),{direction:a}=$t(),l=X({id:n.generateId(`content-${Ne()}`)},e),[i,u]=oe(l,["ref","id","style","onOpenAutoFocus","onCloseAutoFocus","onEscapeKeyDown","onFocusOutside","onPointerEnter","onPointerMove","onKeyDown","onMouseDown","onFocusIn","onFocusOut"]);let f=0;const g=()=>r.parentMenuContext()==null&&o===void 0&&n.isModal(),c=Ku({selectionManager:r.listState().selectionManager,collection:r.listState().collection,autoFocus:r.autoFocus,deferAutoFocus:!0,shouldFocusWrap:!0,disallowTypeAhead:()=>!r.listState().selectionManager().isFocused(),orientation:()=>n.orientation()==="horizontal"?"vertical":"horizontal"},()=>t);Bu({trapFocus:()=>g()&&r.isOpen(),onMountAutoFocus:x=>{var w;o===void 0&&((w=i.onOpenAutoFocus)==null||w.call(i,x))},onUnmountAutoFocus:i.onCloseAutoFocus},()=>t);const d=x=>{if(Ke(x.currentTarget,x.target)&&(x.key==="Tab"&&r.isOpen()&&x.preventDefault(),o!==void 0&&x.currentTarget.getAttribute("aria-haspopup")!=="true"))switch(x.key){case an.next(a(),n.orientation()):x.stopPropagation(),x.preventDefault(),r.close(!0),o.setAutoFocusMenu(!0),o.nextMenu();break;case an.previous(a(),n.orientation()):if(x.currentTarget.hasAttribute("data-closed"))break;x.stopPropagation(),x.preventDefault(),r.close(!0),o.setAutoFocusMenu(!0),o.previousMenu();break}},h=x=>{var w;(w=i.onEscapeKeyDown)==null||w.call(i,x),o==null||o.setAutoFocusMenu(!1),r.close(!0)},y=x=>{var w;(w=i.onFocusOutside)==null||w.call(i,x),n.isModal()&&x.preventDefault()},m=x=>{var w,$;ce(x,i.onPointerEnter),r.isOpen()&&((w=r.parentMenuContext())==null||w.listState().selectionManager().setFocused(!1),($=r.parentMenuContext())==null||$.listState().selectionManager().setFocusedKey(void 0))},b=x=>{if(ce(x,i.onPointerMove),x.pointerType!=="mouse")return;const w=x.target,$=f!==x.clientX;Ke(x.currentTarget,w)&&$&&(r.setPointerDir(x.clientX>f?"right":"left"),f=x.clientX)};U(()=>j(r.registerContentId(i.id)));const p={ref:Me(x=>{r.setContentRef(x),t=x},i.ref),role:"menu",get id(){return i.id},get tabIndex(){return c.tabIndex()},get"aria-labelledby"(){return r.triggerId()},onKeyDown:be([i.onKeyDown,c.onKeyDown,d]),onMouseDown:be([i.onMouseDown,c.onMouseDown]),onFocusIn:be([i.onFocusIn,c.onFocusIn]),onFocusOut:be([i.onFocusOut,c.onFocusOut]),onPointerEnter:m,onPointerMove:b,get"data-orientation"(){return n.orientation()}};return v(B,{get when(){return r.contentPresent()},get children(){return v(B,{get when(){return s===void 0||r.parentMenuContext()!=null},get fallback(){return v(de,W({as:"div"},()=>r.dataset(),p,u))},get children(){return v(Ei.Positioner,{get children(){return v(_u,W({get disableOutsidePointerEvents(){return D(()=>!!g())()&&r.isOpen()},get excludedElements(){return[r.triggerRef]},bypassTopMostLayerCheck:!0,get style(){return An({"--kb-menu-content-transform-origin":"var(--kb-popper-content-transform-origin)",position:"relative"},i.style)},onEscapeKeyDown:h,onFocusOutside:y,get onDismiss(){return r.close}},()=>r.dataset(),p,u))}})}})}})}function nc(e){let t;const n=et(),r=gt(),[o,s]=oe(e,["ref"]);return Ju({element:()=>t??null,enabled:()=>r.contentPresent()&&n.preventScroll()}),v(ji,W({ref(a){const l=Me(i=>{t=i},o.ref);typeof l=="function"&&l(a)}},s))}var Wi=we();function rc(){const e=$e(Wi);if(e===void 0)throw new Error("[kobalte]: `useMenuGroupContext` must be used within a `Menu.Group` component");return e}function Cr(e){const t=et(),n=X({id:t.generateId(`group-${Ne()}`)},e),[r,o]=R(),s={generateId:un(()=>n.id),registerLabelId:Be(o)};return v(Wi.Provider,{value:s,get children(){return v(de,W({as:"div",role:"group",get"aria-labelledby"(){return r()}},n))}})}function Qi(e){const t=rc(),n=X({id:t.generateId("label")},e),[r,o]=oe(n,["id"]);return U(()=>j(t.registerLabelId(r.id))),v(de,W({as:"span",get id(){return r.id},"aria-hidden":"true"},o))}function Yi(e){const t=gt(),n=X({children:"▼"},e);return v(de,W({as:"span","aria-hidden":"true"},()=>t.dataset(),n))}function Xi(e){return v($r,W({role:"menuitem",closeOnSelect:!0},e))}function Zi(e){const t=wr(),n=X({id:t.generateId("description")},e),[r,o]=oe(n,["id"]);return U(()=>j(t.registerDescription(r.id))),v(de,W({as:"div",get id(){return r.id}},()=>t.dataset(),o))}function Ji(e){const t=wr(),n=X({id:t.generateId("indicator")},e),[r,o]=oe(n,["forceMount"]);return v(B,{get when(){return r.forceMount||t.isChecked()},get children(){return v(de,W({as:"div"},()=>t.dataset(),o))}})}function es(e){const t=wr(),n=X({id:t.generateId("label")},e),[r,o]=oe(n,["ref","id"]);return U(()=>j(t.registerLabel(r.id))),v(de,W({as:"div",ref(s){const a=Me(t.setLabelRef,r.ref);typeof a=="function"&&a(s)},get id(){return r.id}},()=>t.dataset(),o))}function ts(e){const t=gt();return v(B,{get when(){return t.contentPresent()},get children(){return v(zo,e)}})}var ns=we();function oc(){const e=$e(ns);if(e===void 0)throw new Error("[kobalte]: `useMenuRadioGroupContext` must be used within a `Menu.RadioGroup` component");return e}function rs(e){const n=et().generateId(`radiogroup-${Ne()}`),r=X({id:n},e),[o,s]=oe(r,["value","defaultValue","onChange","disabled"]),[a,l]=dn({value:()=>o.value,defaultValue:()=>o.defaultValue,onChange:u=>{var f;return(f=o.onChange)==null?void 0:f.call(o,u)}}),i={isDisabled:()=>o.disabled,isSelectedValue:u=>u===a(),setSelectedValue:l};return v(ns.Provider,{value:i,get children(){return v(Cr,s)}})}function os(e){const t=oc(),n=X({closeOnSelect:!1},e),[r,o]=oe(n,["value","onSelect"]);return v($r,W({role:"menuitemradio",get checked(){return t.isSelectedValue(r.value)},onSelect:()=>{var a;(a=r.onSelect)==null||a.call(r),t.setSelectedValue(r.value)}},o))}function ic(e,t,n){const r=e.split("-")[0],o=n.getBoundingClientRect(),s=[],a=t.clientX,l=t.clientY;switch(r){case"top":s.push([a,l+5]),s.push([o.left,o.bottom]),s.push([o.left,o.top]),s.push([o.right,o.top]),s.push([o.right,o.bottom]);break;case"right":s.push([a-5,l]),s.push([o.left,o.top]),s.push([o.right,o.top]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]);break;case"bottom":s.push([a,l-5]),s.push([o.right,o.top]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]),s.push([o.left,o.top]);break;case"left":s.push([a+5,l]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]),s.push([o.left,o.top]),s.push([o.right,o.top]);break}return s}function sc(e,t){return t?Ua([e.clientX,e.clientY],t):!1}function is(e){const t=et(),n=oi(),r=Bi(),o=On(),s=Hi(),a=X({placement:t.orientation()==="horizontal"?"bottom-start":"right-start"},e),[l,i]=oe(a,["open","defaultOpen","onOpenChange"]);let u=0,f=null,g="right";const[c,d]=R(),[h,y]=R(),[m,b]=R(),[p,x]=R(),[w,$]=R(!0),[O,T]=R(i.placement),[_,C]=R([]),[I,N]=R([]),{DomCollectionProvider:G}=sl({items:I,onItemsChange:N}),te=Mi({open:()=>l.open,defaultOpen:()=>l.defaultOpen,onOpenChange:H=>{var Ce;return(Ce=l.onOpenChange)==null?void 0:Ce.call(l,H)}}),{present:Z}=fi({show:()=>t.forceMount()||te.isOpen(),element:()=>p()??null}),ie=Sl({selectionMode:"none",dataSource:I}),z=H=>{$(H),te.open()},Q=(H=!1)=>{te.close(),H&&r&&r.close(!0)},J=H=>{$(H),te.toggle()},le=()=>{const H=p();H&&(Ee(H),ie.selectionManager().setFocused(!0),ie.selectionManager().setFocusedKey(void 0))},ye=()=>{s!=null?setTimeout(()=>le()):le()},Ae=H=>{C(Se=>[...Se,H]);const Ce=r==null?void 0:r.registerNestedMenu(H);return()=>{C(Se=>Qn(Se,H)),Ce==null||Ce()}},ge=H=>g===(f==null?void 0:f.side)&&sc(H,f==null?void 0:f.area),De=H=>{ge(H)&&H.preventDefault()},M=H=>{ge(H)||ye()},fe=H=>{ge(H)&&H.preventDefault()};Uu({isDisabled:()=>!(r==null&&te.isOpen()&&t.isModal()),targets:()=>[p(),..._()].filter(Boolean)}),U(()=>{const H=p();if(!H||!r)return;const Ce=r.registerNestedMenu(H);j(()=>{Ce()})}),U(()=>{r===void 0&&(o==null||o.registerMenu(t.value(),[p(),..._()]))}),U(()=>{var H;r!==void 0||o===void 0||(o.value()===t.value()?((H=m())==null||H.focus(),o.autoFocusMenu()&&z(!0)):Q())}),U(()=>{r!==void 0||o===void 0||te.isOpen()&&o.setValue(t.value())}),j(()=>{r===void 0&&(o==null||o.unregisterMenu(t.value()))});const ht={dataset:D(()=>({"data-expanded":te.isOpen()?"":void 0,"data-closed":te.isOpen()?void 0:""})),isOpen:te.isOpen,contentPresent:Z,nestedMenus:_,currentPlacement:O,pointerGraceTimeoutId:()=>u,autoFocus:w,listState:()=>ie,parentMenuContext:()=>r,triggerRef:m,contentRef:p,triggerId:c,contentId:h,setTriggerRef:b,setContentRef:x,open:z,close:Q,toggle:J,focusContent:ye,onItemEnter:De,onItemLeave:M,onTriggerLeave:fe,setPointerDir:H=>g=H,setPointerGraceTimeoutId:H=>u=H,setPointerGraceIntent:H=>f=H,registerNestedMenu:Ae,registerItemToParentDomCollection:n==null?void 0:n.registerItem,registerTriggerId:Be(d),registerContentId:Be(y)};return v(G,{get children(){return v(Ki.Provider,{value:ht,get children(){return v(B,{when:s===void 0,get fallback(){return i.children},get children(){return v(Ei,W({anchorRef:m,contentRef:p,onCurrentPlacementChange:T},i))}})}})}})}function ss(e){const{direction:t}=$t();return v(is,W({get placement(){return t()==="rtl"?"left-start":"right-start"},flip:!0},e))}var ac={close:(e,t)=>e==="ltr"?[t==="horizontal"?"ArrowLeft":"ArrowUp"]:[t==="horizontal"?"ArrowRight":"ArrowDown"]};function as(e){const t=gt(),n=et(),[r,o]=oe(e,["onFocusOutside","onKeyDown"]),{direction:s}=$t();return v(ji,W({onOpenAutoFocus:f=>{f.preventDefault()},onCloseAutoFocus:f=>{f.preventDefault()},onFocusOutside:f=>{var c;(c=r.onFocusOutside)==null||c.call(r,f);const g=f.target;Ke(t.triggerRef(),g)||t.close()},onKeyDown:f=>{ce(f,r.onKeyDown);const g=Ke(f.currentTarget,f.target),c=ac.close(s(),n.orientation()).includes(f.key),d=t.parentMenuContext()!=null;g&&c&&d&&(t.close(),Ee(t.triggerRef()))}},o))}var Mo=["Enter"," "],lc={open:(e,t)=>e==="ltr"?[...Mo,t==="horizontal"?"ArrowRight":"ArrowDown"]:[...Mo,t==="horizontal"?"ArrowLeft":"ArrowUp"]};function ls(e){let t;const n=et(),r=gt(),o=X({id:n.generateId(`sub-trigger-${Ne()}`)},e),[s,a]=oe(o,["ref","id","textValue","disabled","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]);let l=null;const i=()=>{l&&window.clearTimeout(l),l=null},{direction:u}=$t(),f=()=>s.id,g=()=>{const x=r.parentMenuContext();if(x==null)throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");return x.listState().selectionManager()},c=()=>r.listState().collection(),d=()=>g().focusedKey()===f(),h=di({key:f,selectionManager:g,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>s.disabled},()=>t),y=x=>{ce(x,s.onClick),!r.isOpen()&&!s.disabled&&r.open(!0)},m=x=>{var $;if(ce(x,s.onPointerMove),x.pointerType!=="mouse")return;const w=r.parentMenuContext();if(w==null||w.onItemEnter(x),!x.defaultPrevented){if(s.disabled){w==null||w.onItemLeave(x);return}!r.isOpen()&&!l&&(($=r.parentMenuContext())==null||$.setPointerGraceIntent(null),l=window.setTimeout(()=>{r.open(!1),i()},100)),w==null||w.onItemEnter(x),x.defaultPrevented||(r.listState().selectionManager().isFocused()&&(r.listState().selectionManager().setFocused(!1),r.listState().selectionManager().setFocusedKey(void 0)),Ee(x.currentTarget),w==null||w.listState().selectionManager().setFocused(!0),w==null||w.listState().selectionManager().setFocusedKey(f()))}},b=x=>{if(ce(x,s.onPointerLeave),x.pointerType!=="mouse")return;i();const w=r.parentMenuContext(),$=r.contentRef();if($){w==null||w.setPointerGraceIntent({area:ic(r.currentPlacement(),x,$),side:r.currentPlacement().split("-")[0]}),window.clearTimeout(w==null?void 0:w.pointerGraceTimeoutId());const O=window.setTimeout(()=>{w==null||w.setPointerGraceIntent(null)},300);w==null||w.setPointerGraceTimeoutId(O)}else{if(w==null||w.onTriggerLeave(x),x.defaultPrevented)return;w==null||w.setPointerGraceIntent(null)}w==null||w.onItemLeave(x)},p=x=>{ce(x,s.onKeyDown),!x.repeat&&(s.disabled||lc.open(u(),n.orientation()).includes(x.key)&&(x.stopPropagation(),x.preventDefault(),g().setFocused(!1),g().setFocusedKey(void 0),r.isOpen()||r.open("first"),r.focusContent(),r.listState().selectionManager().setFocused(!0),r.listState().selectionManager().setFocusedKey(c().getFirstKey())))};return U(()=>{if(r.registerItemToParentDomCollection==null)throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");const x=r.registerItemToParentDomCollection({ref:()=>t,type:"item",key:f(),textValue:s.textValue??(t==null?void 0:t.textContent)??"",disabled:s.disabled??!1});j(x)}),U(ct(()=>{var x;return(x=r.parentMenuContext())==null?void 0:x.pointerGraceTimeoutId()},x=>{j(()=>{var w;window.clearTimeout(x),(w=r.parentMenuContext())==null||w.setPointerGraceIntent(null)})})),U(()=>j(r.registerTriggerId(s.id))),j(()=>{i()}),v(de,W({as:"div",ref(x){const w=Me($=>{r.setTriggerRef($),t=$},s.ref);typeof w=="function"&&w(x)},get id(){return s.id},role:"menuitem",get tabIndex(){return h.tabIndex()},"aria-haspopup":"true",get"aria-expanded"(){return r.isOpen()},get"aria-controls"(){return D(()=>!!r.isOpen())()?r.contentId():void 0},get"aria-disabled"(){return s.disabled},get"data-key"(){return h.dataKey()},get"data-highlighted"(){return d()?"":void 0},get"data-disabled"(){return s.disabled?"":void 0},get onPointerDown(){return be([s.onPointerDown,h.onPointerDown])},get onPointerUp(){return be([s.onPointerUp,h.onPointerUp])},get onClick(){return be([y,h.onClick])},get onKeyDown(){return be([p,h.onKeyDown])},get onMouseDown(){return be([s.onMouseDown,h.onMouseDown])},get onFocus(){return be([s.onFocus,h.onFocus])},onPointerMove:m,onPointerLeave:b},()=>r.dataset(),a))}function uc(e){const t=On(),n=`menu-${Ne()}`,r=X({id:n,modal:!0},e),[o,s]=oe(r,["id","modal","preventScroll","forceMount","open","defaultOpen","onOpenChange","value","orientation"]),a=Mi({open:()=>o.open,defaultOpen:()=>o.defaultOpen,onOpenChange:i=>{var u;return(u=o.onOpenChange)==null?void 0:u.call(o,i)}}),l={isModal:()=>o.modal??!0,preventScroll:()=>o.preventScroll??l.isModal(),forceMount:()=>o.forceMount??!1,generateId:un(()=>o.id),value:()=>o.value,orientation:()=>o.orientation??(t==null?void 0:t.orientation())??"horizontal"};return v(Ui.Provider,{value:l,get children(){return v(is,W({get open(){return a.isOpen()},get onOpenChange(){return a.setIsOpen}},s))}})}var cc={};In(cc,{Root:()=>qn,Separator:()=>dc});function qn(e){let t;const n=X({orientation:"horizontal"},e),[r,o]=oe(n,["ref","orientation"]),s=Tn(()=>t,()=>"hr");return v(de,W({as:"hr",ref(a){const l=Me(i=>t=i,r.ref);typeof l=="function"&&l(a)},get role(){return s()!=="hr"?"separator":void 0},get"aria-orientation"(){return r.orientation==="vertical"?"vertical":void 0},get"data-orientation"(){return r.orientation}},o))}var dc=qn,he={};In(he,{Arrow:()=>xr,CheckboxItem:()=>Vi,Content:()=>us,DropdownMenu:()=>fc,Group:()=>Cr,GroupLabel:()=>Qi,Icon:()=>Yi,Item:()=>Xi,ItemDescription:()=>Zi,ItemIndicator:()=>Ji,ItemLabel:()=>es,Portal:()=>ts,RadioGroup:()=>rs,RadioItem:()=>os,Root:()=>cs,Separator:()=>qn,Sub:()=>ss,SubContent:()=>as,SubTrigger:()=>ls,Trigger:()=>Gi});function us(e){const t=et(),n=gt(),[r,o]=oe(e,["onCloseAutoFocus","onInteractOutside"]);let s=!1;return v(nc,W({onCloseAutoFocus:i=>{var u;(u=r.onCloseAutoFocus)==null||u.call(r,i),s||Ee(n.triggerRef()),s=!1,i.preventDefault()},onInteractOutside:i=>{var u;(u=r.onInteractOutside)==null||u.call(r,i),(!t.isModal()||i.detail.isContextMenu)&&(s=!0)}},o))}function cs(e){const t=`dropdownmenu-${Ne()}`,n=X({id:t},e);return v(uc,n)}var fc=Object.assign(cs,{Arrow:xr,CheckboxItem:Vi,Content:us,Group:Cr,GroupLabel:Qi,Icon:Yi,Item:Xi,ItemDescription:Zi,ItemIndicator:Ji,ItemLabel:es,Portal:ts,RadioGroup:rs,RadioItem:os,Separator:qn,Sub:ss,SubContent:as,SubTrigger:ls,Trigger:Gi}),S={colors:{inherit:"inherit",current:"currentColor",transparent:"transparent",black:"#000000",white:"#ffffff",neutral:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},darkGray:{50:"#525c7a",100:"#49536e",200:"#414962",300:"#394056",400:"#313749",500:"#292e3d",600:"#212530",700:"#191c24",800:"#111318",900:"#0b0d10"},gray:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},blue:{25:"#F5FAFF",50:"#EFF8FF",100:"#D1E9FF",200:"#B2DDFF",300:"#84CAFF",400:"#53B1FD",500:"#2E90FA",600:"#1570EF",700:"#175CD3",800:"#1849A9",900:"#194185"},green:{25:"#F6FEF9",50:"#ECFDF3",100:"#D1FADF",200:"#A6F4C5",300:"#6CE9A6",400:"#32D583",500:"#12B76A",600:"#039855",700:"#027A48",800:"#05603A",900:"#054F31"},red:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"},yellow:{25:"#FFFCF5",50:"#FFFAEB",100:"#FEF0C7",200:"#FEDF89",300:"#FEC84B",400:"#FDB022",500:"#F79009",600:"#DC6803",700:"#B54708",800:"#93370D",900:"#7A2E0E"},purple:{25:"#FAFAFF",50:"#F4F3FF",100:"#EBE9FE",200:"#D9D6FE",300:"#BDB4FE",400:"#9B8AFB",500:"#7A5AF8",600:"#6938EF",700:"#5925DC",800:"#4A1FB8",900:"#3E1C96"},teal:{25:"#F6FEFC",50:"#F0FDF9",100:"#CCFBEF",200:"#99F6E0",300:"#5FE9D0",400:"#2ED3B7",500:"#15B79E",600:"#0E9384",700:"#107569",800:"#125D56",900:"#134E48"},pink:{25:"#fdf2f8",50:"#fce7f3",100:"#fbcfe8",200:"#f9a8d4",300:"#f472b6",400:"#ec4899",500:"#db2777",600:"#be185d",700:"#9d174d",800:"#831843",900:"#500724"},cyan:{25:"#ecfeff",50:"#cffafe",100:"#a5f3fc",200:"#67e8f9",300:"#22d3ee",400:"#06b6d4",500:"#0891b2",600:"#0e7490",700:"#155e75",800:"#164e63",900:"#083344"}},alpha:{100:"ff",90:"e5",80:"cc",70:"b3",60:"99",50:"80",40:"66",30:"4d",20:"33",10:"1a",0:"00"},font:{size:{"2xs":"calc(var(--tsqd-font-size) * 0.625)",xs:"calc(var(--tsqd-font-size) * 0.75)",sm:"calc(var(--tsqd-font-size) * 0.875)",md:"var(--tsqd-font-size)",lg:"calc(var(--tsqd-font-size) * 1.125)",xl:"calc(var(--tsqd-font-size) * 1.25)","2xl":"calc(var(--tsqd-font-size) * 1.5)","3xl":"calc(var(--tsqd-font-size) * 1.875)","4xl":"calc(var(--tsqd-font-size) * 2.25)","5xl":"calc(var(--tsqd-font-size) * 3)","6xl":"calc(var(--tsqd-font-size) * 3.75)","7xl":"calc(var(--tsqd-font-size) * 4.5)","8xl":"calc(var(--tsqd-font-size) * 6)","9xl":"calc(var(--tsqd-font-size) * 8)"},lineHeight:{xs:"calc(var(--tsqd-font-size) * 1)",sm:"calc(var(--tsqd-font-size) * 1.25)",md:"calc(var(--tsqd-font-size) * 1.5)",lg:"calc(var(--tsqd-font-size) * 1.75)",xl:"calc(var(--tsqd-font-size) * 2)","2xl":"calc(var(--tsqd-font-size) * 2.25)","3xl":"calc(var(--tsqd-font-size) * 2.5)","4xl":"calc(var(--tsqd-font-size) * 2.75)","5xl":"calc(var(--tsqd-font-size) * 3)","6xl":"calc(var(--tsqd-font-size) * 3.25)","7xl":"calc(var(--tsqd-font-size) * 3.5)","8xl":"calc(var(--tsqd-font-size) * 3.75)","9xl":"calc(var(--tsqd-font-size) * 4)"},weight:{thin:"100",extralight:"200",light:"300",normal:"400",medium:"500",semibold:"600",bold:"700",extrabold:"800",black:"900"}},breakpoints:{xs:"320px",sm:"640px",md:"768px",lg:"1024px",xl:"1280px","2xl":"1536px"},border:{radius:{none:"0px",xs:"calc(var(--tsqd-font-size) * 0.125)",sm:"calc(var(--tsqd-font-size) * 0.25)",md:"calc(var(--tsqd-font-size) * 0.375)",lg:"calc(var(--tsqd-font-size) * 0.5)",xl:"calc(var(--tsqd-font-size) * 0.75)","2xl":"calc(var(--tsqd-font-size) * 1)","3xl":"calc(var(--tsqd-font-size) * 1.5)",full:"9999px"}},size:{0:"0px",.25:"calc(var(--tsqd-font-size) * 0.0625)",.5:"calc(var(--tsqd-font-size) * 0.125)",1:"calc(var(--tsqd-font-size) * 0.25)",1.5:"calc(var(--tsqd-font-size) * 0.375)",2:"calc(var(--tsqd-font-size) * 0.5)",2.5:"calc(var(--tsqd-font-size) * 0.625)",3:"calc(var(--tsqd-font-size) * 0.75)",3.5:"calc(var(--tsqd-font-size) * 0.875)",4:"calc(var(--tsqd-font-size) * 1)",4.5:"calc(var(--tsqd-font-size) * 1.125)",5:"calc(var(--tsqd-font-size) * 1.25)",5.5:"calc(var(--tsqd-font-size) * 1.375)",6:"calc(var(--tsqd-font-size) * 1.5)",6.5:"calc(var(--tsqd-font-size) * 1.625)",7:"calc(var(--tsqd-font-size) * 1.75)",8:"calc(var(--tsqd-font-size) * 2)",9:"calc(var(--tsqd-font-size) * 2.25)",10:"calc(var(--tsqd-font-size) * 2.5)",11:"calc(var(--tsqd-font-size) * 2.75)",12:"calc(var(--tsqd-font-size) * 3)",14:"calc(var(--tsqd-font-size) * 3.5)",16:"calc(var(--tsqd-font-size) * 4)",20:"calc(var(--tsqd-font-size) * 5)",24:"calc(var(--tsqd-font-size) * 6)",28:"calc(var(--tsqd-font-size) * 7)",32:"calc(var(--tsqd-font-size) * 8)",36:"calc(var(--tsqd-font-size) * 9)",40:"calc(var(--tsqd-font-size) * 10)",44:"calc(var(--tsqd-font-size) * 11)",48:"calc(var(--tsqd-font-size) * 12)",52:"calc(var(--tsqd-font-size) * 13)",56:"calc(var(--tsqd-font-size) * 14)",60:"calc(var(--tsqd-font-size) * 15)",64:"calc(var(--tsqd-font-size) * 16)",72:"calc(var(--tsqd-font-size) * 18)",80:"calc(var(--tsqd-font-size) * 20)",96:"calc(var(--tsqd-font-size) * 24)"},shadow:{xs:(e="rgb(0 0 0 / 0.1)")=>"0 1px 2px 0 rgb(0 0 0 / 0.05)",sm:(e="rgb(0 0 0 / 0.1)")=>`0 1px 3px 0 ${e}, 0 1px 2px -1px ${e}`,md:(e="rgb(0 0 0 / 0.1)")=>`0 4px 6px -1px ${e}, 0 2px 4px -2px ${e}`,lg:(e="rgb(0 0 0 / 0.1)")=>`0 10px 15px -3px ${e}, 0 4px 6px -4px ${e}`,xl:(e="rgb(0 0 0 / 0.1)")=>`0 20px 25px -5px ${e}, 0 8px 10px -6px ${e}`,"2xl":(e="rgb(0 0 0 / 0.25)")=>`0 25px 50px -12px ${e}`,inner:(e="rgb(0 0 0 / 0.05)")=>`inset 0 2px 4px 0 ${e}`,none:()=>"none"},zIndices:{hide:-1,auto:"auto",base:0,docked:10,dropdown:1e3,sticky:1100,banner:1200,overlay:1300,modal:1400,popover:1500,skipLink:1600,toast:1700,tooltip:1800}},gc=q('<svg width=14 height=14 viewBox="0 0 14 14"fill=none xmlns=http://www.w3.org/2000/svg><path d="M13 13L9.00007 9M10.3333 5.66667C10.3333 8.244 8.244 10.3333 5.66667 10.3333C3.08934 10.3333 1 8.244 1 5.66667C1 3.08934 3.08934 1 5.66667 1C8.244 1 10.3333 3.08934 10.3333 5.66667Z"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),hc=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),yc=q('<svg width=10 height=6 viewBox="0 0 10 6"fill=none xmlns=http://www.w3.org/2000/svg><path d="M1 1L5 5L9 1"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),mc=q('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 13.3333V2.66667M8 2.66667L4 6.66667M8 2.66667L12 6.66667"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),Sr=q('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 2.66667V13.3333M8 13.3333L4 9.33333M8 13.3333L12 9.33333"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),vc=q('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2v2m0 16v2M4 12H2m4.314-5.686L4.9 4.9m12.786 1.414L19.1 4.9M6.314 17.69 4.9 19.104m12.786-1.414 1.414 1.414M22 12h-2m-3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),bc=q('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M22 15.844a10.424 10.424 0 0 1-4.306.925c-5.779 0-10.463-4.684-10.463-10.462 0-1.536.33-2.994.925-4.307A10.464 10.464 0 0 0 2 11.538C2 17.316 6.684 22 12.462 22c4.243 0 7.896-2.526 9.538-6.156Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),pc=q('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 14.72 22 13.88 22 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 3 18.88 3 17.2 3H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C2 5.28 2 6.12 2 7.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 17 5.12 17 6.8 17Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),xc=q('<svg stroke=currentColor fill=currentColor stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M0 0h24v24H0z"></path><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z">'),wc=q('<svg stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M24 .01c0-.01 0-.01 0 0L0 0v24h24V.01zM0 0h24v24H0V0zm0 0h24v24H0V0z"></path><path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7l2-2zm-4 4a9.793 9.793 0 00-4.49-2.56l3.53 3.53.96-.97zM2 3.05L5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24A9.684 9.684 0 005 13v.01L6.99 15a7.042 7.042 0 014.92-2.06L18.98 20l1.27-1.26L3.29 1.79 2 3.05zM9 17l3 3 3-3a4.237 4.237 0 00-6 0z">'),$c=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.3951 19.3711L9.97955 20.6856C10.1533 21.0768 10.4368 21.4093 10.7958 21.6426C11.1547 21.8759 11.5737 22.0001 12.0018 22C12.4299 22.0001 12.8488 21.8759 13.2078 21.6426C13.5667 21.4093 13.8503 21.0768 14.024 20.6856L14.6084 19.3711C14.8165 18.9047 15.1664 18.5159 15.6084 18.26C16.0532 18.0034 16.5678 17.8941 17.0784 17.9478L18.5084 18.1C18.9341 18.145 19.3637 18.0656 19.7451 17.8713C20.1265 17.6771 20.4434 17.3763 20.6573 17.0056C20.8715 16.635 20.9735 16.2103 20.9511 15.7829C20.9286 15.3555 20.7825 14.9438 20.5307 14.5978L19.684 13.4344C19.3825 13.0171 19.2214 12.5148 19.224 12C19.2239 11.4866 19.3865 10.9864 19.6884 10.5711L20.5351 9.40778C20.787 9.06175 20.933 8.65007 20.9555 8.22267C20.978 7.79528 20.8759 7.37054 20.6618 7C20.4479 6.62923 20.131 6.32849 19.7496 6.13423C19.3681 5.93997 18.9386 5.86053 18.5129 5.90556L17.0829 6.05778C16.5722 6.11141 16.0577 6.00212 15.6129 5.74556C15.17 5.48825 14.82 5.09736 14.6129 4.62889L14.024 3.31444C13.8503 2.92317 13.5667 2.59072 13.2078 2.3574C12.8488 2.12408 12.4299 1.99993 12.0018 2C11.5737 1.99993 11.1547 2.12408 10.7958 2.3574C10.4368 2.59072 10.1533 2.92317 9.97955 3.31444L9.3951 4.62889C9.18803 5.09736 8.83798 5.48825 8.3951 5.74556C7.95032 6.00212 7.43577 6.11141 6.9251 6.05778L5.49066 5.90556C5.06499 5.86053 4.6354 5.93997 4.25397 6.13423C3.87255 6.32849 3.55567 6.62923 3.34177 7C3.12759 7.37054 3.02555 7.79528 3.04804 8.22267C3.07052 8.65007 3.21656 9.06175 3.46844 9.40778L4.3151 10.5711C4.61704 10.9864 4.77964 11.4866 4.77955 12C4.77964 12.5134 4.61704 13.0137 4.3151 13.4289L3.46844 14.5922C3.21656 14.9382 3.07052 15.3499 3.04804 15.7773C3.02555 16.2047 3.12759 16.6295 3.34177 17C3.55589 17.3706 3.8728 17.6712 4.25417 17.8654C4.63554 18.0596 5.06502 18.1392 5.49066 18.0944L6.92066 17.9422C7.43133 17.8886 7.94587 17.9979 8.39066 18.2544C8.83519 18.511 9.18687 18.902 9.3951 19.3711Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><path d="M12 15C13.6568 15 15 13.6569 15 12C15 10.3431 13.6568 9 12 9C10.3431 9 8.99998 10.3431 8.99998 12C8.99998 13.6569 10.3431 15 12 15Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Cc=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M16 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M11.5 12.5L17 7M17 7H12M17 7V12M6.2 21H8.8C9.9201 21 10.4802 21 10.908 20.782C11.2843 20.5903 11.5903 20.2843 11.782 19.908C12 19.4802 12 18.9201 12 17.8V15.2C12 14.0799 12 13.5198 11.782 13.092C11.5903 12.7157 11.2843 12.4097 10.908 12.218C10.4802 12 9.92011 12 8.8 12H6.2C5.0799 12 4.51984 12 4.09202 12.218C3.71569 12.4097 3.40973 12.7157 3.21799 13.092C3 13.5198 3 14.0799 3 15.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Sc=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path class=copier d="M8 8V5.2C8 4.0799 8 3.51984 8.21799 3.09202C8.40973 2.71569 8.71569 2.40973 9.09202 2.21799C9.51984 2 10.0799 2 11.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V12.8C22 13.9201 22 14.4802 21.782 14.908C21.5903 15.2843 21.2843 15.5903 20.908 15.782C20.4802 16 19.9201 16 18.8 16H16M5.2 22H12.8C13.9201 22 14.4802 22 14.908 21.782C15.2843 21.5903 15.5903 21.2843 15.782 20.908C16 20.4802 16 19.9201 16 18.8V11.2C16 10.0799 16 9.51984 15.782 9.09202C15.5903 8.71569 15.2843 8.40973 14.908 8.21799C14.4802 8 13.9201 8 12.8 8H5.2C4.0799 8 3.51984 8 3.09202 8.21799C2.71569 8.40973 2.40973 8.71569 2.21799 9.09202C2 9.51984 2 10.0799 2 11.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round stroke=currentColor>'),kc=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M2.5 21.4998L8.04927 19.3655C8.40421 19.229 8.58168 19.1607 8.74772 19.0716C8.8952 18.9924 9.0358 18.901 9.16804 18.7984C9.31692 18.6829 9.45137 18.5484 9.72028 18.2795L21 6.99982C22.1046 5.89525 22.1046 4.10438 21 2.99981C19.8955 1.89525 18.1046 1.89524 17 2.99981L5.72028 14.2795C5.45138 14.5484 5.31692 14.6829 5.20139 14.8318C5.09877 14.964 5.0074 15.1046 4.92823 15.2521C4.83911 15.4181 4.77085 15.5956 4.63433 15.9506L2.5 21.4998ZM2.5 21.4998L4.55812 16.1488C4.7054 15.7659 4.77903 15.5744 4.90534 15.4867C5.01572 15.4101 5.1523 15.3811 5.2843 15.4063C5.43533 15.4351 5.58038 15.5802 5.87048 15.8703L8.12957 18.1294C8.41967 18.4195 8.56472 18.5645 8.59356 18.7155C8.61877 18.8475 8.58979 18.9841 8.51314 19.0945C8.42545 19.2208 8.23399 19.2944 7.85107 19.4417L2.5 21.4998Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),ds=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Ec=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke=#F04438 stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Dc=q('<svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 xmlns=http://www.w3.org/2000/svg><rect class=list width=20 height=20 y=2 x=2 rx=2></rect><line class=list-item y1=7 y2=7 x1=6 x2=18></line><line class=list-item y2=12 y1=12 x1=6 x2=18></line><line class=list-item y1=17 y2=17 x1=6 x2=18>'),Mc=q('<svg viewBox="0 0 24 24"height=20 width=20 fill=none xmlns=http://www.w3.org/2000/svg><path d="M3 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Ac=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Fc=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><animateTransform attributeName=transform attributeType=XML type=rotate from=0 to=360 dur=2s repeatCount=indefinite>'),Tc=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Ic=q('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.5 15V9M14.5 15V9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Pc=q('<svg version=1.0 viewBox="0 0 633 633"><linearGradient x1=-666.45 x2=-666.45 y1=163.28 y2=163.99 gradientTransform="matrix(633 0 0 633 422177 -103358)"gradientUnits=userSpaceOnUse><stop stop-color=#6BDAFF offset=0></stop><stop stop-color=#F9FFB5 offset=.32></stop><stop stop-color=#FFA770 offset=.71></stop><stop stop-color=#FF7373 offset=1></stop></linearGradient><circle cx=316.5 cy=316.5 r=316.5></circle><defs><filter x=-137.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=316.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=316.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=316.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=272.2 y=308 width=176.9 height=129.3 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=272.2 y=308 width=176.9 height=129.3 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><line x1=436 x2=431 y1=403.2 y2=431.8 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=291 x2=280 y1=341.5 y2=403.5 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=332.9 x2=328.6 y1=384.1 y2=411.2 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><linearGradient x1=-670.75 x2=-671.59 y1=164.4 y2=164.49 gradientTransform="matrix(-184.16 -32.472 -11.461 64.997 -121359 -32126)"gradientUnits=userSpaceOnUse><stop stop-color=#EE2700 offset=0></stop><stop stop-color=#FF008E offset=1></stop></linearGradient><path d="m344.1 363 97.7 17.2c5.8 2.1 8.2 6.1 7.1 12.1s-4.7 9.2-11 9.9l-106-18.7-57.5-59.2c-3.2-4.8-2.9-9.1 0.8-12.8s8.3-4.4 13.7-2.1l55.2 53.6z"clip-rule=evenodd fill-rule=evenodd></path><line x1=428.2 x2=429.1 y1=384.5 y2=378 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=395.2 x2=396.1 y1=379.5 y2=373 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=362.2 x2=363.1 y1=373.5 y2=367.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=324.2 x2=328.4 y1=351.3 y2=347.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=303.2 x2=307.4 y1=331.3 y2=327.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line></g><defs><filter x=73.2 y=113.8 width=280.6 height=317.4 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=73.2 y=113.8 width=280.6 height=317.4 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-672.16 x2=-672.16 y1=165.03 y2=166.03 gradientTransform="matrix(-100.18 48.861 97.976 200.88 -83342 -93.059)"gradientUnits=userSpaceOnUse><stop stop-color=#A17500 offset=0></stop><stop stop-color=#5D2100 offset=1></stop></linearGradient><path d="m192.3 203c8.1 37.3 14 73.6 17.8 109.1 3.8 35.4 2.8 75.1-3 119.2l61.2-16.7c-15.6-59-25.2-97.9-28.6-116.6s-10.8-51.9-22.1-99.6l-25.3 4.6"clip-rule=evenodd fill-rule=evenodd></path><g stroke=#2F8A00><linearGradient x1=-660.23 x2=-660.23 y1=166.72 y2=167.72 gradientTransform="matrix(92.683 4.8573 -2.0259 38.657 61680 -3088.6)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9s-12.6-22.1-36.5-29.9c-15.9-5.2-34.4-1.5-55.5 11.1 15.9 14.3 29.5 22.6 40.7 24.9 16.8 3.6 51.3-6.1 51.3-6.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-661.36 x2=-661.36 y1=164.18 y2=165.18 gradientTransform="matrix(110 5.7648 -6.3599 121.35 73933 -15933)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5s-47.5-8.5-83.2 15.7c-23.8 16.2-34.3 49.3-31.6 99.4 30.3-27.8 52.1-48.5 65.2-61.9 19.8-20.2 49.6-53.2 49.6-53.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.79 x2=-656.79 y1=165.15 y2=166.15 gradientTransform="matrix(62.954 3.2993 -3.5023 66.828 42156 -8754.1)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9c-0.8-21.9 6-38 20.6-48.2s29.8-15.4 45.5-15.3c-6.1 21.4-14.5 35.8-25.2 43.4s-24.4 14.2-40.9 20.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-663.07 x2=-663.07 y1=165.44 y2=166.44 gradientTransform="matrix(152.47 7.9907 -3.0936 59.029 101884 -4318.7)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c31.9-30 64.1-39.7 96.7-29s50.8 30.4 54.6 59.1c-35.2-5.5-60.4-9.6-75.8-12.1-15.3-2.6-40.5-8.6-75.5-18z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-662.57 x2=-662.57 y1=164.44 y2=165.44 gradientTransform="matrix(136.46 7.1517 -5.2163 99.533 91536 -11442)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c35.8-7.6 65.6-0.2 89.2 22s37.7 49 42.3 80.3c-39.8-9.7-68.3-23.8-85.5-42.4s-32.5-38.5-46-59.9z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.43 x2=-656.43 y1=163.86 y2=164.86 gradientTransform="matrix(60.866 3.1899 -8.7773 167.48 41560 -25168)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c-33.6 13.8-53.6 35.7-60.1 65.6s-3.6 63.1 8.7 99.6c27.4-40.3 43.2-69.6 47.4-88s5.6-44.1 4-77.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><path d="m196.5 182.3c-14.8 21.6-25.1 41.4-30.8 59.4s-9.5 33-11.1 45.1"fill=none stroke-linecap=round stroke-width=8></path><path d="m194.9 185.7c-24.4 1.7-43.8 9-58.1 21.8s-24.7 25.4-31.3 37.8"fill=none stroke-linecap=round stroke-width=8></path><path d="m204.5 176.4c29.7-6.7 52-8.4 67-5.1s26.9 8.6 35.8 15.9"fill=none stroke-linecap=round stroke-width=8></path><path d="m196.5 181.4c20.3 9.9 38.2 20.5 53.9 31.9s27.4 22.1 35.1 32"fill=none stroke-linecap=round stroke-width=8></path></g></g><defs><filter x=50.5 y=399 width=532 height=633 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=50.5 y=399 width=532 height=633 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-666.06 x2=-666.23 y1=163.36 y2=163.75 gradientTransform="matrix(532 0 0 633 354760 -102959)"gradientUnits=userSpaceOnUse><stop stop-color=#FFF400 offset=0></stop><stop stop-color=#3C8700 offset=1></stop></linearGradient><ellipse cx=316.5 cy=715.5 rx=266 ry=316.5></ellipse></g><defs><filter x=391 y=-24 width=288 height=283 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=391 y=-24 width=288 height=283 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-664.56 x2=-664.56 y1=163.79 y2=164.79 gradientTransform="matrix(227 0 0 227 151421 -37204)"gradientUnits=userSpaceOnUse><stop stop-color=#FFDF00 offset=0></stop><stop stop-color=#FF9D00 offset=1></stop></linearGradient><circle cx=565.5 cy=89.5 r=113.5></circle><linearGradient x1=-644.5 x2=-645.77 y1=342 y2=342 gradientTransform="matrix(30 0 0 1 19770 -253)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=427 x2=397 y1=89 y2=89 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-641.56 x2=-642.83 y1=196.02 y2=196.07 gradientTransform="matrix(26.5 0 0 5.5 17439 -1025.5)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=430.5 x2=404 y1=55.5 y2=50 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-643.73 x2=-645 y1=185.83 y2=185.9 gradientTransform="matrix(29 0 0 8 19107 -1361)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=431 x2=402 y1=122 y2=130 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-638.94 x2=-640.22 y1=177.09 y2=177.39 gradientTransform="matrix(24 0 0 13 15783 -2145)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=442 x2=418 y1=153 y2=166 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-633.42 x2=-634.7 y1=172.41 y2=173.31 gradientTransform="matrix(20 0 0 19 13137 -3096)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=464 x2=444 y1=180 y2=199 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-619.05 x2=-619.52 y1=170.82 y2=171.82 gradientTransform="matrix(13.83 0 0 22.85 9050 -3703.4)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=491.4 x2=477.5 y1=203 y2=225.9 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-578.5 x2=-578.63 y1=170.31 y2=171.31 gradientTransform="matrix(7.5 0 0 24.5 4860 -3953)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=524.5 x2=517 y1=219.5 y2=244 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=666.5 x2=666.5 y1=170.31 y2=171.31 gradientTransform="matrix(.5 0 0 24.5 231.5 -3944)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=564.5 x2=565 y1=228.5 y2=253 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12>');function Lc(){return gc()}function fs(){return hc()}function nn(){return yc()}function Ao(){return mc()}function Fo(){return Sr()}function Oc(){return(()=>{var e=Sr();return e.style.setProperty("transform","rotate(90deg)"),e})()}function qc(){return(()=>{var e=Sr();return e.style.setProperty("transform","rotate(-90deg)"),e})()}function _c(){return vc()}function zc(){return bc()}function Rc(){return pc()}function Kc(){return xc()}function Bc(){return wc()}function Nc(){return $c()}function Uc(){return Cc()}function Vc(){return Sc()}function Gc(){return kc()}function Hc(e){return(()=>{var t=ds(),n=t.firstChild;return V(()=>A(n,"stroke",e.theme==="dark"?"#12B76A":"#027A48")),t})()}function jc(){return Ec()}function Wc(){return Dc()}function Qc(e){return[v(B,{get when(){return e.checked},get children(){var t=ds(),n=t.firstChild;return V(()=>A(n,"stroke",e.theme==="dark"?"#9B8AFB":"#6938EF")),t}}),v(B,{get when(){return!e.checked},get children(){var t=Mc(),n=t.firstChild;return V(()=>A(n,"stroke",e.theme==="dark"?"#9B8AFB":"#6938EF")),t}})]}function Yc(){return Ac()}function Xc(){return Fc()}function Zc(){return Tc()}function Jc(){return Ic()}function To(){const e=Ne();return(()=>{var t=Pc(),n=t.firstChild,r=n.nextSibling,o=r.nextSibling,s=o.firstChild,a=o.nextSibling,l=a.firstChild,i=a.nextSibling,u=i.nextSibling,f=u.firstChild,g=u.nextSibling,c=g.firstChild,d=g.nextSibling,h=d.nextSibling,y=h.firstChild,m=h.nextSibling,b=m.firstChild,p=m.nextSibling,x=p.nextSibling,w=x.firstChild,$=x.nextSibling,O=$.firstChild,T=$.nextSibling,_=T.nextSibling,C=_.firstChild,I=_.nextSibling,N=I.firstChild,G=I.nextSibling,te=G.nextSibling,Z=te.firstChild,ie=te.nextSibling,z=ie.firstChild,Q=ie.nextSibling,J=Q.nextSibling,le=J.firstChild,ye=J.nextSibling,Ae=ye.firstChild,ge=ye.nextSibling,De=ge.firstChild,M=De.nextSibling,fe=M.nextSibling,ee=fe.nextSibling,ht=ee.nextSibling,H=ge.nextSibling,Ce=H.firstChild,Se=H.nextSibling,It=Se.firstChild,Oe=Se.nextSibling,yt=Oe.firstChild,Ct=yt.nextSibling,tt=Ct.nextSibling,Ye=tt.firstChild,nt=Ye.nextSibling,P=nt.nextSibling,ne=P.nextSibling,me=ne.nextSibling,ae=me.nextSibling,se=ae.nextSibling,ue=se.nextSibling,ve=ue.nextSibling,re=ve.nextSibling,rt=re.nextSibling,ot=rt.nextSibling,Ge=Oe.nextSibling,St=Ge.firstChild,it=Ge.nextSibling,kt=it.firstChild,st=it.nextSibling,mt=st.firstChild,yn=mt.nextSibling,jt=st.nextSibling,mn=jt.firstChild,Pt=jt.nextSibling,vn=Pt.firstChild,Wt=Pt.nextSibling,Qt=Wt.firstChild,Yt=Qt.nextSibling,Lt=Yt.nextSibling,Er=Lt.nextSibling,Dr=Er.nextSibling,Mr=Dr.nextSibling,Ar=Mr.nextSibling,Fr=Ar.nextSibling,Tr=Fr.nextSibling,Ir=Tr.nextSibling,Pr=Ir.nextSibling,Lr=Pr.nextSibling,Or=Lr.nextSibling,qr=Or.nextSibling,_r=qr.nextSibling,zr=_r.nextSibling,Rr=zr.nextSibling,bs=Rr.nextSibling;return A(n,"id",`a-${e}`),A(r,"fill",`url(#a-${e})`),A(s,"id",`am-${e}`),A(a,"id",`b-${e}`),A(l,"filter",`url(#am-${e})`),A(i,"mask",`url(#b-${e})`),A(f,"id",`ah-${e}`),A(g,"id",`k-${e}`),A(c,"filter",`url(#ah-${e})`),A(d,"mask",`url(#k-${e})`),A(y,"id",`ae-${e}`),A(m,"id",`j-${e}`),A(b,"filter",`url(#ae-${e})`),A(p,"mask",`url(#j-${e})`),A(w,"id",`ai-${e}`),A($,"id",`i-${e}`),A(O,"filter",`url(#ai-${e})`),A(T,"mask",`url(#i-${e})`),A(C,"id",`aj-${e}`),A(I,"id",`h-${e}`),A(N,"filter",`url(#aj-${e})`),A(G,"mask",`url(#h-${e})`),A(Z,"id",`ag-${e}`),A(ie,"id",`g-${e}`),A(z,"filter",`url(#ag-${e})`),A(Q,"mask",`url(#g-${e})`),A(le,"id",`af-${e}`),A(ye,"id",`f-${e}`),A(Ae,"filter",`url(#af-${e})`),A(ge,"mask",`url(#f-${e})`),A(ee,"id",`m-${e}`),A(ht,"fill",`url(#m-${e})`),A(Ce,"id",`ak-${e}`),A(Se,"id",`e-${e}`),A(It,"filter",`url(#ak-${e})`),A(Oe,"mask",`url(#e-${e})`),A(yt,"id",`n-${e}`),A(Ct,"fill",`url(#n-${e})`),A(Ye,"id",`r-${e}`),A(nt,"fill",`url(#r-${e})`),A(P,"id",`s-${e}`),A(ne,"fill",`url(#s-${e})`),A(me,"id",`q-${e}`),A(ae,"fill",`url(#q-${e})`),A(se,"id",`p-${e}`),A(ue,"fill",`url(#p-${e})`),A(ve,"id",`o-${e}`),A(re,"fill",`url(#o-${e})`),A(rt,"id",`l-${e}`),A(ot,"fill",`url(#l-${e})`),A(St,"id",`al-${e}`),A(it,"id",`d-${e}`),A(kt,"filter",`url(#al-${e})`),A(st,"mask",`url(#d-${e})`),A(mt,"id",`u-${e}`),A(yn,"fill",`url(#u-${e})`),A(mn,"id",`ad-${e}`),A(Pt,"id",`c-${e}`),A(vn,"filter",`url(#ad-${e})`),A(Wt,"mask",`url(#c-${e})`),A(Qt,"id",`t-${e}`),A(Yt,"fill",`url(#t-${e})`),A(Lt,"id",`v-${e}`),A(Er,"stroke",`url(#v-${e})`),A(Dr,"id",`aa-${e}`),A(Mr,"stroke",`url(#aa-${e})`),A(Ar,"id",`w-${e}`),A(Fr,"stroke",`url(#w-${e})`),A(Tr,"id",`ac-${e}`),A(Ir,"stroke",`url(#ac-${e})`),A(Pr,"id",`ab-${e}`),A(Lr,"stroke",`url(#ab-${e})`),A(Or,"id",`y-${e}`),A(qr,"stroke",`url(#y-${e})`),A(_r,"id",`x-${e}`),A(zr,"stroke",`url(#x-${e})`),A(Rr,"id",`z-${e}`),A(bs,"stroke",`url(#z-${e})`),t})()}var ed=q('<span><svg width=16 height=16 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M6 12L10 8L6 4"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),td=q('<button title="Copy object to clipboard">'),nd=q('<button title="Remove all items"aria-label="Remove all items">'),rd=q('<button title="Delete item"aria-label="Delete item">'),od=q('<button title="Toggle value"aria-label="Toggle value">'),id=q('<button title="Bulk Edit Data"aria-label="Bulk Edit Data">'),Jt=q("<div>"),sd=q("<div><button> <span></span> <span> "),ad=q("<input>"),Io=q("<span>"),ld=q("<div><span>:"),ud=q("<div><div><button> [<!>...<!>]");function cd(e,t){let n=0;const r=[];for(;n<e.length;)r.push(e.slice(n,n+t)),n=n+t;return r}var Po=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ht(n):Gt(n));return(()=>{var o=ed();return V(()=>F(o,L(r().expander,n`
          transform: rotate(${e.expanded?90:0}deg);
        `,e.expanded&&n`
            & svg {
              top: -1px;
            }
          `))),o})()},dd=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ht(n):Gt(n)),[o,s]=R("NoCopy");return(()=>{var a=td();return Is(a,"click",o()==="NoCopy"?()=>{navigator.clipboard.writeText(Ps(e.value)).then(()=>{s("SuccessCopy"),setTimeout(()=>{s("NoCopy")},1500)},l=>{s("ErrorCopy"),setTimeout(()=>{s("NoCopy")},1500)})}:void 0,!0),k(a,v(Ls,{get children(){return[v(zn,{get when(){return o()==="NoCopy"},get children(){return v(Vc,{})}}),v(zn,{get when(){return o()==="SuccessCopy"},get children(){return v(Hc,{get theme(){return t()}})}}),v(zn,{get when(){return o()==="ErrorCopy"},get children(){return v(jc,{})}})]}})),V(l=>{var i=r().actionButton,u=`${o()==="NoCopy"?"Copy object to clipboard":o()==="SuccessCopy"?"Object copied to clipboard":"Error copying object to clipboard"}`;return i!==l.e&&F(a,l.e=i),u!==l.t&&A(a,"aria-label",l.t=u),l},{e:void 0,t:void 0}),a})()},fd=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client;return(()=>{var s=nd();return s.$$click=()=>{const a=e.activeQuery.state.data,l=or(a,e.dataPath,[]);o.setQueryData(e.activeQuery.queryKey,l)},k(s,v(Wc,{})),V(()=>F(s,r().actionButton)),s})()},Lo=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client;return(()=>{var s=rd();return s.$$click=()=>{const a=e.activeQuery.state.data,l=Os(a,e.dataPath);o.setQueryData(e.activeQuery.queryKey,l)},k(s,v(fs,{})),V(()=>F(s,L(r().actionButton))),s})()},gd=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client;return(()=>{var s=od();return s.$$click=()=>{const a=e.activeQuery.state.data,l=or(a,e.dataPath,!e.value);o.setQueryData(e.activeQuery.queryKey,l)},k(s,v(Qc,{get theme(){return t()},get checked(){return e.value}})),V(()=>F(s,L(r().actionButton,n`
          width: ${S.size[3.5]};
          height: ${S.size[3.5]};
        `))),s})()};function Oo(e){return Symbol.iterator in e}function vt(e){const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client,[s,a]=R((e.defaultExpanded||[]).includes(e.label)),l=()=>a(h=>!h),[i,u]=R([]),f=D(()=>Array.isArray(e.value)?e.value.map((h,y)=>({label:y.toString(),value:h})):e.value!==null&&typeof e.value=="object"&&Oo(e.value)&&typeof e.value[Symbol.iterator]=="function"?e.value instanceof Map?Array.from(e.value,([h,y])=>({label:h,value:y})):Array.from(e.value,(h,y)=>({label:y.toString(),value:h})):typeof e.value=="object"&&e.value!==null?Object.entries(e.value).map(([h,y])=>({label:h,value:y})):[]),g=D(()=>Array.isArray(e.value)?"array":e.value!==null&&typeof e.value=="object"&&Oo(e.value)&&typeof e.value[Symbol.iterator]=="function"?"Iterable":typeof e.value=="object"&&e.value!==null?"object":typeof e.value),c=D(()=>cd(f(),100)),d=e.dataPath??[];return(()=>{var h=Jt();return k(h,v(B,{get when(){return c().length},get children(){return[(()=>{var y=sd(),m=y.firstChild,b=m.firstChild,p=b.nextSibling,x=p.nextSibling,w=x.nextSibling,$=w.firstChild;return m.$$click=()=>l(),k(m,v(Po,{get expanded(){return s()}}),b),k(p,()=>e.label),k(w,()=>String(g()).toLowerCase()==="iterable"?"(Iterable) ":"",$),k(w,()=>f().length,$),k(w,()=>f().length>1?"items":"item",null),k(y,v(B,{get when(){return e.editable},get children(){var O=Jt();return k(O,v(dd,{get value(){return e.value}}),null),k(O,v(B,{get when(){return e.itemsDeletable&&e.activeQuery!==void 0},get children(){return v(Lo,{get activeQuery(){return e.activeQuery},dataPath:d})}}),null),k(O,v(B,{get when(){return g()==="array"&&e.activeQuery!==void 0},get children(){return v(fd,{get activeQuery(){return e.activeQuery},dataPath:d})}}),null),k(O,v(B,{get when(){return D(()=>!!e.onEdit)()&&!As(e.value).meta},get children(){var T=id();return T.$$click=()=>{var _;(_=e.onEdit)==null||_.call(e)},k(T,v(Gc,{})),V(()=>F(T,r().actionButton)),T}}),null),V(()=>F(O,r().actions)),O}}),null),V(O=>{var T=r().expanderButtonContainer,_=r().expanderButton,C=r().info;return T!==O.e&&F(y,O.e=T),_!==O.t&&F(m,O.t=_),C!==O.a&&F(w,O.a=C),O},{e:void 0,t:void 0,a:void 0}),y})(),v(B,{get when(){return s()},get children(){return[v(B,{get when(){return c().length===1},get children(){var y=Jt();return k(y,v($n,{get each(){return f()},by:m=>m.label,children:m=>v(vt,{get defaultExpanded(){return e.defaultExpanded},get label(){return m().label},get value(){return m().value},get editable(){return e.editable},get dataPath(){return[...d,m().label]},get activeQuery(){return e.activeQuery},get itemsDeletable(){return g()==="array"||g()==="Iterable"||g()==="object"}})})),V(()=>F(y,r().subEntry)),y}}),v(B,{get when(){return c().length>1},get children(){var y=Jt();return k(y,v(Fs,{get each(){return c()},children:(m,b)=>(()=>{var p=ud(),x=p.firstChild,w=x.firstChild,$=w.firstChild,O=$.nextSibling,T=O.nextSibling,_=T.nextSibling;return _.nextSibling,w.$$click=()=>u(C=>C.includes(b)?C.filter(I=>I!==b):[...C,b]),k(w,v(Po,{get expanded(){return i().includes(b)}}),$),k(w,b*100,O),k(w,b*100+100-1,_),k(x,v(B,{get when(){return i().includes(b)},get children(){var C=Jt();return k(C,v($n,{get each(){return m()},by:I=>I.label,children:I=>v(vt,{get defaultExpanded(){return e.defaultExpanded},get label(){return I().label},get value(){return I().value},get editable(){return e.editable},get dataPath(){return[...d,I().label]},get activeQuery(){return e.activeQuery}})})),V(()=>F(C,r().subEntry)),C}}),null),V(C=>{var I=r().entry,N=r().expanderButton;return I!==C.e&&F(x,C.e=I),N!==C.t&&F(w,C.t=N),C},{e:void 0,t:void 0}),p})()})),V(()=>F(y,r().subEntry)),y}})]}})]}}),null),k(h,v(B,{get when(){return c().length===0},get children(){var y=ld(),m=y.firstChild,b=m.firstChild;return k(m,()=>e.label,b),k(y,v(B,{get when(){return D(()=>!!(e.editable&&e.activeQuery!==void 0))()&&(g()==="string"||g()==="number"||g()==="boolean")},get fallback(){return(()=>{var p=Io();return k(p,()=>wn(e.value)),V(()=>F(p,r().value)),p})()},get children(){return[v(B,{get when(){return D(()=>!!(e.editable&&e.activeQuery!==void 0))()&&(g()==="string"||g()==="number")},get children(){var p=ad();return p.addEventListener("change",x=>{const w=e.activeQuery.state.data,$=or(w,d,g()==="number"?x.target.valueAsNumber:x.target.value);o.setQueryData(e.activeQuery.queryKey,$)}),V(x=>{var w=g()==="number"?"number":"text",$=L(r().value,r().editableInput);return w!==x.e&&A(p,"type",x.e=w),$!==x.t&&F(p,x.t=$),x},{e:void 0,t:void 0}),V(()=>p.value=e.value),p}}),v(B,{get when(){return g()==="boolean"},get children(){var p=Io();return k(p,v(gd,{get activeQuery(){return e.activeQuery},dataPath:d,get value(){return e.value}}),null),k(p,()=>wn(e.value),null),V(()=>F(p,L(r().value,r().actions,r().editableInput))),p}})]}}),null),k(y,v(B,{get when(){return e.editable&&e.itemsDeletable&&e.activeQuery!==void 0},get children(){return v(Lo,{get activeQuery(){return e.activeQuery},dataPath:d})}}),null),V(p=>{var x=r().row,w=r().label;return x!==p.e&&F(y,p.e=x),w!==p.t&&F(m,p.t=w),p},{e:void 0,t:void 0}),y}}),null),V(()=>F(h,r().entry)),h})()}var gs=(e,t)=>{const{colors:n,font:r,size:o,border:s}=S,a=(l,i)=>e==="light"?l:i;return{entry:t`
      & * {
        font-size: ${r.size.xs};
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
      }
      position: relative;
      outline: none;
      word-break: break-word;
    `,subEntry:t`
      margin: 0 0 0 0.5em;
      padding-left: 0.75em;
      border-left: 2px solid ${a(n.gray[300],n.darkGray[400])};
      /* outline: 1px solid ${n.teal[400]}; */
    `,expander:t`
      & path {
        stroke: ${n.gray[400]};
      }
      & svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      display: inline-flex;
      align-items: center;
      transition: all 0.1s ease;
      /* outline: 1px solid ${n.blue[400]}; */
    `,expanderButtonContainer:t`
      display: flex;
      align-items: center;
      line-height: ${o[4]};
      min-height: ${o[4]};
      gap: ${o[2]};
    `,expanderButton:t`
      cursor: pointer;
      color: inherit;
      font: inherit;
      outline: inherit;
      height: ${o[5]};
      background: transparent;
      border: none;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: ${o[1]};
      position: relative;
      /* outline: 1px solid ${n.green[400]}; */

      &:focus-visible {
        border-radius: ${s.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }

      & svg {
        position: relative;
        left: 1px;
      }
    `,info:t`
      color: ${a(n.gray[500],n.gray[500])};
      font-size: ${r.size.xs};
      margin-left: ${o[1]};
      /* outline: 1px solid ${n.yellow[400]}; */
    `,label:t`
      color: ${a(n.gray[700],n.gray[300])};
      white-space: nowrap;
    `,value:t`
      color: ${a(n.purple[600],n.purple[400])};
      flex-grow: 1;
    `,actions:t`
      display: inline-flex;
      gap: ${o[2]};
      align-items: center;
    `,row:t`
      display: inline-flex;
      gap: ${o[2]};
      width: 100%;
      margin: ${o[.25]} 0px;
      line-height: ${o[4.5]};
      align-items: center;
    `,editableInput:t`
      border: none;
      padding: ${o[.5]} ${o[1]} ${o[.5]} ${o[1.5]};
      flex-grow: 1;
      border-radius: ${s.radius.xs};
      background-color: ${a(n.gray[200],n.darkGray[500])};

      &:hover {
        background-color: ${a(n.gray[300],n.darkGray[600])};
      }
    `,actionButton:t`
      background-color: transparent;
      color: ${a(n.gray[500],n.gray[500])};
      border: none;
      display: inline-flex;
      padding: 0px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: ${o[3]};
      height: ${o[3]};
      position: relative;
      z-index: 1;

      &:hover svg {
        color: ${a(n.gray[600],n.gray[400])};
      }

      &:focus-visible {
        border-radius: ${s.radius.xs};
        outline: 2px solid ${n.blue[800]};
        outline-offset: 2px;
      }
    `}},Gt=e=>gs("light",e),Ht=e=>gs("dark",e);rr(["click"]);var hd=q('<div><div aria-hidden=true></div><button type=button aria-label="Open Tanstack query devtools"class=tsqd-open-btn>'),hn=q("<div>"),yd=q('<aside aria-label="Tanstack query devtools"><div></div><button aria-label="Close tanstack query devtools">'),md=q("<select name=tsqd-queries-filter-sort>"),vd=q("<select name=tsqd-mutations-filter-sort>"),bd=q("<span>Asc"),pd=q("<span>Desc"),xd=q('<button aria-label="Open in picture-in-picture mode"title="Open in picture-in-picture mode">'),wd=q("<div>Settings"),$d=q("<span>Position"),Cd=q("<span>Top"),Sd=q("<span>Bottom"),kd=q("<span>Left"),Ed=q("<span>Right"),Dd=q("<span>Theme"),Md=q("<span>Light"),Ad=q("<span>Dark"),Fd=q("<span>System"),Td=q("<div><div class=tsqd-queries-container>"),Id=q("<div><div class=tsqd-mutations-container>"),Pd=q('<div><div><div><button aria-label="Close Tanstack query devtools"><span>TANSTACK</span><span> v</span></button></div></div><div><div><div><input aria-label="Filter queries by query key"type=text placeholder=Filter name=tsqd-query-filter-input></div><div></div><button class=tsqd-query-filter-sort-order-btn></button></div><div><button aria-label="Clear query cache"></button><button>'),qo=q("<option>Sort by "),Ld=q("<div class=tsqd-query-disabled-indicator>disabled"),hs=q("<button><div></div><code class=tsqd-query-hash>"),Od=q("<div role=tooltip id=tsqd-status-tooltip>"),qd=q("<span>"),_d=q("<button><span></span><span>"),zd=q("<button><span></span> Error"),Rd=q('<div><span></span>Trigger Error<select><option value=""disabled selected>'),Kd=q('<div class="tsqd-query-details-explorer-container tsqd-query-details-data-explorer">'),Bd=q("<form><textarea name=data></textarea><div><span></span><div><button type=button>Cancel</button><button>Save"),Nd=q('<div><div>Query Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-observers-count><span>Observers:</span><span></span></div><div class=tsqd-query-details-last-updated><span>Last Updated:</span><span></span></div></div><div>Actions</div><div><button><span></span>Refetch</button><button><span></span>Invalidate</button><button><span></span>Reset</button><button><span></span>Remove</button><button><span></span> Loading</button></div><div>Data </div><div>Query Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),Ud=q("<option>"),Vd=q('<div><div>Mutation Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-last-updated><span>Submitted At:</span><span></span></div></div><div>Variables Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Context Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Data Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Mutations Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),[Ie,_n]=R(null),[bt,ys]=R(null),[je,kr]=R(0),[Ot,_o]=R(!1),af=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ve(n):Ue(n)),o=sr(),s=D(()=>K().buttonPosition||Hs),a=D(()=>e.localStore.open==="true"?!0:e.localStore.open==="false"?!1:K().initialIsOpen||js),l=D(()=>e.localStore.position||K().position||jn);let i;U(()=>{const f=i.parentElement,g=e.localStore.height||Ko,c=e.localStore.width||Bo,d=l();f.style.setProperty("--tsqd-panel-height",`${d==="top"?"-":""}${g}px`),f.style.setProperty("--tsqd-panel-width",`${d==="left"?"-":""}${c}px`)}),Ft(()=>{const f=()=>{const g=i.parentElement,c=getComputedStyle(g).fontSize;g.style.setProperty("--tsqd-font-size",c)};f(),window.addEventListener("focus",f),j(()=>{window.removeEventListener("focus",f)})});const u=D(()=>e.localStore.pip_open??"false");return[v(B,{get when(){return D(()=>!!o().pipWindow)()&&u()=="true"},get children(){return v(zo,{get mount(){var f;return(f=o().pipWindow)==null?void 0:f.document.body},get children(){return v(Gd,{get children(){return v(ms,e)}})}})}}),(()=>{var f=hn(),g=i;return typeof g=="function"?ln(g,f):i=f,k(f,v(Xr,{name:"tsqd-panel-transition",get children(){return v(B,{get when(){return D(()=>!!(a()&&!o().pipWindow))()&&u()=="false"},get children(){return v(Hd,{get localStore(){return e.localStore},get setLocalStore(){return e.setLocalStore}})}})}}),null),k(f,v(Xr,{name:"tsqd-button-transition",get children(){return v(B,{get when(){return!a()},get children(){var c=hd(),d=c.firstChild,h=d.nextSibling;return k(d,v(To,{})),h.$$click=()=>e.setLocalStore("open","true"),k(h,v(To,{})),V(()=>F(c,L(r().devtoolsBtn,r()[`devtoolsBtn-position-${s()}`],"tsqd-open-btn-container"))),c}})}}),null),V(()=>F(f,L(n`
            & .tsqd-panel-transition-exit-active,
            & .tsqd-panel-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
            }

            & .tsqd-panel-transition-exit-to,
            & .tsqd-panel-transition-enter {
              ${l()==="top"||l()==="bottom"?"transform: translateY(var(--tsqd-panel-height));":"transform: translateX(var(--tsqd-panel-width));"}
            }

            & .tsqd-button-transition-exit-active,
            & .tsqd-button-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
              opacity: 1;
            }

            & .tsqd-button-transition-exit-to,
            & .tsqd-button-transition-enter {
              transform: ${s()==="relative"?"none;":s()==="top-left"?"translateX(-72px);":s()==="top-right"?"translateX(72px);":"translateY(72px);"};
              opacity: 0;
            }
          `,"tsqd-transitions-container"))),f})()]},Gd=e=>{const t=sr(),n=pe(),r=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,o=D(()=>n()==="dark"?Ve(r):Ue(r)),s=()=>{const{colors:a}=S,l=(i,u)=>n()==="dark"?u:i;return je()<Dt?r`
        flex-direction: column;
        background-color: ${l(a.gray[300],a.gray[600])};
      `:r`
      flex-direction: row;
      background-color: ${l(a.gray[200],a.darkGray[900])};
    `};return U(()=>{const a=t().pipWindow,l=()=>{a&&kr(a.innerWidth)};a&&(a.addEventListener("resize",l),l()),j(()=>{a&&a.removeEventListener("resize",l)})}),(()=>{var a=hn();return a.style.setProperty("--tsqd-font-size","16px"),a.style.setProperty("max-height","100vh"),a.style.setProperty("height","100vh"),a.style.setProperty("width","100vw"),k(a,()=>e.children),V(()=>F(a,L(o().panel,s(),{[r`
            min-width: min-content;
          `]:je()<ir},"tsqd-main-panel"))),a})()},lf=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ve(n):Ue(n));let o;Ft(()=>{jo(o,({width:a},l)=>{l===o&&kr(a)})});const s=()=>{const{colors:a}=S,l=(i,u)=>t()==="dark"?u:i;return je()<Dt?n`
        flex-direction: column;
        background-color: ${l(a.gray[300],a.gray[600])};
      `:n`
      flex-direction: row;
      background-color: ${l(a.gray[200],a.darkGray[900])};
    `};return(()=>{var a=hn(),l=o;return typeof l=="function"?ln(l,a):o=a,a.style.setProperty("--tsqd-font-size","16px"),k(a,()=>e.children),V(()=>F(a,L(r().parentPanel,s(),{[n`
            min-width: min-content;
          `]:je()<ir},"tsqd-main-panel"))),a})()},Hd=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ve(n):Ue(n)),[o,s]=R(!1),a=D(()=>e.localStore.position||K().position||jn),l=f=>{const g=f.currentTarget.parentElement;if(!g)return;s(!0);const{height:c,width:d}=g.getBoundingClientRect(),h=f.clientX,y=f.clientY;let m=0;const b=Kr(3.5),p=Kr(12),x=$=>{if($.preventDefault(),a()==="left"||a()==="right"){const O=a()==="right"?h-$.clientX:$.clientX-h;m=Math.round(d+O),m<p&&(m=p),e.setLocalStore("width",String(Math.round(m)));const T=g.getBoundingClientRect().width;Number(e.localStore.width)<T&&e.setLocalStore("width",String(T))}else{const O=a()==="bottom"?y-$.clientY:$.clientY-y;m=Math.round(c+O),m<b&&(m=b,_n(null)),e.setLocalStore("height",String(Math.round(m)))}},w=()=>{o()&&s(!1),document.removeEventListener("mousemove",x,!1),document.removeEventListener("mouseUp",w,!1)};document.addEventListener("mousemove",x,!1),document.addEventListener("mouseup",w,!1)};let i;Ft(()=>{jo(i,({width:f},g)=>{g===i&&kr(f)})}),U(()=>{var y,m;const f=(m=(y=i.parentElement)==null?void 0:y.parentElement)==null?void 0:m.parentElement;if(!f)return;const g=e.localStore.position||jn,c=Ts("padding",g),d=e.localStore.position==="left"||e.localStore.position==="right",h=(({padding:b,paddingTop:p,paddingBottom:x,paddingLeft:w,paddingRight:$})=>({padding:b,paddingTop:p,paddingBottom:x,paddingLeft:w,paddingRight:$}))(f.style);f.style[c]=`${d?e.localStore.width:e.localStore.height}px`,j(()=>{Object.entries(h).forEach(([b,p])=>{f.style[b]=p})})});const u=()=>{const{colors:f}=S,g=(c,d)=>t()==="dark"?d:c;return je()<Dt?n`
        flex-direction: column;
        background-color: ${g(f.gray[300],f.gray[600])};
      `:n`
      flex-direction: row;
      background-color: ${g(f.gray[200],f.darkGray[900])};
    `};return(()=>{var f=yd(),g=f.firstChild,c=g.nextSibling,d=i;return typeof d=="function"?ln(d,f):i=f,g.$$mousedown=l,c.$$click=()=>e.setLocalStore("open","false"),k(c,v(nn,{})),k(f,v(ms,e),null),V(h=>{var y=L(r().panel,r()[`panel-position-${a()}`],u(),{[n`
            min-width: min-content;
          `]:je()<ir&&(a()==="right"||a()==="left")},"tsqd-main-panel"),m=a()==="bottom"||a()==="top"?`${e.localStore.height||Ko}px`:"auto",b=a()==="right"||a()==="left"?`${e.localStore.width||Bo}px`:"auto",p=L(r().dragHandle,r()[`dragHandle-position-${a()}`],"tsqd-drag-handle"),x=L(r().closeBtn,r()[`closeBtn-position-${a()}`],"tsqd-minimize-btn");return y!==h.e&&F(f,h.e=y),m!==h.t&&((h.t=m)!=null?f.style.setProperty("height",m):f.style.removeProperty("height")),b!==h.a&&((h.a=b)!=null?f.style.setProperty("width",b):f.style.removeProperty("width")),p!==h.o&&F(g,h.o=p),x!==h.i&&F(c,h.i=x),h},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),f})()},ms=e=>{Jd(),ef();let t;const n=pe(),r=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,o=D(()=>n()==="dark"?Ve(r):Ue(r)),s=sr(),[a,l]=R("queries"),i=D(()=>e.localStore.sort||Qs),u=D(()=>Number(e.localStore.sortOrder)||Ur),f=D(()=>e.localStore.mutationSort||Ys),g=D(()=>Number(e.localStore.mutationSortOrder)||Ur),c=D(()=>Vn[i()]),d=D(()=>Gn[f()]),h=D(()=>K().onlineManager),y=D(()=>K().client.getQueryCache()),m=D(()=>K().client.getMutationCache()),b=xe(T=>T().getAll().length,!1),p=D(ct(()=>[b(),e.localStore.filter,i(),u()],()=>{const T=y().getAll(),_=e.localStore.filter?T.filter(I=>Vr(I.queryHash,e.localStore.filter||"").passed):[...T];return c()?_.sort((I,N)=>c()(I,N)*u()):_})),x=He(T=>T().getAll().length,!1),w=D(ct(()=>[x(),e.localStore.mutationFilter,f(),g()],()=>{const T=m().getAll(),_=e.localStore.mutationFilter?T.filter(I=>{const N=`${I.options.mutationKey?JSON.stringify(I.options.mutationKey)+" - ":""}${new Date(I.state.submittedAt).toLocaleString()}`;return Vr(N,e.localStore.mutationFilter||"").passed}):[...T];return d()?_.sort((I,N)=>d()(I,N)*g()):_})),$=T=>{e.setLocalStore("position",T)},O=T=>{const C=getComputedStyle(t).getPropertyValue("--tsqd-font-size");T.style.setProperty("--tsqd-font-size",C)};return[(()=>{var T=Pd(),_=T.firstChild,C=_.firstChild,I=C.firstChild,N=I.firstChild,G=N.nextSibling,te=G.firstChild,Z=_.nextSibling,ie=Z.firstChild,z=ie.firstChild,Q=z.firstChild,J=z.nextSibling,le=J.nextSibling,ye=ie.nextSibling,Ae=ye.firstChild,ge=Ae.nextSibling,De=t;return typeof De=="function"?ln(De,T):t=T,I.$$click=()=>{if(!s().pipWindow&&!e.showPanelViewOnly){e.setLocalStore("open","false");return}e.onClose&&e.onClose()},k(G,()=>K().queryFlavor,te),k(G,()=>K().version,null),k(C,v(Re.Root,{get class(){return L(o().viewToggle)},get value(){return a()},onChange:M=>{l(M),_n(null),ys(null)},get children(){return[v(Re.Item,{value:"queries",class:"tsqd-radio-toggle",get children(){return[v(Re.ItemInput,{}),v(Re.ItemControl,{get children(){return v(Re.ItemIndicator,{})}}),v(Re.ItemLabel,{title:"Toggle Queries View",children:"Queries"})]}}),v(Re.Item,{value:"mutations",class:"tsqd-radio-toggle",get children(){return[v(Re.ItemInput,{}),v(Re.ItemControl,{get children(){return v(Re.ItemIndicator,{})}}),v(Re.ItemLabel,{title:"Toggle Mutations View",children:"Mutations"})]}})]}}),null),k(_,v(B,{get when(){return a()==="queries"},get children(){return v(Qd,{})}}),null),k(_,v(B,{get when(){return a()==="mutations"},get children(){return v(Yd,{})}}),null),k(z,v(Lc,{}),Q),Q.$$input=M=>{a()==="queries"?e.setLocalStore("filter",M.currentTarget.value):e.setLocalStore("mutationFilter",M.currentTarget.value)},k(J,v(B,{get when(){return a()==="queries"},get children(){var M=md();return M.addEventListener("change",fe=>{e.setLocalStore("sort",fe.currentTarget.value)}),k(M,()=>Object.keys(Vn).map(fe=>(()=>{var ee=qo();return ee.firstChild,ee.value=fe,k(ee,fe,null),ee})())),V(()=>M.value=i()),M}}),null),k(J,v(B,{get when(){return a()==="mutations"},get children(){var M=vd();return M.addEventListener("change",fe=>{e.setLocalStore("mutationSort",fe.currentTarget.value)}),k(M,()=>Object.keys(Gn).map(fe=>(()=>{var ee=qo();return ee.firstChild,ee.value=fe,k(ee,fe,null),ee})())),V(()=>M.value=f()),M}}),null),k(J,v(nn,{}),null),le.$$click=()=>{a()==="queries"?e.setLocalStore("sortOrder",String(u()*-1)):e.setLocalStore("mutationSortOrder",String(g()*-1))},k(le,v(B,{get when(){return(a()==="queries"?u():g())===1},get children(){return[bd(),v(Ao,{})]}}),null),k(le,v(B,{get when(){return(a()==="queries"?u():g())===-1},get children(){return[pd(),v(Fo,{})]}}),null),Ae.$$click=()=>{a()==="queries"?y().clear():m().clear()},k(Ae,v(fs,{})),ge.$$click=()=>{Ot()?(h().setOnline(!0),_o(!1)):(h().setOnline(!1),_o(!0))},k(ge,(()=>{var M=D(()=>!!Ot());return()=>M()?v(Bc,{}):v(Kc,{})})()),k(ye,v(B,{get when(){return D(()=>!s().pipWindow)()&&!s().disabled},get children(){var M=xd();return M.$$click=()=>{s().requestPipWindow(Number(window.innerWidth),Number(e.localStore.height??500))},k(M,v(Uc,{})),V(()=>F(M,L(o().actionsBtn,"tsqd-actions-btn","tsqd-action-open-pip"))),M}}),null),k(ye,v(he.Root,{gutter:4,get children(){return[v(he.Trigger,{get class(){return L(o().actionsBtn,"tsqd-actions-btn","tsqd-action-settings")},get children(){return v(Nc,{})}}),v(he.Portal,{ref:M=>O(M),get mount(){return D(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return v(he.Content,{get class(){return L(o().settingsMenu,"tsqd-settings-menu")},get children(){return[(()=>{var M=wd();return V(()=>F(M,L(o().settingsMenuHeader,"tsqd-settings-menu-header"))),M})(),v(B,{get when(){return!e.showPanelViewOnly},get children(){return v(he.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[v(he.SubTrigger,{get class(){return L(o().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[$d(),v(nn,{})]}}),v(he.Portal,{ref:M=>O(M),get mount(){return D(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return v(he.SubContent,{get class(){return L(o().settingsMenu,"tsqd-settings-submenu")},get children(){return[v(he.Item,{onSelect:()=>{$("top")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[Cd(),v(Ao,{})]}}),v(he.Item,{onSelect:()=>{$("bottom")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[Sd(),v(Fo,{})]}}),v(he.Item,{onSelect:()=>{$("left")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[kd(),v(Oc,{})]}}),v(he.Item,{onSelect:()=>{$("right")},as:"button",get class(){return L(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-right")},get children(){return[Ed(),v(qc,{})]}})]}})}})]}})}}),v(he.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[v(he.SubTrigger,{get class(){return L(o().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[Dd(),v(nn,{})]}}),v(he.Portal,{ref:M=>O(M),get mount(){return D(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return v(he.SubContent,{get class(){return L(o().settingsMenu,"tsqd-settings-submenu")},get children(){return[v(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","light")},as:"button",get class(){return L(o().settingsSubButton,e.localStore.theme_preference==="light"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[Md(),v(_c,{})]}}),v(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","dark")},as:"button",get class(){return L(o().settingsSubButton,e.localStore.theme_preference==="dark"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[Ad(),v(zc,{})]}}),v(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","system")},as:"button",get class(){return L(o().settingsSubButton,e.localStore.theme_preference==="system"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[Fd(),v(Rc,{})]}})]}})}})]}})]}})}})]}}),null),k(T,v(B,{get when(){return a()==="queries"},get children(){var M=Td(),fe=M.firstChild;return k(fe,v($n,{by:ee=>ee.queryHash,get each(){return p()},children:ee=>v(jd,{get query(){return ee()}})})),V(()=>F(M,L(o().overflowQueryContainer,"tsqd-queries-overflow-container"))),M}}),null),k(T,v(B,{get when(){return a()==="mutations"},get children(){var M=Id(),fe=M.firstChild;return k(fe,v($n,{by:ee=>ee.mutationId,get each(){return w()},children:ee=>v(Wd,{get mutation(){return ee()}})})),V(()=>F(M,L(o().overflowQueryContainer,"tsqd-mutations-overflow-container"))),M}}),null),V(M=>{var fe=L(o().queriesContainer,je()<Dt&&(Ie()||bt())&&r`
              height: 50%;
              max-height: 50%;
            `,je()<Dt&&!(Ie()||bt())&&r`
              height: 100%;
              max-height: 100%;
            `,"tsqd-queries-container"),ee=L(o().row,"tsqd-header"),ht=o().logoAndToggleContainer,H=L(o().logo,"tsqd-text-logo-container"),Ce=L(o().tanstackLogo,"tsqd-text-logo-tanstack"),Se=L(o().queryFlavorLogo,"tsqd-text-logo-query-flavor"),It=L(o().row,"tsqd-filters-actions-container"),Oe=L(o().filtersContainer,"tsqd-filters-container"),yt=L(o().filterInput,"tsqd-query-filter-textfield-container"),Ct=L("tsqd-query-filter-textfield"),tt=L(o().filterSelect,"tsqd-query-filter-sort-container"),Ye=`Sort order ${(a()==="queries"?u():g())===-1?"descending":"ascending"}`,nt=(a()==="queries"?u():g())===-1,P=L(o().actionsContainer,"tsqd-actions-container"),ne=L(o().actionsBtn,"tsqd-actions-btn","tsqd-action-clear-cache"),me=`Clear ${a()} cache`,ae=L(o().actionsBtn,Ot()&&o().actionsBtnOffline,"tsqd-actions-btn","tsqd-action-mock-offline-behavior"),se=`${Ot()?"Unset offline mocking behavior":"Mock offline behavior"}`,ue=Ot(),ve=`${Ot()?"Unset offline mocking behavior":"Mock offline behavior"}`;return fe!==M.e&&F(T,M.e=fe),ee!==M.t&&F(_,M.t=ee),ht!==M.a&&F(C,M.a=ht),H!==M.o&&F(I,M.o=H),Ce!==M.i&&F(N,M.i=Ce),Se!==M.n&&F(G,M.n=Se),It!==M.s&&F(Z,M.s=It),Oe!==M.h&&F(ie,M.h=Oe),yt!==M.r&&F(z,M.r=yt),Ct!==M.d&&F(Q,M.d=Ct),tt!==M.l&&F(J,M.l=tt),Ye!==M.u&&A(le,"aria-label",M.u=Ye),nt!==M.c&&A(le,"aria-pressed",M.c=nt),P!==M.w&&F(ye,M.w=P),ne!==M.m&&F(Ae,M.m=ne),me!==M.f&&A(Ae,"title",M.f=me),ae!==M.y&&F(ge,M.y=ae),se!==M.g&&A(ge,"aria-label",M.g=se),ue!==M.p&&A(ge,"aria-pressed",M.p=ue),ve!==M.b&&A(ge,"title",M.b=ve),M},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0}),V(()=>Q.value=a()==="queries"?e.localStore.filter||"":e.localStore.mutationFilter||""),T})(),v(B,{get when(){return D(()=>a()==="queries")()&&Ie()},get children(){return v(Xd,{})}}),v(B,{get when(){return D(()=>a()==="mutations")()&&bt()},get children(){return v(Zd,{})}})]},jd=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ve(n):Ue(n)),{colors:o,alpha:s}=S,a=(d,h)=>t()==="dark"?h:d,l=xe(d=>{var h;return(h=d().find({queryKey:e.query.queryKey}))==null?void 0:h.state},!0,d=>d.query.queryHash===e.query.queryHash),i=xe(d=>{var h;return((h=d().find({queryKey:e.query.queryKey}))==null?void 0:h.isDisabled())??!1},!0,d=>d.query.queryHash===e.query.queryHash),u=xe(d=>{var h;return((h=d().find({queryKey:e.query.queryKey}))==null?void 0:h.isStale())??!1},!0,d=>d.query.queryHash===e.query.queryHash),f=xe(d=>{var h;return((h=d().find({queryKey:e.query.queryKey}))==null?void 0:h.getObserversCount())??0},!0,d=>d.query.queryHash===e.query.queryHash),g=D(()=>$s({queryState:l(),observerCount:f(),isStale:u()})),c=()=>g()==="gray"?n`
        background-color: ${a(o[g()][200],o[g()][700])};
        color: ${a(o[g()][700],o[g()][300])};
      `:n`
      background-color: ${a(o[g()][200]+s[80],o[g()][900])};
      color: ${a(o[g()][800],o[g()][300])};
    `;return v(B,{get when(){return l()},get children(){var d=hs(),h=d.firstChild,y=h.nextSibling;return d.$$click=()=>_n(e.query.queryHash===Ie()?null:e.query.queryHash),k(h,f),k(y,()=>e.query.queryHash),k(d,v(B,{get when(){return i()},get children(){return Ld()}}),null),V(m=>{var b=L(r().queryRow,Ie()===e.query.queryHash&&r().selectedQueryRow,"tsqd-query-row"),p=`Query key ${e.query.queryHash}`,x=L(c(),"tsqd-query-observer-count");return b!==m.e&&F(d,m.e=b),p!==m.t&&A(d,"aria-label",m.t=p),x!==m.a&&F(h,m.a=x),m},{e:void 0,t:void 0,a:void 0}),d}})},Wd=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ve(n):Ue(n)),{colors:o,alpha:s}=S,a=(c,d)=>t()==="dark"?d:c,l=He(c=>{const h=c().getAll().find(y=>y.mutationId===e.mutation.mutationId);return h==null?void 0:h.state}),i=He(c=>{const h=c().getAll().find(y=>y.mutationId===e.mutation.mutationId);return h?h.state.isPaused:!1}),u=He(c=>{const h=c().getAll().find(y=>y.mutationId===e.mutation.mutationId);return h?h.state.status:"idle"}),f=D(()=>Rt({isPaused:i(),status:u()})),g=()=>f()==="gray"?n`
        background-color: ${a(o[f()][200],o[f()][700])};
        color: ${a(o[f()][700],o[f()][300])};
      `:n`
      background-color: ${a(o[f()][200]+s[80],o[f()][900])};
      color: ${a(o[f()][800],o[f()][300])};
    `;return v(B,{get when(){return l()},get children(){var c=hs(),d=c.firstChild,h=d.nextSibling;return c.$$click=()=>{ys(e.mutation.mutationId===bt()?null:e.mutation.mutationId)},k(d,v(B,{get when(){return f()==="purple"},get children(){return v(Jc,{})}}),null),k(d,v(B,{get when(){return f()==="green"},get children(){return v(Yc,{})}}),null),k(d,v(B,{get when(){return f()==="red"},get children(){return v(Zc,{})}}),null),k(d,v(B,{get when(){return f()==="yellow"},get children(){return v(Xc,{})}}),null),k(h,v(B,{get when(){return e.mutation.options.mutationKey},get children(){return[D(()=>JSON.stringify(e.mutation.options.mutationKey))," -"," "]}}),null),k(h,()=>new Date(e.mutation.state.submittedAt).toLocaleString(),null),V(y=>{var m=L(r().queryRow,bt()===e.mutation.mutationId&&r().selectedQueryRow,"tsqd-query-row"),b=`Mutation submitted at ${new Date(e.mutation.state.submittedAt).toLocaleString()}`,p=L(g(),"tsqd-query-observer-count");return m!==y.e&&F(c,y.e=m),b!==y.t&&A(c,"aria-label",y.t=b),p!==y.a&&F(d,y.a=p),y},{e:void 0,t:void 0,a:void 0}),c}})},Qd=()=>{const e=xe(i=>i().getAll().filter(u=>qt(u)==="stale").length),t=xe(i=>i().getAll().filter(u=>qt(u)==="fresh").length),n=xe(i=>i().getAll().filter(u=>qt(u)==="fetching").length),r=xe(i=>i().getAll().filter(u=>qt(u)==="paused").length),o=xe(i=>i().getAll().filter(u=>qt(u)==="inactive").length),s=pe(),a=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,l=D(()=>s()==="dark"?Ve(a):Ue(a));return(()=>{var i=hn();return k(i,v(ut,{label:"Fresh",color:"green",get count(){return t()}}),null),k(i,v(ut,{label:"Fetching",color:"blue",get count(){return n()}}),null),k(i,v(ut,{label:"Paused",color:"purple",get count(){return r()}}),null),k(i,v(ut,{label:"Stale",color:"yellow",get count(){return e()}}),null),k(i,v(ut,{label:"Inactive",color:"gray",get count(){return o()}}),null),V(()=>F(i,L(l().queryStatusContainer,"tsqd-query-status-container"))),i})()},Yd=()=>{const e=He(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="green").length),t=He(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="yellow").length),n=He(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="purple").length),r=He(l=>l().getAll().filter(i=>Rt({isPaused:i.state.isPaused,status:i.state.status})==="red").length),o=pe(),s=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,a=D(()=>o()==="dark"?Ve(s):Ue(s));return(()=>{var l=hn();return k(l,v(ut,{label:"Paused",color:"purple",get count(){return n()}}),null),k(l,v(ut,{label:"Pending",color:"yellow",get count(){return t()}}),null),k(l,v(ut,{label:"Success",color:"green",get count(){return e()}}),null),k(l,v(ut,{label:"Error",color:"red",get count(){return r()}}),null),V(()=>F(l,L(a().queryStatusContainer,"tsqd-query-status-container"))),l})()},ut=e=>{const t=pe(),n=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,r=D(()=>t()==="dark"?Ve(n):Ue(n)),{colors:o,alpha:s}=S,a=(d,h)=>t()==="dark"?h:d;let l;const[i,u]=R(!1),[f,g]=R(!1),c=D(()=>!(Ie()&&je()<Gs&&je()>Dt||je()<Dt));return(()=>{var d=_d(),h=d.firstChild,y=h.nextSibling,m=l;return typeof m=="function"?ln(m,d):l=d,d.addEventListener("mouseleave",()=>{u(!1),g(!1)}),d.addEventListener("mouseenter",()=>u(!0)),d.addEventListener("blur",()=>g(!1)),d.addEventListener("focus",()=>g(!0)),Cs(d,W({get disabled(){return c()},get class(){return L(r().queryStatusTag,!c()&&n`
            cursor: pointer;
            &:hover {
              background: ${a(o.gray[200],o.darkGray[400])}${s[80]};
            }
          `,"tsqd-query-status-tag",`tsqd-query-status-tag-${e.label.toLowerCase()}`)}},()=>i()||f()?{"aria-describedby":"tsqd-status-tooltip"}:{}),!1,!0),k(d,v(B,{get when(){return D(()=>!c())()&&(i()||f())},get children(){var b=Od();return k(b,()=>e.label),V(()=>F(b,L(r().statusTooltip,"tsqd-query-status-tooltip"))),b}}),h),k(d,v(B,{get when(){return c()},get children(){var b=qd();return k(b,()=>e.label),V(()=>F(b,L(r().queryStatusTagLabel,"tsqd-query-status-tag-label"))),b}}),y),k(y,()=>e.count),V(b=>{var p=L(n`
            width: ${S.size[1.5]};
            height: ${S.size[1.5]};
            border-radius: ${S.border.radius.full};
            background-color: ${S.colors[e.color][500]};
          `,"tsqd-query-status-tag-dot"),x=L(r().queryStatusCount,e.count>0&&e.color!=="gray"&&n`
              background-color: ${a(o[e.color][100],o[e.color][900])};
              color: ${a(o[e.color][700],o[e.color][300])};
            `,"tsqd-query-status-tag-count");return p!==b.e&&F(h,b.e=p),x!==b.t&&F(y,b.t=x),b},{e:void 0,t:void 0}),d})()},Xd=()=>{const e=pe(),t=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,n=D(()=>e()==="dark"?Ve(t):Ue(t)),{colors:r}=S,o=(C,I)=>e()==="dark"?I:C,s=K().client,[a,l]=R(!1),[i,u]=R("view"),[f,g]=R(!1),c=D(()=>K().errorTypes||[]),d=xe(C=>C().getAll().find(I=>I.queryHash===Ie()),!1),h=xe(C=>C().getAll().find(I=>I.queryHash===Ie()),!1),y=xe(C=>{var I;return(I=C().getAll().find(N=>N.queryHash===Ie()))==null?void 0:I.state},!1),m=xe(C=>{var I;return(I=C().getAll().find(N=>N.queryHash===Ie()))==null?void 0:I.state.data},!1),b=xe(C=>{const I=C().getAll().find(N=>N.queryHash===Ie());return I?qt(I):"inactive"}),p=xe(C=>{const I=C().getAll().find(N=>N.queryHash===Ie());return I?I.state.status:"pending"}),x=xe(C=>{var I;return((I=C().getAll().find(N=>N.queryHash===Ie()))==null?void 0:I.getObserversCount())??0}),w=D(()=>Ss(b())),$=()=>{var I;const C=(I=d())==null?void 0:I.fetch();C==null||C.catch(()=>{})},O=C=>{const I=(C==null?void 0:C.initializer(d()))??new Error("Unknown error from devtools"),N=d().options;d().setState({status:"error",error:I,fetchMeta:{...d().state.fetchMeta,__previousQueryOptions:N}})},T=()=>{const C=d(),I=C.state,N=C.state.fetchMeta?C.state.fetchMeta.__previousQueryOptions:null;C.cancel({silent:!0}),C.setState({...I,fetchStatus:"idle",fetchMeta:null}),N&&C.fetch(N)};U(()=>{b()!=="fetching"&&l(!1)});const _=()=>w()==="gray"?t`
        background-color: ${o(r[w()][200],r[w()][700])};
        color: ${o(r[w()][700],r[w()][300])};
        border-color: ${o(r[w()][400],r[w()][600])};
      `:t`
      background-color: ${o(r[w()][100],r[w()][900])};
      color: ${o(r[w()][700],r[w()][300])};
      border-color: ${o(r[w()][400],r[w()][600])};
    `;return v(B,{get when(){return D(()=>!!d())()&&y()},get children(){var C=Nd(),I=C.firstChild,N=I.nextSibling,G=N.firstChild,te=G.firstChild,Z=te.firstChild,ie=te.nextSibling,z=G.nextSibling,Q=z.firstChild,J=Q.nextSibling,le=z.nextSibling,ye=le.firstChild,Ae=ye.nextSibling,ge=N.nextSibling,De=ge.nextSibling,M=De.firstChild,fe=M.firstChild,ee=M.nextSibling,ht=ee.firstChild,H=ee.nextSibling,Ce=H.firstChild,Se=H.nextSibling,It=Se.firstChild,Oe=Se.nextSibling,yt=Oe.firstChild,Ct=yt.nextSibling,tt=De.nextSibling;tt.firstChild;var Ye=tt.nextSibling,nt=Ye.nextSibling;return k(Z,()=>wn(d().queryKey,!0)),k(ie,b),k(J,x),k(Ae,()=>new Date(y().dataUpdatedAt).toLocaleTimeString()),M.$$click=$,ee.$$click=()=>s.invalidateQueries(d()),H.$$click=()=>s.resetQueries(d()),Se.$$click=()=>{s.removeQueries(d()),_n(null)},Oe.$$click=()=>{var P;if(((P=d())==null?void 0:P.state.data)===void 0)l(!0),T();else{const ne=d();if(!ne)return;const me=ne.options;ne.fetch({...me,queryFn:()=>new Promise(()=>{}),gcTime:-1}),ne.setState({data:void 0,status:"pending",fetchMeta:{...ne.state.fetchMeta,__previousQueryOptions:me}})}},k(Oe,()=>p()==="pending"?"Restore":"Trigger",Ct),k(De,v(B,{get when(){return c().length===0||p()==="error"},get children(){var P=zd(),ne=P.firstChild,me=ne.nextSibling;return P.$$click=()=>{d().state.error?s.resetQueries(d()):O()},k(P,()=>p()==="error"?"Restore":"Trigger",me),V(ae=>{var se=L(t`
                  color: ${o(r.red[500],r.red[400])};
                `,"tsqd-query-details-actions-btn","tsqd-query-details-action-error"),ue=p()==="pending",ve=t`
                  background-color: ${o(r.red[500],r.red[400])};
                `;return se!==ae.e&&F(P,ae.e=se),ue!==ae.t&&(P.disabled=ae.t=ue),ve!==ae.a&&F(ne,ae.a=ve),ae},{e:void 0,t:void 0,a:void 0}),P}}),null),k(De,v(B,{get when(){return!(c().length===0||p()==="error")},get children(){var P=Rd(),ne=P.firstChild,me=ne.nextSibling,ae=me.nextSibling;return ae.firstChild,ae.addEventListener("change",se=>{const ue=c().find(ve=>ve.name===se.currentTarget.value);O(ue)}),k(ae,v(ks,{get each(){return c()},children:se=>(()=>{var ue=Ud();return k(ue,()=>se.name),V(()=>ue.value=se.name),ue})()}),null),k(P,v(nn,{}),null),V(se=>{var ue=L(n().actionsSelect,"tsqd-query-details-actions-btn","tsqd-query-details-action-error-multiple"),ve=t`
                  background-color: ${S.colors.red[400]};
                `,re=p()==="pending";return ue!==se.e&&F(P,se.e=ue),ve!==se.t&&F(ne,se.t=ve),re!==se.a&&(ae.disabled=se.a=re),se},{e:void 0,t:void 0,a:void 0}),P}}),null),k(tt,()=>i()==="view"?"Explorer":"Editor",null),k(C,v(B,{get when(){return i()==="view"},get children(){var P=Kd();return k(P,v(vt,{label:"Data",defaultExpanded:["Data"],get value(){return m()},editable:!0,onEdit:()=>u("edit"),get activeQuery(){return d()}})),V(ne=>(ne=S.size[2])!=null?P.style.setProperty("padding",ne):P.style.removeProperty("padding")),P}}),Ye),k(C,v(B,{get when(){return i()==="edit"},get children(){var P=Bd(),ne=P.firstChild,me=ne.nextSibling,ae=me.firstChild,se=ae.nextSibling,ue=se.firstChild,ve=ue.nextSibling;return P.addEventListener("submit",re=>{re.preventDefault();const ot=new FormData(re.currentTarget).get("data");try{const Ge=JSON.parse(ot);d().setState({...d().state,data:Ge}),u("view")}catch{g(!0)}}),ne.addEventListener("focus",()=>g(!1)),k(ae,()=>f()?"Invalid Value":""),ue.$$click=()=>u("view"),V(re=>{var rt=L(n().devtoolsEditForm,"tsqd-query-details-data-editor"),ot=n().devtoolsEditTextarea,Ge=f(),St=n().devtoolsEditFormActions,it=n().devtoolsEditFormError,kt=n().devtoolsEditFormActionContainer,st=L(n().devtoolsEditFormAction,t`
                      color: ${o(r.gray[600],r.gray[300])};
                    `),mt=L(n().devtoolsEditFormAction,t`
                      color: ${o(r.blue[600],r.blue[400])};
                    `);return rt!==re.e&&F(P,re.e=rt),ot!==re.t&&F(ne,re.t=ot),Ge!==re.a&&A(ne,"data-error",re.a=Ge),St!==re.o&&F(me,re.o=St),it!==re.i&&F(ae,re.i=it),kt!==re.n&&F(se,re.n=kt),st!==re.s&&F(ue,re.s=st),mt!==re.h&&F(ve,re.h=mt),re},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),V(()=>ne.value=JSON.stringify(m(),null,2)),P}}),Ye),k(nt,v(vt,{label:"Query",defaultExpanded:["Query","queryKey"],get value(){return h()}})),V(P=>{var ne=L(n().detailsContainer,"tsqd-query-details-container"),me=L(n().detailsHeader,"tsqd-query-details-header"),ae=L(n().detailsBody,"tsqd-query-details-summary-container"),se=L(n().queryDetailsStatus,_()),ue=L(n().detailsHeader,"tsqd-query-details-header"),ve=L(n().actionsBody,"tsqd-query-details-actions-container"),re=L(t`
                color: ${o(r.blue[600],r.blue[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-refetch"),rt=b()==="fetching",ot=t`
                background-color: ${o(r.blue[600],r.blue[400])};
              `,Ge=L(t`
                color: ${o(r.yellow[600],r.yellow[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-invalidate"),St=p()==="pending",it=t`
                background-color: ${o(r.yellow[600],r.yellow[400])};
              `,kt=L(t`
                color: ${o(r.gray[600],r.gray[300])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-reset"),st=p()==="pending",mt=t`
                background-color: ${o(r.gray[600],r.gray[400])};
              `,yn=L(t`
                color: ${o(r.pink[500],r.pink[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-remove"),jt=b()==="fetching",mn=t`
                background-color: ${o(r.pink[500],r.pink[400])};
              `,Pt=L(t`
                color: ${o(r.cyan[500],r.cyan[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-loading"),vn=a(),Wt=t`
                background-color: ${o(r.cyan[500],r.cyan[400])};
              `,Qt=L(n().detailsHeader,"tsqd-query-details-header"),Yt=L(n().detailsHeader,"tsqd-query-details-header"),Lt=S.size[2];return ne!==P.e&&F(C,P.e=ne),me!==P.t&&F(I,P.t=me),ae!==P.a&&F(N,P.a=ae),se!==P.o&&F(ie,P.o=se),ue!==P.i&&F(ge,P.i=ue),ve!==P.n&&F(De,P.n=ve),re!==P.s&&F(M,P.s=re),rt!==P.h&&(M.disabled=P.h=rt),ot!==P.r&&F(fe,P.r=ot),Ge!==P.d&&F(ee,P.d=Ge),St!==P.l&&(ee.disabled=P.l=St),it!==P.u&&F(ht,P.u=it),kt!==P.c&&F(H,P.c=kt),st!==P.w&&(H.disabled=P.w=st),mt!==P.m&&F(Ce,P.m=mt),yn!==P.f&&F(Se,P.f=yn),jt!==P.y&&(Se.disabled=P.y=jt),mn!==P.g&&F(It,P.g=mn),Pt!==P.p&&F(Oe,P.p=Pt),vn!==P.b&&(Oe.disabled=P.b=vn),Wt!==P.T&&F(yt,P.T=Wt),Qt!==P.A&&F(tt,P.A=Qt),Yt!==P.O&&F(Ye,P.O=Yt),Lt!==P.I&&((P.I=Lt)!=null?nt.style.setProperty("padding",Lt):nt.style.removeProperty("padding")),P},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0,T:void 0,A:void 0,O:void 0,I:void 0}),C}})},Zd=()=>{const e=pe(),t=K().shadowDOMTarget?Y.bind({target:K().shadowDOMTarget}):Y,n=D(()=>e()==="dark"?Ve(t):Ue(t)),{colors:r}=S,o=(f,g)=>e()==="dark"?g:f,s=He(f=>{const c=f().getAll().find(d=>d.mutationId===bt());return c?c.state.isPaused:!1}),a=He(f=>{const c=f().getAll().find(d=>d.mutationId===bt());return c?c.state.status:"idle"}),l=D(()=>Rt({isPaused:s(),status:a()})),i=He(f=>f().getAll().find(g=>g.mutationId===bt()),!1),u=()=>l()==="gray"?t`
        background-color: ${o(r[l()][200],r[l()][700])};
        color: ${o(r[l()][700],r[l()][300])};
        border-color: ${o(r[l()][400],r[l()][600])};
      `:t`
      background-color: ${o(r[l()][100],r[l()][900])};
      color: ${o(r[l()][700],r[l()][300])};
      border-color: ${o(r[l()][400],r[l()][600])};
    `;return v(B,{get when(){return i()},get children(){var f=Vd(),g=f.firstChild,c=g.nextSibling,d=c.firstChild,h=d.firstChild,y=h.firstChild,m=h.nextSibling,b=d.nextSibling,p=b.firstChild,x=p.nextSibling,w=c.nextSibling,$=w.nextSibling,O=$.nextSibling,T=O.nextSibling,_=T.nextSibling,C=_.nextSibling,I=C.nextSibling,N=I.nextSibling;return k(y,v(B,{get when(){return i().options.mutationKey},fallback:"No mutationKey found",get children(){return wn(i().options.mutationKey,!0)}})),k(m,v(B,{get when(){return l()==="purple"},children:"pending"}),null),k(m,v(B,{get when(){return l()!=="purple"},get children(){return a()}}),null),k(x,()=>new Date(i().state.submittedAt).toLocaleTimeString()),k($,v(vt,{label:"Variables",defaultExpanded:["Variables"],get value(){return i().state.variables}})),k(T,v(vt,{label:"Context",defaultExpanded:["Context"],get value(){return i().state.context}})),k(C,v(vt,{label:"Data",defaultExpanded:["Data"],get value(){return i().state.data}})),k(N,v(vt,{label:"Mutation",defaultExpanded:["Mutation"],get value(){return i()}})),V(G=>{var te=L(n().detailsContainer,"tsqd-query-details-container"),Z=L(n().detailsHeader,"tsqd-query-details-header"),ie=L(n().detailsBody,"tsqd-query-details-summary-container"),z=L(n().queryDetailsStatus,u()),Q=L(n().detailsHeader,"tsqd-query-details-header"),J=S.size[2],le=L(n().detailsHeader,"tsqd-query-details-header"),ye=S.size[2],Ae=L(n().detailsHeader,"tsqd-query-details-header"),ge=S.size[2],De=L(n().detailsHeader,"tsqd-query-details-header"),M=S.size[2];return te!==G.e&&F(f,G.e=te),Z!==G.t&&F(g,G.t=Z),ie!==G.a&&F(c,G.a=ie),z!==G.o&&F(m,G.o=z),Q!==G.i&&F(w,G.i=Q),J!==G.n&&((G.n=J)!=null?$.style.setProperty("padding",J):$.style.removeProperty("padding")),le!==G.s&&F(O,G.s=le),ye!==G.h&&((G.h=ye)!=null?T.style.setProperty("padding",ye):T.style.removeProperty("padding")),Ae!==G.r&&F(_,G.r=Ae),ge!==G.d&&((G.d=ge)!=null?C.style.setProperty("padding",ge):C.style.removeProperty("padding")),De!==G.l&&F(I,G.l=De),M!==G.u&&((G.u=M)!=null?N.style.setProperty("padding",M):N.style.removeProperty("padding")),G},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0}),f}})},Dn=new Map,Jd=()=>{const e=D(()=>K().client.getQueryCache()),t=e().subscribe(n=>{Es(()=>{for(const[r,o]of Dn.entries())o.shouldUpdate(n)&&o.setter(r(e))})});return j(()=>{Dn.clear(),t()}),t},xe=(e,t=!0,n=()=>!0)=>{const r=D(()=>K().client.getQueryCache()),[o,s]=R(e(r),t?void 0:{equals:!1});return U(()=>{s(e(r))}),Dn.set(e,{setter:s,shouldUpdate:n}),j(()=>{Dn.delete(e)}),o},Mn=new Map,ef=()=>{const e=D(()=>K().client.getMutationCache()),t=e().subscribe(()=>{for(const[n,r]of Mn.entries())queueMicrotask(()=>{r(n(e))})});return j(()=>{Mn.clear(),t()}),t},He=(e,t=!0)=>{const n=D(()=>K().client.getMutationCache()),[r,o]=R(e(n),t?void 0:{equals:!1});return U(()=>{o(e(n))}),Mn.set(e,o),j(()=>{Mn.delete(e)}),r},vs=(e,t)=>{const{colors:n,font:r,size:o,alpha:s,shadow:a,border:l}=S,i=(u,f)=>e==="light"?u:f;return{devtoolsBtn:t`
      z-index: 100000;
      position: fixed;
      padding: 4px;
      text-align: left;

      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      box-shadow: ${a.md()};
      overflow: hidden;

      & div {
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 9999px;

        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        filter: blur(6px) saturate(1.2) contrast(1.1);
      }

      &:focus-within {
        outline-offset: 2px;
        outline: 3px solid ${n.green[600]};
      }

      & button {
        position: relative;
        z-index: 1;
        padding: 0;
        border-radius: 9999px;
        background-color: transparent;
        border: none;
        height: 40px;
        display: flex;
        width: 40px;
        overflow: hidden;
        cursor: pointer;
        outline: none;
        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      }
    `,panel:t`
      position: fixed;
      z-index: 9999;
      display: flex;
      gap: ${S.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${i(n.gray[300],n.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${i(n.gray[400],n.darkGray[300])};
      }
    `,parentPanel:t`
      z-index: 9999;
      display: flex;
      height: 100%;
      gap: ${S.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${i(n.gray[300],n.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${i(n.gray[400],n.darkGray[300])};
      }
    `,"devtoolsBtn-position-bottom-right":t`
      bottom: 12px;
      right: 12px;
    `,"devtoolsBtn-position-bottom-left":t`
      bottom: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-left":t`
      top: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-right":t`
      top: 12px;
      right: 12px;
    `,"devtoolsBtn-position-relative":t`
      position: relative;
    `,"panel-position-top":t`
      top: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
    `,"panel-position-bottom":t`
      bottom: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
    `,"panel-position-right":t`
      bottom: 0;
      right: 0;
      top: 0;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      max-width: 90%;
    `,"panel-position-left":t`
      bottom: 0;
      left: 0;
      top: 0;
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      max-width: 90%;
    `,closeBtn:t`
      position: absolute;
      cursor: pointer;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline: 2px solid ${n.blue[600]};
      }
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
        width: ${o[2]};
        height: ${o[2]};
      }
    `,"closeBtn-position-top":t`
      bottom: 0;
      right: ${o[2]};
      transform: translate(0, 100%);
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: none;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: 0px 0px ${l.radius.sm} ${l.radius.sm};
      padding: ${o[.5]} ${o[1.5]} ${o[1]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        bottom: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }

      & svg {
        transform: rotate(180deg);
      }
    `,"closeBtn-position-bottom":t`
      top: 0;
      right: ${o[2]};
      transform: translate(0, -100%);
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: none;
      border-radius: ${l.radius.sm} ${l.radius.sm} 0px 0px;
      padding: ${o[1]} ${o[1.5]} ${o[.5]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        top: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }
    `,"closeBtn-position-right":t`
      bottom: ${o[2]};
      left: 0;
      transform: translate(-100%, 0);
      border-right: none;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: ${l.radius.sm} 0px 0px ${l.radius.sm};
      padding: ${o[1.5]} ${o[.5]} ${o[1.5]} ${o[1]};

      &::after {
        content: ' ';
        position: absolute;
        left: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(-90deg);
      }
    `,"closeBtn-position-left":t`
      bottom: ${o[2]};
      right: 0;
      transform: translate(100%, 0);
      border-left: none;
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: 0px ${l.radius.sm} ${l.radius.sm} 0px;
      padding: ${o[1.5]} ${o[1]} ${o[1.5]} ${o[.5]};

      &::after {
        content: ' ';
        position: absolute;
        right: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(90deg);
      }
    `,queriesContainer:t`
      flex: 1 1 700px;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      display: flex;
      flex-direction: column;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
    `,dragHandle:t`
      position: absolute;
      transition: background-color 0.125s ease;
      &:hover {
        background-color: ${n.purple[400]}${i("",s[90])};
      }
      z-index: 4;
    `,"dragHandle-position-top":t`
      bottom: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-bottom":t`
      top: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-right":t`
      left: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,"dragHandle-position-left":t`
      right: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,row:t`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${S.size[2]} ${S.size[2.5]};
      gap: ${S.size[2.5]};
      border-bottom: ${i(n.gray[300],n.darkGray[500])} 1px solid;
      align-items: center;
      & > button {
        padding: 0;
        background: transparent;
        border: none;
        display: flex;
        gap: ${o[.5]};
        flex-direction: column;
      }
    `,logoAndToggleContainer:t`
      display: flex;
      gap: ${S.size[3]};
      align-items: center;
    `,logo:t`
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background-color: transparent;
      border: none;
      gap: ${S.size[.5]};
      padding: 0px;
      &:hover {
        opacity: 0.7;
      }
      &:focus-visible {
        outline-offset: 4px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,tanstackLogo:t`
      font-size: ${r.size.md};
      font-weight: ${r.weight.bold};
      line-height: ${r.lineHeight.xs};
      white-space: nowrap;
      color: ${i(n.gray[600],n.gray[300])};
    `,queryFlavorLogo:t`
      font-weight: ${r.weight.semibold};
      font-size: ${r.size.xs};
      background: linear-gradient(
        to right,
        ${i("#ea4037, #ff9b11","#dd524b, #e9a03b")}
      );
      background-clip: text;
      -webkit-background-clip: text;
      line-height: 1;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    `,queryStatusContainer:t`
      display: flex;
      gap: ${S.size[2]};
      height: min-content;
    `,queryStatusTag:t`
      display: flex;
      gap: ${S.size[1.5]};
      box-sizing: border-box;
      height: ${S.size[6.5]};
      background: ${i(n.gray[50],n.darkGray[500])};
      color: ${i(n.gray[700],n.gray[300])};
      border-radius: ${S.border.radius.sm};
      font-size: ${r.size.sm};
      padding: ${S.size[1]};
      padding-left: ${S.size[1.5]};
      align-items: center;
      font-weight: ${r.weight.medium};
      border: ${i("1px solid "+n.gray[300],"1px solid transparent")};
      user-select: none;
      position: relative;
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
    `,queryStatusTagLabel:t`
      font-size: ${r.size.xs};
    `,queryStatusCount:t`
      font-size: ${r.size.xs};
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${i(n.gray[500],n.gray[400])};
      background-color: ${i(n.gray[200],n.darkGray[300])};
      border-radius: 2px;
      font-variant-numeric: tabular-nums;
      height: ${S.size[4.5]};
    `,statusTooltip:t`
      position: absolute;
      z-index: 1;
      background-color: ${i(n.gray[50],n.darkGray[500])};
      top: 100%;
      left: 50%;
      transform: translate(-50%, calc(${S.size[2]}));
      padding: ${S.size[.5]} ${S.size[2]};
      border-radius: ${S.border.radius.sm};
      font-size: ${r.size.xs};
      border: 1px solid ${i(n.gray[400],n.gray[600])};
      color: ${i(n.gray[600],n.gray[300])};

      &::before {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, -100%);
        position: absolute;
        border-color: transparent transparent
          ${i(n.gray[400],n.gray[600])} transparent;
        border-style: solid;
        border-width: 7px;
        /* transform: rotate(180deg); */
      }

      &::after {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, calc(-100% + 2px));
        position: absolute;
        border-color: transparent transparent
          ${i(n.gray[100],n.darkGray[500])} transparent;
        border-style: solid;
        border-width: 7px;
      }
    `,filtersContainer:t`
      display: flex;
      gap: ${S.size[2]};
      & > button {
        cursor: pointer;
        padding: ${S.size[.5]} ${S.size[1.5]} ${S.size[.5]}
          ${S.size[2]};
        border-radius: ${S.border.radius.sm};
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: 1px solid ${i(n.gray[300],n.darkGray[200])};
        color: ${i(n.gray[700],n.gray[300])};
        font-size: ${r.size.xs};
        display: flex;
        align-items: center;
        line-height: ${r.lineHeight.sm};
        gap: ${S.size[1.5]};
        max-width: 160px;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${l.radius.xs};
          outline: 2px solid ${n.blue[800]};
        }
        & svg {
          width: ${S.size[3]};
          height: ${S.size[3]};
          color: ${i(n.gray[500],n.gray[400])};
        }
      }
    `,filterInput:t`
      padding: ${o[.5]} ${o[2]};
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      display: flex;
      box-sizing: content-box;
      align-items: center;
      gap: ${S.size[1.5]};
      max-width: 160px;
      min-width: 100px;
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      height: min-content;
      color: ${i(n.gray[600],n.gray[400])};
      & > svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      & input {
        font-size: ${r.size.xs};
        width: 100%;
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: none;
        padding: 0;
        line-height: ${r.lineHeight.sm};
        color: ${i(n.gray[700],n.gray[300])};
        &::placeholder {
          color: ${i(n.gray[700],n.gray[300])};
        }
        &:focus {
          outline: none;
        }
      }

      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,filterSelect:t`
      padding: ${S.size[.5]} ${S.size[2]};
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      display: flex;
      align-items: center;
      gap: ${S.size[1.5]};
      box-sizing: content-box;
      max-width: 160px;
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      height: min-content;
      & > svg {
        color: ${i(n.gray[600],n.gray[400])};
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
      & > select {
        appearance: none;
        color: ${i(n.gray[700],n.gray[300])};
        min-width: 100px;
        line-height: ${r.lineHeight.sm};
        font-size: ${r.size.xs};
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: none;
        &:focus {
          outline: none;
        }
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,actionsContainer:t`
      display: flex;
      gap: ${S.size[2]};
    `,actionsBtn:t`
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      width: ${S.size[6.5]};
      height: ${S.size[6.5]};
      justify-content: center;
      display: flex;
      align-items: center;
      gap: ${S.size[1.5]};
      max-width: 160px;
      cursor: pointer;
      padding: 0;
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      & svg {
        color: ${i(n.gray[700],n.gray[300])};
        width: ${S.size[3]};
        height: ${S.size[3]};
      }
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,actionsBtnOffline:t`
      & svg {
        stroke: ${i(n.yellow[700],n.yellow[500])};
        fill: ${i(n.yellow[700],n.yellow[500])};
      }
    `,overflowQueryContainer:t`
      flex: 1;
      overflow-y: auto;
      & > div {
        display: flex;
        flex-direction: column;
      }
    `,queryRow:t`
      display: flex;
      align-items: center;
      padding: 0;
      border: none;
      cursor: pointer;
      color: ${i(n.gray[700],n.gray[300])};
      background-color: ${i(n.gray[50],n.darkGray[700])};
      line-height: 1;
      &:focus {
        outline: none;
      }
      &:focus-visible {
        outline-offset: -2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      &:hover .tsqd-query-hash {
        background-color: ${i(n.gray[200],n.darkGray[600])};
      }

      & .tsqd-query-observer-count {
        padding: 0 ${S.size[1]};
        user-select: none;
        min-width: ${S.size[6.5]};
        align-self: stretch;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${r.size.xs};
        font-weight: ${r.weight.medium};
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[700])};
      }
      & .tsqd-query-hash {
        user-select: text;
        font-size: ${r.size.xs};
        display: flex;
        align-items: center;
        min-height: ${S.size[6]};
        flex: 1;
        padding: ${S.size[1]} ${S.size[2]};
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
        text-align: left;
        text-overflow: clip;
        word-break: break-word;
      }

      & .tsqd-query-disabled-indicator {
        align-self: stretch;
        display: flex;
        align-items: center;
        padding: 0 ${S.size[2]};
        color: ${i(n.gray[800],n.gray[300])};
        background-color: ${i(n.gray[300],n.darkGray[600])};
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
        font-size: ${r.size.xs};
      }
    `,selectedQueryRow:t`
      background-color: ${i(n.gray[200],n.darkGray[500])};
    `,detailsContainer:t`
      flex: 1 1 700px;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      color: ${i(n.gray[700],n.gray[300])};
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      display: flex;
      text-align: left;
    `,detailsHeader:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: ${i(n.gray[200],n.darkGray[600])};
      padding: ${S.size[1.5]} ${S.size[2]};
      font-weight: ${r.weight.medium};
      font-size: ${r.size.xs};
      line-height: ${r.lineHeight.xs};
      text-align: left;
    `,detailsBody:t`
      margin: ${S.size[1.5]} 0px ${S.size[2]} 0px;
      & > div {
        display: flex;
        align-items: stretch;
        padding: 0 ${S.size[2]};
        line-height: ${r.lineHeight.sm};
        justify-content: space-between;
        & > span {
          font-size: ${r.size.xs};
        }
        & > span:nth-child(2) {
          font-variant-numeric: tabular-nums;
        }
      }

      & > div:first-child {
        margin-bottom: ${S.size[1.5]};
      }

      & code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        margin: 0;
        font-size: ${r.size.xs};
        line-height: ${r.lineHeight.xs};
      }

      & pre {
        margin: 0;
        display: flex;
        align-items: center;
      }
    `,queryDetailsStatus:t`
      border: 1px solid ${n.darkGray[200]};
      border-radius: ${S.border.radius.sm};
      font-weight: ${r.weight.medium};
      padding: ${S.size[1]} ${S.size[2.5]};
    `,actionsBody:t`
      flex-wrap: wrap;
      margin: ${S.size[2]} 0px ${S.size[2]} 0px;
      display: flex;
      gap: ${S.size[2]};
      padding: 0px ${S.size[2]};
      & > button {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
        font-size: ${r.size.xs};
        padding: ${S.size[1]} ${S.size[2]};
        display: flex;
        border-radius: ${S.border.radius.sm};
        background-color: ${i(n.gray[100],n.darkGray[600])};
        border: 1px solid ${i(n.gray[300],n.darkGray[400])};
        align-items: center;
        gap: ${S.size[2]};
        font-weight: ${r.weight.medium};
        line-height: ${r.lineHeight.xs};
        cursor: pointer;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${l.radius.xs};
          outline: 2px solid ${n.blue[800]};
        }
        &:hover {
          background-color: ${i(n.gray[200],n.darkGray[500])};
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        & > span {
          width: ${o[1.5]};
          height: ${o[1.5]};
          border-radius: ${S.border.radius.full};
        }
      }
    `,actionsSelect:t`
      font-size: ${r.size.xs};
      padding: ${S.size[.5]} ${S.size[2]};
      display: flex;
      border-radius: ${S.border.radius.sm};
      overflow: hidden;
      background-color: ${i(n.gray[100],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[400])};
      align-items: center;
      gap: ${S.size[2]};
      font-weight: ${r.weight.medium};
      line-height: ${r.lineHeight.sm};
      color: ${i(n.red[500],n.red[400])};
      cursor: pointer;
      position: relative;
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      & > span {
        width: ${o[1.5]};
        height: ${o[1.5]};
        border-radius: ${S.border.radius.full};
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      & select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        appearance: none;
        background-color: transparent;
        border: none;
        color: transparent;
        outline: none;
      }

      & svg path {
        stroke: ${S.colors.red[400]};
      }
      & svg {
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
    `,settingsMenu:t`
      display: flex;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
      flex-direction: column;
      gap: ${o[.5]};
      border-radius: ${S.border.radius.sm};
      border: 1px solid ${i(n.gray[300],n.gray[700])};
      background-color: ${i(n.gray[50],n.darkGray[600])};
      font-size: ${r.size.xs};
      color: ${i(n.gray[700],n.gray[300])};
      z-index: 99999;
      min-width: 120px;
      padding: ${o[.5]};
    `,settingsSubTrigger:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: ${S.border.radius.xs};
      padding: ${S.size[1]} ${S.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      color: ${i(n.gray[700],n.gray[300])};
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
        transform: rotate(-90deg);
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
      &.data-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,settingsMenuHeader:t`
      padding: ${S.size[1]} ${S.size[1]};
      font-weight: ${r.weight.medium};
      border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
      color: ${i(n.gray[500],n.gray[400])};
      font-size: ${r.size.xs};
    `,settingsSubButton:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${i(n.gray[700],n.gray[300])};
      font-size: ${r.size.xs};
      border-radius: ${S.border.radius.xs};
      padding: ${S.size[1]} ${S.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
    `,themeSelectedButton:t`
      background-color: ${i(n.purple[100],n.purple[900])};
      color: ${i(n.purple[700],n.purple[300])};
      & svg {
        color: ${i(n.purple[700],n.purple[300])};
      }
      &:hover {
        background-color: ${i(n.purple[100],n.purple[900])};
      }
    `,viewToggle:t`
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[200],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      display: flex;
      padding: 0;
      font-size: ${r.size.xs};
      color: ${i(n.gray[700],n.gray[300])};
      overflow: hidden;

      &:has(:focus-visible) {
        outline: 2px solid ${n.blue[800]};
      }

      & .tsqd-radio-toggle {
        opacity: 0.5;
        display: flex;
        & label {
          display: flex;
          align-items: center;
          cursor: pointer;
          line-height: ${r.lineHeight.md};
        }

        & label:hover {
          background-color: ${i(n.gray[100],n.darkGray[500])};
        }
      }

      & > [data-checked] {
        opacity: 1;
        background-color: ${i(n.gray[100],n.darkGray[400])};
        & label:hover {
          background-color: ${i(n.gray[100],n.darkGray[400])};
        }
      }

      & .tsqd-radio-toggle:first-child {
        & label {
          padding: 0 ${S.size[1.5]} 0 ${S.size[2]};
        }
        border-right: 1px solid ${i(n.gray[300],n.darkGray[200])};
      }

      & .tsqd-radio-toggle:nth-child(2) {
        & label {
          padding: 0 ${S.size[2]} 0 ${S.size[1.5]};
        }
      }
    `,devtoolsEditForm:t`
      padding: ${o[2]};
      & > [data-error='true'] {
        outline: 2px solid ${i(n.red[200],n.red[800])};
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
      }
    `,devtoolsEditTextarea:t`
      width: 100%;
      max-height: 500px;
      font-family: 'Fira Code', monospace;
      font-size: ${r.size.xs};
      border-radius: ${l.radius.sm};
      field-sizing: content;
      padding: ${o[2]};
      background-color: ${i(n.gray[100],n.darkGray[800])};
      color: ${i(n.gray[900],n.gray[100])};
      border: 1px solid ${i(n.gray[200],n.gray[700])};
      resize: none;
      &:focus {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${i(n.blue[200],n.blue[800])};
      }
    `,devtoolsEditFormActions:t`
      display: flex;
      justify-content: space-between;
      gap: ${o[2]};
      align-items: center;
      padding-top: ${o[1]};
      font-size: ${r.size.xs};
    `,devtoolsEditFormError:t`
      color: ${i(n.red[700],n.red[500])};
    `,devtoolsEditFormActionContainer:t`
      display: flex;
      gap: ${o[2]};
    `,devtoolsEditFormAction:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      font-size: ${r.size.xs};
      padding: ${o[1]} ${S.size[2]};
      display: flex;
      border-radius: ${l.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[400])};
      align-items: center;
      gap: ${o[2]};
      font-weight: ${r.weight.medium};
      line-height: ${r.lineHeight.xs};
      cursor: pointer;
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `}},Ue=e=>vs("light",e),Ve=e=>vs("dark",e);rr(["click","mousedown","input"]);export{ms as C,af as D,sf as P,Xs as Q,of as T,Zs as a,lf as b,rf as c};
//# sourceMappingURL=B4MFY5CR-ff648b76.js.map

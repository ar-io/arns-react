import{J as G,K as Y,k as b,l as E,m as $,x as w,L as q,N as V,o as U,n as K}from"./core-acbe5f9e.js";import{ay as a}from"./index-035fdca6.js";const v={getSpacingStyles(e,t){if(Array.isArray(e))return e[t]?`var(--wui-spacing-${e[t]})`:void 0;if(typeof e=="string")return`var(--wui-spacing-${e})`},getFormattedDate(e){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(e)},getHostName(e){try{return new URL(e).hostname}catch{return""}},getTruncateString({string:e,charsStart:t,charsEnd:i,truncate:o}){return e.length<=t+i?e:o==="end"?`${e.substring(0,t)}...`:o==="start"?`...${e.substring(e.length-i)}`:`${e.substring(0,Math.floor(t))}...${e.substring(e.length-Math.floor(i))}`},generateAvatarColors(e){const i=e.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),o=this.hexToRgb(i),n=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),s=100-3*Number(n==null?void 0:n.replace("px","")),l=`${s}% ${s}% at 65% 40%`,u=[];for(let m=0;m<5;m+=1){const h=this.tintColor(o,.15*m);u.push(`rgb(${h[0]}, ${h[1]}, ${h[2]})`)}return`
    --local-color-1: ${u[0]};
    --local-color-2: ${u[1]};
    --local-color-3: ${u[2]};
    --local-color-4: ${u[3]};
    --local-color-5: ${u[4]};
    --local-radial-circle: ${l}
   `},hexToRgb(e){const t=parseInt(e,16),i=t>>16&255,o=t>>8&255,n=t&255;return[i,o,n]},tintColor(e,t){const[i,o,n]=e,r=Math.round(i+(255-i)*t),s=Math.round(o+(255-o)*t),l=Math.round(n+(255-n)*t);return[r,s,l]},isNumber(e){return{number:/^[0-9]+$/u}.number.test(e)},getColorTheme(e){var t;return e||(typeof window<"u"&&window.matchMedia?(t=window.matchMedia("(prefers-color-scheme: dark)"))!=null&&t.matches?"dark":"light":"dark")},splitBalance(e){const t=e.split(".");return t.length===2?[t[0],t[1]]:["0","00"]},roundNumber(e,t,i){return e.toString().length>=t?Number(e).toFixed(i):e},formatNumberToLocalString(e,t=2){return e===void 0?"0.00":typeof e=="number"?e.toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t}):parseFloat(e).toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t})}};function X(e,t){const{kind:i,elements:o}=t;return{kind:i,elements:o,finisher(n){customElements.get(e)||customElements.define(e,n)}}}function Z(e,t){return customElements.get(e)||customElements.define(e,t),t}function T(e){return function(i){return typeof i=="function"?Z(e,i):X(e,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const J={attribute:!0,type:String,converter:G,reflect:!1,hasChanged:Y},Q=(e=J,t,i)=>{const{kind:o,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(r===void 0&&globalThis.litPropertyMetadata.set(n,r=new Map),o==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),o==="accessor"){const{name:s}=i;return{set(l){const u=t.get.call(this);t.set.call(this,l),this.requestUpdate(s,u,e)},init(l){return l!==void 0&&this.C(s,void 0,e,l),l}}}if(o==="setter"){const{name:s}=i;return function(l){const u=this[s];t.call(this,l),this.requestUpdate(s,u,e)}}throw Error("Unsupported decorator location: "+o)};function c(e){return(t,i)=>typeof i=="object"?Q(e,t,i):((o,n,r)=>{const s=n.hasOwnProperty(r);return n.constructor.createProperty(r,o),s?Object.getOwnPropertyDescriptor(n,r):void 0})(e,t,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Et(e){return c({...e,state:!0,attribute:!1})}const tt=b`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var d=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let p=class extends ${render(){return this.style.cssText=`
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&v.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&v.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&v.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&v.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&v.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&v.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&v.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&v.getSpacingStyles(this.margin,3)};
    `,w`<slot></slot>`}};p.styles=[E,tt];d([c()],p.prototype,"flexDirection",void 0);d([c()],p.prototype,"flexWrap",void 0);d([c()],p.prototype,"flexBasis",void 0);d([c()],p.prototype,"flexGrow",void 0);d([c()],p.prototype,"flexShrink",void 0);d([c()],p.prototype,"alignItems",void 0);d([c()],p.prototype,"justifyContent",void 0);d([c()],p.prototype,"columnGap",void 0);d([c()],p.prototype,"rowGap",void 0);d([c()],p.prototype,"gap",void 0);d([c()],p.prototype,"padding",void 0);d([c()],p.prototype,"margin",void 0);p=d([T("wui-flex")],p);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Tt=e=>e??q;/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const et=e=>e===null||typeof e!="object"&&typeof e!="function",it=e=>e.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const W={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},N=e=>(...t)=>({_$litDirective$:e,values:t});let H=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,i,o){this._$Ct=t,this._$AM=i,this._$Ci=o}_$AS(t,i){return this.update(t,i)}update(t,i){return this.render(...i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const x=(e,t)=>{var o;const i=e._$AN;if(i===void 0)return!1;for(const n of i)(o=n._$AO)==null||o.call(n,t,!1),x(n,t);return!0},I=e=>{let t,i;do{if((t=e._$AM)===void 0)break;i=t._$AN,i.delete(e),e=t}while((i==null?void 0:i.size)===0)},F=e=>{for(let t;t=e._$AM;e=t){let i=t._$AN;if(i===void 0)t._$AN=i=new Set;else if(i.has(e))break;i.add(e),at(t)}};function rt(e){this._$AN!==void 0?(I(this),this._$AM=e,F(this)):this._$AM=e}function ot(e,t=!1,i=0){const o=this._$AH,n=this._$AN;if(n!==void 0&&n.size!==0)if(t)if(Array.isArray(o))for(let r=i;r<o.length;r++)x(o[r],!1),I(o[r]);else o!=null&&(x(o,!1),I(o));else x(this,e)}const at=e=>{e.type==W.CHILD&&(e._$AP??(e._$AP=ot),e._$AQ??(e._$AQ=rt))};class nt extends H{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,i,o){super._$AT(t,i,o),F(this),this.isConnected=t._$AU}_$AO(t,i=!0){var o,n;t!==this.isConnected&&(this.isConnected=t,t?(o=this.reconnected)==null||o.call(this):(n=this.disconnected)==null||n.call(this)),i&&(x(this,t),I(this))}setValue(t){if(it(this._$Ct))this._$Ct._$AI(t,this);else{const i=[...this._$Ct._$AH];i[this._$Ci]=t,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class st{constructor(t){this.G=t}disconnect(){this.G=void 0}reconnect(t){this.G=t}deref(){return this.G}}class lt{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??(this.Y=new Promise(t=>this.Z=t))}resume(){var t;(t=this.Z)==null||t.call(this),this.Y=this.Z=void 0}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=e=>!et(e)&&typeof e.then=="function",B=1073741823;class ct extends nt{constructor(){super(...arguments),this._$Cwt=B,this._$Cbt=[],this._$CK=new st(this),this._$CX=new lt}render(...t){return t.find(i=>!j(i))??V}update(t,i){const o=this._$Cbt;let n=o.length;this._$Cbt=i;const r=this._$CK,s=this._$CX;this.isConnected||this.disconnected();for(let l=0;l<i.length&&!(l>this._$Cwt);l++){const u=i[l];if(!j(u))return this._$Cwt=l,u;l<n&&u===o[l]||(this._$Cwt=B,n=0,Promise.resolve(u).then(async m=>{for(;s.get();)await s.get();const h=r.deref();if(h!==void 0){const D=h._$Cbt.indexOf(u);D>-1&&D<h._$Cwt&&(h._$Cwt=D,h.setValue(m))}}))}return V}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const ut=N(ct);class pt{constructor(){this.cache=new Map}set(t,i){this.cache.set(t,i)}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}delete(t){this.cache.delete(t)}clear(){this.cache.clear()}}const C=new pt,dt=b`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var P=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};const M={add:async()=>(await a(()=>import("./add-d176c6d2.js"),["./add-d176c6d2.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).addSvg,allWallets:async()=>(await a(()=>import("./all-wallets-251091b0.js"),["./all-wallets-251091b0.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).allWalletsSvg,arrowBottomCircle:async()=>(await a(()=>import("./arrow-bottom-circle-87862ca4.js"),["./arrow-bottom-circle-87862ca4.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).arrowBottomCircleSvg,appStore:async()=>(await a(()=>import("./app-store-e427e35e.js"),["./app-store-e427e35e.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).appStoreSvg,apple:async()=>(await a(()=>import("./apple-1e86573d.js"),["./apple-1e86573d.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).appleSvg,arrowBottom:async()=>(await a(()=>import("./arrow-bottom-79b2d7d4.js"),["./arrow-bottom-79b2d7d4.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).arrowBottomSvg,arrowLeft:async()=>(await a(()=>import("./arrow-left-c1609359.js"),["./arrow-left-c1609359.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).arrowLeftSvg,arrowRight:async()=>(await a(()=>import("./arrow-right-5878c6b9.js"),["./arrow-right-5878c6b9.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).arrowRightSvg,arrowTop:async()=>(await a(()=>import("./arrow-top-35a8a145.js"),["./arrow-top-35a8a145.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).arrowTopSvg,bank:async()=>(await a(()=>import("./bank-93ca974b.js"),["./bank-93ca974b.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).bankSvg,browser:async()=>(await a(()=>import("./browser-06d6f872.js"),["./browser-06d6f872.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).browserSvg,card:async()=>(await a(()=>import("./card-a6d9a66e.js"),["./card-a6d9a66e.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).cardSvg,checkmark:async()=>(await a(()=>import("./checkmark-a4eeb6f9.js"),["./checkmark-a4eeb6f9.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).checkmarkSvg,checkmarkBold:async()=>(await a(()=>import("./checkmark-bold-aaa0f48b.js"),["./checkmark-bold-aaa0f48b.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).checkmarkBoldSvg,chevronBottom:async()=>(await a(()=>import("./chevron-bottom-fa1c799a.js"),["./chevron-bottom-fa1c799a.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).chevronBottomSvg,chevronLeft:async()=>(await a(()=>import("./chevron-left-1cc74f1a.js"),["./chevron-left-1cc74f1a.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).chevronLeftSvg,chevronRight:async()=>(await a(()=>import("./chevron-right-ec7269d1.js"),["./chevron-right-ec7269d1.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).chevronRightSvg,chevronTop:async()=>(await a(()=>import("./chevron-top-1cca866c.js"),["./chevron-top-1cca866c.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).chevronTopSvg,chromeStore:async()=>(await a(()=>import("./chrome-store-c78befff.js"),["./chrome-store-c78befff.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).chromeStoreSvg,clock:async()=>(await a(()=>import("./clock-f95a4691.js"),["./clock-f95a4691.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).clockSvg,close:async()=>(await a(()=>import("./close-b3e01d77.js"),["./close-b3e01d77.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).closeSvg,compass:async()=>(await a(()=>import("./compass-cb562737.js"),["./compass-cb562737.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).compassSvg,coinPlaceholder:async()=>(await a(()=>import("./coinPlaceholder-ee3e02bb.js"),["./coinPlaceholder-ee3e02bb.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).coinPlaceholderSvg,copy:async()=>(await a(()=>import("./copy-255c683e.js"),["./copy-255c683e.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).copySvg,cursor:async()=>(await a(()=>import("./cursor-008ebfdb.js"),["./cursor-008ebfdb.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).cursorSvg,cursorTransparent:async()=>(await a(()=>import("./cursor-transparent-c2117bab.js"),["./cursor-transparent-c2117bab.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).cursorTransparentSvg,desktop:async()=>(await a(()=>import("./desktop-e4de8d54.js"),["./desktop-e4de8d54.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).desktopSvg,disconnect:async()=>(await a(()=>import("./disconnect-c87b59d9.js"),["./disconnect-c87b59d9.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).disconnectSvg,discord:async()=>(await a(()=>import("./discord-a61cadb3.js"),["./discord-a61cadb3.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).discordSvg,etherscan:async()=>(await a(()=>import("./etherscan-ae38e931.js"),["./etherscan-ae38e931.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).etherscanSvg,extension:async()=>(await a(()=>import("./extension-a5c665c9.js"),["./extension-a5c665c9.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).extensionSvg,externalLink:async()=>(await a(()=>import("./external-link-75335850.js"),["./external-link-75335850.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).externalLinkSvg,facebook:async()=>(await a(()=>import("./facebook-a634e5bb.js"),["./facebook-a634e5bb.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).facebookSvg,farcaster:async()=>(await a(()=>import("./farcaster-af340189.js"),["./farcaster-af340189.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).farcasterSvg,filters:async()=>(await a(()=>import("./filters-bcb25077.js"),["./filters-bcb25077.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).filtersSvg,github:async()=>(await a(()=>import("./github-91f1973e.js"),["./github-91f1973e.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).githubSvg,google:async()=>(await a(()=>import("./google-d5a6ceb3.js"),["./google-d5a6ceb3.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).googleSvg,helpCircle:async()=>(await a(()=>import("./help-circle-ed953bef.js"),["./help-circle-ed953bef.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).helpCircleSvg,image:async()=>(await a(()=>import("./image-5d053268.js"),["./image-5d053268.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).imageSvg,id:async()=>(await a(()=>import("./id-219c7ffb.js"),["./id-219c7ffb.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).idSvg,infoCircle:async()=>(await a(()=>import("./info-circle-db4f0ca5.js"),["./info-circle-db4f0ca5.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).infoCircleSvg,lightbulb:async()=>(await a(()=>import("./lightbulb-8930667d.js"),["./lightbulb-8930667d.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).lightbulbSvg,mail:async()=>(await a(()=>import("./mail-f1db0100.js"),["./mail-f1db0100.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).mailSvg,mobile:async()=>(await a(()=>import("./mobile-92d87957.js"),["./mobile-92d87957.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).mobileSvg,more:async()=>(await a(()=>import("./more-9703374f.js"),["./more-9703374f.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).moreSvg,networkPlaceholder:async()=>(await a(()=>import("./network-placeholder-489db23b.js"),["./network-placeholder-489db23b.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).networkPlaceholderSvg,nftPlaceholder:async()=>(await a(()=>import("./nftPlaceholder-44261aac.js"),["./nftPlaceholder-44261aac.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).nftPlaceholderSvg,off:async()=>(await a(()=>import("./off-9cf71f6e.js"),["./off-9cf71f6e.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).offSvg,playStore:async()=>(await a(()=>import("./play-store-f5aa449d.js"),["./play-store-f5aa449d.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).playStoreSvg,plus:async()=>(await a(()=>import("./plus-33b57aee.js"),["./plus-33b57aee.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).plusSvg,qrCode:async()=>(await a(()=>import("./qr-code-780443ee.js"),["./qr-code-780443ee.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).qrCodeIcon,recycleHorizontal:async()=>(await a(()=>import("./recycle-horizontal-4fdeacea.js"),["./recycle-horizontal-4fdeacea.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).recycleHorizontalSvg,refresh:async()=>(await a(()=>import("./refresh-8414ed8b.js"),["./refresh-8414ed8b.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).refreshSvg,search:async()=>(await a(()=>import("./search-f0f8550a.js"),["./search-f0f8550a.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).searchSvg,send:async()=>(await a(()=>import("./send-e8a22260.js"),["./send-e8a22260.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).sendSvg,swapHorizontal:async()=>(await a(()=>import("./swapHorizontal-e7579219.js"),["./swapHorizontal-e7579219.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).swapHorizontalSvg,swapHorizontalMedium:async()=>(await a(()=>import("./swapHorizontalMedium-3568b94b.js"),["./swapHorizontalMedium-3568b94b.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await a(()=>import("./swapHorizontalBold-7e9ce12a.js"),["./swapHorizontalBold-7e9ce12a.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await a(()=>import("./swapHorizontalRoundedBold-25bf4352.js"),["./swapHorizontalRoundedBold-25bf4352.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await a(()=>import("./swapVertical-4162f5ba.js"),["./swapVertical-4162f5ba.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).swapVerticalSvg,telegram:async()=>(await a(()=>import("./telegram-f0327d0c.js"),["./telegram-f0327d0c.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).telegramSvg,threeDots:async()=>(await a(()=>import("./three-dots-93862709.js"),["./three-dots-93862709.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).threeDotsSvg,twitch:async()=>(await a(()=>import("./twitch-ee31999f.js"),["./twitch-ee31999f.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).twitchSvg,twitter:async()=>(await a(()=>import("./x-7436f551.js"),["./x-7436f551.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).xSvg,twitterIcon:async()=>(await a(()=>import("./twitterIcon-dcb5bf21.js"),["./twitterIcon-dcb5bf21.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).twitterIconSvg,verify:async()=>(await a(()=>import("./verify-bcc4577d.js"),["./verify-bcc4577d.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).verifySvg,verifyFilled:async()=>(await a(()=>import("./verify-filled-a9d9084e.js"),["./verify-filled-a9d9084e.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).verifyFilledSvg,wallet:async()=>(await a(()=>import("./wallet-40d5dc59.js"),["./wallet-40d5dc59.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).walletSvg,walletConnect:async()=>(await a(()=>import("./walletconnect-d17ce054.js"),["./walletconnect-d17ce054.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).walletConnectSvg,walletConnectLightBrown:async()=>(await a(()=>import("./walletconnect-d17ce054.js"),["./walletconnect-d17ce054.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await a(()=>import("./walletconnect-d17ce054.js"),["./walletconnect-d17ce054.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).walletConnectBrownSvg,walletPlaceholder:async()=>(await a(()=>import("./wallet-placeholder-df5c6b89.js"),["./wallet-placeholder-df5c6b89.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).walletPlaceholderSvg,warningCircle:async()=>(await a(()=>import("./warning-circle-ffbb3e48.js"),["./warning-circle-ffbb3e48.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).warningCircleSvg,x:async()=>(await a(()=>import("./x-7436f551.js"),["./x-7436f551.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).xSvg,info:async()=>(await a(()=>import("./info-d5266a97.js"),["./info-d5266a97.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).infoSvg,exclamationTriangle:async()=>(await a(()=>import("./exclamation-triangle-f2e7b741.js"),["./exclamation-triangle-f2e7b741.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).exclamationTriangleSvg,reown:async()=>(await a(()=>import("./reown-logo-f852b187.js"),["./reown-logo-f852b187.js","./core-acbe5f9e.js","./index-035fdca6.js","./index-4a88d9e7.css","./index.es-73c89577.js","./index-accd8060.js"],import.meta.url)).reownSvg};async function _t(e){if(C.has(e))return C.get(e);const i=(M[e]??M.copy)();return C.set(e,i),i}let f=class extends ${constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `,w`${ut(_t(this.name),w`<div class="fallback"></div>`)}`}};f.styles=[E,U,dt];P([c()],f.prototype,"size",void 0);P([c()],f.prototype,"name",void 0);P([c()],f.prototype,"color",void 0);P([c()],f.prototype,"aspectRatio",void 0);f=P([T("wui-icon")],f);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const mt=N(class extends H{constructor(e){var t;if(super(e),e.type!==W.ATTRIBUTE||e.name!=="class"||((t=e.strings)==null?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){var o,n;if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(const r in t)t[r]&&!((o=this.nt)!=null&&o.has(r))&&this.st.add(r);return this.render(t)}const i=e.element.classList;for(const r of this.st)r in t||(i.remove(r),this.st.delete(r));for(const r in t){const s=!!t[r];s===this.st.has(r)||(n=this.nt)!=null&&n.has(r)||(s?(i.add(r),this.st.add(r)):(i.remove(r),this.st.delete(r)))}return V}}),ht=b`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var O=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let y=class extends ${constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const t={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `,w`<slot class=${mt(t)}></slot>`}};y.styles=[E,ht];O([c()],y.prototype,"variant",void 0);O([c()],y.prototype,"color",void 0);O([c()],y.prototype,"align",void 0);O([c()],y.prototype,"lineClamp",void 0);y=O([T("wui-text")],y);const gt=b`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-color-gray-glass-020);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    box-sizing: content-box;
    width: var(--local-size);
    height: var(--local-size);
    min-height: var(--local-size);
    min-width: var(--local-size);
  }

  @supports (background: color-mix(in srgb, white 50%, black)) {
    :host {
      background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    }
  }
`;var g=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let _=class extends ${constructor(){super(...arguments),this.size="md",this.backgroundColor="accent-100",this.iconColor="accent-100",this.background="transparent",this.border=!1,this.borderColor="wui-color-bg-125",this.icon="copy"}render(){const t=this.iconSize||this.size,i=this.size==="lg",o=this.size==="xl",n=i?"12%":"16%",r=i?"xxs":o?"s":"3xl",s=this.background==="gray",l=this.background==="opaque",u=this.backgroundColor==="accent-100"&&l||this.backgroundColor==="success-100"&&l||this.backgroundColor==="error-100"&&l||this.backgroundColor==="inverse-100"&&l;let m=`var(--wui-color-${this.backgroundColor})`;return u?m=`var(--wui-icon-box-bg-${this.backgroundColor})`:s&&(m=`var(--wui-color-gray-${this.backgroundColor})`),this.style.cssText=`
       --local-bg-value: ${m};
       --local-bg-mix: ${u||s?"100%":n};
       --local-border-radius: var(--wui-border-radius-${r});
       --local-size: var(--wui-icon-box-size-${this.size});
       --local-border: ${this.borderColor==="wui-color-bg-125"?"2px":"1px"} solid ${this.border?`var(--${this.borderColor})`:"transparent"}
   `,w` <wui-icon color=${this.iconColor} size=${t} name=${this.icon}></wui-icon> `}};_.styles=[E,K,gt];g([c()],_.prototype,"size",void 0);g([c()],_.prototype,"backgroundColor",void 0);g([c()],_.prototype,"iconColor",void 0);g([c()],_.prototype,"iconSize",void 0);g([c()],_.prototype,"background",void 0);g([c({type:Boolean})],_.prototype,"border",void 0);g([c()],_.prototype,"borderColor",void 0);g([c()],_.prototype,"icon",void 0);_=g([T("wui-icon-box")],_);const vt=b`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
  }
`;var L=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let S=class extends ${constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0}render(){return this.style.cssText=`
      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      `,w`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};S.styles=[E,U,vt];L([c()],S.prototype,"src",void 0);L([c()],S.prototype,"alt",void 0);L([c()],S.prototype,"size",void 0);S=L([T("wui-image")],S);const wt=b`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--wui-spacing-m);
    padding: 0 var(--wui-spacing-3xs) !important;
    border-radius: var(--wui-border-radius-5xs);
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host > wui-text {
    transform: translateY(5%);
  }

  :host([data-variant='main']) {
    background-color: var(--wui-color-accent-glass-015);
    color: var(--wui-color-accent-100);
  }

  :host([data-variant='shade']) {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-200);
  }

  :host([data-variant='success']) {
    background-color: var(--wui-icon-box-bg-success-100);
    color: var(--wui-color-success-100);
  }

  :host([data-variant='error']) {
    background-color: var(--wui-icon-box-bg-error-100);
    color: var(--wui-color-error-100);
  }

  :host([data-size='lg']) {
    padding: 11px 5px !important;
  }

  :host([data-size='lg']) > wui-text {
    transform: translateY(2%);
  }
`;var z=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let R=class extends ${constructor(){super(...arguments),this.variant="main",this.size="lg"}render(){this.dataset.variant=this.variant,this.dataset.size=this.size;const t=this.size==="md"?"mini-700":"micro-700";return w`
      <wui-text data-variant=${this.variant} variant=${t} color="inherit">
        <slot></slot>
      </wui-text>
    `}};R.styles=[E,wt];z([c()],R.prototype,"variant",void 0);z([c()],R.prototype,"size",void 0);R=z([T("wui-tag")],R);const ft=b`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: var(--local-color);
    stroke-width: 4px;
    stroke-dasharray: 1, 124;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 124;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 124;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dashoffset: -125;
    }
  }
`;var k=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let A=class extends ${constructor(){super(...arguments),this.color="accent-100",this.size="lg"}render(){return this.style.cssText=`--local-color: ${this.color==="inherit"?"inherit":`var(--wui-color-${this.color})`}`,this.dataset.size=this.size,w`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`}};A.styles=[E,ft];k([c()],A.prototype,"color",void 0);k([c()],A.prototype,"size",void 0);A=k([T("wui-loading-spinner")],A);export{v as U,mt as a,T as c,N as e,nt as f,c as n,Tt as o,Et as r};
//# sourceMappingURL=index-58f1b67f.js.map

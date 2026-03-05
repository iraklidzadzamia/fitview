"use strict";(()=>{var A=Object.defineProperty;var h=(e,t)=>()=>(e&&(t=e(e=0)),t);var M=(e,t)=>{for(var o in t)A(e,o,{get:t[o],enumerable:!0})};function N(e){let t=e?Number(e):Number.NaN;return!Number.isFinite(t)||t<=0?2e3:Math.round(t*1e3)}function P(e,t){return t.startsWith("http://")||t.startsWith("https://")?t:`${e.replace(/\/+$/,"")}/${t.replace(/^\/+/,"")}`}async function E(e){let t=new FormData;t.set("person_photo",e.file),t.set("catalog_item_id",e.itemId);let o=await fetch(`${e.apiBase.replace(/\/+$/,"")}/tryon`,{method:"POST",headers:{"x-api-key":e.apiKey},body:t}),r=await o.json();if(!o.ok||"error"in r)throw new Error("error"in r?r.error:"Failed to create try-on request");return r.data}async function T(e){var l;let t=P(e.apiBase,e.pollUrl),o=typeof e.maxAttempts=="number"&&e.maxAttempts>0?Math.floor(e.maxAttempts):60,r=0;for(;r<o;){r+=1;let a=await fetch(t,{method:"GET",headers:{"x-api-key":e.apiKey},cache:"no-store"}),i=await a.json();if(!a.ok||"error"in i)return i;if(i.data.status==="PENDING"||i.data.status==="PROCESSING"){if((l=e.onProgress)==null||l.call(e,i.data.status),r>=o)break;let p=N(a.headers.get("Retry-After"));await new Promise(n=>setTimeout(n,p));continue}return i}return{error:"Request timed out, please try again"}}var L=h(()=>{"use strict"});function B(e){let t=document.createElement("div");t.id="fitview-widget-host";let o=t.attachShadow({mode:"closed"}),r=document.createElement("style");r.textContent=`
    :host, * { box-sizing: border-box; }
    .fitview-open {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 2147483000;
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      color: #fff;
      cursor: pointer;
      font: 600 14px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: ${e.theme.buttonColor};
      box-shadow: 0 12px 26px rgba(15, 23, 42, 0.35);
    }

    .fitview-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.64);
      display: none;
      z-index: 2147483001;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .fitview-overlay[data-open="true"] { display: flex; }

    .fitview-modal {
      width: min(520px, 100%);
      border-radius: 18px;
      background: #0f172a;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 18px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .fitview-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
    }
    .fitview-title { margin: 0; font-size: 18px; font-weight: 700; }
    .fitview-subtitle { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }

    .fitview-close {
      background: transparent;
      color: #cbd5e1;
      border: 0;
      cursor: pointer;
      font-size: 16px;
    }

    .fitview-dropzone {
      margin-top: 16px;
      border: 1px dashed #475569;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      display: block;
      cursor: pointer;
      font-size: 13px;
      color: #cbd5e1;
    }

    .fitview-actions {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .fitview-btn {
      border-radius: 10px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #e2e8f0;
      padding: 10px 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-height: 40px;
    }

    .fitview-btn[data-primary="true"] {
      border-color: transparent;
      background: ${e.theme.buttonColor};
      color: #fff;
    }

    .fitview-status {
      margin: 12px 0 0;
      font-size: 13px;
      color: #93c5fd;
      min-height: 18px;
    }

    .fitview-result {
      margin-top: 14px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #334155;
      background: #020617;
      aspect-ratio: 3 / 4;
      display: grid;
      place-items: center;
    }

    .fitview-result img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: none;
    }

    .fitview-result img[data-visible="true"] { display: block; }
  `;let l=document.createElement("button");l.className="fitview-open",l.textContent=e.texts.buttonLabel;let a=document.createElement("div");a.className="fitview-overlay",a.setAttribute("data-open","false");let i=document.createElement("div");i.className="fitview-modal";let p=document.createElement("div");p.className="fitview-header";let n=document.createElement("div"),d=document.createElement("h3");d.className="fitview-title",d.textContent=e.texts.title;let s=document.createElement("p");s.className="fitview-subtitle",s.textContent=e.texts.subtitle,n.append(d,s);let m=document.createElement("button");m.className="fitview-close",m.textContent="\u2715",m.setAttribute("aria-label","Close"),p.append(n,m);let g=document.createElement("label");g.className="fitview-dropzone",g.textContent="Drop your photo here or tap to upload";let u=document.createElement("input");u.type="file",u.accept="image/jpeg,image/png,image/webp",u.capture="user",u.hidden=!0,g.append(u);let x=document.createElement("p");x.className="fitview-status",x.textContent="";let y=document.createElement("div");y.className="fitview-result",y.style.display="none";let v=document.createElement("img");v.alt="FitView result",v.setAttribute("data-visible","false"),y.append(v);let w=document.createElement("div");w.className="fitview-actions";let b=document.createElement("button");b.className="fitview-btn",b.setAttribute("data-primary","true"),b.textContent=e.texts.cta;let f=document.createElement("button");f.className="fitview-btn",f.textContent="Try another photo",f.style.display="none";let c=document.createElement("a");return c.className="fitview-btn",c.textContent="Download",c.target="_blank",c.rel="noopener noreferrer",c.style.display="none",w.append(b,f,c),i.append(p,g,x,w,y),a.append(i),o.append(r,l,a),document.body.append(t),{host:t,root:i,openButton:l,closeButton:m,dropzone:g,fileInput:u,submitButton:b,retryButton:f,downloadLink:c,statusText:x,previewImage:v,resultBox:y,overlay:a}}var k=h(()=>{"use strict"});var C={};M(C,{mountWidget:()=>D});function S(){var t;let e=document.querySelector("[data-fitview-item]");return(t=e==null?void 0:e.dataset.fitviewItem)!=null?t:null}function D(e){let t=B({texts:{buttonLabel:e.buttonText,title:"Try It On",subtitle:"Upload a photo and preview this item on you.",cta:"Generate your look"},theme:{buttonColor:e.buttonColor}}),o=null,r=()=>{t.previewImage.removeAttribute("src"),t.previewImage.setAttribute("data-visible","false"),t.resultBox.style.display="none",t.downloadLink.removeAttribute("href"),t.downloadLink.style.display="none",t.retryButton.style.display="none"},l=n=>{t.statusText.textContent=n,t.statusText.style.color="#fca5a5",t.retryButton.style.display="inline-flex"},a=n=>{t.statusText.textContent=n,t.statusText.style.color="#93c5fd"},i=()=>{t.overlay.setAttribute("data-open","true"),t.statusText.textContent="",r()},p=()=>{t.overlay.setAttribute("data-open","false")};t.openButton.addEventListener("click",i),t.closeButton.addEventListener("click",p),t.overlay.addEventListener("click",n=>{n.target===t.overlay&&p()}),t.fileInput.addEventListener("change",()=>{var d,s;let n=(s=(d=t.fileInput.files)==null?void 0:d[0])!=null?s:null;o=n,t.statusText.textContent=n?`Selected: ${n.name}`:""}),t.retryButton.addEventListener("click",()=>{t.statusText.textContent="",t.retryButton.style.display="none",r()}),t.submitButton.addEventListener("click",async()=>{let n=S();if(!n){l("Missing data-fitview-item attribute on the page.");return}if(!o){l("Please upload a photo first.");return}t.submitButton.setAttribute("disabled","true"),a("Uploading your photo...");try{let d=await E({apiBase:e.apiBase,apiKey:e.apiKey,itemId:n,file:o});a("Generating your look...");let s=await T({apiBase:e.apiBase,apiKey:e.apiKey,pollUrl:d.pollUrl,onProgress:()=>{a("Generating your look...")}});if("error"in s){l(s.error);return}if(s.data.status==="FAILED"){l(s.data.errorMessage||"Generation failed. Please try again.");return}s.data.status==="COMPLETED"&&(a("Done."),t.previewImage.src=s.data.resultImageUrl,t.previewImage.setAttribute("data-visible","true"),t.resultBox.style.display="block",t.downloadLink.href=s.data.resultImageUrl,t.downloadLink.style.display="inline-flex",t.retryButton.style.display="inline-flex")}catch(d){let s=d instanceof Error?d.message:"Failed to process try-on";l(s)}finally{t.submitButton.removeAttribute("disabled")}})}var I=h(()=>{"use strict";L();k()});(function(){var i,p,n;let t=document.currentScript;if(!t)return;let o=t.getAttribute("data-api-key");if(!o){console.error("[FitView] Missing data-api-key attribute.");return}let r=(i=t.getAttribute("data-api-base"))!=null?i:"https://fitview-one.vercel.app/api/public",l=(p=t.getAttribute("data-button-text"))!=null?p:"Try it on",a=(n=t.getAttribute("data-button-color"))!=null?n:"#2563eb";Promise.resolve().then(()=>(I(),C)).then(({mountWidget:d})=>{d({apiBase:r,apiKey:o,buttonText:l,buttonColor:a})}).catch(d=>{console.error("[FitView] Failed to mount widget.",d)})})();})();

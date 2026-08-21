"use strict";(()=>{var Ke=Object.defineProperty;var Ve=(e,t)=>()=>(e&&(t=e(e=0)),t);var Ze=(e,t)=>{for(var a in t)Ke(e,a,{get:t[a],enumerable:!0})};var pe={};Ze(pe,{authLogin:()=>Qe,bulkImportRag:()=>_e,clearApiToken:()=>K,clearChat:()=>te,createCharacter:()=>re,createRagDoc:()=>me,createScene:()=>ce,deleteAccount:()=>Q,deleteCharacter:()=>oe,deleteRagDoc:()=>ge,deleteScene:()=>de,getApiToken:()=>Te,getCharacter:()=>se,getCharacters:()=>ae,getChatHistory:()=>ee,getFlStatus:()=>H,getPublicCharacters:()=>$,getRagDocs:()=>ue,getScenes:()=>le,getUser:()=>Z,saveChat:()=>U,sendChatMessage:()=>ne,setApiToken:()=>O,updateCharacter:()=>ie,updateProfile:()=>X,updateScene:()=>Xe});function Te(){return localStorage.getItem(Y)}function O(e){localStorage.setItem(Y,e)}function K(){localStorage.removeItem(Y)}async function u(e,t={}){let a=Te(),n={"Content-Type":"application/json",...t.headers||{}};a&&(n.Authorization=`Bearer ${a}`);let s=await fetch(`${Ie}${e}`,{...t,headers:n});if(!s.ok)throw console.warn(`[ateney] API ${s.status}: ${e}`),new Error(`API ${s.status}`);return s.json()}async function V(e,t={}){try{return await u(e,t)}catch{return null}}async function Qe(e){return u("/auth/login",{method:"POST",body:JSON.stringify({id_token:e})})}async function Z(){return u("/user")}async function Q(){return u("/user",{method:"DELETE"})}async function X(e){return u("/user/profile",{method:"PUT",body:JSON.stringify(e)})}async function ee(e=50,t=0){return V(`/chat/history?limit=${e}&offset=${t}`)}async function U(e,t,a){return V("/chat/save",{method:"POST",body:JSON.stringify({role:e,content:t,adapter_value:a})})}async function te(){return V("/chat/clear",{method:"DELETE"})}async function ne(e,t,a){try{return await u("/chat/send",{method:"POST",body:JSON.stringify({message:e,character_id:t,scene_id:a})})}catch{return null}}async function ae(){return u("/characters")}async function $(){return u("/characters/public")}async function se(e){return u(`/characters/${e}`)}async function re(e){return u("/characters",{method:"POST",body:JSON.stringify(e)})}async function ie(e,t){return u(`/characters/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function oe(e){return u(`/characters/${e}`,{method:"DELETE"})}async function le(e){let t=e?`?character_id=${e}`:"";return u(`/scenes${t}`)}async function ce(e){return u("/scenes",{method:"POST",body:JSON.stringify(e)})}async function Xe(e,t){return u(`/scenes/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function de(e){return u(`/scenes/${e}`,{method:"DELETE"})}async function ue(e){let t=e?`?character_id=${e}`:"";return u(`/rag${t}`)}async function me(e){return u("/rag",{method:"POST",body:JSON.stringify(e)})}async function _e(e){return u("/rag/bulk",{method:"POST",body:JSON.stringify({documents:e})})}async function ge(e){return u(`/rag/${e}`,{method:"DELETE"})}async function H(){let e=await fetch(`${Ie}/fl/status`);return e.ok?e.json():{fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0}}var Ie,Y,J=Ve(()=>{"use strict";Ie="https://ateney-api.ateney-ai.workers.dev/api",Y="ateney_jwt"});J();var ve="ateney_auth";function I(){try{let e=localStorage.getItem(ve);return e?JSON.parse(e):null}catch{return null}}function et(e){localStorage.setItem(ve,JSON.stringify(e))}function j(){localStorage.removeItem(ve)}function Se(){return I()!==null}function tt(e){let t=e.replace(/-/g,"+").replace(/_/g,"/"),a=t.length%4;return a&&(t+="=".repeat(4-a)),atob(t)}function we(e,t,a){let n=document.createElement("script");n.src="https://accounts.google.com/gsi/client",n.async=!0,n.defer=!0,n.onload=()=>{let s=document.getElementById(e);s&&(window.google.accounts.id.initialize({client_id:"610487938019-8n4ohpj2qnm9uent2jhglaoemj0q7h3g",callback:async i=>{try{let c=i.credential.split(".");if(c.length<2){a?.("Invalid JWT");return}let r=JSON.parse(tt(c[1])),{authLogin:l,setApiToken:v}=await Promise.resolve().then(()=>(J(),pe)),m=await l(i.credential);v(m.token);let L={provider:"google",id:r.sub,name:m.user.username||m.user.name||r.name,email:m.user.email||r.email,avatar:m.user.avatar_url||r.picture,token:m.token,needs_onboarding:m.user.needs_onboarding,username:m.user.username,userId:m.user.id,fl_consent:!!m.user.fl_consent};et(L),t(L)}catch(c){console.error("[ateney] Login failed:",c),a?.(c.message||"\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F")}}}),window.google.accounts.id.renderButton(s,{theme:"outline",size:"large",text:"continue_with",locale:"ja"}))},document.head.appendChild(n)}function xe(){let e=new URLSearchParams({response_type:"code",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:He(),scope:"profile openid email"});window.location.href=`https://access.line.me/oauth2/v2.1/authorize?${e.toString()}`}function Be(){let e=new URLSearchParams({response_type:"code id_token",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:He(),scope:"name email",response_mode:"form_post"});window.location.href=`https://appleid.apple.com/auth/authorize?${e.toString()}`}function $e(){I()?.provider==="google"&&window.google?.accounts?.id?.disableAutoSelect?.(),j(),Promise.resolve().then(()=>(J(),pe)).then(({clearApiToken:t})=>t())}function He(){let e=new Uint8Array(32);return crypto.getRandomValues(e),Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}var h=null,T=null,S=null,w=null,M=null,p=null,fe,g={connected:!1,connecting:!1,backend:"...",clientId:"",rank:"-",role:"-",rounds:0,lossHistory:[],lastLoss:null,banned:!1,banRemaining:0,log:[]},Ce=null;function nt(){let e=localStorage.getItem("fedClientId");return e||(e=crypto.randomUUID(),localStorage.setItem("fedClientId",e)),e}function Pe(e){fe=nt(),g.clientId=fe,Ce=e??null,e?.(g)}function b(e){g={...g,...e},Ce?.(g)}function _(e){let t=`[${new Date().toLocaleTimeString()}] ${e}`;g.log=[...g.log.slice(-49),t],b({log:g.log})}async function at(){try{await tf.setBackend("webgpu"),await tf.ready()}catch{try{await tf.setBackend("webgl"),await tf.ready()}catch{await tf.setBackend("cpu"),await tf.ready()}}return tf.getBackend()}function Me(e,t){h&&(h.dispose(),T.dispose(),S.dispose(),w.dispose()),M=e,t?(h=tf.variable(tf.tensor(t.W1,[M,8])),T=tf.variable(tf.tensor(t.b1,[8])),S=tf.variable(tf.tensor(t.W2,[8,1])),w=tf.variable(tf.tensor(t.b2,[1]))):(h=tf.variable(tf.randomNormal([M,8],0,.05)),T=tf.variable(tf.zeros([8])),S=tf.variable(tf.randomNormal([8,1],0,.05)),w=tf.variable(tf.zeros([1])))}function Ae(e){let t=tf.relu(tf.add(tf.matMul(e,h),T));return tf.add(tf.matMul(t,S),w)}async function st(e,t,a=30,n=.05){let s=tf.tensor(e,[e.length,M]),i=tf.tensor(t,[t.length,1]),c=0,r=tf.train.adam(n);for(let l=0;l<a;l++)r.minimize(()=>{let v=Ae(s),m=tf.losses.meanSquaredError(i,v);return c=m.dataSync()[0],m},!0,[h,T,S,w]);return s.dispose(),i.dispose(),c}function rt(){return{W1:Array.from(h.dataSync()),b1:Array.from(T.dataSync()),W2:Array.from(S.dataSync()),b2:Array.from(w.dataSync())}}async function be(e){if(p&&p.readyState===WebSocket.OPEN)return;b({connecting:!0,log:[]}),_("TensorFlow.js \u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u521D\u671F\u5316\u4E2D...");let t=await at();_(`\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9: ${t}`),b({backend:t}),_(`\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u4E2D: ${e.serverUrl}`),p=new WebSocket(e.serverUrl),p.onopen=()=>{_("\u63A5\u7D9A\u6210\u529F \u2014 \u8A8D\u8A3C\u9001\u4FE1\u4E2D..."),b({connected:!0,connecting:!1}),p.send(JSON.stringify({type:"hello",id:fe,kind:"worker",token:e.authToken}))},p.onclose=a=>{a.code===4002?_("\u8A8D\u8A3C\u5931\u6557: \u30C8\u30FC\u30AF\u30F3\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093"):a.code===4003?_("\u63A5\u7D9A\u62D2\u5426: \u8A31\u53EF\u3055\u308C\u3066\u3044\u306A\u3044IP\u3067\u3059"):_(`\u5207\u65AD (code=${a.code})`),b({connected:!1,connecting:!1,rank:"-",role:"-"}),p=null},p.onerror=()=>_("\u63A5\u7D9A\u30A8\u30E9\u30FC"),p.onmessage=async a=>{let n=JSON.parse(a.data);if(n.type==="hello_ack"){_(`\u8A8D\u8A3C\u6210\u529F \u2014 \u30E9\u30F3\u30AF: ${n.rank}, \u30ED\u30FC\u30EB: ${n.role}`),b({rank:n.rank,role:n.role,banned:!1});return}if(n.type==="banned"){_(`\u30EF\u30FC\u30AB\u30FC\u8CC7\u683C\u505C\u6B62\u4E2D (\u6B8B\u308A${n.remaining_seconds}\u79D2)`),b({banned:!0,banRemaining:n.remaining_seconds,rank:"F"});return}if(n.type==="round"){_(`\u30E9\u30A6\u30F3\u30C9 ${n.round} \u53D7\u4FE1 (${n.features.length}\u4EF6, dim=${n.embed_dim})`),Me(n.embed_dim,n.global_weights);let s=await st(n.features,n.targets),i=rt();p.send(JSON.stringify({type:"update",weights:i,n:n.features.length,loss:s})),g.rounds++,g.lossHistory=[...g.lossHistory.slice(-19),s],_(`\u91CD\u307F\u9001\u4FE1\u5B8C\u4E86 \u2014 loss=${s.toFixed(4)} (\u7D2F\u8A08${g.rounds}\u30E9\u30A6\u30F3\u30C9)`),b({rounds:g.rounds,lossHistory:g.lossHistory,lastLoss:s});return}if(n.type==="infer"){_("\u63A8\u8AD6\u30EA\u30AF\u30A8\u30B9\u30C8\u53D7\u4FE1"),h||Me(n.embed_dim,n.global_weights||null);let s=tf.tensor(n.features,[n.features.length,M]),i=Ae(s),c=i.dataSync()[0];s.dispose(),i.dispose(),p.send(JSON.stringify({type:"infer_result",value:c})),_(`\u63A8\u8AD6\u7D50\u679C\u9001\u4FE1: ${c.toFixed(4)}`);return}if(n.type==="error"){_(`[\u30A8\u30E9\u30FC] ${n.message}`);return}}}function De(){p&&(p.close(),p=null),b({connected:!1,connecting:!1,rank:"-",role:"-"}),_("\u624B\u52D5\u5207\u65AD")}function W(){return g}var Ne=document.getElementById("loginScreen"),C=document.getElementById("accountIcon"),q=document.getElementById("settingsName"),Re=document.getElementById("settingsEmail"),Fe=document.getElementById("settingsAvatar"),o=document.getElementById("main-content"),d=null;function N(){d=I(),d?(Ne?.classList.add("hidden"),C&&(C.style.display="flex"),q&&(q.textContent=d.username||d.name),Re&&(Re.textContent=d.email??""),Fe&&d.avatar&&(Fe.innerHTML=`<img src="${d.avatar}" alt="${d.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`),d.needs_onboarding?it():f("home")):(Ne?.classList.remove("hidden"),C&&(C.style.display="none"))}function it(){if(!o)return;let e=1;o.innerHTML=`
    <div class="onboarding" id="onboarding">
      <div class="onboarding__card">
        <div class="onboarding__progress">
          <div class="onboarding__dot onboarding__dot--active"></div>
          <div class="onboarding__dot"></div>
          <div class="onboarding__dot"></div>
        </div>
        <h2 class="onboarding__title">ateney\u3078\u3088\u3046\u3053\u305D\uFF01</h2>
        <p class="onboarding__desc">\u307E\u305A\u306F\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u6C7A\u3081\u307E\u3057\u3087\u3046</p>
          <p class="onboarding__hint">\u82F1\u6570\u5B57\u3001_\u3001- \u306E\u307F\u4F7F\u7528\u53EF\u80FD\uFF081\u301C20\u6587\u5B57\uFF09</p>
        <div class="onboarding__form">
          <label class="onboarding__field">
            <span>\u30E6\u30FC\u30B6\u30FC\u540D\uFF081\u301C20\u6587\u5B57\uFF09</span>
            <input type="text" id="onboardUsername" maxlength="20" placeholder="\u30E6\u30FC\u30B6\u30FC\u540D" autofocus />
          </label>
          <div class="onboarding__hint">\u3042\u306A\u305F\u306E\u30E6\u30FC\u30B6\u30FCID: #${d?.userId??"?"}</div>
          <button class="btn-primary onboarding__next" id="onboardNext1">\u6B21\u3078</button>
        </div>
      </div>
    </div>`,document.getElementById("onboardNext1")?.addEventListener("click",()=>{let t=document.getElementById("onboardUsername").value.trim();if(!t){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(t.length>20){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F20\u6587\u5B57\u4EE5\u5185\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(!/^[a-zA-Z0-9_-]+$/.test(t)){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F\u82F1\u6570\u5B57\u3001_\u3001- \u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059");return}ot(t)}),document.getElementById("onboardUsername")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("onboardNext1")?.click()})}function ot(e){if(!o)return;o.innerHTML=`
    <div class="onboarding" id="onboarding">
      <div class="onboarding__card">
        <div class="onboarding__progress">
          <div class="onboarding__dot onboarding__dot--done"></div>
          <div class="onboarding__dot onboarding__dot--active"></div>
          <div class="onboarding__dot"></div>
        </div>
        <h2 class="onboarding__title">\u751F\u5E74\u6708\u65E5\u3092\u6559\u3048\u3066\u304F\u3060\u3055\u3044</h2>
        <p class="onboarding__desc">\u5E74\u9F62\u78BA\u8A8D\u306B\u4F7F\u7528\u3057\u307E\u3059\uFF08\u516C\u958B\u3055\u308C\u307E\u305B\u3093\uFF09</p>
        <div class="onboarding__form">
          <label class="onboarding__field">
            <span>\u751F\u5E74\u6708\u65E5</span>
            <div class="date-dial">
              <div class="date-dial__group">
                <button class="date-dial__btn" data-dial="year-up" aria-label="\u5E74\u3092\u5897\u3084\u3059">\u25B2</button>
                <input type="number" id="dialYear" class="date-dial__input" value="2000" min="1920" max="2015" readonly />
                <button class="date-dial__btn" data-dial="year-down" aria-label="\u5E74\u3092\u6E1B\u3089\u3059">\u25BC</button>
                <span class="date-dial__label">\u5E74</span>
              </div>
              <div class="date-dial__group">
                <button class="date-dial__btn" data-dial="month-up" aria-label="\u6708\u3092\u5897\u3084\u3059">\u25B2</button>
                <input type="number" id="dialMonth" class="date-dial__input" value="1" min="1" max="12" readonly />
                <button class="date-dial__btn" data-dial="month-down" aria-label="\u6708\u3092\u6E1B\u3089\u3059">\u25BC</button>
                <span class="date-dial__label">\u6708</span>
              </div>
              <div class="date-dial__group">
                <button class="date-dial__btn" data-dial="day-up" aria-label="\u65E5\u3092\u5897\u3084\u3059">\u25B2</button>
                <input type="number" id="dialDay" class="date-dial__input" value="1" min="1" max="31" readonly />
                <button class="date-dial__btn" data-dial="day-down" aria-label="\u65E5\u3092\u6E1B\u3089\u3059">\u25BC</button>
                <span class="date-dial__label">\u65E5</span>
              </div>
            </div>
          </label>
          <button class="btn-primary onboarding__next" id="onboardNext2">\u6B21\u3078</button>
        </div>
      </div>
    </div>`,document.querySelectorAll("[data-dial]").forEach(a=>{a.addEventListener("click",()=>{let n=a.dataset.dial,[s,i]=n.split("-"),c=document.getElementById(s==="year"?"dialYear":s==="month"?"dialMonth":"dialDay"),r=parseInt(c.value),l=parseInt(c.min),v=parseInt(c.max);i==="up"?r=r>=v?l:r+1:r=r<=l?v:r-1,c.value=String(r)})}),document.getElementById("onboardNext2")?.addEventListener("click",()=>{let a=document.getElementById("dialYear").value,n=document.getElementById("dialMonth").value.padStart(2,"0"),s=document.getElementById("dialDay").value.padStart(2,"0"),i=`${a}-${n}-${s}`;if(!i){alert("\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}let c=new Date,r=new Date(i),l=c.getFullYear()-r.getFullYear(),v=c.getMonth()-r.getMonth();if((v<0||v===0&&c.getDate()<r.getDate())&&l--,l<13){alert("ateney\u306F13\u6B73\u4EE5\u4E0A\u304C\u5BFE\u8C61\u3067\u3059");return}if(l>120){alert("\u6B63\u3057\u3044\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}lt(e,i)})}function lt(e,t){o&&(o.innerHTML=`
    <div class="onboarding" id="onboarding">
      <div class="onboarding__card">
        <div class="onboarding__progress">
          <div class="onboarding__dot onboarding__dot--done"></div>
          <div class="onboarding__dot onboarding__dot--done"></div>
          <div class="onboarding__dot onboarding__dot--active"></div>
        </div>
        <h2 class="onboarding__title">\u5206\u6563\u5B66\u7FD2\u306B\u5354\u529B\u3057\u307E\u3059\u304B\uFF1F</h2>
        <p class="onboarding__desc">
          ateney\u3067\u306F\u3001\u30D6\u30E9\u30A6\u30B6\u3092\u4F7F\u3063\u3066AI\u30E2\u30C7\u30EB\u306E\u5B66\u7FD2\u3092\u652F\u63F4\u3059\u308B\u300C\u5206\u6563\u5B66\u7FD2\u300D\u306B\u53C2\u52A0\u3067\u304D\u307E\u3059\u3002
          \u53C2\u52A0\u3059\u308B\u3068AI\u306E\u6027\u80FD\u5411\u4E0A\u306B\u8CA2\u732E\u3067\u304D\u307E\u3059\u3002\u3044\u3064\u3067\u3082\u8A2D\u5B9A\u304B\u3089\u5909\u66F4\u3067\u304D\u307E\u3059\u3002
        </p>
        <div class="onboarding__form">
          <div class="onboarding__choices">
            <label class="onboarding__choice">
              <input type="radio" name="flConsent" value="yes" id="flYes" />
              <span class="onboarding__choice-label">\u5354\u529B\u3059\u308B</span>
              <span class="onboarding__choice-desc">\u30D6\u30E9\u30A6\u30B6\u306E\u7A7A\u304D\u30EA\u30BD\u30FC\u30B9\u3067\u5B66\u7FD2\u306B\u53C2\u52A0</span>
            </label>
            <label class="onboarding__choice">
              <input type="radio" name="flConsent" value="no" id="flNo" checked />
              <span class="onboarding__choice-label">\u5354\u529B\u3057\u306A\u3044</span>
              <span class="onboarding__choice-desc">\u5F8C\u3067\u3044\u3064\u3067\u3082\u5909\u66F4\u3067\u304D\u307E\u3059</span>
            </label>
          </div>
          <button class="btn-primary onboarding__next" id="onboardFinish">\u5B8C\u4E86</button>
        </div>
      </div>
    </div>`,document.getElementById("onboardFinish")?.addEventListener("click",async()=>{let a=document.getElementById("flYes").checked,n=document.getElementById("onboardFinish");n.disabled=!0,n.textContent="\u4FDD\u5B58\u4E2D\u2026";try{let s=await X({username:e,birth_date:t,fl_consent:a});if(s.token&&O(s.token),d){d.username=e,d.needs_onboarding=!1,d.userId=s.user?.id??d.userId,d.token=s.token||d.token;let i=I();i&&(i.username=e,i.needs_onboarding=!1,i.userId=s.user?.id??i.userId,i.token=s.token||i.token,i.fl_consent=a,localStorage.setItem("ateney_auth",JSON.stringify(i)))}q&&(q.textContent=e),f("home")}catch(s){alert(`\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${s}`),n.disabled=!1,n.textContent="\u5B8C\u4E86"}}))}we("googleLoginBtn",e=>{O(e.token),d=e,N()},e=>{B(e)});async function ct(){if(!o)return;let e=await H().catch(()=>({fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0})),t=e.fl_server_url==="not-configured"||e.fl_server_url==="offline"?"":e.fl_server_url,a=e.fl_auth_token||"",n=W();t&&a&&!n.connected&&!n.connecting&&be({serverUrl:t,authToken:a});let s=n.banned?'<div class="fed__detail fed__detail--warn">\u6B8B\u308A '+n.banRemaining+"\u79D2</div>":"",i=n.lossHistory.length>0?'<div class="fed__chart"><div class="fed__card-header">Loss\u63A8\u79FB</div><div class="fed__loss-chart">'+n.lossHistory.map((F,ze)=>{let Ye=Math.max(...n.lossHistory,1);return'<div class="fed__loss-bar" style="height:'+F/Ye*100+'%" title="R'+(ze+1)+": "+F.toFixed(4)+'"></div>'}).join("")+"</div></div>":"",c=n.log.map(F=>'<div class="fed__log-line">'+F+"</div>").join(""),r=n.connected?"fed__status-dot--online":n.connecting?"fed__status-dot--connecting":"fed__status-dot--offline",l=n.connected?"\u63A5\u7D9A\u4E2D":n.connecting?"\u63A5\u7D9A\u4E2D...":"\u672A\u63A5\u7D9A",v=n.banned?"F (\u505C\u6B62\u4E2D)":n.rank,m=n.lastLoss!==null?n.lastLoss.toFixed(4):"-",L=n.connected?"":"disabled",Ge=t?"":'<div class="fed__offline-msg">FL\u30B5\u30FC\u30D0\u30FC\u304C\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3059\u3002\u30B5\u30FC\u30D0\u30FC\u304C\u8D77\u52D5\u3059\u308B\u3068\u81EA\u52D5\u63A5\u7D9A\u3057\u307E\u3059\u3002</div>';o.innerHTML=['<div class="fed">','  <h2 class="fed__title">\u26A1 Federated Learning</h2>','  <p class="fed__subtitle">\u30D6\u30E9\u30A6\u30B6\u4E0A\u3067AI\u30A2\u30C0\u30D7\u30BF\u306E\u5B66\u7FD2\u306B\u53C2\u52A0</p>','  <div class="fed__grid">','    <div class="fed__card">','      <div class="fed__card-header">\u63A5\u7D9A\u72B6\u614B</div>','      <div class="fed__status-row">','        <span class="fed__status-dot '+r+'"></span>',"        <span>"+l+"</span>","      </div>",'      <div class="fed__detail">Backend: <strong>'+n.backend+"</strong></div>",'      <div class="fed__detail">Client: <strong>'+n.clientId.slice(0,8)+"</strong></div>","    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u30E9\u30F3\u30AF</div>','      <div class="fed__rank '+(n.banned?"fed__rank--banned":"")+'">'+v+"</div>",'      <div class="fed__detail">\u30ED\u30FC\u30EB: <strong>'+n.role+"</strong></div>","      "+s,"    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u5B66\u7FD2\u30E9\u30A6\u30F3\u30C9</div>','      <div class="fed__stat-num">'+n.rounds+"</div>",'      <div class="fed__detail">\u6700\u7D42loss: <strong>'+m+"</strong></div>","    </div>","  </div>","  "+i,"  "+Ge,'  <div class="fed__controls">','    <button class="btn-secondary" id="flDisconnectBtn" '+L+">\u5207\u65AD</button>","  </div>",'  <div class="fed__log-wrap">','    <div class="fed__card-header">\u30ED\u30B0</div>','    <div class="fed__log" id="flLog">'+c+"</div>","  </div>",'  <div class="fed__info">',"    <p>\u3053\u306E\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u3044\u308B\u9593\u3001\u3042\u306A\u305F\u306E\u30D6\u30E9\u30A6\u30B6\u304CAI\u30E2\u30C7\u30EB\u306E\u5FAE\u8ABF\u6574\u306B\u53C2\u52A0\u3057\u307E\u3059\u3002</p>","    <p>\u5B66\u7FD2\u30C7\u30FC\u30BF\u306F\u30B5\u30FC\u30D0\u30FC\u304B\u3089\u914D\u4FE1\u3055\u308C\u3001\u91CD\u307F\u306E\u66F4\u65B0\u7D50\u679C\u306E\u307F\u304C\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002</p>","    <p>\u30D6\u30E9\u30A6\u30B6\u306EGPU (WebGPU/WebGL) \u3092\u4F7F\u7528\u3057\u3066\u30ED\u30FC\u30AB\u30EB\u5B66\u7FD2\u3092\u884C\u3044\u307E\u3059\u3002</p>","  </div>","</div>"].join(`
`),document.getElementById("flDisconnectBtn")?.addEventListener("click",()=>{De()});let z=document.getElementById("flLog");z&&(z.scrollTop=z.scrollHeight)}document.getElementById("lineLoginBtn")?.addEventListener("click",()=>xe());document.getElementById("appleLoginBtn")?.addEventListener("click",()=>Be());document.getElementById("logoutBtn")?.addEventListener("click",()=>{$e(),d=null,N(),ke()});var P=document.getElementById("hamburger"),A=document.getElementById("sideMenu"),Ee=document.getElementById("overlay");function dt(){A?.classList.contains("open")?R():ut()}function ut(){A?.classList.add("open"),Ee?.classList.add("show"),P?.classList.add("open"),P?.setAttribute("aria-expanded","true"),A?.setAttribute("aria-hidden","false")}function R(){document.activeElement?.blur(),A?.classList.remove("open"),Ee?.classList.remove("show"),P?.classList.remove("open"),P?.setAttribute("aria-expanded","false"),A?.setAttribute("aria-hidden","true")}P?.addEventListener("click",dt);Ee?.addEventListener("click",R);document.addEventListener("keydown",e=>{e.key==="Escape"&&(R(),ke())});var G=document.getElementById("settings"),mt=document.getElementById("settingsBack");function Je(){G?.classList.add("open"),G?.setAttribute("aria-hidden","false"),R()}function ke(){document.activeElement?.blur(),G?.classList.remove("open"),G?.setAttribute("aria-hidden","true")}C?.addEventListener("click",Je);mt?.addEventListener("click",ke);document.getElementById("menuSettings")?.addEventListener("click",e=>{e.preventDefault(),Je()});document.getElementById("menuHome")?.addEventListener("click",e=>{e.preventDefault(),f("home")});document.getElementById("menuWorks")?.addEventListener("click",e=>{e.preventDefault(),f("works")});document.getElementById("menuCharacters")?.addEventListener("click",e=>{e.preventDefault(),f("characters")});document.getElementById("menuScenes")?.addEventListener("click",e=>{e.preventDefault(),f("scenes")});document.getElementById("menuRag")?.addEventListener("click",e=>{e.preventDefault(),f("rag")});document.getElementById("menuChat")?.addEventListener("click",e=>{e.preventDefault(),f("chat")});document.getElementById("menuTopics")?.addEventListener("click",e=>{e.preventDefault(),f("topics")});document.getElementById("menuProfile")?.addEventListener("click",e=>{e.preventDefault(),f("profile")});document.getElementById("menuFed")?.addEventListener("click",e=>{e.preventDefault(),f("fed")});function f(e){switch(R(),e){case"home":_t();break;case"chat":je();break;case"works":gt();break;case"characters":x();break;case"scenes":D();break;case"rag":k();break;case"topics":bt();break;case"profile":ht();break;case"fed":ct();break}}var y=[],E=!1,he;async function je(){if(!o)return;if(y.length===0){let r=await ee(100).catch(()=>null);r?.messages&&(y=r.messages.reverse().map(l=>({role:l.role,content:l.content,adapter_value:l.adapter_value})))}let t=(await $().catch(()=>({characters:[]}))).characters.map(r=>'<option value="'+r.id+'"'+(he===r.id?" selected":"")+">"+r.name+"</option>").join(""),a=y.map(r=>{let l=r.role==="user",v=l?"chat__msg--user":"chat__msg--ai",m=l?"\u3042\u306A\u305F":"AI",L=r.adapter_value!==null&&r.adapter_value!==void 0?' <span class="chat__adapter">adapter: '+r.adapter_value+"</span>":"";return'<div class="chat__msg '+v+'"><div class="chat__msg-label">'+m+L+'</div><div class="chat__msg-text">'+We(r.content)+"</div></div>"}).join("");o.innerHTML=['<div class="chat">','  <div class="chat__header">','    <h2 class="chat__title">\u30C1\u30E3\u30C3\u30C8</h2>','    <div class="chat__char-select">','      <select id="chatCharSelect" class="chat__select">','        <option value="">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306A\u3057</option>',"        "+t,"      </select>","    </div>",'    <button class="btn-secondary chat__clear-btn" id="chatClearBtn">\u5C65\u6B74\u524A\u9664</button>',"  </div>",'  <div class="chat__messages" id="chatMessages">'+a+"</div>",'  <div class="chat__input-area">','    <textarea id="chatInput" class="chat__input" placeholder="\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B..." rows="2"></textarea>','    <button class="btn-primary chat__send-btn" id="chatSendBtn"'+(E?" disabled":"")+">"+(E?"\u9001\u4FE1\u4E2D...":"\u9001\u4FE1")+"</button>","  </div>","</div>"].join(`
`),document.getElementById("chatCharSelect")?.addEventListener("change",r=>{let l=r.target.value;he=l?Number(l):void 0}),document.getElementById("chatClearBtn")?.addEventListener("click",async()=>{confirm("\u30C1\u30E3\u30C3\u30C8\u5C65\u6B74\u3092\u5168\u3066\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await te(),y=[],je())});let n=document.getElementById("chatInput"),s=document.getElementById("chatSendBtn"),i=async()=>{if(!n||!s)return;let r=n.value.trim();if(!r||E)return;y.push({role:"user",content:r}),n.value="",E=!0,s.disabled=!0,s.textContent="\u9001\u4FE1\u4E2D...",Oe();let l=await ne(r,he);l?(y.push({role:"assistant",content:l.reply,adapter_value:l.adapter_value??null}),await U("user",r).catch(()=>{}),await U("assistant",l.reply,l.adapter_value??void 0).catch(()=>{})):y.push({role:"assistant",content:"\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u304C\u5FDC\u7B54\u3057\u3066\u3044\u307E\u305B\u3093\uFF08/api/chat/send \u672A\u5B9F\u88C5\uFF09",adapter_value:null}),E=!1,Oe(),s.disabled=!1,s.textContent="\u9001\u4FE1"};s?.addEventListener("click",i),n?.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),i())});let c=document.getElementById("chatMessages");c&&(c.scrollTop=c.scrollHeight)}function Oe(){let e=document.getElementById("chatMessages");if(!e)return;let t=y.map(n=>{let s=n.role==="user",i=s?"chat__msg--user":"chat__msg--ai",c=s?"\u3042\u306A\u305F":"AI",r=n.adapter_value!==null&&n.adapter_value!==void 0?' <span class="chat__adapter">adapter: '+n.adapter_value+"</span>":"";return'<div class="chat__msg '+i+'"><div class="chat__msg-label">'+c+r+'</div><div class="chat__msg-text">'+We(n.content)+"</div></div>"}).join("");e.innerHTML=t,e.scrollTop=e.scrollHeight;let a=document.getElementById("chatSendBtn");a&&(a.disabled=E,a.textContent=E?"\u9001\u4FE1\u4E2D...":"\u9001\u4FE1")}function We(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function _t(){if(!o)return;let e=await H().catch(()=>({fl_server_url:"offline",fl_token_required:!0})),t=await $().catch(()=>({characters:[]})),a=d?.userId??"?",n=d?.username||d?.name||"\u30E6\u30FC\u30B6\u30FC";o.innerHTML=`
    <div class="home">
      <div class="home__welcome">
        <h2 class="home__title">\u3053\u3093\u306B\u3061\u306F\u3001${n}\u3055\u3093</h2>
        <div class="home__userid">ID: #${a}</div>
      </div>
      <div class="home__stats">
        <div class="home__stat"><span class="home__stat-num">${t.characters.length}</span><span class="home__stat-label">\u516C\u958B\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</span></div>
        <div class="home__stat"><span class="home__stat-num">${e.fl_server_url==="offline"||e.fl_server_url==="not-configured"?"\u26A0":"\u2713"}</span><span class="home__stat-label">FL\u30B5\u30FC\u30D0\u30FC</span></div>
      </div>
      <div class="home__chars">
        ${t.characters.slice(0,6).map(s=>`
          <div class="char-card" data-id="${s.id}">
            ${s.avatar_url?`<img src="${s.avatar_url}" alt="${s.name}" class="char-card__avatar" />`:'<div class="char-card__avatar char-card__avatar--placeholder"></div>'}
            <p class="char-card__name">${s.name}</p>
            ${s.description?`<p class="char-card__desc">${s.description.slice(0,60)}</p>`:""}
          </div>
        `).join("")||'<p class="home__empty">\u307E\u3060\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u304C\u3042\u308A\u307E\u305B\u3093</p>'}
      </div>
    </div>`,o.querySelectorAll(".char-card").forEach(s=>{s.addEventListener("click",()=>{let i=s.dataset.id;i&&Le(Number(i))})})}async function gt(){o&&(o.innerHTML=`
    <div class="works">
      <h2 class="works__title">\u4F5C\u54C1</h2>
      <div class="works__tabs">
        <button class="works__tab works__tab--active" data-tab="characters">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</button>
        <button class="works__tab" data-tab="scenes">\u30D7\u30EC\u30FC\u30B9</button>
        <button class="works__tab" data-tab="rag">RAG</button>
      </div>
      <div id="worksContent"></div>
    </div>`,o.querySelectorAll(".works__tab").forEach(e=>{e.addEventListener("click",()=>{o.querySelectorAll(".works__tab").forEach(a=>a.classList.remove("works__tab--active")),e.classList.add("works__tab--active");let t=e.dataset.tab;t==="characters"?x():t==="scenes"?D():t==="rag"&&k()})}),x())}async function x(){let e=document.getElementById("worksContent")||o;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{characters:t}=await ae();e.innerHTML=`
      <div class="char-list">
        <button class="btn-new" id="btnNewChar">+ \u65B0\u898F\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</button>
        ${t.map(a=>`
          <div class="char-item" data-id="${a.id}">
            ${a.avatar_url?`<img src="${a.avatar_url}" class="char-item__avatar" />`:'<div class="char-item__avatar char-item__avatar--placeholder"></div>'}
            <div class="char-item__info">
              <p class="char-item__name">${a.name}</p>
              <p class="char-item__desc">${a.description?.slice(0,80)||""}</p>
              <div class="char-item__tags">${a.tags||""}</div>
            </div>
            <div class="char-item__actions">
              <button class="btn-icon" data-action="edit" data-id="${a.id}">\u270F</button>
              <button class="btn-icon btn-icon--danger" data-action="delete" data-id="${a.id}">\u{1F5D1}</button>
            </div>
          </div>
        `).join("")||'<p class="main__empty">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u300C+ \u65B0\u898F\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u300D\u304B\u3089\u4F5C\u6210\u3067\u304D\u307E\u3059</p>'}
      </div>`,document.getElementById("btnNewChar")?.addEventListener("click",()=>qe()),e.querySelectorAll("[data-action]").forEach(a=>{a.addEventListener("click",async n=>{n.stopPropagation();let s=a,i=Number(s.dataset.id);s.dataset.action==="edit"?Le(i):s.dataset.action==="delete"&&confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await oe(i),x())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function qe(e){if(!o)return;let t=!!e;o.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">${t?"\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u7DE8\u96C6":"\u65B0\u898F\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC"}</h2>
      <div class="editor__form">
        <label class="editor__field"><span>\u540D\u524D</span><input type="text" id="charName" value="${e?.name||""}" /></label>
        <label class="editor__field"><span>\u30A2\u30D0\u30BF\u30FCURL</span><input type="text" id="charAvatar" value="${e?.avatar_url||""}" /></label>
        <label class="editor__field"><span>\u8AAC\u660E</span><textarea id="charDesc" rows="3">${e?.description||""}</textarea></label>
        <label class="editor__field"><span>\u6027\u683C</span><textarea id="charPersonality" rows="4">${e?.personality||""}</textarea></label>
        <label class="editor__field"><span>\u30B7\u30B9\u30C6\u30E0\u30D7\u30ED\u30F3\u30D7\u30C8</span><textarea id="charSystemPrompt" rows="5">${e?.system_prompt||""}</textarea></label>
        <label class="editor__field"><span>\u6328\u62F6</span><textarea id="charGreeting" rows="3">${e?.greeting||""}</textarea></label>
        <label class="editor__field"><span>\u30BF\u30B0 (\u30AB\u30F3\u30DE\u533A\u5207\u308A)</span><input type="text" id="charTags" value="${e?.tags||""}" /></label>
        <label class="editor__field editor__field--row">
          <input type="checkbox" id="charPublic" ${e?.is_public?"checked":""} />
          <span>\u516C\u958B\u3059\u308B</span>
        </label>
        <div class="editor__actions">
          <button class="btn-secondary" id="charCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="charSave">\u4FDD\u5B58</button>
        </div>
      </div>
    </div>`,document.getElementById("charCancel")?.addEventListener("click",()=>x()),document.getElementById("charSave")?.addEventListener("click",async()=>{let a={name:document.getElementById("charName").value,avatar_url:document.getElementById("charAvatar").value||null,description:document.getElementById("charDesc").value||null,personality:document.getElementById("charPersonality").value||null,system_prompt:document.getElementById("charSystemPrompt").value||null,greeting:document.getElementById("charGreeting").value||null,tags:document.getElementById("charTags").value||null,is_public:document.getElementById("charPublic").checked?1:0};try{e?.id?await ie(e.id,a):await re(a),x()}catch(n){B(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${n}`)}})}async function Le(e){try{let{character:t}=await se(e);qe(t)}catch(t){B(`\u53D6\u5F97\u30A8\u30E9\u30FC: ${t}`)}}async function D(){let e=document.getElementById("worksContent")||o;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{scenes:t}=await le();e.innerHTML=`
      <div class="scene-list">
        <button class="btn-new" id="btnNewScene">+ \u65B0\u898F\u30B7\u30FC\u30F3</button>
        ${t.map(a=>`
          <div class="scene-item" data-id="${a.id}">
            <div class="scene-item__info">
              <p class="scene-item__name">${a.name}</p>
              <p class="scene-item__setting">${a.setting?.slice(0,80)||""}</p>
              ${a.mood?`<span class="scene-item__mood">${a.mood}</span>`:""}
            </div>
            <button class="btn-icon btn-icon--danger" data-action="delete-scene" data-id="${a.id}">\u{1F5D1}</button>
          </div>
        `).join("")||'<p class="main__empty">\u30B7\u30FC\u30F3\u304C\u3042\u308A\u307E\u305B\u3093</p>'}
      </div>`,document.getElementById("btnNewScene")?.addEventListener("click",()=>pt()),e.querySelectorAll('[data-action="delete-scene"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await de(n),D())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function pt(){o&&(o.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">\u65B0\u898F\u30B7\u30FC\u30F3</h2>
      <div class="editor__form">
        <label class="editor__field"><span>\u540D\u524D</span><input type="text" id="sceneName" /></label>
        <label class="editor__field"><span>\u8A2D\u5B9A (Setting)</span><textarea id="sceneSetting" rows="3"></textarea></label>
        <label class="editor__field"><span>\u30B3\u30F3\u30C6\u30AD\u30B9\u30C8</span><textarea id="sceneContext" rows="5"></textarea></label>
        <label class="editor__field"><span>\u30E0\u30FC\u30C9</span><input type="text" id="sceneMood" /></label>
        <label class="editor__field editor__field--row">
          <input type="checkbox" id="scenePublic" />
          <span>\u516C\u958B\u3059\u308B</span>
        </label>
        <div class="editor__actions">
          <button class="btn-secondary" id="sceneCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="sceneSave">\u4FDD\u5B58</button>
        </div>
      </div>
    </div>`,document.getElementById("sceneCancel")?.addEventListener("click",()=>D()),document.getElementById("sceneSave")?.addEventListener("click",async()=>{try{await ce({name:document.getElementById("sceneName").value,setting:document.getElementById("sceneSetting").value,context:document.getElementById("sceneContext").value,mood:document.getElementById("sceneMood").value,is_public:document.getElementById("scenePublic").checked?1:0}),D()}catch(e){B(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${e}`)}}))}async function k(){let e=document.getElementById("worksContent")||o;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{documents:t}=await ue();e.innerHTML=`
      <div class="rag-list">
        <button class="btn-new" id="btnNewRag">+ \u65B0\u898F\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8</button>
        <button class="btn-new btn-new--secondary" id="btnBulkRag">\u4E00\u62EC\u30A4\u30F3\u30DD\u30FC\u30C8 (JSON)</button>
        ${t.map(a=>`
          <div class="rag-item" data-id="${a.id}">
            <div class="rag-item__info">
              <p class="rag-item__title">${a.title}</p>
              <p class="rag-item__source">${a.source||""}</p>
            </div>
            <button class="btn-icon btn-icon--danger" data-action="delete-rag" data-id="${a.id}">\u{1F5D1}</button>
          </div>
        `).join("")||'<p class="main__empty">RAG\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u304C\u3042\u308A\u307E\u305B\u3093</p>'}
      </div>`,document.getElementById("btnNewRag")?.addEventListener("click",()=>vt()),document.getElementById("btnBulkRag")?.addEventListener("click",()=>ft()),e.querySelectorAll('[data-action="delete-rag"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await ge(n),k())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function vt(){o&&(o.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">\u65B0\u898FRAG\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8</h2>
      <div class="editor__form">
        <label class="editor__field"><span>\u30BF\u30A4\u30C8\u30EB</span><input type="text" id="ragTitle" /></label>
        <label class="editor__field"><span>\u30BD\u30FC\u30B9</span><input type="text" id="ragSource" /></label>
        <label class="editor__field"><span>\u5185\u5BB9</span><textarea id="ragContent" rows="10"></textarea></label>
        <div class="editor__actions">
          <button class="btn-secondary" id="ragCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="ragSave">\u4FDD\u5B58</button>
        </div>
      </div>
    </div>`,document.getElementById("ragCancel")?.addEventListener("click",()=>k()),document.getElementById("ragSave")?.addEventListener("click",async()=>{try{await me({title:document.getElementById("ragTitle").value,source:document.getElementById("ragSource").value,content:document.getElementById("ragContent").value}),k()}catch(e){B(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${e}`)}}))}function ft(){o&&(o.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">RAG\u4E00\u62EC\u30A4\u30F3\u30DD\u30FC\u30C8</h2>
      <p class="editor__hint">JSON\u914D\u5217\u3092\u8CBC\u308A\u4ED8\u3051\u3066\u304F\u3060\u3055\u3044\u3002\u6700\u5927500\u4EF6/\u56DE</p>
      <div class="editor__form">
        <label class="editor__field"><span>JSON</span><textarea id="bulkRagJson" rows="15" placeholder='[{"title":"\u4F8B","content":"\u5185\u5BB9","source":"\u51FA\u5178"}]'></textarea></label>
        <div class="editor__actions">
          <button class="btn-secondary" id="bulkRagCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="bulkRagImport">\u30A4\u30F3\u30DD\u30FC\u30C8</button>
        </div>
      </div>
    </div>`,document.getElementById("bulkRagCancel")?.addEventListener("click",()=>k()),document.getElementById("bulkRagImport")?.addEventListener("click",async()=>{try{let e=document.getElementById("bulkRagJson").value,t=JSON.parse(e),a=await _e(t);alert(`${a.imported}\u4EF6\u30A4\u30F3\u30DD\u30FC\u30C8\u5B8C\u4E86`),k()}catch(e){B(`\u30A4\u30F3\u30DD\u30FC\u30C8\u30A8\u30E9\u30FC: ${e}`)}}))}async function bt(){if(o){o.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{characters:e}=await $();o.innerHTML=`
      <div class="topics">
        <h2 class="topics__title">\u30C8\u30D4\u30C3\u30AF</h2>
        <p class="topics__desc">\u4EBA\u6C17\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</p>
        <div class="topics__grid">
          ${e.map((t,a)=>`
            <div class="topic-card" data-id="${t.id}">
              <div class="topic-card__rank">#${a+1}</div>
              ${t.avatar_url?`<img src="${t.avatar_url}" class="topic-card__avatar" />`:'<div class="topic-card__avatar topic-card__avatar--placeholder"></div>'}
              <p class="topic-card__name">${t.name}</p>
              <p class="topic-card__desc">${t.description?.slice(0,50)||""}</p>
            </div>
          `).join("")||'<p class="main__empty">\u307E\u3060\u30C8\u30D4\u30C3\u30AF\u304C\u3042\u308A\u307E\u305B\u3093</p>'}
        </div>
      </div>`,o.querySelectorAll(".topic-card").forEach(t=>{t.addEventListener("click",()=>{let a=t.dataset.id;a&&Le(Number(a))})})}catch(e){o.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${e}</p>`}}}async function ht(){if(o){o.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{user:e}=await Z();o.innerHTML=`
      <div class="profile">
        <h2 class="profile__title">\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB</h2>
        <div class="profile__card">
          ${e.avatar_url?`<img src="${e.avatar_url}" class="profile__avatar" />`:'<div class="profile__avatar profile__avatar--placeholder"></div>'}
          <div class="profile__info">
            <p class="profile__name">${e.username||e.name}</p>
            <p class="profile__email">${e.email}</p>
            <p class="profile__userid">ID: #${e.id}</p>
            ${e.birth_date?`<p class="profile__since">\u751F\u5E74\u6708\u65E5: ${e.birth_date}</p>`:""}
            ${e.fl_consent?'<p class="profile__fl">\u5206\u6563\u5B66\u7FD2: \u5354\u529B\u4E2D</p>':'<p class="profile__fl">\u5206\u6563\u5B66\u7FD2: \u672A\u5354\u529B</p>'}
            <p class="profile__since">\u767B\u9332\u65E5: ${e.created_at?.slice(0,10)||""}</p>
          </div>
          <div class="profile__actions">
            <button class="btn-secondary" id="signoutBtn">\u30ED\u30B0\u30A2\u30A6\u30C8</button>
          </div>
          <div class="profile__danger">
            <button class="btn-danger" id="deleteAccountBtn">\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664</button>
          </div>
        </div>
      </div>`}catch(e){o.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${e}</p>`}}}document.getElementById("signoutBtn")?.addEventListener("click",()=>{j(),d=null,N()});document.getElementById("deleteAccountBtn")?.addEventListener("click",async()=>{if(confirm(`\u672C\u5F53\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F

\u30FB\u30C1\u30E3\u30C3\u30C8\u5C65\u6B74
\u30FB\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC
\u30FB\u30B7\u30FC\u30F3
\u30FBRAG\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8
\u30FB\u30E6\u30FC\u30B6\u30FC\u30A2\u30AB\u30A6\u30F3\u30C8

\u3053\u308C\u3089\u306F\u5168\u3066\u5B8C\u5168\u306B\u524A\u9664\u3055\u308C\u3001\u5FA9\u5143\u3067\u304D\u307E\u305B\u3093\u3002`)&&confirm("\u6700\u7D42\u78BA\u8A8D\uFF1A\u672C\u5F53\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F"))try{await Q(),j(),K(),d=null,alert("\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002"),N()}catch(e){alert("\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F: "+e)}});function B(e){if(o){let t=document.createElement("div");t.className="error-banner",t.textContent=e,o.prepend(t),setTimeout(()=>t.remove(),5e3)}}N();Pe();var ye=!1;async function Ue(){if(ye)return;let e=W();if(e.connected||e.connecting)return;let t=await H().catch(()=>null);!t||!t.fl_server_url||t.fl_server_url==="not-configured"||t.fl_server_url==="offline"||t.fl_auth_token&&(ye=!0,be({serverUrl:t.fl_server_url,authToken:t.fl_auth_token}))}Se()&&(f("home"),I()?.fl_consent&&(Ue(),setInterval(()=>{let t=W();!t.connected&&!t.connecting&&(ye=!1,Ue())},15e3)));})();

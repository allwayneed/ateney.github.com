"use strict";(()=>{var Ze=Object.defineProperty;var Qe=(e,t)=>()=>(e&&(t=e(e=0)),t);var Xe=(e,t)=>{for(var a in t)Ze(e,a,{get:t[a],enumerable:!0})};var ye={};Xe(ye,{authLogin:()=>et,bulkImportRag:()=>st,clearApiToken:()=>ae,clearChat:()=>nt,createCharacter:()=>ce,createPack:()=>be,createRagDoc:()=>_e,createScene:()=>me,deleteAccount:()=>re,deleteCharacter:()=>ue,deletePack:()=>he,deleteRagDoc:()=>ve,deleteScene:()=>ge,getApiToken:()=>Me,getCharacter:()=>le,getCharacters:()=>J,getChatHistory:()=>ie,getFlStatus:()=>k,getPacks:()=>fe,getPublicCharacters:()=>j,getRagDocs:()=>pe,getScenes:()=>q,getUser:()=>tt,saveChat:()=>G,sendChatMessage:()=>oe,setApiToken:()=>O,updateCharacter:()=>de,updatePack:()=>rt,updateProfile:()=>U,updateScene:()=>at});function Me(){return localStorage.getItem(ne)}function O(e){localStorage.setItem(ne,e)}function ae(){localStorage.removeItem(ne)}async function d(e,t={}){let a=Me(),n={"Content-Type":"application/json",...t.headers||{}};a&&(n.Authorization=`Bearer ${a}`);let s=await fetch(`${$e}${e}`,{...t,headers:n});if(!s.ok)throw console.warn(`[ateney] API ${s.status}: ${e}`),new Error(`API ${s.status}`);return s.json()}async function se(e,t={}){try{return await d(e,t)}catch{return null}}async function et(e){return d("/auth/login",{method:"POST",body:JSON.stringify({id_token:e})})}async function tt(){return d("/user")}async function re(){return d("/user",{method:"DELETE"})}async function U(e){return d("/user/profile",{method:"PUT",body:JSON.stringify(e)})}async function ie(e=50,t=0){return se(`/chat/history?limit=${e}&offset=${t}`)}async function G(e,t,a){return se("/chat/save",{method:"POST",body:JSON.stringify({role:e,content:t,adapter_value:a})})}async function nt(){return se("/chat/clear",{method:"DELETE"})}async function oe(e,t,a){try{return await d("/chat/send",{method:"POST",body:JSON.stringify({message:e,character_id:t,scene_id:a})})}catch{return null}}async function J(){return d("/characters")}async function j(){return d("/characters/public")}async function le(e){return d(`/characters/${e}`)}async function ce(e){return d("/characters",{method:"POST",body:JSON.stringify(e)})}async function de(e,t){return d(`/characters/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function ue(e){return d(`/characters/${e}`,{method:"DELETE"})}async function q(e){let t=e?`?character_id=${e}`:"";return d(`/scenes${t}`)}async function me(e){return d("/scenes",{method:"POST",body:JSON.stringify(e)})}async function at(e,t){return d(`/scenes/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function ge(e){return d(`/scenes/${e}`,{method:"DELETE"})}async function pe(e){let t=e?`?character_id=${e}`:"";return d(`/rag${t}`)}async function _e(e){return d("/rag",{method:"POST",body:JSON.stringify(e)})}async function st(e){return d("/rag/bulk",{method:"POST",body:JSON.stringify({documents:e})})}async function ve(e){return d(`/rag/${e}`,{method:"DELETE"})}async function fe(){return d("/packs")}async function be(e){return d("/packs",{method:"POST",body:JSON.stringify(e)})}async function rt(e,t){return d(`/packs/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function he(e){return d(`/packs/${e}`,{method:"DELETE"})}async function k(){let e=await fetch(`${$e}/fl/status`);return e.ok?e.json():{fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0}}var $e,ne,W=Qe(()=>{"use strict";$e="https://ateney-api.ateney-ai.workers.dev/api",ne="ateney_jwt"});W();var Ee="ateney_auth";function y(){try{let e=localStorage.getItem(Ee);return e?JSON.parse(e):null}catch{return null}}function it(e){localStorage.setItem(Ee,JSON.stringify(e))}function ke(){localStorage.removeItem(Ee)}function He(){return y()!==null}function ot(e){let t=e.replace(/-/g,"+").replace(/_/g,"/"),a=t.length%4;return a&&(t+="=".repeat(4-a)),atob(t)}function Ce(e,t,a){let n=document.createElement("script");n.src="https://accounts.google.com/gsi/client",n.async=!0,n.defer=!0,n.onload=()=>{let s=document.getElementById(e);s&&(window.google.accounts.id.initialize({client_id:"610487938019-8n4ohpj2qnm9uent2jhglaoemj0q7h3g",callback:async i=>{try{let r=i.credential.split(".");if(r.length<2){a?.("Invalid JWT");return}let o=JSON.parse(ot(r[1])),{authLogin:m,setApiToken:l}=await Promise.resolve().then(()=>(W(),ye)),g=await m(i.credential);l(g.token);let b={provider:"google",id:o.sub,name:g.user.username||g.user.name||o.name,email:g.user.email||o.email,avatar:g.user.avatar_url||o.picture,token:g.token,needs_onboarding:g.user.needs_onboarding,username:g.user.username,userId:g.user.id,fl_consent:!!g.user.fl_consent};it(b),t(b)}catch(r){console.error("[ateney] Login failed:",r),a?.(r.message||"\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F")}}}),window.google.accounts.id.renderButton(s,{theme:"outline",size:"large",text:"continue_with",locale:"ja"}))},document.head.appendChild(n)}function Ae(){let e=Re();sessionStorage.setItem("ateney_oauth_state",e),sessionStorage.setItem("ateney_oauth_provider","line");let t=new URLSearchParams({response_type:"code",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:e,scope:"profile openid email"});window.location.href=`https://access.line.me/oauth2/v2.1/authorize?${t.toString()}`}function De(){let e=Re();sessionStorage.setItem("ateney_oauth_state",e),sessionStorage.setItem("ateney_oauth_provider","apple");let t=new URLSearchParams({response_type:"code id_token",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:e,scope:"name email",response_mode:"form_post"});window.location.href=`https://appleid.apple.com/auth/authorize?${t.toString()}`}function Ne(){y()?.provider==="google"&&window.google?.accounts?.id?.disableAutoSelect?.(),ke(),Promise.resolve().then(()=>(W(),ye)).then(({clearApiToken:t})=>t())}function Re(){let e=new Uint8Array(32);return crypto.getRandomValues(e),Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}var E=null,L=null,T=null,S=null,$=null,v=null,Ie,_={connected:!1,connecting:!1,backend:"...",clientId:"",rank:"-",role:"-",rounds:0,lossHistory:[],lastLoss:null,banned:!1,banRemaining:0,log:[]},Oe=null;function lt(){let e=localStorage.getItem("fedClientId");return e||(e=crypto.randomUUID(),localStorage.setItem("fedClientId",e)),e}function Ue(e){Ie=lt(),_.clientId=Ie,Oe=e??null,e?.(_)}function h(e){_={..._,...e},Oe?.(_)}function p(e){let t=`[${new Date().toLocaleTimeString()}] ${e}`;_.log=[..._.log.slice(-49),t],h({log:_.log})}async function ct(){try{await tf.setBackend("webgpu"),await tf.ready()}catch{try{await tf.setBackend("webgl"),await tf.ready()}catch{await tf.setBackend("cpu"),await tf.ready()}}return tf.getBackend()}function Fe(e,t){E&&(E.dispose(),L.dispose(),T.dispose(),S.dispose()),$=e,t?(E=tf.variable(tf.tensor(t.W1,[$,8])),L=tf.variable(tf.tensor(t.b1,[8])),T=tf.variable(tf.tensor(t.W2,[8,1])),S=tf.variable(tf.tensor(t.b2,[1]))):(E=tf.variable(tf.randomNormal([$,8],0,.05)),L=tf.variable(tf.zeros([8])),T=tf.variable(tf.randomNormal([8,1],0,.05)),S=tf.variable(tf.zeros([1])))}function Ge(e){let t=tf.relu(tf.add(tf.matMul(e,E),L));return tf.add(tf.matMul(t,T),S)}async function dt(e,t,a=30,n=.05){let s=tf.tensor(e,[e.length,$]),i=tf.tensor(t,[t.length,1]),r=0,o=tf.train.adam(n);for(let m=0;m<a;m++)o.minimize(()=>{let l=Ge(s),g=tf.losses.meanSquaredError(i,l);return r=g.dataSync()[0],g},!0,[E,L,T,S]);return s.dispose(),i.dispose(),r}function ut(){return{W1:Array.from(E.dataSync()),b1:Array.from(L.dataSync()),W2:Array.from(T.dataSync()),b2:Array.from(S.dataSync())}}async function z(e){if(v&&v.readyState===WebSocket.OPEN)return;h({connecting:!0,log:[]}),p("TensorFlow.js \u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u521D\u671F\u5316\u4E2D...");let t=await ct();p(`\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9: ${t}`),h({backend:t}),p(`\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u4E2D: ${e.serverUrl}`),v=new WebSocket(e.serverUrl),v.onopen=()=>{p("\u63A5\u7D9A\u6210\u529F \u2014 \u8A8D\u8A3C\u9001\u4FE1\u4E2D..."),h({connected:!0,connecting:!1}),v.send(JSON.stringify({type:"hello",id:Ie,kind:"worker",token:e.authToken}))},v.onclose=a=>{a.code===4002?p("\u8A8D\u8A3C\u5931\u6557: \u30C8\u30FC\u30AF\u30F3\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093"):a.code===4003?p("\u63A5\u7D9A\u62D2\u5426: \u8A31\u53EF\u3055\u308C\u3066\u3044\u306A\u3044IP\u3067\u3059"):p(`\u5207\u65AD (code=${a.code})`),h({connected:!1,connecting:!1,rank:"-",role:"-"}),v=null},v.onerror=()=>p("\u63A5\u7D9A\u30A8\u30E9\u30FC"),v.onmessage=async a=>{let n=JSON.parse(a.data);if(n.type==="hello_ack"){p(`\u8A8D\u8A3C\u6210\u529F \u2014 \u30E9\u30F3\u30AF: ${n.rank}, \u30ED\u30FC\u30EB: ${n.role}`),h({rank:n.rank,role:n.role,banned:!1});return}if(n.type==="banned"){p(`\u30EF\u30FC\u30AB\u30FC\u8CC7\u683C\u505C\u6B62\u4E2D (\u6B8B\u308A${n.remaining_seconds}\u79D2)`),h({banned:!0,banRemaining:n.remaining_seconds,rank:"F"});return}if(n.type==="round"){p(`\u30E9\u30A6\u30F3\u30C9 ${n.round} \u53D7\u4FE1 (${n.features.length}\u4EF6, dim=${n.embed_dim})`),Fe(n.embed_dim,n.global_weights);let s=await dt(n.features,n.targets),i=ut();v.send(JSON.stringify({type:"update",weights:i,n:n.features.length,loss:s})),_.rounds++,_.lossHistory=[..._.lossHistory.slice(-19),s],p(`\u91CD\u307F\u9001\u4FE1\u5B8C\u4E86 \u2014 loss=${s.toFixed(4)} (\u7D2F\u8A08${_.rounds}\u30E9\u30A6\u30F3\u30C9)`),h({rounds:_.rounds,lossHistory:_.lossHistory,lastLoss:s});return}if(n.type==="infer"){p("\u63A8\u8AD6\u30EA\u30AF\u30A8\u30B9\u30C8\u53D7\u4FE1"),E||Fe(n.embed_dim,n.global_weights||null);let s=tf.tensor(n.features,[n.features.length,$]),i=Ge(s),r=i.dataSync()[0];s.dispose(),i.dispose(),v.send(JSON.stringify({type:"infer_result",value:r})),p(`\u63A8\u8AD6\u7D50\u679C\u9001\u4FE1: ${r.toFixed(4)}`);return}if(n.type==="error"){p(`[\u30A8\u30E9\u30FC] ${n.message}`);return}}}function Le(){v&&(v.close(),v=null),h({connected:!1,connecting:!1,rank:"-",role:"-"}),p("\u624B\u52D5\u5207\u65AD")}function M(){return _}var Je=document.getElementById("loginScreen"),H=document.getElementById("accountIcon"),V=document.getElementById("settingsName"),je=document.getElementById("settingsEmail"),qe=document.getElementById("settingsAvatar"),c=document.getElementById("main-content"),u=null;function Q(){u=y(),u?(Je?.classList.add("hidden"),H&&(H.style.display="flex"),V&&(V.textContent=u.username||u.name),je&&(je.textContent=u.email??""),qe&&u.avatar&&(qe.innerHTML=`<img src="${u.avatar}" alt="${u.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`),u.needs_onboarding?mt():f("home")):(Je?.classList.remove("hidden"),H&&(H.style.display="none"))}function mt(){c&&(c.innerHTML=`
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
          <div class="onboarding__hint">\u3042\u306A\u305F\u306E\u30E6\u30FC\u30B6\u30FCID: #${u?.userId??"?"}</div>
          <button class="btn-primary onboarding__next" id="onboardNext1">\u6B21\u3078</button>
        </div>
      </div>
    </div>`,document.getElementById("onboardNext1")?.addEventListener("click",()=>{let e=document.getElementById("onboardUsername").value.trim();if(!e){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(e.length>20){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F20\u6587\u5B57\u4EE5\u5185\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(!/^[a-zA-Z0-9_-]+$/.test(e)){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F\u82F1\u6570\u5B57\u3001_\u3001- \u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059");return}gt(e)}),document.getElementById("onboardUsername")?.addEventListener("keydown",e=>{e.key==="Enter"&&document.getElementById("onboardNext1")?.click()}))}function gt(e){if(!c)return;c.innerHTML=`
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
    </div>`,document.querySelectorAll("[data-dial]").forEach(a=>{a.addEventListener("click",()=>{let n=a.dataset.dial,[s,i]=n.split("-"),r=document.getElementById(s==="year"?"dialYear":s==="month"?"dialMonth":"dialDay"),o=parseInt(r.value),m=parseInt(r.min),l=parseInt(r.max);i==="up"?o=o>=l?m:o+1:o=o<=m?l:o-1,r.value=String(o)})}),document.getElementById("onboardNext2")?.addEventListener("click",()=>{let a=document.getElementById("dialYear").value,n=document.getElementById("dialMonth").value.padStart(2,"0"),s=document.getElementById("dialDay").value.padStart(2,"0"),i=`${a}-${n}-${s}`;if(!i){alert("\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}let r=new Date,o=new Date(i),m=r.getFullYear()-o.getFullYear(),l=r.getMonth()-o.getMonth();if((l<0||l===0&&r.getDate()<o.getDate())&&m--,m<13){alert("ateney\u306F13\u6B73\u4EE5\u4E0A\u304C\u5BFE\u8C61\u3067\u3059");return}if(m>120){alert("\u6B63\u3057\u3044\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}pt(e,i)})}function pt(e,t){c&&(c.innerHTML=`
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
    </div>`,document.getElementById("onboardFinish")?.addEventListener("click",async()=>{let a=document.getElementById("flYes").checked,n=document.getElementById("onboardFinish");n.disabled=!0,n.textContent="\u4FDD\u5B58\u4E2D\u2026";try{let s=await U({username:e,birth_date:t,fl_consent:a});if(s.token&&O(s.token),u){u.username=e,u.needs_onboarding=!1,u.userId=s.user?.id??u.userId,u.token=s.token||u.token;let i=y();i&&(i.username=e,i.needs_onboarding=!1,i.userId=s.user?.id??i.userId,i.token=s.token||i.token,i.fl_consent=a,localStorage.setItem("ateney_auth",JSON.stringify(i)))}V&&(V.textContent=e),f("home")}catch(s){alert(`\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${s}`),n.disabled=!1,n.textContent="\u5B8C\u4E86"}}))}Ce("googleLoginBtn",e=>{O(e.token),u=e,Q()},e=>{P(e)});async function _t(){if(!c)return;let e=await k().catch(()=>({fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0})),t=e.fl_server_url==="not-configured"||e.fl_server_url==="offline"?"":e.fl_server_url,a=e.fl_auth_token||"",n=M();t&&a&&!n.connected&&!n.connecting&&z({serverUrl:t,authToken:a});let s=n.banned?'<div class="fed__detail fed__detail--warn">\u6B8B\u308A '+n.banRemaining+"\u79D2</div>":"",i=n.lossHistory.length>0?'<div class="fed__chart"><div class="fed__card-header">Loss\u63A8\u79FB</div><div class="fed__loss-chart">'+n.lossHistory.map((F,Ke)=>{let Ve=Math.max(...n.lossHistory,1);return'<div class="fed__loss-bar" style="height:'+F/Ve*100+'%" title="R'+(Ke+1)+": "+F.toFixed(4)+'"></div>'}).join("")+"</div></div>":"",r=n.log.map(F=>'<div class="fed__log-line">'+F+"</div>").join(""),o=n.connected?"fed__status-dot--online":n.connecting?"fed__status-dot--connecting":"fed__status-dot--offline",m=n.connected?"\u63A5\u7D9A\u4E2D":n.connecting?"\u63A5\u7D9A\u4E2D...":"\u672A\u63A5\u7D9A",l=n.banned?"F (\u505C\u6B62\u4E2D)":n.rank,g=n.lastLoss!==null?n.lastLoss.toFixed(4):"-",b=n.connected?"":"disabled",ee=t?"":'<div class="fed__offline-msg">FL\u30B5\u30FC\u30D0\u30FC\u304C\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3059\u3002\u30B5\u30FC\u30D0\u30FC\u304C\u8D77\u52D5\u3059\u308B\u3068\u81EA\u52D5\u63A5\u7D9A\u3057\u307E\u3059\u3002</div>';c.innerHTML=['<div class="fed">','  <h2 class="fed__title">\u26A1 Federated Learning</h2>','  <p class="fed__subtitle">\u30D6\u30E9\u30A6\u30B6\u4E0A\u3067AI\u30A2\u30C0\u30D7\u30BF\u306E\u5B66\u7FD2\u306B\u53C2\u52A0</p>','  <div class="fed__grid">','    <div class="fed__card">','      <div class="fed__card-header">\u63A5\u7D9A\u72B6\u614B</div>','      <div class="fed__status-row">','        <span class="fed__status-dot '+o+'"></span>',"        <span>"+m+"</span>","      </div>",'      <div class="fed__detail">Backend: <strong>'+n.backend+"</strong></div>",'      <div class="fed__detail">Client: <strong>'+n.clientId.slice(0,8)+"</strong></div>","    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u30E9\u30F3\u30AF</div>','      <div class="fed__rank '+(n.banned?"fed__rank--banned":"")+'">'+l+"</div>",'      <div class="fed__detail">\u30ED\u30FC\u30EB: <strong>'+n.role+"</strong></div>","      "+s,"    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u5B66\u7FD2\u30E9\u30A6\u30F3\u30C9</div>','      <div class="fed__stat-num">'+n.rounds+"</div>",'      <div class="fed__detail">\u6700\u7D42loss: <strong>'+g+"</strong></div>","    </div>","  </div>","  "+i,"  "+ee,'  <div class="fed__controls">','    <button class="btn-secondary" id="flDisconnectBtn" '+b+">\u5207\u65AD</button>","  </div>",'  <div class="fed__log-wrap">','    <div class="fed__card-header">\u30ED\u30B0</div>','    <div class="fed__log" id="flLog">'+r+"</div>","  </div>",'  <div class="fed__info">',"    <p>\u3053\u306E\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u3044\u308B\u9593\u3001\u3042\u306A\u305F\u306E\u30D6\u30E9\u30A6\u30B6\u304CAI\u30E2\u30C7\u30EB\u306E\u5FAE\u8ABF\u6574\u306B\u53C2\u52A0\u3057\u307E\u3059\u3002</p>","    <p>\u5B66\u7FD2\u30C7\u30FC\u30BF\u306F\u30B5\u30FC\u30D0\u30FC\u304B\u3089\u914D\u4FE1\u3055\u308C\u3001\u91CD\u307F\u306E\u66F4\u65B0\u7D50\u679C\u306E\u307F\u304C\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002</p>","    <p>\u30D6\u30E9\u30A6\u30B6\u306EGPU (WebGPU/WebGL) \u3092\u4F7F\u7528\u3057\u3066\u30ED\u30FC\u30AB\u30EB\u5B66\u7FD2\u3092\u884C\u3044\u307E\u3059\u3002</p>","  </div>","</div>"].join(`
`),document.getElementById("flDisconnectBtn")?.addEventListener("click",()=>{Le()});let te=document.getElementById("flLog");te&&(te.scrollTop=te.scrollHeight)}document.getElementById("lineLoginBtn")?.addEventListener("click",()=>Ae());document.getElementById("appleLoginBtn")?.addEventListener("click",()=>De());document.getElementById("logoutBtn")?.addEventListener("click",()=>{Ne(),u=null,Q(),X()});var C=document.getElementById("hamburger"),A=document.getElementById("sideMenu"),xe=document.getElementById("overlay");function vt(){A?.classList.contains("open")?R():ft()}function ft(){A?.classList.add("open"),xe?.classList.add("show"),C?.classList.add("open"),C?.setAttribute("aria-expanded","true"),A?.setAttribute("aria-hidden","false")}function R(){document.activeElement?.blur(),A?.classList.remove("open"),xe?.classList.remove("show"),C?.classList.remove("open"),C?.setAttribute("aria-expanded","false"),A?.setAttribute("aria-hidden","true")}C?.addEventListener("click",vt);xe?.addEventListener("click",R);document.addEventListener("keydown",e=>{e.key==="Escape"&&(R(),X())});var w=document.getElementById("settings"),bt=document.getElementById("settingsBack");function we(){w?.classList.add("open"),w?.setAttribute("aria-hidden","false"),R()}function X(){document.activeElement?.blur(),w?.classList.remove("open"),w?.setAttribute("aria-hidden","true")}H?.addEventListener("click",we);bt?.addEventListener("click",X);document.getElementById("menuSettings")?.addEventListener("click",e=>{e.preventDefault(),we()});we=function(){w?.classList.add("open"),w?.setAttribute("aria-hidden","false");let e=document.getElementById("toggleFlConsent");if(e){let a=y();e.checked=!!a?.fl_consent,e.onchange=async()=>{try{await U({fl_consent:e.checked});let n=y();if(n&&(n.fl_consent=e.checked,localStorage.setItem("ateney_auth",JSON.stringify(n))),e.checked){let s=await k().catch(()=>null);s?.fl_server_url&&s.fl_server_url!=="not-configured"&&s.fl_server_url!=="offline"&&s.fl_auth_token&&z({serverUrl:s.fl_server_url,authToken:s.fl_auth_token})}else Le()}catch(n){alert("\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F: "+n)}}}let t=document.getElementById("serverPromptDisplay");t&&k().then(a=>{a?.fl_server_url&&a.fl_server_url!=="not-configured"&&a.fl_server_url!=="offline"?t.textContent="\u30B5\u30FC\u30D0\u30FC\u63A5\u7D9A\u4E2D\uFF08\u30B7\u30B9\u30C6\u30E0\u65E2\u5B9A\u30D7\u30ED\u30F3\u30D7\u30C8\u4F7F\u7528\u4E2D\uFF09":t.textContent="\u30B5\u30FC\u30D0\u30FC\u672A\u63A5\u7D9A"}).catch(()=>{t.textContent="\u30B5\u30FC\u30D0\u30FC\u672A\u63A5\u7D9A"})};document.getElementById("deleteAccountBtn2")?.addEventListener("click",async()=>{if(confirm(`\u672C\u5F53\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F

\u30FB\u30C1\u30E3\u30C3\u30C8\u5C65\u6B74
\u30FB\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC
\u30FB\u30B7\u30FC\u30F3
\u30FBRAG\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8
\u30FB\u30E6\u30FC\u30B6\u30FC\u30A2\u30AB\u30A6\u30F3\u30C8

\u3053\u308C\u3089\u306F\u5168\u3066\u5B8C\u5168\u306B\u524A\u9664\u3055\u308C\u3001\u5FA9\u5143\u3067\u304D\u307E\u305B\u3093\u3002`)&&confirm("\u6700\u7D42\u78BA\u8A8D\uFF1A\u672C\u5F53\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F"))try{await re(),ke(),ae(),u=null,alert("\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002"),Q(),X()}catch(e){alert("\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F: "+e)}});document.getElementById("menuHome")?.addEventListener("click",e=>{e.preventDefault(),f("home")});document.getElementById("menuWorks")?.addEventListener("click",e=>{e.preventDefault(),f("works")});document.getElementById("menuCharacters")?.addEventListener("click",e=>{e.preventDefault(),f("characters")});document.getElementById("menuScenes")?.addEventListener("click",e=>{e.preventDefault(),f("scenes")});document.getElementById("menuRag")?.addEventListener("click",e=>{e.preventDefault(),f("rag")});document.getElementById("menuPacks")?.addEventListener("click",e=>{e.preventDefault(),f("packs")});document.getElementById("menuChat")?.addEventListener("click",e=>{e.preventDefault(),f("chat")});document.getElementById("menuTopics")?.addEventListener("click",e=>{e.preventDefault(),f("topics")});document.getElementById("menuProfile")?.addEventListener("click",e=>{e.preventDefault(),f("profile")});document.getElementById("menuFed")?.addEventListener("click",e=>{e.preventDefault(),f("fed")});function f(e){switch(R(),e){case"home":kt();break;case"chat":yt();break;case"works":It();break;case"characters":B();break;case"scenes":D();break;case"rag":N();break;case"packs":Z();break;case"topics":renderTopics();break;case"profile":renderProfile();break;case"fed":_t();break}}var I=[],x=!1,ht,Te={};async function yt(){if(!c)return;if(I.length===0){let r=await ie(100).catch(()=>null);r?.messages&&(I=r.messages.reverse().map(o=>({role:o.role,content:o.content,adapter_value:o.adapter_value})))}let e=await j().catch(()=>({characters:[]}));Te={},e.characters.forEach(r=>{Te[r.id]={name:r.name,avatar:r.avatar_url}}),c.innerHTML=['<div class="chat-page">','  <div class="chat-topbar">','    <div class="chat-topbar__left">','      <span class="chat-topbar__label">\u30C1\u30E3\u30C3\u30C8</span>','      <span class="chat-topbar__badge" id="chatPieceCount">0 \u30D4\u30FC\u30B9</span>',"    </div>",'    <div class="chat-topbar__icons">','      <button class="chat-icon-btn" id="chatReloadBtn" title="\u4F1A\u8A71\u3092\u30EA\u30BB\u30C3\u30C8">\u21BA</button>',"    </div>","  </div>",'  <div class="chat-area" id="chatArea"></div>','  <div class="chat-input-bar">','    <input id="chatInput" class="chat-input-field" placeholder="\u30E1\u30C3\u30BB\u30FC\u30B8" autocomplete="off" />','    <button class="chat-star-btn" id="chatStarBtn" title="\uFF0A \u3092\u5165\u529B">\uFF0A</button>','    <button class="chat-send-btn" id="chatSendBtn" title="\u9001\u4FE1"'+(x?" disabled":"")+">\u25B6</button>","  </div>","</div>"].join(`
`),Y(),document.getElementById("chatReloadBtn")?.addEventListener("click",()=>{confirm("\u4F1A\u8A71\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3059\u304B\uFF1F")&&(I=[],Y())}),document.getElementById("chatStarBtn")?.addEventListener("click",()=>{let r=document.getElementById("chatInput");if(!r)return;let o=r.selectionStart??r.value.length,m=r.selectionEnd??r.value.length;r.value=r.value.slice(0,o)+"\uFF0A"+r.value.slice(m),r.focus(),r.selectionStart=r.selectionEnd=o+1});let t=document.getElementById("chatInput"),a=document.getElementById("chatSendBtn"),n=async()=>{if(!t||!a)return;let r=t.value.trim();if(!r||x)return;I.push({role:"user",content:r}),t.value="",x=!0,a.disabled=!0,Y();let o=await oe(r,ht);o?(I.push({role:"assistant",content:o.reply,adapter_value:o.adapter_value??null}),await G("user",r).catch(()=>{}),await G("assistant",o.reply,o.adapter_value??void 0).catch(()=>{})):I.push({role:"assistant",content:"\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u304C\u5FDC\u7B54\u3057\u3066\u3044\u307E\u305B\u3093\uFF08/api/chat/send \u672A\u5B9F\u88C5\uFF09",adapter_value:null}),x=!1,Y(),a.disabled=!1};a?.addEventListener("click",n),t?.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),n())});let s=M(),i=document.getElementById("chatPieceCount");i&&(i.textContent=s.connected?"\u63A5\u7D9A\u4E2D":"\u672A\u63A5\u7D9A")}function Y(){let e=document.getElementById("chatArea");if(!e)return;let t="";for(let n of I)n.role==="user"?t+='<div class="chat-bubble chat-bubble--user">'+K(n.content)+"</div>":t+=Et(n.content,n.adapter_value);x&&(t+='<div class="chat-bubble chat-bubble--loading">\u751F\u6210\u4E2D\u2026</div>'),e.innerHTML=t,e.scrollTop=e.scrollHeight;let a=document.getElementById("chatSendBtn");a&&(a.disabled=x)}function Et(e,t){let a=e.split(`
`),n="",s=null,i="",r=()=>{if(!i.trim()){i="";return}if(s?.type==="narrator")n+='<div class="chat-narrator"><div class="chat-narrator__icon">\u2261</div><div class="chat-narrator__text">'+K(i.trim())+"</div></div>";else if(s?.type==="character"){let o=s.avatar?'<img src="'+s.avatar+'" class="chat-char__avatar" />':'<div class="chat-char__avatar chat-char__avatar--placeholder">'+(s.name||"?")[0]+"</div>";n+='<div class="chat-char"><div class="chat-char__avatar-wrap">'+o+'</div><div class="chat-char__bubble">'+K(i.trim())+"</div></div>"}else n+='<div class="chat-bubble chat-bubble--ai">'+K(i.trim())+"</div>";i=""};for(let o of a){let m=o.match(/^@(?:ナレーター|narrator|):\s*(.*)/i),l=o.match(/^@([^\s:]+):\s*(.*)/);if(m)r(),s={type:"narrator"},i=m[1];else if(l&&!m){let g=l[1],b=Object.values(Te).find(ee=>ee.name===g);b?(r(),s={type:"character",name:g,avatar:b.avatar},i=l[2]):(r(),s={type:"character",name:g},i=l[2])}else i?i+=`
`+o:i=o}return r(),n}function K(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function kt(){if(!c)return;let e=await k().catch(()=>({fl_server_url:"offline",fl_token_required:!0})),t=await j().catch(()=>({characters:[]})),a=u?.userId??"?",n=u?.username||u?.name||"\u30E6\u30FC\u30B6\u30FC";c.innerHTML=`
    <div class="home">
      <div class="home__welcome">
        <h2 class="home__title">\u3053\u3093\u306B\u3061\u306F\u3001${n}\u3055\u3093</h2>
        <div class="home__userid">ID: #${a}</div>
      </div>
      <div class="home__stats">
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
    </div>`,c.querySelectorAll(".char-card").forEach(s=>{s.addEventListener("click",()=>{let i=s.dataset.id;i&&Ye(Number(i))})})}async function It(){c&&(c.innerHTML=`
    <div class="works">
      <h2 class="works__title">\u4F5C\u54C1</h2>
      <div class="works__tabs">
        <button class="works__tab works__tab--active" data-tab="characters">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</button>
        <button class="works__tab" data-tab="scenes">\u30D7\u30EC\u30FC\u30B9</button>
        <button class="works__tab" data-tab="rag">RAG</button>
      </div>
      <div id="worksContent"></div>
    </div>`,c.querySelectorAll(".works__tab").forEach(e=>{e.addEventListener("click",()=>{c.querySelectorAll(".works__tab").forEach(a=>a.classList.remove("works__tab--active")),e.classList.add("works__tab--active");let t=e.dataset.tab;t==="characters"?B():t==="scenes"?D():t==="rag"&&N()})}),B())}async function B(){let e=document.getElementById("worksContent")||c;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{characters:t}=await J();e.innerHTML=`
      <div class="char-list">
        <button class="btn-new" id="btnNewChar">+ \u65B0\u898F\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</button>
        ${t.map(a=>`
          <div class="char-item" data-id="${a.id}">
            ${a.avatar_url?`<img src="${a.avatar_url}" class="char-item__avatar" />`:'<div class="char-item__avatar char-item__avatar--placeholder"></div>'}
            <div class="char-item__info">
              <p class="char-item__name">${a.name}</p>
              <p class="char-item__desc">${a.description?.slice(0,80)||""}</p>
              <div class="char-item__tags">${a.tags||""} ${a.genre?"<span class='tag-genre'>"+a.genre+"</span>":""}</div>
            </div>
            <div class="char-item__actions">
              <button class="btn-icon" data-action="edit" data-id="${a.id}">\u270F</button>
              <button class="btn-icon btn-icon--danger" data-action="delete" data-id="${a.id}">\u{1F5D1}</button>
            </div>
          </div>
        `).join("")||'<p class="main__empty">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u300C+ \u65B0\u898F\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u300D\u304B\u3089\u4F5C\u6210\u3067\u304D\u307E\u3059</p>'}
      </div>`,document.getElementById("btnNewChar")?.addEventListener("click",()=>ze()),e.querySelectorAll("[data-action]").forEach(a=>{a.addEventListener("click",async n=>{n.stopPropagation();let s=a,i=Number(s.dataset.id);s.dataset.action==="edit"?Ye(i):s.dataset.action==="delete"&&confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await ue(i),B())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function Be(e,t){let a=t?.dependencies||"",n=t?.recommendations||"",s=t?.restrictions||"";return`
    <label class="editor__field"><span>Dependencies (\u30B8\u30E3\u30F3\u30EBor\u500B\u5225)</span><textarea id="${e}Deps" rows="2" placeholder="\u4F8B: \u30D5\u30A1\u30F3\u30BF\u30B8\u30FC, \u30AD\u30E3\u30E9ID:5">${a}</textarea></label>
    <label class="editor__field"><span>Recommendations (\u30B8\u30E3\u30F3\u30EBor\u500B\u5225)</span><textarea id="${e}Recs" rows="2" placeholder="\u4F8B: SF, \u30AD\u30E3\u30E9ID:3">${n}</textarea></label>
    <label class="editor__field"><span>Restrictions (\u30B8\u30E3\u30F3\u30EBor\u500B\u5225)</span><textarea id="${e}Restr" rows="2" placeholder="\u4F8B: \u30DB\u30E9\u30FC\u7981\u6B62, \u30AD\u30E3\u30E9ID:7">${s}</textarea></label>`}function Pe(e){return{dependencies:document.getElementById(e+"Deps")?.value||null,recommendations:document.getElementById(e+"Recs")?.value||null,restrictions:document.getElementById(e+"Restr")?.value||null}}function ze(e){if(!c)return;let t=!!e;c.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">${t?"\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u7DE8\u96C6":"\u65B0\u898F\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC"}</h2>
      <div class="editor__form">
        <label class="editor__field"><span>\u5199\u771F (URL) \u203B\u5FC5\u9808</span><input type="text" id="charAvatar" value="${e?.avatar_url||""}" placeholder="\u753B\u50CFURL" /></label>
        <label class="editor__field"><span>\u540D\u524D \u203B\u5FC5\u9808</span><input type="text" id="charName" value="${e?.name||""}" /></label>
        <label class="editor__field"><span>\u6982\u8981\u30FB\u6027\u683C \u203B\u5FC5\u9808</span><textarea id="charDesc" rows="4" placeholder="\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306E\u6982\u8981\u3084\u6027\u683C">${e?.description||""}</textarea></label>
        <label class="editor__field"><span>\u30B7\u30B9\u30C6\u30E0\u30D7\u30ED\u30F3\u30D7\u30C8 (\u4EFB\u610F)</span><textarea id="charSystemPrompt" rows="5">${e?.system_prompt||""}</textarea></label>
        <label class="editor__field"><span>\u6328\u62F6 (\u4EFB\u610F)</span><textarea id="charGreeting" rows="3">${e?.greeting||""}</textarea></label>
        <label class="editor__field"><span>\u30BF\u30B0 (\u30AB\u30F3\u30DE\u533A\u5207\u308A)</span><input type="text" id="charTags" value="${e?.tags||""}" /></label>
        <label class="editor__field"><span>\u30B8\u30E3\u30F3\u30EB</span><input type="text" id="charGenre" value="${e?.genre||""}" placeholder="\u4F8B: \u30D5\u30A1\u30F3\u30BF\u30B8\u30FC" /></label>
        ${Be("char",e)}
        <label class="editor__field editor__field--row">
          <input type="checkbox" id="charPublic" ${e?.is_public?"checked":""} />
          <span>\u516C\u958B\u3059\u308B</span>
        </label>
        <div class="editor__actions">
          <button class="btn-secondary" id="charCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="charSave">\u4FDD\u5B58</button>
        </div>
      </div>
    </div>`,document.getElementById("charCancel")?.addEventListener("click",()=>B()),document.getElementById("charSave")?.addEventListener("click",async()=>{let a=Pe("char"),n={name:document.getElementById("charName").value,avatar_url:document.getElementById("charAvatar").value||null,description:document.getElementById("charDesc").value||null,system_prompt:document.getElementById("charSystemPrompt").value||null,greeting:document.getElementById("charGreeting").value||null,tags:document.getElementById("charTags").value||null,genre:document.getElementById("charGenre").value||null,dependencies:a.dependencies,recommendations:a.recommendations,restrictions:a.restrictions,is_public:document.getElementById("charPublic").checked?1:0};try{e?.id?await de(e.id,n):await ce(n),B()}catch(s){P(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${s}`)}})}async function Ye(e){try{let{character:t}=await le(e);ze(t)}catch(t){P(`\u53D6\u5F97\u30A8\u30E9\u30FC: ${t}`)}}async function D(){let e=document.getElementById("worksContent")||c;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{scenes:t}=await q();e.innerHTML=`
      <div class="scene-list">
        <button class="btn-new" id="btnNewScene">+ \u65B0\u898F\u30D7\u30EC\u30FC\u30B9</button>
        ${t.map(a=>`
          <div class="scene-item" data-id="${a.id}">
            <div class="scene-item__info">
              <p class="scene-item__name">${a.name}</p>
              <p class="scene-item__setting">${a.description?.slice(0,80)||a.setting?.slice(0,80)||""}</p>
              ${a.mood?`<span class="scene-item__mood">${a.mood}</span>`:""}
              <div class="char-item__tags">${a.tags||""} ${a.genre?"<span class='tag-genre'>"+a.genre+"</span>":""}</div>
            </div>
            <button class="btn-icon btn-icon--danger" data-action="delete-scene" data-id="${a.id}">\u{1F5D1}</button>
          </div>
        `).join("")||'<p class="main__empty">\u30D7\u30EC\u30FC\u30B9\u304C\u3042\u308A\u307E\u305B\u3093</p>'}
      </div>`,document.getElementById("btnNewScene")?.addEventListener("click",()=>Lt()),e.querySelectorAll('[data-action="delete-scene"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await ge(n),D())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function Lt(){c&&(c.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">\u65B0\u898F\u30D7\u30EC\u30FC\u30B9</h2>
      <div class="editor__form">
        <label class="editor__field"><span>\u5834\u6240\u540D \u203B\u5FC5\u9808</span><input type="text" id="sceneName" /></label>
        <label class="editor__field"><span>\u6982\u8981 (\u3069\u3093\u306A\u5834\u6240\u304B) \u203B\u5FC5\u9808</span><textarea id="sceneDesc" rows="4" placeholder="\u3069\u3093\u306A\u5834\u6240\u304B"></textarea></label>
        <label class="editor__field"><span>\u8A2D\u5B9A (\u4EFB\u610F\u30FB\u500B\u5225)</span><textarea id="sceneSetting" rows="3" placeholder="\u500B\u5225\u3067\u5206\u3051\u308B\u5FC5\u8981\u304C\u3042\u308B\u8A2D\u5B9A"></textarea></label>
        <label class="editor__field"><span>\u30E0\u30FC\u30C9</span><input type="text" id="sceneMood" /></label>
        <label class="editor__field"><span>\u30BF\u30B0 (\u30AB\u30F3\u30DE\u533A\u5207\u308A)</span><input type="text" id="sceneTags" /></label>
        <label class="editor__field"><span>\u30B8\u30E3\u30F3\u30EB</span><input type="text" id="sceneGenre" placeholder="\u4F8B: \u30D5\u30A1\u30F3\u30BF\u30B8\u30FC" /></label>
        ${Be("scene")}
        <label class="editor__field editor__field--row">
          <input type="checkbox" id="scenePublic" />
          <span>\u516C\u958B\u3059\u308B</span>
        </label>
        <div class="editor__actions">
          <button class="btn-secondary" id="sceneCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="sceneSave">\u4FDD\u5B58</button>
        </div>
      </div>
    </div>`,document.getElementById("sceneCancel")?.addEventListener("click",()=>D()),document.getElementById("sceneSave")?.addEventListener("click",async()=>{let e=Pe("scene");try{await me({name:document.getElementById("sceneName").value,description:document.getElementById("sceneDesc").value||null,setting:document.getElementById("sceneSetting").value||null,mood:document.getElementById("sceneMood").value||null,tags:document.getElementById("sceneTags").value||null,genre:document.getElementById("sceneGenre").value||null,dependencies:e.dependencies,recommendations:e.recommendations,restrictions:e.restrictions,is_public:document.getElementById("scenePublic").checked?1:0}),D()}catch(t){P(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${t}`)}}))}async function N(){let e=document.getElementById("worksContent")||c;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{documents:t}=await pe();e.innerHTML=`
      <div class="rag-list">
        <button class="btn-new" id="btnNewRag">+ \u65B0\u898FRAG (.json)</button>
        ${t.map(a=>`
          <div class="rag-item" data-id="${a.id}">
            <div class="rag-item__info">
              <p class="rag-item__title">${a.title}</p>
              <p class="rag-item__source">${a.source||""} ${a.genre?"<span class='tag-genre'>"+a.genre+"</span>":""}</p>
              <div class="char-item__tags">${a.tags||""}</div>
            </div>
            <button class="btn-icon btn-icon--danger" data-action="delete-rag" data-id="${a.id}">\u{1F5D1}</button>
          </div>
        `).join("")||'<p class="main__empty">RAG\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u304C\u3042\u308A\u307E\u305B\u3093</p>'}
      </div>`,document.getElementById("btnNewRag")?.addEventListener("click",()=>Tt()),e.querySelectorAll('[data-action="delete-rag"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await ve(n),N())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function Tt(){c&&(c.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">\u65B0\u898FRAG (.json)</h2>
      <div class="editor__form">
        <label class="editor__field"><span>\u30BF\u30A4\u30C8\u30EB \u203B\u5FC5\u9808</span><input type="text" id="ragTitle" /></label>
        <label class="editor__field"><span>JSON\u672C\u6587 \u203B\u5FC5\u9808</span><textarea id="ragContent" rows="10" placeholder='{"key": "value"}'></textarea></label>
        <label class="editor__field"><span>\u30BD\u30FC\u30B9 (\u4EFB\u610F)</span><input type="text" id="ragSource" /></label>
        <label class="editor__field"><span>\u30BF\u30B0 (\u30AB\u30F3\u30DE\u533A\u5207\u308A)</span><input type="text" id="ragTags" /></label>
        <label class="editor__field"><span>\u30B8\u30E3\u30F3\u30EB</span><input type="text" id="ragGenre" placeholder="\u4F8B: SF" /></label>
        ${Be("rag")}
        <div class="editor__actions">
          <button class="btn-secondary" id="ragCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="ragSave">\u4FDD\u5B58</button>
        </div>
      </div>
    </div>`,document.getElementById("ragCancel")?.addEventListener("click",()=>N()),document.getElementById("ragSave")?.addEventListener("click",async()=>{let e=Pe("rag");try{await _e({title:document.getElementById("ragTitle").value,content:document.getElementById("ragContent").value,source:document.getElementById("ragSource").value||null,tags:document.getElementById("ragTags").value||null,genre:document.getElementById("ragGenre").value||null,dependencies:e.dependencies,recommendations:e.recommendations,restrictions:e.restrictions}),N()}catch(t){P(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${t}`)}}))}async function Z(){let e=document.getElementById("worksContent")||c;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let[t,a,n]=await Promise.all([fe().catch(()=>({packs:[]})),J().catch(()=>({characters:[]})),q().catch(()=>({scenes:[]}))]),s=t.packs||[],i=a.characters||[],r=n.scenes||[],o={};i.forEach(l=>o[l.id]=l.name);let m={};r.forEach(l=>m[l.id]=l.name),e.innerHTML=`
      <div class="pack-list">
        <button class="btn-new" id="btnNewPack">+ \u65B0\u898FPack</button>
        <p class="pack-hint" style="color:var(--muted-foreground);font-size:0.85em;margin:8px 0">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC + \u30D7\u30EC\u30FC\u30B9 + RAG \u3092\u7D44\u307F\u5408\u308F\u305B\u3066\u30C1\u30E3\u30C3\u30C8\u3067\u304D\u307E\u3059</p>
        ${s.map(l=>`
          <div class="pack-item" data-id="${l.id}" style="border:1px solid var(--border);border-radius:8px;padding:12px;margin:8px 0;cursor:pointer">
            <p style="font-weight:600">${l.name}</p>
            <p style="font-size:0.85em;color:var(--muted-foreground)">${l.description?.slice(0,100)||""}</p>
            <div style="display:flex;gap:8px;margin-top:4px;font-size:0.8em">
              ${l.character_id?`<span>\u{1F464} ${o[l.character_id]||"?"}</span>`:""}
              ${l.scene_id?`<span>\u{1F4CD} ${m[l.scene_id]||"?"}</span>`:""}
              ${l.rag_ids?"<span>\u{1F4C4} RAG</span>":""}
            </div>
            <div style="margin-top:8px">
              <button class="btn-icon btn-icon--danger" data-action="delete-pack" data-id="${l.id}" style="font-size:0.8em">\u{1F5D1}</button>
            </div>
          </div>
        `).join("")||'<p class="main__empty">Pack\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u300C+ \u65B0\u898FPack\u300D\u304B\u3089\u4F5C\u6210\u3067\u304D\u307E\u3059</p>'}
      </div>`,document.getElementById("btnNewPack")?.addEventListener("click",()=>St(i,r)),e.querySelectorAll('[data-action="delete-pack"]').forEach(l=>{l.addEventListener("click",async g=>{g.stopPropagation();let b=Number(l.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await he(b),Z())})}),e.querySelectorAll(".pack-item").forEach(l=>{l.addEventListener("click",()=>{let g=Number(l.dataset.id);f("chat")})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function St(e,t){if(!c)return;let a=(e.length>0,"");c.innerHTML=`
    <div class="editor">
      <h2 class="editor__title">\u65B0\u898FPack</h2>
      <div class="editor__form">
        <label class="editor__field"><span>Pack\u540D \u203B\u5FC5\u9808</span><input type="text" id="packName" /></label>
        <label class="editor__field"><span>\u8AAC\u660E</span><textarea id="packDesc" rows="3"></textarea></label>
        <label class="editor__field"><span>\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</span>
          <select id="packChar">
            <option value="">-- \u9078\u629E --</option>
            ${e.map(n=>`<option value="${n.id}">${n.name}</option>`).join("")}
          </select>
        </label>
        <label class="editor__field"><span>\u30D7\u30EC\u30FC\u30B9</span>
          <select id="packScene">
            <option value="">-- \u9078\u629E --</option>
            ${t.map(n=>`<option value="${n.id}">${n.name}</option>`).join("")}
          </select>
        </label>
        <label class="editor__field"><span>\u30BF\u30B0 (\u30AB\u30F3\u30DE\u533A\u5207\u308A)</span><input type="text" id="packTags" /></label>
        <label class="editor__field"><span>\u30B8\u30E3\u30F3\u30EB</span><input type="text" id="packGenre" /></label>
        <label class="editor__field editor__field--row">
          <input type="checkbox" id="packPublic" />
          <span>\u516C\u958B\u3059\u308B</span>
        </label>
        <div class="editor__actions">
          <button class="btn-secondary" id="packCancel">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
          <button class="btn-primary" id="packSave">\u4FDD\u5B58</button>
        </div>
      </div>
    </div>`,document.getElementById("packCancel")?.addEventListener("click",()=>Z()),document.getElementById("packSave")?.addEventListener("click",async()=>{try{await be({name:document.getElementById("packName").value,description:document.getElementById("packDesc").value||null,character_id:document.getElementById("packChar").value?Number(document.getElementById("packChar").value):null,scene_id:document.getElementById("packScene").value?Number(document.getElementById("packScene").value):null,tags:document.getElementById("packTags").value||null,genre:document.getElementById("packGenre").value||null,is_public:document.getElementById("packPublic").checked?1:0}),Z()}catch(n){P(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${n}`)}})}function P(e){if(c){let t=document.createElement("div");t.className="error-banner",t.textContent=e,c.prepend(t),setTimeout(()=>t.remove(),5e3)}}Q();Ue();var Se=!1;async function We(){if(Se)return;let e=M();if(e.connected||e.connecting)return;let t=await k().catch(()=>null);!t||!t.fl_server_url||t.fl_server_url==="not-configured"||t.fl_server_url==="offline"||t.fl_auth_token&&(Se=!0,z({serverUrl:t.fl_server_url,authToken:t.fl_auth_token}))}He()&&(f("home"),y()?.fl_consent&&(We(),setInterval(()=>{let t=M();!t.connected&&!t.connecting&&(Se=!1,We())},15e3)));})();

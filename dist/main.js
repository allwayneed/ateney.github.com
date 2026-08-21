"use strict";(()=>{var ze=Object.defineProperty;var Ye=(e,t)=>()=>(e&&(t=e(e=0)),t);var Ke=(e,t)=>{for(var a in t)ze(e,a,{get:t[a],enumerable:!0})};var be={};Ke(be,{authLogin:()=>Ve,bulkImportRag:()=>ve,clearApiToken:()=>ee,clearChat:()=>Ze,createCharacter:()=>le,createRagDoc:()=>pe,createScene:()=>me,deleteAccount:()=>ae,deleteCharacter:()=>de,deleteRagDoc:()=>fe,deleteScene:()=>_e,getApiToken:()=>Be,getCharacter:()=>oe,getCharacters:()=>ie,getChatHistory:()=>se,getFlStatus:()=>k,getPublicCharacters:()=>H,getRagDocs:()=>ge,getScenes:()=>ue,getUser:()=>ne,saveChat:()=>j,sendChatMessage:()=>re,setApiToken:()=>U,updateCharacter:()=>ce,updateProfile:()=>J,updateScene:()=>Qe});function Be(){return localStorage.getItem(X)}function U(e){localStorage.setItem(X,e)}function ee(){localStorage.removeItem(X)}async function d(e,t={}){let a=Be(),n={"Content-Type":"application/json",...t.headers||{}};a&&(n.Authorization=`Bearer ${a}`);let s=await fetch(`${xe}${e}`,{...t,headers:n});if(!s.ok)throw console.warn(`[ateney] API ${s.status}: ${e}`),new Error(`API ${s.status}`);return s.json()}async function te(e,t={}){try{return await d(e,t)}catch{return null}}async function Ve(e){return d("/auth/login",{method:"POST",body:JSON.stringify({id_token:e})})}async function ne(){return d("/user")}async function ae(){return d("/user",{method:"DELETE"})}async function J(e){return d("/user/profile",{method:"PUT",body:JSON.stringify(e)})}async function se(e=50,t=0){return te(`/chat/history?limit=${e}&offset=${t}`)}async function j(e,t,a){return te("/chat/save",{method:"POST",body:JSON.stringify({role:e,content:t,adapter_value:a})})}async function Ze(){return te("/chat/clear",{method:"DELETE"})}async function re(e,t,a){try{return await d("/chat/send",{method:"POST",body:JSON.stringify({message:e,character_id:t,scene_id:a})})}catch{return null}}async function ie(){return d("/characters")}async function H(){return d("/characters/public")}async function oe(e){return d(`/characters/${e}`)}async function le(e){return d("/characters",{method:"POST",body:JSON.stringify(e)})}async function ce(e,t){return d(`/characters/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function de(e){return d(`/characters/${e}`,{method:"DELETE"})}async function ue(e){let t=e?`?character_id=${e}`:"";return d(`/scenes${t}`)}async function me(e){return d("/scenes",{method:"POST",body:JSON.stringify(e)})}async function Qe(e,t){return d(`/scenes/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function _e(e){return d(`/scenes/${e}`,{method:"DELETE"})}async function ge(e){let t=e?`?character_id=${e}`:"";return d(`/rag${t}`)}async function pe(e){return d("/rag",{method:"POST",body:JSON.stringify(e)})}async function ve(e){return d("/rag/bulk",{method:"POST",body:JSON.stringify({documents:e})})}async function fe(e){return d(`/rag/${e}`,{method:"DELETE"})}async function k(){let e=await fetch(`${xe}/fl/status`);return e.ok?e.json():{fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0}}var xe,X,W=Ye(()=>{"use strict";xe="https://ateney-api.ateney-ai.workers.dev/api",X="ateney_jwt"});W();var he="ateney_auth";function h(){try{let e=localStorage.getItem(he);return e?JSON.parse(e):null}catch{return null}}function Xe(e){localStorage.setItem(he,JSON.stringify(e))}function ye(){localStorage.removeItem(he)}function $e(){return h()!==null}function et(e){let t=e.replace(/-/g,"+").replace(/_/g,"/"),a=t.length%4;return a&&(t+="=".repeat(4-a)),atob(t)}function Me(e,t,a){let n=document.createElement("script");n.src="https://accounts.google.com/gsi/client",n.async=!0,n.defer=!0,n.onload=()=>{let s=document.getElementById(e);s&&(window.google.accounts.id.initialize({client_id:"610487938019-8n4ohpj2qnm9uent2jhglaoemj0q7h3g",callback:async i=>{try{let r=i.credential.split(".");if(r.length<2){a?.("Invalid JWT");return}let o=JSON.parse(et(r[1])),{authLogin:u,setApiToken:_}=await Promise.resolve().then(()=>(W(),be)),m=await u(i.credential);_(m.token);let E={provider:"google",id:o.sub,name:m.user.username||m.user.name||o.name,email:m.user.email||o.email,avatar:m.user.avatar_url||o.picture,token:m.token,needs_onboarding:m.user.needs_onboarding,username:m.user.username,userId:m.user.id,fl_consent:!!m.user.fl_consent};Xe(E),t(E)}catch(r){console.error("[ateney] Login failed:",r),a?.(r.message||"\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F")}}}),window.google.accounts.id.renderButton(s,{theme:"outline",size:"large",text:"continue_with",locale:"ja"}))},document.head.appendChild(n)}function He(){let e=new URLSearchParams({response_type:"code",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:Ae(),scope:"profile openid email"});window.location.href=`https://access.line.me/oauth2/v2.1/authorize?${e.toString()}`}function Ce(){let e=new URLSearchParams({response_type:"code id_token",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:Ae(),scope:"name email",response_mode:"form_post"});window.location.href=`https://appleid.apple.com/auth/authorize?${e.toString()}`}function Pe(){h()?.provider==="google"&&window.google?.accounts?.id?.disableAutoSelect?.(),ye(),Promise.resolve().then(()=>(W(),be)).then(({clearApiToken:t})=>t())}function Ae(){let e=new Uint8Array(32);return crypto.getRandomValues(e),Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}var y=null,S=null,T=null,w=null,C=null,v=null,Ee,p={connected:!1,connecting:!1,backend:"...",clientId:"",rank:"-",role:"-",rounds:0,lossHistory:[],lastLoss:null,banned:!1,banRemaining:0,log:[]},Ne=null;function tt(){let e=localStorage.getItem("fedClientId");return e||(e=crypto.randomUUID(),localStorage.setItem("fedClientId",e)),e}function Re(e){Ee=tt(),p.clientId=Ee,Ne=e??null,e?.(p)}function b(e){p={...p,...e},Ne?.(p)}function g(e){let t=`[${new Date().toLocaleTimeString()}] ${e}`;p.log=[...p.log.slice(-49),t],b({log:p.log})}async function nt(){try{await tf.setBackend("webgpu"),await tf.ready()}catch{try{await tf.setBackend("webgl"),await tf.ready()}catch{await tf.setBackend("cpu"),await tf.ready()}}return tf.getBackend()}function De(e,t){y&&(y.dispose(),S.dispose(),T.dispose(),w.dispose()),C=e,t?(y=tf.variable(tf.tensor(t.W1,[C,8])),S=tf.variable(tf.tensor(t.b1,[8])),T=tf.variable(tf.tensor(t.W2,[8,1])),w=tf.variable(tf.tensor(t.b2,[1]))):(y=tf.variable(tf.randomNormal([C,8],0,.05)),S=tf.variable(tf.zeros([8])),T=tf.variable(tf.randomNormal([8,1],0,.05)),w=tf.variable(tf.zeros([1])))}function Fe(e){let t=tf.relu(tf.add(tf.matMul(e,y),S));return tf.add(tf.matMul(t,T),w)}async function at(e,t,a=30,n=.05){let s=tf.tensor(e,[e.length,C]),i=tf.tensor(t,[t.length,1]),r=0,o=tf.train.adam(n);for(let u=0;u<a;u++)o.minimize(()=>{let _=Fe(s),m=tf.losses.meanSquaredError(i,_);return r=m.dataSync()[0],m},!0,[y,S,T,w]);return s.dispose(),i.dispose(),r}function st(){return{W1:Array.from(y.dataSync()),b1:Array.from(S.dataSync()),W2:Array.from(T.dataSync()),b2:Array.from(w.dataSync())}}async function q(e){if(v&&v.readyState===WebSocket.OPEN)return;b({connecting:!0,log:[]}),g("TensorFlow.js \u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u521D\u671F\u5316\u4E2D...");let t=await nt();g(`\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9: ${t}`),b({backend:t}),g(`\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u4E2D: ${e.serverUrl}`),v=new WebSocket(e.serverUrl),v.onopen=()=>{g("\u63A5\u7D9A\u6210\u529F \u2014 \u8A8D\u8A3C\u9001\u4FE1\u4E2D..."),b({connected:!0,connecting:!1}),v.send(JSON.stringify({type:"hello",id:Ee,kind:"worker",token:e.authToken}))},v.onclose=a=>{a.code===4002?g("\u8A8D\u8A3C\u5931\u6557: \u30C8\u30FC\u30AF\u30F3\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093"):a.code===4003?g("\u63A5\u7D9A\u62D2\u5426: \u8A31\u53EF\u3055\u308C\u3066\u3044\u306A\u3044IP\u3067\u3059"):g(`\u5207\u65AD (code=${a.code})`),b({connected:!1,connecting:!1,rank:"-",role:"-"}),v=null},v.onerror=()=>g("\u63A5\u7D9A\u30A8\u30E9\u30FC"),v.onmessage=async a=>{let n=JSON.parse(a.data);if(n.type==="hello_ack"){g(`\u8A8D\u8A3C\u6210\u529F \u2014 \u30E9\u30F3\u30AF: ${n.rank}, \u30ED\u30FC\u30EB: ${n.role}`),b({rank:n.rank,role:n.role,banned:!1});return}if(n.type==="banned"){g(`\u30EF\u30FC\u30AB\u30FC\u8CC7\u683C\u505C\u6B62\u4E2D (\u6B8B\u308A${n.remaining_seconds}\u79D2)`),b({banned:!0,banRemaining:n.remaining_seconds,rank:"F"});return}if(n.type==="round"){g(`\u30E9\u30A6\u30F3\u30C9 ${n.round} \u53D7\u4FE1 (${n.features.length}\u4EF6, dim=${n.embed_dim})`),De(n.embed_dim,n.global_weights);let s=await at(n.features,n.targets),i=st();v.send(JSON.stringify({type:"update",weights:i,n:n.features.length,loss:s})),p.rounds++,p.lossHistory=[...p.lossHistory.slice(-19),s],g(`\u91CD\u307F\u9001\u4FE1\u5B8C\u4E86 \u2014 loss=${s.toFixed(4)} (\u7D2F\u8A08${p.rounds}\u30E9\u30A6\u30F3\u30C9)`),b({rounds:p.rounds,lossHistory:p.lossHistory,lastLoss:s});return}if(n.type==="infer"){g("\u63A8\u8AD6\u30EA\u30AF\u30A8\u30B9\u30C8\u53D7\u4FE1"),y||De(n.embed_dim,n.global_weights||null);let s=tf.tensor(n.features,[n.features.length,C]),i=Fe(s),r=i.dataSync()[0];s.dispose(),i.dispose(),v.send(JSON.stringify({type:"infer_result",value:r})),g(`\u63A8\u8AD6\u7D50\u679C\u9001\u4FE1: ${r.toFixed(4)}`);return}if(n.type==="error"){g(`[\u30A8\u30E9\u30FC] ${n.message}`);return}}}function ke(){v&&(v.close(),v=null),b({connected:!1,connecting:!1,rank:"-",role:"-"}),g("\u624B\u52D5\u5207\u65AD")}function P(){return p}var Oe=document.getElementById("loginScreen"),A=document.getElementById("accountIcon"),Y=document.getElementById("settingsName"),Ue=document.getElementById("settingsEmail"),Je=document.getElementById("settingsAvatar"),l=document.getElementById("main-content"),c=null;function K(){c=h(),c?(Oe?.classList.add("hidden"),A&&(A.style.display="flex"),Y&&(Y.textContent=c.username||c.name),Ue&&(Ue.textContent=c.email??""),Je&&c.avatar&&(Je.innerHTML=`<img src="${c.avatar}" alt="${c.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`),c.needs_onboarding?rt():f("home")):(Oe?.classList.remove("hidden"),A&&(A.style.display="none"))}function rt(){if(!l)return;let e=1;l.innerHTML=`
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
          <div class="onboarding__hint">\u3042\u306A\u305F\u306E\u30E6\u30FC\u30B6\u30FCID: #${c?.userId??"?"}</div>
          <button class="btn-primary onboarding__next" id="onboardNext1">\u6B21\u3078</button>
        </div>
      </div>
    </div>`,document.getElementById("onboardNext1")?.addEventListener("click",()=>{let t=document.getElementById("onboardUsername").value.trim();if(!t){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(t.length>20){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F20\u6587\u5B57\u4EE5\u5185\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(!/^[a-zA-Z0-9_-]+$/.test(t)){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F\u82F1\u6570\u5B57\u3001_\u3001- \u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059");return}it(t)}),document.getElementById("onboardUsername")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("onboardNext1")?.click()})}function it(e){if(!l)return;l.innerHTML=`
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
    </div>`,document.querySelectorAll("[data-dial]").forEach(a=>{a.addEventListener("click",()=>{let n=a.dataset.dial,[s,i]=n.split("-"),r=document.getElementById(s==="year"?"dialYear":s==="month"?"dialMonth":"dialDay"),o=parseInt(r.value),u=parseInt(r.min),_=parseInt(r.max);i==="up"?o=o>=_?u:o+1:o=o<=u?_:o-1,r.value=String(o)})}),document.getElementById("onboardNext2")?.addEventListener("click",()=>{let a=document.getElementById("dialYear").value,n=document.getElementById("dialMonth").value.padStart(2,"0"),s=document.getElementById("dialDay").value.padStart(2,"0"),i=`${a}-${n}-${s}`;if(!i){alert("\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}let r=new Date,o=new Date(i),u=r.getFullYear()-o.getFullYear(),_=r.getMonth()-o.getMonth();if((_<0||_===0&&r.getDate()<o.getDate())&&u--,u<13){alert("ateney\u306F13\u6B73\u4EE5\u4E0A\u304C\u5BFE\u8C61\u3067\u3059");return}if(u>120){alert("\u6B63\u3057\u3044\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}ot(e,i)})}function ot(e,t){l&&(l.innerHTML=`
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
    </div>`,document.getElementById("onboardFinish")?.addEventListener("click",async()=>{let a=document.getElementById("flYes").checked,n=document.getElementById("onboardFinish");n.disabled=!0,n.textContent="\u4FDD\u5B58\u4E2D\u2026";try{let s=await J({username:e,birth_date:t,fl_consent:a});if(s.token&&U(s.token),c){c.username=e,c.needs_onboarding=!1,c.userId=s.user?.id??c.userId,c.token=s.token||c.token;let i=h();i&&(i.username=e,i.needs_onboarding=!1,i.userId=s.user?.id??i.userId,i.token=s.token||i.token,i.fl_consent=a,localStorage.setItem("ateney_auth",JSON.stringify(i)))}Y&&(Y.textContent=e),f("home")}catch(s){alert(`\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${s}`),n.disabled=!1,n.textContent="\u5B8C\u4E86"}}))}Me("googleLoginBtn",e=>{U(e.token),c=e,K()},e=>{M(e)});async function lt(){if(!l)return;let e=await k().catch(()=>({fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0})),t=e.fl_server_url==="not-configured"||e.fl_server_url==="offline"?"":e.fl_server_url,a=e.fl_auth_token||"",n=P();t&&a&&!n.connected&&!n.connecting&&q({serverUrl:t,authToken:a});let s=n.banned?'<div class="fed__detail fed__detail--warn">\u6B8B\u308A '+n.banRemaining+"\u79D2</div>":"",i=n.lossHistory.length>0?'<div class="fed__chart"><div class="fed__card-header">Loss\u63A8\u79FB</div><div class="fed__loss-chart">'+n.lossHistory.map((O,qe)=>{let Ge=Math.max(...n.lossHistory,1);return'<div class="fed__loss-bar" style="height:'+O/Ge*100+'%" title="R'+(qe+1)+": "+O.toFixed(4)+'"></div>'}).join("")+"</div></div>":"",r=n.log.map(O=>'<div class="fed__log-line">'+O+"</div>").join(""),o=n.connected?"fed__status-dot--online":n.connecting?"fed__status-dot--connecting":"fed__status-dot--offline",u=n.connected?"\u63A5\u7D9A\u4E2D":n.connecting?"\u63A5\u7D9A\u4E2D...":"\u672A\u63A5\u7D9A",_=n.banned?"F (\u505C\u6B62\u4E2D)":n.rank,m=n.lastLoss!==null?n.lastLoss.toFixed(4):"-",E=n.connected?"":"disabled",Z=t?"":'<div class="fed__offline-msg">FL\u30B5\u30FC\u30D0\u30FC\u304C\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3059\u3002\u30B5\u30FC\u30D0\u30FC\u304C\u8D77\u52D5\u3059\u308B\u3068\u81EA\u52D5\u63A5\u7D9A\u3057\u307E\u3059\u3002</div>';l.innerHTML=['<div class="fed">','  <h2 class="fed__title">\u26A1 Federated Learning</h2>','  <p class="fed__subtitle">\u30D6\u30E9\u30A6\u30B6\u4E0A\u3067AI\u30A2\u30C0\u30D7\u30BF\u306E\u5B66\u7FD2\u306B\u53C2\u52A0</p>','  <div class="fed__grid">','    <div class="fed__card">','      <div class="fed__card-header">\u63A5\u7D9A\u72B6\u614B</div>','      <div class="fed__status-row">','        <span class="fed__status-dot '+o+'"></span>',"        <span>"+u+"</span>","      </div>",'      <div class="fed__detail">Backend: <strong>'+n.backend+"</strong></div>",'      <div class="fed__detail">Client: <strong>'+n.clientId.slice(0,8)+"</strong></div>","    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u30E9\u30F3\u30AF</div>','      <div class="fed__rank '+(n.banned?"fed__rank--banned":"")+'">'+_+"</div>",'      <div class="fed__detail">\u30ED\u30FC\u30EB: <strong>'+n.role+"</strong></div>","      "+s,"    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u5B66\u7FD2\u30E9\u30A6\u30F3\u30C9</div>','      <div class="fed__stat-num">'+n.rounds+"</div>",'      <div class="fed__detail">\u6700\u7D42loss: <strong>'+m+"</strong></div>","    </div>","  </div>","  "+i,"  "+Z,'  <div class="fed__controls">','    <button class="btn-secondary" id="flDisconnectBtn" '+E+">\u5207\u65AD</button>","  </div>",'  <div class="fed__log-wrap">','    <div class="fed__card-header">\u30ED\u30B0</div>','    <div class="fed__log" id="flLog">'+r+"</div>","  </div>",'  <div class="fed__info">',"    <p>\u3053\u306E\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u3044\u308B\u9593\u3001\u3042\u306A\u305F\u306E\u30D6\u30E9\u30A6\u30B6\u304CAI\u30E2\u30C7\u30EB\u306E\u5FAE\u8ABF\u6574\u306B\u53C2\u52A0\u3057\u307E\u3059\u3002</p>","    <p>\u5B66\u7FD2\u30C7\u30FC\u30BF\u306F\u30B5\u30FC\u30D0\u30FC\u304B\u3089\u914D\u4FE1\u3055\u308C\u3001\u91CD\u307F\u306E\u66F4\u65B0\u7D50\u679C\u306E\u307F\u304C\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002</p>","    <p>\u30D6\u30E9\u30A6\u30B6\u306EGPU (WebGPU/WebGL) \u3092\u4F7F\u7528\u3057\u3066\u30ED\u30FC\u30AB\u30EB\u5B66\u7FD2\u3092\u884C\u3044\u307E\u3059\u3002</p>","  </div>","</div>"].join(`
`),document.getElementById("flDisconnectBtn")?.addEventListener("click",()=>{ke()});let Q=document.getElementById("flLog");Q&&(Q.scrollTop=Q.scrollHeight)}document.getElementById("lineLoginBtn")?.addEventListener("click",()=>He());document.getElementById("appleLoginBtn")?.addEventListener("click",()=>Ce());document.getElementById("logoutBtn")?.addEventListener("click",()=>{Pe(),c=null,K(),V()});var D=document.getElementById("hamburger"),N=document.getElementById("sideMenu"),Se=document.getElementById("overlay");function ct(){N?.classList.contains("open")?F():dt()}function dt(){N?.classList.add("open"),Se?.classList.add("show"),D?.classList.add("open"),D?.setAttribute("aria-expanded","true"),N?.setAttribute("aria-hidden","false")}function F(){document.activeElement?.blur(),N?.classList.remove("open"),Se?.classList.remove("show"),D?.classList.remove("open"),D?.setAttribute("aria-expanded","false"),N?.setAttribute("aria-hidden","true")}D?.addEventListener("click",ct);Se?.addEventListener("click",F);document.addEventListener("keydown",e=>{e.key==="Escape"&&(F(),V())});var B=document.getElementById("settings"),ut=document.getElementById("settingsBack");function Te(){B?.classList.add("open"),B?.setAttribute("aria-hidden","false"),F()}function V(){document.activeElement?.blur(),B?.classList.remove("open"),B?.setAttribute("aria-hidden","true")}A?.addEventListener("click",Te);ut?.addEventListener("click",V);document.getElementById("menuSettings")?.addEventListener("click",e=>{e.preventDefault(),Te()});Te=function(){B?.classList.add("open"),B?.setAttribute("aria-hidden","false");let e=document.getElementById("toggleFlConsent");if(e){let a=h();e.checked=!!a?.fl_consent,e.onchange=async()=>{try{await J({fl_consent:e.checked});let n=h();if(n&&(n.fl_consent=e.checked,localStorage.setItem("ateney_auth",JSON.stringify(n))),e.checked){let s=await k().catch(()=>null);s?.fl_server_url&&s.fl_server_url!=="not-configured"&&s.fl_server_url!=="offline"&&s.fl_auth_token&&q({serverUrl:s.fl_server_url,authToken:s.fl_auth_token})}else ke()}catch(n){alert("\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F: "+n)}}}let t=document.getElementById("serverPromptDisplay");t&&k().then(a=>{a?.fl_server_url&&a.fl_server_url!=="not-configured"&&a.fl_server_url!=="offline"?t.textContent="\u30B5\u30FC\u30D0\u30FC\u63A5\u7D9A\u4E2D\uFF08\u30B7\u30B9\u30C6\u30E0\u65E2\u5B9A\u30D7\u30ED\u30F3\u30D7\u30C8\u4F7F\u7528\u4E2D\uFF09":t.textContent="\u30B5\u30FC\u30D0\u30FC\u672A\u63A5\u7D9A"}).catch(()=>{t.textContent="\u30B5\u30FC\u30D0\u30FC\u672A\u63A5\u7D9A"})};document.getElementById("deleteAccountBtn2")?.addEventListener("click",async()=>{if(confirm(`\u672C\u5F53\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F

\u30FB\u30C1\u30E3\u30C3\u30C8\u5C65\u6B74
\u30FB\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC
\u30FB\u30B7\u30FC\u30F3
\u30FBRAG\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8
\u30FB\u30E6\u30FC\u30B6\u30FC\u30A2\u30AB\u30A6\u30F3\u30C8

\u3053\u308C\u3089\u306F\u5168\u3066\u5B8C\u5168\u306B\u524A\u9664\u3055\u308C\u3001\u5FA9\u5143\u3067\u304D\u307E\u305B\u3093\u3002`)&&confirm("\u6700\u7D42\u78BA\u8A8D\uFF1A\u672C\u5F53\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F"))try{await ae(),ye(),ee(),c=null,alert("\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002"),K(),V()}catch(e){alert("\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F: "+e)}});document.getElementById("menuHome")?.addEventListener("click",e=>{e.preventDefault(),f("home")});document.getElementById("menuWorks")?.addEventListener("click",e=>{e.preventDefault(),f("works")});document.getElementById("menuCharacters")?.addEventListener("click",e=>{e.preventDefault(),f("characters")});document.getElementById("menuScenes")?.addEventListener("click",e=>{e.preventDefault(),f("scenes")});document.getElementById("menuRag")?.addEventListener("click",e=>{e.preventDefault(),f("rag")});document.getElementById("menuChat")?.addEventListener("click",e=>{e.preventDefault(),f("chat")});document.getElementById("menuTopics")?.addEventListener("click",e=>{e.preventDefault(),f("topics")});document.getElementById("menuProfile")?.addEventListener("click",e=>{e.preventDefault(),f("profile")});document.getElementById("menuFed")?.addEventListener("click",e=>{e.preventDefault(),f("fed")});function f(e){switch(F(),e){case"home":pt();break;case"chat":_t();break;case"works":vt();break;case"characters":$();break;case"scenes":R();break;case"rag":I();break;case"topics":yt();break;case"profile":Et();break;case"fed":lt();break}}var L=[],x=!1,mt,Le={};async function _t(){if(!l)return;if(L.length===0){let r=await se(100).catch(()=>null);r?.messages&&(L=r.messages.reverse().map(o=>({role:o.role,content:o.content,adapter_value:o.adapter_value})))}let e=await H().catch(()=>({characters:[]}));Le={},e.characters.forEach(r=>{Le[r.id]={name:r.name,avatar:r.avatar_url}}),l.innerHTML=['<div class="chat-page">','  <div class="chat-topbar">','    <div class="chat-topbar__left">','      <span class="chat-topbar__label">\u30C1\u30E3\u30C3\u30C8</span>','      <span class="chat-topbar__badge" id="chatPieceCount">0 \u30D4\u30FC\u30B9</span>',"    </div>",'    <div class="chat-topbar__icons">','      <button class="chat-icon-btn" id="chatReloadBtn" title="\u4F1A\u8A71\u3092\u30EA\u30BB\u30C3\u30C8">\u21BA</button>',"    </div>","  </div>",'  <div class="chat-area" id="chatArea"></div>','  <div class="chat-input-bar">','    <input id="chatInput" class="chat-input-field" placeholder="\u30E1\u30C3\u30BB\u30FC\u30B8" autocomplete="off" />','    <button class="chat-star-btn" id="chatStarBtn" title="\uFF0A \u3092\u5165\u529B">\uFF0A</button>','    <button class="chat-send-btn" id="chatSendBtn" title="\u9001\u4FE1"'+(x?" disabled":"")+">\u25B6</button>","  </div>","</div>"].join(`
`),G(),document.getElementById("chatReloadBtn")?.addEventListener("click",()=>{confirm("\u4F1A\u8A71\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3059\u304B\uFF1F")&&(L=[],G())}),document.getElementById("chatStarBtn")?.addEventListener("click",()=>{let r=document.getElementById("chatInput");if(!r)return;let o=r.selectionStart??r.value.length,u=r.selectionEnd??r.value.length;r.value=r.value.slice(0,o)+"\uFF0A"+r.value.slice(u),r.focus(),r.selectionStart=r.selectionEnd=o+1});let t=document.getElementById("chatInput"),a=document.getElementById("chatSendBtn"),n=async()=>{if(!t||!a)return;let r=t.value.trim();if(!r||x)return;L.push({role:"user",content:r}),t.value="",x=!0,a.disabled=!0,G();let o=await re(r,mt);o?(L.push({role:"assistant",content:o.reply,adapter_value:o.adapter_value??null}),await j("user",r).catch(()=>{}),await j("assistant",o.reply,o.adapter_value??void 0).catch(()=>{})):L.push({role:"assistant",content:"\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u304C\u5FDC\u7B54\u3057\u3066\u3044\u307E\u305B\u3093\uFF08/api/chat/send \u672A\u5B9F\u88C5\uFF09",adapter_value:null}),x=!1,G(),a.disabled=!1};a?.addEventListener("click",n),t?.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),n())});let s=P(),i=document.getElementById("chatPieceCount");i&&(i.textContent=s.connected?"\u63A5\u7D9A\u4E2D":"\u672A\u63A5\u7D9A")}function G(){let e=document.getElementById("chatArea");if(!e)return;let t="";for(let n of L)n.role==="user"?t+='<div class="chat-bubble chat-bubble--user">'+z(n.content)+"</div>":t+=gt(n.content,n.adapter_value);x&&(t+='<div class="chat-bubble chat-bubble--loading">\u751F\u6210\u4E2D\u2026</div>'),e.innerHTML=t,e.scrollTop=e.scrollHeight;let a=document.getElementById("chatSendBtn");a&&(a.disabled=x)}function gt(e,t){let a=e.split(`
`),n="",s=null,i="",r=()=>{if(!i.trim()){i="";return}if(s?.type==="narrator")n+='<div class="chat-narrator"><div class="chat-narrator__icon">\u2261</div><div class="chat-narrator__text">'+z(i.trim())+"</div></div>";else if(s?.type==="character"){let o=s.avatar?'<img src="'+s.avatar+'" class="chat-char__avatar" />':'<div class="chat-char__avatar chat-char__avatar--placeholder">'+(s.name||"?")[0]+"</div>";n+='<div class="chat-char"><div class="chat-char__avatar-wrap">'+o+'</div><div class="chat-char__bubble">'+z(i.trim())+"</div></div>"}else n+='<div class="chat-bubble chat-bubble--ai">'+z(i.trim())+"</div>";i=""};for(let o of a){let u=o.match(/^@(?:ナレーター|narrator|):\s*(.*)/i),_=o.match(/^@([^\s:]+):\s*(.*)/);if(u)r(),s={type:"narrator"},i=u[1];else if(_&&!u){let m=_[1],E=Object.values(Le).find(Z=>Z.name===m);E?(r(),s={type:"character",name:m,avatar:E.avatar},i=_[2]):(r(),s={type:"character",name:m},i=_[2])}else i?i+=`
`+o:i=o}return r(),n}function z(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function pt(){if(!l)return;let e=await k().catch(()=>({fl_server_url:"offline",fl_token_required:!0})),t=await H().catch(()=>({characters:[]})),a=c?.userId??"?",n=c?.username||c?.name||"\u30E6\u30FC\u30B6\u30FC";l.innerHTML=`
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
    </div>`,l.querySelectorAll(".char-card").forEach(s=>{s.addEventListener("click",()=>{let i=s.dataset.id;i&&we(Number(i))})})}async function vt(){l&&(l.innerHTML=`
    <div class="works">
      <h2 class="works__title">\u4F5C\u54C1</h2>
      <div class="works__tabs">
        <button class="works__tab works__tab--active" data-tab="characters">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</button>
        <button class="works__tab" data-tab="scenes">\u30D7\u30EC\u30FC\u30B9</button>
        <button class="works__tab" data-tab="rag">RAG</button>
      </div>
      <div id="worksContent"></div>
    </div>`,l.querySelectorAll(".works__tab").forEach(e=>{e.addEventListener("click",()=>{l.querySelectorAll(".works__tab").forEach(a=>a.classList.remove("works__tab--active")),e.classList.add("works__tab--active");let t=e.dataset.tab;t==="characters"?$():t==="scenes"?R():t==="rag"&&I()})}),$())}async function $(){let e=document.getElementById("worksContent")||l;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{characters:t}=await ie();e.innerHTML=`
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
      </div>`,document.getElementById("btnNewChar")?.addEventListener("click",()=>We()),e.querySelectorAll("[data-action]").forEach(a=>{a.addEventListener("click",async n=>{n.stopPropagation();let s=a,i=Number(s.dataset.id);s.dataset.action==="edit"?we(i):s.dataset.action==="delete"&&confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await de(i),$())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function We(e){if(!l)return;let t=!!e;l.innerHTML=`
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
    </div>`,document.getElementById("charCancel")?.addEventListener("click",()=>$()),document.getElementById("charSave")?.addEventListener("click",async()=>{let a={name:document.getElementById("charName").value,avatar_url:document.getElementById("charAvatar").value||null,description:document.getElementById("charDesc").value||null,personality:document.getElementById("charPersonality").value||null,system_prompt:document.getElementById("charSystemPrompt").value||null,greeting:document.getElementById("charGreeting").value||null,tags:document.getElementById("charTags").value||null,is_public:document.getElementById("charPublic").checked?1:0};try{e?.id?await ce(e.id,a):await le(a),$()}catch(n){M(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${n}`)}})}async function we(e){try{let{character:t}=await oe(e);We(t)}catch(t){M(`\u53D6\u5F97\u30A8\u30E9\u30FC: ${t}`)}}async function R(){let e=document.getElementById("worksContent")||l;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{scenes:t}=await ue();e.innerHTML=`
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
      </div>`,document.getElementById("btnNewScene")?.addEventListener("click",()=>ft()),e.querySelectorAll('[data-action="delete-scene"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await _e(n),R())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function ft(){l&&(l.innerHTML=`
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
    </div>`,document.getElementById("sceneCancel")?.addEventListener("click",()=>R()),document.getElementById("sceneSave")?.addEventListener("click",async()=>{try{await me({name:document.getElementById("sceneName").value,setting:document.getElementById("sceneSetting").value,context:document.getElementById("sceneContext").value,mood:document.getElementById("sceneMood").value,is_public:document.getElementById("scenePublic").checked?1:0}),R()}catch(e){M(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${e}`)}}))}async function I(){let e=document.getElementById("worksContent")||l;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{documents:t}=await ge();e.innerHTML=`
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
      </div>`,document.getElementById("btnNewRag")?.addEventListener("click",()=>bt()),document.getElementById("btnBulkRag")?.addEventListener("click",()=>ht()),e.querySelectorAll('[data-action="delete-rag"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await fe(n),I())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function bt(){l&&(l.innerHTML=`
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
    </div>`,document.getElementById("ragCancel")?.addEventListener("click",()=>I()),document.getElementById("ragSave")?.addEventListener("click",async()=>{try{await pe({title:document.getElementById("ragTitle").value,source:document.getElementById("ragSource").value,content:document.getElementById("ragContent").value}),I()}catch(e){M(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${e}`)}}))}function ht(){l&&(l.innerHTML=`
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
    </div>`,document.getElementById("bulkRagCancel")?.addEventListener("click",()=>I()),document.getElementById("bulkRagImport")?.addEventListener("click",async()=>{try{let e=document.getElementById("bulkRagJson").value,t=JSON.parse(e),a=await ve(t);alert(`${a.imported}\u4EF6\u30A4\u30F3\u30DD\u30FC\u30C8\u5B8C\u4E86`),I()}catch(e){M(`\u30A4\u30F3\u30DD\u30FC\u30C8\u30A8\u30E9\u30FC: ${e}`)}}))}async function yt(){if(l){l.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{characters:e}=await H();l.innerHTML=`
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
      </div>`,l.querySelectorAll(".topic-card").forEach(t=>{t.addEventListener("click",()=>{let a=t.dataset.id;a&&we(Number(a))})})}catch(e){l.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${e}</p>`}}}async function Et(){if(l){l.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{user:e}=await ne();l.innerHTML=`
      <div class="profile">
        <h2 class="profile__title">\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB</h2>
        <div class="profile__card">
          ${e.avatar_url?`<img src="${e.avatar_url}" class="profile__avatar" />`:'<div class="profile__avatar profile__avatar--placeholder"></div>'}
          <div class="profile__info">
            <p class="profile__name">${e.username||e.name}</p>
            <p class="profile__email">${e.email}</p>
            <p class="profile__userid">ID: #${e.id}</p>
            ${e.birth_date?`<p class="profile__since">\u751F\u5E74\u6708\u65E5: ${e.birth_date}</p>`:""}
            <p class="profile__since">\u767B\u9332\u65E5: ${e.created_at?.slice(0,10)||""}</p>
          </div>
        </div>
      </div>`}catch(e){l.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${e}</p>`}}}function M(e){if(l){let t=document.createElement("div");t.className="error-banner",t.textContent=e,l.prepend(t),setTimeout(()=>t.remove(),5e3)}}K();Re();var Ie=!1;async function je(){if(Ie)return;let e=P();if(e.connected||e.connecting)return;let t=await k().catch(()=>null);!t||!t.fl_server_url||t.fl_server_url==="not-configured"||t.fl_server_url==="offline"||t.fl_auth_token&&(Ie=!0,q({serverUrl:t.fl_server_url,authToken:t.fl_auth_token}))}$e()&&(f("home"),h()?.fl_consent&&(je(),setInterval(()=>{let t=P();!t.connected&&!t.connecting&&(Ie=!1,je())},15e3)));})();

"use strict";(()=>{var Ne=Object.defineProperty;var Re=(e,t)=>()=>(e&&(t=e(e=0)),t);var Fe=(e,t)=>{for(var a in t)Ne(e,a,{get:t[a],enumerable:!0})};var le={};Fe(le,{authLogin:()=>Oe,bulkImportRag:()=>re,clearApiToken:()=>q,clearChat:()=>We,createCharacter:()=>Q,createRagDoc:()=>ie,createScene:()=>ne,deleteAccount:()=>Y,deleteCharacter:()=>ee,deleteRagDoc:()=>oe,deleteScene:()=>ae,getApiToken:()=>pe,getCharacter:()=>Z,getCharacters:()=>V,getChatHistory:()=>Ue,getFlStatus:()=>R,getPublicCharacters:()=>N,getRagDocs:()=>se,getScenes:()=>te,getUser:()=>z,saveChat:()=>Je,setApiToken:()=>D,updateCharacter:()=>X,updateProfile:()=>K,updateScene:()=>je});function pe(){return localStorage.getItem(j)}function D(e){localStorage.setItem(j,e)}function q(){localStorage.removeItem(j)}async function c(e,t={}){let a=pe(),n={"Content-Type":"application/json",...t.headers||{}};a&&(n.Authorization=`Bearer ${a}`);let s=await fetch(`${ge}${e}`,{...t,headers:n});if(!s.ok)throw console.warn(`[ateney] API ${s.status}: ${e}`),new Error(`API ${s.status}`);return s.json()}async function G(e,t={}){try{return await c(e,t)}catch{return null}}async function Oe(e){return c("/auth/login",{method:"POST",body:JSON.stringify({id_token:e})})}async function z(){return c("/user")}async function Y(){return c("/user",{method:"DELETE"})}async function K(e){return c("/user/profile",{method:"PUT",body:JSON.stringify(e)})}async function Ue(e=50,t=0){return G(`/chat/history?limit=${e}&offset=${t}`)}async function Je(e,t,a){return G("/chat/save",{method:"POST",body:JSON.stringify({role:e,content:t,adapter_value:a})})}async function We(){return G("/chat/clear",{method:"DELETE"})}async function V(){return c("/characters")}async function N(){return c("/characters/public")}async function Z(e){return c(`/characters/${e}`)}async function Q(e){return c("/characters",{method:"POST",body:JSON.stringify(e)})}async function X(e,t){return c(`/characters/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function ee(e){return c(`/characters/${e}`,{method:"DELETE"})}async function te(e){let t=e?`?character_id=${e}`:"";return c(`/scenes${t}`)}async function ne(e){return c("/scenes",{method:"POST",body:JSON.stringify(e)})}async function je(e,t){return c(`/scenes/${e}`,{method:"PUT",body:JSON.stringify(t)})}async function ae(e){return c(`/scenes/${e}`,{method:"DELETE"})}async function se(e){let t=e?`?character_id=${e}`:"";return c(`/rag${t}`)}async function ie(e){return c("/rag",{method:"POST",body:JSON.stringify(e)})}async function re(e){return c("/rag/bulk",{method:"POST",body:JSON.stringify({documents:e})})}async function oe(e){return c(`/rag/${e}`,{method:"DELETE"})}async function R(){let e=await fetch(`${ge}/fl/status`);return e.ok?e.json():{fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0}}var ge,j,F=Re(()=>{"use strict";ge="https://ateney-api.ateney-ai.workers.dev/api",j="ateney_jwt"});F();var de="ateney_auth";function S(){try{let e=localStorage.getItem(de);return e?JSON.parse(e):null}catch{return null}}function qe(e){localStorage.setItem(de,JSON.stringify(e))}function O(){localStorage.removeItem(de)}function ve(){return S()!==null}function Ge(e){let t=e.replace(/-/g,"+").replace(/_/g,"/"),a=t.length%4;return a&&(t+="=".repeat(4-a)),atob(t)}function be(e,t,a){let n=document.createElement("script");n.src="https://accounts.google.com/gsi/client",n.async=!0,n.defer=!0,n.onload=()=>{let s=document.getElementById(e);s&&(window.google.accounts.id.initialize({client_id:"610487938019-8n4ohpj2qnm9uent2jhglaoemj0q7h3g",callback:async r=>{try{let l=r.credential.split(".");if(l.length<2){a?.("Invalid JWT");return}let d=JSON.parse(Ge(l[1])),{authLogin:p,setApiToken:v}=await Promise.resolve().then(()=>(F(),le)),_=await p(r.credential);v(_.token);let C={provider:"google",id:d.sub,name:_.user.username||_.user.name||d.name,email:_.user.email||d.email,avatar:_.user.avatar_url||d.picture,token:_.token,needs_onboarding:_.user.needs_onboarding,username:_.user.username,userId:_.user.id};qe(C),t(C)}catch(l){console.error("[ateney] Login failed:",l),a?.(l.message||"\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F")}}}),window.google.accounts.id.renderButton(s,{theme:"outline",size:"large",text:"continue_with",locale:"ja"}))},document.head.appendChild(n)}function fe(){let e=new URLSearchParams({response_type:"code",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:Ee(),scope:"profile openid email"});window.location.href=`https://access.line.me/oauth2/v2.1/authorize?${e.toString()}`}function he(){let e=new URLSearchParams({response_type:"code id_token",client_id:"",redirect_uri:`${window.location.origin}/auth/callback`,state:Ee(),scope:"name email",response_mode:"form_post"});window.location.href=`https://appleid.apple.com/auth/authorize?${e.toString()}`}function ye(){S()?.provider==="google"&&window.google?.accounts?.id?.disableAutoSelect?.(),O(),Promise.resolve().then(()=>(F(),le)).then(({clearApiToken:t})=>t())}function Ee(){let e=new Uint8Array(32);return crypto.getRandomValues(e),Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}var h=null,E=null,k=null,L=null,w=null,g=null,ce,m={connected:!1,connecting:!1,backend:"...",clientId:"",rank:"-",role:"-",rounds:0,lossHistory:[],lastLoss:null,banned:!1,banRemaining:0,log:[]},Le=null;function ze(){let e=localStorage.getItem("fedClientId");return e||(e=crypto.randomUUID(),localStorage.setItem("fedClientId",e)),e}function Ie(e){ce=ze(),m.clientId=ce,Le=e??null,e?.(m)}function f(e){m={...m,...e},Le?.(m)}function u(e){let t=`[${new Date().toLocaleTimeString()}] ${e}`;m.log=[...m.log.slice(-49),t],f({log:m.log})}async function Ye(){try{await tf.setBackend("webgpu"),await tf.ready()}catch{try{await tf.setBackend("webgl"),await tf.ready()}catch{await tf.setBackend("cpu"),await tf.ready()}}return tf.getBackend()}function ke(e,t){h&&(h.dispose(),E.dispose(),k.dispose(),L.dispose()),w=e,t?(h=tf.variable(tf.tensor(t.W1,[w,8])),E=tf.variable(tf.tensor(t.b1,[8])),k=tf.variable(tf.tensor(t.W2,[8,1])),L=tf.variable(tf.tensor(t.b2,[1]))):(h=tf.variable(tf.randomNormal([w,8],0,.05)),E=tf.variable(tf.zeros([8])),k=tf.variable(tf.randomNormal([8,1],0,.05)),L=tf.variable(tf.zeros([1])))}function Te(e){let t=tf.relu(tf.add(tf.matMul(e,h),E));return tf.add(tf.matMul(t,k),L)}async function Ke(e,t,a=30,n=.05){let s=tf.tensor(e,[e.length,w]),r=tf.tensor(t,[t.length,1]),l=0,d=tf.train.adam(n);for(let p=0;p<a;p++)d.minimize(()=>{let v=Te(s),_=tf.losses.meanSquaredError(r,v);return l=_.dataSync()[0],_},!0,[h,E,k,L]);return s.dispose(),r.dispose(),l}function Ve(){return{W1:Array.from(h.dataSync()),b1:Array.from(E.dataSync()),W2:Array.from(k.dataSync()),b2:Array.from(L.dataSync())}}async function Se(e){if(g&&g.readyState===WebSocket.OPEN)return;f({connecting:!0,log:[]}),u("TensorFlow.js \u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u521D\u671F\u5316\u4E2D...");let t=await Ye();u(`\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9: ${t}`),f({backend:t}),u(`\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u4E2D: ${e.serverUrl}`),g=new WebSocket(e.serverUrl),g.onopen=()=>{u("\u63A5\u7D9A\u6210\u529F \u2014 \u8A8D\u8A3C\u9001\u4FE1\u4E2D..."),f({connected:!0,connecting:!1}),g.send(JSON.stringify({type:"hello",id:ce,kind:"worker",token:e.authToken}))},g.onclose=a=>{a.code===4002?u("\u8A8D\u8A3C\u5931\u6557: \u30C8\u30FC\u30AF\u30F3\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093"):a.code===4003?u("\u63A5\u7D9A\u62D2\u5426: \u8A31\u53EF\u3055\u308C\u3066\u3044\u306A\u3044IP\u3067\u3059"):u(`\u5207\u65AD (code=${a.code})`),f({connected:!1,connecting:!1,rank:"-",role:"-"}),g=null},g.onerror=()=>u("\u63A5\u7D9A\u30A8\u30E9\u30FC"),g.onmessage=async a=>{let n=JSON.parse(a.data);if(n.type==="hello_ack"){u(`\u8A8D\u8A3C\u6210\u529F \u2014 \u30E9\u30F3\u30AF: ${n.rank}, \u30ED\u30FC\u30EB: ${n.role}`),f({rank:n.rank,role:n.role,banned:!1});return}if(n.type==="banned"){u(`\u30EF\u30FC\u30AB\u30FC\u8CC7\u683C\u505C\u6B62\u4E2D (\u6B8B\u308A${n.remaining_seconds}\u79D2)`),f({banned:!0,banRemaining:n.remaining_seconds,rank:"F"});return}if(n.type==="round"){u(`\u30E9\u30A6\u30F3\u30C9 ${n.round} \u53D7\u4FE1 (${n.features.length}\u4EF6, dim=${n.embed_dim})`),ke(n.embed_dim,n.global_weights);let s=await Ke(n.features,n.targets),r=Ve();g.send(JSON.stringify({type:"update",weights:r,n:n.features.length,loss:s})),m.rounds++,m.lossHistory=[...m.lossHistory.slice(-19),s],u(`\u91CD\u307F\u9001\u4FE1\u5B8C\u4E86 \u2014 loss=${s.toFixed(4)} (\u7D2F\u8A08${m.rounds}\u30E9\u30A6\u30F3\u30C9)`),f({rounds:m.rounds,lossHistory:m.lossHistory,lastLoss:s});return}if(n.type==="infer"){u("\u63A8\u8AD6\u30EA\u30AF\u30A8\u30B9\u30C8\u53D7\u4FE1"),h||ke(n.embed_dim,n.global_weights||null);let s=tf.tensor(n.features,[n.features.length,w]),r=Te(s),l=r.dataSync()[0];s.dispose(),r.dispose(),g.send(JSON.stringify({type:"infer_result",value:l})),u(`\u63A8\u8AD6\u7D50\u679C\u9001\u4FE1: ${l.toFixed(4)}`);return}if(n.type==="error"){u(`[\u30A8\u30E9\u30FC] ${n.message}`);return}}}function we(){g&&(g.close(),g=null),f({connected:!1,connecting:!1,rank:"-",role:"-"}),u("\u624B\u52D5\u5207\u65AD")}function xe(){return m}var $e=document.getElementById("loginScreen"),x=document.getElementById("accountIcon"),U=document.getElementById("settingsName"),Be=document.getElementById("settingsEmail"),He=document.getElementById("settingsAvatar"),i=document.getElementById("main-content"),o=null;function M(){o=S(),o?($e?.classList.add("hidden"),x&&(x.style.display="flex"),U&&(U.textContent=o.username||o.name),Be&&(Be.textContent=o.email??""),He&&o.avatar&&(He.innerHTML=`<img src="${o.avatar}" alt="${o.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`),o.needs_onboarding?Ze():b("home")):($e?.classList.remove("hidden"),x&&(x.style.display="none"))}function Ze(){if(!i)return;let e=1;i.innerHTML=`
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
          <div class="onboarding__hint">\u3042\u306A\u305F\u306E\u30E6\u30FC\u30B6\u30FCID: #${o?.userId??"?"}</div>
          <button class="btn-primary onboarding__next" id="onboardNext1">\u6B21\u3078</button>
        </div>
      </div>
    </div>`,document.getElementById("onboardNext1")?.addEventListener("click",()=>{let t=document.getElementById("onboardUsername").value.trim();if(!t){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(t.length>20){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F20\u6587\u5B57\u4EE5\u5185\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}if(!/^[a-zA-Z0-9_-]+$/.test(t)){alert("\u30E6\u30FC\u30B6\u30FC\u540D\u306F\u82F1\u6570\u5B57\u3001_\u3001- \u306E\u307F\u4F7F\u7528\u3067\u304D\u307E\u3059");return}Qe(t)}),document.getElementById("onboardUsername")?.addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("onboardNext1")?.click()})}function Qe(e){if(!i)return;i.innerHTML=`
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
    </div>`,document.querySelectorAll("[data-dial]").forEach(a=>{a.addEventListener("click",()=>{let n=a.dataset.dial,[s,r]=n.split("-"),l=document.getElementById(s==="year"?"dialYear":s==="month"?"dialMonth":"dialDay"),d=parseInt(l.value),p=parseInt(l.min),v=parseInt(l.max);r==="up"?d=d>=v?p:d+1:d=d<=p?v:d-1,l.value=String(d)})}),document.getElementById("onboardNext2")?.addEventListener("click",()=>{let a=document.getElementById("dialYear").value,n=document.getElementById("dialMonth").value.padStart(2,"0"),s=document.getElementById("dialDay").value.padStart(2,"0"),r=`${a}-${n}-${s}`;if(!r){alert("\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}let l=new Date,d=new Date(r),p=l.getFullYear()-d.getFullYear(),v=l.getMonth()-d.getMonth();if((v<0||v===0&&l.getDate()<d.getDate())&&p--,p<13){alert("ateney\u306F13\u6B73\u4EE5\u4E0A\u304C\u5BFE\u8C61\u3067\u3059");return}if(p>120){alert("\u6B63\u3057\u3044\u751F\u5E74\u6708\u65E5\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");return}Xe(e,r)})}function Xe(e,t){i&&(i.innerHTML=`
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
    </div>`,document.getElementById("onboardFinish")?.addEventListener("click",async()=>{let a=document.getElementById("flYes").checked,n=document.getElementById("onboardFinish");n.disabled=!0,n.textContent="\u4FDD\u5B58\u4E2D\u2026";try{let s=await K({username:e,birth_date:t,fl_consent:a});if(s.token&&D(s.token),o){o.username=e,o.needs_onboarding=!1,o.userId=s.user?.id??o.userId,o.token=s.token||o.token;let r=S();r&&(r.username=e,r.needs_onboarding=!1,r.userId=s.user?.id??r.userId,r.token=s.token||r.token,localStorage.setItem("ateney_auth",JSON.stringify(r)))}U&&(U.textContent=e),b("home")}catch(s){alert(`\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${s}`),n.disabled=!1,n.textContent="\u5B8C\u4E86"}}))}be("googleLoginBtn",e=>{D(e.token),o=e,M()},e=>{T(e)});async function et(){if(!i)return;let e=await R().catch(()=>({fl_server_url:"offline",fl_auth_token:null,fl_token_required:!0})),t=e.fl_server_url==="not-configured"||e.fl_server_url==="offline"?"":e.fl_server_url,a=e.fl_auth_token||"",n=xe();t&&a&&!n.connected&&!n.connecting&&Se({serverUrl:t,authToken:a});let s=n.banned?'<div class="fed__detail fed__detail--warn">\u6B8B\u308A '+n.banRemaining+"\u79D2</div>":"",r=n.lossHistory.length>0?'<div class="fed__chart"><div class="fed__card-header">Loss\u63A8\u79FB</div><div class="fed__loss-chart">'+n.lossHistory.map((A,Ae)=>{let De=Math.max(...n.lossHistory,1);return'<div class="fed__loss-bar" style="height:'+A/De*100+'%" title="R'+(Ae+1)+": "+A.toFixed(4)+'"></div>'}).join("")+"</div></div>":"",l=n.log.map(A=>'<div class="fed__log-line">'+A+"</div>").join(""),d=n.connected?"fed__status-dot--online":n.connecting?"fed__status-dot--connecting":"fed__status-dot--offline",p=n.connected?"\u63A5\u7D9A\u4E2D":n.connecting?"\u63A5\u7D9A\u4E2D...":"\u672A\u63A5\u7D9A",v=n.banned?"F (\u505C\u6B62\u4E2D)":n.rank,_=n.lastLoss!==null?n.lastLoss.toFixed(4):"-",C=n.connected?"":"disabled",Ce=t?"":'<div class="fed__offline-msg">FL\u30B5\u30FC\u30D0\u30FC\u304C\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3059\u3002\u30B5\u30FC\u30D0\u30FC\u304C\u8D77\u52D5\u3059\u308B\u3068\u81EA\u52D5\u63A5\u7D9A\u3057\u307E\u3059\u3002</div>';i.innerHTML=['<div class="fed">','  <h2 class="fed__title">\u26A1 Federated Learning</h2>','  <p class="fed__subtitle">\u30D6\u30E9\u30A6\u30B6\u4E0A\u3067AI\u30A2\u30C0\u30D7\u30BF\u306E\u5B66\u7FD2\u306B\u53C2\u52A0</p>','  <div class="fed__grid">','    <div class="fed__card">','      <div class="fed__card-header">\u63A5\u7D9A\u72B6\u614B</div>','      <div class="fed__status-row">','        <span class="fed__status-dot '+d+'"></span>',"        <span>"+p+"</span>","      </div>",'      <div class="fed__detail">Backend: <strong>'+n.backend+"</strong></div>",'      <div class="fed__detail">Client: <strong>'+n.clientId.slice(0,8)+"</strong></div>","    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u30E9\u30F3\u30AF</div>','      <div class="fed__rank '+(n.banned?"fed__rank--banned":"")+'">'+v+"</div>",'      <div class="fed__detail">\u30ED\u30FC\u30EB: <strong>'+n.role+"</strong></div>","      "+s,"    </div>",'    <div class="fed__card">','      <div class="fed__card-header">\u5B66\u7FD2\u30E9\u30A6\u30F3\u30C9</div>','      <div class="fed__stat-num">'+n.rounds+"</div>",'      <div class="fed__detail">\u6700\u7D42loss: <strong>'+_+"</strong></div>","    </div>","  </div>","  "+r,"  "+Ce,'  <div class="fed__controls">','    <button class="btn-secondary" id="flDisconnectBtn" '+C+">\u5207\u65AD</button>","  </div>",'  <div class="fed__log-wrap">','    <div class="fed__card-header">\u30ED\u30B0</div>','    <div class="fed__log" id="flLog">'+l+"</div>","  </div>",'  <div class="fed__info">',"    <p>\u3053\u306E\u30DA\u30FC\u30B8\u3092\u958B\u3044\u3066\u3044\u308B\u9593\u3001\u3042\u306A\u305F\u306E\u30D6\u30E9\u30A6\u30B6\u304CAI\u30E2\u30C7\u30EB\u306E\u5FAE\u8ABF\u6574\u306B\u53C2\u52A0\u3057\u307E\u3059\u3002</p>","    <p>\u5B66\u7FD2\u30C7\u30FC\u30BF\u306F\u30B5\u30FC\u30D0\u30FC\u304B\u3089\u914D\u4FE1\u3055\u308C\u3001\u91CD\u307F\u306E\u66F4\u65B0\u7D50\u679C\u306E\u307F\u304C\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002</p>","    <p>\u30D6\u30E9\u30A6\u30B6\u306EGPU (WebGPU/WebGL) \u3092\u4F7F\u7528\u3057\u3066\u30ED\u30FC\u30AB\u30EB\u5B66\u7FD2\u3092\u884C\u3044\u307E\u3059\u3002</p>","  </div>","</div>"].join(`
`),document.getElementById("flDisconnectBtn")?.addEventListener("click",()=>{we()});let W=document.getElementById("flLog");W&&(W.scrollTop=W.scrollHeight)}document.getElementById("lineLoginBtn")?.addEventListener("click",()=>fe());document.getElementById("appleLoginBtn")?.addEventListener("click",()=>he());document.getElementById("logoutBtn")?.addEventListener("click",()=>{ye(),o=null,M(),me()});var $=document.getElementById("hamburger"),B=document.getElementById("sideMenu"),ue=document.getElementById("overlay");function tt(){B?.classList.contains("open")?P():nt()}function nt(){B?.classList.add("open"),ue?.classList.add("show"),$?.classList.add("open"),$?.setAttribute("aria-expanded","true"),B?.setAttribute("aria-hidden","false")}function P(){document.activeElement?.blur(),B?.classList.remove("open"),ue?.classList.remove("show"),$?.classList.remove("open"),$?.setAttribute("aria-expanded","false"),B?.setAttribute("aria-hidden","true")}$?.addEventListener("click",tt);ue?.addEventListener("click",P);document.addEventListener("keydown",e=>{e.key==="Escape"&&(P(),me())});var J=document.getElementById("settings"),at=document.getElementById("settingsBack");function Me(){J?.classList.add("open"),J?.setAttribute("aria-hidden","false"),P()}function me(){document.activeElement?.blur(),J?.classList.remove("open"),J?.setAttribute("aria-hidden","true")}x?.addEventListener("click",Me);at?.addEventListener("click",me);document.getElementById("menuSettings")?.addEventListener("click",e=>{e.preventDefault(),Me()});document.getElementById("menuHome")?.addEventListener("click",e=>{e.preventDefault(),b("home")});document.getElementById("menuWorks")?.addEventListener("click",e=>{e.preventDefault(),b("works")});document.getElementById("menuCharacters")?.addEventListener("click",e=>{e.preventDefault(),b("characters")});document.getElementById("menuScenes")?.addEventListener("click",e=>{e.preventDefault(),b("scenes")});document.getElementById("menuRag")?.addEventListener("click",e=>{e.preventDefault(),b("rag")});document.getElementById("menuTopics")?.addEventListener("click",e=>{e.preventDefault(),b("topics")});document.getElementById("menuProfile")?.addEventListener("click",e=>{e.preventDefault(),b("profile")});document.getElementById("menuFed")?.addEventListener("click",e=>{e.preventDefault(),b("fed")});function b(e){switch(P(),e){case"home":st();break;case"works":it();break;case"characters":I();break;case"scenes":H();break;case"rag":y();break;case"topics":dt();break;case"profile":ct();break;case"fed":et();break}}async function st(){if(!i)return;let e=await R().catch(()=>({fl_server_url:"offline",fl_token_required:!0})),t=await N().catch(()=>({characters:[]})),a=o?.userId??"?",n=o?.username||o?.name||"\u30E6\u30FC\u30B6\u30FC";i.innerHTML=`
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
    </div>`,i.querySelectorAll(".char-card").forEach(s=>{s.addEventListener("click",()=>{let r=s.dataset.id;r&&_e(Number(r))})})}async function it(){i&&(i.innerHTML=`
    <div class="works">
      <h2 class="works__title">\u4F5C\u54C1</h2>
      <div class="works__tabs">
        <button class="works__tab works__tab--active" data-tab="characters">\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC</button>
        <button class="works__tab" data-tab="scenes">\u30D7\u30EC\u30FC\u30B9</button>
        <button class="works__tab" data-tab="rag">RAG</button>
      </div>
      <div id="worksContent"></div>
    </div>`,i.querySelectorAll(".works__tab").forEach(e=>{e.addEventListener("click",()=>{i.querySelectorAll(".works__tab").forEach(a=>a.classList.remove("works__tab--active")),e.classList.add("works__tab--active");let t=e.dataset.tab;t==="characters"?I():t==="scenes"?H():t==="rag"&&y()})}),I())}async function I(){let e=document.getElementById("worksContent")||i;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{characters:t}=await V();e.innerHTML=`
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
      </div>`,document.getElementById("btnNewChar")?.addEventListener("click",()=>Pe()),e.querySelectorAll("[data-action]").forEach(a=>{a.addEventListener("click",async n=>{n.stopPropagation();let s=a,r=Number(s.dataset.id);s.dataset.action==="edit"?_e(r):s.dataset.action==="delete"&&confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await ee(r),I())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function Pe(e){if(!i)return;let t=!!e;i.innerHTML=`
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
    </div>`,document.getElementById("charCancel")?.addEventListener("click",()=>I()),document.getElementById("charSave")?.addEventListener("click",async()=>{let a={name:document.getElementById("charName").value,avatar_url:document.getElementById("charAvatar").value||null,description:document.getElementById("charDesc").value||null,personality:document.getElementById("charPersonality").value||null,system_prompt:document.getElementById("charSystemPrompt").value||null,greeting:document.getElementById("charGreeting").value||null,tags:document.getElementById("charTags").value||null,is_public:document.getElementById("charPublic").checked?1:0};try{e?.id?await X(e.id,a):await Q(a),I()}catch(n){T(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${n}`)}})}async function _e(e){try{let{character:t}=await Z(e);Pe(t)}catch(t){T(`\u53D6\u5F97\u30A8\u30E9\u30FC: ${t}`)}}async function H(){let e=document.getElementById("worksContent")||i;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{scenes:t}=await te();e.innerHTML=`
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
      </div>`,document.getElementById("btnNewScene")?.addEventListener("click",()=>rt()),e.querySelectorAll('[data-action="delete-scene"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await ae(n),H())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function rt(){i&&(i.innerHTML=`
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
    </div>`,document.getElementById("sceneCancel")?.addEventListener("click",()=>H()),document.getElementById("sceneSave")?.addEventListener("click",async()=>{try{await ne({name:document.getElementById("sceneName").value,setting:document.getElementById("sceneSetting").value,context:document.getElementById("sceneContext").value,mood:document.getElementById("sceneMood").value,is_public:document.getElementById("scenePublic").checked?1:0}),H()}catch(e){T(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${e}`)}}))}async function y(){let e=document.getElementById("worksContent")||i;if(e){e.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{documents:t}=await se();e.innerHTML=`
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
      </div>`,document.getElementById("btnNewRag")?.addEventListener("click",()=>ot()),document.getElementById("btnBulkRag")?.addEventListener("click",()=>lt()),e.querySelectorAll('[data-action="delete-rag"]').forEach(a=>{a.addEventListener("click",async()=>{let n=Number(a.dataset.id);confirm("\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F")&&(await oe(n),y())})})}catch(t){e.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${t}</p>`}}}function ot(){i&&(i.innerHTML=`
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
    </div>`,document.getElementById("ragCancel")?.addEventListener("click",()=>y()),document.getElementById("ragSave")?.addEventListener("click",async()=>{try{await ie({title:document.getElementById("ragTitle").value,source:document.getElementById("ragSource").value,content:document.getElementById("ragContent").value}),y()}catch(e){T(`\u4FDD\u5B58\u30A8\u30E9\u30FC: ${e}`)}}))}function lt(){i&&(i.innerHTML=`
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
    </div>`,document.getElementById("bulkRagCancel")?.addEventListener("click",()=>y()),document.getElementById("bulkRagImport")?.addEventListener("click",async()=>{try{let e=document.getElementById("bulkRagJson").value,t=JSON.parse(e),a=await re(t);alert(`${a.imported}\u4EF6\u30A4\u30F3\u30DD\u30FC\u30C8\u5B8C\u4E86`),y()}catch(e){T(`\u30A4\u30F3\u30DD\u30FC\u30C8\u30A8\u30E9\u30FC: ${e}`)}}))}async function dt(){if(i){i.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{characters:e}=await N();i.innerHTML=`
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
      </div>`,i.querySelectorAll(".topic-card").forEach(t=>{t.addEventListener("click",()=>{let a=t.dataset.id;a&&_e(Number(a))})})}catch(e){i.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${e}</p>`}}}async function ct(){if(i){i.innerHTML='<p class="main__loading">\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026</p>';try{let{user:e}=await z();i.innerHTML=`
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
      </div>`}catch(e){i.innerHTML=`<p class="main__loading">\u30A8\u30E9\u30FC: ${e}</p>`}}}document.getElementById("signoutBtn")?.addEventListener("click",()=>{O(),o=null,M()});document.getElementById("deleteAccountBtn")?.addEventListener("click",async()=>{if(confirm(`\u672C\u5F53\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F

\u30FB\u30C1\u30E3\u30C3\u30C8\u5C65\u6B74
\u30FB\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC
\u30FB\u30B7\u30FC\u30F3
\u30FBRAG\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8
\u30FB\u30E6\u30FC\u30B6\u30FC\u30A2\u30AB\u30A6\u30F3\u30C8

\u3053\u308C\u3089\u306F\u5168\u3066\u5B8C\u5168\u306B\u524A\u9664\u3055\u308C\u3001\u5FA9\u5143\u3067\u304D\u307E\u305B\u3093\u3002`)&&confirm("\u6700\u7D42\u78BA\u8A8D\uFF1A\u672C\u5F53\u306B\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F"))try{await Y(),O(),q(),o=null,alert("\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002"),M()}catch(e){alert("\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F: "+e)}});function T(e){if(i){let t=document.createElement("div");t.className="error-banner",t.textContent=e,i.prepend(t),setTimeout(()=>t.remove(),5e3)}}M();Ie();ve()&&b("home");})();

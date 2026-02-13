// -------------------------------
// Front-end App Logic (No Backend)
// -------------------------------

// ==== Config ====
// User creds (view site content)
const VALID_USERNAME = "sathya";
const VALID_PASSWORD = "love";

// Backend base (Flask on 8082)
const BASE_HOST = `${location.protocol}//${location.hostname}`;
const REPLY_ENDPOINT   = `${BASE_HOST}:8082/reply`;
const REPLIES_ENDPOINT = `${BASE_HOST}:8082/replies`; // GET (view), /download (file), POST /clear

// ======= DOM REFS =======
const loginScreen      = document.getElementById("loginScreen");
const homeScreen       = document.getElementById("homeScreen");
const mailIconPopup    = document.getElementById("mailIconPopup");
const letterPopup      = document.getElementById("letterPopup");
const loveLetterPopup  = document.getElementById("loveLetterPopup");
const loveLetterContainer = document.getElementById("loveLetterContainer");
const dateStamp        = document.getElementById("dateStamp");
const replyPopup       = document.getElementById("replyPopup");
const adminLoginPopup  = document.getElementById("adminLoginPopup");
const adminPopup       = document.getElementById("adminPopup");

const adminReplies     = document.getElementById("adminReplies");
const adminStatus      = document.getElementById("adminStatus");
const nightSky         = document.getElementById("nightSky");
const globalBackBtn    = document.getElementById("globalBack");
const toastEl          = document.getElementById("toast");

const replyText        = document.getElementById("replyText");
const replyStatus      = document.getElementById("replyStatus");
const sendReplyBtn     = document.getElementById("sendReplyBtn");
const bgMusic          = document.getElementById("bgMusic");

let adminAuthToken = null; // Admin Basic token
const navStack = [];

// Toast
function showToast(msg, duration = 2000) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), duration);
}

// Music
async function startMusic() {
  if (!bgMusic) return;
  try { await bgMusic.play(); }
  catch (_) {
    showToast("Tap anywhere to enable music 🎵", 2500);
    const resume = () => { bgMusic.play().catch(() => {}); document.removeEventListener("click", resume); document.removeEventListener("keydown", resume); document.removeEventListener("touchstart", resume); };
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("keydown", resume, { once: true });
    document.addEventListener("touchstart", resume, { once: true });
  }
}

// Login
async function login() {
  const u = (document.getElementById("username").value || "").trim().toLowerCase();
  const p = (document.getElementById("password").value || "").trim();
  const wait = document.getElementById("loginWait");
  const err  = document.getElementById("loginError");
  wait.textContent = "Checking…"; err.textContent = "";
  await new Promise((r) => setTimeout(r, 300));
  if (u === VALID_USERNAME && p === VALID_PASSWORD) { wait.textContent = "Welcome ❤️"; showHome(); startMusic(); }
  else { wait.textContent = ""; err.textContent = "Invalid username or password. Try again."; }
}

// Nav helpers
function updateBackButtonVisibility(){ globalBackBtn.hidden = navStack.length === 0; }
function navBack(){
  const prev = navStack.pop();
  closePopup(letterPopup); closePopup(loveLetterPopup); closePopup(mailIconPopup);
  closeReplyPopup(true); closeAdmin(true); closeAdminLogin(true);
  document.body.classList.remove("night"); nightSky.setAttribute("aria-hidden", "true");
  if (prev === "home") showHome(false); else showLogin(false);
  updateBackButtonVisibility();
}
function showLogin(push = true){
  if (push) navStack.length = 0;
  loginScreen.style.display = "flex"; homeScreen.style.display = "none";
  closePopup(letterPopup); closePopup(loveLetterPopup); closePopup(mailIconPopup);
  closeReplyPopup(true); closeAdmin(true); closeAdminLogin(true);
  document.body.classList.remove("night"); nightSky.setAttribute("aria-hidden", "true");
  updateBackButtonVisibility();
}
function showHome(push = true){
  if (push) navStack.push("home");
  loginScreen.style.display = "none"; homeScreen.style.display = "flex";
  closePopup(letterPopup); closePopup(loveLetterPopup); closePopup(mailIconPopup);
  closeReplyPopup(true); closeAdmin(true); closeAdminLogin(true);
  document.body.classList.remove("night"); nightSky.setAttribute("aria-hidden", "true");
  updateBackButtonVisibility();
}
function openPopup(el){ if (!el) return; el.style.display = "flex"; updateBackButtonVisibility(); }
function closePopup(el){ if (!el) return; el.style.display = "none"; updateBackButtonVisibility(); }

// Night sky effects
function enableNight(){ document.body.classList.add("night"); nightSky.setAttribute("aria-hidden","false"); ensureStars(140); randomizePlane(); sporadicShootingStars(); }
function ensureStars(count=120){ if (nightSky.querySelector(".star")) return; const frag=document.createDocumentFragment(); for(let i=0;i<count;i++){ const s=document.createElement("span"); s.className="star"; s.style.left=Math.random()*100+"vw"; s.style.top=Math.random()*100+"vh"; s.style.animationDelay=(Math.random()*3).toFixed(2)+"s"; frag.appendChild(s);} nightSky.appendChild(frag); }
function randomizePlane(){ const top=12+Math.random()*35; const dur=14+Math.random()*10; nightSky.style.setProperty("--plane-top", `${top}%`); nightSky.style.setProperty("--plane-dur", `${dur}s`); }
let shootingTimer=null; function sporadicShootingStars(){ if (shootingTimer) clearTimeout(shootingTimer); const makeOne=()=>{ if (!document.body.classList.contains("night")) return; const star=document.createElement("div"); star.className="shootingStar"; const y=5+Math.random()*45; const x=Math.random()*40; const angle=-20-Math.random()*20; star.style.top=`${y}vh`; star.style.left=`${x}vw`; star.style.setProperty("--angle", `${angle}deg`); nightSky.appendChild(star); setTimeout(()=>star.remove(),1800); shootingTimer=setTimeout(makeOne,1800+Math.random()*3000); }; shootingTimer=setTimeout(makeOne,1200); }
function startPetals(count=18){ const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches; const actual=reduce?2:count; for(let i=0;i<actual;i++){ const p=document.createElement("div"); p.className="petal"; p.style.setProperty("--size", 12+Math.random()*22+"px"); p.style.setProperty("--x", Math.random()*100+"vw"); p.style.setProperty("--drift", (8+Math.random()*18)+"vw"); p.style.setProperty("--dur", (8+Math.random()*6)+"s"); document.body.appendChild(p); setTimeout(()=>p.remove(),12000); } }
function startBubbles(){
  const container=document.querySelector(".bubbles");
  if (!container) return;
  if (container.childElementCount>0) return;
  for(let i=0;i<22;i++){
    const b=document.createElement("div");
    b.className="bubble";
    const size = 8 + Math.floor(Math.random()*16);
    b.style.left = Math.random()*100 + "vw";
    b.style.width = b.style.height = size + "px";
    b.style.animationDelay = (Math.random()*6).toFixed(2) + "s";
    b.style.animationDuration = (9 + Math.random()*6).toFixed(2) + "s";
    container.appendChild(b);
  }
}

// Typewriter
const letterLines = [
"My Dear Pilla ❤️,",
"",
"It’s not about Valentine’s Day, Hug Day, Kiss Day, or Promise Day for me. I don’t believe that love should be celebrated only on special days.",
"Whenever I am with you, I feel like all those days come together at once. Your presence makes me feel loved, safe, cared for, confident, and even a little crazy in the best way. The way you smell hits me differently — no perfume in this world can ever match your natural fragrance.",
"Your touch makes me feel like flowers blooming on a dry tree. Everything feels new when I see you. Normally, I think about you every minute… but when we fight, I think about you every single second.",
"When I walk with you, every step feels like I’m walking in a different world. The way you treat me makes me feel like a child again — innocent and happy. The way you look at me makes me feel special.",
"This Valentine’s Day is not a special day for me… because every day becomes special when I am with you.",
"I want you as my better half — my strength, my support, my happiness. I want to be everything for you, just like you are everything to me.",
"",
"I worship you ❤️",
"Thank you for coming into my life and making it better.",

"Forever yours. 💫"	
];
async function typewriteLetter(targetEl){
  targetEl.innerHTML=""; const cursor=document.createElement("span"); cursor.className="cursor"; cursor.textContent=" "; const p=document.createElement("div"); targetEl.appendChild(p); targetEl.appendChild(cursor);
  const delay=(ms)=>new Promise((r)=>setTimeout(r,ms)); const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (let i=0;i<letterLines.length;i++){ const line=letterLines[i];
    if (!line){ p.appendChild(document.createElement("br")); await delay(reduced?30:120); continue; }
    for (let c=0;c<line.length;c++){ p.append(line[c]); await delay(reduced?4:30); }
    p.appendChild(document.createElement("br")); await delay(reduced?40:180);
  } cursor.remove();
}

// Motion-path arrow
function setArrowOffsetPath(){
  const card = loveLetterPopup?.querySelector(".popupContent");
  const arrow = loveLetterPopup?.querySelector(".borderArrow");
  if (!card || !arrow) return;
  const w=card.clientWidth, h=card.clientHeight;
  const gap=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--orbit-gap'))||10;
  const r=16, x0=gap, y0=gap, x1=w-gap, y1=h-gap;
  const path = [
    `M ${x0 + r} ${y0}`, `H ${x1 - r}`, `A ${r} ${r} 0 0 1 ${x1} ${y0 + r}`,
    `V ${y1 - r}`, `A ${r} ${r} 0 0 1 ${x1 - r} ${y1}`,
    `H ${x0 + r}`, `A ${r} ${r} 0 0 1 ${x0} ${y1 - r}`,
    `V ${y0 + r}`, `A ${r} ${r} 0 0 1 ${x0 + r} ${y0}`, `Z`
  ].join(' ');
  arrow.style.offsetPath = `path("${path}")`;
}

// Letter popup flow
function showMailIcon(){ openLoveLetter(); }
function sprinkleOverlayHearts(){
  const overlay=document.querySelector("#loveLetterPopup .loveOverlayHearts"); if (!overlay) return;
  overlay.innerHTML=""; const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches; const count=reduce?6:12;
  for(let i=0;i<count;i++){ const h=document.createElement("div"); h.className="loveHeart"; h.style.left=Math.random()*100+"vw"; h.style.top=(60+Math.random()*30)+"vh"; h.style.animationDelay=(Math.random()*3).toFixed(2)+"s"; overlay.appendChild(h); setTimeout(()=>h.remove(),7000); }
}
function openLoveLetter(){
  enableNight(); openPopup(loveLetterPopup); typewriteLetter(loveLetterContainer); startPetals(20); sprinkleOverlayHearts();
  setTimeout(()=>setArrowOffsetPath(), 50); window.addEventListener('resize', setArrowOffsetPath, { passive:true });
  // Set date stamp
  if (dateStamp) {
    const d = new Date();
    const opts = { year:'numeric', month:'short', day:'numeric' };
    dateStamp.textContent = d.toLocaleDateString(undefined, opts);
  }
}

// Reply save – NO preflight (no custom headers)
async function sendReply(){
  const msg = (replyText.value || "").trim();
  if (!msg){ replyStatus.textContent = "Please write a message before sending."; return; }
  sendReplyBtn.disabled = true; replyStatus.textContent = "Saving…";
  try{
    const payload = `FROM: Sathya\n\n${msg}\n`;
    const res = await fetch(REPLY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: payload
    });
    if (!res.ok) { const text = await res.text().catch(()=> ""); throw new Error(`HTTP ${res.status} ${text}`); }
    replyStatus.textContent = "Saved on server 💾"; showToast("Reply saved!");
  }catch(e){ console.error("Reply save failed:", e); replyStatus.textContent = "Failed to save. Please try again."; }
  finally{ sendReplyBtn.disabled = false; }
}

/* ===================== ADMIN ===================== */
function openAdmin(){
  if (!adminAuthToken) {
    document.getElementById("adminUser").value = "";
    document.getElementById("adminPass").value = "";
    document.getElementById("adminLoginStatus").textContent = "";
    openPopup(adminLoginPopup);
  } else {
    adminReplies.textContent = "(loading…)";
    adminStatus.textContent = "";
    openPopup(adminPopup);
    refreshReplies();
  }
}
function closeAdmin(silent=false){ closePopup(adminPopup); if (!silent) showToast("Admin closed"); }
function closeAdminLogin(silent=false){ closePopup(adminLoginPopup); if (!silent) showToast("Admin login closed"); }
function buildAdminAuth(user, pass){ return "Basic " + btoa(`${user}:${pass}`); }

async function adminLogin(){
  const user = (document.getElementById("adminUser").value || "").trim();
  const pass = (document.getElementById("adminPass").value || "").trim();
  const status = document.getElementById("adminLoginStatus");
  if (!user || !pass){ status.textContent = "Please enter admin username and password."; return; }
  const token = buildAdminAuth(user, pass);
  status.textContent = "Authenticating…";
  try{
    const res = await fetch(`${REPLIES_ENDPOINT}?limit=1`, { method:"GET", headers:{ "Authorization": token } });
    if (res.status === 401){ status.textContent = "Invalid admin credentials."; return; }
    if (!res.ok){ const t=await res.text().catch(()=> ""); throw new Error(`HTTP ${res.status} ${t}`); }
    adminAuthToken = token;
    status.textContent = "Authenticated.";
    closeAdminLogin(true);
    adminReplies.textContent = "(loading…)";
    adminStatus.textContent = "";
    openPopup(adminPopup);
    refreshReplies();
  }catch(e){ console.error("adminLogin error:", e); status.textContent = "Login failed. Try again."; }
}
async function adminFetch(url, options = {}){
  const headers = Object.assign({}, options.headers || {});
  headers["Authorization"] = adminAuthToken || "";
  return fetch(url, Object.assign({}, options, { headers }));
}
async function refreshReplies(){
  adminStatus.textContent = "Loading…";
  try{
    const res = await adminFetch(`${REPLIES_ENDPOINT}?limit=100`, { method:"GET" });
    if (res.status === 401){ adminStatus.textContent = "Unauthorized. Please login as admin again."; adminReplies.textContent="(unauthorized)"; adminAuthToken=null; closeAdmin(); openAdmin(); return; }
    if (!res.ok){ const t=await res.text().catch(()=> ""); throw new Error(`HTTP ${res.status} ${t}`); }
    const txt = await res.text();
    adminReplies.textContent = txt || "(no replies yet)";
    adminStatus.textContent = "Loaded";
  }catch(e){ console.error("refreshReplies error:", e); adminStatus.textContent = "Failed to load replies."; adminReplies.textContent="(error)"; }
}
async function downloadReplies(){
  try{
    const res = await adminFetch(`${REPLIES_ENDPOINT}/download`, { method:"GET" });
    if (res.status === 401){ showToast("Unauthorized. Login as admin"); adminAuthToken=null; closeAdmin(); openAdmin(); return; }
    if (!res.ok){ const t=await res.text().catch(()=> ""); throw new Error(`HTTP ${res.status} ${t}`); }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "valentine_replies.txt";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }catch(e){ console.error("downloadReplies error:", e); showToast("Download failed"); }
}
async function clearReplies(){
  if (!confirm("Are you sure you want to clear all replies?")) return;
  adminStatus.textContent = "Clearing…";
  try{
    const res = await adminFetch(`${REPLIES_ENDPOINT}/clear`, { method:"POST" });
    if (res.status === 401){ adminStatus.textContent="Unauthorized. Please login again."; adminAuthToken=null; closeAdmin(); openAdmin(); return; }
    if (!res.ok){ const t=await res.text().catch(()=> ""); throw new Error(`HTTP ${res.status} ${t}`); }
    adminStatus.textContent = "Cleared."; adminReplies.textContent = "(no replies yet)";
  }catch(e){ console.error("clearReplies error:", e); adminStatus.textContent = "Failed to clear."; }
}

/* ===================== BEAUTY EXTRAS ===================== */
/** Parallax for moon & bubbles */
(function enableParallax(){
  const moon = document.querySelector(".moon");
  const bubbles = document.querySelector(".bubbles");
  function onMove(e){
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    const x = (e.clientX ?? cx) - cx;
    const y = (e.clientY ?? cy) - cy;
    if (moon){
      const fx = 0.03; // moon stronger
      moon.style.transform = `translate(${(-x*fx).toFixed(1)}px, ${(-y*fx).toFixed(1)}px)`;
    }
    if (bubbles){
      const fx2 = 0.015; // subtle
      bubbles.style.transform = `translate(${(x*fx2).toFixed(1)}px, ${(y*fx2).toFixed(1)}px)`;
    }
  }
  window.addEventListener("mousemove", onMove, { passive:true });
})();

/** Typing placeholders on login inputs */
(function typingPlaceholders(){
  const u = document.getElementById("username");
  const p = document.getElementById("password");
  const phrasesU = ["Type your username…", "Hint: sathya"];
  const phrasesP = ["Type your password…", "Hint: love"];
  function typeLoop(el, texts){
    let i=0, pos=0, del=false;
    function tick(){
      const t = texts[i];
      if (!del){
        pos++;
        el.setAttribute("placeholder", t.slice(0,pos));
        if (pos>=t.length){ del=true; setTimeout(tick, 1200); return; }
      }else{
        pos--;
        el.setAttribute("placeholder", t.slice(0,pos));
        if (pos<=0){ del=false; i=(i+1)%texts.length; }
      }
      setTimeout(tick, del? 28 : 38);
    }
    tick();
  }
  if (u) typeLoop(u, phrasesU);
  if (p) typeLoop(p, phrasesP);
})();

/** YES button heart burst */
(function heartsBurstOnYes(){
  const btn = document.getElementById("yesBtn");
  if (!btn) return;
  btn.addEventListener("click", (e)=>{
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    for (let i=0;i<12;i++){
      const h = document.createElement("div");
      h.className = "burstHeart";
      h.style.left = `${cx}px`;
      h.style.top  = `${cy}px`;
      const angle = Math.random()*Math.PI*2;
      const radius = 40 + Math.random()*36;
      const dx = Math.cos(angle)*radius;
      const dy = Math.sin(angle)*radius*-1; // go up-ish
      h.style.setProperty("--dx", `${dx.toFixed(1)}px`);
      h.style.setProperty("--dy", `${dy.toFixed(1)}px`);
      document.body.appendChild(h);
      setTimeout(()=> h.remove(), 950);
    }
  }, { passive:true });
})();

// Expose (existing)
window.login=login; window.navBack=navBack; window.showMailIcon=showMailIcon;
window.openReplyPopup=()=>{ replyText.value=""; replyStatus.textContent=""; openPopup(replyPopup); };
window.closeReplyPopup=(s=false)=>{ closePopup(replyPopup); if (!s) showToast("Reply closed"); };
window.sendReply=sendReply;

window.openAdmin=openAdmin; window.closeAdmin=closeAdmin;
window.adminLogin=adminLogin; window.closeAdminLogin=closeAdminLogin;
window.refreshReplies=refreshReplies; window.downloadReplies=downloadReplies; window.clearReplies=clearReplies;

// Init
window.addEventListener("DOMContentLoaded", ()=>{
  showLogin(false); startBubbles();

  // Autofocus + Enter submit
  const u=document.getElementById('username'), p=document.getElementById('password');
  if (u) u.focus();
  const submitOnEnter=(e)=>{ if (e.key==='Enter'){ e.preventDefault(); login(); } };
  if (u) u.addEventListener('keydown', submitOnEnter); if (p) p.addEventListener('keydown', submitOnEnter);
});

// -------------------------------
// Front-end App Logic (No Backend)
// -------------------------------

// ==== Config (edit if you like) ====
const VALID_USERNAME = "sathya";
const VALID_PASSWORD = "love";

// Optional backend for replies; leave "" to simulate only
const REPLY_ENDPOINT = "http://13.222.180.79:8081/";

// ======= DOM REFS =======
const loginScreen = document.getElementById("loginScreen");
const homeScreen = document.getElementById("homeScreen");
const mailIconPopup = document.getElementById("mailIconPopup"); // kept

// Legacy transparent letter popup (kept)
const letterPopup = document.getElementById("letterPopup");

// NEW love-themed letter popup
const loveLetterPopup = document.getElementById("loveLetterPopup");
const loveLetterContainer = document.getElementById("loveLetterContainer");

const replyPopup = document.getElementById("replyPopup");
const nightSky = document.getElementById("nightSky");
const globalBackBtn = document.getElementById("globalBack");
const toastEl = document.getElementById("toast");
const replyText = document.getElementById("replyText");
const replyStatus = document.getElementById("replyStatus");
const sendReplyBtn = document.getElementById("sendReplyBtn");
const bgMusic = document.getElementById("bgMusic");

// Simple navigation stack to know where to go back
const navStack = [];

// ========== UTIL: Toast ==========
function showToast(msg, duration = 2000) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), duration);
}

// ========== Background Music ==========
async function startMusic() {
  if (!bgMusic) return;
  try {
    await bgMusic.play();
  } catch (_) {
    showToast("Tap anywhere to enable music 🎵", 2500);
    const resume = () => {
      bgMusic.play().catch(() => {});
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
      document.removeEventListener("touchstart", resume);
    };
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("keydown", resume, { once: true });
    document.addEventListener("touchstart", resume, { once: true });
  }
}

// ========== Login ==========
async function login() {
  const u = (document.getElementById("username").value || "").trim().toLowerCase();
  const p = (document.getElementById("password").value || "").trim();

  const wait = document.getElementById("loginWait");
  const err = document.getElementById("loginError");
  wait.textContent = "Checking…";
  err.textContent = "";

  await new Promise((r) => setTimeout(r, 600)); // tiny UX delay

  if (u === VALID_USERNAME && p === VALID_PASSWORD) {
    wait.textContent = "Welcome ❤️";
    showHome();
    startMusic();
  } else {
    wait.textContent = "";
    err.textContent = "Invalid username or password. Try again.";
  }
}

// ========== Navigation Helpers ==========
function updateBackButtonVisibility() {
  globalBackBtn.hidden = navStack.length === 0;
}

function navBack() {
  const prev = navStack.pop();

  // Close all popups
  closePopup(letterPopup);
  closePopup(loveLetterPopup);
  closePopup(mailIconPopup);
  closeReplyPopup(true);

  document.body.classList.remove("night");
  nightSky.setAttribute("aria-hidden", "true");

  if (prev === "home") {
    showHome(false);
  } else {
    showLogin(false);
  }
  updateBackButtonVisibility();
}

function showLogin(push = true) {
  if (push) navStack.length = 0; // reset stack
  loginScreen.style.display = "flex";
  homeScreen.style.display = "none";
  closePopup(letterPopup);
  closePopup(loveLetterPopup);
  closePopup(mailIconPopup);
  closeReplyPopup(true);
  document.body.classList.remove("night");
  nightSky.setAttribute("aria-hidden", "true");
  updateBackButtonVisibility();
}

function showHome(push = true) {
  if (push) navStack.push("home");
  loginScreen.style.display = "none";
  homeScreen.style.display = "flex";
  closePopup(letterPopup);
  closePopup(loveLetterPopup);
  closePopup(mailIconPopup);
  closeReplyPopup(true);
  document.body.classList.remove("night");
  nightSky.setAttribute("aria-hidden", "true");
  updateBackButtonVisibility();
}

function openPopup(el) {
  if (!el) return;
  el.style.display = "flex";
  updateBackButtonVisibility();
}

function closePopup(el) {
  if (!el) return;
  el.style.display = "none";
  updateBackButtonVisibility();
}

// ========== Night Sky + Effects ==========
function enableNight() {
  document.body.classList.add("night");
  nightSky.setAttribute("aria-hidden", "false");
  ensureStars(140);
  randomizePlane();
  sporadicShootingStars();
}

function ensureStars(count = 120) {
  if (nightSky.querySelector(".star")) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "star";
    s.style.left = Math.random() * 100 + "vw";
    s.style.top = Math.random() * 100 + "vh";
    s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    frag.appendChild(s);
  }
  nightSky.appendChild(frag);
}

function randomizePlane() {
  const top = 12 + Math.random() * 35;   // 12%–47% vh
  const dur = 14 + Math.random() * 10;   // 14–24s
  nightSky.style.setProperty("--plane-top", `${top}%`);
  nightSky.style.setProperty("--plane-dur", `${dur}s`);
}

let shootingTimer = null;
function sporadicShootingStars() {
  if (shootingTimer) clearTimeout(shootingTimer);
  const makeOne = () => {
    if (!document.body.classList.contains("night")) return;
    const star = document.createElement("div");
    star.className = "shootingStar";
    const y = 5 + Math.random() * 45;
    const x = Math.random() * 40;
    const angle = -20 - Math.random() * 20;
    star.style.top = `${y}vh`;
    star.style.left = `${x}vw`;
    star.style.setProperty("--angle", `${angle}deg`);
    nightSky.appendChild(star);
    setTimeout(() => star.remove(), 1800);
    shootingTimer = setTimeout(makeOne, 1800 + Math.random() * 3000);
  };
  shootingTimer = setTimeout(makeOne, 1200);
}

function startPetals(count = 18) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const actual = reduce ? 2 : count;
  for (let i = 0; i < actual; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    p.style.setProperty("--size", 12 + Math.random() * 22 + "px");
    p.style.setProperty("--x", Math.random() * 100 + "vw");
    p.style.setProperty("--drift", (8 + Math.random() * 18) + "vw");
    p.style.setProperty("--dur", (8 + Math.random() * 6) + "s");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 12000);
  }
}

function startBubbles() {
  const container = document.querySelector(".bubbles");
  if (!container) return;
  if (container.childElementCount > 0) return;
  for (let i = 0; i < 20; i++) {
    const b = document.createElement("div");
    b.className = "bubble";
    b.style.left = Math.random() * 100 + "vw";
    b.style.animationDelay = (Math.random() * 5).toFixed(2) + "s";
    b.style.width = b.style.height = 8 + Math.floor(Math.random() * 14) + "px";
    container.appendChild(b);
  }
}

// ========== Letter Typewriter ==========
const letterLines = [
  "Dear Sathya,",
  "",
  "Every day with you is a new reason to smile.",
  "You’re the calm in my chaos and the spark in my sky.",
  "I wrote this to say one simple thing:",
  "",
  "Will you be my Valentine? 💖",
  "",
  "Yours,",
  "Thiru"
];

async function typewriteLetter(targetEl) {
  targetEl.innerHTML = "";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = " ";
  const p = document.createElement("div");
  targetEl.appendChild(p);
  targetEl.appendChild(cursor);

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (let i = 0; i < letterLines.length; i++) {
    const line = letterLines[i];
    if (line.length === 0) {
      p.appendChild(document.createElement("br"));
      await delay(reduced ? 30 : 120);
      continue;
    }
    for (let c = 0; c < line.length; c++) {
      p.append(line[c]);
      await delay(reduced ? 4 : 30);
    }
    p.appendChild(document.createElement("br"));
    await delay(reduced ? 40 : 180);
  }
  cursor.remove();
}

// ========== Love Theme Popup Flow ==========
function showMailIcon() {
  openLoveLetter();
}

function sprinkleOverlayHearts() {
  const overlay = document.querySelector("#loveLetterPopup .loveOverlayHearts");
  if (!overlay) return;

  // Clear before adding
  overlay.innerHTML = "";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = reduce ? 6 : 12;

  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "loveHeart";
    h.style.left = Math.random() * 100 + "vw";
    h.style.top  = (60 + Math.random() * 30) + "vh"; // lower half to float up
    h.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    overlay.appendChild(h);
    setTimeout(() => h.remove(), 7000);
  }
}

function openLoveLetter() {
  enableNight();
  openPopup(loveLetterPopup);
  typewriteLetter(loveLetterContainer);
  startPetals(20);
  sprinkleOverlayHearts();
}

function openReplyPopup() {
  replyText.value = "";
  replyStatus.textContent = "";
  openPopup(replyPopup);
}

function closeReplyPopup(silent = false) {
  closePopup(replyPopup);
  if (!silent) showToast("Reply closed");
}

async function sendReply() {
  const msg = replyText.value.trim();
  if (!msg) {
    replyStatus.textContent = "Please write a message before sending.";
    return;
  }

  sendReplyBtn.disabled = true;
  replyStatus.textContent = "Sending…";

  try {
    if (REPLY_ENDPOINT) {
      const res = await fetch(REPLY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "X-From": "Sathya"
        },
        body: msg
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      replyStatus.textContent = "Sent! 💌";
      showToast("Reply sent successfully!");
    } else {
      await new Promise((r) => setTimeout(r, 600));
      replyStatus.textContent = "Sent! 💌 (simulation)";
      showToast("Reply sent (no backend)");
    }
  } catch (e) {
    replyStatus.textContent = "Failed to send. Please try again.";
  } finally {
    sendReplyBtn.disabled = false;
  }
}

// ========== Global ==========
window.login = login;
window.navBack = navBack;
window.showMailIcon = showMailIcon;
window.openReplyPopup = openReplyPopup;
window.closeReplyPopup = closeReplyPopup;
window.sendReply = sendReply;

window.addEventListener("DOMContentLoaded", () => {
  showLogin(false);
  startBubbles();
});

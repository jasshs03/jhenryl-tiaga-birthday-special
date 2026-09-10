
let code = "";
const correct = "0912";
let audioContext;
let wrongAttempts = 0;

function initGlitter() {
  const layer = document.getElementById("glitter-layer");
  if (!layer) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const colors = ["#ffd3df", "#ffe9a8", "#fff8fb", "#ff9fc0", "#c9f7ff"];
  const stars = ["✨", "⭐", "💫"];
  const pieceCount = 45;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("div");
    const isStar = Math.random() < 0.25;
    piece.className = isStar ? "glitter-piece glitter-star" : "glitter-piece";

    const size = isStar ? 12 + Math.random() * 12 : 3 + Math.random() * 5;
    const duration = 8 + Math.random() * 10;
    const delay = -Math.random() * duration;
    const drift = (Math.random() - 0.5) * 160;
    const color = colors[Math.floor(Math.random() * colors.length)];

    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--size", `${size}px`);
    piece.style.setProperty("--duration", `${duration}s`);
    piece.style.setProperty("--delay", `${delay}s`);
    piece.style.setProperty("--drift", `${drift}px`);
    piece.style.setProperty("--color", color);

    if (isStar) {
      piece.textContent = stars[Math.floor(Math.random() * stars.length)];
    }

    layer.appendChild(piece);
  }
}

initGlitter();

const hintButton = document.getElementById("hint-button");
const hintText = document.getElementById("hint-text");
const wrongModal = document.getElementById("wrong-modal");
const wrongModalTitle = document.getElementById("wrong-modal-title");
const wrongModalMessage = document.getElementById("wrong-modal-message");
const tryAgainButton = document.getElementById("try-again-button");

hintButton.addEventListener("click", () => {
  const isExpanded = hintButton.getAttribute("aria-expanded") === "true";
  hintButton.setAttribute("aria-expanded", String(!isExpanded));
  hintText.classList.toggle("hidden", isExpanded);
  playTone(700, 0.1, "sine", 0, 0.3);
});

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  audioContext ??= new AudioContextClass();
  return audioContext;
}

function playTone(frequency, duration, type = "sine", delay = 0, volume = 0.3) {
  const context = getAudioContext();
  if (!context) return;

  const scheduleTone = () => {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  };

  if (context.state === "suspended") {
    context.resume().then(scheduleTone);
  } else {
    scheduleTone();
  }
}

function playSuccessSound() {
  playTone(392, 0.12, "triangle", 0, 0.28);
  playTone(523, 0.16, "sine", 0.05, 0.45);
  playTone(659, 0.16, "sine", 0.18, 0.45);
  playTone(784, 0.16, "sine", 0.31, 0.45);
  playTone(1047, 0.34, "sine", 0.44, 0.48);
  playTone(1568, 0.18, "triangle", 0.5, 0.25);
  playTone(1976, 0.24, "triangle", 0.58, 0.22);
}

function playErrorSound() {
  playTone(220, 0.18, "square", 0, 0.2);
  playTone(175, 0.24, "square", 0.16, 0.2);
}

window.onload = function () {
  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
    setPanelVisible("lock");
  }, 2500);
};

function setPanelVisible(panelId) {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.add("hidden");
  });

  const target = document.getElementById(panelId);
  if (target) {
    target.classList.remove("hidden");
  }

  document.querySelector(".container").classList.toggle("video-wide", panelId === "video-greeting");
}

function startCountdown() {
  const target = new Date("2026-09-12T00:00:00").getTime();

  const updateTimer = () => {
    const now = new Date().getTime();
    const distance = target - now;

    if (distance <= 0) {
      clearInterval(timer);
      setPanelVisible("lock");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("timer").textContent = `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
  };

  updateTimer();
  const timer = setInterval(updateTimer, 1000);
}

function press(num) {
  if (code.length < 4) {
    code += num;
    const input = document.getElementById("c" + code.length);
    if (input) input.value = num;
    playTone(420 + num * 22, 0.07, "sine", 0, 0.25);
  }
}

function clearCode(withSound = true) {
  code = "";
  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById("c" + i);
    if (input) input.value = "";
  }

  if (withSound) {
    playTone(280, 0.1, "triangle", 0, 0.3);
  }
}

function check() {
  if (code === correct) {
    clearCode(false);
    wrongAttempts = 0;
    playSuccessSound();
    setPanelVisible("access");
    return;
  }

  wrongAttempts += 1;
  playErrorSound();
  shakeScreen();
  clearCode(false);
  showWrongModal();
}

function shakeScreen() {
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");

  setTimeout(() => {
    document.body.classList.remove("shake");
  }, 550);
}

function showWrongModal() {
  const reachedThreeAttempts = wrongAttempts >= 3;
  wrongModalTitle.textContent = reachedThreeAttempts ? "WAG MONG HULAAN!" : "Wrong Password";
  wrongModalMessage.textContent = reachedThreeAttempts
    ? "Tingnan mo muna ang hint bago ka sumubok ulit."
    : "Please check the hint and try again.";
  wrongModal.classList.remove("hidden");
  tryAgainButton.focus();
}

function closeWrongModal() {
  wrongModal.classList.add("hidden");
  document.querySelector(".keypad button").focus();
}

function showMail() {
  playTone(587, 0.12, "sine", 0, 0.4);
  playTone(880, 0.2, "sine", 0.1, 0.4);
  resetEnvelopeDodge();
  setPanelVisible("mail");
}

function showVideoGreeting() {
  playTone(494, 0.14, "sine", 0, 0.4);
  playTone(740, 0.2, "sine", 0.12, 0.4);
  setPanelVisible("video-greeting");
}

function unlockVideo(card) {
  if (card.classList.contains("unlocked")) return;

  card.classList.add("unlocked");
  playTone(660, 0.1, "sine", 0, 0.35);
  playTone(880, 0.16, "sine", 0.1, 0.35);

  const video = card.querySelector(".birthday-video");
  if (!video) return;

  video.setAttribute("controls", "");
  document.querySelectorAll(".birthday-video").forEach((otherVideo) => {
    if (otherVideo !== video) otherVideo.pause();
  });
  video.play().catch(() => {});
}

document.querySelectorAll(".video-card").forEach((card) => {
  const lock = card.querySelector(".video-lock");
  if (!lock) return;

  lock.addEventListener("click", () => unlockVideo(card));
  lock.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      unlockVideo(card);
    }
  });
});

function openLetter() {
  playTone(440, 0.18, "triangle", 0, 0.35);
  playTone(660, 0.24, "sine", 0.14, 0.4);

  const envelope = document.getElementById("envelope-target");
  if (envelope) {
    envelope.classList.add("open");
  }

  setTimeout(() => {
    setPanelVisible("letter");
  }, 500);
}

const envelope = document.getElementById("envelope-target");
const mailPanel = document.getElementById("mail");
const mailHint = document.getElementById("mail-hint");
const dodgesRequired = 5;
const avoidRadius = 150;
const dodgeCooldownMs = 260;
let envelopeDodgeCount = 0;
let envelopeUnlocked = false;
let envelopeOffsetX = 0;
let envelopeOffsetY = 0;
let lastDodgeTime = 0;

function resetEnvelopeDodge() {
  envelopeDodgeCount = 0;
  envelopeUnlocked = false;
  envelopeOffsetX = 0;
  envelopeOffsetY = 0;
  lastDodgeTime = 0;

  if (envelope) {
    envelope.style.transform = "";
  }

  if (mailHint) {
    mailHint.textContent = "Catch the mail to open it!";
  }
}

function playDodgeSound() {
  playTone(500, 0.06, "square", 0, 0.15);
  playTone(320, 0.08, "square", 0.05, 0.15);
}

function unlockEnvelope() {
  envelopeUnlocked = true;
  envelope.style.transform = "";
  if (mailHint) {
    mailHint.textContent = "Got it! Click the mail to open";
  }
}

function moveEnvelopeAwayFrom(cursorX, cursorY) {
  const rect = envelope.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = centerX - cursorX;
  let dy = centerY - cursorY;
  const length = Math.hypot(dx, dy) || 1;
  dx /= length;
  dy /= length;

  const wobble = (Math.random() - 0.5) * 1.1;
  const finalDx = dx + wobble * -dy;
  const finalDy = dy + wobble * dx;
  const wobbleLength = Math.hypot(finalDx, finalDy) || 1;

  const moveDistance = 100 + Math.random() * 60;
  let nextOffsetX = envelopeOffsetX + (finalDx / wobbleLength) * moveDistance;
  let nextOffsetY = envelopeOffsetY + (finalDy / wobbleLength) * moveDistance;

  if (mailPanel) {
    const panelRect = mailPanel.getBoundingClientRect();
    const margin = 12;
    const maxOffsetX = (panelRect.width - rect.width) / 2 - margin;
    const maxOffsetY = (panelRect.height - rect.height) / 2 - margin;
    nextOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, nextOffsetX));
    nextOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, nextOffsetY));
  }

  envelopeOffsetX = nextOffsetX;
  envelopeOffsetY = nextOffsetY;
  envelope.style.transform = `translate(${envelopeOffsetX}px, ${envelopeOffsetY}px)`;
}

function dodgeFrom(cursorX, cursorY) {
  if (envelopeUnlocked || !envelope) return false;

  const now = performance.now();
  if (now - lastDodgeTime < dodgeCooldownMs) return true;
  lastDodgeTime = now;

  envelopeDodgeCount += 1;
  playDodgeSound();

  if (envelopeDodgeCount >= dodgesRequired) {
    unlockEnvelope();
    return true;
  }

  moveEnvelopeAwayFrom(cursorX, cursorY);

  if (mailHint) {
    mailHint.textContent = "Too slow! Try again!";
  }

  return true;
}

if (envelope && mailPanel) {
  document.addEventListener("mousemove", (event) => {
    if (mailPanel.classList.contains("hidden") || envelopeUnlocked) return;

    const rect = envelope.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(centerX - event.clientX, centerY - event.clientY);

    if (distance < avoidRadius) {
      dodgeFrom(event.clientX, event.clientY);
    }
  });

  envelope.addEventListener("click", (event) => {
    const rect = envelope.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (dodgeFrom(event.clientX ?? centerX, event.clientY ?? centerY)) return;
    openLetter();
  });

  envelope.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLetter();
    }
  });
}

tryAgainButton.addEventListener("click", closeWrongModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !wrongModal.classList.contains("hidden")) {
    closeWrongModal();
  }
});

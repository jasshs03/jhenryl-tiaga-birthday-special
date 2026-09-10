
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
  playTone(523, 0.14, "sine", 0, 0.4);
  playTone(659, 0.14, "sine", 0.12, 0.4);
  playTone(784, 0.22, "sine", 0.24, 0.4);
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
  setPanelVisible("mail");
}

function openLetter() {
  playTone(440, 0.18, "triangle", 0, 0.35);
  playTone(660, 0.24, "sine", 0.14, 0.4);

  const envelope = document.querySelector(".envelope");
  if (envelope) {
    envelope.classList.add("open");
  }

  setTimeout(() => {
    setPanelVisible("letter");
  }, 500);
}

const envelope = document.querySelector(".envelope");
if (envelope) {
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

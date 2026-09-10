
let code = "";
const correct = "0912";
let audioContext;
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";

const soundToggle = document.getElementById("sound-toggle");
updateSoundToggle();

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem("soundEnabled", String(soundEnabled));
  updateSoundToggle();

  if (soundEnabled) {
    playTone(660, 0.08, "sine", 0, 0.08);
  }
});

function updateSoundToggle() {
  soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Mute sound effects" : "Enable sound effects");
  soundToggle.title = soundEnabled ? "Mute sound effects" : "Enable sound effects";
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    soundToggle.disabled = true;
    soundToggle.title = "Sound effects are not supported by this browser";
    return null;
  }

  audioContext ??= new AudioContextClass();
  return audioContext;
}

function playTone(frequency, duration, type = "sine", delay = 0, volume = 0.06) {
  if (!soundEnabled) return;

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
  playTone(523, 0.14, "sine", 0);
  playTone(659, 0.14, "sine", 0.12);
  playTone(784, 0.22, "sine", 0.24);
}

function playErrorSound() {
  playTone(220, 0.18, "square", 0, 0.035);
  playTone(175, 0.24, "square", 0.16, 0.035);
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
    playTone(420 + num * 22, 0.07, "sine", 0, 0.045);
  }
}

function clearCode(withSound = true) {
  code = "";
  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById("c" + i);
    if (input) input.value = "";
  }

  if (withSound) {
    playTone(280, 0.1, "triangle", 0, 0.05);
  }
}

function check() {
  const error = document.getElementById("error");

  if (code === correct) {
    clearCode(false);
    playSuccessSound();
    setPanelVisible("access");
    return;
  }

  playErrorSound();
  error.style.display = "block";

  setTimeout(() => {
    error.style.display = "none";
  }, 1500);

  clearCode(false);
}

function showMail() {
  playTone(587, 0.12, "sine", 0);
  playTone(880, 0.2, "sine", 0.1);
  setPanelVisible("mail");
}

function openLetter() {
  playTone(440, 0.18, "triangle", 0, 0.05);
  playTone(660, 0.24, "sine", 0.14, 0.06);

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

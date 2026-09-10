
let code = "";
const correct = "0912";

window.onload = function () {
  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
    startCountdown();
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
  }
}

function clearCode() {
  code = "";
  for (let i = 1; i <= 4; i++) {
    const input = document.getElementById("c" + i);
    if (input) input.value = "";
  }
}

function check() {
  const error = document.getElementById("error");

  if (code === correct) {
    clearCode();
    setPanelVisible("access");
    return;
  }

  error.style.display = "block";

  setTimeout(() => {
    error.style.display = "none";
  }, 1500);

  clearCode();
}

function showMail() {
  setPanelVisible("mail");
}

function openLetter() {
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

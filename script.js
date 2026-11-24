// 1. Live Clock WIB
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour12: false });
  document.getElementById("live-clock").textContent = timeStr + " WIB";
}
setInterval(updateClock, 1000);
updateClock();

// 2. Dark / Light High-Contrast Mode Switcher
const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("inverted");
});

// 3. Custom Crosshair & Telemetry Oscilloscope Wave
const dot = document.getElementById("cursor-dot");
const crossX = document.getElementById("cross-x");
const crossY = document.getElementById("cross-y");
const coords = document.getElementById("coords");

const waveCanvas = document.getElementById("telemetry-wave");
const waveCtx = waveCanvas ? waveCanvas.getContext("2d") : null;
let wavePhase = 0;
let waveAmpTarget = 14;
let waveAmpCurrent = 14;
let waveFreq = 0.045;
let isLocalPlaying = false;

function resizeTelemetryWave() {
  if (!waveCanvas) return;
  waveCanvas.width = Math.max(120, waveCanvas.parentElement.clientWidth - 20);
  waveCanvas.height = 64;
}
window.addEventListener("resize", resizeTelemetryWave);
resizeTelemetryWave();

function renderTelemetryWave() {
  if (waveCtx && waveCanvas) {
    const w = waveCanvas.width;
    const h = waveCanvas.height;
    const midY = h / 2;

    waveCtx.clearRect(0, 0, w, h);

    // Garis tengah & grid horizontal tipis
    waveCtx.strokeStyle = "rgba(197, 248, 42, 0.14)";
    waveCtx.lineWidth = 1;
    waveCtx.beginPath();
    waveCtx.moveTo(0, midY);
    waveCtx.lineTo(w, midY);
    waveCtx.stroke();

    // Haluskan transisi amplitudo
    waveAmpCurrent += (waveAmpTarget - waveAmpCurrent) * 0.12;
    waveAmpTarget += (12 - waveAmpTarget) * 0.04;

    // Gambar gelombang garis utama (Acid Green)
    waveCtx.strokeStyle = "#C5F82A";
    waveCtx.lineWidth = 2;
    waveCtx.beginPath();

    for (let x = 0; x <= w; x += 2) {
      const envelope = Math.sin((x / w) * Math.PI);
      const y =
        midY +
        Math.sin(x * waveFreq + wavePhase) * waveAmpCurrent * envelope +
        Math.cos(x * (waveFreq * 1.9) - wavePhase * 1.4) *
          (waveAmpCurrent * 0.35) *
          envelope;

      if (x === 0) waveCtx.moveTo(x, y);
      else waveCtx.lineTo(x, y);
    }
    waveCtx.stroke();

    // Gelombang bayangan sekunder (Accent Orange)
    waveCtx.strokeStyle = "rgba(255, 59, 0, 0.55)";
    waveCtx.lineWidth = 1.2;
    waveCtx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const envelope = Math.sin((x / w) * Math.PI);
      const y =
        midY +
        Math.cos(x * (waveFreq * 0.8) - wavePhase * 0.9) *
          (waveAmpCurrent * 0.55) *
          envelope;
      if (x === 0) waveCtx.moveTo(x, y);
      else waveCtx.lineTo(x, y);
    }
    waveCtx.stroke();

    wavePhase += isLocalPlaying ? 0.14 : 0.07;
    if (isLocalPlaying) {
      waveAmpTarget = Math.max(waveAmpTarget, 22);
    }
  }
  requestAnimationFrame(renderTelemetryWave);
}
renderTelemetryWave();

window.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  gsap.to(dot, { x: x, y: y, duration: 0.08 });
  gsap.to(crossX, { y: y, duration: 0.14 });
  gsap.to(crossY, { x: x, duration: 0.14 });
  gsap.to(coords, { x: x, y: y, duration: 0.18 });

  coords.textContent = `X:${String(x).padStart(3, "0")} Y:${String(y).padStart(3, "0")}`;

  waveAmpTarget = 24;
  waveFreq = 0.03 + (x / window.innerWidth) * 0.045;
});

function bindCursorHover(elements) {
  elements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (dot) dot.classList.add("active");
    });
    el.addEventListener("mouseleave", () => {
      if (dot) dot.classList.remove("active");
    });
  });
}
bindCursorHover(document.querySelectorAll("a, button, .pill"));

// 4. Text Scramble Effect
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&*";
function bindScramble(elements) {
  elements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      const originalText = el.getAttribute("data-text");
      let iteration = 0;
      clearInterval(el.scrambleInterval);

      el.scrambleInterval = setInterval(() => {
        el.textContent = originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration || letter === " ") return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");

        if (iteration >= originalText.length)
          clearInterval(el.scrambleInterval);
        iteration += 1 / 2;
      }, 25);
    });
  });
}
bindScramble(document.querySelectorAll(".scramble-hover"));

// 5. Spotlight Effect
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("mousemove", (e) => {
    const rect = cell.getBoundingClientRect();
    cell.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    cell.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  });
});

// 6. 3D Perspective Tilt
const tiltCard = document.getElementById("tilt-card");
tiltCard.addEventListener("mousemove", (e) => {
  const rect = tiltCard.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  gsap.to(tiltCard, {
    rotationY: x * 0.06,
    rotationX: -y * 0.06,
    duration: 0.35,
    ease: "power2.out",
  });
});
tiltCard.addEventListener("mouseleave", () => {
  gsap.to(tiltCard, {
    rotationY: 0,
    rotationX: 0,
    duration: 0.7,
    ease: "elastic.out(1, 0.4)",
  });
});

// 7. Marquee
gsap.to("#marquee-track", {
  xPercent: -50,
  repeat: -1,
  duration: 16,
  ease: "linear",
});

let lastScroll = window.scrollY;
window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  const velocity = currentScroll - lastScroll;
  lastScroll = currentScroll;

  const skewVal = Math.max(Math.min(velocity * 0.25, 12), -12);
  gsap.to("#marquee-track", {
    skewX: -skewVal,
    duration: 0.3,
    ease: "power2.out",
    onComplete: () => gsap.to("#marquee-track", { skewX: 0, duration: 0.5 }),
  });
});

// 8. Live GitHub Repo Telemetry
fetch("https://api.github.com/users/msanysatio4-sketch")
  .then((res) => res.json())
  .then((data) => {
    const ghStat = document.getElementById("gh-repos-stat");
    if (ghStat && typeof data.public_repos === "number") {
      ghStat.textContent = `[X] GH REPOS: ${data.public_repos}`;
    }
  })
  .catch(() => {});

// 9. Load Projects dari projects.json + Filter + Slide-Over Modal
const backdrop = document.getElementById("modal-backdrop");
const closeBtn = document.getElementById("modal-close");
const mTitle = document.getElementById("m-title");
const mStack = document.getElementById("m-stack");
const mDetail = document.getElementById("m-detail");
const projectList = document.getElementById("project-list");
let cachedProjects = [];

function renderProjects(filter = "ALL") {
  const filtered =
    filter === "ALL"
      ? cachedProjects
      : cachedProjects.filter(
          (p) => (p.category || "").toUpperCase() === filter,
        );

  projectList.innerHTML = filtered
    .map(
      (p) => `
    <article class="project-row">
      <div class="project-summary">
        <span class="p-num">${p.num}</span>
        <h3 class="p-title scramble-hover" data-text="${p.title}">${p.title}</h3>
        <span class="p-tags">${p.tags}</span>
        <span class="p-year">${p.year}</span>
      </div>
      <div class="project-drawer">
        <div class="drawer-inner">
          <div class="drawer-desc">
            <p>${p.summary}</p>
            <button class="btn-launch open-modal" type="button"
              data-title="${p.title}"
              data-stack="${p.stack}"
              data-detail="${p.detail}">
              INSPEKSI PROYEK ↗
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
    )
    .join("");

  bindCursorHover(projectList.querySelectorAll(".project-row, button"));
  bindScramble(projectList.querySelectorAll(".scramble-hover"));

  projectList.querySelectorAll(".open-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      mTitle.textContent = btn.getAttribute("data-title");
      mStack.textContent = btn.getAttribute("data-stack");
      mDetail.textContent = btn.getAttribute("data-detail");
      backdrop.classList.add("open");
    });
  });
}

fetch("projects.json")
  .then((res) => res.json())
  .then((projects) => {
    cachedProjects = projects;
    renderProjects("ALL");
  })
  .catch(() => {
    projectList.innerHTML = `<div style="padding:2rem;font-family:var(--font-mono);">Gagal memuat projects.json. Jalankan via Live Server.</div>`;
  });

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.getAttribute("data-filter"));
  });
});

closeBtn.addEventListener("click", () => backdrop.classList.remove("open"));
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) backdrop.classList.remove("open");
});

// 10. Interactive CLI Terminal
const termBackdrop = document.getElementById("term-backdrop");
const termToggleBtn = document.getElementById("term-toggle-btn");
const termCloseBtn = document.getElementById("term-close-btn");
const cliForm = document.getElementById("cli-form");
const cliInput = document.getElementById("cli-input");
const cliOutput = document.getElementById("cli-output");

termToggleBtn.addEventListener("click", () => {
  termBackdrop.classList.add("open");
  setTimeout(() => cliInput.focus(), 100);
});
termCloseBtn.addEventListener("click", () =>
  termBackdrop.classList.remove("open"),
);
termBackdrop.addEventListener("click", (e) => {
  if (e.target === termBackdrop) termBackdrop.classList.remove("open");
});

const cliCommands = {
  help: "Perintah tersedia: <span style='color:var(--acid)'>whoami</span>, <span style='color:var(--acid)'>stack</span>, <span style='color:var(--acid)'>projects</span>, <span style='color:var(--acid)'>contact</span>, <span style='color:var(--acid)'>theme</span>, <span style='color:var(--acid)'>clear</span>",
  whoami:
    "M. Sani Satio R Hasibuan — D3 Teknik Informatika (AMIK Universal Medan). Fokus: Web Engineering, ADB System Config, & Digital Design.",
  stack:
    "Python (Django), PHP Native, MySQL, HTML5/CSS3/JS (GSAP), ADB Shell, PixelLab GFX, & Discord Bot Automation.",
  projects:
    "01. Sistem Admin Bimbel Naufal | 02. Galeri Foto Alumni SMA | 03. SanyStore04 & GFX Design.",
  contact:
    "GitHub: msanysatio4-sketch | Instagram: @msany_hsb | Store: SanyStore04",
};

cliForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = cliInput.value.trim();
  const cmd = raw.toLowerCase();
  if (!raw) return;

  cliOutput.innerHTML += `<div><span style="color:var(--accent)">guest@sani-os:~$</span> ${raw}</div>`;

  if (cmd === "clear") {
    cliOutput.innerHTML = "";
  } else if (cmd === "theme") {
    document.body.classList.toggle("inverted");
    cliOutput.innerHTML += `<div>Theme mode switched.</div>`;
  } else if (cliCommands[cmd]) {
    cliOutput.innerHTML += `<div>${cliCommands[cmd]}</div>`;
  } else {
    cliOutput.innerHTML += `<div>Perintah tidak dikenal: "${raw}". Ketik <span style="color:var(--acid)">help</span>.</div>`;
  }

  cliInput.value = "";
  cliOutput.scrollTop = cliOutput.scrollHeight;
});

// 11. One-Click Copy Handle
const copyHandleBtn = document.getElementById("copy-handle-btn");
if (copyHandleBtn) {
  copyHandleBtn.addEventListener("click", () => {
    const text = copyHandleBtn.getAttribute("data-copy");
    navigator.clipboard.writeText(text).then(() => {
      const original = copyHandleBtn.textContent;
      copyHandleBtn.textContent = "[COPIED TO CLIPBOARD ✓]";
      setTimeout(() => {
        copyHandleBtn.textContent = original;
      }, 2000);
    });
  });
}

// 12. Inline Vinyl Audio Deck + Real-Time Beat Visualizer
const localTracks = [
  { title: "[01/03] GEMU FA MI RE - NYONG FRANCO", src: "assets/lagu1.mp3" },
  { title: "[02/03] Poppin In The Club", src: "assets/lagu2.mp3" },
  { title: "[03/03] Mamacita - Adnan Veron", src: "assets/lagu3.mp3" },
];

const localAudio = document.getElementById("local-audio");
const localTrackTitle = document.getElementById("local-track-title");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevTrackBtn = document.getElementById("prev-track-btn");
const nextTrackBtn = document.getElementById("next-track-btn");
const vinylDisc = document.getElementById("vinyl-disc");
const vinylArm = document.getElementById("vinyl-arm");
const audioStateBadge = document.getElementById("audio-state-badge");
const audioNavBtn = document.getElementById("audio-nav-btn");
const signalStatus = document.getElementById("signal-status");
const progressWrap = document.getElementById("audio-progress-wrap");
const progressFill = document.getElementById("audio-progress-fill");
const currentTimeEl = document.getElementById("audio-current-time");
const durationEl = document.getElementById("audio-duration");

// Web Audio API Beat Visualizer Setup
const beatCanvas = document.getElementById("beat-canvas");
const beatCtx = beatCanvas ? beatCanvas.getContext("2d") : null;
let audioCtx = null;
let analyser = null;
let dataArray = null;

function resizeBeatCanvas() {
  if (!beatCanvas) return;
  beatCanvas.width = beatCanvas.parentElement.clientWidth;
  beatCanvas.height = beatCanvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeBeatCanvas);
resizeBeatCanvas();

function initAudioAnalyser() {
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume();
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioCtx = new AudioContextClass();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.8;

  const source = audioCtx.createMediaElementSource(localAudio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function renderBeatVisualizer() {
  if (!beatCtx || !beatCanvas) return;
  beatCtx.clearRect(0, 0, beatCanvas.width, beatCanvas.height);

  if (analyser && dataArray && isLocalPlaying) {
    analyser.getByteFrequencyData(dataArray);

    const barCount = 42;
    const gap = 4;
    const barWidth = (beatCanvas.width - gap * (barCount - 1)) / barCount;

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i] || 0;
      const percent = value / 255;
      const barHeight = Math.max(4, percent * (beatCanvas.height * 0.88));
      const x = i * (barWidth + gap);
      const y = beatCanvas.height - barHeight;

      beatCtx.fillStyle =
        i < 12
          ? `rgba(255, 59, 0, ${0.35 + percent * 0.55})`
          : `rgba(197, 248, 42, ${0.28 + percent * 0.55})`;

      beatCtx.fillRect(x, y, barWidth, barHeight);
    }
  } else {
    beatCtx.fillStyle = "rgba(255, 59, 0, 0.2)";
    beatCtx.fillRect(0, beatCanvas.height - 3, beatCanvas.width, 3);
  }

  requestAnimationFrame(renderBeatVisualizer);
}
renderBeatVisualizer();

let trackIdx = 0;

function formatTime(sec) {
  if (!isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function setPlayingVisuals(playing) {
  isLocalPlaying = playing;
  if (playing) {
    playPauseBtn.textContent = "❚❚ PAUSE";
    vinylDisc.classList.add("spinning");
    vinylArm.classList.add("active");
    audioStateBadge.textContent = "SPINNING // ON AIR";
    audioStateBadge.style.color = "var(--acid)";
    if (audioNavBtn) audioNavBtn.classList.add("playing");
    if (signalStatus) signalStatus.textContent = "AUDIO ON";
  } else {
    playPauseBtn.textContent = "▶ PLAY DISC";
    vinylDisc.classList.remove("spinning");
    vinylArm.classList.remove("active");
    audioStateBadge.textContent = "PAUSED";
    audioStateBadge.style.color = "var(--accent)";
    if (audioNavBtn) audioNavBtn.classList.remove("playing");
    if (signalStatus) signalStatus.textContent = "LIVE SIGNAL";
  }
}

function loadLocalTrack(index, autoPlay = false) {
  trackIdx = (index + localTracks.length) % localTracks.length;
  localAudio.src = localTracks[trackIdx].src;
  localAudio.volume = 0.45;
  localTrackTitle.textContent = localTracks[trackIdx].title;
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "00:00";

  if (autoPlay) {
    initAudioAnalyser();
    localAudio
      .play()
      .then(() => {
        setPlayingVisuals(true);
      })
      .catch(() => {
        setPlayingVisuals(false);
        localTrackTitle.textContent =
          "FILE MP3 BELUM ADA: " + localTracks[trackIdx].src;
      });
  } else {
    setPlayingVisuals(false);
  }
}

playPauseBtn.addEventListener("click", () => {
  initAudioAnalyser();

  if (!localAudio.getAttribute("src")) {
    loadLocalTrack(trackIdx, false);
  }

  if (!isLocalPlaying) {
    localAudio
      .play()
      .then(() => {
        setPlayingVisuals(true);
      })
      .catch(() => {
        setPlayingVisuals(false);
        localTrackTitle.textContent =
          "FILE MP3 BELUM ADA: " + localTracks[trackIdx].src;
      });
  } else {
    localAudio.pause();
    setPlayingVisuals(false);
  }
});

prevTrackBtn.addEventListener("click", () =>
  loadLocalTrack(trackIdx - 1, isLocalPlaying),
);
nextTrackBtn.addEventListener("click", () =>
  loadLocalTrack(trackIdx + 1, isLocalPlaying),
);
localAudio.addEventListener("ended", () => loadLocalTrack(trackIdx + 1, true));

localAudio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(localAudio.duration);
});

localAudio.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatTime(localAudio.currentTime);
  if (localAudio.duration) {
    const pct = (localAudio.currentTime / localAudio.duration) * 100;
    progressFill.style.width = `${pct}%`;
  }
});

progressWrap.addEventListener("click", (e) => {
  if (!localAudio.duration) return;
  const rect = progressWrap.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  localAudio.currentTime = ratio * localAudio.duration;
});

// 13. System Boot Opening + Starfield (Opening Only)
const bootScreen = document.getElementById("boot-screen");
const bootBarFill = document.getElementById("boot-bar-fill");
const bootPercent = document.getElementById("boot-percent");
const bootStatusText = document.getElementById("boot-status-text");
const bootEnterBtn = document.getElementById("boot-enter-btn");
const starCanvas = document.getElementById("starfield-canvas");

if (bootScreen) {
  let starAnimId = null;

  if (starCanvas) {
    const ctx = starCanvas.getContext("2d");
    let stars = [];
    const starCount = 90;

    function setupStars() {
      starCanvas.width = window.innerWidth;
      starCanvas.height = window.innerHeight;
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        size: Math.random() * 1.8 + 0.6,
        speedY: Math.random() * 0.25 + 0.05,
        alpha: Math.random(),
        delta: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
        isAcid: Math.random() < 0.18,
      }));
    }

    function renderStars() {
      ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      stars.forEach((s) => {
        s.alpha += s.delta;
        if (s.alpha <= 0.1 || s.alpha >= 0.95) s.delta *= -1;
        s.y -= s.speedY;
        if (s.y < 0) {
          s.y = starCanvas.height;
          s.x = Math.random() * starCanvas.width;
        }
        ctx.fillStyle = s.isAcid
          ? `rgba(197, 248, 42, ${s.alpha})`
          : `rgba(230, 228, 221, ${s.alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      starAnimId = requestAnimationFrame(renderStars);
    }

    window.addEventListener("resize", setupStars);
    setupStars();
    renderStars();
  }

  let progress = { val: 0 };
  gsap.to(progress, {
    val: 100,
    duration: 1.8,
    ease: "power2.inOut",
    onUpdate: () => {
      const pct = Math.floor(progress.val);
      bootBarFill.style.width = `${pct}%`;
      bootPercent.textContent = `${pct}%`;
    },
    onComplete: () => {
      bootStatusText.textContent = "SYSTEM READY.";
      bootEnterBtn.hidden = false;
      gsap.fromTo(
        bootEnterBtn,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3 },
      );
    },
  });

  bootEnterBtn.addEventListener("click", () => {
    resizeTelemetryWave();
    resizeBeatCanvas();
    gsap.to(bootScreen, {
      yPercent: -100,
      duration: 0.75,
      ease: "power4.inOut",
      onComplete: () => {
        if (starAnimId) cancelAnimationFrame(starAnimId);
        bootScreen.remove();
      },
    });
  });
}

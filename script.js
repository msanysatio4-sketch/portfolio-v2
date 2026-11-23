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

// 3. Custom Crosshair & Telemetry Frequency Bars
const dot = document.getElementById("cursor-dot");
const crossX = document.getElementById("cross-x");
const crossY = document.getElementById("cross-y");
const coords = document.getElementById("coords");
const bars = document.querySelectorAll(".t-bar");

window.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  gsap.to(dot, { x: x, y: y, duration: 0.08 });
  gsap.to(crossX, { y: y, duration: 0.14 });
  gsap.to(crossY, { x: x, duration: 0.14 });
  gsap.to(coords, { x: x, y: y, duration: 0.18 });

  coords.textContent = `X:${String(x).padStart(3, "0")} Y:${String(y).padStart(3, "0")}`;

  bars.forEach((bar, i) => {
    const wave = Math.abs(Math.sin((x + y + i * 25) * 0.02)) * 85 + 15;
    bar.style.height = `${wave}%`;
  });
});

setInterval(() => {
  bars.forEach((bar) => {
    const randomH = Math.floor(Math.random() * 60) + 20;
    bar.style.height = `${randomH}%`;
  });
}, 600);

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

// 12. Audio / Spotify Pop-Up Deck Controller
const audioDeck = document.getElementById("audio-deck");
const audioToggleBtn = document.getElementById("audio-toggle-btn");
const deckCloseBtn = document.getElementById("deck-close-btn");
const tabSpotify = document.getElementById("tab-spotify");
const tabLocal = document.getElementById("tab-local");
const panelSpotify = document.getElementById("panel-spotify");
const panelLocal = document.getElementById("panel-local");

audioToggleBtn.addEventListener("click", () => {
  audioDeck.classList.toggle("hidden");
});
deckCloseBtn.addEventListener("click", () => {
  audioDeck.classList.add("hidden");
});

tabSpotify.addEventListener("click", () => {
  tabSpotify.classList.add("active");
  tabLocal.classList.remove("active");
  panelSpotify.style.display = "block";
  panelLocal.style.display = "none";
});

tabLocal.addEventListener("click", () => {
  tabLocal.classList.add("active");
  tabSpotify.classList.remove("active");
  panelLocal.style.display = "block";
  panelSpotify.style.display = "none";
});

const localTracks = [
  {
    title: "[01/03] Gemu Fa Mi Re - Nyong Franco",
    src: "assets/lagu1.mp3",
    startTime: 0,
  },
  { title: "[02/03] JUDUL LAGU KEDUA", src: "assets/lagu2.mp3", startTime: 0 },
  { title: "[03/03] JUDUL LAGU KETIGA", src: "assets/lagu3.mp3", startTime: 0 },
];

const localAudio = document.getElementById("local-audio");
const localTrackTitle = document.getElementById("local-track-title");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevTrackBtn = document.getElementById("prev-track-btn");
const nextTrackBtn = document.getElementById("next-track-btn");
const signalStatus = document.getElementById("signal-status");

let trackIdx = 0;
let isLocalPlaying = false;

function loadLocalTrack(index, autoPlay = false) {
  trackIdx = (index + localTracks.length) % localTracks.length;
  localAudio.src = localTracks[trackIdx].src;
  localAudio.volume = 0.3;
  localTrackTitle.textContent = localTracks[trackIdx].title;

  localAudio.addEventListener(
    "loadedmetadata",
    () => {
      localAudio.currentTime = localTracks[trackIdx].startTime || 0;
    },
    { once: true },
  );

  if (autoPlay) {
    localAudio
      .play()
      .then(() => {
        isLocalPlaying = true;
        playPauseBtn.textContent = "❚❚ PAUSE";
        audioToggleBtn.classList.add("playing");
        signalStatus.textContent = "AUDIO ON";
      })
      .catch(() => {});
  }
}

playPauseBtn.addEventListener("click", () => {
  if (!localAudio.src) loadLocalTrack(trackIdx, false);

  if (!isLocalPlaying) {
    localAudio
      .play()
      .then(() => {
        isLocalPlaying = true;
        playPauseBtn.textContent = "❚❚ PAUSE";
        audioToggleBtn.classList.add("playing");
        signalStatus.textContent = "AUDIO ON";
      })
      .catch(() => {
        localTrackTitle.textContent = "FILE MP3 BELUM ADA";
      });
  } else {
    localAudio.pause();
    isLocalPlaying = false;
    playPauseBtn.textContent = "▶ PLAY";
    audioToggleBtn.classList.remove("playing");
    signalStatus.textContent = "LIVE SIGNAL";
  }
});

prevTrackBtn.addEventListener("click", () =>
  loadLocalTrack(trackIdx - 1, isLocalPlaying),
);
nextTrackBtn.addEventListener("click", () =>
  loadLocalTrack(trackIdx + 1, isLocalPlaying),
);
localAudio.addEventListener("ended", () => loadLocalTrack(trackIdx + 1, true));

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
    if (audioDeck) audioDeck.classList.remove("hidden");

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

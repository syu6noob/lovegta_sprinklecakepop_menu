import "./style.css"
import { gsap } from "gsap";

// Loading

document.addEventListener("DOMContentLoaded", () => {
  const loadingElement = document.getElementById("loading")!;
  setTimeout(() => {
    loadingElement.classList.add("loading--hide");
  }, 1500)
});

// slide

const isProgressBarEnabled = true;

const slides = document.querySelectorAll<HTMLDivElement>(".slide");
const progressBar = document.querySelector<HTMLDivElement>(".progress__bar");
const stateText = document.querySelector<HTMLSpanElement>(".state__text");

const slideCount = slides.length;
const slideDuration = 15;

const debugSlideCount: number = -1;

let currentIndex = debugSlideCount === -1 ? 0 : debugSlideCount;

gsap.set(slides, { autoAlpha: 0 });

function updateStateText(index: number) {
  if (stateText) {
    stateText.textContent = `${index + 1}/${slideCount}`;
  }
}

function syncStart() {
  const now = new Date();
  const seconds = now.getSeconds();
  const millSeconds = now.getMilliseconds();

  const elapsed = (seconds % slideDuration) + millSeconds / 1000;

  currentIndex = debugSlideCount === -1 ? Math.floor(seconds / slideDuration) % slideCount : debugSlideCount;

  gsap.set(slides[currentIndex], { autoAlpha: 1 });
  updateStateText(currentIndex);

  if (isProgressBarEnabled && progressBar) {
    const progress = elapsed / slideDuration;
    gsap.set(progressBar, { width: `${progress * 100}%` });

    gsap.to(progressBar, {
      width: "100%",
      duration: slideDuration - elapsed,
      ease: "linear",
      onComplete: nextSlide,
    });
  }
}

function nextSlide() {
  const nextIndex = debugSlideCount === -1 ? (currentIndex + 1) % slideCount : debugSlideCount;

  gsap.to(slides[currentIndex], { autoAlpha: 0, duration: 1 });
  gsap.to(slides[nextIndex], { autoAlpha: 1, duration: 1 });

  currentIndex = nextIndex;
  updateStateText(currentIndex);

  if (isProgressBarEnabled && progressBar) {
    gsap.set(progressBar, { width: "0%" });
    gsap.to(progressBar, {
      width: "100%",
      duration: slideDuration,
      ease: "linear",
      onComplete: nextSlide,
    });
  }
}

syncStart();

// music

const audioElement = document.getElementById("audio")! as HTMLAudioElement;
const muteButtonElement = document.getElementById("button--mute")!;

document.addEventListener("DOMContentLoaded", () => {
  audioElement.volume = 0.03;
  setTimeout(() => {
    if (!audioElement.paused) {
      return;
    }
    audioElement.play().catch((e) => {
      console.log("Autoplay was prevented:", e);
      setMute(true);
    });
  }, 1000)
})

function setMute(state: boolean) {
  muteButtonElement.dataset["muted"] = `${state}`;
  audioElement.muted = state;
}

let isMuted: boolean = false;
muteButtonElement.addEventListener("click", () => {
  if (audioElement.paused) {
    audioElement.play();
  }

  isMuted = !isMuted;
  setMute(isMuted);
});

window.addEventListener("message", (e) => {
  const msg = e.data;

  if (msg.data && msg.setVolume === true) {
    let newVolume = 0.03 * Number(msg.data) / 100;

    appendDebugLog({
      "newVolume": newVolume
    });
    
    if (newVolume > 0.03) newVolume = 0.03;
    audioElement.volume = newVolume;
  }
});

// debug

// 追加変数（既存の定義と同じファイルのトップ付近に置く）
const debugButtonElement = document.getElementById("button--debug")! as HTMLButtonElement;
let isDebugMode: boolean = false;
let debugPanel: HTMLDivElement | null = null;

// デバッグパネルを生成する関数
function createDebugPanel() {
  if (debugPanel) return debugPanel;
  debugPanel = document.createElement("div");
  debugPanel.id = "debug-panel";
  // インラインスタイルで簡単に配置（必要なら CSS に移してください）
  debugPanel.style.position = "fixed";
  debugPanel.style.bottom = "0";
  debugPanel.style.left = "0";
  debugPanel.style.width = "100%";
  debugPanel.style.maxHeight = "40vh";
  debugPanel.style.overflowY = "auto";
  debugPanel.style.background = "rgba(0,0,0,0.8)";
  debugPanel.style.color = "#0f0";
  debugPanel.style.fontFamily = "monospace";
  debugPanel.style.fontSize = "12px";
  debugPanel.style.padding = "6px";
  debugPanel.style.zIndex = "9999";
  debugPanel.style.boxSizing = "border-box";
  debugPanel.style.backdropFilter = "blur(4px)";
  debugPanel.style.borderTop = "1px solid rgba(255,255,255,0.06)";
  document.body.appendChild(debugPanel);
  return debugPanel;
}

function destroyDebugPanel() {
  if (!debugPanel) return;
  debugPanel.remove();
  debugPanel = null;
}

// デバッグモードの表示切替（ボタン UI の dataset も更新）
function setDebug(state: boolean) {
  isDebugMode = state;
  debugButtonElement.dataset["debug"] = `${state}`;
  if (state) {
    createDebugPanel();
    // 視覚的に押された状態を示すならクラスを付与しても良い
    debugButtonElement.classList.add("is-active");
  } else {
    destroyDebugPanel();
    debugButtonElement.classList.remove("is-active");
  }
}

function appendDebugLog(data: unknown) {
  if (!isDebugMode) return;

  const panel = debugPanel ?? createDebugPanel();

  const pre = document.createElement("pre");
  pre.style.margin = "4px 0";
  pre.style.whiteSpace = "pre-wrap";
  pre.style.wordBreak = "break-word";
  pre.textContent = `[${new Date().toLocaleTimeString()}] ${JSON.stringify(data, null, 2)}`;

  panel.appendChild(pre);
  panel.scrollTop = panel.scrollHeight;

  // --- ログ肥大化対策 ---
  const maxEntries = 200;
  while (panel.childElementCount > maxEntries) {
    panel.removeChild(panel.firstElementChild!);
  }
}

// ボタンクリックでトグル（mute ボタンと同様の扱い）
debugButtonElement.addEventListener("click", () => {
  setDebug(!isDebugMode);
});

window.addEventListener("message", (e) => {
  // --- デバッグ表示 ---
  appendDebugLog(e.data);
});
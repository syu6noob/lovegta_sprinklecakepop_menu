import "./style.css"
import { gsap } from "gsap";

// Loading
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    gsap.to(".loading", {
      duration: 1,
      opacity: 0,
      scale: 10,
      ease: "power2.inOut"
    });
  }, 1000)
});

// Slide
const isProgressBarEnabled = true;

const slides = document.querySelectorAll<HTMLDivElement>(".slide");
const progressBar = document.querySelector<HTMLDivElement>(".progress__bar");
const stateText = document.querySelector<HTMLSpanElement>(".state__text");

const slideCount = slides.length;
const slideDuration = 15;

let currentIndex = 0;

// スライドをすべて非表示に
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

  // 現在のスライド番号
  currentIndex = Math.floor(seconds / slideDuration) % slideCount;

  // スライド表示
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
  const nextIndex = (currentIndex + 1) % slideCount;

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
const mainElement = document.querySelector("main")!;
const audioElement = document.getElementById("audio")! as HTMLAudioElement;
audioElement.volume = 0.1;

mainElement?.addEventListener("click", () => {
  audioElement.play().then(() => {
    console.log("音楽再生開始！");
  }).catch((err) => {
    console.error("音楽が再生できませんでした:", err);
  });
});

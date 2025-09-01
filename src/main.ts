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
const slideDuration = 12;

let currentIndex = 0;

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

  currentIndex = Math.floor(seconds / slideDuration) % slideCount;

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

const audioElement = document.getElementById("audio")! as HTMLAudioElement;
const muteButtonElement = document.getElementById("button--mute")!;

document.addEventListener("DOMContentLoaded", () => {
  audioElement.volume = 0.03;
  audioElement.play();
})

function setMute(state: boolean) {
  muteButtonElement.dataset["muted"] = `${state}`;
  audioElement.muted = state;
}

let isMuted: boolean = false;
muteButtonElement.addEventListener("click", () => {
  isMuted = !isMuted;
  setMute(isMuted);
});

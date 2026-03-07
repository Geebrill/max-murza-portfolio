const playButtons = document.querySelectorAll(".play-btn");

let currentAudio = null;
let currentButton = null;

function resetButton(button) {
  if (!button) return;

  const icon = button.querySelector(".play-icon");
  if (icon) {
    icon.src = "assets/icons/play.svg";
    icon.alt = "Play icon";
  }

  button.classList.remove("is-playing");
  button.setAttribute("aria-label", "Play track");
}

function setPlayingState(button) {
  if (!button) return;

  const icon = button.querySelector(".play-icon");
  if (icon) {
    icon.src = "assets/icons/pause.svg";
    icon.alt = "Pause icon";
  }

  button.classList.add("is-playing");
  button.setAttribute("aria-label", "Pause track");
}

playButtons.forEach((button) => {
  const trackCard = button.closest(".track-card");
  if (!trackCard) return;

  const audio = trackCard.querySelector(".audio-player");
  const progressContainer = trackCard.querySelector(".progress-container");
  const progressBar = trackCard.querySelector(".progress-bar");

  if (!audio) return;

  button.addEventListener("click", async () => {
    const isSameTrack = currentAudio === audio;
    const isCurrentlyPlaying = isSameTrack && !audio.paused;

    if (isCurrentlyPlaying) {
      audio.pause();
      audio.currentTime = 0;
      resetButton(button);
      currentAudio = null;
      currentButton = null;
      return;
    }

    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      resetButton(currentButton);
    }

    try {
      await audio.play();
      setPlayingState(button);
      currentAudio = audio;
      currentButton = button;
    } catch (error) {
      console.error("Audio playback failed:", error);
      resetButton(button);
    }
  });

  audio.addEventListener("ended", () => {
    resetButton(button);
    if (progressBar) progressBar.style.width = "0%";

    if (currentAudio === audio) {
      currentAudio = null;
      currentButton = null;
    }
  });

  audio.addEventListener("pause", () => {
    if (audio !== currentAudio) return;
    if (!audio.ended) {
      resetButton(button);
    }
  });

  audio.addEventListener("play", () => {
    setPlayingState(button);
  });

  /* обновление полосы прогресса */

  audio.addEventListener("timeupdate", () => {
    if (!progressBar) return;

    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progressPercent + "%";
  });

  /* перемотка по клику */

  if (progressContainer) {
    progressContainer.addEventListener("click", (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;

      audio.currentTime = (clickX / width) * duration;
    });
  }
});
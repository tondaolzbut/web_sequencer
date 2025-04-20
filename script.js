document.querySelectorAll("#sequencer button").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("pressed");
    });
  });
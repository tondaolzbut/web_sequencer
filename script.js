document.querySelectorAll("#sequencer button").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("pressed");
    });
  });

class Sequencer{
  tempo;
  stepCount;
  isPlaying;
  nextStep(){  }
  start(){}
  stop(){}
}
class Step{
  index;
  pitch;
  length;
  velocity;
  isActive;
  Sample;
  play(){}
  clear(){}
  put(){}
  modify(){}
}
class Sample{
  source;
}
class Track{
  Sequencer;
  isMuted;
}
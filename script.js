document.querySelectorAll("#sequencer button").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("pressed");
    });
  });

class Sequencer{
  tempo = 120;
  stepCount = 8;
  isPlaying = false;
  activeStep = 0;
  steps = [];
  constructor(stepCount){
    this.stepCount = stepCount;
    for (let i = 0; i < stepCount; i++) {
      this.steps.push(new Step(i));
    }
  }
  nextStep(){ 
    this.activeStep = (this.activeStep + 1) % this.stepCount;}

  start() {
    this.isPlaying = true;
    this.interval = setInterval(() => {
      this.steps[this.activeStep].play();
      this.nextStep();
    }, (60 / this.tempo) * 1000); // tempo in BPM
  }

  stop() {
    this.isPlaying = false;
    clearInterval(this.interval);
  }
}

class Step{
  index;
  pitch;
  length;
  velocity;
  isActive = false;
  Sample;
  constructor(index) {
    this.index = index;
    this.el = document.querySelector(`#step${index + 1}`);
  }
  play() {
    this.el.classList.add("active");
    setTimeout(() => this.el.classList.remove("active"), 100); // visual flash
  }
  clear()
  {

  }
  put()
  {

  }
  modify()
  {

  }
}
class Sample{
  source;
}
class Track{
  Sequencer;
  isMuted;
}

const seq = new Sequencer(8);
const startStopBtn = document.getElementById("start_stop");

startStopBtn.addEventListener("click", () => {
  if (!seq.isPlaying) { seq.start(); } 
  else { seq.stop(); }
});
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
    if (this.activeStep > this.stepCount -2){
      this.activeStep = 0;
    }
    else{
      this.activeStep += 1;
    }
  }
  start(){
    this.isPlaying = true
    while (this.isPlaying){
      this.steps[this.activeStep].play();
      this.nextStep();
    }
  }
  stop(){
    this.isPlaying = false
  }
}
class Step{
  index;
  pitch;
  length;
  velocity;
  isActive = false;
  Sample;
  constructor(index){
    this.index = index;
  }
  play(){
    alert("playing step "+this.index);
  }
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

seq = new Sequencer(8);
seq.start();
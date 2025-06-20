const audioContext = new (window.AudioContext || window.webkitAudioContext)();

async function loadSample(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}

class Sequencer{
  tempo = 520;
  stepCount = 8;
  isPlaying = false;
  activeStep = 0;
  
  constructor(stepCount) {
    this.stepCount = stepCount;
    this.tracks = [
      new Track('kick.wav', this, 0),
      new Track('snare.wav', this, 1),
      new Track('hihat.wav', this, 2),
      new Track('mono.wav', this, 3)
    ];
  }

  tick(){ 
    this.tracks.forEach(track => {track.playStep(this.activeStep)})
    this.activeStep = (this.activeStep + 1) % this.stepCount;
  }

  start() {
    this.isPlaying = true;
    this.interval = setInterval(() => {
      this.tick();
    }, (60 / this.tempo) * 1000); // tempo in BPM
  }

  stop() {
    this.isPlaying = false;
    clearInterval(this.interval);
  }
}

class Track{
  isMuted = false;
  steps = [];

  constructor(sampleName, sequencer, trackIndex){
    this.sequencer = sequencer;
    this.sampleSource = `samples/${sampleName}`;
    this.trackIndex = trackIndex;

    loadSample(this.sampleSource).then(buffer => {
      this.sampleBuffer = buffer;
    });

    for (let i = 0; i < sequencer.stepCount; i++) {
      this.steps.push(new Step(i, this));
    }
  }

  playStep(index){
    if(this.steps[index].isActive){
      this.steps[index].play();
    }
  }
}

class Step{
  index;
  pitch;
  length;
  velocity;
  isActive = false;
  constructor(index, track) {
    this.index = index;
    this.track = track;
    this.el = document.querySelector(`#step${track.trackIndex}-${index}`);

    this.el.addEventListener("click", () => {
      if (this.isActive) {
        this.clear();
      } else {
        this.put();
      }
    });
  }
  play() {
    const context = audioContext;
    const source = context.createBufferSource();
    source.buffer = this.track.sampleBuffer;
    source.connect(context.destination);
    source.start();
    this.el.classList.add("active");
    setTimeout(() => this.el.classList.remove("active"), 100); // visual flash
  }
  clear()
  {
    this.isActive = false;
    this.el.classList.remove("pressed");
  }
  put()
  {
    this.isActive = true;
    this.el.classList.add("pressed");
  }
  modify()
  {

  }
}

function createSequencerGrid(rows = 4, stepsPerRow = 8) {
  const container = document.createElement('div');
  container.id = 'sequencer';

  for (let row = 0; row < rows; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'track-row';

    for (let step = 0; step < stepsPerRow; step++) {
      const button = document.createElement('button');
      button.id = `step${row}-${step}`;
      button.type = 'button';
      button.className = 'step-button';
      rowDiv.appendChild(button);
    }

    container.appendChild(rowDiv);
  }

  document.body.appendChild(container);
}

seqLength = 16;
createSequencerGrid(4, seqLength);
const seq = new Sequencer(seqLength);

const startStopBtn = document.getElementById("start_stop");

const tempoSlider = document.getElementById("tempo");
const tempoValueDisplay = document.getElementById("tempo-value");

tempoSlider.addEventListener("input", () => {
  const bpm = parseInt(tempoSlider.value);
  tempoValueDisplay.textContent = bpm;
  seq.tempo = bpm*4;

  // If playing, restart to apply new tempo immediately
  if (seq.isPlaying) {
    seq.stop();
    seq.start();
  }
});

startStopBtn.addEventListener("click", () => {
  if (!seq.isPlaying) { seq.start(); } 
  else { seq.stop(); seq.activeStep = 0 }
});
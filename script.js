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
      if (editMode) {
        openFunctionMenu(this); // Pass the clicked Step object
      } else {
        this.isActive ? this.clear() : this.put();
      }
    });
  }
  play() {
    const context = audioContext;
    const source = context.createBufferSource();
    source.buffer = this.track.sampleBuffer;

    // Apply pitch
    source.playbackRate.value = this.pitch || 1;

    // Create gain node for velocity
    const gainNode = context.createGain();
    gainNode.gain.value = this.velocity || 1;

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start();

    this.el.classList.add("active");
    setTimeout(() => this.el.classList.remove("active"), 100);
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
    const rowWrapper = document.createElement('div');
    rowWrapper.className = 'track-wrapper';
    
    // Upload input for this track
    const upload = document.createElement('input');
    upload.type = 'file';
    upload.accept = 'audio/*';
    upload.className = 'upload-input';
    upload.dataset.track = row;
    
    rowWrapper.appendChild(upload); // add upload to the left of the row

    const rowDiv = document.createElement('div');
    rowDiv.className = 'track-row';

    for (let step = 0; step < stepsPerRow; step++) {
      const button = document.createElement('button');
      button.id = `step${row}-${step}`;
      button.type = 'button';
      button.className = 'step-button';
      rowDiv.appendChild(button);
    }

    rowWrapper.appendChild(rowDiv);
    container.appendChild(rowWrapper);
  }

  document.body.appendChild(container);
}

function bindTrackUploadHandlers(sequencer) {
  const uploadInputs = document.querySelectorAll('.upload-input');
  uploadInputs.forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const trackIndex = parseInt(e.target.dataset.track);
      if (file && !isNaN(trackIndex)) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        sequencer.tracks[trackIndex].sampleBuffer = buffer;
        console.log(`Track ${trackIndex} loaded a new sample`);
      }
    });
  });
}

function createControlsUI() {
  const controlsContainer = document.createElement("div");
  controlsContainer.id = "controls";

  // Start/Stop Button
  const startBtn = document.createElement("button");
  startBtn.id = "start_stop";
  startBtn.textContent = "Start / Stop";
  controlsContainer.appendChild(startBtn);

  // EDIT Button
  const editBtn = document.createElement("button");
  editBtn.id = "edit-mode-toggle";
  editBtn.textContent = "Edit step parameters";
  controlsContainer.appendChild(editBtn);  

  // Tempo slider
  const tempoLabel = document.createElement("label");
  tempoLabel.htmlFor = "tempo";
  tempoLabel.textContent = "Tempo: ";

  const tempoValue = document.createElement("span");
  tempoValue.id = "tempo-value";
  tempoValue.textContent = "120";

  const tempoSlider = document.createElement("input");
  tempoSlider.id = "tempo";
  tempoSlider.type = "range";
  tempoSlider.min = "30";
  tempoSlider.max = "300";
  tempoSlider.value = "120";

  controlsContainer.appendChild(tempoLabel);
  controlsContainer.appendChild(tempoSlider);
  controlsContainer.appendChild(tempoValue);

  /* File upload input
  const uploadLabel = document.createElement("label");
  uploadLabel.textContent = "Upload Sound: ";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "fileUploader";
  fileInput.accept = "audio/*";
  uploadLabel.appendChild(fileInput);
  controlsContainer.appendChild(uploadLabel);*/

  document.body.appendChild(controlsContainer);
}

seqLength = 16;
trackCount = 4;

createControlsUI();
createSequencerGrid(trackCount, seqLength);
const seq = new Sequencer(seqLength);
bindTrackUploadHandlers(seq);

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

let editMode = false;

document.getElementById('edit-mode-toggle').addEventListener('click', () => {
  editMode = !editMode;
  document.getElementById('edit-mode-toggle').textContent = editMode ? "Exit Edit Mode" : "Edit Step Params";

  if (!editMode){
    const menu = document.getElementById('function-menu');
    menu.style.display = 'none';

    // Remove highlight from all steps or just current one
    document.querySelectorAll('.step-button.editing').forEach(el => el.classList.remove('editing'));
  }
});

function openFunctionMenu(step) {
  const menu = document.getElementById('function-menu');
  menu.style.display = 'block';

  // Populate inputs with current step values or defaults
  document.getElementById('pitch').value = step.pitch || 1;
  document.getElementById('velocity').value = step.velocity || 1;
  document.getElementById('length').value = step.length || 1;

  // Save changes on input change:
  document.getElementById('pitch').oninput = e => step.pitch = parseFloat(e.target.value);
  document.getElementById('velocity').oninput = e => step.velocity = parseFloat(e.target.value);
  document.getElementById('length').oninput = e => step.length = parseInt(e.target.value);

  // You can also visually highlight the step while editing
  step.el.classList.add('editing');
}
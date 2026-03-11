import dft from "./dft.mjs";
import { WaveformEditor } from "./WaveformEditor.mjs";

const waveformEditor = new WaveformEditor();
waveformEditor.init();
waveformEditor.open();

const actx = new AudioContext();

const playbutton = document.getElementById("playbutton");
let wave;
let osc;
let playing = false;

playbutton.onclick = () => {
  playing = !playing;
  if (playing) {
    playbutton.textContent = "Stop";
  } else {
    playbutton.textContent = "Preview";
    if (osc) {
      osc.stop();
      osc.disconnect();
      return;
    }
  }
  if (osc) {
    osc.stop();
    osc.disconnect();
  }
  const signal = waveformEditor.getSignal();
  const { real, imag } = dft(signal);
  wave = actx.createPeriodicWave(real, imag);
  osc = actx.createOscillator();
  osc.setPeriodicWave(wave);
  osc.frequency.value = 440;
  osc.connect(actx.destination);
  osc.start();
};

const closebutton = document.getElementById("closebutton");
closebutton.onclick = () => {
  if (osc) {
    osc.stop();
    osc.disconnect();
  }
  waveformEditor.close();
};

let waveformEditorAnimationID = requestAnimationFrame(
  waveformEditor.draw.bind(waveformEditor),
);

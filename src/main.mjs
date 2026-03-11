import { WaveformEditor } from "./WaveformEditor.mjs";
import { Synth } from "./Synth.mjs";

const actx = new AudioContext();

const waveformEditor = new WaveformEditor(actx);

waveformEditor.init();

function noteToFrequency(note) {
  const A4 = 440;
  const freq = A4 * Math.pow(2, (note - 69) / 12);
  return freq;
}

let active_synth_id = null;

let synths = [];

function select_synth(id) {
  active_synth_id = id;
  const synth_elements = document.querySelectorAll(".Synth");
  synth_elements.forEach((element) => {
    if (element.id === `synth-${id}`) {
      element.classList.add("selected");
    } else {
      element.classList.remove("selected");
    }
  });
}

for (let i = 0; i < 3; i++) {
  const synth = new Synth(actx, waveformEditor, i + 1, select_synth);
  synth.addOscillator();
  synth.addOscillator();
  synths.push(synth);
}

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (active_synth_id !== null) {
    const synth = synths[active_synth_id - 1];
    let frequency = null;
    let dont_play = false;
    switch (event.key.toLowerCase()) {
      case "a":
        frequency = noteToFrequency(60); // C4
        break;
      case "w":
        frequency = noteToFrequency(61); // C#4
        break;
      case "s":
        frequency = noteToFrequency(62); // D4
        break;
      case "e":
        frequency = noteToFrequency(63); // D#4
        break;
      case "d":
        frequency = noteToFrequency(64); // E4
        break;
      case "f":
        frequency = noteToFrequency(65); // F4
        break;
      case "t":
        frequency = noteToFrequency(66);
        break;
      case "g":
        frequency = noteToFrequency(67);
        break;
      case "y":
        frequency = noteToFrequency(68);
        break;
      case "h":
        frequency = noteToFrequency(69);
        break;
      case "u":
        frequency = noteToFrequency(70);
        break;
      case "j":
        frequency = noteToFrequency(71);
        break;
      case "k":
        frequency = noteToFrequency(72);
        break;
      case "o":
        frequency = noteToFrequency(73);
        break;
      case "l":
        frequency = noteToFrequency(74);
        break;
      case "p":
        frequency = noteToFrequency(75);
        break;
      default:
        dont_play = true;
    }
    if (!dont_play && frequency !== null) {
      synth.oscillators.forEach((osc) => {
        osc.setFrequency(frequency);
        osc.start();
      });
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (active_synth_id !== null) {
    const synth = synths[active_synth_id - 1];
    synth.oscillators.forEach((osc) => {
      osc.stop();
    });
  }
});

//waveformEditor.open();

let waveformEditorAnimationID = requestAnimationFrame(
  waveformEditor.draw.bind(waveformEditor),
);

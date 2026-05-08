import { WaveformEditor } from "./WaveformEditor.mjs";
import { Synth } from "./Synth.mjs";
import { loadProjects } from "./ProjectManagement.mjs";

const actx = new AudioContext();

const waveformEditor = new WaveformEditor(actx);

waveformEditor.init();

await loadProjects();

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

const synth = new Synth(actx, waveformEditor, 1, select_synth);
synth.addOscillator();
synths.push(synth);

const add_synth_button = document.querySelector(".AddSynthButton");
add_synth_button.onclick = () => {
  const synth = new Synth(
    actx,
    waveformEditor,
    synths.length + 1,
    select_synth
  );
  synth.addOscillator();
  synths.push(synth);
};

document.addEventListener("keydown", async (event) => {
  await Tone.start();
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
      synth.triggerAttackRelease(frequency, "8n");
    }
  }
});

const information_panel = document.querySelector(".InformationPanel");

document.querySelector("#infobutton").onclick = () => {
  information_panel.classList.toggle("hide");
};

information_panel.onclick = () => {
  information_panel.classList.toggle("hide");
};

document
  .querySelector(".AddSynthButton")
  .addEventListener("click", async () => {
    await Tone.start();
    console.log("audio is ready");
    synths[0].triggerAttackRelease("C4", "2n");
  });

const TIMELINE_BASE_MIDI = 48;
const COLUMN_SUBDIVISION = "16n";

function timelineNoteToFreq(n) {
  return noteToFrequency(TIMELINE_BASE_MIDI + (n - 1));
}

const play_button = document.querySelector(".PlayButton");
const stop_button = document.querySelector(".StopButton");
const tempo_input = document.querySelector(".Tempo");

let parts = [];

function disposeParts() {
  parts.forEach((p) => p.dispose());
  parts = [];
}

play_button.onclick = async () => {
  // spela upp hela projektet

  await Tone.start();

  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.position = 0;
  disposeParts();

  Tone.Transport.bpm.value = parseFloat(tempo_input.value) || 100;

  const sixteenth = Tone.Time(COLUMN_SUBDIVISION).toSeconds();

  for (const synth of synths) {
    const events = synth.timeline.notes
      .filter((n) => n.length > 0)
      .map((n) => ({
        time: n.time * sixteenth,
        duration: n.length * sixteenth,
        freq: timelineNoteToFreq(n.note),
        velocity: 0.8,
      }));

    const part = new Tone.Part((time, ev) => {
      synth.triggerAttackRelease(ev.freq, ev.duration, time);
    }, events);

    part.start(0);
    parts.push(part);
  }

  Tone.Transport.start();
};

stop_button.onclick = () => {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  disposeParts();
};

let waveformEditorAnimationID = requestAnimationFrame(
  waveformEditor.draw.bind(waveformEditor)
);

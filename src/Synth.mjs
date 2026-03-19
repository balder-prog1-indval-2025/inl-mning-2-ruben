import { Oscillator } from "./Oscillator.mjs";

export class Synth {
  constructor(actx, editor, id = 0, selection_callback) {
    this.actx = actx;
    this.editor = editor;
    this.oscillators = [];
    this.synths_element = document.querySelector(".Synths");
    this.current_synth_element = document.createElement("div");
    this.current_synth_element_title = document.createElement("h2");
    this.current_synth_element_title.textContent = `Synth ${id}`;
    this.id = id;
    this.current_synth_element.classList.add("Synth");
    this.current_synth_element.id = `synth-${this.id}`;

    this.synth_panel = document.createElement("div");
    this.synth_panel.classList.add("SynthPanel");

    this.oscillator_wrapper = document.createElement("div");
    this.oscillator_wrapper.classList.add("OscillatorWrapper");

    this.add_oscillator_button = document.createElement("button");
    this.add_oscillator_button.innerText = "Add oscillator";
    this.add_oscillator_button.classList.add("OscillatorButton");

    this.add_oscillator_button.onclick = () => {
      this.addOscillator();
    };

    this.synth_panel.appendChild(this.current_synth_element_title);
    this.synth_panel.appendChild(this.oscillator_wrapper);
    this.synth_panel.appendChild(this.add_oscillator_button);

    this.timeline = document.createElement("canvas");
    this.timeline.classList.add("Timeline");

    this.current_synth_element.appendChild(this.timeline);
    this.current_synth_element.appendChild(this.synth_panel);

    this.synths_element.appendChild(this.current_synth_element);

    if (selection_callback) {
      this.current_synth_element.addEventListener("click", () => {
        selection_callback(this.id);
      });
    }
  }

  addOscillator() {
    console.log(this.actx);
    const osc = new Oscillator(this.actx);

    this.oscillators.push(osc);
    const osc_element = document.createElement("div");
    osc_element.classList.add("Oscillator");
    osc_element.innerHTML = `
        <h3>Oscillator ${this.oscillators.length}</h3>
    `;
    const osc_gain_slider = document.createElement("input");
    osc_gain_slider.type = "range";
    osc_gain_slider.id = `volume_s${this.id}_o${this.oscillators.length}`;
    osc_gain_slider.min = "0";
    osc_gain_slider.max = "2";
    osc_gain_slider.step = "0.01";
    osc_gain_slider.value = 1;

    osc_gain_slider.addEventListener("input", (event) => {
      osc.setGain(osc_gain_slider.value);
    });

    osc_element.appendChild(osc_gain_slider);

    const osc_octave_wrapper = document.createElement("div");
    osc_octave_wrapper.classList.add("OctaveWrapper");

    const octave_down = document.createElement("button");
    octave_down.innerText = "-";

    octave_down.onclick = () => {
      osc.octaveDown();
    };

    const octave_up = document.createElement("button");
    octave_up.innerText = "+";

    octave_up.onclick = () => {
      osc.octaveUp();
    };

    osc_octave_wrapper.appendChild(octave_down);
    osc_octave_wrapper.appendChild(octave_up);

    osc_element.appendChild(osc_octave_wrapper);

    const osc_edit_waveform_button = document.createElement("button");
    osc_edit_waveform_button.classList.add("edit-waveform");
    osc_edit_waveform_button.innerText = "Edit Waveform";
    osc_element.appendChild(osc_edit_waveform_button);

    this.oscillator_wrapper.appendChild(osc_element);

    const edit_waveform_button = osc_element.querySelector(".edit-waveform");
    edit_waveform_button.onclick = async () => {
      if (osc.osc) {
        osc.stop();
        osc.osc.disconnect();
      }
      const editedSignal = await this.editor.open(osc.getSignal());
      osc.define(editedSignal);
    };
  }

  playNote(note, time, beatLength) {
    this.oscillators.forEach((osc) => {
      osc.playNote(note, time, beatLength);
    });
  }
}

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
    this.current_synth_element.appendChild(this.current_synth_element_title);
    const UID = id;
    this.current_synth_element.classList.add("Synth");
    this.current_synth_element.id = `synth-${UID}`;
    this.synths_element.appendChild(this.current_synth_element);
    if (selection_callback) {
      this.current_synth_element.addEventListener("click", () => {
        selection_callback(UID);
      });
    }
  }

  addOscillator() {
    const osc = new Oscillator(this.actx);
    this.oscillators.push(osc);
    const osc_element = document.createElement("div");
    osc_element.classList.add("Oscillator");
    osc_element.innerHTML = `
        <h3>Oscillator ${this.oscillators.length}</h3>
        <button class="edit-waveform">Edit Waveform</button>
    `;
    this.current_synth_element.appendChild(osc_element);

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
}

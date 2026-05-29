import dft from "./dft.mjs";
import { Timeline } from "./Timeline.mjs";

export class Synth {
  constructor(actx, editor, id = 0, selection_callback) {
    this.actx = actx;
    this.editor = editor;
    this.oscillators = [];
    this.id = id;

    this.filter = new Tone.Filter(1500, "lowpass");
    this.distortion = new Tone.Distortion(0.5);
    this.reverb = new Tone.Reverb({ decay: 2, wet: 0.5 });
    this.filter.chain(this.distortion, this.reverb, Tone.getDestination());

    this.synths_element = document.querySelector(".Synths");
    this.current_synth_element = document.createElement("div");
    this.current_synth_element_title = document.createElement("h2");
    this.current_synth_element_title.textContent = `Synth ${id}`;
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

    this.reverb_label = document.createElement("label");
    this.reverb_label.classList.add("ReverbLabel");
    this.reverb_label.innerText = "Reverb";

    const reverb_slider = document.createElement("input");
    reverb_slider.type = "range";
    reverb_slider.min = 0;
    reverb_slider.max = 1;
    reverb_slider.step = 0.01;
    reverb_slider.value = 0.5;
    reverb_slider.classList.add("Reverb");
    this.reverb_slider = reverb_slider;

    reverb_slider.addEventListener("input", () => {
      this.reverb.wet.value = reverb_slider.value;
    });

    this.dist_label = document.createElement("label");
    this.dist_label.classList.add("DistortionLabel");
    this.dist_label.innerText = "Distortion";

    const dist_slider = document.createElement("input");
    dist_slider.type = "range";
    dist_slider.min = 0;
    dist_slider.max = 1;
    dist_slider.step = 0.01;
    dist_slider.value = 0.5;
    dist_slider.classList.add("Distortion");
    this.dist_slider = dist_slider;

    dist_slider.addEventListener("input", () => {
      this.distortion.wet.value = dist_slider.value;
    });

    this.synth_panel.appendChild(this.current_synth_element_title);
    this.synth_panel.appendChild(this.oscillator_wrapper);
    this.synth_panel.appendChild(this.add_oscillator_button);
    this.synth_panel.appendChild(this.reverb_label);
    this.synth_panel.appendChild(reverb_slider);
    this.synth_panel.appendChild(this.dist_label);
    this.synth_panel.appendChild(dist_slider);

    const timeline_canvas = document.createElement("canvas");
    timeline_canvas.classList.add("Timeline");
    timeline_canvas.tabIndex = 0;

    this.current_synth_element.appendChild(timeline_canvas);
    this.current_synth_element.appendChild(this.synth_panel);

    this.synths_element.appendChild(this.current_synth_element);

    if (selection_callback) {
      this.current_synth_element.addEventListener("click", () => {
        selection_callback(this.id);
      });
    }

    const ctx = timeline_canvas.getContext("2d");

    this.timeline = new Timeline(ctx);

    this.timeline.render();

    const observer = new ResizeObserver(() => this.timeline.resize());
    observer.observe(timeline_canvas);
  }

  triggerAttackRelease(note, duration, time) {
    this.oscillators.forEach((osc) => {
      let freq = note * Math.pow(2, osc.octave);
      osc.osc.triggerAttackRelease(freq, duration, time);
    });
  }

  addOscillator() {
    //console.log(this.actx);

    let partials = [0];
    for (let i = 1; i < 256; i++) {
      partials.push(0);
    }

    const oscillator = {
      osc: new Tone.Synth({
        oscillator: {
          type: "custom",
          partials: partials,
        },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 },
        volume: 0,
      }),
      signal: partials,
      octave: 0,
      gain: 1,
    };
    oscillator.osc.connect(this.filter);

    this.oscillators.push(oscillator);

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

    osc_element.appendChild(osc_gain_slider);
    oscillator.gain_slider = osc_gain_slider;

    const osc_octave_wrapper = document.createElement("div");
    osc_octave_wrapper.classList.add("OctaveWrapper");

    const octave_down = document.createElement("button");
    octave_down.innerText = "-";

    const octave_up = document.createElement("button");
    octave_up.innerText = "+";

    osc_octave_wrapper.appendChild(octave_down);
    osc_octave_wrapper.appendChild(octave_up);

    osc_element.appendChild(osc_octave_wrapper);

    const osc_edit_waveform_button = document.createElement("button");
    osc_edit_waveform_button.classList.add("edit-waveform");
    osc_edit_waveform_button.innerText = "Edit Waveform";
    osc_element.appendChild(osc_edit_waveform_button);

    this.oscillator_wrapper.appendChild(osc_element);

    const edit_waveform_button = osc_element.querySelector(".edit-waveform");

    osc_gain_slider.addEventListener("input", (event) => {
      const linear = parseFloat(osc_gain_slider.value);
      oscillator.gain = linear;
      oscillator.osc.volume.value =
        linear > 0 ? 20 * Math.log10(linear) : -Infinity;
    });

    octave_down.onclick = () => {
      oscillator.octave--;
    };
    octave_up.onclick = () => {
      oscillator.octave++;
    };

    edit_waveform_button.onclick = async () => {
      const editedSignal = await this.editor.open(oscillator.signal);
      oscillator.signal = editedSignal;
      const { real, imag } = dft(editedSignal);
      const partials = [];
      for (let i = 1; i < real.length; i++) {
        partials.push(Math.sqrt(real[i] * real[i] + imag[i] * imag[i]));
      }
      oscillator.osc.oscillator.partials = partials;
    };

    return oscillator;
  }
}

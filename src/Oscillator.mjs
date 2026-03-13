import dft from "./dft.mjs";

export class Oscillator {
  constructor(actx) {
    this.actx = actx;
    this.osc = null;
    this.wave = null;
    this.osc_started = false;
    this.signal = [];
    for (let i = 0; i < 256; i++) {
      this.signal.push(0);
    }
    this.frequency = 440;

    this.gain = 1;
    this.octave = 0;
    this.gainNode = null;

    // default to sine wave
    const { real, imag } = dft(
      this.signal.map((_, i) =>
        Math.sin((i / this.signal.length) * 2 * Math.PI)
      )
    );
    this.wave = this.actx.createPeriodicWave(real, imag);
  }

  #createReverb(duration = 2, decay = 2) {
    const sampleRate = this.actx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.actx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // random noise that decays exponentially
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    const convolver = this.actx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  define(signal) {
    this.signal = signal;
    if (this.osc && this.osc_started) {
      this.osc.stop();
      this.osc.disconnect();
      this.osc_started = false;
    }
    const { real, imag } = dft(this.signal);
    this.wave = this.actx.createPeriodicWave(real, imag);
    this.osc = this.actx.createOscillator();
    this.osc.setPeriodicWave(this.wave);
    this.osc.frequency.value = this.frequency;

    //this.osc.connect(this.gainNode).connect(this.actx.destination);
  }

  setFrequency(frequency) {
    this.frequency = frequency;
    if (this.osc) {
      this.osc.frequency.value = this.frequency * Math.pow(2, this.octave);
    }
  }

  getSignal() {
    return this.signal;
  }

  setGain(gain) {
    this.gain = gain;
    if (this.gainNode) {
      this.gainNode.gain.value = this.gain;
    }
  }

  octaveUp() {
    this.octave++;
    this.setFrequency(this.frequency);
    console.log(this.octave);
  }

  octaveDown() {
    this.octave--;
    this.setFrequency(this.frequency);
    console.log(this.octave);
  }

  start() {
    if (this.osc && this.osc_started) {
      this.osc.stop();
      this.osc.disconnect();
      this.osc_started = false;
    }
    this.osc = this.actx.createOscillator();
    this.osc.setPeriodicWave(this.wave);
    this.osc.frequency.value = this.frequency * Math.pow(2, this.octave);

    this.gainNode = this.actx.createGain();
    this.gainNode.gain.value = this.gain;

    const reverb = this.#createReverb(2, 2);
    const dry = this.actx.createGain();
    const wet = this.actx.createGain();

    dry.gain.value = 0.5;
    wet.gain.value = 0.5;

    this.osc.connect(this.gainNode);
    this.osc.connect(dry);
    this.osc.connect(reverb);
    reverb.connect(wet);
    dry.connect(this.actx.destination);
    wet.connect(this.actx.destination);
    this.osc.start();
    this.osc_started = true;
  }

  stop() {
    if (this.osc && this.osc_started) {
      this.osc.stop();
      this.osc_started = false;
      //this.osc.disconnect();
    }
  }
}

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

    // default to sine wave
    const { real, imag } = dft(this.signal.map((_, i) =>
      Math.sin((i / this.signal.length) * 2 * Math.PI)
    ));
    this.wave = this.actx.createPeriodicWave(real, imag);
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
    this.osc.connect(this.actx.destination);
  }

  setFrequency(frequency) {
    this.frequency = frequency;
    if (this.osc) {
      this.osc.frequency.value = this.frequency;
    }
  }

  getSignal() {
    return this.signal;
  }

  start() {
    if (this.osc && this.osc_started) {
      this.osc.stop();
      this.osc.disconnect();
      this.osc_started = false;
    }
    this.osc = this.actx.createOscillator();
    this.osc.setPeriodicWave(this.wave);
    this.osc.frequency.value = this.frequency;
    this.osc.connect(this.actx.destination);
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

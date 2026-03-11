export class WaveformEditor {
  constructor() {
    this.signal = [];
    this.canvas = document.getElementById("waveform");
    this.ctx = this.canvas.getContext("2d");
    this.mouse_is_down = false;
    this.mouse_position = { x: 0, y: 0 };
    this.last_position = null;

    for (let i = 0; i < this.canvas.width; i++) {
      this.signal.push(0);
    }
  }

  #setmouseposition(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse_position.x = event.clientX - rect.left;
    this.mouse_position.y = event.clientY - rect.top;
  }

  #mouseupevent() {
    this.mouse_is_down = false;
  }

  #mousemoveevent(event) {
    if (!this.mouse_is_down) return;
    this.#setmouseposition(event);

    if (
      this.mouse_position.x < 0 ||
      this.mouse_position.x > this.canvas.width - 1 ||
      this.mouse_position.y < 0 ||
      this.mouse_position.y > this.canvas.height - 1
    )
      return;

    const sample = -((this.mouse_position.y / this.canvas.height) * 2 - 1);
    if (this.last_position === null) {
      this.signal[Math.round(this.mouse_position.x)] = sample;
    } else {
      // interpolate between last and current position
      const x0 = Math.round(this.last_position.x);
      const x1 = Math.round(this.mouse_position.x);
      const y0 = this.last_position.sample;
      const y1 = sample;
      const step = x0 <= x1 ? 1 : -1;

      for (let x = x0; x !== x1 + step; x += step) {
        if (x < 0 || x >= this.signal.length) continue;
        const t = (x - x0) / (x1 - x0 || 1);
        this.signal[x] = y0 + t * (y1 - y0);
      }
    }

    this.last_position = { x: this.mouse_position.x, sample };
  }

  #mousedownevent(event) {
    this.mouse_is_down = true;
    this.last_position = null;
    this.#setmouseposition(event);
  }

  #drawLine(x0, y0, x1, y1) {
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
  }

  draw() {
    this.ctx.fillStyle = "rgb(0,0,30)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 0.3;
    let gridCount = 8;
    for (let i = 0; i <= gridCount; i++) {
      let x = (i / gridCount) * this.canvas.width;
      this.#drawLine(x, 0, x, this.canvas.height);
    }
    for (let i = 0; i <= gridCount; i++) {
      let y = (i / gridCount) * this.canvas.height;
      this.#drawLine(0, y, this.canvas.width, y);
    }
    this.ctx.strokeStyle = "rgb(30,255,30)";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2);
    for (let i = 0; i < this.signal.length; i++) {
      let x = i;
      let y =
        this.canvas.height / 2 - (this.signal[i] * this.canvas.height) / 2;
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    requestAnimationFrame(this.draw.bind(this));
  }

  init() {
    window.addEventListener("load", () => {
      document.addEventListener("mousedown", this.#mousedownevent.bind(this));
      document.addEventListener("mouseup", this.#mouseupevent.bind(this));
      document.addEventListener("mousemove", this.#mousemoveevent.bind(this));
    });
  }

  getSignal() {
    return this.signal;
  }

  open(signal) {
    this.canvas.closest(".WaveformEditor").classList.remove("hide");
    if (signal) {
      this.signal = signal;
    }
  }

  close() {
    this.canvas.closest(".WaveformEditor").classList.add("hide");
  }
}

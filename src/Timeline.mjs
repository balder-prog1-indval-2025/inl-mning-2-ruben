export class Timeline {
  constructor(ctx) {
    this.ctx = ctx;
  }

  resize() {
    this.ctx.canvas.width = this.ctx.canvas.clientWidth;
    this.ctx.canvas.height = this.ctx.canvas.clientHeight;
    //console.log(this.ctx.canvas.width);
  }

  render(track) {
    const W = this.ctx.canvas.width;
    const H = this.ctx.canvas.height;
    this.ctx.fillStyle = "rgb(0,0,30)";
    this.ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 12; i++) {
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 0.3;
      this.ctx.beginPath();
      this.ctx.moveTo(0, (i * H) / 12);
      this.ctx.lineTo(W, (i * H) / 12);
      this.ctx.stroke();
    }

    requestAnimationFrame(this.render.bind(this));
  }
}

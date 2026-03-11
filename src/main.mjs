import dft from "./dft.mjs";

const canvas = document.getElementById("waveform");

const ctx = canvas.getContext("2d");

window.addEventListener("load", () => {
  document.addEventListener("mousedown", mousedownevent);
  document.addEventListener("mouseup", mouseupevent);
  document.addEventListener("mousemove", mousemoveevent);
});

let mouse_is_down = false;

let mouse_position = { x: 0, y: 0 };

function setmouseposition(event) {
  mouse_position.x = event.clientX - canvas.offsetLeft;
  mouse_position.y = event.clientY - canvas.offsetTop;
}

function mouseupevent() {
  mouse_is_down = false;
}

let signal = [];
for (let i = 0; i < canvas.width; i++) {
  signal.push(0);
}

let last_position = null;

function mousemoveevent(event) {
  if (!mouse_is_down) return;
  setmouseposition(event);

  if (
    mouse_position.x < 0 ||
    mouse_position.x > ctx.canvas.width - 1 ||
    mouse_position.y < 0 ||
    mouse_position.y > ctx.canvas.height - 1
  )
    return;

  const sample = -((mouse_position.y / ctx.canvas.height) * 2 - 1);

  if (last_position === null) {
    signal[Math.round(mouse_position.x)] = sample;
  } else {
    // interpolate between last and current position
    const x0 = Math.round(last_position.x);
    const x1 = Math.round(mouse_position.x);
    const y0 = last_position.sample;
    const y1 = sample;
    const step = x0 <= x1 ? 1 : -1;

    for (let x = x0; x !== x1 + step; x += step) {
      if (x < 0 || x >= signal.length) continue;
      const t = (x - x0) / (x1 - x0 || 1);
      signal[x] = y0 + t * (y1 - y0);
    }
  }

  last_position = { x: mouse_position.x, sample };
}

function mousedownevent(event) {
  mouse_is_down = true;
  last_position = null; // reset on new stroke
  setmouseposition(event);
}

function draw() {
  ctx.fillStyle = "rgb(200,200,200)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, ctx.canvas.height / 2);
  ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
  ctx.stroke();

  //console.log(mouse_position);
  //console.log(signal);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, ctx.canvas.height / 2);
  for (let i = 0; i < signal.length; i++) {
    let x = i;
    let y = canvas.height / 2 - (signal[i] * canvas.height) / 2;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    //ctx.fillRect(x, y - 1, 1, 1);
    ctx.lineTo(x, y);
    //console.log(y);
  }
  ctx.stroke();
  requestAnimationFrame(draw);
}

const actx = new AudioContext();

const playbutton = document.getElementById("playbutton");
let wave;
let osc;

playbutton.onclick = () => {
  if (osc) {
    osc.stop();
    osc.disconnect();
  }

  const { real, imag } = dft(signal);
  wave = actx.createPeriodicWave(real, imag);
  osc = actx.createOscillator();
  osc.setPeriodicWave(wave);
  osc.frequency.value = 440;
  osc.connect(actx.destination);
  osc.start();
};

requestAnimationFrame(draw);

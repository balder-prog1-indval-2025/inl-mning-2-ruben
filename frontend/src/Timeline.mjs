export class Timeline {
  constructor(ctx) {
    this.ctx = ctx;
    console.log(this.ctx.canvas);

    this.vertCount = 24;
    this.horizCount = 32;

    this.timeline_x_offset = 0;
    this.target_timeline_x_offset = 0;

    this.scroll_power = 40;
    this.scroll_lerp_value = 0.2;

    this.notes = [];

    this.onNoteEdge = { value: false, index: 0 };
    this.resizing_note = false;

    this.ctx.canvas.addEventListener("mousemove", (event) => {
      let mouse_pos = this.#getMousePos(event);
      mouse_pos.x += this.timeline_x_offset;

      if (this.resizing_note) {
        let note = this.notes[this.onNoteEdge.index];
        let noteX = (note.time * this.ctx.canvas.width) / this.horizCount;
        let distance = mouse_pos.x - noteX;
        let new_length = distance / (this.ctx.canvas.width / this.horizCount);

        this.notes[this.onNoteEdge.index].length = new_length;
        //console.log(new_length);

        return;
      }

      this.onNoteEdge.value = false;

      for (let i = 0; i < this.notes.length; i++) {
        let note = this.notes[i];
        let x =
          ((note.time + note.length) * this.ctx.canvas.width) / this.horizCount;
        let y =
          ((this.vertCount - note.note) * this.ctx.canvas.height) /
          this.vertCount;
        let note_height = this.ctx.canvas.height / this.vertCount;
        if (mouse_pos.x > x - 10 && mouse_pos.x < x + 10) {
          if (mouse_pos.y > y && mouse_pos.y < y + note_height) {
            //console.log("edge");
            this.onNoteEdge.value = true;
            this.onNoteEdge.index = i;
          }
        }
      }
      if (this.onNoteEdge.value) {
        if (!this.ctx.canvas.classList.contains("edit")) {
          this.ctx.canvas.classList.add("edit");
        }
      } else {
        if (this.ctx.canvas.classList.contains("edit")) {
          this.ctx.canvas.classList.remove("edit");
        }
      }
      //console.log(this.ctx.canvas.classList);
      //console.log(this.onNoteEdge);
    });

    this.ctx.canvas.addEventListener("mousedown", (event) => {
      if (this.onNoteEdge.value) {
        console.log("resizing");
        this.resizing_note = true;
      } else {
        this.resizing_note = false;
      }
      const mouse_pos = this.#getMousePos(event);

      for (let i = 0; i < this.notes.length; i++) {}
      console.log("mouse");
    });

    this.ctx.canvas.addEventListener("mouseup", (event) => {
      if (this.resizing_note) {
        this.notes[this.onNoteEdge.index].length = Math.round(
          this.notes[this.onNoteEdge.index].length
        );
        this.resizing_note = false;
      }
    });

    this.ctx.canvas.addEventListener("click", (event) => {
      console.log(this.resizing_note);
      if (this.onNoteEdge.value) {
        return;
      }

      // get mouse x and y
      let mouse_pos = this.#getMousePos(event);
      mouse_pos.x += this.timeline_x_offset;

      const vertical_index = Math.floor(
        (this.vertCount * mouse_pos.y) / this.ctx.canvas.height
      );
      const horizontal_index = Math.floor(
        (this.horizCount * mouse_pos.x) / this.ctx.canvas.width
      );

      let time = horizontal_index;
      let note = this.vertCount - vertical_index;
      let length = 1;

      let add = true;

      for (let i = 0; i < this.notes.length; i++) {
        const current_note = this.notes[i];
        if (current_note.time == time && current_note.note == note) {
          this.notes.splice(i, 1);
          add = false;
        } else if (current_note.note == note) {
          for (let j = 0; j < current_note.length; j++) {
            let off_time = current_note.time + j;
            if (off_time == time) {
              current_note.length = j;
            }
          }
        }
      }

      if (add) this.notes.push({ time, note, length });

      console.log(this.notes);

      //console.log(horizontal_index);
      //console.log(vertical_index);
      //console.log(mouse_pos);
    });

    this.ctx.canvas.addEventListener("keydown", (event) => {
      console.log(event.key);
      if (event.key == "ArrowRight") {
        this.target_timeline_x_offset += this.scroll_power;
      }
      if (event.key == "ArrowLeft") {
        this.target_timeline_x_offset -= this.scroll_power;
      }
      if (this.target_timeline_x_offset < 0) {
        this.target_timeline_x_offset = 0;
      }
    });
  }

  resize() {
    this.ctx.canvas.width = this.ctx.canvas.clientWidth;
    this.ctx.canvas.height = this.ctx.canvas.clientHeight;
    //console.log(this.ctx.canvas.width);
  }

  #getMousePos(evt) {
    let canvas = this.ctx.canvas;
    let rect = canvas.getBoundingClientRect(),
      scaleX = canvas.width / rect.width,
      scaleY = canvas.height / rect.height;

    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  }

  #drawLine(x0, y0, x1, y1) {
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
  }

  render(track) {
    const W = this.ctx.canvas.width;
    const H = this.ctx.canvas.height;
    this.ctx.clearRect(0, 0, W, H);
    this.ctx.fillStyle = "rgb(0,0,30)";
    this.ctx.fillRect(0, 0, W, H);

    for (let i = 0; i <= this.vertCount; i++) {
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 0.3;
      this.#drawLine(0, (i * H) / this.vertCount, W, (i * H) / this.vertCount);

      let note_key = (this.vertCount - i) % 12;
      let white = false;
      switch (note_key) {
        case 0:
          white = true;
          break;
        case 2:
          white = true;
          break;
        case 4:
          white = true;
          break;
        case 5:
          white = true;
          break;
        case 7:
          white = true;
          break;
        case 9:
          white = true;
          break;
        case 11:
          white = true;
          break;
        default:
          white = false;
      }

      if (white) {
        this.ctx.fillStyle = "rgba(255,255,255,0.2)";
        this.ctx.fillRect(0, (i * H) / this.vertCount, W, -H / this.vertCount);
      }
    }

    const lerp = (x, y, a) => x * (1 - a) + y * a;

    this.timeline_x_offset = lerp(
      this.timeline_x_offset,
      this.target_timeline_x_offset,
      this.scroll_lerp_value
    );

    this.render_x_off = this.timeline_x_offset % (W / this.horizCount);
    //this.timeline_x_offset += 0.1;
    console.log(this.render_x_off);

    for (let i = 0; i <= this.horizCount; i++) {
      this.ctx.lineWidth = 0.3;
      //W / this.horizCount;

      let scrolled_cells = Math.floor(
        this.timeline_x_offset / (W / this.horizCount)
      );
      let bar_index = i + scrolled_cells;
      if (bar_index % 4 == 0) {
        this.ctx.lineWidth = 0.8;
      }
      if (bar_index % 16 == 0) {
        this.ctx.lineWidth = 1.5;
      }

      this.#drawLine(
        (i * W) / this.horizCount - this.render_x_off,
        0,
        (i * W) / this.horizCount - this.render_x_off,
        H
      );
    }

    for (let note of this.notes) {
      const x = (note.time * W) / this.horizCount - this.timeline_x_offset;
      const note_position = this.vertCount - note.note;
      const y = (note_position * H) / this.vertCount;
      const note_w = (note.length * W) / this.horizCount;
      const note_h = H / this.vertCount;

      this.ctx.fillStyle = "rgb(30,220,30)";
      this.ctx.fillRect(x, y, note_w, note_h);

      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 1.2;

      this.ctx.beginPath();
      this.ctx.rect(x, y, note_w, note_h);
      this.ctx.stroke();
    }

    requestAnimationFrame(this.render.bind(this));
  }
}

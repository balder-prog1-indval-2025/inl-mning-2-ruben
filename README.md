todo
klassdiagram

# mjusik

A browser-based music creation tool. Draw your own oscillator waveforms,
build synths from those oscillators, and arrange notes on per-synth piano
rolls to compose short pieces.

## Features

- **Custom waveform editor.** Draw a waveform freehand on a canvas; the
  app runs a DFT on your sample buffer and feeds the resulting harmonic
  partials into a `Tone.Synth` so the oscillator sounds exactly like
  what you drew.
- **Multi-synth, multi-oscillator architecture.** Add as many synths as
  you want; each synth holds one or more oscillators that are summed
  together. Per-oscillator volume and octave shift.
- **Per-synth effects.** Lowpass filter into distortion into reverb,
  with sliders for distortion amount and reverb wet level.
- **Piano roll per synth.** Click cells to place notes, click further
  right of an existing note to extend its length. Each synth has its
  own row of notes and plays back independently.
- **Live keyboard playing.** Select a synth and play it from the
  computer keyboard in a piano-style layout (`A W S E D F T G Y H U J
K O L P` covers C4–D#5 chromatically).
- **Transport.** Tempo input (BPM), play, and stop buttons trigger every
  synth's timeline together via `Tone.Transport` and `Tone.Part`.
- **In-app help.** Click the info button in the top-right of the
  toolbar for usage instructions and the full keyboard reference.

## Running it

The project is plain HTML + ES modules with no build step. Open
`index.html` through any local static server, e.g.:

```
npx serve .
```

then visit the printed URL. Opening `index.html` directly via
`file://` will fail because the browser blocks ES module imports from
the local filesystem.

`Tone.js` is loaded from `unpkg.com` at runtime — an internet
connection is required on first load.

## How to use

1. The app starts with one synth already created. Click on it to select
   it (it will highlight).
2. **Draw a waveform.** Every oscillator is silent until you draw its
   waveform. Press _Edit Waveform_ on the oscillator, draw a shape on
   the canvas, press _Preview_ to hear it, then _Close_ to apply.
3. Play the selected synth from your keyboard, or click cells on its
   timeline to write notes.
4. Add more oscillators (stacked into the same synth) or more synths
   (separate timelines) as you go. Tweak distortion and reverb per
   synth.
5. Set the BPM in the toolbar and press the green play button to play
   back every synth's timeline together. The red stop button halts
   playback.

## Project layout

```
index.html                  Markup for toolbar, info panel, waveform
                            editor, synths container.
public/
  Page.css                  Toolbar, app shell, layout.
  Synth.css                 Synth panels, oscillator rows, sliders.
  WaveformEditorStyle.css   Waveform editor modal.
  InformationPanel.css      Info overlay shown by the info button.
src/
  main.mjs                  App entry. Wires up the audio context,
                            the starting synth, the Add-synth button,
                            transport (play/stop/tempo), and the
                            global keyboard-to-note handler.
  Synth.mjs                 Synth class: builds the DOM for a synth
                            panel (oscillator list, reverb/distortion
                            sliders, timeline canvas), routes audio
                            through filter → distortion → reverb →
                            destination, manages oscillators.
  Oscillator.mjs            Per-oscillator helpers.
  WaveformEditor.mjs        Modal canvas editor. Captures mouse drags
                            into a sample buffer and converts to a
                            periodic wave via DFT for preview/apply.
  Timeline.mjs              Per-synth piano roll. Mouse to add/extend
                            notes, arrow keys to scroll horizontally.
  dft.mjs                   Discrete Fourier transform used to turn
                            drawn waveforms into harmonic partials.
icons/                      SVG icons for play, stop, info.
```

## Tech

- Vanilla HTML / CSS / ES modules — no bundler, no framework.
- [Tone.js](https://tonejs.github.io/) for synthesis, effects, and
  scheduling (`Tone.Synth`, `Tone.Filter`, `Tone.Distortion`,
  `Tone.Reverb`, `Tone.Transport`, `Tone.Part`).
- A small hand-written DFT in `src/dft.mjs` for converting
  freehand-drawn waveforms into harmonic partials.

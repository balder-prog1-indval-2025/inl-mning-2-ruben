export default function dft(samples) {
  // direct fourier transforn - omvandlar signalsampeln ett fourieruttryck
  const N = samples.length;
  const real = new Float32Array(N / 2);
  const imag = new Float32Array(N / 2);

  for (let k = 0; k < N / 2; k++) {
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real[k] += samples[n] * Math.cos(angle);
      imag[k] -= samples[n] * Math.sin(angle);
    }
    // normalize
    real[k] /= N;
    imag[k] /= N;
  }

  return { real, imag };
}

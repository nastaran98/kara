// A synthesized clap — no audio asset, just a few short bursts of
// filtered noise. A real clap is mostly a broadband transient with a
// fast decay, not a tone, so noise through a bandpass filter reads
// convincingly close without needing anything to load.
export function playClapSound() {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // A few quick claps in succession, the last one landing a touch
    // louder — like a short round of applause, not a single pop.
    const clapOffsets = [0, 0.09, 0.17, 0.29];

    clapOffsets.forEach((offset, index) => {
      const duration = 0.09;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.22));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1500 + Math.random() * 800;
      bandpass.Q.value = 0.7;

      const gain = ctx.createGain();
      const peak = index === clapOffsets.length - 1 ? 0.5 : 0.32;
      gain.gain.setValueAtTime(peak, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + duration);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now + offset);
      noise.stop(now + offset + duration);
    });

    // Sounds finish well under a second — close the context afterward
    // so repeated celebrations don't leak AudioContexts.
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 900);
  } catch {
    // The clap is a flourish, never a requirement — fail silently.
  }
}

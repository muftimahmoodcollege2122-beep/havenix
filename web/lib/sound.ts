let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) ctx = new AudioCtor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/**
 * A short, soft two-note "pop-chime" — deliberately tiny (under 300ms) so it
 * reads as a confirmation tick rather than a jingle. Synthesized rather than
 * an audio file so there's nothing to host or preload.
 */
export function playAddToCartChime() {
  const audioCtx = getCtx();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const notes: [number, number][] = [
    [880, now], // A5
    [1318.5, now + 0.09], // E6 — a bright little lift
  ];

  notes.forEach(([freq, start]) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}

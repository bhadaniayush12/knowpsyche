// Optional "Sound & vibration" feedback for right and wrong answers. Off on every page load: the choice
// lives in one variable and is never stored. Tones are made with the Web Audio API (no audio files), and
// the audio context is only created when someone switches this on, so nothing can play at page load.

let enabled = false;
let audio: AudioContext | null = null;

const AudioCtx = (): typeof AudioContext | undefined =>
  window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

/** Wires a `[data-feedback-toggle]` switch (role="switch"). The click that turns it on also unlocks audio. */
export function bindFeedbackToggle(root: ParentNode = document) {
  const toggle = root.querySelector<HTMLButtonElement>('[data-feedback-toggle]');
  if (!toggle) return;
  toggle.setAttribute('aria-checked', 'false');
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    toggle.setAttribute('aria-checked', String(enabled));
    if (!enabled) return;
    const Ctx = AudioCtx();
    if (!Ctx) return;
    audio ??= new Ctx();
    if (audio.state === 'suspended') void audio.resume();
  });
}

/** One soft note: a quick fade in and a gentle fade out, so it never clicks or startles. */
function note(ctx: AudioContext, at: number, freq: number, type: OscillatorType, length: number, peak: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

/**
 * Plays the right/wrong cue, only if the person switched it on. Right = two rising soft notes,
 * wrong = one low, muted note. Vibration only where `navigator.vibrate` exists, and not with
 * reduced motion, since a buzz is movement too.
 */
export function cue(kind: 'right' | 'wrong') {
  if (!enabled) return;
  if (audio && audio.state === 'running') {
    const t = audio.currentTime + 0.005;
    if (kind === 'right') {
      note(audio, t, 660, 'sine', 0.14, 0.07);
      note(audio, t + 0.07, 880, 'sine', 0.16, 0.06);
    } else {
      note(audio, t, 220, 'triangle', 0.22, 0.08);
    }
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && typeof navigator.vibrate === 'function') navigator.vibrate(kind === 'right' ? 12 : [24, 40, 24]);
}

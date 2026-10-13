// Small browser helpers shared by the test pages. Nothing here stores or sends anything.

/**
 * Asks before leaving the page while `inProgress()` is true, so a stray refresh or back swipe
 * doesn't throw away a half-finished test. Browsers show their own wording; the message is a fallback.
 */
export function guardLeave(inProgress: () => boolean, message: string) {
  window.addEventListener('beforeunload', (e) => {
    if (!inProgress()) return;
    e.preventDefault();
    e.returnValue = message;
    return message;
  });
}

/**
 * True while at least `ratio` of `el` is on screen. Used so number keys only answer
 * the test when people can see it, not while they're reading the FAQ further down.
 */
export function onScreen(el: Element, ratio = 0.35): () => boolean {
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (visible = e.intersectionRatio >= ratio), { threshold: [0, ratio, 1] }).observe(el);
  }
  return () => visible;
}

/** Copies `text()` when `button` is pressed and says so in `status` (a polite live region). */
export function bindCopy(button: HTMLElement, status: HTMLElement, text: () => string, done = 'Copied.') {
  button.addEventListener('click', async () => {
    const t = text();
    try {
      await navigator.clipboard.writeText(t);
      status.textContent = done;
    } catch {
      status.textContent = t;
    }
  });
}

/** "13 Oct 2026" — for copied scores, so people can compare later. */
export function today(): string {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Runs for `ms`, checked every frame against performance.now(), so display times never drift
 * the way chained setTimeouts do. `onFrame` gets progress 0–1. `onDone` gets the frame's timestamp:
 * anything it changes is painted at the end of that frame, so it's the onset time for a stimulus.
 * Pass that timestamp as `from` to time the next step from the painted frame; otherwise it starts
 * mid-frame and every step ends one frame late. Returns a cancel function.
 */
export function runFor(
  ms: number,
  onDone: (frameTime: number) => void,
  onFrame?: (progress: number) => void,
  from = performance.now(),
): () => void {
  const start = from;
  let frame = 0;
  const tick = (now: number) => {
    // Frame timestamps jitter by a fraction of a ms. Without the 1 ms allowance, a step that ends
    // exactly on a frame boundary (500 ms = 30 frames at 60 Hz) can slip a whole frame.
    const elapsed = now - start;
    const p = elapsed >= ms - 1 ? 1 : Math.max(0, elapsed / ms);
    onFrame?.(p);
    if (p >= 1) {
      onDone(now);
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  onFrame?.(0);
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

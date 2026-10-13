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

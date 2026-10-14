// "Play once when it scrolls into view" for the homepage motion. Calls `play` with the elements that just
// came on screen (in page order), then stops watching them. With reduced motion, or without
// IntersectionObserver, it plays everything at once so the final state shows straight away.

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function onceInView(els: Element[], play: (entered: Element[]) => void, threshold = 0.15) {
  if (els.length === 0) return;
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    play(els);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      const entered = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      if (entered.length === 0) return;
      entered.forEach((el) => io.unobserve(el));
      play(entered.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)));
    },
    { threshold },
  );
  els.forEach((el) => io.observe(el));
}

/** The site easing, cubic-bezier(.45, .05, .25, 1) (--ease-house), for animations run from script. */
export function easeHouse(t: number): number {
  const [x1, y1, x2, y2] = [0.45, 0.05, 0.25, 1];
  const bez = (u: number, a: number, b: number) => 3 * a * u * (1 - u) ** 2 + 3 * b * u ** 2 * (1 - u) + u ** 3;
  // Find u with x(u) = t by bisection (x is increasing), then return y(u).
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, x1, x2) < t) lo = mid;
    else hi = mid;
  }
  return bez((lo + hi) / 2, y1, y2);
}

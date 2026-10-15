/**
 * Moves a BandScale's "You · N" marker to `pct` (0–100 along the bar) and sets its label.
 * The label is centred on the marker and kept inside the card at both ends by the CSS in BandScale.astro (reads `--p`).
 */
export function placeMarker(scope: ParentNode, pct: number, text: string): void {
  const marker = scope.querySelector<HTMLElement>('[data-r="marker"]');
  const label = scope.querySelector<HTMLElement>('[data-r="marker-label"]');
  if (!marker || !label) return;
  const p = Math.max(0, Math.min(100, pct));
  marker.style.left = `${p}%`;
  label.style.setProperty('--p', String(p));
  label.textContent = text;
}

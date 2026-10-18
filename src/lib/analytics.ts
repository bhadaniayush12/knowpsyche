/** Send only caller-supplied, non-sensitive event metadata through the existing GA4 tag. */
export function trackEvent(name: string, params: Record<string, string | number>): void {
  try {
    if (typeof window === 'undefined') return;
    const gtag = (window as Window & { gtag?: (command: string, event: string, data: typeof params) => void }).gtag;
    if (typeof gtag === 'function') gtag('event', name, params);
  } catch {
    // Analytics must never interrupt a test (including when an extension blocks the tag).
  }
}

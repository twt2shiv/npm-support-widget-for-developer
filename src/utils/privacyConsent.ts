const HOUR_MS = 60 * 60 * 1000;

function key(widgetId: string): string {
  return `ajaxter_privacy_dismiss_${widgetId}`;
}

export function getPrivacyDismissedAt(widgetId: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(key(widgetId));
    if (v == null) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** After dismiss, banner stays hidden until one hour has passed */
export function shouldShowPrivacyNotice(widgetId: string): boolean {
  const at = getPrivacyDismissedAt(widgetId);
  if (at == null) return true;
  return Date.now() - at >= HOUR_MS;
}

export function dismissPrivacyNotice(widgetId: string): void {
  try {
    localStorage.setItem(key(widgetId), String(Date.now()));
  } catch {
    /* ignore quota / private mode */
  }
}

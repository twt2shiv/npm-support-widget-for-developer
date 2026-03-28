const HOUR_MS = 60 * 60 * 1000;
function key(widgetId) {
    return `ajaxter_privacy_dismiss_${widgetId}`;
}
export function getPrivacyDismissedAt(widgetId) {
    if (typeof window === 'undefined')
        return null;
    try {
        const v = localStorage.getItem(key(widgetId));
        if (v == null)
            return null;
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : null;
    }
    catch (_a) {
        return null;
    }
}
/** After dismiss, banner stays hidden until one hour has passed */
export function shouldShowPrivacyNotice(widgetId) {
    const at = getPrivacyDismissedAt(widgetId);
    if (at == null)
        return true;
    return Date.now() - at >= HOUR_MS;
}
export function dismissPrivacyNotice(widgetId) {
    try {
        localStorage.setItem(key(widgetId), String(Date.now()));
    }
    catch (_a) {
        /* ignore quota / private mode */
    }
}

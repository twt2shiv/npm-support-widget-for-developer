export function sessionKey(widgetId) {
    return `ajaxter_widget_session_${widgetId}`;
}
export function loadSession(widgetId) {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = sessionStorage.getItem(sessionKey(widgetId));
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch (_a) {
        return null;
    }
}
export function saveSession(widgetId, state) {
    try {
        sessionStorage.setItem(sessionKey(widgetId), JSON.stringify(state));
    }
    catch (_a) {
        /* quota */
    }
}

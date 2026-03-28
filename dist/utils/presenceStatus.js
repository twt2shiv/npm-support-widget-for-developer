const key = (widgetId) => `ajaxter_presence_${widgetId}`;
export function loadPresenceStatus(widgetId) {
    if (typeof sessionStorage === 'undefined')
        return 'ACTIVE';
    try {
        const v = sessionStorage.getItem(key(widgetId));
        if (v === 'ACTIVE' || v === 'AWAY' || v === 'DND')
            return v;
    }
    catch (_a) {
        /* */
    }
    return 'ACTIVE';
}
export function savePresenceStatus(widgetId, status) {
    try {
        sessionStorage.setItem(key(widgetId), status);
    }
    catch (_a) {
        /* quota */
    }
}
/** Prefer server value from DB when the host includes it in config */
export function resolveInitialPresence(widgetId, serverStatus) {
    if (serverStatus === 'ACTIVE' || serverStatus === 'AWAY' || serverStatus === 'DND')
        return serverStatus;
    return loadPresenceStatus(widgetId);
}
/** Call your backend to persist presence (production DB). */
export async function syncPresenceToServer(url, payload) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit',
    });
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `Presence sync failed (${res.status})`);
    }
}

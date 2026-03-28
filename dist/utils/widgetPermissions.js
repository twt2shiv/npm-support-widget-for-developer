/**
 * Requests microphone, geolocation, and screen-capture access required by the widget.
 * Stops all tracks immediately after success (probe only).
 */
export async function requestWidgetPermissions() {
    var _a, _b, _c;
    if (typeof navigator === 'undefined')
        return false;
    try {
        if (!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia))
            return false;
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        mic.getTracks().forEach(t => t.stop());
    }
    catch (_d) {
        return false;
    }
    try {
        if (!((_b = navigator.geolocation) === null || _b === void 0 ? void 0 : _b.getCurrentPosition))
            return false;
        await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(() => resolve(), e => reject(e), { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 });
        });
    }
    catch (_e) {
        return false;
    }
    try {
        if (!((_c = navigator.mediaDevices) === null || _c === void 0 ? void 0 : _c.getDisplayMedia))
            return false;
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screen.getTracks().forEach(t => t.stop());
    }
    catch (_f) {
        return false;
    }
    return true;
}
export function permissionsSessionKey(widgetId) {
    return `ajaxter_widget_permissions_ok_${widgetId}`;
}
export function hasStoredPermissionsGrant(widgetId) {
    if (typeof sessionStorage === 'undefined')
        return false;
    try {
        return sessionStorage.getItem(permissionsSessionKey(widgetId)) === '1';
    }
    catch (_a) {
        return false;
    }
}
export function storePermissionsGrant(widgetId) {
    try {
        sessionStorage.setItem(permissionsSessionKey(widgetId), '1');
    }
    catch (_a) {
        /* quota */
    }
}
export function clearStoredPermissionsGrant(widgetId) {
    try {
        sessionStorage.removeItem(permissionsSessionKey(widgetId));
    }
    catch (_a) {
        /* */
    }
}

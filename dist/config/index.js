/**
 * Default JSON endpoint. Override with `REACT_APP_CHAT_CONFIG_URL` / `NEXT_PUBLIC_CHAT_CONFIG_URL`.
 * If the remote host does not send CORS headers, set this to a same-origin path (e.g. `/api/chat-config`)
 * and proxy the JSON from your server — see `examples/next-app-router-chat-proxy.ts`.
 */
const DEFAULT_CHAT_DATA_BASE = 'https://window.mscorpres.com/TEST/chatData.json';
const DEMO_API_KEY = 'demo1234';
const DEMO_WIDGET_ID = 'demo';
function getEnv(key) {
    var _a, _b, _c;
    if (typeof process !== 'undefined' && process.env) {
        return ((_c = (_b = (_a = process.env[`NEXT_PUBLIC_${key}`]) !== null && _a !== void 0 ? _a : process.env[`REACT_APP_${key}`]) !== null && _b !== void 0 ? _b : process.env[key]) !== null && _c !== void 0 ? _c : undefined);
    }
    return undefined;
}
function getChatDataBaseUrl() {
    var _a;
    return ((_a = getEnv('CHAT_CONFIG_URL')) === null || _a === void 0 ? void 0 : _a.trim()) || DEFAULT_CHAT_DATA_BASE;
}
/**
 * Loads remote widget config once via GET. Uses query params `key` and `widget` so the
 * server can validate the request without custom headers (avoids CORS preflight failures).
 */
export async function fetchRemoteChatData(apiKey, widgetId) {
    const base = getChatDataBaseUrl();
    const url = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('widget', widgetId);
    const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'omit',
        mode: 'cors',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok)
        throw new Error(`Failed to load chat config: ${res.status}`);
    return res.json();
}
export function loadLocalConfig() {
    var _a, _b;
    return {
        apiKey: (_a = getEnv('CHAT_API_KEY')) !== null && _a !== void 0 ? _a : DEMO_API_KEY,
        widgetId: (_b = getEnv('CHAT_WIDGET_ID')) !== null && _b !== void 0 ? _b : DEMO_WIDGET_ID,
    };
}

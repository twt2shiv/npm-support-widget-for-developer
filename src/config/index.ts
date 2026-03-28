import { LocalEnvConfig, RemoteChatData } from '../types';

/**
 * Default JSON endpoint. Override with `REACT_APP_CHAT_CONFIG_URL` / `NEXT_PUBLIC_CHAT_CONFIG_URL`.
 * If the remote host does not send CORS headers, set this to a same-origin path (e.g. `/api/chat-config`)
 * and proxy the JSON from your server — see `examples/next-app-router-chat-proxy.ts`.
 */
const DEFAULT_CHAT_DATA_BASE = 'https://window.mscorpres.com/TEST/chatData.json';
const DEMO_API_KEY   = 'demo1234';
const DEMO_WIDGET_ID = 'demo';

function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env[`NEXT_PUBLIC_${key}`] ??
      process.env[`REACT_APP_${key}`] ??
      process.env[key] ??
      undefined
    );
  }
  return undefined;
}

function getChatDataBaseUrl(): string {
  return getEnv('CHAT_CONFIG_URL')?.trim() || DEFAULT_CHAT_DATA_BASE;
}

/**
 * Loads remote widget config once via GET. Uses query params `key` and `widget` so the
 * server can validate the request without custom headers (avoids CORS preflight failures).
 */
export async function fetchRemoteChatData(
  apiKey: string,
  widgetId: string
): Promise<RemoteChatData> {
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
  if (!res.ok) throw new Error(`Failed to load chat config: ${res.status}`);
  return res.json() as Promise<RemoteChatData>;
}

export function loadLocalConfig(): LocalEnvConfig {
  return {
    apiKey:   getEnv('CHAT_API_KEY')    ?? DEMO_API_KEY,
    widgetId: getEnv('CHAT_WIDGET_ID')  ?? DEMO_WIDGET_ID,
  };
}

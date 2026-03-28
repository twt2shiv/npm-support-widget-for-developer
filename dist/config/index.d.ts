import { LocalEnvConfig, RemoteChatData } from '../types';
/**
 * Loads remote widget config once via GET. Uses query params `key` and `widget` so the
 * server can validate the request without custom headers (avoids CORS preflight failures).
 */
export declare function fetchRemoteChatData(apiKey: string, widgetId: string): Promise<RemoteChatData>;
export declare function loadLocalConfig(): LocalEnvConfig;

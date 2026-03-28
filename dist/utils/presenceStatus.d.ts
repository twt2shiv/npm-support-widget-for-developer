import type { PresenceStatus } from '../types';
export declare function loadPresenceStatus(widgetId: string): PresenceStatus;
export declare function savePresenceStatus(widgetId: string, status: PresenceStatus): void;
/** Prefer server value from DB when the host includes it in config */
export declare function resolveInitialPresence(widgetId: string, serverStatus: PresenceStatus | undefined): PresenceStatus;
export interface PresenceSyncPayload {
    widgetId: string;
    apiKey: string;
    viewerUid?: string;
    status: PresenceStatus;
}
/** Call your backend to persist presence (production DB). */
export declare function syncPresenceToServer(url: string, payload: PresenceSyncPayload): Promise<void>;

import type { PresenceStatus } from '../types';

const key = (widgetId: string) => `ajaxter_presence_${widgetId}`;

export function loadPresenceStatus(widgetId: string): PresenceStatus {
  if (typeof sessionStorage === 'undefined') return 'ACTIVE';
  try {
    const v = sessionStorage.getItem(key(widgetId));
    if (v === 'ACTIVE' || v === 'AWAY' || v === 'DND') return v;
  } catch {
    /* */
  }
  return 'ACTIVE';
}

export function savePresenceStatus(widgetId: string, status: PresenceStatus): void {
  try {
    sessionStorage.setItem(key(widgetId), status);
  } catch {
    /* quota */
  }
}

/** Prefer server value from DB when the host includes it in config */
export function resolveInitialPresence(
  widgetId: string,
  serverStatus: PresenceStatus | undefined,
): PresenceStatus {
  if (serverStatus === 'ACTIVE' || serverStatus === 'AWAY' || serverStatus === 'DND') return serverStatus;
  return loadPresenceStatus(widgetId);
}

export interface PresenceSyncPayload {
  widgetId: string;
  apiKey: string;
  viewerUid?: string;
  status: PresenceStatus;
}

/** Call your backend to persist presence (production DB). */
export async function syncPresenceToServer(url: string, payload: PresenceSyncPayload): Promise<void> {
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

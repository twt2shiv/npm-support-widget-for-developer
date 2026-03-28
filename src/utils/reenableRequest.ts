/**
 * Payload sent when a blocked viewer requests access restoration.
 * Backend should validate `apiKey` + `widgetId` and associate `viewerUid` with the session.
 */
export interface ReenableRequestPayload {
  widgetId: string;
  apiKey: string;
  viewerUid?: string;
  message: string;
}

export async function submitReenableRequest(url: string, payload: ReenableRequestPayload): Promise<void> {
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
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
}

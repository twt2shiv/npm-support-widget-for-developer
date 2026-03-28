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
export declare function submitReenableRequest(url: string, payload: ReenableRequestPayload): Promise<void>;

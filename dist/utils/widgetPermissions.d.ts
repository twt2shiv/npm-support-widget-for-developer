/**
 * Requests microphone, geolocation, and screen-capture access required by the widget.
 * Stops all tracks immediately after success (probe only).
 */
export declare function requestWidgetPermissions(): Promise<boolean>;
export declare function permissionsSessionKey(widgetId: string): string;
export declare function hasStoredPermissionsGrant(widgetId: string): boolean;
export declare function storePermissionsGrant(widgetId: string): void;
export declare function clearStoredPermissionsGrant(widgetId: string): void;

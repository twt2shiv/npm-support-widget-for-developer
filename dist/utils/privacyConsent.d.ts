export declare function getPrivacyDismissedAt(widgetId: string): number | null;
/** After dismiss, banner stays hidden until one hour has passed */
export declare function shouldShowPrivacyNotice(widgetId: string): boolean;
export declare function dismissPrivacyNotice(widgetId: string): void;

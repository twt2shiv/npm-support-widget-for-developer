import { ChatWidgetTheme } from '../types';
export declare const defaultTheme: Required<ChatWidgetTheme>;
export declare function mergeTheme(remote?: Partial<ChatWidgetTheme>, local?: ChatWidgetTheme): Required<ChatWidgetTheme>;
/** Darken a hex color by `amount` (0-255) */
export declare function darken(hex: string, amount?: number): string;

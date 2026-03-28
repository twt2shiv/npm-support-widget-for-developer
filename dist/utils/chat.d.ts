import { ChatMessage, ChatUser } from '../types';
/** Generate a consistent avatar color from a name */
export declare function avatarColor(name: string): string;
/** Get initials from full name */
export declare function initials(name: string): string;
/** Format timestamp to readable time string */
export declare function formatTime(ts: string | Date): string;
/** Format date for chat separators */
export declare function formatDate(ts: string | Date): string;
/** Generate a plain-text transcript from messages */
export declare function generateTranscript(messages: ChatMessage[], peer: ChatUser, myName?: string): string;
/** Truncate to max words, append ellipsis (…) if shortened */
export declare function truncateWords(text: string, maxWords: number): string;
/** Trigger a file download in the browser */
export declare function downloadText(content: string, filename: string): void;

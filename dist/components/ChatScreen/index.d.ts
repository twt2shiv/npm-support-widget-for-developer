import React from 'react';
import { ChatMessage, ChatUser, WidgetConfig, UserListContext } from '../../types';
interface ChatScreenProps {
    activeUser: ChatUser;
    messages: ChatMessage[];
    config: WidgetConfig;
    isPaused: boolean;
    isReported: boolean;
    isBlocked: boolean;
    onSend: (text: string, type?: ChatMessage['type'], extra?: Partial<ChatMessage>) => void;
    onBack: () => void;
    onClose: () => void;
    onTogglePause: () => void;
    onReport: () => void;
    onBlock: () => void;
    onStartCall: (withVideo: boolean) => void;
    /** Navigate to support list, colleague list, or tickets (from slide menu) */
    onNavAction: (ctx: UserListContext | 'ticket') => void;
    /** Other devs (excl. viewer) — for transfer when staff chats with a customer */
    otherDevelopers?: ChatUser[];
    onTransferToDeveloper?: (dev: ChatUser) => void;
    messageSoundEnabled?: boolean;
    onToggleMessageSound?: (enabled: boolean) => void;
}
export declare const ChatScreen: React.FC<ChatScreenProps>;
export {};

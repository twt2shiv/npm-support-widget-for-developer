import { Screen, BottomTab, UserListContext, ChatMessage } from '../types';
export interface PersistedWidgetSession {
    screen: Screen;
    activeTab: BottomTab;
    userListCtx: UserListContext;
    activeUserUid: string | null;
    messages: ChatMessage[];
    viewingTicketId: string | null;
    chatReturnCtx: UserListContext;
}
export declare function sessionKey(widgetId: string): string;
export declare function loadSession(widgetId: string): PersistedWidgetSession | null;
export declare function saveSession(widgetId: string, state: PersistedWidgetSession): void;

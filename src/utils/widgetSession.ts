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

export function sessionKey(widgetId: string): string {
  return `ajaxter_widget_session_${widgetId}`;
}

export function loadSession(widgetId: string): PersistedWidgetSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(sessionKey(widgetId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedWidgetSession;
  } catch {
    return null;
  }
}

export function saveSession(widgetId: string, state: PersistedWidgetSession): void {
  try {
    sessionStorage.setItem(sessionKey(widgetId), JSON.stringify(state));
  } catch {
    /* quota */
  }
}

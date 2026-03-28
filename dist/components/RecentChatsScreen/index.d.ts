import React from 'react';
import { ChatUser, WidgetConfig } from '../../types';
interface RecentChat {
    id: string;
    user: ChatUser;
    lastMessage: string;
    lastTime: string;
    unread: number;
    isPaused: boolean;
}
interface RecentChatsScreenProps {
    chats: RecentChat[];
    config: WidgetConfig;
    onSelectChat: (user: ChatUser) => void;
    animateEntrance?: boolean;
}
export declare const RecentChatsScreen: React.FC<RecentChatsScreenProps>;
export {};

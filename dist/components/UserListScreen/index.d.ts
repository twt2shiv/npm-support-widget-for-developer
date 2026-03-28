import React from 'react';
import { ChatUser, UserListContext } from '../../types';
interface UserListScreenProps {
    context: UserListContext;
    users: ChatUser[];
    primaryColor: string;
    /** `developer` = staff using the widget (lists customers vs teammates) */
    viewerType?: 'user' | 'developer';
    onBack: () => void;
    onSelectUser: (user: ChatUser) => void;
    /** Shown on “New Conversation” list — opens block list */
    onBlockList?: () => void;
    /** “Need Support” (user → agents): show home icon instead of back arrow */
    useHomeHeader?: boolean;
    /** Stagger animation — only when opening from home burger menu */
    animateEntrance?: boolean;
}
export declare const UserListScreen: React.FC<UserListScreenProps>;
export {};

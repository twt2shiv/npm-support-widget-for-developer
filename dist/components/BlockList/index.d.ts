import React from 'react';
import { ChatUser, WidgetConfig } from '../../types';
interface BlockListScreenProps {
    blockedUsers: ChatUser[];
    config: WidgetConfig;
    onUnblock: (uid: string) => void;
    onBack: () => void;
}
export declare const BlockListScreen: React.FC<BlockListScreenProps>;
export {};

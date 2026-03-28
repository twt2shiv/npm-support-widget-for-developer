import React from 'react';
import { ChatType, UserListContext } from '../types';
export interface SlideNavMenuProps {
    open: boolean;
    onClose: () => void;
    primaryColor: string;
    chatType: ChatType;
    /** When `developer`, relabels the first two entries for staff */
    viewerType?: 'user' | 'developer';
    onSelect: (ctx: UserListContext | 'ticket') => void;
    /** When set, shows “Back to home” at the bottom (e.g. chat screen) */
    onBackHome?: () => void;
}
export declare const SlideNavMenu: React.FC<SlideNavMenuProps>;

import React from 'react';
import { CallSession } from '../../types';
export interface MiniCallBarProps {
    session: CallSession;
    primaryColor: string;
    buttonPosition: 'bottom-left' | 'bottom-right';
    onExpand: () => void;
    onEnd: () => void;
}
/**
 * Shown when the user minimizes the widget during an active call (ringing or connected).
 * Sits above the main launcher button so the user can work on the page and return to the call.
 */
export declare const MiniCallBar: React.FC<MiniCallBarProps>;

import React from 'react';
import { CallSession } from '../../types';
interface CallScreenProps {
    session: CallSession;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
    onEnd: () => void;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    primaryColor: string;
}
export declare const CallScreen: React.FC<CallScreenProps>;
export {};

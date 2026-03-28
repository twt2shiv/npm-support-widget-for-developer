import { CallSession, ChatUser } from '../types';
export declare function useWebRTC(): {
    session: CallSession;
    localVideoRef: import("react").MutableRefObject<HTMLVideoElement | null>;
    remoteVideoRef: import("react").MutableRefObject<HTMLVideoElement | null>;
    startCall: (peer: ChatUser, withVideo?: boolean) => Promise<void>;
    acceptCall: (offer: RTCSessionDescriptionInit, peer: ChatUser, withVideo?: boolean) => Promise<void>;
    endCall: () => void;
    toggleMute: () => void;
    toggleCamera: () => void;
};

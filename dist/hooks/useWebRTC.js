import { useState, useRef, useCallback, useEffect } from 'react';
const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];
export function useWebRTC() {
    const [session, setSession] = useState({
        state: 'idle',
        peer: null,
        startedAt: null,
        isMuted: false,
        isCameraOn: false,
    });
    const pcRef = useRef(null);
    const localStream = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const updateSession = (patch) => setSession(prev => (Object.assign(Object.assign({}, prev), patch)));
    /** Start an outgoing call */
    const startCall = useCallback(async (peer, withVideo = false) => {
        updateSession({ state: 'calling', peer });
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: withVideo,
        });
        localStream.current = stream;
        if (localVideoRef.current)
            localVideoRef.current.srcObject = stream;
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        pc.ontrack = e => {
            if (remoteVideoRef.current)
                remoteVideoRef.current.srcObject = e.streams[0];
            updateSession({ state: 'connected', startedAt: new Date(), isCameraOn: withVideo });
        };
        pc.onicecandidate = e => {
            if (e.candidate) {
                // TODO: socket.emit('ice-candidate', { candidate: e.candidate, to: peer.uid });
                console.log('[WebRTC] ICE candidate ready — send via signalling:', e.candidate);
            }
        };
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        // TODO: socket.emit('call-offer', { offer, to: peer.uid, from: 'me' });
        console.log('[WebRTC] Offer created — send via signalling server:', offer);
    }, []);
    /** Accept an incoming call offer */
    const acceptCall = useCallback(async (offer, peer, withVideo = false) => {
        updateSession({ state: 'connected', peer, startedAt: new Date(), isCameraOn: withVideo });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo });
        localStream.current = stream;
        if (localVideoRef.current)
            localVideoRef.current.srcObject = stream;
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        pc.ontrack = e => {
            if (remoteVideoRef.current)
                remoteVideoRef.current.srcObject = e.streams[0];
        };
        pc.onicecandidate = e => {
            if (e.candidate) {
                // TODO: socket.emit('ice-candidate', { candidate: e.candidate, to: peer.uid });
            }
        };
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        // TODO: socket.emit('call-answer', { answer, to: peer.uid });
    }, []);
    /** Hang up */
    const endCall = useCallback(() => {
        var _a, _b;
        (_a = localStream.current) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(t => t.stop());
        (_b = pcRef.current) === null || _b === void 0 ? void 0 : _b.close();
        pcRef.current = null;
        localStream.current = null;
        updateSession({ state: 'ended', peer: null, startedAt: null });
        setTimeout(() => updateSession({ state: 'idle' }), 1800);
    }, []);
    const toggleMute = useCallback(() => {
        if (!localStream.current)
            return;
        const enabled = !session.isMuted;
        localStream.current.getAudioTracks().forEach(t => { t.enabled = enabled; });
        updateSession({ isMuted: !session.isMuted });
    }, [session.isMuted]);
    const toggleCamera = useCallback(() => {
        if (!localStream.current)
            return;
        const enabled = !session.isCameraOn;
        localStream.current.getVideoTracks().forEach(t => { t.enabled = enabled; });
        updateSession({ isCameraOn: enabled });
    }, [session.isCameraOn]);
    // Cleanup on unmount
    useEffect(() => () => {
        var _a, _b;
        (_a = localStream.current) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(t => t.stop());
        (_b = pcRef.current) === null || _b === void 0 ? void 0 : _b.close();
    }, []);
    return {
        session,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        endCall,
        toggleMute,
        toggleCamera,
    };
}

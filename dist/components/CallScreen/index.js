import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { avatarColor, initials } from '../../utils/chat';
export const CallScreen = ({ session, localVideoRef, remoteVideoRef, onEnd, onToggleMute, onToggleCamera, primaryColor, onMinimize, }) => {
    const [duration, setDuration] = useState(0);
    const peer = session.peer;
    useEffect(() => {
        if (session.state !== 'connected' || !session.startedAt)
            return;
        const t = setInterval(() => {
            setDuration(Math.floor((Date.now() - session.startedAt.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(t);
    }, [session.state, session.startedAt]);
    const mins = String(Math.floor(duration / 60)).padStart(2, '0');
    const secs = String(duration % 60).padStart(2, '0');
    return (_jsxs("div", { style: {
            display: 'flex', flexDirection: 'column', height: '100%',
            background: session.isCameraOn ? '#000' : `linear-gradient(145deg,${primaryColor}dd,#0f172a)`,
            color: '#fff', animation: 'cw-slideIn 0.22s ease',
            position: 'relative', overflow: 'hidden',
        }, children: [_jsx("video", { ref: remoteVideoRef, autoPlay: true, playsInline: true, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: session.state === 'connected' ? 1 : 0 } }), _jsx("video", { ref: localVideoRef, autoPlay: true, playsInline: true, muted: true, style: {
                    position: 'absolute', bottom: 120, right: 14,
                    width: 90, height: 120, borderRadius: 10,
                    objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)',
                    display: session.isCameraOn ? 'block' : 'none',
                    zIndex: 10,
                } }), _jsxs("div", { style: { position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(0,0,0,0.35)' }, children: [_jsxs("div", { style: { padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: { flex: 1 }, children: _jsxs("div", { style: { fontWeight: 700, fontSize: 15, color: '#fff' }, children: [session.state === 'calling' && 'Calling...', session.state === 'connected' && 'Connected', session.state === 'ended' && 'Call Ended'] }) }), (session.state === 'calling' || session.state === 'connected') && onMinimize && (_jsx("button", { type: "button", onClick: onMinimize, title: "Minimize \u2014 keep call while you use the page", style: {
                                    padding: '8px 12px',
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.35)',
                                    background: 'rgba(0,0,0,0.25)',
                                    color: '#fff',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }, children: "Minimize" }))] }), _jsx("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }, children: peer && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                        width: 90, height: 90, borderRadius: '50%',
                                        backgroundColor: avatarColor(peer.name),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 28, fontWeight: 700, color: '#fff',
                                        boxShadow: '0 0 0 4px rgba(255,255,255,0.2)',
                                        animation: session.state === 'calling' ? 'cw-pulse 1.5s ease infinite' : 'none',
                                    }, children: initials(peer.name) }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 20, fontWeight: 800 }, children: peer.name }), _jsxs("div", { style: { fontSize: 13, opacity: 0.8, marginTop: 4 }, children: [session.state === 'calling' && 'Ringing...', session.state === 'connected' && `${mins}:${secs}`, session.state === 'ended' && 'Call ended'] })] })] })) }), _jsxs("div", { style: { padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }, children: [_jsx(CallBtn, { active: session.isMuted, activeColor: "#374151", onClick: onToggleMute, title: session.isMuted ? 'Unmute' : 'Mute', children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: session.isMuted
                                        ? _jsxs(_Fragment, { children: [_jsx("path", { d: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z", stroke: "#fff", strokeWidth: "2" }), _jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23", stroke: "#ef4444", strokeWidth: "2" })] })
                                        : _jsxs(_Fragment, { children: [_jsx("path", { d: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round" }), _jsx("path", { d: "M19 10v2a7 7 0 01-14 0v-2M12 19v4", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round" })] }) }) }), _jsx("button", { onClick: onEnd, style: {
                                    width: 60, height: 60, borderRadius: '50%', backgroundColor: '#ef4444',
                                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 16px rgba(239,68,68,0.5)', flexShrink: 0,
                                }, children: _jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z", fill: "#fff", transform: "rotate(135 12 12)" }) }) }), _jsx(CallBtn, { active: session.isCameraOn, activeColor: primaryColor, onClick: onToggleCamera, title: "Camera", children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M23 7l-7 5 7 5V7zM1 5h13a2 2 0 012 2v10a2 2 0 01-2 2H1a2 2 0 01-2-2V7a2 2 0 012-2z", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] })] })] }));
};
const CallBtn = ({ active, activeColor, onClick, title, children, }) => (_jsx("button", { onClick: onClick, title: title, style: {
        width: 50, height: 50, borderRadius: '50%',
        backgroundColor: active ? activeColor : 'rgba(255,255,255,0.2)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }, children: children }));

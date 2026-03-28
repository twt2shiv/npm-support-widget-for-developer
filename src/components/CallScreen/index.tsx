import React, { useEffect, useState } from 'react';
import { CallSession, ChatUser } from '../../types';
import { avatarColor, initials } from '../../utils/chat';

interface CallScreenProps {
  session:        CallSession;
  localVideoRef:  React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onEnd:          () => void;
  onToggleMute:   () => void;
  onToggleCamera: () => void;
  primaryColor:   string;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  session, localVideoRef, remoteVideoRef,
  onEnd, onToggleMute, onToggleCamera, primaryColor,
}) => {
  const [duration, setDuration] = useState(0);
  const peer = session.peer as ChatUser;

  useEffect(() => {
    if (session.state !== 'connected' || !session.startedAt) return;
    const t = setInterval(() => {
      setDuration(Math.floor((Date.now() - session.startedAt!.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [session.state, session.startedAt]);

  const mins = String(Math.floor(duration / 60)).padStart(2, '0');
  const secs = String(duration % 60).padStart(2, '0');

  return (
    <div style={{
      display:'flex', flexDirection:'column', height:'100%',
      background: session.isCameraOn ? '#000' : `linear-gradient(145deg,${primaryColor}dd,#0f172a)`,
      color:'#fff', animation:'cw-slideIn 0.22s ease',
      position:'relative', overflow:'hidden',
    }}>
      {/* Remote video (background) */}
      <video ref={remoteVideoRef as React.Ref<HTMLVideoElement>} autoPlay playsInline
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: session.state==='connected'?1:0 }}
      />

      {/* Local video (PiP) */}
      <video ref={localVideoRef as React.Ref<HTMLVideoElement>} autoPlay playsInline muted
        style={{
          position:'absolute', bottom:120, right:14,
          width:90, height:120, borderRadius:10,
          objectFit:'cover', border:'2px solid rgba(255,255,255,0.3)',
          display: session.isCameraOn ? 'block' : 'none',
          zIndex:10,
        }}
      />

      {/* Overlay */}
      <div style={{ position:'relative', zIndex:5, display:'flex', flexDirection:'column', height:'100%', background:'rgba(0,0,0,0.35)' }}>
        {/* Top bar */}
        <div style={{ padding:'16px 18px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>
              {session.state === 'calling'   && 'Calling...'}
              {session.state === 'connected' && 'Connected'}
              {session.state === 'ended'     && 'Call Ended'}
            </div>
          </div>
        </div>

        {/* Center: avatar + name */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
          {peer && (
            <>
              <div style={{
                width:90, height:90, borderRadius:'50%',
                backgroundColor: avatarColor(peer.name),
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:28, fontWeight:700, color:'#fff',
                boxShadow:'0 0 0 4px rgba(255,255,255,0.2)',
                animation: session.state==='calling' ? 'cw-pulse 1.5s ease infinite' : 'none',
              }}>
                {initials(peer.name)}
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800 }}>{peer.name}</div>
                <div style={{ fontSize:13, opacity:0.8, marginTop:4 }}>
                  {session.state === 'calling'   && 'Ringing...'}
                  {session.state === 'connected' && `${mins}:${secs}`}
                  {session.state === 'ended'     && 'Call ended'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div style={{ padding:'24px', display:'flex', justifyContent:'center', alignItems:'center', gap:20 }}>
          {/* Mute */}
          <CallBtn
            active={session.isMuted}
            activeColor="#374151"
            onClick={onToggleMute}
            title={session.isMuted ? 'Unmute' : 'Mute'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {session.isMuted
                ? <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#fff" strokeWidth="2"/><line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" strokeWidth="2"/></>
                : <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></>
              }
            </svg>
          </CallBtn>

          {/* End call */}
          <button onClick={onEnd} style={{
            width:60, height:60, borderRadius:'50%', backgroundColor:'#ef4444',
            border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 16px rgba(239,68,68,0.5)', flexShrink:0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" fill="#fff" transform="rotate(135 12 12)"/>
            </svg>
          </button>

          {/* Camera */}
          <CallBtn active={session.isCameraOn} activeColor={primaryColor} onClick={onToggleCamera} title="Camera">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7zM1 5h13a2 2 0 012 2v10a2 2 0 01-2 2H1a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CallBtn>
        </div>
      </div>
    </div>
  );
};

const CallBtn: React.FC<{ active: boolean; activeColor: string; onClick: () => void; title: string; children: React.ReactNode }> = ({
  active, activeColor, onClick, title, children,
}) => (
  <button onClick={onClick} title={title} style={{
    width:50, height:50, borderRadius:'50%',
    backgroundColor: active ? activeColor : 'rgba(255,255,255,0.2)',
    border:'none', cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  }}>{children}</button>
);

'use client';

import React, { useEffect, useState } from 'react';
import { CallSession, ChatUser } from '../../types';
import { avatarColor, initials } from '../../utils/chat';

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
export const MiniCallBar: React.FC<MiniCallBarProps> = ({
  session,
  primaryColor,
  buttonPosition,
  onExpand,
  onEnd,
}) => {
  const peer = session.peer as ChatUser | null;
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (session.state !== 'connected' || !session.startedAt) return;
    const t = setInterval(() => {
      setDuration(Math.floor((Date.now() - session.startedAt!.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [session.state, session.startedAt]);

  const mins = String(Math.floor(duration / 60)).padStart(2, '0');
  const secs = String(duration % 60).padStart(2, '0');

  const pos: React.CSSProperties =
    buttonPosition === 'bottom-left'
      ? { left: 24, right: 'auto' }
      : { right: 24, left: 'auto' };

  return (
    <div
      role="toolbar"
      aria-label="Call in progress"
      style={{
        position: 'fixed',
        bottom: 88,
        zIndex: 10000,
        ...pos,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        maxWidth: 'min(360px, calc(100vw - 48px))',
        borderRadius: 14,
        background: `linear-gradient(135deg, ${primaryColor}ee, #0f172a)`,
        color: '#fff',
        boxShadow: '0 10px 32px rgba(0,0,0,0.28)',
        animation: 'cw-miniBarIn 0.28s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'default',
      }}
    >
      <style>{`
        @keyframes cw-miniBarIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        type="button"
        onClick={onExpand}
        title="Open call"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: 1,
          minWidth: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {peer && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: avatarColor(peer.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
              animation: session.state === 'calling' ? 'cw-pulse 1.5s ease infinite' : 'none',
            }}
          >
            {initials(peer.name)}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {peer?.name ?? 'Call'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
            {session.state === 'calling' && 'Calling…'}
            {session.state === 'connected' && `${mins}:${secs}`}
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onEnd}
        title="End call"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: '#ef4444',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 10px rgba(239,68,68,0.45)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"
            fill="#fff"
            transform="rotate(135 12 12)"
          />
        </svg>
      </button>
    </div>
  );
};

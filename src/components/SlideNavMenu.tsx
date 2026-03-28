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

export const SlideNavMenu: React.FC<SlideNavMenuProps> = ({
  open,
  onClose,
  primaryColor,
  chatType,
  viewerType = 'user',
  onSelect,
  onBackHome,
}) => {
  const showSupport = chatType === 'SUPPORT' || chatType === 'BOTH';
  const showChat = chatType === 'CHAT' || chatType === 'BOTH';
  const isStaff = viewerType === 'developer';

  const items: Array<{ key: UserListContext | 'ticket'; icon: string; title: string } | null> = [
    showSupport ? { key: 'support', icon: '🛠', title: isStaff ? 'Provide Support' : 'Need Support' } : null,
    showChat ? { key: 'conversation', icon: '💬', title: isStaff ? 'Chat with developer' : 'New Conversation' } : null,
    { key: 'ticket', icon: '🎫', title: 'Raise ticket' },
  ];

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 200,
          background: 'rgba(15,23,42,0.45)',
          border: 'none',
          cursor: 'pointer',
          animation: 'cw-fadeIn 0.2s ease',
        }}
      />
      <style>{`@keyframes cw-fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <nav
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'min(300px, 88%)',
          zIndex: 210,
          background: '#fff',
          boxShadow: '8px 0 32px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0 16px',
          animation: 'cw-slideNavIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <style>{`@keyframes cw-slideNavIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
        <div style={{ padding: '0 20px 16px', borderBottom: '1px solid #eef0f5' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>Menu</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {items.filter(Boolean).map(item => {
            const it = item!;
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => {
                  onSelect(it.key);
                  onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 14px',
                  marginBottom: 6,
                  border: 'none',
                  borderRadius: 12,
                  background: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1e293b',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${primaryColor}12`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                }}
              >
                <span style={{ fontSize: 20 }}>{it.icon}</span>
                {it.title}
              </button>
            );
          })}
        </div>
        {onBackHome && (
          <div style={{ padding: '0 12px', borderTop: '1px solid #eef0f5', paddingTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                onBackHome();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                background: '#fff',
                fontSize: 14,
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              ← Back to home
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

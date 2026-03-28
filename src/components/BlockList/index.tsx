import React from 'react';
import { ChatUser, WidgetConfig } from '../../types';
import { avatarColor, initials } from '../../utils/chat';

interface BlockListScreenProps {
  blockedUsers: ChatUser[];
  config:       WidgetConfig;
  onUnblock:    (uid: string) => void;
  onBack:       () => void;
}

export const BlockListScreen: React.FC<BlockListScreenProps> = ({
  blockedUsers, config, onUnblock, onBack,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'cw-slideIn 0.22s ease' }}>
    {/* Header */}
    <div style={{
      background: `linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      <button onClick={onBack} style={backBtnStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Block List</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
          {blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: 'auto' }}>
      {blockedUsers.length === 0 ? (
        <div style={{ padding: '50px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>No blocked users</div>
          <div style={{ fontSize: 13, color: '#7b8fa1' }}>Users you block will appear here</div>
        </div>
      ) : (
        blockedUsers.map((user, i) => (
          <div key={user.uid} style={{
            padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 13,
            borderBottom: '1px solid #f0f2f5',
            animation: `cw-fadeUp 0.28s ease both`, animationDelay: `${i * 0.05}s`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              backgroundColor: avatarColor(user.name),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
              filter: 'grayscale(0.6)', opacity: 0.7,
            }}>
              {initials(user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#6b7280' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
            <button
              onClick={() => onUnblock(user.uid)}
              style={{
                padding: '6px 14px', borderRadius: 20,
                border: `1.5px solid ${config.primaryColor}`,
                background: 'transparent', color: config.primaryColor,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = config.primaryColor;
                (e.currentTarget as HTMLElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = config.primaryColor;
              }}
            >
              Unblock
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.22)', border: 'none', borderRadius: '50%',
  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};

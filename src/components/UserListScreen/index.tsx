import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChatUser, UserListContext } from '../../types';
import { avatarColor, initials } from '../../utils/chat';

interface UserListScreenProps {
  context: UserListContext;
  users: ChatUser[];
  primaryColor: string;
  /** `developer` = staff using the widget (lists customers vs teammates) */
  viewerType?: 'user' | 'developer';
  onBack: () => void;
  onSelectUser: (user: ChatUser) => void;
  /** Shown on “New Conversation” list — opens block list */
  onBlockList?: () => void;
  /** “Need Support” (user → agents): show home icon instead of back arrow */
  useHomeHeader?: boolean;
  /** Stagger animation — only when opening from home burger menu */
  animateEntrance?: boolean;
}

function matchesUser(u: ChatUser, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    u.name.toLowerCase().includes(s) ||
    u.email.toLowerCase().includes(s) ||
    u.designation.toLowerCase().includes(s) ||
    u.project.toLowerCase().includes(s)
  );
}

export const UserListScreen: React.FC<UserListScreenProps> = ({
  context, users, primaryColor, viewerType = 'user', onBack, onSelectUser, onBlockList,
  useHomeHeader = false,
  animateEntrance = false,
}) => {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = useMemo(() => users.filter(u => matchesUser(u, query)), [users, query]);

  const isStaff = viewerType === 'developer';
  const title    = context === 'support'
    ? (isStaff ? 'Provide Support' : 'Need Support')
    : (isStaff ? 'Developers' : 'New Conversation');
  const subtitle = context === 'support'
    ? (isStaff ? 'All chat users — choose who to help' : 'Choose a support agent')
    : (isStaff ? 'Chat with another developer or coordinate handoff' : 'Choose a colleague');

  const rootAnim = animateEntrance ? 'cw-slideIn 0.22s ease' : undefined;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', animation: rootAnim }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexShrink:0, position:'relative' }}>
        {useHomeHeader ? <HomeBtn onClick={onBack} /> : <BackBtn onClick={onBack} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight:700, fontSize:16, color:'#fff' }}>{title}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>{subtitle}</div>
        </div>
        {context === 'conversation' && onBlockList && (
          <button
            type="button"
            onClick={onBlockList}
            style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 10,
              padding: '8px 12px',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            title="Blocked users"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Blocked
          </button>
        )}
      </div>

      <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #eef0f5', flexShrink: 0 }}>
        <label style={{ display: 'block', margin: 0 }}>
          <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Search</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f8fafc' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.55 }}>
              <circle cx="11" cy="11" r="7" stroke="#64748b" strokeWidth="2" />
              <path d="M20 20l-4-4" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name…"
              autoComplete="off"
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                padding: '10px 0',
                fontFamily: 'inherit',
                color: '#1a2332',
              }}
            />
          </div>
        </label>
      </div>

      {/* User list */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {filtered.length === 0 ? (
          <Empty hasQuery={!!query.trim()} />
        ) : filtered.map((u, i) => (
          <button
            key={u.uid}
            onClick={() => onSelectUser(u)}
            style={{
              width:'100%', padding:'13px 18px', display:'flex',
              alignItems:'center', gap:13, background:'transparent',
              border:'none', borderBottom:'1px solid #f0f2f5',
              cursor:'pointer', textAlign:'left',
              ...(animateEntrance
                ? { animation: `cw-fadeUp 0.28s ease both`, animationDelay: `${i * 0.05}s` }
                : {}),
              transition:'background 0.14s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8faff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{
                width:44, height:44, borderRadius:'50%',
                backgroundColor: avatarColor(u.name),
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontWeight:700, fontSize:14,
              }}>{initials(u.name)}</div>
              <span style={{
                position:'absolute', bottom:1, right:1,
                width:11, height:11, borderRadius:'50%', border:'2px solid #fff',
                backgroundColor: u.status==='online' ? '#22c55e' : u.status==='away' ? '#f59e0b' : '#d1d5db',
              }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1a2332', marginBottom:2 }}>{u.name}</div>
              <div style={{ fontSize:12, color:'#7b8fa1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {u.designation} · {u.project}
              </div>
            </div>
            <span style={{
              fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20,
              textTransform:'uppercase', letterSpacing:'0.05em', flexShrink:0,
              background: u.type==='developer' ? `${primaryColor}15` : '#f0fdf4',
              color:      u.type==='developer' ? primaryColor          : '#16a34a',
              border:`1px solid ${u.type==='developer' ? primaryColor+'30' : '#16a34a30'}`,
            }}>{u.type==='developer' ? 'Dev' : 'User'}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const BackBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} style={{
    background:'rgba(255,255,255,0.22)', border:'none', borderRadius:'50%',
    width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', flexShrink:0,
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

const HomeBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} title="Home" aria-label="Home" style={{
    background:'rgba(255,255,255,0.22)', border:'none', borderRadius:'50%',
    width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', flexShrink:0,
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

const Empty: React.FC<{ hasQuery: boolean }> = ({ hasQuery }) => (
  <div style={{ padding:'50px 24px', textAlign:'center' }}>
    <div style={{ fontSize:36, marginBottom:10 }}>{hasQuery ? '🔍' : '👥'}</div>
    <div style={{ fontWeight:700, color:'#1a2332', marginBottom:6 }}>{hasQuery ? 'No matches' : 'No users available'}</div>
    <div style={{ fontSize:13, color:'#7b8fa1' }}>{hasQuery ? 'Try a different search' : 'Check back later'}</div>
  </div>
);

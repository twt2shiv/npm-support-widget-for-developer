import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChatUser, WidgetConfig } from '../../types';
import { avatarColor, initials, formatTime } from '../../utils/chat';

interface RecentChat {
  id: string; user: ChatUser; lastMessage: string; lastTime: string; unread: number; isPaused: boolean;
}

interface RecentChatsScreenProps {
  chats:         RecentChat[];
  config:        WidgetConfig;
  onSelectChat:  (user: ChatUser) => void;
  animateEntrance?: boolean;
}

function matchesChat(chat: RecentChat, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    chat.user.name.toLowerCase().includes(s) ||
    chat.lastMessage.toLowerCase().includes(s)
  );
}

export const RecentChatsScreen: React.FC<RecentChatsScreenProps> = ({
  chats, config, onSelectChat, animateEntrance = false,
}) => {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = useMemo(() => chats.filter(c => matchesChat(c, query)), [chats, query]);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ background:`linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`, padding:'18px 18px 14px', flexShrink:0 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>Recent Chats</h2>
        <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.8)' }}>Your conversation history</p>
      </div>

      <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #eef0f5', flexShrink: 0 }}>
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
            placeholder="Search chats…"
            autoComplete="off"
            aria-label="Search chats"
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
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'50px 24px', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>{query.trim() ? '🔍' : '💬'}</div>
            <div style={{ fontWeight:700, color:'#1a2332', marginBottom:6 }}>{query.trim() ? 'No matches' : 'No chats yet'}</div>
            <div style={{ fontSize:13, color:'#7b8fa1' }}>{query.trim() ? 'Try a different search' : 'Start a conversation from home'}</div>
          </div>
        ) : filtered.map((chat, i) => (
          <button key={chat.id} onClick={() => onSelectChat(chat.user)} style={{
            width:'100%', padding:'13px 16px', display:'flex', alignItems:'center', gap:13,
            background:'transparent', border:'none', borderBottom:'1px solid #f0f2f5',
            cursor:'pointer', textAlign:'left',
            ...(animateEntrance ? { animation: `cw-fadeUp 0.28s ease both`, animationDelay: `${i * 0.05}s` } : {}),
            transition:'background 0.14s',
          }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f8faff'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}
          >
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:46, height:46, borderRadius:'50%', backgroundColor:avatarColor(chat.user.name), display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15 }}>
                {initials(chat.user.name)}
              </div>
              {chat.unread > 0 && (
                <span style={{ position:'absolute', top:-2, right:-2, width:18, height:18, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>
                  {chat.unread}
                </span>
              )}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontWeight:700, fontSize:14, color:'#1a2332' }}>{chat.user.name}</span>
                <span style={{ fontSize:11, color:'#b0bec5' }}>{formatTime(chat.lastTime)}</span>
              </div>
              <div style={{ fontSize:13, color:'#7b8fa1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5 }}>
                {chat.isPaused && <span style={{ fontSize:10, background:'#fef3c7', color:'#92400e', padding:'1px 5px', borderRadius:4, fontWeight:700 }}>PAUSED</span>}
                {chat.lastMessage}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

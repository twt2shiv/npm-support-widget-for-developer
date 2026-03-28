import React from 'react';
import { BottomTab } from '../../types';

interface BottomTabsProps {
  active:       BottomTab;
  onChange:     (tab: BottomTab) => void;
  primaryColor: string;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ active, onChange, primaryColor }) => {
  const tabs: { key: BottomTab; label: string; Icon: React.FC<{ a: boolean; c: string }> }[] = [
    { key: 'home',    label: 'Home',    Icon: HomeIcon    },
    { key: 'chats',   label: 'Chats',   Icon: ChatsIcon   },
    { key: 'tickets', label: 'Tickets', Icon: TicketsIcon },
  ];

  return (
    <div style={{
      display: 'flex', borderTop: '1px solid #eef0f5',
      backgroundColor: '#fff', flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              flex: 1, padding: '10px 0 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '10px', fontWeight: isActive ? 700 : 500,
              color: isActive ? primaryColor : '#9aa3af',
              borderTop: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
              transition: 'color 0.15s',
              fontFamily: 'inherit',
            }}
          >
            <tab.Icon a={isActive} c={isActive ? primaryColor : '#b0bec5'} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const HomeIcon: React.FC<{ a: boolean; c: string }> = ({ a, c }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
      stroke={c} strokeWidth={a ? 2.2 : 1.8} fill={a ? `${c}20` : 'none'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21V12h6v9" stroke={c} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatsIcon: React.FC<{ a: boolean; c: string }> = ({ a, c }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke={c} strokeWidth={a ? 2.2 : 1.8} fill={a ? `${c}20` : 'none'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TicketsIcon: React.FC<{ a: boolean; c: string }> = ({ a, c }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M15 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V9l-4-4z"
      stroke={c} strokeWidth={a ? 2.2 : 1.8} fill={a ? `${c}20` : 'none'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 5v4h4M9 13h6M9 17h4" stroke={c} strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" />
  </svg>
);

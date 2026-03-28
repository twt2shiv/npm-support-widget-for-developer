import React, { useState, useMemo, useEffect } from 'react';
import { WidgetConfig, UserListContext, Ticket } from '../../types';
import { SlideNavMenu } from '../SlideNavMenu';
import { truncateWords } from '../../utils/chat';
import type { PresenceStatus } from '../../types';
import {
  resolveInitialPresence,
  savePresenceStatus,
  syncPresenceToServer,
} from '../../utils/presenceStatus';

export interface HomeNavigateOptions {
  /** When true, list screens play stagger animation (home burger menu only) */
  fromMenu?: boolean;
}

interface HomeScreenProps {
  config: WidgetConfig;
  /** Same as env / chatData — required to POST presence in production */
  apiKey: string;
  onNavigate: (ctx: UserListContext | 'ticket', options?: HomeNavigateOptions) => void;
  /** Open a specific pending ticket (full detail) */
  onOpenTicket: (ticketId: string) => void;
  tickets: Ticket[];
}

const STATUS_OPTIONS: { value: PresenceStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'AWAY', label: 'Away' },
  { value: 'DND', label: 'DND' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ config, apiKey, onNavigate, onOpenTicket, tickets }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [presence, setPresence] = useState<PresenceStatus>(() =>
    resolveInitialPresence(config.id, config.presenceStatus),
  );

  useEffect(() => {
    setPresence(resolveInitialPresence(config.id, config.presenceStatus));
  }, [config.id, config.presenceStatus]);

  const setPresenceAndSave = (s: PresenceStatus) => {
    setPresence(s);
    savePresenceStatus(config.id, s);
    const url = config.presenceUpdateUrl?.trim();
    if (!url) return;
    void syncPresenceToServer(url, {
      widgetId: config.id,
      apiKey,
      viewerUid: config.viewerUid?.trim() || undefined,
      status: s,
    }).catch(err => {
      console.error('[ajaxter-chat] presence sync failed', err);
    });
  };
  const showSupport = config.chatType === 'SUPPORT' || config.chatType === 'BOTH';
  const showChat = config.chatType === 'CHAT' || config.chatType === 'BOTH';
  const viewerIsDev = config.viewerType === 'developer';

  const pendingTickets = useMemo(
    () =>
      tickets
        .filter(t => t.status === 'open' || t.status === 'in-progress')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [tickets]
  );

  const brand = config.brandName?.trim() || 'Ajaxter';
  const promotionLead =
    config.promotionLead?.trim() ||
    'Need specialized help? Our teams are ready to assist you with any questions.';
  const tourUrl = config.websiteTourUrl?.trim();

  const handleCallUs = () => {
    const raw = config.supportPhone?.trim();
    if (!raw) return;
    window.location.href = `tel:${raw.replace(/\s/g, '')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', background: '#fafbfc' }}>
      <SlideNavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        primaryColor={config.primaryColor}
        chatType={config.chatType}
        viewerType={config.viewerType ?? 'user'}
        onSelect={ctx => {
          onNavigate(ctx, { fromMenu: true });
        }}
      />

      {/* Top bar — menu + presence status */}
      <div
        style={{
          flexShrink: 0,
          padding: '12px 14px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#fff',
          borderBottom: '1px solid #eef0f5',
        }}
      >
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: 'none',
            background: '#f1f5f9',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            flexShrink: 0,
          }}
        >
          <span style={{ width: 18, height: 2, background: '#334155', borderRadius: 1 }} />
          <span style={{ width: 18, height: 2, background: '#334155', borderRadius: 1 }} />
          <span style={{ width: 18, height: 2, background: '#334155', borderRadius: 1 }} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <div
            role="group"
            aria-label="Your status"
            style={{
              display: 'flex',
              borderRadius: 10,
              padding: 3,
              background: '#f1f5f9',
              gap: 2,
            }}
          >
            {STATUS_OPTIONS.map(({ value, label }) => {
              const isOn = presence === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPresenceAndSave(value)}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    background: isOn ? config.primaryColor : 'transparent',
                    color: isOn ? '#fff' : '#64748b',
                    boxShadow: isOn ? `0 2px 8px ${config.primaryColor}55` : 'none',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cw-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 28px' }}>
        {/* Title + description */}
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 24,
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          {config.welcomeTitle}
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748b', lineHeight: 1.55 }}>
          {config.welcomeSubtitle}
        </p>

        {/* Continue Conversations */}
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Continue with tickets</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {pendingTickets.length > 0 ? (
            pendingTickets.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpenTicket(t.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.45 }}>
                  {truncateWords(t.description, 50)}
                </div>
              </button>
            ))
          ) : (
            <>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: '#e0f2fe',
                  color: '#64748b',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                No open tickets yet
              </div>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: '#e0f2fe',
                  color: '#64748b',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Start via Raise ticket below
              </div>
            </>
          )}
        </div>

        {/* Talk to our experts / staff tools */}
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
          {viewerIsDev ? 'Support tools' : 'Talk to support experts'}
        </h2>

        {showSupport && (
          <button
            type="button"
            onClick={() => onNavigate('support')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 18px',
              marginBottom: showChat ? 10 : 14,
              borderRadius: 14,
              border: 'none',
              background: '#ede9fe',
              color: '#5b21b6',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(91,33,182,0.12)',
            }}
          >
            <span style={{ fontSize: 18 }}>👤</span>
            {viewerIsDev ? 'Provide Support' : 'Support'}
          </button>
        )}

        {showChat && showSupport && (
          <button
            type="button"
            onClick={() => onNavigate('conversation')}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 14,
              borderRadius: 12,
              border: '1.5px solid #e9d5ff',
              background: '#fff',
              color: '#6d28d9',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {viewerIsDev ? 'Chat with a developer' : 'New Conversation'}
          </button>
        )}

        {showChat && !showSupport && (
          <button
            type="button"
            onClick={() => onNavigate('conversation')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px 18px',
              marginBottom: 14,
              borderRadius: 14,
              border: 'none',
              background: '#ede9fe',
              color: '#5b21b6',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            New Conversation
          </button>
        )}

        <div
          style={{
            borderRadius: 18,
            padding: '22px 20px 20px',
            background: 'linear-gradient(145deg, #fce7f3 0%, #e9d5ff 45%, #ddd6fe 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
          <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#4c1d95', lineHeight: 1.45, position: 'relative' }}>
            {promotionLead}
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 500, color: '#5b21b6', lineHeight: 1.5, position: 'relative' }}>
            <strong style={{ fontWeight: 800 }}>{brand}</strong> — embedded chat for your workspace.{' '}
            <span style={{ whiteSpace: 'nowrap' }}>Free for users.</span> 24×7 availability. Dedicated workspace experience.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, position: 'relative' }}>
            {tourUrl && (
              <a
                href={tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#fff',
                  color: '#5b21b6',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(91,33,182,0.15)',
                }}
              >
                Take a Website Tour
              </a>
            )}
            <button
              type="button"
              onClick={handleCallUs}
              disabled={!config.supportPhone}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 12,
                border: 'none',
                background: config.supportPhone ? config.primaryColor : '#94a3b8',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: config.supportPhone ? 'pointer' : 'not-allowed',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"
                  fill="#fff"
                />
              </svg>
              Get Free Widget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

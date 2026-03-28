import React from 'react';
import { Ticket, WidgetConfig } from '../../types';

interface TicketDetailScreenProps {
  ticket: Ticket;
  config: WidgetConfig;
  onBack: () => void;
}

const sm: Record<Ticket['status'], { label: string; bg: string; color: string }> = {
  open:          { label: 'Open',        bg: '', color: '' },
  'in-progress': { label: 'In Progress', bg: '#fef3c7', color: '#d97706' },
  resolved:      { label: 'Resolved',    bg: '#f0fdf4', color: '#16a34a' },
  closed:        { label: 'Closed',      bg: '#f3f4f6', color: '#6b7280' },
};

const pm: Record<Ticket['priority'], { label: string; color: string }> = {
  low:    { label: 'Low',    color: '#6b7280' },
  medium: { label: 'Medium', color: '#d97706' },
  high:   { label: 'High',   color: '#ef4444' },
};

export const TicketDetailScreen: React.FC<TicketDetailScreenProps> = ({ ticket, config, onBack }) => {
  const st = sm[ticket.status];
  const pr = pm[ticket.priority];
  const stBg = ticket.status === 'open' ? `${config.primaryColor}14` : st.bg;
  const stColor = ticket.status === 'open' ? config.primaryColor : st.color;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'cw-slideIn 0.22s ease' }}>
      <div
        style={{
          background: `linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.22)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', lineHeight: 1.25 }}>{ticket.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>#{ticket.id}</div>
        </div>
      </div>

      <div className="cw-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 20,
              backgroundColor: stBg,
              color: stColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {st.label}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, color: pr.color, background: `${pr.color}15` }}>
            ● {pr.label} priority
          </span>
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Description
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#1e293b', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
          {ticket.description || '—'}
        </p>

        <div style={{ fontSize: 13, color: '#94a3b8', display: 'grid', gap: 8 }}>
          <div>
            <strong style={{ color: '#64748b' }}>Created</strong> · {new Date(ticket.createdAt).toLocaleString()}
          </div>
          <div>
            <strong style={{ color: '#64748b' }}>Updated</strong> · {new Date(ticket.updatedAt).toLocaleString()}
          </div>
          {ticket.assignedTo && (
            <div>
              <strong style={{ color: '#64748b' }}>Assigned</strong> · {ticket.assignedTo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

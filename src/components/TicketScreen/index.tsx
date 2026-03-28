import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ticket, WidgetConfig } from '../../types';

interface TicketScreenProps {
  tickets:       Ticket[];
  config:        WidgetConfig;
  onNewTicket:   () => void;
  onSelectTicket:(id: string) => void;
  animateEntrance?: boolean;
}

function matchesTicket(t: Ticket, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return (
    t.title.toLowerCase().includes(s) ||
    t.description.toLowerCase().includes(s) ||
    t.id.toLowerCase().includes(s)
  );
}

export const TicketScreen: React.FC<TicketScreenProps> = ({
  tickets, config, onNewTicket, onSelectTicket, animateEntrance = false,
}) => {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = useMemo(() => tickets.filter(t => matchesTicket(t, query)), [tickets, query]);

  const sm: Record<Ticket['status'], { label: string; bg: string; color: string }> = {
    open:          { label:'Open',        bg:`${config.primaryColor}14`, color: config.primaryColor },
    'in-progress': { label:'In Progress', bg:'#fef3c7',                  color:'#d97706'            },
    resolved:      { label:'Resolved',    bg:'#f0fdf4',                  color:'#16a34a'            },
    closed:        { label:'Closed',      bg:'#f3f4f6',                  color:'#6b7280'            },
  };

  const pm: Record<Ticket['priority'], { label: string; color: string }> = {
    low:    { label:'Low',    color:'#6b7280' },
    medium: { label:'Medium', color:'#d97706' },
    high:   { label:'High',   color:'#ef4444' },
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{
        background:`linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
        padding:'18px 18px 14px', flexShrink:0, position:'relative',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>Tickets</h2>
            <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.8)' }}>
              {tickets.length} ticket{tickets.length!==1?'s':''} raised
            </p>
          </div>
          <button type="button" onClick={onNewTicket} style={{
            background:'rgba(255,255,255,0.22)', border:'none', borderRadius:20,
            padding:'7px 14px', color:'#fff', fontWeight:700, fontSize:13,
            cursor:'pointer', display:'flex', alignItems:'center', gap:5,
            flexShrink: 0,
          }}>
            + New
          </button>
        </div>
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
            placeholder="Search tickets…"
            autoComplete="off"
            aria-label="Search tickets"
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
            <div style={{ fontSize:36, marginBottom:10 }}>{query.trim() ? '🔍' : '🎫'}</div>
            <div style={{ fontWeight:700, color:'#1a2332', marginBottom:6 }}>{query.trim() ? 'No matches' : 'No tickets yet'}</div>
            <div style={{ fontSize:13, color:'#7b8fa1' }}>{query.trim() ? 'Try a different search' : 'Raise a ticket for major issues'}</div>
          </div>
        ) : filtered.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTicket(t.id)}
            style={{
              width:'100%', padding:'14px 16px', borderBottom:'1px solid #f0f2f5',
              ...(animateEntrance ? { animation: `cw-fadeUp 0.3s ease both`, animationDelay: `${i * 0.05}s` } : {}),
              background:'transparent', borderLeft:'none', borderRight:'none', borderTop:'none',
              cursor:'pointer', textAlign:'left', fontFamily:'inherit',
            }}
          >
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontWeight:700, fontSize:14, color:'#1a2332', flex:1, paddingRight:10 }}>{t.title}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, backgroundColor:sm[t.status].bg, color:sm[t.status].color, whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>
                {sm[t.status].label}
              </span>
            </div>
            {t.description && <p style={{ margin:'0 0 7px', fontSize:13, color:'#7b8fa1', lineHeight:1.5 }}>{t.description}</p>}
            <div style={{ display:'flex', gap:10, fontSize:11, color:'#b0bec5' }}>
              <span style={{ color:pm[t.priority].color, fontWeight:700 }}>● {pm[t.priority].label}</span>
              <span>#{t.id}</span>
              <span>{new Date(t.createdAt).toLocaleDateString([], { month:'short', day:'numeric' })}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

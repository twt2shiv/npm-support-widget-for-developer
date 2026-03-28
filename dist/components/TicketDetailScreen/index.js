import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const sm = {
    open: { label: 'Open', bg: '', color: '' },
    'in-progress': { label: 'In Progress', bg: '#fef3c7', color: '#d97706' },
    resolved: { label: 'Resolved', bg: '#f0fdf4', color: '#16a34a' },
    closed: { label: 'Closed', bg: '#f3f4f6', color: '#6b7280' },
};
const pm = {
    low: { label: 'Low', color: '#6b7280' },
    medium: { label: 'Medium', color: '#d97706' },
    high: { label: 'High', color: '#ef4444' },
};
export const TicketDetailScreen = ({ ticket, config, onBack }) => {
    const st = sm[ticket.status];
    const pr = pm[ticket.priority];
    const stBg = ticket.status === 'open' ? `${config.primaryColor}14` : st.bg;
    const stColor = ticket.status === 'open' ? config.primaryColor : st.color;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', animation: 'cw-slideIn 0.22s ease' }, children: [_jsxs("div", { style: {
                    background: `linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexShrink: 0,
                }, children: [_jsx("button", { type: "button", onClick: onBack, style: {
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
                        }, children: _jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M19 12H5M5 12L12 19M5 12L12 5", stroke: "#fff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 800, fontSize: 16, color: '#fff', lineHeight: 1.25 }, children: ticket.title }), _jsxs("div", { style: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }, children: ["#", ticket.id] })] })] }), _jsxs("div", { className: "cw-scroll", style: { flex: 1, overflowY: 'auto', padding: '20px 18px' }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, children: [_jsx("span", { style: {
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '5px 12px',
                                    borderRadius: 20,
                                    backgroundColor: stBg,
                                    color: stColor,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                }, children: st.label }), _jsxs("span", { style: { fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, color: pr.color, background: `${pr.color}15` }, children: ["\u25CF ", pr.label, " priority"] })] }), _jsx("h3", { style: { margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }, children: "Description" }), _jsx("p", { style: { margin: '0 0 24px', fontSize: 15, color: '#1e293b', lineHeight: 1.65, whiteSpace: 'pre-wrap' }, children: ticket.description || '—' }), _jsxs("div", { style: { fontSize: 13, color: '#94a3b8', display: 'grid', gap: 8 }, children: [_jsxs("div", { children: [_jsx("strong", { style: { color: '#64748b' }, children: "Created" }), " \u00B7 ", new Date(ticket.createdAt).toLocaleString()] }), _jsxs("div", { children: [_jsx("strong", { style: { color: '#64748b' }, children: "Updated" }), " \u00B7 ", new Date(ticket.updatedAt).toLocaleString()] }), ticket.assignedTo && (_jsxs("div", { children: [_jsx("strong", { style: { color: '#64748b' }, children: "Assigned" }), " \u00B7 ", ticket.assignedTo] }))] })] })] }));
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useRef, useEffect } from 'react';
function matchesTicket(t, q) {
    if (!q.trim())
        return true;
    const s = q.trim().toLowerCase();
    return (t.title.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s));
}
export const TicketScreen = ({ tickets, config, onNewTicket, onSelectTicket, animateEntrance = false, }) => {
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    useEffect(() => {
        var _a;
        (_a = searchRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }, []);
    const filtered = useMemo(() => tickets.filter(t => matchesTicket(t, query)), [tickets, query]);
    const sm = {
        open: { label: 'Open', bg: `${config.primaryColor}14`, color: config.primaryColor },
        'in-progress': { label: 'In Progress', bg: '#fef3c7', color: '#d97706' },
        resolved: { label: 'Resolved', bg: '#f0fdf4', color: '#16a34a' },
        closed: { label: 'Closed', bg: '#f3f4f6', color: '#6b7280' },
    };
    const pm = {
        low: { label: 'Low', color: '#6b7280' },
        medium: { label: 'Medium', color: '#d97706' },
        high: { label: 'High', color: '#ef4444' },
    };
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%' }, children: [_jsx("div", { style: {
                    background: `linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
                    padding: '18px 18px 14px', flexShrink: 0, position: 'relative',
                }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("h2", { style: { margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }, children: "Tickets" }), _jsxs("p", { style: { margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.8)' }, children: [tickets.length, " ticket", tickets.length !== 1 ? 's' : '', " raised"] })] }), _jsx("button", { type: "button", onClick: onNewTicket, style: {
                                background: 'rgba(255,255,255,0.22)', border: 'none', borderRadius: 20,
                                padding: '7px 14px', color: '#fff', fontWeight: 700, fontSize: 13,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                flexShrink: 0,
                            }, children: "+ New" })] }) }), _jsx("div", { style: { padding: '10px 14px', background: '#fff', borderBottom: '1px solid #eef0f5', flexShrink: 0 }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f8fafc' }, children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, opacity: 0.55 }, children: [_jsx("circle", { cx: "11", cy: "11", r: "7", stroke: "#64748b", strokeWidth: "2" }), _jsx("path", { d: "M20 20l-4-4", stroke: "#64748b", strokeWidth: "2", strokeLinecap: "round" })] }), _jsx("input", { ref: searchRef, type: "search", value: query, onChange: e => setQuery(e.target.value), placeholder: "Search tickets\u2026", autoComplete: "off", "aria-label": "Search tickets", style: {
                                flex: 1,
                                minWidth: 0,
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: 14,
                                padding: '10px 0',
                                fontFamily: 'inherit',
                                color: '#1a2332',
                            } })] }) }), _jsx("div", { style: { flex: 1, overflowY: 'auto' }, children: filtered.length === 0 ? (_jsxs("div", { style: { padding: '50px 24px', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 36, marginBottom: 10 }, children: query.trim() ? '🔍' : '🎫' }), _jsx("div", { style: { fontWeight: 700, color: '#1a2332', marginBottom: 6 }, children: query.trim() ? 'No matches' : 'No tickets yet' }), _jsx("div", { style: { fontSize: 13, color: '#7b8fa1' }, children: query.trim() ? 'Try a different search' : 'Raise a ticket for major issues' })] })) : filtered.map((t, i) => (_jsxs("button", { type: "button", onClick: () => onSelectTicket(t.id), style: Object.assign(Object.assign({ width: '100%', padding: '14px 16px', borderBottom: '1px solid #f0f2f5' }, (animateEntrance ? { animation: `cw-fadeUp 0.3s ease both`, animationDelay: `${i * 0.05}s` } : {})), { background: 'transparent', borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }), children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: 14, color: '#1a2332', flex: 1, paddingRight: 10 }, children: t.title }), _jsx("span", { style: { fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, backgroundColor: sm[t.status].bg, color: sm[t.status].color, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }, children: sm[t.status].label })] }), t.description && _jsx("p", { style: { margin: '0 0 7px', fontSize: 13, color: '#7b8fa1', lineHeight: 1.5 }, children: t.description }), _jsxs("div", { style: { display: 'flex', gap: 10, fontSize: 11, color: '#b0bec5' }, children: [_jsxs("span", { style: { color: pm[t.priority].color, fontWeight: 700 }, children: ["\u25CF ", pm[t.priority].label] }), _jsxs("span", { children: ["#", t.id] }), _jsx("span", { children: new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) })] })] }, t.id))) })] }));
};

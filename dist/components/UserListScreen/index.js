import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useRef, useEffect } from 'react';
import { avatarColor, initials } from '../../utils/chat';
function matchesUser(u, q) {
    if (!q.trim())
        return true;
    const s = q.trim().toLowerCase();
    return (u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.designation.toLowerCase().includes(s) ||
        u.project.toLowerCase().includes(s));
}
export const UserListScreen = ({ context, users, primaryColor, viewerType = 'user', onBack, onSelectUser, onBlockList, useHomeHeader = false, animateEntrance = false, }) => {
    const [query, setQuery] = useState('');
    const searchRef = useRef(null);
    useEffect(() => {
        var _a;
        (_a = searchRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }, []);
    const filtered = useMemo(() => users.filter(u => matchesUser(u, query)), [users, query]);
    const isStaff = viewerType === 'developer';
    const title = context === 'support'
        ? (isStaff ? 'Provide Support' : 'Need Support')
        : (isStaff ? 'Developers' : 'New Conversation');
    const subtitle = context === 'support'
        ? (isStaff ? 'All chat users — choose who to help' : 'Choose a support agent')
        : (isStaff ? 'Chat with another developer or coordinate handoff' : 'Choose a colleague');
    const rootAnim = animateEntrance ? 'cw-slideIn 0.22s ease' : undefined;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', animation: rootAnim }, children: [_jsxs("div", { style: { background: `linear-gradient(135deg,${primaryColor},${primaryColor}cc)`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, position: 'relative' }, children: [useHomeHeader ? _jsx(HomeBtn, { onClick: onBack }) : _jsx(BackBtn, { onClick: onBack }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 16, color: '#fff' }, children: title }), _jsx("div", { style: { fontSize: 12, color: 'rgba(255,255,255,0.8)' }, children: subtitle })] }), context === 'conversation' && onBlockList && (_jsxs("button", { type: "button", onClick: onBlockList, style: {
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
                        }, title: "Blocked users", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.8" }), _jsx("line", { x1: "4.93", y1: "4.93", x2: "19.07", y2: "19.07", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })] }), "Blocked"] }))] }), _jsx("div", { style: { padding: '10px 14px', background: '#fff', borderBottom: '1px solid #eef0f5', flexShrink: 0 }, children: _jsxs("label", { style: { display: 'block', margin: 0 }, children: [_jsx("span", { style: { position: 'absolute', width: 1, height: 1, padding: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)' }, children: "Search" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f8fafc' }, children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0, opacity: 0.55 }, children: [_jsx("circle", { cx: "11", cy: "11", r: "7", stroke: "#64748b", strokeWidth: "2" }), _jsx("path", { d: "M20 20l-4-4", stroke: "#64748b", strokeWidth: "2", strokeLinecap: "round" })] }), _jsx("input", { ref: searchRef, type: "search", value: query, onChange: e => setQuery(e.target.value), placeholder: "Search by name\u2026", autoComplete: "off", style: {
                                        flex: 1,
                                        minWidth: 0,
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: 14,
                                        padding: '10px 0',
                                        fontFamily: 'inherit',
                                        color: '#1a2332',
                                    } })] })] }) }), _jsx("div", { style: { flex: 1, overflowY: 'auto' }, children: filtered.length === 0 ? (_jsx(Empty, { hasQuery: !!query.trim() })) : filtered.map((u, i) => (_jsxs("button", { onClick: () => onSelectUser(u), style: Object.assign(Object.assign({ width: '100%', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 13, background: 'transparent', border: 'none', borderBottom: '1px solid #f0f2f5', cursor: 'pointer', textAlign: 'left' }, (animateEntrance
                        ? { animation: `cw-fadeUp 0.28s ease both`, animationDelay: `${i * 0.05}s` }
                        : {})), { transition: 'background 0.14s' }), onMouseEnter: e => e.currentTarget.style.background = '#f8faff', onMouseLeave: e => e.currentTarget.style.background = 'transparent', children: [_jsxs("div", { style: { position: 'relative', flexShrink: 0 }, children: [_jsx("div", { style: {
                                        width: 44, height: 44, borderRadius: '50%',
                                        backgroundColor: avatarColor(u.name),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: 14,
                                    }, children: initials(u.name) }), _jsx("span", { style: {
                                        position: 'absolute', bottom: 1, right: 1,
                                        width: 11, height: 11, borderRadius: '50%', border: '2px solid #fff',
                                        backgroundColor: u.status === 'online' ? '#22c55e' : u.status === 'away' ? '#f59e0b' : '#d1d5db',
                                    } })] }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: '#1a2332', marginBottom: 2 }, children: u.name }), _jsxs("div", { style: { fontSize: 12, color: '#7b8fa1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: [u.designation, " \u00B7 ", u.project] })] }), _jsx("span", { style: {
                                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                                textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
                                background: u.type === 'developer' ? `${primaryColor}15` : '#f0fdf4',
                                color: u.type === 'developer' ? primaryColor : '#16a34a',
                                border: `1px solid ${u.type === 'developer' ? primaryColor + '30' : '#16a34a30'}`,
                            }, children: u.type === 'developer' ? 'Dev' : 'User' })] }, u.uid))) })] }));
};
const BackBtn = ({ onClick }) => (_jsx("button", { type: "button", onClick: onClick, style: {
        background: 'rgba(255,255,255,0.22)', border: 'none', borderRadius: '50%',
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
    }, children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M19 12H5M5 12L12 19M5 12L12 5", stroke: "#fff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }));
const HomeBtn = ({ onClick }) => (_jsx("button", { type: "button", onClick: onClick, title: "Home", "aria-label": "Home", style: {
        background: 'rgba(255,255,255,0.22)', border: 'none', borderRadius: '50%',
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
    }, children: _jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z", stroke: "#fff", strokeWidth: "2.2", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M9 21V12h6v9", stroke: "#fff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })] }) }));
const Empty = ({ hasQuery }) => (_jsxs("div", { style: { padding: '50px 24px', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 36, marginBottom: 10 }, children: hasQuery ? '🔍' : '👥' }), _jsx("div", { style: { fontWeight: 700, color: '#1a2332', marginBottom: 6 }, children: hasQuery ? 'No matches' : 'No users available' }), _jsx("div", { style: { fontSize: 13, color: '#7b8fa1' }, children: hasQuery ? 'Try a different search' : 'Check back later' })] }));

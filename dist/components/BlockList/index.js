import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { avatarColor, initials } from '../../utils/chat';
export const BlockListScreen = ({ blockedUsers, config, onUnblock, onBack, }) => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', animation: 'cw-slideIn 0.22s ease' }, children: [_jsxs("div", { style: {
                background: `linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }, children: [_jsx("button", { onClick: onBack, style: backBtnStyle, children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M19 12H5M5 12L12 19M5 12L12 5", stroke: "#fff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, fontSize: 16, color: '#fff' }, children: "Block List" }), _jsxs("div", { style: { fontSize: 12, color: 'rgba(255,255,255,0.8)' }, children: [blockedUsers.length, " blocked user", blockedUsers.length !== 1 ? 's' : ''] })] })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto' }, children: blockedUsers.length === 0 ? (_jsxs("div", { style: { padding: '50px 24px', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 36, marginBottom: 10 }, children: "\u2705" }), _jsx("div", { style: { fontWeight: 700, color: '#1a2332', marginBottom: 6 }, children: "No blocked users" }), _jsx("div", { style: { fontSize: 13, color: '#7b8fa1' }, children: "Users you block will appear here" })] })) : (blockedUsers.map((user, i) => (_jsxs("div", { style: {
                    padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 13,
                    borderBottom: '1px solid #f0f2f5',
                    animation: `cw-fadeUp 0.28s ease both`, animationDelay: `${i * 0.05}s`,
                }, children: [_jsx("div", { style: {
                            width: 44, height: 44, borderRadius: '50%',
                            backgroundColor: avatarColor(user.name),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                            filter: 'grayscale(0.6)', opacity: 0.7,
                        }, children: initials(user.name) }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: '#6b7280' }, children: user.name }), _jsx("div", { style: { fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: user.email })] }), _jsx("button", { onClick: () => onUnblock(user.uid), style: {
                            padding: '6px 14px', borderRadius: 20,
                            border: `1.5px solid ${config.primaryColor}`,
                            background: 'transparent', color: config.primaryColor,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.15s', flexShrink: 0,
                        }, onMouseEnter: e => {
                            e.currentTarget.style.background = config.primaryColor;
                            e.currentTarget.style.color = '#fff';
                        }, onMouseLeave: e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = config.primaryColor;
                        }, children: "Unblock" })] }, user.uid)))) })] }));
const backBtnStyle = {
    background: 'rgba(255,255,255,0.22)', border: 'none', borderRadius: '50%',
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
};

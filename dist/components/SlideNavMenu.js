import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const SlideNavMenu = ({ open, onClose, primaryColor, chatType, viewerType = 'user', onSelect, onBackHome, }) => {
    const showSupport = chatType === 'SUPPORT' || chatType === 'BOTH';
    const showChat = chatType === 'CHAT' || chatType === 'BOTH';
    const isStaff = viewerType === 'developer';
    const items = [
        showSupport ? { key: 'support', icon: '🛠', title: isStaff ? 'Provide Support' : 'Need Support' } : null,
        showChat ? { key: 'conversation', icon: '💬', title: isStaff ? 'Chat with developer' : 'New Conversation' } : null,
        { key: 'ticket', icon: '🎫', title: 'Raise ticket' },
    ];
    if (!open)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "aria-label": "Close menu", onClick: onClose, style: {
                    position: 'absolute',
                    inset: 0,
                    zIndex: 200,
                    background: 'rgba(15,23,42,0.45)',
                    border: 'none',
                    cursor: 'pointer',
                    animation: 'cw-fadeIn 0.2s ease',
                } }), _jsx("style", { children: `@keyframes cw-fadeIn { from { opacity: 0; } to { opacity: 1; } }` }), _jsxs("nav", { style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 'min(300px, 88%)',
                    zIndex: 210,
                    background: '#fff',
                    boxShadow: '8px 0 32px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px 0 16px',
                    animation: 'cw-slideNavIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
                }, children: [_jsx("style", { children: `@keyframes cw-slideNavIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }` }), _jsx("div", { style: { padding: '0 20px 16px', borderBottom: '1px solid #eef0f5' }, children: _jsx("p", { style: { margin: 0, fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }, children: "Menu" }) }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: '12px 12px' }, children: items.filter(Boolean).map(item => {
                            const it = item;
                            return (_jsxs("button", { type: "button", onClick: () => {
                                    onSelect(it.key);
                                    onClose();
                                }, style: {
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '14px 14px',
                                    marginBottom: 6,
                                    border: 'none',
                                    borderRadius: 12,
                                    background: '#f8fafc',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    transition: 'background 0.15s',
                                }, onMouseEnter: e => {
                                    e.currentTarget.style.background = `${primaryColor}12`;
                                }, onMouseLeave: e => {
                                    e.currentTarget.style.background = '#f8fafc';
                                }, children: [_jsx("span", { style: { fontSize: 20 }, children: it.icon }), it.title] }, it.key));
                        }) }), onBackHome && (_jsx("div", { style: { padding: '0 12px', borderTop: '1px solid #eef0f5', paddingTop: 12 }, children: _jsx("button", { type: "button", onClick: () => {
                                onBackHome();
                                onClose();
                            }, style: {
                                width: '100%',
                                padding: '12px 14px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: 12,
                                background: '#fff',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#475569',
                                cursor: 'pointer',
                            }, children: "\u2190 Back to home" }) }))] })] }));
};

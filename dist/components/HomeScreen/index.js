import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { SlideNavMenu } from '../SlideNavMenu';
import { truncateWords } from '../../utils/chat';
import { resolveInitialPresence, savePresenceStatus, syncPresenceToServer, } from '../../utils/presenceStatus';
const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'AWAY', label: 'Away' },
    { value: 'DND', label: 'DND' },
];
export const HomeScreen = ({ config, apiKey, onNavigate, onOpenTicket, tickets }) => {
    var _a, _b, _c, _d;
    const [menuOpen, setMenuOpen] = useState(false);
    const [presence, setPresence] = useState(() => resolveInitialPresence(config.id, config.presenceStatus));
    useEffect(() => {
        setPresence(resolveInitialPresence(config.id, config.presenceStatus));
    }, [config.id, config.presenceStatus]);
    const setPresenceAndSave = (s) => {
        var _a, _b;
        setPresence(s);
        savePresenceStatus(config.id, s);
        const url = (_a = config.presenceUpdateUrl) === null || _a === void 0 ? void 0 : _a.trim();
        if (!url)
            return;
        void syncPresenceToServer(url, {
            widgetId: config.id,
            apiKey,
            viewerUid: ((_b = config.viewerUid) === null || _b === void 0 ? void 0 : _b.trim()) || undefined,
            status: s,
        }).catch(err => {
            console.error('[ajaxter-chat] presence sync failed', err);
        });
    };
    const showSupport = config.chatType === 'SUPPORT' || config.chatType === 'BOTH';
    const showChat = config.chatType === 'CHAT' || config.chatType === 'BOTH';
    const viewerIsDev = config.viewerType === 'developer';
    const pendingTickets = useMemo(() => tickets
        .filter(t => t.status === 'open' || t.status === 'in-progress')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5), [tickets]);
    const brand = ((_a = config.brandName) === null || _a === void 0 ? void 0 : _a.trim()) || 'Ajaxter';
    const promotionLead = ((_b = config.promotionLead) === null || _b === void 0 ? void 0 : _b.trim()) ||
        'Need specialized help? Our teams are ready to assist you with any questions.';
    const tourUrl = (_c = config.websiteTourUrl) === null || _c === void 0 ? void 0 : _c.trim();
    const handleCallUs = () => {
        var _a;
        const raw = (_a = config.supportPhone) === null || _a === void 0 ? void 0 : _a.trim();
        if (!raw)
            return;
        window.location.href = `tel:${raw.replace(/\s/g, '')}`;
    };
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', background: '#fafbfc' }, children: [_jsx(SlideNavMenu, { open: menuOpen, onClose: () => setMenuOpen(false), primaryColor: config.primaryColor, chatType: config.chatType, viewerType: (_d = config.viewerType) !== null && _d !== void 0 ? _d : 'user', onSelect: ctx => {
                    onNavigate(ctx, { fromMenu: true });
                } }), _jsxs("div", { style: {
                    flexShrink: 0,
                    padding: '12px 14px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#fff',
                    borderBottom: '1px solid #eef0f5',
                }, children: [_jsxs("button", { type: "button", "aria-label": "Open menu", onClick: () => setMenuOpen(true), style: {
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
                        }, children: [_jsx("span", { style: { width: 18, height: 2, background: '#334155', borderRadius: 1 } }), _jsx("span", { style: { width: 18, height: 2, background: '#334155', borderRadius: 1 } }), _jsx("span", { style: { width: 18, height: 2, background: '#334155', borderRadius: 1 } })] }), _jsx("div", { style: { flex: 1, minWidth: 0 } }), _jsx("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexShrink: 0,
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end',
                        }, children: _jsx("div", { role: "group", "aria-label": "Your status", style: {
                                display: 'flex',
                                borderRadius: 10,
                                padding: 3,
                                background: '#f1f5f9',
                                gap: 2,
                            }, children: STATUS_OPTIONS.map(({ value, label }) => {
                                const isOn = presence === value;
                                return (_jsx("button", { type: "button", onClick: () => setPresenceAndSave(value), style: {
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
                                    }, children: label }, value));
                            }) }) })] }), _jsxs("div", { className: "cw-scroll", style: { flex: 1, overflowY: 'auto', padding: '20px 18px 28px' }, children: [_jsx("h1", { style: {
                            margin: '0 0 8px',
                            fontSize: 24,
                            fontWeight: 800,
                            color: '#0f172a',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.2,
                        }, children: config.welcomeTitle }), _jsx("p", { style: { margin: '0 0 28px', fontSize: 14, color: '#64748b', lineHeight: 1.55 }, children: config.welcomeSubtitle }), _jsx("h2", { style: { margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }, children: "Continue with tickets" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }, children: pendingTickets.length > 0 ? (pendingTickets.map(t => (_jsxs("button", { type: "button", onClick: () => onOpenTicket(t.id), style: {
                                width: '100%',
                                textAlign: 'left',
                                padding: '14px 16px',
                                borderRadius: 14,
                                border: 'none',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }, children: [_jsx("div", { style: { fontSize: 14, fontWeight: 700, color: '#0c4a6e', marginBottom: 6 }, children: t.title }), _jsx("div", { style: { fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.45 }, children: truncateWords(t.description, 50) })] }, t.id)))) : (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                        padding: '14px 16px',
                                        borderRadius: 14,
                                        background: '#e0f2fe',
                                        color: '#64748b',
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }, children: "No open tickets yet" }), _jsx("div", { style: {
                                        padding: '14px 16px',
                                        borderRadius: 14,
                                        background: '#e0f2fe',
                                        color: '#64748b',
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }, children: "Start via Raise ticket below" })] })) }), _jsx("h2", { style: { margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }, children: viewerIsDev ? 'Support tools' : 'Talk to support experts' }), showSupport && (_jsxs("button", { type: "button", onClick: () => onNavigate('support'), style: {
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
                        }, children: [_jsx("span", { style: { fontSize: 18 }, children: "\uD83D\uDC64" }), viewerIsDev ? 'Provide Support' : 'Support'] })), showChat && showSupport && (_jsx("button", { type: "button", onClick: () => onNavigate('conversation'), style: {
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
                        }, children: viewerIsDev ? 'Chat with a developer' : 'New Conversation' })), showChat && !showSupport && (_jsxs("button", { type: "button", onClick: () => onNavigate('conversation'), style: {
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
                        }, children: [_jsx("span", { style: { fontSize: 18 }, children: "\uD83D\uDCAC" }), "New Conversation"] })), _jsxs("div", { style: {
                            borderRadius: 18,
                            padding: '22px 20px 20px',
                            background: 'linear-gradient(145deg, #fce7f3 0%, #e9d5ff 45%, #ddd6fe 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                        }, children: [_jsx("div", { style: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' } }), _jsx("p", { style: { margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#4c1d95', lineHeight: 1.45, position: 'relative' }, children: promotionLead }), _jsxs("p", { style: { margin: '0 0 16px', fontSize: 13, fontWeight: 500, color: '#5b21b6', lineHeight: 1.5, position: 'relative' }, children: [_jsx("strong", { style: { fontWeight: 800 }, children: brand }), " \u2014 embedded chat for your workspace.", ' ', _jsx("span", { style: { whiteSpace: 'nowrap' }, children: "Free for users." }), " 24\u00D77 availability. Dedicated workspace experience."] }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 10, position: 'relative' }, children: [tourUrl && (_jsx("a", { href: tourUrl, target: "_blank", rel: "noopener noreferrer", style: {
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
                                        }, children: "Take a Website Tour" })), _jsxs("button", { type: "button", onClick: handleCallUs, disabled: !config.supportPhone, style: {
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
                                        }, children: [_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z", fill: "#fff" }) }), "Get Free Widget"] })] })] })] })] }));
};

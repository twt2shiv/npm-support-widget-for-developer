'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { loadLocalConfig } from '../config';
import { mergeTheme } from '../utils/theme';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { useChat } from '../hooks/useChat';
import { useWebRTC } from '../hooks/useWebRTC';
import { saveSession, loadSession } from '../utils/widgetSession';
import { playMessageSound, getMessageSoundEnabled, setMessageSoundEnabled } from '../utils/messageSound';
import { HomeScreen } from './HomeScreen';
import { UserListScreen } from './UserListScreen';
import { ChatScreen } from './ChatScreen';
import { RecentChatsScreen } from './RecentChatsScreen';
import { TicketScreen } from './TicketScreen';
import { TicketDetailScreen } from './TicketDetailScreen';
import { TicketFormScreen } from './TicketFormScreen';
import { BlockListScreen } from './BlockList';
import { CallScreen } from './CallScreen';
import { MaintenanceView } from './MaintenanceView';
import { BottomTabs } from './Tabs/BottomTabs';
export const ChatWidget = ({ theme: localTheme }) => {
    var _a, _b, _c, _d, _e;
    /* SSR guard */
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    /* Env config */
    const { apiKey, widgetId } = loadLocalConfig();
    /* Remote config */
    const { data, loading: cfgLoading, error: cfgError } = useRemoteConfig(apiKey, widgetId);
    /* Merged theme — remote config overrides defaults, local prop overrides both */
    const theme = mergeTheme((data === null || data === void 0 ? void 0 : data.widget) ? { primaryColor: data.widget.primaryColor, buttonLabel: data.widget.buttonLabel, buttonPosition: data.widget.buttonPosition } : undefined, localTheme);
    /* Drawer open state */
    const [isOpen, setIsOpen] = useState(false);
    const [closing, setClosing] = useState(false); // for slide-out animation
    /* Navigation */
    const [activeTab, setActiveTab] = useState('home');
    const [screen, setScreen] = useState('home');
    const [userListCtx, setUserListCtx] = useState('support');
    const [chatReturnCtx, setChatReturnCtx] = useState('conversation');
    const [viewingTicketId, setViewingTicketId] = useState(null);
    const [messageSoundEnabled, setMessageSoundEnabledState] = useState(true);
    /** Stagger list animation only when opening from home burger menu */
    const [listEntranceAnimation, setListEntranceAnimation] = useState(false);
    /* App state */
    const [tickets, setTickets] = useState((_a = data === null || data === void 0 ? void 0 : data.sampleTickets) !== null && _a !== void 0 ? _a : []);
    const [recentChats, setRecentChats] = useState([]);
    const [blockedUids, setBlockedUids] = useState((_b = data === null || data === void 0 ? void 0 : data.blockedUsers) !== null && _b !== void 0 ? _b : []);
    /* Sync remote data into local state once loaded */
    useEffect(() => {
        var _a, _b;
        if (data) {
            setTickets(data.sampleTickets);
            setBlockedUids(data.blockedUsers);
            // Seed recent chats from sample chats
            const all = [...((_a = data.developers) !== null && _a !== void 0 ? _a : []), ...((_b = data.users) !== null && _b !== void 0 ? _b : [])];
            const recents = Object.entries(data.sampleChats).map(([uid, msgs]) => {
                const user = all.find(u => u.uid === uid);
                if (!user || msgs.length === 0)
                    return null;
                const last = msgs[msgs.length - 1];
                return {
                    id: `rc_${uid}`,
                    user,
                    lastMessage: last.text,
                    lastTime: last.timestamp,
                    unread: Math.floor(Math.random() * 3),
                    isPaused: false,
                };
            }).filter(Boolean);
            setRecentChats(recents);
        }
    }, [data]);
    /* Chat hook */
    const { messages, activeUser, isPaused, isReported, selectUser, sendMessage, togglePause, reportChat, clearChat, setMessages, } = useChat();
    /* WebRTC hook */
    const { session: callSession, localVideoRef, remoteVideoRef, startCall, endCall, toggleMute, toggleCamera } = useWebRTC();
    /* ── Drawer open/close with slide animation ───────────────────────────── */
    const openDrawer = () => {
        setClosing(false);
        setIsOpen(true);
    };
    const persistWidgetState = useCallback(() => {
        var _a;
        const w = data === null || data === void 0 ? void 0 : data.widget;
        if (!w)
            return;
        saveSession(w.id, {
            screen,
            activeTab,
            userListCtx,
            activeUserUid: (_a = activeUser === null || activeUser === void 0 ? void 0 : activeUser.uid) !== null && _a !== void 0 ? _a : null,
            messages,
            viewingTicketId,
            chatReturnCtx,
        });
    }, [data === null || data === void 0 ? void 0 : data.widget, screen, activeTab, userListCtx, activeUser === null || activeUser === void 0 ? void 0 : activeUser.uid, messages, viewingTicketId, chatReturnCtx]);
    const closeDrawer = useCallback(() => {
        persistWidgetState();
        setClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setClosing(false);
        }, 300);
    }, [persistWidgetState]);
    const restoredRef = useRef(false);
    useEffect(() => {
        var _a, _b, _c;
        if (!(data === null || data === void 0 ? void 0 : data.widget) || restoredRef.current)
            return;
        const w = data.widget;
        setMessageSoundEnabledState(getMessageSoundEnabled(w.id));
        const p = loadSession(w.id);
        if (p) {
            setScreen(p.screen);
            setActiveTab(p.activeTab);
            setUserListCtx(p.userListCtx);
            setViewingTicketId((_a = p.viewingTicketId) !== null && _a !== void 0 ? _a : null);
            setChatReturnCtx((_b = p.chatReturnCtx) !== null && _b !== void 0 ? _b : 'conversation');
            if (p.activeUserUid) {
                const u = [...data.developers, ...data.users].find(x => x.uid === p.activeUserUid);
                if (u) {
                    const hist = Array.isArray(p.messages) && p.messages.length
                        ? p.messages
                        : ((_c = data.sampleChats[u.uid]) !== null && _c !== void 0 ? _c : []);
                    selectUser(u, hist);
                }
            }
        }
        restoredRef.current = true;
    }, [data, selectUser]);
    useEffect(() => {
        if (!(data === null || data === void 0 ? void 0 : data.widget))
            return;
        persistWidgetState();
    }, [(_c = data === null || data === void 0 ? void 0 : data.widget) === null || _c === void 0 ? void 0 : _c.id, screen, activeTab, userListCtx, activeUser === null || activeUser === void 0 ? void 0 : activeUser.uid, messages, viewingTicketId, chatReturnCtx, persistWidgetState]);
    const incomingSoundRef = useRef(0);
    useEffect(() => {
        incomingSoundRef.current = messages.length;
    }, [activeUser === null || activeUser === void 0 ? void 0 : activeUser.uid]);
    useEffect(() => {
        if (!messageSoundEnabled || !activeUser || !(data === null || data === void 0 ? void 0 : data.widget))
            return;
        if (messages.length < incomingSoundRef.current) {
            incomingSoundRef.current = messages.length;
            return;
        }
        const added = messages.slice(incomingSoundRef.current);
        incomingSoundRef.current = messages.length;
        if (added.some(m => m.senderId !== 'me'))
            playMessageSound();
    }, [messages, messageSoundEnabled, activeUser, data === null || data === void 0 ? void 0 : data.widget]);
    const toggleMessageSound = useCallback((enabled) => {
        const w = data === null || data === void 0 ? void 0 : data.widget;
        if (!w)
            return;
        setMessageSoundEnabled(w.id, enabled);
        setMessageSoundEnabledState(enabled);
    }, [data === null || data === void 0 ? void 0 : data.widget]);
    /* ── Navigation ──────────────────────────────────────────────────────── */
    const handleCardClick = useCallback((ctx, options) => {
        setListEntranceAnimation(!!(options === null || options === void 0 ? void 0 : options.fromMenu));
        if (ctx === 'ticket') {
            setActiveTab('tickets');
            setScreen('tickets');
        }
        else {
            setUserListCtx(ctx);
            setScreen('user-list');
        }
    }, []);
    const handleNavFromMenu = useCallback((ctx) => {
        setListEntranceAnimation(false);
        clearChat();
        if (ctx === 'ticket') {
            setActiveTab('tickets');
            setScreen('tickets');
        }
        else {
            setUserListCtx(ctx);
            setScreen('user-list');
        }
    }, [clearChat]);
    const listCtxForUser = useCallback((user, viewerIsDev) => {
        if (viewerIsDev)
            return user.type === 'user' ? 'support' : 'conversation';
        return user.type === 'developer' ? 'support' : 'conversation';
    }, []);
    const handleSelectUser = useCallback((user, returnCtxOverride) => {
        var _a;
        setListEntranceAnimation(false);
        setChatReturnCtx(returnCtxOverride !== null && returnCtxOverride !== void 0 ? returnCtxOverride : userListCtx);
        const history = (_a = data === null || data === void 0 ? void 0 : data.sampleChats[user.uid]) !== null && _a !== void 0 ? _a : [];
        selectUser(user, history);
        setScreen('chat');
        setRecentChats(prev => {
            const exists = prev.find(r => r.user.uid === user.uid);
            if (exists)
                return prev;
            return [{ id: `rc_${user.uid}`, user, lastMessage: '', lastTime: new Date().toISOString(), unread: 0, isPaused: false }, ...prev];
        });
    }, [data, selectUser, userListCtx]);
    const handleBackFromChat = useCallback(() => {
        setListEntranceAnimation(false);
        clearChat();
        setUserListCtx(chatReturnCtx);
        setScreen('user-list');
    }, [clearChat, chatReturnCtx]);
    const handleOpenTicket = useCallback((id) => {
        setListEntranceAnimation(false);
        setViewingTicketId(id);
        setScreen('ticket-detail');
        setActiveTab('tickets');
    }, []);
    const handleTabChange = useCallback((tab) => {
        setListEntranceAnimation(false);
        setActiveTab(tab);
        setScreen(tab === 'home' ? 'home' : tab === 'chats' ? 'recent-chats' : 'tickets');
    }, []);
    useEffect(() => {
        if (!listEntranceAnimation)
            return;
        const t = window.setTimeout(() => setListEntranceAnimation(false), 520);
        return () => window.clearTimeout(t);
    }, [listEntranceAnimation]);
    /* ── Block/Unblock ───────────────────────────────────────────────────── */
    const handleBlock = useCallback(() => {
        if (!activeUser)
            return;
        setBlockedUids(prev => [...prev, activeUser.uid]);
        clearChat();
        setScreen('block-list');
        setActiveTab('home');
    }, [activeUser, clearChat]);
    const handleUnblock = useCallback((uid) => {
        setBlockedUids(prev => prev.filter(id => id !== uid));
    }, []);
    /* ── Tickets ─────────────────────────────────────────────────────────── */
    const handleRaiseTicket = useCallback((title, desc, priority) => {
        const t = {
            id: `TKT-${String(Date.now()).slice(-4)}`,
            title, description: desc, status: 'open', priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assignedTo: null,
        };
        setTickets(prev => [...prev, t]);
        setViewingTicketId(t.id);
        setScreen('ticket-detail');
        setActiveTab('tickets');
    }, []);
    /* ── Pause sync back into recent chats ──────────────────────────────── */
    const handleTogglePause = useCallback(() => {
        togglePause();
        if (activeUser) {
            setRecentChats(prev => prev.map(r => r.user.uid === activeUser.uid ? Object.assign(Object.assign({}, r), { isPaused: !isPaused }) : r));
        }
    }, [togglePause, activeUser, isPaused]);
    /* ── Call ────────────────────────────────────────────────────────────── */
    const handleStartCall = useCallback((withVideo) => {
        if (!activeUser)
            return;
        startCall(activeUser, withVideo);
        setScreen('call');
    }, [activeUser, startCall]);
    const handleEndCall = useCallback(() => {
        endCall();
        setScreen('chat');
    }, [endCall]);
    /* ── Derived ─────────────────────────────────────────────────────────── */
    const isBlocked = activeUser ? blockedUids.includes(activeUser.uid) : false;
    const widgetConfig = data === null || data === void 0 ? void 0 : data.widget;
    const primaryColor = theme.primaryColor;
    const allUsers = data ? [...data.developers, ...data.users] : [];
    const viewerIsDev = (widgetConfig === null || widgetConfig === void 0 ? void 0 : widgetConfig.viewerType) === 'developer';
    const viewerUid = widgetConfig === null || widgetConfig === void 0 ? void 0 : widgetConfig.viewerUid;
    const filteredUsers = screen === 'user-list'
        ? allUsers.filter(u => {
            if (userListCtx === 'support') {
                if (viewerIsDev)
                    return u.type === 'user';
                return u.type === 'developer';
            }
            if (viewerIsDev) {
                return u.type === 'developer' && u.uid !== viewerUid;
            }
            return u.type === 'user';
        })
        : [];
    const otherDevelopers = (_d = data === null || data === void 0 ? void 0 : data.developers.filter(d => d.uid !== viewerUid)) !== null && _d !== void 0 ? _d : [];
    const blockedUsers = allUsers.filter(u => blockedUids.includes(u.uid));
    const handleTransferToDeveloper = useCallback((dev) => {
        var _a;
        if (!activeUser || !widgetConfig)
            return;
        const agent = ((_a = widgetConfig.viewerName) === null || _a === void 0 ? void 0 : _a.trim()) || 'Agent';
        const transferNote = {
            id: `tr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            senderId: 'me',
            receiverId: dev.uid,
            text: `— ${agent} transferred this conversation from ${activeUser.name} to ${dev.name} —`,
            timestamp: new Date().toISOString(),
            type: 'text',
            status: 'sent',
        };
        selectUser(dev, [...messages, transferNote]);
    }, [activeUser, messages, selectUser, widgetConfig]);
    /* Position */
    const posStyle = theme.buttonPosition === 'bottom-left'
        ? { left: 24, right: 'auto' }
        : { right: 24, left: 'auto' };
    /* No radius on top-left / bottom-left; left-docked panel keeps inner TR/BR curve */
    const drawerPosStyle = theme.buttonPosition === 'bottom-left'
        ? {
            left: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
        }
        : {
            right: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        };
    /* ── Don't render until mounted (SSR safe) ──────────────────────────── */
    if (!mounted)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .cw-root * { box-sizing: border-box; font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes cw-slideInRight  { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes cw-slideOutRight { from { transform: translateX(0); opacity: 1; }    to { transform: translateX(100%); opacity: 0; } }
        @keyframes cw-slideInLeft   { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes cw-slideOutLeft  { from { transform: translateX(0); opacity: 1; }    to { transform: translateX(-100%); opacity: 0; } }
        @keyframes cw-fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cw-slideIn { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes cw-pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes cw-btnPop  { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .cw-scroll::-webkit-scrollbar        { width: 4px; }
        .cw-scroll::-webkit-scrollbar-track  { background: transparent; }
        .cw-scroll::-webkit-scrollbar-thumb  { background: #e0e0e0; border-radius: 4px; }

        .cw-drawer-enter { animation: ${theme.buttonPosition === 'bottom-left' ? 'cw-slideInLeft' : 'cw-slideInRight'} 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .cw-drawer-exit  { animation: ${theme.buttonPosition === 'bottom-left' ? 'cw-slideOutLeft' : 'cw-slideOutRight'} 0.28s cubic-bezier(0.55,0,1,0.45) both; }

        .cw-drawer-panel {
          width: 30%;
          max-width: 100vw;
          min-width: 0;
        }
        @media (max-width: 1024px) {
          .cw-drawer-panel { width: 100%; }
        }
      ` }), !isOpen && (_jsxs("button", { className: "cw-root", onClick: openDrawer, "aria-label": theme.buttonLabel, style: Object.assign(Object.assign({ position: 'fixed', bottom: 24, zIndex: 9999 }, posStyle), { display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', backgroundColor: theme.buttonColor, color: theme.buttonTextColor, border: 'none', borderRadius: 50, cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: `0 8px 28px ${theme.buttonColor}55`, animation: 'cw-btnPop 0.4s cubic-bezier(0.34,1.56,0.64,1)', transition: 'transform 0.2s, box-shadow 0.2s' }), onMouseEnter: e => {
                    e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 14px 36px ${theme.buttonColor}66`;
                }, onMouseLeave: e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 8px 28px ${theme.buttonColor}55`;
                }, children: [_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", stroke: theme.buttonTextColor, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }), _jsx("span", { children: theme.buttonLabel })] })), isOpen && (_jsx("div", { "aria-hidden": true, style: {
                    position: 'fixed', inset: 0, zIndex: 9997,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    opacity: closing ? 0 : 1,
                    transition: 'opacity 0.3s',
                } })), isOpen && (_jsxs("div", { className: `cw-root cw-drawer-panel ${closing ? 'cw-drawer-exit' : 'cw-drawer-enter'}`, style: Object.assign(Object.assign({ position: 'fixed', top: 0, bottom: 0 }, drawerPosStyle), { zIndex: 9998, backgroundColor: '#fff', boxShadow: theme.buttonPosition === 'bottom-left'
                        ? '4px 0 40px rgba(0,0,0,0.18)'
                        : '-4px 0 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }), children: [cfgLoading && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }, children: [_jsx("div", { style: {
                                    width: 40, height: 40, borderRadius: '50%',
                                    border: `3px solid ${primaryColor}30`,
                                    borderTopColor: primaryColor,
                                    animation: 'spin 0.8s linear infinite',
                                } }), _jsx("style", { children: `@keyframes spin { to { transform: rotate(360deg); } }` }), _jsx("p", { style: { fontSize: 14, color: '#7b8fa1' }, children: "Loading chat\u2026" })] })), cfgError && !cfgLoading && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 32, textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 40 }, children: "\u26A0\uFE0F" }), _jsx("p", { style: { fontWeight: 700, color: '#1a2332' }, children: "Could not load chat configuration" }), _jsx("p", { style: { fontSize: 13, color: '#7b8fa1', lineHeight: 1.6 }, children: cfgError }), _jsx("button", { onClick: closeDrawer, style: { padding: '9px 20px', borderRadius: 10, border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', fontWeight: 700 }, children: "Close" })] })), !cfgLoading && !cfgError && widgetConfig && (_jsxs(_Fragment, { children: [screen !== 'chat' && screen !== 'call' && (_jsx("div", { style: {
                                    position: 'absolute', top: 12,
                                    right: theme.buttonPosition === 'bottom-left' ? 'auto' : 12,
                                    left: theme.buttonPosition === 'bottom-left' ? 12 : 'auto',
                                    zIndex: 20, display: 'flex', gap: 6,
                                }, children: _jsx(CornerBtn, { onClick: closeDrawer, title: "Close", children: _jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M18 6L6 18M6 6l12 12", stroke: "#fff", strokeWidth: "2.5", strokeLinecap: "round" }) }) }) })), widgetConfig.status === 'MAINTENANCE' && (_jsx(MaintenanceView, { primaryColor: primaryColor })), widgetConfig.status === 'DISABLE' && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32, textAlign: 'center', gap: 12 }, children: [_jsx("div", { style: { fontSize: 40 }, children: "\uD83D\uDD12" }), _jsx("p", { style: { fontWeight: 700, color: '#1a2332' }, children: "Chat is disabled" }), _jsx("button", { onClick: closeDrawer, style: { padding: '9px 20px', borderRadius: 10, border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', fontWeight: 700 }, children: "Close" })] })), widgetConfig.status === 'ACTIVE' && (_jsxs("div", { className: "cw-scroll", style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, children: [screen === 'home' && (_jsx(HomeScreen, { config: widgetConfig, onNavigate: handleCardClick, onOpenTicket: handleOpenTicket, tickets: tickets })), screen === 'user-list' && (_jsx(UserListScreen, { context: userListCtx, users: filteredUsers, primaryColor: primaryColor, viewerType: (_e = widgetConfig.viewerType) !== null && _e !== void 0 ? _e : 'user', onBack: () => { setListEntranceAnimation(false); setScreen('home'); }, onSelectUser: handleSelectUser, onBlockList: userListCtx === 'conversation' ? () => setScreen('block-list') : undefined, useHomeHeader: userListCtx === 'support' && widgetConfig.viewerType !== 'developer', animateEntrance: listEntranceAnimation })), screen === 'chat' && activeUser && (_jsx(ChatScreen, { activeUser: activeUser, messages: messages, config: widgetConfig, isPaused: isPaused, isReported: isReported, isBlocked: isBlocked, onSend: sendMessage, onBack: handleBackFromChat, onClose: closeDrawer, onTogglePause: handleTogglePause, onReport: reportChat, onBlock: handleBlock, onStartCall: handleStartCall, onNavAction: handleNavFromMenu, otherDevelopers: otherDevelopers, onTransferToDeveloper: handleTransferToDeveloper, messageSoundEnabled: messageSoundEnabled, onToggleMessageSound: toggleMessageSound })), screen === 'call' && callSession.peer && (_jsx(CallScreen, { session: callSession, localVideoRef: localVideoRef, remoteVideoRef: remoteVideoRef, onEnd: handleEndCall, onToggleMute: toggleMute, onToggleCamera: toggleCamera, primaryColor: primaryColor })), screen === 'recent-chats' && (_jsx(RecentChatsScreen, { chats: recentChats, config: widgetConfig, onSelectChat: u => handleSelectUser(u, listCtxForUser(u, viewerIsDev)), animateEntrance: listEntranceAnimation })), screen === 'tickets' && (_jsx(TicketScreen, { tickets: tickets, config: widgetConfig, onNewTicket: () => { setListEntranceAnimation(false); setScreen('ticket-new'); }, onSelectTicket: id => {
                                            setListEntranceAnimation(false);
                                            setViewingTicketId(id);
                                            setScreen('ticket-detail');
                                        }, animateEntrance: listEntranceAnimation })), screen === 'ticket-new' && (_jsx(TicketFormScreen, { config: widgetConfig, onSubmit: handleRaiseTicket, onCancel: () => setScreen('tickets') })), screen === 'ticket-detail' && viewingTicketId && ((() => {
                                        const t = tickets.find(x => x.id === viewingTicketId);
                                        return t ? (_jsx(TicketDetailScreen, { ticket: t, config: widgetConfig, onBack: () => { setViewingTicketId(null); setScreen('tickets'); } })) : null;
                                    })()), screen === 'block-list' && (_jsx(BlockListScreen, { blockedUsers: blockedUsers, config: widgetConfig, onUnblock: handleUnblock, onBack: () => { setScreen('home'); setActiveTab('home'); } }))] })), widgetConfig.status === 'ACTIVE' &&
                                screen !== 'chat' &&
                                screen !== 'call' &&
                                screen !== 'user-list' &&
                                screen !== 'block-list' &&
                                screen !== 'ticket-detail' &&
                                screen !== 'ticket-new' && (_jsx(BottomTabs, { active: activeTab, onChange: handleTabChange, primaryColor: primaryColor }))] }))] }))] }));
};
export default ChatWidget;
/* ── Tiny corner button ────────────────────────────────────────────────────── */
const CornerBtn = ({ onClick, title, children }) => (_jsx("button", { onClick: onClick, title: title, style: {
        width: 26, height: 26, borderRadius: '50%',
        background: 'rgba(0,0,0,0.25)', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }, children: children }));

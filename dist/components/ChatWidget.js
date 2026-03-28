'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { MiniCallBar } from './MiniCallBar';
import { MaintenanceView } from './MaintenanceView';
import { BottomTabs } from './Tabs/BottomTabs';
import { ViewerBlockedScreen } from './ViewerBlockedScreen';
import { PermissionsGateScreen } from './PermissionsGateScreen';
import { hasStoredPermissionsGrant } from '../utils/widgetPermissions';
export const ChatWidget = ({ theme: localTheme, viewer }) => {
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
    /** True when user hid the drawer during ringing/connected call; WebRTC session stays active. */
    const [callMinimized, setCallMinimized] = useState(false);
    /* Navigation */
    const [activeTab, setActiveTab] = useState('home');
    const [screen, setScreen] = useState('home');
    const [userListCtx, setUserListCtx] = useState('support');
    const [chatReturnCtx, setChatReturnCtx] = useState('conversation');
    const [viewingTicketId, setViewingTicketId] = useState(null);
    const [messageSoundEnabled, setMessageSoundEnabledState] = useState(true);
    /** Stagger list animation only when opening from home burger menu */
    const [listEntranceAnimation, setListEntranceAnimation] = useState(false);
    /** Microphone, geolocation, and screen capture granted for this tab */
    const [permissionsOk, setPermissionsOk] = useState(false);
    /* App state */
    const [tickets, setTickets] = useState((_a = data === null || data === void 0 ? void 0 : data.sampleTickets) !== null && _a !== void 0 ? _a : []);
    const [recentChats, setRecentChats] = useState([]);
    const [blockedUids, setBlockedUids] = useState((_b = data === null || data === void 0 ? void 0 : data.blockedUsers) !== null && _b !== void 0 ? _b : []);
    /* Sync remote data into local state once loaded */
    useEffect(() => {
        var _a, _b, _c, _d;
        if (data) {
            setTickets(data.sampleTickets);
            setBlockedUids(data.blockedUsers);
            const pid = (_a = viewer === null || viewer === void 0 ? void 0 : viewer.projectId) === null || _a === void 0 ? void 0 : _a.trim();
            const devs = (_b = data.developers) !== null && _b !== void 0 ? _b : [];
            const usr = pid ? ((_c = data.users) !== null && _c !== void 0 ? _c : []).filter(u => u.project === pid) : ((_d = data.users) !== null && _d !== void 0 ? _d : []);
            const all = [...devs, ...usr];
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
    }, [data, viewer === null || viewer === void 0 ? void 0 : viewer.projectId]);
    /* Chat hook */
    const { messages, activeUser, isPaused, isReported, selectUser, sendMessage, togglePause, reportChat, clearChat, setMessages, } = useChat();
    /* WebRTC hook */
    const { session: callSession, localVideoRef, remoteVideoRef, startCall, endCall, toggleMute, toggleCamera } = useWebRTC();
    const callInProgress = callSession.state === 'calling' || callSession.state === 'connected';
    useEffect(() => {
        if (!callInProgress)
            setCallMinimized(false);
    }, [callInProgress]);
    /* ── Drawer open/close with slide animation ───────────────────────────── */
    const openDrawer = () => {
        setClosing(false);
        setIsOpen(true);
        setCallMinimized(false);
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
    useEffect(() => {
        var _a;
        const id = (_a = data === null || data === void 0 ? void 0 : data.widget) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return;
        setPermissionsOk(hasStoredPermissionsGrant(id));
    }, [(_c = data === null || data === void 0 ? void 0 : data.widget) === null || _c === void 0 ? void 0 : _c.id]);
    const restoredRef = useRef(false);
    useEffect(() => {
        var _a, _b, _c, _d, _e, _f;
        if (!(data === null || data === void 0 ? void 0 : data.widget) || restoredRef.current)
            return;
        const w = data.widget;
        setMessageSoundEnabledState(getMessageSoundEnabled(w.id));
        const uidForBlock = (_b = ((_a = viewer === null || viewer === void 0 ? void 0 : viewer.uid) !== null && _a !== void 0 ? _a : w.viewerUid)) === null || _b === void 0 ? void 0 : _b.trim();
        let viewerIsBlocked = w.viewerBlocked === true;
        if (!viewerIsBlocked && uidForBlock) {
            const rec = [...data.developers, ...data.users].find(x => x.uid === uidForBlock);
            viewerIsBlocked = (rec === null || rec === void 0 ? void 0 : rec.viewerBlocked) === true;
        }
        if (viewerIsBlocked) {
            clearChat();
            setScreen('home');
            setActiveTab('home');
            setViewingTicketId(null);
            restoredRef.current = true;
            return;
        }
        const p = loadSession(w.id);
        if (p) {
            setScreen(p.screen);
            setActiveTab(p.activeTab);
            setUserListCtx(p.userListCtx);
            setViewingTicketId((_c = p.viewingTicketId) !== null && _c !== void 0 ? _c : null);
            setChatReturnCtx((_d = p.chatReturnCtx) !== null && _d !== void 0 ? _d : 'conversation');
            if (p.activeUserUid) {
                const pid = (_e = viewer === null || viewer === void 0 ? void 0 : viewer.projectId) === null || _e === void 0 ? void 0 : _e.trim();
                const pool = pid
                    ? [...data.developers, ...data.users].filter(u => u.project === pid)
                    : [...data.developers, ...data.users];
                const u = pool.find(x => x.uid === p.activeUserUid);
                if (u) {
                    const hist = Array.isArray(p.messages) && p.messages.length
                        ? p.messages
                        : ((_f = data.sampleChats[u.uid]) !== null && _f !== void 0 ? _f : []);
                    selectUser(u, hist);
                }
            }
        }
        restoredRef.current = true;
    }, [data, selectUser, clearChat, viewer === null || viewer === void 0 ? void 0 : viewer.projectId, viewer === null || viewer === void 0 ? void 0 : viewer.uid]);
    useEffect(() => {
        var _a, _b;
        if (!(data === null || data === void 0 ? void 0 : data.widget))
            return;
        const w = data.widget;
        const uid = (_b = ((_a = viewer === null || viewer === void 0 ? void 0 : viewer.uid) !== null && _a !== void 0 ? _a : w.viewerUid)) === null || _b === void 0 ? void 0 : _b.trim();
        let blocked = w.viewerBlocked === true;
        if (!blocked && uid) {
            const rec = [...data.developers, ...data.users].find(x => x.uid === uid);
            blocked = (rec === null || rec === void 0 ? void 0 : rec.viewerBlocked) === true;
        }
        if (!blocked)
            return;
        clearChat();
        setScreen('home');
        setActiveTab('home');
        setViewingTicketId(null);
    }, [data === null || data === void 0 ? void 0 : data.widget, data === null || data === void 0 ? void 0 : data.developers, data === null || data === void 0 ? void 0 : data.users, viewer === null || viewer === void 0 ? void 0 : viewer.uid, clearChat]);
    useEffect(() => {
        if (!(data === null || data === void 0 ? void 0 : data.widget))
            return;
        persistWidgetState();
    }, [(_d = data === null || data === void 0 ? void 0 : data.widget) === null || _d === void 0 ? void 0 : _d.id, screen, activeTab, userListCtx, activeUser === null || activeUser === void 0 ? void 0 : activeUser.uid, messages, viewingTicketId, chatReturnCtx, persistWidgetState]);
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
        setCallMinimized(false);
        setScreen('chat');
    }, [endCall]);
    const minimizeCall = useCallback(() => {
        setCallMinimized(true);
        closeDrawer();
    }, [closeDrawer]);
    /* ── Derived ─────────────────────────────────────────────────────────── */
    const isBlocked = activeUser ? blockedUids.includes(activeUser.uid) : false;
    const widgetConfig = useMemo(() => {
        var _a;
        if (!(data === null || data === void 0 ? void 0 : data.widget))
            return undefined;
        const w = Object.assign({}, data.widget);
        if (viewer) {
            w.viewerUid = viewer.uid;
            w.viewerName = viewer.name;
            w.viewerType = viewer.type;
            if ((_a = viewer.projectId) === null || _a === void 0 ? void 0 : _a.trim())
                w.viewerProjectId = viewer.projectId.trim();
        }
        return w;
    }, [data === null || data === void 0 ? void 0 : data.widget, viewer]);
    const primaryColor = theme.primaryColor;
    /** All developers are listed; only end-`user` rows are filtered by `viewer.projectId`. */
    const allUsers = useMemo(() => {
        var _a, _b;
        if (!data)
            return [];
        const pid = (_a = viewer === null || viewer === void 0 ? void 0 : viewer.projectId) === null || _a === void 0 ? void 0 : _a.trim();
        const devs = (_b = data.developers) !== null && _b !== void 0 ? _b : [];
        if (!pid)
            return [...devs, ...data.users];
        const usersInProject = data.users.filter(u => u.project === pid);
        return [...devs, ...usersInProject];
    }, [data, viewer === null || viewer === void 0 ? void 0 : viewer.projectId]);
    const effectiveViewerBlocked = useMemo(() => {
        var _a, _b;
        if (!widgetConfig)
            return false;
        if (widgetConfig.viewerBlocked === true)
            return true;
        const uid = (_b = ((_a = viewer === null || viewer === void 0 ? void 0 : viewer.uid) !== null && _a !== void 0 ? _a : widgetConfig.viewerUid)) === null || _b === void 0 ? void 0 : _b.trim();
        if (!uid || !data)
            return false;
        const rec = [...data.developers, ...data.users].find(x => x.uid === uid);
        return (rec === null || rec === void 0 ? void 0 : rec.viewerBlocked) === true;
    }, [widgetConfig, viewer === null || viewer === void 0 ? void 0 : viewer.uid, data]);
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
    const otherDevelopers = useMemo(() => allUsers.filter(u => u.type === 'developer' && u.uid !== viewerUid), [allUsers, viewerUid]);
    const blockedUsers = allUsers.filter(u => blockedUids.includes(u.uid));
    const totalUnread = useMemo(() => recentChats.reduce((sum, c) => { var _a; return sum + Math.max(0, (_a = c.unread) !== null && _a !== void 0 ? _a : 0); }, 0), [recentChats]);
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
      ` }), !isOpen && callMinimized && callInProgress && callSession.peer && (_jsx(MiniCallBar, { session: callSession, primaryColor: primaryColor, buttonPosition: theme.buttonPosition, onExpand: openDrawer, onEnd: handleEndCall })), !isOpen && (_jsxs("button", { className: "cw-root", type: "button", onClick: openDrawer, "aria-label": totalUnread > 0 ? `${theme.buttonLabel}, ${totalUnread} unread` : theme.buttonLabel, title: totalUnread > 0 ? `${totalUnread} unread message${totalUnread === 1 ? '' : 's'}` : theme.buttonLabel, style: Object.assign(Object.assign({ position: 'fixed', bottom: 24, zIndex: 9999 }, posStyle), { display: 'flex', alignItems: 'center', gap: 10, padding: '13px 22px', backgroundColor: theme.buttonColor, color: theme.buttonTextColor, border: 'none', borderRadius: 50, cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: `0 8px 28px ${theme.buttonColor}55`, animation: 'cw-btnPop 0.4s cubic-bezier(0.34,1.56,0.64,1)', transition: 'transform 0.2s, box-shadow 0.2s' }), onMouseEnter: e => {
                    e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 14px 36px ${theme.buttonColor}66`;
                }, onMouseLeave: e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 8px 28px ${theme.buttonColor}55`;
                }, children: [_jsxs("span", { style: { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }, children: [_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", stroke: theme.buttonTextColor, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }), totalUnread > 0 && (_jsx("span", { style: {
                                    position: 'absolute',
                                    top: -8,
                                    right: -10,
                                    minWidth: 20,
                                    height: 20,
                                    padding: '0 5px',
                                    borderRadius: 999,
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontSize: 11,
                                    fontWeight: 800,
                                    lineHeight: '20px',
                                    textAlign: 'center',
                                    border: '2px solid #fff',
                                    boxSizing: 'border-box',
                                }, children: totalUnread > 99 ? '99+' : totalUnread }))] }), _jsx("span", { children: theme.buttonLabel })] })), isOpen && (_jsx("div", { "aria-hidden": true, style: {
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
                                } }), _jsx("style", { children: `@keyframes spin { to { transform: rotate(360deg); } }` }), _jsx("p", { style: { fontSize: 14, color: '#7b8fa1' }, children: "Loading chat\u2026" })] })), cfgError && !cfgLoading && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 32, textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 40 }, children: "\u26A0\uFE0F" }), _jsx("p", { style: { fontWeight: 700, color: '#1a2332' }, children: "Could not load chat configuration" }), _jsx("p", { style: { fontSize: 13, color: '#7b8fa1', lineHeight: 1.6 }, children: cfgError }), _jsx("button", { onClick: closeDrawer, style: { padding: '9px 20px', borderRadius: 10, border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', fontWeight: 700 }, children: "Close" })] })), !cfgLoading && !cfgError && widgetConfig && (_jsxs(_Fragment, { children: [screen !== 'chat' && screen !== 'call' && !effectiveViewerBlocked && (_jsx("div", { style: {
                                    position: 'absolute', top: 12,
                                    right: theme.buttonPosition === 'bottom-left' ? 'auto' : 12,
                                    left: theme.buttonPosition === 'bottom-left' ? 12 : 'auto',
                                    zIndex: 20, display: 'flex', gap: 6,
                                }, children: _jsx(CornerBtn, { onClick: closeDrawer, title: "Close", children: _jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M18 6L6 18M6 6l12 12", stroke: "#fff", strokeWidth: "2.5", strokeLinecap: "round" }) }) }) })), widgetConfig.status === 'MAINTENANCE' && (_jsx(MaintenanceView, { primaryColor: primaryColor })), widgetConfig.status === 'DISABLE' && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32, textAlign: 'center', gap: 12 }, children: [_jsx("div", { style: { fontSize: 40 }, children: "\uD83D\uDD12" }), _jsx("p", { style: { fontWeight: 700, color: '#1a2332' }, children: "Chat is disabled" }), _jsx("button", { onClick: closeDrawer, style: { padding: '9px 20px', borderRadius: 10, border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', fontWeight: 700 }, children: "Close" })] })), widgetConfig.status === 'ACTIVE' && effectiveViewerBlocked && (_jsx(ViewerBlockedScreen, { config: widgetConfig, apiKey: apiKey, onClose: closeDrawer })), widgetConfig.status === 'ACTIVE' && !effectiveViewerBlocked && !permissionsOk && (_jsx(PermissionsGateScreen, { primaryColor: primaryColor, widgetId: widgetConfig.id, onGranted: () => setPermissionsOk(true) })), widgetConfig.status === 'ACTIVE' && !effectiveViewerBlocked && permissionsOk && (_jsxs("div", { className: "cw-scroll", style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, children: [screen === 'home' && (_jsx(HomeScreen, { config: widgetConfig, apiKey: apiKey, onNavigate: handleCardClick, onOpenTicket: handleOpenTicket, tickets: tickets })), screen === 'user-list' && (_jsx(UserListScreen, { context: userListCtx, users: filteredUsers, primaryColor: primaryColor, viewerType: (_e = widgetConfig.viewerType) !== null && _e !== void 0 ? _e : 'user', onBack: () => { setListEntranceAnimation(false); setScreen('home'); }, onSelectUser: handleSelectUser, onBlockList: userListCtx === 'conversation' ? () => setScreen('block-list') : undefined, useHomeHeader: userListCtx === 'support' && widgetConfig.viewerType !== 'developer', animateEntrance: listEntranceAnimation })), screen === 'chat' && activeUser && (_jsx(ChatScreen, { activeUser: activeUser, messages: messages, config: widgetConfig, isPaused: isPaused, isReported: isReported, isBlocked: isBlocked, onSend: sendMessage, onBack: handleBackFromChat, onClose: closeDrawer, onTogglePause: handleTogglePause, onReport: reportChat, onBlock: handleBlock, onStartCall: handleStartCall, onNavAction: handleNavFromMenu, otherDevelopers: otherDevelopers, onTransferToDeveloper: handleTransferToDeveloper, messageSoundEnabled: messageSoundEnabled, onToggleMessageSound: toggleMessageSound })), screen === 'call' && callSession.peer && (_jsx(CallScreen, { session: callSession, localVideoRef: localVideoRef, remoteVideoRef: remoteVideoRef, onEnd: handleEndCall, onToggleMute: toggleMute, onToggleCamera: toggleCamera, primaryColor: primaryColor, onMinimize: minimizeCall })), screen === 'recent-chats' && (_jsx(RecentChatsScreen, { chats: recentChats, config: widgetConfig, onSelectChat: u => handleSelectUser(u, listCtxForUser(u, viewerIsDev)), animateEntrance: listEntranceAnimation })), screen === 'tickets' && (_jsx(TicketScreen, { tickets: tickets, config: widgetConfig, onNewTicket: () => { setListEntranceAnimation(false); setScreen('ticket-new'); }, onSelectTicket: id => {
                                            setListEntranceAnimation(false);
                                            setViewingTicketId(id);
                                            setScreen('ticket-detail');
                                        }, animateEntrance: listEntranceAnimation })), screen === 'ticket-new' && (_jsx(TicketFormScreen, { config: widgetConfig, onSubmit: handleRaiseTicket, onCancel: () => setScreen('tickets') })), screen === 'ticket-detail' && viewingTicketId && ((() => {
                                        const t = tickets.find(x => x.id === viewingTicketId);
                                        return t ? (_jsx(TicketDetailScreen, { ticket: t, config: widgetConfig, onBack: () => { setViewingTicketId(null); setScreen('tickets'); } })) : null;
                                    })()), screen === 'block-list' && (_jsx(BlockListScreen, { blockedUsers: blockedUsers, config: widgetConfig, onUnblock: handleUnblock, onBack: () => { setScreen('home'); setActiveTab('home'); } }))] })), widgetConfig.status === 'ACTIVE' &&
                                !effectiveViewerBlocked &&
                                permissionsOk &&
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

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChatWidgetProps, BottomTab, Screen, UserListContext, ChatUser, Ticket, RecentChat, ChatMessage } from '../types';
import { loadLocalConfig } from '../config';
import { mergeTheme } from '../utils/theme';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { useChat } from '../hooks/useChat';
import { useWebRTC } from '../hooks/useWebRTC';
import { saveSession, loadSession } from '../utils/widgetSession';
import { playMessageSound, getMessageSoundEnabled, setMessageSoundEnabled } from '../utils/messageSound';

import { HomeScreen }        from './HomeScreen';
import { UserListScreen }    from './UserListScreen';
import { ChatScreen }        from './ChatScreen';
import { RecentChatsScreen } from './RecentChatsScreen';
import { TicketScreen }      from './TicketScreen';
import { TicketDetailScreen } from './TicketDetailScreen';
import { TicketFormScreen } from './TicketFormScreen';
import { BlockListScreen }   from './BlockList';
import { CallScreen }        from './CallScreen';
import { MiniCallBar }       from './MiniCallBar';
import { MaintenanceView }   from './MaintenanceView';
import { BottomTabs }        from './Tabs/BottomTabs';
import { ViewerBlockedScreen } from './ViewerBlockedScreen';
import { PermissionsGateScreen } from './PermissionsGateScreen';
import { hasStoredPermissionsGrant } from '../utils/widgetPermissions';

export const ChatWidget: React.FC<ChatWidgetProps> = ({ theme: localTheme, viewer }) => {
  /* SSR guard */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  /* Env config */
  const { apiKey, widgetId } = loadLocalConfig();

  /* Remote config */
  const { data, loading: cfgLoading, error: cfgError } = useRemoteConfig(apiKey, widgetId);

  /* Merged theme — remote config overrides defaults, local prop overrides both */
  const theme = mergeTheme(
    data?.widget ? { primaryColor: data.widget.primaryColor, buttonLabel: data.widget.buttonLabel, buttonPosition: data.widget.buttonPosition } : undefined,
    localTheme
  );

  /* Drawer open state */
  const [isOpen,      setIsOpen]      = useState(false);
  const [closing,     setClosing]     = useState(false); // for slide-out animation
  /** True when user hid the drawer during ringing/connected call; WebRTC session stays active. */
  const [callMinimized, setCallMinimized] = useState(false);

  /* Navigation */
  const [activeTab,    setActiveTab]    = useState<BottomTab>('home');
  const [screen,       setScreen]       = useState<Screen>('home');
  const [userListCtx,  setUserListCtx]  = useState<UserListContext>('support');
  const [chatReturnCtx, setChatReturnCtx] = useState<UserListContext>('conversation');
  const [viewingTicketId, setViewingTicketId] = useState<string | null>(null);
  const [messageSoundEnabled, setMessageSoundEnabledState] = useState(true);
  /** Stagger list animation only when opening from home burger menu */
  const [listEntranceAnimation, setListEntranceAnimation] = useState(false);
  /** Microphone, geolocation, and screen capture granted for this tab */
  const [permissionsOk, setPermissionsOk] = useState(false);

  /* App state */
  const [tickets,      setTickets]      = useState<Ticket[]>(data?.sampleTickets ?? []);
  const [recentChats,  setRecentChats]  = useState<RecentChat[]>([]);
  const [blockedUids,  setBlockedUids]  = useState<string[]>(data?.blockedUsers ?? []);

  /* Sync remote data into local state once loaded */
  useEffect(() => {
    if (data) {
      setTickets(data.sampleTickets);
      setBlockedUids(data.blockedUsers);
      const pid = viewer?.projectId?.trim();
      const devs = data.developers ?? [];
      const usr = pid ? (data.users ?? []).filter(u => u.project === pid) : (data.users ?? []);
      const all = [...devs, ...usr];
      const recents: RecentChat[] = Object.entries(data.sampleChats).map(([uid, msgs]) => {
        const user = all.find(u => u.uid === uid);
        if (!user || msgs.length === 0) return null;
        const last = msgs[msgs.length - 1];
        return {
          id:          `rc_${uid}`,
          user,
          lastMessage: last.text,
          lastTime:    last.timestamp,
          unread:      Math.floor(Math.random() * 3),
          isPaused:    false,
        };
      }).filter(Boolean) as RecentChat[];
      setRecentChats(recents);
    }
  }, [data, viewer?.projectId]);

  /* Chat hook */
  const {
    messages, activeUser, isPaused, isReported,
    selectUser, sendMessage, togglePause, reportChat, clearChat, setMessages,
  } = useChat();

  /* WebRTC hook */
  const { session: callSession, localVideoRef, remoteVideoRef, startCall, endCall, toggleMute, toggleCamera } = useWebRTC();

  const callInProgress =
    callSession.state === 'calling' || callSession.state === 'connected';

  useEffect(() => {
    if (!callInProgress) setCallMinimized(false);
  }, [callInProgress]);

  /* ── Drawer open/close with slide animation ───────────────────────────── */
  const openDrawer = () => {
    setClosing(false);
    setIsOpen(true);
    setCallMinimized(false);
  };

  const persistWidgetState = useCallback(() => {
    const w = data?.widget;
    if (!w) return;
    saveSession(w.id, {
      screen,
      activeTab,
      userListCtx,
      activeUserUid: activeUser?.uid ?? null,
      messages,
      viewingTicketId,
      chatReturnCtx,
    });
  }, [data?.widget, screen, activeTab, userListCtx, activeUser?.uid, messages, viewingTicketId, chatReturnCtx]);

  const closeDrawer = useCallback(() => {
    persistWidgetState();
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 300);
  }, [persistWidgetState]);

  useEffect(() => {
    const id = data?.widget?.id;
    if (!id) return;
    setPermissionsOk(hasStoredPermissionsGrant(id));
  }, [data?.widget?.id]);

  const restoredRef = useRef(false);
  useEffect(() => {
    if (!data?.widget || restoredRef.current) return;
    const w = data.widget;
    setMessageSoundEnabledState(getMessageSoundEnabled(w.id));
    const uidForBlock = (viewer?.uid ?? w.viewerUid)?.trim();
    let viewerIsBlocked = w.viewerBlocked === true;
    if (!viewerIsBlocked && uidForBlock) {
      const rec = [...data.developers, ...data.users].find(x => x.uid === uidForBlock);
      viewerIsBlocked = rec?.viewerBlocked === true;
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
      setViewingTicketId(p.viewingTicketId ?? null);
      setChatReturnCtx(p.chatReturnCtx ?? 'conversation');
      if (p.activeUserUid) {
        const pid = viewer?.projectId?.trim();
        const pool = pid
          ? [...data.developers, ...data.users].filter(u => u.project === pid)
          : [...data.developers, ...data.users];
        const u = pool.find(x => x.uid === p.activeUserUid);
        if (u) {
          const hist = Array.isArray(p.messages) && p.messages.length
            ? p.messages
            : (data.sampleChats[u.uid] ?? []);
          selectUser(u, hist);
        }
      }
    }
    restoredRef.current = true;
  }, [data, selectUser, clearChat, viewer?.projectId, viewer?.uid]);

  useEffect(() => {
    if (!data?.widget) return;
    const w = data.widget;
    const uid = (viewer?.uid ?? w.viewerUid)?.trim();
    let blocked = w.viewerBlocked === true;
    if (!blocked && uid) {
      const rec = [...data.developers, ...data.users].find(x => x.uid === uid);
      blocked = rec?.viewerBlocked === true;
    }
    if (!blocked) return;
    clearChat();
    setScreen('home');
    setActiveTab('home');
    setViewingTicketId(null);
  }, [data?.widget, data?.developers, data?.users, viewer?.uid, clearChat]);

  useEffect(() => {
    if (!data?.widget) return;
    persistWidgetState();
  }, [data?.widget?.id, screen, activeTab, userListCtx, activeUser?.uid, messages, viewingTicketId, chatReturnCtx, persistWidgetState]);

  const incomingSoundRef = useRef(0);
  useEffect(() => {
    incomingSoundRef.current = messages.length;
  }, [activeUser?.uid]);

  useEffect(() => {
    if (!messageSoundEnabled || !activeUser || !data?.widget) return;
    if (messages.length < incomingSoundRef.current) {
      incomingSoundRef.current = messages.length;
      return;
    }
    const added = messages.slice(incomingSoundRef.current);
    incomingSoundRef.current = messages.length;
    if (added.some(m => m.senderId !== 'me')) playMessageSound();
  }, [messages, messageSoundEnabled, activeUser, data?.widget]);

  const toggleMessageSound = useCallback((enabled: boolean) => {
    const w = data?.widget;
    if (!w) return;
    setMessageSoundEnabled(w.id, enabled);
    setMessageSoundEnabledState(enabled);
  }, [data?.widget]);

  /* ── Navigation ──────────────────────────────────────────────────────── */
  const handleCardClick = useCallback((ctx: UserListContext | 'ticket', options?: { fromMenu?: boolean }) => {
    setListEntranceAnimation(!!options?.fromMenu);
    if (ctx === 'ticket') {
      setActiveTab('tickets');
      setScreen('tickets');
    } else {
      setUserListCtx(ctx as UserListContext);
      setScreen('user-list');
    }
  }, []);

  const handleNavFromMenu = useCallback((ctx: UserListContext | 'ticket') => {
    setListEntranceAnimation(false);
    clearChat();
    if (ctx === 'ticket') {
      setActiveTab('tickets');
      setScreen('tickets');
    } else {
      setUserListCtx(ctx);
      setScreen('user-list');
    }
  }, [clearChat]);

  const listCtxForUser = useCallback((user: ChatUser, viewerIsDev: boolean): UserListContext => {
    if (viewerIsDev) return user.type === 'user' ? 'support' : 'conversation';
    return user.type === 'developer' ? 'support' : 'conversation';
  }, []);

  const handleSelectUser = useCallback((user: ChatUser, returnCtxOverride?: UserListContext) => {
    setListEntranceAnimation(false);
    setChatReturnCtx(returnCtxOverride ?? userListCtx);
    const history = data?.sampleChats[user.uid] ?? [];
    selectUser(user, history);
    setScreen('chat');
    setRecentChats(prev => {
      const exists = prev.find(r => r.user.uid === user.uid);
      if (exists) return prev;
      return [{ id: `rc_${user.uid}`, user, lastMessage: '', lastTime: new Date().toISOString(), unread: 0, isPaused: false }, ...prev];
    });
  }, [data, selectUser, userListCtx]);

  const handleBackFromChat = useCallback(() => {
    setListEntranceAnimation(false);
    clearChat();
    setUserListCtx(chatReturnCtx);
    setScreen('user-list');
  }, [clearChat, chatReturnCtx]);

  const handleOpenTicket = useCallback((id: string) => {
    setListEntranceAnimation(false);
    setViewingTicketId(id);
    setScreen('ticket-detail');
    setActiveTab('tickets');
  }, []);

  const handleTabChange = useCallback((tab: BottomTab) => {
    setListEntranceAnimation(false);
    setActiveTab(tab);
    setScreen(tab === 'home' ? 'home' : tab === 'chats' ? 'recent-chats' : 'tickets');
  }, []);

  useEffect(() => {
    if (!listEntranceAnimation) return;
    const t = window.setTimeout(() => setListEntranceAnimation(false), 520);
    return () => window.clearTimeout(t);
  }, [listEntranceAnimation]);

  /* ── Block/Unblock ───────────────────────────────────────────────────── */
  const handleBlock = useCallback(() => {
    if (!activeUser) return;
    setBlockedUids(prev => [...prev, activeUser.uid]);
    clearChat();
    setScreen('block-list');
    setActiveTab('home');
  }, [activeUser, clearChat]);

  const handleUnblock = useCallback((uid: string) => {
    setBlockedUids(prev => prev.filter(id => id !== uid));
  }, []);

  /* ── Tickets ─────────────────────────────────────────────────────────── */
  const handleRaiseTicket = useCallback((title: string, desc: string, priority: Ticket['priority']) => {
    const t: Ticket = {
      id:          `TKT-${String(Date.now()).slice(-4)}`,
      title, description: desc, status: 'open', priority,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      assignedTo:  null,
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
      setRecentChats(prev => prev.map(r => r.user.uid === activeUser.uid ? { ...r, isPaused: !isPaused } : r));
    }
  }, [togglePause, activeUser, isPaused]);

  /* ── Call ────────────────────────────────────────────────────────────── */
  const handleStartCall = useCallback((withVideo: boolean) => {
    if (!activeUser) return;
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
  const isBlocked      = activeUser ? blockedUids.includes(activeUser.uid) : false;

  const widgetConfig = useMemo(() => {
    if (!data?.widget) return undefined;
    const w = { ...data.widget };
    if (viewer) {
      w.viewerUid = viewer.uid;
      w.viewerName = viewer.name;
      w.viewerType = viewer.type;
      if (viewer.projectId?.trim()) w.viewerProjectId = viewer.projectId.trim();
    }
    return w;
  }, [data?.widget, viewer]);

  const primaryColor   = theme.primaryColor;

  /** All developers are listed; only end-`user` rows are filtered by `viewer.projectId`. */
  const allUsers = useMemo(() => {
    if (!data) return [];
    const pid = viewer?.projectId?.trim();
    const devs = data.developers ?? [];
    if (!pid) return [...devs, ...data.users];
    const usersInProject = data.users.filter(u => u.project === pid);
    return [...devs, ...usersInProject];
  }, [data, viewer?.projectId]);

  const effectiveViewerBlocked = useMemo(() => {
    if (!widgetConfig) return false;
    if (widgetConfig.viewerBlocked === true) return true;
    const uid = (viewer?.uid ?? widgetConfig.viewerUid)?.trim();
    if (!uid || !data) return false;
    const rec = [...data.developers, ...data.users].find(x => x.uid === uid);
    return rec?.viewerBlocked === true;
  }, [widgetConfig, viewer?.uid, data]);

  const viewerIsDev  = widgetConfig?.viewerType === 'developer';
  const viewerUid    = widgetConfig?.viewerUid;

  const filteredUsers = screen === 'user-list'
    ? allUsers.filter(u => {
        if (userListCtx === 'support') {
          if (viewerIsDev) return u.type === 'user';
          return u.type === 'developer';
        }
        if (viewerIsDev) {
          return u.type === 'developer' && u.uid !== viewerUid;
        }
        return u.type === 'user';
      })
    : [];

  const otherDevelopers = useMemo(
    () => allUsers.filter(u => u.type === 'developer' && u.uid !== viewerUid),
    [allUsers, viewerUid],
  );
  const blockedUsers  = allUsers.filter(u => blockedUids.includes(u.uid));

  const totalUnread = useMemo(
    () => recentChats.reduce((sum, c) => sum + Math.max(0, c.unread ?? 0), 0),
    [recentChats],
  );

  const handleTransferToDeveloper = useCallback((dev: ChatUser) => {
    if (!activeUser || !widgetConfig) return;
    const agent = widgetConfig.viewerName?.trim() || 'Agent';
    const transferNote: ChatMessage = {
      id:         `tr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      senderId:   'me',
      receiverId: dev.uid,
      text:       `— ${agent} transferred this conversation from ${activeUser.name} to ${dev.name} —`,
      timestamp:  new Date().toISOString(),
      type:       'text',
      status:     'sent',
    };
    selectUser(dev, [...messages, transferNote]);
  }, [activeUser, messages, selectUser, widgetConfig]);

  /* Position */
  const posStyle: React.CSSProperties = theme.buttonPosition === 'bottom-left'
    ? { left: 24, right: 'auto' }
    : { right: 24, left: 'auto' };

  /* No radius on top-left / bottom-left; left-docked panel keeps inner TR/BR curve */
  const drawerPosStyle: React.CSSProperties =
    theme.buttonPosition === 'bottom-left'
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
  if (!mounted) return null;

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
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
      `}</style>

      {/* ── Minimized call bar (drawer closed, call still active) ── */}
      {!isOpen && callMinimized && callInProgress && callSession.peer && (
        <MiniCallBar
          session={callSession}
          primaryColor={primaryColor}
          buttonPosition={theme.buttonPosition}
          onExpand={openDrawer}
          onEnd={handleEndCall}
        />
      )}

      {/* ── Floating Button (unread badge + tooltip when closed) ── */}
      {!isOpen && (
        <button
          className="cw-root"
          type="button"
          onClick={openDrawer}
          aria-label={totalUnread > 0 ? `${theme.buttonLabel}, ${totalUnread} unread` : theme.buttonLabel}
          title={totalUnread > 0 ? `${totalUnread} unread message${totalUnread === 1 ? '' : 's'}` : theme.buttonLabel}
          style={{
            position: 'fixed', bottom: 24, zIndex: 9999,
            ...posStyle,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 22px',
            backgroundColor: theme.buttonColor,
            color: theme.buttonTextColor,
            border: 'none', borderRadius: 50,
            cursor: 'pointer', fontSize: 15, fontWeight: 700,
            boxShadow: `0 8px 28px ${theme.buttonColor}55`,
            animation: 'cw-btnPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform  = 'scale(1.06) translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 36px ${theme.buttonColor}66`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform  = 'scale(1)';
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${theme.buttonColor}55`;
          }}
        >
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke={theme.buttonTextColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {totalUnread > 0 && (
              <span
                style={{
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
                }}
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </span>
          <span>{theme.buttonLabel}</span>
        </button>
      )}

      {/* ── Backdrop (visual only — does not close widget on click) ── */}
      {isOpen && (
        <div
          aria-hidden
          style={{
            position: 'fixed', inset: 0, zIndex: 9997,
            backgroundColor: 'rgba(0,0,0,0.35)',
            opacity: closing ? 0 : 1,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* ── Drawer / Slider ── */}
      {isOpen && (
        <div
          className={`cw-root cw-drawer-panel ${closing ? 'cw-drawer-exit' : 'cw-drawer-enter'}`}
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            ...drawerPosStyle,
            zIndex: 9998,
            backgroundColor: '#fff',
            boxShadow: theme.buttonPosition === 'bottom-left'
              ? '4px 0 40px rgba(0,0,0,0.18)'
              : '-4px 0 40px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── Loading state ── */}
          {cfgLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `3px solid ${primaryColor}30`,
                borderTopColor: primaryColor,
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: 14, color: '#7b8fa1' }}>Loading chat…</p>
            </div>
          )}

          {/* ── Error state ── */}
          {cfgError && !cfgLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>⚠️</div>
              <p style={{ fontWeight: 700, color: '#1a2332' }}>Could not load chat configuration</p>
              <p style={{ fontSize: 13, color: '#7b8fa1', lineHeight: 1.6 }}>{cfgError}</p>
              <button onClick={closeDrawer} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: primaryColor, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Close</button>
            </div>
          )}

          {/* ── Main content ── */}
          {!cfgLoading && !cfgError && widgetConfig && (
            <>
              {/* Resize + Close controls — hidden on blocked screen (Close is in-panel) */}
              {screen !== 'chat' && screen !== 'call' && !effectiveViewerBlocked && (
                <div style={{
                  position: 'absolute', top: 12,
                  right: theme.buttonPosition === 'bottom-left' ? 'auto' : 12,
                  left:  theme.buttonPosition === 'bottom-left' ? 12    : 'auto',
                  zIndex: 20, display: 'flex', gap: 6,
                }}>
                  <CornerBtn onClick={closeDrawer} title="Close">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </CornerBtn>
                </div>
              )}

              {/* ── MAINTENANCE ── */}
              {widgetConfig.status === 'MAINTENANCE' && (
                <MaintenanceView primaryColor={primaryColor} />
              )}

              {/* ── DISABLED ── */}
              {widgetConfig.status === 'DISABLE' && (
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',padding:32,textAlign:'center',gap:12 }}>
                  <div style={{ fontSize:40 }}>🔒</div>
                  <p style={{ fontWeight:700,color:'#1a2332' }}>Chat is disabled</p>
                  <button onClick={closeDrawer} style={{ padding:'9px 20px',borderRadius:10,border:'none',background:primaryColor,color:'#fff',cursor:'pointer',fontWeight:700 }}>Close</button>
                </div>
              )}

              {/* ── ACTIVE: viewer spam-blocked (no chat/tickets UI) ── */}
              {widgetConfig.status === 'ACTIVE' && effectiveViewerBlocked && (
                <ViewerBlockedScreen config={widgetConfig} apiKey={apiKey} onClose={closeDrawer} />
              )}

              {/* ── ACTIVE: microphone, location, screen share required ── */}
              {widgetConfig.status === 'ACTIVE' && !effectiveViewerBlocked && !permissionsOk && (
                <PermissionsGateScreen
                  primaryColor={primaryColor}
                  widgetId={widgetConfig.id}
                  onGranted={() => setPermissionsOk(true)}
                />
              )}

              {/* ── ACTIVE ── */}
              {widgetConfig.status === 'ACTIVE' && !effectiveViewerBlocked && permissionsOk && (
                <div className="cw-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                  {screen === 'home' && (
                    <HomeScreen
                      config={widgetConfig}
                      apiKey={apiKey}
                      onNavigate={handleCardClick}
                      onOpenTicket={handleOpenTicket}
                      tickets={tickets}
                    />
                  )}

                  {screen === 'user-list' && (
                    <UserListScreen
                      context={userListCtx}
                      users={filteredUsers}
                      primaryColor={primaryColor}
                      viewerType={widgetConfig.viewerType ?? 'user'}
                      onBack={() => { setListEntranceAnimation(false); setScreen('home'); }}
                      onSelectUser={handleSelectUser}
                      onBlockList={userListCtx === 'conversation' ? () => setScreen('block-list') : undefined}
                      useHomeHeader={userListCtx === 'support' && widgetConfig.viewerType !== 'developer'}
                      animateEntrance={listEntranceAnimation}
                    />
                  )}

                  {screen === 'chat' && activeUser && (
                    <ChatScreen
                      activeUser={activeUser}
                      messages={messages}
                      config={widgetConfig}
                      isPaused={isPaused}
                      isReported={isReported}
                      isBlocked={isBlocked}
                      onSend={sendMessage}
                      onBack={handleBackFromChat}
                      onClose={closeDrawer}
                      onTogglePause={handleTogglePause}
                      onReport={reportChat}
                      onBlock={handleBlock}
                      onStartCall={handleStartCall}
                      onNavAction={handleNavFromMenu}
                      otherDevelopers={otherDevelopers}
                      onTransferToDeveloper={handleTransferToDeveloper}
                      messageSoundEnabled={messageSoundEnabled}
                      onToggleMessageSound={toggleMessageSound}
                    />
                  )}

                  {screen === 'call' && callSession.peer && (
                    <CallScreen
                      session={callSession}
                      localVideoRef={localVideoRef}
                      remoteVideoRef={remoteVideoRef}
                      onEnd={handleEndCall}
                      onToggleMute={toggleMute}
                      onToggleCamera={toggleCamera}
                      primaryColor={primaryColor}
                      onMinimize={minimizeCall}
                    />
                  )}

                  {screen === 'recent-chats' && (
                    <RecentChatsScreen
                      chats={recentChats}
                      config={widgetConfig}
                      onSelectChat={u => handleSelectUser(u, listCtxForUser(u, viewerIsDev))}
                      animateEntrance={listEntranceAnimation}
                    />
                  )}

                  {screen === 'tickets' && (
                    <TicketScreen
                      tickets={tickets}
                      config={widgetConfig}
                      onNewTicket={() => { setListEntranceAnimation(false); setScreen('ticket-new'); }}
                      onSelectTicket={id => {
                        setListEntranceAnimation(false);
                        setViewingTicketId(id);
                        setScreen('ticket-detail');
                      }}
                      animateEntrance={listEntranceAnimation}
                    />
                  )}

                  {screen === 'ticket-new' && (
                    <TicketFormScreen
                      config={widgetConfig}
                      onSubmit={handleRaiseTicket}
                      onCancel={() => setScreen('tickets')}
                    />
                  )}

                  {screen === 'ticket-detail' && viewingTicketId && (
                    (() => {
                      const t = tickets.find(x => x.id === viewingTicketId);
                      return t ? (
                        <TicketDetailScreen
                          ticket={t}
                          config={widgetConfig}
                          onBack={() => { setViewingTicketId(null); setScreen('tickets'); }}
                        />
                      ) : null;
                    })()
                  )}

                  {screen === 'block-list' && (
                    <BlockListScreen
                      blockedUsers={blockedUsers}
                      config={widgetConfig}
                      onUnblock={handleUnblock}
                      onBack={() => { setScreen('home'); setActiveTab('home'); }}
                    />
                  )}
                </div>
              )}

              {/* ── Bottom Tabs (hidden during chat/call/user-list/block-list) ── */}
              {widgetConfig.status === 'ACTIVE' &&
               !effectiveViewerBlocked &&
               permissionsOk &&
               screen !== 'chat' &&
               screen !== 'call' &&
               screen !== 'user-list' &&
               screen !== 'block-list' &&
               screen !== 'ticket-detail' &&
               screen !== 'ticket-new' && (
                <BottomTabs
                  active={activeTab}
                  onChange={handleTabChange}
                  primaryColor={primaryColor}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

/* ── Tiny corner button ────────────────────────────────────────────────────── */
const CornerBtn: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
  <button onClick={onClick} title={title} style={{
    width: 26, height: 26, borderRadius: '50%',
    background: 'rgba(0,0,0,0.25)', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  }}>
    {children}
  </button>
);

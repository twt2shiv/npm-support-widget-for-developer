export interface WidgetConfig {
    id: string;
    apiKey: string;
    status: ChatStatus;
    chatType: ChatType;
    primaryColor: string;
    buttonLabel: string;
    buttonPosition: 'bottom-right' | 'bottom-left';
    welcomeTitle: string;
    welcomeSubtitle: string;
    /** Shown in footer (e.g. branch / location name) */
    branch?: string;
    /** Optional label above branch (e.g. "Answers by") */
    footerPoweredBy?: string;
    /** Shown on home “Call Us” (tel: link) */
    supportPhone?: string;
    /**
     * Who is using the widget. `developer` = support staff: “Need Support” becomes “Provide Support”
     * and lists customers; “New Conversation” lists other developers (excl. viewerUid).
     */
    viewerType?: 'user' | 'developer';
    /** Current user id when viewerType is developer — excluded from developer pick lists */
    viewerUid?: string;
    /** Display name for transfer notes (optional) */
    viewerName?: string;
    /**
     * Host app project scope (set when embedding passes `viewer.projectId`).
     * Use for API calls; lists can be filtered to users in the same project.
     */
    viewerProjectId?: string;
    /** Privacy Policy URL (linked from chat consent banner) */
    privacyPolicyUrl?: string;
    /** Set false to hide the consent note above the composer */
    showPrivacyNotice?: boolean;
    /** Product brand (e.g. Ajaxter) */
    brandName?: string;
    /** Home promotion: “Take a Website Tour” link */
    websiteTourUrl?: string;
    /** Optional override for the lead line in the promotion card */
    promotionLead?: string;
    allowVoiceMessage: boolean;
    allowAttachment: boolean;
    allowEmoji: boolean;
    allowWebCall: boolean;
    maxEmojiCount: number;
    allowTranscriptDownload: boolean;
    allowReport: boolean;
    allowBlock: boolean;
    /**
     * When `true` (set by the server if this viewer is spam-blocked or not in allowed user/ticket/chat lists),
     * the widget hides all normal navigation and shows only the blocked-user screen with a re-enable request form.
     */
    viewerBlocked?: boolean;
    /** Optional override for the blocked message (default is a fixed spam notice). */
    blockedViewerMessage?: string;
    /**
     * Absolute URL for `POST` JSON re-enable requests. If omitted, the submit button explains that no endpoint is configured.
     * @example https://api.example.com/widgets/reenable-request
     */
    reenableRequestUrl?: string;
    /**
     * Current presence from your API/DB (include in chatData or a session payload).
     * When set, it initializes the status control and overrides session-only cache.
     */
    presenceStatus?: PresenceStatus;
    /**
     * Production: `POST` JSON `{ widgetId, apiKey, viewerUid?, status }` to save presence in your database.
     * The client still mirrors to sessionStorage as a local fallback.
     */
    presenceUpdateUrl?: string;
}
export interface RemoteChatData {
    widget: WidgetConfig;
    developers: ChatUser[];
    users: ChatUser[];
    sampleChats: Record<string, ChatMessage[]>;
    sampleTickets: Ticket[];
    blockedUsers: string[];
}
export type ChatStatus = 'ACTIVE' | 'DISABLE' | 'MAINTENANCE';
export type ChatType = 'SUPPORT' | 'CHAT' | 'BOTH';
export type UserType = 'developer' | 'user';
export type OnlineStatus = 'online' | 'away' | 'offline';
export type BottomTab = 'home' | 'chats' | 'tickets';
export type Screen = 'home' | 'user-list' | 'chat' | 'recent-chats' | 'tickets' | 'ticket-new' | 'ticket-detail' | 'block-list' | 'call';
export type UserListContext = 'support' | 'conversation';
export type MessageType = 'text' | 'voice' | 'attachment' | 'emoji';
/** Home status selector; persist via `presenceUpdateUrl` in production */
export type PresenceStatus = 'ACTIVE' | 'AWAY' | 'DND';
export interface ChatUser {
    uid: string;
    name: string;
    email: string;
    mobile: string;
    project: string;
    type: UserType;
    avatar: string | null;
    status: OnlineStatus;
    designation: string;
    /**
     * When `true` for the row matching the current viewer (`viewerUid` / `viewer.uid`),
     * the widget shows the spam/blocked screen (same as `widget.viewerBlocked`).
     */
    viewerBlocked?: boolean;
}
export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    type: MessageType;
    status: 'sent' | 'delivered' | 'read';
    attachmentName?: string;
    attachmentSize?: string;
    /** Blob URL for attachment download (local send) */
    attachmentUrl?: string;
    /** e.g. image/png — used for inline image preview in bubbles */
    attachmentMime?: string;
    voiceDuration?: number;
    /** Blob URL for in-bubble audio playback (local recording) */
    voiceUrl?: string;
}
export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
    assignedTo: string | null;
}
export interface RecentChat {
    id: string;
    user: ChatUser;
    lastMessage: string;
    lastTime: string;
    unread: number;
    isPaused: boolean;
}
export type CallState = 'idle' | 'calling' | 'connected' | 'ended';
export interface CallSession {
    state: CallState;
    peer: ChatUser | null;
    startedAt: Date | null;
    isMuted: boolean;
    isCameraOn: boolean;
}
export interface LocalEnvConfig {
    apiKey: string;
    widgetId: string;
}
export interface ChatWidgetTheme {
    primaryColor?: string;
    fontFamily?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonLabel?: string;
    buttonPosition?: 'bottom-right' | 'bottom-left';
    borderRadius?: string;
}
/**
 * Pass the logged-in user from your React app so the widget matches identity and UI (user vs developer).
 * Overrides `viewerUid`, `viewerName`, `viewerType` from remote `chatData.json` when provided.
 */
export interface ChatWidgetViewer {
    uid: string;
    name: string;
    type: UserType;
    /** When set, directory lists only include users whose `ChatUser.project` equals this string (exact match). */
    projectId?: string;
}
export interface ChatWidgetProps {
    theme?: ChatWidgetTheme;
    viewer?: ChatWidgetViewer;
}

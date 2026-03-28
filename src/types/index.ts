// ─── Remote Config (from chatData.json) ────────────────────────────────────
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
}

export interface RemoteChatData {
  widget: WidgetConfig;
  developers: ChatUser[];
  users: ChatUser[];
  sampleChats: Record<string, ChatMessage[]>;
  sampleTickets: Ticket[];
  blockedUsers: string[];
}

// ─── Enums ──────────────────────────────────────────────────────────────────
export type ChatStatus   = 'ACTIVE' | 'DISABLE' | 'MAINTENANCE';
export type ChatType     = 'SUPPORT' | 'CHAT' | 'BOTH';
export type UserType     = 'developer' | 'user';
export type OnlineStatus = 'online' | 'away' | 'offline';
export type BottomTab    = 'home' | 'chats' | 'tickets';
export type Screen       =
  | 'home'
  | 'user-list'
  | 'chat'
  | 'recent-chats'
  | 'tickets'
  | 'ticket-new'
  | 'ticket-detail'
  | 'block-list'
  | 'call';
export type UserListContext = 'support' | 'conversation';
export type MessageType = 'text' | 'voice' | 'attachment' | 'emoji';

// ─── User ───────────────────────────────────────────────────────────────────
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
}

// ─── Message ────────────────────────────────────────────────────────────────
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
  voiceDuration?: number;  // seconds
  /** Blob URL for in-bubble audio playback (local recording) */
  voiceUrl?: string;
}

// ─── Ticket ─────────────────────────────────────────────────────────────────
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

// ─── Recent Chat ─────────────────────────────────────────────────────────────
export interface RecentChat {
  id: string;
  user: ChatUser;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isPaused: boolean;
}

// ─── Call ───────────────────────────────────────────────────────────────────
export type CallState = 'idle' | 'calling' | 'connected' | 'ended';

export interface CallSession {
  state: CallState;
  peer: ChatUser | null;
  startedAt: Date | null;
  isMuted: boolean;
  isCameraOn: boolean;
}

// ─── Local env config ────────────────────────────────────────────────────────
export interface LocalEnvConfig {
  apiKey: string;
  widgetId: string;
}

// ─── Theme prop (still overridable) ─────────────────────────────────────────
export interface ChatWidgetTheme {
  primaryColor?: string;
  fontFamily?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonLabel?: string;
  buttonPosition?: 'bottom-right' | 'bottom-left';
  borderRadius?: string;
}

export interface ChatWidgetProps {
  theme?: ChatWidgetTheme;
}

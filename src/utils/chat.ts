import { ChatMessage, ChatUser } from '../types';

/** Generate a consistent avatar color from a name */
export function avatarColor(name: string): string {
  const palette = [
    '#2563EB','#7C3AED','#059669','#D97706',
    '#DC2626','#0891B2','#4F46E5','#BE185D',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

/** Get initials from full name */
export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/** Format timestamp to readable time string */
export function formatTime(ts: string | Date): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format date for chat separators */
export function formatDate(ts: string | Date): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Generate a plain-text transcript from messages */
export function generateTranscript(
  messages: ChatMessage[],
  peer: ChatUser,
  myName = 'Me'
): string {
  const header = [
    '═══════════════════════════════════════',
    '  CHAT TRANSCRIPT',
    `  Conversation with: ${peer.name} (${peer.email})`,
    `  Downloaded: ${new Date().toLocaleString()}`,
    '═══════════════════════════════════════',
    '',
  ].join('\n');

  const body = messages.map(m => {
    const sender = m.senderId === 'me' ? myName : peer.name;
    const time   = new Date(m.timestamp).toLocaleString();
    const label  = m.type === 'voice'      ? '[Voice Message]'
                 : m.type === 'attachment' ? `[Attachment: ${m.attachmentName ?? 'file'}]`
                 : m.text;
    return `[${time}] ${sender}: ${label}`;
  }).join('\n');

  return header + body;
}

/** Truncate to max words, append ellipsis (…) if shortened */
export function truncateWords(text: string, maxWords: number): string {
  const w = text.trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return '';
  if (w.length <= maxWords) return w.join(' ');
  return `${w.slice(0, maxWords).join(' ')}…`;
}

/** Trigger a file download in the browser */
export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

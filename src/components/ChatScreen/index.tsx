import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ChatUser, WidgetConfig, UserListContext, ChatType } from '../../types';
import { avatarColor, initials, formatTime, formatDate, generateTranscript, downloadText } from '../../utils/chat';
import { shortAttachmentLabel } from '../../utils/fileName';
import { shouldShowPrivacyNotice, dismissPrivacyNotice } from '../../utils/privacyConsent';
import { EmojiPicker } from '../EmojiPicker';

interface ChatScreenProps {
  activeUser:   ChatUser;
  messages:     ChatMessage[];
  config:       WidgetConfig;
  isPaused:     boolean;
  isReported:   boolean;
  isBlocked:    boolean;
  onSend:       (text: string, type?: ChatMessage['type'], extra?: Partial<ChatMessage>) => void;
  onBack:       () => void;
  onClose:      () => void;
  onTogglePause:() => void;
  onReport:     () => void;
  onBlock:      () => void;
  onStartCall:  (withVideo: boolean) => void;
  /** Navigate to support list, colleague list, or tickets (from slide menu) */
  onNavAction:  (ctx: UserListContext | 'ticket') => void;
  /** Other devs (excl. viewer) — for transfer when staff chats with a customer */
  otherDevelopers?: ChatUser[];
  onTransferToDeveloper?: (dev: ChatUser) => void;
  messageSoundEnabled?: boolean;
  onToggleMessageSound?: (enabled: boolean) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  activeUser, messages, config, isPaused, isReported, isBlocked,
  onSend, onBack, onClose, onTogglePause, onReport, onBlock, onStartCall, onNavAction,
  otherDevelopers = [], onTransferToDeveloper,
  messageSoundEnabled = true,
  onToggleMessageSound,
}) => {
  const [text,          setText]         = useState('');
  const [showEmoji,     setShowEmoji]    = useState(false);
  const [showMenu,      setShowMenu]     = useState(false);
  const [transferOpen,  setTransferOpen]  = useState(false);
  const [isRecording,   setIsRecording]  = useState(false);
  const [recordSec,     setRecordSec]    = useState(0);
  const [showConfirm,   setShowConfirm]  = useState<'report'|'block'|'pause'|null>(null);
  const [showPrivacy,   setShowPrivacy]  = useState(false);
  const [pendingAttach, setPendingAttach] = useState<{ file: File; url: string } | null>(null);
  const [waveBars,      setWaveBars]      = useState<number[]>(() => Array(24).fill(0.08));

  const endRef        = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLTextAreaElement>(null);
  const fileRef       = useRef<HTMLInputElement>(null);
  const recordTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordChunks  = useRef<BlobPart[]>([]);
  const discardRecordingRef = useRef(false);
  const waveStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const waveRafRef    = useRef<number>(0);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const privacyEnabled = config.showPrivacyNotice !== false;
  useEffect(() => {
    if (!privacyEnabled) return;
    setShowPrivacy(shouldShowPrivacyNotice(config.id));
  }, [config.id, privacyEnabled]);

  useEffect(() => {
    if (!privacyEnabled) return;
    const id = window.setInterval(() => {
      setShowPrivacy(shouldShowPrivacyNotice(config.id));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [config.id, privacyEnabled]);

  const dismissPrivacy = useCallback(() => {
    dismissPrivacyNotice(config.id);
    setShowPrivacy(false);
  }, [config.id]);

  const clearPendingAttach = useCallback((revoke: boolean) => {
    setPendingAttach(prev => {
      if (prev && revoke) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  const handleSend = useCallback(() => {
    if (isPaused || isBlocked) return;
    if (pendingAttach) {
      const { file, url } = pendingAttach;
      const body = text.trim();
      onSend(body || ' ', 'attachment', {
        attachmentName: file.name,
        attachmentSize: `${(file.size / 1024).toFixed(1)} KB`,
        attachmentUrl: url,
        attachmentMime: file.type,
      });
      setPendingAttach(null);
      setText('');
      inputRef.current?.focus();
      return;
    }
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  }, [text, isPaused, isBlocked, onSend, pendingAttach]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const recordSecRef = useRef(0);

  const stopWaveLoop = useCallback(() => {
    if (waveRafRef.current) {
      cancelAnimationFrame(waveRafRef.current);
      waveRafRef.current = 0;
    }
    analyserRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    waveStreamRef.current = null;
    setWaveBars(Array(24).fill(0.08));
  }, []);

  const startRecording = async () => {
    if (isPaused || isBlocked) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    waveStreamRef.current = stream;
    discardRecordingRef.current = false;
    setRecordSec(0);
    recordSecRef.current = 0;

    try {
      const audioCtx = new AudioContext();
      await audioCtx.resume();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        const a = analyserRef.current;
        if (!a) return;
        a.getByteFrequencyData(data);
        const bars: number[] = [];
        const step = Math.max(1, Math.floor(data.length / 24));
        for (let i = 0; i < 24; i++) {
          const v = data[Math.min(i * step, data.length - 1)] / 255;
          bars.push(Math.max(0.08, v));
        }
        setWaveBars(bars);
        waveRafRef.current = requestAnimationFrame(tick);
      };
      waveRafRef.current = requestAnimationFrame(tick);
    } catch {
      /* optional waveform */
    }

    recordChunks.current = [];
    const mr = new MediaRecorder(stream);
    mediaRecorder.current = mr;
    mr.ondataavailable = e => { if (e.data.size) recordChunks.current.push(e.data); };
    mr.onstop = () => {
      stopWaveLoop();
      stream.getTracks().forEach(t => t.stop());
      const chunks = recordChunks.current;
      if (discardRecordingRef.current) {
        discardRecordingRef.current = false;
        setRecordSec(0);
        recordSecRef.current = 0;
        return;
      }
      if (!chunks.length) {
        setRecordSec(0);
        recordSecRef.current = 0;
        return;
      }
      const blob = new Blob(chunks, { type: chunks[0] instanceof Blob ? (chunks[0] as Blob).type : 'audio/webm' });
      const voiceUrl = URL.createObjectURL(blob);
      const dur = Math.max(1, recordSecRef.current);
      onSend('Voice message', 'voice', { voiceDuration: dur, voiceUrl });
      setRecordSec(0);
      recordSecRef.current = 0;
    };
    mr.start(200);
    setIsRecording(true);
    recordTimer.current = setInterval(() => {
      setRecordSec(s => {
        const n = s + 1;
        recordSecRef.current = n;
        return n;
      });
    }, 1000);
  };

  const cancelRecording = () => {
    if (!isRecording) return;
    discardRecordingRef.current = true;
    if (recordTimer.current) {
      clearInterval(recordTimer.current);
      recordTimer.current = null;
    }
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const stopRecordingSend = () => {
    if (!isRecording) return;
    discardRecordingRef.current = false;
    if (recordTimer.current) {
      clearInterval(recordTimer.current);
      recordTimer.current = null;
    }
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (isPaused || isBlocked || !config.allowAttachment) return;
    const items = e.clipboardData?.items;
    if (!items?.length) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) {
          e.preventDefault();
          const url = URL.createObjectURL(f);
          setPendingAttach(prev => {
            if (prev) URL.revokeObjectURL(prev.url);
            return { file: f, url };
          });
          return;
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isPaused || isBlocked) return;
    const url = URL.createObjectURL(file);
    setPendingAttach(prev => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { file, url };
    });
    e.target.value = '';
  };

  const handleTranscript = () => {
    const content = generateTranscript(messages, activeUser);
    downloadText(content, `chat-${activeUser.name.replace(/\s+/g,'_')}-${Date.now()}.txt`);
    setShowMenu(false);
  };

  const handleConfirm = (action: 'report'|'block'|'pause') => {
    setShowConfirm(null); setShowMenu(false);
    if (action === 'report') onReport();
    if (action === 'block')  onBlock();
    if (action === 'pause')  onTogglePause();
  };

  const peerAvatar = avatarColor(activeUser.name);
  const peerInit   = initials(activeUser.name);
  const grouped = groupByDate(messages);

  const viewerIsDev = config.viewerType === 'developer';
  const headerRole =
    viewerIsDev
      ? (activeUser.type === 'user' ? 'Customer' : 'Developer')
      : 'Support';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', animation:'cw-slideIn 0.22s ease', position:'relative', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{
        background:`linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
        padding:'10px 12px', display:'flex', alignItems:'center', gap:8, flexShrink:0,
      }}>
        <button type="button" onClick={onBack} style={hdrBtn} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={{ width:36, height:36, borderRadius:'50%', backgroundColor:peerAvatar, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0, position:'relative' }}>
          {peerInit}
          <span style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', border:'2px solid', borderColor:'transparent', backgroundColor: activeUser.status==='online'?'#22c55e':activeUser.status==='away'?'#f59e0b':'#9ca3af' }} />
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeUser.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.8)' }}>{activeUser.designation}</div>
        </div>

        <span style={{ fontSize:13, fontWeight:700, color:'#fff', opacity:0.95, flexShrink:0 }}>{headerRole}</span>

        {onToggleMessageSound && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: 4,
            }}
          >
            <button
              type="button"
              role="switch"
              aria-checked={messageSoundEnabled}
              onClick={() => onToggleMessageSound(!messageSoundEnabled)}
              aria-label="Toggle message sound"
              title="Toggle message sound"
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                border: 'none',
                background: messageSoundEnabled ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
                position: 'relative',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: messageSoundEnabled ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.15s ease',
                }}
              />
            </button>
          </label>
        )}

        {config.allowWebCall && (
          <button type="button" onClick={() => onStartCall(false)} style={hdrBtn} title="Voice Call">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" fill="#fff"/>
            </svg>
          </button>
        )}

        <button type="button" onClick={() => setShowMenu(v => !v)} style={{ ...hdrBtn, background:'rgba(255,255,255,0.2)' }} title="More options" aria-expanded={showMenu}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5"  r="1.5" fill="#fff"/>
            <circle cx="12" cy="12" r="1.5" fill="#fff"/>
            <circle cx="12" cy="19" r="1.5" fill="#fff"/>
          </svg>
        </button>
      </div>

      {showMenu && (
        <div style={{ position:'absolute', top:52, right:12, zIndex:120, background:'#fff', borderRadius:12, boxShadow:'0 8px 30px rgba(0,0,0,0.16)', padding:'6px', minWidth:200, animation:'cw-fadeUp 0.18s ease' }}>
          {navEntriesForChat(config.chatType, viewerIsDev).map(item => (
            <MenuItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              onClick={() => { setShowMenu(false); onNavAction(item.key); }}
            />
          ))}
          <div style={{ borderTop:'1px solid #f0f2f5', margin:'4px 0' }} />
          {config.allowTranscriptDownload && (
            <MenuItem icon="📥" label="Download Transcript" onClick={handleTranscript} />
          )}
          {viewerIsDev && activeUser.type === 'user' && otherDevelopers.length > 0 && onTransferToDeveloper && (
            <MenuItem
              icon="🔀"
              label="Transfer to developer"
              onClick={() => { setShowMenu(false); setTransferOpen(true); }}
            />
          )}
          <MenuItem icon={isPaused ? '▶️' : '⏸'} label={isPaused ? 'Resume Chat' : 'Pause Chat'} onClick={() => { setShowMenu(false); setShowConfirm('pause'); }} />
          {config.allowReport && !isReported && (
            <MenuItem icon="⚠️" label="Report Chat"         onClick={() => { setShowMenu(false); setShowConfirm('report'); }} />
          )}
          {config.allowBlock && activeUser.type === 'user' && !isBlocked && (
            <MenuItem icon="🚫" label="Block User"          onClick={() => { setShowMenu(false); setShowConfirm('block'); }} danger />
          )}
          <div style={{ borderTop:'1px solid #f0f2f5', margin:'4px 0' }} />
          <MenuItem icon="✕" label="Close Chat"             onClick={onClose} />
        </div>
      )}

      {isPaused && (
        <div style={{ background:'#fef3c7', padding:'8px 16px', fontSize:12, fontWeight:600, color:'#92400e', textAlign:'center', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          ⏸ Chat is paused — users cannot send messages
          <button type="button" onClick={onTogglePause} style={{ background:'#92400e', color:'#fff', border:'none', borderRadius:6, padding:'2px 8px', fontSize:11, cursor:'pointer', marginLeft:4 }}>Resume</button>
        </div>
      )}
      {isBlocked && (
        <div style={{ background:'#fee2e2', padding:'8px 16px', fontSize:12, fontWeight:600, color:'#991b1b', textAlign:'center', flexShrink:0 }}>
          🚫 This user is blocked
        </div>
      )}
      {isReported && (
        <div style={{ background:'#fef3c7', padding:'6px 16px', fontSize:11, color:'#92400e', textAlign:'center', flexShrink:0 }}>
          ⚠️ This chat has been reported
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10, background:'#f8f9fc' }}
        className="cw-scroll"
      >
        {grouped.map(({ date, msgs }) => (
          <React.Fragment key={date}>
            <DateDivider label={date} />
            {msgs.map(msg => (
              <Bubble key={msg.id} msg={msg} primaryColor={config.primaryColor} />
            ))}
          </React.Fragment>
        ))}
        {messages.length === 0 && (
          <div style={{ margin:'auto', textAlign:'center', color:'#c4cad4', fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
            Say hello to {activeUser.name}!
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer — reference layout */}
      <div style={{ borderTop:'1px solid #eef0f5', padding:'10px 12px 8px', background:'#fff', flexShrink:0, position:'relative' }}>

        {privacyEnabled && showPrivacy && (
          <div
            style={{
              position: 'relative',
              marginBottom: 10,
              padding: '12px 36px 12px 12px',
              borderRadius: 12,
              background: '#fff',
              border: '1px solid #e8ecf1',
              boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
            }}
          >
            <button
              type="button"
              aria-label="Dismiss privacy notice"
              onClick={dismissPrivacy}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: 'none',
                background: '#f1f5f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: 14, color: '#475569', fontWeight: 700 }}>×</span>
            </button>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>
              By chatting here, you agree we and authorized partners may process, monitor, and record this chat and your data in line with{' '}
              {config.privacyPolicyUrl ? (
                <a
                  href={config.privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: config.primaryColor, textDecoration: 'underline', fontWeight: 600 }}
                >
                  Privacy Policy
                </a>
              ) : (
                <span style={{ textDecoration: 'underline', fontWeight: 600 }}>Privacy Policy</span>
              )}
              .
            </p>
          </div>
        )}

        {showEmoji && config.allowEmoji && (
          <EmojiPicker
            primaryColor={config.primaryColor}
            onSelect={e => setText(t => t + e)}
            onClose={() => setShowEmoji(false)}
          />
        )}

        {isRecording && (
          <div
            style={{
              marginBottom: 10,
              padding: '12px 12px 14px',
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8ecf1',
              boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
              <button
                type="button"
                onClick={cancelRecording}
                title="Discard recording"
                aria-label="Discard recording"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  lineHeight: 0,
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10 11v6M14 11v6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
                {waveBars.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: 3,
                      borderRadius: 2,
                      background: '#cbd5e1',
                      height: `${8 + h * 36}px`,
                      transition: 'height 0.05s ease-out',
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '6px 14px',
                  borderRadius: 999,
                  minWidth: 52,
                  textAlign: 'center',
                }}
              >
                {fmtTime(recordSec)}
              </div>
              <button
                type="button"
                onClick={stopRecordingSend}
                title="Send voice message"
                aria-label="Send voice message"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: 'none',
                  background: config.primaryColor,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 4px 14px ${config.primaryColor}55`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <div style={{
          border: `1.5px solid ${isPaused || isBlocked ? '#e5e7eb' : '#bfdbfe'}`,
          borderRadius: 16,
          padding: '10px 12px 8px',
          background: isPaused || isBlocked ? '#f9fafb' : '#fff',
        }}>
          {pendingAttach && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
                padding: '8px 10px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #fecaca',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: config.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pendingAttach.file.name}>
                  {pendingAttach.file.name}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  {(pendingAttach.file.type.split('/')[1] || 'file').slice(0, 8)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => clearPendingAttach(true)}
                title="Remove attachment"
                aria-label="Remove attachment"
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          )}
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            onPaste={handlePaste}
            placeholder={isPaused || isBlocked ? 'Chat is unavailable' : 'Compose your message…'}
            disabled={isPaused || isBlocked || isRecording}
            rows={2}
            style={{
              width: '100%',
              resize: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              lineHeight: 1.45,
              color: '#1a2332',
              background: 'transparent',
              maxHeight: 88,
              overflowY: 'auto',
              fontFamily: 'inherit',
              marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {config.allowEmoji && (
                <ActionBtn onClick={() => setShowEmoji(v => !v)} title="Emoji">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1.8"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="9" cy="9" r="1" fill="#94a3b8"/><circle cx="15" cy="9" r="1" fill="#94a3b8"/>
                  </svg>
                </ActionBtn>
              )}
              {config.allowAttachment && (
                <>
                  <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleFileChange} />
                  <ActionBtn onClick={() => fileRef.current?.click()} title="Attach file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </ActionBtn>
                </>
              )}
              {config.allowVoiceMessage && !isRecording && (
                <ActionBtn onClick={startRecording} title="Voice message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </ActionBtn>
              )}
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={(!text.trim() && !pendingAttach) || isPaused || isBlocked || isRecording}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: (text.trim() || pendingAttach) && !isPaused && !isBlocked ? config.primaryColor : '#e2e8f0',
                border: 'none',
                cursor: (text.trim() || pendingAttach) && !isPaused && !isBlocked ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              title="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke={(text.trim() || pendingAttach) && !isPaused && !isBlocked ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {(config.footerPoweredBy || config.branch) && (
          <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
            {config.footerPoweredBy}
            {config.footerPoweredBy && config.branch ? ' · ' : ''}
            {config.branch && <span style={{ fontWeight: 600, color: '#64748b' }}>{config.branch}</span>}
          </p>
        )}
      </div>

      {transferOpen && otherDevelopers.length > 0 && onTransferToDeveloper && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 280,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '18px 16px',
              width: '100%',
              maxWidth: 320,
              maxHeight: '70%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1a2332', marginBottom: 6 }}>
              Transfer chat to
            </div>
            <p style={{ fontSize: 12, color: '#7b8fa1', margin: '0 0 12px', lineHeight: 1.5 }}>
              Assign this conversation to another developer. History is kept and a handoff note is added.
            </p>
            <div className="cw-scroll" style={{ flex: 1, overflowY: 'auto', margin: '0 -4px' }}>
              {otherDevelopers.map(dev => (
                <button
                  key={dev.uid}
                  type="button"
                  onClick={() => {
                    onTransferToDeveloper(dev);
                    setTransferOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 12px',
                    marginBottom: 6,
                    border: '1px solid #eef0f5',
                    borderRadius: 12,
                    background: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {dev.name}
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748b', marginTop: 2 }}>
                    {dev.designation}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTransferOpen(false)}
              style={{
                marginTop: 12,
                padding: '10px',
                borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                background: '#fff',
                fontWeight: 600,
                fontSize: 13,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div style={{
          position:'absolute', inset:0, background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:300,
          borderRadius:'inherit',
        }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'24px 20px', width:280, boxShadow:'0 16px 48px rgba(0,0,0,0.22)', animation:'cw-fadeUp 0.2s ease' }}>
            <div style={{ fontWeight:800, fontSize:16, color:'#1a2332', marginBottom:8 }}>
              {showConfirm === 'pause'  && (isPaused ? 'Resume Chat?' : 'Pause Chat?')}
              {showConfirm === 'report' && 'Report this chat?'}
              {showConfirm === 'block'  && 'Block this user?'}
            </div>
            <p style={{ fontSize:13, color:'#7b8fa1', lineHeight:1.6, margin:'0 0 18px' }}>
              {showConfirm === 'pause'  && (isPaused ? 'The user will be able to send messages again.' : 'The user will not be able to send new messages.')}
              {showConfirm === 'report' && 'This chat will be flagged for review by the admin team.'}
              {showConfirm === 'block'  && 'This user will be blocked and added to your block list. You can unblock them later.'}
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" onClick={() => setShowConfirm(null)} style={{ flex:1, padding:'9px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, color:'#374151' }}>
                Cancel
              </button>
              <button type="button" onClick={() => handleConfirm(showConfirm)} style={{
                flex:1, padding:'9px', borderRadius:10, border:'none',
                background: showConfirm==='block' ? '#ef4444' : config.primaryColor,
                color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700,
              }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VoiceRow: React.FC<{ msg: ChatMessage; isMe: boolean; primaryColor: string }> = ({ msg, isMe, primaryColor }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dur, setDur] = useState(msg.voiceDuration ?? 0);

  const url = msg.voiceUrl;
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !url) return;
    const onMeta = () => setDur(a.duration || msg.voiceDuration || 0);
    const onTime = () => setCurrent(a.currentTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('timeupdate', onTime);
    return () => {
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('timeupdate', onTime);
    };
  }, [url, msg.voiceDuration]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { void a.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const pct = dur > 0 ? Math.min(100, (current / dur) * 100) : 0;
  const timeLabel = fmtTime(Math.floor(current)) + ' / ' + fmtTime(Math.floor(dur || msg.voiceDuration || 0));

  if (!url) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:13 }}>🎤</span>
        <span style={{ fontSize:13 }}>Voice message{msg.voiceDuration ? ` · ${msg.voiceDuration}s` : ''}</span>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, minWidth: 200 }}>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setCurrent(0); }}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'none',
          background: isMe ? 'rgba(255,255,255,0.95)' : '#fff',
          color: isMe ? primaryColor : primaryColor,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ height: 4, borderRadius: 2, background: isMe ? 'rgba(255,255,255,0.35)' : '#e2e8f0', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: isMe ? '#fff' : primaryColor, borderRadius: 2, transition: 'width 0.1s linear' }} />
        </div>
        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9 }}>{timeLabel}</div>
      </div>
    </div>
  );
};

const AttachmentRow: React.FC<{ msg: ChatMessage; isMe: boolean; primaryColor: string }> = ({ msg, isMe, primaryColor }) => {
  const name = msg.attachmentName ?? 'File';
  const href = msg.attachmentUrl;
  const label = shortAttachmentLabel(name, 10);
  const mime = msg.attachmentMime ?? '';
  const isImage = mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }}>
      {isImage && href && (
        <a href={href} download={name} title={name} style={{ alignSelf: 'flex-start', lineHeight: 0 }}>
          <img
            src={href}
            alt=""
            style={{ maxWidth: 220, maxHeight: 200, borderRadius: 10, objectFit: 'cover', display: 'block' }}
          />
        </a>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!isImage && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48" stroke={isMe ? '#fff' : '#334155'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {href ? (
            <a
              href={href}
              download={name}
              title={name}
              style={{
                fontWeight: 700,
                fontSize: 14,
                wordBreak: 'break-word',
                color: isMe ? '#fff' : primaryColor,
                textDecoration: 'underline',
              }}
            >
              [{label}]
            </a>
          ) : (
            <div style={{ fontWeight: 700, fontSize: 14, wordBreak: 'break-word' }} title={name}>
              [{label}]
            </div>
          )}
          {msg.attachmentSize && <div style={{ fontSize: 11, opacity: 0.8 }}>{msg.attachmentSize}</div>}
        </div>
      </div>
    </div>
  );
};

const Bubble: React.FC<{ msg: ChatMessage; primaryColor: string }> = ({ msg, primaryColor }) => {
  const isMe = msg.senderId === 'me';

  const caption = msg.text.trim();
  const content = msg.type === 'voice' ? (
    <VoiceRow msg={msg} isMe={isMe} primaryColor={primaryColor} />
  ) : msg.type === 'attachment' ? (
    <>
      <AttachmentRow msg={msg} isMe={isMe} primaryColor={primaryColor} />
      {caption && caption !== ' ' && (
        <div style={{ marginTop: 6, fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</div>
      )}
    </>
  ) : (
    <span>{msg.text}</span>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems: isMe?'flex-end':'flex-start', gap:3 }}>
      <div style={{
        maxWidth:'85%', padding:'10px 13px',
        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        backgroundColor: isMe ? primaryColor : '#fff',
        color: isMe ? '#fff' : '#1a2332',
        fontSize:14, lineHeight:1.5,
        boxShadow:'0 1px 4px rgba(0,0,0,0.07)',
        wordBreak:'break-word',
      }}>
        {content}
      </div>
      <span style={{ fontSize:11, color:'#b0bec5', padding:'0 4px' }}>{formatTime(msg.timestamp)}</span>
    </div>
  );
};

const DateDivider: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
    <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
    <span style={{ fontSize:11, fontWeight:600, color:'#64748b', whiteSpace:'nowrap' }}>{label}</span>
    <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
  </div>
);

const MenuItem: React.FC<{ icon: string; label: string; onClick: () => void; danger?: boolean }> = ({ icon, label, onClick, danger }) => (
  <button type="button" onClick={onClick} style={{
    display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px',
    background:'none', border:'none', borderRadius:8, cursor:'pointer', textAlign:'left',
    fontSize:13, fontWeight:600, color: danger ? '#ef4444' : '#374151',
    transition:'background 0.12s',
  }}
  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = danger ? '#fee2e2' : '#f3f4f6'}
  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
  >
    <span>{icon}</span> {label}
  </button>
);

const ActionBtn: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
  <button type="button" onClick={onClick} title={title} style={{
    background:'none', border:'none', cursor:'pointer', padding:'8px',
    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
    transition:'background 0.13s',
  }}
  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f1f5f9'}
  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
  >{children}</button>
);

const hdrBtn: React.CSSProperties = {
  background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%',
  width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
  cursor:'pointer', flexShrink:0,
};

function navEntriesForChat(chatType: ChatType, isStaff: boolean): { key: UserListContext | 'ticket'; label: string; icon: string }[] {
  const showSupport = chatType === 'SUPPORT' || chatType === 'BOTH';
  const showChat = chatType === 'CHAT' || chatType === 'BOTH';
  const items: { key: UserListContext | 'ticket'; label: string; icon: string }[] = [];
  if (showSupport) items.push({ key: 'support', icon: '🛠', label: isStaff ? 'Provide Support' : 'Need Support' });
  if (showChat) items.push({ key: 'conversation', icon: '💬', label: isStaff ? 'Chat with developer' : 'New Conversation' });
  items.push({ key: 'ticket', icon: '🎫', label: 'Raise ticket' });
  return items;
}

function groupByDate(messages: ChatMessage[]): { date: string; msgs: ChatMessage[] }[] {
  const map = new Map<string, ChatMessage[]>();
  messages.forEach(m => {
    const d = formatDate(m.timestamp);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(m);
  });
  return Array.from(map.entries()).map(([date, msgs]) => ({ date, msgs }));
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

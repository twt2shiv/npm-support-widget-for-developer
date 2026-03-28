import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { avatarColor, initials, formatTime, formatDate, generateTranscript, downloadText } from '../../utils/chat';
import { shortAttachmentLabel } from '../../utils/fileName';
import { shouldShowPrivacyNotice, dismissPrivacyNotice } from '../../utils/privacyConsent';
import { EmojiPicker } from '../EmojiPicker';
export const ChatScreen = ({ activeUser, messages, config, isPaused, isReported, isBlocked, onSend, onBack, onClose, onTogglePause, onReport, onBlock, onStartCall, onNavAction, otherDevelopers = [], onTransferToDeveloper, messageSoundEnabled = true, onToggleMessageSound, }) => {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordSec, setRecordSec] = useState(0);
    const [showConfirm, setShowConfirm] = useState(null);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [pendingAttach, setPendingAttach] = useState(null);
    const [waveBars, setWaveBars] = useState(() => Array(24).fill(0.08));
    const endRef = useRef(null);
    const inputRef = useRef(null);
    const fileRef = useRef(null);
    const recordTimer = useRef(null);
    const mediaRecorder = useRef(null);
    const recordChunks = useRef([]);
    const discardRecordingRef = useRef(false);
    const waveStreamRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const waveRafRef = useRef(0);
    useEffect(() => { var _a; (_a = endRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    const privacyEnabled = config.showPrivacyNotice !== false;
    useEffect(() => {
        if (!privacyEnabled)
            return;
        setShowPrivacy(shouldShowPrivacyNotice(config.id));
    }, [config.id, privacyEnabled]);
    useEffect(() => {
        if (!privacyEnabled)
            return;
        const id = window.setInterval(() => {
            setShowPrivacy(shouldShowPrivacyNotice(config.id));
        }, 60000);
        return () => window.clearInterval(id);
    }, [config.id, privacyEnabled]);
    const dismissPrivacy = useCallback(() => {
        dismissPrivacyNotice(config.id);
        setShowPrivacy(false);
    }, [config.id]);
    const clearPendingAttach = useCallback((revoke) => {
        setPendingAttach(prev => {
            if (prev && revoke)
                URL.revokeObjectURL(prev.url);
            return null;
        });
    }, []);
    const handleSend = useCallback(() => {
        var _a, _b;
        if (isPaused || isBlocked)
            return;
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
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            return;
        }
        if (!text.trim())
            return;
        onSend(text.trim());
        setText('');
        (_b = inputRef.current) === null || _b === void 0 ? void 0 : _b.focus();
    }, [text, isPaused, isBlocked, onSend, pendingAttach]);
    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const recordSecRef = useRef(0);
    const stopWaveLoop = useCallback(() => {
        var _a;
        if (waveRafRef.current) {
            cancelAnimationFrame(waveRafRef.current);
            waveRafRef.current = 0;
        }
        analyserRef.current = null;
        void ((_a = audioCtxRef.current) === null || _a === void 0 ? void 0 : _a.close());
        audioCtxRef.current = null;
        waveStreamRef.current = null;
        setWaveBars(Array(24).fill(0.08));
    }, []);
    const startRecording = async () => {
        if (isPaused || isBlocked)
            return;
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
                if (!a)
                    return;
                a.getByteFrequencyData(data);
                const bars = [];
                const step = Math.max(1, Math.floor(data.length / 24));
                for (let i = 0; i < 24; i++) {
                    const v = data[Math.min(i * step, data.length - 1)] / 255;
                    bars.push(Math.max(0.08, v));
                }
                setWaveBars(bars);
                waveRafRef.current = requestAnimationFrame(tick);
            };
            waveRafRef.current = requestAnimationFrame(tick);
        }
        catch (_a) {
            /* optional waveform */
        }
        recordChunks.current = [];
        const mr = new MediaRecorder(stream);
        mediaRecorder.current = mr;
        mr.ondataavailable = e => { if (e.data.size)
            recordChunks.current.push(e.data); };
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
            const blob = new Blob(chunks, { type: chunks[0] instanceof Blob ? chunks[0].type : 'audio/webm' });
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
        var _a;
        if (!isRecording)
            return;
        discardRecordingRef.current = true;
        if (recordTimer.current) {
            clearInterval(recordTimer.current);
            recordTimer.current = null;
        }
        (_a = mediaRecorder.current) === null || _a === void 0 ? void 0 : _a.stop();
        setIsRecording(false);
    };
    const stopRecordingSend = () => {
        var _a;
        if (!isRecording)
            return;
        discardRecordingRef.current = false;
        if (recordTimer.current) {
            clearInterval(recordTimer.current);
            recordTimer.current = null;
        }
        (_a = mediaRecorder.current) === null || _a === void 0 ? void 0 : _a.stop();
        setIsRecording(false);
    };
    const handlePaste = (e) => {
        var _a;
        if (isPaused || isBlocked || !config.allowAttachment)
            return;
        const items = (_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.items;
        if (!(items === null || items === void 0 ? void 0 : items.length))
            return;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const f = item.getAsFile();
                if (f) {
                    e.preventDefault();
                    const url = URL.createObjectURL(f);
                    setPendingAttach(prev => {
                        if (prev)
                            URL.revokeObjectURL(prev.url);
                        return { file: f, url };
                    });
                    return;
                }
            }
        }
    };
    const handleFileChange = (e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file || isPaused || isBlocked)
            return;
        const url = URL.createObjectURL(file);
        setPendingAttach(prev => {
            if (prev)
                URL.revokeObjectURL(prev.url);
            return { file, url };
        });
        e.target.value = '';
    };
    const handleTranscript = () => {
        const content = generateTranscript(messages, activeUser);
        downloadText(content, `chat-${activeUser.name.replace(/\s+/g, '_')}-${Date.now()}.txt`);
        setShowMenu(false);
    };
    const handleConfirm = (action) => {
        setShowConfirm(null);
        setShowMenu(false);
        if (action === 'report')
            onReport();
        if (action === 'block')
            onBlock();
        if (action === 'pause')
            onTogglePause();
    };
    const peerAvatar = avatarColor(activeUser.name);
    const peerInit = initials(activeUser.name);
    const grouped = groupByDate(messages);
    const viewerIsDev = config.viewerType === 'developer';
    const headerRole = viewerIsDev
        ? (activeUser.type === 'user' ? 'Customer' : 'Developer')
        : 'Support';
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', animation: 'cw-slideIn 0.22s ease', position: 'relative', overflow: 'hidden' }, children: [_jsxs("div", { style: {
                    background: `linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
                    padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                }, children: [_jsx("button", { type: "button", onClick: onBack, style: hdrBtn, "aria-label": "Back", children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M19 12H5M5 12L12 19M5 12L12 5", stroke: "#fff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), _jsxs("div", { style: { width: 36, height: 36, borderRadius: '50%', backgroundColor: peerAvatar, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0, position: 'relative' }, children: [peerInit, _jsx("span", { style: { position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', border: '2px solid', borderColor: 'transparent', backgroundColor: activeUser.status === 'online' ? '#22c55e' : activeUser.status === 'away' ? '#f59e0b' : '#9ca3af' } })] }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: activeUser.name }), _jsx("div", { style: { fontSize: 11, color: 'rgba(255,255,255,0.8)' }, children: activeUser.designation })] }), _jsx("span", { style: { fontSize: 13, fontWeight: 700, color: '#fff', opacity: 0.95, flexShrink: 0 }, children: headerRole }), onToggleMessageSound && (_jsxs("label", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginLeft: 4,
                        }, children: [_jsx("span", { style: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }, children: "Sound" }), _jsx("button", { type: "button", role: "switch", "aria-checked": messageSoundEnabled, onClick: () => onToggleMessageSound(!messageSoundEnabled), style: {
                                    width: 36,
                                    height: 20,
                                    borderRadius: 10,
                                    border: 'none',
                                    background: messageSoundEnabled ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    padding: 0,
                                }, children: _jsx("span", { style: {
                                        position: 'absolute',
                                        top: 2,
                                        left: messageSoundEnabled ? 18 : 2,
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        transition: 'left 0.15s ease',
                                    } }) })] })), config.allowWebCall && (_jsx("button", { type: "button", onClick: () => onStartCall(false), style: hdrBtn, title: "Voice Call", children: _jsx("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z", fill: "#fff" }) }) })), _jsx("button", { type: "button", onClick: () => setShowMenu(v => !v), style: Object.assign(Object.assign({}, hdrBtn), { background: 'rgba(255,255,255,0.2)' }), title: "More options", "aria-expanded": showMenu, children: _jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { cx: "12", cy: "5", r: "1.5", fill: "#fff" }), _jsx("circle", { cx: "12", cy: "12", r: "1.5", fill: "#fff" }), _jsx("circle", { cx: "12", cy: "19", r: "1.5", fill: "#fff" })] }) })] }), showMenu && (_jsxs("div", { style: { position: 'absolute', top: 52, right: 12, zIndex: 120, background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.16)', padding: '6px', minWidth: 200, animation: 'cw-fadeUp 0.18s ease' }, children: [navEntriesForChat(config.chatType, viewerIsDev).map(item => (_jsx(MenuItem, { icon: item.icon, label: item.label, onClick: () => { setShowMenu(false); onNavAction(item.key); } }, item.key))), _jsx("div", { style: { borderTop: '1px solid #f0f2f5', margin: '4px 0' } }), config.allowTranscriptDownload && (_jsx(MenuItem, { icon: "\uD83D\uDCE5", label: "Download Transcript", onClick: handleTranscript })), viewerIsDev && activeUser.type === 'user' && otherDevelopers.length > 0 && onTransferToDeveloper && (_jsx(MenuItem, { icon: "\uD83D\uDD00", label: "Transfer to developer", onClick: () => { setShowMenu(false); setTransferOpen(true); } })), _jsx(MenuItem, { icon: isPaused ? '▶️' : '⏸', label: isPaused ? 'Resume Chat' : 'Pause Chat', onClick: () => { setShowMenu(false); setShowConfirm('pause'); } }), config.allowReport && !isReported && (_jsx(MenuItem, { icon: "\u26A0\uFE0F", label: "Report Chat", onClick: () => { setShowMenu(false); setShowConfirm('report'); } })), config.allowBlock && activeUser.type === 'user' && !isBlocked && (_jsx(MenuItem, { icon: "\uD83D\uDEAB", label: "Block User", onClick: () => { setShowMenu(false); setShowConfirm('block'); }, danger: true })), _jsx("div", { style: { borderTop: '1px solid #f0f2f5', margin: '4px 0' } }), _jsx(MenuItem, { icon: "\u2715", label: "Close Chat", onClick: onClose })] })), isPaused && (_jsxs("div", { style: { background: '#fef3c7', padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#92400e', textAlign: 'center', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }, children: ["\u23F8 Chat is paused \u2014 users cannot send messages", _jsx("button", { type: "button", onClick: onTogglePause, style: { background: '#92400e', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: 11, cursor: 'pointer', marginLeft: 4 }, children: "Resume" })] })), isBlocked && (_jsx("div", { style: { background: '#fee2e2', padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#991b1b', textAlign: 'center', flexShrink: 0 }, children: "\uD83D\uDEAB This user is blocked" })), isReported && (_jsx("div", { style: { background: '#fef3c7', padding: '6px 16px', fontSize: 11, color: '#92400e', textAlign: 'center', flexShrink: 0 }, children: "\u26A0\uFE0F This chat has been reported" })), _jsxs("div", { style: { flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8f9fc' }, className: "cw-scroll", children: [grouped.map(({ date, msgs }) => (_jsxs(React.Fragment, { children: [_jsx(DateDivider, { label: date }), msgs.map(msg => (_jsx(Bubble, { msg: msg, primaryColor: config.primaryColor }, msg.id)))] }, date))), messages.length === 0 && (_jsxs("div", { style: { margin: 'auto', textAlign: 'center', color: '#c4cad4', fontSize: 13 }, children: [_jsx("div", { style: { fontSize: 28, marginBottom: 8 }, children: "\uD83D\uDCAC" }), "Say hello to ", activeUser.name, "!"] })), _jsx("div", { ref: endRef })] }), _jsxs("div", { style: { borderTop: '1px solid #eef0f5', padding: '10px 12px 8px', background: '#fff', flexShrink: 0, position: 'relative' }, children: [privacyEnabled && showPrivacy && (_jsxs("div", { style: {
                            position: 'relative',
                            marginBottom: 10,
                            padding: '12px 36px 12px 12px',
                            borderRadius: 12,
                            background: '#fff',
                            border: '1px solid #e8ecf1',
                            boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                        }, children: [_jsx("button", { type: "button", "aria-label": "Dismiss privacy notice", onClick: dismissPrivacy, style: {
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
                                }, children: _jsx("span", { style: { fontSize: 14, color: '#475569', fontWeight: 700 }, children: "\u00D7" }) }), _jsxs("p", { style: { margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.55 }, children: ["By chatting here, you agree we and authorized partners may process, monitor, and record this chat and your data in line with", ' ', config.privacyPolicyUrl ? (_jsx("a", { href: config.privacyPolicyUrl, target: "_blank", rel: "noopener noreferrer", style: { color: config.primaryColor, textDecoration: 'underline', fontWeight: 600 }, children: "Privacy Policy" })) : (_jsx("span", { style: { textDecoration: 'underline', fontWeight: 600 }, children: "Privacy Policy" })), "."] })] })), showEmoji && config.allowEmoji && (_jsx(EmojiPicker, { primaryColor: config.primaryColor, onSelect: e => setText(t => t + e), onClose: () => setShowEmoji(false) })), isRecording && (_jsxs("div", { style: {
                            marginBottom: 10,
                            padding: '12px 12px 14px',
                            background: '#fff',
                            borderRadius: 14,
                            border: '1px solid #e8ecf1',
                            boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }, children: [_jsx("button", { type: "button", onClick: cancelRecording, title: "Discard recording", "aria-label": "Discard recording", style: {
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 6,
                                            lineHeight: 0,
                                            flexShrink: 0,
                                        }, children: _jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6", stroke: "#ef4444", strokeWidth: "2", strokeLinecap: "round" }), _jsx("path", { d: "M10 11v6M14 11v6", stroke: "#ef4444", strokeWidth: "2", strokeLinecap: "round" })] }) }), _jsx("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 44, flex: 1, justifyContent: 'flex-end', minWidth: 0 }, children: waveBars.map((h, i) => (_jsx("span", { style: {
                                                width: 3,
                                                borderRadius: 2,
                                                background: '#cbd5e1',
                                                height: `${8 + h * 36}px`,
                                                transition: 'height 0.05s ease-out',
                                            } }, i))) })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, children: [_jsx("div", { style: { flex: 1 } }), _jsx("div", { style: {
                                            background: '#ef4444',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: 13,
                                            padding: '6px 14px',
                                            borderRadius: 999,
                                            minWidth: 52,
                                            textAlign: 'center',
                                        }, children: fmtTime(recordSec) }), _jsx("button", { type: "button", onClick: stopRecordingSend, title: "Send voice message", "aria-label": "Send voice message", style: {
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
                                        }, children: _jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] })] })), _jsxs("div", { style: {
                            border: `1.5px solid ${isPaused || isBlocked ? '#e5e7eb' : '#bfdbfe'}`,
                            borderRadius: 16,
                            padding: '10px 12px 8px',
                            background: isPaused || isBlocked ? '#f9fafb' : '#fff',
                        }, children: [pendingAttach && (_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 10,
                                    padding: '8px 10px',
                                    borderRadius: 10,
                                    background: '#f8fafc',
                                    border: '1px solid #fecaca',
                                    position: 'relative',
                                }, children: [_jsx("div", { style: {
                                            width: 40,
                                            height: 40,
                                            borderRadius: 8,
                                            background: config.primaryColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }, children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48", stroke: "#fff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 13, color: '#1a2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: pendingAttach.file.name, children: pendingAttach.file.name }), _jsx("div", { style: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }, children: (pendingAttach.file.type.split('/')[1] || 'file').slice(0, 8) })] }), _jsx("button", { type: "button", onClick: () => clearPendingAttach(true), title: "Remove attachment", "aria-label": "Remove attachment", style: {
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
                                        }, children: "\u00D7" })] })), _jsx("textarea", { ref: inputRef, value: text, onChange: e => setText(e.target.value), onKeyDown: handleKey, onPaste: handlePaste, placeholder: isPaused || isBlocked ? 'Chat is unavailable' : 'Compose your message…', disabled: isPaused || isBlocked || isRecording, rows: 2, style: {
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
                                } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 2 }, children: [config.allowEmoji && (_jsx(ActionBtn, { onClick: () => setShowEmoji(v => !v), title: "Emoji", children: _jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "#94a3b8", strokeWidth: "1.8" }), _jsx("path", { d: "M8 14s1.5 2 4 2 4-2 4-2", stroke: "#94a3b8", strokeWidth: "1.8", strokeLinecap: "round" }), _jsx("circle", { cx: "9", cy: "9", r: "1", fill: "#94a3b8" }), _jsx("circle", { cx: "15", cy: "9", r: "1", fill: "#94a3b8" })] }) })), config.allowAttachment && (_jsxs(_Fragment, { children: [_jsx("input", { ref: fileRef, type: "file", style: { display: 'none' }, onChange: handleFileChange }), _jsx(ActionBtn, { onClick: () => { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, title: "Attach file", children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48", stroke: "#94a3b8", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] })), config.allowVoiceMessage && !isRecording && (_jsx(ActionBtn, { onClick: startRecording, title: "Voice message", children: _jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z", stroke: "#94a3b8", strokeWidth: "1.8", strokeLinecap: "round" }), _jsx("path", { d: "M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8", stroke: "#94a3b8", strokeWidth: "1.8", strokeLinecap: "round" })] }) }))] }), _jsx("button", { type: "button", onClick: handleSend, disabled: (!text.trim() && !pendingAttach) || isPaused || isBlocked || isRecording, style: {
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
                                        }, title: "Send", children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z", stroke: (text.trim() || pendingAttach) && !isPaused && !isBlocked ? '#fff' : '#94a3b8', strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] })] }), (config.footerPoweredBy || config.branch) && (_jsxs("p", { style: { margin: '10px 0 0', textAlign: 'center', fontSize: 12, color: '#94a3b8' }, children: [config.footerPoweredBy, config.footerPoweredBy && config.branch ? ' · ' : '', config.branch && _jsx("span", { style: { fontWeight: 600, color: '#64748b' }, children: config.branch })] }))] }), transferOpen && otherDevelopers.length > 0 && onTransferToDeveloper && (_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 280,
                    padding: 16,
                }, children: _jsxs("div", { style: {
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
                    }, children: [_jsx("div", { style: { fontWeight: 800, fontSize: 16, color: '#1a2332', marginBottom: 6 }, children: "Transfer chat to" }), _jsx("p", { style: { fontSize: 12, color: '#7b8fa1', margin: '0 0 12px', lineHeight: 1.5 }, children: "Assign this conversation to another developer. History is kept and a handoff note is added." }), _jsx("div", { className: "cw-scroll", style: { flex: 1, overflowY: 'auto', margin: '0 -4px' }, children: otherDevelopers.map(dev => (_jsxs("button", { type: "button", onClick: () => {
                                    onTransferToDeveloper(dev);
                                    setTransferOpen(false);
                                }, style: {
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
                                }, children: [dev.name, _jsx("span", { style: { display: 'block', fontSize: 11, fontWeight: 500, color: '#64748b', marginTop: 2 }, children: dev.designation })] }, dev.uid))) }), _jsx("button", { type: "button", onClick: () => setTransferOpen(false), style: {
                                marginTop: 12,
                                padding: '10px',
                                borderRadius: 10,
                                border: '1.5px solid #e5e7eb',
                                background: '#fff',
                                fontWeight: 600,
                                fontSize: 13,
                                color: '#475569',
                                cursor: 'pointer',
                            }, children: "Cancel" })] }) })), showConfirm && (_jsx("div", { style: {
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
                    borderRadius: 'inherit',
                }, children: _jsxs("div", { style: { background: '#fff', borderRadius: 16, padding: '24px 20px', width: 280, boxShadow: '0 16px 48px rgba(0,0,0,0.22)', animation: 'cw-fadeUp 0.2s ease' }, children: [_jsxs("div", { style: { fontWeight: 800, fontSize: 16, color: '#1a2332', marginBottom: 8 }, children: [showConfirm === 'pause' && (isPaused ? 'Resume Chat?' : 'Pause Chat?'), showConfirm === 'report' && 'Report this chat?', showConfirm === 'block' && 'Block this user?'] }), _jsxs("p", { style: { fontSize: 13, color: '#7b8fa1', lineHeight: 1.6, margin: '0 0 18px' }, children: [showConfirm === 'pause' && (isPaused ? 'The user will be able to send messages again.' : 'The user will not be able to send new messages.'), showConfirm === 'report' && 'This chat will be flagged for review by the admin team.', showConfirm === 'block' && 'This user will be blocked and added to your block list. You can unblock them later.'] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { type: "button", onClick: () => setShowConfirm(null), style: { flex: 1, padding: '9px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }, children: "Cancel" }), _jsx("button", { type: "button", onClick: () => handleConfirm(showConfirm), style: {
                                        flex: 1, padding: '9px', borderRadius: 10, border: 'none',
                                        background: showConfirm === 'block' ? '#ef4444' : config.primaryColor,
                                        color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                                    }, children: "Confirm" })] })] }) }))] }));
};
const VoiceRow = ({ msg, isMe, primaryColor }) => {
    var _a;
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [dur, setDur] = useState((_a = msg.voiceDuration) !== null && _a !== void 0 ? _a : 0);
    const url = msg.voiceUrl;
    useEffect(() => {
        const a = audioRef.current;
        if (!a || !url)
            return;
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
        if (!a)
            return;
        if (playing) {
            a.pause();
            setPlaying(false);
        }
        else {
            void a.play().then(() => setPlaying(true)).catch(() => { });
        }
    };
    const pct = dur > 0 ? Math.min(100, (current / dur) * 100) : 0;
    const timeLabel = fmtTime(Math.floor(current)) + ' / ' + fmtTime(Math.floor(dur || msg.voiceDuration || 0));
    if (!url) {
        return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 13 }, children: "\uD83C\uDFA4" }), _jsxs("span", { style: { fontSize: 13 }, children: ["Voice message", msg.voiceDuration ? ` · ${msg.voiceDuration}s` : ''] })] }));
    }
    return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }, children: [url && (_jsx("audio", { ref: audioRef, src: url, preload: "metadata", onPlay: () => setPlaying(true), onPause: () => setPlaying(false), onEnded: () => { setPlaying(false); setCurrent(0); } })), _jsx("button", { type: "button", onClick: toggle, style: {
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
                }, "aria-label": playing ? 'Pause' : 'Play', children: playing ? (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("rect", { x: "6", y: "4", width: "4", height: "16" }), _jsx("rect", { x: "14", y: "4", width: "4", height: "16" })] })) : (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M8 5v14l11-7z" }) })) }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { height: 4, borderRadius: 2, background: isMe ? 'rgba(255,255,255,0.35)' : '#e2e8f0', overflow: 'hidden' }, children: _jsx("div", { style: { width: `${pct}%`, height: '100%', background: isMe ? '#fff' : primaryColor, borderRadius: 2, transition: 'width 0.1s linear' } }) }), _jsx("div", { style: { fontSize: 11, marginTop: 4, opacity: 0.9 }, children: timeLabel })] })] }));
};
const AttachmentRow = ({ msg, isMe, primaryColor }) => {
    var _a, _b;
    const name = (_a = msg.attachmentName) !== null && _a !== void 0 ? _a : 'File';
    const href = msg.attachmentUrl;
    const label = shortAttachmentLabel(name, 10);
    const mime = (_b = msg.attachmentMime) !== null && _b !== void 0 ? _b : '';
    const isImage = mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }, children: [isImage && href && (_jsx("a", { href: href, download: name, title: name, style: { alignSelf: 'flex-start', lineHeight: 0 }, children: _jsx("img", { src: href, alt: "", style: { maxWidth: 220, maxHeight: 200, borderRadius: 10, objectFit: 'cover', display: 'block' } }) })), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [!isImage && (_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", style: { flexShrink: 0 }, children: _jsx("path", { d: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48", stroke: isMe ? '#fff' : '#334155', strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [href ? (_jsxs("a", { href: href, download: name, title: name, style: {
                                    fontWeight: 700,
                                    fontSize: 14,
                                    wordBreak: 'break-word',
                                    color: isMe ? '#fff' : primaryColor,
                                    textDecoration: 'underline',
                                }, children: ["[", label, "]"] })) : (_jsxs("div", { style: { fontWeight: 700, fontSize: 14, wordBreak: 'break-word' }, title: name, children: ["[", label, "]"] })), msg.attachmentSize && _jsx("div", { style: { fontSize: 11, opacity: 0.8 }, children: msg.attachmentSize })] })] })] }));
};
const Bubble = ({ msg, primaryColor }) => {
    const isMe = msg.senderId === 'me';
    const caption = msg.text.trim();
    const content = msg.type === 'voice' ? (_jsx(VoiceRow, { msg: msg, isMe: isMe, primaryColor: primaryColor })) : msg.type === 'attachment' ? (_jsxs(_Fragment, { children: [_jsx(AttachmentRow, { msg: msg, isMe: isMe, primaryColor: primaryColor }), caption && caption !== ' ' && (_jsx("div", { style: { marginTop: 6, fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }, children: msg.text }))] })) : (_jsx("span", { children: msg.text }));
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }, children: [_jsx("div", { style: {
                    maxWidth: '85%', padding: '10px 13px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: isMe ? primaryColor : '#fff',
                    color: isMe ? '#fff' : '#1a2332',
                    fontSize: 14, lineHeight: 1.5,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    wordBreak: 'break-word',
                }, children: content }), _jsx("span", { style: { fontSize: 11, color: '#b0bec5', padding: '0 4px' }, children: formatTime(msg.timestamp) })] }));
};
const DateDivider = ({ label }) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }, children: [_jsx("div", { style: { flex: 1, height: 1, background: '#e5e7eb' } }), _jsx("span", { style: { fontSize: 11, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }, children: label }), _jsx("div", { style: { flex: 1, height: 1, background: '#e5e7eb' } })] }));
const MenuItem = ({ icon, label, onClick, danger }) => (_jsxs("button", { type: "button", onClick: onClick, style: {
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px',
        background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
        fontSize: 13, fontWeight: 600, color: danger ? '#ef4444' : '#374151',
        transition: 'background 0.12s',
    }, onMouseEnter: e => e.currentTarget.style.background = danger ? '#fee2e2' : '#f3f4f6', onMouseLeave: e => e.currentTarget.style.background = 'none', children: [_jsx("span", { children: icon }), " ", label] }));
const ActionBtn = ({ onClick, title, children }) => (_jsx("button", { type: "button", onClick: onClick, title: title, style: {
        background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'background 0.13s',
    }, onMouseEnter: e => e.currentTarget.style.background = '#f1f5f9', onMouseLeave: e => e.currentTarget.style.background = 'none', children: children }));
const hdrBtn = {
    background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
};
function navEntriesForChat(chatType, isStaff) {
    const showSupport = chatType === 'SUPPORT' || chatType === 'BOTH';
    const showChat = chatType === 'CHAT' || chatType === 'BOTH';
    const items = [];
    if (showSupport)
        items.push({ key: 'support', icon: '🛠', label: isStaff ? 'Provide Support' : 'Need Support' });
    if (showChat)
        items.push({ key: 'conversation', icon: '💬', label: isStaff ? 'Chat with developer' : 'New Conversation' });
    items.push({ key: 'ticket', icon: '🎫', label: 'Raise ticket' });
    return items;
}
function groupByDate(messages) {
    const map = new Map();
    messages.forEach(m => {
        const d = formatDate(m.timestamp);
        if (!map.has(d))
            map.set(d, []);
        map.get(d).push(m);
    });
    return Array.from(map.entries()).map(([date, msgs]) => ({ date, msgs }));
}
function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.max(0, sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

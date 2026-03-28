'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { submitReenableRequest } from '../../utils/reenableRequest';
const DEFAULT_MESSAGE = 'You have been marked as Blocked user due to spam';
export const ViewerBlockedScreen = ({ config, apiKey, onClose }) => {
    var _a, _b;
    const [text, setText] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const primary = config.primaryColor;
    const body = (((_a = config.blockedViewerMessage) === null || _a === void 0 ? void 0 : _a.trim()) || DEFAULT_MESSAGE);
    const url = (_b = config.reenableRequestUrl) === null || _b === void 0 ? void 0 : _b.trim();
    const handleSubmit = async () => {
        var _a;
        if (!url) {
            setError('Re-enable endpoint is not configured. Contact support directly.');
            setStatus('error');
            return;
        }
        const msg = text.trim();
        if (!msg) {
            setError('Please describe why you should be re-enabled.');
            return;
        }
        setError(null);
        setStatus('sending');
        try {
            await submitReenableRequest(url, {
                widgetId: config.id,
                apiKey,
                viewerUid: ((_a = config.viewerUid) === null || _a === void 0 ? void 0 : _a.trim()) || undefined,
                message: msg,
            });
            setStatus('sent');
            setText('');
        }
        catch (e) {
            setStatus('error');
            setError(e instanceof Error ? e.message : 'Request failed');
        }
    };
    return (_jsx("div", { className: "cw-scroll", style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 20px 32px',
            textAlign: 'center',
            overflowY: 'auto',
            minHeight: 0,
        }, children: _jsxs("div", { style: { maxWidth: 380, width: '100%' }, children: [_jsx("div", { style: { fontSize: 44, marginBottom: 16 }, children: "\uD83D\uDEAB" }), _jsx("p", { style: {
                        margin: '0 0 28px',
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#1e293b',
                        lineHeight: 1.55,
                    }, children: body }), status === 'sent' ? (_jsxs(_Fragment, { children: [_jsx("p", { style: { margin: '0 0 16px', fontSize: 14, color: '#16a34a', fontWeight: 600 }, children: "Your request was sent. We will review it shortly." }), _jsx("button", { type: "button", onClick: onClose, style: {
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 12,
                                border: '2px solid #ef4444',
                                background: '#fff',
                                color: '#ef4444',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }, children: "Close" })] })) : (_jsxs(_Fragment, { children: [_jsx("label", { htmlFor: "cw-reenable-msg", style: { display: 'block', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }, children: "Request access restoration" }), _jsx("textarea", { id: "cw-reenable-msg", value: text, onChange: e => { setText(e.target.value); setError(null); setStatus('idle'); }, placeholder: "Explain briefly why your access should be restored\u2026", rows: 4, maxLength: 500, minLength: 50, disabled: status === 'sending', style: {
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '12px 14px',
                                borderRadius: 12,
                                border: '1.5px solid #e2e8f0',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                color: '#1e293b',
                                resize: 'none',
                                minHeight: 100,
                                maxHeight: 250,
                                marginBottom: 14,
                                outline: 'none',
                            } }), _jsx("button", { type: "button", onClick: handleSubmit, disabled: status === 'sending' || !text.trim(), style: {
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: 12,
                                border: 'none',
                                background: text.trim() && status !== 'sending' ? primary : '#e2e8f0',
                                color: text.trim() && status !== 'sending' ? '#fff' : '#94a3b8',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: text.trim() && status !== 'sending' ? 'pointer' : 'default',
                            }, children: status === 'sending' ? 'Sending…' : 'Submit request' }), _jsx("button", { type: "button", onClick: onClose, style: {
                                width: '100%',
                                marginTop: 12,
                                padding: '12px 16px',
                                borderRadius: 12,
                                border: '2px solid #ef4444',
                                background: '#fff',
                                color: '#ef4444',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }, children: "Close" }), error && (_jsx("p", { style: { margin: '12px 0 0', fontSize: 13, color: '#dc2626', lineHeight: 1.45 }, children: error })), !url && (_jsxs("p", { style: { margin: '14px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }, children: ["Your administrator must set ", _jsx("code", { style: { fontSize: 11 }, children: "reenableRequestUrl" }), " in widget config for online requests."] }))] }))] }) }));
};

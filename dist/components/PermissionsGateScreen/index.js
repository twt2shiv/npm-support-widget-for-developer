'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { requestWidgetPermissions, storePermissionsGrant } from '../../utils/widgetPermissions';
const DENIED = 'You cannot use this widget due to less permission granted by you.';
export const PermissionsGateScreen = ({ primaryColor, widgetId, onGranted, }) => {
    const [phase, setPhase] = useState('prompt');
    const handleAllow = async () => {
        setPhase('checking');
        const ok = await requestWidgetPermissions();
        if (ok) {
            storePermissionsGrant(widgetId);
            onGranted();
        }
        else {
            setPhase('denied');
        }
    };
    return (_jsx("div", { style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 22px',
            textAlign: 'center',
            minHeight: 0,
        }, children: phase === 'denied' ? (_jsxs(_Fragment, { children: [_jsx("div", { style: { fontSize: 44, marginBottom: 16 }, children: "\uD83D\uDD12" }), _jsx("p", { style: { margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#1e293b', lineHeight: 1.55, maxWidth: 320 }, children: DENIED }), _jsx("p", { style: { margin: '0 0 22px', fontSize: 13, color: '#64748b', lineHeight: 1.5, maxWidth: 340 }, children: "Allow microphone, location, and screen sharing in your browser settings for this site, then try again." }), _jsx("button", { type: "button", onClick: () => { setPhase('prompt'); void handleAllow(); }, style: {
                        padding: '12px 22px',
                        borderRadius: 12,
                        border: 'none',
                        background: primaryColor,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                    }, children: "Try again" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { fontSize: 44, marginBottom: 16 }, children: "\uD83C\uDF99\uFE0F" }), _jsx("p", { style: { margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: '#0f172a' }, children: "Permissions required" }), _jsxs("p", { style: { margin: '0 0 8px', fontSize: 14, color: '#475569', lineHeight: 1.55, maxWidth: 340 }, children: ["This widget needs ", _jsx("strong", { children: "microphone" }), " (voice & calls), ", _jsx("strong", { children: "location" }), ", and", ' ', _jsx("strong", { children: "screen sharing" }), " to work."] }), _jsx("p", { style: { margin: '0 0 22px', fontSize: 12, color: '#94a3b8', lineHeight: 1.45, maxWidth: 360 }, children: "You will be asked to pick a screen once \u2014 you can stop sharing immediately after; we only verify access." }), _jsx("button", { type: "button", disabled: phase === 'checking', onClick: handleAllow, style: {
                        padding: '14px 28px',
                        borderRadius: 12,
                        border: 'none',
                        background: phase === 'checking' ? '#94a3b8' : primaryColor,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: phase === 'checking' ? 'default' : 'pointer',
                        minWidth: 200,
                    }, children: phase === 'checking' ? 'Checking…' : 'Allow & continue' })] })) }));
};

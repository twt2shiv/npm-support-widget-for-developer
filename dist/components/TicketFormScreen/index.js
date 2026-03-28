import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
function inputStyle(primaryColor) {
    return {
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        border: '1.5px solid #e5e7eb',
        outline: 'none',
        fontSize: 14,
        color: '#1a2332',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    };
}
export const TicketFormScreen = ({ config, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('medium');
    const pm = {
        low: { label: 'Low', color: '#6b7280' },
        medium: { label: 'Medium', color: '#d97706' },
        high: { label: 'High', color: '#ef4444' },
    };
    const handleSubmit = () => {
        if (!title.trim())
            return;
        onSubmit(title.trim(), desc.trim(), priority);
    };
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', minHeight: 0 }, children: [_jsxs("div", { style: {
                    background: `linear-gradient(135deg,${config.primaryColor},${config.primaryColor}cc)`,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexShrink: 0,
                }, children: [_jsx("button", { type: "button", onClick: onCancel, style: {
                            background: 'rgba(255,255,255,0.22)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }, children: _jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M19 12H5M5 12L12 19M5 12L12 5", stroke: "#fff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), _jsxs("div", { children: [_jsx("h2", { style: { margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }, children: "Raise a ticket" }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.85)' }, children: "Please fill out the ticket form below and we will get back to you as soon as possible." })] })] }), _jsxs("div", { className: "cw-scroll", style: { flex: 1, overflowY: 'auto', padding: '20px 18px', minHeight: 0 }, children: [_jsx("input", { placeholder: "Title *", value: title, onChange: e => setTitle(e.target.value), style: inputStyle(config.primaryColor), onFocus: e => (e.target.style.borderColor = config.primaryColor), onBlur: e => (e.target.style.borderColor = '#e5e7eb') }), _jsx("textarea", { placeholder: "Describe the issue\u2026", value: desc, onChange: e => setDesc(e.target.value), rows: 5, style: Object.assign(Object.assign({}, inputStyle(config.primaryColor)), { resize: 'none', marginTop: 12 }), onFocus: e => (e.target.style.borderColor = config.primaryColor), onBlur: e => (e.target.style.borderColor = '#e5e7eb') }), _jsx("div", { style: { display: 'flex', gap: 8, marginTop: 12, paddingBottom: 8 }, children: ['low', 'medium', 'high'].map(p => (_jsx("button", { type: "button", onClick: () => setPriority(p), style: {
                                flex: 1,
                                padding: '8px',
                                border: `1.5px solid ${priority === p ? pm[p].color : '#e5e7eb'}`,
                                borderRadius: 8,
                                background: priority === p ? `${pm[p].color}15` : '#fff',
                                color: pm[p].color,
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                            }, children: pm[p].label }, p))) })] }), _jsx("div", { style: {
                    flexShrink: 0,
                    padding: '12px 18px 18px',
                    borderTop: '1px solid #eef0f5',
                    background: '#fff',
                    boxShadow: '0 -4px 20px rgba(15,23,42,0.06)',
                }, children: _jsx("button", { type: "button", onClick: handleSubmit, disabled: !title.trim(), style: {
                        width: '100%',
                        padding: '14px',
                        borderRadius: 10,
                        border: 'none',
                        background: title.trim() ? config.primaryColor : '#e5e7eb',
                        color: title.trim() ? '#fff' : '#9ca3af',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: title.trim() ? 'pointer' : 'not-allowed',
                    }, children: "Submit ticket" }) })] }));
};

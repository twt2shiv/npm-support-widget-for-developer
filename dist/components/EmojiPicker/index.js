import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const EMOJIS = [
    '😀', '😂', '😊', '😍', '🤔', '😎', '😢', '😡',
    '👍', '👎', '👏', '🙏', '🎉', '❤️', '🔥', '✅',
    '🚀', '💡', '⚠️', '🎫',
];
export const EmojiPicker = ({ onSelect, onClose, primaryColor }) => (_jsxs("div", { style: {
        position: 'absolute', bottom: '100%', right: 0,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '12px', zIndex: 100,
        animation: 'cw-fadeUp 0.18s ease',
        marginBottom: 8,
    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, color: '#7b8fa1', textTransform: 'uppercase', letterSpacing: '0.06em' }, children: "Emojis" }), _jsx("button", { onClick: onClose, style: { background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#7b8fa1', fontSize: 14 }, children: "\u2715" })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, width: 200 }, children: EMOJIS.map(e => (_jsx("button", { onClick: () => { onSelect(e); onClose(); }, style: {
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 22, padding: '6px', borderRadius: 8,
                    transition: 'background 0.12s',
                }, onMouseEnter: el => el.currentTarget.style.background = `${primaryColor}15`, onMouseLeave: el => el.currentTarget.style.background = 'none', children: e }, e))) })] }));

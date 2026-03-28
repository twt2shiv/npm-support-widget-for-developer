import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const BottomTabs = ({ active, onChange, primaryColor }) => {
    const tabs = [
        { key: 'home', label: 'Home', Icon: HomeIcon },
        { key: 'chats', label: 'Chats', Icon: ChatsIcon },
        { key: 'tickets', label: 'Tickets', Icon: TicketsIcon },
    ];
    return (_jsx("div", { style: {
            display: 'flex', borderTop: '1px solid #eef0f5',
            backgroundColor: '#fff', flexShrink: 0,
        }, children: tabs.map(tab => {
            const isActive = active === tab.key;
            return (_jsxs("button", { type: "button", onClick: () => onChange(tab.key), style: {
                    flex: 1, padding: '10px 0 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '10px', fontWeight: isActive ? 700 : 500,
                    color: isActive ? primaryColor : '#9aa3af',
                    borderTop: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                    transition: 'color 0.15s',
                    fontFamily: 'inherit',
                }, children: [_jsx(tab.Icon, { a: isActive, c: isActive ? primaryColor : '#b0bec5' }), tab.label] }, tab.key));
        }) }));
};
const HomeIcon = ({ a, c }) => (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z", stroke: c, strokeWidth: a ? 2.2 : 1.8, fill: a ? `${c}20` : 'none', strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M9 21V12h6v9", stroke: c, strokeWidth: a ? 2.2 : 1.8, strokeLinecap: "round", strokeLinejoin: "round" })] }));
const ChatsIcon = ({ a, c }) => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", stroke: c, strokeWidth: a ? 2.2 : 1.8, fill: a ? `${c}20` : 'none', strokeLinecap: "round", strokeLinejoin: "round" }) }));
const TicketsIcon = ({ a, c }) => (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M15 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V9l-4-4z", stroke: c, strokeWidth: a ? 2.2 : 1.8, fill: a ? `${c}20` : 'none', strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M15 5v4h4M9 13h6M9 17h4", stroke: c, strokeWidth: a ? 2.2 : 1.8, strokeLinecap: "round" })] }));

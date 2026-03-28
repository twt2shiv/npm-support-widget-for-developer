export const defaultTheme = {
    primaryColor: '#2563EB',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    buttonColor: '#2563EB',
    buttonTextColor: '#ffffff',
    buttonLabel: 'Support',
    buttonPosition: 'bottom-right',
    borderRadius: '0px', // drawer uses 16px only on top-left / bottom-left
};
export function mergeTheme(remote, local) {
    return Object.assign(Object.assign(Object.assign({}, defaultTheme), remote), local);
}
/** Darken a hex color by `amount` (0-255) */
export function darken(hex, amount = 20) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - amount);
    const g = Math.max(0, ((n >> 8) & 0xff) - amount);
    const b = Math.max(0, (n & 0xff) - amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

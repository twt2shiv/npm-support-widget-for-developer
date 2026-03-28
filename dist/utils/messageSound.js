/** Short notification tone for incoming chat messages */
export function playMessageSound() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC)
            return;
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = 880;
        g.gain.value = 0.07;
        o.start();
        setTimeout(() => {
            try {
                o.stop();
                void ctx.close();
            }
            catch (_a) {
                /* ignore */
            }
        }, 100);
    }
    catch (_a) {
        /* ignore */
    }
}
const soundPrefKey = (widgetId) => `ajaxter_sound_${widgetId}`;
export function getMessageSoundEnabled(widgetId) {
    if (typeof window === 'undefined')
        return true;
    try {
        const v = localStorage.getItem(soundPrefKey(widgetId));
        if (v === null)
            return true;
        return v === '1';
    }
    catch (_a) {
        return true;
    }
}
export function setMessageSoundEnabled(widgetId, enabled) {
    try {
        localStorage.setItem(soundPrefKey(widgetId), enabled ? '1' : '0');
    }
    catch (_a) {
        /* ignore */
    }
}

/** Short notification tone for incoming chat messages */
export function playMessageSound(): void {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
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
      } catch {
        /* ignore */
      }
    }, 100);
  } catch {
    /* ignore */
  }
}

const soundPrefKey = (widgetId: string) => `ajaxter_sound_${widgetId}`;

export function getMessageSoundEnabled(widgetId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const v = localStorage.getItem(soundPrefKey(widgetId));
    if (v === null) return true;
    return v === '1';
  } catch {
    return true;
  }
}

export function setMessageSoundEnabled(widgetId: string, enabled: boolean): void {
  try {
    localStorage.setItem(soundPrefKey(widgetId), enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

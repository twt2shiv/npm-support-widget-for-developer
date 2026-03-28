/**
 * Requests microphone, geolocation, and screen-capture access required by the widget.
 * Stops all tracks immediately after success (probe only).
 */
export async function requestWidgetPermissions(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;

  try {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    mic.getTracks().forEach(t => t.stop());
  } catch {
    return false;
  }

  try {
    if (!navigator.geolocation?.getCurrentPosition) return false;
    await new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(),
        e => reject(e),
        { enableHighAccuracy: false, timeout: 20_000, maximumAge: 60_000 },
      );
    });
  } catch {
    return false;
  }

  try {
    if (!navigator.mediaDevices?.getDisplayMedia) return false;
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    screen.getTracks().forEach(t => t.stop());
  } catch {
    return false;
  }

  return true;
}

export function permissionsSessionKey(widgetId: string): string {
  return `ajaxter_widget_permissions_ok_${widgetId}`;
}

export function hasStoredPermissionsGrant(widgetId: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(permissionsSessionKey(widgetId)) === '1';
  } catch {
    return false;
  }
}

export function storePermissionsGrant(widgetId: string): void {
  try {
    sessionStorage.setItem(permissionsSessionKey(widgetId), '1');
  } catch {
    /* quota */
  }
}

export function clearStoredPermissionsGrant(widgetId: string): void {
  try {
    sessionStorage.removeItem(permissionsSessionKey(widgetId));
  } catch {
    /* */
  }
}

'use client';

import React, { useState } from 'react';
import { requestWidgetPermissions, storePermissionsGrant } from '../../utils/widgetPermissions';

const DENIED =
  'You cannot use this widget due to less permission granted by you.';

interface PermissionsGateScreenProps {
  primaryColor: string;
  widgetId: string;
  onGranted: () => void;
}

export const PermissionsGateScreen: React.FC<PermissionsGateScreenProps> = ({
  primaryColor,
  widgetId,
  onGranted,
}) => {
  const [phase, setPhase] = useState<'prompt' | 'checking' | 'denied'>('prompt');

  const handleAllow = async () => {
    setPhase('checking');
    const ok = await requestWidgetPermissions();
    if (ok) {
      storePermissionsGrant(widgetId);
      onGranted();
    } else {
      setPhase('denied');
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 22px',
        textAlign: 'center',
        minHeight: 0,
      }}
    >
      {phase === 'denied' ? (
        <>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
          <p style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#1e293b', lineHeight: 1.55, maxWidth: 320 }}>
            {DENIED}
          </p>
          <p style={{ margin: '0 0 22px', fontSize: 13, color: '#64748b', lineHeight: 1.5, maxWidth: 340 }}>
            Allow microphone, location, and screen sharing in your browser settings for this site, then try again.
          </p>
          <button
            type="button"
            onClick={() => { setPhase('prompt'); void handleAllow(); }}
            style={{
              padding: '12px 22px',
              borderRadius: 12,
              border: 'none',
              background: primaryColor,
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🎙️</div>
          <p style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Permissions required</p>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: '#475569', lineHeight: 1.55, maxWidth: 340 }}>
            This widget needs <strong>microphone</strong> (voice &amp; calls), <strong>location</strong>, and{' '}
            <strong>screen sharing</strong> to work.
          </p>
          <p style={{ margin: '0 0 22px', fontSize: 12, color: '#94a3b8', lineHeight: 1.45, maxWidth: 360 }}>
            You will be asked to pick a screen once — you can stop sharing immediately after; we only verify access.
          </p>
          <button
            type="button"
            disabled={phase === 'checking'}
            onClick={handleAllow}
            style={{
              padding: '14px 28px',
              borderRadius: 12,
              border: 'none',
              background: phase === 'checking' ? '#94a3b8' : primaryColor,
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: phase === 'checking' ? 'default' : 'pointer',
              minWidth: 200,
            }}
          >
            {phase === 'checking' ? 'Checking…' : 'Allow & continue'}
          </button>
        </>
      )}
    </div>
  );
};

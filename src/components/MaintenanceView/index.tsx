import React from 'react';

interface MaintenanceViewProps {
  primaryColor: string;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ primaryColor }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', padding: '32px', textAlign: 'center', gap: 16,
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      backgroundColor: `${primaryColor}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1a2332', letterSpacing: '-0.02em' }}>
      Under Maintenance
    </h3>
    <p style={{ margin: 0, fontSize: 14, color: '#7b8fa1', lineHeight: 1.6, maxWidth: 220 }}>
      Chat is under maintenance. We'll be back shortly!
    </p>
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 20,
      backgroundColor: '#fff3cd', color: '#856404',
      fontSize: 12, fontWeight: 700, border: '1px solid #ffc10730',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ffc107', display: 'inline-block' }} />
      Temporarily Unavailable
    </span>
  </div>
);

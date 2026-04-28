'use client';

export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(168,85,247,0.12) 0%, transparent 60%)
        `,
      }} />

      {/* Animated ring 1 */}
      <div style={{
        position: 'absolute',
        width: 320, height: 320, borderRadius: '50%',
        border: '1px solid rgba(168,85,247,0.12)',
        animation: 'splashRing 3s ease-in-out infinite',
      }} />
      {/* Animated ring 2 */}
      <div style={{
        position: 'absolute',
        width: 220, height: 220, borderRadius: '50%',
        border: '1px solid rgba(168,85,247,0.2)',
        animation: 'splashRing 3s ease-in-out 0.5s infinite',
      }} />

      {/* Logo mark */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
        {/* Icon container */}
        <div style={{
          width: 88, height: 88, borderRadius: 28,
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(124,58,237,0.45), 0 2px 8px rgba(124,58,237,0.3)',
        }}>
          {/* H logo mark — two vertical bars with a chain link */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Left bar */}
            <rect x="8" y="10" width="10" height="28" rx="5" fill="white" opacity="0.95"/>
            {/* Right bar */}
            <rect x="30" y="10" width="10" height="28" rx="5" fill="white" opacity="0.95"/>
            {/* Cross bar */}
            <rect x="13" y="19" width="22" height="10" rx="5" fill="white" opacity="0.95"/>
            {/* Dot accent */}
            <circle cx="35" cy="36" r="4" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>

        {/* Word mark */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '2rem',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Habitly
          </h1>
          <p style={{
            marginTop: '0.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            Build · Track · Grow
          </p>
        </div>

        {/* Loading indicator */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '0.5rem' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--brand)',
              animation: `pulseDot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50%       { opacity: 1;    transform: scale(1.2); }
        }
        @keyframes splashRing {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.06); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

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
      {/* Subtle bg glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 70%)',
      }} />

      {/* Pulse rings */}
      {[320, 220].map((size, i) => (
        <div key={size} style={{
          position: 'absolute', width: size, height: size,
          borderRadius: '50%', border: `1px solid rgba(168,85,247,${i === 0 ? 0.1 : 0.18})`,
          animation: `splashPulse 2.8s ease-in-out ${i * 0.4}s infinite`,
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {/* The actual provided logo image */}
        <img
          src="/logo.png"
          alt="Habitly logo"
          style={{ width: 80, height: 80, borderRadius: 22, boxShadow: '0 4px 20px rgba(124,58,237,0.2)' }}
        />

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Inter', sans-serif",
            fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.03em',
            color: 'var(--text-primary)', lineHeight: 1,
          }}>
            Habitly
          </h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
            Build · Track · Grow
          </p>
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: '0.25rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%', background: 'var(--brand)',
              animation: `pulseDot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

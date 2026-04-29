'use client';

export default function SplashScreen() {
  return (
    <div data-testid="splash-screen" style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {[280, 190].map((size, i) => (
        <div key={size} style={{
          position: 'absolute', width: size, height: size,
          borderRadius: '50%', border: `1px solid rgba(124,58,237,${i === 0 ? 0.08 : 0.15})`,
          animation: `splashPulse 2.8s ease-in-out ${i * 0.35}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.375rem' }}>
        <img src="/logo.png" alt="Habitly"
          style={{ width: 80, height: 80, borderRadius: 24 }} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontWeight: 700, fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Habitly
          </h1>
          <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
            Build · Track · Grow
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
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

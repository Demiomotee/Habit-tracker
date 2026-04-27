'use client';

import Image from 'next/image';

export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: 'var(--bg)',
        zIndex: 9999,
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 30% 40%, rgba(34,197,94,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(99,102,241,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Animated ring */}
      <div
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          border: '1px solid rgba(34,197,94,0.15)',
          animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '1px solid rgba(34,197,94,0.25)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(34,197,94,0.2)',
          }}
        >
          {/* SVG Logo inline */}
          <svg width="56" height="56" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="28" r="8" fill="#22c55e" opacity="0.9"/>
            <circle cx="60" cy="28" r="4" fill="transparent"/>
            <circle cx="87" cy="72" r="8" fill="#22c55e" opacity="0.7"/>
            <circle cx="87" cy="72" r="4" fill="transparent"/>
            <circle cx="33" cy="72" r="8" fill="#22c55e" opacity="0.7"/>
            <circle cx="33" cy="72" r="4" fill="transparent"/>
            <line x1="60" y1="36" x2="81" y2="65" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
            <line x1="81" y1="65" x2="39" y2="65" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
            <line x1="39" y1="65" x2="60" y2="36" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="60" cy="60" r="14" fill="#22c55e"/>
            <path d="M54 60.5L58 64.5L67 56" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: "'Syne', 'Outfit', sans-serif",
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Habit Tracker
          </h1>
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Build better, every day
          </p>
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#22c55e',
                opacity: 0.4,
                animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

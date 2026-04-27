'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserByEmail, saveSession } from '@/lib/storage';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = getUserByEmail(email.trim());
      if (!user || user.password !== password) {
        setError('Invalid email or password');
        return;
      }

      saveSession({ userId: user.id, email: user.email });
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--bg)',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)',
            border: '1.5px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 24px rgba(34,197,94,0.15)',
          }}>
            <svg width="36" height="36" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="28" r="8" fill="#22c55e" opacity="0.9"/>
              <circle cx="87" cy="72" r="8" fill="#22c55e" opacity="0.7"/>
              <circle cx="33" cy="72" r="8" fill="#22c55e" opacity="0.7"/>
              <line x1="60" y1="36" x2="81" y2="65" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
              <line x1="81" y1="65" x2="39" y2="65" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
              <line x1="39" y1="65" x2="60" y2="36" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
              <circle cx="60" cy="60" r="14" fill="#22c55e"/>
              <path d="M54 60.5L58 64.5L67 56" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'Syne, Outfit, sans-serif', fontWeight: 800,
            fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Your streaks are waiting for you
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="login-email" className="label">Email address</label>
            <input
              id="login-email"
              data-testid="auth-login-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <input
              id="login-password"
              data-testid="auth-login-password"
              type="password"
              className="input"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            data-testid="auth-login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'var(--brand)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 10,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '2rem',
          fontSize: '0.9rem', color: 'var(--text-muted)',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

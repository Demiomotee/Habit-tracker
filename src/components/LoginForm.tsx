'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getUserByEmail, saveSession } from '@/lib/storage';
import ThemeToggle from './ThemeToggle';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.15) 0%, transparent 70%)',
      }} />

      {/* Theme toggle top-right */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 20, margin: '0 auto 1.25rem',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <img src="/logo.png" alt="Habitly" style={{ width: 36, height: 36, borderRadius: 9 }} />
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Welcome back
          </h1>
          <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to your Habitly account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="ht-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} strokeWidth={2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-email"
                  data-testid="auth-login-email"
                  type="email" className="ht-input" required autoComplete="email"
                  placeholder="you@example.com"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="ht-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} strokeWidth={2} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-password"
                  data-testid="auth-login-password"
                  type={showPw ? 'text' : 'password'} className="ht-input" required autoComplete="current-password"
                  placeholder="Your password"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '0.625rem 0.875rem',
                color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              data-testid="auth-login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : (
                <><span>Sign in</span><ArrowRight size={17} strokeWidth={2.5} /></>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

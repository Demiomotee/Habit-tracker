'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getUserByEmail, saveSession } from '@/lib/storage';
import ThemeToggle from './ThemeToggle';

interface FieldErrors { email?: string; password?: string; }

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!email.trim()) e.email = 'Email address is required';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = getUserByEmail(email.trim());
      if (!user || user.password !== password) {
        setErrors({ password: 'Invalid email or password' });
        return;
      }
      saveSession({ userId: user.id, email: user.email, name: user.name });
      router.replace('/dashboard');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', position: 'relative',
    }}>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Habitly"
            style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem', display: 'block' }} />
          <h1 style={{ fontWeight: 800, fontSize: '1.625rem', color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Welcome back
          </h1>
          <p style={{ marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to your Habitly account
          </p>
        </div>


        <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-soft)', padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

 
            <div>
              <label htmlFor="login-email" className={`ht-label${errors.email ? ' error' : ''}`}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-email" data-testid="auth-login-email"
                  type="email" className={`ht-input${errors.email ? ' error' : ''}`}
                  style={{ paddingLeft: '2.375rem' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="field-error">
                  <span style={{ fontSize: '0.875rem' }}>⚠</span> {errors.email}
                </p>
              )}
            </div>


            <div>
              <label htmlFor="login-password" className={`ht-label${errors.password ? ' error' : ''}`}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-password" data-testid="auth-login-password"
                  type={showPw ? 'text' : 'password'}
                  className={`ht-input${errors.password ? ' error' : ''}`}
                  style={{ paddingLeft: '2.375rem', paddingRight: '2.75rem' }}
                  placeholder="Your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, lineHeight: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="field-error">
                  <span style={{ fontSize: '0.875rem' }}>⚠</span> {errors.password}
                </p>
              )}
            </div>

            <button data-testid="auth-login-submit" type="submit"
              disabled={loading} className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} strokeWidth={2.5} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.375rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

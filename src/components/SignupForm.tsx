'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getUserByEmail, createUser, saveSession } from '@/lib/storage';
import ThemeToggle from './ThemeToggle';

interface FieldErrors { name?: string; email?: string; password?: string; }

export default function SignupForm() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [loading, setLoading]   = useState(false);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!name.trim())     e.name     = 'Full name is required';
    if (!email.trim())    e.email    = 'Email address is required';
    if (!password)        e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const trimmed = email.trim().toLowerCase();
      if (getUserByEmail(trimmed)) {
        setErrors({ email: 'An account with this email already exists' });
        return;
      }
      const user = createUser(trimmed, password, name.trim());
      saveSession({ userId: user.id, email: user.email, name: user.name });
      router.replace('/dashboard');
    } finally { setLoading(false); }
  };

  const field = (
    id: string,
    testId: string,
    label: string,
    icon: React.ReactNode,
    value: string,
    onChange: (v: string) => void,
    errorKey: keyof FieldErrors,
    opts?: { type?: string; placeholder?: string; autoComplete?: string; showToggle?: boolean; showPw?: boolean; onToggle?: () => void },
  ) => (
    <div>
      <label htmlFor={id} className={`ht-label${errors[errorKey] ? ' error' : ''}`}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', lineHeight: 0 }}>
          {icon}
        </span>
        <input
          id={id} data-testid={testId}
          type={opts?.type === 'password' ? (opts.showPw ? 'text' : 'password') : (opts?.type ?? 'text')}
          className={`ht-input${errors[errorKey] ? ' error' : ''}`}
          style={{ paddingLeft: '2.375rem', paddingRight: opts?.showToggle ? '2.75rem' : undefined }}
          placeholder={opts?.placeholder ?? ''}
          value={value}
          onChange={e => { onChange(e.target.value); setErrors(prev => ({ ...prev, [errorKey]: undefined })); }}
          autoComplete={opts?.autoComplete}
        />
        {opts?.showToggle && (
          <button type="button" onClick={opts.onToggle} tabIndex={-1}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, lineHeight: 0 }}>
            {opts.showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {errors[errorKey] && (
        <p className="field-error"><span style={{ fontSize: '0.875rem' }}>⚠</span> {errors[errorKey]}</p>
      )}
    </div>
  );

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
            Create your account
          </h1>
          <p style={{ marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Start building better habits today
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-soft)', padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {field('signup-name',     'auth-signup-name',     'Full name',      <User2 size={15} />,  name,     setName,     'name',     { placeholder: 'John Doe',              autoComplete: 'name' })}
            {field('signup-email',    'auth-signup-email',    'Email address',  <Mail size={15} />,   email,    setEmail,    'email',    { type: 'email',   placeholder: 'you@example.com', autoComplete: 'email' })}
            {field('signup-password', 'auth-signup-password', 'Password',       <Lock size={15} />,   password, setPassword, 'password', { type: 'password', placeholder: 'At least 6 characters', autoComplete: 'new-password', showToggle: true, showPw, onToggle: () => setShowPw(v => !v) })}

            <button data-testid="auth-signup-submit" type="submit"
              disabled={loading} className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account…' : <><span>Create account</span><ArrowRight size={16} strokeWidth={2.5} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.375rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Flame, Trash2 } from 'lucide-react';
import { Session } from '@/types/auth';
import { Habit, FrequencyType } from '@/types/habit';
import { getHabitsByUser, clearSession, createHabit, updateHabit, deleteHabit } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import { calculateCurrentStreak } from '@/lib/streaks';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';
import ProfilePage from './ProfilePage';
import ThemeToggle from './ThemeToggle';

interface Props { session: Session; }
type View = 'home' | 'profile';

function Logo() {
  return <img src="/logo.png" alt="Habitly" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />;
}

export default function Dashboard({ session }: Props) {
  const router = useRouter();
  const [habits, setHabits]         = useState<Habit[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [editingHabit, setEditing]  = useState<Habit | null>(null);
  const [deleteTarget, setDelete]   = useState<Habit | null>(null);
  const [view, setView]             = useState<View>('home');
  const [showSignOut, setShowSignOut] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(() => setHabits(getHabitsByUser(session.userId)), [session.userId]);

  useEffect(() => {
    load();
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator)
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    let bc: BroadcastChannel | null = null;
    try { bc = new BroadcastChannel('habitly-sync'); bc.onmessage = () => load(); } catch {}
    return () => bc?.close();
  }, [load]);

  const handleLogout = () => { clearSession(); router.replace('/login'); };
  const handleCreate = (name: string, desc: string, freq: FrequencyType, customDays?: number[]) => {
    createHabit(session.userId, name, desc, freq, customDays);
    load(); setShowForm(false);
  };
  const handleEdit = (name: string, desc: string, freq: FrequencyType, customDays?: number[]) => {
    if (!editingHabit) return;
    updateHabit({ ...editingHabit, name, description: desc, frequency: freq, customDays });
    load(); setEditing(null);
  };
  const handleToggle = (habit: Habit) => { updateHabit(toggleHabitCompletion(habit, today)); load(); };
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteHabit(deleteTarget.id); load(); setDelete(null);
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit   = (h: Habit) => { setEditing(h); setShowForm(false); };

  const doneToday   = habits.filter(h => h.completions.includes(today)).length;
  const totalStreak = habits.reduce((s, h) => s + calculateCurrentStreak(h.completions, today), 0);
  const pct = habits.length > 0 ? Math.round((doneToday / habits.length) * 100) : 0;


  const displayName = session.name
    ? session.name.split(' ')[0].charAt(0).toUpperCase() + session.name.split(' ')[0].slice(1)
    : session.email.split('@')[0];
  const initial = displayName.charAt(0).toUpperCase();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div data-testid="dashboard-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>


      <header className="top-nav">
        <div className="top-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Logo />
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Habitly
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle size="sm" />
            <button
              onClick={() => setView(v => v === 'profile' ? 'home' : 'profile')}
              aria-label="Profile"
              title={`${displayName} — click for profile`}
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'var(--brand)',
                border: view === 'profile' ? '2px solid var(--brand)' : 'none',
                outline: view === 'profile' ? '2px solid var(--brand)' : 'none',
                outlineOffset: 2,
                color: '#fff', fontWeight: 700, fontSize: '0.8125rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'opacity 0.15s',
              }}
            >
              {initial}
            </button>
          </div>
        </div>
      </header>


      <div className="app-shell">
        <div style={{ padding: '1.375rem 1.25rem 2.5rem' }}>

          
          {view === 'home' && (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{greeting}</p>
                <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15, marginTop: '0.1rem' }}>
                  {displayName}
                </h2>
              </div>


              {habits.length > 0 && (
                <div style={{
                  background: 'var(--brand)',
                  borderRadius: 18, padding: '1.125rem 1.25rem',
                  marginBottom: '1.25rem',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: 500, position: 'relative' }}>Today&apos;s progress</p>
                  <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', margin: '0.2rem 0 0.875rem', position: 'relative' }}>
                    {doneToday} / {habits.length} done
                  </p>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.22)', borderRadius: 99, position: 'relative' }}>
                    <div style={{ height: '100%', background: '#fff', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.76rem', marginTop: '0.45rem', position: 'relative' }}>
                    {pct === 100 ? '🎉 All habits done! Great work.' : `${100 - pct}% to go`}
                  </p>
                </div>
              )}


              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Your habits
                </h3>
                <button
                  data-testid="create-habit-button"
                  onClick={openCreate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.38rem 0.8rem', borderRadius: 99,
                    background: 'var(--brand)', color: '#fff',
                    fontWeight: 600, fontSize: '0.8rem',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '-0.01em',
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} /> New habit
                </button>
              </div>

              {habits.length === 0 && (
                <div data-testid="empty-state" style={{
                  textAlign: 'center', padding: '3rem 1.5rem',
                  border: '1.5px dashed var(--border)', borderRadius: 18,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, margin: '0 auto 1rem', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={22} strokeWidth={1.75} color="var(--brand)" />
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>No habits yet</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.3rem', marginBottom: '1.375rem' }}>
                    Create your first habit and start building momentum
                  </p>
                  <button onClick={openCreate} className="btn btn-primary" style={{ margin: '0 auto' }}>
                    <Plus size={15} strokeWidth={2.5} /> Create first habit
                  </button>
                </div>
              )}


              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {habits.map(h => (
                  <HabitCard key={h.id} habit={h} today={today}
                    onToggle={() => handleToggle(h)}
                    onEdit={() => openEdit(h)}
                    onDelete={() => setDelete(h)}
                  />
                ))}
              </div>
            </>
          )}

          {view === 'profile' && (
            <ProfilePage
              session={session} habits={habits} today={today}
              onBack={() => setView('home')}
              onLogout={() => setShowSignOut(true)}
            />
          )}
        </div>
      </div>


      {(showForm || editingHabit) && (
        <HabitForm
          key={editingHabit?.id ?? 'new'}
          initial={editingHabit}
          onSave={editingHabit ? handleEdit : handleCreate}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div className="modal-in" style={{ width: '100%', maxWidth: 320, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-soft)', padding: '1.75rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={20} strokeWidth={1.75} color="var(--danger)" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Delete habit?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.375rem 0 0' }}>
              <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>&ldquo;{deleteTarget.name}&rdquo;</strong>{' '}will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.5rem' }}>
              <button onClick={() => setDelete(null)} className="btn btn-ghost" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              <button data-testid="confirm-delete-button" onClick={handleDeleteConfirm} className="btn btn-danger" style={{ flex: 1, padding: '0.75rem' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSignOut && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div className="modal-in" style={{ width: '100%', maxWidth: 320, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-soft)', padding: '1.75rem 1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Sign out?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
              You&apos;ll need to sign in again to access your habits.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowSignOut(false)} className="btn btn-ghost" style={{ flex: 1, padding: '0.75rem' }}>Stay</button>
              <button data-testid="auth-logout-button" onClick={handleLogout} className="btn btn-danger" style={{ flex: 1, padding: '0.75rem' }}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

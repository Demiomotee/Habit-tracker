'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Home, User, Plus, LogOut, Flame, CheckCircle2, LayoutGrid, Trash2 } from 'lucide-react';
import { Session } from '@/types/auth';
import { Habit } from '@/types/habit';
import { getHabitsByUser, clearSession, createHabit, updateHabit, deleteHabit } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import { calculateCurrentStreak } from '@/lib/streaks';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';
import ThemeToggle from './ThemeToggle';

interface Props { session: Session; }

type ActiveTab = 'home' | 'profile';

// Logo mark reused inline
const LogoMark = ({ size = 32 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.38,
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 48 48" fill="none">
      <rect x="8" y="10" width="10" height="28" rx="5" fill="white" opacity="0.95"/>
      <rect x="30" y="10" width="10" height="28" rx="5" fill="white" opacity="0.95"/>
      <rect x="13" y="19" width="22" height="10" rx="5" fill="white" opacity="0.95"/>
      <circle cx="35" cy="36" r="4" fill="rgba(255,255,255,0.5)"/>
    </svg>
  </div>
);

export default function Dashboard({ session }: Props) {
  const router = useRouter();
  const [habits, setHabits]           = useState<Habit[]>([]);
  const [showForm, setShowForm]       = useState(false);
  const [editingHabit, setEditing]    = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [activeTab, setActiveTab]     = useState<ActiveTab>('home');
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(() => {
    setHabits(getHabitsByUser(session.userId));
  }, [session.userId]);

  useEffect(() => {
    load();
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [load]);

  const handleLogout = () => { clearSession(); router.replace('/login'); };

  const handleCreate = (name: string, desc: string) => {
    createHabit(session.userId, name, desc);
    load(); setShowForm(false);
  };
  const handleEdit = (name: string, desc: string) => {
    if (!editingHabit) return;
    updateHabit({ ...editingHabit, name, description: desc });
    load(); setEditing(null);
  };
  const handleToggle = (habit: Habit) => {
    updateHabit(toggleHabitCompletion(habit, today));
    load();
  };
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteHabit(deleteTarget.id);
    load(); setDeleteTarget(null);
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit   = (h: Habit) => { setEditing(h); setShowForm(false); };

  const doneToday  = habits.filter(h => h.completions.includes(today)).length;
  const totalStreak = habits.reduce((s, h) => s + calculateCurrentStreak(h.completions, today), 0);
  const pct = habits.length > 0 ? Math.round((doneToday / habits.length) * 100) : 0;
  const firstName  = session.email.split('@')[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const initial    = displayName.charAt(0).toUpperCase();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  // ── Shared nav item style helper ──
  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 3, padding: '4px 16px', borderRadius: 14, border: 'none',
    background: active ? 'var(--brand-light)' : 'transparent',
    color: active ? 'var(--brand)' : 'var(--text-muted)',
    cursor: 'pointer', transition: 'all 0.18s',
    fontFamily: 'inherit',
  });

  // ── Sidebar nav item ──
  const sideNavItem = (icon: React.ReactNode, label: string, tab: ActiveTab) => {
    const active = activeTab === tab;
    return (
      <button key={tab} onClick={() => setActiveTab(tab)} style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.7rem 1rem', borderRadius: 12, border: 'none',
        background: active ? 'var(--brand-light)' : 'transparent',
        color: active ? 'var(--brand)' : 'var(--text-secondary)',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        fontWeight: active ? 600 : 500, fontSize: '0.9rem',
        fontFamily: 'inherit', transition: 'all 0.18s',
      }}>
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div data-testid="dashboard-page" className="layout-root">

      {/* ── SIDEBAR (desktop only) ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogoMark size={36} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Habitly
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {sideNavItem(<Home size={18} strokeWidth={2} />, 'Home', 'home')}
          {sideNavItem(<User size={18} strokeWidth={2} />, 'Profile', 'profile')}
        </nav>

        {/* New habit button */}
        <div style={{ padding: '0 0.75rem 1rem' }}>
          <button onClick={openCreate} className="btn btn-primary" style={{ width: '100%', gap: '0.5rem', justifyContent: 'center' }}>
            <Plus size={18} strokeWidth={2.5} />
            New habit
          </button>
        </div>

        {/* Bottom: theme + logout */}
        <div style={{
          padding: '1rem 0.75rem 1.25rem',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <ThemeToggle size="sm" />
          <button onClick={handleLogout} data-testid="auth-logout-button"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.75rem', borderRadius: 10,
              border: '1.5px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
            }}>
            <LogOut size={15} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        {/* Mobile top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '0.875rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left: logo (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogoMark size={32} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Habitly
            </span>
          </div>
          {/* Right: theme toggle (visible always) + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ThemeToggle size="sm" />
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              letterSpacing: '0.01em',
            }}>
              {initial}
            </div>
          </div>
        </header>

        <div style={{ padding: '1.5rem 1.25rem', maxWidth: 700, margin: '0 auto' }}>
          {activeTab === 'home' && (
            <>
              {/* Greeting */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {greeting} 👋
                </p>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.625rem', color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.15, marginTop: '0.15rem' }}>
                  {displayName}
                </h2>
              </div>

              {/* Progress card */}
              {habits.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 60%, #a855f7 100%)',
                  borderRadius: 20, padding: '1.25rem 1.375rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Decorative blob */}
                  <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ position: 'absolute', right: 20, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 500, position: 'relative' }}>
                    Today's progress
                  </p>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0.875rem', position: 'relative' }}>
                    {doneToday}/{habits.length} habits done
                  </p>

                  {/* Progress bar */}
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, position: 'relative' }}>
                    <div style={{
                      height: '100%', background: '#fff',
                      borderRadius: 99, width: `${pct}%`,
                      transition: 'width 0.5s ease',
                      boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                    }} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginTop: '0.5rem', position: 'relative' }}>
                    {pct === 100 ? '🎉 All done! Amazing work.' : `${100 - pct}% left — keep going!`}
                  </p>
                </div>
              )}

              {/* Stats row */}
              {habits.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
                  {[
                    { icon: <LayoutGrid size={18} strokeWidth={2} />, value: habits.length, label: 'Total' },
                    { icon: <CheckCircle2 size={18} strokeWidth={2} />, value: doneToday, label: 'Done today' },
                    { icon: <Flame size={18} strokeWidth={2} />, value: totalStreak, label: 'Streak pts' },
                  ].map(({ icon, value, label }, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 16, padding: '0.875rem 0.75rem', textAlign: 'center',
                    }}>
                      <div style={{ color: 'var(--brand)', display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.375rem', color: 'var(--text-primary)' }}>{value}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Your habits
                </h3>
                {/* Mobile: FAB-style add button */}
                <button
                  data-testid="create-habit-button"
                  onClick={openCreate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.45rem 0.875rem', borderRadius: 10,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 3px 10px rgba(124,58,237,0.3)',
                  }}
                >
                  <Plus size={15} strokeWidth={3} /> New habit
                </button>
              </div>

              {/* Empty state */}
              {habits.length === 0 && (
                <div data-testid="empty-state" style={{
                  textAlign: 'center', padding: '3.5rem 1.5rem',
                  background: 'var(--bg-card)', border: '1.5px dashed var(--border)',
                  borderRadius: 20,
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20, margin: '0 auto 1.25rem',
                    background: 'var(--brand-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Flame size={28} strokeWidth={1.5} color="var(--brand)" />
                  </div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
                    No habits yet
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem', marginBottom: '1.5rem' }}>
                    Create your first habit and start building momentum
                  </p>
                  <button onClick={openCreate} className="btn btn-primary" style={{ margin: '0 auto' }}>
                    <Plus size={17} strokeWidth={2.5} /> Create first habit
                  </button>
                </div>
              )}

              {/* Habit list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {habits.map(h => (
                  <HabitCard
                    key={h.id} habit={h} today={today}
                    onToggle={() => handleToggle(h)}
                    onEdit={() => openEdit(h)}
                    onDelete={() => setDeleteTarget(h)}
                  />
                ))}
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="slide-up">
              {/* Profile header */}
              <div style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 24, margin: '0 auto 1rem',
                  background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 800, color: '#fff',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                }}>
                  {initial}
                </div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.375rem', color: 'var(--text-primary)' }}>
                  {displayName}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  {session.email}
                </p>
              </div>

              {/* Stats */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.25rem', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Overview
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {[
                    { label: 'Total habits', value: habits.length },
                    { label: 'Completed today', value: `${doneToday}/${habits.length}` },
                    { label: 'Total streak points', value: totalStreak },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                <button
                  data-testid="auth-logout-button"
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '1rem 1.25rem', border: 'none', background: 'transparent',
                    color: 'var(--danger)', fontWeight: 600, fontSize: '0.9375rem',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <LogOut size={18} strokeWidth={2} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-nav">
        <button onClick={() => setActiveTab('home')} style={navItemStyle(activeTab === 'home')}>
          <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.75} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Home</span>
        </button>

        {/* FAB center button */}
        <button
          onClick={openCreate}
          style={{
            width: 52, height: 52, borderRadius: 18,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            transition: 'transform 0.15s',
            marginBottom: 8,
          }}
          aria-label="Create new habit"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        <button onClick={() => setActiveTab('profile')} style={navItemStyle(activeTab === 'profile')}>
          <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 1.75} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Profile</span>
        </button>
      </nav>

      {/* ── HABIT FORM MODAL ── */}
      {(showForm || editingHabit) && (
        <HabitForm
          key={editingHabit?.id ?? 'new'}
          initial={editingHabit}
          onSave={editingHabit ? handleEdit : handleCreate}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="scale-in" style={{
            width: '100%', maxWidth: 360,
            background: 'var(--bg-card)', borderRadius: 24,
            border: '1px solid var(--border)', padding: '2rem',
            boxShadow: 'var(--shadow-lg)', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, margin: '0 auto 1.25rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={24} strokeWidth={1.75} color="var(--danger)" />
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
              Delete habit?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>&ldquo;{deleteTarget.name}&rdquo;</strong> and all its history will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
              <button data-testid="confirm-delete-button" onClick={handleDeleteConfirm} className="btn btn-danger" style={{ flex: 1 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface Props {
  initial?: Habit | null;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function HabitForm({ initial, onSave, onCancel }: Props) {
  const [name, setName]             = useState(initial?.name ?? '');
  const [description, setDesc]      = useState(initial?.description ?? '');
  const [nameError, setNameError]   = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initial?.name ?? '');
    setDesc(initial?.description ?? '');
    setNameError('');
    setTimeout(() => nameRef.current?.focus(), 80);
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateHabitName(name);
    if (!result.valid) { setNameError(result.error ?? 'Invalid'); return; }
    onSave(result.value, description.trim());
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
      }}
    >
      {/* Sheet — slides up from bottom on mobile, centered on desktop */}
      <div
        data-testid="habit-form"
        className="scale-in"
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg-card)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
          padding: '0 1.5rem 2rem',
          position: 'relative',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} strokeWidth={2} color="var(--brand)" />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
              {initial ? 'Edit habit' : 'New habit'}
            </h3>
          </div>
          <button onClick={onCancel} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Name */}
          <div>
            <label htmlFor="habit-name" className="ht-label">Habit name *</label>
            <input
              id="habit-name"
              ref={nameRef}
              data-testid="habit-name-input"
              type="text" className="ht-input"
              placeholder="e.g. Drink 8 glasses of water"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              maxLength={65}
            />
            {nameError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 500 }}>
                {nameError}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="habit-description" className="ht-label">Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              id="habit-description"
              data-testid="habit-description-input"
              type="text" className="ht-input"
              placeholder="Why does this matter to you?"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Frequency — readonly per spec */}
          <div>
            <label htmlFor="habit-frequency" className="ht-label">Frequency</label>
            <select
              id="habit-frequency"
              data-testid="habit-frequency-select"
              className="ht-input"
              value="daily"
              onChange={() => {}}
              style={{ cursor: 'default' }}
            >
              <option value="daily">Daily</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="button" onClick={onCancel} className="btn btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button data-testid="habit-save-button" type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {initial ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

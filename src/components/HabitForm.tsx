'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Habit, FrequencyType } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface Props {
  initial?: Habit | null;
  onSave: (name: string, description: string, frequency: FrequencyType, customDays?: number[]) => void;
  onCancel: () => void;
}

const FREQ_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: 'daily',    label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly',   label: 'Once a week' },
  { value: 'custom',   label: 'Custom' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FREQ_DESC: Record<FrequencyType, string> = {
  daily:    'Repeats every day',
  weekdays: 'Repeats Monday through Friday',
  weekends: 'Repeats Saturday and Sunday',
  weekly:   'Repeats once per week on the selected day',
  custom:   'Repeats on the selected days',
};

export default function HabitForm({ initial, onSave, onCancel }: Props) {
  const [name, setName]           = useState(initial?.name ?? '');
  const [desc, setDesc]           = useState(initial?.description ?? '');
  const [freq, setFreq]           = useState<FrequencyType>(initial?.frequency ?? 'daily');
  const [days, setDays]           = useState<number[]>(initial?.customDays ?? [1]);
  const [nameError, setNameError] = useState('');
  const [daysError, setDaysError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initial?.name ?? '');
    setDesc(initial?.description ?? '');
    setFreq(initial?.frequency ?? 'daily');
    setDays(initial?.customDays ?? [1]);
    setNameError(''); setDaysError('');
    setTimeout(() => nameRef.current?.focus(), 80);
  }, [initial]);

  const toggleDay = (d: number) => {
    if (freq === 'weekly') {
      // single-select
      setDays([d]);
    } else {
      // multi-select
      setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
    }
    setDaysError('');
  };

  const showDayPicker = freq === 'weekly' || freq === 'custom';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateHabitName(name);
    if (!result.valid) { setNameError(result.error ?? 'Invalid'); return; }
    if (showDayPicker && days.length === 0) { setDaysError('Please select at least one day'); return; }
    onSave(result.value, desc.trim(), freq, showDayPicker ? days : undefined);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        data-testid="habit-form"
        className="modal-in"
        style={{
          width: '100%', maxWidth: 440,
          background: 'var(--bg-card)',
          borderRadius: 22,
          border: '1px solid var(--border-soft)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.375rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sparkles size={16} strokeWidth={2} color="var(--brand)" />
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {initial ? 'Edit habit' : 'New habit'}
            </h3>
          </div>
          <button onClick={onCancel} aria-label="Close"
            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={13} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.125rem 1.375rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name */}
          <div>
            <label htmlFor="habit-name" className={`ht-label${nameError ? ' error' : ''}`}>Habit name</label>
            <input
              id="habit-name" ref={nameRef} data-testid="habit-name-input"
              type="text" className={`ht-input${nameError ? ' error' : ''}`}
              placeholder="e.g. Drink 8 glasses of water"
              value={name} onChange={e => { setName(e.target.value); setNameError(''); }}
              maxLength={65}
            />
            {nameError && <p className="field-error"><span>⚠</span> {nameError}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="habit-description" className="ht-label">
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="habit-description" data-testid="habit-description-input"
              type="text" className="ht-input"
              placeholder="Why does this matter to you?"
              value={desc} onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="ht-label">Frequency</label>
            {/* Hidden select for testid */}
            <select
              data-testid="habit-frequency-select"
              value={freq}
              onChange={e => { setFreq(e.target.value as FrequencyType); setDays([1]); }}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
              aria-hidden="true" tabIndex={-1}
            >
              {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Pill selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {FREQ_OPTIONS.map(opt => {
                const active = freq === opt.value;
                return (
                  <button key={opt.value} type="button"
                    onClick={() => { setFreq(opt.value); setDays(opt.value === 'weekly' ? [1] : [1,2,3,4,5]); setDaysError(''); }}
                    style={{
                      padding: '0.375rem 0.8rem', borderRadius: 99,
                      fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit',
                      border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border-soft)'}`,
                      background: active ? 'var(--brand-light)' : 'transparent',
                      color: active ? 'var(--brand)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.12s',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Day picker — shows for weekly (single) and custom (multi) */}
            {showDayPicker && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {freq === 'weekly' ? 'Select one day' : 'Select days'}
                </p>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {DAY_LABELS.map((d, i) => {
                    const on = days.includes(i);
                    return (
                      <button key={d} type="button" onClick={() => toggleDay(i)}
                        style={{
                          width: 40, height: 40, borderRadius: 10,
                          fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                          border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-soft)'}`,
                          background: on ? 'var(--brand)' : 'var(--bg-subtle)',
                          color: on ? '#fff' : 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all 0.12s',
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                {daysError && <p className="field-error" style={{ marginTop: '0.4rem' }}><span>⚠</span> {daysError}</p>}
              </div>
            )}

            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {FREQ_DESC[freq]}
              {freq === 'weekly' && days.length === 1 && ` — ${DAY_LABELS[days[0]]}s`}
              {freq === 'custom' && days.length > 0 && ` — ${days.map(d => DAY_LABELS[d]).join(', ')}`}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.125rem' }}>
            <button type="button" onClick={onCancel} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button data-testid="habit-save-button" type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {initial ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

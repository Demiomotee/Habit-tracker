'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface Props {
  initial?: Habit | null;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function HabitForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setNameError('');
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateHabitName(name);
    if (!result.valid) {
      setNameError(result.error ?? 'Invalid name');
      return;
    }
    setNameError('');
    onSave(result.value, description.trim());
  };

  return (
    <div
      data-testid="habit-form"
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--brand)',
        borderRadius: 16,
        padding: '1.25rem',
        marginBottom: '1rem',
        boxShadow: '0 0 0 4px rgba(34,197,94,0.06)',
      }}
    >
      <h4 style={{
        fontWeight: 700, fontSize: '0.95rem',
        color: 'var(--text-primary)', marginBottom: '1rem',
      }}>
        {initial ? '✏️ Edit Habit' : '✨ New Habit'}
      </h4>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="habit-name" className="label">Habit name *</label>
          <input
            id="habit-name"
            data-testid="habit-name-input"
            type="text"
            className="input"
            placeholder="e.g. Drink 8 glasses of water"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            maxLength={65}
            autoFocus
          />
          {nameError && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: 500 }}>
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="habit-description" className="label">Description (optional)</label>
          <input
            id="habit-description"
            data-testid="habit-description-input"
            type="text"
            className="input"
            placeholder="What does success look like?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="habit-frequency" className="label">Frequency</label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            className="input"
            value="daily"
            onChange={() => {}}
            style={{ cursor: 'default' }}
          >
            <option value="daily">Daily</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.7rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 10, fontWeight: 600, fontSize: '0.875rem',
              color: 'var(--text-primary)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            data-testid="habit-save-button"
            type="submit"
            style={{
              flex: 1, padding: '0.7rem',
              background: 'var(--brand)', border: 'none',
              borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
              color: '#fff', cursor: 'pointer',
            }}
          >
            {initial ? 'Save changes' : 'Create habit'}
          </button>
        </div>
      </form>
    </div>
  );
}

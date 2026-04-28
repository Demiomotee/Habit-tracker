import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }));
vi.mock('@/components/ThemeToggle', () => ({ default: () => <button aria-label="Toggle theme">🌙</button> }));
vi.mock('@/components/CalendarView', () => ({ default: () => <div data-testid="calendar-view" /> }));

import Dashboard from '@/components/Dashboard';
import { saveHabits, saveSession } from '@/lib/storage';
import { Session } from '@/types/auth';
import { Habit } from '@/types/habit';

const session: Session = { userId: 'user-1', email: 'test@test.com', name: 'Test User' };

const existingHabit: Habit = {
  id: 'habit-abc', userId: 'user-1', name: 'Drink Water',
  description: 'Stay hydrated', frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z', completions: [],
};

describe('habit form', () => {
  beforeEach(() => { localStorage.clear(); saveSession(session); mockReplace.mockClear(); });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<Dashboard session={session} />);
    await user.click(screen.getByTestId('create-habit-button'));
    await user.clear(screen.getByTestId('habit-name-input'));
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => expect(screen.getByText('Habit name is required')).toBeInTheDocument());
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    render(<Dashboard session={session} />);
    await user.click(screen.getByTestId('create-habit-button'));
    await user.type(screen.getByTestId('habit-name-input'), 'Morning Run');
    await user.type(screen.getByTestId('habit-description-input'), 'Run 5k every morning');
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => expect(screen.getByTestId('habit-card-morning-run')).toBeInTheDocument());
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    saveHabits([existingHabit]);
    render(<Dashboard session={session} />);
    await waitFor(() => expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument());

    await user.click(screen.getAllByLabelText('Habit options')[0]);
    await user.click(screen.getByTestId('habit-edit-drink-water'));
    await waitFor(() => expect(screen.getByTestId('habit-form')).toBeInTheDocument());

    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Drink More Water');
    await user.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => expect(screen.getByTestId('habit-card-drink-more-water')).toBeInTheDocument());

    const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') ?? '[]') as Habit[];
    const updated = habits.find(h => h.name === 'Drink More Water');
    expect(updated?.id).toBe(existingHabit.id);
    expect(updated?.userId).toBe(existingHabit.userId);
    expect(updated?.createdAt).toBe(existingHabit.createdAt);
    expect(updated?.completions).toEqual(existingHabit.completions);
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    saveHabits([existingHabit]);
    render(<Dashboard session={session} />);
    await waitFor(() => expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument());

    await user.click(screen.getAllByLabelText('Habit options')[0]);
    await user.click(screen.getByTestId('habit-delete-drink-water'));
    await waitFor(() => expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument());
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();

    await user.click(screen.getByTestId('confirm-delete-button'));
    await waitFor(() => expect(screen.queryByTestId('habit-card-drink-water')).not.toBeInTheDocument());
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    saveHabits([existingHabit]);
    render(<Dashboard session={session} />);
    await waitFor(() => expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument());

    await user.click(screen.getByTestId('habit-complete-drink-water'));
    await waitFor(() => expect(screen.getByTestId('habit-streak-drink-water').textContent).toContain('1'));

    await user.click(screen.getByTestId('habit-complete-drink-water'));
    await waitFor(() => expect(screen.getByTestId('habit-streak-drink-water').textContent).toContain('0'));
  });
});

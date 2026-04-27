import { User, Session } from '@/types/auth';
import { Habit } from '@/types/habit';

const KEYS = {
  USERS: 'habit-tracker-users',
  SESSION: 'habit-tracker-session',
  HABITS: 'habit-tracker-habits',
} as const;

// Users
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.USERS) ?? '[]');
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function createUser(email: string, password: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...getUsers(), user]);
  return user;
}

// Session
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    if (!raw || raw === 'null') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.setItem(KEYS.SESSION, 'null');
}

// Habits
export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.HABITS) ?? '[]');
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
}

export function getHabitsByUser(userId: string): Habit[] {
  return getHabits().filter((h) => h.userId === userId);
}

export function createHabit(
  userId: string,
  name: string,
  description: string
): Habit {
  const habit: Habit = {
    id: crypto.randomUUID(),
    userId,
    name,
    description,
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completions: [],
  };
  saveHabits([...getHabits(), habit]);
  return habit;
}

export function updateHabit(updated: Habit): void {
  const habits = getHabits().map((h) => (h.id === updated.id ? updated : h));
  saveHabits(habits);
}

export function deleteHabit(id: string): void {
  saveHabits(getHabits().filter((h) => h.id !== id));
}

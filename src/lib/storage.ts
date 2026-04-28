import { User, Session } from '@/types/auth';
import { Habit } from '@/types/habit';

const KEYS = {
  USERS:   'habit-tracker-users',
  SESSION: 'habit-tracker-session',
  HABITS:  'habit-tracker-habits',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === 'null') return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
  try {
    const bc = new BroadcastChannel('habitly-sync');
    bc.postMessage({ key, ts: Date.now() });
    bc.close();
  } catch { /* not available */ }
}

// ── Users ──────────────────────────────────────────
export function getUsers(): User[] {
  return read<User[]>(KEYS.USERS, []);
}

export function saveUsers(users: User[]): void {
  write(KEYS.USERS, users);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(email: string, password: string, name: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...getUsers(), user]);
  return user;
}

// ── Session ───────────────────────────────────────
export function getSession(): Session | null {
  return read<Session | null>(KEYS.SESSION, null);
}

export function saveSession(session: Session | null): void {
  write(KEYS.SESSION, session);
}

export function clearSession(): void {
  write(KEYS.SESSION, null);
}

// ── Habits ────────────────────────────────────────
export function getHabits(): Habit[] {
  return read<Habit[]>(KEYS.HABITS, []);
}

export function saveHabits(habits: Habit[]): void {
  write(KEYS.HABITS, habits);
}

export function getHabitsByUser(userId: string): Habit[] {
  return getHabits().filter(h => h.userId === userId);
}

export function createHabit(
  userId: string,
  name: string,
  description: string,
  frequency: Habit['frequency'] = 'daily',
  customDays?: number[],
): Habit {
  const habit: Habit = {
    id: crypto.randomUUID(),
    userId, name, description, frequency,
    ...(customDays ? { customDays } : {}),
    createdAt: new Date().toISOString(),
    completions: [],
  };
  saveHabits([...getHabits(), habit]);
  return habit;
}

export function updateHabit(updated: Habit): void {
  saveHabits(getHabits().map(h => h.id === updated.id ? updated : h));
}

export function deleteHabit(id: string): void {
  saveHabits(getHabits().filter(h => h.id !== id));
}

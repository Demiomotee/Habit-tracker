# Habit Tracker PWA — Stage 3

A mobile-first Habit Tracker Progressive Web App built to the exact Technical Requirements Document specification.

## Stack
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS v3 · localStorage · Vitest · React Testing Library · Playwright

## Setup & Run
```bash
npm install
npm run build
npm start          # http://localhost:3000
npm run dev        # development mode
```

## Tests
```bash
npm run test:unit          # vitest: unit + integration + coverage (94% line coverage)
npm run test:e2e           # playwright: 10 end-to-end tests
npm test                   # all of the above
```

## Coverage
94.07% line coverage on lib/ files (threshold: 80%). Report saved to /coverage after test:unit.

## Local Persistence
All state lives in localStorage under three keys:
- habit-tracker-users    → User[]
- habit-tracker-session  → Session | null
- habit-tracker-habits   → Habit[]

Each key stores JSON matching the exact shapes defined in the TRD (types/auth.ts, types/habit.ts).
Habits are scoped by userId — each user only sees their own habits.

## PWA
- public/manifest.json — name, short_name, icons, display:standalone, theme_color
- public/sw.js — cache-first service worker pre-caches the app shell
- Registered client-side in the Dashboard component
- After one load, the app renders offline without crashing

## Trade-offs
- Passwords stored as plaintext (acceptable for local-only demo scope per spec)
- Only daily frequency implemented (spec requirement)
- Cache-first SW means stale content until the SW updates

## Test File Map
| File | Verifies |
|------|---------|
| tests/unit/slug.test.ts | getHabitSlug: lowercase, hyphen, special chars |
| tests/unit/validators.test.ts | validateHabitName: empty, >60 chars, trimmed |
| tests/unit/streaks.test.ts | calculateCurrentStreak: empty, no-today, consecutive, duplicates, gaps |
| tests/unit/habits.test.ts | toggleHabitCompletion: add, remove, immutability, no duplicates |
| tests/integration/auth-flow.test.tsx | Signup/login flows, error messages, session creation |
| tests/integration/habit-form.test.tsx | Create/edit/delete/complete habits, validation |
| tests/e2e/app.spec.ts | Full user journeys: auth, CRUD, persistence, logout, offline |

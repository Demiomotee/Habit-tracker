# Habitly
A mobile-first Habit Tracker Progressive Web App built with Next.js + TypeScript + Tailwind CSS, implementing a full local-auth habit tracking system with streak tracking, frequency scheduling, and PWA offline support.

## Live Demo
**https://habit-tracker-seven-peach.vercel.app/**

## Repository
**https://github.com/Demiomotee/Habit-tracker**

## Setup Instructions
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

**Requirements:** Node.js 18+ recommended.

## Architecture
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        /login route
│   │   └── signup/page.tsx       /signup route
│   ├── dashboard/page.tsx        /dashboard route (protected)
│   ├── layout.tsx                Root layout + ThemeProvider
│   ├── page.tsx                  Splash screen + session redirect
│   └── globals.css               Design tokens, light/dark mode, utility classes
├── components/
│   ├── LoginForm.tsx             Email/password sign-in with inline field errors
│   ├── SignupForm.tsx            Name/email/password signup with inline field errors
│   ├── Dashboard.tsx             Home view + profile routing + modals
│   ├── HabitCard.tsx             Habit row with three-dot menu, streak badge, completion toggle
│   ├── HabitForm.tsx             Create/edit modal with frequency UX and day picker
│   ├── ProfilePage.tsx           Stats grid, completion calendar, sign-out
│   ├── CalendarView.tsx          Month calendar showing completed/skipped days
│   ├── SplashScreen.tsx          Animated splash with logo
│   ├── ThemeProvider.tsx         Light/dark context, persisted to localStorage
│   └── ThemeToggle.tsx           Sun/moon toggle button
├── lib/
│   ├── habits.ts                 toggleHabitCompletion — pure, immutable
│   ├── slug.ts                   getHabitSlug — deterministic URL-safe slugs
│   ├── storage.ts                localStorage abstraction (users, session, habits)
│   ├── streaks.ts                calculateCurrentStreak — consecutive day logic
│   └── validators.ts             validateHabitName — trim, length, empty checks
└── types/
    ├── auth.ts                   User, Session
    └── habit.ts                  Habit, FrequencyType
```

## Tech Stack
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS v3** for utility styling
- **Lucide React** for icons
- **localStorage** for all persistence
- **Vitest + React Testing Library** for unit and integration tests
- **Playwright** for end-to-end tests

## State Management
All state is local — no external library needed at this scope:
- `localStorage` for users, session, and habits under three fixed keys
- React `useState` for UI state within each component
- `BroadcastChannel` for cross-tab sync — changes in one tab reflect instantly in another
- Theme persisted to `localStorage` under `ht-theme`

## Local Persistence Structure
Three `localStorage` keys:

| Key | Shape |
|-----|-------|
| `habit-tracker-users` | `User[]` — id, email, password, name, createdAt |
| `habit-tracker-session` | `Session` or null — userId, email, name |
| `habit-tracker-habits` | `Habit[]` — id, userId, name, description, frequency, customDays, createdAt, completions |

Habits are scoped by `userId` — each user only sees their own habits. Completions are stored as `YYYY-MM-DD` date strings, deduplicated before streak calculation.

## Routing
Next.js App Router with four routes:

| Route | Behaviour |
|-------|-----------|
| `/` | Splash screen — checks session, redirects to `/dashboard` or `/login` |
| `/login` | Sign-in form — creates session on success |
| `/signup` | Sign-up form — creates user + session on success |
| `/dashboard` | Protected — redirects to `/login` if no valid session |

The dashboard renders two views inline (Home and Profile) via local state rather than separate routes, keeping navigation instant.

## Frequency Options
- **Every day** — all seven days
- **Weekdays** — Monday through Friday
- **Weekends** — Saturday and Sunday
- **Once a week** — single day picker, user selects one day
- **Custom** — multi-day picker, user selects any combination

## PWA Support
- `public/manifest.json` — name, icons, display standalone, theme color
- `public/sw.js` — cache-first service worker, pre-caches app shell on install
- Registered client-side on dashboard mount
- After one load, the app renders offline without crashing

## Testing
```bash
# Unit + integration tests with coverage
npm run test:unit

# End-to-end tests (requires running server)
npm start
npm run test:e2e

# All tests
npm test
```

Coverage threshold: **80% line coverage on `src/lib/`**. Achieved: **98.5%**.

| File | Verifies |
|------|---------|
| `tests/unit/slug.test.ts` | `getHabitSlug` — lowercase, hyphens, special chars |
| `tests/unit/validators.test.ts` | `validateHabitName` — empty, >60 chars, trimmed |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` — empty, no-today, consecutive, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` — add, remove, immutability, no duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup/login flows, session creation, error messages |
| `tests/integration/habit-form.test.tsx` | Create, edit, delete, complete habits, validation |
| `tests/e2e/app.spec.ts` | Full user journeys: splash, auth guard, CRUD, streak, reload, logout, offline |

## Trade-offs
**localStorage over a real backend** — simpler and fully deterministic. Accounts created on one device are local to that browser. Cross-device sync would require a server and database.

**Passwords stored as plaintext** — acceptable for a local-only demo with no server. A real app would hash with bcrypt server-side.

**BroadcastChannel for sync** — works across tabs in the same browser instantly. Falls back silently in environments where it is unavailable.

**No external state library** — `useState` per component with direct `localStorage` reads/writes handles this scope cleanly. Context is used only for theme.

**page.tsx naming** — Next.js App Router requires the file to be named `page.tsx` inside route folders. The folder name defines the URL: `login/page.tsx` → `/login`. This is a framework constraint, not a design choice.

## Accessibility
- Semantic HTML throughout
- All form fields have associated `<label>` elements
- All interactive elements use `<button>`
- Modals close on backdrop click
- Inline field errors use `className="field-error"` with `⚠` prefix for screen reader clarity
- Focus-visible styles for keyboard navigation
- `aria-label` on all icon-only buttons

## Features
- Inline field validation — red border + red label + error text under the field, matching iOS-style validation
- Three-dot dropdown on each habit card — edit and delete are hidden until needed
- Sign-out confirmation modal — no accidental logouts
- Habit completion calendar on profile page — navigable by month, completed days highlighted
- Stats grid on profile — Total habits, Done today, Streak points
- Real name used throughout — entered at signup, shown in greeting and profile
- BroadcastChannel cross-tab sync — open two tabs, complete a habit in one, the other updates

---

## Author
**Demiomotee**
https://github.com/Demiomotee

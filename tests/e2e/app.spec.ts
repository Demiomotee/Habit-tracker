import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

async function clearStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

async function seedUser(page: Page, email = 'e2e@test.com', password = 'testpass123') {
  await page.evaluate(({ email, password }) => {
    const users = JSON.parse(localStorage.getItem('habit-tracker-users') ?? '[]');
    users.push({ id: 'e2e-user-id', email, password, createdAt: new Date().toISOString() });
    localStorage.setItem('habit-tracker-users', JSON.stringify(users));
  }, { email, password });
}

async function seedSession(page: Page, email = 'e2e@test.com') {
  await page.evaluate((email) => {
    localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'e2e-user-id', email }));
  }, email);
}

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await clearStorage(page);
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.goto(BASE);
    await seedUser(page); await seedSession(page);
    await page.goto(BASE);
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.fill('[data-testid="auth-signup-email"]', `signup${Date.now()}@test.com`);
    await page.fill('[data-testid="auth-signup-password"]', 'mysecurepassword');
    await page.click('[data-testid="auth-signup-submit"]');
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    await page.goto(BASE);
    await seedUser(page, 'logintest@test.com', 'pass1234');
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-habits', JSON.stringify([{
        id: 'other-habit', userId: 'other-user-id', name: 'Other User Habit',
        description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [],
      }]));
    });
    await page.goto(`${BASE}/login`);
    await page.fill('[data-testid="auth-login-email"]', 'logintest@test.com');
    await page.fill('[data-testid="auth-login-password"]', 'pass1234');
    await page.click('[data-testid="auth-login-submit"]');
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByText('Other User Habit')).not.toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await page.goto(BASE);
    await seedUser(page); await seedSession(page);
    await page.goto(`${BASE}/dashboard`);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    await page.click('[data-testid="create-habit-button"]');
    await expect(page.getByTestId('habit-form')).toBeVisible();

    await page.fill('[data-testid="habit-name-input"]', 'Morning Run');
    await page.fill('[data-testid="habit-description-input"]', 'Run 5k every morning');
    await page.click('[data-testid="habit-save-button"]');

    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await page.goto(BASE);
    await seedUser(page); await seedSession(page);
    await page.goto(`${BASE}/dashboard`);

    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', 'Drink Water');
    await page.click('[data-testid="habit-save-button"]');
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();

    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('0');
    await page.click('[data-testid="habit-complete-drink-water"]');
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await page.goto(BASE);
    await seedUser(page); await seedSession(page);
    await page.goto(`${BASE}/dashboard`);

    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', 'Read Books');
    await page.click('[data-testid="habit-save-button"]');
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await page.goto(BASE);
    await seedUser(page); await seedSession(page);
    await page.goto(`${BASE}/dashboard`);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await page.click('[data-testid="auth-logout-button"]');
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    await page.goto(BASE);
    await seedUser(page); await seedSession(page);
    await page.goto(`${BASE}/dashboard`);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await page.waitForTimeout(1500);

    await context.setOffline(true);
    await page.goto(BASE);
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
    await context.setOffline(false);
  });
});

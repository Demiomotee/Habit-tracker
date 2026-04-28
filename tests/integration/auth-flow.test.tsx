import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('@/components/ThemeToggle', () => ({ default: () => <button aria-label="Toggle theme">🌙</button> }));

import LoginForm  from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { saveUsers, saveSession, getSession } from '@/lib/storage';
import { User } from '@/types/auth';

const existingUser: User = {
  id: 'user-existing', email: 'existing@test.com', password: 'password123',
  name: 'Test User', createdAt: new Date().toISOString(),
};

describe('auth flow', () => {
  beforeEach(() => { localStorage.clear(); mockReplace.mockClear(); });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-name'),     'Jane Doe');
    await user.type(screen.getByTestId('auth-signup-email'),    'newuser@test.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'securepass');
    await user.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('newuser@test.com');
    expect(session?.name).toBe('Jane Doe');
  });

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup();
    saveUsers([existingUser]);
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-name'),     'Someone');
    await user.type(screen.getByTestId('auth-signup-email'),    'existing@test.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'anypassword');
    await user.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => expect(screen.getByText(/already exists/i)).toBeInTheDocument());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup();
    saveUsers([existingUser]);
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'),    'existing@test.com');
    await user.type(screen.getByTestId('auth-login-password'), 'password123');
    await user.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.userId).toBe('user-existing');
  });

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup();
    saveUsers([existingUser]);
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'),    'existing@test.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrongpassword');
    await user.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => expect(screen.getByText('Invalid email or password')).toBeInTheDocument());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

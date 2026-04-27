import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '@/lib/streaks';

/* MENTOR_TRACE_STAGE3_HABIT_A91 */

describe('calculateCurrentStreak', () => {
  const today = '2024-01-15';
  const yesterday = '2024-01-14';
  const twoDaysAgo = '2024-01-13';
  const threeDaysAgo = '2024-01-12';

  it('returns 0 when completions is empty', () => {
    expect(calculateCurrentStreak([], today)).toBe(0);
  });

  it('returns 0 when today is not completed', () => {
    expect(calculateCurrentStreak([yesterday], today)).toBe(0);
    expect(calculateCurrentStreak([yesterday, twoDaysAgo], today)).toBe(0);
  });

  it('returns the correct streak for consecutive completed days', () => {
    expect(calculateCurrentStreak([today], today)).toBe(1);
    expect(calculateCurrentStreak([today, yesterday], today)).toBe(2);
    expect(calculateCurrentStreak([today, yesterday, twoDaysAgo], today)).toBe(3);
    expect(calculateCurrentStreak([today, yesterday, twoDaysAgo, threeDaysAgo], today)).toBe(4);
  });

  it('ignores duplicate completion dates', () => {
    expect(calculateCurrentStreak([today, today, today], today)).toBe(1);
    expect(calculateCurrentStreak([today, yesterday, yesterday], today)).toBe(2);
  });

  it('breaks the streak when a calendar day is missing', () => {
    // today + two days ago (yesterday is missing) => streak = 1
    expect(calculateCurrentStreak([today, twoDaysAgo], today)).toBe(1);
    // today + three days ago (gap of 2) => streak = 1
    expect(calculateCurrentStreak([today, threeDaysAgo], today)).toBe(1);
  });
});

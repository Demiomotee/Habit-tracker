export function calculateCurrentStreak(completions: string[], today?: string): number {
  const todayDate = today ?? new Date().toISOString().split('T')[0];

  // Remove duplicates and sort descending
  const unique = [...new Set(completions)].sort().reverse();

  if (!unique.includes(todayDate)) return 0;

  let streak = 0;
  let current = new Date(todayDate);

  for (const date of unique) {
    const d = new Date(current);
    d.setHours(0, 0, 0, 0);
    const check = new Date(date);
    check.setHours(0, 0, 0, 0);

    if (check.getTime() === d.getTime()) {
      streak++;
      current = new Date(d);
      current.setDate(current.getDate() - 1);
    } else if (check.getTime() < d.getTime()) {
      break;
    }
  }

  return streak;
}

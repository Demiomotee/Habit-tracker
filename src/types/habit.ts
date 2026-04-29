export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export type Habit = {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: FrequencyType;
  customDays?: number[];
  createdAt: string;
  completions: string[];
};

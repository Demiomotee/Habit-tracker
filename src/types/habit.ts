export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export type Habit = {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: FrequencyType;
  customDays?: number[]; // 0=Sun,1=Mon,...,6=Sat for custom frequency
  createdAt: string;
  completions: string[];
};

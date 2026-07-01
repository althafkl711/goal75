export interface WeightLog {
  id: string;
  value: number;
  time: string; // ISO String (date + time)
  type: 'Morning' | 'Night';
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  goalWeight: number;
  startWeight: number;
  createdAt: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  icon: string;
  description: string;
  estimatedCalories: number;
  duration: string;
  date: string; // YYYY-MM-DD
}

export interface UserSettings {
  notificationsEnabled: boolean;
  morningReminder: boolean;
  afternoonReminder: boolean;
  eveningReminder: boolean;
}

export interface Goal75Data {
  profile: UserProfile | null;
  weights: WeightLog[];
  completedChallenges: string[]; // List of challenge IDs completed
  settings: UserSettings;
}

import type { DailyChallenge } from '../types';

export const ALL_CHALLENGES: DailyChallenge[] = [
  {
    id: 'c1',
    title: '15 Pushups',
    icon: '💪',
    description: 'Keep your core tight and elbows tucked at 45 degrees.',
    estimatedCalories: 8,
    duration: '30 seconds',
    date: ''
  },
  {
    id: 'c2',
    title: '30 Squats',
    icon: '🦵',
    description: 'Drop your hips below parallel and keep your chest up.',
    estimatedCalories: 12,
    duration: '1 minute',
    date: ''
  },
  {
    id: 'c3',
    title: '45 Second Plank',
    icon: '🔥',
    description: 'Keep a straight line from head to heels. Squeeze your glutes.',
    estimatedCalories: 6,
    duration: '45 seconds',
    date: ''
  },
  {
    id: 'c4',
    title: '50 Jumping Jacks',
    icon: '⚡',
    description: 'Soft landing on the balls of your feet. Maintain a steady rhythm.',
    estimatedCalories: 15,
    duration: '1 minute',
    date: ''
  },
  {
    id: 'c5',
    title: '20 Lunges',
    icon: '🚶',
    description: 'Step forward and drop your back knee. 10 reps each leg.',
    estimatedCalories: 10,
    duration: '1 minute',
    date: ''
  },
  {
    id: 'c6',
    title: '30 High Knees',
    icon: '🏃',
    description: 'Drive knees up to hip height at a rapid pace.',
    estimatedCalories: 14,
    duration: '45 seconds',
    date: ''
  },
  {
    id: 'c7',
    title: '10 Burpees',
    icon: '💥',
    description: 'Full chest to floor, then explode up with a jump. Focus on form!',
    estimatedCalories: 15,
    duration: '45 seconds',
    date: ''
  }
];

export const getChallengeForDate = (dateStr: string): { today: DailyChallenge; tomorrow: DailyChallenge } => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  
  // Create a stable seed from date
  const seed = day + month * 31 + year;
  
  const todayIndex = seed % ALL_CHALLENGES.length;
  const tomorrowIndex = (seed + 1) % ALL_CHALLENGES.length;
  
  return {
    today: { ...ALL_CHALLENGES[todayIndex], date: dateStr },
    tomorrow: { ...ALL_CHALLENGES[tomorrowIndex], date: new Date(d.getTime() + 86400000).toISOString().split('T')[0] }
  };
};
export const getChallengeTitle = (id: string): string => {
  const challenge = ALL_CHALLENGES.find(c => c.id === id);
  return challenge ? `${challenge.icon} ${challenge.title}` : 'Workout Challenge';
};

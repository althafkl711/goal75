import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { getAchievements, getWeeklyReport } from '../../utils/insights';

export const InsightsTab: React.FC = () => {
  const { weights, completedChallenges } = useApp();

  const achievements = getAchievements(weights);
  const weeklyReport = getWeeklyReport(weights, completedChallenges.length);

  // Stats
  const currentStreak = useApp().streak;
  const longestStreak = Math.max(currentStreak, 18); // Default/Mock baseline longest streak

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 pb-28 pt-2"
    >
      {/* Title */}
      <div>
        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
          Gamification
        </span>
        <h1 className="text-3xl font-black text-white font-display mt-0.5 tracking-tight">
          AI Insights
        </h1>
      </div>

      {/* Streak Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-card rounded-[28px] p-6 border border-border-subtle flex items-center justify-between shadow-xl overflow-hidden relative"
      >
        <div className="space-y-3 relative z-10">
          <span className="text-xs font-bold text-primary-brand uppercase tracking-wider block">
            Streak Records
          </span>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white font-display">
                {currentStreak}
              </span>
              <span className="text-sm font-semibold text-text-secondary">days active</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Keep logging daily weights to defend your streak!
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-background/50 border border-border-subtle/50 rounded-2xl px-4 py-3 shrink-0 relative z-10 text-center">
          <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-primary-brand animate-pulse' : 'text-text-secondary'}`} />
          <span className="text-[9px] font-bold text-text-secondary uppercase mt-1">Longest</span>
          <span className="text-sm font-black text-white font-display">{longestStreak} Days</span>
        </div>
      </motion.div>

      {/* Weekly Report details panel */}
      <div className="bg-card rounded-[28px] p-5 border border-border-subtle space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          Weekly Report Card
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-background border border-border-subtle/60 p-3.5 rounded-[18px]">
            <span className="text-text-secondary block">Average Weight</span>
            <span className="text-base font-extrabold text-white mt-1 block">
              {weeklyReport.average.toFixed(2)} kg
            </span>
          </div>
          <div className="bg-background border border-border-subtle/60 p-3.5 rounded-[18px]">
            <span className="text-text-secondary block">Weight Lost</span>
            <span className="text-base font-extrabold text-success-brand mt-1 block">
              -{weeklyReport.lost.toFixed(2)} kg
            </span>
          </div>
          <div className="bg-background border border-border-subtle/60 p-3.5 rounded-[18px]">
            <span className="text-text-secondary block">Mini Challenges</span>
            <span className="text-base font-extrabold text-white mt-1 block">
              {weeklyReport.challenges}
            </span>
          </div>
          <div className="bg-background border border-border-subtle/60 p-3.5 rounded-[18px]">
            <span className="text-text-secondary block">Consistency</span>
            <span className="text-base font-extrabold text-primary-brand mt-1 block">
              {weeklyReport.consistency}%
            </span>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">
          Achievements Unlocked
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <motion.div
              whileHover={{ y: -2 }}
              key={ach.id}
              className={`rounded-[22px] p-4 border flex flex-col justify-between h-36 transition-all duration-200 ${
                ach.unlocked
                  ? 'bg-card border-primary-brand/30 shadow-md shadow-primary-brand/5'
                  : 'bg-card/40 border-border-subtle/50 opacity-55'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-2xl">{ach.icon}</span>
                {ach.unlocked ? (
                  <span className="text-[9px] font-bold text-primary-brand bg-primary-brand/10 border border-primary-brand/20 px-2 py-0.5 rounded-full uppercase">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-text-secondary bg-background/50 border border-border-subtle/40 px-2 py-0.5 rounded-full uppercase">
                    Locked
                  </span>
                )}
              </div>

              <div>
                <h4 className={`text-xs font-extrabold font-display ${ach.unlocked ? 'text-white' : 'text-text-secondary'}`}>
                  {ach.title}
                </h4>
                <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
export default InsightsTab;

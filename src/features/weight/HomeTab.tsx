import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Award, BarChart3, TrendingDown, TrendingUp, Minus, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { AnimatedCounter } from '../../components/animations/AnimatedCounter';
import { getChallengeForDate } from '../../utils/challenges';
import { generateInsights, getWeeklyReport } from '../../utils/insights';

interface HomeTabProps {
  onOpenRecord: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onOpenRecord }) => {
  const { 
    profile, 
    weights, 
    completedChallenges, 
    completeChallengeId
  } = useApp();

  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  const nowStr = new Date().toISOString().split('T')[0];
  const { today, tomorrow } = getChallengeForDate(nowStr);

  const isChallengeCompleted = completedChallenges.includes(today.id);

  // Sort weights desc to find latest logs
  const sortedWeights = [...weights].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const currentWeight = sortedWeights[0]?.value || profile?.startWeight || 90;
  const goalWeight = profile?.goalWeight || 80;
  const startWeight = profile?.startWeight || 90;

  // Trend analysis (difference from previous log)
  const trend = sortedWeights.length >= 2 
    ? parseFloat((sortedWeights[0].value - sortedWeights[1].value).toFixed(2))
    : 0;

  const remaining = Math.max(0, currentWeight - goalWeight);
  
  // Progress bar percent calculation
  const totalDistance = Math.abs(startWeight - goalWeight);
  const progressPercent = totalDistance > 0 
    ? Math.max(0, Math.min(100, ((startWeight - currentWeight) / totalDistance) * 100))
    : 0;

  const insights = generateInsights(weights, profile, completedChallenges.length);
  const weeklyReport = getWeeklyReport(weights, completedChallenges.length);

  // Auto-rotate insights stack
  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setActiveInsightIndex((prev) => (prev + 1) % insights.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [insights.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 pb-28 pt-2"
    >
      {/* Welcome & Brand Header */}
      <div className="relative">
        <div className="pulse-glow-bg top-[-65px] left-[50%] -translate-x-1/2" />
        <div className="flex flex-col items-center justify-center text-center relative z-10 pt-4 pb-2">
          <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold">
            Welcome back, {profile?.name || 'Champion'}
          </span>
          
          {/* Logo Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.05 }}
            className="w-14 h-14 bg-card border border-border-subtle rounded-[18px] flex items-center justify-center text-2xl shadow-xl glow-primary my-3"
          >
            ⚖️
          </motion.div>

          <h1 className="text-2xl font-black text-white font-display tracking-tight">
            Goal75
          </h1>
        </div>
      </div>

      {/* Primary Hero Progress Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full bg-card rounded-[28px] p-6 border border-border-subtle relative overflow-hidden glow-card"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Current Weight
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl font-black text-white font-display tracking-tight">
                <AnimatedCounter value={currentWeight} />
              </span>
              <span className="text-xl font-bold text-text-secondary">kg</span>
            </div>
          </div>

          {/* Today's Trend Pill */}
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border text-xs font-bold ${
            trend < 0 
              ? 'bg-success-brand/10 border-success-brand/20 text-success-brand'
              : trend > 0
              ? 'bg-danger-brand/10 border-danger-brand/20 text-danger-brand'
              : 'bg-white/5 border-white/10 text-white'
          }`}>
            {trend < 0 ? (
              <>
                <TrendingDown size={14} />
                <span>{trend.toFixed(2)} kg today</span>
              </>
            ) : trend > 0 ? (
              <>
                <TrendingUp size={14} />
                <span>+{trend.toFixed(2)} kg today</span>
              </>
            ) : (
              <>
                <Minus size={14} />
                <span>Stable</span>
              </>
            )}
          </div>
        </div>

        {/* Targets block */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border-subtle/50 my-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
              Goal Target
            </span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {goalWeight.toFixed(1)} kg
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
              Remaining
            </span>
            <span className="text-base font-bold text-primary-brand mt-0.5 block">
              {remaining > 0 ? `${remaining.toFixed(2)} kg` : 'Completed! 🎉'}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary">
            <span>START ({startWeight.toFixed(1)} kg)</span>
            <span>{progressPercent.toFixed(0)}% TO GOAL</span>
          </div>
          <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border-subtle/40 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(3, progressPercent)}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-primary-brand rounded-full glow-primary"
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenRecord}
          className="bg-card hover:bg-card/85 text-white py-3.5 px-2 rounded-[20px] flex flex-col items-center justify-center gap-1.5 border border-border-subtle transition-all duration-200 cursor-pointer text-center group"
        >
          <div className="w-8 h-8 rounded-full bg-primary-brand/10 text-primary-brand flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Plus size={16} />
          </div>
          <span className="text-[10px] font-bold text-white">Record Weight</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('challenge-card');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="bg-card hover:bg-card/85 text-white py-3.5 px-2 rounded-[20px] flex flex-col items-center justify-center gap-1.5 border border-border-subtle transition-all duration-200 cursor-pointer text-center group"
        >
          <div className="w-8 h-8 rounded-full bg-success-brand/10 text-success-brand flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Award size={16} />
          </div>
          <span className="text-[10px] font-bold text-white">Daily Boost</span>
        </button>

        <button
          onClick={() => setShowWeeklyReport(true)}
          className="bg-card hover:bg-card/85 text-white py-3.5 px-2 rounded-[20px] flex flex-col items-center justify-center gap-1.5 border border-border-subtle transition-all duration-200 cursor-pointer text-center group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <BarChart3 size={16} />
          </div>
          <span className="text-[10px] font-bold text-white">Weekly Report</span>
        </button>
      </div>

      {/* AI Insights Card Stack (Automatic & Interactive Slider) */}
      {insights.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Today's Insights
            </h3>
            <div className="flex gap-1">
              {insights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveInsightIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    activeInsightIndex === idx ? 'bg-primary-brand w-3' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden min-h-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeInsightIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full bg-card rounded-[22px] p-4 border border-border-subtle flex gap-4 items-center cursor-pointer"
                onClick={() => setActiveInsightIndex((prev) => (prev + 1) % insights.length)}
              >
                <div className="text-3xl bg-background w-12 h-12 rounded-xl flex items-center justify-center border border-border-subtle/50 shadow-inner">
                  {insights[activeInsightIndex].emoji}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white font-display">
                    {insights[activeInsightIndex].title}
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    {insights[activeInsightIndex].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Daily Challenge Card (Today's Boost) */}
      <div 
        id="challenge-card"
        className="w-full bg-card rounded-[28px] p-5 border border-border-subtle space-y-4"
      >
        <div className="flex justify-between items-center pb-3 border-b border-border-subtle/50">
          <div>
            <span className="text-[10px] font-bold text-primary-brand uppercase tracking-widest block">
              Today's Boost
            </span>
            <h3 className="text-lg font-extrabold text-white font-display mt-0.5">
              Daily Challenge
            </h3>
          </div>
          <span className="text-2xl">{today.icon}</span>
        </div>

        <div className="space-y-2">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            {today.title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {today.description}
          </p>
        </div>

        {/* Stats columns */}
        <div className="grid grid-cols-2 gap-4 bg-background/50 p-3 rounded-xl border border-border-subtle/40 text-xs">
          <div>
            <span className="text-text-secondary block">Est. Calories</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">
              {today.estimatedCalories} kcal
            </span>
          </div>
          <div>
            <span className="text-text-secondary block">Estimated Duration</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">
              {today.duration}
            </span>
          </div>
        </div>

        {/* Complete Toggle Button */}
        <div>
          {isChallengeCompleted ? (
            <div className="w-full bg-success-brand/10 border border-success-brand/30 text-success-brand py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
              <Check size={16} strokeWidth={3} />
              Completed for Today!
            </div>
          ) : (
            <button
              onClick={() => completeChallengeId(today.id)}
              className="w-full bg-primary-brand text-black hover:opacity-95 py-3.5 rounded-xl font-bold transition-all duration-200 cursor-pointer text-sm font-display flex items-center justify-center gap-1.5 shadow-md shadow-primary-brand/5 hover:shadow-primary-brand/15"
            >
              Mark Complete
            </button>
          )}
        </div>

        {/* Peeks for Tomorrow */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle/30 text-xs">
          <span className="text-text-secondary font-semibold">Tomorrow's Routine</span>
          <span className="text-white font-semibold flex items-center gap-1">
            {tomorrow.icon} {tomorrow.title} <ChevronRight size={14} className="text-text-secondary" />
          </span>
        </div>
      </div>

      {/* Weekly Report Modal overlay */}
      <AnimatePresence>
        {showWeeklyReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWeeklyReport(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border-subtle rounded-[28px] p-6 shadow-2xl z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white font-display">Weekly Summary</h3>
                <button
                  onClick={() => setShowWeeklyReport(false)}
                  className="p-1.5 rounded-full bg-background border border-border-subtle text-text-secondary hover:text-white cursor-pointer"
                >
                  <Check size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border-subtle/40">
                  <span className="text-sm text-text-secondary">Average Weight</span>
                  <span className="text-base font-bold text-white">
                    {weeklyReport.average.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle/40">
                  <span className="text-sm text-text-secondary">Weight Lost</span>
                  <span className="text-base font-bold text-success-brand">
                    -{weeklyReport.lost.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle/40">
                  <span className="text-sm text-text-secondary">Challenges Completed</span>
                  <span className="text-base font-bold text-white">
                    {weeklyReport.challenges}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle/40">
                  <span className="text-sm text-text-secondary">Consistency Score</span>
                  <span className="text-base font-bold text-primary-brand">
                    {weeklyReport.consistency}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-text-secondary">Overall Health Score</span>
                  <span className="text-base font-bold text-success-brand">
                    {weeklyReport.healthScore}/100
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-text-secondary">
                Weekly stats are computed from the last 7 calendar days.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default HomeTab;

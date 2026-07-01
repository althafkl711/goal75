import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Scale } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { WeightChart } from '../../components/charts/WeightChart';
import { AnimatedCounter } from '../../components/animations/AnimatedCounter';
import { getStatsSummary } from '../../utils/insights';

export const ProgressTab: React.FC = () => {
  const { weights, profile } = useApp();

  const { highest, lowest, average } = getStatsSummary(weights);
  const goalWeight = profile?.goalWeight || 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 pb-28 pt-2"
    >
      {/* Title Header */}
      <div>
        <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
          Analytics
        </span>
        <h1 className="text-3xl font-black text-white font-display mt-0.5 tracking-tight">
          Progress Graph
        </h1>
      </div>

      {/* Graph Area Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-card rounded-[28px] p-5 border border-border-subtle shadow-xl space-y-4"
      >
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Weight Trend</h3>
            <p className="text-[10px] text-text-secondary">Actual vs. 3-Point Moving Average</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-success-brand bg-success-brand/10 px-2.5 py-1 rounded-full border border-success-brand/20">
            <TrendingDown size={12} />
            <span>Down from Start</span>
          </div>
        </div>

        <WeightChart weights={weights} goalWeight={goalWeight} />
      </motion.div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Highest Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-[20px] p-3.5 border border-border-subtle flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
            Highest
          </span>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className="text-xl font-extrabold text-white font-display">
              {highest > 0 ? <AnimatedCounter value={highest} /> : '0.0'}
            </span>
            <span className="text-[10px] font-bold text-text-secondary">kg</span>
          </div>
        </motion.div>

        {/* Lowest Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-[20px] p-3.5 border border-border-subtle flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-success-brand uppercase tracking-wider block">
            Lowest
          </span>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className="text-xl font-extrabold text-success-brand font-display">
              {lowest > 0 ? <AnimatedCounter value={lowest} /> : '0.0'}
            </span>
            <span className="text-[10px] font-bold text-success-brand">kg</span>
          </div>
        </motion.div>

        {/* Average Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-[20px] p-3.5 border border-border-subtle flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
            Average
          </span>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className="text-xl font-extrabold text-white font-display">
              {average > 0 ? <AnimatedCounter value={average} /> : '0.0'}
            </span>
            <span className="text-[10px] font-bold text-text-secondary">kg</span>
          </div>
        </motion.div>
      </div>

      {/* Target Milestone Highlight Card */}
      {weights.length >= 2 && profile && (
        <div className="w-full bg-card rounded-[24px] p-4 border border-border-subtle flex gap-4 items-center">
          <div className="bg-primary-brand/10 border border-primary-brand/20 w-10 h-10 rounded-xl flex items-center justify-center text-primary-brand">
            <Scale size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
              Overall Journey
            </span>
            <span className="text-xs font-semibold text-white mt-0.5 block leading-relaxed">
              You have logged <span className="text-primary-brand">{weights.length} entries</span>. 
              {weights[weights.length - 1].value < weights[0].value ? (
                <> You are currently down <span className="text-success-brand font-bold">{(weights[0].value - weights[weights.length - 1].value).toFixed(2)} kg</span> from your initial weigh-in!</>
              ) : (
                ' Keep consistent to kickstart your downward trend.'
              )}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default ProgressTab;

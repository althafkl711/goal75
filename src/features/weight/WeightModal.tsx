import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sun, Moon } from 'lucide-react';
import { useApp } from '../../app/AppContext';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeightModal: React.FC<WeightModalProps> = ({ isOpen, onClose }) => {
  const { addWeightLog, weights } = useApp();
  const [value, setValue] = useState('');
  const [type, setType] = useState<'Morning' | 'Night'>('Morning');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill with last logged weight to make logging faster!
  React.useEffect(() => {
    if (isOpen && weights.length > 0) {
      const sorted = [...weights].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setValue(sorted[0].value.toString());
      setNotes('');
      setType(new Date().getHours() >= 17 ? 'Night' : 'Morning');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, weights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(value);
    if (isNaN(weightNum) || weightNum <= 0) return;

    setIsSubmitting(true);
    try {
      await addWeightLog(weightNum, type, notes, date);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-md bg-card rounded-[28px] overflow-hidden shadow-2xl border border-border-subtle p-6 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white font-display">Record Weight</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-background border border-border-subtle text-text-secondary hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Weight Input Display */}
              <div className="flex flex-col items-center justify-center py-4 bg-background rounded-2xl border border-border-subtle">
                <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold mb-1">
                  Kilograms
                </span>
                <div className="flex items-baseline justify-center">
                  <input
                    type="number"
                    step="0.05"
                    placeholder="0.0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoFocus
                    className="bg-transparent text-5xl font-black text-center text-primary-brand focus:outline-none w-48 font-display"
                  />
                  <span className="text-xl font-bold text-white ml-1">kg</span>
                </div>
              </div>

              {/* Time of Day Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-background p-1.5 rounded-2xl border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setType('Morning')}
                  className={`relative flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 ${
                    type === 'Morning'
                      ? 'bg-card text-primary-brand shadow-md border border-border-subtle/50'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <Sun size={16} />
                  Morning
                </button>
                <button
                  type="button"
                  onClick={() => setType('Night')}
                  className={`relative flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 ${
                    type === 'Night'
                      ? 'bg-card text-primary-brand shadow-md border border-border-subtle/50'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <Moon size={16} />
                  Night
                </button>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Calendar size={14} /> Log Date
                </label>
                <input
                  type="date"
                  value={date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-primary-brand focus:outline-none cursor-pointer"
                />
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Notes / Feelings
                </label>
                <textarea
                  placeholder="e.g. Completed morning run, felt energetic"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:border-primary-brand focus:outline-none resize-none"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-brand hover:opacity-90 disabled:opacity-50 text-black py-4 rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-primary-brand/10 hover:shadow-primary-brand/20 font-display flex items-center justify-center gap-2 text-base"
              >
                {isSubmitting ? 'Logging...' : 'Save Log Entry'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default WeightModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Trash2, Edit2, MessageSquare, Calendar } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import type { WeightLog } from '../../types';

export const HistoryTab: React.FC = () => {
  const { weights, updateWeightLog, deleteWeightLog } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  // Group weights by date
  const groupedWeights = React.useMemo(() => {
    const groups: { [key: string]: WeightLog[] } = {};
    
    // Sort descending (latest logs first)
    const sorted = [...weights].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    sorted.forEach((w) => {
      const datePart = w.time.split('T')[0];
      if (!groups[datePart]) {
        groups[datePart] = [];
      }
      groups[datePart].push(w);
    });
    
    return groups;
  }, [weights]);

  const getFriendlyDateLabel = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    
    const d = new Date(dateStr + 'T12:00:00.000Z'); // Pad with noon to avoid timezone shifts
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7 && daysDiff > 0) {
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleToggleExpand = (id: string, currentNotes = '') => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null);
    } else {
      setExpandedId(id);
      setEditingId(null);
      setNoteValue(currentNotes);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, id: string, currentNotes = '') => {
    e.stopPropagation();
    setEditingId(id);
    setNoteValue(currentNotes);
  };

  const handleSaveNotes = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await updateWeightLog(id, { notes: noteValue });
    setEditingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this weight log?')) {
      await deleteWeightLog(id);
      setExpandedId(null);
    }
  };

  const dates = Object.keys(groupedWeights);

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
          Timeline
        </span>
        <h1 className="text-3xl font-black text-white font-display mt-0.5 tracking-tight">
          Weight History
        </h1>
      </div>

      {weights.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-[28px] border border-border-subtle p-6 text-text-secondary text-sm">
          No logs found. Start by recording your weight!
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[2px] before:bg-border-subtle/50">
          {dates.map((dateStr) => (
            <div key={dateStr} className="space-y-3 relative">
              {/* Date Header Indicator */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-background border border-border-subtle flex items-center justify-center text-text-secondary z-10">
                  <Calendar size={14} />
                </div>
                <h3 className="text-sm font-bold text-white font-display">
                  {getFriendlyDateLabel(dateStr)}
                </h3>
              </div>

              {/* Entries for this day */}
              <div className="pl-12 space-y-2.5">
                {groupedWeights[dateStr].map((log) => {
                  const isExpanded = expandedId === log.id;
                  const isEditing = editingId === log.id;

                  return (
                    <motion.div
                      layout
                      key={log.id}
                      onClick={() => handleToggleExpand(log.id, log.notes)}
                      className={`bg-card border border-border-subtle rounded-2xl p-4 cursor-pointer hover:border-white/10 transition-all duration-200 shadow-md ${
                        isExpanded ? 'ring-1 ring-primary-brand/35 border-primary-brand/30' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {/* Morning / Night Tag */}
                          <div className={`p-2 rounded-xl flex items-center justify-center ${
                            log.type === 'Morning' 
                              ? 'bg-yellow-500/10 text-yellow-400' 
                              : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {log.type === 'Morning' ? <Sun size={14} /> : <Moon size={14} />}
                          </div>
                          
                          <div>
                            <span className="text-xs font-semibold text-text-secondary">
                              {log.type} entry
                            </span>
                            {log.notes && !isExpanded && (
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-primary-brand font-medium">
                                <MessageSquare size={10} />
                                <span className="truncate max-w-[150px]">{log.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Value display */}
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-black text-white font-display">
                            {log.value.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-text-secondary">kg</span>
                        </div>
                      </div>

                      {/* Expandable note and edit panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-4 pt-3 border-t border-border-subtle/50 space-y-3"
                            onClick={(e) => e.stopPropagation()} // Stop modal triggers inside panel
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  value={noteValue}
                                  onChange={(e) => setNoteValue(e.target.value)}
                                  className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-brand resize-none"
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-background text-text-secondary text-[10px] font-bold border border-border-subtle cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(e) => handleSaveNotes(e, log.id)}
                                    className="px-3 py-1.5 rounded-lg bg-primary-brand text-black text-[10px] font-bold cursor-pointer"
                                  >
                                    Save Notes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                                    Notes
                                  </span>
                                  <p className="text-xs text-white leading-relaxed">
                                    {log.notes || <span className="text-text-secondary italic">No notes added.</span>}
                                  </p>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={(e) => handleStartEdit(e, log.id, log.notes)}
                                    className="p-2 rounded-xl bg-background border border-border-subtle text-text-secondary hover:text-white cursor-pointer"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDelete(e, log.id)}
                                    className="p-2 rounded-xl bg-danger-brand/10 border border-danger-brand/20 text-danger-brand hover:bg-danger-brand/20 cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
export default HistoryTab;

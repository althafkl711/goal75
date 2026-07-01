import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldAlert, Bell, Database, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { resetToDefaults } from '../../services/firestore/db';
import { requestNotificationPermission } from '../../services/notifications/localNotifications';

export const ProfileTab: React.FC = () => {
  const { 
    profile, 
    settings, 
    updateProfileData, 
    updateSettingsData, 
    user,
    isAuthenticated,
    signOutUser
  } = useApp();

  // Profile forms state
  const [name, setName] = useState(profile?.name || '');
  const [startWeight, setStartWeight] = useState(profile?.startWeight?.toString() || '');
  const [goalWeight, setGoalWeight] = useState(profile?.goalWeight?.toString() || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state
  const [notifsEnabled, setNotifsEnabled] = useState(settings.notificationsEnabled);
  const [morningReminder, setMorningReminder] = useState(settings.morningReminder);
  const [afternoonReminder, setAfternoonReminder] = useState(settings.afternoonReminder);
  const [eveningReminder, setEveningReminder] = useState(settings.eveningReminder);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const startNum = parseFloat(startWeight);
    const goalNum = parseFloat(goalWeight);
    if (!name.trim() || isNaN(startNum) || isNaN(goalNum)) return;

    setIsSavingProfile(true);
    try {
      await updateProfileData({
        name,
        startWeight: startNum,
        goalWeight: goalNum
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleNotifications = async (val: boolean) => {
    setNotifsEnabled(val);
    if (val) {
      const granted = await requestNotificationPermission();
      await updateSettingsData({ notificationsEnabled: granted });
      if (!granted) setNotifsEnabled(false);
    } else {
      await updateSettingsData({ notificationsEnabled: false });
    }
  };

  const handleToggleReminder = async (type: 'morning' | 'afternoon' | 'evening', val: boolean) => {
    if (type === 'morning') {
      setMorningReminder(val);
      await updateSettingsData({ morningReminder: val });
    } else if (type === 'afternoon') {
      setAfternoonReminder(val);
      await updateSettingsData({ afternoonReminder: val });
    } else {
      setEveningReminder(val);
      await updateSettingsData({ eveningReminder: val });
    }
  };

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
          Configuration
        </span>
        <h1 className="text-3xl font-black text-white font-display mt-0.5 tracking-tight">
          Profile Settings
        </h1>
      </div>

      {/* Firebase Cloud Sync Panel */}
      <div className="bg-card rounded-[28px] p-5 border border-border-subtle space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border-subtle/50">
          <ShieldCheck size={14} className="text-primary-brand" /> Cloud Integration
        </h3>

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-background/50 p-3 rounded-2xl border border-border-subtle/40">
              <div className="w-10 h-10 rounded-full bg-primary-brand/10 border border-primary-brand/20 flex items-center justify-center text-primary-brand font-bold font-display text-sm uppercase">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {user?.displayName || 'User'}
                </span>
                <span className="text-[10px] text-text-secondary block truncate mt-0.5">
                  {user?.email}
                </span>
              </div>
              <span className="text-[9px] font-bold text-success-brand bg-success-brand/10 border border-success-brand/20 px-2 py-0.5 rounded-full uppercase shrink-0">
                Synced
              </span>
            </div>
            
            <button
              type="button"
              onClick={signOutUser}
              className="w-full bg-background hover:bg-white/5 border border-border-subtle text-white py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center"
            >
              Sign Out from Cloud
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex gap-3 items-start">
              <ShieldAlert className="text-yellow-400 shrink-0 mt-0.5" size={16} />
              <div>
                <h4 className="text-xs font-bold text-white">Running in Guest Mode</h4>
                <p className="text-[9px] text-text-secondary mt-1 leading-relaxed">
                  Your weight logs are saved locally. Connect an account to sync your weight logs securely to the cloud and enable cross-device support!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('goal75_guest_bypass');
                window.location.reload();
              }}
              className="w-full bg-primary-brand text-black hover:opacity-90 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center font-display"
            >
              Link Cloud Account
            </button>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-card rounded-[28px] p-5 border border-border-subtle space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border-subtle/50">
          <User size={14} /> Profile Parameters
        </h3>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-white text-xs font-semibold focus:border-primary-brand focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Start Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-white text-xs font-semibold focus:border-primary-brand focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Goal Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-white text-xs font-semibold focus:border-primary-brand focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingProfile}
          className={`w-full py-3 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-display ${
            saveSuccess 
              ? 'bg-success-brand text-black' 
              : 'bg-primary-brand text-black hover:opacity-90'
          }`}
        >
          {saveSuccess ? (
            'Profile Saved Successfully!'
          ) : (
            <>
              <Save size={14} />
              Save Configuration
            </>
          )}
        </button>
      </form>

      {/* Notifications toggles */}
      <div className="bg-card rounded-[28px] p-5 border border-border-subtle space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border-subtle/50">
          <Bell size={14} /> Reminders Schedule
        </h3>

        <div className="space-y-3.5">
          {/* Main Notifs Switch */}
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="text-xs font-bold text-white block">Push Notifications</span>
              <span className="text-[10px] text-text-secondary block mt-0.5">Enable weight log prompts</span>
            </div>
            <button
              onClick={() => handleToggleNotifications(!notifsEnabled)}
              className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                notifsEnabled ? 'bg-primary-brand' : 'bg-background border border-border-subtle'
              }`}
            >
              <div className={`w-4 h-4 rounded-full transition-transform duration-200 ${
                notifsEnabled ? 'translate-x-4 bg-black' : 'translate-x-0 bg-text-secondary'
              }`} />
            </button>
          </div>

          {/* Sub schedules */}
          {notifsEnabled && (
            <div className="pl-4 space-y-3.5 border-l border-border-subtle/50 mt-2">
              {/* Morning */}
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="text-xs font-bold text-white block">Morning Log Prompt</span>
                  <span className="text-[10px] text-text-secondary block">Good morning 🌤 let's record weight</span>
                </div>
                <button
                  onClick={() => handleToggleReminder('morning', !morningReminder)}
                  className={`w-9 h-5.5 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                    morningReminder ? 'bg-primary-brand' : 'bg-background border border-border-subtle'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                    morningReminder ? 'translate-x-3.5 bg-black' : 'translate-x-0 bg-text-secondary'
                  }`} />
                </button>
              </div>

              {/* Afternoon */}
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="text-xs font-bold text-white block">Afternoon Boost Challenge</span>
                  <span className="text-[10px] text-text-secondary block">2 minutes. 20 squats. Ready?</span>
                </div>
                <button
                  onClick={() => handleToggleReminder('afternoon', !afternoonReminder)}
                  className={`w-9 h-5.5 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                    afternoonReminder ? 'bg-primary-brand' : 'bg-background border border-border-subtle'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                    afternoonReminder ? 'translate-x-3.5 bg-black' : 'translate-x-0 bg-text-secondary'
                  }`} />
                </button>
              </div>

              {/* Evening */}
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="text-xs font-bold text-white block">Evening Motivation</span>
                  <span className="text-[10px] text-text-secondary block">Walk suggestion for weekly goal</span>
                </div>
                <button
                  onClick={() => handleToggleReminder('evening', !eveningReminder)}
                  className={`w-9 h-5.5 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                    eveningReminder ? 'bg-primary-brand' : 'bg-background border border-border-subtle'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                    eveningReminder ? 'translate-x-3.5 bg-black' : 'translate-x-0 bg-text-secondary'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Developer/Testing Tools */}
      <div className="bg-card rounded-[28px] p-5 border border-border-subtle space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border-subtle/50">
          <Database size={14} /> Developer Tools
        </h3>

        <button
          onClick={() => {
            if (confirm('This will wipe all local weight history and make the app completely clean. Proceed?')) {
              resetToDefaults();
            }
          }}
          className="w-full bg-danger-brand/10 hover:bg-danger-brand/20 border border-danger-brand/35 text-danger-brand py-3.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-display"
        >
          <RotateCcw size={14} />
          Wipe All Data
        </button>
      </div>
    </motion.div>
  );
};
export default ProfileTab;

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './app/AppContext';
import { Navbar } from './components/layout/Navbar';
import type { TabType } from './components/layout/Navbar';
import { HomeTab } from './features/weight/HomeTab';
import { ProgressTab } from './features/weight/ProgressTab';
import { HistoryTab } from './features/weight/HistoryTab';
import { InsightsTab } from './features/weight/InsightsTab';
import { ProfileTab } from './features/weight/ProfileTab';
import { WeightModal } from './features/weight/WeightModal';
import { AuthScreen } from './features/auth/AuthScreen';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [guestBypass, setGuestBypass] = useState(false);
  const { isLoading, isAuthenticated } = useApp();

  // Read guest bypass status from localStorage
  useEffect(() => {
    const hasBypassed = localStorage.getItem('goal75_guest_bypass') === 'true';
    if (hasBypassed) {
      setGuestBypass(true);
    }
  }, []);

  const handleGuestAccess = () => {
    localStorage.setItem('goal75_guest_bypass', 'true');
    setGuestBypass(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary-brand border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest animate-pulse">
          Loading Goal75...
        </span>
      </div>
    );
  }

  // Show Auth Welcome Gate if not signed in and has not bypassed as guest
  if (!isAuthenticated && !guestBypass) {
    return <AuthScreen onGuestAccess={handleGuestAccess} />;
  }

  return (
    <div className="min-h-screen bg-background flex justify-center selection:bg-primary-brand/30">
      {/* Mobile-max boundary layout */}
      <div className="w-full max-w-md px-5 flex flex-col relative min-h-screen">
        
        {/* Main Route Screen */}
        <main className="flex-1 w-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <HomeTab 
                key="home" 
                onOpenRecord={() => setIsWeightModalOpen(true)} 
              />
            )}
            {activeTab === 'progress' && <ProgressTab key="progress" />}
            {activeTab === 'history' && <HistoryTab key="history" />}
            {activeTab === 'insights' && <InsightsTab key="insights" />}
            {activeTab === 'profile' && <ProfileTab key="profile" />}
          </AnimatePresence>
        </main>

        {/* Glass bottom Navigation */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Global Weight Logging Overlay Dialog */}
        <WeightModal 
          isOpen={isWeightModalOpen} 
          onClose={() => setIsWeightModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

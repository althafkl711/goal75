import React from 'react';
import { motion } from 'framer-motion';
import { Home, TrendingDown, Clock, Sparkles, User } from 'lucide-react';

export type TabType = 'home' | 'progress' | 'history' | 'insights' | 'profile';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'progress' as TabType, label: 'Progress', icon: TrendingDown },
    { id: 'history' as TabType, label: 'History', icon: Clock },
    { id: 'insights' as TabType, label: 'Insights', icon: Sparkles },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6 pt-2 pointer-events-none">
      <nav className="w-full max-w-md glassmorphism rounded-[24px] px-2 py-2 flex items-center justify-around shadow-2xl pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl cursor-pointer focus:outline-none transition-colors duration-200"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Background Bubble */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-primary-brand rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0
                }}
                className={`relative z-10 p-1 ${
                  isActive ? 'text-black' : 'text-text-secondary hover:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium mt-1 relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-black font-semibold' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
export default Navbar;

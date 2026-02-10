import React from 'react';
import { Users, LayoutGrid } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
  queueCount: number;
  activeGamesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab, queueCount, activeGamesCount }) => {
  const handleTabChange = (tab: AppTab) => {
    // Simple haptic feedback if available
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setTab(tab);
  };

  return (
    <div className="bottom-nav">
        <button
          onClick={() => handleTabChange('queue')}
          className={`nav-btn ${currentTab === 'queue' ? 'active' : ''}`}
        >
          <div className="relative">
            <Users size={26} />
            {queueCount > 0 && (
              <span className="badge badge-gold">
                {queueCount}
              </span>
            )}
          </div>
          <span className="nav-label">Queue</span>
        </button>

        <button
          onClick={() => handleTabChange('games')}
          className={`nav-btn ${currentTab === 'games' ? 'active' : ''}`}
        >
          <div className="relative">
            <LayoutGrid size={26} />
            {activeGamesCount > 0 && (
              <span className="badge badge-green">
                {activeGamesCount}
              </span>
            )}
          </div>
          <span className="nav-label">Tables</span>
        </button>
    </div>
  );
};
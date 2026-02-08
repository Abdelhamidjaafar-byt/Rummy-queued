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
  return (
    <div className="bottom-nav">
        <button
          onClick={() => setTab('queue')}
          className={`nav-btn ${currentTab === 'queue' ? 'active' : ''}`}
        >
          <div className="relative">
            <Users size={24} />
            {queueCount > 0 && (
              <span className="badge badge-gold">
                {queueCount}
              </span>
            )}
          </div>
          <span className="nav-label">Queue</span>
        </button>

        <button
          onClick={() => setTab('games')}
          className={`nav-btn ${currentTab === 'games' ? 'active' : ''}`}
        >
          <div className="relative">
            <LayoutGrid size={24} />
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
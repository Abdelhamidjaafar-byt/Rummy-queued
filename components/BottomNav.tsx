import React from 'react';
import { Users, LayoutGrid, Sparkles } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
  queueCount: number;
  activeGamesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab, queueCount, activeGamesCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-rummy-card/90 backdrop-blur-md border-t border-white/10 pb-safe pt-2 px-6 h-20 z-50">
      <div className="flex justify-around items-center h-full pb-2">
        <button
          onClick={() => setTab('queue')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'queue' ? 'text-rummy-accent' : 'text-gray-400'}`}
        >
          <div className="relative">
            <Users size={24} />
            {queueCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rummy-gold text-rummy-dark text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {queueCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Queue</span>
        </button>

        <button
          onClick={() => setTab('games')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'games' ? 'text-rummy-accent' : 'text-gray-400'}`}
        >
          <div className="relative">
            <LayoutGrid size={24} />
            {activeGamesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rummy-green text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-rummy-dark">
                {activeGamesCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Tables</span>
        </button>

        <button
          onClick={() => setTab('chat')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'chat' ? 'text-rummy-accent' : 'text-gray-400'}`}
        >
          <div className="relative">
            <Sparkles size={24} />
          </div>
          <span className="text-xs font-medium">Sage</span>
        </button>
      </div>
    </div>
  );
};
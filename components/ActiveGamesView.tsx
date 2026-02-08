import React, { useState } from 'react';
import { Game, Player } from '../types';
import { Trophy, Clock, XCircle, Users, ArrowRightLeft, Plus, CheckCircle2 } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';

interface ActiveGamesViewProps {
  games: Game[];
  queueSize: number;
  onFinishGame: (gameId: string) => void;
  onCreateGame: () => void;
  onSwapPlayers: (gameId: string, playerIdsToRemove: string[]) => void;
}

export const ActiveGamesView: React.FC<ActiveGamesViewProps> = ({ 
  games, 
  queueSize,
  onFinishGame, 
  onCreateGame,
  onSwapPlayers
}) => {
  const [swapModeGameId, setSwapModeGameId] = useState<string | null>(null);
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(new Set());

  const toggleRemovalSelection = (playerId: string) => {
    const newSet = new Set(selectedForRemoval);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setSelectedForRemoval(newSet);
  };

  const handleSwapSubmit = (gameId: string) => {
    onSwapPlayers(gameId, Array.from(selectedForRemoval));
    setSwapModeGameId(null);
    setSelectedForRemoval(new Set());
  };

  const cancelSwap = () => {
    setSwapModeGameId(null);
    setSelectedForRemoval(new Set());
  };
  
  return (
    <div className="h-full pb-24 px-4 pt-4 overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-2 h-8 bg-rummy-accent rounded-full mr-3"></span>
          Active Tables
        </h2>
        <button 
          onClick={onCreateGame}
          className="bg-rummy-accent hover:bg-rummy-green text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-1 shadow-lg shadow-green-900/20"
        >
          <Plus size={16} />
          New Table
        </button>
      </div>

      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-white/10 rounded-2xl animate-pop-in">
          <div className="w-20 h-20 bg-rummy-card rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Trophy size={32} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-300">No Active Tables</h3>
          <p className="text-gray-500 mt-2 mb-6 max-w-xs">
            Start a new table to pull players from the queue.
          </p>
          <button 
            onClick={onCreateGame}
            className="bg-rummy-gold text-rummy-dark font-bold py-3 px-8 rounded-xl hover:bg-yellow-400 transition-colors"
          >
            Create Table
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {games.map((game) => {
          const isSwapMode = swapModeGameId === game.id;
          
          return (
            <div key={game.id} className={`bg-rummy-card rounded-2xl border shadow-xl overflow-hidden transition-all animate-pop-in ${isSwapMode ? 'border-rummy-gold ring-1 ring-rummy-gold' : 'border-white/5'}`}>
              {/* Table Header */}
              <div className={`p-4 flex justify-between items-center border-b ${isSwapMode ? 'bg-rummy-gold/10 border-rummy-gold/20' : 'bg-gradient-to-r from-green-900/50 to-rummy-card border-white/5'}`}>
                <div className="flex items-center gap-2">
                  <div className={`${isSwapMode ? 'bg-rummy-gold/20' : 'bg-green-500/20'} p-1.5 rounded-lg`}>
                     <Trophy size={16} className={isSwapMode ? 'text-rummy-gold' : 'text-green-400'} />
                  </div>
                  <span className={`font-bold text-sm ${isSwapMode ? 'text-rummy-gold' : 'text-gray-200'}`}>
                    {isSwapMode ? 'SELECT LOSERS / LEAVING' : `Table #${game.id.slice(-4).toUpperCase()}`}
                  </span>
                </div>
                {!isSwapMode && (
                  <div className="flex items-center text-xs text-gray-400 font-mono">
                    <Clock size={12} className="mr-1.5" />
                    {Math.floor((Date.now() - game.startTime) / 60000)}m
                  </div>
                )}
              </div>

              {/* Players Layout */}
              <div className="p-6 relative">
                 {/* Center Decal */}
                 {!isSwapMode && (
                   <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                     <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center">
                        <span className="text-2xl font-black">RUMMY</span>
                     </div>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-4 relative z-10">
                   {game.players.map((player) => {
                     const isSelected = selectedForRemoval.has(player.id);
                     return (
                       <div 
                         key={player.id} 
                         onClick={() => isSwapMode && toggleRemovalSelection(player.id)}
                         className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all duration-200 animate-pop-in ${
                           isSwapMode 
                             ? 'cursor-pointer hover:bg-white/5 ' + (isSelected ? 'bg-red-500/20 border-red-500 shadow-inner' : 'bg-rummy-dark/50 border-white/10')
                             : 'bg-rummy-dark/50 border-white/5'
                         }`}
                       >
                          <div className="relative mb-2">
                            <PlayerAvatar 
                              seed={player.avatarSeed} 
                              name={player.name}
                              className={isSelected ? 'grayscale opacity-50' : ''}
                            />
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center text-red-500 animate-pop-in">
                                <XCircle size={24} className="bg-rummy-card rounded-full" />
                              </div>
                            )}
                          </div>
                          
                          <span className={`text-xs font-medium truncate max-w-full text-center px-1 ${isSelected ? 'text-red-400 line-through decoration-red-400' : 'text-gray-300'}`}>
                            {player.name}
                          </span>
                       </div>
                     );
                   })}
                   
                   {/* Empty Slots Indicators */}
                   {Array.from({ length: 4 - game.players.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex flex-col items-center justify-center bg-transparent rounded-xl p-3 border border-dashed border-white/10">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                           <Users size={16} className="text-gray-600" />
                        </div>
                        <span className="text-xs text-gray-600">Empty Seat</span>
                      </div>
                   ))}
                 </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-black/20 border-t border-white/5">
                {isSwapMode ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={cancelSwap}
                      className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSwapSubmit(game.id)}
                      className="flex-[2] py-3 rounded-xl bg-rummy-gold hover:bg-yellow-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft size={16} />
                      Swap & Fill ({Math.min(selectedForRemoval.size, queueSize)})
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onFinishGame(game.id)}
                      className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                      title="Destroy Table"
                    >
                      <XCircle size={20} />
                    </button>
                    <button 
                      onClick={() => setSwapModeGameId(game.id)}
                      className="flex-1 py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-semibold text-sm transition-colors border border-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft size={16} />
                      End Round / Swap
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
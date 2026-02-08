import React, { useState } from 'react';
import { Game } from '../types';
import { Trophy, Clock, XCircle, Users, ArrowRightLeft, Plus } from 'lucide-react';
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
    <div className="view-container">
      <div className="games-header">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '0.5rem', height: '2rem', backgroundColor: 'var(--rummy-accent)', borderRadius: '999px', marginRight: '0.75rem' }}></span>
          Active Tables
        </h2>
        <button 
          onClick={onCreateGame}
          className="btn-create"
        >
          <Plus size={16} />
          New Table
        </button>
      </div>

      {games.length === 0 && (
        <div className="empty-state animate-pop-in">
          <div style={{ width: '5rem', height: '5rem', backgroundColor: 'var(--rummy-card)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
            <Trophy size={32} style={{ color: 'var(--text-gray-dark)' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d1d5db' }}>No Active Tables</h3>
          <p style={{ color: 'var(--text-gray)', marginTop: '0.5rem', marginBottom: '1.5rem', maxWidth: '200px' }}>
            Start a new table to pull players from the queue.
          </p>
          <button 
            onClick={onCreateGame}
            className="btn-gold"
            style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
          >
            Create Table
          </button>
        </div>
      )}

      <div className="flex flex-col">
        {games.map((game) => {
          const isSwapMode = swapModeGameId === game.id;
          
          return (
            <div key={game.id} className={`game-card animate-pop-in ${isSwapMode ? 'swap-mode' : ''}`}>
              {/* Table Header */}
              <div className="game-header">
                <div className="flex items-center gap-2">
                  <div style={{ padding: '0.375rem', borderRadius: '0.5rem', backgroundColor: isSwapMode ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)' }}>
                     <Trophy size={16} className={isSwapMode ? 'text-gold' : 'text-accent'} />
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.875rem', color: isSwapMode ? 'var(--rummy-gold)' : '#e5e7eb' }}>
                    {isSwapMode ? 'SELECT LEAVING' : `Table #${game.id.slice(-4).toUpperCase()}`}
                  </span>
                </div>
                {!isSwapMode && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-gray)', fontFamily: 'monospace' }}>
                    <Clock size={12} style={{ marginRight: '0.375rem' }} />
                    {Math.floor((Date.now() - game.startTime) / 60000)}m
                  </div>
                )}
              </div>

              {/* Players Layout */}
              <div className="game-body">
                 {!isSwapMode && (
                   <div className="watermark">
                     <div className="watermark-circle">RUMMY</div>
                   </div>
                 )}

                 <div className="players-grid">
                   {game.players.map((player) => {
                     const isSelected = selectedForRemoval.has(player.id);
                     return (
                       <div 
                         key={player.id} 
                         onClick={() => isSwapMode && toggleRemovalSelection(player.id)}
                         className={`player-slot animate-pop-in ${isSwapMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`}
                       >
                          <div className="relative" style={{ marginBottom: '0.5rem' }}>
                            <PlayerAvatar 
                              seed={player.avatarSeed} 
                              name={player.name}
                              className={isSelected ? 'filter-grayscale' : ''}
                            />
                            {isSelected && (
                              <div className="absolute" style={{ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                <XCircle size={24} style={{ backgroundColor: 'var(--rummy-card)', borderRadius: '50%' }} />
                              </div>
                            )}
                          </div>
                          
                          <span className="slot-name">
                            {player.name}
                          </span>
                       </div>
                     );
                   })}
                   
                   {/* Empty Slots */}
                   {Array.from({ length: 4 - game.players.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="player-slot empty-slot">
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                           <Users size={16} style={{ color: 'var(--text-gray-dark)' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dark)' }}>Empty Seat</span>
                      </div>
                   ))}
                 </div>
              </div>

              {/* Actions */}
              <div className="game-footer">
                {isSwapMode ? (
                  <>
                    <button 
                      onClick={cancelSwap}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSwapSubmit(game.id)}
                      className="btn-gold"
                    >
                      <ArrowRightLeft size={16} />
                      Swap & Fill ({Math.min(selectedForRemoval.size, queueSize)})
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => onFinishGame(game.id)}
                      className="btn-danger"
                      title="Destroy Table"
                    >
                      <XCircle size={20} />
                    </button>
                    <button 
                      onClick={() => setSwapModeGameId(game.id)}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flex: 1, color: '#a5b4fc', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)' }}
                    >
                      <ArrowRightLeft size={16} />
                      End Round / Swap
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
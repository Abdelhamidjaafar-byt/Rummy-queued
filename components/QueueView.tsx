import React, { useState } from 'react';
import { Player } from '../types';
import { Plus, User, Clock, ArrowRight } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';

interface QueueViewProps {
  queue: Player[];
  onJoin: (name: string) => void;
  onRemove: (id: string) => void;
}

export const QueueView: React.FC<QueueViewProps> = ({ queue, onJoin, onRemove }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
      setName('');
    }
  };

  const getSlotsFilled = () => queue.length % 4;
  const slotsRemaining = 4 - getSlotsFilled();
  const nextGameProgress = (getSlotsFilled() / 4) * 100;

  return (
    <div className="flex flex-col h-full pb-24 px-4 pt-4 overflow-y-auto no-scrollbar">
      
      {/* Header Stat */}
      <div className="mb-6 bg-rummy-card rounded-2xl p-6 shadow-lg border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
           <div 
             className="h-full bg-gradient-to-r from-rummy-gold to-rummy-accent transition-all duration-500 ease-out" 
             style={{ width: `${nextGameProgress}%` }}
           />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Next Table</h2>
            <p className="text-gray-400 text-sm mt-1">
              {slotsRemaining === 4 
                ? "Waiting for players..." 
                : `${slotsRemaining} more to start a game`}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-rummy-dark flex items-center justify-center border-2 border-rummy-gold/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <span className="text-xl font-bold text-rummy-gold">{queue.length}</span>
          </div>
        </div>
      </div>

      {/* Join Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="flex-1 bg-rummy-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rummy-accent focus:ring-1 focus:ring-rummy-accent transition-all"
          />
          <button 
            type="submit"
            disabled={!name.trim()}
            className="bg-rummy-accent hover:bg-rummy-green disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 font-bold transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>
      </form>

      {/* Queue List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Waiting List</h3>
        
        {queue.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center animate-pop-in">
            <User size={48} className="mb-4 opacity-20" />
            <p>The queue is empty.</p>
            <p className="text-xs mt-1">Be the first to join!</p>
          </div>
        ) : (
          queue.map((player, index) => {
            const isNextUp = index < 4;
            return (
              <div 
                key={player.id}
                className={`flex items-center p-4 rounded-xl border transition-all duration-300 animate-pop-in ${
                  isNextUp 
                    ? 'bg-gradient-to-r from-rummy-card to-rummy-card/80 border-rummy-gold/30 shadow-md' 
                    : 'bg-rummy-card/50 border-transparent opacity-80'
                }`}
              >
                <div className="mr-4 relative">
                   <PlayerAvatar 
                      seed={player.avatarSeed} 
                      name={player.name} 
                      className={`${isNextUp ? 'ring-2 ring-rummy-gold shadow-lg shadow-yellow-900/20' : 'opacity-70 grayscale-[0.3]'}`}
                   />
                   {isNextUp && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-rummy-card"></div>}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold ${isNextUp ? 'text-white' : 'text-gray-400'}`}>{player.name}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <Clock size={12} className="mr-1" />
                    <span>{new Date(player.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isNextUp && (
                     <span className="text-[10px] font-bold bg-rummy-gold/20 text-rummy-gold px-2 py-1 rounded-full border border-rummy-gold/20">
                       NEXT
                     </span>
                  )}
                  <button 
                    onClick={() => onRemove(player.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    aria-label="Leave queue"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
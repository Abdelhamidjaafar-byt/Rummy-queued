import React, { useState } from 'react';
import { Player } from '../types';
import { Plus, User, Clock } from 'lucide-react';
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
    <div className="view-container">
      
      {/* Header Stat */}
      <div className="progress-card">
        <div className="progress-bar-bg">
           <div 
             className="progress-bar-fill"
             style={{ width: `${nextGameProgress}%` }}
           />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Next Table</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {slotsRemaining === 4 
                ? "Waiting for players..." 
                : `${slotsRemaining} more to start a game`}
            </p>
          </div>
          <div className="queue-count">
            <span>{queue.length}</span>
          </div>
        </div>
      </div>

      {/* Join Form */}
      <form onSubmit={handleSubmit} className="join-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="form-input"
          style={{ flex: 1 }}
        />
        <button 
          type="submit"
          disabled={!name.trim()}
          className="btn-add"
        >
          <Plus size={24} />
        </button>
      </form>

      {/* Queue List */}
      <div className="queue-list">
        <h3 className="section-title">Waiting List</h3>
        
        {queue.length === 0 ? (
          <div className="empty-state animate-pop-in" style={{ borderStyle: 'none' }}>
            <User size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-gray)' }}>The queue is empty.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-gray-dark)' }}>Be the first to join!</p>
          </div>
        ) : (
          queue.map((player, index) => {
            const isNextUp = index < 4;
            return (
              <div 
                key={player.id}
                className={`queue-item animate-pop-in ${isNextUp ? 'next-up' : ''}`}
              >
                <div className="relative" style={{ marginRight: '1rem' }}>
                   <PlayerAvatar 
                      seed={player.avatarSeed} 
                      name={player.name} 
                      className={isNextUp ? 'shadow-glow' : 'opacity-70'}
                   />
                   {isNextUp && <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '1rem', height: '1rem', backgroundColor: 'var(--rummy-accent)', borderRadius: '50%', border: '2px solid var(--rummy-card)' }}></div>}
                </div>
                
                <div className="queue-item-info">
                  <h4 className="queue-name">{player.name}</h4>
                  <div className="queue-time">
                    <Clock size={12} style={{ marginRight: '0.25rem' }} />
                    <span>{new Date(player.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isNextUp && (
                     <span className="tag-next">NEXT</span>
                  )}
                  <button 
                    onClick={() => onRemove(player.id)}
                    className="btn-icon"
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
import React, { useState } from 'react';
import { Player } from '../types';
import { Plus, User, Clock, Trash2, Pencil, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';

interface QueueViewProps {
  queue: Player[];
  onJoin: (name: string) => void;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
  onMovePlayer: (id: string, direction: 'up' | 'down') => void;
}

export const QueueView: React.FC<QueueViewProps> = ({ 
  queue, 
  onJoin, 
  onRemove, 
  onUpdateName,
  onMovePlayer 
}) => {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
      setName('');
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
    }
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEditing = (id: string) => {
    if (editName.trim()) {
      onUpdateName(id, editName.trim());
    }
    setEditingId(null);
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
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {slotsRemaining === 4 
                ? "Waiting for players..." 
                : <span className="text-accent">{slotsRemaining} more needed</span>}
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
          placeholder="Enter Player Name"
          className="form-input"
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.5rem', fontSize: '1.1rem' }}
        />
        <button 
          type="submit"
          disabled={!name.trim()}
          className="btn-add"
        >
          <Plus size={28} />
        </button>
      </form>

      {/* Queue List */}
      <div className="queue-list">
        <h3 className="section-title">Waiting List</h3>
        
        {queue.length === 0 ? (
          <div className="empty-state animate-pop-in" style={{ borderStyle: 'none', padding: '3rem 1rem' }}>
            <User size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-gray)' }}>The queue is empty.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-gray-dark)' }}>Be the first to join!</p>
          </div>
        ) : (
          queue.map((player, index) => {
            const isNextUp = index < 4;
            const isEditing = editingId === player.id;
            const isFirst = index === 0;
            const isLast = index === queue.length - 1;

            return (
              <div 
                key={player.id}
                className={`queue-item animate-pop-in ${isNextUp ? 'next-up' : ''}`}
              >
                <div className="relative" style={{ marginRight: '0.75rem' }}>
                   <PlayerAvatar 
                      seed={player.avatarSeed} 
                      name={player.name} 
                      size="md"
                      className={isNextUp ? 'shadow-glow' : 'opacity-70'}
                   />
                   {isNextUp && <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', backgroundColor: 'var(--rummy-accent)', borderRadius: '50%', border: '2px solid var(--rummy-card)' }}></div>}
                </div>
                
                <div className="queue-item-info">
                  {isEditing ? (
                     <div className="flex items-center gap-2">
                       <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="form-input"
                          autoFocus
                          style={{ padding: '0.25rem 0.5rem', fontSize: '1rem', height: '2rem' }}
                       />
                     </div>
                  ) : (
                    <>
                      <h4 className="queue-name">{player.name}</h4>
                      <div className="queue-time">
                        <Clock size={12} style={{ marginRight: '0.25rem' }} />
                        <span>{new Date(player.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-2">
                   {isEditing ? (
                     <>
                      <button onClick={() => saveEditing(player.id)} className="btn-icon" style={{ color: 'var(--rummy-accent)' }} title="Save">
                        <Check size={20} />
                      </button>
                      <button onClick={cancelEditing} className="btn-icon" style={{ color: '#ef4444' }} title="Cancel">
                        <X size={20} />
                      </button>
                     </>
                   ) : (
                     <>
                      {/* Move Controls */}
                      <div className="flex flex-col gap-1 mr-1">
                        <button 
                           onClick={() => onMovePlayer(player.id, 'up')}
                           disabled={isFirst}
                           className="btn-icon"
                           style={{ padding: '0.2rem', opacity: isFirst ? 0.3 : 1 }}
                        >
                           <ChevronUp size={16} />
                        </button>
                        <button 
                           onClick={() => onMovePlayer(player.id, 'down')}
                           disabled={isLast}
                           className="btn-icon"
                           style={{ padding: '0.2rem', opacity: isLast ? 0.3 : 1 }}
                        >
                           <ChevronDown size={16} />
                        </button>
                      </div>

                      {/* Edit Button */}
                      <button 
                        onClick={() => startEditing(player)}
                        className="btn-icon"
                        title="Edit Name"
                      >
                        <Pencil size={18} />
                      </button>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => onRemove(player.id)}
                        className="btn-icon"
                        aria-label="Leave queue"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                     </>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
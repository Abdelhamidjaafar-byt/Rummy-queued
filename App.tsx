import React, { useState, useEffect, useCallback } from 'react';
import { QueueView } from './components/QueueView';
import { ActiveGamesView } from './components/ActiveGamesView';
import { BottomNav } from './components/BottomNav';
import { Auth } from './components/Auth';
import { DatabaseInstructions } from './components/DatabaseInstructions';
import { Player, Game, AppTab } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { LogOut, Loader2, WifiOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  
  const [activeTab, setActiveTab] = useState<AppTab>('queue');
  const [queue, setQueue] = useState<Player[]>([]);
  const [activeGames, setActiveGames] = useState<Game[]>([]);

  // 1. Auth & Session Management
  useEffect(() => {
    let mounted = true;

    if (isDemoMode) {
      setLoadingSession(false);
      // Load local data
      try {
        const savedQueue = localStorage.getItem('demo_queue');
        const savedGames = localStorage.getItem('demo_games');
        if (savedQueue) setQueue(JSON.parse(savedQueue));
        if (savedGames) setActiveGames(JSON.parse(savedGames));
      } catch (e) { console.error(e); }
      return;
    }

    const timeoutId = setTimeout(() => {
      if (mounted && loadingSession) {
        console.warn("Supabase session check timed out");
        setLoadingSession(false);
      }
    }, 3000);

    if (!isSupabaseConfigured) {
      setLoadingSession(false);
      clearTimeout(timeoutId);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoadingSession(false);
      }
    }).catch((err) => {
      console.error("Session check error:", err);
      if (mounted) setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoadingSession(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  // 2. Data Subscriptions (Real Supabase)
  useEffect(() => {
    if (isDemoMode || !session || !isSupabaseConfigured) return;

    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .order('joined_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching queue:", error);
        // PGRST205 is "Relation (table) not found"
        if (error.code === 'PGRST205') {
          setSetupRequired(true);
        }
        return;
      }
      
      if (data) {
        const mappedQueue: Player[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          avatarSeed: item.avatar_seed,
          joinedAt: item.joined_at
        }));
        setQueue(mappedQueue);
      }
    };

    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('active_games')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) {
        console.error("Error fetching games:", error);
        if (error.code === 'PGRST205') {
          setSetupRequired(true);
        }
        return;
      }

      if (data) {
        const mappedGames: Game[] = data.map((item: any) => ({
          id: item.id,
          players: item.players,
          startTime: item.start_time,
          status: item.status
        }));
        setActiveGames(mappedGames);
      }
    };

    fetchQueue();
    fetchGames();

    const queueSub = supabase
      .channel('queue_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPlayer = {
              id: payload.new.id,
              name: payload.new.name,
              avatarSeed: payload.new.avatar_seed,
              joinedAt: payload.new.joined_at
            };
            setQueue(prev => {
              // Avoid duplicates if we inserted it locally
              if (prev.some(p => p.id === newPlayer.id)) return prev;
              return [...prev, newPlayer].sort((a, b) => a.joinedAt - b.joinedAt);
            });
          } else if (payload.eventType === 'DELETE') {
            setQueue(prev => prev.filter(p => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setQueue(prev => {
              const updated = prev.map(p => {
                if (p.id === payload.new.id) {
                  return {
                    ...p,
                    name: payload.new.name,
                    joinedAt: payload.new.joined_at
                  };
                }
                return p;
              });
              return updated.sort((a, b) => a.joinedAt - b.joinedAt);
            });
          }
        }
      )
      .subscribe();

    const gamesSub = supabase
      .channel('games_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_games' },
        (payload) => {
           if (payload.eventType === 'INSERT') {
             const newGame: Game = {
               id: payload.new.id,
               players: payload.new.players,
               startTime: payload.new.start_time,
               status: payload.new.status
             };
             setActiveGames(prev => [newGame, ...prev]);
           } else if (payload.eventType === 'DELETE') {
             setActiveGames(prev => prev.filter(g => g.id !== payload.old.id));
           } else if (payload.eventType === 'UPDATE') {
             setActiveGames(prev => prev.map(g => {
               if (g.id === payload.new.id) {
                 return {
                   ...g,
                   players: payload.new.players,
                   status: payload.new.status
                 };
               }
               return g;
             }));
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueSub);
      supabase.removeChannel(gamesSub);
    };
  }, [session, isDemoMode]);

  // Persist local state in demo mode
  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem('demo_queue', JSON.stringify(queue));
      localStorage.setItem('demo_games', JSON.stringify(activeGames));
    }
  }, [queue, activeGames, isDemoMode]);

  // 3. Handlers
  const handleJoinQueue = useCallback(async (name: string) => {
    if (isDemoMode) {
      const newPlayer: Player = {
        id: uuidv4(),
        name,
        avatarSeed: Math.floor(Math.random() * 1000),
        joinedAt: Date.now()
      };
      setQueue(prev => [...prev, newPlayer]);
      return;
    }

    if (!isSupabaseConfigured) return;
    await supabase.from('queue').insert({
      name,
      avatar_seed: Math.floor(Math.random() * 1000),
      joined_at: Date.now()
    });
  }, [isDemoMode]);

  const handleRemoveFromQueue = useCallback(async (id: string) => {
    if (isDemoMode) {
      setQueue(prev => prev.filter(p => p.id !== id));
      return;
    }

    if (!isSupabaseConfigured) return;
    await supabase.from('queue').delete().eq('id', id);
  }, [isDemoMode]);

  const handleUpdatePlayerName = useCallback(async (id: string, newName: string) => {
    if (isDemoMode) {
      setQueue(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
      return;
    }

    if (!isSupabaseConfigured) return;
    // Optimistic update
    setQueue(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    await supabase.from('queue').update({ name: newName }).eq('id', id);
  }, [isDemoMode]);

  const handleMovePlayer = useCallback(async (playerId: string, direction: 'up' | 'down') => {
    const index = queue.findIndex(p => p.id === playerId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === queue.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const playerA = queue[index];
    const playerB = queue[targetIndex];

    // Swap joinedAt timestamps to effectively reorder them in the sorted list
    // Note: We need to handle potential collision if we were strictly using time, but swapping existing timestamps is safe.
    const timeA = playerA.joinedAt;
    const timeB = playerB.joinedAt;

    // Optimistic Update
    const newQueue = [...queue];
    newQueue[index] = { ...playerA, joinedAt: timeB };
    newQueue[targetIndex] = { ...playerB, joinedAt: timeA };
    // Re-sort immediately
    newQueue.sort((a, b) => a.joinedAt - b.joinedAt);
    setQueue(newQueue);

    if (isDemoMode) return;

    if (isSupabaseConfigured) {
      // Upsert both rows with swapped timestamps
      await supabase.from('queue').upsert([
        { id: playerA.id, name: playerA.name, avatar_seed: playerA.avatarSeed, joined_at: timeB },
        { id: playerB.id, name: playerB.name, avatar_seed: playerB.avatarSeed, joined_at: timeA }
      ]);
    }
  }, [queue, isDemoMode]);

  const handleCreateGame = useCallback(async () => {
    const countToPull = Math.min(queue.length, 4);
    if (countToPull === 0) return;

    const playersForGame = queue.slice(0, countToPull);

    if (isDemoMode) {
      const newGame: Game = {
        id: uuidv4(),
        players: playersForGame,
        startTime: Date.now(),
        status: 'active'
      };
      setActiveGames(prev => [newGame, ...prev]);
      setQueue(prev => prev.slice(countToPull));
      setActiveTab('games');
      return;
    }

    if (!isSupabaseConfigured) return;
    
    const { error } = await supabase.from('active_games').insert({
      players: playersForGame,
      start_time: Date.now(),
      status: 'active'
    });

    if (!error) {
       const idsToRemove = playersForGame.map(p => p.id);
       await supabase.from('queue').delete().in('id', idsToRemove);
       setActiveTab('games');
    }
  }, [queue, isDemoMode]);

  const handleFinishGame = useCallback(async (gameId: string) => {
    if (isDemoMode) {
      setActiveGames(prev => prev.filter(g => g.id !== gameId));
      return;
    }

    if (!isSupabaseConfigured) return;
    await supabase.from('active_games').delete().eq('id', gameId);
  }, [isDemoMode]);

  const handleSwapPlayers = useCallback(async (gameId: string, playerIdsToRemove: string[]) => {
    const game = activeGames.find(g => g.id === gameId);
    if (!game) return;

    const keptPlayers = game.players.filter(p => !playerIdsToRemove.includes(p.id));
    const slotsNeeded = 4 - keptPlayers.length;

    if (slotsNeeded <= 0) {
        if (isDemoMode) {
           setActiveGames(prev => prev.map(g => g.id === gameId ? {...g, players: keptPlayers} : g));
        } else {
           await supabase.from('active_games').update({ players: keptPlayers }).eq('id', gameId);
        }
        return;
    }

    let newPlayers: Player[] = [];

    if (isDemoMode) {
       newPlayers = queue.slice(0, slotsNeeded);
    } else {
      const { data: queueData } = await supabase
          .from('queue')
          .select('*')
          .order('joined_at', { ascending: true })
          .limit(slotsNeeded);

      if (queueData) {
         newPlayers = queueData.map((item: any) => ({
            id: item.id,
            name: item.name,
            avatarSeed: item.avatar_seed,
            joinedAt: item.joined_at
         }));
      }
    }

    const updatedPlayers = [...keptPlayers, ...newPlayers];

    if (isDemoMode) {
       setActiveGames(prev => prev.map(g => g.id === gameId ? {...g, players: updatedPlayers} : g));
       if (newPlayers.length > 0) {
         const idsToRemove = newPlayers.map(p => p.id);
         setQueue(prev => prev.filter(p => !idsToRemove.includes(p.id)));
       }
    } else {
       await supabase.from('active_games').update({
          players: updatedPlayers
       }).eq('id', gameId);

       if (newPlayers.length > 0) {
         const idsToRemove = newPlayers.map(p => p.id);
         await supabase.from('queue').delete().in('id', idsToRemove);
       }
    }

  }, [activeGames, queue, isDemoMode]);

  const handleLogout = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setSession(null);
    } else {
      supabase.auth.signOut();
    }
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
  };

  if (loadingSession) {
    return (
      <div className="app-container justify-center items-center">
        <Loader2 size={40} className="text-accent animate-spin" />
      </div>
    );
  }

  // If tables are missing, show instructions
  if (setupRequired && !isDemoMode) {
    return (
      <div className="app-container">
        <DatabaseInstructions />
      </div>
    );
  }

  if (!session && !isDemoMode) {
    return <Auth onDemoLogin={enterDemoMode} />;
  }

  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div>
           <h1 className="app-title">
             <span className="text-accent">♠</span> RummyQ
           </h1>
        </div>
        <div className="flex items-center gap-3">
          {isDemoMode ? (
             <div className="user-badge" style={{ borderColor: 'var(--rummy-gold)', color: 'var(--rummy-gold)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <WifiOff size={10} />
                OFFLINE DEMO
             </div>
          ) : (
            <div className="user-badge">
              {session?.user.email}
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="btn-icon"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'queue' && (
          <QueueView 
            queue={queue} 
            onJoin={handleJoinQueue}
            onRemove={handleRemoveFromQueue}
            onUpdateName={handleUpdatePlayerName}
            onMovePlayer={handleMovePlayer}
          />
        )}
        {activeTab === 'games' && (
          <ActiveGamesView 
            games={activeGames} 
            queueSize={queue.length}
            onFinishGame={handleFinishGame}
            onCreateGame={handleCreateGame}
            onSwapPlayers={handleSwapPlayers}
          />
        )}
      </main>

      {/* Navigation */}
      <BottomNav 
        currentTab={activeTab} 
        setTab={setActiveTab}
        queueCount={queue.length}
        activeGamesCount={activeGames.length}
      />
    </div>
  );
};

export default App;
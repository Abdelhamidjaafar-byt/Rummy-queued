import React, { useState, useEffect, useCallback } from 'react';
import { QueueView } from './components/QueueView';
import { ActiveGamesView } from './components/ActiveGamesView';
import { BottomNav } from './components/BottomNav';
import { Auth } from './components/Auth';
import { Player, Game, AppTab } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  const [activeTab, setActiveTab] = useState<AppTab>('queue');
  const [queue, setQueue] = useState<Player[]>([]);
  const [activeGames, setActiveGames] = useState<Game[]>([]);

  // 1. Auth & Session Management
  useEffect(() => {
    let mounted = true;

    // Safety timeout - prevents infinite loading if Supabase connection hangs or is misconfigured
    const timeoutId = setTimeout(() => {
      if (mounted && loadingSession) {
        console.warn("Supabase session check timed out - falling back to auth screen");
        setLoadingSession(false);
      }
    }, 5000); // 5 second timeout

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
      if (mounted) {
        setLoadingSession(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
  }, []);

  // 2. Data Subscriptions (only when logged in)
  useEffect(() => {
    if (!session || !isSupabaseConfigured) return;

    // Fetch Initial Queue
    const fetchQueue = async () => {
      const { data } = await supabase
        .from('queue')
        .select('*')
        .order('joined_at', { ascending: true });
      if (data) {
        // Map snake_case DB to camelCase Types if needed, currently matching closely
        const mappedQueue: Player[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          avatarSeed: item.avatar_seed,
          joinedAt: item.joined_at
        }));
        setQueue(mappedQueue);
      }
    };

    // Fetch Initial Games
    const fetchGames = async () => {
      const { data } = await supabase
        .from('active_games')
        .select('*')
        .order('start_time', { ascending: false });
      if (data) {
        const mappedGames: Game[] = data.map((item: any) => ({
          id: item.id,
          players: item.players, // JSONB comes back as object
          startTime: item.start_time,
          status: item.status
        }));
        setActiveGames(mappedGames);
      }
    };

    fetchQueue();
    fetchGames();

    // Subscribe to Queue Changes
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
            setQueue(prev => [...prev, newPlayer]);
          } else if (payload.eventType === 'DELETE') {
            setQueue(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to Games Changes
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
  }, [session]);


  // 3. Handlers
  const handleJoinQueue = useCallback(async (name: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('queue').insert({
      name,
      avatar_seed: Math.floor(Math.random() * 1000),
      joined_at: Date.now()
    });
  }, []);

  const handleRemoveFromQueue = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('queue').delete().eq('id', id);
  }, []);

  const handleCreateGame = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    
    // 1. Get top 4 locally (assuming synced)
    const countToPull = Math.min(queue.length, 4);
    if (countToPull === 0) return;

    const playersForGame = queue.slice(0, countToPull);
    
    // 2. Insert Game
    const { error } = await supabase.from('active_games').insert({
      players: playersForGame,
      start_time: Date.now(),
      status: 'active'
    });

    if (!error) {
       // 3. Delete from Queue (batch)
       const idsToRemove = playersForGame.map(p => p.id);
       await supabase.from('queue').delete().in('id', idsToRemove);
       
       setActiveTab('games');
    }
  }, [queue]);

  const handleFinishGame = useCallback(async (gameId: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('active_games').delete().eq('id', gameId);
  }, []);

  const handleSwapPlayers = useCallback(async (gameId: string, playerIdsToRemove: string[]) => {
    if (!isSupabaseConfigured) return;
    const game = activeGames.find(g => g.id === gameId);
    if (!game) return;

    const keptPlayers = game.players.filter(p => !playerIdsToRemove.includes(p.id));
    const slotsNeeded = 4 - keptPlayers.length;

    if (slotsNeeded <= 0) {
        // Just remove players
        await supabase.from('active_games').update({
           players: keptPlayers
        }).eq('id', gameId);
        return;
    }

    // Pull new players from queue
    const { data: queueData } = await supabase
        .from('queue')
        .select('*')
        .order('joined_at', { ascending: true })
        .limit(slotsNeeded);

    if (queueData) {
       const newPlayers: Player[] = queueData.map((item: any) => ({
          id: item.id,
          name: item.name,
          avatarSeed: item.avatar_seed,
          joinedAt: item.joined_at
       }));
       
       const updatedPlayers = [...keptPlayers, ...newPlayers];

       // Update Game
       await supabase.from('active_games').update({
          players: updatedPlayers
       }).eq('id', gameId);

       // Remove new players from queue
       if (newPlayers.length > 0) {
         const idsToRemove = newPlayers.map(p => p.id);
         await supabase.from('queue').delete().in('id', idsToRemove);
       }
    }

  }, [activeGames]);

  const handleLogout = () => {
    supabase.auth.signOut();
  };


  if (loadingSession) {
    return (
      <div className="h-screen bg-rummy-dark flex items-center justify-center">
        <Loader2 size={40} className="text-rummy-accent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-rummy-dark to-black min-h-screen">
      {/* Top Bar - Safe area adjusted */}
      <div className="pt-[max(1rem,env(safe-area-inset-top))] px-6 py-4 flex justify-between items-center bg-rummy-dark/50 backdrop-blur-sm z-20 sticky top-0">
        <div>
           <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
             <span className="text-rummy-accent">♠</span> RummyQ
           </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-gray-500 border border-white/10 px-2 py-1 rounded hidden sm:block">
            {session.user.email}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'queue' && (
          <QueueView 
            queue={queue} 
            onJoin={handleJoinQueue}
            onRemove={handleRemoveFromQueue}
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
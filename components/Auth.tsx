import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LogIn, UserPlus, AlertCircle, Loader2, Database } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-rummy-dark to-black text-center">
        <div className="bg-rummy-card p-8 rounded-3xl border border-red-500/20 shadow-2xl max-w-md animate-pop-in">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
            <Database size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Database Connection Missing</h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            This app requires a Supabase connection to function. Please configure your environment variables.
          </p>
          <div className="bg-black/30 rounded-xl p-4 text-left font-mono text-xs text-gray-300 space-y-2 border border-white/5">
            <div>
              <span className="text-rummy-gold">SUPABASE_URL</span>=[your-project-url]
            </div>
            <div>
              <span className="text-rummy-gold">SUPABASE_ANON_KEY</span>=[your-anon-key]
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Restart the application after adding these keys.
          </p>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Auto sign-in generally works, but prompt might be needed depending on config
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-rummy-dark to-black">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-pop-in">
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2 mb-2">
            <span className="text-rummy-accent text-5xl">♠</span> RummyQ
          </h1>
          <p className="text-gray-400">Host Queue Management</p>
        </div>

        {/* Card */}
        <div className="bg-rummy-card border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm animate-pop-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Create Host Account' : 'Host Login'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rummy-accent focus:ring-1 focus:ring-rummy-accent transition-all"
                placeholder="host@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rummy-accent focus:ring-1 focus:ring-rummy-accent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 text-red-200 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rummy-accent hover:bg-rummy-green text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus size={20} /> Sign Up
                </>
              ) : (
                <>
                  <LogIn size={20} /> Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-600 mt-8">
          Only authorized hosts may access this system.
        </p>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LogIn, UserPlus, AlertCircle, Loader2, Database, PlayCircle } from 'lucide-react';

interface AuthProps {
  onDemoLogin?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onDemoLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured.");
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
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
    <div className="auth-container">
      <div className="w-full" style={{ maxWidth: '24rem' }}>
        {/* Logo */}
        <div className="text-center animate-pop-in" style={{ marginBottom: '2rem' }}>
          <h1 className="app-title justify-center" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            <span className="text-accent" style={{ fontSize: '3rem' }}>♠</span> RummyQ
          </h1>
          <p style={{ color: 'var(--text-gray)' }}>Host Queue Management</p>
        </div>

        {/* Card */}
        <div className="auth-card animate-pop-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-center" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {isSignUp ? 'Create Host Account' : 'Host Login'}
          </h2>

          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="host@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="error-box">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.5rem' }}
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

           {/* Demo Mode Button */}
           {onDemoLogin && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={onDemoLogin}
                className="btn-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <PlayCircle size={20} />
                Try Demo Mode (Offline)
              </button>
              <p className="text-center" style={{ fontSize: '0.7rem', color: 'var(--text-gray-dark)', marginTop: '0.5rem' }}>
                No login required. Data saved locally.
              </p>
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="auth-switch"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
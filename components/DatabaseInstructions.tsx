import React from 'react';
import { Database, Copy, Check } from 'lucide-react';

export const DatabaseInstructions: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const sqlCode = `-- Run this in your Supabase SQL Editor

-- 1. Create Queue Table
create table if not exists public.queue (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  avatar_seed int not null,
  joined_at bigint not null
);

-- 2. Create Active Games Table
create table if not exists public.active_games (
  id uuid default gen_random_uuid() primary key,
  players jsonb not null,
  start_time bigint not null,
  status text not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.queue enable row level security;
alter table public.active_games enable row level security;

-- 4. Create Public Access Policies (for demo purposes)
create policy "Public access to queue" on public.queue 
  for all using (true) with check (true);

create policy "Public access to games" on public.active_games 
  for all using (true) with check (true);

-- 5. Enable Realtime
alter publication supabase_realtime add table public.queue;
alter publication supabase_realtime add table public.active_games;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="view-container justify-center items-center" style={{ paddingBottom: '2rem' }}>
      <div className="auth-card animate-pop-in" style={{ maxWidth: '32rem' }}>
        <div className="text-center mb-4">
          <div className="chat-icon-bg mx-auto mb-3" style={{ background: 'var(--danger-bg)', width: '3.5rem', height: '3.5rem' }}>
            <Database size={24} className="text-danger" style={{ color: '#f87171' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Database Setup Required</h2>
          <p style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>
            The required tables were not found in your Supabase project.
          </p>
        </div>

        <div className="bg-black/30 rounded-lg p-4 mb-4 border border-white/10">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">Instructions</h3>
          <ol className="text-sm text-gray-300 space-y-2" style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>Go to your <strong>Supabase Dashboard</strong>.</li>
            <li style={{ marginBottom: '0.5rem' }}>Open the <strong>SQL Editor</strong> from the sidebar.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Paste and Run</strong> the following code:</li>
          </ol>
        </div>

        <div className="relative group">
          <pre 
            className="no-scrollbar"
            style={{ 
              background: '#0f172a', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              overflowX: 'auto', 
              fontSize: '0.75rem', 
              color: '#a5b4fc',
              border: '1px solid var(--border-color)',
              maxHeight: '300px'
            }}
          >
            {sqlCode}
          </pre>
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            title="Copy SQL"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-300" />}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            I've ran the SQL, Reload App
          </button>
        </div>
      </div>
    </div>
  );
};
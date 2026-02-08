export interface Player {
  id: string;
  name: string;
  avatarSeed: number;
  joinedAt: number;
}

export interface Game {
  id: string;
  players: Player[];
  startTime: number;
  status: 'active' | 'finished';
}

export type AppTab = 'queue' | 'games' | 'chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}
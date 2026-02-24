export type GameStatus = 'Backlog' | 'Playing' | 'Completed' | 'Dropped';

export type Game = {
  id: string;
  title: string;
  platform: string;
  steamAppId?: number;
  genres: string[];
  status: GameStatus;
  coverUrl?: string;
  playtimeHours?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export type PickerHistoryEntry = {
  gameId: string;
  pickedAt: number;
};

export const PLATFORMS = ['Steam', 'Epic', 'GOG', 'Console', 'Other'] as const;
export const GENRES = [
  'Action',
  'RTS',
  'FPS',
  'RPG',
  'Indie',
  'Roguelike',
  'Strategy',
  'Adventure',
  'Simulation',
  'Survival',
  'Puzzle',
  'Co-op'
] as const;

export const STATUSES: GameStatus[] = ['Backlog', 'Playing', 'Completed', 'Dropped'];

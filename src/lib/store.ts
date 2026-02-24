'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import seedGames from '@/data/seed-games.json';
import { Game, GameStatus, PickerHistoryEntry } from '@/lib/types';

const LIBRARY_STORAGE_KEY = 'gregatron-library-v1';
const SETTINGS_STORAGE_KEY = 'gregatron-settings-v1';

type Filters = {
  search: string;
  platform: string;
  status: string;
  genre: string;
};

type PickerConfig = {
  includeGenres: string[];
  excludeGenres: string[];
  includePlatforms: string[];
  includeStatuses: GameStatus[];
  avoidRecent: boolean;
  avoidCount: number;
  prioritizeBacklog: boolean;
  deprioritizeCompleted: boolean;
};

type SettingsState = {
  steamApiKey: string;
};

type GameState = {
  games: Game[];
  filters: Filters;
  pickerConfig: PickerConfig;
  history: PickerHistoryEntry[];
  currentPickId?: string;
  seeded: boolean;
  setFilters: (next: Partial<Filters>) => void;
  addGame: (game: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGame: (id: string, patch: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  importSteamGames: (games: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>[]) => { added: number; updated: number };
  spin: () => Game | undefined;
  setPickerConfig: (next: Partial<PickerConfig>) => void;
  markStatus: (id: string, status: GameStatus) => void;
  clearLibrary: () => void;
  resetToSeed: () => void;
  exportLibrary: () => string;
  importLibrary: (payload: string) => { ok: boolean; message: string };
  ensureSeeded: () => void;
};

const now = () => Date.now();

const seedToGames = (): Game[] =>
  seedGames.map((seed) => ({
    id: crypto.randomUUID(),
    title: seed.title,
    platform: seed.platform,
    steamAppId: seed.steamAppId,
    genres: seed.genres,
    status: 'Backlog',
    coverUrl: seed.coverUrl,
    createdAt: now(),
    updatedAt: now()
  }));

const pickWeighted = (games: Game[], config: PickerConfig): Game | undefined => {
  const filtered = games.filter((game) => {
    if (config.includePlatforms.length && !config.includePlatforms.includes(game.platform)) return false;
    if (config.includeStatuses.length && !config.includeStatuses.includes(game.status)) return false;
    if (config.includeGenres.length && !config.includeGenres.some((g) => game.genres.includes(g))) return false;
    if (config.excludeGenres.some((g) => game.genres.includes(g))) return false;
    return true;
  });

  if (!filtered.length) return undefined;

  const weighted = filtered.map((game) => {
    let weight = 1;
    if (config.prioritizeBacklog && game.status === 'Backlog') weight += 2;
    if (config.deprioritizeCompleted && game.status === 'Completed') weight *= 0.3;
    return { game, weight };
  });

  const total = weighted.reduce((acc, item) => acc + item.weight, 0);
  let target = Math.random() * total;
  for (const item of weighted) {
    target -= item.weight;
    if (target <= 0) return item.game;
  }
  return weighted.at(-1)?.game;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      games: [],
      filters: { search: '', platform: 'All', status: 'All', genre: 'All' },
      history: [],
      currentPickId: undefined,
      seeded: false,
      pickerConfig: {
        includeGenres: [],
        excludeGenres: [],
        includePlatforms: [],
        includeStatuses: ['Backlog', 'Playing', 'Completed', 'Dropped'],
        avoidRecent: true,
        avoidCount: 3,
        prioritizeBacklog: true,
        deprioritizeCompleted: true
      },
      setFilters: (next) => set((state) => ({ filters: { ...state.filters, ...next } })),
      addGame: (game) =>
        set((state) => ({
          games: [...state.games, { ...game, id: crypto.randomUUID(), createdAt: now(), updatedAt: now() }]
        })),
      updateGame: (id, patch) =>
        set((state) => ({
          games: state.games.map((game) => (game.id === id ? { ...game, ...patch, updatedAt: now() } : game))
        })),
      deleteGame: (id) => set((state) => ({ games: state.games.filter((game) => game.id !== id) })),
      importSteamGames: (incoming) => {
        let added = 0;
        let updated = 0;
        set((state) => {
          const updatedGames = [...state.games];
          incoming.forEach((game) => {
            const existingIdx = updatedGames.findIndex((item) =>
              game.steamAppId ? item.steamAppId === game.steamAppId : item.title.toLowerCase() === game.title.toLowerCase()
            );
            if (existingIdx >= 0) {
              updatedGames[existingIdx] = {
                ...updatedGames[existingIdx],
                ...game,
                id: updatedGames[existingIdx].id,
                updatedAt: now()
              };
              updated += 1;
            } else {
              updatedGames.push({ ...game, id: crypto.randomUUID(), createdAt: now(), updatedAt: now() });
              added += 1;
            }
          });
          return { games: updatedGames };
        });
        return { added, updated };
      },
      spin: () => {
        const state = get();
        const recentIds = new Set(
          state.pickerConfig.avoidRecent
            ? state.history
                .slice(-Math.max(1, state.pickerConfig.avoidCount))
                .map((entry) => entry.gameId)
            : []
        );
        const source = state.games.filter((game) => !recentIds.has(game.id));
        const picked = pickWeighted(source.length ? source : state.games, state.pickerConfig);
        if (!picked) return undefined;
        set((prev) => ({
          currentPickId: picked.id,
          history: [...prev.history, { gameId: picked.id, pickedAt: now() }]
        }));
        return picked;
      },
      setPickerConfig: (next) => set((state) => ({ pickerConfig: { ...state.pickerConfig, ...next } })),
      markStatus: (id, status) =>
        set((state) => ({
          games: state.games.map((game) => (game.id === id ? { ...game, status, updatedAt: now() } : game))
        })),
      clearLibrary: () => set({ games: [], history: [], currentPickId: undefined }),
      resetToSeed: () => set({ games: seedToGames(), history: [], currentPickId: undefined, seeded: true }),
      exportLibrary: () => JSON.stringify(get().games, null, 2),
      importLibrary: (payload) => {
        try {
          const parsed = JSON.parse(payload);
          if (!Array.isArray(parsed)) return { ok: false, message: 'JSON must be an array of games.' };
          const normalized = parsed.map((game) => ({
            ...game,
            id: typeof game.id === 'string' ? game.id : crypto.randomUUID(),
            createdAt: typeof game.createdAt === 'number' ? game.createdAt : now(),
            updatedAt: now()
          })) as Game[];
          set({ games: normalized });
          return { ok: true, message: `Imported ${normalized.length} games.` };
        } catch {
          return { ok: false, message: 'Invalid JSON file.' };
        }
      },
      ensureSeeded: () => {
        const state = get();
        if (state.seeded || state.games.length) return;
        set({ games: seedToGames(), seeded: true });
      }
    }),
    {
      name: LIBRARY_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        games: state.games,
        filters: state.filters,
        history: state.history,
        currentPickId: state.currentPickId,
        seeded: state.seeded,
        pickerConfig: state.pickerConfig
      })
    }
  )
);

type SettingsStore = SettingsState & {
  setSteamApiKey: (key: string) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      steamApiKey: '',
      setSteamApiKey: (key) => set({ steamApiKey: key })
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage)
    }
  )
);

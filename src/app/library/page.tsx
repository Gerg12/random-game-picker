'use client';

import { useMemo, useState } from 'react';
import { GameFormModal } from '@/components/GameFormModal';
import { StoreBootstrap } from '@/components/StoreBootstrap';
import { VhsCard } from '@/components/VhsCard';
import { useGameStore } from '@/lib/store';
import { GENRES, PLATFORMS, STATUSES, Game } from '@/lib/types';

export default function LibraryPage() {
  const games = useGameStore((s) => s.games);
  const filters = useGameStore((s) => s.filters);
  const setFilters = useGameStore((s) => s.setFilters);
  const addGame = useGameStore((s) => s.addGame);
  const updateGame = useGameStore((s) => s.updateGame);
  const deleteGame = useGameStore((s) => s.deleteGame);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Game | undefined>();

  const filtered = useMemo(
    () =>
      games.filter((game) => {
        const matchesSearch = game.title.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPlatform = filters.platform === 'All' || game.platform === filters.platform;
        const matchesStatus = filters.status === 'All' || game.status === filters.status;
        const matchesGenre = filters.genre === 'All' || game.genres.includes(filters.genre);
        return matchesSearch && matchesPlatform && matchesStatus && matchesGenre;
      }),
    [games, filters]
  );

  return (
    <section className="space-y-4">
      <StoreBootstrap />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/75 p-4">
        <h2 className="text-xl font-bold text-neon">Library Wall</h2>
        <button
          className="rounded bg-cyan px-4 py-2 text-sm font-semibold text-black"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          Add Game
        </button>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-700 bg-slate-900/70 p-4 md:grid-cols-4">
        <input placeholder="Search title..." className="rounded bg-slate-800 p-2" value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} />
        <select className="rounded bg-slate-800 p-2" value={filters.platform} onChange={(e) => setFilters({ platform: e.target.value })}>
          <option>All</option>
          {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="rounded bg-slate-800 p-2" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="rounded bg-slate-800 p-2" value={filters.genre} onChange={(e) => setFilters({ genre: e.target.value })}>
          <option>All</option>
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((game) => (
          <VhsCard
            key={game.id}
            game={game}
            actions={
              <div className="flex gap-2">
                <button
                  className="rounded border border-cyan px-2 py-1 text-xs text-cyan"
                  onClick={() => {
                    setEditing(game);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button className="rounded border border-red-400 px-2 py-1 text-xs text-red-300" onClick={() => deleteGame(game.id)}>
                  Delete
                </button>
              </div>
            }
          />
        ))}
      </div>

      <GameFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={(payload) => {
          if (editing) updateGame(editing.id, payload);
          else addGame(payload);
        }}
      />
    </section>
  );
}

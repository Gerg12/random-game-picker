'use client';

import { useMemo, useState } from 'react';
import { StoreBootstrap } from '@/components/StoreBootstrap';
import { VhsCard } from '@/components/VhsCard';
import { useGameStore } from '@/lib/store';
import { GENRES, PLATFORMS, STATUSES } from '@/lib/types';

export default function HomePage() {
  const games = useGameStore((s) => s.games);
  const history = useGameStore((s) => s.history);
  const pickerConfig = useGameStore((s) => s.pickerConfig);
  const setPickerConfig = useGameStore((s) => s.setPickerConfig);
  const spin = useGameStore((s) => s.spin);
  const currentPickId = useGameStore((s) => s.currentPickId);
  const markStatus = useGameStore((s) => s.markStatus);
  const [spinning, setSpinning] = useState(false);

  const currentPick = useMemo(() => games.find((g) => g.id === currentPickId), [games, currentPickId]);
  const recentGames = history
    .slice(-8)
    .reverse()
    .map((entry) => games.find((game) => game.id === entry.gameId))
    .filter(Boolean);

  const handleSpin = () => {
    setSpinning(true);
    setTimeout(() => {
      spin();
      setSpinning(false);
    }, 900);
  };

  return (
    <section className="space-y-8">
      <StoreBootstrap />
      <div className="rounded-lg border border-fuchsia-400/40 bg-slate-900/75 p-4">
        <h2 className="text-lg font-bold text-cyan">Random Picker</h2>
        <p className="text-sm text-slate-300">Set your filters, smash SPIN, and let the rental gods decide.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs">Include Platforms
            <select className="mt-1 w-full rounded bg-slate-800 p-2" onChange={(e) => setPickerConfig({ includePlatforms: e.target.value === 'All' ? [] : [e.target.value] })}>
              <option>All</option>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-xs">Include Status
            <select className="mt-1 w-full rounded bg-slate-800 p-2" onChange={(e) => setPickerConfig({ includeStatuses: e.target.value === 'All' ? STATUSES : [e.target.value as (typeof STATUSES)[number]] })}>
              <option>All</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs">Include Genre
            <select className="mt-1 w-full rounded bg-slate-800 p-2" onChange={(e) => setPickerConfig({ includeGenres: e.target.value === 'All' ? [] : [e.target.value] })}>
              <option>All</option>
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
          <label className="text-xs">Exclude Genre
            <select className="mt-1 w-full rounded bg-slate-800 p-2" onChange={(e) => setPickerConfig({ excludeGenres: e.target.value === 'None' ? [] : [e.target.value] })}>
              <option>None</option>
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={pickerConfig.avoidRecent} onChange={(e) => setPickerConfig({ avoidRecent: e.target.checked })} />Avoid recent picks</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={pickerConfig.prioritizeBacklog} onChange={(e) => setPickerConfig({ prioritizeBacklog: e.target.checked })} />Prioritize Backlog</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={pickerConfig.deprioritizeCompleted} onChange={(e) => setPickerConfig({ deprioritizeCompleted: e.target.checked })} />De-prioritize Completed</label>
        </div>
        <button
          onClick={handleSpin}
          className={`mt-4 w-full rounded-lg bg-gradient-to-r from-neon to-cyan px-6 py-4 text-2xl font-black uppercase tracking-widest text-black transition ${spinning ? 'animate-pulseSlow' : ''}`}
        >
          {spinning ? 'Spinning...' : 'SPIN'}
        </button>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/75 p-4">
        <h3 className="mb-4 text-xl font-bold text-neon">Selected Game</h3>
        {currentPick ? (
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <VhsCard
              game={currentPick}
              actions={
                <div className="mt-2 flex gap-2">
                  <button onClick={handleSpin} className="rounded bg-cyan px-2 py-1 text-xs font-semibold text-black">Pick Again</button>
                </div>
              }
            />
            <div className="space-y-3">
              <p className="text-slate-200">{currentPick.notes || 'No notes yet. Add strategy notes from the Library page.'}</p>
              <p className="text-sm text-slate-400">Tags: {currentPick.genres.join(', ') || 'No tags'}</p>
              <div className="flex gap-2">
                <button className="rounded bg-amber-400 px-3 py-2 text-sm font-semibold text-black" onClick={() => markStatus(currentPick.id, 'Playing')}>Mark as Playing</button>
                <button className="rounded bg-emerald-400 px-3 py-2 text-sm font-semibold text-black" onClick={() => markStatus(currentPick.id, 'Completed')}>Mark as Completed</button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">No pick yet. Hit SPIN to get a game.</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-cyan">Recently Picked Shelf</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {recentGames.length ? recentGames.map((game) => game && <VhsCard key={game.id} game={game} />) : <p className="text-sm text-slate-400">No picks yet.</p>}
        </div>
      </div>
    </section>
  );
}

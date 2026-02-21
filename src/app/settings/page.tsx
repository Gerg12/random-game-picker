'use client';

import { ChangeEvent, useState } from 'react';
import { StoreBootstrap } from '@/components/StoreBootstrap';
import { useGameStore, useSettingsStore } from '@/lib/store';

export default function SettingsPage() {
  const steamApiKey = useSettingsStore((s) => s.steamApiKey);
  const setSteamApiKey = useSettingsStore((s) => s.setSteamApiKey);
  const exportLibrary = useGameStore((s) => s.exportLibrary);
  const importLibrary = useGameStore((s) => s.importLibrary);
  const clearLibrary = useGameStore((s) => s.clearLibrary);
  const resetToSeed = useGameStore((s) => s.resetToSeed);
  const [message, setMessage] = useState('');

  const onExport = () => {
    const blob = new Blob([exportLibrary()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gregatron-library.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Library exported.');
  };

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = importLibrary(text);
    setMessage(result.message);
  };

  return (
    <section className="space-y-5">
      <StoreBootstrap />
      <h2 className="text-2xl font-bold text-neon">Settings</h2>

      <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <h3 className="font-semibold text-cyan">Steam API</h3>
        <label className="block text-sm">
          API Key (stored only in localStorage)
          <input
            className="mt-1 w-full rounded bg-slate-800 p-2"
            value={steamApiKey}
            onChange={(e) => setSteamApiKey(e.target.value)}
            placeholder="Paste Steam Web API key"
          />
        </label>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <h3 className="font-semibold text-cyan">Backup & Restore</h3>
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-cyan px-3 py-2 text-sm font-semibold text-black" onClick={onExport}>Export JSON</button>
          <label className="rounded border border-slate-500 px-3 py-2 text-sm">
            Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={onImport} />
          </label>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <h3 className="font-semibold text-cyan">Danger Zone</h3>
        <div className="flex flex-wrap gap-2">
          <button className="rounded border border-amber-500 px-3 py-2 text-sm text-amber-300" onClick={resetToSeed}>Reset to Starter Seed</button>
          <button className="rounded border border-red-500 px-3 py-2 text-sm text-red-300" onClick={clearLibrary}>Clear Library</button>
        </div>
      </div>

      {message ? <p className="rounded bg-slate-800 p-3 text-sm">{message}</p> : null}
    </section>
  );
}

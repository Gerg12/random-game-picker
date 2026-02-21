'use client';

import { FormEvent, useState } from 'react';
import { steamImportSchema } from '@/lib/schemas';
import { useGameStore, useSettingsStore } from '@/lib/store';

export default function ImportPage() {
  const [steamIdOrVanity, setSteamIdOrVanity] = useState('');
  const settingsKey = useSettingsStore((s) => s.steamApiKey);
  const importSteamGames = useGameStore((s) => s.importSteamGames);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    const parsed = steamImportSchema.safeParse({ steamIdOrVanity, apiKey: settingsKey });
    if (!parsed.success) {
      setMsg(parsed.error.issues[0]?.message ?? 'Invalid input.');
      return;
    }
    if (!settingsKey) {
      setMsg('Steam API key is missing. Add one in Settings, or continue using manual library entry.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/steam/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamIdOrVanity: parsed.data.steamIdOrVanity, apiKey: settingsKey })
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Import failed.');
        return;
      }
      const result = importSteamGames(data.games);
      setMsg(`Imported ${data.games.length} Steam titles (${result.added} added, ${result.updated} updated).`);
    } catch {
      setMsg('Import request failed. Check your network or API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-neon">Steam Import</h2>
      <p className="rounded border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
        Enter SteamID64 or a vanity profile name. The app resolves vanity IDs, pulls owned games + playtime, and generates cover art URLs automatically.
      </p>
      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <label className="block text-sm">
          SteamID64 or vanity name
          <input className="mt-1 w-full rounded bg-slate-800 p-2" value={steamIdOrVanity} onChange={(e) => setSteamIdOrVanity(e.target.value)} />
        </label>
        <button className="rounded bg-cyan px-4 py-2 font-semibold text-black" disabled={loading}>
          {loading ? 'Importing...' : 'Import Steam Library'}
        </button>
      </form>
      {!settingsKey ? (
        <p className="rounded border border-amber-400/40 bg-amber-950/30 p-3 text-sm text-amber-100">
          No API key saved. Steam import is limited without it. Add one under Settings.
        </p>
      ) : null}
      {msg ? <p className="rounded bg-slate-800 p-3 text-sm">{msg}</p> : null}
    </section>
  );
}

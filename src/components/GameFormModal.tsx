'use client';

import { FormEvent, useMemo, useState } from 'react';
import { GENRES, PLATFORMS, STATUSES, Game } from '@/lib/types';
import { gameSchema } from '@/lib/schemas';

type Props = {
  open: boolean;
  initial?: Game;
  onClose: () => void;
  onSubmit: (payload: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => void;
};

export function GameFormModal({ open, initial, onClose, onSubmit }: Props) {
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    platform: initial?.platform ?? 'Steam',
    genres: initial?.genres ?? ([] as string[]),
    status: initial?.status ?? 'Backlog',
    coverUrl: initial?.coverUrl ?? '',
    notes: initial?.notes ?? '',
    steamAppId: initial?.steamAppId?.toString() ?? '',
    playtimeHours: initial?.playtimeHours?.toString() ?? ''
  });

  const title = useMemo(() => (initial ? 'Edit Game' : 'Add Game'), [initial]);

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const parsed = gameSchema.safeParse({
      ...form,
      genres: form.genres,
      coverUrl: form.coverUrl || undefined,
      steamAppId: form.steamAppId || undefined,
      playtimeHours: form.playtimeHours || undefined
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid form data.');
      return;
    }
    const data = parsed.data;
    onSubmit({
      title: data.title,
      platform: data.platform,
      genres: data.genres,
      status: data.status,
      coverUrl: data.coverUrl || undefined,
      notes: data.notes,
      steamAppId: data.steamAppId,
      playtimeHours: data.playtimeHours
    });
    onClose();
  };

  const onFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, coverUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4">
      <form onSubmit={submit} className="w-full max-w-xl space-y-3 rounded-lg border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-xl font-bold text-neon">{title}</h2>
        {error ? <p className="rounded bg-red-900/40 px-2 py-1 text-sm text-red-200">{error}</p> : null}
        <input className="w-full rounded bg-slate-800 p-2" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select className="rounded bg-slate-800 p-2" value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}>
            {PLATFORMS.map((platform) => (
              <option key={platform}>{platform}</option>
            ))}
          </select>
          <select className="rounded bg-slate-800 p-2" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm text-slate-300">Genres</legend>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const active = form.genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      genres: active ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre]
                    }))
                  }
                  className={`rounded-full border px-3 py-1 text-xs ${active ? 'border-cyan bg-cyan/20 text-cyan' : 'border-slate-600 text-slate-300'}`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </fieldset>
        <input className="w-full rounded bg-slate-800 p-2" placeholder="Cover image URL" value={form.coverUrl} onChange={(e) => setForm((p) => ({ ...p, coverUrl: e.target.value }))} />
        <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => onFileUpload(e.target.files?.[0])} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="w-full rounded bg-slate-800 p-2" placeholder="Steam App ID (optional)" value={form.steamAppId} onChange={(e) => setForm((p) => ({ ...p, steamAppId: e.target.value }))} />
          <input className="w-full rounded bg-slate-800 p-2" placeholder="Playtime hours (optional)" value={form.playtimeHours} onChange={(e) => setForm((p) => ({ ...p, playtimeHours: e.target.value }))} />
        </div>
        <textarea className="min-h-24 w-full rounded bg-slate-800 p-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded border border-slate-600 px-3 py-2" onClick={onClose}>Cancel</button>
          <button type="submit" className="rounded bg-neon px-3 py-2 font-semibold text-black">Save</button>
        </div>
      </form>
    </div>
  );
}

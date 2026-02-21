import { z } from 'zod';

export const gameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  platform: z.string().min(1, 'Platform is required'),
  genres: z.array(z.string()).default([]),
  status: z.enum(['Backlog', 'Playing', 'Completed', 'Dropped']),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
  steamAppId: z.coerce.number().int().positive().optional(),
  playtimeHours: z.coerce.number().min(0).optional()
});

export const steamImportSchema = z.object({
  steamIdOrVanity: z.string().min(2, 'SteamID64 or vanity name is required'),
  apiKey: z.string().optional()
});

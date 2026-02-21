# Random Game Picker (GREGATRON Video Game Rentals)

An 80s video-store inspired backlog manager and random picker built with **Next.js App Router + TypeScript + Tailwind + Zustand + Zod**.

## Features

- VHS-style game wall with neon / scanline aesthetic.
- Library management (add/edit/delete) with:
  - title, platform, status, genres
  - optional cover URL or uploaded image (base64)
  - optional notes, Steam App ID, playtime hours
- Search + filter by platform/status/genre.
- First-run seed list (~20 popular recent games) loaded once from local JSON.
- Random picker with:
  - include/exclude filters
  - avoid-recent toggle (last N picks)
  - weighted picks (prioritize Backlog, de-prioritize Completed)
  - result actions (mark as Playing / Completed)
- Steam import route (`/api/steam/import`) with vanity resolution + owned games mapping + de-dupe by Steam App ID.
- Settings page:
  - store Steam API key locally
  - export/import JSON library
  - reset to seed / clear library

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Steam import notes

1. Get a Steam Web API key.
2. Save key on **Settings** page (localStorage only).
3. Go to **Steam Import** and enter either:
   - SteamID64 (17-digit), or
   - Vanity name.

If no key is set, import page will explain limitations and suggest manual library entry.

## Error handling

- Invalid vanity: returns clear message from API route.
- Missing key: import route returns 400 with message.
- Steam rate limits (429): surfaced to user with retry hint.

## Test plan

1. **First run seed**
   - Clear localStorage and refresh.
   - Confirm seeded games appear once.
2. **Library CRUD**
   - Add/edit/delete a game, confirm persistence after reload.
3. **Filter/search**
   - Validate title search and platform/status/genre filtering.
4. **Random picker**
   - Spin with filters and avoid-recent enabled/disabled.
   - Mark selected game as Playing/Completed.
5. **Steam import**
   - Try invalid ID (expect error).
   - Try valid ID with key (expect imported titles + de-dupe).
6. **Backup/restore**
   - Export JSON, clear library, import JSON, verify restoration.

## Known limitations

- Steam import metadata is limited to fields from `GetOwnedGames` (no genre enrichment).
- Cover image URL patterns depend on Steam CDN availability.
- No authentication/cloud sync; data is local to browser.

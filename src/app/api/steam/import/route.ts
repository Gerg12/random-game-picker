import { NextRequest, NextResponse } from 'next/server';

const STEAM_API = 'https://api.steampowered.com';

type OwnedGame = { appid: number; name: string; playtime_forever: number };

const isSteamId64 = (value: string) => /^\d{17}$/.test(value);

async function resolveSteamId(input: string, apiKey: string): Promise<string> {
  if (isSteamId64(input)) return input;
  const url = `${STEAM_API}/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(input)}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to resolve vanity URL.');
  const data = await response.json();
  const steamId = data?.response?.steamid;
  if (!steamId) throw new Error('Invalid vanity URL name.');
  return steamId;
}

export async function POST(request: NextRequest) {
  try {
    const { steamIdOrVanity, apiKey } = await request.json();
    if (!steamIdOrVanity) return NextResponse.json({ error: 'SteamID64 or vanity value is required.' }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: 'Steam API key required for import.' }, { status: 400 });

    const steamId = await resolveSteamId(String(steamIdOrVanity), String(apiKey));
    const ownedUrl = `${STEAM_API}/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;
    const response = await fetch(ownedUrl, { cache: 'no-store' });

    if (response.status === 429) {
      return NextResponse.json({ error: 'Steam API rate limit hit. Please retry shortly.' }, { status: 429 });
    }
    if (!response.ok) {
      return NextResponse.json({ error: 'Steam API request failed.' }, { status: response.status });
    }

    const data = await response.json();
    const games: OwnedGame[] = data?.response?.games ?? [];

    const mapped = games.map((game) => ({
      title: game.name,
      platform: 'Steam',
      steamAppId: game.appid,
      genres: [],
      status: 'Backlog',
      coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
      playtimeHours: Number((game.playtime_forever / 60).toFixed(1))
    }));

    return NextResponse.json({ games: mapped });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown import error.' }, { status: 500 });
  }
}

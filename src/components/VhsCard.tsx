import Image from 'next/image';
import { Game } from '@/lib/types';

type Props = {
  game: Game;
  actions?: React.ReactNode;
};

export function VhsCard({ game, actions }: Props) {
  const sticker = game.genres[0] ?? 'Unsorted';
  return (
    <article className="group overflow-hidden rounded-md border border-slate-700 bg-slate-900 shadow-vhs">
      <div className="relative aspect-[3/4] bg-slate-800">
        {game.coverUrl ? (
          <Image src={game.coverUrl} alt={`${game.title} cover`} fill className="object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-sm text-slate-400">No Cover</div>
        )}
        <span className="absolute left-2 top-2 rounded bg-neon/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
          {sticker}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 font-semibold text-slate-100">{game.title}</h3>
        <p className="text-xs text-cyan">{game.platform}</p>
        <p className="text-xs text-slate-400">{game.status}</p>
        {actions}
      </div>
    </article>
  );
}

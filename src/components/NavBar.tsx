'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/library', label: 'Library' },
  { href: '/import', label: 'Steam Import' },
  { href: '/settings', label: 'Settings' }
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-fuchsia-400/30 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="animate-flicker text-2xl font-black tracking-wider text-neon drop-shadow-[0_0_8px_rgba(255,43,214,0.8)] md:text-4xl">
            GREGATRON VIDEO GAME RENTALS
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan/90">Late fees? Never. Backlogs? Forever.</p>
        </div>
        <nav aria-label="Main navigation" className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-cyan bg-cyan/20 text-cyan shadow-neon'
                    : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:border-neon hover:text-neon'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

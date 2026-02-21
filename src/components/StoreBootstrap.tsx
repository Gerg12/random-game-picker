'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';

export function StoreBootstrap() {
  const ensureSeeded = useGameStore((s) => s.ensureSeeded);
  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);
  return null;
}

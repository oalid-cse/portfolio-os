'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { detectOs, osDisplayName, readDetectInput, type DetectedOs } from '@/lib/os-detect';
import { safeStorage } from '@/lib/safe-storage';
import { suggestSkinFor } from '@/os/core/registry';

const DISMISS_KEY = 'os-suggest-dismissed';

const defaultDetect = async (): Promise<DetectedOs> => detectOs(await readDetectInput());

type Suggestion = { detectedName: string; skinId: string; skinName: string };

export function OsSuggestBanner({ detect = defaultDetect }: { detect?: () => Promise<DetectedOs> }) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (safeStorage.get(DISMISS_KEY) === '1') return;
    let cancelled = false;
    detect()
      .then((detected) => {
        if (cancelled) return;
        const skin = suggestSkinFor(detected);
        if (!skin) return;
        setSuggestion({ detectedName: osDisplayName(detected), skinId: skin.id, skinName: skin.name });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [detect]);

  if (!suggestion) return null;

  const dismiss = () => {
    safeStorage.set(DISMISS_KEY, '1');
    setSuggestion(null);
  };

  return (
    <div
      role="region"
      aria-label="OS experience suggestion"
      className="animate-slide-up-in print:hidden border-border bg-bg-elevated text-fg fixed inset-x-4 bottom-4 z-40 rounded-xl border p-4 shadow-lg sm:left-auto sm:max-w-sm"
    >
      <p className="text-sm">
        You&apos;re on {suggestion.detectedName}. View this portfolio as {suggestion.skinName}?
      </p>
      <div className="mt-3 flex gap-2">
        <Link
          href={`/os/${suggestion.skinId}`}
          className="bg-accent text-accent-fg rounded-md px-3 py-1.5 text-sm font-medium"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="border-border text-fg-muted hover:text-fg rounded-md border px-3 py-1.5 text-sm"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

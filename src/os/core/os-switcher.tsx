import Link from 'next/link';
import { skins } from './registry';
import type { OsId } from './types';

export function OsSwitcher({ current, variant }: { current: OsId; variant: 'menu' | 'list' }) {
  const wrap = variant === 'menu' ? 'flex min-w-40 flex-col gap-0.5 text-sm' : 'flex w-full flex-col gap-1';
  const item = variant === 'menu' ? 'block rounded px-3 py-1.5' : 'block rounded-lg px-4 py-3';
  return (
    <nav aria-label="Switch OS version">
      <ul className={wrap}>
        {skins.map((s) => (
          <li key={s.id}>
            {s.status === 'ready' ? (
              <Link
                href={`/os/${s.id}`}
                aria-current={s.id === current ? 'page' : undefined}
                className={`${item} hover:bg-current/10 focus-visible:bg-current/10 aria-[current=page]:font-semibold`}
              >
                {s.name}
              </Link>
            ) : (
              <span aria-disabled="true" className={`${item} opacity-50`}>
                {s.name} <span className="text-xs">Coming soon</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

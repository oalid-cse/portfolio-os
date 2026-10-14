import Link from 'next/link';
import type { Profile } from '@/content/types';
import { SocialIcon } from './social-icon';

export function SiteFooter({ profile }: { profile: Profile }) {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-sm text-fg">{profile.name}</p>
          <p className="text-sm text-fg-muted">
            <Link href="/os" className="underline decoration-border underline-offset-4 hover:text-fg">
              Explore OS versions
            </Link>
          </p>
        </div>
        <ul className="flex items-center gap-2">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.url}
                aria-label={s.label}
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-fg-muted transition-colors hover:text-fg"
                {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <SocialIcon icon={s.icon} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { BackToClassic } from '../back-to-classic';
import { getSkinMeta } from '../registry';
import type { OsId } from '../types';

const BUTTON =
  'rounded-md border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-200';

/** Shown instead of a desktop skin on viewports narrower than 768px. */
export function SmallScreenNotice({ mobileAlternative }: { mobileAlternative: OsId }) {
  const name = getSkinMeta(mobileAlternative)?.name ?? mobileAlternative;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center text-neutral-200">
      <p className="max-w-sm text-base">This desktop experience works best on larger screens.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`/os/${mobileAlternative}`} className={BUTTON}>
          {`Open ${name}`}
        </Link>
        <BackToClassic className={BUTTON} />
      </div>
    </div>
  );
}

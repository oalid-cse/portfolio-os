import { StartGlyph } from './icons';

/** Original, logo-free boot screen: the skin's Start glyph, a ring spinner and the portfolio name. */
export function Win11BootScreen({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-(--w11-boot-bg) text-(--os-fg)">
      <StartGlyph className="size-20" />
      <p className="mt-6 text-lg font-light tracking-wide">{name}</p>
      <svg aria-hidden viewBox="0 0 32 32" className="w11-spinner mt-16 size-8 text-(--os-fg)">
        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="20 62" />
      </svg>
    </div>
  );
}

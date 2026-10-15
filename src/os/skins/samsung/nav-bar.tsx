import type { NavBarProps } from '@/os/core/mobile/mobile-shell';

const BUTTON = 'oneui-nav-btn flex h-full flex-1 items-center justify-center outline-none';

/**
 * The 3-button navigation bar: Recents, Home, Back (left to right). Recents has no task switcher
 * to show here, so it does nothing. Original glyphs drawn as SVG.
 */
export function OneUiNavBar({ onHome, onBack }: NavBarProps) {
  return (
    <nav aria-label="Navigation bar" className="oneui-nav flex h-(--mobile-nav-height) items-stretch px-6">
      <button type="button" aria-label="Recents" className={BUTTON}>
        <svg aria-hidden viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="14" height="14" rx="3.5" />
        </svg>
      </button>
      <button type="button" aria-label="Go home" onClick={onHome} className={BUTTON}>
        <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10" cy="10" r="7.6" />
        </svg>
      </button>
      <button type="button" aria-label="Back" onClick={onBack} className={BUTTON}>
        <svg aria-hidden viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.5 3.5 6 10l6.5 6.5" />
        </svg>
      </button>
    </nav>
  );
}

import type { NavBarProps } from '@/os/core/mobile/mobile-shell';

/** The home bar. iPhone has no Back button, so `onBack` goes unused here. */
export function IosHomeIndicator({ onHome }: NavBarProps) {
  return (
    <div className="flex h-(--mobile-nav-height) items-end justify-center pb-2">
      <button
        type="button"
        aria-label="Go home"
        onClick={onHome}
        className="ios-home-hit flex h-6 w-44 items-end justify-center rounded-full outline-none"
      >
        <span aria-hidden className="ios-home-bar block h-[5px] w-[134px] rounded-full" />
      </button>
    </div>
  );
}

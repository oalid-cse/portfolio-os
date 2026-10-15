import { StatusBarClock } from '@/os/core/mobile/status-bar-clock';

/** Original glyphs: a wi-fi fan, a stepped signal wedge and a slim battery. */
function Wifi() {
  return (
    <svg aria-hidden viewBox="0 0 16 12" className="h-3 w-4" fill="currentColor">
      <path d="M8 11.5 0 2.6A12 12 0 0 1 8 0a12 12 0 0 1 8 2.6Z" />
    </svg>
  );
}

function Signal() {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className="size-3.5" fill="currentColor">
      <path d="M13.5 0.5v13H.5Z" opacity="0.35" />
      <path d="M10 4v9.5H.5Z" />
    </svg>
  );
}

function Battery() {
  return (
    <svg aria-hidden viewBox="0 0 24 12" className="h-3 w-6">
      <rect x="0.75" y="0.75" width="20" height="10.5" rx="2.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2.6" y="2.6" width="13" height="6.8" rx="1.3" fill="currentColor" />
      <rect x="22" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" />
    </svg>
  );
}

/** One UI status bar: time on the left, the punch-hole camera centred, connectivity and battery on the right. */
export function OneUiStatusBar() {
  return (
    <div className="oneui-status relative flex h-(--mobile-status-height) items-center justify-between px-6">
      <StatusBarClock className="oneui-time" />
      <div aria-hidden data-testid="punch-hole" className="oneui-punch-hole absolute top-[11px] left-1/2 size-[13px] -translate-x-1/2 rounded-full" />
      <div className="flex items-center gap-[5px]">
        <Wifi />
        <Signal />
        <Battery />
      </div>
    </div>
  );
}

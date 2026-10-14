import { StatusBarClock } from '@/os/core/mobile/status-bar-clock';

/** Original glyphs: four rising bars, three wi-fi arcs, a battery with a nub. */
function Signal() {
  return (
    <svg aria-hidden viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor">
      <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
      <rect x="4.9" y="5" width="3.2" height="7" rx="1" />
      <rect x="9.8" y="2.5" width="3.2" height="9.5" rx="1" />
      <rect x="14.7" y="0" width="3.2" height="12" rx="1" />
    </svg>
  );
}

function Wifi() {
  return (
    <svg aria-hidden viewBox="0 0 16 12" className="h-3 w-4" fill="currentColor">
      <path d="M8 2.2c2.4 0 4.6.9 6.3 2.4l1.2-1.3A11 11 0 0 0 8 .4 11 11 0 0 0 .5 3.3l1.2 1.3A9.2 9.2 0 0 1 8 2.2Z" />
      <path d="M8 5.7c1.5 0 2.9.5 4 1.4l1.2-1.3A7.8 7.8 0 0 0 8 3.9a7.8 7.8 0 0 0-5.2 1.9L4 7.1c1.1-.9 2.5-1.4 4-1.4Z" />
      <path d="M8 9.2c.6 0 1.2.2 1.7.6L8 11.7 6.3 9.8c.5-.4 1.1-.6 1.7-.6Z" />
    </svg>
  );
}

function Battery() {
  return (
    <svg aria-hidden viewBox="0 0 28 13" className="h-[13px] w-7">
      <rect x="0.5" y="0.5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2" y="2" width="17" height="9" rx="2.4" fill="currentColor" />
      <path d="M26 4.4v4.2a2.3 2.3 0 0 0 0-4.2Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

/** iOS-style status bar: time on the left, signal/wi-fi/battery on the right, Dynamic Island between. */
export function IosStatusBar() {
  return (
    <div className="ios-status relative flex h-(--mobile-status-height) items-center justify-between">
      <div className="flex flex-1 justify-center pr-16">
        <StatusBarClock className="ios-time" />
      </div>
      <div aria-hidden className="ios-island absolute top-[11px] left-1/2 h-[37px] w-[125px] -translate-x-1/2 rounded-full" />
      <div className="flex flex-1 items-center justify-center gap-[6px] pl-16">
        <Signal />
        <Wifi />
        <Battery />
      </div>
    </div>
  );
}

import type { WindowChromeProps } from '../desktop/window';

/** Minimal chrome used by the desktop engine's component tests. */
export function TestChrome({ appId, title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  return (
    <div {...dragHandleProps} className={`h-10 ${dragHandleProps.className ?? ''}`} data-testid="titlebar" data-focused={focused} data-mode={mode} data-app-id={appId}>
      <span>{title}</span>
      <button type="button" onClick={onMinimize}>
        Minimize
      </button>
      <button type="button" onClick={onToggleMaximize}>
        Maximize
      </button>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

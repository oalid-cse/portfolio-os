import type { WindowChromeProps } from '../desktop/window';

/** Minimal chrome used by the desktop engine's component tests. */
export function TestChrome({ title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  return (
    <div {...dragHandleProps} data-testid="titlebar" data-focused={focused} data-mode={mode}>
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

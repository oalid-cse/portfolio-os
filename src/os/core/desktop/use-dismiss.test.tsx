import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { type DismissReason, useDismiss } from './use-dismiss';

afterEach(cleanup);

function Harness({
  onClose,
  enabled,
  ignore,
}: {
  onClose(reason: DismissReason): void;
  enabled?: boolean;
  ignore?: (target: Node) => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useDismiss(ref, { ignoreRef: toggle, ignore, onClose, enabled });
  return (
    <div>
      <button ref={toggle} type="button">
        toggle
      </button>
      <span data-testid="extra">extra</span>
      <div ref={ref} data-testid="menu">
        <button type="button">inside</button>
      </div>
      <p data-testid="outside">outside</p>
    </div>
  );
}

describe('useDismiss', () => {
  it('closes with "outside" on a pointer-down outside the element', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onClose).toHaveBeenCalledExactlyOnceWith('outside');
  });

  it('ignores pointer-downs inside the element and inside ignoreRef', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'inside' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'toggle' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores targets matched by the ignore predicate', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} ignore={(t) => t === screen.getByTestId('extra')} />);
    fireEvent.pointerDown(screen.getByTestId('extra'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes with "escape" on Escape only', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('uses the latest onClose without re-subscribing', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Harness onClose={first} />);
    rerender(<Harness onClose={second} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('does nothing while disabled, and removes its listeners on unmount', () => {
    const onClose = vi.fn();
    const { rerender, unmount } = render(<Harness onClose={onClose} enabled={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    rerender(<Harness onClose={onClose} />);
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.pointerDown(document.body);
    expect(onClose).not.toHaveBeenCalled();
  });
});

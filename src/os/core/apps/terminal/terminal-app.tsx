'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { AppProps } from '../app-props';
import { promptFor, runCommand } from './commands';

type Line = { id: number; text: string; kind: 'input' | 'output' };

const WELCOME = "Welcome! Type 'help' to see available commands.";

export function TerminalApp({ data, openApp }: AppProps) {
  const prompt = promptFor(data.profile);
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState('');
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [lines]);

  // On phones the on-screen keyboard shrinks the viewport after focus: keep the prompt visible,
  // now and again once the keyboard is up.
  const keyboardTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(keyboardTimer.current), []);
  const keepInputInView = () => {
    const reveal = () => inputRef.current?.scrollIntoView?.({ block: 'nearest' });
    reveal();
    window.clearTimeout(keyboardTimer.current);
    keyboardTimer.current = window.setTimeout(reveal, 350);
  };

  const submit = () => {
    const input = value;
    const result = runCommand(input, data);
    const add: Line[] = [{ id: nextId.current++, text: `${prompt} ${input}`, kind: 'input' }];
    for (const text of result.output) add.push({ id: nextId.current++, text, kind: 'output' });
    setLines((prev) => (result.effect?.type === 'clear' ? [] : [...prev, ...add]));
    if (input.trim()) setPast((p) => [...p, input]);
    setCursor(null);
    setValue('');
    if (result.effect?.type === 'open') openApp(result.effect.app);
    if (result.effect?.type === 'navigate') {
      const { href } = result.effect;
      // Documents (the resume PDF) open in a new tab; page navigation (exit → '/') stays in place.
      if (href.endsWith('.pdf')) window.open(href, '_blank', 'noopener');
      else window.location.assign(href);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (past.length === 0) return;
      const i = cursor === null ? past.length - 1 : Math.max(cursor - 1, 0);
      setCursor(i);
      setValue(past[i] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cursor === null) return;
      const i = cursor + 1;
      if (i >= past.length) {
        setCursor(null);
        setValue('');
      } else {
        setCursor(i);
        setValue(past[i] ?? '');
      }
    }
  };

  return (
    <div
      className="os-app os-mono"
      style={{ fontSize: '0.875rem' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div aria-live="polite" role="log">
        <p className="os-muted">{WELCOME}</p>
        {lines.map((l) => (
          <p key={l.id} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {l.text}
          </p>
        ))}
      </div>
      <div className="os-row" style={{ flexWrap: 'nowrap', gap: '0.5rem' }}>
        <label htmlFor="os-terminal-input" className="os-terminal-prompt">
          {prompt}
        </label>
        <input
          id="os-terminal-input"
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={keepInputInView}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="os-terminal-input"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { AppProps } from '../app-props';
import { runCommand } from './commands';

type Line = { id: number; text: string; kind: 'input' | 'output' };

const PROMPT = 'oalid@portfolio:~$';
const WELCOME = "Welcome! Type 'help' to see available commands.";

export function TerminalApp({ data, openApp }: AppProps) {
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

  const submit = () => {
    const input = value;
    const result = runCommand(input, data);
    const add: Line[] = [{ id: nextId.current++, text: `${PROMPT} ${input}`, kind: 'input' }];
    for (const text of result.output) add.push({ id: nextId.current++, text, kind: 'output' });
    setLines((prev) => (result.effect?.type === 'clear' ? [] : [...prev, ...add]));
    if (input.trim()) setPast((p) => [...p, input]);
    setCursor(null);
    setValue('');
    if (result.effect?.type === 'open') openApp(result.effect.app);
    if (result.effect?.type === 'navigate') window.location.assign(result.effect.href);
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
        <label htmlFor="os-terminal-input" style={{ whiteSpace: 'nowrap', color: 'var(--os-accent, #4cc2ff)' }}>
          {PROMPT}
        </label>
        <input
          id="os-terminal-input"
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{ border: 0, padding: 0, flex: 1, outline: 'none' }}
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

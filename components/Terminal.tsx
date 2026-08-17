'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Line {
  type: 'prompt' | 'output' | 'blank' | 'error';
  text: string;
}

const COMMANDS: Record<string, () => string | string[]> = {
  help: () => [
    'Available commands:',
    '  help     — show this help',
    '  about    — about 0d4y',
    '  whoami   — current user',
    '  github   — GitHub profile',
    '  projects — view projects',
    '  status   — current status',
    '  contact  — contact info',
    '  aur      — AUR package',
    '  clear    — clear terminal',
  ],
  about: () => [
    '0d4y — Developer & Security Enthusiast',
    'Building software, security tools, and open-source projects.',
    'Focused on: security, automation, web dev, systems.',
  ],
  whoami: () => '0d4y',
  github: () => 'https://github.com/th30d4y/',
  location: () => '0d4y.dev',
  projects: () => ['→ Visiting /projects', '(redirecting...)'],
  status: () => 'building...',
  contact: () => [
    'GitHub: https://github.com/th30d4y/',
    'Web:    https://0d4y.dev',
  ],
  aur: () => 'https://aur.archlinux.org/packages/archstore-git',
  uptime: () => 'always on',
  pwd: () => '/home/0d4y',
  ls: () => ['projects/', 'activity/', 'about/', 'README.md', 'flag.txt'],
  flag: () => '2ua7f0osIaObNIdlEiGwvzNoaI',
  'flag.txt': () => '2ua7f0osIaObNIdlEiGwvzNoaI',
  date: () => new Date().toUTCString(),
  echo: () => '',
  uname: () => '0d4y-os 1.0.0 #1 SMP',
};

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: '┌─[0d4y.dev]──────────────────────────────────────────┐' },
    { type: 'output', text: '│ Welcome to 0d4y.dev terminal. Type "help" for commands. │' },
    { type: 'output', text: '└─────────────────────────────────────────────────────────┘' },
    { type: 'blank', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const execute = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    setLines((prev) => [
      ...prev,
      { type: 'prompt', text: `$ ${cmd}` },
    ]);

    if (!trimmed) {
      setLines((prev) => [...prev, { type: 'blank', text: '' }]);
      return;
    }

    if (trimmed === 'clear') {
      setLines([]);
      return;
    }

    const [command] = trimmed.split(' ');
    const handler = COMMANDS[command];

    if (handler) {
      const result = handler();
      const outputs = Array.isArray(result) ? result : [result];
      setLines((prev) => [
        ...prev,
        ...outputs.map((text): Line => ({ type: 'output', text })),
        { type: 'blank', text: '' },
      ]);

      if (command === 'projects') {
        setTimeout(() => {
          window.location.href = '/projects';
        }, 1000);
      }
    } else {
      setLines((prev) => [
        ...prev,
        { type: 'error', text: `command not found: ${command}. Try "help"` },
        { type: 'blank', text: '' },
      ]);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input;
      setHistory((prev) => [cmd, ...prev].slice(0, 50));
      setHistoryIndex(-1);
      setInput('');
      execute(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      if (history[newIndex]) setInput(history[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : history[newIndex]);
    }
  };

  return (
    <section id="terminal" aria-label="Interactive terminal" className="section">
      <div className="section__container">
        <div className="section__eyebrow">
          <span className="section-label">07 / Terminal</span>
        </div>
        <h2 className="section__heading">Interactive Shell</h2>
        <p className="section__sub">Type <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8em', color: 'var(--text-2)', background: 'var(--bg-raised)', padding: '1px 5px', borderRadius: 3 }}>help</code> to see available commands</p>

        <div className="terminal-window" role="region" aria-label="Terminal window">
          {/* Title bar */}
          <div className="terminal-titlebar">
            <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
              <div className="terminal-dot terminal-dot--red" />
              <div className="terminal-dot terminal-dot--yellow" />
              <div className="terminal-dot terminal-dot--green" />
            </div>
            <span className="terminal-title">0d4y@0d4y.dev: ~</span>
          </div>

          {/* Output */}
          <div
            ref={containerRef}
            className="terminal-body"
            onClick={() => inputRef.current?.focus()}
            aria-live="polite"
            aria-label="Terminal output"
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === 'prompt'
                    ? 'terminal-prompt'
                    : line.type === 'error'
                    ? 'terminal-error'
                    : line.type === 'blank'
                    ? ''
                    : 'terminal-output'
                }
                style={line.type === 'blank' ? { height: 8 } : undefined}
              >
                {line.text}
              </div>
            ))}

            {/* Input line */}
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)' }}>
              <span style={{ marginRight: 8 }}>$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  caretColor: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                }}
                aria-label="Terminal input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <span className="terminal-cursor">▋</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

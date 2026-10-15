import { describe, expect, it } from 'vitest';
import { portfolioFixture as d } from '../../__fixtures__/portfolio-data';
import { ALL_APP_IDS } from '..';
import { promptFor, runCommand } from './commands';

describe('runCommand', () => {
  it('trims and lowercases the command word', () => expect(runCommand('  WHOAMI  ', d).output[0]).toContain('Abu Bin Oalid'));
  it('empty input -> no output, no effect', () => expect(runCommand('   ', d)).toEqual({ output: [] }));
  it('unknown -> command not found message', () =>
    expect(runCommand('foo bar', d).output).toEqual(["command not found: foo. Type 'help'."]));
  it('open projects -> effect', () =>
    expect(runCommand('open projects', d).effect).toEqual({ type: 'open', app: 'projects' }));
  it('open unknown app', () => expect(runCommand('open nope', d).output).toEqual(['open: no such app: nope']));
  it('exit -> navigate /', () => expect(runCommand('exit', d).effect).toEqual({ type: 'navigate', href: '/' }));
  it('resume -> navigate to pdf', () =>
    expect(runCommand('resume', d).effect).toEqual({ type: 'navigate', href: '/resume/abu-bin-oalid.pdf' }));
  it('clear -> clear effect', () => expect(runCommand('clear', d).effect).toEqual({ type: 'clear' }));
  it('ls and ls projects', () => {
    expect(runCommand('ls', d).output).toEqual(['about.txt  projects/  experience/  skills/  resume.pdf  contact']);
    expect(runCommand('ls projects', d).output).toEqual(['alhisab', 'beta-app']);
  });
  it('about / cat about.txt print summary', () => {
    expect(runCommand('about', d).output).toEqual([d.profile.summary]);
    expect(runCommand('cat about.txt', d).output).toEqual([d.profile.summary]);
  });
  it('contact lists email and socials', () => {
    const out = runCommand('contact', d).output.join('\n');
    expect(out).toContain('hello@example.com');
    expect(out).toContain('GitHub');
  });
  it('skills and experience', () => {
    expect(runCommand('skills', d).output[0]).toContain('PHP');
    expect(runCommand('experience', d).output).toHaveLength(3);
  });
  it('sudo', () => expect(runCommand('sudo rm -rf /', d).output).toEqual(['Nice try. 🙂']));
  it('help lists every command', () => {
    const out = runCommand('help', d).output.join('\n');
    for (const c of ['help', 'whoami', 'about', 'ls', 'skills', 'experience', 'contact', 'open', 'resume', 'exit', 'clear'])
      expect(out).toContain(c);
  });
});

describe('promptFor', () => {
  it('uses the last name token, lowercased', () => {
    expect(promptFor({ name: 'Abu Bin Oalid' })).toBe('oalid@portfolio:~$');
    expect(promptFor({ name: '  Jane   Doe ' })).toBe('doe@portfolio:~$');
  });
  it('strips characters a shell user name would not have, with a fallback', () => {
    expect(promptFor({ name: "Seán O'Brien" })).toBe('obrien@portfolio:~$');
    expect(promptFor({ name: '' })).toBe('guest@portfolio:~$');
  });
});

describe('ALL_APP_IDS', () => {
  it('lists every app once, in a stable order', () =>
    expect(ALL_APP_IDS).toEqual(['about', 'projects', 'experience', 'skills', 'resume', 'contact', 'terminal', 'browser']));
  it('help lists every app id for open', () =>
    expect(runCommand('help', d).output.join('\n')).toContain(ALL_APP_IDS.join(', ')));
});

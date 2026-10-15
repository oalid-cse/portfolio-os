import type { PortfolioData, Profile } from '@/content/types';
import type { AppId } from '../../types';
// Circular (index → terminal-app → commands → index): ALL_APP_IDS is only read inside functions,
// never at module load, so whichever module loads first, it is initialised before use.
import { ALL_APP_IDS } from '..';

export type TermEffect = { type: 'open'; app: AppId } | { type: 'clear' } | { type: 'navigate'; href: string };
export type TermResult = { output: string[]; effect?: TermEffect };

/** Shell prompt from the owner's name, e.g. `oalid@portfolio:~$` for "Abu Bin Oalid". */
export function promptFor(profile: Pick<Profile, 'name'>): string {
  const last = profile.name.trim().split(/\s+/).at(-1) ?? '';
  const user = last.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'guest';
  return `${user}@portfolio:~$`;
}

const helpLines = (): [string, string][] => [
  ['help', 'show this list'],
  ['whoami', 'name and title'],
  ['about', 'short summary (also: cat about.txt)'],
  ['ls', 'list files (ls projects lists project slugs)'],
  ['skills', 'skills by group'],
  ['experience', 'work history'],
  ['contact', 'email and socials'],
  ['open <app>', `open an app (${ALL_APP_IDS.join(', ')})`],
  ['resume', 'open the resume PDF'],
  ['exit', 'back to the classic site'],
  ['clear', 'clear the terminal'],
];

export function runCommand(input: string, data: PortfolioData): TermResult {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  const [rawCmd, ...args] = parts;
  if (!rawCmd) return { output: [] };
  const cmd = rawCmd.toLowerCase();
  const { profile } = data;

  switch (cmd) {
    case 'help':
      return { output: helpLines().map(([name, desc]) => `${name.padEnd(12)} ${desc}`) };
    case 'whoami':
      return { output: [`${profile.name} - ${profile.title}`] };
    case 'about':
      return { output: [profile.summary] };
    case 'cat':
      return args[0]?.toLowerCase() === 'about.txt'
        ? { output: [profile.summary] }
        : { output: [`cat: ${args[0] ?? ''}: No such file`.replace(': :', ':')] };
    case 'ls':
      if (args[0]?.replace(/\/$/, '').toLowerCase() === 'projects') {
        return { output: data.projects.map((p) => p.slug) };
      }
      return { output: ['about.txt  projects/  experience/  skills/  resume.pdf  contact'] };
    case 'skills':
      return { output: data.skills.map((g) => `${g.label}: ${g.skills.join(', ')}`) };
    case 'experience':
      return {
        output: data.experience.map((e) => `${e.company} - ${e.role} (${e.start} to ${e.end})`),
      };
    case 'contact':
      return { output: [`email: ${profile.email}`, ...profile.socials.map((s) => `${s.label}: ${s.url}`)] };
    case 'open': {
      const target = args[0]?.toLowerCase() ?? '';
      const app = ALL_APP_IDS.find((id) => id === target);
      if (!app) return { output: [`open: no such app: ${args[0] ?? ''}`] };
      return { output: [`Opening ${app}...`], effect: { type: 'open', app } };
    }
    case 'resume':
      return { output: ['Opening resume...'], effect: { type: 'navigate', href: profile.resumePdf } };
    case 'exit':
      return { output: ['Bye!'], effect: { type: 'navigate', href: '/' } };
    case 'clear':
      return { output: [], effect: { type: 'clear' } };
    case 'sudo':
      return { output: ['Nice try. 🙂'] };
    default:
      return { output: [`command not found: ${cmd}. Type 'help'.`] };
  }
}

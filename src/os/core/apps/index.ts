import type { ComponentType } from 'react';
import type { AppIconName, AppId } from '../types';
import type { AppProps } from './app-props';
import { AboutApp } from './about-app';
import { BrowserApp } from './browser-app';
import { ContactApp } from './contact-app';
import { ExperienceApp } from './experience-app';
import { ProjectsApp } from './projects-app';
import { ResumeApp } from './resume-app';
import { SkillsApp } from './skills-app';
import { TerminalApp } from './terminal/terminal-app';
import './os-tokens.css';

export type { AppProps } from './app-props';
export type AppDefinition = {
  id: AppId;
  title: string;
  icon: AppIconName;
  Component: ComponentType<AppProps>;
};

export const apps: Record<AppId, AppDefinition> = {
  about: { id: 'about', title: 'About', icon: 'about', Component: AboutApp },
  projects: { id: 'projects', title: 'Projects', icon: 'projects', Component: ProjectsApp },
  experience: { id: 'experience', title: 'Experience', icon: 'experience', Component: ExperienceApp },
  skills: { id: 'skills', title: 'Skills', icon: 'skills', Component: SkillsApp },
  resume: { id: 'resume', title: 'Resume', icon: 'resume', Component: ResumeApp },
  contact: { id: 'contact', title: 'Contact', icon: 'contact', Component: ContactApp },
  terminal: { id: 'terminal', title: 'Terminal', icon: 'terminal', Component: TerminalApp },
  browser: { id: 'browser', title: 'Browser', icon: 'browser', Component: BrowserApp },
};

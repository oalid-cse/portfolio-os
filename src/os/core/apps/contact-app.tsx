'use client';

import { sendContact } from '@/app/actions/contact';
import { ContactForm } from '@/components/site/contact-form';
import type { AppProps } from './app-props';

export function ContactApp({ data }: AppProps) {
  const { profile, features } = data;
  return (
    <div className="os-app os-stack">
      <h1>Contact</h1>
      <p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      {features.contactForm && <ContactForm action={sendContact} />}
      <ul className="os-stack" style={{ gap: '0.25rem' }} aria-label="Socials">
        {profile.socials.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

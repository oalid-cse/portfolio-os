import { ContactForm } from '@/components/site/contact-form';
import { SocialIcon } from '@/components/site/social-icon';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Profile } from '@/content/types';
import { sendContact } from '@/app/actions/contact';
import { isContactFormEnabled } from '@/lib/features';

export function ContactSection({ profile }: { profile: Profile }) {
  const formEnabled = isContactFormEnabled();
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 py-12">
      <SectionHeading id="contact-title">Contact</SectionHeading>
      <div className="space-y-6">
        <p className="max-w-prose leading-relaxed text-fg-muted">
          {formEnabled
            ? 'Have a backend project or role in mind? Send me a message below or email me directly.'
            : 'Have a backend project or role in mind? Email me and I will get back to you.'}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href={`mailto:${profile.email}`}>Email me</ButtonLink>
          <span className="select-all font-mono text-sm text-fg-muted">{profile.email}</span>
          <ul className="flex items-center gap-2">
            {profile.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  aria-label={s.label}
                  className="inline-flex size-10 items-center justify-center rounded-md border border-border text-fg-muted transition-colors hover:text-fg"
                  {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <SocialIcon icon={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        {formEnabled ? <ContactForm action={sendContact} /> : null}
      </div>
    </section>
  );
}

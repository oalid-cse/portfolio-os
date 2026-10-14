import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { getEducation, getExperience, getProfile, getSkillGroups } from '@/lib/content';
import { formatDateRange } from '@/lib/format';
import '../../print.css';

export const metadata: Metadata = { title: 'Resume' };

const h2 = 'mb-4 border-b border-border pb-1 font-mono text-sm uppercase tracking-wider text-fg-muted';

export default async function ResumePage() {
  const [profile, skills, experience, education] = await Promise.all([
    getProfile(),
    getSkillGroups(),
    getExperience(),
    getEducation(),
  ]);
  return (
    <article className="resume mx-auto w-full max-w-3xl space-y-10 py-16">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{profile.name}</h1>
            <p className="text-lg text-fg-muted">{profile.title}</p>
          </div>
          <ButtonLink href={profile.resumePdf} variant="secondary" className="print-hidden" download>
            Download PDF
          </ButtonLink>
        </div>
        <p className="text-sm text-fg-muted">
          {profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a> · {profile.phone}
        </p>
        <p className="text-sm text-fg-muted">
          {profile.socials.map((s, i) => (
            <span key={s.label}>
              {i > 0 && ' · '}
              <a href={s.url}>{s.label}</a>
            </span>
          ))}
        </p>
      </div>

      <section aria-labelledby="r-summary">
        <h2 id="r-summary" className={h2}>
          Summary
        </h2>
        <p className="leading-relaxed">{profile.summary}</p>
      </section>

      <section aria-labelledby="r-experience">
        <h2 id="r-experience" className={h2}>
          Experience
        </h2>
        <div className="space-y-6">
          {experience.map((e) => (
            <div key={e.id}>
              <h3 className="text-lg font-semibold">{e.company}</h3>
              <p className="text-sm text-fg-muted">
                {e.role} · {e.location} · {formatDateRange(e.start, e.end)}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="r-skills">
        <h2 id="r-skills" className={h2}>
          Skills
        </h2>
        <dl className="space-y-2">
          {skills.map((g) => (
            <div key={g.id}>
              <dt className="inline font-medium">{g.label}: </dt>
              <dd className="inline">{g.skills.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="r-education">
        <h2 id="r-education" className={h2}>
          Education
        </h2>
        <div className="space-y-4">
          {education.map((e) => (
            <div key={e.id}>
              <h3 className="font-semibold">{e.institution}</h3>
              <p className="text-sm text-fg-muted">
                {e.degree} · {e.location} · {formatDateRange(e.start, e.end)}
                {e.grade ? ` · ${e.grade}` : ''}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

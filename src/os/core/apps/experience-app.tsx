import { formatDateRange } from '@/lib/format';
import type { AppProps } from './app-props';

export function ExperienceApp({ data }: AppProps) {
  return (
    <div className="os-app os-stack">
      <h1 className="os-app-title">Experience</h1>
      <ol className="os-stack" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {data.experience.map((job) => (
          <li key={job.id} className="os-card os-stack" style={{ gap: '0.5rem' }}>
            <div>
              <h2>{job.company}</h2>
              <p>{job.role}</p>
              <p className="os-muted">
                {formatDateRange(job.start, job.end)} · {job.location}
              </p>
            </div>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem' }}>
              {job.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {data.education.length > 0 && (
        <>
          <h1>Education</h1>
          <ul className="os-stack" style={{ gap: '0.5rem' }}>
            {data.education.map((e) => (
              <li key={e.id} className="os-card">
                <h2>{e.institution}</h2>
                <p>{e.degree}</p>
                <p className="os-muted">
                  {formatDateRange(e.start, e.end)} · {e.location}
                  {e.grade ? ` · ${e.grade}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

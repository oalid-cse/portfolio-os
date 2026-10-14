import type { AppProps } from './app-props';

export function AboutApp({ data }: AppProps) {
  const { profile } = data;
  return (
    <div className="os-app os-stack">
      <div className="os-row" style={{ gap: '1rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="os-avatar" src={profile.avatar} alt={`Portrait of ${profile.name}`} width={96} height={96} />
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.title}</p>
          <p className="os-muted">
            {profile.location} · {profile.yearsOfExperience}+ years
          </p>
        </div>
      </div>
      <p className="os-muted">{profile.tagline}</p>
      <p>{profile.summary}</p>
    </div>
  );
}

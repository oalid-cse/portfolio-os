import type { AppProps } from './app-props';

export function SkillsApp({ data }: AppProps) {
  return (
    <div className="os-app os-stack">
      <h1 className="os-app-title">Skills</h1>
      {data.skills.map((group) => (
        <section key={group.id} className="os-stack" style={{ gap: '0.5rem' }}>
          <h2>{group.label}</h2>
          <ul className="os-row">
            {group.skills.map((s) => (
              <li key={s} className="os-chip">
                {s}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

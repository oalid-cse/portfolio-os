import type { AppProps } from './app-props';

export function ResumeApp({ data }: AppProps) {
  const { resumePdf } = data.profile;
  return (
    <div className="os-app os-stack" style={{ display: 'flex', minHeight: '100%' }}>
      <p>
        <a href={resumePdf} download>
          Download resume (PDF)
        </a>
      </p>
      <iframe title="Resume PDF" src={resumePdf} className="os-frame" />
    </div>
  );
}

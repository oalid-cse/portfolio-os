import Link from 'next/link';

export function BackToClassic({ className }: { className?: string }) {
  return (
    <Link href="/" className={className ?? 'underline underline-offset-4'}>
      Back to classic view
    </Link>
  );
}

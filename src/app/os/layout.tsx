import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function OsLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh flex-1">{children}</main>;
}

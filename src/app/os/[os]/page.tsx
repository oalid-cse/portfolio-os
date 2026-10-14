import { notFound } from 'next/navigation';
import { getPortfolioData } from '@/lib/content';
import { OsHost } from '@/os/core/os-host';
import { isReadyOsId, skins } from '@/os/core/registry';

export const dynamicParams = false;

export function generateStaticParams() {
  return skins.filter((s) => s.status === 'ready').map((s) => ({ os: s.id }));
}

export default async function OsPage({ params }: { params: Promise<{ os: string }> }) {
  const { os } = await params;
  if (!isReadyOsId(os)) notFound();
  const data = await getPortfolioData();
  return (
    <div className="h-dvh overflow-hidden">
      <OsHost id={os} data={data} />
    </div>
  );
}

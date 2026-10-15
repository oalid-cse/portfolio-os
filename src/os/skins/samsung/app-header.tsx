import { ArrowLeft } from 'lucide-react';

/**
 * One UI's expanded app bar: the top ~30% of the screen is a calm band with the large title (the
 * screen's h1) sitting low in it, so it is within thumb reach; the toolbar with the up arrow sits
 * under it. Content starts below the band.
 */
export function OneUiAppHeader({ title, onBack }: { title: string; onBack(): void }) {
  return (
    <header className="oneui-header flex shrink-0 flex-col justify-end">
      <h1 className="oneui-large-title">{title}</h1>
      <div className="flex h-14 items-center px-2">
        <button type="button" aria-label="Navigate up" onClick={onBack} className="oneui-up flex size-11 items-center justify-center rounded-full outline-none">
          <ArrowLeft aria-hidden className="size-6" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

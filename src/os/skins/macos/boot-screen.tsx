import { SystemGlyph } from './icons';

/** Original, logo-free boot screen: the system glyph over a thin filling progress bar. */
export function MacBootScreen({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black text-white">
      <SystemGlyph className="size-20" />
      <div aria-hidden className="mt-14 h-[5px] w-52 overflow-hidden rounded-full bg-(--mac-boot-track)">
        <div className="mac-boot-progress h-full rounded-full bg-white" />
      </div>
      <p className="sr-only">{name}</p>
    </div>
  );
}

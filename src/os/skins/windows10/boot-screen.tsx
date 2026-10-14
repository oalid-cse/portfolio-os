import { StartGlyph } from './icons';

/** Original, logo-free boot screen: the skin's Start glyph in accent blue, the portfolio name and orbiting dots. */
export function Win10BootScreen({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-(--w10-boot-bg) text-white">
      <StartGlyph className="size-24 text-(--w10-accent)" />
      <p className="mt-6 text-lg font-light">{name}</p>
      <div aria-hidden className="w10-dots relative mt-20 size-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="absolute inset-0 flex justify-center">
            <span className="size-[5px] rounded-full bg-white" />
          </span>
        ))}
      </div>
    </div>
  );
}

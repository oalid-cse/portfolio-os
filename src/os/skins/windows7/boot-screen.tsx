import { SparkGlyph } from './icons';

/** Original, logo-free boot screen: a glowing spark gathering light over black, and the portfolio name. */
export function Win7BootScreen({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-(--w7-boot-bg) text-white">
      <span className="w7-boot-glow relative flex size-28 items-center justify-center">
        <SparkGlyph className="relative size-20 text-(--w7-boot-spark)" />
      </span>
      <p className="mt-10 text-lg tracking-wide text-(--w7-boot-fg) [text-shadow:0_0_12px_rgb(120_190_255/0.6)]">Starting {name}</p>
    </div>
  );
}

/** Original, logo-free boot screen: the "Portfolio XP" wordmark over black and a 3-block marquee bar. */
export function XpBootScreen({ name }: { name: string }) {
  return (
    <div className="xp-boot flex h-full w-full flex-col items-center justify-center">
      <p className="xp-boot-wordmark flex items-start text-[44px] leading-none font-bold tracking-tight">
        Portfolio
        <span className="xp-boot-xp ml-1 text-[26px] italic">XP</span>
      </p>
      <span aria-hidden className="xp-boot-track relative mt-14 block h-[18px] w-[150px] overflow-hidden rounded-[4px]">
        <span className="xp-boot-blocks absolute top-[3px] flex gap-[2px]">
          <span className="xp-boot-block" />
          <span className="xp-boot-block" />
          <span className="xp-boot-block" />
        </span>
      </span>
      <p className="xp-boot-caption absolute bottom-6 left-8 text-[13px]">Starting {name}</p>
    </div>
  );
}

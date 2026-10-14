/** Original, logo-free boot screen: the owner's name in Ubuntu type over aubergine and an orange spinner. */
export function UbuntuBootScreen({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-(--ubu-boot) text-white">
      <p className="text-[34px] font-light tracking-tight lowercase">{name}</p>
      <svg aria-hidden viewBox="0 0 32 32" className="ubu-spinner mt-16 size-8">
        <circle cx="16" cy="16" r="13" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="3" />
        <path d="M16 3a13 13 0 0 1 13 13" fill="none" stroke="var(--ubu-orange)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="absolute bottom-10 text-[13px] text-white/60">Starting the portfolio desktop</p>
    </div>
  );
}

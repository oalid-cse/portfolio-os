/** Original, logo-free boot screen: the owner's name on black with three dots that light in turn. */
export function OneUiBootScreen({ name }: { name: string }) {
  return (
    <div className="oneui-boot flex h-full w-full flex-col items-center justify-center">
      <p className="text-[30px] font-light tracking-tight">{name}</p>
      <div aria-hidden className="oneui-boot-dots mt-10 flex gap-2">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

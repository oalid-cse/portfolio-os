/** Navigation bar with a `‹ Back` button over a large title, as in iOS apps. */
export function IosAppHeader({ title, onBack }: { title: string; onBack(): void }) {
  return (
    <header className="ios-header shrink-0 px-4 pb-1.5">
      <div className="flex h-11 items-center">
        <button type="button" onClick={onBack} className="ios-back -ml-1.5 flex items-center gap-1 rounded-md px-1.5 py-1 outline-none">
          <span className="ios-chevron">‹</span> Back
        </button>
      </div>
      <p className="ios-large-title">{title}</p>
    </header>
  );
}

/** Id of the classic site's `<main>`: the skip link's target and where dismissed overlays send focus. */
export const MAIN_CONTENT_ID = 'main-content';

/** Visually hidden until focused: lets keyboard users jump past the header to the page content. */
export function SkipLink() {
  return (
    <a
      data-site-chrome
      href={`#${MAIN_CONTENT_ID}`}
      className="bg-accent text-accent-fg sr-only z-50 rounded-md px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to content
    </a>
  );
}

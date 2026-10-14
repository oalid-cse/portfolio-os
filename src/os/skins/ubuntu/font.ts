import { Ubuntu } from 'next/font/google';

/**
 * Ubuntu Font Family (Ubuntu Font Licence 1.0), self-hosted by next/font. Lives in the skin
 * module so only the Ubuntu chunk references it; `preload: false` keeps the font files from
 * being preloaded on the other skins that share the /os/[os] route.
 */
export const ubuntuFont = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  preload: false,
  variable: '--ubu-font',
});

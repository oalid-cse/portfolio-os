import { BackToClassic } from '@/os/core/back-to-classic';

// Placeholder until the real skin lands.
export default function Skin() {
  return (
    <div data-os-skin="iphone" className="flex h-dvh flex-col items-center justify-center gap-4">
      <p>iPhone coming soon</p>
      <BackToClassic />
    </div>
  );
}

import { BackToClassic } from '@/os/core/back-to-classic';

// Placeholder until the real skin lands.
export default function Skin() {
  return (
    <div data-os-skin="windows11" className="flex h-dvh flex-col items-center justify-center gap-4">
      <p>Windows 11 coming soon</p>
      <BackToClassic />
    </div>
  );
}

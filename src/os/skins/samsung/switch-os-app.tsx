import { BackToClassic } from '@/os/core/back-to-classic';
import { OsSwitcher } from '@/os/core/os-switcher';

/** The `Switch OS` pseudo-app: One UI settings cards — the skins, then the way back to the classic site. */
export function SwitchOsApp() {
  return (
    <div className="os-app oneui-settings">
      <p className="oneui-note">Choose how to view this portfolio.</p>
      <div className="oneui-group">
        <OsSwitcher current="samsung" variant="list" />
      </div>
      <div className="oneui-group">
        <BackToClassic className="oneui-row-action" />
      </div>
    </div>
  );
}

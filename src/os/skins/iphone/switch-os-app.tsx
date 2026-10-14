import { BackToClassic } from '@/os/core/back-to-classic';
import { OsSwitcher } from '@/os/core/os-switcher';

/** The `Switch OS` pseudo-app: a Settings-like grouped list of skins, then the way back to the classic site. */
export function SwitchOsApp() {
  return (
    <div className="os-app ios-settings">
      <p className="ios-group-note">Choose how to view this portfolio.</p>
      <div className="ios-group">
        <OsSwitcher current="iphone" variant="list" />
      </div>
      <div className="ios-group">
        <BackToClassic className="ios-row ios-row-action" />
      </div>
    </div>
  );
}

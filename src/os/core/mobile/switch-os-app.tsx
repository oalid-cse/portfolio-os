import { BackToClassic } from '../back-to-classic';
import { OsSwitcher } from '../os-switcher';
import type { OsId } from '../types';

export type SwitchOsAppProps = {
  current: OsId;
  /** Skin classes: the app root (after `os-app`), the intro note, each group card, the back-to-classic row. */
  classNames: { root: string; note: string; group: string; action: string };
};

/** The mobile `Switch OS` pseudo-app: the skins as a settings-like list, then the way back to the classic site. */
export function SwitchOsApp({ current, classNames }: SwitchOsAppProps) {
  return (
    <div className={`os-app ${classNames.root}`}>
      <p className={classNames.note}>Choose how to view this portfolio.</p>
      <div className={classNames.group}>
        <OsSwitcher current={current} variant="list" />
      </div>
      <div className={classNames.group}>
        <BackToClassic className={classNames.action} />
      </div>
    </div>
  );
}

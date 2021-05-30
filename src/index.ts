import { App } from "vue";
import { install as BreakPointManagerInstaller, IOptions as BreakPointManagerOptions } from "./BreakPointManager";
import { install as LocaleManagerInstaller, IOptions as LocaleManagerOptions } from "./LocaleManager";
import { install as ThemeManagerInstaller, IOptions as ThemeManagerOptions } from "./ThemeManager";
import { install as EventManagerInstaller } from "./EventManager";
import { install as PopupManagerInstaller, IOptions as PopupManagerOptions } from "./PopupManager";
import { ClassModifier } from "./v-class-modifier";

export interface IOptions {
  $bpm?: BreakPointManagerOptions;
  $llm?: LocaleManagerOptions;
  $tmm?: ThemeManagerOptions;
  $evm?: any;
  $ppm?: PopupManagerOptions;
}

export function install(vueapp: App, options: IOptions = {}): void {
  vueapp.use(BreakPointManagerInstaller, options.$bpm);
  vueapp.use(LocaleManagerInstaller, options.$llm);
  vueapp.use(ThemeManagerInstaller, options.$tmm);
  vueapp.use(EventManagerInstaller, options.$evm);
  vueapp.use(PopupManagerInstaller, options.$ppm);
  //
  vueapp.directive("class-modifier", ClassModifier as any);
}

export { BreakPointManager, install as BreakPointManagerInstaller, IOptions as BreakPointManagerOptions } from "./BreakPointManager";
export { LocaleManager, install as LocaleManagerInstaller, IOptions as LocaleManagerOptions } from "./LocaleManager";
export { ThemeManager, install as ThemeManagerInstaller, IOptions as ThemeManagerOptions } from "./ThemeManager";
export { EventDispatcher, install as EventManagerInstaller } from "./EventManager";
export { PopupManager, install as PopupManagerInstaller, IOptions as PopupManagerOptions } from "./PopupManager";
export { ClassModifier } from "./v-class-modifier";

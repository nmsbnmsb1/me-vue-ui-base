import { App } from "vue";
import { IOptions as BreakPointManagerOptions } from "./BreakPointManager";
import { IOptions as LocaleManagerOptions } from "./LocaleManager";
import { IOptions as ThemeManagerOptions } from "./ThemeManager";
import { IOptions as PopupManagerOptions } from "./PopupManager";
export interface IOptions {
    $bpm?: BreakPointManagerOptions;
    $llm?: LocaleManagerOptions;
    $tmm?: ThemeManagerOptions;
    $evm?: any;
    $ppm?: PopupManagerOptions;
}
export declare function install(vueapp: App, options?: IOptions): void;
export { BreakPointManager, install as BreakPointManagerInstaller, IOptions as BreakPointManagerOptions } from "./BreakPointManager";
export { LocaleManager, install as LocaleManagerInstaller, IOptions as LocaleManagerOptions } from "./LocaleManager";
export { ThemeManager, install as ThemeManagerInstaller, IOptions as ThemeManagerOptions } from "./ThemeManager";
export { EventDispatcher, install as EventManagerInstaller } from "./EventManager";
export { PopupManager, install as PopupManagerInstaller, IOptions as PopupManagerOptions } from "./PopupManager";
export { ClassModifier } from "./v-class-modifier";

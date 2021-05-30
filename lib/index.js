import { install as BreakPointManagerInstaller } from "./BreakPointManager";
import { install as LocaleManagerInstaller } from "./LocaleManager";
import { install as ThemeManagerInstaller } from "./ThemeManager";
import { install as EventManagerInstaller } from "./EventManager";
import { install as PopupManagerInstaller } from "./PopupManager";
import { ClassModifier } from "./v-class-modifier";
export function install(vueapp, options = {}) {
    vueapp.use(BreakPointManagerInstaller, options.$bpm);
    vueapp.use(LocaleManagerInstaller, options.$llm);
    vueapp.use(ThemeManagerInstaller, options.$tmm);
    vueapp.use(EventManagerInstaller, options.$evm);
    vueapp.use(PopupManagerInstaller, options.$ppm);
    //
    vueapp.directive("class-modifier", ClassModifier);
}
export { BreakPointManager, install as BreakPointManagerInstaller } from "./BreakPointManager";
export { LocaleManager, install as LocaleManagerInstaller } from "./LocaleManager";
export { ThemeManager, install as ThemeManagerInstaller } from "./ThemeManager";
export { EventDispatcher, install as EventManagerInstaller } from "./EventManager";
export { PopupManager, install as PopupManagerInstaller } from "./PopupManager";
export { ClassModifier } from "./v-class-modifier";
//# sourceMappingURL=index.js.map
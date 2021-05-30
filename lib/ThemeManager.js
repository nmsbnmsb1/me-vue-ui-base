import { reactive } from "vue";
export function install(vueapp, options = {}) {
    const instance = ThemeManager.getInstance();
    instance.themeMap = options.themes || {};
    instance.defaultTheme = options.default || options.current || "dark";
    instance.theme = options.current || instance.defaultTheme || "dark";
    instance.valueMap = options.values || {};
    vueapp.config.globalProperties.$tmm = instance;
    vueapp.provide("$tmm", instance);
}
export class ThemeManager {
    static instance;
    static getInstance() {
        if (!ThemeManager.instance)
            ThemeManager.instance = reactive(new ThemeManager());
        return ThemeManager.instance;
    }
    themeMap;
    defaultTheme = "";
    theme = "";
    valueMap;
    get themes() {
        const list = [];
        for (const theme in this.themeMap)
            list.push({
                label: this.themeMap[theme].label || theme,
                value: theme,
                default: theme === this.defaultTheme,
            });
        return list;
    }
    get default() {
        return this.defaultTheme;
    }
    get current() {
        return this.theme;
    }
    set current(theme) {
        if (this.theme !== theme) {
            const last = this.theme;
            this.theme = this.themeMap[theme] ? theme : "";
            this.changeStyle(this.theme, last);
        }
    }
    changeStyle(current, last) {
        if (last !== this.defaultTheme && this.themeMap[last].href) {
            const n = document.querySelector(`head link[href='${this.themeMap[last].href}']`);
            if (n)
                n.disabled = true;
        }
        //
        if (current !== this.defaultTheme && this.themeMap[current].href) {
            const n = document.querySelector(`head link[href='${this.themeMap[current].href}']`);
            if (!n) {
                const style = document.createElement("link");
                style.rel = "stylesheet";
                style.href = this.themeMap[current].href;
                document.head.appendChild(style);
            }
            else {
                n.disabled = false;
            }
        }
    }
    addValue(name, v) {
        this.valueMap[name] = v;
    }
    getValue(name, defaultV) {
        let config = this.valueMap[name];
        if (!config) {
            if (!defaultV)
                return undefined;
            //this.valueMap[name] = defaultV;
            config = defaultV;
        }
        return Object.prototype.hasOwnProperty.call(config, this.theme) ? config[this.theme] : config.default;
    }
    v(config) {
        return Object.prototype.hasOwnProperty.call(config, this.theme) ? config[this.theme] : config.default;
    }
}
//# sourceMappingURL=ThemeManager.js.map
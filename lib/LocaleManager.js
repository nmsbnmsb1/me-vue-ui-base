import { reactive } from "vue";
export function install(vueapp, options = {}) {
    const instance = LocaleManager.getInstance();
    instance.localeMap = options.locales || {};
    instance.defaultLocale = options.default || options.current || "zh-CN";
    instance.locale = options.current || instance.defaultLocale || "zh-CN";
    instance.vueI18n = options.i18n;
    vueapp.config.globalProperties.$llm = instance;
    vueapp.provide("$llm", instance);
}
export class LocaleManager {
    static instance;
    static getInstance() {
        if (!LocaleManager.instance)
            LocaleManager.instance = reactive(new LocaleManager());
        return LocaleManager.instance;
    }
    localeMap;
    defaultLocale = "";
    locale = "";
    vueI18n;
    get locales() {
        const list = [];
        for (const locale in this.localeMap) {
            list.push({
                label: this.localeMap[locale].label || locale,
                value: locale,
                default: locale === this.defaultLocale,
            });
        }
        return list;
    }
    get default() {
        return this.defaultLocale;
    }
    get current() {
        return this.locale;
    }
    set current(locale) {
        if (this.locale !== locale) {
            this.locale = this.localeMap[locale] ? locale : "";
            if (this.locale && this.vueI18n)
                this.vueI18n.global.locale = this.locale;
        }
    }
    get i18n() {
        return this.vueI18n;
    }
    t(path, option) {
        if (this.vueI18n)
            return this.vueI18n.global.t(path, option);
        let value;
        let current = this.localeMap[this.locale];
        const array = path.split(".");
        for (let i = 0, j = array.length; i < j; i++) {
            const property = array[i];
            value = current[property];
            if (i === j - 1)
                return this.template(value, option);
            if (!value)
                return "";
            current = value;
        }
        return "";
    }
    template(str, option) {
        if (!str || !option)
            return str;
        // eslint-disable-next-line
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return option[key];
            //match;
        });
    }
}
//# sourceMappingURL=LocaleManager.js.map
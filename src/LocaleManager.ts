import { App, reactive } from "vue";
import { I18n } from "vue-i18n";

export interface IOptions {
  locales?: { [locale: string]: { label?: string; [key: string]: any } };
  default?: string;
  current?: string;
  i18n?: I18n;
}

export function install(vueapp: App, options: IOptions = {}) {
  const instance: any = LocaleManager.getInstance();
  instance.localeMap = options.locales || {};
  instance.defaultLocale = options.default || options.current || "zh-CN";
  instance.locale = options.current || instance.defaultLocale || "zh-CN";
  instance.vueI18n = options.i18n;
  vueapp.config.globalProperties.$llm = instance;
  vueapp.provide("$llm", instance);
}

export interface ILocale {
  label: string;
  value: string;
  default: boolean;
}

export class LocaleManager {
  private static instance: LocaleManager;

  public static getInstance(): LocaleManager {
    if (!LocaleManager.instance) LocaleManager.instance = reactive(new LocaleManager()) as any;
    return LocaleManager.instance;
  }

  private localeMap!: { [locale: string]: { label?: string; [key: string]: any } };
  private defaultLocale = "";
  private locale = "";
  private vueI18n?: I18n;

  public get locales(): ILocale[] {
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

  public get default(): string {
    return this.defaultLocale;
  }

  public get current() {
    return this.locale;
  }

  public set current(locale: string) {
    if (this.locale !== locale) {
      this.locale = this.localeMap[locale] ? locale : "";
      if (this.locale && this.vueI18n) this.vueI18n.global.locale = this.locale;
    }
  }

  public get i18n() {
    return this.vueI18n;
  }

  public t(path: any, option?: any) {
    if (this.vueI18n) return this.vueI18n.global.t(path, option);

    let value: any;
    let current: any = this.localeMap[this.locale];
    const array = path.split(".");
    for (let i = 0, j = array.length; i < j; i++) {
      const property = array[i];
      value = current[property];
      if (i === j - 1) return this.template(value, option);
      if (!value) return "";
      current = value;
    }
    return "";
  }

  private template(str: string, option: any) {
    if (!str || !option) return str;

    // eslint-disable-next-line
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return option[key];
      //match;
    });
  }
}

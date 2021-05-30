import { App } from "vue";
import { I18n } from "vue-i18n";
export interface IOptions {
    locales?: {
        [locale: string]: {
            label?: string;
            [key: string]: any;
        };
    };
    default?: string;
    current?: string;
    i18n?: I18n;
}
export declare function install(vueapp: App, options?: IOptions): void;
export interface ILocale {
    label: string;
    value: string;
    default: boolean;
}
export declare class LocaleManager {
    private static instance;
    static getInstance(): LocaleManager;
    private localeMap;
    private defaultLocale;
    private locale;
    private vueI18n?;
    get locales(): ILocale[];
    get default(): string;
    get current(): string;
    set current(locale: string);
    get i18n(): I18n<{}, {}, {}, true> | undefined;
    t(path: any, option?: any): string;
    private template;
}

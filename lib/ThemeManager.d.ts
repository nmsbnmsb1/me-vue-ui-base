import { App } from "vue";
export interface IOptions {
    themes?: {
        [theme: string]: {
            label?: string;
            href: string;
        };
    };
    default?: string;
    current?: string;
    values?: {
        [key: string]: {
            default?: string;
            [theme: string]: any;
        };
    };
}
export declare function install(vueapp: App, options?: IOptions): void;
export interface ITheme {
    label: string;
    value: string;
    default: boolean;
}
export declare class ThemeManager {
    private static instance;
    static getInstance(): ThemeManager;
    private themeMap;
    private defaultTheme;
    private theme;
    private valueMap;
    get themes(): ITheme[];
    get default(): string;
    get current(): string;
    set current(theme: string);
    private changeStyle;
    addValue(name: string, v: {
        [theme: string]: any;
    }): void;
    getValue(name: string, defaultV?: {
        default?: string;
        [theme: string]: any;
    }): any;
    v(config: {
        [theme: string]: any;
    }): any;
}

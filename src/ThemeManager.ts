import { App, reactive } from "vue";

export interface IOptions {
  themes?: { [theme: string]: { label?: string; href: string } };
  default?: string;
  current?: string;
  values?: { [key: string]: { default?: string; [theme: string]: any } };
}

export function install(vueapp: App, options: IOptions = {}) {
  const instance: any = ThemeManager.getInstance();
  instance.themeMap = options.themes || {};
  instance.defaultTheme = options.default || options.current || "dark";
  instance.theme = options.current || instance.defaultTheme || "dark";
  instance.valueMap = options.values || {};
  vueapp.config.globalProperties.$tmm = instance;
  vueapp.provide("$tmm", instance);
}

export interface ITheme {
  label: string;
  value: string;
  default: boolean;
}

export class ThemeManager {
  private static instance: ThemeManager;

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) ThemeManager.instance = reactive(new ThemeManager()) as any;
    return ThemeManager.instance;
  }

  private themeMap!: { [name: string]: { label?: string; href?: string } };
  private defaultTheme = "";
  private theme = "";
  private valueMap!: { [key: string]: { [theme: string]: any } };

  public get themes(): ITheme[] {
    const list = [];
    for (const theme in this.themeMap)
      list.push({
        label: this.themeMap[theme].label || theme,
        value: theme,
        default: theme === this.defaultTheme,
      });
    return list;
  }

  public get default(): string {
    return this.defaultTheme;
  }

  public get current(): string {
    return this.theme;
  }

  public set current(theme: string) {
    if (this.theme !== theme) {
      const last = this.theme;
      this.theme = this.themeMap[theme] ? theme : "";
      this.changeStyle(this.theme, last);
    }
  }

  private changeStyle(current: string, last: string) {
    if (last !== this.defaultTheme && this.themeMap[last].href) {
      const n: any = document.querySelector(`head link[href='${this.themeMap[last].href}']`);
      if (n) n.disabled = true;
    }
    //
    if (current !== this.defaultTheme && this.themeMap[current].href) {
      const n: any = document.querySelector(`head link[href='${this.themeMap[current].href}']`);
      if (!n) {
        const style: any = document.createElement("link");
        style.rel = "stylesheet";
        style.href = this.themeMap[current].href;
        document.head.appendChild(style);
      } else {
        n.disabled = false;
      }
    }
  }

  public addValue(name: string, v: { [theme: string]: any }) {
    this.valueMap[name] = v;
  }

  public getValue(name: string, defaultV?: { default?: string; [theme: string]: any }): any {
    let config = this.valueMap[name];
    if (!config) {
      if (!defaultV) return undefined;
      //this.valueMap[name] = defaultV;
      config = defaultV;
    }
    return Object.prototype.hasOwnProperty.call(config, this.theme) ? config[this.theme] : config.default;
  }

  public v(config: { [theme: string]: any }): any {
    return Object.prototype.hasOwnProperty.call(config, this.theme) ? config[this.theme] : config.default;
  }
}

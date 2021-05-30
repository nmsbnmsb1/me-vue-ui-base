import { App, reactive } from "vue";
import { debounce } from "throttle-debounce";

//媒体查询
//js无法获取css定义好的媒体查询条件，并且每个项目的breakpoint不可能一致，因为使用此对象用来触发不同的媒体查询条件
//对象通过不同媒体查询条件下的zIndex作为判定依据，因此只要设定不同的zIndex 即可判断当前的媒体查询状态

export interface IOptions {
  breakpoints?: { [bp: string]: number };
  values?: { [key: string]: { default?: string; [bp: string]: any } };
}

export function install(vueapp: App, options: IOptions = {}): void {
  const instance: any = BreakPointManager.getInstance();
  instance.breakpointMap = options.breakpoints || { sm: 11, lg: 12 };
  instance.valueMap = options.values || {};
  vueapp.config.globalProperties.$bpm = instance;
  vueapp.provide("$bpm", instance);
}

export class BreakPointManager {
  private static instance: BreakPointManager;

  public static getInstance(): BreakPointManager {
    if (!BreakPointManager.instance) BreakPointManager.instance = reactive(new BreakPointManager()) as any;
    return BreakPointManager.instance;
  }

  private breakpointMap!: { [bp: string]: number };
  private zIndexMap!: { [zIndex: string]: string };
  private valueMap!: { [key: string]: { default?: string; [bp: string]: any } };
  private elm!: HTMLElement;
  private bp = "";

  //constructor() {}

  private init() {
    if (this.elm) return;
    //
    this.elm = document.createElement("div");
    this.elm.style.position = "absolute";
    this.elm.style.top = "-9999px";
    this.elm.style.width = this.elm.style.height = "0";
    this.elm.className = "";
    //
    this.zIndexMap = {};
    for (const bp in this.breakpointMap) {
      this.elm.className = `${this.elm.className} ${bp}:z`;
      this.zIndexMap[`${this.breakpointMap[bp]}`] = bp;
    }
    document.body.appendChild(this.elm);
    //
    this.bp = this.getBp();
    window.addEventListener("resize", debounce(50, this.onResize.bind(this)));
  }

  private getBp(): string {
    return this.zIndexMap[window.getComputedStyle(this.elm).getPropertyValue("z-index")];
  }

  private onResize() {
    this.bp = this.getBp();
  }

  public get breakPoints(): string[] {
    if (!this.elm) this.init();
    const list: string[] = [];
    for (const bp in this.breakpointMap) list.push(bp);
    return list;
  }

  public get current(): string {
    if (!this.elm) this.init();
    return this.bp;
  }

  //
  public addValue(key: string, v: { default?: string; [bp: string]: any }) {
    //if (!this.elm) this.init();
    this.valueMap[key] = v;
  }

  public getValue(key: string, defaultV?: { default?: string; [bp: string]: any }): any {
    if (!this.elm) this.init();
    //
    let config = this.valueMap[key];
    if (!config) {
      if (!defaultV) return undefined;
      //this.valueMap[key] = defaultV;
      config = defaultV;
    }
    return Object.prototype.hasOwnProperty.call(config, this.bp) ? config[this.bp] : config.default;
  }

  public v(config: { default?: string; [bp: string]: any }): any {
    if (!this.elm) this.init();
    return Object.prototype.hasOwnProperty.call(config, this.bp) ? config[this.bp] : config.default;
  }
}

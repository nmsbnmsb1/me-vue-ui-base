import { App } from "vue";

export function install(vueapp: App) {
  const instance: EventDispatcher = EventDispatcher.getInstance();
  vueapp.config.globalProperties.$evm = instance;
  vueapp.provide("$evm", instance);
}

export class EventDispatcher {
  private static instance: EventDispatcher;

  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) EventDispatcher.instance = new EventDispatcher();
    return EventDispatcher.instance;
  }

  private listenerMap!: { [name: string]: any[] };

  public has(name: string): boolean {
    return this.listenerMap && this.listenerMap[name] && this.listenerMap[name].length > 0;
  }

  public add(name: string, listener: any) {
    if (!this.listenerMap) this.listenerMap = {};
    if (!this.listenerMap[name]) this.listenerMap[name] = [];
    if (this.listenerMap[name].indexOf(listener) >= 0) return;
    this.listenerMap[name].push(listener);
  }

  public remove(name: string, listener: any) {
    if (!this.listenerMap) return;
    if (!this.listenerMap[name]) return;
    //
    const index = this.listenerMap[name].indexOf(listener);
    if (index >= 0) this.listenerMap[name].splice(index, 1);
  }

  public removeAll(name = "") {
    if (name === "") this.listenerMap = undefined as any;
    else {
      if (!this.listenerMap) return;
      if (!this.listenerMap[name]) return;
      this.listenerMap[name] = [];
    }
  }

  public dispatch(event: any) {
    if (!this.listenerMap) return;
    if (!this.listenerMap[event.name]) return;
    //
    const list = this.listenerMap[event.name].slice();
    list.forEach((fn) => fn(event));
  }

  public destroy() {
    this.listenerMap = undefined as any;
  }
}

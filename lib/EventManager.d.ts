import { App } from "vue";
export declare function install(vueapp: App): void;
export declare class EventDispatcher {
    private static instance;
    static getInstance(): EventDispatcher;
    private listenerMap;
    has(name: string): boolean;
    add(name: string, listener: any): void;
    remove(name: string, listener: any): void;
    removeAll(name?: string): void;
    dispatch(event: any): void;
    destroy(): void;
}

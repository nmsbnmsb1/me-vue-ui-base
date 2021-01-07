import { App } from 'vue';
export declare class EventDispatcher {
    private listenerMap;
    has(name: string): boolean;
    add(name: string, listener: any): void;
    remove(name: string, listener: any): void;
    removeAll(name?: string): void;
    dispatch(event: any): void;
    destroy(): void;
}
export declare class EventManager extends EventDispatcher {
    private static instance;
    static getInstance(): EventManager;
}
export declare function install(vueapp: App): void;

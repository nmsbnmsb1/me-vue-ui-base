import { App } from "vue";
export interface IOptions {
    breakpoints?: {
        [bp: string]: number;
    };
    values?: {
        [key: string]: {
            default?: string;
            [bp: string]: any;
        };
    };
}
export declare function install(vueapp: App, options?: IOptions): void;
export declare class BreakPointManager {
    private static instance;
    static getInstance(): BreakPointManager;
    private breakpointMap;
    private zIndexMap;
    private valueMap;
    private elm;
    private bp;
    private init;
    private getBp;
    private onResize;
    get breakPoints(): string[];
    get current(): string;
    addValue(key: string, v: {
        default?: string;
        [bp: string]: any;
    }): void;
    getValue(key: string, defaultV?: {
        default?: string;
        [bp: string]: any;
    }): any;
    v(config: {
        default?: string;
        [bp: string]: any;
    }): any;
}

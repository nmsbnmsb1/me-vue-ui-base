import { reactive } from "vue";
import { debounce } from "throttle-debounce";
export function install(vueapp, options = {}) {
    const instance = BreakPointManager.getInstance();
    instance.breakpointMap = options.breakpoints || { sm: 11, lg: 12 };
    instance.valueMap = options.values || {};
    vueapp.config.globalProperties.$bpm = instance;
    vueapp.provide("$bpm", instance);
}
export class BreakPointManager {
    static instance;
    static getInstance() {
        if (!BreakPointManager.instance)
            BreakPointManager.instance = reactive(new BreakPointManager());
        return BreakPointManager.instance;
    }
    breakpointMap;
    zIndexMap;
    valueMap;
    elm;
    bp = "";
    //constructor() {}
    init() {
        if (this.elm)
            return;
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
    getBp() {
        return this.zIndexMap[window.getComputedStyle(this.elm).getPropertyValue("z-index")];
    }
    onResize() {
        this.bp = this.getBp();
    }
    get breakPoints() {
        if (!this.elm)
            this.init();
        const list = [];
        for (const bp in this.breakpointMap)
            list.push(bp);
        return list;
    }
    get current() {
        if (!this.elm)
            this.init();
        return this.bp;
    }
    //
    addValue(key, v) {
        //if (!this.elm) this.init();
        this.valueMap[key] = v;
    }
    getValue(key, defaultV) {
        if (!this.elm)
            this.init();
        //
        let config = this.valueMap[key];
        if (!config) {
            if (!defaultV)
                return undefined;
            //this.valueMap[key] = defaultV;
            config = defaultV;
        }
        return Object.prototype.hasOwnProperty.call(config, this.bp) ? config[this.bp] : config.default;
    }
    v(config) {
        if (!this.elm)
            this.init();
        return Object.prototype.hasOwnProperty.call(config, this.bp) ? config[this.bp] : config.default;
    }
}
//# sourceMappingURL=BreakPointManager.js.map
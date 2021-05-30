export function install(vueapp) {
    const instance = EventDispatcher.getInstance();
    vueapp.config.globalProperties.$evm = instance;
    vueapp.provide("$evm", instance);
}
export class EventDispatcher {
    static instance;
    static getInstance() {
        if (!EventDispatcher.instance)
            EventDispatcher.instance = new EventDispatcher();
        return EventDispatcher.instance;
    }
    listenerMap;
    has(name) {
        return this.listenerMap && this.listenerMap[name] && this.listenerMap[name].length > 0;
    }
    add(name, listener) {
        if (!this.listenerMap)
            this.listenerMap = {};
        if (!this.listenerMap[name])
            this.listenerMap[name] = [];
        if (this.listenerMap[name].indexOf(listener) >= 0)
            return;
        this.listenerMap[name].push(listener);
    }
    remove(name, listener) {
        if (!this.listenerMap)
            return;
        if (!this.listenerMap[name])
            return;
        //
        const index = this.listenerMap[name].indexOf(listener);
        if (index >= 0)
            this.listenerMap[name].splice(index, 1);
    }
    removeAll(name = "") {
        if (name === "")
            this.listenerMap = undefined;
        else {
            if (!this.listenerMap)
                return;
            if (!this.listenerMap[name])
                return;
            this.listenerMap[name] = [];
        }
    }
    dispatch(event) {
        if (!this.listenerMap)
            return;
        if (!this.listenerMap[event.name])
            return;
        //
        const list = this.listenerMap[event.name].slice();
        list.forEach((fn) => fn(event));
    }
    destroy() {
        this.listenerMap = undefined;
    }
}
//# sourceMappingURL=EventManager.js.map
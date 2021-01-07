import { DomUtils, ObjectUtils } from 'me-utils-browserify';
const modifier = function (el, cls, reset) {
    console.log(cls);
    for (const c of cls) {
        let nodes;
        if (ObjectUtils.isString(c.sel)) {
            if (c.all === true) {
                nodes = el.querySelectorAll(c.sel);
            }
            else {
                nodes = el.querySelector(c.sel);
            }
        }
        else if (ObjectUtils.isFunction(c.sel)) {
            nodes = c.sel(el);
        }
        if (!nodes)
            return;
        if (!ObjectUtils.isArray(nodes))
            nodes = [nodes];
        for (const n of nodes) {
            DomUtils.addClass(n, c.cls);
        }
    }
};
export const ClassModifier = {
    beforeMount(el, binding, vnode, prevVNode) {
        modifier(el, binding.value, false);
    },
    updated(el, binding, vnode, prevVNode) {
        modifier(el, binding.value, false);
    },
    unmounted(el, binding, vnode, prevVNode) {
        modifier(el, binding.value, true);
    },
};
//# sourceMappingURL=v-class-modifier.js.map
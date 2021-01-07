import { VNode, DirectiveBinding } from 'vue';
export declare const ClassModifier: {
    beforeMount(el: HTMLElement, binding: DirectiveBinding, vnode: VNode, prevVNode: VNode): void;
    updated(el: HTMLElement, binding: DirectiveBinding, vnode: VNode, prevVNode: VNode): void;
    unmounted(el: HTMLElement, binding: DirectiveBinding, vnode: VNode, prevVNode: VNode): void;
};

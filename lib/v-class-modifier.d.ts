import { VNode, DirectiveBinding } from "vue";
/**
 * v-class-modifier
 * @desc 元素样式修改器
 * @example
 * ```vue
 * <div v-class-modifier="{}">
 * ```
 */
export declare const ClassModifier: {
    beforeMount(el: HTMLElement, binding: DirectiveBinding, vnode: VNode, prevVNode: VNode): void;
    updated(el: HTMLElement, binding: DirectiveBinding, vnode: VNode, prevVNode: VNode): void;
    unmounted(el: HTMLElement, binding: DirectiveBinding, vnode: VNode, prevVNode: VNode): void;
};

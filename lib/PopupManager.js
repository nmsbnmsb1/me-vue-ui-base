import { RunOne, RunAll, RunFunc, ActionForSleep, ActionForResolve } from "me-actions";
import { DomUtils } from "me-utils-browserify";
import { createPopper, } from "@popperjs/core";
export function install(vueapp, options = {}) {
    const instance = PopupManager.getInstance();
    instance.defaultOptions = options;
    vueapp.config.globalProperties.$ppm = instance;
    vueapp.provide("$ppm", instance);
}
export class PopupManager {
    static instance;
    static getInstance() {
        if (!PopupManager.instance)
            PopupManager.instance = new PopupManager();
        return PopupManager.instance;
    }
    zIndex = 2000;
    defaultOptions;
    popups = [];
    //
    bodyStore = { className: "", classList: undefined, paddingRight: "", overflowY: "" };
    bodyLocks = [];
    currentBodyClasses = undefined;
    constructor() {
        DomUtils.on(window, "keydown", (e) => {
            if (e.code !== "Escape")
                return;
            //
            for (let i = this.popups.length - 1; i >= 0; i--) {
                const context = this.popups[i];
                if (!(context.options.closePressEsc || context.options.closeClickOutside))
                    continue;
                if (context.options.closePressEsc)
                    this.close(context.popup);
                break;
            }
        });
        DomUtils.on(document, "click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            //
            for (let i = this.popups.length - 1; i >= 0; i--) {
                const context = this.popups[i];
                if (!(context.options.closePressEsc || context.options.closeClickOutside))
                    continue;
                if (context.options.closeClickOutside) {
                    if (context.options.closeClickOutsideChecker) {
                        if (!context.options.closeClickOutsideChecker(e))
                            return;
                    }
                    else {
                        if (context.el.contains(e.target))
                            return;
                    }
                    this.close(context.popup);
                }
                break;
            }
        });
    }
    //获取弹出上下文
    getContext(popup, autoCreate = false) {
        const el = popup.$el || popup;
        let context = el.$popup_context;
        if (!context && autoCreate) {
            context = { popup, el, status: "closed" };
            el.$popup_context = context;
        }
        return context;
    }
    getNextZIndex() {
        this.zIndex += 2;
        return this.zIndex;
    }
    // private emit(context: IContext, name: string, ...body: any) {
    //   if ((context.popup as Vue).$el) {
    //     (context.popup as Vue).$emit(name, context.popup, ...body);
    //   } else if ((context.popup as HTMLElement).dispatchEvent) {
    //     (context.popup as HTMLElement).dispatchEvent(new Event(name)); //eslint-disable-line
    //   }
    //   if (runtime.options.emitter) {
    //     runtime.options.emitter.$emit(name, runtime.popup, ...body);
    //   }
    // }
    mergeOptions(o1, o2) {
        const newOptions = { ...o1, ...o2 };
        //
        if (newOptions.popupClasses)
            newOptions.popupClasses = `${o1.popupClasses || ""} ${o2.popupClasses || ""}`.trim();
        if (newOptions.popupArrowClasses)
            newOptions.popupArrowClasses = `${o1.popupArrowClasses || ""} ${o2.popupArrowClasses || ""}`.trim();
        //
        if (newOptions.bodyLock && newOptions.bodyClasses)
            newOptions.bodyClasses = `${o1.bodyClasses || ""} ${o2.bodyClasses || ""}`.trim();
        //
        if (newOptions.modal && newOptions.modalClasses)
            newOptions.modalClasses = `${o1.modalClasses || ""} ${o2.modalClasses || ""}`.trim();
        if (newOptions.modal && newOptions.modalOpenAniClasses)
            newOptions.modalOpenAniClasses = `${o1.modalOpenAniClasses || ""} ${o2.modalOpenAniClasses || ""}`.trim();
        if (newOptions.modal && newOptions.modalCloseAniClasses)
            newOptions.modalCloseAniClasses = `${o1.modalCloseAniClasses || ""} ${o2.modalCloseAniClasses || ""}`.trim();
        //
        if (newOptions.openAni && newOptions.openAniClasses)
            newOptions.openAniClasses = `${o1.openAniClasses || ""} ${o2.openAniClasses || ""}`.trim();
        if (newOptions.closeAni && newOptions.closeAniClasses)
            newOptions.closeAniClasses = `${o1.closeAniClasses || ""} ${o2.closeAniClasses || ""}`.trim();
        //
        return newOptions;
    }
    getStatus(popup) {
        const context = this.getContext(popup, false);
        return !context ? "" : context.status;
    }
    willOpen(popup) {
        const context = this.getContext(popup, false);
        return !context || context.status === "closed" || context.status === "closing";
    }
    willClose(popup) {
        const context = this.getContext(popup, false);
        return !context || context.status === "opened" || context.status === "opening";
    }
    // 弹出
    open(popup, options, autoStart = true) {
        const context = this.getContext(popup, true);
        //判断Popup状态
        if (context.status === "opening")
            return context.action;
        if (context.status === "opened")
            return new ActionForResolve();
        if (context.status === "closing") {
            context.action.stop();
            context.action = undefined;
            context.status = "closed";
        }
        //open
        //合并选项
        context.options = options ? this.mergeOptions(this.defaultOptions, options) : { ...this.defaultOptions };
        //console.log(context.options);
        context.status = "opening";
        context.action = new RunOne(true).setContext(context);
        //1
        if (context.options.openDelay && context.options.openDelay > 0) {
            context.action.addChild(new ActionForSleep(context.options.openDelay));
        }
        //2
        const all = new RunAll(true, false);
        all.addChild(new RunFunc((context, action) => this.openPopup(context, action), (context, action) => this.stopOpenPopup(context, action)));
        if (context.options.bodyLock) {
            all.addChild(new RunFunc((context) => this.lockBody(context)));
        }
        if (context.options.modal) {
            all.addChild(new RunFunc((context, action) => this.openModal(context, action), (context, action) => this.stopOpenModal(context, action)));
        }
        context.action.addChild(all);
        //3
        context.action.addChild(new RunFunc(async (context) => (context.status = "opened")));
        //
        if (autoStart)
            context.action.start();
        return context.action;
    }
    async openPopup(context, action) {
        this.popups.push(context);
        //css/z-index
        if (context.options.popupClasses)
            DomUtils.addClass(context.el, context.options.popupClasses);
        context.zIndex = this.getNextZIndex();
        context.el.style.zIndex = `${context.zIndex}`;
        document.body.appendChild(context.el);
        if (context.options.onElAppended)
            context.options.onElAppended(context);
        //popper-js
        if (context.options.popupReference) {
            if (context.options.popupArrow === true && !context.arrowEl)
                context.arrowEl = document.createElement("div");
            if (context.options.popupArrow === true && context.arrowEl) {
                context.arrowEl.setAttribute("id", "popup-arrow");
                context.arrowEl.setAttribute("data-popper-arrow", "");
                if (context.options.popupArrowClasses)
                    DomUtils.addClass(context.arrowEl, context.options.popupArrowClasses);
                context.el.appendChild(context.arrowEl);
            }
            if (context.popper)
                context.popper.destroy();
            const popperOptions = {};
            if (context.options.popperPlacement)
                popperOptions.placement = context.options.popperPlacement;
            if (context.options.popperModifiers)
                popperOptions.modifiers = context.options.popperModifiers;
            if (context.options.popperStrategy)
                popperOptions.strategy = context.options.popperStrategy;
            if (context.options.popperOnFirstUpdate)
                popperOptions.onFirstUpdate = context.options.popperOnFirstUpdate;
            context.popper = createPopper(context.options.popupReference, context.el, popperOptions);
        }
        //css-animation
        if (context.options.openAni) {
            if (context.options.openAniClasses)
                DomUtils.addClass(context.el, context.options.openAniClasses);
            //
            await new Promise((resolve) => {
                context.popupOpenResolve = resolve;
                //
                if (context.options.openDuration && context.options.openDuration > 0) {
                    context.popupOpenTimer = setTimeout(resolve, context.options.openDuration, true);
                }
                else {
                    DomUtils.on(context.el, "animationend", resolve);
                    DomUtils.on(context.el, "webkitAnimationEnd", resolve);
                }
            });
            //
            if (context.popupOpenTimer) {
                clearTimeout(context.popupOpenTimer);
                context.popupOpenTimer = undefined;
            }
            if (context.popupOpenResolve) {
                DomUtils.off(context.el, "animationend", context.popupOpenResolve);
                DomUtils.off(context.el, "webkitAnimationEnd", context.popupOpenResolve);
                context.popupOpenResolve = undefined;
            }
            if (context.options.openAniClasses)
                DomUtils.removeClass(context.el, context.options.openAniClasses);
        }
    }
    async stopOpenPopup(context, action) {
        if (context.options.openAni && context.popupOpenResolve)
            context.popupOpenResolve();
    }
    async lockBody(context) {
        if (this.bodyLocks.length === 0) {
            this.bodyStore.overflowY = document.body.style.overflowY || "";
            document.body.style.overflowY = "hidden";
        }
        //如果要设置body的class
        if (context.options.bodyClasses) {
            if (this.currentBodyClasses)
                DomUtils.removeClass(document.body, this.currentBodyClasses.options.bodyClasses);
            this.currentBodyClasses = context;
            DomUtils.addClass(document.body, this.currentBodyClasses.options.bodyClasses);
        }
        //
        this.bodyLocks.push(context);
    }
    async openModal(context, action) {
        if (!context.modalEl) {
            context.modalEl = document.createElement("div");
            context.modalEl.setAttribute("id", "popup-modal");
            context.modalEl.tabIndex = 0;
            DomUtils.on(context.modalEl, "touchmove", (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
        //
        if (context.options.modalClasses)
            DomUtils.addClass(context.modalEl, context.options.modalClasses);
        context.modalEl.style.zIndex = `${context.zIndex - 1}`;
        document.body.appendChild(context.modalEl);
        //modal-ani
        if (context.options.modalOpenAni) {
            if (context.options.modalOpenAniClasses)
                DomUtils.addClass(context.modalEl, context.options.modalOpenAniClasses);
            //
            await new Promise((resolve) => {
                context.modalOpenResolve = resolve;
                //
                if (context.options.modalOpenDuration && context.options.modalOpenDuration > 0) {
                    context.modalOpenTimer = setTimeout(resolve, context.options.modalOpenDuration, true);
                }
                else {
                    DomUtils.on(context.modalEl, "animationend", resolve);
                    DomUtils.on(context.modalEl, "webkitAnimationEnd", resolve);
                }
            });
            //
            if (context.modalOpenTimer) {
                clearTimeout(context.modalOpenTimer);
                context.modalOpenTimer = undefined;
            }
            if (context.modalOpenResolve) {
                DomUtils.off(context.el, "animationend", context.modalOpenResolve);
                DomUtils.off(context.el, "webkitAnimationEnd", context.modalOpenResolve);
                context.modalOpenResolve = undefined;
            }
            if (context.options.modalOpenAniClasses)
                DomUtils.removeClass(context.modalEl, context.options.modalOpenAniClasses);
        }
    }
    async stopOpenModal(context, action) {
        if (context.options.modalOpenAni && context.modalOpenResolve)
            context.modalOpenResolve();
    }
    //关闭
    close(popup, options, autoStart = true) {
        const context = this.getContext(popup, false);
        if (!context)
            return new ActionForResolve();
        //判断Popup状态
        if (context.status === "closing")
            return context.action;
        if (context.status === "closed")
            return new ActionForResolve();
        if (context.status === "opening") {
            context.action.stop();
            context.action = undefined;
            context.status = "opened";
        }
        //close
        if (options)
            context.options = this.mergeOptions(context.options, options);
        context.status = "closing";
        context.action = new RunOne(true).setContext(context);
        //1
        if (context.options.closeDelay && context.options.closeDelay > 0) {
            context.action.addChild(new ActionForSleep(context.options.closeDelay));
        }
        //2
        const all = new RunAll(true, false);
        all.addChild(new RunFunc((context, action) => this.closePopup(context, action), (context, action) => this.stopClosePopup(context, action)));
        if (context.options.bodyLock) {
            all.addChild(new RunFunc((context) => this.unlockBody(context)));
        }
        if (context.options.modal) {
            all.addChild(new RunFunc((context, action) => this.closeModal(context, action), (context, action) => this.stopCloseModal(context, action)));
        }
        context.action.addChild(all);
        //3
        context.action.addChild(new RunFunc(async (context) => {
            context.status = "closed";
            //
            if (!context.options.closeDestroy) {
                this.resetPopup(context);
            }
            else {
                this.destroyPopup(context);
            }
        }));
        //
        if (autoStart)
            context.action.start();
        return context.action;
    }
    async closePopup(context, action) {
        this.popups.splice(this.popups.indexOf(context), 1);
        //css-animation
        if (context.options.closeAni) {
            if (context.options.closeAniClasses)
                DomUtils.addClass(context.el, context.options.closeAniClasses);
            //
            await new Promise((resolve) => {
                context.popupCloseResolve = resolve;
                //
                if (context.options.closeDuration && context.options.closeDuration > 0) {
                    context.popupCloseTimer = setTimeout(resolve, context.options.closeDuration, true);
                }
                else {
                    DomUtils.on(context.el, "animationend", resolve);
                    DomUtils.on(context.el, "webkitAnimationEnd", resolve);
                }
            });
            //clean-up
            if (context.popupCloseTimer) {
                clearTimeout(context.popupCloseTimer);
                context.popupCloseTimer = undefined;
            }
            if (context.popupCloseResolve) {
                DomUtils.off(context.el, "animationend", context.popupCloseResolve);
                DomUtils.off(context.el, "webkitAnimationEnd", context.popupCloseResolve);
                context.popupCloseResolve = undefined;
            }
            if (context.options.closeAniClasses)
                DomUtils.removeClass(context.el, context.options.closeAniClasses);
        }
        if (action && !action.isPending())
            return;
        //
        if (context.options.popupClasses)
            DomUtils.removeClass(context.el, context.options.popupClasses);
        context.el.style.zIndex = "";
        if (context.el.parentNode) {
            context.el.parentNode.removeChild(context.el);
            if (context.options.onElRemoved)
                context.options.onElRemoved(context);
        }
        if (context.popper) {
            context.popper.destroy();
            context.popper = undefined;
        }
        //
        if (this.popups.length <= 0) {
            this.zIndex = 2000;
        }
    }
    async stopClosePopup(context, action) {
        if (context.options.closeAni && context.popupCloseResolve)
            context.popupCloseResolve();
    }
    async unlockBody(context) {
        this.bodyLocks.splice(this.bodyLocks.indexOf(context), 1);
        //重置class
        if (this.currentBodyClasses) {
            DomUtils.removeClass(document.body, this.currentBodyClasses.options.bodyClasses);
            this.currentBodyClasses = undefined;
        }
        for (let i = this.bodyLocks.length - 1; i >= 0; i--) {
            if (this.bodyLocks[i].options.bodyClasses) {
                this.currentBodyClasses = this.bodyLocks[i];
                DomUtils.addClass(document.body, this.currentBodyClasses.options.bodyClasses);
                break;
            }
        }
        //复位
        if (this.bodyLocks.length <= 0) {
            document.body.style.overflowY = this.bodyStore.overflowY;
            //if (!document.body.className || !document.body.classList || document.body.classList.length <= 0) document.body.removeAttribute('class');
        }
    }
    async closeModal(context, action) {
        //modal-ani
        if (context.options.modalCloseAni) {
            if (context.options.modalCloseAniClasses)
                DomUtils.addClass(context.modalEl, context.options.modalCloseAniClasses);
            //
            await new Promise((resolve) => {
                context.modalCloseResolve = resolve;
                //
                if (context.options.modalCloseDuration && context.options.modalCloseDuration > 0) {
                    context.modalCloseTimer = setTimeout(resolve, context.options.modalCloseDuration, true);
                }
                else {
                    DomUtils.on(context.modalEl, "animationend", resolve);
                    DomUtils.on(context.modalEl, "webkitAnimationEnd", resolve);
                }
            });
            //
            if (context.modalCloseTimer) {
                clearTimeout(context.modalCloseTimer);
                context.modalCloseTimer = undefined;
            }
            if (context.modalCloseResolve) {
                DomUtils.off(context.el, "animationend", context.modalCloseResolve);
                DomUtils.off(context.el, "webkitAnimationEnd", context.modalCloseResolve);
                context.modalCloseResolve = undefined;
            }
            if (context.options.modalCloseAniClasses)
                DomUtils.removeClass(context.modalEl, context.options.modalCloseAniClasses);
        }
        //
        if (action && !action.isPending())
            return;
        if (context.options.modalClasses)
            DomUtils.removeClass(context.modalEl, context.options.modalClasses);
        context.modalEl.style.zIndex = "";
        if (context.modalEl.parentNode)
            context.modalEl.parentNode.removeChild(context.modalEl);
    }
    async stopCloseModal(context, action) {
        if (context.options.modalCloseAni && context.modalCloseResolve)
            context.modalCloseResolve();
    }
    resetPopup(context) {
        const ctx = context;
        delete ctx.options;
        delete ctx.status;
        delete ctx.action;
        delete ctx.zIndex;
        delete ctx.popper;
        //
        delete ctx.popupOpenTimer;
        delete ctx.popupOpenResolve;
        delete ctx.popupCloseTimer;
        delete ctx.popupCloseResolve;
        //
        delete ctx.modalOpenTimer;
        delete ctx.modalOpenResolve;
        delete ctx.modalCloseTimer;
        delete ctx.modalCloseResolve;
    }
    destroyPopup(context) {
        const ctx = context;
        delete ctx.options;
        //
        if (context.popup) {
            //TODO How to destroy vue instance
            //console.log(context.popup);
            //if ((context.popup as VueInstance).$destroy) (context.popup as VueInstance).$destroy();
            //Vue.render(null, context.el.parentElement as any);
            delete ctx.popup;
        }
        if (context.el) {
            if (context.el.parentNode)
                context.el.parentNode.removeChild(context.el);
            delete context.el.$popup_context;
            delete ctx.el;
        }
        delete ctx.status;
        if (context.action) {
            delete ctx.action;
        }
        delete ctx.zIndex;
        if (context.popper) {
            context.popper.destroy();
            delete ctx.popper;
        }
        if (context.arrowEl) {
            if (context.arrowEl.parentNode)
                context.arrowEl.parentNode.removeChild(context.arrowEl);
            delete ctx.arrowEl;
        }
        //
        delete ctx.popupOpenTimer;
        delete ctx.popupOpenResolve;
        delete ctx.popupCloseTimer;
        delete ctx.popupCloseResolve;
        //
        if (context.modalEl) {
            if (context.modalEl.parentNode)
                context.modalEl.parentNode.removeChild(context.modalEl);
            delete ctx.modalEl;
        }
        delete ctx.modalOpenTimer;
        delete ctx.modalOpenResolve;
        delete ctx.modalCloseTimer;
        delete ctx.modalCloseResolve;
        //console.log(context);
    }
    //销毁
    destroy(popup) {
        const context = this.getContext(popup, false);
        if (!context)
            return;
        //判断Popup状态
        if (!context.options)
            context.options = {};
        context.options.modalOpenAni = false;
        context.options.modalCloseAni = false;
        context.options.openAni = false;
        context.options.closeAni = false;
        //
        if (context.action)
            context.action.stop();
        if (context.status === "opened" || context.status === "opening" || context.status === "closing") {
            this.closePopup(context);
            if (context.options.bodyLock)
                this.unlockBody(context);
            if (context.options.modal)
                this.closeModal(context);
        }
        //
        this.destroyPopup(context);
    }
    //批处理
    getPopups(reverse = false) {
        const popups = [];
        for (const context of this.popups) {
            popups.push(context.popup);
        }
        if (reverse)
            popups.reverse();
        return popups;
    }
    closeAll(action, exp, autoStart = true) {
        const act = action || new RunAll(true);
        this.popups
            .slice()
            .reverse()
            .forEach((context) => {
            if (!exp || exp.indexOf(context.popup) >= 0) {
                act.addChild(this.close(context.popup, undefined, false));
            }
        });
        if (autoStart)
            act.start();
        return act;
    }
    destyorAll() {
        this.popups.slice().forEach((context) => this.destroy(context.popup));
    }
}
//# sourceMappingURL=PopupManager.js.map
import { RunOne, RunAll, RunFunc, ActionForSleep, ActionForResolve } from 'me-actions';
import { DomUtils } from 'me-utils-browserify';
import { createPopper, } from '@popperjs/core';
export function install(vueapp, options = {}) {
    const instance = PopupManager.getInstance();
    instance.defaultOptions = options;
    vueapp.config.globalProperties.$ppm = instance;
    vueapp.provide('$ppm', instance);
}
export class PopupManager {
    constructor() {
        this.zIndex = 2000;
        this.popups = [];
        this.bodyStore = { className: '', classList: undefined, paddingRight: '', overflowY: '' };
        this.bodyLocks = [];
        this.currentBodyClasses = undefined;
        DomUtils.on(window, 'keydown', (e) => {
            if (e.code !== 'Escape')
                return;
            for (let i = this.popups.length - 1; i >= 0; i--) {
                const context = this.popups[i];
                if (!(context.options.closePressEsc || context.options.closeClickOutside))
                    continue;
                if (context.options.closePressEsc)
                    this.close(context.popup);
                break;
            }
        });
        DomUtils.on(document, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
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
    static getInstance() {
        if (!PopupManager.instance)
            PopupManager.instance = new PopupManager();
        return PopupManager.instance;
    }
    getContext(popup, autoCreate = false) {
        const el = popup.$el || popup;
        let context = el.$popup_context;
        if (!context && autoCreate) {
            context = { popup, el, status: 'closed' };
            el.$popup_context = context;
        }
        return context;
    }
    getNextZIndex() {
        this.zIndex += 2;
        return this.zIndex;
    }
    mergeOptions(o1, o2) {
        const newOptions = { ...o1, ...o2 };
        if (newOptions.popupClasses)
            newOptions.popupClasses = `${o1.popupClasses || ''} ${o2.popupClasses || ''}`.trim();
        if (newOptions.popupArrowClasses)
            newOptions.popupArrowClasses = `${o1.popupArrowClasses || ''} ${o2.popupArrowClasses || ''}`.trim();
        if (newOptions.bodyLock && newOptions.bodyClasses)
            newOptions.bodyClasses = `${o1.bodyClasses || ''} ${o2.bodyClasses || ''}`.trim();
        if (newOptions.modal && newOptions.modalClasses)
            newOptions.modalClasses = `${o1.modalClasses || ''} ${o2.modalClasses || ''}`.trim();
        if (newOptions.modal && newOptions.modalOpenAniClasses)
            newOptions.modalOpenAniClasses = `${o1.modalOpenAniClasses || ''} ${o2.modalOpenAniClasses || ''}`.trim();
        if (newOptions.modal && newOptions.modalCloseAniClasses)
            newOptions.modalCloseAniClasses = `${o1.modalCloseAniClasses || ''} ${o2.modalCloseAniClasses || ''}`.trim();
        if (newOptions.openAni && newOptions.openAniClasses)
            newOptions.openAniClasses = `${o1.openAniClasses || ''} ${o2.openAniClasses || ''}`.trim();
        if (newOptions.closeAni && newOptions.closeAniClasses)
            newOptions.closeAniClasses = `${o1.closeAniClasses || ''} ${o2.closeAniClasses || ''}`.trim();
        return newOptions;
    }
    getStatus(popup) {
        const context = this.getContext(popup, false);
        return !context ? '' : context.status;
    }
    willOpen(popup) {
        const context = this.getContext(popup, false);
        return !context || context.status === 'closed' || context.status === 'waitClose' || context.status === 'closing';
    }
    willClose(popup) {
        const context = this.getContext(popup, false);
        return !context || context.status === 'opened' || context.status === 'waitOpen' || context.status === 'opening';
    }
    open(popup, options, autoStart = true) {
        const context = this.getContext(popup, true);
        if (context.status === 'waitOpen') {
            context.action.stop();
            context.status = 'closed';
        }
        else if (context.status === 'opening') {
            return context.action;
        }
        else if (context.status === 'opened') {
            return new ActionForResolve();
        }
        else if (context.status === 'waitClose') {
            context.action.stop();
            context.status = 'opened';
            return new ActionForResolve();
        }
        else if (context.status === 'closing') {
            context.action.stop();
            context.status = 'closed';
        }
        context.options = options ? this.mergeOptions(this.defaultOptions, options) : { ...this.defaultOptions };
        context.status = 'waitOpen';
        context.action = new RunOne(true);
        context.action.setContext(context);
        if (context.options.openDelay && context.options.openDelay > 0) {
            context.action.addChild(new ActionForSleep(context.options.openDelay));
        }
        context.action.addChild(new RunFunc(async (context) => (context.status = 'opening')));
        const all = new RunAll(true, false);
        all.addChild(new RunFunc((context, action) => this.openPopup(context, action), (context, action) => this.stopOpenPopup(context, action)));
        if (context.options.bodyLock) {
            all.addChild(new RunFunc((context) => this.lockBody(context)));
        }
        if (context.options.modal) {
            all.addChild(new RunFunc((context, action) => this.openModal(context, action), (context, action) => this.stopOpenModal(context, action)));
        }
        context.action.addChild(all);
        context.action.addChild(new RunFunc(async (context) => (context.status = 'opened')));
        if (autoStart)
            context.action.start();
        return context.action;
    }
    async openPopup(context, action) {
        this.popups.push(context);
        if (context.options.popupClasses)
            DomUtils.addClass(context.el, context.options.popupClasses);
        context.zIndex = this.getNextZIndex();
        context.el.style.zIndex = `${context.zIndex}`;
        document.body.appendChild(context.el);
        if (context.options.onElAppended)
            context.options.onElAppended(context);
        if (context.options.popupReference) {
            if (context.options.popupArrow === true && !context.arrowEl) {
                context.arrowEl = document.createElement('div');
                context.arrowEl.setAttribute('id', 'popup-arrow');
                context.arrowEl.setAttribute('data-popper-arrow', '');
                if (context.options.popupArrowClasses)
                    DomUtils.addClass(context.arrowEl, context.options.popupArrowClasses);
                context.el.appendChild(context.arrowEl);
            }
            if (context.popper)
                context.popper.destroy();
            const popperOptions = {};
            if (context.options.popupPlacement)
                popperOptions.placement = context.options.popupPlacement;
            if (context.options.popupModifiers)
                popperOptions.modifiers = context.options.popupModifiers;
            if (context.options.popupStrategy)
                popperOptions.strategy = context.options.popupStrategy;
            if (context.options.popupOnFirstUpdate)
                popperOptions.onFirstUpdate = context.options.popupOnFirstUpdate;
            context.popper = createPopper(context.options.popupReference, context.el, popperOptions);
        }
        if (context.options.openAni && context.options.openAniClasses) {
            DomUtils.addClass(context.el, context.options.openAniClasses);
            if (context.options.openDuration && context.options.openDuration > 0) {
                await new ActionForSleep(context.options.openDuration).startAsync();
            }
            else {
                await new Promise((resolve) => {
                    context.popupOpenResolve = resolve;
                    DomUtils.on(context.el, 'animationend', context.popupOpenResolve);
                    DomUtils.on(context.el, 'webkitAnimationEnd', context.popupOpenResolve);
                });
                DomUtils.off(context.el, 'animationend', context.popupOpenResolve);
                DomUtils.off(context.el, 'webkitAnimationEnd', context.popupOpenResolve);
                context.popupOpenResolve = undefined;
            }
            DomUtils.removeClass(context.el, context.options.openAniClasses);
        }
    }
    async stopOpenPopup(context, action) {
        if (context.options.openAni && context.options.openAniClasses) {
            if (context.popupOpenResolve) {
                DomUtils.off(context.el, 'animationend', context.popupOpenResolve);
                DomUtils.off(context.el, 'webkitAnimationEnd', context.popupOpenResolve);
                context.popupOpenResolve();
                context.popupOpenResolve = undefined;
            }
            DomUtils.removeClass(context.el, context.options.openAniClasses);
        }
    }
    async lockBody(context) {
        if (this.bodyLocks.length === 0) {
            this.bodyStore.overflowY = document.body.style.overflowY || '';
            document.body.style.overflowY = 'hidden';
        }
        if (context.options.bodyClasses) {
            if (this.currentBodyClasses)
                DomUtils.removeClass(document.body, this.currentBodyClasses.options.bodyClasses);
            this.currentBodyClasses = context;
            DomUtils.addClass(document.body, this.currentBodyClasses.options.bodyClasses);
        }
        this.bodyLocks.push(context);
    }
    async openModal(context, action) {
        if (!context.modalEl) {
            context.modalEl = document.createElement('div');
            context.modalEl.setAttribute('id', 'popup-modal');
            context.modalEl.tabIndex = 0;
            DomUtils.on(context.modalEl, 'touchmove', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
        if (context.options.modalClasses)
            DomUtils.addClass(context.modalEl, context.options.modalClasses);
        context.modalEl.style.zIndex = `${context.zIndex - 1}`;
        document.body.appendChild(context.modalEl);
        if (context.options.modalOpenAni && context.options.modalOpenAniClasses) {
            DomUtils.addClass(context.modalEl, context.options.modalOpenAniClasses);
            if (context.options.modalOpenDuration && context.options.modalOpenDuration > 0) {
                await new ActionForSleep(context.options.modalOpenDuration).startAsync();
            }
            else {
                await new Promise((resolve) => {
                    context.modalOpenResolve = resolve;
                    DomUtils.on(context.modalEl, 'animationend', context.modalOpenResolve);
                    DomUtils.on(context.modalEl, 'webkitAnimationEnd', context.modalOpenResolve);
                });
                DomUtils.off(context.modalEl, 'animationend', context.modalOpenResolve);
                DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalOpenResolve);
                context.modalOpenResolve = undefined;
            }
            DomUtils.removeClass(context.modalEl, context.options.modalOpenAniClasses);
        }
    }
    async stopOpenModal(context, action) {
        if (context.options.modalOpenAni && context.options.modalOpenAniClasses) {
            if (context.modalOpenResolve) {
                DomUtils.off(context.modalEl, 'animationend', context.modalOpenResolve);
                DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalOpenResolve);
                context.modalOpenResolve();
                context.modalOpenResolve = undefined;
            }
            DomUtils.removeClass(context.modalEl, context.options.modalOpenAniClasses);
        }
    }
    close(popup, options, autoStart = true) {
        const context = this.getContext(popup, false);
        if (!context)
            return new ActionForResolve();
        if (context.status === 'waitClose') {
            context.action.stop();
            context.status = 'opened';
        }
        else if (context.status === 'closing') {
            return context.action;
        }
        else if (context.status === 'closed') {
            return new ActionForResolve();
        }
        else if (context.status === 'waitOpen') {
            context.action.stop();
            context.status = 'closed';
            return new ActionForResolve();
        }
        else if (context.status === 'opening') {
            context.action.stop();
            context.status = 'opened';
        }
        if (options)
            context.options = this.mergeOptions(context.options, options);
        context.status = 'waitClose';
        context.action = new RunOne(true);
        context.action.setContext(context);
        if (context.options.closeDelay && context.options.closeDelay > 0) {
            context.action.addChild(new ActionForSleep(context.options.closeDelay));
        }
        context.action.addChild(new RunFunc(async (context) => (context.status = 'closing')));
        const all = new RunAll(true, false);
        all.addChild(new RunFunc((context, action) => this.closePopup(context, action), (context, action) => this.stopClosePopup(context, action)));
        if (context.options.bodyLock) {
            all.addChild(new RunFunc((context) => this.unlockBody(context)));
        }
        if (context.options.modal) {
            all.addChild(new RunFunc((context, action) => this.closeModal(context, action), (context, action) => this.stopCloseModal(context, action)));
        }
        context.action.addChild(all);
        if (!context.options.closeDestroy) {
            context.action.addChild(new RunFunc(async (context) => {
                context.status = 'closed';
                this.resetPopup(context);
            }));
        }
        else {
            context.action.addChild(new RunFunc(async (context) => this.destroyPopup(context)));
        }
        if (autoStart)
            context.action.start();
        return context.action;
    }
    async closePopup(context, action) {
        this.popups.splice(this.popups.indexOf(context), 1);
        if (context.options.closeAni && context.options.closeAniClasses) {
            DomUtils.addClass(context.el, context.options.closeAniClasses);
            if (context.options.closeDuration && context.options.closeDuration > 0) {
                await new ActionForSleep(context.options.closeDuration).startAsync();
            }
            else {
                await new Promise((resolve) => {
                    context.popupCloseResolve = resolve;
                    DomUtils.on(context.el, 'animationend', context.popupCloseResolve);
                    DomUtils.on(context.el, 'webkitAnimationEnd', context.popupCloseResolve);
                });
                DomUtils.off(context.el, 'animationend', context.popupCloseResolve);
                DomUtils.off(context.el, 'webkitAnimationEnd', context.popupCloseResolve);
                context.popupCloseResolve = undefined;
            }
            DomUtils.removeClass(context.el, context.options.closeAniClasses);
        }
        if (action && !action.isPending())
            return;
        if (context.options.popupClasses)
            DomUtils.removeClass(context.el, context.options.popupClasses);
        context.el.style.zIndex = '';
        if (context.el.parentNode) {
            context.el.parentNode.removeChild(context.el);
            if (context.options.onElRemoved)
                context.options.onElRemoved(context);
        }
        if (context.popper) {
            context.popper.destroy();
            context.popper = undefined;
        }
        if (this.popups.length <= 0) {
            this.zIndex = 2000;
        }
    }
    async stopClosePopup(context, action) {
        if (context.options.closeAni && context.options.closeAniClasses) {
            if (context.popupCloseResolve) {
                DomUtils.off(context.el, 'animationend', context.popupCloseResolve);
                DomUtils.off(context.el, 'webkitAnimationEnd', context.popupCloseResolve);
                context.popupCloseResolve();
                context.popupCloseResolve = undefined;
            }
            DomUtils.removeClass(context.el, context.options.closeAniClasses);
        }
    }
    async unlockBody(context) {
        this.bodyLocks.splice(this.bodyLocks.indexOf(context), 1);
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
        if (this.bodyLocks.length <= 0) {
            document.body.style.overflowY = this.bodyStore.overflowY;
        }
    }
    async closeModal(context, action) {
        if (context.options.modalCloseAni && context.options.modalCloseAniClasses) {
            DomUtils.addClass(context.modalEl, context.options.modalCloseAniClasses);
            if (context.options.modalCloseDuration && context.options.modalCloseDuration > 0) {
                await new ActionForSleep(context.options.modalCloseDuration).startAsync();
            }
            else {
                await new Promise((resolve) => {
                    context.modalCloseResolve = () => resolve(1);
                    DomUtils.on(context.modalEl, 'animationend', context.modalCloseResolve);
                    DomUtils.on(context.modalEl, 'webkitAnimationEnd', context.modalCloseResolve);
                });
                DomUtils.off(context.modalEl, 'animationend', context.modalCloseResolve);
                DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalCloseResolve);
                context.modalCloseResolve = undefined;
            }
            DomUtils.removeClass(context.modalEl, context.options.modalCloseAniClasses);
        }
        if (action && !action.isPending())
            return;
        if (context.options.modalClasses)
            DomUtils.removeClass(context.modalEl, context.options.modalClasses);
        context.modalEl.style.zIndex = '';
        if (context.modalEl.parentNode)
            context.modalEl.parentNode.removeChild(context.modalEl);
    }
    async stopCloseModal(context, action) {
        if (context.options.modalCloseAni && context.options.modalCloseAniClasses) {
            if (context.modalCloseResolve) {
                DomUtils.off(context.modalEl, 'animationend', context.modalCloseResolve);
                DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalCloseResolve);
                context.modalCloseResolve();
                context.modalCloseResolve = undefined;
            }
            DomUtils.removeClass(context.modalEl, context.options.modalCloseAniClasses);
        }
    }
    resetPopup(context) {
        delete context.options;
        delete context.status;
        delete context.action;
        delete context.zIndex;
        delete context.popper;
        delete context.popupOpenResolve;
        delete context.popupCloseResolve;
        delete context.modalOpenResolve;
        delete context.modalCloseResolve;
    }
    destroyPopup(context) {
        delete context.options;
        if (context.popup) {
            delete context.popup;
        }
        if (context.el) {
            if (context.el.parentNode)
                context.el.parentNode.removeChild(context.el);
            delete context.el.$popup_context;
            delete context.el;
        }
        delete context.status;
        if (context.action) {
            delete context.action;
        }
        delete context.zIndex;
        if (context.popper) {
            context.popper.destroy();
            delete context.popper;
        }
        if (context.arrowEl) {
            if (context.arrowEl.parentNode)
                context.arrowEl.parentNode.removeChild(context.arrowEl);
            delete context.arrowEl;
        }
        delete context.popupOpenResolve;
        delete context.popupCloseResolve;
        if (context.modalEl) {
            if (context.modalEl.parentNode)
                context.modalEl.parentNode.removeChild(context.modalEl);
            delete context.modalEl;
        }
        delete context.modalOpenResolve;
        delete context.modalCloseResolve;
    }
    destroy(popup) {
        const context = this.getContext(popup, false);
        if (!context)
            return;
        if (!context.options)
            context.options = {};
        context.options.modalOpenAni = false;
        context.options.modalCloseAni = false;
        context.options.openAni = false;
        context.options.closeAni = false;
        if (context.action)
            context.action.stop();
        if (context.status === 'opened' || context.status === 'opening' || context.status === 'waitClose' || context.status === 'closing') {
            this.closePopup(context);
            if (context.options.bodyLock)
                this.unlockBody(context);
            if (context.options.modal)
                this.closeModal(context);
        }
        this.destroyPopup(context);
    }
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
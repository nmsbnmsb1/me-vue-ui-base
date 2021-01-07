import { App, ComponentPublicInstance as VueInstance } from 'vue';
import { Action, RunOne, RunAll, RunFunc, ActionForSleep, ActionForResolve } from 'me-actions';
import { DomUtils } from 'me-utils-browserify';
import {
	createPopper,
	VirtualElement as PopperVirtualElement,
	Instance as PopperInstance,
	Placement as PopperPlacement,
	PositioningStrategy as PopperPositioningStrategy,
	Modifier as PopperModifier,
	State as PopperState,
} from '@popperjs/core';

// PopupOptions
export interface IOptions {
	popupClasses?: string;
	popupReference?: Element | PopperVirtualElement;
	popupArrow?: boolean;
	popupArrowClasses?: string;
	popupPlacement?: PopperPlacement;
	popupStrategy?: PopperPositioningStrategy;
	popupModifiers?: Array<Partial<PopperModifier<any, any>>>;
	popupOnFirstUpdate?: (arg0: Partial<PopperState>) => void;
	//
	bodyLock?: boolean;
	bodyClasses?: string;
	//
	modal?: boolean;
	modalClasses?: string;
	modalOpenAni?: boolean;
	modalOpenAniClasses?: string;
	modalOpenDuration?: number;
	modalCloseAni?: boolean;
	modalCloseAniClasses?: string;
	modalCloseDuration?: number;
	//
	openDelay?: number;
	openAni?: boolean;
	openAniClasses?: string;
	openDuration?: number;
	//
	closeDelay?: number;
	closeAni?: boolean;
	closeAniClasses?: string;
	closeDuration?: number;
	closeDestroy?: boolean;
	closePressEsc?: boolean;
	closeClickOutside?: boolean;
	closeClickOutsideChecker?: (e: any) => boolean;
	//
	onElAppended?: (context: IContext) => any;
	onElRemoved?: (context: IContext) => any;
}

export function install(vueapp: App, options: IOptions = {}) {
	const instance: any = PopupManager.getInstance();
	instance.defaultOptions = options;
	vueapp.config.globalProperties.$ppm = instance;
	vueapp.provide('$ppm', instance);
}

interface IContext {
	options: IOptions;
	//
	popup: VueInstance | HTMLElement;
	el: HTMLElement;
	status: string;
	action: Action;
	zIndex: number;
	popper: PopperInstance;
	arrowEl: HTMLElement;
	popupOpenResolve: () => any;
	popupCloseResolve: () => any;
	//
	modalEl: HTMLElement;
	modalOpenResolve: () => any;
	modalCloseResolve: () => any;
}

export class PopupManager {
	private static instance: PopupManager;

	public static getInstance(): PopupManager {
		if (!PopupManager.instance) PopupManager.instance = new PopupManager();
		return PopupManager.instance;
	}

	private zIndex = 2000;
	private defaultOptions!: IOptions;
	private popups: IContext[] = [];
	//
	private bodyStore = { className: '', classList: undefined as any, paddingRight: '', overflowY: '' };
	private bodyLocks: IContext[] = [];
	private currentBodyClasses: IContext = undefined as any;

	constructor() {
		DomUtils.on(window, 'keydown', (e: KeyboardEvent) => {
			if (e.code !== 'Escape') return;
			//
			for (let i = this.popups.length - 1; i >= 0; i--) {
				const context = this.popups[i];
				if (!(context.options.closePressEsc || context.options.closeClickOutside)) continue;
				if (context.options.closePressEsc) this.close(context.popup);
				break;
			}
		});
		DomUtils.on(document, 'click', (e: any) => {
			e.preventDefault();
			e.stopPropagation();
			//
			for (let i = this.popups.length - 1; i >= 0; i--) {
				const context = this.popups[i];
				if (!(context.options.closePressEsc || context.options.closeClickOutside)) continue;
				if (context.options.closeClickOutside) {
					if (context.options.closeClickOutsideChecker) {
						if (!context.options.closeClickOutsideChecker(e)) return;
					} else {
						if (context.el.contains(e.target)) return;
					}
					this.close(context.popup);
				}
				break;
			}
		});
	}

	//获取弹出上下文
	private getContext(popup: VueInstance | HTMLElement, autoCreate = false): IContext {
		const el: any = ((popup as VueInstance).$el as HTMLElement) || (popup as HTMLElement);
		let context: IContext = el.$popup_context;
		if (!context && autoCreate) {
			context = { popup, el, status: 'closed' } as any;
			el.$popup_context = context;
		}
		return context;
	}
	private getNextZIndex(): number {
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
	private mergeOptions(o1: Partial<IOptions>, o2: Partial<IOptions>) {
		const newOptions = { ...o1, ...o2 };
		//
		if (newOptions.popupClasses) newOptions.popupClasses = `${o1.popupClasses || ''} ${o2.popupClasses || ''}`.trim();
		if (newOptions.popupArrowClasses) newOptions.popupArrowClasses = `${o1.popupArrowClasses || ''} ${o2.popupArrowClasses || ''}`.trim();
		//
		if (newOptions.bodyLock && newOptions.bodyClasses) newOptions.bodyClasses = `${o1.bodyClasses || ''} ${o2.bodyClasses || ''}`.trim();
		//
		if (newOptions.modal && newOptions.modalClasses) newOptions.modalClasses = `${o1.modalClasses || ''} ${o2.modalClasses || ''}`.trim();
		if (newOptions.modal && newOptions.modalOpenAniClasses)
			newOptions.modalOpenAniClasses = `${o1.modalOpenAniClasses || ''} ${o2.modalOpenAniClasses || ''}`.trim();
		if (newOptions.modal && newOptions.modalCloseAniClasses)
			newOptions.modalCloseAniClasses = `${o1.modalCloseAniClasses || ''} ${o2.modalCloseAniClasses || ''}`.trim();
		//
		if (newOptions.openAni && newOptions.openAniClasses) newOptions.openAniClasses = `${o1.openAniClasses || ''} ${o2.openAniClasses || ''}`.trim();
		if (newOptions.closeAni && newOptions.closeAniClasses) newOptions.closeAniClasses = `${o1.closeAniClasses || ''} ${o2.closeAniClasses || ''}`.trim();
		//
		return newOptions;
	}

	public getStatus(popup: VueInstance | HTMLElement): string {
		const context: IContext = this.getContext(popup, false);
		return !context ? '' : context.status;
	}

	public willOpen(popup: VueInstance | HTMLElement): boolean {
		const context: IContext = this.getContext(popup, false);
		return !context || context.status === 'closed' || context.status === 'waitClose' || context.status === 'closing';
	}

	public willClose(popup: VueInstance | HTMLElement): boolean {
		const context: IContext = this.getContext(popup, false);
		return !context || context.status === 'opened' || context.status === 'waitOpen' || context.status === 'opening';
	}

	// 弹出
	public open(popup: VueInstance | HTMLElement, options?: Partial<IOptions>, autoStart = true): Action {
		const context = this.getContext(popup, true);
		//判断Popup状态
		if (context.status === 'waitOpen') {
			context.action.stop();
			context.status = 'closed';
		} else if (context.status === 'opening') {
			return context.action;
		} else if (context.status === 'opened') {
			return new ActionForResolve();
		} else if (context.status === 'waitClose') {
			context.action.stop();
			context.status = 'opened';
			return new ActionForResolve();
		} else if (context.status === 'closing') {
			context.action.stop();
			context.status = 'closed';
		} // else if (context.status === 'closed') {
		// }

		//open
		//合并选项
		context.options = options ? this.mergeOptions(this.defaultOptions, options) : { ...this.defaultOptions };
		//console.log(context.options);
		context.status = 'waitOpen';
		context.action = new RunOne(true);
		context.action.setContext(context);
		if (context.options.openDelay && context.options.openDelay > 0) {
			context.action.addChild(new ActionForSleep(context.options.openDelay));
		}
		context.action.addChild(new RunFunc(async (context: IContext) => (context.status = 'opening')));
		const all: Action = new RunAll(true, false);
		all.addChild(
			new RunFunc(
				(context: IContext, action?: RunFunc) => this.openPopup(context, action as any),
				(context: IContext, action?: RunFunc) => this.stopOpenPopup(context, action as any)
			)
		);
		if (context.options.bodyLock) {
			all.addChild(new RunFunc((context: IContext) => this.lockBody(context)));
		}
		if (context.options.modal) {
			all.addChild(
				new RunFunc(
					(context: IContext, action?: RunFunc) => this.openModal(context, action as any),
					(context: IContext, action?: RunFunc) => this.stopOpenModal(context, action as any)
				)
			);
		}
		context.action.addChild(all);
		context.action.addChild(new RunFunc(async (context: IContext) => (context.status = 'opened')));
		//
		if (autoStart) context.action.start();
		return context.action;
	}

	private async openPopup(context: IContext, action: RunFunc) {
		this.popups.push(context);
		//css/z-index
		if (context.options.popupClasses) DomUtils.addClass(context.el, context.options.popupClasses);
		context.zIndex = this.getNextZIndex();
		context.el.style.zIndex = `${context.zIndex}`;
		document.body.appendChild(context.el);
		if (context.options.onElAppended) context.options.onElAppended(context);
		//popper-js
		if (context.options.popupReference) {
			if (context.options.popupArrow === true && !context.arrowEl) {
				context.arrowEl = document.createElement('div');
				context.arrowEl.setAttribute('id', 'popup-arrow');
				context.arrowEl.setAttribute('data-popper-arrow', '');
				if (context.options.popupArrowClasses) DomUtils.addClass(context.arrowEl, context.options.popupArrowClasses);
				context.el.appendChild(context.arrowEl);
			}
			if (context.popper) context.popper.destroy();
			const popperOptions: any = {};
			if (context.options.popupPlacement) popperOptions.placement = context.options.popupPlacement;
			if (context.options.popupModifiers) popperOptions.modifiers = context.options.popupModifiers;
			if (context.options.popupStrategy) popperOptions.strategy = context.options.popupStrategy;
			if (context.options.popupOnFirstUpdate) popperOptions.onFirstUpdate = context.options.popupOnFirstUpdate;
			context.popper = createPopper(context.options.popupReference, context.el, popperOptions);
		}
		//css-animation
		if (context.options.openAni && context.options.openAniClasses) {
			DomUtils.addClass(context.el, context.options.openAniClasses);
			//如果设定了duration则使用timeout
			if (context.options.openDuration && context.options.openDuration > 0) {
				await new ActionForSleep(context.options.openDuration).startAsync();
			} else {
				await new Promise((resolve) => {
					context.popupOpenResolve = resolve as any;
					DomUtils.on(context.el, 'animationend', context.popupOpenResolve);
					DomUtils.on(context.el, 'webkitAnimationEnd', context.popupOpenResolve);
				});
				DomUtils.off(context.el, 'animationend', context.popupOpenResolve);
				DomUtils.off(context.el, 'webkitAnimationEnd', context.popupOpenResolve);
				context.popupOpenResolve = undefined as any;
			}
			DomUtils.removeClass(context.el, context.options.openAniClasses);
		}
	}

	private async stopOpenPopup(context: IContext, action: RunFunc) {
		if (context.options.openAni && context.options.openAniClasses) {
			if (context.popupOpenResolve) {
				DomUtils.off(context.el, 'animationend', context.popupOpenResolve);
				DomUtils.off(context.el, 'webkitAnimationEnd', context.popupOpenResolve);
				context.popupOpenResolve();
				context.popupOpenResolve = undefined as any;
			}
			DomUtils.removeClass(context.el, context.options.openAniClasses);
		}
	}

	private async lockBody(context: IContext) {
		if (this.bodyLocks.length === 0) {
			this.bodyStore.overflowY = document.body.style.overflowY || '';
			document.body.style.overflowY = 'hidden';
		}
		//如果要设置body的class
		if (context.options.bodyClasses) {
			if (this.currentBodyClasses) DomUtils.removeClass(document.body, this.currentBodyClasses.options.bodyClasses);
			this.currentBodyClasses = context;
			DomUtils.addClass(document.body, this.currentBodyClasses.options.bodyClasses);
		}
		//
		this.bodyLocks.push(context);
	}

	private async openModal(context: IContext, action: RunFunc) {
		if (!context.modalEl) {
			context.modalEl = document.createElement('div');
			context.modalEl.setAttribute('id', 'popup-modal');
			context.modalEl.tabIndex = 0;
			DomUtils.on(context.modalEl, 'touchmove', (e: any) => {
				e.preventDefault();
				e.stopPropagation();
			});
		}
		//
		if (context.options.modalClasses) DomUtils.addClass(context.modalEl, context.options.modalClasses);
		context.modalEl.style.zIndex = `${context.zIndex - 1}`;
		document.body.appendChild(context.modalEl);
		//modal-ani
		if (context.options.modalOpenAni && context.options.modalOpenAniClasses) {
			DomUtils.addClass(context.modalEl, context.options.modalOpenAniClasses);
			if (context.options.modalOpenDuration && context.options.modalOpenDuration > 0) {
				await new ActionForSleep(context.options.modalOpenDuration).startAsync();
			} else {
				await new Promise((resolve) => {
					context.modalOpenResolve = resolve as any;
					DomUtils.on(context.modalEl, 'animationend', context.modalOpenResolve);
					DomUtils.on(context.modalEl, 'webkitAnimationEnd', context.modalOpenResolve);
				});
				DomUtils.off(context.modalEl, 'animationend', context.modalOpenResolve);
				DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalOpenResolve);
				context.modalOpenResolve = undefined as any;
			}
			DomUtils.removeClass(context.modalEl, context.options.modalOpenAniClasses);
		}
		//console.log('aaaa', action.isPending());
	}

	private async stopOpenModal(context: IContext, action: RunFunc) {
		if (context.options.modalOpenAni && context.options.modalOpenAniClasses) {
			if (context.modalOpenResolve) {
				DomUtils.off(context.modalEl, 'animationend', context.modalOpenResolve);
				DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalOpenResolve);
				context.modalOpenResolve();
				context.modalOpenResolve = undefined as any;
			}
			DomUtils.removeClass(context.modalEl, context.options.modalOpenAniClasses);
		}
	}

	//关闭
	public close(popup: VueInstance | HTMLElement, options?: Partial<IOptions>, autoStart = true): Action {
		const context = this.getContext(popup, false);
		if (!context) return new ActionForResolve();
		//判断Popup状态
		if (context.status === 'waitClose') {
			context.action.stop();
			context.status = 'opened';
		} else if (context.status === 'closing') {
			return context.action;
		} else if (context.status === 'closed') {
			return new ActionForResolve();
		} else if (context.status === 'waitOpen') {
			context.action.stop();
			context.status = 'closed';
			return new ActionForResolve();
		} else if (context.status === 'opening') {
			context.action.stop();
			context.status = 'opened';
		} //else if (context.status === 'opened') {
		//}

		//close
		if (options) context.options = this.mergeOptions(context.options, options);
		context.status = 'waitClose';
		context.action = new RunOne(true);
		context.action.setContext(context);
		if (context.options.closeDelay && context.options.closeDelay > 0) {
			context.action.addChild(new ActionForSleep(context.options.closeDelay));
		}
		context.action.addChild(new RunFunc(async (context: IContext) => (context.status = 'closing')));
		const all: Action = new RunAll(true, false);
		all.addChild(
			new RunFunc(
				(context: IContext, action?: Action) => this.closePopup(context, action as any),
				(context: IContext, action?: Action) => this.stopClosePopup(context, action as any)
			)
		);
		if (context.options.bodyLock) {
			all.addChild(new RunFunc((context: IContext) => this.unlockBody(context)));
		}
		if (context.options.modal) {
			all.addChild(
				new RunFunc(
					(context: IContext, action?: Action) => this.closeModal(context, action as any),
					(context: IContext, action?: Action) => this.stopCloseModal(context, action as any)
				)
			);
		}
		context.action.addChild(all);
		if (!context.options.closeDestroy) {
			context.action.addChild(
				new RunFunc(async (context: IContext) => {
					context.status = 'closed';
					this.resetPopup(context);
				})
			);
		} else {
			context.action.addChild(new RunFunc(async (context: IContext) => this.destroyPopup(context)));
		}
		//
		if (autoStart) context.action.start();
		return context.action;
		//return undefined as any;
	}

	private async closePopup(context: IContext, action?: RunFunc) {
		this.popups.splice(this.popups.indexOf(context), 1);
		//css-animation
		if (context.options.closeAni && context.options.closeAniClasses) {
			DomUtils.addClass(context.el, context.options.closeAniClasses);
			//如果设定了duration则使用timeout
			if (context.options.closeDuration && context.options.closeDuration > 0) {
				await new ActionForSleep(context.options.closeDuration).startAsync();
			} else {
				await new Promise((resolve) => {
					context.popupCloseResolve = resolve as any;
					DomUtils.on(context.el, 'animationend', context.popupCloseResolve);
					DomUtils.on(context.el, 'webkitAnimationEnd', context.popupCloseResolve);
				});
				DomUtils.off(context.el, 'animationend', context.popupCloseResolve);
				DomUtils.off(context.el, 'webkitAnimationEnd', context.popupCloseResolve);
				context.popupCloseResolve = undefined as any;
			}
			//clean-up
			DomUtils.removeClass(context.el, context.options.closeAniClasses);
		}
		if (action && !action.isPending()) return;
		//
		if (context.options.popupClasses) DomUtils.removeClass(context.el, context.options.popupClasses);
		context.el.style.zIndex = '';
		if (context.el.parentNode) {
			context.el.parentNode.removeChild(context.el);
			if (context.options.onElRemoved) context.options.onElRemoved(context);
		}
		if (context.popper) {
			context.popper.destroy();
			context.popper = undefined as any;
		}
		//
		if (this.popups.length <= 0) {
			this.zIndex = 2000;
		}
	}

	private async stopClosePopup(context: IContext, action: RunFunc) {
		if (context.options.closeAni && context.options.closeAniClasses) {
			if (context.popupCloseResolve) {
				DomUtils.off(context.el, 'animationend', context.popupCloseResolve);
				DomUtils.off(context.el, 'webkitAnimationEnd', context.popupCloseResolve);
				context.popupCloseResolve();
				context.popupCloseResolve = undefined as any;
			}
			DomUtils.removeClass(context.el, context.options.closeAniClasses);
		}
	}

	private async unlockBody(context: IContext) {
		this.bodyLocks.splice(this.bodyLocks.indexOf(context), 1);
		//重置class
		if (this.currentBodyClasses) {
			DomUtils.removeClass(document.body, this.currentBodyClasses.options.bodyClasses);
			this.currentBodyClasses = undefined as any;
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

	private async closeModal(context: IContext, action?: RunFunc) {
		//modal-ani
		if (context.options.modalCloseAni && context.options.modalCloseAniClasses) {
			DomUtils.addClass(context.modalEl, context.options.modalCloseAniClasses);
			if (context.options.modalCloseDuration && context.options.modalCloseDuration > 0) {
				await new ActionForSleep(context.options.modalCloseDuration).startAsync();
			} else {
				await new Promise((resolve) => {
					context.modalCloseResolve = () => resolve(1);
					DomUtils.on(context.modalEl, 'animationend', context.modalCloseResolve);
					DomUtils.on(context.modalEl, 'webkitAnimationEnd', context.modalCloseResolve);
				});
				DomUtils.off(context.modalEl, 'animationend', context.modalCloseResolve);
				DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalCloseResolve);
				context.modalCloseResolve = undefined as any;
			}
			DomUtils.removeClass(context.modalEl, context.options.modalCloseAniClasses);
		}
		//
		if (action && !action.isPending()) return;
		if (context.options.modalClasses) DomUtils.removeClass(context.modalEl, context.options.modalClasses);
		context.modalEl.style.zIndex = '';
		if (context.modalEl.parentNode) context.modalEl.parentNode.removeChild(context.modalEl);
	}

	private async stopCloseModal(context: IContext, action: RunFunc) {
		if (context.options.modalCloseAni && context.options.modalCloseAniClasses) {
			if (context.modalCloseResolve) {
				DomUtils.off(context.modalEl, 'animationend', context.modalCloseResolve);
				DomUtils.off(context.modalEl, 'webkitAnimationEnd', context.modalCloseResolve);
				context.modalCloseResolve();
				context.modalCloseResolve = undefined as any;
			}
			DomUtils.removeClass(context.modalEl, context.options.modalCloseAniClasses);
		}
	}

	private resetPopup(context: IContext) {
		delete (context as any).options;
		delete (context as any).status;
		delete (context as any).action;
		delete (context as any).zIndex;
		delete (context as any).popper;
		delete (context as any).popupOpenResolve;
		delete (context as any).popupCloseResolve;
		delete (context as any).modalOpenResolve;
		delete (context as any).modalCloseResolve;
		//console.log(context);
	}

	private destroyPopup(context: IContext) {
		delete (context as any).options;
		//
		if (context.popup) {
			//TODO How to destroy vue instance
			//console.log(context.popup);
			//if ((context.popup as VueInstance).$destroy) (context.popup as VueInstance).$destroy();
			//Vue.render(null, context.el.parentElement as any);
			delete (context as any).popup;
		}
		if (context.el) {
			if (context.el.parentNode) context.el.parentNode.removeChild(context.el);
			delete (context.el as any).$popup_context;
			delete (context as any).el;
		}
		delete (context as any).status;
		if (context.action) {
			delete (context as any).action;
		}
		delete (context as any).zIndex;
		if (context.popper) {
			context.popper.destroy();
			delete (context as any).popper;
		}
		if (context.arrowEl) {
			if (context.arrowEl.parentNode) context.arrowEl.parentNode.removeChild(context.arrowEl);
			delete (context as any).arrowEl;
		}
		delete (context as any).popupOpenResolve;
		delete (context as any).popupCloseResolve;
		if (context.modalEl) {
			if (context.modalEl.parentNode) context.modalEl.parentNode.removeChild(context.modalEl);
			delete (context as any).modalEl;
		}
		delete (context as any).modalOpenResolve;
		delete (context as any).modalCloseResolve;
		//console.log(context);
	}

	//销毁
	public destroy(popup: VueInstance | HTMLElement) {
		const context = this.getContext(popup, false);
		if (!context) return;
		//判断Popup状态
		if (!context.options) context.options = {};
		context.options.modalOpenAni = false;
		context.options.modalCloseAni = false;
		context.options.openAni = false;
		context.options.closeAni = false;
		//
		if (context.action) context.action.stop();
		if (context.status === 'opened' || context.status === 'opening' || context.status === 'waitClose' || context.status === 'closing') {
			this.closePopup(context);
			if (context.options.bodyLock) this.unlockBody(context);
			if (context.options.modal) this.closeModal(context);
		}
		//
		this.destroyPopup(context);
	}

	//批处理
	public getPopups(reverse = false) {
		const popups = [];
		for (const context of this.popups) {
			popups.push(context.popup);
		}
		if (reverse) popups.reverse();
		return popups;
	}

	public closeAll(action?: Action, exp?: (VueInstance | HTMLElement)[], autoStart = true): Action {
		const act = action || new RunAll(true);
		this.popups
			.slice()
			.reverse()
			.forEach((context: IContext) => {
				if (!exp || exp.indexOf(context.popup) >= 0) {
					act.addChild(this.close(context.popup, undefined, false));
				}
			});
		if (autoStart) act.start();
		return act;
	}

	public destyorAll() {
		this.popups.slice().forEach((context: IContext) => this.destroy(context.popup));
	}
}

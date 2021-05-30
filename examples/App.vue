<template>
  <!--BreakPointManager-->
  <div style="margin: 30px">
    <div>====BreakPointManager====</div>
    <div>breakpoints：{{ $bpm.breakPoints }}</div>
    <div>current：{{ $bpm.current }}</div>
    <div>breakpoint-value-pre-stored：pre-stored-{{ $bpm.getValue("pre-stored") }}</div>
    <div>breakpoint-value-temporary：temporary-{{ $bpm.v({ default: "default", sm: "sm", lg: "lg" }) }}</div>
  </div>

  <!--ThemeManager-->
  <div style="margin: 30px">
    <div>====ThemeManager====</div>
    <div>themes：{{ $tmm.themes }}</div>
    <div>current：{{ $tmm.current }}</div>
    <div>
      choose theme：
      <select @change="onThemeChanged">
        <option v-for="(theme, index) of $tmm.themes" :key="`${index}`" :value="theme.value" :selected="theme.value === $tmm.current">{{ theme.label }}</option>
      </select>
    </div>
    <div class="text-mainly" style="margin: 30px">Current Text Color</div>
    <div>theme-value-pre-stored：pre-stored-{{ $tmm.getValue("pre-stored") }}</div>
    <div>theme-value-temporary：temporary-{{ $tmm.v({ default: "default", dark: "dark", light: "light", middle: "middle" }) }}</div>
  </div>

  <!--LocaleManager-->
  <div style="margin: 30px">
    <div>====LocaleManager====</div>
    <div>locales{{ $llm.locales }}</div>
    <div>current：{{ $llm.current }}</div>
    <div>
      choose locale
      <select @change="onLocaleChanged">
        <option v-for="(locale, index) of $llm.locales" :key="`${index}`" :value="locale.value" :selected="locale.value === $llm.current">
          {{ locale.label }}
        </option>
      </select>
    </div>
    <div style="margin: 20px">
      {{ $llm.t("helloworld") }}
    </div>
  </div>

  <!--PopupManager-->
  <div style="margin: 30px">
    <div>====PopupManager====</div>
    <div style="margin-top: 30px">
      <button @click="onOpenFull">弹出元素</button>
      <button @click="onOpenPopper" ref="popperRef1">弹出Popper</button>
      <button @click="onOpenLock" ref="popperRef2">弹出元素，并且lockbody</button>
      <button @click="onOpenModal" ref="popperRef3">弹出元素，并且modal</button>
      <button @click="onOpenVueElm" ref="popperRef3">弹出Vue元素，并且modal</button>
    </div>
    <Popup ref="pp" />
    <div style="width: 400px; height: 500px; padding: 10px; margin-top: 30px; background-color: #ff0000">test-content</div>

    <!--class-modifier-->
    <div style="margin-top: 30px">ClassModifier</div>
    <Btn
      v-class-modifier="[
        { sel: (el) => el, cls: 'text-mainly' },
        { sel: 'button', cls: 'text-mainly' },
      ]"
    >
      aaa
    </Btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, Ref } from "vue";
import { ThemeManager, LocaleManager, PopupManager, PopupManagerOptions } from "./../lib";
import Popup from "./Popup.vue";
import Btn from "./Btn.vue";

export default defineComponent({
  name: "App",
  components: { Popup, Btn },
  setup() {
    const ex: any = {};
    //
    const $tmm: ThemeManager = inject("$tmm") as ThemeManager;
    ex.onThemeChanged = (e: any) => {
      $tmm.current = e.target.value;
    };

    //
    const $llm: LocaleManager = inject("$llm") as LocaleManager;
    ex.onLocaleChanged = (e: any) => {
      $llm.current = e.target.value;
    };

    //
    const $ppm: PopupManager = inject("$ppm") as PopupManager;
    ex.onOpenFull = () => {
      let el = document.createElement("div");
      el.setAttribute("id", "full");
      $ppm.open(el, { popupClasses: "popup_full" });
      setTimeout(() => {
        $ppm.close(el);
      }, 3000);
    };
    const popperRef1: Ref<HTMLElement | null> = ref(null);
    ex.popperRef1 = popperRef1;
    ex.onOpenPopper = () => {
      let el = document.createElement("div");
      el.setAttribute("id", "popper");
      $ppm.open(
        el,
        {
          popupClasses: "popup_full",
          popupReference: popperRef1.value,
          popperPlacement: "right",
        } as PopupManagerOptions,
        true
      );
      //
      setTimeout(() => {
        $ppm.close(el);
      }, 3000);
    };
    ex.onOpenLock = () => {
      let el = document.createElement("div");
      el.setAttribute("id", "lock");
      $ppm.open(el, {
        popupClasses: "popup_lock",
        bodyLock: true,
        bodyClasses: "body_lock",
      } as PopupManagerOptions);
      //
      setTimeout(() => {
        $ppm.close(el);
      }, 3000);
    };
    ex.onOpenModal = () => {
      let el = document.createElement("div");
      el.setAttribute("id", "modal");
      $ppm.open(el, {
        popupClasses: "popup_lock",
        bodyLock: false,
        modal: true,
        modalClasses: "popup_modal",
        closeClickOutside: true,
        closeDestroy: true,
      } as PopupManagerOptions);
      //
      // setTimeout(() => {
      //   $ppm.close(el);
      // }, 1500);
    };
    const pp: Ref<HTMLElement | null> = ref(null);
    ex.pp = pp;
    ex.onOpenVueElm = () => {
      //let pp = createApp(Popup).mount(document.body);
      $ppm.open(
        pp.value as any,
        {
          popupClasses: "popup_lock",
          bodyLock: false,
          modal: true,
          modalClasses: "popup_modal",
          closeClickOutside: true,
          closeDestroy: true,
        } as PopupManagerOptions
      );
      // setTimeout(() => {
      //   $ppm.close(el);
      // }, 1500);
    };
    //
    return ex;
  },
});
</script>

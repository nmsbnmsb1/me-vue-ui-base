# me-vue-ui-base

> helper classes for vue-based ui.
> for vue 3.0 and vite

## Features

- BreakPointManager
- EventManager
- LocaleManager
- PopupManager
- ThemeManager

## BreakPointManager

A tool to manager all css-breakpoints.

#### ./index.css

```css
@media (max-width: 991px) {
  .sm\:z {
    z-index: 11;
  }
}
@media (min-width: 992px) {
  .lg\:z {
    z-index: 12;
  }
}
```

#### ./main.ts

```typescript
import { install } from './BreakPointManager';

vue.use(install, {
  // breakpoint-name: zindex-value
  breakpoints: { 'sm:z': 11, 'lg:z': 12 },
  // pre-stored values(easy get value)
  values: {
    'pre-stored': { default: 'default', sm: 'sm', lg: 'lg' },
  }
}
```

#### ./app.vue

```vue
<template>
  <div id="app">
    <div>breakpoints：{{ $bpm.breakPoints }}</div>
    <div>current：{{ $bpm.current }}</div>
    <div>breakpoint-value-pre-stored：pre-stored-{{ $bpm.getValue("pre-stored") }}</div>
    <div>breakpoint-value-temporary：temporary-{{ $bpm.v({ default: "default", sm: "sm", lg: "lg" }) }}</div>
  </div>
</template>
```

## EventManager

A event-bridge

#### ./main.ts

```typescript
import { install } from "./EventManager";

vue.use(install, {});
```

## LocaleManager

A tool to manager language.

#### ./main.ts

```typescript
import { install } from './LocaleManager';

vue.use(install, {
  locales: {
      en: { label: 'English', helloworld: 'Hello World!' },
      'zh-CN': { label: '简体中文', helloworld: '你好 世界' },
  },
  default: 'en',
  current: 'en',
  i18n : undefined //vue-i18n Instance
}
```

#### ./app.vue

```vue
<template>
  <div id="app">
    <div>locales{{ $llm.locales }}</div>
    <div>current：{{ $llm.current }}</div>
    <div>
      choose locale
      <select @change="onLocaleChanged">
        <option v-for="(locale, index) of $llm.locales" :key="index" :value="locale.value" :selected="locale.value === $llm.current">{{ locale.label }}</option>
      </select>
    </div>
    <div style="margin:20px">
      {{ $llm.t("helloworld") }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({
  components: {},
})
export default class App extends Vue {
  onLocaleChanged(e: any) {
    (this as any).$llm.current = e.target.value;
  }
</script>
```

## ThemeManager

A tool to manager theme.

#### ./theme-dark.css

```css
.text-mainly {
  color: var(--text-mainly);
}
:root {
  --text-mainly: #999999;
}
```

#### ./theme-light.css

```css
:root {
  --text-mainly: #ff0000;
}
```

#### ./main.ts

```typescript
import { install } from './ThemeManager';

vue.use(install, {
  themes: {
      dark: { label: '深色', href: '/static/css/theme-dark.css' },
      light: { label: '亮色', href: '/static/css/theme-light.css' },
  },
  default: 'dark',
  current: 'dark',
  values: {
      'pre-stored': { default: 'default', dark: 'dark', light: 'light' },
  }
}
```

#### ./app.vue

```vue
<template>
  <div>themes：{{ $tmm.themes }}</div>
  <div>current：{{ $tmm.current }}</div>
  <div>
    choose theme：
    <select @change="onThemeChanged">
      <option v-for="(theme, index) of $tmm.themes" :key="index" :value="theme.value" :selected="theme.value === $tmm.current">{{ theme.label }}</option>
    </select>
  </div>
  <div class="text-mainly" style="margin:30px">Current Text Color</div>
  <div>theme-value-pre-stored：pre-stored-{{ $tmm.getValue("pre-stored") }}</div>
  <div>theme-value-temporary：temporary-{{ $tmm.v({ default: "default", dark: "dark", light: "light" }) }}</div>
  <div style="margin:30px"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({
  components: {},
})
export default class App extends Vue {
  onThemeChanged(e: any) {
    (this as any).$tmm.current = e.target.value;
  }
</script>
```

#### ./vue.config.js

```js
chainWebpack: (config) => {
    /**
     * 修改默认皮肤文件名
     */
    if (config.plugin('extract-css')) {
      config.plugin('extract-css').tap((options) => {
        return [
          {
            filename: 'static/css/theme-dark.css',
            chunkFilename: 'static/css/[name].css',
          },
        ];
      });
    }
  },
```

## PopupManager

A tool to manager all popup element.

#### ./popup.css

```css
.popup {
  position: absolute;
  border-color: #333333;
  border-style: solid;
  border-width: 1px;
}
.popup-fade-enter-active {
  animation: popup-enter 1s ease;
}
@keyframes popup-enter {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.popup-fade-leave-active {
  animation: popup-out 1s ease forwards;
}
@keyframes popup-out {
  0% {
  }
  100% {
    opacity: 0;
  }
}
.popup-arrow {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 6px;
}
.popup-arrow::after {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 6px;
  content: " ";
}
.popup-arrow,
.popup-arrow::after {
  position: absolute;
  z-index: -1;
  width: 6px;
  height: 6px;
}
.popup-arrow::after {
  background: aqua;
  border-color: transparent;
  border-style: solid;
  border-width: 1px;
  content: "";
  transform: rotate(45deg);
}
.body {
  padding-right: 0;
}
.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.5;
}
.modal-fade-enter-active {
  animation: modal-enter 2s ease;
}
@keyframes modal-enter {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.modal-fade-leave-active {
  animation: modal-out 2s ease forwards;
}
@keyframes modal-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.popup[data-popper-placement^="right"] {
  margin-left: 12px;
}
.popup_full {
  top: 50%;
  right: 50%;
  bottom: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  background-color: aqua;
}
.popup_full[data-popper-placement^="right"] {
  margin-left: 12px;
}
.popup_full[data-popper-placement^="right"] .popup-arrow {
  left: -6px;
  border-right-color: #333333;
  border-left-width: 0;
}
.popup_full[data-popper-placement^="right"] .popup-arrow::after {
  top: -6px;
  left: 1px;
  border-right-color: aqua;
  border-left-width: 0;
}
.popup_lock {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 30%;
  width: 400px;
  height: 400px;
  background-color: aqua;
  border-color: #333333;
  border-style: solid;
  border-width: 1px;
}
.body_lock {
  background-color: blue;
}
.popup_modal {
  opacity: 0.9;
}
```

#### ./main.ts

```typescript
import { install } from './PopupManager';

vue.use(install, {
  popupClasses: 'popup',
  popupArrow: true,
  popupArrowClasses: 'popup-arrow',
  //
  bodyClasses: 'body',
  //
  modalClasses: 'modal',
  modalOpenAni: true,
  modalOpenAniClasses: 'modal-fade-enter-active',
  modalCloseAni: true,
  modalCloseAniClasses: 'modal-fade-leave-active',
  //
  openDelay: 200,
  openAni: true,
  openAniClasses: 'popup-fade-enter-active',
  //
  closeDelay: 200,
  closeAni: true,
  closeAniClasses: 'popup-fade-leave-active',
}
```

#### ./app.ts

```vue
<script lang="ts">
import { defineComponent, inject, ref, Ref } from "vue";
import { PopupManager, PopupManagerOptions } from "./../lib";

export default defineComponent({
  name: "App",
  components: {},
  setup() {
    const ex: any = {};
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
```

## Installer

#### ./main.ts

```typescript
import { install as VueUIBase } from "./lib";

createApp(App).use(VueUIBase, {
  //break-point
  $bpm: {
    breakpoints: { "sm:z": 11, "lg:z": 12 },
    values: {
      "pre-stored": { default: "default", sm: "sm", lg: "lg" },
    },
  },
  //theme
  $tmm: {
    themes: {
      dark: { label: "深色", href: "/static/css/theme-dark.css" },
      light: { label: "亮色", href: "/static/css/theme-light.css" },
    },
    default: "dark",
    current: "dark",
    values: {
      "pre-stored": { default: "default", dark: "dark", light: "light" },
    },
  },
  //$llm
  $llm: {
    locales: {
      en: { label: "English", helloworld: "Hello World!" },
      "zh-CN": { label: "简体中文", helloworld: "你好 世界" },
    },
    default: "en",
    current: "en",
  },
  //$ppm
  $ppm: {
    popupClasses: "popup",
    popupArrow: true,
    popupArrowClasses: "popup-arrow",
    //
    bodyClasses: "body",
    //
    modalClasses: "modal",
    modalOpenAni: true,
    modalOpenAniClasses: "modal-fade-enter-active",
    modalCloseAni: true,
    modalCloseAniClasses: "modal-fade-leave-active",
    //
    openDelay: 200,
    openAni: true,
    openAniClasses: "popup-fade-enter-active",
    //
    closeDelay: 200,
    closeAni: true,
    closeAniClasses: "popup-fade-leave-active",
  },
});
```

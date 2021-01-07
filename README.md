# me-vue-ui-base

> A lib to offer some helper-classes for any ui-framework.

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
Vue.use(install, {
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
    <div>breakpoint-value-pre-stored：pre-stored-{{ $bpm.getValue('pre-stored') }}</div>
    <div>breakpoint-value-temporary：temporary-{{ $bpm.v({ default: 'default', sm: 'sm', lg: 'lg' }) }}</div>
  </div>
</template>
```

## EventManager

A event-bridge

#### ./main.ts

```typescript
import { install } from './EventManager';
Vue.use(install, {});
```

## LocaleManager

A tool to manager language.

#### ./main.ts

```typescript
import { install } from './LocaleManager';
Vue.use(install, {
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
      {{ $llm.t('helloworld') }}
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
Vue.use(install, {
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
  <div>theme-value-pre-stored：pre-stored-{{ $tmm.getValue('pre-stored') }}</div>
  <div>theme-value-temporary：temporary-{{ $tmm.v({ default: 'default', dark: 'dark', light: 'light' }) }}</div>
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
/*popup*/
.popup {
  position: absolute;
  border-color: #333333;
  border-style: solid;
  border-width: 1px;
}
.popup-arrow,
.popup-arrow::after {
  position: absolute;
  width: 6px;
  height: 6px;
  z-index: -1;
}
.popup-arrow::after {
  content: '';
  transform: rotate(45deg);
  background: aqua;
  border-style: solid;
  border-color: transparent;
  border-width: 1px;
}
.popup[data-popper-placement^='right'] {
  margin-left: 12px;
}
.popup[data-popper-placement^='right'] .popup-arrow::after {
  left: -4px;
  border-bottom-color: #333333;
  border-left-color: #333333;
}

/*popup-ani*/
.popup-fade-enter-active {
  animation: popup-enter 1s ease;
}
@keyframes popup-enter {
  0% {
    opacity: 0;
  }
  100% {
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

/*modal*/
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
  }
}
.modal-fade-leave-active {
  animation: modal-out 2s ease forwards;
}
@keyframes modal-out {
  0% {
  }
  100% {
    opacity: 0;
  }
}
```

#### ./main.ts

```typescript
import { install } from './PopupManager';
Vue.use(install, {
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
import { Component, Vue } from 'vue-property-decorator';
@Component({
  components: {},
})
export default class App extends Vue {
  onOpenModal(e: any) {
    let el = document.createElement('div');
    el.setAttribute('id', 'modal');
    (this as any).$ppm.open(el, {
      popupClasses: 'popup_lock',
      bodyLock: true,
      modal: true,
      modalClasses: 'popup_modal',
      closeClickOutside: true,
      closeDestroy: true,
    } as IOptions);
    //
    setTimeout(() => {
      (this as any).$ppm.close(el);
    }, 1500);
</script>
```

## Installer

#### ./main.ts

```typescript
import Base from './lib';

Vue.use(Base, {
  //break-point
  $bpm: {
    breakpoints: { 'sm:z': 11, 'lg:z': 12 },
    values: {
      'pre-stored': { default: 'default', sm: 'sm', lg: 'lg' },
    },
  },
  //theme
  $tmm: {
    themes: {
      dark: { label: '深色', href: '/static/css/theme-dark.css' },
      light: { label: '亮色', href: '/static/css/theme-light.css' },
    },
    default: 'dark',
    current: 'dark',
    values: {
      'pre-stored': { default: 'default', dark: 'dark', light: 'light' },
    },
  },
  //$llm
  $llm: {
    locales: {
      en: { label: 'English', helloworld: 'Hello World!' },
      'zh-CN': { label: '简体中文', helloworld: '你好 世界' },
    },
    default: 'en',
    current: 'en',
  },
  //$ppm
  $ppm: {
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
  },
});
```

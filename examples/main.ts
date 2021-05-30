import { createApp } from "vue";
import App from "./App.vue";
import { install as VueUIBase } from "./../lib";
import "./theme-dark.css";

createApp(App)
  .use(VueUIBase, {
    //break-point
    $bpm: {
      breakpoints: { sm: 11, lg: 12 },
      values: {
        "pre-stored": { default: "default", sm: "sm", lg: "lg" },
      },
    },
    //theme
    $tmm: {
      themes: {
        dark: { label: "深色" },
        light: { label: "亮色", href: `${(import.meta as any).env.BASE_URL}examples/theme-light.css` },
        middle: { label: "中间色", href: `${(import.meta as any).env.BASE_URL}examples/theme-middle.css` },
      },
      default: "dark",
      current: "dark",
      values: {
        "pre-stored": { default: "default", dark: "dark", light: "light", middle: "middle" },
      },
    },
    //locale
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
  })
  .mount("#app");

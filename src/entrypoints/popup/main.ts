import { createApp } from "vue";
import { router } from "./router";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import App from "./App.vine";
import "@/index.css";
import { VueQueryPlugin } from "@tanstack/vue-query";

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })
  .use(VueQueryPlugin)
  .mount("#app");

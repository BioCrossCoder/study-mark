import { VineVitePlugin } from "vue-vine/vite";
import VueRouter from "vue-router/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  vite: () => ({
    plugins: [
      VueRouter({
        extensions: [".vine.ts"],
        routesFolder: [
          {
            src: "entrypoints/popup/pages",
            path: "popup/",
          },
          {
            src: "entrypoints/sidepanel/pages",
            path: "sidepanel/",
          },
          {
            src: "entrypoints/bookmarks/pages",
            path: "bookmarks/",
          },
        ],
      }),
      VineVitePlugin(),
    ],
  }),
  manifest: {
    permissions: [
      "storage",
      "tabs",
      "sidePanel",
      "history",
      "bookmarks",
      "unlimitedStorage",
      "downloads",
    ],
  },
});

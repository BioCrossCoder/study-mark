import { VineVitePlugin } from "vue-vine/vite";
import VueRouter from "vue-router/vite";
import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  vite: () => ({
    plugins: [
      VueRouter({
        extensions: [".vine.ts"],
        routesFolder: [
          {
            src: "src/entrypoints/popup/pages",
            path: "popup/",
          },
          {
            src: "src/entrypoints/sidepanel/pages",
            path: "sidepanel/",
          },
        ],
      }),
      VineVitePlugin(),
      tailwindcss(),
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
      "background",
      "contextMenus",
      "scripting",
      "notifications",
    ],
    host_permissions: ["*"],
    default_locale: "en",
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
  },
  srcDir: "src",
});

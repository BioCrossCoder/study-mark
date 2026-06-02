import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
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
    host_permissions: ["<all_urls>"],
    default_locale: "en",
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});

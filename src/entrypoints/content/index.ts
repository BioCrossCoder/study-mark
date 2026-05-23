import { Signal } from "@/common/enums";
import { signalMessageSchema } from "@/common/types";
import { loadBookmark, saveBookmark } from "./logics/bookmark";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    loadBookmark();
    browser.runtime.onMessage.addListener((message) => {
      const { success, data } = signalMessageSchema.safeParse(message);
      if (!success) {
        return;
      }
      switch (data.content) {
        case Signal.SaveProgress:
          return saveBookmark();
        case Signal.Bookmark:
          return loadBookmark();
      }
    });
  },
});

import { MessageID } from "@/common/enums";
import { loadBookmark, saveBookmark } from "./logics/bookmark";
import { onMessage } from "webext-bridge/content-script";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    loadBookmark();
    onMessage(MessageID.SaveProgress, saveBookmark);
    onMessage(MessageID.LoadProgress, loadBookmark);
  },
});

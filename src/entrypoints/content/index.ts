import { MessageID } from "@/common/enums";
import { gotoBookmark, loadBookmark, saveBookmark } from "./logics/bookmark";
import { onMessage } from "webext-bridge/content-script";
import { loadComments, saveComment } from "./logics/comment";
import "tippy.js/dist/tippy.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    loadComments();
    loadBookmark();
    onMessage(MessageID.SaveProgress, saveBookmark);
    onMessage(MessageID.LoadProgress, loadBookmark);
    onMessage(MessageID.GotoProgress, gotoBookmark);
    onMessage(MessageID.SaveComment, saveComment);
    onMessage(MessageID.LoadComment, loadComments);
  },
});

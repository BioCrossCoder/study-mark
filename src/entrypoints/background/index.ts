import { ContextMenuItemID, MessageID } from "@/common/enums";
import { registerContextMenuItem } from "@/common/utils";
import { onMessage, sendMessage } from "webext-bridge/background";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    registerContextMenuItem(
      ContextMenuItemID.UpdateProgress,
      "Save Study Progress",
      [browser.contextMenus.ContextType.SELECTION],
      (_, tab) => {
        sendMessage(MessageID.SaveProgress, null, {
          context: "content-script",
          tabId: tab?.id ?? browser.tabs.TAB_ID_NONE,
        });
      },
    );
  });
  browser.tabs.onUpdated.addListener((tabId, info) => {
    if (!info.url) {
      return;
    }
    sendMessage(MessageID.LoadProgress, null, {
      context: "content-script",
      tabId,
    });
  });
  onMessage(MessageID.ProgressUpdated, () => {
    browser.runtime.sendMessage(MessageID.ProgressUpdated);
  });
});

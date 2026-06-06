import {
  AgentMode,
  ContextMenuItemID,
  MessageID,
  Signal,
} from "@/common/enums";
import { chatMessageSchema, signalSchema } from "@/common/schemas";
import { registerContextMenuItem } from "@/common/utils";
import { sendMessage } from "webext-bridge/background";
import { plannerAgent } from "./agents/planner";
import { chatLoadingData } from "@/services/storage/chatLoading";

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
  browser.runtime.onMessage.addListener(async (message) => {
    const signal = signalSchema.safeParse(message);
    if (signal.success) {
      switch (signal.data) {
        case Signal.Stop:
          plannerAgent.stop();
          await chatLoadingData.setValue(false);
          break;
      }
      return;
    }
    const chatMessage = chatMessageSchema.safeParse(message);
    if (chatMessage.success) {
      const { mode, message } = chatMessage.data;
      switch (mode) {
        case AgentMode.Plan:
          await chatLoadingData.setValue(true);
          await plannerAgent.run(message);
          await chatLoadingData.setValue(false);
          browser.notifications.create({
            type: "basic",
            iconUrl: "icon/48.png",
            title: "Study Plan Generation Finished",
            message:
              message.slice(0, 100) + (message.length > 100 ? "..." : ""),
          });
          break;
        case AgentMode.Chat:
          // TODO
          break;
      }
    }
  });
});

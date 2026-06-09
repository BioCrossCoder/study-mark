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
import {
  stopLoadingInHistory,
  updateHistory,
} from "@/services/storage/chatHistory";
import { ChatHumanMessage } from "@/common/types";

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
    registerContextMenuItem(
      ContextMenuItemID.AddComment,
      "Add Comment",
      [browser.contextMenus.ContextType.SELECTION],
      (_, tab) => {
        sendMessage(MessageID.AddComment, null, {
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
    sendMessage(MessageID.LoadComment, null, {
      context: "content-script",
      tabId,
    });
  });
  browser.runtime.onMessage.addListener(async (message) => {
    const signal = signalSchema.safeParse(message);
    if (signal.success) {
      switch (signal.data) {
        case Signal.Stop:
          plannerAgent.stop(stopLoadingInHistory);
          await chatLoadingData.setValue(false);
          break;
      }
      return;
    }
    const chatMessage = chatMessageSchema.safeParse(message);
    if (chatMessage.success) {
      const { mode, message: content } = chatMessage.data;
      await updateHistory(
        { type: "human", content } as ChatHumanMessage,
        AgentMode.Plan,
      );
      await chatLoadingData.setValue(true);
      switch (mode) {
        case AgentMode.Plan:
          const result = await plannerAgent.run(content);
          const notice = Error.isError(result) ? "Failed" : "Succeeded";
          const message = Error.isError(result)
            ? result.message
            : content.slice(0, 100) + (content.length > 100 ? "..." : "");
          await chatLoadingData.setValue(false);
          browser.notifications.create({
            type: "basic",
            iconUrl: "icon/48.png",
            title: `Study Plan Generation ${notice}`,
            message,
          });
          break;
        case AgentMode.Chat:
          // TODO
          break;
      }
    }
  });
});

import {
  Channel,
  ContextMenuItemID,
  MessageType,
  Signal,
} from "@/common/enums";
import { textMessageSchema, signalMessageSchema } from "@/common/types";
import { chatbotAgent } from "./agents/chatbot";
import { plannerAgent } from "./agents/planner";
import { send } from "@/common/utils";

export default defineBackground(() => {
  const connections = new Map<string, globalThis.Browser.runtime.Port>();
  browser.runtime.onConnect.addListener((port) => {
    // [BuildConnectionForAIChat]
    connections.set(port.name, port);
    const callback = callbacks[port.name];
    if (callback && !port.onMessage.hasListener(callback)) {
      port.onMessage.addListener(callback);
    } // [/]
  });
  browser.runtime.onMessage.addListener((message) => {
    // [NoticeViewUpdate]
    const signalMessage = signalMessageSchema.safeParse(message);
    if (signalMessage.success) {
      connections.get(Channel.SidePanel)?.postMessage(message);
    } // [/]
  });
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: ContextMenuItemID.RecordProgress,
      title: "Save Study Progress",
      contexts: [browser.contextMenus.ContextType.SELECTION],
    });
    browser.contextMenus.onClicked.addListener((_info, tab) => {
      browser.tabs.sendMessage(tab?.id ?? browser.tabs.TAB_ID_NONE, {
        type: MessageType.Signal,
        content: Signal.SaveProgress,
      });
    });
  });
});

const callbacks: Record<
  string,
  ((message: any, port: globalThis.Browser.runtime.Port) => void) | undefined
> = {
  [Channel.SidePanel]: async (message, port) => {
    // [HandleSignal]
    const signalMessage = signalMessageSchema.safeParse(message);
    if (signalMessage.success) {
      switch (signalMessage.data.content) {
        case Signal.Clear:
          chatbotAgent.clearHistory();
          break;
        case Signal.Stop:
          chatbotAgent.stop();
          plannerAgent.stop();
          break;
      }
      return;
    } // [/]
    // [HandleText]
    const textMessage = textMessageSchema.safeParse(message);
    if (textMessage.success) {
      const { content } = textMessage.data;
      switch (textMessage.data.type) {
        case MessageType.Text:
          send(port, await chatbotAgent.run(port, content));
          break;
        case MessageType.Plan:
          send(port, await plannerAgent.run(port, content));
          browser.notifications.create({
            type: "basic",
            iconUrl: "icon/48.png",
            title: "Plan Generation Finished",
            message:
              content.slice(0, 100) + (content.length > 100 ? "..." : ""),
          });
          break;
      }
    } // [/]
  },
};

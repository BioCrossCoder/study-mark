import { Channel, Signal } from "@/common/enums";
import { chatContext } from "@/entrypoints/background/stores/chat";
import { textMessageSchema, signalMessageSchema } from "@/common/types";
import { runChatbotAgent } from "./agents/chatbot";

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
});

const callbacks: Record<
  string,
  ((message: any, port: globalThis.Browser.runtime.Port) => void) | undefined
> = {
  [Channel.SidePanel]: async (message, port) => {
    // [HandleSignal]
    const signalMessage = signalMessageSchema.safeParse(message);
    if (signalMessage.success && signalMessage.data.content === Signal.Clear) {
      chatContext.setValue([]);
      return;
    } // [/]
    // [HandleText]
    const textMessage = textMessageSchema.safeParse(message);
    if (textMessage.success) {
      await runChatbotAgent(port, textMessage.data);
    } // [/]
  },
};

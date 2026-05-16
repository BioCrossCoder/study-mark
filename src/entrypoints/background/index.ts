import { Channel, MessageType, Signal } from "@/common/enums";
import { textMessageSchema, signalMessageSchema } from "@/common/types";
import { chatbotAgent } from "./agents/chatbot";
import { plannerAgent } from "./agents/planner";

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
    if (signalMessage.success) {
      switch (signalMessage.data.content) {
        case Signal.Clear:
          return chatbotAgent.clearHistory();
        case Signal.Stop:
          chatbotAgent.stop();
          plannerAgent.stop();
      }
    } // [/]
    // [HandleText]
    const textMessage = textMessageSchema.safeParse(message);
    if (textMessage.success) {
      const { content } = textMessage.data;
      switch (textMessage.data.type) {
        case MessageType.Text:
          return chatbotAgent.run(port, content);
        case MessageType.Plan:
          return plannerAgent.run(port, content);
      }
    } // [/]
  },
};

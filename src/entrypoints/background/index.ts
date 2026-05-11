import { Channel, MessageType, Signal } from "@/common/enums";
import { chatContext } from "@/entrypoints/background/stores/chat";
import {
  textMessageSchema,
  signalMessageSchema,
  TextMessage,
  SignalMessage,
  ErrorMessage,
} from "@/common/types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { modelConfig } from "@/stores/config";
import { ResultAsync } from "neverthrow";
import { createChatAgent } from "./infra/chatAgent";

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

function send<T>(port: globalThis.Browser.runtime.Port, message: T) {
  port.postMessage(message);
}

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
      const agent = createChatAgent(await modelConfig.getValue());
      // [CallLLMWithHistoryAsContext]
      const messages = await chatContext.getValue();
      let { content } = textMessage.data;
      messages.push(new HumanMessage(content));
      const result = await ResultAsync.fromThrowable((message) =>
        agent.stream(message),
      )(messages);
      if (result.isErr()) {
        send<ErrorMessage>(port, {
          type: MessageType.Error,
          content: (result.error as Error).message,
        });
        return;
      }
      const stream = result.unwrapOr(null)!; // [/]
      // [TransmitStreamOutputAndRecordMessage]
      content = "";
      for await (const chunk of stream) {
        const text =
          typeof chunk.content === "string"
            ? chunk.content
            : JSON.stringify(chunk.content);
        content += text;
        send<TextMessage>(port, {
          type: MessageType.Text,
          content: text,
        });
      } // [/]
      // [FinishMessageSendingAndUpdateHistory]
      send<SignalMessage>(port, {
        type: MessageType.Signal,
        content: Signal.Finish,
      });
      messages.push(new AIMessage(content));
      chatContext.setValue(messages); // [/]
      return;
    } // [/]
  },
};

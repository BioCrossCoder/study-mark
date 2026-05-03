import { Channel, Signal } from "@/common/enums";
import { chat, StreamChunk } from "@tanstack/ai";
import { createAnthropicChat } from "@tanstack/ai-anthropic";
import { model, apiKey, baseURL } from "@/../env.json";
import { chatContext } from "@/entrypoints/background/stores/chat";
import {
  textMessageSchema,
  signalMessageSchema,
  TextMessage,
  SignalMessage,
} from "@/common/types";

export default defineBackground(() => {
  const connections = new Map<string, globalThis.Browser.runtime.Port>();
  browser.runtime.onConnect.addListener((port) => {
    connections.set(port.name, port);
    const callback = callbacks[port.name];
    if (callback && !port.onMessage.hasListener(callback)) {
      port.onMessage.addListener(callback);
    }
  });
  browser.runtime.onMessage.addListener((message) => {
    if (message === Signal.UpdateTask) {
      connections.get(Channel.SidePanel)?.postMessage(message);
    }
  });
});

const adapter = createAnthropicChat(model as any, apiKey, {
  baseURL,
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
    if (signalMessage.success && signalMessage.data.content === "clear") {
      chatContext.setValue([]);
      return;
    } // [/]
    // [HandleText]
    const textMessage = textMessageSchema.safeParse(message);
    if (textMessage.success) {
      const messages = await chatContext.getValue();
      let { content } = textMessage.data;
      messages.push({ role: "user", content });
      const stream = chat({
        adapter,
        messages,
        stream: true,
      });
      content = "";
      for await (const chunk of stream) {
        const text = ((chunk as StreamChunk).content ?? "") as string;
        if (text.length > content.length) {
          content = text;
          send<TextMessage>(port, {
            type: "text",
            content,
          });
        }
      }
      send<SignalMessage>(port, {
        type: "signal",
        content: "finish",
      });
      messages.push({ role: "assistant", content });
      chatContext.setValue(messages);
      return;
    } // [/]
  },
};

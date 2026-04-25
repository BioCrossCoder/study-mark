import { Channel } from "@/common/enums";
import { chat, StreamChunk } from "@tanstack/ai";
import { createAnthropicChat } from "@tanstack/ai-anthropic";
import { model, apiKey, baseURL } from "@/../env.json";
import { chatContext } from "@/stores/chat";
import { signalMessageSchema } from "@/common/types";

export default defineBackground(() => {
  browser.runtime.onConnect.addListener((port) => {
    const callback = callbacks[port.name];
    if (callback && !port.onMessage.hasListener(callback)) {
      port.onMessage.addListener(callback);
    }
  });
  browser.runtime.onMessage.addListener((message) => {
    const { success, data } = signalMessageSchema.safeParse(message);
    if (success) {
      switch (data.content) {
        case "clear":
          chatContext.setValue([]);
          break;
      }
    }
  });
});

const adapter = createAnthropicChat(model as any, apiKey, {
  baseURL,
});

const callbacks: Record<
  string,
  ((message: any, port: globalThis.Browser.runtime.Port) => void) | undefined
> = {
  [Channel.SidePanel]: async (message, port) => {
    const messages = await chatContext.getValue();
    messages.push({ role: "user", content: message });
    const stream = chat({
      adapter,
      messages,
      stream: true,
    });
    let text = "";
    for await (const chunk of stream) {
      const content = ((chunk as StreamChunk).content ?? "") as string;
      if (content.length > text.length) {
        text = content;
        port.postMessage(text);
      }
    }
    messages.push({ role: "assistant", content: text });
    chatContext.setValue(messages);
  },
};

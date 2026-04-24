import { Channel } from "@/common/enums";
import { chat, streamToText } from "@tanstack/ai";
import { createAnthropicChat } from "@tanstack/ai-anthropic";
import { model, apiKey, baseURL } from "@/../env.json";
import { chatContext } from "@/stores/chat";

export default defineBackground(() => {
  browser.runtime.onConnect.addListener((port) => {
    const callback = callbacks[port.name];
    if (callback && !port.onMessage.hasListener(callback)) {
      port.onMessage.addListener(callback);
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
    // TODO stream output
    const text = await streamToText(stream);
    messages.push({ role: "assistant", content: text });
    chatContext.setValue(messages);
    port.postMessage(text);
  },
};

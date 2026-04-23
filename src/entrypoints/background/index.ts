import { Channel } from "@/common/enums";
import { chat, streamToText } from "@tanstack/ai";
import { createAnthropicChat } from "@tanstack/ai-anthropic";
import { model, apiKey, baseURL } from "@/../env.json";

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
    const stream = chat({
      adapter,
      messages: [{ role: "user", content: message }],
      stream: true,
    });
    // TODO stream output
    const text = await streamToText(stream);
    port.postMessage(text);
  },
};

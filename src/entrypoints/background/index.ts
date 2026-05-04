import { Channel, Signal } from "@/common/enums";
import { model, apiKey, baseURL } from "@/../env.json";
import { chatContext } from "@/entrypoints/background/stores/chat";
import {
  textMessageSchema,
  signalMessageSchema,
  TextMessage,
  SignalMessage,
} from "@/common/types";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

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

const agent = new ChatOpenAI({
  model,
  configuration: {
    baseURL,
    apiKey,
  },
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
      messages.push(new HumanMessage(content));
      const stream = await agent.stream(messages);
      content = "";
      for await (const chunk of stream) {
        const text =
          typeof chunk.content === "string"
            ? chunk.content
            : JSON.stringify(chunk.content);
        content += text;
        send<TextMessage>(port, {
          type: "text",
          content: text,
        });
      }
      send<SignalMessage>(port, {
        type: "signal",
        content: "finish",
      });
      messages.push(new AIMessage(content));
      chatContext.setValue(messages);
      return;
    } // [/]
  },
};

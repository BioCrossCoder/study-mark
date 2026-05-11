import { modelConfig } from "@/stores/config";
import { createChatAgent } from "../infra/chatAgent";
import { chatContext } from "../stores/chat";
import { ErrorMessage, SignalMessage, TextMessage } from "@/common/types";
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
} from "@langchain/core/messages";
import { ResultAsync } from "neverthrow";
import { MessageType, Signal } from "@/common/enums";

export const chatbotAgent = {
  async answerQuestion(
    port: globalThis.Browser.runtime.Port,
    data: TextMessage,
  ) {
    const agent = createChatAgent(await modelConfig.getValue());
    // [CallLLMWithHistoryAsContext]
    const messages = await chatContext.getValue();
    const { content } = data;
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
    let message = new AIMessageChunk("");
    for await (const chunk of stream) {
      message = message.concat(chunk);
      const text =
        typeof chunk.content === "string"
          ? chunk.content
          : JSON.stringify(chunk.content);
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
    messages.push(new AIMessage(message));
    chatContext.setValue(messages); // [/]
    return;
  },
  clearHistory() {
    chatContext.setValue([]);
  },
};

function send<T>(port: globalThis.Browser.runtime.Port, message: T) {
  port.postMessage(message);
}

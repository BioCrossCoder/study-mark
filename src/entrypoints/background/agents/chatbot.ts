import { modelConfig } from "@/stores/config";
import { createChatAgent } from "../infra/chatAgent";
import { chatContext } from "../stores/chat";
import { ErrorMessage, SignalMessage, TextMessage } from "@/common/types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ResultAsync } from "neverthrow";
import { MessageType, Signal } from "@/common/enums";

export async function runChatbotAgent(
  port: globalThis.Browser.runtime.Port,
  data: TextMessage,
) {
  const agent = createChatAgent(await modelConfig.getValue());
  // [CallLLMWithHistoryAsContext]
  const messages = await chatContext.getValue();
  let { content } = data;
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
}

function send<T>(port: globalThis.Browser.runtime.Port, message: T) {
  port.postMessage(message);
}

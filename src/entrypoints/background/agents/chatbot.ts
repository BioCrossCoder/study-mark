import { modelConfig } from "@/stores/config";
import { chatContext } from "../stores/chat";
import {
  ErrorMessage,
  ModelConfig,
  SignalMessage,
  TextMessage,
} from "@/common/types";
import { AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { ResultAsync } from "neverthrow";
import { MessageType, Signal, ToolName } from "@/common/enums";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent } from "langchain";
import { createTrimMessagesMiddleware } from "../middlewares/trimMessages";
import { createSumMessagesMiddleware } from "../middlewares/sumMessages";
import { createWebSearchTool } from "../tools/webSearch";

export const chatbotAgent = {
  answerQuestion,
  clearHistory,
};

async function answerQuestion(
  port: globalThis.Browser.runtime.Port,
  data: TextMessage,
) {
  const agent = createChatbotAgent(await modelConfig.getValue());
  // [CallLLMWithHistoryAsContext]
  const messages = await chatContext.getValue();
  const { content } = data;
  messages.push(new HumanMessage(content));
  const result = await ResultAsync.fromThrowable((messages) =>
    agent.stream({ messages }, { streamMode: "messages" }),
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
  const responseChunks = new Array<AIMessageChunk>();
  for await (const [chunk] of stream) {
    if (chunk.type !== "ai") {
      continue;
    }
    responseChunks.push(chunk as AIMessageChunk);
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
  if (responseChunks.length === 0) {
    return;
  }
  messages.push(
    responseChunks.reduce((c1, c2) => c1.concat(c2), new AIMessageChunk("")),
  );
  chatContext.setValue(messages); // [/]
}

function buildSystemPrompt(searchApiKey: string) {
  const extraPrompt = searchApiKey
    ? `
    You can use the ${ToolName.WebSearch} tool to supplement necessary information.
    Only use it when you need latest information, specific facts or real-time data.
    For each user question, the ${ToolName.WebSearch} tool can only be called once.
  `
    : "";
  return (
    `
      You are an assistant for study guidance,
      focusing on providing useful information and advice
      for learners to plan their self-study.
    ` + extraPrompt
  );
}

function createChatbotAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  const sumMessages = createSumMessagesMiddleware(model);
  const trimMessages = createTrimMessagesMiddleware(model);
  const { tavilyApiKey } = config;
  const tools = tavilyApiKey ? [createWebSearchTool(tavilyApiKey)] : undefined;
  const systemPrompt = buildSystemPrompt(tavilyApiKey);
  return createAgent({
    model,
    middleware: [sumMessages, trimMessages],
    tools,
    systemPrompt,
  });
}

function clearHistory() {
  chatContext.setValue([]);
}

function send<T>(port: globalThis.Browser.runtime.Port, message: T) {
  port.postMessage(message);
}

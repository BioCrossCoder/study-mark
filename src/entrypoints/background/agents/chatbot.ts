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
import { MessageType, Signal } from "@/common/enums";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent } from "langchain";
import { createTrimMessagesMiddleware } from "../middlewares/trimMessages";
import { createSumMessagesMiddleware } from "../middlewares/sumMessages";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";
import { send } from "@/common/utils";

export const chatbotAgent = {
  answerQuestion,
  clearHistory,
};

async function answerQuestion(
  port: globalThis.Browser.runtime.Port,
  content: string,
) {
  const agent = createChatbotAgent(await modelConfig.getValue());
  // [CallAgentWithHistoryAsContext]
  const messages = await chatContext.getValue();
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
    const reasoning = chunk.additional_kwargs.reasoning_content;
    const text = chunk.content;
    if (reasoning) {
      send<TextMessage>(port, {
        type: MessageType.Infer,
        content:
          typeof reasoning === "string" ? reasoning : JSON.stringify(reasoning),
      });
    } else if (text) {
      responseChunks.push(chunk as AIMessageChunk);
      send<TextMessage>(port, {
        type: MessageType.Text,
        content: typeof text === "string" ? text : JSON.stringify(text),
      });
    }
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

const corePrompt = `
  You are an assistant for study guidance,
  focusing on providing useful information and advice
  for learners to plan their self-study.
`;

function buildSystemPrompt(searchApiKey: string) {
  const prompts = [corePrompt];
  if (searchApiKey) {
    prompts.push(webSearchToolPrompt);
  }
  return prompts.join("\n");
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

import { modelConfig } from "@/stores/config";
import { chatContext } from "../stores/chat";
import {
  ErrorMessage,
  ModelConfig,
  SignalMessage,
  TextMessage,
} from "@/common/types";
import {
  AIMessageChunk,
  BaseMessage,
  HumanMessage,
  RemoveMessage,
  trimMessages,
} from "@langchain/core/messages";
import { ResultAsync } from "neverthrow";
import { MessageType, Signal } from "@/common/enums";
import { createModelAdapter } from "../infra/modelAdapter";
import {
  createAgent,
  createMiddleware,
  summarizationMiddleware,
} from "langchain";
import { REMOVE_ALL_MESSAGES } from "@langchain/langgraph";

function createTokenCounter(estimate: (content: string) => Promise<number>) {
  return async (messages: BaseMessage[]) => {
    // [GetAccurateTokensCountFromHistory]
    const historyMessages = await chatContext.getValue();
    while (historyMessages.length > 0) {
      const lastMessage = historyMessages.pop()!;
      if (lastMessage.type === "ai") {
        const totalTokens = lastMessage.usage_metadata?.total_tokens;
        if (totalTokens) {
          return totalTokens;
        }
      }
    } // [/]
    // [EstimateTokensCountFromMessages]
    const estimates = new Array<Promise<number>>();
    messages.forEach((message) => {
      estimates.push(
        estimate(
          typeof message.content === "string"
            ? message.content
            : JSON.stringify(message.content),
        ),
      );
    });
    return (await Promise.all(estimates)).reduce((a, b) => a + b, 0); // [/]
  };
}

const maxTokens = 32 * 1000 * 0.4;

function createTrimMiddleware(estimate: (content: string) => Promise<number>) {
  return createMiddleware({
    name: "TrimMessages",
    beforeModel: async (state) => {
      const trimmed = await trimMessages(state.messages, {
        maxTokens,
        strategy: "last",
        startOn: "human",
        endOn: ["ai", "human"],
        tokenCounter: createTokenCounter(estimate),
      });
      return {
        messages: [new RemoveMessage({ id: REMOVE_ALL_MESSAGES }), ...trimmed],
      };
    },
  });
}

function createSumMiddleware(model: ReturnType<typeof createModelAdapter>) {
  return summarizationMiddleware({
    model,
    trigger: {
      tokens: maxTokens,
      messages: 20,
    },
    keep: {
      messages: 10,
    },
  });
}

function createChatbotAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  const sumMessages = createSumMiddleware(model);
  const trimMessages = createTrimMiddleware((content: string) =>
    model.getNumTokens(content),
  );
  return createAgent({
    model,
    middleware: [sumMessages, trimMessages],
  });
}

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

function clearHistory() {
  chatContext.setValue([]);
}

function send<T>(port: globalThis.Browser.runtime.Port, message: T) {
  port.postMessage(message);
}

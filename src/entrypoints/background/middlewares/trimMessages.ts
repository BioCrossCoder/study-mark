import { BaseMessage, createMiddleware, trimMessages } from "langchain";
import { chatContext } from "../stores/chat";
import { REMOVE_ALL_MESSAGES } from "@langchain/langgraph";
import { RemoveMessage } from "@langchain/core/messages";
import { maxTokens } from "@/common/constants";
import { createModelAdapter } from "../infra/modelAdapter";

export function createTrimMessagesMiddleware(
  model: ReturnType<typeof createModelAdapter>,
) {
  return createMiddleware({
    name: "TrimMessages",
    beforeModel: async (state) => {
      const trimmed = await trimMessages(state.messages, {
        maxTokens,
        strategy: "last",
        startOn: "human",
        endOn: ["ai", "human", "tool"],
        tokenCounter: createTokenCounter((content: string) =>
          model.getNumTokens(content),
        ),
        includeSystem: true,
      });
      return {
        messages: [new RemoveMessage({ id: REMOVE_ALL_MESSAGES }), ...trimmed],
      };
    },
  });
}

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

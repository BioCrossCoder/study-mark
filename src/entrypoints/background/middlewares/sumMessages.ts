import { summarizationMiddleware } from "langchain";
import { createModelAdapter } from "../infra/modelAdapter";
import { maxTokens } from "@/common/constants";

export function createSumMessagesMiddleware(
  model: ReturnType<typeof createModelAdapter>,
) {
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

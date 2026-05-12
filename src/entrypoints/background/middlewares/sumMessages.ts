import { summarizationMiddleware } from "langchain";
import { createModelAdapter } from "../infra/modelAdapter";

export function createSumMessagesMiddleware(
  tokens: number,
  model: ReturnType<typeof createModelAdapter>,
) {
  return summarizationMiddleware({
    model,
    trigger: {
      tokens,
      messages: 20,
    },
    keep: {
      messages: 10,
    },
  });
}

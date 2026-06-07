import { AgentMode } from "./enums";
import { planSchema } from "./schemas";
import { ChatAIMessage, Plan } from "./types";

export function extractPlanOutline(message: ChatAIMessage): Plan | null {
  if (message.mode !== AgentMode.Plan) {
    return null;
  }
  for (let i = message.content.length - 1; i >= 0; i--) {
    const item = message.content[i];
    if (item.type !== "tool") {
      continue;
    }
    const { success, data } = planSchema.safeParse(JSON.parse(item.result));
    if (success) {
      return data;
    }
  }
  return null;
}

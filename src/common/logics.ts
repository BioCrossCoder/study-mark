import { AgentCommand } from "./enums";
import { planSchema } from "./schemas";
import { ChatAIMessage, isChatToolCallingOutputMessage, Plan } from "./types";

export function extractPlanOutline(message: ChatAIMessage): Plan | null {
  if (message.mode !== AgentCommand.Plan) {
    return null;
  }
  for (let i = message.content.length - 1; i >= 0; i--) {
    const item = message.content[i];
    if (item.type !== "tool" || !isChatToolCallingOutputMessage(item)) {
      continue;
    }
    try {
      const entry = JSON.parse(item.result);
      const { success, data } = planSchema.safeParse(entry);
      if (success) {
        return data;
      }
    } catch {}
  }
  return null;
}

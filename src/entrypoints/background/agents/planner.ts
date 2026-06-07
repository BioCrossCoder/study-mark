import { ChatAIMessage, ModelConfig, PromiseResultType } from "@/common/types";
import { execAgentLoop } from "../infra/agentLoop";
import { modelConfigData } from "@/services/storage/modelConfig";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent, HumanMessage, toolStrategy } from "langchain";
import {
  getLastHistoryMessage,
  updateHistory,
} from "@/services/storage/chatHistory";
import { planSchema } from "@/common/schemas";
import { createWebSearchTool } from "../tools/webSearch";
import { AgentMode } from "@/common/enums";
import { systemPrompt } from "../prompts/planner";
import { loadLibraryTool } from "../tools/loadLibrary";
import { extractPlanOutline } from "@/common/logics";
import { createAbortController } from "../infra/abortController";

const abortController = createAbortController();
let agent: PromiseResultType<ReturnType<typeof createPlannerAgent>>;
export const plannerAgent = {
  init,
  run,
  stop: abortController.stop,
};

async function init() {
  abortController.init();
  if (agent) {
    return;
  }
  const config = await modelConfigData.getValue();
  agent = await createPlannerAgent(config);
}

async function run(content: string) {
  let finish = false;
  for (let i = 0; i < 3; i++) {
    if (finish) {
      break;
    }
    try {
      await execAgentLoop(
        agent,
        [new HumanMessage(content)],
        abortController,
        (message) => updateHistory(message, AgentMode.Plan),
      );
    } catch {
    } finally {
      finish =
        abortController.end() ||
        extractPlanOutline((await getLastHistoryMessage()) as ChatAIMessage) !==
          null;
    }
  }
}

async function createPlannerAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  const webSearchTool = await createWebSearchTool();
  return createAgent({
    model,
    systemPrompt,
    tools: [loadLibraryTool, webSearchTool],
    responseFormat: toolStrategy(planSchema),
  });
}

import {
  ChatAIMessage,
  ChatHumanMessage,
  ModelConfig,
  PromiseResultType,
} from "@/common/types";
import { createAbortController, execAgentLoop } from "../infra/agentLoop";
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

const abortController = createAbortController();
let agent: PromiseResultType<ReturnType<typeof createPlannerAgent>>;
export const plannerAgent = {
  run,
  stop: abortController.stop,
};

async function init() {
  if (agent) {
    return;
  }
  const config = await modelConfigData.getValue();
  agent = await createPlannerAgent(config);
}

async function run(content: string) {
  await updateHistory(
    { type: "human", content } as ChatHumanMessage,
    AgentMode.Plan,
  );
  await init();
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
      const plan = extractPlanOutline(
        (await getLastHistoryMessage()) as ChatAIMessage,
      );
      if (!plan) {
        abortController.init();
      }
      finish = abortController.end();
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

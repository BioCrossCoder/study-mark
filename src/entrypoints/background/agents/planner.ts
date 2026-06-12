import { ChatAIMessage, ModelConfig } from "@/common/types";
import { execAgentLoop } from "../infra/agentLoop";
import { modelConfigData } from "@/services/storage/modelConfig";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent, HumanMessage, toolStrategy } from "langchain";
import {
  getLastHistoryMessage,
  updateHistory,
} from "@/services/storage/chatHistory";
import { planSchema } from "@/common/schemas";
import { webSearchTool } from "../tools/webSearch";
import { AgentMode } from "@/common/enums";
import { systemPrompt } from "../prompts/planner";
import { loadLibraryTool } from "../tools/loadLibrary";
import { extractPlanOutline } from "@/common/logics";
import { createAbortController } from "../infra/abortController";

const abortController = createAbortController();
export const plannerAgent = {
  run,
  stop: abortController.stop,
};

async function run(content: string) {
  let finish = false;
  const config = await modelConfigData.getValue();
  const agent = await createPlannerAgent(config);
  abortController.init();
  let err: Error | null = null;
  for (let i = 0; i < 3; i++) {
    if (finish) {
      break;
    }
    try {
      err = null;
      await execAgentLoop(
        agent,
        [new HumanMessage(content)],
        abortController,
        (message) => updateHistory(message, AgentMode.Plan),
      );
    } catch (e) {
      err = e as Error;
    } finally {
      finish =
        abortController.end() ||
        extractPlanOutline((await getLastHistoryMessage()) as ChatAIMessage) !==
          null;
    }
  }
  plannerAgent.stop();
  return err;
}

async function createPlannerAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  return createAgent({
    model,
    systemPrompt,
    tools: [loadLibraryTool, await webSearchTool.load()],
    responseFormat: toolStrategy(planSchema),
  });
}

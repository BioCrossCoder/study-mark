import { ModelConfig } from "@/common/types";
import { createAbortController, execAgentLoop } from "../infra/agentLoop";
import { modelConfigData } from "@/services/storage/modelConfig";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent, HumanMessage, toolStrategy } from "langchain";
import { appendHistory } from "@/services/storage/chatHistory";
import { planSchema } from "@/common/schemas";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";

const abortController = createAbortController();
export const plannerAgent = {
  run,
  stop: abortController.stop,
};

async function run(content: HumanMessage) {
  await appendHistory(content);
  let count = 0;
  let finish = false;
  const config = await modelConfigData.getValue();
  const agent = await createPlannerAgent(config);
  while (count < 3 && !finish) {
    try {
      await execAgentLoop(agent, [content], abortController, appendHistory);
    } catch {
    } finally {
      finish = abortController.end();
    }
  }
}

const corePrompt = `
  You are a learning planner,
  focusing on help learners make self-study plan
  by creating Targets and Tasks for them.
  Targets are the goal of finishing Tasks.
`;

async function createPlannerAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  const webSearchTool = await createWebSearchTool();
  const systemPrompt = [corePrompt, webSearchToolPrompt].join("\n");
  return createAgent({
    model,
    systemPrompt,
    tools: [webSearchTool],
    responseFormat: toolStrategy(planSchema),
  });
}

import {
  ChatHumanMessage,
  ModelConfig,
  PromiseResultType,
} from "@/common/types";
import { createAbortController, execAgentLoop } from "../infra/agentLoop";
import { modelConfigData } from "@/services/storage/modelConfig";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent, HumanMessage, toolStrategy } from "langchain";
import { updateHistory } from "@/services/storage/chatHistory";
import { planSchema } from "@/common/schemas";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";

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
  await updateHistory({ type: "human", content } as ChatHumanMessage);
  await init();
  let count = 0;
  let finish = false;
  while (count < 3 && !finish) {
    try {
      await execAgentLoop(
        agent,
        [new HumanMessage(content)],
        abortController,
        updateHistory,
      );
    } catch {
    } finally {
      finish = abortController.end();
    }
  }
}

const corePrompt = `
  You are a learning planner,
  making a study plan according to the user demand.
  Always search the web at least once before decision.
  Always output a response at the end in format ${JSON.stringify(planSchema.toJSONSchema())}.
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

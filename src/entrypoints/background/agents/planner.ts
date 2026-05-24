import { ModelConfig, planSchema } from "@/common/types";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";
import { createModelAdapter } from "../infra/modelAdapter";
import {
  AIMessage,
  createAgent,
  DynamicStructuredTool,
  HumanMessage,
  toolStrategy,
} from "langchain";
import {
  loadResourcesTool,
  loadResourcesToolPrompt,
} from "../tools/loadResources";
import { modelConfig } from "@/stores/config";
import { ok, Result } from "neverthrow";
import { MessageType, Signal } from "@/common/enums";
import { execAgentLoop, useAbortController } from "../infra/agentLoop";

const abortController = useAbortController();
export const plannerAgent = {
  run,
  stop: abortController.stop,
};

async function run(port: globalThis.Browser.runtime.Port, content: string) {
  let count = 0;
  let finish = false;
  const agent = createPlannerAgent(await modelConfig.getValue());
  let result: Result<AIMessage | Signal.Stop, Error> = ok(Signal.Stop);
  while (count < 3 && !finish) {
    result = await execAgentLoop(
      agent,
      [new HumanMessage(content)],
      abortController,
      (message) => {
        if (message.type === MessageType.Text) {
          finish = true;
          port.postMessage({
            type: MessageType.Plan,
            content: message.content.replace(
              "Returning structured response: ",
              "",
            ),
          });
        } else {
          port.postMessage(message);
        }
      },
    );
    if (result.isOk() && result.value === Signal.Stop) {
      finish = true;
    }
    count++;
  }
  if (result!.isErr()) {
    return {
      type: MessageType.Error,
      content: result.error.message,
    };
  }
  return finish
    ? {
        type: MessageType.Signal,
        content: Signal.Finish,
      }
    : {
        type: MessageType.Error,
        content: "Generate Plan Failed",
      };
}

const corePrompt = `
  You are a learning planner,
  focusing on help learners make self-study plan
  by creating Targets and Tasks for them.
  Targets are the goal of finishing Tasks.
`;

function buildSystemPrompt(searchApiKey: string) {
  const prompts = [corePrompt, loadResourcesToolPrompt];
  if (searchApiKey) {
    prompts.push(webSearchToolPrompt);
  }
  return prompts.join("\n");
}

function createPlannerAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  const tools: DynamicStructuredTool[] = [loadResourcesTool];
  const { tavilyApiKey } = config;
  if (tavilyApiKey) {
    tools.push(createWebSearchTool(tavilyApiKey));
  }
  const systemPrompt = buildSystemPrompt(tavilyApiKey);
  return createAgent({
    model,
    tools,
    systemPrompt,
    responseFormat: toolStrategy(planSchema),
  });
}

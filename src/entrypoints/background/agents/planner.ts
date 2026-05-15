import {
  ErrorMessage,
  ModelConfig,
  planSchema,
  SignalMessage,
  TextMessage,
} from "@/common/types";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";
import { createModelAdapter } from "../infra/modelAdapter";
import {
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
import { ResultAsync } from "neverthrow";
import { send } from "@/common/utils";
import { MessageType, Signal } from "@/common/enums";

let abortController: AbortController | null = null;
export const plannerAgent = {
  outputPlan,
  abortPlan,
};

async function outputPlan(
  port: globalThis.Browser.runtime.Port,
  content: string,
) {
  const agent = await createPlannerAgent(await modelConfig.getValue());
  // [CallAgentWithUserInput]
  const result = await ResultAsync.fromThrowable((messages) =>
    agent.stream({ messages }, { streamMode: "messages" }),
  )([new HumanMessage(content)]);
  if (result.isErr()) {
    send<ErrorMessage>(port, {
      type: MessageType.Error,
      content: (result.error as Error).message,
    });
    return;
  }
  const stream = result.unwrapOr(null)!; // [/]
  // [TransmitStreamOutput]
  abortController = new AbortController();
  for await (const [chunk] of stream) {
    if (abortController.signal.aborted) {
      await stream.cancel();
      break;
    }
    if (chunk.type !== "ai") {
      continue;
    }
    const reasoning = chunk.additional_kwargs.reasoning_content;
    const text = chunk.content;
    if (reasoning) {
      send<TextMessage>(port, {
        type: MessageType.Infer,
        content:
          typeof reasoning === "string" ? reasoning : JSON.stringify(reasoning),
      });
    } else if (text) {
      send<TextMessage>(port, {
        type: MessageType.Plan,
        content:
          typeof text === "string"
            ? text.replace("Returning structured response: ", "")
            : JSON.stringify(text),
      });
    }
  } // [/]
  abortController = null;
  send<SignalMessage>(port, {
    type: MessageType.Signal,
    content: Signal.Finish,
  });
}

function abortPlan() {
  if (!abortController) {
    return;
  }
  abortController.abort();
  abortController = null;
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

async function createPlannerAgent(config: ModelConfig) {
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

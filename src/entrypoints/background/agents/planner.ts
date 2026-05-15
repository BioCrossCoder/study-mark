import {
  ErrorMessage,
  ModelConfig,
  PlanMessage,
  SignalMessage,
} from "@/common/types";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";
import { createModelAdapter } from "../infra/modelAdapter";
import {
  AIMessageChunk,
  createAgent,
  DynamicStructuredTool,
  DynamicTool,
  HumanMessage,
} from "langchain";
import z from "zod";
import {
  loadResourcesTool,
  loadResourcesToolPrompt,
} from "../tools/loadResources";
import { modelConfig } from "@/stores/config";
import { ResultAsync } from "neverthrow";
import { send } from "@/common/utils";
import { MessageType, Signal } from "@/common/enums";
import { chatContext } from "../stores/chat";

export const plannerAgent = {
  outputPlan,
};

async function outputPlan(
  port: globalThis.Browser.runtime.Port,
  data: PlanMessage,
) {
  const agent = await createPlannerAgent(await modelConfig.getValue());
  // [CallAgentWithUserInput]
  const result = await ResultAsync.fromThrowable((messages) =>
    agent.stream({ messages }, { streamMode: "messages" }),
  )([new HumanMessage(data.content)]);
  if (result.isErr()) {
    send<ErrorMessage>(port, {
      type: MessageType.Error,
      content: (result.error as Error).message,
    });
    return;
  }
  const stream = result.unwrapOr(null)!; // [/]
  // [TransmitStreamOutputAndRecordMessage]
  const responseChunks = new Array<AIMessageChunk>();
  for await (const [chunk] of stream) {
    if (chunk.type !== "ai") {
      continue;
    }
    responseChunks.push(chunk as AIMessageChunk);
    const text =
      typeof chunk.content === "string"
        ? chunk.content
        : JSON.stringify(chunk.content);
    send<PlanMessage>(port, {
      type: MessageType.Plan,
      content: text,
    });
  } // [/]
  // [FinishMessageSendingAndUpdateHistory]
  send<SignalMessage>(port, {
    type: MessageType.Signal,
    content: Signal.Finish,
  });
  if (responseChunks.length === 0) {
    return;
  }
  const messages = await chatContext.getValue();
  messages.push(
    responseChunks.reduce((c1, c2) => c1.concat(c2), new AIMessageChunk("")),
  );
  chatContext.setValue(messages); // [/]
}

const corePrompt = `
  You are a learning planner,
  focusing on help learners make self-study plan
  by creating Targets and Tasks for them.
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
  const tools: (DynamicStructuredTool | DynamicTool)[] = [loadResourcesTool];
  const { tavilyApiKey } = config;
  if (tavilyApiKey) {
    tools.push(createWebSearchTool(tavilyApiKey));
  }
  const systemPrompt = buildSystemPrompt(tavilyApiKey);
  return createAgent({
    model,
    tools,
    systemPrompt,
    responseFormat: z.object({
      target: z.object({
        title: z.string().min(1),
        description: z.string(),
      }),
      tasks: z
        .array(
          z.object({
            title: z.string().min(1),
            description: z.string(),
            source: z.url(),
          }),
        )
        .min(1),
    }),
  });
}

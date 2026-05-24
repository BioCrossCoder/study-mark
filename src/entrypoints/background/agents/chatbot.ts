import { modelConfig } from "@/stores/config";
import { chatContext } from "../stores/chat";
import { ModelConfig } from "@/common/types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MessageType, Signal } from "@/common/enums";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent } from "langchain";
import { createTrimMessagesMiddleware } from "../middlewares/trimMessages";
import { createSumMessagesMiddleware } from "../middlewares/sumMessages";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";
import { execAgentLoop, useAbortController } from "../infra/agentLoop";

const abortController = useAbortController();
export const chatbotAgent = {
  run,
  stop: abortController.stop,
  clearHistory,
};

async function run(port: globalThis.Browser.runtime.Port, content: string) {
  const agent = createChatbotAgent(await modelConfig.getValue());
  const { read, write, flush } = useHistory();
  await write(new HumanMessage(content));
  const result = await execAgentLoop(
    agent,
    await read(),
    abortController,
    (message) => {
      port.postMessage(message);
    },
  );
  if (result.isErr()) {
    return {
      type: MessageType.Error,
      content: result.error.message,
    };
  }
  if (result.value !== Signal.Stop) {
    write(result.value).then(flush);
  }
  return {
    type: MessageType.Signal,
    content: Signal.Finish,
  };
}

function useHistory() {
  let cache: (HumanMessage | AIMessage)[] | undefined;
  async function lazyLoad() {
    if (!cache) {
      cache = await chatContext.getValue();
    }
  }
  async function read() {
    await lazyLoad();
    return cache!;
  }
  async function write(message: HumanMessage | AIMessage) {
    await lazyLoad();
    cache!.push(message);
  }
  async function flush() {
    if (!cache) {
      return;
    }
    return await chatContext.setValue(cache);
  }
  return {
    read,
    write,
    flush,
  };
}

const corePrompt = `
  You are an assistant for study guidance,
  focusing on providing useful information and advice
  for learners to plan their self-study.
`;

function buildSystemPrompt(searchApiKey: string) {
  const prompts = [corePrompt];
  if (searchApiKey) {
    prompts.push(webSearchToolPrompt);
  }
  return prompts.join("\n");
}

function createChatbotAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  const sumMessages = createSumMessagesMiddleware(model);
  const trimMessages = createTrimMessagesMiddleware(model);
  const { tavilyApiKey } = config;
  const tools = tavilyApiKey ? [createWebSearchTool(tavilyApiKey)] : undefined;
  const systemPrompt = buildSystemPrompt(tavilyApiKey);
  return createAgent({
    model,
    middleware: [sumMessages, trimMessages],
    tools,
    systemPrompt,
  });
}

function clearHistory() {
  chatContext.setValue([]);
}

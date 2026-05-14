import { ModelConfig } from "@/common/types";
import { createWebSearchTool, webSearchToolPrompt } from "../tools/webSearch";
import { createModelAdapter } from "../infra/modelAdapter";
import { createAgent, DynamicStructuredTool, DynamicTool } from "langchain";
import {
  searchFavoritesTool,
  searchFavoritesToolPrompt,
} from "../tools/searchFavorites";
import z from "zod";
import {
  loadResourcesTool,
  loadResourcesToolPrompt,
} from "../tools/loadResources";

const corePrompt = `
  You are a learning planner,
  focusing on help learners make self-study plan
  by creating Targets and Tasks for them.
`;

function buildSystemPrompt(searchApiKey: string) {
  const prompts = [
    corePrompt,
    searchFavoritesToolPrompt,
    loadResourcesToolPrompt,
  ];
  if (searchApiKey) {
    prompts.push(webSearchToolPrompt);
  }
  return prompts.join("\n");
}

async function createPlannerAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  const tools: (DynamicStructuredTool | DynamicTool)[] = [
    searchFavoritesTool,
    loadResourcesTool,
  ];
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

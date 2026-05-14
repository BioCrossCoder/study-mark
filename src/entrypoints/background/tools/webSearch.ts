import { ToolName } from "@/common/enums";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { tool } from "langchain";
import { ResultAsync } from "neverthrow";
import z from "zod";

export function createWebSearchTool(apiKey: string) {
  return tool(
    async ({ query, includeDomains }) => {
      const retriever = new TavilySearchAPIRetriever({
        apiKey,
        includeDomains,
      });
      const result = await ResultAsync.fromThrowable(() =>
        retriever.invoke(query),
      )();
      return result.isErr() ? "Query Failed" : JSON.stringify(result.value);
    },
    {
      name: ToolName.WebSearch,
      description:
        "Search the web for current information. Use this when you need up-to-date information or facts.",
      schema: z.object({
        query: z.string().describe("The search query to look up on the web"),
        includeDomains: z
          .array(z.url())
          .min(1)
          .optional()
          .describe("preferred reference search resource url list"),
      }),
    },
  );
}

export const webSearchToolPrompt = `
  You can use the ${ToolName.WebSearch} tool to supplement necessary information.
  Only use it when you need latest information, specific facts or real-time data.
  For each user question, the ${ToolName.WebSearch} tool can only be called once.
`;

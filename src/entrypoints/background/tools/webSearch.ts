import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { tool } from "langchain";
import { ResultAsync } from "neverthrow";
import z from "zod";

export function createWebSearchTool(apiKey: string) {
  return tool(
    async ({ query }) => {
      const retriever = new TavilySearchAPIRetriever({
        apiKey,
      });
      const result = await ResultAsync.fromThrowable(() =>
        retriever.invoke(query),
      )();
      return result.isErr() ? "Query Failed" : JSON.stringify(result.value);
    },
    {
      name: "web_search",
      description:
        "Search the web for current information. Use this when you need up-to-date information or facts.",
      schema: z.object({
        query: z.string().describe("The search query to look up on the web"),
      }),
    },
  );
}

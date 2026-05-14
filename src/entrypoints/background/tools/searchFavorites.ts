import { ToolName } from "@/common/enums";
import { tool } from "langchain";
import z from "zod";

export const searchFavoritesTool = tool(
  async ({ keyword }) => {
    return await browser.bookmarks.search(keyword);
  },
  {
    name: ToolName.SearchFavorites,
    description: "Search the browser favorites with keyword.",
    schema: z.object({
      keyword: z.string().describe("The search keyword to match in favorites"),
    }),
  },
);

export const searchFavoritesToolPrompt = `
  You can use the ${ToolName.SearchFavorites} tool to search favorites with a keyword.
  Use it first to check if there are some bookmarks can be used as source of Tasks.
  For each keyword, the ${ToolName.SearchFavorites} tool can only be called once.
`;

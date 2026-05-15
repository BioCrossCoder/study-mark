import { ObjectType, ToolName } from "@/common/enums";
import { taskData } from "@/stores/tasks";
import { tool } from "langchain";
import z from "zod";

export const loadResourcesTool = tool(
  async () => {
    const data = await taskData.getValue();
    return JSON.stringify(
      Object.values(data)
        .filter((item) => item.type === ObjectType.Resource)
        .map((item) => {
          const { title, description, source } = item;
          return { title, source, description };
        }),
    );
  },
  {
    name: ToolName.LoadResources,
    description:
      "Load predefined learning Resources. Use this for making self-study plans.",
    schema: z.object({}).strict(),
  },
);

export const loadResourcesToolPrompt = `
  Always use the ${ToolName.LoadResources} tool first to load Resources before planning.
  Resources are actually remote repository of learning resources.
  Then check their description to choose Resources, only exclude Resources that are clearly not relevant.
  Finally extract source of chosen Resources to an array, and passing as includeDomains to ${ToolName.WebSearch} tool.
  Tasks should have proper size, consider complete tutorials instead of their single chapter first.
  Make an extra calling of ${ToolName.WebSearch} without includeDomains only if you cannot find enough Task sources through chosen Resources. If the Task count is not less than user's explicit demand, it is considered enough.
`;

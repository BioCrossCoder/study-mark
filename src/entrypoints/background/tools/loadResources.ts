import { PlanType, ToolName } from "@/common/enums";
import { taskData } from "@/stores/tasks";
import { tool } from "langchain";

export const loadResourcesTool = tool(
  async () => {
    const data = await taskData.getValue();
    return Object.values(data).filter(
      (item) => item.type === PlanType.Resource,
    );
  },
  {
    name: ToolName.LoadResources,
    description: "Load Resources",
  },
);

export const loadResourcesToolPrompt = `
  You can use the ${ToolName.LoadResources} tool to load Resources.
  Resources are websites that providing many webpages that can be source of Tasks.
  Check description of a Resource to decide if choose it.
  Extract source of chosen Resources to a string array,
  which can be the includeDomains param of the ${ToolName.WebSearch} tool
`;

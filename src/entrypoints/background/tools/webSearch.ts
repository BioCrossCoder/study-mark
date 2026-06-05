import { WebMCPBridge } from "mcp-web-bridge";
import { tool } from "langchain";
import { convertJsonSchemaToZod } from "zod-from-json-schema";
import { ToolName } from "@/common/enums";

export async function createWebSearchTool() {
  const bridge = new WebMCPBridge("https://mcp.exa.ai/mcp");
  const { tools } = await bridge.connect();
  const item = tools.find(({ name }) => name === ToolName.WebSearch)!;
  const { name, description, inputSchema } = item;
  return tool(
    async (params) => {
      const result = await bridge.callTool(name, params);
      return JSON.stringify(result);
    },
    {
      name,
      description,
      schema: convertJsonSchemaToZod(inputSchema),
    },
  );
}

export const webSearchToolPrompt = `
  You can use the ${ToolName.WebSearch} tool to supplement necessary information.
  Only use it when you need latest information, specific facts or real-time data.
  For each user question, the ${ToolName.WebSearch} tool can only be called once.
`;

import { WebMCPBridge } from "mcp-web-bridge";
import { tool } from "langchain";
import { ToolName } from "@/common/enums";
import z from "zod";
import { sleep } from "@/common/utils";

let inst: Awaited<ReturnType<typeof createWebSearchTool>> | null = null;
let lastVisit = 0;
export const webSearchTool = {
  async load() {
    inst ??= await createWebSearchTool();
    return inst;
  },
};

async function createWebSearchTool() {
  const bridge = new WebMCPBridge("https://mcp.exa.ai/mcp");
  const { tools } = await bridge.connect();
  const item = tools.find(({ name }) => name === ToolName.WebSearch)!;
  const { name, description, inputSchema } = item;
  return tool(
    async (params) => {
      while (Date.now() - lastVisit <= 1000) {
        await sleep(500);
      }
      const result = await bridge.callTool(name, params);
      lastVisit = Date.now();
      return JSON.stringify(result);
    },
    {
      name,
      description,
      schema: z.fromJSONSchema(inputSchema),
    },
  );
}

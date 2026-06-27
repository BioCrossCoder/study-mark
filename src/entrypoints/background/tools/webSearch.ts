import { WebMCPBridge } from "mcp-web-bridge";
import { tool } from "langchain";
import { ToolName } from "@/common/enums";
import z from "zod";
import { sleep } from "@/common/utils";
import { Mutex } from "async-mutex";

let inst: Awaited<ReturnType<typeof createWebSearchTool>> | null = null;
const instMutex = new Mutex();
export const webSearchTool = {
  async load() {
    const release = await instMutex.acquire();
    inst ??= await createWebSearchTool();
    release();
    return inst;
  },
};

let lastVisit = 0;
const visitMutex = new Mutex();

async function createWebSearchTool() {
  const bridge = new WebMCPBridge("https://mcp.exa.ai/mcp");
  const { tools } = await bridge.connect();
  const item = tools.find(({ name }) => name === ToolName.WebSearch)!;
  const { name, description, inputSchema } = item;
  return tool(
    async (params) => {
      const release = await visitMutex.acquire();
      const gap = Date.now() - lastVisit;
      if (gap <= 1000) {
        await sleep(1001 - gap);
      }
      const result = await bridge.callTool(name, params);
      lastVisit = Date.now();
      release();
      return JSON.stringify(result);
    },
    {
      name,
      description,
      schema: z.fromJSONSchema(inputSchema),
    },
  );
}

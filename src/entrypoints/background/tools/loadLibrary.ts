import { ToolName } from "@/common/enums";
import { libraryData } from "@/services/storage/library";
import { tool } from "langchain";
import z from "zod";

export const loadLibraryTool = tool(
  async () => {
    const data = await libraryData.getValue();
    return JSON.stringify(
      Object.values(data).map((item) => {
        const { name, source, description } = item;
        return { name, source, description };
      }),
    );
  },
  {
    name: ToolName.LoadLibrary,
    description:
      "Load predefined Libraries as reference for making Study Plans.",
    schema: z.object({}).strict(),
  },
);

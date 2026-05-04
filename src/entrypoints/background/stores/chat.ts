import { AIMessage, HumanMessage } from "@langchain/core/messages";

export const chatContext = storage.defineItem<(HumanMessage | AIMessage)[]>(
  "session:chatContext",
  {
    fallback: [],
  },
);

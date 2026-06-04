import { StoreKey } from "@/common/enums";
import { AIMessage, HumanMessage } from "langchain";

export const chatHistoryData = storage.defineItem<(HumanMessage | AIMessage)[]>(
  StoreKey.ChatHistory,
  {
    fallback: [],
  },
);

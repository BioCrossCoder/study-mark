import { StoreKey } from "@/common/enums";
import { AIMessage, HumanMessage } from "langchain";

export const chatHistoryData = storage.defineItem<(HumanMessage | AIMessage)[]>(
  StoreKey.ChatHistory,
  {
    fallback: [],
  },
);

export async function appendHistory(message: HumanMessage | AIMessage) {
  const history = await chatHistoryData.getValue();
  history.push(message);
  return await chatHistoryData.setValue(history);
}

export async function clearHistory() {
  return await chatHistoryData.setValue([]);
}

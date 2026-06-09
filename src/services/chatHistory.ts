import { useWxtStore } from "@/hooks/useWxtStore";
import { chatHistoryData } from "./storage/chatHistory";

export function useChatHistoryData() {
  return useWxtStore(chatHistoryData);
}

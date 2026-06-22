import { useWxtStore } from "@/hooks/common/useWxtStore";
import { chatHistoryData } from "./storage/chatHistory";

export function useChatHistoryData() {
  return useWxtStore(chatHistoryData);
}

import { useWxtStore } from "@/hooks/useWxtStore";
import { chatLoadingData } from "./storage/chatLoading";

export function useChatLoadingData() {
  return useWxtStore(chatLoadingData);
}

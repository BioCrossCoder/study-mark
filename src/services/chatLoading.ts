import { useWxtStore } from "@/hooks/common/useWxtStore";
import { chatLoadingData } from "./storage/chatLoading";

export function useChatLoadingData() {
  return useWxtStore(chatLoadingData);
}

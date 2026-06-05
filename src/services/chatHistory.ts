import { StoreKey } from "@/common/enums";
import { useQuery } from "@tanstack/react-query";
import { chatHistoryData } from "./storage/chatHistory";

export function useChatHistoryQuery() {
  const query = useQuery({
    queryKey: [StoreKey.ChatHistory],
    queryFn: chatHistoryData.getValue,
  });
  useEffect(() => {
    return chatHistoryData.watch(() => {
      query.refetch();
    });
  });
  return query;
}

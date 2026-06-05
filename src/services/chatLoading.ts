import { StoreKey } from "@/common/enums";
import { useQuery } from "@tanstack/react-query";
import { chatLoadingData } from "./storage/chatLoading";

export function useChatLoadingQuery() {
  const query = useQuery({
    queryKey: [StoreKey.ChatLoading],
    queryFn: chatLoadingData.getValue,
  });
  useEffect(() => {
    return chatLoadingData.watch(() => {
      query.refetch();
    });
  });
  return query;
}

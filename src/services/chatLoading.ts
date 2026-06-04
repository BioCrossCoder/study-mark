import { StoreKey } from "@/common/enums";
import { useMutation, useQuery } from "@tanstack/react-query";
import { chatLoadingData } from "./storage/chatLoading";

export function useChatLoadingQuery() {
  return useQuery({
    queryKey: [StoreKey.ChatLoading],
    queryFn: chatLoadingData.getValue,
  });
}

export function useChatLoadingMutation() {
  const { refetch } = useChatLoadingQuery();
  return useMutation({
    mutationFn: chatLoadingData.setValue,
    onSuccess() {
      refetch();
    },
  });
}

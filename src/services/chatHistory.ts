import { StoreKey } from "@/common/enums";
import { useMutation, useQuery } from "@tanstack/react-query";
import { chatHistoryData } from "./storage/chatHistory";
import { AIMessage, HumanMessage } from "langchain";

export function useChatHistoryQuery() {
  return useQuery({
    queryKey: [StoreKey.ChatHistory],
    queryFn: chatHistoryData.getValue,
  });
}

export function useChatHistoryMutation() {
  const { refetch } = useChatHistoryQuery();
  return useMutation({
    mutationFn: chatHistoryData.setValue,
    onSuccess() {
      refetch();
    },
  });
}

export function useAppendChatHistory() {
  const { mutate } = useChatHistoryMutation();
  return async (message: HumanMessage | AIMessage) => {
    const data = await chatHistoryData.getValue();
    data.push(message);
    mutate(data);
  };
}

export function useClearChatHistory() {
  const { mutate } = useChatHistoryMutation();
  return async () => {
    mutate([]);
  };
}

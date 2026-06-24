import { AgentCommand, StoreKey } from "@/common/enums";
import {
  ChatAIMessageItem,
  ChatHistoryMessage,
  ChatHumanMessage,
  ChatToolCallingMessage,
} from "@/common/types";

export const chatHistoryData = storage.defineItem<ChatHistoryMessage[]>(
  StoreKey.ChatHistory,
  {
    fallback: [],
  },
);

export async function updateHistory(
  message: ChatHumanMessage | ChatAIMessageItem,
  mode: AgentCommand,
) {
  const history = await chatHistoryData.getValue();
  const lastMessage = history.at(-1);
  if (lastMessage?.type === "ai") {
    if (message.type === "human") {
      history.push(message);
    } else {
      const lastItem = lastMessage.content.at(-1);
      if (lastItem?.type === message.type) {
        if (lastItem.type !== "text") {
          lastItem.loading = (message as any).loading;
        }
        if (lastItem.type !== "tool") {
          lastItem.content += (message as any).content;
        } else {
          const toolMsg = message as ChatToolCallingMessage;
          lastItem.name = (lastItem.name || toolMsg.name) ?? "";
          lastItem.params += toolMsg.params;
          if (toolMsg.fullResult) {
            lastItem.result = toolMsg.result;
          } else {
            lastItem.result += toolMsg.result;
          }
          if (lastItem.result && !toolMsg.result) {
            lastMessage.content.push({ type: "text", content: "" });
          }
        }
      } else {
        if (lastItem?.type !== "text") {
          lastItem!.loading = false;
        }
        lastMessage.content.push(message);
      }
    }
  } else {
    history.push(
      message.type === "human"
        ? message
        : { type: "ai", content: [message], mode },
    );
  }
  return await chatHistoryData.setValue(history);
}

export async function clearHistory() {
  return await chatHistoryData.setValue([]);
}

export async function getLastHistoryMessage() {
  return (await chatHistoryData.getValue()).at(-1);
}

export async function stopLoadingInHistory() {
  const data = await chatHistoryData.getValue();
  const record = data.findLast((item) => item.type === "ai");
  if (!record) {
    return;
  }
  record.content.forEach((item) => {
    if (item.type !== "text") {
      item.loading = false;
    }
  });
  return await chatHistoryData.setValue(data);
}

export async function getLastHumanMessageInHistory() {
  const data = await chatHistoryData.getValue();
  return data.findLast((item) => item.type === "human");
}

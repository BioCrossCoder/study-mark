import { ChatMessage } from "@/common/types";
import { defineVibe } from "vue-vine";

export const [useChatStore, initChatStore] = defineVibe("chat", () => {
  const history = ref(new Array<ChatMessage>());
  return {
    history,
  };
});

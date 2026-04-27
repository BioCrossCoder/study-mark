import { ChatMessage } from "@/common/types";
import { defineVibe } from "vue-vine";

export const [useChatStore, initChatStore] = defineVibe("chat", () => {
  const history = ref(new Array<ChatMessage>());
  const isHistoryEmpty = computed(() => history.value.length === 0);
  const loading = ref(false);
  return {
    history,
    isHistoryEmpty,
    loading,
  };
});

import { useConnectionStore } from "../stores/connection";
import { Button, IconField, InputIcon, InputText, ScrollPanel } from "primevue";
import ChatBubble from "./ChatBubble.vine";
import { ChatMessageSender } from "@/common/enums";
import { useChatStore } from "../stores/chat";
import { MessagesSquare } from "@lucide/vue";
import {
  signalMessageSchema,
  TextMessage,
  textMessageSchema,
} from "@/common/types";

export default function ChatWindow() {
  const question = ref("");
  const isQuestionEmpty = computed(() => question.value.length === 0);
  const connection = useConnectionStore();
  const { history } = useChatStore();
  const isContextEmpty = computed(() => history.value.length === 0);
  const bottomAnchor = ref<HTMLDivElement>();
  function scrollToBottom(behavior: ScrollBehavior) {
    bottomAnchor.value?.scrollIntoView({
      behavior,
      block: "end",
    });
  }
  const loading = ref(false);
  connection.listen((message) => {
    // [HandleSignal]
    const signalMessage = signalMessageSchema.safeParse(message);
    if (signalMessage.success && signalMessage.data.content === "finish") {
      loading.value = false;
      return;
    } // [/]
    // [HandleText]
    const textMessage = textMessageSchema.safeParse(message);
    if (textMessage.success) {
      const lastMessage = history.value.at(-1);
      if (lastMessage?.sender === ChatMessageSender.Robot) {
        lastMessage.message = textMessage.data.content;
      } else {
        history.value.push({
          sender: ChatMessageSender.Robot,
          message: textMessage.data.content,
          timestamp: new Date(),
        });
      }
      scrollToBottom("smooth");
      return;
    } // [/]
  });
  const buttonIcon = computed(() =>
    loading.value ? "pi pi-spinner pi-spin" : "pi pi-send",
  );
  const isSubmitDisabled = computed(
    () => isQuestionEmpty.value || loading.value,
  );
  function handleSubmit() {
    if (isSubmitDisabled.value) {
      return;
    }
    loading.value = true;
    history.value.push({
      sender: ChatMessageSender.User,
      message: question.value,
      timestamp: new Date(),
    });
    connection.send<TextMessage>({
      type: "text",
      content: question.value,
    });
    question.value = "";
    scrollToBottom("instant");
  }
  const messagePosition = {
    [ChatMessageSender.Robot]: "justify-self-end",
    [ChatMessageSender.User]: "justify-self-start",
  };
  // TODO quote selection
  return vine`
    <div class="flex-1 flex flex-col overflow-hidden">
      <div v-if="isContextEmpty" class="h-full flex justify-center items-center">
        <MessagesSquare class="w-[50vw] h-[50vw]" stroke-width="1.2"/>
      </div>
      <ScrollPanel v-else style="width: 100%; height:100%;" class="overflow-hidden">
        <ChatBubble
          v-for="{sender,message,timestamp} in history"
          :class="'w-3/4'+' '+messagePosition[sender]"
          :sender="sender" :message="message" :timestamp="timestamp"
        />
        <div ref="bottomAnchor"/>
      </ScrollPanel>
      <div class="w-full flex my-2">
        <InputText type="text" v-model="question" class="w-full ml-2" @keydown.enter="handleSubmit"/>
        <Button :icon="buttonIcon" class="flex-none mr-2" @click="handleSubmit" :disabled="isSubmitDisabled"/>
      </div>
    </div>
  `;
}

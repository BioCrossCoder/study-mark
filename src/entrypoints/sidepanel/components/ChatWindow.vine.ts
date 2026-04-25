import { useConnectionStore } from "../stores/connection";
import { Button, IconField, InputIcon, InputText, ScrollPanel } from "primevue";
import ChatBubble from "./ChatBubble.vine";
import { ChatMessageSender } from "@/common/enums";
import { useChatStore } from "../stores/chat";
import { MessagesSquare } from "@lucide/vue";

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
  connection.listen((message) => {
    const lastMessage = history.value.at(-1);
    if (lastMessage?.sender === ChatMessageSender.Robot) {
      lastMessage.message = message;
    } else {
      history.value.push({
        sender: ChatMessageSender.Robot,
        message,
        timestamp: new Date(),
      });
    }
    scrollToBottom("smooth");
  });
  function handleSubmit() {
    if (isQuestionEmpty.value) {
      return;
    }
    history.value.push({
      sender: ChatMessageSender.User,
      message: question.value,
      timestamp: new Date(),
    });
    connection.port.postMessage(question.value);
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
        <Button icon="pi pi-send" class="flex-none mr-2" @click="handleSubmit" :disabled="isQuestionEmpty"/>
      </div>
    </div>
  `;
}

import { useConnectionStore } from "../stores/connection";
import { Button, IconField, InputIcon, InputText, ScrollPanel } from "primevue";
import ChatBubble from "./ChatBubble.vine";
import { ChatMessageSender } from "@/common/enums";
import { useChatStore } from "../stores/chat";

export default function ChatWindow() {
  const question = ref("");
  const connection = useConnectionStore();
  const { history } = useChatStore();
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
  });
  function handleSubmit() {
    history.value.push({
      sender: ChatMessageSender.User,
      message: question.value,
      timestamp: new Date(),
    });
    connection.port.postMessage(question.value);
    question.value = "";
  }
  const messagePosition = {
    [ChatMessageSender.Robot]: "justify-self-end",
    [ChatMessageSender.User]: "justify-self-start",
  };
  // TODO quote selection
  return vine`
    <div class="flex-1 flex flex-col overflow-hidden">
      <ScrollPanel style="width: 100%; height:100%;" class="overflow-hidden">
        <ChatBubble
          v-for="{sender,message,timestamp} in history"
          :class="'w-3/4'+' '+messagePosition[sender]"
          :sender="sender" :message="message" :timestamp="timestamp"
        />
      </ScrollPanel>
      <div class="w-full flex my-2">
        <InputText type="text" v-model="question" class="w-full ml-2"/>
        <Button icon="pi pi-send" class="flex-none mr-2" @click="handleSubmit"/>
      </div>
    </div>
  `;
}

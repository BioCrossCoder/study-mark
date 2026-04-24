import { useConnectionStore } from "../stores/connection";
import { Button, IconField, InputIcon, InputText, ScrollPanel } from "primevue";
import ChatBubble, { ChatMessage, ChatMessageSender } from "./ChatBubble.vine";

export default function ChatWindow() {
  const question = ref("");
  const connection = useConnectionStore();
  const history = ref(new Array<ChatMessage>());
  connection.listen((message) => {
    history.value.push({
      sender: ChatMessageSender.Robot,
      message,
      timestamp: new Date(),
    });
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
    <div class="h-full flex flex-col">
      <ScrollPanel style="width: 100%; height:100%;" class="overflow-hidden max-h-65">
        <ChatBubble
          v-for="{sender,message,timestamp} in history"
          :class="'w-3/4'+' '+messagePosition[sender]"
          :sender="sender" :message="message" :timestamp="timestamp"
        />
      </ScrollPanel>
      <div class="w-full flex">
        <InputText type="text" v-model="question" class="w-full ml-2"/>
        <Button icon="pi pi-send" class="flex-none mr-2" @click="handleSubmit"/>
      </div>
    </div>
  `;
}

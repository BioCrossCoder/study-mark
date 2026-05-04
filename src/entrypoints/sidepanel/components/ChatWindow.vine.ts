import { useConnectionStore } from "../stores/connection";
import {
  Button,
  IconField,
  InputIcon,
  InputText,
  Panel,
  ScrollPanel,
  ScrollTop,
} from "primevue";
import { ChatMessageSender, MessageType, Signal } from "@/common/enums";
import { useChatStore } from "../stores/chat";
import { MessagesSquare } from "@lucide/vue";
import {
  ChatMessage,
  errorMessageSchema,
  signalMessageSchema,
  TextMessage,
  textMessageSchema,
} from "@/common/types";
import { marked } from "marked";
import { useScroll } from "@/composables/useScroll";
import { defineVibe } from "vue-vine";

export default function ChatWindow() {
  const { history, isHistoryEmpty, loading } = useChatStore();
  const bottomAnchor = ref(document.createElement("div"));
  const connection = useConnectionStore();
  const { showError } = useNotice();

  connection.listen((message) => {
    // [HandleError]
    const errorMessage = errorMessageSchema.safeParse(message);
    if (errorMessage.success) {
      loading.value = false;
      history.value.pop();
      showError("Call AI Failed", { message: errorMessage.data.content });
      return;
    } // [/]
    // [HandleSignal]
    const signalMessage = signalMessageSchema.safeParse(message);
    if (signalMessage.success && signalMessage.data.content === Signal.Finish) {
      loading.value = false;
      return;
    } // [/]
    // [HandleText]
    const textMessage = textMessageSchema.safeParse(message);
    if (textMessage.success) {
      const lastMessage = history.value.at(-1);
      if (lastMessage?.sender === ChatMessageSender.Robot) {
        lastMessage.message += textMessage.data.content;
      } else {
        history.value.push({
          sender: ChatMessageSender.Robot,
          message: textMessage.data.content,
          timestamp: new Date(),
        });
      }
      useScroll(bottomAnchor, "smooth", "end");
      return;
    } // [/]
  });

  const messagePosition = {
    [ChatMessageSender.Robot]: "justify-self-start",
    [ChatMessageSender.User]: "justify-self-end",
  };

  // TODO quote selection
  return vine`
    <div class="flex-1 flex flex-col overflow-hidden">
      <EmptyPlaceholder v-if="isHistoryEmpty"/>
      <ScrollPanel v-else style="width: 100%; height:100%;" class="overflow-hidden">
        <ChatBubble
          v-for="{sender,message,timestamp} in history"
          :class="'w-3/4'+' '+messagePosition[sender]"
          :sender="sender" :message="message" :timestamp="timestamp"
        />
        <div ref="bottomAnchor"/>
        <ScrollTop target="parent" :threshold="0"/>
      </ScrollPanel>
      <InputBox :anchor="bottomAnchor"/>
    </div>
  `;
}

function ChatBubble(props: ChatMessage) {
  return vine`
    <Panel class="m-2">
      <template #header>
        <i :class="sender"/>
      </template>
      <p v-html="marked.parse(message)" class="whitespace-pre-wrap [&_code]:whitespace-pre-wrap"/>
      <template #footer>
        <div class="flex justify-end">
          <span>{{timestamp.toLocaleString()}}</span>
        </div>
      </template>
    </Panel>
  `;
}

function EmptyPlaceholder() {
  return vine`
    <div class="h-full flex justify-center items-center">
      <div class="flex flex-col justify-between items-center">
        <MessagesSquare class="w-[min(50vw,50vh)] h-[min(50vw,50vh)]" stroke-width="1.2"/>
        <div class="flex items-center gap-2">
          <p class="text-lg">Set your AI model through</p>
          <i class="pi pi-cog"/>
        </div>
      </div>
    </div>
  `;
}

function InputBox(props: { anchor: HTMLElement }) {
  const question = ref("");
  const isQuestionEmpty = computed(() => question.value.length === 0);
  const { loading } = useChatStore();
  const isSubmitDisabled = computed(
    () => isQuestionEmpty.value || loading.value,
  );
  const { history } = useChatStore();
  const connection = useConnectionStore();

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
      type: MessageType.Text,
      content: question.value,
    });
    question.value = "";
    useScroll(props.anchor, "instant", "end");
  }

  function handleClear() {
    question.value = "";
  }

  const buttonIcon = computed(() =>
    loading.value ? "pi pi-spinner pi-spin" : "pi pi-send",
  );

  return vine`
    <div class="w-full flex my-2">
      <IconField class="w-full ml-2">
        <InputText type="text" v-model="question" @keydown.enter="handleSubmit" class="w-full"/>
        <InputIcon v-if="!isQuestionEmpty">
          <i class="pi pi-times-circle hover:cursor-pointer hover:text-red-300" @click="handleClear"/>
        </InputIcon>
      </IconField>
      <Button :icon="buttonIcon" class="flex-none mr-2" @click="handleSubmit" :disabled="isSubmitDisabled"/>
    </div>
  `;
}

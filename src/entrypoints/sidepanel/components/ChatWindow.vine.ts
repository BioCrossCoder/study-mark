import { useConnectionStore } from "../stores/connection";
import {
  Button,
  Chip,
  IconField,
  InputIcon,
  Panel,
  ScrollPanel,
  ScrollTop,
  Select,
  Textarea,
} from "primevue";
import {
  AgentMode,
  ChatMessageSender,
  ExecStatus,
  MessageType,
  ObjectType,
  Signal,
} from "@/common/enums";
import { useChatStore } from "../stores/chat";
import { ArrowBigUp, CornerDownLeft, MessagesSquare } from "@lucide/vue";
import {
  ChatMessage,
  errorMessageSchema,
  Plan,
  SignalMessage,
  signalMessageSchema,
  TextMessage,
  textMessageSchema,
} from "@/common/types";
import { marked } from "marked";
import { useScroll } from "@/composables/useScroll";
import { defineVibe } from "vue-vine";
import { useRelationsMutation } from "@/stores/relations";
import { useCreateTarget } from "@/composables/useCreateTarget";
import { useCreateTask } from "@/composables/useCreateTask";

export default function ChatWindow() {
  const { history, isHistoryEmpty, loading } = useChatStore();
  const bottomAnchor = ref(document.createElement("div"));
  const connection = useConnectionStore();
  const { showError, showSuccess } = useNotice();

  function updateHistory(message: string, callback?: () => void) {
    const lastMessage = history.value.at(-1);
    if (lastMessage?.sender === ChatMessageSender.Robot) {
      lastMessage.message += message;
      lastMessage.callback = callback;
    } else {
      history.value.push({
        sender: ChatMessageSender.Robot,
        message,
        callback,
        timestamp: new Date(),
      });
    }
  }

  const createTarget = useCreateTarget();
  const createTask = useCreateTask();
  const { add } = useRelationsMutation();
  async function createPlan(data: Plan) {
    const id = await createTarget(data.target);
    if (!id) {
      return;
    }
    const taskIds = new Array<string>();
    for (const task of data.tasks) {
      const id = await createTask(task);
      if (!id) {
        continue;
      }
      taskIds.push(id);
    }
    await add(taskIds.map((taskId) => [id, taskId]));
    showSuccess("Create Plan Succeeded!");
  }

  const reasoning = ref(false);
  connection.listen((message) => {
    // [HandleError]
    const errorMessage = errorMessageSchema.safeParse(message);
    if (errorMessage.success) {
      loading.value = false;
      history.value.pop();
      showError("Call AI Failed", { message: errorMessage.data.content });
      reasoning.value = false;
      return;
    } // [/]
    // [HandleSignal]
    const signalMessage = signalMessageSchema.safeParse(message);
    if (signalMessage.success) {
      switch (signalMessage.data.content) {
        case Signal.Finish:
          reasoning.value = false;
          loading.value = false;
          break;
        case Signal.Tool:
          if (reasoning.value) {
            updateHistory("\n```\n");
          }
          reasoning.value = false;
          if (!history.value.at(-1)?.message.endsWith(toolCallingTag)) {
            updateHistory(toolCallingTag);
          }
          break;
      }
      return;
    } // [/]
    // [HandleText]
    const textMessage = textMessageSchema.safeParse(message);
    if (textMessage.success) {
      const { content, type } = textMessage.data;
      switch (type) {
        case MessageType.Infer:
          updateHistory(
            (reasoning.value ? "" : "\n```\n[Thinking]\n") + content,
          );
          reasoning.value = true;
          break;
        case MessageType.Plan:
          const data = JSON.parse(content);
          const info = JSON.stringify(data, null, 2);
          updateHistory(
            (reasoning.value ? "\n```\n" : "") + `\`\`\`json\n${info}\n\`\`\``,
            () => createPlan(data),
          );
          reasoning.value = false;
          break;
        case MessageType.Text:
          updateHistory((reasoning.value ? "\n```\n" : "") + content);
          reasoning.value = false;
          break;
        case MessageType.Tool:
          if (reasoning.value) {
            updateHistory("\n```\n");
          }
          reasoning.value = false;
          if (!history.value.at(-1)?.message.endsWith(toolCallingTag)) {
            updateHistory(toolCallingTag);
          }
          break;
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
          v-for="{sender,message,timestamp,callback} in history"
          :class="'w-3/4'+' '+messagePosition[sender]"
          :sender="sender" :message="message" :timestamp="timestamp" :callback="callback"
        />
        <div ref="bottomAnchor"/>
        <ScrollTop target="parent" :threshold="0"/>
      </ScrollPanel>
      <InputBox :anchor="bottomAnchor"/>
    </div>
  `;
}

const toolCallingTag = "\n```\nExec Tool Calling...\n```\n";

function ChatBubble(props: ChatMessage) {
  return vine`
    <Panel class="m-2">
      <template #header>
        <i :class="sender"/>
      </template>
      <p v-html="marked.parse(message)" class="whitespace-pre-wrap [&_code]:whitespace-pre-wrap [&_code]:break-all [&_pre]:rounded [&_pre]:p-2 [&_pre]:bg-surface-200 [&_pre]:dark:bg-surface-700"/>
      <template #footer>
        <div class="flex justify-between items-center">
          <Button label="Create" size="small" v-if="callback" @click="callback"/>
          <div v-else/>
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

const messageTypeToSend = {
  [AgentMode.Chat]: MessageType.Text,
  [AgentMode.Plan]: MessageType.Plan,
} as const;

function InputBox(props: { anchor: HTMLElement }) {
  const question = ref("");
  const isQuestionEmpty = computed(() => question.value.trim() === "");
  const { loading, history } = useChatStore();
  const isSubmitDisabled = computed(
    () => isQuestionEmpty.value && !loading.value,
  );
  const connection = useConnectionStore();

  const mode = ref(AgentMode.Chat);
  const options = Object.values(AgentMode);

  function handleSubmit() {
    // [StopGeneration]
    if (loading.value) {
      connection.send<SignalMessage>({
        type: MessageType.Signal,
        content: Signal.Stop,
      });
      loading.value = false;
      return;
    } // [/]
    if (isQuestionEmpty.value) {
      return;
    }
    // [StartGeneration]
    loading.value = true;
    history.value.push({
      sender: ChatMessageSender.User,
      message: question.value,
      timestamp: new Date(),
    });
    connection.send<TextMessage>({
      type: messageTypeToSend[mode.value],
      content: question.value,
    });
    question.value = "";
    useScroll(props.anchor, "instant", "end"); // [/]
  }

  function handleEnter(event: KeyboardEvent) {
    if (event.isComposing || event.shiftKey) {
      return;
    }
    event.preventDefault();
    handleSubmit();
  }

  function handleClear() {
    question.value = "";
  }

  const buttonIcon = computed(() =>
    loading.value ? "pi pi-spinner pi-spin" : "pi pi-send",
  );

  return vine`
    <div class="w-full flex flex-col px-2 mb-2">
      <IconField class="w-full">
        <Textarea
          v-model="question"
          @keydown.enter="handleEnter"
          autocomplete="off"
          rows="3"
          class="w-full"
          style="resize: none;"
        /> 
        <InputIcon v-if="!isQuestionEmpty">
          <i class="pi pi-times-circle hover:cursor-pointer hover:text-red-300" @click="handleClear"/>
        </InputIcon>
      </IconField>
      <div class="flex items-center justify-between">
        <Select
          v-model="mode"
          :options="options"
        />
        <Chip label="Newline">
          <template #icon>
            <ArrowBigUp class="h-5" />
            <CornerDownLeft class="h-5" />
          </template>
        </Chip>
        <Button :icon="buttonIcon" class="mr-2" @click="handleSubmit" :disabled="isSubmitDisabled"/>
      </div>
    </div>
  `;
}

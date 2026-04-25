import { Panel } from "primevue";
import { marked } from "marked";

export default function ChatBubble(props: ChatMessage) {
  return vine`
    <Panel class="m-2">
      <template #header>
        <i :class="sender"/>
      </template>
      <p v-html="marked.parse(message)"></p>
      <template #footer>
        <div class="flex justify-end">
          <span>{{timestamp.toLocaleString()}}</span>
        </div>
      </template>
    </Panel>
  `;
}

export type ChatMessage = {
  sender: ChatMessageSender;
  message: string;
  timestamp: Date;
};

export const enum ChatMessageSender {
  User = "pi pi-user",
  Robot = "pi pi-microchip-ai",
}

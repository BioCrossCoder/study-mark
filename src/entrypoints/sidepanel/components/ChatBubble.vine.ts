import { Panel } from "primevue";

export default function ChatBubble(props: ChatMessage) {
  const timeString = props.timestamp.toLocaleString();
  return vine`
    <Panel class="m-2">
      <template #header>
        <i :class="sender"/>
      </template>
      <p>
        {{message}}
      </p>
      <template #footer>
        <div class="flex justify-end">
          <span>{{timeString}}</span>
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

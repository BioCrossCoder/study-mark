import { Panel } from "primevue";
import { marked } from "marked";
import { ChatMessage } from '@/common/types';

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

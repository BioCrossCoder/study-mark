import { useConnectionStore } from "../stores/connection";
import { Button, IconField, InputIcon, InputText, ScrollPanel } from "primevue";
export default function ChatWindow() {
  const question = ref("");
  const answer = ref("");
  const connection = useConnectionStore();
  connection.listen((message) => {
    answer.value = message;
  });
  function handleSubmit() {
    connection.port.postMessage(question.value);
  }
  // TODO quote selection
  return vine`
    <div class="h-full flex flex-col">
      <ScrollPanel style="width: 100%; height: 100%">
        {{answer}}
      </ScrollPanel>
      <div class="w-full flex">
        <InputText type="text" v-model="question" class="w-full m-2"/>
        <Button icon="pi pi-send" class="m-2 flex-none" @click="handleSubmit"/>
      </div>
    </div>
  `;
}

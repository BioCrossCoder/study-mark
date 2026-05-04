import { Toolbar } from "primevue";
import { useRouter } from "vue-router";
import ChatWindow from "../components/ChatWindow.vine";
import { useChatStore } from "../stores/chat";
import { SignalMessage } from "@/common/types";
import { useConnectionStore } from "../stores/connection";
import NavigationGroup from "../components/NavigationGroup.vine";
import { MessageType, Signal } from "@/common/enums";
import ChatConfigDialog from "../components/ChatConfigDialog.vine";

export default function Page() {
  return vine`
    <div class="h-screen flex flex-col">
      <TopBar/>
      <ChatWindow/>
    </div>
  `;
}

function TopBar() {
  const { history, isHistoryEmpty } = useChatStore();
  const connection = useConnectionStore();
  function handleClear() {
    // TODO add confirm
    history.value.length = 0;
    connection.send<SignalMessage>({
      type: MessageType.Signal,
      content: Signal.Clear,
    });
  }

  const dialog = ref({ open: () => {} });
  function handleChangeConfig() {
    dialog.value.open();
  }

  return vine`
    <Toolbar class="border-0!">
      <template #start>
        <NavigationGroup/>
      </template>
      <template #end>
        <div class="flex gap-2">
          <i
            class="pi pi-cog hover:cursor-pointer hover:text-primary-300"
            @click="handleChangeConfig"
          />
          <i
            v-if="!isHistoryEmpty"
            class="pi pi-trash hover:cursor-pointer hover:text-red-400"
            @click="handleClear"
          />
          <ChatConfigDialog ref="dialog"/>
        </div>
      </template>
    </Toolbar>
  `;
}

import { Toolbar } from "primevue";
import { useRouter } from "vue-router";
import ChatWindow from "../components/ChatWindow.vine";
import { useChatStore } from "../stores/chat";
import { SignalMessage } from "@/common/types";
import { useConnectionStore } from "../stores/connection";

export default function Page() {
  const router = useRouter();
  function enterFavoritesPage() {
    router.push("/sidepanel/favorites");
  }
  const { history, isHistoryEmpty } = useChatStore();
  const connection = useConnectionStore();
  function handleClear() {
    // TODO add confirm
    history.value.length = 0;
    connection.send<SignalMessage>({
      type: "signal",
      content: "clear",
    });
  }
  return vine`
    <div class="h-screen flex flex-col">
      <Toolbar>
        <template #start>
          <i
            class="pi pi-star hover:cursor-pointer hover:text-primary-300"
            @click="enterFavoritesPage"
          />
        </template>
        <template #end>
          <i
            v-if="!isHistoryEmpty"
            class="pi pi-trash hover:cursor-pointer hover:text-red-400"
            @click="handleClear"
          />
        </template>
      </Toolbar>
      <ChatWindow/>
    </div>
  `;
}

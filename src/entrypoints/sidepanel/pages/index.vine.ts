import { Toolbar } from "primevue";
import { useRouter } from "vue-router";
import ChatWindow from "../components/ChatWindow.vine";
import { useChatStore } from "../stores/chat";
import { SignalMessage } from "@/common/types";

export default function Page() {
  const router = useRouter();
  function onClickStar() {
    router.push("/sidepanel/favorites");
  }
  const { history } = useChatStore();
  function onClickClear() {
    // TODO add confirm
    history.value.length = 0;
    browser.runtime.sendMessage<SignalMessage>({
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
            @click="onClickStar"
          />
        </template>
        <template #end>
          <i
            class="pi pi-trash hover:cursor-pointer hover:text-red-400"
            @click="onClickClear"
          />
        </template>
      </Toolbar>
      <ChatWindow/>
    </div>
  `;
}

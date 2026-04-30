import { RouterView, useRouter } from "vue-router";
import { initSelectionStore } from "@/entrypoints/sidepanel/stores/selections";
import { initConnectionStore, useConnectionStore } from "./stores/connection";
import { initChatStore } from "./stores/chat";
import { Toast } from "primevue";

export default function App() {
  const router = useRouter();
  onMounted(() => {
    router.replace("/sidepanel");
    initSelectionStore();
    initConnectionStore();
    initChatStore();
  });
  onUnmounted(() => {
    useConnectionStore().close();
  });
  return vine`
    <RouterView/>
    <Toast class="w-screen! left-0 top-0!"/>
  `;
}

import { RouterView, useRouter } from "vue-router";
import { initSelectionStore } from "@/entrypoints/sidepanel/stores/selections";
import { initConnectionStore, useConnectionStore } from "./stores/connection";
import { initChatStore } from "./stores/chat";
import { Toast } from "primevue";
import {
  useSidePanelPathMutation,
  useSidePanelPathQuery,
} from "@/stores/sidePanel";
import { signalMessageSchema } from "@/common/types";
import { Signal } from "@/common/enums";
import { usePathStore } from "./composables/usePathStore";
import { useShowTasks } from "./composables/useShowTasks";

export default function App() {
  usePathStore();
  useShowTasks();
  onMounted(() => {
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

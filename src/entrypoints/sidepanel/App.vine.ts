import { RouterView, useRouter } from "vue-router";
import { initSelectionStore } from "@/entrypoints/sidepanel/stores/selections";
import { initConnectionStore, useConnectionStore } from "./stores/connection";

export default function App() {
  const router = useRouter();
  onMounted(() => {
    router.replace("/sidepanel");
    initSelectionStore();
    initConnectionStore();
  });
  onUnmounted(() => {
    useConnectionStore().close();
  });
  return vine`<RouterView/>`;
}

import { RouterView, useRouter } from "vue-router";
import { initSelectionStore } from "@/stores/selections";

export default function App() {
  const router = useRouter();
  initSelectionStore();
  onBeforeMount(() => router.replace("/sidepanel"));
  return vine`<RouterView/>`;
}

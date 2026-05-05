import { Signal } from "@/common/enums";
import { signalMessageSchema } from "@/common/types";
import { useRouter } from "vue-router";

export function useShowTasks() {
  const router = useRouter();
  const callback = (message: unknown) => {
    const { success, data } = signalMessageSchema.safeParse(message);
    if (success && data.content === Signal.ShowTasks) {
      router.push("/sidepanel/tasks");
    }
  };
  onMounted(() => {
    if (!browser.runtime.onMessage.hasListener(callback)) {
      browser.runtime.onMessage.addListener(callback);
    }
  });
  onUnmounted(() => {
    if (browser.runtime.onMessage.hasListener(callback)) {
      browser.runtime.onMessage.removeListener(callback);
    }
  });
}

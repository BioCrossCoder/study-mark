import { SidePanelPagePath } from "@/common/types";
import {
  useSidePanelPathMutation,
  useSidePanelPathQuery,
} from "@/stores/sidePanel";
import { useRouter } from "vue-router";

export function usePathStore() {
  const router = useRouter();
  const { data } = useSidePanelPathQuery();
  const { mutate } = useSidePanelPathMutation();
  const unwatch = watch(data, (value) => {
    if (value) {
      router.replace(value);
      unwatch();
    }
  });
  router.afterEach((to) => {
    mutate(to.name as SidePanelPagePath);
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { SidePanelPagePath } from "@/common/types";

const key = "local:sidePanelPath";
export const sidePanelPath = storage.defineItem<SidePanelPagePath>(key, {
  fallback: "/sidepanel",
});

export function useSidePanelPathQuery() {
  return useQuery({
    queryKey: [key],
    queryFn: sidePanelPath.getValue,
  });
}

export function useSidePanelPathMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: sidePanelPath.setValue,
    async onSuccess() {
      await client.invalidateQueries({ queryKey: [key] });
    },
  });
}

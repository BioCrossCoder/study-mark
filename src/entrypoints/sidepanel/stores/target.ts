import { PlanType } from "@/common/enums";
import { Target } from "@/common/types";
import { useTasksQuery } from "@/stores/tasks";
import { useQuery } from "@tanstack/vue-query";

export function useTargetQuery(id: Ref<string>) {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [id],
    queryFn: async () => {
      const record = (data.value ?? {})[id.value] ?? {};
      return record.type === PlanType.Target ? record : null;
    },
  });
}

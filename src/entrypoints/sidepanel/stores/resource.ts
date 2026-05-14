import { PlanType } from "@/common/enums";
import { useTasksQuery } from "@/stores/tasks";
import { useQuery } from "@tanstack/vue-query";

export function useResourceQuery(id: Ref<string>) {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [id, data, "resource"],
    queryFn: async () => {
      const record = (data.value ?? {})[id.value] ?? {};
      return record.type === PlanType.Resource ? record : null;
    },
  });
}

import { PlanType } from "@/common/enums";
import { Task } from "@/common/types";
import { useTasksQuery } from "@/stores/tasks";
import { useQuery } from "@tanstack/vue-query";

export function useTaskQuery(id: Ref<string>) {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [id],
    queryFn: async () => {
      const record = (data.value ?? {})[id.value] ?? {};
      return record.type === PlanType.Task ? record : null;
    },
  });
}

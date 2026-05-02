import { PlanType } from "@/common/enums";
import { useTasksQuery } from "@/stores/tasks";
import { useQuery } from "@tanstack/vue-query";

export function useTargetQuery(id: Ref<string>) {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [id, data],
    queryFn: async () => {
      const record = (data.value ?? {})[id.value] ?? {};
      return record.type === PlanType.Target ? record : null;
    },
  });
}

export function useTargetOptionsQuery() {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [data],
    queryFn: async () =>
      Object.values(data.value ?? {})
        .filter((item) => item.type === PlanType.Target)
        .map((item) => ({ name: item.title, code: item.id })),
  });
}

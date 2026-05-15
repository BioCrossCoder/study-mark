import { ObjectType } from "@/common/enums";
import { useTasksQuery } from "@/stores/tasks";
import { useQuery } from "@tanstack/vue-query";

export function useTaskQuery(id: Ref<string>) {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [id, data, "task"],
    queryFn: async () => {
      const record = (data.value ?? {})[id.value] ?? {};
      return record.type === ObjectType.Task ? record : null;
    },
  });
}

export function useTaskOptionsQuery() {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [data, "taskOptions"],
    queryFn: async () =>
      Object.values(data.value ?? {})
        .filter((item) => item.type === ObjectType.Task)
        .map((item) => ({ name: item.title, code: item.id })),
  });
}

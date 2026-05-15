import { ObjectType } from "@/common/enums";
import { useTasksQuery } from "@/stores/tasks";
import { useQuery } from "@tanstack/vue-query";

export function useTargetQuery(id: Ref<string>) {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [id, data, "target"],
    queryFn: async () => {
      const record = (data.value ?? {})[id.value] ?? {};
      return record.type === ObjectType.Target ? record : null;
    },
  });
}

import { useQuery } from "@tanstack/vue-query";
import { useTasksQuery } from "./tasks";
import { ObjectType } from "@/common/enums";

export function useTargetOptionsQuery() {
  const { data } = useTasksQuery();
  return useQuery({
    queryKey: [data, "targetOptions"],
    queryFn: async () =>
      Object.values(data.value ?? {})
        .filter((item) => item.type === ObjectType.Target)
        .map((item) => ({ name: item.title, code: item.id })),
  });
}

import { Target, Task } from "@/common/types";
import { useRelationsQuery } from "@/stores/relations";
import { useTasksQuery } from "@/stores/tasks";
import { useQuery } from "@tanstack/vue-query";

export function useRelatedItemsQuery(id: Ref<string>) {
  const { data: relations } = useRelationsQuery();
  const { data } = useTasksQuery();
  const records = computed(() => data.value ?? {});
  return useQuery({
    queryKey: [id, relations, records, "relatedItems"],
    queryFn: () => {
      const items = new Array<Task | Target>();
      for (const [id1, id2] of relations.value ?? []) {
        if (id1 === id.value) {
          items.push(records.value[id2] as Task | Target);
        } else if (id2 === id.value) {
          items.push(records.value[id1] as Task | Target);
        }
      }
      return items;
    },
  });
}

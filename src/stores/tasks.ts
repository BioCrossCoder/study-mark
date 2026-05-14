import { Resource, Target, Task } from "@/common/types";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { ok, err, Result } from "neverthrow";
import { useRelationsMutation } from "./relations";

type Plan = Task | Target | Resource;
const key = "local:taskData";
const taskData = storage.defineItem<Record<string, Plan>>(key, {
  fallback: {},
});

export function useTasksQuery() {
  return useQuery({
    queryKey: [key],
    queryFn: taskData.getValue,
  });
}

export function useTasksMutation() {
  const { refetch } = useTasksQuery();
  const mutation = useMutation({
    mutationFn: taskData.setValue,
    onSuccess() {
      refetch();
    },
  });

  function isNameConflict(item: Plan, data: Record<string, Plan>) {
    const titles = Object.values(data)
      .map((item) => ({
        [item.title]: item.id,
      }))
      .reduce((a, b) => ({ ...a, ...b }), {});
    return ![item.id, undefined].includes(titles[item.title]);
  }

  async function save(item: Plan): Promise<Result<void, Error>> {
    const data = await taskData.getValue();
    if (isNameConflict(item, data)) {
      return err(new Error("Duplicated Title"));
    }
    data[item.id] = item;
    mutation.mutate(data);
    return ok();
  }

  const relationsMutation = useRelationsMutation();
  async function remove(id: string) {
    await relationsMutation.removeById(id);
    const data = await taskData.getValue();
    delete data[id];
    mutation.mutate(data);
  }

  async function newId(): Promise<Result<string, Error>> {
    const data = await taskData.getValue();
    const id = crypto.randomUUID();
    return id in data ? err(new Error("Duplicated ID")) : ok(id);
  }

  return { ...mutation, save, remove, newId };
}

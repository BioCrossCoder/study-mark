import { Target, Task } from "@/common/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ok, err, Result } from "neverthrow";

const taskData = storage.defineItem<Record<string, Task | Target>>(
  "local:taskData",
  {
    fallback: {},
  },
);

const cacheKey = "tasks";

export function useTasksQuery() {
  return useQuery({
    queryKey: [cacheKey],
    queryFn: taskData.getValue,
  });
}

export function useTasksMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: taskData.setValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [cacheKey] });
    },
  });
  async function save(item: Task | Target) {
    const data = await taskData.getValue();
    data[item.id] = item;
    mutation.mutate(data);
  }
  async function remove(id: string) {
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

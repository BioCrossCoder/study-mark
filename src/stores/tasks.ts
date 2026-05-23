import {
  BookMark,
  Resource,
  SignalMessage,
  Target,
  Task,
} from "@/common/types";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { ok, err, Result } from "neverthrow";
import { useRelationsMutation } from "./relations";
import { MessageType, ObjectType, Signal } from "@/common/enums";

type Plan = Task | Target | Resource;
const key = "local:taskData";
export const taskData = storage.defineItem<Record<string, Plan>>(key, {
  fallback: {},
});

const version = ref(0);
export function useTasksQuery() {
  return useQuery({
    queryKey: [key, version],
    queryFn: taskData.getValue,
  });
}

export function useTasksMutation() {
  const mutation = useMutation({
    mutationFn: taskData.setValue,
    onSuccess() {
      version.value = Date.now();
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

function positionMatch(p1: string, p2: string) {
  const SUFFIX_RE = /(\.html|\.htm|\.php|\.jsp|\.asp|)/;
  return (
    new RegExp(`^${p1}${SUFFIX_RE.source}$`).test(p2) ||
    new RegExp(`^${p2}${SUFFIX_RE.source}$`).test(p1)
  );
}

export async function getTasksByPosition(position: string) {
  const data = await taskData.getValue();
  return Object.values(data)
    .filter(
      (item) =>
        item.type === ObjectType.Task && positionMatch(position, item.position),
    )
    .map((item) => {
      const { id, bookmark } = item as Task;
      return { id, bookmark };
    });
}

export async function getTaskByTitle(title: string) {
  const data = await taskData.getValue();
  for (const item of Object.values(data)) {
    if (item.type === ObjectType.Task && item.title === title) {
      const { id, bookmark } = item;
      return { id, bookmark };
    }
  }
  return null;
}

export async function updateTaskProgress(
  ids: string[],
  position: string,
  bookmark: BookMark,
) {
  const data = await taskData.getValue();
  ids.forEach((id) => {
    const task = data[id];
    if (task && task.type === ObjectType.Task) {
      task.position = position;
      task.bookmark = bookmark;
    }
  });
  await taskData.setValue(data);
  await browser.runtime.sendMessage({
    type: MessageType.Signal,
    content: Signal.UpdateTask,
  } as SignalMessage);
}

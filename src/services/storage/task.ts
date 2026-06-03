import { StoreKey } from "@/common/enums";
import { Bookmark, Task } from "@/common/types";

export const taskData = storage.defineItem<Record<string, Task>>(
  StoreKey.Task,
  {
    fallback: {},
  },
);

function positionMatch(p1: string, p2: string) {
  const SUFFIX_RE = /(\.html|\.htm|\.php|\.jsp|\.asp|)/;
  return (
    new RegExp(`^${p1}${SUFFIX_RE.source}$`).test(p2) ||
    new RegExp(`^${p2}${SUFFIX_RE.source}$`).test(p1)
  );
}

export async function getTasksByPositionUrl(url: string) {
  const data = await taskData.getValue();
  return Object.values(data).filter((item) =>
    positionMatch(url, item.position.url),
  );
}

export async function getTaskByName(name: string) {
  const data = await taskData.getValue();
  for (const item of Object.values(data)) {
    if (item.name === name) {
      return item;
    }
  }
  return null;
}

export async function updateTaskProgress(
  ids: string[],
  url: string,
  bookmark: Bookmark,
) {
  const data = await taskData.getValue();
  ids.forEach((id) => {
    const task = data[id];
    if (task) {
      task.position = { url, bookmark };
    }
  });
  await taskData.setValue(data);
}

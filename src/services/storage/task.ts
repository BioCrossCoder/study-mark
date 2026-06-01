import { StoreKey } from "@/common/enums";
import { Task } from "@/common/types";

export const taskData = storage.defineItem<Record<string, Task>>(
  StoreKey.Task,
  {
    fallback: {},
  },
);

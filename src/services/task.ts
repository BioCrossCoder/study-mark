import { ExecStatus } from "@/common/enums";
import { statusSchema, taskSchema } from "@/common/schemas";
import { Task } from "@/common/types";
import { isItemExist, mergeObj, positionMatch } from "@/common/utils";
import { useWxtStore } from "@/hooks/common/useWxtStore";
import { taskData } from "@/services/storage/task";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export function useTaskData() {
  return useWxtStore(taskData);
}

export function useCreateTask(toast: RefObject<Toast | null>) {
  return async (params: {
    name: string;
    description: string;
    source: string;
  }) => {
    const tasks = await taskData.getValue();
    const id = crypto.randomUUID();
    const summary = "Create Task Failed";
    const records = Object.values(tasks);
    if (isItemExist({ id } as Task, "id", records)) {
      const detail = "Task id already exists";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    if (isItemExist(params as Task, "name", records)) {
      const detail = `Task name "${params.name}" already exists`;
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const createdAt = Date.now();
    const form: Task = {
      id,
      ...params,
      status: ExecStatus.Todo,
      position: {
        url: params.source,
      },
      createdAt,
      updatedAt: createdAt,
      lastVisit: createdAt,
    };
    const { success, data, error } = taskSchema.safeParse(form);
    if (!success) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: error.message,
      });
      return error;
    }
    tasks[id] = data;
    await taskData.setValue(tasks);
    return id;
  };
}

export function useTaskOptions() {
  const data = useTaskData();
  return Object.values(data ?? {}).map((item) => ({
    name: item.name,
    code: item.id,
  }));
}

export function useUpdateTask(toast: RefObject<Toast | null>) {
  return async (
    id: string,
    params: {
      name: string;
      description: string;
    },
  ) => {
    const tasks = await taskData.getValue();
    const summary = "Update Task Failed";
    const records = Object.values(tasks);
    if (!isItemExist({ id } as Task, "id", records)) {
      const detail = "Task not found";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const record = records.find((item) => item.name === params.name);
    if (record && record.id !== id) {
      const detail = "Task name already exists";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const form: Task = {
      ...tasks[id],
      ...params,
      updatedAt: Date.now(),
    };
    const { success, data, error } = taskSchema.safeParse(form);
    if (!success) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: error.message,
      });
      return error;
    }
    tasks[id] = data;
    await taskData.setValue(tasks);
    return id;
  };
}

export function useTaskFields<K extends keyof Task>(field: K) {
  const data = useTaskData();
  return Object.values(data ?? {})
    .map((task) => ({ [task.id]: task[field] }))
    .reduce(mergeObj, {});
}

export function useUpdateTaskStatus(toast: RefObject<Toast | null>) {
  return async (id: string, status: ExecStatus) => {
    const tasks = await taskData.getValue();
    const summary = "Update Task status Failed";
    const records = Object.values(tasks);
    if (!isItemExist({ id } as Task, "id", records)) {
      const detail = "Task not found";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const { success, data, error } = statusSchema.safeParse(status);
    if (!success) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: error.message,
      });
      return error;
    }
    tasks[id].status = data;
    await taskData.setValue(tasks);
    return id;
  };
}

export function useTasksByPositionUrl(url: string) {
  const data = useTaskData();
  return Object.values(data).filter((item) =>
    positionMatch(url, item.position.url),
  );
}

export function useTaskById(id: string): Task | undefined {
  const data = useTaskData();
  return data[id];
}

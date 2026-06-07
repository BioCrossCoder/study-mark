import { ExecStatus, StoreKey } from "@/common/enums";
import { statusSchema, taskSchema } from "@/common/schemas";
import { Task } from "@/common/types";
import { isItemExist, mergeObj } from "@/common/utils";
import { taskData } from "@/services/storage/task";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export function useTaskQuery() {
  return useQuery({
    queryKey: [StoreKey.Task],
    queryFn: taskData.getValue,
  });
}

export function useTaskMutation() {
  const { refetch } = useTaskQuery();
  return useMutation({
    mutationFn: taskData.setValue,
    onSuccess() {
      refetch();
    },
  });
}

export function useCreateTask(toast: RefObject<Toast | null>) {
  const { mutate } = useTaskMutation();
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
    mutate(tasks);
    return id;
  };
}

export function useRemoveTask() {
  const { mutate } = useTaskMutation();
  return async (id: string) => {
    const data = await taskData.getValue();
    delete data[id];
    mutate(data);
  };
}

export function useTaskDetail(id: string) {
  const { data } = useTaskQuery();
  return (data ?? {})[id];
}

export function useTaskOptions() {
  const { data } = useTaskQuery();
  return Object.values(data ?? {}).map((item) => ({
    name: item.name,
    code: item.id,
  }));
}

export function useUpdateTask(toast: RefObject<Toast | null>) {
  const { mutate } = useTaskMutation();
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
    mutate(tasks);
    return id;
  };
}

export function useTaskNames() {
  const { data } = useTaskQuery();
  return Object.values(data ?? {})
    .map(({ id, name }) => ({ [id]: name }))
    .reduce(mergeObj, {});
}

export function useUpdateTaskStatus(toast: RefObject<Toast | null>) {
  const { mutate } = useTaskMutation();
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
    mutate(tasks);
    return id;
  };
}

import { ExecStatus, StoreKey } from "@/common/enums";
import { taskSchema } from "@/common/schemas";
import { Task } from "@/common/types";
import { isItemExist } from "@/common/utils";
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
      const detail = "Task name already exists";
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

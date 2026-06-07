import { ExecStatus, StoreKey } from "@/common/enums";
import { statusSchema, targetSchema } from "@/common/schemas";
import { Target } from "@/common/types";
import { isItemExist, mergeObj } from "@/common/utils";
import { targetData } from "@/services/storage/target";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export function useTargetQuery() {
  return useQuery({
    queryKey: [StoreKey.Target],
    queryFn: targetData.getValue,
  });
}

export function useTargetMutation() {
  const { refetch } = useTargetQuery();
  return useMutation({
    mutationFn: targetData.setValue,
    onSuccess() {
      refetch();
    },
  });
}

export function useCreateTarget(toast: RefObject<Toast | null>) {
  const { mutate } = useTargetMutation();
  return async (params: { name: string; description: string }) => {
    const targets = await targetData.getValue();
    const id = crypto.randomUUID();
    const summary = "Create Target Failed";
    const records = Object.values(targets);
    if (isItemExist({ id } as Target, "id", records)) {
      const detail = "Target id already exists";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    if (isItemExist(params as Target, "name", records)) {
      const detail = `Target name "${params.name}" already exists`;
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const createdAt = Date.now();
    const form: Target = {
      id,
      ...params,
      status: ExecStatus.Todo,
      createdAt,
      updatedAt: createdAt,
    };
    const { success, data, error } = targetSchema.safeParse(form);
    if (!success) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: error.message,
      });
      return error;
    }
    targets[id] = data;
    mutate(targets);
    return id;
  };
}

export function useRemoveTarget() {
  const { mutate } = useTargetMutation();
  return async (id: string) => {
    const data = await targetData.getValue();
    delete data[id];
    mutate(data);
  };
}

export function useTargetDetail(id: string) {
  const { data } = useTargetQuery();
  return (data ?? {})[id];
}

export function useTargetOptions() {
  const { data } = useTargetQuery();
  return Object.values(data ?? {}).map((item) => ({
    name: item.name,
    code: item.id,
  }));
}

export function useUpdateTarget(toast: RefObject<Toast | null>) {
  const { mutate } = useTargetMutation();
  return async (
    id: string,
    params: {
      name: string;
      description: string;
    },
  ) => {
    const targets = await targetData.getValue();
    const summary = "Update Target Failed";
    const records = Object.values(targets);
    if (!isItemExist({ id } as Target, "id", records)) {
      const detail = "Target not found";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const record = records.find((item) => item.name === params.name);
    if (record && record.id !== id) {
      const detail = "Target name already exists";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const form: Target = {
      ...targets[id],
      ...params,
      updatedAt: Date.now(),
    };
    const { success, data, error } = targetSchema.safeParse(form);
    if (!success) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: error.message,
      });
      return error;
    }
    targets[id] = data;
    mutate(targets);
    return id;
  };
}

export function useTargetNames() {
  const { data } = useTargetQuery();
  return Object.values(data ?? {})
    .map(({ id, name }) => ({ [id]: name }))
    .reduce(mergeObj, {});
}

export function useUpdateTargetStatus(toast: RefObject<Toast | null>) {
  const { mutate } = useTargetMutation();
  return async (id: string, status: ExecStatus) => {
    const targets = await targetData.getValue();
    const summary = "Update Target status Failed";
    const records = Object.values(targets);
    if (!isItemExist({ id } as Target, "id", records)) {
      const detail = "Target not found";
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
    targets[id].status = data;
    mutate(targets);
    return id;
  };
}

import { ExecStatus } from "@/common/enums";
import { statusSchema, targetSchema } from "@/common/schemas";
import { Target } from "@/common/types";
import { isItemExist, mergeObj } from "@/common/utils";
import { useWxtStore } from "@/hooks/common/useWxtStore";
import { targetData } from "@/services/storage/target";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export function useTargetData() {
  return useWxtStore(targetData);
}

export function useCreateTarget(toast: RefObject<Toast | null>) {
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
    await targetData.setValue(targets);
    return id;
  };
}

export function useTargetOptions() {
  const data = useTargetData();
  return Object.values(data ?? {}).map((item) => ({
    name: item.name,
    code: item.id,
  }));
}

export function useUpdateTarget(toast: RefObject<Toast | null>) {
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
    await targetData.setValue(targets);
    return id;
  };
}

export function useTargetNames() {
  const data = useTargetData();
  return Object.values(data ?? {})
    .map(({ id, name }) => ({ [id]: name }))
    .reduce(mergeObj, {});
}

export function useUpdateTargetStatus(toast: RefObject<Toast | null>) {
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
    await targetData.setValue(targets);
    return id;
  };
}

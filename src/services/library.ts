import { librarySchema } from "@/common/schemas";
import { Library } from "@/common/types";
import { isItemExist } from "@/common/utils";
import { useWxtStore } from "@/hooks/useWxtStore";
import { libraryData } from "@/services/storage/library";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export function useLibraryData() {
  return useWxtStore(libraryData);
}

export function useCreateLibrary(toast: RefObject<Toast | null>) {
  return async (params: {
    name: string;
    description: string;
    source: string;
  }) => {
    const libraries = await libraryData.getValue();
    const id = crypto.randomUUID();
    const summary = "Create Library Failed";
    const records = Object.values(libraries);
    if (isItemExist({ id } as Library, "id", records)) {
      const detail = "Library id already exists";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    if (isItemExist(params as Library, "name", records)) {
      const detail = "Library name already exists";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const createdAt = Date.now();
    const form: Library = {
      id,
      ...params,
      createdAt,
      updatedAt: createdAt,
    };
    const { success, data, error } = librarySchema.safeParse(form);
    if (!success) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: error.message,
      });
      return error;
    }
    libraries[id] = data;
    await libraryData.setValue(libraries);
    return id;
  };
}

export function useUpdateLibrary(toast: RefObject<Toast | null>) {
  return async (
    id: string,
    params: {
      name: string;
      description: string;
      source: string;
    },
  ) => {
    const libraries = await libraryData.getValue();
    const summary = "Update Library Failed";
    const records = Object.values(libraries);
    if (!isItemExist({ id } as Library, "id", records)) {
      const detail = "Library not found";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const record = records.find((item) => item.name === params.name);
    if (record && record.id !== id) {
      const detail = "Library name already exists";
      toast.current?.show({
        severity: "error",
        summary,
        detail,
      });
      return new Error(detail);
    }
    const form: Library = {
      ...libraries[id],
      ...params,
      updatedAt: Date.now(),
    };
    const { success, data, error } = librarySchema.safeParse(form);
    if (!success) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: error.message,
      });
      return error;
    }
    libraries[id] = data;
    await libraryData.setValue(libraries);
    return id;
  };
}

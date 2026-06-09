import { StoreKey } from "@/common/enums";
import { Library } from "@/common/types";

export const libraryData = storage.defineItem<Record<string, Library>>(
  StoreKey.Library,
  {
    fallback: {},
  },
);

export async function removeLibrary(id: string) {
  const data = await libraryData.getValue();
  delete data[id];
  await libraryData.setValue(data);
}

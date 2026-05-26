import { StoreKey } from "@/common/enums";
import { Library } from "@/common/types";

export const libraryData = storage.defineItem<Record<string, Library>>(
  StoreKey.Library,
  {
    fallback: {},
  },
);

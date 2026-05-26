import { StoreKey } from "@/common/enums";
import { Target } from "@/common/types";

export const targetData = storage.defineItem<Record<string, Target>>(
  StoreKey.Target,
  {
    fallback: {},
  },
);

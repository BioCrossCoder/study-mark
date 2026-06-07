import { StoreKey, TabIndex } from "@/common/enums";

export const tabIndexData = storage.defineItem(StoreKey.TabIndex, {
  fallback: TabIndex.Plan,
});

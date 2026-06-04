import { StoreKey } from "@/common/enums";

export const chatLoadingData = storage.defineItem(StoreKey.ChatLoading, {
  fallback: false,
});

import { StoreKey } from "@/common/enums";
import { Relation } from "@/common/types";

export const relationData = storage.defineItem<Relation[]>(StoreKey.Relation, {
  fallback: [],
});

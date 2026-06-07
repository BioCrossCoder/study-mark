import { StoreKey } from "@/common/enums";
import { Comment } from "@/common/types";

export const commentData = storage.defineItem<Record<string, Comment>>(
  StoreKey.Comment,
  {
    fallback: {},
  },
);

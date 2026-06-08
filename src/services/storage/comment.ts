import { StoreKey } from "@/common/enums";
import { Comment } from "@/common/types";
import { positionMatch } from "@/common/utils";

export const commentData = storage.defineItem<Comment[]>(StoreKey.Comment, {
  fallback: [],
});

export async function getCommentsByUrl(url: string) {
  const data = await commentData.getValue();
  return data.filter((item) => positionMatch(url, item.url));
}

export async function addComment(comment: Comment) {
  const data = await commentData.getValue();
  data.push(comment);
  await commentData.setValue(data);
}

export async function updateComment(id: string, content: string) {
  const data = await commentData.getValue();
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data[index].content = content;
    await commentData.setValue(data);
  }
}

export const emptyCommentPlaceholder = "\n";

export async function removeComment(id: string) {
  const data = await commentData.getValue();
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data[index].content = emptyCommentPlaceholder;
    await commentData.setValue(data);
  }
}

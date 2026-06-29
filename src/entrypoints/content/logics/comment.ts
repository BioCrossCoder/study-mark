import { fromRange, toRange } from "xpath-range";
import {
  getCommentsByUrl,
  upsertComment,
  removeComment,
  updateComment,
} from "@/services/storage/comment";
import { registerSingleUseMutationHandler } from "@/common/utils";
import { useHoverMessageStore } from "@/stores/content/hoverMessage";
import { useUpdateFormStore } from "@/stores/content/updateForm";

class CommentStore {
  constructor(
    public readonly highlight = new Highlight(),
    private ranges = new Map<string, Range>(),
    private contents = new Map<string, string>(),
  ) {}
  public async set(id: string, range: Range, content: string) {
    if (!this.highlight.has(range)) {
      this.highlight.add(range);
    }
    this.ranges.set(id, range);
    this.contents.set(id, content);
    await upsertComment({
      id,
      url: window.location.href,
      content,
      range: fromRange(range),
    });
  }
  public async remove(id: string) {
    const range = this.ranges.get(id);
    if (range) {
      this.highlight.delete(range);
      this.ranges.delete(id);
    }
    this.contents.delete(id);
    await removeComment(id);
  }
  public has(id: string) {
    return this.contents.has(id);
  }
  public async update(id: string, content: string) {
    this.contents.set(id, content);
    await updateComment(id, content);
  }
  public get(id: string) {
    const range = this.ranges.get(id);
    if (!range) {
      return null;
    }
    const content = this.contents.get(id)!;
    return { range, content };
  }
}

const commentLineCssClassName = "study-mark-comment-line";
export const commentStore = new CommentStore();
export function injectCommentLineStyle() {
  const style = document.createElement("style");
  style.innerHTML = /*css*/ `
    ::highlight(${commentLineCssClassName}) {
      background-color: orange;
    }
  `;
  document.head.appendChild(style);
  CSS.highlights.set(commentLineCssClassName, commentStore.highlight);
}

export async function loadComments() {
  if (!document.body) {
    return;
  }
  injectCommentLineStyle();
  const comments = await getCommentsByUrl(window.location.href);
  for (const comment of comments) {
    const { start, startOffset, end, endOffset } = comment.range;
    const range = toRange(start, startOffset, end, endOffset, document);
    registerSingleUseMutationHandler(() => {
      if (!document.getElementById(comment.id)) {
        insertCommentBlock(comment.id, range, comment.content);
      }
    });
  }
}

export async function insertCommentBlock(
  id: string,
  range: Range,
  content: string,
) {
  await commentStore.set(id, range, content);

  function handleClick(event: MouseEvent) {
    const position = document.caretPositionFromPoint(
      event.clientX,
      event.clientY,
    );
    if (
      !position ||
      !range.isPointInRange(position.offsetNode, position.offset)
    ) {
      return;
    }
    useUpdateFormStore.getState().open(id);
  }
  document.addEventListener("click", handleClick);

  function handleHover(event: MouseEvent) {
    useHoverMessageStore.getState().update("");
    const position = document.caretPositionFromPoint(
      event.clientX,
      event.clientY,
    );
    if (
      !position ||
      !range.isPointInRange(position.offsetNode, position.offset)
    ) {
      return;
    }
    if (!commentStore.has(id)) {
      document.removeEventListener("mousemove", handleHover);
      document.removeEventListener("click", handleClick);
    } else {
      const { content } = commentStore.get(id)!;
      useHoverMessageStore.getState().update(content);
    }
  }
  document.addEventListener("mousemove", handleHover);

  return id;
}

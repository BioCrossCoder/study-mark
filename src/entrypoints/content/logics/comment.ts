import { fromRange, toRange } from "xpath-range";
import tippy from "tippy.js";
import {
  addComment,
  getCommentsByUrl,
  removeComment,
  updateComment,
} from "@/services/storage/comment";
import { registerSingleUseMutationHandler } from "@/common/utils";

export async function loadComments() {
  if (!document.body) {
    return;
  }
  const comments = await getCommentsByUrl(window.location.href);
  for (const comment of comments) {
    const { start, startOffset, end, endOffset } = comment.range;
    const range = toRange(start, startOffset, end, endOffset, document);
    registerSingleUseMutationHandler(() => {
      if (!document.getElementById(comment.id)) {
        tryInsertCommentBlock(comment.id, range, comment.content);
      }
    });
  }
}

export async function saveComment() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  const selectionRange = selection.getRangeAt(0);
  // [AvoidCommentBlockCrossElement]
  const range = fromRange(selectionRange);
  if (range.start !== range.end) {
    window.alert("Comment blocks cannot cross paragraph");
    return;
  } // [/]
  const content = window.prompt("Enter comment content");
  if (!content) {
    return;
  }
  // [InsertCommentBlock]
  const result = tryInsertCommentBlock(
    `study-mark-${crypto.randomUUID()}-${Date.now()}`,
    selectionRange,
    content,
  ); // [/]
  if (Error.isError(result)) {
    window.alert(result.message);
    return;
  }
  // [SaveCommentBlockData]
  await addComment({
    id: result.id,
    url: window.location.href,
    content,
    range,
  }); // [/]
}

function tryInsertCommentBlock(id: string, range: Range, content: string) {
  const comment = document.createElement("mark");
  comment.id = id;
  const rect = range.getBoundingClientRect();
  const parent = range.commonAncestorContainer.parentElement!;
  const parentRect =
    range.commonAncestorContainer.parentElement?.getBoundingClientRect()!;
  parent.style.position = "relative";
  comment.style.position = "absolute";
  comment.style.opacity = "0.5";
  comment.style.height = rect.height + "px";
  comment.style.width = rect.width + "px";
  comment.style.left = rect.left - parentRect.left + "px";
  comment.style.top = rect.top - parentRect.top + "px";
  parent.appendChild(comment);
  const inst = tippy(`#${id}`, { content }).at(0)!;
  comment.onclick = async () => {
    const content = window.prompt(
      "Update this comment or leave empty to remove it?",
    );
    if (content === null) {
      return;
    }
    if (content.trim() === "") {
      inst.destroy();
      comment.remove();
      await removeComment(comment.id);
    } else {
      inst.setContent(content);
      updateComment(comment.id, content);
    }
  };
  return comment;
}

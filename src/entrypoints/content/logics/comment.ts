import { fromRange, toRange } from "xpath-range";
import tippy from "tippy.js";
import {
  insertComment,
  getCommentsByUrl,
  removeComment,
  updateComment,
} from "@/services/storage/comment";
import { registerSingleUseMutationHandler } from "@/common/utils";

const commentLineCssClassName = "study-mark-comment-line";

export function injectCommentLineStyle() {
  const style = document.createElement("style");
  style.innerHTML = /*css*/ `
    .${commentLineCssClassName} {
      height: 3px;
      background-color: orange;
      position: absolute;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);
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
        tryInsertCommentBlock(comment.id, range, comment.content);
      }
    });
  }
}

export async function addComment() {
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
  await insertComment({
    id: result.id,
    url: window.location.href,
    content,
    range,
  }); // [/]
}

function tryInsertCommentBlock(id: string, range: Range, content: string) {
  const comment = document.createElement("div");
  comment.id = id;
  comment.className = commentLineCssClassName;
  const rect = range.getBoundingClientRect();
  comment.style.width = rect.width + "px";
  try {
    const parent = range.commonAncestorContainer.parentElement!;
    const parentRect = parent.getBoundingClientRect()!;
    parent.style.position = "relative";
    comment.style.left = rect.left - parentRect.left + "px";
    comment.style.top = rect.top - parentRect.top + rect.height + "px";
    parent.appendChild(comment);
  } catch (e) {
    return e as Error;
  }
  const inst = tippy(`#${id}`, { content, placement: "bottom" }).at(0)!;
  comment.onclick = async () => {
    const content = window.prompt(
      "Update this comment or leave empty to remove it?",
      inst.popper.textContent,
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

import { toRange } from "xpath-range";
import tippy from "tippy.js";
import {
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

export function tryInsertCommentBlock(
  id: string,
  range: Range,
  content: string,
) {
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

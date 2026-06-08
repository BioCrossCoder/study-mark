import { fromRange, toRange } from "xpath-range";
import tippy from "tippy.js";
import {
  addComment,
  emptyCommentPlaceholder,
  getCommentsByUrl,
  removeComment,
  updateComment,
} from "@/services/storage/comment";

const commentBlockCssClassName = "study-mark-comment-block";

function injectCommentBlockStyle() {
  const style = document.createElement("style");
  style.innerHTML = /*css*/ `
    .${commentBlockCssClassName} {
      border: solid 1px orange;
    }
  `;
  document.head.appendChild(style);
}

export async function loadComments() {
  injectCommentBlockStyle();
  if (!document.body) {
    return;
  }
  const comments = await getCommentsByUrl(window.location.href);
  for (const comment of comments) {
    const { start, startOffset, end, endOffset } = comment.range;
    const range = toRange(start, startOffset, end, endOffset, document);
    if (comment.content === emptyCommentPlaceholder) {
      insertPlaceholder(range);
    } else {
      insertCommentBlock(comment.id, range, comment.content);
    }
  }
}

function insertPlaceholder(range: Range) {
  const comment = document.createElement("span");
  range.surroundContents(comment);
}

export async function saveComment() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  const selectionRange = selection.getRangeAt(0);
  // [AvoidCommentBlockOverlap]
  if (
    [...document.getElementsByClassName(commentBlockCssClassName)].some(
      (item) => selectionRange.intersectsNode(item),
    )
  ) {
    window.alert("Comment blocks cannot overlap!");
    return;
  } // [/]
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
  const commentBlock = insertCommentBlock(
    `study-mark-${crypto.randomUUID()}-${Date.now()}`,
    selectionRange,
    content,
  ); // [/]
  // [SaveCommentBlockData]
  await addComment({
    id: commentBlock.id,
    url: window.location.href,
    content,
    range,
  }); // [/]
}

function insertCommentBlock(id: string, range: Range, content: string) {
  const comment = document.createElement("span");
  comment.id = id;
  comment.className = commentBlockCssClassName;
  range.surroundContents(comment);
  const inst = tippy(`#${id}`, { content }).at(0)!;
  comment.onclick = () => {
    const content = window.prompt(
      "Update this comment or leave empty to remove it?",
    );
    if (content === null) {
      return;
    }
    if (content.trim() === "") {
      inst.destroy();
      comment.className = "";
      comment.onclick = () => {};
      removeComment(comment.id);
    } else {
      inst.setContent(content);
      updateComment(comment.id, content);
    }
  };
  return comment;
}

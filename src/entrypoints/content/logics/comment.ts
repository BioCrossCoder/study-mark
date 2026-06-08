import { fromRange } from "xpath-range";
import tippy, { Instance } from "tippy.js";
import {
  addComment,
  removeComment,
  updateComment,
} from "@/services/storage/comment";

const commentBlockCssClassName = "study-mark-comment-block";

function injectCommentBlockStyle() {
  const style = document.createElement("style");
  style.innerHTML = /*css*/ `
    .${commentBlockCssClassName} {
      border: solid 1px yellow;
    }
  `;
  document.head.appendChild(style);
}

export function loadComments() {
  injectCommentBlockStyle();
  // TODO
  console.log("load comments");
}

export async function saveComment() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  const range = selection.getRangeAt(0);
  // [AvoidCommentBlockOverlap]
  if (
    [...document.getElementsByClassName(commentBlockCssClassName)].some(
      (item) => range.intersectsNode(item),
    )
  ) {
    window.alert("Comment blocks cannot overlap!");
    return;
  } // [/]
  const content = window.prompt("Enter comment content");
  if (!content) {
    return;
  }
  // [InsertCommentBlock]
  const commentBlock = insertCommentBlock(
    `study-mark-${crypto.randomUUID()}-${Date.now()}`,
    range,
    content,
  ); // [/]
  // [SaveCommentBlockData]
  await addComment({
    id: commentBlock.id,
    url: window.location.href,
    content,
    range: fromRange(range),
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

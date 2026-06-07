import {
  getTaskByName,
  getTasksByPositionUrl,
  updateTaskProgress,
} from "@/services/storage/task";
import { fromRange } from "xpath-range";

async function queryBookmark(url: string) {
  const tasks = await getTasksByPositionUrl(url);
  return tasks.at(0)?.position.bookmark;
}

export async function loadBookmark() {
  if (!document.body) {
    return;
  }
  const bookmark = await queryBookmark(window.location.href);
  if (!bookmark) {
    return;
  }
  const { id, xpath, offset } = bookmark;
  const observer = new MutationObserver(() => {
    if (!document.getElementById(id)) {
      const anchor = tryInsertBookmark(xpath, offset, id);
      if (anchor) {
        anchor.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
    observer.disconnect();
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function tryInsertBookmark(xpath: string, offset: number, id: string) {
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
  ).singleNodeValue;
  if (!result) {
    return;
  }
  const range = document.createRange();
  range.setStart(result, offset);
  const anchor = createBookmark(id);
  range.insertNode(anchor);
  return anchor;
}

export async function saveBookmark() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  let tasks = await getTasksByPositionUrl(window.location.href);
  if (tasks.length === 0) {
    // [AskUserToInputTaskTitle]
    const name = window.prompt("Enter a Task title")?.trim();
    if (!name) {
      window.alert("Task Not Specified!");
      return;
    } // [/]
    // [QueryTask]
    const task = await getTaskByName(name ?? "");
    if (!task) {
      window.alert("Task Not Found!");
      return;
    } // [/]
    tasks = [task];
  }
  // [InsertNewBookmark]
  const bookmark = createBookmark(`study-mark-${crypto.randomUUID()}`);
  const range = selection.getRangeAt(0);
  range.insertNode(bookmark); // [/]
  // [SaveBookmarkPosition]
  const { start, startOffset } = fromRange(range);
  const taskIds = tasks.map((task) => task.id);
  await updateTaskProgress(taskIds, window.location.href, {
    id: bookmark.id,
    xpath: start,
    offset: startOffset,
  }); // [/]
  removeBookmark(tasks.at(0)?.position.bookmark?.id);
  window.confirm("Task Progress Updated");
}

export function createBookmark(id: string) {
  const bookmark = document.createElement("span");
  bookmark.textContent = "🔖";
  bookmark.id = id;
  return bookmark;
}

export function removeBookmark(id?: string) {
  if (id) {
    document.getElementById(id)?.remove();
  }
}

export async function gotoBookmark() {
  if (!document.body) {
    return;
  }
  const bookmark = await queryBookmark(window.location.href);
  if (!bookmark) {
    return;
  }
  const anchor = document.getElementById(bookmark.id);
  if (anchor) {
    anchor.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
}

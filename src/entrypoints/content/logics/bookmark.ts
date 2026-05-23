import {
  getTaskByTitle,
  getTasksByPosition,
  updateTaskProgress,
} from "@/stores/tasks";
import { fromRange } from "xpath-range";

export async function loadBookmark() {
  if (!document.body) {
    return;
  }
  const tasks = await getTasksByPosition(window.location.href);
  const bookmark = tasks.at(0)?.bookmark;
  if (!bookmark) {
    return;
  }
  const { id, xpath, offset } = bookmark;
  const observer = new MutationObserver(() => {
    tryInsertBookmark(xpath, offset, id);
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
  anchor.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
}

export async function saveBookmark() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  let tasks = await getTasksByPosition(window.location.href);
  if (tasks.length === 0) {
    // [AskUserToInputTaskTitle]
    const title = window.prompt("Enter a Task title")?.trim();
    if (!title) {
      window.alert("Task Not Specified!");
      return;
    } // [/]
    // [QueryTask]
    const task = await getTaskByTitle(title ?? "");
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
  removeBookmark(tasks.at(0)?.bookmark?.id);
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

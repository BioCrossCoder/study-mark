import { registerSingleUseMutationHandler } from "@/common/utils";
import { getTasksByPositionUrl } from "@/services/storage/task";

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
  registerSingleUseMutationHandler(() => {
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

export function createBookmark(id: string) {
  const bookmark = document.createElement("span");
  bookmark.textContent = "🔖";
  bookmark.id = id;
  return bookmark;
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

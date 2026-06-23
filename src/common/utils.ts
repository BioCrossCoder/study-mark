import { ContextMenuItemID } from "./enums";

export function sortBy<K extends string, T extends Record<K, number>>(
  field: K,
  reverse = false,
) {
  return (obj1: T, obj2: T) =>
    reverse ? obj2[field] - obj1[field] : obj1[field] - obj2[field];
}

export function isItemExist<K extends string, T extends Record<K, string>>(
  item: T,
  field: K,
  data: T[],
) {
  return data.some((record) => record[field] === item[field]);
}

export function mergeObj(obj1: object, obj2: object) {
  return { ...obj1, ...obj2 };
}

export function registerContextMenuItem(
  id: ContextMenuItemID,
  title: string,
  contexts: [
    Browser.contextMenus.ContextType,
    ...Browser.contextMenus.ContextType[],
  ],
  callback: (
    info: globalThis.Browser.contextMenus.OnClickData,
    tab?: globalThis.Browser.tabs.Tab,
  ) => void,
) {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id,
      title,
      contexts,
    });
  });
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === id) {
      callback(info, tab);
    }
  });
}

export function tryFormatAsJson(content: string) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {}
  return content;
}

export async function getCurrentTab() {
  return (
    await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
  ).at(0);
}

export function positionMatch(p1: string, p2: string) {
  const SUFFIX_RE = /(\.html|\.htm|\.php|\.jsp|\.asp|)/;
  return (
    new RegExp(`^${p1}${SUFFIX_RE.source}$`).test(p2) ||
    new RegExp(`^${p2}${SUFFIX_RE.source}$`).test(p1)
  );
}

export function registerSingleUseMutationHandler(callback: () => void) {
  const observer = new MutationObserver(() => {
    callback();
    observer.disconnect();
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

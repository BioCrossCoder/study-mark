import { ContextMenuItemID } from "./enums";

export function sortBy<K extends string, T extends Record<K, number>>(
  field: K,
) {
  return (obj1: T, obj2: T) => obj1[field] - obj2[field];
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
  const itemId = browser.contextMenus.create({
    id,
    title,
    contexts,
  });
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === itemId) {
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

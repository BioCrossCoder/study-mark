export function useFavoritesDataSync(
  callback: () => void,
  onRemoved: (id: string) => void,
) {
  const events = [
    browser.bookmarks.onChanged,
    browser.bookmarks.onChildrenReordered,
    browser.bookmarks.onCreated,
    browser.bookmarks.onImportEnded,
    browser.bookmarks.onMoved,
    browser.bookmarks.onRemoved,
  ];
  onMounted(() => {
    events.forEach((event) => {
      event.addListener(callback);
    });
    browser.bookmarks.onRemoved.addListener(onRemoved);
  });
  onUnmounted(() => {
    events.forEach((event) => {
      event.removeListener(callback);
    });
    browser.bookmarks.onRemoved.removeListener(onRemoved);
  });
}
